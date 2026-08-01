// ============================================================
// TO-DO LIST - script.js
// ============================================================
// New ideas in this project (building on what Wordle taught):
//   1. An array of OBJECTS, not just plain values, to represent
//      real-world "things" (tasks) with multiple properties.
//   2. The "render from data" pattern: instead of hand-editing the
//      page, we change our DATA, then wipe and rebuild the HTML to
//      match. This is the foundation every big JS framework
//      (React, Vue, etc.) is built on.
//   3. Event delegation: one listener on a PARENT element instead
//      of one listener per button, which matters once the buttons
//      are being created and destroyed dynamically.
// ============================================================


// ------------------------------------------------------------
// STEP 1: State
// ------------------------------------------------------------
// This array is the single "source of truth" for our to-do list.
// The page never gets edited directly - it always gets redrawn
// FROM this array. If you keep that rule in your head, a lot of
// JS app code (in any framework) starts to make sense.
//
// Each task is an OBJECT: a group of related values, written as
// key: value pairs inside curly braces. Think of it like a little
// form with three fields per task.
let tasks = [];

// document.getElementById grabs references to elements from our
// HTML so we can read/change them with JavaScript.
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const countLabel = document.getElementById("task-count");


// ------------------------------------------------------------
// STEP 2: Adding a task
// ------------------------------------------------------------
// "submit" fires when the form is submitted - either by clicking
// the Add button, or by pressing Enter inside the text input.
// Using a real <form> gets us that Enter-key behavior for free.
form.addEventListener("submit", (event) => {
  // Forms normally reload the whole page when submitted (that's
  // how websites worked before JavaScript). preventDefault() stops
  // that old browser behavior so we can handle it ourselves instead.
  event.preventDefault();

  // .trim() removes extra spaces from the start/end, so " " alone
  // doesn't count as a real task.
  const text = input.value.trim();
  if (text === "") return; // guard clause: ignore empty submissions

  addTask(text);

  input.value = ""; // clear the box so it's ready for the next task
  input.focus();     // put the typing cursor back in the box
});

function addTask(text) {
  const newTask = {
    id: Date.now(),  // Date.now() gives a number of milliseconds -
                      // basically always unique, perfect as a simple ID
    text: text,
    completed: false,
  };

  // .push() adds a new item to the END of an array.
  tasks.push(newTask);

  render(); // data changed -> redraw the page to match
}


// ------------------------------------------------------------
// STEP 3: Rendering (drawing the list on screen from `tasks`)
// ------------------------------------------------------------
function render() {
  // Wipe out whatever is currently on screen...
  list.innerHTML = "";

  // ...then rebuild it, one <li> per task in our array.
  // .forEach() runs a function once for every item in an array -
  // it's another way to loop, similar to a `for` loop but often
  // easier to read when you don't need the index.
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";
    // We store the task's id directly on the element using a
    // "data attribute". This lets us look up WHICH task a button
    // belongs to later, when the user clicks it.
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle-checkbox";
    checkbox.checked = task.completed;

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;
    textSpan.className = task.completed
      ? "task-text completed"
      : "task-text";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button"; // prevents it from submitting the form

    item.appendChild(checkbox);
    item.appendChild(textSpan);
    item.appendChild(deleteButton);
    list.appendChild(item);
  });

  updateCount();
}

function updateCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  countLabel.textContent =
    tasks.length === 0
      ? "Add your first task above!"
      : `${remaining} of ${tasks.length} tasks left`;
}


// ------------------------------------------------------------
// STEP 4: Handling clicks with EVENT DELEGATION
// ------------------------------------------------------------
// We could add a "click" listener to every checkbox and every
// delete button individually - but render() destroys and recreates
// them constantly, so we'd have to re-attach listeners every time.
//
// Instead, we add ONE listener to the parent <ul>. Clicks on any
// child element "bubble up" to their parent automatically, and the
// event tells us exactly what was clicked via event.target. This
// pattern is called "event delegation" and it's very common in
// real JS apps.
list.addEventListener("click", (event) => {
  // The closest <li> to whatever was clicked - this works whether
  // the click landed on the checkbox, the text, or the button.
  const item = event.target.closest(".task-item");
  if (!item) return; // clicked somewhere outside any task row

  // dataset.id comes back as a string, so we convert it to a
  // number with Number() to match task.id (which we created with
  // Date.now(), a number).
  const id = Number(item.dataset.id);

  if (event.target.classList.contains("delete-btn")) {
    deleteTask(id);
  } else if (event.target.classList.contains("toggle-checkbox")) {
    toggleTask(id);
  }
});

function deleteTask(id) {
  // .filter() builds a NEW array containing only the items that
  // pass a test - here, "keep every task whose id does NOT match".
  // This is a common, clean way to remove one item from an array.
  tasks = tasks.filter((task) => task.id !== id);
  render();
}

function toggleTask(id) {
  // .map() builds a NEW array by transforming each item. Here we
  // pass through every task unchanged, EXCEPT the one matching id,
  // where we flip its `completed` value.
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  render();
}


// ------------------------------------------------------------
// STEP 5: First render
// ------------------------------------------------------------
// Draw the (currently empty) list once when the page loads.
render();

// ------------------------------------------------------------
// Try it yourself: right now, refreshing the page clears your
// tasks, because `tasks` only lives in memory. A great next
// challenge once you're comfortable with this file: look up
// `localStorage` and try saving/loading `tasks` so your list
// survives a page refresh. Ask me if you want a guided version!
// ------------------------------------------------------------
