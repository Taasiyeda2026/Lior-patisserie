const CACHE_NAME = "lior-patisserie-v27";
const IMAGE_CACHE_NAME = "lior-patisserie-images-v27";

/* ─── קבצי ליבה של האתר הציבורי ─────────────────────────────────────────── */
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./hero-fix.css",
  "./main.js",
  "./site-content.js",
  "./pwa-register.js",
  "./supabase-config.js",
  "./policy-pages.css",
  "./accessibility.html",
  "./privacy.html",
  "./terms.html",
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

/* ─── נתיבי ממשק הניהול — תמיד מהרשת ──────────────────────────────────── */
const ADMIN_PATHS = [
  "lior-admin.html",
  "admin.css",
  "admin.js",
  "admin.webmanifest"
];

/* ─── Supabase storage — תמונות בלבד, ללא וידאו ────────────────────────── */
const SUPABASE_ORIGIN = "osehkbkeydhpesjlisuk.supabase.co";
const SUPABASE_IMAGE_PATH = "/storage/v1/object/public/site-images/";

/* ─── עזר: בדיקות URL ──────────────────────────────────────────────────── */
const isAdminRequest = (url) =>
  ADMIN_PATHS.some((path) => url.pathname.includes(path));

const isCoreAsset = (url) =>
  CORE_ASSETS.some((asset) => {
    const assetUrl = new URL(asset, self.location.href);
    return assetUrl.pathname === url.pathname;
  });

const isSupabaseImage = (url) =>
  url.hostname === SUPABASE_ORIGIN &&
  url.pathname.startsWith(SUPABASE_IMAGE_PATH);

/* ─── Pre-cache קבצי ליבה בזמן install ─────────────────────────────────── */
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
      } catch (err) {
        console.warn("[SW] Failed to pre-cache:", asset, err);
      }
    })
  );
};

/* ─── Install: pre-cache + skipWaiting ──────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheCoreAssets().then(() => self.skipWaiting())
  );
});

/* ─── Activate: מחק cache ישן + claim ──────────────────────────────────── */
self.addEventListener("activate", (event) => {
  const CURRENT = new Set([CACHE_NAME, IMAGE_CACHE_NAME]);

  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT.has(key))
            .map((key) => {
              console.log("[SW] Deleting old cache:", key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ─── Fetch ─────────────────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* 1. ממשק ניהול — רשת בלבד, אף פעם לא cache */
  if (isAdminRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  /* 2. תמונות Supabase — stale-while-revalidate
        וידאו אינו נכלל (path שונה) ואינו מנוהל כאן */
  if (isSupabaseImage(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);

        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  /* 3. בקשות חיצוניות אחרות (CDN supabase-js וכו') — לא מנוהל */
  if (url.origin !== self.location.origin) return;

  /* 4. ניווט (navigate) — רשת ראשונה, fallback ל-index.html */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* 5. קבצי ליבה (CSS/JS/assets) — רשת ראשונה, fallback ל-cache
        הגרסאות (?v=N) מזוהות לפי pathname בלבד, כך שהעדכון תמיד עובר */
  if (isCoreAsset(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* 6. כל שאר הבקשות המקומיות — לא מנוהל */
});
