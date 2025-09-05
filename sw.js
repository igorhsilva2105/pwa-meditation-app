self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('zenflow-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/manifest.json',
                '/gong.mp3',
                '/rain.mp3',
                '/ocean.mp3',
                '/forest.mp3',
                '/guided1.mp3',
                '/guided2.mp3',
                '/guided3.mp3',
                '/icon-192.png',
                '/icon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
