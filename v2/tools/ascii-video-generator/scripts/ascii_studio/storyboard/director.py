"""Turn editorial analysis into concrete archetypes, shots and reveal bindings."""

from __future__ import annotations

from typing import Sequence

from ascii_studio.text import normalized_words

from .schema import Relation, Shot, Storyboard


WORLD_BY_MOTIF = {
    "noise": "fog-archive",
    "signal": "civic-plaza",
    "network": "attentive-crowd",
    "orbit": "mechanical-orbit",
    "mirror": "eye-city",
    "blueprint": "city-section",
    "pulse": "living-network",
    "fracture": "fractured-monument",
    "evidence": "evidence-trail",
    "horizon": "dawn-city",
}

WORLD_LIGHTING = {
    "fog-archive": "searchlight",
    "civic-plaza": "beacon",
    "attentive-crowd": "human-pulse",
    "mechanical-orbit": "orbital-rim",
    "eye-city": "iris-dawn",
    "city-section": "underground-rake",
    "living-network": "synaptic-pulse",
    "fractured-monument": "fracture-light",
    "evidence-trail": "raking-evidence",
    "dawn-city": "dawn",
}

WORLD_METAMORPHOSES = {
    "fog-archive": "noise-becomes-evidence",
    "civic-plaza": "attention-builds-place",
    "attentive-crowd": "silence-becomes-network",
    "mechanical-orbit": "cycle-becomes-system",
    "eye-city": "eye-becomes-city",
    "city-section": "gesture-becomes-infrastructure",
    "living-network": "pulse-becomes-structure",
    "fractured-monument": "fracture-becomes-path",
    "evidence-trail": "footprints-become-map",
    "dawn-city": "attention-becomes-horizon",
}


def world_direction(motif: str, index: int, count: int, anchors: Sequence[str]) -> tuple[str, str, str, str]:
    world = WORLD_BY_MOTIF.get(motif, "monumental-field")
    if motif == "signal" and index > 0:
        world = "attentive-crowd"
    if index == count - 1:
        world = "eye-city" if any("ATEN" in value.upper() for value in anchors) else "dawn-city"
    lighting = WORLD_LIGHTING.get(world, "volumetric")
    metamorphosis = WORLD_METAMORPHOSES.get(world, "reveal-becomes-world")
    subject = anchors[0] if anchors else motif.upper()
    return world, lighting, metamorphosis, subject


def compact_anchor(value: str, max_words: int = 2, max_chars: int = 22) -> str:
    """Turn a concept phrase into a mobile-legible diagram label."""
    words = value.upper().split()
    if len(value) <= max_chars and len(words) <= max_words:
        return value.upper()
    selected = words[:max_words]
    while selected and len(" ".join(selected)) > max_chars:
        selected.pop()
    if not selected and words:
        selected = [words[0][:max_chars]]
    return " ".join(selected)


def choose_archetype(motif: str, rhetoric: str, relations: Sequence[Relation]) -> str:
    kinds = {relation.kind for relation in relations}
    if "contrasts" in kinds or rhetoric == "contrast":
        return "contrast"
    if kinds.intersection({"causes", "creates", "reduces", "enables", "connects"}):
        return "causal-chain"
    if "reinforces" in kinds:
        return "feedback-loop"
    if rhetoric == "evidence":
        return "comparison"
    if rhetoric == "question":
        return "threshold"
    if rhetoric == "call-to-action":
        return "flow"
    if rhetoric == "definition":
        return "layers"
    return {
        "network": "network", "blueprint": "hierarchy", "orbit": "orbit-cycle",
        "pulse": "growth", "fracture": "threshold", "evidence": "distribution",
        "mirror": "contrast", "horizon": "flow", "signal": "flow", "noise": "field",
    }.get(motif, "field")


def build_shots(archetype: str, composition: str, anchors: Sequence[str], density: float,
                lighting: str = "volumetric", metamorphosis: str = "reveal") -> list[Shot]:
    focus = anchors[0] if anchors else ""
    second = anchors[1] if len(anchors) > 1 else focus
    entrance = {
        "contrast": "wipe-v", "threshold": "glitch", "flow": "wipe-h",
        "causal-chain": "wipe-h", "feedback-loop": "iris", "orbit-cycle": "iris",
        "field": "crossfade",
    }.get(archetype, "iris")
    return [
        Shot("establish", 0.0, 0.28, "establish", composition, "drift", "giant",
             max(0.2, density - 0.22), entrance, focus, "silhouette", "emerge", "none"),
        Shot("explain", 0.28, 0.72, "explain", composition, "push-in", "caption",
             density, "morph", second, "inhabit", lighting, metamorphosis),
        Shot("transform", 0.72, 1.0, "transform", composition, "pull-out", "integrated",
             min(1.0, density + 0.16), "optical", focus, "resolve", "resolution", metamorphosis),
    ]


def upgrade_storyboard_v4(storyboard: Storyboard) -> Storyboard:
    """Promote older boards without changing narration, anchors, or relationships."""
    was_v4 = storyboard.version >= 4
    count = len(storyboard.chapters)
    for index, chapter in enumerate(storyboard.chapters):
        world, lighting, metamorphosis, subject = world_direction(
            chapter.motif, index, count, chapter.anchors,
        )
        if not chapter.world or chapter.world == "abstract-field":
            chapter.world = world
        if not chapter.lighting or chapter.lighting == "volumetric":
            chapter.lighting = WORLD_LIGHTING.get(chapter.world, lighting)
        if not chapter.metamorphosis or chapter.metamorphosis == "reveal":
            chapter.metamorphosis = WORLD_METAMORPHOSES.get(chapter.world, metamorphosis)
        chapter.hero_subject = chapter.hero_subject or subject
        chapter.depth_layers = max(4, int(chapter.depth_layers or 4))
        if not was_v4 or not chapter.shots or any(not shot.world_state for shot in chapter.shots):
            chapter.shots = build_shots(
                chapter.archetype, chapter.composition, chapter.anchors, chapter.density,
                chapter.lighting, chapter.metamorphosis,
            )
        else:
            states = ("silhouette", "inhabit", "resolve")
            for shot_index, shot in enumerate(chapter.shots):
                shot.world_state = shot.world_state or states[min(shot_index, 2)]
                shot.light = shot.light if shot.light != "available" else chapter.lighting
                if shot.purpose != "establish" and shot.metamorphosis == "none":
                    shot.metamorphosis = chapter.metamorphosis
    storyboard.version = max(4, storyboard.version)
    return storyboard


def reveal_bindings(anchors: Sequence[str], text: str) -> dict[str, str]:
    spoken = normalized_words(text)
    bindings: dict[str, str] = {}
    for anchor in anchors:
        for word in normalized_words(anchor):
            if word in spoken:
                bindings[anchor] = word
                break
    return bindings


def temperature_for(index: int, count: int, rhetoric: str) -> float:
    base = -0.5 + index / max(1, count - 1)
    if rhetoric in {"contrast", "question"}:
        base -= 0.2
    elif rhetoric in {"consequence", "call-to-action"}:
        base += 0.2
    return round(max(-1.0, min(1.0, base)), 3)
