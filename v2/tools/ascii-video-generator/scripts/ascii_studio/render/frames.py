"""Frame assembly: scene -> glyphs -> pixels -> grade."""

from __future__ import annotations

import cv2
import numpy as np

from ..scene import composer
from ..scene.legacy import LegacyChapter, compose
from . import asciify, color, glyphs, multiscale, post
from .canvas import Grid, make_grid
from .tokens import Look

SCENE_CHOICES = ("legacy", "composer")

_TONE_PCT_STRIDE = 4
"""Percentile tone mapping (`Renderer.frame`, replacing the old raw min/max
stretch) reads `look.tone_low_pct`/`tone_high_pct` off a strided subsample of
the luminance buffer, not the full array: measured ~103ms/frame for
`np.percentile` over a full 2160x3840 buffer against ~8ms at this stride --
over budget on its own. A 1-in-16-pixel sample (this stride on both axes) is
still tens of thousands of points, comfortably enough to estimate a 2nd/98th
percentile stably frame to frame; see `.superpowers/sdd/stunning.md` for the
measured before/after stage-zone brightness this fixed."""

_BEAT_CHROMATIC_PX = 1.0
"""Base pixel amount for the beat-driven chromatic-aberration kick
(`post.sh_chromatic`), applied as `_BEAT_CHROMATIC_PX * (0.4 + beat * 0.8)`.
`sh_chromatic` rounds its amount to a whole pixel and shifts with a hard
`np.roll` (no soft blend), and this field is dense with sharp glyph-cell
edges everywhere -- a visual check of a real render at the brief-suggested
1.5px showed a 1px fringe on literally every edge in literally every frame
(0.6px baseline rounds up to 1px), reading as a permanent filter, not a beat.
At 1.0, the 0.4 baseline (0.4px) rounds DOWN to 0 -- invisible between beats
-- and only a beat's own decay curve pushes the amount up past the
round-to-1px threshold (~beat > 0.5), for the few frames closest to an
onset. That is what makes this read as a kick instead of a look. Only
applied when the caller supplies an `env` (a real audio-reactive render):
benches/tests/stills that call `frame()` without `env` get exactly the
pre-existing pipeline, unchanged."""


def _smoothstep(value: float) -> float:
    value = float(np.clip(value, 0.0, 1.0))
    return value * value * (3.0 - 2.0 * value)


def _draw_polyline_fraction(
    layer: np.ndarray, points: np.ndarray, fraction: float,
    value: float, thickness: int,
) -> tuple[int, int]:
    """Draw a path by travelled distance and return its animated tip."""
    points = np.asarray(points, dtype=np.float32)
    if len(points) < 2:
        return tuple(points[0].astype(int)) if len(points) else (0, 0)
    segments = points[1:] - points[:-1]
    lengths = np.sqrt(np.sum(segments * segments, axis=1))
    total = float(lengths.sum())
    remaining = total * float(np.clip(fraction, 0.0, 1.0))
    tip = points[0]
    for index, length in enumerate(lengths):
        if remaining <= 0.0:
            break
        amount = min(1.0, remaining / max(1e-5, float(length)))
        end = points[index] + segments[index] * amount
        cv2.line(
            layer, tuple(np.rint(points[index]).astype(int)),
            tuple(np.rint(end).astype(int)), value, thickness, cv2.LINE_AA,
        )
        tip = end
        remaining -= float(length)
        if amount < 1.0:
            break
    return tuple(np.rint(tip).astype(int))


def _arrowhead(
    layer: np.ndarray, tip: tuple[int, int], direction: tuple[float, float],
    value: float, thickness: int,
) -> None:
    vector = np.asarray(direction, dtype=np.float32)
    norm = float(np.linalg.norm(vector))
    if norm <= 1e-5:
        return
    vector /= norm
    normal = np.asarray((-vector[1], vector[0]), dtype=np.float32)
    size = max(8, thickness * 4)
    tip_v = np.asarray(tip, dtype=np.float32)
    base = tip_v - vector * size
    for point in (base + normal * size * 0.48, base - normal * size * 0.48):
        cv2.line(layer, tip, tuple(np.rint(point).astype(int)), value,
                 thickness, cv2.LINE_AA)


def _polyline_point(points: np.ndarray, fraction: float) -> tuple[int, int]:
    """Return a stable distance-based point for a travelling editorial tracer."""
    points = np.asarray(points, dtype=np.float32)
    if len(points) < 2:
        return tuple(points[0].astype(int)) if len(points) else (0, 0)
    segments = points[1:] - points[:-1]
    lengths = np.sqrt(np.sum(segments * segments, axis=1))
    remaining = float(lengths.sum()) * float(np.clip(fraction, 0.0, 1.0))
    for index, length in enumerate(lengths):
        if remaining <= float(length):
            amount = remaining / max(1e-5, float(length))
            return tuple(np.rint(points[index] + segments[index] * amount).astype(int))
        remaining -= float(length)
    return tuple(np.rint(points[-1]).astype(int))


def _planned_graphic_layers(
    chapter: LegacyChapter, height: int, width: int, progress: float,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Build a multi-act editorial intervention, not a decorative one-line cue.

    Every approved object has four readable stages: register the area, construct
    the main relationship, reveal secondary structure, then send a tracer to a
    red point of consequence.  Returning separate pigment layers keeps the red
    semantic instead of manufacturing a colour fringe around every blue line.
    """
    primary = np.zeros((height, width), dtype=np.float32)
    echo = np.zeros((height, width), dtype=np.float32)
    punctuation = np.zeros((height, width), dtype=np.float32)
    for cue in chapter.graphic_cues:
        cue_id = str(cue.get("id", ""))
        start = float(chapter.reveal_points.get(f"graphic:{cue_id}:start", 1.01))
        end = float(chapter.reveal_points.get(f"graphic:{cue_id}:end", 1.0))
        if progress < start or progress > end + 0.08:
            continue
        span = max(0.012, end - start)
        local = float(np.clip((progress - start) / span, 0.0, 1.0))
        strength = _smoothstep(local / 0.14)
        if progress > end:
            strength *= 1.0 - _smoothstep((progress - end) / 0.08)
        region = cue.get("target_region", [])
        if not isinstance(region, (list, tuple)) or len(region) != 4:
            continue
        x0, y0, x1, y1 = [float(np.clip(value, 0.0, 1.0)) for value in region]
        left, top = round(x0 * width), round(y0 * height)
        right, bottom = round(x1 * width), round(y1 * height)
        if right - left < 8 or bottom - top < 8:
            continue

        kind = str(cue.get("kind", "relationship-path"))
        thickness = max(2, round(width * 0.0045))
        value = float(np.clip(strength, 0.0, 1.0))
        registration = _smoothstep(local / 0.16)
        construction = _smoothstep((local - 0.07) / 0.39)
        structure = _smoothstep((local - 0.30) / 0.30)
        trace = _smoothstep((local - 0.50) / 0.34)
        center = ((left + right) // 2, (top + bottom) // 2)
        node_radius = max(3, thickness * 2)

        # Quiet crop/registration marks establish where to look before the
        # semantic object begins to draw.
        corner = max(7, round(min(right - left, bottom - top) * 0.075 * registration))
        if corner:
            for x, y, sx, sy in (
                (left, top, 1, 1), (right, top, -1, 1),
                (left, bottom, 1, -1), (right, bottom, -1, -1),
            ):
                cv2.line(echo, (x, y), (x + sx * corner, y), value * 0.44,
                         max(1, thickness // 2), cv2.LINE_AA)
                cv2.line(echo, (x, y), (x, y + sy * corner), value * 0.44,
                         max(1, thickness // 2), cv2.LINE_AA)

        if kind == "feedback-loop":
            axes = (
                max(4, (right - left) // 2 - thickness),
                max(4, (bottom - top) // 2 - thickness),
            )
            angle_end = 18 + 320 * construction
            cv2.ellipse(primary, center, axes, 0, 18, angle_end, value,
                        thickness, cv2.LINE_AA)
            inner = (max(3, round(axes[0] * 0.73)), max(3, round(axes[1] * 0.73)))
            cv2.ellipse(echo, center, inner, 0, 198, 198 + 286 * structure,
                        value * 0.62, max(1, thickness // 2), cv2.LINE_AA)
            angle = np.deg2rad(angle_end)
            tip = (
                round(center[0] + axes[0] * np.cos(angle)),
                round(center[1] + axes[1] * np.sin(angle)),
            )
            tangent = (-axes[0] * np.sin(angle), axes[1] * np.cos(angle))
            if construction > 0.35:
                _arrowhead(primary, tip, tangent, value, thickness)
            if trace > 0.0:
                trace_angle = np.deg2rad(18 + 320 * trace)
                tracer = (
                    round(center[0] + axes[0] * np.cos(trace_angle)),
                    round(center[1] + axes[1] * np.sin(trace_angle)),
                )
                cv2.circle(punctuation, tracer, node_radius, value, -1, cv2.LINE_AA)
                cv2.circle(echo, center, round(node_radius * (1.2 + trace)),
                           value * 0.55, max(1, thickness // 2), cv2.LINE_AA)
        elif kind == "split-field":
            half = round((bottom - top) * 0.5 * construction)
            cv2.line(primary, (center[0], center[1] - half),
                     (center[0], center[1] + half), value, thickness, cv2.LINE_AA)
            branch = round((right - left) * 0.41 * structure)
            upper_y = top + round((bottom - top) * 0.22)
            lower_y = bottom - round((bottom - top) * 0.22)
            for y in (upper_y, lower_y):
                cv2.line(echo, (center[0] - branch, y), (center[0] + branch, y),
                         value * 0.72, max(1, thickness // 2), cv2.LINE_AA)
                cv2.line(echo, (center[0], y),
                         (center[0], center[1]), value * 0.54,
                         max(1, thickness // 2), cv2.LINE_AA)
            if trace > 0.0:
                side = -1 if int(trace * 8) % 2 == 0 else 1
                tracer = (center[0] + round(side * branch * trace),
                          upper_y if side < 0 else lower_y)
                cv2.circle(punctuation, tracer, node_radius, value, -1, cv2.LINE_AA)
        elif kind == "reveal-mask":
            reveal_corner = max(10, round(min(right - left, bottom - top) * 0.22 * construction))
            for x, y, sx, sy in (
                (left, top, 1, 1), (right, top, -1, 1),
                (left, bottom, 1, -1), (right, bottom, -1, -1),
            ):
                cv2.line(primary, (x, y), (x + sx * reveal_corner, y), value,
                         thickness, cv2.LINE_AA)
                cv2.line(primary, (x, y), (x, y + sy * reveal_corner), value,
                         thickness, cv2.LINE_AA)
            scan_x = round(left + (right - left) * structure)
            cv2.line(echo, (scan_x, top), (scan_x, bottom), value * 0.76,
                     max(1, thickness // 2), cv2.LINE_AA)
            if trace > 0.0:
                scan_y = round(top + (bottom - top) * trace)
                cv2.circle(punctuation, (scan_x, scan_y), node_radius, value,
                           -1, cv2.LINE_AA)
        elif kind == "subtraction-mask":
            diagonal_count = 9
            visible = max(1, round(diagonal_count * construction))
            for index in range(visible):
                offset = index / max(1, diagonal_count - 1)
                x = round(left + (right - left) * offset)
                cv2.line(primary, (x, bottom),
                         (min(right, x + (right - left) // 3), top),
                         value, thickness, cv2.LINE_AA)
            baseline_y = round(bottom - (bottom - top) * 0.12)
            cv2.line(echo, (left, baseline_y),
                     (round(left + (right - left) * structure), baseline_y),
                     value * 0.68, max(1, thickness // 2), cv2.LINE_AA)
            if trace > 0.0:
                x = round(left + (right - left) * trace)
                cv2.circle(punctuation, (x, baseline_y), node_radius, value,
                           -1, cv2.LINE_AA)
        elif kind == "bridge":
            xs = np.linspace(left, right, 32, dtype=np.float32)
            normalized = (xs - left) / max(1.0, right - left)
            ys = bottom - np.sin(normalized * np.pi) * (bottom - top) * 0.82
            points = np.stack((xs, ys), axis=1)
            tip = _draw_polyline_fraction(primary, points, construction, value, thickness)
            support_count = 5
            visible_supports = round(support_count * structure)
            for index in range(1, visible_supports + 1):
                position = index / (support_count + 1)
                support = _polyline_point(points, position)
                cv2.line(echo, support, (support[0], bottom), value * 0.62,
                         max(1, thickness // 2), cv2.LINE_AA)
            cv2.circle(primary, (left, bottom), node_radius, value, -1, cv2.LINE_AA)
            if construction > 0.96:
                cv2.circle(primary, (right, bottom), node_radius, value, -1, cv2.LINE_AA)
            if trace > 0.0:
                cv2.circle(punctuation, _polyline_point(points, trace), node_radius,
                           value, -1, cv2.LINE_AA)
        else:
            p0 = (left, bottom - thickness)
            p1 = (left + (right - left) // 3, top + (bottom - top) // 3)
            p2 = (left + round((right - left) * 0.70), top + round((bottom - top) * 0.58))
            p3 = (right, top + thickness)
            points = np.asarray([p0, p1, p2, p3], dtype=np.float32)
            tip = _draw_polyline_fraction(primary, points, construction, value, thickness)
            cv2.circle(primary, p0, node_radius, value, -1, cv2.LINE_AA)
            if construction > 0.96:
                cv2.circle(primary, p3, node_radius, value, -1, cv2.LINE_AA)
                _arrowhead(primary, tip, np.asarray(p3) - np.asarray(p2), value, thickness)
            node_count = 4
            for index in range(1, round(node_count * structure) + 1):
                node = _polyline_point(points, index / (node_count + 1))
                cv2.circle(echo, node, node_radius + thickness, value * 0.62,
                           max(1, thickness // 2), cv2.LINE_AA)
            if trace > 0.0:
                tracer = _polyline_point(points, trace)
                cv2.circle(punctuation, tracer, node_radius, value, -1, cv2.LINE_AA)
                cv2.circle(echo, tracer, round(node_radius * (1.4 + trace)),
                           value * 0.58, max(1, thickness // 2), cv2.LINE_AA)

    return (
        np.clip(primary, 0.0, 1.0),
        np.clip(echo, 0.0, 1.0),
        np.clip(punctuation, 0.0, 1.0),
    )


def _planned_graphics(
    chapter: LegacyChapter, height: int, width: int, progress: float,
) -> np.ndarray:
    """Compatibility view of the richer pigment-layer animation."""
    primary, echo, punctuation = _planned_graphic_layers(
        chapter, height, width, progress,
    )
    return np.clip(np.maximum.reduce((primary, echo * 0.78, punctuation)), 0.0, 1.0)


def _press_registration_entry(
    rgb: np.ndarray, progress: float, look: Look,
) -> np.ndarray:
    """A restrained press-registration settle at every exact image cut."""
    if progress >= 0.10:
        return rgb
    settle = _smoothstep(progress / 0.10)
    ghost = (1.0 - settle) * 0.075
    offset = max(0, round((1.0 - settle) * max(2, rgb.shape[1] * 0.004)))
    output = rgb.copy()
    if offset:
        violet = np.roll(rgb, -offset, axis=1)
        red = np.roll(rgb, offset, axis=1)
        output = output * (1.0 - ghost * 2.0)
        output += violet * ghost
        output += red * ghost
    # A single ink seam crosses the new plate and disappears as registration
    # locks; it adds a motivated transition without revealing the next image
    # before its first exact spoken word.
    seam_alpha = np.sin(settle * np.pi) * 0.34
    if seam_alpha > 0.01:
        x = min(rgb.shape[1] - 1, round(settle * rgb.shape[1]))
        seam = np.zeros(rgb.shape[:2], dtype=np.float32)
        cv2.line(seam, (x, 0), (x, rgb.shape[0] - 1), 1.0,
                 max(2, rgb.shape[1] // 240), cv2.LINE_AA)
        seam = cv2.GaussianBlur(seam, (0, 0), 0.7)[:, :, None] * seam_alpha
        pigment = look.accent_rgb()[None, None, :].astype(np.float32)
        output = output * (1.0 - seam) + pigment * seam
    return np.clip(output, 0.0, 1.0).astype(np.float32)


def _cobalt_pigment(
    shape: tuple[int, int], accent: np.ndarray, frame_index: int,
) -> np.ndarray:
    """Dense cobalt-indigo spot ink with paper tooth and a slow wet edge."""
    height, width = shape
    yy, xx = np.meshgrid(
        np.arange(height, dtype=np.float32),
        np.arange(width, dtype=np.float32),
        indexing="ij",
    )
    tooth = (
        np.sin(xx * 0.47 + yy * 0.071)
        + np.sin(xx * 0.093 - yy * 0.39)
    ) * 0.5
    wet_edge = 0.5 + 0.5 * np.sin((xx + yy * 0.24) * 0.024 - frame_index * 0.035)
    value = np.clip(0.86 + tooth * 0.055 + wet_edge * 0.045, 0.78, 0.98)
    pigment = accent[None, None, :] * value[:, :, None]
    return np.clip(pigment, 0.0, 1.0).astype(np.float32)


class Renderer:
    def __init__(
        self, look: Look, width: int = 1080, height: int = 1920, scene: str = "composer",
    ):
        if scene not in SCENE_CHOICES:
            raise ValueError(f"Unknown scene {scene!r}; choose one of {SCENE_CHOICES}")
        self.look = look
        self.scene = scene
        self.grid: Grid = make_grid(width, height, look)
        # A complete illustrated plate never enters glyph matching.  Building
        # the atlas here was pure work (and made every still/contact-sheet
        # worker pay for an ASCII resource it could not use).  Keep the safety
        # fallback for a missing plate, but create it only if that fallback is
        # actually reached.
        self.atlas = None if look.is_illustrated else glyphs.build_atlas(
            look.field_font, look.cell_w, look.cell_h, look.glyph_set
        )
        self._ramp = look.ramp_rgb()
        self._background = look.background_rgb()
        self._prev: np.ndarray | None = None
        self._scene_state: dict = {}

    def _glyph_atlas(self):
        if self.atlas is None:
            self.atlas = glyphs.build_atlas(
                self.look.field_font, self.look.cell_w, self.look.cell_h,
                self.look.glyph_set,
            )
        return self.atlas

    def reset(self) -> None:
        """Drop hysteresis + scene state. Call at a chapter cut so glyphs do not
        drag across and so a chapter's FeedbackBuffer trail does not bleed into
        the next chapter's opening frames."""
        self._prev = None
        self._scene_state = {}

    def _illustrated_frame(
        self, chapter: LegacyChapter, progress: float,
        extra: np.ndarray | None, frame_index: int,
    ) -> np.ndarray | None:
        """Print semantic graphics over a complete approved colour plate.

        This path deliberately bypasses glyph matching: the illustration stays
        whole, while only reviewed non-textual cues are absorbed into it as
        cobalt-indigo/red editorial marks. A look without an approved plate falls through
        to the ordinary glyph renderer; the production protocol prevents that
        fallback from being published accidentally.
        """
        plate = self._scene_state.get("world_plate_rgb")
        if plate is None:
            return None
        height, width = self.grid.buffer_shape()
        if plate.shape[:2] != (height, width):
            plate = cv2.resize(plate, (width, height), interpolation=cv2.INTER_CUBIC)
        rgb = np.clip(plate, 0.0, 1.0).astype(np.float32).copy()
        rgb = _press_registration_entry(rgb, progress, self.look)

        primary_mask, echo_mask, punctuation_mask = _planned_graphic_layers(
            chapter, height, width, progress,
        )
        union_mask = np.maximum.reduce((primary_mask, echo_mask, punctuation_mask))
        if np.any(union_mask > 0.001) and self.look.illustration_graphics > 0:
            # Cues live in a reviewed fraction of the frame.  Running Canny,
            # Gaussian blur and three RGB pigment blends over every empty pixel
            # roughly halved illustrated throughput.  Work on the exact nonzero
            # bounding box plus a small antialias/riso pad and write it back.
            bounds = cv2.boundingRect((union_mask > 0.001).astype(np.uint8))
            bx, by, bw, bh = bounds
            pad = max(4, int(round(self.look.riso_offset)) + 3)
            x0, y0 = max(0, bx - pad), max(0, by - pad)
            x1, y1 = min(width, bx + bw + pad), min(height, by + bh + pad)
            primary_roi = primary_mask[y0:y1, x0:x1]
            echo_roi = echo_mask[y0:y1, x0:x1]
            punctuation_roi = punctuation_mask[y0:y1, x0:x1]
            rgb_roi = rgb[y0:y1, x0:x1]
            edge = cv2.Canny((primary_roi * 255).astype(np.uint8), 38, 112)
            edge = cv2.GaussianBlur(edge.astype(np.float32) / 255.0, (0, 0), 0.55)
            strength = float(np.clip(self.look.illustration_graphics, 0.0, 1.0))
            cobalt = _cobalt_pigment(
                primary_roi.shape, self.look.accent_rgb().astype(np.float32), frame_index,
            )
            red = self.look.secondary_accent_rgb().astype(np.float32)
            cobalt_mask = np.clip(
                primary_roi * strength * 0.88 + edge * strength * 0.22,
                0.0, 0.94,
            )
            echo_alpha = np.clip(echo_roi * strength * 0.66, 0.0, 0.74)
            halo_mask = cv2.GaussianBlur(np.maximum(primary_roi, echo_roi), (0, 0), 1.05)
            halo_mask = np.clip(halo_mask * strength * 0.22, 0.0, 0.28)[:, :, None]
            red_mask = np.clip(punctuation_roi * strength * 0.92, 0.0, 0.94)
            # Pigment blend remains visible over both paper and dense black ink;
            # multiplicative darkening made semantic paths disappear in the
            # very engravings this mode is now designed around.
            cobalt_alpha = cobalt_mask[:, :, None]
            echo_alpha = echo_alpha[:, :, None]
            red_alpha = red_mask[:, :, None]
            graphite = np.array([0.18, 0.20, 0.29], dtype=np.float32)[None, None, :]
            paper = self.look.background_rgb().astype(np.float32)
            echo_pigment = np.clip(
                self.look.accent_rgb().astype(np.float32) * 0.76 + paper * 0.24,
                0.0, 1.0,
            )[None, None, :]
            rgb_roi = rgb_roi * (1.0 - halo_mask) + graphite * halo_mask
            rgb_roi = rgb_roi * (1.0 - echo_alpha) + echo_pigment * echo_alpha
            rgb_roi = rgb_roi * (1.0 - cobalt_alpha) + cobalt * cobalt_alpha
            rgb_roi = rgb_roi * (1.0 - red_alpha) + red[None, None, :] * red_alpha
            rgb[y0:y1, x0:x1] = rgb_roi

        # Intro seals and other authored luminance overlays remain real ink in
        # the illustrated mode instead of being silently discarded with ASCII.
        if extra is not None:
            extra_full = extra
            if extra.shape[:2] != (height, width):
                extra_full = cv2.resize(extra, (width, height), interpolation=cv2.INTER_LINEAR)
            ink_mask = np.clip(extra_full.astype(np.float32), 0.0, 1.0) * 0.88
            ink = self.look.ramp_rgb()[-1].astype(np.float32)
            rgb *= np.clip(
                1.0 - ink_mask[:, :, None] * (1.0 - ink[None, None, :]), 0.0, 1.0,
            )

        graded = post.grade(rgb, self.look, frame_index)
        return graded[:self.grid.height, :self.grid.width]

    def frame(
        self,
        chapter: LegacyChapter,
        t: float,
        progress: float,
        frame_index: int,
        extra: np.ndarray | None = None,
        env: dict[str, float] | None = None,
    ) -> np.ndarray:
        """`env`, when given, is this frame's audio-reactive envelope (see
        `audio.score.score_envelopes`/`voice_envelope`): `bass`/`mid`/`treble`/
        `voice` modulate the scene composition itself (passed through to
        `compose_scene`), `beat` drives a chromatic-aberration kick applied
        here, after the glyph/colour stage, since it needs the RGB frame.
        Omitting `env` (the default) renders exactly the pre-existing,
        non-audio-reactive pipeline -- every caller that does not yet have
        envelope data (bench, stills, tests) is unaffected.
        """
        # Illustrated plates are a renderer-level contract, independent of the
        # old procedural scene selector.  Previously `--scene legacy` silently
        # skipped plate loading and published an ASCII fallback even after the
        # plate had passed review.
        if self.look.is_illustrated:
            lum = composer.compose_scene(
                chapter, self.grid, t, progress, self.look, self._scene_state, env=env
            )
        elif self.scene == "legacy":
            lum = compose(chapter, self.grid, t, progress, self.look)
        else:
            lum = composer.compose_scene(
                chapter, self.grid, t, progress, self.look, self._scene_state, env=env
            )
        if extra is not None:
            lum = np.clip(lum + extra, 0.0, 1.0)

        if self.look.is_illustrated:
            illustrated = self._illustrated_frame(chapter, progress, extra, frame_index)
            if illustrated is not None:
                return illustrated

        # Percentile tone mapping: stretch [tone_low_pct, tone_high_pct] of the
        # buffer's own luminance distribution to 0..1, then apply tone_gamma.
        # A raw min/max stretch (the previous version of this line) lets a
        # handful of outlier pixels set the whole frame's exposure -- measured
        # a stage-zone mean of 64.9/255 against an intended silver look near
        # 19-26. Percentiles ignore those outliers, and the gamma then pulls
        # the mean the rest of the way down without crushing blacks or
        # reclipping the highlights the percentile step already preserved.
        # See `_TONE_PCT_STRIDE` for why this reads a subsample, not the full
        # buffer, and `.superpowers/sdd/stunning.md` for the measured fix.
        #
        # `scene/composer.py`'s keyword stencil (when active) reports its own
        # crop via `self._scene_state["stencil_bounds"]` (buffer-resolution
        # y0,x0,y1,x1) so it can be excluded from the sample here. Measured
        # regression without this exclusion: the stencil is a deliberately
        # blown-out ~6% of the frame, which dragged the 98th percentile up
        # enough to crush the OTHER 94% of the frame from a healthy mean
        # (~31/255) to ~8/255 -- a small bright region should not be allowed
        # to darken everything around it just by existing in the sample.
        bounds = self._scene_state.get("stencil_bounds")
        if bounds is not None:
            y0, x0, y1, x1 = bounds
            keep = np.ones(lum.shape[:2], dtype=bool)
            keep[y0:y1, x0:x1] = False
            keep_sample = keep[::_TONE_PCT_STRIDE, ::_TONE_PCT_STRIDE]
            sample = lum[::_TONE_PCT_STRIDE, ::_TONE_PCT_STRIDE][keep_sample]
            if sample.size == 0:
                sample = lum[::_TONE_PCT_STRIDE, ::_TONE_PCT_STRIDE]
        else:
            sample = lum[::_TONE_PCT_STRIDE, ::_TONE_PCT_STRIDE]
        lo, hi = np.percentile(sample, [self.look.tone_low_pct, self.look.tone_high_pct])
        span = float(hi) - float(lo)
        if span > 1e-6:
            lum_n = np.clip((lum - lo) / span, 0.0, 1.0)
        else:
            lum_n = np.zeros_like(lum)
        if self.look.tone_gamma != 1.0:
            lum_n = np.power(lum_n, self.look.tone_gamma, dtype=np.float32)
        lum_n = lum_n.astype(np.float32)

        # Global percentile mapping is excellent for atmospheric fields, but it
        # also restores contrast that the semantic composer intentionally
        # removed.  Reassert the diagram hierarchy after tone mapping: the field
        # remains visible edge-to-edge as low-key texture while nodes and typed
        # relationships become the unequivocal foreground.
        world_layer = self._scene_state.get("world_layer")
        world_depth = self._scene_state.get("world_depth")
        if world_layer is not None:
            world_full = cv2.resize(
                world_layer, (lum_n.shape[1], lum_n.shape[0]), interpolation=cv2.INTER_LINEAR,
            ).astype(np.float32)
            lum_n = np.maximum(lum_n * 0.52, np.clip(world_full * 0.94, 0.0, 1.0))

        semantic_layer = self._scene_state.get("semantic_layer")
        if semantic_layer is not None:
            semantic_full = cv2.resize(
                semantic_layer, (lum_n.shape[1], lum_n.shape[0]), interpolation=cv2.INTER_LINEAR,
            ).astype(np.float32)
            field_weight = 0.66 if world_layer is not None else 0.31
            semantic_weight = 0.86 if world_layer is not None else 1.18
            lum_n = np.maximum(lum_n * field_weight, np.clip(semantic_full * semantic_weight, 0.0, 1.0))

        depth_full = None
        if world_depth is not None:
            depth_full = cv2.resize(
                world_depth, (lum_n.shape[1], lum_n.shape[0]), interpolation=cv2.INTER_LINEAR,
            ).astype(np.float32)
        lum_n = multiscale.enhance(
            lum_n, self.grid, self.look.multiscale_detail if world_layer is not None else 0.0,
            depth=depth_full,
            depth_contrast=self.look.depth_contrast if world_layer is not None else 0.0,
        )
        if self.look.is_paper:
            # A press does not emit grey haze: weak atmosphere stays the colour of
            # the sheet while meaningful contours receive decisive ink.  This
            # shoulder removes the low field that reads beautifully as glow on a
            # dark screen but as dirty toner on paper.
            lum_n = np.clip((lum_n - 0.105) / 0.895, 0.0, 1.0).astype(np.float32)

        atlas = self._glyph_atlas()
        grid_idx = asciify.asciify(
            lum_n, self.grid, atlas, self.look, self._prev,
            orientation_weight=self.look.orientation_weight if world_layer is not None else 0.0,
        )
        self._prev = grid_idx

        cell_lum = cv2.resize(
            lum_n,
            (self.grid.cols, self.grid.rows),
            interpolation=cv2.INTER_AREA,
        ).astype(np.float32)

        # The chosen glyph already encodes the cell's tone through its own ink
        # coverage. Sampling the full ramp for colour would double-apply that tone
        # and crush the frame toward black, so colour is drawn from the ramp's
        # bright end only: glyph coverage carries the tone, colour stays bright and
        # only varies subtly for depth.
        v = self.look.tone_floor + (1.0 - self.look.tone_floor) * cell_lum
        fg = color.ramp_lookup(self._ramp, v).astype(np.float32)
        if self.look.is_paper:
            # Preserve authored spot-colour separations from approved print
            # plates after their luminance has been converted to glyphs.  This
            # keeps the asset genuinely ASCII while retaining the violet/red
            # riso topology that carries meaning in the illustration.
            violet_layer = self._scene_state.get("world_plate_violet")
            red_layer = self._scene_state.get("world_plate_red")
            if violet_layer is not None:
                violet = cv2.resize(
                    violet_layer, (self.grid.cols, self.grid.rows), interpolation=cv2.INTER_AREA,
                )[:, :, None]
                accent = self.look.accent_rgb().astype(np.float32)[None, None, :]
                fg = fg * (1.0 - violet * 0.92) + accent * (violet * 0.92)
            if red_layer is not None:
                red = cv2.resize(
                    red_layer, (self.grid.cols, self.grid.rows), interpolation=cv2.INTER_AREA,
                )[:, :, None]
                accent = self.look.secondary_accent_rgb().astype(np.float32)[None, None, :]
                fg = fg * (1.0 - red * 0.86) + accent * (red * 0.86)
        # Paper carries one disciplined ink system.  Chapter temperature is an
        # emissive-light device and would turn the canonical black into arbitrary
        # brown/blue pigments, so it remains exclusive to screen looks.
        if not self.look.is_paper:
            fg = color.temperature_shift(fg, chapter.temperature)
        bg = np.tile(self._background.astype(np.float32), (self.grid.rows, self.grid.cols, 1))

        rgb = glyphs.blit(grid_idx, atlas, fg, bg)

        if env is not None and not self.look.is_paper:
            beat = float(np.clip(env.get("beat", 0.0), 0.0, 1.0))
            rgb = post.sh_chromatic(rgb, _BEAT_CHROMATIC_PX * (0.4 + beat * 0.8))

        graded = post.grade(rgb, self.look, frame_index)
        return graded[:self.grid.height, :self.grid.width]
