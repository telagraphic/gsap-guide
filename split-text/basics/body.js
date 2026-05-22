/**
 * SplitText demos for basics/body.html (paragraph copy, frames 2–6).
 * Split types are fixed per frame — tune typography via SplitTextPlayground only.
 */

gsap.registerPlugin(SplitText, ScrollTrigger);

function initBasicsBody(_settings) {
  const splits = [];
  const tweenTargets = ".split-target, .split-target *";

  function track(split) {
    splits.push(split);
    return split;
  }

  // Frame 2 — word mask reveal
  track(
    SplitText.create(".frame--2 .frame__copy", {
      type: "words",
      mask: "words",
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        gsap.set(self.words, { yPercent: 100 });
        return gsap.to(self.words, {
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
    })
  );

  // Frame 3 — word blur / filter stagger
  const frameThree = track(
    SplitText.create(".frame--3 .frame__copy", { type: "words" })
  );
  gsap.set(frameThree.words, { opacity: 0, y: 100, filter: "blur(15px)" });

  gsap.to(frameThree.words, {
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

  // Frame 4 — chars + words
  track(
    SplitText.create(".frame--4 .frame__copy", {
      type: "chars,words",
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        gsap.set(self.chars, { opacity: 0, y: 40, filter: "blur(15px)" });
        return gsap.to(self.chars, {
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
    })
  );

  // Frame 5 — line stagger
  track(
    SplitText.create(".frame--5 .frame__copy", {
      type: "lines",
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        gsap.set(self.lines, { opacity: 0, y: 100, filter: "blur(15px)" });
        return gsap.to(self.lines, {
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
    })
  );

  // Frame 6 — line mask reveal
  track(
    SplitText.create(".frame--6 .frame__copy", {
      type: "words,lines",
      autoSplit: true,
      smartSplit: true,
      mask: "lines",
      onSplit: (self) => {
        gsap.set(self.lines, { yPercent: 100 });
        return gsap.to(self.lines, {
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
    })
  );

  return function teardown() {
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf(tweenTargets);
    splits.forEach((split) => {
      if (split && typeof split.revert === "function") split.revert();
      if (split && typeof split.kill === "function") split.kill();
    });
  };
}

window.initBasicsBody = initBasicsBody;

if (!window.__splitTextPlaygroundAttach) {
  document.fonts.ready.then(() => initBasicsBody());
}
