import gsap, { SplitText } from "../shared/gsap.js";
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

  function createTweens() {
    registry.resetAnimations();

    sectionTwoGroups.forEach((group, index) => {
      const header = group.querySelector(SECTION_TWO_CONFIG.SELECTORS.HEADER);
      const paragraph = group.querySelector(
        SECTION_TWO_CONFIG.SELECTORS.PARAGRAPH,
      );

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

      registry.addTween(`header-${index}`, headerTween);

      const paragraphSplit = new SplitText(paragraph, {
        type: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.type,
        mask: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.mask,
        autoSplit: true,
        revert: true,
      });

      registry.addSplit(`paragraph-${index}`, paragraphSplit);

      gsap.set(paragraphSplit.lines, SECTION_TWO_CONFIG.PARAGRAPH.TIMELINE.FROM);

      const linesTween = gsap.to(paragraphSplit.lines, {
        ...SECTION_TWO_CONFIG.PARAGRAPH.TIMELINE.TO,
        scrollTrigger: {
          trigger: group,
          start: "top center-=120",
          once: true,
        },
      });

      registry.addTween(`lines-${index}`, linesTween);
    });
  }

  return {
    id: "section-two",
    type: "scrollTrigger",
    registry,
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
