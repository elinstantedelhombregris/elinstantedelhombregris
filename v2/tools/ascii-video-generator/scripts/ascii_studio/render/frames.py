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


def _planned_graphics(
    chapter: LegacyChapter, height: int, width: int, progress: float,
) -> np.ndarray:
    """Draw only approved, word-bound, non-textual interventions."""
    layer = np.zeros((height, width), dtype=np.float32)
    for cue in chapter.graphic_cues:
        cue_id = str(cue.get("id", ""))
        start = float(chapter.reveal_points.get(f"graphic:{cue_id}:start", 1.01))
        end = float(chapter.reveal_points.get(f"graphic:{cue_id}:end", 1.0))
        if progress < start or progress > end + 0.06:
            continue
        strength = _smoothstep((progress - start) / 0.075)
        if progress > end:
            strength *= 1.0 - _smoothstep((progress - end) / 0.06)
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
        center = ((left + right) // 2, (top + bottom) // 2)
        if kind == "feedback-loop":
            axes = (max(4, (right - left) // 2 - thickness), max(4, (bottom - top) // 2 - thickness))
            cv2.ellipse(layer, center, axes, 0, 18, 338, value, thickness, cv2.LINE_AA)
            tip = (right - thickness * 2, center[1] - thickness)
            cv2.line(layer, tip, (tip[0] - thickness * 3, tip[1] - thickness * 2), value,
                     thickness, cv2.LINE_AA)
        elif kind == "split-field":
            cv2.line(layer, (center[0], top), (center[0], bottom), value, thickness, cv2.LINE_AA)
            tick = max(8, (right - left) // 8)
            cv2.line(layer, (center[0] - tick, top), (center[0] + tick, top), value,
                     thickness, cv2.LINE_AA)
            cv2.line(layer, (center[0] - tick, bottom), (center[0] + tick, bottom), value,
                     thickness, cv2.LINE_AA)
        elif kind in {"subtraction-mask", "reveal-mask"}:
            cv2.rectangle(layer, (left, top), (right, bottom), value, thickness, cv2.LINE_AA)
            cv2.line(layer, (left, bottom), (right, top), value * 0.82, thickness, cv2.LINE_AA)
        else:
            p0 = (left, bottom - thickness)
            p1 = (left + (right - left) // 3, top + (bottom - top) // 3)
            p2 = (right, top + thickness)
            points = np.asarray([p0, p1, p2], dtype=np.int32)
            cv2.polylines(layer, [points], False, value, thickness, cv2.LINE_AA)
            radius = max(3, thickness * 2)
            cv2.circle(layer, p0, radius, value, -1, cv2.LINE_AA)
            cv2.circle(layer, p2, radius, value, -1, cv2.LINE_AA)
    return np.clip(layer, 0.0, 1.0)


class Renderer:
    def __init__(
        self, look: Look, width: int = 1080, height: int = 1920, scene: str = "composer",
    ):
        if scene not in SCENE_CHOICES:
            raise ValueError(f"Unknown scene {scene!r}; choose one of {SCENE_CHOICES}")
        self.look = look
        self.scene = scene
        self.grid: Grid = make_grid(width, height, look)
        self.atlas = glyphs.build_atlas(
            look.field_font, look.cell_w, look.cell_h, look.glyph_set
        )
        self._ramp = look.ramp_rgb()
        self._background = look.background_rgb()
        self._prev: np.ndarray | None = None
        self._scene_state: dict = {}

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
        violet/red editorial ink. A look without an approved plate falls through
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

        mask = _planned_graphics(chapter, height, width, progress)
        if np.any(mask > 0.001) and self.look.illustration_graphics > 0:
            edge = cv2.Canny((mask * 255).astype(np.uint8), 38, 112)
            edge = cv2.GaussianBlur(edge.astype(np.float32) / 255.0, (0, 0), 0.55)
            strength = float(np.clip(self.look.illustration_graphics, 0.0, 1.0))
            violet = self.look.accent_rgb().astype(np.float32)
            red = self.look.secondary_accent_rgb().astype(np.float32)
            violet_mask = np.clip(mask * strength * 0.78 + edge * strength * 0.42, 0.0, 0.92)
            red_mask = np.roll(edge, max(1, int(round(self.look.riso_offset))), axis=1)
            red_mask = np.clip(red_mask * strength * 0.22, 0.0, 0.28)
            rgb *= np.clip(
                1.0 - violet_mask[:, :, None] * (1.0 - violet[None, None, :]), 0.0, 1.0,
            )
            rgb *= np.clip(
                1.0 - red_mask[:, :, None] * (1.0 - red[None, None, :]), 0.0, 1.0,
            )

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
        if self.scene == "legacy":
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

        grid_idx = asciify.asciify(
            lum_n, self.grid, self.atlas, self.look, self._prev,
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

        rgb = glyphs.blit(grid_idx, self.atlas, fg, bg)

        if env is not None and not self.look.is_paper:
            beat = float(np.clip(env.get("beat", 0.0), 0.0, 1.0))
            rgb = post.sh_chromatic(rgb, _BEAT_CHROMATIC_PX * (0.4 + beat * 0.8))

        graded = post.grade(rgb, self.look, frame_index)
        return graded[:self.grid.height, :self.grid.width]
