# Canonical Copy code template in shared module

Copy code export and `convert()` import share one module (`src/canonical/`): `buildCanonicalBlock(config, { id })` for export and `parseCanonicalBlock(source, { id })` for import. `panel/export.js` and `convert/index.js` are thin wrappers. `buildStaggerLiteral` and related helpers live here, not duplicated in panel or convert.

Breaking the canonical block shape is a **major version** bump. Round-trip tests: export → parse → config deep-equal (within mapped fields).

**Rejected:** Template owned by panel/export (couples parser to UI) or owned by convert only (export depends on import module).
