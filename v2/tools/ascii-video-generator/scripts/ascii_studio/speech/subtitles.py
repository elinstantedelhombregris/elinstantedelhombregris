"""SRT/VTT subtitle export."""

from __future__ import annotations

from pathlib import Path
from typing import Sequence

from ascii_studio.storyboard.schema import Caption


def srt_time(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def vtt_time(seconds: float) -> str:
    return srt_time(seconds).replace(",", ".")


def write_subtitles(captions: Sequence[Caption], srt_path: Path, vtt_path: Path) -> None:
    srt: list[str] = []
    vtt = ["WEBVTT", ""]
    for caption in captions:
        srt.extend([str(caption.index), f"{srt_time(caption.start)} --> {srt_time(caption.end)}", caption.text, ""])
        vtt.extend([f"{vtt_time(caption.start)} --> {vtt_time(caption.end)}", caption.text, ""])
    srt_path.write_text("\n".join(srt), encoding="utf-8")
    vtt_path.write_text("\n".join(vtt), encoding="utf-8")
