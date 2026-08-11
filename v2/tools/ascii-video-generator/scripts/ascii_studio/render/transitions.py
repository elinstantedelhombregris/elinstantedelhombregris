"""Cuts between chapters, plus animated masks reusable mid-scene.

`tr_*` functions take two full frames (`a` the outgoing chapter, `b` the incoming
one) and a progress scalar and return one composited frame. `mask_*` functions
return a single-channel float32 0..1 mask for the same progress scalar -- they back
the wipe transitions, but are exposed standalone because the same "circle growing
from nothing" or "random per-pixel reveal" is just as useful for revealing an
element mid-scene (a keyword fading in inside an iris, say) as it is for cutting
between chapters.

Every mask is monotonic in progress: a pixel that is revealed at progress `p` stays
revealed for all `p' > p`. That is what makes them safe to drive with an
easing-warped progress value without the reveal ever flickering backwards.
"""

from __future__ import annotations

from typing import Callable

import numpy as np

from . import blend as blend_mod

Ease = Callable[[float], float]


def _identity(t: float) -> float:
    return t


def _eased(progress: float, ease: Ease | None) -> float:
    return float(np.clip(ease(progress) if ease is not None else progress, 0.0, 1.0))


def mask_wipe_h(shape: tuple[int, int], progress: float, ease: Ease | None = None) -> np.ndarray:
    """Left-to-right reveal: 1.0 where a column has been reached, else 0.0."""
    height, width = shape[:2]
    p = _eased(progress, ease)
    edge = p * width
    xs = np.arange(width, dtype=np.float32)
    row = np.clip(edge - xs, 0.0, 1.0)
    row = (row > 0).astype(np.float32)
    return np.tile(row, (height, 1))


def mask_wipe_v(shape: tuple[int, int], progress: float, ease: Ease | None = None) -> np.ndarray:
    """Top-to-bottom reveal."""
    height, width = shape[:2]
    p = _eased(progress, ease)
    edge = p * height
    ys = np.arange(height, dtype=np.float32)
    col = (edge - ys > 0).astype(np.float32)
    return np.tile(col[:, None], (1, width))


def mask_iris(shape: tuple[int, int], progress: float, ease: Ease | None = None) -> np.ndarray:
    """Circle growing from nothing at frame centre to covering every corner."""
    height, width = shape[:2]
    p = _eased(progress, ease)
    cy, cx = height / 2.0, width / 2.0
    max_radius = float(np.hypot(cy, cx))  # reaches the far corners at progress=1
    radius = p * max_radius
    if radius <= 1e-9:
        # dist==0 exactly at the centre pixel would otherwise satisfy `dist <=
        # radius` even at progress=0, revealing a single stray pixel.
        return np.zeros((height, width), dtype=np.float32)
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    dist = np.hypot(yy - cy, xx - cx)
    return (dist <= radius).astype(np.float32)


def mask_dissolve(shape: tuple[int, int], progress: float, seed: int) -> np.ndarray:
    """Per-pixel random-threshold sweep: deterministic given `seed`."""
    height, width = shape[:2]
    p = float(np.clip(progress, 0.0, 1.0))
    rng = np.random.default_rng(seed)
    thresholds = rng.random((height, width)).astype(np.float32)
    return (thresholds < p).astype(np.float32)


def _composite(a: np.ndarray, b: np.ndarray, mask: np.ndarray) -> np.ndarray:
    was_uint8 = np.asarray(a).dtype == np.uint8
    a_f = blend_mod.to_float01(a)
    b_f = blend_mod.to_float01(b)
    m = mask[:, :, None] if mask.ndim == 2 and a_f.ndim == 3 else mask
    out = a_f * (1.0 - m) + b_f * m
    return blend_mod.to_uint8(out) if was_uint8 else out.astype(np.float32)


def tr_crossfade(a: np.ndarray, b: np.ndarray, blend: float) -> np.ndarray:
    """Plain linear crossfade. `blend=0` -> exactly `a`, `blend=1` -> exactly `b`."""
    t = float(np.clip(blend, 0.0, 1.0))
    was_uint8 = np.asarray(a).dtype == np.uint8
    a_f = blend_mod.to_float01(a)
    b_f = blend_mod.to_float01(b)
    out = a_f * (1.0 - t) + b_f * t
    return blend_mod.to_uint8(out) if was_uint8 else out.astype(np.float32)


def tr_wipe(a: np.ndarray, b: np.ndarray, blend: float, direction: str = "h") -> np.ndarray:
    """Hard-edge wipe. `direction` is one of "h", "v", "radial"."""
    shape = a.shape[:2]
    t = float(np.clip(blend, 0.0, 1.0))
    if direction == "h":
        mask = mask_wipe_h(shape, t)
    elif direction == "v":
        mask = mask_wipe_v(shape, t)
    elif direction == "radial":
        mask = mask_iris(shape, t)
    else:
        raise ValueError(f"Unknown wipe direction {direction!r}; choose 'h', 'v', or 'radial'")
    return _composite(a, b, mask)


def tr_glitch_cut(a: np.ndarray, b: np.ndarray, blend: float, seed: int = 0) -> np.ndarray:
    """Hard cut at the midpoint of the 0.3..0.7 band, with ~20 glitchy row shifts
    smeared across that band so the cut doesn't read as a bare instant swap.

    Deterministic for a given `seed`: same inputs, same glitch pattern every time.
    """
    t = float(np.clip(blend, 0.0, 1.0))
    was_uint8 = np.asarray(a).dtype == np.uint8
    a_f = blend_mod.to_float01(a)
    b_f = blend_mod.to_float01(b)

    if t < 0.3:
        out = a_f
    elif t > 0.7:
        out = b_f
    else:
        base, other = (b_f, a_f) if t >= 0.5 else (a_f, b_f)
        out = base.copy()
        height, width = a_f.shape[:2]
        rng = np.random.default_rng(seed)
        n_rows = min(20, height)
        rows = rng.choice(height, size=n_rows, replace=False)
        max_shift = max(1, width // 8)
        for row in rows:
            shift = int(rng.integers(-max_shift, max_shift + 1))
            out[row] = np.roll(out[row], shift, axis=0)
            if rng.random() < 0.5:
                out[row] = other[row]

    return blend_mod.to_uint8(out) if was_uint8 else out.astype(np.float32)
