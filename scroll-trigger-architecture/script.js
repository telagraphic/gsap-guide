import gsap from "https://esm.sh/gsap@3.13.0";
import { CustomEase } from "https://esm.sh/gsap@3.13.0/CustomEase";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";

gsap.registerPlugin(CustomEase, ScrollTrigger);

// CSS cubic-bezier → CustomEase (M0,0 C{x1},{y1},{x2},{y2},1,1)
CustomEase.create("easeInQuad", "M0,0 C0.55,0.085,0.68,0.53,1,1");
CustomEase.create("easeInCubic", "M0,0 C0.55,0.055,0.675,0.19,1,1");
CustomEase.create("easeInQuart", "M0,0 C0.895,0.03,0.685,0.22,1,1");
CustomEase.create("easeInQuint", "M0,0 C0.755,0.05,0.855,0.06,1,1");
CustomEase.create("easeInExpo", "M0,0 C0.95,0.05,0.795,0.035,1,1");
CustomEase.create("easeInCirc", "M0,0 C0.6,0.04,0.98,0.335,1,1");

CustomEase.create("easeOutQuad", "M0,0 C0.25,0.46,0.45,0.94,1,1");
CustomEase.create("easeOutCubic", "M0,0 C0.215,0.61,0.355,1,1,1");
CustomEase.create("easeOutQuart", "M0,0 C0.165,0.84,0.44,1,1,1");
CustomEase.create("easeOutQuint", "M0,0 C0.23,1,0.32,1,1,1");
CustomEase.create("easeOutExpo", "M0,0 C0.19,1,0.22,1,1,1");
CustomEase.create("easeOutCirc", "M0,0 C0.075,0.82,0.165,1,1,1");

CustomEase.create("easeInOutQuad", "M0,0 C0.455,0.03,0.515,0.955,1,1");
CustomEase.create("easeInOutCubic", "M0,0 C0.645,0.045,0.355,1,1,1");
CustomEase.create("easeInOutQuart", "M0,0 C0.77,0,0.175,1,1,1");
CustomEase.create("easeInOutQuint", "M0,0 C0.86,0,0.07,1,1,1");
CustomEase.create("easeInOutExpo", "M0,0 C1,0,0,1,1,1");
CustomEase.create("easeInOutCirc", "M0,0 C0.785,0.135,0.15,0.86,1,1");

/**
 *
 * fonts are ready event
 * animation configurations
 * animation factory
 * create and initialize animations
 * create and initialize animations per panel
 *
 */

document.fonts.ready.then(() => {
  /// Header Hero — First Frame
  const hero = document.querySelector(".hero");
  const heroIcon = hero.querySelector(".hero__circle");
  const heroTag = hero.querySelector(".hero__scroll-tag");
  const heroHint = hero.querySelector(".hero__scroll-hint");
  const heroHeaders = hero.querySelectorAll("h1");

  const heroTimeline = gsap.timeline();

  const iconTimeline = gsap.timeline();
  const tagTimeline = gsap.timeline();
  const hintTimeline = gsap.timeline();

  gsap.set(heroIcon, {
    autoAlpha: 0,
  });

  iconTimeline.fromTo(
    heroIcon,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "power2.inOut",
    },
  );

  tagTimeline.fromTo(
    heroTag,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "power2.inOut",
    },
  );

  hintTimeline.fromTo(
    heroHint,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      duration: 0.5,
      ease: "power2.inOut",
    },
  );

  const headerLines = new SplitText(heroHeaders, {
    type: "lines",
    mask: "lines",
    linesClass: "lines++",
  });

  headerLines.lines.forEach((line, i) => {
    const position = i;

    const lineCount = position % 2 === 0 ? position : 0;
    // console.log(lineCount);

    gsap.set(line, {
      opacity: 0,
      yPercent: lineCount ? -100 : 100,
    });

    gsap.to(line, {
      opacity: 1,
      yPercent: 0,
      duration: 1,
      stagger: 0.05,
      ease: "power2.inOut",
    });
  });

  heroTimeline
    .add(tagTimeline, "+=.5")
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5");

  // Frame 1

  const frameOne = document.querySelector("[data-panel='1']");
  const frameOneHeader = frameOne.querySelector("h1");
  const frameOneParagraphs = frameOne.querySelectorAll("p");

  const frameOneHeaderChars = new SplitText(frameOneHeader, {
    type: "chars,lines",
    mask: "chars",
  }).chars;

  gsap.set(frameOneHeaderChars, {
    yPercent: 100,
  });

  gsap.to(frameOneHeaderChars, {
    yPercent: 0,
    stagger: 0.02,
    scrollTrigger: {
      trigger: frameOne,
      start: "top 50%",
    },
  });

  const frameOneParagraphsLines = new SplitText(frameOneParagraphs, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      gsap.set(self.lines, {
        opacity: 0,
        yPercent: 100,
      });

      return gsap.to(self.lines, {
        opacity: 1,
        yPercent: 0,
        stagger: 0.01,
        scrollTrigger: {
          trigger: frameOne,
          start: "top 50%",
          end: "center center",
          scrub: true,
        },
      });
    },
  });

  // Frame 2

  const frameTwo = document.querySelector("[data-panel='2']");
  const frameTwoSections = Array.from(frameTwo.querySelectorAll("section"));
  const frameTwoHeaders = frameTwo.querySelectorAll("h1");
  const frameTwoParagraphs = frameTwo.querySelectorAll("p");

  console.log(frameTwoSections);

  frameTwoSections.forEach((section) => {
    let header = section.querySelector("h1");
    let paragraph = section.querySelector("p");
    // This creates a new split text each loop, instead of all at once
    let paragraphLines = new SplitText(paragraph, {
      type: "lines",
      smartSplit: true,
      linesClass: "paragraph",
    }).lines;

    gsap.set([header, paragraphLines], {
      autoAlpha: 0,
    });

    gsap.to(header, {
      autoAlpha: 1,
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "center center",
        once: true,
      },
    });

    gsap.to(paragraphLines, {
      autoAlpha: 1,
      stagger: 0.1,
      scrollTrigger: {
        trigger: section,
        start: "top center-=120",
        once: true,
      },
    });
  });

  // Frame 3 — justify spread on scroll

  const FRAME_THREE_SPREAD = {
    boundsSelector: ".panel__content",
    origin: "left", // "left" | "center" | "right"
    gapMin: 8,
    gapMultiplier: 2,
    spreadOvershoot: 0.1,
  };

  const root = document.querySelector("[data-panel='3']");
  const container = root.querySelector(FRAME_THREE_SPREAD.boundsSelector);
  const paragraphs = root.querySelectorAll(".panel__body p");

  function buildLineSpread(line, config) {
    const words = Array.from(line.querySelectorAll(".word"));
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
      ease: "easeOutQuad",
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
      linesClass: "line",
      wordsClass: "word",
      autoSplit: true,
      onSplit(self) {
        lineTweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        lineTweens.length = 0;

        self.lines.forEach((line) => {
          const tween = buildLineSpread(line, FRAME_THREE_SPREAD);
          if (tween) lineTweens.push(tween);
        });
      },
    });
  });

  // Frame 4 - Slot Machine Rolly
  // .word is the clip wrapper (panel__content-word-wrapper), not the grid row

  document.querySelectorAll("[data-panel='4'] .word").forEach((word) => {
    gsap.fromTo(
      word.children,
      {
        yPercent: (index, target) =>
          target.classList.contains("word-hidden") ? -100 : 0,
      },
      {
        yPercent: (index, target) =>
          target.classList.contains("word-hidden") ? 0 : 100,
        ease: "easeOutCirc",
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


  // Frame 6 — header character spiral

  const panelSixRoot = document.querySelector("[data-panel='6']");
  const panelSixHeader = panelSixRoot.querySelector(".panel__header");
  const panelSixParagraphs = panelSixRoot.querySelectorAll("p");

  const panelSixParagraphsLines = new SplitText(panelSixParagraphs, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
  });

  gsap.set(panelSixParagraphsLines.lines, {
    opacity: 0,
    yPercent: 100,
    filter: "blur(10px)",
  });

  gsap.to(panelSixParagraphsLines.lines, {
    opacity: 1,
    yPercent: 0,
    ease: "easeOutQuart",
    filter: "blur(0px)",
    stagger: 0.01,
    scrollTrigger: {
      trigger: panelSixRoot,
      start: "top 70%",
      end: "bottom 20%",
      scrub: 1,
    },
  });

  SplitText.create(panelSixHeader, {
    type: "chars",
    charsClass: "panel-six__char",
    tag: "span",
    autoSplit: true,
    onSplit(self) {
      gsap.set(panelSixHeader, { visibility: "visible" });

      self.chars.forEach((charEl) => {
        const text = charEl.textContent;
        charEl.textContent = "";
        charEl.innerHTML = `<span class="panel-six__char-visible">${text}</span><span class="panel-six__char-hidden">${text}</span>`;
      });

      self.chars.forEach((charEl) => {
        gsap.set(charEl.querySelector(".panel-six__char-visible"), { yPercent: 0 });
        gsap.set(charEl.querySelector(".panel-six__char-hidden"), {
          yPercent: -100,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panelSixHeader,
          start: "center 80%",
          end: "top center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.shuffle([...self.chars]).forEach((charEl, index) => {
        const layers = [
          charEl.querySelector(".panel-six__char-hidden"),
          charEl.querySelector(".panel-six__char-visible"),
        ];

        tl.fromTo(
          layers,
          {
            yPercent: (i, target) =>
              target.classList.contains("panel-six__char-hidden") ? -100 : 0,
          },
          {
            yPercent: (i, target) =>
              target.classList.contains("panel-six__char-hidden") ? 0 : 100,
            ease: "easeInOutQuart",
            duration: 1,
          },
          index * 0.05,
        );
      });

      return tl;
    },
  });

  // Frame 8 — horizontal scroll

  const panelEight = document.querySelector("[data-panel='8']");
  const panelEightTrack = panelEight.querySelector(".panel__content");

  function getPanelEightScrollDistance() {
    return panelEightTrack.scrollWidth - window.innerWidth;
  }

  gsap.to(panelEightTrack, {
    x: () => -getPanelEightScrollDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: panelEight,
      pin: true,
      scrub: 1,
      start: "top top",
      end: () => "+=" + getPanelEightScrollDistance(),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Frame 9 — letter spiral list

  document.querySelectorAll("[data-panel='9'] .panel-nine__line").forEach((line) => {
    SplitText.create(line, {
      type: "chars",
      charsClass: "panel-nine__char",
      tag: "span",
      autoSplit: true,
      onSplit(self) {
        gsap.set(line, { visibility: "visible" });

        self.chars.forEach((charEl) => {
          const text = charEl.textContent;
          charEl.textContent = "";
          charEl.innerHTML = `<span class="panel-nine__char-visible">${text}</span><span class="panel-nine__char-hidden">${text}</span>`;
        });

        self.chars.forEach((charEl) => {
          gsap.set(charEl.querySelector(".panel-nine__char-visible"), {
            yPercent: 0,
          });
          gsap.set(charEl.querySelector(".panel-nine__char-hidden"), {
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
            charEl.querySelector(".panel-nine__char-hidden"),
            charEl.querySelector(".panel-nine__char-visible"),
          ];

          tl.fromTo(
            layers,
            {
              yPercent: (i, target) =>
                target.classList.contains("panel-nine__char-hidden") ? -100 : 0,
            },
            {
              yPercent: (i, target) =>
                target.classList.contains("panel-nine__char-hidden") ? 0 : 100,
              ease: "easeInOutQuart",
              duration: 1,
            },
            index * 0.05,
          );
        });

        return tl;
      },
    });
  });


  // Frame 10 — staggered waterfall cascade

  function wrapPhraseChars(element) {
    const text = element.textContent;
    element.innerHTML = text
      .split("")
      .map((char) =>
        char === " "
          ? "<span> </span>"
          : `<span class="panel__phrase-char">${char}</span>`,
      )
      .join("");
  }

  function buildPhraseLayers(item) {
    const text = item.dataset.phrase ?? item.textContent.trim();
    item.dataset.phrase = text;
    item.replaceChildren();

    const hidden = document.createElement("span");
    hidden.className = "panel__phrase-hidden";
    hidden.textContent = text;

    const visible = document.createElement("span");
    visible.className = "panel__phrase-visible";
    visible.textContent = text;

    item.append(hidden, visible);
    wrapPhraseChars(hidden);
    wrapPhraseChars(visible);
  }

  function getPhraseCharIndex(child) {
    return Array.from(child.parentNode.children).indexOf(child);
  }

  function rebuildPanelTenPhrases() {
    document
      .querySelectorAll("[data-panel='10'] .panel__phrase-item")
      .forEach((item) => {
        gsap.killTweensOf(item.querySelectorAll("span"));
        item.classList.remove("panel__phrase-item--hovered");
        buildPhraseLayers(item);
        gsap.set(item, { visibility: "visible" });
      });
  }

  function attachPhraseHover(item) {
    item.addEventListener("mouseover", (e) => {
      const visibleChars = item.querySelectorAll(".panel__phrase-visible span");
      const hiddenChars = item.querySelectorAll(".panel__phrase-hidden span");

      if (
        !gsap.isTweening(visibleChars) &&
        item.classList.contains("panel__phrase-item--hovered")
      ) {
        item.classList.remove("panel__phrase-item--hovered");
      }

      if (e.target.classList.contains("panel__phrase-char")) {
        item.classList.add("panel__phrase-item--hovered");
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
    .querySelectorAll("[data-panel='10'] .panel__phrase-item")
    .forEach((item) => {
      buildPhraseLayers(item);
      gsap.set(item, { visibility: "visible" });
      attachPhraseHover(item);
    });

  ScrollTrigger.addEventListener("refreshInit", rebuildPanelTenPhrases);
});
