// ============================================================
// JANUARY VISIT - sw.js (the service worker)
// ============================================================
// A service worker is a little script the browser runs IN THE
// BACKGROUND, separately from the page. It sits between the app
// and the internet like a middleman: every time the app asks for a
// file, the service worker can answer from its own saved copy (a
// "cache") instead of going online.
//
// That's what makes the app open in airplane mode or on the Tube.
//
// The strategy used here is "network first, cache as backup":
//   - Online?  Fetch the fresh file AND save a copy for later.
//   - Offline? Hand back the saved copy.
// Why not cache first? With cache first, the app would keep showing
// OLD plans even after you push an update. While plans are changing
// during the trip, fresh-when-possible is the right trade-off.
//
// NOTE: `self` here means the service worker itself (there's no
// `window` or `document`, because the service worker has no page).
// ============================================================

// Change this name if you ever want to throw away all old copies.
const CACHE_NAME = "january-visit-v1";

// The files that make up the app "shell". These get saved as soon as
// the service worker installs, so offline works from the very
// first visit. Photos get cached later, as they're viewed.
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// "install" runs once, when the browser first sees this service worker.
self.addEventListener("install", (event) => {
  // event.waitUntil(...) means "don't finish installing until this
  // job is done". caches.open() and addAll() are ASYNCHRONOUS: they
  // take time (downloading files), so they return a Promise, an
  // object that stands for "a result that will arrive later".
  // .then(...) says what to do once it arrives.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  // Start using this new version straight away, without waiting
  // for every open tab of the app to close first.
  self.skipWaiting();
});

// "activate" runs after install. This is where we clean up caches
// from older versions (e.g. "january-visit-v0") to free space.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of pages that are already open.
  self.clients.claim();
});

// "fetch" runs EVERY time the app asks for a file.
self.addEventListener("fetch", (event) => {
  // Only handle simple "get me a file" requests.
  if (event.request.method !== "GET") return;

  // event.respondWith(...) is how we hand back our own answer.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Online: save a copy of the fresh file for later.
        // .clone() because a response can only be read once, and we
        // need it twice: once for the cache and once for the page.
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      // Offline (fetch failed): fall back to the saved copy.
      .catch(() => caches.match(event.request))
  );
});
