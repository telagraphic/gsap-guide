import { createHorizontalSlide } from "../effects/horizontalSlide.js";
import { EASEINQUAD, EASEOUTQUAD, EASEOUTQUINT } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 6 STORYBOARD  (pinned horizontal)
 *
 *    top top   panel pins, track scrubs x across slides
 *   slide 1   heading + body fade out as slide exits left (scrubbed EXIT)
 *  slides 2+  heading rises in, body lines fade in from right
 *  on leave   non-final slides stagger fade out
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: Nested effect module — section delegates to horizontalSlide effect
 * CSS: .page-section__track flex row; GSAP scrubs x, line opacity, yPercent
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_SIX_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='6']",
    TRACK: ".page-section__track",
    SLIDES: ".page-section__slide",
  },
  SPLIT_TEXT: {
    lines: { type: "lines", mask: "lines", linesClass: "anim-line" },
    paragraph: { smartSplit: true, autoSplit: true },
  },
  EXIT: {
    // Fine tune, they are leaving too early
    startEnd: { start: "left left", end: "right left" },
    set: { opacity: 1 },
    vars: { opacity: 0, stagger: 0.05, ease: EASEINQUAD },
  },
  HEADING_ENTER: {
    startEnd: { start: "left 65%", end: "left 25%" },
    set: { opacity: 0, yPercent: 100 },
    vars: { opacity: 1, yPercent: 0, stagger: 0.03, ease: EASEOUTQUINT },
  },
  PARAGRAPH_ENTER: {
    startEnd: { start: "left 70%", end: "left 30%" },
    set: { opacity: 0 },
    vars: { opacity: 1, stagger: 0.02, ease: EASEOUTQUAD },
  },
  LEAVE: { opacity: 0, stagger: 0.05, ease: EASEINQUAD },
};

export function createSectionSix() {
  let effect = null;

  return {
    name: "section-six",
    type: "gsap-scroll-trigger",
    get registry() {
      return effect?.registry ?? null;
    },
    create() {
      const section = document.querySelector(
        SECTION_SIX_CONFIG.SELECTORS.SECTION,
      );

      effect = createHorizontalSlide({
        section,
        track: section.querySelector(SECTION_SIX_CONFIG.SELECTORS.TRACK),
        slides: section.querySelectorAll(SECTION_SIX_CONFIG.SELECTORS.SLIDES),
        splitText: SECTION_SIX_CONFIG.SPLIT_TEXT,
        exit: SECTION_SIX_CONFIG.EXIT,
        headingEnter: SECTION_SIX_CONFIG.HEADING_ENTER,
        paragraphEnter: SECTION_SIX_CONFIG.PARAGRAPH_ENTER,
        leave: SECTION_SIX_CONFIG.LEAVE,
      });
      effect.create();
    },
    destroy() {
      effect?.destroy();
      effect = null;
    },
  };
}
