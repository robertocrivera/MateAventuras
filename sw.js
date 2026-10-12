const CACHE_NAME = 'mateaventuras-caguan-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login-docente.html',
  './estudiante-menu.html',
  './estudiante-tutorial.html',
  './juego.html',
  './docente-dashboard.html',
  './css/main.css',
  './js/juego.js',
  './js/docente.js',
  './js/sqlite-engine.js',
  './img/logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cacheando recursos locales para funcionamiento 100% offline...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('Cache parcial:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).catch(() => {
        // En caso de estar sin internet y no encontrar en cache, devolver fallback si es navegación
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

