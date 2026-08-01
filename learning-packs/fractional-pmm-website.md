# Learning Pack 4: Fractional PMM Website

Code: [`/fractional-pmm-website`](../fractional-pmm-website)

Unlike the earlier projects, this one is a real (if stealth-mode) business
site rather than a game or a demo app - so the visible copy reads like an
actual company's homepage, and the teaching happens in the code comments
instead.

## New in this project

Everything from [Wordle](./wordle.md) and [To-Do](./todo.md) still
applies (functions, the DOM, events, CSS selectors, Flexbox, Grid,
responsive design). This project adds:

- Semantic HTML5 landmark elements (`<header>`, `<nav>`, `<main>`,
  `<section>`, `<footer>`)
- CSS custom properties (variables) for a small design system
- `position: sticky` for a header that stays visible while scrolling
- `scroll-behavior: smooth` for animated anchor-link navigation
- CSS Grid with `repeat(auto-fit, minmax(...))` for a responsive card
  layout that reflows without media queries
- The `<meta name="robots">` tag and what "site privacy" actually means
  on a static host like GitHub Pages
- A hamburger-style mobile nav toggle (reusing `classList` + event
  delegation from the to-do app)

## Detailed explanations

### Semantic HTML5 elements

Earlier projects used `<div>` for almost everything, since the pages were
small and simple. This page uses tags that describe *what a section is*,
not just how to position it: `<header>` for the top banner, `<nav>` for
navigation links, `<main>` for the primary content, `<section>` for each
distinct chunk within it, and `<footer>` for the bottom.

**Why it matters:** screen readers (used by blind/low-vision visitors)
announce these landmarks, so someone can jump straight to "navigation" or
"main content" instead of listening through the whole page top to bottom.
It's also just more scannable code for a human reading it later.

**Real world:** every major company's marketing site (Stripe, Linear,
Notion) is built on semantic landmarks like these, partly for
accessibility and partly because search engines and browsers use them to
understand page structure.

### CSS custom properties (variables)

Defined once under `:root` (e.g. `--color-accent: #2f6fed;`) and reused
everywhere with `var(--color-accent)`. Change the value in one place and
every button, link, and highlight that uses it updates together.

**Real world:** this is a small-scale version of what real design systems
do - Stripe's docs, for instance, are built on a defined set of named
colors, spacing values, and type sizes rather than one-off numbers
scattered through the CSS. Naming your values is the first step toward a
"system" instead of a pile of styles.

### `position: sticky`

Three positioning modes are worth knowing: `static` (default - scrolls
away normally), `fixed` (pinned to the screen, ignoring scroll entirely),
and `sticky` (scrolls normally *until* it hits the edge you specify - here
`top: 0` - then sticks there while the rest of the page scrolls past it).
That's what keeps the header visible as you scroll down this one-page
site.

**Real world:** sticky headers/nav bars are everywhere - Gmail's search
bar, most e-commerce sites' "add to cart" bar, and virtually every SaaS
marketing site's top nav.

### `scroll-behavior: smooth`

One line of CSS on `body` makes clicking an anchor link (`<a
href="#pricing">`) glide down to that section instead of jumping
instantly. No JavaScript needed for this - it used to require a scroll
animation library; modern CSS does it natively.

### CSS Grid: `repeat(auto-fit, minmax(220px, 1fr))`

Grid was already used in Wordle and To-Do, but always with a fixed number
of columns. This pattern reads as: "keep adding columns as long as each
one can be at least 220px wide; once they can't fit anymore, wrap to
fewer columns; whatever columns do fit, share the remaining space equally
between them (`1fr` each)." On a wide screen the pricing cards sit in 3-4
columns; on a phone they stack to 1 - automatically, with no media query
needed just for that layout shift.

**Real world:** this exact pattern is the standard way to build
responsive card grids (product grids, pricing tables, blog post grids)
without writing a separate breakpoint for every possible screen width.

### The `robots` meta tag and what "private" really means

`<meta name="robots" content="noindex, nofollow">` politely asks
well-behaved search engine crawlers (Google respects this) not to list
the page in search results or follow its links. Combined with *not*
linking to the page from the public homepage, this keeps the site out of
casual discovery.

**Important caveat:** neither of these makes the page genuinely private.
GitHub Pages serves every file in a public repo to anyone who has (or
guesses) the URL - `noindex` only stops it showing up in search results.
"Unlisted" is the right mental model here, the same way an unlisted
YouTube video works: not searchable, but not access-controlled either. If
real privacy is ever needed (e.g. pricing that shouldn't be public at
all), that requires a private repo or actual authentication - a static
`noindex` tag can't provide it.

### Mobile hamburger nav

The nav links are hidden on narrow screens by default and revealed by
toggling a `.open` class on click - same `classList.toggle()` technique
used for Wordle's tile colors, plus the same event-delegation pattern
from the to-do app (one listener on the parent `<nav>` handles clicks on
any link inside it, rather than attaching a listener per link).

**Real world:** the hamburger-menu-on-mobile pattern is close to
universal on responsive marketing sites - it's the standard answer to
"a full nav bar doesn't fit on a phone screen."

## Real-world relevance

This project is a smaller-scale version of what a real productized
consulting or SaaS marketing site looks like: a sticky nav, a hero with a
single clear value proposition, a pricing table, and a CTA - the same
skeleton used by companies like Linear, Superhuman, or any YC-stage
startup's landing page. The main difference at this stage isn't the code,
it's the amount of real customer research and positioning work that goes
into the copy above it.
