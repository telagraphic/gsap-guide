/**
 * Switch active instance to the trigger most visible in the viewport (panel open only).
 */
export function createFollowViewport({ getTriggerElements, isPanelOpen, onSwitch, getActiveId }) {
  let enabled = false;
  let observer = null;
  /** @type {Map<Element, number>} */
  const visibleRatios = new Map();

  function teardown() {
    observer?.disconnect();
    observer = null;
    visibleRatios.clear();
  }

  function pickMostVisible() {
    if (!enabled || !isPanelOpen()) return;

    let bestId = null;
    let bestRatio = 0;

    for (const [el, ratio] of visibleRatios) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = el.dataset.playgroundTrigger;
      }
    }

    const activeId = getActiveId();
    if (bestId && bestRatio >= 0.25 && bestId !== activeId) {
      onSwitch(bestId);
    }
  }

  function refresh() {
    teardown();
    if (!enabled) return;

    const elements = getTriggerElements();
    if (!elements.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleRatios.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        });
        pickMostVisible();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => {
      visibleRatios.set(el, 0);
      observer.observe(el);
    });
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    refresh();
  }

  return { setEnabled, refresh, teardown, isEnabled: () => enabled };
}
