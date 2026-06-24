import { bindTypographyControls } from "./typography.js";
import { bindPropertiesControls } from "./properties.js";
import { bindScrollControls } from "./scroll.js";
import { bindHeaderControls } from "./header.js";
import { bindInstanceControls } from "./instance.js";

export function bindPanelControls(ctx) {
  bindTypographyControls(ctx);
  bindPropertiesControls(ctx);
  bindScrollControls(ctx);
  bindHeaderControls(ctx);
  bindInstanceControls(ctx);
}
