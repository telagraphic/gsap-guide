# Considerations


- Running the split text trigger via a timeline to sync with master timeline
- Setting a config for values
- Create a factory for timelines, splittext, scroll trigger
- Export each frame as a separate file and import into the main file
- Code organization with separate files for each frame
- Code patterns used for all frames: timelines, scroll trigger, split text, etc...
- Code structure with a storyboard config object for each element


## Component Ideas

- Could implement a cloneNode for frame 4 for further optimization
- How to combine waterfall cascade, slot machine rool, falling letters?
https://madewithgsap.com/effects/tutorial041
https://madewithgsap.com/effects/tutorial027

- Component based on html shape
- Or tagging the html with a data-animation="animationType" to then create the markup, assign styles and run the code



# Before Refactoring

- convert gsap.set to styles
- extract repeated properties styles into css properties
- re-order the html and css to be in sync, make sure each data-panel proceeds ASC
- review refactoring approaches


- add more types of split text
- character slide ins, etc...
- map out some variations
- create just a hide class versus a autoAlpha and opacity?
- create functions for removing anim-hide



# Refactoring Approach



1. Remove gsap.sets, update anim-prehide
2. Extract each frame into a storyboard configuration
3. List out frames, factories, components
4. Create timeline orchestrator, replace frame by frame
4. Create frame one by one
5. Refactor each frame to a registry, factory pattern
6. Refactor to gsap component lifecycle and
7. Refine splittext and scrolltrigger creaetion to primitives

