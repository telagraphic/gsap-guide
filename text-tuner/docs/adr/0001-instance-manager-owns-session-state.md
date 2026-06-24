# InstanceManager owns per-instance session state

`attach.js` exposes an **InstanceManager** that owns all per-id config, runner handles (`teardown` / `runtime`), sessionStorage keys (`${storageKey}:${id}`), and lifecycle orchestration (commit, live update, switch, reset). The panel is a view: it reads and writes the form for the active instance and calls InstanceManager methods — it never calls `createSplitScrollRunner` directly.

**Rejected:** Panel-owned lifecycle (v2 monolith, does not scale to multi-instance) and hybrid attach/panel split (sample-playground shim with dual ownership of `_liveInstances` and panel `teardownFn`).

**Consequences:** `panel/lifecycle.js` from the refactor plan moves into InstanceManager (or `attach/session/`). v3 features (instance dropdown, follow viewport, reset all, import apply) are InstanceManager methods. v2 compat `attach({ init, defaults })` maps to a single-entry InstanceManager.
