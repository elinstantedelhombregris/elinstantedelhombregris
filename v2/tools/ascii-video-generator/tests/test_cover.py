from pathlib import Path

import numpy as np
from PIL import ImageDraw

from ascii_studio.render.cover import designed_cover
from ascii_studio import cli, video
from ascii_studio.storyboard.schema import Chapter, Storyboard
from ascii_studio.render.tokens import load_look


def test_illustrated_cover_uses_only_story_copy_and_one_brand_signature(
    tmp_path: Path, monkeypatch,
):
    recorded: list[str] = []
    original = ImageDraw.ImageDraw.text

    def track(self, xy, text, *args, **kwargs):
        recorded.append(str(text))
        return original(self, xy, text, *args, **kwargs)

    monkeypatch.setattr(ImageDraw.ImageDraw, "text", track)
    out = tmp_path / "cover.jpg"
    designed_cover(
        np.full((960, 540, 3), 128, dtype=np.uint8),
        "La amabilidad como estrategia",
        "La amabilidad expone los problemas con precisión",
        load_look("tinta-papel-ilustrado"), out,
        url="www.elinstantedelhombregris.com",
    )

    assert out.exists()
    assert "BASTA" not in " ".join(recorded)
    assert "DOCTRINA" not in " ".join(recorded)
    assert recorded.count("www.elinstantedelhombregris.com") == 1


def test_illustrated_cover_frame_is_free_of_playback_typography(monkeypatch):
    look = load_look("tinta-papel-ilustrado")
    frame = np.full((480, 270, 3), 137, dtype=np.uint8)

    class FakeRenderer:
        def __init__(self, *_args, **_kwargs):
            self.look = look
            self.grid = object()

        def frame(self, *_args, **_kwargs):
            return frame.copy()

    board = Storyboard(
        title="Una historia", slug="una-historia", thesis="", keywords=["HISTORIA"],
        chapters=[Chapter(
            id="01", label="01", texts=["Una historia."], motif="signal",
            keyword="HISTORIA", primary="HISTORIA", secondary="", accent="",
        )],
    )
    ctx = video.RenderContext(
        storyboard=board, captions=[], ranges={"01": (0.0, 2.0)},
        logo_mask=None, url="www.elinstantedelhombregris.com",
        intro_seal_seconds=0.0, look_name="tinta-papel-ilustrado",
        width=270, height=480,
    )
    monkeypatch.setattr(cli, "Renderer", FakeRenderer)
    monkeypatch.setattr(
        cli.typography, "overlay",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(
            AssertionError("playback typography must not enter illustrated covers")
        ),
    )

    assert np.array_equal(cli._cover_frame(ctx, 1.0), frame)
