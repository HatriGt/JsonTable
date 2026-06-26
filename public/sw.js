/*
 * JSON-Table service worker — offline support via runtime caching.
 *
 * Asset filenames are content-hashed, so we cache at fetch time rather than
 * from a build-time precache manifest:
 *   - navigations:   network-first, fall back to cached page, then cached "/"
 *   - static assets: stale-while-revalidate (hashed assets are immutable)
 *   - Google Fonts:  stale-while-revalidate (opaque responses accepted)
 * Only GET is handled; POST server functions / share creation hit the network.
 */
const VERSION = "v1";
const STATIC_CACHE = `jt-static-${VERSION}`;
const PAGE_CACHE = `jt-pages-${VERSION}`;
const KEEP = new Set([STATIC_CACHE, PAGE_CACHE]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const FONT_ORIGINS = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
const ASSET_RE = /\.(?:js|mjs|css|woff2?|png|svg|ico|webmanifest|json)$/;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML navigations: network-first so users get fresh content online, with a
  // cached fallback (the visited page, then the cached home shell) when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(PAGE_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/")) ||
            new Response("You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Static assets + fonts: stale-while-revalidate.
  const isAsset = sameOrigin && (url.pathname.startsWith("/assets/") || ASSET_RE.test(url.pathname));
  const isFont = FONT_ORIGINS.has(url.origin);
  if (isAsset || isFont) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
    return;
  }

  // Everything else (server functions, dynamic data): default to the network.
});
