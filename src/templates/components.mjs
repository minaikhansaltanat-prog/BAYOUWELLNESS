import { t, pick, countProducts } from "../lib/i18n.mjs";
import { href, asset, esc, img, productView, absHref } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";

export function breadcrumbs(ctx, trail) {
  // trail: [{ label, route? }] (last item has no link)
  const { lang } = ctx;
  const items = [{ label: t(lang, "ui.home"), route: "" }, ...trail];
  const html = items
    .map((it, i) => {
      const last = i === items.length - 1;
      return `<li>${last ? `<span aria-current="page">${esc(it.label)}</span>` : `<a href="${href(lang, it.route)}">${esc(it.label)}</a>`}</li>`;
    })
    .join("");
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(i < items.length - 1 || it.route != null ? { item: absHref(lang, it.route ?? "") } : {})
    }))
  };
  return { html: `<nav class="crumbs" aria-label="${esc(t(lang, "ui.breadcrumbs"))}"><ol>${html}</ol></nav>`, ld };
}

export function pageHead(ctx, { title, lead, crumbs, tone = "light", extra = "" }) {
  return `
<section class="phead phead--${tone}">
  <div class="container phead__inner">
    ${crumbs ?? ""}
    <h1 class="phead__title">${esc(title)}</h1>
    ${lead ? `<p class="phead__lead">${esc(lead)}</p>` : ""}
    ${extra}
  </div>
</section>`;
}

export function priceBlock(ctx, v, cls = "") {
  const { lang } = ctx;
  if (v.priceText == null) {
    return `<p class="price price--request ${cls}" data-price>${esc(t(lang, "price.onRequest"))}</p>`;
  }
  return `<p class="price ${cls}" data-price>${v.oldPriceText ? `<s class="price__old">${esc(v.oldPriceText)}</s>` : ""}<span class="price__now">${esc(v.priceText)}</span></p>`;
}

export function availChip(ctx, v) {
  const { lang } = ctx;
  const map = {
    in: ["chip chip--in", "check-circle", "avail.in"],
    out: ["chip chip--out", "warning-circle", "avail.out"],
    unknown: ["chip chip--ask", "info", "avail.unknown"]
  };
  const [cls, ic, key] = map[v.stock] ?? map.unknown;
  return `<span class="${cls}">${icon(ic)}<span>${esc(t(lang, key))}</span></span>`;
}

export function productCard(ctx, p, { priority = false, level = 3 } = {}) {
  const { lang, data } = ctx;
  const v = productView(data, p, lang);
  const first = v.images[0];
  const blend = first.blend === "multiply" ? " is-multiply" : "";
  return `
<article class="pcard" data-product-card data-id="${esc(v.id)}" data-cats="${esc(v.categories.join(" "))}" data-name="${esc((v.name + " " + v.typeText).toLowerCase())}" data-order="${v.order}">
  <a class="pcard__media tile${blend}" href="${v.url}" tabindex="-1" aria-hidden="true">
    ${img(data, first.name, { alt: "", sizes: "(min-width: 1100px) 280px, (min-width: 640px) 33vw, 72vw", cls: "pcard__img", style: `object-position:${first.focus}`, priority })}
    ${v.discountPct ? `<span class="badge badge--sale">-${v.discountPct}%</span>` : ""}
  </a>
  <div class="pcard__body">
    <h${level} class="pcard__title"><a href="${v.url}">${esc(v.name)}</a></h${level}>
    <p class="pcard__type">${esc(v.typeText)}, ${esc(v.volumeText)}</p>
    <p class="pcard__desc">${esc(v.shortText)}</p>
    <div class="pcard__meta">${priceBlock(ctx, v)}${availChip(ctx, v)}</div>
    <div class="pcard__actions">
      <a class="btn btn--secondary btn--sm" href="${v.url}">${esc(t(lang, "ui.details"))}</a>
      <button class="btn btn--primary btn--sm" type="button" data-add="${esc(v.id)}"><span>${esc(t(lang, "ui.addToCart"))}</span></button>
    </div>
  </div>
</article>`;
}

export function faq(ctx, items, { cls = "" } = {}) {
  return `<div class="faq ${cls}">${items
    .map(
      ([q, a]) => `
  <details class="faq__item">
    <summary class="faq__q"><span>${esc(q)}</span>${icon("plus", "faq__icon")}</summary>
    <div class="faq__a"><p>${esc(a)}</p></div>
  </details>`
    )
    .join("")}</div>`;
}

export function faqLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }))
  };
}

export function categoryTile(ctx, cat, count, { cls = "", sizes = "50vw" } = {}) {
  const { lang, data } = ctx;
  const name = pick(cat.name, lang);
  return `
<a class="ctile${cat.blend === "multiply" ? " is-multiply" : ""} ${cls}" href="${href(lang, "catalog")}?c=${esc(cat.id)}" data-reveal="wipe">
  ${img(data, cat.image, { alt: "", sizes, cls: "ctile__img" })}
  <span class="ctile__shade" aria-hidden="true"></span>
  <span class="ctile__text">
    <span class="ctile__name">${esc(name)}</span>
    <span class="ctile__count">${esc(countProducts(lang, count))}</span>
  </span>
  <span class="ctile__go" aria-hidden="true">${icon("arrow-up-right")}</span>
</a>`;
}

export function guideCard(ctx, g, { cls = "" } = {}) {
  const { lang, data } = ctx;
  return `
<a class="gcard ${cls}" href="${href(lang, `guides/${g.slug}`)}">
  <span class="gcard__media">${img(data, g.image, { alt: "", sizes: "(min-width: 900px) 360px, 80vw", cls: "gcard__img" })}</span>
  <span class="gcard__body">
    <span class="gcard__title">${esc(pick(g.title, lang))}</span>
    <span class="gcard__lead">${esc(pick(g.lead, lang))}</span>
    <span class="gcard__more">${esc(t(lang, "guides.minutes", { n: g.readMin }))}${icon("arrow-right")}</span>
  </span>
</a>`;
}
