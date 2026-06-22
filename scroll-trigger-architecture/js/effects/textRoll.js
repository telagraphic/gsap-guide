import gsap, { SplitText } from "../shared/gsap.js";
import { createRegistry } from "../shared/registry.js";
import { CHAR_CELL_PRESETS } from "./motionPresets.js";

/**
 * Text Roll
 *
 * Slot-machine char roll — dual spans inside overflow-hidden char cells.
 * Chars only; word/line units are out of scope.
 *
 * preset                   CHAR_CELL_PRESETS key — overrides roll.preset when set
 * roll.preset              CHAR_CELL_PRESETS key (default "roll-down")
 * roll.visible.from / .to  merged on top of preset visible layer
 * roll.hidden.from / .to   merged on top of preset hidden layer
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

/** @deprecated Use CHAR_CELL_PRESETS from motionPresets.js */
export const ROLL_PRESETS = CHAR_CELL_PRESETS;

const TEXT_ROLL_DEFAULTS = {
  preset: "roll-down",
  stagger: 0.05,
  duration: 1,
  shuffle: false,
};

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
  preset,
  roll = {},
  scrollTrigger,
  onSplit,
}) {
  const registry = createRegistry();
  const rollConfig = {
    ...TEXT_ROLL_DEFAULTS,
    ...roll,
    ...(preset !== undefined ? { preset } : {}),
  };
  const cellPreset =
    CHAR_CELL_PRESETS[rollConfig.preset] ??
    CHAR_CELL_PRESETS[TEXT_ROLL_DEFAULTS.preset];
  const motion = {
    visible: {
      from: { ...cellPreset.visible.from, ...roll.visible?.from },
      to: { ...cellPreset.visible.to, ...roll.visible?.to },
    },
    hidden: {
      from: { ...cellPreset.hidden.from, ...roll.hidden?.from },
      to: { ...cellPreset.hidden.to, ...roll.hidden?.to },
    },
  };

  function createDualSpans(chars) {
    chars.forEach((charEl) => {
      const text = charEl.textContent;
      charEl.textContent = "";
      charEl.innerHTML = `<span class="anim-char-visible">${text}</span><span class="anim-char-hidden">${text}</span>`;
    });
  }

  function setRollStyles(chars) {
    chars.forEach((charEl) => {
      gsap.set(charEl.querySelector(".anim-char-visible"), motion.visible.from);
      gsap.set(charEl.querySelector(".anim-char-hidden"), motion.hidden.from);
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
        motion.visible.from,
        { ...motion.visible.to, ease, duration },
        index * stagger,
      );
      timeline.fromTo(
        hidden,
        motion.hidden.from,
        { ...motion.hidden.to, ease, duration },
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

        appendRolls(timeline, self.chars, rollConfig);
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
