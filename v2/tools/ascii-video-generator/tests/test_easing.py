import numpy as np
import pytest

from ascii_studio.render import easing as ez

FAMILIES = [
    "quad_in", "quad_out", "quad_in_out",
    "cubic_in", "cubic_out", "cubic_in_out",
    "expo_in", "expo_out", "expo_in_out",
    "elastic_in", "elastic_out", "elastic_in_out",
    "bounce_in", "bounce_out", "bounce_in_out",
]


@pytest.mark.parametrize("name", ["linear"] + FAMILIES)
def test_easing_maps_zero_to_zero(name):
    fn = ez.EASINGS[name]
    assert fn(0.0) == pytest.approx(0.0, abs=1e-6)


@pytest.mark.parametrize("name", ["linear"] + FAMILIES)
def test_easing_maps_one_to_one(name):
    fn = ez.EASINGS[name]
    assert fn(1.0) == pytest.approx(1.0, abs=1e-6)


@pytest.mark.parametrize("name", ["linear"] + FAMILIES)
def test_easing_accepts_arrays(name):
    fn = ez.EASINGS[name]
    t = np.linspace(0.0, 1.0, 11)
    out = fn(t)
    out = np.asarray(out)
    assert out.shape == t.shape
    assert out[0] == pytest.approx(0.0, abs=1e-6)
    assert out[-1] == pytest.approx(1.0, abs=1e-6)


def test_quad_out_is_monotonic():
    t = np.linspace(0.0, 1.0, 50)
    out = np.asarray(ez.quad_out(t))
    assert np.all(np.diff(out) >= -1e-9)


def test_at_least_ten_easing_functions_registered():
    assert len(ez.EASINGS) >= 10


def test_linear_is_identity():
    assert ez.linear(0.37) == pytest.approx(0.37)


# -- keyframe -----------------------------------------------------------------

def test_keyframe_holds_before_first_point():
    points = [(1.0, 10.0), (2.0, 20.0)]
    assert ez.keyframe(0.0, points) == pytest.approx(10.0)


def test_keyframe_holds_after_last_point():
    points = [(1.0, 10.0), (2.0, 20.0)]
    assert ez.keyframe(5.0, points) == pytest.approx(20.0)


def test_keyframe_interpolates_linearly_by_default():
    points = [(0.0, 0.0), (2.0, 10.0)]
    assert ez.keyframe(1.0, points) == pytest.approx(5.0)


def test_keyframe_respects_a_custom_ease():
    points = [(0.0, 0.0), (1.0, 1.0)]
    linear_mid = ez.keyframe(0.5, points, ease=ez.linear)
    quad_mid = ez.keyframe(0.5, points, ease=ez.quad_in)
    assert quad_mid < linear_mid


def test_keyframe_exact_hits_return_exact_values():
    points = [(0.0, 3.0), (1.0, 8.0), (2.5, -4.0)]
    assert ez.keyframe(1.0, points) == pytest.approx(8.0)
    assert ez.keyframe(2.5, points) == pytest.approx(-4.0)


def test_keyframe_loop_wraps_around():
    points = [(0.0, 0.0), (1.0, 10.0)]
    # just after the loop point should look like just after t=0
    near_zero = ez.keyframe(0.01, points, loop=True)
    near_wrap = ez.keyframe(1.01, points, loop=True)
    assert near_wrap == pytest.approx(near_zero, abs=1e-6)


# -- directional arcs -----------------------------------------------------------

def test_ramp_is_identity():
    assert ez.ramp(0.42) == pytest.approx(0.42)


def test_ease_out_endpoints():
    assert ez.ease_out(0.0) == pytest.approx(0.0)
    assert ez.ease_out(1.0) == pytest.approx(1.0)


def test_ease_out_decelerates_faster_than_linear_midway():
    assert ez.ease_out(0.5) > 0.5


def test_step_reveal_is_zero_before_the_step_and_one_after():
    assert ez.step_reveal(0.0, at=0.5, width=0.25) == pytest.approx(0.0)
    assert ez.step_reveal(1.0, at=0.5, width=0.25) == pytest.approx(1.0)


def test_step_reveal_is_half_at_the_middle_of_the_ramp():
    # the ramp runs from `at` (output 0) to `at + width` (output 1); its
    # midpoint in output-space is at progress = at + width / 2.
    assert ez.step_reveal(0.625, at=0.5, width=0.25) == pytest.approx(0.5)
    assert ez.step_reveal(0.5, at=0.5, width=0.25) == pytest.approx(0.0)


def test_build_plateau_reaches_one_before_progress_finishes():
    assert ez.build_plateau(2.0 / 3.0) == pytest.approx(1.0, abs=1e-6)
    assert ez.build_plateau(1.0) == pytest.approx(1.0)
    assert ez.build_plateau(0.0) == pytest.approx(0.0)


def test_layer_strength_ramps_in_after_enter_time():
    assert ez.layer_strength(0.0, enter_t=1.0, ramp=1.5) == pytest.approx(0.0)
    assert ez.layer_strength(1.0, enter_t=1.0, ramp=1.5) == pytest.approx(0.0)
    assert ez.layer_strength(2.5, enter_t=1.0, ramp=1.5) == pytest.approx(1.0)
    assert ez.layer_strength(1.75, enter_t=1.0, ramp=1.5) == pytest.approx(0.5)


def test_directional_arcs_accept_arrays():
    t = np.linspace(0.0, 1.0, 5)
    for fn in (ez.ramp, ez.ease_out, ez.step_reveal, ez.build_plateau):
        out = np.asarray(fn(t))
        assert out.shape == t.shape
