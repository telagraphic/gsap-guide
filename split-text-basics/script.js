/**
 * GSAP SplitText headline demos (index.html / controls.html).
 * Exposes initSplitTextDemos() for teardown + rebuild from the controls panel.
 */

gsap.registerPlugin(SplitText, ScrollTrigger);

const VALID_SPLIT_TYPES = ["chars", "words", "lines"];

function targets(self, splitType) {
  return self[splitType];
}

// #region agent log
function debugLog(location, message, data, hypothesisId, runId = "pre-fix") {
  fetch("http://127.0.0.1:7509/ingest/09e99314-03c2-424f-9072-97c1caca0479", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1bb1f6",
    },
    body: JSON.stringify({
      sessionId: "1bb1f6",
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

function initSplitTextDemos({ splitType = "words" } = {}) {
  if (!VALID_SPLIT_TYPES.includes(splitType)) {
    throw new Error(`splitType must be one of: ${VALID_SPLIT_TYPES.join(", ")}`);
  }

  const splits = [];

  function track(split) {
    splits.push(split);
    return split;
  }

  // Frame 2 — mask reveal
  track(
    SplitText.create(".frame--2 h1", {
      type: splitType,
      mask: splitType,
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        const els = targets(self, splitType);
        gsap.set(els, { yPercent: 100 });
        // #region agent log
        debugLog(
          "script.js:onSplit",
          "frame 2 onSplit fired",
          {
            frame: 2,
            elCount: els?.length ?? 0,
            stCount: ScrollTrigger.getAll().length,
          },
          "B"
        );
        // #endregion
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
    })
  );

  // Frame 3 — blur stagger
  const headlineThree = track(
    SplitText.create(".frame--3 h1", { type: splitType })
  );
  const frameThreeEls = targets(headlineThree, splitType);
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
  track(
    SplitText.create(".frame--4 h1", {
      type: splitType,
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        const els = targets(self, splitType);
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
    })
  );

  // Frame 5 — stagger reveal (eager split for playground rebuild)
  track(
    SplitText.create(".frame--5 h1", {
      type: splitType,
      autoSplit: true,
      smartSplit: true,
      onSplit: (self) => {
        const els = targets(self, splitType);
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
    })
  );

  // Frame 6 — mask reveal
  track(
    SplitText.create(".frame--6 h1", {
      type: splitType,
      autoSplit: true,
      smartSplit: true,
      mask: splitType,
      onSplit: (self) => {
        const els = targets(self, splitType);
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
    })
  );

  return function teardown() {
    // #region agent log
    const stBefore = ScrollTrigger.getAll().length;
    // #endregion
    ScrollTrigger.getAll().forEach((st) => st.kill());
    gsap.killTweensOf(".frame__headline, .frame__headline *");
    splits.forEach((split) => {
      if (split && typeof split.revert === "function") split.revert();
      if (split && typeof split.kill === "function") split.kill();
    });
    // #region agent log
    debugLog(
      "script.js:teardown",
      "teardown complete",
      {
        stBefore,
        stAfter: ScrollTrigger.getAll().length,
        splitsCount: splits.length,
      },
      "C"
    );
    // #endregion
  };
}

window.initSplitTextDemos = initSplitTextDemos;

if (!window.__splitTextPlayground) {
  document.fonts.ready.then(() => initSplitTextDemos());
}
