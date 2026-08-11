import numpy as np
import pytest
from PIL import Image

from ascii_studio.render import canvas, tokens, typography
from ascii_studio.storyboard.schema import Caption, WordTiming


@pytest.fixture(scope="module")
def look():
    return tokens.load_look("plata")


@pytest.fixture(scope="module")
def grid(look):
    return canvas.make_grid(1080, 1920, look)


def caption():
    words = [WordTiming(0.0, 0.4, "No"), WordTiming(0.4, 0.9, "fue"),
             WordTiming(0.9, 1.6, "un"), WordTiming(1.6, 2.4, "milagro")]
    return Caption(0, 0.0, 2.4, "No fue un milagro", "01", words)


def test_overlay_preserves_shape_and_dtype(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title="La confianza", chapter_label="01 / FLOW",
                             chapter_index=0, chapter_count=4, progress=0.3,
                             keyword="CONFIANZA", url="www.example.com")
    assert out.shape == (1920, 1080, 3)
    assert out.dtype == np.uint8


def test_caption_marks_the_caption_zone(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title="T", chapter_label="01", chapter_index=0,
                             chapter_count=2, progress=0.0, keyword="K", url=None)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["caption"])
    assert out[y0:y1, x0:x1].max() > 60


def test_caption_stays_inside_its_zone(grid, look):
    """Regression: v1 drew the keyword behind the caption plate."""
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=1.0,
                             title=None, chapter_label=None, chapter_index=0,
                             chapter_count=1, progress=0.0, keyword=None, url=None)
    _, y0, _, y1 = grid.zone_px(canvas.ZONES["caption"])
    outside = np.concatenate([out[:y0], out[y1:]])
    assert outside.max() < 8, "caption drew outside the caption zone"


def test_active_word_uses_the_accent(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption(), t=2.0,
                             title=None, chapter_label=None, chapter_index=0,
                             chapter_count=1, progress=0.0, keyword=None, url=None)
    accent = (tokens.load_look("plata").accent_rgb() * 255).astype(np.int16)
    diff = np.abs(out.astype(np.int16) - accent[None, None, :]).sum(axis=2)
    assert (diff < 90).sum() > 200, "accent not present on the active word"


def test_plate_alpha_rises_on_bright_backgrounds(grid):
    dark = np.zeros((1920, 1080, 3), dtype=np.uint8)
    bright = np.full((1920, 1080, 3), 230, dtype=np.uint8)
    assert typography.plate_alpha(bright, grid) > typography.plate_alpha(dark, grid)


def test_footer_clears_platform_ui(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0, title=None,
                             chapter_label=None, chapter_index=0, chapter_count=1,
                             progress=0.0, keyword="CONFIANZA", url="www.example.com")
    mask_top = int(canvas.PLATFORM_MASKS["tiktok"].y0 * 1920)
    assert out[mask_top:].max() < 8, "footer intrudes into platform UI"


def test_permanent_website_signature_is_phone_legible(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(
        frame, grid, look, caption=None, t=0.0, title=None,
        chapter_label=None, chapter_index=0, chapter_count=1,
        progress=0.0, keyword=None, url="www.elinstantedelhombregris.com",
    )
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["footer"])
    signature = out[y0:y1, x0:x1]
    assert signature.max() > 200, "website lacks a high-contrast phone-readable treatment"
    assert np.count_nonzero(signature.max(axis=2) > 160) > 1_000, "website signature is too small"


def test_no_caption_is_safe(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0, title="T",
                             chapter_label="01", chapter_index=0, chapter_count=1,
                             progress=0.0, keyword="K", url=None)
    assert out.shape == (1920, 1080, 3)


def test_cold_open_never_drops_the_hook_payoff(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    prefix = "SIN ELLA LAS OTRAS INFRAESTRUCTURAS SE CONSTRUYEN PERO NO SE"
    full = typography.overlay(frame, grid, look, t=0.8, hook=prefix + " CUIDAN",
                              cold_open_seconds=1.25)
    truncated = typography.overlay(frame, grid, look, t=0.8, hook=prefix,
                                   cold_open_seconds=1.25)
    assert not np.array_equal(full, truncated)


@pytest.mark.parametrize("text", [
    "corto",
    "una frase de longitud perfectamente normal para un subtitulo",
    "supercalifragilisticoexpialidosoyunpocomas",                      # unbreakable, 42 chars
    "a" * 200,                                                          # pathological
    "https://www.elinstantedelhombregris.com/bitacora/articulo-larguisimo",
])
def test_caption_never_escapes_its_zone(grid, look, text):
    """v1 drew a keyword underneath the caption plate. Nothing may leave its zone."""
    words = [WordTiming(i * 0.3, (i + 1) * 0.3, w) for i, w in enumerate(text.split() or [text])]
    caption = Caption(0, 0.0, 3.0, text, "01", words)
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=caption, t=0.5,
                             title=None, chapter_label=None, chapter_index=0,
                             chapter_count=1, progress=0.0, keyword=None, url=None)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["caption"])
    outside = out.copy()
    outside[y0:y1, x0:x1] = 0
    assert outside.max() < 8, f"caption escaped its zone for {text[:40]!r}"


def test_footer_url_never_escapes_its_zone(grid, look):
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0, title=None,
                             chapter_label=None, chapter_index=0, chapter_count=1,
                             progress=0.0, keyword="CONFIANZA" * 6,
                             url="https://" + "x" * 120 + ".com")
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["footer"])
    outside = out.copy()
    outside[y0:y1, x0:x1] = 0
    assert outside.max() < 8, "footer escaped its zone"


def test_chapter_label_and_progress_bar_do_not_share_a_row(grid, look):
    """Regression: shipped frames showed the progress bar drawn straight through the
    chapter label ("02 / BLUEPRINT" struck through by the bar). Render title +
    chapter_label + progress together and confirm their ink never lands on the same
    pixel row, using real glyph extents rather than trusting the offsets to agree.
    """
    label_only = typography.overlay(np.zeros((1920, 1080, 3), dtype=np.uint8), grid, look,
                                    caption=None, t=0.0, title=None, chapter_label="02 / BLUEPRINT",
                                    chapter_index=0, chapter_count=1, progress=0.0,
                                    keyword=None, url=None)
    bar_only = typography.overlay(np.zeros((1920, 1080, 3), dtype=np.uint8), grid, look,
                                  caption=None, t=0.0, title="Un titulo cualquiera",
                                  chapter_label=None, chapter_index=1, chapter_count=4,
                                  progress=0.6, keyword=None, url=None)
    # Isolate the accent-coloured progress bar from a run with no label, and the
    # label's own ink (matched by its specific colour, not just "any bright pixel" --
    # `label_only` still paints the grey progress baseline since chapter_label alone
    # triggers `draw_progress`) from a run with no bar, then confirm the two never
    # land on the same row.
    accent = (look.accent_rgb() * 255).astype(np.int16)
    label_ink = (look.ramp_rgb()[-4] * 255).astype(np.int16)
    bar_rows = np.where((np.abs(bar_only.astype(np.int16) - accent[None, None, :]).sum(axis=2) < 90).any(axis=1))[0]
    label_rows = np.where((np.abs(label_only.astype(np.int16) - label_ink[None, None, :]).sum(axis=2) < 70).any(axis=1))[0]
    assert len(bar_rows) > 0, "progress bar did not render"
    assert len(label_rows) > 0, "chapter label did not render"
    assert not set(bar_rows.tolist()) & set(label_rows.tolist()), (
        "chapter label and progress bar share a pixel row"
    )


def test_accent_marks_only_its_reserved_uses(grid, look):
    """The accent is reserved for the active karaoke word and the progress bar.

    A chapter label rendered in accent would appear in every frame and dilute the
    signal until it means nothing. This asserts accent pixels are scarce when there
    is no caption and no progress to draw.

    Threshold is an absolute pixel count, not a fraction: measured correct output is
    ~1 px (antialiasing slop only); reverting the chapter label to `look.accent_rgb()`
    raises it to ~195 px. A fractional threshold of 0.002 (~4,147 px of this 1920x1080
    frame) sits nowhere near either number, so it never actually caught the regression
    it documents. 50 sits clearly above the correct baseline and clearly below the
    regressed measurement.
    """
    frame = np.zeros((1920, 1080, 3), dtype=np.uint8)
    out = typography.overlay(frame, grid, look, caption=None, t=0.0,
                             title="La confianza", chapter_label="01 / FLOW",
                             chapter_index=0, chapter_count=4, progress=0.0,
                             keyword="CONFIANZA", url="www.example.com")
    accent = (look.accent_rgb() * 255).astype(np.int16)
    close = (np.abs(out.astype(np.int16) - accent[None, None, :]).sum(axis=2) < 70)
    assert close.sum() < 50, f"accent covers {close.sum()} px, expected < 50"
