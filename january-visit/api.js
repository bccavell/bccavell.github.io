// ============================================================
// JANUARY VISIT - api.js (the "data layer")
// ============================================================
// This is the ONLY file that talks to Supabase. Everything else in
// the app calls the small, plainly-named functions in here, like
// API.getIdeas() or API.createPost(...), and never touches Supabase
// directly.
//
// WHY BOTHER? It's called a "data layer" (or "API wrapper"):
//   - If we ever switched from Supabase to something else, only THIS
//     file would change.
//   - The rest of the app reads like plain English, without
//     database details everywhere.
//   - Errors get turned into friendly messages in one place.
// Analogy: a restaurant waiter. You (the app) don't walk into the
// kitchen (the database). You tell the waiter what you want, and the
// waiter knows how the kitchen works.
//
// NEW CONCEPT: async / await
// Talking to a server takes time (milliseconds to seconds). An
// `async` function is one that can WAIT for slow things without
// freezing the whole app. Inside it, `await somethingSlow()` means
// "pause this function here until the answer arrives, and let the
// rest of the app carry on meanwhile". It's a tidier way of writing
// the Promise `.then(...)` chains you saw in sw.js.
//
// try / catch works with await too: if the server answers with an
// error, it jumps to `catch`, just like with localStorage.
// ============================================================

const API = (() => {
  // ^ This `(() => { ... })()` pattern is an "IIFE" (Immediately
  // Invoked Function Expression): a function we create and run
  // straight away. Everything declared inside it stays PRIVATE to
  // this file, and only what we `return` at the bottom becomes public
  // as API.something. It stops our variable names clashing with
  // script.js's.

  // Is the app set up for shared mode? Both details must be filled in
  // AND the Supabase library must have loaded.
  const enabled = Boolean(
    SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase
  );

  // The Supabase "client": an object that knows our project's address
  // and key and has methods for the database, storage, sign-in and
  // realtime. Only created in shared mode.
  const client = enabled
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

  const BUCKET = "media";
  const SIGNED_URL_SECONDS = 60 * 60; // temporary media links last 1 hour
  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB, the free plan limit

  // Who's signed in right now (or null). Kept up to date below.
  let session = null;

  // The guest list as a lookup: { "sam@example.com": "Sam", ... }
  // so we can turn emails into display names.
  let memberNames = {};

  // ----------------------------------------------------------
  // Error helper: turn Supabase's technical errors into friendly text
  // ----------------------------------------------------------
  function friendly(error) {
    const message = (error && error.message) || String(error);
    if (/row-level security|permission|not authorized/i.test(message)) {
      return "You don't have permission to do that. Are you on the guest list?";
    }
    if (/failed to fetch|network|load failed/i.test(message)) {
      return "Couldn't reach the server. Check your signal and try again.";
    }
    if (/token has expired|invalid/i.test(message)) {
      return "That code didn't work. It may have expired, so ask for a new one.";
    }
    if (/rate limit|too many/i.test(message)) {
      return "Too many tries. Wait a minute, then try again.";
    }
    return message;
  }

  // Many Supabase calls give back { data, error } instead of throwing.
  // This helper THROWS the error instead, so we can use one try/catch
  // everywhere instead of checking `if (error)` after every call.
  function unwrap(result) {
    if (result.error) throw new Error(friendly(result.error));
    return result.data;
  }

  // ==========================================================
  // Sign-in (authentication)
  // ==========================================================

  // Load any existing sign-in from the phone. Supabase saves it in
  // localStorage, so you stay signed in after closing the app.
  async function init() {
    if (!enabled) return null;
    const { data } = await client.auth.getSession();
    session = data.session;
    return session;
  }

  function getSession() {
    return session;
  }

  function myEmail() {
    return session ? session.user.email.toLowerCase() : null;
  }

  // Run `callback` every time someone signs in or out.
  function onAuthChange(callback) {
    if (!enabled) return;
    client.auth.onAuthStateChange((event, newSession) => {
      session = newSession;
      callback(newSession);
    });
  }

  // Step 1: email them a one-time code (and a magic link).
  async function sendCode(email) {
    const result = await client.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Where the magic LINK should bring them back to: this page,
        // without any ?today= preview bits.
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });
    unwrap(result);
  }

  // Step 2: check the code they typed in. Typing a code works even
  // inside the installed home-screen app, whereas a link always opens
  // in Safari. That's why we support both.
  async function verifyCode(email, code) {
    const result = await client.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    session = unwrap(result).session;
    return session;
  }

  async function signOut() {
    await client.auth.signOut();
    session = null;
    memberNames = {};
  }

  // Ask the database "am I on the guest list?" (the is_member()
  // function from schema.sql). .rpc() = "Remote Procedure Call", which
  // means running a function that lives on the server.
  async function amIMember() {
    return unwrap(await client.rpc("is_member")) === true;
  }

  // Load the guest list into memberNames.
  async function loadMembers() {
    const rows = unwrap(await client.from("members").select("email, display_name"));
    memberNames = {};
    rows.forEach((row) => {
      memberNames[row.email] = row.display_name;
    });
    return memberNames;
  }

  function nameFor(email) {
    // Fall back to the part of the email before the @ if we don't know them.
    return memberNames[email] || (email ? email.split("@")[0] : "Someone");
  }

  // ==========================================================
  // Ideas + hearts
  // ==========================================================
  // Every function returns ideas in the SAME shape the local
  // (phone-only) version uses, so script.js can draw both the same way:
  //   { id, text, count, who: ["Sam", "Billy"], heartedByMe, canDelete }
  async function getIdeas() {
    // select("..., idea_hearts(member_email)") is an "embedded" query:
    // Supabase follows the foreign key from idea_hearts back to ideas
    // and gives us each idea WITH its list of hearts in one request.
    // It's like asking the waiter for the burger and its sides together.
    const rows = unwrap(
      await client
        .from("ideas")
        .select("id, text, author_email, created_at, idea_hearts(member_email)")
        .order("created_at", { ascending: true })
    );
    const me = myEmail();
    return rows.map((row) => {
      const heartEmails = row.idea_hearts.map((heart) => heart.member_email);
      return {
        id: row.id,
        text: row.text,
        count: heartEmails.length,
        who: heartEmails.map(nameFor),
        heartedByMe: heartEmails.includes(me),
        canDelete: row.author_email === me,
      };
    });
  }

  async function addIdea(text) {
    // We don't send author_email: the database fills it in from your
    // sign-in ticket (see the `default` in schema.sql), so nobody can
    // post as someone else.
    unwrap(await client.from("ideas").insert({ text: text }));
  }

  // One heart per person: tapping again takes your heart back.
  async function toggleHeart(idea) {
    if (idea.heartedByMe) {
      unwrap(
        await client
          .from("idea_hearts")
          .delete()
          .eq("idea_id", idea.id)
          .eq("member_email", myEmail())
      );
    } else {
      unwrap(await client.from("idea_hearts").insert({ idea_id: idea.id }));
    }
  }

  async function deleteIdea(id) {
    unwrap(await client.from("ideas").delete().eq("id", id));
  }

  // ==========================================================
  // Posts (the feed)
  // ==========================================================
  // Returns one "page" of posts, newest first. `before` is the
  // created_at of the oldest post we already have: "give me the ones
  // older than this". That's called "cursor pagination", and it's how
  // Instagram's infinite scroll asks for more.
  async function getPosts(options) {
    const pageSize = options.pageSize;
    let query = client
      .from("posts")
      .select("id, author_email, caption, media_path, media_type, created_at")
      .order("created_at", { ascending: false })
      .limit(pageSize);
    if (options.before) query = query.lt("created_at", options.before);
    const rows = unwrap(await query);

    // The bucket is private, so files need SIGNED URLs: temporary links
    // with a secret signature that stop working after an hour. We ask
    // for all of this page's links in ONE request instead of one per photo.
    const paths = rows.filter((row) => row.media_path).map((row) => row.media_path);
    let urls = {};
    if (paths.length > 0) {
      const signed = unwrap(
        await client.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
      );
      signed.forEach((item) => {
        if (item.signedUrl) urls[item.path] = item.signedUrl;
      });
    }

    const me = myEmail();
    const posts = rows.map((row) => ({
      id: row.id,
      from: nameFor(row.author_email),
      authorEmail: row.author_email,
      text: row.caption || "",
      mediaPath: row.media_path,
      mediaType: row.media_type,
      mediaUrl: row.media_path ? urls[row.media_path] || null : null,
      createdAt: row.created_at, // e.g. "2027-01-09T14:32:10.123+00:00"
      canDelete: row.author_email === me,
    }));
    return { posts: posts, hasMore: rows.length === pageSize };
  }

  // Upload the file (if any) to Storage, then add the post row.
  // `file` is a Blob or File: the browser's way of holding raw file data.
  async function createPost(caption, file, mediaType) {
    let mediaPath = null;
    if (file) {
      if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("That file is over 50 MB. Try a shorter clip.");
      }
      // Files go in posts/<your user id>/..., the only folder the
      // storage policy lets you upload into.
      const extension = (file.type.split("/")[1] || "bin").replace("quicktime", "mov");
      const random = Math.random().toString(36).slice(2, 8);
      mediaPath = `posts/${session.user.id}/${Date.now()}-${random}.${extension}`;
      unwrap(
        await client.storage.from(BUCKET).upload(mediaPath, file, {
          contentType: file.type,
          cacheControl: "31536000", // let phones cache the file for a year
        })
      );
    }

    try {
      unwrap(
        await client.from("posts").insert({
          caption: caption || null,
          media_path: mediaPath,
          media_type: mediaPath ? mediaType : null,
        })
      );
    } catch (error) {
      // If saving the post failed, delete the file we just uploaded so
      // it doesn't sit in storage forever with nothing pointing at it.
      if (mediaPath) await client.storage.from(BUCKET).remove([mediaPath]);
      throw error;
    }
  }

  async function deletePost(post) {
    // Delete the row first: that's the check that it really is yours.
    // Then tidy away the file it pointed to.
    unwrap(await client.from("posts").delete().eq("id", post.id));
    if (post.mediaPath) {
      await client.storage.from(BUCKET).remove([post.mediaPath]);
    }
  }

  // ==========================================================
  // Realtime: get told the moment something changes
  // ==========================================================
  // Opens a live connection (a "WebSocket", a phone line that stays
  // open, instead of asking the server over and over "anything
  // new?"). `onChange(table, payload)` runs whenever a row in one of
  // our tables is added or deleted.
  function subscribe(onChange) {
    if (!enabled) return null;
    const channel = client.channel("trip-updates");
    ["ideas", "idea_hearts", "posts"].forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: table },
        (payload) => onChange(table, payload)
      );
    });
    channel.subscribe();
    return channel;
  }

  function unsubscribe(channel) {
    if (channel) client.removeChannel(channel);
  }

  // Everything listed here becomes public as API.whatever.
  return {
    enabled,
    MAX_UPLOAD_BYTES,
    init,
    getSession,
    myEmail,
    onAuthChange,
    sendCode,
    verifyCode,
    signOut,
    amIMember,
    loadMembers,
    nameFor,
    getIdeas,
    addIdea,
    toggleHeart,
    deleteIdea,
    getPosts,
    createPost,
    deletePost,
    subscribe,
    unsubscribe,
  };
})();
