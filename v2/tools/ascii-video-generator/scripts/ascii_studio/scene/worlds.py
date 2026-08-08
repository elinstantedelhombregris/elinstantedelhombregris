"""Cinematic semantic worlds with real layered depth.

The v3 renderer placed diagrams over procedural fields.  v4 builds a recognizable
world first: atmosphere, architecture, narrative subject and foreground light are
separate planes, moved with depth-aware camera parallax and then converted through
the normal glyph renderer.  Optional locked image plates use the same contract, so
an approved raster concept can be animated without becoming a flat background.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from ..render import easing
from ..render.canvas import ZONES
from . import semantic
from .legacy import LegacyChapter


@dataclass(frozen=True)
class WorldFrame:
    luminance: np.ndarray
    depth: np.ndarray
    hero_mask: np.ndarray


def _stage_bounds(shape: tuple[int, int]) -> tuple[int, int, int, int]:
    height, width = shape
    zone = ZONES["stage"]
    return (
        int(zone.y0 * height), int(zone.y1 * height),
        int(zone.x0 * width), int(zone.x1 * width),
    )


def _screen(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    return 1.0 - (1.0 - a) * (1.0 - b)


def _line(layer: np.ndarray, points, value: float, width: int = 1) -> None:
    cv2.polylines(
        layer, [np.asarray(points, dtype=np.int32)], False, float(value),
        max(1, width), cv2.LINE_AA,
    )


def _human(layer: np.ndarray, x: float, ground: float, scale: float,
           value: float = 0.9, filled: bool = False) -> None:
    """Editorial human silhouette that survives glyph-cell downsampling."""
    head = max(2, round(scale * 0.13))
    width = max(1, round(scale * 0.055))
    cv2.circle(layer, (round(x), round(ground - scale * 0.78)), head, float(value),
               -1 if filled else width, cv2.LINE_AA)
    shoulder_y = ground - scale * 0.57
    hip_y = ground - scale * 0.25
    _line(layer, [(x, ground - scale * 0.64), (x, hip_y)], value, width)
    _line(layer, [(x - scale * 0.24, shoulder_y), (x, shoulder_y - scale * 0.03),
                  (x + scale * 0.24, shoulder_y)], value, width)
    _line(layer, [(x, hip_y), (x - scale * 0.16, ground)], value, width)
    _line(layer, [(x, hip_y), (x + scale * 0.16, ground)], value, width)


def _skyline(layer: np.ndarray, rng: np.random.Generator, horizon: int,
             strength: float, window_strength: float = 0.6) -> None:
    height, width = layer.shape
    cursor = -round(width * 0.04)
    while cursor < width:
        building_w = int(rng.uniform(width * 0.055, width * 0.14))
        building_h = int(rng.uniform(height * 0.12, height * 0.42))
        top = max(0, horizon - building_h)
        cv2.rectangle(layer, (cursor, top), (cursor + building_w, horizon),
                      float(strength * rng.uniform(0.42, 0.78)), -1)
        cv2.line(layer, (cursor, top), (cursor + building_w, top), float(strength), 1, cv2.LINE_AA)
        step_x = max(5, building_w // 4)
        step_y = max(7, building_h // 6)
        for wy in range(top + step_y, horizon - 2, step_y):
            for wx in range(cursor + step_x // 2, cursor + building_w - 2, step_x):
                if rng.random() < 0.36:
                    cv2.circle(layer, (wx, wy), 1, float(window_strength), -1)
        cursor += building_w + int(rng.uniform(2, max(3, width * 0.018)))


def _perspective_grid(layer: np.ndarray, vanish: tuple[int, int], ground: int,
                      reveal: float, value: float = 0.48) -> None:
    height, width = layer.shape
    vx, vy = vanish
    for index in range(13):
        x = int((index / 12) * width)
        endpoint = (round(vx + (x - vx) * reveal), round(vy + (ground - vy) * reveal))
        _line(layer, [(vx, vy), endpoint], value, 1)
    for index in range(8):
        frac = (index / 7) ** 1.8
        y = round(vy + (ground - vy) * frac * reveal)
        half = round(width * 0.5 * frac * reveal)
        _line(layer, [(vx - half, y), (vx + half, y)], value * (0.5 + frac * 0.5), 1)


def _civic_plaza(layers: list[np.ndarray], rng: np.random.Generator,
                 progress: float, morph: float) -> None:
    h, w = layers[0].shape
    horizon = round(h * 0.53)
    _skyline(layers[0], rng, horizon, 0.40 + 0.22 * progress)
    _perspective_grid(layers[1], (w // 2, horizon), h - 2, 0.45 + 0.55 * morph)
    people = [(0.23, 0.93, 0.27), (0.50, 0.96, 0.34), (0.78, 0.92, 0.25)]
    for index, (x, ground, scale) in enumerate(people):
        _human(layers[2], w * x, h * ground, min(h, w) * scale,
               0.64 + 0.32 * progress, filled=index == 1)
    if morph > 0.02:
        points = [(round(w * x), round(h * (ground - scale * 0.78))) for x, ground, scale in people]
        for a, b in zip(points, points[1:]):
            length = max(2, round(math.hypot(b[0] - a[0], b[1] - a[1]) * morph))
            dx, dy = b[0] - a[0], b[1] - a[1]
            total = max(1.0, math.hypot(dx, dy))
            end = (round(a[0] + dx / total * length), round(a[1] + dy / total * length))
            _line(layers[3], [a, end], 0.98, max(1, round(w * 0.004)))


def _evidence_trail(layers: list[np.ndarray], rng: np.random.Generator,
                    progress: float, morph: float) -> None:
    h, w = layers[0].shape
    _skyline(layers[0], rng, round(h * 0.42), 0.24)
    path = np.asarray([
        (w * 0.18, h * 0.94), (w * 0.42, h * 0.76), (w * 0.36, h * 0.58),
        (w * 0.64, h * 0.40), (w * 0.55, h * 0.16),
    ], dtype=np.int32)
    cv2.polylines(layers[1], [path], False, 0.62, max(2, round(w * 0.025)), cv2.LINE_AA)
    for index in range(9):
        frac = index / 8
        segment = min(3, int(frac * 4))
        local = frac * 4 - segment
        p0, p1 = path[segment], path[min(4, segment + 1)]
        x, y = p0 * (1 - local) + p1 * local
        angle = -18 if index % 2 else 18
        axes = (max(2, round(w * 0.018)), max(3, round(h * 0.018)))
        cv2.ellipse(layers[2], tuple(np.asarray((x, y), dtype=int)), axes, angle, 0, 360,
                    0.80 + 0.18 * progress, -1, cv2.LINE_AA)
    if morph > 0.02:
        step = max(8, round(w * 0.10))
        for x in range(0, round(w * morph), step):
            _line(layers[3], [(x, 0), (x, h)], 0.34, 1)
        for y in range(0, round(h * morph), step):
            _line(layers[3], [(0, y), (w, y)], 0.34, 1)


def _city_section(layers: list[np.ndarray], rng: np.random.Generator,
                  progress: float, morph: float) -> None:
    h, w = layers[0].shape
    ground = round(h * 0.43)
    _skyline(layers[0], rng, ground, 0.50)
    _line(layers[1], [(0, ground), (w, ground)], 0.86, max(1, round(h * 0.006)))
    columns = 6
    nodes: list[tuple[int, int]] = []
    for row in range(4):
        for col in range(columns):
            x = round(w * (0.10 + col * 0.80 / (columns - 1)))
            y = round(ground + h * (0.11 + row * 0.10))
            nodes.append((x, y))
            cv2.circle(layers[2], (x, y), max(2, round(w * 0.012)), 0.50 + 0.48 * morph,
                       1 if morph < 0.7 else -1, cv2.LINE_AA)
            if col:
                previous = nodes[-2]
                _line(layers[2], [previous, (round(previous[0] + (x - previous[0]) * morph), y)],
                      0.56 + 0.30 * morph, max(1, round(w * 0.004)))
            if row:
                above = nodes[(row - 1) * columns + col]
                _line(layers[2], [above, (x, round(above[1] + (y - above[1]) * morph))],
                      0.48 + 0.34 * morph, 1)
    # The human gesture above ground becomes the infrastructure below it.
    _human(layers[3], w * 0.5, ground + h * 0.02, min(h, w) * 0.23, 0.98)
    _line(layers[3], [(w * 0.5, ground), (w * 0.5, ground + h * 0.11 * morph)], 1.0, 2)


def _attentive_crowd(layers: list[np.ndarray], rng: np.random.Generator,
                     progress: float, morph: float) -> None:
    h, w = layers[0].shape
    heads: list[tuple[int, int]] = []
    for row in range(4):
        count = 5 + row
        ground = h * (0.43 + row * 0.15)
        scale = min(h, w) * (0.13 + row * 0.018)
        for col in range(count):
            x = w * ((col + 0.5 + (row % 2) * 0.5) / (count + (row % 2)))
            _human(layers[1 + min(2, row // 2)], x, ground, scale,
                   0.36 + row * 0.13 + progress * 0.18, filled=row == 3 and col == count // 2)
            heads.append((round(x), round(ground - scale * 0.78)))
    center = min(heads, key=lambda p: abs(p[0] - w / 2) + abs(p[1] - h * 0.66))
    for index, point in enumerate(heads):
        if index % 2 == 0:
            end = (round(center[0] + (point[0] - center[0]) * morph),
                   round(center[1] + (point[1] - center[1]) * morph))
            _line(layers[3], [center, end], 0.42 + 0.52 * morph, 1)


def _eye_city(layers: list[np.ndarray], rng: np.random.Generator,
              progress: float, morph: float) -> None:
    h, w = layers[0].shape
    center = (w // 2, round(h * 0.48))
    axes = (round(w * 0.43), round(h * 0.23))
    cv2.ellipse(layers[1], center, axes, 0, 195, 345, 0.84, max(1, round(w * 0.008)), cv2.LINE_AA)
    cv2.ellipse(layers[1], center, axes, 0, 15, 165, 0.84, max(1, round(w * 0.008)), cv2.LINE_AA)
    iris = max(5, round(min(h, w) * (0.10 + 0.09 * morph)))
    cv2.circle(layers[2], center, iris, 0.88, max(1, round(w * 0.008)), cv2.LINE_AA)
    cv2.circle(layers[2], center, max(2, round(iris * 0.34)), 0.98, -1, cv2.LINE_AA)
    city = np.zeros_like(layers[3])
    _skyline(city, rng, center[1] + round(iris * 0.46), 0.92, 0.88)
    iris_mask = np.zeros_like(city)
    cv2.circle(iris_mask, center, iris, 1.0, -1, cv2.LINE_AA)
    layers[3][:] = np.maximum(layers[3], city * iris_mask * morph)
    horizon = center[1] + round(iris * 0.22)
    _line(layers[3], [(center[0] - iris, horizon), (center[0] + iris, horizon)], 0.96 * morph, 1)


def _mechanical_orbit(layers: list[np.ndarray], progress: float, morph: float,
                      phase: float) -> None:
    h, w = layers[0].shape
    center = (w // 2, h // 2)
    unit = min(h, w)
    for index, radius in enumerate((0.13, 0.22, 0.34, 0.44)):
        cv2.circle(layers[min(3, index)], center, round(unit * radius),
                   0.42 + index * 0.14, max(1, round(w * 0.005)), cv2.LINE_AA)
        angle = phase * (1 if index % 2 else -1) + index * 1.7
        x = center[0] + math.cos(angle) * unit * radius
        y = center[1] + math.sin(angle) * unit * radius
        cv2.circle(layers[min(3, index)], (round(x), round(y)), max(2, round(unit * 0.025)),
                   0.92, -1, cv2.LINE_AA)
    if morph:
        _line(layers[3], [(center[0], center[1] - unit * 0.44),
                          (center[0], center[1] + unit * 0.44 * morph)], 0.86, 2)


def _fractured_monument(layers: list[np.ndarray], rng: np.random.Generator,
                        progress: float, morph: float) -> None:
    h, w = layers[0].shape
    base = np.asarray([(w * 0.23, h * 0.88), (w * 0.34, h * 0.18),
                       (w * 0.67, h * 0.18), (w * 0.78, h * 0.88)], dtype=np.int32)
    cv2.fillConvexPoly(layers[1], base, 0.42, cv2.LINE_AA)
    crack = [(w * 0.51, h * 0.16), (w * 0.45, h * 0.38), (w * 0.56, h * 0.52),
             (w * 0.47, h * 0.72), (w * (0.47 + 0.20 * morph), h * 0.94)]
    _line(layers[2], crack, 1.0, max(2, round(w * 0.012)))
    if morph:
        _perspective_grid(layers[3], (round(w * 0.58), round(h * 0.48)), h, morph, 0.70)


def _dawn_city(layers: list[np.ndarray], rng: np.random.Generator,
               progress: float, morph: float) -> None:
    h, w = layers[0].shape
    horizon = round(h * 0.58)
    radius = max(3, round(min(h, w) * (0.06 + 0.12 * morph)))
    cv2.circle(layers[0], (w // 2, horizon), radius, 0.68 + 0.28 * morph, -1, cv2.LINE_AA)
    _skyline(layers[1], rng, horizon + round(h * 0.12), 0.42 + 0.24 * morph)
    _perspective_grid(layers[2], (w // 2, horizon), h, 0.3 + 0.7 * morph, 0.62)
    _line(layers[3], [(0, horizon), (w, horizon)], 0.94, max(1, round(h * 0.005)))


def _locked_plate(chapter: LegacyChapter, shape: tuple[int, int], state: dict) -> WorldFrame | None:
    if not chapter.plate:
        return None
    path = Path(chapter.plate).expanduser()
    if not path.exists():
        return None
    key = (str(path.resolve()), shape)
    cache = state.setdefault("world_plate_cache", {})
    if key in cache:
        result, violet, red, rgb = cache[key]
        state["world_plate_violet"] = violet
        state["world_plate_red"] = red
        state["world_plate_rgb"] = rgb
        return result
    source_color = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if source_color is None:
        return None
    source = cv2.cvtColor(source_color, cv2.COLOR_BGR2GRAY)
    height, width = shape
    scale = max(width / source.shape[1], height / source.shape[0])
    resized = cv2.resize(source, (round(source.shape[1] * scale), round(source.shape[0] * scale)),
                         interpolation=cv2.INTER_AREA)
    resized_color = cv2.resize(
        source_color, (round(source.shape[1] * scale), round(source.shape[0] * scale)),
        interpolation=cv2.INTER_AREA,
    )
    y0 = max(0, (resized.shape[0] - height) // 2)
    x0 = max(0, (resized.shape[1] - width) // 2)
    plate = resized[y0:y0 + height, x0:x0 + width].astype(np.float32) / 255.0
    plate_color = resized_color[y0:y0 + height, x0:x0 + width]
    plate_rgb = cv2.cvtColor(plate_color, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    low, high = np.percentile(plate, [3, 99])
    plate = np.clip((plate - low) / max(1e-5, high - low), 0.0, 1.0)

    # A locked plate can be either screen art (bright subject on dark) or a
    # scanned/printed drawing (dark ink on a light sheet).  Treat the dominant
    # surface as empty space so both enter the glyph renderer with the same
    # contract: higher luminance means more authored subject, not more paper.
    # The old implementation interpreted the white stock of a print as a solid
    # wall of glyphs and made its actual black engraving disappear.
    border_h = max(1, round(height * 0.06))
    border_w = max(1, round(width * 0.06))
    border = np.concatenate((plate[:border_h].ravel(), plate[-border_h:].ravel(),
                             plate[:, :border_w].ravel(), plate[:, -border_w:].ravel()))
    subject = 1.0 - plate if float(np.median(border)) > 0.56 else plate
    subject = np.clip(subject, 0.0, 1.0).astype(np.float32)
    edge = cv2.Canny((subject * 255).astype(np.uint8), 44, 124).astype(np.float32) / 255.0
    detail = cv2.GaussianBlur(subject, (0, 0), 0.72)
    hero = np.clip((detail - 0.18) * 1.48 + edge * 0.62, 0.0, 1.0)
    depth = np.clip(0.10 + detail * 0.78 + cv2.GaussianBlur(edge, (0, 0), 3.2) * 0.24,
                    0.0, 1.0)
    result = WorldFrame(np.clip(subject * 0.86 + edge * 0.34, 0.0, 1.0), depth, hero)
    hsv = cv2.cvtColor(plate_color, cv2.COLOR_BGR2HSV)
    violet = (((hsv[..., 0] >= 116) & (hsv[..., 0] <= 156) &
               (hsv[..., 1] >= 52))).astype(np.float32)
    red = ((((hsv[..., 0] <= 12) | (hsv[..., 0] >= 171)) &
            (hsv[..., 1] >= 62))).astype(np.float32)
    violet = cv2.GaussianBlur(violet, (0, 0), 0.52)
    red = cv2.GaussianBlur(red, (0, 0), 0.52)
    state["world_plate_violet"] = violet
    state["world_plate_red"] = red
    state["world_plate_rgb"] = plate_rgb
    cache[key] = (result, violet, red, plate_rgb)
    return result


def _camera(layer: np.ndarray, camera: str, local: float, depth: float,
            t: float, seed: int) -> np.ndarray:
    h, w = layer.shape
    eased = float(easing.cubic_in_out(local))
    drift = math.sin(t * 0.17 + (seed % 113) * 0.07)
    scale = 1.0
    dx = drift * w * 0.012 * depth
    dy = math.cos(t * 0.13 + seed * 0.01) * h * 0.006 * depth
    angle = 0.0
    if camera in {"push", "push-in"}:
        scale += eased * 0.075 * depth
    elif camera in {"pull", "pull-out"}:
        scale += (1.0 - eased) * 0.075 * depth
    elif camera == "orbit":
        angle = (-1.6 + 3.2 * eased) * depth
    elif camera == "drift":
        dx += (eased - 0.5) * w * 0.04 * depth
    elif camera == "rack" and depth < 0.55:
        layer = cv2.GaussianBlur(layer, (0, 0), 1.8 * abs(eased - 0.5))
    matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, scale)
    matrix[:, 2] += (dx, dy)
    return cv2.warpAffine(layer, matrix, (w, h), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT)


def _camera_rgb(layer: np.ndarray, camera: str, local: float, depth: float,
                t: float, seed: int) -> np.ndarray:
    """Gentle full-colour camera move with reflected paper beyond the crop."""
    h, w = layer.shape[:2]
    eased = float(easing.cubic_in_out(local))
    drift = math.sin(t * 0.17 + (seed % 113) * 0.07)
    scale = 1.018
    dx = drift * w * 0.008 * depth
    dy = math.cos(t * 0.13 + seed * 0.01) * h * 0.004 * depth
    angle = 0.0
    if camera in {"push", "push-in"}:
        scale += eased * 0.045 * depth
    elif camera in {"pull", "pull-out"}:
        scale += (1.0 - eased) * 0.045 * depth
    elif camera == "orbit":
        angle = (-0.72 + 1.44 * eased) * depth
    elif camera == "drift":
        dx += (eased - 0.5) * w * 0.024 * depth
    elif camera == "rack" and depth < 0.55:
        layer = cv2.GaussianBlur(layer, (0, 0), 0.9 * abs(eased - 0.5))
    matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, scale)
    matrix[:, 2] += (dx, dy)
    return cv2.warpAffine(layer, matrix, (w, h), flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REFLECT101)


def _animate_locked_plate(base: WorldFrame, chapter: LegacyChapter, t: float,
                          progress: float) -> WorldFrame:
    """Turn one approved illustration into a restrained multi-plane shot.

    The decomposition is deterministic and derived from the plate's own tonal
    depth map.  A faint stationary foundation prevents seams while four
    feathered planes move at different rates; the result has genuine parallax
    without hallucinating or redrawing a human-approved key frame.
    """
    shot = semantic.active_shot(chapter, progress)
    composed = base.luminance * 0.26
    hero = base.hero_mask * 0.18
    depth_map = base.depth * 0.40
    bands = ((0.08, 0.34, 0.22), (0.25, 0.55, 0.43),
             (0.46, 0.76, 0.68), (0.67, 1.01, 0.96))
    blur_sigma = max(0.7, min(base.luminance.shape) / 420.0)
    for index, (lower, upper, plane_depth) in enumerate(bands):
        mask = ((base.depth >= lower) & (base.depth < upper)).astype(np.float32)
        mask = cv2.GaussianBlur(mask, (0, 0), blur_sigma)
        layer = base.luminance * np.clip(mask * 1.24, 0.0, 1.0)
        moved = _camera(layer, shot.camera, shot.local, plane_depth, t,
                        chapter.seed + 1301 + index * 131)
        composed = _screen(composed, moved * (0.70 + index * 0.045))

        moved_depth = _camera(base.depth * mask, shot.camera, shot.local,
                              plane_depth, t, chapter.seed + 1709 + index * 131)
        depth_map = np.maximum(depth_map, moved_depth)
        if index >= 2:
            moved_hero = _camera(base.hero_mask * mask, shot.camera, shot.local,
                                 plane_depth, t, chapter.seed + 2027 + index * 131)
            hero = np.maximum(hero, moved_hero)

    # The ink settles over the first beat of each chapter like a press coming
    # into register.  It never fades to zero, avoiding an exposure pump.
    settle = 0.76 + 0.24 * float(easing.cubic_out(np.clip(progress / 0.13, 0.0, 1.0)))
    return WorldFrame(np.clip(composed * settle, 0.0, 1.0),
                      np.clip(depth_map, 0.0, 1.0), np.clip(hero, 0.0, 1.0))


def _animate_plate_separation(mask: np.ndarray, depth: np.ndarray,
                              chapter: LegacyChapter, t: float,
                              progress: float) -> np.ndarray:
    """Move a spot-colour separation with the same planes as its ink drawing."""
    if not np.any(mask > 0.01):
        return mask
    shot = semantic.active_shot(chapter, progress)
    composed = mask * 0.26
    bands = ((0.08, 0.34, 0.22), (0.25, 0.55, 0.43),
             (0.46, 0.76, 0.68), (0.67, 1.01, 0.96))
    blur_sigma = max(0.7, min(mask.shape) / 420.0)
    for index, (lower, upper, plane_depth) in enumerate(bands):
        band = ((depth >= lower) & (depth < upper)).astype(np.float32)
        band = cv2.GaussianBlur(band, (0, 0), blur_sigma)
        layer = mask * np.clip(band * 1.24, 0.0, 1.0)
        moved = _camera(layer, shot.camera, shot.local, plane_depth, t,
                        chapter.seed + 1301 + index * 131)
        composed = _screen(composed, moved * (0.70 + index * 0.045))
    return np.clip(composed, 0.0, 1.0)


def _animate_plate_rgb(rgb: np.ndarray, depth: np.ndarray,
                       chapter: LegacyChapter, t: float,
                       progress: float) -> np.ndarray:
    """Preserve the complete illustration while giving its ink real depth.

    The whole approved plate receives a quiet editorial camera move.  Three
    feathered subject bands then travel a little farther, creating parallax
    without cutting the image into visible cardboard layers or rebuilding it
    as glyphs.
    """
    shot = semantic.active_shot(chapter, progress)
    output = _camera_rgb(rgb, shot.camera, shot.local, 0.30, t, chapter.seed + 887)
    bands = ((0.28, 0.52, 0.42, 0.18), (0.44, 0.74, 0.68, 0.27),
             (0.64, 1.01, 0.96, 0.38))
    blur_sigma = max(1.0, min(depth.shape) / 340.0)
    for index, (lower, upper, plane_depth, strength) in enumerate(bands):
        mask = ((depth >= lower) & (depth < upper)).astype(np.float32)
        mask = cv2.GaussianBlur(mask, (0, 0), blur_sigma)
        moved_mask = _camera(mask, shot.camera, shot.local, plane_depth, t,
                             chapter.seed + 2503 + index * 149)
        moved_rgb = _camera_rgb(rgb, shot.camera, shot.local, plane_depth, t,
                                chapter.seed + 2503 + index * 149)
        alpha = np.clip(moved_mask * strength, 0.0, 0.68)[:, :, None]
        output = output * (1.0 - alpha) + moved_rgb * alpha
    return np.clip(output, 0.0, 1.0).astype(np.float32)


def _narrative_light(shape: tuple[int, int], lighting: str, morph: float,
                     seed: int) -> np.ndarray:
    h, w = shape
    yy, xx = np.meshgrid(np.arange(h, dtype=np.float32), np.arange(w, dtype=np.float32), indexing="ij")
    if lighting in {"dawn", "iris-dawn"}:
        cx, cy = w * 0.5, h * 0.56
    elif lighting in {"underground-rake", "raking-evidence"}:
        cx, cy = w * 0.18, h * 0.40
    else:
        cx = w * (0.32 + (seed % 37) / 100.0)
        cy = h * 0.28
    radius = max(1.0, min(h, w) * (0.22 + 0.24 * morph))
    radial = np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2.0 * radius ** 2))
    beam_center = cx + (yy - cy) * (0.18 if "rake" in lighting else -0.06)
    beam = np.exp(-((xx - beam_center) ** 2) / (2.0 * max(2.0, w * 0.09) ** 2))
    falloff = np.clip(1.0 - np.abs(yy - cy) / max(1.0, h * 0.9), 0.0, 1.0)
    return np.clip(radial * 0.56 + beam * falloff * (0.18 + 0.30 * morph), 0.0, 1.0).astype(np.float32)


def render_world(chapter: LegacyChapter, shape: tuple[int, int], t: float,
                 progress: float, state: dict) -> WorldFrame:
    locked = _locked_plate(chapter, shape, state)
    if locked is not None:
        violet = state.get("world_plate_violet")
        red = state.get("world_plate_red")
        rgb = state.get("world_plate_rgb")
        if rgb is not None:
            state["world_plate_rgb"] = _animate_plate_rgb(
                rgb, locked.depth, chapter, t, progress,
            )
        if violet is not None:
            state["world_plate_violet"] = _animate_plate_separation(
                violet, locked.depth, chapter, t, progress,
            )
        if red is not None:
            state["world_plate_red"] = _animate_plate_separation(
                red, locked.depth, chapter, t, progress,
            )
        return _animate_locked_plate(locked, chapter, t, progress)

    height, width = shape
    y0, y1, x0, x1 = _stage_bounds(shape)
    sh, sw = max(1, y1 - y0), max(1, x1 - x0)
    layers = [np.zeros((sh, sw), dtype=np.float32) for _ in range(max(4, chapter.depth_layers))]
    rng = np.random.default_rng(chapter.seed)
    shot = semantic.active_shot(chapter, progress)
    morph = float(easing.cubic_out(np.clip((progress - 0.42) / 0.58, 0.0, 1.0)))
    world = chapter.world or "abstract-field"

    if world == "civic-plaza":
        _civic_plaza(layers, rng, progress, morph)
    elif world == "evidence-trail":
        _evidence_trail(layers, rng, progress, morph)
    elif world == "city-section":
        _city_section(layers, rng, progress, morph)
    elif world in {"attentive-crowd", "living-network"}:
        _attentive_crowd(layers, rng, progress, morph)
    elif world == "eye-city":
        _eye_city(layers, rng, progress, morph)
    elif world == "mechanical-orbit":
        _mechanical_orbit(layers, progress, morph, t * (0.22 + chapter.motion * 0.25))
    elif world == "fractured-monument":
        _fractured_monument(layers, rng, progress, morph)
    elif world in {"dawn-city", "fog-archive"}:
        _dawn_city(layers, rng, progress, morph)
    else:
        _civic_plaza(layers, rng, progress, morph)

    # Persistent atmosphere gives space without frame-random noise.
    yy, xx = np.meshgrid(
        np.linspace(-1.0, 1.0, sh, dtype=np.float32),
        np.linspace(-1.0, 1.0, sw, dtype=np.float32), indexing="ij",
    )
    atmosphere = 0.05 + 0.05 * (np.sin(xx * 5.0 + t * 0.08 + chapter.seed) *
                                np.cos(yy * 4.0 - t * 0.06))
    layers[0] = np.clip(layers[0] + atmosphere, 0.0, 1.0)

    depths = np.linspace(0.16, 1.0, len(layers), dtype=np.float32)
    composed = np.zeros((sh, sw), dtype=np.float32)
    depth_map = np.zeros((sh, sw), dtype=np.float32)
    hero = np.zeros((sh, sw), dtype=np.float32)
    for index, (layer, depth) in enumerate(zip(layers, depths)):
        moved = _camera(layer, shot.camera, shot.local, float(depth), t, chapter.seed + index * 97)
        composed = _screen(composed, np.clip(moved, 0.0, 1.0))
        visible = moved > 0.08
        depth_map[visible] = np.maximum(depth_map[visible], depth)
        if index >= len(layers) - 2:
            hero = np.maximum(hero, moved)

    light = _narrative_light((sh, sw), chapter.lighting, morph, chapter.seed)
    composed = _screen(composed, light * (0.12 + 0.28 * morph))
    depth_map = np.maximum(depth_map, light * 0.10)

    output = np.zeros((height, width), dtype=np.float32)
    output_depth = np.zeros_like(output)
    output_hero = np.zeros_like(output)
    output[y0:y1, x0:x1] = np.clip(composed, 0.0, 1.0)
    output_depth[y0:y1, x0:x1] = np.clip(depth_map, 0.0, 1.0)
    output_hero[y0:y1, x0:x1] = np.clip(hero, 0.0, 1.0)
    return WorldFrame(output, output_depth, output_hero)
