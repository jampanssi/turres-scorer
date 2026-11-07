/*
 * Service worker: makes the app installable and keeps the app shell available without a connection.
 * Hand-written on purpose (no library): it only does these things.
 *
 * 1. Build files (/_next/static/*, icons): cache first. Their file names contain a content hash, so a
 *    cached copy is never stale.
 * 2. Page loads (navigations): network first, so a new deploy shows up at once; the last good copy of
 *    that page is used only when the network fails. Pages are client-rendered, so a cached page
 *    starts the app and the app reads its own local data.
 *    Pages reached by tapping inside the app are not browser navigations, so the app asks the worker to
 *    store each page it shows ("cache-page" message below).
 * 3. Everything else is left alone: other origins, non-GET requests, /api/*, and the Next.js data
 *    requests that carry an RSC header. Nothing the server decides is ever answered from the cache.
 *
 * This does NOT sync scores: saving while offline is a separate feature (see docs/PLAN.md).
 * Bump VERSION to drop every old cache.
 */
const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const KEEP = new Set([STATIC_CACHE, PAGE_CACHE]);

self.addEventListener("install", (event) => {
  // Take over without waiting for old tabs to close: this worker holds no state that could clash.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => !KEEP.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

const isBuildFile = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || request.headers.has("RSC")) return;

  if (isBuildFile(url)) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

// The app tells the worker which page it is showing, so that page also opens offline later.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "cache-page" || typeof data.path !== "string" || !data.path.startsWith("/")) return;
  const url = new URL(data.path, self.location.origin);
  if (url.pathname.startsWith("/api/")) return;
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch(url.href, { headers: { Accept: "text/html" } });
        const isHtml = (response.headers.get("content-type") || "").includes("text/html");
        if (response.ok && isHtml) await (await caches.open(PAGE_CACHE)).put(url.href, response);
      } catch {
        // offline or failed: keep whatever copy there already is
      }
    })(),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error; // nothing cached for this page: the browser shows its own offline page
  }
}
