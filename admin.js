const WEBP_QUALITY = 0.8;
const JPEG_QUALITY = 0.88;
const PRODUCT_CARD_RESIZE_MAX = 768;
const BUCKET = (window.LIOR_SUPABASE_CONFIG && window.LIOR_SUPABASE_CONFIG.STORAGE_BUCKET) || "site-images";

let adminProductsCache = [];

const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_LAST_ACTIVITY_KEY = "liorAdminLastActivity";
const ADMIN_IDLE_LOCK_MESSAGE = "האדמין ננעל לאחר 15 דקות ללא פעילות. יש להתחבר מחדש.";
const ADMIN_ACTIVITY_MOUSEMOVE_THROTTLE_MS = 1000;
const ADMIN_ACTIVITY_SCROLL_THROTTLE_MS = 2000;

const ADMIN_ACTIVITY_EVENT_OPTS = { capture: true, passive: true };

let adminIdleTimeoutId = null;
let adminIdleListenersAttached = false;
let adminIdleTracking = false;
let adminIdleMouseThrottleAt = 0;
let adminIdleScrollThrottleAt = 0;
let adminIdleLocking = false;

function onAdminWindowActivity(event) {
  if (!adminIdleTracking || adminIdleLocking) return;
  if (event && event.type === "mousemove") {
    const now = Date.now();
    if (now - adminIdleMouseThrottleAt < ADMIN_ACTIVITY_MOUSEMOVE_THROTTLE_MS) return;
    adminIdleMouseThrottleAt = now;
  }
  if (event && event.type === "scroll") {
    const now = Date.now();
    if (now - adminIdleScrollThrottleAt < ADMIN_ACTIVITY_SCROLL_THROTTLE_MS) return;
    adminIdleScrollThrottleAt = now;
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

/** Resolve admin/public display URL without falling back to deleted local product folders. */
function adminMediaPreviewUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (typeof window.normalizeImagePath === "function") return window.normalizeImagePath(s);
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/")) return s;
  if (/^(assets|images|attached_assets)\//i.test(s)) return s;
  return "";
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
  const row = shell.closest(".product-row, .feature-row, .product-drawer-form");
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


function productStorageSegmentForField(field) {
  if (field === "image_url") return "products/full/";
  if (field === "card_image_url") return "products/cards/";
  return "";
}

function isAllowedProductStorageUrl(value, field) {
  const raw = String(value || "").trim().replace(/\\/g, "/");
  if (!raw) return true;
  const segment = productStorageSegmentForField(field);
  if (!segment) return true;
  const lower = raw.toLowerCase();
  const normalizedSegment = segment.toLowerCase();
  if (lower.startsWith(normalizedSegment)) return true;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) {
    return lower.includes(`/storage/v1/object/public/${BUCKET.toLowerCase()}/${normalizedSegment}`);
  }
  return false;
}

function sanitizeProductImagePayload(payload) {
  ["image_url", "card_image_url"].forEach((field) => {
    const value = String(payload[field] || "").trim();
    payload[field] = isAllowedProductStorageUrl(value, field) ? value : "";
  });
  return payload;
}

function syncImageToolState(tools) {
  if (!tools) return;
  const hasImage = Boolean(
    String(tools.querySelector('[data-field="image_url"]')?.value || "").trim() ||
    String(tools.querySelector('[data-field="card_image_url"]')?.value || "").trim()
  );
  tools.classList.toggle("has-managed-image", hasImage);
  tools.querySelectorAll("[data-remove-product-image]").forEach((btn) => {
    btn.hidden = !hasImage;
  });
}

function showImageToolStatus(tools, message = "", ok = true) {
  if (!tools) return;
  const status = tools.querySelector("[data-image-status]");
  if (!status) return;
  status.textContent = message;
  status.className = `admin-image-status${message ? " is-visible" : ""} ${ok ? "ok" : "error"}`;
}

function syncAdminPreviewShell(shell) {
  if (!shell) return;
  const img = shell.querySelector(".preview");
  const ph = shell.querySelector(".admin-preview-placeholder");
  if (!img || !ph) return;

  const raw = getAdminPreviewShellRaw(shell);
  const url = adminPreviewSrc(raw, { whenEmpty: "" });
  const tools = shell.closest(".image-tools");
  syncImageToolState(tools);

  img.loading = img.loading || "lazy";
  img.decoding = img.decoding || "async";
  img.onload = null;
  img.onerror = null;

  if (!url) {
    img.removeAttribute("src");
    img.alt = "";
    shell.classList.remove("has-image", "is-loading");
    ph.hidden = false;
    return;
  }

  img.onload = function () {
    shell.classList.remove("is-loading");
    if (img.naturalWidth > 0) {
      shell.classList.add("has-image");
      ph.hidden = true;
    }
  };
  img.onerror = function () {
    img.removeAttribute("src");
    shell.classList.remove("has-image", "is-loading");
    ph.hidden = false;
  };

  ph.hidden = true;

  if (img.getAttribute("src") === url) {
    shell.classList.toggle("is-loading", !img.complete);
    shell.classList.add("has-image");
    return;
  }

  shell.classList.add("has-image", "is-loading");
  img.src = url;
}

function initAdminPreviewShells(root) {
  const el = root && root.querySelectorAll ? root : document;
  el.querySelectorAll(".admin-preview-shell").forEach(syncAdminPreviewShell);
  el.querySelectorAll(".image-tools").forEach(syncImageToolState);
}

function showNotice(scope, message, ok = true) {
  document.querySelectorAll(`[data-notice="${scope}"]`).forEach((el) => {
    el.textContent = message;
    el.className = `notice is-visible ${ok ? "ok" : "error"}`;
  });
}

const PRODUCT_DUPLICATE_NAME_MESSAGE = "כבר קיים מוצר בשם הזה";

function isDuplicateProductNameError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  const details = String(error.details || "").toLowerCase();
  const hint = String(error.hint || "").toLowerCase();
  const combined = `${message} ${details} ${hint}`;
  return (
    code === "23505" ||
    (combined.includes("duplicate key") &&
      (combined.includes("products_name_unique") || combined.includes("products_name_key") || combined.includes("name")))
  );
}

function friendlyProductSaveError(error) {
  if (isDuplicateProductNameError(error)) return new Error(PRODUCT_DUPLICATE_NAME_MESSAGE);
  return error;
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
    loginNotice.className = `notice admin-login-notice is-visible ${ok ? "ok" : "error"}`;
  }
}

function showLoginError(message) {
  const notice = document.getElementById("loginNotice");
  if (!notice) return;
  notice.textContent = message;
  notice.className = "notice admin-login-notice is-visible error";
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
  if (notice) notice.className = "notice admin-login-notice error";
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

async function imageToWebPBlob(image, maxWidth) {
  const naturalW = image.naturalWidth || image.width;
  const naturalH = image.naturalHeight || image.height;
  if (!naturalW) return null;
  const w = Math.min(naturalW, Number(maxWidth) || naturalW);
  const h = Math.round(naturalH * (w / naturalW));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image, 0, 0, w, h);

  const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  if (!webpBlob || webpBlob.type !== "image/webp") return null;
  return webpBlob;
}

async function imageToJpegBlob(image, maxWidth) {
  const naturalW = image.naturalWidth || image.width;
  const naturalH = image.naturalHeight || image.height;
  if (!naturalW) return null;
  const w = Math.min(naturalW, Number(maxWidth) || naturalW);
  const h = Math.round(naturalH * (w / naturalW));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(image, 0, 0, w, h);
  return canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
}


async function convertImageToWebP(file, maxWidth) {
  const image = await readImage(file);
  const webpBlob = await imageToWebPBlob(image, maxWidth);
  URL.revokeObjectURL(image.src);

  if (!webpBlob) {
    showUploadMessage("הדפדפן לא תומך בהמרה ל־WebP. הקובץ המקורי יועלה כגיבוי בלבד.", false);
    return { blob: file, extension: file.name.split(".").pop() || "image", contentType: file.type || "application/octet-stream" };
  }

  return { blob: webpBlob, extension: "webp", contentType: "image/webp" };
}

async function uploadBlobToBucket(path, blob, contentType) {
  const { error } = await client().storage.from(BUCKET).upload(path, blob, {
    contentType,
    cacheControl: "31536000",
    upsert: false
  });
  if (error) throw error;
  const { data } = client().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Full-size and card product JPGs saved in the Supabase product folders. */
async function uploadProductImagesToSupabase(file, fullMaxWidth) {
  if (!file) return { fullUrl: "", cardUrl: "" };
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || "")) {
    throw new Error("ניתן להעלות רק PNG, JPG, JPEG או WEBP");
  }

  const image = await readImage(file);
  const maxFull = Number(fullMaxWidth) || 1280;
  const fullBlob = await imageToJpegBlob(image, maxFull);
  const cardBlob = await imageToJpegBlob(image, PRODUCT_CARD_RESIZE_MAX);
  URL.revokeObjectURL(image.src);

  if (!fullBlob || !cardBlob) throw new Error("לא ניתן לעבד את קובץ התמונה");

  const base = String(file.name || "product")
    .toLowerCase()
    .replace(/\.[^.]+$/i, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
  const stamp = Date.now();
  const fileName = `${base}-${stamp}.jpg`;

  const fullUrl = await uploadBlobToBucket(`products/full/${fileName}`, fullBlob, "image/jpeg");
  const cardUrl = await uploadBlobToBucket(`products/cards/${fileName}`, cardBlob, "image/jpeg");
  return { fullUrl, cardUrl };
}

async function uploadImageAsWebP(file, folder, maxWidth) {
  if (!file) return "";
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || "")) {
    throw new Error("ניתן להעלות רק PNG, JPG, JPEG או WEBP");
  }

  const converted = await convertImageToWebP(file, maxWidth);
  const finalName = converted.extension === "webp" ? cleanFileName(file.name) : `${cleanFileName(file.name).replace(/\.webp$/, "")}.${converted.extension}`;
  const path = `${folder || "uploads"}/${finalName}`;
  const { error } = await client().storage.from(BUCKET).upload(path, converted.blob, {
    contentType: converted.contentType,
    cacheControl: "31536000",
    upsert: false
  });
  if (error) throw error;

  const { data } = client().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function loadSettings() {
  const { data, error } = await client().from("site_settings").select("key,value");
  if (error) throw error;

  const settings = (data || []).reduce((acc, row) => {
    if (row && row.key) acc[row.key] = row.value || "";
    return acc;
  }, {});

  document.querySelectorAll("[data-setting]").forEach((input) => {
    const primaryValue = settings[input.dataset.setting] || "";
    const mergedKey = input.dataset.mergedSetting;
    const mergedValue = mergedKey ? settings[mergedKey] || "" : "";
    input.value = [primaryValue, mergedValue].filter((value) => value.trim()).join("\n\n");
  });
  document.querySelectorAll(".admin-preview-shell[data-setting-preview]").forEach(syncAdminPreviewShell);
}

async function saveSettings(scope = "hero-settings", root = document) {
  const inputs = Array.from(root.querySelectorAll("[data-setting]"));
  const now = new Date().toISOString();
  const rows = inputs.flatMap((input) => {
    const row = {
      key: input.dataset.setting,
      value: input.value.trim(),
      updated_at: now
    };
    if (!input.dataset.mergedSetting) return [row];
    return [row, { key: input.dataset.mergedSetting, value: "", updated_at: now }];
  });
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
    const raw = String(product.card_image_url || product.image_url || "").trim();
    const url = adminPreviewSrc(raw, { whenEmpty: "" });
    if (!url) {
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("src");
      img.classList.add("is-hidden");
      ph.hidden = false;
      return;
    }
    ph.hidden = true;
    img.classList.remove("is-hidden");
    img.alt = String(product.name || "");
    // Skip network request if the same image is already fully loaded
    if (img.getAttribute("src") === url && img.complete && img.naturalWidth > 0) {
      return;
    }
    img.onload = null;
    img.onerror = null;
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

  backdrop.hidden = false;
  drawer.hidden = false;
  backdrop.setAttribute("aria-hidden", "false");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-product-drawer");
  requestAnimationFrame(() => {
    backdrop.classList.add("is-open");
    drawer.classList.add("is-open");
  });

  requestAnimationFrame(() => initAdminPreviewShells(body));
  setTimeout(() => body.querySelector('[data-field="name"]')?.focus(), 0);
}

function closeProductDrawer() {
  const drawer = document.getElementById("productDrawer");
  const backdrop = document.getElementById("productDrawerBackdrop");
  const body = document.getElementById("productDrawerBody");
  if (!drawer || !backdrop) return;
  backdrop.classList.remove("is-open");
  drawer.classList.remove("is-open");
  backdrop.setAttribute("aria-hidden", "true");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-product-drawer");
  setTimeout(() => {
    backdrop.hidden = true;
    drawer.hidden = true;
    if (body) body.innerHTML = "";
  }, 210);
}

function productDrawerFormTemplate(product = {}) {
  const id = product.id || crypto.randomUUID();
  const isActive = product.is_active !== false;
  const priceVal = product.price != null ? String(product.price) : "";
  return `<form id="productDrawerForm" class="product-drawer-form" data-product-id="${escapeHtml(String(id))}" data-display-order="${Number(product.display_order) || 0}" data-is-active="${isActive}">
    <div class="product-drawer-fields">
      <label class="field-label">שם הטעם <input data-field="name" value="${escapeHtml(product.name || "")}"></label>
      <label class="field-label">מחיר (אופציונלי) <input data-field="price" type="text" value="${escapeHtml(priceVal)}" placeholder="למשל 28 או ₪28"></label>
      <label class="field-label wide">תיאור <textarea data-field="description" rows="4">${escapeHtml(product.description || "")}</textarea></label>
      <div class="field-label wide product-image-manager">
        <span class="field-title">תמונת מוצר</span>
        <div class="image-tools product-drawer-image-tools admin-simple-image-tools">
          <div class="admin-preview-shell" data-preview-field="card_image_url" data-preview-fallback-field="image_url">
            <img class="preview" alt="תמונה נוכחית" loading="lazy" decoding="async">
            <span class="admin-preview-placeholder">אין תמונה</span>
          </div>
          <div class="admin-image-controls">
            <div class="admin-image-actions">
              <label class="admin-button secondary admin-file-button">העלאת תמונה
                <input data-product-upload data-max-width="1280" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
              </label>
              <button class="admin-button muted admin-remove-image" type="button" data-remove-product-image hidden>הסרת תמונה</button>
            </div>
            <div class="admin-image-status" data-image-status aria-live="polite"></div>
            <input type="hidden" data-field="image_url" value="${escapeHtml(product.image_url || "")}">
            <input type="hidden" data-field="card_image_url" value="${escapeHtml(product.card_image_url || "")}">
          </div>
        </div>
      </div>
    </div>
    <div class="product-drawer-actions">
      <button class="admin-button" type="button" data-save-product-drawer>שמירת מוצר</button>
    </div>
  </form>`;
}

function buildAdminCategoryHtml(sorted) {
  const CATEGORY_LABELS = ["סדרה ראשונה", "סדרה שניה", "סדרה שלישית"];
  const groups = [
    sorted.slice(0, 6),
    sorted.slice(6, 12),
    sorted.slice(12)
  ];
  return groups.map((products, i) => `
    <div class="admin-category-group" data-category-index="${i + 1}">
      <div class="admin-category-group-head">
        <span class="admin-category-group-label">${CATEGORY_LABELS[i]}</span>
        <span class="admin-category-group-count">${products.length} מוצרים</span>
      </div>
      <div class="products-admin-grid admin-category-cards">
        ${products.length ? products.map(productGridCardTemplate).join("") : '<p class="hint admin-empty-hint">אין מוצרים בסדרה זו.</p>'}
      </div>
    </div>
  `).join("");
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

  container.innerHTML = buildAdminCategoryHtml(supabaseProducts);
  container.querySelectorAll(".admin-category-cards").forEach(hydrateProductGridCards);
  refreshProductDrawerFormIfOpen();
}

function updateProductInCache(payload) {
  const idx = adminProductsCache.findIndex((p) => String(p.id) === String(payload.id));
  if (idx >= 0) {
    adminProductsCache[idx] = { ...adminProductsCache[idx], ...payload };
  } else {
    adminProductsCache.push(payload);
  }
}

function rerenderProductGrid() {
  const container = document.getElementById("productsAdmin");
  if (!container) return;
  if (!adminProductsCache.length) {
    container.innerHTML =
      '<p class="hint admin-empty-hint">אין מוצרים במסד הנתונים. אפשר להוסיף מוצרים כאן או להריץ את קובץ seed-content.sql בפרויקט Supabase לנתוני פתיחה בלבד.</p>';
    return;
  }
  const sorted = [...adminProductsCache].sort(
    (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0)
  );
  container.innerHTML = buildAdminCategoryHtml(sorted);
  container.querySelectorAll(".admin-category-cards").forEach(hydrateProductGridCards);
  refreshProductDrawerFormIfOpen();
}

/**
 * Update a single product card in the admin grid without rebuilding the whole DOM.
 * Returns true if the card was found and updated in place, false if a full rebuild is needed.
 */
function tryUpdateProductCardInPlace(productId) {
  const product = adminProductsCache.find((p) => String(p.id) === String(productId));
  if (!product) return false;

  const card = document.querySelector(`.product-grid-card[data-product-id="${CSS.escape(String(productId))}"]`);
  if (!card) return false;

  const isActive = product.is_active !== false;
  const nameRaw = String(product.name || "").trim() || "ללא שם";

  // Active state + aria-label
  card.classList.toggle("product-grid-card--inactive", !isActive);
  card.setAttribute("aria-label", `עריכה: ${escapeHtml(nameRaw)}`);

  // Name
  const nameEl = card.querySelector(".product-grid-card-name");
  if (nameEl) nameEl.textContent = nameRaw;

  // Price
  const priceRaw = product.price != null ? String(product.price).trim() : "";
  let priceEl = card.querySelector(".product-grid-card-price");
  if (priceRaw) {
    if (!priceEl) {
      priceEl = document.createElement("span");
      priceEl.className = "product-grid-card-price";
      const meta = card.querySelector(".product-grid-card-meta");
      if (meta) meta.insertBefore(priceEl, nameEl ? nameEl.nextSibling : null);
    }
    priceEl.textContent = priceRaw;
  } else if (priceEl) {
    priceEl.remove();
  }

  // Active badge
  let badgeEl = card.querySelector(".product-grid-card-badge");
  if (!isActive) {
    if (!badgeEl) {
      badgeEl = document.createElement("span");
      badgeEl.className = "product-grid-card-badge";
      badgeEl.textContent = "מוסתר";
      const meta = card.querySelector(".product-grid-card-meta");
      if (meta) meta.appendChild(badgeEl);
    }
  } else if (badgeEl) {
    badgeEl.remove();
  }

  // Image
  const img = card.querySelector(".product-grid-card-img");
  const ph = card.querySelector(".product-grid-card-noimg");
  if (img && ph) {
    const raw = String(product.card_image_url || product.image_url || "").trim();
    const url = adminPreviewSrc(raw, { whenEmpty: "" });
    if (!url) {
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("src");
      img.classList.add("is-hidden");
      ph.hidden = false;
    } else {
      ph.hidden = true;
      img.classList.remove("is-hidden");
      img.alt = nameRaw;
      if (img.getAttribute("src") !== url) {
        img.onload = null;
        img.onerror = null;
        img.onload = function () { if (img.naturalWidth > 0) ph.hidden = true; };
        img.onerror = function () {
          img.removeAttribute("src");
          img.classList.add("is-hidden");
          ph.hidden = false;
        };
        img.src = url;
      }
    }
  }

  return true;
}

async function ensureUniqueProductName(payload) {
  const name = String(payload.name || "").trim();
  if (!name) return;

  const cachedDuplicate = adminProductsCache.some(
    (product) => String(product.id) !== String(payload.id) && String(product.name || "").trim() === name
  );
  if (cachedDuplicate) throw new Error(PRODUCT_DUPLICATE_NAME_MESSAGE);

  const { data, error } = await client()
    .from("products")
    .select("id")
    .eq("name", name)
    .neq("id", payload.id)
    .limit(1);

  if (error) throw friendlyProductSaveError(error);
  if (Array.isArray(data) && data.length > 0) throw new Error(PRODUCT_DUPLICATE_NAME_MESSAGE);
}

async function saveProduct(root) {
  const payload = rowPayload(root, "product");
  payload.name = String(payload.name || "").trim();
  await ensureUniqueProductName(payload);

  const { error } = await client().from("products").upsert(payload, { onConflict: "id" });
  if (error) throw friendlyProductSaveError(error);
  updateProductInCache(payload);
  // Update only the changed card without rebuilding the entire grid; fall back
  // to a full rebuild only when the product is new (not yet in the DOM)
  if (!tryUpdateProductCardInPlace(payload.id)) {
    rerenderProductGrid();
  }
  showNotice("products", "המוצר נשמר בהצלחה");
}

async function toggleProductActive(root) {
  const id = root.dataset.productId;
  const btn = root.querySelector("[data-toggle-product]");
  const select = root.querySelector('[data-field="is_active"]');
  const currentActive = btn.dataset.active === "true";
  const newActive = !currentActive;
  const now = new Date().toISOString();

  const { error } = await client()
    .from("products")
    .update({ is_active: newActive, updated_at: now })
    .eq("id", id);
  if (error) throw error;

  btn.dataset.active = String(newActive);
  btn.textContent = newActive ? "מוסתר באתר" : "הצג באתר";
  btn.className = `admin-button ${newActive ? "muted" : "secondary"}`;
  if (select) select.value = String(newActive);
  updateProductInCache({ id, is_active: newActive, updated_at: now });
  if (!tryUpdateProductCardInPlace(id)) {
    rerenderProductGrid();
  }
  showNotice("products", newActive ? "המוצר מוצג באתר" : "המוצר הוסתר מהאתר");
}

function featureTemplate(feature = {}) {
  const id = feature.id || crypto.randomUUID();
  const isActive = feature.is_active !== false;
  const hasImg = Boolean(String(feature.image_url || "").trim());
  return `<article class="feature-row${isActive ? "" : " product-inactive"}" data-feature-id="${id}" data-display-order="${Number(feature.display_order) || 0}">
    <div class="grid">
      <label class="field-label">כותרת <input data-field="title" value="${escapeHtml(feature.title || "")}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${isActive ? "selected" : ""}>כן</option><option value="false" ${!isActive ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">טקסט <textarea data-field="text">${escapeHtml(feature.text || "")}</textarea></label>
      <label class="field-label wide">תמונה (אופציונלי)
        <div class="image-tools">
          <div class="admin-preview-shell${hasImg ? " has-image" : ""}" data-preview-field="image_url">
            <img class="preview" alt="">
            <span class="admin-preview-placeholder"${hasImg ? " hidden" : ""}>אין תמונה זמינה</span>
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
  btn.textContent = isActive ? "מוסתר באתר" : "הצג באתר";
  btn.className = `admin-button ${isActive ? "muted" : "secondary"}`;
}

function rowPayload(row, type) {
  const payload = {
    id: row.dataset.productId || row.dataset.featureId,
    updated_at: new Date().toISOString()
  };
  row.querySelectorAll("[data-field]").forEach((input) => {
    let value = input.value.trim();
    if (input.dataset.field === "is_active") value = value === "true";
    if (input.dataset.field === "display_order") value = Number(value || 0);
    payload[input.dataset.field] = value;
  });
  if (payload.display_order === undefined) payload.display_order = Number(row.dataset.displayOrder) || 0;
  if (payload.is_active === undefined && row.dataset.isActive !== undefined) {
    payload.is_active = row.dataset.isActive === "true";
  }
  if (type === "product") {
    payload.name ||= "";
    payload.description ||= "";
    payload.image_url ||= "";
    payload.card_image_url ||= "";
    sanitizeProductImagePayload(payload);
    if (payload.price === undefined || payload.price === null) payload.price = "";
    else payload.price = String(payload.price).trim();
  }
  return payload;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function initAdmin() {
  await loadSettings();
  await Promise.all([loadProducts(), loadFeatures()]);
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
        notice.className = "notice admin-login-notice";
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
      const orders = Array.from(wrap.querySelectorAll(".feature-row"))
        .map((row) => Number(row.dataset.displayOrder) || 0);
      const nextOrder = orders.length ? Math.max(...orders) + 1 : 0;
      wrap.insertAdjacentHTML("beforeend", featureTemplate({ display_order: nextOrder, is_active: true }));
      const row = wrap.querySelector(".feature-row:last-of-type");
      if (row) initAdminPreviewShells(row);
    }
    if (event.target.matches("[data-save-product-drawer]")) {
      const form = document.getElementById("productDrawerForm");
      if (form) {
        try {
          await saveProduct(form);
        } catch (error) {
          showNotice("products", friendlyProductSaveError(error).message, false);
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
    if (event.target.matches("[data-remove-product-image]")) {
      const tools = event.target.closest(".image-tools");
      tools?.querySelectorAll('[data-field="image_url"], [data-field="card_image_url"]').forEach((input) => {
        input.value = "";
      });
      const shell = tools?.querySelector(".admin-preview-shell");
      if (shell) syncAdminPreviewShell(shell);
      showImageToolStatus(tools, "התמונה הוסרה. לחצו שמירה לעדכון באתר.", true);
    }
    if (event.target.matches("[data-save-feature]")) {
      try { await saveFeature(event.target.closest(".feature-row")); } catch (error) { showNotice("features", error.message, false); }
    }
    if (event.target.matches("[data-toggle-feature]")) {
      try { await toggleFeatureActive(event.target.closest(".feature-row")); } catch (error) { showNotice("features", error.message, false); }
    }
  });

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input.matches("[data-field]") && ["image_url", "card_image_url"].includes(input.dataset.field)) {
      const row = input.closest(".product-row, .feature-row, .product-drawer-form");
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
    if (!fileInput.matches("[data-upload], [data-product-upload], [data-feature-upload]")) return;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const tools = fileInput.closest(".image-tools");
    const shellFromRow = tools?.querySelector(".admin-preview-shell");
    const settingKey = fileInput.dataset.upload;
    const settingImg = settingKey ? document.querySelector(`[data-preview="${settingKey}"]`) : null;
    const settingShell = settingImg?.closest(".admin-preview-shell");

    showImageToolStatus(tools, "מעלה תמונה...", true);

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
      let url = "";
      let cardUrlExtra = "";
      if (fileInput.matches("[data-product-upload]")) {
        const pair = await uploadProductImagesToSupabase(file, fileInput.dataset.maxWidth);
        url = pair.fullUrl || "";
        cardUrlExtra = pair.cardUrl || "";
      } else {
        url = await uploadImageAsWebP(file, fileInput.dataset.folder, fileInput.dataset.maxWidth);
      }

      let targetInput = null;
      if (fileInput.dataset.upload) {
        targetInput = document.querySelector(`[data-setting="${fileInput.dataset.upload}"]`);
      } else if (fileInput.matches("[data-product-upload]")) {
        const form = fileInput.closest("#productDrawerForm");
        const fullField = form?.querySelector('[data-field="image_url"]');
        const cardField = form?.querySelector('[data-field="card_image_url"]');
        if (fullField) fullField.value = String(url || "").trim();
        if (cardField) cardField.value = String(cardUrlExtra || "").trim();
        const cardShell = form?.querySelector('.admin-preview-shell[data-preview-field="card_image_url"]');
        if (cardShell) syncAdminPreviewShell(cardShell);
      } else {
        targetInput = fileInput.parentElement.querySelector('[data-field="image_url"]');
      }
      if (targetInput) targetInput.value = String(url || "").trim();

      if (shellFromRow) {
        syncAdminPreviewShell(shellFromRow);
        showImageToolStatus(tools, "התמונה עודכנה בהצלחה", true);
      }
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
      showImageToolStatus(tools, error.message || "העלאת התמונה נכשלה", false);
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
