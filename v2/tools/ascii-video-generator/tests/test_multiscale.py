import cv2
import numpy as np

from ascii_studio.render.canvas import make_grid
from ascii_studio.render.multiscale import enhance
from ascii_studio.render.tokens import load_look


def test_multiscale_preserves_silhouette_and_contour_information():
    look = load_look("manifesto")
    grid = make_grid(360, 640, look)
    lum = np.zeros(grid.buffer_shape(), dtype=np.float32)
    cv2.rectangle(lum, (180, 220), (540, 920), 0.62, -1)
    before = cv2.Sobel(lum, cv2.CV_32F, 1, 0).var() + cv2.Sobel(lum, cv2.CV_32F, 0, 1).var()
    out = enhance(lum, grid, 0.32)
    after = cv2.Sobel(out, cv2.CV_32F, 1, 0).var() + cv2.Sobel(out, cv2.CV_32F, 0, 1).var()
    assert out.shape == lum.shape
    assert out[500, 360] > 0.4
    assert after >= before * 0.7
