import numpy as np
import pytest

from ascii_studio.render import asciify, canvas, glyphs, tokens

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"
FULL_COVERAGE_FONT = "/System/Library/Fonts/Menlo.ttc"


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


def test_bayer_is_zero_mean():
    assert abs(float(asciify.BAYER8.mean())) < 1e-6
    assert asciify.BAYER8.shape == (8, 8)


def test_black_buffer_is_all_space(grid, atlas, look):
    lum = np.zeros(grid.buffer_shape(), dtype=np.float32)
    out = asciify.asciify(lum, grid, atlas, look)
    assert out.shape == (grid.rows, grid.cols)
    assert np.all(out == 0)


def test_white_buffer_is_the_densest_glyph(grid, atlas, look):
    lum = np.ones(grid.buffer_shape(), dtype=np.float32)
    out = asciify.asciify(lum, grid, atlas, look)
    densest = atlas.tiles.reshape(len(atlas.chars), -1).mean(axis=1).argmax()
    assert np.all(out == densest)


def test_signature_count_matches_grid(grid, look):
    lum = np.zeros(grid.buffer_shape(), dtype=np.float32)
    sigs = asciify.cell_signatures(lum, grid, look.dither, look.dither_amplitude)
    assert sigs.shape == (grid.rows * grid.cols, glyphs.SIG_H * glyphs.SIG_W)


def test_horizontal_edge_picks_a_horizontal_glyph(grid, atlas, look):
    """The whole point of best-match: a horizontal bar must not become a blob."""
    height, width = grid.buffer_shape()
    lum = np.zeros((height, width), dtype=np.float32)
    band = grid.cell_h * grid.supersample
    lum[10 * band + band // 2: 10 * band + band // 2 + 2, :] = 1.0
    out = asciify.asciify(lum, grid, atlas, look)
    chosen = {atlas.chars[i] for i in np.unique(out[10])}
    assert chosen & set("─-=_~▄▀"), f"got {chosen}"


def test_vertical_edge_picks_a_vertical_glyph(grid, atlas, look):
    height, width = grid.buffer_shape()
    lum = np.zeros((height, width), dtype=np.float32)
    stride = grid.cell_w * grid.supersample
    lum[:, 40 * stride + stride // 2: 40 * stride + stride // 2 + 2] = 1.0
    out = asciify.asciify(lum, grid, atlas, look)
    chosen = {atlas.chars[i] for i in np.unique(out[:, 40])}
    assert chosen & set("│|▌▐!"), f"got {chosen}"


def test_hysteresis_suppresses_flicker(atlas):
    """A cell sitting between two near-equal glyphs must keep its previous choice."""
    rng = np.random.default_rng(7)
    n_cells = 1024
    sigs = rng.random((n_cells, glyphs.SIG_H * glyphs.SIG_W)).astype(np.float32)
    first = glyphs.match_glyphs(sigs, atlas)
    # Noise std chosen empirically. With the real 62-glyph "cinematic" atlas, uniformly
    # random signatures land far from any decision boundary (average best/second-best
    # score margin ~1.35), so a small perturbation like std=0.002 never flips a single
    # cell -- there is nothing for hysteresis to suppress, which is why this test used
    # to compare 256 == 256. A sweep over std in [0.01, 0.5], checked across 200 RNG
    # seeds at n_cells=1024, found std=0.45 reliably flips ~20-27% of cells without
    # hysteresis (within the 10-40% target band) while the hysteresis-vs-no-hysteresis
    # retention margin stayed positive (+6 or better) for every seed tested.
    noise_std = 0.45
    nudged = sigs + rng.normal(0, noise_std, sigs.shape).astype(np.float32)
    without = glyphs.match_glyphs(nudged, atlas)
    flipped_without = int((without != first).sum())
    assert flipped_without > 20, "test setup produced no flicker to suppress"

    with_hyst = glyphs.match_glyphs(nudged, atlas, prev=first, hysteresis=0.06)
    retained_with_hyst = int((with_hyst == first).sum())
    retained_without = int((without == first).sum())
    assert retained_with_hyst > retained_without


def test_dither_changes_the_result(grid, atlas, look):
    """Mid-grey must not quantise to a single flat glyph everywhere."""
    lum = np.full(grid.buffer_shape(), 0.5, dtype=np.float32)
    dithered = asciify.cell_signatures(lum, grid, "bayer8", look.dither_amplitude)
    flat = asciify.cell_signatures(lum, grid, "none", look.dither_amplitude)
    assert not np.allclose(dithered, flat)
    assert len(np.unique(flat.round(4), axis=0)) == 1


def test_wrong_buffer_shape_is_rejected(grid, atlas, look):
    with pytest.raises(ValueError, match="buffer"):
        asciify.asciify(np.zeros((10, 10), dtype=np.float32), grid, atlas, look)
