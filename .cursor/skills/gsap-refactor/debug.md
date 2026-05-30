**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

Diagnose and fix a broken animation — jank, wrong trigger positions, transforms not reverting, conflicts. This is for "it doesn't work right," distinct from [audit](audit.md), which critiques working code.

Output the diagnosis inline; write a fix summary to `./docs/ANIMATION_DEBUG.md` only if the user wants a record.

## When to use
- User says "it's janky", "not firing", "stuck", "won't reset", "ScrollTrigger is off", "broken"
- An animation runs but behaves wrong

## Diagnose before fixing
State what's broken in one line, name the likely cause, then fix. Don't guess-and-check in the dark — most GSAP bugs fall into the table below.

## The usual suspects

| Symptom | Likely cause | Fix |
|---|---|---|
| Janky / stuttering scrub | Animating layout props (`top`, `left`, `width`, `margin`) → reflow every frame | Switch to transforms (`x`, `y`, `scale`); they composite on the GPU |
| ScrollTrigger fires at wrong spot | `start`/`end` measured before layout settled, or images loaded after init | Call `ScrollTrigger.refresh()` after fonts/images load; verify with `markers: true` |
| Trigger position drifts on resize | Pinned/measured values cached at load | `invalidateOnRefresh: true` on the trigger |
| Transforms don't reset | No revert path; tween left element at end state | `gsap.set()` to reset, or `toggleActions` / `clearProps: "all"` on a timeline |
| Animation re-runs / stacks on re-render (React) | Tween created outside `useGSAP` / not cleaned up | Wrap in `useGSAP(() => {...}, { scope: ref })` — auto-reverts on unmount |
| Lenis + ScrollTrigger out of sync | Both driving scroll independently | Drive ScrollTrigger from Lenis: `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker` integration |
| Flicker on first paint | Element visible before JS sets initial state | Set the start state in CSS, or `gsap.set()` before the tween, or use `autoAlpha` |
| `scrub` feels disconnected | `scrub: <number>` adds intentional lag | Lower the number, or `scrub: true` for 1:1 |
| Stale values after route change (SPA) | Old ScrollTriggers not killed | `ScrollTrigger.getAll().forEach(t => t.kill())` on teardown |

## The debug toolkit
- **`markers: true`** — the first move for any ScrollTrigger position bug. See exactly where start/end land.
- **`ScrollTrigger.refresh()`** — recompute positions after async layout changes (images, fonts, accordions).
- **`gsap.globalTimeline.timeScale(0.2)`** — slow everything down to watch what's actually happening.
- **Browser DevTools → Rendering → Paint flashing / FPS meter** — confirm whether you're animating composited or reflowing properties.

## Output
- Lead with the **one-line diagnosis**: what's broken and why.
- Give the **minimal fix** — the smallest change that resolves it, not a rewrite (that's [refactor](refactor.md)).
- If the bug reveals a structural problem (e.g. no cleanup path anywhere), say so and point to refactor — don't silently expand scope.
