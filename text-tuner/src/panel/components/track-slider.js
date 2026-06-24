import { formatLetterSpacing } from "../../schema/config.js";

export function buildTrackSliderHTML({
  id,
  label,
  min,
  max,
  step,
  value,
  format = "decimal",
  compact = false,
  labelPlacement = "inside",
  inputAttrs = "",
}) {
  const classes = ["tt-track-slider"];
  if (compact) classes.push("tt-track-slider--compact");
  if (labelPlacement === "above") classes.push("tt-track-slider--label-above");
  if (labelPlacement === "none") classes.push("tt-track-slider--label-none");

  const val = value ?? min;
  const labelAbove =
    labelPlacement === "above" && label
      ? `<span class="tt-track-slider__label-above">${label}</span>`
      : "";
  const labelInside =
    labelPlacement === "inside" && label
      ? `<span class="tt-track-slider__label">${label}</span>`
      : "";

  return `
      <div class="${classes.join(" ")} tt-field-block" data-value-format="${format}">
        ${labelAbove}
        <div class="tt-track-slider__chrome">
          <div class="tt-track-slider__fill" aria-hidden="true"></div>
          ${labelInside}
          <output class="tt-track-slider__value" id="${id}-out" for="${id}"></output>
          <input
            type="range"
            class="tt-track-slider__input"
            id="${id}"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${val}"
            aria-valuemin="${min}"
            aria-valuemax="${max}"
            ${inputAttrs}
          />
        </div>
      </div>`;
}

/**
 * @param {HTMLInputElement} input
 * @param {(container: Element | null) => string} [getScrollOffsetUnit]
 */
export function formatTrackSliderValue(input, getScrollOffsetUnit) {
  const format = input.closest("[data-value-format]")?.dataset.valueFormat || "decimal";
  const v = parseFloat(input.value);
  if (format === "letterSpacing") return formatLetterSpacing(v);
  if (format === "integer") return String(Math.round(v));
  if (format === "scrollOffset" && getScrollOffsetUnit) {
    const unit = getScrollOffsetUnit(
      input.closest(".tt-st-position__offset-col")?.querySelector(".tt-st-position__units")
    );
    const step = parseFloat(input.step) || 1;
    const decimals = unit === "px" && step >= 5 ? 0 : unit === "vh" ? 1 : 0;
    const display = decimals === 0 ? Math.round(v) : v.toFixed(decimals);
    return `${display}${unit}`;
  }
  const step = parseFloat(input.step) || 1;
  const decimals = step < 0.05 ? 2 : step < 1 ? 1 : 0;
  return v.toFixed(decimals);
}

/**
 * @param {HTMLInputElement} input
 * @param {(container: Element | null) => string} [getScrollOffsetUnit]
 */
export function syncTrackSlider(input, getScrollOffsetUnit) {
  if (!input?.matches?.(".tt-track-slider__input")) return;
  const wrap = input.closest(".tt-track-slider");
  const fill = wrap?.querySelector(".tt-track-slider__fill");
  const output = wrap?.querySelector(".tt-track-slider__value");
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
  if (fill) fill.style.width = `${pct}%`;
  if (output) output.textContent = formatTrackSliderValue(input, getScrollOffsetUnit);
}

export function syncAllTrackSliders(root, getScrollOffsetUnit) {
  if (!root) return;
  root.querySelectorAll(".tt-track-slider__input").forEach((input) =>
    syncTrackSlider(input, getScrollOffsetUnit)
  );
}

export function initTrackSliders(root, getScrollOffsetUnit) {
  if (!root) return;
  root.querySelectorAll(".tt-track-slider__input").forEach((input) => {
    syncTrackSlider(input, getScrollOffsetUnit);
    if (input.dataset.pgTrackBound) return;
    input.dataset.pgTrackBound = "1";
    input.addEventListener("input", () => syncTrackSlider(input, getScrollOffsetUnit));
  });
}
