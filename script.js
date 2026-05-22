gsap.registerPlugin(ScrollTrigger);

window.addEventListener("DOMContentLoaded", () => {
  /* LENIS SMOOTH SCROLL (OPTIONAL) */
  lenis = new Lenis({
    autoRaf: true,
  });
  /* LIENIS SMOOTH SCROLL (OPTIONAL) */

  gsap.to(".scroll", {
    autoAlpha: 0,
    duration: 0.2,
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "top top-=1",
      toggleActions: "play none reverse none",
    },
  });

  document.querySelectorAll(".mwg_effect015 .word").forEach((word) => {
    gsap.to(word.children, {
      yPercent: "+=100", // Increase the y position by 100%
      ease: "expo.inOut",
      scrollTrigger: {
        trigger: word, // Listens to the position of word
        start: "bottom bottom",
        end: "top 55%",
        scrub: 0.4, // Smooth scrubbing, takes 0.4 seconds to complete
      },
    });
  });
});
