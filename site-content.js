(function () {
  const LOCAL_PRODUCT_DIR = "prdimages/";
  const IMAGE_SETTINGS = [
    "hero_image",
    "hero_logo_image"
  ];
  const TEXT_SETTINGS = [
    "flavors_title",
    "flavors_intro_primary",
    "flavors_intro_secondary",
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
    try {
      if (Array.isArray(products)) return products;
    } catch (error) {
      return [];
    }
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

  function getLocalProductImage(productName) {
    const match = fallbackProducts().find((item) => item.name === productName);
    return match ? match.image : "";
  }

  function getLocalProductCardImage(productName) {
    const match = fallbackProducts().find((item) => item.name === productName);
    if (!match) return "";
    return match.cardImage || match.image || "";
  }

  function normalizeProductMediaPath(value) {
    if (!hasText(value)) return "";
    const trimmed = String(value).trim();
    if (typeof window.normalizeImagePath === "function") {
      return window.normalizeImagePath(trimmed);
    }
    let p = trimmed.replace(/\\/g, "/").replace(/^\.\/+/, "");
    while (/^prdimages\/prdimages\//i.test(p)) {
      p = p.replace(/^prdimages\//i, "");
    }
    if (!p) return "";
    if (/^https?:\/\//i.test(p) || p.startsWith("//") || p.startsWith("/")) return p;
    if (/^prdimages\//i.test(p)) return p.replace(/^prdimages\//i, "prdimages/");
    if (/^(assets|images|attached_assets)\//i.test(p)) return p;
    return `prdimages/${p}`;
  }

  function setRemoteImageWithFallback(img, imageUrl) {
    if (!img || !hasText(imageUrl)) return;

    const fallbackSrc = img.getAttribute("src") || "";
    const fallbackDataImg = img.dataset.img || img.dataset.productImage || "";
    const placeholder = window.LIOR_IMAGE_PLACEHOLDER || "";

    const nextSrc = normalizeProductMediaPath(imageUrl);
    img.onload = function () {
      img.classList.add("is-loaded");
    };

    if (img.getAttribute("src") === nextSrc) {
      if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
      return;
    }
    img.onerror = function () {
      img.onerror = null;
      if (fallbackDataImg && typeof window.setImageWithFallback === "function") {
        window.setImageWithFallback(img, fallbackDataImg);
        return;
      }
      if (fallbackSrc) {
        img.src = fallbackSrc;
        return;
      }
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
    const localImage = getLocalProductImage(product.name || "");
    if (hasText(localImage)) return normalizeProductMediaPath(localImage);
    if (hasText(product.image_url)) return normalizeProductMediaPath(product.image_url);
    return "";
  }

  function remapLegacyCardFilename(path) {
    return String(path || "")
      .trim()
      .replace(/A(\d+)-card\.webp/gi, "A$1.webp");
  }

  function productCardImageValue(product) {
    if (hasText(product.card_image_url)) {
      const c = remapLegacyCardFilename(String(product.card_image_url).trim());
      return normalizeProductMediaPath(c);
    }
    const localCardImage = getLocalProductCardImage(product.name || "");
    if (hasText(localCardImage)) return normalizeProductMediaPath(localCardImage);
    return productImageValue(product);
  }

  /** True when a dedicated card file exists (not only falling back to full image_url). */
  function hasExplicitCardSource(product) {
    if (hasText(product.card_image_url)) return true;
    const match = fallbackProducts().find((item) => item.name === product.name);
    return !!(match && hasText(match.cardImage));
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

  function renderManagedProducts(rows) {
    const grid = document.getElementById("productsGrid");
    if (!grid || !Array.isArray(rows)) return;
    if (!rows.length) {
      clearManagedProducts(grid);
      return;
    }

    const activeProducts = rows
      .filter((product) => product && product.is_active === true && hasText(product.name))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (!activeProducts.length) {
      clearManagedProducts(grid);
      return;
    }

    const nextSignature = productsSignature(activeProducts);
    const previousSignature = grid.dataset.renderSignature || grid.dataset.productsSignature || "";
    if (nextSignature && nextSignature === previousSignature) {
      grid.dataset.renderSignature = nextSignature;
      grid.dataset.productsSignature = nextSignature;
      return;
    }

    const nextHtml = activeProducts.map((product, index) => {
      const fullImageValue = productImageValue(product);
      const cardImageValue = productCardImageValue(product);
      const fullForLightbox = hasText(fullImageValue) ? fullImageValue : cardImageValue;
      const explicitCard = hasExplicitCardSource(product);
      const isRemoteGrid = isRemoteImageValue(cardImageValue);

      let srcAttr = "";
      let dataAttr = "";
      if (hasText(cardImageValue)) {
        if (explicitCard && isRemoteGrid) {
          srcAttr = `src="${escapeHtml(cardImageValue)}"`;
        } else {
          dataAttr = `data-product-image="${escapeHtml(cardImageValue)}"`;
        }
      }

      const fullAttr = hasText(fullForLightbox) ? `data-full-image="${escapeHtml(fullForLightbox)}"` : "";

      const eagerFirst = explicitCard && isRemoteGrid && index < 4;
      const loadingAttr = eagerFirst ? "eager" : "lazy";
      const fetchPri = eagerFirst ? "high" : "low";

      const priceLabel = hasDisplayablePrice(product) ? formatProductPriceLabel(product) : "";
      const priceBlock = priceLabel
        ? `<p class="product-price"><span class="product-price-inner">${escapeHtml(priceLabel)}</span></p>`
        : "";

      return `
        <article class="product-card reveal is-visible" data-reveal-ready="true">
          <div class="product-image">
            <img ${srcAttr} ${dataAttr} ${fullAttr} alt="${escapeHtml(product.name || "")}" width="800" height="688" loading="${loadingAttr}" fetchpriority="${fetchPri}" decoding="async">
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
    }).join("");

    if (grid.innerHTML.trim() === nextHtml.trim()) {
      grid.dataset.renderSignature = nextSignature;
      grid.dataset.productsSignature = nextSignature;
      return;
    }

    grid.innerHTML = nextHtml;
    grid.dataset.renderSignature = nextSignature;
    grid.dataset.productsSignature = nextSignature;

    grid.querySelectorAll(".product-image img").forEach((img) => {
      const dataCard = (img.getAttribute("data-product-image") || "").trim();
      const srcAttr = (img.getAttribute("src") || "").trim();
      const primary =
        dataCard || (/^https?:\/\//i.test(srcAttr) || srcAttr.startsWith("//") ? srcAttr : "");
      const fullFb = (img.dataset.fullImage || "").trim();
      const seed = primary || fullFb;
      if (typeof window.setImageWithFallback === "function" && seed) {
        window.setImageWithFallback(img, seed);
      } else if (window.LIOR_IMAGE_PLACEHOLDER) {
        img.src = window.LIOR_IMAGE_PLACEHOLDER;
        img.classList.add("is-loaded");
      }
      img.dataset.imageQueued = "loaded";
      img.dataset.imageObserved = "true";
    });

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
