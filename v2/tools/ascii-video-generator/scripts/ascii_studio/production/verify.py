"""Film-level quality gates over rendered artifacts."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import cv2
import numpy as np

from .package import probe


def _audio_metrics(path: Path) -> dict[str, float]:
    result = subprocess.run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-",
    ], capture_output=True, text=True)
    start, end = result.stderr.rfind("{"), result.stderr.rfind("}")
    if start < 0 or end < start:
        return {}
    try:
        payload = json.loads(result.stderr[start:end + 1])
        return {
            "integrated_lufs": float(payload["input_i"]),
            "true_peak_dbtp": float(payload["input_tp"]),
            "loudness_range_lu": float(payload["input_lra"]),
        }
    except (ValueError, KeyError, json.JSONDecodeError):
        return {}


def _sample_frames(path: Path, count: int = 12) -> list[np.ndarray]:
    capture = cv2.VideoCapture(str(path))
    frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    indexes = np.linspace(0, max(0, frames - 1), min(count, max(1, frames))).astype(int)
    output = []
    for index in indexes:
        capture.set(cv2.CAP_PROP_POS_FRAMES, int(index))
        ok, frame = capture.read()
        if ok:
            output.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    capture.release()
    return output


def _signature_bright_fraction(frames: list[np.ndarray], paper: bool = False) -> float:
    """Measure persistent signature ink in the reserved right-hand footer.

    The chapter keyword occupies the left side, so it cannot satisfy this gate.
    Normalized coordinates keep the same check valid for vertical, square, and
    landscape masters. Emissive looks use bright ink; paper uses dark ink.
    """
    ratios: list[float] = []
    for frame in frames:
        height, width = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        footer = gray[
            int(height * 0.82):int(height * 0.88),
            int(width * 0.28):int(width * 0.97),
        ]
        if footer.size:
            ratios.append(float(np.mean(footer < 112 if paper else footer > 150)))
    return float(np.median(ratios)) if ratios else 0.0


def _brand_accent_fraction(frames: list[np.ndarray]) -> float:
    """Fraction of pixels carrying the canonical violet or stamp red pigments."""
    if not frames:
        return 0.0
    targets = (np.array([82, 39, 204]), np.array([194, 59, 34]))
    values: list[float] = []
    for frame in frames:
        sample = frame[::4, ::4].astype(np.int16)
        near = np.zeros(sample.shape[:2], dtype=bool)
        for target in targets:
            near |= np.sqrt(np.sum((sample - target) ** 2, axis=2)) < 58.0
        values.append(float(np.mean(near)))
    return float(np.median(values))


def _background_structure(frames: list[np.ndarray]) -> float:
    """Median edge density in the narrative stage, excluding captions and UI."""
    values: list[float] = []
    for frame in frames:
        height, width = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        stage = gray[int(height * 0.105):int(height * 0.60), int(width * 0.04):int(width * 0.96)]
        if stage.size:
            edges = cv2.Canny(stage, 38, 110)
            values.append(float(np.mean(edges > 0)))
    return float(np.median(values)) if values else 0.0


def _adjacent_motion(path: Path, samples: int = 6) -> float:
    capture = cv2.VideoCapture(str(path))
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    values: list[float] = []
    for index in np.linspace(1, max(1, frame_count - 2), min(samples, max(1, frame_count - 2))).astype(int):
        capture.set(cv2.CAP_PROP_POS_FRAMES, int(index))
        ok_a, a = capture.read()
        ok_b, b = capture.read()
        if ok_a and ok_b:
            a_gray = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY).astype(np.float32)
            b_gray = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY).astype(np.float32)
            values.append(float(np.mean(np.abs(a_gray - b_gray))))
    capture.release()
    return float(np.median(values)) if values else 0.0


def verify_package(master: Path, cover: Path, storyboard, captions: list, word_timings: list,
                   expected_width: int, expected_height: int,
                   required_assets: dict[str, str] | None = None,
                   platform_url: str = "") -> dict:
    media = probe(master)
    video = next(stream for stream in media["streams"] if stream["codec_type"] == "video")
    audio = next((stream for stream in media["streams"] if stream["codec_type"] == "audio"), {})
    frames = _sample_frames(master)
    grayscale = [cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY).astype(np.float32) for frame in frames]
    brightness = [float(value.mean()) for value in grayscale]
    differences = [
        float(np.mean(np.abs(a - b))) for a, b in zip(grayscale, grayscale[1:])
    ]
    paper_look = str(getattr(storyboard, "look", "")).startswith("tinta-papel")
    signature_bright_fraction = _signature_bright_fraction(frames, paper=paper_look)
    brand_accent_fraction = _brand_accent_fraction(frames) if paper_look else 0.0
    background_structure = _background_structure(frames)
    shot_counts = [len(chapter.shots) for chapter in storyboard.chapters]
    semantic = [bool(chapter.anchors and chapter.archetype) for chapter in storyboard.chapters]
    audio_metrics = _audio_metrics(master)
    duration_seconds = float(media.get("format", {}).get("duration", 0.0) or 0.0)
    temporal_applicable = duration_seconds >= 5.0
    adjacent_motion = _adjacent_motion(master) if temporal_applicable else 0.0
    v4 = int(getattr(storyboard, "version", 0) or 0) >= 4
    worlds = [getattr(chapter, "world", "abstract-field") for chapter in storyboard.chapters]
    world_diversity = len(set(worlds)) / max(1, len(worlds))
    # EBU-style integrated loudness is not meaningful on the two-second
    # diagnostic renders used by the compatibility suite.  Real deliverables
    # remain subject to the full -14 LUFS target window.
    loudness_applicable = duration_seconds >= 3.0
    cover_image = cv2.imread(str(cover), cv2.IMREAD_GRAYSCALE)
    cover_contrast = float(cover_image.std()) if cover_image is not None else 0.0
    frame_contrast = float(np.median([value.std() for value in grayscale])) if grayscale else 0.0
    timings_ordered = all(
        value.end >= value.start and (index == 0 or value.start >= word_timings[index - 1].start)
        for index, value in enumerate(word_timings)
    )
    assets_complete = all(
        Path(value).exists() and Path(value).stat().st_size > 0
        for value in (required_assets or {}).values()
    )
    checks = {
        "canvas": int(video["width"]) == expected_width and int(video["height"]) == expected_height,
        "h264": video.get("codec_name") == "h264",
        "yuv420p": video.get("pix_fmt") == "yuv420p",
        "aac": audio.get("codec_name") == "aac",
        "audio_stereo": int(audio.get("channels", 0)) == 2,
        "audio_loudness": (not loudness_applicable) or (
            -16.5 <= audio_metrics.get("integrated_lufs", -99.0) <= -11.5
        ),
        "audio_true_peak": audio_metrics.get("true_peak_dbtp", 99.0) <= -0.8,
        "caption_word_parity": sum(len(caption.words) for caption in captions) == len(word_timings),
        "caption_timing_order": timings_ordered,
        "caption_visible_parity": all(len(caption.text.split()) == len(caption.words) for caption in captions),
        "three_shots_per_chapter": all(value >= 3 for value in shot_counts),
        "semantic_chapters": all(semantic),
        "visual_change": bool(differences) and float(np.median(differences)) > 1.2,
        "exposure": bool(brightness) and (
            145.0 < float(np.mean(brightness)) < 246.0 if paper_look
            else 8.0 < float(np.mean(brightness)) < 95.0
        ),
        "cover_exists": cover.exists() and cover.stat().st_size > 10_000,
        "cover_mobile_contrast": cover_contrast > 18.0,
        "platform_signature": bool(platform_url.strip()) and signature_bright_fraction > (0.012 if paper_look else 0.008),
        "paper_surface": (not paper_look) or (
            bool(brightness) and float(np.mean(brightness)) > 145.0 and frame_contrast > 24.0
        ),
        "paper_brand_accents": (not paper_look) or brand_accent_fraction > 0.00004,
        "cinematic_worlds": (not v4) or all(value not in {"", "abstract-field"} for value in worlds),
        "four_depth_planes": (not v4) or all(
            int(getattr(chapter, "depth_layers", 0)) >= 4 for chapter in storyboard.chapters
        ),
        "semantic_metamorphosis": (not v4) or all(
            getattr(chapter, "metamorphosis", "") not in {"", "none", "reveal"}
            for chapter in storyboard.chapters
        ),
        "world_diversity": (not v4) or world_diversity >= 0.75,
        "background_structure": (not v4) or 0.008 <= background_structure <= 0.38,
        "temporal_coherence": (not v4) or (not temporal_applicable) or 0.02 <= adjacent_motion <= 12.0,
        "hero_plate_contact_sheet": (not v4) or bool(
            (required_assets or {}).get("hero_plate_contact_sheet")
            and Path((required_assets or {})["hero_plate_contact_sheet"]).exists()
            and Path((required_assets or {})["hero_plate_contact_sheet"]).stat().st_size > 20_000
        ),
        "required_assets": assets_complete,
    }
    derivative_specs = {"square": (1080, 1080), "landscape": (1440, 810)}
    derivative_media: dict[str, dict] = {}
    for name, (width, height) in derivative_specs.items():
        path_value = (required_assets or {}).get(name)
        if not path_value:
            continue
        try:
            derivative = probe(Path(path_value))
            derivative_video = next(
                value for value in derivative["streams"] if value["codec_type"] == "video"
            )
            derivative_audio = next(
                value for value in derivative["streams"] if value["codec_type"] == "audio"
            )
            checks[f"{name}_delivery"] = (
                int(derivative_video.get("width", 0)) == width
                and int(derivative_video.get("height", 0)) == height
                and derivative_video.get("codec_name") == "h264"
                and derivative_video.get("pix_fmt") == "yuv420p"
                and derivative_audio.get("codec_name") == "aac"
                and int(derivative_audio.get("channels", 0)) == 2
            )
            derivative_media[name] = {
                "video": derivative_video,
                "audio": derivative_audio,
                "format": derivative.get("format", {}),
            }
        except (OSError, KeyError, StopIteration, ValueError):
            checks[f"{name}_delivery"] = False
    return {
        "passed": all(checks.values()),
        "checks": checks,
        "metrics": {
            "sample_brightness_mean": round(float(np.mean(brightness)), 3) if brightness else 0.0,
            "sample_frame_difference_median": round(float(np.median(differences)), 3) if differences else 0.0,
            "chapter_count": len(storyboard.chapters),
            "shots_per_chapter": shot_counts,
            "cover_contrast_stddev": round(cover_contrast, 3),
            "platform_signature_bright_fraction": round(signature_bright_fraction, 5),
            "brand_accent_fraction": round(brand_accent_fraction, 6),
            "sample_frame_contrast_stddev": round(frame_contrast, 3),
            "background_edge_density": round(background_structure, 5),
            "adjacent_frame_difference": round(adjacent_motion, 5),
            "temporal_coherence_applicable": temporal_applicable,
            "world_diversity": round(world_diversity, 3),
            "worlds": worlds,
            "audio_loudness_applicable": loudness_applicable,
            **audio_metrics,
        },
        "media": {
            "video": video, "audio": audio, "format": media.get("format", {}),
            "derivatives": derivative_media,
        },
    }


def write_report(path: Path, report: dict) -> Path:
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path
