// ============================================================
// JANUARY VISIT - data.js  ✏️  (THIS is the file you edit!)
// ============================================================
// Every name, date, plan, note and photo in the app lives here.
// The app's *logic* lives in script.js, and you should rarely need
// to touch it.
//
// WHY SPLIT IT LIKE THIS?
// This is called the "config file" pattern: keep the CONTENT
// (which changes all the time) apart from the CODE (which mostly
// doesn't). Then adding a new plan is as simple as adding one line
// here, and there's no chance of breaking the countdown by
// accident. Real apps do the same thing. A blog keeps posts in
// a database rather than inside its code, for example.
//
// Because index.html loads this file BEFORE script.js, every
// `const` declared here is available to use inside script.js.
//
// DATE FORMAT: always "YYYY-MM-DD" (e.g. "2027-01-15").
// That order (biggest unit first) also sorts correctly as plain
// text, which is a nice bonus.
//
// 🟡 Everything marked TODO is placeholder content to replace.
// ============================================================


// ------------------------------------------------------------
// The trip itself
// ------------------------------------------------------------
const TRIP = {
  title: "Our January",                 // shown at the top of the app
  hostName: "Billy",
  friends: ["Friend One", "Friend Two"], // TODO: real names
  startDate: "2027-01-03",               // TODO: arrival day
  endDate: "2027-01-31",                 // TODO: departure day
  city: "London",                        // TODO: where you'll be
  welcomeMessage:
    "I can't believe you're actually coming. A whole month together! " +
    "This little app is our home base: plans, ideas, and a lot of love. 💛",
};


// ------------------------------------------------------------
// The birthday 🎂
// ------------------------------------------------------------
const BIRTHDAY = {
  name: "Friend One",   // TODO: whose birthday it is
  date: "2027-01-15",   // TODO: the actual date
  age: null,            // TODO: a number like 30, or leave as null to hide it
  letter:
    "Happy birthday!! I'm so lucky that I get to spend this one with you " +
    "in person. TODO: write the real letter here. Take your time with it. 💛",
  // Photo paths are relative to index.html. Put the files in /photos.
  // Leave the list empty [] and the gallery just won't show.
  photos: [
    // { src: "photos/bday-1.jpg", caption: "That night in 2019" },
  ],
};


// ------------------------------------------------------------
// The plan (itinerary)
// ------------------------------------------------------------
// One object per event. Several events can share a date, and the app
// groups them into the right day card and sorts them by time.
// `place` and `notes` are optional: leave them out if not needed.
const ITINERARY = [
  { date: "2027-01-03", time: "15:00", emoji: "✈️", title: "Airport pickup!", place: "Heathrow T5", notes: "I'll be the one crying at arrivals" },
  { date: "2027-01-03", time: "19:30", emoji: "🍕", title: "Welcome dinner at home" },
  { date: "2027-01-04", time: "11:00", emoji: "☕", title: "Slow brunch + neighbourhood walk" },
  { date: "2027-01-09", time: "10:00", emoji: "⛸️", title: "Ice skating", notes: "TODO: book tickets" },
  { date: "2027-01-15", time: "09:00", emoji: "🥞", title: "Birthday breakfast in bed" },
  { date: "2027-01-15", time: "19:00", emoji: "🎂", title: "Birthday dinner", place: "TODO: restaurant", notes: "It's a surprise 🤫" },
  { date: "2027-01-23", time: "08:30", emoji: "🚆", title: "Day trip", notes: "TODO: Brighton? Bath? Oxford?" },
  { date: "2027-01-31", time: "12:00", emoji: "🥲", title: "Airport drop-off" },
];


// ------------------------------------------------------------
// The love thread 💌
// ------------------------------------------------------------
// `date` = the date the note is "posted" (used for sorting).
// `unlockDate` (optional) = the note stays SEALED until that day.
// That's how "open when..." letters work.
// `photo` (optional) = a path to an image in /photos.
const LOVE_NOTES = [
  {
    from: "Billy",
    date: "2026-12-27",
    text: "The countdown is ON. Clear your calendars, we are doing everything. 🎉",
  },
  {
    from: "Billy",
    date: "2027-01-03",
    unlockDate: "2027-01-03",
    text: "You're here!!! Welcome home. Open the Plan tab, but don't plan too hard, we'll make it up as we go. 💛",
  },
  {
    from: "Billy",
    date: "2027-01-10",
    unlockDate: "2027-01-10",
    text: "One week in. Thank you for being exactly who you are. TODO: write this one.",
  },
  {
    from: "Billy",
    date: "2027-01-31",
    unlockDate: "2027-01-31",
    text: "Open on the plane home. TODO: the tearjerker. 🥹",
  },
];


// ------------------------------------------------------------
// Highlight reels 🎞️
// ------------------------------------------------------------
// These show as round bubbles on the Home tab (like Instagram
// highlights). Tapping one plays its photos full-screen as a
// "story": each photo shows for a few seconds, then moves on.
//
// Each reel automatically starts with a title card made from
// `title`, `subtitle` and `emoji`. You only need to list the photos.
// `cover` is the photo shown in the round bubble. Leave it out and
// the first photo is used.
//
// ⚠️ Shrink photos first (see photos/README.md), and only add ones
// everyone's happy to have on an unlisted page.
const HIGHLIGHT_REELS = [
  {
    title: "Highlands Roadtrip",
    subtitle: "Where it all started 🏔️", // TODO: when was the trip?
    emoji: "🏔️",
    photos: [
      // TODO: add your favourite photos from the Google Photos album, e.g.
      // { src: "photos/highlands/01.jpg", caption: "Glencoe, before the rain" },
      // { src: "photos/highlands/02.jpg", caption: "Car karaoke champions 🎤" },
    ],
  },
];


// ------------------------------------------------------------
// Starter ideas for the Ideas board
// ------------------------------------------------------------
// These show up for everyone. Anything friends add is saved on
// their own phone (see the learning pack for why).
const STARTER_IDEAS = [
  "Go ice skating ⛸️",
  "Karaoke night 🎤",
  "Cook a big dinner together 🍝",
  "Museum day 🖼️",
  "Movie marathon in pyjamas 🍿",
];
