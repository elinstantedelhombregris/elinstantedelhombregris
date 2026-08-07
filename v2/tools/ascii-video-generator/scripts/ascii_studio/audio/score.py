"""Chapter-aware score: harmony, texture and structural sound design.

This module knows about the storyboard (chapters, their `motion`/`density`
parameters and their time ranges) and turns that into music that follows the
piece instead of holding one static drone. `design.py` orchestrates the mix;
this module only composes.

Everything here is generated with numpy/scipy — no samples, no new
dependencies.

VISUAL ENVELOPES (`score_envelopes`, `voice_envelope`, bottom of this file):
reference ASCII-video implementations run an FFT over the finished mix to
*discover* beats after the fact. We never need to -- this module already
KNOWS every note onset, chapter root and section boundary, because it wrote
them. `score_envelopes` reuses the exact analytic shapes (`_fade_window`'s
ramp, `render_chapter_pad`'s swell LFO, `filtered_pulses`'/`build_sfx_track`'s
onset times) as visual curves instead of re-deriving anything from the
rendered waveform. `voice_envelope` is the one exception: narration isn't
composed by this module, so it genuinely reads the synthesized voice WAV.
"""

from __future__ import annotations

import math
from pathlib import Path
from typing import Sequence

import numpy as np
from scipy import signal as sps

from ascii_studio.audio.io import SAMPLE_RATE, read_wav
from ascii_studio.storyboard.schema import Chapter

# ---------------------------------------------------------------------------
# Harmony — one aeolian (natural minor) centre, voice-led chapter to chapter.
# ---------------------------------------------------------------------------

ROOT_HZ = 55.0  # A1 — low, grave, matches the register of the old drone.

# A cadence-shaped walk through the diatonic triads of A aeolian, expressed as
# semitone offsets of each triad's root from A: i(0) - VII(10) - VI(8) -
# iv(5) - v(7) - III(3) - VII(10) - iv(5) - i(0). The piece always lands back
# on the tonic for its last chapter, which is what "resolves" means here.
_DEGREE_PATH = (0, 10, 8, 5, 7, 3, 10, 5, 0)
_MINOR_THIRD = 3
_MAJOR_THIRD = 4
_FIFTH = 7
# Diatonic triads in A aeolian built on these roots are major (VII, VI, III);
# every other triad on the path (i, iv, v, ii°-adjacent) is minor.
_MAJOR_DEGREES = frozenset({10, 8, 3})


def semitone_to_hz(base_hz: float, semitones: float) -> float:
    return base_hz * (2.0 ** (semitones / 12.0))


def chapter_root_semitones(index: int, count: int) -> int:
    """Where this chapter sits on the cadence path. Always 0 (tonic) for the last."""
    if count <= 1 or index >= count - 1:
        return 0
    pos = round(index / (count - 1) * (len(_DEGREE_PATH) - 1))
    return _DEGREE_PATH[min(pos, len(_DEGREE_PATH) - 1)]


def chapter_chord(index: int, count: int) -> tuple[float, float, float]:
    """Root/third/fifth in Hz (low register) for a chapter's harmonic centre."""
    root_st = chapter_root_semitones(index, count)
    third_st = _MAJOR_THIRD if root_st in _MAJOR_DEGREES else _MINOR_THIRD
    root_hz = semitone_to_hz(ROOT_HZ, root_st)
    third_hz = semitone_to_hz(ROOT_HZ, root_st + third_st)
    fifth_hz = semitone_to_hz(ROOT_HZ, root_st + _FIFTH)
    return root_hz, third_hz, fifth_hz


# ---------------------------------------------------------------------------
# Texture primitives
# ---------------------------------------------------------------------------


def _fade_window(n: int, fade: int) -> np.ndarray:
    win = np.ones(n, dtype=np.float32)
    fade = max(0, min(fade, n // 2))
    if fade > 0:
        ramp = np.linspace(0.0, 1.0, fade, dtype=np.float32)
        win[:fade] *= ramp
        win[-fade:] *= ramp[::-1]
    return win


def detuned_stack(freq: float, n: int, rng: np.random.Generator, voices: int = 3, detune_cents: float = 7.0) -> np.ndarray:
    """Sum of slightly detuned sine oscillators around `freq` — texture, not a pure tone."""
    if n <= 0:
        return np.zeros(0, dtype=np.float32)
    voices = max(1, voices)
    t = np.arange(n, dtype=np.float64) / SAMPLE_RATE
    spread = np.linspace(-detune_cents, detune_cents, voices) if voices > 1 else np.array([0.0])
    out = np.zeros(n, dtype=np.float64)
    for cents in spread:
        f = freq * (2.0 ** (cents / 1200.0))
        phase = rng.uniform(0.0, 2 * np.pi)
        out += np.sin(2 * np.pi * f * t + phase)
    return (out / len(spread)).astype(np.float32)


def colored_noise(n: int, rng: np.random.Generator, cutoff_hz: float = 900.0, order: int = 2) -> np.ndarray:
    """White noise pushed through a low-pass so it sits under the mix like air, not hiss."""
    if n <= 0:
        return np.zeros(0, dtype=np.float32)
    white = rng.standard_normal(n).astype(np.float64)
    nyq = SAMPLE_RATE / 2
    cutoff = float(np.clip(cutoff_hz, 20.0, nyq * 0.98))
    b, a = sps.butter(order, cutoff / nyq, btype="low")
    return sps.lfilter(b, a, white).astype(np.float32)


def filtered_pulses(n: int, rng: np.random.Generator, rate_hz: float, duty: float, cutoff_hz: float) -> np.ndarray:
    """A soft pulse train (density/motion driven) — rounded off, never a click."""
    if n <= 0 or rate_hz <= 0:
        return np.zeros(n, dtype=np.float32)
    t = np.arange(n, dtype=np.float64) / SAMPLE_RATE
    phase = (t * rate_hz) % 1.0
    pulses = (phase < np.clip(duty, 0.02, 0.9)).astype(np.float64)
    nyq = SAMPLE_RATE / 2
    cutoff = float(np.clip(cutoff_hz, 40.0, nyq * 0.9))
    b, a = sps.butter(2, cutoff / nyq, btype="low")
    return sps.lfilter(b, a, pulses).astype(np.float32)


# ---------------------------------------------------------------------------
# Chapter pad — the harmonic bed, density/motion aware
# ---------------------------------------------------------------------------


def render_chapter_pad(
    track: np.ndarray,
    start: float,
    end: float,
    chord: tuple[float, float, float],
    density: float,
    motion: float,
    rng: np.random.Generator,
) -> None:
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), int(end * SAMPLE_RATE))
    n = right - left
    if n <= 0:
        return
    density = float(np.clip(density, 0.0, 1.0))
    motion = float(np.clip(motion, 0.0, 1.0))
    root_hz, third_hz, fifth_hz = chord

    fade = int(SAMPLE_RATE * min(1.4, max(0.15, (end - start) * 0.22)))
    win = _fade_window(n, fade)

    voices = 2 + round(density * 3)  # 2..5 detuned voices: denser chapters, richer stack
    detune = 4.0 + 7.0 * density

    sub = detuned_stack(root_hz / 2, n, rng, voices=2, detune_cents=3.0) * 0.55
    body = (
        detuned_stack(root_hz, n, rng, voices=voices, detune_cents=detune) * 0.40
        + detuned_stack(third_hz, n, rng, voices=max(2, voices - 1), detune_cents=detune) * 0.28
        + detuned_stack(fifth_hz, n, rng, voices=max(2, voices - 1), detune_cents=detune) * 0.24
    )
    air = colored_noise(n, rng, cutoff_hz=500.0 + 1400.0 * density) * (0.035 + 0.05 * density)
    texture = filtered_pulses(
        n, rng, rate_hz=0.8 + motion * 3.2, duty=0.16 + 0.22 * density, cutoff_hz=240.0 + 900.0 * density
    ) * (0.015 + 0.05 * motion)

    swell_rate = 0.08 + motion * 0.55  # Hz — slow breathing at low motion, restless at high motion
    t = np.arange(n, dtype=np.float64) / SAMPLE_RATE
    lfo = 0.62 + 0.38 * np.sin(2 * np.pi * swell_rate * t - np.pi / 2)

    bed = (sub + body + air + texture) * lfo
    gain = 0.10 + 0.05 * density
    track[left:right] += (bed * win * gain).astype(np.float32)


# ---------------------------------------------------------------------------
# Structural sound design — impacts, air, risers at chapter joins and seals
# ---------------------------------------------------------------------------


def render_impact(track: np.ndarray, t: float, rng: np.random.Generator, gain: float = 0.5, low_hz: float = 46.0) -> None:
    """A low, felt thump for a cut/transition — sub sine + a short noise transient."""
    duration = 0.5
    left = max(0, int(t * SAMPLE_RATE))
    right = min(len(track), left + int(duration * SAMPLE_RATE))
    n = right - left
    if n <= 0:
        return
    tt = np.arange(n, dtype=np.float64) / SAMPLE_RATE
    thump_env = np.exp(-tt * 9.0)
    thump = np.sin(2 * np.pi * low_hz * tt) * thump_env
    click_n = min(n, int(0.02 * SAMPLE_RATE))
    click_env = np.exp(-np.arange(click_n) / max(1, click_n / 4))
    click = rng.standard_normal(click_n) * click_env
    out = thump.copy()
    out[:click_n] += click * 0.6
    track[left:right] += (out * gain).astype(np.float32)


def render_air_swell(track: np.ndarray, start: float, duration: float, rng: np.random.Generator, gain: float = 0.14, cutoff_hz: float = 2200.0) -> None:
    """A soft filtered-noise breath — used for the opening seal and the final resolve."""
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), left + int(duration * SAMPLE_RATE))
    n = right - left
    if n <= 0:
        return
    env = np.sin(np.pi * np.clip(np.arange(n) / max(1, n - 1), 0, 1)) ** 1.4
    noise = colored_noise(n, rng, cutoff_hz=cutoff_hz)
    track[left:right] += (noise * env * gain).astype(np.float32)


def render_riser(track: np.ndarray, start: float, end: float, rng: np.random.Generator, gain: float = 0.16) -> None:
    """A filtered-noise sweep with rising pitch/level leading into a cut."""
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), int(end * SAMPLE_RATE))
    n = right - left
    if n <= 0:
        return
    white = rng.standard_normal(n).astype(np.float64)
    nyq = SAMPLE_RATE / 2
    # Sweep the low-pass cutoff upward across the riser so it brightens into the cut.
    cutoffs = np.linspace(300.0, 5200.0, n)
    out = np.zeros(n, dtype=np.float64)
    chunk = max(256, n // 24)
    for i in range(0, n, chunk):
        j = min(n, i + chunk)
        cutoff = float(np.clip(cutoffs[j - 1], 40.0, nyq * 0.95))
        b, a = sps.butter(2, cutoff / nyq, btype="low")
        out[i:j] = sps.lfilter(b, a, white[i:j])
    ramp = np.linspace(0.0, 1.0, n) ** 1.6
    track[left:right] += (out * ramp * gain).astype(np.float32)


def render_resolution_tail(track: np.ndarray, start: float, duration: float, chord: tuple[float, float, float], rng: np.random.Generator) -> None:
    """The final cadence: sustained tonic triad with a bright shimmering overtone."""
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), left + int(duration * SAMPLE_RATE))
    n = right - left
    if n <= 0:
        return
    root_hz, third_hz, fifth_hz = chord
    t = np.arange(n, dtype=np.float64) / SAMPLE_RATE
    attack = min(n, int(0.6 * SAMPLE_RATE))
    release = min(n, int(1.2 * SAMPLE_RATE))
    env = np.ones(n, dtype=np.float64)
    if attack > 0:
        env[:attack] = np.linspace(0.0, 1.0, attack) ** 1.5
    if release > 0:
        env[-release:] *= np.linspace(1.0, 0.0, release) ** 1.2
    body = (
        detuned_stack(root_hz / 2, n, rng, voices=2, detune_cents=2.5) * 0.5
        + detuned_stack(root_hz, n, rng, voices=3, detune_cents=4.0) * 0.36
        + detuned_stack(third_hz, n, rng, voices=2, detune_cents=4.0) * 0.24
        + detuned_stack(fifth_hz, n, rng, voices=2, detune_cents=4.0) * 0.22
        + detuned_stack(root_hz * 2, n, rng, voices=2, detune_cents=3.0) * 0.10
    )
    shimmer = colored_noise(n, rng, cutoff_hz=3200.0) * 0.03
    track[left:right] += ((body + shimmer) * env * 0.16).astype(np.float32)


# ---------------------------------------------------------------------------
# Top-level score assembly
# ---------------------------------------------------------------------------


def build_music_track(duration: float, chapters: Sequence[Chapter], ranges: dict[str, tuple[float, float]]) -> np.ndarray:
    """The harmonic bed: one chapter-aware pad, voice-led through an aeolian centre."""
    track = np.zeros(int((duration + 0.25) * SAMPLE_RATE), dtype=np.float32)
    if not chapters:
        return track
    count = len(chapters)
    for index, chapter in enumerate(chapters):
        start, end = ranges.get(chapter.id, (0.0, duration))
        chord = chapter_chord(index, count)
        rng = np.random.default_rng(1000 + chapter.seed + index)
        render_chapter_pad(track, start, max(start, end), chord, chapter.density, chapter.motion, rng)
        if index == count - 1:
            tail_start = max(start, end - min(3.2, max(1.0, (end - start) * 0.5)))
            render_resolution_tail(track, tail_start, max(1.5, duration + 0.25 - tail_start), chord, rng)
    return track


def build_sfx_track(duration: float, chapters: Sequence[Chapter], ranges: dict[str, tuple[float, float]],
                    cue_times: list[tuple[float, str]] | None = None) -> np.ndarray:
    """Structural sound design: the opening seal, each chapter join, the final resolve."""
    track = np.zeros(int((duration + 0.25) * SAMPLE_RATE), dtype=np.float32)
    rng = np.random.default_rng(8291)
    if not chapters:
        return track
    # Opening seal.
    render_air_swell(track, 0.0, 1.1, rng, gain=0.13, cutoff_hz=2600.0)
    render_impact(track, 0.02, rng, gain=0.4, low_hz=40.0)

    count = len(chapters)
    for index, chapter in enumerate(chapters):
        start, end = ranges.get(chapter.id, (0.0, duration))
        if index:
            render_riser(track, max(0.0, start - 0.45), start, rng, gain=0.13)
            render_impact(track, start, rng, gain=0.34, low_hz=44.0 + 3.0 * (index % 4))
            render_air_swell(track, start, 0.5, rng, gain=0.06, cutoff_hz=1800.0)
        if chapter.motif in {"signal", "network", "evidence"}:
            for offset in (0.22, 0.58, 0.94):
                if start + offset < end:
                    render_air_swell(track, start + offset, 0.3, rng, gain=0.045, cutoff_hz=3400.0)
        if chapter.motif == "fracture":
            for offset in (0.12, 0.24, 0.37):
                render_impact(track, start + offset, rng, gain=0.16, low_hz=70.0)
        if index == count - 1:
            render_riser(track, max(start, end - 1.0), end, rng, gain=0.1)
    for cue_time, kind in cue_times or []:
        if kind in {"reduces", "contrasts"}:
            render_impact(track, cue_time, rng, gain=0.16, low_hz=62.0)
        elif kind in {"creates", "enables", "reinforces"}:
            render_air_swell(track, max(0.0, cue_time - 0.08), 0.42, rng, gain=0.07, cutoff_hz=3900.0)
        else:
            render_impact(track, cue_time, rng, gain=0.08, low_hz=84.0)
    return track


# ---------------------------------------------------------------------------
# Visual envelopes -- the score, exported as per-frame drive signals instead
# of synthesized to audio. See the module docstring for why this is analytic
# rather than FFT-derived.
# ---------------------------------------------------------------------------

_BEAT_DECAY_CONST = 2.5
"""The task brief's pulse shape: `exp(-elapsed * 2.5 / (fps/2))`, `elapsed` in
FRAMES since the onset (not seconds) -- at 30fps that half-lives in ~4 frames
(~0.14s), which is what makes it read as a brief kick, not a slow swell."""
_BEAT_WINDOW_FRAMES = 90
"""Past this many frames every onset's pulse has decayed under 1e-3 at any fps
this project ships (the decay constant scales with fps, so the *time* window
shrinks as fps grows) -- capping the per-onset write window keeps `_beat_pulses`
linear in onset count instead of onset count times full-timeline length."""


def _fade_seconds(dur: float) -> float:
    """Same shape as `_fade_window`'s `fade` (render_chapter_pad), expressed in
    seconds instead of samples so the visual envelope can reuse it directly."""
    return min(1.4, max(0.15, dur * 0.22))


def _window_envelope(t_rel: np.ndarray, dur: float, fade: float) -> np.ndarray:
    """Continuous version of `_fade_window`'s linear in/out ramp, evaluated at
    arbitrary sample times (video frame times) rather than a sample count."""
    win = np.ones_like(t_rel)
    if fade > 0:
        win = np.minimum(win, np.clip(t_rel / fade, 0.0, 1.0))
        win = np.minimum(win, np.clip((dur - t_rel) / fade, 0.0, 1.0))
    return win


def _beat_pulses(onset_times: Sequence[float], n_frames: int, fps: int) -> np.ndarray:
    """One `exp(-elapsed * 2.5 / (fps/2))` pulse per onset, `elapsed` in frames
    since that onset -- a smooth 1 -> 0 ramp per hit rather than a binary flag.
    Overlapping pulses take the max, not the sum, so a cluster of onsets (a
    chapter cut landing near a texture pulse) still reads as one clean kick
    instead of clipping into a brighter-than-any-single-onset spike."""
    beat = np.zeros(n_frames, dtype=np.float32)
    if not onset_times or n_frames <= 0:
        return beat
    decay_rate = _BEAT_DECAY_CONST / max(1e-6, fps / 2.0)
    for onset in onset_times:
        onset_frame = int(round(onset * fps))
        start_frame = max(0, onset_frame)
        end_frame = min(n_frames, onset_frame + _BEAT_WINDOW_FRAMES)
        if end_frame <= start_frame:
            continue
        elapsed = np.arange(start_frame, end_frame) - onset_frame
        pulse = np.exp(-elapsed * decay_rate)
        beat[start_frame:end_frame] = np.maximum(beat[start_frame:end_frame], pulse)
    return beat


def score_envelopes(
    chapters: Sequence[Chapter],
    ranges: dict[str, tuple[float, float]],
    duration: float,
    fps: int,
) -> dict[str, np.ndarray]:
    """Per-video-frame audio-reactive drive signals, one float32 0..1 array per
    key, sampled at `fps` across `[0, duration]` inclusive.

    Every value here comes from the SAME parameters `build_music_track` and
    `build_sfx_track` already use to compose the real audio (chapter
    density/motion, the swell LFO, the chapter-pad fade window, the texture
    pulse rate, and the structural SFX onset times) -- not from analysing the
    rendered mix. `bass`/`mid`/`treble`/`amplitude` are density/motion-shaped
    continuous envelopes; `beat` is the sparse onset-pulse train (see
    `_beat_pulses`). `voice` (narration presence) is a separate function below,
    since it is the one signal this module doesn't compose itself.
    """
    n = max(1, int(math.ceil(duration * fps)) + 1)
    if not chapters:
        # Mirrors build_music_track/build_sfx_track: no chapters means no score
        # at all, not even the opening seal -- there is nothing for it to open.
        zeros = np.zeros(n, dtype=np.float32)
        return {"bass": zeros, "mid": zeros.copy(), "treble": zeros.copy(),
                "amplitude": zeros.copy(), "beat": zeros.copy()}

    times = np.arange(n, dtype=np.float64) / fps
    bass = np.zeros(n, dtype=np.float64)
    mid = np.zeros(n, dtype=np.float64)
    treble = np.zeros(n, dtype=np.float64)
    amplitude = np.zeros(n, dtype=np.float64)
    onset_times: list[float] = [0.02]  # the opening seal's impact (build_sfx_track)

    count = len(chapters)
    for index, chapter in enumerate(chapters):
        start, end = ranges.get(chapter.id, (0.0, duration))
        dur = max(0.01, end - start)
        density = float(np.clip(chapter.density, 0.0, 1.0))
        motion = float(np.clip(chapter.motion, 0.0, 1.0))
        is_last = index == count - 1
        mask = (times >= start) & (times <= end if is_last else times < end)
        if not np.any(mask):
            continue
        t_rel = times[mask] - start
        fade = _fade_seconds(dur)
        win = _window_envelope(t_rel, dur, fade)
        # Exactly `render_chapter_pad`'s swell LFO -- same rate, same phase.
        swell_rate = 0.08 + motion * 0.55
        lfo = 0.62 + 0.38 * np.sin(2 * np.pi * swell_rate * t_rel - np.pi / 2)

        # Density drives how many detuned voices stack into the pad (more low
        # end); motion drives the pulse-train rate and the swell's restlessness
        # (more high-frequency motion) -- see render_chapter_pad's own comments.
        bass[mask] = np.maximum(bass[mask], win * lfo * (0.35 + 0.65 * density))
        mid[mask] = np.maximum(mid[mask], win * (0.30 + 0.70 * density) * (0.5 + 0.5 * lfo))
        treble[mask] = np.maximum(treble[mask], win * (0.15 + 0.55 * motion) * (0.4 + 0.6 * lfo))
        amplitude[mask] = np.maximum(amplitude[mask], win * lfo * (0.40 + 0.60 * density))

        # Structural onsets, mirroring build_sfx_track exactly (same offsets, same
        # motif gates) so `beat` fires on the events that are actually audible.
        if index:
            onset_times.append(start)
        pulse_rate = 0.8 + motion * 3.2  # filtered_pulses' rate_hz
        k = 0
        while start + k / pulse_rate < end:
            onset_times.append(start + k / pulse_rate)
            k += 1
        if chapter.motif in {"signal", "network", "evidence"}:
            for offset in (0.22, 0.58, 0.94):
                if start + offset < end:
                    onset_times.append(start + offset)
        if chapter.motif == "fracture":
            for offset in (0.12, 0.24, 0.37):
                onset_times.append(start + offset)
        if is_last:
            onset_times.append(max(start, end - 1.0))

    return {
        "bass": np.clip(bass, 0.0, 1.0).astype(np.float32),
        "mid": np.clip(mid, 0.0, 1.0).astype(np.float32),
        "treble": np.clip(treble, 0.0, 1.0).astype(np.float32),
        "amplitude": np.clip(amplitude, 0.0, 1.0).astype(np.float32),
        "beat": _beat_pulses(onset_times, n, fps),
    }


_VOICE_FLOOR_DB = -45.0  # matches audio.design.DUCK_FLOOR_DB: below this, treated as silence
_VOICE_FULL_DB = -28.0  # matches audio.design.DUCK_FULL_DB: at/above this, envelope reads 1.0
_VOICE_ATTACK_MS = 30.0
_VOICE_RELEASE_MS = 180.0


def voice_envelope(voice_path: Path, n_frames: int, fps: int) -> np.ndarray:
    """Smoothed RMS of the narration WAV, one float32 0..1 sample per video frame.

    Unlike `score_envelopes`, this genuinely reads the rendered voice waveform --
    narration isn't composed by this module, so there is no structure to export
    instead. Same floor/full-dB mapping and attack/release envelope-follower
    shape as `audio.design.voice_duck_curve`, just pooled at the video's frame
    rate instead of a 10ms control rate, so the visuals breathe with the actual
    spoken cadence (word by word), not just the music.
    """
    if n_frames <= 0:
        return np.zeros(0, dtype=np.float32)
    voice = read_wav(voice_path).mean(axis=1)
    if len(voice) == 0:
        return np.zeros(n_frames, dtype=np.float32)

    frame_len = max(1, int(round(SAMPLE_RATE / fps)))
    num_frames = int(np.ceil(len(voice) / frame_len))
    padded = np.pad(voice.astype(np.float64), (0, num_frames * frame_len - len(voice)))
    frames = padded.reshape(num_frames, frame_len)
    rms = np.sqrt(np.mean(frames * frames, axis=1) + 1e-12)
    db = 20.0 * np.log10(np.maximum(rms, 1e-8))
    target = np.clip((db - _VOICE_FLOOR_DB) / max(1e-6, _VOICE_FULL_DB - _VOICE_FLOOR_DB), 0.0, 1.0)

    frame_ms = 1000.0 / fps
    alpha_attack = float(np.exp(-frame_ms / _VOICE_ATTACK_MS))
    alpha_release = float(np.exp(-frame_ms / _VOICE_RELEASE_MS))
    smoothed = np.empty(num_frames, dtype=np.float64)
    env = 0.0
    for i in range(num_frames):
        v = target[i]
        alpha = alpha_attack if v > env else alpha_release
        env = alpha * env + (1.0 - alpha) * v
        smoothed[i] = env

    if num_frames >= n_frames:
        out = smoothed[:n_frames]
    else:
        out = np.pad(smoothed, (0, n_frames - num_frames), mode="edge")
    return out.astype(np.float32)
