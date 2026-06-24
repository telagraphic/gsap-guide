/**
 * Generic SplitText + gsap + ScrollTrigger runner.
 *
 * Requires peer GSAP with SplitText and ScrollTrigger loaded (Club SplitText documented separately).
 * Registers plugins once on first factory call.
 */

import { deepClone, mergeInto, typeIncludes, buildGsapStagger } from "../schema/config.js";
import { pickTweenProps } from "./tween-props.js";
import { buildScrollTriggerVars } from "./scroll-trigger-vars.js";

let pluginsRegistered = false;

/**
 * @param {object} gsap
 * @param {object} SplitText
 * @param {object} ScrollTrigger
 */
function ensurePlugins(gsap, SplitText, ScrollTrigger) {
  if (!pluginsRegistered) {
    gsap.registerPlugin(SplitText, ScrollTrigger);
    pluginsRegistered = true;
  }
}

/**
 * @param {object | null} split
 * @param {string} animate
 * @returns {object[]}
 */
function getAnimateTargets(split, animate) {
  if (!split) return [];
  if (animate === "chars") return split.chars || [];
  if (animate === "words") return split.words || [];
  return split.lines || [];
}

/**
 * @param {Record<string, unknown>} config SplitScrollConfig
 * @param {object} [deps]
 * @param {object} [deps.gsap] Defaults to `globalThis.gsap`
 * @param {object} [deps.SplitText] Defaults to `globalThis.SplitText`
 * @param {object} [deps.ScrollTrigger] Defaults to `globalThis.ScrollTrigger`
 * @returns {{ teardown: () => void, runtime: object }}
 */
export function createSplitScrollRunner(config, deps = {}) {
  const gsap = deps.gsap ?? globalThis.gsap;
  const SplitText = deps.SplitText ?? globalThis.SplitText;
  const ScrollTrigger = deps.ScrollTrigger ?? globalThis.ScrollTrigger;

  if (!gsap?.to || !SplitText?.create || !ScrollTrigger?.refresh) {
    throw new Error(
      "[text-tuner] createSplitScrollRunner requires gsap, SplitText, and ScrollTrigger (load before attach)"
    );
  }

  ensurePlugins(gsap, SplitText, ScrollTrigger);

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
    const stagger = buildGsapStagger(cfg.stagger);
    if (stagger !== undefined) toVars.stagger = stagger;

    gsap.set(targets, fromVars);

    toVars.scrollTrigger = buildScrollTriggerVars({ ...cfg.scrollTrigger }, cfg.targets);
    tween = gsap.to(targets, toVars);
    scrollTrigger = tween.scrollTrigger ?? null;
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
  if (cfg.splitText.mask && cfg.splitText.mask !== "none") {
    splitOpts.mask = cfg.splitText.mask;
  }

  split = SplitText.create(cfg.targets.text, splitOpts);

  function applyLive(nextConfig) {
    mergeInto(cfg, nextConfig);
    if (!split) return;
    runAnimation(split);
    ScrollTrigger.refresh(true);
    ScrollTrigger.update();
  }

  function teardown() {
    scrollTrigger?.kill();
    tween?.kill();
    split?.revert?.();
    split?.kill?.();
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
      animateTargetAvailable: (animate) => typeIncludes(cfg.splitText.type, animate),
      getConfig: () => cfg,
    },
  };
}

/** @deprecated Use createSplitScrollRunner */
export const createSplitScrollAnimation = createSplitScrollRunner;

/** Reset plugin registration guard (tests only). */
export function __resetRunnerPluginsForTests() {
  pluginsRegistered = false;
}
