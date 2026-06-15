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


  const TIMELINE = [
    sectionOneTimeline(),
    sectionTwoTimeline(),
    sectionThreeTimeline(),
  ]




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
        TYPE: "lines",
        MASK: "lines",
        LINES_CLASS: "page-header-lines",
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
    {
      type: "lines",
      mask: "lines",
      linesClass: "page-header-lines",
    },
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
      SECTION: "[data-panel='1']",
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

  const sectionOne = document.querySelector(SECTION_ONE_CONFIG.SELECTORS.SECTION);
  const sectionOneHeader = sectionOne.querySelector(SECTION_ONE_CONFIG.SELECTORS.HEADER);
  const sectionOneParagraphs = sectionOne.querySelectorAll(SECTION_ONE_CONFIG.SELECTORS.PARAGRAPHS);

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
      SECTION: "[data-panel='2']",
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
  }



  const sectionTwo = document.querySelector(SECTION_TWO_CONFIG.SELECTORS.SECTION);
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
   * ───────────────────────────────────────────────────────── */

  const SECTION_3_CONFIG = {
    boundsSelector: ".page-section__content",
    origin: "left", // "left" | "center" | "right"
    gapMin: 8,
    gapMultiplier: 2,
    spreadOvershoot: 0.1,
  };

  const root = document.querySelector("[data-panel='3']");
  const container = root.querySelector(SECTION_3_CONFIG.boundsSelector);
  const paragraphs = root.querySelectorAll(".animation-wide-slide p.type-body");

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
        start: "top bottom",
        end: "top 60%",
        scrub: 0.2,
        invalidateOnRefresh: true,
      },
    });
  }

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
          const tween = buildLineSpread(line, SECTION_3_CONFIG);
          if (tween) lineTweens.push(tween);
        });
      },
    });
  });

  /*
   *  Frame 4: Slot Machine Rolling Effect
   *
   */

  document
    .querySelectorAll("[data-panel='4'] .animation-slot-machine-roll__track")
    .forEach((word) => {
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
            trigger: word, // Clip wrapper — listens to the position of each word row
            start: "center 60%",
            end: "top top",
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        },
      );
    });

  /*
   *  Frame 5: Character Waterfall Cascade
   *
   */

  const panelFiveRoot = document.querySelector("[data-panel='5']");
  const panelFiveHeader = panelFiveRoot.querySelector(".page-section__title");
  const panelFiveParagraphs = panelFiveRoot.querySelectorAll("p");

  const panelFiveParagraphsLines = new SplitText(panelFiveParagraphs, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
  });

  gsap.set(panelFiveParagraphsLines.lines, {
    opacity: 0,
    yPercent: 100,
    filter: "blur(10px)",
  });

  gsap.to(panelFiveParagraphsLines.lines, {
    opacity: 1,
    yPercent: 0,
    ease: EASEOUTQUART,
    filter: "blur(0px)",
    stagger: 0.01,
    scrollTrigger: {
      trigger: panelFiveRoot,
      start: "top 70%",
      end: "bottom 20%",
      scrub: 1,
    },
  });

  SplitText.create(panelFiveHeader, {
    type: "chars",
    charsClass: "anim-char-parent",
    tag: "span",
    autoSplit: true,
    onSplit(self) {
      panelFiveHeader.classList.remove("anim-prehide");

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
          trigger: panelFiveHeader,
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

  /*
   *  Frame 6: Horizontal Scroll
   *
   */

  const panelSix = document.querySelector("[data-panel='6']");
  const panelSixTrack = panelSix.querySelector(".page-section__track");
  const panelSixSections = panelSix.querySelectorAll(".page-section__slide");

  function getPanelSixScrollDistance() {
    const slides = panelSixSections;
    const lastSlide = slides[slides.length - 1];

    // Last slide's right edge aligned to the pinned panel — avoids scrollWidth /
    // window.innerWidth drift with 100vw slides and scrollbar width.
    return lastSlide.offsetLeft + lastSlide.offsetWidth - panelSix.clientWidth;
  }

  const panelSixTween = gsap.to(panelSixTrack, {
    x: () => -getPanelSixScrollDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: panelSix,
      pin: true,
      scrub: 1,
      start: "top top",
      end: () => "+=" + getPanelSixScrollDistance(),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  panelSixSections.forEach((section, index) => {
    const isFirstSlide = index === 0;
    const isLastSlide = index === panelSixSections.length - 1;
    const heading = section.querySelector(".page-section__title");
    const paragraph = section.querySelector("p");

    // Slides 2+ enter from the right; restored pre-refactor end values.
    const headingRange = { start: "left 65%", end: "left 25%" };
    const paragraphRange = { start: "left 70%", end: "left 30%" };

    const headingSplit = SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      linesClass: "anim-line",
    });

    SplitText.create(paragraph, {
      type: "lines",
      mask: "lines",
      linesClass: "anim-line",
      smartSplit: true,
      autoSplit: true,
      onSplit(self) {
        if (isFirstSlide) {
          gsap.set(self.lines, { opacity: 1 });

          gsap.to(self.lines, {
            opacity: 0,
            stagger: 0.05,
            ease: EASEINQUAD,
            scrollTrigger: {
              trigger: section,
              containerAnimation: panelSixTween,
              start: "right center",
              end: "left left",
              scrub: true,
            },
          });
          return;
        }

        gsap.set(self.lines, { opacity: 0 });

        gsap.to(self.lines, {
          opacity: 1,
          stagger: 0.02,
          ease: EASEOUTQUAD,
          scrollTrigger: {
            trigger: section,
            containerAnimation: panelSixTween,
            ...paragraphRange,
            scrub: true,
            ...(isLastSlide
              ? {}
              : {
                  onLeave: () => {
                    gsap.to(self.lines, {
                      opacity: 0,
                      stagger: 0.05,
                      ease: EASEINQUAD,
                    });
                  },
                }),
          },
        });
      },
    });

    if (isFirstSlide) {
      gsap.set(headingSplit.lines, { opacity: 1, yPercent: 0 });

      gsap.to(headingSplit.lines, {
        opacity: 0,
        stagger: 0.05,
        ease: EASEINQUAD,
        scrollTrigger: {
          trigger: section,
          containerAnimation: panelSixTween,
          start: "right center",
          end: "left left",
          scrub: true,
        },
      });
      return;
    }

    gsap.set(headingSplit.lines, { opacity: 0, yPercent: 100 });

    gsap.to(headingSplit.lines, {
      opacity: 1,
      yPercent: 0,
      stagger: 0.03,
      ease: EASEOUTQUINT,
      scrollTrigger: {
        trigger: section,
        containerAnimation: panelSixTween,
        ...headingRange,
        scrub: true,
        ...(isLastSlide
          ? {}
          : {
              onLeave: () => {
                gsap.to(headingSplit.lines, {
                  opacity: 0,
                  stagger: 0.05,
                  ease: EASEINQUAD,
                });
              },
            }),
      },
    });
  });

  /*
   *  Frame 7: Letter Spiral List
   *
   */

  document
    .querySelectorAll("[data-panel='7'] .animation-character-waterdrop__item")
    .forEach((line) => {
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

  /*
   *  Frame 8: Staggered Waterfall Cascade
   *
   */

  function wrapPhraseChars(element) {
    const text = element.textContent;
    element.innerHTML = text
      .split("")
      .map((char) =>
        char === " "
          ? "<span> </span>"
          : `<span class="animation-character-ripple__char">${char}</span>`,
      )
      .join("");
  }

  function buildPhraseLayers(item) {
    const text = item.dataset.phrase ?? item.textContent.trim();
    item.dataset.phrase = text;
    item.replaceChildren();

    const hidden = document.createElement("span");
    hidden.className =
      "animation-character-ripple__layer animation-character-ripple__layer--hidden";
    hidden.textContent = text;

    const visible = document.createElement("span");
    visible.className =
      "animation-character-ripple__layer animation-character-ripple__layer--visible";
    visible.textContent = text;

    item.append(hidden, visible);
    wrapPhraseChars(hidden);
    wrapPhraseChars(visible);
  }

  function getPhraseCharIndex(child) {
    return Array.from(child.parentNode.children).indexOf(child);
  }

  function rebuildPanelEightPhrases() {
    document
      .querySelectorAll("[data-panel='8'] .animation-character-ripple__item")
      .forEach((item) => {
        gsap.killTweensOf(item.querySelectorAll("span"));
        item.classList.remove("animation-character-ripple__item--hovered");
        buildPhraseLayers(item);
        item.classList.remove("anim-prehide");
      });
  }

  function attachPhraseHover(item) {
    item.addEventListener("mouseover", (e) => {
      const visibleChars = item.querySelectorAll(
        ".animation-character-ripple__layer--visible span",
      );
      const hiddenChars = item.querySelectorAll(
        ".animation-character-ripple__layer--hidden span",
      );

      if (
        !gsap.isTweening(visibleChars) &&
        item.classList.contains("animation-character-ripple__item--hovered")
      ) {
        item.classList.remove("animation-character-ripple__item--hovered");
      }

      if (e.target.classList.contains("animation-character-ripple__char")) {
        item.classList.add("animation-character-ripple__item--hovered");
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

  document
    .querySelectorAll("[data-panel='8'] .animation-character-ripple__item")
    .forEach((item) => {
      buildPhraseLayers(item);
      item.classList.remove("anim-prehide");
      attachPhraseHover(item);
    });

  ScrollTrigger.addEventListener("refreshInit", rebuildPanelEightPhrases);

  /*
   *  Footer
   *
   */

  const footer = document.querySelector(".page-footer");
  const footerTag = footer.querySelectorAll(".page-footer__tag");
  const footerHint = footer.querySelectorAll(".page-footer__hint");
  const footerTitle = footer.querySelector(".page-footer__title");
  const footerTargets = [...footerTag, ...footerHint, footerTitle];

  function hideFooter() {
    footerTargets.forEach((el) => el.classList.add("anim-prehide"));
  }

  function showFooterForTween() {
    footerTargets.forEach((el) => el.classList.remove("anim-prehide"));
    gsap.set(footerTargets, { autoAlpha: 0 });
  }

  const footerTimeline = gsap.timeline({
    paused: true,
    onReverseComplete: hideFooter,
  });

  footerTimeline
    .call(showFooterForTween)
    .fromTo(
      footerTitle,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: EASEOUTQUAD },
    )
    .fromTo(
      footerHint,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: EASEOUTQUAD },
      "+=0.25",
    )
    .fromTo(
      footerTag,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: EASEOUTQUAD },
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
