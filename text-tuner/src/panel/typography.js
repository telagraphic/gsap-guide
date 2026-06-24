/**
 * Apply typography CSS custom properties to a scope selector or element.
 * @param {string | Element | null | undefined} scopeOrEl
 * @param {object | null | undefined} typography
 */
export function applyTypographyToScope(scopeOrEl, typography) {
  if (!typography) return;
  const root =
    typeof scopeOrEl === "string"
      ? document.querySelector(scopeOrEl)
      : scopeOrEl;
  if (!root) return;

  root.style.setProperty("--font-sans-serif", `var(${typography.fontVar})`);
  root.style.setProperty("--playground-font-size", `${typography.fontSize}rem`);
  root.style.setProperty("--playground-line-height", String(typography.lineHeight));
  root.style.setProperty(
    "--playground-letter-spacing",
    `${typography.letterSpacing}em`
  );
  root.style.setProperty("--playground-text-align", typography.textAlign);
  root.style.setProperty("--playground-text-transform", typography.textTransform);

  // SplitText can pin font-size inline on split nodes (words, lines, chars)
  root.querySelectorAll(".word, .line, .char").forEach((node) => {
    node.style.removeProperty("font-size");
  });
}

export function createTypographyHelpers({ getScope, getTargetsSelector }) {
  function typographyRoot() {
    const scope = getScope();
    if (scope) {
      const scoped = document.querySelector(scope);
      if (scoped) return scoped;
    }
    return document.documentElement;
  }

  function applyTypography(typography) {
    applyTypographyToScope(typographyRoot(), typography);
  }

  function exportTypographyCss(typography) {
    const selector = getScope() || ":root";
    return `${selector} {
  --font-sans-serif: var(${typography.fontVar});
  --playground-font-size: ${typography.fontSize}rem;
  --playground-line-height: ${typography.lineHeight};
  --playground-letter-spacing: ${typography.letterSpacing}em;
  --playground-text-align: ${typography.textAlign};
  --playground-text-transform: ${typography.textTransform};
}`;
  }

  async function loadTypographyFonts() {
    await new Promise((r) => requestAnimationFrame(r));
    const sample = typographyRoot() ?? document.querySelector(getTargetsSelector());
    if (!sample || sample === document.documentElement) {
      await document.fonts.ready;
      return;
    }
    const style = getComputedStyle(sample);
    const fontSpec = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    try {
      await document.fonts.load(fontSpec);
    } catch {
      /* fall through */
    }
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  async function waitForFonts(typography) {
    applyTypography(typography);
    await loadTypographyFonts();
  }

  return {
    applyTypography,
    exportTypographyCss,
    loadTypographyFonts,
    waitForFonts,
  };
}
