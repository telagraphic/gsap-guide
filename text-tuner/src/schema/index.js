export { SCHEMA_VERSION } from "./version.js";
export {
  deepClone,
  deepMerge,
  typeIncludes,
  resolveAnimateTarget,
  formatLetterSpacing,
  parseStaggerGrid,
  formatStaggerGridForInput,
  normalizeStaggerConfig,
  mergeInto,
  buildGsapStagger,
  rebuildConfigSlice,
  needsRebuild,
} from "./config.js";
export {
  SCROLL_EDGE_OPTIONS,
  SCROLL_VIEW_PRESETS,
  SCROLL_OFFSET_UNITS,
  SCROLL_OFFSET_LIMITS,
  parseScrollOffsetPart,
  parseScrollPosition,
  formatScrollPositionPart,
  formatScrollPosition,
} from "./scroll-position.js";
export {
  ANIM_PROPS,
  TWEEN_PROP_KEYS,
  EASE_OPTIONS,
  STAGGER_FROM,
  TEXT_ALIGN_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
} from "./anim-props.js";
export {
  GLOBAL_SCAFFOLD,
  DEFAULT_CONFIG,
  buildScaffoldConfig,
  withSchemaVersion,
} from "./defaults.js";
