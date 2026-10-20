import { $, $$, cfg, t, toast, track, safeStorage, pageUrl } from "./core.js";

const KEY = "bayou_cart_v1";
const MAX = 99;

function read() {
  try {
    const v = JSON.parse(safeStorage.get(KEY) || "[]");
    return Array.isArray(v) ? v.filter((i) => i && typeof i.id === "string" && Number.isInteger(i.qty) && i.qty > 0) : [];
  } catch {
    return [];
  }
}
function write(items) {
  safeStorage.set(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:change"));
}

export const cart = {
  items: read,
  count: () => read().reduce((n, i) => n + i.qty, 0),
  add(id, qty = 1) {
    const items = read();
    const row = items.find((i) => i.id === id);
    if (row) row.qty = Math.min(MAX, row.qty + qty);
    else items.push({ id, qty: Math.min(MAX, qty) });
    write(items);
  },
  setQty(id, qty) {
    const items = read();
    const row = items.find((i) => i.id === id);
    if (!row) return;
    row.qty = Math.max(1, Math.min(MAX, qty));
    write(items);
  },
  remove(id) { write(read().filter((i) => i.id !== id)); },
  clear() { write([]); }
};

function renderBadge() {
  const n = cart.count();
  for (const el of $$("[data-cart-count]")) {
    const was = Number(el.textContent) || 0;
    el.textContent = n > 99 ? "99+" : String(n);
    el.hidden = n === 0;
    if (n > was) {
      el.classList.remove("is-bump");
      void el.offsetWidth;
      el.classList.add("is-bump");
    }
  }
}

function itemInfo(btn) {
  const card = btn.closest("[data-product-card]");
  if (card) return { name: $(".pcard__title", card)?.textContent?.trim() || btn.dataset.add };
  return { name: cfg.productName || btn.dataset.add };
}

export function initCart() {
  renderBadge();
  window.addEventListener("cart:change", renderBadge);
  window.addEventListener("storage", (e) => { if (e.key === KEY) renderBadge(); });
  window.addEventListener("pageshow", renderBadge);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    let qty = 1;
    if (btn.hasAttribute("data-add-qty")) {
      const input = $("[data-qty-input]");
      qty = Math.max(1, Math.min(MAX, parseInt(input?.value, 10) || 1));
    }
    cart.add(id, qty);
    const { name } = itemInfo(btn);
    track("add_to_cart", { currency: "KZT", items: [{ item_id: id, item_name: name, quantity: qty }] });
    toast(t("ui.added"), { href: pageUrl("cart"), label: t("ui.openCart") });
  });
}
