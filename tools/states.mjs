// Capture interactive UI states on mobile into ./temporary screenshots/states-*.png (dev helper).
//   node tools/states.mjs [lang]
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const lang = process.argv[2] || "kk";
const O = "http://localhost:3000";
const dir = path.resolve("temporary screenshots");
fs.mkdirSync(dir, { recursive: true });
const chrome = ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].find((p) => fs.existsSync(p));
const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox"], ...(chrome ? { executablePath: chrome } : {}) });
const p = await b.newPage();
await p.setViewport({ width: 375, height: 812, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name) => { await p.screenshot({ path: path.join(dir, `states-${lang}-${name}.png`) }); console.log(name); };

await p.goto(`${O}/${lang}/`, { waitUntil: "networkidle2" });
await wait(1200);
await p.click("[data-menu-open]"); await wait(800); await shot("1-menu");
await p.click(".menu__close"); await wait(700);
await p.click("[data-lang] summary"); await wait(500); await shot("2-lang");
await p.keyboard.press("Escape"); await wait(300);
await p.evaluate(() => document.querySelector("[data-search-open]") || null);
await p.click("[data-menu-open]"); await wait(600);
await p.click(".menu__search"); await wait(800);
await p.type("[data-search-input]", "ro"); await wait(700); await shot("3-search");
await p.keyboard.press("Escape"); await wait(500);
await p.goto(`${O}/${lang}/catalog/`, { waitUntil: "networkidle2" }); await wait(800); await shot("4-catalog");
await p.click("[data-add]"); await wait(600); await shot("5-added");
await p.goto(`${O}/${lang}/cart/`, { waitUntil: "networkidle2" }); await wait(800); await shot("6-cart");
await p.evaluate(() => window.scrollTo(0, 650)); await wait(600); await shot("7-checkout");
await p.click('[data-checkout] button[type="submit"]'); await wait(500); await p.evaluate(() => window.scrollTo(0, 800)); await wait(400); await shot("8-errors");
await p.goto(`${O}/${lang}/product/rosemary-pdrn-scalp-serum/`, { waitUntil: "networkidle2" }); await wait(800); await shot("9-product");
await p.evaluate(() => window.scrollTo(0, 650)); await wait(500); await shot("10-product2");
await p.goto(`${O}/${lang}/partners/map/`, { waitUntil: "networkidle2" }); await wait(1200); await shot("11-map-list");
await p.click('[data-view-tab="map"]'); await wait(1800); await shot("12-map-map");
await b.close();
