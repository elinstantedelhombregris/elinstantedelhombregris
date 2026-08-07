import numpy as np
import pytest

from ascii_studio.render import transitions as tr


def _frames(size=48):
    a = np.zeros((size, size, 3), dtype=np.float32)
    b = np.ones((size, size, 3), dtype=np.float32)
    return a, b


# -- crossfade ------------------------------------------------------------

def test_crossfade_at_zero_returns_a_exactly():
    a, b = _frames()
    out = tr.tr_crossfade(a, b, 0.0)
    assert np.array_equal(out, a)


def test_crossfade_at_one_returns_b_exactly():
    a, b = _frames()
    out = tr.tr_crossfade(a, b, 1.0)
    assert np.array_equal(out, b)


def test_crossfade_midpoint_is_the_average():
    a, b = _frames()
    out = tr.tr_crossfade(a, b, 0.5)
    assert np.allclose(out, 0.5, atol=1e-5)


def test_crossfade_preserves_uint8_dtype():
    a = np.zeros((8, 8, 3), dtype=np.uint8)
    b = np.full((8, 8, 3), 255, dtype=np.uint8)
    out = tr.tr_crossfade(a, b, 0.5)
    assert out.dtype == np.uint8


# -- wipe -------------------------------------------------------------------

@pytest.mark.parametrize("direction", ["h", "v", "radial"])
def test_wipe_endpoints_match_crossfade_endpoints(direction):
    a, b = _frames()
    assert np.array_equal(tr.tr_wipe(a, b, 0.0, direction), a)
    assert np.array_equal(tr.tr_wipe(a, b, 1.0, direction), b)


@pytest.mark.parametrize("direction", ["h", "v", "radial"])
def test_wipe_progress_is_monotonic(direction):
    a, b = _frames()
    prev_fraction = -1.0
    for progress in (0.0, 0.2, 0.4, 0.6, 0.8, 1.0):
        out = tr.tr_wipe(a, b, progress, direction)
        fraction_revealed = float((out > 0.5).mean())
        assert fraction_revealed >= prev_fraction - 1e-6
        prev_fraction = fraction_revealed


def test_wipe_unknown_direction_raises():
    a, b = _frames()
    with pytest.raises(ValueError):
        tr.tr_wipe(a, b, 0.5, "diagonal")


# -- glitch cut ---------------------------------------------------------------

def test_glitch_cut_before_band_is_a():
    a, b = _frames()
    out = tr.tr_glitch_cut(a, b, 0.1, seed=1)
    assert np.array_equal(out, a)


def test_glitch_cut_after_band_is_b():
    a, b = _frames()
    out = tr.tr_glitch_cut(a, b, 0.9, seed=1)
    assert np.array_equal(out, b)


def test_glitch_cut_is_deterministic_given_a_seed():
    a, b = _frames()
    out1 = tr.tr_glitch_cut(a, b, 0.5, seed=42)
    out2 = tr.tr_glitch_cut(a, b, 0.5, seed=42)
    assert np.array_equal(out1, out2)


def test_glitch_cut_differs_with_a_different_seed():
    a, b = _frames()
    out1 = tr.tr_glitch_cut(a, b, 0.5, seed=1)
    out2 = tr.tr_glitch_cut(a, b, 0.5, seed=2)
    assert not np.array_equal(out1, out2)


def test_glitch_cut_mid_band_mixes_both_frames():
    a, b = _frames()
    out = tr.tr_glitch_cut(a, b, 0.5, seed=3)
    # a is all-0, b is all-1; the glitch band should show pixels from both.
    assert np.any(out == 0.0)
    assert np.any(out == 1.0)


# -- masks --------------------------------------------------------------------

@pytest.mark.parametrize("mask_fn", [tr.mask_wipe_h, tr.mask_wipe_v, tr.mask_iris])
def test_masks_are_all_zero_at_progress_zero(mask_fn):
    mask = mask_fn((32, 32), 0.0)
    assert mask.sum() == 0


@pytest.mark.parametrize("mask_fn", [tr.mask_wipe_h, tr.mask_wipe_v, tr.mask_iris])
def test_masks_are_full_at_progress_one(mask_fn):
    mask = mask_fn((32, 32), 1.0)
    assert mask.mean() > 0.95


@pytest.mark.parametrize("mask_fn", [tr.mask_wipe_h, tr.mask_wipe_v, tr.mask_iris])
def test_masks_are_monotonic_in_progress(mask_fn):
    prev_sum = -1.0
    for progress in (0.0, 0.25, 0.5, 0.75, 1.0):
        mask = mask_fn((40, 40), progress)
        assert mask.sum() >= prev_sum
        prev_sum = mask.sum()


def test_mask_dissolve_is_deterministic_given_a_seed():
    a = tr.mask_dissolve((32, 32), 0.5, seed=5)
    b = tr.mask_dissolve((32, 32), 0.5, seed=5)
    assert np.array_equal(a, b)


def test_mask_dissolve_differs_with_a_different_seed():
    a = tr.mask_dissolve((32, 32), 0.5, seed=5)
    b = tr.mask_dissolve((32, 32), 0.5, seed=6)
    assert not np.array_equal(a, b)


def test_mask_dissolve_is_monotonic_in_progress_for_a_fixed_seed():
    prev_sum = -1.0
    for progress in (0.0, 0.25, 0.5, 0.75, 1.0):
        mask = tr.mask_dissolve((48, 48), progress, seed=9)
        assert mask.sum() >= prev_sum
        prev_sum = mask.sum()


def test_mask_iris_grows_from_the_centre():
    mask = tr.mask_iris((64, 64), 0.1)
    assert mask[32, 32] == 1.0
    assert mask[0, 0] == 0.0
