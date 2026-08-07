"""Offline rhetorical classification for semantic storyboard direction."""

from __future__ import annotations

import re


_CUES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("question", ("?", "¿")),
    # A thesis sentence can sit inside a paragraph introduced by "pero" or
    # closed by "entonces".  Prefer the more specific definitional role.
    ("definition", (" significa ", " se define ", " es una ", " es un ", " es la ", " es el ", " llamamos ", " means ", " is a ", " is the ")),
    ("contrast", ("sin embargo", "pero", "aunque", "en cambio", "but ", "however")),
    ("example", ("por ejemplo", "un caso", "como cuando", "for example")),
    ("evidence", ("datos", "estudio", "investig", "demostr", "por ciento", "%", "evidence")),
    ("consequence", ("por lo tanto", "entonces", "por eso", "de modo que", "así que", "therefore")),
    ("call-to-action", ("hacelo", "hagamos", "empezá", "construí", "decidí", "recordá", "actuá", "let us", "start ")),
)


def classify_rhetoric(text: str) -> str:
    lowered = f" {text.casefold()} "
    if re.search(r"\b(?:todo|esto|eso|this|that)\s+(?:es|is)\s+[^.!?]+", lowered):
        return "definition"
    if re.search(r"\b[^.!?]+\s+como\s+[^.!?]+,\s*entonces\b", lowered):
        return "definition"
    for label, cues in _CUES:
        if any(cue in lowered for cue in cues):
            return label
    if re.search(r"\b(si|cuando|whenever|if)\b.+[,;:].+", lowered):
        return "consequence"
    return "statement"


def rhetoric_score(label: str) -> float:
    return {
        "question": 1.0,
        "contrast": 0.92,
        "consequence": 0.9,
        "call-to-action": 0.88,
        "evidence": 0.82,
        "definition": 0.78,
        "example": 0.72,
        "statement": 0.5,
    }.get(label, 0.5)
