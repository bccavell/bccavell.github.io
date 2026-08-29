// ============================================================
// HotkeyMonitor.swift
// ============================================================
// Watches for a specific key being held down ANYWHERE on the
// system - not just while our app is the focused/frontmost app (we
// don't even have a window to focus). This is exactly what makes
// "hold a key while typing in Claude, Notes, or Mail and it just
// works" possible - Wispr and similar dictation tools use this same
// mechanism under the hood.
// ============================================================

import Cocoa

class HotkeyMonitor {

    // fn (labelled "Globe" on newer keyboards) is a good default: it's
    // a key almost nobody uses for typing text, which is exactly why
    // Wispr defaults to it too.
    //
    // Heads up: macOS's OWN built-in dictation can ALSO be bound to
    // fn (System Settings > Keyboard > Dictation > Shortcut). If you
    // want fn free for this app specifically, set that system
    // shortcut to "Off" first, so the two don't fight over the same
    // key.
    static let hotkeyName = "fn"

    // Tracks whether WE currently think the key is held down, so we
    // only fire onStart/onStop once per press - not once per event
    // (flagsChanged can fire more than you'd expect).
    private var isKeyDown = false

    // The return value from addGlobalMonitorForEvents is an opaque
    // "token" representing this specific subscription - we hold onto
    // it only so we can hand it back to removeMonitor later if we
    // ever want to stop listening.
    private var monitor: Any?

    let onStart: () -> Void
    let onStop: () -> Void

    // `() -> Void` is the type of "a function that takes nothing and
    // returns nothing" - i.e. these are just plain functions passed
    // around as values (closures), same idea as an event listener
    // callback in JavaScript.
    init(onStart: @escaping () -> Void, onStop: @escaping () -> Void) {
        self.onStart = onStart
        self.onStop = onStop
    }

    func start() {
        // `.global` (as opposed to `.local`) is the important part -
        // it fires for key events happening in ANY app, not just
        // ours. This is exactly why macOS requires the "Input
        // Monitoring" permission for it: an app that can watch every
        // keystroke system-wide is powerful enough that the OS wants
        // you to approve it explicitly, the same way it does for the
        // microphone or your location.
        monitor = NSEvent.addGlobalMonitorForEvents(matching: .flagsChanged) { [weak self] event in
            self?.handle(event)
        }
    }

    private func handle(_ event: NSEvent) {
        // Unlike a letter or number key, fn doesn't generate its own
        // keyDown/keyUp events - it shows up as a MODIFIER flag
        // (grouped with Shift, Control, Command, etc.) that's either
        // present or absent on an event. `.contains` checks whether
        // that particular flag is part of the current key state.
        let fnIsDown = event.modifierFlags.contains(.function)

        if fnIsDown && !isKeyDown {
            isKeyDown = true
            onStart()
        } else if !fnIsDown && isKeyDown {
            isKeyDown = false
            onStop()
        }
    }
}
