import gsap from "https://esm.sh/gsap@3.13.0";
import { CustomEase } from "https://esm.sh/gsap@3.13.0/CustomEase";
gsap.registerPlugin(CustomEase);

export const EASEINQUAD = CustomEase.create("easeInQuad", "M0,0 C0.55,0.085,0.68,0.53,1,1");
export const EASEINCUBIC = CustomEase.create("easeInCubic", "M0,0 C0.55,0.055,0.675,0.19,1,1");
export const EASEINQUART = CustomEase.create("easeInQuart", "M0,0 C0.895,0.03,0.685,0.22,1,1");
export const EASEINQUINT = CustomEase.create("easeInQuint", "M0,0 C0.755,0.05,0.855,0.06,1,1");
export const EASEINEXPO = CustomEase.create("easeInExpo", "M0,0 C0.95,0.05,0.795,0.035,1,1");
export const EASEINCIRC = CustomEase.create("easeInCirc", "M0,0 C0.6,0.04,0.98,0.335,1,1");

export const EASEOUTQUAD = CustomEase.create("easeOutQuad", "M0,0 C0.25,0.46,0.45,0.94,1,1");
export const EASEOUTCUBIC = CustomEase.create("easeOutCubic", "M0,0 C0.215,0.61,0.355,1,1,1");
export const EASEOUTQUART = CustomEase.create("easeOutQuart", "M0,0 C0.165,0.84,0.44,1,1,1");
export const EASEOUTQUINT = CustomEase.create("easeOutQuint", "M0,0 C0.23,1,0.32,1,1,1");
export const EASEOUTEXPO = CustomEase.create("easeOutExpo", "M0,0 C0.19,1,0.22,1,1,1");
export const EASEOUTCIRC = CustomEase.create("easeOutCirc", "M0,0 C0.075,0.82,0.165,1,1,1");

export const EASEINOUTQUAD = CustomEase.create("easeInOutQuad", "M0,0 C0.455,0.03,0.515,0.955,1,1");
export const EASEINOUTCUBIC = CustomEase.create("easeInOutCubic", "M0,0 C0.645,0.045,0.355,1,1,1");
export const EASEINOUTQUART = CustomEase.create("easeInOutQuart", "M0,0 C0.77,0,0.175,1,1,1");
export const EASEINOUTQUINT = CustomEase.create("easeInOutQuint", "M0,0 C0.86,0,0.07,1,1,1");
export const EASEINOUTEXPO = CustomEase.create("easeInOutExpo", "M0,0 C1,0,0,1,1,1");
export const EASEINOUTCIRC = CustomEase.create("easeInOutCirc", "M0,0 C0.785,0.135,0.15,0.86,1,1");
