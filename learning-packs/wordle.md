# Learning Pack 1: Wordle Clone

Code: [`/wordle`](../wordle)

## Concepts covered

- Variables: `let` vs `const`
- Functions
- Arrays
- `for` loops (including nested loops)
- The DOM: `getElementById`, `createElement`, `appendChild`, `classList`
- Events: `addEventListener` for keyboard and click events
- Objects (as a simple lookup/counter)
- Template literals
- Regular expressions (a basic one, for checking "is this a single letter")
- CSS: selectors, classes, Flexbox, Grid, transitions
- Algorithm design: a two-pass approach to a tricky problem
- Responsive/mobile-friendly design: the viewport meta tag, `box-sizing`,
  Grid `fr` units, `aspect-ratio`, `clamp()`, and proportional Flexbox
  sizing with `flex: 1`

## Detailed explanations

### `let` vs `const`

`const` means "this variable's value will never be reassigned." `let` means
"I expect to change this later." We used `const` for things like
`WORD_LENGTH` (always 5) and `let` for things like `currentGuess` (changes
every time you type).

**Real world:** this is the same idea as constants in a spreadsheet formula
(a tax rate that never changes) versus a running total (updates every time
you add a row). Companies enforce this in code for the same reason
accountants separate "fixed costs" from "variable costs" — it makes it
obvious at a glance what's allowed to change.

### Arrays

An array is an ordered list. `WORD_LIST` was an array of possible answers;
`result` was an array of five statuses (`correct`/`present`/`absent`).

**Real world:** your Spotify queue is an array of songs. Your Amazon cart is
an array of items. Order matters and you can add, remove, or loop over any
of them — exactly like we did with `WORD_LIST`.

### The DOM and `createElement`

The DOM (Document Object Model) is the browser's live, in-memory
representation of the page. `document.createElement()` + `appendChild()` is
how we built the tile grid entirely from code instead of typing 30 `<div>`
tags by hand.

**Real world:** when your Twitter/X or Instagram feed loads more posts as
you scroll, no one hand-wrote HTML for every possible post — JavaScript is
creating those elements on the fly from data, the same way we built tiles.

### Events (`addEventListener`)

Events are how JavaScript reacts to things happening — a key press, a
click, a page load. We listened for `keydown` on the whole page and `click`
on each keyboard button.

**Real world:** every "Add to Cart" button, every "Like" heart, every login
form submit — all of it is an event listener under the hood, on every
website you use.

### Two-pass algorithm design

The hardest part of Wordle's logic is scoring guesses correctly when a
letter repeats (e.g. guessing "eagle" against the answer "apple" should
only mark one "e", not zero and not two). We solved this with two passes:
first mark exact matches and "use up" that letter, then check leftover
letters for partial matches.

**Real world:** this "reserve exact matches first, then fill in the rest"
approach shows up anywhere you're allocating a limited resource fairly —
think about how an airline assigns confirmed seats before working through a
waitlist. It's also worth knowing the actual NYT Wordle (owned by the New
York Times, who bought the original game from its creator Josh Wardle in
2022) solves this exact same letter-counting problem server-side, so you
just wrote a simplified version of real production logic.

### CSS Grid and Flexbox

Grid arranged the 5×6 tile board into rows and columns. Flexbox centered
content and built flexible rows (like the keyboard).

**Real world:** Grid is what powers most modern page layouts you see day to
day — a product listing page on Amazon, a photo grid on Instagram's profile
page. Flexbox is the go-to tool for things like navigation bars and button
rows, used across virtually every modern website.

### Making it mobile-friendly

This page had the exact same missing-viewport-tag and `box-sizing` issues
covered in the [to-do list pack](./todo.md) — see that one for the full
explanation of those two fixes. Wordle's layout needed a few more tricks on
top, because it uses fixed-size tiles and a multi-row keyboard rather than
a simple form:

- **`fr` units in Grid** — we changed the tile grid from 5 fixed 60px
  columns to `repeat(5, 1fr)`. `fr` means "1 fraction of the available
  space," so the 5 columns always divide up whatever width the board
  actually has, and can never add up to more than 100% of it. A fixed
  pixel width, by contrast, doesn't know or care how wide the screen is.
- **`aspect-ratio: 1 / 1`** — once a tile's width became flexible, we
  needed its height to always match. `aspect-ratio` does that
  automatically, so we don't have to calculate a matching height in
  JavaScript or CSS by hand.
- **`clamp(min, preferred, max)`** — used for the tile and key font
  sizes. It picks a size that scales with the viewport (`vw` = 1% of
  viewport width) but never goes below the `min` or above the `max`. This
  keeps letters legible on a small phone without ever forcing a fixed
  size to overflow.
- **Proportional sizing with `flex: 1`** — every keyboard key grows and
  shrinks to take an equal share of its row's width, so the three
  keyboard rows can never overflow their container on any screen size,
  no matter how many keys they hold. We gave Enter/Backspace `flex: 1.5`
  so they claim a bit more room than a single-letter key, same idea as a
  spacebar being wider than a letter key on a real keyboard.

**Real world:** `fr` units, `clamp()`, and `aspect-ratio` are all
relatively modern CSS features (added within the last several years)
specifically to solve responsive-design problems like this one without
needing a pile of media queries for every screen size. They're widely
supported in current browsers and commonly used together, exactly as we
did here, on production sites that need to work well from a small phone
up to a wide desktop monitor.
