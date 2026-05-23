**Part of [GSAP Refactor](SKILL.md) by Nick Lyons** · Follow the Shared Rules in [SKILL.md](SKILL.md)

Translate an animation between vanilla GSAP and React (and back) without changing how it looks or feels. The motion is correct — only the idiom changes.

Output the ported code; write notes to `./docs/ANIMATION_PORT.md` if a record is wanted.

## When to use
- User says "convert this to React", "make this vanilla", "port to `useGSAP`", "drop the framework"
- Moving an animation between a static page and a component, or vice versa

## The core difference
Vanilla GSAP runs once when the script loads and the DOM is already there. React **re-renders**, **remounts**, and hands you elements through **refs**, not selectors. The whole port is about respecting that lifecycle: create tweens after mount, scope selectors to the component, and clean up on unmount.

## Vanilla → React

| Vanilla | React | Why |
|---|---|---|
| `document.querySelector('.box')` | `useRef` + `ref={boxRef}` | React owns the DOM; query its refs, not the document |
| Code at module top / `DOMContentLoaded` | `useGSAP(() => {...}, { scope: container })` | Runs after mount, re-runs on deps, **auto-reverts on unmount** |
| `.box` selector inside the tween | `'.box'` still works *if* `scope` is set | `useGSAP` scopes selector text to the container ref |
| Manual `tween.kill()` on teardown | Handled by `useGSAP` cleanup | The hook reverts everything it created |
| Global ScrollTrigger | Same, but kill on unmount | SPA routes leave orphaned triggers otherwise — `useGSAP` handles it |

```jsx
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function Box() {
  const container = useRef(null);
  useGSAP(() => {
    gsap.to(".box", { x: 200, ease: "power2.out", duration: 1 });
  }, { scope: container });          // selectors resolve inside container; auto-cleanup
  return <div ref={container}><div className="box" /></div>;
}
```

**Rules going to React:**
- Install `@gsap/react` and use `useGSAP` — don't hand-roll `useEffect` + manual kill. The hook exists precisely to handle revert/cleanup.
- Set `scope` to a container ref so selector strings stay component-local.
- Use refs for single elements; scoped selectors for groups.
- Put React-state-driven values in the `useGSAP` dependency array so the animation re-runs when they change.

## React → Vanilla

| React | Vanilla | Why |
|---|---|---|
| `useRef` + `ref=` | `document.querySelector` / `getElementById` | No component instance; query the live DOM |
| `useGSAP(..., { scope })` | Plain `gsap.to(...)` at load (after DOM ready) | No render cycle; DOM is already present |
| Hook auto-cleanup | Explicit `ScrollTrigger.getAll().forEach(t => t.kill())` if needed | You own teardown now |
| Spring config objects (Framer-style) | GSAP `ease` string / `CustomEase` | GSAP has no `stiffness`/`damping` — translate to an equivalent ease |
| State-driven re-runs | Event listeners or a single init | No reactive deps; wire to events explicitly |

**Rules going to vanilla:**
- Wrap init in `DOMContentLoaded` (or place the script after the markup) so elements exist.
- Translate any `{ stiffness, damping }` spring into the closest GSAP ease — note it's an approximation, not a 1:1 (a spring overshoots; `back.out`/`elastic` are the nearest cousins).
- Keep the config-object pattern (see [storyboard](storyboard.md)) — it survives the port and keeps values tunable in both idioms.

## What must NOT change
The port preserves the *animation*: same eases, durations, scrub, stagger, transform values, ScrollTrigger start/end. If you're tempted to "improve" the motion mid-port, that's [vary](vary.md) or [refactor](refactor.md) — keep this a faithful translation.

## Output
- The ported code, ready to drop in.
- A short note on anything that **couldn't** translate exactly (spring→ease approximations, lifecycle assumptions) so the user knows what to verify.
