// sw.js
// Service Worker oficial do app "Identidade em Cristo"

// 🏷 Versão dos caches (troque para limpar caches antigos quando mudar algo grande)
const STATIC_CACHE = "identidade-cristo-static-v2";
const RUNTIME_CACHE = "identidade-cristo-runtime-v1";

// ❗Importante: ajuste essa lista com os principais arquivos estáticos do seu build
// (inclua aqui o que SEMPRE precisa estar disponível offline)
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  // Se tiver manifest, ícones, etc, pode incluir, por exemplo:
  // "/manifest.webmanifest",
  // "/icon-192.png",
  // "/icon-512.png",
];

// 🔹 Helper: verifica se a request é para o mesmo domínio
const isSameOrigin = (requestUrl) => {
  return requestUrl.origin === self.location.origin;
};

// INSTALL – faz o pré‑cache dos arquivos principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  // força o SW novo a assumir o controle mais rápido
  self.skipWaiting();
});

// ACTIVATE – remove caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// FETCH – estratégia combinada:
// - Navegações (HTML): network first, com fallback pro index.html (SPA offline)
// - Arquivos estáticos (CSS, JS, imagens): cache first
// - Outras coisas: tenta rede e salva em cache de runtime
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // só tratamos GET
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);

  // apenas requisições do mesmo domínio
  if (!isSameOrigin(requestUrl)) {
    return;
  }

  // 🧭 Navegação (SPA) – requests de página/HTML
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // salva a última versão do index no cache estático
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // Arquivos estáticos (heurística por extensão)
  const isAsset =
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image" ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4)$/i.test(requestUrl.pathname);

  if (isAsset) {
    // 📦 Cache first para assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => {
            // Se quiser uma imagem fallback, pode tratar aqui
            return new Response("Offline", { status: 503 });
          });
      })
    );
    return;
  }

  // 🌐 Demais requisições (ex: APIs, JSON, etc) – network first com fallback de runtime
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // fallback genérico simples
          return new Response("Offline", { status: 503 });
        })
      )
  );
});

// (Opcional) BACKGROUND SYNC, PUSH, etc.
// Se você depois quiser integrar com Firebase Cloud Messaging,
// ou reenvio de posts offline, pode adicionar aqui:
//
// self.addEventListener("sync", (event) => { ... });
// self.addEventListener("push", (event) => { ... });
