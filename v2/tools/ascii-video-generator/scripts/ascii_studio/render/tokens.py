"""Design tokens. Every look-affecting value lives here or in looks/*.json.

Nothing that changes how the render looks may be hardcoded in drawing code.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from . import color

LOOKS_DIR = Path(__file__).parent / "looks"


@dataclass(frozen=True)
class Look:
    name: str
    background: str
    ramp: tuple[str, ...]
    accent: str
    glyph_set: str
    field_font: str
    ui_font: str
    cell_w: int
    cell_h: int
    hysteresis: float
    dither: str
    supersample: int
    grain: float
    halation: float
    scanlines: float
    vignette: float
    field_scale: int
    """Integer divisor applied to the buffer dimensions when evaluating the background
    field (legacy.field_luminance). The field is smooth, low-frequency trigonometry, so
    it is evaluated at 1/field_scale of the buffer resolution and upsampled with
    cv2.INTER_LINEAR. plata.json uses 4, chosen because the highest-frequency motif
    (pulse, ~50 cycles across the buffer) still has a period of about 11px at that
    resolution, comfortably above the Nyquist limit, while 8 would be marginal. No
    default is given here: every look's JSON must state its own value."""
    tone_floor: float
    """Floor of the ramp range (0..1) used when colouring the foreground. The chosen
    glyph already encodes the cell's tone through its own ink coverage, so sampling
    the full ramp for colour double-applies that tone and crushes the frame toward
    black. Restricting colour to [tone_floor, 1.0] keeps the foreground bright while
    still varying subtly for depth, so glyph coverage alone carries the tone. No
    default is given here: every look's JSON must state its own value."""
    halation_threshold: float
    """Luma cutoff (0..1) above which a pixel counts as a halation source (render/post.py
    `grade`/`grade_reference`). `halation` (above) controls how strongly bloom is screened
    back in; this controls which pixels bloom in the first place -- only genuinely bright
    glyphs, not every midtone. No default is given here: every look's JSON must state its
    own value."""
    halation_sigma: float
    """Gaussian blur sigma (in full-resolution px) for the halation bloom (render/post.py
    `_halation_bloom`/`grade_reference`). Read from one token so the fast reduced-resolution
    path in `grade` and the full-resolution `grade_reference` oracle it is checked against
    can never drift apart. No default is given here: every look's JSON must state its own
    value."""
    dither_amplitude: float
    """How hard the Bayer dither (see `dither`) is applied to cell signatures before glyph
    matching (render/asciify.py `cell_signatures`). `dither` names which matrix; this
    controls how much midtone texture it adds. No default is given here: every look's
    JSON must state its own value."""
    tone_low_pct: float
    """Low percentile (0..100) of the scene luminance buffer used as the black point for
    per-frame tone mapping (render/frames.py `Renderer.frame`). Replaces a naive raw
    min/max stretch, which let a handful of extreme pixels set the whole frame's exposure
    and measured a stage-zone mean of 64.9/255 against an intended silver look near
    19-26 -- a real regression, not a style choice. No default is given here: every
    look's JSON must state its own value."""
    tone_high_pct: float
    """High percentile (0..100) of the scene luminance buffer used as the white point for
    per-frame tone mapping (render/frames.py `Renderer.frame`), paired with
    `tone_low_pct`. No default is given here: every look's JSON must state its own
    value."""
    tone_gamma: float
    """Gamma applied after the percentile remap (render/frames.py `Renderer.frame`),
    `normalised ** tone_gamma`. >1 compresses the range down (darkens midtones without
    crushing blacks or clipping the highlights the percentile remap already preserved);
    plata's value was measured against the stage-zone mean regression above -- see
    `.superpowers/sdd/stunning.md` for the before/after numbers. No default is given
    here: every look's JSON must state its own value."""
    orientation_weight: float = 0.0
    """Preference for glyph strokes aligned with the source image's local direction."""
    multiscale_detail: float = 0.0
    """Strength of macro/meso/micro structure preservation before glyph matching."""
    depth_contrast: float = 0.0
    """Foreground/background separation derived from the v4 depth planes."""

    def ramp_rgb(self) -> np.ndarray:
        return np.stack([color.hex_to_rgb01(stop) for stop in self.ramp])

    def accent_rgb(self) -> np.ndarray:
        return color.hex_to_rgb01(self.accent)

    def background_rgb(self) -> np.ndarray:
        return color.hex_to_rgb01(self.background)


def load_look(name: str) -> Look:
    path = LOOKS_DIR / f"{name}.json"
    if not path.exists():
        available = sorted(p.stem for p in LOOKS_DIR.glob("*.json"))
        raise FileNotFoundError(f"Unknown look {name!r}. Available: {available}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    payload["ramp"] = tuple(payload["ramp"])
    return Look(**payload)
