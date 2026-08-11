import numpy as np
import pytest

from ascii_studio.render import stencil, tokens

FONT = tokens.load_look("plata").field_font
SHAPE = (180, 320)  # a stage-zone-ish aspect, small enough to keep tests fast


# -- text_mask ---------------------------------------------------------------


def test_text_mask_shape_dtype_and_range():
    mask = stencil.text_mask("CONFIANZA", SHAPE, FONT)
    assert mask.shape == SHAPE
    assert mask.dtype == np.float32
    assert float(mask.min()) >= 0.0
    assert float(mask.max()) <= 1.0


def test_text_mask_has_real_ink():
    mask = stencil.text_mask("CONFIANZA", SHAPE, FONT)
    assert float(mask.max()) > 0.5
    coverage = float((mask > 0.5).mean())
    assert 0.02 < coverage < 0.9, f"implausible ink coverage: {coverage:.2%}"


def test_text_mask_empty_text_is_all_zero():
    mask = stencil.text_mask("", SHAPE, FONT)
    assert float(mask.max()) == 0.0
    mask = stencil.text_mask("   ", SHAPE, FONT)
    assert float(mask.max()) == 0.0


def test_text_mask_is_centred():
    """Ink mass should sit roughly in the middle of the buffer, not hug an edge."""
    mask = stencil.text_mask("RED", SHAPE, FONT)
    ys, xs = np.nonzero(mask > 0.5)
    assert ys.size and xs.size
    cy, cx = ys.mean(), xs.mean()
    h, w = SHAPE
    assert abs(cy - h / 2) < h * 0.25
    assert abs(cx - w / 2) < w * 0.25


def test_text_mask_higher_weight_is_bolder():
    thin = stencil.text_mask("EVIDENCIA", SHAPE, FONT, weight=0.0)
    bold = stencil.text_mask("EVIDENCIA", SHAPE, FONT, weight=1.0)
    assert float((bold > 0.5).sum()) >= float((thin > 0.5).sum())


def test_text_mask_is_deterministic():
    a = stencil.text_mask("HORIZONTE", SHAPE, FONT)
    b = stencil.text_mask("HORIZONTE", SHAPE, FONT)
    assert np.array_equal(a, b)


def test_text_mask_fits_a_long_word_without_crashing():
    mask = stencil.text_mask("SUPERCALIFRAGILISTICOEXPIALIDOSO", SHAPE, FONT)
    assert mask.shape == SHAPE
    assert float(mask.max()) > 0.0


def test_text_mask_handles_a_tiny_shape():
    mask = stencil.text_mask("K", (10, 12), FONT)
    assert mask.shape == (10, 12)


# -- stencil_field: inside / knockout -----------------------------------------


def _field_and_mask():
    rng = np.random.default_rng(7)
    field = rng.uniform(0.2, 1.0, SHAPE).astype(np.float32)
    mask = stencil.text_mask("RED", SHAPE, FONT)
    return field, mask


def test_stencil_inside_matches_field_times_mask():
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="inside")
    assert np.allclose(out, field * mask)
    assert out.dtype == np.float32


def test_stencil_inside_is_zero_outside_the_letters():
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="inside")
    assert np.all(out[mask < 1e-6] == 0.0)


def test_stencil_knockout_matches_field_times_inverse_mask():
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="knockout")
    assert np.allclose(out, field * (1.0 - mask))


def test_stencil_knockout_is_zero_inside_the_letters():
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="knockout")
    assert np.all(out[mask > 0.999] == 0.0)


def test_stencil_inside_and_knockout_are_complementary_coverage():
    """Every pixel is either (mostly) governed by inside or by knockout -- the
    two modes partition the same field, they don't both show or both hide the
    same region."""
    field, mask = _field_and_mask()
    inside = stencil.stencil_field(field, mask, mode="inside")
    knockout = stencil.stencil_field(field, mask, mode="knockout")
    assert np.allclose(inside + knockout, field)


def test_stencil_unknown_mode_raises():
    field, mask = _field_and_mask()
    with pytest.raises(ValueError, match="inside"):
        stencil.stencil_field(field, mask, mode="not-a-mode")


def test_stencil_shape_mismatch_raises():
    field, mask = _field_and_mask()
    with pytest.raises(ValueError):
        stencil.stencil_field(field, mask[:-1], mode="inside")


# -- stencil_field: text_fill --------------------------------------------------

ESSAY = (
    "No fue un milagro. Fue una infraestructura construida en silencio, "
    "linea por linea, decision por decision, hasta que dejo de necesitar "
    "explicacion. La confianza no se declara: se deposita, se usa y recien "
    "entonces se nota si estaba bien construida."
)


def test_text_fill_requires_text_and_font():
    field, mask = _field_and_mask()
    with pytest.raises(ValueError):
        stencil.stencil_field(field, mask, mode="text_fill")
    with pytest.raises(ValueError):
        stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY)


def test_text_fill_is_zero_outside_the_letters():
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=1.0)
    assert np.all(out[mask < 1e-6] == 0.0)


def test_text_fill_more_reveal_means_more_ink():
    field, mask = _field_and_mask()
    early = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=0.2)
    late = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=1.0)
    assert float((late > 0.05).sum()) > float((early > 0.05).sum())


def test_text_fill_at_zero_reveal_is_not_fully_blank():
    """reveal=0 still types in at least the first row -- a stencil that starts
    completely blank has nothing for the viewer to read as 'building in'."""
    field, mask = _field_and_mask()
    out = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=0.0)
    assert float(out.max()) > 0.0


def test_text_fill_differs_from_a_flat_inside_stencil():
    """The whole point of the stronger variant: it must not just reduce to the
    same output as mode='inside' once masked."""
    field, mask = _field_and_mask()
    inside = stencil.stencil_field(field, mask, mode="inside")
    filled = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=1.0)
    assert not np.allclose(inside, filled)


def test_text_fill_is_deterministic():
    field, mask = _field_and_mask()
    a = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=0.6)
    b = stencil.stencil_field(field, mask, mode="text_fill", text=ESSAY, font_path=FONT, reveal=0.6)
    assert np.array_equal(a, b)
