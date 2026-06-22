import { ScrollTrigger } from "./shared/gsap.js";
import { createHeader } from "./timeline/section-header.js";
import { createSectionOne } from "./timeline/section-1.js";
import { createSectionTwo } from "./timeline/section-2.js";
import { createSectionThree } from "./timeline/section-3.js";
import { createSectionFour } from "./timeline/section-4.js";
import { createSectionFive } from "./timeline/section-5.js";
import { createSectionSix } from "./timeline/section-6.js";
import { createSectionSeven } from "./timeline/section-7.js";
import { createSectionEight } from "./timeline/section-8.js";
import { createSectionFooter } from "./timeline/section-footer.js";

const modules = [];

export function destroyAllModules() {
  modules.forEach((module) => module.destroy());
  modules.length = 0;
}

export function initAnimations() {
  modules.push(
    createHeader(),
    createSectionOne(),
    createSectionTwo(),
    createSectionThree(),
    createSectionFour(),
    createSectionFive(),
    createSectionSix(),
    createSectionSeven(),
    createSectionEight(),
    createSectionFooter(),
  );

  modules.forEach((module) => module.create());
  ScrollTrigger.refresh();
}

document.fonts.ready.then(() => {
  initAnimations();
});
