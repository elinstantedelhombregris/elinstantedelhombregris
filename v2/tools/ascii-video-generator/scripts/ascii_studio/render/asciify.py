"""Luminance buffer -> glyph grid."""

from __future__ import annotations

import cv2
import numpy as np

from . import glyphs
from .canvas import Grid
from .tokens import Look

# Standard 8x8 ordered (Bayer) matrix, recentred to -0.5..0.5.
_BAYER_RAW = np.array([
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
], dtype=np.float32)
BAYER8 = (_BAYER_RAW + 0.5) / 64.0 - 0.5


def cell_signatures(
    lum: np.ndarray,
    grid: Grid,
    dither: str,
    dither_amplitude: float,
) -> np.ndarray:
    """Downsample the luminance buffer to one SIG_H x SIG_W block per cell."""
    expected = grid.buffer_shape()
    if lum.shape != expected:
        raise ValueError(f"luminance buffer is {lum.shape}, expected {expected}")

    target_w = grid.cols * glyphs.SIG_W
    target_h = grid.rows * glyphs.SIG_H
    small = cv2.resize(
        np.ascontiguousarray(lum, dtype=np.float32),
        (target_w, target_h),
        interpolation=cv2.INTER_AREA,
    )

    if dither == "bayer8":
        tile = np.tile(
            BAYER8,
            (-(-target_h // 8), -(-target_w // 8)),
        )[:target_h, :target_w]
        # Taper to zero at both ends of the range. Without this, dither would lift
        # near-black luminance enough for a sparse glyph to outscore space, so empty
        # screen would render as speckle instead of staying blank -- dither belongs in
        # the midtones, not the extremes. (This is not asserted by
        # tests/test_asciify.py::test_black_buffer_is_all_space or
        # test_white_buffer_is_the_densest_glyph -- both pass with the taper removed --
        # so treat this as documentation of intent, not a test-covered invariant.)
        taper = 4.0 * small * (1.0 - small)
        small = small + tile * dither_amplitude * taper
    elif dither not in ("none", None):
        raise ValueError(f"Unknown dither {dither!r}")

    small = np.clip(small, 0.0, 1.0)
    # (rows, SIG_H, cols, SIG_W) -> (rows*cols, SIG_H*SIG_W)
    blocks = small.reshape(grid.rows, glyphs.SIG_H, grid.cols, glyphs.SIG_W)
    return np.ascontiguousarray(
        blocks.transpose(0, 2, 1, 3).reshape(grid.rows * grid.cols, glyphs.SIG_H * glyphs.SIG_W)
    )


def asciify(
    lum: np.ndarray,
    grid: Grid,
    atlas: glyphs.Atlas,
    look: Look,
    prev: np.ndarray | None = None,
    orientation_weight: float | None = None,
) -> np.ndarray:
    """Return the (rows, cols) int32 glyph-index grid for this luminance buffer."""
    sigs = cell_signatures(lum, grid, look.dither, look.dither_amplitude)
    flat_prev = None if prev is None else np.asarray(prev).reshape(-1)
    orient_cos2 = orient_sin2 = orient_coherence = None
    weight = look.orientation_weight if orientation_weight is None else orientation_weight
    if weight > 0:
        orient_cos2, orient_sin2, orient_coherence = orientation_features(lum, grid)
    chosen = glyphs.match_glyphs(
        sigs, atlas, flat_prev, look.hysteresis,
        orient_cos2, orient_sin2, orient_coherence, weight,
    )
    return chosen.reshape(grid.rows, grid.cols)


def orientation_features(lum: np.ndarray, grid: Grid) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Local line direction at glyph-cell scale, represented with doubled angles."""
    work = cv2.resize(lum, (grid.cols * 2, grid.rows * 2), interpolation=cv2.INTER_AREA)
    gx = cv2.Sobel(work, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(work, cv2.CV_32F, 0, 1, ksize=3)
    jxx = cv2.resize(gx * gx, (grid.cols, grid.rows), interpolation=cv2.INTER_AREA)
    jyy = cv2.resize(gy * gy, (grid.cols, grid.rows), interpolation=cv2.INTER_AREA)
    jxy = cv2.resize(gx * gy, (grid.cols, grid.rows), interpolation=cv2.INTER_AREA)
    theta = 0.5 * np.arctan2(2.0 * jxy, jxx - jyy) + np.pi / 2.0
    total = jxx + jyy
    delta = np.sqrt((jxx - jyy) ** 2 + 4.0 * jxy * jxy)
    coherence = np.divide(delta, total, out=np.zeros_like(delta), where=total > 1e-6)
    return (
        np.cos(2.0 * theta).astype(np.float32).reshape(-1),
        np.sin(2.0 * theta).astype(np.float32).reshape(-1),
        np.clip(coherence, 0.0, 1.0).astype(np.float32).reshape(-1),
    )
