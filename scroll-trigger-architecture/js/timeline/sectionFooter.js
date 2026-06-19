import gsap from "https://esm.sh/gsap@3.13.0";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { createRegistry } from "../shared/registry.js";
import { removePrehideClasses } from "../utils.js";
import { EASEINQUAD, EASEOUTQUAD, EASEOUTQUINT } from "../easings.js";

/* ─────────────────────────────────────────────────────────
 * FOOTER STORYBOARD
 *
 *     before   tag, title, hint at opacity 0 (page.css)
 *  on enter   title fades in, then hint + tag stagger
 *  on leave   timeline reverses, clearProps restores CSS hide
 *
 * ─────────────────────────────────────────────────────────
 *
 * PATTERN: staggered opacity timeline + ScrollTrigger play/reverse
 * PREHIDE: component CSS opacity — not anim-prehide (see REFACTOR.md Pattern C)
 *
 * ───────────────────────────────────────────────────────── */

export function createSectionFooter() {
  const registry = createRegistry();

  function createTweens() {
    const footer = document.querySelector(".page-footer");
    const footerTag = footer.querySelectorAll(".page-footer__tag");
    const footerHint = footer.querySelectorAll(".page-footer__hint");
    const footerTitle = footer.querySelector(".page-footer__title");
    const footerTargets = [...footerTag, ...footerHint, footerTitle];

    function resetFooter() {
      gsap.set(footerTargets, { clearProps: "opacity" });
    }

    const footerTimeline = gsap.timeline({
      paused: true,
      onComplete: () => removePrehideClasses(...footerTargets),
      onReverseComplete: resetFooter,
    });

    registry.addTimeline(footerTimeline);

    footerTimeline
      .to(footerTitle, {
        opacity: 1,
        duration: 0.5,
        ease: EASEOUTQUAD,
      })
      .to(
        footerHint,
        { opacity: 1, duration: 0.5, ease: EASEOUTQUAD },
        "+=0.25",
      )
      .to(footerTag, { opacity: 1, duration: 0.5, ease: EASEOUTQUAD }, "<");

    const scrollTrigger = ScrollTrigger.create({
      trigger: footer,
      start: "top center-=300",
      end: "bottom 20%",
      onEnter: () => footerTimeline.play(),
      onLeave: () => footerTimeline.reverse(),
      onEnterBack: () => footerTimeline.play(),
      onLeaveBack: () => footerTimeline.reverse(),
    });

    registry.addTrigger(scrollTrigger);
  }

  return {
    name: "section-footer",
    type: "gsap timeline",
    registry: registry,
    create() {
      createTweens();
    },
    destroy() {
      registry.destroy();
    },
  };
}
