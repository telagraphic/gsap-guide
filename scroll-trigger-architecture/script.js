import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";

gsap.registerPlugin(ScrollTrigger);

document.fonts.ready.then(() => {
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

  console.log(headerLines);
  headerLines.lines.forEach((line, i) => {
    const position = i;

    const lineCount = position % 2 === 0 ? position : 0;
    console.log(lineCount);

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
    .add(tagTimeline, '+=.5')
    .add(hintTimeline, ">-.25")
    .add(iconTimeline, ">-.5");
});



// Running the split text trigger via a timeline to sync with master timeline
// Setting a config for values
// Create a factory for timelines, splittext, scroll trigger
//
