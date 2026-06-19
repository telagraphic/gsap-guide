import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { createRegistry } from "../shared/registry.js";
import { EASEOUTQUAD } from "../easings.js";

/**
 * Text Ripple
 *
 * Char ripple — stagger spreads from an origin index (hover) or fixed point (scroll).
 * Chars only; word/line units are out of scope.
 *
 * ripple.ease               required — pass from caller
 * ripple.duration           tween duration per char (default 0.6)
 * ripple.stagger.each       delay between chars (default 0.023)
 * ripple.preset             see RIPPLE_PRESETS below (default "roll-down")
 * ripple.visible.from       per-char start vars (merged on top of preset)
 * ripple.visible.to         per-char end vars (merged on top of preset)
 * ripple.hidden.from        per-char start vars (merged on top of preset)
 * ripple.hidden.to          per-char end vars (merged on top of preset)
 *
 * ripple.variance.duration    ± per char (0 = off)
 * ripple.variance.stagger     ± delay jitter per char (0 = off)
 * ripple.variance.ease        array of ease strings to random-pick per char
 *
 * bind.mode                 "hover" (default) | "scroll"
 * bind.hover.event          mouse event (default "mouseover")
 * bind.scroll.scrollTrigger merged per target; trigger defaults to each target
 * bind.scroll.staggerFrom   "center" | "start" | "end" | "random" | number (default "center")
 *
 * beforeBind                lifecycle hook — after createCharLayers, before bind
 *
 * target                    single element
 * targets                   NodeList — one ripple per element, keyed ripple-0, ripple-1, …
 *
 * Motion presets + combinations — see docs/TEXT-RIPPLE-REFACTOR.md
 *
 * prefers-reduced-motion: forces fade-wave preset, EASEOUTQUAD, no variance
 */

function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rippleForMotion(ripple) {
  if (!prefersReducedMotion()) {
    return ripple;
  }

  const { variance: _variance, preset: _preset, ease: _ease, ...rest } = ripple;

  return {
    ...rest,
    preset: "fade-wave",
    ease: EASEOUTQUAD,
  };
}

const RIPPLE_PRESETS = {
  "roll-down": {
    visible: { from: {}, to: { yPercent: 100 } },
    hidden: { from: {}, to: { yPercent: 100 } },
  },
  "roll-fade-out": {
    visible: { from: {}, to: { yPercent: 100, opacity: 0 } },
    hidden: { from: {}, to: { yPercent: 100 } },
  },
  "roll-crossfade": {
    visible: { from: {}, to: { yPercent: 100, opacity: 0 } },
    hidden: { from: { opacity: 0 }, to: { yPercent: 100, opacity: 1 } },
  },
  "fade-wave": {
    visible: { from: { opacity: 1 }, to: { opacity: 0 } },
    hidden: { from: { opacity: 0 }, to: { opacity: 1 } },
  },
  pop: {
    visible: {
      from: { scale: 1.15, yPercent: -20, opacity: 0 },
      to: { scale: 1, yPercent: 0, opacity: 1 },
    },
    hidden: {
      from: { scale: 1, yPercent: 0 },
      to: { scale: 0.85, yPercent: 80, opacity: 0 },
    },
  },
  "pop-roll": {
    visible: {
      from: { scale: 1, yPercent: 0 },
      to: { scale: 0.85, yPercent: 80, opacity: 0 },
    },
    hidden: {
      from: { scale: 1.15, yPercent: -20, opacity: 0 },
      to: { yPercent: 100, scale: 1, opacity: 1 },
    },
  },
  "scale-emphasis": {
    visible: {
      from: { scale: 1.2, yPercent: -15, opacity: 0 },
      to: { yPercent: 0, scale: 1, opacity: 1 },
    },
    hidden: {
      from: { scale: 1 },
      to: { yPercent: 100, scale: 0.9, opacity: 0 },
    },
  },
  "roll-combo": {
    visible: { from: {}, to: { yPercent: 100, opacity: 0, scale: 0.9 } },
    hidden: {
      from: { opacity: 0, scale: 0.9 },
      to: { yPercent: 100, opacity: 1, scale: 1 },
    },
  },
};

function resolveLayerMotion(presetLayer, layerConfig = {}) {
  return {
    from: { ...presetLayer.from, ...layerConfig.from },
    to: { ...presetLayer.to, ...layerConfig.to },
  };
}

function hasVariance({ duration = 0, stagger = 0, ease = null } = {}) {
  return (
    duration > 0 ||
    stagger > 0 ||
    (Array.isArray(ease) && ease.length > 0)
  );
}

function staggerOrigin(chars, originIndex) {
  if (typeof originIndex === "number") {
    return originIndex;
  }

  const last = chars.length - 1;

  if (originIndex === "end" || originIndex === "right") {
    return last;
  }

  if (originIndex === "center") {
    return last / 2;
  }

  if (originIndex === "random") {
    return Math.floor(Math.random() * chars.length);
  }

  return 0;
}

function charDelay(index, origin, each, staggerVariance) {
  const base = Math.abs(index - origin) * each;

  if (!staggerVariance) {
    return base;
  }

  return Math.max(0, base + gsap.utils.random(-staggerVariance, staggerVariance));
}

function charDuration(baseDuration, durationVariance) {
  if (!durationVariance) {
    return baseDuration;
  }

  return Math.max(
    0.05,
    baseDuration + gsap.utils.random(-durationVariance, durationVariance),
  );
}

function charEase(baseEase, easeVariance) {
  if (Array.isArray(easeVariance) && easeVariance.length > 0) {
    return gsap.utils.random(easeVariance);
  }

  return baseEase;
}

function resolveMotion(ripple) {
  const preset =
    RIPPLE_PRESETS[ripple.preset ?? "roll-down"] ??
    RIPPLE_PRESETS["roll-down"];

  return {
    visible: resolveLayerMotion(preset.visible, ripple.visible),
    hidden: resolveLayerMotion(preset.hidden, ripple.hidden),
  };
}

export function createTextRipple({
  target,
  targets,
  layers,
  selectors,
  ripple = {},
  bind = {},
  beforeBind,
}) {
  const registry = createRegistry();
  const abort = new AbortController();
  const timelines = new Map();
  let elements = [];
  let refreshHandler = null;

  const mode = bind.mode ?? "hover";
  const hoverEvent = bind.hover?.event ?? "mouseover";
  const scrollConfig = bind.scroll ?? {};
  const staggerFrom = scrollConfig.staggerFrom ?? "center";
  const rippleConfig = rippleForMotion(ripple);
  const motion = resolveMotion(rippleConfig);
  const variance = rippleConfig.variance ?? {};

  const {
    ease = EASEOUTQUAD,
    duration = 0.6,
    stagger: { each: staggerEach = 0.023 } = {},
  } = rippleConfig;

  function splitChars(layer) {
    const text = layer.textContent;
    layer.innerHTML = text
      .split("")
      .map((char) =>
        char === " "
          ? "<span> </span>"
          : `<span class="${layers.char}">${char}</span>`,
      )
      .join("");
  }

  function createCharLayers(target) {
    const text = target.dataset.phrase ?? target.textContent.trim();
    target.dataset.phrase = text;
    target.replaceChildren();

    const hidden = document.createElement("span");
    hidden.className = layers.hidden;
    hidden.textContent = text;

    const visible = document.createElement("span");
    visible.className = layers.visible;
    visible.textContent = text;

    target.append(hidden, visible);
    splitChars(hidden);
    splitChars(visible);
  }

  function getCharIndex(child) {
    return Array.from(child.parentNode.children).indexOf(child);
  }

  function tweenLayer(timeline, chars, { from, to }, tweenOptions, position) {
    const vars = { ...to, ...tweenOptions };

    if (Object.keys(from).length > 0) {
      timeline.fromTo(chars, from, vars, position);
      return;
    }

    timeline.to(chars, vars, position);
  }

  function tweenLayerChars(timeline, chars, layerMotion, originIndex) {
    const origin = staggerOrigin(chars, originIndex);

    chars.forEach((char, index) => {
      const vars = {
        ...layerMotion.to,
        ease: charEase(ease, variance.ease),
        duration: charDuration(duration, variance.duration),
      };

      const delay = charDelay(index, origin, staggerEach, variance.stagger);

      if (Object.keys(layerMotion.from).length > 0) {
        timeline.fromTo(char, layerMotion.from, vars, delay);
        return;
      }

      timeline.to(char, vars, delay);
    });
  }

  function appendRippleTweens(
    timeline,
    target,
    originIndex,
    { reset = false } = {},
  ) {
    const visibleChars = target.querySelectorAll(selectors.visibleChars);
    const hiddenChars = target.querySelectorAll(selectors.hiddenChars);

    if (hasVariance(variance)) {
      tweenLayerChars(timeline, visibleChars, motion.visible, originIndex);
      tweenLayerChars(timeline, hiddenChars, motion.hidden, originIndex);

      if (reset) {
        timeline.eventCallback("onComplete", () => {
          gsap.set(visibleChars, { clearProps: "all" });
          gsap.set(hiddenChars, { clearProps: "all" });
        });
      }

      return;
    }

    const tweenOptions = {
      ease,
      duration,
      stagger: { each: staggerEach, from: originIndex },
    };

    tweenLayer(timeline, visibleChars, motion.visible, tweenOptions);

    const hiddenOptions = { ...tweenOptions };

    if (reset) {
      hiddenOptions.onComplete = () => {
        gsap.set(visibleChars, { clearProps: "all" });
        gsap.set(hiddenChars, { clearProps: "all" });
      };
    }

    tweenLayer(timeline, hiddenChars, motion.hidden, hiddenOptions, "<");
  }

  function playRipple(target, originIndex) {
    const timeline = gsap.timeline();
    appendRippleTweens(timeline, target, originIndex, { reset: true });
  }

  function bindHover(target) {
    target.addEventListener(
      hoverEvent,
      (e) => {
        const visibleChars = target.querySelectorAll(selectors.visibleChars);

        if (
          !gsap.isTweening(visibleChars) &&
          target.classList.contains(layers.hovered)
        ) {
          target.classList.remove(layers.hovered);
        }

        if (e.target.classList.contains(layers.char)) {
          target.classList.add(layers.hovered);
          playRipple(target, getCharIndex(e.target));
        }
      },
      { signal: abort.signal },
    );
  }

  function bindScroll(target, key) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: target,
        ...scrollConfig.scrollTrigger,
      },
    });

    appendRippleTweens(timeline, target, staggerFrom);
    timelines.set(target, timeline);
    registry.addTimeline(key, timeline);
  }

  function killScrollTimeline(target) {
    const timeline = timelines.get(target);
    if (!timeline) {
      return;
    }
    registry.killTween(timeline);
    timelines.delete(target);
  }

  function bindTarget(target, key) {
    if (mode === "scroll") {
      bindScroll(target, key);
      return;
    }
    bindHover(target);
  }

  function initTarget(target, index) {
    const key = targets ? `ripple-${index}` : "ripple";
    createCharLayers(target);
    beforeBind?.(target);
    bindTarget(target, key);
  }

  function refreshTargets() {
    for (const [index, target] of elements.entries()) {
      if (mode === "scroll") {
        killScrollTimeline(target);
      } else {
        gsap.killTweensOf(target.querySelectorAll("span"));
        target.classList.remove(layers.hovered);
      }

      createCharLayers(target);
      beforeBind?.(target);

      if (mode === "scroll") {
        const key = targets ? `ripple-${index}` : "ripple";
        bindScroll(target, key);
      }
    }
  }

  return {
    id: "text-ripple",
    type: "effect",
    registry,
    create() {
      if (refreshHandler) {
        ScrollTrigger.removeEventListener("refreshInit", refreshHandler);
        refreshHandler = null;
        registry.resetAnimations();
        timelines.clear();
      }

      elements = targets ? [...targets] : [target];
      elements.forEach((element, index) => initTarget(element, index));
      refreshHandler = refreshTargets;
      ScrollTrigger.addEventListener("refreshInit", refreshHandler);
    },
    destroy() {
      abort.abort();

      if (refreshHandler) {
        ScrollTrigger.removeEventListener("refreshInit", refreshHandler);
        refreshHandler = null;
      }

      registry.destroy();
      timelines.clear();
      elements = [];
    },
  };
}
