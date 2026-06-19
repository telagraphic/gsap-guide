import { createTextRoll } from "../effects/textRoll.js";
import { EASEINOUTQUART } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 7 STORYBOARD  (per list item)
 *
 *     before   list labels waiting in mask
 * center→center  chars shuffle-roll in, random order per line
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: Nested effect module — section delegates to textRoll effect per item
 * CSS: .anim-mask on items; dual-span yPercent per char
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_SEVEN_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='7']",
    ITEMS: ".animation-character-waterdrop__item",
  },
  ROLL: {
    ease: EASEINOUTQUART,
    stagger: 0.05,
    duration: 1,
    shuffle: true,
  },
  SCROLL_TRIGGER: {
    start: "center 80%",
    end: "top center",
    scrub: 1,
    invalidateOnRefresh: true,
  },
};

export function createSectionSeven() {
  let effect = null;

  return {
    id: "section-seven",
    type: "effect",
    get registry() {
      return effect?.registry ?? null;
    },
    create() {
      const section = document.querySelector(
        SECTION_SEVEN_CONFIG.SELECTORS.SECTION,
      );
      const items = section.querySelectorAll(
        SECTION_SEVEN_CONFIG.SELECTORS.ITEMS,
      );

      effect = createTextRoll({
        targets: items,
        roll: SECTION_SEVEN_CONFIG.ROLL,
        scrollTrigger: SECTION_SEVEN_CONFIG.SCROLL_TRIGGER,
        onSplit: (_self, item) => item.classList.remove("anim-prehide"),
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
