"""Final grade: filmic curve, halation, grain, scanlines, vignette.

v1 added a flat Gaussian blur of the whole frame, which greyed everything equally.
Halation is thresholded -- only genuinely bright glyphs bleed -- which is what real
film and CRT phosphor do, and it keeps the blacks black.

Perf notes (measured on a 1920x1080x3 float32 frame; see
.superpowers/sdd/task-10-report.md for the full writeup):

- Halation bloom is low-frequency by definition (it's already blurred with a huge
  sigma), so it is computed at 1/4 resolution and upsampled -- see `_halation_bloom`.
- The vignette falloff depends only on (height, width, look.vignette), so it is
  cached across frames -- see `_vignette_falloff`.
- Per-frame grain is a deterministic offset-and-tile read from one precomputed noise
  tile, instead of drawing ~2M fresh normals every frame -- see `_grain_tile` and
  `_grain_for_frame`.

`grade_reference` keeps the original, unoptimized implementation around as a
correctness oracle for tests -- it is not used by the render path.
"""

from __future__ import annotations

from functools import lru_cache

import cv2
import numpy as np
from scipy import ndimage as ndi

from .tokens import Look

_HALATION_DOWNSCALE = 4
_HALATION_MIN_DIM = 16

_GRAIN_TILE_SIZE = 2048
"""2048 comfortably exceeds every frame dimension this pipeline ships (1920 or
1080 on the long edge), so a single frame never needs the tile repeated more
than once in either axis -- no within-frame repetition, only the frame-to-frame
offset walk (see `_grain_for_frame`). A 512px tile was the size floated in the
original brief, but it tiles a 1920x1080 frame 3x4 times, which is a literal
repeated noise realization, not just statistically similar noise -- visible on
close inspection. Roll+tile at 2048 costs ~1.6ms more per frame than at 512
(measured: 1.2ms -> 2.8ms), negligible against the ~65ms grade() budget."""


def _filmic(x: np.ndarray) -> np.ndarray:
    """Gentle shoulder; keeps highlights from clipping to flat white."""
    return np.clip((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0)


def _halation_bloom(bright: np.ndarray, sigma: float) -> np.ndarray:
    """Bloom is low-frequency, so blur it at reduced resolution and upsample.

    Downsamples by `_HALATION_DOWNSCALE` with INTER_AREA, blurs with `sigma` scaled
    down to match, then upsamples back with INTER_LINEAR. Guarded so the reduced
    dimensions never drop below `_HALATION_MIN_DIM` (small frames appear in tests).
    Measured max absolute difference versus the full-resolution blur: 0.0031.

    `sigma` comes from `look.halation_sigma` -- it is passed in rather than read from
    a module constant so this and `grade_reference`'s full-resolution blur read the
    same single value; a hardcoded literal duplicated in both places is a live hazard
    (they can drift apart and silently break the fidelity oracle in tests/test_post.py).
    """
    height, width = bright.shape[:2]
    scale = _HALATION_DOWNSCALE
    small_h, small_w = height // scale, width // scale
    if small_h < _HALATION_MIN_DIM or small_w < _HALATION_MIN_DIM or scale <= 1:
        return cv2.GaussianBlur(bright, (0, 0), sigma)

    small = cv2.resize(bright, (small_w, small_h), interpolation=cv2.INTER_AREA)
    small_blurred = cv2.GaussianBlur(small, (0, 0), sigma / scale)
    return cv2.resize(small_blurred, (width, height), interpolation=cv2.INTER_LINEAR)


@lru_cache(maxsize=8)
def _vignette_falloff_cached(height: int, width: int, vignette: float) -> np.ndarray:
    yy, xx = np.ogrid[-1:1:height * 1j, -1:1:width * 1j]
    falloff = 1.0 - np.clip((xx * xx + yy * yy) * vignette, 0.0, 1.0)
    result = falloff.astype(np.float32)
    result.setflags(write=False)
    return result


def _vignette_falloff(height: int, width: int, vignette: float) -> np.ndarray:
    """Vignette depends only on (height, width, vignette), so cache it across frames.

    Returns a read-only view into the cached array; callers must not mutate it
    in place (use it as a multiplicand, not a target).
    """
    return _vignette_falloff_cached(height, width, vignette)


@lru_cache(maxsize=1)
def _grain_tile() -> np.ndarray:
    """One standard-normal noise tile, generated once and reused every frame.

    Sized (see `_GRAIN_TILE_SIZE`) so a single frame never needs to repeat the
    tile, and successive frames read from different, frame-index-derived
    offsets (see `_grain_for_frame`) so no fixed pattern lines up across frames
    either.
    """
    rng = np.random.default_rng(2027)
    tile = rng.standard_normal((_GRAIN_TILE_SIZE, _GRAIN_TILE_SIZE)).astype(np.float32)
    tile.setflags(write=False)
    return tile


def _grain_for_frame(frame_index: int, height: int, width: int) -> np.ndarray:
    """Deterministic per-frame grain, tiled/offset from the shared noise tile.

    The offset is derived from `frame_index` with two different large odd
    multipliers for x and y (coprime with the tile size and with each other),
    so consecutive frames land at offsets whose (x, y) pair does not repeat or
    fall on a single diagonal within any short run of frames -- avoiding visible
    repetition even over long sequences, even though x and y are both linear in
    `frame_index` (and so linearly related to each other mod the tile size).
    `% tile_size` wraps the offset back into the tile; `np.roll` (cheap --
    operates on the `_GRAIN_TILE_SIZE`-square tile, not the full frame) applies
    that offset, and `np.tile` + crop repeats the rolled tile out to the
    requested frame shape. This is materially faster than a
    `np.take(..., mode="wrap")` gather over the full frame shape, which does
    two full-size fancy-index passes instead of one small roll plus a cheap
    block-copy tile.
    """
    tile = _grain_tile()
    tile_size = tile.shape[0]
    off_y = (frame_index * 1013) % tile_size
    off_x = (frame_index * 7919) % tile_size
    rolled = np.roll(tile, (-off_y, -off_x), axis=(0, 1))
    reps_y = -(-height // tile_size)  # ceil division
    reps_x = -(-width // tile_size)
    big = np.tile(rolled, (reps_y, reps_x))
    return big[:height, :width]


@lru_cache(maxsize=8)
def _paper_texture(height: int, width: int) -> np.ndarray:
    """Stable multi-scale fibre texture for the physical-paper look.

    Unlike film grain this texture belongs to the sheet, so it must not reshuffle
    every frame.  A broad pulp cloud, fine tooth and sparse horizontal fibres are
    combined once per canvas size and cached for the complete render.
    """
    rng = np.random.default_rng(1613 + height * 17 + width * 31)
    tooth = rng.standard_normal((height, width)).astype(np.float32)
    pulp_small = rng.standard_normal((max(8, height // 36), max(8, width // 36))).astype(np.float32)
    pulp = cv2.resize(pulp_small, (width, height), interpolation=cv2.INTER_CUBIC)
    fibres = cv2.GaussianBlur(tooth, (0, 0), sigmaX=18.0, sigmaY=0.45)
    texture = tooth * 0.34 + pulp * 0.48 + fibres * 0.18
    texture -= float(texture.mean())
    texture /= max(1e-6, float(texture.std()))
    texture = np.clip(texture, -2.4, 2.4).astype(np.float32)
    texture.setflags(write=False)
    return texture


def _ink_absorb(frame: np.ndarray, mask: np.ndarray, pigment: np.ndarray, amount: float) -> np.ndarray:
    """Multiply a translucent print pigment into ``frame`` through ``mask``."""
    absorption = mask[:, :, None] * amount * (1.0 - pigment[None, None, :])
    return frame * np.clip(1.0 - absorption, 0.0, 1.0)


def _paper_grade(rgb: np.ndarray, look: Look) -> np.ndarray:
    """Letterpress/riso grade: warm stock, absorbed ink and restrained misregistration."""
    out = np.clip(np.asarray(rgb, dtype=np.float32), 0.0, 1.0).copy()
    # Press pressure deepens the ink without turning the warm stock neutral grey.
    darkness = 1.0 - out
    out = 1.0 - np.clip(darkness * look.ink_gain, 0.0, 1.0)

    if look.riso_offset > 0:
        luma = out[..., 0] * 0.2126 + out[..., 1] * 0.7152 + out[..., 2] * 0.0722
        ink = np.clip((0.78 - luma) / 0.62, 0.0, 1.0)
        offset = max(1, int(round(look.riso_offset)))
        violet_mask = np.roll(ink, offset, axis=1) * (1.0 - ink * 0.82)
        red_mask = np.roll(ink, -offset, axis=1) * (1.0 - ink * 0.86)
        out = _ink_absorb(out, violet_mask, look.accent_rgb().astype(np.float32), 0.34)
        out = _ink_absorb(out, red_mask, look.secondary_accent_rgb().astype(np.float32), 0.24)

    if look.vignette > 0:
        falloff = _vignette_falloff(out.shape[0], out.shape[1], look.vignette)
        # A printed sheet darkens only gently toward the edge; preserve at least 93%.
        out *= (0.93 + 0.07 * falloff)[:, :, None]

    if look.paper_texture > 0:
        texture = _paper_texture(out.shape[0], out.shape[1]) * look.paper_texture
        # Paper tooth modulates reflected light, equally across channels.
        out += texture[:, :, None]

    return np.clip(out, 0.0, 1.0)


def grade(rgb: np.ndarray, look: Look, frame_index: int) -> np.ndarray:
    out = np.clip(np.asarray(rgb, dtype=np.float32), 0.0, 1.0)

    if look.is_paper:
        return (_paper_grade(out, look) * 255.0).astype(np.uint8)

    if look.halation > 0:
        # out.max(axis=2) forces a strided reduction that measures ~10x slower than
        # two flat pairwise maximums over the same 3 channels; same result, no
        # change to what is computed.
        luma = np.maximum(np.maximum(out[..., 0], out[..., 1]), out[..., 2])
        threshold = look.halation_threshold
        mask = np.clip((luma - threshold) / (1.0 - threshold), 0.0, 1.0)
        bright = out * mask[:, :, None]
        bloom = _halation_bloom(bright, look.halation_sigma)
        np.multiply(bloom, look.halation, out=bloom)
        np.subtract(1.0, bloom, out=bloom)
        screened = 1.0 - out
        np.multiply(screened, bloom, out=screened)
        np.subtract(1.0, screened, out=out)

    out = _filmic(out)

    if look.scanlines > 0:
        out[::2, :, :] *= (1.0 - look.scanlines)

    if look.vignette > 0:
        height, width = out.shape[:2]
        falloff = _vignette_falloff(height, width, look.vignette)
        out *= falloff[:, :, None]

    if look.grain > 0:
        height, width = out.shape[:2]
        noise = _grain_for_frame(frame_index, height, width) * look.grain
        out += noise[:, :, None]

    np.clip(out, 0.0, 1.0, out=out)
    out *= 255.0
    return out.astype(np.uint8)


def grade_reference(rgb: np.ndarray, look: Look, frame_index: int) -> np.ndarray:
    """Correctness oracle ONLY -- not used by the render path.

    The original, unoptimized implementation: full-resolution halation blur and a
    freshly-built vignette every call. Kept so tests can assert the fast path in
    `grade` stays visually faithful to it. Do not call this from render code.
    """
    out = np.clip(np.asarray(rgb, dtype=np.float32), 0.0, 1.0)

    if look.is_paper:
        return (_paper_grade(out, look) * 255.0).astype(np.uint8)

    if look.halation > 0:
        luma = out.max(axis=2)
        threshold = look.halation_threshold
        mask = np.clip((luma - threshold) / (1.0 - threshold), 0.0, 1.0)
        bright = out * mask[:, :, None]
        bloom = cv2.GaussianBlur(bright, (0, 0), look.halation_sigma)
        out = 1.0 - (1.0 - out) * (1.0 - bloom * look.halation)  # screen

    out = _filmic(out)

    if look.scanlines > 0:
        out[::2, :, :] *= (1.0 - look.scanlines)

    if look.vignette > 0:
        height, width = out.shape[:2]
        yy, xx = np.ogrid[-1:1:height * 1j, -1:1:width * 1j]
        falloff = 1.0 - np.clip((xx * xx + yy * yy) * look.vignette, 0.0, 1.0)
        out *= falloff.astype(np.float32)[:, :, None]

    if look.grain > 0:
        rng = np.random.default_rng(frame_index * 7919 + 2027)
        out += rng.normal(0.0, look.grain, out.shape[:2]).astype(np.float32)[:, :, None]

    return (np.clip(out, 0.0, 1.0) * 255.0).astype(np.uint8)


# ---------------------------------------------------------------------------
# Extra shaders. Each is a small, pure function on a float32 RGB frame (0..1
# in, 0..1 out, same shape) -- they compose freely and don't know about `Look`
# or grading. Kaleidoscope/mirror effects are deliberately NOT provided here:
# this renderer puts captions on screen, and those effects reliably shred text
# legibility, per the reference implementation's own troubleshooting notes.
# ---------------------------------------------------------------------------


def sh_chromatic(frame: np.ndarray, amount: float) -> np.ndarray:
    """RGB channel offset: red shifts right, blue shifts left, green stays put.

    `amount` is in pixels (rounded -- subpixel offsets aren't visually
    distinguishable at this resolution and an integer `np.roll` is far cheaper
    than a per-channel `cv2.warpAffine`). Uses wraparound at the frame edge,
    which is invisible in practice since it is a 1-2px sliver under a caption
    plate or vignette on every shipped look.
    """
    dx = int(round(amount))
    if dx == 0:
        return frame.copy()
    out = frame.copy()
    out[..., 0] = np.roll(frame[..., 0], dx, axis=1)
    out[..., 2] = np.roll(frame[..., 2], -dx, axis=1)
    return out


@lru_cache(maxsize=16)
def _radial_unit_vectors(height: int, width: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """(dx, dy, radius) unit direction away from centre, and normalised radius
    (0 at centre, 1 at the nearest edge midpoint). Cached: depends only on shape."""
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    cy, cx = height / 2.0, width / 2.0
    dy, dx = yy - cy, xx - cx
    radius = np.hypot(dy, dx)
    safe = np.where(radius > 1e-6, radius, 1.0)
    unit_x = dx / safe
    unit_y = dy / safe
    norm_radius = radius / min(cy, cx)
    for arr in (unit_x, unit_y, norm_radius):
        arr.setflags(write=False)
    return unit_x, unit_y, norm_radius


def sh_rgb_split_radial(frame: np.ndarray, amount: float) -> np.ndarray:
    """Chromatic aberration that grows with distance from centre: none in the
    middle of frame, worst at the corners -- a lens aberration, not a uniform
    channel shift. Red is pushed outward, blue pulled inward, by `amount` px
    scaled by the (cached) normalised radius at each pixel."""
    height, width = frame.shape[:2]
    unit_x, unit_y, norm_radius = _radial_unit_vectors(height, width)
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    offset = amount * norm_radius
    red_map_x = xx + unit_x * offset
    red_map_y = yy + unit_y * offset
    blue_map_x = xx - unit_x * offset
    blue_map_y = yy - unit_y * offset

    out = frame.copy()
    out[..., 0] = cv2.remap(
        frame[..., 0], red_map_x, red_map_y,
        interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE,
    )
    out[..., 2] = cv2.remap(
        frame[..., 2], blue_map_x, blue_map_y,
        interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE,
    )
    return out


def sh_posterize(frame: np.ndarray, levels: int) -> np.ndarray:
    """Quantise each channel to `levels` evenly-spaced steps (levels >= 2)."""
    if levels < 2:
        raise ValueError("sh_posterize needs at least 2 levels")
    steps = levels - 1
    out = np.round(np.clip(frame, 0.0, 1.0) * steps) / steps
    return out.astype(np.float32)


def sh_solarize(frame: np.ndarray, threshold: float = 0.5) -> np.ndarray:
    """Invert whichever pixels are brighter than `threshold` -- the darkroom
    solarization look."""
    clamped = np.clip(frame, 0.0, 1.0)
    return np.where(clamped > threshold, 1.0 - clamped, clamped).astype(np.float32)


_ROW_RUN_STRUCTURE = np.array([[0, 0, 0], [1, 1, 1], [0, 0, 0]], dtype=np.uint8)
_COL_RUN_STRUCTURE = np.array([[0, 1, 0], [0, 1, 0], [0, 1, 0]], dtype=np.uint8)


def sh_pixel_sort(frame: np.ndarray, axis: int, threshold: float) -> np.ndarray:
    """Sort pixels brighter than `threshold` by luminance, within each contiguous
    run along `axis` (1 = along rows/horizontal, 0 = along columns/vertical).

    Runs are found with `scipy.ndimage.label` using an axis-restricted structuring
    element, so a run never crosses into the next row (axis=1) or column (axis=0).
    The whole frame is then reordered with two `np.lexsort` calls -- one to read
    pixels out in luminance order, one to write them back in position order --
    instead of a Python loop over every run.
    """
    height, width = frame.shape[:2]
    luma = frame.mean(axis=2)
    mask = luma > threshold
    structure = _ROW_RUN_STRUCTURE if axis == 1 else _COL_RUN_STRUCTURE
    labels, num = ndi.label(mask, structure=structure)
    if num == 0:
        return frame.copy()

    flat_labels = labels.ravel()
    flat_luma = luma.ravel()
    if axis == 1:
        position = np.tile(np.arange(width, dtype=np.int64), (height, 1)).ravel()
    else:
        position = np.tile(np.arange(height, dtype=np.int64)[:, None], (1, width)).ravel()

    keep = flat_labels > 0
    idx = np.arange(height * width)
    kept_idx = idx[keep]
    kept_labels = flat_labels[keep]

    src_order = np.lexsort((flat_luma[keep], kept_labels))
    dst_order = np.lexsort((position[keep], kept_labels))
    src_idx = kept_idx[src_order]
    dst_idx = kept_idx[dst_order]

    flat = frame.reshape(-1, 3).copy()
    flat[dst_idx] = frame.reshape(-1, 3)[src_idx]
    return flat.reshape(height, width, 3)


def sh_block_glitch(frame: np.ndarray, blocks: int, seed: int) -> np.ndarray:
    """Chop the frame into a `blocks` x `blocks` grid and horizontally shift
    a deterministic random subset of cells -- a data-corruption-style glitch.
    `blocks` is a small grid count (not a pixel size), so the per-cell loop
    below is on the order of `blocks**2` iterations, not per-pixel."""
    height, width = frame.shape[:2]
    rng = np.random.default_rng(seed)
    out = frame.copy()
    cell_h = max(1, height // blocks)
    cell_w = max(1, width // blocks)
    for y0 in range(0, height, cell_h):
        y1 = min(y0 + cell_h, height)
        for x0 in range(0, width, cell_w):
            x1 = min(x0 + cell_w, width)
            if rng.random() < 0.3:
                shift = int(rng.integers(-cell_w, cell_w + 1))
                out[y0:y1, x0:x1] = np.roll(out[y0:y1, x0:x1], shift, axis=1)
    return out


@lru_cache(maxsize=16)
def _crt_barrel_maps(height: int, width: int, strength: float) -> tuple[np.ndarray, np.ndarray]:
    """Barrel-distortion remap coordinates for `cv2.remap`, cached per
    (resolution, strength) -- recomputing this per frame was measured far too
    slow; it depends on neither frame content nor time, so it only needs to
    exist once per unique (height, width, strength) triple."""
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    cx, cy = width / 2.0, height / 2.0
    nx = (xx - cx) / cx
    ny = (yy - cy) / cy
    r2 = nx * nx + ny * ny
    factor = 1.0 + strength * r2
    map_x = (cx + nx * factor * cx).astype(np.float32)
    map_y = (cy + ny * factor * cy).astype(np.float32)
    map_x.setflags(write=False)
    map_y.setflags(write=False)
    return map_x, map_y


def sh_crt_barrel(frame: np.ndarray, strength: float) -> np.ndarray:
    """CRT-style barrel distortion: positive `strength` bulges the centre and
    pulls the corners in, like the curved glass of a CRT tube."""
    height, width = frame.shape[:2]
    map_x, map_y = _crt_barrel_maps(height, width, float(strength))
    return cv2.remap(
        frame, map_x, map_y,
        interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0,
    )
