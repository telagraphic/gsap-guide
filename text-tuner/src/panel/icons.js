/** Panel icons for typography alignment controls. */

export const ICON_RESET = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;

const ICON_ALIGN_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
const ICON_ALIGN_CENTER = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="4" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="4" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
const ICON_ALIGN_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="6" y="6" width="8" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="6" y="13" width="8" height="1.25" rx="0.25"/></svg>`;
const ICON_ALIGN_JUSTIFY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="6" width="12" height="1.25" rx="0.25"/><rect x="2" y="9.5" width="12" height="1.25" rx="0.25"/><rect x="2" y="13" width="12" height="1.25" rx="0.25"/></svg>`;

export const TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Left", icon: ICON_ALIGN_LEFT },
  { value: "center", label: "Center", icon: ICON_ALIGN_CENTER },
  { value: "right", label: "Right", icon: ICON_ALIGN_RIGHT },
  { value: "justify", label: "Justify", icon: ICON_ALIGN_JUSTIFY },
];
