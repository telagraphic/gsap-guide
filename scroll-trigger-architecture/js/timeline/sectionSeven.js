import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEINQUAD, EASEOUTQUAD, EASEOUTQUINT, EASEINOUTQUART } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 7 STORYBOARD  (per list item)
 *
 *     before   list labels waiting in mask
 * center→center  chars shuffle-roll in, random order per line
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger scrubs shuffled char timeline per item
 * CSS: .anim-mask on items; dual-span yPercent per char
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_SEVEN_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='7']",
    ITEMS: ".animation-character-waterdrop__item",
  },
};

export function createSectionSeven() {
  const registry = createRegistry();

  function createTweens() {
    registry.resetAnimations();

    const sectionSeven = document.querySelector(
      SECTION_SEVEN_CONFIG.SELECTORS.SECTION,
    );
    const sectionSevenItems = sectionSeven.querySelectorAll(
      SECTION_SEVEN_CONFIG.SELECTORS.ITEMS,
    );

    sectionSevenItems.forEach((line) => {
      SplitText.create(line, {
        type: "chars",
        charsClass: "anim-char-parent",
        tag: "span",
        autoSplit: true,
        onSplit(self) {
          line.classList.remove("anim-prehide");

          self.chars.forEach((charEl) => {
            const text = charEl.textContent;
            charEl.textContent = "";
            charEl.innerHTML = `<span class="anim-char-visible">${text}</span><span class="anim-char-hidden">${text}</span>`;
          });

          self.chars.forEach((charEl) => {
            gsap.set(charEl.querySelector(".anim-char-visible"), {
              yPercent: 0,
            });
            gsap.set(charEl.querySelector(".anim-char-hidden"), {
              yPercent: -100,
            });
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: line,
              start: "center 80%",
              end: "top center",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          gsap.utils.shuffle([...self.chars]).forEach((charEl, index) => {
            const layers = [
              charEl.querySelector(".anim-char-hidden"),
              charEl.querySelector(".anim-char-visible"),
            ];

            tl.fromTo(
              layers,
              {
                yPercent: (i, target) =>
                  target.classList.contains("anim-char-hidden") ? -100 : 0,
              },
              {
                yPercent: (i, target) =>
                  target.classList.contains("anim-char-hidden") ? 0 : 100,
                ease: EASEINOUTQUART,
                duration: 1,
              },
              index * 0.05,
            );
          });

          return tl;
        },
      });
    });
  }

  return {
    name: "section-seven",
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
