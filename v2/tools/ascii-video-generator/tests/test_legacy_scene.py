import numpy as np
import pytest

from ascii_studio.render import canvas, tokens
from ascii_studio.scene import legacy


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


def chapter(motif="network"):
    return legacy.LegacyChapter(
        motif=motif, keyword="CONFIANZA", anchors=["CONFIANZA", "RED"],
        seed=1634938309, density=0.61, motion=0.47,
    )


def test_field_shape_and_range(grid, look):
    lum = legacy.field_luminance(chapter(), grid, 1.0, 0.3, look.field_scale)
    assert lum.shape == grid.buffer_shape()
    assert lum.dtype == np.float32
    assert 0.0 <= lum.min() and lum.max() <= 1.0


def test_motif_stays_inside_the_stage_zone(grid):
    """The bug this kills: v1 drew the keyword at y=628 behind the caption plate."""
    lum = legacy.motif_luminance(chapter(), grid, 1.0, 0.3)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["stage"])
    outside = lum.copy()
    ss = grid.supersample
    outside[y0 * ss:y1 * ss, x0 * ss:x1 * ss] = 0.0
    assert outside.max() == 0.0, "motif drew outside the stage zone"


def test_motif_actually_draws_something(grid):
    lum = legacy.motif_luminance(chapter(), grid, 1.0, 0.3)
    assert lum.max() > 0.5


@pytest.mark.parametrize("motif", [
    "noise", "signal", "network", "orbit", "mirror",
    "blueprint", "pulse", "fracture", "evidence", "horizon",
])
def test_every_v1_motif_renders(grid, look, motif):
    lum = legacy.compose(chapter(motif), grid, 1.0, 0.3, look)
    assert lum.shape == grid.buffer_shape()
    assert lum.max() > 0.0


def test_field_animates_over_time(grid, look):
    a = legacy.field_luminance(chapter(), grid, 0.0, 0.0, look.field_scale)
    b = legacy.field_luminance(chapter(), grid, 2.5, 0.0, look.field_scale)
    assert not np.allclose(a, b)


def test_seed_changes_geometry(grid):
    one = chapter()
    two = legacy.LegacyChapter(
        motif="network", keyword="CONFIANZA", anchors=["CONFIANZA", "RED"],
        seed=99, density=0.61, motion=0.47,
    )
    assert not np.allclose(
        legacy.motif_luminance(one, grid, 1.0, 0.3),
        legacy.motif_luminance(two, grid, 1.0, 0.3),
    )


def test_compose_is_clipped(grid, look):
    lum = legacy.compose(chapter(), grid, 1.0, 0.3, look)
    assert lum.min() >= 0.0 and lum.max() <= 1.0


@pytest.mark.parametrize("motif", [
    "noise", "signal", "network", "orbit", "mirror",
    "blueprint", "pulse", "fracture", "evidence", "horizon",
])
def test_reduced_field_stays_faithful_at_worst_case(grid, look, motif):
    """Worst case is max density and motion, where the field's frequency is highest.
    orbit and pulse are the tightest. The field is scaled by FIELD_AMPLITUDE before use,
    so this bound corresponds to well under one 8-bit level in the final image."""
    import cv2
    chapter = legacy.LegacyChapter(motif=motif, keyword="K", anchors=["K"],
                                   seed=17, density=0.94, motion=0.96)
    reduced = legacy.field_luminance(chapter, grid, 1.0, 0.3, look.field_scale)
    height, width = grid.buffer_shape()

    class FullGrid:
        supersample = grid.supersample
        cols, rows = grid.cols, grid.rows
        def buffer_shape(self):
            return (height, width)

    full = legacy.field_luminance(chapter, FullGrid(), 1.0, 0.3, field_scale=1)
    assert reduced.shape == (height, width)
    assert float(np.abs(reduced - full).mean()) < 0.010, motif


def test_small_canvases_do_not_produce_degenerate_buffers(look):
    """MIN_FIELD_DIM must keep the reduced field usable on small canvases."""
    small = canvas.make_grid(540, 960, look)
    lum = legacy.field_luminance(
        chapter(), small, 1.0, 0.3, look.field_scale
    )
    assert lum.shape == small.buffer_shape()
    assert lum.dtype == np.float32
    assert 0.0 <= float(lum.min()) and float(lum.max()) <= 1.0
    assert float(lum.max()) > float(lum.min()), "field collapsed to a constant"
