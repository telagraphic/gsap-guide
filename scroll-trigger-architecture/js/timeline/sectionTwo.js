import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
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
    },
  },
};


export createSectionTwo() {




    
}

const sectionOne = document.querySelector(SECTION_ONE_CONFIG.SELECTORS.SECTION);
const sectionOneHeader = sectionOne.querySelector(
  SECTION_ONE_CONFIG.SELECTORS.HEADER,
);
const sectionOneParagraphs = sectionOne.querySelectorAll(
  SECTION_ONE_CONFIG.SELECTORS.PARAGRAPHS,
);

const sectionOneHeaderChars = new SplitText(sectionOneHeader, {
  type: SECTION_ONE_CONFIG.HEADER.SPLIT_TEXT.TYPE,
  mask: SECTION_ONE_CONFIG.HEADER.SPLIT_TEXT.MASK,
}).chars;

gsap.set(sectionOneHeaderChars, {
  yPercent: SECTION_ONE_CONFIG.HEADER.TIMELINE.FROM.yPercent,
});

gsap.to(sectionOneHeaderChars, {
  yPercent: SECTION_ONE_CONFIG.HEADER.TIMELINE.TO.yPercent,
  stagger: SECTION_ONE_CONFIG.HEADER.TIMELINE.stagger,
  ease: SECTION_ONE_CONFIG.HEADER.TIMELINE.ease,
  scrollTrigger: {
    trigger: sectionOne,
    start: SECTION_ONE_CONFIG.HEADER.SCROLL_TRIGGER.start,
  },
});

const sectionOneParagraphsLines = new SplitText(sectionOneParagraphs, {
  type: SECTION_ONE_CONFIG.PARAGRAPHS.SPLIT_TEXT.type,
  mask: SECTION_ONE_CONFIG.PARAGRAPHS.SPLIT_TEXT.mask,
  autoSplit: true,
  onSplit(self) {
    gsap.set(self.lines, {
      opacity: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.FROM.opacity,
      yPercent: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.FROM.yPercent,
    });

    return gsap.to(self.lines, {
      opacity: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.TO.opacity,
      yPercent: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.TO.yPercent,
      stagger: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.stagger,
      ease: SECTION_ONE_CONFIG.PARAGRAPHS.TIMELINE.ease,
      scrollTrigger: {
        trigger: sectionOne,
        start: SECTION_ONE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER.start,
        end: SECTION_ONE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER.end,
        scrub: SECTION_ONE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER.scrub,
      },
    });
  },
});
