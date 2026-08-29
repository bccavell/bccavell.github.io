// ============================================================
// AppDelegate.swift
// ============================================================
// The "control center" of the app. AppKit (the traditional Mac app
// framework) calls specific methods on this class automatically at
// key moments - "the app just finished launching," in particular.
// This is the DELEGATION pattern: instead of AppKit needing to know
// everything our app does, we hand it an object and it calls us
// back only when something relevant happens.
// ============================================================

import Cocoa
import Speech
import AVFoundation
// ApplicationServices is where AXIsProcessTrustedWithOptions (the
// Accessibility permission check below) actually lives - Cocoa alone
// doesn't reliably pull it in.
import ApplicationServices

class AppDelegate: NSObject, NSApplicationDelegate {

    // The little icon that lives in the menu bar next to the clock,
    // Wi-Fi, and battery icons. Marked as a stored property (not a
    // local variable) so it stays alive for the whole time the app
    // runs - if it were a local variable inside a function, it would
    // disappear the moment that function returned.
    var statusItem: NSStatusItem!

    var hotkeyMonitor: HotkeyMonitor!
    var speechManager: SpeechManager!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Hides the Dock icon and Cmd+Tab entry. This is exactly what
        // turns a normal-looking Mac app into a lightweight "menu bar
        // utility" feel, the same category Wispr, Bartender, and
        // Rectangle live in.
        NSApp.setActivationPolicy(.accessory)

        setUpStatusItem()
        requestPermissions()
        checkAccessibilityPermission()

        speechManager = SpeechManager()

        // Passing two closures (small, unnamed functions) in here means
        // HotkeyMonitor never needs to know anything about speech
        // recognition - it just calls "the thing I was told to call"
        // when the key goes down or up. This keeps the two pieces of
        // code decoupled: you could swap out how dictation works
        // entirely without touching HotkeyMonitor at all.
        hotkeyMonitor = HotkeyMonitor(
            onStart: { [weak self] in self?.startDictating() },
            onStop: { [weak self] in self?.stopDictating() }
        )
        hotkeyMonitor.start()
    }

    func setUpStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusBar.squareLength)
        if let button = statusItem.button {
            // SF Symbols are Apple's built-in icon set - "mic" ships on
            // every Mac already, so we don't need to design or bundle
            // our own icon image files.
            button.image = NSImage(systemSymbolName: "mic", accessibilityDescription: "Voice to Text")
        }

        // Menu bar-only apps have no Dock icon to right-click for
        // "Quit" - this dropdown menu is the only quit button that
        // exists, so it's worth including even though it's simple.
        let menu = NSMenu()
        let hint = NSMenuItem(title: "Hold \(HotkeyMonitor.hotkeyName) to dictate", action: nil, keyEquivalent: "")
        hint.isEnabled = false
        menu.addItem(hint)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem.menu = menu
    }

    // macOS requires apps to explicitly ask before touching sensitive
    // features like the microphone - the user sees a real system
    // popup the first time. We ask once, up front, rather than
    // surprising them mid-dictation with a popup that interrupts
    // whatever they were doing.
    func requestPermissions() {
        SFSpeechRecognizer.requestAuthorization { _ in }
        AVCaptureDevice.requestAccess(for: .audio) { _ in }
    }

    // Accessibility permission is what lets this app send synthetic
    // keystrokes to WHATEVER app you're focused on (see
    // TextInserter.swift) - macOS treats that as powerful enough that
    // it needs its own separate, explicit grant in System Settings.
    // Passing `prompt: true` makes macOS pop up that request
    // automatically the first time, instead of us having to explain
    // where to go looking for it.
    func checkAccessibilityPermission() {
        let options: NSDictionary = [kAXTrustedCheckOptionPrompt.takeRetainedValue() as String: true]
        AXIsProcessTrustedWithOptions(options)
    }

    func startDictating() {
        statusItem.button?.image = NSImage(systemSymbolName: "mic.fill", accessibilityDescription: "Listening")
        speechManager.start()
    }

    func stopDictating() {
        statusItem.button?.image = NSImage(systemSymbolName: "mic", accessibilityDescription: "Voice to Text")
        speechManager.stop { text in
            guard !text.isEmpty else { return }
            TextInserter.type(text)
        }
    }
}
