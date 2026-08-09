# Illustrated narrative protocol

## Principle

The narration decides the images. Time intervals, a requested image count and the
ASCII renderer's fixed three-shot rhythm do not. A new image is justified only by a
change in proposition, rhetorical function or visual subject. The count is an output
of editorial analysis and has no minimum or maximum.

## State machine

1. `planning`: narration is divided into contiguous image units. Each unit has an
   exact token range, proposition, visual thesis, image brief, must-show/must-avoid
   constraints, continuity instructions and optional non-textual graphic intents.
2. `image creation`: external to the renderer. Filenames bind plates to image-unit
   ids; no render is permitted.
3. `analysis`: the software computes checksum, dimensions, aspect, luminance,
   contrast, edge density, palette, focus and low-detail candidate regions.
4. `semantic review`: a human records what the image actually shows, why it matches
   the narrated proposition, confirms every must-show element and every must-avoid
   constraint, explains how it continues its neighbours and places each graphic in
   the narrative safe region. Changing the image checksum clears that approval.
5. `approved`: direction and plate approvals are complete for every unit and the
   storyboard review status is approved.
6. `timed`: final native word boundaries resolve image windows and graphic cues.
   Missing, duplicated or out-of-range tokens stop production before video render.

## Meaning safeguards

- Full narration coverage is contiguous and lossless; repeated sentences are never
  deduplicated.
- Image cuts occur at editorial boundaries and final timestamps derive from spoken
  word events, not estimated seconds.
- Every graphic cue declares its semantic purpose, exact trigger/end token, treatment
  and reviewed target region. A graphic is optional; decoration is not a reason.
- Floating concepts, relation labels, chapter headers and keyword furniture are
  disabled over illustrations. Karaoke captions and the permanent website remain in
  reserved zones.
- Computer vision proposes geometry but cannot approve meaning. Semantic match and
  continuity are explicit human decisions.
- Approval belongs to the image checksum. A replacement plate is a new decision.

## Release blockers

Rendering is forbidden when any unit lacks its direction, exact word range, image
brief, plate, technical analysis, semantic description, narrative-match rationale,
continuity note or approval. It is also forbidden when a cue uses text, falls outside
its narration range or lacks a reviewed four-coordinate target region.
