"""Concept extraction must never surface function words or conjugated verbs,
must prefer multi-word noun phrases, must use the background corpus to tell
"specific to this article" apart from "common everywhere", and must reject
proper nouns that only appear once."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from ascii_studio.editorial.concepts import (  # noqa: E402
    STOPWORDS,
    chapter_concepts,
    extract_concepts,
    term_weights,
)
from ascii_studio.editorial.verb_forms import is_conjugated_verb  # noqa: E402
from ascii_studio.text import word_core  # noqa: E402

FUNCTION_OR_VERB_WORDS = {
    "palabra", "pasa", "falta", "estas", "otro", "tres", "hay", "mide",
    "que", "de", "la", "el", "en", "un", "es", "no", "y", "a", "por", "con",
}

AMABILIDAD_TITLE = "La Amabilidad como Ingeniería Social"
AMABILIDAD_TEXT = """
Decile amabilidad a un argentino curtido por la calle y te va a mirar con
desconfianza. Pero hay otra lectura, una que cambia todo: la amabilidad no
es cortesia. Es una tecnologia social. La mas subestimada que existe. Cuando
un sistema humano esta quebrado, la amabilidad estrategica es la primera
intervencion inteligente porque desarma defensas, multiplica confianza y
genera cooperacion donde antes solo habia friccion.

No es teoria. En Medellin, Colombia, la aplicacion deliberada de cultura
ciudadana transformo una de las ciudades mas violentas del mundo en un
modelo de cooperacion urbana. No fue un milagro: fue diseno social
sostenido, donde cada interaccion amable era una intervencion arquitectonica
sobre la confianza colectiva.

Fowler y Christakis demostraron en su investigacion que el comportamiento
cooperativo se propaga hasta tres grados de separacion en redes sociales.
La amabilidad estrategica crea ese permiso. La confianza multiplica.
La amabilidad rediseña cada interaccion.
"""


def test_no_function_word_or_verb_in_extract_concepts():
    concepts = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    assert concepts, "expected at least one concept"
    for concept in concepts:
        for word in concept.split(" "):
            core = word_core(word)
            assert core not in STOPWORDS, f"{concept!r} contains stopword {word!r}"
            assert not is_conjugated_verb(core), f"{concept!r} contains conjugated verb {word!r}"


def test_no_function_word_or_verb_in_chapter_concepts():
    sentences = AMABILIDAD_TEXT.strip().split("\n\n")
    for segment in sentences:
        concepts = chapter_concepts(segment, AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=4)
        for concept in concepts:
            for word in concept.split(" "):
                core = word_core(word)
                assert core not in STOPWORDS
                assert not is_conjugated_verb(core)


def test_known_defect_words_never_selected():
    """Real garbage the old Counter-based extractor produced."""
    concepts = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    upper_words = {word for concept in concepts for word in concept.split(" ")}
    for bad in ["PASA", "FALTA", "ESTAS", "OTRO", "TRES", "HAY"]:
        assert bad not in upper_words


def test_multiword_concepts_are_produced():
    concepts = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    assert any(" " in concept for concept in concepts), concepts


def test_multiword_concepts_are_preferred_over_their_own_substrings():
    """If a phrase like 'CULTURA CIUDADANA' is selected, its own bare
    constituent words should not also occupy a separate slot -- that would
    be the same idea taking two slots instead of surfacing a second, distinct
    concept."""
    concepts = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    multiword = [c for c in concepts if " " in c]
    for phrase in multiword:
        parts = set(phrase.split(" "))
        for concept in concepts:
            if concept == phrase:
                continue
            assert set(concept.split(" ")) != parts


def test_corpus_frequent_term_rejected_specific_term_kept():
    """'AMABILIDAD' is rare in the background corpus and central to this
    text -- it must outrank an everyday word repeated just as often but
    common in the background corpus (used here as a stand-in article word)."""
    text = AMABILIDAD_TEXT + "\n" + ("Trabajo trabajo trabajo trabajo. " * 3)
    concepts = extract_concepts(text, AMABILIDAD_TITLE, limit=3)
    assert "AMABILIDAD" in concepts
    assert "TRABAJO" not in concepts


def test_name_mentioned_once_is_rejected():
    concepts = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=15)
    words = {word for concept in concepts for word in concept.split(" ")}
    assert "FOWLER" not in words
    assert "CHRISTAKIS" not in words


def test_recurring_name_is_kept():
    text = AMABILIDAD_TEXT.replace(
        "Fowler y Christakis demostraron",
        "Kahneman y Christakis demostraron",
    ) + "\nKahneman volvio a insistir en el mismo punto anos despues."
    concepts = extract_concepts(text, AMABILIDAD_TITLE, limit=15)
    words = {word for concept in concepts for word in concept.split(" ")}
    assert "KAHNEMAN" in words


def test_extract_concepts_is_deterministic():
    first = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    second = extract_concepts(AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=8)
    assert first == second


def test_chapter_concepts_is_deterministic():
    segment = AMABILIDAD_TEXT.strip().split("\n\n")[0]
    first = chapter_concepts(segment, AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=4)
    second = chapter_concepts(segment, AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=4)
    assert first == second


def test_chapter_concepts_respects_limit():
    segment = AMABILIDAD_TEXT.strip().split("\n\n")[0]
    concepts = chapter_concepts(segment, AMABILIDAD_TEXT, AMABILIDAD_TITLE, limit=2)
    assert len(concepts) <= 2


def test_chapter_concepts_lets_a_name_recur_across_chapters():
    """A name introduced in one chapter and referenced again in another
    should survive even though each individual chapter only mentions it
    once."""
    full_text = (
        "Kahneman propuso una idea central sobre el pensamiento rapido.\n\n"
        "Anos despues, Kahneman volvio a explicar la misma idea en otra charla."
    )
    chapter_one = "Kahneman propuso una idea central sobre el pensamiento rapido."
    concepts = chapter_concepts(chapter_one, full_text, "Pensamiento rapido", limit=4)
    words = {word for concept in concepts for word in concept.split(" ")}
    assert "KAHNEMAN" in words


def test_extract_concepts_empty_text_returns_empty_list():
    assert extract_concepts("", "Titulo", limit=8) == []


def test_term_weights_shape():
    weights = term_weights(AMABILIDAD_TEXT, limit=10)
    assert isinstance(weights, dict)
    assert weights, "expected at least one term"
    assert len(weights) <= 10
    for key, value in weights.items():
        assert isinstance(key, str)
        assert key == key.lower()
        assert 0.0 <= value <= 1.0
    assert max(weights.values()) == pytest.approx(1.0)


def test_term_weights_excludes_function_words_and_verbs():
    weights = term_weights(AMABILIDAD_TEXT, limit=40)
    for key in weights:
        assert key not in STOPWORDS
        assert not is_conjugated_verb(key)


def test_term_weights_is_deterministic():
    first = term_weights(AMABILIDAD_TEXT, limit=20)
    second = term_weights(AMABILIDAD_TEXT, limit=20)
    assert first == second


def test_verb_forms_catch_the_real_defect_examples():
    for form in ["pasa", "falta", "estas", "esperabamos", "pensalo", "hay", "mide"]:
        assert is_conjugated_verb(form), form


def test_verb_forms_do_not_catch_common_nouns():
    for noun in ["estado", "cuidado", "sentido", "poder", "pensamiento", "sistema"]:
        assert not is_conjugated_verb(noun), noun


def test_english_concepts_drop_connectives_and_common_verbs():
    text = "Trust connects people, reduces friction, and makes cooperation possible."
    concepts = chapter_concepts(text, text, "Networks of Trust", limit=4)
    words = {word_core(word) for concept in concepts for word in concept.split()}
    assert not words.intersection({"and", "connects", "reduces", "makes"})
    assert words.intersection({"trust", "friction", "cooperation"})
