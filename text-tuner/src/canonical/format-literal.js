/** Format plain objects as indented JS object literals (export helpers). */

export function formatObjectLiteral(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  const entries = Object.entries(obj).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "{}";
  const lines = entries.map(([k, v]) => {
    if (typeof v === "string") return `${pad}  ${k}: ${JSON.stringify(v)}`;
    if (typeof v === "object" && !Array.isArray(v)) {
      return `${pad}  ${k}: ${formatObjectLiteral(v, indent + 1)}`;
    }
    return `${pad}  ${k}: ${JSON.stringify(v)}`;
  });
  return `{\n${lines.join(",\n")}\n${pad}}`;
}
