    document.documentElement.classList.add("js");

    const WHATSAPP_PHONE = "972506422900";

    function normalizeWhatsappPhone(value) {
      const digits = String(value || "").replace(/[^0-9]/g, "");
      if (!digits) return "";
      if (digits.startsWith("0") && digits.length === 10) return "972" + digits.slice(1);
      if (digits.startsWith("972") && digits.length === 12) return digits;
      if (digits.startsWith("00972")) return digits.replace(/^00/, "");
      return digits;
    }
    const INSTAGRAM_URL = "https://www.instagram.com/liornahum/";

    const signatureProductNames = ["אוראו דרים", "קוקילוטוס", "פיסטצ׳יו", "שוקולד דובאי"];

    const products = [
      {
        name: "אוראו דרים",
        image: "A7404929.webp",
        description: "עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל."
      },
      {
        name: "כריות נוגט",
        image: "A7404958.webp",
        description: "עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן."
      },
      {
        name: "קוקילוטוס",
        image: "A7404990.webp",
        description: "עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל."
      },
      {
        name: "פיסטצ׳יו",
        image: "A7404980.webp",
        description: "עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס."
      },
      {
        name: "במבה רד",
        image: "A7405005.webp",
        description: "עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה."
      },
      {
        name: "קונפטי פאן",
        image: "A7404978.webp",
        description: "עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד."
      },
      {
        name: "ס׳מורשמלו",
        image: "A7404945.webp",
        description: "עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל."
      },
      {
        name: "קינדר",
        image: "A7404950.webp",
        description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳."
      },
      {
        name: "קורנפלקס שוקולד לבן",
        image: "A7404939.webp",
        description: "עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק."
      },
      {
        name: "קורנפלקס שוקולד חלב",
        image: "A7404956.webp",
        description: "עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי."
      },
      {
        name: "אמסטרדם",
        image: "A7404918.webp",
        description: "עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן."
      },
      {
        name: "שוקוצ׳יפס",
        image: "A7404900.webp",
        description: "עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד."
      },
      {
        name: "חצי־חצי",
        image: "A7404971.webp",
        description: "חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים."
      },
      {
        name: "ברוקי",
        image: "A7404968.webp",
        description: "בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז."
      },
      {
        name: "שוקולד דובאי",
        image: "A7404987.webp",
        description: "עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף."
      },
      {
        name: "מגולגלת קינדר",
        image: "A7404964.webp",
        description: "עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל."
      },
      {
        name: "פתיבר",
        image: "A7404912.webp",
        description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות."
      }
    ];

    function getWhatsAppUrl(productName = "") {
      const productLine = productName ? `מוצר / הזמנה: ${productName}` : "מוצר / הזמנה:";
      const message = `שלום ליאור, אשמח לבצע הזמנה מ־Lior’s Pâtisserie.
${productLine}
כמות:
שם מלא:
טלפון:`;

      return `https://wa.me/${normalizeWhatsappPhone(WHATSAPP_PHONE)}?text=${encodeURIComponent(message)}`;
    }

    function imagePath(name) {
      return `prdimages/${name}`;
    }

    function setImageWithFallback(img, name) {
      const hasExtension = /\.[a-zA-Z0-9]+$/.test(name);

      const options = hasExtension
        ? [
            imagePath(name)
          ]
        : [
            `${imagePath(name)}.webp`,
            `${imagePath(name)}.jpg`,
            `${imagePath(name)}.jpeg`,
            `${imagePath(name)}.png`,
            `${imagePath(name)}.JPG`,
            `${imagePath(name)}.JPEG`,
            `${imagePath(name)}.PNG`,
            `${imagePath(name)}.WEBP`
          ];

      let index = 0;

      img.onload = function () {
        img.classList.add("is-loaded");
      };

      if (img.getAttribute("src") === options[index]) {
        if (img.complete && img.naturalWidth) {
          img.classList.add("is-loaded");
        }
        return;
      }

      img.onerror = function () {
        index += 1;
        if (index < options.length) {
          img.src = options[index];
        }
      };

      img.classList.remove("is-loaded");
      img.src = options[index];
    }

    function renderSignatureProducts() {
      const grid = document.getElementById("signatureGrid");
      if (!grid) return;

      const signatureProducts = signatureProductNames
        .map((name) => products.find((product) => product.name === name))
        .filter(Boolean);

      grid.innerHTML = signatureProducts.map((product) => `
        <article class="signature-card reveal">
          <div class="signature-image">
            <img data-product-image="${product.image}" alt="${product.name}" width="1200" height="1032" loading="lazy" decoding="async">
          </div>
          <div class="signature-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <a class="product-link" href="#" data-order data-product="${product.name}">
              להזמנה
            </a>
          </div>
        </article>
      `).join("");

    }

    function renderProducts() {
      const grid = document.getElementById("productsGrid");

      grid.innerHTML = products.map((product) => `
        <article class="product-card reveal">
          <div class="product-image">
            <img data-product-image="${product.image}" alt="${product.name}" width="1200" height="1032" loading="lazy" decoding="async">
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <a class="product-link" href="#" data-order data-product="${product.name}">
              להזמנה ←
            </a>
          </div>
        </article>
      `).join("");

    }

    function getManagedImageName(img) {
      return img.dataset.img || img.dataset.productImage || "";
    }

    function setupImages() {
      const images = Array.from(document.querySelectorAll("[data-img], [data-product-image]"));

      if (!images.length) return;

      const markReady = (img) => {
        img.dataset.imageReady = "true";
        if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
      };

      const loadImage = (img) => {
        if (img.dataset.imageReady === "true") {
          markReady(img);
          return;
        }

        if (img.dataset.imageQueued === "loaded") return;

        const name = getManagedImageName(img);
        if (!name) return;

        const currentSrc = img.getAttribute("src") || "";
        if (currentSrc && ((img.complete && img.naturalWidth) || (currentSrc.includes(name) && img.classList.contains("is-loaded")))) {
          markReady(img);
          return;
        }

        img.dataset.imageQueued = "loaded";
        img.dataset.imageReady = "true";
        setImageWithFallback(img, name);
      };

      if (!("IntersectionObserver" in window)) {
        images.forEach((img) => {
          img.dataset.imageObserved = "true";
          loadImage(img);
        });
        return;
      }

      if (!window.__liorImageObserver) {
        window.__liorImageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage(entry.target);
              window.__liorImageObserver.unobserve(entry.target);
            }
          });
        }, { rootMargin: "650px 0px", threshold: 0.01 });
      }

      images.forEach((img) => {
        const shouldLoadImmediately = img.loading === "eager" || img.fetchPriority === "high";

        if (img.dataset.imageReady === "true") {
          markReady(img);
          return;
        }

        if (img.dataset.imageObserved === "true") return;

        if (shouldLoadImmediately) {
          img.dataset.imageObserved = "true";
          loadImage(img);
          return;
        }

        img.dataset.imageObserved = "true";
        window.__liorImageObserver.observe(img);
      });
    }

    function setupWhatsappLinks() {
      document.querySelectorAll("[data-whatsapp]").forEach((link) => {
        if (link.hasAttribute("data-order")) return;
        link.href = getWhatsAppUrl();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });
    }

    function setupInstagramLinks() {
      document.querySelectorAll(".instagram-btn").forEach((link) => {
        link.href = INSTAGRAM_URL;
      });
    }

    function openOrderModal(productName = "") {
      const modal = document.getElementById("orderModal");
      const productInput = document.getElementById("orderProduct");
      const error = document.getElementById("orderError");

      if (!modal) return;

      if (productInput) {
        productInput.value = productName || "";
      }

      if (error) {
        error.classList.remove("is-visible");
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-modal");

      setTimeout(() => {
        const firstInput = document.getElementById("customerName");
        if (firstInput) firstInput.focus();
      }, 80);
    }

    function closeOrderModal() {
      const modal = document.getElementById("orderModal");
      if (!modal) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-modal");
    }

    function buildOrderWhatsAppUrl(data) {
      const messageLines = [
        "שלום ליאור, אשמח לבצע הזמנה מ־Lior’s Pâtisserie.",
        "",
        `שם מלא: ${data.name}`,
        `טלפון: ${data.phone}`,
        `מוצר / הזמנה: ${data.product}`,
        `כמות: ${data.quantity}`
      ];

      if (data.date) {
        messageLines.push(`תאריך רצוי: ${data.date}`);
      }

      if (data.notes) {
        messageLines.push(`הערות: ${data.notes}`);
      }

      const message = messageLines.join("\n");

      return `https://wa.me/${normalizeWhatsappPhone(WHATSAPP_PHONE)}?text=${encodeURIComponent(message)}`;
    }

    function setupOrderModal() {
      const modal = document.getElementById("orderModal");
      const closeBtn = document.getElementById("orderModalClose");
      const form = document.getElementById("orderForm");
      const error = document.getElementById("orderError");

      document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-order]");
        if (!button) return;
        event.preventDefault();
        const productName = button.getAttribute("data-product") || "";
        openOrderModal(productName);
      });
      window.openOrderModal = openOrderModal;

      if (closeBtn) {
        closeBtn.addEventListener("click", closeOrderModal);
      }

      if (modal) {
        modal.addEventListener("click", (event) => {
          if (event.target === modal) {
            closeOrderModal();
          }
        });
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeOrderModal();
        }
      });

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();

          const data = {
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            product: document.getElementById("orderProduct").value.trim(),
            quantity: document.getElementById("orderQuantity").value.trim(),
            date: document.getElementById("orderDate").value.trim(),
            notes: document.getElementById("orderNotes").value.trim()
          };

          const isValid = data.name && data.phone && data.product && data.quantity;

          if (!isValid) {
            if (error) error.classList.add("is-visible");
            return;
          }

          if (error) error.classList.remove("is-visible");

          const url = buildOrderWhatsAppUrl(data);
          window.open(url, "_blank", "noopener,noreferrer");
        });
      }
    }

    function setupSectionUnlockAnimations() {
      const sections = Array.from(document.querySelectorAll("main > section"));

      if (!sections.length) return;

      const unlockImmediately = window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window);

      if (unlockImmediately) {
        sections.forEach((section) => {
          section.classList.add("section-unlock", "is-unlocked");
          section.dataset.sectionUnlockReady = "true";
        });
        return;
      }

      if (!window.__liorSectionUnlockObserver) {
        window.__liorSectionUnlockObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-unlocked");
              entry.target.dataset.sectionUnlockReady = "true";
              window.__liorSectionUnlockObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
      }

      sections.forEach((section, index) => {
        section.classList.add("section-unlock");
        if (section.classList.contains("is-unlocked")) {
          section.dataset.sectionUnlockReady = "true";
          return;
        }
        if (index === 0) {
          section.classList.add("is-unlocked");
          section.dataset.sectionUnlockReady = "true";
          return;
        }
        if (section.dataset.sectionUnlockReady === "true") return;
        section.dataset.sectionUnlockReady = "true";
        window.__liorSectionUnlockObserver.observe(section);
      });
    }

    function setupRevealAnimations() {
      const reveals = Array.from(document.querySelectorAll(".reveal"));

      if (!reveals.length) return;

      const revealImmediately = window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window);

      if (revealImmediately) {
        reveals.forEach((el) => {
          el.classList.add("is-visible");
          el.dataset.revealReady = "true";
        });
        return;
      }

      if (!window.__liorRevealObserver) {
        window.__liorRevealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              entry.target.dataset.revealReady = "true";
              window.__liorRevealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.14 });
      }

      reveals.forEach((el) => {
        if (el.classList.contains("is-visible")) {
          el.dataset.revealReady = "true";
          return;
        }
        if (el.dataset.revealReady === "true") return;
        el.dataset.revealReady = "true";
        window.__liorRevealObserver.observe(el);
      });
    }

    function setupMobileMenu() {
      const btn = document.getElementById("menuBtn");
      const nav = document.getElementById("mobileNav");

      btn.addEventListener("click", () => {
        nav.classList.toggle("is-open");
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
        });
      });
    }

    function openImageLightbox(src, alt = "") {
      const lightbox = document.getElementById("imageLightbox");
      const image = document.getElementById("imageLightboxImg");

      if (!lightbox || !image) return;

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-lightbox");
      image.src = src;
      image.alt = alt;
    }

    function closeImageLightbox() {
      const lightbox = document.getElementById("imageLightbox");
      const image = document.getElementById("imageLightboxImg");

      if (!lightbox || !image) return;

      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-lightbox");
      image.src = "";
      image.alt = "";
    }

    function setupImageLightbox() {
      const lightbox = document.getElementById("imageLightbox");
      const closeBtn = document.getElementById("imageLightboxClose");
      const lightboxImg = document.getElementById("imageLightboxImg");

      document.querySelectorAll(".product-image img").forEach((img) => {
        img.addEventListener("click", () => {
          openImageLightbox(img.currentSrc || img.src, img.alt || "");
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", closeImageLightbox);
      }

      if (lightbox) {
        lightbox.addEventListener("click", (event) => {
          if (event.target === lightbox) {
            closeImageLightbox();
          }
        });
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeImageLightbox();
        }
      });
    }


    function preloadAllImages() {
      const allImages = products.map((p) => p.image);

      const load = (index) => {
        if (index >= allImages.length) return;
        const name = allImages[index];
        const extensions = name.includes('.') ? [name] : [
          name + '.webp', name + '.jpg', name + '.jpeg', name + '.png'
        ];
        const img = new Image();
        img.src = 'prdimages/' + extensions[0];
        img.onerror = () => {
          let i = 1;
          const tryNext = () => {
            if (i >= extensions.length) return;
            const next = new Image();
            next.src = 'prdimages/' + extensions[i];
            next.onerror = tryNext;
            i++;
          };
          tryNext();
        };
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => load(index + 1), { timeout: 3000 });
        } else {
          setTimeout(() => load(index + 1), 80);
        }
      };

      setTimeout(() => load(0), 200);
    }

    window.setImageWithFallback = setImageWithFallback;
    window.setupImages = setupImages;
    window.setupWhatsappLinks = setupWhatsappLinks;
    window.setupInstagramLinks = setupInstagramLinks;
    window.setupOrderModal = setupOrderModal;
    window.setupSectionUnlockAnimations = setupSectionUnlockAnimations;
    window.setupRevealAnimations = setupRevealAnimations;
    window.setupImageLightbox = setupImageLightbox;


    window.addEventListener("pageshow", () => {
      document.querySelectorAll(".reveal, .section-unlock").forEach((el) => {
        el.classList.add("is-visible");
        el.classList.add("is-unlocked");
      });

      document.querySelectorAll("img[data-img], img[data-product-image]").forEach((img) => {
        img.style.opacity = "1";
        if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
      });
    });

    document.addEventListener("DOMContentLoaded", () => {

    function setupNavDots() {
      const sections = Array.from(document.querySelectorAll("main > section"));
      const dots = Array.from(document.querySelectorAll(".nav-dot"));

      if (!sections.length || !dots.length) return;

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const target = dot.dataset.target;
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      function updateActive() {
        const mid = window.scrollY + window.innerHeight * 0.45;
        let activeIndex = 0;
        sections.forEach((section, i) => {
          if (section.offsetTop <= mid) activeIndex = i;
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle("is-active", i === activeIndex);
        });
      }

      window.addEventListener("scroll", updateActive, { passive: true });
      updateActive();
    }

      renderSignatureProducts();
      renderProducts();
      setupImages();
      setupWhatsappLinks();
      setupSectionUnlockAnimations();
      setupRevealAnimations();
      setupOrderModal();
      setupImageLightbox();
      setupNavDots();
      setupInstagramLinks();
      preloadAllImages();
      setupHiddenAdminEntry();
    });

    let hiddenAdminClickCount = 0;
    let hiddenAdminTimer = null;

    function setupHiddenAdminEntry() {
      const trigger = document.querySelector('[data-admin-trigger="true"]');
      if (!trigger) return;
      trigger.addEventListener("click", function (event) {
        hiddenAdminClickCount += 1;
        clearTimeout(hiddenAdminTimer);
        hiddenAdminTimer = setTimeout(function () {
          hiddenAdminClickCount = 0;
        }, 3000);
        if (hiddenAdminClickCount >= 3) {
          event.preventDefault();
          hiddenAdminClickCount = 0;
          clearTimeout(hiddenAdminTimer);
          window.location.href = "lior-admin.html";
        }
      });
    }
