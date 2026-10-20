import { t, pick } from "../lib/i18n.mjs";
import { href, asset, esc } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { breadcrumbs, pageHead } from "./components.mjs";

import { LANG_META } from "../lib/i18n.mjs";

const fmtDate = (lang, iso) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat(LANG_META[lang].locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(d);
};
const TYPES = ["salon", "cosmetology", "clinic", "shop", "online"];
const SERVICES = ["consultation", "retail", "treatment"];

function partnerCard(ctx, p) {
  const { lang, data } = ctx;
  const cityLabel = p.cityLabel ? pick(p.cityLabel, lang) : p.city;
  const catNames = (p.categories ?? [])
    .map((id) => data.categories.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => pick(c.name, lang));
  const svc = (p.services ?? []).map((s) => t(lang, `map.service.${s}`)).join(", ");
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  return `
<li class="pcardx" data-partner="${esc(p.id)}" tabindex="0">
  <div class="pcardx__head">
    <h3 class="pcardx__name">${esc(p.name)}</h3>
    <span class="chip chip--type">${esc(t(lang, `map.type.${p.type === "cosmetology" ? "cosmetology" : p.type}`))}</span>
  </div>
  <p class="pcardx__addr">${icon("map-pin")}<span>${esc(cityLabel)}, ${esc(p.address)}</span></p>
  ${p.hours ? `<p class="pcardx__row">${icon("clock")}<span>${esc(p.hours)}</span></p>` : ""}
  ${svc ? `<p class="pcardx__row">${icon("check")}<span>${esc(svc)}</span></p>` : ""}
  ${catNames.length ? `<p class="pcardx__row pcardx__row--muted"><span>${esc(t(lang, "map.productCats"))}: ${esc(catNames.join(", "))}</span></p>` : ""}
  <p class="pcardx__verified">${icon("seal-check")}<span>${esc(t(lang, "map.verified", { date: fmtDate(lang, p.verifiedAt) }))}</span></p>
  <div class="pcardx__actions">
    ${p.phone ? `<a class="btn btn--secondary btn--sm" href="tel:${esc(p.phone.replace(/[^+\d]/g, ""))}" data-track="partner_contact_click" data-partner-id="${esc(p.id)}">${icon("phone")}<span>${esc(t(lang, "map.call"))}</span></a>` : ""}
    <a class="btn btn--primary btn--sm" href="${directions}" target="_blank" rel="noopener" data-track="partner_directions_click" data-partner-id="${esc(p.id)}">${icon("navigation-arrow")}<span>${esc(t(lang, "map.directions"))}</span></a>
    <a class="btn btn--ghost btn--sm" href="https://2gis.kz/?m=${p.lng},${p.lat}%2F16" target="_blank" rel="noopener" data-track="partner_directions_click" data-partner-id="${esc(p.id)}"><span>${esc(t(lang, "map.open2gis"))}</span></a>
    ${p.website ? `<a class="btn btn--ghost btn--sm" href="${esc(p.website)}" target="_blank" rel="noopener">${icon("link")}<span>${esc(t(lang, "map.website"))}</span></a>` : ""}
  </div>
  ${p.phone ? `<p class="pcardx__avail"><a href="tel:${esc(p.phone.replace(/[^+\d]/g, ""))}">${esc(t(lang, "map.checkAvail"))}</a></p>` : ""}
</li>`;
}

export function partnersMap(ctx) {
  const { lang, data, site } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.map") }]);
  const has = data.partners.length > 0;
  const cityOptions = site.map.cities
    .map((c) => `<option value="${esc(c.id)}">${esc(t(lang, `map.city.${c.id}`))}</option>`)
    .join("");
  const typeChips = [
    `<button class="chip is-active" type="button" data-type="all" aria-pressed="true"><span>${esc(t(lang, "map.type.all"))}</span></button>`,
    ...TYPES.map((k) => `<button class="chip" type="button" data-type="${k}" aria-pressed="false"><span>${esc(t(lang, `map.type.${k}`))}</span></button>`)
  ].join("");
  const svcOptions = [
    `<option value="">${esc(t(lang, "map.service.any"))}</option>`,
    ...SERVICES.map((k) => `<option value="${k}">${esc(t(lang, `map.service.${k}`))}</option>`)
  ].join("");

  const networkCard = `
    <div class="netcard" data-network-empty${has ? " hidden" : ""}>
      ${icon("map-trifold", "netcard__icon")}
      <p class="netcard__t">${esc(t(lang, "map.network.t"))}</p>
      <p class="netcard__d">${esc(t(lang, "map.network.d"))}</p>
      <a class="btn btn--primary" href="${href(lang, "partners/business")}"><span>${esc(t(lang, "ui.becomePartner"))}</span>${icon("arrow-right")}</a>
    </div>`;

  const body =
    pageHead(ctx, { title: t(lang, "map.title"), lead: t(lang, "map.lead"), crumbs: crumbs.html }) +
    `
<section class="mapx" data-map-root data-view="list">
  <div class="container mapx__wrap">
    <div class="mapx__panel">
      <form class="field field--search" role="search" data-map-form>
        ${icon("magnifying-glass", "field__icon")}
        <label class="sr-only" for="map-q">${esc(t(lang, "map.searchLabel"))}</label>
        <input id="map-q" class="field__input" type="search" name="q" autocomplete="off" placeholder="${esc(t(lang, "map.searchPh"))}" data-map-q>
      </form>
      <div class="chips" role="group" aria-label="${esc(t(lang, "map.type"))}" data-map-types>${typeChips}</div>
      <div class="mapx__selects">
        <div class="field field--select">
          <label class="field__label" for="map-city">${esc(t(lang, "map.city"))}</label>
          <select id="map-city" class="field__input field__input--select" data-map-city><option value="">${esc(t(lang, "map.city"))}</option>${cityOptions}</select>
        </div>
        <div class="field field--select">
          <label class="field__label" for="map-svc">${esc(t(lang, "map.services"))}</label>
          <select id="map-svc" class="field__input field__input--select" data-map-svc>${svcOptions}</select>
        </div>
      </div>
      <button class="btn btn--secondary btn--block" type="button" data-map-locate>${icon("crosshair")}<span>${esc(t(lang, "map.locate"))}</span></button>
      <p class="mapx__msg" data-map-msg role="status" aria-live="polite" hidden></p>
      <div class="mapx__tabs" role="group" aria-label="${esc(t(lang, "map.viewSwitch"))}">
        <button class="mapx__tab" type="button" data-view-tab="map" aria-pressed="false">${icon("map-trifold")}<span>${esc(t(lang, "map.viewMap"))}</span></button>
        <button class="mapx__tab is-active" type="button" data-view-tab="list" aria-pressed="true">${icon("list-bullets")}<span>${esc(t(lang, "map.viewList"))}</span></button>
      </div>
      <p class="mapx__count" data-map-count aria-live="polite">${esc(t(lang, "map.results", { n: data.partners.length }))}</p>
      <ul class="mapx__list" data-map-list>${data.partners.map((p) => partnerCard(ctx, p)).join("")}</ul>
      ${networkCard}
      <div class="empty" data-map-empty hidden>
        <p class="empty__t">${esc(t(lang, "map.empty"))}</p>
        <button class="btn btn--secondary" type="button" data-map-reset>${icon("arrows-clockwise")}<span>${esc(t(lang, "map.emptyReset"))}</span></button>
      </div>
    </div>
    <div class="mapx__stage" data-map-stage>
      <div class="mapx__canvas" id="partner-map" role="region" aria-label="${esc(t(lang, "map.areaLabel"))}" data-map-canvas></div>
      <p class="mapx__fail" data-map-fail hidden>${icon("warning-circle")}<span>${esc(t(lang, "map.unavailable"))}</span></p>
      <div class="mapx__sheet" data-map-sheet hidden>
        <button class="icon-btn mapx__sheetclose" type="button" data-map-sheet-close aria-label="${esc(t(lang, "map.close"))}">${icon("x")}</button>
        <div data-map-sheet-body></div>
      </div>
    </div>
  </div>
</section>`;

  return {
    title: t(lang, "meta.map.title"),
    desc: t(lang, "meta.map.desc"),
    body,
    bodyClass: "page-map",
    pageId: "map",
    jsonld: [crumbs.ld],
    clientPrefixes: ["map."],
    extraHead: `<link rel="stylesheet" href="${asset("vendor/leaflet/leaflet.css")}">`,
    extraScripts: [`<script src="${asset("vendor/leaflet/leaflet.js")}" defer></script>`, `<script src="__MAP_JS__" defer></script>`],
    clientConfig: {
      map: { center: site.map.center, zoom: site.map.zoom, cities: site.map.cities, provider: site.map.provider, stockFreshnessDays: site.map.stockFreshnessDays },
      partners: data.partners.map((p) => ({
        id: p.id,
        partnerId: p.partnerId,
        name: p.name,
        type: p.type,
        city: p.city,
        cityLabel: p.cityLabel ? pick(p.cityLabel, lang) : p.city,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        hours: p.hours,
        services: p.services ?? [],
        categories: p.categories ?? [],
        website: p.website ?? "",
        verifiedAt: p.verifiedAt,
        stockUpdatedAt: p.stockUpdatedAt ?? ""
      }))
    }
  };
}
