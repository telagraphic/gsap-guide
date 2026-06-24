# TypeScript declarations without TS source (v3.0)

v3.0 ships **JavaScript source** with published **`.d.ts`** declarations for the public API (`SplitScrollConfig`, `AttachOptions`, `RegistryEntry`, `ConvertResult`, `FontManifest`).

Types authored via **JSDoc `@typedef`** in `src/` and emitted with `tsc --emitDeclarationOnly` or hand-maintained `dist/index.d.ts`.

Full `.ts` source migration deferred post-v3.0.

**Rejected:** v3.0 full TypeScript rewrite (scope); shipping npm package with no types.
