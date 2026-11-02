# Learning Pack 4: January Visit App

Code: [`/january-visit`](../january-visit) · Spec & tickets:
[`/january-visit/planning`](../january-visit/planning)

The first project here that's a real *app*: it installs on a phone, works
offline, remembers things between visits, and changes based on the date.

## New in this project

Everything from [Wordle](./wordle.md), [To-Do](./todo.md) and the
[PMM site](./fractional-pmm-website.md) still applies. That includes the DOM,
events, render-from-data, event delegation, forms, CSS variables, Grid and
responsive design. This project adds:

- **Product process**: a spec, tickets and milestones (working like a real team)
- **The config-file pattern**: content (`data.js`) kept apart from logic (`script.js`)
- **Dates**: the `Date` object, date maths, and the time-zone trap
- **`localStorage` + JSON**: saving data so it survives a reload
- **`try` / `catch`**: handling errors without crashing
- **Timers**: `setInterval` (repeat) vs `setTimeout` (once)
- **Single-page app tabs** with the `hidden` attribute
- **PWAs**: the web app manifest plus a service worker for offline use
- **Promises** (a first look, inside the service worker)
- **`URLSearchParams`**: reading settings from the URL (preview mode)
- **XSS**: why user text goes in with `textContent`, never `innerHTML`
- **CSS**: dark mode (`prefers-color-scheme`), `position: fixed`, safe-area
  insets, `@keyframes` animations, `prefers-reduced-motion`
- **Highlight reels** (Instagram-style stories): `<dialog>` + `showModal()`,
  a tiny "state machine", image preloading, `scroll-snap`, `conic-gradient`,
  the Ken Burns effect, and passing JS values into CSS custom properties
- Smaller bits: the spread operator `...`, `.sort()` with a compare function,
  `padStart`, `.closest()`, `loading="lazy"`, `<figure>`/`<figcaption>`

## Reused from earlier projects

Render-from-data (every tab has a `render…()` function), event delegation
(the tab bar, the ideas list and the notes list each have one listener),
`<form>` + `preventDefault`, arrays of objects, `.filter`/`.map`, `dataset`,
`Math.random` (Wordle → confetti), CSS custom properties (PMM site → dark mode),
`clamp()` and `aspect-ratio`.

## Detailed explanations

### Spec → tickets → code

Before writing code we wrote a [spec](../january-visit/planning/SPEC.md),
which sets out *what* we're building and *why*. Then we wrote
[tickets](../january-visit/planning/TICKETS.md), which are small, checkable
chunks of work, each with "acceptance criteria" that say when it counts as done.

**Analogy:** the spec is the recipe and the tickets are the individual steps
on the recipe card. You don't start cooking by "making dinner". You start by
"chop the onions".

**Real world:** this is exactly how teams work at Linear, Stripe and Spotify.
Linear (the tool you're using) was built specifically around the idea that
small, well-written issues make teams faster.

### The config-file pattern (`data.js`)

All the content (names, dates, plans, notes) lives in `data.js`. All the
behaviour lives in `script.js`. To add a plan you add one line to a list, and
there's no risk of breaking the countdown.

**Analogy:** a restaurant menu vs the kitchen. The manager can change today's
specials on the board without rewiring the ovens.

**Real world:** almost every app separates content from code. Blogs keep posts
in a database, and apps like Duolingo ship lesson content as data that the app
reads, rather than hard-coding each lesson.

### Dates and the time-zone trap

A JavaScript `Date` is secretly just one big number: the milliseconds since
1 Jan 1970. That's why you can subtract two dates to get the gap between them,
then divide by `MS_PER_DAY` to get days.

The trap: `new Date("2027-01-15")` means *midnight in UTC*. For a friend whose
phone is set to New York time, that's 7pm on the 14th, so the birthday would
unlock a day early! `parseDate()` builds the date from numbers instead
(`new Date(2027, 0, 15)`), and that always uses the phone's own time zone.
The second gotcha: **months start at 0** (January = 0).

**Real world:** time-zone bugs are famously common. Calendar apps like Google
Calendar and booking sites like Airbnb have whole teams dealing with this, and
it's why libraries like `date-fns` exist.

### `localStorage` + JSON

`localStorage` is a small notebook the browser keeps for each website. It can
only hold text, so we convert arrays and objects to text with
`JSON.stringify` and back again with `JSON.parse`.

**Important limit:** it lives on *one device*. Your friend's notes are only on
their phone. Sharing between phones needs a server. That's the v2 tickets
(milestone M5, JV-27 to JV-43), where Supabase would act as the shared notebook.

**Analogy:** localStorage is a sticky note on *your* fridge. A server database
is a shared Google Doc.

**Real world:** sites use localStorage for things like "dark mode on" or
draft text. Wordle (the real one, at the NYT) stores your streak in it, which is
why your stats vanish if you switch phones.

### `try` / `catch`

"Try this. If it throws an error, run the `catch` part instead of crashing."
We wrap localStorage in it because private browsing can block storage, and
broken saved text would make `JSON.parse` throw.

### Timers: `setInterval` vs `setTimeout`

- `setInterval(renderHome, 1000)` repeats every second forever, which keeps
  the countdown ticking.
- `setTimeout(() => piece.remove(), 5000)` runs **once** after 5 seconds,
  to tidy away each confetti piece after it has fallen.

### Tabs in a single-page app

All five sections are in the HTML from the start. `showTab()` sets `hidden`
on four of them and removes it from one. No new page loads, so switching tabs
is instant and works offline.

**Real world:** Gmail, Spotify Web and Instagram's website are all single-page
apps. Frameworks like React Router do this same show/hide at a bigger scale.

### PWAs: manifest + service worker

A **Progressive Web App** is a website that can be installed like an app.
It needs two extra files:

1. **`manifest.json`** is the app's ID card: its name, icon, colours, and
   `"display": "standalone"` (open without the browser's address bar).
2. **`sw.js`**, the **service worker**, is a script that runs in the background
   and sits between the app and the internet. Ours uses "network first":
   when online it fetches fresh files *and* saves copies, and when offline it
   serves the saved copies.

**Analogy:** the service worker is a personal assistant who photocopies every
letter you receive. If the post office closes (no signal), they hand you the
copy.

**Real world:** Starbucks' ordering web app, Twitter/X Lite, Pinterest and
Uber's web app are all PWAs. Pinterest reported big jumps in engagement after
switching to one.

### Promises (first look)

Inside `sw.js`, things like `caches.open()` and `fetch()` take time, so
instead of an answer they give back a **Promise**, an IOU that says "a
result is coming". `.then(...)` says what to do when it arrives and `.catch(...)`
says what to do if it fails. We'll go deeper on this (and `async`/`await`)
when v2 talks to a server.

**Analogy:** the buzzer they hand you at a burger place. You don't stand at
the counter waiting. You get on with things and act when it buzzes.

### XSS and `textContent`

Friends can type anything. If someone typed `<img src=x onerror=alert(1)>` and
we inserted it with `innerHTML`, the browser would *run* it. That's cross-site
scripting (XSS). The `el()` helper always uses `textContent`, which shows text
as text. (We tested this. The attack shows up harmlessly on the Ideas board.)

**Real world:** XSS is one of the most common web security bugs. React escapes
text by default for this exact reason, and big sites like Google and Facebook
pay "bug bounties" to people who find XSS holes.

### CSS: dark mode, fixed bars, safe areas, animation

- **Dark mode:** `@media (prefers-color-scheme: dark)` redefines the CSS
  variables, and the whole app re-colours itself. This is the payoff for using
  variables, which the PMM site set up.
- **`position: fixed`** pins the tab bar to the screen. Compare `sticky` on
  the PMM site, which only sticks once you've scrolled to it.
- **`env(safe-area-inset-bottom)`** is the height of the iPhone's home swipe
  bar, so our buttons don't sit underneath it.
- **`@keyframes`** defines the confetti's fall. JS randomises each piece and
  CSS animates it, which is smoother than moving things with JS.
- **`prefers-reduced-motion`**: we skip confetti for people who've turned on
  "Reduce Motion", because motion can make some people feel ill.

### Preview mode (`?today=`)

`URLSearchParams` reads the `?key=value` part of the address. Every part of
the app asks `getNow()` for the time instead of using `new Date()` directly,
so faking the date only needed changing in *one* place.

**Real world:** that's "dependency injection" in miniature. Testers at every
big company fake the clock like this so they don't have to wait until New
Year's Eve to test a New Year feature.

### Highlight reels: `<dialog>`, state machines and preloading

Tap a round bubble on Home and photos play full-screen, one at a time,
like Instagram stories.

- **`<dialog>` + `showModal()`:** a built-in HTML pop-up. You get "sits on
  top of everything", "blocks the page behind it" and "Escape closes it"
  without writing any of that yourself. Its `close` event is where we stop the
  timer, so the timer stops however the viewer was closed.
- **A tiny state machine:** the viewer is only ever in one state, "showing
  slide N". Tapping right, tapping left, or the timer running out just change
  N and redraw. Thinking in states like this keeps tricky UI code from
  turning into spaghetti. **Analogy:** a traffic light. It's always exactly
  one colour, and only specific things move it to the next.
- **`clearTimeout` before every new timer:** without it, quick taps would
  leave several timers running at once and slides would skip by themselves.
  This "forgot to cancel the old timer" bug is very common.
- **Preloading:** `new Image().src = nextPhoto` quietly downloads the next
  photo while you're looking at this one, so it appears instantly.
- **JS → CSS:** `style.setProperty("--slide-ms", ...)` hands the slide length
  to the CSS progress-bar animation, so the bar and the timer always agree.
- **CSS:** `scroll-snap` makes the bubble row settle neatly as you swipe,
  `conic-gradient` draws the colourful ring, and `@keyframes` does the slow
  "Ken Burns" zoom, named after the documentary maker who made it famous.
  Reduced motion turns the zoom off.

**Real world:** Snapchat invented the Stories format in 2013. Instagram,
WhatsApp, Facebook and LinkedIn all copied it, and the tap-left/tap-right
gesture and progress bars you built are the same pattern they use.
