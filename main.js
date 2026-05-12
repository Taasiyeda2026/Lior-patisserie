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

    const PRODUCTS_PER_CATEGORY = 9;

    const signatureProductNames = ["אוראו דרים", "קוקילוטוס", "פיסטצ׳יו", "שוקולד דובאי"];

    const products = [
      { name: "אוראו דרים", description: "עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל." },
      { name: "כריות נוגט", description: "עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן." },
      { name: "קוקילוטוס", description: "עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל." },
      { name: "פיסטצ׳יו", description: "עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס." },
      { name: "במבה רד", description: "עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה." },
      { name: "קונפטי פאן", description: "עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד." },
      { name: "ס׳מורשמלו", description: "עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל." },
      { name: "קינדר", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳." },
      { name: "קורנפלקס שוקולד לבן", description: "עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק." },
      { name: "קורנפלקס שוקולד חלב", description: "עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי." },
      { name: "אמסטרדם", description: "עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן." },
      { name: "שוקוצ׳יפס", description: "עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד." },
      { name: "חצי־חצי", description: "חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים." },
      { name: "ברוקי", description: "בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז." },
      { name: "שוקולד דובאי", description: "עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף." },
      { name: "מגולגלת קינדר", description: "עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל." },
      { name: "פתיבר", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות." }
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

    /** General inquiry from the contact section — reads live form fields when available. */
    function buildGeneralWhatsAppUrl({ name = "", phone = "", notes = "" } = {}) {
      const nameLine  = name  ? `שם: ${name}`            : "שם:";
      const phoneLine = phone ? `טלפון: ${phone}`         : "טלפון:";
      const notesLine = notes ? `פרטים / שאלה: ${notes}` : "פרטים / שאלה:";
      const msg = [
        `שלום ליאור, אשמח להתייעץ לגבי הזמנה מדַLior’s Pâtisserie.`,
        "",
        nameLine,
        phoneLine,
        notesLine,
      ].join("\n");
      return `https://wa.me/${normalizeWhatsappPhone(WHATSAPP_PHONE)}?text=${encodeURIComponent(msg)}`;
    }

    function imagePath(name) {
      const raw = String(name || "").trim();
      if (!raw) return "";
      if (typeof window.normalizeImagePath === "function") return window.normalizeImagePath(raw);
      if (/^https?:\/\//i.test(raw) || raw.startsWith("//") || raw.startsWith("/")) return raw;
      if (/^(assets|images|attached_assets)\//i.test(raw)) return raw;
      return "";
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
      const fullNormalized = raw && fullImageRaw
        ? (typeof window.normalizeImagePath === "function"
          ? window.normalizeImagePath(fullImageRaw)
          : imagePath(fullImageRaw))
        : "";

      let options = [base];

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

      if (!options.length) {
        if (placeholder) {
          img.dataset.imageReady = "true";
          img.classList.add("is-loaded");
          img.src = placeholder;
        }
        return;
      }

      const loadedCache = window.__liorLoadedImageUrls || (window.__liorLoadedImageUrls = new Set());
      const preloadCache = window.__liorPreloadedImages || new Set();
      const currentSrc = img.getAttribute("src") || "";

      if (img.dataset.imageReady === "true" && img.dataset.loadedSrc) {
        img.classList.add("is-loaded");
        return;
      }

      if (currentSrc && img.complete && img.naturalWidth > 0) {
        img.dataset.loadedSrc = currentSrc;
        img.dataset.imageReady = "true";
        img.classList.add("is-loaded");
        loadedCache.add(currentSrc);
        return;
      }

      if (options[0] && (loadedCache.has(options[0]) || preloadCache.has(options[0])) && currentSrc === options[0]) {
        img.dataset.imageReady = "true";
        img.dataset.loadedSrc = currentSrc;
        img.classList.add("is-loaded");
        return;
      }

      if (options[0] && preloadCache.has(options[0]) && !currentSrc) {
        img.dataset.imageReady = "false";
        img.classList.remove("is-loaded");
        img.src = options[0];
        return;
      }

      let index = 0;

      img.onload = function () {
        const loadedUrl = img.currentSrc || img.src || "";
        img.dataset.loadedSrc = loadedUrl;
        img.dataset.imageReady = "true";
        img.classList.add("is-loaded");
        loadedCache.add(loadedUrl);
      };

      if (currentSrc === options[0]) {
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
            <img src="${window.LIOR_IMAGE_PLACEHOLDER || ""}" alt="${product.name}" width="1200" height="1032" loading="lazy" decoding="async">
          </div>
          <div class="signature-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <button class="product-link add-to-cart-btn" type="button" data-add-to-cart data-product="${product.name}" aria-label="הוספה לסל: ${product.name}">+</button>
            <div class="cart-feedback" aria-live="polite"></div>
          </div>
        </article>
      `).join("");

    }

    function renderProducts() {
      const groups = [
        { id: "productsGrid1", items: products.slice(0, PRODUCTS_PER_CATEGORY) },
        { id: "productsGrid2", items: products.slice(PRODUCTS_PER_CATEGORY, PRODUCTS_PER_CATEGORY * 2) },
        { id: "productsGrid3", items: products.slice(PRODUCTS_PER_CATEGORY * 2, PRODUCTS_PER_CATEGORY * 3) }
      ];

      groups.forEach(({ id, items }, groupIndex) => {
        const grid = document.getElementById(id);
        if (!grid) return;
        const section = grid.closest(".category-section");
        if (!items.length) {
          grid.innerHTML = "";
          if (section) section.hidden = true;
          return;
        }
        if (section) section.hidden = false;
        grid.innerHTML = items.map((product, i) => {
          const globalIndex = groupIndex * PRODUCTS_PER_CATEGORY + i;
          return `
            <article class="product-card reveal">
              <div class="product-image">
                <img
                  src="${window.LIOR_IMAGE_PLACEHOLDER || ""}"
                  data-full-image=""
                  alt="${product.name}"
                  width="800"
                  height="688"
                  loading="${globalIndex < 4 ? "eager" : "lazy"}"
                  fetchpriority="${globalIndex < 4 ? "high" : "auto"}"
                  decoding="async">
              </div>
              <div class="product-body">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <button class="product-link add-to-cart-btn" type="button" data-add-to-cart data-product="${product.name}" aria-label="הוספה לסל: ${product.name}">+</button>
                <div class="cart-feedback" aria-live="polite"></div>
              </div>
            </article>
          `;
        }).join("");
      });
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
        if (currentSrc && img.complete && img.naturalWidth > 0) {
          markReady(img);
          img.dataset.imageQueued = "loaded";
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
        }, { rootMargin: "1200px 0px", threshold: 0.01 });
      }

      images.forEach((img) => {
        const shouldLoadImmediately = img.loading === "eager" || img.getAttribute("fetchpriority") === "high" || img.fetchPriority === "high";

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
      document.querySelectorAll("[data-contact-whatsapp]").forEach((link) => {
        link.href = buildGeneralWhatsAppUrl();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });
    }

    function setupContactWhatsappClicks() {
      if (window.__liorContactWhatsappClickBound) return;
      window.__liorContactWhatsappClickBound = true;
      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-contact-whatsapp]");
        if (!link) return;
        event.preventDefault();
        if (typeof openOrderModal === "function") {
          openOrderModal();
        } else {
          const url = buildGeneralWhatsAppUrl();
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }
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

    function setOrderModalCartHeaders() {
      const title = document.getElementById("orderModalTitle");
      const subtitle = document.getElementById("orderModalSubtitle");
      if (!title || !subtitle) return;
      title.textContent = "סל ההזמנה שלך";
      subtitle.textContent =
        orderCart.length === 0
          ? "עדיין לא בחרתם טעמים. חזרו לקולקציה, בחרו טעם שאהבתם והוא יתווסף לכאן."
          : "בדקו את הטעמים שבחרתם, ואז המשיכו לפרטי ההזמנה.";
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

      const modal = document.getElementById("orderModal");
      const detailsStep = document.getElementById("orderForm");
      if (modal && modal.classList.contains("is-open") && detailsStep && detailsStep.hidden) {
        setOrderModalCartHeaders();
      }
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

      if (showDetails) {
        if (title) title.textContent = "פרטי ההזמנה";
        if (subtitle) {
          subtitle.textContent = "מלאו כמה פרטים קצרים וההזמנה תישלח לליאור ב־WhatsApp.";
        }
      } else {
        setOrderModalCartHeaders();
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
    let lightboxImageRequestId = 0;
    const preloadedFullImages = new Set();

    function preloadFullImage(url) {
      const normalizedUrl = imagePath(url);
      if (!normalizedUrl || preloadedFullImages.has(normalizedUrl)) return;
      preloadedFullImages.add(normalizedUrl);
      const img = new Image();
      img.decoding = "async";
      img.src = normalizedUrl;
    }

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
      const reveals = Array.from(document.querySelectorAll(".reveal, .category-section"));

      if (!reveals.length) return;

      const revealImmediately = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
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
        }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
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
      const statusEl = document.getElementById("imageLightboxStatus");
      const loader = lightbox ? lightbox.querySelector("[data-lightbox-loader]") : null;

      if (!lightbox || !image) return;
      const url = imagePath(src);
      if (!url) return;

      const requestId = ++lightboxImageRequestId;

      lightboxOpener = document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : null;

      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      image.alt = alt || "תמונה מהאתר";
      image.hidden = true;
      image.classList.remove("is-loaded");

      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      }
      if (loader) loader.hidden = false;

      lightbox.classList.remove("is-error");
      lightbox.classList.add("is-open", "is-loading");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-lightbox");

      const nextImage = new Image();
      nextImage.decoding = "async";

      nextImage.onload = function () {
        if (requestId !== lightboxImageRequestId) return;

        image.src = url;
        image.alt = alt || "תמונה מהאתר";
        image.hidden = false;
        image.classList.add("is-loaded");

        lightbox.classList.remove("is-loading", "is-error");
        if (loader) loader.hidden = true;
        if (statusEl) {
          statusEl.hidden = true;
          statusEl.textContent = "";
        }
      };

      nextImage.onerror = function () {
        if (requestId !== lightboxImageRequestId) return;

        image.removeAttribute("src");
        image.hidden = true;
        image.classList.remove("is-loaded");

        lightbox.classList.remove("is-loading");
        lightbox.classList.add("is-error");
        if (loader) loader.hidden = true;
        if (statusEl) {
          statusEl.textContent = "לא ניתן לטעון את התמונה";
          statusEl.hidden = false;
        }
      };

      nextImage.src = url;

      requestAnimationFrame(() => {
        if (requestId !== lightboxImageRequestId) return;
        if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
      });
    }

    function closeImageLightbox() {
      const lightbox = document.getElementById("imageLightbox");
      const image = document.getElementById("imageLightboxImg");
      const statusEl = document.getElementById("imageLightboxStatus");
      const loader = lightbox ? lightbox.querySelector("[data-lightbox-loader]") : null;

      lightboxImageRequestId += 1;

      if (!lightbox || !image) return;

      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      image.alt = "";
      image.hidden = true;
      image.classList.remove("is-loaded");

      if (loader) loader.hidden = true;
      lightbox.classList.remove("is-open", "is-loading", "is-error");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-lightbox");
      if (statusEl) {
        statusEl.hidden = true;
        statusEl.textContent = "";
      }

      if (lightboxOpener && typeof lightboxOpener.focus === "function") {
        lightboxOpener.focus();
      }
      lightboxOpener = null;
    }


    function setupBakeryVideos() {
      const videoWrappers = document.querySelectorAll(".bakery-video-wrapper");

      videoWrappers.forEach((wrapper) => {
        const video = wrapper.querySelector("video");
        const playButton = wrapper.querySelector(".bakery-video-play");

        if (!video || !playButton) return;

        video.removeAttribute("controls");

        playButton.addEventListener("click", async () => {
          try {
            video.setAttribute("controls", "controls");
            wrapper.classList.add("is-playing");
            playButton.hidden = true;
            await video.play();
          } catch (error) {
            playButton.hidden = false;
            wrapper.classList.remove("is-playing");
            video.removeAttribute("controls");
            console.warn("Video play failed", error);
          }
        });

        video.addEventListener("pause", () => {
          if (video.currentTime === 0 || video.ended) {
            wrapper.classList.remove("is-playing");
            playButton.hidden = false;
            video.removeAttribute("controls");
          }
        });

        video.addEventListener("ended", () => {
          wrapper.classList.remove("is-playing");
          playButton.hidden = false;
          video.removeAttribute("controls");
          video.currentTime = 0;
        });
      });
    }

    function setupImageLightbox() {
      if (window.__liorImageLightboxInitialized) return;

      const lightbox = document.getElementById("imageLightbox");
      const closeBtn = document.getElementById("imageLightboxClose");
      const image = document.getElementById("imageLightboxImg");
      if (!lightbox || !closeBtn || !image) return;

      if (!window.__liorLightboxDelegated) {
        window.__liorLightboxDelegated = true;
        document.addEventListener("click", (event) => {
          const productImg = event.target.closest(".product-image img");
          if (productImg) {
            const fullImage = imagePath(productImg.dataset.fullImage || "");
            const src = fullImage || productImg.currentSrc || productImg.src || imagePath(productImg.dataset.productImage || "");
            openImageLightbox(src, productImg.alt || "");
          }
        });

        const preloadFromEvent = (event) => {
          const productImg = event.target.closest(".product-image img");
          if (productImg) preloadFullImage(productImg.dataset.fullImage || "");
        };

        document.addEventListener("pointerenter", preloadFromEvent, true);
        document.addEventListener("pointerdown", preloadFromEvent, { passive: true });
        document.addEventListener("touchstart", preloadFromEvent, { passive: true });
        document.addEventListener("focusin", preloadFromEvent);
      }

      if (!closeBtn.dataset.liorLightboxCloseBound) {
        closeBtn.dataset.liorLightboxCloseBound = "true";
        closeBtn.addEventListener("click", closeImageLightbox);
      }

      if (!lightbox.dataset.liorLightboxBackdropBound) {
        lightbox.dataset.liorLightboxBackdropBound = "true";
        lightbox.addEventListener("click", (event) => {
          if (event.target === lightbox) {
            closeImageLightbox();
          }
        });
      }

      window.__liorImageLightboxInitialized = true;
    }


    function setLiorContactSettings(settings = {}) {
      if (settings.whatsappNumber) {
        WHATSAPP_PHONE = String(settings.whatsappNumber).replace(/[^0-9]/g, "") || WHATSAPP_PHONE;
      }
      setupWhatsappLinks();
    }

    window.setLiorContactSettings = setLiorContactSettings;
    window.buildGeneralWhatsAppUrl = buildGeneralWhatsAppUrl;
    window.setImageWithFallback = setImageWithFallback;
    window.setupImages = setupImages;
    window.setupWhatsappLinks = setupWhatsappLinks;
    window.setupInstagramLinks = setupInstagramLinks;
    window.setupOrderModal = setupOrderModal;
    window.setupSectionUnlockAnimations = setupSectionUnlockAnimations;
    window.setupRevealAnimations = setupRevealAnimations;
    window.setupImageLightbox = setupImageLightbox;
    window.setupBakeryVideos = setupBakeryVideos;


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
      const _dots = Array.from(document.querySelectorAll(".nav-dot:not([hidden])"));

      function getDotTarget(dot) {
        const target = dot.dataset.target;
        return target ? document.querySelector(target) : null;
      }

      _dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          if (dot.hidden) return;
          const el = getDotTarget(dot);
          if (!el) return;
          if (el.id === "products") {
            sessionStorage.setItem(HERO_UNLOCK_STORAGE_KEY, "true");
            applyHeroLockState();
          }
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      let _sectionTops = [];

      function cacheSectionTops() {
        _sectionTops = _dots.map((dot) => {
          const target = getDotTarget(dot);
          return target ? target.offsetTop : 0;
        });
      }
      cacheSectionTops();
      window.addEventListener("resize", cacheSectionTops, { passive: true });

      let _navTicking = false;
      function updateActive() {
        if (_navTicking) return;
        _navTicking = true;
        requestAnimationFrame(() => {
          cacheSectionTops();
          if (!_sectionTops.length || !_dots.length) { _navTicking = false; return; }
          const mid = window.scrollY + window.innerHeight * 0.45;
          let activeIndex = 0;
          _sectionTops.forEach((top, i) => { if (top <= mid) activeIndex = i; });
          _dots.forEach((dot, i) => {
            const active = i === activeIndex;
            dot.classList.toggle("is-active", active);
            if (active) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
          });
          _navTicking = false;
        });
      }

      window.__liorRefreshSectionNav = () => { cacheSectionTops(); updateActive(); };
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
      setupContactWhatsappClicks();
      setupSectionUnlockAnimations();
      setupRevealAnimations();
      setupAddToCartButtons();
      setupOrderModal();
      setupImageLightbox();
      setupBakeryVideos();
      setupNavDots();
      setupFooterLegalMenu();
      setupInstagramLinks();   // async - runs in background, updates links when ready
      setupHiddenAdminEntry();
      setupHeaderColorSwitch();
      setupOrderActionsVisibility();
      setupMobileFloatingInfoVisibility();
    });


    function setupMobileFloatingInfoVisibility() {
      const btn = document.getElementById("footerLegalToggle");
      if (!btn) return;

      const productsSection = document.getElementById("products") || document.querySelector(".categories-container");
      const footer = document.querySelector(".footer");
      let showThreshold = productsSection ? productsSection.offsetTop - 80 : 420;
      let footerThreshold = Infinity;

      function recacheFloatingInfoThresholds() {
        showThreshold = productsSection ? productsSection.offsetTop - 80 : 420;
        footerThreshold = footer ? footer.offsetTop - window.innerHeight + 96 : Infinity;
      }

      window.addEventListener("resize", recacheFloatingInfoThresholds, { passive: true });
      window.addEventListener("load", recacheFloatingInfoThresholds, { once: true });

      let ticking = false;
      function update() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset || 0;
          document.body.classList.toggle("show-mobile-more-info", y >= showThreshold);
          document.body.classList.toggle("mobile-info-near-footer", y >= footerThreshold);
          ticking = false;
        });
      }

      window.addEventListener("scroll", update, { passive: true });
      update();
    }

    function setupOrderActionsVisibility() {
      const hero = document.querySelector(".home-hero");
      let threshold = hero ? hero.offsetTop + hero.offsetHeight - 120 : 420;

      function recacheThreshold() {
        threshold = hero ? hero.offsetTop + hero.offsetHeight - 120 : 420;
      }
      window.addEventListener("resize", recacheThreshold, { passive: true });

      let _oaTicking = false;
      function update() {
        if (_oaTicking) return;
        _oaTicking = true;
        requestAnimationFrame(() => {
          document.body.classList.toggle("show-order-actions", (window.scrollY || window.pageYOffset) > threshold);
          _oaTicking = false;
        });
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
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        if (open) {
          panel.removeAttribute("inert");
        } else {
          panel.setAttribute("inert", "");
        }
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

    function setupHeaderColorSwitch() {
      const header = document.querySelector(".site-header");
      if (!header) return;

      const lightSections = document.querySelectorAll(".editorial, .contact-section, .final");
      const hero = document.querySelector(".home-hero");

      const updateHeaderState = () => {
        const isOnLight = Array.from(lightSections).some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= 46 && rect.bottom > 0;
        });
        const heroBottom = hero ? hero.getBoundingClientRect().bottom : Number.POSITIVE_INFINITY;
        header.classList.toggle("header--on-light", isOnLight);
        header.classList.toggle("header--past-hero", heroBottom <= 46);
      };

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(updateHeaderState, { threshold: [0, 0.01, 0.1], rootMargin: "0px 0px -94% 0px" });
        lightSections.forEach((section) => observer.observe(section));
        if (hero) observer.observe(hero);
      }

      updateHeaderState();
      window.addEventListener("scroll", updateHeaderState, { passive: true });
      window.addEventListener("resize", updateHeaderState, { passive: true });
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
