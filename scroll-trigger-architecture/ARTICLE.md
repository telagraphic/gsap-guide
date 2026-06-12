# GSAP Landing Page Architecture

## Design

- using grid to maintain alignment for each frame


## HTML & CSS

- challenge, using a generic page structure for each frame but each frame uses custom code from other sources, harmonizing it using a common language or context challenge with styles and markup
- creating animation specific utility classes that replaces custom classes



### AI Gotchas
AI is not smart enough to see overlapping classes with 3 of 4 same properties and will create two classes when they could be 1.

Class renaming was still coupled to the code with names like


```css
/* Panel 7 — letter spiral */
.panel-nine__line {
  display: flex;
}

.panel-nine__char {
  position: relative;
  display: inline-block;
  overflow: hidden;
}
```


After telling the prompt to separate styles into tokens, typography, animation and page files to make classes more utility like, AI still does this:


```css
.anim-clip-slot {
  display: inline-block;
  font-size: var(--type-heading);
  font-weight: var(--weight-display);
  line-height: var(--leading-tight);
  position: relative;
  text-transform: uppercase;
  clip-path: polygon(0 2%, 0 98%, 100% 98%, 100% 2%);
}
```

Could be the dumb zone in the context window that leads to this or spelling out in detail what I want.

It did a perfect job on typography classes but not animations, this could have been due to complicated code and not understanding my intent with one prompt, when it should have been grill through further refinement of the code refactoring prompt process.


### Renaming and Updating

Breaking prompts into smaller tasks that target smaller sections of the code can provide a much better and consistent experience.

Telling the prompt to create utility classes or pick a better bem name scheme for the html and then update the css accordingly is not always great.

If your vibe coding, then who cares, but if you are working with others or need a more consistent mental model of how you work.

Renaming the html classes and updating the css worked best when providing a BEM naming scheme example, having it create the rest of the class names, then updating 1/4 of the code and identifying other patterns prevents weird class names that break from convention.

## Refactoring

Having AI do the chore work is great. I can now see the bigger picture of the code landscape.

Creating a solid token naming system that harmonizes with the class types (page, typography, color, animation) and how that metaphor links to the actual design system elements of the same names.

Instead of just writing class names ad hoc, I can create my own design system heirarchy reflected in the different levels.



animation-wide-slide
animation-slot-machine-roll
animation-character-waterdrop
animation-character-ripple



data-panel-5 header is broken