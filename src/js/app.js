import { initAnalytics } from "./core.js";
import { initCart } from "./cart.js";
import { initHeader, initMenu, initLang, initSearch, initFab } from "./ui.js";
import { initMotion } from "./motion.js";
import { initCatalog, initProduct, initCartPage, initTally } from "./pages.js";

// Each feature boots in isolation so one failure can never take the page down.
const safe = (fn) => {
  try { fn(); } catch (err) { console.error(`[boot] ${fn.name}`, err); }
};

function boot() {
  [initAnalytics, initHeader, initMenu, initLang, initSearch, initFab, initCart, initCatalog, initProduct, initCartPage, initTally, initMotion].forEach(safe);
  document.documentElement.classList.add("ready");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
