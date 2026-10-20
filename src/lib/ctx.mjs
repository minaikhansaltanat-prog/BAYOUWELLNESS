import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGS, DEFAULT_LANG, t, pick, formatMoney, formatVolume, countProducts } from "./i18n.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));

function normBase(b) {
  let s = b || "/";
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s += "/";
  return s;
}

export const BASE = normBase(process.env.SITE_BASE);
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function loadData() {
  const site = read("content", "site.json");
  const categories = read("content", "categories.json").sort((a, b) => a.order - b.order);
  const products = read("content", "products.json").sort((a, b) => a.order - b.order);
  const guides = read("content", "guides.json");
  const images = read("content", "images.json");
  const partnersRaw = read("content", "partners.json");
  const today = new Date().toISOString().slice(0, 10);
  // Only verified + approved-for-publication partners with real coordinates are ever exposed.
  const partners = partnersRaw.filter(
    (p) =>
      p.status === "published" &&
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng) &&
      p.verifiedAt &&
      p.verifiedAt <= today
  );
  const visibleCategories = categories.filter((c) => c.visible);
  const productsByCat = Object.fromEntries(
    categories.map((c) => [c.id, products.filter((p) => p.categories.includes(c.id))])
  );
  return { site, categories, visibleCategories, products, guides, images, partners, productsByCat };
}

/** Path helpers. route "" = home. Always trailing slash. */
export const href = (lang, route = "") => `${BASE}${lang}/${route ? route.replace(/^\/+|\/+$/g, "") + "/" : ""}`;
export const asset = (p) => `${BASE}${p.replace(/^\/+/, "")}`;
export const absHref = (lang, route = "") => `${SITE_URL}/${lang}/${route ? route.replace(/^\/+|\/+$/g, "") + "/" : ""}`;
export const absAsset = (p) => `${SITE_URL}/${p.replace(/^\/+/, "")}`;

export const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function waLink(site, text) {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Responsive <img> from the optimizer manifest. */
export function img(data, name, { alt = "", sizes = "100vw", cls = "", loading = "lazy", priority = false, style = "" } = {}) {
  const m = data.images[name];
  if (!m) throw new Error(`Unknown image "${name}"`);
  const widths = m.widths;
  const largest = widths[widths.length - 1];
  const srcset = widths.map((w) => `${asset(`img/${name}-${w}.webp`)} ${w}w`).join(", ");
  const h = m.heights?.[largest] ?? Math.round(largest / m.ratio);
  return `<img class="${esc(cls)}" src="${asset(`img/${name}-${largest}.webp`)}" srcset="${srcset}" sizes="${esc(sizes)}" width="${largest}" height="${h}" alt="${esc(alt)}" ${
    priority ? 'fetchpriority="high" decoding="async"' : `loading="${loading}" decoding="async"`
  }${style ? ` style="${esc(style)}"` : ""}>`;
}

export function productView(data, p, lang) {
  const { site } = data;
  const price = p.price ?? null;
  const sale = p.salePrice ?? null;
  const unitKey = p.volume.unit === "g" ? "prod.weight" : "prod.size";
  return {
    ...p,
    url: href(lang, `product/${p.slug}`),
    typeText: pick(p.type, lang),
    shortText: pick(p.short, lang),
    purposeText: pick(p.purpose, lang),
    volumeText: formatVolume(lang, p.volume),
    volumeLabel: t(lang, unitKey),
    priceText: price != null ? formatMoney(lang, sale ?? price, site) : null,
    oldPriceText: price != null && sale != null ? formatMoney(lang, price, site) : null,
    discountPct: price != null && sale != null ? Math.round((1 - sale / price) * 100) : null,
    categoryNames: p.categories
      .map((id) => data.categories.find((c) => c.id === id))
      .filter((c) => c && c.visible)
      .map((c) => ({ id: c.id, name: pick(c.name, lang) })),
    imageAlt: (view, i = 0) => `${p.brand} ${p.name}, ${p.volume.value} ${t(lang, `unit.${p.volume.unit}`)}${i === 0 ? "" : `, ${t(lang, `alt.${view}`)}`}`
  };
}

export { LANGS, DEFAULT_LANG, t, pick, formatMoney, formatVolume, countProducts };
