import { ScrollTrigger } from "./shared/gsap.js";
import { createHeader } from "./timeline/sectionHeader.js";
import { createSectionOne } from "./timeline/sectionOne.js";
import { createSectionTwo } from "./timeline/sectionTwo.js";
import { createSectionThree } from "./timeline/sectionThree.js";
import { createSectionFour } from "./timeline/sectionFour.js";
import { createSectionFive } from "./timeline/sectionFive.js";
import { createSectionSix } from "./timeline/sectionSix.js";
import { createSectionSeven } from "./timeline/sectionSeven.js";
import { createSectionEight } from "./timeline/sectionEight.js";
import { createSectionFooter } from "./timeline/sectionFooter.js";

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
