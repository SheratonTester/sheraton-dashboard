// app.js (repo root) - shared helpers for all pages
// Requires: vendor/supabase-js.iife.min.js then supabase.js (window.sb)

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

  function clearErrors() {
    document.querySelectorAll(".error").forEach(el => {
      el.textContent = "";
      el.style.display = "none";
    });
  }

  function fmtTorontoDateTime(ts) {
    if (!ts) return "—";
    const d = (ts instanceof Date) ? ts : new Date(ts);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(d);
  }

  function toISODate(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }

  function addDaysISO(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return toISODate(dt);
  }

  function isoToDisplay(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short" }).format(dt);
    return `${iso} (${day})`;
  }

  async function getSession() {
    const { data, error } = await window.sb.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(email, password) {
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await window.sb.auth.signOut();
    if (error) throw error;
  }

  async function loadProfile(userId) {
    const { data, error } = await window.sb
      .from("profiles")
      .select("user_id,email,full_name,role,department,is_active")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Profile not found.");
    if (data.is_active === false) throw new Error("Your account is inactive. Contact an admin.");
    return data;
  }

  async function requireProfile(throwIfMissing = true) {
    const session = await getSession();
    if (!session?.user) {
      if (throwIfMissing) throw new Error("Not logged in.");
      return null;
    }
    return await loadProfile(session.user.id);
  }

  async function mapProfilesByUserId(userIds) {
    const ids = [...new Set((userIds || []).filter(Boolean))];
    if (!ids.length) return new Map();

    const { data, error } = await window.sb
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", ids);

    if (error) throw error;

    const m = new Map();
    (data || []).forEach(p => {
      m.set(p.user_id, p.full_name || p.email || p.user_id);
    });
    return m;
  }

  function canEdit(profile, area) {
    // area: 'restaurant' | 'lobbybar' | 'outlets'
    const role = profile.role || "viewer";
    const dept = profile.department || "";

    if (role === "admin") return true;
    if (role === "viewer") return false;
    if (role !== "user") return false;

    if (area === "restaurant") return dept === "F&B";
    if (area === "lobbybar") return dept === "F&B";
    if (area === "outlets") return dept === "Outlets";
    return false;
  }

  function initCommon() {
    if (!window.supabase) {
      showError("Supabase library not loaded. Check vendor/supabase-js.iife.min.js path and script order.");
      return;
    }
    if (!window.sb) {
      showError("Supabase client not loaded. Check supabase.js and your keys.");
      return;
    }
  }

  return {
    TZ,
    $,
    showError,
    clearErrors,
    fmtTorontoDateTime,
    toISODate,
    addDaysISO,
    isoToDisplay,
    getSession,
    signIn,
    signOut,
    loadProfile,
    requireProfile,
    mapProfilesByUserId,
    canEdit,
    initCommon
  };
})();
