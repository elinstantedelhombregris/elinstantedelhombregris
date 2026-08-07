"""Coverage for the chapter-aware score and the mix engine's gain-staging/ducking/limiting.

These pin the behaviours the old fixed-drone + global-tanh mix was missing:
the score must change across chapters (harmony + audible content), the bed
must be measurably ducked under the voice, the mix must not clip, and the
music/sfx stems must still be written.
"""

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from ascii_studio.audio import design, io, score
from ascii_studio.storyboard.schema import Chapter


def _storyboard_chapters() -> list[Chapter]:
    """Three chapters with distinct density/motion, matching real storyboard shape."""
    return [
        Chapter(
            id="01-noise", label="Noise", motif="noise", keyword="k", texts=[],
            primary="#fff", secondary="#000", accent="#888",
            density=0.25, motion=0.2, seed=1,
        ),
        Chapter(
            id="02-network", label="Network", motif="network", keyword="k", texts=[],
            primary="#fff", secondary="#000", accent="#888",
            density=0.85, motion=0.9, seed=2,
        ),
        Chapter(
            id="03-horizon", label="Horizon", motif="horizon", keyword="k", texts=[],
            primary="#fff", secondary="#000", accent="#888",
            density=0.5, motion=0.5, seed=3,
        ),
    ]


def _ranges(chapters: list[Chapter], duration: float) -> dict[str, tuple[float, float]]:
    step = duration / len(chapters)
    return {chapter.id: (i * step, (i + 1) * step) for i, chapter in enumerate(chapters)}


def _rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(x, dtype=np.float64)) + 1e-16))


def _spectral_centroid(x: np.ndarray, sample_rate: int) -> float:
    if len(x) < 256:
        return 0.0
    spectrum = np.abs(np.fft.rfft(x * np.hanning(len(x))))
    freqs = np.fft.rfftfreq(len(x), d=1.0 / sample_rate)
    total = spectrum.sum()
    return float((spectrum * freqs).sum() / total) if total > 0 else 0.0


# ---------------------------------------------------------------------------
# 1. The score is not constant across chapters.
# ---------------------------------------------------------------------------


def test_chapter_harmony_voice_leads_and_resolves_to_tonic():
    """Chapters walk a cadence and the final chapter always lands on the tonic."""
    count = 6
    chords = [score.chapter_chord(i, count) for i in range(count)]
    roots = [chord[0] for chord in chords]
    # Not a static drone: at least some neighbouring chapters change harmonic centre.
    assert len(set(roots)) > 1
    # The piece resolves: last chapter is the A-minor tonic (root, minor third, fifth).
    assert roots[-1] == pytest.approx(score.ROOT_HZ)
    assert chords[-1][1] == pytest.approx(score.ROOT_HZ * (2 ** (3 / 12)))  # minor third


def test_music_track_differs_across_chapters():
    """build_music must actually sound different chapter to chapter, not just in theory."""
    chapters = _storyboard_chapters()
    duration = 9.0
    ranges = _ranges(chapters, duration)
    track = design.build_music(duration, chapters, ranges)

    step = int(duration / len(chapters) * io.SAMPLE_RATE)
    segments = [track[i * step : (i + 1) * step] for i in range(len(chapters))]
    for segment in segments:
        assert np.abs(segment).max() > 0.001, "each chapter should produce audible content"

    centroids = [_spectral_centroid(segment, io.SAMPLE_RATE) for segment in segments]
    rmses = [_rms(segment) for segment in segments]
    # It must not be a fixed drone: chapters with very different density/motion
    # should differ measurably in either brightness or level.
    assert len(set(round(c, 1) for c in centroids)) > 1 or len(set(round(r, 4) for r in rmses)) > 1


def test_sfx_track_is_not_constant():
    chapters = _storyboard_chapters()
    duration = 9.0
    ranges = _ranges(chapters, duration)
    track = design.build_sfx(duration, chapters, ranges)
    assert np.abs(track).max() > 0.01
    # Structural hits at chapter joins mean the track is bursty, not flat noise.
    frame = io.SAMPLE_RATE // 10
    frame_rms = [
        _rms(track[i : i + frame]) for i in range(0, len(track) - frame, frame)
    ]
    assert max(frame_rms) > 2 * (sorted(frame_rms)[len(frame_rms) // 2] + 1e-9)


# ---------------------------------------------------------------------------
# 2. Sidechain ducking measurably lowers the bed while the voice speaks.
# ---------------------------------------------------------------------------


def test_duck_curve_is_lower_while_voice_is_active():
    sr = io.SAMPLE_RATE
    silence = np.zeros(int(1.0 * sr), dtype=np.float32)
    t = np.arange(int(1.5 * sr), dtype=np.float32) / sr
    speech = (0.2 * np.sin(2 * np.pi * 180.0 * t)).astype(np.float32)
    voice = np.concatenate([silence, speech, silence])

    duck = design.voice_duck_curve(voice)
    assert len(duck) == len(voice)

    # Sample well inside each region, clear of attack/release transition edges.
    silence_region = duck[int(0.2 * sr) : int(0.8 * sr)]
    speech_region = duck[int(1.0 * sr + 0.4 * sr) : int(1.0 * sr + 1.1 * sr)]

    silence_db = 20 * np.log10(max(float(silence_region.mean()), 1e-9))
    speech_db = 20 * np.log10(max(float(speech_region.mean()), 1e-9))

    assert speech_db < silence_db - 3.0, (
        f"bed gain should duck by several dB while voice speaks: "
        f"silence={silence_db:.2f}dB speech={speech_db:.2f}dB"
    )


def test_mix_audio_ducks_bed_under_voice(tmp_path):
    """End-to-end: the bed must be measurably quieter under active voice than under silence."""
    sr = io.SAMPLE_RATE
    silence = np.zeros(int(1.0 * sr), dtype=np.float32)
    t = np.arange(int(1.5 * sr), dtype=np.float32) / sr
    speech = (0.15 * np.sin(2 * np.pi * 180.0 * t)).astype(np.float32)
    voice = np.concatenate([silence, speech, silence])
    voice_path = tmp_path / "voice.wav"
    io.write_wav(voice_path, voice)

    chapters = _storyboard_chapters()
    duration = len(voice) / sr
    ranges = _ranges(chapters, duration)
    music = design.build_music(duration, chapters, ranges)
    sfx = design.build_sfx(duration, chapters, ranges)

    # Compute the ducked bed the same way mix_audio does, so we can inspect it directly.
    length = max(len(voice), len(music), len(sfx))
    pad = lambda x: np.pad(x, (0, length - len(x)))
    voice_p, music_p, sfx_p = pad(voice), pad(music), pad(sfx)
    voice_norm, _ = design.normalize_to_dbfs(voice_p)
    duck = design.voice_duck_curve(voice_norm)
    bed = design.soft_limit(music_p * design.MUSIC_GAIN + sfx_p * design.SFX_GAIN, threshold=design.BED_LIMIT_THRESHOLD)
    bed_ducked = bed * duck

    silence_slice = slice(int(0.2 * sr), int(0.8 * sr))
    speech_slice = slice(int(1.0 * sr + 0.4 * sr), int(1.0 * sr + 1.1 * sr))

    duck_rms_silence = _rms(bed_ducked[silence_slice])
    duck_rms_speech = _rms(bed_ducked[speech_slice])
    assert duck_rms_speech < duck_rms_silence, "ducked bed must be quieter while voice is active"


# ---------------------------------------------------------------------------
# 3 & 4. The mix does not clip, and the stems are still written.
# ---------------------------------------------------------------------------


def test_mix_audio_writes_stems_and_does_not_clip(tmp_path):
    sr = io.SAMPLE_RATE
    t = np.arange(int(2.5 * sr), dtype=np.float32) / sr
    voice = (0.3 * np.sin(2 * np.pi * 160.0 * t) * (t > 0.3)).astype(np.float32)
    voice_path = tmp_path / "voice.wav"
    io.write_wav(voice_path, voice)

    chapters = _storyboard_chapters()
    duration = len(voice) / sr
    ranges = _ranges(chapters, duration)
    music = design.build_music(duration, chapters, ranges)
    sfx = design.build_sfx(duration, chapters, ranges)

    music_path, sfx_path, mix_path = design.mix_audio(voice_path, music, sfx, tmp_path, "smoke")

    # Contract: three real files, still named the same way.
    assert music_path == tmp_path / "smoke-music-stem.wav"
    assert sfx_path == tmp_path / "smoke-sound-design-stem.wav"
    assert mix_path == tmp_path / "smoke-mix.wav"
    for path in (music_path, sfx_path, mix_path):
        assert path.exists() and path.stat().st_size > 0

    mix = io.read_wav(mix_path).mean(axis=1)
    peak = float(np.max(np.abs(mix)))
    assert peak <= 1.0
    # No hard clipping: only a vanishing fraction of samples may sit at/near full scale.
    saturated = float(np.mean(np.abs(mix) >= 0.999))
    assert saturated < 0.001, f"too many samples at full scale ({saturated:.4%}): looks clipped"


def test_build_music_and_sfx_are_bounded():
    chapters = _storyboard_chapters()
    duration = 6.0
    ranges = _ranges(chapters, duration)
    music = design.build_music(duration, chapters, ranges)
    sfx = design.build_sfx(duration, chapters, ranges)
    assert np.max(np.abs(music)) <= 1.0
    assert np.max(np.abs(sfx)) <= 1.0


# ---------------------------------------------------------------------------
# 5. Visual envelopes: the score, exported as per-frame drive signals instead
#    of analysed from the rendered waveform.
# ---------------------------------------------------------------------------

FPS = 30


def test_score_envelopes_has_the_expected_keys_shape_and_bounds():
    chapters = _storyboard_chapters()
    duration = 9.0
    ranges = _ranges(chapters, duration)
    env = score.score_envelopes(chapters, ranges, duration, FPS)

    expected_n = int(duration * FPS) + 1
    for key in ("bass", "mid", "treble", "amplitude", "beat"):
        assert key in env, f"missing envelope key {key!r}"
        assert env[key].shape == (expected_n,)
        assert env[key].dtype == np.float32
        assert float(env[key].min()) >= 0.0
        assert float(env[key].max()) <= 1.0


def test_score_envelopes_bass_and_mid_track_chapter_density():
    """The 'network' chapter (density=0.85) should read louder on bass/mid than
    the 'noise' chapter (density=0.25), on average across each chapter's whole
    span -- both spans are the same duration, so this isolates the
    density-driven scale from the swell LFO's own oscillation (different
    motion -> different phase, so a single-frame comparison would be a coin
    flip on where each chapter's LFO happens to sit)."""
    chapters = _storyboard_chapters()  # noise density=0.25, network density=0.85
    duration = 9.0
    ranges = _ranges(chapters, duration)
    env = score.score_envelopes(chapters, ranges, duration, FPS)
    times = np.arange(len(env["bass"])) / FPS

    def _chapter_mean(key, chapter):
        start, end = ranges[chapter.id]
        mask = (times >= start) & (times < end)
        return float(env[key][mask].mean())

    assert _chapter_mean("bass", chapters[1]) > _chapter_mean("bass", chapters[0])
    assert _chapter_mean("mid", chapters[1]) > _chapter_mean("mid", chapters[0])


def test_score_envelopes_fade_in_and_out_at_chapter_edges():
    """The chapter-pad fade window this reuses means the envelope should be near
    zero right at a chapter's very first frame and build from there."""
    chapters = _storyboard_chapters()
    duration = 9.0
    ranges = _ranges(chapters, duration)
    env = score.score_envelopes(chapters, ranges, duration, FPS)
    start, end = ranges[chapters[1].id]
    first_frame = int(start * FPS)
    mid_frame = int((start + end) / 2 * FPS)
    assert env["amplitude"][first_frame] < env["amplitude"][mid_frame]


def test_beat_pulses_peak_at_the_onset_and_decay_smoothly():
    n = 60
    onset_frame = 20
    beat = score._beat_pulses([onset_frame / FPS], n, FPS)
    assert beat[onset_frame] == pytest.approx(1.0, abs=1e-6)
    assert beat[onset_frame - 1] < beat[onset_frame]  # nothing before the onset fires (silent, not a step)
    assert beat[onset_frame - 1] == 0.0
    # Monotonic decay for a few frames after the hit -- "a smooth 1 -> 0 ramp".
    tail = beat[onset_frame : onset_frame + 10]
    assert np.all(np.diff(tail) <= 1e-9)
    assert beat[onset_frame + 30] < 0.05, "should have decayed to near-silent well within a second"


def test_beat_pulses_overlap_takes_the_max_not_the_sum():
    n = 40
    beat = score._beat_pulses([5 / FPS, 5 / FPS], n, FPS)
    assert beat[5] <= 1.0 + 1e-6


def test_score_envelopes_empty_chapters_returns_zeroed_envelopes():
    env = score.score_envelopes([], {}, 3.0, FPS)
    for key in ("bass", "mid", "treble", "amplitude", "beat"):
        assert float(env[key].max()) == 0.0


def test_voice_envelope_tracks_speech(tmp_path):
    sr = io.SAMPLE_RATE
    silence = np.zeros(int(1.0 * sr), dtype=np.float32)
    t = np.arange(int(1.5 * sr), dtype=np.float32) / sr
    speech = (0.2 * np.sin(2 * np.pi * 180.0 * t)).astype(np.float32)
    voice = np.concatenate([silence, speech, silence])
    voice_path = tmp_path / "voice.wav"
    io.write_wav(voice_path, voice)

    duration = len(voice) / sr
    n_frames = int(duration * FPS) + 1
    env = score.voice_envelope(voice_path, n_frames, FPS)
    assert env.shape == (n_frames,)
    assert env.dtype == np.float32

    silence_frame = int(0.5 * FPS)  # well inside the first silent second
    speech_frame = int(1.7 * FPS)  # well inside the speech region, clear of attack
    assert env[speech_frame] > env[silence_frame] + 0.3


def test_voice_envelope_pads_short_wavs_to_the_requested_length(tmp_path):
    sr = io.SAMPLE_RATE
    voice = np.zeros(int(0.2 * sr), dtype=np.float32)
    voice_path = tmp_path / "short.wav"
    io.write_wav(voice_path, voice)
    env = score.voice_envelope(voice_path, 90, FPS)
    assert env.shape == (90,)
