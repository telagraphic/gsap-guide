import gsap, { SplitText } from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";
import { EASEOUTQUAD } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 1 STORYBOARD
 *
 *     before   copy waiting below frame
 *    top 50%   title characters rise in, cascading
 * 50%→center   body lines rise and fade in, tied to scroll
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger dives 2 animations
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_ONE_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='1']",
    HEADER: ".page-section__title",
    PARAGRAPHS: ".page-section__body p",
  },
  HEADER: {
    SPLIT_TEXT: {
      TYPE: "chars,lines",
      MASK: "chars",
    },
    TIMELINE: {
      FROM: {
        yPercent: 100,
      },
      TO: {
        yPercent: 0,
        duration: 1,
        ease: EASEOUTQUAD,
        stagger: 0.01,
      },
    },
    SCROLL_TRIGGER: {
      start: "top 50%",
    },
  },
  PARAGRAPHS: {
    SPLIT_TEXT: {
      type: "lines",
      mask: "lines",
    },
    TIMELINE: {
      FROM: {
        yPercent: 100,
        opacity: 0,
      },
      TO: {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: EASEOUTQUAD,
        stagger: 0.01,
      },
    },
    SCROLL_TRIGGER: {
      start: "top 50%",
      end: "top center",
      scrub: 1,
    },
  },
};

export function createSectionOne() {
  const registry = createRegistry();

  const sectionOne = document.querySelector(
    SECTION_ONE_CONFIG.SELECTORS.SECTION,
  );

  const createTweens = () => {
    registry.resetAnimations();

    const sectionOneHeader = sectionOne.querySelector(
      SECTION_ONE_CONFIG.SELECTORS.HEADER,
    );

    const sectionOneHeaderSplit = new SplitText(sectionOneHeader, {
      type: SECTION_ONE_CONFIG.HEADER.SPLIT_TEXT.TYPE,
      mask: SECTION_ONE_CONFIG.HEADER.SPLIT_TEXT.MASK,
    });

    registry.addSplit("header", sectionOneHeaderSplit);

    gsap.set(sectionOneHeaderSplit.chars, {
      yPercent: SECTION_ONE_CONFIG.HEADER.TIMELINE.FROM.yPercent,
    });

    const headerTween = gsap.to(sectionOneHeaderSplit.chars, {
      ...SECTION_ONE_CONFIG.HEADER.TIMELINE.TO,
      scrollTrigger: {
        trigger: sectionOne,
        start: SECTION_ONE_CONFIG.HEADER.SCROLL_TRIGGER.start,
      },
    });

    registry.addTween("header", headerTween);
  };

  const setupSplitTween = (self) => {
    gsap.set(self.lines, {
      opacity: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.FROM.opacity,
      yPercent: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.FROM.yPercent,
    });

    const paragraphsTween = gsap.to(self.lines, {
      ...SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.TO,
      scrollTrigger: {
        trigger: sectionOne,
        ...SECTION_ONE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER,
      },
    });

    registry.addTween("paragraphs", paragraphsTween);

    return paragraphsTween;
  };

  const createSplits = () => {
    const sectionOneParagraphs = sectionOne.querySelectorAll(
      SECTION_ONE_CONFIG.SELECTORS.PARAGRAPHS,
    );

    const sectionOneParagraphsLines = new SplitText(sectionOneParagraphs, {
      type: SECTION_ONE_CONFIG.PARAGRAPHS.SPLIT_TEXT.type,
      mask: SECTION_ONE_CONFIG.PARAGRAPHS.SPLIT_TEXT.mask,
      autoSplit: true,
      onSplit(self) {
        return setupSplitTween(self);
      },
    });

    registry.addSplit("paragraphs", sectionOneParagraphsLines);
  };

  return {
    id: "section-one",
    type: "scrollTrigger",
    registry,
    create() {
      createTweens();
      createSplits();
    },
    destroy() {
      registry.destroy()
    },
    revert() {
      registry.resetSplits();
    }
  }
}
