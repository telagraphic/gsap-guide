/**
 * GSAP SplitText starter — add your animation code here.
 *
 * Suggested first steps:
 * - gsap.registerPlugin(SplitText, ScrollTrigger);
 * - await document.fonts.ready before splitting
 * - SplitText.create(target, { type: "chars" | "words" | "lines" })
 * - return () => split.revert() for cleanup
 */

gsap.registerPlugin(SplitText, ScrollTrigger);

document.fonts.ready.then(() => {
  // Frame 2
  SplitText.create(".frame--2 h1", {
    type: "words",
    mask: "words",
    autoSplit: true,
    smartSplit: true,
    onSplit: (self) => {
      gsap.set(self.words, { yPercent: 100 });
      gsap.to(self.words, {
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

  // Frame 3
  const headlineThree = SplitText.create(".frame--3 h1", { type: "words" });
  gsap.set(headlineThree.words, { opacity: 0, y: 100, filter: "blur(15px)" });

  gsap.to(headlineThree.words, {
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

  // Frame 4
  SplitText.create(".frame--4 h1", {
    type: "chars,words",
    autoSplit: true,
    smartSplit: true,
    onSplit: (self) => {
      gsap.set(self.chars, { opacity: 0, y: 40, filter: "blur(15px)" });
      gsap.to(self.chars, {
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

  // Frame 5
  // Anti-pattern because we updating styles on the onEnter event which is not a good practice
  const headlineFive = document.querySelector(".frame--5 h1");
  ScrollTrigger.create({
    trigger: ".frame--5",
    start: "top 25%",
    end: "bottom bottom",
    scrub: true,
    // markers: true,
    onEnter: () => {
      const split = SplitText.create(headlineFive, {
        autoSplit: true,
        smartSplit: true,
        type: "lines",
        onSplit: (self) => {
          gsap.set(self.lines, { opacity: 0, y: 100, filter: "blur(15px)" });
          gsap.to(self.lines, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.03,
            duration: 1.5,
            ease: "power2.out",
          });
        },
      });
    },
  });

  // Frame 6

  const headlineSix = document.querySelector(".frame--6 h1");

  const headlineSixSplit = SplitText.create(headlineSix, {
    type: "words,lines",
    autoSplit: true,
    smartSplit: true,
    mask: "lines",
    onSplit: (self) => {
      gsap.set(self.lines, { yPercent: 100 });
      gsap.to(self.lines, {
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
});
