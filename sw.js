// Guarda o app no celular para funcionar sem internet.
// A página principal busca primeiro a versão nova na internet; sem sinal, usa a cópia guardada.
const CACHE = "giba-v12";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-192-g2.png", "icons/icon-512-g2.png", "icons/icon-180-g2.png", "icons/icon-maskable-512-g2.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function save(req, res) {
  if (res && (res.ok || res.type === "opaque")) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate" || /manifest|icons\//.test(e.request.url)) {
    e.respondWith(fetch(e.request).then(res => save(e.request, res)).catch(() => caches.match(e.request).then(hit => hit || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => save(e.request, res))));
});
