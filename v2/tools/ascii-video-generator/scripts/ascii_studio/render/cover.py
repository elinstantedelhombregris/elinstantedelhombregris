"""Designed feed cover, composed independently from the playback frame."""

from __future__ import annotations

import textwrap
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

from .tokens import Look


def _fit(draw: ImageDraw.ImageDraw, look: Look, lines: list[str], width: int, nominal: int) -> ImageFont.FreeTypeFont:
    for size in range(nominal, 15, -1):
        font = ImageFont.truetype(look.ui_font, size)
        if max(draw.textlength(line, font=font) for line in lines) <= width:
            return font
    return ImageFont.truetype(look.ui_font, 16)


def designed_cover(frame: np.ndarray, title: str, hook: str, look: Look, out: Path) -> Path:
    image = Image.fromarray(frame).convert("RGB")
    image = ImageEnhance.Brightness(image).enhance(0.48)
    image = image.filter(ImageFilter.GaussianBlur(radius=0.45))
    draw = ImageDraw.Draw(image, "RGBA")
    width, height = image.size
    draw.rectangle((0, 0, width, height), fill=(2, 3, 5, 72))
    accent = tuple(int(value * 255) for value in look.accent_rgb())
    white = tuple(int(value * 255) for value in look.ramp_rgb()[-1])
    hook_text = hook.rstrip(".") or title
    lines = textwrap.wrap(hook_text.upper(), width=22)[:4]
    font = _fit(draw, look, lines, int(width * 0.84), int(height * 0.066))
    leading = int(font.size * 1.14)
    top = int(height * 0.20)
    draw.rectangle((int(width * 0.07), top - 22, int(width * 0.93), top + leading * len(lines) + 24), fill=(3, 4, 6, 218))
    draw.line((int(width * 0.07), top - 22, int(width * 0.46), top - 22), fill=(*accent, 255), width=max(4, width // 180))
    for index, line in enumerate(lines):
        draw.text((int(width * 0.09), top + index * leading), line, font=font, fill=(*white, 255),
                  stroke_width=max(1, font.size // 34), stroke_fill=(*white, 255))
    small = ImageFont.truetype(look.ui_font, max(16, int(height * 0.017)))
    draw.text((int(width * 0.09), int(height * 0.86)), title.upper(), font=small, fill=(*white, 230))
    draw.text((int(width * 0.09), int(height * 0.895)), "CINEMATIC ASCII ESSAY", font=small, fill=(*accent, 255))
    image.save(out, quality=94)
    return out
