"""Pins v1 behaviour so the Phase 1b port can be proven faithful.

These tests must stay green through every migration task. If one fails after a move,
the move was not verbatim.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
PYTHON = "/opt/anaconda3/bin/python3"
FIXTURE = ROOT / "tests" / "fixtures" / "sample-article.md"
GOLDEN = ROOT / "tests" / "fixtures" / "golden"
GOLDEN_SYNC = ROOT / "tests" / "fixtures" / "golden-sync"

# Karaoke/word-boundary tokens that are punctuation-only and must never appear
# as standalone timed words. v1 was patched to discard these on purpose.
PUNCTUATION_ONLY_TOKENS = {"—", "–", '"', "-", "#"}


def _run_brief(out_dir: Path) -> None:
    subprocess.run(
        [PYTHON, str(ROOT / "scripts" / "render_cinematic_ascii_video.py"),
         "--input", str(FIXTURE), "--out", str(out_dir), "--brief-only"],
        check=True, capture_output=True, text=True,
    )


def _run_sync(out_dir: Path) -> None:
    subprocess.run(
        [PYTHON, str(ROOT / "scripts" / "render_cinematic_ascii_video.py"),
         "--input", str(FIXTURE), "--out", str(out_dir),
         "--tts", "none", "--render-seconds", "2",
         "--width", "540", "--height", "960", "--fps", "4", "--skip-upload"],
        check=True, capture_output=True, text=True,
    )


@pytest.fixture(scope="module")
def produced(tmp_path_factory) -> Path:
    out = tmp_path_factory.mktemp("charz")
    _run_brief(out)
    return out


@pytest.fixture(scope="module")
def produced_sync(tmp_path_factory) -> Path:
    """Runs v1 with --tts none, producing captions, word timings, and audio.

    This is the fragile half of the renderer: Edge WordBoundary handling,
    discarding punctuation-only tokens, splitting on colons/dashes in numbers,
    and Spanish number/date normalization all live in this path. Task 3 moves
    this code verbatim, so these goldens must catch any drift.
    """
    out = tmp_path_factory.mktemp("charz_sync")
    _run_sync(out)
    return out


def _one(directory: Path, suffix: str) -> Path:
    matches = sorted(directory.glob(f"*{suffix}"))
    assert matches, f"no *{suffix} in {directory}"
    return matches[0]


def _load(directory: Path, suffix: str) -> dict:
    matches = sorted(directory.glob(f"*{suffix}"))
    assert matches, f"no *{suffix} in {directory}"
    return json.loads(matches[0].read_text(encoding="utf-8"))


def test_storyboard_preserves_golden_narration_and_adds_v4_cinema_direction(produced):
    actual = _load(produced, "-storyboard.json")
    golden = _load(GOLDEN, "-storyboard.json")
    assert actual["title"] == golden["title"]
    assert actual["slug"] == golden["slug"]
    assert [text for chapter in actual["chapters"] for text in chapter["texts"]] == [
        text for chapter in golden["chapters"] for text in chapter["texts"]
    ]
    assert actual["version"] == 4
    assert actual["hook"] and actual["cover_hook"] and actual["look"]
    assert all(len(chapter["shots"]) >= 3 for chapter in actual["chapters"])
    assert all(chapter["archetype"] and chapter["rhetoric"] for chapter in actual["chapters"])
    assert all(chapter["world"] and chapter["depth_layers"] >= 4 for chapter in actual["chapters"])


def test_brief_preserves_golden_identity_and_exposes_direction(produced):
    actual = _load(produced, "-brief.json")
    golden = _load(GOLDEN, "-brief.json")
    assert actual["title"] == golden["title"]
    assert actual["slug"] == golden["slug"]
    assert actual["chapter_count"] == golden["chapter_count"]
    assert actual["hook"] and actual["cover_hook"]
    assert len(actual["archetypes"]) == actual["chapter_count"]
    assert all(len(chapter["shots"]) >= 3 for chapter in actual["art_direction"])


def test_storyboard_chapter_count_is_stable(produced):
    chapters = _load(produced, "-storyboard.json")["chapters"]
    assert 4 <= len(chapters) <= 8


def test_number_normalisation_is_preserved():
    """The grouped-thousands and dash-range fixes must survive the port.

    Scope note: `normalize_spoken_numbers` converts digits to Spanish words and nothing
    else -- it leaves the range dash in place ('dos mil uno-dos mil tres'). Stripping the
    dash happens downstream in `caption_text`, which is asserted separately below. An
    earlier version of this test asserted the dash was gone here and failed for that
    reason, not because the port regressed.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    spoken = normalize_spoken_numbers("entre 2001-2003 hubo 298.000 casos")
    assert "298.000" not in spoken, "grouped thousands must not survive as digits"
    assert "2001" not in spoken and "2003" not in spoken, "range endpoints must both convert"
    assert "dos mil uno" in spoken and "dos mil tres" in spoken
    assert "doscientos noventa y ocho mil" in spoken


def test_caption_text_speaks_the_range_dash():
    """A numeric range must read as 'X a Y', never leave a dash in the karaoke layer.

    Pass RAW text. `caption_text` normalises internally, and its digit-flanked dash rule
    `(?<=\\d)[-](?=\\d)` only fires while the digits are still digits. Pre-normalising the
    input first (as an earlier version of this test did) converts them to words, the rule
    never fires, and the test passes even with the rule deleted.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    visible = caption_text("entre 2001-2003 hubo casos")
    assert "-" not in visible, visible
    assert "dos mil uno a dos mil tres" in visible, visible


def test_caption_text_turns_em_dashes_into_a_comma_pause():
    """DEFECT 1 fix: em dashes used to be deleted outright, which read the two
    clauses as one run-on breath with no pause in the synthesized voice. They
    now become a comma -- attached to the preceding word so Edge TTS still
    gets exactly one WordBoundary per token (no standalone dash, no orphan
    karaoke highlight) but the voice actually breathes where the dash was.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    visible = caption_text("la ciudad — la confianza")
    assert "—" not in visible
    assert visible.split() == ["la", "ciudad,", "la", "confianza"]


def test_srt_matches_golden(produced_sync):
    produced_text = _one(produced_sync, ".srt").read_text(encoding="utf-8")
    golden_text = _one(GOLDEN_SYNC, ".srt").read_text(encoding="utf-8")
    assert produced_text == golden_text


def test_vtt_matches_golden(produced_sync):
    produced_text = _one(produced_sync, ".vtt").read_text(encoding="utf-8")
    golden_text = _one(GOLDEN_SYNC, ".vtt").read_text(encoding="utf-8")
    assert produced_text == golden_text


def test_word_timings_match_golden(produced_sync):
    actual = _load(produced_sync, "-word-timings.json")
    golden = _load(GOLDEN_SYNC, "-word-timings.json")
    # Editorially improved word-balanced chapters may move an unchanged
    # caption across a section boundary.  Pin every spoken token and timestamp,
    # while treating the art-direction section as intentionally evolvable.
    for payload in (actual, golden):
        for caption in payload["captions"]:
            caption.pop("section", None)
    assert actual == golden


def test_every_caption_word_has_a_timing(produced_sync):
    """v1's own sync-QA invariant (validate_caption_sync): for every caption,
    the number of visible caption tokens must equal the number of per-word
    timings, or the karaoke captions and the spoken audio drift apart.
    """
    data = _load(produced_sync, "-word-timings.json")
    for caption in data["captions"]:
        visible_tokens = caption["text"].split()
        assert len(visible_tokens) == len(caption["words"]), (
            f"caption {caption['index']}: {len(visible_tokens)} visible tokens, "
            f"{len(caption['words'])} timed words: {caption['text']!r}"
        )


def test_no_punctuation_only_karaoke_tokens(produced_sync):
    """v1 was patched to discard WordBoundary events whose text is nothing but
    punctuation (e.g. a standalone em/en dash, a stray quote, or the '#' token
    from markdown headings) so they never show up as timed karaoke words.
    """
    data = _load(produced_sync, "-word-timings.json")
    offending = [w["text"] for w in data["words"] if w["text"] in PUNCTUATION_ONLY_TOKENS]
    assert not offending, f"punctuation-only tokens leaked into word timings: {offending}"


def test_grouped_thousands_and_dash_ranges_are_spoken(produced_sync):
    """The text actually handed to the TTS engine (voice_script, passed into
    synthesize_voice in render_cinematic_ascii_video.py) must never contain
    raw grouped-thousands numerals or a raw numeric dash range: both must have
    already been converted to spoken Spanish by normalize_spoken_numbers /
    caption_text before synthesis, or Edge TTS will mispronounce them.

    Determined by reading render_cinematic_ascii_video.py: `script` is built
    from caption_text(...) (which calls normalize_spoken_numbers), and
    `voice_script = performance_script(script, ...)` is what gets passed to
    synthesize_voice(). So *-voice-performance-script.txt, not *-script.txt,
    is the TTS-bound text (performance_script only affects pacing/pauses, not
    numbers). Both files happen to carry the already-normalized text here
    since voice_script derives from script, but voice-performance-script.txt
    is the one that is authoritative for what the TTS engine receives.
    """
    voice_script = _one(produced_sync, "-voice-performance-script.txt").read_text(encoding="utf-8")
    assert "298.000" not in voice_script
    assert "2001-2003" not in voice_script


def test_legacy_storyboards_with_a_retired_field_still_load(tmp_path):
    """Storyboards saved before a Chapter field was retired must not fail to load
    just because they still carry the old, now-unknown key.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.storyboard.schema import load_storyboard
    payload = {
        "title": "T", "slug": "t", "thesis": "th", "keywords": [],
        "chapters": [{
            "id": "01-network", "label": "01 / NETWORK", "motif": "network",
            "keyword": "K", "texts": ["uno"], "primary": "#7dd5c2",
            "secondary": "#e6bb63", "accent": "#edf4ef", "anchors": ["K"],
            "metaphor": "m", "seed": 11, "density": 0.6, "motion": 0.5,
            "composition": "mesh", "some_retired_field": True,
        }],
    }
    path = tmp_path / "sb.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    board = load_storyboard(path)
    assert board.chapters[0].id == "01-network"
    assert not hasattr(board.chapters[0], "some_retired_field")


def test_punctuation_tokens_are_not_karaoke_words():
    """Em dashes and bullet hyphens must never become highlighted words."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    assert "—" not in caption_text("la ciudad — la confianza")


def test_caption_text_turns_parentheses_into_a_comma_pause():
    """Same reasoning as the em-dash fix: an aside in parens must not be read
    literally, and must not add a standalone '(' / ')' karaoke token."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    visible = caption_text("Esto (una aclaracion) sigue.")
    assert "(" not in visible and ")" not in visible
    assert visible == "Esto, una aclaracion, sigue."


def test_caption_text_does_not_leave_a_comma_before_sentence_end():
    """A parenthetical/dash that lands right before a sentence end must not
    leave 'word, .' behind -- the comma collapses into the period."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    visible = caption_text("publicada en PNAS (2010) que el comportamiento.")
    assert ",." not in visible
    assert "dos mil diez" in visible


def test_semicolons_and_ellipses_survive_caption_text_unmodified():
    """Semicolons already get a pacing pause downstream in `performance_script`
    (its `([:;])\\s+` rule); ellipses now do too (DEFECT 1 review). Neither
    needs any change in `caption_text` itself -- both already read naturally
    and never produce a standalone karaoke token."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    assert caption_text("Frase uno; frase dos.") == "Frase uno; frase dos."
    assert caption_text("Una idea… y otra.") == "Una idea… y otra."


def test_performance_script_pauses_on_ellipsis():
    """DEFECT 1 review: '…' used to have no pacing break at all (only literal
    '.', '!', '?' triggered one), so a hanging-thought ellipsis ran straight
    into the next sentence with no breath."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import performance_script
    voiced = performance_script("Una idea… y otra idea.", "editorial")
    assert "…\n" in voiced


def test_caption_text_speaks_range_dash_still_wins_over_pause_dash():
    """Guard against the em-dash-to-comma rule swallowing the digit-flanked
    numeric-range rule, which must still run first and win."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text
    visible = caption_text("entre 2001—2003 hubo casos")
    assert "—" not in visible and "," not in visible
    assert "dos mil uno a dos mil tres" in visible, visible


def test_split_visible_caption_words_never_ends_on_a_function_word():
    """DEFECT 2: caption segmentation must be clause-aware. Reproduces the
    reported bug verbatim -- the old greedy character-fill cut this exact
    sentence right after 'con' (a preposition), orphaning 'desconfianza.' as
    its own sub-second caption.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.speech.captions import caption_text, split_visible_caption_words
    from ascii_studio.text import is_function_word
    import re as _re
    text = caption_text(
        "Decile amabilidad a un argentino curtido por la calle y te va a mirar "
        "con desconfianza."
    )
    chunks = split_visible_caption_words(_re.findall(r"\S+", text))
    assert len(chunks) >= 2, chunks
    for chunk in chunks[:-1]:
        assert not is_function_word(chunk[-1]), chunk
    assert all(len(chunk) >= 3 for chunk in chunks), chunks


def test_split_visible_caption_words_keeps_spoken_numbers_intact():
    """A caption boundary must never fall inside a multi-word spoken-out
    number (e.g. 'doscientos noventa' / 'y ocho mil' reads as a torn number).
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    from ascii_studio.speech.captions import caption_text, split_visible_caption_words
    from ascii_studio.text import word_core
    import re as _re
    text = caption_text(normalize_spoken_numbers(
        "la violencia bajo en un 298.000 por ciento durante ese periodo"
    ))
    chunks = split_visible_caption_words(_re.findall(r"\S+", text))
    owner = {
        chunk_index
        for chunk_index, chunk in enumerate(chunks)
        for word in chunk
        if word_core(word) in {"noventa", "ocho"}
    }
    assert len(owner) == 1, chunks  # "noventa" and "ocho" must land in the same caption


def test_colon_reference_splits_into_tokens():
    """'17:21' must produce a visible token boundary so Edge's word events stay 1:1.

    The split happens in `caption_text`, not in `normalize_spoken_numbers` -- by the time
    the caption layer sees it the reference already reads 'diecisiete:veintiuno', and the
    colon is what has to gain a boundary.
    """
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    from ascii_studio.speech.captions import caption_text
    visible = caption_text(normalize_spoken_numbers("ver 17:21 ahora"))
    assert "diecisiete: veintiuno" in visible, visible
    assert visible.split().count("diecisiete:") == 1


def test_percentage_and_year_normalisation():
    sys.path.insert(0, str(ROOT / "scripts"))
    from ascii_studio.editorial.script import normalize_spoken_numbers
    out = normalize_spoken_numbers("creció 25 por ciento en 2003")
    assert "2003" not in out or "dos mil tres" in out
