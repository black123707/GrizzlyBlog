const CACHE_NAME = 'ivy-blog-v1';

self.addEventListener('install', function(e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  const isHTML = e.request.mode === 'navigate' ||
                 e.request.destination === 'document';

  if (isHTML) {
    // HTML 文件：Network First，先读网络，失败再回退缓存
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // CSS/JS/图片：Cache First，离线也能用
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        });
      })
    );
  }
});
