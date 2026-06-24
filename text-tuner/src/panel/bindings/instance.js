import { deepClone } from "../../schema/config.js";
import { convert } from "../../convert/index.js";

export function updateInstanceUI(ctx) {
  const { getInstanceList, getActiveInstanceId } = ctx;
  const instanceList = getInstanceList();
  const activeInstanceId = getActiveInstanceId();
  const row = document.getElementById("tt-instance-row");
  const select = document.getElementById("tt-instance-select");
  const footerHint = document.getElementById("tt-footer-instance");
  const applyBtn = document.getElementById("tt-import-apply");

  if (row) row.hidden = instanceList.length <= 1;
  if (select && instanceList.length > 1) {
    select.innerHTML = instanceList
      .map(
        (inst) =>
          `<option value="${inst.id}"${inst.id === activeInstanceId ? " selected" : ""}>${inst.label}</option>`
      )
      .join("");
  }
  if (footerHint) {
    if (instanceList.length > 1 && activeInstanceId) {
      footerHint.hidden = false;
      footerHint.textContent = ` · Active: ${activeInstanceId}`;
    } else {
      footerHint.hidden = true;
    }
  }
  if (applyBtn && activeInstanceId) {
    applyBtn.textContent = `Apply → ${activeInstanceId}`;
  }
}

export function setImportDrawerOpen(ctx, open) {
  ctx.setImportDrawerOpenState(open);
  const drawer = document.getElementById("tt-import-drawer");
  const toggle = document.getElementById("tt-import-toggle");
  drawer?.toggleAttribute("hidden", !open);
  toggle?.classList.toggle("tt-segment__btn--accent", open);
  toggle?.setAttribute("aria-pressed", open ? "true" : "false");
}

export function renderImportWarnings(warnings) {
  const list = document.getElementById("tt-import-warnings");
  if (!list) return;
  if (!warnings?.length) {
    list.hidden = true;
    list.innerHTML = "";
    return;
  }
  list.hidden = false;
  list.innerHTML = warnings.map((w) => `<li>${w}</li>`).join("");
}

export function bindInstanceControls(ctx) {
  bindImportDrawer(ctx);
  bindInstanceRow(ctx);
}

function bindImportDrawer(ctx) {
  const {
    getActiveInstanceId,
    getImportDrawerOpen,
    getConvertedImportConfig,
    setConvertedImportConfig,
    getImportWarnings,
    setImportWarnings,
    onApplyImport,
    setCodeDefaults,
    setWorkingConfig,
    setCommittedConfig,
    setTypographyDirty,
    setSplitTextDirty,
    fillFormFromConfig,
    setPendingUI,
    commitAndRebuild,
  } = ctx;

  const toggle = document.getElementById("tt-import-toggle");
  const convertBtn = document.getElementById("tt-import-convert");
  const applyBtn = document.getElementById("tt-import-apply");
  const textarea = document.getElementById("tt-import-textarea");

  toggle?.addEventListener("click", () =>
    setImportDrawerOpen(ctx, !getImportDrawerOpen())
  );

  convertBtn?.addEventListener("click", () => {
    const source = textarea?.value || "";
    const result = convert(source, { id: getActiveInstanceId() });
    setConvertedImportConfig(result.config);
    setImportWarnings(result.warnings || []);
    renderImportWarnings(getImportWarnings());
    if (applyBtn) {
      applyBtn.disabled = !result.config;
      applyBtn.dataset.converted = result.config ? "1" : "0";
      applyBtn.textContent = `Apply → ${getActiveInstanceId() || "instance"}`;
    }
  });

  applyBtn?.addEventListener("click", async () => {
    const converted = getConvertedImportConfig();
    const instanceId = getActiveInstanceId();
    if (!converted || !onApplyImport || !instanceId) return;
    const session = onApplyImport(instanceId, converted);
    const defaults = deepClone(session.codeDefaults);
    setCodeDefaults(defaults);
    setWorkingConfig(defaults);
    setCommittedConfig(defaults);
    setTypographyDirty(true);
    setSplitTextDirty(true);
    fillFormFromConfig(defaults);
    setPendingUI();
    await commitAndRebuild();
    setConvertedImportConfig(null);
    setImportWarnings([]);
    renderImportWarnings([]);
    if (applyBtn) applyBtn.disabled = true;
  });
}

function bindInstanceRow(ctx) {
  const {
    switchToInstance,
    setFollowViewportEnabled,
    onResetAll,
    setCodeDefaults,
    setWorkingConfig,
    setCommittedConfig,
    setTypographyDirty,
    setSplitTextDirty,
    fillFormFromConfig,
    setPendingUI,
    runFullRebuild,
    codeDefaults,
  } = ctx;

  document.getElementById("tt-instance-select")?.addEventListener("change", (e) => {
    switchToInstance(e.target.value);
  });

  document.getElementById("tt-follow-viewport")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const next = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", next ? "true" : "false");
    btn.classList.toggle("tt-segment__btn--accent", next);
    setFollowViewportEnabled?.(next);
  });

  document.getElementById("tt-reset-all")?.addEventListener("click", async () => {
    const session = onResetAll?.();
    if (session?.codeDefaults) setCodeDefaults(deepClone(session.codeDefaults));
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
