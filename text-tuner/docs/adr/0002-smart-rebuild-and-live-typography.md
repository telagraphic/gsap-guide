# Smart rebuild on commit; live typography preview

**Commit (smart rebuild):** On `InstanceManager.commit()`, always merge form → `committedConfig` and persist to sessionStorage. Full runner teardown/reinit only when typography, SplitText, or target selectors changed since the last commit. Live-only changes (duration, ease, stagger, ScrollTrigger scrub, etc.) skip re-split — the runner already reflects them via `applyLive`.

**Live typography (v3 enhancement over v2):** While the panel is open, typography controls (font family, size, line-height, letter-spacing, align, transform) apply CSS custom properties to the active instance's `[data-playground]` element immediately (debounced). No SplitText re-split until commit. Tab shows a pending indicator until commit; commit triggers rebuild when typography changed.

**Why not v2's commit-only typography:** v2 only called `applyTypography()` inside `runFullRebuild` — sliders marked the tab pending but the canvas did not update until panel close. Live typography is cheap (CSS vars) and improves tuning UX.

**Caveat:** Live typography can desync line masks from actual line breaks when font metrics change (family, size, line-height). Acceptable for preview; commit re-splits to correct geometry. Font family uses debounced `document.fonts.load()`; optional brief syncing state on the Typography tab.

**SplitText DOM contract:** Vars on `[data-playground]` alone are insufficient — SplitText may bake inline `font-size` on `.word` / `.line` / `.char`. Runtime strips those on each `applyTypographyToScope`; consumer pages must style split descendants to inherit live typography. See [CANVAS_TYPOGRAPHY.md](../migration-refactor/CANVAS_TYPOGRAPHY.md).

**Rejected:** Always full rebuild on every commit (v2 parity — wasteful when only live fields changed).
