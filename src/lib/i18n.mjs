import ui from "../i18n/ui.mjs";
import home from "../i18n/home.mjs";
import pages from "../i18n/pages.mjs";

export const LANGS = ["kk", "ru", "en", "ko"];
export const DEFAULT_LANG = "kk";
export const LANG_META = {
  kk: { name: "Қазақша", short: "ҚАЗ", locale: "kk-KZ", og: "kk_KZ", hreflang: "kk" },
  ru: { name: "Русский", short: "РУС", locale: "ru-RU", og: "ru_RU", hreflang: "ru" },
  en: { name: "English", short: "ENG", locale: "en-US", og: "en_US", hreflang: "en" },
  ko: { name: "한국어", short: "한국어", locale: "ko-KR", og: "ko_KR", hreflang: "ko" }
};

export const ROWS = [...ui, ...home, ...pages];

/** Build { kk: {key: text}, ru: {...}, ... } and report malformed rows. */
export function buildDictionaries() {
  const dict = Object.fromEntries(LANGS.map((l) => [l, {}]));
  const problems = [];
  const seen = new Set();
  for (const row of ROWS) {
    const [key, ...vals] = row;
    if (seen.has(key)) problems.push(`duplicate key: ${key}`);
    seen.add(key);
    if (vals.length !== LANGS.length) {
      problems.push(`${key}: expected ${LANGS.length} translations, got ${vals.length}`);
      continue;
    }
    LANGS.forEach((l, i) => {
      if (!vals[i] || !String(vals[i]).trim()) problems.push(`${key}: empty ${l}`);
      dict[l][key] = vals[i];
    });
  }
  return { dict, problems };
}

const { dict: DICT } = buildDictionaries();

export function t(lang, key, vars) {
  let s = DICT[lang]?.[key];
  if (s == null) throw new Error(`Missing i18n key "${key}" for ${lang}`);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Pick a localized value from a { kk, ru, en, ko } object. */
export function pick(obj, lang) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  const v = obj[lang];
  if (v == null || v === "") throw new Error(`Missing localized value for ${lang}: ${JSON.stringify(obj).slice(0, 80)}`);
  return v;
}

/** Subset of the dictionary shipped to the browser (strings the JS needs). */
export function clientDictionary(lang, prefixes) {
  const out = {};
  for (const [k, v] of Object.entries(DICT[lang])) {
    if (prefixes.some((p) => k === p || k.startsWith(p))) out[k] = v;
  }
  return out;
}

export function pluralKey(lang, n) {
  if (lang === "ru") {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "one";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "few";
    return "many";
  }
  if (lang === "en") return n === 1 ? "one" : "many";
  return "many";
}

export function countProducts(lang, n) {
  return t(lang, `cat.count.${pluralKey(lang, n)}`, { n });
}

export function formatMoney(lang, amount, site) {
  const nf = new Intl.NumberFormat(LANG_META[lang].locale, { maximumFractionDigits: 0 });
  const num = nf.format(amount).replace(/ /g, " ");
  return `${num} ${site.currency.symbol}`;
}

export function formatVolume(lang, vol) {
  return `${vol.value} ${t(lang, `unit.${vol.unit}`)}`;
}
