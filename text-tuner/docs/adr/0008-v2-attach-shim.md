# v2 `attach({ init, defaults })` compatibility shim

When `attach()` receives `init` + `defaults` without `registry`, it enters **legacy single-instance mode**:

```javascript
attach({
  init: (config) => ({ teardown, runtime }),  // v2 factory
  defaults: DEFAULT_CONFIG,
  storageKey: "playgroundV2",
  targets: ".split-target",
});
```

**Maps internally to:**

```javascript
const LEGACY_ID = "__v2__";
InstanceManager({
  registry: {
    [LEGACY_ID]: { label: "default", defaults, init },
  },
  activeId: LEGACY_ID,
  storageKey,           // session: uses storageKey as-is (no :id suffix) in legacy mode
  targets,
  legacyMode: true,
});
```

- Same panel, same tuning behavior as v2 tuner page.
- No `discover()` required; `data-playground` optional in legacy mode.
- Deprecate in docs; remove in v4. ESM import only — no global.

**Rejected:** Maintaining separate v2 panel code path; `window.SplitTextPlaygroundV2` global.
