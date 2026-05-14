/**
 * @fileoverview Factory API for a scroll-scrubbed image gallery driven by GSAP ScrollTrigger.
 *
 * ## How it fits together
 *
 * - A **fixed** grid (`.gallery-grid`) sits in a **viewport frame** (`.gallery-viewport`) that clips overflow.
 * - An in-flow **scroll track** section (`.gallery-scroll-track`) does not contain the grid in the DOM; it only
 *   defines **how much vertical scroll** maps to ScrollTrigger `progress` from 0 → 1 (see ANIMATION.md).
 * - Lenis (configured once on the page) calls `ScrollTrigger.update` on scroll; this module only registers
 *   `ScrollTrigger.create` instances.
 *
 * ## Performance
 *
 * All DOM nodes used in `onUpdate` are resolved **once** when `createGalleryScrollScrub` runs. Each scroll tick
 * only runs math and assigns `transform` on those cached elements.
 *
 * ## Pairing multiple galleries
 *
 * Use the same `data-gallery-id` on the viewport block and its matching scroll track. Pass `galleryId` in
 * config (or explicit `trigger` / `gridRoot` selectors). Optional **`viewportHideClearPastTopInsetPx`** (with
 * **`hideViewportWhenTrackInactive`**) drives viewport `visibility` from the trigger’s bounding rect each
 * `onUpdate` so the fixed stage does not linger past the perceived end of the chapter.
 */

const gsapGlobal = globalThis.gsap;
const ScrollTriggerApi = globalThis.ScrollTrigger;

if (!gsapGlobal || !ScrollTriggerApi) {
  throw new Error(
    "[gallery-scrub-factory] Load gsap.min.js and ScrollTrigger.min.js before type=module entry (see index.html)."
  );
}

gsapGlobal.registerPlugin(ScrollTriggerApi);

/**
 * Default breakpoint for stronger zoom on narrow viewports (matches original demo).
 *
 * @param {number} screenWidth - Typically `window.innerWidth`.
 * @returns {number} Upper bound multiplier for gallery scale at progress === 1 (before the `1 + progress * maxScale` term).
 */
export function defaultGetMaxScale(screenWidth) {
  return screenWidth < 900 ? 4 : 2.65;
}

/**
 * Pure math: maps normalized scroll progress and viewport width to transform inputs.
 * Variable names match ANIMATION.md (`maxScale`, `scale`, `yTranslate`, `mainImgScale`).
 *
 * @param {number} progress - ScrollTrigger `self.progress`, in the range [0, 1].
 * @param {number} screenWidth - Used with `getMaxScale` for responsive zoom cap.
 * @param {GalleryScrubComputeOptions} [options] - Optional overrides for motion extents.
 * @returns {GalleryScrubTransformState}
 */
export function computeGalleryScrubTransforms(progress, screenWidth, options = {}) {
  const getMaxScale = options.getMaxScale ?? defaultGetMaxScale;
  const sideTranslateMaxPx = options.sideTranslateMaxPx ?? 300;
  const mainImgScaleStart = options.mainImgScaleStart ?? 2;
  const mainImgScaleEnd = options.mainImgScaleEnd ?? 1.15;

  const maxScale = getMaxScale(screenWidth);
  const scale = 1 + progress * maxScale;
  const yTranslate = progress * sideTranslateMaxPx;
  const mainImgDelta = mainImgScaleStart - mainImgScaleEnd;
  const mainImgScale = mainImgScaleStart - progress * mainImgDelta;

  return { maxScale, scale, yTranslate, mainImgScale };
}

/**
 * @typedef {Object} GalleryScrubComputeOptions
 * @property {(screenWidth: number) => number} [getMaxScale]
 * @property {number} [sideTranslateMaxPx]
 * @property {number} [mainImgScaleStart]
 * @property {number} [mainImgScaleEnd]
 */

/**
 * @typedef {Object} GalleryScrubTransformState
 * @property {number} maxScale
 * @property {number} scale
 * @property {number} yTranslate
 * @property {number} mainImgScale
 */

/**
 * @typedef {Object} GalleryScrubRefs
 * @property {HTMLElement} gridRoot
 * @property {NodeListOf<HTMLElement>} sideColumns
 * @property {HTMLElement} mainHeroImg
 */

/**
 * @typedef {Object} GalleryScrollScrubConfig
 * @property {string|number} [galleryId] - When set, selects `.gallery-scroll-track[data-gallery-id]` and
 *   `.gallery-viewport[data-gallery-id] .gallery-grid` unless `trigger` / `gridRoot` override them.
 * @property {Element|string} [trigger] - ScrollTrigger `trigger` element (in-flow scroll ruler).
 * @property {Element|string} [gridRoot] - Fixed grid whose `transform` includes centering translate + scale.
 * @property {string} [sideColumnSelector='.gallery-col:not(.gallery-col--main)'] - Query relative to `gridRoot`.
 * @property {string} [mainHeroImgSelector='.gallery-tile--hero img'] - Center column hero image; relative to `gridRoot`.
 * @property {number} [scrub=1] - ScrollTrigger scrub lag (see GSAP docs).
 * @property {string} [start='top bottom'] - ScrollTrigger start string.
 * @property {string} [end='bottom bottom'] - ScrollTrigger end string.
 * @property {(w: number) => number} [getMaxScale]
 * @property {number} [sideTranslateMaxPx=300]
 * @property {number} [mainImgScaleStart=2]
 * @property {number} [mainImgScaleEnd=1.15]
 * @property {Element|string|null} [viewportFrame] - Optional clipping frame; used when `hideViewportWhenTrackInactive` is true.
 *   If omitted, `gridRoot.closest('.gallery-viewport')` is used when hiding is enabled.
 * @property {boolean} [hideViewportWhenTrackInactive=false] - When true, toggles `visibility` on the viewport so multiple
 *   fixed galleries do not stack. How visibility is computed depends on `viewportHideClearPastTopInsetPx` (see below).
 * @property {number|null} [viewportHideClearPastTopInsetPx=null] - When `hideViewportWhenTrackInactive` is true **and**
 *   this is a finite number (e.g. `100`), visibility is updated every `onUpdate` from the trigger’s layout box:
 *   **show** while `getBoundingClientRect().bottom > inset` **and** the trigger still intersects the viewport vertically
 *   (`rect.top < window.innerHeight`). **Hide** once the bottom edge has scrolled to or above that Y offset from the
 *   viewport top (0 = flush with top edge). This avoids a brief wrong frame when `onToggle` / `isActive` and perceived
 *   “track has left the screen” disagree (e.g. Lenis + scrub). When `null`, visibility uses **`onToggle` + `isActive`** only.
 * @property {Object} [scrollTrigger] - Additional options passed to `ScrollTrigger.create` (e.g. `onEnter`, `markers`).
 */

/**
 * @param {GalleryScrubRefs} refs
 * @param {GalleryScrubTransformState} state
 */
function applyGalleryScrubTransforms(refs, state) {
  const { gridRoot, sideColumns, mainHeroImg } = refs;
  const { scale, yTranslate, mainImgScale } = state;

  gridRoot.style.transform = `translate(-50%, -50%) scale(${scale})`;
  sideColumns.forEach((col) => {
    col.style.transform = `translateY(${yTranslate}px)`;
  });
  mainHeroImg.style.transform = `scale(${mainImgScale})`;
}

/**
 * @param {Element|string} target
 * @returns {HTMLElement}
 */
function resolveElement(target) {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`[gallery-scrub-factory] No element matching selector: ${target}`);
    }
    return /** @type {HTMLElement} */ (el);
  }
  if (target instanceof HTMLElement) return target;
  throw new Error("[gallery-scrub-factory] Expected HTMLElement or selector string");
}

/**
 * Builds selector-safe attribute fragment for `[data-gallery-id="…"]`.
 *
 * @param {string|number} galleryId
 * @returns {string}
 */
function galleryIdAttrSelector(galleryId) {
  const id = String(galleryId);
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Resolves `trigger`, `gridRoot`, and optional `viewportFrame` from `galleryId` and/or explicit elements.
 *
 * @param {GalleryScrollScrubConfig} config
 * @returns {{ triggerEl: HTMLElement, gridRootEl: HTMLElement, viewportFrameEl: HTMLElement|null }}
 */
function resolveGalleryElements(config) {
  const { galleryId, trigger, gridRoot, viewportFrame } = config;

  if (galleryId != null && String(galleryId).length > 0) {
    const idSel = galleryIdAttrSelector(galleryId);
    const triggerSelector = `.gallery-scroll-track[data-gallery-id="${idSel}"]`;
    const viewportSelector = `.gallery-viewport[data-gallery-id="${idSel}"]`;
    const gridSelector = `${viewportSelector} .gallery-grid`;

    const triggerEl = resolveElement(trigger ?? triggerSelector);
    const gridRootEl = resolveElement(gridRoot ?? gridSelector);

    let viewportFrameEl = null;
    if (viewportFrame != null && viewportFrame !== "auto") {
      viewportFrameEl = resolveElement(viewportFrame);
    } else {
      viewportFrameEl = gridRootEl.closest(".gallery-viewport");
    }

    return { triggerEl, gridRootEl, viewportFrameEl };
  }

  if (trigger == null || gridRoot == null) {
    throw new Error(
      "[gallery-scrub-factory] Provide `galleryId`, or both `trigger` and `gridRoot`"
    );
  }

  const triggerEl = resolveElement(trigger);
  const gridRootEl = resolveElement(gridRoot);

  let viewportFrameEl = null;
  if (viewportFrame != null && viewportFrame !== "auto") {
    viewportFrameEl = resolveElement(viewportFrame);
  }

  return { triggerEl, gridRootEl, viewportFrameEl };
}

/**
 * Creates one scrubbed gallery ScrollTrigger instance: caches DOM, wires `onUpdate` + optional viewport visibility
 * (`onToggle` and/or geometry from `viewportHideClearPastTopInsetPx`).
 *
 * @param {GalleryScrollScrubConfig} config
 * @returns {{ destroy: () => void, scrollTrigger: object }} scrollTrigger is the GSAP ScrollTrigger instance
 */
export function createGalleryScrollScrub(config) {
  const {
    sideColumnSelector = ".gallery-col:not(.gallery-col--main)",
    mainHeroImgSelector = ".gallery-tile--hero img",
    scrub = 1,
    start = "top bottom",
    end = "bottom bottom",
    getMaxScale = defaultGetMaxScale,
    sideTranslateMaxPx = 300,
    mainImgScaleStart = 2,
    mainImgScaleEnd = 1.15,
    hideViewportWhenTrackInactive = false,
    viewportHideClearPastTopInsetPx = null,
    scrollTrigger: scrollTriggerExtras = {},
  } = config;

  const { triggerEl, gridRootEl, viewportFrameEl } = resolveGalleryElements(config);

  const sideColumns = gridRootEl.querySelectorAll(sideColumnSelector);
  const mainHeroImg = gridRootEl.querySelector(mainHeroImgSelector);
  if (!mainHeroImg) {
    throw new Error(
      `[gallery-scrub-factory] Missing hero img for selector "${mainHeroImgSelector}" under grid`
    );
  }

  /** @type {GalleryScrubRefs} */
  const refs = {
    gridRoot: gridRootEl,
    sideColumns: /** @type {NodeListOf<HTMLElement>} */ (sideColumns),
    mainHeroImg: /** @type {HTMLElement} */ (mainHeroImg),
  };

  const computeOpts = {
    getMaxScale,
    sideTranslateMaxPx,
    mainImgScaleStart,
    mainImgScaleEnd,
  };

  const viewportForVisibility =
    hideViewportWhenTrackInactive && viewportFrameEl ? viewportFrameEl : null;

  const useGeometryVisibility =
    Boolean(viewportForVisibility) &&
    typeof viewportHideClearPastTopInsetPx === "number" &&
    Number.isFinite(viewportHideClearPastTopInsetPx);

  const pastTopInsetPx = useGeometryVisibility ? viewportHideClearPastTopInsetPx : 0;

  /**
   * Keeps the fixed gallery clipped to moments when the in-flow track still “owns” the vertical band
   * of the viewport, and hides once the track’s bottom edge clears past `pastTopInsetPx` from the top.
   */
  function syncViewportVisibilityFromTriggerGeometry() {
    if (!viewportForVisibility || !useGeometryVisibility) return;
    const r = triggerEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const intersectsViewportVertically = r.top < vh;
    const trackBottomBelowInset = r.bottom > pastTopInsetPx;
    const show = intersectsViewportVertically && trackBottomBelowInset;
    viewportForVisibility.style.visibility = show ? "visible" : "hidden";
  }

  const { onRefresh: userOnRefresh, ...restScrollTrigger } = scrollTriggerExtras;

  const st = ScrollTriggerApi.create({
    trigger: triggerEl,
    start,
    end,
    scrub,
    ...restScrollTrigger,
    onUpdate(self) {
      const progress = self.progress;
      const screenWidth = window.innerWidth;
      const state = computeGalleryScrubTransforms(progress, screenWidth, computeOpts);
      applyGalleryScrubTransforms(refs, state);
      syncViewportVisibilityFromTriggerGeometry();
    },
    onToggle(self) {
      if (viewportForVisibility && !useGeometryVisibility) {
        viewportForVisibility.style.visibility = self.isActive ? "visible" : "hidden";
      }
    },
    onRefresh(self) {
      syncViewportVisibilityFromTriggerGeometry();
      if (typeof userOnRefresh === "function") {
        userOnRefresh(self);
      }
    },
  });

  requestAnimationFrame(() => {
    syncViewportVisibilityFromTriggerGeometry();
  });

  return {
    scrollTrigger: st,
    destroy() {
      st.kill();
    },
  };
}
