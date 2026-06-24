import { ANIM_PROPS } from "../../schema/anim-props.js";

export function bindPropertiesControls(ctx) {
  bindPropResets(ctx);
  bindSplitTextControls(ctx);
  bindStaggerTimingActivation(ctx);
  bindStaggerAxis(ctx);
  bindLiveControls(ctx);
}

function bindPropResets(ctx) {
  const { panel, resetAnimProp } = ctx;
  panel?.querySelectorAll("[data-prop-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      resetAnimProp(btn.dataset.propReset);
    });
  });
}

function bindSplitTextControls(ctx) {
  const { el, getTypeArray, getMaskButtons, markSplitTextDirty } = ctx;

  [el.typeChars, el.typeWords, el.typeLines].forEach((btn) => {
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      if (!getTypeArray()) {
        btn.setAttribute("aria-pressed", "true");
      }
      markSplitTextDirty();
    });
  });
  getMaskButtons().forEach((btn) => {
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      getMaskButtons().forEach((b) => b.setAttribute("aria-pressed", "false"));
      if (!pressed) btn.setAttribute("aria-pressed", "true");
      markSplitTextDirty();
    });
  });
  [el.splitAutoSplit, el.splitSmartSplit].forEach((btn) => {
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", pressed ? "false" : "true");
      markSplitTextDirty();
    });
  });
  [el.targetText, el.targetElement].forEach((input) => {
    input.addEventListener("change", markSplitTextDirty);
    input.addEventListener("input", markSplitTextDirty);
  });
}

function bindStaggerAxis(ctx) {
  const { el, setStaggerAxis, requestLiveUpdate } = ctx;
  [
    { btn: el.staggerAxisBoth, axis: "both" },
    { btn: el.staggerAxisX, axis: "x" },
    { btn: el.staggerAxisY, axis: "y" },
  ].forEach(({ btn, axis }) => {
    btn?.addEventListener("click", () => {
      setStaggerAxis(axis);
      requestLiveUpdate();
    });
  });
}

function bindStaggerTimingActivation(ctx) {
  const { el, setStaggerTiming } = ctx;
  const activateAmount = () => setStaggerTiming("amount");
  const activateEach = () => setStaggerTiming("each");
  [el.staggerAmount].filter(Boolean).forEach((input) => {
    input.addEventListener("pointerdown", activateAmount);
    input.addEventListener("focus", activateAmount);
    input.addEventListener("input", activateAmount);
  });
  [el.staggerEach].filter(Boolean).forEach((input) => {
    input.addEventListener("pointerdown", activateEach);
    input.addEventListener("focus", activateEach);
    input.addEventListener("input", activateEach);
  });
}

function bindLiveControls(ctx) {
  const { el, requestLiveUpdate } = ctx;
  const liveInputs = [
    el.duration,
    el.ease,
    el.animateTarget,
    el.staggerAmount,
    el.staggerEach,
    el.staggerFrom,
    el.staggerEase,
    el.staggerGrid,
    el.stTrigger,
    el.stStartElement,
    el.stStartView,
    el.stStartElementOffset,
    el.stStartViewOffset,
    el.stEndElement,
    el.stEndView,
    el.stEndElementOffset,
    el.stEndViewOffset,
    el.scrubSmooth,
    ...ANIM_PROPS.flatMap((p) => [el[`prop_${p.key}_start`], el[`prop_${p.key}_end`]]),
  ].filter(Boolean);

  liveInputs.forEach((input) => {
    const evt = input.type === "range" || input.id === "tt-stagger-grid" ? "input" : "change";
    input.addEventListener(evt, () => requestLiveUpdate());
    if (input.id === "tt-stagger-grid") {
      input.addEventListener("change", () => requestLiveUpdate());
    }
  });
}
