# Deployment

CI/CD runs on GitHub Actions. Images are built to GitHub Container Registry
(GHCR) and deployed to a VPS over SSH via Docker Compose.

## Pipeline

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | every push + every PR | `npm ci` → lint → typecheck → test → build |
| `deploy.yml` | push to `main`, or manual | runs CI, builds the image, pushes to GHCR, restarts the container on the VPS |

`deploy.yml` calls `ci.yml` as a gate, so a failing test or type error never
reaches production. The deploy step waits for the container's `HEALTHCHECK` to
report healthy and fails the job (dumping logs) if it doesn't within 150s.

## Required GitHub secrets

Set under **Settings → Secrets and variables → Actions**.

| Secret | Example | Notes |
| --- | --- | --- |
| `SSH_HOST` | `203.0.113.10` | VPS IP or hostname |
| `SSH_USER` | `deploy` | Non-root user in the `docker` group |
| `SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----…` | Private half of a key added to the server's `authorized_keys` |
| `SSH_PORT` | `22` | Optional, defaults to 22 |
| `DEPLOY_PATH` | `/srv/mannequincare` | Directory holding `docker-compose.yml` and `.env` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_…` | Inlined at build time, so it must be a build secret |
| `NEXT_PUBLIC_APP_URL` | `https://mannequincare.in` | Same — baked into the bundle |

`GITHUB_TOKEN` is provided automatically; no setup needed.

> Only `NEXT_PUBLIC_*` values belong in GitHub. Every server-side secret
> (`MONGODB_URI`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `AUTH_SECRET`,
> Cloudinary, Gmail) lives in `.env` **on the server** and is never sent to CI.

## One-time server setup

```bash
# 1. Install Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # log out and back in

# 2. Create the deploy directory
sudo mkdir -p /srv/mannequincare && sudo chown "$USER" /srv/mannequincare
cd /srv/mannequincare

# 3. Copy docker-compose.yml from the repo, then create .env from .env.example
#    with real production values (chmod 600 .env)

# 4. Authenticate to GHCR once (or rely on the login step in the workflow)
echo "$GHCR_PAT" | docker login ghcr.io -u <github-username> --password-stdin

# 5. First boot
docker compose up -d
```

Then put Nginx in front, proxying `:443` → `127.0.0.1:3000`, with a certificate
from `certbot --nginx`. The container is deliberately bound to localhost so it
is not reachable except through Nginx.

## Rollback

Every build is tagged with its commit SHA:

```bash
cd /srv/mannequincare
docker compose down web
docker run -d --env-file .env -p 127.0.0.1:3000:3000 \
  ghcr.io/varun240909/mannequincare.in:<previous-sha>
```

Or pin the SHA tag in `docker-compose.yml` and `docker compose up -d web`.

## Post-deploy checklist

- Razorpay webhook points at `https://mannequincare.in/api/razorpay/webhook`
  and `RAZORPAY_WEBHOOK_SECRET` matches the dashboard.
- MongoDB Atlas network access allows the VPS IP.
- `AUTH_URL` / `NEXTAUTH_URL` matches the production domain.
