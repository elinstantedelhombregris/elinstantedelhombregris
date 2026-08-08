import numpy as np

from ascii_studio.production.verify import (
    _exposure_ok,
    _paper_surface_ok,
    _signature_bright_fraction,
)


def test_signature_gate_ignores_left_footer_keyword_and_requires_right_footer_ink():
    unsigned = np.zeros((1920, 1080, 3), dtype=np.uint8)
    unsigned[1600:1640, 40:240] = 255
    assert _signature_bright_fraction([unsigned]) == 0.0

    signed = unsigned.copy()
    signed[1600:1660, 350:1030] = 255
    assert _signature_bright_fraction([signed]) > 0.008


def test_signature_gate_supports_dark_ink_on_paper():
    unsigned = np.full((1920, 1080, 3), 242, dtype=np.uint8)
    signed = unsigned.copy()
    signed[1600:1660, 350:1030] = 22
    assert _signature_bright_fraction([unsigned], paper=True) == 0.0
    assert _signature_bright_fraction([signed], paper=True) > 0.012


def test_illustrated_paper_accepts_deep_engraving_without_weakening_ascii_gate():
    brightness = [101.0, 96.0, 108.0]
    assert _exposure_ok(brightness, paper=True, illustrated=True)
    assert _paper_surface_ok(brightness, 80.0, illustrated=True)
    assert not _exposure_ok(brightness, paper=True, illustrated=False)


def test_illustrated_paper_still_rejects_crushed_or_flat_frames():
    assert not _exposure_ok([22.0], paper=True, illustrated=True)
    assert not _paper_surface_ok([101.0], 12.0, illustrated=True)
