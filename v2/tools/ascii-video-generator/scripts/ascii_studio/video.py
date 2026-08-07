"""Full render loop with a chapter-aligned worker pool.

Segment boundaries are snapped to chapter cuts so per-segment glyph hysteresis state
never has to carry across a cut -- a mid-chapter split would show one flickering frame
where the worker's history restarts.

CHAPTER TRANSITIONS: the last `TRANSITION_SECONDS` of every chapter (except the last)
crossfade into the next chapter -- `tr_wipe(direction="radial")` when the incoming
chapter is a `horizon` motif, `tr_crossfade` otherwise. A transition needs a real
rendered frame from BOTH chapters at the same instant, but `Renderer` carries
chapter-scoped state (glyph hysteresis, the scene composer's FeedbackBuffer) that must
not mix between chapters. `render_segment` resolves this with a second, lazily-created
`Renderer` (`pending`) dedicated to previewing the incoming chapter's opening frames
during the outgoing chapter's tail; because `segment_bounds` snaps every segment
boundary to a chapter cut, a transition's pre-cut half is always rendered inside the
same segment as the rest of its outgoing chapter, so `pending` never needs frames from
a different worker. If the cut itself falls inside this segment too (a worker segment
that spans more than one whole chapter), `pending` -- which has been accumulating that
next chapter's own state throughout the preview window -- is promoted to be the new
primary renderer at the cut, instead of starting a third, state-fresh `Renderer`; that
preserves the incoming chapter's feedback trail across the exact frame the crossfade
finishes on. If the cut falls in a different segment (the far more common case, one
chapter per segment or per worker), that segment's own `frames()` call simply starts
a fresh `Renderer` for it in the ordinary way -- there is nothing to hand off across a
process boundary, so nothing is lost by not trying.
"""

from __future__ import annotations

import math
import subprocess
import tempfile
from dataclasses import asdict, dataclass
from multiprocessing import Pool
from pathlib import Path
from typing import Sequence

import numpy as np

from .render import seal as seal_mod
from .render import transitions
from .render import typography
from .render.frames import Renderer
from .render.tokens import load_look
from .scene.legacy import LegacyChapter
from .speech.captions import active_caption
from .storyboard.schema import Chapter, Storyboard
from .text import word_core

TRANSITION_SECONDS = 0.4


@dataclass
class RenderContext:
    storyboard: Storyboard
    captions: list
    ranges: dict
    logo_mask: np.ndarray | None
    url: str | None
    intro_seal_seconds: float
    cold_open_seconds: float = 1.25
    look_name: str = "plata"
    width: int = 1080
    height: int = 1920
    fps: int = 30
    crf: int = 20
    scene: str = "composer"
    envelopes: dict[str, np.ndarray] | None = None
    """Per-frame audio-reactive drive signals (`audio.score.score_envelopes` plus
    `voice_envelope`, merged into one dict), one array per key at `fps`, indexed
    directly by `frame_index`. `None` (the default) renders exactly the
    pre-existing, non-audio-reactive pipeline -- see `_env_at`."""


def chapter_at(t: float, chapters: Sequence[Chapter], ranges: dict) -> tuple[int, Chapter, float]:
    for index, chapter in enumerate(chapters):
        start, end = ranges[chapter.id]
        if start <= t <= end or index == len(chapters) - 1:
            return index, chapter, float(np.clip((t - start) / max(0.01, end - start), 0.0, 1.0))
    return 0, chapters[0], 0.0


def _as_legacy(chapter: Chapter, reveal_points: dict[str, float] | None = None) -> LegacyChapter:
    return LegacyChapter(
        motif=chapter.motif, keyword=chapter.keyword, anchors=list(chapter.anchors),
        seed=chapter.seed, density=chapter.density, motion=chapter.motion,
        text=" ".join(chapter.texts),
        composition=chapter.composition, archetype=chapter.archetype,
        rhetoric=chapter.rhetoric, relations=[asdict(value) for value in chapter.relations],
        shots=[asdict(value) for value in chapter.shots],
        reveal_points=dict(reveal_points or {}), temperature=chapter.temperature,
        camera=chapter.camera,
        world=chapter.world, hero_subject=chapter.hero_subject, plate=chapter.plate,
        depth_layers=chapter.depth_layers, lighting=chapter.lighting,
        metamorphosis=chapter.metamorphosis,
    )


def reveal_points_for(chapter: Chapter, captions: Sequence, ranges: dict) -> dict[str, float]:
    """Bind storyboard labels to the exact normalized time of their spoken word."""
    start, end = ranges.get(chapter.id, (0.0, 1.0))
    span = max(0.01, end - start)
    timed_words = [
        word for caption in captions if caption.section == chapter.id for word in caption.words
    ]
    points: dict[str, float] = {}
    for label in chapter.anchors:
        wanted = word_core(chapter.reveal_words.get(label, ""))
        candidates = [wanted] if wanted else [word_core(value) for value in label.split()]
        match = next(
            (word for word in timed_words if word_core(word.text) in candidates),
            None,
        )
        if match is not None:
            points[label] = float(np.clip((match.start - start) / span, 0.0, 1.0))
    return points


def segment_bounds(ranges: dict, chapters: Sequence[Chapter], duration: float,
                    fps: int, workers: int) -> list[tuple[int, int]]:
    """Frame ranges for each worker, snapped to chapter cuts."""
    total = max(1, math.ceil(duration * fps))
    cuts = sorted({0, total} | {
        min(total, int(round(ranges[c.id][0] * fps))) for c in chapters
    })
    if workers <= 1 or len(cuts) <= 2:
        return [(0, total)]

    # Merge adjacent chapter spans until we have at most `workers` segments.
    spans = [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1) if cuts[i + 1] > cuts[i]]
    while len(spans) > workers:
        shortest = min(range(len(spans) - 1), key=lambda i: spans[i][1] - spans[i][0])
        merged = (spans[shortest][0], spans[shortest + 1][1])
        spans[shortest:shortest + 2] = [merged]
    return spans


def _encode(frames_iter, width: int, height: int, fps: int, crf: int, out_path: Path) -> Path:
    cmd = [
        "ffmpeg", "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}", "-r", str(fps), "-i", "-", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
        "-pix_fmt", "yuv420p", str(out_path),
    ]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    assert process.stdin is not None
    for frame in frames_iter:
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed writing {out_path}")
    return out_path


def _extra_for(ctx: RenderContext, renderer: Renderer, chapter: Chapter, t: float) -> np.ndarray | None:
    extra = None
    seal_t = t - ctx.cold_open_seconds
    if ctx.intro_seal_seconds > 0 and 0.0 <= seal_t < ctx.intro_seal_seconds:
        extra = seal_mod.seal_luminance(ctx.logo_mask, renderer.grid, seal_t, ctx.intro_seal_seconds)
    return extra


def _env_at(ctx: RenderContext, frame_index: int) -> dict[str, float] | None:
    """This frame's scalar audio-reactive envelope, sliced out of `ctx.envelopes`'
    per-key arrays. `None` when the context has no envelopes at all (older
    callers, or `--tts none`), so `Renderer.frame` takes its unmodulated path."""
    if not ctx.envelopes:
        return None
    out = {}
    for key, values in ctx.envelopes.items():
        out[key] = float(values[frame_index]) if 0 <= frame_index < len(values) else 0.0
    return out


def _transition(a: np.ndarray, b: np.ndarray, blend_t: float, chapter: Chapter) -> np.ndarray:
    transition = chapter.shots[0].transition if chapter.shots else (
        "iris" if chapter.motif == "horizon" else "crossfade"
    )
    if transition == "iris":
        return transitions.tr_wipe(a, b, blend_t, direction="radial")
    if transition == "wipe-h":
        return transitions.tr_wipe(a, b, blend_t, direction="h")
    if transition == "wipe-v":
        return transitions.tr_wipe(a, b, blend_t, direction="v")
    if transition == "glitch":
        return transitions.tr_glitch_cut(a, b, blend_t, seed=chapter.seed)
    return transitions.tr_crossfade(a, b, blend_t)


def render_segment(ctx: RenderContext, start_frame: int, end_frame: int, out_path: Path) -> Path:
    look = load_look(ctx.look_name)
    renderer = Renderer(look, ctx.width, ctx.height, scene=ctx.scene)
    chapters = ctx.storyboard.chapters
    reveal_cache = {
        chapter.id: reveal_points_for(chapter, ctx.captions, ctx.ranges)
        for chapter in chapters
    }
    previous_index = -1
    # A `Renderer` dedicated to previewing the NEXT chapter's opening frames during
    # the current chapter's last `TRANSITION_SECONDS`, so the crossfade/wipe has a
    # real frame from both chapters instead of guessing. See the module docstring
    # for why this needs its own state and when it gets promoted vs. discarded.
    pending: Renderer | None = None

    def frames():
        nonlocal previous_index, pending, renderer
        for frame_index in range(start_frame, end_frame):
            t = frame_index / ctx.fps
            index, chapter, progress = chapter_at(t, chapters, ctx.ranges)
            if index != previous_index:
                if pending is not None:
                    # The cut landed inside this same segment: `pending` has been
                    # rendering this chapter's own frames (with its own hysteresis
                    # + FeedbackBuffer state) throughout the just-finished
                    # crossfade, so promoting it keeps that state continuous
                    # across the cut instead of restarting it from scratch.
                    renderer = pending
                else:
                    renderer.reset()
                pending = None
                previous_index = index

            extra = _extra_for(ctx, renderer, chapter, t)
            env = _env_at(ctx, frame_index)
            chapter_scene = _as_legacy(chapter, reveal_cache[chapter.id])
            frame = renderer.frame(chapter_scene, t, progress, frame_index, extra=extra, env=env)

            if index < len(chapters) - 1:
                cut_start, cut_end = ctx.ranges[chapter.id]
                time_to_cut = cut_end - t
                if 0.0 <= time_to_cut < TRANSITION_SECONDS:
                    next_chapter = chapters[index + 1]
                    if pending is None:
                        pending = Renderer(look, ctx.width, ctx.height, scene=ctx.scene)
                        pending.reset()
                    incoming = pending.frame(
                        _as_legacy(next_chapter, reveal_cache[next_chapter.id]), t, 0.0, frame_index,
                        extra=_extra_for(ctx, pending, next_chapter, t), env=env,
                    )
                    blend_t = 1.0 - (time_to_cut / TRANSITION_SECONDS)
                    frame = _transition(frame, incoming, blend_t, next_chapter)

            yield typography.overlay(
                frame, renderer.grid, renderer.look,
                caption=active_caption(ctx.captions, t), t=t,
                title=ctx.storyboard.title, chapter_label=chapter.label,
                chapter_index=index, chapter_count=len(chapters), progress=progress,
                keyword=chapter.keyword, url=ctx.url, scene_chapter=chapter_scene,
                hook=ctx.storyboard.hook, cold_open_seconds=ctx.cold_open_seconds,
            )

    return _encode(frames(), ctx.width, ctx.height, ctx.fps, ctx.crf, out_path)


def _pool_init() -> None:
    # Each worker process renders one segment on one core. Two libraries in the
    # render path default to spreading their own operations across every core they
    # can see, so N worker processes would otherwise start N * cpu_count() extra
    # threads and fight each other -- and the OS scheduler -- for the same cores:
    #
    # - numpy's BLAS backend (OpenBLAS here) is the dominant one. The hot loop is a
    #   small glyph best-match matmul (~15k x 32 @ 32 x 62) that is far too small to
    #   benefit from 12-way threading; under a 6-worker pool that was 6 x 12 = 72
    #   BLAS threads alone contending for 12 cores. Pinning is done package-wide in
    #   `ascii_studio/__init__.py` (must happen before numpy is ever imported, see
    #   `ascii_studio._threads`) -- on macOS's `spawn` start method that already
    #   covers this Pool's workers, since unpickling this module's `_pool_init` as
    #   the initializer imports the `ascii_studio` package first. It is repeated
    #   here too, cheaply, as defense in depth against any entry point that manages
    #   to import numpy before the `ascii_studio` package does.
    # - cv2 is the secondary one and is pinned directly below. (A prior investigation
    #   attributed the pool's poor scaling to this machine's asymmetric M3 Pro
    #   performance/efficiency cores; that diagnosis was wrong -- it looked at cv2's
    #   thread pool but not numpy's BLAS backend, which is where almost all of the
    #   1.6x-3x measured slowdown actually came from.)
    from ._threads import pin_blas_threads
    pin_blas_threads(1)

    import cv2
    cv2.setNumThreads(1)


def _segment_worker(payload):
    ctx, start, end, path = payload
    return str(render_segment(ctx, start, end, Path(path)))


def render_video(ctx: RenderContext, duration: float, out_path: Path,
                  workers: int | None = None) -> Path:
    workers = workers or min(8, max(1, len(ctx.storyboard.chapters)))
    bounds = segment_bounds(ctx.ranges, ctx.storyboard.chapters, duration, ctx.fps, workers)

    if len(bounds) == 1:
        return render_segment(ctx, bounds[0][0], bounds[0][1], out_path)

    with tempfile.TemporaryDirectory() as tmp:
        jobs = [
            (ctx, start, end, str(Path(tmp) / f"seg{i:03d}.mp4"))
            for i, (start, end) in enumerate(bounds)
        ]
        with Pool(processes=min(workers, len(jobs)), initializer=_pool_init) as pool:
            parts = pool.map(_segment_worker, jobs)

        listing = Path(tmp) / "segments.txt"
        listing.write_text("".join(f"file '{p}'\n" for p in parts), encoding="utf-8")
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
             "-c", "copy", str(out_path)],
            check=True, stderr=subprocess.DEVNULL,
        )
    return out_path
