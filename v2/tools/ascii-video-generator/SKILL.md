---
name: create-ascii-blog-videos
description: Create standalone cinematic ASCII-style social videos from arbitrary TXT, Markdown, or MDX text. Use when Codex is asked to turn an article, essay, script, or long-form text into a narrated or non-narrated video package with semantic multi-shot visuals, exact hard-caption karaoke, cinematic post effects, designed sound, multiple aspect ratios, social derivatives, approval sheets, or an editable storyboard.
---

# Create Cinematic ASCII Videos

Use this standalone renderer. Do not depend on the user's application repository
unless the user explicitly asks to integrate the output into it.

## Start Here

Run the local Studio for art-direction controls, eight looks, deterministic rerolls,
visual approval sheets, an editable storyboard, playable previews, and production
history:

```bash
~/.codex/skills/create-ascii-blog-videos/start_cinematic_ascii_studio.command
```

On this Mac it is also installed at `~/Applications/Cinematic ASCII Studio.app`.
The Studio opens at `http://127.0.0.1:8765` and stores work under
`~/Movies/CinematicAsciiStudio` by default.

Use the command directly for automation:

```bash
python3 ~/.codex/skills/create-ascii-blog-videos/scripts/render_cinematic_ascii_video.py \
  --input /absolute/path/article.md \
  --out /absolute/path/output \
  --duration-mode auto \
  --look plata \
  --formats vertical
```

The input may be TXT, Markdown, or MDX. `auto` preserves short scripts and creates
an extractive 170–240 word social edit for long articles without inventing claims.
Use `--duration-mode reel` to force that edit or `long` to preserve the complete
essay.

## Approval-First Workflow

1. Generate the inexpensive direction package:

```bash
python3 ~/.codex/skills/create-ascii-blog-videos/scripts/render_cinematic_ascii_video.py \
  --input /absolute/path/article.md \
  --out /absolute/path/output \
  --brief-only
```

2. Review the art-direction report, the three-shot-per-chapter contact sheet, and
   the clean hero-plate contact sheet.
3. Edit hooks, anchors, relationships, archetypes, shots, camera, transitions, or
   reveal bindings in the storyboard. Use
   [references/storyboard-schema.md](references/storyboard-schema.md) for the v3
   schema. In the Studio, save and approve the reviewed JSON.
4. If the concept is weak, reroll the deterministic direction with
   `--seed-offset 1` while keeping narration unchanged.
5. Render a cheap three-second smoke test before a long production render.
6. Render the approved storyboard and inspect the designed cover, video contact
   sheet, playable master, hook cut, and verification report.

For `tinta-papel-ilustrado`, the order is stricter and the software enforces it:

1. Run `--brief-only --look tinta-papel-ilustrado` without a plate directory.
   The director divides narration at proposition, rhetorical-purpose and visual-
   subject changes. The resulting image count has no minimum, maximum or requested
   target; every unit receives exact word coverage and its own image brief.
2. Approve or edit each proposition, visual thesis, must-show/must-avoid list and
   continuity instruction before creating illustrations.
3. Create exactly the planned illustrations, then run the brief again with
   `--plate-dir`. The software records checksum, palette, contrast, focus and
   candidate overlay regions. Replacing any file invalidates its prior approval.
4. Describe what the resulting image actually shows, justify its narrative match,
   review continuity with neighbouring images, place any non-textual graphic cues,
   and approve both the direction and plate analysis.
5. Only then approve the illustrated storyboard. The Studio disables smoke/full
   render actions and the CLI refuses even to synthesize speech while a blocker
   remains.
6. Native TTS word boundaries become exact image windows and graphic-cue times.
   Floating concept labels, relationship words, chapter headers and footer keywords
   are prohibited over illustrations; captions and the permanent URL retain their
   reserved zones.

For a reviewed production render:

```bash
python3 ~/.codex/skills/create-ascii-blog-videos/scripts/render_cinematic_ascii_video.py \
  --input /absolute/path/article.md \
  --out /absolute/path/output \
  --storyboard /absolute/path/output/article-reviewed-storyboard.json \
  --look nocturne \
  --formats vertical,square,landscape \
  --tts say \
  --say-voice "Reed (Spanish (Mexico))" \
  --say-rate 175 \
  --voice-performance editorial \
  --platform-url www.elinstantedelhombregris.com \
  --logo /absolute/path/logo.png
```

## Editorial Direction

Every production video carries `www.elinstantedelhombregris.com` as a permanent,
phone-legible brand signature inside the safe footer zone. The CLI and Studio use
that address by default, and package verification fails if the signature is empty.
Use `--platform-url` only when an explicitly approved brand destination replaces it.

The v4 director classifies each chapter's rhetorical purpose, extracts concepts
and causal/contrast relationships, chooses a semantic scene archetype, and builds
an establish → explain → transform shot sequence. Labels reveal on the exact spoken
word. Camera motion, temperature, entrance transitions, and resolution state are
chapter-specific. It also assigns a recognizable cinematic world, hero subject,
four or more depth planes, narrative light and a declared semantic metamorphosis.
Treat these structures as editorial worlds, not decorative patterns.

V4 uses atmosphere → architecture → subject → foreground planes with true parallax,
orientation-aware glyph selection and macro/meso/micro structure preservation.
Approved raster concept plates can be supplied with `--plate-dir`; files named after
chapter ids are decomposed into depth-aware ASCII worlds while the deterministic
native worlds remain the offline default.

Available looks:

- `plata`: restrained silver-and-gold editorial house style.
- `tinta-papel`: the Papel y Tinta brand system as living print — warm stock,
  black ink, violet action, red stamps, Anton/Archivo/Space Mono typography,
  risograph misregistration and press-designed sound.
- `tinta-papel-ilustrado`: the same editorial system with complete approved
  illustrations preserved in full colour, narrative-first image planning, mandatory
  post-image analysis, exact word-bound non-textual graphics, cold cobalt-indigo
  semantic ink, multi-act interventions and restrained depth-aware camera parallax.
- `terminal`: phosphor green terminal energy.
- `blueprint`: precise technical cyan.
- `archive`: warm documentary paper and amber.
- `manifesto`: severe high-contrast red and ivory.
- `nocturne`: deep blue cinematic atmosphere.

The renderer makes a hook-first cold open before the brand seal, balanced title
hierarchy, semantic diagrams over full-frame ASCII atmosphere, crisp labels,
chapter-specific transitions, and a designed cover rather than a frame grab.

## Speech and Captions

The default publication path is private, offline macOS speech. AVFoundation writes
the audio and exposes native boundary callbacks in the same pass; callbacks that
cover more than one word are expanded inside their measured interval, and the
original visible punctuation is restored:

```bash
--tts say --say-voice "Reed (Spanish (Mexico))" --say-rate 175
```

Edge neural speech is an opt-in alternative when the user explicitly authorizes
sending the narration text to that external service:

```bash
--tts edge --voice es-AR-TomasNeural --edge-rate=-8% --edge-pitch=-4Hz
```

Use `--voice-performance dramatic` for heavier manifesto cadence and `flat` only
for timing diagnostics. Use `--tts none` only for smoke tests or intentionally
silent work.

The timing contract is strict:

- Normalize written integers, years, grouped Spanish thousands, percentages, and
  numeric ranges into exactly what TTS receives.
- Keep decimal notation unchanged when pronunciation is ambiguous.
- Split punctuation boundaries such as `17:21` so visible and spoken tokens remain
  one-to-one.
- Discard punctuation-only events, not semantic word events.
- Keep every spoken word visible in a centered, high-contrast karaoke block.
- Highlight one real word occurrence at a time and hold it through pauses.
- Never estimate publishable timings. Fail if native or Edge boundary events are absent.
- If narration is externally edited, forced-align the final WAV before rendering.

For exceptional names, pass a one-visible-token to one-spoken-token JSON map with
`--pronunciations`. The alias is sent to speech while the original spelling remains
in captions. Multi-token substitutions are rejected because they break parity.

## Audio Direction

The voice remains centered. Music and semantic effects are stereoized separately,
duck under speech, and are exported as individual stems plus the final mix. Chapter
roots, note onsets, relationship reveals, impacts, sweeps, fracture, and resolution
also drive the visual envelopes. Do not collapse the stems before delivery.

## Production Package

The full pipeline writes:

- social adaptation, brief, art-direction report, editable v4 storyboard;
- establish/explain/transform stills, clean hero plates and both approval sheets;
- voice, stereo music stem, stereo sound-design stem, and stereo mix;
- SRT, VTT, exact word timings, and hard-caption master;
- designed cover, video contact sheet, browser preview, hook cut, seamless loop;
- true vertical, square, and landscape re-renders when requested;
- Instagram upload derivative, manifest, and machine-readable verification report.

The renderer refuses to finish when package verification fails. The large silent
video intermediate is removed unless `--keep-video-only` is supplied.

## Cheap Smoke Test

```bash
python3 ~/.codex/skills/create-ascii-blog-videos/scripts/render_cinematic_ascii_video.py \
  --input /absolute/path/article.md \
  --out /tmp/ascii-video-smoke \
  --tts none \
  --render-seconds 3 \
  --width 540 \
  --height 960 \
  --fps 6 \
  --skip-upload
```

## 10/10 Release Gate

Do not call the package finished until every gate passes:

- Rendering: deterministic best-match ASCII, stable exposure, edge-to-edge fields,
  controlled flicker, no thick transition seams, and ≥2.5 fps at 1080×1920 on the
  reference machine.
- Direction: ASCII modes require at least three distinct shot states per chapter,
  legible semantic relationships, distinct worlds, depth and metamorphosis.
  Illustrated mode instead requires contiguous word coverage, narratively earned
  image units, approved image briefs and plates, motivated continuity and only
  purpose-bound graphics. Every mode retains a hook-first opening and designed cover.
- Image craft: recognizable hero silhouette, direction-aware glyphs, multiscale
  detail, narrative lighting, stable parallax, and no repeated world topology.
- Captions: exact visible/spoken token parity, no hidden word, no overlapping line,
  one highlighted occurrence, and sync tied to the final voice audio.
- Audio: centered narration, stereo bed/effects, separate stems, speech ducking,
  controlled loudness and peaks, and meaningful semantic cues.
- Packaging: H.264 `yuv420p`, AAC stereo, requested aspect re-renders, hook cut,
  loop, subtitles, preview, contact sheets, manifest, and passing verification JSON.
- Human QA: inspect the approval sheet and representative video frames at mobile
  size; listen to the opening, a dense middle section, and the ending before release.

The formal acceptance matrix is in
`docs/specs/2026-08-07-ascii-studio-v4-new-standard.md`.
