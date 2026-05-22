/**
 * Split Text Playground — dev-only typography panel for GSAP SplitText demos.
 * Shift+C toggles the panel. Attach before the demo script runs.
 *
 * SplitText.create options (type, mask, etc.) live in each demo's script — not here.
 */

(function () {
  const REBUILD_DEBOUNCE_MS = 150;

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

  const DEFAULT_SETTINGS = {
    fontVar: "--font-giest",
    fontSize: 4,
    lineHeight: 1.05,
    letterSpacing: -0.02,
    textAlign: "center",
    textTransform: "uppercase",
  };

  let active = false;
  let config = null;
  let defaults = { ...DEFAULT_SETTINGS };
  let storageKey = "splitTextPlayground";

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
  let copyBtn;
  let controlsForm;

  let teardownDemos = null;
  let rebuildPending = false;
  let rebuildQueued = false;
  let rebuildDebounce = null;
  let rebuildGeneration = 0;
  let targetsSelector = ".split-target";

  function loadSettings() {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function saveSettings(settings) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      /* ignore quota errors */
    }
  }

  function getSettingsFromForm() {
    return {
      fontVar: fontSelect.value,
      fontSize: parseFloat(fontSizeInput.value),
      lineHeight: parseFloat(lineHeightInput.value),
      letterSpacing: parseFloat(letterSpacingInput.value),
      textAlign: textAlignSelect.value,
      textTransform: textTransformSelect.value,
    };
  }

  /** Fixed character width: always includes sign (+ / −) so the label slot never shifts. */
  function formatLetterSpacingValue(value) {
    const n = Math.abs(value).toFixed(2);
    const sign = value < 0 ? "-" : "+";
    return `${sign}${n}`;
  }

  function applyTypographyVars(settings) {
    const root = document.documentElement;

    root.style.setProperty("--font-sans-serif", `var(${settings.fontVar})`);
    root.style.setProperty("--playground-font-size", `${settings.fontSize}rem`);
    root.style.setProperty("--playground-line-height", String(settings.lineHeight));
    root.style.setProperty(
      "--playground-letter-spacing",
      `${settings.letterSpacing}em`
    );
    root.style.setProperty("--playground-text-align", settings.textAlign);
    root.style.setProperty("--playground-text-transform", settings.textTransform);

    fontSizeOutput.textContent = settings.fontSize.toFixed(2);
    lineHeightOutput.textContent = settings.lineHeight.toFixed(2);
    letterSpacingOutput.textContent = formatLetterSpacingValue(
      settings.letterSpacing
    );
  }

  function updateControlOutputs(settings) {
    fontSizeOutput.textContent = settings.fontSize.toFixed(2);
    lineHeightOutput.textContent = settings.lineHeight.toFixed(2);
    letterSpacingOutput.textContent = formatLetterSpacingValue(
      settings.letterSpacing
    );
  }

  function exportSettingsCss(settings) {
    return `:root {
  --font-sans-serif: var(${settings.fontVar});
  --playground-font-size: ${settings.fontSize}rem;
  --playground-line-height: ${settings.lineHeight};
  --playground-letter-spacing: ${settings.letterSpacing}em;
  --playground-text-align: ${settings.textAlign};
  --playground-text-transform: ${settings.textTransform};
}`;
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

  function isPanelOpen() {
    return panel.classList.contains("controls-bar--open");
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

  async function waitForPlaygroundFonts(settings) {
    applyTypographyVars(settings);

    await new Promise((resolve) => requestAnimationFrame(resolve));

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

    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  async function rebuildDemos() {
    if (typeof config?.init !== "function") return;

    if (rebuildPending) {
      rebuildQueued = true;
      return;
    }

    const generation = ++rebuildGeneration;
    rebuildPending = true;
    setPanelSyncing(true);

    try {
      const settings = getSettingsFromForm();
      saveSettings(settings);

      if (typeof teardownDemos === "function") {
        teardownDemos();
        teardownDemos = null;
      }

      if (generation !== rebuildGeneration) return;

      await waitForPlaygroundFonts(settings);

      if (generation !== rebuildGeneration) return;

      teardownDemos = config.init(settings);

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

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh(true);
        ScrollTrigger.update();
      }
    } catch (err) {
      console.error("[split-text-playground] rebuild failed:", err);
    } finally {
      rebuildPending = false;
      setPanelSyncing(false);

      if (rebuildQueued) {
        rebuildQueued = false;
        await rebuildDemos();
      }
    }
  }

  function requestRebuild(event) {
    const settings = getSettingsFromForm();

    if (event?.target?.type === "range") {
      updateControlOutputs(settings);
    }

    saveSettings(settings);

    if (rebuildPending) {
      rebuildQueued = true;
    }

    clearTimeout(rebuildDebounce);
    rebuildDebounce = setTimeout(() => {
      rebuildDebounce = null;
      rebuildDemos();
    }, REBUILD_DEBOUNCE_MS);
  }

  async function copySettings() {
    const settings = getSettingsFromForm();
    const css = exportSettingsCss(settings);

    try {
      await navigator.clipboard.writeText(css);
      const label = copyBtn.getAttribute("aria-label") || "Copy CSS";
      copyBtn.setAttribute("aria-label", "Copied");
      copyBtn.setAttribute("title", "Copied");
      copyBtn.classList.add("controls-bar__copy-btn--done");
      setTimeout(() => {
        copyBtn.setAttribute("aria-label", label);
        copyBtn.setAttribute("title", label);
        copyBtn.classList.remove("controls-bar__copy-btn--done");
      }, 1600);
    } catch (err) {
      console.error("[split-text-playground] copy failed:", err);
    }
  }

  function injectPanel() {
    if (document.getElementById("controls-panel")) return;

    const header = document.createElement("header");
    header.id = "controls-panel";
    header.className = "controls-bar";
    header.hidden = true;
    header.setAttribute("aria-hidden", "true");
    header.setAttribute("role", "region");
    header.setAttribute("aria-label", "Split text playground");

    header.innerHTML = `
      <div class="controls-bar__inner">
        <form class="controls-bar__form" id="controls-form">
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <select id="controls-font" name="font"></select>
            </span>
          </label>
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <span class="controls-bar__label">
                <output id="controls-font-size-value" for="controls-font-size">4.00</output>
              </span>
              <input type="range" id="controls-font-size" name="fontSize" min="1" max="8" step="0.25" value="4" />
            </span>
          </label>
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <span class="controls-bar__label">
                <output id="controls-line-height-value" for="controls-line-height">1.05</output>
              </span>
              <input type="range" id="controls-line-height" name="lineHeight" min="0.2" max="4" step="0.05" value="1.05" />
            </span>
          </label>
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <span class="controls-bar__label">
                <output id="controls-letter-spacing-value" for="controls-letter-spacing">-0.02</output>
              </span>
              <input type="range" id="controls-letter-spacing" name="letterSpacing" min="-0.1" max="1" step="0.01" value="-0.02" />
            </span>
          </label>
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <select id="controls-text-align" name="textAlign">
                <option value="left">LEFT</option>
                <option value="center" selected>CENTER</option>
                <option value="right">RIGHT</option>
                <option value="justify">JUSTIFY</option>
              </select>
            </span>
          </label>
          <label class="controls-bar__field">
            <span class="controls-bar__control-wrap">
              <select id="controls-text-transform" name="textTransform">
                <option value="none">NONE</option>
                <option value="uppercase" selected>UPPER</option>
                <option value="lowercase">LOWER</option>
                <option value="capitalize">CAPITALIZE</option>
              </select>
            </span>
          </label>
          <button
            type="button"
            class="controls-bar__copy-btn"
            id="controls-copy-css"
            aria-label="Copy CSS"
            title="Copy CSS"
          >
            <svg
              class="controls-bar__copy-icon"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="6.25"
                y="6.25"
                width="9.5"
                height="9.5"
                rx="2"
                stroke="currentColor"
                stroke-width="1.25"
              />
              <path
                d="M4 12V4.75A1.75 1.75 0 0 1 5.75 3h7.5"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(header);
  }

  function cacheElements() {
    panel = document.getElementById("controls-panel");
    fontSelect = document.getElementById("controls-font");
    fontSizeInput = document.getElementById("controls-font-size");
    fontSizeOutput = document.getElementById("controls-font-size-value");
    lineHeightInput = document.getElementById("controls-line-height");
    lineHeightOutput = document.getElementById("controls-line-height-value");
    letterSpacingInput = document.getElementById("controls-letter-spacing");
    letterSpacingOutput = document.getElementById("controls-letter-spacing-value");
    textAlignSelect = document.getElementById("controls-text-align");
    textTransformSelect = document.getElementById("controls-text-transform");
    copyBtn = document.getElementById("controls-copy-css");
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
      !copyBtn ||
      !controlsForm
    ) {
      throw new Error("[split-text-playground] panel markup failed to initialize.");
    }
  }

  function bindControlEvents() {
    const selects = [fontSelect, textAlignSelect, textTransformSelect];
    const ranges = [fontSizeInput, lineHeightInput, letterSpacingInput];

    selects.forEach((el) => el.addEventListener("change", requestRebuild));
    ranges.forEach((el) => el.addEventListener("input", requestRebuild));
    copyBtn.addEventListener("click", copySettings);
  }

  function bindEvents() {
    document.addEventListener("keydown", (e) => {
      if (!active) return;
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

  async function startPlayground() {
    injectPanel();
    cacheElements();

    const settings = loadSettings();

    populateFontSelect(settings.fontVar);
    fontSizeInput.value = settings.fontSize;
    lineHeightInput.value = settings.lineHeight;
    letterSpacingInput.value = settings.letterSpacing;
    textAlignSelect.value = settings.textAlign;
    textTransformSelect.value = settings.textTransform;

    applyTypographyVars(settings);
    bindEvents();

    await rebuildDemos();
  }

  function attach(options) {
    if (!options?.init || typeof options.init !== "function") {
      throw new Error("[split-text-playground] attach() requires an init(settings) function.");
    }

    active = true;
    config = { init: options.init };
    targetsSelector = options.targets || ".split-target";
    storageKey = options.storageKey || "splitTextPlayground";
    defaults = { ...DEFAULT_SETTINGS, ...options.defaults };

    const run = () => {
      startPlayground().catch((err) => {
        console.error("[split-text-playground] init failed:", err);
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  }

  window.SplitTextPlayground = {
    attach,
    isActive: () => active,
    exportSettingsCss,
  };
})();
