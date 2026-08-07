from __future__ import annotations

import pytest

from ascii_studio.speech.pronunciation import (
    apply_pronunciations,
    restore_timing_text,
    validate_pronunciations,
)
from ascii_studio.storyboard.schema import WordTiming


def test_pronunciation_changes_voice_text_but_restores_visible_timing():
    values = {"Ackoff": "Acóf"}
    spoken = apply_pronunciations("Ackoff propuso un sistema", values)
    assert spoken.startswith("Acóf ")
    restored = restore_timing_text([WordTiming(0.0, 0.5, "Acóf")], values)
    assert restored[0].text == "Ackoff"


def test_pronunciation_rejects_token_count_changes():
    with pytest.raises(ValueError):
        validate_pronunciations({"AI": "inteligencia artificial"})
