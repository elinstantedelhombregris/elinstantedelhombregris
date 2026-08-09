# Storyboard v4/v5 JSON

The renderer writes an editable storyboard and accepts v2 storyboards through a
compatibility migration. Keep narration in `texts` unchanged unless copy editing is
explicitly requested; direct the film through semantic and shot fields.

## Shape

```json
{
  "version": 4,
  "title": "Title shown in the video",
  "slug": "output-file-prefix",
  "thesis": "Short editorial summary",
  "hook": "Large cold-open promise",
  "cover_hook": "Short mobile cover promise",
  "look": "plata",
  "format": "reel",
  "keywords": ["signal", "memory"],
  "pronunciations": {"Ackoff": "Acóf"},
  "chapters": [
    {
      "id": "01-signal",
      "label": "01 / SIGNAL",
      "motif": "signal",
      "keyword": "ATTENTION",
      "texts": ["Narrated caption one.", "Narrated caption two."],
      "primary": "#f5d47c",
      "secondary": "#66d7c0",
      "accent": "#e5f3ef",
      "anchors": ["ATTENTION", "SIGNAL", "NOISE"],
      "metaphor": "detector isolating ATTENTION / SIGNAL / NOISE",
      "seed": 1634938309,
      "density": 0.61,
      "motion": 0.47,
      "composition": "radar",
      "rhetoric": "contrast",
      "archetype": "filter",
      "temperature": -0.12,
      "camera": "push",
      "world": "civic-plaza",
      "hero_subject": "ATTENTION",
      "plate": "",
      "depth_layers": 4,
      "lighting": "beacon",
      "metamorphosis": "attention-builds-place",
      "reveal_words": {"ATTENTION": "attention", "SIGNAL": "signal"},
      "relations": [
        {"source": "NOISE", "target": "SIGNAL", "kind": "conceals", "weight": 0.8}
      ],
      "shots": [
        {"id": "establish", "beat": "establish", "progress_start": 0.0, "progress_end": 0.28, "camera": "drift", "transition": "glitch", "emphasis": "NOISE"},
        {"id": "explain", "beat": "explain", "progress_start": 0.28, "progress_end": 0.72, "camera": "push", "transition": "crossfade", "emphasis": "SIGNAL"},
        {"id": "transform", "beat": "transform", "progress_start": 0.72, "progress_end": 1.0, "camera": "pull", "transition": "iris", "emphasis": "ATTENTION"}
      ]
    }
  ]
}
```

## Direction Fields

- `rhetoric`: editorial purpose such as `contrast`, `cause`, `question`,
  `definition`, `evidence`, `process`, or `resolution`.
- `archetype`: semantic layout. Supported families include `filter`, `bridge`,
  `network`, `chain`, `before-after`, `timeline`, `balance`, `barrier`, `feedback`,
  `layers`, `constellation`, `orbit`, `mirror`, `evidence-board`, `fracture`, and
  `horizon`.
- `relations`: directed concept connections. Useful kinds include `causes`,
  `enables`, `reduces`, `reinforces`, `contrasts`, `conceals`, and `creates`.
- `shots`: ordered establish/explain/transform beats. Keep progress ranges
  contiguous and within 0–1. Supported entrance transitions are `crossfade`,
  `glitch`, `wipe-h`, `wipe-v`, and `iris`. Supported camera moves are `static`,
  `drift`, `push`, `pull`, `orbit`, and `rack`.
- `reveal_words`: maps each visible concept to the narration token that activates
  it. Use a word that actually appears in that chapter.
- `temperature`: cool/warm OKLab shift, normally between -0.35 and 0.35.
- `seed`, `density`, and `motion`: geometry, visual information, and speed.
- `world`: recognizable cinematic environment. Native worlds include
  `civic-plaza`, `evidence-trail`, `city-section`, `attentive-crowd`, `eye-city`,
  `mechanical-orbit`, `fractured-monument`, and `dawn-city`.
- `hero_subject`: the chapter's dominant silhouette or visual proposition.
- `plate`: optional absolute path to an approved raster concept plate. The renderer
  decomposes it into depth, contour and hero layers before ASCII conversion.
- `depth_layers`: four or more parallax planes.
- `lighting`: narrative light rig such as `beacon`, `underground-rake`,
  `human-pulse`, `iris-dawn`, or `dawn`.
- `metamorphosis`: the visible conceptual transformation completed by the chapter.

## Illustrated protocol v5

`tinta-papel-ilustrado` uses v5. Here a chapter is an earned image unit, not a
fixed-duration ASCII chapter. The top level must contain:

```json
{
  "version": 5,
  "look": "tinta-papel-ilustrado",
  "illustrated_protocol": 1,
  "illustrated_review_status": "planning",
  "overlay_policy": "graphics-only"
}
```

Every chapter adds an `illustration` contract:

```json
{
  "word_start": 0,
  "word_end": 37,
  "narration_checksum": "sha256 of the normalized visible/spoken unit",
  "boundary_reason": "explicit-rhetorical-turn",
  "narrative_function": "contrast",
  "proposition": "The exact narrated proposition carried by this image.",
  "visual_thesis": "What the complete image must make perceptible.",
  "image_brief": "A concrete editorial image brief derived from the proposition.",
  "must_show": ["distributed authority"],
  "must_avoid": ["floating labels", "generic symbolism"],
  "continuity_in": "How it inherits shape, gaze, direction or scale.",
  "continuity_out": "How it motivates the next cut.",
  "direction_approved": false,
  "graphics": [
    {
      "id": "relation-01",
      "kind": "causal-path",
      "purpose": "The semantic relation this intervention makes visible without text.",
      "trigger_token": 12,
      "end_token": 36,
      "target_region": [0.08, 0.18, 0.38, 0.42]
    }
  ],
  "plate_analysis": {
    "status": "analyzed",
    "checksum": "sha256…",
    "palette": ["#F0E0C0", "#201810"],
    "focus_box": [0.2, 0.1, 0.8, 0.7],
    "overlay_regions": [[0.02, 0.12, 0.32, 0.29]],
    "semantic_summary": "What the created image actually depicts.",
    "narrative_match": "Why that depiction expresses this exact proposition.",
    "must_show_coverage": ["distributed authority"],
    "must_avoid_clear": true,
    "continuity_notes": "How it cuts meaningfully to its neighbours.",
    "approved": false
  }
}
```

Token ranges are zero-based, half-open and must cover the full visible/spoken script
without gaps or overlaps. Graphic trigger indexes are local to the image unit and
are resolved to native TTS word-boundary timestamps before rendering. Text, label,
title, word and caption graphic kinds are invalid; ordinary karaoke captions remain
in their reserved caption zone.

## Motifs and Looks

Motifs provide atmospheric field behavior: `noise`, `signal`, `network`, `orbit`,
`mirror`, `blueprint`, `pulse`, `fracture`, `evidence`, and `horizon`.

Looks provide the production palette and typography system: `plata`, `tinta-papel`,
`tinta-papel-ilustrado`, `terminal`, `blueprint`, `archive`, `manifesto`, and
`nocturne`. The illustrated paper mode preserves approved colour plates and prints
only reviewed, word-bound non-textual interventions over them; the original paper
mode converts those plates to ASCII ink and retains the semantic label system.

## Editorial Rules

- For ASCII looks, use four to eight chapters for most social pieces and give every
  chapter at least three shot beats plus a visible transformation.
- For illustrated work, never request a number of images. Accept the count earned by
  proposition, rhetorical-function and visual-subject changes; one coherent essay may
  need one image or hundreds.
- Use two to four short, concrete concept labels; compact labels to two words.
- Prefer explicit relationships over decorative nodes.
- Avoid adjacent chapters with the same archetype and transition unless repetition
  carries meaning.
- Bind important ASCII labels and every illustrated graphic cue to exact spoken words.
- Make the final chapter resolve, open, converge, or deliberately refuse closure.
- Keep all text inside the safe area for every requested aspect ratio.
- Use automatic output as a draft. Illustrated work requires direction approval,
  post-creation plate analysis, narrative-match justification, continuity review and
  checksum-stable final approval before rendering.
