import { createTextWideSlide } from "../effects/textWideSlide.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 3 STORYBOARD  (per line)
 *
 *     before   words sitting wide across the frame
 * bottom→60%   words draw together, tied to scroll
 *
 * CONFIG  (WIDE_SLIDE_CONFIG)
 *   boundsSelector    wider container → more free space → wider gaps
 *   origin            left | center | right — spread anchor before settle
 *   gapMultiplier   + wider word gaps at start    − tighter spread
 *   gapMin          + higher floor gap (short lines)  − gaps can shrink
 *   spreadOvershoot + stronger x offset (0–1)     − subtler (0 = off)
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: Nested effect module — section delegates to textWideSlide effect
 * CSS: .anim-line max-content — lines don't reflow; GSAP scrubs x on .anim-word
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_THREE_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='3']",
    CONTENTS: ".page-section__content",
    PARAGRAPHS: ".animation-wide-slide p.type-body",
  },
  WORDS: {
    SCROLL_TRIGGER: {
      start: "top bottom",
      end: "top 60%",
      scrub: 0.2,
      invalidateOnRefresh: true,
    },
  },
};

const WIDE_SLIDE_CONFIG = {
  origin: "left",
  gapMin: 8,
  gapMultiplier: 2,
  spreadOvershoot: 0.1,
};

export function createSectionThree() {
  let effect = null;

  return {
    id: "section-three",
    type: "effect",
    get registry() {
      return effect?.registry ?? null;
    },
    create() {
      const section = document.querySelector(
        SECTION_THREE_CONFIG.SELECTORS.SECTION,
      );
      const container = section.querySelector(
        SECTION_THREE_CONFIG.SELECTORS.CONTENTS,
      );
      const paragraphs = section.querySelectorAll(
        SECTION_THREE_CONFIG.SELECTORS.PARAGRAPHS,
      );

      effect = createTextWideSlide({
        spread: WIDE_SLIDE_CONFIG,
        scrollTrigger: SECTION_THREE_CONFIG.WORDS.SCROLL_TRIGGER,
        container,
        paragraphs,
      });
      effect.create();
    },
    destroy() {
      effect?.destroy();
      effect = null;
    },
    revert() {
      effect?.revert();
    },
  };
}
