const CACHE_NAME = "lior-patisserie-v24";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./hero-fix.css",
  "./main.js",
  "./site.webmanifest",
  "./admin.webmanifest",
  "./assets/logo.png",
  "./assets/icons/favicon.ico",
  "./assets/icons/favicon-16x16.png",
  "./assets/icons/favicon-32x32.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/android-chrome-192x192.png",
  "./assets/icons/android-chrome-512x512.png",
  "./assets/icons/instagram.svg",
  "./assets/icons/admin/admin-favicon.ico",
  "./assets/icons/admin/admin-favicon-16x16.png",
  "./assets/icons/admin/admin-favicon-32x32.png",
  "./assets/icons/admin/admin-apple-touch-icon.png",
  "./assets/icons/admin/admin-192x192.png",
  "./assets/icons/admin/admin-512x512.png"
];

const ADMIN_PATHS = [
  "lior-admin.html",
  "admin.css",
  "admin.js",
  "admin.webmanifest"
];

const isAdminRequest = (url) => {
  return ADMIN_PATHS.some((path) => url.pathname.includes(path));
};

const isCoreAsset = (url) => {
  return CORE_ASSETS.some((asset) => {
    const assetUrl = new URL(asset, self.location.href);
    return assetUrl.pathname === url.pathname;
  });
};

const cacheCoreAssets = async () => {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    CORE_ASSETS.map(async (asset) => {
      try {
        const request = new Request(asset, { cache: "reload" });
        const response = await fetch(request);

        if (response && response.ok) {
          await cache.put(asset, response.clone());
        }
      } catch (error) {
        console.warn("[Service Worker] Failed to cache asset:", asset, error);
      }
    })
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheCoreAssets().then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // חשוב: האדמין תמיד נטען מהרשת, בלי cache.
  if (isAdminRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // ניווט רגיל באתר הציבורי: קודם רשת, fallback ל-index.html רק בניווט אמיתי.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  // קבצי ליבה ציבוריים בלבד: קודם רשת, fallback ל-cache.
  if (isCoreAsset(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }

          return response;
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  // כל דבר אחר לא מנוהל על ידי ה-Service Worker.
});
