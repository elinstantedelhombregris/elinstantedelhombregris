import math

import numpy as np
import pytest

from ascii_studio.scene import transforms

SHAPE = (48, 80)


def _grid():
    h, w = SHAPE
    aspect = w / h
    yy, xx = np.meshgrid(
        np.linspace(-1.0, 1.0, h, dtype=np.float32),
        np.linspace(-aspect, aspect, w, dtype=np.float32),
        indexing="ij",
    )
    return yy, xx


TRANSFORM_NAMES = [
    name for name in vars(transforms) if name.startswith("uv_")
]


def test_module_exposes_the_required_vocabulary():
    expected = {
        "uv_rotate", "uv_scale", "uv_tile", "uv_polar", "uv_cartesian_from_polar",
        "uv_twist", "uv_fisheye", "uv_mobius",
    }
    assert expected.issubset(set(TRANSFORM_NAMES))


@pytest.mark.parametrize("name", TRANSFORM_NAMES)
def test_shape_and_dtype_preserved(name):
    yy, xx = _grid()
    fn = getattr(transforms, name)
    if name == "uv_cartesian_from_polar":
        a, b = fn(*transforms.uv_polar(yy, xx))
    else:
        a, b = fn(yy, xx)
    assert a.shape == SHAPE and b.shape == SHAPE
    assert a.dtype == np.float32 and b.dtype == np.float32


# ---------------------------------------------------------------------------
# uv_rotate
# ---------------------------------------------------------------------------


def test_rotate_by_zero_is_identity():
    yy, xx = _grid()
    ry, rx = transforms.uv_rotate(yy, xx, angle=0.0)
    assert np.allclose(ry, yy, atol=1e-5)
    assert np.allclose(rx, xx, atol=1e-5)


def test_rotate_by_full_turn_returns_to_start():
    yy, xx = _grid()
    ry, rx = transforms.uv_rotate(yy, xx, angle=2 * math.pi)
    assert np.allclose(ry, yy, atol=1e-4)
    assert np.allclose(rx, xx, atol=1e-4)


def test_rotate_preserves_distance_from_centre():
    yy, xx = _grid()
    ry, rx = transforms.uv_rotate(yy, xx, angle=0.7)
    before = np.sqrt(yy**2 + xx**2)
    after = np.sqrt(ry**2 + rx**2)
    assert np.allclose(before, after, atol=1e-4)


# ---------------------------------------------------------------------------
# uv_scale
# ---------------------------------------------------------------------------


def test_scale_one_is_identity():
    yy, xx = _grid()
    sy, sx = transforms.uv_scale(yy, xx, sx=1.0, sy=1.0)
    assert np.allclose(sy, yy) and np.allclose(sx, xx)


def test_scale_up_shrinks_sampled_coordinates():
    yy, xx = _grid()
    sy, sx = transforms.uv_scale(yy, xx, sx=2.0, sy=2.0)
    assert np.allclose(sx, xx / 2.0)
    assert np.allclose(sy, yy / 2.0)


# ---------------------------------------------------------------------------
# uv_tile
# ---------------------------------------------------------------------------


def test_tile_mirror_has_no_seam_at_the_period_boundary():
    """Sample a fine line straddling a period boundary; under mirror tiling the
    values just before and just after the boundary should be continuous (close),
    not jump (which is what plain modulo tiling would do)."""
    period = 0.5
    xs = np.linspace(period - 0.01, period + 0.01, 21, dtype=np.float32)
    yy = np.zeros_like(xs)
    _, tiled_x = transforms.uv_tile(yy, xs, period=period, mirror=True)
    diffs = np.abs(np.diff(tiled_x))
    assert diffs.max() < 0.02  # no jump: continuous fold


def test_tile_plain_modulo_does_seam():
    period = 0.5
    xs = np.linspace(period - 0.01, period + 0.01, 21, dtype=np.float32)
    yy = np.zeros_like(xs)
    _, tiled_x = transforms.uv_tile(yy, xs, period=period, mirror=False)
    diffs = np.abs(np.diff(tiled_x))
    assert diffs.max() > 0.4  # hard wrap: visible seam


def test_tile_output_bounded_by_period():
    yy, xx = _grid()
    ty, tx = transforms.uv_tile(yy, xx, period=0.3, mirror=True)
    assert ty.max() <= 0.3 + 1e-5 and ty.min() >= -1e-5
    assert tx.max() <= 0.3 + 1e-5 and tx.min() >= -1e-5


# ---------------------------------------------------------------------------
# uv_polar / uv_cartesian_from_polar
# ---------------------------------------------------------------------------


def test_polar_cartesian_roundtrip():
    yy, xx = _grid()
    r, a = transforms.uv_polar(yy, xx)
    ry, rx = transforms.uv_cartesian_from_polar(r, a)
    assert np.allclose(ry, yy, atol=1e-4)
    assert np.allclose(rx, xx, atol=1e-4)


def test_polar_radius_matches_euclidean_distance():
    yy, xx = _grid()
    r, _ = transforms.uv_polar(yy, xx)
    assert np.allclose(r, np.sqrt(yy**2 + xx**2), atol=1e-5)


def test_polar_turns_a_linear_effect_radial():
    """A field that's `sin(coord1 * freq)` sampled through the FIRST element of
    uv_polar's output (radius) should be radially symmetric, unlike sampling the
    same sine directly through yy."""
    yy, xx = _grid()
    r, _ = transforms.uv_polar(yy, xx)
    radial_field = np.sin(r * 10.0)
    # radially symmetric: value at a point and its 180-degree-rotated counterpart
    # (same radius) should match closely.
    flipped = np.sin(np.sqrt(np.flip(yy, axis=0) ** 2 + np.flip(xx, axis=1) ** 2) * 10.0)
    assert np.allclose(radial_field, flipped, atol=1e-4)


# ---------------------------------------------------------------------------
# uv_twist
# ---------------------------------------------------------------------------


def test_twist_zero_amount_is_identity():
    yy, xx = _grid()
    ty, tx = transforms.uv_twist(yy, xx, amount=0.0)
    assert np.allclose(ty, yy, atol=1e-5) and np.allclose(tx, xx, atol=1e-5)


def test_twist_preserves_distance_from_centre():
    """Twist is a rotation whose angle depends on radius, so it must still be
    distance-preserving pointwise (rotation never changes distance from centre)."""
    yy, xx = _grid()
    ty, tx = transforms.uv_twist(yy, xx, amount=0.6)
    before = np.sqrt(yy**2 + xx**2)
    after = np.sqrt(ty**2 + tx**2)
    assert np.allclose(before, after, atol=1e-4)


def test_twist_changes_with_amount():
    yy, xx = _grid()
    a_ty, a_tx = transforms.uv_twist(yy, xx, amount=0.2)
    b_ty, b_tx = transforms.uv_twist(yy, xx, amount=0.9)
    assert not (np.allclose(a_ty, b_ty) and np.allclose(a_tx, b_tx))


# ---------------------------------------------------------------------------
# uv_fisheye
# ---------------------------------------------------------------------------


def test_fisheye_zero_strength_is_identity():
    yy, xx = _grid()
    fy, fx = transforms.uv_fisheye(yy, xx, strength=0.0)
    assert np.allclose(fy, yy, atol=1e-5) and np.allclose(fx, xx, atol=1e-5)


def test_fisheye_pushes_edges_further_than_centre():
    yy, xx = _grid()
    fy, fx = transforms.uv_fisheye(yy, xx, strength=0.3)
    before = np.sqrt(yy**2 + xx**2)
    after = np.sqrt(fy**2 + fx**2)
    # centre (small r) barely moves; far corners (large r) move a lot more.
    centre_idx = (SHAPE[0] // 2, SHAPE[1] // 2)
    corner_idx = (0, 0)
    centre_shift = abs(after[centre_idx] - before[centre_idx])
    corner_shift = abs(after[corner_idx] - before[corner_idx])
    assert corner_shift > centre_shift


# ---------------------------------------------------------------------------
# uv_mobius
# ---------------------------------------------------------------------------


def test_mobius_identity_params_leave_plane_unchanged():
    yy, xx = _grid()
    my, mx = transforms.uv_mobius(yy, xx, a=1 + 0j, b=0 + 0j, c=0 + 0j, d=1 + 0j)
    assert np.allclose(my, yy, atol=1e-4)
    assert np.allclose(mx, xx, atol=1e-4)


def test_mobius_default_params_actually_warp():
    yy, xx = _grid()
    my, mx = transforms.uv_mobius(yy, xx)
    assert not (np.allclose(my, yy, atol=1e-3) and np.allclose(mx, xx, atol=1e-3))


def test_mobius_does_not_produce_nan_or_inf_near_the_pole():
    yy, xx = _grid()
    my, mx = transforms.uv_mobius(yy, xx, c=5 + 0j, d=0 + 0j)  # pole at z=0, in-frame
    assert np.isfinite(my).all()
    assert np.isfinite(mx).all()


# ---------------------------------------------------------------------------
# Composition — the whole point of this module
# ---------------------------------------------------------------------------


def test_transforms_compose_uv_twist_of_uv_polar():
    yy, xx = _grid()
    ty, tx = transforms.uv_twist(*transforms.uv_polar(yy, xx), amount=0.3)
    assert ty.shape == SHAPE and tx.shape == SHAPE
    assert np.isfinite(ty).all() and np.isfinite(tx).all()


def test_transforms_compose_rotate_then_fisheye_then_feed_a_field():
    """End-to-end smoke test: pipe coordinates through two transforms, then sample
    a trivial field through the result -- this is the actual use case."""
    from ascii_studio.scene import fields

    yy, xx = _grid()
    ry, rx = transforms.uv_rotate(yy, xx, angle=0.5)
    fy, fx = transforms.uv_fisheye(ry, rx, strength=0.2)
    field = fields._to01(np.sin(fx * 5.0 + fy * 5.0))
    assert field.shape == SHAPE
    assert field.dtype == np.float32
    assert field.min() >= 0.0 and field.max() <= 1.0
