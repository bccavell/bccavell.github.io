# January Visit App: Product Spec

**Owner:** Billy · **Status:** v1 built, waiting on real content · **Ship by:** 27 Dec 2026 (a few days before everyone arrives)

## 1. The idea in one line

A little app my friends put on their phone home screen that holds the month's
plans, a running thread of love notes and photos, and a birthday surprise
that unlocks on the day.

## 2. Who it's for

| Person | What they want from it |
|---|---|
| **The friends (visitors)** | Know what's happening today and this week. Feel welcome and loved. Add their own ideas and notes. |
| **The birthday friend** | A surprise on the day that feels made just for them. |
| **Billy (host and builder)** | One place to plan the month. A sweet gift to give. A real project to learn from. |

## 3. Platform decision: a web app you can install (PWA), not an App Store app

**Decision:** build it as a *Progressive Web App* (PWA) hosted on GitHub Pages
at `bccavell.github.io/january-visit/`.

**Why:**
- **No App Store.** Publishing to Apple's store costs $99 a year and review takes
  days. A PWA is "downloaded" by opening a link and tapping *Add to Home
  Screen*. It then gets its own icon, opens full-screen and works offline.
- **One codebase** covers iPhone, Android and laptop.
- **It uses what Billy already knows:** HTML, CSS and JS, the same as the Wordle
  and To-Do projects.
- **Updates are instant.** Push to GitHub and everyone's app updates. That
  matters when plans change mid-visit.

**What we give up:** iOS push notifications are limited, and there's no
App Store listing. Neither matters for 3 to 5 friends.

## 4. Features

### v1: MVP (built in this PR)

1. **Home / Countdown**
   - Before they arrive: a big countdown (days, hours, minutes) to arrival.
   - During the visit: "Day X of Y together 💛" plus today's plans.
   - After: a "thank you for coming" message.
2. **Plan (the itinerary)**
   - One card per day of the visit, made automatically from the start and end dates.
   - Each day lists events (time, title, place, notes, emoji) taken from `data.js`.
   - Today is highlighted and past days are faded.
   - The birthday is marked with 🎂.
3. **Ideas board**
   - Anyone can add an idea ("Go ice skating!") and heart the ideas they like.
   - Ideas are sorted by hearts, so the plan almost writes itself.
   - Ideas are saved on the device (localStorage).
4. **Love thread** 💌
   - A feed of notes and photos from Billy, written ahead of time in `data.js`.
   - "Open when…" notes stay **sealed** (shown as an envelope) until their unlock date.
   - Friends can post their own notes, which are saved on their device.
5. **Birthday** 🎂
   - Before the day: a countdown to the birthday.
   - On the day (and after): a birthday letter, a photo gallery and confetti.
6. **Installable and offline**
   - A web app manifest (name, icon, colours) plus a service worker that
     caches the app so it opens with no signal, e.g. on the Tube or a plane.
7. **Highlight reels** 🎞️
   - Round bubbles on Home (like Instagram highlights). Tap one to play a
     full-screen photo story with an auto title card, captions, a slow zoom,
     and tap left/right to navigate.
   - First reel: **Highlands Roadtrip**, using photos from Billy's Google Photos album.
8. **Preview mode for Billy**
   - Add `?today=2027-01-15` to the URL to pretend it's a different date.
     This lets Billy test sealed notes and the birthday screen early.

### v2: Nice to have (tickets written, not built)

- **Shared data across phones** (Supabase or Firebase). In v1, ideas and notes
  a friend adds only live on *their* phone. Sharing them needs a small backend.
  This is the biggest v2 item.
- Photo uploads from inside the app (needs the backend too).
- "Add to calendar" button per event (`.ics` download).
- Map links for each place (Google/Apple Maps URL).
- Packing list / "things to bring" checklist (reuses the To-Do project).
- Daily photo challenge ("today: a photo of something blue").
- End-of-trip "memories" recap page built from the love thread.

### Non-goals

- Accounts, logins and passwords.
- An App Store or Play Store listing.
- Strong privacy (see section 7).

## 4b. Shared backend plan (M5)

- **Supabase** (recommended): Postgres database, Storage for photos and
  videos, Auth for magic-link login, and Realtime for live updates. The app
  stays on GitHub Pages and the browser talks to Supabase directly.
- **Stays in `data.js`:** Billy's itinerary, love notes and birthday letter.
- **Moves to Supabase:** ideas, hearts (one per person) and the feed of
  friend posts (text, photo or short video).
- **Security:** Row Level Security means only emails on the `members` guest
  list can read or write. The media bucket is private, which fixes the
  "public photos" concern in section 7.
- **Limits (free plan, check current pricing):** about 1 GB of storage,
  about 50 MB per file, and the project pauses after about a week idle.
  Photos are resized in the browser, and videos are capped at short clips.
- **Pending decisions:** see ticket JV-27.

## 5. Data model (`data.js`)

All content lives in **one file** that Billy edits, kept apart from the app
logic. This is the "config file" pattern.

```js
TRIP      = { title, hostName, friends[], startDate, endDate, city, welcomeMessage }
BIRTHDAY  = { name, date, age?, letter, photos[] }
ITINERARY = [ { date, time, emoji, title, place?, notes? }, ... ]
LOVE_NOTES = [ { from, date, text, photo?, unlockDate? }, ... ]
STARTER_IDEAS = [ "idea", ... ]
```

User-added content (ideas, hearts, friend notes) is stored in `localStorage`
under keys that start with `jv-`.

## 6. Screens and navigation

The app is one page with a **bottom tab bar** of five tabs: Home · Plan ·
Ideas · Love · Birthday. Bottom tabs suit a one-handed phone app, the same
pattern Instagram and Spotify use.

Visual feel: warm, soft and celebratory. A cream background, a coral and
gold accent, rounded cards and emoji everywhere. It supports dark mode.

## 7. Privacy, honestly

GitHub Pages sites are **public**. Anyone with the link can see them.
Mitigations in v1:
- `noindex` tells search engines not to list it, so it's unlisted but not secret.
- Only post photos everyone is happy to have on an unlisted page.
- If that's not OK, v2 can move hosting to something with a password
  (e.g. Netlify or Cloudflare Pages access rules).

## 8. Open questions for Billy

- [ ] Friends' names, and whose birthday it is (plus the date and age, if they'd like it shown)
- [ ] Exact arrival and departure dates
- [ ] City / where we're based
- [ ] Which photos to use (put them in `january-visit/photos/`)
- [ ] Are the friends OK with an unlisted public page holding their photos?

## 9. Milestones

| Milestone | Target | What's in it |
|---|---|---|
| M1: Foundation | ✅ done (this PR) | Spec, tickets, app shell, all 5 tabs, PWA |
| M2: Real content | 1 Dec 2026 | Names, dates, itinerary draft, photos, love notes |
| M3: Polish and test | 15 Dec 2026 | Test on an iPhone and an Android, fix bugs, birthday rehearsal using `?today=` |
| M4: Launch | 27 Dec 2026 | Send the link + "how to install" message to friends |
| M5: Shared backend | 27 Dec 2026 | Supabase: sign-in, shared ideas + hearts, photo/video feed (JV-27 to JV-43) |
| M6 (optional): Extras | During the trip | Photo challenge, memories recap, comments |
