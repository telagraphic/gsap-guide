import { deepClone, deepMerge, needsRebuild } from "../schema/config.js";

const LIVE_DEBOUNCE_MS = 48;
const TYPOGRAPHY_FONT_DEBOUNCE_MS = 150;

/**
 * Runner commit, rebuild, and live-update orchestration for the panel view.
 */
export function createPanelLifecycle({
  getInstanceManager,
  getActiveInstanceId,
  getAttachConfig,
  readConfigFromForm,
  waitForFonts,
  loadTypographyFonts,
  applyTypography,
  saveStoredConfig,
  setPanelSyncing,
  getCommittedConfig,
  setCommittedConfig,
  getWorkingConfig,
  setWorkingConfig,
  getTypographyDirty,
  setTypographyDirty,
  getSplitTextDirty,
  setSplitTextDirty,
  setPendingUI,
  isPanelOpen,
  getRuntime,
}) {
  let liveDebounce = null;
  let typographyDebounce = null;
  let typographyFontDebounce = null;
  let rebuildPending = false;
  let rebuildQueued = false;
  let rebuildGeneration = 0;

  async function runFullRebuild(cfg) {
    const instanceManager = getInstanceManager();
    const activeInstanceId = getActiveInstanceId();
    const attachConfig = getAttachConfig();

    if (!instanceManager && typeof attachConfig?.init !== "function") return;

    if (rebuildPending) {
      rebuildQueued = true;
      return;
    }

    const generation = ++rebuildGeneration;
    rebuildPending = true;
    setPanelSyncing(true);

    try {
      if (generation !== rebuildGeneration) return;

      await waitForFonts(cfg.typography);

      if (generation !== rebuildGeneration) return;

      if (instanceManager && activeInstanceId) {
        instanceManager.rebuild(activeInstanceId, cfg);
      } else if (typeof attachConfig?.init === "function") {
        attachConfig.init(cfg);
      }

      applyTypography(cfg.typography);

      setCommittedConfig(deepClone(cfg));
      setWorkingConfig(deepClone(cfg));

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh(true);
        ScrollTrigger.update();
      }
    } catch (err) {
      console.error("[text-tuner] rebuild failed:", err);
    } finally {
      rebuildPending = false;
      setPanelSyncing(false);
      if (rebuildQueued) {
        rebuildQueued = false;
        await runFullRebuild(getWorkingConfig() || getCommittedConfig());
      }
    }
  }

  async function commitAndRebuild() {
    const workingConfig = readConfigFromForm();
    setWorkingConfig(workingConfig);
    const dirtyFlags = {
      typographyDirty: getTypographyDirty(),
      splitTextDirty: getSplitTextDirty(),
    };
    setTypographyDirty(false);
    setSplitTextDirty(false);
    setPendingUI();

    const instanceManager = getInstanceManager();
    const activeInstanceId = getActiveInstanceId();

    if (instanceManager && activeInstanceId) {
      const result = await instanceManager.commit(workingConfig, {
        ...dirtyFlags,
        persist: saveStoredConfig,
        beforeRebuild: async (c) => waitForFonts(c.typography),
      });
      setCommittedConfig(deepClone(workingConfig));
      if (result.rebuilt) {
        applyTypography(workingConfig.typography);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      return;
    }

    saveStoredConfig(workingConfig);
    const shouldRebuild =
      dirtyFlags.typographyDirty ||
      dirtyFlags.splitTextDirty ||
      needsRebuild(getCommittedConfig(), workingConfig);
    if (shouldRebuild) {
      await runFullRebuild(workingConfig);
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      setCommittedConfig(deepClone(workingConfig));
    }
  }

  function requestLiveUpdate() {
    if (!isPanelOpen()) return;
    const runtime = getRuntime();
    if (!runtime?.applyLive) return;
    clearTimeout(liveDebounce);
    liveDebounce = setTimeout(() => {
      liveDebounce = null;
      const next = readConfigFromForm();
      const merged = deepMerge(getWorkingConfig() || getCommittedConfig(), next);
      setWorkingConfig(merged);
      const instanceManager = getInstanceManager();
      if (instanceManager) {
        instanceManager.applyLive(merged);
      } else {
        runtime.applyLive(merged);
      }
    }, LIVE_DEBOUNCE_MS);
  }

  function markTypographyDirty() {
    setTypographyDirty(true);
    setPendingUI();
  }

  function requestTypographyUpdate() {
    if (!isPanelOpen()) return;
    markTypographyDirty();

    const typography = readConfigFromForm().typography;
    applyTypography(typography);

    clearTimeout(typographyDebounce);
    typographyDebounce = setTimeout(() => {
      typographyDebounce = null;
      setWorkingConfig(
        deepMerge(getWorkingConfig() || getCommittedConfig(), { typography })
      );

      clearTimeout(typographyFontDebounce);
      typographyFontDebounce = setTimeout(async () => {
        typographyFontDebounce = null;
        setPanelSyncing(true);
        try {
          await loadTypographyFonts();
        } finally {
          setPanelSyncing(false);
        }
      }, TYPOGRAPHY_FONT_DEBOUNCE_MS);
    }, LIVE_DEBOUNCE_MS);
  }

  function markSplitTextDirty(updateAnimateTargetOptions, getTypeArray) {
    setSplitTextDirty(true);
    setPendingUI();
    updateAnimateTargetOptions(getTypeArray());
  }

  return {
    runFullRebuild,
    commitAndRebuild,
    requestLiveUpdate,
    requestTypographyUpdate,
    markTypographyDirty,
    markSplitTextDirty,
  };
}
