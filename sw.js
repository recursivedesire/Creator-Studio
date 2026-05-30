const CACHE = 'cs-v6fd54b9d';
const PRECACHE = ["./","./index.html","vendor.9f0201be.js","fflate.f8a0e86f.js","app.7aea6cff.js","styles.33d6473c.css","./manifest.webmanifest","./icon-192.png","./icon-512.png","./maskable-512.png","./apple-touch-icon.png"];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(req); }
      catch { return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error(); }
    })());
    return;
  }

  if (FONT_HOSTS.includes(url.host)) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(req);
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await net) || Response.error();
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok && res.type === 'basic') (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch { return cached || Response.error(); }
    })());
  }
});
