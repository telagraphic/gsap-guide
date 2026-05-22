/**
 * GSAP SplitText headline demos (basics/index.html).
 * Split type is fixed per frame — tune typography via SplitTextPlayground only.
 */

gsap.registerPlugin(SplitText, ScrollTrigger);

/** Default headline split; frames 2–6 use this unless noted in create(). */
const HEADLINE_SPLIT = "words";

/**
 * Playground entry point: builds all SplitText demos, returns teardown for rebuilds.
 * Called by SplitTextPlayground.attach({ init: setupPlayground }).
 * _settings = typography from the panel (optional to use in animation logic).
 */
function setupPlayground(_settings) {
  const tweenTargets = ".split-target, .split-target *";

  // Frame 2 — mask reveal
  const frameTwo = SplitText.create(".frame--2 h1", {
    type: HEADLINE_SPLIT,
    mask: HEADLINE_SPLIT,
    autoSplit: true,
    smartSplit: true,
    onSplit: (self) => {
      const els = self.words;
      gsap.set(els, { yPercent: 100 });
      return gsap.to(els, {
        yPercent: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".frame--2",
          start: "top 20%",
          end: "top top",
          scrub: true,
        },
      });
    },
  });

  // Frame 3 — blur stagger
  const frameThree = SplitText.create(".frame--3 h1", { type: HEADLINE_SPLIT });
  const frameThreeEls = frameThree.words;
  gsap.set(frameThreeEls, { opacity: 0, y: 100, filter: "blur(15px)" });
  gsap.to(frameThreeEls, {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    stagger: 0.03,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".frame--3",
      start: "top 25%",
      end: "top top",
      scrub: true,
    },
  });

  // Frame 4 — opacity / blur reveal
  const frameFour = SplitText.create(".frame--4 h1", {
    type: HEADLINE_SPLIT,
    autoSplit: true,
    smartSplit: true,
    onSplit: (self) => {
      const els = self.words;
      gsap.set(els, { opacity: 0, y: 40, filter: "blur(15px)" });
      return gsap.to(els, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.03,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".frame--4",
          start: "top 25%",
          end: "top top",
          scrub: true,
        },
      });
    },
  });

  // Frame 5 — stagger reveal
  const frameFive = SplitText.create(".frame--5 h1", {
    type: HEADLINE_SPLIT,
    autoSplit: true,
    smartSplit: true,
    onSplit: (self) => {
      const els = self.words;
      gsap.set(els, { opacity: 0, y: 100, filter: "blur(15px)" });
      return gsap.to(els, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.03,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".frame--5",
          start: "top 25%",
          end: "top top",
          scrub: true,
        },
      });
    },
  });

  // Frame 6 — mask reveal
  const frameSix = SplitText.create(".frame--6 h1", {
    type: HEADLINE_SPLIT,
    autoSplit: true,
    smartSplit: true,
    mask: HEADLINE_SPLIT,
    onSplit: (self) => {
      const els = self.words;
      gsap.set(els, { yPercent: 100 });
      return gsap.to(els, {
        yPercent: 0,
        duration: 1,
        ease: "power2.out",
        stagger: {
          amount: 0.1,
          from: "start",
        },
        scrollTrigger: {
          trigger: ".frame--6",
          start: "top 25%",
          end: "top top",
          scrub: true,
        },
      });
    },
  });

  const splits = [frameTwo, frameThree, frameFour, frameFive, frameSix];

  return function teardown() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf(tweenTargets);
    splits.forEach((split) => {
      if (split && typeof split.revert === "function") split.revert();
      if (split && typeof split.kill === "function") split.kill();
    });
  };
}

window.setupPlayground = setupPlayground;

if (!window.__splitTextPlaygroundAttach) {
  document.fonts.ready.then(() => setupPlayground());
}
