import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";

gsap.registerPlugin(ScrollTrigger);

/**
 *
 * fonts are ready event
 * animation configurations
 * animation factory
 * create and initialize animations
 * implement with lenis
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

  paragraphs.forEach((paragraph) => {
    SplitText.create(paragraph, {
      type: "lines, words",
      linesClass: "line",
      wordsClass: "word",
    });
  });

  const lines = container.querySelectorAll(".line");
  const containerWidth = container.clientWidth;
  const containerRect = container.getBoundingClientRect();

  lines.forEach((line) => {
    const words = Array.from(line.querySelectorAll(".word"));

    const totalWordsWidth = words.reduce(
      (acc, word) => acc + word.getBoundingClientRect().width,
      0,
    );
    const gaps = words.length - 1;
    const freeSpace = Math.max(containerWidth - totalWordsWidth, 0);
    const rawGapSize = gaps > 0 ? freeSpace / gaps : 0;
    const gapSize = Math.max(
      rawGapSize * FRAME_THREE_SPREAD.gapMultiplier,
      gaps > 0 ? FRAME_THREE_SPREAD.gapMin : 0,
    );

    const spreadWidth = totalWordsWidth + (gaps > 0 ? gapSize * gaps : 0);

    let targetLeft;
    if (FRAME_THREE_SPREAD.origin === "center") {
      targetLeft = (containerWidth - spreadWidth) / 2;
    } else if (FRAME_THREE_SPREAD.origin === "right") {
      targetLeft = containerWidth - spreadWidth;
    } else {
      targetLeft = 0;
    }

    words.forEach((word, index) => {
      const rect = word.getBoundingClientRect();
      const currentLeft = rect.left - containerRect.left;
      const deltaX =
        (targetLeft - currentLeft) * FRAME_THREE_SPREAD.spreadOvershoot;

      gsap.set(word, { x: deltaX });

      targetLeft += rect.width + (index < words.length - 1 ? gapSize : 0);
    });

    gsap.to(words, {
      x: 0,
      ease: "power2.out",
      scrollTrigger: {
        trigger: line,
        start: "top bottom",
        end: "top 60%",
        scrub: 0.2,
        once: true,
      },
    });
  });

  // Frame 4 - Slot Machine Rolly

  document.querySelectorAll("[data-panel='4'] .word").forEach((word) => {
    gsap.to(word.children, {
      yPercent: "+=100", // Increase the y position by 100%
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: word, // Listens to the position of word
        start: "bottom bottom",
        end: "top 55%",
        scrub: 0.4, // Smooth scrubbing, takes 0.4 seconds to complete
      },
    });
  });
});
