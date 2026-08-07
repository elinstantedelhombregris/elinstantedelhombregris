from __future__ import annotations

import json

from ascii_studio.editorial.adapt import adapt_for_reel, hook_candidates
from ascii_studio.editorial.relations import direct_fallback_relations, extract_relations
from ascii_studio.editorial.rhetoric import classify_rhetoric
from ascii_studio.storyboard.build import build_storyboard, partition
from ascii_studio.storyboard.schema import load_storyboard


def test_rhetoric_distinguishes_contrast_evidence_and_action():
    assert classify_rhetoric("Sin embargo, la confianza cambia el resultado.") == "contrast"
    assert classify_rhetoric("El estudio demostró una reducción del veinte por ciento.") == "evidence"
    assert classify_rhetoric("Empezá hoy y construí una red distinta.") == "call-to-action"
    assert classify_rhetoric("Todo es infraestructura. Sensibilidad como infraestructura, entonces.") == "definition"


def test_relations_make_causality_visible():
    relations = extract_relations(
        "La confianza reduce la fricción y permite cooperación.",
        ["CONFIANZA", "FRICCIÓN", "COOPERACIÓN"],
    )
    assert relations
    assert any(relation.kind in {"reduces", "enables"} for relation in relations)


def test_english_coordinated_verbs_keep_the_subject_and_nearest_object():
    anchors = ["TRUST", "PEOPLE", "FRICTION", "COOPERATION POSSIBLE"]
    relations = extract_relations(
        "Trust connects people, reduces friction, and makes cooperation possible.", anchors,
    )
    triples = {(value.source, value.target, value.kind) for value in relations}
    assert ("TRUST", "PEOPLE", "connects") in triples
    assert ("TRUST", "FRICTION", "reduces") in triples
    assert ("TRUST", "COOPERATION POSSIBLE", "enables") in triples


def test_fallback_relation_gets_an_editorial_direction():
    relations = extract_relations("La atención sostiene la sensibilidad.", ["ATENCIÓN", "SENSIBILIDAD"])
    directed = direct_fallback_relations(relations, "statement")
    assert directed[0].kind == "supports"
    assert directed[0].label == "SUPPORTS"


def test_automatic_storyboard_has_three_directed_shots_per_chapter():
    board = build_storyboard(
        "Confianza pública", "confianza-publica",
        "La confianza es una infraestructura. Sin embargo, la fricción la debilita. "
        "La confianza reduce la fricción y permite cooperación. Empezá por una promesa concreta.",
        6,
    )
    assert board.version == 4
    assert board.hook and board.cover_hook
    for chapter in board.chapters:
        assert chapter.archetype
        assert [shot.purpose for shot in chapter.shots] == ["establish", "explain", "transform"]
        assert chapter.shots[0].start == 0.0
        assert chapter.shots[-1].end == 1.0
        assert chapter.camera != ""
        assert chapter.world != "abstract-field"
        assert chapter.depth_layers >= 4
        assert chapter.lighting
        assert chapter.metamorphosis not in {"", "none", "reveal"}


def test_v2_storyboard_migrates_to_v3_defaults(tmp_path):
    payload = {
        "title": "T", "slug": "t", "thesis": "x", "keywords": [],
        "chapters": [{
            "id": "01-network", "label": "01 / NETWORK", "motif": "network",
            "keyword": "CONFIANZA", "texts": ["La confianza conecta."],
            "primary": "#fff", "secondary": "#aaa", "accent": "#777",
            "anchors": [{"label": "CONFIANZA", "role": "node"}],
        }],
    }
    path = tmp_path / "v2.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    board = load_storyboard(path)
    assert board.version == 2
    assert board.chapters[0].anchors == ["CONFIANZA"]
    assert board.chapters[0].relations == []


def test_reel_adaptation_is_bounded_and_ordered():
    text = " ".join(f"La oración número {i} explica una parte importante del sistema." for i in range(60))
    adapted = adapt_for_reel(text, "El sistema")
    assert 150 <= len(adapted.split()) <= 240
    numbers = [int(value) for value in __import__("re").findall(r"número (\d+)", adapted)]
    assert numbers == list(range(numbers[0], numbers[-1] + 1))
    assert hook_candidates("El sistema", adapted)


def test_hook_candidates_reject_dangling_cover_fragments():
    text = (
        "Sensibilidad como infraestructura, entonces. "
        "La sensibilidad es la infraestructura más profunda que tiene un país. "
        "Sin ella, las otras infraestructuras se construyen pero no se cuidan."
    )
    hooks = hook_candidates("Sensibilidad como infraestructura", text)
    assert set(hooks[:2]) == {
        "Sin ella, las otras infraestructuras se construyen pero no se cuidan",
        "La sensibilidad es la infraestructura más profunda que tiene un país",
    }
    assert all(not hook.endswith("entonces") for hook in hooks[:2])


def test_chapter_partition_balances_words_not_sentence_count():
    items = ["breve."] * 8 + [" ".join(["larga"] * 14) + "."] * 4
    chunks = partition(items, 4)
    counts = [sum(len(item.split()) for item in chunk) for chunk in chunks]
    assert len(chunks) == 4
    assert max(counts) - min(counts) <= 14


def test_social_length_storyboard_avoids_thin_chapters():
    text = " ".join(
        f"La sensibilidad construye una infraestructura pública y transforma la relación número {i}."
        for i in range(18)
    )
    board = build_storyboard("Sensibilidad como infraestructura", "sensibilidad", text, 8)
    counts = [sum(len(unit.split()) for unit in chapter.texts) for chapter in board.chapters]
    assert 5 <= len(board.chapters) <= 7
    assert min(counts) >= 20
    assert all(relation.kind != "relates" for chapter in board.chapters for relation in chapter.relations)
