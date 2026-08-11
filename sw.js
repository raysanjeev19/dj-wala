/* ─────────────────────────────────────────────────────────────
   DJ Wala — service worker

   Caches the shell only: the HTML, the CSS, the script and the track
   list. Never the audio — that is YouTube's, it streams, and it would
   fill a phone in an evening.

   Bump CACHE on every deploy. A stale shell serving a new tracks.json
   is the one bug this file can cause, and a new cache name is the fix.
   ───────────────────────────────────────────────────────────── */

const CACHE = 'djwala-v1';

const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/assets/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      // addAll is all-or-nothing: one 404 throws away the whole install.
      // Individual puts let the shell cache partially rather than not at all.
      .then((c) => Promise.allSettled(SHELL.map((url) => c.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Anything off-origin — YouTube, Google Fonts, cover art on Apple's CDN —
  // goes straight to the network. Caching a third party's URLs here means
  // owning their invalidation, and we do not want that job.
  if (url.origin !== location.origin) return;

  // tracks.json is the one file that changes without a deploy, so it is
  // network-first: fresh when online, last-known-good when not.
  if (url.pathname === '/tracks.json') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // The shell: cache-first, and quietly refill the cache in the background.
  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
