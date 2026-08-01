// ============================================================
// WORDLE - script.js
// ============================================================
// This is JavaScript (JS). It's the language that makes web pages
// interactive. HTML builds the page, CSS makes it pretty, and JS
// makes it DO things - like react to your keyboard and update the
// screen.
//
// This file is written like a mini coding tutorial. Read the
// comments (the lines starting with //) as you go - they explain
// not just WHAT the code does, but WHY it's written that way.
// ============================================================


// ------------------------------------------------------------
// STEP 1: Variables and constants
// ------------------------------------------------------------
// `const` creates a variable whose VALUE never gets reassigned
// (though if it's an array, we can still change what's INSIDE it).
// `let` creates a variable we DO plan to change later.
// We almost never use `var` in modern JavaScript.

// An array is a list of values, written between square brackets [].
// This is our "word bank" - the game will secretly pick one of
// these words for you to guess.
const WORD_LIST = [
  "apple", "brave", "chair", "dance", "eagle",
  "flame", "grape", "house", "input", "joker",
  "kneel", "lemon", "mango", "noble", "ocean",
  "piano", "query", "river", "stone", "table",
  "unity", "value", "water", "youth", "zebra",
];

const WORD_LENGTH = 5; // every word above is 5 letters long
const MAX_GUESSES = 6; // classic Wordle rule: 6 tries

// This "state" lets/consts track what's happening in the game
// right now. Keeping state organized like this is a core skill
// in programming - your program is really just "data that changes
// over time, plus code that reacts to those changes".
const answer = pickRandomWord(); // the secret word (see function below)
let currentGuess = "";   // the letters typed so far, e.g. "app"
let currentRow = 0;      // which row of the grid we're filling in (0-5)
let gameOver = false;    // once true, we stop reacting to key presses

// A JavaScript "object" (curly braces {}) stores related info as
// key: value pairs. Here we remember the best status we've seen
// for each letter, so the on-screen keyboard can be colored.
const keyStatuses = {};


// ------------------------------------------------------------
// STEP 2: Functions
// ------------------------------------------------------------
// A function is a reusable block of code with a name. We "declare"
// it once, then "call" it (using its name + parentheses) whenever
// we want that behavior to run.

// Picks and returns one random word from WORD_LIST.
function pickRandomWord() {
  // Math.random() gives a random decimal between 0 (inclusive)
  // and 1 (exclusive). Multiplying by the list length and rounding
  // down (Math.floor) turns that into a random valid INDEX.
  const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[randomIndex];
}

// Builds the empty grid of letter tiles inside <div id="board">.
function createBoard() {
  // document.getElementById() finds an HTML element by its id
  // attribute, so we can change it with JavaScript.
  const board = document.getElementById("board");

  // A "for loop" repeats code a set number of times.
  // This outer loop runs once per GUESS ROW (6 rows total).
  for (let row = 0; row < MAX_GUESSES; row++) {
    // This inner loop runs once per LETTER in that row (5 letters).
    for (let col = 0; col < WORD_LENGTH; col++) {
      // document.createElement() makes a brand-new HTML element
      // that doesn't exist on the page yet.
      const tile = document.createElement("div");

      // className sets which CSS class(es) style this element.
      // Our style.css file has rules for ".tile".
      tile.className = "tile";

      // We give every tile a unique id like "tile-0-0", "tile-0-1",
      // so we can find and update the exact right one later.
      tile.id = `tile-${row}-${col}`;

      // appendChild() actually inserts our new element into the page.
      board.appendChild(tile);
    }
  }
}

// Builds the on-screen keyboard inside <div id="keyboard">.
function createKeyboard() {
  // Each string in this array is one row of keys.
  const rows = ["qwertyuiop", "asdfghjkl", "enter zxcvbnm backspace"];

  const keyboard = document.getElementById("keyboard");

  rows.forEach((rowString) => {
    // .split(" ") turns "enter zxcvbnm backspace" into
    // ["enter", "zxcvbnm", "backspace"]. For rows without spaces,
    // like "qwertyuiop", we split it letter-by-letter using "".
    const keys = rowString.includes(" ")
      ? rowString.split(" ")
      : rowString.split("");

    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    // Sometimes a "key" is actually multiple letters (like "zxcvbnm"
    // from the split above). We flatMap it back out into single keys,
    // but keep "enter" and "backspace" as whole words.
    keys.forEach((key) => {
      if (key === "enter" || key === "backspace") {
        rowDiv.appendChild(makeKeyButton(key));
      } else {
        // key here is a short run of single letters, e.g. "zxcvbnm".
        for (const letter of key) {
          rowDiv.appendChild(makeKeyButton(letter));
        }
      }
    });

    keyboard.appendChild(rowDiv);
  });
}

// Creates one clickable keyboard button.
function makeKeyButton(key) {
  const button = document.createElement("button");
  button.textContent = key === "backspace" ? "⌫" : key; // ⌫ symbol
  button.className = "key";
  button.id = `key-${key}`;

  // addEventListener() tells the browser "when this event happens,
  // run this function". Here: "when this button is clicked, call
  // handleKey with this button's key value."
  // The arrow function `() => handleKey(key)` is a short way to
  // write a small, anonymous function.
  button.addEventListener("click", () => handleKey(key));

  return button;
}


// ------------------------------------------------------------
// STEP 3: Reacting to input (events)
// ------------------------------------------------------------

// This listens for REAL keyboard presses anywhere on the page.
// The browser gives us an "event object" (we named it `e`) with
// details about what happened - here, e.key tells us which key.
document.addEventListener("keydown", (e) => {
  handleKey(e.key.toLowerCase());
});

// This one function handles input from BOTH the real keyboard and
// our on-screen buttons, so we don't have to write the logic twice.
function handleKey(key) {
  if (gameOver) return; // "guard clause": stop early if game has ended

  if (key === "enter") {
    submitGuess();
  } else if (key === "backspace") {
    removeLetter();
  } else if (isLetter(key) && currentGuess.length < WORD_LENGTH) {
    addLetter(key);
  }
  // Any other key (like Shift, or a 6th letter) is simply ignored.
}

// A "helper function" that answers a yes/no question, using a
// regular expression (a pattern for matching text) to check that
// `key` is a single letter a-z.
function isLetter(key) {
  return /^[a-z]$/.test(key);
}


// ------------------------------------------------------------
// STEP 4: Updating the board as you type
// ------------------------------------------------------------

function addLetter(letter) {
  currentGuess += letter; // shorthand for currentGuess = currentGuess + letter
  updateTile();
}

function removeLetter() {
  // .slice(0, -1) returns the string with its last character removed.
  currentGuess = currentGuess.slice(0, -1);
  updateTile();
}

// Redraws the current row so it matches currentGuess.
function updateTile() {
  for (let col = 0; col < WORD_LENGTH; col++) {
    const tile = document.getElementById(`tile-${currentRow}-${col}`);
    // If there's a letter at this position, show it; otherwise blank.
    tile.textContent = currentGuess[col] ? currentGuess[col] : "";
  }
}


// ------------------------------------------------------------
// STEP 5: Checking a guess
// ------------------------------------------------------------

function submitGuess() {
  if (currentGuess.length !== WORD_LENGTH) {
    showMessage("Not enough letters");
    return;
  }

  const result = evaluateGuess(currentGuess, answer);
  revealGuess(result);
  updateKeyboardColors(currentGuess, result);

  if (currentGuess === answer) {
    showMessage("You got it! 🎉");
    gameOver = true;
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow === MAX_GUESSES) {
    showMessage(`Out of guesses! The word was "${answer.toUpperCase()}"`);
    gameOver = true;
  }
}

// This is the trickiest part of Wordle to get right, so let's slow
// down. Given a guess and the answer, we return an array of 5
// statuses: "correct", "present", or "absent".
//
// The tricky bit is REPEATED letters. For example if the answer is
// "apple" and you guess "eagle", the "e" should only be marked
// once, not for every "e" in your guess. We solve this by counting
// how many of each letter the ANSWER has left to "give out", and
// using them up as we find matches.
function evaluateGuess(guess, answer) {
  const result = new Array(WORD_LENGTH).fill("absent");

  // Turn the answer into an array of letters so we can count them.
  // e.g. "apple" -> ["a", "p", "p", "l", "e"]
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");

  // An object to count how many of each letter are still
  // "available" in the answer to be matched.
  const letterCounts = {};
  for (const letter of answerLetters) {
    // `letterCounts[letter] || 0` means "use the existing count,
    // or 0 if we haven't seen this letter before".
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  // FIRST PASS: find exact matches (right letter, right spot).
  // We do this pass completely before checking "present" letters,
  // so correct matches always get first claim on the letter count.
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = "correct";
      letterCounts[guessLetters[i]]--; // use up one of this letter
    }
  }

  // SECOND PASS: find "present" matches (right letter, wrong spot).
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue; // already handled above

    const letter = guessLetters[i];
    if (letterCounts[letter] > 0) {
      result[i] = "present";
      letterCounts[letter]--; // use up one of this letter
    }
    // else: it stays "absent" - either the letter isn't in the
    // answer at all, or every copy of it was already claimed.
  }

  return result;
}

// Applies the colors from evaluateGuess() onto the tiles.
function revealGuess(result) {
  for (let col = 0; col < WORD_LENGTH; col++) {
    const tile = document.getElementById(`tile-${currentRow}-${col}`);
    // classList.add() adds a CSS class without removing the ones
    // already there (like "tile"), so both sets of styles apply.
    tile.classList.add(result[col]);
  }
}

// Colors the on-screen keyboard keys, remembering the BEST status
// seen so far for each letter (correct beats present beats absent).
function updateKeyboardColors(guess, result) {
  const rank = { absent: 0, present: 1, correct: 2 };

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    const bestSoFar = keyStatuses[letter];

    if (!bestSoFar || rank[status] > rank[bestSoFar]) {
      keyStatuses[letter] = status;
      const keyButton = document.getElementById(`key-${letter}`);
      // Remove any old color class before adding the new one.
      keyButton.classList.remove("absent", "present", "correct");
      keyButton.classList.add(status);
    }
  }
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}


// ------------------------------------------------------------
// STEP 6: Start the game
// ------------------------------------------------------------
// Everything above just DEFINES functions - none of them run until
// we actually call them. These two calls build the page for the
// very first time.
createBoard();
createKeyboard();

// Tip: open your browser's DevTools (right-click -> Inspect ->
// Console tab) and type `answer` to peek at the secret word while
// you're learning how the code works!
