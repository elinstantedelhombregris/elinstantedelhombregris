"""Preserve macro silhouette, meso contours and micro texture for ASCII matching."""

from __future__ import annotations

import cv2
import numpy as np

from .canvas import Grid


def enhance(luminance: np.ndarray, grid: Grid, strength: float,
            depth: np.ndarray | None = None, depth_contrast: float = 0.0) -> np.ndarray:
    if strength <= 1e-4 and depth_contrast <= 1e-4:
        return luminance
    work_w = max(grid.cols * 4, 64)
    work_h = max(grid.rows * 4, 64)
    work = cv2.resize(luminance, (work_w, work_h), interpolation=cv2.INTER_AREA).astype(np.float32)
    macro = cv2.GaussianBlur(work, (0, 0), 5.0)
    meso = cv2.GaussianBlur(work, (0, 0), 1.25)
    gx = cv2.Sobel(meso, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(meso, cv2.CV_32F, 0, 1, ksize=3)
    edge = np.sqrt(gx * gx + gy * gy)
    high = float(np.percentile(edge[::2, ::2], 98.0)) if edge.size else 0.0
    if high > 1e-6:
        edge = np.clip(edge / high, 0.0, 1.0)
    detail = np.clip(meso + (meso - macro) * 0.55 + edge * 0.34, 0.0, 1.0)
    mixed = np.clip(work * (1.0 - strength * 0.42) + detail * strength * 0.42, 0.0, 1.0)
    if depth is not None and depth_contrast > 1e-4:
        depth_work = cv2.resize(depth, (work_w, work_h), interpolation=cv2.INTER_LINEAR)
        separation = 1.0 + (depth_work - 0.5) * depth_contrast * 0.48
        mixed = np.clip(mixed * separation, 0.0, 1.0)
    reconstructed = cv2.resize(
        mixed, (luminance.shape[1], luminance.shape[0]), interpolation=cv2.INTER_LINEAR,
    ).astype(np.float32)
    # Keep the source's exact high-resolution silhouette while the reduced
    # pyramid contributes meso/micro information. Replacing the source outright
    # would soften a one-pixel architectural edge before glyph matching.
    blend = min(0.55, strength * 0.55)
    return np.clip(luminance * (1.0 - blend) + reconstructed * blend, 0.0, 1.0).astype(np.float32)
