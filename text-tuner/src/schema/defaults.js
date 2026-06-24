import { deepClone, deepMerge } from "./config.js";
import { SCHEMA_VERSION } from "./version.js";

/**
 * Tier 0 cold-start defaults (no per-instance selectors).
 * Ported from sample-playground GLOBAL_SCAFFOLD.
 */
export const GLOBAL_SCAFFOLD = {
  splitText: {
    type: "words,lines",
    mask: "lines",
    autoSplit: true,
    smartSplit: true,
  },
  animate: "lines",
  from: { yPercent: 100 },
  to: { yPercent: 0, duration: 1, ease: "power2.out" },
  stagger: {
    timing: "amount",
    amount: 0.1,
    each: 0.1,
    from: "start",
    ease: null,
    grid: null,
    axis: "both",
  },
  scrollTrigger: {
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

/**
 * Full default SplitScrollConfig template (v2 animation.js reference).
 * Demo-specific selectors; prefer `buildScaffoldConfig(id)` for Tier 0.
 */
export const DEFAULT_CONFIG = {
  targets: {
    element: ".frame--2",
    text: ".frame--2 .frame__copy",
  },
  ...GLOBAL_SCAFFOLD,
  scrollTrigger: {
    trigger: ".frame--2",
    start: "top 25%",
    end: "top top",
    scrub: true,
    markers: false,
  },
};

/**
 * Build Tier 0 config for a discovered `data-playground` id.
 * @param {string} id
 * @param {Record<string, unknown>} [globalOverrides] Merged from discover({ defaults })
 */
export function buildScaffoldConfig(id, globalOverrides = {}) {
  const text = `[data-playground="${id}"]`;
  const trigger = `[data-playground-trigger="${id}"]`;
  return deepMerge(
    deepMerge(deepClone(GLOBAL_SCAFFOLD), {
      __schema: SCHEMA_VERSION,
      targets: { element: trigger, text },
      scrollTrigger: { trigger },
    }),
    globalOverrides
  );
}

/**
 * Stamp schema version on a config object (e.g. after session load).
 * @param {Record<string, unknown>} config
 */
export function withSchemaVersion(config) {
  return { ...config, __schema: SCHEMA_VERSION };
}
