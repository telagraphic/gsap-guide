import { buildTrackSliderHTML } from "../components/track-slider.js";
import { buildDropdownFieldHTML } from "../components/select-row.js";
import { buildSegmentBarHTML } from "../components/segment-group.js";

export function buildStaggerBlockHTML(staggerFromOptions, easeOptions) {
  return `
        <div class="tt-stagger-block">
          <div class="tt-stagger-timing-row is-timing-amount" id="tt-stagger-timing" data-timing="amount">
            ${buildTrackSliderHTML({
              id: "tt-stagger-amount",
              label: "Amount",
              min: 0,
              max: 2,
              step: 0.01,
              value: 0.1,
            })}
            ${buildTrackSliderHTML({
              id: "tt-stagger-each",
              label: "Each",
              min: 0,
              max: 2,
              step: 0.01,
              value: 0.1,
            })}
          </div>
          ${buildDropdownFieldHTML({
            id: "tt-stagger-from",
            label: "From",
            optionsHtml: staggerFromOptions,
          })}
          ${buildDropdownFieldHTML({
            id: "tt-stagger-ease",
            label: "Ease",
            optionsHtml: easeOptions,
          })}
          <div class="tt-field">
            <span class="tt-field__label">Grid</span>
            <div class="tt-control-bar tt-control-bar--value-only tt-control-bar--no-focus-ring">
              <input
                type="text"
                class="tt-input"
                id="tt-stagger-grid"
                placeholder="[5, 19]"
                aria-label="Stagger grid"
                spellcheck="false"
              />
            </div>
          </div>
          <div class="tt-field">
            <span class="tt-field__label">Axis</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="tt-segment__btn" id="tt-stagger-axis-both" aria-pressed="true">both</button>
                <button type="button" class="tt-segment__btn" id="tt-stagger-axis-x" aria-pressed="false">x</button>
                <button type="button" class="tt-segment__btn" id="tt-stagger-axis-y" aria-pressed="false">y</button>`,
            })}
          </div>
        </div>`;
}
