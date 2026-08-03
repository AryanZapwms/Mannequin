#!/usr/bin/env bash
#
# Zero-downtime blue/green deploy.
#
#   cd /srv/mannequincare && IMAGE_REPO=ghcr.io/owner/repo ./scripts/deploy.sh <tag>
#
# The idle colour is started on its own port and health-checked while the live
# colour keeps serving. Only once the new container reports healthy does Nginx
# get pointed at it and reloaded — `nginx -s reload` is graceful, so in-flight
# requests finish on the old workers and nothing is dropped.
#
# If the new container never goes healthy, traffic is never switched: the deploy
# fails with the previous version still serving, untouched.
#
# Used by both .github/workflows/deploy.yml and rollback.yml so the two can
# never drift apart.

set -euo pipefail

TAG="${1:?usage: deploy.sh <image-tag>}"
IMAGE_REPO="${IMAGE_REPO:?IMAGE_REPO must be set}"

# Run from the deploy directory (where docker-compose.yml and .env live)
DEPLOY_DIR="$(pwd)"
UPSTREAM_FILE="${UPSTREAM_FILE:-$DEPLOY_DIR/nginx/upstream.conf}"
UPSTREAM_NAME="${UPSTREAM_NAME:-mannequincare_app}"

HEALTH_RETRIES="${HEALTH_RETRIES:-30}"
HEALTH_INTERVAL="${HEALTH_INTERVAL:-5}"
DRAIN_SECONDS="${DRAIN_SECONDS:-10}"

BLUE_PORT=3001
GREEN_PORT=3002

# Default to "green" when unknown so the very first deploy lands on blue
ACTIVE="$(cat .active-color 2>/dev/null || echo green)"
if [ "$ACTIVE" = "blue" ]; then
  TARGET=green
  TARGET_PORT=$GREEN_PORT
else
  TARGET=blue
  TARGET_PORT=$BLUE_PORT
fi

echo "==> Live: ${ACTIVE} | deploying ${TAG} to ${TARGET} (127.0.0.1:${TARGET_PORT})"

export APP_TAG="$TAG"
docker pull "${IMAGE_REPO}:${TAG}"

# ── Start the idle colour. The live one is untouched. ────────────────
docker compose --profile "$TARGET" up -d --force-recreate "$TARGET"
CID="$(docker compose --profile "$TARGET" ps -q "$TARGET")"

echo "==> Waiting for ${TARGET} to report healthy"
HEALTHY=false
for _ in $(seq 1 "$HEALTH_RETRIES"); do
  STATUS="$(docker inspect --format '{{.State.Health.Status}}' "$CID" 2>/dev/null || echo starting)"
  if [ "$STATUS" = "healthy" ]; then
    HEALTHY=true
    break
  fi
  if [ "$STATUS" = "unhealthy" ]; then
    break
  fi
  sleep "$HEALTH_INTERVAL"
done

if [ "$HEALTHY" != true ]; then
  echo "::error::${TAG} never became healthy on ${TARGET} — traffic was NOT switched" >&2
  docker logs --tail 100 "$CID" >&2 || true
  docker compose --profile "$TARGET" stop "$TARGET" || true
  echo "==> ${ACTIVE} is still serving the previous version" >&2
  exit 1
fi

# ── Switch Nginx. Keep a copy so a bad config can be put back. ───────
echo "==> Healthy. Pointing Nginx at ${TARGET}"
mkdir -p "$(dirname "$UPSTREAM_FILE")"
PREVIOUS_UPSTREAM=""
[ -f "$UPSTREAM_FILE" ] && PREVIOUS_UPSTREAM="$(cat "$UPSTREAM_FILE")"

printf 'upstream %s {\n    server 127.0.0.1:%s;\n}\n' "$UPSTREAM_NAME" "$TARGET_PORT" > "$UPSTREAM_FILE"

if ! sudo nginx -t; then
  echo "::error::nginx rejected the generated upstream — reverting" >&2
  if [ -n "$PREVIOUS_UPSTREAM" ]; then
    printf '%s\n' "$PREVIOUS_UPSTREAM" > "$UPSTREAM_FILE"
  else
    rm -f "$UPSTREAM_FILE"
  fi
  docker compose --profile "$TARGET" stop "$TARGET" || true
  exit 1
fi

# Graceful: old workers drain their connections, new workers take the new config
sudo systemctl reload nginx

echo "$TARGET" > .active-color
echo "$TAG" > .deployed-tag

# ── Retire the old colour once its in-flight requests are done ───────
if [ "$ACTIVE" != "$TARGET" ]; then
  echo "==> Draining ${ACTIVE} for ${DRAIN_SECONDS}s"
  sleep "$DRAIN_SECONDS"
  docker compose --profile "$ACTIVE" stop "$ACTIVE" || true
fi

docker image prune -f >/dev/null 2>&1 || true

echo "==> Done. ${TARGET} is live on ${TAG}"
