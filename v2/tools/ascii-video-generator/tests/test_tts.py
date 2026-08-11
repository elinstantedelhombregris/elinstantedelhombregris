from __future__ import annotations

import pytest

from ascii_studio.speech.tts import expand_native_boundaries


def test_native_multiword_boundary_expands_and_restores_punctuation():
    timings = expand_native_boundaries(
        "para que un día, cambie",
        [
            {"start": 0.0, "end": 0.3, "text": "para"},
            {"start": 0.3, "end": 0.5, "text": "que"},
            {"start": 0.5, "end": 1.2, "text": "un día"},
            {"start": 1.2, "end": 1.7, "text": "cambie"},
        ],
    )
    assert [value.text for value in timings] == ["para", "que", "un", "día,", "cambie"]
    assert all(value.end >= value.start for value in timings)
    assert timings[-1].end == pytest.approx(1.7)


def test_native_boundary_sequence_mismatch_is_rejected():
    with pytest.raises(RuntimeError, match="did not preserve"):
        expand_native_boundaries("texto privado", [{"start": 0, "end": 1, "text": "texto cambiado"}])
