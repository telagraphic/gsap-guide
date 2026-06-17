/**
 * Registry for managing GSAP timelines, tweens, scroll triggers and split text instances
 *
 */

export function createRegistry() {
  /** Animation registry */
  const Timelines = new Map();
  const Tweens = new Map();
  const Triggers = new Map();
  const Splits = new Map();

  /** Methods */
  function addTimeline(key, timeline) {
    Timelines.set(key, timeline);
  }

  function addTween(key, timeline) {
    Tweens.set(key, timeline);
  }

  function addTrigger(key, timeline) {
    Triggers.set(key, timeline);
  }

  function addSplit(key, timeline) {
    Splits.set(key, timeline);
  }

  function killTween(tween) {
    tween?.scrollTrigger?.kill();
    tween?.kill();
  }

  /**
   * Kills tween and timeline instances and clears cached for resize events
   */
  function resetAnimations() {
    for (const tween of Tweens.values()) {
      this.killTween(tween);
    }

    for (const timeline of Timelines.values()) {
      timeline?.scrollTrigger?.kill();
      timeline.kill();
    }

    Tweens.clear();
    Timelines.clear();
  }

  /**
   * Reverts (undoes split text wrapping) and clears cached split text instances for resize events
   */

  function resetSplits() {
    for (const split of Splits.values()) {
      split.revert?.();
    }
    Splits.clear();
  }


  /**
   * Kills ScrollTrigger listeners and clears the cache
   */
  function resetTriggers() {
    for (const trigger of Triggers.values()) {
      trigger.kill();
    }
    Triggers.clear();
  }

  /**
   * Kills all gsap instances and clears registry caches
   */

  function destroy() {
    this.resetAnimations();
    this.resetSplits();
    this.resetTriggers();
  }

  return {
    addTimeline: addTimeline,
    addTween: addTween,
    addTrigger: addTrigger,
    addSplit: addSplit,
    resetAnimations: resetAnimations,
    resetSplits: resetSplits,
    resetTriggers: resetTriggers,
    killTween: killTween,
    destroy: destroy,
  };
}
