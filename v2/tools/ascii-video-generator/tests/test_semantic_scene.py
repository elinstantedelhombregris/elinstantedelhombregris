from __future__ import annotations

import numpy as np

from ascii_studio.render.tokens import load_look
from ascii_studio.scene.legacy import LegacyChapter
from ascii_studio.scene.semantic import (
    active_shot, label_layout, relation_label_layout, render_semantic,
)


def chapter(**overrides) -> LegacyChapter:
    values = dict(
        motif="network", keyword="CONFIANZA",
        anchors=["CONFIANZA", "FRICCIÓN", "COOPERACIÓN"],
        archetype="causal-chain", composition="bridge", camera="push-in",
        relations=[
            {"source": "CONFIANZA", "target": "FRICCIÓN", "kind": "reduces"},
            {"source": "FRICCIÓN", "target": "COOPERACIÓN", "kind": "enables"},
        ],
        reveal_points={"CONFIANZA": 0.1, "FRICCIÓN": 0.4, "COOPERACIÓN": 0.7},
    )
    values.update(overrides)
    return LegacyChapter(**values)


def test_semantic_scene_is_confined_to_stage_and_not_empty():
    out = render_semantic(chapter(), (640, 360), load_look("plata"), 0.8)
    assert out.shape == (640, 360)
    assert out.max() > 0.8
    assert np.count_nonzero(out[:50]) == 0
    assert np.count_nonzero(out[-50:]) == 0


def test_composition_is_a_real_visual_control():
    bridge = render_semantic(chapter(composition="bridge"), (640, 360), load_look("plata"), 0.8)
    cascade = render_semantic(chapter(composition="cascade"), (640, 360), load_look("plata"), 0.8)
    assert np.mean(np.abs(bridge - cascade)) > 0.003


def test_relations_are_a_real_visual_control():
    connected = render_semantic(chapter(), (640, 360), load_look("plata"), 0.8)
    redirected = render_semantic(chapter(relations=[{
        "source": "CONFIANZA", "target": "COOPERACIÓN", "kind": "creates",
    }]), (640, 360), load_look("plata"), 0.8)
    assert not np.array_equal(connected, redirected)


def test_word_bound_reveals_change_ink_monotonically():
    early = render_semantic(chapter(), (640, 360), load_look("plata"), 0.2)
    middle = render_semantic(chapter(), (640, 360), load_look("plata"), 0.5)
    late = render_semantic(chapter(), (640, 360), load_look("plata"), 0.85)
    assert np.count_nonzero(early) < np.count_nonzero(middle) < np.count_nonzero(late)


def test_chapter_has_three_distinct_shot_states_without_explicit_shots():
    ch = chapter()
    assert active_shot(ch, 0.1).purpose == "establish"
    assert active_shot(ch, 0.5).purpose == "explain"
    assert active_shot(ch, 0.9).purpose == "transform"


def test_establish_shot_uses_one_giant_focus_label():
    labels = label_layout(chapter(), 1080, 1920, 0.16)
    assert len(labels) == 1
    assert labels[0][0] == "CONFIANZA"


def test_relation_labels_are_exposed_for_crisp_typography():
    labels = relation_label_layout(chapter(), 1080, 1920, 0.65)
    assert labels
    assert labels[0][0] == "REDUCES"
