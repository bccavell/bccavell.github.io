// ============================================================
// JANUARY VISIT - script.js
// ============================================================
// The app's logic. All the CONTENT comes from data.js (TRIP,
// BIRTHDAY, ITINERARY, LOVE_NOTES, STARTER_IDEAS).
//
// New ideas in this project (building on Wordle + To-Do):
//   1. Dates: working with JavaScript's Date object, countdowns,
//      and the classic time-zone trap.
//   2. localStorage + JSON: saving data so it survives a reload
//      (the "next step" suggested at the end of the To-Do app!).
//   3. setInterval: running code over and over on a timer (the
//      ticking countdown).
//   4. Tabs / single-page app: showing and hiding sections with the
//      `hidden` attribute.
//   5. Service workers (see sw.js): making the app work offline.
//   6. URLSearchParams: reading settings out of the page's URL.
//
// Re-used from before: render-from-data, event delegation, forms +
// preventDefault, arrays of objects, .filter/.map, template literals.
// ============================================================


// ============================================================
// PART 1: Date helpers
// ============================================================

// How many milliseconds are in one day. Written as a multiplication
// so you can SEE where the number comes from (24h × 60m × 60s × 1000ms),
// rather than a mystery number like 86400000. ALL_CAPS is a common
// way of naming a value that never changes (a "constant").
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Turn a "YYYY-MM-DD" string into a Date at MIDNIGHT, LOCAL TIME.
//
// ⚠️ THE TIME-ZONE TRAP: `new Date("2027-01-15")` looks like it
// should work, but JavaScript reads a date-only string as midnight
// in UTC (London winter time). For a friend in New York, UTC
// midnight is 7pm the *day before* their time, so the app would
// show the birthday a day early! Building the Date from separate
// numbers (year, month, day) uses the phone's own time zone instead.
function parseDate(text) {
  // "2027-01-15".split("-") -> ["2027", "01", "15"]
  // .map(Number) turns each piece of text into a real number.
  const parts = text.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  // Gotcha #2: JavaScript months start at 0 (January = 0,
  // December = 11), so we subtract 1. Days start at 1 as normal.
  return new Date(year, month - 1, day);
}

// The opposite: turn a Date back into "YYYY-MM-DD" text. That's
// handy as a simple ID for each day, and easy to compare.
function toDateKey(date) {
  const y = date.getFullYear();
  // padStart(2, "0") turns "1" into "01" so the format stays the same.
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// PREVIEW MODE: add ?today=2027-01-15 to the URL to pretend it's
// that date. This lets you test sealed notes and the birthday
// screen weeks early without waiting for the real day.
//
// URLSearchParams reads the "?key=value" part of a web address.
// For "index.html?today=2027-01-15", .get("today") gives "2027-01-15".
const urlParams = new URLSearchParams(window.location.search);
const previewDate = urlParams.get("today"); // null if it's not in the URL

// "What time is it right now?" Every part of the app asks THIS
// function instead of calling `new Date()` directly. That way, preview
// mode only has to be handled in one place.
function getNow() {
  if (previewDate) {
    const fake = parseDate(previewDate);
    fake.setHours(12); // pretend it's midday on that day
    return fake;
  }
  return new Date();
}

// Today's date at midnight. Comparing midnights avoids weird
// results like "3:00pm today is AFTER today".
function getToday() {
  const now = getNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Whole days from date `a` to date `b` (negative if b is earlier).
// Dates can be subtracted: under the hood each one is just a number
// of milliseconds, so b - a is the gap in milliseconds.
// Why Math.round and not Math.floor? Clocks going forward or back
// make some days 23 or 25 hours long. Rounding still gives the
// right whole number on those days.
function daysBetween(a, b) {
  return Math.round((b - a) / MS_PER_DAY);
}

// Friendly date text like "Fri 15 Jan". toLocaleDateString does the
// hard work of month names etc. "en-GB" means British order
// (day before month).
function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Turns a list of names into nice English:
// ["A"] -> "A", ["A","B"] -> "A & B", ["A","B","C"] -> "A, B & C"
function joinNames(names) {
  if (names.length <= 1) return names.join("");
  // .slice(0, -1) = everything except the last item
  return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
}

// Work these out once at the start, since they never change while
// the app is open.
const tripStart = parseDate(TRIP.startDate);
const tripEnd = parseDate(TRIP.endDate);
const birthday = parseDate(BIRTHDAY.date);
const totalDays = daysBetween(tripStart, tripEnd) + 1; // +1: count both ends


// ============================================================
// PART 2: Saving data with localStorage
// ============================================================
// localStorage is a small notebook the browser keeps for each
// website. Whatever you write in it is still there after closing
// the tab or restarting the phone.
//
// The catch: it can only store TEXT. To save an array or object we
// turn it into text with JSON.stringify, and turn it back with
// JSON.parse when loading. JSON ("JavaScript Object Notation") is
// a text format that looks almost exactly like JS objects and is
// how most of the internet passes data around.
//
// IMPORTANT: localStorage lives on ONE device. A note your friend
// writes on their phone is NOT visible on yours. Sharing between
// phones needs a server (that is milestone M5 in planning/TICKETS.md).

// All our keys start with "jv-" so they can't clash with anything
// else saved on bccavell.github.io (like a future app's data).
function loadData(key, fallback) {
  // try/catch: "try this, and if it throws an error, run the catch
  // part instead of crashing." localStorage can fail (some private
  // browsing modes block it, or the saved text could be broken), and
  // we'd rather fall back to an empty list than show a blank app.
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback; // nothing saved yet
    return JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // If saving fails, the app still works for this visit. It just
    // won't remember. Not worth bothering the user about.
  }
}


// ============================================================
// PART 3: A tiny helper for building HTML elements
// ============================================================
// We create LOTS of elements in this app. Writing
// createElement + className + textContent every single time gets
// repetitive, so this helper does all three in one line.
//
// Why textContent and never innerHTML for text? Friends can type
// their own notes and ideas. If someone typed
// <img src=x onerror=alert(1)> and we put it in with innerHTML, the
// browser would RUN it as code. That's called an XSS attack.
// textContent always shows text as plain text, so it's safe.
function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}


// ============================================================
// PART 4: Tabs
// ============================================================
const tabBar = document.getElementById("tab-bar");
const TAB_NAMES = ["home", "plan", "ideas", "love", "birthday"];

function showTab(name) {
  // Loop over every tab. Show the chosen one and hide the rest.
  TAB_NAMES.forEach((tabName) => {
    const panel = document.getElementById("tab-" + tabName);
    const button = document.getElementById("nav-" + tabName);
    const isActive = tabName === name;

    // `hidden` is a built-in HTML attribute that hides an element.
    // Setting it to true or false from JS shows or hides the section.
    panel.hidden = !isActive;
    button.classList.toggle("active", isActive);
    // aria-current tells screen readers which tab is selected.
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0); // start each tab at the top
  saveData("jv-last-tab", name); // remember it for next time

  // The birthday tab plays confetti when opened (if it's time).
  if (name === "birthday") maybeCelebrate();
}

// Event delegation: one listener on the whole nav bar.
tabBar.addEventListener("click", (event) => {
  // .closest("button") walks UP from what was tapped to the nearest
  // <button>. We need it because tapping the emoji <span> inside a
  // button makes event.target the span, not the button.
  const button = event.target.closest("button");
  if (!button) return;
  showTab(button.dataset.tab);
});


// ============================================================
// PART 5: Home tab (countdown and "Day X of Y")
// ============================================================
const countdownBox = document.getElementById("countdown");
const homeEyebrow = document.getElementById("home-eyebrow");
const homeHeadline = document.getElementById("home-headline");

// Build one "number + label" block of the countdown, e.g. "12 days".
function countdownUnit(number, label) {
  const unit = el("div", "countdown-unit");
  unit.appendChild(el("span", "countdown-number", String(number)));
  unit.appendChild(el("span", "countdown-label", label));
  return unit;
}

function renderHome() {
  const now = getNow();
  const today = getToday();
  const names = joinNames(TRIP.friends);
  countdownBox.innerHTML = ""; // clear it (safe: no user text involved)

  if (today < tripStart) {
    // ---- BEFORE the trip: live countdown ----
    const msLeft = tripStart - now;
    // Break the milliseconds into days, hours and minutes.
    // The % ("remainder") operator gives what's left over after
    // dividing. For example, 50 hours % 24 = 2 hours left after
    // taking out the 2 full days.
    const totalMinutes = Math.floor(msLeft / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    homeEyebrow.textContent = `${names} arrive in`;
    countdownBox.appendChild(countdownUnit(days, days === 1 ? "day" : "days"));
    countdownBox.appendChild(countdownUnit(hours, "hrs"));
    countdownBox.appendChild(countdownUnit(minutes, "mins"));
    homeHeadline.textContent = `${formatDate(tripStart)}. Not that I'm counting 👀`;
  } else if (today <= tripEnd) {
    // ---- DURING the trip ----
    const dayNumber = daysBetween(tripStart, today) + 1;
    homeEyebrow.textContent = "Together in " + TRIP.city;
    countdownBox.appendChild(countdownUnit(dayNumber, `of ${totalDays} days`));

    if (toDateKey(today) === BIRTHDAY.date) {
      homeHeadline.textContent = `It's ${BIRTHDAY.name}'s birthday!!! 🎂 Check the Birthday tab`;
    } else {
      const daysLeft = totalDays - dayNumber;
      homeHeadline.textContent = daysLeft === 0
        ? "Last day 🥲 Let's make it count."
        : `${daysLeft} more ${daysLeft === 1 ? "day" : "days"} of fun 💛`;
    }
  } else {
    // ---- AFTER the trip ----
    homeEyebrow.textContent = "That was";
    countdownBox.appendChild(countdownUnit(totalDays, "days together"));
    homeHeadline.textContent = "Thank you for coming. Come back soon. 💛";
  }
}

// Today's events on the Home tab. This reuses the same event-card
// builder as the Plan tab (see Part 6).
function renderTodayEvents() {
  const container = document.getElementById("today-events");
  const heading = document.getElementById("today-heading");
  container.innerHTML = "";
  const todayKey = toDateKey(getToday());
  const todays = getEventsFor(todayKey);

  // Before the trip, show the FIRST day's plans instead of "today".
  if (getToday() < tripStart) {
    heading.textContent = "First up";
    getEventsFor(TRIP.startDate).forEach((event) => container.appendChild(buildEventCard(event)));
    return;
  }

  heading.textContent = "Today";
  if (todays.length === 0) {
    container.appendChild(el("p", "muted card", "Nothing planned. Perfect day for doing nothing 🛋️"));
  } else {
    todays.forEach((event) => container.appendChild(buildEventCard(event)));
  }
}

// setInterval(fn, ms) runs `fn` again and again, every `ms`
// milliseconds, until the page closes. Every 1000ms (1 second) is
// plenty for a countdown that shows minutes. We fill the page in
// once straight away too, so it isn't blank for that first second.
renderHome();
setInterval(renderHome, 1000);


// ============================================================
// PART 6: Plan tab (one card per day)
// ============================================================

// All itinerary events for one date, sorted by time.
// "09:00" and "19:30" are text, but because they're written
// with zero-padded hours they still sort correctly as text.
function getEventsFor(dateKey) {
  return ITINERARY
    .filter((event) => event.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function buildEventCard(event) {
  const card = el("div", "event");
  card.appendChild(el("span", "event-emoji", event.emoji || "📍"));

  const body = el("div", "event-body");
  body.appendChild(el("p", "event-title", event.title));

  // Build the "time · place" line out of whichever parts exist.
  const metaParts = [event.time];
  if (event.place) metaParts.push(event.place);
  body.appendChild(el("p", "event-meta", metaParts.join(" · ")));

  if (event.notes) body.appendChild(el("p", "event-notes", event.notes));
  card.appendChild(body);
  return card;
}

function renderPlan() {
  const dayList = document.getElementById("day-list");
  dayList.innerHTML = "";
  const today = getToday();

  // Walk through every day of the trip, one at a time. This is a
  // `for` loop over DATES instead of numbers: start at tripStart,
  // and keep going while we haven't passed tripEnd. Each time
  // round, we make the NEXT day by adding 1 to the day-of-month
  // (Date is clever enough to roll 32 Jan over to 1 Feb).
  //
  // `let` (not const) because `day` changes each time round the loop.
  for (let day = new Date(tripStart); day <= tripEnd; day.setDate(day.getDate() + 1)) {
    const key = toDateKey(day);
    const dayNumber = daysBetween(tripStart, day) + 1;

    const card = el("article", "card day-card");
    card.id = "day-" + key; // so "Jump to today" can find it
    if (key === toDateKey(today)) card.classList.add("is-today");
    if (day < today) card.classList.add("is-past");

    const header = el("div", "day-header");
    header.appendChild(el("h3", "", formatDate(day)));
    let tag = "Day " + dayNumber;
    if (key === BIRTHDAY.date) tag = "🎂 " + BIRTHDAY.name + "'s birthday";
    header.appendChild(el("span", "day-tag", tag));
    card.appendChild(header);

    const events = getEventsFor(key);
    if (events.length === 0) {
      card.appendChild(el("p", "muted free-day", "Free day ☁️"));
    } else {
      events.forEach((event) => card.appendChild(buildEventCard(event)));
    }
    dayList.appendChild(card);
  }
}

document.getElementById("jump-today").addEventListener("click", () => {
  const todayCard = document.getElementById("day-" + toDateKey(getToday()));
  if (todayCard) {
    // scrollIntoView scrolls the page until that element is visible.
    todayCard.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert("Today isn't part of the trip (yet!) 🙂");
  }
});


// ============================================================
// PART 7: Ideas board
// ============================================================
// The Ideas board can get its data from TWO places:
//   - LOCAL mode:  saved on this phone only (localStorage)
//   - SHARED mode: saved in Supabase, so everyone sees the same board
//
// Instead of writing the board twice, we use a "STORE": an object
// that holds the data and knows how to change it. Both stores have
// the SAME functions with the SAME names:
//   getIdeas()       -> the current list (right now, no waiting)
//   refresh()        -> fetch the latest list (local: nothing to do)
//   addIdea(text)    heart(idea)    deleteIdea(id)
// The drawing code below only ever talks to `ideaStore`, so it doesn't
// know or care which store it got. Swapping one part for another
// that has the same "shape" is a pattern you'll meet everywhere
// (it's sometimes called an "adapter"). It's like a phone charger:
// any plug that fits the socket works.
//
// Every idea, from either store, looks like:
//   { id, text, count, who: ["Sam"], heartedByMe, canDelete }

// ---- The LOCAL store (phone only) ----
// userIdeas = [{ id, text }]  ideas added on THIS phone
// hearts    = { ideaId: count }  a lookup table: idea id -> heart count
let userIdeas = loadData("jv-ideas", []);
let hearts = loadData("jv-hearts", {});

const localIdeaStore = {
  getIdeas() {
    const starters = STARTER_IDEAS.map((text, index) => ({
      id: "starter-" + index,
      text: text,
      canDelete: false,
    }));
    const mine = userIdeas.map((idea) => ({ ...idea, canDelete: true }));
    // The "..." (spread) unpacks both arrays into one new array, then
    // .map adds the heart info so it matches the shared store's shape.
    return [...starters, ...mine].map((idea) => {
      const count = hearts[idea.id] || 0; // `|| 0`: no count yet means 0
      return { ...idea, count: count, who: [], heartedByMe: count > 0 };
    });
  },
  // `async` so it matches the shared store. Nothing to fetch locally.
  async refresh() {},
  async addIdea(text) {
    userIdeas.push({ id: String(Date.now()), text: text });
    saveData("jv-ideas", userIdeas);
  },
  async heart(idea) {
    // Locally each tap ADDS a heart: pass the phone round to vote!
    hearts[idea.id] = (hearts[idea.id] || 0) + 1;
    saveData("jv-hearts", hearts);
  },
  async deleteIdea(id) {
    userIdeas = userIdeas.filter((idea) => idea.id !== id);
    delete hearts[id]; // `delete` removes a key from an object
    saveData("jv-ideas", userIdeas);
    saveData("jv-hearts", hearts);
  },
};

// Pick the store ONCE. sharedIdeaStore lives in shared.js.
const ideaStore = API.enabled ? sharedIdeaStore : localIdeaStore;

const ideaForm = document.getElementById("idea-form");
const ideaInput = document.getElementById("idea-input");
const ideaList = document.getElementById("idea-list");

// The list as last drawn, so a click can find the idea it belongs to.
let shownIdeas = [];

function renderIdeas() {
  ideaList.innerHTML = "";
  // Most-hearted first. .slice() makes a copy so sorting doesn't
  // shuffle the store's own list.
  shownIdeas = ideaStore.getIdeas().slice().sort((a, b) => b.count - a.count);

  shownIdeas.forEach((idea) => {
    const li = el("li", "card idea");
    const textBox = el("div", "idea-body");
    textBox.appendChild(el("span", "idea-text", idea.text));
    // In shared mode we know WHO hearted it.
    if (idea.who.length > 0) {
      textBox.appendChild(el("span", "idea-who", idea.who.join(", ")));
    }
    li.appendChild(textBox);

    const heartBtn = el("button", "heart-button", `♥ ${idea.count}`);
    heartBtn.type = "button";
    heartBtn.dataset.action = "heart";
    heartBtn.dataset.id = idea.id;
    heartBtn.setAttribute("aria-pressed", String(idea.heartedByMe));
    heartBtn.setAttribute("aria-label", `Heart "${idea.text}" (${idea.count} so far)`);
    if (idea.heartedByMe) heartBtn.classList.add("has-hearts");
    li.appendChild(heartBtn);

    if (idea.canDelete) {
      const deleteBtn = el("button", "delete-button", "✕");
      deleteBtn.type = "button";
      deleteBtn.dataset.action = "delete-idea";
      deleteBtn.dataset.id = idea.id;
      deleteBtn.setAttribute("aria-label", `Delete "${idea.text}"`);
      li.appendChild(deleteBtn);
    }
    ideaList.appendChild(li);
  });
}

// Shows a short message to the user. In shared mode things can
// fail (no signal, etc.), and silently doing nothing is confusing.
// (`showToast` lives in shared.js; the fallback is a simple alert.)
function reportError(error) {
  const message = error.message || String(error);
  if (typeof showToast === "function") {
    showToast("⚠️ " + message);
  } else {
    alert(message);
  }
}

// `async` event handler: lets us `await` the store inside it.
ideaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = ideaInput.value.trim();
  if (text === "") return;
  const button = ideaForm.querySelector("button");
  button.disabled = true; // stop double-submits while we wait
  try {
    await ideaStore.addIdea(text);
    await ideaStore.refresh();
    ideaInput.value = "";
    renderIdeas();
  } catch (error) {
    reportError(error);
  } finally {
    // `finally` runs whether it worked OR failed: always re-enable.
    button.disabled = false;
  }
});

// One listener for every heart and delete button (event delegation).
ideaList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  // dataset values are always text; ids may be numbers (shared) or
  // text (local), so compare them both as text.
  const idea = shownIdeas.find((item) => String(item.id) === button.dataset.id);
  if (!idea) return;

  button.disabled = true;
  try {
    if (button.dataset.action === "heart") {
      await ideaStore.heart(idea);
    } else if (button.dataset.action === "delete-idea") {
      if (!confirm(`Delete "${idea.text}"?`)) return;
      await ideaStore.deleteIdea(idea.id);
    }
    await ideaStore.refresh();
    renderIdeas();
  } catch (error) {
    reportError(error);
  } finally {
    button.disabled = false;
  }
});


// ============================================================
// PART 8: Love thread (Billy's notes + friends' posts)
// ============================================================
// Billy's notes always come from data.js. Friends' posts come from a
// store, the same trick as the Ideas board:
//   - LOCAL mode:  text notes saved on this phone
//   - SHARED mode: text, photo or video posts in Supabase
// Every friend post, from either store, looks like:
//   { id, from, text, createdAt, mediaUrl, mediaType, canDelete }

let myNotes = loadData("jv-notes", []);

const localNoteStore = {
  getPosts() {
    return myNotes.map((note) => ({
      id: note.createdAt, // createdAt doubles as a unique id
      from: note.from,
      text: note.text,
      createdAt: note.createdAt,
      mediaUrl: null,
      mediaType: null,
      canDelete: true,
    }));
  },
  hasMore() { return false; },
  async loadMore() {},
  async refresh() {},
  async addPost(post) {
    myNotes.push({
      from: post.from,
      text: post.text,
      date: toDateKey(getToday()),
      createdAt: Date.now(),
    });
    saveData("jv-notes", myNotes);
  },
  async deletePost(post) {
    myNotes = myNotes.filter((note) => note.createdAt !== post.id);
    saveData("jv-notes", myNotes);
  },
};

const noteStore = API.enabled ? sharedNoteStore : localNoteStore;

const noteForm = document.getElementById("note-form");
const noteFrom = document.getElementById("note-from");
const noteText = document.getElementById("note-text");
const noteList = document.getElementById("note-list");

// Pre-fill the name box with whatever name was used last time, so
// friends only have to type it once (local mode only).
noteFrom.value = loadData("jv-my-name", "");

// The friend posts as last drawn, so a delete click can find its post.
let shownPosts = [];

function renderNotes() {
  noteList.innerHTML = "";
  const today = getToday();
  shownPosts = noteStore.getPosts();

  // Put Billy's notes and the friend posts into ONE list with a
  // shared `sortKey` (milliseconds), so we can sort them together.
  // new Date(x).getTime() turns a date into its millisecond number.
  const allNotes = [
    ...LOVE_NOTES.map((note) => ({
      ...note,
      kind: "billy",
      sortKey: parseDate(note.date).getTime(),
    })),
    ...shownPosts.map((post) => ({
      ...post,
      kind: "friend",
      sortKey: new Date(post.createdAt).getTime(),
    })),
  ];
  allNotes.sort((a, b) => b.sortKey - a.sortKey); // newest first

  allNotes.forEach((note) => {
    // A note is sealed if it has an unlockDate that's still in the future.
    const isSealed = note.unlockDate && parseDate(note.unlockDate) > today;

    if (isSealed) {
      // NOTE: this is a fun seal, not a real lock. The text is still
      // inside data.js for anyone who goes digging in the source
      // code. We just don't put it on the page early.
      const sealed = el("div", "card note sealed");
      sealed.appendChild(el("p", "sealed-icon", "💌"));
      sealed.appendChild(el("p", "note-from", `From ${note.from}`));
      sealed.appendChild(el("p", "muted", `Sealed. Opens ${formatDate(parseDate(note.unlockDate))}`));
      noteList.appendChild(sealed);
      return; // `return` inside forEach skips straight to the next note
    }

    const card = el("div", "card note");
    if (note.kind === "friend") card.classList.add("mine");

    // Billy's notes use `photo`; shared posts use mediaUrl + mediaType.
    const mediaUrl = note.photo || note.mediaUrl;
    if (mediaUrl && note.mediaType === "video") {
      const video = el("video", "note-photo");
      video.src = mediaUrl;
      video.controls = true;
      // playsInline: play inside the card on iPhones instead of
      // jumping to full screen. preload "metadata": only fetch the
      // length and first frame until someone presses play.
      video.playsInline = true;
      video.preload = "metadata";
      card.appendChild(video);
    } else if (mediaUrl) {
      const img = el("img", "note-photo");
      img.src = mediaUrl;
      img.alt = `Photo shared by ${note.from}`;
      // loading="lazy": don't download the image until it's about to
      // scroll into view. This saves data and makes the app open faster.
      img.loading = "lazy";
      card.appendChild(img);
    }

    if (note.text) card.appendChild(el("p", "note-text", note.text));
    const footer = el("div", "note-footer");
    footer.appendChild(el("span", "note-from", `– ${note.from}`));
    footer.appendChild(el("span", "muted", formatDate(new Date(note.sortKey))));

    if (note.kind === "friend" && note.canDelete) {
      const deleteBtn = el("button", "delete-button", "✕");
      deleteBtn.type = "button";
      deleteBtn.dataset.id = note.id;
      deleteBtn.setAttribute("aria-label", "Delete this post");
      footer.appendChild(deleteBtn);
    }
    card.appendChild(footer);
    noteList.appendChild(card);
  });

  // "Load more" appears only when the shared feed has older posts.
  if (noteStore.hasMore()) {
    const more = el("button", "pill-button load-more", "Load older posts");
    more.type = "button";
    more.dataset.action = "load-more";
    noteList.appendChild(more);
  }
}

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  // In shared mode, shared.js handles posting (photos, videos...).
  if (API.enabled) return;

  const from = noteFrom.value.trim();
  const text = noteText.value.trim();
  if (from === "" || text === "") return;
  await noteStore.addPost({ from: from, text: text });
  saveData("jv-my-name", from);
  noteText.value = "";
  renderNotes();
});

noteList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  try {
    if (button.dataset.action === "load-more") {
      button.disabled = true;
      button.textContent = "Loading…";
      await noteStore.loadMore();
    } else if (button.classList.contains("delete-button")) {
      // confirm() pops up an OK/Cancel box and gives back true or false.
      if (!confirm("Delete this post?")) return;
      const post = shownPosts.find((item) => String(item.id) === button.dataset.id);
      if (!post) return;
      button.disabled = true;
      await noteStore.deletePost(post);
      await noteStore.refresh();
    } else {
      return; // a click on something else, like a video's controls
    }
    renderNotes();
  } catch (error) {
    reportError(error);
    renderNotes();
  }
});


// ============================================================
// PART 9: Birthday tab 🎂
// ============================================================
const birthdayBox = document.getElementById("birthday-content");

function renderBirthday() {
  birthdayBox.innerHTML = "";
  const daysToGo = daysBetween(getToday(), birthday);

  if (daysToGo > 0) {
    // ---- Not yet: show a teaser countdown ----
    const card = el("div", "card hero");
    card.appendChild(el("p", "eyebrow", `${BIRTHDAY.name}'s birthday`));
    const countdown = el("div", "countdown");
    countdown.appendChild(countdownUnit(daysToGo, daysToGo === 1 ? "sleep to go" : "sleeps to go"));
    card.appendChild(countdown);
    card.appendChild(el("p", "headline", "Something is waiting here… 🤫 Come back on the day."));
    birthdayBox.appendChild(card);
    return;
  }

  // ---- It's the day (or after) ----
  const hero = el("div", "card hero birthday-hero");
  hero.appendChild(el("p", "big-emoji", "🎂"));
  hero.appendChild(el("h2", "", `Happy birthday, ${BIRTHDAY.name}!`));
  if (BIRTHDAY.age) {
    hero.appendChild(el("p", "headline", `${BIRTHDAY.age} looks good on you ✨`));
  }
  birthdayBox.appendChild(hero);

  const letter = el("div", "card letter");
  letter.appendChild(el("p", "", BIRTHDAY.letter));
  letter.appendChild(el("p", "muted signature", `– ${TRIP.hostName}`));
  birthdayBox.appendChild(letter);

  if (BIRTHDAY.photos.length > 0) {
    const gallery = el("div", "gallery");
    BIRTHDAY.photos.forEach((photo) => {
      // <figure> + <figcaption> is the proper HTML way to pair a
      // picture with its caption.
      const figure = el("figure", "gallery-item");
      const img = el("img");
      img.src = photo.src;
      img.alt = photo.caption || `Photo of ${BIRTHDAY.name}`;
      img.loading = "lazy";
      figure.appendChild(img);
      if (photo.caption) figure.appendChild(el("figcaption", "", photo.caption));
      gallery.appendChild(figure);
    });
    birthdayBox.appendChild(gallery);
  }

  const again = el("button", "pill-button", "More confetti! 🎉");
  again.type = "button";
  again.addEventListener("click", launchConfetti);
  birthdayBox.appendChild(again);
}

// Play confetti the first time the birthday tab opens (on or after
// the day). `let` because it flips from false to true.
let hasCelebrated = false;
function maybeCelebrate() {
  if (hasCelebrated) return;
  if (getToday() < birthday) return;
  hasCelebrated = true;
  launchConfetti();
}

// Confetti = lots of little coloured squares, each given a random
// position, colour, size and speed, which then fall using a CSS
// animation (see @keyframes fall in style.css). JavaScript does the
// random setup and CSS does the actual movement, since CSS
// animations are smoother and cheaper for the phone.
function launchConfetti() {
  // Some people turn on "reduce motion" in their phone settings
  // (motion can make them feel sick). matchMedia lets JS check that
  // setting, and we respect it.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colours = ["#ff7a6b", "#ffc857", "#7bdff2", "#b892ff", "#7ee081"];
  for (let i = 0; i < 120; i++) {
    const piece = el("span", "confetti");
    // Math.random() gives 0 up to (not including) 1, as in Wordle.
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor = colours[Math.floor(Math.random() * colours.length)];
    piece.style.animationDuration = 2 + Math.random() * 2 + "s";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    const size = 6 + Math.random() * 6;
    piece.style.width = size + "px";
    piece.style.height = size * 0.6 + "px";
    document.body.appendChild(piece);
    // setTimeout runs code ONCE after a delay (unlike setInterval).
    // We remove each piece after it has fallen, so hundreds of
    // invisible elements don't pile up on the page.
    setTimeout(() => piece.remove(), 5000);
  }
}


// ============================================================
// PART 9b: Highlight reels 🎞️ (Instagram-style stories)
// ============================================================
// Two pieces:
//   1. A row of round "bubbles" on Home, one per reel.
//   2. A full-screen story viewer (<dialog>) that plays one
//      slide at a time and moves on by itself after a few seconds.
//
// The viewer is a small "state machine". At any moment it's
// in one state: "showing slide N of reel R". Everything it does
// (tap right, tap left, timer runs out) just changes N and redraws.
// That's render-from-data again, with a timer added.

const SLIDE_MS = 4500; // how long each slide shows (4.5 seconds)

const highlightsRow = document.getElementById("highlights");
const story = document.getElementById("story");
const storyProgress = document.getElementById("story-progress");
const storySlide = document.getElementById("story-slide");

// The viewer's state. `let` because all three change as you tap.
let storySlides = [];   // the slides of the reel that's open
let storyIndex = 0;     // which slide is showing
let storyTimer = null;  // the id setTimeout gives back, so we can cancel it

// Turn a reel from data.js into a list of slides. The first slide is
// always a title card, made automatically, so every reel gets a nice
// intro without having to make an image for it.
function buildSlides(reel) {
  const slides = [{ type: "title", reel: reel }];
  reel.photos.forEach((photo) => {
    slides.push({ type: "photo", src: photo.src, caption: photo.caption });
  });
  // No photos yet? Add a friendly placeholder instead of an empty reel.
  if (reel.photos.length === 0) {
    slides.push({ type: "empty" });
  }
  return slides;
}

function renderHighlights() {
  highlightsRow.innerHTML = "";

  HIGHLIGHT_REELS.forEach((reel, index) => {
    const bubble = el("button", "highlight-bubble");
    bubble.type = "button";
    bubble.dataset.reel = index; // remember WHICH reel this bubble opens
    bubble.setAttribute("aria-label", `Play the ${reel.title} highlights`);

    // The circle shows the cover photo if there is one, otherwise the emoji.
    const ring = el("span", "highlight-ring");
    const coverSrc = reel.cover || (reel.photos[0] && reel.photos[0].src);
    if (coverSrc) {
      const img = el("img");
      img.src = coverSrc;
      img.alt = ""; // decorative: the label below already says what it is
      ring.appendChild(img);
    } else {
      ring.appendChild(el("span", "highlight-emoji", reel.emoji || "✨"));
    }
    bubble.appendChild(ring);
    bubble.appendChild(el("span", "highlight-label", reel.title));
    highlightsRow.appendChild(bubble);
  });
}

// Event delegation again: one listener for every bubble.
highlightsRow.addEventListener("click", (event) => {
  const bubble = event.target.closest(".highlight-bubble");
  if (!bubble) return;
  openStory(HIGHLIGHT_REELS[Number(bubble.dataset.reel)]);
});

function openStory(reel) {
  storySlides = buildSlides(reel);
  storyIndex = 0;
  story.showModal(); // show the <dialog> on top of everything
  showSlide();
}

function closeStory() {
  story.close(); // this also fires the "close" event below
}

// Whenever the dialog closes, however that happened (✕ button,
// Escape key, or the last slide finishing), stop the timer.
// Otherwise it would keep ticking in the background.
story.addEventListener("close", () => {
  clearTimeout(storyTimer);
  storySlide.innerHTML = "";
});

function showSlide() {
  // Cancel the previous slide's timer first. Without this, tapping
  // quickly would leave several timers running at once, and slides
  // would start skipping ahead on their own.
  clearTimeout(storyTimer);

  const slide = storySlides[storyIndex];
  storySlide.innerHTML = "";

  if (slide.type === "title") {
    const card = el("div", "story-title-card");
    card.appendChild(el("p", "story-title-emoji", slide.reel.emoji || "✨"));
    card.appendChild(el("h2", "", slide.reel.title));
    if (slide.reel.subtitle) card.appendChild(el("p", "", slide.reel.subtitle));
    storySlide.appendChild(card);
  } else if (slide.type === "empty") {
    const card = el("div", "story-title-card");
    card.appendChild(el("p", "story-title-emoji", "📸"));
    card.appendChild(el("p", "", "Photos coming soon…"));
    storySlide.appendChild(card);
  } else {
    const img = el("img", "story-photo");
    img.src = slide.src;
    img.alt = slide.caption || "Highlight photo";
    storySlide.appendChild(img);
    if (slide.caption) storySlide.appendChild(el("p", "story-caption", slide.caption));
  }

  // PRELOADING: start downloading the NEXT photo now, while this
  // one is on screen. `new Image()` makes an image that's never shown;
  // setting its src makes the browser fetch and remember the file.
  // That way the next slide appears instantly instead of loading.
  const upcoming = storySlides[storyIndex + 1];
  if (upcoming && upcoming.type === "photo") {
    new Image().src = upcoming.src;
  }

  renderProgress();
  storyTimer = setTimeout(goForward, SLIDE_MS);
}

// The thin bars along the top: one per slide. Bars before the
// current slide are full, the current one fills up (a CSS animation
// lasting SLIDE_MS), and later ones are empty.
function renderProgress() {
  storyProgress.innerHTML = "";
  storySlides.forEach((slide, index) => {
    const bar = el("span", "story-bar");
    const fill = el("span", "story-bar-fill");
    if (index < storyIndex) fill.classList.add("done");
    if (index === storyIndex) {
      fill.classList.add("playing");
      // Pass the JS number into CSS as a custom property, so the
      // animation's length always matches SLIDE_MS above.
      fill.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    }
    bar.appendChild(fill);
    storyProgress.appendChild(bar);
  });
}

function goForward() {
  if (storyIndex < storySlides.length - 1) {
    storyIndex = storyIndex + 1;
    showSlide();
  } else {
    closeStory(); // finished the last slide
  }
}

function goBack() {
  // Math.max stops us going below 0. On the first slide, "back"
  // just restarts that slide.
  storyIndex = Math.max(0, storyIndex - 1);
  showSlide();
}

// Tap the left third of the screen to go back, anywhere else to go
// forward. This is the same gesture Instagram and Snapchat use.
story.addEventListener("click", (event) => {
  if (event.target.closest(".story-close")) {
    closeStory();
    return;
  }
  // getBoundingClientRect() gives an element's position and size on
  // screen, so we can work out where the tap landed within it.
  const box = story.getBoundingClientRect();
  const tapX = event.clientX - box.left;
  if (tapX < box.width / 3) {
    goBack();
  } else {
    goForward();
  }
});


// ============================================================
// PART 10: Start the app
// ============================================================
document.getElementById("app-title").textContent = TRIP.title;
document.getElementById("app-subtitle").textContent =
  `${TRIP.hostName} + ${joinNames(TRIP.friends)} · ${TRIP.city}` +
  (previewDate ? ` · 🔍 previewing ${previewDate}` : "");
document.getElementById("welcome-message").textContent = TRIP.welcomeMessage;
document.getElementById("host-name").textContent = TRIP.hostName;

renderTodayEvents();
renderPlan();
renderIdeas();
renderNotes();
renderBirthday();
renderHighlights();

// Shared mode (Supabase details filled in, in config.js)? Then
// start sign-in, loading and live updates. See shared.js.
if (API.enabled) {
  startSharedMode();
}

// Which tab to start on? On the birthday itself, always open the
// birthday tab (surprise!). Otherwise reopen the last tab used, or
// Home if there isn't one saved.
const savedTab = loadData("jv-last-tab", "home");
if (toDateKey(getToday()) === BIRTHDAY.date) {
  showTab("birthday");
} else if (TAB_NAMES.includes(savedTab)) {
  showTab(savedTab);
} else {
  showTab("home");
}


// ============================================================
// PART 11: Register the service worker (offline support)
// ============================================================
// "Feature detection": check that the browser SUPPORTS service
// workers before using them. Very old browsers don't, and this way
// the app still works there, just without offline mode.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
