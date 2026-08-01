/*
  AI PMM ENGINE - behavior.

  Only one thing needs JavaScript on this page: the mobile hamburger
  menu. Everything else (smooth scrolling to sections) is handled by
  plain CSS (`scroll-behavior: smooth` in style.css).

  This reuses ideas you already know from the earlier projects:
  - `getElementById` to grab elements (Wordle)
  - `addEventListener` to react to clicks (Wordle, To-Do)
  - `classList` to toggle a CSS class on/off (Wordle's tile colors)
*/

const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");

// Clicking the hamburger button flips the nav open/closed.
navToggle.addEventListener("click", () => {
  // .toggle() adds the class if it's missing, or removes it if it's
  // already there - handy for exactly this kind of on/off switch.
  siteNav.classList.toggle("open");

  // `aria-expanded` tells screen readers whether the menu this button
  // controls is currently open or closed - we keep it in sync with
  // the actual state so assistive tech announces it correctly.
  const isOpen = siteNav.classList.contains("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// If someone taps a nav link on mobile, close the menu afterwards -
// otherwise it stays open, covering the section they just jumped to.
//
// This is EVENT DELEGATION again (same trick as the to-do app): one
// listener on the parent <nav>, instead of one per link, because it's
// less code and still works even if links are ever added later.
siteNav.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});
