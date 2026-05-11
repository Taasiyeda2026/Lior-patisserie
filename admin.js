const WEBP_QUALITY = 0.82;
const BUCKET = (window.LIOR_SUPABASE_CONFIG && window.LIOR_SUPABASE_CONFIG.STORAGE_BUCKET) || "site-images";

let adminProductsCache = [];

const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_LAST_ACTIVITY_KEY = "liorAdminLastActivity";
const ADMIN_IDLE_LOCK_MESSAGE = "האדמין ננעל לאחר 15 דקות ללא פעילות. יש להתחבר מחדש.";
const ADMIN_ACTIVITY_MOUSEMOVE_THROTTLE_MS = 1000;

const ADMIN_ACTIVITY_EVENT_OPTS = { capture: true, passive: true };

let adminIdleTimeoutId = null;
let adminIdleListenersAttached = false;
let adminIdleTracking = false;
let adminIdleMouseThrottleAt = 0;
let adminIdleLocking = false;

function onAdminWindowActivity(event) {
  if (!adminIdleTracking || adminIdleLocking) return;
  if (event && event.type === "mousemove") {
    const now = Date.now();
    if (now - adminIdleMouseThrottleAt < ADMIN_ACTIVITY_MOUSEMOVE_THROTTLE_MS) return;
    adminIdleMouseThrottleAt = now;
  }
  resetAdminIdleTimer();
}

function attachAdminIdleListeners() {
  if (adminIdleListenersAttached) return;
  const types = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
  types.forEach((type) => {
    window.addEventListener(type, onAdminWindowActivity, ADMIN_ACTIVITY_EVENT_OPTS);
  });
  adminIdleListenersAttached = true;
}

function detachAdminIdleListeners() {
  if (!adminIdleListenersAttached) return;
  const types = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
  types.forEach((type) => {
    window.removeEventListener(type, onAdminWindowActivity, ADMIN_ACTIVITY_EVENT_OPTS);
  });
  adminIdleListenersAttached = false;
}

function clearAdminPasswordField() {
  const input = document.getElementById("adminPassword");
  if (input) input.value = "";
}

function resetAdminIdleTimer() {
  if (!adminIdleTracking || adminIdleLocking) return;
  sessionStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
  if (adminIdleTimeoutId !== null) {
    clearTimeout(adminIdleTimeoutId);
    adminIdleTimeoutId = null;
  }
  adminIdleTimeoutId = window.setTimeout(() => {
    adminIdleTimeoutId = null;
    lockAdminDueToInactivity();
  }, ADMIN_IDLE_TIMEOUT_MS);
}

function startAdminIdleTimer() {
  adminIdleTracking = true;
  adminIdleLocking = false;
  attachAdminIdleListeners();
  resetAdminIdleTimer();
}

function stopAdminIdleTimer() {
  adminIdleTracking = false;
  if (adminIdleTimeoutId !== null) {
    clearTimeout(adminIdleTimeoutId);
    adminIdleTimeoutId = null;
  }
  detachAdminIdleListeners();
}

async function lockAdminDueToInactivity() {
  if (adminIdleLocking) return;
  adminIdleLocking = true;
  stopAdminIdleTimer();

  try {
    await client().auth.signOut();
  } catch {
  }

  sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  clearAdminPasswordField();
  closeProductDrawer();
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) logoutBtn.classList.add("hidden");
  showLoginScreen();
  showLoginError(ADMIN_IDLE_LOCK_MESSAGE);
  adminIdleLocking = false;
}

function client() {
  const supabaseClient = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
  if (!supabaseClient) throw new Error("חסרים SUPABASE_URL או SUPABASE_ANON_KEY בקובץ supabase-config.js");
  return supabaseClient;
}

/** Same legacy rule as site-content: *-card.webp → *.webp under cards/. */
function remapLegacyAdminImagePath(path) {
  return String(path || "").trim().replace(/A(\d+)-card\.webp$/i, "A$1.webp");
}

/** Resolve admin/public display URL (https, /, prdimages/, assets/, bare filename → prdimages/). */
function adminMediaPreviewUrl(raw) {
  const s = remapLegacyAdminImagePath(String(raw || "").trim());
  if (!s) return "";
  if (typeof window.normalizeImagePath === "function") return window.normalizeImagePath(s);
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/")) return s;
  if (/^prdimages\//i.test(s)) return s.replace(/^prdimages\//i, "prdimages/");
  if (/^(assets|images|attached_assets)\//i.test(s)) return s;
  return `prdimages/${s}`;
}

/**
 * Resolve image refs for admin previews (normalizeImagePath via adminMediaPreviewUrl).
 * Full Supabase/https URLs pass through; local filenames and paths are normalized.
 * @param {string} url - raw DB value
 * @param {{ whenEmpty?: string }} [opts] - default whenEmpty is assets/logo.png (settings); use "" for product/grid shells (text placeholder only).
 */
function adminPreviewSrc(url, opts) {
  const whenEmpty =
    opts && typeof opts === "object" && opts.whenEmpty !== undefined ? opts.whenEmpty : "assets/logo.png";
  const raw = String(url || "").trim();
  if (!raw) return whenEmpty;
  const resolved = adminMediaPreviewUrl(raw);
  return resolved || whenEmpty;
}

function getAdminPreviewShellRaw(shell) {
  if (!shell) return "";
  const row = shell.closest(".product-row, .feature-row, .gallery-row, .product-drawer-form");
  if (shell.dataset.previewField) {
    const tools = shell.closest(".image-tools");
    const primary = tools?.querySelector(`[data-field="${shell.dataset.previewField}"]`);
    let raw = primary ? primary.value.trim() : "";
    if (!raw && shell.dataset.previewFallbackField) {
      const fb = row?.querySelector(`[data-field="${shell.dataset.previewFallbackField}"]`);
      if (fb) raw = fb.value.trim();
    }
    return raw;
  }
  if (shell.dataset.settingPreview) {
    const input = shell.closest("label")?.querySelector(`[data-setting="${shell.dataset.settingPreview}"]`);
    return input ? input.value.trim() : "";
  }
  return "";
}

function syncAdminPreviewShell(shell) {
  if (!shell) return;
  const img = shell.querySelector(".preview");
  const ph = shell.querySelector(".admin-preview-placeholder");
  if (!img || !ph) return;

  const raw = getAdminPreviewShellRaw(shell);
  const url = adminPreviewSrc(raw, { whenEmpty: "" });

  img.onload = null;
  img.onerror = null;

  if (!url) {
    img.removeAttribute("src");
    img.alt = "";
    shell.classList.remove("has-image");
    ph.hidden = false;
    return;
  }

  img.onload = function () {
    if (img.naturalWidth > 0) {
      shell.classList.add("has-image");
      ph.hidden = true;
    }
  };
  img.onerror = function () {
    img.removeAttribute("src");
    shell.classList.remove("has-image");
    ph.hidden = false;
  };

  shell.classList.remove("has-image");
  ph.hidden = true;

  if (img.getAttribute("src") === url && img.complete && img.naturalWidth > 0) {
    shell.classList.add("has-image");
    ph.hidden = true;
    return;
  }

  img.src = url;
}

function initAdminPreviewShells(root) {
  const el = root && root.querySelectorAll ? root : document;
  el.querySelectorAll(".admin-preview-shell").forEach(syncAdminPreviewShell);
}

function showNotice(scope, message, ok = true) {
  document.querySelectorAll(`[data-notice="${scope}"]`).forEach((el) => {
    el.textContent = message;
    el.className = `notice is-visible ${ok ? "ok" : "error"}`;
  });
}

function showUploadMessage(message, ok = false) {
  const visibleNotice = Array.from(document.querySelectorAll(".notice")).find((el) => el.classList.contains("is-visible"));
  if (visibleNotice) {
    visibleNotice.textContent = message;
    visibleNotice.className = `notice is-visible ${ok ? "ok" : "error"}`;
    return;
  }
  const loginNotice = document.getElementById("loginNotice");
  if (loginNotice) {
    loginNotice.textContent = message;
    loginNotice.className = `notice is-visible ${ok ? "ok" : "error"}`;
  }
}

function showLoginError(message) {
  const notice = document.getElementById("loginNotice");
  if (!notice) return;
  notice.textContent = message;
  notice.className = "notice is-visible error";
}

function showAdminApp() {
  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("adminApp").classList.remove("hidden");
}

function showLoginScreen() {
  document.getElementById("adminApp").classList.add("hidden");
  document.getElementById("loginCard").classList.remove("hidden");
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) logoutBtn.classList.add("hidden");
  const notice = document.getElementById("loginNotice");
  if (notice) notice.className = "notice error";
}

function cleanFileName(name) {
  const base = String(name || "image")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";
  return `${base}-${new Date().toISOString().replace(/[^0-9]/g, "")}.webp`;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("לא ניתן לקרוא את קובץ התמונה"));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function convertImageToWebP(file, maxWidth) {
  const image = await readImage(file);
  const width = Math.min(image.width, Number(maxWidth) || image.width);
  const height = Math.round(image.height * (width / image.width));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  URL.revokeObjectURL(image.src);

  if (!webpBlob || webpBlob.type !== "image/webp") {
    showUploadMessage("הדפדפן לא תומך בהמרה ל־WebP. הקובץ המקורי יועלה כגיבוי בלבד.", false);
    return { blob: file, extension: file.name.split(".").pop() || "image", contentType: file.type || "application/octet-stream" };
  }

  return { blob: webpBlob, extension: "webp", contentType: "image/webp" };
}

async function uploadImageAsWebP(file, folder, maxWidth) {
  if (!file) return "";
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || "")) {
    throw new Error("ניתן להעלות רק PNG, JPG, JPEG או WEBP");
  }

  const converted = await convertImageToWebP(file, maxWidth);
  const finalName = converted.extension === "webp" ? cleanFileName(file.name) : `${cleanFileName(file.name).replace(/\.webp$/, "")}.${converted.extension}`;
  const path = `${folder || "gallery"}/${finalName}`;
  const { error } = await client().storage.from(BUCKET).upload(path, converted.blob, {
    contentType: converted.contentType,
    upsert: false
  });
  if (error) throw error;

  const { data } = client().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function loadSettings() {
  const { data, error } = await client().from("site_settings").select("key,value");
  if (error) throw error;
  (data || []).forEach((row) => {
    const input = document.querySelector(`[data-setting="${row.key}"]`);
    if (input) input.value = row.value || "";
  });
  document.querySelectorAll(".admin-preview-shell[data-setting-preview]").forEach(syncAdminPreviewShell);
}

async function saveSettings(scope = "hero-settings", root = document) {
  const inputs = Array.from(root.querySelectorAll("[data-setting]"));
  const rows = inputs.map((input) => ({
    key: input.dataset.setting,
    value: input.value.trim(),
    updated_at: new Date().toISOString()
  }));
  if (!rows.length) return;
  const { error } = await client().from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  showNotice(scope, "ההגדרות נשמרו בהצלחה");
}

function productGridCardTemplate(product) {
  const id = product.id;
  const isActive = product.is_active !== false;
  const nameRaw = String(product.name || "").trim() || "ללא שם";
  const name = escapeHtml(nameRaw);
  const priceRaw = product.price != null ? String(product.price).trim() : "";
  const priceHtml = priceRaw ? `<span class="product-grid-card-price">${escapeHtml(priceRaw)}</span>` : "";
  const badge = isActive ? "" : `<span class="product-grid-card-badge">מוסתר</span>`;
  return `<button type="button" class="product-grid-card${isActive ? "" : " product-grid-card--inactive"}" data-product-id="${escapeHtml(String(id))}" aria-label="עריכה: ${name}">
    <div class="product-grid-card-visual">
      <img class="product-grid-card-img" alt="" loading="lazy" decoding="async">
      <span class="product-grid-card-noimg" hidden>אין תמונה</span>
    </div>
    <div class="product-grid-card-meta">
      <span class="product-grid-card-name">${name}</span>
      ${priceHtml}
      ${badge}
    </div>
  </button>`;
}

function hydrateProductGridCards(container) {
  container.querySelectorAll(".product-grid-card").forEach((card) => {
    const id = card.dataset.productId;
    const product = adminProductsCache.find((p) => String(p.id) === String(id));
    const img = card.querySelector(".product-grid-card-img");
    const ph = card.querySelector(".product-grid-card-noimg");
    if (!img || !ph) return;
    if (!product) {
      img.removeAttribute("src");
      img.classList.add("is-hidden");
      ph.hidden = false;
      return;
    }
    const raw = String(product.card_image_url || "").trim() || String(product.image_url || "").trim();
    const url = adminPreviewSrc(raw, { whenEmpty: "" });
    img.onload = null;
    img.onerror = null;
    if (!url) {
      img.removeAttribute("src");
      img.classList.add("is-hidden");
      ph.hidden = false;
      return;
    }
    ph.hidden = true;
    img.classList.remove("is-hidden");
    img.alt = String(product.name || "");
    img.onload = function () {
      if (img.naturalWidth > 0) ph.hidden = true;
    };
    img.onerror = function () {
      img.removeAttribute("src");
      img.classList.add("is-hidden");
      ph.hidden = false;
    };
    img.src = url;
  });
}

function refreshProductDrawerFormIfOpen() {
  const drawer = document.getElementById("productDrawer");
  if (!drawer || !drawer.classList.contains("is-open")) return;
  const form = document.getElementById("productDrawerForm");
  const id = form && form.dataset.productId;
  if (!id) return;
  const fresh = adminProductsCache.find((p) => String(p.id) === String(id));
  if (!fresh) return;
  const body = document.getElementById("productDrawerBody");
  const title = document.getElementById("productDrawerTitle");
  if (title) title.textContent = "עריכת מוצר";
  if (body) {
    body.innerHTML = productDrawerFormTemplate(fresh);
    initAdminPreviewShells(body);
  }
}

function openProductDrawer(product) {
  const drawer = document.getElementById("productDrawer");
  const backdrop = document.getElementById("productDrawerBackdrop");
  const title = document.getElementById("productDrawerTitle");
  const body = document.getElementById("productDrawerBody");
  if (!drawer || !backdrop || !body || !title) return;

  let p;
  let heading;
  if (!product) {
    const nextOrder = adminProductsCache.length
      ? Math.max(...adminProductsCache.map((x) => Number(x.display_order) || 0)) + 1
      : 0;
    p = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: "",
      image_url: "",
      card_image_url: "",
      display_order: nextOrder,
      is_active: true
    };
    heading = "מוצר חדש";
  } else {
    p = { ...product };
    heading = adminProductsCache.some((x) => String(x.id) === String(product.id)) ? "עריכת מוצר" : "מוצר חדש";
  }

  title.textContent = heading;
  body.innerHTML = productDrawerFormTemplate(p);
  initAdminPreviewShells(body);

  backdrop.hidden = false;
  drawer.hidden = false;
  backdrop.classList.add("is-open");
  drawer.classList.add("is-open");
  backdrop.setAttribute("aria-hidden", "false");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-product-drawer");

  setTimeout(() => body.querySelector('[data-field="name"]')?.focus(), 0);
}

function closeProductDrawer() {
  const drawer = document.getElementById("productDrawer");
  const backdrop = document.getElementById("productDrawerBackdrop");
  const body = document.getElementById("productDrawerBody");
  if (!drawer || !backdrop) return;
  backdrop.classList.remove("is-open");
  drawer.classList.remove("is-open");
  backdrop.hidden = true;
  drawer.hidden = true;
  backdrop.setAttribute("aria-hidden", "true");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-product-drawer");
  if (body) body.innerHTML = "";
}

function productDrawerFormTemplate(product = {}) {
  const id = product.id || crypto.randomUUID();
  const isActive = product.is_active !== false;
  const priceVal = product.price != null ? String(product.price) : "";
  return `<form id="productDrawerForm" class="product-drawer-form" data-product-id="${escapeHtml(String(id))}">
    <div class="product-drawer-fields">
      <label class="field-label">שם הטעם <input data-field="name" value="${escapeHtml(product.name || "")}"></label>
      <label class="field-label">סדר תצוגה <input data-field="display_order" type="number" value="${Number(product.display_order) || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${isActive ? "selected" : ""}>כן</option><option value="false" ${!isActive ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">מחיר (אופציונלי) <input data-field="price" type="text" value="${escapeHtml(priceVal)}" placeholder="למשל 28 או ₪28"></label>
      <label class="field-label wide">תיאור <textarea data-field="description" rows="4">${escapeHtml(product.description || "")}</textarea></label>
      <label class="field-label wide">תמונה מלאה
        <div class="image-tools product-drawer-image-tools">
          <div class="admin-preview-shell" data-preview-field="image_url">
            <img class="preview" alt="">
            <span class="admin-preview-placeholder">אין תמונה</span>
          </div>
          <div>
            <input data-field="image_url" value="${escapeHtml(product.image_url || "")}" placeholder="כתובת תמונה מלאה או העלאה">
            <input data-product-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
      <label class="field-label wide">תמונת כרטיס
        <div class="image-tools product-drawer-image-tools">
          <div class="admin-preview-shell" data-preview-field="card_image_url" data-preview-fallback-field="image_url">
            <img class="preview" alt="">
            <span class="admin-preview-placeholder">אין תמונה</span>
          </div>
          <div>
            <input data-field="card_image_url" value="${escapeHtml(product.card_image_url || "")}" placeholder="כתובת תמונה או העלאה">
            <input data-product-card-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <div class="product-drawer-actions">
      <button class="admin-button" type="button" data-save-product-drawer>שמירת מוצר</button>
      <button class="admin-button ${isActive ? "muted" : "secondary"}" type="button" data-toggle-product data-active="${isActive}">${isActive ? "הסתר מהאתר" : "הצג באתר"}</button>
    </div>
  </form>`;
}

async function loadProducts() {
  const { data, error } = await client().from("products").select("*").order("display_order", { ascending: true });
  if (error) {
    showNotice("products", "שגיאה בטעינת המוצרים: " + error.message, false);
    return;
  }

  const supabaseProducts = data || [];
  const container = document.getElementById("productsAdmin");
  adminProductsCache = supabaseProducts;

  if (!supabaseProducts.length) {
    container.innerHTML =
      '<p class="hint admin-empty-hint">אין מוצרים במסד הנתונים. אפשר להוסיף מוצרים כאן או להריץ את קובץ seed-content.sql בפרויקט Supabase לנתוני פתיחה בלבד.</p>';
    refreshProductDrawerFormIfOpen();
    return;
  }

  container.innerHTML = supabaseProducts.map(productGridCardTemplate).join("");
  hydrateProductGridCards(container);
  refreshProductDrawerFormIfOpen();
}

async function saveProduct(root) {
  const payload = rowPayload(root, "product");
  const { error } = await client().from("products").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  const toggleBtn = root.querySelector("[data-toggle-product]");
  if (toggleBtn) {
    toggleBtn.dataset.active = String(payload.is_active);
    toggleBtn.textContent = payload.is_active ? "הסתר מהאתר" : "הצג באתר";
    toggleBtn.className = `admin-button ${payload.is_active ? "muted" : "secondary"}`;
  }
  await loadProducts();
  showNotice("products", "המוצר נשמר בהצלחה");
}

async function toggleProductActive(root) {
  const id = root.dataset.productId;
  const btn = root.querySelector("[data-toggle-product]");
  const select = root.querySelector('[data-field="is_active"]');
  const currentActive = btn.dataset.active === "true";
  const newActive = !currentActive;

  const { error } = await client()
    .from("products")
    .update({ is_active: newActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  btn.dataset.active = String(newActive);
  btn.textContent = newActive ? "הסתר מהאתר" : "הצג באתר";
  btn.className = `admin-button ${newActive ? "muted" : "secondary"}`;
  if (select) select.value = String(newActive);
  await loadProducts();
  showNotice("products", newActive ? "המוצר מוצג באתר" : "המוצר הוסתר מהאתר");
}

function featureTemplate(feature = {}) {
  const id = feature.id || crypto.randomUUID();
  const isActive = feature.is_active !== false;
  return `<article class="feature-row${isActive ? "" : " product-inactive"}" data-feature-id="${id}">
    <div class="grid">
      <label class="field-label">כותרת <input data-field="title" value="${escapeHtml(feature.title || "")}"></label>
      <label class="field-label">סדר <input data-field="display_order" type="number" value="${feature.display_order || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${isActive ? "selected" : ""}>כן</option><option value="false" ${!isActive ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">טקסט <textarea data-field="text">${escapeHtml(feature.text || "")}</textarea></label>
      <label class="field-label wide">תמונה (אופציונלי)
        <div class="image-tools">
          <div class="admin-preview-shell" data-preview-field="image_url">
            <img class="preview" alt="">
            <span class="admin-preview-placeholder">אין תמונה זמינה</span>
          </div>
          <div>
            <input data-field="image_url" value="${escapeHtml(feature.image_url || "")}" placeholder="כתובת תמונה">
            <input data-feature-upload data-folder="icons" data-max-width="500" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <div class="product-actions">
      <button class="admin-button" type="button" data-save-feature>שמירה</button>
      <button class="admin-button ${isActive ? "muted" : "secondary"}" type="button" data-toggle-feature data-active="${isActive}">${isActive ? "הסתר מהאתר" : "הצג באתר"}</button>
    </div>
  </article>`;
}

function galleryTemplate(imageRow = {}) {
  const id = imageRow.id || crypto.randomUUID();
  const isActive = imageRow.is_active !== false;
  return `<article class="gallery-row${isActive ? "" : " product-inactive"}" data-gallery-id="${id}">
    <div class="grid">
      <label class="field-label">כותרת (פנימית) <input data-field="title" value="${escapeHtml(imageRow.title || "")}" placeholder="כותרת"></label>
      <label class="field-label">סדר <input data-field="display_order" type="number" value="${imageRow.display_order || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${isActive ? "selected" : ""}>כן</option><option value="false" ${!isActive ? "selected" : ""}>לא</option></select></label>
      <label class="field-label wide">טקסט חלופי (alt) <input data-field="alt_text" value="${escapeHtml(imageRow.alt_text || "")}" placeholder="תיאור לנגישות"></label>
      <label class="field-label wide">תמונה
        <div class="image-tools">
          <div class="admin-preview-shell" data-preview-field="image_url">
            <img class="preview" alt="">
            <span class="admin-preview-placeholder">אין תמונה זמינה</span>
          </div>
          <div>
            <input data-field="image_url" value="${escapeHtml(imageRow.image_url || "")}" placeholder="כתובת תמונה">
            <input data-gallery-upload data-folder="gallery" data-max-width="1200" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <div class="product-actions">
      <button class="admin-button" type="button" data-save-gallery>שמירה</button>
      <button class="admin-button ${isActive ? "muted" : "secondary"}" type="button" data-toggle-gallery data-active="${isActive}">${isActive ? "הסתר מהאתר" : "הצג באתר"}</button>
      <button class="admin-button danger-outline" type="button" data-delete-gallery>מחיקה מהמסד</button>
    </div>
  </article>`;
}

async function loadFeatures() {
  const { data, error } = await client().from("site_features").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  const featEl = document.getElementById("featuresAdmin");
  featEl.innerHTML = (data || []).map(featureTemplate).join("");
  initAdminPreviewShells(featEl);
}

async function saveFeature(row) {
  const payload = rowPayload(row, "feature");
  const { error } = await client().from("site_features").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  row.classList.toggle("product-inactive", !payload.is_active);
  syncFeatureToggleUi(row, payload.is_active);
  showNotice("features", "כרטיס המידע נשמר בהצלחה");
}

async function toggleFeatureActive(row) {
  const id = row.dataset.featureId;
  const btn = row.querySelector("[data-toggle-feature]");
  const select = row.querySelector('[data-field="is_active"]');
  const currentActive = btn.dataset.active === "true";
  const newActive = !currentActive;

  const { error } = await client()
    .from("site_features")
    .update({ is_active: newActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  syncFeatureToggleUi(row, newActive);
  if (select) select.value = String(newActive);
  row.classList.toggle("product-inactive", !newActive);
  showNotice("features", newActive ? "כרטיס המידע מוצג באתר" : "כרטיס המידע הוסתר מהאתר");
}

function syncFeatureToggleUi(row, isActive) {
  const btn = row.querySelector("[data-toggle-feature]");
  if (!btn) return;
  btn.dataset.active = String(isActive);
  btn.textContent = isActive ? "הסתר מהאתר" : "הצג באתר";
  btn.className = `admin-button ${isActive ? "muted" : "secondary"}`;
}

async function loadGalleryImages() {
  const { data, error } = await client().from("gallery_images").select("*").order("display_order", { ascending: true });
  if (error) {
    showNotice("gallery", "שגיאה בטעינת הגלריה: " + error.message, false);
    return;
  }
  const el = document.getElementById("galleryAdmin");
  if (!el) return;
  el.innerHTML = (data || []).map(galleryTemplate).join("");
  initAdminPreviewShells(el);
}

async function saveGalleryRow(row) {
  const payload = rowPayload(row, "gallery");
  const { error } = await client().from("gallery_images").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  row.classList.toggle("product-inactive", !payload.is_active);
  syncGalleryToggleUi(row, payload.is_active);
  showNotice("gallery", "תמונת הגלריה נשמרה");
}

async function toggleGalleryActive(row) {
  const id = row.dataset.galleryId;
  const btn = row.querySelector("[data-toggle-gallery]");
  const select = row.querySelector('[data-field="is_active"]');
  const currentActive = btn.dataset.active === "true";
  const newActive = !currentActive;

  const { error } = await client()
    .from("gallery_images")
    .update({ is_active: newActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  syncGalleryToggleUi(row, newActive);
  if (select) select.value = String(newActive);
  row.classList.toggle("product-inactive", !newActive);
  showNotice("gallery", newActive ? "התמונה מוצגת באתר" : "התמונה הוסתרה מהאתר");
}

function syncGalleryToggleUi(row, isActive) {
  const btn = row.querySelector("[data-toggle-gallery]");
  if (!btn) return;
  btn.dataset.active = String(isActive);
  btn.textContent = isActive ? "הסתר מהאתר" : "הצג באתר";
  btn.className = `admin-button ${isActive ? "muted" : "secondary"}`;
}

async function deleteGalleryRow(row) {
  const id = row.dataset.galleryId;
  if (!id || !window.confirm("למחוק תמונה זו לצמיתות מהמסד? פעולה זו אינה הפיכה.")) return;
  const { error } = await client().from("gallery_images").delete().eq("id", id);
  if (error) throw error;
  row.remove();
  showNotice("gallery", "התמונה נמחקה");
}

function rowPayload(row, type) {
  const payload = {
    id: row.dataset.productId || row.dataset.featureId || row.dataset.galleryId,
    updated_at: new Date().toISOString()
  };
  row.querySelectorAll("[data-field]").forEach((input) => {
    let value = input.value.trim();
    if (input.dataset.field === "is_active") value = value === "true";
    if (input.dataset.field === "display_order") value = Number(value || 0);
    payload[input.dataset.field] = value;
  });
  if (type === "product") {
    payload.name ||= "";
    payload.description ||= "";
    payload.image_url ||= "";
    payload.card_image_url ||= "";
    if (payload.price === undefined || payload.price === null) payload.price = "";
    else payload.price = String(payload.price).trim();
  }
  if (type === "gallery") {
    payload.title ||= "";
    payload.alt_text ||= "";
    payload.image_url ||= "";
  }
  return payload;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function initAdmin() {
  await loadSettings();
  await Promise.all([loadProducts(), loadFeatures(), loadGalleryImages()]);
}

function setupEvents() {
  document.getElementById("loginButton").addEventListener("click", async () => {
    const username = (document.getElementById("adminUsername").value || "").trim().toLowerCase();
    const password = document.getElementById("adminPassword").value || "";

    if (!username || !password) {
      showLoginError("שם המשתמש או הסיסמה שגויים");
      return;
    }

    const ADMIN_USERS = { lior: "lior.patisserie@outlook.com" };
    const email = ADMIN_USERS[username];
    if (!email) {
      showLoginError("שם המשתמש או הסיסמה שגויים");
      return;
    }

    const btn = document.getElementById("loginButton");
    btn.disabled = true;
    btn.textContent = "מתחבר...";

    try {
      const { error } = await client().auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
      document.getElementById("logoutButton").classList.remove("hidden");
      showAdminApp();
      await initAdmin();
      startAdminIdleTimer();
    } catch {
      showLoginError("שם המשתמש או הסיסמה שגויים");
    } finally {
      btn.disabled = false;
      btn.textContent = "כניסה לניהול";
    }
  });

  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      stopAdminIdleTimer();
      sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
      clearAdminPasswordField();
      closeProductDrawer();
      try {
        await client().auth.signOut();
      } catch {
      }
      const notice = document.getElementById("loginNotice");
      if (notice) {
        notice.textContent = "";
        notice.className = "notice";
      }
      showLoginScreen();
    });
  }

  document.getElementById("adminUsername").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("adminPassword").focus();
  });
  document.getElementById("adminPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("loginButton").click();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = document.getElementById("productDrawer");
    if (!d || !d.classList.contains("is-open")) return;
    e.preventDefault();
    e.stopPropagation();
    closeProductDrawer();
  }, true);

  const productDrawerBackdrop = document.getElementById("productDrawerBackdrop");
  const productDrawerClose = document.getElementById("productDrawerClose");
  if (productDrawerBackdrop) productDrawerBackdrop.addEventListener("click", closeProductDrawer);
  if (productDrawerClose) productDrawerClose.addEventListener("click", closeProductDrawer);

  document.addEventListener("click", async (event) => {
    if (event.target.matches("[data-save-settings]")) {
      const scope = event.target.dataset.saveSettings || "home-settings";
      const settingsRoot = event.target.closest(".editor-card") || document;
      try { await saveSettings(scope, settingsRoot); } catch (error) { showNotice(scope, error.message, false); }
    }
    if (event.target.id === "addProduct") {
      openProductDrawer(null);
      return;
    }
    const gridCard = event.target.closest(".product-grid-card");
    if (gridCard) {
      const id = gridCard.dataset.productId;
      const product = adminProductsCache.find((p) => String(p.id) === String(id));
      if (product) openProductDrawer(product);
      return;
    }
    if (event.target.id === "addFeature") {
      const wrap = document.getElementById("featuresAdmin");
      wrap.insertAdjacentHTML("beforeend", featureTemplate({ display_order: 0, is_active: true }));
      const row = wrap.querySelector(".feature-row:last-of-type");
      if (row) initAdminPreviewShells(row);
    }
    if (event.target.id === "addGalleryImage") {
      const wrap = document.getElementById("galleryAdmin");
      wrap.insertAdjacentHTML("beforeend", galleryTemplate({ display_order: 0, is_active: true }));
      const row = wrap.querySelector(".gallery-row:last-of-type");
      if (row) initAdminPreviewShells(row);
    }
    if (event.target.matches("[data-save-product-drawer]")) {
      const form = document.getElementById("productDrawerForm");
      if (form) {
        try {
          await saveProduct(form);
        } catch (error) {
          showNotice("products", error.message, false);
        }
      }
    }
    if (event.target.matches("[data-toggle-product]")) {
      const form = document.getElementById("productDrawerForm");
      if (form && form.contains(event.target)) {
        try {
          await toggleProductActive(form);
        } catch (error) {
          showNotice("products", error.message, false);
        }
      }
    }
    if (event.target.matches("[data-save-feature]")) {
      try { await saveFeature(event.target.closest(".feature-row")); } catch (error) { showNotice("features", error.message, false); }
    }
    if (event.target.matches("[data-toggle-feature]")) {
      try { await toggleFeatureActive(event.target.closest(".feature-row")); } catch (error) { showNotice("features", error.message, false); }
    }
    if (event.target.matches("[data-save-gallery]")) {
      try { await saveGalleryRow(event.target.closest(".gallery-row")); } catch (error) { showNotice("gallery", error.message, false); }
    }
    if (event.target.matches("[data-toggle-gallery]")) {
      try { await toggleGalleryActive(event.target.closest(".gallery-row")); } catch (error) { showNotice("gallery", error.message, false); }
    }
    if (event.target.matches("[data-delete-gallery]")) {
      try { await deleteGalleryRow(event.target.closest(".gallery-row")); } catch (error) { showNotice("gallery", error.message, false); }
    }
  });

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input.matches("[data-field]") && ["image_url", "card_image_url"].includes(input.dataset.field)) {
      const row = input.closest(".product-row, .feature-row, .gallery-row, .product-drawer-form");
      if (row) initAdminPreviewShells(row);
      return;
    }
    if (input.matches("[data-setting]") && (input.dataset.setting === "hero_image" || input.dataset.setting === "hero_logo_image")) {
      const shell = document.querySelector(`.admin-preview-shell[data-setting-preview="${input.dataset.setting}"]`);
      if (shell) syncAdminPreviewShell(shell);
    }
  });

  document.addEventListener("change", async (event) => {
    const fileInput = event.target;
    if (!fileInput.matches("[data-upload], [data-product-upload], [data-product-card-upload], [data-feature-upload], [data-gallery-upload]")) return;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const tools = fileInput.closest(".image-tools");
    const shellFromRow = tools?.querySelector(".admin-preview-shell");
    const settingKey = fileInput.dataset.upload;
    const settingImg = settingKey ? document.querySelector(`[data-preview="${settingKey}"]`) : null;
    const settingShell = settingImg?.closest(".admin-preview-shell");

    const blobUrl = URL.createObjectURL(file);
    const previewImg = shellFromRow?.querySelector(".preview") || settingImg;
    if (previewImg) {
      previewImg.src = blobUrl;
      if (shellFromRow) {
        shellFromRow.classList.add("has-image");
        const ph = shellFromRow.querySelector(".admin-preview-placeholder");
        if (ph) ph.hidden = true;
      }
    }

    try {
      const url = await uploadImageAsWebP(file, fileInput.dataset.folder, fileInput.dataset.maxWidth);
      let targetInput = null;
      if (fileInput.dataset.upload) {
        targetInput = document.querySelector(`[data-setting="${fileInput.dataset.upload}"]`);
      } else if (fileInput.matches("[data-product-card-upload]")) {
        targetInput = fileInput.closest(".image-tools")?.querySelector('[data-field="card_image_url"]');
      } else {
        targetInput = fileInput.parentElement.querySelector('[data-field="image_url"]');
      }
      if (targetInput) targetInput.value = String(url || "").trim();
      if (shellFromRow) syncAdminPreviewShell(shellFromRow);
      else if (settingShell) syncAdminPreviewShell(settingShell);
      else if (settingImg && url) {
        settingImg.src = String(url).trim();
      }
      requestAnimationFrame(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
        }
      });
    } catch (error) {
      showUploadMessage(error.message || "העלאת התמונה נכשלה", false);
      if (shellFromRow) syncAdminPreviewShell(shellFromRow);
      else if (settingShell) syncAdminPreviewShell(settingShell);
    }
  });
}

async function checkExistingSession() {
  try {
    const { data } = await client().auth.getSession();
    const session = data && data.session;
    if (!session) {
      showLoginScreen();
      return;
    }

    const raw = sessionStorage.getItem(ADMIN_LAST_ACTIVITY_KEY);
    const last = raw ? parseInt(raw, 10) : NaN;
    const now = Date.now();

    if (!Number.isFinite(last)) {
      try {
        await client().auth.signOut();
      } catch {
      }
      sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
      clearAdminPasswordField();
      showLoginScreen();
      showLoginError("יש להתחבר מחדש.");
      return;
    }

    if (now - last > ADMIN_IDLE_TIMEOUT_MS) {
      await lockAdminDueToInactivity();
      return;
    }

    document.getElementById("logoutButton").classList.remove("hidden");
    showAdminApp();
    await initAdmin();
    startAdminIdleTimer();
  } catch {
    showLoginScreen();
  }
}

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
      if (!window.location.pathname.endsWith("lior-admin.html")) {
        window.location.href = "lior-admin.html";
      }
    }
  });
}

window.uploadImageAsWebP = uploadImageAsWebP;
window.convertImageToWebP = convertImageToWebP;
window.saveProduct = saveProduct;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.loadProducts = loadProducts;
window.startAdminIdleTimer = startAdminIdleTimer;
window.stopAdminIdleTimer = stopAdminIdleTimer;
window.resetAdminIdleTimer = resetAdminIdleTimer;
window.lockAdminDueToInactivity = lockAdminDueToInactivity;

document.addEventListener("DOMContentLoaded", async () => {
  setupEvents();
  setupHiddenAdminEntry();
  await checkExistingSession();
});
