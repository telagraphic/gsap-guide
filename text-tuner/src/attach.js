import { deepClone } from "./schema/config.js";
import { createSplitScrollRunner } from "./runner/index.js";
import { discover, getRegistry, getActiveId } from "./discover.js";
import { attachPanel, isPanelActive } from "./panel/index.js";
import { resolveFonts } from "./fonts/index.js";
import { createInstanceManager } from "./attach/instance-manager.js";
import { createFollowViewport } from "./attach/follow-viewport.js";
import { applyTypographyToScope } from "./panel/typography.js";

const DEFAULT_STORAGE_PREFIX = "text-tuner";

let _manager = null;
let _followViewport = null;
let _initFn = createSplitScrollRunner;
let _productionGuard = false;

export function setRunnerFactory(factory) {
  _initFn = factory;
}

export function getInstanceManager() {
  return _manager;
}

function guardProduction(options) {
  if (options.productionEnabled === true) {
    console.warn(
      "[text-tuner] attach() skipped — productionEnabled:true disables the dev panel"
    );
    _productionGuard = true;
    return true;
  }
  return false;
}

function buildFollowViewport(manager, panelApi) {
  return createFollowViewport({
    getTriggerElements: () =>
      [...document.querySelectorAll("[data-playground-trigger]")],
    isPanelOpen: () => panelApi?.isPanelOpen?.() ?? false,
    getActiveId: () =>
      panelApi?.getActiveInstanceId?.() ?? manager.getActiveId(),
    onSwitch: (id) => panelApi?.switchToInstance?.(id),
  });
}

/**
 * Wire registry → panel for the active instance.
 * v2 compat: pass `{ init, defaults, storageKey }` without prior discover().
 */
export async function attach(options = {}) {
  if (guardProduction(options)) return null;

  const fonts = await resolveFonts(options);

  if (options.init && typeof options.init === "function") {
    const compatId = options.activeInstanceId || "_v2";
    const manager = createInstanceManager({
      registry: { [compatId]: { defaults: options.defaults || {} } },
      storagePrefix: options.storageKey || DEFAULT_STORAGE_PREFIX,
      initFn: options.init,
    });
    manager.setActiveId(compatId);
    return attachPanel({
      init: (config) => manager.rebuildActive(config),
      defaults: options.defaults,
      storageKey: options.storageKey || DEFAULT_STORAGE_PREFIX,
      targets: options.targets,
      typographyScope: options.typographyScope || options.typographyTarget,
      fonts,
      instances: options.instances || [{ id: compatId, label: compatId }],
      activeInstanceId: compatId,
      manager,
    });
  }

  if (!_manager?.getRegistry()) {
    discover(options.discover || {});
  }

  const registry = getRegistry();
  const storagePrefix = options.storageKey || DEFAULT_STORAGE_PREFIX;

  _manager = createInstanceManager({
    registry,
    storagePrefix,
    initFn: options.initFn || _initFn,
  });

  const activeId = options.activeId || getActiveId(options.fallbackId);
  _manager.setActiveId(activeId);
  _manager.initAll();

  Object.keys(registry).forEach((id) => {
    applyTypographyToScope(
      `[data-playground="${id}"]`,
      _manager.getCodeDefaults(id).typography
    );
  });

  const session = _manager.getSession(activeId);

  const panelApi = attachPanel({
    init: (config) => _manager.rebuildActive(config),
    defaults: deepClone(session.codeDefaults),
    storageKey: session.storageKey,
    targets: options.targets || ".split-target",
    typographyScope: session.typographyScope,
    fonts,
    instances: _manager.listInstances(),
    activeInstanceId: activeId,
    manager: _manager,
    onSwitchInstance: async (nextId) => {
      _manager.setActiveId(nextId);
      return _manager.getSession(nextId);
    },
    onResetAll: () => {
      _manager.clearAllSessions();
      _manager.clearAllImports();
      return _manager.getSession(_manager.getActiveId());
    },
    onApplyImport: (id, config) => {
      _manager.applyImport(id, config);
      return _manager.getSession(id);
    },
    getActiveInstanceId: () => _manager.getActiveId(),
  });

  _followViewport = buildFollowViewport(_manager, panelApi);
  _followViewport.setEnabled(Boolean(options.followViewport));

  if (panelApi?.setFollowViewportHandler) {
    panelApi.setFollowViewportHandler((enabled) => _followViewport.setEnabled(enabled));
  }

  panelApi?.setRefreshFollowViewport?.(() => {
    if (_followViewport?.isEnabled()) _followViewport.refresh();
  });

  console.info(
    `[text-tuner] attached panel → "${activeId}" (${Object.keys(registry).length} instances on page)`
  );

  return {
    activeId,
    registry,
    instances: _manager.liveInstances,
    manager: _manager,
    switchToInstance: panelApi?.switchToInstance,
  };
}

export function isActive() {
  return isPanelActive();
}

export function getActiveInstanceId() {
  return _manager?.getActiveId() ?? null;
}

export function getLiveInstances() {
  return _manager?.liveInstances ?? {};
}

export function initAll(registry = getRegistry()) {
  if (!_manager) {
    _manager = createInstanceManager({
      registry,
      storagePrefix: DEFAULT_STORAGE_PREFIX,
      initFn: _initFn,
    });
  }
  return _manager.initAll();
}
