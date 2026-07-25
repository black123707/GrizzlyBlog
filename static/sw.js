const CACHE_NAME = 'ivy-blog-v1';
const urlsToCache = ['/', '/posts/', '/about/', '/index.xml'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', function(e) {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
