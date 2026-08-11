"""Opening logo seal, rendered into the luminance buffer so it becomes characters."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from .canvas import ZONES, Grid

SEAL_COVERAGE = 0.62   # fraction of the stage's shorter side


def load_logo_mask(path: Path | None) -> np.ndarray | None:
    if path is None:
        return None
    image = Image.open(path).convert("RGBA")
    rgba = np.asarray(image, dtype=np.float32) / 255.0
    alpha = rgba[:, :, 3]
    luma = rgba[:, :, :3].max(axis=2)
    mask = np.where(alpha > 0.05, luma * alpha, 0.0).astype(np.float32)
    rows, cols = np.where(mask > 0.08)
    if len(rows) == 0:
        return mask
    return mask[rows.min():rows.max() + 1, cols.min():cols.max() + 1]


def seal_luminance(mask: np.ndarray | None, grid: Grid, t: float, duration: float) -> np.ndarray:
    height, width = grid.buffer_shape()
    buf = np.zeros((height, width), dtype=np.float32)
    if mask is None or duration <= 0 or t >= duration:
        return buf

    fade = 1.0 - max(0.0, (t - duration * 0.55) / max(1e-6, duration * 0.45))
    fade = float(np.clip(fade, 0.0, 1.0))
    if fade <= 0.0:
        return buf

    ss = grid.supersample
    sx0, sy0, sx1, sy1 = grid.zone_px(ZONES["stage"])
    sx0, sy0, sx1, sy1 = sx0 * ss, sy0 * ss, sx1 * ss, sy1 * ss
    target = int(min(sx1 - sx0, sy1 - sy0) * SEAL_COVERAGE)
    scale = target / max(mask.shape)
    resized = cv2.resize(
        mask, (max(1, int(mask.shape[1] * scale)), max(1, int(mask.shape[0] * scale))),
        interpolation=cv2.INTER_AREA,
    )
    oy = sy0 + ((sy1 - sy0) - resized.shape[0]) // 2
    ox = sx0 + ((sx1 - sx0) - resized.shape[1]) // 2
    buf[oy:oy + resized.shape[0], ox:ox + resized.shape[1]] = resized * fade
    return np.clip(buf, 0.0, 1.0)
