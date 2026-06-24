import { ANIM_PROPS } from "../schema/anim-props.js";

export function cachePanelElements() {
  const el = {};
  const panel = document.getElementById("text-tuner-panel");
  const tabButtons = [...panel.querySelectorAll(".tt-segment-bar--tabs .tt-segment__btn")];
  const tabPanels = [...panel.querySelectorAll(".tt-tab-panel")];

  let subTabButtons = [];
  let subTabPanels = [];
  const propertiesPanel = panel.querySelector('[data-tab-panel="1"]');
  if (propertiesPanel) {
    subTabButtons = [...propertiesPanel.querySelectorAll(".tt-segment-bar--subtabs .tt-segment__btn")];
    subTabPanels = [...propertiesPanel.querySelectorAll(".tt-subtab-panel")];
  }

  el.fontSelect = document.getElementById("tt-font");
  el.fontSize = document.getElementById("tt-font-size");
  el.fontSizeOut = document.getElementById("tt-font-size-out");
  el.lineHeight = document.getElementById("tt-line-height");
  el.lineHeightOut = document.getElementById("tt-line-height-out");
  el.letterSpacing = document.getElementById("tt-letter-spacing");
  el.letterSpacingOut = document.getElementById("tt-letter-spacing-out");
  el.textAlign = document.getElementById("tt-text-align");
  el.textTransform = document.getElementById("tt-text-transform");

  el.duration = document.getElementById("tt-duration");
  el.durationOut = document.getElementById("tt-duration-out");
  el.ease = document.getElementById("tt-ease");
  el.animateTarget = document.getElementById("tt-animate-target");

  el.staggerTiming = document.getElementById("tt-stagger-timing");
  el.staggerAmount = document.getElementById("tt-stagger-amount");
  el.staggerAmountOut = document.getElementById("tt-stagger-amount-out");
  el.staggerEach = document.getElementById("tt-stagger-each");
  el.staggerEachOut = document.getElementById("tt-stagger-each-out");
  el.staggerFrom = document.getElementById("tt-stagger-from");
  el.staggerEase = document.getElementById("tt-stagger-ease");
  el.staggerGrid = document.getElementById("tt-stagger-grid");
  el.staggerAxisBoth = document.getElementById("tt-stagger-axis-both");
  el.staggerAxisX = document.getElementById("tt-stagger-axis-x");
  el.staggerAxisY = document.getElementById("tt-stagger-axis-y");

  el.typeChars = document.getElementById("tt-type-chars");
  el.typeWords = document.getElementById("tt-type-words");
  el.typeLines = document.getElementById("tt-type-lines");
  el.maskChars = document.getElementById("tt-mask-chars");
  el.maskWords = document.getElementById("tt-mask-words");
  el.maskLines = document.getElementById("tt-mask-lines");
  el.splitAutoSplit = document.getElementById("tt-split-autosplit");
  el.splitSmartSplit = document.getElementById("tt-split-smartsplit");
  el.targetText = document.getElementById("tt-target-text");
  el.targetElement = document.getElementById("tt-target-element");

  el.stTrigger = document.getElementById("tt-st-trigger");
  el.stStartElement = document.getElementById("tt-st-start-element");
  el.stStartView = document.getElementById("tt-st-start-view");
  el.stStartElementOffset = document.getElementById("tt-st-start-element-offset");
  el.stStartViewOffset = document.getElementById("tt-st-start-view-offset");
  el.stEndElement = document.getElementById("tt-st-end-element");
  el.stEndView = document.getElementById("tt-st-end-view");
  el.stEndElementOffset = document.getElementById("tt-st-end-element-offset");
  el.stEndViewOffset = document.getElementById("tt-st-end-view-offset");
  el.stMarkers = document.getElementById("tt-st-markers");
  el.scrubMode = document.getElementById("tt-scrub-mode");
  el.scrubOff = document.getElementById("tt-scrub-off");
  el.scrubOn = document.getElementById("tt-scrub-on");
  el.scrubSmoothBtn = document.getElementById("tt-scrub-smooth");
  el.scrubSmoothWrap = document.getElementById("tt-scrub-smooth-wrap");
  el.scrubSmooth = document.getElementById("tt-scrub-smooth");
  el.scrubSmoothOut = document.getElementById("tt-scrub-smooth-out");

  ANIM_PROPS.forEach((prop) => {
    el[`prop_${prop.key}_start`] = document.getElementById(`tt-prop-${prop.key}-start`);
    el[`prop_${prop.key}_end`] = document.getElementById(`tt-prop-${prop.key}-end`);
    el[`prop_${prop.key}_start_out`] = document.getElementById(`tt-prop-${prop.key}-start-out`);
    el[`prop_${prop.key}_end_out`] = document.getElementById(`tt-prop-${prop.key}-end-out`);
  });

  return { panel, tabButtons, tabPanels, subTabButtons, subTabPanels, el };
}
