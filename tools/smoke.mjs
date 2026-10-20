// Smoke test against a running dev server (npm run dev): layout stability, console errors, broken images, key interactions.
//   node tools/smoke.mjs [http://localhost:3000] [--quick]
import fs from "node:fs";
import puppeteer from "puppeteer";

const ORIGIN = (process.argv.find((a) => a.startsWith("http")) || "http://localhost:3000").replace(/\/$/, "");
const QUICK = process.argv.includes("--quick");
const LANGS = ["kk", "ru", "en", "ko"];
const ROUTES = ["", "catalog", "product/rosemary-root-enhancer", "guides", "guides/scalp-care", "partners/map", "partners/business", "about", "contact", "cart", "privacy"];
const wArg = process.argv.find((a) => a.startsWith("--widths="));
const WIDTHS = wArg ? wArg.slice(9).split(",").map(Number) : QUICK ? [375, 1440] : [320, 360, 375, 390, 414, 768, 1024, 1440];

const chrome = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome"
].filter(Boolean).find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"], ...(chrome ? { executablePath: chrome } : {}) });
const problems = [];
let checks = 0;
const bad = (m) => problems.push(m);

async function openPage(w, h, url) {
  const page = await browser.newPage();
  const mobile = w < 768;
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const errs = [];
  page.on("pageerror", (e) => errs.push(`pageerror ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/tile\.openstreetmap|tally\.so|ERR_(INTERNET|NAME|CONNECTION|FAILED)|Failed to load resource.*(403|404)/.test(m.text())) errs.push(`console ${m.text()}`); });
  page.on("requestfailed", (r) => { const u = r.url(); if (u.startsWith(ORIGIN)) errs.push(`requestfailed ${u}`); });
  page.on("response", (r) => { if (r.url().startsWith(ORIGIN) && r.status() >= 400 && !r.url().endsWith("/favicon.ico")) errs.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  return { page, errs };
}

// ---- 1. layout stability on every page/language/width ----
for (const lang of LANGS) {
  for (const route of ROUTES) {
    for (const w of WIDTHS) {
      const url = `${ORIGIN}/${lang}/${route ? route + "/" : ""}`;
      const { page, errs } = await openPage(w, 800, url);
      checks++;
      const r = await page.evaluate(() => {
        const de = document.documentElement;
        const wide = [];
        for (const el of document.querySelectorAll("body *")) {
          const b = el.getBoundingClientRect();
          if (b.width && b.right > de.clientWidth + 1 && !el.closest(".rail__track, .chips, .menu, .search, .leaflet-container, .wa-fab, .toast, .lang__list, .skip") && getComputedStyle(el).position !== "fixed") { wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`); if (wide.length > 3) break; }
        }
        const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
        const hdr = document.querySelector("[data-header]");
        return { sw: de.scrollWidth, cw: de.clientWidth, wide, imgs, hdrPos: hdr && getComputedStyle(hdr).position, hdrBottom: hdr && Math.round(hdr.getBoundingClientRect().bottom) };
      });
      const tag = `${lang}/${route || "home"} @${w}`;
      if (r.sw > r.cw) bad(`${tag}: horizontal overflow ${r.sw} > ${r.cw}`);
      if (r.wide.length) bad(`${tag}: elements past viewport: ${r.wide.join(", ")}`);
      if (r.imgs.length) bad(`${tag}: broken images ${r.imgs.join(", ")}`);
      if (r.hdrPos !== "fixed") bad(`${tag}: header not fixed`);
      errs.forEach((e) => bad(`${tag}: ${e}`));
      await page.close();
    }
  }
}

// ---- 2. header stays put while scrolling (mobile) ----
{
  const { page } = await openPage(375, 812, `${ORIGIN}/kk/`);
  await page.evaluate(() => window.scrollTo(0, 1800));
  await new Promise((r) => setTimeout(r, 500));
  const top = await page.evaluate(() => Math.round(document.querySelector("[data-header]").getBoundingClientRect().top));
  checks++;
  if (top !== 0) bad(`header moved on scroll: top=${top}`);
  const sx = await page.evaluate(() => window.scrollX);
  if (sx !== 0) bad(`page scrolled sideways: scrollX=${sx}`);
  await page.close();
}

// ---- 3. mobile menu: hamburger top-right, X inside, language switcher left of hamburger ----
for (const lang of LANGS) {
  const { page } = await openPage(375, 812, `${ORIGIN}/${lang}/`);
  const geo = await page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect();
    const m = r("[data-menu-open]"), l = r("[data-lang] summary"), c = r(".tools__cart");
    return { menuRight: Math.round(375 - m.right), menuTop: Math.round(m.top), langRight: Math.round(l.right), menuLeft: Math.round(m.left), cartRight: Math.round(c.right), langLeft: Math.round(l.left) };
  });
  checks++;
  if (geo.menuRight > 24 || geo.menuTop > 20) bad(`${lang}: hamburger not top-right ${JSON.stringify(geo)}`);
  if (geo.langRight > geo.menuLeft + 1) bad(`${lang}: language switcher not left of hamburger ${JSON.stringify(geo)}`);
  await page.click("[data-menu-open]");
  await new Promise((r) => setTimeout(r, 700));
  const open = await page.evaluate(() => ({ open: document.querySelector("[data-menu]").classList.contains("is-open"), locked: document.documentElement.classList.contains("is-locked"), close: !!document.querySelector(".menu__close"), closeBox: (() => { const b = document.querySelector(".menu__close").getBoundingClientRect(); return { top: Math.round(b.top), right: Math.round(375 - b.right) }; })() }));
  if (!open.open || !open.locked || !open.close) bad(`${lang}: menu did not open correctly ${JSON.stringify(open)}`);
  if (open.closeBox.top > 24 || open.closeBox.right > 30) bad(`${lang}: X button not top-right ${JSON.stringify(open.closeBox)}`);
  await page.click(".menu__close");
  await new Promise((r) => setTimeout(r, 700));
  const closed = await page.evaluate(() => ({ open: document.querySelector("[data-menu]").classList.contains("is-open"), locked: document.documentElement.classList.contains("is-locked") }));
  if (closed.open || closed.locked) bad(`${lang}: menu did not close ${JSON.stringify(closed)}`);
  await page.close();
}

// ---- 4. cart flow ----
{
  const { page } = await openPage(375, 812, `${ORIGIN}/kk/catalog/`);
  await page.click("[data-add]");
  await new Promise((r) => setTimeout(r, 400));
  const cnt = await page.evaluate(() => document.querySelector("[data-cart-count]").textContent);
  checks++;
  if (cnt !== "1") bad(`cart badge expected 1, got ${cnt}`);
  await page.goto(`${ORIGIN}/kk/cart/`, { waitUntil: "networkidle2" });
  const items = await page.$$eval(".citem", (n) => n.length);
  if (items !== 1) bad(`cart page expected 1 item, got ${items}`);
  await page.click("[data-inc]");
  const q = await page.$eval("[data-q]", (i) => i.value);
  if (q !== "2") bad(`quantity expected 2, got ${q}`);
  await page.click('[data-checkout] button[type="submit"]');
  const errs = await page.$$eval("[data-err-for]:not([hidden])", (n) => n.length);
  if (errs < 3) bad(`checkout validation should flag name, phone and consent, got ${errs}`);
  await page.close();
}

// ---- 5. catalog filter + search ----
{
  const { page } = await openPage(1440, 900, `${ORIGIN}/ru/catalog/`);
  await page.click('[data-chip="hair-care"]');
  const vis = await page.$$eval("[data-product-card]:not([hidden])", (n) => n.length);
  checks++;
  if (vis !== 3) bad(`catalog hair-care filter expected 3, got ${vis}`);
  await page.click("[data-search-open]");
  await page.type("[data-search-input]", "scrub");
  await new Promise((r) => setTimeout(r, 700));
  const found = await page.$$eval(".search__item", (n) => n.length);
  if (found < 1) bad("site search found nothing for 'scrub'");
  await page.close();
}

await browser.close();
console.log(`smoke: ${checks} checks, ${problems.length} problem(s)`);
if (problems.length) {
  console.log(problems.slice(0, 80).map((p) => " - " + p).join("\n"));
  process.exit(1);
}
