import numpy as np
import pytest

from ascii_studio.render.feedback import FeedbackBuffer, ghostly_echo, infinite_zoom_tunnel


def _frame(size=48, value=0.4):
    return np.full((size, size, 3), value, dtype=np.float32)


def test_decay_zero_equals_input_frame_screen_mode():
    buf = FeedbackBuffer(decay=0.0, blend_mode="screen", transform="zoom", transform_amt=0.02)
    frame = _frame()
    buf.apply(frame)  # seed a previous buffer
    out = buf.apply(frame)
    assert np.allclose(out, frame, atol=1e-5)


def test_decay_zero_equals_input_frame_add_mode():
    buf = FeedbackBuffer(decay=0.0, blend_mode="add", transform="shift_up", transform_amt=0.05)
    frame = _frame()
    buf.apply(frame)
    out = buf.apply(frame)
    assert np.allclose(out, frame, atol=1e-5)


def test_first_frame_has_no_trail():
    buf = FeedbackBuffer(decay=0.9, blend_mode="screen", transform="zoom", transform_amt=0.02)
    frame = _frame()
    out = buf.apply(frame)
    assert np.allclose(out, frame, atol=1e-5)


def test_nonzero_decay_builds_a_visible_trail():
    buf = FeedbackBuffer(decay=0.9, blend_mode="screen", transform="none")
    bright = _frame(value=0.8)
    buf.apply(bright)
    dark = _frame(value=0.05)
    out = buf.apply(dark)
    # screen-blended with the bright trail, the dark frame should come out
    # brighter than it went in.
    assert out.mean() > dark.mean()


def test_reset_clears_the_trail():
    buf = FeedbackBuffer(decay=0.9, blend_mode="screen", transform="none")
    bright = _frame(value=0.8)
    buf.apply(bright)
    buf.reset()
    dark = _frame(value=0.05)
    out = buf.apply(dark)
    assert np.allclose(out, dark, atol=1e-5)


def test_zoom_transform_spreads_a_single_point_outward():
    buf = FeedbackBuffer(decay=0.9, blend_mode="screen", transform="zoom", transform_amt=0.1)
    size = 64
    frame = np.zeros((size, size, 3), dtype=np.float32)
    frame[size // 2, size // 2] = 1.0  # a single bright point at centre
    buf.apply(frame)
    out = buf.apply(np.zeros_like(frame))
    # nearest-resize of a cropped centre duplicates the source pixel into a
    # small block -- more than the original single pixel should now be lit.
    bright_pixels = int((out.mean(axis=2) > 0.1).sum())
    assert bright_pixels > 1


def test_shift_up_moves_content_upward_and_fills_black():
    buf = FeedbackBuffer(decay=1.0, blend_mode="lighten", transform="shift_up", transform_amt=0.2)
    size = 40
    frame = np.zeros((size, size, 3), dtype=np.float32)
    frame[size - 1, :] = 1.0  # bright bottom row
    buf.apply(frame)
    out = buf.apply(np.zeros_like(frame))
    shift_px = int(round(size * 0.2))
    # content that was at the bottom should now show up higher (shifted up)
    assert out[size - 1 - shift_px, :].mean() > 0
    # and the very bottom rows should have been black-filled by the roll
    assert out[size - 1, :].mean() == pytest.approx(0.0, abs=1e-5)


def test_rotate_cw_transform_runs_and_stays_in_bounds():
    buf = FeedbackBuffer(decay=0.8, blend_mode="add", transform="rotate_cw", transform_amt=5.0)
    frame = _frame(size=32, value=0.5)
    buf.apply(frame)
    out = buf.apply(frame)
    assert out.shape == frame.shape
    assert out.min() >= 0.0 and out.max() <= 1.0 + 1e-5


def test_apply_preserves_uint8_dtype():
    buf = FeedbackBuffer(decay=0.8, blend_mode="screen", transform="zoom", transform_amt=0.02)
    frame = np.full((32, 32, 3), 120, dtype=np.uint8)
    out = buf.apply(frame)
    assert out.dtype == np.uint8


def test_unknown_transform_raises():
    with pytest.raises(ValueError):
        FeedbackBuffer(decay=0.5, transform="nonsense")


def test_presets_are_the_shipped_configuration():
    tunnel = infinite_zoom_tunnel()
    assert tunnel.decay == 0.8
    assert tunnel.blend_mode == "screen"
    assert tunnel.transform == "zoom"
    assert tunnel.transform_amt == 0.015

    echo = ghostly_echo()
    assert echo.decay == 0.9
    assert echo.blend_mode == "add"
    assert echo.opacity == 0.15
    assert echo.transform == "shift_up"


def test_feedback_is_deterministic_across_runs():
    frame = _frame(size=32, value=0.3)
    buf_a = infinite_zoom_tunnel()
    buf_b = infinite_zoom_tunnel()
    out_a = [buf_a.apply(frame) for _ in range(5)]
    out_b = [buf_b.apply(frame) for _ in range(5)]
    for fa, fb in zip(out_a, out_b):
        assert np.array_equal(fa, fb)
