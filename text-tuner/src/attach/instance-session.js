import { deepClone, needsRebuild } from "../schema/config.js";

/**
 * Normalize runner init return shape.
 * @param {unknown} result
 */
export function resolveInitResult(result) {
  if (typeof result === "function") {
    return { teardown: result, runtime: null };
  }
  return {
    teardown: result?.teardown,
    runtime: result?.runtime ?? null,
  };
}

/**
 * @typedef {Object} InstanceLive
 * @property {(() => void) | undefined} teardown
 * @property {{ applyLive?: (config: object) => void } | null} runtime
 */

/**
 * Per-id runner handle + committed config snapshot.
 */
export function createInstanceSession({ id, initFn }) {
  /** @type {InstanceLive | null} */
  let live = null;
  /** @type {object | null} */
  let committedConfig = null;

  function getRuntime() {
    return live?.runtime ?? null;
  }

  function teardown() {
    live?.teardown?.();
    live = null;
  }

  function rebuild(config) {
    teardown();
    live = resolveInitResult(initFn(deepClone(config)));
    committedConfig = deepClone(config);
    return live;
  }

  function applyLive(config) {
    live?.runtime?.applyLive?.(config);
  }

  /**
   * @param {object} config
   * @param {{ typographyDirty?: boolean, splitTextDirty?: boolean, beforeRebuild?: (cfg: object) => Promise<void> }} [options]
   */
  async function commit(config, options = {}) {
    const { typographyDirty = false, splitTextDirty = false, beforeRebuild } = options;
    const shouldRebuild =
      typographyDirty ||
      splitTextDirty ||
      needsRebuild(committedConfig, config);

    if (shouldRebuild) {
      if (beforeRebuild) await beforeRebuild(config);
      rebuild(config);
    } else {
      committedConfig = deepClone(config);
    }

    return { rebuilt: shouldRebuild, config: committedConfig };
  }

  function setCommitted(config) {
    committedConfig = deepClone(config);
  }

  function getCommitted() {
    return committedConfig;
  }

  return {
    id,
    getRuntime,
    teardown,
    rebuild,
    applyLive,
    commit,
    setCommitted,
    getCommitted,
    getLive: () => live,
  };
}
