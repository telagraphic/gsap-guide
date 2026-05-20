/**
 * Scroll-scrubbed gallery: one ScrollTrigger maps progress → transforms on cached nodes.
 *
 * Config (passed to createGalleryScrollScrub):
 *   galleryId               — IDs `.gallery-scroll-track` + `.gallery-viewport` markup (see index.html).
 *   scrub / start / end     — forwarded to ScrollTrigger.create.
 *   sideColumnSelector, mainHeroImgSelector — queried under `.gallery-grid` (defaults match iconic markup).
 *   sideTranslateDirection  — 1 or -1; multiplier for side-column translateY (default 1 = downward).
 *   sideTranslateMaxPx, mainImgScaleStart, mainImgScaleEnd — motion amounts.
 *   getMaxScale(viewportWidth) — override breakpoint zoom cap (default: under 900px width → 4, else 2.65).
 *   hideViewportWhenTrackInactive — toggle `.gallery-viewport` visibility when multiple fixed chapters stack.
 *   viewportHideClearPastTopInsetPx — if a finite number, use geometry each frame; if null but hide flag is true, use ScrollTrigger.onToggle only.
 *
 * Loads after gsap + ScrollTrigger (see index.html).
 */

const gsapFromWindow = globalThis.gsap;
const scrollTriggerPlugin = globalThis.ScrollTrigger;

if (!gsapFromWindow || !scrollTriggerPlugin) {
  throw new Error(
    "[gallery-scrub-factory-refactor] Load gsap.min.js and ScrollTrigger.min.js before this module.",
  );
}

gsapFromWindow.registerPlugin(scrollTriggerPlugin);

/** 
 * Returns the default maximum scale for the gallery.
 * 
 * @param {number} viewportWidthPx
 * @returns {number}
 * */
function defaultGetMaxScale(viewportWidthPx) {
  return viewportWidthPx < 900 ? 4 : 2.65;
}

/**
 * Rename to something simpler like `resolveGalleryElements`.
 * Finds the scroll track, grid root, and viewport for a gallery chapter.
 * What is the track, viewport in the DOM? Should rename to be simpler and clearer.
 * @param {string | number} galleryId
 * @returns {{ scrollTrack: HTMLElement, gridRoot: HTMLElement, viewport: HTMLElement }}
 */
function resolveChapterElements(galleryId) {
  const id = String(galleryId);
  const scrollTrack = document.querySelector(`.gallery-scroll-track[data-gallery-id="${id}"]`);
  const gridRoot = document.querySelector(`.gallery-viewport[data-gallery-id="${id}"] .gallery-grid`);

  if (!scrollTrack) {
    throw new Error(`[gallery-scrub-factory-refactor] Missing .gallery-scroll-track[data-gallery-id="${id}"]`);
  }
  if (!gridRoot) {
    throw new Error(`[gallery-scrub-factory-refactor] Missing grid for gallery id "${id}"`);
  }

  const viewport = gridRoot.closest(".gallery-viewport");
  if (!(viewport instanceof HTMLElement)) {
    throw new Error(`[gallery-scrub-factory-refactor] Grid for "${id}" is not inside .gallery-viewport`);
  }

  return { scrollTrack, gridRoot, viewport };
}

/**
 * @param {HTMLElement} gridRoot
 * @param {string} sideColumnSelector
 * @param {string} mainHeroImgSelector
 */
function queryGalleryTargets(gridRoot, sideColumnSelector, mainHeroImgSelector) {
  const sideColumns = gridRoot.querySelectorAll(sideColumnSelector);
  const mainHeroImg = gridRoot.querySelector(mainHeroImgSelector);
  if (!mainHeroImg) {
    throw new Error(
      `[gallery-scrub-factory-refactor] Missing hero for "${mainHeroImgSelector}" under grid.`,
    );
  }
  return { gridRoot, sideColumns, mainHeroImg };
}

/**
 * @param {number} progress01
 * @param {number} viewportWidthPx
 * @param {object} opts
 * @param {(w: number) => number} opts.getMaxScale
 * @param {number} opts.sideTranslateMaxPx
 * @param {number} opts.mainImgScaleStart
 * @param {number} opts.mainImgScaleEnd
 * @param {number} opts.sideTranslateDirection
 */
function computeGalleryMotion(progress01, viewportWidthPx, opts) {
  const {
    getMaxScale,
    sideTranslateMaxPx,
    mainImgScaleStart,
    mainImgScaleEnd,
    sideTranslateDirection,
  } = opts;

  const maxScale = getMaxScale(viewportWidthPx);
  const scale = 1 + progress01 * maxScale;
  const sideTranslatePx = progress01 * sideTranslateMaxPx * sideTranslateDirection;
  const mainImgDelta = mainImgScaleStart - mainImgScaleEnd;
  const mainImgScale = mainImgScaleStart - progress01 * mainImgDelta;

  return { scale, sideTranslatePx, mainImgScale };
}

/**
 * @param {{ gridRoot: HTMLElement, sideColumns: NodeListOf<Element>, mainHeroImg: HTMLElement }} targets
 * @param {{ scale: number, sideTranslatePx: number, mainImgScale: number }} motion
 */
function applyGalleryMotionToDom(targets, motion) {
  targets.gridRoot.style.transform = `translate(-50%, -50%) scale(${motion.scale})`;
  targets.sideColumns.forEach((col) => {
    /** @type {HTMLElement} */ (col).style.transform = `translateY(${motion.sideTranslatePx}px)`;
  });
  targets.mainHeroImg.style.transform = `scale(${motion.mainImgScale})`;
}

/**
 * @param {HTMLElement} viewportEl
 * @param {HTMLElement} scrollTrackEl
 * @param {number} insetClearPastTopPx — viewport coords; track bottom must be greater than this
 */
function syncViewportVisibilityByGeometry(viewportEl, scrollTrackEl, insetClearPastTopPx) {
  const trackRect = scrollTrackEl.getBoundingClientRect();
  const viewportHeightPx = window.innerHeight;
  const trackCrossesWindow = trackRect.top < viewportHeightPx;
  const trackBottomPastInset = trackRect.bottom > insetClearPastTopPx;
  viewportEl.style.visibility = trackCrossesWindow && trackBottomPastInset ? "visible" : "hidden";
}

/**
 * @param {object} options
 */
export function createGalleryScrollScrub(options) {
  const {
    galleryId,
    sideColumnSelector = ".gallery-col:not(.gallery-col--main)",
    mainHeroImgSelector = ".gallery-tile--hero img",
    scrub = 1,
    start = "top bottom",
    end = "bottom bottom",
    getMaxScale = defaultGetMaxScale,
    sideTranslateMaxPx = 300,
    mainImgScaleStart = 2,
    mainImgScaleEnd = 1.15,
    sideTranslateDirection = 1,
    hideViewportWhenTrackInactive = false,
    viewportHideClearPastTopInsetPx = null,
  } = options;

  const { scrollTrack, gridRoot, viewport } = resolveChapterElements(galleryId);
  const targets = queryGalleryTargets(gridRoot, sideColumnSelector, mainHeroImgSelector);

  const motionOpts = {
    getMaxScale,
    sideTranslateMaxPx,
    mainImgScaleStart,
    mainImgScaleEnd,
    sideTranslateDirection,
  };

  const fixedViewportEl = hideViewportWhenTrackInactive ? viewport : null;
  const visibilityUsesGeometry =
    Boolean(fixedViewportEl) &&
    typeof viewportHideClearPastTopInsetPx === "number" &&
    Number.isFinite(viewportHideClearPastTopInsetPx);
  const visibilityInsetPx = visibilityUsesGeometry ? viewportHideClearPastTopInsetPx : 0;

  function runVisibilityPass() {
    if (!fixedViewportEl) return;
    if (visibilityUsesGeometry) {
      syncViewportVisibilityByGeometry(fixedViewportEl, scrollTrack, visibilityInsetPx);
    }
  }

  const scrollTrigger = scrollTriggerPlugin.create({
    trigger: scrollTrack,
    start,
    end,
    scrub,
    onUpdate(self) {
      const motion = computeGalleryMotion(self.progress, window.innerWidth, motionOpts);
      applyGalleryMotionToDom(targets, motion);
      runVisibilityPass();
    },
    onToggle(self) {
      if (fixedViewportEl && !visibilityUsesGeometry) {
        fixedViewportEl.style.visibility = self.isActive ? "visible" : "hidden";
      }
    },
    onRefresh() {
      runVisibilityPass();
    },
  });

  requestAnimationFrame(runVisibilityPass);

  return {
    scrollTrigger,
    destroy() {
      scrollTrigger.kill();
    },
  };
}
