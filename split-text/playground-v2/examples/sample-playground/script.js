/**
 * Sample playground — all-in-one script.js
 *
 * Contains:
 *   1. Generic runner (promoted to plugin in v3)
 *   2. define() configs — Workflow 2 + 3
 *   3. discover() — Workflow 1 scaffolds + registry build
 *   4. attach() — wires panel to active instance
 *
 * Strategy A: no spaghetti for [data-playground] targets on this dev page.
 * Production: set IS_DEV = false, paste Copy code blocks into PRODUCTION_BLOCKS.
 */

(function () {
  "use strict";

  // ─── 0. Mode ───────────────────────────────────────────────────────────────

  const IS_DEV = true;
  const STORAGE_PREFIX = "sample-playground";

  gsap.registerPlugin(SplitText, ScrollTrigger);

  // ─── 1. Generic runner ─────────────────────────────────────────────────────
  // Becomes plugin export: createSplitScrollAnimation(config)

  const TWEEN_PROP_KEYS = [
    "opacity",
    "x",
    "y",
    "xPercent",
    "yPercent",
    "scale",
    "rotation",
    "rotationX",
    "rotationY",
    "filter",
  ];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(target, patch) {
    if (!patch || typeof patch !== "object") return target;
    Object.keys(patch).forEach((key) => {
      const val = patch[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        target[key] = target[key] && typeof target[key] === "object" ? target[key] : {};
        deepMerge(target[key], val);
      } else {
        target[key] = val;
      }
    });
    return target;
  }

  function typeIncludes(type, unit) {
    return String(type)
      .split(",")
      .map((s) => s.trim())
      .includes(unit);
  }

  function getAnimateTargets(split, animate) {
    if (!split) return [];
    if (animate === "chars") return split.chars || [];
    if (animate === "words") return split.words || [];
    return split.lines || [];
  }

  function buildStagger(stagger) {
    if (!stagger) return undefined;
    const timing = stagger.timing === "each" ? "each" : "amount";
    const out = { from: stagger.from || "start" };
    if (timing === "each") {
      const each = stagger.each ?? 0.1;
      if (each <= 0) return undefined;
      out.each = each;
    } else {
      const amount = stagger.amount ?? 0.1;
      if (amount <= 0) return undefined;
      out.amount = amount;
    }
    if (stagger.ease && stagger.ease !== "none") out.ease = stagger.ease;
    if (Array.isArray(stagger.grid) && stagger.grid.length >= 2) {
      out.grid = [stagger.grid[0], stagger.grid[1]];
    }
    if (stagger.axis === "x" || stagger.axis === "y") out.axis = stagger.axis;
    return out;
  }

  function pickTweenProps(source) {
    const out = {};
    if (!source) return out;
    TWEEN_PROP_KEYS.forEach((key) => {
      if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
        out[key] = source[key];
      }
    });
    return out;
  }

  function buildScrollTriggerVars(scrollTrigger, targets) {
    const st = { ...scrollTrigger };
    st.trigger = st.trigger || targets?.element;
    if (st.scrub === false || st.scrubMode === "off") {
      delete st.scrub;
      delete st.scrubMode;
    } else if (st.scrubMode === "smooth" && typeof st.scrub !== "number") {
      st.scrub = Number(st.scrubSmooth) || 1;
    }
    delete st.scrubMode;
    delete st.scrubSmooth;
    return st;
  }

  function createSplitScrollAnimation(config) {
    const cfg = deepClone(config);
    let split = null;
    let tween = null;

    function runAnimation(self) {
      tween?.kill();
      const targets = getAnimateTargets(self, cfg.animate);
      if (!targets.length) return null;

      gsap.set(targets, pickTweenProps(cfg.from));
      tween = gsap.to(targets, {
        ...pickTweenProps(cfg.to),
        duration: cfg.to?.duration ?? 1,
        ease: cfg.to?.ease ?? "power2.out",
        stagger: buildStagger(cfg.stagger),
        scrollTrigger: buildScrollTriggerVars({ ...cfg.scrollTrigger }, cfg.targets),
      });
      return tween;
    }

    const splitOpts = {
      type: cfg.splitText.type,
      autoSplit: cfg.splitText.autoSplit,
      smartSplit: cfg.splitText.smartSplit,
      onSplit(self) {
        split = self;
        return runAnimation(self);
      },
    };
    if (cfg.splitText.mask && cfg.splitText.mask !== "none") {
      splitOpts.mask = cfg.splitText.mask;
    }

    split = SplitText.create(cfg.targets.text, splitOpts);

    function applyLive(patch) {
      deepMerge(cfg, patch);
      if (!split) return;
      runAnimation(split);
      ScrollTrigger.refresh(true);
      ScrollTrigger.update();
    }

    function teardown() {
      tween?.kill();
      split?.revert?.();
      split?.kill?.();
      split = null;
      tween = null;
    }

    return {
      teardown,
      runtime: {
        applyLive,
        getConfig: () => cfg,
        animateTargetAvailable: (animate) => typeIncludes(cfg.splitText.type, animate),
      },
    };
  }

  // ─── 2. Scaffold defaults (Tier 0 / discover) ──────────────────────────────

  const GLOBAL_SCAFFOLD = {
    splitText: {
      type: "words,lines",
      mask: "lines",
      autoSplit: true,
      smartSplit: true,
    },
    animate: "lines",
    from: { yPercent: 100 },
    to: { yPercent: 0, duration: 1, ease: "power2.out" },
    stagger: { timing: "amount", amount: 0.1, from: "start" },
    scrollTrigger: {
      start: "top 25%",
      end: "top top",
      scrub: true,
      markers: false,
    },
    typography: {
      fontVar: "--font-fh-enso",
      fontSize: 1.25,
      lineHeight: 1.5,
      letterSpacing: 0,
      textAlign: "left",
      textTransform: "none",
    },
  };

  function buildScaffoldConfig(id, globalOverrides) {
    const text = `[data-playground="${id}"]`;
    const trigger = `[data-playground-trigger="${id}"]`;
    return deepMerge(
      deepMerge(deepClone(GLOBAL_SCAFFOLD), {
        targets: { element: trigger, text },
        scrollTrigger: { trigger },
      }),
      globalOverrides || {}
    );
  }

  // ─── 3. Tier 1 define() — Workflow 2 + 3 configs ───────────────────────────

  /**
   * Workflow 2 (`imported-paragraph`):
   *   In practice: paste spaghetti into Import tab → Apply.
   *   This object is what Apply writes to in-memory config (same shape as define).
   *
   * Workflow 3 (`config-header`):
   *   Hand-written config you commit to script.js for known starting values.
   */
  const DEFINED_CONFIGS = {
    // Workflow 2 — simulates post–Import Apply (was converted from canonical spaghetti)
    "imported-paragraph": {
      targets: {
        element: '[data-playground-trigger="imported-paragraph"]',
        text: '[data-playground="imported-paragraph"]',
      },
      splitText: {
        type: "words,lines",
        mask: "lines",
        autoSplit: true,
        smartSplit: true,
      },
      animate: "lines",
      from: { yPercent: 100 },
      to: { yPercent: 0, duration: 1, ease: "power2.out" },
      stagger: { timing: "amount", amount: 0.12, from: "start" },
      scrollTrigger: {
        trigger: '[data-playground-trigger="imported-paragraph"]',
        start: "top 30%",
        end: "top top",
        scrub: true,
        markers: false,
      },
      typography: {
        fontVar: "--font-giest",
        fontSize: 1.25,
        lineHeight: 1.5,
        letterSpacing: 0,
        textAlign: "left",
        textTransform: "none",
      },
    },

    // Workflow 3 — explicit Tier 1 config
    "config-header": {
      targets: {
        element: '[data-playground-trigger="config-header"]',
        text: '[data-playground="config-header"]',
      },
      splitText: {
        type: "words",
        mask: "none",
        autoSplit: true,
        smartSplit: false,
      },
      animate: "words",
      from: { opacity: 0, y: 28 },
      to: { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
      stagger: { timing: "each", each: 0.045, from: "start" },
      scrollTrigger: {
        trigger: '[data-playground-trigger="config-header"]',
        start: "top 75%",
        end: "top 35%",
        scrub: false,
        markers: false,
      },
      typography: {
        fontVar: "--font-editorial-new",
        fontSize: 2.25,
        lineHeight: 1.1,
        letterSpacing: -0.02,
        textAlign: "center",
        textTransform: "none",
      },
    },
  };

  // ─── 4. Playground API (moves to SplitTextPlaygroundV2 in v3) ──────────────

  const _defined = {};
  let _discoverOptions = {};
  let _registry = null;
  let _liveInstances = {};
  let _activeId = null;

  const PlaygroundAPI = {
    /** Tier 1 — register config literals (merged at discover/build time) */
    define(entries) {
      Object.assign(_defined, entries);
      return this;
    },

    /** Tier 0 — scan DOM + merge scaffolds with define() entries */
    discover(options = {}) {
      _discoverOptions = options;
      _registry = this.buildRegistry();
      this.validateDom(_registry);
      return _registry;
    },

    buildRegistry() {
      const ids = [
        ...new Set(
          [...document.querySelectorAll("[data-playground]")].map((el) => el.dataset.playground)
        ),
      ];

      const globalOverrides = _discoverOptions.defaults || {};
      const registry = {};

      ids.forEach((id) => {
        const defaults = _defined[id]
          ? deepClone(_defined[id])
          : buildScaffoldConfig(id, globalOverrides);

        registry[id] = {
          label: _defined[id]?.label || id,
          defaults,
          init: createSplitScrollAnimation,
        };
      });

      return registry;
    },

    validateDom(registry) {
      const domIds = new Set(
        [...document.querySelectorAll("[data-playground]")].map((el) => el.dataset.playground)
      );

      Object.keys(registry).forEach((id) => {
        if (!domIds.has(id)) {
          console.warn(`[playground] registry id "${id}" has no [data-playground] node`);
        }
      });

      domIds.forEach((id) => {
        if (!registry[id]) {
          console.warn(`[playground] orphan [data-playground="${id}"] — no registry entry`);
        }
        const el = document.querySelector(`[data-playground="${id}"]`);
        if (el?.querySelector?.(".line, .word, .char")) {
          console.warn(
            `[playground] overlap: "${id}" may already be split — remove spaghetti for this target (Strategy A)`
          );
        }
      });
    },

    /** Init every instance on the page (scroll preview for all workflows) */
    initAll(registry = _registry) {
      Object.keys(_liveInstances).forEach((id) => {
        _liveInstances[id]?.teardown?.();
      });
      _liveInstances = {};

      Object.entries(registry).forEach(([id, entry]) => {
        _liveInstances[id] = entry.init(deepClone(entry.defaults));
      });

      ScrollTrigger.refresh(true);
      return _liveInstances;
    },

    getActiveId(fallback) {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("playground");
      if (fromUrl && _registry?.[fromUrl]) return fromUrl;
      return fallback || Object.keys(_registry || {})[0];
    },

    /**
     * Wire control panel to active instance.
     * v3 plugin: SplitTextPlaygroundV2.attach({ registry, activeId, … })
     * v2 interim: single attach() delegates init/teardown to active instance.
     */
    attach(options = {}) {
      if (!_registry) this.discover();

      _activeId = options.activeId || this.getActiveId();
      const entry = _registry[_activeId];
      if (!entry) {
        throw new Error(`[playground] unknown activeId "${_activeId}"`);
      }

      // All instances animate on scroll; panel edits the active one
      this.initAll(_registry);

      const self = this;
      const storageKey = `${options.storageKey || STORAGE_PREFIX}:${_activeId}`;

      SplitTextPlaygroundV2.attach({
        init(config) {
          _liveInstances[_activeId]?.teardown?.();
          _liveInstances[_activeId] = entry.init(config);
          return _liveInstances[_activeId];
        },
        defaults: deepClone(entry.defaults),
        storageKey,
        targets: options.targets || ".split-target",
      });

      console.info(
        `[playground] attached panel → "${_activeId}" (${Object.keys(_registry).length} instances on page)`
      );
      console.info(
        "[playground] v3: instance dropdown + registry attach will switch activeId without this shim"
      );

      return this;
    },

    isActive() {
      return Boolean(SplitTextPlaygroundV2?.isActive?.());
    },
  };

  // ─── 5. Register Tier 1 configs + expose API ───────────────────────────────

  PlaygroundAPI.define(DEFINED_CONFIGS);

  // Workflow 1 (`cold-start-lines`) is intentionally NOT in define() —
  // discover() will scaffold it from GLOBAL_SCAFFOLD when the registry builds.

  window.SplitTextPlayground = PlaygroundAPI;

  // ─── 6. Production blocks (paste Copy code here when shipping) ─────────────

  const PRODUCTION_BLOCKS = {
    /**
     * After tuning, paste Copy code for each instance.
     * Remove data-playground attributes from production HTML (recommended).
     *
     * "cold-start-lines": `SplitText.create(".hero__copy", { … })`,
     * "imported-paragraph": `…`,
     * "config-header": `…`,
     */
  };

  function runProduction() {
    // Example coexistence: only non-playground elements
    // if (PRODUCTION_BLOCKS.footer) { … }
    Object.entries(PRODUCTION_BLOCKS).forEach(([name, fn]) => {
      if (typeof fn === "function") fn();
      else console.warn(`[production] empty block: ${name}`);
    });
  }

  // ─── 7. Boot ───────────────────────────────────────────────────────────────

  function bootDev() {
    PlaygroundAPI.discover();
    // attach() called from index.html after playground-v2.js loads
  }

  function bootProd() {
    runProduction();
  }

  if (IS_DEV) {
    bootDev();
    window.__samplePlaygroundBoot = function samplePlaygroundBoot() {
      PlaygroundAPI.attach({
        activeId: PlaygroundAPI.getActiveId("cold-start-lines"),
        storageKey: STORAGE_PREFIX,
        targets: ".split-target",
      });
    };
  } else {
    bootProd();
  }
})();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WORKFLOW REFERENCE (how this file maps to day-to-day use)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WORKFLOW 1 — Cold start (Tier 0)
 * ─────────────────────────────────
 * HTML:  <p data-playground="cold-start-lines">
 * JS:    omit from define() → discover() scaffolds defaults → tune panel → Copy code
 *
 * WORKFLOW 2 — Import existing spaghetti
 * ───────────────────────────────────────
 * 1. Add data-playground + data-playground-trigger to HTML
 * 2. Do NOT run old spaghetti on this dev page (Strategy A)
 * 3. Import tab: paste canonical block → Convert → Apply to instance
 *    (Apply updates in-memory config — equivalent to adding a define() entry)
 * 4. Tune → Copy code → replace old block in production script.js
 *
 * WORKFLOW 3 — Config in script (Tier 1)
 * ───────────────────────────────────────
 * JS:    add full object to define({ "config-header": { … } })  ← DEFINED_CONFIGS above
 * Tune → optional Copy config to update define() → Copy code for production
 *
 * SWITCHING INSTANCES (until v3 dropdown ships)
 * ─────────────────────────────────────────────
 * URL: ?playground=imported-paragraph
 *
 * PRODUCTION
 * ──────────
 * IS_DEV = false
 * Paste Copy code into PRODUCTION_BLOCKS / runProduction()
 * Remove playground scripts from HTML
 */
