const CACHE_NAME = 'farypin-store-auto'; 
const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './manifest.json'
];

// Tahap 1: Install & Simpan file ke memori HP pertama kali
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Tahap 2: Hapus cache lama (jika ada) dan aktifkan
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Tahap 3: OTOMATIS AMBIL VERSI TERBARU
self.addEventListener('fetch', event => {
  // Pengecualian untuk database Google Script
  if (event.request.url.includes('script.google.com')) {
      return; 
  }

  // Strategi "Network-First": Selalu minta versi paling baru ke server
  event.respondWith(
    fetch(event.request).then(response => {
      // Jika internet lancar dan dapat versi baru, diam-diam perbarui memori HP (Cache)
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
        return response; // Tampilkan web versi terbaru
      });
    }).catch(() => {
      // Jika HP sedang OFFLINE / Tidak ada internet, baru buka dari memori HP
      return caches.match(event.request);
    })
  );
});
