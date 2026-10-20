import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ASSETS = path.join(ROOT, "node_modules", "@phosphor-icons", "core", "assets");

// name -> weight. Anything not listed is "regular".
const ICONS = {
  list: "regular",
  x: "regular",
  "magnifying-glass": "regular",
  "shopping-bag": "regular",
  "caret-down": "bold",
  "caret-right": "bold",
  "arrow-right": "bold",
  "arrow-up-right": "bold",
  "arrow-left": "bold",
  "whatsapp-logo": "fill",
  phone: "regular",
  "map-pin": "regular",
  "map-pin-line": "regular",
  "chat-circle-text": "regular",
  storefront: "regular",
  handshake: "regular",
  plus: "bold",
  minus: "bold",
  trash: "regular",
  check: "bold",
  "check-circle": "fill",
  "warning-circle": "regular",
  leaf: "regular",
  translate: "regular",
  target: "regular",
  funnel: "regular",
  "sliders-horizontal": "regular",
  crosshair: "regular",
  "map-trifold": "regular",
  "list-bullets": "regular",
  "navigation-arrow": "regular",
  clock: "regular",
  "seal-check": "fill",
  "book-open": "regular",
  info: "regular",
  globe: "regular",
  package: "regular",
  "buildings": "regular",
  "shield-check": "regular",
  "arrows-clockwise": "regular",
  link: "regular",
  "chat-teardrop-text": "regular",
  "user-circle": "regular"
};

function load(name, weight) {
  const file = weight === "regular" ? `${name}.svg` : `${name}-${weight}.svg`;
  const p = path.join(ASSETS, weight, file);
  if (!fs.existsSync(p)) throw new Error(`Icon not found: ${weight}/${file}`);
  const svg = fs.readFileSync(p, "utf8");
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  return inner;
}

export function spriteSvg() {
  const symbols = Object.entries(ICONS)
    .map(([name, w]) => `<symbol id="i-${name}" viewBox="0 0 256 256">${load(name, w)}</symbol>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${symbols}</svg>`;
}

export function icon(name, cls = "") {
  if (!(name in ICONS)) throw new Error(`Icon "${name}" is not registered in icons.mjs`);
  return `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}
