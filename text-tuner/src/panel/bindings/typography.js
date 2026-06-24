import { bindSegmentGroup } from "../components/segment-group.js";

export function bindTypographyControls(ctx) {
  const { el, requestTypographyUpdate } = ctx;
  const inputs = [el.fontSelect, el.fontSize, el.lineHeight, el.letterSpacing];
  inputs.forEach((input) => {
    const evt = input.type === "range" ? "input" : "change";
    input.addEventListener(evt, () => requestTypographyUpdate());
  });
  bindSegmentGroup(el.textAlign, requestTypographyUpdate);
  bindSegmentGroup(el.textTransform, requestTypographyUpdate);
}
