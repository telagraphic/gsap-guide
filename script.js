gsap.registerPlugin(ScrollTrigger, CustomEase);

// Register once; reference by id string in any tween `ease` property.
CustomEase.create("relaxed", "M0,0 C0.7,0 0.3,1 1,1");

window.addEventListener("DOMContentLoaded", () => {
  /* LENIS SMOOTH SCROLL (OPTIONAL) */
  const lenis = new Lenis({
    autoRaf: true,
  });
  /* LENIS SMOOTH SCROLL (OPTIONAL) */

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

  const WORD_REVEAL = {
    yPercentEnd: 100,
    ease: "relaxed",
    scrub: 1.2,
    start: "bottom bottom",
    end: "top 55%",
  };

  const WORD_STAGGER = {
    startOffsetVh: 6,
  };

  const LAYER_FADE = {
    hidden: { opacityFrom: 0, opacityTo: 1 },
    visible: { opacityFrom: 1, opacityTo: 0 },
  };

  function createWordReveal(word, index) {
    const hidden = word.querySelector(".word-hidden");
    const visible = word.querySelector(".word-visible");
    if (!hidden || !visible) return;

    const scrollTrigger = {
      trigger: word,
      start: `bottom bottom-=${index * WORD_STAGGER.startOffsetVh}`,
      end: WORD_REVEAL.end,
      scrub: WORD_REVEAL.scrub,
    };

    gsap
      .timeline({ scrollTrigger })
      .fromTo(
        hidden,
        { yPercent: -100, opacity: LAYER_FADE.hidden.opacityFrom },
        {
          yPercent: 0,
          opacity: LAYER_FADE.hidden.opacityTo,
          ease: WORD_REVEAL.ease,
        },
        0,
      )
      .fromTo(
        visible,
        { yPercent: 0, opacity: LAYER_FADE.visible.opacityFrom },
        {
          yPercent: WORD_REVEAL.yPercentEnd,
          opacity: LAYER_FADE.visible.opacityTo,
          ease: WORD_REVEAL.ease,
        },
        0,
      );
  }

  const words = document.querySelectorAll(".mwg_effect015 .word");
  words.forEach(createWordReveal);

  document.fonts.ready.then(() => ScrollTrigger.refresh());
});
