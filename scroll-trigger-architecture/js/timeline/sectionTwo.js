import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEOUTQUAD } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 2 STORYBOARD  (×3 groups)
 *
 *     before   copy held back, nothing on stage
 * center−120   body lines fade in, cascading
 *     center   headline fades in
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger drives 2 animations
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_TWO_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='2']",
    HEADER: ".page-section__title",
    GROUPS: ".page-section__group",
    PARAGRAPH: "p",
  },
  HEADER: {
    SPLIT_TEXT: {
      type: "chars",
      mask: "chars",
    },
  },
  PARAGRAPH: {
    SPLIT_TEXT: {
      type: "lines",
      mask: "lines",
    },
    TIMELINE: {
      FROM: {
        opacity: 0,
        yPercent: 100,
      },
      TO: {
        opacity: 1,
        yPercent: 0,
        duration: 1,
        ease: EASEOUTQUAD,
        stagger: 0.01,
      },
    },
  },
};

export function createSectionTwo() {
  const registry = createRegistry();

  const sectionTwo = document.querySelector(
    SECTION_TWO_CONFIG.SELECTORS.SECTION,
  );

  const sectionTwoGroups = Array.from(
    sectionTwo.querySelectorAll(SECTION_TWO_CONFIG.SELECTORS.GROUPS),
  );

  function setupSplitTween() {
    
  }

  function createTweens() {
    registry.resetAnimations();

    sectionTwoGroups.forEach((group) => {
      const header = group.querySelector(SECTION_TWO_CONFIG.SELECTORS.HEADER);

      const headerTween = gsap.to(header, {
        onStart: () => {
          removePrehideClasses(header, paragraph);
        },
        opacity: 1,
        scrollTrigger: {
          trigger: group,
          start: "top center",
          end: "center center",
          once: true,
        },
      });

      registry.addTween(headerTween);

      const paragraph = group.querySelector(
        SECTION_TWO_CONFIG.SELECTORS.PARAGRAPH,
      );

      const paragraphLines = new SplitText(paragraph, {
        type: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.type,
        mask: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.mask,
        autoSplit: true,
        revert: true,
      }).lines;

      registry.addSplit(paragraphLines);

      gsap.set(paragraphLines, {
        opacity: 0,
      });

      const linesTween = gsap.to(paragraphLines, {
        opacity: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: group,
          start: "top center-=120",
          once: true,
        },
      });

      registry.addTween(linesTween);
    });
  }

  return {
    name: "section-two",
    type: "gsap split and scroll",
    registry: registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
    },
    revert() {
      registry.resetSplits();
    },
  };
}
