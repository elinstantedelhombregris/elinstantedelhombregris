# Illustrated narrative protocol v2

## Principle

The narration decides the images. Time intervals, a requested image count and the
ASCII renderer's fixed three-shot rhythm do not. A new image is justified only by a
change in proposition, rhetorical function or visual subject. The count is an output
of editorial analysis and has no minimum or maximum.

## State machine

1. `planning`: narration is divided into contiguous image units. Each unit has an
   exact token range, proposition, visual thesis, image brief, must-show/must-avoid
   constraints, continuity instructions, a named visual-style contract and optional
   editorial graphic intents.
2. `image creation`: external to the renderer. Filenames bind plates to image-unit
   ids; no render is permitted.
3. `analysis`: the software computes checksum, dimensions, aspect, luminance,
   contrast, edge density, palette, focus and low-detail candidate regions. It also
   scores the plate against the named style's measured print characteristics.
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
- Every graphic cue declares its semantic purpose, exact trigger/end token, animation,
  treatment and reviewed target region. A graphic is optional; decoration is not a
  reason. It draws on, pulses and retracts instead of appearing as a static overlay.
- A cue may carry one microtext of one to four words only when those exact words are
  already present in the narration. It identifies the animated object; it never
  paraphrases, introduces a new claim or duplicates a complete subtitle.
- Floating concepts, chapter headers and keyword furniture remain disabled. One
  opening title enters as a printed strip, holds long enough to orient the viewer and
  clears. Karaoke captions and the permanent website remain in reserved zones.
- Computer vision proposes geometry but cannot approve meaning. Semantic match and
  continuity are explicit human decisions.
- Approval belongs to the image checksum. A replacement plate is a new decision.

## Release blockers

Rendering is forbidden when any unit lacks its direction, exact word range, named
style, reproducible positive/negative prompt, image brief, plate, technical analysis,
semantic description, narrative-match rationale, continuity note or approval. It is
also forbidden when a plate scores below the style threshold, a cue falls outside its
narration range, its microtext is invented/too long, or it lacks a reviewed
four-coordinate target region.

## Default image language: `grabado-civico`

The eight concept plates from the presidents test define the reference family. The
software translates that family into one prompt and audit contract rather than
copying a subject from any individual plate.

- **Form:** editorial woodcut/linocut, carved black line, dense directional hatching,
  irregular pressure and physical paper grain.
- **Palette:** black ink and aged cream/ochre stock dominate. Violet is reserved for
  systems, routes and alternatives; red is a single warning, fracture or decision.
- **Composition:** one legible civic allegory, monumental perspective, concrete
  foreground/midground/horizon and people acting collectively inside the system.
- **World:** Argentine architecture, territory and public infrastructure without
  party propaganda or default likenesses of real politicians.
- **Mobile hierarchy:** the principal silhouette/metaphor reads immediately; smaller
  scenes reward closer inspection without breaking the first read.
- **Reserved space:** at least one reviewed low-detail area for semantic graphics and
  an unobstructed lower reading field for captions and the website.

The raster gate checks 9:16 format, engraved contrast, line density, black-ink
coverage, warm-paper presence and tonal balance. Passing these measurements does not
approve anatomy, composition or narrative meaning; those remain human decisions.

## Foreground motion grammar

- `draw-pulse-arrive`: causal line draws by travelled distance, pulses at the moving
  tip and resolves with an arrow only after arrival.
- `thread-pulse-connect`: violet thread joins concrete endpoints; nodes appear only
  when reached.
- `arch-build-settle`: a bridge is constructed from one side to the other.
- `orbit-draw-pulse`: a feedback arc closes progressively and marks direction.
- `seam-open-hold`: a contrast seam opens from its centre instead of using a static
  divider.
- `hatch-cancel-clear`: cancellation is built with sequential carved strokes.
- `corner-scan-reveal`: corner registration marks appear while a scan traverses the
  approved object.

At an image cut the incoming plate appears on the exact first spoken word. A brief
risograph-registration settle and travelling ink seam animate the cut after that
boundary; the next image is never leaked early by a crossfade.
