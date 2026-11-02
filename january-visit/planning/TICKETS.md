# January Visit App: Tickets

These are written to drop straight into **Linear**. You can import
[`linear-import.csv`](./linear-import.csv) with *Linear → Settings → Import →
CSV*, or copy them in by hand.

**Suggested Linear setup**
- **Team:** `Billy` (key `BC`) or a dedicated `JV` team
- **Project:** *January Visit App*, target date 27 Dec 2026
- **Milestones:** M1 Foundation · M2 Real content · M3 Polish & test · M4 Launch · M5 Shared backend · M6 Extras
- **Labels:** `feature`, `content`, `design`, `infra`, `learning`, `backend`, `security`, `v2`
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

## M5: Shared backend (Supabase)

**Goal:** ideas, hearts and a photo/video feed that everyone sees on their own
phone, open to invited friends only. **Target:** live by 27 Dec 2026, along
with the launch.

**Why it matters:** right now anything a friend adds is stored only on their
own phone (`localStorage`). This milestone moves it to one shared place.

**Architecture:** the app stays on GitHub Pages. The browser talks directly to
Supabase (Postgres database, Storage, Auth and Realtime), so there's no server
of our own. Billy's love notes, the itinerary and the birthday letter stay in
`data.js`.

**Build order:** JV-27 → 28 → 29/30 → 31/32 → 33 → 34 → 35/36/37 → 38/39/40 → 41/42/43

| ID | Title | Label | Size | Blocked by |
|---|---|---|---|---|
| JV-27 | Decide: backend, login method, video plan | backend | XS | – |
| JV-28 | Create Supabase project + `config.js` | infra | S | 27 |
| JV-29 | Database schema (SQL migration file) | backend | M | 28 |
| JV-30 | Row Level Security: members-only access | security | M | 29 |
| JV-31 | Supabase JS client + `api.js` data layer | infra | S | 28 |
| JV-32 | Magic-link sign-in screen | feature | M | 30, 31 |
| JV-33 | Ideas board on Supabase (1 heart per person) | feature | M | 32 |
| JV-34 | Private `media` storage bucket + policies | security | S | 30 |
| JV-35 | Feed: post a photo (auto-resize before upload) | feature | L | 32, 34 |
| JV-36 | Feed: post a short video (size limit) | feature | M | 35 |
| JV-37 | Feed: display posts (signed URLs, lazy load, paging) | feature | M | 35 |
| JV-38 | Realtime: live updates for ideas + feed | feature | M | 33, 37 |
| JV-39 | Offline: cache last feed, block posting offline | infra | S | 37 |
| JV-40 | Delete your own post / idea | feature | S | 33, 37 |
| JV-41 | Two-phone end-to-end test with test accounts | infra | S | 38, 39, 40 |
| JV-42 | Usage + keep-alive check before the trip | infra | XS | 41 |
| JV-43 | Learning pack: databases, SQL, auth, RLS, async/await | learning | S | 41 |

**JV-27 Decide.** 🟡 Billy. Confirm three things:
(a) Supabase (recommended) or Firebase;
(b) login by magic email link (recommended) or a shared trip code;
(c) videos: short clips on the free plan (recommended) or about $25 for one
month of Pro.
*Done when:* the decisions are written into SPEC.md.

**JV-28 Create Supabase project.** 🟡 Billy creates the free account and
project (EU region, since we're in London) and shares the Project URL and the
**anon/public** key. *Never* share the `service_role` key. Add
`january-visit/config.js` holding the URL and anon key.
*Acceptance:* the app can make a test request and get a response. The anon key
is safe to commit because Row Level Security (JV-30) protects the data. That's
a key concept to understand.

**JV-29 Database schema.** Write `january-visit/supabase/schema.sql` and run it
in the Supabase SQL editor.
- `members (id uuid → auth.users, email unique, display_name, created_at)`: the guest list
- `ideas (id, text ≤120 chars, added_by → members, created_at)`
- `idea_hearts (idea_id → ideas ON DELETE CASCADE, member_id → members, primary key (idea_id, member_id))`
- `posts (id, author → members, caption ≤1000 chars, media_path nullable, media_type 'photo'|'video'|null, created_at)`
- Seed the `STARTER_IDEAS` into `ideas`

*Acceptance:* the tables exist, the file is committed, and it's commented line by line.

**JV-30 Row Level Security.** Turn on RLS for every table. Add a helper
`is_member()` that checks `auth.uid()` is in `members`.
- Members can SELECT everything.
- Members can INSERT rows where they're the author.
- Members can DELETE only their own rows.
- Nobody can UPDATE `members`. Billy adds friends in the dashboard.

*Acceptance:* a request without a login returns 0 rows, a signed-in non-member
gets 0 rows, and a member sees everything. Test each in the SQL editor and note
the results in the PR.

**JV-31 Client + data layer.** Load `@supabase/supabase-js` from a CDN with an
exact, pinned version. Create `api.js` with small functions: `getIdeas()`,
`addIdea()`, `toggleHeart()`, `getPosts()`, `createPost()`, `deletePost()`.
All Supabase calls live only in this file, so `script.js` never touches the
database directly.
*Acceptance:* every function uses `async`/`await` with `try`/`catch` and
returns friendly errors.

**JV-32 Sign-in screen.** First visit: "Enter your email" → magic link →
signed in on that device for good. Show "you're not on the guest list" if the
email isn't in `members`. Add a sign-out option in a small settings menu.
Billy's content (plan, love notes, birthday) stays visible without signing in.
*Acceptance:* it works on iPhone, including when the app was opened from the
home-screen icon. Watch out: magic links open in Safari rather than the
installed app, so test the redirect.

**JV-33 Ideas on Supabase.** Replace the `localStorage` ideas and hearts with
`api.js`. A heart is now a toggle, one per person (enforced by the primary key),
and the count is the number of rows. Show who hearted it, e.g. "♥ 3 · Sam, Alex, Billy".
*Acceptance:* an idea added on phone A shows up on phone B after a refresh.

**JV-34 Storage bucket.** Create a **private** bucket `media` with policies:
members can upload to `posts/<their-user-id>/…`, members can read everything,
and you can delete only your own files.
*Acceptance:* a logged-out request for a file URL fails.

**JV-35 Photo post.** Add a "＋" button to the Love tab that opens a picker
(`<input type="file" accept="image/*,video/*" capture>`). **Resize photos in the
browser** before uploading (a canvas, max 1600px, JPEG at 0.8 quality), so a
5 MB photo becomes about 300 KB. Upload to Storage, then insert a `posts` row.
Show upload progress. Text-only posts are allowed and replace v1's local
friend notes.
*Acceptance:* a photo taken on an iPhone posts in under about 5 seconds on 4G.

**JV-36 Video post.** Accept video files only up to the plan limit (about 50 MB
free). Above that, show "Clip too long – try under 30s at 1080p".
Show a preview before posting.
*Acceptance:* oversized files are rejected *before* uploading, with no wasted data.

**JV-37 Feed display.** Newest first, 20 at a time with "Load more". Media uses
**signed URLs** (temporary links, needed because the bucket is private), images
use `loading="lazy"`, and videos use `controls playsinline preload="metadata"`.
Billy's `LOVE_NOTES` from `data.js` are merged in by date, and sealed notes
still work.
*Acceptance:* the feed is smooth with 100+ posts.

**JV-38 Realtime.** Subscribe to inserts and deletes on `posts`, `ideas` and
`idea_hearts`, so new items appear without refreshing (add a "✨ New post from
Sam" toast).
*Acceptance:* a post from phone A shows on phone B within about 2 seconds.

**JV-39 Offline.** Cache the last-loaded feed and ideas in `localStorage` so
the app still opens on the Tube. When `navigator.onLine` is false, grey out
the Post and Add buttons with "You're offline – try again with signal".
Don't cache Supabase API responses in the service worker.
*Acceptance:* in airplane mode it opens and shows the last feed.

**JV-40 Delete own content.** A ✕ on your own posts and ideas, with a confirm.
Deleting a post also deletes its file from Storage.
*Acceptance:* you can't see a delete option on other people's items, and RLS
blocks it even if someone tries.

**JV-41 End-to-end test.** Use two test accounts on two real phones and run
through: sign in → add idea → heart → post photo → post video → delete →
airplane mode. Then remove the test accounts.

**JV-42 Usage + keep-alive.** Check storage and bandwidth in the Supabase
dashboard. Free projects pause after about a week of no activity, so open the
app on 1 Jan to make sure it's awake. Decide whether to upgrade for January.

**JV-43 Learning pack.** Cover: what a database and SQL are, tables and keys,
auth vs authorisation, RLS, why the anon key can be public, async/await and
Promises, signed URLs, and realtime/websockets.

---

## M6: Extras (optional, during the trip)

| ID | Title | Label | Size |
|---|---|---|---|
| JV-44 | Daily photo challenge (prompt of the day on the feed) | v2 | M |
| JV-45 | End-of-trip "memories" recap page from the feed | v2 | M |
| JV-46 | Packing list (reuse To-Do project code) | v2 | S |
| JV-47 | Comments + emoji reactions on posts | v2 | M |
| JV-48 | Download all photos as a zip after the trip | v2 | S |
