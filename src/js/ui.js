import { $, $$, cfg, t, url, debounce, track, safeStorage } from "./core.js";

const LOCK = "is-locked";

/* ---------------- header state ---------------- */
export function initHeader() {
  const header = $("[data-header]");
  if (!header || !("IntersectionObserver" in window)) return;
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none;visibility:hidden";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => header.classList.toggle("is-scrolled", !e.isIntersecting)).observe(sentinel);
}

/* ---------------- generic overlay (menu / search) ---------------- */
function overlay(root, { onOpen, onClose } = {}) {
  let opener = null;
  const open = (from) => {
    if (root.classList.contains("is-open")) return;
    opener = from || document.activeElement;
    root.removeAttribute("inert");
    root.setAttribute("aria-hidden", "false");
    root.classList.add("is-open");
    document.documentElement.classList.add(LOCK);
    onOpen?.();
  };
  const close = (restore = true) => {
    if (!root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("inert", "");
    if (!$(".menu.is-open") && !$(".search.is-open")) document.documentElement.classList.remove(LOCK);
    onClose?.();
    if (restore && opener && document.contains(opener)) opener.focus({ preventScroll: true });
  };
  return { open, close, isOpen: () => root.classList.contains("is-open") };
}

export function initMenu() {
  const root = $("[data-menu]");
  if (!root) return;
  const btn = $("[data-menu-open]");
  const o = overlay(root, {
    onOpen: () => {
      btn?.setAttribute("aria-expanded", "true");
      setTimeout(() => $(".menu__close", root)?.focus({ preventScroll: true }), 60);
    },
    onClose: () => btn?.setAttribute("aria-expanded", "false")
  });
  btn?.addEventListener("click", () => o.open(btn));
  $$("[data-menu-close]", root).forEach((el) => el.addEventListener("click", () => o.close()));
  $$("a", root).forEach((a) => a.addEventListener("click", () => o.close(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && o.isOpen()) o.close(); });
  window.matchMedia("(min-width: 1180px)").addEventListener("change", (m) => { if (m.matches) o.close(false); });
  window.addEventListener("pageshow", () => o.close(false));
  window.__menu = o;
}

/* ---------------- language ---------------- */
export function initLang() {
  const d = $("[data-lang]");
  if (d) {
    document.addEventListener("click", (e) => { if (d.open && !d.contains(e.target)) d.open = false; });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && d.open) { d.open = false; $("summary", d)?.focus(); } });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-lang-link]");
    if (a) safeStorage.set("bayou_lang", a.dataset.langLink);
  });
  // keep ?query and #hash when switching language on the same page
  const suffix = location.search + location.hash;
  if (suffix) $$("[data-lang-link]").forEach((a) => { a.href += suffix; });
}

/* ---------------- search ---------------- */
let searchData = null;
export function initSearch() {
  const root = $("[data-search]");
  if (!root) return;
  const input = $("[data-search-input]", root);
  const results = $("[data-search-results]", root);
  const form = $("[data-search-form]", root);
  const o = overlay(root, { onOpen: () => setTimeout(() => input?.focus(), 80) });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = async () => {
    if (searchData) return searchData;
    try {
      const r = await fetch(url(`data/${cfg.lang}.json`));
      searchData = await r.json();
    } catch {
      searchData = { products: [], guides: [], pages: [] };
    }
    return searchData;
  };
  const render = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = `<p class="search__hint">${esc(t("search.hint"))}</p>`; return; }
    const d = await load();
    const match = (x) => q.split(/\s+/).every((w) => x.text.includes(w));
    const p = d.products.filter(match).slice(0, 6);
    const g = d.guides.filter(match).slice(0, 4);
    const pg = d.pages.filter(match).slice(0, 4);
    if (!p.length && !g.length && !pg.length) { results.innerHTML = `<p class="search__hint">${esc(t("search.empty"))}</p>`; return; }
    let html = "";
    if (p.length) html += `<p class="search__group">${esc(t("search.products"))}</p>` + p.map((x) => `<a class="search__item" href="${x.url}"><span class="search__thumb"><img src="${x.img}" alt="" loading="lazy" width="48" height="48"></span><span class="search__name">${esc(x.name)}<span class="search__sub">${esc(x.type)}</span></span></a>`).join("");
    if (g.length) html += `<p class="search__group">${esc(t("search.guides"))}</p>` + g.map((x) => `<a class="search__item" href="${x.url}"><span class="search__name">${esc(x.title)}</span></a>`).join("");
    if (pg.length) html += `<p class="search__group">${esc(t("search.pages"))}</p>` + pg.map((x) => `<a class="search__item" href="${x.url}"><span class="search__name">${esc(x.title)}</span></a>`).join("");
    results.innerHTML = html;
  };
  input.addEventListener("input", debounce(render, 120));
  form.addEventListener("submit", (e) => { e.preventDefault(); $(".search__item", results)?.click(); });
  $$("[data-search-open]").forEach((b) => b.addEventListener("click", () => { window.__menu?.close(false); o.open(b); }));
  $$("[data-search-close]", root).forEach((b) => b.addEventListener("click", () => o.close()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && o.isOpen()) o.close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !o.isOpen() && !/^(input|textarea|select)$/i.test(document.activeElement?.tagName || "")) { e.preventDefault(); o.open(); }
  });
  results.addEventListener("click", (e) => { if (e.target.closest("a")) o.close(false); });
}

/* ---------------- WhatsApp floating button ---------------- */
export function initFab() {
  const fab = $("[data-wa-fab]");
  const bubble = $("[data-wa-bubble]");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-track-wa]");
    if (a) track("whatsapp_click", { location: a.dataset.trackWa });
  });
  if (!fab || !bubble || safeStorage.sget("bayou_wa_bubble")) return;
  const show = setTimeout(() => {
    bubble.classList.add("is-open");
    safeStorage.sset("bayou_wa_bubble", "1");
    setTimeout(() => bubble.classList.remove("is-open"), 7500);
  }, 6000);
  fab.addEventListener("click", () => { clearTimeout(show); bubble.classList.remove("is-open"); });
}
