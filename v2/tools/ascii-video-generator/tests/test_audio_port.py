import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from ascii_studio.audio import design, io
from ascii_studio.storyboard.schema import Chapter


def _chapters(count: int = 2) -> list[Chapter]:
    return [
        Chapter(
            id=f"c{i}", label=f"Chapter {i}", motif="signal", keyword="k",
            texts=[], primary="#fff", secondary="#000", accent="#888",
            density=0.4 + 0.1 * i, motion=0.3 + 0.15 * i, seed=i,
        )
        for i in range(count)
    ]


def _ranges(chapters: list[Chapter], duration: float) -> dict[str, tuple[float, float]]:
    step = duration / len(chapters)
    return {chapter.id: (i * step, (i + 1) * step) for i, chapter in enumerate(chapters)}


def test_music_length_matches_duration():
    chapters = _chapters()
    track = design.build_music(3.0, chapters, _ranges(chapters, 3.0))
    assert abs(len(track) / io.SAMPLE_RATE - 3.25) < 0.05


def test_music_is_not_silent():
    chapters = _chapters()
    track = design.build_music(3.0, chapters, _ranges(chapters, 3.0))
    assert np.abs(track).max() > 0.01


def test_wav_roundtrip(tmp_path):
    samples = np.sin(np.linspace(0, 40, io.SAMPLE_RATE)).astype(np.float32) * 0.5
    path = tmp_path / "a.wav"
    io.write_wav(path, samples)
    assert abs(io.wav_duration(path) - 1.0) < 0.02
    assert io.read_wav(path).shape[0] == io.SAMPLE_RATE


def test_stereo_bed_has_width_without_moving_the_center():
    mono = np.sin(np.linspace(0, 80, io.SAMPLE_RATE)).astype(np.float32) * 0.4
    stereo = design.stereoize(mono, width=0.35)
    assert stereo.shape == (io.SAMPLE_RATE, 2)
    assert np.mean(np.abs(stereo[:, 0] - stereo[:, 1])) > 0.001
    assert np.allclose(stereo.mean(axis=1), mono, atol=1e-6)
