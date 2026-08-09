from dataclasses import replace

import cv2
import numpy as np

from ascii_studio.render.frames import Renderer
from ascii_studio.render.tokens import load_look
from ascii_studio.render import typography
from ascii_studio.scene.legacy import LegacyChapter
from ascii_studio.scene import worlds


def test_tinta_papel_renders_dark_ink_on_a_light_physical_surface():
    look = load_look("tinta-papel")
    renderer = Renderer(look, width=270, height=480)
    chapter = LegacyChapter(
        motif="network", keyword="CIUDADANÍA", anchors=["CIUDADANÍA", "PODER"],
        seed=31, density=0.7, motion=0.4, world="civic-plaza",
        hero_subject="ciudadanía", archetype="network", composition="assembly",
        depth_layers=4, lighting="dawn", metamorphosis="crowd-becomes-network",
    )
    frame = renderer.frame(chapter, 1.2, 0.68, 3)
    gray = frame.mean(axis=2)
    assert gray.mean() > 145
    assert gray.std() > 24
    assert np.percentile(gray, 10) < np.percentile(gray, 90) - 55


def test_paper_texture_is_stable_between_identical_frames():
    look = replace(load_look("tinta-papel"), hysteresis=0.0)
    a = Renderer(look, width=270, height=480)
    b = Renderer(look, width=270, height=480)
    chapter = LegacyChapter(motif="signal", keyword="IDEA", anchors=["IDEA"], seed=7)
    assert np.array_equal(a.frame(chapter, 0.5, 0.3, 1), b.frame(chapter, 0.5, 0.3, 99))


def test_print_plate_treats_white_stock_as_empty_and_adds_parallax(tmp_path):
    source = np.full((360, 200, 3), 244, dtype=np.uint8)
    cv2.rectangle(source, (58, 95), (142, 285), (12, 12, 12), -1)
    cv2.line(source, (10, 330), (190, 40), (204, 39, 82), 5, cv2.LINE_AA)
    plate = tmp_path / "print.png"
    assert cv2.imwrite(str(plate), source)
    chapter = LegacyChapter(
        motif="signal", keyword="PODER", anchors=["PODER"], seed=17,
        plate=str(plate), world="civic-plaza",
    )

    state = {}
    locked = worlds._locked_plate(chapter, (360, 200), state)
    assert locked is not None
    assert float(locked.luminance[150:250, 80:120].mean()) > 0.72
    assert float(locked.luminance[5:40, 145:190].mean()) < 0.08
    assert float(state["world_plate_violet"].max()) > 0.8

    early = worlds.render_world(chapter, (360, 200), 0.4, 0.08, {})
    late = worlds.render_world(chapter, (360, 200), 3.4, 0.82, {})
    assert float(np.mean(np.abs(early.luminance - late.luminance))) > 0.006


def test_illustrated_mode_preserves_full_colour_plate_and_prints_graphics(tmp_path):
    source = np.full((480, 270, 3), (224, 238, 246), dtype=np.uint8)
    cv2.rectangle(source, (26, 72), (244, 408), (38, 119, 204), -1)
    cv2.circle(source, (135, 235), 76, (197, 54, 68), -1, cv2.LINE_AA)
    cv2.line(source, (18, 440), (250, 40), (52, 196, 96), 11, cv2.LINE_AA)
    plate = tmp_path / "illustration.png"
    assert cv2.imwrite(str(plate), source)
    chapter = LegacyChapter(
        motif="network", keyword="PODER", anchors=["PODER", "CIUDADANÍA"],
        relations=[{"source": "PODER", "target": "CIUDADANÍA", "verb": "CEDE"}],
        seed=29, density=0.6, motion=0.35, plate=str(plate), world="civic-plaza",
        archetype="network", composition="assembly", depth_layers=4,
        lighting="dawn", metamorphosis="crowd-becomes-network",
        graphic_cues=[{
            "id": "relation-01", "kind": "connection-path",
            "target_region": [0.12, 0.16, 0.88, 0.48],
        }],
        reveal_points={"graphic:relation-01:start": 0.4, "graphic:relation-01:end": 0.92},
    )
    look = load_look("tinta-papel-ilustrado")
    renderer = Renderer(look, width=270, height=480)
    frame = renderer.frame(chapter, 1.4, 0.68, 5)

    assert renderer._scene_state.get("world_plate_rgb") is not None
    # Colour survives as colour, rather than collapsing into one ASCII ramp.
    assert float(np.mean(np.std(frame.astype(np.float32), axis=2))) > 11.0
    assert len(np.unique(frame.reshape(-1, 3), axis=0)) > 800
    # The overprinted semantic layer introduces the house violet.
    violet = (frame[..., 2] > frame[..., 1] * 1.16) & (frame[..., 0] > frame[..., 1] * 1.05)
    assert float(violet.mean()) > 0.0005


def test_illustrated_typography_never_draws_automatic_scene_labels(monkeypatch):
    look = load_look("tinta-papel-ilustrado")
    renderer = Renderer(look, width=270, height=480)
    frame = np.full((480, 270, 3), 232, dtype=np.uint8)
    chapter = LegacyChapter(motif="network", keyword="PODER", anchors=["PODER", "RED"])

    monkeypatch.setattr(
        typography, "draw_scene_labels",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("labels are forbidden")),
    )
    result = typography.overlay(
        frame, renderer.grid, look, chapter_label="01 / NETWORK", keyword="PODER",
        url="www.elinstantedelhombregris.com", scene_chapter=chapter, progress=0.6,
    )
    assert result.shape == frame.shape
