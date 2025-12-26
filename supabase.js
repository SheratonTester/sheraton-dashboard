// /supabase.js (repo root)
// This runs AFTER vendor/supabase-js.iife.min.js

const SUPABASE_URL = "https://jiarjsvoumbbilfsqftj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_AB6JsEiTT1V5Bu5ANA0Qmw_yFE8M0NV";

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
