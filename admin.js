const WEBP_QUALITY = 0.82;
const BUCKET = (window.LIOR_SUPABASE_CONFIG && window.LIOR_SUPABASE_CONFIG.STORAGE_BUCKET) || "site-images";

function client() {
  const supabaseClient = window.getLiorSupabaseClient ? window.getLiorSupabaseClient() : null;
  if (!supabaseClient) throw new Error("חסרים SUPABASE_URL או SUPABASE_ANON_KEY בקובץ supabase-config.js");
  return supabaseClient;
}

function adminPreviewSrc(url, placeholder = "assets/logo.png") {
  const raw = String(url || "").trim();
  if (!raw) return placeholder;
  if (typeof window.normalizeImagePath === "function") return window.normalizeImagePath(raw);
  if (/^https?:\/\//i.test(raw) || raw.startsWith("//") || raw.startsWith("/")) return raw;
  if (raw.startsWith("prdimages/")) return raw;
  return `prdimages/${raw}`;
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
    if (preview && row.value) preview.src = adminPreviewSrc(row.value);
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
  const isActive = product.is_active !== false;
  const priceVal = product.price != null ? String(product.price) : "";
  return `<article class="product-row${isActive ? "" : " product-inactive"}" data-product-id="${id}">
    <div class="grid">
      <label class="field-label">שם הטעם <input data-field="name" value="${escapeHtml(product.name || "")}"></label>
      <label class="field-label">סדר <input data-field="display_order" type="number" value="${product.display_order || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${isActive ? "selected" : ""}>כן</option><option value="false" ${!isActive ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">מחיר (אופציונלי) <input data-field="price" type="text" value="${escapeHtml(priceVal)}" placeholder="למשל 28 או ₪28"></label>
      <label class="field-label">תיאור <textarea data-field="description">${escapeHtml(product.description || "")}</textarea></label>
      <label class="field-label wide">תמונה מלאה
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(adminPreviewSrc(product.image_url))}" alt="Preview">
          <div>
            <input data-field="image_url" value="${escapeHtml(product.image_url || "")}" placeholder="כתובת תמונה מלאה">
            <input data-product-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
      <label class="field-label wide">תמונת כרטיס
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(adminPreviewSrc(product.card_image_url || product.image_url))}" alt="Preview">
          <div>
            <input data-field="card_image_url" value="${escapeHtml(product.card_image_url || "")}" placeholder="כתובת תמונה או העלאה">
            <input data-product-card-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <div class="product-actions">
      <button class="admin-button" type="button" data-save-product>שמירת מוצר</button>
      <button class="admin-button ${isActive ? "muted" : "secondary"}" type="button" data-toggle-product data-active="${isActive}">${isActive ? "הסתר מהאתר" : "הצג באתר"}</button>
    </div>
  </article>`;
}

async function loadProducts() {
  const { data, error } = await client().from("products").select("*").order("display_order", { ascending: true });
  if (error) {
    showNotice("products", "שגיאה בטעינת המוצרים: " + error.message, false);
    return;
  }

  const supabaseProducts = data || [];
  const container = document.getElementById("productsAdmin");
  if (!supabaseProducts.length) {
    container.innerHTML = '<p class="hint admin-empty-hint">אין מוצרים במסד הנתונים. אפשר להוסיף מוצרים כאן או להריץ את קובץ seed-content.sql בפרויקט Supabase לנתוני פתיחה בלבד.</p>';
    return;
  }

  container.innerHTML = supabaseProducts.map(productTemplate).join("");
}

async function saveProduct(row) {
  const payload = rowPayload(row, "product");
  const { error } = await client().from("products").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  row.classList.toggle("product-inactive", !payload.is_active);
  const toggleBtn = row.querySelector("[data-toggle-product]");
  if (toggleBtn) {
    toggleBtn.dataset.active = String(payload.is_active);
    toggleBtn.textContent = payload.is_active ? "הסתר מהאתר" : "הצג באתר";
    toggleBtn.className = `admin-button ${payload.is_active ? "muted" : "secondary"}`;
  }
  showNotice("products", "המוצר נשמר בהצלחה");
}

async function toggleProductActive(row) {
  const id = row.dataset.productId;
  const btn = row.querySelector("[data-toggle-product]");
  const select = row.querySelector('[data-field="is_active"]');
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
  row.classList.toggle("product-inactive", !newActive);
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
          <img class="preview" src="${escapeHtml(adminPreviewSrc(feature.image_url))}" alt="Preview">
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
          <img class="preview" src="${escapeHtml(adminPreviewSrc(imageRow.image_url))}" alt="Preview">
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
  document.getElementById("featuresAdmin").innerHTML = (data || []).map(featureTemplate).join("");
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
      document.getElementById("logoutButton").classList.remove("hidden");
      showAdminApp();
      await initAdmin();
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
      await client().auth.signOut();
      showLoginScreen();
    });
  }

  document.getElementById("adminUsername").addEventListener("keydown", (e) => {
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
      const wrap = document.getElementById("productsAdmin");
      const emptyHint = wrap.querySelector(".admin-empty-hint");
      if (emptyHint) wrap.innerHTML = "";
      wrap.insertAdjacentHTML("beforeend", productTemplate({ display_order: 0, is_active: true }));
    }
    if (event.target.id === "addFeature") {
      document.getElementById("featuresAdmin").insertAdjacentHTML("beforeend", featureTemplate({ display_order: 0, is_active: true }));
    }
    if (event.target.id === "addGalleryImage") {
      document.getElementById("galleryAdmin").insertAdjacentHTML("beforeend", galleryTemplate({ display_order: 0, is_active: true }));
    }
    if (event.target.matches("[data-save-product]")) {
      try { await saveProduct(event.target.closest(".product-row")); } catch (error) { showNotice("products", error.message, false); }
    }
    if (event.target.matches("[data-toggle-product]")) {
      try { await toggleProductActive(event.target.closest(".product-row")); } catch (error) { showNotice("products", error.message, false); }
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

  document.addEventListener("change", async (event) => {
    const fileInput = event.target;
    if (!fileInput.matches("[data-upload], [data-product-upload], [data-product-card-upload], [data-feature-upload], [data-gallery-upload]")) return;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const preview = fileInput.closest("label, .image-tools").querySelector(".preview") || document.querySelector(`[data-preview="${fileInput.dataset.upload}"]`);
    if (preview) preview.src = URL.createObjectURL(file);
    try {
      const url = await uploadImageAsWebP(file, fileInput.dataset.folder, fileInput.dataset.maxWidth);
      let targetInput = null;
      if (fileInput.dataset.upload) {
        targetInput = document.querySelector(`[data-setting="${fileInput.dataset.upload}"]`);
      } else if (fileInput.matches("[data-product-card-upload]")) {
        targetInput = fileInput.closest(".image-tools")?.parentElement?.querySelector('[data-field="card_image_url"]');
      } else {
        targetInput = fileInput.parentElement.querySelector('[data-field="image_url"]');
      }
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
