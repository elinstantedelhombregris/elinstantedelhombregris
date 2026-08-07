import numpy as np
import pytest

from ascii_studio.render import glyphs, tokens

FIELD_FONT = "/Users/juanb/Library/Fonts/JetBrainsMono-Regular.ttf"
FULL_COVERAGE_FONT = "/System/Library/Fonts/Menlo.ttc"


@pytest.fixture(scope="module")
def atlas():
    return glyphs.build_atlas(FIELD_FONT, 9, 15, "cinematic")


@pytest.fixture(scope="module", params=["cinematic", "field"])
def atlas_by_set(request):
    """Production (`plata.json`) ships glyph_set="field", not "cinematic". Atlas
    integrity checks that are meaningful for either set must run against both, or
    the 58-glyph production atlas is never actually asserted to be well-formed."""
    return glyphs.build_atlas(FIELD_FONT, 9, 15, request.param)


def test_menlo_has_full_cinematic_coverage():
    """Menlo is the fallback precisely because it covers every candidate."""
    candidates = glyphs.GLYPH_SETS["cinematic"]
    assert glyphs.available_chars(FULL_COVERAGE_FONT, candidates) == candidates


def test_jetbrains_covers_all_but_the_white_circle():
    """JetBrains Mono lacks U+25CB only; the filter must drop it, not crash."""
    got = glyphs.available_chars(FIELD_FONT, glyphs.GLYPH_SETS["cinematic"])
    missing = set(glyphs.GLYPH_SETS["cinematic"]) - set(got)
    assert missing == {"○"}, missing


def test_ascii7_set_is_pure_ascii():
    assert all(ord(c) < 128 for c in glyphs.GLYPH_SETS["ascii7"])


def test_space_is_first_glyph(atlas_by_set):
    """Index 0 must be blank so an empty buffer maps to an empty screen."""
    atlas = atlas_by_set
    assert atlas.chars[0] == " "
    assert atlas.tiles[0].max() == 0.0


def test_atlas_shapes(atlas_by_set):
    atlas = atlas_by_set
    n = len(atlas.chars)
    assert atlas.tiles.shape == (n, 15, 9)
    assert atlas.sig.shape == (n, glyphs.SIG_H * glyphs.SIG_W)
    assert atlas.sig_norm.shape == (n,)


def test_tiles_are_normalised_coverage(atlas_by_set):
    atlas = atlas_by_set
    assert atlas.tiles.dtype == np.float32
    assert atlas.tiles.min() >= 0.0
    assert atlas.tiles.max() <= 1.0


def test_full_block_is_the_densest_glyph(atlas):
    """"field" has no "█" (the uniform shade blocks are excluded, see
    test_field_set_excludes_flat_shade_blocks), so this is cinematic-only by nature."""
    means = atlas.tiles.reshape(len(atlas.chars), -1).mean(axis=1)
    assert atlas.chars[int(means.argmax())] == "█"


def test_sig_norm_matches_sig(atlas_by_set):
    atlas = atlas_by_set
    assert np.allclose(atlas.sig_norm, (atlas.sig ** 2).sum(axis=1), atol=1e-4)


def test_glyphs_are_distinguishable(atlas_by_set):
    """No two glyphs may share a signature, or best-match becomes arbitrary."""
    atlas = atlas_by_set
    sigs = np.round(atlas.sig, 3)
    unique = np.unique(sigs, axis=0)
    assert unique.shape[0] == sigs.shape[0], "duplicate glyph signatures"


def test_horizontal_and_vertical_rules_differ(atlas):
    i_h = atlas.chars.index("─")
    i_v = atlas.chars.index("│")
    assert not np.allclose(atlas.sig[i_h], atlas.sig[i_v])


def test_atlas_knows_horizontal_and_vertical_stroke_orientation(atlas):
    horizontal = atlas.index("─")
    vertical = atlas.index("│")
    alignment = (
        atlas.orient_cos2[horizontal] * atlas.orient_cos2[vertical]
        + atlas.orient_sin2[horizontal] * atlas.orient_sin2[vertical]
    )
    assert atlas.orient_coherence[horizontal] > 0.5
    assert atlas.orient_coherence[vertical] > 0.5
    assert alignment < -0.8


def test_unavailable_chars_are_dropped():
    """A missing glyph must shrink the set, not crash."""
    got = glyphs.available_chars(FIELD_FONT, "●○AB")
    assert "A" in got and "B" in got and "●" in got
    assert "○" not in got


def test_full_block_fills_its_cell_completely(atlas):
    """A gappy full block is what made the v1 field look sparse."""
    tile = atlas.tiles[atlas.index("█")]
    assert tile.min() == 1.0, f"full block has holes, min={tile.min()}"


def test_shade_blocks_form_a_clean_tonal_ramp(atlas):
    """The shade ramp only exists in "cinematic" -- "field" drops "░▒▓█" entirely
    (see test_field_set_excludes_flat_shade_blocks) -- so this is cinematic-only
    by nature, not an oversight."""
    means = [float(atlas.tiles[atlas.index(c)].mean()) for c in "░▒▓█"]
    assert means == sorted(means)
    assert means[0] == pytest.approx(0.25, abs=0.01)
    assert means[-1] == pytest.approx(1.0, abs=0.01)


def test_field_sets_maximum_ink_is_limited():
    """Dropping the shade blocks caps how bright any single cell can be. This is a deliberate
    consequence of the fix for the 'flat blocks carpet the frame' bug -- pin it so it is visible."""
    atlas = glyphs.build_atlas(FIELD_FONT, 9, 15, "field")
    densest = atlas.tiles.reshape(len(atlas.chars), -1).mean(axis=1).max()
    assert 0.45 < densest < 0.70, densest


def test_half_blocks_split_the_cell(atlas):
    upper = atlas.tiles[atlas.index("▀")]
    half = upper.shape[0] // 2
    assert upper[:half].min() == 1.0
    assert upper[half:].max() == 0.0
    left = atlas.tiles[atlas.index("▌")]
    hw = left.shape[1] // 2
    assert left[:, :hw].min() == 1.0
    assert left[:, hw:].max() == 0.0


def test_box_rules_reach_the_cell_edges(atlas):
    """Rules must touch the edge or adjacent cells will not visually connect."""
    horizontal = atlas.tiles[atlas.index("─")]
    assert horizontal[:, 0].max() > 0.5 and horizontal[:, -1].max() > 0.5
    vertical = atlas.tiles[atlas.index("│")]
    assert vertical[0, :].max() > 0.5 and vertical[-1, :].max() > 0.5


def test_synthesis_adapts_to_a_different_cell_size():
    other = glyphs.build_atlas(FIELD_FONT, 12, 20, "cinematic")
    assert other.tiles.shape[1:] == (20, 12)
    assert other.tiles[other.index("█")].min() == 1.0


def test_font_glyphs_use_the_cell_generously(atlas):
    """Font-rendered glyphs must not be shrunk by a probe character that is synthesized."""
    dense = atlas.tiles[atlas.index("@")]
    rows = (dense.max(axis=1) > 0.15).sum()
    cols = (dense.max(axis=0) > 0.15).sum()
    assert rows >= dense.shape[0] - 4, f"only {rows} of {dense.shape[0]} rows used"
    assert cols >= dense.shape[1] - 2, f"only {cols} of {dense.shape[1]} cols used"


def test_field_set_excludes_flat_shade_blocks():
    """Uniform fills are the exact best match for smooth content, so they carpet the field."""
    field = set(glyphs.GLYPH_SETS["field"])
    assert not (field & set("░▒▓█")), "flat shade blocks must not be in the field set"
    assert set("▀▄▌▐") <= field, "half blocks encode edges and must stay"
    assert "@" in field and "─" in field


def test_box_junctions_have_no_notch_at_thick_strokes():
    """At thickness > 1 the arms alone leave a notch at the junction; the centre must be filled."""
    thick = glyphs.build_atlas(FIELD_FONT, 18, 30, "cinematic")
    cell_h, cell_w = 30, 18
    for char in "┌┐└┘├┤┬┴┼":
        tile = thick.tiles[thick.index(char)]
        r0, r1 = cell_h // 2 - 1, cell_h // 2 + 2
        c0, c1 = cell_w // 2 - 1, cell_w // 2 + 2
        centre = tile[r0:r1, c0:c1]
        assert centre.min() > 0.5, f"{char} has a notch at its junction: min={centre.min()}"
