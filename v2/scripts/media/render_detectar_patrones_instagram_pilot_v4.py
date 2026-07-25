#!/usr/bin/env python3
"""Render a specialized Instagram Reel pilot for the Detectar Patrones article."""

from __future__ import annotations

import argparse
import difflib
import json
import math
import re
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from render_ascii_blog_mobile_full import (
    Caption,
    WordTiming,
    add_note,
    build_precise_captions,
    capture,
    read_wav,
    run,
    synthesize_edge_voice,
    write_subtitles,
    write_wav,
)


V2_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = (
    V2_ROOT
    / "apps/web/public/media/ascii-videos"
    / "detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar"
    / "instagram-pilot-v4"
)
DEFAULT_LOGO = Path("/Users/juanb/Library/CloudStorage/OneDrive-Personal/Hombre Gris/Cruz Orlada Logo NB.png")

BASE_W = 720
BASE_H = 1280
OUT_W = 1080
OUT_H = 1920
RENDER_SCALE = OUT_W / BASE_W
FPS = 30
SR = 48_000
FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")
ASCII_FONT_SIZE = 10
SMALL_FONT_SIZE = 15
CAPTION_FONT_SIZE = 30
HOOK_FONT_SIZE = 52
TITLE_FONT_SIZE = 38
COLS = 116
ROWS = 116
PLATFORM_URL = "www.elinstantedelhombregris.com"
ASSET_SLUG = "detectar-patrones-instagram-pilot-v4"
ARTICLE_URL = "/blog/detectar-patrones-otro-poder-que-ya-tens-y-nadie-te-ense-a-usar"
GLYPHS = np.array(list("  ..,:;i!lI?+*tfLCG08@"))
SEAL_GLYPHS = "PATRON|EVIDENCIA|LIBERTAD|"


@dataclass(frozen=True)
class NarrationUnit:
    scene: str
    text: str


NARRATION_UNITS = [
    NarrationUnit("noise", "Cuando todo parece ruido, hay una pregunta que devuelve el control."),
    NarrationUnit("noise", "¿Esto ya lo vi antes?"),
    NarrationUnit("signal", "Detectar patrones es el poder que convirtió señales en conocimiento."),
    NarrationUnit("signal", "Cielo oscuro: lluvia."),
    NarrationUnit("signal", "Semilla en tierra húmeda: alimento."),
    NarrationUnit("signal", "Repetición observada: inteligencia."),
    NarrationUnit("overload", "Pero hoy el ruido tiene una función."),
    NarrationUnit("overload", "Noticias. Promesas. Enemigos. Urgencias."),
    NarrationUnit("overload", "Todo compite por tu reacción."),
    NarrationUnit("loop", "Y mientras reaccionás, el mecanismo vuelve a empezar."),
    NarrationUnit("loop", "Emoción. Promesa. Poder. Olvido."),
    NarrationUnit("loop", "Cambian los nombres. Cambian los colores."),
    NarrationUnit("loop", "El patrón permanece."),
    NarrationUnit("mirror", "La salida no empieza mirando al otro."),
    NarrationUnit("mirror", "Empieza detectando tu propia reacción automática."),
    NarrationUnit("mirror", "Antes de compartir. Antes de discutir. Antes de votar."),
    NarrationUnit("mirror", "Frená un segundo."),
    NarrationUnit("questions", "Preguntate: ¿esto ya lo vi antes?"),
    NarrationUnit("questions", "¿Cómo terminó la última vez?"),
    NarrationUnit("questions", "¿Qué evidencia me están mostrando?"),
    NarrationUnit("break", "Cuando ves el patrón, dejás de ser predecible."),
    NarrationUnit("break", "Y cuando dejás de ser predecible, dejás de ser manipulable."),
    NarrationUnit("final", "Detectar patrones no es cinismo."),
    NarrationUnit("final", "Es libertad."),
    NarrationUnit("final", "El Instante del Hombre Gris."),
]

SCENE_ORDER = ["noise", "signal", "overload", "loop", "mirror", "questions", "break", "final"]
SCENE_LABELS = {
    "noise": "RUIDO",
    "signal": "SEÑAL",
    "overload": "SOBRECARGA",
    "loop": "BUCLE",
    "mirror": "ESPEJO",
    "questions": "EVIDENCIA",
    "break": "RUPTURA",
    "final": "LIBERTAD",
}
SCENE_ACCENTS = {
    "noise": ((164, 184, 196), (220, 96, 86)),
    "signal": ((100, 225, 230), (246, 205, 105)),
    "overload": ((219, 102, 91), (238, 170, 90)),
    "loop": ((240, 174, 88), (215, 84, 84)),
    "mirror": ((126, 191, 225), (226, 220, 193)),
    "questions": ((242, 207, 112), (115, 222, 215)),
    "break": ((135, 233, 178), (245, 213, 112)),
    "final": ((244, 216, 126), (219, 226, 220)),
}


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), round(size * RENDER_SCALE))


class ScaledDraw:
    """Draw in the original 720x1280 design space on a native 1080x1920 canvas."""

    def __init__(self, image: Image.Image) -> None:
        self.raw = ImageDraw.Draw(image, "RGBA")

    @staticmethod
    def _coords(values: tuple[float, ...] | list[float]) -> tuple[float, ...]:
        return tuple(value * RENDER_SCALE for value in values)

    def text(self, xy: tuple[float, float], text: str, **kwargs: object) -> None:
        self.raw.text(self._coords(xy), text, **kwargs)

    def textbbox(self, xy: tuple[float, float], text: str, **kwargs: object) -> tuple[float, float, float, float]:
        return tuple(value / RENDER_SCALE for value in self.raw.textbbox(self._coords(xy), text, **kwargs))

    def line(self, xy: tuple[float, ...], *, fill: tuple[int, ...], width: int = 1) -> None:
        self.raw.line(self._coords(xy), fill=fill, width=max(1, round(width * RENDER_SCALE)))

    def rectangle(self, xy: tuple[float, ...], **kwargs: object) -> None:
        if "width" in kwargs:
            kwargs["width"] = max(1, round(int(kwargs["width"]) * RENDER_SCALE))
        self.raw.rectangle(self._coords(xy), **kwargs)

    def rounded_rectangle(self, xy: tuple[float, ...], *, radius: int, **kwargs: object) -> None:
        if "width" in kwargs:
            kwargs["width"] = max(1, round(int(kwargs["width"]) * RENDER_SCALE))
        self.raw.rounded_rectangle(self._coords(xy), radius=round(radius * RENDER_SCALE), **kwargs)

    def ellipse(self, xy: tuple[float, ...], **kwargs: object) -> None:
        if "width" in kwargs:
            kwargs["width"] = max(1, round(int(kwargs["width"]) * RENDER_SCALE))
        self.raw.ellipse(self._coords(xy), **kwargs)

    def arc(self, xy: tuple[float, ...], *, start: float, end: float, fill: tuple[int, ...], width: int = 1) -> None:
        self.raw.arc(self._coords(xy), start=start, end=end, fill=fill, width=max(1, round(width * RENDER_SCALE)))

    def polygon(self, xy: list[tuple[float, float]], **kwargs: object) -> None:
        self.raw.polygon([self._coords(point) for point in xy], **kwargs)


ASCII_FONT = font(ASCII_FONT_SIZE)
SMALL_FONT = font(SMALL_FONT_SIZE)
CAPTION_FONT = font(CAPTION_FONT_SIZE)
CAPTION_BOLD_FONT = font(CAPTION_FONT_SIZE + 2)
HOOK_FONT = font(HOOK_FONT_SIZE)
TITLE_FONT = font(TITLE_FONT_SIZE)
META_FONT = font(13)

GRID_X, GRID_Y = np.meshgrid(np.linspace(0.0, 1.0, COLS), np.linspace(0.0, 1.0, ROWS))
PIX_Y = np.linspace(42, BASE_H - 96, ROWS).astype(int)


def build_vignette() -> np.ndarray:
    yy, xx = np.mgrid[0:OUT_H, 0:OUT_W]
    radius = np.sqrt(((xx - OUT_W / 2) / (OUT_W / 2)) ** 2 + ((yy - OUT_H / 2) / (OUT_H / 2)) ** 2)
    return np.clip(1.12 - radius * 0.32, 0.68, 1.0).astype(np.float32)


VIGNETTE = build_vignette()
POST_X = np.linspace(0.0, 1.0, OUT_W, dtype=np.float32)[None, :]
SCANLINE_MASK = np.ones((OUT_H, 1, 1), dtype=np.float32)
SCANLINE_MASK[::4] = 0.94


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def smoothstep(value: float) -> float:
    value = clamp(value)
    return value * value * (3.0 - 2.0 * value)


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1.0 - (1.0 - value) ** 3


def fade_window(t: float, start: float, end: float, ramp: float = 0.7) -> float:
    if t < start or t > end:
        return 0.0
    return min(smoothstep((t - start) / ramp), smoothstep((end - t) / ramp))


def scene_ranges(captions: list[Caption], duration: float) -> dict[str, tuple[float, float]]:
    raw_ranges: dict[str, tuple[float, float]] = {}
    for name in SCENE_ORDER:
        matching = [caption for caption in captions if caption.section == name]
        if matching:
            raw_ranges[name] = (matching[0].start, matching[-1].end)
    ranges: dict[str, tuple[float, float]] = {}
    for index, name in enumerate(SCENE_ORDER):
        previous_end = ranges[SCENE_ORDER[index - 1]][1] if index else 0.0
        if index + 1 < len(SCENE_ORDER):
            next_name = SCENE_ORDER[index + 1]
            end = (raw_ranges[name][1] + raw_ranges[next_name][0]) / 2.0
        else:
            end = duration
        ranges[name] = (previous_end, end)
    return ranges


def active_scene(t: float, ranges: dict[str, tuple[float, float]]) -> str:
    for name in SCENE_ORDER:
        start, end = ranges[name]
        if start <= t < end:
            return name
    return SCENE_ORDER[-1]


def scene_progress(t: float, name: str, ranges: dict[str, tuple[float, float]]) -> float:
    start, end = ranges[name]
    return clamp((t - start) / max(0.001, end - start))


def scene_transition(t: float, scene: str, ranges: dict[str, tuple[float, float]], duration: float = 1.05) -> tuple[str | None, float]:
    index = SCENE_ORDER.index(scene)
    if index == 0:
        return None, 1.0
    start, _end = ranges[scene]
    return SCENE_ORDER[index - 1], smoothstep((t - start) / duration)


def caption_at(captions: list[Caption], t: float) -> Caption | None:
    for caption in captions:
        if caption.start <= t < caption.end:
            return caption
    return None


def normalized_token(text: str) -> str:
    return re.sub(r"[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]", "", text).lower()


def active_caption_word_index(caption: Caption | None, timings: list[WordTiming], t: float) -> int | None:
    if caption is None:
        return None
    local_timings = [timing for timing in timings if timing.start < caption.end + 0.08 and timing.end + 0.08 > caption.start]
    active_actual = next(
        (index for index, timing in enumerate(local_timings) if timing.start <= t < timing.end + 0.08),
        None,
    )
    if active_actual is None:
        return None
    expected = [normalized_token(word) for word in caption.text.split()]
    actual = [normalized_token(timing.text) for timing in local_timings]
    actual_to_expected: dict[int, int] = {}
    matcher = difflib.SequenceMatcher(a=expected, b=actual, autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for offset in range(i2 - i1):
                actual_to_expected[j1 + offset] = i1 + offset
        elif tag == "replace":
            for offset in range(min(i2 - i1, j2 - j1)):
                actual_to_expected[j1 + offset] = i1 + offset
    return actual_to_expected.get(active_actual)


def line_distance_field(x0: float, y0: float, x1: float, y1: float) -> np.ndarray:
    px = GRID_X - x0
    py = GRID_Y - y0
    vx = x1 - x0
    vy = y1 - y0
    u = np.clip((px * vx + py * vy) / max(0.0001, vx * vx + vy * vy), 0.0, 1.0)
    dx = GRID_X - (x0 + u * vx)
    dy = GRID_Y - (y0 + u * vy)
    return np.sqrt(dx * dx + dy * dy)


def repeated_signal_field(t: float) -> np.ndarray:
    x = GRID_X
    y = GRID_Y
    base = 0.12 + 0.08 * np.sin(17 * x + 41 * y + t * 1.5)
    lattice = 0.14 * (np.mod(x * 20 + y * 15, 1.0) < 0.07)
    scan = 0.2 * (np.abs(y - np.mod(t * 0.15, 1.0)) < 0.025)
    return np.clip(base + lattice + scan, 0.0, 1.0)


def field_for_scene(scene: str, t: float, progress: float) -> np.ndarray:
    x = GRID_X
    y = GRID_Y
    rng = np.random.default_rng(int(t * FPS) + 113)
    shimmer = 0.06 * np.sin(24 * x - 19 * y + t * 1.8)
    if scene == "noise":
        noise = rng.random((ROWS, COLS)) * 0.78
        bands = 0.18 * (np.mod(y * 54 + t * 2.3, 1.0) < 0.18)
        return np.clip(0.08 + noise + bands + shimmer, 0.0, 1.0)
    if scene == "signal":
        field = repeated_signal_field(t)
        for px, py in [(0.22, 0.34), (0.48, 0.28), (0.74, 0.42), (0.38, 0.64), (0.66, 0.72)]:
            field += np.exp(-(((x - px) ** 2 + (y - py) ** 2) / 0.0014)) * 0.72
        return np.clip(field + shimmer, 0.0, 1.0)
    if scene == "overload":
        noise = rng.random((ROWS, COLS)) * 0.42
        slash = (np.abs(np.sin((x + y * 0.32 + t * 0.14) * 33)) < 0.12).astype(float) * 0.38
        return np.clip(0.1 + noise + slash + shimmer, 0.0, 1.0)
    if scene == "loop":
        radius = np.sqrt((x - 0.5) ** 2 + ((y - 0.5) * 0.7) ** 2)
        orbit = np.exp(-((radius - 0.28) ** 2) / 0.0005)
        spokes = 0.16 * (np.abs(np.sin(np.arctan2(y - 0.5, x - 0.5) * 8 + t)) < 0.12)
        return np.clip(0.1 + orbit * 0.72 + spokes + shimmer, 0.0, 1.0)
    if scene == "mirror":
        left = 0.5 + 0.45 * np.sin(28 * x + t * 1.3)
        mirrored = np.abs(left - np.fliplr(left))
        rings = 0.28 * np.sin(42 * np.sqrt((x - 0.5) ** 2 + (y - 0.53) ** 2) - t * 2.2) ** 2
        return np.clip(0.12 + mirrored * 0.52 + rings + shimmer, 0.0, 1.0)
    if scene == "questions":
        scan = repeated_signal_field(t) * 0.42
        lock = np.exp(-(((x - 0.5) ** 2 + (y - 0.48) ** 2) / max(0.002, 0.11 - progress * 0.09)))
        return np.clip(0.08 + scan + lock * 0.68 + shimmer, 0.0, 1.0)
    if scene == "break":
        orbit = np.exp(-((np.sqrt((x - 0.5) ** 2 + ((y - 0.5) * 0.7) ** 2) - 0.28) ** 2) / 0.0005)
        cut = line_distance_field(0.14, 0.78, 0.88, 0.22)
        fracture = np.exp(-(cut * 72) ** 2)
        return np.clip(0.1 + orbit * (1.0 - smoothstep(progress)) * 0.7 + fracture * 0.86 + shimmer, 0.0, 1.0)
    horizon = np.exp(-((y - (0.65 - progress * 0.12)) ** 2) / 0.001)
    return np.clip(0.08 + horizon * 0.72 + shimmer, 0.0, 1.0)


def draw_ascii_field(draw: ScaledDraw, field: np.ndarray, scene: str, t: float) -> None:
    accent, secondary = SCENE_ACCENTS[scene]
    indexes = np.clip((field * (len(GLYPHS) - 1)).astype(int), 0, len(GLYPHS) - 1)
    char_width = draw.textbbox((0, 0), "M", font=ASCII_FONT)[2]
    start_x = (BASE_W - char_width * COLS) / 2
    for row in range(ROWS):
        glyph_row = "".join(GLYPHS[indexes[row]])
        mix = 0.48 + 0.22 * math.sin(row * 0.12 + t * 0.8)
        color = tuple(int(accent[i] * mix + secondary[i] * (1.0 - mix) * 0.22) for i in range(3))
        draw.text((start_x, int(PIX_Y[row])), glyph_row, font=ASCII_FONT, fill=(*color, 176))


def center_text(draw: ScaledDraw, center: tuple[int, int], text: str, used_font: ImageFont.FreeTypeFont, fill: tuple[int, ...]) -> None:
    box = draw.textbbox((0, 0), text, font=used_font)
    draw.text((center[0] - (box[2] - box[0]) / 2, center[1] - (box[3] - box[1]) / 2), text, font=used_font, fill=fill)


def draw_scanline(draw: ScaledDraw, t: float, scene: str) -> None:
    accent, _secondary = SCENE_ACCENTS[scene]
    y = 84 + int((BASE_H - 176) * ((t * 0.12) % 1.0))
    draw.line((24, y, BASE_W - 24, y), fill=(*accent, 82), width=1)
    draw.line((24, y + 2, BASE_W - 24, y + 2), fill=(*accent, 26), width=1)


def draw_top_meta(draw: ScaledDraw, scene: str, t: float) -> None:
    accent, _secondary = SCENE_ACCENTS[scene]
    draw.text((30, 27), "EL INSTANTE DEL HOMBRE GRIS  /  ENSAYO VISUAL 02", font=META_FONT, fill=(205, 214, 208, 180))
    right = f"{SCENE_LABELS[scene]}  {int(t):02d}:{int((t % 1) * FPS):02d}"
    width = draw.textbbox((0, 0), right, font=META_FONT)[2]
    draw.text((BASE_W - width - 30, 27), right, font=META_FONT, fill=(*accent, 230))
    draw.line((30, 54, BASE_W - 30, 54), fill=(*accent, 82), width=1)


def draw_registration_marks(draw: ScaledDraw, scene: str) -> None:
    accent, _secondary = SCENE_ACCENTS[scene]
    for x, y, direction_x, direction_y in [(30, 112, 1, 1), (BASE_W - 30, 112, -1, 1), (30, 1118, 1, -1), (BASE_W - 30, 1118, -1, -1)]:
        draw.line((x, y, x + direction_x * 22, y), fill=(*accent, 78), width=1)
        draw.line((x, y, x, y + direction_y * 22), fill=(*accent, 78), width=1)


def draw_chapter_progress(draw: ScaledDraw, scene: str) -> None:
    accent, secondary = SCENE_ACCENTS[scene]
    active_index = SCENE_ORDER.index(scene)
    start_x = 174
    end_x = BASE_W - 174
    y = 79
    step = (end_x - start_x) / (len(SCENE_ORDER) - 1)
    draw.line((start_x, y, end_x, y), fill=(*secondary, 54), width=1)
    for index in range(len(SCENE_ORDER)):
        x = start_x + index * step
        radius = 4 if index == active_index else 2
        fill = (*accent, 238) if index <= active_index else (*secondary, 92)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


def draw_atmosphere(draw: ScaledDraw, scene: str, t: float) -> None:
    accent, secondary = SCENE_ACCENTS[scene]
    scene_seed = SCENE_ORDER.index(scene) * 131
    for index in range(22):
        x = 34 + ((index * 149 + scene_seed + int(t * (13 + index % 5))) % 652)
        y = 126 + ((index * 211 + scene_seed * 3 + int(t * (8 + index % 7))) % 936)
        pulse = 0.46 + 0.54 * math.sin(t * 1.4 + index * 1.71) ** 2
        radius = 1 + index % 3
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*accent, int(24 + pulse * 54)))
    for index in range(5):
        y = 168 + index * 184 + 16 * math.sin(t * 0.44 + index)
        x = 42 + index * 29
        length = 74 + index * 26
        draw.line((x, y, x + length, y), fill=(*secondary, 30), width=1)
        draw.line((BASE_W - x - length, y + 36, BASE_W - x, y + 36), fill=(*accent, 26), width=1)


def draw_transition_overlay(draw: ScaledDraw, scene: str, blend: float) -> None:
    if blend >= 1.0:
        return
    accent, secondary = SCENE_ACCENTS[scene]
    pulse = math.sin(math.pi * blend)
    x = 36 + blend * (BASE_W - 72)
    width = 9 + pulse * 18
    draw.rectangle((x - width, 112, x + width, 1118), fill=(*accent, int(7 + pulse * 13)))
    draw.line((x, 112, x, 1118), fill=(*accent, int(138 + pulse * 104)), width=2)
    draw.line((x - 5, 112, x - 5, 1118), fill=(*secondary, int(18 + pulse * 38)), width=1)
    draw.line((x + 5, 112, x + 5, 1118), fill=(*secondary, int(18 + pulse * 38)), width=1)
    for y in range(154, 1082, 86):
        tick = 12 + pulse * 18
        draw.line((x - tick, y, x + tick, y), fill=(*accent, int(34 + pulse * 64)), width=1)
    draw.polygon([(x, 126), (x + 8, 138), (x, 150), (x - 8, 138)], fill=(*accent, int(156 + pulse * 88)))
    draw.text((46, 1068), f"TRANSICIÓN / {SCENE_LABELS[scene]}", font=META_FONT, fill=(*accent, int(82 + pulse * 118)))


def scale_layer_alpha(layer: Image.Image, factor: float) -> Image.Image:
    if factor >= 0.999:
        return layer
    adjusted = layer.copy()
    adjusted.putalpha(adjusted.getchannel("A").point(lambda value: int(value * factor)))
    return adjusted


def draw_scene_layer(scene: str, progress: float, t: float) -> Image.Image:
    layer = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    draw = ScaledDraw(layer)
    if scene == "noise":
        draw_noise_hook(draw, progress)
    elif scene == "signal":
        draw_signal(draw, progress, t)
    elif scene == "overload":
        draw_overload(draw, progress, t)
    elif scene == "loop":
        draw_loop(draw, progress, t)
    elif scene == "mirror":
        draw_mirror(draw, progress, t)
    elif scene == "questions":
        draw_questions(draw, progress)
    elif scene == "break":
        draw_break(draw, progress, t)
    else:
        draw_final(draw, progress)
    return layer


def apply_cinematic_post(frame: np.ndarray, scene: str, frame_index: int, transition_blend: float) -> np.ndarray:
    accent, _secondary = SCENE_ACCENTS[scene]
    result = frame.astype(np.float32)
    red = np.roll(result[:, :, 0], 2, axis=1)
    blue = np.roll(result[:, :, 2], -2, axis=1)
    result[:, :, 0] = result[:, :, 0] * 0.84 + red * 0.16
    result[:, :, 2] = result[:, :, 2] * 0.84 + blue * 0.16
    result *= SCANLINE_MASK
    if transition_blend < 1.0:
        pulse = math.sin(math.pi * transition_blend)
        wipe = np.exp(-((POST_X - transition_blend) / 0.065) ** 2)[:, :, None]
        tint = np.array(accent, dtype=np.float32)[None, None, :]
        result += wipe * tint * (0.09 + pulse * 0.16)
    rng = np.random.default_rng(frame_index + 90210)
    grain = rng.normal(0.0, 2.1, result.shape[:2]).astype(np.float32)
    result += grain[:, :, None]
    return np.clip(result, 0, 255).astype(np.uint8)


def draw_noise_hook(draw: ScaledDraw, progress: float) -> None:
    alpha = int(255 * smoothstep(progress / 0.36) * smoothstep((1.0 - progress) / 0.14))
    center_text(draw, (BASE_W // 2, 310), "CUANDO TODO", TITLE_FONT, (225, 230, 222, alpha))
    center_text(draw, (BASE_W // 2, 366), "PARECE RUIDO", HOOK_FONT, (245, 212, 118, alpha))
    center_text(draw, (BASE_W // 2, 430), "HAY UNA PREGUNTA", TITLE_FONT, (225, 230, 222, alpha))


def draw_signal(draw: ScaledDraw, progress: float, t: float) -> None:
    accent, secondary = SCENE_ACCENTS["signal"]
    points = [(155, 330), (346, 270), (550, 374), (265, 612), (486, 686)]
    for index, (x, y) in enumerate(points):
        pulse = 0.5 + 0.5 * math.sin(t * 3.0 + index)
        radius = int(7 + pulse * 7)
        for ring in range(3):
            ring_radius = radius + 12 + ring * 11
            draw.ellipse((x - ring_radius, y - ring_radius, x + ring_radius, y + ring_radius), outline=(*accent, 40 - ring * 9), width=1)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline=(*accent, 180), width=2)
        if index:
            px, py = points[index - 1]
            draw.line((px, py, x, y), fill=(*secondary, 108), width=2)
        draw.text((x + 18, y - 22), f"0{index + 1}", font=META_FONT, fill=(*accent, 176))
    draw.rectangle((102, 208, 618, 762), outline=(*accent, 62), width=1)
    draw.line((102, 238, 618, 238), fill=(*accent, 62), width=1)
    draw.text((120, 216), "RECURRENCIA / TRAZA ACTIVA", font=META_FONT, fill=(*accent, 206))
    center_text(draw, (BASE_W // 2, 500), "SEÑAL  →  PATRÓN  →  CONOCIMIENTO", SMALL_FONT, (*secondary, 244))


def draw_overload(draw: ScaledDraw, progress: float, t: float) -> None:
    words = ["NOTICIAS", "PROMESAS", "ENEMIGOS", "URGENTE", "MIEDO", "BRONCA", "AHORA", "CULPABLE"]
    accent, secondary = SCENE_ACCENTS["overload"]
    for index, word in enumerate(words):
        x = 42 + ((index * 173 + int(t * 84)) % 560)
        y = 168 + ((index * 141 + int(t * 57)) % 584)
        jitter = int(4 * math.sin(t * 7 + index))
        width = draw.textbbox((0, 0), word, font=SMALL_FONT)[2]
        draw.rectangle((x + jitter - 10, y - 7, x + jitter + width + 10, y + 25), fill=(18, 7, 7, 126), outline=(*accent, 104), width=1)
        draw.text((x + jitter, y), word, font=SMALL_FONT, fill=(*accent, 176))
    for index in range(6):
        y = 270 + index * 68
        length = 158 + ((index * 97 + int(t * 46)) % 330)
        draw.line((56, y, 56 + length, y), fill=(*accent, 56 + index * 8), width=2)
        draw.text((62, y - 19), f"ALERTA 0{index + 1}", font=META_FONT, fill=(*accent, 118))
    draw.rectangle((188, 434, 532, 622), fill=(8, 4, 4, 210), outline=(*secondary, 170), width=2)
    draw.line((210, 468, 510, 468), fill=(*secondary, 98), width=1)
    center_text(draw, (BASE_W // 2, 510), "REACCIONAR", HOOK_FONT, (*secondary, 230))
    center_text(draw, (BASE_W // 2, 566), "NO ES PENSAR", TITLE_FONT, (238, 228, 211, 220))


def draw_loop(draw: ScaledDraw, progress: float, t: float) -> None:
    accent, secondary = SCENE_ACCENTS["loop"]
    center = (BASE_W // 2, 485)
    radius_x = 245
    radius_y = 195
    nodes = [("EMOCIÓN", -math.pi / 2), ("PROMESA", 0), ("PODER", math.pi / 2), ("OLVIDO", math.pi)]
    for offset, alpha in [(0, 176), (18, 64), (-18, 64)]:
        draw.arc((center[0] - radius_x - offset, center[1] - radius_y - offset, center[0] + radius_x + offset, center[1] + radius_y + offset), start=0, end=360, fill=(*accent, alpha), width=2)
    for index, (label, angle) in enumerate(nodes):
        x = int(center[0] + math.cos(angle) * radius_x)
        y = int(center[1] + math.sin(angle) * radius_y)
        draw.ellipse((x - 30, y - 30, x + 30, y + 30), fill=(18, 20, 22, 230), outline=(*secondary, 205), width=2)
        width = draw.textbbox((0, 0), label, font=SMALL_FONT)[2]
        draw.text((x - width / 2, y + 40), label, font=SMALL_FONT, fill=(*secondary, 238))
        next_angle = nodes[(index + 1) % len(nodes)][1]
        mid = (angle + ((next_angle - angle + math.pi * 3) % (math.pi * 2) - math.pi)) / 2
        arrow_x = center[0] + math.cos(mid) * radius_x
        arrow_y = center[1] + math.sin(mid) * radius_y
        tangent = mid + math.pi / 2
        draw.polygon(
            [
                (arrow_x + math.cos(tangent) * 11, arrow_y + math.sin(tangent) * 11),
                (arrow_x + math.cos(tangent + 2.45) * 9, arrow_y + math.sin(tangent + 2.45) * 9),
                (arrow_x + math.cos(tangent - 2.45) * 9, arrow_y + math.sin(tangent - 2.45) * 9),
            ],
            fill=(*secondary, 212),
        )
    angle = t * 1.2
    x = int(center[0] + math.cos(angle) * radius_x)
    y = int(center[1] + math.sin(angle) * radius_y)
    draw.ellipse((x - 11, y - 11, x + 11, y + 11), fill=(*accent, 255))
    draw.ellipse((x - 22, y - 22, x + 22, y + 22), outline=(*accent, 82), width=1)
    center_text(draw, center, "MISMO", TITLE_FONT, (241, 224, 192, 238))
    center_text(draw, (center[0], center[1] + 48), "PATRÓN", HOOK_FONT, (*accent, 255))


def draw_mirror(draw: ScaledDraw, progress: float, t: float) -> None:
    accent, secondary = SCENE_ACCENTS["mirror"]
    axis_x = BASE_W // 2
    draw.rectangle((102, 156, 618, 782), outline=(*accent, 82), width=1)
    draw.rectangle((126, 180, axis_x - 20, 758), outline=(*secondary, 46), width=1)
    draw.rectangle((axis_x + 20, 180, 594, 758), outline=(*accent, 46), width=1)
    draw.line((axis_x, 150, axis_x, 786), fill=(*accent, 178), width=2)
    for index in range(10):
        y = 206 + index * 53
        length = int(70 + 175 * (0.5 + 0.5 * math.sin(index * 0.72 + t * 1.3)))
        draw.line((axis_x - length, y, axis_x - 18, y), fill=(*secondary, 90), width=2)
        draw.line((axis_x + 18, y, axis_x + length, y), fill=(*accent, 150), width=2)
        draw.ellipse((axis_x - length - 3, y - 3, axis_x - length + 3, y + 3), fill=(*secondary, 130))
        draw.ellipse((axis_x + length - 3, y - 3, axis_x + length + 3, y + 3), fill=(*accent, 180))
    draw.text((142, 194), "ESTÍMULO", font=META_FONT, fill=(*secondary, 172))
    draw.text((497, 194), "REFLEJO", font=META_FONT, fill=(*accent, 172))
    center_text(draw, (axis_x, 470), "TU", TITLE_FONT, (232, 235, 224, 236))
    center_text(draw, (axis_x, 525), "REACCIÓN", HOOK_FONT, (*accent, 250))
    center_text(draw, (axis_x, 585), "TAMBIÉN REPITE", TITLE_FONT, (*secondary, 230))


def draw_questions(draw: ScaledDraw, progress: float) -> None:
    accent, secondary = SCENE_ACCENTS["questions"]
    questions = ["¿YA LO VI ANTES?", "¿CÓMO TERMINÓ?", "¿QUÉ EVIDENCIA HAY?"]
    for index, question in enumerate(questions):
        y = 328 + index * 124
        visible = smoothstep((progress - index * 0.2) / 0.22)
        draw.rectangle((70, y - 30, BASE_W - 70, y + 52), fill=(3, 11, 12, int(132 * visible)), outline=(*accent, int(190 * visible)), width=2)
        draw.text((88, y - 16), f"0{index + 1}", font=META_FONT, fill=(*accent, int(214 * visible)))
        draw.line((122, y - 7, 122, y + 29), fill=(*accent, int(112 * visible)), width=1)
        center_text(draw, (BASE_W // 2, y + 11), question, TITLE_FONT, (*secondary, int(255 * visible)))
    radius = 218 - int(progress * 88)
    draw.ellipse((BASE_W // 2 - radius, 480 - radius, BASE_W // 2 + radius, 480 + radius), outline=(*secondary, 62), width=1)
    draw.line((BASE_W // 2 - radius - 22, 480, BASE_W // 2 + radius + 22, 480), fill=(*secondary, 52), width=1)
    draw.line((BASE_W // 2, 480 - radius - 22, BASE_W // 2, 480 + radius + 22), fill=(*secondary, 52), width=1)


def draw_break(draw: ScaledDraw, progress: float, t: float) -> None:
    accent, secondary = SCENE_ACCENTS["break"]
    center = (BASE_W // 2, 482)
    radius_x = 246
    radius_y = 194
    for index in range(32):
        angle_a = index / 32 * math.pi * 2
        angle_b = (index + 0.76) / 32 * math.pi * 2
        if index in {2, 3, 19, 20}:
            continue
        x0 = center[0] + math.cos(angle_a) * radius_x
        y0 = center[1] + math.sin(angle_a) * radius_y
        x1 = center[0] + math.cos(angle_b) * radius_x
        y1 = center[1] + math.sin(angle_b) * radius_y
        draw.line((x0, y0, x1, y1), fill=(*secondary, 150), width=3)
    cut = ease_out(progress)
    draw.line((120, 700, 120 + cut * 490, 248), fill=(*accent, 245), width=5)
    for index in range(14):
        drift = ease_out(progress) * (24 + index * 5)
        angle = (index / 14) * math.pi * 2 + 0.22
        x = center[0] + math.cos(angle) * (radius_x + drift)
        y = center[1] + math.sin(angle) * (radius_y + drift * 0.72)
        size = 7 + index % 4 * 3
        draw.polygon([(x, y - size), (x + size, y + size), (x - size, y + size * 0.62)], fill=(*accent, 116))
    center_text(draw, center, "ROMPER", HOOK_FONT, (*accent, 248))
    center_text(draw, (center[0], center[1] + 64), "EL BUCLE", TITLE_FONT, (232, 235, 224, 238))


def seal_mask() -> np.ndarray:
    logo = Image.open(DEFAULT_LOGO).convert("RGBA")
    raw = np.asarray(logo).astype(np.float32)
    alpha = raw[:, :, 3]
    luminance = raw[:, :, :3].mean(axis=2)
    visible = (alpha > 20) & (luminance > 18)
    ys, xs = np.where(visible)
    if len(xs) and len(ys):
        pad = 80
        logo = logo.crop(
            (
                max(0, int(xs.min()) - pad),
                max(0, int(ys.min()) - pad),
                min(logo.width, int(xs.max()) + pad),
                min(logo.height, int(ys.max()) + pad),
            )
        )
    logo.thumbnail((390, 390), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (390, 390), (0, 0, 0, 0))
    canvas.alpha_composite(logo, ((390 - logo.width) // 2, (390 - logo.height) // 2))
    arr = np.asarray(canvas).astype(np.float32)
    alpha = arr[:, :, 3] / 255.0
    luminance = arr[:, :, :3].mean(axis=2) / 255.0
    return np.where((alpha > 0.08) & (luminance > 0.07), alpha * np.maximum(0.22, luminance), 0.0)


SEAL_MASK = seal_mask()


def draw_seal(draw: ScaledDraw, progress: float, *, center_y: int = 470, opacity: int = 220) -> None:
    reveal = ease_out(progress)
    start_x = (BASE_W - SEAL_MASK.shape[1]) // 2
    start_y = center_y - SEAL_MASK.shape[0] // 2
    glyph_index = 0
    for row in range(0, SEAL_MASK.shape[0], 12):
        for col in range(0, SEAL_MASK.shape[1], 8):
            if SEAL_MASK[row, col] < 0.2 or col / SEAL_MASK.shape[1] > reveal:
                continue
            glyph = SEAL_GLYPHS[glyph_index % len(SEAL_GLYPHS)]
            glyph_index += 1
            shade = int(158 + SEAL_MASK[row, col] * 90)
            draw.text((start_x + col, start_y + row), glyph, font=ASCII_FONT, fill=(shade, int(shade * 0.82), 96, opacity))


def draw_final(draw: ScaledDraw, progress: float) -> None:
    draw_seal(draw, progress, opacity=230)
    center_text(draw, (BASE_W // 2, 712), "DETECTAR PATRONES", TITLE_FONT, (245, 221, 150, 255))
    center_text(draw, (BASE_W // 2, 768), "ES LIBERTAD", HOOK_FONT, (232, 235, 224, 255))
    center_text(draw, (BASE_W // 2, 840), "LEÉ EL ARTÍCULO COMPLETO", SMALL_FONT, (245, 221, 150, 238))


def wrap_words(draw: ScaledDraw, text: str, used_font: ImageFont.FreeTypeFont, max_width: int) -> list[list[str]]:
    lines: list[list[str]] = []
    current: list[str] = []
    for word in text.split():
        trial = " ".join([*current, word])
        if current and draw.textbbox((0, 0), trial, font=used_font)[2] > max_width:
            lines.append(current)
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(current)
    return lines


def draw_caption(draw: ScaledDraw, caption: Caption | None, active_word_index: int | None) -> None:
    if caption is None:
        return
    lines = wrap_words(draw, caption.text, CAPTION_FONT, BASE_W - 126)
    line_height = 42
    box_height = len(lines) * line_height + 32
    box_top = 906 - box_height // 2
    box_bottom = box_top + box_height
    draw.rounded_rectangle((42, box_top, BASE_W - 42, box_bottom), radius=8, fill=(4, 7, 9, 218), outline=(220, 198, 128, 78), width=1)
    word_cursor = 0
    for row, words in enumerate(lines):
        widths = [draw.textbbox((0, 0), word, font=CAPTION_FONT)[2] for word in words]
        spaces = [draw.textbbox((0, 0), " ", font=CAPTION_FONT)[2] for _ in words[:-1]]
        total_width = sum(widths) + sum(spaces)
        x = (BASE_W - total_width) / 2
        y = box_top + 16 + row * line_height
        for index, word in enumerate(words):
            is_active = active_word_index == word_cursor
            used_font = CAPTION_BOLD_FONT if is_active else CAPTION_FONT
            fill = (248, 210, 112, 255) if is_active else (240, 241, 232, 248)
            draw.text((x, y), word, font=used_font, fill=fill)
            x += widths[index]
            if index < len(spaces):
                x += spaces[index]
            word_cursor += 1


def draw_bottom_band(draw: ScaledDraw) -> None:
    draw.rectangle((0, 1175, BASE_W, BASE_H), fill=(2, 4, 5, 246))
    draw.line((30, 1175, BASE_W - 30, 1175), fill=(242, 207, 112, 88), width=1)
    center_text(draw, (BASE_W // 2, 1212), PLATFORM_URL, SMALL_FONT, (240, 220, 160, 255))
    center_text(draw, (BASE_W // 2, 1243), "PENSAR ANTES DE REACCIONAR", META_FONT, (185, 198, 190, 220))


def make_frame(t: float, duration: float, captions: list[Caption], timings: list[WordTiming], ranges: dict[str, tuple[float, float]]) -> np.ndarray:
    scene = active_scene(t, ranges)
    progress = scene_progress(t, scene, ranges)
    previous_scene, transition_blend = scene_transition(t, scene, ranges)
    field = field_for_scene(scene, t, progress)
    if previous_scene is not None and transition_blend < 1.0:
        previous_field = field_for_scene(previous_scene, t, 1.0)
        field = previous_field * (1.0 - transition_blend) + field * transition_blend
    image = Image.new("RGBA", (OUT_W, OUT_H), (4, 7, 9, 255))
    draw = ScaledDraw(image)
    draw.rectangle((0, 0, BASE_W, BASE_H), fill=(3, 6, 8, 255))
    draw_ascii_field(draw, field, scene, t)
    draw_atmosphere(draw, scene, t)
    draw_scanline(draw, t, scene)
    draw_top_meta(draw, scene, t)
    draw_registration_marks(draw, scene)
    draw_chapter_progress(draw, scene)

    scene_layer = draw_scene_layer(scene, progress, t)
    if previous_scene is not None and transition_blend < 1.0:
        previous_layer = scale_layer_alpha(draw_scene_layer(previous_scene, 1.0, t), 1.0 - transition_blend)
        scene_layer = Image.alpha_composite(previous_layer, scale_layer_alpha(scene_layer, transition_blend))

    glow = scene_layer.filter(ImageFilter.GaussianBlur(round(5 * RENDER_SCALE)))
    glow_alpha = glow.getchannel("A").point(lambda value: int(value * 0.34))
    glow.putalpha(glow_alpha)
    image = Image.alpha_composite(image, glow)
    image = Image.alpha_composite(image, scene_layer)
    draw = ScaledDraw(image)
    draw_transition_overlay(draw, scene, transition_blend)
    active_caption = caption_at(captions, t)
    draw_caption(draw, active_caption, active_caption_word_index(active_caption, timings, t))
    draw_bottom_band(draw)

    frame = np.array(image.convert("RGB"))
    frame = np.clip(frame.astype(np.float32) * VIGNETTE[:, :, None], 0, 255).astype(np.uint8)
    return apply_cinematic_post(frame, scene, int(t * FPS), transition_blend)


def generate_music(duration: float) -> np.ndarray:
    total = int((duration + 1.0) * SR)
    track = np.zeros((total, 2), dtype=np.float32)
    chords = [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [38, 45, 50, 53]]
    for bar_index, start in enumerate(np.arange(0.0, duration, 4.0)):
        chord = chords[bar_index % len(chords)]
        for note_index, note in enumerate(chord):
            add_note(track, SR, float(start) + note_index * 0.04, 5.1, note, 0.024, 0.18 + note_index * 0.2, "bell")
        add_note(track, SR, float(start), 3.8, chord[0] - 12, 0.05, 0.5, "bass")
    for tick_index, start in enumerate(np.arange(0.4, duration, 0.5)):
        note = 78 if tick_index % 4 else 83
        add_note(track, SR, float(start), 0.18, note, 0.014, 0.72, "pluck")
    for start in [0.0, duration * 0.11, duration * 0.28, duration * 0.44, duration * 0.63, duration * 0.78, duration * 0.9]:
        add_note(track, SR, float(start), 2.2, 50, 0.045, 0.28, "bell")
        add_note(track, SR, float(start) + 0.05, 2.0, 62, 0.034, 0.7, "bell")
    rng = np.random.default_rng(91)
    noise = rng.normal(0, 0.01, track.shape).astype(np.float32)
    noise = cv2.GaussianBlur(noise, (0, 0), 18)
    track += noise
    for delay_s, gain in [(0.22, 0.16), (0.44, 0.11), (0.88, 0.07)]:
        delay = int(delay_s * SR)
        track[delay:] += track[:-delay, ::-1] * gain
    fade = int(1.2 * SR)
    track[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)[:, None]
    track[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)[:, None]
    peak = max(0.001, float(np.max(np.abs(track))))
    return track / peak * 0.46


def add_stereo_sfx(track: np.ndarray, sr: int, start: float, mono: np.ndarray, pan: float = 0.5) -> None:
    start_sample = max(0, int(start * sr))
    source_start = max(0, -int(start * sr))
    end_sample = min(len(track), start_sample + len(mono) - source_start)
    if end_sample <= start_sample:
        return
    usable = mono[source_start : source_start + end_sample - start_sample]
    left = math.sqrt(max(0.0, 1.0 - pan))
    right = math.sqrt(max(0.0, pan))
    track[start_sample:end_sample, 0] += usable * left
    track[start_sample:end_sample, 1] += usable * right


def sfx_wave(kind: str, duration: float, sr: int, seed: int) -> np.ndarray:
    total = max(1, int(duration * sr))
    x = np.arange(total, dtype=np.float32) / sr
    rng = np.random.default_rng(seed)
    if kind == "whoosh":
        noise = rng.normal(0.0, 1.0, total).astype(np.float32)
        smooth = np.convolve(noise, np.ones(96, dtype=np.float32) / 96.0, mode="same")
        env = np.sin(np.pi * np.clip(x / duration, 0, 1)) ** 1.6
        return smooth * env * 0.52
    if kind == "impact":
        env = np.exp(-x * 7.4)
        body = np.sin(2 * math.pi * (54 - 16 * x) * x) + 0.34 * np.sin(2 * math.pi * 91 * x)
        noise = rng.normal(0.0, 1.0, total).astype(np.float32) * np.exp(-x * 21)
        return (body * 0.32 + noise * 0.16) * env
    if kind == "ping":
        env = np.exp(-x * 6.8)
        return (np.sin(2 * math.pi * 730 * x) + 0.34 * np.sin(2 * math.pi * 1095 * x)) * env * 0.12
    if kind == "fracture":
        signal = np.zeros(total, dtype=np.float32)
        for _ in range(18):
            offset = int(rng.uniform(0.0, max(0.01, duration - 0.03)) * sr)
            length = min(total - offset, int(0.038 * sr))
            if length <= 0:
                continue
            click_x = np.arange(length, dtype=np.float32) / sr
            signal[offset : offset + length] += rng.uniform(0.12, 0.28) * np.sin(2 * math.pi * rng.uniform(620, 1540) * click_x) * np.exp(-click_x * 88)
        return signal
    env = np.sin(np.pi * np.clip(x / duration, 0, 1)) ** 1.2
    return (np.sin(2 * math.pi * 92 * x) + 0.38 * np.sin(2 * math.pi * 138 * x)) * env * 0.09


def generate_sound_design(duration: float, ranges: dict[str, tuple[float, float]]) -> np.ndarray:
    total = int((duration + 1.0) * SR)
    track = np.zeros((total, 2), dtype=np.float32)
    x = np.arange(total, dtype=np.float32) / SR
    rumble = (np.sin(2 * math.pi * 38 * x) + 0.34 * np.sin(2 * math.pi * 57 * x + 0.8)) * 0.012
    track[:, 0] += rumble
    track[:, 1] += np.roll(rumble, 240)
    for index, scene in enumerate(SCENE_ORDER[1:], start=1):
        start = ranges[scene][0]
        add_stereo_sfx(track, SR, start - 0.48, sfx_wave("whoosh", 1.05, SR, 110 + index), 0.25 + (index % 3) * 0.25)
        add_stereo_sfx(track, SR, start, sfx_wave("impact", 0.72, SR, 210 + index), 0.5)
    signal_start = ranges["signal"][0]
    for index, offset in enumerate([1.2, 2.8, 4.6, 6.2, 7.8]):
        add_stereo_sfx(track, SR, signal_start + offset, sfx_wave("ping", 0.72, SR, 310 + index), 0.22 + index * 0.14)
    overload_start, overload_end = ranges["overload"]
    for index, start in enumerate(np.arange(overload_start + 0.7, overload_end, 0.86)):
        add_stereo_sfx(track, SR, float(start), sfx_wave("ping", 0.34, SR, 410 + index), 0.18 if index % 2 else 0.82)
    break_start = ranges["break"][0]
    add_stereo_sfx(track, SR, break_start + 0.08, sfx_wave("fracture", 1.9, SR, 510), 0.5)
    final_start = ranges["final"][0]
    add_stereo_sfx(track, SR, final_start - 0.34, sfx_wave("resolve", 3.6, SR, 610), 0.5)
    peak = max(0.001, float(np.max(np.abs(track))))
    return track / peak * 0.64


def mix_audio(voice_wav: Path, mixed_wav: Path, music_wav: Path, sfx_wav: Path, captions: list[Caption]) -> tuple[float, int]:
    voice, sr = read_wav(voice_wav)
    duration = len(voice) / sr
    music = generate_music(duration)[: len(voice)]
    sfx = generate_sound_design(duration, scene_ranges(captions, duration))[: len(voice)]
    mono = np.mean(np.abs(voice), axis=1)
    window = max(1, int(0.11 * sr))
    envelope = np.convolve(mono, np.ones(window, dtype=np.float32) / window, mode="same")
    duck = 1.0 - np.clip(envelope * 10.0, 0.0, 0.74)
    voice_peak = max(0.001, float(np.max(np.abs(voice))))
    normalized_voice = voice / voice_peak * 0.8
    mixed = normalized_voice + music * duck[:, None] * 0.24 + sfx * duck[:, None] * 0.48
    peak = max(0.001, float(np.max(np.abs(mixed))))
    if peak > 0.98:
        mixed = mixed / peak * 0.98
    write_wav(music_wav, music, sr)
    write_wav(sfx_wav, sfx, sr)
    write_wav(mixed_wav, mixed, sr)
    return len(voice) / sr, sr


def render_cover(out_path: Path) -> None:
    image = Image.new("RGBA", (OUT_W, OUT_H), (3, 6, 8, 255))
    draw = ScaledDraw(image)
    draw_ascii_field(draw, field_for_scene("signal", 3.4, 0.72), "signal", 3.4)
    draw_top_meta(draw, "signal", 3.4)
    draw_registration_marks(draw, "signal")
    draw_chapter_progress(draw, "signal")
    draw_seal(draw, 1.0, center_y=430, opacity=182)
    draw.rectangle((38, 694, BASE_W - 38, 880), fill=(3, 6, 8, 226), outline=(242, 207, 112, 112), width=1)
    center_text(draw, (BASE_W // 2, 744), "DETECTAR", TITLE_FONT, (235, 239, 230, 255))
    center_text(draw, (BASE_W // 2, 808), "PATRONES", HOOK_FONT, (245, 210, 113, 255))
    center_text(draw, (BASE_W // 2, 862), "PENSAR ANTES DE REACCIONAR", SMALL_FONT, (113, 222, 215, 255))
    draw_bottom_band(draw)
    image.convert("RGB").save(out_path, quality=94)


def render_preview_html(out_path: Path) -> None:
    out_path.write_text(
        """<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Detectar Patrones | Reel premium</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #030608; color: #edf0e9; font-family: Menlo, monospace; }
      main { width: min(100vw, 560px); padding: 20px; }
      video { display: block; width: 100%; max-height: calc(100vh - 92px); background: #030608; border: 1px solid rgba(242, 207, 112, .42); }
      p { margin: 12px 0 0; color: #f2cf70; font-size: 12px; text-align: center; }
    </style>
  </head>
  <body>
    <main>
      <video controls preload="metadata" poster="./__ASSET_SLUG__-cover.jpg">
        <source src="./__ASSET_SLUG__.mp4" type="video/mp4" />
        <track default kind="captions" srclang="es" src="./__ASSET_SLUG__.vtt" label="Español" />
      </video>
      <p>DETECTAR PATRONES / PENSAR ANTES DE REACCIONAR</p>
    </main>
  </body>
</html>
""".replace("__ASSET_SLUG__", ASSET_SLUG),
        encoding="utf-8",
    )


def render_video(video_path: Path, mixed_wav: Path, duration: float, captions: list[Caption], timings: list[WordTiming]) -> None:
    ranges = scene_ranges(captions, duration)
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
        f"{OUT_W}x{OUT_H}",
        "-r",
        str(FPS),
        "-i",
        "pipe:0",
        "-i",
        str(mixed_wav),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "19",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "-shortest",
        str(video_path),
    ]
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    frame_count = int(math.ceil(duration * FPS))
    try:
        for frame_index in range(frame_count):
            frame = make_frame(frame_index / FPS, duration, captions, timings, ranges)
            proc.stdin.write(frame.tobytes())
    finally:
        proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg video encode failed")


def render_instagram_upload(master_path: Path, upload_path: Path) -> None:
    run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(master_path),
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "22",
            "-maxrate",
            "8M",
            "-bufsize",
            "16M",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-movflags",
            "+faststart",
            str(upload_path),
        ]
    )


def relative_to_public(path: Path) -> str:
    return str(path.relative_to(V2_ROOT / "apps/web/public"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--edge-voice", default="es-AR-ElenaNeural")
    parser.add_argument("--edge-rate", default="-1%")
    parser.add_argument("--edge-pitch", default="+3Hz")
    args = parser.parse_args()

    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    script_text = "\n\n".join(unit.text for unit in NARRATION_UNITS)
    units = [(unit.scene, unit.text) for unit in NARRATION_UNITS]

    script_txt = out_dir / f"{ASSET_SLUG}-script.txt"
    script_md = out_dir / f"{ASSET_SLUG}-script.md"
    voice_mp3 = out_dir / f"{ASSET_SLUG}-voiceover.mp3"
    voice_wav = out_dir / f"{ASSET_SLUG}-voiceover.wav"
    music_wav = out_dir / f"{ASSET_SLUG}-music.wav"
    sfx_wav = out_dir / f"{ASSET_SLUG}-sound-design.wav"
    mixed_wav = out_dir / f"{ASSET_SLUG}-mix.wav"
    music_mp3 = out_dir / f"{ASSET_SLUG}-music.mp3"
    sfx_mp3 = out_dir / f"{ASSET_SLUG}-sound-design.mp3"
    mixed_mp3 = out_dir / f"{ASSET_SLUG}-mix.mp3"
    srt_path = out_dir / f"{ASSET_SLUG}.srt"
    vtt_path = out_dir / f"{ASSET_SLUG}.vtt"
    video_path = out_dir / f"{ASSET_SLUG}.mp4"
    upload_path = out_dir / f"{ASSET_SLUG}-instagram-upload.mp4"
    cover_path = out_dir / f"{ASSET_SLUG}-cover.jpg"
    preview_path = out_dir / "index.html"
    manifest_path = out_dir / f"{ASSET_SLUG}-manifest.json"

    script_txt.write_text(script_text + "\n", encoding="utf-8")
    script_md.write_text("# Detectar Patrones\n\n" + "\n\n".join(f"- {unit.text}" for unit in NARRATION_UNITS) + "\n", encoding="utf-8")

    started = time.time()
    duration, timings = synthesize_edge_voice(script_text, voice_mp3, voice_wav, args.edge_voice, args.edge_rate, args.edge_pitch)
    captions = build_precise_captions(units, timings, duration)
    write_subtitles(captions, srt_path, vtt_path)
    duration, _sr = mix_audio(voice_wav, mixed_wav, music_wav, sfx_wav, captions)
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(music_wav), "-codec:a", "libmp3lame", "-q:a", "3", str(music_mp3)])
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(sfx_wav), "-codec:a", "libmp3lame", "-q:a", "3", str(sfx_mp3)])
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mixed_wav), "-codec:a", "libmp3lame", "-q:a", "2", str(mixed_mp3)])
    render_cover(cover_path)
    render_preview_html(preview_path)
    render_video(video_path, mixed_wav, duration, captions, timings)
    render_instagram_upload(video_path, upload_path)

    probe = json.loads(
        capture(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration,size:stream=codec_name,codec_type,width,height,avg_frame_rate",
                "-of",
                "json",
                str(video_path),
            ]
        )
    )
    manifest = {
        "slug": ASSET_SLUG,
        "sourceArticle": ARTICLE_URL,
        "title": "Detectar Patrones",
        "subtitle": "Pensar antes de reaccionar",
        "format": "instagram-reel-premium-pilot",
        "creativeDirection": "cinematic noise-to-signal / morphic transitions / political-loop / self-mirror / break-the-pattern",
        "voiceProvider": "edge-tts",
        "voice": args.edge_voice,
        "voiceRate": args.edge_rate,
        "voicePitch": args.edge_pitch,
        "ttsAlignment": "tts-word-boundary",
        "captionCount": len(captions),
        "wordBoundaryCount": len(timings),
        "durationSeconds": duration,
        "fps": FPS,
        "size": [OUT_W, OUT_H],
        "renderSeconds": round(time.time() - started, 2),
        "scenes": SCENE_ORDER,
        "video": relative_to_public(video_path),
        "instagramUpload": relative_to_public(upload_path),
        "cover": relative_to_public(cover_path),
        "preview": relative_to_public(preview_path),
        "srt": relative_to_public(srt_path),
        "vtt": relative_to_public(vtt_path),
        "scriptText": relative_to_public(script_txt),
        "scriptMarkdown": relative_to_public(script_md),
        "voiceover": relative_to_public(voice_mp3),
        "music": relative_to_public(music_mp3),
        "soundDesign": relative_to_public(sfx_mp3),
        "mix": relative_to_public(mixed_mp3),
        "ffprobe": probe,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
