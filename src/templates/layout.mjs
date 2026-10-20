import { LANGS, DEFAULT_LANG, LANG_META, t, clientDictionary } from "../lib/i18n.mjs";
import { href, asset, absHref, absAsset, esc, waLink, img, BASE, SITE_URL } from "../lib/ctx.mjs";
import { icon, spriteSvg } from "../lib/icons.mjs";

export const NAV = [
  { route: "catalog", key: "nav.catalog" },
  { route: "guides", key: "nav.guidesShort" },
  { route: "partners/map", key: "nav.map" },
  { route: "partners/business", key: "nav.b2b" },
  { route: "about", key: "nav.about" },
  { route: "contact", key: "nav.contact" }
];

const FONT_PRELOAD = {
  kk: ["montserrat-cyrillic", "onest-cyrillic", "montserrat-latin"],
  ru: ["montserrat-cyrillic", "manrope-cyrillic", "montserrat-latin"],
  en: ["montserrat-latin", "manrope-latin"],
  ko: ["montserrat-latin", "manrope-latin"]
};

function logoImg(data, { cls = "", height = 44 } = {}) {
  const m = data.images.logo;
  const w = Math.round(height * m.ratio);
  return `<img class="${cls}" src="${asset("img/logo-480.webp")}" srcset="${asset("img/logo-240.webp")} 240w, ${asset("img/logo-480.webp")} 480w, ${asset("img/logo-960.webp")} 960w" sizes="${w}px" width="${w}" height="${height}" alt="BAYOU WELLNESS" decoding="async">`;
}

function langLinks(lang, route, cls = "") {
  return LANGS.map(
    (l) =>
      `<a class="${cls}" href="${href(l, route)}" hreflang="${LANG_META[l].hreflang}" lang="${l}" data-lang-link="${l}"${l === lang ? ' aria-current="true"' : ""}>${esc(LANG_META[l].name)}</a>`
  ).join("");
}

function header(ctx) {
  const { lang, route, data } = ctx;
  const nav = NAV.map(
    (n) =>
      `<a class="nav__link" href="${href(lang, n.route)}"${route === n.route || (route.startsWith(n.route + "/") && n.route !== "") ? ' aria-current="page"' : ""}>${esc(t(lang, n.key))}</a>`
  ).join("");
  return `
<header class="site-header" data-header>
  <div class="container site-header__bar">
    <a class="brand" href="${href(lang)}" aria-label="BAYOU WELLNESS">${logoImg(data, { cls: "brand__img", height: 46 })}</a>
    <nav class="nav" aria-label="${esc(t(lang, "ui.mainNav"))}">${nav}</nav>
    <div class="tools">
      <button class="icon-btn tools__search" type="button" data-search-open aria-label="${esc(t(lang, "ui.search"))}">${icon("magnifying-glass")}</button>
      <a class="icon-btn tools__cart" href="${href(lang, "cart")}" aria-label="${esc(t(lang, "ui.cart"))}">${icon("shopping-bag")}<span class="cart-count" data-cart-count hidden>0</span></a>
      <details class="lang" data-lang>
        <summary class="lang__btn" aria-label="${esc(t(lang, "ui.language"))}">${icon("globe", "lang__globe")}<span>${esc(LANG_META[lang].short)}</span>${icon("caret-down", "lang__caret")}</summary>
        <div class="lang__list" role="group" aria-label="${esc(t(lang, "ui.language"))}">${langLinks(lang, ctx.altRoute ?? route, "lang__item")}</div>
      </details>
      <a class="btn btn--sm btn--primary tools__cta" href="${href(lang, "partners/business")}">${esc(t(lang, "ui.becomePartner"))}</a>
      <button class="icon-btn tools__menu" type="button" data-menu-open aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(t(lang, "ui.menuOpen"))}">${icon("list")}</button>
    </div>
  </div>
</header>`;
}

function mobileMenu(ctx) {
  const { lang, route, data, site } = ctx;
  const links = NAV.map(
    (n) =>
      `<li><a class="menu__link" href="${href(lang, n.route)}"${route === n.route ? ' aria-current="page"' : ""}><span>${esc(t(lang, n.key === "nav.guidesShort" ? "nav.guides" : n.key))}</span>${icon("arrow-right")}</a></li>`
  ).join("");
  return `
<div class="menu" id="mobile-menu" data-menu aria-hidden="true" inert>
  <div class="menu__scrim" data-menu-close></div>
  <div class="menu__panel" role="dialog" aria-modal="true" aria-label="${esc(t(lang, "ui.mainNav"))}">
    <div class="menu__head">
      <a class="brand" href="${href(lang)}" aria-label="BAYOU WELLNESS">${logoImg(data, { cls: "brand__img", height: 44 })}</a>
      <button class="icon-btn menu__close" type="button" data-menu-close aria-label="${esc(t(lang, "ui.menuClose"))}">${icon("x")}</button>
    </div>
    <div class="menu__body">
      <button class="menu__search" type="button" data-search-open>${icon("magnifying-glass")}<span>${esc(t(lang, "ui.search"))}</span></button>
      <ul class="menu__list">${links}</ul>
      <div class="menu__lang" role="group" aria-label="${esc(t(lang, "ui.language"))}">${langLinks(lang, ctx.altRoute ?? route, "menu__langitem")}</div>
      <div class="menu__actions">
        <a class="btn btn--primary btn--block" href="${href(lang, "catalog")}">${esc(t(lang, "hero.cta1"))}</a>
        <a class="btn btn--secondary btn--block" href="${href(lang, "partners/business")}">${esc(t(lang, "ui.becomePartner"))}</a>
      </div>
      <a class="menu__phone" href="tel:${esc(site.contact.phoneTel)}">${icon("phone")}<span>${esc(site.contact.phoneDisplay)}</span></a>
    </div>
  </div>
</div>`;
}

function searchDialog(ctx) {
  const { lang } = ctx;
  return `
<div class="search" data-search aria-hidden="true" inert>
  <div class="search__scrim" data-search-close></div>
  <div class="search__panel" role="dialog" aria-modal="true" aria-label="${esc(t(lang, "search.title"))}">
    <form class="search__form" role="search" data-search-form>
      ${icon("magnifying-glass", "search__icon")}
      <label class="sr-only" for="site-search">${esc(t(lang, "search.label"))}</label>
      <input id="site-search" class="search__input" type="search" name="q" autocomplete="off" enterkeyhint="search" placeholder="${esc(t(lang, "search.placeholder"))}" data-search-input>
      <button class="icon-btn" type="button" data-search-close aria-label="${esc(t(lang, "ui.close"))}">${icon("x")}</button>
    </form>
    <div class="search__results" data-search-results aria-live="polite"><p class="search__hint">${esc(t(lang, "search.hint"))}</p></div>
  </div>
</div>`;
}

function footer(ctx) {
  const { lang, data, site } = ctx;
  const waText = t(lang, "wa.greeting");
  const col = (title, items) => `
    <div class="footer__col">
      <p class="footer__title">${esc(title)}</p>
      <ul>${items.map(([r, k]) => `<li><a href="${href(lang, r)}">${esc(t(lang, k))}</a></li>`).join("")}</ul>
    </div>`;
  return `
<footer class="site-footer">
  <div class="container footer__top">
    <div class="footer__brand">
      <a class="footer__logo" href="${href(lang)}" aria-label="BAYOU WELLNESS">${logoImg(data, { cls: "", height: 56 })}</a>
      <p class="footer__tagline">${esc(t(lang, "footer.tagline"))}</p>
      <a class="btn btn--primary" href="${waLink(site, waText)}" target="_blank" rel="noopener" data-track-wa="footer">${icon("whatsapp-logo")}<span>${esc(t(lang, "ui.writeWa"))}</span></a>
    </div>
    ${col(t(lang, "footer.explore"), [["catalog", "nav.catalog"], ["guides", "nav.guides"], ["partners/map", "nav.map"], ["about", "nav.about"]])}
    ${col(t(lang, "footer.business"), [["partners/business", "nav.b2b"], ["contact", "nav.contact"], ["privacy", "footer.privacy"]])}
    <div class="footer__col">
      <p class="footer__title">${esc(t(lang, "footer.contacts"))}</p>
      <ul>
        <li><a href="tel:${esc(site.contact.phoneTel)}">${esc(site.contact.phoneDisplay)}</a></li>
        <li><a href="${waLink(site, waText)}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li class="footer__muted">${esc(t(lang, "footer.country"))}</li>
      </ul>
      <div class="footer__langs" role="group" aria-label="${esc(t(lang, "ui.language"))}">${langLinks(lang, ctx.altRoute ?? ctx.route, "footer__lang")}</div>
    </div>
  </div>
  <div class="container footer__bottom">
    <p>${esc(t(lang, "footer.rights"))}</p>
    <p>${esc(t(lang, "footer.trademark"))}</p>
  </div>
</footer>`;
}

function waFab(ctx) {
  const { lang, site } = ctx;
  const text = ctx.waText ?? t(lang, "wa.greeting");
  return `
<a class="wa-fab" href="${waLink(site, text)}" target="_blank" rel="noopener" aria-label="${esc(t(lang, "wa.fab"))}" data-wa-fab data-track-wa="fab">
  <span class="wa-fab__ring wa-fab__ring--y" aria-hidden="true"></span>
  <span class="wa-fab__ring wa-fab__ring--g" aria-hidden="true"></span>
  <span class="wa-fab__body">${icon("whatsapp-logo", "wa-fab__icon")}</span>
  <span class="wa-fab__bubble" role="status" data-wa-bubble>${esc(t(lang, "wa.bubble"))}</span>
</a>`;
}

/**
 * ctx: { lang, route, altRoute?, data, site, title, desc, body, bodyClass, ogImage, ogType, jsonld[], clientPrefixes[], scripts[], waText, noindex }
 */
export function renderPage(ctx) {
  const { lang, route, data, site } = ctx;
  const meta = LANG_META[lang];
  const alt = ctx.altRoute ?? route;
  const canonical = absHref(lang, alt);
  const title = ctx.title;
  const desc = ctx.desc;
  const ogImage = absAsset(ctx.ogImage ?? "img/og-cover.jpg");

  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${LANG_META[l].hreflang}" href="${absHref(l, alt)}">`).join("\n");
  const xdefault = `<link rel="alternate" hreflang="x-default" href="${absHref(DEFAULT_LANG, alt)}">`;
  const ogAlt = LANGS.filter((l) => l !== lang)
    .map((l) => `<meta property="og:locale:alternate" content="${LANG_META[l].og}">`)
    .join("\n");

  const preload = FONT_PRELOAD[lang]
    .map((f) => `<link rel="preload" href="${asset(`fonts/${f}.woff2`)}" as="font" type="font/woff2" crossorigin>`)
    .join("\n");
  const koFont =
    lang === "ko"
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400..800&display=swap">`
      : "";

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BAYOU WELLNESS",
    url: `${SITE_URL}/`,
    logo: absAsset("img/emblem-512.png"),
    areaServed: "KZ",
    contactPoint: [{ "@type": "ContactPoint", telephone: site.contact.phoneTel, contactType: "customer service", availableLanguage: ["kk", "ru", "en", "ko"] }]
  };
  const ld = [orgLd, ...(ctx.jsonld ?? [])]
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replaceAll("<", "\\u003c")}</script>`)
    .join("\n");

  const dictPrefixes = ["ui.", "cart.", "search.", "cat.", "avail.", "price.", "unit.", "sale.", "wa.", "skip", ...(ctx.clientPrefixes ?? [])];
  const cfg = {
    lang,
    base: BASE,
    route,
    wa: site.contact.whatsappNumber,
    currency: site.currency.symbol,
    locale: meta.locale,
    analytics: site.analytics,
    ...(ctx.clientConfig ?? {})
  };

  const scripts = [`<script src="${asset(ctx.appJs)}" defer></script>`, ...(ctx.extraScripts ?? [])].join("\n");

  return `<!doctype html>
<html lang="${lang}" data-base="${BASE}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#F7F9F6">
<meta name="color-scheme" content="light">
${ctx.noindex ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${canonical}">
${alternates}
${xdefault}
<meta property="og:site_name" content="BAYOU WELLNESS">
<meta property="og:type" content="${ctx.ogType ?? "website"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="${meta.og}">
${ogAlt}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="${asset("img/favicon-32.png")}">
<link rel="icon" type="image/png" sizes="48x48" href="${asset("img/favicon-48.png")}">
<link rel="apple-touch-icon" href="${asset("img/apple-touch-icon.png")}">
${preload}
${koFont}
<link rel="stylesheet" href="${asset(ctx.appCss)}">
${ctx.extraHead ?? ""}
<script>document.documentElement.className+=" js";window.__bayouFallback=setTimeout(function(){document.documentElement.className+=" no-motion-js"},2500);</script>
${ld}
</head>
<body class="${esc(ctx.bodyClass ?? "")}" data-page="${esc(ctx.pageId ?? route)}">
${spriteSvg()}
<a class="skip" href="#main">${esc(t(lang, "skip"))}</a>
${header(ctx)}
<main id="main" tabindex="-1">
${ctx.body}
</main>
${footer(ctx)}
${waFab(ctx)}
${mobileMenu(ctx)}
${searchDialog(ctx)}
<div class="toast" data-toast role="status" aria-live="polite"></div>
<script type="application/json" id="cfg">${JSON.stringify(cfg).replaceAll("<", "\\u003c")}</script>
<script type="application/json" id="i18n">${JSON.stringify(clientDictionary(lang, dictPrefixes)).replaceAll("<", "\\u003c")}</script>
${scripts}
</body>
</html>`;
}

export { logoImg, langLinks };
