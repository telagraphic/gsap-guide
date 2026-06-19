import gsap, { SplitText } from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";

/**
 * Text Roll
 *
 * Slot-machine char roll — visible span exits down, hidden span enters from above.
 * Chars only; word/line units are out of scope.
 *
 * roll.stagger             delay between chars (default 0.05)
 * roll.duration            tween duration per char (default 1)
 * roll.ease                required — pass from caller
 * roll.shuffle             random char order when true (default false)
 *
 * target                   single element
 * targets                  NodeList — one roll per element, keyed roll-0, roll-1, …
 * scrollTrigger            merged per element; trigger defaults to each target
 *
 * Nested SplitText + timeline rebuild on resize — see docs/REFACTOR.md
 */

const SPLIT_TEXT_DEFAULTS = {
  type: "chars",
  charsClass: "anim-char-parent",
  tag: "span",
  autoSplit: true,
};

export function createTextRoll({
  target,
  targets,
  splitText = {},
  roll = {},
  scrollTrigger,
  onSplit,
}) {
  const registry = createRegistry();

  function createDualSpans(chars) {
    chars.forEach((charEl) => {
      const text = charEl.textContent;
      charEl.textContent = "";
      charEl.innerHTML = `<span class="anim-char-visible">${text}</span><span class="anim-char-hidden">${text}</span>`;
    });
  }

  function setRollStyles(chars) {
    chars.forEach((charEl) => {
      gsap.set(charEl.querySelector(".anim-char-visible"), { yPercent: 0 });
      gsap.set(charEl.querySelector(".anim-char-hidden"), { yPercent: -100 });
    });
  }

  function appendRolls(timeline, chars, options = {}) {
    const { stagger = 0.05, ease, duration = 1, shuffle = false } = options;
    const ordered = shuffle ? gsap.utils.shuffle([...chars]) : [...chars];

    ordered.forEach((charEl, index) => {
      const visible = charEl.querySelector(".anim-char-visible");
      const hidden = charEl.querySelector(".anim-char-hidden");

      timeline.fromTo(
        visible,
        { yPercent: 0 },
        { yPercent: 100, ease, duration },
        index * stagger,
      );
      timeline.fromTo(
        hidden,
        { yPercent: -100 },
        { yPercent: 0, ease, duration },
        index * stagger,
      );
    });
  }

  function createRolls(element, key) {
    let timeline = null;

    const split = SplitText.create(element, {
      ...SPLIT_TEXT_DEFAULTS,
      ...splitText,
      onSplit(self) {
        if (timeline) {
          registry.killTween(timeline);
          timeline = null;
        }

        onSplit?.(self, element);

        createDualSpans(self.chars);
        setRollStyles(self.chars);

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            ...scrollTrigger,
          },
        });

        appendRolls(timeline, self.chars, roll);
        registry.addTimeline(key, timeline);

        return timeline;
      },
    });

    registry.addSplit(key, split);
  }

  return {
    id: "text-roll",
    type: "effect",
    registry,
    create() {
      if (targets) {
        targets.forEach((element, index) =>
          createRolls(element, `roll-${index}`),
        );
        return;
      }
      createRolls(target, "roll");
    },
    destroy() {
      registry.destroy();
    },
    revert() {
      registry.resetSplits();
    },
  };
}
