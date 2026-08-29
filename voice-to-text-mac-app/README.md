# Voice to Text (Mac menu bar app)

A tiny native macOS app that works like Wispr: hold a key anywhere on your
Mac, talk, let go, and the words get typed into whatever text box you're
focused on - including the Claude desktop app.

This is a **different kind of project** from everything else in this repo.
Every other project here is a webpage (HTML/CSS/JS) that runs inside a
browser tab, which is why it can't do things like listen for a key press
while some *other* app is focused, or type text into that other app for
you - browsers deliberately aren't allowed to touch anything outside their
own tab. To do that, you need a real installed app with the operating
system's permission, which means a different language (Swift) and a
different tool (Xcode) instead of a browser.

## How it works, in plain terms

- **`HotkeyMonitor.swift`** watches your keyboard system-wide for the `fn`
  key going down and up (not just while this app is focused - anywhere).
- **`SpeechManager.swift`** turns on the microphone and streams it through
  Apple's built-in speech recognizer (the same engine behind Siri
  dictation) while the key is held.
- **`TextInserter.swift`** takes the recognized sentence and "types" it into
  whichever app currently has keyboard focus, the instant you let go of the
  key.
- **`AppDelegate.swift`** wires all three together and puts a small
  microphone icon in your menu bar so you can see it's running (and quit
  it).

## Setting it up in Xcode

You'll need Xcode installed (free, from the Mac App Store) and a Mac
running macOS 13 (Ventura) or newer.

1. Open Xcode &rarr; **File &rarr; New &rarr; Project...**
2. Choose **macOS &rarr; App**, click Next.
3. Product Name: `VoiceToText` (or anything you like). Interface:
   **SwiftUI**. Language: **Swift**. Leave the other checkboxes
   unchecked.
4. When it asks where to save, navigate to this folder
   (`voice-to-text-mac-app`) inside your local clone of this repo, and save
   it there. Xcode will create a project alongside these files.
5. In Xcode's left-hand file list (the "Navigator"), you'll see Xcode
   already generated an `App.swift` file and a `ContentView.swift` file.
   - Delete `ContentView.swift` (right-click &rarr; Delete &rarr; Move to
     Trash) - we don't need any window/UI for this app.
   - Open the auto-generated `...App.swift` file and replace its entire
     contents with the code from **`VoiceToTextMacApp.swift`** in this
     folder (just the `@main struct ... { }` part - keep Xcode's own
     filename if you like, only the *content* needs to match).
6. Add the other three source files as new files in the project: right
   click your project folder in Xcode's Navigator &rarr; **New File...
   &rarr; Swift File**, name it to match, and paste in the matching content
   from this folder:
   - `AppDelegate.swift`
   - `HotkeyMonitor.swift`
   - `SpeechManager.swift`
   - `TextInserter.swift`

## Two settings you must change in Xcode before it'll work

1. **Turn off App Sandbox.** Click your project at the top of the
   Navigator &rarr; select your app's target &rarr; **Signing & Capabilities**
   tab. If you see an "App Sandbox" box listed, click the small **x** in
   its corner to remove it. This app needs to watch keyboard input and type
   into *other* apps, which the sandbox specifically exists to prevent -
   that's fine for a personal tool you're running only on your own Mac, but
   it does mean this app couldn't be published on the App Store as-is.

2. **Add two permission descriptions.** Still on your target, go to the
   **Info** tab. Click the **+** button to add two rows:
   - Key: `Privacy - Microphone Usage Description` &rarr; Value:
     `Used to turn your speech into text.`
   - Key: `Privacy - Speech Recognition Usage Description` &rarr; Value:
     `Used to turn your speech into text.`

   (These are the messages macOS shows you in the permission popup - without
   them, the app crashes instantly the first time it tries to use the mic.)

## Running it

Press the Run button (▶) in Xcode, or `Cmd+R`.

The first time it launches, macOS will pop up several permission requests
in a row - approve all of them:

- **Microphone** - lets it hear you.
- **Speech Recognition** - lets it turn audio into text.
- **Accessibility** - lets it type into other apps. If this specific popup
  doesn't appear automatically, go to **System Settings &rarr; Privacy &
  Security &rarr; Accessibility** and add/enable the app yourself.
- **Input Monitoring** - lets it detect the `fn` key while some other app
  is focused. If it's not requested automatically, add/enable it under
  **System Settings &rarr; Privacy & Security &rarr; Input Monitoring**.

After granting a permission in System Settings, **quit and re-run the app**
- macOS only picks up some of these on the next launch, not instantly.

One more setting worth checking: **System Settings &rarr; Keyboard &rarr;
Dictation &rarr; Shortcut**. If it's set to `fn`, macOS's own dictation will
also try to react to the same key press as this app. Either turn that
system shortcut **Off**, or edit `HotkeyMonitor.swift` to use a different
key if you'd rather keep both.

## Using it

1. Click into any text box in any app (Claude desktop, Notes, Slack,
   whatever).
2. Hold down `fn`, and start talking.
3. Let go of `fn` when you're done with that sentence - the text appears
   right where your cursor was.
4. Look for a small mic icon in your menu bar (top-right of the screen) -
   it fills in solid while it's actively listening, so you can tell it's
   working.
5. Click the menu bar icon &rarr; Quit, whenever you want to close the app.

## Known rough edges (this is a first version, built for you to try and
report back on - I don't have a Mac to test it on myself)

- If the app doesn't seem to detect `fn` at all after granting Input
  Monitoring, check that you granted it to the actual **built app**, not
  just to Xcode. Permissions in the "Privacy & Security" list are tied to
  a specific app on disk - if you rebuild into a different location, the
  grant can silently stop applying, and you'll need to re-add it (or
  remove the stale entry first). Building via `Cmd+R` reuses the same
  build location each time, so this is usually only an issue after moving
  the app.
- If dictation seems to hang or say nothing after you release `fn`, check
  Xcode's console output at the bottom of the window for an error message
  from `SFSpeechRecognizer` and send it my way.
- If typing works but characters look wrong/garbled in some app, that
  app may not handle the "type a whole string at once" trick well - let
  me know which app, and I can switch it to typing one character at a
  time instead.
