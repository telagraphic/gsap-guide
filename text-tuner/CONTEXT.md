# Text Tuner

Dev-only control panel for tuning SplitText scroll animations. While tuning, a generic runner executes GSAP from in-memory config; production ships imperative Copy code blocks with no panel.

## Language

### Core concepts

**Text Tuner**:
The dev-only package (`text-tuner/`) that provides the control panel, runner, and export tools.
_Avoid_: Playground, playground-v2 (v2 is the frozen reference implementation)

**Instance**:
One tunable animation target on a page, identified by a `data-playground` id and its `SplitScrollConfig`.
_Avoid_: Element, target (use only for DOM selectors inside config)

**Registry**:
The map of instance ids to `{ label, defaults, init }` built by `discover()` and merged with `define()`.
_Avoid_: Playground registry, instance list

**SplitScrollConfig**:
The in-memory configuration object describing targets, SplitText options, tween props, stagger, ScrollTrigger, and typography for one instance.
_Avoid_: Config object, settings, state

**Runner**:
The generic function that applies a `SplitScrollConfig` via SplitText, gsap, and ScrollTrigger. Returns `{ teardown, runtime }`.
_Avoid_: Animation factory, setupAnimation (v2 name)

**Copy code**:
The imperative `SplitText.create` + `onSplit` block exported for production. No panel, no runner.
_Avoid_: Spaghetti (informal), export code

**Canonical block**:
The exact string shape Copy code produces and Import `convert()` accepts. Defined once in `src/canonical/`.
_Avoid_: Export format, spaghetti template

**Import drawer**:
Collapsible panel above the dock, toggled by the dock **Import** segment. Paste → Convert → Apply to the active instance.
_Avoid_: Import tab

### Session & lifecycle

**Panel chrome fonts**:
Fixed Geist + Geist Mono bundled for `#text-tuner-panel` UI only. Not the typography preview library.
_Avoid_: UI fonts, instrument fonts

**Preview fonts**:
Extensible font library for the Typography tab and animated text preview. Each family maps to a `--font-{slug}` custom property.
_Avoid_: Test fonts, animation fonts

**Starter preview pack**:
Small curated set of preview fonts shipped in the npm package at `fonts/` (package root). Users copy to their project root `fonts/` and extend.
_Avoid_: Default fonts, bundled fonts

**Font manifest**:
Generated JSON list of preview families (`label`, `cssVar`, `slug`) consumed by the typography dropdown and `attach({ fonts })`.
_Avoid_: FONTS array, font list

**InstanceManager**:
The module in `attach.js` that owns all instances on a page: per-id sessions, active selection, commit, live update, storage, and runner lifecycle.
_Avoid_: Attach controller, registry manager

**InstanceSession**:
One instance's state inside the InstanceManager: code defaults, committed config, runner handles, and storage key.
_Avoid_: Instance state, session object

**Active instance**:
The instance currently selected in the panel. Only the active instance's form is shown and edited.
_Avoid_: Current target, selected element

**Commit**:
Merge panel form into the active instance's config, persist to sessionStorage, teardown and reinit the runner when required, then refresh ScrollTrigger.
_Avoid_: Save, apply (reserved for Import Apply)

**Live update**:
Apply tween or ScrollTrigger field changes to the running animation without re-splitting. No sessionStorage write until commit.
_Avoid_: Preview, hot reload

**Live typography**:
Apply typography CSS custom properties to the active instance element while the panel is open, without re-splitting. Commit still re-splits when typography changed.
_Avoid_: Live font, instant typography

**Rebuild**:
Full teardown and reinit of an instance's runner. Required for SplitText and typography changes.
_Avoid_: Refresh, reinit (use only in implementation comments)

### Onboarding tiers

**Tier 0 (discover)**:
Cold start from HTML `data-playground` only; scaffold defaults fill missing config.
_Avoid_: Auto-discover

**Tier 1 (define)**:
Git-friendly starting config registered via `define({ id: config })`.
_Avoid_: Pre-configured, preset

**Tier 2**:
Custom per-instance `init` factory for timelines and non-generic logic. Deferred post-v3.
_Avoid_: Custom runner, advanced hook

### DOM contract

**Playground marker**:
The `data-playground="id"` attribute on the SplitText text target element.
_Avoid_: data attribute, playground id

**Trigger marker**:
The optional `data-playground-trigger="id"` attribute on the ScrollTrigger container section.
_Avoid_: trigger attribute, ST trigger
