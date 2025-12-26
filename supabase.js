<!-- =========================
FILE: supabase.js
Put this in repo root (same folder as index.html / fnb-outlets.html)
Requires: ./vendor/supabase-js.iife.min.js loaded BEFORE this file
========================= -->
<script>
/* global supabase */
(() => {
  // ✅ Your Supabase project info
  const SUPABASE_URL = "https://jiarjsvoumbbilfsqftj.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_AB6JsEiTT1V5Bu5ANA0Qmw_yFE8M0NV";

  // Optional: expose config
  window.SUPABASE_URL = SUPABASE_URL;

  function logHelp(){
    console.error(
      "[supabase.js] Supabase client not created.\n" +
      "Checklist:\n" +
      "1) vendor/supabase-js.iife.min.js exists + loads first\n" +
      "2) This file is named exactly supabase.js (case matters)\n" +
      "3) Paths in HTML use ./vendor/... and ./supabase.js\n"
    );
  }

  function createClientSafe(){
    try{
      const lib = window.supabase || (window.Supabase && window.Supabase.createClient);
      // UMD builds usually expose window.supabase.createClient
      if(!window.supabase || !window.supabase.createClient){
        logHelp();
        return null;
      }
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true, // needed for password reset links
          flowType: "pkce"
        }
      });
    }catch(e){
      console.error("[supabase.js] createClient failed:", e);
      logHelp();
      return null;
    }
  }

  // Create once
  const client = createClientSafe();
  if(client){
    window.sb = client; // ✅ everything in your pages uses window.sb
    console.log("[supabase.js] window.sb ready");
  }
})();
</script>
