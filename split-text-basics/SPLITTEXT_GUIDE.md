# SplitText

SplitText.create calls the split method upon creation.

Could use ScrollTrigger callback events to manage the split text instantiation lazily.

## API

Official reference: [SplitText config object](https://gsap.com/docs/v3/Plugins/SplitText/#config-object) (GSAP v3.13+)

`SplitText.create()` accepts a selector, element, or array of elements, plus a config object. It returns a SplitText instance with `.chars`, `.words`, `.lines`, `.masks`, and methods `.revert()`, `.split()`, `.kill()`.

```javascript
SplitText.create(selector, {
  // --- Split scope ---
  type: "chars,words,lines", // What to split: any combo of "chars" | "words" | "lines". Default: all three. Split only what you animate.
  tag: "div", // HTML tag for each split chunk. Default: "div". Inline tags (e.g. "span") won't render transforms in some browsers.

  // --- CSS classes & indexing ---
  charsClass: "char++", // Class on each character element. Append "++" for auto-incremented classes (char1, char2, …).
  wordsClass: "word++", // Class on each word element. "++" adds word1, word2, …
  linesClass: "line++", // Class on each line element. "++" adds line1, line2, …
  propIndex: false, // If true, sets CSS vars per element (--char, --word, --line with index). Default: false.

  // --- Masking & layout (v3.13+) ---
  mask: "lines", // "lines" | "words" | "chars" — wraps chunks in clip containers for reveal effects. One type only. Access via instance.masks.
  deepSlice: true, // Splits nested elements (e.g. <strong>) across lines so they don't stretch line height. Only affects line splits. Default: true.
  smartWrap: false, // When splitting chars only, groups words in nowrap spans to avoid mid-word line breaks. Ignored if type includes words/lines. Default: false.
  reduceWhiteSpace: true, // Collapse consecutive spaces like browsers do. false keeps extra spaces; v3.13+ honors <br> in <pre>. Default: true.

  // --- Delimiters & text hooks ---
  wordDelimiter: " ", // RegExp | string | { delimiter, replaceWith } — custom word breaks (e.g. zero-width joiner in hashtags).
  prepareText: (text, element) => text, // Called per text block before splitting; return modified string (e.g. CJK word marks).
  ignore: ".keep-whole", // Selector or element(s) to leave unsplit but still in the DOM.

  // --- Accessibility (v3.13+) ---
  aria: "auto", // "auto" | "hidden" | "none" — aria-label on parent + aria-hidden on splits ("auto" default). Use "none" + duplicate for nested links.

  // --- Responsive re-split (v3.13+) ---
  autoSplit: false, // Re-split when fonts load or width changes (if type includes "lines"). Put animations in onSplit; return tween/timeline to sync. Default: false.

  // --- Callbacks (v3.13+) ---
  onSplit: (self) => {
    // Fires after each split (including autoSplit re-splits). Animate self.chars | self.words | self.lines here.
    // Return a GSAP tween/timeline to auto-revert and time-sync on the next re-split.
    return gsap.from(self.words, { y: 40, opacity: 0, stagger: 0.05 });
  },
  onRevert: (self) => {
    // Fires when instance.revert() restores original innerHTML.
  },
});
```

## Patterns

When calling the create method, this will execute the splitting of the text.

### Basic imperative setup

```javascript
const splitText = SplitText.create(selector, { type: "chars,words,lines" });
gsap.set(splitText.words, { opacity: 0, y: 100, filter: "blur(15px)" });

gsap.to(splitText.words, {
  opacity: 1,
  yPercent: 0,
  filter: "blue(0)",
  scrollTrigger: {
    trigger: ".frame-1",
    start: "top top",
    end: "bottom bottom",
  },
});
```


### SplitText constructor

```javascript
SplitText.create(".frame--2 h1", {
  type: "words",
  mask: "words",
  autoSplit: true,
  smartSplit: true,
  onSplit: (self) => {
    gsap.set(self.words, { yPercent: 100 });
    gsap.to(self.words, {
      yPercent: 0,
      stagger: 0.1,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".frame--2",
        start: "top 20%",
        end: "top top",
        scrub: true,
      },
    });
  },
});
```

### Lazy

```javascript
// 1. Initialize ScrollTrigger and split only when it scrolls into view
ScrollTrigger.create({
  trigger: ".my-text-element",
  start: "top 80%", // Adjust when the split happens
  once: true, // Only run the split once
  onEnter: () => {
    // 2. Call SplitText lazily
    const split = new SplitText(".my-text-element", {
      type: "chars, words",
    });

    // 3. Chain your animation immediately after splitting
    gsap.from(split.chars, {
      opacity: 0,
      y: 50,
      stagger: 0.05,
      duration: 1,
    });
  },
});
```

## Best Practices

Resizes can cause text reflow to break the `lines` split, use `autoSplit` to prevent text breaks.

1. Fonts load causing a size change in the text
2. Lines are split causing a reflow change



- Make sure to revert split text when done to keep DOM performance

```javascript
...
onComplete: (self) => {
  self.revert() // undo the splits in the DOM
}
```




- Ensure fonts are loaded before calling
- Use `autoSplit` with `onSplit()` when splitting on lines
- Line reflows on resizes

```javascript
const split = SplitText.create(el, {
  type: "lines",
  observeChanges: true,
});
```

| Split type | Best for                           | Avoid when                        |
| ---------- | ---------------------------------- | --------------------------------- |
| chars      | Headlines, short labels, hero text | Long paragraphs (too much DOM)    |
| words      | Subheadings, medium-length copy    | Very short text (awkward stagger) |
| lines      | Display text, large quotes         | Body copy under 18px              |

- Forgetting force3D: true. Add it to all GSAP animations. Without it, transforms aren't hardware accelerated on every browser.

```javascript
gsap.from(split.chars, {
  y: 40,
  opacity: 0,
  force3D: true, // always
  duration: 0.6,
  stagger: 0.02,
  ease: "expo.out",
});
```

## Performance

- Avoid animating filter on mobile. Blur filters are GPU-accelerated on desktop but can cause frame drops on lower-end phones. Test on a mid-range Android before shipping.

- Always call split.revert() on unmount. SplitText wraps your text in dozens of elements. If you don't revert, those stay in the DOM. In React, return the revert from your useGSAP callback.

- Don't split too many elements at once. Splitting 10 paragraphs of body copy on page load is expensive. Use ScrollTrigger to split lazily: only split when the element is close to the viewport.

- Avoid `text-wrap: balance` - it interferes with clean text splitting.

- Some browsers apply kerning between certain characters which is lost when each character is put into its own element, thus the spacing shifts slightly.

```css
font-kerning: none;
text-rendering: optimizeSpeed;
```
