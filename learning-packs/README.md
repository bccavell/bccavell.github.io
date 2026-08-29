# Learning Packs

This folder is a running record of everything covered while building the
projects in this repo. Every project gets its own learning pack: concepts
covered, how they work, and where you'd actually run into them in the wild.

Think of this folder as your personal coding syllabus, written by the
projects you've actually built rather than a generic course.

## Index

| # | Project | Learning pack | Code |
|---|---------|---------------|------|
| 1 | Wordle clone | [wordle.md](./wordle.md) | [`/wordle`](../wordle) |
| 2 | To-do list | [todo.md](./todo.md) | [`/todo`](../todo) |
| 3 | Fractional PMM website | [fractional-pmm-website.md](./fractional-pmm-website.md) | [`/fractional-pmm-website`](../fractional-pmm-website) |
| 4 | Voice to Text | [voice-to-text.md](./voice-to-text.md) | [`/voice-to-text`](../voice-to-text) |
| 5 | Voice to Text (Mac menu bar app) | [voice-to-text-mac-app.md](./voice-to-text-mac-app.md) | [`/voice-to-text-mac-app`](../voice-to-text-mac-app) |

## Concepts covered so far

A quick-reference list of everything introduced, oldest first. If a concept
shows up again in a later project, we build on it rather than re-explain it
from scratch (see each pack's "New in this project" section for what's
actually new each time).

- Variables: `let` vs `const`
- Functions (declaring and calling them)
- Arrays and loops (`for`, `.forEach`)
- The DOM: `getElementById`, `createElement`, `appendChild`, `classList`
- Events: `addEventListener`, keyboard events, click events
- Objects (grouping related data as key/value pairs)
- Template literals (`` `like ${this}` ``)
- CSS selectors, Flexbox, and Grid
- Algorithm design (Wordle's two-pass letter-matching logic)
- Arrays of objects (modeling real "things" with multiple properties)
- The render-from-data pattern (state drives what's on screen)
- Event delegation (one listener for many dynamic elements)
- Array methods: `.filter()` and `.map()`
- Forms and `event.preventDefault()`
- Responsive/mobile-friendly design (viewport meta tag, `box-sizing`,
  touch target sizing, Grid `fr` units, `aspect-ratio`, `clamp()`,
  proportional Flexbox sizing)
- Semantic HTML5 landmark elements (`header`, `nav`, `main`, `section`,
  `footer`)
- CSS custom properties (variables)
- `position: sticky` and `scroll-behavior: smooth`
- CSS Grid with `repeat(auto-fit, minmax(...))` for responsive layouts
  without media queries
- The `robots` meta tag and what "private" means on a static host
- Browser Web APIs (beyond the DOM) - the Web Speech API
- Feature detection (checking an API exists before using it)
- Promises and `async`/`await`
- Blobs and generating a downloadable file with `URL.createObjectURL`
- The `::placeholder` pseudo-element and `@keyframes` animations
- Swift language basics (optionals, `guard let`, closures) and Xcode
- The delegate pattern (`AppDelegate`)
- Native macOS system permissions (Microphone, Speech Recognition,
  Accessibility, Input Monitoring) beyond the browser sandbox
- Global event monitoring and synthetic keyboard input
