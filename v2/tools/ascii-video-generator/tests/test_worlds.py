from pathlib import Path

import numpy as np
from PIL import Image

from ascii_studio.scene.legacy import LegacyChapter
from ascii_studio.scene.worlds import render_world


def chapter(world: str) -> LegacyChapter:
    return LegacyChapter(
        motif="signal", keyword="ATENCIÓN", anchors=["ATENCIÓN", "REPÚBLICA"],
        seed=91, density=0.6, motion=0.5, archetype="flow", composition="bridge",
        world=world, hero_subject="ATENCIÓN", depth_layers=4, lighting="beacon",
        metamorphosis="attention-builds-place",
    )


def test_cinematic_world_has_stage_confined_depth_and_hero_subject():
    result = render_world(chapter("civic-plaza"), (640, 360), 1.5, 0.88, {})
    assert result.luminance.shape == (640, 360)
    assert result.depth.shape == result.luminance.shape
    assert result.hero_mask.max() > 0.5
    assert np.count_nonzero(result.luminance[:50]) == 0
    assert len(np.unique(result.depth[result.depth > 0])) >= 4


def test_worlds_are_visually_distinct_and_transform_over_time():
    plaza = render_world(chapter("civic-plaza"), (640, 360), 1.5, 0.88, {}).luminance
    section = render_world(chapter("city-section"), (640, 360), 1.5, 0.88, {}).luminance
    early = render_world(chapter("eye-city"), (640, 360), 1.5, 0.18, {}).luminance
    late = render_world(chapter("eye-city"), (640, 360), 1.5, 0.88, {}).luminance
    assert np.mean(np.abs(plaza - section)) > 0.01
    assert np.mean(np.abs(early - late)) > 0.005


def test_locked_plate_is_promoted_to_depth_aware_world(tmp_path: Path):
    plate = np.zeros((180, 320), dtype=np.uint8)
    plate[35:150, 80:240] = 210
    plate[70:120, 130:190] = 255
    path = tmp_path / "plate.png"
    Image.fromarray(plate).save(path)
    ch = chapter("civic-plaza")
    ch.plate = str(path)
    result = render_world(ch, (640, 360), 0.0, 0.5, {})
    assert result.luminance.max() > 0.9
    assert result.depth.max() > 0.7
    assert result.hero_mask.max() > 0.9
