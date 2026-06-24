import { ANIM_PROPS } from "../../schema/anim-props.js";
import { ICON_RESET } from "../icons.js";
import { buildTrackSliderHTML } from "../components/track-slider.js";

export function buildPropGridHTML() {
  const resetBtn = (key) => `
      <button
        type="button"
        class="tt-prop-reset tt-prop-row__reset"
        data-prop-reset="${key}"
        aria-label="Reset ${key} to defaults"
        title="Reset to defaults"
      >${ICON_RESET}</button>`;

  const blocks = ANIM_PROPS.map((prop) => {
    if (prop.type === "text") {
      return `
          <div class="tt-prop-row tt-prop-row--text" data-prop="${prop.key}">
            <div class="tt-control-bar tt-control-bar--compact">
              <span class="tt-control-bar__label tt-control-bar__label--prop">${prop.key}</span>
              <input type="text" class="tt-input" id="tt-prop-${prop.key}-start" data-role="prop-start" aria-label="${prop.key} start" placeholder="—" />
            </div>
            ${resetBtn(prop.key)}
            <div class="tt-control-bar tt-control-bar--value-only">
              <input type="text" class="tt-input" id="tt-prop-${prop.key}-end" data-role="prop-end" aria-label="${prop.key} end" placeholder="—" />
            </div>
          </div>`;
    }
    return `
        <div class="tt-prop-row" data-prop="${prop.key}">
          ${buildTrackSliderHTML({
            id: `tt-prop-${prop.key}-start`,
            label: prop.key,
            min: prop.min,
            max: prop.max,
            step: prop.step,
            value: prop.defaultFrom,
            compact: true,
            labelPlacement: "inside",
            inputAttrs: `data-role="prop-start" aria-label="${prop.key} start"`,
          })}
          ${resetBtn(prop.key)}
          ${buildTrackSliderHTML({
            id: `tt-prop-${prop.key}-end`,
            min: prop.min,
            max: prop.max,
            step: prop.step,
            value: prop.defaultTo,
            compact: true,
            labelPlacement: "none",
            inputAttrs: `data-role="prop-end" aria-label="${prop.key} end"`,
          })}
        </div>`;
  }).join("");

  return `
      <div class="tt-prop-list">
        <div class="tt-prop-row tt-prop-row--head" aria-hidden="true">
          <span class="tt-prop-row__head">Start</span>
          <span class="tt-prop-row__head-spacer"></span>
          <span class="tt-prop-row__head">End</span>
        </div>
        ${blocks}
      </div>`;
}
