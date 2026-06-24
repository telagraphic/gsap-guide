# tt- CSS prefix and BEM panel components

v3 panel uses **`tt-`** BEM classes and **`--tt-*`** design tokens on `#text-tuner-panel`. Shell integration: `body.text-tuner-active`, `body.text-tuner-panel-open`, `.text-tuner-canvas`. No `pg-` aliases — v2 remains frozen reference.

Preview typography vars keep **`--playground-*`** names scoped to `[data-playground="id"]` (Copy CSS round-trip). Panel chrome uses system UI font; demo `fonts.css` is optional.

Interface standard: [migration-refactor/INTERFACE_RULES.md](../migration-refactor/INTERFACE_RULES.md).

**Rejected:** `pg-` aliases for one major; renaming only shell IDs while keeping `pg-` components.
