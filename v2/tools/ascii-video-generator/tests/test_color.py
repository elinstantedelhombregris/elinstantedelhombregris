import numpy as np
import pytest

from ascii_studio.render import color


def test_hex_to_rgb01():
    assert np.allclose(color.hex_to_rgb01("#ffffff"), [1.0, 1.0, 1.0])
    assert np.allclose(color.hex_to_rgb01("050607"), [5 / 255, 6 / 255, 7 / 255])


@pytest.mark.parametrize("hexval", ["#050607", "#7D5BDE", "#ffffff", "#000000", "#8a9099"])
def test_oklab_roundtrip(hexval):
    rgb = color.hex_to_rgb01(hexval)
    back = color.oklab_to_srgb(color.srgb_to_oklab(rgb))
    assert np.allclose(rgb, back, atol=1e-4), f"{hexval}: {rgb} != {back}"


def test_oklab_lightness_is_monotonic():
    """Grey ramp must produce strictly increasing OKLab L."""
    greys = np.array([[v, v, v] for v in np.linspace(0.0, 1.0, 12)], dtype=np.float32)
    lightness = color.srgb_to_oklab(greys)[:, 0]
    assert np.all(np.diff(lightness) > 0)


def test_mix_oklab_midpoint_keeps_lightness_between_ends():
    """The RGB-lerp bug this replaces: mixing two colours must not dip in lightness."""
    a = color.hex_to_rgb01("#f5d47c")
    b = color.hex_to_rgb01("#66d7c0")
    mid = color.mix_oklab(a, b, 0.5)
    la, lb = color.srgb_to_oklab(a)[0], color.srgb_to_oklab(b)[0]
    lm = color.srgb_to_oklab(mid)[0]
    assert min(la, lb) - 1e-3 <= lm <= max(la, lb) + 1e-3


def test_mix_oklab_endpoints():
    a = color.hex_to_rgb01("#050607")
    b = color.hex_to_rgb01("#7D5BDE")
    assert np.allclose(color.mix_oklab(a, b, 0.0), a, atol=1e-4)
    assert np.allclose(color.mix_oklab(a, b, 1.0), b, atol=1e-4)


def test_ramp_lookup_shape_and_ends():
    ramp = np.stack([color.hex_to_rgb01(h) for h in ("#050607", "#8a9099", "#f2f4f7")])
    v = np.array([[0.0, 0.5], [1.0, 0.25]], dtype=np.float32)
    out = color.ramp_lookup(ramp, v)
    assert out.shape == (2, 2, 3)
    assert np.allclose(out[0, 0], ramp[0], atol=1e-4)
    assert np.allclose(out[1, 0], ramp[2], atol=1e-4)


def test_ramp_lookup_clips_out_of_range():
    ramp = np.stack([color.hex_to_rgb01(h) for h in ("#050607", "#f2f4f7")])
    out = color.ramp_lookup(ramp, np.array([-0.5, 1.5], dtype=np.float32))
    assert np.allclose(out[0], ramp[0], atol=1e-4)
    assert np.allclose(out[1], ramp[1], atol=1e-4)
