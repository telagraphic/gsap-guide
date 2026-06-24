/**
 * Text Tuner — public API (ESM).
 */

export { SCHEMA_VERSION } from "./schema/version.js";
export { buildScaffoldConfig, DEFAULT_CONFIG } from "./schema/defaults.js";
export { createSplitScrollRunner } from "./runner/index.js";

export { define, getDefined, getDefinedConfig } from "./define.js";
export { discover, getRegistry, getActiveId } from "./discover.js";
export {
  attach,
  isActive,
  initAll,
  setRunnerFactory,
  getActiveInstanceId,
  getLiveInstances,
} from "./attach.js";

export { resolveFonts, normalizeFamilies, STARTER_FONT_FALLBACK } from "./fonts/index.js";
export { convert, buildCanonicalBlock, serializeConfig } from "./convert/index.js";
export { createInstanceManager } from "./attach/instance-manager.js";

export { attachPanel, isPanelActive, installV2Shim } from "./panel/index.js";

export * as schema from "./schema/index.js";
export * as runner from "./runner/index.js";
export * as panel from "./panel/index.js";
