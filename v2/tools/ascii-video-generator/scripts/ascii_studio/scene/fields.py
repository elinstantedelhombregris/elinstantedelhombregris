"""Value-field vocabulary: five families of generators instead of one.

Every generator has the exact signature::

    def vf_name(shape: tuple[int, int], t: float, progress: float, seed: int, **params) -> np.ndarray

- `shape` is `(height, width)` in pixels; every generator works at any resolution.
- returns float32 in 0..1, shape == `shape`.
- `t` is absolute seconds, `progress` is 0..1 through the current chapter.
- deterministic given the same arguments (see tests/test_fields.py).

Five families:

- **Trig**   — closed-form sine/cosine fields (rings, spiral, tunnel, interference,
  ripple, plasma). Cheap, always animated, the v1 legacy family lives in this shape
  too (`scene/legacy.py`).
- **Noise**  — integer-hash value noise (`vf_noise`, `vf_fbm`, `vf_domain_warp`,
  `vf_voronoi`). The biggest vocabulary gap: organic, non-repeating texture.
- **Simulation** — Gray-Scott reaction-diffusion (`vf_reaction_diffusion`). Carries
  state across sub-steps; see the module docstring section below for how the pure
  `vf_` wrapper reconciles "stateful simulation" with "deterministic pure function".
- **SDF**    — signed-distance primitives + combinators, for actual diagram-quality
  geometry (circles, boxes, stars...) instead of texture. `vf_sdf_scene` is a small
  demo composing them; the primitives (`sdf_circle`, `sdf_union`, ...) are also
  exported directly for callers who want to build their own composite scenes.

Coordinates
-----------
All generators share one coordinate convention via `_grid(shape)`: `yy` runs -1..1
top to bottom, `xx` runs -aspect..aspect left to right (aspect = width/height), so a
circle drawn with `sdf_circle` (or a distance computed by hand) is round regardless
of the canvas's aspect ratio.

Performance
-----------
Everything is vectorised numpy/cv2 — no Python loop over pixels. The simulation
family loops over a handful of sub-steps (that's the algorithm, not a perf bug).
Heavier generators (`vf_fbm`, `vf_domain_warp`, `vf_voronoi`, `vf_reaction_diffusion`)
accept a `scale` parameter: `scale=4` evaluates at 1/4 resolution per axis and
upsamples with `cv2.INTER_LINEAR`, following the precedent set by
`scene/legacy.py`'s `field_scale`. See the timing table in the task report for
measured costs at 1080x1920 and which generators need it.
"""

from __future__ import annotations

import math

import cv2
import numpy as np

from .transforms import uv_rotate

# ---------------------------------------------------------------------------
# Shared coordinate + hashing primitives
# ---------------------------------------------------------------------------


def _grid(shape: tuple[int, int]) -> tuple[np.ndarray, np.ndarray]:
    """Aspect-corrected coordinate grid: yy in -1..1, xx in -aspect..aspect."""
    h, w = shape
    aspect = w / h
    yy, xx = np.meshgrid(
        np.linspace(-1.0, 1.0, h, dtype=np.float32),
        np.linspace(-aspect, aspect, w, dtype=np.float32),
        indexing="ij",
    )
    return yy, xx


def _seed_phase(seed: int) -> float:
    return (int(seed) % 997) / 997.0 * math.pi * 2


def _to01(f: np.ndarray) -> np.ndarray:
    """Map a field already in roughly -1..1 (single sine) to 0..1."""
    return np.clip((f + 1.0) * 0.5, 0.0, 1.0).astype(np.float32)


def _squash01(f: np.ndarray) -> np.ndarray:
    """Map an unbounded sum-of-sines field to 0..1 via tanh compression."""
    return np.clip((np.tanh(f) + 1.0) * 0.5, 0.0, 1.0).astype(np.float32)


def _at_scale(shape: tuple[int, int], scale: int, compute) -> np.ndarray:
    """Evaluate `compute(small_shape) -> ndarray` at 1/scale resolution and upsample.

    Mirrors scene/legacy.py's field_scale precedent: a divisor of 1 evaluates at
    full resolution untouched.
    """
    scale = max(1, int(scale))
    if scale == 1:
        return compute(shape)
    h, w = shape
    small = (max(8, h // scale), max(8, w // scale))
    result = compute(small)
    if small == shape:
        return result
    return cv2.resize(result, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def _scalable(default_scale: int = 1):
    """Decorator factory giving every `vf_*` generator a uniform `scale` kwarg.

    `scale=1` evaluates at full resolution — a fidelity baseline, used by the
    determinism/shape tests in tests/test_fields.py. `scale=N>1` evaluates `core` at
    1/N resolution per axis and upsamples with cv2.INTER_LINEAR, exactly following
    scene/legacy.py's `field_scale` precedent. This exists because even pure trig
    fields are too slow evaluated at the real per-frame buffer resolution (np.sin
    alone costs ~95ms on an 8.3M-pixel 3840x2160 array on the reference machine) —
    see the task report's timing table for measured scale=1 vs scale=4 costs and
    which generators need scale>1 (or a lower `default_scale` here) to land in
    budget.
    """

    def decorator(core):
        def wrapped(shape, t, progress, seed, scale: int = default_scale, **params):
            def compute(sh):
                return core(sh, t, progress, seed, **params)

            return _at_scale(shape, scale, compute)

        wrapped.__name__ = core.__name__
        wrapped.__doc__ = core.__doc__
        wrapped.__wrapped__ = core
        return wrapped

    return decorator


def _hash2d(ix: np.ndarray, iy: np.ndarray, seed: int) -> np.ndarray:
    """Integer-hash value noise via large-prime mixing. Returns float32 in [0, 1).

    Deliberately NOT sine-based (`sin(dot(p, huge_vector))`-style hashes are cheap
    but produce visible axis-aligned banding once tiled across a whole frame). This
    is a standard 32-bit avalanche mix (multiply-xor-shift), done in uint64 to avoid
    numpy overflow errors on negative/oversized inputs.

    Perf note: `int64.astype(uint64)` is a bit-level reinterpret cast (safe for any
    magnitude, unlike constructing `np.uint64(python_int)` from an out-of-range
    Python scalar, which raises) — so coordinate arrays skip the `& 0xFFFFFFFF` mask
    that only the scalar `seed` needs, and the mix runs with in-place ops to cut
    allocations. This alone is ~35% faster than the masked/out-of-place version and
    is the difference between the noise family landing in budget at `scale=4` or not.
    """
    ix64 = ix.astype(np.uint64)
    iy64 = iy.astype(np.uint64)
    s = np.uint64(int(seed) & 0xFFFFFFFF)
    h = ix64 * np.uint64(374761393) + iy64 * np.uint64(668265263) + s * np.uint64(2246822519)
    h ^= h >> np.uint64(13)
    h *= np.uint64(1274126177)
    h ^= h >> np.uint64(16)
    h &= np.uint64(0x0FFFFFFF)
    return h.astype(np.float32) / np.float32(0x0FFFFFFF)


def _smootherstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * x * (x * (x * 6 - 15) + 10)


def _value_noise_at(fx: np.ndarray, fy: np.ndarray, seed: int) -> np.ndarray:
    """Value noise sampled at arbitrary (already frequency-scaled) coordinates."""
    ix0 = np.floor(fx).astype(np.int64)
    iy0 = np.floor(fy).astype(np.int64)
    tx = _smootherstep((fx - ix0).astype(np.float32))
    ty = _smootherstep((fy - iy0).astype(np.float32))
    v00 = _hash2d(ix0, iy0, seed)
    v10 = _hash2d(ix0 + 1, iy0, seed)
    v01 = _hash2d(ix0, iy0 + 1, seed)
    v11 = _hash2d(ix0 + 1, iy0 + 1, seed)
    nx0 = v00 + (v10 - v00) * tx
    nx1 = v01 + (v11 - v01) * tx
    return (nx0 + (nx1 - nx0) * ty).astype(np.float32)


def _value_noise_2d(shape: tuple[int, int], freq: float, seed: int) -> np.ndarray:
    yy, xx = _grid(shape)
    return _value_noise_at(xx * freq, yy * freq, seed)


def _noise_time(fx: np.ndarray, fy: np.ndarray, t: float, speed: float, seed: int) -> np.ndarray:
    """Value noise that genuinely evolves with t (not just scrolls): interpolate
    between two independently-hashed lattice "time slices" per animation tick."""
    time = t * speed
    it0 = math.floor(time)
    tf = _smootherstep(np.float32(time - it0))
    n0 = _value_noise_at(fx, fy, seed + it0 * 104729)
    n1 = _value_noise_at(fx, fy, seed + (it0 + 1) * 104729)
    return n0 + (n1 - n0) * tf


# ---------------------------------------------------------------------------
# Trig family
# ---------------------------------------------------------------------------


@_scalable()
def vf_rings(shape, t, progress, seed, freq=9.0, speed=0.6, **params) -> np.ndarray:
    yy, xx = _grid(shape)
    r = np.sqrt(xx * xx + yy * yy)
    f = np.sin(r * freq * math.pi - t * speed * math.pi * 2 + _seed_phase(seed))
    return _to01(f)


@_scalable()
def vf_spiral(shape, t, progress, seed, arms=3.0, freq=6.0, speed=0.5, **params) -> np.ndarray:
    yy, xx = _grid(shape)
    r = np.sqrt(xx * xx + yy * yy)
    a = np.arctan2(yy, xx)
    f = np.sin(a * arms + r * freq - t * speed * math.pi * 2 + _seed_phase(seed))
    return _to01(f)


@_scalable()
def vf_tunnel(shape, t, progress, seed, freq=5.0, speed=1.2, **params) -> np.ndarray:
    """Inverse-distance perspective: 1/(dist+0.1), classic infinite-tunnel warp."""
    yy, xx = _grid(shape)
    r = np.sqrt(xx * xx + yy * yy)
    depth = 1.0 / (r + 0.1)
    f = np.sin(depth * freq - t * speed * math.pi * 2 + _seed_phase(seed))
    return _to01(f)


@_scalable()
def vf_interference(shape, t, progress, seed, freq=18.0, speed=0.8, sources=3, **params) -> np.ndarray:
    """Overlapping circular wave sources -> interference fringes."""
    yy, xx = _grid(shape)
    seed_phase = _seed_phase(seed)
    n = max(2, int(sources))
    total = np.zeros(shape, dtype=np.float32)
    for i in range(n):
        angle = (2 * math.pi * i / n) + seed_phase
        sx, sy = 0.55 * math.cos(angle), 0.55 * math.sin(angle)
        r = np.sqrt((xx - sx) ** 2 + (yy - sy) ** 2)
        total += np.sin(r * freq - t * speed * math.pi * 2 + i * 0.7)
    return _squash01(total / math.sqrt(n))


@_scalable()
def vf_ripple(shape, t, progress, seed, freq=22.0, speed=1.0, decay=1.4, **params) -> np.ndarray:
    """Single expanding ripple from centre, amplitude decaying with radius."""
    yy, xx = _grid(shape)
    r = np.sqrt(xx * xx + yy * yy)
    f = np.sin(r * freq - t * speed * math.pi * 2 + _seed_phase(seed)) * np.exp(-r * decay)
    return _to01(f)


@_scalable()
def vf_plasma(shape, t, progress, seed, freq=8.5, speed=0.7, **params) -> np.ndarray:
    """Classic four-term plasma: sines at different orientations, summed."""
    yy, xx = _grid(shape)
    seed_phase = _seed_phase(seed)
    f = np.sin(xx * freq + t * speed)
    f = f + np.sin(yy * freq - t * speed * 1.3)
    f = f + np.sin((xx + yy) * freq * 0.7 + t * speed * 0.8 + seed_phase)
    f = f + np.sin(np.sqrt(xx * xx + yy * yy) * freq * 1.3 - t * speed * 1.1)
    return _squash01(f * 0.6)


# ---------------------------------------------------------------------------
# Noise family
# ---------------------------------------------------------------------------


@_scalable(default_scale=4)
def vf_noise(shape, t, progress, seed, freq=5.0, speed=0.25, **params) -> np.ndarray:
    yy, xx = _grid(shape)
    n = _noise_time(xx * freq, yy * freq, t, speed, seed)
    return np.clip(n, 0.0, 1.0).astype(np.float32)


@_scalable(default_scale=8)
def vf_fbm(
    shape, t, progress, seed, freq=3.0, octaves=4, speed=0.2, lacunarity=2.0, gain=0.5, **params,
) -> np.ndarray:
    """Fractal brownian motion: sum of octaves at lacunarity 2.0, gain 0.5.

    Each octave is 8 `_hash2d` calls (4 lattice corners x 2 time-slices), so cost is
    linear in `octaves` — this is the most expensive generator in the vocabulary per
    pixel evaluated. Default `octaves=4` (not the traditional 5) and `default_scale=8`
    trade a little high-frequency detail for landing closer to budget; see the task
    report's timing table.
    """
    yy, xx = _grid(shape)
    total = np.zeros(shape, dtype=np.float32)
    amp, amp_sum, f = 1.0, 0.0, float(freq)
    for o in range(max(1, int(octaves))):
        total += amp * _noise_time(xx * f, yy * f, t, speed * (1.0 + 0.1 * o), seed + o * 7919)
        amp_sum += amp
        amp *= gain
        f *= lacunarity
    return np.clip(total / amp_sum, 0.0, 1.0).astype(np.float32)


@_scalable(default_scale=6)
def vf_domain_warp(
    shape, t, progress, seed, freq=2.2, warp_freq=3.0, warp_amount=0.6, speed=0.15, **params,
) -> np.ndarray:
    """Sample one noise field's output as a coordinate DISPLACEMENT into a second
    noise field (Inigo Quilez's domain warping). Produces organic "melting" distortion
    that plain value noise can't."""
    yy, xx = _grid(shape)
    wx = _noise_time(xx * warp_freq, yy * warp_freq, t, speed, seed) * 2 - 1
    wy = _noise_time(xx * warp_freq, yy * warp_freq, t, speed, seed + 101) * 2 - 1
    warped_x = xx + wx * warp_amount
    warped_y = yy + wy * warp_amount
    n = _noise_time(warped_x * freq, warped_y * freq, t, speed, seed + 9973)
    return np.clip(n, 0.0, 1.0).astype(np.float32)


@_scalable(default_scale=6)
def vf_voronoi(
    shape, t, progress, seed, freq=5.0, speed=0.08, orbit=0.38, mode="cells", **params,
) -> np.ndarray:
    """Worley/cellular noise: nearest (f1) and second-nearest (f2) feature-point
    distances. `mode="cells"` shades each cell by distance to its centre;
    `mode="edges"` highlights cell boundaries via f2 - f1."""
    yy, xx = _grid(shape)
    fx, fy = xx * freq, yy * freq
    cell_x = np.floor(fx)
    cell_y = np.floor(fy)
    f1 = np.full(shape, 1e9, dtype=np.float32)
    f2 = np.full(shape, 1e9, dtype=np.float32)
    time_angle = t * speed * math.pi * 2
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            cx_i = (cell_x + ox).astype(np.int64)
            cy_i = (cell_y + oy).astype(np.int64)
            jx = _hash2d(cx_i, cy_i, seed)
            jy = _hash2d(cx_i, cy_i, seed + 7)
            angle = jx * math.pi * 2 + time_angle
            radius = orbit * jy
            px = cx_i.astype(np.float32) + 0.5 + radius * np.cos(angle)
            py = cy_i.astype(np.float32) + 0.5 + radius * np.sin(angle)
            d = np.sqrt((fx - px) ** 2 + (fy - py) ** 2)
            closer = d < f1
            f2 = np.where(closer, f1, np.minimum(f2, d))
            f1 = np.where(closer, d, f1)
    if mode == "edges":
        val = np.clip((f2 - f1) * 2.4, 0.0, 1.0)
        result = 1.0 - val
    else:
        result = np.clip(f1 * 1.6, 0.0, 1.0)
    return result.astype(np.float32)


# ---------------------------------------------------------------------------
# Simulation family — Gray-Scott reaction-diffusion
# ---------------------------------------------------------------------------

RD_PRESETS: dict[str, dict[str, float]] = {
    "spots": {"f": 0.055, "k": 0.062},
    "coral": {"f": 0.037, "k": 0.060},
    "mitosis": {"f": 0.028, "k": 0.062},
    "labyrinth": {"f": 0.029, "k": 0.057},
}

_RD_KERNEL = np.array(
    [[0.05, 0.2, 0.05], [0.2, -1.0, 0.2], [0.05, 0.2, 0.05]], dtype=np.float32
)


def _rd_laplacian(field: np.ndarray) -> np.ndarray:
    return cv2.filter2D(field, -1, _RD_KERNEL, borderType=cv2.BORDER_REFLECT)


def rd_init(shape: tuple[int, int], seed: int, preset: str = "spots") -> dict:
    """Build initial Gray-Scott state: U=1 everywhere, V=0 with a handful of seeded
    blobs. Exposed (with rd_step below) as the low-level stateful API: a caller
    that owns state across real video frames should use rd_init once + rd_step per
    frame directly, rather than replaying `vf_reaction_diffusion` from scratch every
    call (see that function's docstring for why)."""
    h, w = shape
    rng = np.random.default_rng(seed)
    u = np.ones((h, w), dtype=np.float32)
    v = np.zeros((h, w), dtype=np.float32)
    blobs = 3 + int(seed) % 4
    r = max(2, min(h, w) // 20)
    for _ in range(blobs):
        bx = int(rng.integers(w // 4, max(w // 4 + 1, 3 * w // 4)))
        by = int(rng.integers(h // 4, max(h // 4 + 1, 3 * h // 4)))
        y0, y1 = max(0, by - r), min(h, by + r)
        x0, x1 = max(0, bx - r), min(w, bx + r)
        u[y0:y1, x0:x1] = 0.5
        v[y0:y1, x0:x1] = 0.25
    u = np.clip(u + rng.normal(0, 0.02, size=(h, w)).astype(np.float32), 0.0, 1.0)
    v = np.clip(v + rng.normal(0, 0.02, size=(h, w)).astype(np.float32), 0.0, 1.0)
    return {"U": u, "V": v, "preset": preset}


def rd_step(state: dict, sub_steps: int = 8, dt: float = 1.0, du: float = 1.0, dv: float = 0.5) -> dict:
    """Advance Gray-Scott by `sub_steps` forward-Euler sub-steps (mutates + returns
    `state` in place). 6-8 sub-steps per visible animation tick is the standard
    stability window for this dt/diffusion-rate combination."""
    params = RD_PRESETS.get(state.get("preset", "spots"), RD_PRESETS["spots"])
    f, k = params["f"], params["k"]
    u, v = state["U"], state["V"]
    for _ in range(max(1, int(sub_steps))):
        lu = _rd_laplacian(u)
        lv = _rd_laplacian(v)
        uvv = u * v * v
        u = u + dt * (du * lu - uvv + f * (1.0 - u))
        v = v + dt * (dv * lv + uvv - (f + k) * v)
        np.clip(u, 0.0, 1.0, out=u)
        np.clip(v, 0.0, 1.0, out=v)
    state["U"], state["V"] = u, v
    return state


@_scalable(default_scale=8)
def vf_reaction_diffusion(
    shape, t, progress, seed, preset="spots",
    iterations_per_sec=40, sub_steps=8, max_iterations=500, **params,
) -> np.ndarray:
    """Pure-function wrapper around rd_init/rd_step: replays the simulation from
    scratch up to a tick count derived from `t`, so the same (shape, t, seed, preset)
    always gives the same frame (satisfies the module's determinism contract).

    This replay is O(iterations), capped by `max_iterations` regardless of how large
    `t` gets — necessary because Gray-Scott has no closed form, and because these
    presets need a few thousand Euler sub-steps (not a handful) before an organic
    Turing pattern is recognisable — verified empirically by checkpointing all four
    presets at 300/800/1500/2500/4000 steps; the defaults here land n_iter*sub_steps
    in roughly that 300-4000 range for t in 0..12s. It is NOT the efficient way to
    drive this in the real per-frame pipeline: a caller advancing through real video
    frames should hold one `rd_init` state and call `rd_step` on it once per frame
    (O(1) per frame, unbounded development) instead of calling this wrapper, which is
    O(t) AND caps out — past `max_iterations / iterations_per_sec` seconds of
    absolute `t` (~12.5s at the defaults), every subsequent call returns the exact
    same fully-matured frame, since nothing about the capped computation depends on
    `t` beyond that point. For a single short preview frame that's invisible; for
    driving reaction-diffusion across a multi-minute video it would read as the
    texture "freezing" partway through — exactly the kind of staleness the stateful
    rd_init/rd_step API exists to avoid. This is also why its default `scale` (8, vs.
    1 for everything else) is higher than the rest of the module: the replay cost is
    otherwise the worst in the vocabulary by a wide margin. See the task report's
    timing table for measured cost of the replay path.
    """
    state = rd_init(shape, seed, preset)
    n_iter = min(max(1, int(max_iterations)), max(1, int(round(t * iterations_per_sec)) + 1))
    for _ in range(n_iter):
        rd_step(state, sub_steps=sub_steps)
    return np.clip(state["V"], 0.0, 1.0).astype(np.float32)


# ---------------------------------------------------------------------------
# SDF family — signed distance primitives + combinators
# ---------------------------------------------------------------------------


def sdf_circle(xx, yy, cx=0.0, cy=0.0, r=0.3):
    return np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) - r


def sdf_box(xx, yy, cx=0.0, cy=0.0, hw=0.3, hh=0.2):
    dx = np.abs(xx - cx) - hw
    dy = np.abs(yy - cy) - hh
    outside = np.sqrt(np.clip(dx, 0.0, None) ** 2 + np.clip(dy, 0.0, None) ** 2)
    inside = np.minimum(np.maximum(dx, dy), 0.0)
    return outside + inside


def sdf_ring(xx, yy, cx=0.0, cy=0.0, r=0.3, thickness=0.04):
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) - r
    return np.abs(d) - thickness


def sdf_line(xx, yy, x0=-0.3, y0=0.0, x1=0.3, y1=0.0, thickness=0.02):
    px, py = xx - x0, yy - y0
    dx, dy = x1 - x0, y1 - y0
    seg_len2 = dx * dx + dy * dy + 1e-9
    tproj = np.clip((px * dx + py * dy) / seg_len2, 0.0, 1.0)
    cx_, cy_ = x0 + tproj * dx, y0 + tproj * dy
    return np.sqrt((xx - cx_) ** 2 + (yy - cy_) ** 2) - thickness


def sdf_triangle(xx, yy, p0=(-0.3, 0.25), p1=(0.3, 0.25), p2=(0.0, -0.3)):
    """Exact signed distance to a triangle (negative inside).

    Standard formulation (Inigo Quilez): compute distance-to-segment and a signed
    cross-product term per edge, using ONE consistent winding sign `s` derived once
    (from edge0 x edge2) rather than per-edge — that consistency is what makes the
    inside/outside test correct instead of an arbitrary product-of-signs.
    """
    p0 = np.asarray(p0, dtype=np.float32)
    p1 = np.asarray(p1, dtype=np.float32)
    p2 = np.asarray(p2, dtype=np.float32)
    e0 = p1 - p0
    e1 = p2 - p1
    e2 = p0 - p2
    v0x, v0y = xx - p0[0], yy - p0[1]
    v1x, v1y = xx - p1[0], yy - p1[1]
    v2x, v2y = xx - p2[0], yy - p2[1]

    def edge_sqdist(vx, vy, ex, ey):
        t = np.clip((vx * ex + vy * ey) / (ex * ex + ey * ey + 1e-9), 0.0, 1.0)
        qx, qy = vx - ex * t, vy - ey * t
        return qx * qx + qy * qy

    d0 = edge_sqdist(v0x, v0y, e0[0], e0[1])
    d1 = edge_sqdist(v1x, v1y, e1[0], e1[1])
    d2 = edge_sqdist(v2x, v2y, e2[0], e2[1])

    s = float(np.sign(e0[0] * e2[1] - e0[1] * e2[0]))
    s0 = s * (v0x * e0[1] - v0y * e0[0])
    s1 = s * (v1x * e1[1] - v1y * e1[0])
    s2 = s * (v2x * e2[1] - v2y * e2[0])

    dist_sq = np.minimum(np.minimum(d0, d1), d2)
    sign_val = np.minimum(np.minimum(s0, s1), s2)
    return -np.sqrt(dist_sq) * np.sign(sign_val)


def sdf_star(xx, yy, cx=0.0, cy=0.0, r_outer=0.35, r_inner=0.15, points=5):
    """Approximate (non-Euclidean but correctly zero-crossing) star boundary: angle
    is folded into one wedge and the radius taper is linear from tip to valley."""
    ang = np.arctan2(yy - cy, xx - cx)
    rad = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    seg = math.pi / max(3, int(points))
    a = np.abs(np.mod(ang + seg, 2 * seg) - seg)
    boundary = r_outer + (r_inner - r_outer) * (a / seg)
    return rad - boundary


def sdf_union(d1, d2):
    return np.minimum(d1, d2)


def sdf_subtract(d1, d2):
    return np.maximum(d1, -d2)


def sdf_intersect(d1, d2):
    return np.maximum(d1, d2)


def sdf_smooth_union(d1, d2, k=0.1):
    """Polynomial smooth-min (Inigo Quilez): rounds the seam between two shapes
    instead of a hard min, giving organic blending."""
    k = max(1e-6, float(k))
    h = np.clip(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0)
    return d2 * (1 - h) + d1 * h - k * h * (1 - h)


def sdf_render(d, edge_width=0.02):
    """Signed distance -> 0..1 luminance with an antialiased edge band."""
    edge_width = max(1e-6, float(edge_width))
    x = np.clip((d + edge_width) / (2 * edge_width), 0.0, 1.0)
    val = 1.0 - _smootherstep(x.astype(np.float32))
    return np.clip(val, 0.0, 1.0).astype(np.float32)


@_scalable()
def vf_sdf_scene(shape, t, progress, seed, **params) -> np.ndarray:
    """Small demo composing the SDF toolkit: a rotating box smooth-unioned with an
    orbiting circle, ringed by a pulsing outline. Proves the primitives + combinators
    + transforms actually compose into diagram-quality geometry, not just texture."""
    yy, xx = _grid(shape)
    seed_phase = _seed_phase(seed)
    yy_r, xx_r = uv_rotate(yy, xx, angle=t * 0.5 + seed_phase)
    d_box = sdf_box(xx_r, yy_r, hw=0.32, hh=0.2)
    d_circle = sdf_circle(
        xx, yy,
        cx=0.28 * math.sin(t * 0.7 + seed_phase),
        cy=0.28 * math.cos(t * 0.7 + seed_phase),
        r=0.2,
    )
    d = sdf_smooth_union(d_box, d_circle, k=0.15)
    ring = sdf_ring(xx, yy, r=0.46 + 0.03 * math.sin(t * 1.3 + seed_phase), thickness=0.014)
    d = sdf_union(d, ring)
    return sdf_render(d, edge_width=0.02)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

FIELDS: dict[str, "object"] = {
    _name: _obj
    for _name, _obj in list(globals().items())
    if _name.startswith("vf_") and callable(_obj)
}
