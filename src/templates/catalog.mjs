import { t, pick, countProducts } from "../lib/i18n.mjs";
import { href, asset, esc, img, productView, waLink, absHref, absAsset, formatMoney } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { breadcrumbs, pageHead, productCard, priceBlock, availChip, faq } from "./components.mjs";

export function catalog(ctx) {
  const { lang, data } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.catalog") }]);
  const cats = data.visibleCategories.filter((c) => data.productsByCat[c.id].length > 0);

  const chips = [
    `<button class="chip is-active" type="button" data-chip="all" aria-pressed="true"><span>${esc(t(lang, "cat.all"))}</span><span class="chip__n">${data.products.length}</span></button>`,
    ...cats.map(
      (c) =>
        `<button class="chip" type="button" data-chip="${esc(c.id)}" aria-pressed="false"><span>${esc(pick(c.name, lang))}</span><span class="chip__n">${data.productsByCat[c.id].length}</span></button>`
    )
  ].join("");

  const body =
    pageHead(ctx, { title: t(lang, "cat.title"), lead: t(lang, "cat.lead"), crumbs: crumbs.html }) +
    `
<section class="catalog" data-catalog>
  <div class="container">
    <div class="catalog__bar">
      <div class="field field--search">
        ${icon("magnifying-glass", "field__icon")}
        <label class="sr-only" for="cat-q">${esc(t(lang, "cat.search"))}</label>
        <input id="cat-q" class="field__input" type="search" autocomplete="off" placeholder="${esc(t(lang, "cat.searchPh"))}" data-catalog-q>
      </div>
      <div class="field field--select">
        <label class="field__label" for="cat-sort">${esc(t(lang, "cat.sort"))}</label>
        <select id="cat-sort" class="field__input field__input--select" data-catalog-sort>
          <option value="default">${esc(t(lang, "cat.sortDefault"))}</option>
          <option value="name">${esc(t(lang, "cat.sortName"))}</option>
        </select>
      </div>
    </div>
    <div class="chips" role="group" aria-label="${esc(t(lang, "cat.filters"))}" data-chips>${chips}</div>
    <p class="catalog__count" data-catalog-count aria-live="polite">${esc(t(lang, "cat.found", { n: data.products.length }))}</p>
    <div class="grid grid--products" data-catalog-grid>
      ${data.products.map((p, i) => productCard(ctx, p, { priority: i < 2, level: 2 })).join("")}
    </div>
    <div class="empty" data-catalog-empty hidden>
      <p class="empty__t">${esc(t(lang, "cat.empty"))}</p>
      <button class="btn btn--secondary" type="button" data-catalog-reset>${icon("arrows-clockwise")}<span>${esc(t(lang, "cat.reset"))}</span></button>
    </div>
  </div>
</section>`;

  return {
    title: t(lang, "meta.catalog.title"),
    desc: t(lang, "meta.catalog.desc"),
    body,
    bodyClass: "page-catalog",
    pageId: "catalog",
    jsonld: [crumbs.ld]
  };
}

export function product(ctx, p) {
  const { lang, data, site } = ctx;
  const v = productView(data, p, lang);
  const catNames = v.categoryNames;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.catalog"), route: "catalog" }, { label: v.name }]);

  const slides = v.images
    .map((im, i) => {
      const blend = im.blend === "multiply" ? " is-multiply" : "";
      return `<div class="gallery__slide${blend}" data-slide="${i}"${i === 0 ? "" : " hidden"}>${img(data, im.name, {
        alt: v.imageAlt(im.view, i),
        sizes: "(min-width: 900px) 540px, 100vw",
        cls: "gallery__img",
        style: `object-position:${im.focus}`,
        priority: i === 0
      })}</div>`;
    })
    .join("");
  const thumbs =
    v.images.length > 1
      ? `<ul class="gallery__thumbs" role="list">${v.images
          .map(
            (im, i) =>
              `<li><button class="gallery__thumb${i === 0 ? " is-active" : ""}${im.blend === "multiply" ? " is-multiply" : ""}" type="button" data-thumb="${i}" aria-label="${esc(t(lang, "ui.photoN", { n: i + 1 }))}" aria-pressed="${i === 0}">${img(data, im.name, {
                alt: "",
                sizes: "88px",
                cls: "gallery__thumbimg",
                style: `object-position:${im.focus}`
              })}</button></li>`
          )
          .join("")}</ul>`
      : "";

  const waAsk = waLink(site, t(lang, "wa.productAsk", { name: `${v.brand} ${v.name}` }));
  const pending = `<p class="muted">${esc(t(lang, "prod.pending"))}</p>`;
  const detail = (id, title, inner, open = false) => `
    <details class="acc__item"${open ? " open" : ""}>
      <summary class="acc__q"><span>${esc(title)}</span>${icon("plus", "acc__icon")}</summary>
      <div class="acc__a">${inner}</div>
    </details>`;

  const details = [
    detail("purpose", t(lang, "prod.purpose"), `<p>${esc(v.purposeText)}</p>`, true),
    detail("comp", t(lang, "prod.composition"), p.composition ? `<p>${esc(pick(p.composition, lang))}</p>` : pending),
    detail("usage", t(lang, "prod.usage"), p.usage ? `<p>${esc(pick(p.usage, lang))}</p>` : `<p class="muted">${esc(t(lang, "prod.pendingUsage"))}</p>`),
    detail("prec", t(lang, "prod.precautions"), p.precautions ? `<p>${esc(pick(p.precautions, lang))}</p>` : pending),
    detail("guide", t(lang, "prod.guide"), `<p class="muted">${esc(t(lang, "prod.guideNone"))}</p>`),
    detail("deliv", t(lang, "prod.delivery"), `<p>${esc(t(lang, "prod.deliveryBody"))}</p>`),
    detail(
      "faq",
      t(lang, "prod.faq"),
      `<p class="acc__sub">${esc(t(lang, "prod.faq.q1"))}</p><p>${esc(t(lang, "prod.faq.a1"))}</p><p class="acc__sub">${esc(t(lang, "prod.faq.q2"))}</p><p>${esc(t(lang, "prod.faq.a2"))}</p>`
    )
  ].join("");

  const similar = data.products
    .filter((o) => o.id !== p.id)
    .map((o) => ({ o, score: o.categories.filter((c) => p.categories.includes(c)).length }))
    .sort((a, b) => b.score - a.score || a.o.order - b.o.order)
    .slice(0, 3)
    .map((x) => x.o);

  const body = `
<section class="product">
  <div class="container">
    ${crumbs.html}
    <div class="product__grid">
      <div class="gallery" data-gallery>
        <div class="gallery__main tile">${slides}</div>
        ${thumbs}
      </div>
      <div class="product__info">
        <h1 class="product__title">${esc(v.name)}</h1>
        <p class="product__type">${esc(v.typeText)}</p>
        <div class="product__priceline">${priceBlock(ctx, v, "price--lg")}${availChip(ctx, v)}</div>
        <p class="product__short">${esc(v.shortText)}</p>
        <dl class="specs">
          <div><dt>${esc(v.volumeLabel)}</dt><dd>${esc(v.volumeText)}</dd></div>
          <div><dt>${esc(t(lang, "prod.brand"))}</dt><dd>${esc(v.brand)}</dd></div>
          ${catNames.length ? `<div><dt>${esc(t(lang, "prod.category"))}</dt><dd>${catNames.map((c) => esc(c.name)).join(", ")}</dd></div>` : ""}
        </dl>
        <div class="buy">
          <div class="qty" data-qty role="group" aria-label="${esc(t(lang, "prod.qty"))}">
            <button class="qty__btn" type="button" data-qty-dec aria-label="${esc(t(lang, "cart.decrease"))}">${icon("minus")}</button>
            <input class="qty__input" type="text" inputmode="numeric" value="1" aria-label="${esc(t(lang, "prod.qty"))}" data-qty-input>
            <button class="qty__btn" type="button" data-qty-inc aria-label="${esc(t(lang, "cart.increase"))}">${icon("plus")}</button>
          </div>
          <button class="btn btn--primary btn--lg buy__add" type="button" data-add="${esc(v.id)}" data-add-qty>${icon("shopping-bag")}<span>${esc(t(lang, "ui.addToCart"))}</span></button>
        </div>
        <div class="buy__more">
          <a class="btn btn--secondary" href="${waAsk}" target="_blank" rel="noopener" data-track-wa="product">${icon("whatsapp-logo")}<span>${esc(t(lang, "ui.whatsappAsk"))}</span></a>
          <a class="btn btn--ghost" href="${href(lang, "partners/map")}">${icon("map-pin")}<span>${esc(t(lang, "prod.findPartner"))}</span></a>
        </div>
      </div>
    </div>
    <div class="acc">${details}</div>
  </div>
</section>
<section class="section section--similar">
  <div class="container">
    <div class="sec-head"><h2 class="sec-head__title">${esc(t(lang, "prod.similar"))}</h2></div>
    <div class="grid grid--products grid--3">${similar.map((o) => productCard(ctx, o)).join("")}</div>
  </div>
</section>`;

  const offers =
    p.price != null
      ? {
          offers: {
            "@type": "Offer",
            url: absHref(lang, `product/${p.slug}`),
            priceCurrency: site.currency.code,
            price: String(p.salePrice ?? p.price),
            ...(p.stock === "in" ? { availability: "https://schema.org/InStock" } : p.stock === "out" ? { availability: "https://schema.org/OutOfStock" } : {})
          }
        }
      : {};
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${v.brand} ${v.name}`,
    brand: { "@type": "Brand", name: v.brand },
    sku: p.id,
    image: v.images.map((im) => absAsset(`img/${im.name}-${data.images[im.name].widths.at(-1)}.webp`)),
    description: `${v.typeText}, ${v.volumeText}. ${v.shortText}`,
    inLanguage: lang,
    ...offers
  };

  return {
    title: `${v.brand} ${v.name} | BAYOU WELLNESS`,
    desc: `${v.typeText}, ${v.volumeText}. ${v.shortText}`.slice(0, 300),
    body,
    bodyClass: "page-product",
    pageId: "product",
    ogType: "product",
    ogImage: `img/${v.images[0].name}-${data.images[v.images[0].name].widths.at(-1)}.webp`,
    waText: t(lang, "wa.productAsk", { name: `${v.brand} ${v.name}` }),
    jsonld: [productLd, crumbs.ld],
    clientConfig: { productId: v.id, productName: `${v.brand} ${v.name}` }
  };
}
