// ============================================================
// VOICE TO TEXT - script.js
// ============================================================
// New ideas in this project (building on Wordle and the to-do list):
//   1. A browser API we didn't build - the Web Speech API. Instead
//      of us writing speech-recognition code (extremely hard!), we
//      just ask the browser to do it and it hands us back text.
//   2. Feature detection: checking whether something exists BEFORE
//      using it, so the page fails politely on browsers that don't
//      support it (Firefox, at the time of writing) instead of
//      crashing with a confusing error.
//   3. "Interim" vs "final" results - speech recognition guesses as
//      you talk and often revises its guess, so we show two kinds
//      of text: a live, changing guess, and locked-in final text.
// ============================================================


// ------------------------------------------------------------
// STEP 1: Grab our elements
// ------------------------------------------------------------
const micButton = document.getElementById("mic-button");
const statusText = document.getElementById("status");
const transcriptBox = document.getElementById("transcript");
const copyButton = document.getElementById("copy-button");
const downloadButton = document.getElementById("download-button");
const clearButton = document.getElementById("clear-button");


// ------------------------------------------------------------
// STEP 2: Feature detection
// ------------------------------------------------------------
// Chrome/Safari only ever shipped this API under the name
// "webkitSpeechRecognition" (a leftover from when they were both
// built on the WebKit browser engine). Some newer browsers also
// expose the un-prefixed "SpeechRecognition" name. We check for
// either, and use whichever one actually exists.
//
// `window.X || window.Y` means "use X if it exists (is truthy),
// otherwise fall back to Y" - a very common JS pattern for reading
// a value that might be missing.
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// If NEITHER exists, `SpeechRecognition` is `undefined`, which is
// "falsy" - so this `if` catches unsupported browsers (Firefox).
if (!SpeechRecognition) {
  statusText.textContent =
    "Sorry, your browser doesn't support voice typing. Try Safari or Chrome instead.";
  micButton.disabled = true; // greys the button out and blocks clicks
} else {
  // Only set up the recognizer if the browser actually supports it -
  // everything below this line lives inside this `else` block.
  setUpVoiceTyping();
}


function setUpVoiceTyping() {
  // `new SpeechRecognition()` creates one recognizer object we can
  // configure and reuse for the whole time the page is open.
  const recognition = new SpeechRecognition();

  // continuous = true: keep listening after you pause, instead of
  // stopping after your first sentence. We want a running dictation
  // tool, not a one-shot voice search box.
  recognition.continuous = true;

  // interimResults = true: give us live, in-progress guesses as you
  // talk, not just the final text once you stop. This is what makes
  // the transcript feel like it's updating in real time.
  recognition.interimResults = true;

  recognition.lang = "en-US";

  // Plain boolean flag we control ourselves, to track whether WE
  // think we should be listening right now. We need this because of
  // the auto-restart trick in onend, below.
  let isListening = false;

  // This variable holds all the text we've LOCKED IN so far. Every
  // time recognition finishes a phrase, we add it here permanently.
  let finalTranscript = "";

  // ----------------------------------------------------------
  // Starting and stopping
  // ----------------------------------------------------------
  micButton.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  // "start" fires once the browser has actually turned the
  // microphone on (this can take a moment, especially the very
  // first time, while it asks you for microphone permission).
  recognition.onstart = () => {
    isListening = true;
    micButton.textContent = "⏹ Stop Listening";
    micButton.classList.add("listening"); // triggers the CSS pulse animation
    statusText.textContent = "Listening...";
  };

  recognition.onend = () => {
    // Quirk of this API: even in continuous mode, the browser can
    // stop listening on its own after a while (varies by browser).
    // If the USER didn't ask us to stop (isListening is still true),
    // we just start it right back up so dictation doesn't randomly
    // cut out mid-sentence.
    if (isListening) {
      recognition.start();
      return;
    }
    micButton.textContent = "🎤 Start Listening";
    micButton.classList.remove("listening");
    statusText.textContent = "Click the button and start talking.";
  };

  recognition.onerror = (event) => {
    // "no-speech" just means it timed out waiting to hear anything -
    // not worth alarming the user about, so we ignore it quietly.
    if (event.error === "no-speech") return;

    isListening = false;
    statusText.textContent =
      event.error === "not-allowed"
        ? "Microphone access was blocked. Check your browser's site settings and try again."
        : `Something went wrong (${event.error}). Try again.`;
  };

  // ----------------------------------------------------------
  // Handling results - the "interim vs final" idea
  // ----------------------------------------------------------
  // This fires repeatedly while you talk, each time the browser has
  // something new to report. `event.results` is a list of every
  // phrase it has attempted so far in this session.
  recognition.onresult = (event) => {
    // Built up fresh on every call, since interim text is temporary
    // and shouldn't stack up - only finalTranscript (declared above,
    // outside this function) persists between calls.
    let interimTranscript = "";

    // event.resultIndex tells us where the NEW results start, so we
    // don't need to reprocess phrases we've already handled.
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const spokenText = result[0].transcript; // [0] = the recognizer's best guess

      if (result.isFinal) {
        // Locked in - the recognizer is confident this phrase is
        // done changing. Add it permanently, with a trailing space
        // so it doesn't run into the next sentence.
        finalTranscript += spokenText + " ";
      } else {
        // Still being figured out - don't save this, just show it.
        interimTranscript += spokenText;
      }
    }

    // The box always shows: everything locked in, plus whatever
    // it's currently in the middle of guessing.
    transcriptBox.value = finalTranscript + interimTranscript;
  };
}


// ------------------------------------------------------------
// STEP 3: Copy, download, and clear
// ------------------------------------------------------------
// These three buttons don't touch the Speech API at all - they just
// work with the plain text sitting in the textarea, same as any
// other form control.

copyButton.addEventListener("click", async () => {
  // navigator.clipboard.writeText() is the modern, secure way to
  // put text on the user's clipboard. It returns a Promise (a
  // placeholder for a result that isn't ready yet), which is why we
  // use `await` here - it pauses this function until the copy
  // actually finishes.
  try {
    await navigator.clipboard.writeText(transcriptBox.value);
    statusText.textContent = "Copied to clipboard!";
  } catch (error) {
    statusText.textContent = "Couldn't copy - try selecting the text manually.";
  }
});

downloadButton.addEventListener("click", () => {
  // A Blob ("Binary Large OBject") is how the browser represents a
  // file's worth of raw data before it's saved anywhere. Here we
  // wrap our plain text up as a Blob so we can offer it as a
  // downloadable .txt file.
  const blob = new Blob([transcriptBox.value], { type: "text/plain" });

  // Turns that Blob into a temporary URL the browser can treat like
  // a real file link (e.g. "blob:https://...").
  const url = URL.createObjectURL(blob);

  // The classic trick for triggering a download from JavaScript:
  // create an <a> tag that isn't even attached to the page, point
  // it at our blob URL, set `download` so the browser saves it
  // instead of navigating to it, then click it programmatically.
  const link = document.createElement("a");
  link.href = url;
  link.download = "transcript.txt";
  link.click();

  // Free up the memory the browser set aside for that temporary URL,
  // now that the download has been triggered.
  URL.revokeObjectURL(url);
});

clearButton.addEventListener("click", () => {
  transcriptBox.value = "";
});

// ------------------------------------------------------------
// Try it yourself: this transcript disappears if you refresh the
// page, just like the to-do list did before you (maybe) added
// localStorage to it. Try wiring up localStorage here too, so your
// dictation survives a refresh - the pattern is identical.
// ------------------------------------------------------------
