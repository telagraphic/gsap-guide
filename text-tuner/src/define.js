import { deepClone } from "./schema/config.js";

const _defined = {};

/**
 * Tier-1 config blocks keyed by `data-playground` id.
 * @param {Record<string, object>} entries
 */
export function define(entries) {
  Object.assign(_defined, entries);
}

export function getDefined() {
  return _defined;
}

export function getDefinedConfig(id) {
  return _defined[id] ? deepClone(_defined[id]) : null;
}
