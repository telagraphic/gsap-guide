import { EASEOUTQUAD } from "../easings.js";
import { createTextRipple } from "../effects/textRipple.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 8 STORYBOARD  (per phrase item)
 *
 *     before   method labels built as dual char layers
 *   on hover   chars ripple down from hovered index
 *  on complete  transforms cleared, ready to hover again
 *  on refresh   layers rebuilt from data-phrase
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: Nested effect module — section delegates to textRipple per item
 * CSS: hidden layer stacked above item; .anim-mask clips overflow
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_EIGHT_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='8']",
    ITEMS: ".animation-character-ripple__item",
    VISIBLE_CHARS: ".animation-character-ripple__layer--visible span",
    HIDDEN_CHARS: ".animation-character-ripple__layer--hidden span",
  },
  LAYERS: {
    hovered: "animation-character-ripple__item--hovered",
    hidden:
      "animation-character-ripple__layer animation-character-ripple__layer--hidden",
    visible:
      "animation-character-ripple__layer animation-character-ripple__layer--visible",
    char: "animation-character-ripple__char",
  },
  RIPPLE: {
    preset: "roll-down",
    ease: "back.out(2)",
    duration: 0.6,
    stagger: { each: 0.023 },
    // variance: {
    //   duration: 0.1,
    //   stagger: 0.05,
    //   ease: EASEOUTQUAD
    // },
  },
};

export function createSectionEight() {
  let effect = null;

  return {
    name: "section-eight",
    type: "gsap effect",
    get registry() {
      return effect?.registry ?? null;
    },
    create() {
      effect?.destroy();

      const section = document.querySelector(
        SECTION_EIGHT_CONFIG.SELECTORS.SECTION,
      );
      const items = section.querySelectorAll(
        SECTION_EIGHT_CONFIG.SELECTORS.ITEMS,
      );

      // effect = createTextRipple({
      //   targets: items,
      //   layers: SECTION_EIGHT_CONFIG.LAYERS,
      //   selectors: {
      //     visibleChars: SECTION_EIGHT_CONFIG.SELECTORS.VISIBLE_CHARS,
      //     hiddenChars: SECTION_EIGHT_CONFIG.SELECTORS.HIDDEN_CHARS,
      //   },
      //   ripple: SECTION_EIGHT_CONFIG.RIPPLE,
      //   beforeBind: (target) => target.classList.remove("anim-prehide"),
      // });


      effect = createTextRipple({
        targets: items,
        layers: SECTION_EIGHT_CONFIG.LAYERS,
        selectors: {
          visibleChars: SECTION_EIGHT_CONFIG.SELECTORS.VISIBLE_CHARS,
          hiddenChars: SECTION_EIGHT_CONFIG.SELECTORS.HIDDEN_CHARS,
        },
        ripple: SECTION_EIGHT_CONFIG.RIPPLE,
        bind: {
          mode: "scroll",
          scroll: {
            staggerFrom: "left",
            scrollTrigger: {
              start: "top 65%",
              end: "top 45%",
              scrub: 0.5,
            },
          },
        },
        beforeBind: (target) => target.classList.remove("anim-prehide"),
      });

      effect.create();
    },
    destroy() {
      effect?.destroy();
      effect = null;
    },
  };
}
