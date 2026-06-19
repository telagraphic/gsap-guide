import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createTextRoll } from "../effects/textRoll.js";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEOUTQUART, EASEINOUTQUART } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 5 STORYBOARD
 *
 *  top 70%→20%   body lines rise in, blur clears, staggered
 * center→center  title chars slot-roll in, document order
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger scrubs line waterfall + textRoll effect on title
 * CSS: .anim-mask on title; line masks via SplitText; dual-span yPercent per char
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_FIVE_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='5']",
    TITLE: ".page-section__title",
    PARAGRAPHS: "p",
  },
  PARAGRAPHS: {
    SPLIT_TEXT: {
      type: "lines",
      mask: "lines",
      autoSplit: true,
    },
    TIMELINE: {
      FROM: {
        opacity: 0,
        yPercent: 100,
        filter: "blur(10px)",
      },
      TO: {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        stagger: 0.01,
        ease: EASEOUTQUART,
      },
    },
    SCROLL_TRIGGER: {
      start: "top 70%",
      end: "bottom 20%",
      scrub: 1,
    },
  },
  TITLE: {
    ROLL: {
      ease: EASEINOUTQUART,
      stagger: 0.05,
      duration: 1,
      shuffle: false,
    },
    SCROLL_TRIGGER: {
      start: "center 80%",
      end: "top 20%",
      ease: EASEINOUTQUART,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  },
};

export function createSectionFive() {
  let titleEffect = null;
  const registry = createRegistry();

  function createTweens() {
    registry.resetAnimations();
    titleEffect?.destroy();

    const sectionFive = document.querySelector(
      SECTION_FIVE_CONFIG.SELECTORS.SECTION,
    );
    const sectionFiveHeader = sectionFive.querySelector(
      SECTION_FIVE_CONFIG.SELECTORS.TITLE,
    );
    const sectionFiveParagraphs = sectionFive.querySelectorAll(
      SECTION_FIVE_CONFIG.SELECTORS.PARAGRAPHS,
    );

    titleEffect = createTextRoll({
      target: sectionFiveHeader,
      roll: SECTION_FIVE_CONFIG.TITLE.ROLL,
      scrollTrigger: SECTION_FIVE_CONFIG.TITLE.SCROLL_TRIGGER,
      onSplit: () => removePrehideClasses(sectionFiveHeader),
    });
    titleEffect.create();

    const { FROM, TO } = SECTION_FIVE_CONFIG.PARAGRAPHS.TIMELINE;

    const sectionFiveParagraphsLines = new SplitText(sectionFiveParagraphs, {
      ...SECTION_FIVE_CONFIG.PARAGRAPHS.SPLIT_TEXT,
    });

    registry.addSplit("paragraphs", sectionFiveParagraphsLines);

    gsap.set(sectionFiveParagraphsLines.lines, FROM);

    const paragraphTween = gsap.to(sectionFiveParagraphsLines.lines, {
      ...TO,
      scrollTrigger: {
        trigger: sectionFive,
        ...SECTION_FIVE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER,
      },
    });

    registry.addTween("paragraphs", paragraphTween);

  }

  return {
    name: "section-five",
    type: "gsap-scroll-trigger",
    registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
      titleEffect?.destroy();
      titleEffect = null;
    },
  };
}
