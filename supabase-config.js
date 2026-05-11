/*
  Supabase public configuration for GitHub Pages.
  Replace the placeholders below with your Supabase project URL and anon public key.
  Never place a service role key in client-side code.
*/

/**
 * Normalize repo-relative image refs without doubling `prdimages/`.
 * - Full URLs (http/https), protocol-relative, and root-absolute paths stay as-is.
 * - Paths already under prdimages/ stay as-is (after collapsing duplicates).
 * - Other site-root paths (assets/, images/, attached_assets/) stay as-is.
 * - Bare filenames and paths like cards/*.webp get a single prdimages/ prefix.
 */
window.normalizeImagePath = function normalizeImagePath(value) {
  let path = String(value || "").trim().replace(/\\/g, "/");
  if (!path) return "";
  path = path.replace(/^\.\/+/, "");
  while (/^prdimages\/prdimages\//i.test(path)) {
    path = path.replace(/^prdimages\//i, "");
  }
  if (/^https?:\/\//i.test(path) || path.startsWith("//") || path.startsWith("/")) return path;
  if (/^prdimages\//i.test(path)) {
    return path.replace(/^prdimages\//i, "prdimages/");
  }
  if (/^(assets|images|attached_assets)\//i.test(path)) return path;
  return `prdimages/${path}`;
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
  STORAGE_BUCKET: "site-images"
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
