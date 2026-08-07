"""Single-token pronunciation aliases that preserve visible caption text."""

from __future__ import annotations

import re

from ascii_studio.text import word_core

from ..storyboard.schema import WordTiming


def validate_pronunciations(values: dict[str, str]) -> dict[str, str]:
    cleaned: dict[str, str] = {}
    for visible, spoken in values.items():
        if len(visible.split()) != 1 or len(spoken.split()) != 1:
            raise ValueError("Pronunciation entries must map one visible token to one spoken token")
        if not word_core(visible) or not word_core(spoken):
            raise ValueError("Pronunciation entries must contain a spoken word")
        cleaned[visible] = spoken
    return cleaned


def apply_pronunciations(text: str, values: dict[str, str]) -> str:
    if not values:
        return text
    lookup = {word_core(key): value for key, value in validate_pronunciations(values).items()}
    tokens = text.split()
    rendered: list[str] = []
    for token in tokens:
        replacement = lookup.get(word_core(token))
        if replacement is None:
            rendered.append(token)
            continue
        match = re.match(r"^(\W*)(.*?)(\W*)$", token, flags=re.UNICODE)
        if match is None:
            rendered.append(replacement)
        else:
            rendered.append(f"{match.group(1)}{replacement}{match.group(3)}")
    return " ".join(rendered)


def restore_timing_text(timings: list[WordTiming], values: dict[str, str]) -> list[WordTiming]:
    if not values:
        return timings
    reverse = {word_core(spoken): visible for visible, spoken in validate_pronunciations(values).items()}
    return [
        WordTiming(value.start, value.end, reverse.get(word_core(value.text), value.text))
        for value in timings
    ]
