import numpy as np

from ascii_studio.production.verify import _signature_bright_fraction


def test_signature_gate_ignores_left_footer_keyword_and_requires_right_footer_ink():
    unsigned = np.zeros((1920, 1080, 3), dtype=np.uint8)
    unsigned[1600:1640, 40:240] = 255
    assert _signature_bright_fraction([unsigned]) == 0.0

    signed = unsigned.copy()
    signed[1600:1660, 350:1030] = 255
    assert _signature_bright_fraction([signed]) > 0.008
