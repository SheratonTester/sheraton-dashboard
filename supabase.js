/* supabase.js (repo root)
   Creates a global Supabase client as window.sb
   Requires vendor/supabase-js.iife.min.js loaded first
*/
(function () {
  const SUPABASE_URL = "https://jiarjsvoumbbilfsqftj.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_AB6JsEiTT1V5Bu5ANA0Qmw_yFE8M0NV";

  if (!window.supabase) {
    console.error("Supabase library not loaded. Check: vendor/supabase-js.iife.min.js");
    return;
  }

  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  console.log("Supabase client ready:", !!window.sb);
})();
