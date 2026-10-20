// Shared runtime: config, i18n lookup, analytics, toast, DOM helpers.
const readJson = (id) => {
  try {
    return JSON.parse(document.getElementById(id)?.textContent || "{}");
  } catch {
    return {};
  }
};

export const cfg = readJson("cfg");
export const dict = readJson("i18n");

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function t(key, vars) {
  let s = dict[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export const url = (path) => `${cfg.base}${path.replace(/^\/+/, "")}`;
export const pageUrl = (route = "") => `${cfg.base}${cfg.lang}/${route ? route.replace(/^\/+|\/+$/g, "") + "/" : ""}`;

const nf = new Intl.NumberFormat(cfg.locale || "en", { maximumFractionDigits: 0 });
export const money = (n) => `${nf.format(n).replace(/ /g, " ")} ${cfg.currency || "₸"}`;

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- analytics ----------------
   Pushes GTM-style events to window.dataLayer and forwards to GA4 / Yandex Metrika when ids are configured.
   Never send personal data here. */
const loaded = {};
function loadScript(src) {
  if (loaded[src]) return;
  loaded[src] = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}
export function initAnalytics() {
  const a = cfg.analytics || {};
  window.dataLayer = window.dataLayer || [];
  if (a.ga4) {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", a.ga4, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(a.ga4)}`);
  }
  if (a.yandexMetrika) {
    (function (m, e, t_, r, i, k, a_) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t_); a_ = e.getElementsByTagName(t_)[0]; k.async = 1; k.src = r; a_.parentNode.insertBefore(k, a_); })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(Number(a.yandexMetrika), "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
}
const debug = () => cfg.analytics?.debug || /[?&]debug_analytics/.test(location.search);
export function track(name, params = {}) {
  const payload = { ...params, language: cfg.lang };
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
    if (typeof window.gtag === "function") window.gtag("event", name, payload);
    if (typeof window.ym === "function" && cfg.analytics?.yandexMetrika) window.ym(Number(cfg.analytics.yandexMetrika), "reachGoal", name, payload);
    if (debug()) console.log("[analytics]", name, payload);
  } catch { /* analytics must never break the page */ }
}

/* ---------------- toast ---------------- */
let toastTimer;
export function toast(message, action) {
  const box = $("[data-toast]");
  if (!box) return;
  box.innerHTML = "";
  const inner = document.createElement("div");
  inner.className = "toast__box";
  inner.innerHTML = `<svg class="i" aria-hidden="true"><use href="#i-check-circle"/></svg>`;
  const span = document.createElement("span");
  span.textContent = message;
  inner.appendChild(span);
  if (action) {
    const a = document.createElement("a");
    a.className = "toast__link";
    a.href = action.href;
    a.textContent = action.label;
    inner.appendChild(a);
  }
  box.appendChild(inner);
  box.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("is-show"), 4200);
}

export function debounce(fn, ms = 160) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

export const safeStorage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  sset(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } }
};
