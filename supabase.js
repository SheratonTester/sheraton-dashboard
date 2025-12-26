// supabase.js (repo root) - creates window.sb
// Requires: ./vendor/supabase-js.iife.min.js loaded BEFORE this file

(() => {
  const SUPABASE_URL = "https://jiarjsvoumbbilfsqftj.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_AB6JsEiTT1V5Bu5ANA0Qmw_yFE8M0NV";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("[supabase.js] Supabase library not found. Make sure vendor/supabase-js.iife.min.js loads first.");
    return;
  }

  try {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // needed for forgot-password reset link
        flowType: "pkce",
      },
    });

    console.log("[supabase.js] window.sb created OK");
  } catch (e) {
    console.error("[supabase.js] Failed to create client:", e);
  }
})();
