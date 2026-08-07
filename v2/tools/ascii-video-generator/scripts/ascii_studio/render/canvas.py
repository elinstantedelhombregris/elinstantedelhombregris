"""Grid geometry and named safe areas.

v1 positioned everything with magic numbers in a 720x1280 space, which is why the
chapter keyword at y=628 rendered behind the caption plate at y=760. Zones make that
class of bug structurally impossible: a scene may only draw inside `stage`.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .tokens import Look


@dataclass(frozen=True)
class Zone:
    name: str
    y0: float
    y1: float
    x0: float = 0.04
    x1: float = 0.96


ZONES: dict[str, Zone] = {
    "title": Zone("title", 0.020, 0.100),
    "stage": Zone("stage", 0.105, 0.600),
    "caption": Zone("caption", 0.620, 0.800),
    "footer": Zone("footer", 0.840, 0.880),
}

# Regions the platforms cover with their own UI. Nothing load-bearing goes here.
PLATFORM_MASKS: dict[str, Zone] = {
    "instagram": Zone("instagram", 0.885, 1.000, 0.00, 1.00),
    "tiktok": Zone("tiktok", 0.885, 1.000, 0.00, 0.88),
}


@dataclass(frozen=True)
class Grid:
    width: int
    height: int
    cell_w: int
    cell_h: int
    cols: int
    rows: int
    supersample: int

    def buffer_shape(self) -> tuple[int, int]:
        """(height, width) of the supersampled luminance buffer."""
        return self.height * self.supersample, self.width * self.supersample

    def zone_px(self, zone: Zone) -> tuple[int, int, int, int]:
        return (
            int(round(zone.x0 * self.width)),
            int(round(zone.y0 * self.height)),
            int(round(zone.x1 * self.width)),
            int(round(zone.y1 * self.height)),
        )

    def zone_cells(self, zone: Zone) -> tuple[int, int, int, int]:
        x0, y0, x1, y1 = self.zone_px(zone)
        return (
            x0 // self.cell_w,
            y0 // self.cell_h,
            max(x0 // self.cell_w + 1, -(-x1 // self.cell_w)),
            max(y0 // self.cell_h + 1, -(-y1 // self.cell_h)),
        )


def make_grid(width: int, height: int, look: Look) -> Grid:
    if width <= 0 or height <= 0:
        raise ValueError("Canvas dimensions must be positive")
    # Standard social canvases are not guaranteed to divide cleanly into the
    # selected glyph cell (1080 / 16 is the canonical square example).  Tile
    # one partial cell beyond the bottom/right edge and crop after glyph
    # compositing; layout coordinates and the luminance buffer stay exact.
    return Grid(
        width=width,
        height=height,
        cell_w=look.cell_w,
        cell_h=look.cell_h,
        cols=math.ceil(width / look.cell_w),
        rows=math.ceil(height / look.cell_h),
        supersample=look.supersample,
    )


def zone_conflicts() -> list[tuple[str, str]]:
    """Pairs of content zones that overlap vertically. Must always be empty."""
    names = list(ZONES)
    clashes: list[tuple[str, str]] = []
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            za, zb = ZONES[a], ZONES[b]
            if za.y0 < zb.y1 and zb.y0 < za.y1:
                clashes.append((a, b))
    return clashes
