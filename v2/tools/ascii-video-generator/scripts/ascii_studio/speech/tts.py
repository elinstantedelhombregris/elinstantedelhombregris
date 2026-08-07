"""Voice synthesis with native or cloud word boundaries and a silent fallback."""

from __future__ import annotations

import asyncio
import json
import re
import tempfile
from pathlib import Path

import numpy as np

from ascii_studio.audio.io import SAMPLE_RATE, silence_wav, wav_duration
from ascii_studio.speech.captions import alignment_token
from ascii_studio.storyboard.schema import WordTiming
from ascii_studio.util import require_binary, run

DEFAULT_EDGE_VOICE = "es-AR-TomasNeural"
DEFAULT_EDGE_RATE = "-8%"
DEFAULT_EDGE_PITCH = "-4Hz"
DEFAULT_SAY_VOICE = "Reed (Spanish (Mexico))"
DEFAULT_SAY_RATE = 160
VOICE_PERFORMANCE_CHOICES = ("flat", "editorial", "dramatic")


def estimate_word_timings(text: str, duration: float) -> list[WordTiming]:
    words = re.findall(r"\S+", text)
    weights = np.array([max(1.0, len(re.sub(r"\W", "", word)) ** 0.55) for word in words], dtype=np.float64)
    weights /= weights.sum() if len(weights) else 1.0
    cursor = 0.0
    timings: list[WordTiming] = []
    for word, weight in zip(words, weights):
        end = cursor + duration * float(weight)
        timings.append(WordTiming(cursor, end, word))
        cursor = end
    return timings


def expand_native_boundaries(text: str, payload: list[dict]) -> list[WordTiming]:
    """Expand occasional multi-word macOS boundary events and restore source punctuation."""
    source_words = [word for word in re.findall(r"\S+", text) if alignment_token(word)]
    expanded: list[WordTiming] = []
    for item in payload:
        words = [word for word in re.findall(r"\S+", item["text"]) if alignment_token(word)]
        if not words:
            continue
        local = estimate_word_timings(words and " ".join(words), float(item["end"]) - float(item["start"]))
        expanded.extend(WordTiming(
            float(item["start"]) + value.start,
            float(item["start"]) + value.end,
            value.text,
        ) for value in local)
    source_tokens = [alignment_token(word) for word in source_words]
    boundary_tokens = [alignment_token(value.text) for value in expanded]
    if source_tokens != boundary_tokens:
        raise RuntimeError("macOS speech boundaries did not preserve the narration token sequence")
    return [WordTiming(value.start, value.end, source_words[index]) for index, value in enumerate(expanded)]


def synthesize_macos_native(text: str, out_dir: Path, slug: str,
                            say_voice: str, say_rate: int) -> tuple[Path, list[WordTiming], float]:
    """Render offline speech and sample-anchored word timings through AVFoundation."""
    require_binary("swift")
    require_binary("ffmpeg")
    voice_wav = out_dir / f"{slug}-voice.wav"
    swift_source = Path(__file__).with_name("macos_word_timing.swift")
    with tempfile.TemporaryDirectory(prefix="ascii-studio-native-voice-") as tmp:
        tmp_dir = Path(tmp)
        text_path = tmp_dir / "narration.txt"
        audio_path = tmp_dir / "voice.caf"
        timing_path = tmp_dir / "boundaries.json"
        text_path.write_text(text, encoding="utf-8")
        run([
            "swift", "-module-cache-path", "/tmp/ascii-studio-swift-cache", swift_source,
            say_voice, str(say_rate), audio_path, timing_path, text_path,
        ])
        payload = json.loads(timing_path.read_text(encoding="utf-8"))
        timings = expand_native_boundaries(text, payload)
        run(["ffmpeg", "-y", "-i", audio_path, "-ar", str(SAMPLE_RATE), "-ac", "1", voice_wav], quiet=True)
    duration = wav_duration(voice_wav)
    if not timings:
        raise RuntimeError("macOS speech engine returned no word boundaries")
    return voice_wav, timings, duration


async def synthesize_edge_async(text: str, path: Path, voice: str, rate: str, pitch: str) -> list[WordTiming]:
    try:
        import edge_tts  # type: ignore
    except ImportError as exc:
        raise RuntimeError("edge-tts is required for --tts edge. Install it with: python -m pip install edge-tts") from exc
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    timings: list[WordTiming] = []
    with path.open("wb") as audio:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                if not alignment_token(chunk["text"]):
                    continue
                start = chunk["offset"] / 10_000_000
                duration = chunk["duration"] / 10_000_000
                timings.append(WordTiming(start, start + duration, chunk["text"]))
    return timings


def synthesize_voice(
    text: str,
    out_dir: Path,
    slug: str,
    mode: str,
    voice: str,
    rate: str,
    pitch: str,
    say_voice: str,
    say_rate: int,
    render_seconds: float | None,
) -> tuple[Path, list[WordTiming], float]:
    voice_wav = out_dir / f"{slug}-voice.wav"
    if mode == "none":
        duration = render_seconds or max(10.0, len(text.split()) / 2.65)
        silence_wav(voice_wav, duration)
        return voice_wav, estimate_word_timings(text, duration), duration
    require_binary("ffmpeg")
    if mode == "say":
        return synthesize_macos_native(text, out_dir, slug, say_voice, say_rate)
    mp3 = out_dir / f"{slug}-voice.mp3"
    timings = asyncio.run(synthesize_edge_async(text, mp3, voice, rate, pitch))
    run(["ffmpeg", "-y", "-i", mp3, "-ar", str(SAMPLE_RATE), "-ac", "1", voice_wav], quiet=True)
    duration = wav_duration(voice_wav)
    if not timings:
        raise RuntimeError("Edge TTS did not return WordBoundary timings; refusing to estimate publishable karaoke sync")
    return voice_wav, timings, duration
