const WEBP_QUALITY = 0.82;
const BUCKET = (window.LIOR_SUPABASE_CONFIG && window.LIOR_SUPABASE_CONFIG.STORAGE_BUCKET) || "site-images";

function client() {
  const supabaseClient = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
  if (!supabaseClient) throw new Error("חסרים SUPABASE_URL או SUPABASE_ANON_KEY בקובץ supabase-config.js");
  return supabaseClient;
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
  if (!/image\/(png|jpeg|webp)/.test(file.type)) {
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
    const preview = document.querySelector(`[data-preview="${row.key}"]`);
    if (preview && row.value) preview.src = row.value;
  });
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

function productTemplate(product = {}) {
  const id = product.id || crypto.randomUUID();
  return `<article class="product-row" data-product-id="${id}">
    <div class="grid">
      <label class="field-label">שם מוצר - מוצג בכרטיס המוצר <input data-field="name" value="${escapeHtml(product.name || "")}"></label>
      <label class="field-label">סדר תצוגה - מיקום בכרטיסי הטעמים <input data-field="display_order" type="number" value="${product.display_order || 0}"></label>
      <label class="field-label">פעיל / לא פעיל - קובע אם המוצר מוצג באתר <select data-field="is_active"><option value="true" ${product.is_active !== false ? "selected" : ""}>כן</option><option value="false" ${product.is_active === false ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">תיאור מוצר - מוצג בכרטיס המוצר <textarea data-field="description">${escapeHtml(product.description || "")}</textarea></label>
      <label class="field-label wide">תמונת מוצר - מוצגת בכרטיס המוצר
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(product.image_url || "assets/logo.png")}" alt="Preview">
          <div>
            <input data-field="image_url" value="${escapeHtml(product.image_url || "")}" placeholder="Public URL">
            <input data-product-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <button class="admin-button" type="button" data-save-product>שמירת מוצר</button>
  </article>`;
}

async function loadProducts() {
  const { data, error } = await client().from("products").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  document.getElementById("productsAdmin").innerHTML = (data || []).map(productTemplate).join("");
}

async function saveProduct(row) {
  const payload = rowPayload(row, "product");
  const { error } = await client().from("products").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  showNotice("products", "המוצר נשמר בהצלחה");
}

function featureTemplate(feature = {}) {
  const id = feature.id || crypto.randomUUID();
  return `<article class="feature-row" data-feature-id="${id}">
    <div class="grid">
      <label class="field-label">כותרת יתרון - מוצגת בכרטיס היתרון <input data-field="title" value="${escapeHtml(feature.title || "")}"></label>
      <label class="field-label">סדר תצוגה - מיקום בשלושת היתרונות <input data-field="display_order" type="number" value="${feature.display_order || 0}"></label>
      <label class="field-label">פעיל / לא פעיל - קובע אם היתרון מוצג באתר <select data-field="is_active"><option value="true" ${feature.is_active !== false ? "selected" : ""}>כן</option><option value="false" ${feature.is_active === false ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">טקסט יתרון - מוצג בכרטיס היתרון <textarea data-field="text">${escapeHtml(feature.text || "")}</textarea></label>
      <label class="field-label wide">תמונה / אייקון יתרון - אופציונלי
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(feature.image_url || "assets/logo.png")}" alt="Preview">
          <div>
            <input data-field="image_url" value="${escapeHtml(feature.image_url || "")}" placeholder="Public URL">
            <input data-feature-upload data-folder="icons" data-max-width="500" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <button class="admin-button" type="button" data-save-feature>שמירת יתרון</button>
  </article>`;
}

async function loadFeatures() {
  const { data, error } = await client().from("site_features").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  document.getElementById("featuresAdmin").innerHTML = (data || []).map(featureTemplate).join("");
}

async function saveFeature(row) {
  const payload = rowPayload(row, "feature");
  const { error } = await client().from("site_features").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  showNotice("features", "היתרון נשמר בהצלחה");
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
  if (type === "product") {
    payload.name ||= "";
    payload.description ||= "";
    payload.image_url ||= "";
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
    const email = (document.getElementById("adminEmail").value || "").trim();
    const password = document.getElementById("adminPassword").value || "";

    if (!email || !password) {
      showLoginError("יש להזין כתובת מייל וסיסמה");
      return;
    }

    const btn = document.getElementById("loginButton");
    btn.disabled = true;
    btn.textContent = "מתחבר...";

    try {
      const { error } = await client().auth.signInWithPassword({ email, password });
      if (error) throw error;
      document.getElementById("logoutButton").classList.remove("hidden");
      showAdminApp();
      await initAdmin();
    } catch {
      showLoginError("כתובת המייל או הסיסמה שגויים");
    } finally {
      btn.disabled = false;
      btn.textContent = "כניסה לניהול";
    }
  });

  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await client().auth.signOut();
      showLoginScreen();
    });
  }

  document.getElementById("adminEmail").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("adminPassword").focus();
  });
  document.getElementById("adminPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("loginButton").click();
  });

  document.addEventListener("click", async (event) => {
    if (event.target.matches("[data-save-settings]")) {
      const scope = event.target.dataset.saveSettings || "home-settings";
      const settingsRoot = event.target.closest(".editor-card") || document;
      try { await saveSettings(scope, settingsRoot); } catch (error) { showNotice(scope, error.message, false); }
    }
    if (event.target.id === "addProduct") {
      document.getElementById("productsAdmin").insertAdjacentHTML("beforeend", productTemplate({ display_order: 0, is_active: true }));
    }
    if (event.target.id === "addFeature") {
      document.getElementById("featuresAdmin").insertAdjacentHTML("beforeend", featureTemplate({ display_order: 0, is_active: true }));
    }
    if (event.target.matches("[data-save-product]")) {
      try { await saveProduct(event.target.closest(".product-row")); } catch (error) { showNotice("products", error.message, false); }
    }
    if (event.target.matches("[data-save-feature]")) {
      try { await saveFeature(event.target.closest(".feature-row")); } catch (error) { showNotice("features", error.message, false); }
    }
  });

  document.addEventListener("change", async (event) => {
    const fileInput = event.target;
    if (!fileInput.matches("[data-upload], [data-product-upload], [data-feature-upload]")) return;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const preview = fileInput.closest("label, .image-tools").querySelector(".preview") || document.querySelector(`[data-preview="${fileInput.dataset.upload}"]`);
    if (preview) preview.src = URL.createObjectURL(file);
    try {
      const url = await uploadImageAsWebP(file, fileInput.dataset.folder, fileInput.dataset.maxWidth);
      const targetInput = fileInput.dataset.upload
        ? document.querySelector(`[data-setting="${fileInput.dataset.upload}"]`)
        : fileInput.parentElement.querySelector('[data-field="image_url"]');
      if (targetInput) targetInput.value = url;
      if (preview) preview.src = url;
    } catch (error) {
      showUploadMessage(error.message || "העלאת התמונה נכשלה", false);
    }
  });
}

async function checkExistingSession() {
  try {
    const { data } = await client().auth.getSession();
    if (data && data.session) {
      document.getElementById("logoutButton").classList.remove("hidden");
      showAdminApp();
      await initAdmin();
    }
  } catch {
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

document.addEventListener("DOMContentLoaded", async () => {
  setupEvents();
  setupHiddenAdminEntry();
  await checkExistingSession();
});
