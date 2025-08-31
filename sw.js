// キャッシュするアセットのバージョン
const CACHE_NAME = 'paramedic-app-cache-v3'; // Cache version updated to force refresh
// キャッシュするファイルのリスト（相対パスに修正）
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
  "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js",
  "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js"
];

// Service Worker のインストールイベント
self.addEventListener('install', event => {
  // 新しいService Workerがインストールされたらすぐに有効化する
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        // 指定されたURLをすべてキャッシュに追加
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker の有効化イベント
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 古いキャッシュを削除する
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // すべてのクライアント（開いているタブ）を新しいService Workerで制御する
        return self.clients.claim();
      });
    })
  );
});

// Service Worker のフェッチイベント
self.addEventListener('fetch', event => {
    // Firebaseへのリクエストはキャッシュしない
    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにヒットした場合、キャッシュからレスポンスを返す
                if (response) {
                    return response;
                }

                // キャッシュにない場合、ネットワークからフェッチする
                return fetch(event.request).then(
                    networkResponse => {
                        // レスポンスが有効かチェック
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                          return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Fetching failed:', error);
                    // オフライン時のフォールバックページなどを返すことも可能
                });
            })
    );
});
