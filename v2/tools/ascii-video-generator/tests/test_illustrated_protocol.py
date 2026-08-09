from dataclasses import asdict

import cv2
import numpy as np
import pytest

from ascii_studio.render.frames import _planned_graphics
from ascii_studio.scene.legacy import LegacyChapter
from ascii_studio.storyboard.build import build_storyboard, scene_ranges
from ascii_studio.storyboard.illustrated import (
    analyze_plate, analyze_storyboard_plates,
    bind_illustrated_timeline,
    split_illustrated_units,
    validate_illustrated_protocol,
)
from ascii_studio.storyboard.schema import Caption, WordTiming, load_storyboard, write_json


NARRATION = (
    "La presidencia concentra información en una sola persona. "
    "La presidencia vuelve invisible el trabajo distribuido. "
    "Sin embargo la ciudadanía ya coordina redes complejas. "
    "La ciudadanía aprende y decide en común. "
    "Por eso la infraestructura debe repartir autoridad. "
    "La infraestructura puede registrar decisiones abiertas. "
    "La alternativa construye responsabilidad compartida. "
    "La alternativa no necesita una cara única."
)


def test_illustrated_segmentation_has_no_requested_minimum_or_maximum():
    board = build_storyboard("Otra arquitectura", "otra-arquitectura", NARRATION, 2, illustrated=True)

    assert len(board.chapters) > 2  # the ASCII-only chapter cap is ignored
    assert board.version == 5
    assert board.overlay_policy == "graphics-only"
    assert board.illustrated_review_status == "planning"
    assert all(len(chapter.shots) == 1 for chapter in board.chapters)
    assert not validate_illustrated_protocol(board)


def test_illustrated_segmentation_never_deduplicates_repeated_narration():
    text = "La idea vuelve. La idea vuelve. La idea cambia."
    board = build_storyboard("La idea", "la-idea", text, 1, illustrated=True)
    planned = " ".join(value for chapter in board.chapters for value in chapter.texts)

    assert planned.count("La idea vuelve.") == 2
    assert board.chapters[-1].illustration.word_end == len(text.split())


def test_elliptical_pivot_modulates_the_next_image_instead_of_flashing_alone():
    text = (
        "La dureza parece la única salida. Pero no lo es. "
        "La amabilidad estratégica expone el problema con precisión."
    )
    units = split_illustrated_units("Amabilidad estratégica", text)

    assert not any(unit.texts == ["Pero no lo es."] for unit in units)
    assert any(
        unit.texts[:2] == [
            "Pero no lo es.",
            "La amabilidad estratégica expone el problema con precisión.",
        ]
        for unit in units
    )


def test_short_pivot_with_concrete_subject_keeps_its_own_image_unit():
    text = "La presidencia concentra poder. Sin embargo la red lo distribuye."
    units = split_illustrated_units("La red", text)

    assert len(units) == 2
    assert units[1].texts == ["Sin embargo la red lo distribuye."]


def test_plate_analysis_proposes_regions_but_requires_semantic_review(tmp_path):
    image = np.full((480, 270, 3), 238, dtype=np.uint8)
    cv2.rectangle(image, (18, 70), (154, 430), (22, 26, 31), -1)
    cv2.circle(image, (205, 170), 44, (204, 39, 82), -1, cv2.LINE_AA)
    path = tmp_path / "plate.png"
    assert cv2.imwrite(str(path), image)

    analysis = analyze_plate(path)
    assert analysis.status == "analyzed"
    assert analysis.width == 270 and analysis.height == 480
    assert analysis.palette
    assert len(analysis.focus_box) == 4
    assert analysis.overlay_regions and all(len(value) == 4 for value in analysis.overlay_regions)
    assert not analysis.semantic_summary
    assert not analysis.narrative_match
    assert not analysis.approved


def test_plate_review_survives_only_while_the_image_checksum_is_identical(tmp_path):
    path = tmp_path / "plate.png"
    assert cv2.imwrite(str(path), np.full((120, 80, 3), 210, dtype=np.uint8))
    reviewed = analyze_plate(path)
    reviewed.semantic_summary = "Una asamblea rodea una mesa vacía."
    reviewed.narrative_match = "Materializa la autoridad compartida."
    reviewed.must_show_coverage = ["autoridad compartida"]
    reviewed.must_avoid_clear = True
    reviewed.continuity_notes = "La mirada continúa hacia la derecha."
    reviewed.approved = True

    same = analyze_plate(path, reviewed)
    assert same.approved
    assert same.semantic_summary == reviewed.semantic_summary
    assert same.must_avoid_clear

    changed = np.full((120, 80, 3), 210, dtype=np.uint8)
    cv2.line(changed, (0, 0), (79, 119), (0, 0, 0), 6)
    assert cv2.imwrite(str(path), changed)
    replaced = analyze_plate(path, same)
    assert not replaced.approved
    assert not replaced.semantic_summary
    assert not replaced.must_show_coverage


def test_render_readiness_lists_every_missing_human_decision():
    board = build_storyboard("Otra arquitectura", "otra-arquitectura", NARRATION, 2, illustrated=True)
    problems = validate_illustrated_protocol(board, require_render_ready=True)

    assert any("dirección de imagen no aprobada" in value for value in problems)
    assert any("falta una placa analizada" in value for value in problems)
    assert any("correspondencia con la narración" in value for value in problems)
    assert any("illustrated_review_status" in value for value in problems)


def test_fully_reviewed_checksum_stable_direction_can_pass_the_render_gate(tmp_path):
    board = build_storyboard("Una imagen", "una-imagen", "La red distribuye poder.", 8, illustrated=True)
    chapter = board.chapters[0]
    image = np.full((480, 270, 3), 232, dtype=np.uint8)
    cv2.circle(image, (135, 210), 72, (52, 39, 120), -1, cv2.LINE_AA)
    plate = tmp_path / f"{chapter.id}.png"
    assert cv2.imwrite(str(plate), image)
    chapter.plate = str(plate)
    analyze_storyboard_plates(board)
    direction = chapter.illustration
    direction.direction_approved = True
    analysis = direction.plate_analysis
    analysis.semantic_summary = "Una red de personas distribuye decisiones."
    analysis.narrative_match = "La estructura visual reparte el centro de poder."
    analysis.must_show_coverage = list(direction.must_show)
    analysis.must_avoid_clear = True
    analysis.continuity_notes = "La mirada termina en el punto de salida del cuadro."
    analysis.approved = True
    board.illustrated_review_status = "approved"

    assert not validate_illustrated_protocol(board, require_render_ready=True)


def test_editing_narration_invalidates_the_existing_image_direction():
    board = build_storyboard("Una imagen", "una-imagen", "La red distribuye poder.", 8, illustrated=True)
    board.chapters[0].texts = ["La red concentra poder."]
    problems = validate_illustrated_protocol(board)

    assert any("la narración cambió" in value for value in problems)


def test_word_bound_timeline_uses_native_caption_boundaries():
    board = build_storyboard(
        "Una imagen", "una-imagen", "La red distribuye poder.", 8, illustrated=True,
    )
    chapter = board.chapters[0]
    words = [
        WordTiming(index * 0.4, index * 0.4 + 0.32, token)
        for index, token in enumerate("La red distribuye poder.".split())
    ]
    captions = [Caption(0, words[0].start, words[-1].end, "La red distribuye poder.", chapter.id, words)]
    timeline = bind_illustrated_timeline(board, captions)

    assert timeline["passed"]
    assert timeline["units"][0]["start_seconds"] == 0.0
    assert timeline["units"][0]["end_seconds"] == pytest.approx(words[-1].end)
    assert timeline["units"][0]["word_end"] == 4


def test_illustrated_scene_cut_uses_next_native_word_not_caption_padding():
    board = build_storyboard(
        "Dos ideas", "dos-ideas",
        "La presidencia concentra poder. Sin embargo la red lo distribuye.",
        8, illustrated=True,
    )
    assert len(board.chapters) == 2
    first_words = [WordTiming(0.2, 0.45, token) for token in board.chapters[0].texts[0].split()]
    second_tokens = board.chapters[1].texts[0].split()
    second_words = [WordTiming(3.4 + index * 0.3, 3.62 + index * 0.3, token) for index, token in enumerate(second_tokens)]
    captions = [
        Caption(0, 0.0, 3.1, " ".join(value.text for value in first_words), board.chapters[0].id, first_words),
        Caption(1, 3.2, 5.0, " ".join(value.text for value in second_words), board.chapters[1].id, second_words),
    ]
    ranges = scene_ranges(captions, board.chapters, duration=5.5)

    assert ranges[board.chapters[0].id][1] == 3.4
    assert ranges[board.chapters[1].id] == (3.4, 5.5)


def test_planned_graphics_are_invisible_before_their_exact_trigger():
    chapter = LegacyChapter(
        motif="network", graphic_cues=[{
            "id": "relation-01", "kind": "connection-path",
            "target_region": [0.15, 0.18, 0.82, 0.54],
        }],
        reveal_points={"graphic:relation-01:start": 0.6, "graphic:relation-01:end": 0.9},
    )
    before = _planned_graphics(chapter, 240, 135, 0.59)
    after = _planned_graphics(chapter, 240, 135, 0.72)

    assert not np.any(before)
    assert float(after.max()) > 0.5
    assert float(after.mean()) > 0.0005


def test_nested_illustrated_protocol_round_trips_through_storyboard_json(tmp_path):
    board = build_storyboard("Otra arquitectura", "otra-arquitectura", NARRATION, 2, illustrated=True)
    path = tmp_path / "board.json"
    write_json(path, asdict(board))
    loaded = load_storyboard(path)

    assert loaded.illustrated_protocol == 1
    assert loaded.chapters[0].illustration is not None
    assert loaded.chapters[0].illustration.image_brief == board.chapters[0].illustration.image_brief
