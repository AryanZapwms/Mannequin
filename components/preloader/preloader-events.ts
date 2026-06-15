/**
 * Event contract between the Preloader and the rest of the app.
 *
 * The preloader is fully decoupled: it announces when it has finished
 * (or was skipped for returning visitors) via document-level events.
 * Components never import the Preloader itself — they only subscribe
 * here via `onPreloaderDone`.
 */

export const PRELOADER_COMPLETE_EVENT = "preloaderComplete";
export const PRELOADER_SKIPPED_EVENT = "preloaderSkipped";
export const PRELOADER_SESSION_KEY = "mc-preloader-has-run";

declare global {
  interface Window {
    __mcPreloaderDone?: boolean;
  }
}

export function markPreloaderDone(skipped: boolean) {
  if (typeof window === "undefined" || window.__mcPreloaderDone) return;
  window.__mcPreloaderDone = true;
  document.dispatchEvent(
    new Event(skipped ? PRELOADER_SKIPPED_EVENT : PRELOADER_COMPLETE_EVENT),
  );
}

export function isPreloaderDone() {
  return typeof window !== "undefined" && window.__mcPreloaderDone === true;
}

/**
 * Runs `cb` once the preloader completes or is skipped — immediately if
 * that already happened (subscribers can mount after the event fired).
 * Returns an unsubscribe function.
 */
export function onPreloaderDone(cb: () => void): () => void {
  if (isPreloaderDone()) {
    cb();
    return () => {};
  }

  const handler = () => {
    cleanup();
    cb();
  };
  const cleanup = () => {
    document.removeEventListener(PRELOADER_COMPLETE_EVENT, handler);
    document.removeEventListener(PRELOADER_SKIPPED_EVENT, handler);
  };

  document.addEventListener(PRELOADER_COMPLETE_EVENT, handler);
  document.addEventListener(PRELOADER_SKIPPED_EVENT, handler);
  return cleanup;
}
