# Learning Pack 5: Voice to Text (Mac menu bar app)

Code: [`/voice-to-text-mac-app`](../voice-to-text-mac-app)

## New in this project

This is the first project in the repo that isn't a webpage - it's a native
Mac app, which brings a genuinely new language and a new mental model.
Everything conceptual from the [web voice-to-text project](./voice-to-text.md)
still applies (feature detection, interim vs. final results,
async/callback-style code, permissions), but almost all the *syntax* and
*tools* are new:

- **Swift**, Apple's programming language (as opposed to JavaScript)
- **Xcode**, Apple's app-building tool (as opposed to a text editor + browser)
- Native **frameworks**: AppKit, Speech, AVFoundation, Core Graphics
- The **delegate pattern** (`AppDelegate`)
- **Closures** as a Swift concept (same idea as JS callback functions, new syntax)
- `guard let` / optionals (`?`, `!`) - Swift's approach to "this might not exist"
- **System permissions** beyond the browser sandbox: Microphone, Speech
  Recognition, Accessibility, Input Monitoring
- **Global event monitoring** and **synthetic input** (posting fake keyboard
  events to other apps)

## Detailed explanations

### Why this couldn't be a webpage

Every previous project ran inside a browser tab, which is deliberately
"sandboxed" - it can only see and touch its own page. A browser tab can
never: watch for a key press while some *other* app is focused, or type
text into a *different* app's text box. That's not a missing feature, it's
a safety boundary - if any website could do that, every website could
secretly log your passwords as you type them into your bank's site in
another tab.

To do the things Wispr does, you need an actual installed app that the
*user* explicitly grants special permissions to, one at a time, through
System Settings - which is exactly the permission dance you went through
setting this up.

**Real world:** this sandbox boundary is why browser extensions (not
regular websites) are the ones that can do things like "block ads across
every site" or "autofill passwords" - they ask for extra permissions
explicitly, the same category of trade-off as this app.

### Swift and Xcode, briefly

Swift is Apple's language for building Mac, iPhone, and iPad apps - similar
in spirit to JavaScript (both are relatively modern, readable languages),
but with a stricter type system: Swift generally wants to know up front
whether a variable is a `String`, an `Int`, etc. rather than figuring it
out as the program runs.

Xcode is Apple's all-in-one tool for writing, building, and running Swift
apps - it plays the role your text editor plays for the web projects, plus
the role your browser played (actually running the code), combined into
one program.

### The delegate pattern (`AppDelegate`)

`AppDelegate.swift` is a class that AppKit (the framework running the app)
calls specific methods on automatically, at specific moments - like
`applicationDidFinishLaunching`, called the instant the app is ready to go.
You never call that method yourself; you just define what should happen
when AppKit eventually calls it.

This is the same *shape* of idea as `addEventListener` in JavaScript
(`button.addEventListener("click", ...)` - "call this function when a click
happens, whenever that turns out to be") but applied to whole-app lifecycle
events instead of DOM events.

**Real world:** delegation is everywhere in Apple's frameworks - a table of
rows (like Mail's inbox list) has a "data source delegate" that gets asked
"what goes in row 5?" on demand, rather than being handed the entire list
up front.

### Closures

`HotkeyMonitor` takes two closures in its initializer -
`onStart: () -> Void` and `onStop: () -> Void`. A closure is Swift's name
for exactly what JavaScript calls a function passed around as a value (an
arrow function, `() => { ... }`, is JS's version of the same idea).

We use them so `HotkeyMonitor` never needs to know anything about speech
recognition - `AppDelegate` just hands it two small functions to call at
the right moments, keeping the two files independent of each other. You
could completely rewrite what happens when the key is pressed without
touching `HotkeyMonitor.swift` at all.

### Optionals (`?` and `!`) and `guard let`

Swift makes you be explicit about values that might not exist. A regular
`String` always has a value; a `String?` ("optional String") might be a
real string, or might be `nil` (Swift's version of `null`/`undefined`).

`guard let source = CGEventSource(stateID: .hidSystemState) else { return }`
reads as: "try to get a real value here; if it turns out there isn't one,
bail out of this function immediately." This forces you to explicitly
decide what happens in the "nothing there" case, rather than accidentally
crashing later when code assumes a value exists that doesn't.

**Real world:** this exact category of bug - code assuming something exists
when it doesn't - is one of the most common sources of crashes in software
generally (in JS it shows up as "Cannot read property of undefined").
Swift's optionals are a language-level attempt to catch that class of bug
at compile time instead of at 2am in a crash report.

### System permissions beyond the browser

The web version of this project only ever needed one permission: the
microphone, granted once per website. This native version needs four,
because it does four categorically more powerful things:

| Permission | Why this app needs it |
|---|---|
| Microphone | To hear you at all |
| Speech Recognition | To send audio to Apple's on-device/cloud model and get text back |
| Accessibility | To type synthetic keystrokes into *other* apps |
| Input Monitoring | To detect the `fn` key while some *other* app is focused |

**Real world:** this is exactly the same permission list real dictation
and automation tools need - Wispr, Raycast, Alfred, and text expanders like
TextExpander all request this same combination, for the same underlying
reasons.

### Global event monitoring and synthetic input

`NSEvent.addGlobalMonitorForEvents` and `CGEvent(...).post(tap:)` are two
sides of the same coin: one *reads* input system-wide, the other *writes*
(fake) input system-wide. Both exist at a low level of the operating system
- below individual apps - which is exactly why both require explicit user
permission to use.

**Real world:** any tool that does "press a hotkey anywhere, then something
happens" (window-snapping tools like Rectangle, clipboard managers, Spotlight
itself) relies on the read side of this; anything that "fills in a form for
you" or "types a snippet when you type a shortcut" relies on the write side.
