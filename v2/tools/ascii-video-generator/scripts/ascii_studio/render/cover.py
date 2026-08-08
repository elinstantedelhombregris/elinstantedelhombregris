"""Designed feed cover, composed independently from the playback frame."""

from __future__ import annotations

import textwrap
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

from .tokens import Look


def _fit(draw: ImageDraw.ImageDraw, look: Look, lines: list[str], width: int, nominal: int) -> ImageFont.FreeTypeFont:
    for size in range(nominal, 15, -1):
        font = ImageFont.truetype(look.ui_font, size)
        if max(draw.textlength(line, font=font) for line in lines) <= width:
            return font
    return ImageFont.truetype(look.ui_font, 16)


def designed_cover(frame: np.ndarray, title: str, hook: str, look: Look, out: Path,
                   url: str = "www.elinstantedelhombregris.com") -> Path:
    if look.is_paper:
        return _paper_cover(frame, title, hook, look, out, url)
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


def _paper_cover(frame: np.ndarray, title: str, hook: str, look: Look, out: Path, url: str) -> Path:
    """A feed cover built like a printed broadsheet, not a darkened video frame."""
    source = Image.fromarray(frame).convert("RGB")
    width, height = source.size
    paper = Image.new("RGB", (width, height), (242, 239, 231))
    engraving = ImageOps.grayscale(source)
    engraving = ImageEnhance.Contrast(engraving).enhance(1.28)
    engraving = ImageOps.colorize(engraving, black=(22, 19, 14), white=(251, 250, 244))
    engraving = engraving.filter(ImageFilter.GaussianBlur(radius=0.18))
    # The illustration is a watermark/engraving in the lower field; typography
    # remains the cover's dominant silhouette at feed size.
    paper = Image.blend(paper, engraving, 0.28)
    draw = ImageDraw.Draw(paper, "RGBA")
    ink, muted = (22, 19, 14), (122, 117, 106)
    violet, red = (82, 39, 204), (194, 59, 34)
    meta = ImageFont.truetype(look.font_for("meta"), max(16, int(height * 0.014)))
    display_nominal = int(height * 0.067)

    margin = int(width * 0.075)
    draw.line((margin, int(height * 0.055), width - margin, int(height * 0.055)),
              fill=(*ink, 255), width=max(2, width // 360))
    draw.text((margin, int(height * 0.068)), "ARGENTINA · 2026 / EXP. CIUDADANO N° 001",
              font=meta, fill=(*muted, 255))
    brand_font = ImageFont.truetype(look.font_for("display"), max(24, int(height * 0.030)))
    brand_x = width - margin - draw.textlength("¡BASTA!", font=brand_font)
    draw.text((brand_x, int(height * 0.064)), "¡", font=brand_font, fill=(*violet, 255))
    sign_w = draw.textlength("¡", font=brand_font)
    draw.text((brand_x + sign_w, int(height * 0.064)), "BASTA", font=brand_font, fill=(*ink, 255))
    body_w = draw.textlength("BASTA", font=brand_font)
    draw.text((brand_x + sign_w + body_w, int(height * 0.064)), "!", font=brand_font, fill=(*violet, 255))

    hook_text = (hook.rstrip(".") or title).upper()
    wrap = 20
    lines = textwrap.wrap(hook_text, width=wrap)
    while len(lines) > 5:
        wrap += 2
        lines = textwrap.wrap(hook_text, width=wrap)
    font = ImageFont.truetype(look.font_for("display"), display_nominal)
    max_width = width - margin * 2
    while font.size > 22 and max(draw.textlength(line, font=font) for line in lines) > max_width:
        font = ImageFont.truetype(look.font_for("display"), font.size - 1)
    leading = int(font.size * 1.01)
    top = int(height * 0.18)
    # A clean paper block preserves mobile contrast over the engraved field.
    draw.rectangle((margin - 10, top - 18, width - margin + 10,
                    top + leading * len(lines) + 24), fill=(242, 239, 231, 232))
    for index, line in enumerate(lines):
        y = top + index * leading
        draw.text((margin + 3, y), line, font=font, fill=(*violet, 70))
        draw.text((margin - 3, y), line, font=font, fill=(*red, 55))
        draw.text((margin, y), line, font=font, fill=(*ink, 255))

    stamp_text = "NO ES DOCTRINA"
    stamp_font = ImageFont.truetype(look.font_for("meta"), max(14, int(height * 0.015)))
    stamp_w = int(width * 0.40)
    stamp_h = int(height * 0.050)
    sx, sy = width - margin - stamp_w, int(height * 0.68)
    draw.rectangle((sx, sy, sx + stamp_w, sy + stamp_h), outline=(*red, 255),
                   width=max(4, width // 180))
    tw = draw.textlength(stamp_text, font=stamp_font)
    draw.text((sx + (stamp_w - tw) / 2, sy + (stamp_h - stamp_font.size) / 2), stamp_text,
              font=stamp_font, fill=(*red, 255))

    bottom = int(height * 0.895)
    draw.line((margin, bottom - 18, width - margin, bottom - 18), fill=(*ink, 255),
              width=max(2, width // 360))
    title_font = ImageFont.truetype(look.font_for("body"), max(16, int(height * 0.015)))
    url_font = ImageFont.truetype(look.font_for("meta"), max(15, int(height * 0.014)))
    draw.text((margin, bottom), title.upper(), font=title_font, fill=(*ink, 255))
    url_width = draw.textlength(url, font=url_font)
    draw.text((width - margin - url_width, bottom + int(height * 0.028)), url,
              font=url_font, fill=(*ink, 255))
    paper.save(out, quality=96)
    return out
