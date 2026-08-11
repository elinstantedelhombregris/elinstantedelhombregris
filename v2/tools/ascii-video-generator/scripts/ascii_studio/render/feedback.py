"""Feedback buffer -- the cheap CPU answer to "no camera, no depth".

Keeps the previous output frame, decays it, applies a cheap spatial transform, and
blends it back under the current frame. No 3D, no camera, no per-pixel depth buffer --
just a remembered image warped a little every frame -- and it is enough to read as an
expanding tunnel, a rotating hallway, or a rising drift of ghost trails.

`reset()` matters: call it at every chapter cut, or the previous chapter's trail
bleeds into the next one's first frames.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from . import blend as blend_mod

_TRANSFORMS = ("none", "zoom", "rotate_cw", "shift_up")


def _transform_zoom(arr: np.ndarray, amt: float) -> np.ndarray:
    """Crop the centre by `amt` on each side, then nearest-resize back to full size.

    Cropping-then-upscaling the *previous* buffer every frame, over and over, is what
    reads as a continuous expanding tunnel / pseudo-dolly -- each frame's content sits
    a little "further away" (smaller) than the last once it is stretched back up.
    Nearest-neighbour upsampling is deliberate: it keeps the blocky, ascii-native look
    instead of smearing the glyph edges.
    """
    h, w = arr.shape[:2]
    y0 = int(round(h * amt))
    x0 = int(round(w * amt))
    y1, x1 = h - y0, w - x0
    if y1 - y0 < 2 or x1 - x0 < 2:
        return arr
    cropped = arr[y0:y1, x0:x1]
    return cv2.resize(cropped, (w, h), interpolation=cv2.INTER_NEAREST)


def _transform_rotate_cw(arr: np.ndarray, amt: float) -> np.ndarray:
    """Small-angle affine remap, `amt` degrees clockwise, black-filled corners."""
    h, w = arr.shape[:2]
    center = (w / 2.0, h / 2.0)
    # cv2's rotation angle is counter-clockwise for positive values; negate for cw.
    matrix = cv2.getRotationMatrix2D(center, -amt, 1.0)
    return cv2.warpAffine(
        arr, matrix, (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )


def _transform_shift_up(arr: np.ndarray, amt: float) -> np.ndarray:
    """np.roll the buffer up by `amt` (fraction of height), black-filling the gap."""
    h = arr.shape[0]
    shift_px = max(1, int(round(h * amt)))
    shift_px = min(shift_px, h)
    rolled = np.roll(arr, -shift_px, axis=0)
    rolled[h - shift_px:] = 0.0
    return rolled


_TRANSFORM_FNS = {
    "zoom": _transform_zoom,
    "rotate_cw": _transform_rotate_cw,
    "shift_up": _transform_shift_up,
}


@dataclass
class FeedbackBuffer:
    decay: float
    blend_mode: str = "screen"
    opacity: float = 1.0
    transform: str = "none"
    transform_amt: float = 0.0

    def __post_init__(self) -> None:
        if self.transform not in _TRANSFORMS:
            raise ValueError(
                f"Unknown transform {self.transform!r}; choose one of {_TRANSFORMS}"
            )
        self._prev: np.ndarray | None = None

    def reset(self) -> None:
        """Drop the remembered buffer. Call at chapter cuts so trails do not smear
        across a scene change."""
        self._prev = None

    def apply(self, frame: np.ndarray) -> np.ndarray:
        """Blend `frame` over the decayed, transformed previous buffer.

        Returns an array of the same dtype as `frame`. The returned (full-opacity,
        pre-conversion) buffer becomes the new "previous" state for the next call.
        """
        was_uint8 = np.asarray(frame).dtype == np.uint8
        current = blend_mod.to_float01(frame)

        if self._prev is None:
            trail = np.zeros_like(current)
        else:
            decayed = self._prev * self.decay
            transform_fn = _TRANSFORM_FNS.get(self.transform)
            trail = transform_fn(decayed, self.transform_amt) if transform_fn else decayed

        blend_fn = blend_mod.BLEND_MODES[self.blend_mode]
        blended = np.clip(blend_fn(current, trail), 0.0, 1.0)
        out = np.clip(current * (1.0 - self.opacity) + blended * self.opacity, 0.0, 1.0)

        self._prev = out
        return blend_mod.to_uint8(out) if was_uint8 else out.astype(np.float32)


def infinite_zoom_tunnel() -> FeedbackBuffer:
    """Expanding tunnel / pseudo-dolly preset."""
    return FeedbackBuffer(decay=0.8, blend_mode="screen", transform="zoom", transform_amt=0.015)


def ghostly_echo() -> FeedbackBuffer:
    """Faint rising trail of ghost frames."""
    return FeedbackBuffer(
        decay=0.9, blend_mode="add", opacity=0.15, transform="shift_up", transform_amt=0.02
    )
