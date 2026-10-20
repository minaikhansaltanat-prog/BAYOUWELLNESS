import { animate } from "motion/mini";
import { inView, scroll } from "motion";
import { $, $$, reducedMotion } from "./core.js";

const EASE = [0.16, 1, 0.3, 1];

/* One authored moment: the hero stage assembles itself. Everything else reveals once. */
export function initMotion() {
  clearTimeout(window.__bayouFallback);
  const reduce = reducedMotion();

  // ---- hero entrance ----
  const hero = $("[data-hero]");
  if (hero && !reduce) {
    const items = $$("[data-hero-item]", hero);
    const copy = items.filter((el) => el.closest(".hero__copy"));
    const stage = items.filter((el) => !el.closest(".hero__copy"));
    const run = (els, delay0, y) =>
      els.map((el, i) =>
        animate(el, { opacity: [0, 1], transform: [`translateY(${y}px)`, "translateY(0px)"] }, { duration: 1.1, delay: delay0 + i * 0.09, ease: EASE })
      );
    const a = run(copy, 0.05, 28);
    const b = run(stage, 0.2, 40);
    const parallaxAfter = Promise.all([...a, ...b].map((x) => x.finished ?? x)).catch(() => {});
    parallaxAfter.then(() => initParallax(hero));
  } else {
    $$("[data-hero-item]").forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
  }

  // ---- reveals (cards lift, category tiles settle) ----
  const reveals = $$("[data-reveal]");
  if (reveals.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const groups = new Map();
      reveals.forEach((el) => {
        const p = el.parentElement;
        const i = groups.get(p) ?? 0;
        groups.set(p, i + 1);
        el.style.setProperty("--d", `${Math.min(i, 5) * 0.08}s`);
      });
      inView(reveals, (el) => { el.classList.add("is-in"); }, { margin: "0px 0px -8% 0px", amount: 0.12 });
    }
  }

  // ---- story image drift (desktop only) ----
  const story = $("[data-story]");
  if (story && !reduce && matchMedia("(min-width: 900px) and (hover: hover)").matches) {
    const img = $(".choose__img", story);
    if (img) scroll(animate(img, { transform: ["translateY(-5%) scale(1.1)", "translateY(5%) scale(1.1)"] }, { ease: "linear" }), { target: story, offset: ["start end", "end start"] });
  }
}

function initParallax(hero) {
  if (reducedMotion() || !matchMedia("(min-width: 900px) and (hover: hover)").matches) return;
  $$("[data-parallax]", hero).forEach((el) => {
    const amt = Number(el.dataset.parallax) || 0;
    scroll(animate(el, { transform: ["translateY(0px)", `translateY(${amt * 3}px)`] }, { ease: "linear" }), { target: hero, offset: ["start start", "end start"] });
  });
}
