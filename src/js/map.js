// Partner map page. The server-rendered list is the source of truth for the UI; Leaflet enhances it.
// If Leaflet or the tile provider fails, the list keeps working (spec 5.6 / 14.7).
import { $, $$, cfg, t, track, debounce } from "./core.js";

const partners = cfg.partners || [];
const mapCfg = cfg.map || {};
const root = $("[data-map-root]");
if (root) init();

function init() {
  const list = $("[data-map-list]", root);
  const cards = new Map($$("[data-partner]", list).map((li) => [li.dataset.partner, li]));
  const countEl = $("[data-map-count]", root);
  const msgEl = $("[data-map-msg]", root);
  const emptyEl = $("[data-map-empty]", root);
  const netEl = $("[data-network-empty]", root);
  const qEl = $("[data-map-q]", root);
  const cityEl = $("[data-map-city]", root);
  const svcEl = $("[data-map-svc]", root);
  const failEl = $("[data-map-fail]", root);
  const sheet = $("[data-map-sheet]", root);
  const sheetBody = $("[data-map-sheet-body]", root);
  const canvas = $("[data-map-canvas]", root);
  const state = { q: "", type: "all", svc: "", city: "", user: null, active: null };

  let map = null;
  let layer = null;
  let userMarker = null;
  const pins = new Map();
  let mapFailed = false;
  let tilesOk = 0;
  let tilesBad = 0;

  const small = () => window.matchMedia("(max-width: 899px)").matches;
  const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

  /* ---------- map ---------- */
  function ensureMap() {
    if (map || mapFailed) return map;
    if (!window.L) return fail();
    try {
      const L = window.L;
      map = L.map(canvas, {
        center: mapCfg.center || [48, 67],
        zoom: mapCfg.zoom || 5,
        minZoom: 3,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile, // one-finger touch scrolls the page; pinch still zooms/pans
        zoomControl: true,
        attributionControl: true
      });
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: `${t("map.tilesAttribution")}: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>`
      }).addTo(map);
      tiles.on("tileload", () => { tilesOk++; });
      tiles.on("tileerror", () => { tilesBad++; if (tilesBad > 8 && tilesOk === 0) fail(); });
      map.on("click", () => { map.scrollWheelZoom.enable(); });
      layer = L.layerGroup().addTo(map);
      for (const p of partners) {
        const icon = L.divIcon({ className: "pin-wrap", html: '<div class="pin"><span class="pin__shape"></span></div>', iconSize: [36, 44], iconAnchor: [18, 44] });
        const m = L.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true, riseOnHover: true });
        m.on("click", () => select(p.id, { fromMap: true }));
        pins.set(p.id, m);
      }
      refreshMarkers();
      return map;
    } catch {
      return fail();
    }
  }
  function fail() {
    mapFailed = true;
    failEl.hidden = false;
    return null;
  }

  function refreshMarkers(visibleIds) {
    if (!map || !layer) return;
    layer.clearLayers();
    const ids = visibleIds ?? partners.map((p) => p.id);
    ids.forEach((id) => pins.get(id) && layer.addLayer(pins.get(id)));
  }

  function fitTo(visible) {
    if (!map) return;
    const L = window.L;
    if (state.user && visible.length) {
      const pts = [[state.user.lat, state.user.lng], ...visible.slice(0, 3).map((p) => [p.lat, p.lng])];
      map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 14 });
    } else if (visible.length === 1) map.setView([visible[0].lat, visible[0].lng], 14);
    else if (visible.length > 1) map.fitBounds(L.latLngBounds(visible.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 14 });
    else if (state.city) {
      const c = (mapCfg.cities || []).find((x) => x.id === state.city);
      if (c) map.setView([c.lat, c.lng], c.zoom || 11);
    } else map.setView(mapCfg.center || [48, 67], mapCfg.zoom || 5);
  }

  /* ---------- filtering ---------- */
  const haversine = (a, b) => {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  function apply({ fit = true, track: doTrack = false } = {}) {
    const q = norm(state.q).trim();
    let vis = partners.filter((p) => {
      if (state.type !== "all" && p.type !== state.type) return false;
      if (state.svc && !p.services.includes(state.svc)) return false;
      if (state.city && p.city !== state.city) return false;
      if (q && !norm(`${p.name} ${p.address} ${p.cityLabel} ${p.city}`).includes(q)) return false;
      return true;
    });
    if (state.user) {
      vis = vis.map((p) => ({ ...p, _d: haversine(state.user, p) })).sort((a, b) => a._d - b._d);
      vis.forEach((p) => list.appendChild(cards.get(p.id)));
    }
    const ids = new Set(vis.map((p) => p.id));
    cards.forEach((li, id) => { li.hidden = !ids.has(id); });
    countEl.textContent = t("map.results", { n: vis.length });
    countEl.hidden = partners.length === 0;
    const none = partners.length === 0;
    netEl.hidden = !none;
    emptyEl.hidden = none || vis.length > 0;
    refreshMarkers(vis.map((p) => p.id));
    if (fit) fitTo(vis);
    if (state.active && !ids.has(state.active)) closeSheet();
    if (doTrack) track("partner_map_search", { has_query: Boolean(q), query_length: q.length, city: state.city || undefined, type: state.type, service: state.svc || undefined, results: vis.length });
    return vis;
  }
  const applyDebounced = debounce(() => apply({ track: true }), 250);

  /* ---------- selection ---------- */
  function select(id, { fromMap = false } = {}) {
    const p = partners.find((x) => x.id === id);
    if (!p) return;
    state.active = id;
    cards.forEach((li, k) => li.classList.toggle("is-active", k === id));
    pins.forEach((m, k) => m.getElement()?.querySelector(".pin")?.classList.toggle("is-active", k === id));
    track("partner_marker_select", { partner_id: p.partnerId || p.id, source: fromMap ? "map" : "list" });
    if (map) map.setView([p.lat, p.lng], Math.max(map.getZoom(), 14), { animate: true });
    if (small()) openSheet(id);
    else if (fromMap) cards.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function openSheet(id) {
    const li = cards.get(id);
    if (!li) return;
    sheetBody.innerHTML = "";
    const clone = li.cloneNode(true);
    clone.removeAttribute("tabindex");
    clone.classList.remove("is-active");
    sheetBody.appendChild(clone);
    sheet.hidden = false;
  }
  function closeSheet() {
    sheet.hidden = true;
    state.active = null;
    cards.forEach((li) => li.classList.remove("is-active"));
    pins.forEach((m) => m.getElement()?.querySelector(".pin")?.classList.remove("is-active"));
  }
  $("[data-map-sheet-close]", root).addEventListener("click", closeSheet);
  cards.forEach((li, id) => {
    li.addEventListener("click", (e) => { if (!e.target.closest("a")) select(id); });
    li.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === li) { e.preventDefault(); select(id); } });
  });

  /* ---------- controls ---------- */
  $("[data-map-form]", root).addEventListener("submit", (e) => { e.preventDefault(); apply({ track: true }); });
  qEl.addEventListener("input", () => { state.q = qEl.value; applyDebounced(); });
  $$("[data-type]", root).forEach((b) =>
    b.addEventListener("click", () => {
      state.type = b.dataset.type;
      $$("[data-type]", root).forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", String(on)); });
      apply({ track: true });
    })
  );
  cityEl.addEventListener("change", () => { state.city = cityEl.value; apply({ track: true }); });
  svcEl.addEventListener("change", () => { state.svc = svcEl.value; apply({ track: true }); });
  $("[data-map-reset]", root)?.addEventListener("click", () => {
    Object.assign(state, { q: "", type: "all", svc: "", city: "", user: null });
    qEl.value = ""; cityEl.value = ""; svcEl.value = "";
    $$("[data-type]", root).forEach((x) => { const on = x.dataset.type === "all"; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", String(on)); });
    apply();
  });

  $("[data-map-locate]", root).addEventListener("click", () => {
    msgEl.hidden = true;
    if (!navigator.geolocation) { msgEl.textContent = t("map.locateDenied"); msgEl.hidden = false; return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (ensureMap() && window.L) {
          userMarker?.remove();
          userMarker = window.L.circleMarker([state.user.lat, state.user.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#237900", fillOpacity: 1 }).addTo(map);
        }
        msgEl.textContent = t("map.nearby");
        msgEl.hidden = false;
        apply();
      },
      () => { msgEl.textContent = t("map.locateDenied"); msgEl.hidden = false; },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 120000 }
    );
  });

  /* ---------- view switch (small screens) ---------- */
  function setView(v) {
    root.dataset.view = v;
    $$("[data-view-tab]", root).forEach((b) => { const on = b.dataset.viewTab === v; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    if (v === "map") {
      ensureMap();
      setTimeout(() => { map?.invalidateSize(); apply({ fit: true }); }, 80);
    }
  }
  $$("[data-view-tab]", root).forEach((b) => b.addEventListener("click", () => setView(b.dataset.viewTab)));

  /* ---------- analytics for contact / directions (also inside the cloned sheet) ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-track]");
    if (a) track(a.dataset.track, { partner_id: a.dataset.partnerId });
  });

  window.matchMedia("(min-width: 900px)").addEventListener("change", (m) => { if (m.matches) { ensureMap(); setTimeout(() => map?.invalidateSize(), 80); } });

  /* ---------- boot ---------- */
  const params = new URLSearchParams(location.search);
  if (params.get("q")) { state.q = params.get("q"); qEl.value = state.q; }
  if (params.get("city")) { state.city = params.get("city"); cityEl.value = state.city; }
  // typing a known city name in the home teaser should select that city
  const cityByName = (mapCfg.cities || []).find((c) => norm(t(`map.city.${c.id}`)) === norm(state.q).trim());
  if (cityByName) { state.city = cityByName.id; cityEl.value = cityByName.id; state.q = ""; qEl.value = ""; }

  if (!window.L) fail();
  if (!small()) ensureMap();
  apply({ fit: true });
  if (state.q || state.city) track("partner_map_search", { has_query: Boolean(state.q), query_length: state.q.length, city: state.city || undefined, source: "url" });
}
