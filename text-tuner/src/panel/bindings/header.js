import { deepClone } from "../../schema/config.js";
import {
  copyConfigToClipboard,
  copyCodeToClipboard,
  copyCssToClipboard,
  flashButton,
} from "../export.js";

export function bindHeaderControls(ctx) {
  bindTabsAndHeader(ctx);
  bindKeyboard(ctx);
}

function bindSubTabs(ctx) {
  const { subTabButtons, selectSubTab } = ctx;
  subTabButtons?.forEach((btn) => {
    btn.addEventListener("click", () => selectSubTab(Number(btn.dataset.subtab)));
  });
}

function bindTabsAndHeader(ctx) {
  const {
    tabButtons,
    selectTab,
    readConfigFromForm,
    exportTypographyCss,
    storageKey,
    codeDefaults,
    fillFormFromConfig,
    setPendingUI,
    runFullRebuild,
    setTypographyDirty,
    setSplitTextDirty,
    setWorkingConfig,
    setCommittedConfig,
  } = ctx;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => selectTab(Number(btn.dataset.tab)));
  });

  bindSubTabs(ctx);

  document.getElementById("tt-copy-config").addEventListener("click", async () => {
    const cfg = readConfigFromForm();
    await copyConfigToClipboard(cfg);
    flashButton(document.getElementById("tt-copy-config"), "Copied");
  });

  document.getElementById("tt-copy-code").addEventListener("click", async () => {
    const cfg = readConfigFromForm();
    await copyCodeToClipboard(cfg);
    flashButton(document.getElementById("tt-copy-code"), "Copied");
  });

  document.getElementById("tt-copy-css").addEventListener("click", async () => {
    const cfg = readConfigFromForm();
    await copyCssToClipboard(exportTypographyCss, cfg.typography);
    flashButton(document.getElementById("tt-copy-css"), "Copied");
  });

  document.getElementById("tt-reset").addEventListener("click", async () => {
    sessionStorage.removeItem(storageKey);
    const defaults = deepClone(codeDefaults);
    setWorkingConfig(defaults);
    setCommittedConfig(defaults);
    setTypographyDirty(false);
    setSplitTextDirty(false);
    fillFormFromConfig(defaults);
    setPendingUI();
    await runFullRebuild(defaults);
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

function bindKeyboard(ctx) {
  const { isActive, isPanelOpen, setPanelOpen, selectTab, escBlurPending } = ctx;

  document.addEventListener("keydown", (e) => {
    if (!isActive()) return;

    const mod = e.metaKey || e.ctrlKey;
    const tag = document.activeElement?.tagName;
    const inField = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";

    if (e.key === "Escape" && isPanelOpen()) {
      if (inField && !escBlurPending.value) {
        document.activeElement?.blur();
        escBlurPending.value = true;
        e.preventDefault();
        return;
      }
      escBlurPending.value = false;
      e.preventDefault();
      setPanelOpen(false);
      return;
    }
    escBlurPending.value = false;

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
