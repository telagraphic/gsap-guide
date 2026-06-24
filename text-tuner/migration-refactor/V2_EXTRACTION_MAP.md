# v2 → v3 extraction map

> **Purpose:** Implementation inventory — every v2 function and CSS block mapped to its v3 module before coding starts.  
> **Sources:** `playground-v2.js` (~1910 lines), `playground-v2.css` (~1078 lines), `tuner/animation.js`, `sample-playground/script.js` §4.

---

## 1. `playground-v2.js` — function → module

### 1.1 `schema/` (Phase 1 — pure, no DOM/GSAP)

| v2 function | Lines (approx) | v3 module |
|-------------|----------------|-----------|
| `deepClone` | 164 | `schema/config.js` |
| `deepMerge` | 168 | `schema/config.js` |
| `normalizeStaggerConfig` | 827 | `schema/config.js` |
| `parseStaggerGrid` | 784 | `schema/config.js` |
| `formatStaggerGridForInput` | 809 | `schema/config.js` |
| `typeIncludes` | 899 | `schema/config.js` |
| `formatLetterSpacing` | 203 | `schema/config.js` |
| `parseScrollOffsetPart` | 209 | `schema/scroll-position.js` |
| `parseScrollPosition` | 226 | `schema/scroll-position.js` |
| `formatScrollPositionPart` | 251 | `schema/scroll-position.js` |
| `formatScrollPosition` | 261 | `schema/scroll-position.js` |
| `DEFAULT_CONFIG` + constants | (from animation.js) | `schema/defaults.js` |
| `buildScaffoldConfig` | (sample script 209) | `schema/defaults.js` |
| `ANIM_PROPS`, `EASE_OPTIONS`, `STAGGER_FROM`, `FONTS` | top of JS | `schema/anim-props.js` |
| `SCHEMA_VERSION` | new | `schema/version.js` |

### 1.2 `runner/` (Phase 2)

| v2 function | Source file | v3 module |
|-------------|-------------|-----------|
| `createSplitScrollAnimation` / `setupAnimation` | animation.js 154 | `runner/create-split-scroll-runner.js` |
| `getAnimateTargets`, `animateTargetAvailable` | animation.js | same |
| `buildStagger` | animation.js | same (or import from `canonical/` if shared) |
| `pickTweenProps` | animation.js | same |
| `buildScrollTriggerVars` | animation.js | same |
| `applyLive` | animation.js 205 | `runtime.applyLive` export |
| `teardown` | animation.js 217 | return value |
| Duplicate `deepClone` / `deepMerge` / `typeIncludes` | animation.js | **Delete** — import from `schema/` |

### 1.3 `canonical/` (Phase 3d / 6)

| v2 function | Lines | v3 module |
|-------------|-------|-----------|
| `buildStaggerLiteral` | 1531 | `canonical/build-canonical-block.js` |
| `exportCopyCode` | 1544 | `canonical/build-canonical-block.js` |
| `formatObjectLiteral` | 1517 | `canonical/format-literal.js` |
| `serializeConfig` | 1513 | `panel/export.js` (thin — config JSON only) |

### 1.4 `panel/components/` (Phase 3a)

| v2 function | Lines | v3 module |
|-------------|-------|-----------|
| `buildTrackSliderHTML` | 521 | `panel/components/track-slider.js` |
| `formatTrackSliderValue` | 571 | same |
| `syncTrackSlider` | 590 | same |
| `syncAllTrackSliders` | 603 | same |
| `initTrackSliders` | 608 | same |
| `buildSegmentBarHTML` | 451 | `panel/components/segment-group.js` |
| `buildSegmentRowHTML` | 460 | same |
| `getSegmentGroupValue` | 486 | same |
| `setSegmentGroupValue` | 493 | same |
| `bindSegmentGroup` | 510 | same |
| `buildSelectRowHTML` | 443 | `panel/components/select-row.js` |
| `buildDropdownFieldHTML` | 434 | same |
| `buildScrollEdgeOptions` | 366 | `panel/components/scroll-position-field.js` |
| `buildScrollOffsetUnitButtons` | 372 | same |
| `buildScrollOffsetColumnHTML` | 379 | same |
| `buildScrollPositionFieldHTML` | 400 | same |
| `getScrollOffsetUnit` | 268 | same |
| `setScrollOffsetUnit` | 274 | same |
| `applyScrollOffsetSliderLimits` | 282 | same |
| `setScrollPositionSideMode` | 296 | same |
| `syncScrollPositionSideModes` | 308 | same |
| `resetScrollOffsetSide` | 315 | same |
| `readScrollPositionFromUI` | 326 | same |
| `fillScrollPositionToUI` | 343 | same |
| `buildStaggerBlockHTML` | 1082 | `panel/templates/tab-properties.js` (or `components/stagger-block.js`) |
| `buildPropGridHTML` | 1154 | `panel/templates/tab-properties.js` |

### 1.5 `panel/templates/` (Phase 3b)

| v2 function | Lines | v3 module |
|-------------|-------|-----------|
| `injectPanel` | 1216–1436 | Split into: |
| — shell (header, body, dock, footer) | | `panel/templates/shell.js` |
| — Typography tab HTML | | `panel/templates/tab-typography.js` |
| — Properties tab HTML | | `panel/templates/tab-properties.js` |
| — SplitText tab HTML | | `panel/templates/tab-split-text.js` |
| — ScrollTrigger tab HTML | | `panel/templates/tab-scroll-trigger.js` |
| Import drawer HTML | new (v3) | `panel/templates/import-drawer.js` |

### 1.6 `panel/` core (Phase 3c)

| v2 function | Lines | v3 module |
|-------------|-------|-----------|
| `cacheElements` | 1438 | `panel/dom.js` |
| `readConfigFromForm` | 719 | `panel/form-state.js` |
| `fillFormFromConfig` | 849 | `panel/form-state.js` |
| `readScrubFromUI` / `setScrubUI` | 689, 702 | `panel/form-state.js` |
| `getTypeArray` / `setTypeToggles` | 647, 655 | `panel/form-state.js` |
| `getMaskValue` / `setMaskToggle` | 675, 682 | `panel/form-state.js` |
| `getStaggerAxis` / `setStaggerAxis` | 814, 820 | `panel/form-state.js` |
| `updateAnimateTargetOptions` | 906 | `panel/form-state.js` |
| `applyTypography` | 618 | `panel/typography.js` |
| `exportTypographyCss` | 631 | `panel/typography.js` |
| `waitForFonts` | 937 | `panel/typography.js` |
| `setPendingUI` | 642 | `panel/panel-controller.js` |
| `markTypographyDirty` / `markSplitTextDirty` | 1045, 1050 | `panel/panel-controller.js` |
| `selectTab` / `selectSubTab` | 1056, 1065 | `panel/panel-controller.js` |
| `setStaggerTiming` | 1075 | `panel/panel-controller.js` |
| `setPanelSyncing` / `setPanelOpen` / `isPanelOpen` | 918–935 | `panel/panel-controller.js` |
| `resetAnimProp` | 1138 | `panel/form-state.js` or `bindings/properties.js` |

### 1.7 `attach/` — InstanceManager (Phase 3e)

| v2 function | Lines | v3 module | Notes |
|-------------|-------|-----------|-------|
| `loadStoredConfig` / `saveStoredConfig` | 185, 195 | `attach/instance-session.js` | Per-id key in v3 |
| `runFullRebuild` | 966 | `attach/instance-manager.js` | Smart rebuild gate |
| `commitAndRebuild` | 1024 | `attach/instance-manager.js` | → `commit()` |
| `requestLiveUpdate` | 1034 | `attach/instance-manager.js` | → `applyLive()` |
| `resolveInitResult` | 956 | `attach/instance-manager.js` | |
| Module-level `teardownFn`, `runtime`, `rebuild*` | scattered | `attach/instance-session.js` | One session per id |

### 1.8 `discover.js` / `define.js` (Phase 3e — from sample script)

| v2 (sample script) | Lines | v3 module |
|--------------------|-------|-----------|
| `define(entries)` | 309 | `define.js` |
| `discover(options)` | 315 | `discover.js` |
| `buildRegistry()` | 322 | `discover.js` |
| `validateDom(registry)` | 347 | `discover.js` |
| `initAll(registry)` | 372 | `attach/instance-manager.js` |
| `getActiveId(fallback)` | 386 | `attach.js` (until dropdown; URL interim) |

### 1.9 `panel/bindings/` (Phase 3d)

| v2 `bind*` function | Lines | v3 module | Delegates to |
|---------------------|-------|-----------|--------------|
| `bindLiveControls` | 1597 | `panel/bindings/live.js` | `manager.applyLive()` |
| `bindTypographyControls` | 1629 | `panel/bindings/typography.js` | `manager.applyTypography()` + dirty |
| `bindPropResets` | 1639 | `panel/bindings/properties.js` | `resetAnimProp` + live |
| `bindSplitTextControls` | 1647 | `panel/bindings/split-text.js` | mark dirty |
| `bindStaggerAxis` | 1679 | `panel/bindings/properties.js` | live |
| `bindStaggerTimingActivation` | 1692 | `panel/bindings/properties.js` | UI state only |
| `bindScrubMode` | 1707 | `panel/bindings/scroll-trigger.js` | live |
| `bindScrollOffsetControls` | 1722 | `panel/bindings/scroll-trigger.js` | live |
| `bindScrollPositionControls` | 1751 | `panel/bindings/scroll-trigger.js` | live |
| `bindSubTabs` | 1774 | `panel/bindings/properties.js` | UI only |
| `bindTabsAndHeader` | 1780 | `panel/bindings/shell.js` | tab switch, dock copy actions |
| `bindKeyboard` | 1818 | `panel/keyboard.js` | open/close, tab shortcuts |
| `bindSegmentGroup` | 510 | `panel/components/segment-group.js` | used by typography + others |

**Dock copy actions** (inside `bindTabsAndHeader` or separate): `panel/bindings/dock.js` — Config / Code / CSS one-shot copy; Import toggle (v3).

### 1.10 Entry points

| v2 | v3 |
|----|-----|
| `attach(options)` in panel JS | `attach.js` — wires InstanceManager + panel |
| `window.SplitTextPlaygroundV2` IIFE | `index.js` ESM exports |
| Sample `PlaygroundAPI.attach` shim | Removed — consumer imports package |

---

## 2. `playground-v2.css` — section → stylesheet

| v2 lines | v2 selectors / topic | v3 file | v3 rename |
|----------|------------------------|---------|-----------|
| 1–16 | `body.playground-v2-active`, `.playground-v2-canvas` | `layout.css` | `text-tuner-active`, `text-tuner-canvas` |
| 17–85 | `#playground-v2-panel` tokens + shell base | `tokens.css` + `layout.css` | `#text-tuner-panel`, `--tt-*` |
| 87–105 | panel open opacity, `--syncing` | `layout.css` | `tt-panel--syncing` |
| 92–96 | `.pg-segment__text` mixed case | `components/segment.css` | `tt-segment__text` |
| 107–118 | `.pg-panel__header`, `__header-actions` | `layout.css` | `tt-panel__header` |
| 120–124 | `.pg-field-block` rhythm | `components/field.css` | `tt-field-block` |
| 125–223 | `.pg-segment-bar`, segments, tabs, dock modifiers | `components/segment.css` | `tt-segment-*`; `--pg-chrome-pad` → `--tt-segment-pad` |
| 235–278 | `.pg-panel__body`, `.pg-tab-panel`, `.pg-field`, `.pg-fieldset` | `layout.css` + `components/field.css` | |
| 279–337 | `.pg-field__label`, `.pg-input`, `.pg-select` | `components/input.css` | |
| 338–393 | `.pg-control-bar` | `components/control-bar.css` | |
| 394–431 | `.pg-select-row` | `components/select-row.css` | |
| 432–557 | `.pg-segment-row`, `.pg-dropdown-field` | `components/segment.css` + `components/input.css` | |
| 558–623 | dropdown focus, `.pg-control-stack`, `.pg-sr-only`, `.pg-input--compact` | `components/input.css` + `base.css` | `tt-sr-only` in base |
| 629–734 | `.pg-track-slider` | `components/track-slider.css` | |
| 753–759 | `.pg-segment-bar--subtabs`, `.pg-subtab-panel` | `components/segment.css` | `tt-subtab-panel` |
| 761–794 | `.pg-stagger-block`, `.pg-stagger-timing-row` | `tabs/properties.css` | |
| 801–907 | `.pg-prop-list`, `.pg-prop-row`, `.pg-prop-reset` | `components/prop-grid.css` | |
| 909–938 | `.pg-section-title`, `.pg-field--scrub` | `base.css` + `tabs/scroll-trigger.css` | `tt-section-title` |
| 940–1027 | `.pg-scroll-section`, `.pg-st-position` | `tabs/scroll-trigger.css` | |
| 1028–1042 | `.pg-panel__dock` | `layout.css` | `tt-panel__dock`, `tt-segment-bar--dock` |
| 1044–1063 | `.pg-footer` | `layout.css` | `tt-footer` |
| 1065–1078 | `.pg-checkbox` | `components/input.css` | `tt-checkbox` |

### CSS fixes during migration

| Issue | v2 line | v3 fix |
|-------|---------|--------|
| Undefined `--pg-label-size-sm` | ~911 | Use `--tt-font-size-sm` or `--tt-label-size` |
| `--pg-accent-hover`, `--pg-accent-soft` | tokens | Drop if unused; grep before port |
| `--font-monospace` on panel | token 54 | `--tt-font-mono` |

### v3-only CSS (not in v2)

| Block | File |
|-------|------|
| `tt-panel__import`, `tt-import` drawer | `components/import.css` |
| `tt-panel__instance` dropdown | `layout.css` |
| Follow viewport toggle | `layout.css` |

---

## 3. Target `src/` tree (reference)

```text
text-tuner/src/
├── index.js
├── discover.js
├── define.js
├── attach.js
├── attach/
│   ├── instance-manager.js
│   └── instance-session.js
├── schema/
│   ├── config.js
│   ├── defaults.js
│   ├── anim-props.js
│   ├── scroll-position.js
│   └── version.js
├── runner/
│   └── create-split-scroll-runner.js
├── canonical/
│   ├── build-canonical-block.js
│   └── parse-canonical-block.js
├── convert/
│   └── index.js
└── panel/
    ├── panel-controller.js
    ├── dom.js
    ├── form-state.js
    ├── typography.js
    ├── export.js
    ├── keyboard.js
    ├── components/
    ├── templates/
    └── bindings/
```

---

## 4. Module-level state to eliminate

v2 module `let` bindings (all move into `InstanceSession` or `createPanelController` closure):

| v2 binding | v3 owner |
|------------|----------|
| `panel`, `el`, `panelOpen` | `panel-controller.js` |
| `attachConfig`, `teardownFn`, `runtime` | `instance-session.js` |
| `committedConfig`, `workingConfig` | `instance-session.js` |
| `typographyDirty`, `splitTextDirty` | `instance-session.js` |
| `rebuildPending`, `rebuildQueued`, `rebuildGeneration` | `instance-manager.js` |
| `liveDebounce` | `instance-manager.js` |
| `storageKey`, `targetsSelector` | `attach.js` options |

---

## 5. Open implementation notes (not blockers)

| Topic | Decision | Where documented |
|-------|----------|------------------|
| `?playground=id` URL override | Keep in demo until instance dropdown ships | PRD §10.2 interim; sample script `getActiveId` |
| `buildStagger` location | Runner imports; canonical may share literal builder | ADR-0003 |
| Properties stagger HTML | `tab-properties.js` vs `components/stagger-block.js` | Either OK if <400 lines |
| AT-033 live typography | Acceptance test may need WHEN step for live preview before commit | `ACCEPTANCE_TESTS.md` |
