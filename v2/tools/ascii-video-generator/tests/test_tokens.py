from pathlib import Path

import numpy as np
import pytest

from ascii_studio.render import tokens


def test_plata_loads():
    look = tokens.load_look("plata")
    assert look.name == "plata"
    assert look.background == "#050607"
    assert look.accent == "#7D5BDE"


def test_plata_grid_divides_1080x1920_exactly():
    """Global constraint: 120x128 cells at 9x15px must tile 1080x1920 with no remainder."""
    look = tokens.load_look("plata")
    assert 1080 % look.cell_w == 0
    assert 1920 % look.cell_h == 0
    assert 1080 // look.cell_w == 120
    assert 1920 // look.cell_h == 128


def test_fonts_exist_on_disk():
    look = tokens.load_look("plata")
    assert Path(look.field_font).exists(), look.field_font
    assert Path(look.ui_font).exists(), look.ui_font
    assert "JetBrainsMono" in look.field_font


def test_ramp_is_monotonically_lighter():
    from ascii_studio.render import color
    look = tokens.load_look("plata")
    lightness = color.srgb_to_oklab(look.ramp_rgb())[:, 0]
    assert np.all(np.diff(lightness) > 0), lightness


def test_accent_and_background_rgb():
    look = tokens.load_look("plata")
    assert look.accent_rgb().shape == (3,)
    assert np.allclose(look.background_rgb(), [5 / 255, 6 / 255, 7 / 255], atol=1e-4)


def test_look_is_immutable():
    look = tokens.load_look("plata")
    with pytest.raises(Exception):
        look.cell_w = 12


def test_unknown_look_raises():
    with pytest.raises(FileNotFoundError):
        tokens.load_look("does-not-exist")


def test_six_production_looks_load_with_distinct_palettes():
    names = ["plata", "terminal", "blueprint", "archive", "manifesto", "nocturne"]
    looks = [tokens.load_look(name) for name in names]
    assert len({tuple(look.background_rgb()) for look in looks}) == len(names)
    assert all(len(look.ramp) >= 5 and look.glyph_set for look in looks)


def test_field_scale_comes_only_from_the_look_file():
    """field_scale must have no dataclass default: looks/*.json is the single source."""
    import dataclasses
    field = {f.name: f for f in dataclasses.fields(tokens.Look)}["field_scale"]
    assert field.default is dataclasses.MISSING, "field_scale must not have a code-side default"
    assert tokens.load_look("plata").field_scale == 4


def test_tone_floor_comes_only_from_the_look_file():
    """tone_floor must have no dataclass default: looks/*.json is the single source."""
    import dataclasses
    field = {f.name: f for f in dataclasses.fields(tokens.Look)}["tone_floor"]
    assert field.default is dataclasses.MISSING, "tone_floor must not have a code-side default"
    assert tokens.load_look("plata").tone_floor == 0.55


@pytest.mark.parametrize("field_name, expected", [
    ("halation_threshold", 0.55),
    ("halation_sigma", 6.0),
    ("dither_amplitude", 0.18),
])
def test_new_tokens_come_only_from_the_look_file(field_name, expected):
    """halation_threshold, halation_sigma and dither_amplitude used to be hardcoded in
    render/post.py and render/asciify.py. Like every other Look field, looks/*.json must
    be the single source: no dataclass default."""
    import dataclasses
    field = {f.name: f for f in dataclasses.fields(tokens.Look)}[field_name]
    assert field.default is dataclasses.MISSING, f"{field_name} must not have a code-side default"
    assert getattr(tokens.load_look("plata"), field_name) == expected
