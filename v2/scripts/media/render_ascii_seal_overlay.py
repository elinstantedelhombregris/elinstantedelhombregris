#!/usr/bin/env python3
"""Add an animated ASCII Cruz Orlada seal overlay to an existing MP4."""

from __future__ import annotations

import argparse
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


V2_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = (
    V2_ROOT
    / "apps/web/public/media/ascii-videos/la-ciencia-de-la-confianza/la-ciencia-de-la-confianza-mobile-full.mp4"
)
DEFAULT_OUTPUT = (
    V2_ROOT
    / "apps/web/public/media/ascii-videos/la-ciencia-de-la-confianza/la-ciencia-de-la-confianza-mobile-full-seal-test.mp4"
)
DEFAULT_LOGO = Path("/Users/juanb/Library/CloudStorage/OneDrive-Personal/Hombre Gris/Cruz Orlada Logo NB.png")
FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")

WIDTH = 720
HEIGHT = 1280
FPS = 15
KEYWORD_STREAM = "CONFIANZA SOBERANIA DISENO SERVICIO "
PALETTE = " .,:;ilI?+*tfLCG08@"


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def capture(command: list[str]) -> str:
    return subprocess.check_output(command, text=True).strip()


def smootherstep(value: float) -> float:
    x = max(0.0, min(1.0, value))
    return x * x * x * (x * (x * 6 - 15) + 10)


def crop_logo(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    alpha = arr[:, :, 3]
    luminance = arr[:, :, :3].mean(axis=2)
    mask = (alpha > 20) & (luminance > 18)
    ys, xs = np.where(mask)
    if len(xs) == 0 or len(ys) == 0:
        return rgba
    pad = 80
    left = max(0, int(xs.min()) - pad)
    top = max(0, int(ys.min()) - pad)
    right = min(rgba.width, int(xs.max()) + pad)
    bottom = min(rgba.height, int(ys.max()) + pad)
    return rgba.crop((left, top, right, bottom))


def make_ascii_logo(logo_path: Path, size: int, font_size: int, opacity_scale: float = 1.0) -> np.ndarray:
    source = crop_logo(Image.open(logo_path))
    source.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    left = (size - source.width) // 2
    top = (size - source.height) // 2
    canvas.alpha_composite(source, (left, top))
    src = np.asarray(canvas).astype(np.float32)
    luminance = 0.2126 * src[:, :, 0] + 0.7152 * src[:, :, 1] + 0.0722 * src[:, :, 2]
    mask = (src[:, :, 3] > 20) & (luminance > 18)

    font = ImageFont.truetype(str(FONT_PATH), font_size)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    glow_draw = ImageDraw.Draw(glow)
    stream_index = 0
    step_x = max(4, int(font_size * 0.68))
    step_y = max(6, int(font_size * 1.05))

    for y in range(0, size, step_y):
        for x in range(0, size, step_x):
            yy = slice(y, min(size, y + step_y))
            xx = slice(x, min(size, x + step_x))
            cell_mask = mask[yy, xx]
            if float(cell_mask.mean()) < 0.18:
                continue
            cell_luma = float(luminance[yy, xx][cell_mask].mean())
            cell_rgb = src[yy, xx, :3][cell_mask].mean(axis=0)
            glyph_index = min(len(PALETTE) - 1, max(1, int((cell_luma / 255.0) * (len(PALETTE) - 1))))
            glyph = KEYWORD_STREAM[stream_index % len(KEYWORD_STREAM)]
            if glyph == " ":
                glyph = PALETTE[glyph_index]
            stream_index += 1
            alpha = int(min(235, max(45, cell_luma * 0.88)) * opacity_scale)
            color = tuple(np.clip(cell_rgb * 1.1 + 18, 0, 255).astype(int).tolist() + [alpha])
            glow_color = tuple(np.clip(cell_rgb * 1.25 + 24, 0, 255).astype(int).tolist() + [min(120, alpha)])
            glow_draw.text((x, y), glyph, font=font, fill=glow_color)
            draw.text((x, y), glyph, font=font, fill=color)

    glow = glow.filter(ImageFilter.GaussianBlur(max(2, font_size // 3)))
    out = Image.alpha_composite(glow, out)
    return np.asarray(out).astype(np.float32)


def rotate_overlay(overlay: np.ndarray, degrees: float, scale: float = 1.0) -> np.ndarray:
    img = Image.fromarray(np.clip(overlay, 0, 255).astype(np.uint8), "RGBA")
    if abs(scale - 1.0) > 0.001:
        new_size = max(8, int(img.width * scale))
        img = img.resize((new_size, new_size), Image.Resampling.LANCZOS)
    if abs(degrees) > 0.001:
        img = img.rotate(degrees, resample=Image.Resampling.BICUBIC, expand=True)
    return np.asarray(img).astype(np.float32)


def with_alpha_mask(overlay: np.ndarray, opacity: float, reveal: float = 1.0) -> np.ndarray:
    result = overlay.copy()
    alpha = result[:, :, 3] / 255.0
    if reveal < 0.999:
        h, w = alpha.shape
        yy, xx = np.mgrid[0:h, 0:w]
        cx = (w - 1) / 2
        cy = (h - 1) / 2
        radius = np.sqrt(((xx - cx) / max(1, w / 2)) ** 2 + ((yy - cy) / max(1, h / 2)) ** 2)
        radial = np.clip((reveal * 1.35 - radius) * 8.0, 0.0, 1.0)
        scan = np.clip((reveal * h - yy + h * 0.08) / max(1, h * 0.22), 0.0, 1.0)
        alpha *= np.maximum(radial, scan * 0.72)
    result[:, :, 3] = np.clip(alpha * 255.0 * opacity, 0, 255)
    return result


def blend_rgba(frame_bgr: np.ndarray, overlay_rgba: np.ndarray, center: tuple[int, int]) -> None:
    h, w = overlay_rgba.shape[:2]
    cx, cy = center
    x0 = int(cx - w / 2)
    y0 = int(cy - h / 2)
    x1 = max(0, x0)
    y1 = max(0, y0)
    x2 = min(frame_bgr.shape[1], x0 + w)
    y2 = min(frame_bgr.shape[0], y0 + h)
    if x1 >= x2 or y1 >= y2:
        return
    ox1 = x1 - x0
    oy1 = y1 - y0
    ox2 = ox1 + (x2 - x1)
    oy2 = oy1 + (y2 - y1)
    overlay = overlay_rgba[oy1:oy2, ox1:ox2]
    alpha = (overlay[:, :, 3:4] / 255.0).astype(np.float32)
    if float(alpha.max()) <= 0.001:
        return
    overlay_bgr = overlay[:, :, :3][:, :, ::-1]
    region = frame_bgr[y1:y2, x1:x2].astype(np.float32)
    frame_bgr[y1:y2, x1:x2] = np.clip(region * (1.0 - alpha) + overlay_bgr * alpha, 0, 255).astype(np.uint8)


def timed_pulse(t: float, start: float, duration: float) -> float:
    local = (t - start) / duration
    if local < 0.0 or local > 1.0:
        return 0.0
    return math.sin(math.pi * local)


def render_overlay(input_path: Path, output_path: Path, logo_path: Path) -> dict[str, object]:
    duration = float(capture(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(input_path)]))
    capture_obj = cv2.VideoCapture(str(input_path))
    if not capture_obj.isOpened():
        raise RuntimeError(f"Could not open {input_path}")
    width = int(capture_obj.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(capture_obj.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(capture_obj.get(cv2.CAP_PROP_FPS)) or FPS
    if (width, height) != (WIDTH, HEIGHT):
        raise RuntimeError(f"Expected {WIDTH}x{HEIGHT}, got {width}x{height}")

    large_logo = make_ascii_logo(logo_path, 520, 9, 0.98)
    final_logo = make_ascii_logo(logo_path, 560, 10, 0.95)
    small_logo = make_ascii_logo(logo_path, 118, 5, 0.92)
    micro_logo = make_ascii_logo(logo_path, 150, 6, 0.96)

    transition_starts = [42.0, 75.0, 127.0, 178.0, 228.0, 276.0]
    watermark_starts = [32.0, 88.0, 144.0, 200.0, 256.0, 306.0]
    final_start = max(0.0, duration - 7.2)

    command = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "bgr24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        f"{fps:.6f}",
        "-i",
        "pipe:0",
        "-i",
        str(input_path),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        "-shortest",
        str(output_path),
    ]
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)
    if proc.stdin is None:
        raise RuntimeError("ffmpeg stdin unavailable")

    frame_index = 0
    while True:
        ok, frame = capture_obj.read()
        if not ok:
            break
        t = frame_index / fps

        if t < 4.6:
            p = smootherstep(t / 4.6)
            angle = -18.0 * (1.0 - p) + math.sin(t * 3.2) * 1.2
            seal = rotate_overlay(large_logo, angle, 0.88 + 0.12 * p)
            seal = with_alpha_mask(seal, 0.78 * p, p)
            blend_rgba(frame, seal, (WIDTH // 2, 500))

        for start in transition_starts:
            pulse = timed_pulse(t, start, 0.9)
            if pulse > 0.0:
                seal = rotate_overlay(micro_logo, -6.0 + 12.0 * pulse, 0.86 + 0.16 * pulse)
                seal = with_alpha_mask(seal, 0.78 * pulse, min(1.0, pulse * 1.4))
                blend_rgba(frame, seal, (590, 245))

        for start in watermark_starts:
            pulse = timed_pulse(t, start, 2.2)
            if pulse > 0.0:
                seal = with_alpha_mask(small_logo, 0.36 * pulse, 1.0)
                blend_rgba(frame, seal, (92, 222))

        if t >= final_start:
            p = smootherstep((t - final_start) / max(0.001, duration - final_start))
            seal = rotate_overlay(final_logo, 8.0 * (1.0 - p), 0.82 + 0.12 * p)
            seal = with_alpha_mask(seal, 0.64 * p, p)
            blend_rgba(frame, seal, (WIDTH // 2, 530))

        proc.stdin.write(frame.tobytes())
        frame_index += 1

    capture_obj.release()
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding seal overlay video")

    return {
        "input": str(input_path),
        "output": str(output_path),
        "logo": str(logo_path),
        "durationSeconds": round(duration, 3),
        "fps": round(fps, 3),
        "frames": frame_index,
        "effects": {
            "openingSeal": [0.0, 4.6],
            "transitionSeals": transition_starts,
            "watermarkPulses": watermark_starts,
            "finalSeal": [round(final_start, 3), round(duration, 3)],
            "wordStream": KEYWORD_STREAM.strip(),
            "excluded": ["obra original line"],
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    manifest = render_overlay(args.input.resolve(), args.output.resolve(), args.logo.resolve())
    manifest_path = args.output.with_name(args.output.stem + "-manifest.json")
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({**manifest, "manifest": str(manifest_path)}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
