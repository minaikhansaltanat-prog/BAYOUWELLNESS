import { t, pick, formatVolume } from "../lib/i18n.mjs";
import { href, asset, esc, productView } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { breadcrumbs, pageHead } from "./components.mjs";

export function cart(ctx) {
  const { lang, data, site } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "cart.title") }]);

  const catalog = data.products.map((p) => {
    const v = productView(data, p, lang);
    const im = p.images[0];
    const w = data.images[im.name].widths[0];
    return {
      id: p.id,
      name: v.name,
      brand: v.brand,
      type: v.typeText,
      volume: v.volumeText,
      price: p.price ?? null,
      salePrice: p.salePrice ?? null,
      url: v.url,
      img: asset(`img/${im.name}-${w}.webp`),
      blend: im.blend === "multiply"
    };
  });

  const field = (id, label, extra = "", tag = "input") => `
    <div class="field field--stack">
      <label class="field__label" for="${id}">${esc(label)}</label>
      ${tag === "textarea" ? `<textarea id="${id}" name="${id}" class="field__input field__input--area" rows="3" ${extra}></textarea>` : `<input id="${id}" name="${id}" class="field__input" ${extra}>`}
      <p class="field__error" data-err-for="${id}" hidden></p>
    </div>`;

  const body =
    pageHead(ctx, { title: t(lang, "cart.title"), crumbs: crumbs.html }) +
    `
<section class="section section--cart" data-cart-page>
  <div class="container">
    <div class="empty empty--cart" data-cart-empty hidden>
      ${icon("shopping-bag", "empty__icon")}
      <p class="empty__t">${esc(t(lang, "cart.empty"))}</p>
      <p class="muted">${esc(t(lang, "cart.emptyHint"))}</p>
      <a class="btn btn--primary" href="${href(lang, "catalog")}"><span>${esc(t(lang, "cart.toCatalog"))}</span>${icon("arrow-right")}</a>
    </div>
    <div class="cartgrid" data-cart-filled hidden>
      <div class="cartgrid__items">
        <h2 class="cartgrid__h">${esc(t(lang, "cart.items"))}</h2>
        <ul class="citems" data-cart-items></ul>
      </div>
      <aside class="cartgrid__side">
        <div class="summary">
          <dl class="summary__rows">
            <div><dt>${esc(t(lang, "cart.subtotal"))}</dt><dd data-sum-subtotal></dd></div>
            <div><dt>${esc(t(lang, "cart.delivery"))}</dt><dd>${esc(t(lang, "cart.deliveryTbd"))}</dd></div>
            <div class="summary__total"><dt>${esc(t(lang, "cart.total"))}</dt><dd data-sum-total></dd></div>
          </dl>
          <p class="summary__pending" data-sum-pending hidden>${esc(t(lang, "cart.pricePending"))}</p>
        </div>
        <form class="checkout" data-checkout novalidate>
          <h2 class="checkout__h">${esc(t(lang, "cart.form.title"))}</h2>
          ${field("co-name", t(lang, "cart.form.name"), 'autocomplete="name" required')}
          ${field("co-phone", t(lang, "cart.form.phone"), 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7XX XXX XXXX" required')}
          ${field("co-email", t(lang, "cart.form.email"), 'type="email" autocomplete="email" inputmode="email"')}
          <fieldset class="seg" data-method>
            <legend class="field__label">${esc(t(lang, "cart.form.method"))}</legend>
            <label class="seg__opt"><input type="radio" name="method" value="delivery" checked><span>${esc(t(lang, "cart.form.methodDelivery"))}</span></label>
            <label class="seg__opt"><input type="radio" name="method" value="pickup"><span>${esc(t(lang, "cart.form.methodPickup"))}</span></label>
          </fieldset>
          <div data-address-wrap>${field("co-address", t(lang, "cart.form.address"), 'autocomplete="street-address"')}</div>
          ${field("co-comment", t(lang, "cart.form.comment"), "", "textarea")}
          <div class="field field--check">
            <label class="check"><input type="checkbox" id="co-consent" name="consent"><span>${esc(t(lang, "cart.form.consent"))}</span></label>
            <p class="field__error" data-err-for="co-consent" hidden></p>
          </div>
          <button class="btn btn--primary btn--lg btn--block" type="submit">${icon("whatsapp-logo")}<span>${esc(t(lang, "cart.form.submit"))}</span></button>
          <p class="notice notice--soft">${icon("info")}<span>${esc(t(lang, "cart.note"))}</span></p>
        </form>
      </aside>
    </div>
  </div>
</section>`;

  return {
    title: t(lang, "meta.cart.title"),
    desc: t(lang, "meta.cart.desc"),
    body,
    bodyClass: "page-cart",
    pageId: "cart",
    noindex: true,
    jsonld: [],
    clientConfig: { catalog, privacyUrl: href(lang, "privacy") }
  };
}
