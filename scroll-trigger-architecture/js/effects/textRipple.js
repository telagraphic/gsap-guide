import gsap, { ScrollTrigger } from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";
import { EASEOUTQUAD } from "../easings.js";
import {
  PHRASE_DUAL_PRESETS,
  PHRASE_SINGLE_PRESETS,
} from "./motionPresets.js";

/**
 * Text Ripple
 *
 * Char ripple — stagger spreads from an origin index (hover) or fixed point (scroll).
 * Chars only; word/line units are out of scope.
 *
 * ripple.preset             PHRASE_DUAL_PRESETS | PHRASE_SINGLE_PRESETS key
 * ripple.layerMode          "dual" | "single" — overrides preset layerMode
 * ripple.visible.from / .to merged on top of preset visible layer
 * ripple.hidden.from / .to  merged on top of preset hidden layer
 * ripple.ease               default EASEOUTQUAD
 * ripple.duration           default 0.6
 * ripple.stagger.each       default 0.023
 * ripple.variance           optional per-char jitter — see module defaults
 *
 * bind.mode                 "hover" (default) | "scroll"
 * bind.hover.event          default "mouseover"
 * bind.scroll.scrollTrigger merged per target
 * bind.scroll.staggerFrom   "center" | "start" | "end" | "left" | "random" | number
 *
 * beforeBind                after createCharLayers, before bind
 *
 * Motion presets — see motionPresets.js and docs/TEXT-RIPPLE-REFACTOR.md
 * prefers-reduced-motion: forces fade-wave preset, EASEOUTQUAD, no variance
 */

const TEXT_RIPPLE_DEFAULTS = {
  preset: "roll-down",
  ease: EASEOUTQUAD,
  duration: 0.6,
  stagger: { each: 0.023 },
  variance: {},
};

/**
 * Whether the user prefers reduced motion.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Swap ripple config for accessibility when reduced motion is preferred.
 * @param {object} ripple — caller ripple config
 * @returns {object}
 */
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

/**
 * Whether per-char variance hooks are active.
 * @param {{ duration?: number, stagger?: number, ease?: string[] | null }} variance
 * @returns {boolean}
 */
function hasVariance({ duration = 0, stagger = 0, ease = null } = {}) {
  return (
    duration > 0 ||
    stagger > 0 ||
    (Array.isArray(ease) && ease.length > 0)
  );
}

/**
 * Resolve a stagger origin index from a named anchor or numeric index.
 * @param {Element[]} chars
 * @param {string | number} originIndex — "center" | "start" | "end" | "left" | "random" | number
 * @returns {number}
 */
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

/**
 * Delay for one char relative to the stagger origin.
 * @param {number} index
 * @param {number} origin
 * @param {number} each — base stagger step
 * @param {number} staggerVariance — ± jitter (0 = off)
 * @returns {number}
 */
function charDelay(index, origin, each, staggerVariance) {
  const base = Math.abs(index - origin) * each;

  if (!staggerVariance) {
    return base;
  }

  return Math.max(
    0,
    base + gsap.utils.random(-staggerVariance, staggerVariance),
  );
}

/**
 * Per-char duration with optional variance.
 * @param {number} baseDuration
 * @param {number} durationVariance — ± jitter (0 = off)
 * @returns {number}
 */
function charDuration(baseDuration, durationVariance) {
  if (!durationVariance) {
    return baseDuration;
  }

  return Math.max(
    0.05,
    baseDuration + gsap.utils.random(-durationVariance, durationVariance),
  );
}

/**
 * Per-char ease — random pick from array when variance.ease is set.
 * @param {string} baseEase
 * @param {string[] | null | undefined} easeVariance
 * @returns {string}
 */
function charEase(baseEase, easeVariance) {
  if (Array.isArray(easeVariance) && easeVariance.length > 0) {
    return gsap.utils.random(easeVariance);
  }

  return baseEase;
}

/**
 * @param {object} params
 * @param {Element} [params.target]
 * @param {NodeList | Element[]} [params.targets]
 * @param {object} params.layers — class names for hovered, hidden, visible, char
 * @param {{ visibleChars: string, hiddenChars: string }} params.selectors
 * @param {object} [params.ripple]
 * @param {object} [params.bind]
 * @param {(target: Element) => void} [params.beforeBind]
 */
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

  // ── Resolved config ──────────────────────────────────────────
  const mode = bind.mode ?? "hover";
  const hoverEvent = bind.hover?.event ?? "mouseover";
  const scrollConfig = bind.scroll ?? {};
  const staggerFrom = scrollConfig.staggerFrom ?? "center";

  const rippleConfig = {
    ...TEXT_RIPPLE_DEFAULTS,
    ...rippleForMotion(ripple),
    stagger: { ...TEXT_RIPPLE_DEFAULTS.stagger, ...ripple.stagger },
    variance: { ...TEXT_RIPPLE_DEFAULTS.variance, ...ripple.variance },
  };

  const presetKey = rippleConfig.preset ?? TEXT_RIPPLE_DEFAULTS.preset;
  const preset =
    PHRASE_DUAL_PRESETS[presetKey] ??
    PHRASE_SINGLE_PRESETS[presetKey] ??
    PHRASE_DUAL_PRESETS[TEXT_RIPPLE_DEFAULTS.preset];

  const layerMode = ripple.layerMode ?? preset.layerMode ?? "dual";
  const isDual = layerMode === "dual";

  const motion = {
    visible: {
      from: { ...preset.visible.from, ...ripple.visible?.from },
      to: { ...preset.visible.to, ...ripple.visible?.to },
    },
    hidden: {
      from: { ...preset.hidden.from, ...ripple.hidden?.from },
      to: { ...preset.hidden.to, ...ripple.hidden?.to },
    },
  };

  const variance = rippleConfig.variance;
  const {
    ease = TEXT_RIPPLE_DEFAULTS.ease,
    duration = TEXT_RIPPLE_DEFAULTS.duration,
    stagger: { each: staggerEach = TEXT_RIPPLE_DEFAULTS.stagger.each } = {},
  } = rippleConfig;

  // ── Structure ────────────────────────────────────────────────

  /**
   * Wrap each character in a span inside a phrase layer.
   * @param {HTMLElement} layer
   */
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

  /**
   * Build phrase DOM from `data-phrase`. Dual mode adds hidden + visible layers;
   * single mode builds one visible layer only.
   * @param {HTMLElement} targetEl
   */
  function createCharLayers(targetEl) {
    const text = targetEl.dataset.phrase ?? targetEl.textContent.trim();
    targetEl.dataset.phrase = text;
    targetEl.replaceChildren();

    if (isDual) {
      const hidden = document.createElement("span");
      hidden.className = layers.hidden;
      hidden.textContent = text;

      const visible = document.createElement("span");
      visible.className = layers.visible;
      visible.textContent = text;

      targetEl.append(hidden, visible);
      splitChars(hidden);
      splitChars(visible);
      return;
    }

    const visible = document.createElement("span");
    visible.className = layers.visible;
    visible.textContent = text;
    targetEl.append(visible);
    splitChars(visible);
  }

  // ── Play ─────────────────────────────────────────────────────

  /**
   * Batch tween one char layer (gsap stagger) or fromTo when from vars exist.
   * @param {gsap.core.Timeline} timeline
   * @param {NodeList | Element[]} chars
   * @param {{ from: object, to: object }} layerMotion
   * @param {object} tweenOptions — ease, duration, stagger, onComplete
   * @param {string | number} [position] — timeline position
   */
  function tweenLayer(timeline, chars, { from, to }, tweenOptions, position) {
    const vars = { ...to, ...tweenOptions };

    if (Object.keys(from).length > 0) {
      timeline.fromTo(chars, from, vars, position);
      return;
    }

    timeline.to(chars, vars, position);
  }

  /**
   * Per-char tweens with variance — one timeline entry per char.
   * @param {gsap.core.Timeline} timeline
   * @param {NodeList | Element[]} chars
   * @param {{ from: object, to: object }} layerMotion
   * @param {string | number} originIndex
   */
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

  /**
   * Clear transform props after hover replay so the ripple can fire again.
   * @param {NodeList | Element[]} visibleChars
   * @param {NodeList | Element[] | null} hiddenChars
   */
  function clearTweenedProps(visibleChars, hiddenChars) {
    gsap.set(visibleChars, { clearProps: "all" });
    if (hiddenChars?.length) {
      gsap.set(hiddenChars, { clearProps: "all" });
    }
  }

  /**
   * Append char ripple tweens to a timeline. Skips hidden layer when layerMode is single.
   * @param {gsap.core.Timeline} timeline
   * @param {HTMLElement} targetEl
   * @param {string | number} originIndex — stagger origin
   * @param {{ reset?: boolean }} [options] — clearProps on complete (hover replay)
   */
  function appendRippleTweens(
    timeline,
    targetEl,
    originIndex,
    { reset = false } = {},
  ) {
    const visibleChars = targetEl.querySelectorAll(selectors.visibleChars);
    const hiddenChars = isDual
      ? targetEl.querySelectorAll(selectors.hiddenChars)
      : null;

    if (hasVariance(variance)) {
      tweenLayerChars(timeline, visibleChars, motion.visible, originIndex);
      if (isDual) {
        tweenLayerChars(timeline, hiddenChars, motion.hidden, originIndex);
      }

      if (reset) {
        timeline.eventCallback("onComplete", () => {
          clearTweenedProps(visibleChars, hiddenChars);
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

    if (!isDual) {
      if (reset) {
        timeline.eventCallback("onComplete", () => {
          clearTweenedProps(visibleChars, null);
        });
      }
      return;
    }

    const hiddenOptions = { ...tweenOptions };

    if (reset) {
      hiddenOptions.onComplete = () => {
        clearTweenedProps(visibleChars, hiddenChars);
      };
    }

    tweenLayer(timeline, hiddenChars, motion.hidden, hiddenOptions, "<");
  }

  /**
   * One-shot hover ripple — resets transforms when complete.
   * @param {HTMLElement} targetEl
   * @param {number} originIndex — hovered char index
   */
  function playRipple(targetEl, originIndex) {
    const timeline = gsap.timeline();
    appendRippleTweens(timeline, targetEl, originIndex, { reset: true });
  }

  // ── Bind ─────────────────────────────────────────────────────

  /**
   * Index of a char span among its siblings in the phrase layer.
   * @param {Element} child
   * @returns {number}
   */
  function getCharIndex(child) {
    return Array.from(child.parentNode.children).indexOf(child);
  }

  /**
   * Attach mouseover listener; ripple spreads from hovered char index.
   * @param {HTMLElement} targetEl
   */
  function bindHover(targetEl) {
    targetEl.addEventListener(
      hoverEvent,
      (e) => {
        const visibleChars = targetEl.querySelectorAll(selectors.visibleChars);

        if (
          !gsap.isTweening(visibleChars) &&
          targetEl.classList.contains(layers.hovered)
        ) {
          targetEl.classList.remove(layers.hovered);
        }

        if (e.target.classList.contains(layers.char)) {
          targetEl.classList.add(layers.hovered);
          playRipple(targetEl, getCharIndex(e.target));
        }
      },
      { signal: abort.signal },
    );
  }

  /**
   * Scrubbed scroll timeline with fixed stagger origin.
   * @param {HTMLElement} targetEl
   * @param {string} key — registry timeline key
   */
  function bindScroll(targetEl, key) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: targetEl,
        ...scrollConfig.scrollTrigger,
      },
    });

    appendRippleTweens(timeline, targetEl, staggerFrom);
    timelines.set(targetEl, timeline);
    registry.addTimeline(key, timeline);
  }

  /**
   * Remove a scroll-bound timeline before rebuild.
   * @param {HTMLElement} targetEl
   */
  function killScrollTimeline(targetEl) {
    const timeline = timelines.get(targetEl);
    if (!timeline) {
      return;
    }
    registry.killTween(timeline);
    timelines.delete(targetEl);
  }

  /**
   * Attach hover or scroll binding for one target.
   * @param {HTMLElement} targetEl
   * @param {string} key
   */
  function bindTarget(targetEl, key) {
    if (mode === "scroll") {
      bindScroll(targetEl, key);
      return;
    }
    bindHover(targetEl);
  }

  // ── Lifecycle ────────────────────────────────────────────────

  /**
   * Structure → beforeBind → bind for one ripple target.
   * @param {HTMLElement} targetEl
   * @param {number} index
   */
  function initTarget(targetEl, index) {
    const key = targets ? `ripple-${index}` : "ripple";
    createCharLayers(targetEl);
    beforeBind?.(targetEl);
    bindTarget(targetEl, key);
  }

  /**
   * Partial rebuild on ScrollTrigger refreshInit — re-structure, re-bind scroll timelines.
   */
  function refreshTargets() {
    for (const [index, targetEl] of elements.entries()) {
      if (mode === "scroll") {
        killScrollTimeline(targetEl);
      } else {
        gsap.killTweensOf(targetEl.querySelectorAll("span"));
        targetEl.classList.remove(layers.hovered);
      }

      createCharLayers(targetEl);
      beforeBind?.(targetEl);

      if (mode === "scroll") {
        const key = targets ? `ripple-${index}` : "ripple";
        bindScroll(targetEl, key);
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
