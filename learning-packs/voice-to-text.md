# Learning Pack 4: Voice to Text

Code: [`/voice-to-text`](../voice-to-text)

## New in this project

Everything from [Wordle](./wordle.md), the [to-do list](./todo.md), and the
[fractional PMM website](./fractional-pmm-website.md) still applies
(functions, the DOM, events, classes for styling, responsive layout). This
project adds:

- Using a **browser Web API** instead of only your own code
- **Feature detection** (checking something exists before using it)
- The **Web Speech API** (`SpeechRecognition`) and its event-driven design
- **Interim vs. final results** - live, changing guesses vs. locked-in text
- **Promises and `async`/`await`** (via `navigator.clipboard.writeText`)
- **Blobs** and `URL.createObjectURL` for generating a downloadable file
- The `::placeholder` CSS pseudo-element and `@keyframes` animation

## Detailed explanations

### Browser Web APIs

So far, every project has been "just JavaScript" - variables, arrays,
functions, and the DOM. But the browser itself also exposes bigger, more
powerful features as ready-made objects you can call, called **Web APIs**.
You've technically already used one without naming it: `document` (the DOM
API) and `localStorage` (mentioned as a stretch goal in the to-do pack) are
both Web APIs.

The Web Speech API is a much bigger one: it hands your JavaScript a live
transcript of whatever the browser hears through the microphone, using
speech-recognition models built into the browser or the operating system.
Actually *building* a speech recognizer from scratch is a serious piece of
machine learning engineering - by using this API, you get all of that for
free, and your code's job is just to react to the events it fires.

**Real world:** this is the same idea behind Siri dictation on macOS/iOS and
Android's voice typing keyboard - a system-level speech engine that any app
(or, here, any webpage) can plug into rather than reinventing.

### Feature detection

Not every browser supports every Web API. Firefox, at the time this was
written, doesn't support the Web Speech API at all. Rather than assuming it
exists and crashing with a confusing error the first time someone opens the
page in an unsupported browser, we check for it first:

```js
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  // show a friendly message and stop here
}
```

The `||` ("or") operator here means "use the left side if it exists,
otherwise fall back to the right side." If neither exists, the result is
`undefined`, which JavaScript treats as `false` in an `if` check - so we can
catch the unsupported case with a simple `if (!SpeechRecognition)`.

**Real world:** production websites do this constantly, because visitors
show up in all kinds of browsers. Netflix, for example, detects whether your
browser supports certain video formats before deciding which one to stream
you. It's far more common than trying to support literally everything with
one code path.

### Interim vs. final results

Speech recognition is a guessing process - the recognizer often revises what
it thinks you said as you keep talking (e.g. it hears "recognize speech" and
briefly guesses "wreck a nice beach" before correcting itself). The API
reflects this by giving you two kinds of results:

- **Interim** results: still being figured out, shown live but not final
- **Final** results: locked in, won't change again

We handle this by keeping two separate pieces of text: `finalTranscript`
(saved permanently, only ever added to) and `interimTranscript` (rebuilt
from scratch on every single update, since it's temporary). What you see in
the box is always `finalTranscript + interimTranscript` glued together.

**Real world:** this exact "show a live guess, then confirm it" pattern is
visible in Siri, Google Assistant, and live captioning on YouTube or Zoom -
the words often flicker and adjust for a moment before settling.

### Promises and `async`/`await`

Copying to the clipboard isn't instant from the computer's point of view -
it's technically possible (though rare) for it to take a moment, or to be
blocked by the browser. So `navigator.clipboard.writeText()` doesn't hand
back the result immediately; it hands back a **Promise**, which is a
placeholder object that represents "a result that will exist soon."

`await` pauses a function at that line until the Promise finishes, so the
code underneath it can act like the result already arrived:

```js
async function example() {
  await navigator.clipboard.writeText("hello");
  // this line only runs after the copy succeeds
}
```

The `try`/`catch` around it means "attempt this, and if it fails, run this
other code instead" - here, showing a friendlier error message instead of
letting the page break.

**Real world:** almost anything that takes an unpredictable amount of
time - loading data from a server, reading a file, saving to a database - is
handled with Promises in modern JavaScript. Every API call your browser
makes to Instagram, Gmail, or your bank's website behind the scenes uses
this same pattern.

### Blobs and generating a downloadable file

To let you download your transcript as a `.txt` file, we needed to create a
file that doesn't actually exist anywhere - it's built entirely in the
browser's memory from the text in the textarea. That's what a **Blob**
("Binary Large OBject") is: raw file-like data your JavaScript assembled on
the spot.

`URL.createObjectURL(blob)` gives that in-memory data a temporary web
address the browser can treat like a real download link, which we then
"click" ourselves using a hidden `<a>` tag with a `download` attribute.

**Real world:** this is exactly how "Export as CSV" buttons work on sites
like Google Sheets or your bank's transaction history page - the file is
built in your browser from data already on the page, not fetched from a
server.

### `::placeholder` and `@keyframes`

Two small CSS additions this time:

- `::placeholder` styles the greyed-out hint text inside an empty input or
  textarea (like "Your words will appear here..."). Without it, the
  placeholder can default to a color that's hard to read on a dark
  background.
- `@keyframes` defines an animation by name, describing what a style should
  look like at different points in time (0%, 70%, 100%), which you can then
  attach to any element with the `animation` property. We used it to make
  the microphone button gently pulse red while it's listening, as a visual
  cue that doesn't rely on the user reading text.

**Real world:** subtle pulsing animations like this are everywhere in real
apps to show "something is actively happening" - a recording indicator in
Slack huddles, or the "typing..." animation in iMessage.
