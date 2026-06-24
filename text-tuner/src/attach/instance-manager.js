import { deepClone, deepMerge } from "../schema/config.js";
import { createInstanceSession } from "./instance-session.js";

/**
 * Per-id session orchestration for multi-instance pages.
 */
export function createInstanceManager({ registry, storagePrefix, initFn }) {
  let activeId = null;
  /** @type {Record<string, ReturnType<typeof createInstanceSession>>} */
  const sessions = {};
  const importedDefaults = {};

  function ensureSession(id) {
    if (!sessions[id]) {
      sessions[id] = createInstanceSession({ id, initFn });
    }
    return sessions[id];
  }

  function listInstances() {
    return Object.entries(registry).map(([id, entry]) => ({
      id,
      label: entry.label || id,
    }));
  }

  function sessionKey(id) {
    return `${storagePrefix}:${id}`;
  }

  function getCodeDefaults(id) {
    const base = deepClone(registry[id]?.defaults || {});
    if (importedDefaults[id]) {
      return deepMerge(base, deepClone(importedDefaults[id]));
    }
    return base;
  }

  function setActiveId(id) {
    if (!registry[id]) {
      throw new Error(`[text-tuner] unknown instance id "${id}"`);
    }
    activeId = id;
    ensureSession(id);
  }

  function getActiveId() {
    return activeId;
  }

  function getSession(id = activeId) {
    return {
      id,
      storageKey: sessionKey(id),
      codeDefaults: getCodeDefaults(id),
      typographyScope: `[data-playground="${id}"]`,
      triggerSelector:
        registry[id]?.defaults?.targets?.element ||
        `[data-playground-trigger="${id}"]`,
    };
  }

  function getRuntime(id = activeId) {
    return sessions[id]?.getRuntime() ?? null;
  }

  function applyLive(config, id = activeId) {
    sessions[id]?.applyLive(config);
  }

  function rebuildActive(config) {
    if (!activeId) throw new Error("[text-tuner] no active instance");
    return ensureSession(activeId).rebuild(config);
  }

  function rebuild(id, config) {
    return ensureSession(id).rebuild(config);
  }

  /**
   * @param {object} config
   * @param {{ typographyDirty?: boolean, splitTextDirty?: boolean, beforeRebuild?: (cfg: object) => Promise<void>, persist?: (cfg: object) => void }} [options]
   */
  async function commit(config, options = {}, id = activeId) {
    if (!id) throw new Error("[text-tuner] no active instance");
    if (options.persist) options.persist(config);
    const result = await ensureSession(id).commit(config, options);
    if (result.rebuilt && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh(true);
      ScrollTrigger.update();
    }
    return result;
  }

  function teardown(id) {
    sessions[id]?.teardown();
  }

  function clearSession(id) {
    try {
      sessionStorage.removeItem(sessionKey(id));
    } catch {
      /* ignore */
    }
  }

  function clearAllSessions() {
    Object.keys(registry).forEach((id) => clearSession(id));
  }

  function clearAllImports() {
    Object.keys(importedDefaults).forEach((id) => delete importedDefaults[id]);
  }

  function applyImport(id, config) {
    importedDefaults[id] = deepClone(config);
    clearSession(id);
  }

  function initAll() {
    Object.keys(sessions).forEach((id) => sessions[id].teardown());
    Object.keys(registry).forEach((id) => {
      ensureSession(id).rebuild(getCodeDefaults(id));
    });
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh(true);
    }
    return sessions;
  }

  /** @deprecated use sessions[id].getLive() — kept for attach.js liveInstances compat */
  const liveInstances = new Proxy(
    {},
    {
      get(_target, id) {
        if (typeof id !== "string") return undefined;
        return sessions[id]?.getLive() ?? null;
      },
    }
  );

  return {
    listInstances,
    setActiveId,
    getActiveId,
    getSession,
    getCodeDefaults,
    getRuntime,
    applyLive,
    commit,
    rebuild,
    rebuildActive,
    teardown,
    clearSession,
    clearAllSessions,
    clearAllImports,
    applyImport,
    initAll,
    liveInstances,
    getRegistry: () => registry,
    ensureSession,
  };
}
