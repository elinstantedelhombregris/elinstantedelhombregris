#!/usr/bin/env python3
"""Render a full-script vertical ASCII video for social/mobile distribution."""

from __future__ import annotations

import argparse
import asyncio
import difflib
import json
import math
import re
import subprocess
import tempfile
import unicodedata
import wave
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


V2_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_POST = V2_ROOT / "content/blog/el-cansancio-sagrado-por-qu-ya-no-podemos-esperar.mdx"
DEFAULT_OUT = V2_ROOT / "apps/web/public/media/ascii-videos/el-cansancio-sagrado"
DEFAULT_SEAL_LOGO = Path("/Users/juanb/Library/CloudStorage/OneDrive-Personal/Hombre Gris/Cruz Orlada Logo NB.png")

WIDTH = 720
HEIGHT = 1280
FPS = 15
VOICE = "Paulina"
VOICE_RATE = 178
EDGE_VOICE = "es-AR-TomasNeural"
EDGE_EXPRESSIVE_VOICE = "es-AR-ElenaNeural"
EDGE_RATE = "-8%"
EDGE_PITCH = "+3Hz"
FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")

COLS = 78
ROWS = 88
ASCII_FONT_SIZE = 11
TITLE_FONT_SIZE = 34
SECTION_FONT_SIZE = 22
CAPTION_FONT_SIZE = 28
SMALL_FONT_SIZE = 15
URL_FONT_SIZE = 18
CHARSET = np.array(list("  .`',:;i!lI?+*tfLCG08@"))
PLATFORM_URL = "www.elinstantedelhombregris.com"
CAPTION_CENTER_Y = int(HEIGHT * 0.58)
SEAL_PALETTE = " .,:;ilI?+*tfLCG08@"
DEFAULT_SEAL_WORDS = ["HOMBRE", "GRIS", "SOBERANIA", "SERVICIO", "DISENO", "ARGENTINA"]
SEAL_STOPWORDS = {
    "para",
    "como",
    "porque",
    "desde",
    "donde",
    "cuando",
    "quien",
    "quienes",
    "nadie",
    "todos",
    "todas",
    "necesitan",
    "necesita",
    "sobre",
    "contra",
    "entre",
    "este",
    "esta",
    "estos",
    "estas",
    "algo",
    "cada",
    "pero",
    "mide",
    "dice",
    "deberiamos",
    "deberíamos",
}
VISUAL_STOPWORDS = SEAL_STOPWORDS | {
    "apertura",
    "hombre",
    "gris",
    "acto",
    "poder",
    "capital",
    "neural",
    "online",
    "esta",
    "este",
    "esto",
    "tres",
    "antes",
    "termine",
    "hizo",
    "ahora",
    "mañana",
    "manana",
    "necesitas",
    "necesitás",
    "otra",
    "otro",
    "mismo",
    "misma",
    "vida",
    "usar",
    "usar",
    "usar",
    "argentina",
    "social",
    "transformacion",
    "transformacin",
    "posible",
}


@dataclass(frozen=True)
class Caption:
    index: int
    start: float
    end: float
    text: str
    section: str


@dataclass(frozen=True)
class ScriptBlock:
    section: str
    text: str


@dataclass(frozen=True)
class WordTiming:
    start: float
    end: float
    text: str


@dataclass(frozen=True)
class SealAssets:
    large: np.ndarray
    final: np.ndarray
    small: np.ndarray
    micro: np.ndarray
    keyword_stream: str
    transition_starts: tuple[float, ...]
    watermark_starts: tuple[float, ...]


@dataclass(frozen=True)
class VisualTheme:
    opening_label: str
    fallback_keyword: str
    final_keyword: str
    keywords: tuple[str, ...]
    section_keywords: dict[str, str]


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def capture(command: list[str]) -> str:
    return subprocess.check_output(command, text=True).strip()


def clean_frontmatter_value(value: str) -> str:
    return value.strip().strip("'\"")


def parse_post(path: Path) -> tuple[dict[str, str | list[str]], str]:
    raw = path.read_text(encoding="utf-8")
    match = re.match(r"---\n([\s\S]*?)\n---\n", raw)
    frontmatter: dict[str, str | list[str]] = {}
    body = raw
    if match:
        list_key: str | None = None
        for line in match.group(1).splitlines():
            list_item = re.match(r"^\s*-\s+(.+?)\s*$", line)
            if list_item and list_key:
                current = frontmatter.setdefault(list_key, [])
                if isinstance(current, list):
                    current.append(clean_frontmatter_value(list_item.group(1)))
                continue
            list_key = None
            scalar = re.match(r"^([A-Za-z0-9_]+):\s*(.*?)\s*$", line)
            if scalar:
                key = scalar.group(1)
                value = clean_frontmatter_value(scalar.group(2))
                if value:
                    frontmatter[key] = value
                else:
                    frontmatter[key] = []
                    list_key = key
        body = raw[match.end() :]
    return frontmatter, body.strip()


def frontmatter_text(frontmatter: dict[str, str | list[str]], key: str, default: str = "") -> str:
    value = frontmatter.get(key)
    return value if isinstance(value, str) else default


def frontmatter_list(frontmatter: dict[str, str | list[str]], key: str) -> list[str]:
    value = frontmatter.get(key)
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value:
        return [value]
    return []


def clean_inline(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("—", " — ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def comparable_phrase(text: str) -> str:
    text = clean_inline(text).lower()
    text = re.sub(r"[^\wáéíóúüñ]+", " ", text, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text).strip()


def mdx_to_script(title: str, body: str) -> list[ScriptBlock]:
    blocks = [ScriptBlock("Apertura", title)]
    current_section = "Apertura"
    pending_quote: list[str] = []

    def flush_quote() -> None:
        nonlocal pending_quote
        if pending_quote:
            blocks.append(ScriptBlock(current_section, clean_inline(" ".join(pending_quote))))
            pending_quote = []

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            flush_quote()
            continue
        heading = re.match(r"^#{2,4}\s+(.+)$", line)
        if heading:
            flush_quote()
            current_section = clean_inline(heading.group(1))
            blocks.append(ScriptBlock(current_section, current_section + "."))
            continue
        if line.startswith(">"):
            pending_quote.append(line.lstrip("> ").strip())
            continue
        flush_quote()
        bullet = re.match(r"^[-*]\s+(.+)$", line)
        numbered = re.match(r"^\d+\.\s+(.+)$", line)
        if bullet:
            blocks.append(ScriptBlock(current_section, clean_inline(bullet.group(1))))
        elif numbered:
            blocks.append(ScriptBlock(current_section, clean_inline(numbered.group(1))))
        else:
            blocks.append(ScriptBlock(current_section, clean_inline(line)))
    flush_quote()
    deduped: list[ScriptBlock] = []
    seen: set[str] = set()
    title_key = comparable_phrase(title)
    for block in blocks:
        if not block.text:
            continue
        key = comparable_phrase(block.text)
        if not key:
            continue
        if key == title_key and deduped:
            continue
        if key in seen:
            continue
        seen.add(key)
        deduped.append(block)
    return deduped


def split_sentences(text: str) -> list[str]:
    prepared = re.sub(r"([.!?])\s+", r"\1\n", text)
    prepared = re.sub(r"(:)\s+(?=[A-ZÁÉÍÓÚÑ¿])", r"\1\n", prepared)
    parts = [part.strip() for part in prepared.splitlines() if part.strip()]
    return parts or [text]


def chunk_sentence(sentence: str, max_chars: int = 86, max_words: int = 13) -> list[str]:
    words = sentence.split()
    chunks: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join([*current, word])
        if current and (len(trial) > max_chars or len(current) >= max_words):
            chunks.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        chunks.append(" ".join(current))
    return chunks


def caption_units(blocks: list[ScriptBlock]) -> list[tuple[str, str]]:
    units: list[tuple[str, str]] = []
    for block in blocks:
        for sentence in split_sentences(block.text):
            for chunk in chunk_sentence(sentence):
                units.append((block.section, chunk))
    return units


def weight_for(text: str) -> float:
    words = len(text.split())
    punctuation = 0.25 * sum(text.count(mark) for mark in [".", ":", ";", "?", "!", "—"])
    return max(1.6, words * 0.52 + punctuation)


def build_captions(units: list[tuple[str, str]], narration_duration: float) -> list[Caption]:
    intro = 1.1
    outro = 1.4
    usable = max(10.0, narration_duration - intro - outro)
    weights = [weight_for(text) for _, text in units]
    total = sum(weights)
    captions: list[Caption] = []
    t = intro
    for index, ((section, text), weight) in enumerate(zip(units, weights), start=1):
        duration = usable * (weight / total)
        duration = max(1.65, min(5.2, duration))
        captions.append(Caption(index, t, t + duration, text, section))
        t += duration

    scale = usable / max(usable, captions[-1].end - intro)
    adjusted: list[Caption] = []
    t = intro
    for caption in captions:
        duration = (caption.end - caption.start) * scale
        adjusted.append(Caption(caption.index, t, t + duration, caption.text, caption.section))
        t += duration
    return adjusted


TOKEN_RE = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+", re.UNICODE)


def alignment_tokens(text: str) -> list[str]:
    return [match.group(0).lower() for match in TOKEN_RE.finditer(text)]


def build_precise_captions(units: list[tuple[str, str]], timings: list[WordTiming], duration: float) -> list[Caption]:
    expected_tokens: list[str] = []
    unit_ranges: list[tuple[int, int]] = []
    for _, text in units:
        start = len(expected_tokens)
        expected_tokens.extend(alignment_tokens(text))
        unit_ranges.append((start, len(expected_tokens)))

    actual_tokens: list[str] = []
    for timing in timings:
        tokens = alignment_tokens(timing.text)
        actual_tokens.append(tokens[0] if tokens else comparable_phrase(timing.text))

    expected_to_actual: list[int | None] = [None] * len(expected_tokens)
    matcher = difflib.SequenceMatcher(a=expected_tokens, b=actual_tokens, autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for offset in range(i2 - i1):
                expected_to_actual[i1 + offset] = j1 + offset
        elif tag == "replace":
            span = min(i2 - i1, j2 - j1)
            for offset in range(span):
                expected_to_actual[i1 + offset] = j1 + offset

    captions: list[Caption] = []
    for index, ((section, text), (unit_start, unit_end)) in enumerate(zip(units, unit_ranges), start=1):
        if unit_start == unit_end:
            continue
        mapped = [value for value in expected_to_actual[unit_start:unit_end] if value is not None]
        if not mapped:
            raise RuntimeError(f"TTS alignment could not map caption {index}: {text}")
        first = timings[mapped[0]]
        last = timings[mapped[-1]]
        following = next((value for value in expected_to_actual[unit_end:] if value is not None), None)
        next_start = timings[following].start if following is not None else duration
        hold = min(0.18, max(0.0, next_start - last.end))
        start = max(0.0, first.start)
        end = min(duration, last.end + hold)
        if following is not None:
            end = min(end, next_start)
        if end <= start:
            end = min(duration, start + 0.12)
        captions.append(Caption(len(captions) + 1, start, end, text, section))
    if timings and captions:
        captions[-1] = Caption(
            captions[-1].index,
            captions[-1].start,
            min(duration, max(captions[-1].end, timings[-1].end + 0.12)),
            captions[-1].text,
            captions[-1].section,
        )
    return captions


def caption_at(captions: list[Caption], t: float) -> Caption | None:
    lo = 0
    hi = len(captions) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        caption = captions[mid]
        if caption.start <= t < caption.end:
            return caption
        if t < caption.start:
            hi = mid - 1
        else:
            lo = mid + 1
    return None


def section_at(captions: list[Caption], t: float) -> str:
    if not captions:
        return "Apertura"
    lo = 0
    hi = len(captions) - 1
    candidate = captions[0]
    while lo <= hi:
        mid = (lo + hi) // 2
        caption = captions[mid]
        if caption.start <= t:
            candidate = caption
            lo = mid + 1
        else:
            hi = mid - 1
    return candidate.section


def normalize_script(blocks: list[ScriptBlock]) -> str:
    lines: list[str] = []
    last_section = ""
    for block in blocks:
        if block.section != last_section and block.section != "Apertura":
            lines.append("")
            lines.append(block.section)
            last_section = block.section
            if comparable_phrase(block.text.rstrip(".")) == comparable_phrase(block.section):
                continue
        lines.append(block.text)
    return "\n\n".join(line for line in lines if line.strip())


def write_script_files(out_dir: Path, slug: str, title: str, blocks: list[ScriptBlock]) -> tuple[Path, Path]:
    body_blocks = blocks[1:] if blocks and blocks[0].text == title else blocks
    text = normalize_script(body_blocks)
    md = out_dir / f"{slug}-full-script.md"
    txt = out_dir / f"{slug}-full-script.txt"
    md.write_text(f"# {title}\n\n{text}\n", encoding="utf-8")
    txt.write_text(f"{title}\n\n{text}\n", encoding="utf-8")
    return md, txt


def format_srt_time(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hh = millis // 3_600_000
    millis %= 3_600_000
    mm = millis // 60_000
    millis %= 60_000
    ss = millis // 1000
    ms = millis % 1000
    return f"{hh:02d}:{mm:02d}:{ss:02d},{ms:03d}"


def format_vtt_time(seconds: float) -> str:
    return format_srt_time(seconds).replace(",", ".")


def write_subtitles(captions: list[Caption], srt_path: Path, vtt_path: Path) -> None:
    srt: list[str] = []
    vtt: list[str] = ["WEBVTT", ""]
    for caption in captions:
        srt.append(str(caption.index))
        srt.append(f"{format_srt_time(caption.start)} --> {format_srt_time(caption.end)}")
        srt.append(caption.text)
        srt.append("")
        vtt.append(f"{format_vtt_time(caption.start)} --> {format_vtt_time(caption.end)}")
        vtt.append(caption.text)
        vtt.append("")
    srt_path.write_text("\n".join(srt), encoding="utf-8")
    vtt_path.write_text("\n".join(vtt), encoding="utf-8")


def narration_text_from_blocks(blocks: list[ScriptBlock]) -> str:
    expressive_lines: list[str] = []
    for block in blocks:
        if not block.text:
            continue
        text = block.text.replace(" — ", "... ")
        if comparable_phrase(text.rstrip(".")) == comparable_phrase(block.section) and block.section != "Apertura":
            text = text.rstrip(".") + "..."
        expressive_lines.append(text)
    return "\n\n".join(expressive_lines)


async def synthesize_edge_voice_async(text: str, voice: str, rate: str, pitch: str, output_mp3: Path) -> list[WordTiming]:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    timings: list[WordTiming] = []
    with output_mp3.open("wb") as audio:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = float(chunk["offset"]) / 10_000_000
                end = start + float(chunk["duration"]) / 10_000_000
                timings.append(WordTiming(start, end, str(chunk["text"])))
    return timings


def synthesize_edge_voice(text: str, output_mp3: Path, output_wav: Path, voice: str, rate: str, pitch: str) -> tuple[float, list[WordTiming]]:
    try:
        timings = asyncio.run(synthesize_edge_voice_async(text, voice, rate, pitch, output_mp3))
    except ImportError as exc:
        raise RuntimeError("edge-tts is required for precise neural TTS alignment") from exc
    run([
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-i",
        str(output_mp3),
        "-ar",
        "48000",
        "-ac",
        "2",
        "-c:a",
        "pcm_s16le",
        str(output_wav),
    ])
    duration = float(capture(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(output_wav)]))
    return duration, timings


def synthesize_voice(script_txt: Path, output_wav: Path, voice: str = VOICE, rate: int = VOICE_RATE) -> float:
    with tempfile.TemporaryDirectory() as tmp:
        aiff = Path(tmp) / "voice.aiff"
        run(["say", "-v", voice, "-r", str(rate), "-o", str(aiff), "-f", str(script_txt)])
        run([
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(aiff),
            "-ar",
            "48000",
            "-ac",
            "2",
            "-c:a",
            "pcm_s16le",
            str(output_wav),
        ])
    return float(capture(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(output_wav)]))


def read_wav(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path), "rb") as wav:
        sr = wav.getframerate()
        channels = wav.getnchannels()
        frames = wav.readframes(wav.getnframes())
    data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    data = data.reshape(-1, channels)
    if channels == 1:
        data = np.repeat(data, 2, axis=1)
    return data[:, :2], sr


def write_wav(path: Path, samples: np.ndarray, sr: int) -> None:
    pcm = np.clip(samples, -1, 1)
    pcm = (pcm * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes(pcm.tobytes())


def midi_to_hz(note: int) -> float:
    return 440.0 * (2 ** ((note - 69) / 12))


def add_note(track: np.ndarray, sr: int, start: float, duration: float, note: int, amp: float, pan: float, shape: str = "sine") -> None:
    start_i = int(start * sr)
    length = int(duration * sr)
    end_i = min(track.shape[0], start_i + length)
    if end_i <= start_i:
        return
    n = end_i - start_i
    x = np.arange(n, dtype=np.float32) / sr
    freq = midi_to_hz(note)
    if shape == "bell":
        tone = np.sin(2 * np.pi * freq * x) + 0.45 * np.sin(2 * np.pi * freq * 2.01 * x)
        tone += 0.16 * np.sin(2 * np.pi * freq * 3.98 * x + 0.4)
    elif shape == "bass":
        tone = np.tanh(1.8 * np.sin(2 * np.pi * freq * x)) * 0.75
    elif shape == "pluck":
        tone = np.sin(2 * np.pi * freq * x) + 0.18 * np.sin(2 * np.pi * freq * 2 * x)
    else:
        tone = np.sin(2 * np.pi * freq * x) + 0.22 * np.sin(2 * np.pi * freq * 2 * x + 0.3)
    attack = max(1, int(min(0.08, duration * 0.15) * sr))
    release = max(1, int(min(0.7, duration * 0.5) * sr))
    env = np.ones(n, dtype=np.float32)
    env[:attack] = np.linspace(0, 1, attack, dtype=np.float32)
    env[-release:] *= np.linspace(1, 0, release, dtype=np.float32)
    env *= np.exp(-x / max(0.3, duration * (0.55 if shape in {"bell", "pluck"} else 1.8)))
    left = math.cos(pan * math.pi / 2)
    right = math.sin(pan * math.pi / 2)
    track[start_i:end_i, 0] += tone * env * amp * left
    track[start_i:end_i, 1] += tone * env * amp * right


def generate_music(duration: float, sr: int) -> np.ndarray:
    total = int((duration + 1.0) * sr)
    track = np.zeros((total, 2), dtype=np.float32)
    chords = [
        [45, 52, 57, 60, 64],
        [48, 55, 60, 64, 67],
        [43, 50, 55, 59, 62],
        [41, 48, 53, 57, 60],
    ]
    melody = [69, 72, 76, 74, 72, 69, 67, 69, 72, 74, 79, 76, 74, 72, 67, 64]
    for bar_start in np.arange(0, duration, 4.8):
        chord = chords[int(bar_start / 4.8) % len(chords)]
        for i, note in enumerate(chord):
            add_note(track, sr, float(bar_start) + i * 0.05, 5.8, note, 0.025, 0.24 + i * 0.12)
        add_note(track, sr, float(bar_start), 4.6, chord[0] - 12, 0.038, 0.5, "bass")
    for i, start in enumerate(np.arange(1.2, duration, 0.6)):
        add_note(track, sr, float(start), 0.95, melody[i % len(melody)], 0.026, 0.25 + 0.5 * ((i % 5) / 4), "bell")
    for i, start in enumerate(np.arange(0.0, duration, 1.2)):
        add_note(track, sr, float(start), 0.35, 81 if i % 2 == 0 else 76, 0.016, 0.74, "pluck")

    rng = np.random.default_rng(71)
    wash = rng.normal(0, 0.011, track.shape).astype(np.float32)
    wash = cv2.GaussianBlur(wash, (0, 0), 18)
    track += wash
    for delay_seconds, gain in [(0.32, 0.19), (0.64, 0.11), (1.28, 0.07)]:
        delay = int(delay_seconds * sr)
        track[delay:, :] += track[:-delay, ::-1] * gain
    fade = int(2.0 * sr)
    envelope = np.ones(total, dtype=np.float32)
    envelope[:fade] = np.linspace(0, 1, fade, dtype=np.float32)
    envelope[-fade:] = np.linspace(1, 0, fade, dtype=np.float32)
    track *= envelope[:, None]
    peak = max(0.001, float(np.max(np.abs(track))))
    return track / peak * 0.42


def mix_voice_and_music(voice_wav: Path, mixed_wav: Path, music_wav: Path) -> tuple[float, int]:
    voice, sr = read_wav(voice_wav)
    music = generate_music(len(voice) / sr, sr)[: len(voice)]

    mono = np.mean(np.abs(voice), axis=1)
    kernel = np.ones(int(0.12 * sr), dtype=np.float32) / max(1, int(0.12 * sr))
    envelope = np.convolve(mono, kernel, mode="same")
    duck = 1.0 - np.clip(envelope * 9.0, 0.0, 0.72)
    ducked_music = music * duck[:, None] * 0.28

    voice_peak = max(0.001, float(np.max(np.abs(voice))))
    voice = voice / voice_peak * 0.78
    mixed = voice + ducked_music
    peak = max(0.001, float(np.max(np.abs(mixed))))
    if peak > 0.98:
        mixed = mixed / peak * 0.98

    write_wav(music_wav, music, sr)
    write_wav(mixed_wav, mixed, sr)
    return len(voice) / sr, sr


GRID_X, GRID_Y = np.meshgrid(np.linspace(0.0, 1.0, COLS), np.linspace(0.0, 1.0, ROWS))


def line_distance_field(x0: float, y0: float, x1: float, y1: float) -> np.ndarray:
    px = GRID_X - x0
    py = GRID_Y - y0
    vx = x1 - x0
    vy = y1 - y0
    u = np.clip((px * vx + py * vy) / (vx * vx + vy * vy), 0.0, 1.0)
    dx = GRID_X - (x0 + u * vx)
    dy = GRID_Y - (y0 + u * vy)
    return np.sqrt(dx * dx + dy * dy)


def field_for(progress: float, t: float, section: str) -> tuple[np.ndarray, tuple[int, int, int], tuple[int, int, int], str]:
    x = GRID_X
    y = GRID_Y
    pulse = 0.08 * np.sin(52 * x + 18 * y + t * 1.8) + 0.04 * np.sin(17 * x - 64 * y + t * 1.1)
    section_l = section.lower()
    if "costo" in section_l or "desconfiamos" in section_l or "radiografía" in section_l:
        fracture = (np.abs(np.sin((x - y + 0.08 * np.sin(t)) * 18)) < 0.045).astype(float)
        scan = (np.mod((x + y + t * 0.12) * 24, 1.0) < 0.09).astype(float)
        core = np.exp(-(((x - 0.5) ** 2) / 0.04 + ((y - 0.5) ** 2) / 0.03))
        return np.clip(0.12 + fracture * 0.56 + scan * 0.18 + core * 0.45 + pulse, 0, 1), (255, 126, 104), (108, 226, 206), "DESCONFIANZA"
    if "ciencia" in section_l or "pasó" in section_l or "actuaron" in section_l:
        ring = np.abs(np.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) - (0.13 + 0.04 * np.sin(t * 0.7))) < 0.009
        wave = 0.5 + 0.5 * np.sin(28 * np.sqrt((x - 0.5) ** 2 + (y - 0.52) ** 2) - t * 2.8)
        grid = (np.mod(x * COLS + t * 1.2, 13) < 0.38).astype(float) + (np.mod(y * ROWS, 9) < 0.28).astype(float)
        return np.clip(0.12 + ring * 0.62 + wave * 0.22 + grid * 0.13 + pulse, 0, 1), (246, 214, 116), (113, 202, 255), "EVIDENCIA"
    if "capas" in section_l or "indignación" in section_l or "ingeniería" in section_l:
        blueprint = (np.mod(x * COLS + t * 2.0, 10) < 0.42).astype(float) + (np.mod(y * ROWS, 8) < 0.34).astype(float)
        diagonal = (line_distance_field(0.14, 0.76, 0.86, 0.26) < 0.007).astype(float)
        layers = (
            (line_distance_field(0.2, 0.38, 0.8, 0.38) < 0.008)
            | (line_distance_field(0.24, 0.52, 0.76, 0.52) < 0.008)
            | (line_distance_field(0.28, 0.66, 0.72, 0.66) < 0.008)
        ).astype(float)
        return np.clip(0.12 + blueprint * 0.18 + diagonal * 0.48 + layers * 0.5 + pulse, 0, 1), (95, 228, 255), (251, 232, 155), "INGENIERIA"
    if "acciones" in section_l or "microacciones" in section_l or "rituales" in section_l:
        points = [(0.25, 0.38), (0.48, 0.28), (0.72, 0.42), (0.36, 0.62), (0.61, 0.68)]
        value = np.zeros_like(x) + 0.1
        for px, py in points:
            value += np.exp(-(((x - px) ** 2 + (y - py) ** 2) / 0.0007)) * 0.45
        for a, b in zip(points, points[1:] + points[:1]):
            value += (line_distance_field(a[0], a[1], b[0], b[1]) < 0.006).astype(float) * 0.36
        return np.clip(value + pulse, 0, 1), (128, 248, 184), (255, 179, 117), "PRACTICA"
    if progress > 0.87:
        line = line_distance_field(0.1, 0.68, 0.9, 0.28)
        reveal = (((x - 0.1) / 0.8) < min(1, (progress - 0.87) / 0.11)).astype(float)
        horizon = np.exp(-((y - 0.64 - 0.04 * np.sin(x * 10 + t)) ** 2) / 0.0007)
        return np.clip(0.13 + np.exp(-(line * 52) ** 2) * reveal * 0.9 + horizon * 0.25 + pulse, 0, 1), (250, 248, 230), (112, 202, 255), "AHORA"
    band = 0.5 + 0.38 * np.sin(30 * y + 4 * np.sin(t * 0.9))
    vertical = 0.28 * np.sin(34 * x + t * 1.7) ** 2
    return np.clip(0.16 + band * 0.32 + vertical + pulse, 0, 1), (226, 232, 220), (118, 214, 255), "CONFIANZA"


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def make_vignette() -> np.ndarray:
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    dx = (xx - WIDTH / 2) / (WIDTH / 2)
    dy = (yy - HEIGHT / 2) / (HEIGHT / 2)
    radius = np.sqrt(dx * dx + dy * dy)
    return np.clip(1.18 - radius * 0.48, 0.62, 1.0).astype(np.float32)


VIGNETTE = make_vignette()


def ascii_fold(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")


def visual_words(text: str, *, max_words: int = 12) -> list[str]:
    words: list[str] = []
    seen: set[str] = set()
    for match in re.finditer(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]{4,}", text, re.UNICODE):
        raw = match.group(0)
        key = ascii_fold(raw).lower()
        if key in VISUAL_STOPWORDS or key in seen:
            continue
        seen.add(key)
        words.append(raw.upper())
        if len(words) >= max_words:
            break
    return words


def compact_label(words: list[str], fallback: str, max_len: int = 24, max_words: int = 2) -> str:
    selected: list[str] = []
    for word in words:
        trial = " ".join([*selected, word])
        if selected and (len(trial) > max_len or len(selected) >= max_words):
            break
        if len(word) <= max_len:
            selected.append(word)
    return " ".join(selected) if selected else fallback


def build_visual_theme(title: str, frontmatter: dict[str, str | list[str]], blocks: list[ScriptBlock]) -> VisualTheme:
    title_words = visual_words(title, max_words=8)
    section_names: list[str] = []
    seen_sections: set[str] = set()
    for block in blocks:
        section_key = comparable_phrase(block.section)
        if section_key == "apertura" or section_key in seen_sections:
            continue
        seen_sections.add(section_key)
        section_names.append(block.section)

    sources = [title, frontmatter_text(frontmatter, "category")]
    sources.extend(tag.replace("-", " ") for tag in frontmatter_list(frontmatter, "tags"))
    sources.extend(section_names[:8])
    all_words = visual_words(" ".join(sources), max_words=14)
    if not all_words:
        all_words = ["IDEA", "ACCION", "SISTEMA"]

    opening_label = compact_label(title_words or all_words, all_words[0], max_len=26, max_words=2)
    fallback_keyword = (title_words or all_words)[0]
    final_candidates = [word for word in [*reversed(title_words), *reversed(all_words)] if word != fallback_keyword]
    final_keyword = final_candidates[0] if final_candidates else fallback_keyword

    section_keywords: dict[str, str] = {"apertura": opening_label}
    for section in section_names:
        section_words = visual_words(section, max_words=4)
        section_keywords[comparable_phrase(section)] = compact_label(section_words, fallback_keyword, max_len=26, max_words=2)
    return VisualTheme(
        opening_label=opening_label,
        fallback_keyword=fallback_keyword,
        final_keyword=final_keyword,
        keywords=tuple(all_words),
        section_keywords=section_keywords,
    )


def visual_section_label(section: str, theme: VisualTheme) -> str:
    key = comparable_phrase(section)
    if key in theme.section_keywords:
        return theme.section_keywords[key]
    section_words = visual_words(section, max_words=4)
    return compact_label(section_words, theme.fallback_keyword, max_len=28, max_words=2)


def visual_keyword_for(section: str, progress: float, theme: VisualTheme) -> str:
    if progress > 0.88:
        return theme.final_keyword
    return visual_section_label(section, theme)


def seal_keyword_stream(title: str, frontmatter: dict[str, str | list[str]], blocks: list[ScriptBlock], override: str | None = None) -> str:
    if override:
        cleaned = re.sub(r"[^A-Za-z0-9 ]+", " ", ascii_fold(override)).upper()
        words = [word for word in cleaned.split() if word]
        return (" ".join(words) + " ") if words else " ".join(DEFAULT_SEAL_WORDS) + " "

    sources = [title, frontmatter_text(frontmatter, "category")]
    sources.extend(tag.replace("-", " ") for tag in frontmatter_list(frontmatter, "tags"))
    sources.extend(block.section for block in blocks[:8])
    raw_words = re.findall(r"[A-Za-z0-9]{4,}", ascii_fold(" ".join(sources)).lower())

    words: list[str] = []
    seen: set[str] = set()
    for word in raw_words:
        if word in SEAL_STOPWORDS or word in seen:
            continue
        seen.add(word)
        words.append(word.upper())
        if len(words) >= 8:
            break
    for fallback in DEFAULT_SEAL_WORDS:
        if fallback not in words:
            words.append(fallback)
        if len(words) >= 10:
            break
    return " ".join(words) + " "


def smootherstep(value: float) -> float:
    x = max(0.0, min(1.0, value))
    return x * x * x * (x * (x * 6 - 15) + 10)


def timed_pulse(t: float, start: float, duration: float) -> float:
    local = (t - start) / duration
    if local < 0.0 or local > 1.0:
        return 0.0
    return math.sin(math.pi * local)


def crop_logo(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    alpha = arr[:, :, 3]
    luminance = arr[:, :, :3].mean(axis=2)
    mask = (alpha > 20) & (luminance > 18)
    ys, xs = np.where(mask)
    if len(xs) == 0 or len(ys) == 0:
        return rgba
    pad = 80
    left = max(0, int(xs.min()) - pad)
    top = max(0, int(ys.min()) - pad)
    right = min(rgba.width, int(xs.max()) + pad)
    bottom = min(rgba.height, int(ys.max()) + pad)
    return rgba.crop((left, top, right, bottom))


def make_ascii_logo(logo_path: Path, size: int, font_size: int, keyword_stream: str, opacity_scale: float = 1.0) -> np.ndarray:
    source = crop_logo(Image.open(logo_path))
    source.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(source, ((size - source.width) // 2, (size - source.height) // 2))
    src = np.asarray(canvas).astype(np.float32)
    luminance = 0.2126 * src[:, :, 0] + 0.7152 * src[:, :, 1] + 0.0722 * src[:, :, 2]
    mask = (src[:, :, 3] > 20) & (luminance > 18)

    font = ImageFont.truetype(str(FONT_PATH), font_size)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    glow_draw = ImageDraw.Draw(glow)
    stream_index = 0
    step_x = max(4, int(font_size * 0.68))
    step_y = max(6, int(font_size * 1.05))
    stream = keyword_stream or " ".join(DEFAULT_SEAL_WORDS) + " "

    for y in range(0, size, step_y):
        for x in range(0, size, step_x):
            yy = slice(y, min(size, y + step_y))
            xx = slice(x, min(size, x + step_x))
            cell_mask = mask[yy, xx]
            if float(cell_mask.mean()) < 0.18:
                continue
            cell_luma = float(luminance[yy, xx][cell_mask].mean())
            cell_rgb = src[yy, xx, :3][cell_mask].mean(axis=0)
            glyph_index = min(len(SEAL_PALETTE) - 1, max(1, int((cell_luma / 255.0) * (len(SEAL_PALETTE) - 1))))
            glyph = stream[stream_index % len(stream)]
            if glyph == " ":
                glyph = SEAL_PALETTE[glyph_index]
            stream_index += 1
            alpha = int(min(235, max(45, cell_luma * 0.88)) * opacity_scale)
            color = tuple(np.clip(cell_rgb * 1.1 + 18, 0, 255).astype(int).tolist() + [alpha])
            glow_color = tuple(np.clip(cell_rgb * 1.25 + 24, 0, 255).astype(int).tolist() + [min(120, alpha)])
            glow_draw.text((x, y), glyph, font=font, fill=glow_color)
            draw.text((x, y), glyph, font=font, fill=color)

    glow = glow.filter(ImageFilter.GaussianBlur(max(2, font_size // 3)))
    out = Image.alpha_composite(glow, out)
    return np.asarray(out).astype(np.float32)


def rotate_overlay(overlay: np.ndarray, degrees: float, scale: float = 1.0) -> np.ndarray:
    img = Image.fromarray(np.clip(overlay, 0, 255).astype(np.uint8), "RGBA")
    if abs(scale - 1.0) > 0.001:
        new_size = max(8, int(img.width * scale))
        img = img.resize((new_size, new_size), Image.Resampling.LANCZOS)
    if abs(degrees) > 0.001:
        img = img.rotate(degrees, resample=Image.Resampling.BICUBIC, expand=True)
    return np.asarray(img).astype(np.float32)


def with_alpha_mask(overlay: np.ndarray, opacity: float, reveal: float = 1.0) -> np.ndarray:
    result = overlay.copy()
    alpha = result[:, :, 3] / 255.0
    if reveal < 0.999:
        h, w = alpha.shape
        yy, xx = np.mgrid[0:h, 0:w]
        cx = (w - 1) / 2
        cy = (h - 1) / 2
        radius = np.sqrt(((xx - cx) / max(1, w / 2)) ** 2 + ((yy - cy) / max(1, h / 2)) ** 2)
        radial = np.clip((reveal * 1.35 - radius) * 8.0, 0.0, 1.0)
        scan = np.clip((reveal * h - yy + h * 0.08) / max(1, h * 0.22), 0.0, 1.0)
        alpha *= np.maximum(radial, scan * 0.72)
    result[:, :, 3] = np.clip(alpha * 255.0 * opacity, 0, 255)
    return result


def blend_rgba_image(img: Image.Image, overlay_rgba: np.ndarray, center: tuple[int, int]) -> Image.Image:
    h, w = overlay_rgba.shape[:2]
    cx, cy = center
    x0 = int(cx - w / 2)
    y0 = int(cy - h / 2)
    x1 = max(0, x0)
    y1 = max(0, y0)
    x2 = min(WIDTH, x0 + w)
    y2 = min(HEIGHT, y0 + h)
    if x1 >= x2 or y1 >= y2:
        return img
    ox1 = x1 - x0
    oy1 = y1 - y0
    ox2 = ox1 + (x2 - x1)
    oy2 = oy1 + (y2 - y1)
    cropped = Image.fromarray(np.clip(overlay_rgba[oy1:oy2, ox1:ox2], 0, 255).astype(np.uint8), "RGBA")
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    layer.alpha_composite(cropped, (x1, y1))
    return Image.alpha_composite(img, layer)


def build_seal_assets(logo_path: Path, keyword_stream: str) -> SealAssets:
    return SealAssets(
        large=make_ascii_logo(logo_path, 520, 9, keyword_stream, 0.98),
        final=make_ascii_logo(logo_path, 560, 10, keyword_stream, 0.95),
        small=make_ascii_logo(logo_path, 118, 5, keyword_stream, 0.92),
        micro=make_ascii_logo(logo_path, 150, 6, keyword_stream, 0.96),
        keyword_stream=keyword_stream.strip(),
        transition_starts=(42.0, 75.0, 127.0, 178.0, 228.0, 276.0),
        watermark_starts=(32.0, 88.0, 144.0, 200.0, 256.0, 306.0),
    )


def apply_seal_overlay(img: Image.Image, t: float, duration: float, seal_assets: SealAssets | None) -> Image.Image:
    if seal_assets is None:
        return img
    if t < 4.6:
        p = smootherstep(t / 4.6)
        seal = rotate_overlay(seal_assets.large, -18.0 * (1.0 - p) + math.sin(t * 3.2) * 1.2, 0.88 + 0.12 * p)
        img = blend_rgba_image(img, with_alpha_mask(seal, 0.78 * p, p), (WIDTH // 2, 500))

    for start in seal_assets.transition_starts:
        pulse = timed_pulse(t, start, 0.9)
        if pulse > 0.0:
            seal = rotate_overlay(seal_assets.micro, -6.0 + 12.0 * pulse, 0.86 + 0.16 * pulse)
            img = blend_rgba_image(img, with_alpha_mask(seal, 0.78 * pulse, min(1.0, pulse * 1.4)), (590, 245))

    for start in seal_assets.watermark_starts:
        pulse = timed_pulse(t, start, 2.2)
        if pulse > 0.0:
            img = blend_rgba_image(img, with_alpha_mask(seal_assets.small, 0.36 * pulse, 1.0), (92, 222))

    final_start = max(0.0, duration - 7.2)
    if t >= final_start:
        p = smootherstep((t - final_start) / max(0.001, duration - final_start))
        seal = rotate_overlay(seal_assets.final, 8.0 * (1.0 - p), 0.82 + 0.12 * p)
        img = blend_rgba_image(img, with_alpha_mask(seal, 0.64 * p, p), (WIDTH // 2, 530))
    return img


def fonts() -> dict[str, ImageFont.FreeTypeFont]:
    return {
        "ascii": ImageFont.truetype(str(FONT_PATH), ASCII_FONT_SIZE),
        "title": ImageFont.truetype(str(FONT_PATH), TITLE_FONT_SIZE),
        "section": ImageFont.truetype(str(FONT_PATH), SECTION_FONT_SIZE),
        "caption": ImageFont.truetype(str(FONT_PATH), CAPTION_FONT_SIZE),
        "small": ImageFont.truetype(str(FONT_PATH), SMALL_FONT_SIZE),
        "url": ImageFont.truetype(str(FONT_PATH), URL_FONT_SIZE),
    }


def draw_centered(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int, int]) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    draw.text((xy[0] - (bbox[2] - bbox[0]) / 2, xy[1]), text, font=font, fill=fill)


def draw_centered_lines(
    draw: ImageDraw.ImageDraw,
    center_x: int,
    top_y: int,
    lines: list[str],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    line_height: int,
) -> None:
    for index, line in enumerate(lines):
        draw_centered(draw, (center_x, top_y + index * line_height), line, font, fill)


def render_frame(
    t: float,
    frame_index: int,
    duration: float,
    captions: list[Caption],
    title: str,
    visual_theme: VisualTheme,
    font_map: dict[str, ImageFont.FreeTypeFont],
    seal_assets: SealAssets | None = None,
) -> Image.Image:
    caption = caption_at(captions, t)
    active_section = caption.section if caption else section_at(captions, t)
    progress = min(1.0, max(0.0, t / duration))
    field, primary, secondary, _motif_keyword = field_for(progress, t, active_section)
    keyword = visual_keyword_for(active_section, progress, visual_theme)
    rng = np.random.default_rng(frame_index + 4404)
    field = np.clip(field + rng.normal(0, 0.018, field.shape), 0, 1)
    indices = np.clip((field * (len(CHARSET) - 1)).astype(np.int16), 0, len(CHARSET) - 1)
    ascii_lines = ["".join(CHARSET[row]) for row in indices]

    top = np.array([5, 8, 10], dtype=np.float32)
    bottom = np.array([13, 16, 18], dtype=np.float32)
    gradient = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    bg = (top * (1 - gradient) + bottom * gradient).astype(np.uint8)
    img = Image.fromarray(np.repeat(bg[:, None, :], WIDTH, axis=1), "RGB").convert("RGBA")
    draw = ImageDraw.Draw(img)

    mono = font_map["ascii"]
    char_w = draw.textbbox((0, 0), "M", font=mono)[2]
    line_h = ASCII_FONT_SIZE + 3
    x0 = (WIDTH - char_w * COLS) // 2
    y0 = 80
    p = np.array(primary, dtype=np.float32)
    s = np.array(secondary, dtype=np.float32)
    for row, line in enumerate(ascii_lines):
        mix = row / max(1, ROWS - 1)
        color = p * (1 - mix) + s * mix
        shimmer = 0.84 + 0.16 * math.sin(t * 2.4 + row * 0.27)
        draw.text((x0, y0 + row * line_h), line, font=mono, fill=tuple(np.clip(color * shimmer, 0, 255).astype(int).tolist() + [205]))

    img = apply_seal_overlay(img, t, duration, seal_assets)
    draw = ImageDraw.Draw(img)

    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    draw_centered(gd, (WIDTH // 2, 168), keyword, font_map["title"], (230, 245, 245, 128))
    glow = glow.filter(ImageFilter.GaussianBlur(8))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    draw_centered(draw, (WIDTH // 2, 168), keyword, font_map["title"], (244, 246, 238, 232))

    section = visual_section_label(active_section, visual_theme).upper()
    if len(section) > 38:
        section = section[:35] + "..."
    raw_title = title.upper()
    if ":" in raw_title:
        title_main, title_rest = raw_title.split(":", 1)
        title_lines = [f"{title_main.strip()}:", title_rest.strip()]
    else:
        title_lines = wrap_text(draw, raw_title, font_map["small"], WIDTH - 108)[:2]
    draw_centered_lines(draw, WIDTH // 2, 28, title_lines, font_map["small"], (216, 218, 210, 176), SMALL_FONT_SIZE + 5)
    section_y = 82 + max(0, len(title_lines) - 1) * 10
    draw_centered(draw, (WIDTH // 2, section_y), section, font_map["section"], (190, 202, 206, 212))

    bar_h = int((HEIGHT - 180) * progress)
    draw.rounded_rectangle((WIDTH - 31, 92, WIDTH - 25, HEIGHT - 88), radius=4, fill=(255, 255, 255, 26))
    draw.rounded_rectangle((WIDTH - 31, HEIGHT - 88 - bar_h, WIDTH - 25, HEIGHT - 88), radius=4, fill=(primary[0], primary[1], primary[2], 186))

    if caption:
        caption_lines = wrap_text(draw, caption.text, font_map["caption"], WIDTH - 96)
        caption_lines = caption_lines[:4]
        cap_line_h = CAPTION_FONT_SIZE + 10
        cap_h = cap_line_h * len(caption_lines) + 48
        cap_y = max(270, min(HEIGHT - cap_h - 170, CAPTION_CENTER_Y - cap_h // 2))
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rounded_rectangle((34, cap_y, WIDTH - 34, cap_y + cap_h), radius=8, fill=(2, 5, 7, 210), outline=(255, 255, 255, 38), width=1)
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)
        for i, line in enumerate(caption_lines):
            bbox = draw.textbbox((0, 0), line, font=font_map["caption"])
            tx = (WIDTH - (bbox[2] - bbox[0])) // 2
            ty = cap_y + 24 + i * cap_line_h
            draw.text((tx + 1, ty + 2), line, font=font_map["caption"], fill=(0, 0, 0, 180))
            draw.text((tx, ty), line, font=font_map["caption"], fill=(247, 249, 241, 242))

    url_y = HEIGHT - 150
    url_bbox = draw.textbbox((0, 0), PLATFORM_URL, font=font_map["url"])
    url_w = url_bbox[2] - url_bbox[0]
    url_h = url_bbox[3] - url_bbox[1]
    url_x = (WIDTH - url_w) // 2
    strip = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strip)
    sd.rounded_rectangle((url_x - 22, url_y - 12, url_x + url_w + 22, url_y + url_h + 16), radius=8, fill=(2, 5, 7, 176), outline=(118, 214, 255, 70), width=1)
    img = Image.alpha_composite(img, strip)
    draw = ImageDraw.Draw(img)
    draw.text((url_x + 1, url_y + 2), PLATFORM_URL, font=font_map["url"], fill=(0, 0, 0, 180))
    draw.text((url_x, url_y), PLATFORM_URL, font=font_map["url"], fill=(202, 245, 255, 230))

    arr = np.asarray(img.convert("RGB")).astype(np.float32)
    bloom = cv2.GaussianBlur(arr, (0, 0), 4)
    arr = np.clip(arr + bloom * 0.14, 0, 255)
    arr[:, :, 0] = np.roll(arr[:, :, 0], 1, axis=1)
    arr[:, :, 2] = np.roll(arr[:, :, 2], -1, axis=1)
    arr[1::4, :, :] *= 0.88
    arr *= VIGNETTE[:, :, None]
    arr += rng.normal(0, 2.2, arr.shape)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def render_video(
    video_path: Path,
    poster_path: Path,
    audio_wav: Path,
    duration: float,
    captions: list[Caption],
    title: str,
    visual_theme: VisualTheme,
    seal_assets: SealAssets | None,
    crf: int,
) -> None:
    font_map = fonts()
    command = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "pipe:0",
        "-i",
        str(audio_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        str(crf),
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        "-shortest",
        str(video_path),
    ]
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)
    if proc.stdin is None:
        raise RuntimeError("ffmpeg stdin unavailable")
    total_frames = int(math.ceil(duration * FPS))
    poster_frame = int(min(total_frames - 1, 2.5 * FPS))
    for frame_index in range(total_frames):
        t = min(duration - 0.001, frame_index / FPS)
        frame = render_frame(t, frame_index, duration, captions, title, visual_theme, font_map, seal_assets)
        if frame_index == poster_frame:
            frame.save(poster_path, quality=92)
        proc.stdin.write(np.asarray(frame).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding video")


def path_for_manifest(path: Path) -> str:
    try:
        return str(path.relative_to(V2_ROOT / "apps/web/public"))
    except ValueError:
        return str(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--post", type=Path, default=DEFAULT_POST)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--asset-slug", type=str)
    parser.add_argument("--tts-provider", choices=["edge", "say"], default="edge")
    parser.add_argument("--edge-voice", default=EDGE_EXPRESSIVE_VOICE)
    parser.add_argument("--edge-rate", default=EDGE_RATE)
    parser.add_argument("--edge-pitch", default=EDGE_PITCH)
    parser.add_argument("--say-voice", default=VOICE)
    parser.add_argument("--say-rate", type=int, default=VOICE_RATE)
    parser.add_argument("--with-seal", action="store_true", help="Render the Cruz Orlada ASCII seal into the primary MP4.")
    parser.add_argument("--seal-logo", type=Path, default=DEFAULT_SEAL_LOGO)
    parser.add_argument("--seal-keywords", type=str, help="Optional ASCII word stream for the seal.")
    parser.add_argument("--crf", type=int, default=27, help="H.264 CRF for the video encode.")
    args = parser.parse_args()

    post_path = args.post.resolve()
    frontmatter, body = parse_post(post_path)
    source_slug = frontmatter_text(frontmatter, "slug", post_path.stem)
    asset_slug = args.asset_slug or source_slug
    slug = f"{asset_slug}-mobile-full"
    out_dir = args.out.resolve() if args.out else V2_ROOT / "apps/web/public/media/ascii-videos" / asset_slug
    out_dir.mkdir(parents=True, exist_ok=True)
    title = frontmatter_text(frontmatter, "title", source_slug.replace("-", " ").title())
    blocks = mdx_to_script(title, body)
    units = caption_units(blocks)
    visual_theme = build_visual_theme(title, frontmatter, blocks)
    seal_assets: SealAssets | None = None
    seal_words: str | None = None
    if args.with_seal:
        if not args.seal_logo.exists():
            raise FileNotFoundError(f"Seal logo not found: {args.seal_logo}")
        seal_words = seal_keyword_stream(title, frontmatter, blocks, args.seal_keywords)
        seal_assets = build_seal_assets(args.seal_logo.resolve(), seal_words)

    script_md, script_txt = write_script_files(out_dir, slug, title, blocks)
    voice_mp3 = out_dir / f"{slug}-voiceover.mp3"
    voice_wav = out_dir / f"{slug}-voiceover.wav"
    mixed_wav = out_dir / f"{slug}-mix.wav"
    music_wav = out_dir / f"{slug}-music.wav"
    video_path = out_dir / f"{slug}.mp4"
    poster_path = out_dir / f"{slug}-poster.jpg"
    vtt_path = out_dir / f"{slug}.vtt"
    srt_path = out_dir / f"{slug}.srt"
    music_mp3 = out_dir / f"{slug}-music.mp3"
    mix_mp3 = out_dir / f"{slug}-mix.mp3"
    manifest_path = out_dir / f"{slug}-manifest.json"

    expected_words = sum(len(alignment_tokens(text)) for _, text in units)
    word_boundary_count: int | None = None
    if args.tts_provider == "edge":
        narration_duration, timings = synthesize_edge_voice(
            narration_text_from_blocks(blocks),
            voice_mp3,
            voice_wav,
            args.edge_voice,
            args.edge_rate,
            args.edge_pitch,
        )
        word_boundary_count = len(timings)
        captions = build_precise_captions(units, timings, narration_duration)
        voice_name = args.edge_voice
        voice_rate: str | int = args.edge_rate
        voice_provider = "edge-tts"
        alignment = "tts-word-boundary"
    else:
        narration_duration = synthesize_voice(script_txt, voice_wav, args.say_voice, args.say_rate)
        captions = build_captions(units, narration_duration)
        voice_name = args.say_voice
        voice_rate = args.say_rate
        voice_provider = "macos-say"
        alignment = "estimated-weighted"
    write_subtitles(captions, srt_path, vtt_path)
    duration, _sr = mix_voice_and_music(voice_wav, mixed_wav, music_wav)
    render_video(video_path, poster_path, mixed_wav, duration, captions, title, visual_theme, seal_assets, args.crf)
    for wav_path, mp3_path in [(music_wav, music_mp3), (mixed_wav, mix_mp3)]:
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-codec:a", "libmp3lame", "-q:a", "2", str(mp3_path)])

    voice_wav.unlink(missing_ok=True)
    mixed_wav.unlink(missing_ok=True)
    music_wav.unlink(missing_ok=True)

    manifest = {
        "slug": slug,
        "source": str(post_path.relative_to(V2_ROOT)),
        "title": title,
        "format": "vertical-mobile-full-script",
        "voiceProvider": voice_provider,
        "voice": voice_name,
        "voiceRate": voice_rate,
        "voicePitch": args.edge_pitch if args.tts_provider == "edge" else None,
        "voiceStyle": "expressive-paused",
        "ttsAlignment": alignment,
        "captionCount": len(captions),
        "expectedWordCount": expected_words,
        "wordBoundaryCount": word_boundary_count,
        "durationSeconds": round(duration, 3),
        "fps": FPS,
        "size": [WIDTH, HEIGHT],
        "videoCrf": args.crf,
        "seal": {
            "enabled": args.with_seal,
            "logo": str(args.seal_logo) if args.with_seal else None,
            "wordStream": seal_words.strip() if seal_words else None,
            "excluded": ["obra original line"] if args.with_seal else [],
        },
        "visualTheme": {
            "openingLabel": visual_theme.opening_label,
            "fallbackKeyword": visual_theme.fallback_keyword,
            "finalKeyword": visual_theme.final_keyword,
            "keywords": list(visual_theme.keywords),
            "sectionKeywords": visual_theme.section_keywords,
        },
        "video": path_for_manifest(video_path),
        "poster": path_for_manifest(poster_path),
        "vtt": path_for_manifest(vtt_path),
        "srt": path_for_manifest(srt_path),
        "scriptMarkdown": path_for_manifest(script_md),
        "scriptText": path_for_manifest(script_txt),
        "voiceover": path_for_manifest(voice_mp3) if voice_mp3.exists() else None,
        "music": path_for_manifest(music_mp3),
        "mix": path_for_manifest(mix_mp3),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
