/*
  Supabase public configuration for Lior's Pâtisserie.
  Replace the placeholders below with your Supabase project URL and anon public key.
  Never place a service role key in client-side code.
*/

/**
 * Normalize image refs without reviving deleted product folders.
 * - Full URLs (including Supabase Storage), protocol-relative, and root-absolute paths stay as-is.
 * - Site assets stay repo-relative.
 * - Storage-relative paths such as products/cards/name.jpg resolve to the public Supabase bucket.
 * - Unknown bare filenames intentionally return an empty string.
 */
window.normalizeImagePath = function normalizeImagePath(value) {
  let path = String(value || "").trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
  if (!path) return "";

  // Repair accidentally nested local asset prefixes introduced by icon-path edits.
  // Examples: assets/icons/admin/assets/logo.png -> assets/logo.png
  //           assets/icons/assets/logo.png       -> assets/logo.png
  path = path
    .replace(/^assets\/icons\/admin\/assets\//i, "assets/")
    .replace(/^assets\/icons\/assets\//i, "assets/")
    .replace(/^assets\/assets\//i, "assets/")
    .replace(/^images\/images\//i, "images/")
    .replace(/^attached_assets\/attached_assets\//i, "attached_assets/");

  if (/^https?:\/\//i.test(path) || path.startsWith("//") || path.startsWith("/")) return path;
  if (/^(assets|images|attached_assets)\//i.test(path)) return path;

  const config = window.LIOR_SUPABASE_CONFIG || {};
  const baseUrl = String(config.SUPABASE_URL || "").replace(/\/+$/, "");
  const bucket = String(config.STORAGE_BUCKET || "site-images").replace(/^\/+|\/+$/g, "");
  if (baseUrl && bucket && /^(products|icons|uploads|hero|site)\//i.test(path)) {
    return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  return "";
};

/** Shown when a product image has no working URL (data URI SVG). */
window.LIOR_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="688" viewBox="0 0 800 688">' +
      '<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1">' +
      '<stop stop-color="#fff9f2"/><stop offset="1" stop-color="#ebe2d6"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#p)"/>' +
      '<g opacity="0.22" fill="#c8a96a"><circle cx="400" cy="330" r="7"/><circle cx="424" cy="358" r="4"/></g>' +
      "</svg>"
  );

window.LIOR_SUPABASE_CONFIG = {
  SUPABASE_URL: "https://osehkbkeydhpesjlisuk.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_YMY-BeSAPGGYTa9L-PHsSg_JvCRteCP",
  STORAGE_BUCKET: "site-images",
  // Usernames are aliases for Supabase Auth emails. Passwords stay only in
  // Supabase Auth and must never be committed to this repository.
  ADMIN_USERS: [
    { username: "lior", email: "lior.patisserie@outlook.com" },
    { username: "tomer", email: "tomer@lior-patisserie.com" }
  ]
};

window.getLiorSupabaseClient = function getLiorSupabaseClient() {
  const config = window.LIOR_SUPABASE_CONFIG || {};

  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    return null;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    return null;
  }

  if (!window.liorSupabaseClient) {
    // Keep default session persistence (local storage). Admin idle lock is handled
    // separately in admin.js — do not set persistSession: false for UI timeout.
    window.liorSupabaseClient = window.supabase.createClient(
      config.SUPABASE_URL,
      config.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  return window.liorSupabaseClient;
};
