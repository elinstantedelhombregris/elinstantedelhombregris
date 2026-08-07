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
    )


def write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
