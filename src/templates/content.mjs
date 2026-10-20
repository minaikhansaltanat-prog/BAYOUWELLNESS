import { t, pick } from "../lib/i18n.mjs";
import { href, esc, img, waLink, absHref, absAsset } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { breadcrumbs, pageHead, faq, faqLd, guideCard, productCard } from "./components.mjs";

export function guidesIndex(ctx) {
  const { lang, data } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.guides") }]);
  const faqItems = [1, 2, 3, 4, 5].map((i) => [t(lang, `faq.q${i}`), t(lang, `faq.a${i}`)]);
  const body =
    pageHead(ctx, { title: t(lang, "guides.title"), lead: t(lang, "guides.lead"), crumbs: crumbs.html }) +
    `
<section class="section section--guideslist">
  <div class="container">
    <div class="guides">${data.guides.map((g, i) => guideCard(ctx, g, { cls: i === 0 ? "gcard--lead" : "" })).join("")}</div>
  </div>
</section>
<section class="section section--faq">
  <div class="container faqwrap">
    <h2 class="sec-head__title">${esc(t(lang, "faq.h"))}</h2>
    ${faq(ctx, faqItems)}
  </div>
</section>`;
  return {
    title: t(lang, "meta.guides.title"),
    desc: t(lang, "meta.guides.desc"),
    body,
    bodyClass: "page-guides",
    pageId: "guides",
    jsonld: [crumbs.ld, faqLd(faqItems)]
  };
}

export function guideArticle(ctx, g) {
  const { lang, data } = ctx;
  const title = pick(g.title, lang);
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.guides"), route: "guides" }, { label: title }]);
  const related = g.related.map((id) => data.products.find((p) => p.id === id)).filter(Boolean).slice(0, 3);
  const body = `
<article class="article">
  <header class="phead phead--light">
    <div class="container container--narrow phead__inner">
      ${crumbs.html}
      <h1 class="phead__title">${esc(title)}</h1>
      <p class="phead__lead">${esc(pick(g.lead, lang))}</p>
      <p class="article__meta">${icon("clock")}<span>${esc(t(lang, "guides.minutes", { n: g.readMin }))}</span></p>
    </div>
  </header>
  <div class="container container--narrow">
    <figure class="article__figure">${img(data, g.image, { alt: "", sizes: "(min-width: 900px) 720px, 100vw", cls: "article__img", priority: true })}</figure>
    <div class="prose">
      ${g.sections.map((s) => `<h2>${esc(pick(s.h, lang))}</h2><p>${esc(pick(s.p, lang))}</p>`).join("")}
    </div>
    <p class="notice">${icon("info")}<span>${esc(t(lang, "guides.disclaimer"))}</span></p>
    <p class="article__back"><a class="link-arrow link-arrow--back" href="${href(lang, "guides")}">${icon("arrow-left")}<span>${esc(t(lang, "guides.back"))}</span></a></p>
  </div>
</article>
${
  related.length
    ? `<section class="section section--similar"><div class="container">
  <div class="sec-head"><h2 class="sec-head__title">${esc(t(lang, "guides.related"))}</h2></div>
  <div class="grid grid--products grid--3">${related.map((p) => productCard(ctx, p)).join("")}</div>
</div></section>`
    : ""
}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: pick(g.lead, lang),
    inLanguage: lang,
    image: absAsset(`img/${g.image}-${data.images[g.image].widths.at(-1)}.webp`),
    mainEntityOfPage: absHref(lang, `guides/${g.slug}`),
    author: { "@type": "Organization", name: "BAYOU WELLNESS" },
    publisher: { "@type": "Organization", name: "BAYOU WELLNESS" }
  };
  return {
    title: `${title} | BAYOU WELLNESS`,
    desc: pick(g.lead, lang),
    body,
    bodyClass: "page-article",
    pageId: "guide",
    ogType: "article",
    ogImage: `img/${g.image}-${data.images[g.image].widths.at(-1)}.webp`,
    jsonld: [articleLd, crumbs.ld]
  };
}

export function about(ctx) {
  const { lang, data, site } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.about") }]);
  const dirs = [
    ["shopping-bag", 1],
    ["handshake", 2],
    ["map-pin-line", 3]
  ];
  const princ = [1, 2, 3];
  const body =
    pageHead(ctx, { title: t(lang, "about.title"), lead: t(lang, "about.lead"), crumbs: crumbs.html }) +
    `
<section class="section section--aboutimg">
  <div class="container">
    <div class="wideimg">${img(data, "mood-moss-rocks", { alt: t(lang, "about.imgAlt"), sizes: "(min-width: 1240px) 1160px, 100vw", cls: "wideimg__img", priority: true })}</div>
  </div>
</section>
<section class="section section--dirs">
  <div class="container">
    <h2 class="sec-head__title">${esc(t(lang, "about.dirs.h"))}</h2>
    <ol class="dirs">
      ${dirs
        .map(
          ([ic, i]) =>
            `<li class="dirs__item">${icon(ic, "dirs__icon")}<div><p class="dirs__t">${esc(t(lang, `about.dir.${i}.t`))}</p><p class="dirs__d">${esc(t(lang, `about.dir.${i}.d`))}</p></div></li>`
        )
        .join("")}
    </ol>
  </div>
</section>
<section class="band band--plain">
  <div class="container band__inner">
    <h2 class="band__title">${esc(t(lang, "about.princ.h"))}</h2>
    <ul class="princ">
      ${princ.map((i) => `<li class="princ__item"><p class="princ__t">${esc(t(lang, `about.princ.${i}.t`))}</p><p class="princ__d">${esc(t(lang, `about.princ.${i}.d`))}</p></li>`).join("")}
    </ul>
  </div>
</section>
<section class="closing">
  <div class="container closing__inner">
    <div><h2 class="closing__title">${esc(t(lang, "cta.h"))}</h2><p class="closing__text">${esc(t(lang, "cta.d"))}</p></div>
    <a class="btn btn--primary btn--lg" href="${waLink(site, t(lang, "wa.greeting"))}" target="_blank" rel="noopener" data-track-wa="about">${icon("whatsapp-logo")}<span>${esc(t(lang, "ui.writeWa"))}</span></a>
  </div>
</section>`;
  return { title: t(lang, "meta.about.title"), desc: t(lang, "meta.about.desc"), body, bodyClass: "page-about", pageId: "about", jsonld: [crumbs.ld] };
}

export function contact(ctx) {
  const { lang, site } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.contact") }]);
  const wa = waLink(site, t(lang, "wa.greeting"));
  const body =
    pageHead(ctx, { title: t(lang, "contact.title"), lead: t(lang, "contact.lead"), crumbs: crumbs.html }) +
    `
<section class="section section--contact">
  <div class="container">
    <ul class="contactlist">
      <li><a class="crow" href="${wa}" target="_blank" rel="noopener" data-track-wa="contact">
        <span class="crow__icon crow__icon--wa">${icon("whatsapp-logo")}</span>
        <span class="crow__text"><span class="crow__t">${esc(t(lang, "contact.wa.t"))}</span><span class="crow__d">${esc(t(lang, "contact.wa.d"))}</span><span class="crow__v">${esc(site.contact.phoneDisplay)}</span></span>
        <span class="crow__go">${icon("arrow-up-right")}</span></a></li>
      <li><a class="crow" href="tel:${esc(site.contact.phoneTel)}">
        <span class="crow__icon">${icon("phone")}</span>
        <span class="crow__text"><span class="crow__t">${esc(t(lang, "contact.phone.t"))}</span><span class="crow__d">${esc(t(lang, "contact.phone.d"))}</span><span class="crow__v">${esc(site.contact.phoneDisplay)}</span></span>
        <span class="crow__go">${icon("arrow-up-right")}</span></a></li>
      <li><a class="crow" href="${href(lang, "partners/business")}">
        <span class="crow__icon">${icon("handshake")}</span>
        <span class="crow__text"><span class="crow__t">${esc(t(lang, "contact.b2b.t"))}</span><span class="crow__d">${esc(t(lang, "contact.b2b.d"))}</span></span>
        <span class="crow__go">${icon("arrow-right")}</span></a></li>
    </ul>
    <p class="muted contact__region">${esc(t(lang, "contact.region"))}</p>
  </div>
</section>`;
  return { title: t(lang, "meta.contact.title"), desc: t(lang, "meta.contact.desc"), body, bodyClass: "page-contact", pageId: "contact", jsonld: [crumbs.ld] };
}

export function notFound(ctx) {
  const { lang } = ctx;
  const body = `
<section class="notfound">
  <div class="container notfound__inner">
    <p class="notfound__code" aria-hidden="true">404</p>
    <h1 class="notfound__t">${esc(t(lang, "e404.h"))}</h1>
    <p class="notfound__d">${esc(t(lang, "e404.d"))}</p>
    <a class="btn btn--primary btn--lg" href="${href(lang, "")}"><span>${esc(t(lang, "e404.cta"))}</span>${icon("arrow-right")}</a>
  </div>
</section>`;
  return { title: t(lang, "meta.404.title"), desc: t(lang, "e404.d"), body, bodyClass: "page-404", pageId: "404", noindex: true, jsonld: [] };
}

export function privacy(ctx) {
  const { lang } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "privacy.title") }]);
  const body =
    pageHead(ctx, { title: t(lang, "privacy.title"), lead: t(lang, "privacy.lead"), crumbs: crumbs.html }) +
    `
<section class="section">
  <div class="container container--narrow">
    <div class="prose">
      ${[1, 2, 3, 4].map((i) => `<h2>${esc(t(lang, `privacy.${i}.t`))}</h2><p>${esc(t(lang, `privacy.${i}.d`))}</p>`).join("")}
    </div>
  </div>
</section>`;
  return { title: t(lang, "meta.privacy.title"), desc: t(lang, "meta.privacy.desc"), body, bodyClass: "page-privacy", pageId: "privacy", jsonld: [crumbs.ld] };
}
