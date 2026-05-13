(function registerPWA() {
  const PWA_VERSION = "30";
  const SERVICE_WORKER_URL = `./sw.js?v=${PWA_VERSION}`;

  if (!("serviceWorker" in navigator)) return;

  /* כשה-SW החדש תופס שליטה — טוענים מחדש פעם אחת לקבלת קבצים עדכניים */
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: "./", updateViaCache: "none" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered:", registration.scope, "version:", PWA_VERSION);
        registration.update();

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] New version ready — reloading.");
              /* skipWaiting() ב-SW יגרום ל-controllerchange שיבצע reload */
            }
          });
        });
      })
      .catch((error) => {
        console.warn("[PWA] Service Worker registration failed:", error);
      });
  });
})();
