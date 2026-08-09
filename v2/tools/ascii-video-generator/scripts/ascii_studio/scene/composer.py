"""New scene source: multi-grid layered composition instead of one sine family.

`compose_scene(chapter, grid, t, progress, look, state)` has the same output
contract as `legacy.compose` (a float32 luminance buffer, `grid.buffer_shape()`,
0..1) so it drops into `render/frames.py::Renderer` behind a `--scene` flag.

Every chapter composes three layers, screen-blended together:

    layer        content                              brightness   grid density
    background   a noise-family field (fbm/warp/...)   0.15-0.30    coarse
    content      the chapter's semantic field           0.40-0.80    main
    accent       sparse SDF geometry / a bright field    0.50-1.00    fine

MULTI-GRID COMPOSITION is the load-bearing technique here (see module docstring
in `scene/fields.py` and the task brief): each layer is evaluated at its OWN,
DIFFERENT array resolution -- background coarsest, content mid, accent finest --
then resampled up to a shared resolution before blending. A coarse, blurry
background shows through the gaps of a sharper content layer, which shows
through the gaps of a still-sharper accent layer. That interference is free
visual complexity; it is not achievable by evaluating every layer at the same
resolution and would be lost if this file "simplified" by doing so.

Performance: the expensive per-pixel math (trig/hash noise) runs on the small
background/content arrays; only one screen-blend and one FeedbackBuffer pass run
at (an accent resolution close to) full buffer size, and accent itself is either
cheap SDF arithmetic or a trig field evaluated with an explicit `scale` to stay
in budget. See `.superpowers/sdd/fix-composer.md` for measured timings.

DIRECTIONAL ARCS: every layer's entry is staggered with `layer_strength`
(background fades in first, content and accent follow) so a chapter visibly
builds instead of every layer snapping to full strength on frame one. That is
this module's answer to the "unbounded sin() wobble" timing complaint.

FEEDBACK: one `FeedbackBuffer` per chapter, created lazily and cached in `state`
(a plain dict owned by the caller's `Renderer`). `Renderer.reset()` must clear
`state` at every chapter cut -- see `render/frames.py` -- or a chapter's trail
would smear into the next chapter's first frames.
"""

from __future__ import annotations

import math

import cv2
import numpy as np

from ..render import easing, stencil
from ..render.canvas import ZONES, Grid
from ..render.feedback import FeedbackBuffer, ghostly_echo
from ..render.tokens import Look
from ..render.transitions import mask_iris
from . import fields as F, semantic, worlds
from .legacy import LegacyChapter

# ---------------------------------------------------------------------------
# Shared small helpers
# ---------------------------------------------------------------------------

MIN_WORK_DIM = 48
"""Never reduce a layer's working shape below this on either axis -- mirrors
`scene/legacy.py`'s MIN_FIELD_DIM guard for small test canvases."""


def _reduced_shape(height: int, width: int, divisor: int) -> tuple[int, int]:
    divisor = max(1, int(divisor))
    max_div_h = max(1, height // MIN_WORK_DIM)
    max_div_w = max(1, width // MIN_WORK_DIM)
    d = min(divisor, max_div_h, max_div_w)
    return max(1, height // d), max(1, width // d)


def _resize_to(arr: np.ndarray, height: int, width: int) -> np.ndarray:
    if arr.shape == (height, width):
        return arr
    return cv2.resize(arr, (width, height), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def _screen(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Inlined `render/blend.py`'s screen formula on raw float32 0..1 arrays --
    the reference implementation's stated core technique, without paying that
    module's dtype-detection/clip overhead on every one of the millions of
    pixels in a single-channel luminance buffer."""
    return 1.0 - (1.0 - a) * (1.0 - b)


def _to_range(field01: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return (lo + (hi - lo) * np.clip(field01, 0.0, 1.0)).astype(np.float32)


def _to_peak(field01: np.ndarray, peak: float) -> np.ndarray:
    """Scale a field so its OWN troughs stay near 0 and its peaks reach `peak`.

    Unlike `_to_range`, this never floor-shifts -- which matters a lot for a
    screen-blended stack: screen only ever brightens (`screen(a, b) >= max(a,
    b)`), so a layer that is floor-shifted away from 0 has no real "gap" left
    for the layer beneath it to show through -- it just raises everything's
    minimum, which is exactly the flat, low-glyph-diversity plateau this
    module exists to avoid (measured: floor-shifting accent to a [0.5, 1.0]
    band, when accent is a mostly-empty sparse SDF field, single-handedly
    pushed 50-75% of cells onto one glyph on several motifs). `peak` is this
    layer's ceiling brightness from the task brief's layer table.
    """
    return (peak * np.clip(field01, 0.0, 1.0)).astype(np.float32)


def _seed_phase(seed: int) -> float:
    return (int(seed) % 997) / 997.0 * math.pi * 2


def _uv(shape: tuple[int, int]) -> tuple[np.ndarray, np.ndarray]:
    """Aspect-corrected coordinate grid, matching `scene/fields.py::_grid`."""
    h, w = shape
    aspect = w / h
    yy, xx = np.meshgrid(
        np.linspace(-1.0, 1.0, h, dtype=np.float32),
        np.linspace(-aspect, aspect, w, dtype=np.float32),
        indexing="ij",
    )
    return yy, xx


# ---------------------------------------------------------------------------
# Background layer -- coarse noise-family fields
# ---------------------------------------------------------------------------


def _bg_domain_warp(shape, chapter, t, progress):
    return F.vf_domain_warp(
        shape, t, progress, chapter.seed, scale=1,
        freq=1.6 + chapter.density * 0.9, warp_amount=0.45 + chapter.motion * 0.4,
        speed=0.10 + chapter.motion * 0.08,
    )


def _bg_fbm(shape, chapter, t, progress):
    return F.vf_fbm(
        shape, t, progress, chapter.seed, scale=1,
        freq=2.0 + chapter.density * 1.4, octaves=3, speed=0.12 + chapter.motion * 0.10,
    )


def _bg_noise(shape, chapter, t, progress):
    return F.vf_noise(
        shape, t, progress, chapter.seed, scale=1,
        freq=3.2 + chapter.density * 2.0, speed=0.15 + chapter.motion * 0.12,
    )


BACKGROUND_RECIPES = {
    "noise": _bg_domain_warp,
    "signal": _bg_fbm,
    "network": _bg_fbm,
    "orbit": _bg_noise,
    "mirror": _bg_fbm,
    "blueprint": _bg_noise,
    "pulse": _bg_fbm,
    "fracture": _bg_domain_warp,
    "evidence": _bg_noise,
    "horizon": _bg_fbm,
}


# ---------------------------------------------------------------------------
# Content layer -- the chapter's semantic field, main resolution
# ---------------------------------------------------------------------------


def _content_noise(shape, chapter, t, progress):
    return F.vf_noise(
        shape, t, progress, chapter.seed + 11, scale=1,
        freq=6.0 + chapter.density * 4.0, speed=0.35 + chapter.motion * 0.4,
    )


def _content_rings(shape, chapter, t, progress):
    return F.vf_rings(
        shape, t, progress, chapter.seed, freq=6 + chapter.density * 6,
        speed=0.4 + chapter.motion * 0.6,
    )


def _content_voronoi_edges(shape, chapter, t, progress):
    # vf_voronoi's per-pixel cost is a 3x3-neighbour hash search (9 iterations,
    # each with its own sqrt+hash pass), the heaviest generator in the content
    # role even at content's already-reduced shape -- measured 28ms/frame at
    # scale=1 on a 640x360 content shape, alone blowing most of the 60ms
    # compose_scene budget. scale=3 keeps the edge pattern legible after the
    # INTER_LINEAR upsample while cutting that to ~3ms.
    return F.vf_voronoi(
        shape, t, progress, chapter.seed, scale=3, mode="edges",
        freq=4 + chapter.density * 3, speed=0.06 + chapter.motion * 0.06,
    )


def _content_spiral(shape, chapter, t, progress):
    return F.vf_spiral(
        shape, t, progress, chapter.seed, arms=2 + chapter.seed % 3,
        freq=4 + chapter.density * 4, speed=0.3 + chapter.motion * 0.5,
    )


def _content_interference(shape, chapter, t, progress):
    return F.vf_interference(
        shape, t, progress, chapter.seed, freq=10 + chapter.density * 8,
        sources=3, speed=0.3 + chapter.motion * 0.5,
    )


def _content_ripple(shape, chapter, t, progress):
    # The ripple's frequency climbs across the chapter instead of holding still
    # -- a directional arc on a field parameter, not just on layer opacity.
    freq = 12 + chapter.density * 8 + 10 * easing.ease_out(progress)
    return F.vf_ripple(shape, t, progress, chapter.seed, freq=freq,
                        speed=0.5 + chapter.motion * 0.8, decay=1.0)


def _content_tunnel(shape, chapter, t, progress):
    return F.vf_tunnel(
        shape, t, progress, chapter.seed, freq=3 + chapter.density * 3,
        speed=0.55 + chapter.motion * 0.8,
    )


def _content_blueprint_grid(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    cols = 3
    d = np.full(shape, 1e9, dtype=np.float32)
    for i in range(cols):
        cx = -0.6 + 1.2 * i / max(1, cols - 1)
        d = F.sdf_union(d, F.sdf_box(xx, yy, cx=cx, cy=0.0, hw=0.16, hh=0.42))
    rows = 4
    for i in range(rows):
        gy = -0.75 + 1.5 * i / max(1, rows - 1)
        d = F.sdf_union(d, F.sdf_line(xx, yy, x0=-0.85, y0=gy, x1=0.85, y1=gy, thickness=0.006))
    return F.sdf_render(d, edge_width=0.025)


def _content_evidence_cards(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    cards = 3 + int(chapter.density * 2)
    d = np.full(shape, 1e9, dtype=np.float32)
    for i in range(cards):
        cx = -0.7 + 1.4 * i / max(1, cards - 1)
        cy = 0.05 * math.sin(i * 1.7 + chapter.seed)
        d = F.sdf_union(d, F.sdf_box(xx, yy, cx=cx, cy=cy, hw=0.15, hh=0.32))
    return F.sdf_render(d, edge_width=0.03)


CONTENT_RECIPES = {
    "noise": _content_noise,
    "signal": _content_rings,
    "network": _content_voronoi_edges,
    "orbit": _content_spiral,
    "mirror": _content_interference,
    "blueprint": _content_blueprint_grid,
    "pulse": _content_ripple,
    "fracture": _content_voronoi_edges,
    "evidence": _content_evidence_cards,
    "horizon": _content_tunnel,
}


# ---------------------------------------------------------------------------
# Accent layer -- sparse SDF geometry or a bright field, fine resolution
# ---------------------------------------------------------------------------


def _accent_scatter_dots(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    h, w = shape
    aspect = w / h
    rng = np.random.default_rng(chapter.seed)
    n = 12 + int(chapter.density * 14)
    d = np.full(shape, 1e9, dtype=np.float32)
    for i in range(n):
        cx = float(rng.uniform(-aspect, aspect))
        cy = float(rng.uniform(-1.0, 1.0))
        r = 0.007 + 0.005 * (0.5 + 0.5 * math.sin(i * 1.3 + t * (1.2 + chapter.motion)))
        d = F.sdf_union(d, F.sdf_circle(xx, yy, cx=cx, cy=cy, r=r))
    return F.sdf_render(d, edge_width=0.01)


def _accent_rings(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    seed_phase = _seed_phase(chapter.seed)
    rings = 3 + int(chapter.density * 3)
    d = np.full(shape, 1e9, dtype=np.float32)
    pulse = 0.02 * math.sin(t * (1.5 + chapter.motion * 2) + seed_phase)
    for i in range(rings):
        r = 0.12 + i * 0.28 / max(1, rings - 1) + pulse
        d = F.sdf_union(d, F.sdf_ring(xx, yy, r=r, thickness=0.008))
    return F.sdf_render(d, edge_width=0.01)


def _accent_connections(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    h, w = shape
    aspect = w / h
    rng = np.random.default_rng(chapter.seed + 5)
    count = 6 + int(chapter.density * 6)
    nodes = [
        (float(rng.uniform(-aspect * 0.8, aspect * 0.8)), float(rng.uniform(-0.8, 0.8)))
        for _ in range(count)
    ]
    d = np.full(shape, 1e9, dtype=np.float32)
    for i, (x0, y0) in enumerate(nodes):
        x1, y1 = nodes[(i * 3 + 2 + chapter.seed % 3) % count]
        d = F.sdf_union(d, F.sdf_line(xx, yy, x0=x0, y0=y0, x1=x1, y1=y1, thickness=0.004))
    for (x0, y0) in nodes:
        d = F.sdf_union(d, F.sdf_circle(xx, yy, cx=x0, cy=y0, r=0.012))
    return F.sdf_render(d, edge_width=0.01)


def _accent_orbits(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    seed_phase = _seed_phase(chapter.seed)
    n = 5 + int(chapter.density * 5)
    d = np.full(shape, 1e9, dtype=np.float32)
    for i in range(n):
        a = t * (0.3 + chapter.motion * 0.5) + i * math.pi * 2 / n + seed_phase
        r = 0.35 + 0.05 * (i % 3)
        cx, cy = math.cos(a) * r, math.sin(a) * r
        d = F.sdf_union(d, F.sdf_circle(xx, yy, cx=cx, cy=cy, r=0.014))
    d = F.sdf_union(d, F.sdf_ring(xx, yy, r=0.42, thickness=0.006))
    return F.sdf_render(d, edge_width=0.012)


def _accent_mirror_pair(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    seed_phase = _seed_phase(chapter.seed)
    off = 0.22 + 0.03 * math.sin(t * (0.8 + chapter.motion) + seed_phase)
    d = F.sdf_triangle(xx, yy, p0=(-off - 0.18, 0.2), p1=(-off + 0.18, 0.2), p2=(-off, -0.22))
    d2 = F.sdf_triangle(xx, yy, p0=(off - 0.18, 0.2), p1=(off + 0.18, 0.2), p2=(off, -0.22))
    d = F.sdf_union(d, d2)
    d = F.sdf_union(d, F.sdf_line(xx, yy, x0=0.0, y0=-1.0, x1=0.0, y1=1.0, thickness=0.003))
    return F.sdf_render(d, edge_width=0.01)


def _accent_cards(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    d = np.full(shape, 1e9, dtype=np.float32)
    for i in range(3):
        cx = -0.55 + 0.55 * i
        d = F.sdf_union(d, F.sdf_box(xx, yy, cx=cx, cy=0.0, hw=0.15, hh=0.4))
    return F.sdf_render(d, edge_width=0.008)


def _accent_rules(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    d = np.full(shape, 1e9, dtype=np.float32)
    n = 5
    for i in range(n):
        gy = -0.7 + 1.4 * i / max(1, n - 1)
        d = F.sdf_union(d, F.sdf_line(xx, yy, x0=-0.85, y0=gy, x1=0.85, y1=gy, thickness=0.004))
    return F.sdf_render(d, edge_width=0.008)


def _accent_fracture(shape, chapter, t, progress):
    yy, xx = _uv(shape)
    rng = np.random.default_rng(chapter.seed + 3)
    d = np.full(shape, 1e9, dtype=np.float32)
    x, y = float(rng.uniform(-0.1, 0.1)), -1.0
    for _ in range(6):
        x1 = x + float(rng.uniform(-0.3, 0.3))
        y1 = y + 1.6 / 6
        d = F.sdf_union(d, F.sdf_line(xx, yy, x0=x, y0=y, x1=x1, y1=y1, thickness=0.007))
        x, y = x1, y1
    return F.sdf_render(d, edge_width=0.012)


def _accent_tunnel(shape, chapter, t, progress):
    return F.vf_tunnel(shape, t, progress, chapter.seed + 9, scale=3,
                        freq=6 + chapter.density * 4, speed=0.8 + chapter.motion)


def _accent_plasma(shape, chapter, t, progress):
    return F.vf_plasma(shape, t, progress, chapter.seed + 9, scale=3,
                        freq=6 + chapter.density * 3)


ACCENT_RECIPES = {
    "noise": _accent_scatter_dots,
    "signal": _accent_rings,
    "network": _accent_connections,
    "orbit": _accent_orbits,
    "mirror": _accent_mirror_pair,
    "blueprint": _accent_cards,
    "pulse": _accent_tunnel,
    "fracture": _accent_fracture,
    "evidence": _accent_rules,
    "horizon": _accent_plasma,
}


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

_ZOOM_MOTIFS = {"pulse", "horizon"}


def _zoom_tunnel_for_composer() -> FeedbackBuffer:
    """A gentler variant of `render/feedback.py::infinite_zoom_tunnel()`.

    That preset's defaults (decay=0.8, opacity=1.0) are tuned for a short
    burst, not a sustained ~25-second chapter: the "zoom" transform crops
    toward centre every frame, and for a centre-bright motif (`pulse`'s
    ripple, `horizon`'s tunnel -- both radial, brightest at the vanishing
    point) that crop preferentially re-samples the brightest pixels each
    time, which is a second amplification on top of the geometric decay and
    pushes the running mean toward full white well before a chapter this long
    is over -- measured mean luminance climbing from 0.22 to 0.86 over 30s at
    the stock preset. decay=0.6/opacity=0.35 still reads as an expanding
    tunnel (verified visually) but converges to a stable ~0.55-0.6 instead.
    """
    return FeedbackBuffer(decay=0.6, blend_mode="screen", opacity=0.35,
                           transform="zoom", transform_amt=0.012)


def _feedback_for(chapter: LegacyChapter) -> FeedbackBuffer:
    return _zoom_tunnel_for_composer() if chapter.motif in _ZOOM_MOTIFS else ghostly_echo()


def _get_feedback(chapter: LegacyChapter, state: dict) -> FeedbackBuffer:
    fb = state.get("feedback")
    if fb is None:
        fb = _feedback_for(chapter)
        state["feedback"] = fb
        # Remember the preset's own transform_amt so `mid`'s turbulence boost
        # (below) can scale it every frame without compounding onto its own
        # previous frame's already-boosted value.
        state["feedback_base_amt"] = fb.transform_amt
    return fb


# ---------------------------------------------------------------------------
# Keyword stencil -- the field visible THROUGH the chapter's own keyword,
# confined to the `stage` zone (render/canvas.py::ZONES) so it never fights the
# caption/title/footer UI drawn later. See render/stencil.py for the mask/fill
# primitives; this section only decides WHEN and WHICH chapters get it.
# ---------------------------------------------------------------------------

# Only motifs with an argument/diagram/signal feel get the stencil treatment --
# applying it to every chapter would turn a once-per-video structural device
# into wallpaper. `evidence`/`network` additionally get the stronger
# `text_fill` variant (the letters filled with the chapter's own sentences,
# not just a windowed field) because those two motifs are literally about
# evidence and argument -- the strongest variant is reserved for where the
# metaphor is most apt, not spread evenly.
_STENCIL_MOTIFS = {"blueprint", "evidence", "network", "signal", "horizon"}
_STENCIL_TEXT_FILL_MOTIFS = {"evidence", "network"}
_STENCIL_WINDOW = 0.32
"""The stencil only occupies a chapter's opening third -- an entrance flourish,
not a standing state -- so the rest of the chapter reads as its usual field."""
_STENCIL_REVEAL_RAMP = 0.22
"""Fraction of `progress` over which the iris mask (below) grows from nothing
to covering the whole stage-zone crop."""
_STENCIL_WEIGHT = 1.0
"""Bold, not the font's own regular cut -- a visual check of a real frame
showed a thin (weight~0.45) stroke reading as scattered punctuation-like
fragments once run through cell-signature glyph matching at this grid's
resolution (~9x15px canvas cells): most cells straddling a thin stroke only
partially cover it, so low-coverage glyphs win almost everywhere and the word
never reads as connected letterforms. Weight 1.0 (see render/stencil.py's
`_STROKE_FRACTION`) thickens strokes enough that interior cells along a
stroke saturate to a high-coverage glyph instead."""
_STENCIL_CHAR_DIVISOR = 9
"""Microtext font size for `text_fill` is `crop_height // this` -- scales the
letter size to the crop instead of a fixed pixel count, so it stays legible
whether the stage-zone crop is a phone-portrait canvas or a test's tiny one.
A visual check of a real frame with the first value tried (26, ~12px
microtext at this crop's resolution) showed individual characters smaller
than a single glyph cell -- guaranteed to be destroyed by cell-signature
matching before a single letter of the essay survived. 9 keeps each microtext
character on the order of one glyph cell, which is as fine as this pipeline's
resolution can resolve at all."""
_STENCIL_FILL_FLOOR = 0.72
"""The background field feeding the stencil is lifted to `[floor, 1.0]`
before it fills the letters (`floor + (1-floor)*field`), NOT used at its own
natural range. A visual check of a real frame showed why this matters: this
project's "field" glyph set deliberately excludes solid block glyphs and
applies Bayer dithering everywhere (both tuned so an ordinary smooth field
reads as character texture, not flat colour -- see render/glyphs.py). Fed a
letterform whose fill spans the field's own full natural range (as low as
~0.2), that same texturing breaks a 10%-of-frame-area word up into scattered,
disconnected marks instead of a legible mass. Text needs a mostly-flat bright
fill to read as connected strokes; the animated field only needs to supply
the remaining headroom as a subtle shimmer, not the letter's entire tonal
range."""


def _stage_crop_bounds(height: int, width: int) -> tuple[int, int, int, int]:
    """(y0, x0, y1, x1) of the `stage` zone, in the SAME resolution as `height`/
    `width` -- valid at any resolution because `Zone` bounds are fractions of
    the canvas, and every resolution this module works at (buffer, content,
    accent, background) is a uniform scale of the same canvas axes."""
    z = ZONES["stage"]
    y0, y1 = int(round(z.y0 * height)), int(round(z.y1 * height))
    x0, x1 = int(round(z.x0 * width)), int(round(z.x1 * width))
    return max(0, y0), max(0, x0), min(height, y1), min(width, x1)


_STENCIL_PEAK = 0.95
"""The stencil's own peak brightness -- deliberately NOT `content_peak` and
NOT gated by `content_strength`'s slower per-chapter build-in ramp.

First cut of this used `content_peak`/`content_strength`, and a visual check
of a real frame (not caught by any test -- percentile tone mapping accepts
almost any input shape without erroring) showed the letters rendering as
functionally invisible: `content_strength` is a slow fade-in (0 at the
chapter's very first frame, only ~0.5 by the time the iris has finished
revealing at progress=`_STENCIL_REVEAL_RAMP`), and `tone_gamma`'s cubic curve
(render/frames.py -- tuned separately to fix the brightness regression this
task also fixes) crushes anything short of real peak brightness hard. This is
an entrance flourish that must read clearly the moment the iris opens, not a
layer that is still fading in -- so it gets its own near-full peak and its
own fast strength ramp, independent of content's."""


def _apply_keyword_stencil(
    content_layer: np.ndarray,
    chapter: LegacyChapter,
    look: Look,
    t: float,
    progress: float,
) -> tuple[np.ndarray, bool]:
    """Replace the stage-zone crop of `content_layer` with a stencilled fill
    for a chapter's opening window -- the field visible only through the
    chapter's keyword. Returns `(content_layer, activated)`; `activated` lets
    the caller (`compose_scene`) tell `render/frames.py::Renderer.frame` where
    the stencil landed (see `state["stencil_bounds"]` below) so percentile
    tone mapping can be computed on the ORDINARY field, not on a buffer a
    small, deliberately blown-out stencil has just skewed. A no-op outside
    the reveal window, for motifs not in `_STENCIL_MOTIFS`, without a
    keyword, or on a crop too small to be worth it (tiny test canvases).

    The fill is a FRESH evaluation of the motif's own BACKGROUND recipe at the
    crop's own resolution, not a crop of `content_field`: several content
    recipes (`network`/`fracture`'s voronoi EDGES, `blueprint`/`evidence`'s
    thin-line SDF renders) are sparse -- near-zero almost everywhere by
    design, since that sparseness is exactly what makes them read as
    circuitry/blueprints against the rest of the composition. Multiplying a
    sparse field by an already-sparse letterform mask very nearly always lands
    on "both near zero", which measured as a keyword that was legible in
    isolation (see render/stencil.py's own tests) rendering as an almost
    entirely black hole with two or three stray lit pixels once actually
    composited -- caught only by looking at a real frame, no test caught it.
    Every `BACKGROUND_RECIPES` entry is a dense, full-coverage trig field by
    construction (see that dict above), so it reliably has something to show
    inside the letters regardless of which motif's content recipe is sparse.
    """
    if (
        progress >= _STENCIL_WINDOW
        or not chapter.keyword
        or chapter.motif not in _STENCIL_MOTIFS
    ):
        return content_layer, False

    height, width = content_layer.shape
    y0, x0, y1, x1 = _stage_crop_bounds(height, width)
    if (y1 - y0) < MIN_WORK_DIM or (x1 - x0) < MIN_WORK_DIM:
        return content_layer, False

    crop_shape = (y1 - y0, x1 - x0)
    reveal = min(1.0, progress / _STENCIL_REVEAL_RAMP)
    stencil_strength = easing.ease_out(reveal)  # bold as soon as the iris opens -- see _STENCIL_PEAK
    letter_mask = stencil.text_mask(chapter.keyword, crop_shape, look.field_font, weight=_STENCIL_WEIGHT)
    iris = mask_iris(crop_shape, reveal, ease=easing.ease_out)
    revealed_mask = letter_mask * iris

    fill_field = BACKGROUND_RECIPES[chapter.motif](crop_shape, chapter, t, progress)
    fill_field = _STENCIL_FILL_FLOOR + (1.0 - _STENCIL_FILL_FLOOR) * np.clip(fill_field, 0.0, 1.0)
    if chapter.motif in _STENCIL_TEXT_FILL_MOTIFS and chapter.text:
        stencilled = stencil.stencil_field(
            fill_field, revealed_mask, mode="text_fill",
            text=chapter.text, font_path=look.field_font,
            char_px=max(6, crop_shape[0] // _STENCIL_CHAR_DIVISOR), reveal=reveal,
        )
    else:
        stencilled = stencil.stencil_field(fill_field, revealed_mask, mode="inside")

    out = content_layer.copy()
    out[y0:y1, x0:x1] = np.clip(_to_peak(stencilled, _STENCIL_PEAK) * stencil_strength, 0.0, 1.0)
    return out, True


# ---------------------------------------------------------------------------
# Composition
# ---------------------------------------------------------------------------

# Divisors applied to the buffer's (height, width) to get each layer's own
# working resolution -- see the module docstring's MULTI-GRID COMPOSITION
# section. Background is coarsest, content is mid, accent is finest.
#
# None of this needs to approach the buffer's full (supersampled) pixel count:
# `render/asciify.py::cell_signatures` immediately area-averages whatever
# `compose_scene` returns down to `grid.rows*SIG_H x grid.cols*SIG_W` (roughly
# 480x1024 at the default 1080x1920 canvas) before a single glyph is chosen.
# Evaluating a layer -- especially accent's per-shape SDF loop, which is O(n
# shapes) full-array ops, not O(1) -- any finer than that target throws away
# the extra resolution for a real cost: at the initial `_ACCENT_DIVISOR = 1`
# (full 3840x2160 buffer) the `network`/`noise` motifs' accent loops alone
# measured 700ms+/frame. Dividing down close to the signature target fixed
# that; see `.superpowers/sdd/fix-composer.md` for the measured before/after.
_BG_DIVISOR = 12
_CONTENT_DIVISOR = 6
_ACCENT_DIVISOR = 4

# Brightness ceilings from the task brief's layer table. Background is a
# narrow ambient band (floor+ceiling both matter -- it is meant to read as a
# constant soft wash); content and accent are peak-scaled from true 0 (see
# `_to_peak`) so their own dark/empty regions stay real gaps for screen
# blending to work with, instead of a raised floor with nowhere darker to go.
#
# `pulse` and `horizon` get a lower ceiling than everything else: their
# content AND accent recipes (`vf_ripple`/`vf_tunnel`, `vf_tunnel`/`vf_plasma`)
# are both continuous, full-coverage trig fields with no real dark gaps at
# all (unlike every other motif's accent, which is sparse SDF geometry that
# is near-zero almost everywhere). Screen-blending three full-coverage layers
# at the default peaks measured mean luminance 0.75-0.77 with 23-31% of the
# frame above 0.9 once fully entered -- a washed-out plateau, not depth. The
# lower peaks below give those two motifs the same fully-entered headroom
# (mean ~0.5, well under 10% above 0.9) that every sparse-accent motif gets
# for free. See `.superpowers/sdd/fix-composer.md` for the measured sweep.
_BG_RANGE = (0.15, 0.30)
_CONTENT_PEAK = 0.70
_ACCENT_PEAK = 0.85
_CONTENT_PEAK_OVERRIDES = {"pulse": 0.42, "horizon": 0.42}
_ACCENT_PEAK_OVERRIDES = {"pulse": 0.48, "horizon": 0.48}

# Staggered entry: the background is the ambient layer and stays at full
# strength from frame one (a background that fades from a literally uniform
# black buffer would hand the per-frame luminance-normalisation step in
# `render/frames.py::Renderer.frame` a near-zero span on the chapter's first
# frames, which it stretches back to full contrast -- an exposure pump, not a
# build). Content and accent still stagger in on top of it, which is where the
# "chapter builds" arc actually reads.
_CONTENT_ENTER, _CONTENT_RAMP = 0.10, 0.40
_ACCENT_ENTER, _ACCENT_RAMP = 0.24, 0.45

# ---------------------------------------------------------------------------
# Audio-reactive modulation -- `env` values come from
# `audio.score.score_envelopes`/`voice_envelope`, one scalar per key per frame
# (see `render/frames.py::Renderer.frame`). Every amount below is deliberately
# small: this sits under a spoken essay, not a music video, so the brief is
# "felt more than seen" -- these are multipliers layered on top of the
# existing composition, never a replacement for it, and every one of them is a
# no-op at env=None/{} so the pre-existing composer tests (which call
# `compose_scene` without `env`) are untouched.
# ---------------------------------------------------------------------------

_BASS_ZOOM_AMOUNT = 0.05
"""Max crop fraction (see `_bass_breathe`) at bass=1 -- a slow, felt "breathe"
in grid scale, not a visible zoom pump. `render/feedback.py::_transform_zoom`
uses fractions in the same 0.01-0.02 range for a whole chapter's worth of
accumulated zoom; this is a single-frame, non-accumulating nudge on top."""
_MID_CONTENT_BOOST = 0.16
"""Peak-brightness lift on the content layer at mid=1 -- "field density"."""
_MID_TURBULENCE_BOOST = 0.9
"""Extra fraction added to the feedback buffer's own transform_amt at mid=1 --
"turbulence": a denser mid pushes the per-frame feedback warp harder."""
_TREBLE_ACCENT_BOOST = 0.20
"""Peak-brightness lift on the accent layer at treble=1 -- fine-detail presence."""
_TREBLE_SPARKLE_BOOST = 0.22
"""Extra brightness added only to accent pixels already above
`_TREBLE_SPARKLE_THRESHOLD` of the accent layer's own peak, at treble=1 --
the "sparkle": existing bright points flicker brighter, empty gaps stay empty
instead of the whole accent layer just getting uniformly brighter."""
_TREBLE_SPARKLE_THRESHOLD = 0.55
_VOICE_CONTENT_BOOST = 0.10
"""Content-layer density lift while a word is being spoken (voice=1)."""
_VOICE_BRIGHTNESS_LIFT = 0.05
"""Overall multiplicative brightness lift on the composed buffer while a word
is being spoken -- the visuals breathe with the narration, subtly."""


def _bass_breathe(buf: np.ndarray, bass: float) -> np.ndarray:
    """Crop the buffer's centre by a `bass`-scaled fraction and resize back to
    full size -- the same crop-then-upscale "closer/further" read `_transform_zoom`
    uses for feedback, but applied once per frame directly from `bass` instead
    of accumulating, so it reads as the grid breathing with the low end rather
    than an unbounded creeping zoom."""
    if bass <= 1e-3:
        return buf
    h, w = buf.shape[:2]
    frac = min(0.5, _BASS_ZOOM_AMOUNT * bass)
    y0, x0 = int(round(h * frac)), int(round(w * frac))
    y1, x1 = h - y0, w - x0
    if y1 - y0 < 2 or x1 - x0 < 2:
        return buf
    cropped = buf[y0:y1, x0:x1]
    return cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def compose_scene(
    chapter: LegacyChapter,
    grid: Grid,
    t: float,
    progress: float,
    look: Look,
    state: dict,
    env: dict[str, float] | None = None,
) -> np.ndarray:
    """Multi-grid, three-layer scene, screen-blended and fed through a
    per-chapter FeedbackBuffer. Same output contract as `legacy.compose`.

    `state` is a plain dict owned by the caller (one per `Renderer`), used to
    carry the chapter's `FeedbackBuffer` across frames. The caller MUST clear
    it at every chapter cut (see `render/frames.py::Renderer.reset`) or the
    previous chapter's feedback trail bleeds into the next chapter's opening.

    `env` is this frame's audio-reactive envelope (`bass`/`mid`/`treble`/
    `voice`, each 0..1 -- see the "Audio-reactive modulation" section above).
    `beat` is accepted but ignored here: it drives a chromatic-aberration kick
    on the RGB frame, which does not exist yet at this single-channel
    luminance-buffer stage -- see `render/frames.py::Renderer.frame`.
    """
    env = env or {}
    bass = float(np.clip(env.get("bass", 0.0), 0.0, 1.0))
    mid = float(np.clip(env.get("mid", 0.0), 0.0, 1.0))
    treble = float(np.clip(env.get("treble", 0.0), 0.0, 1.0))
    voice = float(np.clip(env.get("voice", 0.0), 0.0, 1.0))

    height, width = grid.buffer_shape()

    # A reviewed illustrated plate is already the complete visual world.  The
    # old path still generated three procedural fields, a semantic diagram and
    # a feedback pass, only to discard every one of them when `Renderer`
    # returned the colour plate.  Load and animate the plate directly; retain
    # the ordinary path below as a deliberate missing-plate diagnostic fallback.
    if look.is_illustrated and chapter.plate:
        state.pop("world_plate_rgb", None)
        plate_frame = worlds.render_world(
            chapter, (height, width), t, progress, state,
        )
        if state.get("world_plate_rgb") is not None:
            for key in ("semantic_layer", "stencil_bounds", "feedback"):
                state.pop(key, None)
            return np.clip(plate_frame.luminance, 0.0, 1.0).astype(np.float32)

    motif = chapter.motif if chapter.motif in BACKGROUND_RECIPES else "horizon"

    bg_h, bg_w = _reduced_shape(height, width, _BG_DIVISOR)
    content_h, content_w = _reduced_shape(height, width, _CONTENT_DIVISOR)
    accent_h, accent_w = _reduced_shape(height, width, _ACCENT_DIVISOR)

    bg_field = BACKGROUND_RECIPES[motif]((bg_h, bg_w), chapter, t, progress)
    content_field = CONTENT_RECIPES[motif]((content_h, content_w), chapter, t, progress)
    accent_field = ACCENT_RECIPES[motif]((accent_h, accent_w), chapter, t, progress)

    content_strength = easing.layer_strength(progress, _CONTENT_ENTER, _CONTENT_RAMP)
    accent_strength = easing.layer_strength(progress, _ACCENT_ENTER, _ACCENT_RAMP)
    # mid/voice both read as "more content present" (density); kept as a single
    # multiplier on strength rather than on the field itself, so it still
    # respects the chapter's own build-in arc instead of fighting it.
    content_strength *= 1.0 + _MID_CONTENT_BOOST * mid + _VOICE_CONTENT_BOOST * voice
    accent_strength *= 1.0 + _TREBLE_ACCENT_BOOST * treble

    bg_layer = _to_range(bg_field, *_BG_RANGE)
    content_peak = _CONTENT_PEAK_OVERRIDES.get(motif, _CONTENT_PEAK)
    accent_peak = _ACCENT_PEAK_OVERRIDES.get(motif, _ACCENT_PEAK)
    content_layer = np.clip(_to_peak(content_field, content_peak) * content_strength, 0.0, 1.0)
    accent_layer = np.clip(_to_peak(accent_field, accent_peak) * accent_strength, 0.0, 1.0)

    # v4 builds a recognizable cinematic world before adding the explanatory
    # diagram.  Both remain inside the luminance buffer and therefore become
    # native ASCII; labels alone are redrawn crisply after the glyph grade.
    has_world = chapter.world not in {"", "abstract-field"}
    if has_world:
        # The illustrated paper mode keeps approved plates at the final buffer
        # resolution.  Its colour image is the actual photographed/painted
        # world, not merely a low-resolution source for glyph matching.  The
        # monochrome depth/hero maps are reduced again for the semantic
        # compositor below, retaining the existing performance profile.
        world_shape = (height, width) if look.is_illustrated else (accent_h, accent_w)
        world_frame = worlds.render_world(chapter, world_shape, t, progress, state)
        world_layer = _resize_to(world_frame.luminance, accent_h, accent_w)
        state["world_layer"] = world_layer
        state["world_depth"] = _resize_to(world_frame.depth, accent_h, accent_w)
        state["hero_mask"] = _resize_to(world_frame.hero_mask, accent_h, accent_w)
        state["world_identity"] = chapter.world
    else:
        world_layer = np.zeros((accent_h, accent_w), dtype=np.float32)
        for key in ("world_layer", "world_depth", "hero_mask", "world_identity"):
            state.pop(key, None)

    semantic_layer = (
        np.zeros((accent_h, accent_w), dtype=np.float32)
        if chapter.world_only
        else semantic.render_semantic(chapter, (accent_h, accent_w), look, progress)
    )
    if chapter.archetype != "field" and not chapter.world_only:
        state["semantic_layer"] = semantic_layer
    else:
        state.pop("semantic_layer", None)
    if chapter.archetype != "field" or has_world:
        bg_layer *= 0.44 if has_world else 0.56
        content_layer *= 0.24 if has_world else 0.34
        accent_layer *= 0.10 if has_world else 0.18
        quiet = cv2.GaussianBlur((semantic_layer > 0.08).astype(np.float32), (0, 0), 4.0)
        content_layer *= 1.0 - 0.48 * _resize_to(quiet, content_h, content_w)
        accent_layer *= 1.0 - 0.58 * quiet
    if has_world:
        accent_layer = _screen(accent_layer, np.clip(world_layer * (0.86 + 0.12 * accent_strength), 0.0, 1.0))
    if not chapter.world_only:
        semantic_mix = (0.64 if has_world else 0.84) + 0.12 * accent_strength
        accent_layer = _screen(accent_layer, np.clip(semantic_layer * semantic_mix, 0.0, 1.0))

    content_layer, stencil_active = _apply_keyword_stencil(content_layer, chapter, look, t, progress)
    # Told to `render/frames.py::Renderer.frame` via `state` (see docstring above)
    # so it can exclude this crop from the percentile tone-mapping sample --
    # otherwise a small, deliberately blown-out region skews the mapping for the
    # entire frame. Cleared (not left stale) the moment the stencil is not active,
    # so a later frame in the same chapter is not wrongly excluded too.
    if stencil_active:
        state["stencil_bounds"] = _stage_crop_bounds(height, width)
    else:
        state.pop("stencil_bounds", None)

    if treble > 1e-3:
        sparkle_mask = accent_layer > (_TREBLE_SPARKLE_THRESHOLD * accent_peak)
        accent_layer = np.clip(
            accent_layer + sparkle_mask * (_TREBLE_SPARKLE_BOOST * treble), 0.0, 1.0
        )

    # Screen-blend background into content at content's own (mid) resolution --
    # cheap, and it is what lets the coarse background's soft shapes show
    # through the gaps of the sharper content field once both are upsampled
    # together, rather than each being independently smoothed into the buffer.
    bg_at_content = _resize_to(bg_layer, content_h, content_w)
    mid_layer = _screen(bg_at_content, content_layer)

    # One upsample to the accent's resolution (usually the full buffer), one
    # screen-blend with accent -- the only per-pixel work done at (near-)full
    # buffer size.
    mid_at_accent = _resize_to(mid_layer, accent_h, accent_w)
    composed = _screen(mid_at_accent, accent_layer)

    if bass > 1e-3:
        composed = _bass_breathe(composed, bass)
    if voice > 1e-3:
        composed = np.clip(composed * (1.0 + _VOICE_BRIGHTNESS_LIFT * voice), 0.0, 1.0)

    # Feedback (decay + cv2 transform + blend) runs at the accent resolution,
    # not the full buffer -- at the initial full-buffer placement this one call
    # alone measured ~28ms/frame (a `FeedbackBuffer.apply` on an 8.3M-element
    # array does a clip+copy, a decay multiply, a cv2 transform, and a blend,
    # each touching every pixel). Its cheap geometric transforms (crop-resize,
    # small-angle warpAffine, roll) work in resolution-independent fractions of
    # the frame, so running them at accent resolution and upsampling the result
    # once afterwards is visually equivalent and an order of magnitude cheaper.
    fb = _get_feedback(chapter, state)
    # Always re-derive from the stored base amount (never from `fb.transform_amt`
    # itself) so this never compounds frame over frame, and so mid dropping back
    # to 0 relaxes the turbulence back to the preset's own amount instead of
    # sticking at whatever the last loud frame set it to.
    fb.transform_amt = state["feedback_base_amt"] * (1.0 + _MID_TURBULENCE_BOOST * mid)
    composed = fb.apply(np.clip(composed, 0.0, 1.0).astype(np.float32))

    composed = _resize_to(composed, height, width)
    return np.clip(composed, 0.0, 1.0).astype(np.float32)
