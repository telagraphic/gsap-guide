import {
  setScrollOffsetUnit,
  applyScrollOffsetSliderLimits,
  setScrollPositionSideMode,
  syncScrollPositionSideModes,
  resetScrollOffsetSide,
} from "../components/scroll-position-field.js";

export function bindScrollControls(ctx) {
  bindScrubMode(ctx);
  bindScrollOffsetControls(ctx);
  bindScrollPositionControls(ctx);
}

function bindScrubMode(ctx) {
  const { el, requestLiveUpdate } = ctx;
  const setMode = (mode) => {
    el.scrubMode.setAttribute("data-mode", mode);
    el.scrubOff.setAttribute("aria-pressed", mode === "off" ? "true" : "false");
    el.scrubOn.setAttribute("aria-pressed", mode === "on" ? "true" : "false");
    el.scrubSmoothBtn.setAttribute("aria-pressed", mode === "smooth" ? "true" : "false");
    el.scrubSmoothWrap.hidden = mode !== "smooth";
    requestLiveUpdate();
  };
  el.scrubOff.addEventListener("click", () => setMode("off"));
  el.scrubOn.addEventListener("click", () => setMode("on"));
  el.scrubSmoothBtn.addEventListener("click", () => setMode("smooth"));
  el.scrubSmooth.addEventListener("input", () => requestLiveUpdate());
}

function bindScrollOffsetControls(ctx) {
  const { panel, requestLiveUpdate } = ctx;
  ["start", "end"].forEach((prefix) => {
    ["element", "view"].forEach((side) => {
      const units = document.getElementById(`tt-st-${prefix}-${side}-units`);
      const offsetInput = document.getElementById(`tt-st-${prefix}-${side}-offset`);
      const activateOffset = () => {
        const value = parseFloat(offsetInput?.value) || 0;
        if (value > 0) setScrollPositionSideMode(panel, prefix, side, "offset");
      };
      units?.querySelectorAll(".tt-segment__btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const unit = btn.dataset.value;
          setScrollOffsetUnit(units, unit);
          applyScrollOffsetSliderLimits(offsetInput, unit);
          activateOffset();
          requestLiveUpdate();
        });
      });
      offsetInput?.addEventListener("pointerdown", activateOffset);
      offsetInput?.addEventListener("focus", activateOffset);
      offsetInput?.addEventListener("input", () => {
        const value = parseFloat(offsetInput.value) || 0;
        setScrollPositionSideMode(panel, prefix, side, value > 0 ? "offset" : "edge");
        requestLiveUpdate();
      });
    });
  });
}

function bindScrollPositionControls(ctx) {
  const { panel, el, requestLiveUpdate } = ctx;
  ["start", "end"].forEach((which) => {
    const element = which === "start" ? el.stStartElement : el.stEndElement;
    const view = which === "start" ? el.stStartView : el.stEndView;
    element?.addEventListener("change", () => {
      resetScrollOffsetSide(panel, which, "element");
      syncScrollPositionSideModes(panel, which);
      requestLiveUpdate();
    });
    view?.addEventListener("change", () => {
      resetScrollOffsetSide(panel, which, "view");
      syncScrollPositionSideModes(panel, which);
      requestLiveUpdate();
    });
  });

  el.stMarkers?.addEventListener("click", () => {
    const pressed = el.stMarkers.getAttribute("aria-pressed") === "true";
    el.stMarkers.setAttribute("aria-pressed", pressed ? "false" : "true");
    requestLiveUpdate();
  });
}
