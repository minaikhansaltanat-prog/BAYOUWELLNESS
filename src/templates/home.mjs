import { t, pick, countProducts } from "../lib/i18n.mjs";
import { href, esc, img, productView, waLink, absHref } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { productCard, categoryTile, faq, faqLd, guideCard } from "./components.mjs";

export default function home(ctx) {
  const { lang, data, site } = ctx;
  const featured = data.products.filter((p) => p.featured).slice(0, 4);
  const heroA = productView(data, data.products.find((p) => p.id === "rosemary-root-enhancer"), lang);

  // ---------- hero ----------
  const hero = `
<section class="hero" data-hero>
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div class="hero__copy">
      <h1 class="hero__title" data-hero-item>${esc(t(lang, "hero.h1"))}</h1>
      <p class="hero__lead" data-hero-item>${esc(t(lang, "hero.lead"))}</p>
      <div class="hero__cta" data-hero-item>
        <a class="btn btn--primary btn--lg" href="${href(lang, "catalog")}"><span>${esc(t(lang, "hero.cta1"))}</span>${icon("arrow-right")}</a>
        <a class="btn btn--secondary btn--lg" href="${href(lang, "partners/map")}">${icon("map-pin")}<span>${esc(t(lang, "hero.cta2"))}</span></a>
        <a class="link-arrow" href="${href(lang, "partners/business")}"><span>${esc(t(lang, "hero.cta3"))}</span>${icon("arrow-right")}</a>
      </div>
    </div>
    <div class="hero__stage stage" data-hero-stage>
      <div class="stage__arch tile is-multiply" data-hero-item>
        ${img(data, "root-enhancer-1", { alt: t(lang, "hero.imgAlt"), sizes: "(min-width: 1100px) 460px, 78vw", cls: "stage__img", priority: true })}
      </div>
      <figure class="stage__orb is-multiply" data-parallax="-26" data-hero-item>
        ${img(data, "pdrn-serum-1", { alt: t(lang, "hero.img2Alt"), sizes: "(min-width: 1100px) 220px, 34vw", cls: "stage__orbimg" })}
      </figure>
      <figure class="stage__card" data-parallax="20" data-hero-item>
        ${img(data, "group-1", { alt: t(lang, "hero.img3Alt"), sizes: "(min-width: 1100px) 200px, 38vw", cls: "stage__cardimg" })}
      </figure>
      <a class="stage__chip" href="${heroA.url}" data-hero-item>
        <span class="stage__chiptext"><span class="stage__chipbrand">${esc(heroA.brand)}</span><span class="stage__chipname">${esc(heroA.name)}</span></span>
        <span class="stage__chipgo" aria-hidden="true">${icon("arrow-up-right")}</span>
      </a>
    </div>
  </div>
</section>`;

  // ---------- service ribbon ----------
  const ribbonItems = [
    ["chat-circle-text", "ribbon.1"],
    ["map-pin", "ribbon.2"],
    ["translate", "ribbon.3"],
    ["storefront", "ribbon.4"]
  ];
  const ribbon = `
<section class="ribbon" aria-label="BAYOU WELLNESS">
  <div class="container">
    <ul class="ribbon__list">
      ${ribbonItems
        .map(
          ([ic, k]) =>
            `<li class="ribbon__item">${icon(ic, "ribbon__icon")}<div><p class="ribbon__t">${esc(t(lang, `${k}.t`))}</p><p class="ribbon__d">${esc(t(lang, `${k}.d`))}</p></div></li>`
        )
        .join("")}
    </ul>
  </div>
</section>`;

  // ---------- categories bento ----------
  const cats = data.visibleCategories;
  const n = cats.length;
  const bentoCls = n >= 2 && n <= 4 ? `bento--n${n}` : n === 1 ? "bento--n1" : "bento--many";
  const bento = `
<section class="section section--cats">
  <div class="container">
    <div class="sec-head">
      <h2 class="sec-head__title">${esc(t(lang, "home.cats.h"))}</h2>
      <p class="sec-head__lead">${esc(t(lang, "home.cats.lead"))}</p>
    </div>
    <div class="bento ${bentoCls}">
      ${cats
        .map((c, i) =>
          categoryTile(ctx, c, data.productsByCat[c.id].length, {
            cls: `ctile--${i + 1}`,
            sizes: i === 0 ? "(min-width: 900px) 40vw, 100vw" : "(min-width: 900px) 30vw, 50vw"
          })
        )
        .join("")}
    </div>
  </div>
</section>`;

  // ---------- featured ----------
  const featuredSec = `
<section class="section section--featured">
  <div class="container">
    <div class="sec-head sec-head--row">
      <div>
        <h2 class="sec-head__title">${esc(t(lang, "home.feat.h"))}</h2>
        <p class="sec-head__lead">${esc(t(lang, "home.feat.lead"))}</p>
      </div>
      <a class="link-arrow" href="${href(lang, "catalog")}"><span>${esc(t(lang, "ui.seeAll"))}</span>${icon("arrow-right")}</a>
    </div>
  </div>
  <div class="rail" data-rail>
    <div class="rail__track">
      ${featured.map((p) => `<div class="rail__item" data-reveal="lift">${productCard(ctx, p)}</div>`).join("")}
    </div>
  </div>
</section>`;

  // ---------- how to choose ----------
  const steps = [
    ["target", "home.choose.1"],
    ["funnel", "home.choose.2"],
    ["chat-circle-text", "home.choose.3"]
  ];
  const choose = `
<section class="section section--choose">
  <div class="container choose">
    <div class="choose__media" data-story>
      <div class="choose__frame">${img(data, "mood-rosemary", { alt: t(lang, "home.choose.imgAlt"), sizes: "(min-width: 900px) 46vw, 100vw", cls: "choose__img", style: "object-position:62% 50%" })}</div>
    </div>
    <div class="choose__copy">
      <h2 class="sec-head__title">${esc(t(lang, "home.choose.h"))}</h2>
      <ol class="choose__steps">
        ${steps
          .map(
            ([ic, k]) =>
              `<li class="choose__step">${icon(ic, "choose__icon")}<div><p class="choose__t">${esc(t(lang, `${k}.t`))}</p><p class="choose__d">${esc(t(lang, `${k}.d`))}</p></div></li>`
          )
          .join("")}
      </ol>
      <a class="btn btn--secondary" href="${href(lang, "guides")}"><span>${esc(t(lang, "home.choose.cta"))}</span>${icon("arrow-right")}</a>
    </div>
  </div>
</section>`;

  // ---------- map teaser ----------
  const mapBand = `
<section class="band band--map">
  <div class="band__bg" aria-hidden="true">${img(data, "mood-river", { alt: "", sizes: "100vw", cls: "band__img" })}</div>
  <div class="container band__inner">
    <h2 class="band__title">${esc(t(lang, "home.map.h"))}</h2>
    <p class="band__lead">${esc(t(lang, "home.map.d"))}</p>
    <form class="mapsearch" action="${href(lang, "partners/map")}" method="get" role="search">
      <label class="sr-only" for="home-map-q">${esc(t(lang, "home.map.label"))}</label>
      ${icon("map-pin", "mapsearch__icon")}
      <input id="home-map-q" class="mapsearch__input" type="search" name="q" autocomplete="off" placeholder="${esc(t(lang, "home.map.ph"))}">
      <button class="btn btn--primary" type="submit"><span>${esc(t(lang, "home.map.cta"))}</span>${icon("arrow-right")}</button>
    </form>
    <p class="band__note">${icon("seal-check")}<span>${esc(t(lang, "home.map.note"))}</span></p>
  </div>
</section>`;

  // ---------- B2B ----------
  const perks = [1, 2, 3, 4, 5, 6, 7];
  const b2b = `
<section class="section section--b2b">
  <div class="container b2b">
    <div class="b2b__copy">
      <h2 class="sec-head__title">${esc(t(lang, "home.b2b.h"))}</h2>
      <p class="b2b__text">${esc(t(lang, "home.b2b.d"))}</p>
      <a class="btn btn--primary btn--lg" href="${href(lang, "partners/business")}"><span>${esc(t(lang, "ui.becomePartner"))}</span>${icon("arrow-right")}</a>
    </div>
    <div class="b2b__list">
      <ul class="perks">
        ${perks
          .map(
            (i) =>
              `<li class="perks__item">${icon("check", "perks__icon")}<span>${esc(t(lang, `b2b.perk.${i}`))}${i === 7 ? `<em class="tag">${esc(t(lang, "b2b.soon"))}</em>` : ""}</span></li>`
          )
          .join("")}
      </ul>
      <p class="b2b__note">${esc(t(lang, "b2b.note"))}</p>
    </div>
  </div>
</section>`;

  // ---------- guides ----------
  const guides = `
<section class="section section--guides">
  <div class="container">
    <div class="sec-head sec-head--row">
      <div>
        <h2 class="sec-head__title">${esc(t(lang, "home.guides.h"))}</h2>
        <p class="sec-head__lead">${esc(t(lang, "home.guides.lead"))}</p>
      </div>
      <a class="link-arrow" href="${href(lang, "guides")}"><span>${esc(t(lang, "ui.seeAll"))}</span>${icon("arrow-right")}</a>
    </div>
  </div>
  <div class="rail" data-rail>
    <div class="rail__track rail__track--guides">
      ${data.guides.slice(0, 3).map((g) => `<div class="rail__item rail__item--guide">${guideCard(ctx, g)}</div>`).join("")}
    </div>
  </div>
</section>`;

  // ---------- FAQ ----------
  const faqItems = [1, 2, 3, 4, 5].map((i) => [t(lang, `faq.q${i}`), t(lang, `faq.a${i}`)]);
  const faqSec = `
<section class="section section--faq">
  <div class="container faqwrap">
    <h2 class="sec-head__title">${esc(t(lang, "faq.h"))}</h2>
    ${faq(ctx, faqItems)}
  </div>
</section>`;

  // ---------- closing CTA ----------
  const closing = `
<section class="closing">
  <div class="container closing__inner">
    <div>
      <h2 class="closing__title">${esc(t(lang, "cta.h"))}</h2>
      <p class="closing__text">${esc(t(lang, "cta.d"))}</p>
    </div>
    <a class="btn btn--primary btn--lg" href="${waLink(site, t(lang, "wa.greeting"))}" target="_blank" rel="noopener" data-track-wa="closing">${icon("whatsapp-logo")}<span>${esc(t(lang, "ui.writeWa"))}</span></a>
  </div>
</section>`;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BAYOU WELLNESS",
    url: absHref(lang, ""),
    inLanguage: lang
  };

  return {
    title: t(lang, "meta.home.title"),
    desc: t(lang, "meta.home.desc"),
    body: hero + ribbon + bento + featuredSec + choose + mapBand + b2b + guides + faqSec + closing,
    bodyClass: "page-home",
    pageId: "home",
    jsonld: [website, faqLd(faqItems)]
  };
}
