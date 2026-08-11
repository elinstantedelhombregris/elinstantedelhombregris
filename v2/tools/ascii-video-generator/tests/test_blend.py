import numpy as np
import pytest

from ascii_studio.render import blend


@pytest.fixture
def rng():
    return np.random.default_rng(7)


def test_screen_never_darkens(rng):
    a = rng.random((32, 32, 3)).astype(np.float32)
    b = rng.random((32, 32, 3)).astype(np.float32)
    result = blend.BLEND_MODES["screen"](a, b)
    assert np.all(result >= a - 1e-6)
    assert np.all(result >= b - 1e-6)


def test_screen_genuinely_brightens_for_nonzero_top(rng):
    a = np.full((16, 16, 3), 0.3, dtype=np.float32)
    b = np.full((16, 16, 3), 0.4, dtype=np.float32)
    result = blend.BLEND_MODES["screen"](a, b)
    assert np.all(result > a)


def test_difference_of_identical_inputs_is_zero(rng):
    a = rng.random((16, 16, 3)).astype(np.float32)
    result = blend.BLEND_MODES["difference"](a, a)
    assert np.allclose(result, 0.0)


def test_multiply_never_brightens(rng):
    a = rng.random((16, 16, 3)).astype(np.float32)
    b = rng.random((16, 16, 3)).astype(np.float32)
    result = blend.BLEND_MODES["multiply"](a, b)
    assert np.all(result <= a + 1e-6)
    assert np.all(result <= b + 1e-6)


def test_darken_and_lighten_are_min_max(rng):
    a = rng.random((16, 16, 3)).astype(np.float32)
    b = rng.random((16, 16, 3)).astype(np.float32)
    assert np.allclose(blend.BLEND_MODES["darken"](a, b), np.minimum(a, b))
    assert np.allclose(blend.BLEND_MODES["lighten"](a, b), np.maximum(a, b))


@pytest.mark.parametrize("mode", list(blend.BLEND_MODES))
def test_all_modes_stay_in_bounds_before_clip_or_close_to_it(mode, rng):
    a = rng.random((16, 16, 3)).astype(np.float32)
    b = rng.random((16, 16, 3)).astype(np.float32)
    result = blend.BLEND_MODES[mode](a, b)
    # add() legitimately overshoots 1.0 by design -- blend() is what clips it.
    if mode != "add":
        assert result.min() >= -1e-6
        assert result.max() <= 1.0 + 1e-6


def test_blend_handles_uint8_round_trip():
    base = np.full((8, 8, 3), 100, dtype=np.uint8)
    top = np.full((8, 8, 3), 200, dtype=np.uint8)
    out = blend.blend(base, top, "screen", opacity=1.0)
    assert out.dtype == np.uint8
    assert out.mean() > base.mean()


def test_blend_opacity_zero_returns_base_unchanged():
    base = np.full((8, 8, 3), 0.3, dtype=np.float32)
    top = np.full((8, 8, 3), 0.9, dtype=np.float32)
    out = blend.blend(base, top, "screen", opacity=0.0)
    assert np.allclose(out, base)


def test_blend_opacity_one_matches_full_mode_output():
    base = np.full((8, 8, 3), 0.3, dtype=np.float32)
    top = np.full((8, 8, 3), 0.9, dtype=np.float32)
    out = blend.blend(base, top, "multiply", opacity=1.0)
    assert np.allclose(out, base * top, atol=1e-5)


def test_unknown_mode_raises():
    base = np.zeros((4, 4, 3), dtype=np.float32)
    with pytest.raises(ValueError):
        blend.blend(base, base, "nonexistent")


def test_linear_light_opacity_mix_avoids_srgb_darkened_midtones():
    """0 and 1 are fixed points of the sRGB transfer curve, so blending pure
    black and white with a mode whose *own* output is also binary (lighten:
    max(0,1)=1 in either space) isolates exactly one thing: whether the final
    opacity mix (`a*(1-op) + blended*op`) happens in sRGB or linear light.

    Mixing 50/50 in sRGB space and calling it "half as bright" is the classic
    gamma-encoding mistake -- the actual linear-light energy at sRGB 0.5 is
    only about 0.214, well under half. Mixing in linear light and re-encoding
    lands near sRGB 0.735, which is what "half the light energy of white"
    actually looks like -- visibly less dark."""
    base = np.zeros((8, 8, 3), dtype=np.float32)
    top = np.ones((8, 8, 3), dtype=np.float32)
    srgb_result = blend.blend(base, top, "lighten", opacity=0.5)
    linear_result = blend.blend_linear_light(base, top, "lighten", opacity=0.5)
    assert linear_result.mean() > srgb_result.mean()
    assert srgb_result.mean() == pytest.approx(0.5, abs=1e-3)


def test_linear_light_uint8_round_trip():
    base = np.full((8, 8, 3), 60, dtype=np.uint8)
    top = np.full((8, 8, 3), 180, dtype=np.uint8)
    out = blend.blend_linear_light(base, top, "add", opacity=1.0)
    assert out.dtype == np.uint8


def test_to_float01_and_to_uint8_round_trip():
    arr = np.array([[0, 128, 255]], dtype=np.uint8)
    f = blend.to_float01(arr)
    assert f.dtype == np.float32
    assert np.allclose(f, [0.0, 128 / 255.0, 1.0], atol=1e-3)
    back = blend.to_uint8(f)
    assert np.array_equal(back, arr)
