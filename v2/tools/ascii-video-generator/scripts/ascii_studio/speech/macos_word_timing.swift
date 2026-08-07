import AVFoundation
import Foundation

struct Boundary: Codable {
    let start: Double
    var end: Double
    let text: String
}

final class BoundaryDelegate: NSObject, AVSpeechSynthesizerDelegate {
    private let source: String
    private let lock = NSLock()
    private(set) var boundaries: [Boundary] = []
    var framesWritten: AVAudioFramePosition = 0
    var sampleRate: Double = 0

    init(source: String) {
        self.source = source
    }

    func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        willSpeakRangeOfSpeechString characterRange: NSRange,
        utterance: AVSpeechUtterance
    ) {
        lock.lock()
        let start = sampleRate > 0 ? Double(framesWritten) / sampleRate : 0
        let token = (source as NSString).substring(with: characterRange)
        boundaries.append(Boundary(start: start, end: start, text: token))
        lock.unlock()
    }

    func snapshot(totalDuration: Double) -> [Boundary] {
        lock.lock()
        defer { lock.unlock() }
        var output = boundaries
        for index in output.indices {
            output[index].end = index + 1 < output.count ? output[index + 1].start : totalDuration
        }
        return output
    }
}

guard CommandLine.arguments.count == 6 else {
    FileHandle.standardError.write(Data("usage: timing voice wpm audio.caf timings.json text.txt\n".utf8))
    exit(2)
}

let requestedVoice = CommandLine.arguments[1]
let wordsPerMinute = Float(CommandLine.arguments[2]) ?? 175
let audioURL = URL(fileURLWithPath: CommandLine.arguments[3])
let timingURL = URL(fileURLWithPath: CommandLine.arguments[4])
let textURL = URL(fileURLWithPath: CommandLine.arguments[5])
let source = try String(contentsOf: textURL, encoding: .utf8)

let voices = AVSpeechSynthesisVoice.speechVoices()
let baseVoice = requestedVoice.split(separator: "(", maxSplits: 1).first.map {
    String($0).trimmingCharacters(in: .whitespaces)
} ?? requestedVoice
let languageHint: String? = {
    let lowered = requestedVoice.lowercased()
    if lowered.contains("mexico") || lowered.contains("méxico") { return "es-MX" }
    if lowered.contains("spain") || lowered.contains("españa") { return "es-ES" }
    return nil
}()
let selectedVoice = voices.first {
    ($0.name.caseInsensitiveCompare(baseVoice) == .orderedSame &&
     (languageHint == nil || $0.language == languageHint)) ||
    $0.identifier.caseInsensitiveCompare(requestedVoice) == .orderedSame ||
    $0.identifier.localizedCaseInsensitiveContains(requestedVoice)
}
guard let voice = selectedVoice else {
    let available = voices.filter { $0.language.hasPrefix("es") }.map { "\($0.name) [\($0.language)]" }.joined(separator: ", ")
    FileHandle.standardError.write(Data("voice '\(requestedVoice)' not found; Spanish voices: \(available)\n".utf8))
    exit(3)
}

let utterance = AVSpeechUtterance(string: source)
utterance.voice = voice
utterance.rate = max(AVSpeechUtteranceMinimumSpeechRate,
                     min(AVSpeechUtteranceMaximumSpeechRate,
                         AVSpeechUtteranceDefaultSpeechRate * wordsPerMinute / 175.0))

let delegate = BoundaryDelegate(source: source)
let synthesizer = AVSpeechSynthesizer()
synthesizer.delegate = delegate
var audioFile: AVAudioFile?
var writeError: Error?
var finished = false

synthesizer.write(utterance) { buffer in
    if finished { return }
    guard let pcm = buffer as? AVAudioPCMBuffer else {
        writeError = NSError(domain: "ascii-studio", code: 1,
                             userInfo: [NSLocalizedDescriptionKey: "speech engine returned a non-PCM buffer"])
        finished = true
        return
    }
    if pcm.frameLength == 0 {
        finished = true
        return
    }
    do {
        if audioFile == nil {
            delegate.sampleRate = pcm.format.sampleRate
            audioFile = try AVAudioFile(forWriting: audioURL, settings: pcm.format.settings)
        }
        try audioFile?.write(from: pcm)
        delegate.framesWritten += AVAudioFramePosition(pcm.frameLength)
    } catch {
        writeError = error
        finished = true
    }
}

// AVSpeechSynthesizer delivers both PCM and boundary callbacks on the main
// run loop.  Pump it instead of blocking the callback queue with a semaphore.
while !finished {
    RunLoop.current.run(mode: .default, before: Date(timeIntervalSinceNow: 0.05))
}
if let error = writeError { throw error }
let duration = delegate.sampleRate > 0 ? Double(delegate.framesWritten) / delegate.sampleRate : 0
let boundaries = delegate.snapshot(totalDuration: duration)
// Close the audio file before the process exits so its final packet/header is
// complete when ffmpeg opens it immediately afterward.
audioFile = nil
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
try encoder.encode(boundaries).write(to: timingURL)
