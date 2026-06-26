/**
 * Registers the offline service worker. Production-only: in dev the worker
 * would cache Vite's HMR assets and cause stale reloads, so we skip it.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("/sw.js").catch(() => {
    // Registration failures are non-fatal — the app works online regardless.
  });
}
