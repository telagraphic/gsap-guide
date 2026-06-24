/**
 * @param {Record<string, unknown>} scrollTrigger
 * @param {{ element?: string } | null | undefined} targets
 * @returns {Record<string, unknown>}
 */
export function buildScrollTriggerVars(scrollTrigger, targets) {
  const st = { ...scrollTrigger };
  st.trigger = st.trigger || targets?.element;
  if (st.scrub === false || st.scrub === "false" || st.scrubMode === "off") {
    delete st.scrub;
    delete st.scrubMode;
  } else if (st.scrubMode === "smooth" && typeof st.scrub !== "number") {
    st.scrub = Number(st.scrubSmooth) || 1;
  }
  delete st.scrubMode;
  delete st.scrubSmooth;
  return st;
}
