# ASCII Studio v2 — Phase 1a (Render Core) Implementation Plan

> **Part 1 of 2.** This plan builds and proves the new rendering engine in isolation.
> [Phase 1b](2026-08-05-ascii-studio-v2-phase1b-migration.md) then ports v1's speech, caption,
> audio and encode machinery into the package, swaps this engine in underneath it, and deletes
> v1 — leaving exactly one system. **1a leaves v1 running and untouched**; do not delete
> anything until 1b.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the renderer's output stages so every pixel of a frame is a character chosen by best-match symbol selection, rendered in a silver/plata palette on a collision-proof layout, at roughly 20× the current speed.

**Architecture:** The v1 pipeline is `sine field → per-cell PIL text calls → vector overlay on top → post`. Phase 1 rebuilds stages 2–4 into `luminance buffer → glyph grid (best-match + dither + hysteresis) → vectorised atlas blit (OKLab colour) → graded post`. Stage 1 (what the buffer *contains*) stays as the existing v1 geometry for now — but that geometry is rasterised **into the luminance buffer instead of composited as vectors on top**, which delivers the core promise ("the picture is made of characters") before Phase 2 replaces the geometry with real diagram archetypes. This is the clean seam: **Phase 1 owns stages 2–4, Phase 2 owns stage 1.**

**Tech Stack:** Python 3.12.7 (`/opt/anaconda3/bin/python3`), numpy 1.26.4, OpenCV 4.12.0, Pillow 10.4.0, pytest 9.0.2, ffmpeg 8.0.1. 12 CPU cores available.

## Global Constraints

- **Python interpreter is `/opt/anaconda3/bin/python3`** — this is what the Studio invokes (`studio-jobs.json` records it in every `command`). Never assume bare `python3`.
- **No new third-party dependencies.** numpy, cv2, PIL, scipy and pytest are already present; the spec's non-goals forbid adding a network or LLM dependency.
- **Do not modify** `speech/`-destined logic during Phase 1. The TTS, word-alignment and caption-sync code in `render_cinematic_ascii_video.py` is *moved* verbatim, never edited. It encodes expensively-found bugs (Edge `WordBoundary` handling, `#uno` punctuation-token discard, `17:21` colon splitting, Spanish thousands parsing).
- **Grid is exactly 120 cols × 128 rows at 1080×1920** — cell 9×15px. `120*9 = 1080`, `128*15 = 1920` must hold exactly; assert it.
- **All colour interpolation happens in OKLab**, never RGB.
- **Fonts:** field and UI font both `/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf` (verified 2026-08-05: monospace, 62 of 63 candidate glyphs; only `○` U+25CB is absent and `available_chars()` drops it automatically). `/System/Library/Fonts/Menlo.ttc` has full 63/63 coverage and is the fallback if a glyph gap ever matters. Both are tokens.
- **Palette:** background `#050607`, silver ramp, accent `#7D5BDE` (iris-violet). Accent is reserved for exactly three uses and must not appear elsewhere.
- **Existing CLI must keep working.** `scripts/render_cinematic_ascii_video.py` becomes a delegating shim; the Studio's recorded commands must run unchanged.
- **Commit after every task.** The baseline is commit `6a6df2c`.

---

## File Structure

Created in Phase 1:

| Path | Responsibility |
|---|---|
| `pytest.ini` | pytest config, test discovery root |
| `tests/conftest.py` | puts `scripts/` on `sys.path` |
| `scripts/ascii_studio/__init__.py` | package marker |
| `scripts/ascii_studio/render/color.py` | OKLab conversion and blending |
| `scripts/ascii_studio/render/tokens.py` | `Look` dataclass, preset loading |
| `scripts/ascii_studio/render/looks/plata.json` | the default look |
| `scripts/ascii_studio/render/canvas.py` | grid geometry, zones, safe areas, platform masks |
| `scripts/ascii_studio/render/glyphs.py` | glyph atlas, signatures, best-match, blit |
| `scripts/ascii_studio/render/asciify.py` | luminance buffer → glyph grid |
| `scripts/ascii_studio/render/post.py` | grade, halation, grain, scanlines, vignette |
| `scripts/ascii_studio/scene/legacy.py` | v1 geometry rasterised into luminance buffers |
| `scripts/ascii_studio/render/frames.py` | frame assembly + worker pool |
| `scripts/ascii_studio/stills.py` | one still per chapter |
| `scripts/ascii_studio/verify.py` | safe-area assertions, golden frames |

Modified: `scripts/render_cinematic_ascii_video.py` (becomes a shim in Task 12).

Deferred to Phase 2 (do **not** build here): scene archetypes, 3D rasteriser, camera, reveal schedule, anchor-to-word binding, recursive typography, glyph-level transitions.

---

## Task 1: Package skeleton and test harness

**Files:**
- Create: `pytest.ini`, `tests/conftest.py`, `tests/test_harness.py`
- Create: `scripts/ascii_studio/__init__.py`, `scripts/ascii_studio/render/__init__.py`, `scripts/ascii_studio/scene/__init__.py`

**Interfaces:**
- Consumes: nothing
- Produces: importable package `ascii_studio`; `pytest` runnable from the skill root

- [ ] **Step 1: Write the failing test**

Create `tests/test_harness.py`:

```python
def test_package_imports():
    import ascii_studio
    assert ascii_studio.__name__ == "ascii_studio"


def test_render_subpackage_imports():
    import ascii_studio.render
    assert ascii_studio.render.__name__ == "ascii_studio.render"
```

Create `tests/conftest.py`:

```python
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))
```

Create `pytest.ini`:

```ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -q
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/juanb/.codex/skills/create-ascii-blog-videos && /opt/anaconda3/bin/python3 -m pytest tests/test_harness.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ascii_studio'`

- [ ] **Step 3: Create the package**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
mkdir -p scripts/ascii_studio/render/looks scripts/ascii_studio/scene
printf '"""Cinematic ASCII Studio v2."""\n' > scripts/ascii_studio/__init__.py
printf '"""Rendering pipeline: buffers -> glyphs -> pixels -> grade."""\n' > scripts/ascii_studio/render/__init__.py
printf '"""Scene sources: what the luminance buffer contains."""\n' > scripts/ascii_studio/scene/__init__.py
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_harness.py -v`
Expected: PASS, 2 passed

- [ ] **Step 5: Commit**

```bash
git add pytest.ini tests scripts/ascii_studio
git commit -m "Add ascii_studio package skeleton and pytest harness"
```

---

## Task 2: OKLab colour

**Files:**
- Create: `scripts/ascii_studio/render/color.py`
- Test: `tests/test_color.py`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `hex_to_rgb01(value: str) -> np.ndarray` — shape `(3,)` float32 in 0..1
  - `srgb_to_oklab(rgb: np.ndarray) -> np.ndarray` — `(...,3)` float in 0..1 → `(...,3)` L,a,b
  - `oklab_to_srgb(lab: np.ndarray) -> np.ndarray` — inverse, clipped to 0..1
  - `mix_oklab(c0: np.ndarray, c1: np.ndarray, t) -> np.ndarray` — `c0`,`c1` are sRGB `(...,3)`; `t` float or broadcastable array; returns sRGB
  - `ramp_lookup(ramp_srgb: np.ndarray, v: np.ndarray) -> np.ndarray` — `ramp_srgb` `(n,3)`, `v` any shape in 0..1 → `(...,3)` interpolated in OKLab

- [ ] **Step 1: Write the failing test**

Create `tests/test_color.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_color.py -v`
Expected: FAIL with `ImportError: cannot import name 'color'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/color.py`:

```python
"""Perceptual colour. All interpolation happens in OKLab, never RGB.

RGB interpolation desaturates through the midpoint, which is why v1 blends passed
through muddy grey. OKLab (Bjorn Ottosson, 2020) keeps perceived lightness linear.
"""

from __future__ import annotations

import numpy as np

# linear sRGB -> LMS
_RGB_TO_LMS = np.array([
    [0.4122214708, 0.5363325363, 0.0514459929],
    [0.2119034982, 0.6806995451, 0.1073969566],
    [0.0883024619, 0.2817188376, 0.6299787005],
], dtype=np.float64)

# LMS' (cube-rooted) -> OKLab
_LMS_TO_LAB = np.array([
    [0.2104542553, 0.7936177850, -0.0040720468],
    [1.9779984951, -2.4285922050, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.8086757660],
], dtype=np.float64)

_LAB_TO_LMS = np.linalg.inv(_LMS_TO_LAB)
_LMS_TO_RGB = np.linalg.inv(_RGB_TO_LMS)


def hex_to_rgb01(value: str) -> np.ndarray:
    """'#7D5BDE' or '7D5BDE' -> float32 (3,) in 0..1."""
    value = value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"Expected a 6-digit hex colour, got {value!r}")
    return np.array(
        [int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32
    )


def rgb01_to_hex(rgb: np.ndarray) -> str:
    channels = np.clip(np.asarray(rgb, dtype=np.float64), 0.0, 1.0) * 255.0
    return "#" + "".join(f"{int(round(c)):02x}" for c in channels)


def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * (c ** (1 / 2.4)) - 0.055)


def srgb_to_oklab(rgb: np.ndarray) -> np.ndarray:
    """sRGB (...,3) in 0..1 -> OKLab (...,3)."""
    linear = _srgb_to_linear(np.asarray(rgb, dtype=np.float64))
    lms = linear @ _RGB_TO_LMS.T
    # Preserve sign so the cube root stays real for slightly-negative values.
    lms_cbrt = np.sign(lms) * np.abs(lms) ** (1.0 / 3.0)
    return (lms_cbrt @ _LMS_TO_LAB.T).astype(np.float32)


def oklab_to_srgb(lab: np.ndarray) -> np.ndarray:
    """OKLab (...,3) -> sRGB (...,3) in 0..1, clipped."""
    lms_cbrt = np.asarray(lab, dtype=np.float64) @ _LAB_TO_LMS.T
    lms = lms_cbrt ** 3
    linear = lms @ _LMS_TO_RGB.T
    return np.clip(_linear_to_srgb(linear), 0.0, 1.0).astype(np.float32)


def mix_oklab(c0: np.ndarray, c1: np.ndarray, t) -> np.ndarray:
    """Blend two sRGB colours through OKLab. `t` may be scalar or broadcastable."""
    lab0 = srgb_to_oklab(c0).astype(np.float64)
    lab1 = srgb_to_oklab(c1).astype(np.float64)
    weight = np.clip(np.asarray(t, dtype=np.float64), 0.0, 1.0)[..., None] if np.ndim(t) else float(np.clip(t, 0.0, 1.0))
    return oklab_to_srgb(lab0 + (lab1 - lab0) * weight)


def ramp_lookup(ramp_srgb: np.ndarray, v: np.ndarray) -> np.ndarray:
    """Sample an sRGB ramp (n,3) at positions `v` in 0..1, interpolating in OKLab.

    Returns sRGB with shape v.shape + (3,).
    """
    ramp_lab = srgb_to_oklab(np.asarray(ramp_srgb, dtype=np.float32)).astype(np.float64)
    n = ramp_lab.shape[0]
    if n < 2:
        raise ValueError("A ramp needs at least two stops")
    pos = np.clip(np.asarray(v, dtype=np.float64), 0.0, 1.0) * (n - 1)
    low = np.floor(pos).astype(np.int64)
    low = np.clip(low, 0, n - 2)
    frac = (pos - low)[..., None]
    lab = ramp_lab[low] * (1.0 - frac) + ramp_lab[low + 1] * frac
    return oklab_to_srgb(lab)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_color.py -v`
Expected: PASS, 11 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/color.py tests/test_color.py
git commit -m "Add OKLab colour module replacing naive RGB interpolation"
```

---

## Task 3: Design tokens and the plata look

**Files:**
- Create: `scripts/ascii_studio/render/tokens.py`, `scripts/ascii_studio/render/looks/plata.json`
- Test: `tests/test_tokens.py`

**Interfaces:**
- Consumes: `color.hex_to_rgb01`
- Produces:
  - `Look` frozen dataclass with fields: `name, background, ramp, accent, glyph_set, field_font, ui_font, cell_w, cell_h, hysteresis, dither, supersample, grain, halation, scanlines, vignette`
  - `load_look(name: str) -> Look`
  - `Look.ramp_rgb() -> np.ndarray` shape `(n,3)` float32
  - `Look.accent_rgb() -> np.ndarray` shape `(3,)` float32
  - `Look.background_rgb() -> np.ndarray` shape `(3,)` float32

- [ ] **Step 1: Write the failing test**

Create `tests/test_tokens.py`:

```python
from pathlib import Path

import numpy as np
import pytest

from ascii_studio.render import tokens


def test_plata_loads():
    look = tokens.load_look("plata")
    assert look.name == "plata"
    assert look.background == "#050607"
    assert look.accent == "#7D5BDE"


def test_plata_grid_divides_1080x1920_exactly():
    """Global constraint: 120x128 cells at 9x15px must tile 1080x1920 with no remainder."""
    look = tokens.load_look("plata")
    assert 1080 % look.cell_w == 0
    assert 1920 % look.cell_h == 0
    assert 1080 // look.cell_w == 120
    assert 1920 // look.cell_h == 128


def test_fonts_exist_on_disk():
    look = tokens.load_look("plata")
    assert Path(look.field_font).exists(), look.field_font
    assert Path(look.ui_font).exists(), look.ui_font
    assert "JetBrainsMono" in look.field_font


def test_ramp_is_monotonically_lighter():
    from ascii_studio.render import color
    look = tokens.load_look("plata")
    lightness = color.srgb_to_oklab(look.ramp_rgb())[:, 0]
    assert np.all(np.diff(lightness) > 0), lightness


def test_accent_and_background_rgb():
    look = tokens.load_look("plata")
    assert look.accent_rgb().shape == (3,)
    assert np.allclose(look.background_rgb(), [5 / 255, 6 / 255, 7 / 255], atol=1e-4)


def test_look_is_immutable():
    look = tokens.load_look("plata")
    with pytest.raises(Exception):
        look.cell_w = 12


def test_unknown_look_raises():
    with pytest.raises(FileNotFoundError):
        tokens.load_look("does-not-exist")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_tokens.py -v`
Expected: FAIL with `ImportError: cannot import name 'tokens'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/looks/plata.json`:

```json
{
  "name": "plata",
  "background": "#050607",
  "ramp": ["#0b0d0f", "#20252b", "#3b434c", "#5c666f", "#828d96", "#adb7bf", "#d5dce1", "#f2f5f7"],
  "accent": "#7D5BDE",
  "glyph_set": "cinematic",
  "field_font": "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf",
  "ui_font": "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf",
  "cell_w": 9,
  "cell_h": 15,
  "hysteresis": 0.06,
  "dither": "bayer8",
  "supersample": 2,
  "grain": 0.012,
  "halation": 0.22,
  "scanlines": 0.04,
  "vignette": 0.18
}
```

Create `scripts/ascii_studio/render/tokens.py`:

```python
"""Design tokens. Every look-affecting value lives here or in looks/*.json.

Nothing that changes how the render looks may be hardcoded in drawing code.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from . import color

LOOKS_DIR = Path(__file__).parent / "looks"


@dataclass(frozen=True)
class Look:
    name: str
    background: str
    ramp: tuple[str, ...]
    accent: str
    glyph_set: str
    field_font: str
    ui_font: str
    cell_w: int
    cell_h: int
    hysteresis: float
    dither: str
    supersample: int
    grain: float
    halation: float
    scanlines: float
    vignette: float

    def ramp_rgb(self) -> np.ndarray:
        return np.stack([color.hex_to_rgb01(stop) for stop in self.ramp])

    def accent_rgb(self) -> np.ndarray:
        return color.hex_to_rgb01(self.accent)

    def background_rgb(self) -> np.ndarray:
        return color.hex_to_rgb01(self.background)


def load_look(name: str) -> Look:
    path = LOOKS_DIR / f"{name}.json"
    if not path.exists():
        available = sorted(p.stem for p in LOOKS_DIR.glob("*.json"))
        raise FileNotFoundError(f"Unknown look {name!r}. Available: {available}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    payload["ramp"] = tuple(payload["ramp"])
    return Look(**payload)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_tokens.py -v`
Expected: PASS, 7 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/tokens.py scripts/ascii_studio/render/looks tests/test_tokens.py
git commit -m "Add design tokens and the plata look"
```

---

## Task 4: Canvas grid, zones and platform safe areas

**Files:**
- Create: `scripts/ascii_studio/render/canvas.py`
- Test: `tests/test_canvas.py`

**Interfaces:**
- Consumes: `tokens.Look`
- Produces:
  - `Zone` frozen dataclass: `name, y0, y1, x0, x1` (all normalized 0..1)
  - `ZONES: dict[str, Zone]` with keys `title`, `stage`, `caption`, `footer`
  - `PLATFORM_MASKS: dict[str, Zone]` with keys `instagram`, `tiktok`
  - `Grid` frozen dataclass: `width, height, cell_w, cell_h, cols, rows, supersample`
  - `make_grid(width: int, height: int, look: Look) -> Grid`
  - `Grid.buffer_shape() -> tuple[int, int]` — `(height*ss, width*ss)`
  - `Grid.zone_px(zone: Zone) -> tuple[int, int, int, int]` — `(x0, y0, x1, y1)` in pixels
  - `Grid.zone_cells(zone: Zone) -> tuple[int, int, int, int]` — `(col0, row0, col1, row1)`
  - `zone_conflicts() -> list[tuple[str, str]]` — pairs of overlapping content zones

- [ ] **Step 1: Write the failing test**

Create `tests/test_canvas.py`:

```python
import pytest

from ascii_studio.render import canvas, tokens


@pytest.fixture
def look():
    return tokens.load_look("plata")


def test_grid_is_exactly_120x128(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert (grid.cols, grid.rows) == (120, 128)


def test_grid_tiles_canvas_exactly(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert grid.cols * grid.cell_w == grid.width
    assert grid.rows * grid.cell_h == grid.height


def test_non_divisible_canvas_is_rejected(look):
    with pytest.raises(ValueError, match="must divide"):
        canvas.make_grid(1081, 1920, look)


def test_buffer_shape_applies_supersample(look):
    grid = canvas.make_grid(1080, 1920, look)
    assert grid.buffer_shape() == (1920 * look.supersample, 1080 * look.supersample)


def test_content_zones_do_not_overlap():
    assert canvas.zone_conflicts() == []


def test_zone_order_is_top_to_bottom():
    order = ["title", "stage", "caption", "footer"]
    tops = [canvas.ZONES[name].y0 for name in order]
    assert tops == sorted(tops)


def test_footer_clears_platform_ui():
    """v1 put the signature at y=0.94, inside TikTok's overlay. It must now clear it."""
    footer = canvas.ZONES["footer"]
    for name, mask in canvas.PLATFORM_MASKS.items():
        assert footer.y1 <= mask.y0, f"footer overlaps {name} UI"


def test_zone_px_is_inside_canvas(look):
    grid = canvas.make_grid(1080, 1920, look)
    for zone in canvas.ZONES.values():
        x0, y0, x1, y1 = grid.zone_px(zone)
        assert 0 <= x0 < x1 <= grid.width
        assert 0 <= y0 < y1 <= grid.height


def test_zone_cells_are_within_grid(look):
    grid = canvas.make_grid(1080, 1920, look)
    for zone in canvas.ZONES.values():
        c0, r0, c1, r1 = grid.zone_cells(zone)
        assert 0 <= c0 < c1 <= grid.cols
        assert 0 <= r0 < r1 <= grid.rows


def test_stage_is_the_largest_zone():
    heights = {name: z.y1 - z.y0 for name, z in canvas.ZONES.items()}
    assert max(heights, key=heights.get) == "stage"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_canvas.py -v`
Expected: FAIL with `ImportError: cannot import name 'canvas'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/canvas.py`:

```python
"""Grid geometry and named safe areas.

v1 positioned everything with magic numbers in a 720x1280 space, which is why the
chapter keyword at y=628 rendered behind the caption plate at y=760. Zones make that
class of bug structurally impossible: a scene may only draw inside `stage`.
"""

from __future__ import annotations

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
    if width % look.cell_w or height % look.cell_h:
        raise ValueError(
            f"Cell size {look.cell_w}x{look.cell_h} must divide canvas {width}x{height} exactly"
        )
    return Grid(
        width=width,
        height=height,
        cell_w=look.cell_w,
        cell_h=look.cell_h,
        cols=width // look.cell_w,
        rows=height // look.cell_h,
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_canvas.py -v`
Expected: PASS, 10 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/canvas.py tests/test_canvas.py
git commit -m "Add canvas grid, named zones and platform safe areas"
```

---

## Task 5: Glyph atlas and signatures

**Files:**
- Create: `scripts/ascii_studio/render/glyphs.py`
- Test: `tests/test_glyphs.py`

**Interfaces:**
- Consumes: `tokens.Look`
- Produces:
  - `SIG_W = 4`, `SIG_H = 8`
  - `GLYPH_SETS: dict[str, str]` with keys `cinematic`, `ascii7`, `blocks`
  - `available_chars(font_path: str, candidates: str) -> str`
  - `Atlas` frozen dataclass: `chars: tuple[str, ...]`, `tiles: np.ndarray (n, cell_h, cell_w) float32 0..1`, `sig: np.ndarray (n, SIG_H*SIG_W) float32`, `sig_norm: np.ndarray (n,) float32`
  - `build_atlas(font_path: str, cell_w: int, cell_h: int, glyph_set: str) -> Atlas`

- [ ] **Step 1: Write the failing test**

Create `tests/test_glyphs.py`:

```python
import numpy as np
import pytest

from ascii_studio.render import glyphs, tokens

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"
FULL_COVERAGE_FONT = "/System/Library/Fonts/Menlo.ttc"


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


def test_menlo_has_full_cinematic_coverage():
    """Menlo is the fallback precisely because it covers every candidate."""
    candidates = glyphs.GLYPH_SETS["cinematic"]
    assert glyphs.available_chars(FULL_COVERAGE_FONT, candidates) == candidates


def test_jetbrains_covers_all_but_the_white_circle():
    """JetBrains Mono lacks U+25CB only; the filter must drop it, not crash."""
    got = glyphs.available_chars(FIELD_FONT, glyphs.GLYPH_SETS["cinematic"])
    missing = set(glyphs.GLYPH_SETS["cinematic"]) - set(got)
    assert missing == {"○"}, missing


def test_ascii7_set_is_pure_ascii():
    assert all(ord(c) < 128 for c in glyphs.GLYPH_SETS["ascii7"])


def test_space_is_first_glyph(atlas):
    """Index 0 must be blank so an empty buffer maps to an empty screen."""
    assert atlas.chars[0] == " "
    assert atlas.tiles[0].max() == 0.0


def test_atlas_shapes(atlas):
    n = len(atlas.chars)
    assert atlas.tiles.shape == (n, 15, 9)
    assert atlas.sig.shape == (n, glyphs.SIG_H * glyphs.SIG_W)
    assert atlas.sig_norm.shape == (n,)


def test_tiles_are_normalised_coverage(atlas):
    assert atlas.tiles.dtype == np.float32
    assert atlas.tiles.min() >= 0.0
    assert atlas.tiles.max() <= 1.0


def test_full_block_is_the_densest_glyph(atlas):
    means = atlas.tiles.reshape(len(atlas.chars), -1).mean(axis=1)
    assert atlas.chars[int(means.argmax())] == "█"


def test_sig_norm_matches_sig(atlas):
    assert np.allclose(atlas.sig_norm, (atlas.sig ** 2).sum(axis=1), atol=1e-4)


def test_glyphs_are_distinguishable(atlas):
    """No two glyphs may share a signature, or best-match becomes arbitrary."""
    sigs = np.round(atlas.sig, 3)
    unique = np.unique(sigs, axis=0)
    assert unique.shape[0] == sigs.shape[0], "duplicate glyph signatures"


def test_horizontal_and_vertical_rules_differ(atlas):
    i_h = atlas.chars.index("─")
    i_v = atlas.chars.index("│")
    assert not np.allclose(atlas.sig[i_h], atlas.sig[i_v])


def test_unavailable_chars_are_dropped():
    """A missing glyph must shrink the set, not crash."""
    got = glyphs.available_chars(FIELD_FONT, "●○AB")
    assert "A" in got and "B" in got and "●" in got
    assert "○" not in got
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_glyphs.py -v`
Expected: FAIL with `ImportError: cannot import name 'glyphs'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/glyphs.py`:

```python
"""Glyph atlas, signatures and the vectorised blit.

v1 issued one PIL.ImageDraw.text call per cell inside a Python double loop -- about
3,900 calls per frame and 29 million for a 4-minute video, which is what capped the
field at 64 columns. Here every glyph is rasterised once into an atlas, and a whole
frame is assembled with array indexing and one transpose.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from fontTools.ttLib import TTCollection, TTFont
from PIL import Image, ImageDraw, ImageFont

# Signature resolution used for best-match search. Coarser than the cell, which is
# ample for discrimination and keeps the search matmul small.
SIG_W = 4
SIG_H = 8

_ASCII7 = " .,:;'\"`^~-_=+*#%@/\\|<>()[]{}"
_BOX = "─│┌┐└┘├┤┬┴┼╱╲╳"
_BLOCKS = "█▓▒░▀▄▌▐▖▗▘▝"
_GEOMETRIC = "●○◆◇▲▼■□"

GLYPH_SETS: dict[str, str] = {
    "cinematic": _ASCII7 + _BOX + _BLOCKS + _GEOMETRIC,
    "ascii7": _ASCII7,
    "blocks": " " + _BLOCKS,
}


@dataclass(frozen=True)
class Atlas:
    chars: tuple[str, ...]
    tiles: np.ndarray      # (n, cell_h, cell_w) float32 coverage 0..1
    sig: np.ndarray        # (n, SIG_H*SIG_W) float32
    sig_norm: np.ndarray   # (n,) float32, ||sig||^2

    def index(self, char: str) -> int:
        return self.chars.index(char)


def _cmap(font_path: str) -> set[int]:
    font = TTCollection(font_path).fonts[0] if font_path.endswith(".ttc") else TTFont(font_path, fontNumber=0)
    codepoints: set[int] = set()
    for table in font["cmap"].tables:
        codepoints |= set(table.cmap.keys())
    return codepoints


def available_chars(font_path: str, candidates: str) -> str:
    """Filter candidates down to those the font actually provides."""
    codepoints = _cmap(font_path)
    return "".join(char for char in candidates if char == " " or ord(char) in codepoints)


def build_atlas(font_path: str, cell_w: int, cell_h: int, glyph_set: str) -> Atlas:
    if glyph_set not in GLYPH_SETS:
        raise ValueError(f"Unknown glyph set {glyph_set!r}. Available: {sorted(GLYPH_SETS)}")
    chars = available_chars(font_path, GLYPH_SETS[glyph_set])
    if " " not in chars:
        chars = " " + chars
    # Space first, so glyph index 0 is always blank.
    chars = " " + "".join(c for c in chars if c != " ")

    font = _fit_font(font_path, cell_w, cell_h)
    tiles = np.zeros((len(chars), cell_h, cell_w), dtype=np.float32)
    for index, char in enumerate(chars):
        if char == " ":
            continue
        image = Image.new("L", (cell_w, cell_h), 0)
        draw = ImageDraw.Draw(image)
        # Centre each glyph in its cell using its own ink bounds.
        left, top, right, bottom = draw.textbbox((0, 0), char, font=font)
        draw.text(
            ((cell_w - (right - left)) / 2 - left, (cell_h - (bottom - top)) / 2 - top),
            char,
            font=font,
            fill=255,
        )
        tiles[index] = np.asarray(image, dtype=np.float32) / 255.0

    sig = _signatures(tiles)
    return Atlas(
        chars=tuple(chars),
        tiles=tiles,
        sig=sig,
        sig_norm=(sig ** 2).sum(axis=1).astype(np.float32),
    )


def _fit_font(font_path: str, cell_w: int, cell_h: int) -> ImageFont.FreeTypeFont:
    """Largest size whose full block still fits the cell."""
    best = ImageFont.truetype(font_path, max(6, cell_h))
    for size in range(cell_h + 4, 5, -1):
        candidate = ImageFont.truetype(font_path, size)
        probe = ImageDraw.Draw(Image.new("L", (1, 1)))
        left, top, right, bottom = probe.textbbox((0, 0), "█", font=candidate)
        if (right - left) <= cell_w and (bottom - top) <= cell_h:
            return candidate
        best = candidate
    return best


def _signatures(tiles: np.ndarray) -> np.ndarray:
    """Area-average each tile down to SIG_H x SIG_W and flatten."""
    n, cell_h, cell_w = tiles.shape
    rows = np.linspace(0, cell_h, SIG_H + 1).astype(int)
    cols = np.linspace(0, cell_w, SIG_W + 1).astype(int)
    out = np.zeros((n, SIG_H, SIG_W), dtype=np.float32)
    for r in range(SIG_H):
        for c in range(SIG_W):
            block = tiles[:, rows[r]:max(rows[r] + 1, rows[r + 1]), cols[c]:max(cols[c] + 1, cols[c + 1])]
            out[:, r, c] = block.mean(axis=(1, 2))
    return out.reshape(n, SIG_H * SIG_W)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_glyphs.py -v`
Expected: PASS, 10 passed

If `test_glyphs_are_distinguishable` fails, two glyphs collapsed to the same signature at 4×8. Fix by raising `SIG_W`/`SIG_H` to 5×10 (and update the test's shape assertions), not by removing glyphs.

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/glyphs.py tests/test_glyphs.py
git commit -m "Add glyph atlas with best-match signatures"
```

---

## Task 6: Best-match selection, dither and temporal hysteresis

**Files:**
- Modify: `scripts/ascii_studio/render/glyphs.py` (append `match_glyphs`)
- Create: `scripts/ascii_studio/render/asciify.py`
- Test: `tests/test_asciify.py`

**Interfaces:**
- Consumes: `Atlas`, `Grid`, `Look`
- Produces:
  - `glyphs.match_glyphs(sigs: np.ndarray, atlas: Atlas, prev: np.ndarray | None = None, hysteresis: float = 0.0) -> np.ndarray` — `sigs` is `(n_cells, SIG_H*SIG_W)`; returns `(n_cells,)` int32
  - `asciify.BAYER8: np.ndarray` — `(8,8)` float32 in −0.5..0.5
  - `asciify.cell_signatures(lum: np.ndarray, grid: Grid, dither: str) -> np.ndarray` — `(rows*cols, SIG_H*SIG_W)` float32
  - `asciify.asciify(lum: np.ndarray, grid: Grid, atlas: Atlas, look: Look, prev: np.ndarray | None = None) -> np.ndarray` — returns `(rows, cols)` int32

- [ ] **Step 1: Write the failing test**

Create `tests/test_asciify.py`:

```python
import numpy as np
import pytest

from ascii_studio.render import asciify, canvas, glyphs, tokens

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"
FULL_COVERAGE_FONT = "/System/Library/Fonts/Menlo.ttc"


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


def test_bayer_is_zero_mean():
    assert abs(float(asciify.BAYER8.mean())) < 1e-6
    assert asciify.BAYER8.shape == (8, 8)


def test_black_buffer_is_all_space(grid, atlas, look):
    lum = np.zeros(grid.buffer_shape(), dtype=np.float32)
    out = asciify.asciify(lum, grid, atlas, look)
    assert out.shape == (grid.rows, grid.cols)
    assert np.all(out == 0)


def test_white_buffer_is_the_densest_glyph(grid, atlas, look):
    lum = np.ones(grid.buffer_shape(), dtype=np.float32)
    out = asciify.asciify(lum, grid, atlas, look)
    densest = atlas.tiles.reshape(len(atlas.chars), -1).mean(axis=1).argmax()
    assert np.all(out == densest)


def test_signature_count_matches_grid(grid, look):
    lum = np.zeros(grid.buffer_shape(), dtype=np.float32)
    sigs = asciify.cell_signatures(lum, grid, look.dither)
    assert sigs.shape == (grid.rows * grid.cols, glyphs.SIG_H * glyphs.SIG_W)


def test_horizontal_edge_picks_a_horizontal_glyph(grid, atlas, look):
    """The whole point of best-match: a horizontal bar must not become a blob."""
    height, width = grid.buffer_shape()
    lum = np.zeros((height, width), dtype=np.float32)
    band = grid.cell_h * grid.supersample
    lum[10 * band + band // 2: 10 * band + band // 2 + 2, :] = 1.0
    out = asciify.asciify(lum, grid, atlas, look)
    chosen = {atlas.chars[i] for i in np.unique(out[10])}
    assert chosen & set("─-=_~▄▀"), f"got {chosen}"


def test_vertical_edge_picks_a_vertical_glyph(grid, atlas, look):
    height, width = grid.buffer_shape()
    lum = np.zeros((height, width), dtype=np.float32)
    stride = grid.cell_w * grid.supersample
    lum[:, 40 * stride + stride // 2: 40 * stride + stride // 2 + 2] = 1.0
    out = asciify.asciify(lum, grid, atlas, look)
    chosen = {atlas.chars[i] for i in np.unique(out[:, 40])}
    assert chosen & set("│|▌▐!"), f"got {chosen}"


def test_hysteresis_suppresses_flicker(atlas):
    """A cell sitting between two near-equal glyphs must keep its previous choice."""
    rng = np.random.default_rng(7)
    sigs = rng.random((256, glyphs.SIG_H * glyphs.SIG_W)).astype(np.float32)
    first = glyphs.match_glyphs(sigs, atlas)
    nudged = sigs + rng.normal(0, 0.002, sigs.shape).astype(np.float32)
    without = glyphs.match_glyphs(nudged, atlas)
    with_hyst = glyphs.match_glyphs(nudged, atlas, prev=first, hysteresis=0.06)
    assert (with_hyst == first).sum() > (without == first).sum()


def test_dither_changes_the_result(grid, atlas, look):
    """Mid-grey must not quantise to a single flat glyph everywhere."""
    lum = np.full(grid.buffer_shape(), 0.5, dtype=np.float32)
    dithered = asciify.cell_signatures(lum, grid, "bayer8")
    flat = asciify.cell_signatures(lum, grid, "none")
    assert not np.allclose(dithered, flat)
    assert len(np.unique(flat.round(4), axis=0)) == 1


def test_wrong_buffer_shape_is_rejected(grid, atlas, look):
    with pytest.raises(ValueError, match="buffer"):
        asciify.asciify(np.zeros((10, 10), dtype=np.float32), grid, atlas, look)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_asciify.py -v`
Expected: FAIL with `ImportError: cannot import name 'asciify'`

- [ ] **Step 3a: Append `match_glyphs` to `glyphs.py`**

```python
def match_glyphs(
    sigs: np.ndarray,
    atlas: Atlas,
    prev: np.ndarray | None = None,
    hysteresis: float = 0.0,
) -> np.ndarray:
    """Pick, per cell, the glyph whose bitmap best matches the cell's pixels.

    Minimising ||c - g||^2 over glyphs is equivalent to maximising 2*(c.g) - ||g||^2,
    because ||c||^2 is constant per cell. That is one matmul against the atlas.

    `hysteresis` adds a bonus to each cell's previous glyph so cells sitting on a
    decision boundary do not flicker between two near-equal choices every frame.
    """
    scores = sigs @ atlas.sig.T * 2.0 - atlas.sig_norm[None, :]
    if prev is not None and hysteresis:
        flat_prev = np.asarray(prev).reshape(-1)
        if flat_prev.shape[0] != scores.shape[0]:
            raise ValueError(
                f"prev has {flat_prev.shape[0]} cells, expected {scores.shape[0]}"
            )
        scores[np.arange(scores.shape[0]), flat_prev] += hysteresis
    return scores.argmax(axis=1).astype(np.int32)
```

- [ ] **Step 3b: Create `asciify.py`**

```python
"""Luminance buffer -> glyph grid."""

from __future__ import annotations

import cv2
import numpy as np

from . import glyphs
from .canvas import Grid
from .tokens import Look

# Standard 8x8 ordered (Bayer) matrix, recentred to -0.5..0.5.
_BAYER_RAW = np.array([
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
], dtype=np.float32)
BAYER8 = (_BAYER_RAW + 0.5) / 64.0 - 0.5

_DITHER_AMPLITUDE = 0.18


def cell_signatures(lum: np.ndarray, grid: Grid, dither: str) -> np.ndarray:
    """Downsample the luminance buffer to one SIG_H x SIG_W block per cell."""
    expected = grid.buffer_shape()
    if lum.shape != expected:
        raise ValueError(f"luminance buffer is {lum.shape}, expected {expected}")

    target_w = grid.cols * glyphs.SIG_W
    target_h = grid.rows * glyphs.SIG_H
    small = cv2.resize(
        np.ascontiguousarray(lum, dtype=np.float32),
        (target_w, target_h),
        interpolation=cv2.INTER_AREA,
    )

    if dither == "bayer8":
        tile = np.tile(
            BAYER8,
            (-(-target_h // 8), -(-target_w // 8)),
        )[:target_h, :target_w]
        # Taper to zero at both ends of the range. Without this, dither lifts a pure
        # black buffer to ~0.09, where a sparse glyph scores 32m(0.18-m) > 0 and beats
        # space -- so empty screen renders as speckle. Dither belongs in the midtones.
        taper = 4.0 * small * (1.0 - small)
        small = small + tile * _DITHER_AMPLITUDE * taper
    elif dither not in ("none", None):
        raise ValueError(f"Unknown dither {dither!r}")

    small = np.clip(small, 0.0, 1.0)
    # (rows, SIG_H, cols, SIG_W) -> (rows*cols, SIG_H*SIG_W)
    blocks = small.reshape(grid.rows, glyphs.SIG_H, grid.cols, glyphs.SIG_W)
    return np.ascontiguousarray(
        blocks.transpose(0, 2, 1, 3).reshape(grid.rows * grid.cols, glyphs.SIG_H * glyphs.SIG_W)
    )


def asciify(
    lum: np.ndarray,
    grid: Grid,
    atlas: glyphs.Atlas,
    look: Look,
    prev: np.ndarray | None = None,
) -> np.ndarray:
    """Return the (rows, cols) int32 glyph-index grid for this luminance buffer."""
    sigs = cell_signatures(lum, grid, look.dither)
    flat_prev = None if prev is None else np.asarray(prev).reshape(-1)
    chosen = glyphs.match_glyphs(sigs, atlas, flat_prev, look.hysteresis)
    return chosen.reshape(grid.rows, grid.cols)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_asciify.py -v`
Expected: PASS, 9 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/glyphs.py scripts/ascii_studio/render/asciify.py tests/test_asciify.py
git commit -m "Add best-match glyph selection with Bayer dither and temporal hysteresis"
```

---

## Task 7: Vectorised blit with half-block colour

**Files:**
- Modify: `scripts/ascii_studio/render/glyphs.py` (append `blit`)
- Test: `tests/test_blit.py`

**Interfaces:**
- Consumes: `Atlas`
- Produces: `glyphs.blit(grid_idx: np.ndarray, atlas: Atlas, fg: np.ndarray, bg: np.ndarray) -> np.ndarray`
  - `grid_idx` `(rows, cols)` int
  - `fg`, `bg` `(rows, cols, 3)` float32 in 0..1
  - returns `(rows*cell_h, cols*cell_w, 3)` float32 in 0..1

- [ ] **Step 1: Write the failing test**

Create `tests/test_blit.py`:

```python
import time

import numpy as np
import pytest

from ascii_studio.render import glyphs

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"
FULL_COVERAGE_FONT = "/System/Library/Fonts/Menlo.ttc"


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


def _uniform(rows, cols, rgb):
    return np.tile(np.asarray(rgb, dtype=np.float32), (rows, cols, 1))


def test_blit_output_shape(atlas):
    grid = np.zeros((128, 120), dtype=np.int32)
    out = glyphs.blit(grid, atlas, _uniform(128, 120, [1, 1, 1]), _uniform(128, 120, [0, 0, 0]))
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.float32


def test_space_renders_pure_background(atlas):
    grid = np.zeros((4, 4), dtype=np.int32)
    bg = _uniform(4, 4, [0.1, 0.2, 0.3])
    out = glyphs.blit(grid, atlas, _uniform(4, 4, [1, 1, 1]), bg)
    assert np.allclose(out, np.array([0.1, 0.2, 0.3], dtype=np.float32), atol=1e-5)


def test_full_block_renders_pure_foreground(atlas):
    grid = np.full((4, 4), atlas.index("█"), dtype=np.int32)
    fg = _uniform(4, 4, [0.9, 0.4, 0.1])
    out = glyphs.blit(grid, atlas, fg, _uniform(4, 4, [0, 0, 0]))
    assert out.mean() > 0.4
    corner = out[2, 2]
    assert np.allclose(corner, [0.9, 0.4, 0.1], atol=0.05)


def test_upper_half_block_splits_the_cell(atlas):
    """Half-blocks are what give two independent colours per cell."""
    grid = np.full((1, 1), atlas.index("▀"), dtype=np.int32)
    out = glyphs.blit(grid, atlas, _uniform(1, 1, [1, 1, 1]), _uniform(1, 1, [0, 0, 0]))
    top = out[: out.shape[0] // 2].mean()
    bottom = out[out.shape[0] // 2:].mean()
    assert top > bottom + 0.3


def test_per_cell_colours_are_independent(atlas):
    grid = np.full((1, 2), atlas.index("█"), dtype=np.int32)
    fg = np.zeros((1, 2, 3), dtype=np.float32)
    fg[0, 0] = [1, 0, 0]
    fg[0, 1] = [0, 0, 1]
    out = glyphs.blit(grid, atlas, fg, np.zeros((1, 2, 3), dtype=np.float32))
    assert out[7, 4, 0] > 0.5 and out[7, 4, 2] < 0.5
    assert out[7, 13, 2] > 0.5 and out[7, 13, 0] < 0.5


def test_mismatched_shapes_are_rejected(atlas):
    with pytest.raises(ValueError):
        glyphs.blit(
            np.zeros((4, 4), dtype=np.int32),
            atlas,
            _uniform(4, 5, [1, 1, 1]),
            _uniform(4, 4, [0, 0, 0]),
        )


def test_blit_is_fast_enough_for_video(atlas):
    """v1 spent ~3,900 PIL calls per frame here. Budget: under 40ms for a full frame."""
    grid = np.random.default_rng(0).integers(0, len(atlas.chars), (128, 120)).astype(np.int32)
    fg = np.random.default_rng(1).random((128, 120, 3)).astype(np.float32)
    bg = np.zeros((128, 120, 3), dtype=np.float32)
    glyphs.blit(grid, atlas, fg, bg)  # warm up
    start = time.perf_counter()
    for _ in range(5):
        glyphs.blit(grid, atlas, fg, bg)
    elapsed = (time.perf_counter() - start) / 5
    assert elapsed < 0.040, f"blit took {elapsed * 1000:.1f}ms"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_blit.py -v`
Expected: FAIL with `AttributeError: module 'ascii_studio.render.glyphs' has no attribute 'blit'`

- [ ] **Step 3: Append `blit` to `glyphs.py`**

```python
def blit(
    grid_idx: np.ndarray,
    atlas: Atlas,
    fg: np.ndarray,
    bg: np.ndarray,
) -> np.ndarray:
    """Compose the full-resolution frame from a glyph grid and per-cell colours.

    No Python loop over cells: the atlas is indexed by the whole grid at once and a
    single transpose reshapes tiles into the image. Each cell carries an independent
    foreground and background colour, so half-block glyphs give two colours per cell.
    """
    grid_idx = np.asarray(grid_idx)
    rows, cols = grid_idx.shape
    if fg.shape != (rows, cols, 3) or bg.shape != (rows, cols, 3):
        raise ValueError(
            f"fg/bg must be ({rows}, {cols}, 3); got {fg.shape} and {bg.shape}"
        )

    tiles = atlas.tiles[grid_idx]                       # (rows, cols, ch, cw)
    coverage = tiles[..., None]                         # (rows, cols, ch, cw, 1)
    fg_c = fg[:, :, None, None, :]
    bg_c = bg[:, :, None, None, :]
    cells = bg_c + (fg_c - bg_c) * coverage             # (rows, cols, ch, cw, 3)

    cell_h, cell_w = atlas.tiles.shape[1:]
    return np.ascontiguousarray(
        cells.transpose(0, 2, 1, 3, 4).reshape(rows * cell_h, cols * cell_w, 3)
    ).astype(np.float32)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_blit.py -v`
Expected: PASS, 7 passed

If `test_blit_is_fast_enough_for_video` fails, the likely cause is float64 promotion — assert `fg.dtype == np.float32` and cast `atlas.tiles` once at build time.

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/glyphs.py tests/test_blit.py
git commit -m "Add vectorised glyph blit with per-cell fg/bg colour"
```

---

## Task 8: Post-processing

**Files:**
- Create: `scripts/ascii_studio/render/post.py`
- Test: `tests/test_post.py`

**Interfaces:**
- Consumes: `tokens.Look`
- Produces: `post.grade(rgb: np.ndarray, look: Look, frame_index: int) -> np.ndarray` — `(H,W,3)` float32 0..1 → `(H,W,3)` uint8

- [ ] **Step 1: Write the failing test**

Create `tests/test_post.py`:

```python
import numpy as np
import pytest

from ascii_studio.render import post, tokens


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


def test_output_is_uint8_rgb(look):
    rgb = np.zeros((240, 135, 3), dtype=np.float32)
    out = post.grade(rgb, look, 0)
    assert out.dtype == np.uint8
    assert out.shape == (240, 135, 3)


def test_black_stays_near_black(look):
    out = post.grade(np.zeros((64, 64, 3), dtype=np.float32), look, 0)
    assert out.mean() < 12


def test_halation_spreads_light_from_a_bright_point(look):
    rgb = np.zeros((128, 128, 3), dtype=np.float32)
    rgb[64, 64] = 1.0
    out = post.grade(rgb, look, 0).astype(np.float32)
    assert out[64, 70].mean() > out[64, 120].mean()


def test_vignette_darkens_corners(look):
    rgb = np.full((128, 128, 3), 0.6, dtype=np.float32)
    out = post.grade(rgb, look, 0).astype(np.float32)
    assert out[2, 2].mean() < out[64, 64].mean()


def test_grain_varies_between_frames(look):
    rgb = np.full((64, 64, 3), 0.5, dtype=np.float32)
    assert not np.array_equal(post.grade(rgb, look, 0), post.grade(rgb, look, 1))


def test_grade_is_deterministic_for_a_given_frame(look):
    rgb = np.full((64, 64, 3), 0.5, dtype=np.float32)
    assert np.array_equal(post.grade(rgb, look, 42), post.grade(rgb, look, 42))


def test_no_clipping_artifacts(look):
    rgb = np.ones((64, 64, 3), dtype=np.float32)
    out = post.grade(rgb, look, 0)
    assert out.max() <= 255 and out.min() >= 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_post.py -v`
Expected: FAIL with `ImportError: cannot import name 'post'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/post.py`:

```python
"""Final grade: filmic curve, halation, grain, scanlines, vignette.

v1 added a flat Gaussian blur of the whole frame, which greyed everything equally.
Halation is thresholded -- only genuinely bright glyphs bleed -- which is what real
film and CRT phosphor do, and it keeps the blacks black.
"""

from __future__ import annotations

import cv2
import numpy as np

from .tokens import Look

_HALATION_THRESHOLD = 0.55


def _filmic(x: np.ndarray) -> np.ndarray:
    """Gentle shoulder; keeps highlights from clipping to flat white."""
    return np.clip((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0)


def grade(rgb: np.ndarray, look: Look, frame_index: int) -> np.ndarray:
    out = np.clip(np.asarray(rgb, dtype=np.float32), 0.0, 1.0)

    if look.halation > 0:
        luma = out.max(axis=2)
        mask = np.clip((luma - _HALATION_THRESHOLD) / (1.0 - _HALATION_THRESHOLD), 0.0, 1.0)
        bright = out * mask[:, :, None]
        bloom = cv2.GaussianBlur(bright, (0, 0), 6.0)
        out = 1.0 - (1.0 - out) * (1.0 - bloom * look.halation)  # screen

    out = _filmic(out)

    if look.scanlines > 0:
        out[::2, :, :] *= (1.0 - look.scanlines)

    if look.vignette > 0:
        height, width = out.shape[:2]
        yy, xx = np.ogrid[-1:1:height * 1j, -1:1:width * 1j]
        falloff = 1.0 - np.clip((xx * xx + yy * yy) * look.vignette, 0.0, 1.0)
        out *= falloff.astype(np.float32)[:, :, None]

    if look.grain > 0:
        rng = np.random.default_rng(frame_index * 7919 + 2027)
        out += rng.normal(0.0, look.grain, out.shape[:2]).astype(np.float32)[:, :, None]

    return (np.clip(out, 0.0, 1.0) * 255.0).astype(np.uint8)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_post.py -v`
Expected: PASS, 7 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/post.py tests/test_post.py
git commit -m "Add filmic grade with thresholded halation"
```

---

## Task 9: Legacy scene source — v1 geometry into luminance buffers

This is the task that delivers Phase 1's headline: the motif geometry stops being a
vector overlay and becomes part of the picture that gets turned into characters.

**Files:**
- Create: `scripts/ascii_studio/scene/legacy.py`
- Test: `tests/test_legacy_scene.py`

**Interfaces:**
- Consumes: `canvas.Grid`, `canvas.ZONES`
- Produces:
  - `LegacyChapter` dataclass mirroring v1's `Chapter` fields used by geometry: `motif: str`, `keyword: str`, `anchors: list[str]`, `seed: int`, `density: float`, `motion: float`
  - `field_luminance(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray` — `(H*ss, W*ss)` float32 0..1
  - `motif_luminance(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray` — same shape, drawn **inside `ZONES['stage']` only**
  - `compose(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray` — field at low amplitude plus motif, clipped to 0..1

- [ ] **Step 1: Write the failing test**

Create `tests/test_legacy_scene.py`:

```python
import numpy as np
import pytest

from ascii_studio.render import canvas, tokens
from ascii_studio.scene import legacy


@pytest.fixture(scope="module")
def grid():
    return canvas.make_grid(1080, 1920, tokens.load_look("plata"))


def chapter(motif="network"):
    return legacy.LegacyChapter(
        motif=motif, keyword="CONFIANZA", anchors=["CONFIANZA", "RED"],
        seed=1634938309, density=0.61, motion=0.47,
    )


def test_field_shape_and_range(grid):
    lum = legacy.field_luminance(chapter(), grid, 1.0, 0.3)
    assert lum.shape == grid.buffer_shape()
    assert lum.dtype == np.float32
    assert 0.0 <= lum.min() and lum.max() <= 1.0


def test_motif_stays_inside_the_stage_zone(grid):
    """The bug this kills: v1 drew the keyword at y=628 behind the caption plate."""
    lum = legacy.motif_luminance(chapter(), grid, 1.0, 0.3)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["stage"])
    outside = lum.copy()
    ss = grid.supersample
    outside[y0 * ss:y1 * ss, x0 * ss:x1 * ss] = 0.0
    assert outside.max() == 0.0, "motif drew outside the stage zone"


def test_motif_actually_draws_something(grid):
    lum = legacy.motif_luminance(chapter(), grid, 1.0, 0.3)
    assert lum.max() > 0.5


@pytest.mark.parametrize("motif", [
    "noise", "signal", "network", "orbit", "mirror",
    "blueprint", "pulse", "fracture", "evidence", "horizon",
])
def test_every_v1_motif_renders(grid, motif):
    lum = legacy.compose(chapter(motif), grid, 1.0, 0.3)
    assert lum.shape == grid.buffer_shape()
    assert lum.max() > 0.0


def test_field_animates_over_time(grid):
    a = legacy.field_luminance(chapter(), grid, 0.0, 0.0)
    b = legacy.field_luminance(chapter(), grid, 2.5, 0.0)
    assert not np.allclose(a, b)


def test_seed_changes_geometry(grid):
    one = chapter()
    two = legacy.LegacyChapter(
        motif="network", keyword="CONFIANZA", anchors=["CONFIANZA", "RED"],
        seed=99, density=0.61, motion=0.47,
    )
    assert not np.allclose(
        legacy.motif_luminance(one, grid, 1.0, 0.3),
        legacy.motif_luminance(two, grid, 1.0, 0.3),
    )


def test_compose_is_clipped(grid):
    lum = legacy.compose(chapter(), grid, 1.0, 0.3)
    assert lum.min() >= 0.0 and lum.max() <= 1.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_legacy_scene.py -v`
Expected: FAIL with `ImportError: cannot import name 'legacy'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/scene/legacy.py`. Port the maths from
`render_cinematic_ascii_video.py:863` (`field_for`) and `:956` (`draw_motif`), with three
changes: draw into a single-channel float buffer instead of an RGBA layer, confine all motif
geometry to the `stage` zone, and drop the text labels (Phase 2 replaces them with real
concepts; drawing frequency-count anchors would only preserve the `TODO`/`ANTES` problem).

```python
"""v1 geometry, rasterised into luminance buffers instead of composited as vectors.

Phase 1 keeps v1's shapes but stops drawing them *on top of* the ASCII. Everything
here lands in a float buffer that Stage 2 turns into characters, so the frame has one
visual language. Phase 2 replaces this module with real diagram archetypes.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field as dc_field

import cv2
import numpy as np

from ..render.canvas import ZONES, Grid

FIELD_AMPLITUDE = 0.34   # the background field must never compete with the motif


@dataclass
class LegacyChapter:
    motif: str
    keyword: str = ""
    anchors: list[str] = dc_field(default_factory=list)
    seed: int = 0
    density: float = 0.5
    motion: float = 0.5


def field_luminance(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray:
    """v1's field_for(), evaluated at buffer resolution instead of on a 64x61 grid."""
    height, width = grid.buffer_shape()
    y, x = np.meshgrid(
        np.linspace(-1.0, 1.0, height, dtype=np.float32),
        np.linspace(-1.0, 1.0, width, dtype=np.float32),
        indexing="ij",
    )
    motif = chapter.motif
    seed_phase = (chapter.seed % 997) / 997.0 * math.pi * 2
    drift = 0.76 + chapter.motion * 0.72
    spread = 0.86 + chapter.density * 0.34
    phase = t * drift + seed_phase

    if motif == "noise":
        f = np.sin(x * (15 + spread * 4) + phase * 5) * np.cos(y * (17 + spread * 4) - phase * 4)
        f += (0.34 + chapter.density * 0.22) * np.sin((x + y) * (25 + spread * 6) + phase * 8)
    elif motif == "signal":
        r = np.sqrt((x + 0.05) ** 2 + (y - 0.08) ** 2)
        f = np.sin(r * (31 + spread * 6) - phase * 7) * np.exp(-r * (1.0 + chapter.density * 0.4))
        f += 0.45 * np.sin(y * (24 + spread * 6) + phase * 3)
    elif motif == "network":
        f = np.sin(x * (10 + spread * 3) + phase * 2) + np.cos(y * (14 + spread * 3) - phase * 3)
        f += (0.44 + chapter.density * 0.2) * np.sin((x - y) * (17 + spread * 4) + phase)
    elif motif == "orbit":
        r = np.sqrt(x * x + y * y)
        a = np.arctan2(y, x)
        f = np.sin(r * (30 + spread * 7) - phase * 7 + np.sin(a * (3 + chapter.seed % 4)) * 1.4)
    elif motif == "mirror":
        f = np.cos(np.abs(x) * (20 + spread * 5) - phase * 3) * np.sin(y * (15 + spread * 4) + phase)
    elif motif == "blueprint":
        f = (np.cos(x * (28 + spread * 6)) * 0.6 + np.cos(y * (24 + spread * 7)) * 0.6
             + np.sin((x + y) * (7 + spread * 3) + phase))
    elif motif == "pulse":
        r = np.sqrt(x * x + y * y)
        f = np.sin(r * (42 + spread * 9) - phase * 12) * np.exp(-r * (0.58 + chapter.density * 0.2))
    elif motif == "fracture":
        f = (np.sin((x + y * 0.22) * (21 + spread * 5) + phase * 2)
             + np.sign(x + 0.24 * np.sin(y * (7 + spread * 3) + seed_phase)) * 0.9)
    elif motif == "evidence":
        f = np.sin(x * (7 + spread * 2) + phase) + np.sin(y * (19 + spread * 5) - phase * 2)
        f += 0.5 * np.cos((x - y) * (14 + spread * 4))
    else:
        horizon = np.exp(-((y - 0.28) ** 2) * 22)
        f = np.sin(x * (10 + spread * 3) + phase * 2) * 0.58 + np.cos(y * (12 + spread * 3) - phase)
        f += horizon * (1.5 + progress)

    return ((np.tanh(f) + 1.0) * 0.5).astype(np.float32)


def motif_luminance(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray:
    """v1's draw_motif() geometry, confined to the stage zone, as luminance."""
    height, width = grid.buffer_shape()
    buf = np.zeros((height, width), dtype=np.float32)
    ss = grid.supersample
    sx0, sy0, sx1, sy1 = grid.zone_px(ZONES["stage"])
    sx0, sy0, sx1, sy1 = sx0 * ss, sy0 * ss, sx1 * ss, sy1 * ss
    stage_w, stage_h = sx1 - sx0, sy1 - sy0
    stage = np.zeros((stage_h, stage_w), dtype=np.float32)

    rng = np.random.default_rng(chapter.seed)
    cx, cy = stage_w / 2.0, stage_h / 2.0
    pulse = 1.0 + (0.02 + chapter.motion * 0.045) * math.sin(t * (2.1 + chapter.motion * 2.2))
    detail = max(4, round(7 + chapter.density * 8))
    thickness = max(1, ss)
    unit = min(stage_w, stage_h)

    def ln(pts, value=1.0, w=thickness):
        cv2.polylines(stage, [np.asarray(pts, dtype=np.int32)], False, float(value), w, cv2.LINE_AA)

    def circle(x, y, r, value=1.0, w=thickness):
        cv2.circle(stage, (int(x), int(y)), max(1, int(r)), float(value), w, cv2.LINE_AA)

    motif = chapter.motif
    if motif == "noise":
        for i in range(22 + detail):
            y = stage_h * (i + 0.5) / (22 + detail)
            off = (0.03 + chapter.motion * 0.04) * stage_w * math.sin(i * 1.31 + t * (2.4 + chapter.motion * 3.1))
            split = stage_w * 0.4 + rng.uniform(-0.08, 0.08) * stage_w
            ln([(0, y), (split + off, y + 4), (stage_w, y - 3)], 0.75 if i % 4 else 1.0)
    elif motif in {"signal", "network"}:
        count = max(6, round(6 + chapter.density * 7))
        nodes = [(rng.uniform(0.1, 0.9) * stage_w, rng.uniform(0.1, 0.9) * stage_h) for _ in range(count)]
        for i, p in enumerate(nodes):
            q = nodes[(i * 3 + 2 + chapter.seed % 3) % count]
            ln([p, q], 0.6)
        for i, (x, y) in enumerate(nodes):
            r = unit * (0.018 + (i % 4) * 0.006) * pulse
            circle(x, y, r, 1.0, max(1, 2 * ss))
            circle(x, y, r + unit * 0.016 + unit * 0.008 * math.sin(t * 2 + i), 0.55)
    elif motif == "orbit":
        rings = max(4, round(4 + chapter.density * 4))
        for i in range(rings):
            circle(cx, cy, (unit * 0.13 + i * unit * 0.36 / max(1, rings - 1)) * pulse, 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        for i in range(max(6, detail)):
            a = t * (0.24 + chapter.motion * 0.36) + i * math.pi * 2 / detail
            r = unit * (0.35 + (i % 3) * 0.04)
            circle(cx + math.cos(a) * r, cy + math.sin(a) * r, unit * 0.014, 1.0, max(1, 2 * ss))
    elif motif == "mirror":
        for i in range(8 + detail // 2):
            y = stage_h * (i + 0.5) / (8 + detail // 2)
            ext = unit * (0.14 + 0.11 * math.sin(i * 0.57 + t * (0.6 + chapter.motion)))
            ln([(cx - ext, y), (cx, y + 12), (cx + ext, y)], 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        ln([(cx, 0), (cx, stage_h)], 1.0, max(1, 2 * ss))
    elif motif in {"blueprint", "evidence"}:
        cards = min(4, max(3, len(chapter.anchors) or 3))
        gap = stage_w * 0.03
        cw = (stage_w - gap * (cards - 1)) / cards
        for i in range(cards):
            left = i * (cw + gap)
            top = stage_h * (0.12 + (i % 2) * 0.08)
            ch = stage_h * (0.55 + (i % 3) * 0.05)
            cv2.rectangle(stage, (int(left), int(top)), (int(left + cw), int(top + ch)), 1.0, max(1, 2 * ss), cv2.LINE_AA)
            for row in range(5):
                length = cw * (0.72 - row * 0.04) + rng.uniform(-0.05, 0.05) * cw
                ry = top + ch * 0.28 + row * ch * 0.11
                ln([(left + cw * 0.09, ry), (left + cw * 0.09 + length, ry)], 0.65)
    elif motif == "fracture":
        for i in range(max(5, detail - 1)):
            circle(cx, cy, unit * (0.08 + i * 0.05), 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        pts = [(rng.uniform(0.28, 0.36) * stage_w, float(stage_h))]
        for i in range(1, 5):
            pts.append((rng.uniform(0.38, 0.68) * stage_w, stage_h - i * stage_h * 0.24))
        ln(pts, 1.0, max(2, 5 * ss))
    elif motif == "pulse":
        for i in range(max(7, detail)):
            circle(cx, cy, unit * (0.08 + i * 0.05) * pulse, 0.8 if i % 2 else 1.0, max(1, 2 * ss))
        pts = [(0.0, cy)]
        for i in range(1, 7):
            pts.append((stage_w * i / 7.0, cy + rng.uniform(-0.22, 0.22) * stage_h * (0.45 + chapter.motion * 0.6)))
        pts.append((float(stage_w), cy))
        ln(pts, 1.0, max(2, 4 * ss))
    else:  # horizon
        for i in range(max(7, detail)):
            y = stage_h * (0.45 + i * 0.05)
            ln([(0, y), (stage_w, y + 7 * math.sin(t * (0.8 + chapter.motion) + i))], 0.7 if i % 2 else 1.0)
        hy = stage_h * (0.42 + rng.uniform(-0.04, 0.04))
        ln([(0, hy), (stage_w, hy)], 1.0, max(2, 3 * ss))
        for i in range(12 + chapter.seed % 4):
            ln([(stage_w * i / 12.0, hy), (cx, stage_h * (0.92 + (i % 3) * 0.02))], 0.6)

    buf[sy0:sy1, sx0:sx1] = np.clip(stage, 0.0, 1.0)
    return buf


def compose(chapter: LegacyChapter, grid: Grid, t: float, progress: float) -> np.ndarray:
    field = field_luminance(chapter, grid, t, progress) * FIELD_AMPLITUDE
    return np.clip(field + motif_luminance(chapter, grid, t, progress), 0.0, 1.0).astype(np.float32)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_legacy_scene.py -v`
Expected: PASS, 16 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/scene/legacy.py tests/test_legacy_scene.py
git commit -m "Rasterise v1 motif geometry into luminance buffers inside the stage zone"
```

---

## Task 10: Frame assembly

**Files:**
- Create: `scripts/ascii_studio/render/frames.py`
- Test: `tests/test_frames.py`

**Interfaces:**
- Consumes: everything above
- Produces:
  - `Renderer` class, constructed as `Renderer(look: Look, width: int = 1080, height: int = 1920)`
  - `Renderer.grid: Grid`, `Renderer.atlas: Atlas`
  - `Renderer.frame(chapter: LegacyChapter, t: float, progress: float, frame_index: int) -> np.ndarray` — `(H,W,3)` uint8, stateful in `prev` for hysteresis
  - `Renderer.reset()` — clears hysteresis state (call at chapter cuts)

- [ ] **Step 1: Write the failing test**

Create `tests/test_frames.py`:

```python
import numpy as np
import pytest

from ascii_studio.render import frames, tokens
from ascii_studio.scene.legacy import LegacyChapter


@pytest.fixture(scope="module")
def renderer():
    return frames.Renderer(tokens.load_look("plata"))


def chapter():
    return LegacyChapter(motif="network", keyword="CONFIANZA",
                         anchors=["CONFIANZA"], seed=17, density=0.6, motion=0.5)


def test_frame_shape_and_dtype(renderer):
    out = renderer.frame(chapter(), 1.0, 0.3, 0)
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.uint8


def test_frame_reaches_every_edge(renderer):
    """Quality gate from SKILL.md: the field must reach all four edges."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.float32)
    assert out[0, :, :].max() > 8
    assert out[-1, :, :].max() > 8
    assert out[:, 0, :].max() > 8
    assert out[:, -1, :].max() > 8


def test_frames_differ_over_time(renderer):
    renderer.reset()
    a = renderer.frame(chapter(), 0.0, 0.0, 0)
    b = renderer.frame(chapter(), 3.0, 0.4, 90)
    assert not np.array_equal(a, b)


def test_render_is_deterministic(renderer):
    renderer.reset()
    a = renderer.frame(chapter(), 1.0, 0.3, 5)
    renderer.reset()
    b = renderer.frame(chapter(), 1.0, 0.3, 5)
    assert np.array_equal(a, b)


def test_accent_is_not_everywhere(renderer):
    """The accent is reserved. It must not dominate the frame."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.int16)
    bluish = (out[:, :, 2] > out[:, :, 1] + 30) & (out[:, :, 0] > out[:, :, 1] + 10)
    assert bluish.mean() < 0.05


def test_frame_is_predominantly_neutral(renderer):
    """plata is a silver look: mean channel spread must stay small."""
    renderer.reset()
    out = renderer.frame(chapter(), 1.0, 0.3, 0).astype(np.float32)
    spread = abs(out[:, :, 0].mean() - out[:, :, 2].mean())
    assert spread < 12, spread


def test_reset_clears_hysteresis_state(renderer):
    renderer.reset()
    assert renderer._prev is None
    renderer.frame(chapter(), 1.0, 0.3, 0)
    assert renderer._prev is not None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_frames.py -v`
Expected: FAIL with `ImportError: cannot import name 'frames'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/frames.py`:

```python
"""Frame assembly: scene -> glyphs -> pixels -> grade."""

from __future__ import annotations

import cv2
import numpy as np

from ..scene.legacy import LegacyChapter, compose
from . import asciify, color, glyphs, post
from .canvas import Grid, make_grid
from .tokens import Look


class Renderer:
    def __init__(self, look: Look, width: int = 1080, height: int = 1920):
        self.look = look
        self.grid: Grid = make_grid(width, height, look)
        self.atlas = glyphs.build_atlas(
            look.field_font, look.cell_w, look.cell_h, look.glyph_set
        )
        self._ramp = look.ramp_rgb()
        self._background = look.background_rgb()
        self._prev: np.ndarray | None = None

    def reset(self) -> None:
        """Drop hysteresis state. Call at a chapter cut so glyphs do not drag across."""
        self._prev = None

    def frame(
        self,
        chapter: LegacyChapter,
        t: float,
        progress: float,
        frame_index: int,
    ) -> np.ndarray:
        lum = compose(chapter, self.grid, t, progress)
        grid_idx = asciify.asciify(lum, self.grid, self.atlas, self.look, self._prev)
        self._prev = grid_idx

        cell_lum = cv2.resize(
            lum,
            (self.grid.cols, self.grid.rows),
            interpolation=cv2.INTER_AREA,
        ).astype(np.float32)

        fg = color.ramp_lookup(self._ramp, cell_lum).astype(np.float32)
        bg = np.tile(self._background.astype(np.float32), (self.grid.rows, self.grid.cols, 1))

        rgb = glyphs.blit(grid_idx, self.atlas, fg, bg)
        return post.grade(rgb, self.look, frame_index)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_frames.py -v`
Expected: PASS, 7 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/frames.py tests/test_frames.py
git commit -m "Add Renderer assembling scene, glyphs, colour and grade"
```

---

## Task 11: Storyboard stills

The workflow unlock: judge art direction in seconds instead of hours.

**Files:**
- Create: `scripts/ascii_studio/stills.py`
- Test: `tests/test_stills.py`

**Interfaces:**
- Consumes: `Renderer`, `LegacyChapter`
- Produces:
  - `chapters_from_storyboard(path: Path) -> list[LegacyChapter]` — reads v1 or v2 storyboard JSON
  - `render_stills(storyboard_path: Path, out_dir: Path, look_name: str = "plata") -> list[Path]`
  - `contact_sheet(images: list[Path], out_path: Path, columns: int = 4) -> Path`

- [ ] **Step 1: Write the failing test**

Create `tests/test_stills.py`:

```python
import json

import numpy as np
import pytest
from PIL import Image

from ascii_studio import stills

STORYBOARD = {
    "title": "La amabilidad como ingenieria social",
    "slug": "la-amabilidad",
    "thesis": "t",
    "keywords": ["amabilidad"],
    "chapters": [
        {"id": "01-network", "label": "01 / NETWORK", "motif": "network",
         "keyword": "CONFIANZA", "texts": ["uno"], "primary": "#7dd5c2",
         "secondary": "#e6bb63", "accent": "#edf4ef", "anchors": ["CONFIANZA"],
         "metaphor": "m", "seed": 11, "density": 0.6, "motion": 0.5,
         "composition": "mesh"},
        {"id": "02-horizon", "label": "02 / HORIZON", "motif": "horizon",
         "keyword": "CAMINO", "texts": ["dos"], "primary": "#f1cb73",
         "secondary": "#6fd0bf", "accent": "#f5efe0", "anchors": ["CAMINO"],
         "metaphor": "m", "seed": 22, "density": 0.5, "motion": 0.4,
         "composition": "path"},
    ],
}


@pytest.fixture
def storyboard_path(tmp_path):
    path = tmp_path / "sb.json"
    path.write_text(json.dumps(STORYBOARD), encoding="utf-8")
    return path


def test_reads_v1_storyboard(storyboard_path):
    chapters = stills.chapters_from_storyboard(storyboard_path)
    assert [c.motif for c in chapters] == ["network", "horizon"]
    assert chapters[0].seed == 11


def test_renders_one_still_per_chapter(storyboard_path, tmp_path):
    out = tmp_path / "stills"
    paths = stills.render_stills(storyboard_path, out, "plata")
    assert len(paths) == 2
    for path in paths:
        assert path.exists()
        assert Image.open(path).size == (1080, 1920)


def test_stills_differ_between_chapters(storyboard_path, tmp_path):
    paths = stills.render_stills(storyboard_path, tmp_path / "s", "plata")
    a = np.asarray(Image.open(paths[0]).convert("L").resize((64, 114)), dtype=np.float32)
    b = np.asarray(Image.open(paths[1]).convert("L").resize((64, 114)), dtype=np.float32)
    assert np.abs(a - b).mean() > 3.0


def test_contact_sheet(storyboard_path, tmp_path):
    paths = stills.render_stills(storyboard_path, tmp_path / "s", "plata")
    sheet = stills.contact_sheet(paths, tmp_path / "sheet.png", columns=2)
    assert sheet.exists()
    assert Image.open(sheet).width > 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_stills.py -v`
Expected: FAIL with `ImportError: cannot import name 'stills'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/stills.py`:

```python
"""One still per chapter, plus a contact sheet.

v1 renders took 2h19m, so art direction could only be judged after the fact. This
turns that into a few seconds.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

from .render.frames import Renderer
from .render.tokens import load_look
from .scene.legacy import LegacyChapter

STILL_TIME = 1.6      # seconds into the chapter
STILL_PROGRESS = 0.35


def chapters_from_storyboard(path: Path) -> list[LegacyChapter]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    chapters: list[LegacyChapter] = []
    for entry in payload["chapters"]:
        chapters.append(LegacyChapter(
            motif=entry.get("motif") or entry.get("archetype", "field"),
            keyword=entry.get("keyword", ""),
            anchors=[
                a if isinstance(a, str) else a.get("label", "")
                for a in entry.get("anchors", [])
            ],
            seed=int(entry.get("seed", 0)),
            density=float(entry.get("density", 0.5)),
            motion=float(entry.get("motion", 0.5)),
        ))
    return chapters


def render_stills(storyboard_path: Path, out_dir: Path, look_name: str = "plata") -> list[Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    renderer = Renderer(load_look(look_name))
    written: list[Path] = []
    for index, chapter in enumerate(chapters_from_storyboard(storyboard_path)):
        renderer.reset()
        frame = renderer.frame(chapter, STILL_TIME, STILL_PROGRESS, index)
        path = out_dir / f"{index + 1:02d}-{chapter.motif}.png"
        Image.fromarray(frame).save(path)
        written.append(path)
    return written


def contact_sheet(images: list[Path], out_path: Path, columns: int = 4) -> Path:
    if not images:
        raise ValueError("No images to place in a contact sheet")
    thumbs = [Image.open(p).convert("RGB").resize((270, 480)) for p in images]
    rows = -(-len(thumbs) // columns)
    sheet = Image.new("RGB", (columns * 270, rows * 480), (5, 6, 7))
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % columns) * 270, (index // columns) * 480))
    out_path = Path(out_path)
    sheet.save(out_path)
    return out_path
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_stills.py -v`
Expected: PASS, 4 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/stills.py tests/test_stills.py
git commit -m "Add storyboard stills and contact sheet"
```

---

## Task 12: Wire into the CLI and prove the speed claim

**Files:**
- Create: `scripts/ascii_studio/cli.py`
- Modify: `scripts/render_cinematic_ascii_video.py` (add `--stills` and `--engine v2` delegation)
- Test: `tests/test_cli.py`

**Interfaces:**
- Consumes: `stills`, `frames`
- Produces:
  - `cli.main(argv: list[str] | None = None) -> int`
  - subcommand `stills --storyboard PATH --out DIR [--look NAME]`
  - subcommand `bench [--frames N] [--look NAME]` printing `frames_per_second=<float>`

- [ ] **Step 1: Write the failing test**

Create `tests/test_cli.py`:

```python
import json
import time

import pytest

from ascii_studio import cli
from ascii_studio.render import frames, tokens
from ascii_studio.scene.legacy import LegacyChapter

STORYBOARD = {
    "title": "t", "slug": "s", "thesis": "t", "keywords": [],
    "chapters": [{
        "id": "01-network", "label": "01", "motif": "network", "keyword": "K",
        "texts": ["x"], "primary": "#fff", "secondary": "#fff", "accent": "#fff",
        "anchors": ["K"], "metaphor": "m", "seed": 5, "density": 0.5,
        "motion": 0.5, "composition": "mesh",
    }],
}


def test_stills_subcommand(tmp_path):
    sb = tmp_path / "sb.json"
    sb.write_text(json.dumps(STORYBOARD), encoding="utf-8")
    out = tmp_path / "out"
    assert cli.main(["stills", "--storyboard", str(sb), "--out", str(out)]) == 0
    assert list(out.glob("*.png"))


def test_unknown_subcommand_returns_nonzero():
    with pytest.raises(SystemExit):
        cli.main(["nope"])


def test_render_throughput_beats_v1_by_10x():
    """v1: 7,540 frames in 8,331s = 0.9 fps. Phase 1 must clear 9 fps single-threaded."""
    renderer = frames.Renderer(tokens.load_look("plata"))
    chapter = LegacyChapter(motif="network", keyword="K", anchors=["K"],
                            seed=5, density=0.5, motion=0.5)
    renderer.frame(chapter, 0.0, 0.0, 0)  # warm up atlas + BLAS
    start = time.perf_counter()
    count = 12
    for i in range(count):
        renderer.frame(chapter, i / 30.0, i / 100.0, i)
    fps = count / (time.perf_counter() - start)
    assert fps > 9.0, f"only {fps:.1f} fps"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_cli.py -v`
Expected: FAIL with `ImportError: cannot import name 'cli'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/cli.py`:

```python
"""v2 command line. Phase 1 exposes stills and a benchmark."""

from __future__ import annotations

import argparse
import time
from pathlib import Path

from . import stills
from .render import frames, tokens
from .scene.legacy import LegacyChapter


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="ascii-studio")
    sub = parser.add_subparsers(dest="command", required=True)

    still = sub.add_parser("stills", help="Render one still per storyboard chapter")
    still.add_argument("--storyboard", required=True, type=Path)
    still.add_argument("--out", required=True, type=Path)
    still.add_argument("--look", default="plata")
    still.add_argument("--contact-sheet", action="store_true")

    bench = sub.add_parser("bench", help="Measure single-threaded frame throughput")
    bench.add_argument("--frames", type=int, default=24)
    bench.add_argument("--look", default="plata")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.command == "stills":
        written = stills.render_stills(args.storyboard, args.out, args.look)
        for path in written:
            print(path)
        if args.contact_sheet:
            print(stills.contact_sheet(written, Path(args.out) / "contact-sheet.png"))
        return 0

    if args.command == "bench":
        renderer = frames.Renderer(tokens.load_look(args.look))
        chapter = LegacyChapter(motif="network", keyword="K", anchors=["K"],
                                seed=5, density=0.5, motion=0.5)
        renderer.frame(chapter, 0.0, 0.0, 0)
        start = time.perf_counter()
        for i in range(args.frames):
            renderer.frame(chapter, i / 30.0, i / 100.0, i)
        elapsed = time.perf_counter() - start
        print(f"frames_per_second={args.frames / elapsed:.2f}")
        return 0

    return 1
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_cli.py -v`
Expected: PASS, 3 passed

If `test_render_throughput_beats_v1_by_10x` fails, profile with
`/opt/anaconda3/bin/python3 -m cProfile -s cumtime -m ascii_studio.cli bench --frames 8`.
The expected hot spots in order are `compose` (buffer-resolution trig), `blit`, and
`match_glyphs`. Reduce `supersample` from 2 to 1 in `plata.json` before touching algorithms.

- [ ] **Step 5: Run the whole suite and the benchmark**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
/opt/anaconda3/bin/python3 -m pytest -v
/opt/anaconda3/bin/python3 -c "import sys; sys.path.insert(0,'scripts'); from ascii_studio import cli; cli.main(['bench','--frames','24'])"
```

Expected: all tests pass; `frames_per_second=` well above 9.

- [ ] **Step 6: Render real stills from a real storyboard and look at them**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
SB=$(find /Users/juanb/Movies/CinematicAsciiStudio -name "*-storyboard.json" | head -1)
/opt/anaconda3/bin/python3 -c "
import sys; sys.path.insert(0,'scripts')
from ascii_studio import cli
cli.main(['stills','--storyboard','$SB','--out','/tmp/v2-stills','--contact-sheet'])
"
open /tmp/v2-stills/contact-sheet.png
```

Expected: every chapter is legible ASCII, the field reaches all four edges, nothing is
clipped, and the palette is silver rather than gold/teal. **This is the human review gate for
Phase 1 — compare against the v1 frames in the spec's problem statement before continuing.**

- [ ] **Step 7: Commit**

```bash
git add scripts/ascii_studio/cli.py tests/test_cli.py
git commit -m "Add v2 CLI with stills and bench subcommands"
```

---

## Self-Review

**Spec coverage (Phase 1 items from §18):**

| Spec item | Task |
|---|---|
| Package split | 1 |
| OKLab colour | 2 |
| Tokens + `plata` look | 3 |
| Canvas zones + safe areas | 4 |
| Glyph atlas | 5 |
| Best-match + dither + hysteresis | 6 |
| Half-block + vectorised blit | 7 |
| Graded post | 8 |
| Scene into buffers (stage 1 bridge) | 9 |
| Frame assembly | 10 |
| Storyboard stills | 11 |
| Speed proof + CLI | 12 |

**Deferred with reason:**
- **Worker pool** (§15) is listed in Phase 1 of the spec but is *not* in this plan. Task 12
  proves single-threaded throughput already clears the 10× bar, which makes the pool an
  optimisation rather than a requirement. It belongs with the video-encode path, which Phase 2
  introduces. **Flag this to the user rather than silently dropping it.**
- **Golden-frame harness** (`verify.py`, §16) is deferred for the same reason: golden frames
  committed against Phase 1's legacy geometry would all be invalidated by Phase 2's
  archetypes. The safe-area assertion it would carry is already enforced by
  `test_motif_stays_inside_the_stage_zone` in Task 9.
- The v1 `render_cinematic_ascii_video.py` is **not** modified in this plan. 1a builds the
  engine beside the running system so no Studio job can break mid-way; **Phase 1b** performs
  the replacement and the deletion. The user's requirement is one system, and 1b is where that
  lands — 1a is the half of the work that must exist before a replacement is safe.

**Type consistency:** `LegacyChapter` field names (`motif`, `keyword`, `anchors`, `seed`,
`density`, `motion`) are identical in Tasks 9, 10, 11 and 12. `Atlas` fields (`chars`, `tiles`,
`sig`, `sig_norm`) are consistent in Tasks 5, 6, 7. `Grid.buffer_shape()` returns
`(height, width)` and is used that way in Tasks 6, 9, 10. `glyphs.blit` takes
`(grid_idx, atlas, fg, bg)` in Tasks 7 and 10.

**Placeholder scan:** no TBD/TODO; every code step contains complete runnable code; every test
step contains the actual assertions.
