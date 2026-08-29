// ============================================================
// VoiceToTextMacApp.swift
// ============================================================
// This is the ENTRY POINT of the app - the file Swift looks for
// first when the app launches, marked by the `@main` attribute.
//
// This app has no visible window at all - it lives entirely in the
// menu bar, like Wispr, Bartender, or the Wi-Fi icon. SwiftUI's
// `App` protocol technically requires you to return some `Scene`
// (a window, basically), so we give it an empty, invisible
// `Settings` scene just to satisfy that requirement - it never
// actually shows on screen.
// ============================================================

import SwiftUI

@main
struct VoiceToTextMacApp: App {
    // @NSApplicationDelegateAdaptor bridges SwiftUI (Apple's newer,
    // declarative UI framework) to AppKit (the older framework that
    // still has things SwiftUI doesn't fully cover yet, like menu
    // bar icons and global keyboard monitoring). This one line hands
    // control of app-level events over to our AppDelegate class.
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}
