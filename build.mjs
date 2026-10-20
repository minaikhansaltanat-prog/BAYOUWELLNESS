// BAYOU WELLNESS static site build.
//   npm run build                      -> dist/   (base "/")
//   SITE_BASE=/BAYOUWELLNESS/ SITE_URL=https://user.github.io/BAYOUWELLNESS npm run build
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as esbuild from "esbuild";
import { ROOT, BASE, SITE_URL, loadData, href, asset, absHref, productView, esc } from "./src/lib/ctx.mjs";
import { LANGS, DEFAULT_LANG, t, pick, buildDictionaries } from "./src/lib/i18n.mjs";
import { renderPage } from "./src/templates/layout.mjs";
import home from "./src/templates/home.mjs";
import { catalog, product } from "./src/templates/catalog.mjs";
import { guidesIndex, guideArticle, about, contact, privacy, notFound } from "./src/templates/content.mjs";
import { business } from "./src/templates/business.mjs";
import { partnersMap } from "./src/templates/map.mjs";
import { cart } from "./src/templates/cart.mjs";

const DIST = path.join(ROOT, "dist");
const started = Date.now();

const { problems } = buildDictionaries();
if (problems.length) {
  console.error("i18n problems:\n" + problems.join("\n"));
  process.exit(1);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });

const write = (rel, content) => {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
const copyDir = (from, to) => fs.cpSync(from, to, { recursive: true });

// ---------- static assets ----------
copyDir(path.join(ROOT, "public"), DIST);
const leafletDir = path.join(ROOT, "node_modules", "leaflet", "dist");
fs.mkdirSync(path.join(DIST, "vendor", "leaflet"), { recursive: true });
for (const f of ["leaflet.js", "leaflet.css"]) fs.copyFileSync(path.join(leafletDir, f), path.join(DIST, "vendor", "leaflet", f));
copyDir(path.join(leafletDir, "images"), path.join(DIST, "vendor", "leaflet", "images"));
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");

// ---------- CSS ----------
const cssOrder = ["fonts", "tokens", "base", "components", "header", "home", "pages", "map", "motion"];
const cssSrc = cssOrder
  .map((n) => fs.readFileSync(path.join(ROOT, "src", "css", `${n}.css`), "utf8"))
  .join("\n")
  .replaceAll("__BASE__", BASE);
const cssOut = await esbuild.transform(cssSrc, { loader: "css", minify: true, target: ["chrome90", "safari14", "firefox90"] });
const cssHash = crypto.createHash("sha1").update(cssOut.code).digest("hex").slice(0, 8);
const appCss = `assets/app.${cssHash}.css`;
write(appCss, cssOut.code);

// ---------- JS ----------
const jsRes = await esbuild.build({
  entryPoints: { app: path.join(ROOT, "src/js/app.js"), map: path.join(ROOT, "src/js/map.js") },
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  outdir: path.join(DIST, "assets"),
  entryNames: "[name].[hash]",
  metafile: true,
  logLevel: "warning"
});
const jsOutputs = Object.keys(jsRes.metafile.outputs).map((p) => path.basename(p));
const appJs = `assets/${jsOutputs.find((n) => n.startsWith("app."))}`;
const mapJs = `assets/${jsOutputs.find((n) => n.startsWith("map."))}`;

// ---------- data ----------
const data = loadData();
const { site } = data;

const pageCount = { n: 0 };
function emit(lang, route, page, extra = {}) {
  const ctx = { lang, route, altRoute: extra.altRoute, data, site, appCss, appJs };
  const out = typeof page === "function" ? page(ctx) : page;
  let html = renderPage({ ...ctx, ...out });
  html = html.replaceAll("__MAP_JS__", asset(mapJs));
  const rel = extra.file ?? `${lang}/${route ? route + "/" : ""}index.html`;
  write(rel, html);
  pageCount.n++;
}

for (const lang of LANGS) {
  emit(lang, "", (c) => home(c));
  emit(lang, "catalog", (c) => catalog(c));
  for (const p of data.products) emit(lang, `product/${p.slug}`, (c) => product(c, p));
  emit(lang, "guides", (c) => guidesIndex(c));
  for (const g of data.guides) emit(lang, `guides/${g.slug}`, (c) => guideArticle(c, g));
  emit(lang, "partners/map", (c) => partnersMap(c));
  emit(lang, "partners/business", (c) => business(c));
  emit(lang, "about", (c) => about(c));
  emit(lang, "contact", (c) => contact(c));
  emit(lang, "cart", (c) => cart(c));
  emit(lang, "privacy", (c) => privacy(c));
  emit(lang, "404", (c) => notFound(c), { file: `${lang}/404.html` });

  // search index
  const searchData = {
    products: data.products.map((p) => {
      const v = productView(data, p, lang);
      const im = p.images[0];
      const w = data.images[im.name].widths[0];
      return {
        id: p.id,
        name: v.name,
        brand: v.brand,
        type: v.typeText,
        url: v.url,
        img: asset(`img/${im.name}-${w}.webp`),
        text: [v.name, v.brand, v.typeText, v.shortText, ...v.categoryNames.map((c) => c.name)].join(" ").toLowerCase()
      };
    }),
    guides: data.guides.map((g) => ({ title: pick(g.title, lang), url: href(lang, `guides/${g.slug}`), text: `${pick(g.title, lang)} ${pick(g.lead, lang)}`.toLowerCase() })),
    pages: [
      ["catalog", "nav.catalog"],
      ["guides", "nav.guides"],
      ["partners/map", "nav.map"],
      ["partners/business", "nav.b2b"],
      ["about", "nav.about"],
      ["contact", "nav.contact"]
    ].map(([r, k]) => ({ title: t(lang, k), url: href(lang, r), text: t(lang, k).toLowerCase() }))
  };
  write(`data/${lang}.json`, JSON.stringify(searchData));
}

// root 404 (default language; script upgrades to the visitor's language)
emit(DEFAULT_LANG, "404", (c) => ({ ...notFound(c), extraHead: `<script>(function(){try{var b=document.documentElement.getAttribute("data-base");var p=location.pathname;var seg=p.indexOf(b)===0?p.slice(b.length).split("/")[0]:"";var L={kk:1,ru:1,en:1,ko:1};var l=L[seg]?seg:(localStorage.getItem("bayou_lang")||(navigator.language||"").slice(0,2).toLowerCase());if(L[l]&&l!=="${DEFAULT_LANG}")location.replace(b+l+"/404.html")}catch(e){}})()</script>` }), { file: "404.html", altRoute: "404" });

// root index: language router
{
  const langs = JSON.stringify(Object.fromEntries(LANGS.map((l) => [l, 1])));
  write(
    "index.html",
    `<!doctype html>
<html lang="${DEFAULT_LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BAYOU WELLNESS</title>
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${absHref(DEFAULT_LANG, "")}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${absHref(l, "")}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${absHref(DEFAULT_LANG, "")}">
<meta http-equiv="refresh" content="1; url=${href(DEFAULT_LANG, "")}">
<script>(function(){try{var L=${langs};var s=localStorage.getItem("bayou_lang");var n=(navigator.language||"").slice(0,2).toLowerCase();var l=L[s]?s:(L[n]?n:"${DEFAULT_LANG}");location.replace("${BASE}"+l+"/"+location.search+location.hash)}catch(e){location.replace("${href(DEFAULT_LANG, "")}")}})()</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.6 system-ui,sans-serif;background:#F7F9F6;color:#202820}a{color:#237900;margin:0 .6em}</style>
</head>
<body>
<p>${LANGS.map((l) => `<a href="${href(l, "")}" hreflang="${l}">${esc(l === "kk" ? "Қазақша" : l === "ru" ? "Русский" : l === "en" ? "English" : "한국어")}</a>`).join("")}</p>
</body>
</html>`
  );
}

// ---------- sitemap + robots ----------
{
  const routes = ["", "catalog", "guides", "partners/map", "partners/business", "about", "contact", "privacy", ...data.products.map((p) => `product/${p.slug}`), ...data.guides.map((g) => `guides/${g.slug}`)];
  const urls = [];
  for (const r of routes) {
    for (const l of LANGS) {
      const links = LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${absHref(x, r)}"/>`).join("") + `<xhtml:link rel="alternate" hreflang="x-default" href="${absHref(DEFAULT_LANG, r)}"/>`;
      urls.push(`<url><loc>${absHref(l, r)}</loc>${links}</url>`);
    }
  }
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
  write("robots.txt", `User-agent: *\nAllow: /\nDisallow: ${BASE}*/cart/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(
  `built ${pageCount.n} pages in ${((Date.now() - started) / 1000).toFixed(1)}s | base=${BASE} | css ${kb(cssOut.code.length)} | js ${jsOutputs.join(", ")}`
);
