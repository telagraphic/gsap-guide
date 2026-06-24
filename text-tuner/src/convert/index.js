import { parseCanonicalBlock } from "../canonical/parse-canonical-block.js";
import { deepClone } from "../schema/config.js";

/**
 * Convert canonical Copy code to SplitScrollConfig.
 * @param {string} source
 * @param {{ id?: string }} [options]
 */
export function convert(source, options = {}) {
  const { config, warnings } = parseCanonicalBlock(source, options);
  if (!config) {
    return { config: null, warnings };
  }

  const out = deepClone(config);
  if (options.id) {
    out.targets.text = `[data-playground="${options.id}"]`;
    out.targets.element = `[data-playground-trigger="${options.id}"]`;
    out.scrollTrigger.trigger = out.targets.element;
  }

  return { config: out, warnings };
}

export { parseCanonicalBlock } from "../canonical/parse-canonical-block.js";
export { buildCanonicalBlock, serializeConfig } from "../canonical/index.js";
