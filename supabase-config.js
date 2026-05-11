/*
  Supabase public configuration for GitHub Pages.
  Replace the placeholders below with your Supabase project URL and anon public key.
  Never place a service role key in client-side code.
*/

/** Normalize repo-relative image refs without doubling `prdimages/`. */
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
