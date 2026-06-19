import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEINQUAD, EASEOUTQUAD, EASEOUTQUINT } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 6 STORYBOARD  (pinned horizontal)
 *
 *    top top   panel pins, track scrubs x across slides
 *   slide 1   heading + body fade out as slide exits left
 *  slides 2+  heading rises in, body lines fade in from right
 *  on leave   non-final slides stagger fade out
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: pinned track tween + containerAnimation per slide
 * CSS: .page-section__track flex row; GSAP scrubs x, line opacity, yPercent
 *
 * ───────────────────────────────────────────────────────── */

const SECTION_SIX_CONFIG = {
  SELECTORS: {
    SECTION: "[data-section='6']",
    TRACK: ".page-section__track",
    SLIDES: ".page-section__slide",
  },
  SPLIT_TEXT: {
    LINES: { type: "lines", mask: "lines", linesClass: "anim-line" },
    PARAGRAPH: { smartSplit: true, autoSplit: true },
  },
  EXIT: {
    range: { start: "right center", end: "left left" },
    set: { opacity: 1 },
    vars: { opacity: 0, stagger: 0.05, ease: EASEINQUAD },
  },
  HEADING_ENTER: {
    range: { start: "left 65%", end: "left 25%" },
    set: { opacity: 0, yPercent: 100 },
    vars: { opacity: 1, yPercent: 0, stagger: 0.03, ease: EASEOUTQUINT },
  },
  PARAGRAPH_ENTER: {
    range: { start: "left 70%", end: "left 30%" },
    set: { opacity: 0 },
    vars: { opacity: 1, stagger: 0.02, ease: EASEOUTQUAD },
  },
  LEAVE: { opacity: 0, stagger: 0.05, ease: EASEINQUAD },
};

export function createSectionSix() {
  const registry = createRegistry();

  function createTweens() {
    registry.resetAnimations();

    const sectionSix = document.querySelector(
      SECTION_SIX_CONFIG.SELECTORS.SECTION,
    );
    const sectionSixTrack = sectionSix.querySelector(
      SECTION_SIX_CONFIG.SELECTORS.TRACK,
    );
    const sectionSixSections = sectionSix.querySelectorAll(
      SECTION_SIX_CONFIG.SELECTORS.SLIDES,
    );

    function getPanelSixScrollDistance() {
      const slides = sectionSixSections;
      const lastSlide = slides[slides.length - 1];

      // Last slide's right edge aligned to the pinned panel — avoids scrollWidth /
      // window.innerWidth drift with 100vw slides and scrollbar width.
      return (
        lastSlide.offsetLeft + lastSlide.offsetWidth - sectionSix.clientWidth
      );
    }

    const sectionSixTween = gsap.to(sectionSixTrack, {
      x: () => -getPanelSixScrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: sectionSix,
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + getPanelSixScrollDistance(),
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    function createSectionSixScrollTrigger(section, range) {
      return {
        trigger: section,
        containerAnimation: sectionSixTween,
        scrub: true,
        ...range,
      };
    }

    function fadeOutOnLeave(lines) {
      const { opacity, stagger, ease } = SECTION_SIX_CONFIG.LEAVE;
      gsap.to(lines, { opacity, stagger, ease });
    }

    function withLeaveOnLast(scrollTrigger, lines, isLastSlide) {
      if (isLastSlide) return scrollTrigger;
      return { ...scrollTrigger, onLeave: () => fadeOutOnLeave(lines) };
    }

    function exitSlideLines(lines, section, initialSet = {}) {
      const { range, set, vars } = SECTION_SIX_CONFIG.EXIT;
      gsap.set(lines, { ...set, ...initialSet });
      let lineTween = gsap.to(lines, {
        ...vars,
        scrollTrigger: createSectionSixScrollTrigger(section, range),
      });

      if (lineTween) registry.addTween(lineTween);
    }

    function enterSlideLines(lines, section, enterConfig, isLastSlide) {
      gsap.set(lines, enterConfig.set);
      let lineTween = gsap.to(lines, {
        ...enterConfig.vars,
        scrollTrigger: withLeaveOnLast(
          createSectionSixScrollTrigger(section, enterConfig.range),
          lines,
          isLastSlide,
        ),
      });

      if (lineTween) registry.addTween(lineTween);

    }

    sectionSixSections.forEach((section, index) => {
      const isFirstSlide = index === 0;
      const isLastSlide = index === sectionSixSections.length - 1;
      const heading = section.querySelector(".page-section__title");
      const paragraph = section.querySelector("p");

      const headingSplit = SplitText.create(heading, {
        ...SECTION_SIX_CONFIG.SPLIT_TEXT.LINES,
      });

      SplitText.create(paragraph, {
        ...SECTION_SIX_CONFIG.SPLIT_TEXT.LINES,
        ...SECTION_SIX_CONFIG.SPLIT_TEXT.PARAGRAPH,
        onSplit(self) {
          if (isFirstSlide) {
            exitSlideLines(self.lines, section);
            return;
          }

          enterSlideLines(
            self.lines,
            section,
            SECTION_SIX_CONFIG.PARAGRAPH_ENTER,
            isLastSlide,
          );
        },
      });

      if (isFirstSlide) {
        exitSlideLines(headingSplit.lines, section, { yPercent: 0 });
        return;
      }

      enterSlideLines(
        headingSplit.lines,
        section,
        SECTION_SIX_CONFIG.HEADING_ENTER,
        isLastSlide,
      );
    });
  }

  return {
    name: "section-six",
    type: "gsap-scroll-trigger",
    registry: registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
    },
  };
}
