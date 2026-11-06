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
- **The printable welcome card**: QR codes and error correction, SVG,
  `@media print` + `@page`, real-world units (`mm`), and reusing `data.js`
  across two pages (single source of truth)
- **The shared backend (Supabase)**: databases and SQL, tables, keys and
  foreign keys, authentication vs authorisation, Row Level Security, why the
  "anon" key can be public, `async`/`await`, the data-layer and store
  patterns, signed URLs, realtime/WebSockets, debouncing, cursor pagination,
  shrinking photos with `<canvas>`, and vendoring a library
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

### The welcome card: QR codes, SVG and print CSS

`welcome-card.html` is a postcard-sized (A6) card with a QR code that opens
the app. Print it and leave it on the guest bed.

- **QR codes and error correction:** a QR code stores your link *plus*
  backup copies of it. At the "High" level about 30% of the code can be
  covered or scuffed and it still scans. That's why we can put a 💛 over the
  middle. (We checked: it scans with the heart on, both on screen and in
  the printed PDF.) **Analogy:** a group chat where everyone has a copy of
  the plan. Lose a few phones and you still know where you're meeting.
- **SVG:** a picture made of shapes instead of pixels, so it stays sharp at
  any size. That matters a lot for something you print and then scan.
- **Build once, not every time:** `planning/make_qr.py` makes the QR picture
  once and saves it. The page doesn't regenerate it on every visit. You only
  re-run the script if the link changes.
- **`@media print` and `@page`:** CSS that applies only when printing. The
  same page shows a "Print" button and a shadow on screen, while on paper
  it's an edge-to-edge A6 card. `@page { size: 105mm 148mm }` sets the
  paper size. We wrote the numbers out because some browsers ignore the word
  "A6" and quietly use their default paper instead (we hit exactly this bug!).
- **Real-world units:** `mm` in CSS means real millimetres when printed.
- **Single source of truth:** the card loads the *same* `data.js` as the app.
  Change a name once and both update, so they can't drift apart.

**Real world:** restaurants put menu QR codes on tables, airlines use them
for boarding passes, and Spotify and WhatsApp have their own branded QR codes
with a logo in the middle, using the same error-correction trick you used
for the heart.

---

## Part 2: The shared backend (Supabase)

Until now everything lived on one phone. This part makes ideas, hearts
and a photo/video feed **shared** between everyone's phones. Code:
`supabase/schema.sql`, `api.js`, `shared.js`, plus changes in `script.js`.

### What a database is (and SQL)

A database is a set of **tables**, which are like spreadsheets with strict
rules. Columns have fixed types (text, number, date), and the database
*refuses* data that breaks the rules: a 500-character idea, a post with
nothing in it, a heart for an idea that doesn't exist. Even if our JavaScript
has a bug, bad data can't get in.

**SQL** is the language you talk to it in. You say *what* you want
(`select ... from posts order by created_at desc`) and it works out *how*.

**Real world:** Postgres, which Supabase runs on, powers Instagram, Spotify
and Apple's services. SQL is nearly 50 years old and still one of the most
in-demand skills in tech.

### Keys: primary, foreign and combined

- **Primary key:** the column that uniquely identifies a row, like a passport
  number. `members` uses the email.
- **Foreign key:** "this column must match a row in that other table".
  `posts.author_email references members(email)` means a post can never belong
  to someone who isn't on the guest list.
- **Combined primary key:** `idea_hearts` uses `(idea_id, member_email)`
  *together*, so the same person physically can't heart the same idea twice.
  The rule lives in the database, not in our JavaScript.

**Analogy:** a cinema seat is identified by row AND number together. Two
people can't both be sold B7.

### Authentication vs authorisation

- **Authentication** = *who are you?* (the email code proves you own that inbox)
- **Authorisation** = *what are you allowed to do?* (the guest list and the
  RLS rules decide)

You can be authenticated but not authorised: the 🔒 "not on the guest
list" screen is exactly that.

### Row Level Security, and why the anon key can be public

Our app's code is public, so anyone could copy the Supabase address and key
and send requests directly, skipping the app. That's fine, because the
**database** checks every request against **policies** like "members can
read posts" and "you can only delete rows where `author_email` is you". With
RLS on, a table starts as *nobody can do anything*, and each policy opens
one specific door.

The `anon` key is like a building's street address: knowing it gets you to
the door, not through it. The `service_role` key is the master key that
skips RLS, and must never leave the dashboard.

**We tested it** on a real local Postgres. A signed-out visitor and a
stranger both saw 0 rows. Billy couldn't post as Sam, heart twice or upload
into Sam's folder. Sam couldn't delete, edit or add himself to the guest
list. (`schema.sql` explains each policy.)

**Real world:** Supabase's whole security model is RLS. Firebase has
"Security Rules", which work the same way. Leaving these off is behind many
real data leaks, where an app's key was public and the database trusted it.

### async / await

Talking to a server takes time. An `async` function can `await` something
slow ("pause here until the answer arrives") without freezing the app.
`try/catch/finally` works with it: `catch` handles failure, and `finally`
always runs, which we use to re-enable buttons whether a post worked or not.
`Promise.all([a, b])` runs two fetches at the same time and waits for both.

**Analogy:** ordering at a café counter. You don't stand frozen until your
coffee's ready. You get a buzzer (`await`) and carry on.

### Patterns that keep it tidy

- **A data layer (`api.js`):** the *only* file that talks to Supabase. The
  rest of the app calls plain functions like `API.addIdea(text)`. **Analogy:**
  a waiter. You don't walk into the kitchen.
- **Stores (an "adapter" pattern):** `localIdeaStore` and `sharedIdeaStore`
  have *the same functions*, so the drawing code works with either and doesn't
  know which one it has. That's how one app runs in local *or* shared mode.
  **Analogy:** a phone charger. Any plug that fits the socket works.
- **IIFE:** `const API = (() => { ... return {...}; })()` keeps everything
  inside private, and only what's returned is public.
- **Vendoring:** we saved a copy of the Supabase library in `vendor/`, so it
  works offline and can never change version under us.

**Real world:** Shopify, Airbnb and most big apps keep a data layer between
their screens and their servers. It's what lets them swap databases without
rewriting the app.

### Files: storage, signed URLs and shrinking photos

- Big files go in **Storage** (a bucket, like a shared drive folder). The
  `posts` table just stores the file's *path*, like a library catalogue card
  saying which shelf a book is on.
- The bucket is **private**, so photos need **signed URLs**: temporary links
  with a secret signature that expire after an hour. Even if a link leaks, it
  stops working.
- Before uploading, `shrinkPhoto()` draws the photo onto a `<canvas>` at
  1600px and saves it as JPEG at 80% quality. In our test a 224 KB image
  became 19 KB, and a real 5 MB phone photo becomes about 300 KB. That's
  faster, kinder on data, and many more photos fit in the free 1 GB.
- `canvas.toBlob` uses an old *callback* style, so we wrap it in
  `new Promise(...)` to `await` it, a useful trick for older browser features.
- Videos are checked **before** uploading. A 60 MB clip is rejected
  instantly instead of after a wasted upload.

**Real world:** WhatsApp and Instagram both shrink photos on your phone
before sending, which is why they upload so fast. Signed URLs are how
Dropbox and Google Drive share private files.

### Realtime, debouncing and pagination

- **Realtime:** a **WebSocket** is a connection that stays open, so the server
  can *push* "Sam just posted" instead of the app asking every few seconds.
  The database still applies RLS to what it announces.
- **Debouncing:** several changes often arrive together, so we wait 400 ms
  for things to go quiet, then reload once. **Analogy:** a lift waiting a
  moment for more people before closing its doors.
- **Cursor pagination:** the feed loads 20 posts, and "Load older posts" asks
  for "20 older than the oldest one I have". Instagram's infinite scroll works
  the same way.

### Offline, and the `hidden` gotcha

- The last ideas and posts are cached in `localStorage`. If the app opens
  with no signal, it shows those with a "📴 Offline" note, and Post and Add
  are greyed out until the signal returns (the `online`/`offline` events).
- The service worker now only caches **our own** files. Supabase data
  goes straight to the network, so private data never sits in the shared cache.
- **A bug we caught in testing:** the post form should hide when you're
  signed out, but `.note-form { display: flex }` quietly overrode the
  `hidden` attribute. The fix, `[hidden] { display: none !important; }`, is
  a rule many professional stylesheets include for exactly this reason.

### Email: why we needed our own sender

Supabase's free built-in email only sends to people on your Supabase team
(about 2 an hour), to stop spammers abusing it. So sign-in codes go out
through Billy's Gmail using **SMTP**, the standard protocol that sends
every email on the internet. An "app password" lets Supabase send as Billy
without knowing his real password.

### How we tested without a real Supabase

1. **Database rules:** ran `schema.sql` (twice, to prove it's safe to
   re-run) on a local Postgres 16, with small stand-ins for Supabase's
   sign-in and storage pieces, then tried each allowed and forbidden action
   as different people.
2. **The app:** wrote a *fake* Supabase library for the browser test only
   (never shipped) that follows the same rules, then drove the app
   through 39 checks: sign-in, the guest list, hearts, posts, photos, videos,
   live updates, paging, offline and sign-out.

**Real world:** this is called **mocking**: replacing a real service with a
pretend one so you can test your own code quickly and reliably. Almost every
professional test suite does it.
