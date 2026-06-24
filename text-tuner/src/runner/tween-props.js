import { TWEEN_PROP_KEYS } from "../schema/anim-props.js";

/**
 * @param {Record<string, unknown> | null | undefined} source
 * @returns {Record<string, unknown>}
 */
export function pickTweenProps(source) {
  const out = {};
  if (!source) return out;
  TWEEN_PROP_KEYS.forEach((key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      out[key] = source[key];
    }
  });
  return out;
}
