(function registerPWA() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered:", registration.scope);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[PWA] New version installed. Refresh to update.");
            }
          });
        });
      })
      .catch((error) => {
        console.warn("[PWA] Service Worker registration failed:", error);
      });
  });
})();
