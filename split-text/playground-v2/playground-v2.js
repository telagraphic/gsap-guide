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
      <div class="pg-field pg-st-position-field" data-st-position="${idPrefix}">
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
      <div class="pg-dropdown-field">
        <label class="pg-dropdown-field__label" for="${id}">${label}</label>
        <select class="pg-select" id="${id}" ${inputAttrs}>${optionsHtml}</select>
      </div>`;
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
      <div class="${classes.join(" ")}" data-value-format="${format}">
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
    tabButtons[0]?.classList.toggle("pg-tabs__btn--pending", typographyDirty);
    tabButtons[2]?.classList.toggle("pg-tabs__btn--pending", splitTextDirty);
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
    return [el.maskNone, el.maskChars, el.maskWords, el.maskLines].filter(Boolean);
  }

  function getMaskValue() {
    if (el.maskChars?.getAttribute("aria-pressed") === "true") return "chars";
    if (el.maskWords?.getAttribute("aria-pressed") === "true") return "words";
    if (el.maskLines?.getAttribute("aria-pressed") === "true") return "lines";
    return "";
  }

  function setMaskToggle(mask) {
    const value = mask || "";
    el.maskNone?.setAttribute("aria-pressed", value === "" ? "true" : "false");
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

    const staggerMode = el.staggerMode?.getAttribute("data-mode") || "simple";
    const stagger = {
      mode: staggerMode,
      value: parseFloat(el.staggerValue?.value) || 0.1,
      amount: parseFloat(el.staggerAmount?.value) || 0.1,
      each: el.staggerEach?.value ? parseFloat(el.staggerEach.value) : null,
      from: el.staggerFrom?.value || "start",
      ease: el.staggerEase?.value === "none" ? null : el.staggerEase?.value,
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
        textAlign: el.textAlign?.value,
        textTransform: el.textTransform?.value,
      },
    };
  }

  function fillFormFromConfig(cfg) {
    setTypeToggles(cfg.splitText.type);
    setMaskToggle(cfg.splitText.mask || "");
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

    const staggerMode = cfg.stagger?.mode || "simple";
    el.staggerMode.setAttribute("data-mode", staggerMode);
    el.staggerSimpleWrap.hidden = staggerMode !== "simple";
    el.staggerAdvancedWrap.hidden = staggerMode !== "advanced";
    el.staggerModeSimple?.setAttribute("aria-pressed", staggerMode === "simple" ? "true" : "false");
    el.staggerModeAdvanced?.setAttribute(
      "aria-pressed",
      staggerMode === "advanced" ? "true" : "false"
    );
    el.staggerValue.value = cfg.stagger?.value ?? 0.1;
    el.staggerAmount.value = cfg.stagger?.amount ?? 0.1;
    el.staggerEach.value = cfg.stagger?.each ?? "";
    el.staggerFrom.value = cfg.stagger?.from || "start";
    el.staggerEase.value = cfg.stagger?.ease || "none";

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
    el.textAlign.value = cfg.typography.textAlign;
    el.textTransform.value = cfg.typography.textTransform;

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

  function buildStaggerBlockHTML(staggerFromOptions, easeOptions) {
    return `
      <div class="pg-stagger-block">
        <div class="pg-toggle-group" id="pg-stagger-mode" data-mode="simple">
          <button type="button" class="pg-toggle" id="pg-stagger-simple" aria-pressed="true">Simple</button>
          <button type="button" class="pg-toggle" id="pg-stagger-advanced" aria-pressed="false">Advanced</button>
        </div>
        <div id="pg-stagger-simple-wrap">
          ${buildTrackSliderHTML({
            id: "pg-stagger-value",
            label: "Stagger",
            min: 0,
            max: 2,
            step: 0.01,
            value: 0.1,
          })}
        </div>
        <div id="pg-stagger-advanced-wrap" hidden>
          ${buildTrackSliderHTML({
            id: "pg-stagger-amount",
            label: "Amount",
            min: 0,
            max: 2,
            step: 0.01,
            value: 0.1,
          })}
          <div class="pg-control-bar">
            <span class="pg-control-bar__label">Each</span>
            <input type="number" class="pg-input" id="pg-stagger-each" step="0.01" placeholder="—" />
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
        </div>
      </div>`;
  }

  function buildPropGridHTML() {
    const blocks = ANIM_PROPS.map((prop) => {
      if (prop.type === "text") {
        return `
          <div class="pg-prop-block pg-prop-block--text" data-prop="${prop.key}">
            <span class="pg-section-title pg-section-title--prop">${prop.key}</span>
            <div class="pg-prop-block__controls">
              <div class="pg-control-bar pg-control-bar--compact">
                <span class="pg-control-bar__label">Start</span>
                <input type="text" class="pg-input" id="pg-prop-${prop.key}-start" data-role="prop-start" />
              </div>
              <div class="pg-control-bar pg-control-bar--compact">
                <span class="pg-control-bar__label">End</span>
                <input type="text" class="pg-input" id="pg-prop-${prop.key}-end" data-role="prop-end" />
              </div>
            </div>
          </div>`;
      }
      return `
        <div class="pg-prop-block" data-prop="${prop.key}">
          <span class="pg-section-title pg-section-title--prop">${prop.key}</span>
          <div class="pg-prop-block__controls">
            ${buildTrackSliderHTML({
              id: `pg-prop-${prop.key}-start`,
              label: "Start",
              min: prop.min,
              max: prop.max,
              step: prop.step,
              value: prop.defaultFrom,
              labelPlacement: "inside",
              inputAttrs: `data-role="prop-start" aria-label="${prop.key} start"`,
            })}
            ${buildTrackSliderHTML({
              id: `pg-prop-${prop.key}-end`,
              label: "End",
              min: prop.min,
              max: prop.max,
              step: prop.step,
              value: prop.defaultTo,
              labelPlacement: "inside",
              inputAttrs: `data-role="prop-end" aria-label="${prop.key} end"`,
            })}
          </div>
        </div>`;
    }).join("");

    return `<div class="pg-prop-list">${blocks}</div>`;
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
        <div class="pg-panel__actions">
          <button type="button" class="pg-btn pg-btn--primary" id="pg-copy-config">Copy config</button>
          <button type="button" class="pg-btn" id="pg-copy-code">Copy code</button>
          <button type="button" class="pg-btn pg-btn--ghost" id="pg-reset">Reset</button>
        </div>
        <div class="pg-tabs" role="tablist">
          <button type="button" class="pg-tabs__btn" role="tab" data-tab="0" aria-selected="true">Typography</button>
          <button type="button" class="pg-tabs__btn" role="tab" data-tab="1">Properties</button>
          <button type="button" class="pg-tabs__btn" role="tab" data-tab="2">SplitText</button>
          <button type="button" class="pg-tabs__btn" role="tab" data-tab="3">ScrollTrigger</button>
        </div>
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
          ${buildDropdownFieldHTML({
            id: "pg-text-align",
            label: "Align",
            optionsHtml: `
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>`,
          })}
          ${buildDropdownFieldHTML({
            id: "pg-text-transform",
            label: "Transform",
            optionsHtml: `
              <option value="none">None</option>
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
              <option value="capitalize">Capitalize</option>`,
          })}
          <button type="button" class="pg-btn" id="pg-copy-css">Copy CSS</button>
        </div>
        <div class="pg-tab-panel" data-tab-panel="1" role="tabpanel" hidden>
          <div class="pg-control-stack">
            ${buildTrackSliderHTML({
              id: "pg-duration",
              label: "Duration",
              min: 0.1,
              max: 5,
              step: 0.05,
              value: 1,
            })}
            ${buildDropdownFieldHTML({ id: "pg-ease", label: "Ease", optionsHtml: easeOptions })}
          </div>
          ${buildDropdownFieldHTML({
            id: "pg-animate-target",
            label: "Animate",
            optionsHtml: `
              <option value="lines">lines</option>
              <option value="words">words</option>
              <option value="chars">chars</option>`,
          })}
          <div class="pg-subtabs" role="tablist" aria-label="Tween properties">
            <button type="button" class="pg-subtabs__btn" role="tab" data-subtab="0" aria-selected="true">Properties</button>
            <button type="button" class="pg-subtabs__btn" role="tab" data-subtab="1">Stagger</button>
          </div>
          <div class="pg-subtab-panel" data-subtab-panel="0" role="tabpanel">
            ${buildPropGridHTML()}
          </div>
          <div class="pg-subtab-panel" data-subtab-panel="1" role="tabpanel" hidden>
            ${buildStaggerBlockHTML(staggerFromOptions, easeOptions)}
          </div>
        </div>
        <div class="pg-tab-panel" data-tab-panel="2" role="tabpanel" hidden>
          <div class="pg-field">
            <span class="pg-field__label">Type</span>
            <div class="pg-toggle-group">
              <button type="button" class="pg-toggle" id="pg-type-chars" aria-pressed="false">chars</button>
              <button type="button" class="pg-toggle" id="pg-type-words" aria-pressed="true">words</button>
              <button type="button" class="pg-toggle" id="pg-type-lines" aria-pressed="true">lines</button>
            </div>
          </div>
          <div class="pg-field">
            <span class="pg-field__label">Mask</span>
            <div class="pg-toggle-group" id="pg-mask-group">
              <button type="button" class="pg-toggle" id="pg-mask-none" aria-pressed="false">none</button>
              <button type="button" class="pg-toggle" id="pg-mask-chars" aria-pressed="false">chars</button>
              <button type="button" class="pg-toggle" id="pg-mask-words" aria-pressed="false">words</button>
              <button type="button" class="pg-toggle" id="pg-mask-lines" aria-pressed="true">lines</button>
            </div>
          </div>
          <div class="pg-field">
            <span class="pg-field__label">Split options</span>
            <div class="pg-toggle-group">
              <button type="button" class="pg-toggle" id="pg-split-autosplit" aria-pressed="true">autoSplit</button>
              <button type="button" class="pg-toggle" id="pg-split-smartsplit" aria-pressed="true">smartSplit</button>
            </div>
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
        <div class="pg-tab-panel" data-tab-panel="3" role="tabpanel" hidden>
          <div class="pg-field">
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
          <div class="pg-field pg-field--scrub">
            <span class="pg-field__label">Scrub</span>
            <div class="pg-scrub-modes" id="pg-scrub-mode" data-mode="on">
              <button type="button" class="pg-toggle" id="pg-scrub-off">Off</button>
              <button type="button" class="pg-toggle" id="pg-scrub-on" aria-pressed="true">On</button>
              <button type="button" class="pg-toggle" id="pg-scrub-smooth">Smooth</button>
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
          <div class="pg-field">
            <span class="pg-field__label">Debug</span>
            <div class="pg-toggle-group">
              <button type="button" class="pg-toggle" id="pg-st-markers" aria-pressed="false">markers</button>
            </div>
          </div>
        </div>
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
    tabButtons = [...panel.querySelectorAll(".pg-tabs__btn")];
    tabPanels = [...panel.querySelectorAll(".pg-tab-panel")];

    const propertiesPanel = panel.querySelector('[data-tab-panel="1"]');
    if (propertiesPanel) {
      subTabButtons = [...propertiesPanel.querySelectorAll(".pg-subtabs__btn")];
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

    el.staggerMode = document.getElementById("pg-stagger-mode");
    el.staggerModeSimple = document.getElementById("pg-stagger-simple");
    el.staggerModeAdvanced = document.getElementById("pg-stagger-advanced");
    el.staggerSimpleWrap = document.getElementById("pg-stagger-simple-wrap");
    el.staggerAdvancedWrap = document.getElementById("pg-stagger-advanced-wrap");
    el.staggerValue = document.getElementById("pg-stagger-value");
    el.staggerValueOut = document.getElementById("pg-stagger-value-out");
    el.staggerAmount = document.getElementById("pg-stagger-amount");
    el.staggerAmountOut = document.getElementById("pg-stagger-amount-out");
    el.staggerEach = document.getElementById("pg-stagger-each");
    el.staggerFrom = document.getElementById("pg-stagger-from");
    el.staggerEase = document.getElementById("pg-stagger-ease");

    el.typeChars = document.getElementById("pg-type-chars");
    el.typeWords = document.getElementById("pg-type-words");
    el.typeLines = document.getElementById("pg-type-lines");
    el.maskNone = document.getElementById("pg-mask-none");
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
    if (stagger.mode === "simple") return String(stagger.value ?? 0.1);
    const parts = [`amount: ${stagger.amount ?? 0.1}`, `from: ${JSON.stringify(stagger.from || "start")}`];
    if (stagger.each != null && stagger.each !== "") parts.push(`each: ${stagger.each}`);
    if (stagger.ease && stagger.ease !== "none") parts.push(`ease: ${JSON.stringify(stagger.ease)}`);
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
    const maskLine = cfg.splitText.mask ? `\n  mask: ${JSON.stringify(cfg.splitText.mask)},` : "";
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
    btn.classList.add("pg-btn--done");
    await new Promise((r) => setTimeout(r, 1400));
    btn.textContent = prev;
    btn.classList.remove("pg-btn--done");
  }

  function bindLiveControls() {
    const liveInputs = [
      el.duration,
      el.ease,
      el.animateTarget,
      el.staggerValue,
      el.staggerAmount,
      el.staggerEach,
      el.staggerFrom,
      el.staggerEase,
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
      const evt = input.type === "range" ? "input" : "change";
      input.addEventListener(evt, () => requestLiveUpdate());
    });
  }

  function bindTypographyControls() {
    const inputs = [
      el.fontSelect,
      el.fontSize,
      el.lineHeight,
      el.letterSpacing,
      el.textAlign,
      el.textTransform,
    ];
    inputs.forEach((input) => {
      const evt = input.type === "range" ? "input" : "change";
      input.addEventListener(evt, () => markTypographyDirty());
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
        getMaskButtons().forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
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

  function bindStaggerMode() {
    el.staggerModeSimple.addEventListener("click", () => {
      el.staggerMode.setAttribute("data-mode", "simple");
      el.staggerModeSimple.setAttribute("aria-pressed", "true");
      el.staggerModeAdvanced.setAttribute("aria-pressed", "false");
      el.staggerSimpleWrap.hidden = false;
      el.staggerAdvancedWrap.hidden = true;
      requestLiveUpdate();
    });
    el.staggerModeAdvanced.addEventListener("click", () => {
      el.staggerMode.setAttribute("data-mode", "advanced");
      el.staggerModeSimple.setAttribute("aria-pressed", "false");
      el.staggerModeAdvanced.setAttribute("aria-pressed", "true");
      el.staggerSimpleWrap.hidden = true;
      el.staggerAdvancedWrap.hidden = false;
      requestLiveUpdate();
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
    committedConfig = deepClone(workingConfig);
    fillFormFromConfig(workingConfig);
    typographyDirty = false;
    splitTextDirty = false;
    setPendingUI();

    initTrackSliders();

    bindTypographyControls();
    bindSplitTextControls();
    bindStaggerMode();
    bindScrubMode();
    bindScrollPositionControls();
    bindLiveControls();
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
