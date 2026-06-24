import {
  typeIncludes,
  parseStaggerGrid,
  formatStaggerGridForInput,
  normalizeStaggerConfig,
} from "../schema/config.js";
import { ANIM_PROPS } from "../schema/anim-props.js";
import { warnUnknownFontVar } from "../fonts/index.js";
import { getSegmentGroupValue, setSegmentGroupValue } from "./components/segment-group.js";
import {
  readScrollPositionFromUI,
  fillScrollPositionToUI,
  getScrollOffsetUnit,
} from "./components/scroll-position-field.js";
import { syncAllTrackSliders } from "./components/track-slider.js";

export function createFormState({
  el,
  codeDefaults,
  previewFonts,
  panel,
  syncTrackSliderFn,
  requestLiveUpdate = () => {},
}) {
  function fillScrollPosition(prefix, str) {
    fillScrollPositionToUI(panel, prefix, str);
  }

  function getTypeArray() {
    const types = [];
    if (el.typeChars?.getAttribute("aria-pressed") === "true") types.push("chars");
    if (el.typeWords?.getAttribute("aria-pressed") === "true") types.push("words");
    if (el.typeLines?.getAttribute("aria-pressed") === "true") types.push("lines");
    return types.length ? types.join(",") : "lines";
  }

  function setTypeToggles(typeStr) {
    const set = new Set(
      String(typeStr)
        .split(",")
        .map((s) => s.trim())
    );
    el.typeChars?.setAttribute("aria-pressed", set.has("chars") ? "true" : "false");
    el.typeWords?.setAttribute("aria-pressed", set.has("words") ? "true" : "false");
    el.typeLines?.setAttribute("aria-pressed", set.has("lines") ? "true" : "false");
  }

  function getMaskButtons() {
    return [el.maskChars, el.maskWords, el.maskLines].filter(Boolean);
  }

  function normalizeMaskValue(mask) {
    if (!mask || mask === "none") return "none";
    return mask;
  }

  function getMaskValue() {
    if (el.maskChars?.getAttribute("aria-pressed") === "true") return "chars";
    if (el.maskWords?.getAttribute("aria-pressed") === "true") return "words";
    if (el.maskLines?.getAttribute("aria-pressed") === "true") return "lines";
    return "none";
  }

  function setMaskToggle(mask) {
    const value = normalizeMaskValue(mask);
    el.maskChars?.setAttribute("aria-pressed", value === "chars" ? "true" : "false");
    el.maskWords?.setAttribute("aria-pressed", value === "words" ? "true" : "false");
    el.maskLines?.setAttribute("aria-pressed", value === "lines" ? "true" : "false");
  }

  function readScrubFromUI() {
    const mode = el.scrubMode?.getAttribute("data-mode") || "on";
    if (mode === "off") return { scrub: false, scrubMode: "off" };
    if (mode === "smooth") {
      return {
        scrub: parseFloat(el.scrubSmooth?.value) || 1,
        scrubMode: "smooth",
        scrubSmooth: parseFloat(el.scrubSmooth?.value) || 1,
      };
    }
    return { scrub: true, scrubMode: "on" };
  }

  function setScrubUI(scrollTrigger) {
    let mode = "on";
    if (scrollTrigger.scrub === false || scrollTrigger.scrubMode === "off") mode = "off";
    else if (typeof scrollTrigger.scrub === "number") mode = "smooth";
    el.scrubMode?.setAttribute("data-mode", mode);
    el.scrubSmoothWrap.hidden = mode !== "smooth";
    if (mode === "smooth") {
      el.scrubSmooth.value =
        typeof scrollTrigger.scrub === "number"
          ? scrollTrigger.scrub
          : scrollTrigger.scrubSmooth || 1;
    }
    el.scrubOff?.setAttribute("aria-pressed", mode === "off" ? "true" : "false");
    el.scrubOn?.setAttribute("aria-pressed", mode === "on" ? "true" : "false");
    el.scrubSmoothBtn?.setAttribute("aria-pressed", mode === "smooth" ? "true" : "false");
  }

  function getStaggerAxis() {
    if (el.staggerAxisX?.getAttribute("aria-pressed") === "true") return "x";
    if (el.staggerAxisY?.getAttribute("aria-pressed") === "true") return "y";
    return "both";
  }

  function setStaggerAxis(axis) {
    const value = axis === "x" || axis === "y" ? axis : "both";
    el.staggerAxisBoth?.setAttribute("aria-pressed", value === "both" ? "true" : "false");
    el.staggerAxisX?.setAttribute("aria-pressed", value === "x" ? "true" : "false");
    el.staggerAxisY?.setAttribute("aria-pressed", value === "y" ? "true" : "false");
  }

  function setStaggerTiming(timing) {
    const mode = timing === "each" ? "each" : "amount";
    el.staggerTiming?.setAttribute("data-timing", mode);
    el.staggerTiming?.classList.toggle("is-timing-amount", mode === "amount");
    el.staggerTiming?.classList.toggle("is-timing-each", mode === "each");
  }

  function updateAnimateTargetOptions(typeStr) {
    ["chars", "words", "lines"].forEach((unit) => {
      const opt = el.animateTarget?.querySelector(`option[value="${unit}"]`);
      if (opt) opt.disabled = !typeIncludes(typeStr, unit);
    });
    if (!typeIncludes(typeStr, el.animateTarget.value)) {
      if (typeIncludes(typeStr, "lines")) el.animateTarget.value = "lines";
      else if (typeIncludes(typeStr, "words")) el.animateTarget.value = "words";
      else if (typeIncludes(typeStr, "chars")) el.animateTarget.value = "chars";
    }
  }

  function readConfigFromForm() {
    const from = {};
    const to = {};
    ANIM_PROPS.forEach((prop) => {
      const startEl = el[`prop_${prop.key}_start`];
      const endEl = el[`prop_${prop.key}_end`];
      if (prop.type === "range") {
        if (startEl) from[prop.key] = parseFloat(startEl.value);
        if (endEl) to[prop.key] = parseFloat(endEl.value);
      } else if (prop.type === "text") {
        if (startEl?.value.trim()) from[prop.key] = startEl.value.trim();
        if (endEl?.value.trim()) to[prop.key] = endEl.value.trim();
      }
    });

    const staggerTiming = el.staggerTiming?.getAttribute("data-timing") || "amount";
    const stagger = {
      timing: staggerTiming,
      amount: parseFloat(el.staggerAmount?.value) || 0.1,
      each: parseFloat(el.staggerEach?.value) ?? 0.1,
      from: el.staggerFrom?.value || "start",
      ease: el.staggerEase?.value === "none" ? null : el.staggerEase?.value,
      grid: parseStaggerGrid(el.staggerGrid?.value),
      axis: getStaggerAxis(),
    };

    const scrubFields = readScrubFromUI();

    return {
      targets: {
        element: el.targetElement?.value || codeDefaults.targets.element,
        text: el.targetText?.value || codeDefaults.targets.text,
      },
      splitText: {
        type: getTypeArray(),
        mask: getMaskValue(),
        autoSplit: el.splitAutoSplit?.getAttribute("aria-pressed") === "true",
        smartSplit: el.splitSmartSplit?.getAttribute("aria-pressed") === "true",
      },
      animate: el.animateTarget?.value || "lines",
      from,
      to: {
        ...to,
        duration: parseFloat(el.duration?.value) || 1,
        ease: el.ease?.value || "power2.out",
      },
      stagger,
      scrollTrigger: {
        trigger: el.stTrigger?.value || codeDefaults.scrollTrigger.trigger,
        start: readScrollPositionFromUI("start"),
        end: readScrollPositionFromUI("end"),
        ...scrubFields,
        markers: el.stMarkers?.getAttribute("aria-pressed") === "true",
      },
      typography: {
        fontVar: el.fontSelect?.value,
        fontSize: parseFloat(el.fontSize?.value),
        lineHeight: parseFloat(el.lineHeight?.value),
        letterSpacing: parseFloat(el.letterSpacing?.value),
        textAlign: getSegmentGroupValue(el.textAlign),
        textTransform: getSegmentGroupValue(el.textTransform),
      },
    };
  }

  function fillFormFromConfig(cfg) {
    setTypeToggles(cfg.splitText.type);
    setMaskToggle(cfg.splitText.mask);
    el.splitAutoSplit?.setAttribute("aria-pressed", cfg.splitText.autoSplit ? "true" : "false");
    el.splitSmartSplit?.setAttribute("aria-pressed", cfg.splitText.smartSplit ? "true" : "false");
    el.targetElement.value = cfg.targets.element;
    el.targetText.value = cfg.targets.text;

    el.animateTarget.value = cfg.animate;
    updateAnimateTargetOptions(cfg.splitText.type);

    ANIM_PROPS.forEach((prop) => {
      const startEl = el[`prop_${prop.key}_start`];
      const endEl = el[`prop_${prop.key}_end`];
      const fromVal = cfg.from[prop.key];
      const toVal = cfg.to[prop.key];
      if (startEl) startEl.value = fromVal !== undefined ? fromVal : prop.defaultFrom;
      if (endEl) endEl.value = toVal !== undefined ? toVal : prop.defaultTo;
    });

    el.duration.value = cfg.to.duration ?? 1;
    el.ease.value = cfg.to.ease ?? "power2.out";

    const stagger = normalizeStaggerConfig(cfg.stagger);
    el.staggerAmount.value = stagger.amount;
    el.staggerEach.value = stagger.each;
    setStaggerTiming(stagger.timing);
    el.staggerFrom.value = stagger.from;
    el.staggerEase.value = stagger.ease || "none";
    el.staggerGrid.value = formatStaggerGridForInput(stagger.grid);
    setStaggerAxis(stagger.axis);

    el.stTrigger.value = cfg.scrollTrigger.trigger;

    fillScrollPosition("start", cfg.scrollTrigger.start);
    fillScrollPosition("end", cfg.scrollTrigger.end);

    el.stMarkers?.setAttribute("aria-pressed", cfg.scrollTrigger.markers ? "true" : "false");
    setScrubUI(cfg.scrollTrigger);

    warnUnknownFontVar(cfg.typography.fontVar, previewFonts);
    el.fontSelect.value = cfg.typography.fontVar;
    el.fontSize.value = cfg.typography.fontSize;
    el.lineHeight.value = cfg.typography.lineHeight;
    el.letterSpacing.value = cfg.typography.letterSpacing;
    setSegmentGroupValue(el.textAlign, cfg.typography.textAlign);
    setSegmentGroupValue(el.textTransform, cfg.typography.textTransform);

    syncAllTrackSliders(panel, getScrollOffsetUnit);
  }

  function resetAnimProp(propKey) {
    const prop = ANIM_PROPS.find((p) => p.key === propKey);
    if (!prop) return;
    const startEl = el[`prop_${prop.key}_start`];
    const endEl = el[`prop_${prop.key}_end`];
    if (startEl) {
      startEl.value = prop.defaultFrom;
      syncTrackSliderFn(startEl);
    }
    if (endEl) {
      endEl.value = prop.defaultTo;
      syncTrackSliderFn(endEl);
    }
    requestLiveUpdate();
  }

  return {
    readConfigFromForm,
    fillFormFromConfig,
    getTypeArray,
    setTypeToggles,
    getMaskValue,
    setMaskToggle,
    getMaskButtons,
    readScrubFromUI,
    setScrubUI,
    getStaggerAxis,
    setStaggerAxis,
    setStaggerTiming,
    updateAnimateTargetOptions,
    resetAnimProp,
  };
}
