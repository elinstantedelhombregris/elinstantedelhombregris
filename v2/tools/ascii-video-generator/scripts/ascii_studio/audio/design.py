"""Procedural music/SFX synthesis and the final voice+music+sfx mix.

The score itself (harmony, texture, structural sound design) lives in
`ascii_studio.audio.score`, which is chapter-aware: it follows the
storyboard's chapters, their time ranges and their `motion`/`density`
parameters instead of holding one static drone. This module orchestrates
that score and owns the mix engine: gain-staging the voice, sidechain-ducking
the bed under it, limiting only as a last resort, and finishing with a
loudness-normalised master via ffmpeg.
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path
from typing import Sequence

import numpy as np

from ascii_studio.audio import score as score_module
from ascii_studio.audio.io import SAMPLE_RATE, read_wav, write_wav
from ascii_studio.storyboard.schema import Chapter

# ---------------------------------------------------------------------------
# Legacy primitives — kept for backward-compatible imports (unused by the
# chapter-aware score below, which builds its own textures).
# ---------------------------------------------------------------------------


def add_tone(track: np.ndarray, start: float, duration: float, hz: float, gain: float, decay: float = 3.0) -> None:
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), left + int(duration * SAMPLE_RATE))
    if right <= left:
        return
    t = np.arange(right - left, dtype=np.float32) / SAMPLE_RATE
    envelope = np.minimum(1.0, t * 18.0) * np.exp(-t * decay)
    track[left:right] += gain * envelope * np.sin(2 * np.pi * hz * t)


def add_noise(track: np.ndarray, start: float, duration: float, gain: float, rng: np.random.Generator) -> None:
    left = max(0, int(start * SAMPLE_RATE))
    right = min(len(track), left + int(duration * SAMPLE_RATE))
    if right <= left:
        return
    t = np.arange(right - left, dtype=np.float32) / SAMPLE_RATE
    envelope = np.sin(np.pi * np.clip(t / max(duration, 0.01), 0, 1)) ** 2
    noise = rng.standard_normal(right - left).astype(np.float32)
    filtered = np.convolve(noise, np.ones(24, dtype=np.float32) / 24.0, mode="same")
    track[left:right] += gain * envelope * filtered


# ---------------------------------------------------------------------------
# Mix-safe limiting
# ---------------------------------------------------------------------------


def soft_limit(x: np.ndarray, threshold: float = 0.9) -> np.ndarray:
    """Linear below `threshold`; tanh-compressed asymptotically towards 1.0 above it.

    This is deliberately not a global tanh over the whole signal — quiet
    passages pass through untouched, only the rare peak gets caught.
    """
    ax = np.abs(x)
    over = ax > threshold
    if not np.any(over):
        return x
    out = x.copy()
    span = max(1e-6, 1.0 - threshold)
    excess = (ax[over] - threshold) / span
    compressed = threshold + span * np.tanh(excess)
    out[over] = np.sign(x[over]) * compressed
    return out


def build_music(duration: float, chapters: Sequence[Chapter], ranges: dict[str, tuple[float, float]]) -> np.ndarray:
    track = score_module.build_music_track(duration, chapters, ranges)
    return soft_limit(track, threshold=0.9)


def build_sfx(duration: float, chapters: Sequence[Chapter], ranges: dict[str, tuple[float, float]],
              cue_times: list[tuple[float, str]] | None = None,
              sound_style: str = "cinematic") -> np.ndarray:
    track = score_module.build_sfx_track(
        duration, chapters, ranges, cue_times=cue_times, sound_style=sound_style,
    )
    return soft_limit(track, threshold=0.9)


def stereoize(x: np.ndarray, width: float = 0.28, delay_ms: float = 9.0) -> np.ndarray:
    """Create a correlation-safe stereo bed while keeping narration in the centre."""
    mono = np.asarray(x, dtype=np.float32)
    if mono.ndim == 2:
        return mono
    delay = max(1, int(SAMPLE_RATE * delay_ms / 1000.0))
    shifted = np.pad(mono[:-delay], (delay, 0)) if len(mono) > delay else np.zeros_like(mono)
    side = (shifted - mono) * float(np.clip(width, 0.0, 0.7))
    return np.column_stack((mono + side, mono - side)).astype(np.float32)


# ---------------------------------------------------------------------------
# Voice gain-staging + sidechain ducking
# ---------------------------------------------------------------------------

VOICE_TARGET_DBFS = -20.0  # gain-staging target for the voice, before the bed is placed under it
VOICE_HEADROOM_DB = 1.0

DUCK_AMOUNT_DB = 9.0
DUCK_ATTACK_MS = 20.0
DUCK_RELEASE_MS = 250.0
DUCK_FRAME_MS = 10.0
DUCK_FLOOR_DB = -45.0  # below this level the voice is treated as silent: no ducking
DUCK_FULL_DB = -28.0  # at/above this level the bed is ducked the full DUCK_AMOUNT_DB


def normalize_to_dbfs(x: np.ndarray, target_dbfs: float = VOICE_TARGET_DBFS, headroom_db: float = VOICE_HEADROOM_DB) -> tuple[np.ndarray, float]:
    """Normalise `x` so its RMS sits at `target_dbfs`, without letting peaks exceed headroom."""
    rms = float(np.sqrt(np.mean(np.square(x, dtype=np.float64)) + 1e-12))
    if rms < 1e-6:
        return x, 1.0
    target_rms = 10.0 ** (target_dbfs / 20.0)
    gain = target_rms / rms
    peak = float(np.max(np.abs(x))) * gain
    max_peak = 10.0 ** (-headroom_db / 20.0)
    if peak > max_peak and peak > 0:
        gain *= max_peak / peak
    return (x * gain).astype(np.float32), gain


def voice_duck_curve(
    voice: np.ndarray,
    duck_db: float = DUCK_AMOUNT_DB,
    attack_ms: float = DUCK_ATTACK_MS,
    release_ms: float = DUCK_RELEASE_MS,
    frame_ms: float = DUCK_FRAME_MS,
    floor_db: float = DUCK_FLOOR_DB,
    full_db: float = DUCK_FULL_DB,
) -> np.ndarray:
    """Per-sample gain multiplier (<=1.0) for the bed, driven by a smoothed RMS of the voice.

    Frame RMS is computed at a coarse control rate, converted to dB, mapped
    to a 0..1 "voice active" amount between `floor_db` (silence, no duck) and
    `full_db` (fully engaged, -duck_db), then smoothed with a classic
    asymmetric attack/release envelope follower before being interpolated
    back up to sample rate.
    """
    n = len(voice)
    if n == 0:
        return np.ones(0, dtype=np.float32)
    frame = max(1, int(SAMPLE_RATE * frame_ms / 1000.0))
    num_frames = int(np.ceil(n / frame))
    padded = np.pad(voice.astype(np.float64), (0, num_frames * frame - n))
    frames = padded.reshape(num_frames, frame)
    rms = np.sqrt(np.mean(frames * frames, axis=1) + 1e-12)
    db = 20.0 * np.log10(np.maximum(rms, 1e-8))
    target = np.clip((db - floor_db) / max(1e-6, full_db - floor_db), 0.0, 1.0)

    alpha_attack = float(np.exp(-frame_ms / max(1e-6, attack_ms)))
    alpha_release = float(np.exp(-frame_ms / max(1e-6, release_ms)))
    smoothed = np.empty(num_frames, dtype=np.float64)
    env = 0.0
    for i in range(num_frames):
        v = target[i]
        alpha = alpha_attack if v > env else alpha_release
        env = alpha * env + (1.0 - alpha) * v
        smoothed[i] = env

    gain_db = -duck_db * smoothed
    gain_frames = 10.0 ** (gain_db / 20.0)
    frame_centers = (np.arange(num_frames) + 0.5) * frame
    gain = np.interp(np.arange(n), frame_centers, gain_frames)
    return gain.astype(np.float32)


# ---------------------------------------------------------------------------
# Final loudness normalisation (ffmpeg two-pass loudnorm)
# ---------------------------------------------------------------------------

LOUDNORM_I = -14.0
# Leave codec headroom before AAC.  Short, dry transients (especially the new
# press/stamp language) gained about 2 dBTP during AAC encoding in a measured
# smoke master; -3.5 dBTP in the PCM mix lands safely below -0.8 dBTP in the
# distributed MP4 while preserving the -14 LUFS programme target.
LOUDNORM_TP = -3.5
LOUDNORM_LRA = 11.0


def _measure_loudnorm(path: Path) -> dict | None:
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
        "-af", f"loudnorm=I={LOUDNORM_I}:TP={LOUDNORM_TP}:LRA={LOUDNORM_LRA}:print_format=json",
        "-f", "null", "-",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    text = proc.stderr
    start, end = text.rfind("{"), text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def _apply_loudnorm(src: Path, dst: Path, measured: dict | None) -> bool:
    if measured is not None:
        try:
            af = (
                f"loudnorm=I={LOUDNORM_I}:TP={LOUDNORM_TP}:LRA={LOUDNORM_LRA}:"
                f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
                f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
                f"offset={measured.get('target_offset', 0)}:linear=true:print_format=summary"
            )
            cmd = [
                "ffmpeg", "-y", "-hide_banner", "-nostats", "-i", str(src),
                "-af", af, "-ar", str(SAMPLE_RATE), "-c:a", "pcm_s16le", str(dst),
            ]
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            return True
        except (subprocess.CalledProcessError, KeyError):
            pass
    # Fallback: single-pass dynamic loudnorm. Robust for very short/edge inputs
    # (e.g. smoke-test renders) where two-pass linear measurement is unreliable.
    try:
        af = f"loudnorm=I={LOUDNORM_I}:TP={LOUDNORM_TP}:LRA={LOUDNORM_LRA}"
        cmd = [
            "ffmpeg", "-y", "-hide_banner", "-nostats", "-i", str(src),
            "-af", af, "-ar", str(SAMPLE_RATE), "-c:a", "pcm_s16le", str(dst),
        ]
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError:
        return False


def _loudness_normalize(src: Path, dst: Path) -> None:
    measured = _measure_loudnorm(src)
    if not _apply_loudnorm(src, dst, measured):
        # ffmpeg unavailable/failed entirely: fall back to the raw mix rather than crash.
        dst.write_bytes(src.read_bytes())


# ---------------------------------------------------------------------------
# Mix
# ---------------------------------------------------------------------------

MUSIC_GAIN = 0.85
SFX_GAIN = 0.8
BED_LIMIT_THRESHOLD = 0.85
MIX_LIMIT_THRESHOLD = 0.92


def mix_audio(voice_path: Path, music: np.ndarray, sfx: np.ndarray, out_dir: Path, slug: str) -> tuple[Path, Path, Path]:
    voice = read_wav(voice_path).mean(axis=1)
    length = max(len(voice), len(music), len(sfx))
    pad = lambda samples: np.pad(samples, (0, length - len(samples)))
    voice, music, sfx = pad(voice), pad(music), pad(sfx)

    voice_norm, _gain = normalize_to_dbfs(voice)
    duck = voice_duck_curve(voice_norm)

    music_stereo = stereoize(music, width=0.22, delay_ms=11.0)
    sfx_stereo = stereoize(sfx, width=0.42, delay_ms=17.0)
    bed = music_stereo * MUSIC_GAIN + sfx_stereo * SFX_GAIN
    bed = soft_limit(bed, threshold=BED_LIMIT_THRESHOLD)
    bed_ducked = (bed * duck[:, None]).astype(np.float32)

    voice_stereo = np.column_stack((voice_norm, voice_norm))
    mix_raw = voice_stereo + bed_ducked
    mix_raw = soft_limit(mix_raw, threshold=MIX_LIMIT_THRESHOLD)

    music_path = out_dir / f"{slug}-music-stem.wav"
    sfx_path = out_dir / f"{slug}-sound-design-stem.wav"
    mix_path = out_dir / f"{slug}-mix.wav"
    write_wav(music_path, music_stereo)
    write_wav(sfx_path, sfx_stereo)

    with tempfile.TemporaryDirectory(prefix="ascii-studio-mix-") as tmp:
        raw_path = Path(tmp) / f"{slug}-mix-raw.wav"
        write_wav(raw_path, mix_raw)
        _loudness_normalize(raw_path, mix_path)

    return music_path, sfx_path, mix_path
