(function () {
  const LOCAL_PRODUCT_DIR = "prdimages/";
  const IMAGE_SETTINGS = [
    "hero_image",
    "hero_logo_image"
  ];
  const TEXT_SETTINGS = [
    "hero_scroll_button_text",
    "flavors_title",
    "flavors_intro_primary",
    "flavors_intro_secondary",
    "flavors_badge_text",
    "flavors_order_button_text",
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
    "order_button_text",
    "hero_title",
    "hero_subtitle",
    "hero_primary_button_text",
    "pickup_delivery_text"
  ];

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  const LEGACY_TEXT_KEY_ALIASES = {
    hero_title: "flavors_title",
    hero_subtitle: "flavors_intro_primary",
    hero_primary_button_text: "flavors_order_button_text",
    pickup_delivery_text: "contact_text"
  };

  function normalizeSettings(settings) {
    const normalized = { ...settings };
    Object.entries(LEGACY_TEXT_KEY_ALIASES).forEach(([legacyKey, currentKey]) => {
      if (!hasText(normalized[currentKey]) && hasText(normalized[legacyKey])) {
        normalized[currentKey] = normalized[legacyKey];
      }
    });
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

  function setRemoteImageWithFallback(img, imageUrl) {
    if (!img || !hasText(imageUrl)) return;

    const fallbackSrc = img.getAttribute("src") || "";
    const fallbackDataImg = img.dataset.img || img.dataset.productImage || "";

    const nextSrc = imageUrl.trim();
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
      if (fallbackSrc) img.src = fallbackSrc;
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

      document.querySelectorAll("[data-whatsapp], [data-order]").forEach((link) => {
        if (!link.hasAttribute("data-order")) {
          link.href = buildWhatsAppUrl(phone);
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
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
    if (hasText(product.image_url)) return product.image_url.trim();
    return getLocalProductImage(product.name || "");
  }


  function productSignatureValue(product) {
    return {
      id: product.id || "",
      name: String(product.name || "").trim(),
      description: String(product.description || "").trim(),
      image_url: String(product.image_url || "").trim(),
      display_order: product.display_order || 0,
      is_active: product.is_active !== false
    };
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
    if (!rows.length) return;

    const activeProducts = rows
      .filter((product) => product && product.is_active !== false && hasText(product.name))
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

    const nextHtml = activeProducts.map((product) => {
      const imageValue = productImageValue(product);
      const localFallback = getLocalProductImage(product.name || "");
      const localName = hasText(product.image_url) ? "" : imageValue;
      const srcAttr = hasText(product.image_url) ? `src="${escapeHtml(product.image_url)}" data-fallback-image="${escapeHtml(localFallback)}"` : "";
      const dataAttr = localName ? `data-product-image="${escapeHtml(localName)}"` : "";

      return `
        <article class="product-card reveal is-visible" data-reveal-ready="true">
          <div class="product-image">
            <img ${srcAttr} ${dataAttr} alt="${escapeHtml(product.name || "")}" width="1200" height="1032" loading="lazy" decoding="async">
          </div>
          <div class="product-body">
            <h3>${escapeHtml(product.name || "")}</h3>
            <p>${escapeHtml(product.description || "")}</p>
            <a class="product-link" href="#" data-order data-product="${escapeHtml(product.name || "")}">🛒</a>
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

    grid.querySelectorAll("img[data-fallback-image]").forEach((img) => {
      const fallback = img.dataset.fallbackImage;
      if (!fallback) return;
      img.onerror = function () {
        img.onerror = null;
        if (typeof window.setImageWithFallback === "function") {
          window.setImageWithFallback(img, fallback);
        }
      };
    });

    refreshDynamicBehaviors();
  }

  async function loadProducts() {
    const client = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
    if (!client) return [];

    const { data, error } = await client
      .from("products")
      .select("id,name,description,price,image_url,is_active,display_order")
      .order("display_order", { ascending: true });

    if (error || !Array.isArray(data)) return [];
    renderManagedProducts(data);
    return data;
  }

  function renderFeatures(rows) {
    const grid = document.getElementById("featuresGrid");
    if (!grid || !Array.isArray(rows) || !rows.length) return;

    const activeFeatures = rows
      .filter((feature) => feature && feature.is_active !== false && hasText(feature.title) && hasText(feature.text))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (!activeFeatures.length) return;

    grid.innerHTML = activeFeatures.map((feature) => {
      const icon = hasText(feature.image_url)
        ? `<img src="${escapeHtml(feature.image_url)}" alt="" loading="lazy" decoding="async">`
        : "✦";

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
    if (typeof window.setupImageLightbox === "function") window.setupImageLightbox();
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
