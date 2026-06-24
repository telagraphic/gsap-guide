import { buildTrackSliderHTML } from "../components/track-slider.js";
import { buildSegmentBarHTML, buildSegmentRowHTML } from "../components/segment-group.js";
import {
  buildDropdownFieldHTML,
  buildSelectRowHTML,
} from "../components/select-row.js";
import { buildScrollPositionFieldHTML } from "../components/scroll-position-field.js";
import { buildPropGridHTML } from "./prop-grid.js";
import { buildStaggerBlockHTML } from "./stagger-block.js";

export function injectPanel(options) {
  const {
    previewFonts,
    instanceList,
    activeInstanceId,
    codeDefaults,
    TEXT_ALIGN_OPTIONS,
    TEXT_TRANSFORM_OPTIONS,
    EASE_OPTIONS,
    STAGGER_FROM,
    ICON_RESET,
  } = options;

  const existing = document.getElementById("text-tuner-panel");
  if (existing) return existing;

  const aside = document.createElement("aside");
  aside.id = "text-tuner-panel";
  aside.className = "tt-panel";
  aside.setAttribute("role", "region");
  aside.setAttribute("aria-label", "Animation playground");
  aside.setAttribute("aria-hidden", "true");

  const fontOptions = previewFonts.map(
    (f) => `<option value="${f.cssVar}">${f.label}</option>`
  ).join("");
  const easeOptions = EASE_OPTIONS.map((e) => `<option value="${e}">${e}</option>`).join(
    ""
  );
  const staggerFromOptions = STAGGER_FROM.map(
    (v) => `<option value="${v}">${v}</option>`
  ).join("");

  const instanceOptions = instanceList
    .map(
      (inst) =>
        `<option value="${inst.id}"${inst.id === activeInstanceId ? " selected" : ""}>${inst.label}</option>`
    )
    .join("");
  const showInstanceRow = instanceList.length > 1;

  aside.innerHTML = `
      <div class="tt-panel__header">
        <div class="tt-panel__instance" id="tt-instance-row"${showInstanceRow ? "" : " hidden"}>
          <label class="tt-sr-only" for="tt-instance-select">Active instance</label>
          <select class="tt-select" id="tt-instance-select">${instanceOptions}</select>
        </div>
        <div class="tt-panel__header-actions">
          <button
            type="button"
            class="tt-segment__btn tt-segment__btn--muted"
            id="tt-follow-viewport"
            aria-pressed="false"
            title="Follow viewport"
          >Follow</button>
          <button
            type="button"
            class="tt-prop-reset"
            id="tt-reset"
            aria-label="Reset instance"
            title="Reset instance"
          >${ICON_RESET}</button>
          <button
            type="button"
            class="tt-segment__btn tt-segment__btn--muted"
            id="tt-reset-all"
            title="Reset all instances"
          >Reset all</button>
        </div>
        ${buildSegmentBarHTML({
          className: "tt-segment-bar--tabs",
          role: "tablist",
          buttonsHtml: `
            <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-tab="0" aria-selected="true">Type</button>
            <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-tab="1">Tween</button>
            <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-tab="2">Split</button>
            <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-tab="3">Scroll</button>`,
        })}
      </div>
      <div class="tt-panel__body">
        <div class="tt-tab-panel" data-tab-panel="0" role="tabpanel">
          ${buildDropdownFieldHTML({ id: "tt-font", label: "Font", optionsHtml: fontOptions })}
          ${buildTrackSliderHTML({
            id: "tt-font-size",
            label: "Size (rem)",
            min: 0.75,
            max: 6,
            step: 0.05,
            value: 1.25,
          })}
          ${buildTrackSliderHTML({
            id: "tt-line-height",
            label: "Line height",
            min: 0.8,
            max: 3,
            step: 0.05,
            value: 1.5,
          })}
          ${buildTrackSliderHTML({
            id: "tt-letter-spacing",
            label: "Letter spacing (em)",
            min: -0.15,
            max: 0.5,
            step: 0.01,
            value: 0,
            format: "letterSpacing",
          })}
          ${buildSegmentRowHTML({
            id: "tt-text-align",
            label: "Align",
            options: TEXT_ALIGN_OPTIONS,
            defaultValue: "left",
          })}
          ${buildSegmentRowHTML({
            id: "tt-text-transform",
            label: "Transform",
            options: TEXT_TRANSFORM_OPTIONS,
            defaultValue: "none",
          })}
        </div>
        <div class="tt-tab-panel tt-tab-panel--props" data-tab-panel="1" role="tabpanel" hidden>
          <div class="tt-control-stack">
            ${buildTrackSliderHTML({
              id: "tt-duration",
              label: "Duration",
              min: 0.1,
              max: 5,
              step: 0.05,
              value: 1,
            })}
            ${buildSelectRowHTML({ id: "tt-ease", label: "Ease", optionsHtml: easeOptions })}
            ${buildSelectRowHTML({
              id: "tt-animate-target",
              label: "Animate",
              optionsHtml: `
              <option value="lines">lines</option>
              <option value="words">words</option>
              <option value="chars">chars</option>`,
            })}
          </div>
          <fieldset class="tt-props-fieldset">
            <legend class="tt-sr-only">Properties and stagger</legend>
            ${buildSegmentBarHTML({
              className: "tt-segment-bar--subtabs",
              role: "tablist",
              ariaLabel: "Tween properties",
              buttonsHtml: `
                <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-subtab="0" aria-selected="true">Properties</button>
                <button type="button" class="tt-segment__btn tt-segment__btn--tab" role="tab" data-subtab="1">Stagger</button>`,
            })}
            <div class="tt-subtab-panel" data-subtab-panel="0" role="tabpanel">
              ${buildPropGridHTML()}
            </div>
            <div class="tt-subtab-panel" data-subtab-panel="1" role="tabpanel" hidden>
              ${buildStaggerBlockHTML(staggerFromOptions, easeOptions)}
            </div>
          </fieldset>
        </div>
        <div class="tt-tab-panel" data-tab-panel="2" role="tabpanel" hidden>
          <div class="tt-field">
            <span class="tt-field__label">Type</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="tt-segment__btn" id="tt-type-chars" aria-pressed="false">chars</button>
                <button type="button" class="tt-segment__btn" id="tt-type-words" aria-pressed="true">words</button>
                <button type="button" class="tt-segment__btn" id="tt-type-lines" aria-pressed="true">lines</button>`,
            })}
          </div>
          <div class="tt-field">
            <span class="tt-field__label">Mask</span>
            <div id="tt-mask-group">
              ${buildSegmentBarHTML({
                buttonsHtml: `
                  <button type="button" class="tt-segment__btn" id="tt-mask-chars" aria-pressed="false">chars</button>
                  <button type="button" class="tt-segment__btn" id="tt-mask-words" aria-pressed="false">words</button>
                  <button type="button" class="tt-segment__btn" id="tt-mask-lines" aria-pressed="true">lines</button>`,
              })}
            </div>
          </div>
          <div class="tt-field">
            <span class="tt-field__label">Split options</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="tt-segment__btn" id="tt-split-autosplit" aria-pressed="true">autoSplit</button>
                <button type="button" class="tt-segment__btn" id="tt-split-smartsplit" aria-pressed="true">smartSplit</button>`,
            })}
          </div>
          <fieldset class="tt-fieldset">
            <legend class="tt-fieldset__legend">Targets</legend>
            <div class="tt-field">
              <span class="tt-field__label">Text</span>
              <input type="text" class="tt-input" id="tt-target-text" />
            </div>
            <div class="tt-field">
              <span class="tt-field__label">Trigger</span>
              <input type="text" class="tt-input" id="tt-target-element" />
            </div>
          </fieldset>
        </div>
        <div class="tt-tab-panel tt-tab-panel--scroll" data-tab-panel="3" role="tabpanel" hidden>
          <div class="tt-field tt-scroll-section">
            <span class="tt-field__label">Trigger</span>
            <input type="text" class="tt-input" id="tt-st-trigger" />
          </div>
          ${buildScrollPositionFieldHTML({
            idPrefix: "start",
            label: "Start",
            defaultStr: codeDefaults?.scrollTrigger?.start || "top 25%",
          })}
          ${buildScrollPositionFieldHTML({
            idPrefix: "end",
            label: "End",
            defaultStr: codeDefaults?.scrollTrigger?.end || "top top",
          })}
          <div class="tt-field tt-field--scrub tt-scroll-section">
            <span class="tt-field__label">Scrub</span>
            <div id="tt-scrub-mode" data-mode="on">
              ${buildSegmentBarHTML({
                buttonsHtml: `
                  <button type="button" class="tt-segment__btn" id="tt-scrub-off">Off</button>
                  <button type="button" class="tt-segment__btn" id="tt-scrub-on" aria-pressed="true">On</button>
                  <button type="button" class="tt-segment__btn" id="tt-scrub-smooth">Smooth</button>`,
              })}
            </div>
            <div id="tt-scrub-smooth-wrap" hidden>
              ${buildTrackSliderHTML({
                id: "tt-scrub-smooth",
                label: "Smooth scrub",
                min: 0.1,
                max: 3,
                step: 0.1,
                value: 1,
              })}
            </div>
          </div>
          <div class="tt-field tt-scroll-section">
            <span class="tt-field__label">Debug</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `<button type="button" class="tt-segment__btn" id="tt-st-markers" aria-pressed="false">markers</button>`,
            })}
          </div>
        </div>
      </div>
      <div class="tt-panel__import" id="tt-import-drawer" hidden>
        <div class="tt-import">
          <label class="tt-import__label" for="tt-import-textarea">Paste canonical Copy code</label>
          <textarea
            class="tt-import__textarea"
            id="tt-import-textarea"
            rows="8"
            spellcheck="false"
            placeholder="SplitText.create(…)"
          ></textarea>
          <div class="tt-import__actions">
            <button type="button" class="tt-segment__btn" id="tt-import-convert">Convert</button>
            <button
              type="button"
              class="tt-segment__btn tt-segment__btn--accent"
              id="tt-import-apply"
              disabled
            >Apply</button>
          </div>
          <ul class="tt-import__warnings" id="tt-import-warnings" hidden></ul>
        </div>
      </div>
      <div class="tt-panel__dock">
        ${buildSegmentBarHTML({
          className: "tt-segment-bar--dock",
          buttonsHtml: `
            <button type="button" class="tt-segment__btn" id="tt-import-toggle">Import</button>
            <button type="button" class="tt-segment__btn tt-segment__btn--accent" id="tt-copy-config">Config</button>
            <button type="button" class="tt-segment__btn" id="tt-copy-code">Code</button>
            <button type="button" class="tt-segment__btn" id="tt-copy-css">CSS</button>`,
        })}
      </div>
      <footer class="tt-footer" id="tt-footer">
        <kbd>⌘K</kbd> panel · <kbd>⌘1</kbd>–<kbd>⌘4</kbd> tabs · <kbd>Esc</kbd> close &amp; commit
        <span id="tt-footer-instance" hidden></span>
      </footer>
    `;

  document.body.appendChild(aside);
  document.body.classList.add("text-tuner-active");

  return aside;
}
