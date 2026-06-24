/**
 * Sample playground define() blocks.
 * Keep PLAYGROUND_TYPOGRAPHY in sync with styles.css (--playground-* on .text-tuner-canvas).
 */

/** Shared canvas typography — all instances use the same font/size for now. */
export const PLAYGROUND_TYPOGRAPHY = {
  fontVar: "--font-fh-dfaalt",
  fontSize: 5,
  lineHeight: 1.2,
  letterSpacing: -0.05,
  textAlign: "center",
  textTransform: "",
};

export const SAMPLE_DEFINE_CONFIGS = {
  "header": {
    targets: {
      element: '[data-playground-trigger="header"]',
      text: '[data-playground="header"]',
    },
    splitText: {
      type: "words,lines",
      mask: "lines",
      autoSplit: true,
      smartSplit: true,
    },
    animate: "lines",
    from: { yPercent: 100 },
    to: { yPercent: 0, duration: 1, ease: "power2.out" },
    stagger: { timing: "amount", amount: 0.1, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="header"]',
      start: "top 25%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
  "section-1": {
    targets: {
      element: '[data-playground-trigger="section-1"]',
      text: '[data-playground="section-1"]',
    },
    splitText: {
      type: "words,lines",
      mask: "lines",
      autoSplit: true,
      smartSplit: true,
    },
    animate: "lines",
    from: { yPercent: 100 },
    to: { yPercent: 0, duration: 1, ease: "power2.out" },
    stagger: { timing: "amount", amount: 0.1, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="section-1"]',
      start: "top 25%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
  "section-2": {
    targets: {
      element: '[data-playground-trigger="section-2"]',
      text: '[data-playground="section-2"]',
    },
    splitText: {
      type: "words,lines",
      mask: "lines",
      autoSplit: true,
      smartSplit: true,
    },
    animate: "lines",
    from: { yPercent: 100 },
    to: { yPercent: 0, duration: 1, ease: "power2.out" },
    stagger: { timing: "amount", amount: 0.12, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="section-2"]',
      start: "top 30%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
  "section-3": {
    targets: {
      element: '[data-playground-trigger="section-3"]',
      text: '[data-playground="section-3"]',
    },
    splitText: {
      type: "words",
      mask: "none",
      autoSplit: true,
      smartSplit: false,
    },
    animate: "words",
    from: { opacity: 0, y: 28 },
    to: { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
    stagger: { timing: "each", each: 0.045, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="section-3"]',
      start: "top center",
      end: "center center",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
  "section-4": {
    targets: {
      element: '[data-playground-trigger="section-4"]',
      text: '[data-playground="section-4"]',
    },
    splitText: {
      type: "words",
      mask: "none",
      autoSplit: true,
      smartSplit: false,
    },
    animate: "words",
    from: { opacity: 0, y: 28 },
    to: { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
    stagger: { timing: "each", each: 0.045, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="section-4"]',
      start: "top center",
      end: "center center",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
  "footer": {
    targets: {
      element: '[data-playground-trigger="footer"]',
      text: '[data-playground="footer"]',
    },
    splitText: {
      type: "words,lines",
      mask: "lines",
      autoSplit: true,
      smartSplit: true,
    },
    animate: "lines",
    from: { yPercent: 100 },
    to: { yPercent: 0, duration: 1, ease: "power2.out" },
    stagger: { timing: "amount", amount: 0.1, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="footer"]',
      start: "top 25%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: PLAYGROUND_TYPOGRAPHY,
  },
};
