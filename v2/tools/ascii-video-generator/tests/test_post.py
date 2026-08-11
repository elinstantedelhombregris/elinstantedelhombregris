from dataclasses import replace

import numpy as np
import pytest

from ascii_studio.render import post, tokens


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


def _isolated(look):
    """The base look with everything except halation zeroed out, so halation's
    effect can be observed without grain/scanline/vignette noise drowning it out."""
    return replace(look, grain=0.0, scanlines=0.0, vignette=0.0)


def _bright_square_frame(size=128, square=24, value=1.0):
    rgb = np.zeros((size, size, 3), dtype=np.float32)
    lo = size // 2 - square // 2
    hi = lo + square
    rgb[lo:hi, lo:hi] = value
    return rgb, lo, hi


def test_output_is_uint8_rgb(look):
    rgb = np.zeros((240, 135, 3), dtype=np.float32)
    out = post.grade(rgb, look, 0)
    assert out.dtype == np.uint8
    assert out.shape == (240, 135, 3)


def test_black_stays_near_black(look):
    out = post.grade(np.zeros((64, 64, 3), dtype=np.float32), look, 0)
    assert out.mean() < 12


def test_halation_bleeds_light_around_a_bright_region(look):
    isolated = _isolated(look)
    rgb, lo, hi = _bright_square_frame()
    row = 64
    out = post.grade(rgb, isolated, 0).astype(np.float32)
    just_outside = out[row, hi + 2]
    far_away = out[row, hi + 50]
    assert just_outside.mean() > far_away.mean()


def test_halation_is_what_causes_the_bleed(look):
    on = _isolated(look)
    off = replace(on, halation=0.0)
    rgb, lo, hi = _bright_square_frame()
    row = 64
    out_on = post.grade(rgb, on, 0).astype(np.float32)
    out_off = post.grade(rgb, off, 0).astype(np.float32)
    just_outside_on = out_on[row, hi + 2].mean()
    just_outside_off = out_off[row, hi + 2].mean()
    assert just_outside_on > just_outside_off


def test_halation_does_not_lift_the_blacks(look):
    isolated = _isolated(look)
    rgb, lo, hi = _bright_square_frame()
    # A sub-threshold midtone patch (a dim glyph, well below the 0.55 halation
    # threshold) placed away from the bright square. Correct, thresholded
    # halation must not treat this midtone as a bloom source, so the black
    # pixels immediately next to it should stay black. A flat whole-frame blur
    # (the old regression, which blurs *everything* including midtones) would
    # smear this patch into its neighbours and fail the assertion below.
    rgb[100:120, 100:120] = 0.45
    out = post.grade(rgb, isolated, 0).astype(np.float32)
    just_below_the_midtone_patch = out[121:126, 100:120]
    assert just_below_the_midtone_patch.max() <= 2


def test_vignette_darkens_corners(look):
    rgb = np.full((128, 128, 3), 0.6, dtype=np.float32)
    out = post.grade(rgb, look, 0).astype(np.float32)
    assert out[2, 2].mean() < out[64, 64].mean()


def test_grain_varies_between_frames(look):
    rgb = np.full((64, 64, 3), 0.5, dtype=np.float32)
    assert not np.array_equal(post.grade(rgb, look, 0), post.grade(rgb, look, 1))


def test_grade_is_deterministic_for_a_given_frame(look):
    rgb = np.full((64, 64, 3), 0.5, dtype=np.float32)
    assert np.array_equal(post.grade(rgb, look, 42), post.grade(rgb, look, 42))


def test_no_clipping_artifacts(look):
    rgb = np.ones((64, 64, 3), dtype=np.float32)
    out = post.grade(rgb, look, 0)
    assert out.max() <= 255 and out.min() >= 0


def test_grade_is_visually_unchanged_by_the_fast_paths(look):
    """The reduced-resolution blur and tiled grain must not shift the image perceptibly."""
    import dataclasses
    quiet = dataclasses.replace(look, grain=0.0)          # isolate from noise
    rng = np.random.default_rng(3)
    frame = np.zeros((480, 270, 3), dtype=np.float32)
    frame[120:200, 60:140] = 1.0                          # a bright region that will bloom
    frame += rng.random(frame.shape).astype(np.float32) * 0.15
    frame = np.clip(frame, 0.0, 1.0)
    out = post.grade(frame, quiet, 0).astype(np.float32)
    reference = post.grade_reference(frame, quiet, 0).astype(np.float32)
    assert np.abs(out - reference).mean() < 1.5, np.abs(out - reference).mean()
    assert np.abs(out - reference).max() < 12, np.abs(out - reference).max()


# ---------------------------------------------------------------------------
# Extra shaders
# ---------------------------------------------------------------------------

def _gradient_frame(size=96):
    """A frame with real structure (a diagonal ramp + a bright block), so shaders
    that only touch flat colour have something to act on."""
    rgb = np.zeros((size, size, 3), dtype=np.float32)
    ramp = np.linspace(0.0, 1.0, size, dtype=np.float32)
    rgb[..., 0] = ramp[None, :]
    rgb[..., 1] = ramp[:, None]
    rgb[..., 2] = 0.3
    rgb[size // 3:size // 2, size // 3:size // 2] = 1.0
    return rgb


def test_sh_chromatic_shifts_red_and_blue_oppositely():
    frame = np.zeros((32, 32, 3), dtype=np.float32)
    frame[16, 16] = [1.0, 1.0, 1.0]
    out = post.sh_chromatic(frame, 3)
    assert out[16, 19, 0] == pytest.approx(1.0)  # red moved right
    assert out[16, 13, 2] == pytest.approx(1.0)  # blue moved left
    assert out[16, 16, 1] == pytest.approx(1.0)  # green untouched


def test_sh_chromatic_zero_amount_is_a_no_op():
    frame = _gradient_frame(16)
    out = post.sh_chromatic(frame, 0)
    assert np.array_equal(out, frame)


def test_sh_rgb_split_radial_leaves_the_centre_alone():
    frame = _gradient_frame(64)
    out = post.sh_rgb_split_radial(frame, 8.0)
    cy, cx = 32, 32
    assert out[cy, cx, 0] == pytest.approx(frame[cy, cx, 0], abs=1e-3)


def test_sh_rgb_split_radial_shifts_more_at_the_edges():
    frame = np.zeros((96, 96, 3), dtype=np.float32)
    frame[..., 0] = 1.0  # solid red so the shift is measurable via the diff to original
    out = post.sh_rgb_split_radial(frame, 6.0)
    # a solid single-colour frame is unaffected regardless of radius, so build one
    # with a vertical stripe instead to actually see displacement grow with radius.
    frame2 = np.zeros((96, 96, 3), dtype=np.float32)
    frame2[:, 48, 0] = 1.0
    out2 = post.sh_rgb_split_radial(frame2, 6.0)
    centre_row_shift = np.abs(out2[48, :, 0] - frame2[48, :, 0]).sum()
    edge_row_shift = np.abs(out2[2, :, 0] - frame2[2, :, 0]).sum()
    assert edge_row_shift >= centre_row_shift


def test_sh_posterize_reduces_unique_levels():
    frame = _gradient_frame(64)
    out = post.sh_posterize(frame, 4)
    unique_r = np.unique(np.round(out[..., 0], 6))
    assert len(unique_r) <= 4


def test_sh_posterize_endpoints_preserved():
    frame = np.array([[[0.0, 1.0, 0.5]]], dtype=np.float32)
    out = post.sh_posterize(frame, 3)
    assert out[0, 0, 0] == pytest.approx(0.0)
    assert out[0, 0, 1] == pytest.approx(1.0)


def test_sh_posterize_rejects_too_few_levels():
    with pytest.raises(ValueError):
        post.sh_posterize(np.zeros((4, 4, 3), dtype=np.float32), 1)


def test_sh_solarize_inverts_only_above_threshold():
    frame = np.array([[[0.2, 0.8, 0.5]]], dtype=np.float32)
    out = post.sh_solarize(frame, threshold=0.5)
    assert out[0, 0, 0] == pytest.approx(0.2)   # below threshold: untouched
    assert out[0, 0, 1] == pytest.approx(0.2)   # above threshold: inverted (1-0.8)
    assert out[0, 0, 2] == pytest.approx(0.5)   # exactly at threshold: untouched


def test_sh_pixel_sort_preserves_the_pixel_multiset_per_row():
    frame = _gradient_frame(48)
    out = post.sh_pixel_sort(frame, axis=1, threshold=0.3)
    row = 10
    before = np.sort(frame[row, :, 0])
    after = np.sort(out[row, :, 0])
    assert np.allclose(before, after)


def test_sh_pixel_sort_actually_reorders_bright_runs():
    size = 32
    frame = np.zeros((size, size, 3), dtype=np.float32)
    row = 5
    # a run of pixels above threshold, deliberately out of luminance order
    frame[row, 2:10] = np.array([[v, v, v] for v in [0.9, 0.5, 0.95, 0.6, 0.99, 0.55, 0.7, 0.8]])
    out = post.sh_pixel_sort(frame, axis=1, threshold=0.4)
    sorted_run = out[row, 2:10, 0]
    assert np.all(np.diff(sorted_run) >= -1e-6)  # ascending within the run
    below_threshold = frame[row, 0:2]
    assert np.allclose(out[row, 0:2], below_threshold)  # untouched outside the run


def test_sh_pixel_sort_vertical_axis_preserves_column_multiset():
    frame = _gradient_frame(48)
    out = post.sh_pixel_sort(frame, axis=0, threshold=0.3)
    col = 10
    before = np.sort(frame[:, col, 1])
    after = np.sort(out[:, col, 1])
    assert np.allclose(before, after)


def test_sh_block_glitch_is_deterministic_given_a_seed():
    frame = _gradient_frame(64)
    out1 = post.sh_block_glitch(frame, blocks=8, seed=11)
    out2 = post.sh_block_glitch(frame, blocks=8, seed=11)
    assert np.array_equal(out1, out2)


def test_sh_block_glitch_differs_with_a_different_seed():
    frame = _gradient_frame(64)
    out1 = post.sh_block_glitch(frame, blocks=8, seed=11)
    out2 = post.sh_block_glitch(frame, blocks=8, seed=12)
    assert not np.array_equal(out1, out2)


def test_sh_block_glitch_preserves_shape_and_bounds():
    frame = _gradient_frame(50)
    out = post.sh_block_glitch(frame, blocks=6, seed=1)
    assert out.shape == frame.shape
    assert out.min() >= 0.0 and out.max() <= 1.0 + 1e-6


def test_sh_crt_barrel_leaves_the_centre_pixel_in_place():
    frame = _gradient_frame(96)
    out = post.sh_crt_barrel(frame, 0.3)
    assert out[48, 48, 2] == pytest.approx(frame[48, 48, 2], abs=1e-2)


def test_sh_crt_barrel_is_cached_across_calls():
    from ascii_studio.render.post import _crt_barrel_maps
    _crt_barrel_maps.cache_clear()
    frame = _gradient_frame(64)
    post.sh_crt_barrel(frame, 0.2)
    info_after_first = _crt_barrel_maps.cache_info()
    post.sh_crt_barrel(frame, 0.2)
    info_after_second = _crt_barrel_maps.cache_info()
    assert info_after_second.hits == info_after_first.hits + 1


def test_sh_crt_barrel_zero_strength_is_near_identity():
    frame = _gradient_frame(64)
    out = post.sh_crt_barrel(frame, 0.0)
    assert np.abs(out - frame).mean() < 1e-3
