// マッスル PWA Service Worker
// 戦略: ネットワーク優先 + キャッシュフォールバック
// オンライン時は常に最新を取得してキャッシュを更新し、
// オフライン時はキャッシュから返す（一度開けばオフラインで動く）

const CACHE = "muscle-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || caches.match("./index.html")
        )
      )
  );
});
