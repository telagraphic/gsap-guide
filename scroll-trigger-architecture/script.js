import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);



const scrollIn = (trigger) => ({
  trigger,
  start: "top 75%",
  toggleActions: "play none none reverse",
});

const panelAnimations = [
  { opacity: 0 },
  { x: -120 },
  { y: 80 },
  { scale: 0.6 },
  { rotation: -12 },
  { skewX: 10 },
];

gsap.utils.toArray(".panel").forEach((panel, index) => {
  const content = panel.querySelector(".panel__content");

  gsap.from(content, {
    ...panelAnimations[index],
    duration: 1,
    ease: "power2.out",
    scrollTrigger: scrollIn(panel),
  });
});



