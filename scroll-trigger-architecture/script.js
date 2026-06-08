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
  const frameTwoHeaders = frameTwo.querySelectorAll("h1");
  const frameTwoParagraphs = frameTwo.querySelectorAll("p");


  
});
