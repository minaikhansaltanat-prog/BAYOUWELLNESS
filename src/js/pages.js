import { $, $$, cfg, t, money, track, toast, url, pageUrl, debounce } from "./core.js";
import { cart } from "./cart.js";

/* ---------------- catalog: chips + search + sort (cards are server-rendered) ---------------- */
export function initCatalog() {
  const root = $("[data-catalog]");
  if (!root) return;
  const grid = $("[data-catalog-grid]", root);
  const cards = $$("[data-product-card]", grid);
  const chips = $$("[data-chip]", root);
  const q = $("[data-catalog-q]", root);
  const sort = $("[data-catalog-sort]", root);
  const count = $("[data-catalog-count]", root);
  const empty = $("[data-catalog-empty]", root);
  const state = { cat: "all", q: "", sort: "default" };

  const params = new URLSearchParams(location.search);
  if (params.get("c") && chips.some((c) => c.dataset.chip === params.get("c"))) state.cat = params.get("c");
  if (params.get("q")) { state.q = params.get("q"); q.value = state.q; }

  const apply = () => {
    const needle = state.q.trim().toLowerCase();
    let visible = cards.filter((c) => (state.cat === "all" || c.dataset.cats.split(" ").includes(state.cat)) && (!needle || c.dataset.name.includes(needle)));
    cards.forEach((c) => { c.hidden = !visible.includes(c); });
    const key = state.sort === "name" ? (c) => c.dataset.name : (c) => Number(c.dataset.order);
    const ordered = [...cards].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0));
    ordered.forEach((c) => grid.appendChild(c));
    chips.forEach((c) => { const on = c.dataset.chip === state.cat; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", String(on)); });
    count.textContent = t("cat.found", { n: visible.length });
    empty.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;
    const p = new URLSearchParams();
    if (state.cat !== "all") p.set("c", state.cat);
    if (state.q) p.set("q", state.q);
    history.replaceState(null, "", location.pathname + (p.toString() ? `?${p}` : "") + location.hash);
  };

  chips.forEach((c) => c.addEventListener("click", () => { state.cat = c.dataset.chip; apply(); }));
  q.addEventListener("input", debounce(() => { state.q = q.value; apply(); }, 120));
  sort.addEventListener("change", () => { state.sort = sort.value; apply(); });
  $("[data-catalog-reset]", root)?.addEventListener("click", () => { state.cat = "all"; state.q = ""; q.value = ""; apply(); });
  apply();
}

/* ---------------- product page: gallery + quantity ---------------- */
export function initProduct() {
  if (cfg.productId) track("view_item", { currency: "KZT", items: [{ item_id: cfg.productId, item_name: cfg.productName }] });

  const g = $("[data-gallery]");
  if (g) {
    const slides = $$("[data-slide]", g);
    const thumbs = $$("[data-thumb]", g);
    thumbs.forEach((b) =>
      b.addEventListener("click", () => {
        const i = Number(b.dataset.thumb);
        slides.forEach((s, k) => { s.hidden = k !== i; });
        thumbs.forEach((x, k) => { x.classList.toggle("is-active", k === i); x.setAttribute("aria-pressed", String(k === i)); });
        const main = $(".gallery__main", g);
        main.classList.toggle("is-multiply", slides[i].classList.contains("is-multiply"));
      })
    );
  }

  const qty = $("[data-qty]");
  if (qty) {
    const input = $("[data-qty-input]", qty);
    const clamp = () => { input.value = String(Math.max(1, Math.min(99, parseInt(input.value, 10) || 1))); };
    $("[data-qty-dec]", qty).addEventListener("click", () => { input.value = String((parseInt(input.value, 10) || 1) - 1); clamp(); });
    $("[data-qty-inc]", qty).addEventListener("click", () => { input.value = String((parseInt(input.value, 10) || 1) + 1); clamp(); });
    input.addEventListener("change", clamp);
    input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 2); });
  }
}

/* ---------------- cart page ---------------- */
export function initCartPage() {
  const root = $("[data-cart-page]");
  if (!root) return;
  const catalog = new Map((cfg.catalog || []).map((p) => [p.id, p]));
  const listEl = $("[data-cart-items]", root);
  const emptyEl = $("[data-cart-empty]", root);
  const filled = $("[data-cart-filled]", root);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let checkoutTracked = false;

  const unit = (p) => (p.price == null ? null : p.salePrice ?? p.price);

  const render = () => {
    const items = cart.items().filter((i) => catalog.has(i.id));
    emptyEl.hidden = items.length > 0;
    filled.hidden = items.length === 0;
    if (!items.length) return;

    listEl.innerHTML = items
      .map((i) => {
        const p = catalog.get(i.id);
        const u = unit(p);
        return `<li class="citem" data-id="${esc(p.id)}">
          <a class="citem__media tile${p.blend ? " is-multiply" : ""}" href="${p.url}" tabindex="-1" aria-hidden="true"><img class="citem__img" src="${p.img}" alt="" width="88" height="110" loading="lazy"></a>
          <div>
            <h3 class="citem__name"><a href="${p.url}">${esc(p.name)}</a></h3>
            <p class="citem__meta">${esc(p.type)}, ${esc(p.volume)}</p>
          </div>
          <div class="citem__row">
            <div class="qty" role="group" aria-label="${esc(t("cart.qty"))}">
              <button class="qty__btn" type="button" data-dec aria-label="${esc(t("cart.decrease"))}"><svg class="i" aria-hidden="true"><use href="#i-minus"/></svg></button>
              <input class="qty__input" type="text" inputmode="numeric" value="${i.qty}" aria-label="${esc(t("cart.qty"))}" data-q>
              <button class="qty__btn" type="button" data-inc aria-label="${esc(t("cart.increase"))}"><svg class="i" aria-hidden="true"><use href="#i-plus"/></svg></button>
            </div>
            <p class="citem__price${u == null ? " citem__price--ask" : ""}">${u == null ? esc(t("price.onRequest")) : esc(money(u * i.qty))}</p>
            <button class="citem__remove" type="button" data-remove><svg class="i" aria-hidden="true"><use href="#i-trash"/></svg><span>${esc(t("cart.remove"))}</span></button>
          </div>
        </li>`;
      })
      .join("");

    const priced = items.every((i) => unit(catalog.get(i.id)) != null);
    const sub = items.reduce((s, i) => s + (unit(catalog.get(i.id)) ?? 0) * i.qty, 0);
    $("[data-sum-subtotal]", root).textContent = priced ? money(sub) : "-";
    $("[data-sum-total]", root).textContent = priced ? money(sub) : "-";
    $("[data-sum-pending]", root).hidden = priced;
  };

  listEl.addEventListener("click", (e) => {
    const li = e.target.closest(".citem");
    if (!li) return;
    const id = li.dataset.id;
    const row = cart.items().find((i) => i.id === id);
    if (e.target.closest("[data-inc]")) cart.setQty(id, (row?.qty || 1) + 1);
    else if (e.target.closest("[data-dec]")) cart.setQty(id, (row?.qty || 1) - 1);
    else if (e.target.closest("[data-remove]")) {
      const p = catalog.get(id);
      cart.remove(id);
      track("remove_from_cart", { currency: "KZT", items: [{ item_id: id, item_name: p?.name, quantity: row?.qty || 1 }] });
      toast(t("ui.removed"));
    }
  });
  listEl.addEventListener("change", (e) => {
    const input = e.target.closest("[data-q]");
    if (!input) return;
    cart.setQty(e.target.closest(".citem").dataset.id, parseInt(input.value, 10) || 1);
  });
  window.addEventListener("cart:change", render);
  render();

  // ---- checkout form ----
  const form = $("[data-checkout]", root);
  const addrWrap = $("[data-address-wrap]", form);
  const setMethod = () => { addrWrap.hidden = form.method.value === "pickup"; };
  $$('input[name="method"]', form).forEach((r) => r.addEventListener("change", setMethod));
  setMethod();

  const fireBegin = () => {
    if (checkoutTracked) return;
    checkoutTracked = true;
    const items = cart.items().map((i) => ({ item_id: i.id, item_name: catalog.get(i.id)?.name, quantity: i.qty }));
    track("begin_checkout", { currency: "KZT", items });
  };
  form.addEventListener("focusin", fireBegin);

  const err = (id, msg) => {
    const p = $(`[data-err-for="${id}"]`, form);
    const field = p?.closest(".field");
    if (p) { p.textContent = msg || ""; p.hidden = !msg; }
    field?.classList.toggle("has-error", Boolean(msg));
    const input = document.getElementById(id);
    input?.setAttribute("aria-invalid", msg ? "true" : "false");
    return Boolean(msg);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = {
      name: form["co-name"].value.trim(),
      phone: form["co-phone"].value.trim(),
      email: form["co-email"].value.trim(),
      method: form.method.value,
      address: form["co-address"].value.trim(),
      comment: form["co-comment"].value.trim(),
      consent: form["co-consent"].checked
    };
    const digits = v.phone.replace(/\D/g, "");
    let bad = false;
    bad = err("co-name", v.name ? "" : t("cart.form.errRequired")) || bad;
    bad = err("co-phone", !v.phone ? t("cart.form.errRequired") : digits.length < 10 || digits.length > 15 ? t("cart.form.errPhone") : "") || bad;
    bad = err("co-email", v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? t("cart.form.errEmail") : "") || bad;
    bad = err("co-consent", v.consent ? "" : t("cart.form.errConsent")) || bad;
    if (bad) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }

    const items = cart.items().filter((i) => catalog.has(i.id));
    if (!items.length) return;
    fireBegin();
    const lines = items.map((i) => {
      const p = catalog.get(i.id);
      const u = unit(p);
      return `• ${p.brand} ${p.name}, ${p.volume} x ${i.qty}${u != null ? ` (${money(u * i.qty)})` : ""}`;
    });
    const priced = items.every((i) => unit(catalog.get(i.id)) != null);
    const total = items.reduce((s, i) => s + (unit(catalog.get(i.id)) ?? 0) * i.qty, 0);
    const msg = [
      t("cart.wa.header"),
      "",
      `${t("cart.wa.items")}:`,
      ...lines,
      ...(priced ? ["", `${t("cart.total")}: ${money(total)}`] : []),
      "",
      `${t("cart.form.name")}: ${v.name}`,
      `${t("cart.form.phone")}: ${v.phone}`,
      ...(v.email ? [`Email: ${v.email}`] : []),
      `${t("cart.form.method")}: ${v.method === "pickup" ? t("cart.form.methodPickup") : t("cart.form.methodDelivery")}`,
      ...(v.method === "delivery" && v.address ? [`${t("cart.form.address")}: ${v.address}`] : []),
      ...(v.comment ? [`${t("cart.form.comment")}: ${v.comment}`] : [])
    ].join("\n");

    track("generate_lead", { method: "whatsapp_order", currency: "KZT", value: priced ? total : undefined, items: items.map((i) => ({ item_id: i.id, quantity: i.qty })) });
    const link = `https://wa.me/${cfg.wa}?text=${encodeURIComponent(msg)}`;
    const w = window.open(link, "_blank", "noopener");
    if (!w) location.href = link;
    toast(t("cart.sent"));
  });
}

/* ---------------- B2B: Tally embed (lazy) ---------------- */
export function initTally() {
  const box = $("[data-tally-box]");
  if (!box) return;
  const frame = $("[data-tally-src]", box);
  const fallback = $("[data-tally-fallback]", box);
  let started = false;
  let submitted = false;

  const load = () => {
    if (started) return;
    started = true;
    const failTimer = setTimeout(() => { fallback.hidden = false; }, 9000);
    frame.addEventListener("load", () => { clearTimeout(failTimer); box.classList.add("is-ready"); }, { once: true });
    // Tally's embed.js sets the iframe src itself and attaches the auto-resize handler (iFrameResizer);
    // plain src is only the fallback if the script cannot load.
    const direct = () => { if (!frame.getAttribute("src")) frame.src = frame.dataset.tallySrc; };
    const s = document.createElement("script");
    s.src = "https://tally.so/widgets/embed.js";
    s.async = true;
    s.onload = () => { try { window.Tally?.loadEmbeds?.(); } catch { /* ignore */ } setTimeout(direct, 1500); };
    s.onerror = direct;
    document.head.appendChild(s);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: "500px 0px" });
    io.observe(box);
  } else load();

  window.addEventListener("message", (e) => {
    if (e.origin !== "https://tally.so") return;
    let d = e.data;
    if (typeof d === "string") { try { d = JSON.parse(d); } catch { return; } }
    const ev = d?.event;
    if (ev === "Tally.FormLoaded") track("b2b_form_loaded");
    if (ev === "Tally.FormPageView" && (d.payload?.page ?? 1) === 1 && !box.dataset.started) { box.dataset.started = "1"; track("b2b_form_start"); }
    if (ev === "Tally.FormSubmitted" && !submitted) { submitted = true; track("b2b_form_submit"); }
  });
}
