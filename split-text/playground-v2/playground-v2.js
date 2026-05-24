/**
 * Playground v2 — SplitText + ScrollTrigger tuning panel (dev only).
 * Cmd/Ctrl+K toggles panel. Cmd/Ctrl+1–4 switches tabs.
 */

(function () {
  const LIVE_DEBOUNCE_MS = 48;
  const REBUILD_DEBOUNCE_MS = 120;

  const FONTS = [
    { label: "Basier Circle", cssVar: "--font-basier-circle" },
    { label: "Editorial New", cssVar: "--font-editorial-new" },
    { label: "FH 1089", cssVar: "--font-fh-1089" },
    { label: "FH Alpha", cssVar: "--font-fh-alpha" },
    { label: "FH Anorma", cssVar: "--font-fh-anorma" },
    { label: "FH Cordelia", cssVar: "--font-fh-cordelia" },
    { label: "FH Dfaalt", cssVar: "--font-fh-dfaalt" },
    { label: "FH Duo", cssVar: "--font-fh-duo" },
    { label: "FH Duo Display", cssVar: "--font-fh-duo-display" },
    { label: "FH Enso", cssVar: "--font-fh-enso" },
    { label: "FH Giselle", cssVar: "--font-fh-giselle" },
    { label: "FH Lecturis", cssVar: "--font-fh-lecturis" },
    { label: "FH Noetica", cssVar: "--font-fh-noetica" },
    { label: "FH Noetica Display", cssVar: "--font-fh-noetica-display" },
    { label: "FH Oscar Condensed", cssVar: "--font-fh-oscar-condensed" },
    { label: "FH Oscar Pro", cssVar: "--font-fh-oscar-pro" },
    { label: "FH Premier", cssVar: "--font-fh-premier" },
    { label: "FH Total Display", cssVar: "--font-fh-total-display" },
    { label: "FH Total Fine", cssVar: "--font-fh-total-fine" },
    { label: "Giest", cssVar: "--font-giest" },
    { label: "Giest Mono", cssVar: "--font-giest-mono" },
    { label: "KH Hekto Lut", cssVar: "--font-kh-hekto-lut" },
    { label: "KH Hekto Plan", cssVar: "--font-kh-hekto-plan" },
    { label: "Lock Serif", cssVar: "--font-lock-serif" },
    { label: "Maple Mono", cssVar: "--font-maple-mono" },
  ];

  const EASE_OPTIONS = [
    "none",
    "power1.out",
    "power2.out",
    "power3.out",
    "power4.out",
    "back.out(1.2)",
    "elastic.out(1, 0.5)",
    "bounce.out",
    "circ.out",
    "expo.out",
  ];

  const STAGGER_FROM = ["start", "center", "end", "edges", "random"];

  const SCROLL_EDGE_OPTIONS = ["top", "center", "bottom"];
  const SCROLL_VIEW_PRESETS = ["top", "center", "bottom"];

  const ICON_RESET = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;

  const ICON_ALIGN_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
  const ICON_ALIGN_CENTER = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="4" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="4" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
  const ICON_ALIGN_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="6" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="6" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
  const ICON_ALIGN_JUSTIFY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="6" width="12" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="13" width="12" height="1.25" rx="0.25"/></svg>`;

  const TEXT_ALIGN_OPTIONS = [
    { value: "left", label: "Left", icon: ICON_ALIGN_LEFT },
    { value: "center", label: "Center", icon: ICON_ALIGN_CENTER },
    { value: "right", label: "Right", icon: ICON_ALIGN_RIGHT },
    { value: "justify", label: "Justify", icon: ICON_ALIGN_JUSTIFY },
  ];

  const TEXT_TRANSFORM_OPTIONS = [
    { value: "none", label: "Aa" },
    { value: "uppercase", label: "AA" },
    { value: "lowercase", label: "aa" },
    { value: "capitalize", label: "Ab" },
  ];

  const ANIM_PROPS = [
    { key: "opacity", type: "range", min: 0, max: 1, step: 0.01, defaultFrom: 1, defaultTo: 1 },
    { key: "x", type: "range", min: -400, max: 400, step: 1, defaultFrom: 0, defaultTo: 0 },
    { key: "y", type: "range", min: -400, max: 400, step: 1, defaultFrom: 0, defaultTo: 0 },
    {
      key: "xPercent",
      type: "range",
      min: -100,
      max: 100,
      step: 1,
      defaultFrom: 0,
      defaultTo: 0,
    },
    {
      key: "yPercent",
      type: "range",
      min: -100,
      max: 100,
      step: 1,
      defaultFrom: 100,
      defaultTo: 0,
    },
    { key: "scale", type: "range", min: 0, max: 3, step: 0.01, defaultFrom: 1, defaultTo: 1 },
    {
      key: "rotation",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultFrom: 0,
      defaultTo: 0,
    },
    {
      key: "rotationX",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultFrom: 0,
      defaultTo: 0,
    },
    {
      key: "rotationY",
      type: "range",
      min: -180,
      max: 180,
      step: 1,
      defaultFrom: 0,
      defaultTo: 0,
    },
    { key: "filter", type: "text", defaultFrom: "", defaultTo: "" },
  ];

  let active = false;
  let attachConfig = null;
  let codeDefaults = null;
  let storageKey = "playgroundV2";
  let targetsSelector = ".split-target";

  let panel;
  let tabButtons;
  let tabPanels;
  let subTabButtons;
  let subTabPanels;
  let teardownFn = null;
  let runtime = null;
  let workingConfig = null;
  let committedConfig = null;

  let typographyDirty = false;
  let splitTextDirty = false;
  let panelOpen = false;
  let escBlurPending = false;

  let liveDebounce = null;
  let rebuildPending = false;
  let rebuildQueued = false;
  let rebuildGeneration = 0;

  const el = {};

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(base, patch) {
    const out = deepClone(base);
    const merge = (t, s) => {
      if (!s || typeof s !== "object") return;
      Object.keys(s).forEach((key) => {
        if (s[key] && typeof s[key] === "object" && !Array.isArray(s[key])) {
          t[key] = t[key] || {};
          merge(t[key], s[key]);
        } else {
          t[key] = s[key];
        }
      });
    };
    merge(out, patch);
    return out;
  }

  function loadStoredConfig() {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) return deepMerge(codeDefaults, JSON.parse(raw));
    } catch {
      /* ignore */
    }
    return deepClone(codeDefaults);
  }

  function saveStoredConfig(cfg) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(cfg));
    } catch {
      /* ignore */
    }
  }

  function formatLetterSpacing(value) {
    const n = Math.abs(value).toFixed(2);
    const sign = value < 0 ? "-" : "+";
    return `${sign}${n}`;
  }

  function parseScrollPosition(str) {
    const parts = String(str || "top top").trim().split(/\s+/).filter(Boolean);
    const element = SCROLL_EDGE_OPTIONS.includes(parts[0]) ? parts[0] : "top";
    const viewPart = parts.slice(1).join(" ") || "top";
    if (SCROLL_VIEW_PRESETS.includes(viewPart)) {
      return { element, viewPreset: viewPart, viewCustom: "" };
    }
    return { element, viewPreset: "top", viewCustom: viewPart };
  }

  function formatScrollPosition(element, viewPreset, viewCustom) {
    const edge = SCROLL_EDGE_OPTIONS.includes(element) ? element : "top";
    const offset = (viewCustom || "").trim();
    if (offset) return `${edge} ${offset}`;
    const view = SCROLL_VIEW_PRESETS.includes(viewPreset) ? viewPreset : "top";
    return `${edge} ${view}`;
  }

  function buildScrollEdgeOptions(selected) {
    return SCROLL_EDGE_OPTIONS.map(
      (v) => `<option value="${v}"${v === selected ? " selected" : ""}>${v}</option>`
    ).join("");
  }

  function buildScrollViewOptions(selectedPreset) {
    const preset =
      SCROLL_VIEW_PRESETS.includes(selectedPreset) && selectedPreset !== "custom"
        ? selectedPreset
        : "top";
    return SCROLL_VIEW_PRESETS.map(
      (v) => `<option value="${v}"${v === preset ? " selected" : ""}>${v}</option>`
    ).join("");
  }

  function buildScrollPositionFieldHTML({ idPrefix, label, defaultStr }) {
    const parsed = parseScrollPosition(defaultStr);
    return `
      <div class="pg-field pg-st-position-field pg-scroll-section" data-st-position="${idPrefix}">
        <span class="pg-field__label">${label}</span>
        <div class="pg-st-position">
          <div class="pg-st-position__col">
            <span class="pg-st-position__hint">Element</span>
            <select class="pg-select" id="pg-st-${idPrefix}-element">${buildScrollEdgeOptions(parsed.element)}</select>
          </div>
          <div class="pg-st-position__col">
            <span class="pg-st-position__hint">Viewport</span>
            <select class="pg-select" id="pg-st-${idPrefix}-view">${buildScrollViewOptions(parsed.viewPreset)}</select>
          </div>
          <div class="pg-st-position__offset">
            <span class="pg-st-position__hint">Offset</span>
            <input
              type="text"
              class="pg-input pg-st-position__custom"
              id="pg-st-${idPrefix}-view-custom"
              value="${parsed.viewCustom}"
              placeholder="25%, 100px (optional)"
            />
          </div>
        </div>
      </div>`;
  }

  function buildDropdownFieldHTML({ id, label, optionsHtml, inputAttrs = "" }) {
    return `
      <div class="pg-dropdown-field pg-field-block">
        <label class="pg-dropdown-field__label" for="${id}">${label}</label>
        <select class="pg-select" id="${id}" ${inputAttrs}>${optionsHtml}</select>
      </div>`;
  }

  /** Inline label + select in one control row (matches track slider / segment row rhythm). */
  function buildSelectRowHTML({ id, label, optionsHtml, inputAttrs = "" }) {
    return `
      <div class="pg-select-row pg-field-block">
        <label class="pg-select-row__label" for="${id}">${label}</label>
        <select class="pg-select pg-select--row" id="${id}" ${inputAttrs}>${optionsHtml}</select>
      </div>`;
  }

  function buildSegmentBarHTML({ className = "", role, ariaLabel, buttonsHtml }) {
    const roleAttr = role ? ` role="${role}"` : "";
    const ariaAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : "";
    return `
      <div class="pg-segment-bar pg-field-block${className ? ` ${className}` : ""}"${roleAttr}${ariaAttr}>
        <div class="pg-segment">${buttonsHtml}</div>
      </div>`;
  }

  function buildSegmentRowHTML({ id, label, options, defaultValue }) {
    const initial = defaultValue ?? options[0]?.value ?? "";
    const buttons = options
      .map((opt) => {
        const pressed = opt.value === initial;
        const inner = opt.icon
          ? opt.icon
          : `<span class="pg-segment__text">${opt.label}</span>`;
        return `<button
          type="button"
          class="pg-segment__btn${opt.icon ? " pg-segment__btn--icon" : ""}"
          data-value="${opt.value}"
          aria-label="${opt.label}"
          aria-pressed="${pressed ? "true" : "false"}"
        >${inner}</button>`;
      })
      .join("");

    return `
      <div class="pg-segment-row pg-field-block" id="${id}" role="group" aria-label="${label}">
        <span class="pg-segment-row__label">${label}</span>
        <div class="pg-segment">${buttons}</div>
        <input type="hidden" data-role="segment-value" value="${initial}" />
      </div>`;
  }

  function getSegmentGroupValue(container) {
    if (!container) return "";
    const pressed = container.querySelector('.pg-segment__btn[aria-pressed="true"]');
    if (pressed?.dataset.value) return pressed.dataset.value;
    return container.querySelector('[data-role="segment-value"]')?.value ?? "";
  }

  function setSegmentGroupValue(container, value) {
    if (!container) return;
    let matched = false;
    container.querySelectorAll(".pg-segment__btn").forEach((btn) => {
      const on = btn.dataset.value === value;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) matched = true;
    });
    if (!matched && container.querySelector(".pg-segment__btn")) {
      const first = container.querySelector(".pg-segment__btn");
      first.setAttribute("aria-pressed", "true");
      value = first.dataset.value;
    }
    const hidden = container.querySelector('[data-role="segment-value"]');
    if (hidden) hidden.value = value;
  }

  function bindSegmentGroup(container, onChange) {
    if (!container || container.dataset.pgSegmentBound) return;
    container.dataset.pgSegmentBound = "1";
    container.querySelectorAll(".pg-segment__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setSegmentGroupValue(container, btn.dataset.value);
        onChange?.();
      });
    });
  }

  function buildTrackSliderHTML({
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
    const classes = ["pg-track-slider"];
    if (compact) classes.push("pg-track-slider--compact");
    if (labelPlacement === "above") classes.push("pg-track-slider--label-above");
    if (labelPlacement === "none") classes.push("pg-track-slider--label-none");

    const val = value ?? min;
    const labelAbove =
      labelPlacement === "above" && label
        ? `<span class="pg-track-slider__label-above">${label}</span>`
        : "";
    const labelInside =
      labelPlacement === "inside" && label
        ? `<span class="pg-track-slider__label">${label}</span>`
        : "";

    return `
      <div class="${classes.join(" ")} pg-field-block" data-value-format="${format}">
        ${labelAbove}
        <div class="pg-track-slider__chrome">
          <div class="pg-track-slider__fill" aria-hidden="true"></div>
          ${labelInside}
          <output class="pg-track-slider__value" id="${id}-out" for="${id}"></output>
          <input
            type="range"
            class="pg-track-slider__input"
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

  function formatTrackSliderValue(input) {
    const format = input.closest("[data-value-format]")?.dataset.valueFormat || "decimal";
    const v = parseFloat(input.value);
    if (format === "letterSpacing") return formatLetterSpacing(v);
    if (format === "integer") return String(Math.round(v));
    const step = parseFloat(input.step) || 1;
    const decimals = step < 0.05 ? 2 : step < 1 ? 1 : 0;
    return v.toFixed(decimals);
  }

  function syncTrackSlider(input) {
    if (!input?.matches?.(".pg-track-slider__input")) return;
    const wrap = input.closest(".pg-track-slider");
    const fill = wrap?.querySelector(".pg-track-slider__fill");
    const output = wrap?.querySelector(".pg-track-slider__value");
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const val = parseFloat(input.value);
    const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
    if (fill) fill.style.width = `${pct}%`;
    if (output) output.textContent = formatTrackSliderValue(input);
  }

  function syncAllTrackSliders(root = panel) {
    if (!root) return;
    root.querySelectorAll(".pg-track-slider__input").forEach(syncTrackSlider);
  }

  function initTrackSliders(root = panel) {
    if (!root) return;
    root.querySelectorAll(".pg-track-slider__input").forEach((input) => {
      syncTrackSlider(input);
      if (input.dataset.pgTrackBound) return;
      input.dataset.pgTrackBound = "1";
      input.addEventListener("input", () => syncTrackSlider(input));
    });
  }

  function applyTypography(typography) {
    const root = document.documentElement;
    root.style.setProperty("--font-sans-serif", `var(${typography.fontVar})`);
    root.style.setProperty("--playground-font-size", `${typography.fontSize}rem`);
    root.style.setProperty("--playground-line-height", String(typography.lineHeight));
    root.style.setProperty(
      "--playground-letter-spacing",
      `${typography.letterSpacing}em`
    );
    root.style.setProperty("--playground-text-align", typography.textAlign);
    root.style.setProperty("--playground-text-transform", typography.textTransform);
  }

  function exportTypographyCss(typography) {
    return `:root {
  --font-sans-serif: var(${typography.fontVar});
  --playground-font-size: ${typography.fontSize}rem;
  --playground-line-height: ${typography.lineHeight};
  --playground-letter-spacing: ${typography.letterSpacing}em;
  --playground-text-align: ${typography.textAlign};
  --playground-text-transform: ${typography.textTransform};
}`;
  }

  function setPendingUI() {
    tabButtons[0]?.classList.toggle("pg-segment__btn--pending", typographyDirty);
    tabButtons[2]?.classList.toggle("pg-segment__btn--pending", splitTextDirty);
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
        start: formatScrollPosition(
          el.stStartElement?.value,
          el.stStartView?.value,
          el.stStartViewCustom?.value
        ),
        end: formatScrollPosition(
          el.stEndElement?.value,
          el.stEndView?.value,
          el.stEndViewCustom?.value
        ),
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

  function parseStaggerGrid(raw) {
    const s = raw?.trim();
    if (!s) return null;
    const tryParse = (text) => {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length < 2) return null;
      const nums = parsed.slice(0, 2).map(Number);
      return nums.every((n) => Number.isFinite(n)) ? nums : null;
    };
    try {
      const fromJson = tryParse(s.startsWith("[") ? s : `[${s}]`);
      if (fromJson) return fromJson;
    } catch {
      /* fall through */
    }
    const parts = s
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((part) => parseFloat(part.trim()));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1]];
    }
    return null;
  }

  function formatStaggerGridForInput(grid) {
    if (!grid || !Array.isArray(grid) || grid.length < 2) return "";
    return `[${grid[0]}, ${grid[1]}]`;
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

  function normalizeStaggerConfig(stagger) {
    const s = stagger ? { ...stagger } : {};
    if (s.mode === "simple") {
      s.timing = "each";
      s.each = s.value ?? s.each ?? 0.1;
    }
    if (!s.timing) {
      s.timing = s.each != null && s.each !== "" ? "each" : "amount";
    }
    delete s.mode;
    delete s.value;
    return {
      timing: s.timing === "each" ? "each" : "amount",
      amount: s.amount ?? 0.1,
      each: s.each ?? 0.1,
      from: s.from || "start",
      ease: s.ease && s.ease !== "none" ? s.ease : null,
      grid: Array.isArray(s.grid) && s.grid.length >= 2 ? [s.grid[0], s.grid[1]] : null,
      axis: s.axis === "x" || s.axis === "y" ? s.axis : "both",
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

    const startPos = parseScrollPosition(cfg.scrollTrigger.start);
    el.stStartElement.value = startPos.element;
    el.stStartView.value = SCROLL_VIEW_PRESETS.includes(startPos.viewPreset)
      ? startPos.viewPreset
      : "top";
    el.stStartViewCustom.value = startPos.viewCustom;

    const endPos = parseScrollPosition(cfg.scrollTrigger.end);
    el.stEndElement.value = endPos.element;
    el.stEndView.value = SCROLL_VIEW_PRESETS.includes(endPos.viewPreset)
      ? endPos.viewPreset
      : "top";
    el.stEndViewCustom.value = endPos.viewCustom;

    el.stMarkers?.setAttribute("aria-pressed", cfg.scrollTrigger.markers ? "true" : "false");
    setScrubUI(cfg.scrollTrigger);

    el.fontSelect.value = cfg.typography.fontVar;
    el.fontSize.value = cfg.typography.fontSize;
    el.lineHeight.value = cfg.typography.lineHeight;
    el.letterSpacing.value = cfg.typography.letterSpacing;
    setSegmentGroupValue(el.textAlign, cfg.typography.textAlign);
    setSegmentGroupValue(el.textTransform, cfg.typography.textTransform);

    syncAllTrackSliders();
  }

  function typeIncludes(type, unit) {
    return String(type)
      .split(",")
      .map((s) => s.trim())
      .includes(unit);
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

  function setPanelSyncing(syncing) {
    panel.classList.toggle("playground-v2-panel--syncing", syncing);
  }

  function setPanelOpen(open) {
    if (open === panelOpen) return;
    panelOpen = open;
    document.body.classList.toggle("playground-v2-panel-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");

    if (!open) {
      commitAndRebuild();
    }
  }

  function isPanelOpen() {
    return panelOpen;
  }

  async function waitForFonts(typography) {
    applyTypography(typography);
    await new Promise((r) => requestAnimationFrame(r));
    const sample = document.querySelector(targetsSelector);
    if (!sample) {
      await document.fonts.ready;
      return;
    }
    const style = getComputedStyle(sample);
    const fontSpec = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    try {
      await document.fonts.load(fontSpec);
    } catch {
      /* fall through */
    }
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  function resolveInitResult(result) {
    if (typeof result === "function") {
      return { teardown: result, runtime: null };
    }
    return {
      teardown: result?.teardown,
      runtime: result?.runtime ?? null,
    };
  }

  async function runFullRebuild(cfg) {
    if (typeof attachConfig?.init !== "function") return;

    if (rebuildPending) {
      rebuildQueued = true;
      return;
    }

    const generation = ++rebuildGeneration;
    rebuildPending = true;
    setPanelSyncing(true);

    try {
      if (typeof teardownFn === "function") {
        teardownFn();
        teardownFn = null;
        runtime = null;
      }

      if (generation !== rebuildGeneration) return;

      await waitForFonts(cfg.typography);

      if (generation !== rebuildGeneration) return;

      const result = attachConfig.init(cfg);
      const resolved = resolveInitResult(result);
      teardownFn = resolved.teardown;
      runtime = resolved.runtime;

      if (generation !== rebuildGeneration) {
        if (typeof teardownFn === "function") teardownFn();
        teardownFn = null;
        runtime = null;
        return;
      }

      committedConfig = deepClone(cfg);
      workingConfig = deepClone(cfg);

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh(true);
        ScrollTrigger.update();
      }
    } catch (err) {
      console.error("[playground-v2] rebuild failed:", err);
    } finally {
      rebuildPending = false;
      setPanelSyncing(false);
      if (rebuildQueued) {
        rebuildQueued = false;
        await runFullRebuild(workingConfig || committedConfig);
      }
    }
  }

  async function commitAndRebuild() {
    workingConfig = readConfigFromForm();
    saveStoredConfig(workingConfig);
    typographyDirty = false;
    splitTextDirty = false;
    setPendingUI();
    await runFullRebuild(workingConfig);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function requestLiveUpdate() {
    if (!panelOpen || !runtime?.applyLive) return;
    clearTimeout(liveDebounce);
    liveDebounce = setTimeout(() => {
      liveDebounce = null;
      const next = readConfigFromForm();
      workingConfig = deepMerge(workingConfig || committedConfig, next);
      runtime.applyLive(workingConfig);
    }, LIVE_DEBOUNCE_MS);
  }

  function markTypographyDirty() {
    typographyDirty = true;
    setPendingUI();
  }

  function markSplitTextDirty() {
    splitTextDirty = true;
    setPendingUI();
    updateAnimateTargetOptions(getTypeArray());
  }

  function selectTab(index) {
    tabButtons.forEach((btn, i) => {
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    tabPanels.forEach((panelEl, i) => {
      panelEl.hidden = i !== index;
    });
  }

  function selectSubTab(index) {
    if (!subTabButtons?.length) return;
    subTabButtons.forEach((btn, i) => {
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    subTabPanels.forEach((panelEl, i) => {
      panelEl.hidden = i !== index;
    });
  }

  function setStaggerTiming(timing) {
    const mode = timing === "each" ? "each" : "amount";
    el.staggerTiming?.setAttribute("data-timing", mode);
    el.staggerTiming?.classList.toggle("is-timing-amount", mode === "amount");
    el.staggerTiming?.classList.toggle("is-timing-each", mode === "each");
  }

  function buildStaggerBlockHTML(staggerFromOptions, easeOptions) {
    return `
        <div class="pg-stagger-block">
          <div class="pg-stagger-timing-row is-timing-amount" id="pg-stagger-timing" data-timing="amount">
            ${buildTrackSliderHTML({
              id: "pg-stagger-amount",
              label: "Amount",
              min: 0,
              max: 2,
              step: 0.01,
              value: 0.1,
            })}
            ${buildTrackSliderHTML({
              id: "pg-stagger-each",
              label: "Each",
              min: 0,
              max: 2,
              step: 0.01,
              value: 0.1,
            })}
          </div>
          ${buildDropdownFieldHTML({
            id: "pg-stagger-from",
            label: "From",
            optionsHtml: staggerFromOptions,
          })}
          ${buildDropdownFieldHTML({
            id: "pg-stagger-ease",
            label: "Ease",
            optionsHtml: easeOptions,
          })}
          <div class="pg-field">
            <span class="pg-field__label">Grid</span>
            <div class="pg-control-bar pg-control-bar--value-only pg-control-bar--no-focus-ring">
              <input
                type="text"
                class="pg-input"
                id="pg-stagger-grid"
                placeholder="[5, 19]"
                aria-label="Stagger grid"
                spellcheck="false"
              />
            </div>
          </div>
          <div class="pg-field">
            <span class="pg-field__label">Axis</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="pg-segment__btn" id="pg-stagger-axis-both" aria-pressed="true">both</button>
                <button type="button" class="pg-segment__btn" id="pg-stagger-axis-x" aria-pressed="false">x</button>
                <button type="button" class="pg-segment__btn" id="pg-stagger-axis-y" aria-pressed="false">y</button>`,
            })}
          </div>
        </div>`;
  }

  function resetAnimProp(propKey) {
    const prop = ANIM_PROPS.find((p) => p.key === propKey);
    if (!prop) return;
    const startEl = el[`prop_${prop.key}_start`];
    const endEl = el[`prop_${prop.key}_end`];
    if (startEl) {
      startEl.value = prop.defaultFrom;
      syncTrackSlider(startEl);
    }
    if (endEl) {
      endEl.value = prop.defaultTo;
      syncTrackSlider(endEl);
    }
    requestLiveUpdate();
  }

  function buildPropGridHTML() {
    const resetBtn = (key) => `
      <button
        type="button"
        class="pg-prop-reset pg-prop-row__reset"
        data-prop-reset="${key}"
        aria-label="Reset ${key} to defaults"
        title="Reset to defaults"
      >${ICON_RESET}</button>`;

    const blocks = ANIM_PROPS.map((prop) => {
      if (prop.type === "text") {
        return `
          <div class="pg-prop-row pg-prop-row--text" data-prop="${prop.key}">
            <div class="pg-control-bar pg-control-bar--compact">
              <span class="pg-control-bar__label pg-control-bar__label--prop">${prop.key}</span>
              <input type="text" class="pg-input" id="pg-prop-${prop.key}-start" data-role="prop-start" aria-label="${prop.key} start" placeholder="—" />
            </div>
            ${resetBtn(prop.key)}
            <div class="pg-control-bar pg-control-bar--value-only">
              <input type="text" class="pg-input" id="pg-prop-${prop.key}-end" data-role="prop-end" aria-label="${prop.key} end" placeholder="—" />
            </div>
          </div>`;
      }
      return `
        <div class="pg-prop-row" data-prop="${prop.key}">
          ${buildTrackSliderHTML({
            id: `pg-prop-${prop.key}-start`,
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
            id: `pg-prop-${prop.key}-end`,
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
      <div class="pg-prop-list">
        <div class="pg-prop-row pg-prop-row--head" aria-hidden="true">
          <span class="pg-prop-row__head">Start</span>
          <span class="pg-prop-row__head-spacer"></span>
          <span class="pg-prop-row__head">End</span>
        </div>
        ${blocks}
      </div>`;
  }

  function injectPanel() {
    if (document.getElementById("playground-v2-panel")) return;

    const aside = document.createElement("aside");
    aside.id = "playground-v2-panel";
    aside.setAttribute("role", "region");
    aside.setAttribute("aria-label", "Animation playground");
    aside.setAttribute("aria-hidden", "true");

    const fontOptions = FONTS.map(
      (f) => `<option value="${f.cssVar}">${f.label}</option>`
    ).join("");
    const easeOptions = EASE_OPTIONS.map((e) => `<option value="${e}">${e}</option>`).join(
      ""
    );
    const staggerFromOptions = STAGGER_FROM.map(
      (v) => `<option value="${v}">${v}</option>`
    ).join("");

    aside.innerHTML = `
      <div class="pg-panel__header">
        <div class="pg-panel__header-actions">
          <button
            type="button"
            class="pg-prop-reset"
            id="pg-reset"
            aria-label="Reset to defaults"
            title="Reset to defaults"
          >${ICON_RESET}</button>
        </div>
        ${buildSegmentBarHTML({
          className: "pg-segment-bar--tabs",
          role: "tablist",
          buttonsHtml: `
            <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-tab="0" aria-selected="true">Type</button>
            <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-tab="1">Tween</button>
            <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-tab="2">Split</button>
            <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-tab="3">Scroll</button>`,
        })}
      </div>
      <div class="pg-panel__body">
        <div class="pg-tab-panel" data-tab-panel="0" role="tabpanel">
          ${buildDropdownFieldHTML({ id: "pg-font", label: "Font", optionsHtml: fontOptions })}
          ${buildTrackSliderHTML({
            id: "pg-font-size",
            label: "Size (rem)",
            min: 0.75,
            max: 6,
            step: 0.05,
            value: 1.25,
          })}
          ${buildTrackSliderHTML({
            id: "pg-line-height",
            label: "Line height",
            min: 0.8,
            max: 3,
            step: 0.05,
            value: 1.5,
          })}
          ${buildTrackSliderHTML({
            id: "pg-letter-spacing",
            label: "Letter spacing (em)",
            min: -0.15,
            max: 0.5,
            step: 0.01,
            value: 0,
            format: "letterSpacing",
          })}
          ${buildSegmentRowHTML({
            id: "pg-text-align",
            label: "Align",
            options: TEXT_ALIGN_OPTIONS,
            defaultValue: "left",
          })}
          ${buildSegmentRowHTML({
            id: "pg-text-transform",
            label: "Transform",
            options: TEXT_TRANSFORM_OPTIONS,
            defaultValue: "none",
          })}
        </div>
        <div class="pg-tab-panel pg-tab-panel--props" data-tab-panel="1" role="tabpanel" hidden>
          <div class="pg-control-stack">
            ${buildTrackSliderHTML({
              id: "pg-duration",
              label: "Duration",
              min: 0.1,
              max: 5,
              step: 0.05,
              value: 1,
            })}
            ${buildSelectRowHTML({ id: "pg-ease", label: "Ease", optionsHtml: easeOptions })}
            ${buildSelectRowHTML({
              id: "pg-animate-target",
              label: "Animate",
              optionsHtml: `
              <option value="lines">lines</option>
              <option value="words">words</option>
              <option value="chars">chars</option>`,
            })}
          </div>
          <fieldset class="pg-props-fieldset">
            <legend class="pg-sr-only">Properties and stagger</legend>
            ${buildSegmentBarHTML({
              className: "pg-segment-bar--subtabs",
              role: "tablist",
              ariaLabel: "Tween properties",
              buttonsHtml: `
                <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-subtab="0" aria-selected="true">Properties</button>
                <button type="button" class="pg-segment__btn pg-segment__btn--tab" role="tab" data-subtab="1">Stagger</button>`,
            })}
            <div class="pg-subtab-panel" data-subtab-panel="0" role="tabpanel">
              ${buildPropGridHTML()}
            </div>
            <div class="pg-subtab-panel" data-subtab-panel="1" role="tabpanel" hidden>
              ${buildStaggerBlockHTML(staggerFromOptions, easeOptions)}
            </div>
          </fieldset>
        </div>
        <div class="pg-tab-panel" data-tab-panel="2" role="tabpanel" hidden>
          <div class="pg-field">
            <span class="pg-field__label">Type</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="pg-segment__btn" id="pg-type-chars" aria-pressed="false">chars</button>
                <button type="button" class="pg-segment__btn" id="pg-type-words" aria-pressed="true">words</button>
                <button type="button" class="pg-segment__btn" id="pg-type-lines" aria-pressed="true">lines</button>`,
            })}
          </div>
          <div class="pg-field">
            <span class="pg-field__label">Mask</span>
            <div id="pg-mask-group">
              ${buildSegmentBarHTML({
                buttonsHtml: `
                  <button type="button" class="pg-segment__btn" id="pg-mask-chars" aria-pressed="false">chars</button>
                  <button type="button" class="pg-segment__btn" id="pg-mask-words" aria-pressed="false">words</button>
                  <button type="button" class="pg-segment__btn" id="pg-mask-lines" aria-pressed="true">lines</button>`,
              })}
            </div>
          </div>
          <div class="pg-field">
            <span class="pg-field__label">Split options</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `
                <button type="button" class="pg-segment__btn" id="pg-split-autosplit" aria-pressed="true">autoSplit</button>
                <button type="button" class="pg-segment__btn" id="pg-split-smartsplit" aria-pressed="true">smartSplit</button>`,
            })}
          </div>
          <fieldset class="pg-fieldset">
            <legend class="pg-fieldset__legend">Targets</legend>
            <div class="pg-field">
              <span class="pg-field__label">Text</span>
              <input type="text" class="pg-input" id="pg-target-text" />
            </div>
            <div class="pg-field">
              <span class="pg-field__label">Trigger</span>
              <input type="text" class="pg-input" id="pg-target-element" />
            </div>
          </fieldset>
        </div>
        <div class="pg-tab-panel pg-tab-panel--scroll" data-tab-panel="3" role="tabpanel" hidden>
          <div class="pg-field pg-scroll-section">
            <span class="pg-field__label">Trigger</span>
            <input type="text" class="pg-input" id="pg-st-trigger" />
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
          <div class="pg-field pg-field--scrub pg-scroll-section">
            <span class="pg-field__label">Scrub</span>
            <div id="pg-scrub-mode" data-mode="on">
              ${buildSegmentBarHTML({
                buttonsHtml: `
                  <button type="button" class="pg-segment__btn" id="pg-scrub-off">Off</button>
                  <button type="button" class="pg-segment__btn" id="pg-scrub-on" aria-pressed="true">On</button>
                  <button type="button" class="pg-segment__btn" id="pg-scrub-smooth">Smooth</button>`,
              })}
            </div>
            <div id="pg-scrub-smooth-wrap" hidden>
              ${buildTrackSliderHTML({
                id: "pg-scrub-smooth",
                label: "Smooth scrub",
                min: 0.1,
                max: 3,
                step: 0.1,
                value: 1,
              })}
            </div>
          </div>
          <div class="pg-field pg-scroll-section">
            <span class="pg-field__label">Debug</span>
            ${buildSegmentBarHTML({
              buttonsHtml: `<button type="button" class="pg-segment__btn" id="pg-st-markers" aria-pressed="false">markers</button>`,
            })}
          </div>
        </div>
      </div>
      <div class="pg-panel__dock">
        ${buildSegmentBarHTML({
          className: "pg-segment-bar--dock",
          buttonsHtml: `
            <button type="button" class="pg-segment__btn pg-segment__btn--accent" id="pg-copy-config">Config</button>
            <button type="button" class="pg-segment__btn" id="pg-copy-code">Code</button>
            <button type="button" class="pg-segment__btn" id="pg-copy-css">CSS</button>`,
        })}
      </div>
      <footer class="pg-footer">
        <kbd>⌘K</kbd> panel · <kbd>⌘1</kbd>–<kbd>⌘4</kbd> tabs · <kbd>Esc</kbd> close &amp; commit
      </footer>
    `;

    document.body.appendChild(aside);
    document.body.classList.add("playground-v2-active");
  }

  function cacheElements() {
    panel = document.getElementById("playground-v2-panel");
    tabButtons = [...panel.querySelectorAll(".pg-segment-bar--tabs .pg-segment__btn")];
    tabPanels = [...panel.querySelectorAll(".pg-tab-panel")];

    const propertiesPanel = panel.querySelector('[data-tab-panel="1"]');
    if (propertiesPanel) {
      subTabButtons = [...propertiesPanel.querySelectorAll(".pg-segment-bar--subtabs .pg-segment__btn")];
      subTabPanels = [...propertiesPanel.querySelectorAll(".pg-subtab-panel")];
    }

    el.fontSelect = document.getElementById("pg-font");
    el.fontSize = document.getElementById("pg-font-size");
    el.fontSizeOut = document.getElementById("pg-font-size-out");
    el.lineHeight = document.getElementById("pg-line-height");
    el.lineHeightOut = document.getElementById("pg-line-height-out");
    el.letterSpacing = document.getElementById("pg-letter-spacing");
    el.letterSpacingOut = document.getElementById("pg-letter-spacing-out");
    el.textAlign = document.getElementById("pg-text-align");
    el.textTransform = document.getElementById("pg-text-transform");

    el.duration = document.getElementById("pg-duration");
    el.durationOut = document.getElementById("pg-duration-out");
    el.ease = document.getElementById("pg-ease");
    el.animateTarget = document.getElementById("pg-animate-target");

    el.staggerTiming = document.getElementById("pg-stagger-timing");
    el.staggerAmount = document.getElementById("pg-stagger-amount");
    el.staggerAmountOut = document.getElementById("pg-stagger-amount-out");
    el.staggerEach = document.getElementById("pg-stagger-each");
    el.staggerEachOut = document.getElementById("pg-stagger-each-out");
    el.staggerFrom = document.getElementById("pg-stagger-from");
    el.staggerEase = document.getElementById("pg-stagger-ease");
    el.staggerGrid = document.getElementById("pg-stagger-grid");
    el.staggerAxisBoth = document.getElementById("pg-stagger-axis-both");
    el.staggerAxisX = document.getElementById("pg-stagger-axis-x");
    el.staggerAxisY = document.getElementById("pg-stagger-axis-y");

    el.typeChars = document.getElementById("pg-type-chars");
    el.typeWords = document.getElementById("pg-type-words");
    el.typeLines = document.getElementById("pg-type-lines");
    el.maskChars = document.getElementById("pg-mask-chars");
    el.maskWords = document.getElementById("pg-mask-words");
    el.maskLines = document.getElementById("pg-mask-lines");
    el.splitAutoSplit = document.getElementById("pg-split-autosplit");
    el.splitSmartSplit = document.getElementById("pg-split-smartsplit");
    el.targetText = document.getElementById("pg-target-text");
    el.targetElement = document.getElementById("pg-target-element");

    el.stTrigger = document.getElementById("pg-st-trigger");
    el.stStartElement = document.getElementById("pg-st-start-element");
    el.stStartView = document.getElementById("pg-st-start-view");
    el.stStartViewCustom = document.getElementById("pg-st-start-view-custom");
    el.stEndElement = document.getElementById("pg-st-end-element");
    el.stEndView = document.getElementById("pg-st-end-view");
    el.stEndViewCustom = document.getElementById("pg-st-end-view-custom");
    el.stMarkers = document.getElementById("pg-st-markers");
    el.scrubMode = document.getElementById("pg-scrub-mode");
    el.scrubOff = document.getElementById("pg-scrub-off");
    el.scrubOn = document.getElementById("pg-scrub-on");
    el.scrubSmoothBtn = document.getElementById("pg-scrub-smooth");
    el.scrubSmoothWrap = document.getElementById("pg-scrub-smooth-wrap");
    el.scrubSmooth = document.getElementById("pg-scrub-smooth");
    el.scrubSmoothOut = document.getElementById("pg-scrub-smooth-out");

    ANIM_PROPS.forEach((prop) => {
      el[`prop_${prop.key}_start`] = document.getElementById(`pg-prop-${prop.key}-start`);
      el[`prop_${prop.key}_end`] = document.getElementById(`pg-prop-${prop.key}-end`);
      el[`prop_${prop.key}_start_out`] = document.getElementById(`pg-prop-${prop.key}-start-out`);
      el[`prop_${prop.key}_end_out`] = document.getElementById(`pg-prop-${prop.key}-end-out`);
    });
  }

  function serializeConfig(cfg) {
    return JSON.stringify(cfg, null, 2);
  }

  function formatObjectLiteral(obj, indent) {
    const pad = "  ".repeat(indent);
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "");
    if (!entries.length) return "{}";
    const lines = entries.map(([k, v]) => {
      if (typeof v === "string") return `${pad}  ${k}: ${JSON.stringify(v)}`;
      if (typeof v === "object" && !Array.isArray(v)) {
        return `${pad}  ${k}: ${formatObjectLiteral(v, indent + 1)}`;
      }
      return `${pad}  ${k}: ${JSON.stringify(v)}`;
    });
    return `{\n${lines.join(",\n")}\n${pad}}`;
  }

  function buildStaggerLiteral(stagger) {
    const s = normalizeStaggerConfig(stagger);
    const from = JSON.stringify(s.from || "start");
    const parts =
      s.timing === "each"
        ? [`each: ${s.each}`, `from: ${from}`]
        : [`amount: ${s.amount}`, `from: ${from}`];
    if (s.ease) parts.push(`ease: ${JSON.stringify(s.ease)}`);
    if (s.grid) parts.push(`grid: [${s.grid[0]}, ${s.grid[1]}]`);
    if (s.axis !== "both") parts.push(`axis: ${JSON.stringify(s.axis)}`);
    return `{ ${parts.join(", ")} }`;
  }

  function exportCopyCode(cfg) {
    const animateKey = cfg.animate;
    const fromLit = JSON.stringify(cfg.from, null, 2).split("\n").join("\n    ");
    const toVars = { ...cfg.to };
    const duration = toVars.duration ?? 1;
    const ease = toVars.ease ?? "power2.out";
    delete toVars.duration;
    delete toVars.ease;
    const toLit = JSON.stringify(toVars, null, 2).split("\n").join("\n      ");
    const staggerLit = buildStaggerLiteral(cfg.stagger);
    const maskLine =
      cfg.splitText.mask && cfg.splitText.mask !== "none"
        ? `\n  mask: ${JSON.stringify(cfg.splitText.mask)},`
        : "";
    const scrubVal =
      cfg.scrollTrigger.scrub === false
        ? "false"
        : typeof cfg.scrollTrigger.scrub === "number"
          ? cfg.scrollTrigger.scrub
          : "true";

    return `const split = SplitText.create(${JSON.stringify(cfg.targets.text)}, {
  type: ${JSON.stringify(cfg.splitText.type)},${maskLine}
  autoSplit: ${cfg.splitText.autoSplit},
  smartSplit: ${cfg.splitText.smartSplit},
  onSplit(self) {
    gsap.set(self.${animateKey}, ${fromLit});
    return gsap.to(self.${animateKey}, {
      ...${JSON.stringify(toVars)},
      duration: ${duration},
      ease: ${JSON.stringify(ease)},
      stagger: ${staggerLit},
      scrollTrigger: {
        trigger: ${JSON.stringify(cfg.scrollTrigger.trigger)},
        start: ${JSON.stringify(cfg.scrollTrigger.start)},
        end: ${JSON.stringify(cfg.scrollTrigger.end)},
        scrub: ${scrubVal},
        markers: ${!!cfg.scrollTrigger.markers},
      },
    });
  },
});`;
  }

  async function flashButton(btn, label) {
    const prev = btn.textContent;
    btn.textContent = label;
    btn.classList.add("pg-segment__btn--done");
    await new Promise((r) => setTimeout(r, 1400));
    btn.textContent = prev;
    btn.classList.remove("pg-segment__btn--done");
  }

  function bindLiveControls() {
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
      el.stStartViewCustom,
      el.stEndElement,
      el.stEndView,
      el.stEndViewCustom,
      el.scrubSmooth,
      ...ANIM_PROPS.flatMap((p) => [el[`prop_${p.key}_start`], el[`prop_${p.key}_end`]]),
    ].filter(Boolean);

    liveInputs.forEach((input) => {
      const evt = input.type === "range" || input.id === "pg-stagger-grid" ? "input" : "change";
      input.addEventListener(evt, () => requestLiveUpdate());
      if (input.id === "pg-stagger-grid") {
        input.addEventListener("change", () => requestLiveUpdate());
      }
    });
  }

  function bindTypographyControls() {
    const inputs = [el.fontSelect, el.fontSize, el.lineHeight, el.letterSpacing];
    inputs.forEach((input) => {
      const evt = input.type === "range" ? "input" : "change";
      input.addEventListener(evt, () => markTypographyDirty());
    });
    bindSegmentGroup(el.textAlign, markTypographyDirty);
    bindSegmentGroup(el.textTransform, markTypographyDirty);
  }

  function bindPropResets() {
    panel?.querySelectorAll("[data-prop-reset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resetAnimProp(btn.dataset.propReset);
      });
    });
  }

  function bindSplitTextControls() {
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

  function bindStaggerAxis() {
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

  function bindStaggerTimingActivation() {
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

  function bindScrubMode() {
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

  function bindScrollPositionControls() {
    ["start", "end"].forEach((which) => {
      const element = which === "start" ? el.stStartElement : el.stEndElement;
      const view = which === "start" ? el.stStartView : el.stEndView;
      const custom = which === "start" ? el.stStartViewCustom : el.stEndViewCustom;
      [element, view, custom].forEach((input) => {
        if (!input) return;
        input.addEventListener("change", () => requestLiveUpdate());
        if (input === custom) {
          input.addEventListener("input", () => requestLiveUpdate());
        }
      });
    });

    el.stMarkers?.addEventListener("click", () => {
      const pressed = el.stMarkers.getAttribute("aria-pressed") === "true";
      el.stMarkers.setAttribute("aria-pressed", pressed ? "false" : "true");
      requestLiveUpdate();
    });
  }

  function bindSubTabs() {
    subTabButtons?.forEach((btn) => {
      btn.addEventListener("click", () => selectSubTab(Number(btn.dataset.subtab)));
    });
  }

  function bindTabsAndHeader() {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => selectTab(Number(btn.dataset.tab)));
    });

    bindSubTabs();

    document.getElementById("pg-copy-config").addEventListener("click", async () => {
      const cfg = readConfigFromForm();
      await navigator.clipboard.writeText(serializeConfig(cfg));
      flashButton(document.getElementById("pg-copy-config"), "Copied");
    });

    document.getElementById("pg-copy-code").addEventListener("click", async () => {
      const cfg = readConfigFromForm();
      await navigator.clipboard.writeText(exportCopyCode(cfg));
      flashButton(document.getElementById("pg-copy-code"), "Copied");
    });

    document.getElementById("pg-copy-css").addEventListener("click", async () => {
      const cfg = readConfigFromForm();
      await navigator.clipboard.writeText(exportTypographyCss(cfg.typography));
      flashButton(document.getElementById("pg-copy-css"), "Copied");
    });

    document.getElementById("pg-reset").addEventListener("click", async () => {
      sessionStorage.removeItem(storageKey);
      workingConfig = deepClone(codeDefaults);
      committedConfig = deepClone(codeDefaults);
      typographyDirty = false;
      splitTextDirty = false;
      fillFormFromConfig(workingConfig);
      setPendingUI();
      await runFullRebuild(workingConfig);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  function bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (!active) return;

      const mod = e.metaKey || e.ctrlKey;
      const tag = document.activeElement?.tagName;
      const inField = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";

      if (e.key === "Escape" && isPanelOpen()) {
        if (inField && !escBlurPending) {
          document.activeElement?.blur();
          escBlurPending = true;
          e.preventDefault();
          return;
        }
        escBlurPending = false;
        e.preventDefault();
        setPanelOpen(false);
        return;
      }
      escBlurPending = false;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanelOpen(!isPanelOpen());
        return;
      }

      if (mod && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        if (!isPanelOpen()) setPanelOpen(true);
        selectTab(Number(e.key) - 1);
      }
    });
  }

  async function start() {
    injectPanel();
    cacheElements();

    workingConfig = loadStoredConfig();
    workingConfig.stagger = normalizeStaggerConfig(workingConfig.stagger);
    committedConfig = deepClone(workingConfig);
    fillFormFromConfig(workingConfig);
    typographyDirty = false;
    splitTextDirty = false;
    setPendingUI();

    initTrackSliders();

    bindTypographyControls();
    bindSplitTextControls();
    bindStaggerTimingActivation();
    bindStaggerAxis();
    bindScrubMode();
    bindScrollPositionControls();
    bindLiveControls();
    bindPropResets();
    bindTabsAndHeader();
    bindKeyboard();

    await runFullRebuild(workingConfig);
  }

  function attach(options) {
    if (!options?.init || typeof options.init !== "function") {
      throw new Error("[playground-v2] attach() requires init(config).");
    }

    active = true;
    attachConfig = { init: options.init };
    codeDefaults = deepClone(options.defaults || {});
    storageKey = options.storageKey || "playgroundV2";
    targetsSelector = options.targets || ".split-target";

    const run = () => {
      start().catch((err) => console.error("[playground-v2] start failed:", err));
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  }

  window.SplitTextPlaygroundV2 = {
    attach,
    isActive: () => active,
  };
})();
