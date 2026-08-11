import numpy as np
import pytest

from ascii_studio.render import frames, tokens
from ascii_studio.scene.legacy import LegacyChapter


@pytest.fixture(scope="module")
def renderer():
    return frames.Renderer(tokens.load_look("plata"))


def chapter():
    return LegacyChapter(motif="network", keyword="CONFIANZA",
                         anchors=["CONFIANZA"], seed=17, density=0.6, motion=0.5)


def test_frame_shape_and_dtype(renderer):
    out = renderer.frame(chapter(), 1.0, 0.3, 0)
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.uint8


def test_non_divisible_social_canvas_is_cropped_to_exact_dimensions():
    square = frames.Renderer(tokens.load_look("manifesto"), 100, 100)
    out = square.frame(chapter(), 1.0, 0.3, 0)
    assert out.shape == (100, 100, 3)


def test_frame_reaches_every_edge(renderer):
    """Quality gate from SKILL.md: the field must reach all four edges."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.float32)
    assert out[0, :, :].max() > 8
    assert out[-1, :, :].max() > 8
    assert out[:, 0, :].max() > 8
    assert out[:, -1, :].max() > 8


def test_frames_differ_over_time(renderer):
    renderer.reset()
    a = renderer.frame(chapter(), 0.0, 0.0, 0)
    b = renderer.frame(chapter(), 3.0, 0.4, 90)
    assert not np.array_equal(a, b)


def test_render_is_deterministic(renderer):
    renderer.reset()
    a = renderer.frame(chapter(), 1.0, 0.3, 5)
    renderer.reset()
    b = renderer.frame(chapter(), 1.0, 0.3, 5)
    assert np.array_equal(a, b)


def test_accent_is_not_everywhere(renderer):
    """The accent is reserved. It must not dominate the frame."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.int16)
    bluish = (out[:, :, 2] > out[:, :, 1] + 30) & (out[:, :, 0] > out[:, :, 1] + 10)
    assert bluish.mean() < 0.05


def test_frame_is_predominantly_neutral(renderer):
    """plata is a silver look: mean channel spread must stay small."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.float32)
    spread = abs(out[:, :, 0].mean() - out[:, :, 2].mean())
    assert spread < 12, spread


def test_reset_clears_hysteresis_state(renderer):
    renderer.reset()
    assert renderer._prev is None
    renderer.frame(chapter(), 1.0, 0.3, 0)
    assert renderer._prev is not None


def test_frame_is_not_nearly_black(renderer):
    """The v1-era bug: tone applied twice (glyph coverage AND colour) crushed the frame."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0)
    assert out.mean() > 18, f"frame mean {out.mean():.1f}/255 is too dark"
    assert np.percentile(out, 99) > 110, "no bright highlights anywhere"


def test_uniform_luminance_buffer_does_not_crash(renderer):
    """The normalisation guard: a constant buffer has zero span and must not divide by zero."""
    import numpy as np
    from ascii_studio.render import asciify
    flat = np.full(renderer.grid.buffer_shape(), 0.5, dtype=np.float32)
    span = float(flat.max()) - float(flat.min())
    lum = (flat - flat.min()) / span if span > 1e-6 else np.zeros_like(flat)
    out = asciify.asciify(lum, renderer.grid, renderer.atlas, renderer.look)
    assert out.shape == (renderer.grid.rows, renderer.grid.cols)


def test_exposure_is_stable_across_consecutive_frames(renderer):
    """Per-frame normalisation must not pump brightness between frames."""
    renderer.reset()
    means = [renderer.frame(chapter(), i / 30.0, i / 100.0, i).mean() for i in range(6)]
    spread = max(means) - min(means)
    assert spread < 6.0, f"frame brightness swings by {spread:.1f}/255 across 6 frames"


def test_beat_env_drives_a_chromatic_kick(renderer):
    """beat -> a brief chromatic-aberration kick (post.sh_chromatic), only when
    the caller actually supplies an envelope -- callers without one (bench,
    stills, every other test in this file) must render byte-identically to
    before this feature existed. At beat=0 the kick amount rounds down to a
    0px shift (see render/frames.py's `_BEAT_CHROMATIC_PX` docstring for why
    a visible always-on baseline was rejected), so a quiet envelope and no
    envelope at all must render identically too -- only an actual beat may
    change the frame."""
    renderer.reset()
    baseline = renderer.frame(chapter(), 1.0, 0.3, 0)
    renderer.reset()
    unmodulated = renderer.frame(chapter(), 1.0, 0.3, 0, env={"beat": 0.0})
    renderer.reset()
    kicked = renderer.frame(chapter(), 1.0, 0.3, 0, env={"beat": 1.0})
    assert np.array_equal(baseline, unmodulated), (
        "a quiet envelope (beat=0) must render identically to no envelope at all"
    )
    assert not np.array_equal(unmodulated, kicked), "a full beat must shift the aberration further"


def test_env_none_is_the_pre_audio_reactive_pipeline(renderer):
    renderer.reset()
    a = renderer.frame(chapter(), 1.0, 0.3, 0)
    renderer.reset()
    b = renderer.frame(chapter(), 1.0, 0.3, 0, env=None)
    assert np.array_equal(a, b)


def test_glyph_vocabulary_is_not_degenerate(renderer):
    """Flat shade blocks used to carpet 98% of cells, so the field read as blobs not characters."""
    from collections import Counter
    import cv2
    from ascii_studio.render import asciify
    from ascii_studio.scene.legacy import compose
    lum = compose(chapter(), renderer.grid, 1.0, 0.3, renderer.look)
    span = float(lum.max()) - float(lum.min())
    lum_n = (lum - lum.min()) / span
    grid = asciify.asciify(lum_n, renderer.grid, renderer.atlas, renderer.look)
    counts = Counter(grid.ravel())
    top_share = counts.most_common(1)[0][1] / grid.size
    assert top_share < 0.5, f"one glyph covers {top_share:.0%} of the frame"
    assert len(counts) >= 8, f"only {len(counts)} distinct glyphs used"
