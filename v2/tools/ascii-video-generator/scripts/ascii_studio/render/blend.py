"""Pixel blend modes -- the reference implementation's stated core technique.

Every mode is a pure `lambda a, b -> result` on float32 0..1 arrays (`a` is the base/
bottom layer, `b` is the top layer being blended in). `blend()` is the public entry
point: it accepts either uint8 or float32 arrays, does the blend in float32, and
converts back to whatever dtype `base` came in as.

`blend_linear_light()` is the gamma-correct variant: it converts sRGB -> linear before
blending and back after, which avoids the darkened midtones and hue shifts that
blending directly in sRGB produces (screen and add are the worst offenders -- sRGB
screen looks visibly duller than linear-light screen on the same inputs). It reuses
`color._srgb_to_linear` / `color._linear_to_srgb` rather than reimplementing the
sRGB transfer curve a second time.
"""

from __future__ import annotations

from typing import Callable

import numpy as np

from . import color

BlendFn = Callable[[np.ndarray, np.ndarray], np.ndarray]


def _screen(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return 1.0 - (1.0 - a) * (1.0 - b)


def _add(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return a + b


def _multiply(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return a * b


def _difference(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return np.abs(a - b)


def _exclusion(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return a + b - 2.0 * a * b


def _overlay(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    # Overlay is multiply-or-screen chosen by the *base* layer's tone.
    return np.where(a <= 0.5, 2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b))


def _soft_light(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    # W3C compositing-and-blending soft-light formula.
    a_safe = np.clip(a, 0.0, 1.0)

    def d(x: np.ndarray) -> np.ndarray:
        return np.where(x <= 0.25, ((16.0 * x - 12.0) * x + 4.0) * x, np.sqrt(x))

    return np.where(
        b <= 0.5,
        a - (1.0 - 2.0 * b) * a_safe * (1.0 - a_safe),
        a + (2.0 * b - 1.0) * (d(a_safe) - a_safe),
    )


def _lighten(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return np.maximum(a, b)


def _darken(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return np.minimum(a, b)


BLEND_MODES: dict[str, BlendFn] = {
    "screen": _screen,
    "add": _add,
    "multiply": _multiply,
    "difference": _difference,
    "exclusion": _exclusion,
    "overlay": _overlay,
    "soft_light": _soft_light,
    "lighten": _lighten,
    "darken": _darken,
}


def to_float01(arr: np.ndarray) -> np.ndarray:
    """uint8 0..255 or float 0..1 -> float32 0..1."""
    arr = np.asarray(arr)
    if arr.dtype == np.uint8:
        return arr.astype(np.float32) / 255.0
    return np.clip(arr, 0.0, 1.0).astype(np.float32)


def to_uint8(arr: np.ndarray) -> np.ndarray:
    """float 0..1 -> uint8 0..255, clipped and rounded."""
    return np.clip(arr * 255.0 + 0.5, 0.0, 255.0).astype(np.uint8)


def blend(base: np.ndarray, top: np.ndarray, mode: str, opacity: float = 1.0) -> np.ndarray:
    """Blend `top` onto `base` with the named mode, mixed back by `opacity`.

    Accepts uint8 or float32 arrays (mixed dtypes allowed between base/top); the
    return dtype always matches `base`'s input dtype so callers can chain this
    straight back into a uint8 pipeline without an explicit cast.
    """
    if mode not in BLEND_MODES:
        raise ValueError(f"Unknown blend mode {mode!r}; choose one of {sorted(BLEND_MODES)}")
    was_uint8 = np.asarray(base).dtype == np.uint8
    a = to_float01(base)
    b = to_float01(top)
    blended = np.clip(BLEND_MODES[mode](a, b), 0.0, 1.0)
    out = np.clip(a * (1.0 - opacity) + blended * opacity, 0.0, 1.0)
    return to_uint8(out) if was_uint8 else out.astype(np.float32)


def blend_linear_light(
    base: np.ndarray, top: np.ndarray, mode: str, opacity: float = 1.0
) -> np.ndarray:
    """Same as `blend`, but the blend maths happen in linear light, not sRGB.

    sRGB is a nonlinear (roughly gamma-2.2) encoding, so blending directly in sRGB
    space applies the blend function to compressed values -- screen and add both come
    out visibly darker in the midtones than they should, and multi-channel modes can
    shift hue. Round-tripping through linear light before/after fixes that at the
    cost of two transfer-curve passes.
    """
    if mode not in BLEND_MODES:
        raise ValueError(f"Unknown blend mode {mode!r}; choose one of {sorted(BLEND_MODES)}")
    was_uint8 = np.asarray(base).dtype == np.uint8
    a_srgb = to_float01(base)
    b_srgb = to_float01(top)
    a_lin = color._srgb_to_linear(a_srgb)
    b_lin = color._srgb_to_linear(b_srgb)
    blended_lin = np.clip(BLEND_MODES[mode](a_lin, b_lin), 0.0, 1.0)
    out_lin = np.clip(a_lin * (1.0 - opacity) + blended_lin * opacity, 0.0, 1.0)
    out_srgb = color._linear_to_srgb(out_lin)
    return to_uint8(out_srgb) if was_uint8 else out_srgb.astype(np.float32)
