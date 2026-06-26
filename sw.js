// Service worker do Hub da Família
// Habilita a instalação na tela inicial e prepara a base para notificações.
const CACHE = "hubfam-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).catch(function () {});
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (chaves) {
      return Promise.all(
        chaves.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Network-first só para GET: online sempre busca o mais novo;
// se cair a rede, tenta o cache do "esqueleto" do app.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then(function (m) {
        return m || caches.match("./");
      });
    })
  );
});
