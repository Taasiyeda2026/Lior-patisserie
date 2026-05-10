(function () {
  const LOCAL_PRODUCT_DIR = "prdimages/";
  const IMAGE_SETTINGS = ["hero_image", "instagram_image"];
  const TEXT_SETTINGS = [
    "hero_title",
    "hero_subtitle",
    "hero_primary_button_text",
    "hero_secondary_button_text",
    "whatsapp_number",
    "instagram_url",
    "order_button_text",
    "pickup_delivery_text"
  ];

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
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

    img.classList.remove("is-loaded");
    img.onload = function () {
      img.classList.add("is-loaded");
    };
    img.onerror = function () {
      img.onerror = null;
      if (fallbackDataImg && typeof window.setImageWithFallback === "function") {
        window.setImageWithFallback(img, fallbackDataImg);
        return;
      }
      if (fallbackSrc) img.src = fallbackSrc;
    };
    img.src = imageUrl.trim();
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

    if (hasText(settings.instagram_url)) {
      document.querySelectorAll(".instagram-btn").forEach((link) => {
        link.href = settings.instagram_url.trim();
      });
    }
  }

  function buildWhatsAppUrl(phone, productName = "") {
    const productLine = productName ? `שם המוצר: ${productName}` : "שם המוצר:";
    const message = `שלום ליאור, אשמח לבצע הזמנה מ־Lior’s Pâtisserie.\n${productLine}\nכמות:\nתאריך רצוי:\nשם מלא:\nהערות:`;
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

  function renderManagedProducts(rows) {
    const grid = document.getElementById("productsGrid");
    if (!grid || !Array.isArray(rows)) return;

    const activeProducts = rows
      .filter((product) => product && product.is_active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (!rows.length) return;

    grid.innerHTML = activeProducts.map((product) => {
      const imageValue = productImageValue(product);
      const localFallback = getLocalProductImage(product.name || "");
      const localName = hasText(product.image_url) ? "" : imageValue;
      const srcAttr = hasText(product.image_url) ? `src="${escapeHtml(product.image_url)}" data-fallback-image="${escapeHtml(localFallback)}"` : "";
      const dataAttr = localName ? `data-product-image="${escapeHtml(localName)}"` : "";

      return `
        <article class="product-card reveal">
          <div class="product-image">
            <img ${srcAttr} ${dataAttr} alt="${escapeHtml(product.name || "")}" width="1200" height="1032" loading="lazy" decoding="async">
          </div>
          <div class="product-body">
            <h3>${escapeHtml(product.name || "")}</h3>
            <p>${escapeHtml(product.description || "")}</p>
            <a class="product-link" href="#" data-order data-product="${escapeHtml(product.name || "")}">
              להזמנה ←
            </a>
          </div>
        </article>
      `;
    }).join("");

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

      const settings = await loadSettings();
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
