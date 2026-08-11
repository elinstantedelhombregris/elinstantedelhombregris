"""Perceptual colour. All interpolation happens in OKLab, never RGB.

RGB interpolation desaturates through the midpoint, which is why v1 blends passed
through muddy grey. OKLab (Bjorn Ottosson, 2020) keeps perceived lightness linear.
"""

from __future__ import annotations

import numpy as np

# linear sRGB -> LMS
_RGB_TO_LMS = np.array([
    [0.4122214708, 0.5363325363, 0.0514459929],
    [0.2119034982, 0.6806995451, 0.1073969566],
    [0.0883024619, 0.2817188376, 0.6299787005],
], dtype=np.float64)

# LMS' (cube-rooted) -> OKLab
_LMS_TO_LAB = np.array([
    [0.2104542553, 0.7936177850, -0.0040720468],
    [1.9779984951, -2.4285922050, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.8086757660],
], dtype=np.float64)

_LAB_TO_LMS = np.linalg.inv(_LMS_TO_LAB)
_LMS_TO_RGB = np.linalg.inv(_RGB_TO_LMS)


def hex_to_rgb01(value: str) -> np.ndarray:
    """'#7D5BDE' or '7D5BDE' -> float32 (3,) in 0..1."""
    value = value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Expected a 6-digit hex colour, got {value!r}")
    return np.array(
        [int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32
    )


def rgb01_to_hex(rgb: np.ndarray) -> str:
    channels = np.clip(np.asarray(rgb, dtype=np.float64), 0.0, 1.0) * 255.0
    return "#" + "".join(f"{int(round(c)):02x}" for c in channels)


def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * (c ** (1 / 2.4)) - 0.055)


def srgb_to_oklab(rgb: np.ndarray) -> np.ndarray:
    """sRGB (...,3) in 0..1 -> OKLab (...,3)."""
    linear = _srgb_to_linear(np.asarray(rgb, dtype=np.float64))
    lms = linear @ _RGB_TO_LMS.T
    # Preserve sign so the cube root stays real for slightly-negative values.
    lms_cbrt = np.sign(lms) * np.abs(lms) ** (1.0 / 3.0)
    return (lms_cbrt @ _LMS_TO_LAB.T).astype(np.float32)


def oklab_to_srgb(lab: np.ndarray) -> np.ndarray:
    """OKLab (...,3) -> sRGB (...,3) in 0..1, clipped."""
    lms_cbrt = np.asarray(lab, dtype=np.float64) @ _LAB_TO_LMS.T
    lms = lms_cbrt ** 3
    linear = lms @ _LMS_TO_RGB.T
    return np.clip(_linear_to_srgb(linear), 0.0, 1.0).astype(np.float32)


def mix_oklab(c0: np.ndarray, c1: np.ndarray, t) -> np.ndarray:
    """Blend two sRGB colours through OKLab. `t` may be scalar or broadcastable."""
    lab0 = srgb_to_oklab(c0).astype(np.float64)
    lab1 = srgb_to_oklab(c1).astype(np.float64)
    weight = np.clip(np.asarray(t, dtype=np.float64), 0.0, 1.0)[..., None] if np.ndim(t) else float(np.clip(t, 0.0, 1.0))
    return oklab_to_srgb(lab0 + (lab1 - lab0) * weight)


def ramp_lookup(ramp_srgb: np.ndarray, v: np.ndarray) -> np.ndarray:
    """Sample an sRGB ramp (n,3) at positions `v` in 0..1, interpolating in OKLab.

    Returns sRGB with shape v.shape + (3,).
    """
    ramp_lab = srgb_to_oklab(np.asarray(ramp_srgb, dtype=np.float32)).astype(np.float64)
    n = ramp_lab.shape[0]
    if n < 2:
        raise ValueError("A ramp needs at least two stops")
    pos = np.clip(np.asarray(v, dtype=np.float64), 0.0, 1.0) * (n - 1)
    low = np.floor(pos).astype(np.int64)
    low = np.clip(low, 0, n - 2)
    frac = (pos - low)[..., None]
    lab = ramp_lab[low] * (1.0 - frac) + ramp_lab[low + 1] * frac
    return oklab_to_srgb(lab)


def temperature_shift(rgb: np.ndarray, temperature: float) -> np.ndarray:
    """Warm/cool an sRGB array in OKLab while preserving perceptual lightness."""
    value = float(np.clip(temperature, -1.0, 1.0))
    if abs(value) < 1e-6:
        return np.asarray(rgb, dtype=np.float32)
    lab = srgb_to_oklab(np.asarray(rgb, dtype=np.float32)).astype(np.float64)
    lab[..., 1] += 0.012 * value
    lab[..., 2] += 0.032 * value
    return oklab_to_srgb(lab)
