#!/usr/bin/env python3
"""Render a short ASCII video treatment for one blog post.

The first iteration is intentionally self-contained: it reads the selected MDX
post, renders a morphing ASCII animation, writes a WebVTT subtitle track, and
generates an original melodic synth bed before muxing everything into MP4.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import tempfile
import wave
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


V2_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_POST = V2_ROOT / "content/blog/el-cansancio-sagrado-por-qu-ya-no-podemos-esperar.mdx"
DEFAULT_OUT = (
    V2_ROOT
    / "apps/web/public/media/ascii-videos/el-cansancio-sagrado"
)

WIDTH = 1280
HEIGHT = 720
FPS = 24
DURATION = 42.0
COLS = 128
ROWS = 43
FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")
FONT_SIZE = 14
TITLE_FONT_SIZE = 44
SUBTITLE_FONT_SIZE = 29
PALETTE = np.array(list("  .`',:;i!lI?+*tfLCG08@"))


@dataclass(frozen=True)
class Subtitle:
    start: float
    end: float
    text: str


@dataclass(frozen=True)
class Scene:
    start: float
    end: float
    mode: str
    keyword: str
    primary: tuple[int, int, int]
    secondary: tuple[int, int, int]


SUBTITLES = [
    Subtitle(0.0, 4.5, "El cansancio sagrado no pide almohada: pide planos."),
    Subtitle(4.5, 9.4, "Cuando el enojo ya no alcanza, la queja se vuelve diseño."),
    Subtitle(9.4, 15.4, "No es cinismo: es lucidez emocional, diagnóstico sistémico y servicio."),
    Subtitle(15.4, 21.4, "Los problemas se repiten porque fueron diseñados para repetirse."),
    Subtitle(21.4, 28.2, "Nombrar el patrón. Probar un prototipo. Medir. Narrar."),
    Subtitle(28.2, 35.0, "La energía vuelve cuando encuentra una forma colectiva."),
    Subtitle(35.0, 42.0, "Ese momento es ahora: apoyar el lápiz sobre el plano."),
]

SCENES = [
    Scene(0.0, 7.0, "static", "CANSANCIO SAGRADO", (226, 232, 220), (118, 214, 255)),
    Scene(7.0, 14.0, "blueprint", "QUEJA -> DISENO", (92, 226, 255), (250, 222, 122)),
    Scene(14.0, 21.0, "diagnosis", "SISTEMA ROTO", (255, 126, 104), (101, 255, 205)),
    Scene(21.0, 29.0, "table", "MESA DE DISENO", (245, 238, 172), (130, 246, 180)),
    Scene(29.0, 36.0, "network", "ACCION COLECTIVA", (104, 226, 180), (255, 176, 112)),
    Scene(36.0, 42.0, "line", "AHORA", (250, 248, 230), (112, 202, 255)),
]


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def parse_frontmatter(path: Path) -> dict[str, str]:
    raw = path.read_text(encoding="utf-8")
    match = re.match(r"---\n([\s\S]*?)\n---", raw)
    if not match:
        return {}
    values: dict[str, str] = {}
    for line in match.group(1).splitlines():
        scalar = re.match(r"^([A-Za-z0-9_]+):\s*(.*?)\s*$", line)
        if scalar:
            value = scalar.group(2).strip()
            values[scalar.group(1)] = value.strip("'\"")
    return values


def smootherstep(value: float) -> float:
    x = max(0.0, min(1.0, value))
    return x * x * x * (x * (x * 6 - 15) + 10)


def text_wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
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


def subtitle_at(t: float) -> str | None:
    for subtitle in SUBTITLES:
        if subtitle.start <= t < subtitle.end:
            return subtitle.text
    return None


def active_scene(t: float) -> tuple[Scene, Scene | None, float]:
    for index, scene in enumerate(SCENES):
        if scene.start <= t <= scene.end:
            next_scene = SCENES[index + 1] if index + 1 < len(SCENES) else None
            transition = 1.15
            if next_scene and t > scene.end - transition:
                blend = smootherstep((t - (scene.end - transition)) / transition)
                return scene, next_scene, blend
            return scene, None, 0.0
    return SCENES[-1], None, 0.0


GRID_X, GRID_Y = np.meshgrid(
    np.linspace(0.0, 1.0, COLS),
    np.linspace(0.0, 1.0, ROWS),
)


def line_distance_field(x0: float, y0: float, x1: float, y1: float) -> np.ndarray:
    px = GRID_X - x0
    py = GRID_Y - y0
    vx = x1 - x0
    vy = y1 - y0
    denom = vx * vx + vy * vy
    u = np.clip((px * vx + py * vy) / denom, 0.0, 1.0)
    dx = GRID_X - (x0 + u * vx)
    dy = GRID_Y - (y0 + u * vy)
    return np.sqrt(dx * dx + dy * dy)


def field_for_mode(mode: str, local: float, t: float) -> np.ndarray:
    x = GRID_X
    y = GRID_Y
    noise = 0.08 * np.sin(71 * x + 19 * y + t * 3.1) + 0.05 * np.sin(41 * x - 61 * y + t * 1.7)

    if mode == "static":
        bands = 0.5 + 0.35 * np.sin(34 * y + 5.0 * np.sin(t * 1.3))
        vertical = 0.35 * np.sin(42 * x + t * 3.2) ** 2
        pulse = np.exp(-((y - (0.18 + 0.62 * local)) ** 2) / 0.002)
        return np.clip(0.22 + bands * 0.32 + vertical * 0.26 + pulse * 0.45 + noise, 0, 1)

    if mode == "blueprint":
        gx = (np.mod(x * COLS + t * 4, 12) < 0.55).astype(float)
        gy = (np.mod(y * ROWS + t * 1.8, 7) < 0.45).astype(float)
        circle = np.abs(np.sqrt((x - 0.5) ** 2 + (y - 0.48) ** 2) - (0.12 + 0.06 * np.sin(t))) < 0.008
        diagonal = line_distance_field(0.14, 0.76, 0.86, 0.22) < 0.007
        return np.clip(0.12 + gx * 0.35 + gy * 0.24 + circle * 0.74 + diagonal * 0.8 + noise, 0, 1)

    if mode == "diagnosis":
        wave = 0.5 + 0.5 * np.sin(18 * x + 23 * y - t * 5)
        fracture = np.abs(np.sin((x - y + 0.12 * np.sin(t)) * 18)) < 0.035
        core = np.exp(-(((x - 0.52) ** 2) / 0.025 + ((y - 0.5) ** 2) / 0.018))
        scan = (np.mod((x + y + t * 0.35) * 26, 1.0) < 0.08).astype(float)
        return np.clip(0.16 + wave * 0.22 + fracture * 0.54 + core * 0.62 + scan * 0.18 + noise, 0, 1)

    if mode == "table":
        table = (
            (line_distance_field(0.2, 0.62, 0.8, 0.62) < 0.011)
            | (line_distance_field(0.25, 0.38, 0.75, 0.38) < 0.011)
            | (line_distance_field(0.27, 0.38, 0.2, 0.62) < 0.011)
            | (line_distance_field(0.73, 0.38, 0.8, 0.62) < 0.011)
        ).astype(float)
        ripples = 0.5 + 0.5 * np.sin(36 * np.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) - t * 5.2)
        paper = np.exp(-(((x - 0.5) ** 2) / 0.09 + ((y - 0.48) ** 2) / 0.035))
        return np.clip(0.14 + table * 0.78 + paper * 0.42 + ripples * 0.18 + noise, 0, 1)

    if mode == "network":
        points = [
            (0.2, 0.35),
            (0.33, 0.62),
            (0.48, 0.28),
            (0.62, 0.58),
            (0.79, 0.38),
            (0.52, 0.72),
        ]
        value = np.zeros_like(x) + 0.1
        for px, py in points:
            radius = 0.024 + 0.008 * math.sin(t * 2.0 + px * 5)
            value += np.exp(-(((x - px) ** 2 + (y - py) ** 2) / (radius * radius))) * 0.45
        for a, b in zip(points, points[1:] + points[:1]):
            value += (line_distance_field(a[0], a[1], b[0], b[1]) < 0.006).astype(float) * 0.38
        value += (0.5 + 0.5 * np.sin(22 * x - 16 * y + t * 3.7)) * 0.12
        return np.clip(value + noise, 0, 1)

    if mode == "line":
        progress = min(1.0, local * 1.35)
        main_line = line_distance_field(0.12, 0.68, 0.88, 0.27)
        along = (GRID_X - 0.12) / 0.76
        reveal = (along < progress).astype(float)
        glow = np.exp(-(main_line * 60) ** 2) * reveal
        horizon = np.exp(-((y - 0.62 - 0.06 * np.sin(x * 12 + t)) ** 2) / 0.0009)
        return np.clip(0.12 + glow * 0.9 + horizon * 0.28 + noise, 0, 1)

    return np.clip(0.2 + noise, 0, 1)


def field_at_time(t: float) -> tuple[np.ndarray, Scene]:
    scene, next_scene, blend = active_scene(t)
    local = (t - scene.start) / max(0.001, scene.end - scene.start)
    first = field_for_mode(scene.mode, local, t)
    if next_scene is None:
        return first, scene
    next_local = (t - next_scene.start) / max(0.001, next_scene.end - next_scene.start)
    second = field_for_mode(next_scene.mode, max(0.0, next_local), t)
    return first * (1.0 - blend) + second * blend, next_scene if blend > 0.5 else scene


def make_vignette() -> np.ndarray:
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    dx = (xx - WIDTH / 2) / (WIDTH / 2)
    dy = (yy - HEIGHT / 2) / (HEIGHT / 2)
    radius = np.sqrt(dx * dx + dy * dy)
    return np.clip(1.15 - radius * 0.55, 0.55, 1.0).astype(np.float32)


VIGNETTE = make_vignette()


def render_ascii_frame(
    t: float,
    frame_index: int,
    fonts: dict[str, ImageFont.FreeTypeFont],
) -> Image.Image:
    field, scene = field_at_time(t)
    rng = np.random.default_rng(frame_index + 90210)
    field = np.clip(field + rng.normal(0, 0.032, size=field.shape), 0.0, 1.0)
    indices = np.clip((field * (len(PALETTE) - 1)).astype(np.int16), 0, len(PALETTE) - 1)
    lines = ["".join(PALETTE[row]) for row in indices]

    bg_top = np.array([7, 10, 13], dtype=np.float32)
    bg_bottom = np.array([11, 16, 20], dtype=np.float32)
    gradient = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
    bg = (bg_top * (1 - gradient) + bg_bottom * gradient).astype(np.uint8)
    img = Image.fromarray(np.repeat(bg[:, None, :], WIDTH, axis=1), "RGB")
    draw = ImageDraw.Draw(img)

    mono = fonts["mono"]
    bbox = draw.textbbox((0, 0), "M", font=mono)
    char_w = bbox[2] - bbox[0]
    line_h = FONT_SIZE + 3
    x0 = (WIDTH - char_w * COLS) // 2
    y0 = 40

    primary = np.array(scene.primary, dtype=np.float32)
    secondary = np.array(scene.secondary, dtype=np.float32)
    for row, line in enumerate(lines):
        mix = row / max(1, ROWS - 1)
        color = primary * (1 - mix) + secondary * mix
        shimmer = 0.82 + 0.18 * math.sin(t * 4.2 + row * 0.37)
        draw.text((x0, y0 + row * line_h), line, font=mono, fill=tuple(np.clip(color * shimmer, 0, 255).astype(int)))

    title_font = fonts["title"]
    keyword_alpha = 0.62 + 0.2 * math.sin(t * 2.1)
    keyword = scene.keyword
    keyword_bbox = draw.textbbox((0, 0), keyword, font=title_font)
    keyword_x = (WIDTH - (keyword_bbox[2] - keyword_bbox[0])) // 2
    keyword_y = 120 if scene.mode in {"static", "line"} else 102
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_color = tuple(np.clip(primary * 0.9 + secondary * 0.25, 0, 255).astype(int))
    glow_draw.text((keyword_x, keyword_y), keyword, font=title_font, fill=(*glow_color, int(120 * keyword_alpha)))
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    draw = ImageDraw.Draw(img)
    draw.text((keyword_x, keyword_y), keyword, font=title_font, fill=(245, 247, 238, 226))

    subtitle = subtitle_at(t)
    if subtitle:
        sub_font = fonts["subtitle"]
        lines = text_wrap(draw, subtitle, sub_font, 1040)
        line_height = SUBTITLE_FONT_SIZE + 8
        block_h = len(lines) * line_height + 30
        box_y = HEIGHT - block_h - 38
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rounded_rectangle((100, box_y, WIDTH - 100, HEIGHT - 30), radius=18, fill=(2, 6, 9, 178), outline=(255, 255, 255, 36), width=1)
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)
        for i, line in enumerate(lines):
            tb = draw.textbbox((0, 0), line, font=sub_font)
            tx = (WIDTH - (tb[2] - tb[0])) // 2
            ty = box_y + 17 + i * line_height
            draw.text((tx + 1, ty + 2), line, font=sub_font, fill=(0, 0, 0, 180))
            draw.text((tx, ty), line, font=sub_font, fill=(244, 247, 239, 238))

    return post_process(np.asarray(img.convert("RGB")), t, frame_index)


def post_process(frame: np.ndarray, t: float, frame_index: int) -> Image.Image:
    arr = frame.astype(np.float32)
    bloom = cv2.GaussianBlur(arr, (0, 0), 5)
    arr = np.clip(arr + bloom * 0.22, 0, 255)

    shift = int(1 + 2 * abs(math.sin(t * 1.4)))
    red = np.roll(arr[:, :, 0], shift, axis=1)
    green = arr[:, :, 1]
    blue = np.roll(arr[:, :, 2], -shift, axis=1)
    arr = np.stack([red, green, blue], axis=2)

    arr[1::3, :, :] *= 0.84
    arr *= VIGNETTE[:, :, None]
    rng = np.random.default_rng(1200 + frame_index)
    arr += rng.normal(0, 4.5, arr.shape)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def midi_to_hz(note: int) -> float:
    return 440.0 * (2 ** ((note - 69) / 12))


def add_note(track: np.ndarray, sr: int, start: float, duration: float, note: int, amp: float, pan: float) -> None:
    start_i = int(start * sr)
    length = max(1, int(duration * sr))
    end_i = min(track.shape[0], start_i + length)
    if end_i <= start_i:
        return
    n = end_i - start_i
    x = np.arange(n, dtype=np.float32) / sr
    freq = midi_to_hz(note)
    wave_data = (
        np.sin(2 * np.pi * freq * x)
        + 0.28 * np.sin(2 * np.pi * freq * 2 * x + 0.4)
        + 0.08 * np.sin(2 * np.pi * freq * 3 * x + 1.1)
    )
    attack = max(1, int(min(0.08, duration * 0.18) * sr))
    release = max(1, int(min(0.45, duration * 0.35) * sr))
    env = np.ones(n, dtype=np.float32)
    env[:attack] = np.linspace(0, 1, attack)
    env[-release:] *= np.linspace(1, 0, release)
    env *= np.exp(-x / max(duration * 0.9, 0.1))
    left = math.cos(pan * math.pi / 2)
    right = math.sin(pan * math.pi / 2)
    track[start_i:end_i, 0] += wave_data * env * amp * left
    track[start_i:end_i, 1] += wave_data * env * amp * right


def add_pad(track: np.ndarray, sr: int, start: float, duration: float, notes: list[int], amp: float) -> None:
    for offset, note in enumerate(notes):
        add_note(track, sr, start + offset * 0.035, duration, note, amp, 0.35 + offset * 0.15)


def generate_music(path: Path) -> None:
    sr = 48_000
    total = int((DURATION + 0.4) * sr)
    track = np.zeros((total, 2), dtype=np.float32)

    chords = [
        [45, 52, 57, 60, 64],
        [41, 48, 53, 57, 60],
        [48, 55, 60, 64, 67],
        [43, 50, 55, 59, 62],
    ]
    for bar, start in enumerate(np.arange(0, DURATION, 4.0)):
        add_pad(track, sr, float(start), 4.7, chords[bar % len(chords)], 0.055)
        add_note(track, sr, float(start), 3.8, chords[bar % len(chords)][0] - 12, 0.06, 0.5)

    melody = [69, 72, 76, 74, 72, 67, 69, 71, 72, 76, 79, 76, 74, 72, 69, 67]
    for i, start in enumerate(np.arange(1.0, DURATION - 0.5, 0.75)):
        note = melody[i % len(melody)]
        amp = 0.075 if i % 4 == 0 else 0.052
        pan = 0.28 + 0.44 * (0.5 + 0.5 * math.sin(i * 0.9))
        add_note(track, sr, float(start), 1.25, note, amp, pan)

    delay = int(0.34 * sr)
    for channel in range(2):
        delayed = np.zeros(total, dtype=np.float32)
        delayed[delay:] = track[:-delay, channel] * 0.26
        track[:, channel] += delayed

    long_delay = int(0.68 * sr)
    track[long_delay:, :] += track[:-long_delay, ::-1] * 0.14
    fade = int(1.2 * sr)
    envelope = np.ones(total, dtype=np.float32)
    envelope[:fade] = np.linspace(0, 1, fade, dtype=np.float32)
    envelope[-fade:] = np.linspace(1, 0, fade, dtype=np.float32)
    track *= envelope[:, None]
    peak = max(0.001, float(np.max(np.abs(track))))
    track = np.clip(track / peak * 0.88, -1, 1)
    pcm = (track * 32767).astype(np.int16)

    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes(pcm.tobytes())


def write_vtt(path: Path) -> None:
    def fmt(seconds: float) -> str:
        millis = int(round(seconds * 1000))
        hh = millis // 3_600_000
        millis %= 3_600_000
        mm = millis // 60_000
        millis %= 60_000
        ss = millis // 1000
        ms = millis % 1000
        return f"{hh:02d}:{mm:02d}:{ss:02d}.{ms:03d}"

    chunks = ["WEBVTT", ""]
    for item in SUBTITLES:
        chunks.append(f"{fmt(item.start)} --> {fmt(item.end)}")
        chunks.append(item.text)
        chunks.append("")
    path.write_text("\n".join(chunks), encoding="utf-8")


def font_bundle() -> dict[str, ImageFont.FreeTypeFont]:
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"Expected font at {FONT_PATH}")
    return {
        "mono": ImageFont.truetype(str(FONT_PATH), FONT_SIZE),
        "title": ImageFont.truetype(str(FONT_PATH), TITLE_FONT_SIZE),
        "subtitle": ImageFont.truetype(str(FONT_PATH), SUBTITLE_FONT_SIZE),
    }


def render_video(output_mp4: Path, audio_wav: Path, poster_path: Path) -> None:
    fonts = font_bundle()
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
        "24",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        "-shortest",
        str(output_mp4),
    ]
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    frames = int(DURATION * FPS)
    poster_frame = int(2.8 * FPS)
    for frame_index in range(frames):
        t = frame_index / FPS
        frame = render_ascii_frame(t, frame_index, fonts)
        if frame_index == poster_frame:
            frame.save(poster_path, quality=92)
        proc.stdin.write(np.asarray(frame).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding video")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--post", type=Path, default=DEFAULT_POST)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    post = args.post.resolve()
    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    frontmatter = parse_frontmatter(post)
    slug = frontmatter.get("slug", post.stem)

    mp4_path = out_dir / "el-cansancio-sagrado-ascii.mp4"
    vtt_path = out_dir / "el-cansancio-sagrado-ascii.vtt"
    poster_path = out_dir / "el-cansancio-sagrado-ascii-poster.jpg"
    soundtrack_path = out_dir / "el-cansancio-sagrado-soundtrack.mp3"
    manifest_path = out_dir / "manifest.json"

    write_vtt(vtt_path)
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = Path(tmp) / "soundtrack.wav"
        generate_music(wav_path)
        render_video(mp4_path, wav_path, poster_path)
        run([
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-codec:a",
            "libmp3lame",
            "-q:a",
            "2",
            str(soundtrack_path),
        ])

    manifest = {
        "slug": slug,
        "source": str(post.relative_to(V2_ROOT)),
        "title": frontmatter.get("title", "El Cansancio Sagrado"),
        "durationSeconds": DURATION,
        "fps": FPS,
        "size": [WIDTH, HEIGHT],
        "video": str(mp4_path.relative_to(V2_ROOT / "apps/web/public")),
        "poster": str(poster_path.relative_to(V2_ROOT / "apps/web/public")),
        "subtitles": str(vtt_path.relative_to(V2_ROOT / "apps/web/public")),
        "soundtrack": str(soundtrack_path.relative_to(V2_ROOT / "apps/web/public")),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
