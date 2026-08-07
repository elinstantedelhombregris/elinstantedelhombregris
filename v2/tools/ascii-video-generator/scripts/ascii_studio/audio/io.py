"""WAV read/write helpers."""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SAMPLE_RATE = 48_000


def write_wav(path: Path, samples: np.ndarray, sample_rate: int = SAMPLE_RATE) -> None:
    samples = np.asarray(samples)
    if samples.ndim == 1:
        samples = samples[:, None]
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(pcm.shape[1])
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm.tobytes())


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        width = wav.getsampwidth()
        if width != 2:
            raise RuntimeError(f"Expected 16-bit WAV audio: {path}")
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").astype(np.float32) / 32768.0
    return samples.reshape(-1, channels)


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as wav:
        return wav.getnframes() / wav.getframerate()


def silence_wav(path: Path, duration: float) -> None:
    write_wav(path, np.zeros(max(1, int(duration * SAMPLE_RATE)), dtype=np.float32))
