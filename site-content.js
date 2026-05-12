(function () {
  const IMAGE_SETTINGS = [
    "hero_image",
    "hero_logo_image",
    "handmade_image"
  ];
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

  const FEATURE_ICON_FALLBACK = `<svg class="pastry-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true"><path d="M16 9 L32 9 L28 33 L20 33 Z" fill="currentColor" opacity="0.88"/><path d="M16 9 Q24 6 32 9" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><path d="M20 33 L21.5 37 L26.5 37 L28 33" fill="none" stroke="currentColor" stroke-width="1" opacity="0.45"/><path d="M23 37 Q20 40 22 43 Q24 45 26 43 Q28 40 25 37" fill="none" stroke="currentColor" stroke-width="1" opacity="0.45"/></svg>`;

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
    const message = `שלום ליאור, אשמח לבצע הזמנה מ־Lior’s Pâtisserie.\n${productLine}\nכמות:\nשם מלא:\nטלפון:`;
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
        if (img.complete && img.naturalWidth > 0) {
          img.dataset.imageReady = "true";
          img.classList.add("is-loaded");
        } else if (!img.onload) {
          img.onload = function () {
            img.dataset.imageReady = "true";
            img.classList.add("is-loaded");
          };
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

  function renderManagedProducts(rows) {
    if (!Array.isArray(rows)) return;

    const activeProducts = rows
      .filter((product) => product && product.is_active === true && hasText(product.name))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    const hasNewLayout = !!document.getElementById("productsGrid1");

    if (hasNewLayout) {
      renderCategoryGrid("productsGrid1", activeProducts.slice(0, 6), 0);
      renderCategoryGrid("productsGrid2", activeProducts.slice(6, 12), 6);
      renderCategoryGrid("productsGrid3", activeProducts.slice(12, 18), 12);
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
      .select("id,name,description,price,image_url,card_image_url,is_active,display_order")
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

    grid.innerHTML = activeFeatures.map((feature) => {
      const icon = hasText(feature.image_url)
        ? (() => {
            const fu = String(feature.image_url).trim();
            const src = isRemoteImageValue(fu) ? fu : normalizeProductMediaPath(fu);
            return `<img src="${escapeHtml(src)}" alt="${escapeHtml(feature.title || "")}" loading="lazy" decoding="async">`;
          })()
        : FEATURE_ICON_FALLBACK;

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
