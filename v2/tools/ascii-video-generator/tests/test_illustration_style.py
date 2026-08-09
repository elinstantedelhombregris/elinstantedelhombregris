import cv2
import numpy as np

from ascii_studio.storyboard.build import build_storyboard
from ascii_studio.storyboard.illustration_style import (
    DEFAULT_ILLUSTRATION_STYLE,
    assess_plate_style,
    generation_prompt,
    negative_prompt,
    style_contract,
)
from ascii_studio.storyboard.illustrated import illustration_briefs


def _engraved_reference() -> np.ndarray:
    image = np.full((480, 270, 3), (224, 190, 151), dtype=np.uint8)
    for y in range(0, 480, 10):
        cv2.line(image, (0, y), (269, y), (18, 16, 12), 3, cv2.LINE_AA)
    for x in range(0, 270, 37):
        cv2.line(image, (x, 0), (x, 479), (18, 16, 12), 1, cv2.LINE_AA)
    return image


def test_grabado_civico_contract_matches_reference_print_traits():
    score, checks, metrics = assess_plate_style(_engraved_reference())

    assert score == 1.0
    assert all(checks.values())
    assert 0.20 <= metrics["edge_density"] <= 0.34
    assert 0.30 <= metrics["ink_fraction"] <= 0.65


def test_soft_flat_digital_plate_is_rejected_by_style_gate():
    flat = np.full((480, 270, 3), (184, 166, 142), dtype=np.uint8)
    cv2.circle(flat, (135, 210), 75, (110, 82, 136), -1, cv2.LINE_AA)

    score, checks, _metrics = assess_plate_style(flat)

    assert score < 0.82
    assert not checks["line_density"]
    assert not checks["engraved_contrast"]


def test_style_contract_and_prompts_are_explicit_and_text_free():
    contract = style_contract(DEFAULT_ILLUSTRATION_STYLE)
    prompt = generation_prompt(
        proposition="La comunidad distribuye autoridad.",
        visual_thesis="Una red reemplaza el centro único.",
        must_show=["comunidad", "autoridad distribuida"],
        continuity_in="El trono se fragmenta en nodos.",
    )
    avoid = negative_prompt()

    assert contract["name"] == "Grabado cívico alegórico"
    assert "xilografía" in prompt
    assert "vertical 9:16" in prompt
    assert "sin texto incrustado" in prompt
    assert "fotorrealismo" in avoid
    assert "logotipos" in avoid


def test_every_illustration_brief_exports_the_same_named_style_contract():
    board = build_storyboard(
        "Autoridad distribuida", "autoridad-distribuida",
        "La presidencia concentra poder. Sin embargo la red lo distribuye.",
        8, illustrated=True,
    )
    payload = illustration_briefs(board)

    assert payload["illustration_style"] == DEFAULT_ILLUSTRATION_STYLE
    assert payload["style_contract"]["id"] == DEFAULT_ILLUSTRATION_STYLE
    assert all(unit["generation_prompt"] for unit in payload["units"])
    assert all(unit["negative_prompt"] for unit in payload["units"])
