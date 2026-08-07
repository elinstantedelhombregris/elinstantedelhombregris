# Cinematic ASCII Studio v2 — Design

**Date:** 2026-08-05
**Status:** Approved for planning
**Supersedes:** the visual core of `scripts/render_cinematic_ascii_video.py` (baseline commit `6a6df2c`)

---

## 1. Problem

The tool produces technically correct videos that do not look good, and takes 2h19m to
produce one. Evidence gathered from the code and from rendered output
(`batch-all-remaining-wordboundary-20260614/la-amabilidad-como-ingeniera-social`):

1. **The ASCII depicts nothing.** `field_for()` is a closed-form sine/cosine interference
   field sampled on a 64×61 grid. It renders as banded static. The actual chapter graphic —
   rings, cards, paths — is drawn as smooth anti-aliased vector lines on a *separate* RGBA
   layer composited on top. Every frame stacks two unrelated visual languages: ASCII
   wallpaper plus wireframe overlay.

2. **The documented art-direction levers do nothing.** `references/storyboard-schema.md`
   instructs the operator to edit `composition` to direct the visuals. `draw_motif()` never
   reads it; line 953 prints it as a 10px corner label and that is the entire effect.
   `metaphor` is never rendered at all. Ten motifs in one `if/elif` chain is the complete
   visual vocabulary.

3. **Resolution is capped at 64 columns** by the rendering method. `draw_ascii()` runs a
   Python double loop issuing one `PIL.ImageDraw.text` call per cell: ~3,900 calls per frame,
   ~29 million for a 4-minute video. Cells are 17×31px carrying a 15px font, producing the
   visible gaps and the ratty texture.

4. **Nothing moves.** Frames at 0:03 and 0:14 within one chapter are near-identical; so are
   0:42 and 0:56. `t` only shifts a phase inside the sine field and jitters a few rings. Each
   chapter is effectively a static image for its entire run.

5. **Hardcoded coordinates collide.** All positions are magic numbers in a 720×1280 space.
   The chapter keyword at y=628/750 sits behind the caption plate at y=760; "AMABILIDAD" and
   "CONFIANZA" are visibly clipped in shipped output.

6. **Anchors are word-frequency counts, not concepts.** `extract_keywords()` is a `Counter`
   over words ≥4 chars minus a stoplist, yielding on-screen labels like `TODO`, `ANTES`,
   `DETALLE`, `MULTIPLICA`. They label nothing and they advertise that a script wrote them.

7. **Colour is naive and undifferentiated.** All ten palettes are the same gold+teal+cream,
   so chapter changes do not read. Blending is `int(primary[i]*mix + secondary[i]*(1-mix))` —
   RGB interpolation, which desaturates through the midpoint.

8. **Audio is a fixed drone.** `build_music()` emits four sine pitches held for the entire
   duration plus a ping every 3.1s, regardless of content or length. `mix_audio()` sums voice,
   music and sfx through a single global `tanh`, so the voice distorts whenever the bed peaks.

9. **Speed.** Studio job `20260601-172005-035f`: `started_at` 1780345205 → `finished_at`
   1780353536 = **8,331 seconds (2h19m)** for one video. The batch of 17 is days of machine time.

10. **Output hygiene.** Masters run ~13 Mbps (396 MB for 4 minutes). The footer signature at
    y=1204/1280 (0.94) sits inside the region TikTok and Instagram overlay with their own UI.

---

## 2. Goals

- The chapter visual is a **diagram that explains the chapter's idea**, rendered entirely in
  characters. Editorial graphics, not decoration.
- One visual language per frame. No vector overlay floating above an unrelated ASCII field.
- Chapters visibly progress: elements reveal in time with the narration that names them.
- A silver/plata house identity consistent across a feed, with one signature accent per video.
- No element can be drawn where it collides with another.
- Full-length render in single-digit minutes, not hours.
- Art direction reviewable **before** committing to a full render.
- Every documented control genuinely changes output.

## 3. Non-goals

- No change to the narration→TTS→word-timing→caption-sync chain beyond relocating it into
  modules. That code encodes real, expensively-found bugs (Edge `WordBoundary` handling, the
  `#uno` punctuation-token discard, `17:21` colon splitting, Spanish thousands parsing,
  number-to-words). It is ported as-is with its tests, not rewritten.
- No hard runtime dependency on any network service or LLM. Storyboards are plain JSON and
  *may* be authored or enriched by an LLM, but the renderer stays deterministic and offline.
- No change to the existing CLI contract for flags that survive; v1 flags either keep working
  or fail with an explicit migration message.

## 4. Design principles

1. **The image is made of characters.** Anything visible resolves to a glyph in a cell.
2. **The image teaches.** Each archetype is a diagram form that carries information.
3. **Timing is authority.** The final voice WAV is already the timing authority for captions.
   It becomes the timing authority for the *visuals* too.
4. **Look is data.** Palette, glyph set, grade, grain, fonts and spacing live in token files,
   never as constants in drawing code.
5. **Every control is real.** A field in the storyboard either changes the output or is deleted.

---

## 5. Architecture

The 1,663-line monolith splits into a package. This is a prerequisite for the scope, not
cosmetic: the current file mixes text analysis, speech, alignment, audio synthesis, drawing
and encoding in one namespace.

```
scripts/ascii_studio/
  __init__.py
  cli.py                    # argparse, orchestration, v1-flag migration
  source.py                 # frontmatter, markdown cleaning, reading

  editorial/
    segment.py              # sentence/clause splitting, chapter segmentation
    concepts.py             # noun-phrase + TF-IDF concept extraction
    relations.py            # causal/contrastive triple extraction
    rhetoric.py             # per-chapter rhetorical function classification
    script.py               # narration normalization, number-to-words  [PORTED]
    data/es_freq.txt        # Spanish background frequency table (top ~5k)

  storyboard/
    schema.py               # versioned dataclasses + JSON (v2)
    build.py                # automatic storyboard construction
    migrate.py              # v1 storyboard -> v2

  speech/
    tts.py                  # edge / say / none                        [PORTED]
    align.py                # word timings, forced alignment           [PORTED]
    captions.py             # caption building, wrapping, sync QA      [PORTED + clause breaks]

  audio/
    score.py                # chapter-arc music
    sfx.py                  # semantic sound design
    mix.py                  # gain staging, sidechain duck, loudnorm, stems

  render/
    tokens.py               # design tokens, look presets
    color.py                # OKLab conversion + blending
    canvas.py               # grid geometry, safe areas, platform masks
    glyphs.py               # glyph atlas, signatures, best-match, blit
    asciify.py              # buffers -> glyph grid (dither, hysteresis, half-block)
    post.py                 # grade, halation, grain, scanlines, LUT
    typography.py           # title, captions, recursive giant type
    frames.py               # frame assembly, worker pool
    scene/
      buffer.py             # luminance / gradient / element-id buffers
      draw2d.py             # 2D primitives into buffers
      draw3d.py             # software rasterizer: lines, meshes, extruded type
      camera.py             # camera moves + easing
      reveal.py             # reveal schedule, anchor-to-word binding
      archetypes/           # one module per diagram archetype

  encode.py                 # ffmpeg, derivatives, formats, cover, contact sheet
  verify.py                 # golden frames, safe-area assertions, loudness check
```

`scripts/render_cinematic_ascii_video.py` becomes a thin shim delegating to
`ascii_studio.cli` so existing Studio job commands and documented invocations keep working.

---

## 6. Rendering pipeline

Four stages, replacing `draw_ascii` + `draw_motif` + `apply_post`.

### 6.1 Stage 1 — scene → buffers

Each chapter's archetype renders into float buffers at **2× the cell grid resolution**
(supersampled, then box-downsampled — standard antialiasing):

| Buffer | Shape | Meaning |
|---|---|---|
| `L` | (H2, W2) float32 | luminance, 0..1 |
| `E` | (H2, W2) int16 | element id, for colour and accent routing; -1 = empty |
| `A` | (H2, W2) float32 | per-element reveal/emphasis alpha |

Gradients are derived from `L` by Sobel when needed; primitives that know their own direction
(lines, edges) may write it directly to avoid a derivative pass.

### 6.2 Stage 2 — buffers → glyph grid

This is the quality-critical stage.

**Grid.** Target cell size 9×15px at 1080×1920 → **120 cols × 128 rows** (15,360 cells),
about 4× the current cell count, with glyphs large enough to stay legible after platform
recompression. Cell size is a token, not a constant.

Note the binding constraint has changed. Today 64 columns is a *cost* ceiling imposed by the
per-cell `draw.text` loop. After the vectorised blit, column count is nearly free — 200+ is
affordable — and the ceiling becomes **legibility**: below roughly 8px cells, glyph structure
does not survive Instagram and TikTok recompression, and the field degrades back into the
noise this design exists to eliminate. 120 columns is chosen as the highest count that stays
crisp after platform encoding, and is tunable per look.

**Best-match symbol selection.** Rather than mapping luminance to a ramp index, each cell's
actual pixel block is compared against the rendered bitmap of every candidate glyph, and the
minimum-error glyph wins. This is the technique that separates good text-mode rendering from
an "ASCII filter": the glyph is discovered, not guessed, so edges land on `─ ╱ │ ╲`, junctions
on `┼ ┬ ┤`, and partial coverage on the block elements, without a single hand-written rule.

Implementation is one matmul. Minimising `‖c − g‖²` over glyphs `g` is equivalent to
maximising `2·(c·g) − ‖g‖²` since `‖c‖²` is constant per cell:

```python
scores = cells @ atlas_sig.T * 2.0 - glyph_norms      # (n_cells, n_glyphs)
grid   = scores.argmax(axis=1)
```

Matching runs on a reduced **signature** resolution (4×8 = 32 values per glyph) rather than
the full 9×15 cell, which is ample for discrimination and keeps the matmul at roughly
15,360 × 32 @ 32 × 64 ≈ 31M MACs per frame — negligible under BLAS. Blitting still uses the
full-resolution atlas.

**Ordered dither.** A Bayer 8×8 (optionally blue-noise) offset is added to the cell block
before matching. This removes the tonal banding visible across the whole field today.

**Half-block sub-cell rendering.** Each cell carries an independent foreground *and*
background colour. With `▀▄▌▐` in the glyph set this doubles effective tonal resolution for
free and produces the authentic terminal look. The blit becomes
`out = bg + (fg − bg) * atlas[glyph]`.

**Temporal coherence.** The previous frame's grid is retained; the previous glyph's score
receives a hysteresis bonus `ε` (a token) before `argmax`. Without this, cells sitting near a
decision boundary flicker between two near-equal glyphs every frame, which reads as noise.

**Glyph sets.** Default `cinematic`: box-drawing + block elements + ASCII. Alternative
`ascii7` (strict 7-bit) and `blocks` (pure block/half-block) selectable per look. Candidate
glyphs are filtered to those the chosen font actually provides, at load time.

### 6.3 Stage 3 — glyph grid → pixels

Fully vectorised, no Python loop over cells:

```python
tiles = atlas[grid]                                     # (rows, cols, ch, cw)
layer = tiles.transpose(0, 2, 1, 3).reshape(rows * ch, cols * cw)
```

Colour is resolved per cell from the element-id buffer through the palette, then upsampled
the same way. **All colour interpolation happens in OKLab**, not RGB — the current naive RGB
lerp is why blends pass through muddy grey, and for a silver-led palette whose entire
expression is tonal nuance, perceptual uniformity is not optional.

This single change is what makes 120 columns *cheaper* than 64 is today.

### 6.4 Stage 4 — post

Filmic tone curve; **halation** on bright glyphs (threshold → blur → screen, not the current
flat Gaussian add); controlled grain; optional subtle scanlines; vignette; optional `.cube`
LUT for final grade. All parameters are tokens.

---

## 7. Scene system

### 7.1 Archetypes

The ten motifs are replaced by sixteen diagram forms, selected by the chapter's **rhetorical
function** (definition / contrast / example / evidence / consequence / question / call to
action) combined with its extracted relations — not by keyword-bag matching.

| Group | Archetypes |
|---|---|
| Structural | `network`, `hierarchy`, `flow`, `feedback-loop`, `causal-chain` |
| Quantitative | `comparison`, `timeline`, `distribution`, `growth` |
| Spatial | `map` (Argentina), `contrast` (split screen), `layers`, `threshold` |
| Cyclical | `orbit-cycle` |
| Atmospheric | `field`, `portrait` |

`feedback-loop` renders reinforcing and balancing loops with polarity marks — a direct fit for
the Ackoff/systems-thinking material in this corpus, and the kind of graphic that genuinely
teaches.

Each archetype is a builder:

```python
def build(ctx: SceneContext) -> Scene:
    """ctx carries anchors, relations, seed, density, motion, duration, bounds, tokens."""
```

returning primitives, a camera move, and a reveal schedule. `composition` becomes the actual
parameter set for the archetype — the placebo field is retired.

### 7.2 3D pass

`draw3d.py` is a small numpy software rasteriser: model/view/projection matrices, line and
mesh primitives, backface culling, painter's-algorithm depth sorting, and depth fog. Wireframe
work does not need a true z-buffer, and painter + fog is both simpler and closer to the
intended look. Extruded type is obtained by taking glyph outlines from the font via
`cv2.findContours` on a rendered mask and extruding along z.

Shaded depth is what makes text-mode work read as cinematic rather than flat. It upgrades
`layers`, `orbit-cycle`, `map`, `threshold` and all extruded typography at once.

### 7.3 Camera and easing

Camera vocabulary: `push-in`, `pull-out`, `orbit`, `drift`, `rack`, `hold`. Every reveal and
camera move runs through named Penner easing curves, with reveals staggered by distance from
the scene's focal point. Linear reveals are the single clearest tell of automated motion.

### 7.4 Reveal schedule and anchor-to-word binding

The highest-value behaviour in this design, and nearly free because the data already exists.

Word-level timings are already computed for karaoke. For every scene element carrying a
`label`, the schedule binds that element's reveal to the word timing whose normalized form
matches the label:

- element reveals (eased, staggered) at the start of the word that names it;
- an emphasis envelope peaks on that word and decays;
- the signature accent colour is routed to whichever element is currently emphasised.

The node labelled CONFIANZA illuminates on the spoken word *confianza*. The loop closes on the
word that closes it. The diagram builds while the voice explains it.

This simultaneously fixes "nothing moves", makes the output educative rather than decorative,
and is the hardest property for another tool to imitate.

Elements whose labels never appear in the narration fall back to an even stagger across the
chapter, so the schedule degrades gracefully.

---

## 8. Typography

**Giant ASCII type.** The chapter keyword can render as a full-stage banner rather than a
34px label.

**Recursive type.** The signature move: huge letterforms whose *fill* is the article's own
sentences, so the picture is literally made of the essay. Implementation: render the word at
display size to a mask; inside the mask, the glyph grid is filled with successive characters
of the source text rather than with ramp glyphs; outside, the field falls to near-black. On
brand for a text-driven tool in a way no generic effect can be.

**Captions.** Existing sync guarantees are preserved exactly. Changes are presentational:
break at clause boundaries rather than at word 15; plate dims the field behind it rather than
covering it, so the picture survives; plate opacity adapts to measured background luminance to
hold a minimum contrast ratio; active word carries the signature accent.

**Fonts.** JetBrains Mono for captions and UI (already the platform's brand mono). For the
ASCII field, an optional true bitmap font (Px437/IBM VGA, Terminus) at exact integer size,
giving razor-sharp glyphs with no antialiasing mush — which composites particularly well with
best-match selection. Font choice is a token; Menlo remains the always-available fallback.

---

## 9. Layout and safe areas

Named zones on a normalized 9:16 grid replace every magic number. Scene builders receive
`stage` bounds and cannot draw outside them, which makes the clipped-keyword class of bug
structurally impossible.

| Zone | y range (normalized) |
|---|---|
| `title` | 0.020 – 0.100 |
| `stage` | 0.105 – 0.600 |
| `caption` | 0.620 – 0.800 |
| `footer` | 0.840 – 0.880 |

Platform masks mark the regions Instagram and TikTok cover with their own UI (bottom ~15%,
right ~12%); nothing load-bearing may be placed inside them. This moves the footer signature
out of the zone where it is currently obscured.

A `verify.py` assertion fails the render if any drawn element escapes its declared zone.

---

## 10. Design tokens and look presets

All look-affecting values live in `render/tokens.py` plus JSON presets under `looks/`:

- palette (OKLab anchors), signature accent, ramp
- glyph set, font, cell size, hysteresis ε
- dither matrix, supersample factor
- grade curve, halation, grain, scanlines, LUT path
- zone geometry, spacing scale

Ships with `plata` (default), `terminal`, `blueprint`. Restyling never requires touching
drawing code.

**Palette.** Silver/plata as the constant identity: cool near-white → mid grey → deep charcoal
on `#050607`. Chapters differentiate by **temperature and density**, not hue. One signature
accent per video — iris-violet `#7D5BDE` by default, matching the platform design system, or
derived from the subject — reserved for exactly three uses: the active karaoke word, the
currently-emphasised diagram element, and the progress bar.

`temperature` is a per-chapter scalar in −1..+1 shifting the silver ramp cool (blue-leaning)
to warm (amber-leaning) in OKLab, holding lightness constant. It is the primary means of
distinguishing adjacent chapters without introducing a second hue.

---

## 11. Editorial intelligence

**Concepts.** Replaces the raw `Counter`. Candidate noun phrases of 1–3 content words scored
by TF-IDF against a shipped Spanish background frequency table, with position bonuses (title,
first sentence of chapter) and a multi-word preference. Yields `cultura ciudadana`, not `TODO`.

**Relations.** Regex patterns over Spanish causal, contrastive, conditional and consecutive
connectives produce `(A, relation, B)` triples that feed `flow`, `causal-chain` and
`feedback-loop` directly.

**Rhetoric.** Per-chapter classification from marker cues: `por ejemplo` → example,
`sin embargo` → contrast, `por lo tanto` → consequence, interrogatives → question,
imperatives → call to action, copular definitions → definition. Drives archetype selection.

**Segmentation.** Chapters split on lexical-cohesion troughs (TextTiling-lite) reinforced by
discourse markers, replacing equal partition of the sentence list.

**Captions.** Break candidates scored at clause boundaries with line-length balancing,
replacing the current break at word 15. All existing sync QA gates remain in force.

---

## 12. Audio

- **Score follows the chapter arc**: a root per chapter with voice-leading between them, pad
  density tracking `motion`, a low pulse, and a resolution cadence on the closing chapter.
  Replaces four sine pitches held for the whole duration.
- **Mix**: voice normalised to target, bed **sidechain-ducked** by the voice envelope (up to
  −9 dB, ~20 ms attack / ~250 ms release). The global `tanh` on the voice path is removed.
- **Loudness**: two-pass `loudnorm` to −14 LUFS / −1.5 dBTP, the platform standard.
- Music and sound-design stems are still written separately.

---

## 13. Outputs

| Artifact | Notes |
|---|---|
| Master | 1080×1920, sane bitrate ladder (replacing ~13 Mbps) |
| Instagram derivative | H.264 / AAC / yuv420p / faststart (unchanged contract) |
| **Hook cut** | 45–60 s, cold open + highest-scoring chapters |
| **1:1 and 16:9** | Re-laid-out, not cropped — the layout is procedural, so this is free |
| Designed cover | Composed artwork, not frame 0 |
| **Contact sheet** | Whole video judgeable from one image |
| **Storyboard stills** | One frame per chapter, ~5 s total |
| SRT / VTT / word-timing JSON | Unchanged |
| Music + sound-design stems | Unchanged |

**Cold open.** The first 1.5 s decide a social video's reach; the current opening is a seal
plus a title card. v2 opens on a designed hook — the thesis as a hard typographic hit, or the
question the piece answers — before the seal.

**Seamless loop.** The final frame resolves to match the first, so reels replay invisibly.

---

## 14. Studio and workflow

- **Storyboard stills before render.** One still per chapter in about five seconds, so art
  direction is approved *before* committing. Given 2h19m renders, this is plausibly the
  single highest-value item in the design.
- **Reroll.** A seed control that produces genuinely different but equally valid takes.
- **Look picker** exposing the presets.
- Job records gain phase-level progress rather than a single opaque `running`.

---

## 15. Performance

| Change | Effect |
|---|---|
| Vectorised atlas blit | Removes ~29M `PIL.draw.text` calls per 4-min video |
| Signature-resolution matching | Best-match at ~31M MACs/frame under BLAS |
| Worker pool over frame ranges | Segment-encode then concat; scales to core count |
| Static-element caching per chapter | Camera-invariant geometry rasterised once |
| `--preview` mode | 360×640, 12 fps, post disabled |

**Target: a 4-minute render in under 10 minutes**, from 2h19m today. The two-stage pipeline is
what makes higher resolution and higher speed the same change rather than opposing ones.

---

## 16. Verification

- **Golden frames.** Fixed seeds render a fixed frame set; SSIM against committed references
  fails the build on regression.
- **Safe-area assertions.** Any element drawn outside its declared zone fails the render.
- **Ported sync gates.** All existing caption/word-timing QA gates remain, with their tests.
- **Loudness check** on the final mix.
- **Contact sheet** on every render for human review.

---

## 17. Storyboard schema v2

```json
{
  "version": 2,
  "title": "...",
  "slug": "...",
  "thesis": "...",
  "look": "plata",
  "accent": "#7D5BDE",
  "chapters": [
    {
      "id": "01-flow",
      "label": "01 / FLOW",
      "archetype": "feedback-loop",
      "rhetoric": "consequence",
      "keyword": "CONFIANZA",
      "texts": ["..."],
      "anchors": [{"label": "CONFIANZA", "role": "node"}],
      "relations": [{"from": "CONFIANZA", "to": "COOPERACIÓN", "kind": "reinforces"}],
      "camera": "push-in",
      "seed": 1634938309,
      "density": 0.61,
      "motion": 0.47,
      "temperature": -0.2
    }
  ]
}
```

`storyboard/migrate.py` converts v1 files, mapping old motifs onto archetypes so the existing
corpus of storyboards keeps working. Because the file stays plain JSON, an LLM may author or
enrich one without the renderer acquiring any dependency.

---

## 18. Phasing

Four independently reviewable phases. Each ends shippable.

**Phase 1 — Foundation.** Package split; glyph atlas + best-match + dither + half-block +
hysteresis; OKLab colour; tokens and the `plata` look; canvas zones and safe areas; vectorised
blit; storyboard stills; worker pool.
*Visible payoff: sharper, denser, uncollided, brand-correct, ~20× faster — on every render.*

Storyboard stills land here deliberately, before the scenes they will eventually preview: the
capability is what makes Phase 2 reviewable at all, and in Phase 1 it already gives a
five-second look at each chapter instead of a two-hour one.

**Phase 2 — The visual leap.** Scene buffers; 2D and 3D primitives; camera and easing; the
sixteen archetypes; reveal schedule and anchor-to-word binding; giant and recursive
typography; glyph-level transitions; voice-reactive field.

The reactive field is driven by the **voice** envelope, which the speech stage already
produces — it does not depend on the Phase 4 score, and gains a second input when that lands.

**Phase 3 — Editorial intelligence.** Concepts, relations, rhetoric, segmentation, clause-aware
caption breaking.

**Phase 4 — Finish and durability.** Chapter-arc score; sidechain mix and loudnorm; cold open;
seamless loop; hook cut and multi-format outputs; designed cover; contact sheet; golden-frame
gates; Studio controls.

---

## 19. Risks

| Risk | Mitigation |
|---|---|
| Rewrite loses hard-won TTS/sync fixes | Those modules are **ported, not rewritten**, with their QA gates and tests. Baseline commit `6a6df2c` is the fallback. |
| Best-match at 120×128 is slower than modelled | Signature matching is tunable (glyph count, signature resolution); hybrid fallback runs best-match only on high-gradient cells and the ramp elsewhere. |
| Sixteen archetypes is a lot of surface | They share one `build(ctx) -> Scene` contract and the same primitives; archetypes are data-light. Phase 2 can land a subset and grow. |
| Spanish frequency table adds a data dependency | Small (~5k lines), shipped in-repo, no network. |
| Existing Studio job commands break | `render_cinematic_ascii_video.py` remains as a delegating shim; retired v1 flags fail with an explicit migration message. |
| Recursive typography reads as a gimmick if overused | Available per-chapter via the storyboard, not automatic on every chapter. |

---

## 20. Open questions

None blocking. Two to settle during implementation:

1. Whether `ascii7` output is worth maintaining as a first-class look or only as a debug mode —
   decide after seeing `cinematic` output at 120 columns.
2. Whether the hook cut should be assembled from rendered master frames or re-rendered from
   the storyboard. Re-rendering is cleaner and, at v2 speeds, affordable.
