import {
  parseScrollPosition,
  formatScrollPosition,
  SCROLL_EDGE_OPTIONS,
  SCROLL_VIEW_PRESETS,
  SCROLL_OFFSET_UNITS,
  SCROLL_OFFSET_LIMITS,
} from "../../schema/scroll-position.js";
import { buildTrackSliderHTML, syncTrackSlider } from "./track-slider.js";

export function getScrollOffsetUnit(container) {
  const pressed = container?.querySelector('.tt-segment__btn[aria-pressed="true"]');
  const unit = pressed?.dataset?.value;
  return SCROLL_OFFSET_UNITS.includes(unit) ? unit : "%";
}

export function setScrollOffsetUnit(container, unit) {
  if (!container) return;
  const value = SCROLL_OFFSET_UNITS.includes(unit) ? unit : "%";
  container.querySelectorAll(".tt-segment__btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.dataset.value === value ? "true" : "false");
  });
}

export function applyScrollOffsetSliderLimits(input, unit) {
  if (!input) return;
  const limits = SCROLL_OFFSET_LIMITS[unit] || SCROLL_OFFSET_LIMITS["%"];
  input.min = limits.min;
  input.max = limits.max;
  input.step = limits.step;
  const val = parseFloat(input.value);
  if (Number.isFinite(val)) {
    if (val > limits.max) input.value = limits.max;
    if (val < limits.min) input.value = limits.min;
  }
  syncTrackSlider(input, getScrollOffsetUnit);
}

export function setScrollPositionSideMode(panel, prefix, side, mode) {
  const field = panel?.querySelector(`[data-st-position="${prefix}"]`);
  if (!field) return;
  const useOffset = mode === "offset";
  const edge = field.querySelector(`#tt-st-${prefix}-${side}-edge`);
  edge?.classList.toggle("is-offset-active", useOffset);
  edge?.classList.toggle("is-edge-selected", !useOffset);
  field
    .querySelector(`#tt-st-${prefix}-${side}-offset-col`)
    ?.classList.toggle("is-edge-selected", !useOffset);
}

export function syncScrollPositionSideModes(panel, prefix) {
  ["element", "view"].forEach((side) => {
    const offset = parseFloat(document.getElementById(`tt-st-${prefix}-${side}-offset`)?.value) || 0;
    setScrollPositionSideMode(panel, prefix, side, offset > 0 ? "offset" : "edge");
  });
}

export function resetScrollOffsetSide(panel, prefix, side) {
  const offsetInput = document.getElementById(`tt-st-${prefix}-${side}-offset`);
  const units = document.getElementById(`tt-st-${prefix}-${side}-units`);
  if (offsetInput) {
    offsetInput.value = 0;
    setScrollOffsetUnit(units, "%");
    applyScrollOffsetSliderLimits(offsetInput, "%");
  }
  setScrollPositionSideMode(panel, prefix, side, "edge");
}

export function readScrollPositionFromUI(prefix) {
  const elementEdge = document.getElementById(`tt-st-${prefix}-element`)?.value || "top";
  const viewEdge = document.getElementById(`tt-st-${prefix}-view`)?.value || "top";
  const elementOffset = parseFloat(document.getElementById(`tt-st-${prefix}-element-offset`)?.value) || 0;
  const viewOffset = parseFloat(document.getElementById(`tt-st-${prefix}-view-offset`)?.value) || 0;
  const elementUnit = getScrollOffsetUnit(document.getElementById(`tt-st-${prefix}-element-units`));
  const viewUnit = getScrollOffsetUnit(document.getElementById(`tt-st-${prefix}-view-units`));
  return formatScrollPosition({
    elementEdge,
    elementOffset,
    elementUnit,
    viewEdge,
    viewOffset,
    viewUnit,
  });
}

export function fillScrollPositionToUI(panel, prefix, str) {
  const p = parseScrollPosition(str);
  const elementSelect = document.getElementById(`tt-st-${prefix}-element`);
  const viewSelect = document.getElementById(`tt-st-${prefix}-view`);
  const elementOffset = document.getElementById(`tt-st-${prefix}-element-offset`);
  const viewOffset = document.getElementById(`tt-st-${prefix}-view-offset`);
  if (elementSelect) elementSelect.value = p.elementEdge;
  if (viewSelect) {
    viewSelect.value = SCROLL_VIEW_PRESETS.includes(p.viewEdge) ? p.viewEdge : "top";
  }
  if (elementOffset) {
    elementOffset.value = p.elementOffset;
    setScrollOffsetUnit(document.getElementById(`tt-st-${prefix}-element-units`), p.elementUnit);
    applyScrollOffsetSliderLimits(elementOffset, p.elementUnit);
  }
  if (viewOffset) {
    viewOffset.value = p.viewOffset;
    setScrollOffsetUnit(document.getElementById(`tt-st-${prefix}-view-units`), p.viewUnit);
    applyScrollOffsetSliderLimits(viewOffset, p.viewUnit);
  }
  syncScrollPositionSideModes(panel, prefix);
}

function buildScrollEdgeOptions(selected) {
  return SCROLL_EDGE_OPTIONS.map(
    (v) => `<option value="${v}"${v === selected ? " selected" : ""}>${v}</option>`
  ).join("");
}

function buildScrollOffsetUnitButtons(selected) {
  return SCROLL_OFFSET_UNITS.map(
    (unit) =>
      `<button type="button" class="tt-segment__btn tt-segment__btn--unit" data-value="${unit}" aria-pressed="${unit === selected ? "true" : "false"}">${unit}</button>`
  ).join("");
}

function buildScrollOffsetColumnHTML({ idPrefix, side, offset, unit }) {
  const sideId = side === "view" ? "view" : "element";
  const hint = side === "view" ? "Viewport offset" : "Element offset";
  return `
      <div class="tt-st-position__offset-col is-edge-selected" id="tt-st-${idPrefix}-${sideId}-offset-col">
        ${buildTrackSliderHTML({
          id: `tt-st-${idPrefix}-${sideId}-offset`,
          label: hint,
          min: 0,
          max: 100,
          step: 1,
          value: offset,
          compact: true,
          format: "scrollOffset",
        })}
        <div class="tt-st-position__units" id="tt-st-${idPrefix}-${sideId}-units" role="group" aria-label="${hint} unit">
          <div class="tt-segment tt-segment--units">${buildScrollOffsetUnitButtons(unit)}</div>
        </div>
      </div>`;
}

export function buildScrollPositionFieldHTML({ idPrefix, label, defaultStr }) {
  const parsed = parseScrollPosition(defaultStr);
  return `
      <div class="tt-field tt-st-position-field tt-scroll-section" data-st-position="${idPrefix}">
        <span class="tt-field__label">${label}</span>
        <div class="tt-st-position">
          <div class="tt-st-position__edges">
            <div class="tt-st-position__edge is-edge-selected" id="tt-st-${idPrefix}-element-edge">
              <span class="tt-st-position__hint">Element</span>
              <select class="tt-select" id="tt-st-${idPrefix}-element">${buildScrollEdgeOptions(parsed.elementEdge)}</select>
            </div>
            <div class="tt-st-position__edge is-edge-selected" id="tt-st-${idPrefix}-view-edge">
              <span class="tt-st-position__hint">Viewport</span>
              <select class="tt-select" id="tt-st-${idPrefix}-view">${buildScrollEdgeOptions(parsed.viewEdge)}</select>
            </div>
          </div>
          <div class="tt-st-position__offsets">
            ${buildScrollOffsetColumnHTML({
              idPrefix,
              side: "element",
              offset: parsed.elementOffset,
              unit: parsed.elementUnit,
            })}
            ${buildScrollOffsetColumnHTML({
              idPrefix,
              side: "view",
              offset: parsed.viewOffset,
              unit: parsed.viewUnit,
            })}
          </div>
        </div>
      </div>`;
}
