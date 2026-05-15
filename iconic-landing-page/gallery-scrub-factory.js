/**
 * Scrubbed gallery motion: one `ScrollTrigger` maps `progress` (0→1) to inline transforms on a cached grid.
 * Layering, Lenis, and the scroll “ruler” vs fixed stage are documented in `ANIMATION.md`.
 *
 * Core math (same intent as `script.js` reference — values tunable via `createGalleryScrollScrub` / `computeGalleryScrubTransforms`):
 *
 *   maxScale     = innerWidth < 900 ? 4 : 2.65
 *   scale        = 1 + progress * maxScale          // grid: translate(-50%,-50%) scale(scale)
 *   yTranslate   = progress * 300                   // side columns: translateY(yTranslate)
 *   mainImgScale = 2 - progress * 0.85              // hero img: scale(...); 0.85 === (mainImgScaleStart − mainImgScaleEnd) i.e. 2 − 1.15
 *
 * This module adds: resolve DOM once per chapter (`galleryId` / selectors), optional fixed-viewport visibility
 * when multiple chapters stack, and GSAP registration from `globalThis` for the ES module entry.
 */

// =============================================================================
// GSAP plugin (must run after gsap + ScrollTrigger script tags in HTML)
// =============================================================================

const gsapFromWindow = globalThis.gsap;
const scrollTriggerFromWindow = globalThis.ScrollTrigger;

if (!gsapFromWindow || !scrollTriggerFromWindow) {
  throw new Error(
    "[gallery-scrub-factory] Load gsap.min.js and ScrollTrigger.min.js before the type=module entry (index.html)."
  );
}

gsapFromWindow.registerPlugin(scrollTriggerFromWindow);

// =============================================================================
// Public — math (pure, easy to test or reuse)
// =============================================================================

/**
 * Responsive zoom cap: stronger on narrow screens (original demo values).
 *
 * @param {number} viewportWidthPx
 * @returns {number} Added to base scale as `1 + progress * maxScale` at full progress.
 */
export function defaultGetMaxScale(viewportWidthPx) {
  return viewportWidthPx < 900 ? 4 : 2.65;
}

/**
 * Maps ScrollTrigger progress and viewport width to the three transform channels (see ANIMATION.md).
 *
 * @param {number} scrollProgress01 - `self.progress`, in [0, 1].
 * @param {number} viewportWidthPx - Usually `window.innerWidth`.
 * @param {object} [motionOverrides]
 * @param {(w: number) => number} [motionOverrides.getMaxScale]
 * @param {number} [motionOverrides.sideTranslateMaxPx=300]
 * @param {number} [motionOverrides.mainImgScaleStart=2]
 * @param {number} [motionOverrides.mainImgScaleEnd=1.15]
 * @returns {{ maxScale: number, scale: number, yTranslate: number, mainImgScale: number }}
 */
export function computeGalleryScrubTransforms(scrollProgress01, viewportWidthPx, motionOverrides = {}) {
  const getMaxScale = motionOverrides.getMaxScale ?? defaultGetMaxScale;
  const sideTranslateMaxPx = motionOverrides.sideTranslateMaxPx ?? 300;
  const mainImgScaleStart = motionOverrides.mainImgScaleStart ?? 2;
  const mainImgScaleEnd = motionOverrides.mainImgScaleEnd ?? 1.15;

  const maxScale = getMaxScale(viewportWidthPx);
  const scale = 1 + scrollProgress01 * maxScale;
  const yTranslate = scrollProgress01 * sideTranslateMaxPx;
  const mainImgDelta = mainImgScaleStart - mainImgScaleEnd;
  const mainImgScale = mainImgScaleStart - scrollProgress01 * mainImgDelta;

  return { maxScale, scale, yTranslate, mainImgScale };
}

// =============================================================================
// Private — write transforms to the cached column / hero nodes
// =============================================================================

/**
 * @param {{ gridRoot: HTMLElement, sideColumns: NodeListOf<HTMLElement>, mainHeroImg: HTMLElement }} transformTargets
 * @param {{ scale: number, yTranslate: number, mainImgScale: number }} computedMotion
 */
function writeGalleryScrubTransformsToDom(transformTargets, computedMotion) {
  const { gridRoot, sideColumns, mainHeroImg } = transformTargets;
  const { scale, yTranslate, mainImgScale } = computedMotion;

  gridRoot.style.transform = `translate(-50%, -50%) scale(${scale})`;
  sideColumns.forEach((columnElement) => {
    columnElement.style.transform = `translateY(${yTranslate}px)`;
  });
  mainHeroImg.style.transform = `scale(${mainImgScale})`;
}

// =============================================================================
// Private — resolve elements from config / gallery id
// =============================================================================

/**
 * @param {Element|string} selectorOrElement
 * @returns {HTMLElement}
 */
function getHTMLElementFromSelectorOrElement(selectorOrElement) {
  if (typeof selectorOrElement === "string") {
    const found = document.querySelector(selectorOrElement);
    if (!found) {
      throw new Error(`[gallery-scrub-factory] No element for selector: ${selectorOrElement}`);
    }
    return /** @type {HTMLElement} */ (found);
  }
  if (selectorOrElement instanceof HTMLElement) return selectorOrElement;
  throw new Error("[gallery-scrub-factory] Expected HTMLElement or selector string");
}

/**
 * @param {string|number} galleryId
 * @returns {string} Safe for use inside `[data-gallery-id="…"]`
 */
function escapeGalleryIdForCssAttribute(galleryId) {
  const asString = String(galleryId);
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(asString);
  }
  return asString.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Finds the in-flow scroll track, the fixed grid root, and the clipping viewport for one chapter.
 *
 * @param {object} chapterConfig
 * @param {string|number} [chapterConfig.galleryId]
 * @param {Element|string} [chapterConfig.trigger]
 * @param {Element|string} [chapterConfig.gridRoot]
 * @param {Element|string|null} [chapterConfig.viewportFrame]
 * @returns {{ scrollTrackElement: HTMLElement, gridRootElement: HTMLElement, viewportClipElement: HTMLElement|null }}
 */
function findChapterElementsFromConfig(chapterConfig) {
  const { galleryId, trigger, gridRoot, viewportFrame } = chapterConfig;

  if (galleryId != null && String(galleryId).length > 0) {
    const escapedId = escapeGalleryIdForCssAttribute(galleryId);
    const scrollTrackSelector = `.gallery-scroll-track[data-gallery-id="${escapedId}"]`;
    const viewportSelector = `.gallery-viewport[data-gallery-id="${escapedId}"]`;
    const gridUnderViewportSelector = `${viewportSelector} .gallery-grid`;

    const scrollTrackElement = getHTMLElementFromSelectorOrElement(trigger ?? scrollTrackSelector);
    const gridRootElement = getHTMLElementFromSelectorOrElement(gridRoot ?? gridUnderViewportSelector);

    let viewportClipElement = null;
    if (viewportFrame != null && viewportFrame !== "auto") {
      viewportClipElement = getHTMLElementFromSelectorOrElement(viewportFrame);
    } else {
      viewportClipElement = gridRootElement.closest(".gallery-viewport");
    }

    return { scrollTrackElement, gridRootElement, viewportClipElement };
  }

  if (trigger == null || gridRoot == null) {
    throw new Error("[gallery-scrub-factory] Set `galleryId`, or both `trigger` and `gridRoot`.");
  }

  const scrollTrackElement = getHTMLElementFromSelectorOrElement(trigger);
  const gridRootElement = getHTMLElementFromSelectorOrElement(gridRoot);

  let viewportClipElement = null;
  if (viewportFrame != null && viewportFrame !== "auto") {
    viewportClipElement = getHTMLElementFromSelectorOrElement(viewportFrame);
  }

  return { scrollTrackElement, gridRootElement, viewportClipElement };
}

// =============================================================================
// Private — fixed viewport visibility (stacking + “track has left the screen”)
// =============================================================================

/**
 * When `useBoundingRectVisibility` is true, show the fixed viewport only while the scroll track still crosses
 * the window vertically and its bottom edge is below `clearPastTopInsetPx` (viewport coordinates).
 *
 * @param {object} args
 * @param {HTMLElement|null} args.fixedViewportToShowOrHide
 * @param {HTMLElement} args.scrollTrackTriggerElement
 * @param {boolean} args.useBoundingRectVisibility
 * @param {number} args.clearPastTopInsetPx
 */
function applyGeometryBasedViewportVisibility(args) {
  const { fixedViewportToShowOrHide, scrollTrackTriggerElement, useBoundingRectVisibility, clearPastTopInsetPx } =
    args;

  if (!fixedViewportToShowOrHide || !useBoundingRectVisibility) return;

  const trackRect = scrollTrackTriggerElement.getBoundingClientRect();
  const viewportHeightPx = window.innerHeight;
  const trackStillCrossesWindowVertically = trackRect.top < viewportHeightPx;
  const trackBottomStillBelowTopInset = trackRect.bottom > clearPastTopInsetPx;
  const shouldShowFixedViewport = trackStillCrossesWindowVertically && trackBottomStillBelowTopInset;

  fixedViewportToShowOrHide.style.visibility = shouldShowFixedViewport ? "visible" : "hidden";
}

// =============================================================================
// Public — factory (one ScrollTrigger per call)
// =============================================================================

/**
 * Registers one scrubbed gallery: caches DOM once, updates transforms on scroll, optionally toggles viewport visibility.
 *
 * **Config fields**
 *
 * - `galleryId` (optional) — Selects `.gallery-scroll-track[data-gallery-id]` and `.gallery-viewport … .gallery-grid`
 *   unless `trigger` / `gridRoot` override.
 * - `trigger`, `gridRoot` — Explicit elements or selectors if you skip `galleryId`.
 * - `sideColumnSelector`, `mainHeroImgSelector` — Queries under `gridRoot` (defaults match iconic markup).
 * - `scrub`, `start`, `end` — Passed to `ScrollTrigger.create`.
 * - `getMaxScale`, `sideTranslateMaxPx`, `mainImgScaleStart`, `mainImgScaleEnd` — Motion overrides.
 * - `viewportFrame` — Optional clip frame; else `gridRoot.closest('.gallery-viewport')`.
 * - `hideViewportWhenTrackInactive` — When true, drive `visibility` on that viewport so fixed chapters do not stack.
 * - `viewportHideClearPastTopInsetPx` — When this is a finite number **and** `hideViewportWhenTrackInactive`, use
 *   bounding-rect visibility every `onUpdate` (and `onRefresh`); when `null`, use `onToggle` + `isActive` only.
 * - `scrollTrigger` — Extra options for `ScrollTrigger.create` (merged; your `onRefresh` runs after ours).
 *
 * @param {object} chapterConfig
 * @returns {{ destroy: () => void, scrollTrigger: object }}
 */
export function createGalleryScrollScrub(chapterConfig) {
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
    scrollTrigger: extraScrollTriggerOptions = {},
  } = chapterConfig;

  const { scrollTrackElement, gridRootElement, viewportClipElement } =
    findChapterElementsFromConfig(chapterConfig);

  const sideColumnNodeList = gridRootElement.querySelectorAll(sideColumnSelector);
  const mainHeroImageElement = gridRootElement.querySelector(mainHeroImgSelector);
  if (!mainHeroImageElement) {
    throw new Error(
      `[gallery-scrub-factory] Missing hero image for selector "${mainHeroImgSelector}" under the grid.`
    );
  }

  const transformTargets = {
    gridRoot: gridRootElement,
    sideColumns: /** @type {NodeListOf<HTMLElement>} */ (sideColumnNodeList),
    mainHeroImg: /** @type {HTMLElement} */ (mainHeroImageElement),
  };

  const motionOptionsForCompute = {
    getMaxScale,
    sideTranslateMaxPx,
    mainImgScaleStart,
    mainImgScaleEnd,
  };

  const fixedViewportElementForVisibility =
    hideViewportWhenTrackInactive && viewportClipElement ? viewportClipElement : null;

  const shouldUseBoundingRectForVisibility =
    Boolean(fixedViewportElementForVisibility) &&
    typeof viewportHideClearPastTopInsetPx === "number" &&
    Number.isFinite(viewportHideClearPastTopInsetPx);

  const visibilityInsetPx = shouldUseBoundingRectForVisibility ? viewportHideClearPastTopInsetPx : 0;

  function syncViewportVisibilityForThisChapter() {
    applyGeometryBasedViewportVisibility({
      fixedViewportToShowOrHide: fixedViewportElementForVisibility,
      scrollTrackTriggerElement: scrollTrackElement,
      useBoundingRectVisibility: shouldUseBoundingRectForVisibility,
      clearPastTopInsetPx: visibilityInsetPx,
    });
  }

  const { onRefresh: userProvidedOnRefresh, ...scrollTriggerOptionsWithoutOnRefresh } = extraScrollTriggerOptions;

  const scrollTriggerInstance = scrollTriggerFromWindow.create({
    trigger: scrollTrackElement,
    start,
    end,
    scrub,
    ...scrollTriggerOptionsWithoutOnRefresh,
    onUpdate(scrollTriggerSelf) {
      const scrollProgress01 = scrollTriggerSelf.progress;
      const viewportWidthPx = window.innerWidth;
      const computedMotion = computeGalleryScrubTransforms(
        scrollProgress01,
        viewportWidthPx,
        motionOptionsForCompute
      );
      writeGalleryScrubTransformsToDom(transformTargets, computedMotion);
      syncViewportVisibilityForThisChapter();
    },
    onToggle(scrollTriggerSelf) {
      if (fixedViewportElementForVisibility && !shouldUseBoundingRectForVisibility) {
        fixedViewportElementForVisibility.style.visibility = scrollTriggerSelf.isActive ? "visible" : "hidden";
      }
    },
    onRefresh(scrollTriggerSelf) {
      syncViewportVisibilityForThisChapter();
      if (typeof userProvidedOnRefresh === "function") {
        userProvidedOnRefresh(scrollTriggerSelf);
      }
    },
  });

  requestAnimationFrame(() => {
    syncViewportVisibilityForThisChapter();
  });

  return {
    scrollTrigger: scrollTriggerInstance,
    destroy() {
      scrollTriggerInstance.kill();
    },
  };
}
