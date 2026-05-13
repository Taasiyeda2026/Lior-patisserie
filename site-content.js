(function () {
  const IMAGE_SETTINGS = [
    "hero_image",
    "hero_logo_image",
    "handmade_image"
  ];
  const PRODUCTS_PER_CATEGORY = 9;

  const TEXT_SETTINGS = [
    "flavors_title",
    "flavors_intro_primary",
    "flavors_intro_secondary",
    "category_1_title",
    "category_1_subtitle",
    "category_2_title",
    "category_2_subtitle",
    "category_3_title",
    "category_3_subtitle",
    "handmade_label",
    "handmade_title",
    "handmade_text",
    "handmade_content_mode",
    "handmade_personal_label",
    "handmade_personal_title",
    "handmade_personal_paragraph_1",
    "handmade_personal_paragraph_2",
    "handmade_personal_cta",
    "handmade_general_bullet_1",
    "handmade_general_bullet_2",
    "handmade_general_bullet_3",
    "handmade_button_text",
    "handmade_button_anchor",
    "contact_label",
    "contact_title",
    "contact_text",
    "contact_email",
    "contact_signature_text",
    "whatsapp_number",
    "instagram_url",
    "instagram_sentence_text",
    "instagram_link_text",
    "hero_title",
    "hero_subtitle",
    "pickup_delivery_text"
  ];

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  const FEATURE_ICON_FALLBACKS = [
    `<svg class="pastry-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 34 L34 16"/><path d="M13 37 L18 32"/><path d="M31 13 L36 18"/><path d="M29 18 C24 13 18 12 14 16 C10 20 11 26 16 31"/><path d="M18 29 C15 25 15 21 17 19 C20 16 24 17 27 20"/></svg>`,
    `<svg class="pastry-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="14" width="24" height="20" rx="3"/><path d="M12 22 H36"/><path d="M20 14 V34"/><path d="M28 14 V34"/><path d="M16 28 H20"/><path d="M28 28 H32"/></svg>`,
    `<svg class="pastry-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="20" width="26" height="17" rx="3"/><path d="M10 20 H38"/><path d="M24 20 V37"/><path d="M14 20 C12 16 14 12 18 13 C21 14 23 17 24 20"/><path d="M34 20 C36 16 34 12 30 13 C27 14 25 17 24 20"/><path d="M15 37 H33"/></svg>`
  ];

  function featureIconFallback(feature, index) {
    const title = String((feature && feature.title) || "").trim();
    if (/טעמים|שוקולד|קרם/.test(title)) return FEATURE_ICON_FALLBACKS[1];
    if (/חגיגי|מפנק|מתנה|אירוח/.test(title)) return FEATURE_ICON_FALLBACKS[2];
    if (/עבודת|יד|אישי/.test(title)) return FEATURE_ICON_FALLBACKS[0];
    return FEATURE_ICON_FALLBACKS[index % FEATURE_ICON_FALLBACKS.length];
  }

  const LEGACY_TEXT_KEY_ALIASES = {
    hero_title: "flavors_title",
    hero_subtitle: "flavors_intro_primary",
    pickup_delivery_text: "contact_text"
  };

  function normalizeSettings(settings) {
    const normalized = { ...settings };
    Object.entries(LEGACY_TEXT_KEY_ALIASES).forEach(([legacyKey, currentKey]) => {
      if (!hasText(normalized[currentKey]) && hasText(normalized[legacyKey])) {
        normalized[currentKey] = normalized[legacyKey];
      }
    });

    if (hasText(normalized.flavors_intro_secondary)) {
      normalized.flavors_intro_primary = [normalized.flavors_intro_primary, normalized.flavors_intro_secondary]
        .filter(hasText)
        .map((value) => value.trim())
        .join("\n\n");
    }

    return normalized;
  }

  function fallbackProducts() {
    return [];
  }


  function normalizePhone(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function normalizeWhatsappPhone(value) {
    const digits = String(value || "").replace(/[^0-9]/g, "");
    if (!digits) return "";
    if (digits.startsWith("0") && digits.length === 10) return "972" + digits.slice(1);
    if (digits.startsWith("972") && digits.length === 12) return digits;
    if (digits.startsWith("00972")) return digits.replace(/^00/, "");
    return digits;
  }

  function formatPhoneForDisplay(value) {
    const digits = normalizePhone(value);
    if (digits.startsWith("972") && digits.length === 12) {
      return `0${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return value;
  }

  function normalizeProductMediaPath(value) {
    if (!hasText(value)) return "";
    const trimmed = String(value).trim();
    if (typeof window.normalizeImagePath === "function") {
      return window.normalizeImagePath(trimmed);
    }
    const p = trimmed.replace(/\\/g, "/").replace(/^\.\/+/, "");
    if (!p) return "";
    if (/^https?:\/\//i.test(p) || p.startsWith("//") || p.startsWith("/")) return p;
    if (/^(assets|images|attached_assets)\//i.test(p)) return p;
    return "";
  }

  function setRemoteImageWithFallback(img, imageUrl) {
    if (!img || !hasText(imageUrl)) return;

    const fallbackSrc = img.getAttribute("src") || "";
    const placeholder = window.LIOR_IMAGE_PLACEHOLDER || "";

    const nextSrc = normalizeProductMediaPath(imageUrl);
    if (!nextSrc) {
      if (placeholder) {
        img.src = placeholder;
        img.classList.add("is-loaded");
      }
      return;
    }
    img.onload = function () {
      img.classList.add("is-loaded");
    };

    if (img.getAttribute("src") === nextSrc) {
      if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
      return;
    }
    img.onerror = function () {
      img.onerror = null;
      if (placeholder) {
        img.src = placeholder;
        img.classList.add("is-loaded");
      }
    };
    img.classList.remove("is-loaded");
    img.src = nextSrc;
  }

  function applyTextSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      if (!hasText(value)) return;
      document.querySelectorAll(`[data-content-key="${key}"]`).forEach((el) => {
        el.textContent = value.trim();
      });
    });
  }

  const HANDMADE_DEFAULTS = {
    handmade_content_mode: "personal",
    handmade_personal_label: "כמה מילים ממני",
    handmade_personal_title: "אני כאן כדי להמתיק לכם את היום",
    handmade_personal_paragraph_1: "תמיד אהבתי לקחת רגע פשוט ולהפוך אותו למשהו קטן, מתוק ומרגש. בשבילי קינוח הוא לא רק טעם — הוא דרך לשמח, לרגש ולהשאיר זיכרון טוב.",
    handmade_personal_paragraph_2: "כל עוגייה, מארז וקינוח נוצרים מתוך אהבה לפרטים הקטנים, לאסתטיקה ולטעם מדויק.",
    handmade_personal_cta: "מוכנים לבחור את הרגע המתוק שלכם?",
    handmade_general_bullet_1: "רגעים יפים מתחילים בפרטים הקטנים.",
    handmade_general_bullet_2: "כל קינוח משלב טעם, יופי והמון מחשבה.",
    handmade_general_bullet_3: "התוצאה היא חוויה מתוקה שנשארת בלב.",
    handmade_button_text: "לצפייה במוצרים",
    handmade_button_anchor: "#products"
  };

  function settingOrDefault(settings, key) {
    return hasText(settings[key]) ? settings[key].trim() : HANDMADE_DEFAULTS[key];
  }

  function safeHandmadeButtonHref(value) {
    const href = hasText(value) ? value.trim() : "#products";
    if (href.startsWith("#") || href.startsWith("/") || /^https?:\/\//i.test(href)) return href;
    return "#products";
  }

  function applyHandmadeContent(settings) {
    const section = document.querySelector("[data-handmade-section]");
    if (!section) return;

    const mode = settingOrDefault(settings, "handmade_content_mode") === "general" ? "general" : "personal";
    const copy = section.querySelector("[data-handmade-copy]");
    if (!copy) return;

    const buttonText = settingOrDefault(settings, "handmade_button_text");
    const buttonAnchor = safeHandmadeButtonHref(settingOrDefault(settings, "handmade_button_anchor"));

    if (mode === "general") {
      const bullets = [
        settingOrDefault(settings, "handmade_general_bullet_1"),
        settingOrDefault(settings, "handmade_general_bullet_2"),
        settingOrDefault(settings, "handmade_general_bullet_3")
      ].filter(hasText);

      copy.classList.add("is-general-mode");
      copy.setAttribute("aria-label", "נקודות בולטות על עבודת היד");
      copy.innerHTML = `
        <ul class="handmade-general-list">
          ${bullets.map((text) => `<li><span>${escapeHtml(text)}</span></li>`).join("")}
        </ul>
        <a class="handmade-arrow-link" href="${escapeHtml(buttonAnchor)}" aria-label="${escapeHtml(buttonText)}">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="18" y1="4" x2="18" y2="30" stroke="#c8a96a" stroke-width="1.5" stroke-linecap="round"/>
            <polyline points="9,21 18,31 27,21" fill="none" stroke="#c8a96a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      `;
      return;
    }

    const label = settingOrDefault(settings, "handmade_personal_label");
    const title = settingOrDefault(settings, "handmade_personal_title");
    const paragraph1 = settingOrDefault(settings, "handmade_personal_paragraph_1");
    const paragraph2 = settingOrDefault(settings, "handmade_personal_paragraph_2");
    const cta = settingOrDefault(settings, "handmade_personal_cta");

    copy.classList.remove("is-general-mode");
    copy.setAttribute("aria-label", "כמה מילים מליאור");
    copy.innerHTML = `
      <p class="handmade-kicker">${escapeHtml(label)}</p>
      <h2 id="handmade-title">${escapeHtml(title)}</h2>
      <div class="handmade-body">
        ${[paragraph1, paragraph2].filter(hasText).map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
      </div>
      <p class="handmade-question">${escapeHtml(cta)}</p>
      <a class="handmade-arrow-link" href="${escapeHtml(buttonAnchor)}" aria-label="${escapeHtml(buttonText)}">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line x1="18" y1="4" x2="18" y2="30" stroke="#c8a96a" stroke-width="1.5" stroke-linecap="round"/>
          <polyline points="9,21 18,31 27,21" fill="none" stroke="#c8a96a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    `;
  }


  function applyContactSettings(settings) {
    const phone = normalizeWhatsappPhone(settings.whatsapp_number || "") || normalizeWhatsappPhone("972506422900");
    if (phone) {
      document.querySelectorAll("[data-phone-link]").forEach((link) => {
        link.href = `tel:+${phone}`;
        link.textContent = formatPhoneForDisplay(phone);
      });

      document.querySelectorAll("[data-whatsapp]").forEach((link) => {
        if (link.hasAttribute("data-order")) return;
        link.href = buildWhatsAppUrl(phone);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      });
    }

    if (typeof window.setLiorContactSettings === "function") {
      window.setLiorContactSettings({ whatsappNumber: phone });
    }

    if (hasText(settings.contact_email)) {
      const email = settings.contact_email.trim();
      document.querySelectorAll("[data-email-link]").forEach((link) => {
        link.href = `mailto:${email}`;
        link.textContent = email;
      });
    }

    if (hasText(settings.instagram_url)) {
      document.querySelectorAll(".instagram-btn").forEach((link) => {
        link.href = settings.instagram_url.trim();
      });
    }
  }

  function buildWhatsAppUrl(phone, productName = "") {
    const productLine = productName ? `מוצר / הזמנה: ${productName}` : "מוצר / הזמנה:";
    const message = `שלום ליאור, אשמח לבצע הזמנה מ־Lior's Pâtisserie.\n${productLine}\nכמות:\nשם מלא:\nטלפון:`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function applyImageSettings(settings) {
    IMAGE_SETTINGS.forEach((key) => {
      if (!hasText(settings[key])) return;
      document.querySelectorAll(`[data-cms-image="${key}"]`).forEach((img) => {
        setRemoteImageWithFallback(img, settings[key]);
      });
    });
  }

  async function loadSettings() {
    const client = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
    if (!client) return {};

    const keys = TEXT_SETTINGS.concat(IMAGE_SETTINGS);
    const { data, error } = await client
      .from("site_settings")
      .select("key,value")
      .in("key", keys);

    if (error || !Array.isArray(data)) return {};

    return data.reduce((acc, row) => {
      if (row && hasText(row.key) && hasText(row.value)) acc[row.key] = row.value;
      return acc;
    }, {});
  }

  function productImageValue(product) {
    if (hasText(product.image_url)) return normalizeProductMediaPath(product.image_url);
    return window.LIOR_IMAGE_PLACEHOLDER || "";
  }

  function productCardImageValue(product) {
    if (hasText(product.card_image_url)) return normalizeProductMediaPath(product.card_image_url);
    if (hasText(product.image_url)) return normalizeProductMediaPath(product.image_url);
    return window.LIOR_IMAGE_PLACEHOLDER || "";
  }


  /** True when a dedicated card file exists (not only falling back to full image_url). */
  function hasExplicitCardSource(product) {
    return hasText(product.card_image_url);
  }


  function isRemoteImageValue(value) {
    const s = String(value || "").trim();
    return /^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/");
  }

  function productSignatureValue(product) {
    return {
      id: product.id || "",
      name: String(product.name || "").trim(),
      description: String(product.description || "").trim(),
      price: String(product.price != null ? product.price : "").trim(),
      image_url: String(product.image_url || "").trim(),
      card_image_url: String(product.card_image_url || "").trim(),
      display_order: product.display_order || 0,
      is_active: product.is_active === true
    };
  }

  function hasDisplayablePrice(product) {
    const raw = product && product.price != null ? String(product.price).trim() : "";
    return raw.length > 0;
  }

  function formatProductPriceLabel(product) {
    const raw = String(product.price != null ? product.price : "").trim();
    if (!raw) return "";
    if (/[₪$€]|שח|ש״ח/i.test(raw)) return raw;
    if (/^\d+([.,]\d+)?$/.test(raw)) return `₪${raw}`;
    return raw;
  }

  function productsSignature(productsList) {
    return JSON.stringify(productsList.map(productSignatureValue));
  }

  function clearManagedProducts(grid) {
    const emptySignature = "managed-empty-products";
    if (grid.dataset.renderSignature === emptySignature) return;
    grid.innerHTML = "";
    grid.dataset.renderSignature = emptySignature;
    grid.dataset.productsSignature = emptySignature;
  }

  function buildProductCardHtml(product, globalIndex) {
    const fullImageValue = productImageValue(product);
    const cardImageValue = productCardImageValue(product);
    const srcAttr = hasText(cardImageValue) ? `src="${escapeHtml(cardImageValue)}" data-product-image="${escapeHtml(cardImageValue)}"` : "";
    const fullAttr = hasText(fullImageValue) ? `data-full-image="${escapeHtml(fullImageValue)}"` : "";
    const eagerFirst = hasText(product.card_image_url) && isRemoteImageValue(cardImageValue) && globalIndex < 4;
    const loadingAttr = eagerFirst ? "eager" : "lazy";
    const fetchPri = eagerFirst ? "high" : "low";

    const priceLabel = hasDisplayablePrice(product) ? formatProductPriceLabel(product) : "";
    const priceBlock = priceLabel
      ? `<p class="product-price"><span class="product-price-inner">${escapeHtml(priceLabel)}</span></p>`
      : "";

    return `
      <article class="product-card reveal is-visible" data-reveal-ready="true">
        <div class="product-image">
          <img ${srcAttr} ${fullAttr} alt="${escapeHtml(product.name || "")}" width="800" height="688" loading="${loadingAttr}" fetchpriority="${fetchPri}" decoding="async">
        </div>
        <div class="product-body">
          <h3>${escapeHtml(product.name || "")}</h3>
          ${priceBlock}
          <p>${escapeHtml(product.description || "")}</p>
          <button class="product-link add-to-cart-btn" type="button" data-add-to-cart data-product="${escapeHtml(product.name || "")}" aria-label="הוספה לסל: ${escapeHtml(product.name || "")}">+</button>
          <div class="cart-feedback" aria-live="polite"></div>
        </div>
      </article>
    `;
  }

  function hydrateGridImages(grid) {
    grid.querySelectorAll(".product-image img").forEach((img) => {
      // Skip images that are already fully handled
      if (img.dataset.imageReady === "true") return;
      if (img.dataset.imageQueued === "loaded" && img.dataset.imageObserved === "true") return;

      const srcAttr = (img.getAttribute("src") || "").trim();
      const isRemoteSrc = /^https?:\/\//i.test(srcAttr) || srcAttr.startsWith("//");

      if (isRemoteSrc) {
        const fullFb = (img.dataset.fullImage || "").trim();
        const normalizedFull = hasText(fullFb) ? normalizeProductMediaPath(fullFb) : "";
        const placeholder = window.LIOR_IMAGE_PLACEHOLDER || "";
        const fallbackOptions = [normalizedFull, placeholder].filter((url) => url && url !== srcAttr);
        let fallbackIndex = 0;

        img.onload = function () {
          img.dataset.imageReady = "true";
          img.dataset.loadedSrc = img.currentSrc || img.src || "";
          img.classList.add("is-loaded");
        };

        img.onerror = function () {
          if (fallbackIndex < fallbackOptions.length) {
            img.classList.remove("is-loaded");
            img.src = fallbackOptions[fallbackIndex];
            fallbackIndex += 1;
            return;
          }
          img.onerror = null;
        };

        if (img.complete && img.naturalWidth > 0) {
          img.dataset.imageReady = "true";
          img.dataset.loadedSrc = img.currentSrc || srcAttr;
          img.classList.add("is-loaded");
        }
        img.dataset.imageQueued = "loaded";
        img.dataset.imageObserved = "true";
        return;
      }

      // Local image — skip if already observed/queued
      if (img.dataset.imageObserved === "true") return;
      if (img.dataset.imageQueued === "loaded") return;

      const dataCard = (img.getAttribute("data-product-image") || "").trim();
      const fullFb = (img.dataset.fullImage || "").trim();
      const seed = dataCard || fullFb;
      if (!seed) return;

      const isEager =
        img.getAttribute("loading") === "eager" ||
        img.getAttribute("fetchpriority") === "high" ||
        img.fetchPriority === "high";

      if (isEager) {
        if (typeof window.setImageWithFallback === "function") {
          window.setImageWithFallback(img, seed);
        }
        img.dataset.imageQueued = "loaded";
        img.dataset.imageObserved = "true";
      }
      // Lazy local images: leave unset so IntersectionObserver handles them
    });
  }

  function renderCategoryGrid(gridId, products, startIndex) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const section = grid.closest(".category-section");
    if (!products.length) {
      clearManagedProducts(grid);
      if (section) section.hidden = true;
      return;
    }
    if (section) section.hidden = false;

    // Only rebuild DOM when the data has actually changed - avoids re-creating img elements
    // (which strips is-loaded and forces re-fetch) on every Supabase poll / page event
    const sig = productsSignature(products);
    if (grid.dataset.productsSignature === sig) {
      return;
    }

    grid.innerHTML = products.map((product, i) => buildProductCardHtml(product, startIndex + i)).join("");
    grid.dataset.productsSignature = sig;
    hydrateGridImages(grid);
  }

  function preloadImageUrl(url) {
    if (!url) return Promise.resolve();
    window.__liorPreloadedImages = window.__liorPreloadedImages || new Set();
    if (window.__liorPreloadedImages.has(url)) return Promise.resolve();
    window.__liorPreloadedImages.add(url);
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  function preloadProductImagesInBackground(urls) {
    const unique = Array.from(new Set(urls.filter(Boolean)));
    if (!unique.length) return;
    let index = 0;
    const batchSize = 2;
    function runBatch() {
      const batch = unique.slice(index, index + batchSize);
      index += batchSize;
      batch.forEach(preloadImageUrl);
      if (index < unique.length) {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(runBatch, { timeout: 1500 });
        } else {
          setTimeout(runBatch, 350);
        }
      }
    }
    if ("requestIdleCallback" in window) {
      requestIdleCallback(runBatch, { timeout: 1800 });
    } else {
      setTimeout(runBatch, 700);
    }
  }

  function productSeriesValue(product) {
    const raw = String(product && product.product_series || "").trim();
    if (["series_1", "series_2", "series_3", "none"].includes(raw)) return raw;
    const order = Number(product && product.display_order) || 0;
    if (order >= 10 && order <= 18) return "series_2";
    if (order >= 19) return "series_3";
    if (order > 0) return "series_1";
    return "none";
  }

  function productsForSeries(productsList, seriesValue) {
    return productsList.filter((product) => productSeriesValue(product) === seriesValue);
  }

  function renderManagedProducts(rows) {
    if (!Array.isArray(rows)) return;

    const activeProducts = rows
      .filter((product) => product && product.is_active === true && hasText(product.name) && productSeriesValue(product) !== "none")
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    const hasNewLayout = !!document.getElementById("productsGrid1");

    if (hasNewLayout) {
      const series1Products = productsForSeries(activeProducts, "series_1");
      const series2Products = productsForSeries(activeProducts, "series_2");
      const series3Products = productsForSeries(activeProducts, "series_3");
      renderCategoryGrid("productsGrid1", series1Products, 0);
      renderCategoryGrid("productsGrid2", series2Products, series1Products.length);
      renderCategoryGrid("productsGrid3", series3Products, series1Products.length + series2Products.length);
      refreshDynamicBehaviors();
      return;
    }

    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    if (!activeProducts.length) {
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = activeProducts.map((product, index) => buildProductCardHtml(product, index)).join("");
    hydrateGridImages(grid);
    refreshDynamicBehaviors();
  }

  async function loadProducts() {
    const client = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
    if (!client) return [];

    const { data, error } = await client
      .from("products")
      .select("id,name,description,price,image_url,card_image_url,is_active,display_order,product_series")
      .order("display_order", { ascending: true });

    if (error || !Array.isArray(data)) {
      if (typeof window.__liorRenderStaticProductsFallback === "function") {
        window.__liorRenderStaticProductsFallback();
      }
      return [];
    }
    renderManagedProducts(data);

    const activeForPreload = data.filter((p) => p && p.is_active === true && hasText(p.name || ""));
    const preloadUrls = activeForPreload
      .map((p) => hasText(p.card_image_url) ? normalizeProductMediaPath(p.card_image_url) : "")
      .filter(Boolean);
    const preloadSignature = JSON.stringify(preloadUrls);
    if (window.__liorLastPreloadSignature !== preloadSignature) {
      window.__liorLastPreloadSignature = preloadSignature;
      preloadProductImagesInBackground(preloadUrls);
    }

    return data;
  }

  function renderFeatures(rows) {
    const grid = document.getElementById("featuresGrid");
    if (!grid || !Array.isArray(rows) || !rows.length) return;

    const activeFeatures = rows
      .filter((feature) => feature && feature.is_active === true && hasText(feature.title) && hasText(feature.text))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (!activeFeatures.length) return;

    grid.innerHTML = activeFeatures.map((feature, index) => {
      const icon = hasText(feature.image_url)
        ? (() => {
            const fu = String(feature.image_url).trim();
            const src = isRemoteImageValue(fu) ? fu : normalizeProductMediaPath(fu);
            if (!src) return featureIconFallback(feature, index);
            return `<img src="${escapeHtml(src)}" alt="${escapeHtml(feature.title || "")}" loading="lazy" decoding="async">`;
          })()
        : featureIconFallback(feature, index);

      return `
        <article class="detail-card reveal">
          <div class="icon-circle" aria-hidden="true">${icon}</div>
          <h3>${escapeHtml(feature.title)}</h3>
          <p>${escapeHtml(feature.text)}</p>
        </article>
      `;
    }).join("");

    refreshDynamicBehaviors();
  }

  async function loadFeatures() {
    const client = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
    if (!client) return [];

    const { data, error } = await client
      .from("site_features")
      .select("id,title,text,image_url,is_active,display_order")
      .order("display_order", { ascending: true });

    if (error || !Array.isArray(data)) return [];
    renderFeatures(data);
    return data;
  }

  function refreshDynamicBehaviors() {
    if (typeof window.setupImages === "function") window.setupImages();
    if (typeof window.setupRevealAnimations === "function") window.setupRevealAnimations();
    if (typeof window.setupImageLightbox === "function" && !window.__liorImageLightboxInitialized) {
      window.setupImageLightbox();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadSiteContent() {
    try {
      const client = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
      if (!client) return;

      const settings = normalizeSettings(await loadSettings());
      applyTextSettings(settings);
      applyHandmadeContent(settings);
      applyContactSettings(settings);
      applyImageSettings(settings);
      await Promise.all([loadProducts(), loadFeatures()]);
    } catch (error) {
      console.warn("Supabase content could not be loaded. Local fallback content remains active.", error);
    }
  }

  window.loadSiteContent = loadSiteContent;
  window.loadProducts = loadProducts;
  window.loadSettings = loadSettings;

  document.addEventListener("DOMContentLoaded", loadSiteContent);
}());
