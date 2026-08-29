// ============================================================
// TextInserter.swift
// ============================================================
// "Types" the recognized text into whatever app is currently
// focused (Claude, Notes, Slack, a browser - anything with a text
// field) by generating synthetic keyboard events that are
// indistinguishable, to the receiving app, from real typing. This
// is the same trick every dictation tool (Wispr included) and
// automation tool relies on.
//
// `enum` with no cases is a common Swift trick for a namespace that
// holds only static functions - there's never a reason to create an
// actual TextInserter "instance," so this stops anyone from
// accidentally trying to.
// ============================================================

import Cocoa

enum TextInserter {

    static func type(_ text: String) {
        // The "system-wide" event source represents input as if it
        // came from the real keyboard hardware, which is exactly why
        // this needs the Accessibility permission - macOS wants to be
        // sure you deliberately approved an app that's able to inject
        // input into OTHER apps, not just its own.
        guard let source = CGEventSource(stateID: .hidSystemState) else { return }
        guard let keyDown = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: true) else { return }
        let keyUp = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: false)

        // A keyDown event doesn't have to represent a single key -
        // attaching a whole Unicode string to it lets us "type" an
        // entire sentence (including punctuation, accents, emoji) in
        // one shot, rather than simulating every individual keystroke
        // ourselves.
        let utf16Chars = Array(text.utf16)
        keyDown.keyboardSetUnicodeString(stringLength: utf16Chars.count, unicodeString: utf16Chars)

        // .cghidEventTap posts the event into the same low-level
        // pipeline real hardware input goes through, so whatever app
        // currently has keyboard focus receives it exactly like a
        // real keystroke - no clipboard involved, so your existing
        // copied text is left untouched.
        keyDown.post(tap: .cghidEventTap)
        keyUp?.post(tap: .cghidEventTap)
    }
}
