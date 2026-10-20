// Static SEO + accessibility audit over dist/ (run after `npm run build`).
//   node tools/audit.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (!["assets", "img", "fonts", "vendor", "data"].includes(f.name)) walk(p); }
    else if (f.name.endsWith(".html")) files.push(p);
  }
})(DIST);

const issues = [];
const titles = new Map();
const descs = new Map();
const stats = { pages: 0 };
const add = (page, sev, msg) => issues.push(`${sev} ${page}: ${msg}`);

for (const file of files) {
  const rel = path.relative(DIST, file).replaceAll("\\", "/");
  if (rel === "index.html") continue; // language router
  const html = fs.readFileSync(file, "utf8");
  stats.pages++;
  const lang = html.match(/<html lang="(\w+)"/)?.[1];
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const noindex = /<meta name="robots" content="noindex/.test(html);

  // ---- SEO ----
  if (!title) add(rel, "FAIL", "no <title>");
  if (title.length > 70) add(rel, "WARN", `title ${title.length} chars: ${title}`);
  if (title.length < 15) add(rel, "WARN", `title short (${title.length})`);
  if (!desc) add(rel, "FAIL", "no meta description");
  if (desc.length > 320) add(rel, "WARN", `description ${desc.length} chars`);
  if (!noindex) {
    const tk = `${lang}|${title}`;
    if (titles.has(tk)) add(rel, "FAIL", `duplicate title with ${titles.get(tk)}`);
    titles.set(tk, rel);
    const dk = `${lang}|${desc}`;
    if (descs.has(dk) && !rel.endsWith("404.html")) add(rel, "WARN", `duplicate description with ${descs.get(dk)}`);
    descs.set(dk, rel);
  }
  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) add(rel, "FAIL", `${h1s.length} <h1>`);
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) { add(rel, "WARN", `heading jump h${levels[i - 1]} -> h${levels[i]}`); break; }
  if (!/<link rel="canonical" href="https?:\/\//.test(html)) add(rel, "FAIL", "no absolute canonical");
  for (const l of ["kk", "ru", "en", "ko", "x-default"]) if (!html.includes(`hreflang="${l}"`)) add(rel, "FAIL", `missing hreflang ${l}`);
  for (const p of ["og:title", "og:description", "og:image", "og:url", "og:locale"]) if (!html.includes(`property="${p}"`)) add(rel, "FAIL", `missing ${p}`);
  if (!html.includes('name="twitter:card"')) add(rel, "WARN", "no twitter:card");
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { add(rel, "FAIL", "invalid JSON-LD"); }
  }
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt="/.test(m[1])) add(rel, "FAIL", "img without alt attribute");
    if (!/\bwidth="/.test(m[1]) || !/\bheight="/.test(m[1])) add(rel, "WARN", "img without width/height (CLS)");
  }

  // ---- accessibility ----
  if (!lang) add(rel, "FAIL", "no lang attribute");
  if (!/name="viewport"[^>]*initial-scale=1/.test(html)) add(rel, "FAIL", "viewport meta");
  if (/user-scalable=no|maximum-scale=1\b/.test(html)) add(rel, "FAIL", "zoom disabled");
  if (!/<main id="main"/.test(html)) add(rel, "FAIL", "no <main>");
  if (!/class="skip"/.test(html)) add(rel, "FAIL", "no skip link");
  if (!/<nav[^>]*aria-label/.test(html)) add(rel, "WARN", "nav without aria-label");
  // buttons / links need an accessible name
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = m[2].replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label="[^"]+"/.test(m[1])) add(rel, "FAIL", `button without name: ${m[1].slice(0, 60)}`);
  }
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const text = m[2].replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, "$1").replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label="[^"]+"/.test(m[1]) && !/aria-hidden="true"/.test(m[1])) add(rel, "FAIL", `link without name: ${m[1].slice(0, 70)}`);
  }
  // inputs need labels
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const a = m[2];
    if (/type="(hidden|radio|checkbox|submit)"/.test(a)) continue;
    const id = a.match(/\bid="([^"]+)"/)?.[1];
    if (!(id && new RegExp(`<label[^>]*for="${id}"`).test(html)) && !/aria-label="[^"]+"/.test(a)) add(rel, "FAIL", `form control without label: ${a.slice(0, 60)}`);
  }
  // aria-hidden containers must not contain focusable tabindex=0 controls
  if (/aria-hidden="true"[^>]*>\s*<button/.test(html)) add(rel, "WARN", "button directly inside aria-hidden");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) add(rel, "FAIL", `duplicate ids: ${[...new Set(dup)].join(", ")}`);
  for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) if (!ids.includes(m[1])) add(rel, "FAIL", `aria-controls target missing: ${m[1]}`);
  for (const m of html.matchAll(/<label[^>]*for="([^"]+)"/g)) if (!ids.includes(m[1])) add(rel, "FAIL", `label for missing id: ${m[1]}`);
}

// ---- contrast of the palette pairs actually used ----
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ["body text", "#202820", "#F7F9F6", 4.5], ["secondary text", "#667066", "#F7F9F6", 4.5], ["secondary on white", "#667066", "#FFFFFF", 4.5],
  ["secondary on gray-100", "#667066", "#EEF1EC", 4.5], ["link green-700 on bg", "#237900", "#F7F9F6", 4.5], ["green-700 on sage-100 (chips/tags)", "#237900", "#E8F3DB", 4.5],
  ["CTA ink on green-500", "#12240A", "#58C900", 4.5], ["CTA ink on gradient top", "#12240A", "#7FDE17", 4.5], ["CTA ink on gradient bottom", "#12240A", "#4DB300", 4.5],
  ["white on green-950", "#FFFFFF", "#153A08", 4.5], ["footer text rgba(255,255,255,.72) on green-950", "#C3CDBE", "#153A08", 4.5], ["green-300 on green-950", "#8BEA28", "#153A08", 4.5],
  ["white on red-700 (sale badge)", "#FFFFFF", "#C90012", 4.5], ["red-700 on white (errors)", "#C90012", "#FFFFFF", 4.5], ["red-700 on bg", "#C90012", "#F7F9F6", 4.5],
  ["placeholder #6B756B on white", "#6B756B", "#FFFFFF", 4.5], ["white on green-950 chip.is-active", "#FFFFFF", "#153A08", 4.5], ["ink on sage-200 (tag)", "#153A08", "#D3E8BE", 4.5],
  ["form control border #84917F on white (UI 3:1)", "#84917F", "#FFFFFF", 3]
];
const contrast = pairs.map(([n, f, b, req]) => ({ n, r: ratio(f, b), req }));
for (const c of contrast) if (c.r < c.req) issues.push(`${c.r < c.req - 0.5 ? "FAIL" : "WARN"} contrast: ${c.n} ${c.r.toFixed(2)}:1 < ${c.req}:1`);

const fails = issues.filter((i) => i.startsWith("FAIL"));
console.log(`audited ${stats.pages} pages | ${fails.length} FAIL, ${issues.length - fails.length} WARN`);
console.log(contrast.map((c) => `  contrast ${c.r.toFixed(1)}:1  ${c.n}`).join("\n"));
if (issues.length) console.log(issues.slice(0, 60).join("\n"));
process.exit(fails.length ? 1 : 0);
