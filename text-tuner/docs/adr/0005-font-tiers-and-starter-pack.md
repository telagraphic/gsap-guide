# Four-tier font model with starter preview pack

Text Tuner separates panel chrome fonts, a **root `fonts/` starter pack** (npm-shipped, copied to the consumer project), a full maintainer library in `examples/fonts-full/`, and user extensions in project-root `fonts/`. One folder convention for starter + consumer; `npx text-tuner fonts generate` updates `fonts.css` and `fonts.manifest.json`.

User guide: [ADDING_FONTS.md](../migration-refactor/ADDING_FONTS.md).
