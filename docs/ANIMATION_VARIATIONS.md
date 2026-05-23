# Variations on MWG Effect 015 (mask headline reveal)

**Currently animated:** scroll hint `autoAlpha`; per `.word`, both layers `yPercent` 0→100 with `expo.inOut`, `scrub: 0.4`, band `bottom bottom` → `top 55%`. **Static CSS:** `clip-path` window, `.word-hidden` at `translate(0, -100%)`. No stagger, opacity, scale, or animated mask geometry in GSAP.

---

## Quick tweaks (same properties)

| Dial | Try | Feel |
|------|-----|------|
| **`ease`** | `power2.inOut` | Mechanical, predictable scrub — good for editorial |
| | `power4.out` | Fast settle at end of each word’s band — punchy lock-in |
| | `none` (linear) | Scroll position maps 1:1 through the mask — “slot machine,” less luxury |
| | `back.out(1.2)` on scrub only if you shorten band | Slight overshoot past +100% then settle — playful, risky with clip |
| **`scrub`** | `true` | Snaps to scroll — no lag; words feel glued to finger |
| | `1` | Heavy, cinematic lag (~1s catch-up) |
| | `0.15` | Tighter than `0.4` — still smooth, more responsive |
| **Scroll band** | `end: "top 40%"` | Longer scrub per word — reveal finishes higher on screen |
| | `end: "top 70%"` | Shorter band — words finish faster, more aggressive |
| | `start: "bottom 90%"` | Arms later — word almost in view before motion starts |
| **`yPercentEnd`** | `80` | Partial slide — hidden never fully clears; subtler pass-through |
| | `120` | Overshoot — brief double-exposure inside clip before hold |
| **Choreography** | Stagger `scrollTrigger.start` per index (see below) | Wave down the line without new properties |
| **Direction** | `yPercent: -100` from `0` with hidden at `+100%` below | Reveal rises instead of drops — invert CSS offset to match |
| **Clip inset (CSS)** | `--word-clip-top: 0%` / `5%` | Tighter or looser window — same GSAP, different crop |

### Ease comparison (drop-in)

```javascript
const WORD_REVEAL = {
  yPercentEnd: 100,
  ease: "power4.out", // was expo.inOut
  scrub: 0.4,
  start: "bottom bottom",
  end: "top 55%",
};
```

### Stagger without a timeline (offset each word’s band)

```javascript
const WORD_STAGGER = { startOffsetVh: 8 }; // per word index

words.forEach((word, index) => {
  gsap.fromTo(word.querySelectorAll(".word-hidden, .word-visible"),
    { yPercent: 0 },
    {
      yPercent: WORD_REVEAL.yPercentEnd,
      ease: WORD_REVEAL.ease,
      scrollTrigger: {
        trigger: word,
        start: `bottom bottom-=${index * WORD_STAGGER.startOffsetVh}`,
        end: WORD_REVEAL.end,
        scrub: WORD_REVEAL.scrub,
      },
    }
  );
});
```

Same eight triggers; later words arm later — reads as a cascade while each word still scrubs independently.

---

## Layered variations (add channels)

Each option states what rides with the existing **`yPercent`** slide through the clip.

### 1. Opacity crossfade on layers (rides `yPercent`)

Hidden fades in as it enters the window; visible fades out as it leaves. Same scroll progress drives position and alpha — avoids a flat “two ghosts” look when layers overlap mid-band.

```javascript
const WORD_REVEAL_LAYERED = {
  ...WORD_REVEAL,
  hidden: { opacity: 1 },
  visible: { opacity: 0 },
};

gsap.fromTo(hidden, { yPercent: 0, opacity: 0 }, { yPercent: 100, opacity: 1, scrollTrigger: st });
gsap.fromTo(visible, { yPercent: 0, opacity: 1 }, { yPercent: 100, opacity: 0, scrollTrigger: st });
```

**Cost:** Low (opacity + transform). **Feel:** Editorial dissolve inside the mask, not a hard swap.

---

### 2. Animate `clip-path` inset (rides `yPercent`)

Window starts tall (loose crop), tightens to `2% / 98%` as progress hits 1. Text still slides, but the slot **narrows** — pressure builds at end of word.

```javascript
// CSS: clip-path uses var(--clip-top) / var(--clip-bottom)
gsap.fromTo(word,
  { "--clip-top": "8%", "--clip-bottom": "8%" },
  {
    "--clip-top": "2%",
    "--clip-bottom": "2%",
    ease: WORD_REVEAL.ease,
    scrollTrigger: { trigger: word, start: WORD_REVEAL.start, end: WORD_REVEAL.end, scrub: WORD_REVEAL.scrub },
  }
);
// Keep existing yPercent on layers in parallel (same ScrollTrigger id or matched band)
```

**Cost:** Medium — `clip-path` animates on CPU; test mobile. **Feel:** Shutter tightening; pairs naturally with vertical slide.

---

### 3. `skewY` + slight `scaleY` on layers (rides `yPercent`)

Shear and vertical squash peak mid-reveal, resolve at 0 and 1. Mimics velocity on a fast vertical pass.

```javascript
gsap.fromTo(layers,
  { yPercent: 0, skewY: 0, scaleY: 1 },
  {
    yPercent: WORD_REVEAL.yPercentEnd,
    skewY: 4,
    scaleY: 0.92,
    ease: WORD_REVEAL.ease,
    scrollTrigger: { /* same band */ },
  }
);
```

**Cost:** Low on transforms. **Feel:** Kinetic type; keep `skewY` under ~6° or it reads as broken.

---

### 4. `filter: blur()` on `.word-visible` only (rides `yPercent`)

Visible layer blurs as it exits the window; hidden stays sharp entering. Focus pull tied to scroll.

```javascript
gsap.fromTo(visible,
  { yPercent: 0, filter: "blur(0px)" },
  { yPercent: 100, filter: "blur(8px)", scrollTrigger: st }
);
```

**Cost:** Higher GPU — skip or reduce on `prefers-reduced-motion` and small viewports. **Feel:** Depth-of-field handoff inside the mask.

---

### 5. Different copy on hidden vs visible (markup + same `yPercent`)

Keep motion identical; change **content** per layer (e.g. hidden = outline word, visible = solid). No new GSAP channels — pure design riff. Requires accessible labeling (`aria-hidden` on decorative duplicate).

---

### 6. Horizontal mask + `xPercent` (replaces vertical channel)

Swap clip to vertical edges and slide layers on **X** instead of Y. Same architecture, different axis.

```css
.word { clip-path: polygon(2% 0, 98% 0, 98% 100%, 2% 100%); }
.word-hidden { transform: translate(-100%, 0); }
```

```javascript
gsap.fromTo(layers, { xPercent: 0 }, { xPercent: 100, scrollTrigger: st });
```

**Feel:** Wipe left-to-right through the headline — good for wide display type.

---

### 7. Pin the headline block (ScrollTrigger `pin`)

Pin `.container` for one viewport while words scrub inside the pinned region. Words still use per-word triggers **or** one master progress drives all words.

```javascript
ScrollTrigger.create({
  trigger: ".mwg_effect015 .container",
  start: "top top",
  end: "+=150%",
  pin: true,
});
```

**Feel:** Headline “stays on stage” while reveals complete — more theatrical, changes scroll length math (refresh after adding).

---

### 8. Scroll velocity skew (rides scroll, not progress)

Use ScrollTrigger’s `onUpdate` with `self.getVelocity()` to set `skewY` on layers while `yPercent` stays scrub-driven.

```javascript
onUpdate: (self) => {
  gsap.set(layers, { skewY: gsap.utils.clamp(self.getVelocity() / 200, -6, 6) });
}
```

**Feel:** Type leans into fast flicks; settles when scroll stops. **Cost:** Extra set() per frame — throttle or disable on reduced motion.

---

## Scroll hint riffs (separate from words)

| Tweak | Delta | Feel |
|-------|-------|------|
| Scrub hint | `scrub: 0.2` + `autoAlpha` instead of `toggleActions` | Hint fades proportionally to first pixel of scroll |
| Scale hint | `scale: 0.9` with `autoAlpha` | Shrinks away instead of only fading |
| Parallax hint | `y: 40` with scroll on body | Hint drifts down while fading |

---

## One worth building

**Staggered word bands + opacity crossfade on layers**

Why: You keep the clip-mask identity of MWG 015, add **choreography** (stagger) and **nuance** (opacity) without animating `clip-path` or `filter`. Two config blocks, no master timeline, still eight independent scrubs — fits the module pattern from the audit.

```javascript
const WORD_REVEAL = {
  yPercentEnd: 100,
  ease: "expo.inOut",
  scrub: 0.4,
  start: "bottom bottom",
  end: "top 55%",
};

const WORD_STAGGER = { startOffsetVh: 6 };

const LAYER_FADE = {
  hidden: { opacityFrom: 0, opacityTo: 1 },
  visible: { opacityFrom: 1, opacityTo: 0 },
};

function createWordReveal(word, index) {
  const hidden = word.querySelector(".word-hidden");
  const visible = word.querySelector(".word-visible");
  const scrollTrigger = {
    trigger: word,
    start: `bottom bottom-=${index * WORD_STAGGER.startOffsetVh}`,
    end: WORD_REVEAL.end,
    scrub: WORD_REVEAL.scrub,
  };

  gsap.fromTo(hidden,
    { yPercent: 0, opacity: LAYER_FADE.hidden.opacityFrom },
    { yPercent: WORD_REVEAL.yPercentEnd, opacity: LAYER_FADE.hidden.opacityTo, ease: WORD_REVEAL.ease, scrollTrigger }
  );
  gsap.fromTo(visible,
    { yPercent: 0, opacity: LAYER_FADE.visible.opacityFrom },
    { yPercent: WORD_REVEAL.yPercentEnd, opacity: LAYER_FADE.visible.opacityTo, ease: WORD_REVEAL.ease, scrollTrigger }
  );
}

document.querySelectorAll(".mwg_effect015 .word").forEach(createWordReveal);
```

Tune `WORD_STAGGER.startOffsetVh` (4–10) and try `ease: "power4.out"` if `expo.inOut` feels too soft with the fade. Call `ScrollTrigger.refresh()` after font load so stagger offsets match real word positions.
