import numpy as np
import pytest
from PIL import Image

from ascii_studio.render import canvas, seal, tokens


@pytest.fixture(scope="module")
def grid():
    return canvas.make_grid(1080, 1920, tokens.load_look("plata"))


@pytest.fixture
def logo(tmp_path):
    img = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    for y in range(120, 280):
        for x in range(180, 220):
            img.putpixel((x, y), (255, 255, 255, 255))
    for y in range(180, 220):
        for x in range(120, 280):
            img.putpixel((x, y), (255, 255, 255, 255))
    path = tmp_path / "logo.png"
    img.save(path)
    return path


def test_missing_logo_returns_none():
    assert seal.load_logo_mask(None) is None


def test_mask_is_cropped_to_ink(logo):
    mask = seal.load_logo_mask(logo)
    assert mask is not None
    assert mask.max() > 0.9
    assert mask.shape[0] < 400 and mask.shape[1] < 400


def test_seal_is_inside_stage(grid, logo):
    mask = seal.load_logo_mask(logo)
    lum = seal.seal_luminance(mask, grid, 0.4, 1.6)
    x0, y0, x1, y1 = grid.zone_px(canvas.ZONES["stage"])
    ss = grid.supersample
    outside = lum.copy()
    outside[y0 * ss:y1 * ss, x0 * ss:x1 * ss] = 0.0
    assert outside.max() == 0.0


def test_seal_fades_out(grid, logo):
    mask = seal.load_logo_mask(logo)
    early = seal.seal_luminance(mask, grid, 0.2, 1.6).max()
    late = seal.seal_luminance(mask, grid, 1.55, 1.6).max()
    assert early > late


def test_seal_is_gone_after_duration(grid, logo):
    mask = seal.load_logo_mask(logo)
    assert seal.seal_luminance(mask, grid, 2.0, 1.6).max() == 0.0


def test_none_mask_yields_empty_buffer(grid):
    lum = seal.seal_luminance(None, grid, 0.4, 1.6)
    assert lum.shape == grid.buffer_shape()
    assert lum.max() == 0.0
