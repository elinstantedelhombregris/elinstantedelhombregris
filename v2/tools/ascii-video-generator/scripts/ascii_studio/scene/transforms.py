"""Coordinate transforms applied BEFORE evaluating a value field.

This is the "camera" vocabulary for a system with no real 3D: every function here
takes a pair of coordinate grids and returns a new pair, so a field generator that
samples ``(yy, xx)`` sees a rotated / tiled / twisted / warped version of the plane
without knowing anything changed.

Convention
----------
Every transform's signature is ``fn(yy, xx, **params) -> (yy, xx)`` — matching the
prose contract "functions that take and return coordinate grids (yy, xx)". Grids are
plain float32 numpy arrays of identical shape; nothing here cares what that shape is,
so transforms compose freely:

    yy2, xx2 = uv_twist(*uv_rotate(yy, xx, angle=0.4), amount=0.3)

``uv_polar`` is the one exception in *meaning* (not signature): it still takes and
returns a 2-tuple of same-shape arrays, but the returned pair is ``(radius, angle)``
rather than ``(yy, xx)``. Feed that pair into ``uv_cartesian_from_polar`` to get back
to cartesian, or straight into any transform that treats its first argument as a
radial coordinate (e.g. a caller building a radial ripple by hand).
"""

from __future__ import annotations

import numpy as np


def uv_rotate(
    yy: np.ndarray, xx: np.ndarray, angle: float = 0.0, cx: float = 0.0, cy: float = 0.0
) -> tuple[np.ndarray, np.ndarray]:
    """Rotate the plane by `angle` radians about (cx, cy)."""
    ca, sa = np.cos(angle, dtype=np.float32), np.sin(angle, dtype=np.float32)
    x = xx - cx
    y = yy - cy
    xr = x * ca - y * sa
    yr = x * sa + y * ca
    return (yr + cy).astype(np.float32), (xr + cx).astype(np.float32)


def uv_scale(
    yy: np.ndarray, xx: np.ndarray, sx: float = 1.0, sy: float = 1.0,
    cx: float = 0.0, cy: float = 0.0,
) -> tuple[np.ndarray, np.ndarray]:
    """Zoom the plane. sx/sy > 1 zooms IN (the sampled field looks bigger)."""
    sx = sx if abs(sx) > 1e-9 else 1e-9
    sy = sy if abs(sy) > 1e-9 else 1e-9
    return (
        ((yy - cy) / sy + cy).astype(np.float32),
        ((xx - cx) / sx + cx).astype(np.float32),
    )


def uv_tile(
    yy: np.ndarray, xx: np.ndarray, period: float = 1.0, mirror: bool = True
) -> tuple[np.ndarray, np.ndarray]:
    """Repeat the plane every `period` units.

    With `mirror=True` each repeat is flipped (triangle-wave fold), so a field
    sampled through this transform tiles with NO visible seam: the value at the
    right edge of one tile is continuous with the value at the right edge of its
    mirrored neighbour, because they're literally the same sample. Plain `mod`
    tiling (`mirror=False`) is cheaper but seams whenever the field isn't already
    periodic on its own.
    """
    period = max(1e-6, float(period))
    if mirror:
        y = np.abs(np.mod(yy, 2 * period) - period)
        x = np.abs(np.mod(xx, 2 * period) - period)
    else:
        y = np.mod(yy, period)
        x = np.mod(xx, period)
    return y.astype(np.float32), x.astype(np.float32)


def uv_polar(
    yy: np.ndarray, xx: np.ndarray, cx: float = 0.0, cy: float = 0.0
) -> tuple[np.ndarray, np.ndarray]:
    """Cartesian -> polar. Returns (radius, angle), NOT (yy, xx).

    Piping any linear/1D effect through radius (or angle) instead of y (or x) turns
    it radial for free — e.g. rings are just "ripple, but sampled through uv_polar".
    """
    dx = xx - cx
    dy = yy - cy
    r = np.sqrt(dx * dx + dy * dy)
    a = np.arctan2(dy, dx)
    return r.astype(np.float32), a.astype(np.float32)


def uv_cartesian_from_polar(
    r: np.ndarray, a: np.ndarray, cx: float = 0.0, cy: float = 0.0
) -> tuple[np.ndarray, np.ndarray]:
    """Polar (radius, angle) -> cartesian (yy, xx). Inverse of uv_polar."""
    xx = cx + r * np.cos(a)
    yy = cy + r * np.sin(a)
    return yy.astype(np.float32), xx.astype(np.float32)


def uv_twist(
    yy: np.ndarray, xx: np.ndarray, amount: float = 0.3, cx: float = 0.0, cy: float = 0.0
) -> tuple[np.ndarray, np.ndarray]:
    """Rotate more the further a point is from centre -> spiral distortion."""
    dx, dy = xx - cx, yy - cy
    r = np.sqrt(dx * dx + dy * dy)
    angle = amount * r
    ca, sa = np.cos(angle), np.sin(angle)
    xr = dx * ca - dy * sa
    yr = dx * sa + dy * ca
    return (yr + cy).astype(np.float32), (xr + cx).astype(np.float32)


def uv_fisheye(
    yy: np.ndarray, xx: np.ndarray, strength: float = 0.5, cx: float = 0.0, cy: float = 0.0
) -> tuple[np.ndarray, np.ndarray]:
    """Barrel distortion: pixels push outward proportional to r^2 * strength.

    Positive `strength` bulges the centre outward (barrel); negative pinches it
    inward (pincushion).
    """
    dx, dy = xx - cx, yy - cy
    r2 = dx * dx + dy * dy
    factor = (1.0 + strength * r2).astype(np.float32)
    return (dy * factor + cy).astype(np.float32), (dx * factor + cx).astype(np.float32)


def uv_mobius(
    yy: np.ndarray,
    xx: np.ndarray,
    a: complex = 1 + 0j,
    b: complex = 0 + 0j,
    c: complex = 0.3 + 0j,
    d: complex = 1 + 0j,
) -> tuple[np.ndarray, np.ndarray]:
    """Conformal Mobius transform w = (az+b)/(cz+d) on the complex plane z = x + iy.

    Angle-preserving but NOT distance-preserving, which is exactly what makes it
    look striking on a regular field: straight lines and circles stay lines/circles,
    but spacing warps dramatically near the pole at z = -d/c. Identity params
    (a=1, b=0, c=0, d=1) leave the plane untouched.
    """
    z = xx.astype(np.complex64) + 1j * yy.astype(np.complex64)
    num = a * z + b
    den = c * z + d
    den = np.where(np.abs(den) < 1e-6, 1e-6 + 0j, den)
    w = num / den
    return w.imag.astype(np.float32), w.real.astype(np.float32)
