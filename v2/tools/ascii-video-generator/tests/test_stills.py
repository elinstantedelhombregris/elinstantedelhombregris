import json

import numpy as np
import pytest
from PIL import Image

from ascii_studio import stills

STORYBOARD = {
    "title": "La amabilidad como ingenieria social",
    "slug": "la-amabilidad",
    "thesis": "t",
    "keywords": ["amabilidad"],
    "chapters": [
        {"id": "01-network", "label": "01 / NETWORK", "motif": "network",
         "keyword": "CONFIANZA", "texts": ["uno"], "primary": "#7dd5c2",
         "secondary": "#e6bb63", "accent": "#edf4ef", "anchors": ["CONFIANZA"],
         "metaphor": "m", "seed": 11, "density": 0.6, "motion": 0.5,
         "composition": "mesh"},
        {"id": "02-horizon", "label": "02 / HORIZON", "motif": "horizon",
         "keyword": "CAMINO", "texts": ["dos"], "primary": "#f1cb73",
         "secondary": "#6fd0bf", "accent": "#f5efe0", "anchors": ["CAMINO"],
         "metaphor": "m", "seed": 22, "density": 0.5, "motion": 0.4,
         "composition": "path"},
    ],
}


@pytest.fixture
def storyboard_path(tmp_path):
    path = tmp_path / "sb.json"
    path.write_text(json.dumps(STORYBOARD), encoding="utf-8")
    return path


def test_reads_v1_storyboard(storyboard_path):
    chapters = stills.chapters_from_storyboard(storyboard_path)
    assert [c.motif for c in chapters] == ["network", "horizon"]
    assert chapters[0].seed == 11


def test_renders_one_still_per_chapter(storyboard_path, tmp_path):
    out = tmp_path / "stills"
    paths = stills.render_stills(storyboard_path, out, "plata")
    assert len(paths) == 2
    for path in paths:
        assert path.exists()
        assert Image.open(path).size == (1080, 1920)


def test_stills_differ_between_chapters(storyboard_path, tmp_path):
    paths = stills.render_stills(storyboard_path, tmp_path / "s", "plata")
    a = np.asarray(Image.open(paths[0]).convert("L").resize((64, 114)), dtype=np.float32)
    b = np.asarray(Image.open(paths[1]).convert("L").resize((64, 114)), dtype=np.float32)
    assert np.abs(a - b).mean() > 3.0


def test_contact_sheet(storyboard_path, tmp_path):
    paths = stills.render_stills(storyboard_path, tmp_path / "s", "plata")
    sheet = stills.contact_sheet(paths, tmp_path / "sheet.png", columns=2)
    assert sheet.exists()
    assert Image.open(sheet).width > 0
