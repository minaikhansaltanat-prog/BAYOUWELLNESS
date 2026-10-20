// Puppeteer screenshots from localhost.
//   node screenshot.mjs http://localhost:3000/kk/ [label] [--w 375] [--h 812] [--full] [--scroll 800] [--mobile] [--wait 1200]
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented).
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const has = (n) => args.includes(`--${n}`);
const positional = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] || "").startsWith("--") || (i === 0));
const target = positional[0];
const label = positional[1] && !positional[1].startsWith("--") && !/^\d+$/.test(positional[1]) ? positional[1] : "";
if (!target) { console.error("usage: node screenshot.mjs <url> [label]"); process.exit(1); }
if (!/^https?:\/\/localhost/.test(target)) { console.error("Always screenshot from localhost."); process.exit(1); }

const w = Number(flag("w", 1440));
const h = Number(flag("h", 900));
const mobile = has("mobile") || w < 700;
const dir = path.resolve("temporary screenshots");
fs.mkdirSync(dir, { recursive: true });
let n = 1;
for (const f of fs.readdirSync(dir)) { const m = f.match(/^screenshot-(\d+)/); if (m) n = Math.max(n, Number(m[1]) + 1); }
const file = path.join(dir, `screenshot-${n}${label ? "-" + label : ""}.png`);

// Prefer the system Chrome/Edge (no 170 MB download); fall back to Puppeteer's own browser.
const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);
const executablePath = candidates.find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"], ...(executablePath ? { executablePath } : {}) });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
if (mobile) await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
const logs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(target, { waitUntil: "networkidle2", timeout: 45000 });
await new Promise((r) => setTimeout(r, Number(flag("wait", 1500))));
const sc = Number(flag("scroll", 0));
if (sc) { await page.evaluate((y) => window.scrollTo(0, y), sc); await new Promise((r) => setTimeout(r, 900)); }
if (has("reveal")) { await page.evaluate(() => document.querySelectorAll("[data-reveal],[data-hero-item]").forEach((e) => { e.classList.add("is-in"); e.style.opacity = 1; e.style.transform = "none"; })); await new Promise((r) => setTimeout(r, 300)); }
const metrics = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
const steps = Number(flag("steps", 0));
if (steps) {
  // consecutive viewport shots down the page: --steps 6 [--stride 800]
  const stride = Number(flag("stride", h - 80));
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), sc + i * stride);
    await new Promise((r) => setTimeout(r, 1100));
    if (has("reveal")) await page.evaluate(() => document.querySelectorAll("[data-reveal],[data-hero-item]").forEach((e) => { e.classList.add("is-in"); e.style.opacity = 1; e.style.transform = "none"; }));
    const f = path.join(dir, `screenshot-${n}-${label || "shot"}-${i + 1}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
} else {
  await page.screenshot({ path: file, fullPage: has("full") });
  console.log(file);
}
console.log(`scrollWidth=${metrics.sw} clientWidth=${metrics.cw} ${metrics.sw > metrics.cw ? "HORIZONTAL OVERFLOW" : "no horizontal overflow"} height=${metrics.sh}`);
if (logs.length) console.log("console:\n" + logs.join("\n"));
await browser.close();
