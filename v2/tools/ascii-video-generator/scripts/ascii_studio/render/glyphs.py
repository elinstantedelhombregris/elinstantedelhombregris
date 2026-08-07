"""Glyph atlas, signatures and the vectorised blit.

v1 issued one PIL.ImageDraw.text call per cell inside a Python double loop -- about
3,900 calls per frame and 29 million for a 4-minute video, which is what capped the
field at 64 columns. Here every glyph is rasterised once into an atlas, and a whole
frame is assembled with array indexing and one transpose.
"""

from __future__ import annotations

from dataclasses import dataclass
import math

import cv2
import numpy as np
from fontTools.ttLib import TTCollection, TTFont
from PIL import Image, ImageDraw, ImageFont

# Signature resolution used for best-match search. Coarser than the cell, which is
# ample for discrimination and keeps the search matmul small.
SIG_W = 4
SIG_H = 8

_ASCII7 = " .,:;'\"`^~-_=+*#%@/\\|<>()[]{}"
_BOX = "─│┌┐└┘├┤┬┴┼╱╲╳"
_BLOCKS = "█▓▒░▀▄▌▐▖▗▘▝"
_GEOMETRIC = "●○◆◇▲▼■□"

_CINEMATIC = _ASCII7 + _BOX + _BLOCKS + _GEOMETRIC

# The uniform shade blocks are the exact best match for any smooth region, so they
# carpet the field as flat colour rather than character texture. "field" drops them
# but keeps the half-blocks and quadrants, which encode real structure (edges), not
# flat tone, and do not carpet. Filtered from `_CINEMATIC` so the two sets cannot
# drift apart.
_UNIFORM_SHADE_BLOCKS = "░▒▓█"

GLYPH_SETS: dict[str, str] = {
    "cinematic": _CINEMATIC,
    "ascii7": _ASCII7,
    "blocks": " " + _BLOCKS,
    "field": "".join(c for c in _CINEMATIC if c not in _UNIFORM_SHADE_BLOCKS),
}

# Block and box-drawing characters are drawn geometrically at exact cell dimensions
# rather than rasterised from the font outline. Terminal emulators (kitty, WezTerm)
# do the same, because font outlines for these glyphs rarely fill the cell -- see
# the module docstring-adjacent commit message / task report for the measurements
# that motivated this. Every other character (ASCII + the geometrics) still comes
# from the font via PIL.

# Uniform fills: whole tile set to a constant coverage value.
_SYNTH_UNIFORM: dict[str, float] = {
    "░": 0.25,
    "▒": 0.50,
    "▓": 0.75,
    "█": 1.0,
}

# Half blocks: 1.0 in the named half, 0.0 elsewhere.
_SYNTH_HALF: dict[str, str] = {
    "▀": "upper",
    "▄": "lower",
    "▌": "left",
    "▐": "right",
}

# Quadrants: 1.0 in the named quadrant, 0.0 elsewhere.
_SYNTH_QUADRANT: dict[str, str] = {
    "▖": "lower-left",
    "▗": "lower-right",
    "▘": "upper-left",
    "▝": "upper-right",
}

# Box-drawing rules: each value is the set of arm directions extending from the
# stroke intersection to the cell edge.
_SYNTH_BOX: dict[str, frozenset[str]] = {
    "─": frozenset({"left", "right"}),
    "│": frozenset({"up", "down"}),
    "┌": frozenset({"right", "down"}),
    "┐": frozenset({"left", "down"}),
    "└": frozenset({"right", "up"}),
    "┘": frozenset({"left", "up"}),
    "├": frozenset({"up", "down", "right"}),
    "┤": frozenset({"up", "down", "left"}),
    "┬": frozenset({"left", "right", "down"}),
    "┴": frozenset({"left", "right", "up"}),
    "┼": frozenset({"up", "down", "left", "right"}),
}

# Diagonals: drawn with cv2.line corner to corner.
_SYNTH_DIAGONAL: dict[str, str] = {
    "╱": "bottom_left_to_top_right",
    "╲": "top_left_to_bottom_right",
    "╳": "both",
}

SYNTHESIZED_CHARS: frozenset[str] = frozenset(
    _SYNTH_UNIFORM.keys()
    | _SYNTH_HALF.keys()
    | _SYNTH_QUADRANT.keys()
    | _SYNTH_BOX.keys()
    | _SYNTH_DIAGONAL.keys()
)


def _synth_uniform(cell_h: int, cell_w: int, value: float) -> np.ndarray:
    return np.full((cell_h, cell_w), value, dtype=np.float32)


def _synth_half(cell_h: int, cell_w: int, region: str) -> np.ndarray:
    tile = np.zeros((cell_h, cell_w), dtype=np.float32)
    half_h, half_w = cell_h // 2, cell_w // 2
    if region == "upper":
        tile[:half_h, :] = 1.0
    elif region == "lower":
        tile[half_h:, :] = 1.0
    elif region == "left":
        tile[:, :half_w] = 1.0
    elif region == "right":
        tile[:, half_w:] = 1.0
    else:
        raise ValueError(f"unknown half-block region {region!r}")
    return tile


def _synth_quadrant(cell_h: int, cell_w: int, region: str) -> np.ndarray:
    tile = np.zeros((cell_h, cell_w), dtype=np.float32)
    half_h, half_w = cell_h // 2, cell_w // 2
    if region == "lower-left":
        tile[half_h:, :half_w] = 1.0
    elif region == "lower-right":
        tile[half_h:, half_w:] = 1.0
    elif region == "upper-left":
        tile[:half_h, :half_w] = 1.0
    elif region == "upper-right":
        tile[:half_h, half_w:] = 1.0
    else:
        raise ValueError(f"unknown quadrant region {region!r}")
    return tile


def _synth_box(cell_h: int, cell_w: int, arms: frozenset[str]) -> np.ndarray:
    tile = np.zeros((cell_h, cell_w), dtype=np.float32)
    thickness = max(1, cell_w // 6)
    cy, cx = cell_h // 2, cell_w // 2
    row_lo = max(0, cy - thickness // 2)
    row_hi = min(cell_h, row_lo + thickness)
    col_lo = max(0, cx - thickness // 2)
    col_hi = min(cell_w, col_lo + thickness)
    if "left" in arms:
        tile[row_lo:row_hi, 0:cx] = 1.0
    if "right" in arms:
        tile[row_lo:row_hi, cx:cell_w] = 1.0
    if "up" in arms:
        tile[0:cy, col_lo:col_hi] = 1.0
    if "down" in arms:
        tile[cy:cell_h, col_lo:col_hi] = 1.0
    # Always fill the intersection itself, even for a single-arm corner, so the
    # stroke reads as one continuous shape rather than two disjoint slabs.
    tile[row_lo:row_hi, col_lo:col_hi] = 1.0
    return tile


def _synth_diagonal(cell_h: int, cell_w: int, kind: str) -> np.ndarray:
    tile = np.zeros((cell_h, cell_w), dtype=np.float32)
    thickness = max(1, cell_w // 6)
    top_left = (0, 0)
    top_right = (cell_w - 1, 0)
    bottom_left = (0, cell_h - 1)
    bottom_right = (cell_w - 1, cell_h - 1)
    if kind in ("bottom_left_to_top_right", "both"):
        cv2.line(tile, bottom_left, top_right, 1.0, thickness=thickness, lineType=cv2.LINE_AA)
    if kind in ("top_left_to_bottom_right", "both"):
        cv2.line(tile, top_left, bottom_right, 1.0, thickness=thickness, lineType=cv2.LINE_AA)
    return np.clip(tile, 0.0, 1.0)


def _synth_tile(char: str, cell_h: int, cell_w: int) -> np.ndarray:
    if char in _SYNTH_UNIFORM:
        return _synth_uniform(cell_h, cell_w, _SYNTH_UNIFORM[char])
    if char in _SYNTH_HALF:
        return _synth_half(cell_h, cell_w, _SYNTH_HALF[char])
    if char in _SYNTH_QUADRANT:
        return _synth_quadrant(cell_h, cell_w, _SYNTH_QUADRANT[char])
    if char in _SYNTH_BOX:
        return _synth_box(cell_h, cell_w, _SYNTH_BOX[char])
    if char in _SYNTH_DIAGONAL:
        return _synth_diagonal(cell_h, cell_w, _SYNTH_DIAGONAL[char])
    raise ValueError(f"no synthesis rule registered for {char!r}")


@dataclass(frozen=True)
class Atlas:
    chars: tuple[str, ...]
    tiles: np.ndarray      # (n, cell_h, cell_w) float32 coverage 0..1
    sig: np.ndarray        # (n, SIG_H*SIG_W) float32
    sig_norm: np.ndarray   # (n,) float32, ||sig||^2
    orient_cos2: np.ndarray  # (n,) doubled-angle stroke orientation
    orient_sin2: np.ndarray  # (n,) doubled-angle stroke orientation
    orient_coherence: np.ndarray  # (n,) 0 isotropic .. 1 directional

    def index(self, char: str) -> int:
        return self.chars.index(char)


def _cmap(font_path: str) -> set[int]:
    font = TTCollection(font_path).fonts[0] if font_path.endswith(".ttc") else TTFont(font_path, fontNumber=0)
    codepoints: set[int] = set()
    for table in font["cmap"].tables:
        codepoints |= set(table.cmap.keys())
    return codepoints


def available_chars(font_path: str, candidates: str) -> str:
    """Filter candidates down to those the font actually provides."""
    codepoints = _cmap(font_path)
    return "".join(char for char in candidates if char == " " or ord(char) in codepoints)


def build_atlas(font_path: str, cell_w: int, cell_h: int, glyph_set: str) -> Atlas:
    if glyph_set not in GLYPH_SETS:
        raise ValueError(f"Unknown glyph set {glyph_set!r}. Available: {sorted(GLYPH_SETS)}")
    candidates = GLYPH_SETS[glyph_set]
    # Synthesized characters (blocks, box-drawing, diagonals) are drawn geometrically
    # and never touch the font outline, so they don't need font cmap support: a font
    # that lacks them still gets a correct synthesized tile. Everything else is still
    # gated by available_chars, same as before.
    font_supported = set(available_chars(font_path, candidates))
    chars = "".join(c for c in candidates if c == " " or c in font_supported or c in SYNTHESIZED_CHARS)
    if " " not in chars:
        chars = " " + chars
    # Space first, so glyph index 0 is always blank.
    chars = " " + "".join(c for c in chars if c != " ")

    font_rendered_chars = "".join(c for c in chars if c != " " and c not in SYNTHESIZED_CHARS)
    font = _fit_font(font_path, cell_w, cell_h, font_rendered_chars)
    tiles = np.zeros((len(chars), cell_h, cell_w), dtype=np.float32)
    for index, char in enumerate(chars):
        if char == " ":
            continue
        if char in SYNTHESIZED_CHARS:
            tiles[index] = _synth_tile(char, cell_h, cell_w)
            continue
        image = Image.new("L", (cell_w, cell_h), 0)
        draw = ImageDraw.Draw(image)
        # Centre each glyph in its cell using its own ink bounds.
        left, top, right, bottom = draw.textbbox((0, 0), char, font=font)
        draw.text(
            ((cell_w - (right - left)) / 2 - left, (cell_h - (bottom - top)) / 2 - top),
            char,
            font=font,
            fill=255,
        )
        tiles[index] = np.asarray(image, dtype=np.float32) / 255.0

    sig = _signatures(tiles)
    orient_cos2, orient_sin2, orient_coherence = _orientation_descriptors(tiles)
    return Atlas(
        chars=tuple(chars),
        tiles=tiles,
        sig=sig,
        sig_norm=(sig ** 2).sum(axis=1).astype(np.float32),
        orient_cos2=orient_cos2,
        orient_sin2=orient_sin2,
        orient_coherence=orient_coherence,
    )


def _orientation_descriptors(tiles: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    cos2 = np.ones(len(tiles), dtype=np.float32)
    sin2 = np.zeros(len(tiles), dtype=np.float32)
    coherence = np.zeros(len(tiles), dtype=np.float32)
    for index, tile in enumerate(tiles):
        gx = cv2.Sobel(tile, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(tile, cv2.CV_32F, 0, 1, ksize=3)
        jxx, jyy, jxy = float(np.sum(gx * gx)), float(np.sum(gy * gy)), float(np.sum(gx * gy))
        total = jxx + jyy
        if total <= 1e-6:
            continue
        # Structure-tensor direction is the gradient normal; rotate 90 degrees
        # so the descriptor follows the glyph's visible stroke instead.
        theta = 0.5 * math.atan2(2.0 * jxy, jxx - jyy) + math.pi / 2.0
        delta = math.sqrt((jxx - jyy) ** 2 + 4.0 * jxy * jxy)
        cos2[index], sin2[index] = math.cos(2.0 * theta), math.sin(2.0 * theta)
        coherence[index] = float(np.clip(delta / total, 0.0, 1.0))
    return cos2, sin2, coherence


def _fit_font(font_path: str, cell_w: int, cell_h: int, chars: str) -> ImageFont.FreeTypeFont:
    """Largest size at which every font-rendered character in `chars` still fits the cell.

    Probing a single fixed glyph (e.g. the full block) is wrong here: that glyph may be
    synthesized rather than font-rendered, or it may simply be an outlier -- unusually
    tall or wide relative to the rest of the set -- which would under- or over-constrain
    the fit for everything else. So we check the whole font-rendered set and require all
    of it to fit.
    """
    best = ImageFont.truetype(font_path, max(6, cell_h))
    if not chars:
        return best
    probe = ImageDraw.Draw(Image.new("L", (1, 1)))
    for size in range(cell_h + 4, 5, -1):
        candidate = ImageFont.truetype(font_path, size)
        fits = True
        for char in chars:
            left, top, right, bottom = probe.textbbox((0, 0), char, font=candidate)
            if (right - left) > cell_w or (bottom - top) > cell_h:
                fits = False
                break
        if fits:
            return candidate
        best = candidate
    return best


def _signatures(tiles: np.ndarray) -> np.ndarray:
    """Area-average each tile down to SIG_H x SIG_W and flatten."""
    n, cell_h, cell_w = tiles.shape
    rows = np.linspace(0, cell_h, SIG_H + 1).astype(int)
    cols = np.linspace(0, cell_w, SIG_W + 1).astype(int)
    out = np.zeros((n, SIG_H, SIG_W), dtype=np.float32)
    for r in range(SIG_H):
        for c in range(SIG_W):
            block = tiles[:, rows[r]:max(rows[r] + 1, rows[r + 1]), cols[c]:max(cols[c] + 1, cols[c + 1])]
            out[:, r, c] = block.mean(axis=(1, 2))
    return out.reshape(n, SIG_H * SIG_W)


def match_glyphs(
    sigs: np.ndarray,
    atlas: Atlas,
    prev: np.ndarray | None = None,
    hysteresis: float = 0.0,
    orient_cos2: np.ndarray | None = None,
    orient_sin2: np.ndarray | None = None,
    orient_coherence: np.ndarray | None = None,
    orientation_weight: float = 0.0,
) -> np.ndarray:
    """Pick, per cell, the glyph whose bitmap best matches the cell's pixels.

    Minimising ||c - g||^2 over glyphs is equivalent to maximising 2*(c.g) - ||g||^2,
    because ||c||^2 is constant per cell. That is one matmul against the atlas.

    `hysteresis` adds a bonus to each cell's previous glyph so cells sitting on a
    decision boundary do not flicker between two near-equal choices every frame.
    """
    scores = sigs @ atlas.sig.T * 2.0 - atlas.sig_norm[None, :]
    if orientation_weight > 0 and orient_cos2 is not None and orient_sin2 is not None:
        cell_coherence = (
            np.ones(scores.shape[0], dtype=np.float32)
            if orient_coherence is None else np.asarray(orient_coherence, dtype=np.float32).reshape(-1)
        )
        alignment = (
            np.asarray(orient_cos2, dtype=np.float32).reshape(-1, 1) * atlas.orient_cos2[None, :]
            + np.asarray(orient_sin2, dtype=np.float32).reshape(-1, 1) * atlas.orient_sin2[None, :]
        )
        scores += (
            orientation_weight * cell_coherence[:, None]
            * atlas.orient_coherence[None, :] * alignment
        )
    if prev is not None and hysteresis:
        flat_prev = np.asarray(prev).reshape(-1)
        if flat_prev.shape[0] != scores.shape[0]:
            raise ValueError(
                f"prev has {flat_prev.shape[0]} cells, expected {scores.shape[0]}"
            )
        scores[np.arange(scores.shape[0]), flat_prev] += hysteresis
    return scores.argmax(axis=1).astype(np.int32)


def blit(
    grid_idx: np.ndarray,
    atlas: Atlas,
    fg: np.ndarray,
    bg: np.ndarray,
) -> np.ndarray:
    """Compose the full-resolution frame from a glyph grid and per-cell colours.

    No Python loop over cells: the atlas is indexed by the whole grid at once, then
    composited into the image one colour channel at a time with in-place ops (see the
    comment above `cov` below for why -- a naive 5-D broadcast is far more memory- and
    time-expensive). Each cell carries an independent foreground and background colour,
    so half-block glyphs give two colours per cell.
    """
    grid_idx = np.asarray(grid_idx)
    rows, cols = grid_idx.shape
    if fg.shape != (rows, cols, 3) or bg.shape != (rows, cols, 3):
        raise ValueError(
            f"fg/bg must be ({rows}, {cols}, 3); got {fg.shape} and {bg.shape}"
        )

    tiles = atlas.tiles[grid_idx]                       # (rows, cols, ch, cw)
    cell_h, cell_w = atlas.tiles.shape[1:]

    # Build the 2-D coverage image first, then composite per colour channel with
    # in-place ops. This avoids ever materialising the (rows, cols, ch, cw, 3) 5-D
    # intermediate the naive broadcast needs -- that intermediate is 25MB at
    # 128x120 cells of 15x9px and dominates the runtime. bg + (fg - bg) * coverage
    # is preserved exactly, so each cell still keeps independent fg/bg colours.
    cov = tiles.transpose(0, 2, 1, 3).reshape(rows * cell_h, cols * cell_w)
    out = np.empty((rows * cell_h, cols * cell_w, 3), dtype=np.float32)
    for channel in range(3):
        f = np.repeat(np.repeat(fg[:, :, channel], cell_h, 0), cell_w, 1)
        b = np.repeat(np.repeat(bg[:, :, channel], cell_h, 0), cell_w, 1)
        np.subtract(f, b, out=f)
        np.multiply(f, cov, out=f)
        np.add(f, b, out=out[:, :, channel])
    return out
