import inspect
import math

import numpy as np
import pytest

from ascii_studio.scene import fields

# Small, non-square, non-power-of-two shape: fast for the whole suite, and the
# aspect asymmetry catches bugs a square shape would hide (e.g. an un-corrected
# aspect ratio in a coordinate grid).
SHAPE = (96, 160)
SEED_A = 1_634_938_309
SEED_B = 20260805


# vf_reaction_diffusion's default_scale=8 shrinks the already-small SHAPE down to a
# ~12x20 simulation grid, which is too small relative to Gray-Scott's pattern
# wavelength for these presets to sustain -- the domain legitimately decays to the
# trivial homogeneous state (a real property of the simulation, verified against a
# checkpointed 256x256 run, not a bug). Real production shapes start at 1080x1920+
# and never hit this; here we just pin scale=1 so the registry-wide tests exercise
# the same 96x160 grid as everything else instead of an unrealistically tiny one.
EXTRA_KWARGS = {"vf_reaction_diffusion": {"scale": 1}}


def _call(name, t=1.2, seed=SEED_A, progress=0.4, **extra):
    fn = fields.FIELDS[name]
    kwargs = {**EXTRA_KWARGS.get(name, {}), **extra}
    return fn(SHAPE, t, progress, seed, **kwargs)


# ---------------------------------------------------------------------------
# Generic contract, parametrised over the whole registry
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_shape_dtype_range(name):
    out = _call(name)
    assert out.shape == SHAPE
    assert out.dtype == np.float32
    assert out.min() >= 0.0
    assert out.max() <= 1.0


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_determinism(name):
    a = _call(name)
    b = _call(name)
    assert np.array_equal(a, b), f"{name} is not deterministic for identical args"


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_changes_with_time(name):
    a = _call(name, t=0.2)
    b = _call(name, t=4.3)
    assert not np.allclose(a, b), f"{name} is static: output identical at t=0.2 and t=4.3"


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_seed_changes_output(name):
    a = _call(name, seed=SEED_A)
    b = _call(name, seed=SEED_B)
    assert not np.allclose(a, b), f"{name} ignores seed"


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_works_at_another_resolution(name):
    """Every generator must work at any resolution, not just the suite's SHAPE."""
    fn = fields.FIELDS[name]
    tall_thin = fn((211, 37), 0.7, 0.5, SEED_A)
    assert tall_thin.shape == (211, 37)
    assert tall_thin.dtype == np.float32


def test_registry_covers_all_public_vf_functions():
    public_vf = {
        name for name, obj in vars(fields).items()
        if name.startswith("vf_") and inspect.isfunction(obj)
    }
    assert public_vf == set(fields.FIELDS)
    assert len(fields.FIELDS) >= 12, "expected at least 12 generators across 5 families"


@pytest.mark.parametrize("name", sorted(fields.FIELDS))
def test_scale_upsampled_output_still_in_range_and_shape(name):
    """The `scale` downsample-then-upsample path (cv2 bilinear) must not leak out
    of 0..1 or the wrong shape."""
    out = _call(name, scale=3)
    assert out.shape == SHAPE
    assert out.dtype == np.float32
    assert out.min() >= 0.0 and out.max() <= 1.0


# ---------------------------------------------------------------------------
# Trig family specifics
# ---------------------------------------------------------------------------


def test_rings_is_radially_symmetric_on_a_square_canvas():
    out = fields.FIELDS["vf_rings"]((64, 64), 1.0, 0.3, SEED_A)
    # Rotate 90 degrees (transpose + flip) should closely match a purely radial field.
    rotated = np.rot90(out)
    assert np.allclose(out, rotated, atol=0.15)


def test_tunnel_uses_inverse_distance_perspective():
    """Centre (dist ~0) should differ sharply from edge as depth = 1/(r+0.1) blows up
    near the centre; nothing about a linear field would do that."""
    out = fields.FIELDS["vf_tunnel"]((65, 65), 1.0, 0.3, SEED_A, freq=3.0)
    centre = out[32, 32]
    edge = out[0, 0]
    assert not math.isclose(float(centre), float(edge), abs_tol=1e-6)


def test_interference_more_sources_changes_pattern():
    a = fields.FIELDS["vf_interference"](SHAPE, 1.0, 0.3, SEED_A, sources=2)
    b = fields.FIELDS["vf_interference"](SHAPE, 1.0, 0.3, SEED_A, sources=5)
    assert not np.allclose(a, b)


# ---------------------------------------------------------------------------
# Noise family internals
# ---------------------------------------------------------------------------


def test_hash2d_returns_01_range():
    ix = np.arange(-500, 500).reshape(20, 50).astype(np.int64)
    iy = np.arange(-250, 750).reshape(20, 50).astype(np.int64)
    h = fields._hash2d(ix, iy, 7)
    assert h.dtype == np.float32
    assert h.min() >= 0.0 and h.max() < 1.0


def test_hash2d_deterministic_and_seed_sensitive():
    ix = np.array([[0, 1, 2], [3, 4, 5]], dtype=np.int64)
    iy = np.array([[0, 0, 0], [1, 1, 1]], dtype=np.int64)
    a = fields._hash2d(ix, iy, 1)
    b = fields._hash2d(ix, iy, 1)
    c = fields._hash2d(ix, iy, 2)
    assert np.array_equal(a, b)
    assert not np.array_equal(a, c)


def test_hash2d_not_axis_aligned():
    """The bug this guards: a sine-based hash produces visible axis-aligned bands
    (rows/columns of near-identical values). A good integer hash should not."""
    ix, iy = np.meshgrid(np.arange(64), np.arange(64), indexing="ij")
    h = fields._hash2d(ix.astype(np.int64), iy.astype(np.int64), 3)
    row_variance = h.var(axis=1).mean()
    col_variance = h.var(axis=0).mean()
    overall_variance = h.var()
    # row/col-averaged variance should be close to the overall variance -- if rows
    # or columns were degenerate (axis-aligned banding) their internal variance
    # would collapse well below the whole-field variance.
    assert row_variance > overall_variance * 0.5
    assert col_variance > overall_variance * 0.5


def test_smootherstep_endpoints_and_monotonic():
    xs = np.linspace(0.0, 1.0, 50, dtype=np.float32)
    ys = fields._smootherstep(xs)
    assert math.isclose(float(ys[0]), 0.0, abs_tol=1e-6)
    assert math.isclose(float(ys[-1]), 1.0, abs_tol=1e-6)
    assert np.all(np.diff(ys) >= -1e-6)  # monotonically non-decreasing


def test_smootherstep_clamps_outside_01():
    xs = np.array([-1.0, -0.1, 1.1, 2.0], dtype=np.float32)
    ys = fields._smootherstep(xs)
    assert np.allclose(ys, [0.0, 0.0, 1.0, 1.0])


def test_value_noise_2d_shape_range_determinism():
    a = fields._value_noise_2d(SHAPE, freq=4.0, seed=5)
    b = fields._value_noise_2d(SHAPE, freq=4.0, seed=5)
    c = fields._value_noise_2d(SHAPE, freq=4.0, seed=6)
    assert a.shape == SHAPE
    assert a.dtype == np.float32
    assert a.min() >= 0.0 and a.max() <= 1.0
    assert np.array_equal(a, b)
    assert not np.array_equal(a, c)


def test_value_noise_2d_is_smooth_not_random_per_pixel():
    """Value noise interpolates between lattice points, so adjacent pixels should be
    close in value -- unlike raw white noise, which would jump around."""
    n = fields._value_noise_2d((64, 64), freq=3.0, seed=1)
    horiz_diff = np.abs(np.diff(n, axis=1)).mean()
    assert horiz_diff < 0.15


def test_fbm_more_octaves_adds_detail():
    """More octaves should add higher-frequency variance on top of the base shape."""
    low = fields.FIELDS["vf_fbm"](SHAPE, 1.0, 0.3, SEED_A, octaves=1)
    high = fields.FIELDS["vf_fbm"](SHAPE, 1.0, 0.3, SEED_A, octaves=6)
    assert not np.allclose(low, high)


def test_domain_warp_differs_from_plain_noise():
    """Domain warping must actually distort -- if warp_amount=0 collapses to plain
    noise, that's a bug in the displacement wiring."""
    warped = fields.FIELDS["vf_domain_warp"](SHAPE, 1.0, 0.3, SEED_A, warp_amount=0.8)
    unwarped = fields.FIELDS["vf_domain_warp"](SHAPE, 1.0, 0.3, SEED_A, warp_amount=0.0)
    assert not np.allclose(warped, unwarped)


def test_voronoi_cells_and_edges_modes_differ():
    cells = fields.FIELDS["vf_voronoi"](SHAPE, 1.0, 0.3, SEED_A, mode="cells")
    edges = fields.FIELDS["vf_voronoi"](SHAPE, 1.0, 0.3, SEED_A, mode="edges")
    assert not np.allclose(cells, edges)


def test_voronoi_edges_are_sparse_bright_lines():
    """Edges mode should be mostly one extreme (background) with a minority of
    pixels near cell borders -- not a dense/noisy field."""
    edges = fields.FIELDS["vf_voronoi"](SHAPE, 1.0, 0.3, SEED_A, mode="edges", freq=6.0)
    bright_fraction = (edges > 0.8).mean()
    assert bright_fraction < 0.5


# ---------------------------------------------------------------------------
# Simulation family — Gray-Scott reaction-diffusion
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("preset", sorted(fields.RD_PRESETS))
def test_reaction_diffusion_presets_all_run(preset):
    # scale=1: see EXTRA_KWARGS comment above -- default_scale=8 on this small SHAPE
    # gives too tiny a simulation grid for these presets to sustain a pattern.
    out = fields.FIELDS["vf_reaction_diffusion"](SHAPE, 1.5, 0.3, SEED_A, preset=preset, scale=1)
    assert out.shape == SHAPE
    assert out.dtype == np.float32
    assert 0.0 <= out.min() and out.max() <= 1.0


def test_reaction_diffusion_evolves_and_does_not_collapse_flat():
    """The bug this guards: Gray-Scott collapsing to a uniform field (dead
    simulation) instead of showing spot/coral/maze structure."""
    early = fields.FIELDS["vf_reaction_diffusion"](SHAPE, 0.1, 0.1, SEED_A, preset="spots", scale=1)
    later = fields.FIELDS["vf_reaction_diffusion"](SHAPE, 3.0, 0.6, SEED_A, preset="spots", scale=1)
    assert not np.allclose(early, later)
    assert later.std() > 0.01, "reaction-diffusion field collapsed to near-flat"


def test_rd_init_and_step_are_the_stateful_low_level_api():
    state = fields.rd_init(SHAPE, SEED_A, preset="coral")
    assert state["U"].shape == SHAPE and state["V"].shape == SHAPE
    before = state["V"].copy()
    fields.rd_step(state, sub_steps=6)
    assert not np.allclose(before, state["V"]), "rd_step did not change V"
    # state is mutated (and returned) in place -- carrying it across calls is how a
    # real per-frame caller gets O(1)-per-frame cost instead of vf_'s O(t) replay.
    assert state["V"].dtype == np.float32


def test_rd_step_is_deterministic_given_same_state_and_params():
    s1 = fields.rd_init(SHAPE, SEED_A, preset="mitosis")
    s2 = fields.rd_init(SHAPE, SEED_A, preset="mitosis")
    fields.rd_step(s1, sub_steps=8)
    fields.rd_step(s2, sub_steps=8)
    assert np.array_equal(s1["V"], s2["V"])


# ---------------------------------------------------------------------------
# SDF family
# ---------------------------------------------------------------------------


def test_sdf_circle_sign_and_zero_crossing():
    xx = np.array([0.0, 0.29, 0.3, 0.31, 1.0], dtype=np.float32)
    yy = np.zeros_like(xx)
    d = fields.sdf_circle(xx, yy, r=0.3)
    assert d[0] < 0  # centre: inside
    assert d[1] < 0  # just inside
    assert math.isclose(float(d[2]), 0.0, abs_tol=1e-5)  # on the boundary
    assert d[3] > 0  # just outside
    assert d[4] > 0  # far outside


def test_sdf_box_matches_analytic_distance_on_axis():
    xx = np.array([0.0, 0.5], dtype=np.float32)
    yy = np.array([0.0, 0.0], dtype=np.float32)
    d = fields.sdf_box(xx, yy, hw=0.3, hh=0.2)
    assert d[0] < 0
    assert math.isclose(float(d[1]), 0.2, abs_tol=1e-5)  # 0.5 - hw(0.3) = 0.2


def test_sdf_ring_is_zero_on_both_edges():
    xx = np.array([0.26, 0.3, 0.34], dtype=np.float32)
    yy = np.zeros_like(xx)
    d = fields.sdf_ring(xx, yy, r=0.3, thickness=0.04)
    assert math.isclose(float(d[0]), 0.0, abs_tol=1e-5)
    assert d[1] < 0  # centre of the ring band
    assert math.isclose(float(d[2]), 0.0, abs_tol=1e-5)


def test_sdf_line_distance_to_segment():
    xx = np.array([0.0, 0.0, -1.0], dtype=np.float32)
    yy = np.array([0.0, 0.1, 0.0], dtype=np.float32)
    d = fields.sdf_line(xx, yy, x0=-0.3, y0=0.0, x1=0.3, y1=0.0, thickness=0.02)
    assert d[0] < 0  # on the segment
    assert math.isclose(float(d[1]), 0.08, abs_tol=1e-5)  # 0.1 - thickness
    assert d[2] > 0  # off the end of the segment


def test_sdf_triangle_inside_and_outside():
    p0, p1, p2 = (-0.3, 0.25), (0.3, 0.25), (0.0, -0.3)
    xx = np.array([0.0, 5.0], dtype=np.float32)
    yy = np.array([0.0, 5.0], dtype=np.float32)
    d = fields.sdf_triangle(xx, yy, p0, p1, p2)
    assert d[0] < 0, "centroid-ish point should be inside (negative)"
    assert d[1] > 0, "far point should be outside (positive)"


def test_sdf_star_has_multiple_boundary_crossings_around_a_ring():
    """Sampling around a circle at fixed radius between r_inner and r_outer should
    cross the star boundary `points` times if the taper is actually radial."""
    theta = np.linspace(0, 2 * math.pi, 720, endpoint=False, dtype=np.float32)
    r = 0.25
    xx = r * np.cos(theta)
    yy = r * np.sin(theta)
    d = fields.sdf_star(xx, yy, r_outer=0.35, r_inner=0.15, points=5)
    sign = d > 0
    crossings = int(np.sum(sign != np.roll(sign, 1)))
    assert crossings == 10  # 5 points => 10 sign changes around the ring


def test_sdf_union_is_pointwise_min():
    d1 = np.array([1.0, -2.0, 3.0])
    d2 = np.array([2.0, -1.0, -3.0])
    assert np.array_equal(fields.sdf_union(d1, d2), np.minimum(d1, d2))


def test_sdf_subtract_removes_d2_from_d1():
    d1 = fields.sdf_circle(np.array([0.0]), np.array([0.0]), r=0.5)
    d2 = fields.sdf_circle(np.array([0.0]), np.array([0.0]), r=0.2)
    cut = fields.sdf_subtract(d1, d2)
    assert cut[0] > 0, "centre should be carved out (outside) after subtracting the smaller circle"


def test_sdf_intersect_is_pointwise_max():
    d1 = np.array([1.0, -2.0, 3.0])
    d2 = np.array([2.0, -1.0, -3.0])
    assert np.array_equal(fields.sdf_intersect(d1, d2), np.maximum(d1, d2))


def test_sdf_smooth_union_rounds_the_seam_vs_hard_union():
    xx = np.linspace(-1, 1, 200, dtype=np.float32)
    yy = np.zeros_like(xx)
    d1 = fields.sdf_circle(xx, yy, cx=-0.15, r=0.25)
    d2 = fields.sdf_circle(xx, yy, cx=0.15, r=0.25)
    hard = fields.sdf_union(d1, d2)
    smooth = fields.sdf_smooth_union(d1, d2, k=0.2)
    assert not np.allclose(hard, smooth)
    # smooth union is never further outside than the hard union at any point
    assert np.all(smooth <= hard + 1e-5)


def test_sdf_smooth_union_approaches_hard_union_as_k_shrinks():
    xx = np.linspace(-1, 1, 200, dtype=np.float32)
    yy = np.zeros_like(xx)
    d1 = fields.sdf_circle(xx, yy, cx=-0.15, r=0.25)
    d2 = fields.sdf_circle(xx, yy, cx=0.15, r=0.25)
    hard = fields.sdf_union(d1, d2)
    nearly_hard = fields.sdf_smooth_union(d1, d2, k=1e-4)
    assert np.allclose(hard, nearly_hard, atol=1e-3)


def test_sdf_render_is_bright_inside_dark_outside_antialiased():
    d = np.array([-0.1, 0.0, 0.1], dtype=np.float32)
    val = fields.sdf_render(d, edge_width=0.05)
    assert val[0] > val[1] > val[2]
    assert math.isclose(float(val[1]), 0.5, abs_tol=1e-3)
    assert val.dtype == np.float32


def test_sdf_scene_composes_primitives_and_animates():
    a = fields.FIELDS["vf_sdf_scene"](SHAPE, 0.0, 0.2, SEED_A)
    b = fields.FIELDS["vf_sdf_scene"](SHAPE, 2.0, 0.8, SEED_A)
    assert a.shape == SHAPE
    assert not np.allclose(a, b)
    assert a.max() > 0.3, "scene should draw something bright, not stay near-black"
