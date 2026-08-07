"""One still per chapter, plus a contact sheet.

v1 renders took 2h19m, so art direction could only be judged after the fact. This
turns that into a few seconds.
"""

from __future__ import annotations

import json
from dataclasses import asdict, replace
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .render.frames import Renderer
from .render.tokens import load_look
from .render import typography
from .scene.legacy import LegacyChapter
from .storyboard.schema import load_storyboard

STILL_TIME = 1.6      # seconds into the chapter
STILL_PROGRESS = 0.35


def chapters_from_storyboard(path: Path) -> list[LegacyChapter]:
    board = load_storyboard(Path(path))
    chapters: list[LegacyChapter] = []
    for entry in board.chapters:
        chapters.append(LegacyChapter(
            motif=entry.motif or entry.archetype,
            keyword=entry.keyword, anchors=list(entry.anchors), seed=entry.seed,
            density=entry.density, motion=entry.motion, text=" ".join(entry.texts),
            composition=entry.composition, archetype=entry.archetype,
            rhetoric=entry.rhetoric, relations=[asdict(value) for value in entry.relations],
            shots=[asdict(value) for value in entry.shots], temperature=entry.temperature,
            camera=entry.camera,
            world=entry.world, hero_subject=entry.hero_subject, plate=entry.plate,
            depth_layers=entry.depth_layers, lighting=entry.lighting,
            metamorphosis=entry.metamorphosis,
        ))
    return chapters


def render_stills(storyboard_path: Path, out_dir: Path, look_name: str = "plata") -> list[Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    renderer = Renderer(load_look(look_name))
    written: list[Path] = []
    for index, chapter in enumerate(chapters_from_storyboard(storyboard_path)):
        renderer.reset()
        frame = renderer.frame(chapter, STILL_TIME, STILL_PROGRESS, index)
        frame = typography.overlay(frame, renderer.grid, renderer.look, progress=STILL_PROGRESS, scene_chapter=chapter)
        path = out_dir / f"{index + 1:02d}-{chapter.motif}.png"
        Image.fromarray(frame).save(path)
        written.append(path)
    return written


def render_shot_stills(storyboard_path: Path, out_dir: Path, look_name: str = "plata") -> list[Path]:
    """Render establish/explain/transform frames for art-direction approval."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    renderer = Renderer(load_look(look_name))
    written: list[Path] = []
    for index, chapter in enumerate(chapters_from_storyboard(storyboard_path)):
        for purpose, progress in (("establish", 0.16), ("explain", 0.52), ("transform", 0.88)):
            renderer.reset()
            frame = renderer.frame(chapter, STILL_TIME + progress, progress, index)
            frame = typography.overlay(frame, renderer.grid, renderer.look, progress=progress, scene_chapter=chapter)
            path = out_dir / f"{index + 1:02d}-{chapter.motif}-{purpose}.png"
            Image.fromarray(frame).save(path)
            written.append(path)
    return written


def render_hero_stills(storyboard_path: Path, out_dir: Path,
                       look_name: str = "plata") -> list[Path]:
    """One clean, caption-free transform plate per chapter for v4 approval."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    renderer = Renderer(load_look(look_name))
    written: list[Path] = []
    for index, chapter in enumerate(chapters_from_storyboard(storyboard_path)):
        renderer.reset()
        frame = renderer.frame(replace(chapter, world_only=True), STILL_TIME + 0.88, 0.88, index)
        path = out_dir / f"{index + 1:02d}-{chapter.world}-hero.png"
        Image.fromarray(frame).save(path)
        written.append(path)
    return written


def contact_sheet(
    images: list[Path],
    out_path: Path,
    columns: int = 4,
    look_name: str = "plata",
) -> Path:
    if not images:
        raise ValueError("No images to place in a contact sheet")
    background = tuple(int(round(c)) for c in load_look(look_name).background_rgb() * 255)
    look = load_look(look_name)
    thumb_w, thumb_h = 360, 640
    thumbs = []
    for path in images:
        thumb = Image.open(path).convert("RGB").resize((thumb_w, thumb_h))
        draw = ImageDraw.Draw(thumb, "RGBA")
        label = path.stem.upper().replace("-", " · ")
        font = ImageFont.truetype(look.ui_font, 14)
        draw.rectangle((0, 0, thumb_w, 30), fill=(2, 4, 6, 225))
        draw.text((12, 7), label, font=font, fill=(238, 240, 236, 245))
        thumbs.append(thumb)
    rows = -(-len(thumbs) // columns)
    sheet = Image.new("RGB", (columns * thumb_w, rows * thumb_h), background)
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % columns) * thumb_w, (index // columns) * thumb_h))
    out_path = Path(out_path)
    sheet.save(out_path)
    return out_path
