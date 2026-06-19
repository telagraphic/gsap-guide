import gsap from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";
import { EASEOUTCIRC } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 4 STORYBOARD  (per row)
 *
 *     before   visible label sitting in clip window
 * 60%→top top   hidden rolls in, visible rolls out — slot shuffle
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger scrubs dual-span yPercent per track
 * CSS: .anim-clip-slot masks window; .anim-char-hidden stacked above visible
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_FOUR_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='4']",
    TRACKS: ".animation-slot-machine-roll__track",
  },
  SCROLL_TRIGGER: {
    start: "center 60%",
    end: "top top",
    scrub: 0.4,
    invalidateOnRefresh: true,
  },
};

export function createSectionFour() {
  const registry = createRegistry();

  const sectionFour = document.querySelector(
    SECTION_FOUR_CONFIG.SELECTORS.SECTION,
  );
  const sectionFourTracks = sectionFour.querySelectorAll(
    SECTION_FOUR_CONFIG.SELECTORS.TRACKS,
  );

  const { start, end, scrub, invalidateOnRefresh } =
    SECTION_FOUR_CONFIG.SCROLL_TRIGGER;

  function createTweens() {
    registry.resetAnimations();

    sectionFourTracks.forEach((word, i) => {

      let tween = gsap.fromTo(
        word.children,
        {
          yPercent: (index, target) =>
            target.classList.contains("anim-char-hidden") ? -100 : 0,
        },
        {
          yPercent: (index, target) =>
            target.classList.contains("anim-char-hidden") ? 0 : 100,
          ease: EASEOUTCIRC,
          scrollTrigger: {
            trigger: word,
            start,
            end,
            scrub,
            invalidateOnRefresh,
          },
        },
      );

      registry.addTween(`section-four-tween-${i}`, tween);
    });
  }

  return {
    id: "section-four",
    type: "scrollTrigger",
    registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
    },
  };
}
