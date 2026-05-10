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
      <label class="field-label">שם הטעם <input data-field="name" value="${escapeHtml(product.name || "")}"></label>
      <label class="field-label">סדר <input data-field="display_order" type="number" value="${product.display_order || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${product.is_active !== false ? "selected" : ""}>כן</option><option value="false" ${product.is_active === false ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">תיאור <textarea data-field="description">${escapeHtml(product.description || "")}</textarea></label>
      <label class="field-label wide">תמונה
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(product.image_url || "assets/logo.png")}" alt="Preview">
          <div>
            <input data-field="image_url" value="${escapeHtml(product.image_url || "")}" placeholder="כתובת תמונה">
            <input data-product-upload data-folder="products" data-max-width="900" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <button class="admin-button" type="button" data-save-product>שמירה</button>
  </article>`;
}

const SITE_PRODUCTS_STATIC = [
  { name: "אוראו דרים", image: "A7404929.webp", description: "עוגיית אוראו עשירה עם מטבעות שוקולד חלב, מילוי קרם אוראו ושברי אוראו מעל." },
  { name: "כריות נוגט", image: "A7404958.webp", description: "עוגייה מפנקת עם כריות נוגט, שוקולד חלב, קרם אגוזי לוז ושוקולד לבן." },
  { name: "קוקילוטוס", image: "A7404990.webp", description: "עוגיית לוטוס עשירה עם שוקולד לבן, מילוי קרם לוטוס ועוגיית לוטוס מעל." },
  { name: "פיסטצ׳יו", image: "A7404980.webp", description: "עוגיית פיסטוק עם שוקולד לבן, קרם פיסטוק, קרם שוקולד לבן ופיסטוק גרוס." },
  { name: "במבה רד", image: "A7405005.webp", description: "עוגייה מתוקה ומיוחדת עם במבה אדומה, שוקולד לבן ומילוי קרם במבה אדומה." },
  { name: "קונפטי פאן", image: "A7404978.webp", description: "עוגייה צבעונית ושמחה עם סוכריות צבעוניות, שוקולד לבן וקרם ורוד." },
  { name: "ס׳מורשמלו", image: "A7404945.webp", description: "עוגיית קקאו עשירה עם שוקולד מריר, קרם אגוזי לוז ומרשמלו שרוף מעל." },
  { name: "קינדר", image: "A7404950.webp", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם קינדר בואנו ופניני שוקולד קראנץ׳." },
  { name: "קורנפלקס שוקולד לבן", image: "A7404939.webp", description: "עוגייה עשירה עם קורנפלקס, שוקולד לבן, קרם שוקולד לבן וקראנץ׳ מפנק." },
  { name: "קורנפלקס שוקולד חלב", image: "A7404956.webp", description: "עוגייה עשירה עם קורנפלקס, שוקולד חלב, קרם שוקולד אגוזים וקראנץ׳ שוקולדי." },
  { name: "אמסטרדם", image: "A7404918.webp", description: "עוגיית קקאו עשירה עם שוקולד חלב, מילוי שוקולד לבן וזילוף קרם שוקולד לבן." },
  { name: "שוקוצ׳יפס", image: "A7404900.webp", description: "עוגיית בצק עשירה עם מטבעות שוקולד חלב, קרם אגוזי לוז וזילוף שוקולד." },
  { name: "חצי-חצי", image: "A7404971.webp", description: "חצי בצק קקאו וחצי בצק קלאסי עם שוקולד חלב ולבן ושני מילויים מפנקים." },
  { name: "ברוקי", image: "A7404968.webp", description: "בראוניז שוקולד עשיר עם חתיכות בצק עוגיות, קרם שוקולד וזילוף אגוזי לוז." },
  { name: "שוקולד דובאי", image: "A7404987.webp", description: "עוגיית קקאו עם שוקולד חלב ולבן, מילוי קרם שוקולד דובאי ושיערות קדאיף." },
  { name: "מגולגלת קינדר", image: "A7404964.webp", description: "עוגיית קקאו עשירה עם שוקולד לבן, קרם קינדר בואנו ומגולגלת קינדר מעל." },
  { name: "פתיבר", image: "A7404912.webp", description: "עוגייה עשירה עם שוקולד חלב, מילוי קרם פתיבר, עוגיית פתיבר וסוכריות צבעוניות." }
];

async function loadProducts() {
  let supabaseProducts = [];
  try {
    const { data } = await client().from("products").select("*").order("display_order", { ascending: true });
    supabaseProducts = data || [];
  } catch (_) {}

  const supabaseByName = new Map(supabaseProducts.map((p) => [String(p.name || "").trim(), p]));

  const merged = SITE_PRODUCTS_STATIC.map((sp, index) => {
    const saved = supabaseByName.get(sp.name);
    if (saved) {
      supabaseByName.delete(sp.name);
      return saved;
    }
    return {
      id: crypto.randomUUID(),
      name: sp.name,
      description: sp.description,
      image_url: "prdimages/" + sp.image,
      display_order: index,
      is_active: true
    };
  });

  supabaseByName.forEach((p) => merged.push(p));

  document.getElementById("productsAdmin").innerHTML = merged.map(productTemplate).join("");
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
      <label class="field-label">כותרת <input data-field="title" value="${escapeHtml(feature.title || "")}"></label>
      <label class="field-label">סדר <input data-field="display_order" type="number" value="${feature.display_order || 0}"></label>
      <label class="field-label">מוצג באתר <select data-field="is_active"><option value="true" ${feature.is_active !== false ? "selected" : ""}>כן</option><option value="false" ${feature.is_active === false ? "selected" : ""}>לא</option></select></label>
      <label class="field-label">טקסט <textarea data-field="text">${escapeHtml(feature.text || "")}</textarea></label>
      <label class="field-label wide">תמונה (אופציונלי)
        <div class="image-tools">
          <img class="preview" src="${escapeHtml(feature.image_url || "assets/logo.png")}" alt="Preview">
          <div>
            <input data-field="image_url" value="${escapeHtml(feature.image_url || "")}" placeholder="כתובת תמונה">
            <input data-feature-upload data-folder="icons" data-max-width="500" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp">
          </div>
        </div>
      </label>
    </div>
    <button class="admin-button" type="button" data-save-feature>שמירה</button>
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
