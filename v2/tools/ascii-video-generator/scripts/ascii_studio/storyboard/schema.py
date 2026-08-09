"""Storyboard data model: dataclasses, JSON load/save."""

from __future__ import annotations

import json
from dataclasses import dataclass, field, fields
from pathlib import Path


@dataclass
class WordTiming:
    start: float
    end: float
    text: str


@dataclass
class Caption:
    index: int
    start: float
    end: float
    text: str
    section: str
    words: list[WordTiming]


@dataclass
class Relation:
    source: str
    target: str
    kind: str = "relates"
    label: str = ""
    weight: float = 0.75


@dataclass
class Shot:
    id: str
    start: float
    end: float
    purpose: str
    composition: str
    camera: str = "hold"
    typography: str = "caption"
    density: float = 0.5
    transition: str = "crossfade"
    focus: str = ""
    world_state: str = "reveal"
    light: str = "available"
    metamorphosis: str = "none"


@dataclass
class GraphicCue:
    """A restrained editorial intervention tied to exact narration tokens."""

    id: str
    kind: str
    purpose: str
    trigger_token: int
    end_token: int
    source: str = ""
    target: str = ""
    treatment: str = "violet-path"
    target_region: list[float] = field(default_factory=list)
    callout: str = ""
    animation: str = "draw-hold-retract"
    emphasis: str = "primary"


@dataclass
class PlateAnalysis:
    """Technical inspection plus the human semantic review of one illustration."""

    path: str = ""
    checksum: str = ""
    status: str = "missing"
    width: int = 0
    height: int = 0
    aspect_ratio: float = 0.0
    luma_mean: float = 0.0
    contrast: float = 0.0
    edge_density: float = 0.0
    palette: list[str] = field(default_factory=list)
    focus_box: list[float] = field(default_factory=list)
    overlay_regions: list[list[float]] = field(default_factory=list)
    semantic_summary: str = ""
    narrative_match: str = ""
    must_show_coverage: list[str] = field(default_factory=list)
    must_avoid_clear: bool = False
    continuity_notes: str = ""
    approved: bool = False
    style_id: str = ""
    style_score: float = 0.0
    style_checks: dict[str, bool] = field(default_factory=dict)
    style_metrics: dict[str, float] = field(default_factory=dict)


@dataclass
class IllustrationDirection:
    """Narrative contract for one image unit in the illustrated protocol."""

    word_start: int
    word_end: int
    narration_checksum: str
    boundary_reason: str
    narrative_function: str
    proposition: str
    visual_thesis: str
    image_brief: str
    style_id: str = "grabado-civico"
    generation_prompt: str = ""
    negative_prompt: str = ""
    must_show: list[str] = field(default_factory=list)
    must_avoid: list[str] = field(default_factory=list)
    continuity_in: str = ""
    continuity_out: str = ""
    transition: str = "motivated-cut"
    graphics: list[GraphicCue] = field(default_factory=list)
    plate_analysis: PlateAnalysis = field(default_factory=PlateAnalysis)
    direction_approved: bool = False


@dataclass
class Chapter:
    id: str
    label: str
    motif: str
    keyword: str
    texts: list[str]
    primary: str
    secondary: str
    accent: str
    anchors: list[str] = field(default_factory=list)
    metaphor: str = ""
    seed: int = 0
    density: float = 0.5
    motion: float = 0.5
    composition: str = "radial"
    rhetoric: str = "statement"
    archetype: str = "field"
    relations: list[Relation] = field(default_factory=list)
    shots: list[Shot] = field(default_factory=list)
    temperature: float = 0.0
    reveal_words: dict[str, str] = field(default_factory=dict)
    camera: str = "hold"
    world: str = "abstract-field"
    hero_subject: str = ""
    plate: str = ""
    depth_layers: int = 4
    lighting: str = "volumetric"
    metamorphosis: str = "reveal"
    illustration: IllustrationDirection | None = None


@dataclass
class Storyboard:
    title: str
    slug: str
    thesis: str
    keywords: list[str]
    chapters: list[Chapter]
    version: int = 4
    hook: str = ""
    cover_hook: str = ""
    look: str = "plata"
    format: str = "reel"
    pronunciations: dict[str, str] = field(default_factory=dict)
    illustrated_protocol: int = 0
    illustrated_review_status: str = "not-applicable"
    overlay_policy: str = "semantic-labels"
    illustration_style: str = "grabado-civico"


_CHAPTER_FIELDS = {f.name for f in fields(Chapter)}


def load_storyboard(path: Path) -> Storyboard:
    payload = json.loads(path.read_text(encoding="utf-8"))
    # Storyboards saved before a field was retired (e.g. the removed "persona" flag)
    # may still carry the old key; drop anything Chapter no longer declares instead
    # of failing to load.
    chapters = []
    for raw in payload["chapters"]:
        chapter = {key: value for key, value in raw.items() if key in _CHAPTER_FIELDS}
        migrated_anchors = []
        for value in chapter.get("anchors", []):
            label = value if isinstance(value, str) else value.get("label", "")
            if label:
                migrated_anchors.append(str(label))
        chapter["anchors"] = migrated_anchors
        chapter["relations"] = [
            value if isinstance(value, Relation) else Relation(**{
                key: val for key, val in value.items()
                if key in {"source", "target", "kind", "label", "weight"}
            })
            for value in chapter.get("relations", [])
            if isinstance(value, (dict, Relation))
        ]
        chapter["shots"] = [
            value if isinstance(value, Shot) else Shot(**{
                key: val for key, val in value.items()
                if key in {"id", "start", "end", "purpose", "composition", "camera",
                           "typography", "density", "transition", "focus", "world_state",
                           "light", "metamorphosis"}
            })
            for value in chapter.get("shots", [])
            if isinstance(value, (dict, Shot))
        ]
        illustration = chapter.get("illustration")
        if isinstance(illustration, dict):
            graphics = [
                value if isinstance(value, GraphicCue) else GraphicCue(**{
                    key: val for key, val in value.items()
                    if key in {f.name for f in fields(GraphicCue)}
                })
                for value in illustration.get("graphics", [])
                if isinstance(value, (dict, GraphicCue))
            ]
            analysis_raw = illustration.get("plate_analysis", {})
            analysis = (
                analysis_raw if isinstance(analysis_raw, PlateAnalysis)
                else PlateAnalysis(**{
                    key: val for key, val in analysis_raw.items()
                    if key in {f.name for f in fields(PlateAnalysis)}
                }) if isinstance(analysis_raw, dict) else PlateAnalysis()
            )
            chapter["illustration"] = IllustrationDirection(**{
                **{
                    key: val for key, val in illustration.items()
                    if key in {f.name for f in fields(IllustrationDirection)}
                    and key not in {"graphics", "plate_analysis"}
                },
                "graphics": graphics,
                "plate_analysis": analysis,
            })
        chapters.append(Chapter(**chapter))
    return Storyboard(
        title=payload["title"],
        slug=payload["slug"],
        thesis=payload.get("thesis", ""),
        keywords=payload.get("keywords", []),
        chapters=chapters,
        version=int(payload.get("version", 2)),
        hook=payload.get("hook", ""),
        cover_hook=payload.get("cover_hook", payload.get("hook", "")),
        look=payload.get("look", "plata"),
        format=payload.get("format", "long" if int(payload.get("version", 2)) < 3 else "reel"),
        pronunciations=payload.get("pronunciations", {}),
        illustrated_protocol=int(payload.get("illustrated_protocol", 0)),
        illustrated_review_status=payload.get("illustrated_review_status", "not-applicable"),
        overlay_policy=payload.get("overlay_policy", "semantic-labels"),
        illustration_style=payload.get("illustration_style", "grabado-civico"),
    )


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
