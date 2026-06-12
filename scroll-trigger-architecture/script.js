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
  

  
  /*
  *  Header Hero — First Frame
  *
  */


  const hero = document.querySelector(".page-header");
  const heroIcon = hero.querySelector(".page-header__icon");
  const heroTag = hero.querySelector(".page-header__tag");
  const heroHint = hero.querySelector(".page-header__hint");
  const heroHeaders = hero.querySelectorAll(".page-header__titles h1");

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
      ease: "easeOutQuad",
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
      ease: "easeOutQuad",
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
      ease: "easeOutQuad",
    },
  );

  const headerLines = new SplitText(heroHeaders, {
    type: "lines",
    mask: "lines",
    linesClass: "page-header-lines",
  });

  headerLines.lines.forEach((line, i) => {
    const position = i + 1;
    console.log(position);

    const lineCount = position % 2 === 0 ? position : 0;
    // console.log(lineCount);

    gsap.set(line, {
      // opacity: 0,
      yPercent: lineCount ? -100 : 100,
    });

    // console.log(lineCount);
    gsap.to(line, {
      // opacity: 1,
      yPercent: 0,
      duration: 1,
      stagger: 0.02,
      ease: "easeOutQuad", // "easeOutQuart",
    });
  });

  heroTimeline
    .add(tagTimeline, "+=.5")
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5");

  /*
  *  Frame 1: Basic Split Text
  *
  */

  const frameOne = document.querySelector("[data-panel='1']");
  const frameOneHeader = frameOne.querySelector(".page-section__title");
  const frameOneParagraphs = frameOne.querySelectorAll(".page-section__body p");

  const frameOneHeaderChars = new SplitText(frameOneHeader, {
    type: "chars,lines",
    mask: "chars",
  }).chars;

  gsap.set(frameOneHeaderChars, {
    yPercent: 100,
  });

  gsap.to(frameOneHeaderChars, {
    yPercent: 0,
    stagger: 0.01,
    ease: "easeOutQuad",
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
        ease: "easeOutQuad",
        scrollTrigger: {
          trigger: frameOne,
          start: "top 50%",
          end: "center center",
          scrub: true,
        },
      });
    },
  });

  /*
  *  Frame 2: Header and Paragraphs
  *
  */

  const frameTwo = document.querySelector("[data-panel='2']");
  const frameTwoSections = Array.from(
    frameTwo.querySelectorAll(".page-section__group"),
  );

  frameTwoSections.forEach((section) => {
    let header = section.querySelector(".page-section__title");
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

  /*
  *  Frame 3: Star Wars Stretch Effect
  *
  */

  const FRAME_THREE_SPREAD = {
    boundsSelector: ".animation-wide-slide",
    origin: "left", // "left" | "center" | "right"
    gapMin: 8,
    gapMultiplier: 2,
    spreadOvershoot: 0.1,
  };

  const root = document.querySelector("[data-panel='3']");
  const container = root.querySelector(FRAME_THREE_SPREAD.boundsSelector);
  const paragraphs = root.querySelectorAll(
    ".animation-wide-slide p.type-body",
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
          const tween = buildLineSpread(line, FRAME_THREE_SPREAD);
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
    ease: "easeOutQuart",
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
            ease: "easeInOutQuart",
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
    return panelSixTrack.scrollWidth - window.innerWidth;
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

  panelSixSections.forEach((section) => {
    const heading = section.querySelector(".page-section__title");
    const paragraph = section.querySelector("p");

    const headingSplit = SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      linesClass: "anim-line",
    });



    const paragraphSplit = SplitText.create(paragraph, {
      type: "lines",
      mask: "lines",
      linesClass: "anim-line",
      smartSplit: true,
      autoSplit: true,
      onSplit(self) {
        gsap.set(self.lines, { opacity: 0 });

        // TODO: make this appear closer to the center of the scren
        gsap.to(self.lines, {
          opacity: 1,
          stagger: 0.02,
          ease: "easeOutQuad",
          scrollTrigger: {
            trigger: section,
            containerAnimation: panelSixTween,
            start: "left 70%",
            end: "center center",
            scrub: true,
            onLeave: () => {
              gsap.to(self.lines, { opacity: 0, stagger: 0.05, ease: "easeInQuad" });
            },
          },
        });
      },
    });

    gsap.set(headingSplit.lines, { opacity: 0, yPercent: 100 });

    gsap.to(headingSplit.lines, {
      opacity: 1,
      yPercent: 0,
      stagger: 0.03,
      ease: "easeOutQuint",
      scrollTrigger: {
        trigger: section,
        containerAnimation: panelSixTween,
        start: "left 65%",
        end: "center center",
        scrub: true,
        onLeave: () => {
          gsap.to(headingSplit.lines, { opacity: 0, stagger: 0.05, ease: "easeInQuad" });
        },
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
                  target.classList.contains("anim-char-hidden")
                    ? -100
                    : 0,
              },
              {
                yPercent: (i, target) =>
                  target.classList.contains("anim-char-hidden")
                    ? 0
                    : 100,
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
      { autoAlpha: 1, duration: 0.5, ease: "easeOutQuad" },
    )
    .fromTo(
      footerHint,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: "easeOutQuad" },
      "+=0.25",
    )
    .fromTo(
      footerTag,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: "easeOutQuad" },
      ">",
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
