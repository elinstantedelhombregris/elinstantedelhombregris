"""Extract small, display-ready causal/contrastive relations from Spanish prose."""

from __future__ import annotations

import re
from typing import Sequence

from ascii_studio.text import FUNCTION_WORDS, normalized_words

from ..storyboard.schema import Relation


_CONNECTIVES: tuple[tuple[str, str, bool], ...] = (
    (r"\bpor lo tanto\b|\bpor eso\b|\bde modo que\b|\basí que\b|\btherefore\b", "causes", False),
    (r"\bporque\b|\bdebido a\b|\bya que\b|\bbecause\b", "causes", True),
    (r"\bsin embargo\b|\bpero\b|\ben cambio\b|\bbut\b|\bhowever\b", "contrasts", False),
    (r"\bconecta\b|\bconnects?\b", "connects", False),
    (r"\bpermite\b|\bhabilita\b|\bhace posible\b|\benables?\b|\bmakes?\b(?=.{0,30}\bpossible\b)", "enables", False),
    (r"\breduces?\b|\bdisminuye\b|\bdesarma\b|\blower[s]?\b", "reduces", False),
    (r"\baumenta\b|\bmultiplica\b|\bfortalece\b|\breinforces?\b|\bstrengthens?\b|\bbecomes\b(?=.{0,15}\bstronger\b)", "reinforces", False),
    (r"\bgenera\b|\bproduce\b|\bcrea\b|\btransforma\b|\bcreates?\b|\bgenerates?\b|\bproduces?\b|\binto\b", "creates", False),
)


def _label(fragment: str, anchors: Sequence[str]) -> str:
    fragment_words = set(normalized_words(fragment))
    best = ""
    best_hits = 0
    for anchor in anchors:
        hits = len(fragment_words.intersection(normalized_words(anchor)))
        if hits > best_hits:
            best, best_hits = anchor, hits
    if best:
        return best
    words = [word for word in normalized_words(fragment) if word not in FUNCTION_WORDS and len(word) >= 3]
    return " ".join(words[:3]).upper()


def _label_by_position(fragment: str, anchors: Sequence[str], *, first: bool) -> str:
    """Choose the first/last anchor actually mentioned in a nearby clause."""
    normalized = " ".join(normalized_words(fragment))
    hits: list[tuple[int, str]] = []
    for anchor in anchors:
        words = normalized_words(anchor)
        positions = [normalized.find(word) for word in words if normalized.find(word) >= 0]
        if positions:
            hits.append((min(positions) if first else max(positions), anchor))
    if not hits:
        return ""
    return (min(hits) if first else max(hits))[1]


def _nearby_labels(clean: str, start: int, end: int, anchors: Sequence[str]) -> tuple[str, str]:
    before, after = clean[:start], clean[end:]
    sentence_left = re.split(r"[.!?]", before)[-1]
    local_left = re.split(r"[,;]", sentence_left)[-1]
    local_right = re.split(r"[,;.!?]", after)[0]
    source = _label_by_position(local_left, anchors, first=False) if local_left.strip() else ""
    if not source:
        # Elliptical coordinated clauses inherit the sentence's subject:
        # "Trust connects people, reduces friction, and makes cooperation possible."
        source = _label_by_position(sentence_left, anchors, first=True)
    target = _label_by_position(local_right, anchors, first=True)
    return source, target


def extract_relations(text: str, anchors: Sequence[str]) -> list[Relation]:
    clean = " ".join(text.split())
    relations: list[Relation] = []
    for pattern, kind, reverse in _CONNECTIVES:
        match = re.search(pattern, clean, flags=re.I)
        if not match:
            continue
        local_source, local_target = _nearby_labels(clean, match.start(), match.end(), anchors)
        source, target = (local_target, local_source) if reverse else (local_source, local_target)
        if source and target and source != target:
            relations.append(Relation(source=source, target=target, kind=kind,
                                      label=match.group(0).upper(), weight=0.9))
    if not relations and len(anchors) >= 2:
        relations.append(Relation(source=anchors[0], target=anchors[1], kind="relates", weight=0.55))
    return relations[:4]


def direct_fallback_relations(relations: Sequence[Relation], rhetoric: str) -> list[Relation]:
    """Turn a generic visual edge into an editorially meaningful proposition.

    Some prose states a relationship without an explicit causal connective.  A
    line labelled ``RELATES`` is technically true but editorially empty, so the
    rhetorical role supplies the weakest honest direction instead.
    """
    directions = {
        # A paragraph can be contrastive without its top two concepts being
        # the compared pair.  "FRAMES" keeps that editorial structure honest;
        # explicit contrast connectives still produce ``contrasts`` above.
        "contrast": ("supports", "FRAMES"),
        "question": ("questions", "QUESTION"),
        "definition": ("defines", "DEFINE"),
        "call-to-action": ("enables", "ACTIVATE"),
        "consequence": ("causes", "CAUSES"),
        "evidence": ("supports", "EVIDENCE"),
        "example": ("exemplifies", "EXAMPLE"),
        "statement": ("supports", "SUPPORTS"),
    }
    kind, label = directions.get(rhetoric, directions["statement"])
    return [
        Relation(
            source=value.source,
            target=value.target,
            kind=kind if value.kind == "relates" else value.kind,
            label=label if value.kind == "relates" else value.label,
            weight=value.weight,
        )
        for value in relations
    ]
