// Minimalen service worker - poskrbi le, da je aplikacija "nameščljiva" (PWA)
// in da lupina (statične datoteke) deluje tudi brez povezave.
// Vremenskih podatkov (/api/...) namenoma NE predpomni - vedno morajo priti sveži z ARSO.

const CACHE_NAME = "viharnik-shell-v2";
const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/install-promo.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API klici gredo vedno neposredno na omrežje - brez predpomnjenja.
  if (url.pathname.startsWith("/api/")) return;
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // "Stale-while-revalidate": takoj postreži iz predpomnilnika (če obstaja),
  // v ozadju pa osveži z omrežja za naslednjič.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
