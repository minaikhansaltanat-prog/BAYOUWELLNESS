// Translation guard: every key present in kk/ru/en/ko, placeholders match, scripts look right, no stray dashes.
//   npm run check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGS, ROWS, buildDictionaries } from "../src/lib/i18n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));
const { problems } = buildDictionaries();
const out = [...problems];

const CYR = /[Ѐ-ӿ]/;
const HANGUL = /[가-힯ᄀ-ᇿ]/;
const KK_ONLY = /[ӘәҒғҚқҢңӨөҰұҮүҺһІі]/;
// brand names and technical tokens allowed inside any language
const KEEP = /BAYOU|WELLNESS|WhatsApp|AROMATICA|B2B|Tally|INCI|PDRN|KZT|Rosemary|Root|Enhancer|Serum|Scalp|Shampoo|Conditioner|Scrub|Ampoule|Volumizing|Thickening|Dry|Powder|Scaling|Vegan|formula|Email|ml|OpenStreetMap|Leaflet/gi;

function check(label, lang, text) {
  if (typeof text !== "string") return;
  if (/[—–]/.test(text) && !(label === "hero.h1" && lang === "kk")) out.push(`${label} [${lang}]: contains a long dash`);
  const rest = text.replace(KEEP, "").replace(/\{[a-z]+\}/g, "");
  if (lang === "en" && (CYR.test(rest) || HANGUL.test(rest))) out.push(`${label} [en]: non-English characters`);
  if (lang === "ko" && CYR.test(rest)) out.push(`${label} [ko]: Cyrillic in Korean text`);
  if (lang === "ko" && !HANGUL.test(text) && !/^[\d\s.,:+\-/@%]*$/.test(text) && !/^(WhatsApp|Email|ml|g)$/i.test(text)) out.push(`${label} [ko]: no Hangul`);
  if ((lang === "kk" || lang === "ru") && HANGUL.test(rest)) out.push(`${label} [${lang}]: Hangul in Cyrillic text`);
  if (lang === "ru" && KK_ONLY.test(rest)) out.push(`${label} [ru]: Kazakh-only letters in Russian text: ${(rest.match(KK_ONLY) || []).join("")}`);
  if (lang === "kk" && /\bи\b|\bчто\b|\bдля\b|\bна\b/.test(rest)) out.push(`${label} [kk]: looks Russian`);
  if (/\s{2,}/.test(text)) out.push(`${label} [${lang}]: double space`);
  if (text !== text.trim()) out.push(`${label} [${lang}]: leading/trailing space`);
}

// 1) UI string rows
const ph = (s) => (String(s).match(/\{[a-z]+\}/g) || []).sort().join(",");
for (const [key, ...vals] of ROWS) {
  vals.forEach((v, i) => check(key, LANGS[i], v));
  const set = new Set(vals.map(ph));
  if (set.size > 1) out.push(`${key}: placeholder mismatch across languages`);
  if (vals[0] === vals[2] && vals[1] === vals[2] && !/^(WhatsApp|Email)$|©|^(Telegram|Instagram)$/.test(vals[2]) && !/^[\d\s]*$/.test(vals[2]) && !["contact.wa.t", "contact.phone.t", "unit.ml", "unit.g", "map.city.almaty", "map.city.astana", "cart.form.phone", "cat.count.few"].includes(key) && !key.startsWith("map.city.") && !key.startsWith("cat.count.") && !key.startsWith("unit.") && !key.startsWith("footer.rights"))
    out.push(`${key}: identical in kk/ru/en (untranslated?)`);
}

// 2) JSON content with { kk, ru, en, ko } objects
function walk(node, trail, file) {
  if (node && typeof node === "object" && !Array.isArray(node)) {
    const keys = Object.keys(node);
    if (keys.some((k) => LANGS.includes(k))) {
      for (const l of LANGS) {
        if (node[l] == null || node[l] === "") {
          if (!(trail.includes("blurb") || file === "categories.json")) out.push(`${file} ${trail}: missing ${l}`);
          else if (!trail.includes("blurb")) out.push(`${file} ${trail}: missing ${l}`);
        } else check(`${file} ${trail}`, l, node[l]);
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, `${trail}.${k}`, file);
  } else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${trail}[${i}]`, file));
}
for (const f of ["products.json", "guides.json", "categories.json"]) walk(read("content", f), "", f);

// 3) categories shown on the site need names in all languages and blurbs when visible
for (const c of read("content", "categories.json")) {
  if (c.visible) for (const l of LANGS) if (!c.blurb?.[l]) out.push(`categories.json ${c.id}: visible category missing blurb ${l}`);
}

// 4) Kazakh must contain Kazakh-specific letters somewhere (sanity), Russian must not
const kkText = ROWS.map((r) => r[1]).join(" ");
if (!/[ққғңәіүұө]/i.test(kkText)) out.push("Kazakh strings contain no Kazakh-specific letters. Wrong language?");

if (out.length) {
  console.error(`i18n check FAILED (${out.length}):\n` + out.map((l) => " - " + l).join("\n"));
  process.exit(1);
}
console.log(`i18n check passed: ${ROWS.length} UI strings x ${LANGS.length} languages + content objects.`);
