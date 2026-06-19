import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEOUTQUART, EASEINOUTQUART} from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * SECTION 5 STORYBOARD
 *
 *  top 70%→20%   body lines rise in, blur clears, staggered
 * center→center  title chars shuffle-roll in, random order
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: ScrollTrigger scrubs line waterfall + shuffled char timeline
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
};

export function createSectionFive() {
  const registry = createRegistry();

  function createTweens() {
    registry.resetAnimations();

    const sectionFive = document.querySelector(
      SECTION_FIVE_CONFIG.SELECTORS.SECTION,
    );
    const sectionFiveHeader = sectionFive.querySelector(
      SECTION_FIVE_CONFIG.SELECTORS.TITLE,
    );
    const sectionFiveParagraphs = sectionFive.querySelectorAll(
      SECTION_FIVE_CONFIG.SELECTORS.PARAGRAPHS,
    );

    const { FROM, TO } = SECTION_FIVE_CONFIG.PARAGRAPHS.TIMELINE;

    // Body line waterfall

    const sectionFiveParagraphsLines = new SplitText(sectionFiveParagraphs, {
      ...SECTION_FIVE_CONFIG.PARAGRAPHS.SPLIT_TEXT,
    });

    gsap.set(sectionFiveParagraphsLines.lines, FROM);

    gsap.to(sectionFiveParagraphsLines.lines, {
      ...TO,
      scrollTrigger: {
        trigger: sectionFive,
        ...SECTION_FIVE_CONFIG.PARAGRAPHS.SCROLL_TRIGGER,
      },
    });

    const SLOT_ROLL_FROM = {
      yPercent: (_, target) =>
        target.classList.contains("anim-char-hidden") ? -100 : 0,
    };

    const SLOT_ROLL_TO = {
      yPercent: (_, target) =>
        target.classList.contains("anim-char-hidden") ? 0 : 100,
    };

    function wrapCharsWithDualSpans(chars) {
      chars.forEach((charEl) => {
        const text = charEl.textContent;
        charEl.textContent = "";
        charEl.innerHTML = `<span class="anim-char-visible">${text}</span><span class="anim-char-hidden">${text}</span>`;
      });
    }

    // Set in css?
    function setSlotRollInitial(chars) {
      chars.forEach((charEl) => {
        gsap.set(charEl.querySelector(".anim-char-visible"), { yPercent: 0 });
        gsap.set(charEl.querySelector(".anim-char-hidden"), { yPercent: -100 });
      });
    }

    function appendSlotRollsToTimeline(timeline, chars, options = {}) {
      const { stagger = 0.05, ease, duration = 1, shuffle = false } = options;
      const ordered = shuffle ? gsap.utils.shuffle([...chars]) : [...chars];

      ordered.forEach((charEl, index) => {
        timeline.fromTo(
          [
            charEl.querySelector(".anim-char-hidden"),
            charEl.querySelector(".anim-char-visible"),
          ],
          SLOT_ROLL_FROM,
          { ...SLOT_ROLL_TO, ease, duration },
          index * stagger,
        );
      });
    }

    SplitText.create(sectionFiveHeader, {
      type: "chars",
      charsClass: "anim-char-parent",
      tag: "span",
      autoSplit: true,
      onSplit(self) {
        removePrehideClasses(sectionFiveHeader);
        wrapCharsWithDualSpans(self.chars);
        setSlotRollInitial(self.chars);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionFiveHeader,
            start: "center 80%",
            end: "top 20%",
            ease: EASEINOUTQUART,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        appendSlotRollsToTimeline(tl, self.chars, { ease: EASEINOUTQUART });

        return tl;
      },
    });
  }

  return {
    name: "section-five",
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
