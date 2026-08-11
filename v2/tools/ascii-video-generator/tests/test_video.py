import subprocess
from pathlib import Path

import numpy as np
import pytest

from ascii_studio import video
from ascii_studio.storyboard.schema import Caption, Chapter, Storyboard, WordTiming


def _storyboard():
    chapters = [
        Chapter(id="01-network", label="01 / NETWORK", motif="network", keyword="K",
                texts=["uno"], primary="#fff", secondary="#fff", accent="#fff",
                anchors=["K"], metaphor="m", seed=5, density=0.5, motion=0.5,
                composition="mesh"),
        Chapter(id="02-horizon", label="02 / HORIZON", motif="horizon", keyword="C",
                texts=["dos"], primary="#fff", secondary="#fff", accent="#fff",
                anchors=["C"], metaphor="m", seed=6, density=0.5, motion=0.5,
                composition="path"),
    ]
    return Storyboard(title="T", slug="t", thesis="th", keywords=[], chapters=chapters)


def _ctx(**over):
    sb = _storyboard()
    ranges = {"01-network": (0.0, 1.0), "02-horizon": (1.0, 2.0)}
    caps = [Caption(0, 0.0, 2.0, "no fue un milagro", "01",
                    [WordTiming(0.0, 0.5, "no"), WordTiming(0.5, 1.0, "fue"),
                     WordTiming(1.0, 1.5, "un"), WordTiming(1.5, 2.0, "milagro")])]
    base = dict(storyboard=sb, captions=caps, ranges=ranges, logo_mask=None, url=None,
                intro_seal_seconds=0.0, look_name="plata", width=540, height=960,
                fps=6, crf=30)
    base.update(over)
    return video.RenderContext(**base)


def test_segments_snap_to_chapter_boundaries():
    ctx = _ctx()
    bounds = video.segment_bounds(ctx.ranges, ctx.storyboard.chapters, 2.0, 6, workers=2)
    assert bounds[0][0] == 0
    assert bounds[-1][1] == 12
    starts = [b[0] for b in bounds]
    assert 6 in starts, f"no segment starts at the chapter cut: {bounds}"


def test_segments_cover_every_frame_exactly_once():
    ctx = _ctx()
    bounds = video.segment_bounds(ctx.ranges, ctx.storyboard.chapters, 2.0, 6, workers=3)
    covered = []
    for start, end in bounds:
        covered.extend(range(start, end))
    assert covered == list(range(12))


def test_chapter_at_returns_progress():
    ctx = _ctx()
    index, chapter, progress = video.chapter_at(1.5, ctx.storyboard.chapters, ctx.ranges)
    assert index == 1 and chapter.id == "02-horizon"
    assert 0.4 < progress < 0.6


def test_chapter_at_holds_first_image_before_its_first_spoken_word():
    ctx = _ctx()
    first = ctx.storyboard.chapters[0]
    ctx.ranges[first.id] = (0.4, ctx.ranges[first.id][1])
    index, chapter, progress = video.chapter_at(0.1, ctx.storyboard.chapters, ctx.ranges)
    assert index == 0
    assert chapter.id == first.id
    assert progress == 0.0


def test_env_at_is_none_without_envelopes():
    ctx = _ctx()
    assert ctx.envelopes is None
    assert video._env_at(ctx, 0) is None


def test_env_at_slices_every_key_at_the_frame_index():
    ctx = _ctx(envelopes={
        "bass": np.array([0.1, 0.2, 0.3], dtype=np.float32),
        "beat": np.array([0.0, 1.0, 0.0], dtype=np.float32),
    })
    assert video._env_at(ctx, 1) == pytest.approx({"bass": 0.2, "beat": 1.0})


def test_env_at_is_safe_past_the_array_end():
    """Envelopes are built for `[0, duration]` inclusive; a frame_index one past
    that (rounding, or a caller-trimmed --render-seconds) must not crash."""
    ctx = _ctx(envelopes={"bass": np.array([0.5], dtype=np.float32)})
    assert video._env_at(ctx, 5) == pytest.approx({"bass": 0.0})


@pytest.mark.slow
def test_renders_with_envelopes_end_to_end(tmp_path):
    """The whole audio-reactive path through a real (if tiny) render: envelopes
    on the context must not break segment rendering or chapter transitions."""
    n = 13  # 2.0s at fps=6, inclusive
    envelopes = {
        "bass": np.linspace(0.0, 1.0, n, dtype=np.float32),
        "mid": np.linspace(1.0, 0.0, n, dtype=np.float32),
        "treble": np.full(n, 0.5, dtype=np.float32),
        "amplitude": np.full(n, 0.7, dtype=np.float32),
        "beat": np.zeros(n, dtype=np.float32),
        "voice": np.full(n, 0.3, dtype=np.float32),
    }
    out = tmp_path / "out.mp4"
    path = video.render_segment(_ctx(envelopes=envelopes), 0, 12, out)
    assert path.exists() and path.stat().st_size > 2000


def test_blas_is_pinned_for_the_render_path():
    """OpenBLAS defaults to one thread per core. The hot matmul is far too small to
    benefit, and under the worker pool it produced 144 threads on 12 cores: measured
    173ms/frame unpinned vs 108ms pinned, and 6.4 vs 18.4 fps effective across 6 procs."""
    import os
    import ascii_studio  # noqa: F401  -- importing the package must pin
    assert os.environ.get("OMP_NUM_THREADS") == "1"
    assert os.environ.get("OPENBLAS_NUM_THREADS") == "1"


@pytest.mark.slow
def test_renders_a_playable_video(tmp_path):
    out = tmp_path / "out.mp4"
    video.render_video(_ctx(), duration=2.0, out_path=out, workers=2)
    assert out.exists() and out.stat().st_size > 2000
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,nb_frames",
         "-of", "default=nw=1", str(out)],
        capture_output=True, text=True, check=True,
    ).stdout
    assert "width=540" in probe and "height=960" in probe


@pytest.mark.slow
def test_transition_spans_a_cut_inside_a_single_merged_segment(tmp_path):
    """workers=1 forces one segment covering both chapters, so the chapter cut
    (and its crossfade window) falls inside a single `render_segment` call --
    the path that promotes `pending` into `renderer` instead of resetting."""
    out = tmp_path / "out.mp4"
    path = video.render_segment(_ctx(), 0, 12, out)
    assert path.exists() and path.stat().st_size > 2000
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=nb_read_frames", "-count_frames",
         "-of", "default=nw=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    assert "nb_read_frames=12" in probe
