/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} patch
 * @returns {Record<string, unknown>}
 */
export function deepMerge(base, patch) {
  const out = deepClone(base);
  const merge = (target, source) => {
    if (!source || typeof source !== "object") return;
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        merge(/** @type {Record<string, unknown>} */ (target[key]), /** @type {Record<string, unknown>} */ (source[key]));
      } else {
        target[key] = source[key];
      }
    });
  };
  merge(out, patch);
  return out;
}

/**
 * @param {string} type SplitText type string (e.g. `"words,lines"`).
 * @param {string} unit `"chars" | "words" | "lines"`.
 * @returns {boolean}
 */
export function typeIncludes(type, unit) {
  return String(type)
    .split(",")
    .map((s) => s.trim())
    .includes(unit);
}

/**
 * Pick a valid animate target for the current SplitText type.
 * @param {string} typeStr
 * @param {string} current
 * @returns {string}
 */
export function resolveAnimateTarget(typeStr, current) {
  if (typeIncludes(typeStr, current)) return current;
  if (typeIncludes(typeStr, "lines")) return "lines";
  if (typeIncludes(typeStr, "words")) return "words";
  if (typeIncludes(typeStr, "chars")) return "chars";
  return current;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatLetterSpacing(value) {
  const n = Math.abs(value).toFixed(2);
  const sign = value < 0 ? "-" : "+";
  return `${sign}${n}`;
}

/**
 * @param {string} [raw]
 * @returns {[number, number] | null}
 */
export function parseStaggerGrid(raw) {
  const s = raw?.trim();
  if (!s) return null;
  const tryParse = (text) => {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length < 2) return null;
    const nums = parsed.slice(0, 2).map(Number);
    return nums.every((n) => Number.isFinite(n)) ? /** @type {[number, number]} */ (nums) : null;
  };
  try {
    const fromJson = tryParse(s.startsWith("[") ? s : `[${s}]`);
    if (fromJson) return fromJson;
  } catch {
    /* fall through */
  }
  const parts = s
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((part) => parseFloat(part.trim()));
  if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0], parts[1]];
  }
  return null;
}

/**
 * @param {number[] | null | undefined} grid
 * @returns {string}
 */
export function formatStaggerGridForInput(grid) {
  if (!grid || !Array.isArray(grid) || grid.length < 2) return "";
  return `[${grid[0]}, ${grid[1]}]`;
}

/**
 * Normalize stagger config from form values or legacy `mode` / `value` shapes.
 * @param {Record<string, unknown> | null | undefined} stagger
 */
export function normalizeStaggerConfig(stagger) {
  const s = stagger ? { ...stagger } : {};
  if (s.mode === "simple") {
    s.timing = "each";
    s.each = s.value ?? s.each ?? 0.1;
  }
  if (!s.timing) {
    s.timing = s.each != null && s.each !== "" ? "each" : "amount";
  }
  delete s.mode;
  delete s.value;
  return {
    timing: s.timing === "each" ? "each" : "amount",
    amount: s.amount ?? 0.1,
    each: s.each ?? 0.1,
    from: s.from || "start",
    ease: s.ease && s.ease !== "none" ? s.ease : null,
    grid: Array.isArray(s.grid) && s.grid.length >= 2 ? [s.grid[0], s.grid[1]] : null,
    axis: s.axis === "x" || s.axis === "y" ? s.axis : "both",
  };
}

/**
 * Merge `patch` into `target` in place (for live runner updates).
 * @param {Record<string, unknown>} target
 * @param {Record<string, unknown>} patch
 */
export function mergeInto(target, patch) {
  if (!patch || typeof patch !== "object") return target;
  Object.keys(patch).forEach((key) => {
    const val = patch[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      target[key] = target[key] && typeof target[key] === "object" ? target[key] : {};
      mergeInto(/** @type {Record<string, unknown>} */ (target[key]), /** @type {Record<string, unknown>} */ (val));
    } else {
      target[key] = val;
    }
  });
  return target;
}

/**
 * Build a GSAP stagger object from config stagger fields.
 * @param {Record<string, unknown> | null | undefined} stagger
 * @returns {Record<string, unknown> | undefined}
 */
export function buildGsapStagger(stagger) {
  const s = normalizeStaggerConfig(stagger);
  const out = { from: s.from };
  if (s.timing === "each") {
    if (s.each <= 0) return undefined;
    out.each = s.each;
  } else {
    if (s.amount <= 0) return undefined;
    out.amount = s.amount;
  }
  if (s.ease) out.ease = s.ease;
  if (s.grid) out.grid = [s.grid[0], s.grid[1]];
  if (s.axis === "x" || s.axis === "y") out.axis = s.axis;
  return out;
}

const REBUILD_KEYS = ["typography", "splitText", "targets"];

/**
 * Slice of config that requires a full SplitText re-init when changed.
 * @param {Record<string, unknown> | null | undefined} config
 */
export function rebuildConfigSlice(config) {
  if (!config) return {};
  return REBUILD_KEYS.reduce((slice, key) => {
    if (config[key] !== undefined) slice[key] = config[key];
    return slice;
  }, /** @type {Record<string, unknown>} */ ({}));
}

/**
 * Whether commit should tear down and re-init the runner (typography, SplitText, targets).
 * @param {Record<string, unknown> | null | undefined} prev
 * @param {Record<string, unknown> | null | undefined} next
 * @returns {boolean}
 */
export function needsRebuild(prev, next) {
  if (!prev || !next) return true;
  return (
    JSON.stringify(rebuildConfigSlice(prev)) !== JSON.stringify(rebuildConfigSlice(next))
  );
}
