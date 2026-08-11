import time

import numpy as np
import pytest

from ascii_studio.render import glyphs

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


def _uniform(rows, cols, rgb):
    return np.tile(np.asarray(rgb, dtype=np.float32), (rows, cols, 1))


def test_blit_output_shape(atlas):
    grid = np.zeros((128, 120), dtype=np.int32)
    out = glyphs.blit(grid, atlas, _uniform(128, 120, [1, 1, 1]), _uniform(128, 120, [0, 0, 0]))
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.float32


def test_space_renders_pure_background(atlas):
    grid = np.zeros((4, 4), dtype=np.int32)
    bg = _uniform(4, 4, [0.1, 0.2, 0.3])
    out = glyphs.blit(grid, atlas, _uniform(4, 4, [1, 1, 1]), bg)
    assert np.allclose(out, np.array([0.1, 0.2, 0.3], dtype=np.float32), atol=1e-5)


def test_full_block_renders_pure_foreground(atlas):
    grid = np.full((4, 4), atlas.index("█"), dtype=np.int32)
    fg = _uniform(4, 4, [0.9, 0.4, 0.1])
    out = glyphs.blit(grid, atlas, fg, _uniform(4, 4, [0, 0, 0]))
    assert out.mean() > 0.4
    corner = out[2, 2]
    assert np.allclose(corner, [0.9, 0.4, 0.1], atol=0.05)


def test_upper_half_block_splits_the_cell(atlas):
    """Half-blocks are what give two independent colours per cell."""
    grid = np.full((1, 1), atlas.index("▀"), dtype=np.int32)
    out = glyphs.blit(grid, atlas, _uniform(1, 1, [1, 1, 1]), _uniform(1, 1, [0, 0, 0]))
    top = out[: out.shape[0] // 2].mean()
    bottom = out[out.shape[0] // 2:].mean()
    assert top > bottom + 0.3


def test_per_cell_colours_are_independent(atlas):
    grid = np.full((1, 2), atlas.index("█"), dtype=np.int32)
    fg = np.zeros((1, 2, 3), dtype=np.float32)
    fg[0, 0] = [1, 0, 0]
    fg[0, 1] = [0, 0, 1]
    out = glyphs.blit(grid, atlas, fg, np.zeros((1, 2, 3), dtype=np.float32))
    assert out[7, 4, 0] > 0.5 and out[7, 4, 2] < 0.5
    assert out[7, 13, 2] > 0.5 and out[7, 13, 0] < 0.5


def test_mismatched_shapes_are_rejected(atlas):
    with pytest.raises(ValueError):
        glyphs.blit(
            np.zeros((4, 4), dtype=np.int32),
            atlas,
            _uniform(4, 5, [1, 1, 1]),
            _uniform(4, 4, [0, 0, 0]),
        )


def test_per_cell_background_is_respected(atlas):
    """The 2D-composite path must not collapse bg into a single colour."""
    grid = np.full((1, 2), atlas.index("▀"), dtype=np.int32)
    fg = np.zeros((1, 2, 3), dtype=np.float32)
    bg = np.zeros((1, 2, 3), dtype=np.float32)
    fg[0, 0] = [1, 0, 0]; bg[0, 0] = [0, 1, 0]
    fg[0, 1] = [0, 0, 1]; bg[0, 1] = [1, 1, 0]
    out = glyphs.blit(grid, atlas, fg, bg)
    cell_h, cell_w = atlas.tiles.shape[1:]
    top, bottom = cell_h // 4, (cell_h * 3) // 4
    assert np.allclose(out[top, cell_w // 2], [1, 0, 0], atol=0.05)      # cell 0 fg
    assert np.allclose(out[bottom, cell_w // 2], [0, 1, 0], atol=0.05)   # cell 0 bg
    assert np.allclose(out[top, cell_w + cell_w // 2], [0, 0, 1], atol=0.05)   # cell 1 fg
    assert np.allclose(out[bottom, cell_w + cell_w // 2], [1, 1, 0], atol=0.05) # cell 1 bg


def test_blit_is_fast_enough_for_video(atlas):
    """2D-composite blit (no 5-D intermediate) measured ~16.6ms per frame on this
    machine; the old 5-D-broadcast implementation measured ~35ms. Budget: under
    30ms for a full frame. That headroom over the ~16.6ms measured figure is
    deliberate -- this runs inside a full suite, where best-of-7 alone still flaked
    once against a tighter 25ms threshold -- while still guarding against a
    regression back toward the 35ms 5-D path."""
    grid = np.random.default_rng(0).integers(0, len(atlas.chars), (128, 120)).astype(np.int32)
    fg = np.random.default_rng(1).random((128, 120, 3)).astype(np.float32)
    bg = np.zeros((128, 120, 3), dtype=np.float32)
    glyphs.blit(grid, atlas, fg, bg)  # warm up
    # Best-of-N, not mean: a mean measures whatever else the machine was doing, so it
    # flaked ~1 run in 4 under full-suite load. The minimum measures what the code can
    # do, which is the thing a performance regression would actually change.
    best = min(
        _time_once(lambda: glyphs.blit(grid, atlas, fg, bg))
        for _ in range(7)
    )
    assert best < 0.030, f"blit took {best * 1000:.1f}ms"


def _time_once(call) -> float:
    start = time.perf_counter()
    call()
    return time.perf_counter() - start
