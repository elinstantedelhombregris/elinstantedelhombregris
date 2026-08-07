"""Social derivatives that do not require changing the narration timeline."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


def probe(path: Path) -> dict:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def duration(path: Path) -> float:
    return float(probe(path)["format"]["duration"])


def hook_cut(master: Path, out: Path, seconds: float = 45.0) -> Path:
    length = min(max(1.0, seconds), duration(master))
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(master),
        "-t", f"{length:.3f}", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out),
    ], check=True)
    return out


def seamless_loop(master: Path, out: Path, overlap: float = 0.7) -> Path:
    total = duration(master)
    overlap = min(max(0.2, overlap), max(0.2, total / 4))
    tail = max(0.0, total - overlap)
    filter_graph = (
        f"[0:v]split=3[basev][headv][tailv];"
        f"[basev]trim=0:{tail:.6f},setpts=PTS-STARTPTS[bodyv];"
        f"[headv]trim=0:{overlap:.6f},setpts=PTS-STARTPTS[hv];"
        f"[tailv]trim={tail:.6f}:{total:.6f},setpts=PTS-STARTPTS[tv];"
        f"[tv][hv]xfade=transition=fade:duration={overlap:.6f}:offset=0[blendv];"
        f"[bodyv][blendv]concat=n=2:v=1:a=0[v];"
        f"[0:a]asplit=3[basea][heada][taila];"
        f"[basea]atrim=0:{tail:.6f},asetpts=PTS-STARTPTS[bodya];"
        f"[heada]atrim=0:{overlap:.6f},asetpts=PTS-STARTPTS[ha];"
        f"[taila]atrim={tail:.6f}:{total:.6f},asetpts=PTS-STARTPTS[ta];"
        f"[ta][ha]acrossfade=d={overlap:.6f}:c1=tri:c2=tri[blenda];"
        f"[bodya][blenda]concat=n=2:v=0:a=1[a]"
    )
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(master),
        "-filter_complex", filter_graph, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out),
    ], check=True)
    return out


def contact_sheet(master: Path, out: Path, count: int = 12, columns: int = 4) -> Path:
    total = max(0.1, duration(master))
    rows = -(-count // columns)
    rate = count / total
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(master),
        "-vf", f"fps={rate:.8f},scale=270:-2,tile={columns}x{rows}",
        "-frames:v", "1", str(out),
    ], check=True)
    return out
