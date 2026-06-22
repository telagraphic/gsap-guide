/**
 * Motion presets — data only.
 *
 * Preset names are ambiguous across families: `roll-down` in charCell
 * (per-char yPercent swap) differs from phraseDual (both layers → 100).
 * Always index the family that matches your effect DOM shape.
 *
 * @see js/effects/textRoll.js   — CHAR_CELL_PRESETS
 * @see js/effects/textRipple.js — PHRASE_DUAL_PRESETS | PHRASE_SINGLE_PRESETS
 */

/** SplitText char cell — dual spans stacked inside overflow-hidden parent. */
export const CHAR_CELL_PRESETS = {
  "roll-down": {
    visible: { from: { yPercent: 0 }, to: { yPercent: 100 } },
    hidden: { from: { yPercent: -100 }, to: { yPercent: 0 } },
  },
  "roll-up": {
    visible: { from: { yPercent: 0 }, to: { yPercent: -100 } },
    hidden: { from: { yPercent: 100 }, to: { yPercent: 0 } },
  },
  "roll-crossfade": {
    visible: { from: { yPercent: 0 }, to: { yPercent: 100, opacity: 0 } },
    hidden: {
      from: { yPercent: -100, opacity: 0 },
      to: { yPercent: 0, opacity: 1 },
    },
  },
  "roll-fade-out": {
    visible: { from: { yPercent: 0 }, to: { yPercent: 100, opacity: 0 } },
    hidden: { from: { yPercent: -100 }, to: { yPercent: 0 } },
  },
  "fade-wave": {
    visible: { from: { opacity: 1 }, to: { opacity: 0 } },
    hidden: { from: { opacity: 0 }, to: { opacity: 1 } },
  },
  "blur-roll": {
    visible: {
      from: { yPercent: 0, filter: "blur(0px)" },
      to: { yPercent: 100, filter: "blur(10px)" },
    },
    hidden: {
      from: { yPercent: -100, filter: "blur(10px)" },
      to: { yPercent: 0, filter: "blur(0px)" },
    },
  },
  "scale-roll": {
    visible: {
      from: { yPercent: 0, scale: 1 },
      to: { yPercent: 100, scale: 0.9, opacity: 0 },
    },
    hidden: {
      from: { yPercent: -100, scale: 0.9, opacity: 0 },
      to: { yPercent: 0, scale: 1, opacity: 1 },
    },
  },
  "pop-roll": {
    visible: {
      from: { yPercent: 0, scale: 1 },
      to: { yPercent: 100, scale: 0.5, opacity: 0 },
    },
    hidden: {
      from: { yPercent: -100, scale: 1.35, opacity: 0 },
      to: { yPercent: 0, scale: 1, opacity: 1 },
    },
  },
  "skew-roll": {
    visible: {
      from: { yPercent: 0, skewX: 0 },
      to: { yPercent: 100, skewX: -25 },
    },
    hidden: { from: { yPercent: -100, skewX: 25 }, to: { yPercent: 0, skewX: 0 } },
  },
};

/** Phrase ripple — visible + hidden layers; hidden CSS at bottom: 100%. */
export const PHRASE_DUAL_PRESETS = {
  "roll-down": {
    layerMode: "dual",
    visible: { from: {}, to: { yPercent: 100 } },
    hidden: { from: {}, to: { yPercent: 100 } },
  },
  "roll-fade-out": {
    layerMode: "dual",
    visible: { from: {}, to: { yPercent: 100, opacity: 0 } },
    hidden: { from: {}, to: { yPercent: 100 } },
  },
  "roll-crossfade": {
    layerMode: "dual",
    visible: { from: {}, to: { yPercent: 100, opacity: 0 } },
    hidden: { from: { opacity: 0 }, to: { yPercent: 100, opacity: 1 } },
  },
  "roll-combo": {
    layerMode: "dual",
    visible: { from: {}, to: { yPercent: 100, opacity: 0, scale: 0.9 } },
    hidden: {
      from: { opacity: 0, scale: 0.9 },
      to: { yPercent: 100, opacity: 1, scale: 1 },
    },
  },
  "pop-roll": {
    layerMode: "dual",
    visible: {
      from: { scale: 1, yPercent: 0 },
      to: { scale: 0.85, yPercent: 80, opacity: 0 },
    },
    hidden: {
      from: { scale: 1.15, yPercent: -20, opacity: 0 },
      to: { yPercent: 100, scale: 1, opacity: 1 },
    },
  },
};

/** Phrase ripple — one visible layer; hidden motion unused. */
export const PHRASE_SINGLE_PRESETS = {
  "fade-wave": {
    layerMode: "single",
    visible: { from: { opacity: 0 }, to: { opacity: 1 } },
    hidden: { from: {}, to: {} },
  },
  pop: {
    layerMode: "single",
    visible: {
      from: { scale: 1.15, yPercent: -20, opacity: 0 },
      to: { scale: 1, yPercent: 0, opacity: 1 },
    },
    hidden: {
      from: { scale: 1, yPercent: 0 },
      to: { scale: 0.85, yPercent: 80, opacity: 0 },
    },
  },
  "scale-emphasis": {
    layerMode: "single",
    visible: {
      from: { scale: 1.2, yPercent: -15, opacity: 0 },
      to: { yPercent: 0, scale: 1, opacity: 1 },
    },
    hidden: {
      from: { scale: 1 },
      to: { yPercent: 100, scale: 0.9, opacity: 0 },
    },
  },
};

export const MOTION_PRESETS = {
  charCell: CHAR_CELL_PRESETS,
  phraseDual: PHRASE_DUAL_PRESETS,
  phraseSingle: PHRASE_SINGLE_PRESETS,
};
