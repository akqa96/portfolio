const V = "v3";
const CORE = [
  "/",
  "/index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(V).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match("/index.html"));
    })
  );
});
