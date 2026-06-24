/** Tier-1 define() blocks for the sample playground workflows 2–4. */

export const SAMPLE_DEFINE_CONFIGS = {
  "imported-paragraph": {
    targets: {
      element: '[data-playground-trigger="imported-paragraph"]',
      text: '[data-playground="imported-paragraph"]',
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
      trigger: '[data-playground-trigger="imported-paragraph"]',
      start: "top 30%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: {
      fontVar: "--font-fh-enso",
      fontSize: 1.25,
      lineHeight: 1.5,
      letterSpacing: 0,
      textAlign: "left",
      textTransform: "none",
    },
  },

  "config-header": {
    targets: {
      element: '[data-playground-trigger="config-header"]',
      text: '[data-playground="config-header"]',
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
      trigger: '[data-playground-trigger="config-header"]',
      start: "top 75%",
      end: "top 35%",
      scrub: false,
      markers: false,
    },
    typography: {
      fontVar: "--font-editorial-new",
      fontSize: 2.25,
      lineHeight: 1.1,
      letterSpacing: -0.02,
      textAlign: "center",
      textTransform: "none",
    },
  },

  "char-reveal": {
    targets: {
      element: '[data-playground-trigger="char-reveal"]',
      text: '[data-playground="char-reveal"]',
    },
    splitText: {
      type: "chars",
      mask: "none",
      autoSplit: true,
      smartSplit: false,
    },
    animate: "chars",
    from: { opacity: 0, y: 16 },
    to: { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
    stagger: { timing: "each", each: 0.018, from: "start" },
    scrollTrigger: {
      trigger: '[data-playground-trigger="char-reveal"]',
      start: "top 78%",
      end: "top 42%",
      scrub: false,
      markers: false,
    },
    typography: {
      fontVar: "--font-maple-mono",
      fontSize: 1.5,
      lineHeight: 1.4,
      letterSpacing: 0.06,
      textAlign: "center",
      textTransform: "uppercase",
    },
  },
};
