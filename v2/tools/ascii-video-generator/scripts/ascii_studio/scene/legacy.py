"""v1 geometry, rasterised into luminance buffers instead of composited as vectors.

Phase 1 keeps v1's shapes but stops drawing them *on top of* the ASCII. Everything
here lands in a float buffer that Stage 2 turns into characters, so the frame has one
visual language. Phase 2 replaces this module with real diagram archetypes.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field as dc_field

import cv2
import numpy as np

from ..render.canvas import ZONES, Grid
from ..render.tokens import Look

FIELD_AMPLITUDE = 0.34   # the background field must never compete with the motif

# A reduced field dimension is never allowed to drop below this, so small canvases
# (the test suite exercises sizes well under 1080x1920) still get a sane field.
MIN_FIELD_DIM = 64


@dataclass
class LegacyChapter:
    motif: str
    keyword: str = ""
    anchors: list[str] = dc_field(default_factory=list)
    seed: int = 0
    density: float = 0.5
    motion: float = 0.5
    text: str = ""
    """The chapter's own spoken text (joined `Chapter.texts`), used by
    `scene/stencil.py`'s `mode="text_fill"` variant -- the field appears
    *made of* the essay's own sentences, not just shaped by them. Empty by
    default so every existing caller (tests, `bench`) is unaffected."""
    composition: str = "radial"
    archetype: str = "field"
    rhetoric: str = "statement"
    relations: list[dict] = dc_field(default_factory=list)
    shots: list[dict] = dc_field(default_factory=list)
    reveal_points: dict[str, float] = dc_field(default_factory=dict)
    temperature: float = 0.0
    camera: str = "hold"
    world: str = "abstract-field"
    hero_subject: str = ""
    plate: str = ""
    depth_layers: int = 4
    lighting: str = "volumetric"
    metamorphosis: str = "reveal"
    world_only: bool = False


def field_luminance(
    chapter: LegacyChapter,
    grid: Grid,
    t: float,
    progress: float,
    field_scale: int,
) -> np.ndarray:
    """v1's field_for(), evaluated at reduced resolution and upsampled.

    The field is smooth, low-frequency trigonometry: evaluating every trig op at full
    supersampled buffer resolution is wasted work, since the pipeline area-averages it
    down to glyph-cell resolution anyway. `field_scale` is the integer divisor applied
    to each buffer dimension before evaluating the trig field; the result is then
    upsampled back to grid.buffer_shape() with cv2.INTER_LINEAR. The divisor is clamped
    so neither reduced dimension falls below MIN_FIELD_DIM, which keeps small canvases
    safe. field_scale=1 evaluates at full resolution (no upsampling), which is useful
    as a fidelity baseline in tests.
    """
    height, width = grid.buffer_shape()

    max_scale_h = max(1, height // MIN_FIELD_DIM)
    max_scale_w = max(1, width // MIN_FIELD_DIM)
    scale = min(max(1, int(field_scale)), max_scale_h, max_scale_w)

    field_height, field_width = height // scale, width // scale
    y, x = np.meshgrid(
        np.linspace(-1.0, 1.0, field_height, dtype=np.float32),
        np.linspace(-1.0, 1.0, field_width, dtype=np.float32),
        indexing="ij",
    )
    motif = chapter.motif
    seed_phase = (chapter.seed % 997) / 997.0 * math.pi * 2
    drift = 0.76 + chapter.motion * 0.72
    spread = 0.86 + chapter.density * 0.34
    phase = t * drift + seed_phase

    if motif == "noise":
        f = np.sin(x * (15 + spread * 4) + phase * 5) * np.cos(y * (17 + spread * 4) - phase * 4)
        f += (0.34 + chapter.density * 0.22) * np.sin((x + y) * (25 + spread * 6) + phase * 8)
    elif motif == "signal":
        r = np.sqrt((x + 0.05) ** 2 + (y - 0.08) ** 2)
        f = np.sin(r * (31 + spread * 6) - phase * 7) * np.exp(-r * (1.0 + chapter.density * 0.4))
        f += 0.45 * np.sin(y * (24 + spread * 6) + phase * 3)
    elif motif == "network":
        f = np.sin(x * (10 + spread * 3) + phase * 2) + np.cos(y * (14 + spread * 3) - phase * 3)
        f += (0.44 + chapter.density * 0.2) * np.sin((x - y) * (17 + spread * 4) + phase)
    elif motif == "orbit":
        r = np.sqrt(x * x + y * y)
        a = np.arctan2(y, x)
        f = np.sin(r * (30 + spread * 7) - phase * 7 + np.sin(a * (3 + chapter.seed % 4)) * 1.4)
    elif motif == "mirror":
        f = np.cos(np.abs(x) * (20 + spread * 5) - phase * 3) * np.sin(y * (15 + spread * 4) + phase)
    elif motif == "blueprint":
        f = (np.cos(x * (28 + spread * 6)) * 0.6 + np.cos(y * (24 + spread * 7)) * 0.6
             + np.sin((x + y) * (7 + spread * 3) + phase))
    elif motif == "pulse":
        r = np.sqrt(x * x + y * y)
        f = np.sin(r * (42 + spread * 9) - phase * 12) * np.exp(-r * (0.58 + chapter.density * 0.2))
    elif motif == "fracture":
        f = (np.sin((x + y * 0.22) * (21 + spread * 5) + phase * 2)
             + np.sign(x + 0.24 * np.sin(y * (7 + spread * 3) + seed_phase)) * 0.9)
    elif motif == "evidence":
        f = np.sin(x * (7 + spread * 2) + phase) + np.sin(y * (19 + spread * 5) - phase * 2)
        f += 0.5 * np.cos((x - y) * (14 + spread * 4))
    else:
        horizon = np.exp(-((y - 0.28) ** 2) * 22)
        f = np.sin(x * (10 + spread * 3) + phase * 2) * 0.58 + np.cos(y * (12 + spread * 3) - phase)
        f += horizon * (1.5 + progress)

    field = ((np.tanh(f) + 1.0) * 0.5).astype(np.float32)
    if scale == 1:
        return field
    return cv2.resize(field, (width, height), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def motif_luminance(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray:
    """v1's draw_motif() geometry, confined to the stage zone, as luminance."""
    height, width = grid.buffer_shape()
    buf = np.zeros((height, width), dtype=np.float32)
    ss = grid.supersample
    sx0, sy0, sx1, sy1 = grid.zone_px(ZONES["stage"])
    sx0, sy0, sx1, sy1 = sx0 * ss, sy0 * ss, sx1 * ss, sy1 * ss
    stage_w, stage_h = sx1 - sx0, sy1 - sy0
    stage = np.zeros((stage_h, stage_w), dtype=np.float32)

    rng = np.random.default_rng(chapter.seed)
    cx, cy = stage_w / 2.0, stage_h / 2.0
    pulse = 1.0 + (0.02 + chapter.motion * 0.045) * math.sin(t * (2.1 + chapter.motion * 2.2))
    detail = max(4, round(7 + chapter.density * 8))
    thickness = max(1, ss)
    unit = min(stage_w, stage_h)

    def ln(pts, value=1.0, w=thickness):
        cv2.polylines(stage, [np.asarray(pts, dtype=np.int32)], False, float(value), w, cv2.LINE_AA)

    def circle(x, y, r, value=1.0, w=thickness):
        cv2.circle(stage, (int(x), int(y)), max(1, int(r)), float(value), w, cv2.LINE_AA)

    motif = chapter.motif
    if motif == "noise":
        for i in range(22 + detail):
            y = stage_h * (i + 0.5) / (22 + detail)
            off = (0.03 + chapter.motion * 0.04) * stage_w * math.sin(i * 1.31 + t * (2.4 + chapter.motion * 3.1))
            split = stage_w * 0.4 + rng.uniform(-0.08, 0.08) * stage_w
            ln([(0, y), (split + off, y + 4), (stage_w, y - 3)], 0.75 if i % 4 else 1.0)
    elif motif in {"signal", "network"}:
        count = max(6, round(6 + chapter.density * 7))
        nodes = [(rng.uniform(0.1, 0.9) * stage_w, rng.uniform(0.1, 0.9) * stage_h) for _ in range(count)]
        for i, p in enumerate(nodes):
            q = nodes[(i * 3 + 2 + chapter.seed % 3) % count]
            ln([p, q], 0.6)
        for i, (x, y) in enumerate(nodes):
            r = unit * (0.018 + (i % 4) * 0.006) * pulse
            circle(x, y, r, 1.0, max(1, 2 * ss))
            circle(x, y, r + unit * 0.016 + unit * 0.008 * math.sin(t * 2 + i), 0.55)
    elif motif == "orbit":
        rings = max(4, round(4 + chapter.density * 4))
        for i in range(rings):
            circle(cx, cy, (unit * 0.13 + i * unit * 0.36 / max(1, rings - 1)) * pulse, 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        for i in range(max(6, detail)):
            a = t * (0.24 + chapter.motion * 0.36) + i * math.pi * 2 / detail
            r = unit * (0.35 + (i % 3) * 0.04)
            circle(cx + math.cos(a) * r, cy + math.sin(a) * r, unit * 0.014, 1.0, max(1, 2 * ss))
    elif motif == "mirror":
        for i in range(8 + detail // 2):
            y = stage_h * (i + 0.5) / (8 + detail // 2)
            ext = unit * (0.14 + 0.11 * math.sin(i * 0.57 + t * (0.6 + chapter.motion)))
            ln([(cx - ext, y), (cx, y + 12), (cx + ext, y)], 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        ln([(cx, 0), (cx, stage_h)], 1.0, max(1, 2 * ss))
    elif motif in {"blueprint", "evidence"}:
        cards = min(4, max(3, len(chapter.anchors) or 3))
        gap = stage_w * 0.03
        cw = (stage_w - gap * (cards - 1)) / cards
        for i in range(cards):
            left = i * (cw + gap)
            top = stage_h * (0.12 + (i % 2) * 0.08)
            ch = stage_h * (0.55 + (i % 3) * 0.05)
            cv2.rectangle(stage, (int(left), int(top)), (int(left + cw), int(top + ch)), 1.0, max(1, 2 * ss), cv2.LINE_AA)
            for row in range(5):
                length = cw * (0.72 - row * 0.04) + rng.uniform(-0.05, 0.05) * cw
                ry = top + ch * 0.28 + row * ch * 0.11
                ln([(left + cw * 0.09, ry), (left + cw * 0.09 + length, ry)], 0.65)
    elif motif == "fracture":
        for i in range(max(5, detail - 1)):
            circle(cx, cy, unit * (0.08 + i * 0.05), 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        pts = [(rng.uniform(0.28, 0.36) * stage_w, float(stage_h))]
        for i in range(1, 5):
            pts.append((rng.uniform(0.38, 0.68) * stage_w, stage_h - i * stage_h * 0.24))
        ln(pts, 1.0, max(2, 5 * ss))
    elif motif == "pulse":
        for i in range(max(7, detail)):
            circle(cx, cy, unit * (0.08 + i * 0.05) * pulse, 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        pts = [(0.0, cy)]
        for i in range(1, 7):
            pts.append((stage_w * i / 7.0, cy + rng.uniform(-0.22, 0.22) * stage_h * (0.45 + chapter.motion * 0.6)))
        pts.append((float(stage_w), cy))
        ln(pts, 1.0, max(2, 4 * ss))
    else:  # horizon
        for i in range(max(7, detail)):
            y = stage_h * (0.45 + i * 0.05)
            ln([(0, y), (stage_w, y + 7 * math.sin(t * (0.8 + chapter.motion) + i))], 0.7 if i % 2 else 1.0)
        hy = stage_h * (0.42 + rng.uniform(-0.04, 0.04))
        ln([(0, hy), (stage_w, hy)], 1.0, max(2, 3 * ss))
        for i in range(12 + chapter.seed % 4):
            ln([(stage_w * i / 12.0, hy), (cx, stage_h * (0.92 + (i % 3) * 0.02))], 0.6)

    buf[sy0:sy1, sx0:sx1] = np.clip(stage, 0.0, 1.0)
    return buf


def compose(
    chapter: LegacyChapter,
    grid: Grid,
    t: float,
    progress: float,
    look: Look,
) -> np.ndarray:
    field = field_luminance(chapter, grid, t, progress, field_scale=look.field_scale) * FIELD_AMPLITUDE
    return np.clip(field + motif_luminance(chapter, grid, t, progress), 0.0, 1.0).astype(np.float32)
