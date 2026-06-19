import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEOUTQUAD } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * HEADER STORYBOARD
 *
 *    0ms   titles cleared to play
 *  500ms   headline lines slide in, alternating (cascade)
 * +500ms   tagline fades in
 * −250ms   hint overlaps tag
 * −500ms   icon overlaps hint
 *    end   full header on stage
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: MASTER TIMELINE drives 4 nested timeline animations
 *
 *
 * ───────────────────────────────────────────────────────── */

const HEADER_CONFIG = {
  SELECTORS: {
    HEADER: ".page-header",
    ICON: ".page-header__icon",
    TAG: ".page-header__tag",
    HINT: ".page-header__hint",
    HEADER_TITLES: ".page-header__titles",
    HEADER_TITLE: ".page-header__titles h1",
  },
  HEADER: {
    TIMELINE: {
      opacity: 1,
      duration: 0.5,
      ease: EASEOUTQUAD,
    },
  },
  TAG: {
    TIMELINE: {
      opacity: 1,
      duration: 0.5,
      ease: EASEOUTQUAD,
    },
  },
  HINT: {
    TIMELINE: {
      opacity: 1,
      duration: 0.5,
      ease: EASEOUTQUAD,
    },
  },
  ICON: {
    TIMELINE: {
      opacity: 1,
      duration: 0.5,
      ease: EASEOUTQUAD,
    },
  },
  HEADER_TITLE: {
    SPLIT_TEXT: {
      type: "lines",
      mask: "lines",
      linesClass: "page-header-lines",
    },
    TIMELINE: {
      yPercent: 0,
      duration: 1,
      ease: EASEOUTQUAD,
      stagger: 0.02,
    },
  },
};

export function createHeader() {
  const registry = createRegistry();

  // const elements = createElements();

  const createTimeline = () => {
    registry.resetAnimations();

    const header = document.querySelector(HEADER_CONFIG.SELECTORS.HEADER);
    const headerIcon = header.querySelector(HEADER_CONFIG.SELECTORS.ICON);
    const headerTag = header.querySelector(HEADER_CONFIG.SELECTORS.TAG);
    const headerHint = header.querySelector(HEADER_CONFIG.SELECTORS.HINT);
    const headerHeaders = header.querySelector(
      HEADER_CONFIG.SELECTORS.HEADER_TITLES,
    );

    const headerTimeline = gsap.timeline();
    const iconTimeline = gsap.timeline();
    const tagTimeline = gsap.timeline();
    const hintTimeline = gsap.timeline();
    const linesTimeline = gsap.timeline();

    registry.addTimeline(headerTimeline);

    iconTimeline.to(headerIcon, HEADER_CONFIG.HEADER.TIMELINE);
    tagTimeline.to(headerTag, HEADER_CONFIG.TAG.TIMELINE);
    hintTimeline.to(headerHint, HEADER_CONFIG.HINT.TIMELINE);

    const headerLines = new SplitText(
      headerHeaders.querySelectorAll(HEADER_CONFIG.SELECTORS.HEADER_TITLE),
      HEADER_CONFIG.HEADER_TITLE.SPLIT_TEXT,
    );

    registry.addSplit(headerLines);

    headerLines.lines.forEach((line, i) => {
      const position = i + 1;
      const fromY = position % 2 === 0 ? position * -100 : 100; // your logic
      gsap.set(line, { yPercent: fromY });
    });

    linesTimeline.to(headerLines.lines, HEADER_CONFIG.HEADER_TITLE.TIMELINE);

    /**
     * Play animation on initial page load
     */
    headerTimeline
      .call(removePrehideClasses, [headerHeaders])
      .add(linesTimeline, "+=0.5")
      .add(tagTimeline, "+=.5")
      .add(hintTimeline, ">-.25")
      .add(iconTimeline, ">-.5")
      .call(removePrehideClasses, [headerIcon, headerTag, headerHint])
      .play();
  };

  return {
    name: "header-section",
    type: "timeline",
    registry: registry,
    create: createTimeline,
    destroy() {
      registry.destroy();
    },
    revert() {
      registry.resetSplits();
    },
  };
}
