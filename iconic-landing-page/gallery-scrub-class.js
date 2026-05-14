/**
 * @fileoverview Class-based API for the same scroll-scrubbed gallery as {@link createGalleryScrollScrub}.
 *
 * ## How it works
 *
 * `mount()` delegates to {@link createGalleryScrollScrub} from `gallery-scrub-factory.js` and stores the returned
 * `destroy` function. That keeps **one code path** for DOM resolution, cached refs, `onUpdate` transforms, and
 * optional viewport visibility — either **`onToggle` + `isActive`** or **geometry** via
 * **`viewportHideClearPastTopInsetPx`** (see factory JSDoc on `GalleryScrollScrubConfig`).
 *
 * ## Factory vs class
 *
 * - **Factory** (`createGalleryScrollScrub`) — minimal allocation; ideal when registering many chapters in a loop.
 * - **Class** (`GalleryScrollScrub`) — hold an instance on a page controller, `mount()` when DOM is ready,
 *   `destroy()` on teardown (route change, Storybook story unmount, etc.).
 *
 * ## Math re-exports
 *
 * `computeGalleryScrubTransforms` and `defaultGetMaxScale` are re-exported from the factory module so consumers
 * can import everything from one path if they prefer.
 */

import { createGalleryScrollScrub } from "./gallery-scrub-factory.js";

export {
  computeGalleryScrubTransforms,
  defaultGetMaxScale,
} from "./gallery-scrub-factory.js";

/**
 * @typedef {import('./gallery-scrub-factory.js').GalleryScrollScrubConfig} GalleryScrollScrubConfig
 */

/**
 * OOP wrapper around the gallery ScrollTrigger setup. All factory options apply unchanged, including
 * **`hideViewportWhenTrackInactive`**, **`viewportHideClearPastTopInsetPx`**, and **`scrollTrigger`** passthrough.
 */
export class GalleryScrollScrub {
  /**
   * @param {GalleryScrollScrubConfig} config - Same as {@link createGalleryScrollScrub}: `galleryId` and/or
   *   `trigger` + `gridRoot`, motion overrides (`getMaxScale`, `sideTranslateMaxPx`, …), viewport visibility
   *   (`hideViewportWhenTrackInactive`, `viewportHideClearPastTopInsetPx`), and optional `scrollTrigger` extras.
   */
  constructor(config) {
    /** @type {GalleryScrollScrubConfig} */
    this._config = { ...config };
    /** @type {null | (() => void)} */
    this._teardown = null;
  }

  /**
   * Creates the ScrollTrigger instance on first call. Safe to call multiple times — only runs once until `destroy()`.
   * Forwards **`this._config`** to the factory (including geometry viewport visibility if configured).
   *
   * @returns {void}
   */
  mount() {
    if (this._teardown) return;
    const { destroy } = createGalleryScrollScrub(this._config);
    this._teardown = destroy;
  }

  /**
   * Kills the ScrollTrigger and clears the teardown handle.
   *
   * @returns {void}
   */
  destroy() {
    if (this._teardown) {
      this._teardown();
      this._teardown = null;
    }
  }
}
