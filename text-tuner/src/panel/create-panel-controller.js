/**
 * Text Tuner panel controller — orchestration layer.
 * Markup uses tt- BEM classes scoped by #text-tuner-panel (Phase 4).
 */

import { deepClone, deepMerge, normalizeStaggerConfig, needsRebuild } from "../schema/config.js";
import { EASE_OPTIONS, STAGGER_FROM, TEXT_TRANSFORM_OPTIONS } from "../schema/anim-props.js";
import { TEXT_ALIGN_OPTIONS, ICON_RESET } from "./icons.js";
import { STARTER_FONT_FALLBACK } from "../fonts/index.js";
import { injectPanel } from "./templates/inject-panel.js";
import { cachePanelElements } from "./dom.js";
import { createFormState } from "./form-state.js";
import { createTypographyHelpers } from "./typography.js";
import { createPanelLifecycle } from "./lifecycle.js";
import { initTrackSliders, syncTrackSlider } from "./components/track-slider.js";
import { getScrollOffsetUnit } from "./components/scroll-position-field.js";
import { bindPanelControls } from "./bindings/panel-bindings.js";
import { createBindingContext } from "./bindings/binding-context.js";
import { updateInstanceUI } from "./bindings/instance.js";

let active = false;
let previewFonts = STARTER_FONT_FALLBACK;
let instanceList = [];
let activeInstanceId = null;
let onSwitchInstance = null;
let onResetAll = null;
let onApplyImport = null;
let setFollowViewportEnabled = null;
let instanceManager = null;
let convertedImportConfig = null;
let importWarnings = [];
let importDrawerOpen = false;
let panelApi = {};
let attachConfig = null;
let codeDefaults = null;
let storageKey = "playgroundV2";
let targetsSelector = ".split-target";

let panel;
let tabButtons;
let tabPanels;
let subTabButtons;
let subTabPanels;
let workingConfig = null;
let committedConfig = null;

let typographyDirty = false;
let splitTextDirty = false;
let panelOpen = false;
const escBlurPending = { value: false };

let typographyScope = null;
let el = {};

let readConfigFromForm;
let fillFormFromConfig;
let getTypeArray;
let getMaskButtons;
let resetAnimProp;
let setStaggerAxis;
let setStaggerTiming;
let updateAnimateTargetOptions;

let applyTypography;
let exportTypographyCss;
let loadTypographyFonts;
let waitForFonts;
let onPanelOpen = null;
let refreshFollowViewport = null;
let bindingCtx = null;

let runFullRebuild;
let commitAndRebuild;
let requestLiveUpdate;
let requestTypographyUpdate;
let markSplitTextDirty;

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

function setPendingUI() {
  tabButtons[0]?.classList.toggle("tt-segment__btn--pending", typographyDirty);
  tabButtons[2]?.classList.toggle("tt-segment__btn--pending", splitTextDirty);
}

function setPanelSyncing(syncing) {
  panel.classList.toggle("tt-panel--syncing", syncing);
}

function setPanelOpen(open) {
  if (open === panelOpen) return;
  panelOpen = open;
  document.body.classList.toggle("text-tuner-panel-open", open);
  panel.setAttribute("aria-hidden", open ? "false" : "true");
  if (open) {
    onPanelOpen?.();
    if (refreshFollowViewport) refreshFollowViewport();
  } else {
    commitAndRebuild();
  }
}

function isPanelOpen() {
  return panelOpen;
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

function getRuntime() {
  return instanceManager?.getRuntime(activeInstanceId) ?? null;
}

async function switchToInstance(nextId) {
  if (!nextId || nextId === activeInstanceId || !onSwitchInstance) return;

  workingConfig = readConfigFromForm();
  saveStoredConfig(workingConfig);

  const session = await onSwitchInstance(nextId);
  activeInstanceId = nextId;
  storageKey = session.storageKey;
  codeDefaults = deepClone(session.codeDefaults);
  typographyScope = session.typographyScope;

  workingConfig = loadStoredConfig();
  committedConfig = deepClone(workingConfig);
  typographyDirty = false;
  splitTextDirty = false;
  fillFormFromConfig(workingConfig);
  applyTypography(workingConfig.typography);
  setPendingUI();
  updateInstanceUI(bindingCtx);

  if (needsRebuild(codeDefaults, workingConfig)) {
    await runFullRebuild(workingConfig);
  } else if (instanceManager) {
    instanceManager.applyLive(workingConfig);
  }
}

function wireLifecycle() {
  const lifecycle = createPanelLifecycle({
    getInstanceManager: () => instanceManager,
    getActiveInstanceId: () => activeInstanceId,
    getAttachConfig: () => attachConfig,
    readConfigFromForm: () => readConfigFromForm(),
    waitForFonts,
    loadTypographyFonts,
    applyTypography,
    saveStoredConfig,
    setPanelSyncing,
    getCommittedConfig: () => committedConfig,
    setCommittedConfig: (v) => {
      committedConfig = v;
    },
    getWorkingConfig: () => workingConfig,
    setWorkingConfig: (v) => {
      workingConfig = v;
    },
    getTypographyDirty: () => typographyDirty,
    setTypographyDirty: (v) => {
      typographyDirty = v;
    },
    getSplitTextDirty: () => splitTextDirty,
    setSplitTextDirty: (v) => {
      splitTextDirty = v;
    },
    setPendingUI,
    isPanelOpen,
    getRuntime,
  });
  runFullRebuild = lifecycle.runFullRebuild;
  commitAndRebuild = lifecycle.commitAndRebuild;
  requestLiveUpdate = lifecycle.requestLiveUpdate;
  requestTypographyUpdate = lifecycle.requestTypographyUpdate;
  markSplitTextDirty = () => lifecycle.markSplitTextDirty(updateAnimateTargetOptions, getTypeArray);
}

async function start() {
  panel = injectPanel({
    previewFonts,
    instanceList,
    activeInstanceId,
    codeDefaults,
    TEXT_ALIGN_OPTIONS,
    TEXT_TRANSFORM_OPTIONS,
    EASE_OPTIONS,
    STAGGER_FROM,
    ICON_RESET,
  });

  const cached = cachePanelElements();
  ({ panel, tabButtons, tabPanels, subTabButtons, subTabPanels, el } = cached);

  const typography = createTypographyHelpers({
    getScope: () => typographyScope,
    getTargetsSelector: () => targetsSelector,
  });
  ({ applyTypography, exportTypographyCss, loadTypographyFonts, waitForFonts } = typography);

  const form = createFormState({
    el,
    codeDefaults,
    previewFonts,
    panel,
    syncTrackSliderFn: (input) => syncTrackSlider(input, getScrollOffsetUnit),
    requestLiveUpdate: () => requestLiveUpdate?.(),
  });
  ({
    readConfigFromForm,
    fillFormFromConfig,
    getTypeArray,
    getMaskButtons,
    resetAnimProp,
    setStaggerAxis,
    setStaggerTiming,
    updateAnimateTargetOptions,
  } = form);

  wireLifecycle();

  workingConfig = loadStoredConfig();
  workingConfig.stagger = normalizeStaggerConfig(workingConfig.stagger);
  committedConfig = deepClone(workingConfig);
  fillFormFromConfig(workingConfig);
  typographyDirty = false;
  splitTextDirty = false;
  setPendingUI();

  initTrackSliders(panel, getScrollOffsetUnit);

  bindingCtx = createBindingContext(
    {
      panel,
      el,
      tabButtons,
      subTabButtons,
      subTabPanels,
      escBlurPending,
      isActive: () => active,
      getInstanceList: () => instanceList,
      getActiveInstanceId: () => activeInstanceId,
      getImportDrawerOpen: () => importDrawerOpen,
      getConvertedImportConfig: () => convertedImportConfig,
      getImportWarnings: () => importWarnings,
      getCodeDefaults: () => codeDefaults,
      getStorageKey: () => storageKey,
    },
    {
      readConfigFromForm,
      fillFormFromConfig,
      resetAnimProp,
      getTypeArray,
      getMaskButtons,
      setStaggerAxis,
      setStaggerTiming,
      requestLiveUpdate,
      requestTypographyUpdate,
      markSplitTextDirty,
      selectTab,
      selectSubTab,
      setPanelOpen,
      isPanelOpen,
      runFullRebuild,
      commitAndRebuild,
      exportTypographyCss,
      switchToInstance,
      setFollowViewportEnabled: (enabled) => setFollowViewportEnabled?.(enabled),
      onResetAll,
      onApplyImport,
      setPendingUI,
      setImportDrawerOpenState: (open) => {
        importDrawerOpen = open;
      },
      setConvertedImportConfig: (v) => {
        convertedImportConfig = v;
      },
      setImportWarnings: (v) => {
        importWarnings = v;
      },
      setCodeDefaults: (v) => {
        codeDefaults = v;
      },
      setWorkingConfig: (v) => {
        workingConfig = v;
      },
      setCommittedConfig: (v) => {
        committedConfig = v;
      },
      setTypographyDirty: (v) => {
        typographyDirty = v;
      },
      setSplitTextDirty: (v) => {
        splitTextDirty = v;
      },
    }
  );

  bindPanelControls(bindingCtx);
  updateInstanceUI(bindingCtx);
  await runFullRebuild(workingConfig);
}

function attach(options) {
  if (!options?.init || typeof options.init !== "function") {
    throw new Error("[text-tuner] attach() requires init(config).");
  }

  active = true;
  attachConfig = { init: options.init };
  codeDefaults = deepClone(options.defaults || {});
  storageKey = options.storageKey || "playgroundV2";
  targetsSelector = options.targets || ".split-target";
  typographyScope = options.typographyScope || options.typographyTarget || null;
  previewFonts = options.fonts?.length ? options.fonts : STARTER_FONT_FALLBACK;
  instanceList = options.instances || [];
  activeInstanceId = options.activeInstanceId || null;
  onSwitchInstance = options.onSwitchInstance || null;
  onResetAll = options.onResetAll || null;
  onApplyImport = options.onApplyImport || null;
  instanceManager = options.manager || null;

  panelApi = {
    isPanelOpen,
    switchToInstance,
    getActiveInstanceId: () => activeInstanceId,
    setFollowViewportHandler: (fn) => {
      setFollowViewportEnabled = fn;
    },
    setRefreshFollowViewport: (fn) => {
      refreshFollowViewport = fn;
    },
    setOnPanelOpen: (fn) => {
      onPanelOpen = fn;
    },
  };

  const run = () => start().catch((err) => console.error("[text-tuner] start failed:", err));

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  return panelApi;
}

export function attachPanel(options) {
  return attach(options);
}

export function isPanelActive() {
  return active;
}

/** v2 global compat */
export function installV2Shim() {
  window.SplitTextPlaygroundV2 = {
    attach,
    isActive: () => active,
  };
}
