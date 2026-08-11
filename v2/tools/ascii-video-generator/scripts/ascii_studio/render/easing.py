"""Easing curves, keyframing, and directional-arc helpers.

The easing families (quad/cubic/expo/elastic/bounce, each in/out/in-out) are the
standard formulas from easings.net, vectorised so they work on both a bare float and
a numpy array of progress values. Every one of them maps 0 -> 0 and 1 -> 1 exactly
(elastic and bounce overshoot *between* the endpoints, never at them).

The directional-arc helpers are the fix for "timing" complaints rooted in aimless
oscillation: instead of `sin(t * speed)` wobbling forever, these are all monotonic,
one-shot functions of a `progress` value that itself runs 0 -> 1 once per element's
lifetime -- motion has a clear beginning, middle, and end instead of looping.
"""

from __future__ import annotations

from typing import Callable, Sequence

import numpy as np

Number = float
ArrayLike = "np.ndarray | float"


def linear(t):
    return t


# -- quad ---------------------------------------------------------------------

def quad_in(t):
    return t * t


def quad_out(t):
    return 1.0 - (1.0 - t) * (1.0 - t)


def quad_in_out(t):
    t = np.asarray(t, dtype=np.float64)
    result = np.where(t < 0.5, 2.0 * t * t, 1.0 - ((-2.0 * t + 2.0) ** 2) / 2.0)
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


# -- cubic --------------------------------------------------------------------

def cubic_in(t):
    return t ** 3


def cubic_out(t):
    return 1.0 - (1.0 - t) ** 3


def cubic_in_out(t):
    t = np.asarray(t, dtype=np.float64)
    result = np.where(t < 0.5, 4.0 * t ** 3, 1.0 - ((-2.0 * t + 2.0) ** 3) / 2.0)
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


# -- expo -----------------------------------------------------------------------

def expo_in(t):
    t = np.asarray(t, dtype=np.float64)
    result = np.where(t <= 0.0, 0.0, 2.0 ** (10.0 * t - 10.0))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


def expo_out(t):
    t = np.asarray(t, dtype=np.float64)
    result = np.where(t >= 1.0, 1.0, 1.0 - 2.0 ** (-10.0 * t))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


def expo_in_out(t):
    t = np.asarray(t, dtype=np.float64)
    mid = np.where(
        t < 0.5,
        (2.0 ** (20.0 * t - 10.0)) / 2.0,
        (2.0 - 2.0 ** (-20.0 * t + 10.0)) / 2.0,
    )
    result = np.where(t <= 0.0, 0.0, np.where(t >= 1.0, 1.0, mid))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


# -- elastic --------------------------------------------------------------------

_C4 = (2.0 * np.pi) / 3.0
_C5 = (2.0 * np.pi) / 4.5


def elastic_in(t):
    t = np.asarray(t, dtype=np.float64)
    body = -(2.0 ** (10.0 * t - 10.0)) * np.sin((t * 10.0 - 10.75) * _C4)
    result = np.where(t <= 0.0, 0.0, np.where(t >= 1.0, 1.0, body))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


def elastic_out(t):
    t = np.asarray(t, dtype=np.float64)
    body = (2.0 ** (-10.0 * t)) * np.sin((t * 10.0 - 0.75) * _C4) + 1.0
    result = np.where(t <= 0.0, 0.0, np.where(t >= 1.0, 1.0, body))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


def elastic_in_out(t):
    t = np.asarray(t, dtype=np.float64)
    grow = -((2.0 ** (20.0 * t - 10.0)) * np.sin((20.0 * t - 11.125) * _C5)) / 2.0
    shrink = ((2.0 ** (-20.0 * t + 10.0)) * np.sin((20.0 * t - 11.125) * _C5)) / 2.0 + 1.0
    mid = np.where(t < 0.5, grow, shrink)
    result = np.where(t <= 0.0, 0.0, np.where(t >= 1.0, 1.0, mid))
    return result.item() if np.isscalar(t) or result.ndim == 0 else result


# -- bounce -----------------------------------------------------------------------

_BOUNCE_N1 = 7.5625
_BOUNCE_D1 = 2.75


def _bounce_out_raw(t: np.ndarray) -> np.ndarray:
    t = np.asarray(t, dtype=np.float64)
    out = np.empty_like(t)
    m1 = t < 1.0 / _BOUNCE_D1
    m2 = (~m1) & (t < 2.0 / _BOUNCE_D1)
    m3 = (~m1) & (~m2) & (t < 2.5 / _BOUNCE_D1)
    m4 = ~(m1 | m2 | m3)
    out[m1] = _BOUNCE_N1 * t[m1] * t[m1]
    t2 = t - 1.5 / _BOUNCE_D1
    out[m2] = _BOUNCE_N1 * t2[m2] * t2[m2] + 0.75
    t3 = t - 2.25 / _BOUNCE_D1
    out[m3] = _BOUNCE_N1 * t3[m3] * t3[m3] + 0.9375
    t4 = t - 2.625 / _BOUNCE_D1
    out[m4] = _BOUNCE_N1 * t4[m4] * t4[m4] + 0.984375
    return out


def bounce_out(t):
    arr = np.atleast_1d(np.asarray(t, dtype=np.float64))
    result = _bounce_out_raw(np.clip(arr, 0.0, 1.0))
    return float(result[0]) if np.isscalar(t) or np.ndim(t) == 0 else result


def bounce_in(t):
    arr = np.atleast_1d(np.asarray(t, dtype=np.float64))
    result = 1.0 - _bounce_out_raw(np.clip(1.0 - arr, 0.0, 1.0))
    return float(result[0]) if np.isscalar(t) or np.ndim(t) == 0 else result


def bounce_in_out(t):
    arr = np.atleast_1d(np.asarray(t, dtype=np.float64))
    lo = (1.0 - _bounce_out_raw(np.clip(1.0 - 2.0 * arr, 0.0, 1.0))) / 2.0
    hi = (1.0 + _bounce_out_raw(np.clip(2.0 * arr - 1.0, 0.0, 1.0))) / 2.0
    result = np.where(arr < 0.5, lo, hi)
    return float(result[0]) if np.isscalar(t) or np.ndim(t) == 0 else result


EASINGS: dict[str, Callable] = {
    "linear": linear,
    "quad_in": quad_in,
    "quad_out": quad_out,
    "quad_in_out": quad_in_out,
    "cubic_in": cubic_in,
    "cubic_out": cubic_out,
    "cubic_in_out": cubic_in_out,
    "expo_in": expo_in,
    "expo_out": expo_out,
    "expo_in_out": expo_in_out,
    "elastic_in": elastic_in,
    "elastic_out": elastic_out,
    "elastic_in_out": elastic_in_out,
    "bounce_in": bounce_in,
    "bounce_out": bounce_out,
    "bounce_in_out": bounce_in_out,
}


def keyframe(
    t: float,
    points: Sequence[tuple[float, float]],
    ease: Callable = linear,
    loop: bool = False,
) -> float:
    """Interpolate `[(time, value), ...]` at `t`, easing within each segment.

    Before the first keyframe, holds the first value; after the last, holds the
    last value -- unless `loop` is set, in which case `t` wraps modulo the span
    from the first to the last keyframe, and the segment from the last point back
    to the first (offset by that span) closes the loop.
    """
    if not points:
        raise ValueError("keyframe() needs at least one point")
    pts = sorted(points, key=lambda p: p[0])
    if len(pts) == 1:
        return pts[0][1]

    span = pts[-1][0] - pts[0][0]
    if loop and span > 0:
        t = pts[0][0] + ((t - pts[0][0]) % span)
        pts = list(pts) + [(pts[-1][0] + (pts[0][0] - pts[-1][0] + span), pts[0][1])]

    if t <= pts[0][0]:
        return pts[0][1]
    if t >= pts[-1][0]:
        return pts[-1][1]

    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t0 <= t <= t1:
            local = (t - t0) / (t1 - t0) if t1 > t0 else 0.0
            return v0 + (v1 - v0) * float(ease(local))
    return pts[-1][1]  # pragma: no cover -- unreachable given the bounds checks above


# -- directional arcs -----------------------------------------------------------
#
# All of these take a `progress` (or `local_t`) that runs 0 -> 1 once, and are
# monotonic non-decreasing over that run -- the antidote to unbounded sin() wobble.

def ramp(progress):
    return progress


def ease_out(progress):
    p = np.asarray(progress, dtype=np.float64)
    result = 1.0 - (1.0 - p) ** 2
    return result.item() if np.isscalar(progress) or result.ndim == 0 else result


def step_reveal(progress, at: float = 0.5, width: float = 0.25):
    p = np.asarray(progress, dtype=np.float64)
    result = np.clip((p - at) / width, 0.0, 1.0)
    return result.item() if np.isscalar(progress) or result.ndim == 0 else result


def build_plateau(progress):
    p = np.asarray(progress, dtype=np.float64)
    result = np.minimum(1.0, p * 1.5)
    return result.item() if np.isscalar(progress) or result.ndim == 0 else result


def layer_strength(local_t, enter_t: float, ramp: float = 1.5):
    t = np.asarray(local_t, dtype=np.float64)
    result = np.clip((t - enter_t) / ramp, 0.0, 1.0)
    return result.item() if np.isscalar(local_t) or result.ndim == 0 else result
