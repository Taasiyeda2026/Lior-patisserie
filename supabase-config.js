/*
  Supabase public configuration for GitHub Pages.
  Replace the placeholders below with your Supabase project URL and anon public key.
  Never place a service role key in client-side code.
*/

/** Normalize repo-relative image refs without doubling `prdimages/`. */
window.normalizeImagePath = function normalizeImagePath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("//") || path.startsWith("/")) return path;
  if (path.startsWith("prdimages/")) return path;
  return `prdimages/${path}`;
};

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
    window.liorSupabaseClient = window.supabase.createClient(
      config.SUPABASE_URL,
      config.SUPABASE_ANON_KEY
    );
  }

  return window.liorSupabaseClient;
};
