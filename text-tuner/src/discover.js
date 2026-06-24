import { deepClone } from "./schema/config.js";
import { buildScaffoldConfig } from "./schema/defaults.js";
import { getDefined, getDefinedConfig } from "./define.js";

let _discoverOptions = {};
let _registry = null;

export function getRegistry() {
  return _registry;
}

export function discover(options = {}) {
  _discoverOptions = options;
  _registry = buildRegistry();
  validateDom(_registry);
  return _registry;
}

function buildRegistry() {
  const ids = [
    ...new Set(
      [...document.querySelectorAll("[data-playground]")].map((el) => el.dataset.playground)
    ),
  ];

  const globalOverrides = _discoverOptions.defaults || {};
  const registry = {};

  ids.forEach((id) => {
    const defined = getDefinedConfig(id);
    const defaults = defined || buildScaffoldConfig(id, globalOverrides);

    registry[id] = {
      label: getDefined()[id]?.label || id,
      defaults,
    };
  });

  return registry;
}

function validateDom(registry) {
  const domIds = new Set(
    [...document.querySelectorAll("[data-playground]")].map((el) => el.dataset.playground)
  );

  Object.keys(registry).forEach((id) => {
    if (!domIds.has(id)) {
      console.warn(`[text-tuner] registry id "${id}" has no [data-playground] node`);
    }
  });

  domIds.forEach((id) => {
    if (!registry[id]) {
      console.warn(`[text-tuner] orphan [data-playground="${id}"] — no registry entry`);
    }
    const el = document.querySelector(`[data-playground="${id}"]`);
    if (el?.querySelector?.(".line, .word, .char")) {
      console.warn(
        `[text-tuner] overlap: "${id}" may already be split — remove spaghetti for this target (Strategy A)`
      );
    }
  });
}

export function getActiveId(fallback, registry = _registry) {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("playground");
  if (fromUrl && registry?.[fromUrl]) return fromUrl;
  return fallback || Object.keys(registry || {})[0];
}
