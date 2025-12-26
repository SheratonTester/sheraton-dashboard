// app.js (repo root) - shared helpers for all pages
// Requires (in this order on every page):
// 1) vendor/supabase-js.iife.min.js
// 2) supabase.js (must set window.sb = supabase.createClient(...))
// 3) app.js

window.App = (function () {
  const TZ = "America/Toronto";

  function $(id) { return document.getElementById(id); }

  function showError(msg, boxId = "errorBox") {
    const box = $(boxId);
    if (!box) return;
    box.textContent = msg;
    box.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showOk(msg, boxId = "okBox") {
    const box = $(boxId);
    if (!box) return;
    box.textContent = msg;
    box.style.display = "block";
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach(el => {
      el.textContent = "";
      el.style.display = "none";
    });
  }

  function hideBox(boxId) {
    const box = $(boxId);
    if (!box) return;
    box.style.display = "none";
    box.textContent = "";
  }

  function fileName() {
    const p = (location.pathname || "").split("/").pop();
    return p || "index.html";
  }

  function currentRelative() {
    // Keep it simple for GitHub Pages: only keep file + query + hash
    const f = fileName();
    return f + (location.search || "") + (location.hash || "");
  }

  function buildUrl(path, params = {}) {
    const u = new URL(path, window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      u.searchParams.set(k, String(v));
    });
    return u.toString();
  }

  function getSB() {
    if (!window.sb) throw new Error("Supabase client not found. Make sure supabase.js sets window.sb");
    return window.sb;
  }

  async function getUser() {
    const sb = getSB();
    const { data, error } = await sb.auth.getUser();
    if (error) console.warn("auth.getUser error:", error);
    return data?.user || null;
  }

  async function getProfile(userId) {
    const sb = getSB();
    const { data, error } = await sb
      .from("profiles")
      .select("user_id, email, full_name, role, department, phone, onboarding_completed, password_set_at, profile_completed_at, is_active")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.warn("getProfile error:", error);
      return null; // treat as missing
    }
    return data || null;
  }

  // THE IMPORTANT BIT:
  // - If not logged in => send to index.html
  // - If logged in but onboarding not complete => force onboarding.html
  async function guardOnboarding(opts = {}) {
    const loginPage = opts.loginPage || "index.html";
    const onboardingPage = opts.onboardingPage || "onboarding.html";

    const current = fileName();
    const isLogin = current === loginPage || current === "";
    const isOnboarding = current === onboardingPage;

    const sb = getSB();
    const user = await getUser();

    // Not logged in
    if (!user) {
      // If already on login page, do nothing
      if (isLogin) return { ok: true, state: "logged_out_on_login" };

      // Otherwise, send to login and remember where they wanted to go
      const next = currentRelative();
      window.location.href = buildUrl(loginPage, { next });
      return { ok: false, state: "redirect_login" };
    }

    // Logged in: check onboarding status
    const profile = await getProfile(user.id);

    const onboardingDone = !!(profile && profile.onboarding_completed);

    // If not done and not already on onboarding page, force it
    if (!onboardingDone && !isOnboarding) {
      const next = currentRelative();
      window.location.href = buildUrl(onboardingPage, { next });
      return { ok: false, state: "redirect_onboarding" };
    }

    // If done but they are on onboarding page, send them forward
    if (onboardingDone && isOnboarding) {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next");
      window.location.href = next ? next : loginPage;
      return { ok: false, state: "redirect_after_onboarding" };
    }

    return { ok: true, state: onboardingDone ? "ready" : "onboarding" };
  }

  // Auto-run guard on every page load (no extra edits per page)
  document.addEventListener("DOMContentLoaded", () => {
    // If a page wants to disable this, set: window.AppDisableAutoGuard = true; before app.js loads
    if (window.AppDisableAutoGuard) return;
    guardOnboarding().catch(err => console.warn("guardOnboarding failed:", err));
  });

  return {
    TZ,
    $,
    showError,
    showOk,
    clearErrors,
    hideBox,
    fileName,
    currentRelative,
    buildUrl,
    getSB,
    getUser,
    getProfile,
    guardOnboarding
  };
})();
