import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEINQUAD, EASEOUTQUAD, EASEOUTQUINT } from "../easings.js";

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
 * PATTERN: hover-driven stagger from index — no ScrollTrigger
 * CSS: hidden layer stacked above item; .anim-mask clips overflow
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_EIGHT_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='8']",
    ITEMS: ".animation-character-ripple__item",
    VISIBLE_CHARS: ".animation-character-ripple__layer--visible span",
    HIDDEN_CHARS: ".animation-character-ripple__layer--hidden span",
    CHAR: ".animation-character-ripple__char",
  },
  CLASSES: {
    HOVERED: "animation-character-ripple__item--hovered",
    LAYER_HIDDEN:
      "animation-character-ripple__layer animation-character-ripple__layer--hidden",
    LAYER_VISIBLE:
      "animation-character-ripple__layer animation-character-ripple__layer--visible",
    CHAR: "animation-character-ripple__char",
  },
};

export function createSectionEight() {
  const registry = createRegistry();

  function createTweens() {
    registry.resetAnimations();

    const sectionEight = document.querySelector(
      SECTION_EIGHT_CONFIG.SELECTORS.SECTION,
    );
    const sectionEightItems = sectionEight.querySelectorAll(
      SECTION_EIGHT_CONFIG.SELECTORS.ITEMS,
    );

    function wrapPhraseChars(element) {
      const text = element.textContent;
      const { CHAR } = SECTION_EIGHT_CONFIG.CLASSES;
      element.innerHTML = text
        .split("")
        .map((char) =>
          char === " "
            ? "<span> </span>"
            : `<span class="${CHAR}">${char}</span>`,
        )
        .join("");
    }

    function buildPhraseLayers(item) {
      const text = item.dataset.phrase ?? item.textContent.trim();
      item.dataset.phrase = text;
      item.replaceChildren();

      const { LAYER_HIDDEN, LAYER_VISIBLE } = SECTION_EIGHT_CONFIG.CLASSES;

      const hidden = document.createElement("span");
      hidden.className = LAYER_HIDDEN;
      hidden.textContent = text;

      const visible = document.createElement("span");
      visible.className = LAYER_VISIBLE;
      visible.textContent = text;

      item.append(hidden, visible);
      wrapPhraseChars(hidden);
      wrapPhraseChars(visible);
    }

    function getPhraseCharIndex(child) {
      return Array.from(child.parentNode.children).indexOf(child);
    }

    function rebuildPanelEightPhrases() {
      sectionEight
        .querySelectorAll(SECTION_EIGHT_CONFIG.SELECTORS.ITEMS)
        .forEach((item) => {
          gsap.killTweensOf(item.querySelectorAll("span"));
          item.classList.remove(SECTION_EIGHT_CONFIG.CLASSES.HOVERED);
          buildPhraseLayers(item);
          item.classList.remove("anim-prehide");
        });
    }

    function attachPhraseHover(item) {
      const { SELECTORS, CLASSES } = SECTION_EIGHT_CONFIG;

      item.addEventListener("mouseover", (e) => {
        const visibleChars = item.querySelectorAll(SELECTORS.VISIBLE_CHARS);
        const hiddenChars = item.querySelectorAll(SELECTORS.HIDDEN_CHARS);

        if (
          !gsap.isTweening(visibleChars) &&
          item.classList.contains(CLASSES.HOVERED)
        ) {
          item.classList.remove(CLASSES.HOVERED);
        }

        if (e.target.classList.contains(CLASSES.CHAR)) {
          item.classList.add(CLASSES.HOVERED);
          const indexHover = getPhraseCharIndex(e.target);

          gsap.to(visibleChars, {
            yPercent: 100,
            ease: "back.out(2)",
            duration: 0.6,
            stagger: {
              each: 0.023,
              from: indexHover,
            },
          });

          gsap.to(hiddenChars, {
            yPercent: 100,
            ease: "back.out(2)",
            duration: 0.6,
            stagger: {
              each: 0.023,
              from: indexHover,
            },
            onComplete: () => {
              gsap.set(visibleChars, { clearProps: "all" });
              gsap.set(hiddenChars, { clearProps: "all" });
            },
          });
        }
      });
    }

    sectionEightItems.forEach((item) => {
      buildPhraseLayers(item);
      item.classList.remove("anim-prehide");
      attachPhraseHover(item);
    });

    ScrollTrigger.addEventListener("refreshInit", rebuildPanelEightPhrases);
  }

  return {
    name: "section-eight",
    type: "gsap effect",
    registry: registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
    },
  };
}
