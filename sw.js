// キャッシュの名前とバージョンを定義します
const CACHE_NAME = 'paramedic-app-cache-v1';

// オフラインで利用できるようにキャッシュするファイルのリストです
// HTML、アイコン、外部ライブラリなど、アプリの動作に必要なファイルをすべて含めます
const urlsToCache = [
  './', // ルートパス
  'index.html', // アプリのメインHTMLファイル名（実際のファイル名に合わせてください）
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'
];

// PWAのインストール時に呼ばれるイベント
self.addEventListener('install', (event) => {
  // event.waitUntil() は、インストール処理が完了するまで待ちます
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // 指定されたファイルをすべてキャッシュに追加します
        return cache.addAll(urlsToCache);
      })
  );
});

// PWAが有効化されたときに呼ばれるイベント
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いバージョンのキャッシュがあれば削除します
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワークリクエストが発生したときに呼ばれるイベント
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // まずはキャッシュ内にリクエストされたファイルがあるか探します
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあれば、それを返します
        if (response) {
          return response;
        }
        // キャッシュになければ、通常のネットワークリクエストを実行して取得します
        return fetch(event.request);
      })
  );
});
