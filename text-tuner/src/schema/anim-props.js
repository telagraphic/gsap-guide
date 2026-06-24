/** Panel prop grid + runner tween keys (PRD §6). */
export const ANIM_PROPS = [
  { key: "opacity", type: "range", min: 0, max: 1, step: 0.01, defaultFrom: 1, defaultTo: 1 },
  { key: "x", type: "range", min: -400, max: 400, step: 1, defaultFrom: 0, defaultTo: 0 },
  { key: "y", type: "range", min: -400, max: 400, step: 1, defaultFrom: 0, defaultTo: 0 },
  {
    key: "xPercent",
    type: "range",
    min: -100,
    max: 100,
    step: 1,
    defaultFrom: 0,
    defaultTo: 0,
  },
  {
    key: "yPercent",
    type: "range",
    min: -100,
    max: 100,
    step: 1,
    defaultFrom: 100,
    defaultTo: 0,
  },
  { key: "scale", type: "range", min: 0, max: 3, step: 0.01, defaultFrom: 1, defaultTo: 1 },
  {
    key: "rotation",
    type: "range",
    min: -180,
    max: 180,
    step: 1,
    defaultFrom: 0,
    defaultTo: 0,
  },
  {
    key: "rotationX",
    type: "range",
    min: -180,
    max: 180,
    step: 1,
    defaultFrom: 0,
    defaultTo: 0,
  },
  {
    key: "rotationY",
    type: "range",
    min: -180,
    max: 180,
    step: 1,
    defaultFrom: 0,
    defaultTo: 0,
  },
  { key: "filter", type: "text", defaultFrom: "", defaultTo: "" },
];

export const TWEEN_PROP_KEYS = ANIM_PROPS.map((prop) => prop.key);

export const EASE_OPTIONS = [
  "none",
  "power1.out",
  "power2.out",
  "power3.out",
  "power4.out",
  "back.out(1.2)",
  "elastic.out(1, 0.5)",
  "bounce.out",
  "circ.out",
  "expo.out",
];

export const STAGGER_FROM = ["start", "center", "end", "edges", "random"];

/** Typography tab align / transform segment values (icons live in panel templates). */
export const TEXT_ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
  { value: "justify", label: "Justify" },
];

export const TEXT_TRANSFORM_OPTIONS = [
  { value: "none", label: "Aa" },
  { value: "uppercase", label: "AA" },
  { value: "lowercase", label: "aa" },
  { value: "capitalize", label: "Ab" },
];
