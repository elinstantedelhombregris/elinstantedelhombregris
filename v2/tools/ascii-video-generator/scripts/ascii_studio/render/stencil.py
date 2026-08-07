"""Text as the geometry of the image, not a layer on top of it.

`render/typography.py` draws captions/title/footer as crisp vector text over the
already-graded frame -- UI, drawn last, that must stay legible after platform
recompression. This module does the inverse, at the scene-composition stage (the
single-channel luminance buffer `scene/composer.py` builds, before glyph selection
or grading even run): render a chapter's keyword huge and centred as a mask, then
let the composed field show only *through* the letterforms.

Two ways to fill a stencilled letterform:

  - `mode="inside"` / `"knockout"`: the field's own value shows through (or is
    knocked out of) the mask -- the letters are windows onto the animated field.
  - `mode="text_fill"`: instead of a smooth field value, the letterforms are
    filled with the essay's own sentences set in a small font and tiled across
    the shape. The picture is then literally made of the argument, not just
    shaped like a word from it.

Callers are responsible for keeping this inside the `stage` zone (see
`render/canvas.py::ZONES`) -- see `scene/composer.py`'s stencil integration for
how the reveal is driven and confined there.
"""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw, ImageFont

_FIT_MARGIN = 0.90
"""Rendered text may occupy at most this fraction of `shape` on each axis --
leaves visible margin instead of letterforms touching the buffer edge."""
_MIN_FONT_PX = 8
_STROKE_FRACTION = 0.07
"""`weight` (0..1) scales to a stroke width of up to this fraction of the font
size -- the same faux-bold trick `typography.draw_title` uses (redraw with a
stroke of the same fill), since this module draws with whatever font path the
caller gives it, not a dedicated bold cut."""


def _stroke_px(size: int, weight: float) -> int:
    return max(0, int(round(size * max(0.0, weight) * _STROKE_FRACTION)))


def _fits(draw: "ImageDraw.ImageDraw", text: str, font_path: str, size: int,
          weight: float, target_w: float, target_h: float) -> tuple[bool, ImageFont.FreeTypeFont, int]:
    font = ImageFont.truetype(font_path, size)
    stroke = _stroke_px(size, weight)
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    return (w <= target_w and h <= target_h), font, stroke


def _fit_font(draw: "ImageDraw.ImageDraw", text: str, shape: tuple[int, int],
              font_path: str, weight: float) -> tuple[ImageFont.FreeTypeFont, int]:
    """Largest font size (down to `_MIN_FONT_PX`) that fits `text` inside
    `shape`'s `_FIT_MARGIN`, found by binary search on size.

    A linear scan from `shape`'s height down to the floor (the pattern
    `typography._fit_text_size` uses for captions, where the search range is a
    few dozen sizes) would mean hundreds of `ImageFont.truetype` loads at the
    stage-zone resolutions this module targets -- binary search does it in
    O(log size) calls instead, which matters here because this runs inside
    `compose_scene`'s per-frame budget.
    """
    height, width = shape
    target_w, target_h = width * _FIT_MARGIN, height * _FIT_MARGIN
    lo, hi = _MIN_FONT_PX, max(_MIN_FONT_PX, height)
    best: tuple[ImageFont.FreeTypeFont, int] | None = None
    fits_at_floor, floor_font, floor_stroke = _fits(draw, text, font_path, lo, weight, target_w, target_h)
    if not fits_at_floor:
        return floor_font, floor_stroke
    best = (floor_font, floor_stroke)
    while lo <= hi:
        mid = (lo + hi) // 2
        ok, font, stroke = _fits(draw, text, font_path, mid, weight, target_w, target_h)
        if ok:
            best = (font, stroke)
            lo = mid + 1
        else:
            hi = mid - 1
    return best


def text_mask(text: str, shape: tuple[int, int], font_path: str, weight: float = 0.0) -> np.ndarray:
    """Render `text` (upper-cased) huge and centred in `shape`, as a float32
    0..1 antialiased mask -- 1.0 is solid ink, 0.0 is empty.

    `weight` (0..1) adds a proportional stroke for boldness on top of whatever
    weight `font_path` itself is; 0.0 is the font's own regular cut.
    """
    height, width = shape
    if height <= 0 or width <= 0 or not text.strip():
        return np.zeros(shape, dtype=np.float32)

    upper = text.upper()
    probe = Image.new("L", (1, 1))
    draw = ImageDraw.Draw(probe)
    font, stroke = _fit_font(draw, upper, shape, font_path, weight)

    img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(img)
    bbox = draw.textbbox((0, 0), upper, font=font, stroke_width=stroke)
    x = (width - (bbox[2] - bbox[0])) / 2.0 - bbox[0]
    y = (height - (bbox[3] - bbox[1])) / 2.0 - bbox[1]
    draw.text((x, y), upper, font=font, fill=255, stroke_width=stroke, stroke_fill=255)
    return (np.asarray(img, dtype=np.float32) / 255.0)


_TEXT_FILL_LIFT = 0.35
"""Floor applied under the field's own modulation in `mode="text_fill"`
(`ink * (_TEXT_FILL_LIFT + (1 - _TEXT_FILL_LIFT) * field)`) so the microtext
stays legible even where the field is momentarily near-black, instead of
vanishing into it."""


def _mask_bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    """(y0, x0, y1, x1) of the mask's own ink, so the microtext reveal (below)
    types in where the letters actually are instead of wasting reveal budget
    on the (often large) blank margin `text_mask` leaves around them."""
    height, width = mask.shape
    ys, xs = np.nonzero(mask > 0.05)
    if ys.size == 0:
        return 0, 0, height, width
    return int(ys.min()), int(xs.min()), int(ys.max()) + 1, int(xs.max()) + 1


def _microtext_ink(text: str, shape: tuple[int, int], font_path: str, char_px: int,
                    reveal: float, bbox: tuple[int, int, int, int] | None = None) -> np.ndarray:
    """The essay's own words, set small and tiled row by row across `bbox`
    (defaulting to all of `shape`), as a float32 0..1 ink mask. `reveal` (0..1)
    is how many of those rows (top-down) have been typed in yet -- callers
    drive this over a chapter's progress so the fill assembles instead of
    appearing all at once."""
    height, width = shape
    y0, x0, y1, x1 = bbox if bbox is not None else (0, 0, height, width)
    words = text.split() or ["..."]
    size = max(6, int(char_px))
    img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, size)
    line_h = max(1, int(size * 1.35))
    total_lines = max(1, -(-(y1 - y0) // line_h))  # ceil
    lines_to_draw = max(1, int(round(total_lines * float(np.clip(reveal, 0.0, 1.0)))))
    space_w = draw.textlength(" ", font=font)

    word_index = 0
    n_words = len(words)
    y = y0
    for _ in range(lines_to_draw):
        if y >= y1:
            break
        x = float(x0)
        while True:
            word = words[word_index % n_words]
            word_index += 1
            w = draw.textlength(word, font=font)
            if x > x0 and x + w > x1:
                break
            draw.text((x, y), word, font=font, fill=255)
            x += w + space_w
        y += line_h
    return np.asarray(img, dtype=np.float32) / 255.0


_STENCIL_MODES = ("inside", "knockout", "text_fill")


def stencil_field(
    field: np.ndarray,
    mask: np.ndarray,
    mode: str = "inside",
    *,
    text: str | None = None,
    font_path: str | None = None,
    char_px: int = 14,
    reveal: float = 1.0,
) -> np.ndarray:
    """Combine an animated `field` (0..1) with a `text_mask` letterform `mask`
    (0..1, same shape).

      - "inside": the field is visible only within the letters -- near-black
        (exactly 0) outside them, matching `scene/composer.py::_to_peak`'s
        convention of peak-scaling layers from a true floor of 0 so they leave
        a real gap for whatever is screen-blended underneath.
      - "knockout": the inverse -- the field is visible everywhere EXCEPT the
        letters, which sit at 0 (a legible negative-space cutout).
      - "text_fill": the letters are filled with `text` itself (see
        `_microtext_ink`), lifted/modulated by the field's own value rather
        than replaced by it, and still confined to `mask`.
    """
    if mode not in _STENCIL_MODES:
        raise ValueError(f"Unknown stencil mode {mode!r}; choose one of {_STENCIL_MODES}")
    if field.shape != mask.shape:
        raise ValueError(f"field/mask shape mismatch: {field.shape} vs {mask.shape}")

    if mode == "inside":
        return (field * mask).astype(np.float32)
    if mode == "knockout":
        return (field * (1.0 - mask)).astype(np.float32)

    # mode == "text_fill"
    if not text or not font_path:
        raise ValueError("stencil_field(mode='text_fill') requires both `text` and `font_path`")
    bbox = _mask_bbox(mask)
    ink = _microtext_ink(text, field.shape, font_path, char_px, reveal, bbox=bbox)
    filled = ink * (_TEXT_FILL_LIFT + (1.0 - _TEXT_FILL_LIFT) * field)
    return (filled * mask).astype(np.float32)
