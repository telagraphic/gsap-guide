/**
 * SplitText playground control panel (controls.html).
 * Shift+C toggles the overlay bar. All layout-affecting controls coalesce into one rebuild.
 */

const STORAGE_KEY = "splitTextPlayground";

const REBUILD_DEBOUNCE_MS = 150;

// #region agent log
function debugLog(location, message, data, hypothesisId, runId = "pre-fix") {
  const entry = {
    sessionId: "1bb1f6",
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  window.__agentDebugLogs = window.__agentDebugLogs || [];
  window.__agentDebugLogs.push(entry);
  try {
    sessionStorage.setItem(
      "agentDebugLogs",
      JSON.stringify(window.__agentDebugLogs.slice(-50))
    );
  } catch {
    /* ignore */
  }
  fetch("http://127.0.0.1:7509/ingest/09e99314-03c2-424f-9072-97c1caca0479", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1bb1f6",
    },
    body: JSON.stringify(entry),
  }).catch(() => {});
}

function countScrollTriggers() {
  return typeof ScrollTrigger !== "undefined" ? ScrollTrigger.getAll().length : -1;
}

function hasSplitDom() {
  return Boolean(
    document.querySelector(".frame__headline .word, .frame__headline .char, .frame__headline .line")
  );
}
// #endregion

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

const DEFAULTS = {
  fontVar: "--font-giest",
  fontSize: 4,
  lineHeight: 1.05,
  letterSpacing: -0.02,
  textAlign: "center",
  textTransform: "uppercase",
  splitType: "words",
};

let panel;
let fontSelect;
let fontSizeInput;
let fontSizeOutput;
let lineHeightInput;
let lineHeightOutput;
let letterSpacingInput;
let letterSpacingOutput;
let textAlignSelect;
let textTransformSelect;
let splitTypeSelect;
let controlsForm;

let teardownDemos = null;
let rebuildPending = false;
let rebuildQueued = false;
let rebuildDebounce = null;
let rebuildGeneration = 0;

function loadSettings() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota errors */
  }
}

function getSettings() {
  return {
    fontVar: fontSelect.value,
    fontSize: parseFloat(fontSizeInput.value),
    lineHeight: parseFloat(lineHeightInput.value),
    letterSpacing: parseFloat(letterSpacingInput.value),
    textAlign: textAlignSelect.value,
    textTransform: textTransformSelect.value,
    splitType: splitTypeSelect.value,
  };
}

/** Live preview via CSS variables only — never touch split DOM (avoids autoSplit races). */
function applyTypographyVars({
  fontVar,
  fontSize,
  lineHeight,
  letterSpacing,
  textAlign,
  textTransform,
}) {
  const root = document.documentElement;

  root.style.setProperty("--font-sans-serif", `var(${fontVar})`);
  root.style.setProperty("--playground-font-size", `${fontSize}rem`);
  root.style.setProperty("--playground-line-height", String(lineHeight));
  root.style.setProperty("--playground-letter-spacing", `${letterSpacing}em`);
  root.style.setProperty("--playground-text-align", textAlign);
  root.style.setProperty("--playground-text-transform", textTransform);

  fontSizeOutput.textContent = `${fontSize.toFixed(2)}rem`;
  lineHeightOutput.textContent = lineHeight.toFixed(2);
  letterSpacingOutput.textContent = `${letterSpacing.toFixed(2)}em`;
}

/** Update slider readouts only — no CSS (avoids autoSplit races on live split DOM). */
function updateControlOutputs(settings) {
  fontSizeOutput.textContent = `${settings.fontSize.toFixed(2)}rem`;
  lineHeightOutput.textContent = settings.lineHeight.toFixed(2);
  letterSpacingOutput.textContent = `${settings.letterSpacing.toFixed(2)}em`;
}

function populateFontSelect(selectedVar) {
  fontSelect.innerHTML = FONTS.map(
    ({ label, cssVar }) =>
      `<option value="${cssVar}"${cssVar === selectedVar ? " selected" : ""}>${label}</option>`
  ).join("");
}

function setPanelSyncing(syncing) {
  panel.classList.toggle("controls-bar--syncing", syncing);
}

function setPanelOpen(open) {
  if (open === isPanelOpen()) return;

  if (open) {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      panel.classList.add("controls-bar--open");
    });
    return;
  }

  panel.classList.remove("controls-bar--open");
  panel.setAttribute("aria-hidden", "true");

  const onFadeOutEnd = (event) => {
    if (event.target !== panel || event.propertyName !== "opacity") return;
    panel.removeEventListener("transitionend", onFadeOutEnd);
    if (!isPanelOpen()) {
      panel.hidden = true;
    }
  };

  panel.addEventListener("transitionend", onFadeOutEnd);
}

function isPanelOpen() {
  return panel.classList.contains("controls-bar--open");
}

async function waitForPlaygroundFonts(settings) {
  applyTypographyVars(settings);

  await new Promise((resolve) => requestAnimationFrame(resolve));

  const headline = document.querySelector(".frame__headline");
  if (!headline) {
    await document.fonts.ready;
    return;
  }

  const style = getComputedStyle(headline);
  const fontSpec = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

  try {
    await document.fonts.load(fontSpec);
  } catch {
    /* fall through */
  }

  await document.fonts.ready;

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

async function rebuildDemos() {
  if (typeof window.initSplitTextDemos !== "function") return;

  if (rebuildPending) {
    rebuildQueued = true;
    // #region agent log
    debugLog(
      "controls.js:rebuildDemos",
      "rebuild skipped — already pending",
      { rebuildQueued: true, stCount: countScrollTriggers() },
      "A"
    );
    // #endregion
    return;
  }

  const generation = ++rebuildGeneration;
  rebuildPending = true;
  setPanelSyncing(true);

  // #region agent log
  debugLog(
    "controls.js:rebuildDemos",
    "rebuild start",
    {
      generation,
      stCountBefore: countScrollTriggers(),
      hasSplitDom: hasSplitDom(),
      rebuildGeneration,
    },
    "D"
  );
  // #endregion

  try {
    const settings = getSettings();
    saveSettings(settings);

    if (typeof teardownDemos === "function") {
      teardownDemos();
      teardownDemos = null;
    }

    // #region agent log
    debugLog(
      "controls.js:rebuildDemos",
      "after teardown",
      {
        generation,
        stCountAfterTeardown: countScrollTriggers(),
        hasSplitDom: hasSplitDom(),
        generationMatch: generation === rebuildGeneration,
      },
      "C"
    );
    // #endregion

    if (generation !== rebuildGeneration) return;

    await waitForPlaygroundFonts(settings);

    if (generation !== rebuildGeneration) return;

    teardownDemos = window.initSplitTextDemos({ splitType: settings.splitType });

    if (generation !== rebuildGeneration) {
      if (typeof teardownDemos === "function") {
        teardownDemos();
        teardownDemos = null;
      }
      return;
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    ScrollTrigger.refresh(true);
    ScrollTrigger.update();

    // #region agent log
    const triggers = ScrollTrigger.getAll();
    debugLog(
      "controls.js:rebuildDemos",
      "rebuild complete",
      {
        generation,
        stCountAfter: triggers.length,
        triggerProgress: triggers.map((st) => ({
          id: st.vars?.id ?? st.trigger?.className?.slice?.(0, 40),
          progress: Number(st.progress.toFixed(3)),
          isActive: st.isActive,
        })),
        scrollY: window.scrollY,
        hasSplitDom: hasSplitDom(),
      },
      "E"
    );
    // #endregion
  } catch (err) {
    console.error("[controls] rebuild failed:", err);
    // #region agent log
    debugLog(
      "controls.js:rebuildDemos",
      "rebuild error",
      { error: String(err) },
      "D"
    );
    // #endregion
  } finally {
    rebuildPending = false;
    setPanelSyncing(false);

    if (rebuildQueued) {
      rebuildQueued = false;
      await rebuildDemos();
    }
  }
}

/** Coalesce rapid control changes into one rebuild with the latest settings. */
function requestRebuild(event) {
  const settings = getSettings();

  if (event?.target?.type === "range") {
    updateControlOutputs(settings);
  }

  saveSettings(settings);

  // #region agent log
  debugLog(
    "controls.js:requestRebuild",
    "control change",
    {
      eventType: event?.type ?? "unknown",
      sourceId: event?.target?.id ?? "unknown",
      stCount: countScrollTriggers(),
      hasSplitDom: hasSplitDom(),
      rebuildPending,
      debounceMs: REBUILD_DEBOUNCE_MS,
    },
    event?.type === "change" ? "A" : "B"
  );
  // #endregion

  if (rebuildPending) {
    rebuildQueued = true;
  }

  clearTimeout(rebuildDebounce);
  rebuildDebounce = setTimeout(() => {
    rebuildDebounce = null;
    rebuildDemos();
  }, REBUILD_DEBOUNCE_MS);
}

function bindControlEvents() {
  const selects = [
    fontSelect,
    textAlignSelect,
    textTransformSelect,
    splitTypeSelect,
  ];
  const ranges = [fontSizeInput, lineHeightInput, letterSpacingInput];

  selects.forEach((el) => {
    el.addEventListener("change", requestRebuild);
  });

  ranges.forEach((el) => {
    el.addEventListener("input", requestRebuild);
  });
}

function bindEvents() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isPanelOpen()) {
      setPanelOpen(false);
      return;
    }
    if (
      e.shiftKey &&
      e.key.toLowerCase() === "c" &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setPanelOpen(!isPanelOpen());
    }
  });

  controlsForm.addEventListener("submit", (e) => e.preventDefault());
  bindControlEvents();
}

function cacheElements() {
  panel = document.getElementById("controls-panel");
  fontSelect = document.getElementById("controls-font");
  fontSizeInput = document.getElementById("controls-font-size");
  fontSizeOutput = document.getElementById("controls-font-size-value");
  lineHeightInput = document.getElementById("controls-line-height");
  lineHeightOutput = document.getElementById("controls-line-height-value");
  letterSpacingInput = document.getElementById("controls-letter-spacing");
  letterSpacingOutput = document.getElementById(
    "controls-letter-spacing-value"
  );
  textAlignSelect = document.getElementById("controls-text-align");
  textTransformSelect = document.getElementById("controls-text-transform");
  splitTypeSelect = document.getElementById("controls-split-type");
  controlsForm = document.getElementById("controls-form");

  if (
    !panel ||
    !fontSelect ||
    !fontSizeInput ||
    !fontSizeOutput ||
    !lineHeightInput ||
    !lineHeightOutput ||
    !letterSpacingInput ||
    !letterSpacingOutput ||
    !textAlignSelect ||
    !textTransformSelect ||
    !splitTypeSelect ||
    !controlsForm
  ) {
    throw new Error("Controls panel markup is missing required elements.");
  }
}

async function init() {
  cacheElements();

  const settings = loadSettings();

  populateFontSelect(settings.fontVar);
  fontSizeInput.value = settings.fontSize;
  lineHeightInput.value = settings.lineHeight;
  letterSpacingInput.value = settings.letterSpacing;
  textAlignSelect.value = settings.textAlign;
  textTransformSelect.value = settings.textTransform;
  splitTypeSelect.value = settings.splitType;

  applyTypographyVars(settings);
  bindEvents();

  if (typeof window.initSplitTextDemos === "function") {
    await rebuildDemos();
  }
}

function bootstrap() {
  init().catch((err) => {
    console.error("[controls] init failed:", err);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
