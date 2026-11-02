# January Visit App: Tickets

These are written to drop straight into **Linear**. You can import
[`linear-import.csv`](./linear-import.csv) with *Linear → Settings → Import →
CSV*, or copy them in by hand.

**Suggested Linear setup**
- **Team:** `Billy` (key `BC`) or a dedicated `JV` team
- **Project:** *January Visit App*, target date 27 Dec 2026
- **Milestones:** M1 Foundation · M2 Real content · M3 Polish & test · M4 Launch · M5 v2 sharing
- **Labels:** `feature`, `content`, `design`, `infra`, `learning`, `v2`
- **Estimates:** T-shirt sizes (XS/S/M/L), which are simpler than points while learning
- **Workflow:** Backlog → Todo → In Progress → In Review (PR open) → Done
- Put the Linear ID in the branch name (e.g. `bc-12-birthday-tab`) and Linear
  will link the PR automatically once the GitHub integration is on.

Status key: ✅ done in the first PR · 🟡 needs Billy · ⬜ to do

---

## M1: Foundation

| ID | Title | Label | Size | Status |
|---|---|---|---|---|
| JV-1 | Write product spec | design | S | ✅ |
| JV-2 | App shell + bottom tab navigation | feature | M | ✅ |
| JV-3 | `data.js` content file (config pattern) | infra | S | ✅ |
| JV-4 | Home: countdown / day X of Y / after-trip states | feature | M | ✅ |
| JV-5 | Plan: auto-generated day cards from itinerary | feature | M | ✅ |
| JV-6 | Ideas board with hearts (localStorage) | feature | M | ✅ |
| JV-7 | Love thread with sealed "open when" notes | feature | L | ✅ |
| JV-8 | Birthday tab: countdown → letter, gallery, confetti | feature | M | ✅ |
| JV-9 | PWA: manifest, icons, service worker, offline | infra | M | ✅ |
| JV-10 | `?today=` preview mode for testing dates | infra | XS | ✅ |
| JV-11 | Learning pack for this project | learning | S | ✅ |

**JV-2 App shell + tabs.** *Acceptance:* five tabs (Home, Plan, Ideas, Love,
Birthday) along the bottom. Tapping one shows its section and hides the
others. The last tab used is remembered on reload. Works at 320px wide.

**JV-4 Home.** *Acceptance:* before `startDate` it shows a live
days/hours/minutes countdown. Between the start and end dates it shows "Day X
of Y" plus today's events. After the end date it shows a thank-you.

**JV-5 Plan.** *Acceptance:* one card per date from start to end, inclusive,
with events sorted by time. Today is highlighted, past days are faded and the
birthday has 🎂. A "Jump to today" button scrolls to today's card.

**JV-6 Ideas.** *Acceptance:* add an idea through a form. Each tap on ♥ adds
a heart, so people can pass the phone round to vote. Ideas you added can be
deleted. The list is sorted by hearts and survives a reload. User text is
inserted with `textContent` (no XSS).

**JV-7 Love thread.** *Acceptance:* notes from `data.js` show newest first.
Notes with a future `unlockDate` show as a sealed envelope with the "opens on"
date. Friends can add a note with their name, which is stored locally.

**JV-8 Birthday.** *Acceptance:* before the day it shows a countdown. On the
day or after, it shows the letter, the photos and confetti, and the confetti
plays only once per visit to the tab.

**JV-9 PWA.** *Acceptance:* Chrome shows an "Install" option and iOS "Add to
Home Screen" uses the custom icon. The app opens with no network after the
first visit.

---

## M2: Real content 🟡 (Billy)

| ID | Title | Label | Size |
|---|---|---|---|
| JV-12 | Fill in names, dates, city in `TRIP` | content | XS |
| JV-13 | Fill in `BIRTHDAY` (who, date, letter) | content | S |
| JV-14 | Draft the itinerary (at least 1 thing per weekend) | content | M |
| JV-15 | Pick and resize photos into `photos/` (max ~1600px wide, under 500KB each) | content | S |
| JV-16 | Write 10+ love notes, incl. ~5 "open when…" sealed ones | content | M |
| JV-17 | Ask friends if they're OK with an unlisted page holding their photos | content | XS |

---

## M3: Polish & test

| ID | Title | Label | Size |
|---|---|---|---|
| JV-18 | Test install + offline on iPhone (Safari) | infra | S |
| JV-19 | Test install + offline on Android (Chrome) | infra | S |
| JV-20 | Birthday rehearsal: walk through with `?today=<birthday>` | infra | XS |
| JV-21 | Accessibility pass: colour contrast, alt text on every photo | design | S |
| JV-22 | Add a map link to events that have a `place` | feature | S |
| JV-23 | "Add to calendar" (.ics) button per event | feature | M |

**JV-22 Map links.** Build `https://maps.google.com/?q=` + `encodeURIComponent(place)`.
This is a good first solo ticket.

**JV-23 .ics export.** Make a text file in the iCalendar format and download
it using a `Blob` and a temporary `<a download>` link.

---

## M4: Launch

| ID | Title | Label | Size |
|---|---|---|---|
| JV-24 | Write the "how to install" message for friends | content | XS |
| JV-25 | Merge to `main`, check the live URL on GitHub Pages | infra | XS |
| JV-26 | Send it! 💌 | content | XS |

**JV-24 install message (draft):**
> Open bccavell.github.io/january-visit on your phone.
> iPhone: tap Share → *Add to Home Screen*. Android: tap ⋮ → *Install app*.

---

## M5: v2 sharing (optional)

| ID | Title | Label | Size |
|---|---|---|---|
| JV-27 | Choose backend: Supabase vs Firebase (spike) | v2 | S |
| JV-28 | Shared ideas + hearts across phones | v2 | L |
| JV-29 | Shared love thread across phones | v2 | L |
| JV-30 | Upload photos from the app | v2 | L |
| JV-31 | Daily photo challenge | v2 | M |
| JV-32 | End-of-trip "memories" recap page | v2 | M |
| JV-33 | Packing list (reuse To-Do project code) | v2 | S |

**JV-27 spike.** Both have a free tier that's plenty for 5 people. Supabase is
a normal SQL database, which is a good thing to learn. Firebase has easier
real-time updates. Recommend **Supabase**.
