# Cinematic ASCII Studio v3 — 10/10 acceptance contract

The v3 release is complete only when the renderer behaves like an editorial director,
not an audio visualizer.  Existing v2 storyboards remain loadable.

## Rating gates

| Rating | Gate |
|---|---|
| Rendering technology | 1080x1920 master, deterministic best-match glyph render, stable exposure, >=2.5 single-thread fps, no non-ASCII scene overlay. |
| Caption and delivery reliability | Every spoken token is visible, occurrence-timed, contrast-safe and represented in SRT/VTT/word JSON; final WAV remains timing authority. |
| Visual identity | At least five complete looks; one accent with chapter temperature; designed cold open, cover and end/loop resolve. |
| Film direction | Every automatic chapter has establish/explain/transform shots, a real camera instruction, a focal hierarchy and an authored transition. |
| Semantic storytelling | Rhetoric, anchors and relations generate visible scene elements; composition changes layout; named elements reveal when their words are spoken. |
| Social packaging | Reel adaptation, hook cut, 9:16 master, optional re-laid-out 1:1 and 16:9, cover, contact sheet, storyboard stills, upload derivative and verification report. |

## Storyboard v3

Each chapter adds:

- `rhetoric`: definition, contrast, example, evidence, consequence, question,
  call-to-action or statement.
- `archetype`: network, hierarchy, flow, feedback-loop, causal-chain,
  comparison, timeline, distribution, growth, map, contrast, layers,
  threshold, orbit-cycle, field or portrait.
- `relations`: typed source/target edges.
- `shots`: normalized start/end, purpose, composition, camera, typography,
  density and transition.
- `temperature`: perceptual warm/cool shift, -1..1.
- `reveal_words`: optional explicit label-to-spoken-token bindings.

Top-level additions are `version`, `hook`, `cover_hook`, `format`, `look` and
`pronunciations`.

## Compatibility

- Load v1/v2 JSON by supplying deterministic defaults and converting string
  anchors to v3 labels.
- Preserve the existing CLI flags and output names.
- Keep the exact speech/caption QA path unchanged except for pronunciation
  substitutions made before both TTS and token alignment.
- Keep `--persona` parse-compatible but never present it as an active Studio
  control while it is a no-op.

## Human review contract

A flagship render is not approved from unit tests alone.  Review the storyboard
contact sheet, a six-frame motion sheet, the designed cover at 270px width, the
master with audio, the verification JSON, and a platform-compressed derivative.
Any generic-looking chapter must be redirected in the storyboard and rerendered.
