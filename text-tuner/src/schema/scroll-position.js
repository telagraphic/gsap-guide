/** @typedef {"top" | "center" | "bottom"} ScrollEdge */
/** @typedef {"%" | "vh" | "px"} ScrollOffsetUnit */

/** @typedef {object} ParsedScrollOffset
 * @property {ScrollEdge} edge
 * @property {number} offset
 * @property {ScrollOffsetUnit} unit
 */

/** @typedef {object} ParsedScrollPosition
 * @property {ScrollEdge} elementEdge
 * @property {number} elementOffset
 * @property {ScrollOffsetUnit} elementUnit
 * @property {ScrollEdge} viewEdge
 * @property {number} viewOffset
 * @property {ScrollOffsetUnit} viewUnit
 */

export const SCROLL_EDGE_OPTIONS = /** @type {const} */ (["top", "center", "bottom"]);

export const SCROLL_VIEW_PRESETS = /** @type {const} */ (["top", "center", "bottom"]);

export const SCROLL_OFFSET_UNITS = /** @type {const} */ (["%", "vh", "px"]);

export const SCROLL_OFFSET_LIMITS = {
  "%": { min: 0, max: 100, step: 1 },
  vh: { min: 0, max: 100, step: 1 },
  px: { min: 0, max: 800, step: 5 },
};

/**
 * @param {string} part
 * @returns {ParsedScrollOffset}
 */
export function parseScrollOffsetPart(part) {
  const s = String(part || "").trim();
  if (SCROLL_EDGE_OPTIONS.includes(/** @type {ScrollEdge} */ (s))) {
    return { edge: /** @type {ScrollEdge} */ (s), offset: 0, unit: "%" };
  }
  const match = s.match(/^([\d.]+)(%|vh|px)$/i);
  if (match) {
    const unit = match[2] === "%" ? "%" : /** @type {ScrollOffsetUnit} */ (match[2].toLowerCase());
    return { edge: "top", offset: parseFloat(match[1]), unit };
  }
  const n = parseFloat(s);
  if (Number.isFinite(n)) {
    return { edge: "top", offset: n, unit: "%" };
  }
  return { edge: "top", offset: 0, unit: "%" };
}

/**
 * @param {string} str ScrollTrigger start/end string (e.g. `"top 25%"`).
 * @returns {ParsedScrollPosition}
 */
export function parseScrollPosition(str) {
  const parts = String(str || "top top")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return {
      elementEdge: "top",
      elementOffset: 0,
      elementUnit: "%",
      viewEdge: "top",
      viewOffset: 0,
      viewUnit: "%",
    };
  }
  const element = parseScrollOffsetPart(parts[0]);
  const viewPart = parts.slice(1).join(" ") || "top";
  const view = parseScrollOffsetPart(viewPart);
  return {
    elementEdge: element.edge,
    elementOffset: element.offset,
    elementUnit: SCROLL_OFFSET_UNITS.includes(element.unit) ? element.unit : "%",
    viewEdge: view.edge,
    viewOffset: view.offset,
    viewUnit: SCROLL_OFFSET_UNITS.includes(view.unit) ? view.unit : "%",
  };
}

/**
 * @param {ScrollEdge} edge
 * @param {number} offset
 * @param {ScrollOffsetUnit} unit
 * @returns {string}
 */
export function formatScrollPositionPart(edge, offset, unit) {
  const e = SCROLL_EDGE_OPTIONS.includes(edge) ? edge : "top";
  const n = parseFloat(String(offset)) || 0;
  if (n <= 0) return e;
  const u = SCROLL_OFFSET_UNITS.includes(unit) ? unit : "%";
  const value = u === "%" ? Math.round(n) : n;
  const display = u === "px" ? value : Number(value.toFixed(u === "vh" ? 1 : 0));
  return `${display}${u}`;
}

/**
 * @param {string | ParsedScrollPosition} parts
 * @returns {string}
 */
export function formatScrollPosition(parts) {
  const p = typeof parts === "string" ? parseScrollPosition(parts) : parts;
  const element = formatScrollPositionPart(p.elementEdge, p.elementOffset, p.elementUnit);
  const view = formatScrollPositionPart(p.viewEdge, p.viewOffset, p.viewUnit);
  return `${element} ${view}`;
}
