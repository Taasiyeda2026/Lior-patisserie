    document.documentElement.classList.add("js");

    let WHATSAPP_PHONE = "972506422900";

    function normalizeWhatsappPhone(value) {
      const digits = String(value || "").replace(/[^0-9]/g, "");
      if (!digits) return "";
      if (digits.startsWith("0") && digits.length === 10) return "972" + digits.slice(1);
      if (digits.startsWith("972") && digits.length === 12) return digits;
      if (digits.startsWith("00972")) return digits.replace(/^00/, "");
      return digits;
    }
    const INSTAGRAM_URL = "https://www.instagram.com/_liornahum_/";


    const HERO_UNLOCK_STORAGE_KEY = "liorHeroUnlocked";

    function isHeroUnlocked() {
      return sessionStorage.getItem(HERO_UNLOCK_STORAGE_KEY) === "true";
    }

    function applyHeroLockState() {
      const locked = !isHeroUnlocked();
      document.documentElement.classList.toggle("hero-locked", locked);
      if (document.body) {
        document.body.classList.toggle("hero-locked", locked);
      }
    }

    function setupHeroUnlock() {
      applyHeroLockState();

      document.querySelectorAll(".hero-scroll-link").forEach((link) => {
        link.addEventListener("click", () => {
          sessionStorage.setItem(HERO_UNLOCK_STORAGE_KEY, "true");
          applyHeroLockState();
        });
      });
    }

    const signatureProductNames = ["אוראו דרים", "קוקילוטוס", "פיסטצ׳יו", "שוקולד דובאי"];

    const products = [
      { name: "אוראו דרים",           image: "A7404929.JPG", cardImage: "cards/A7404929.webp", description: "עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל." },
      { name: "כריות נוגט",           image: "A7404958.JPG", cardImage: "cards/A7404958.webp", description: "עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן." },
      { name: "קוקילוטוס",            image: "A7404990.jpg", cardImage: "cards/A7404990.webp", description: "עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל." },
      { name: "פיסטצ׳יו",             image: "A7404980.jpg", cardImage: "cards/A7404980.webp", description: "עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס." },
      { name: "במבה רד",              image: "A7405005.jpg", cardImage: "cards/A7405005.webp", description: "עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה." },
      { name: "קונפטי פאן",           image: "A7404978.JPG", cardImage: "cards/A7404978.webp", description: "עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד." },
      { name: "ס׳מורשמלו",            image: "A7404945.JPG", cardImage: "cards/A7404945.webp", description: "עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל." },
      { name: "קינדר",                image: "A7404950.jpg", cardImage: "cards/A7404950.webp", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳." },
      { name: "קורנפלקס שוקולד לבן",  image: "A7404939.JPG", cardImage: "cards/A7404939.webp", description: "עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק." },
      { name: "קורנפלקס שוקולד חלב",  image: "A7404956.jpg", cardImage: "cards/A7404956.webp", description: "עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי." },
      { name: "אמסטרדם",              image: "A7404918.jpg", cardImage: "cards/A7404918.webp", description: "עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן." },
      { name: "שוקוצ׳יפס",            image: "A7404900.jpg", cardImage: "cards/A7404900.webp", description: "עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד." },
      { name: "חצי־חצי",              image: "A7404971.jpg", cardImage: "cards/A7404971.webp", description: "חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים." },
      { name: "ברוקי",                image: "A7404968.jpg", cardImage: "cards/A7404968.webp", description: "בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז." },
      { name: "שוקולד דובאי",         image: "A7404987.JPG", cardImage: "cards/A7404987.webp", description: "עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף." },
      { name: "מגולגלת קינדר",        image: "A7404964.JPG", cardImage: "cards/A7404964.webp", description: "עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל." },
      { name: "פתיבר",                image: "A7404912.JPG", cardImage: "cards/A7404912.webp", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות." }
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
      return typeof window.normalizeImagePath === "function"
        ? window.normalizeImagePath(name)
        : (function fallbackNormalize(v) {
          const path = String(v || "").trim().replace(/\\/g, "/");
          if (!path) return "";
          if (/^https?:\/\//i.test(path) || path.startsWith("//") || path.startsWith("/")) return path;
          if (/^prdimages\//i.test(path)) return path.replace(/^prdimages\//i, "prdimages/");
          if (/^(assets|images|attached_assets)\//i.test(path)) return path;
          return `prdimages/${path}`;
        })(name);
    }

    function setImageWithFallback(img, name) {
      const raw = String(name || "").trim();
      const placeholder = window.LIOR_IMAGE_PLACEHOLDER || "";
      const fullImageRaw = String(img.dataset.fullImage || "").trim();
      const primaryRaw = raw || fullImageRaw;

      if (!primaryRaw) {
        if (placeholder) {
          img.dataset.imageReady = "true";
          img.classList.add("is-loaded");
          img.src = placeholder;
        }
        return;
      }

      const base = typeof window.normalizeImagePath === "function"
        ? window.normalizeImagePath(primaryRaw)
        : imagePath(primaryRaw);
      const hasExtension = /\.[a-zA-Z0-9]+$/.test(base);
      const fullNormalized = raw && fullImageRaw
        ? (typeof window.normalizeImagePath === "function"
          ? window.normalizeImagePath(fullImageRaw)
          : imagePath(fullImageRaw))
        : "";

      let options = hasExtension
        ? [base]
        : [
            `${base}.webp`,
            `${base}.jpg`,
            `${base}.jpeg`,
            `${base}.png`,
            `${base}.JPG`,
            `${base}.JPEG`,
            `${base}.PNG`,
            `${base}.WEBP`
          ];

      if (fullNormalized && fullNormalized !== base && fullImageRaw !== primaryRaw) {
        options.push(fullNormalized);
      }

      const seen = new Set();
      options = options.filter((url) => {
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
      });

      if (placeholder) {
        options.push(placeholder);
      }

      let index = 0;

      img.onload = function () {
        img.dataset.imageReady = "true";
        img.classList.add("is-loaded");
      };

      if (!options.length) {
        if (placeholder) {
          img.dataset.imageReady = "true";
          img.classList.add("is-loaded");
          img.src = placeholder;
        }
        return;
      }

      if (img.getAttribute("src") === options[index]) {
        if (img.complete && img.naturalWidth) {
          img.dataset.imageReady = "true";
          img.classList.add("is-loaded");
        }
        return;
      }

      img.onerror = function () {
        index += 1;
        if (index < options.length) {
          img.src = options[index];
          return;
        }
        img.onerror = null;
      };

      img.dataset.imageReady = "false";
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
            <button class="product-link add-to-cart-btn" type="button" data-add-to-cart data-product="${product.name}" aria-label="הוספה לסל: ${product.name}">🛒</button>
            <div class="cart-feedback" aria-live="polite"></div>
          </div>
        </article>
      `).join("");

    }

    function renderProducts() {
      const grid = document.getElementById("productsGrid");

      grid.innerHTML = products.map((product, index) => `
        <article class="product-card reveal">
          <div class="product-image">
            <img
              data-product-image="${product.cardImage || product.image}"
              data-full-image="${product.image}"
              alt="${product.name}"
              width="800"
              height="688"
              loading="${index < 4 ? "eager" : "lazy"}"
              fetchpriority="${index < 4 ? "high" : "auto"}"
              decoding="async">
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <button class="product-link add-to-cart-btn" type="button" data-add-to-cart data-product="${product.name}" aria-label="הוספה לסל: ${product.name}">🛒</button>
            <div class="cart-feedback" aria-live="polite"></div>
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

    async function setupInstagramLinks() {
      let url = INSTAGRAM_URL;
      try {
        const sb = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
        if (sb) {
          const { data } = await sb
            .from("site_settings")
            .select("value")
            .eq("key", "instagram_url")
            .single();
          if (data && data.value) url = data.value;
        }
      } catch (_) {}
      document.querySelectorAll(".instagram-btn").forEach((link) => {
        link.href = url;
      });
    }

    const ORDER_CART_STORAGE_KEY = "liorOrderCart";
    let orderCart = [];

    function saveOrderCart() {
      localStorage.setItem(ORDER_CART_STORAGE_KEY, JSON.stringify(orderCart));
    }

    function clearOrderCart() {
      orderCart = [];
      localStorage.removeItem(ORDER_CART_STORAGE_KEY);
      renderOrderCart();
    }

    function loadOrderCart() {
      const savedCart = localStorage.getItem(ORDER_CART_STORAGE_KEY);
      if (!savedCart) return;

      try {
        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) return;

        orderCart = parsedCart
          .filter((item) => item && typeof item.name === "string" && Number(item.quantity) > 0)
          .map((item) => ({
            name: item.name,
            quantity: Math.max(1, Math.floor(Number(item.quantity)))
          }));
      } catch (_) {
        localStorage.removeItem(ORDER_CART_STORAGE_KEY);
      }
    }

    function getCartItem(productName) {
      return orderCart.find((item) => item.name === productName);
    }

    function addProductToCart(productName) {
      if (!productName) return;

      const existingItem = getCartItem(productName);
      if (existingItem) {
        existingItem.quantity += 1;
        saveOrderCart();
        return "updated";
      }

      orderCart.push({ name: productName, quantity: 1 });
      saveOrderCart();
      return "added";
    }

    function updateCartItem(productName, change) {
      const item = getCartItem(productName);
      if (!item) return;

      item.quantity += change;
      if (item.quantity <= 0) {
        removeCartItem(productName);
      } else {
        saveOrderCart();
        renderOrderCart();
      }
    }

    function removeCartItem(productName) {
      const itemIndex = orderCart.findIndex((item) => item.name === productName);
      if (itemIndex === -1) return;

      orderCart.splice(itemIndex, 1);
      saveOrderCart();
      renderOrderCart();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function updateFloatingCartCount() {
      const btn = document.getElementById("floatingCart");
      const badge = document.getElementById("floatingCartCount");
      if (!btn || !badge) return;
      const total = orderCart.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = total;
      badge.hidden = total === 0;
    }

    function renderOrderCart() {
      const cartWrap = document.getElementById("orderCartWrap");
      const cartList = document.getElementById("orderCartList");
      const clearCartButton = document.getElementById("clearCartButton");
      const manualField = document.getElementById("manualOrderField");
      const manualInput = document.getElementById("orderProduct");
      const emptyState = document.getElementById("orderEmptyState");
      const continueButton = document.getElementById("orderContinueButton");
      const hasItems = orderCart.length > 0;

      if (cartWrap) {
        cartWrap.hidden = !hasItems;
      }

      if (emptyState) {
        emptyState.hidden = hasItems;
      }

      if (clearCartButton) {
        clearCartButton.hidden = !hasItems;
      }

      if (continueButton) {
        continueButton.hidden = !hasItems;
        continueButton.disabled = !hasItems;
      }

      if (manualField) {
        manualField.hidden = true;
      }

      if (manualInput) {
        manualInput.required = false;
        manualInput.value = "";
      }

      updateFloatingCartCount();

      if (!cartList) return;

      cartList.innerHTML = orderCart.map((item) => `
        <div class="order-cart-item">
          <div class="order-cart-name">${escapeHtml(item.name)}</div>
          <div class="order-cart-actions" aria-label="כמות עבור ${escapeHtml(item.name)}">
            <button class="order-cart-btn" type="button" data-cart-decrease="${escapeHtml(item.name)}" aria-label="הפחתת כמות ${escapeHtml(item.name)}">−</button>
            <span class="order-cart-qty" aria-label="כמות">${item.quantity}</span>
            <button class="order-cart-btn" type="button" data-cart-increase="${escapeHtml(item.name)}" aria-label="הגדלת כמות ${escapeHtml(item.name)}">+</button>
            <button class="order-cart-remove" type="button" data-cart-remove="${escapeHtml(item.name)}" aria-label="הסרת ${escapeHtml(item.name)} מהסל">הסרה</button>
          </div>
        </div>
      `).join("");
    }

    function showOrderStep(step) {
      setOrderErrorVisible(false);
      const cartStep = document.getElementById("orderCartStep");
      const detailsStep = document.getElementById("orderForm");
      const title = document.getElementById("orderModalTitle");
      const subtitle = document.getElementById("orderModalSubtitle");
      const showDetails = step === "details";

      if (cartStep) cartStep.hidden = showDetails;
      if (detailsStep) detailsStep.hidden = !showDetails;

      if (title) {
        title.textContent = showDetails ? "פרטי ההזמנה" : "סל ההזמנה שלך";
      }

      if (subtitle) {
        subtitle.textContent = showDetails
          ? "מלאו כמה פרטים קצרים וההזמנה תישלח לליאור ב־WhatsApp."
          : "בדקו את הטעמים שבחרתם, ואז המשיכו לפרטי ההזמנה.";
      }
    }

    function showAddToCartFeedback(button, productName, action = "added") {
      const card = button.closest(".product-card, .signature-card");
      const feedback = card ? card.querySelector(".cart-feedback") : null;

      button.classList.remove("is-clicked");
      void button.offsetWidth;
      button.classList.add("is-clicked");

      if (feedback) {
        feedback.textContent = action === "updated"
          ? `עודכן בסל: ${productName}`
          : `נוסף לסל: ${productName}`;
        feedback.classList.add("is-visible");

        clearTimeout(feedback._hideTimer);
        feedback._hideTimer = setTimeout(() => {
          feedback.classList.remove("is-visible");
          feedback.textContent = "";
        }, 1800);
      }

      setTimeout(() => {
        button.classList.remove("is-clicked");
      }, 420);
    }

    function setupAddToCartButtons() {
      document.addEventListener("click", (event) => {
        const addButton = event.target.closest("[data-add-to-cart]");
        if (!addButton) return;

        event.preventDefault();

        const productName = addButton.getAttribute("data-product") || "";
        if (!productName) return;

        const action = addProductToCart(productName);
        renderOrderCart();
        showAddToCartFeedback(addButton, productName, action);
      });
    }

    let modalOpener = null;
    let lightboxOpener = null;

    function trapModalFocus(event) {
      const lightbox = document.getElementById("imageLightbox");
      if (lightbox && lightbox.classList.contains("is-open")) return;
      const modal = document.getElementById("orderModal");
      if (!modal || modal.getAttribute("aria-hidden") === "true") return;
      const card = modal.querySelector(".order-modal-card");
      if (!card) return;
      const focusable = Array.from(card.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )).filter((el) => !el.closest("[hidden]"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) { event.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }

    function setOrderErrorVisible(visible) {
      const error = document.getElementById("orderError");
      if (!error) return;
      if (visible) {
        error.classList.add("is-visible");
        error.setAttribute("aria-hidden", "false");
      } else {
        error.classList.remove("is-visible");
        error.setAttribute("aria-hidden", "true");
      }
    }

    function openOrderModal() {
      const modal = document.getElementById("orderModal");
      const error = document.getElementById("orderError");

      if (!modal) return;

      if (!modalOpener) {
        modalOpener = document.activeElement && document.activeElement !== document.body
          ? document.activeElement
          : null;
      }

      renderOrderCart();
      showOrderStep("cart");

      setOrderErrorVisible(false);

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-modal");

      const floatingCart = document.getElementById("floatingCart");
      if (floatingCart) floatingCart.setAttribute("aria-expanded", "true");

      setTimeout(() => {
        const firstAction = orderCart.length
          ? document.getElementById("orderContinueButton")
          : document.getElementById("backToProductsButton");
        if (firstAction) firstAction.focus();
      }, 80);
    }

    function closeOrderModal() {
      const modal = document.getElementById("orderModal");
      if (!modal) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-modal");

      const floatingCart = document.getElementById("floatingCart");
      if (floatingCart) floatingCart.setAttribute("aria-expanded", "false");

      setOrderErrorVisible(false);

      if (modalOpener && typeof modalOpener.focus === "function") {
        modalOpener.focus();
        modalOpener = null;
      }
    }

    function getOrderProductsText(manualProduct = "") {
      if (orderCart.length) {
        return orderCart
          .map((item) => `- ${item.name} × ${item.quantity}`)
          .join("\n");
      }

      return manualProduct;
    }

    function buildOrderWhatsAppUrl(data) {
      const messageLines = [
        "שלום ליאור, אשמח לבצע הזמנה מ־Lior’s Pâtisserie.",
        "",
        `שם מלא: ${data.name}`,
        `טלפון: ${data.phone}`,
        "מוצרים:",
        data.products
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
      const cartList = document.getElementById("orderCartList");
      const clearCartButton = document.getElementById("clearCartButton");
      const continueButton = document.getElementById("orderContinueButton");
      const backToProductsButton = document.getElementById("backToProductsButton");

      loadOrderCart();
      renderOrderCart();

      document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-order]");
        if (!button) return;
        event.preventDefault();
        modalOpener = button;
        openOrderModal();
      });
      window.openOrderModal = openOrderModal;

      if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
          clearOrderCart();
          showOrderStep("cart");
        });
      }

      if (continueButton) {
        continueButton.addEventListener("click", () => {
          if (!orderCart.length) return;
          showOrderStep("details");
          setTimeout(() => {
            const firstInput = document.getElementById("customerName");
            if (firstInput) firstInput.focus();
          }, 40);
        });
      }

      if (backToProductsButton) {
        backToProductsButton.addEventListener("click", () => {
          closeOrderModal();
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }

      if (cartList) {
        cartList.addEventListener("click", (event) => {
          const increaseButton = event.target.closest("[data-cart-increase]");
          const decreaseButton = event.target.closest("[data-cart-decrease]");
          const removeButton = event.target.closest("[data-cart-remove]");

          if (increaseButton) {
            updateCartItem(increaseButton.getAttribute("data-cart-increase"), 1);
          } else if (decreaseButton) {
            updateCartItem(decreaseButton.getAttribute("data-cart-decrease"), -1);
          } else if (removeButton) {
            removeCartItem(removeButton.getAttribute("data-cart-remove"));
          }

          if (!orderCart.length) {
            showOrderStep("cart");
          }
        });
      }

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
          const lightbox = document.getElementById("imageLightbox");
          if (lightbox && lightbox.classList.contains("is-open")) {
            closeImageLightbox();
            event.preventDefault();
            return;
          }
          closeOrderModal();
          return;
        }
        if (event.key === "Tab") {
          trapModalFocus(event);
        }
      });

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();

          const manualInput = document.getElementById("orderProduct");
          const manualProduct = manualInput ? manualInput.value.trim() : "";
          const data = {
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            products: getOrderProductsText(manualProduct),
            date: document.getElementById("orderDate").value.trim(),
            notes: document.getElementById("orderNotes").value.trim()
          };

          const isValid = data.name && data.phone && data.products;

          if (!isValid) {
            setOrderErrorVisible(true);
            return;
          }

          setOrderErrorVisible(false);

          const url = buildOrderWhatsAppUrl(data);
          window.open(url, "_blank", "noopener,noreferrer");
          clearOrderCart();
          closeOrderModal();
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
      const closeBtn = document.getElementById("imageLightboxClose");

      if (!lightbox || !image) return;

      lightboxOpener = document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : null;

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-lightbox");
      image.src = src;
      image.alt = alt || "תמונה מהאתר";
      requestAnimationFrame(() => {
        if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
      });
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
      if (lightboxOpener && typeof lightboxOpener.focus === "function") {
        lightboxOpener.focus();
      }
      lightboxOpener = null;
    }

    function setupImageLightbox() {
      const lightbox = document.getElementById("imageLightbox");
      const closeBtn = document.getElementById("imageLightboxClose");

      if (!window.__liorLightboxDelegated) {
        window.__liorLightboxDelegated = true;
        document.addEventListener("click", (event) => {
          const productImg = event.target.closest(".product-image img");
          if (productImg) {
            const fullName = productImg.dataset.fullImage;
            const src = fullName ? imagePath(fullName) : (productImg.currentSrc || productImg.src);
            openImageLightbox(src, productImg.alt || "");
          }
        });
      }

      if (closeBtn && !closeBtn.dataset.liorLightboxCloseBound) {
        closeBtn.dataset.liorLightboxCloseBound = "true";
        closeBtn.addEventListener("click", closeImageLightbox);
      }

      if (lightbox && !lightbox.dataset.liorLightboxBackdropBound) {
        lightbox.dataset.liorLightboxBackdropBound = "true";
        lightbox.addEventListener("click", (event) => {
          if (event.target === lightbox) {
            closeImageLightbox();
          }
        });
      }

    }


    function setLiorContactSettings(settings = {}) {
      if (settings.whatsappNumber) {
        WHATSAPP_PHONE = String(settings.whatsappNumber).replace(/[^0-9]/g, "") || WHATSAPP_PHONE;
      }
    }

    window.setLiorContactSettings = setLiorContactSettings;
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
      document.querySelectorAll(".nav-dot").forEach((dot) => {
        dot.addEventListener("click", () => {
          if (dot.hidden) return;
          const target = dot.dataset.target;
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      function updateActive() {
        const sections = Array.from(document.querySelectorAll("main > section:not([hidden])"));
        const dots = Array.from(document.querySelectorAll(".nav-dot:not([hidden])"));
        if (!sections.length || !dots.length) return;

        const mid = window.scrollY + window.innerHeight * 0.45;
        let activeIndex = 0;
        sections.forEach((section, i) => {
          if (section.offsetTop <= mid) activeIndex = i;
        });
        dots.forEach((dot, i) => {
          const active = i === activeIndex;
          dot.classList.toggle("is-active", active);
          if (active) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
        });
      }

      window.__liorRefreshSectionNav = updateActive;
      window.addEventListener("scroll", updateActive, { passive: true });
      updateActive();
    }

      setupHeroUnlock();
      renderSignatureProducts();
      window.__liorRenderStaticProductsFallback = function renderStaticProductsFallback() {
        renderProducts();
      };
      const supabaseClientReady = typeof window.getLiorSupabaseClient === "function" && window.getLiorSupabaseClient();
      if (!supabaseClientReady) {
        renderProducts();
      }
      setupImages();
      setupWhatsappLinks();
      setupSectionUnlockAnimations();
      setupRevealAnimations();
      setupAddToCartButtons();
      setupOrderModal();
      setupImageLightbox();
      setupNavDots();
      setupFooterLegalMenu();
      setupInstagramLinks();   // async - runs in background, updates links when ready
      setupHiddenAdminEntry();
      setupOrderActionsVisibility();
    });

    function setupOrderActionsVisibility() {
      function update() {
        const hero = document.querySelector(".home-hero");
        const scrollY = window.scrollY || window.pageYOffset;
        const threshold = hero
          ? hero.offsetTop + hero.offsetHeight - 120
          : 420;
        document.body.classList.toggle("show-order-actions", scrollY > threshold);
      }

      window.addEventListener("scroll", update, { passive: true });
      update();
    }

    let hiddenAdminClickCount = 0;
    let hiddenAdminTimer = null;

    function setupFooterLegalMenu() {
      const wrap = document.querySelector(".footer-legal-wrap");
      const btn = document.getElementById("footerLegalToggle");
      const panel = document.getElementById("footerLegalPanel");
      if (!wrap || !btn || !panel) return;

      function setFooterLegalOpen(open) {
        wrap.classList.toggle("is-open", open);
        panel.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        if (open) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      }

      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        setFooterLegalOpen(!wrap.classList.contains("is-open"));
      });

      document.addEventListener(
        "click",
        (event) => {
          if (!wrap.classList.contains("is-open")) return;
          if (!wrap.contains(event.target)) setFooterLegalOpen(false);
        },
        false
      );

      document.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "Escape") return;
          const lightbox = document.getElementById("imageLightbox");
          if (lightbox && lightbox.classList.contains("is-open")) return;
          const orderModal = document.getElementById("orderModal");
          if (orderModal && orderModal.classList.contains("is-open")) return;
          if (!wrap.classList.contains("is-open")) return;
          event.preventDefault();
          setFooterLegalOpen(false);
          btn.focus();
        },
        true
      );
    }

    function setupHiddenAdminEntry() {
      const trigger = document.querySelector('[data-admin-trigger="true"]');
      if (!trigger) return;

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        hiddenAdminClickCount += 1;

        clearTimeout(hiddenAdminTimer);
        hiddenAdminTimer = setTimeout(function () {
          hiddenAdminClickCount = 0;
        }, 3000);

        if (hiddenAdminClickCount >= 3) {
          hiddenAdminClickCount = 0;
          clearTimeout(hiddenAdminTimer);
          window.location.href = "lior-admin.html";
        }
      });
    }
