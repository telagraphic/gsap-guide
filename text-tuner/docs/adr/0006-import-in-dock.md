# Import UI in dock as first segment

Import lives in the **dock** as the first segment: **Import · Config · Code · CSS**. Symmetric with export actions — paste/convert/apply is the inverse of Copy code.

**Interaction:** Import toggles a collapsible **`tt-panel__import`** drawer directly above the dock (not a 5th header tab, no ⌘5). Drawer contains monospace textarea, Convert, warnings list, and **Apply to {activeId}** (uses header instance dropdown).

Config / Code / CSS remain one-shot copy actions (flash button); they do not switch panel mode.

**Rejected:** 5th primary tab; collapsible strip without dock affordance; Import only in scrollable body.

Instance dropdown stays in **header above tabs** (global) — unchanged.

See [INTERFACE_RULES.md](../migration-refactor/INTERFACE_RULES.md) §10.
