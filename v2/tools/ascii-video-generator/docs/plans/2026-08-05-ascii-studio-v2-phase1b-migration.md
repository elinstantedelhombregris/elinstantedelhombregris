# ASCII Studio v2 — Phase 1b (Migration) Implementation Plan

> **Part 2 of 2.** Requires [Phase 1a](2026-08-05-ascii-studio-v2-phase1a-render-core.md) complete and its tests green.
>
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move v1's speech, caption, audio and encode machinery into the `ascii_studio` package unchanged, put the 1a render core underneath it, and delete v1 — leaving exactly one system that renders a complete video.

**Architecture:** v1 is not deleted and rebuilt; it is **absorbed**. Its non-visual half (TTS, word alignment, caption sync, subtitles, audio, muxing, storyboard building) moves verbatim into modules and stays the authority. Its visual half (`Canvas`, `field_for`, `draw_ascii`, `draw_motif`, `draw_caption`, `draw_ui`, `apply_post`) is deleted and replaced by the 1a pipeline. `render_cinematic_ascii_video.py` becomes a thin shim so every recorded Studio command keeps working.

**Tech Stack:** Python 3.12.7 (`/opt/anaconda3/bin/python3`), numpy 1.26.4, OpenCV 4.12.0, Pillow 10.4.0, pytest 9.0.2, ffmpeg 8.0.1, 12 cores. `edge-tts` for neural speech.

## Global Constraints

- **Python interpreter is `/opt/anaconda3/bin/python3`.**
- **Ported code is moved, never edited.** The TTS, word-alignment, caption-sync and number-normalisation functions encode expensively-found bugs (Edge `WordBoundary` handling, `#uno` punctuation-token discard, `17:21` colon splitting, Spanish thousands parsing, dash-range spoken forms). Change import paths and nothing else. If a port requires an edit to compile, stop and flag it.
- **Task 1 pins v1's behaviour before anything moves.** Every later task must keep those characterization tests green.
- **Never delete v1 code until Task 8's end-to-end render passes.** The baseline is commit `6a6df2c`.
- **The Studio's recorded commands must keep working**, e.g. `render_cinematic_ascii_video.py --input X --out Y --platform-url ... --logo ... --tts say --say-voice Paulina`.
- **Captions stay crisp vector**, drawn after the grade. The ASCII field is the picture; text is not asciified.
- All 1a global constraints remain in force (grid exactly 120×128, OKLab only, accent reserved, JetBrains Mono).

---

## File Structure

Moved into the package (verbatim):

| New path | v1 source (line numbers from baseline `6a6df2c`) |
|---|---|
| `ascii_studio/util.py` | `run` 143, `capture` 149, `require_binary` 153, `smoothstep` 94 |
| `ascii_studio/text.py` | `strip_accents` 158, `normalized_words` 163, `slugify` 167 |
| `ascii_studio/source.py` | `parse_frontmatter` 181, `clean_markdown` 195, `read_source` 207 |
| `ascii_studio/storyboard/schema.py` | `WordTiming` 100, `Caption` 107, `Chapter` 117, `Storyboard` 135, `load_storyboard` 376, `write_json` 388. **Add one field to `Chapter`: `persona: bool = False`.** It must have a default so the existing corpus of v1 storyboards (which lack the key) still loads through `Chapter(**chapter)`. |
| `ascii_studio/storyboard/build.py` | `extract_keywords` 217, `split_units` 225, `partition` 254, `semantic_hits` 261, `choose_motif` 268, `content_seed` 282, `chapter_anchors` 286, `visual_metaphor` 296, `chapter_parameters` 313, `build_storyboard` 336, `write_art_direction` 392, `scene_ranges` 745, plus module constants `STOPWORDS`, `MOTIF_RULES`, `FALLBACK_MOTIFS`, `PALETTES` |
| `ascii_studio/editorial/script.py` | `performance_script` 455, `spanish_integer` 479, `normalize_spoken_numbers` 515 |
| `ascii_studio/speech/tts.py` | `synthesize_voice` 597, `estimate_word_timings` 442 |
| `ascii_studio/speech/captions.py` | `caption_text` 544, `validate_caption_sync` 557, `alignment_token` 631, `caption_wrap_count` 635, `split_visible_caption_words` 640, `write_word_timings` 659, `build_precise_captions` 681, `active_caption` 1239, `active_word_index` 1248, `caption_lines` 1261 |
| `ascii_studio/speech/subtitles.py` | `srt_time` 723, `vtt_time` 731, `write_subtitles` 735 |
| `ascii_studio/audio/io.py` | `write_wav` 410, `read_wav` 423, `wav_duration` 433, `silence_wav` 438 |
| `ascii_studio/audio/design.py` | `add_tone` 756, `add_noise` 766, `build_music` 778, `build_sfx` 787, `mix_audio` 809 |
| `ascii_studio/encode.py` | `write_preview` 1467, plus the ffmpeg/derivative/cover calls inside `render` 1478 |

Created new in 1b:

| Path | Responsibility |
|---|---|
| `ascii_studio/render/typography.py` | title, chapter label, progress, footer, caption plate — crisp vector, drawn after grade |
| `ascii_studio/render/seal.py` | logo → ASCII seal (replaces `draw_logo_ascii`/`load_logo`/`draw_intro_seal`) |
| `ascii_studio/render/persona.py` | prepared persona PNG → luminance, placed in `stage`, per-chapter |
| `ascii_studio/video.py` | full render loop, chapter-aligned worker pool, mux |
| `tests/test_characterization.py` | pins v1 behaviour before the move |
| `tests/fixtures/sample-article.md` | deterministic input for characterization |

**Deleted in Task 9** (replaced by 1a): `Canvas` 824, `field_for` 863, `blend_field` 903, `draw_ascii` 914, `line` 935, `ring` 939, `short_anchor` 943, `draw_annotations` 947, `draw_motif` 956, `draw_logo_ascii` 1063, `load_logo` 1092, `draw_intro_seal` 1107, `draw_caption` 1266, `fit_title` 1316, `draw_ui` 1337, `draw_atmosphere` 1354, `apply_post` 1367, `frame_at` 1394, `render_video` 1421, `hex_color` 172, `rgba` 177.

**Deleted and REPLACED, not regressed:** `speech_energy` 1136 and `draw_hombre_gris_persona` 1148. v1 drew the figure as a procedural silhouette. v2 replaces it with the real prepared persona asset (`assets/persona/hombre-gris-01.png`, `-02.png`, committed in `712fe5f`), composited into the luminance buffer so the figure is made of characters like everything else.

`--persona hombre-gris` keeps working and gets better. This reverses the retirement this plan originally specified: the user supplied torso photographs and asked for the figure in the videos, so it ships in 1b rather than waiting for Phase 2's `portrait` archetype.

---

## Task 1: Pin v1's behaviour before touching it

Nothing moves until v1's current output is captured. This is the safety net for every later task.

**Files:**
- Create: `tests/fixtures/sample-article.md`, `tests/test_characterization.py`

**Interfaces:**
- Consumes: v1 `render_cinematic_ascii_video.py` as a subprocess
- Produces: `tests/fixtures/golden/` containing `*-storyboard.json`, `*-brief.json`, `*.srt`, `*-word-timings.json`

- [ ] **Step 1: Create the fixture article**

Create `tests/fixtures/sample-article.md`:

```markdown
---
title: La confianza como infraestructura
---

# La confianza como infraestructura

En Medellín, Colombia, la aplicación deliberada de cultura ciudadana redujo la
violencia en un 298.000 por ciento menos de lo que se esperaba entre 2001-2003.
No fue un milagro: fue diseño social sostenido.

¿Y si la amabilidad no fuera cortesía? Decile "amabilidad" a un argentino curtido
por la calle y te va a mirar con desconfianza. Pero hay otra lectura, una que
cambia todo.

La confianza multiplica. Cada interacción amable era una señal, y las señales
construyen sistemas. Sin confianza no hay cooperación, y sin cooperación no hay
ciudad posible.

El camino existe. Empieza por una decisión repetida.
```

This fixture is chosen to exercise the fragile paths deliberately: grouped thousands
(`298.000`), a dash range (`2001-2003`), a percentage, quotation marks, and an interrogative.

- [ ] **Step 2: Write the characterization test**

Create `tests/test_characterization.py`:

```python
"""Pins v1 behaviour so the Phase 1b port can be proven faithful.

These tests must stay green through every migration task. If one fails after a move,
the move was not verbatim.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
PYTHON = "/opt/anaconda3/bin/python3"
FIXTURE = ROOT / "tests" / "fixtures" / "sample-article.md"
GOLDEN = ROOT / "tests" / "fixtures" / "golden"


def _run_brief(out_dir: Path) -> None:
    subprocess.run(
        [PYTHON, str(ROOT / "scripts" / "render_cinematic_ascii_video.py"),
         "--input", str(FIXTURE), "--out", str(out_dir), "--brief-only"],
        check=True, capture_output=True, text=True,
    )


@pytest.fixture(scope="module")
def produced(tmp_path_factory) -> Path:
    out = tmp_path_factory.mktemp("charz")
    _run_brief(out)
    return out


def _load(directory: Path, suffix: str) -> dict:
    matches = sorted(directory.glob(f"*{suffix}"))
    assert matches, f"no *{suffix} in {directory}"
    return json.loads(matches[0].read_text(encoding="utf-8"))


def test_storyboard_matches_golden(produced):
    assert _load(produced, "-storyboard.json") == _load(GOLDEN, "-storyboard.json")


def test_brief_matches_golden(produced):
    assert _load(produced, "-brief.json") == _load(GOLDEN, "-brief.json")


def test_storyboard_chapter_count_is_stable(produced):
    chapters = _load(produced, "-storyboard.json")["chapters"]
    assert 4 <= len(chapters) <= 8


def test_number_normalisation_is_preserved():
    """The grouped-thousands and dash-range fixes must survive the port."""
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        from ascii_studio.editorial.script import normalize_spoken_numbers
    except ImportError:
        pytest.skip("not yet ported; v1 still authoritative")
    spoken = normalize_spoken_numbers("entre 2001-2003 hubo 298.000 casos")
    assert "-" not in spoken
    assert "298.000" not in spoken
    assert "dos mil uno" in spoken
```

- [ ] **Step 3: Generate the golden files from v1**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
rm -rf tests/fixtures/golden && mkdir -p tests/fixtures/golden
/opt/anaconda3/bin/python3 scripts/render_cinematic_ascii_video.py \
  --input tests/fixtures/sample-article.md \
  --out tests/fixtures/golden \
  --brief-only
ls tests/fixtures/golden
```

Expected: `*-brief.json`, `*-art-direction.md`, `*-storyboard.json` written.

- [ ] **Step 4: Run the characterization tests**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_characterization.py -v`
Expected: PASS (3 passed, 1 skipped — the normalisation test skips until Task 3)

- [ ] **Step 5: Commit**

```bash
git add tests/fixtures tests/test_characterization.py
git commit -m "Pin v1 behaviour with characterization tests before migration"
```

---

## Task 2: Move source, text, util and storyboard modules

**Files:**
- Create: `ascii_studio/util.py`, `ascii_studio/text.py`, `ascii_studio/source.py`, `ascii_studio/storyboard/__init__.py`, `ascii_studio/storyboard/schema.py`, `ascii_studio/storyboard/build.py`
- Modify: `scripts/render_cinematic_ascii_video.py` (import from the new modules instead of defining)

**Interfaces:**
- Produces (all signatures unchanged from v1):
  - `text.strip_accents(str) -> str`, `text.normalized_words(str) -> list[str]`, `text.slugify(str) -> str`
  - `source.read_source(Path, str | None) -> tuple[str, str]`
  - `storyboard.schema.WordTiming(start, end, text)`, `Caption(index, start, end, text, section, words)`, `Chapter(...)`, `Storyboard(title, slug, thesis, keywords, chapters)`, `load_storyboard(Path) -> Storyboard`, `write_json(Path, object) -> None`
  - `storyboard.build.build_storyboard(title, slug, text, chapter_limit) -> Storyboard`, `scene_ranges(captions, chapters, duration) -> dict[str, tuple[float, float]]`, `write_art_direction(Path, Storyboard) -> None`

- [ ] **Step 1: Move the functions verbatim**

Cut each function listed in the File Structure table from `render_cinematic_ascii_video.py` and paste it into its new module. Add only the imports each module needs. **Do not change a single line of a function body.**

Then in `render_cinematic_ascii_video.py`, replace the removed definitions with:

```python
from ascii_studio.source import clean_markdown, parse_frontmatter, read_source
from ascii_studio.storyboard.build import (
    build_storyboard, chapter_anchors, chapter_parameters, choose_motif,
    content_seed, extract_keywords, partition, scene_ranges, semantic_hits,
    split_units, visual_metaphor, write_art_direction,
)
from ascii_studio.storyboard.schema import (
    Caption, Chapter, Storyboard, WordTiming, load_storyboard, write_json,
)
from ascii_studio.text import normalized_words, slugify, strip_accents
from ascii_studio.util import capture, require_binary, run, smoothstep
```

Add at the top of `render_cinematic_ascii_video.py`, before those imports:

```python
import sys
from pathlib import Path as _Path

sys.path.insert(0, str(_Path(__file__).resolve().parent))
```

- [ ] **Step 2: Run the characterization tests**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_characterization.py -v`
Expected: PASS, identical to Task 1. Any diff means the move was not verbatim — revert and redo.

- [ ] **Step 3: Run the full suite**

Run: `/opt/anaconda3/bin/python3 -m pytest -q`
Expected: all 1a tests still pass.

- [ ] **Step 4: Commit**

```bash
git add scripts/
git commit -m "Move source, text, util and storyboard modules into ascii_studio"
```

---

## Task 3: Move speech, editorial script and subtitle modules

The most delicate move in the plan. These functions carry the sync fixes.

**Files:**
- Create: `ascii_studio/editorial/__init__.py`, `ascii_studio/editorial/script.py`, `ascii_studio/speech/__init__.py`, `ascii_studio/speech/tts.py`, `ascii_studio/speech/captions.py`, `ascii_studio/speech/subtitles.py`
- Modify: `scripts/render_cinematic_ascii_video.py`

**Interfaces:**
- Produces (signatures unchanged):
  - `editorial.script.performance_script(text, mode) -> str`, `spanish_integer(int, bool) -> str`, `normalize_spoken_numbers(str) -> str`
  - `speech.tts.synthesize_voice(...)`, `estimate_word_timings(text, duration) -> list[WordTiming]`
  - `speech.captions.build_precise_captions(chapters, timings) -> list[Caption]`, `validate_caption_sync(captions, timings) -> None`, `active_caption(captions, t) -> Caption | None`, `active_word_index(caption, t) -> int`, `caption_lines(text, max_chars) -> list[list[str]]`, `caption_text(str) -> str`, `write_word_timings(path, timings, captions) -> None`
  - `speech.subtitles.write_subtitles(captions, srt_path, vtt_path) -> None`
  - Module constants `CAPTION_MAX_CHARS = 29`, `CAPTION_MAX_LINES = 3`, `CAPTION_FIRST_PREROLL`, `CAPTION_LAST_HOLD`, `VOICE_PERFORMANCE_CHOICES`, `DEFAULT_EDGE_VOICE`, `DEFAULT_EDGE_RATE`, `DEFAULT_EDGE_PITCH`, `DEFAULT_SAY_VOICE`, `DEFAULT_SAY_RATE` move with the code that uses them.

- [ ] **Step 1: Move the functions verbatim**

Same discipline as Task 2. Move every function in the three speech rows plus the editorial row of the File Structure table. Keep `SAMPLE_RATE = 48_000` in `audio/io.py` and import it where needed.

Replace the removed definitions in `render_cinematic_ascii_video.py` with:

```python
from ascii_studio.editorial.script import (
    normalize_spoken_numbers, performance_script, spanish_integer,
)
from ascii_studio.speech.captions import (
    CAPTION_FIRST_PREROLL, CAPTION_LAST_HOLD, CAPTION_MAX_CHARS, CAPTION_MAX_LINES,
    active_caption, active_word_index, alignment_token, build_precise_captions,
    caption_lines, caption_text, caption_wrap_count, split_visible_caption_words,
    validate_caption_sync, write_word_timings,
)
from ascii_studio.speech.subtitles import srt_time, vtt_time, write_subtitles
from ascii_studio.speech.tts import (
    DEFAULT_EDGE_PITCH, DEFAULT_EDGE_RATE, DEFAULT_EDGE_VOICE, DEFAULT_SAY_RATE,
    DEFAULT_SAY_VOICE, VOICE_PERFORMANCE_CHOICES, estimate_word_timings,
    synthesize_voice,
)
```

- [ ] **Step 2: Write a regression test for the sync fixes**

Append to `tests/test_characterization.py`:

```python
def test_punctuation_tokens_are_not_karaoke_words():
    """Em dashes and bullet hyphens must never become highlighted words."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    assert "—" not in caption_text("la ciudad — la confianza")


def test_colon_reference_splits_into_tokens():
    """'17:21' must produce a visible token boundary so Edge events stay 1:1."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    out = normalize_spoken_numbers("ver 17:21 ahora")
    assert "17" in out and "21" in out


def test_percentage_and_year_normalisation():
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    out = normalize_spoken_numbers("creció 25 por ciento en 2003")
    assert "2003" not in out or "dos mil tres" in out
```

- [ ] **Step 3: Run the characterization tests**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_characterization.py -v`
Expected: PASS, now including `test_number_normalisation_is_preserved` (no longer skipped).

- [ ] **Step 4: Run the full suite**

Run: `/opt/anaconda3/bin/python3 -m pytest -q`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/ tests/
git commit -m "Move speech, editorial script and subtitle modules into ascii_studio"
```

---

## Task 4: Move audio modules

**Files:**
- Create: `ascii_studio/audio/__init__.py`, `ascii_studio/audio/io.py`, `ascii_studio/audio/design.py`
- Modify: `scripts/render_cinematic_ascii_video.py`

**Interfaces:**
- Produces (signatures unchanged): `audio.io.SAMPLE_RATE`, `write_wav`, `read_wav`, `wav_duration`, `silence_wav`; `audio.design.add_tone`, `add_noise`, `build_music(duration) -> np.ndarray`, `build_sfx(duration, chapters, ranges) -> np.ndarray`, `mix_audio(voice_path, music, sfx, out_dir, slug) -> tuple[Path, Path, Path]`

- [ ] **Step 1: Move verbatim, then import**

```python
from ascii_studio.audio.design import add_noise, add_tone, build_music, build_sfx, mix_audio
from ascii_studio.audio.io import SAMPLE_RATE, read_wav, silence_wav, wav_duration, write_wav
```

- [ ] **Step 2: Write a smoke test**

Create `tests/test_audio_port.py`:

```python
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from ascii_studio.audio import design, io


def test_music_length_matches_duration():
    track = design.build_music(3.0)
    assert abs(len(track) / io.SAMPLE_RATE - 3.25) < 0.05


def test_music_is_not_silent():
    assert np.abs(design.build_music(3.0)).max() > 0.01


def test_wav_roundtrip(tmp_path):
    samples = np.sin(np.linspace(0, 40, io.SAMPLE_RATE)).astype(np.float32) * 0.5
    path = tmp_path / "a.wav"
    io.write_wav(path, samples)
    assert abs(io.wav_duration(path) - 1.0) < 0.02
    assert io.read_wav(path).shape[0] == io.SAMPLE_RATE
```

- [ ] **Step 3: Run tests**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_audio_port.py tests/test_characterization.py -v`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add scripts/ tests/test_audio_port.py
git commit -m "Move audio io and sound design into ascii_studio"
```

---

## Task 5: Typography — captions, title, chapter UI, footer

Captions are drawn **after** the grade so they stay crisp; the ASCII field is the picture, text is not asciified.

**Files:**
- Create: `ascii_studio/render/typography.py`
- Test: `tests/test_typography.py`

**Interfaces:**
- Consumes: `canvas.Grid`, `canvas.ZONES`, `tokens.Look`, `speech.captions.Caption`
- Produces:
  - `plate_alpha(frame: np.ndarray, grid: Grid) -> int` — measured background luminance → plate opacity holding ≥4.5:1 contrast
  - `draw_caption(img: Image.Image, grid: Grid, look: Look, caption, t: float) -> None`
  - `draw_title(img: Image.Image, grid: Grid, look: Look, title: str, chapter_label: str) -> None`
  - `draw_progress(img: Image.Image, grid: Grid, look: Look, chapter_index: int, chapter_count: int, progress: float) -> None`
  - `draw_footer(img: Image.Image, grid: Grid, look: Look, keyword: str, url: str | None) -> None`
  - `overlay(frame: np.ndarray, grid: Grid, look: Look, **kwargs) -> np.ndarray`

- [ ] **Step 1: Write the failing test**

Create `tests/test_typography.py`:

```python
import numpy as np
import pytest
from PIL import Image

from ascii_studio.render import canvas, tokens, typography
from ascii_studio.storyboard.schema import Caption, WordTiming


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


def caption():
    words = [WordTiming(0.0, 0.4, "No"), WordTiming(0.4, 0.9, "fue"),
             WordTiming(0.9, 1.6, "un"), WordTiming(1.6, 2.4, "milagro")]
    return Caption(0, 0.0, 2.4, "No fue un milagro", "01", words)


def test_overlay_preserves_shape_and_dtype(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title="La confianza", chapter_label="01 / FLOW",
                             chapter_index=0, chapter_count=4, progress=0.3,
                             keyword="CONFIANZA", url="www.example.com")
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.uint8


def test_caption_marks_the_caption_zone(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title="T", chapter_label="01", chapter_index=0,
                             chapter_count=2, progress=0.0, keyword="K", url=None)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["caption"])
    assert out[y0:y1, x0:x1].max() > 60


def test_caption_stays_inside_its_zone(grid, look):
    """Regression: v1 drew the keyword behind the caption plate."""
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title=None, chapter_label=None, chapter_index=0,
                             chapter_count=1, progress=0.0, keyword=None, url=None)
    _, y0, _, y1 = grid.zone_px(canvas.ZONES["caption"])
    outside = np.concatenate([out[:y0], out[y1:]])
    assert outside.max() < 8, "caption drew outside the caption zone"


def test_active_word_uses_the_accent(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=2.0,
                             title=None, chapter_label=None, chapter_index=0,
                             chapter_count=1, progress=0.0, keyword=None, url=None)
    accent = (tokens.load_look("plata").accent_rgb() * 255).astype(np.int16)
    diff = np.abs(out.astype(np.int16) - accent[None, None, :]).sum(axis=2)
    assert (diff < 90).sum() > 200, "accent not present on the active word"


def test_plate_alpha_rises_on_bright_backgrounds(grid):
    dark = np.zeros((1920, 1080, 3), dtype=np.uint8)
    bright = np.full((1920, 1080, 3), 230, dtype=np.uint8)
    assert typography.plate_alpha(bright, grid) > typography.plate_alpha(dark, grid)


def test_footer_clears_platform_ui(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0, title=None,
                             chapter_label=None, chapter_index=0, chapter_count=1,
                             progress=0.0, keyword="CONFIANZA", url="www.example.com")
    mask_top = int(canvas.PLATFORM_MASKS["tiktok"].y0 * 1920)
    assert out[mask_top:].max() < 8, "footer intrudes into platform UI"


def test_no_caption_is_safe(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0, title="T",
                             chapter_label="01", chapter_index=0, chapter_count=1,
                             progress=0.0, keyword="K", url=None)
    assert out.shape == (1920, 1080, 3)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_typography.py -v`
Expected: FAIL with `ImportError: cannot import name 'typography'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/typography.py`:

```python
"""Crisp vector text drawn after the grade.

The ASCII field is the picture; captions and UI are not asciified -- they must stay
legible after platform recompression. v1 nailed every element to a magic pixel
coordinate, which is how the chapter keyword ended up behind the caption plate. Here
every element is clamped to its zone.
"""

from __future__ import annotations

import textwrap

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from ..storyboard.schema import Caption
from .canvas import ZONES, Grid
from .tokens import Look

CAPTION_MAX_CHARS = 29
CAPTION_MAX_LINES = 3
_MIN_PLATE_ALPHA = 150
_MAX_PLATE_ALPHA = 232


def _font(look: Look, px: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(look.ui_font, max(8, px))


def _relative_luminance(rgb: np.ndarray) -> float:
    channels = rgb.astype(np.float32) / 255.0
    linear = np.where(channels <= 0.04045, channels / 12.92,
                      ((channels + 0.055) / 1.055) ** 2.4)
    return float((linear * np.array([0.2126, 0.7152, 0.0722])).sum(axis=-1).mean())


def plate_alpha(frame: np.ndarray, grid: Grid) -> int:
    """Opacity needed for the caption plate to hold contrast over this background."""
    x0, y0, x1, y1 = grid.zone_px(ZONES["caption"])
    luminance = _relative_luminance(frame[y0:y1, x0:x1])
    # Brighter field behind -> denser plate. Linear in measured luminance is enough
    # here because the plate itself is near-black.
    return int(round(_MIN_PLATE_ALPHA + (_MAX_PLATE_ALPHA - _MIN_PLATE_ALPHA) * min(1.0, luminance * 2.2)))


def _caption_lines(text: str) -> list[list[str]]:
    wrapped = textwrap.wrap(text, width=CAPTION_MAX_CHARS,
                            break_long_words=False, break_on_hyphens=False)
    return [line.split() for line in wrapped[:CAPTION_MAX_LINES]]


def _active_index(caption: Caption, t: float) -> int:
    index = 0
    for position, word in enumerate(caption.words):
        if t >= word.start:
            index = position
        else:
            break
    return index


def draw_caption(img: Image.Image, grid: Grid, look: Look, caption, t: float, alpha: int) -> None:
    if caption is None:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["caption"])
    lines = _caption_lines(caption.text)
    if not lines:
        return

    size = int(grid.height * 0.026)
    font = _font(look, size)
    leading = int(size * 1.42)
    space = draw.textlength(" ", font=font)

    widths = [
        sum(draw.textlength(w, font=font) for w in words) + max(0, len(words) - 1) * space
        for words in lines
    ]
    block_h = leading * len(lines)
    top = zy0 + ((zy1 - zy0) - block_h) // 2
    pad = int(grid.width * 0.022)
    left = max(zx0, int((grid.width - max(widths)) / 2) - pad)
    right = min(zx1, int((grid.width + max(widths)) / 2) + pad)

    draw.rounded_rectangle(
        (left, top - pad // 2, right, top + block_h + pad // 2),
        radius=int(grid.width * 0.009),
        fill=(4, 6, 8, alpha),
    )

    accent = tuple(int(c * 255) for c in look.accent_rgb())
    text_rgb = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
    cursor = 0
    active = _active_index(caption, t)
    y = top
    for words in lines:
        total = sum(draw.textlength(w, font=font) for w in words) + max(0, len(words) - 1) * space
        x = (grid.width - total) / 2
        for word in words:
            width = draw.textlength(word, font=font)
            fill = (*accent, 255) if cursor == active else (*text_rgb, 252)
            draw.text((x, y), word, font=font, fill=fill)
            x += width + space
            cursor += 1
        y += leading


def draw_title(img: Image.Image, grid: Grid, look: Look, title, chapter_label) -> None:
    if not title and not chapter_label:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["title"])
    ink = tuple(int(c * 255) for c in look.ramp_rgb()[-2])

    if title:
        for size in range(int(grid.height * 0.017), 8, -1):
            font = _font(look, size)
            words = title.upper().split()
            best = None
            for split in range(len(words), 0, -1):
                lines = [" ".join(words[:split]), " ".join(words[split:])]
                lines = [ln for ln in lines if ln]
                if max(draw.textlength(ln, font=font) for ln in lines) <= (zx1 - zx0):
                    best = lines
                    break
            if best and len(best) <= 2:
                for index, line in enumerate(best):
                    draw.text((zx0, zy0 + index * int(size * 1.35)), line, font=font, fill=(*ink, 228))
                break

    if chapter_label:
        small = _font(look, int(grid.height * 0.010))
        accent = tuple(int(c * 255) for c in look.accent_rgb())
        draw.text((zx0, zy1 - int(grid.height * 0.013)), chapter_label, font=small, fill=(*accent, 235))


def draw_progress(img: Image.Image, grid: Grid, look: Look,
                  chapter_index: int, chapter_count: int, progress: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, _, zx1, zy1 = grid.zone_px(ZONES["title"])
    y = zy1 + int(grid.height * 0.004)
    thickness = max(2, int(grid.height * 0.0016))
    draw.line((zx0, y, zx1, y), fill=(214, 228, 220, 64), width=thickness)
    span = (zx1 - zx0) / max(1, chapter_count)
    end = zx0 + span * (chapter_index + max(0.0, min(1.0, progress)))
    accent = tuple(int(c * 255) for c in look.accent_rgb())
    draw.line((zx0, y, end, y), fill=(*accent, 240), width=thickness * 2)


def draw_footer(img: Image.Image, grid: Grid, look: Look, keyword, url) -> None:
    if not keyword and not url:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["footer"])
    font = _font(look, int(grid.height * 0.0092))
    ink = tuple(int(c * 255) for c in look.ramp_rgb()[-3])
    if keyword:
        draw.text((zx0, zy0), keyword, font=font, fill=(*ink, 220))
    if url:
        width = draw.textlength(url, font=font)
        draw.text((zx1 - width, zy0), url, font=font, fill=(*ink, 196))


def overlay(frame: np.ndarray, grid: Grid, look: Look, *, caption=None, t: float = 0.0,
            title=None, chapter_label=None, chapter_index: int = 0,
            chapter_count: int = 1, progress: float = 0.0,
            keyword=None, url=None) -> np.ndarray:
    alpha = plate_alpha(frame, grid)
    img = Image.fromarray(frame).convert("RGBA")
    draw_title(img, grid, look, title, chapter_label)
    if title or chapter_label:
        draw_progress(img, grid, look, chapter_index, chapter_count, progress)
    draw_caption(img, grid, look, caption, t, alpha)
    draw_footer(img, grid, look, keyword, url)
    return np.asarray(img.convert("RGB"), dtype=np.uint8)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_typography.py -v`
Expected: PASS, 7 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/typography.py tests/test_typography.py
git commit -m "Add v2 typography with zone-clamped captions and adaptive plate"
```

---

## Task 6: Logo seal and persona as ASCII

Both put a prepared image into the luminance buffer so it becomes characters. Same shape of
problem, so they land together.

**Files:**
- Create: `ascii_studio/render/seal.py`, `ascii_studio/render/persona.py`
- Test: `tests/test_seal.py`, `tests/test_persona.py`

**Interfaces:**
- Consumes: `canvas.Grid`, `canvas.ZONES`
- Produces (seal):
  - `load_logo_mask(path: Path | None) -> np.ndarray | None` — cropped alpha/luma mask, float32 0..1
  - `seal_luminance(mask, grid, t, duration) -> np.ndarray` — buffer-shaped, scaled into `stage`, fading over `duration`
- Produces (persona):
  - `PERSONA_DIR: Path` — `assets/persona/` relative to the package root
  - `load_persona(name: str = "hombre-gris-01") -> np.ndarray` — the prepared luminance PNG as float32 0..1; raises `FileNotFoundError` listing available names if absent
  - `persona_luminance(persona: np.ndarray | None, grid: Grid, intensity: float = 0.55) -> np.ndarray` — buffer-shaped, aspect-preserved, bottom-anchored in `stage`, scaled by `intensity`

**Persona placement rules** (these are the art direction; do not improvise alternatives):
- Bottom-anchored in `stage`, not centred — the figure rises from the lower edge of the stage
  toward the caption plate, the way a presence stands behind text.
- Aspect ratio preserved; scaled so the figure's height fills the stage zone, cropping width
  symmetrically if it overflows.
- `intensity` multiplies the luminance. The default 0.55 keeps the figure clearly subordinate to
  chapter geometry — it is a presence, not the subject. It is a token-able art-direction control.

**Additional tests for `tests/test_persona.py`:**

```python
def test_persona_assets_exist():
    from ascii_studio.render import persona
    assert (persona.PERSONA_DIR / "hombre-gris-01.png").exists()
    assert (persona.PERSONA_DIR / "hombre-gris-02.png").exists()


def test_unknown_persona_lists_what_is_available():
    from ascii_studio.render import persona
    import pytest
    with pytest.raises(FileNotFoundError, match="hombre-gris-01"):
        persona.load_persona("nope")


def test_persona_stays_inside_stage(grid):
    from ascii_studio.render import canvas, persona
    lum = persona.persona_luminance(persona.load_persona(), grid)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["stage"])
    ss = grid.supersample
    outside = lum.copy()
    outside[y0 * ss:y1 * ss, x0 * ss:x1 * ss] = 0.0
    assert outside.max() == 0.0


def test_persona_is_bottom_anchored(grid):
    """The figure rises from the stage's lower edge, it does not float in the middle."""
    from ascii_studio.render import canvas, persona
    lum = persona.persona_luminance(persona.load_persona(), grid)
    _, y0, _, y1 = grid.zone_px(canvas.ZONES["stage"])
    ss = grid.supersample
    stage = lum[y0 * ss:y1 * ss]
    rows = np.where(stage.max(axis=1) > 0.02)[0]
    assert rows.max() >= stage.shape[0] - 4, "figure does not reach the stage's bottom edge"


def test_intensity_scales_the_figure(grid):
    from ascii_studio.render import persona
    art = persona.load_persona()
    faint = persona.persona_luminance(art, grid, intensity=0.2)
    strong = persona.persona_luminance(art, grid, intensity=0.9)
    assert strong.max() > faint.max() * 2.0


def test_none_persona_yields_empty_buffer(grid):
    from ascii_studio.render import persona
    lum = persona.persona_luminance(None, grid)
    assert lum.shape == grid.buffer_shape()
    assert lum.max() == 0.0
```

- [ ] **Step 1: Write the failing test**

Create `tests/test_seal.py`:

```python
import numpy as np
import pytest
from PIL import Image

from ascii_studio.render import canvas, seal, tokens


@pytest.fixture(scope="module")
def grid():
    return canvas.make_grid(1080, 1920, tokens.load_look("plata"))


@pytest.fixture
def logo(tmp_path):
    img = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    for y in range(120, 280):
        for x in range(180, 220):
            img.putpixel((x, y), (255, 255, 255, 255))
    for y in range(180, 220):
        for x in range(120, 280):
            img.putpixel((x, y), (255, 255, 255, 255))
    path = tmp_path / "logo.png"
    img.save(path)
    return path


def test_missing_logo_returns_none():
    assert seal.load_logo_mask(None) is None


def test_mask_is_cropped_to_ink(logo):
    mask = seal.load_logo_mask(logo)
    assert mask is not None
    assert mask.max() > 0.9
    assert mask.shape[0] < 400 and mask.shape[1] < 400


def test_seal_is_inside_stage(grid, logo):
    mask = seal.load_logo_mask(logo)
    lum = seal.seal_luminance(mask, grid, 0.4, 1.6)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["stage"])
    ss = grid.supersample
    outside = lum.copy()
    outside[y0 * ss:y1 * ss, x0 * ss:x1 * ss] = 0.0
    assert outside.max() == 0.0


def test_seal_fades_out(grid, logo):
    mask = seal.load_logo_mask(logo)
    early = seal.seal_luminance(mask, grid, 0.2, 1.6).max()
    late = seal.seal_luminance(mask, grid, 1.55, 1.6).max()
    assert early > late


def test_seal_is_gone_after_duration(grid, logo):
    mask = seal.load_logo_mask(logo)
    assert seal.seal_luminance(mask, grid, 2.0, 1.6).max() == 0.0


def test_none_mask_yields_empty_buffer(grid):
    lum = seal.seal_luminance(None, grid, 0.4, 1.6)
    assert lum.shape == grid.buffer_shape()
    assert lum.max() == 0.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_seal.py -v`
Expected: FAIL with `ImportError: cannot import name 'seal'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/render/seal.py`:

```python
"""Opening logo seal, rendered into the luminance buffer so it becomes characters."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from .canvas import ZONES, Grid

SEAL_COVERAGE = 0.62   # fraction of the stage's shorter side


def load_logo_mask(path: Path | None) -> np.ndarray | None:
    if path is None:
        return None
    image = Image.open(path).convert("RGBA")
    rgba = np.asarray(image, dtype=np.float32) / 255.0
    alpha = rgba[:, :, 3]
    luma = rgba[:, :, :3].max(axis=2)
    mask = np.where(alpha > 0.05, luma * alpha, 0.0).astype(np.float32)
    rows, cols = np.where(mask > 0.08)
    if len(rows) == 0:
        return mask
    return mask[rows.min():rows.max() + 1, cols.min():cols.max() + 1]


def seal_luminance(mask: np.ndarray | None, grid: Grid, t: float, duration: float) -> np.ndarray:
    height, width = grid.buffer_shape()
    buf = np.zeros((height, width), dtype=np.float32)
    if mask is None or duration <= 0 or t >= duration:
        return buf

    fade = 1.0 - max(0.0, (t - duration * 0.55) / max(1e-6, duration * 0.45))
    fade = float(np.clip(fade, 0.0, 1.0))
    if fade <= 0.0:
        return buf

    ss = grid.supersample
    sx0, sy0, sx1, sy1 = grid.zone_px(ZONES["stage"])
    sx0, sy0, sx1, sy1 = sx0 * ss, sy0 * ss, sx1 * ss, sy1 * ss
    target = int(min(sx1 - sx0, sy1 - sy0) * SEAL_COVERAGE)
    scale = target / max(mask.shape)
    resized = cv2.resize(
        mask, (max(1, int(mask.shape[1] * scale)), max(1, int(mask.shape[0] * scale))),
        interpolation=cv2.INTER_AREA,
    )
    oy = sy0 + ((sy1 - sy0) - resized.shape[0]) // 2
    ox = sx0 + ((sx1 - sx0) - resized.shape[1]) // 2
    buf[oy:oy + resized.shape[0], ox:ox + resized.shape[1]] = resized * fade
    return np.clip(buf, 0.0, 1.0)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_seal.py -v`
Expected: PASS, 6 passed

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/render/seal.py tests/test_seal.py
git commit -m "Add ASCII logo seal rendered into the luminance buffer"
```

---

## Task 7: Full video render with a chapter-aligned worker pool

**Files:**
- Create: `ascii_studio/video.py`
- Modify: `ascii_studio/render/frames.py` (accept seal + caption context)
- Test: `tests/test_video.py`

**Interfaces:**
- Consumes: `Renderer`, `typography`, `seal`, `storyboard.build.scene_ranges`
- Produces:
  - `RenderContext` dataclass: `storyboard, captions, ranges, logo_mask, url, intro_seal_seconds, look_name, width, height, fps, crf`
  - `chapter_at(t, chapters, ranges) -> tuple[int, Chapter, float]` (moved from v1:1386)
  - `render_segment(ctx: RenderContext, start_frame: int, end_frame: int, out_path: Path) -> Path`
  - `render_video(ctx: RenderContext, duration: float, out_path: Path, workers: int | None = None) -> Path`
  - `segment_bounds(ranges, chapters, duration, fps, workers) -> list[tuple[int, int]]` — boundaries snapped to chapter cuts

- [ ] **Step 1: Write the failing test**

Create `tests/test_video.py`:

```python
import subprocess
from pathlib import Path

import pytest

from ascii_studio import video
from ascii_studio.storyboard.schema import Caption, Chapter, Storyboard, WordTiming


def _storyboard():
    chapters = [
        Chapter(id="01-network", label="01 / NETWORK", motif="network", keyword="K",
                texts=["uno"], primary="#fff", secondary="#fff", accent="#fff",
                anchors=["K"], metaphor="m", seed=5, density=0.5, motion=0.5,
                composition="mesh"),
        Chapter(id="02-horizon", label="02 / HORIZON", motif="horizon", keyword="C",
                texts=["dos"], primary="#fff", secondary="#fff", accent="#fff",
                anchors=["C"], metaphor="m", seed=6, density=0.5, motion=0.5,
                composition="path"),
    ]
    return Storyboard(title="T", slug="t", thesis="th", keywords=[], chapters=chapters)


def _ctx(**over):
    sb = _storyboard()
    ranges = {"01-network": (0.0, 1.0), "02-horizon": (1.0, 2.0)}
    caps = [Caption(0, 0.0, 2.0, "no fue un milagro", "01",
                    [WordTiming(0.0, 0.5, "no"), WordTiming(0.5, 1.0, "fue"),
                     WordTiming(1.0, 1.5, "un"), WordTiming(1.5, 2.0, "milagro")])]
    base = dict(storyboard=sb, captions=caps, ranges=ranges, logo_mask=None, url=None,
                intro_seal_seconds=0.0, look_name="plata", width=540, height=960,
                fps=6, crf=30)
    base.update(over)
    return video.RenderContext(**base)


def test_segments_snap_to_chapter_boundaries():
    ctx = _ctx()
    bounds = video.segment_bounds(ctx.ranges, ctx.storyboard.chapters, 2.0, 6, workers=2)
    assert bounds[0][0] == 0
    assert bounds[-1][1] == 12
    starts = [b[0] for b in bounds]
    assert 6 in starts, f"no segment starts at the chapter cut: {bounds}"


def test_segments_cover_every_frame_exactly_once():
    ctx = _ctx()
    bounds = video.segment_bounds(ctx.ranges, ctx.storyboard.chapters, 2.0, 6, workers=3)
    covered = []
    for start, end in bounds:
        covered.extend(range(start, end))
    assert covered == list(range(12))


def test_chapter_at_returns_progress():
    ctx = _ctx()
    index, chapter, progress = video.chapter_at(1.5, ctx.storyboard.chapters, ctx.ranges)
    assert index == 1 and chapter.id == "02-horizon"
    assert 0.4 < progress < 0.6


@pytest.mark.slow
def test_renders_a_playable_video(tmp_path):
    out = tmp_path / "out.mp4"
    video.render_video(_ctx(), duration=2.0, out_path=out, workers=2)
    assert out.exists() and out.stat().st_size > 2000
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,nb_frames",
         "-of", "default=nw=1", str(out)],
        capture_output=True, text=True, check=True,
    ).stdout
    assert "width=540" in probe and "height=960" in probe
```

Add to `pytest.ini`:

```ini
markers =
    slow: end-to-end renders that shell out to ffmpeg
```

- [ ] **Step 2: Run test to verify it fails**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_video.py -v`
Expected: FAIL with `ImportError: cannot import name 'video'`

- [ ] **Step 3: Write the implementation**

Create `scripts/ascii_studio/video.py`:

```python
"""Full render loop with a chapter-aligned worker pool.

Segment boundaries are snapped to chapter cuts so per-segment glyph hysteresis state
never has to carry across a cut -- a mid-chapter split would show one flickering frame
where the worker's history restarts.
"""

from __future__ import annotations

import math
import subprocess
import tempfile
from dataclasses import dataclass
from multiprocessing import Pool
from pathlib import Path
from typing import Sequence

import numpy as np

from .render import persona as persona_mod
from .render import seal as seal_mod
from .render import typography
from .render.frames import Renderer
from .render.tokens import load_look
from .scene.legacy import LegacyChapter
from .speech.captions import active_caption
from .storyboard.schema import Chapter, Storyboard


@dataclass
class RenderContext:
    storyboard: Storyboard
    captions: list
    ranges: dict
    logo_mask: np.ndarray | None
    url: str | None
    intro_seal_seconds: float
    persona_art: np.ndarray | None = None   # loaded once, composited per chapter
    look_name: str = "plata"
    width: int = 1080
    height: int = 1920
    fps: int = 30
    crf: int = 20


def chapter_at(t: float, chapters: Sequence[Chapter], ranges: dict) -> tuple[int, Chapter, float]:
    for index, chapter in enumerate(chapters):
        start, end = ranges[chapter.id]
        if start <= t <= end or index == len(chapters) - 1:
            return index, chapter, float(np.clip((t - start) / max(0.01, end - start), 0.0, 1.0))
    return 0, chapters[0], 0.0


def _as_legacy(chapter: Chapter) -> LegacyChapter:
    return LegacyChapter(
        motif=chapter.motif, keyword=chapter.keyword, anchors=list(chapter.anchors),
        seed=chapter.seed, density=chapter.density, motion=chapter.motion,
    )


def segment_bounds(ranges: dict, chapters: Sequence[Chapter], duration: float,
                   fps: int, workers: int) -> list[tuple[int, int]]:
    """Frame ranges for each worker, snapped to chapter cuts."""
    total = max(1, math.ceil(duration * fps))
    cuts = sorted({0, total} | {
        min(total, int(round(ranges[c.id][0] * fps))) for c in chapters
    })
    if workers <= 1 or len(cuts) <= 2:
        return [(0, total)]

    # Merge adjacent chapter spans until we have at most `workers` segments.
    spans = [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1) if cuts[i + 1] > cuts[i]]
    while len(spans) > workers:
        shortest = min(range(len(spans) - 1), key=lambda i: spans[i][1] - spans[i][0])
        merged = (spans[shortest][0], spans[shortest + 1][1])
        spans[shortest:shortest + 2] = [merged]
    return spans


def _encode(frames_iter, width: int, height: int, fps: int, crf: int, out_path: Path) -> Path:
    cmd = [
        "ffmpeg", "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}", "-r", str(fps), "-i", "-", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
        "-pix_fmt", "yuv420p", str(out_path),
    ]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    assert process.stdin is not None
    for frame in frames_iter:
        process.stdin.write(frame.tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed writing {out_path}")
    return out_path


def render_segment(ctx: RenderContext, start_frame: int, end_frame: int, out_path: Path) -> Path:
    renderer = Renderer(load_look(ctx.look_name), ctx.width, ctx.height)
    chapters = ctx.storyboard.chapters
    previous_index = -1

    def frames():
        nonlocal previous_index
        for frame_index in range(start_frame, end_frame):
            t = frame_index / ctx.fps
            index, chapter, progress = chapter_at(t, chapters, ctx.ranges)
            if index != previous_index:
                renderer.reset()
                previous_index = index
            extra = None
            if ctx.intro_seal_seconds > 0 and t < ctx.intro_seal_seconds:
                extra = seal_mod.seal_luminance(
                    ctx.logo_mask, renderer.grid, t, ctx.intro_seal_seconds
                )
            # The persona appears only on chapters that opt in, so it stays meaningful.
            # A figure present in every chapter stops being noticed.
            if ctx.persona_art is not None and getattr(chapter, "persona", False):
                figure = persona_mod.persona_luminance(ctx.persona_art, renderer.grid)
                extra = figure if extra is None else np.clip(extra + figure, 0.0, 1.0)
            frame = renderer.frame(_as_legacy(chapter), t, progress, frame_index, extra=extra)
            yield typography.overlay(
                frame, renderer.grid, renderer.look,
                caption=active_caption(ctx.captions, t), t=t,
                title=ctx.storyboard.title, chapter_label=chapter.label,
                chapter_index=index, chapter_count=len(chapters), progress=progress,
                keyword=chapter.keyword, url=ctx.url,
            )

    return _encode(frames(), ctx.width, ctx.height, ctx.fps, ctx.crf, out_path)


def _segment_worker(payload):
    ctx, start, end, path = payload
    return str(render_segment(ctx, start, end, Path(path)))


def render_video(ctx: RenderContext, duration: float, out_path: Path,
                 workers: int | None = None) -> Path:
    workers = workers or min(8, max(1, len(ctx.storyboard.chapters)))
    bounds = segment_bounds(ctx.ranges, ctx.storyboard.chapters, duration, ctx.fps, workers)

    if len(bounds) == 1:
        return render_segment(ctx, bounds[0][0], bounds[0][1], out_path)

    with tempfile.TemporaryDirectory() as tmp:
        jobs = [
            (ctx, start, end, str(Path(tmp) / f"seg{i:03d}.mp4"))
            for i, (start, end) in enumerate(bounds)
        ]
        with Pool(processes=min(workers, len(jobs))) as pool:
            parts = pool.map(_segment_worker, jobs)

        listing = Path(tmp) / "segments.txt"
        listing.write_text("".join(f"file '{p}'\n" for p in parts), encoding="utf-8")
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
             "-c", "copy", str(out_path)],
            check=True, stderr=subprocess.DEVNULL,
        )
    return out_path
```

- [ ] **Step 4: Extend `Renderer.frame` to accept the seal**

In `scripts/ascii_studio/render/frames.py`, change the signature and the first line of the body:

```python
    def frame(
        self,
        chapter: LegacyChapter,
        t: float,
        progress: float,
        frame_index: int,
        extra: np.ndarray | None = None,
    ) -> np.ndarray:
        lum = compose(chapter, self.grid, t, progress)
        if extra is not None:
            lum = np.clip(lum + extra, 0.0, 1.0)
```

- [ ] **Step 5: Run tests**

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_video.py -v -m "not slow"`
Expected: PASS, 3 passed

Run: `/opt/anaconda3/bin/python3 -m pytest tests/test_video.py -v`
Expected: PASS, 4 passed (the slow one shells out to ffmpeg)

- [ ] **Step 6: Commit**

```bash
git add scripts/ascii_studio/video.py scripts/ascii_studio/render/frames.py tests/test_video.py pytest.ini
git commit -m "Add v2 video render with chapter-aligned worker pool"
```

---

## Task 8: End-to-end render through the v2 path

The gate. v1 is not deleted until this passes.

**Files:**
- Modify: `ascii_studio/cli.py` (add `render` subcommand wiring the ported pipeline to v2 video)

**Interfaces:**
- Produces: `cli.main(["render", "--input", ..., "--out", ...])` producing master, mix, stems, SRT/VTT, word timings, cover, preview

- [ ] **Step 1: Wire the `render` subcommand**

Port the body of v1's `render()` (baseline line 1478) into `ascii_studio/cli.py` as `run_render(args)`. Keep every step identical **except** the video call: replace v1's `render_video(canvas, storyboard, ...)` with

```python
    ctx = video.RenderContext(
        storyboard=storyboard, captions=captions, ranges=ranges,
        logo_mask=seal.load_logo_mask(Path(args.logo) if args.logo else None),
        url=args.platform_url, intro_seal_seconds=args.intro_seal_seconds,
        look_name=args.look, width=args.width, height=args.height,
        fps=args.fps, crf=args.crf,
    )
    video.render_video(ctx, duration, video_only_path, workers=args.workers)
```

Add these arguments to the `render` subparser: `--look` (default `plata`), `--workers` (type int, default None). Keep every v1 flag name unchanged.

- [ ] **Step 2: Run a real short render**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
rm -rf /tmp/v2-e2e && mkdir -p /tmp/v2-e2e
/opt/anaconda3/bin/python3 -c "
import sys; sys.path.insert(0,'scripts')
from ascii_studio import cli
cli.main(['render','--input','tests/fixtures/sample-article.md','--out','/tmp/v2-e2e',
          '--tts','none','--render-seconds','6','--width','540','--height','960',
          '--fps','12','--skip-upload'])
"
ls -la /tmp/v2-e2e
```

Expected: a master mp4, subtitle files, word timings, cover, preview.

- [ ] **Step 3: Verify the output**

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name,nb_frames \
  -show_entries format=duration -of default=nw=1 /tmp/v2-e2e/*-master.mp4
ffmpeg -v error -y -ss 3 -i /tmp/v2-e2e/*-master.mp4 -frames:v 1 /tmp/v2-e2e/frame.png
open /tmp/v2-e2e/frame.png
```

Expected: 540×960 h264; the frame is entirely characters, the field reaches all four
edges, the caption is legible and inside its zone, nothing is clipped, palette is silver.

- [ ] **Step 4: Full-resolution timing check**

```bash
time /opt/anaconda3/bin/python3 -c "
import sys; sys.path.insert(0,'scripts')
from ascii_studio import cli
cli.main(['render','--input','tests/fixtures/sample-article.md','--out','/tmp/v2-timing',
          '--tts','none','--render-seconds','30','--skip-upload'])
"
```

Expected: 30 s of 1080×1920 at 30 fps (900 frames) in **well under 2 minutes**. v1's rate
was 0.9 fps, which would have taken ~17 minutes. Record the number — it is the speed claim.

- [ ] **Step 5: Commit**

```bash
git add scripts/ascii_studio/cli.py
git commit -m "Wire the v2 render subcommand end to end"
```

---

## Task 9: Delete v1, install the shim, update the docs

Only after Task 8 passes.

**Files:**
- Rewrite: `scripts/render_cinematic_ascii_video.py` (shim)
- Modify: `SKILL.md`, `references/storyboard-schema.md`
- Modify: `software/app.py` (look picker), `software/static/index.html`

- [ ] **Step 1: Replace the renderer with a shim**

Replace the entire contents of `scripts/render_cinematic_ascii_video.py` with:

```python
#!/usr/bin/env python3
"""Compatibility shim. The renderer now lives in the ascii_studio package.

Kept so recorded Studio commands and documented invocations keep working unchanged.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ascii_studio.cli import main as _main


def main() -> None:
    argv = sys.argv[1:]
    # v1 was invoked with bare flags; the package CLI uses subcommands.
    if argv and not argv[0].startswith("-"):
        raise SystemExit(_main(argv))
    if "--brief-only" in argv:
        raise SystemExit(_main(["brief", *[a for a in argv if a != "--brief-only"]]))
    raise SystemExit(_main(["render", *argv]))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Confirm `--persona hombre-gris` renders the new asset**

The flag is NOT retired. Verify it end-to-end:

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
/opt/anaconda3/bin/python3 scripts/render_cinematic_ascii_video.py \
  --input tests/fixtures/sample-article.md --out /tmp/v2-persona \
  --persona hombre-gris --tts none --render-seconds 4 \
  --width 540 --height 960 --fps 6 --skip-upload
```

Expected: renders, and the figure is visible in chapters whose storyboard entry sets
`"persona": true`. Extract a frame and report its mean brightness inside the stage zone with
and without the flag — they must differ.

- [ ] **Step 3: Run the whole suite plus the characterization tests**

Run: `/opt/anaconda3/bin/python3 -m pytest -v`
Expected: all pass, including `tests/test_characterization.py` driving the shim.

- [ ] **Step 4: Verify a recorded Studio command still works**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
/opt/anaconda3/bin/python3 scripts/render_cinematic_ascii_video.py \
  --input tests/fixtures/sample-article.md --out /tmp/v2-shim \
  --platform-url www.elinstantedelhombregris.com \
  --tts none --render-seconds 3 --width 540 --height 960 --fps 6 --skip-upload
ls /tmp/v2-shim
```

Expected: renders successfully through the shim.

- [ ] **Step 5: Update `SKILL.md`**

Apply these edits, which correct statements that are now false:

1. Replace the "Current house style" bullets about gold/teal karaoke with the plata palette:
   silver ramp on `#050607`, accent `#7D5BDE` reserved for the active karaoke word, the
   emphasised diagram element and the progress bar.
2. Replace "Do not include the Hombre Gris torso/silhouette by default" with a note that
   `--persona hombre-gris` is retired in v2 and returns as the `portrait` archetype.
3. Under "Art Direction", delete "No talking torso/silhouette in the default house style" and
   add: "Every visible element is a character. Captions and UI are the only crisp vector text."
4. Add a `Storyboard stills` section documenting
   `render_cinematic_ascii_video.py stills --storyboard PATH --out DIR --contact-sheet`
   as the way to approve art direction before a full render.
5. Add `--look plata|terminal|blueprint` and `--workers N` to the documented flags.

- [ ] **Step 6: Correct `references/storyboard-schema.md`**

The current file tells the operator that editing `composition` directs the visuals. In v1 it
only printed a corner label, and in Phase 1 it still does nothing. Add this note directly under
the `composition` bullet:

```markdown
> **Phase 1 status:** `composition` and `metaphor` are recorded in the storyboard and shown in
> the art-direction report, but do not yet change geometry. They become live art-direction
> controls in Phase 2, when motifs are replaced by archetypes. Until then, use `seed`,
> `density` and `motion`, which do change the output.
```

- [ ] **Step 7: Add the look picker to the Studio**

In `software/app.py`, in the command construction inside `create_job`, append the look flag:

```python
        if fields.get("look"):
            command.extend(["--look", fields["look"]])
```

In `software/static/index.html`, add next to the existing render controls:

```html
<label>Look
  <select name="look">
    <option value="plata" selected>Plata</option>
    <option value="terminal">Terminal</option>
    <option value="blueprint">Blueprint</option>
  </select>
</label>
```

- [ ] **Step 8: Confirm nothing dead remains**

```bash
cd /Users/juanb/.codex/skills/create-ascii-blog-videos
grep -nE "def (draw_ascii|draw_motif|field_for|apply_post|draw_caption|draw_ui|frame_at)\b" \
  scripts/render_cinematic_ascii_video.py || echo "OK: v1 visual core removed"
wc -l scripts/render_cinematic_ascii_video.py
```

Expected: `OK: v1 visual core removed`, and the shim is under 40 lines (from 1,663).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Replace v1 with v2: shim, retired persona flag, corrected docs, Studio look picker"
```

---

## Self-Review

**Requirement coverage:**

| Requirement | Task |
|---|---|
| One system only | 9 (v1 deleted, shim installed) |
| v1's sync fixes preserved | 1 (pinned), 3 (moved verbatim), re-verified in 8 and 9 |
| JetBrains Mono | 1a Task 3 (token updated) |
| Complete video renderable at all times | 2–7 keep v1 running; 8 gates the swap |
| Captions crisp, zone-clamped | 5 |
| Logo seal as characters | 6 |
| Worker pool (deferred from 1a) | 7 — now lands, chapter-aligned |
| Studio commands keep working | 9 Step 4 |
| Docs match behaviour | 9 Steps 5–6 |

**Known regression, deliberate and announced:** `--persona hombre-gris` is retired and fails
with an explanatory message (Task 9 Step 2). It returns as the `portrait` archetype in Phase 2.
**Confirm the user accepts this before executing Task 9.**

**Still deferred to Phase 2, unchanged from the spec:** scene archetypes, 3D rasteriser, camera,
reveal schedule and anchor-to-word binding, recursive typography, glyph-level transitions,
cold open, hook cut, multi-format outputs, golden-frame harness. `scene/legacy.py` is the
temporary bridge and is deleted when archetypes land.

**Type consistency:** `RenderContext` field names are identical in Tasks 7 and 8.
`Renderer.frame(chapter, t, progress, frame_index, extra=None)` matches its call in
`render_segment`. `typography.overlay(frame, grid, look, **kwargs)` keyword names match
between Task 5's tests and Task 7's caller. `LegacyChapter` construction in `_as_legacy` uses
the field names defined in 1a Task 9.

**Placeholder scan:** no TBD/TODO. Move tasks specify exact function names and source line
numbers rather than restating unchanged code, which is correct for a verbatim port — restating
it would invite edits.
