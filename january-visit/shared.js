// ============================================================
// JANUARY VISIT - shared.js (everything for SHARED mode)
// ============================================================
// Only does anything when config.js has Supabase details filled in.
// It adds:
//   1. Sign-in: email -> 6-digit code (or magic link) -> you're in
//   2. The SHARED stores for the Ideas board and the feed (the same
//      shape as the local stores in script.js, see PART 7 there)
//   3. Posting photos (shrunk first) and short videos
//   4. Live updates: new posts and hearts appear without refreshing
//   5. Offline: shows the last thing it loaded when there's no signal
//
// LOAD ORDER: this file loads BEFORE script.js (see index.html),
// because script.js needs sharedIdeaStore and sharedNoteStore to
// exist when it picks its stores. In return, anything in here that
// uses script.js's helpers (el, renderIdeas, ...) only does so INSIDE
// functions that run later, by which time script.js has loaded.
// ============================================================

const FEED_PAGE_SIZE = 20;

// Which state shared mode is in. Exactly one of:
//   "checking"   - working out who you are
//   "signed-out" - nobody signed in on this phone
//   "not-member" - signed in, but the email isn't on the guest list
//   "member"     - all good!
// (The same "state machine" idea as the highlight reel viewer.)
let sharedStatus = "checking";
let currentEmail = null;     // whose data is on screen
let pendingEmail = null;     // email typed in step 1 of sign-in
let liveChannel = null;      // the realtime connection

// ------------------------------------------------------------
// A small offline cache (localStorage), separate from script.js's
// helpers because this file loads first.
// ------------------------------------------------------------
function readCache(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}
function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage full or blocked: the app still works, just not offline.
  }
}
function clearCache() {
  ["jv-cache-ideas", "jv-cache-posts", "jv-cache-member"].forEach((key) => {
    try { localStorage.removeItem(key); } catch (error) {}
  });
}


// ============================================================
// 1. The SHARED stores (same shape as the local ones in script.js)
// ============================================================
const sharedIdeaStore = {
  ideas: readCache("jv-cache-ideas", []),

  getIdeas() {
    return sharedStatus === "member" ? this.ideas : [];
  },
  async refresh() {
    this.ideas = await API.getIdeas();
    writeCache("jv-cache-ideas", this.ideas);
  },
  async addIdea(text) {
    await API.addIdea(text);
  },
  async heart(idea) {
    await API.toggleHeart(idea); // one heart per person: tap again to undo
  },
  async deleteIdea(id) {
    await API.deleteIdea(id);
  },
};

const sharedNoteStore = {
  posts: readCache("jv-cache-posts", []),
  more: false,

  getPosts() {
    return sharedStatus === "member" ? this.posts : [];
  },
  hasMore() {
    return sharedStatus === "member" && this.more;
  },
  // Reload from the newest post. If you'd already loaded older pages,
  // reload that many, so the list doesn't suddenly shrink.
  async refresh() {
    const size = Math.max(FEED_PAGE_SIZE, this.posts.length);
    const page = await API.getPosts({ pageSize: size });
    this.posts = page.posts;
    this.more = page.hasMore;
    // Only cache the first page, since localStorage is small (about 5 MB).
    writeCache("jv-cache-posts", this.posts.slice(0, FEED_PAGE_SIZE));
  },
  async loadMore() {
    const oldest = this.posts[this.posts.length - 1];
    const page = await API.getPosts({
      pageSize: FEED_PAGE_SIZE,
      before: oldest ? oldest.createdAt : null,
    });
    this.posts = [...this.posts, ...page.posts];
    this.more = page.hasMore;
  },
  async deletePost(post) {
    await API.deletePost(post);
  },
};


// ============================================================
// 2. Toasts: small pop-up messages at the bottom of the screen
// ============================================================
function showToast(message) {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    // role="status": screen readers announce new messages politely.
    region.setAttribute("role", "status");
    document.body.appendChild(region);
  }
  // Keep at most 2 on screen: if a third arrives, drop the oldest.
  while (region.children.length >= 2) region.firstChild.remove();
  const toast = el("div", "toast", message);
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}


// ============================================================
// 3. Sign-in screens ("gates")
// ============================================================
// The Ideas tab and the friends' part of the Love tab are "gated":
// until you're signed in AND on the guest list, a card appears
// instead. Billy's own content (plan, love notes, birthday) never
// needs a sign-in.
const ideasGate = document.getElementById("ideas-gate");
const ideasContent = document.getElementById("ideas-content");
const loveGate = document.getElementById("love-gate");
const accountBar = document.getElementById("account-bar");

function buildGateCard() {
  const card = el("div", "card gate");

  if (sharedStatus === "checking") {
    card.appendChild(el("p", "muted", "Loading… ⏳"));
    return card;
  }

  if (sharedStatus === "not-member") {
    card.appendChild(el("p", "gate-emoji", "🔒"));
    card.appendChild(el("p", "", `You're signed in as ${currentEmail}, but that email isn't on the guest list yet.`));
    card.appendChild(el("p", "muted", "Ask Billy to add you, or sign in with a different email."));
    card.appendChild(buildSignOutButton());
    return card;
  }

  // Signed out: step 1 (email) or step 2 (code).
  card.appendChild(el("p", "gate-emoji", "💌"));
  const form = el("form", "gate-form");

  if (!pendingEmail) {
    card.appendChild(el("h3", "", "Join the trip"));
    card.appendChild(el("p", "muted", "Sign in to share ideas, photos and videos with everyone."));
    const input = el("input");
    input.type = "email";
    input.name = "email";
    input.required = true;
    input.placeholder = "Your email";
    input.autocomplete = "email";
    form.appendChild(input);
    form.appendChild(buttonWithText("Send me a code", "submit"));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await runWithButton(form, async () => {
        await API.sendCode(input.value);
        pendingEmail = input.value.trim().toLowerCase();
        renderSharedUI();
      });
    });
  } else {
    card.appendChild(el("h3", "", "Check your email 📬"));
    card.appendChild(el("p", "muted", `We sent a code to ${pendingEmail}. Type it here, or tap the link in the email.`));
    const input = el("input");
    input.type = "text";
    input.name = "code";
    input.required = true;
    // inputmode="numeric" shows the number keypad on phones, and
    // autocomplete="one-time-code" lets iPhones offer to paste the
    // code straight from the email/message.
    input.inputMode = "numeric";
    input.autocomplete = "one-time-code";
    input.pattern = "[0-9]{6,10}";
    input.placeholder = "123456";
    form.appendChild(input);
    form.appendChild(buttonWithText("Sign in", "submit"));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await runWithButton(form, async () => {
        await API.verifyCode(pendingEmail, input.value);
        pendingEmail = null;
        await handleSessionChange();
      });
    });
    const back = buttonWithText("Use a different email", "button");
    back.className = "link-button";
    back.addEventListener("click", () => {
      pendingEmail = null;
      renderSharedUI();
    });
    card.appendChild(form);
    card.appendChild(back);
    return card;
  }
  card.appendChild(form);
  return card;
}

function buttonWithText(text, type) {
  const button = el("button", "", text);
  button.type = type;
  return button;
}

function buildSignOutButton() {
  const button = buttonWithText("Sign out", "button");
  button.className = "link-button";
  button.addEventListener("click", async () => {
    if (!confirm("Sign out on this phone?")) return;
    await API.signOut();
    clearCache();
    await handleSessionChange();
  });
  return button;
}

// Disable a form's button while some slow `job` runs, show any error,
// then re-enable it. Saves repeating try/catch/finally everywhere.
async function runWithButton(form, job) {
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await job();
  } catch (error) {
    showToast("⚠️ " + (error.message || error));
  } finally {
    button.disabled = false;
  }
}

// Show or hide everything that depends on sign-in.
function renderSharedUI() {
  const isMember = sharedStatus === "member";

  // The `hidden` attribute again, like the tabs.
  ideasContent.hidden = !isMember;
  noteForm.hidden = !isMember;

  ideasGate.innerHTML = "";
  loveGate.innerHTML = "";
  if (!isMember) {
    // Two separate cards (an element can only be in one place at once).
    ideasGate.appendChild(buildGateCard());
    loveGate.appendChild(buildGateCard());
  }

  accountBar.innerHTML = "";
  accountBar.hidden = !currentEmail;
  if (currentEmail) {
    const name = isMember ? API.nameFor(currentEmail) : currentEmail;
    accountBar.appendChild(el("span", "", `Signed in as ${name} · `));
    accountBar.appendChild(buildSignOutButton());
  }

  renderComposerState();
}


// ============================================================
// 4. Who's signed in? (runs at start-up and after sign in/out)
// ============================================================
async function handleSessionChange() {
  const email = API.myEmail();

  // Stop listening for live updates for the previous person.
  API.unsubscribe(liveChannel);
  liveChannel = null;
  currentEmail = email;

  if (!email) {
    sharedStatus = "signed-out";
    sharedIdeaStore.ideas = [];
    sharedNoteStore.posts = [];
    renderAll();
    return;
  }

  sharedStatus = "checking";
  renderSharedUI();

  try {
    const isMember = await API.amIMember();
    if (!isMember) {
      sharedStatus = "not-member";
      renderAll();
      return;
    }
    await API.loadMembers();
    sharedStatus = "member";
    writeCache("jv-cache-member", email);
    // Promise.all runs both fetches AT THE SAME TIME and waits for
    // both to finish. That's faster than one after the other.
    await Promise.all([sharedIdeaStore.refresh(), sharedNoteStore.refresh()]);
    liveChannel = API.subscribe(handleLiveChange);
  } catch (error) {
    // Probably offline. If this person was a member last time, show
    // what we saved, so the app is still useful on the Tube.
    if (readCache("jv-cache-member", null) === email) {
      sharedStatus = "member";
      showToast("📴 Offline: showing what was saved last time.");
    } else {
      sharedStatus = "signed-out";
      showToast("⚠️ " + (error.message || error));
    }
  }
  renderAll();
}

function renderAll() {
  renderSharedUI();
  renderIdeas();
  renderNotes();
}


// ============================================================
// 5. Live updates
// ============================================================
// Every change anyone makes arrives here. Several changes often
// arrive at once (e.g. a post + a heart), so instead of reloading
// for each one we wait a moment and reload once. Waiting for things
// to go quiet before acting is called "debouncing", the same idea as
// a lift waiting a few seconds for more people before the doors close.
let refreshTimer = null;
let tablesToRefresh = new Set(); // a Set is a list with no duplicates

function handleLiveChange(table, payload) {
  // A friendly heads-up when SOMEONE ELSE posts.
  if (
    table === "posts" &&
    payload.eventType === "INSERT" &&
    payload.new.author_email !== API.myEmail()
  ) {
    showToast(`✨ New post from ${API.nameFor(payload.new.author_email)}`);
  }

  tablesToRefresh.add(table);
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    const tables = tablesToRefresh;
    tablesToRefresh = new Set();
    try {
      if (tables.has("ideas") || tables.has("idea_hearts")) {
        await sharedIdeaStore.refresh();
        renderIdeas();
      }
      if (tables.has("posts")) {
        await sharedNoteStore.refresh();
        renderNotes();
      }
    } catch (error) {
      // A missed live update isn't worth an error message. The next
      // one (or reopening the app) will catch up.
    }
  }, 400);
}


// ============================================================
// 6. Posting photos and videos
// ============================================================
const noteFile = document.getElementById("note-file");
const notePreview = document.getElementById("note-preview");
const noteStatus = document.getElementById("note-status");
const noteSubmit = document.getElementById("note-submit");

let chosenFile = null;   // the File they picked
let previewUrl = null;   // a temporary local link to show it

const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Runs when they pick a file. (Attached in startSharedMode below.)
function handleFilePicked() {
  const file = noteFile.files[0];
  clearChosenFile();
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const isVideo = VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    showToast("⚠️ That kind of file isn't supported. Try a photo or an MP4/MOV video.");
    noteFile.value = "";
    return;
  }
  // Check videos BEFORE uploading, so nobody waits for 200 MB to
  // upload only to be told it's too big (and wastes their data).
  if (isVideo && file.size > API.MAX_UPLOAD_BYTES) {
    const mb = Math.round(file.size / (1024 * 1024));
    showToast(`⚠️ That clip is ${mb} MB (max 50). Try under 30 seconds, recorded at 1080p.`);
    noteFile.value = "";
    return;
  }

  chosenFile = file;
  // URL.createObjectURL makes a temporary link to a file that's still
  // only on this phone, so we can preview it before uploading anything.
  previewUrl = URL.createObjectURL(file);
  const preview = el(isVideo ? "video" : "img", "preview-media");
  preview.src = previewUrl;
  if (isVideo) {
    preview.controls = true;
    preview.playsInline = true;
    preview.muted = true;
  } else {
    preview.alt = "Preview of your photo";
  }
  notePreview.appendChild(preview);

  const remove = buttonWithText("✕ Remove", "button");
  remove.className = "link-button";
  remove.addEventListener("click", clearChosenFile);
  notePreview.appendChild(remove);
}

function clearChosenFile() {
  chosenFile = null;
  noteFile.value = "";
  notePreview.innerHTML = "";
  // Temporary links use memory until we say we're done with them.
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
}

// Shrink a photo before uploading: a phone photo is often 3-8 MB, and
// we only need about 1600px for a phone screen. That's ~300 KB:
// quicker to upload, kinder to everyone's data, and it fits far more
// photos into the free 1 GB of storage.
async function shrinkPhoto(file) {
  // createImageBitmap decodes the photo. imageOrientation "from-image"
  // respects the "this photo was taken sideways" flag phones add.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const MAX = 1600;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  // A <canvas> is a blank picture we can draw on with JavaScript.
  // We draw the photo onto it, smaller, then save the canvas as a JPEG.
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  // canvas.toBlob uses an older "callback" style instead of returning
  // a Promise. Wrapping it in `new Promise(...)` lets us `await` it
  // like everything else, a handy trick for older browser features.
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that photo."))),
      "image/jpeg",
      0.8 // quality: 80% looks the same to the eye and is much smaller
    );
  });
}

// Runs when they press Post. (Attached in startSharedMode below.)
async function handlePostSubmit(event) {
  event.preventDefault();

  const caption = noteText.value.trim();
  if (!caption && !chosenFile) {
    showToast("Write something or add a photo first 🙂");
    return;
  }
  if (!navigator.onLine) {
    showToast("📴 You're offline. Try again when you have signal.");
    return;
  }

  noteSubmit.disabled = true;
  try {
    let file = null;
    let mediaType = null;
    if (chosenFile) {
      if (chosenFile.type.startsWith("image/")) {
        noteStatus.textContent = "Shrinking photo…";
        try {
          file = await shrinkPhoto(chosenFile);
        } catch (error) {
          file = chosenFile; // couldn't shrink it, so upload the original
        }
        mediaType = "photo";
      } else {
        file = chosenFile;
        mediaType = "video";
      }
      noteStatus.textContent = mediaType === "video" ? "Uploading video… 🎬" : "Uploading photo… 📸";
    } else {
      noteStatus.textContent = "Posting…";
    }

    await API.createPost(caption, file, mediaType);
    await sharedNoteStore.refresh();
    noteText.value = "";
    clearChosenFile();
    renderNotes();
    showToast("Posted 💛");
  } catch (error) {
    showToast("⚠️ " + (error.message || error));
  } finally {
    noteStatus.textContent = "";
    noteSubmit.disabled = false;
    renderComposerState();
  }
}

// Grey out posting and adding ideas while offline.
function renderComposerState() {
  const offline = !navigator.onLine;
  noteSubmit.disabled = offline;
  ideaForm.querySelector("button").disabled = offline;
  noteStatus.textContent = offline ? "📴 You're offline. Posting will work again with signal." : "";
}


// ============================================================
// 7. Start-up (called from script.js once everything has loaded)
// ============================================================
async function startSharedMode() {
  // A class on <body> lets the CSS show the photo picker and hide
  // the local-mode name box.
  document.body.classList.add("shared-mode");
  noteFrom.required = false;
  noteText.required = false;
  noteText.placeholder = "Say something, or add a photo or video…";

  // Attach the composer's listeners HERE rather than when this file
  // loads: noteForm is created in script.js, which loads after us.
  noteFile.addEventListener("change", handleFilePicked);
  noteForm.addEventListener("submit", handlePostSubmit);

  renderSharedUI(); // shows "Loading…" straight away

  // Sign in/out from ANOTHER route, like tapping the magic link in
  // the email. setTimeout(..., 0) runs it just AFTER Supabase finishes
  // its own work. Supabase warns against making more Supabase calls
  // directly inside this callback, because it can freeze.
  API.onAuthChange((session) => {
    const email = session ? session.user.email.toLowerCase() : null;
    if (email !== currentEmail) setTimeout(handleSessionChange, 0);
  });

  await API.init();
  await handleSessionChange();

  // The browser fires these when the signal drops or comes back.
  window.addEventListener("offline", renderComposerState);
  window.addEventListener("online", async () => {
    renderComposerState();
    if (sharedStatus === "member") {
      try {
        await Promise.all([sharedIdeaStore.refresh(), sharedNoteStore.refresh()]);
        renderIdeas();
        renderNotes();
        // Reconnect live updates in case the connection dropped.
        API.unsubscribe(liveChannel);
        liveChannel = API.subscribe(handleLiveChange);
      } catch (error) {}
    }
  });
}
