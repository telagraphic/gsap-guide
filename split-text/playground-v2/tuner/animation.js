/**
 * Reference animation factory for Playground v2 tuner.
 * setupAnimation(config) → { teardown, runtime }
 */

gsap.registerPlugin(SplitText, ScrollTrigger);

const DEFAULT_CONFIG = {
  targets: {
    element: ".frame--2",
    text: ".frame--2 .frame__copy",
  },
  splitText: {
    type: "words,lines",
    mask: "lines",
    autoSplit: true,
    smartSplit: true,
  },
  animate: "lines",
  from: { yPercent: 100 },
  to: {
    yPercent: 0,
    duration: 1,
    ease: "power2.out",
  },
  stagger: {
    mode: "advanced",
    value: 0.1,
    amount: 0.1,
    each: null,
    from: "start",
    ease: null,
  },
  scrollTrigger: {
    trigger: ".frame--2",
    start: "top 25%",
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
};

function typeIncludes(type, unit) {
  return String(type)
    .split(",")
    .map((s) => s.trim())
    .includes(unit);
}

function getAnimateTargets(split, animate) {
  if (!split) return [];
  if (animate === "chars") return split.chars || [];
  if (animate === "words") return split.words || [];
  return split.lines || [];
}

function animateTargetAvailable(splitTextType, animate) {
  return typeIncludes(splitTextType, animate);
}

function buildStagger(stagger) {
  if (!stagger) return undefined;
  if (stagger.mode === "simple") {
    const n = stagger.value ?? 0.1;
    return n > 0 ? n : undefined;
  }
  const out = { amount: stagger.amount ?? 0.1, from: stagger.from || "start" };
  if (stagger.each != null && stagger.each !== "" && !Number.isNaN(Number(stagger.each))) {
    out.each = Number(stagger.each);
  }
  if (stagger.ease && stagger.ease !== "none") out.ease = stagger.ease;
  return out;
}

const TWEEN_PROP_KEYS = [
  "opacity",
  "x",
  "y",
  "xPercent",
  "yPercent",
  "scale",
  "rotation",
  "rotationX",
  "rotationY",
  "filter",
];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(target, patch) {
  if (!patch || typeof patch !== "object") return target;
  Object.keys(patch).forEach((key) => {
    const val = patch[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      target[key] = target[key] && typeof target[key] === "object" ? target[key] : {};
      deepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  });
  return target;
}

function pickTweenProps(source) {
  const out = {};
  if (!source) return out;
  TWEEN_PROP_KEYS.forEach((key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      out[key] = source[key];
    }
  });
  return out;
}

function buildScrollTriggerVars(scrollTrigger, targets) {
  const st = { ...scrollTrigger };
  st.trigger = st.trigger || targets?.element || ".frame--2";
  if (st.scrub === false || st.scrub === "false" || st.scrubMode === "off") {
    delete st.scrub;
    delete st.scrubMode;
  } else if (st.scrubMode === "smooth" && typeof st.scrub !== "number") {
    st.scrub = Number(st.scrubSmooth) || 1;
  }
  delete st.scrubMode;
  delete st.scrubSmooth;
  return st;
}

function setupAnimation(config) {
  const cfg = deepClone(config);
  let split = null;
  let tween = null;
  let scrollTrigger = null;

  function runAnimation(self) {
    if (tween) {
      tween.kill();
      tween = null;
      scrollTrigger = null;
    }

    const targets = getAnimateTargets(self, cfg.animate);
    if (!targets.length) return null;

    const fromVars = pickTweenProps(cfg.from);
    const toVars = {
      ...pickTweenProps(cfg.to),
      duration: cfg.to?.duration ?? 1,
      ease: cfg.to?.ease ?? "power2.out",
    };
    const stagger = buildStagger(cfg.stagger);
    if (stagger !== undefined) toVars.stagger = stagger;

    gsap.set(targets, fromVars);

    const stVars = buildScrollTriggerVars(
      { ...cfg.scrollTrigger },
      cfg.targets
    );
    toVars.scrollTrigger = stVars;

    tween = gsap.to(targets, toVars);
    scrollTrigger = tween.scrollTrigger;
    return tween;
  }

  const splitOpts = {
    type: cfg.splitText.type,
    autoSplit: cfg.splitText.autoSplit,
    smartSplit: cfg.splitText.smartSplit,
    onSplit(self) {
      split = self;
      return runAnimation(self);
    },
  };
  if (cfg.splitText.mask) splitOpts.mask = cfg.splitText.mask;

  split = SplitText.create(cfg.targets.text, splitOpts);

  function applyLive(nextConfig) {
    deepMerge(cfg, nextConfig);

    if (!split) return;
    runAnimation(split);

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh(true);
      ScrollTrigger.update();
    }
  }

  function teardown() {
    if (scrollTrigger) scrollTrigger.kill();
    if (tween) tween.kill();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    if (split && typeof split.revert === "function") split.revert();
    if (split && typeof split.kill === "function") split.kill();
    split = null;
    tween = null;
    scrollTrigger = null;
  }

  return {
    teardown,
    runtime: {
      get split() {
        return split;
      },
      get tween() {
        return tween;
      },
      get scrollTrigger() {
        return scrollTrigger;
      },
      applyLive,
      getAnimateTargets: () => getAnimateTargets(split, cfg.animate),
      animateTargetAvailable: (animate) =>
        animateTargetAvailable(cfg.splitText.type, animate),
      getConfig: () => cfg,
    },
  };
}

window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.setupAnimation = setupAnimation;
