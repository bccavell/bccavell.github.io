# Learning Pack 2: To-Do List

Code: [`/todo`](../todo)

## New in this project

Everything from [Wordle](./wordle.md) still applies (functions, loops, the
DOM, events, CSS). This project adds:

- Arrays of objects (modeling real "things" with multiple properties)
- The render-from-data pattern
- Event delegation
- Array methods: `.filter()` and `.map()`
- Forms and `event.preventDefault()`
- Data attributes (`dataset`)
- Responsive/mobile-friendly design: the viewport meta tag, `box-sizing:
  border-box`, and touch target sizing

## Detailed explanations

### Arrays of objects

Instead of an array of plain values (like Wordle's list of words), `tasks`
is an array of *objects* — each task has multiple properties bundled
together: `id`, `text`, and `completed`.

**Real world:** this is almost exactly how Trello, Asana, or Todoist store
your tasks/cards internally — a list of objects, each with an ID, some
text, and a status. You just built the same core data shape those products
are built on.

### The render-from-data pattern

The rule we followed: never edit the page directly. Instead, change the
`tasks` array, then call `render()` to wipe the list and rebuild it to
match. The page is always just a reflection of the data.

**Real world:** this is the foundational idea behind React (built by Meta,
used by Instagram, Netflix's UI, and Airbnb) and Vue (used by companies
like GitLab). Those frameworks automate the "wipe and rebuild efficiently"
part, but the mental model — data changes, then the UI catches up — is
exactly what you did by hand here. Learning it manually first makes those
frameworks click much faster later.

### Event delegation

Instead of attaching a click listener to every checkbox and delete button
(which get destroyed and recreated every time you add/remove a task), we
attached ONE listener to the parent `<ul>` and used `event.target` to
figure out what was actually clicked.

**Real world:** this matters most at scale. Gmail's inbox or X's (Twitter)
timeline can have thousands of rows — attaching a separate listener to
every single one would be slow and wasteful. Delegating to one parent
listener is the standard approach in real production apps for exactly this
reason.

### `.filter()` and `.map()`

`.filter()` returns a new array with only the items that pass a test (we
used it to remove a deleted task, and to count remaining tasks). `.map()`
returns a new array by transforming every item (we used it to flip one
task's `completed` value while leaving the rest untouched).

**Real world:** these two methods are everywhere in real frontend code —
filtering search results on an Amazon results page, or mapping raw API data
(like a list of Airbnb listings) into on-screen cards. If you search real
company job postings for "frontend engineer," array methods like these are
assumed knowledge.

### Forms and `preventDefault()`

By default, submitting an HTML `<form>` reloads the whole page — the way
the web worked before JavaScript existed. `event.preventDefault()` stops
that so we can handle the submission ourselves, instantly, without a
reload.

**Real world:** every modern login form, checkout form (Shopify), or post
composer (X, LinkedIn) uses this exact technique to feel instant instead of
reloading the page on every submit.

### Data attributes (`dataset`)

We stored each task's `id` directly on its `<li>` element using
`item.dataset.id`, so a later click handler could look up which task was
clicked.

**Real world:** this is a common, simple way to attach an app's data to the
DOM element that represents it, without needing a more complex framework —
useful for small-to-medium projects like this one.

### Making it mobile-friendly

The page looked broken on a phone at first — here's why, and what fixed it:

- **The viewport meta tag** (`<meta name="viewport" content="width=device-width, initial-scale=1.0">`)
  tells the phone's browser "render this page at the phone's actual screen
  width," instead of assuming every site is a ~980px desktop layout and
  zooming the whole thing out to fit. This one tag is missing from an
  enormous number of broken mobile sites — it's usually the first thing to
  check.
- **`box-sizing: border-box`** changes how an element's width is
  calculated, so padding and borders are included INSIDE the width you
  set rather than added on top of it. This avoids surprising overflow on
  narrow screens, and is common enough that many real projects apply it
  to every element right at the top of their CSS, like we did.
- **Touch target sizing** — Apple's and Google's own accessibility
  guidelines both recommend interactive elements be at least 44x44 CSS
  pixels, since a fingertip is far less precise than a mouse pointer. We
  padded out the delete button and enlarged the checkbox to make them
  easy to tap accurately.
- **16px minimum font size on inputs** avoids an iOS Safari quirk where
  the browser auto-zooms the page when you tap into a text input with a
  smaller font — a small detail, but the kind that makes a site feel
  noticeably more polished on a real phone.

**Real world:** this is the exact category of bug commonly filed as
"mobile UX" issues at basically every company with a website. Google also
factors mobile-friendliness into search ranking (it's called
"mobile-first indexing"), so this isn't just cosmetic — it can affect
whether a site shows up well in search results at all.
