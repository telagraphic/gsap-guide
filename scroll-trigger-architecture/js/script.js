import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import {
  EASEOUTQUAD,
  EASEOUTCIRC,
  EASEOUTQUART,
  EASEINQUAD,
  EASEOUTQUINT,
  EASEINOUTQUART,
  EASEINOUTQUINT,
} from "./easings.js";
import { removePrehideClasses } from "./utils.js";
gsap.registerPlugin(ScrollTrigger);

document.fonts.ready.then(() => {
  // const TIMELINE = [
  //   sectionOneTimeline(),
  //   sectionTwoTimeline(),
  //   sectionThreeTimeline(),
  // ]

  /* ─────────────────────────────────────────────────────────
   * HERO STORYBOARD
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

  const HERO_CONFIG = {
    SELECTORS: {
      HEADER: ".page-header",
      ICON: ".page-header__icon",
      TAG: ".page-header__tag",
      HINT: ".page-header__hint",
      HEADER_TITLES: ".page-header__titles",
      HEADER_TITLE: ".page-header__titles h1",
    },
    HERO: {
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

  const hero = document.querySelector(HERO_CONFIG.SELECTORS.HEADER);
  const heroIcon = hero.querySelector(HERO_CONFIG.SELECTORS.ICON);
  const heroTag = hero.querySelector(HERO_CONFIG.SELECTORS.TAG);
  const heroHint = hero.querySelector(HERO_CONFIG.SELECTORS.HINT);
  const heroHeaders = hero.querySelector(HERO_CONFIG.SELECTORS.HEADER_TITLES);

  const heroTimeline = gsap.timeline();
  const iconTimeline = gsap.timeline();
  const tagTimeline = gsap.timeline();
  const hintTimeline = gsap.timeline();
  const linesTimeline = gsap.timeline();

  iconTimeline.to(heroIcon, HERO_CONFIG.HERO.TIMELINE);
  tagTimeline.to(heroTag, HERO_CONFIG.TAG.TIMELINE);
  hintTimeline.to(heroHint, HERO_CONFIG.HINT.TIMELINE);

  const headerLines = new SplitText(
    heroHeaders.querySelectorAll(HERO_CONFIG.SELECTORS.HEADER_TITLE),
    HERO_CONFIG.HEADER_TITLE.SPLIT_TEXT,
  );

  headerLines.lines.forEach((line, i) => {
    const position = i + 1;
    const fromY = position % 2 === 0 ? position * -100 : 100; // your logic
    gsap.set(line, { yPercent: fromY });
  });

  linesTimeline.to(headerLines.lines, HERO_CONFIG.HEADER_TITLE.TIMELINE);

  /**
   * Master Timeline Orchestrator
   *
   **/

  heroTimeline
    .call(removePrehideClasses, [heroHeaders])
    .add(linesTimeline, "+=0.5")
    .add(tagTimeline, "+=.5")
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5")
    .call(removePrehideClasses, [heroIcon, heroTag, heroHint])
    .play();

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

  const sectionOne = document.querySelector(
    SECTION_ONE_CONFIG.SELECTORS.SECTION,
  );
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

  const sectionTwo = document.querySelector(
    SECTION_TWO_CONFIG.SELECTORS.SECTION,
  );
  const sectionTwoGroups = Array.from(
    sectionTwo.querySelectorAll(SECTION_TWO_CONFIG.SELECTORS.GROUPS),
  );

  sectionTwoGroups.forEach((group) => {
    let header = group.querySelector(SECTION_TWO_CONFIG.SELECTORS.HEADER);
    let paragraph = group.querySelector(SECTION_TWO_CONFIG.SELECTORS.PARAGRAPH);
    let paragraphLines = new SplitText(paragraph, {
      type: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.type,
      mask: SECTION_TWO_CONFIG.PARAGRAPH.SPLIT_TEXT.mask,
      autoSplit: true,
      revert: true,
    }).lines;

    gsap.set(paragraphLines, {
      opacity: 0,
    });

    gsap.to(header, {
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

    gsap.to(paragraphLines, {
      opacity: 1,
      stagger: 0.1,
      scrollTrigger: {
        trigger: group,
        start: "top center-=120",
        once: true,
      },
    });
  });

  /* ─────────────────────────────────────────────────────────
   * SECTION 3 STORYBOARD  (per line)
   *
   *     before   words sitting wide across the frame
   * bottom→60%   words draw together, tied to scroll
   *
   * CONFIG  (WIDE_SLIDE_CONFIG)
   *   boundsSelector    wider container → more free space → wider gaps
   *   origin            left | center | right — spread anchor before settle
   *   gapMultiplier   + wider word gaps at start    − tighter spread
   *   gapMin          + higher floor gap (short lines)  − gaps can shrink
   *   spreadOvershoot + stronger x offset (0–1)     − subtler (0 = off)
   *
   * ─────────────────────────────────────────────────────────
   *
   * PATTERN: ScrollTrigger drives wide slide text effect
   * CSS: .anim-line max-content — lines don't reflow; GSAP scrubs x on .anim-word
   *
   * ───────────────────────────────────────────────────────── */

  const WIDE_SLIDE_CONFIG = {
    boundsSelector: ".page-section__content",
    origin: "left",
    gapMin: 8,
    gapMultiplier: 2,
    spreadOvershoot: 0.1,
  };

  const SECTION_THREE_CONFIG = {
    SELECTORS: {
      SECTION: "[data-section='3']",
      CONTENTS: ".page-section__content",
      PARAGRAPHS: ".animation-wide-slide p.type-body",
    },
    WORDS: {
      SCROLL_TRIGGER: {
        start: "top bottom",
        end: "top 60%",
        scrub: 0.2,
        invalidateOnRefresh: true,
      },
    },
  };

  const root = document.querySelector(SECTION_THREE_CONFIG.SELECTORS.SECTION);
  const container = root.querySelector(SECTION_THREE_CONFIG.SELECTORS.CONTENTS);
  const paragraphs = root.querySelectorAll(
    SECTION_THREE_CONFIG.SELECTORS.PARAGRAPHS,
  );

  function buildLineSpread(line, config) {
    const words = Array.from(line.querySelectorAll(".anim-word"));
    if (!words.length) return null;

    const containerWidth = container.clientWidth;
    const containerRect = container.getBoundingClientRect();

    const totalWordsWidth = words.reduce(
      (acc, word) => acc + word.getBoundingClientRect().width,
      0,
    );
    const gaps = words.length - 1;
    const freeSpace = Math.max(containerWidth - totalWordsWidth, 0);
    const rawGapSize = gaps > 0 ? freeSpace / gaps : 0;
    const gapSize = Math.max(
      rawGapSize * config.gapMultiplier,
      gaps > 0 ? config.gapMin : 0,
    );

    const spreadWidth = totalWordsWidth + (gaps > 0 ? gapSize * gaps : 0);

    let targetLeft;
    if (config.origin === "center") {
      targetLeft = (containerWidth - spreadWidth) / 2;
    } else if (config.origin === "right") {
      targetLeft = containerWidth - spreadWidth;
    } else {
      targetLeft = 0;
    }

    words.forEach((word, index) => {
      const rect = word.getBoundingClientRect();
      const currentLeft = rect.left - containerRect.left;
      const deltaX = (targetLeft - currentLeft) * config.spreadOvershoot;

      gsap.set(word, { x: deltaX });
      targetLeft += rect.width + (index < words.length - 1 ? gapSize : 0);
    });

    return gsap.to(words, {
      x: 0,
      ease: EASEOUTQUAD,
      scrollTrigger: {
        trigger: line,
        start: SECTION_THREE_CONFIG.WORDS.SCROLL_TRIGGER.start,
        end: SECTION_THREE_CONFIG.WORDS.SCROLL_TRIGGER.end,
        scrub: SECTION_THREE_CONFIG.WORDS.SCROLL_TRIGGER.scrub,
        invalidateOnRefresh:
          SECTION_THREE_CONFIG.WORDS.SCROLL_TRIGGER.invalidateOnRefresh,
      },
    });
  }

  function buildParagraphLines() {
    paragraphs.forEach((paragraph) => {
      const lineTweens = [];

      SplitText.create(paragraph, {
        type: "lines, words",
        linesClass: "anim-line",
        wordsClass: "anim-word",
        autoSplit: true,
        onSplit(self) {
          lineTweens.forEach((tween) => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
          lineTweens.length = 0;

          self.lines.forEach((line) => {
            const tween = buildLineSpread(line, WIDE_SLIDE_CONFIG);
            if (tween) lineTweens.push(tween);
          });
        },
      });
    });
  }

  buildParagraphLines();

  /* ─────────────────────────────────────────────────────────
   * SECTION 4 STORYBOARD  (per row)
   *
   *     before   visible label sitting in clip window
   * 60%→top top   hidden rolls in, visible rolls out — slot shuffle
   *
   * ─────────────────────────────────────────────────────────
   *
   * PATTERN: ScrollTrigger scrubs dual-span yPercent per track
   * CSS: .anim-clip-slot masks window; .anim-char-hidden stacked above visible
   *
   * ───────────────────────────────────────────────────────── */

  const SECTION_FOUR_CONFIG = {
    SELECTORS: {
      SECTION: "[data-section='4']",
      TRACKS: ".animation-slot-machine-roll__track",
    },
    SCROLL_TRIGGER: {
      start: "center 60%",
      end: "top top",
      scrub: 0.4,
      invalidateOnRefresh: true,
    },
  };

  const sectionFour = document.querySelector(
    SECTION_FOUR_CONFIG.SELECTORS.SECTION,
  );
  const sectionFourTracks = sectionFour.querySelectorAll(
    SECTION_FOUR_CONFIG.SELECTORS.TRACKS,
  );

  const { start, end, scrub, invalidateOnRefresh } =
    SECTION_FOUR_CONFIG.SCROLL_TRIGGER;

  sectionFourTracks.forEach((word) => {
    gsap.fromTo(
      word.children,
      {
        yPercent: (index, target) =>
          target.classList.contains("anim-char-hidden") ? -100 : 0,
      },
      {
        yPercent: (index, target) =>
          target.classList.contains("anim-char-hidden") ? 0 : 100,
        ease: EASEOUTCIRC,
        scrollTrigger: {
          trigger: word,
          start,
          end,
          scrub,
          invalidateOnRefresh,
        },
      },
    );
  });

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
    }
  };

  const sectionFive = document.querySelector(SECTION_FIVE_CONFIG.SELECTORS.SECTION);
  const sectionFiveHeader = sectionFive.querySelector(SECTION_FIVE_CONFIG.SELECTORS.TITLE);
  const sectionFiveParagraphs = sectionFive.querySelectorAll(SECTION_FIVE_CONFIG.SELECTORS.PARAGRAPHS);

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

  // Title char slot roll

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

  const sectionSix = document.querySelector(SECTION_SIX_CONFIG.SELECTORS.SECTION);
  const sectionSixTrack = sectionSix.querySelector(SECTION_SIX_CONFIG.SELECTORS.TRACK);
  const sectionSixSections = sectionSix.querySelectorAll(SECTION_SIX_CONFIG.SELECTORS.SLIDES);

  function getPanelSixScrollDistance() {
    const slides = sectionSixSections;
    const lastSlide = slides[slides.length - 1];

    // Last slide's right edge aligned to the pinned panel — avoids scrollWidth /
    // window.innerWidth drift with 100vw slides and scrollbar width.
    return lastSlide.offsetLeft + lastSlide.offsetWidth - sectionSix.clientWidth;
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
    gsap.to(lines, {
      ...vars,
      scrollTrigger: createSectionSixScrollTrigger(section, range),
    });
  }

  function enterSlideLines(lines, section, enterConfig, isLastSlide) {
    gsap.set(lines, enterConfig.set);
    gsap.to(lines, {
      ...enterConfig.vars,
      scrollTrigger: withLeaveOnLast(
        createSectionSixScrollTrigger(section, enterConfig.range),
        lines,
        isLastSlide,
      ),
    });
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
        char === " " ? "<span> </span>" : `<span class="${CHAR}">${char}</span>`,
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

  /* ─────────────────────────────────────────────────────────
   * FOOTER STORYBOARD
   *
   *     before   tag, title, hint at opacity 0 (page.css)
   *  on enter   title fades in, then hint + tag stagger
   *  on leave   timeline reverses, clearProps restores CSS hide
   *
   * ─────────────────────────────────────────────────────────
   *
   * PATTERN: staggered opacity timeline + ScrollTrigger play/reverse
   * PREHIDE: component CSS opacity — not anim-prehide (see REFACTOR.md Pattern C)
   *
   * ───────────────────────────────────────────────────────── */

  const footer = document.querySelector(".page-footer");
  const footerTag = footer.querySelectorAll(".page-footer__tag");
  const footerHint = footer.querySelectorAll(".page-footer__hint");
  const footerTitle = footer.querySelector(".page-footer__title");
  const footerTargets = [...footerTag, ...footerHint, footerTitle];

  function resetFooter() {
    gsap.set(footerTargets, { clearProps: "opacity" });
  }

  const footerTimeline = gsap.timeline({
    paused: true,
    onComplete: () => removePrehideClasses(...footerTargets),
    onReverseComplete: resetFooter,
  });

  footerTimeline
    .to(footerTitle, {
      opacity: 1,
      duration: 0.5,
      ease: EASEOUTQUAD,
    })
    .to(
      footerHint,
      { opacity: 1, duration: 0.5, ease: EASEOUTQUAD },
      "+=0.25",
    )
    .to(
      footerTag,
      { opacity: 1, duration: 0.5, ease: EASEOUTQUAD },
      "<",
    );

  ScrollTrigger.create({
    trigger: footer,
    start: "top center-=300",
    end: "bottom 20%",
    onEnter: () => footerTimeline.play(),
    onLeave: () => footerTimeline.reverse(),
    onEnterBack: () => footerTimeline.play(),
    onLeaveBack: () => footerTimeline.reverse(),
  });

  ScrollTrigger.refresh();
});
