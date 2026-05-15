/**
 * @fileoverview Page shell: Lenis + ScrollTrigger.refresh + one factory call per gallery chapter.
 *
 * Execution order (read top → bottom):
 * 1. Layout refresh — ResizeObserver + orientation → coalesced `ScrollTrigger.refresh()`.
 * 2. Gallery chapters — each `data-gallery-id` registered via `gallery-scrub-factory-refactor.js`.
 * 3. Smooth scroll — one Lenis instance, ticker → `lenis.raf`, scroll → `ScrollTrigger.update`.
 */

import { createGalleryScrollScrub } from "./gallery-scrub-factory-refactor.js";

// -----------------------------------------------------------------------------
// 1. ScrollTrigger stays correct when the root layout size changes
// -----------------------------------------------------------------------------

/**
 * @returns {() => void} Call to disconnect the observer and remove listeners.
 */
function attachCoalescedScrollTriggerRefreshOnLayoutChange() {
  const scrollTrigger = globalThis.ScrollTrigger;
  if (!scrollTrigger) {
    throw new Error("[main] Load ScrollTrigger before main.js.");
  }

  let refreshAlreadyQueued = false;

  const queueSingleRefreshOnNextFrame = () => {
    if (refreshAlreadyQueued) return;
    refreshAlreadyQueued = true;
    requestAnimationFrame(() => {
      refreshAlreadyQueued = false;
      scrollTrigger.refresh();
    });
  };

  const resizeObserver = new ResizeObserver(queueSingleRefreshOnNextFrame);
  resizeObserver.observe(document.documentElement);
  globalThis.addEventListener("orientationchange", queueSingleRefreshOnNextFrame);

  return () => {
    resizeObserver.disconnect();
    globalThis.removeEventListener("orientationchange", queueSingleRefreshOnNextFrame);
  };
}

attachCoalescedScrollTriggerRefreshOnLayoutChange();

// -----------------------------------------------------------------------------
// 2. Gallery scrub chapters (must match `data-gallery-id` in index.html)
// -----------------------------------------------------------------------------

/** @type {readonly string[]} */
const GALLERY_CHAPTER_IDS = ["1", "2"];

const SHARED_GALLERY_SCRUB_OPTIONS = Object.freeze({
  hideViewportWhenTrackInactive: true,
  viewportHideClearPastTopInsetPx: 100,
});

/** @type {Readonly<Record<string, 1 | -1>>} */
const SIDE_TRANSLATE_DIRECTION_BY_GALLERY = Object.freeze({
  "1": 1,
  "2": -1,
});

for (const galleryChapterId of GALLERY_CHAPTER_IDS) {
  createGalleryScrollScrub({
    galleryId: galleryChapterId,
    sideTranslateDirection: SIDE_TRANSLATE_DIRECTION_BY_GALLERY[galleryChapterId] ?? 1,
    ...SHARED_GALLERY_SCRUB_OPTIONS,
  });
}

// -----------------------------------------------------------------------------
// 3. Lenis smooth scrolling (one instance for the whole page)
// -----------------------------------------------------------------------------

const LenisConstructor = globalThis.Lenis;
if (!LenisConstructor) {
  throw new Error("[main] Load lenis.min.js before main.js.");
}

const lenisSmoothScroll = new LenisConstructor();
lenisSmoothScroll.on("scroll", globalThis.ScrollTrigger.update);

globalThis.gsap.ticker.add((timeSeconds) => {
  lenisSmoothScroll.raf(timeSeconds * 1000);
});
globalThis.gsap.ticker.lagSmoothing(0);
