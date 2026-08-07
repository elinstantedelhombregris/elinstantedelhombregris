"""Crisp vector text drawn after the grade.

The ASCII field is the picture; captions and UI are not asciified -- they must stay
legible after platform recompression. v1 nailed every element to a magic pixel
coordinate, which is how the chapter keyword ended up behind the caption plate. Here
every element is clamped to its zone.
"""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from ..speech.captions import caption_lines
from ..scene import semantic
from ..storyboard.schema import Caption
from .canvas import ZONES, Grid, Zone
from .tokens import Look

_MIN_PLATE_ALPHA = 150
_MAX_PLATE_ALPHA = 232

# Below this fraction of the nominal size, text stops being comfortably legible.
# Shrinking is preferred to truncation for wrapped captions -- spoken words must
# never be clipped -- so this is a soft floor: `_fit_text_size` will go below it
# only for a pathological single token that a normal caption would never wrap to.
_SHRINK_FLOOR_FRAC = 0.6
# Absolute last-resort size for text that still doesn't fit its zone even at the
# soft floor (e.g. one unbreakable 40+ char word, or a long bare URL). Below this
# we give up shrinking and clamp the draw position instead.
_HARD_MIN_FONT_PX = 4
# Antialiased glyph edges can bleed a pixel or two past their advance width (hinting,
# subpixel rounding). Fit against a slightly narrower target than the true zone width
# so that slop never crosses the zone boundary.
_ANTIALIAS_MARGIN_PX = 3


def _font(look: Look, px: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(look.ui_font, max(8, px))


def _relative_luminance(rgb: np.ndarray) -> float:
    channels = rgb.astype(np.float32) / 255.0
    linear = np.where(channels <= 0.04045, channels / 12.92,
                      ((channels + 0.055) / 1.055) ** 2.4)
    return float((linear * np.array([0.2126, 0.7152, 0.0722])).sum(axis=-1).mean())


def plate_alpha(frame: np.ndarray, grid: Grid, zone: Zone = ZONES["caption"]) -> int:
    """Opacity needed for a dimming plate to hold contrast over this background.

    Defaults to the caption zone (the original, still-tested call shape). The footer
    signature reuses this same helper against the footer zone instead of inventing a
    second contrast mechanism -- see `draw_footer`.
    """
    x0, y0, x1, y1 = grid.zone_px(zone)
    luminance = _relative_luminance(frame[y0:y1, x0:x1])
    # Brighter field behind -> denser plate. Linear in measured luminance is enough
    # here because the plate itself is near-black.
    return int(round(_MIN_PLATE_ALPHA + (_MAX_PLATE_ALPHA - _MIN_PLATE_ALPHA) * min(1.0, luminance * 2.2)))


def _active_index(caption: Caption, t: float) -> int:
    """Index of the word that should be highlighted at time `t`.

    NOTE: this intentionally duplicates `ascii_studio.speech.captions.active_word_index`
    rather than importing it (see code review notes, Finding 3). The two disagree at an
    exact word-boundary tie -- when `t == words[i].end == words[i + 1].start` -- because
    this version advances to word i + 1 (last word whose start <= t) while the shared
    version stops at word i (it checks `start <= t <= end` first and returns immediately).
    Swapping to the shared implementation would shift which word is highlighted at that
    exact instant, and the caption layer's exact behaviour is pinned by golden-file tests
    elsewhere, so the swap was deliberately not made here -- flagged for a human decision
    instead of silently changing pinned output.
    """
    index = 0
    for position, word in enumerate(caption.words):
        if t >= word.start:
            index = position
        else:
            break
    return index


def _line_width(draw: ImageDraw.ImageDraw, font: ImageFont.FreeTypeFont,
                space: float, words: list[str]) -> float:
    return sum(draw.textlength(w, font=font) for w in words) + max(0, len(words) - 1) * space


def _fit_text_size(look: Look, nominal: int, floor: int, zone_width: float,
                   measure) -> tuple[ImageFont.FreeTypeFont, int]:
    """Shrink a font from `nominal` down to `floor` until `measure(font) <= zone_width`.

    `measure` takes a font and returns the pixel width that must fit. Zones are
    clamped, not the text drawn in them -- captions must never truncate a spoken
    word -- so when even the floor size doesn't fit (a pathological unbreakable
    token, or a long bare URL), shrinking continues below the floor down to
    `_HARD_MIN_FONT_PX` as a last resort before callers fall back to clamping the
    draw position.
    """
    target = zone_width - _ANTIALIAS_MARGIN_PX
    for size in range(nominal, floor - 1, -1):
        font = _font(look, size)
        if measure(font) <= target:
            return font, size
    for size in range(floor - 1, _HARD_MIN_FONT_PX - 1, -1):
        font = ImageFont.truetype(look.ui_font, size)
        if measure(font) <= target:
            return font, size
    return ImageFont.truetype(look.ui_font, _HARD_MIN_FONT_PX), _HARD_MIN_FONT_PX


def draw_caption(img: Image.Image, grid: Grid, look: Look, caption, t: float, alpha: int) -> None:
    if caption is None:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["caption"])
    zone_width = zx1 - zx0
    lines = caption_lines(caption.text)
    if not lines:
        return

    nominal = int(grid.height * 0.026)
    floor = max(8, int(nominal * _SHRINK_FLOOR_FRAC))

    def measure(font: ImageFont.FreeTypeFont) -> float:
        space = draw.textlength(" ", font=font)
        return max(_line_width(draw, font, space, words) for words in lines)

    font, size = _fit_text_size(look, nominal, floor, zone_width, measure)
    leading = int(size * 1.42)
    space = draw.textlength(" ", font=font)

    widths = [_line_width(draw, font, space, words) for words in lines]
    block_h = leading * len(lines)
    top = zy0 + ((zy1 - zy0) - block_h) // 2
    pad = int(grid.width * 0.022)
    left = max(zx0, int((grid.width - max(widths)) / 2) - pad)
    # PIL's rounded_rectangle draws its right coordinate inclusively, so clamping to
    # zx1 itself would still paint the zone's boundary column; zx1 - 1 keeps the
    # plate's ink strictly inside [zx0, zx1).
    right = min(zx1 - 1, int((grid.width + max(widths)) / 2) + pad)

    plate_top = top - pad // 2
    plate_bottom = top + block_h + pad // 2
    draw.rounded_rectangle(
        (left, plate_top, right, plate_bottom),
        radius=int(grid.width * 0.009),
        fill=(4, 6, 8, alpha),
    )

    # Designed, not a bare rounded rectangle: a hairline rule along the top edge and a
    # tick beside the line currently being spoken. Both stay in ramp tones -- the
    # accent is reserved for the active word itself and the progress bar -- so this
    # reads as structure, not as a second signal competing with the karaoke colour.
    rule_ink = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
    inset = int(grid.width * 0.03)
    draw.line((left + inset, plate_top + 1, right - inset, plate_top + 1),
              fill=(*rule_ink, 80), width=1)

    active = _active_index(caption, t)
    active_line = 0
    seen = 0
    for li, words in enumerate(lines):
        if seen <= active < seen + len(words):
            active_line = li
            break
        seen += len(words)
    tick_x = max(zx0 + 2, left + int(grid.width * 0.012))
    tick_y0 = top + active_line * leading + int(size * 0.10)
    tick_y1 = tick_y0 + int(size * 0.85)
    draw.line((tick_x, tick_y0, tick_x, tick_y1), fill=(*rule_ink, 150), width=2)

    accent = tuple(int(c * 255) for c in look.accent_rgb())
    text_rgb = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
    cursor = 0
    y = top
    for words, total in zip(lines, widths):
        x = (grid.width - total) / 2
        # `_fit_text_size` shrinks until every line fits, so this clamp is normally
        # a no-op; it only bites if `total` still exceeds the zone at
        # `_HARD_MIN_FONT_PX` -- the very last defense against an escaping glyph.
        x = max(zx0, min(x, zx1 - total))
        for word in words:
            width = draw.textlength(word, font=font)
            if cursor == active:
                # Background wash under the active word so it reads instantly on a
                # small screen, not just a colour swap. Still just marking the active
                # word -- the one thing besides the progress bar the accent may touch.
                chip_pad = max(2, int(size * 0.16))
                wbox = draw.textbbox((x, y), word, font=font)
                chip = (
                    max(zx0, wbox[0] - chip_pad),
                    max(zy0, wbox[1] - chip_pad // 2),
                    min(zx1 - 1, wbox[2] + chip_pad),
                    min(zy1 - 1, wbox[3] + chip_pad // 2),
                )
                draw.rounded_rectangle(chip, radius=int(size * 0.22), fill=(*accent, 48))
                fill = (*accent, 255)
            else:
                fill = (*text_rgb, 252)
            draw.text((x, y), word, font=font, fill=fill)
            x += width + space
            cursor += 1
        y += leading


def _progress_geometry(grid: Grid) -> tuple[int, int]:
    """Centreline y and half-thickness of the progress bar.

    Shared by `draw_title` (to reserve a clear band above it for the chapter label)
    and `draw_progress` (to actually paint it), so the two can never drift apart the
    way the old independent magic offsets did -- that drift is exactly what let the
    bar strike through the label in shipped frames.
    """
    _, _, _, zy1 = grid.zone_px(ZONES["title"])
    thickness = max(2, int(grid.height * 0.0016))
    y = zy1 + int(grid.height * 0.007)
    return y, thickness


def draw_title(img: Image.Image, grid: Grid, look: Look, title, chapter_label) -> None:
    if not title and not chapter_label:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["title"])
    ink = tuple(int(c * 255) for c in look.ramp_rgb()[-1])

    # The chapter label and the progress bar used to be nailed to independent magic
    # offsets from zy1 and could overlap depending on the font's real glyph extent.
    # Here the label's position is derived from `draw.textbbox` (real ink, not a
    # nominal font size) and from the bar's own geometry, so a gap is guaranteed
    # rather than assumed.
    label_top_limit = zy1
    if chapter_label:
        label_size = int(grid.height * 0.0125)
        small = _font(look, label_size)
        # Deliberately NOT the accent. The spec reserves it for the active karaoke
        # word, the emphasised diagram element, and the progress bar. A chapter label
        # in accent would appear in every frame of the video and dilute the signal.
        label_ink = tuple(int(c * 255) for c in look.ramp_rgb()[-4])
        bar_y, bar_half = _progress_geometry(grid)
        clearance = int(grid.height * 0.010)
        target_bottom = min(zy1, bar_y - bar_half) - clearance
        probe = draw.textbbox((0, 0), chapter_label, font=small)
        draw_y = target_bottom - probe[3]
        draw.text((zx0, draw_y), chapter_label, font=small, fill=(*label_ink, 224))
        label_top_limit = draw_y + probe[1] - int(grid.height * 0.006)

    if title:
        for size in range(int(grid.height * 0.026), 8, -1):
            font = _font(look, size)
            words = title.upper().split()
            best = None
            for split in range(len(words), 0, -1):
                lines = [" ".join(words[:split]), " ".join(words[split:])]
                lines = [ln for ln in lines if ln]
                if max(draw.textlength(ln, font=font) for ln in lines) <= (zx1 - zx0):
                    best = lines
                    break
            if not best or len(best) > 2:
                continue
            line_h = int(size * 1.22)
            bottoms = [draw.textbbox((zx0, zy0 + index * line_h), line, font=font)[3]
                       for index, line in enumerate(best)]
            if max(bottoms) > label_top_limit:
                continue
            for index, line in enumerate(best):
                y = zy0 + index * line_h
                # A cheap faux-bold (redraw with a 1px stroke of the same colour) gives
                # the title real presence at this size without pulling in a second font
                # file -- this module draws with whatever `look.ui_font` provides.
                draw.text((zx0, y), line, font=font, fill=(*ink, 238),
                          stroke_width=1, stroke_fill=(*ink, 238))
            break


def draw_progress(img: Image.Image, grid: Grid, look: Look,
                  chapter_index: int, chapter_count: int, progress: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, _, zx1, _ = grid.zone_px(ZONES["title"])
    y, thickness = _progress_geometry(grid)
    draw.line((zx0, y, zx1, y), fill=(214, 228, 220, 64), width=thickness)
    span = (zx1 - zx0) / max(1, chapter_count)
    end = zx0 + span * (chapter_index + max(0.0, min(1.0, progress)))
    accent = tuple(int(c * 255) for c in look.accent_rgb())
    draw.line((zx0, y, end, y), fill=(*accent, 240), width=thickness * 2)


def draw_footer(img: Image.Image, grid: Grid, look: Look, keyword, url, footer_alpha: int) -> None:
    if not keyword and not url:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    zx0, zy0, zx1, zy1 = grid.zone_px(ZONES["footer"])
    zone_width = zx1 - zx0
    zone_height = zy1 - zy0

    if keyword:
        nominal = int(grid.height * 0.0092)
        floor = max(8, int(nominal * _SHRINK_FLOOR_FRAC))
        ink = tuple(int(c * 255) for c in look.ramp_rgb()[-3])
        font, _ = _fit_text_size(look, nominal, floor, zone_width,
                                 lambda f: draw.textlength(keyword, font=f))
        width = draw.textlength(keyword, font=font)
        # Left-anchored at zx0 already keeps the near edge inside the zone; clamp
        # the far edge too as the same last-resort safety net used for captions.
        x = max(zx0, min(zx0, zx1 - width))
        draw.text((x, zy0), keyword, font=font, fill=(*ink, 220))

    if url:
        # The site signature is the entire point of the video. v1 rendered it at
        # ~17px in a mid-grey ramp tone with no backing -- on a dark, busy ASCII
        # field, after platform recompression, it disappeared. This is now a
        # deliberate brand element: brightest ramp tone at full alpha, sized to be
        # legible on a phone at arm's length, sitting on a dimming plate whose
        # opacity adapts to the measured background (the same `plate_alpha`
        # mechanism `draw_caption` uses, applied to the footer zone instead).
        nominal = int(grid.height * 0.019)
        floor = max(10, int(nominal * _SHRINK_FLOOR_FRAC))
        ink = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
        font, _ = _fit_text_size(look, nominal, floor, zone_width,
                                 lambda f: draw.textlength(url, font=f))
        width = draw.textlength(url, font=font)
        x = max(zx0, zx1 - width)
        y = zy0 + max(0, (zone_height - int(font.size * 1.3)) // 2)

        bbox = draw.textbbox((x, y), url, font=font)
        pad = max(4, int(grid.height * 0.006))
        plate = (
            max(zx0, bbox[0] - pad),
            max(zy0, bbox[1] - pad // 2),
            min(zx1 - 1, bbox[2] + pad),
            min(zy1 - 1, bbox[3] + pad // 2),
        )
        draw.rounded_rectangle(plate, radius=max(3, pad // 2), fill=(4, 6, 8, footer_alpha))
        draw.text((x, y), url, font=font, fill=(*ink, 255))


def draw_scene_labels(img: Image.Image, grid: Grid, look: Look, chapter, progress: float) -> None:
    if chapter is None or not chapter.anchors:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    bright = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
    muted = tuple(int(c * 255) for c in look.ramp_rgb()[-3])
    shot = semantic.active_shot(chapter, progress)
    nominal = max(10, int(grid.height * (0.044 if shot.typography == "giant" else 0.020)))
    for label, x, y, strength in semantic.label_layout(chapter, grid.width, grid.height, progress):
        if strength <= 0.04:
            continue
        text = label.upper()[:22]
        font = _font(look, nominal)
        max_text_width = grid.width * (0.76 if shot.typography == "giant" else 0.32)
        while font.size > 9 and draw.textlength(text, font=font) > max_text_width:
            font = _font(look, font.size - 1)
        box = draw.textbbox((0, 0), text, font=font)
        tw, th = box[2] - box[0], box[3] - box[1]
        tx = max(grid.width * 0.04, min(x - tw / 2, grid.width * 0.96 - tw))
        ty = min(grid.height * 0.59 - th, y + nominal * (0.20 if shot.typography == "giant" else 1.05))
        pad = max(3, round(grid.width * 0.006))
        alpha = round(205 * strength)
        draw.rounded_rectangle(
            (tx - pad, ty - pad // 2, tx + tw + pad, ty + th + pad // 2),
            radius=max(2, pad // 2), fill=(4, 6, 8, alpha),
        )
        ink = bright if label == chapter.keyword else muted
        draw.text((tx, ty), text, font=font, fill=(*ink, round(255 * strength)))

    relation_font = _font(look, max(9, int(grid.height * 0.0115)))
    accent = tuple(int(c * 255) for c in look.accent_rgb())
    for text, x, y, strength in semantic.relation_label_layout(
        chapter, grid.width, grid.height, progress,
    ):
        if strength <= 0.08:
            continue
        tw = draw.textlength(text, font=relation_font)
        box = draw.textbbox((0, 0), text, font=relation_font)
        th = box[3] - box[1]
        tx = max(grid.width * 0.05, min(x - tw / 2, grid.width * 0.95 - tw))
        ty = max(grid.height * 0.12, min(y - th / 2, grid.height * 0.58 - th))
        pad_x, pad_y = max(5, int(grid.width * 0.008)), max(3, int(grid.height * 0.003))
        draw.rounded_rectangle((tx - pad_x, ty - pad_y, tx + tw + pad_x, ty + th + pad_y),
                               radius=pad_y, fill=(3, 5, 7, round(225 * strength)),
                               outline=(*accent, round(180 * strength)), width=max(1, grid.width // 540))
        draw.text((tx, ty), text, font=relation_font, fill=(*bright, round(248 * strength)))


def draw_hook(img: Image.Image, grid: Grid, look: Look, hook: str, progress: float) -> None:
    if not hook:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    x0, y0, x1, y1 = grid.zone_px(ZONES["stage"])
    words = hook.upper().split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join(current + [word])
        if current and len(trial) > 24:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    # Never discard a hook's final words. Long promises get a fourth line and
    # then a wider wrap target until every word fits; font fitting handles the
    # resulting width. The old `lines[:3]` silently dropped the payoff.
    wrap_limit = 24
    while len(lines) > 4:
        wrap_limit += 3
        lines, current = [], []
        for word in words:
            trial = " ".join(current + [word])
            if current and len(trial) > wrap_limit:
                lines.append(" ".join(current))
                current = [word]
            else:
                current.append(word)
        if current:
            lines.append(" ".join(current))
    max_width = (x1 - x0) * 0.92
    nominal = int(grid.height * (0.052 if len(lines) <= 3 else 0.044))
    font, size = _fit_text_size(
        look, nominal, max(12, int(nominal * 0.48)), max_width,
        lambda candidate: max(draw.textlength(line, font=candidate) for line in lines),
    )
    leading = int(size * 1.2)
    total_h = leading * len(lines)
    top = y0 + ((y1 - y0) - total_h) // 2
    eased = float(np.clip(progress, 0.0, 1.0))
    plate_alpha_value = round(205 * min(1.0, eased * 2.4))
    pad = int(grid.width * 0.035)
    draw.rounded_rectangle(
        (x0 + pad, top - pad, x1 - pad, top + total_h + pad),
        radius=max(4, pad // 3), fill=(3, 4, 6, plate_alpha_value),
    )
    ink = tuple(int(c * 255) for c in look.ramp_rgb()[-1])
    for index, line in enumerate(lines):
        width = draw.textlength(line, font=font)
        x = (grid.width - width) / 2
        offset = (1.0 - min(1.0, eased * 1.6)) * grid.width * (0.05 if index % 2 == 0 else -0.05)
        draw.text((x + offset, top + index * leading), line, font=font,
                  fill=(*ink, round(255 * min(1.0, eased * 2.0))),
                  stroke_width=max(1, size // 30), stroke_fill=(*ink, 230))


def overlay(frame: np.ndarray, grid: Grid, look: Look, *, caption=None, t: float = 0.0,
            title=None, chapter_label=None, chapter_index: int = 0,
            chapter_count: int = 1, progress: float = 0.0,
            keyword=None, url=None, scene_chapter=None, hook=None,
            cold_open_seconds: float = 1.25) -> np.ndarray:
    alpha = plate_alpha(frame, grid)
    footer_alpha = plate_alpha(frame, grid, ZONES["footer"])
    # Deliberately kept RGB, not converted to RGBA: PIL's `ImageDraw(im, "RGBA")` only
    # blends translucent fills into the image when the target is RGB -- against an
    # RGBA target it writes the raw RGBA tuple into the pixel buffer with no
    # compositing, and the final `.convert("RGB")` used to just drop that alpha
    # channel outright. Every translucent fill in this module (the caption plate, and
    # now the footer plate, the caption hairline/tick, and the karaoke word chip) was
    # silently rendering fully opaque as a result. Keeping `img` in RGB the whole way
    # through is what makes `plate_alpha`'s adaptive opacity -- and the low-alpha
    # caption accents -- actually visible instead of a no-op.
    img = Image.fromarray(frame)
    in_cold_open = bool(hook) and t < cold_open_seconds
    if not in_cold_open:
        draw_scene_labels(img, grid, look, scene_chapter, progress)
    display_title = title if t < cold_open_seconds + 1.8 else None
    draw_title(img, grid, look, display_title, chapter_label)
    if title or chapter_label:
        draw_progress(img, grid, look, chapter_index, chapter_count, progress)
    draw_caption(img, grid, look, caption, t, alpha)
    draw_footer(img, grid, look, keyword, url, footer_alpha)
    if in_cold_open:
        draw_hook(img, grid, look, hook, t / max(0.01, cold_open_seconds))
    return np.asarray(img, dtype=np.uint8)
