/**
 * @fileoverview Single entry for the iconic landing page: smooth scroll + layout refresh + gallery scrub.
 *
 * ## Responsibilities (one of each for the whole page)
 *
 * - **Lenis** — one instance; `scroll` event forwards to `ScrollTrigger.update` so scrubbed values stay in sync.
 * - **gsap.ticker** — one `add` callback driving `lenis.raf`, matching the GSAP + Lenis integration pattern.
 * - **ResizeObserver** — observes `document.documentElement`; on size changes, coalesces to one rAF and calls
 *   `ScrollTrigger.refresh()` so `start` / `end` and pin positions stay correct after layout shifts.
 *
 * ## Gallery wiring
 *
 * Registers one scrub per id in `GALLERY_IDS`. Each id needs matching `data-gallery-id` on
 * `.gallery-viewport` and `.gallery-scroll-track`. With multiple fixed stages, use `hideViewportWhenTrackInactive`
 * and `viewportHideClearPastTopInsetPx` so viewports hide from trigger geometry (see factory JSDoc).
 *
 * ```js
 * import { GalleryScrollScrub } from './gallery-scrub-class.js';
 * const chapter = new GalleryScrollScrub({ galleryId: GALLERY_ID });
 * chapter.mount();
 * ```
 */

import { createGalleryScrollScrub } from "./gallery-scrub-factory.js";

/**
 * Each id must have matching `.gallery-viewport[data-gallery-id]` and
 * `.gallery-scroll-track[data-gallery-id]` in the document.
 *
 * With multiple fixed stages, `hideViewportWhenTrackInactive` plus `viewportHideClearPastTopInsetPx` keeps only
 * the chapter whose track still intersects the viewport visible, and hides once the track’s bottom clears past
 * the inset (see factory JSDoc).
 *
 * @type {readonly string[]}
 */
const GALLERY_IDS = ["1", "2"];

GALLERY_IDS.forEach((galleryId) => {
  createGalleryScrollScrub({
    galleryId,
    hideViewportWhenTrackInactive: true,
    viewportHideClearPastTopInsetPx: 100,
  });
});

/**
 * Watches layout-affecting size changes and refreshes ScrollTrigger once per frame at most.
 * DocumentElement is a stable box that reflects viewport / root layout changes well for full-page demos.
 *
 * @returns {() => void} Disconnect observer and orientation listener.
 */
function attachScrollTriggerLayoutRefresh() {
  const st = globalThis.ScrollTrigger;
  if (!st) {
    throw new Error("[main] ScrollTrigger missing; load ScrollTrigger before main.js");
  }

  let frameQueued = false;

  const scheduleRefresh = () => {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => {
      frameQueued = false;
      st.refresh();
    });
  };

  const ro = new ResizeObserver(scheduleRefresh);
  ro.observe(document.documentElement);
  globalThis.addEventListener("orientationchange", scheduleRefresh);

  return () => {
    ro.disconnect();
    globalThis.removeEventListener("orientationchange", scheduleRefresh);
  };
}

attachScrollTriggerLayoutRefresh();

const LenisCtor = globalThis.Lenis;
if (!LenisCtor) {
  throw new Error("[main] Lenis missing; load lenis.min.js before main.js");
}

const lenis = new LenisCtor();
lenis.on("scroll", globalThis.ScrollTrigger.update);

globalThis.gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
globalThis.gsap.ticker.lagSmoothing(0);
