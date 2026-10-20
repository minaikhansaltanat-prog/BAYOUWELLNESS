import { t, pick } from "../lib/i18n.mjs";
import { href, esc, img, waLink } from "../lib/ctx.mjs";
import { icon } from "../lib/icons.mjs";
import { breadcrumbs, pageHead } from "./components.mjs";

export function business(ctx) {
  const { lang, data, site } = ctx;
  const crumbs = breadcrumbs(ctx, [{ label: t(lang, "nav.b2b") }]);
  const tallyId = site.tally?.[lang] || "";
  const wa = waLink(site, t(lang, "wa.partnerAsk"));

  const types = [1, 2, 3, 4, 5, 6];
  const perks = [1, 2, 3, 4, 5, 6, 7];
  const how = [1, 2, 3, 4];

  const form = tallyId
    ? `<div class="tallybox" data-tally-box>
        <div class="tallybox__loading" data-tally-loading>${icon("arrows-clockwise", "spin")}<span>${esc(t(lang, "b2bp.form.loading"))}</span></div>
        <iframe class="tallybox__frame" data-tally-src="https://tally.so/embed/${esc(tallyId)}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="640" title="${esc(t(lang, "b2bp.form.frameTitle"))}"></iframe>
        <p class="tallybox__fallback" data-tally-fallback hidden>${esc(t(lang, "b2bp.form.fallback"))} <a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></p>
      </div>`
    : `<div class="notice notice--soft">${icon("info")}<span>${esc(t(lang, "b2bp.form.notReady"))}</span></div>
       <p><a class="btn btn--primary" href="${wa}" target="_blank" rel="noopener" data-track-wa="b2b">${icon("whatsapp-logo")}<span>${esc(t(lang, "ui.writeWa"))}</span></a></p>`;

  const body =
    pageHead(ctx, {
      title: t(lang, "home.b2b.h"),
      lead: t(lang, "home.b2b.d"),
      crumbs: crumbs.html,
      extra: `<p class="phead__actions"><a class="btn btn--primary btn--lg" href="#apply"><span>${esc(t(lang, "ui.becomePartner"))}</span>${icon("arrow-right")}</a></p>`
    }) +
    `
<section class="section section--who">
  <div class="container who">
    <div class="who__media">${img(data, "group-1", { alt: t(lang, "hero.img3Alt"), sizes: "(min-width: 900px) 44vw, 100vw", cls: "who__img" })}</div>
    <div class="who__copy">
      <h2 class="sec-head__title">${esc(t(lang, "b2bp.who.h"))}</h2>
      <ul class="ticks">
        ${types.map((i) => `<li>${icon("check", "ticks__icon")}<span>${esc(t(lang, `b2bp.type.${i}`))}</span></li>`).join("")}
      </ul>
    </div>
  </div>
</section>
<section class="band band--deep">
  <div class="container band__inner">
    <h2 class="band__title">${esc(t(lang, "b2bp.perks.h"))}</h2>
    <ul class="perks perks--dark">
      ${perks
        .map(
          (i) =>
            `<li class="perks__item">${icon("check", "perks__icon")}<span>${esc(t(lang, `b2b.perk.${i}`))}${i === 7 ? `<em class="tag tag--dark">${esc(t(lang, "b2b.soon"))}</em>` : ""}</span></li>`
        )
        .join("")}
    </ul>
    <p class="band__note">${esc(t(lang, "b2b.note"))}</p>
  </div>
</section>
<section class="section section--how">
  <div class="container">
    <h2 class="sec-head__title">${esc(t(lang, "b2bp.how.h"))}</h2>
    <ol class="how">
      ${how.map((i) => `<li class="how__item"><p class="how__t">${esc(t(lang, `b2bp.how.${i}.t`))}</p><p class="how__d">${esc(t(lang, `b2bp.how.${i}.d`))}</p></li>`).join("")}
    </ol>
  </div>
</section>
<section class="section section--apply" id="apply">
  <div class="container container--form">
    <div class="sec-head">
      <h2 class="sec-head__title">${esc(t(lang, "b2bp.form.h"))}</h2>
      <p class="sec-head__lead">${esc(t(lang, "b2bp.form.d"))}</p>
    </div>
    ${form}
  </div>
</section>`;

  return {
    title: t(lang, "meta.b2b.title"),
    desc: t(lang, "meta.b2b.desc"),
    body,
    bodyClass: "page-b2b",
    pageId: "b2b",
    waText: t(lang, "wa.partnerAsk"),
    jsonld: [crumbs.ld],
    clientConfig: { tally: Boolean(tallyId) }
  };
}
