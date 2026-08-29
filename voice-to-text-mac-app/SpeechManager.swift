// ============================================================
// SpeechManager.swift
// ============================================================
// Wraps Apple's built-in speech recognition (the "Speech"
// framework) - the same engine behind Siri dictation. Compare this
// to voice-to-text/script.js in the web version of this project:
// the JS version asked the BROWSER to listen to the mic; this
// version asks the OPERATING SYSTEM directly, since there's no
// browser involved in a native menu bar app.
// ============================================================

import Speech
import AVFoundation

class SpeechManager {

    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private let audioEngine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    // Updated continuously as speech comes in, same "keep the latest
    // guess in a variable" idea as `finalTranscript` in the web
    // version's script.js.
    private var latestTranscript = ""

    func start() {
        latestTranscript = ""

        let request = SFSpeechAudioBufferRecognitionRequest()

        // "On-device" recognition means the speech model runs locally
        // on your Mac's own chip - no audio leaves the machine, which
        // is both faster and more private for a tool that will hear
        // everything you dictate. Not every Mac/macOS combination
        // supports it though, so we check first and only ask for it
        // when it's actually available - otherwise we fall back to
        // Apple's server-based recognition rather than failing outright.
        request.requiresOnDeviceRecognition = recognizer?.supportsOnDeviceRecognition ?? false
        request.shouldReportPartialResults = true
        self.request = request

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        // A "tap" listens in on the raw microphone audio as it flows
        // through the engine, without redirecting or interrupting it -
        // like clipping a second wire onto a circuit to measure it,
        // rather than rerouting the signal itself.
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }

        audioEngine.prepare()
        try? audioEngine.start()

        task = recognizer?.recognitionTask(with: request) { [weak self] result, _ in
            if let result = result {
                self?.latestTranscript = result.bestTranscription.formattedString
            }
        }
    }

    // `completion` is a closure the CALLER provides, run once we've
    // finished tearing everything down and know the final transcript.
    // This is the same idea as `.then()`/`await` for a Promise in the
    // JS version: "do this other thing once the async work is done."
    func stop(completion: @escaping (String) -> Void) {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        task?.cancel()

        completion(latestTranscript)
    }
}
