"""Semantic ASCII diagrams: storyboard meaning rendered into the luminance buffer.

The renderer consumes this grayscale layer through the normal glyph matcher; no
vector survives into the final frame.  Anchors become labelled elements,
relations become typed connections, composition controls layout, shots control
the visual arc, and exact word-derived reveal points control timing.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import cv2
import numpy as np
from ..render import easing
from ..render.canvas import ZONES
from ..render.tokens import Look
from .legacy import LegacyChapter


@dataclass(frozen=True)
class ActiveShot:
    purpose: str
    composition: str
    camera: str
    typography: str
    density: float
    transition: str
    focus: str
    local: float


def active_shot(chapter: LegacyChapter, progress: float) -> ActiveShot:
    shots = chapter.shots or [
        {"start": 0.0, "end": 0.28, "purpose": "establish", "composition": chapter.composition,
         "camera": "drift", "typography": "giant", "density": chapter.density, "transition": "iris", "focus": chapter.keyword},
        {"start": 0.28, "end": 0.72, "purpose": "explain", "composition": chapter.composition,
         "camera": chapter.camera, "typography": "caption", "density": chapter.density, "transition": "morph", "focus": chapter.keyword},
        {"start": 0.72, "end": 1.0, "purpose": "transform", "composition": chapter.composition,
         "camera": "pull-out", "typography": "integrated", "density": min(1.0, chapter.density + 0.15), "transition": "optical", "focus": chapter.keyword},
    ]
    selected = shots[-1]
    for shot in shots:
        if float(shot.get("start", 0.0)) <= progress <= float(shot.get("end", 1.0)):
            selected = shot
            break
    start, end = float(selected.get("start", 0.0)), float(selected.get("end", 1.0))
    local = float(np.clip((progress - start) / max(0.001, end - start), 0.0, 1.0))
    return ActiveShot(
        selected.get("purpose", "explain"), selected.get("composition", chapter.composition),
        selected.get("camera", chapter.camera), selected.get("typography", "caption"),
        float(selected.get("density", chapter.density)), selected.get("transition", "crossfade"),
        selected.get("focus", chapter.keyword), local,
    )


def _positions(archetype: str, composition: str, count: int, width: int, height: int, progress: float) -> list[tuple[float, float]]:
    count = max(1, count)
    cx, cy = width * 0.5, height * 0.5
    margin_x, margin_y = width * 0.14, height * 0.16
    if archetype in {"causal-chain", "flow", "timeline", "growth"}:
        vertical = composition in {"cascade", "layers", "opening"}
        if vertical:
            return [(cx, margin_y + i * (height - 2 * margin_y) / max(1, count - 1)) for i in range(count)]
        return [(margin_x + i * (width - 2 * margin_x) / max(1, count - 1), cy) for i in range(count)]
    if archetype in {"feedback-loop", "orbit-cycle"}:
        radius_x, radius_y = width * 0.31, height * 0.31
        return [
            (cx + math.cos(-math.pi / 2 + i * 2 * math.pi / count) * radius_x,
             cy + math.sin(-math.pi / 2 + i * 2 * math.pi / count) * radius_y)
            for i in range(count)
        ]
    if archetype in {"hierarchy", "layers"}:
        positions = [(cx, margin_y)]
        remaining = count - 1
        for i in range(remaining):
            positions.append((margin_x + i * (width - 2 * margin_x) / max(1, remaining - 1), height * 0.68))
        return positions
    if archetype in {"comparison", "contrast", "threshold"}:
        return [
            (width * (0.28 if i % 2 == 0 else 0.72), height * (0.32 + 0.20 * (i // 2)))
            for i in range(count)
        ]
    if archetype == "distribution":
        return [(margin_x + i * (width - 2 * margin_x) / max(1, count - 1), height * (0.68 - 0.12 * (i % 3))) for i in range(count)]
    if composition == "bridge" and count >= 2:
        return [(margin_x + i * (width - 2 * margin_x) / max(1, count - 1), cy + abs(i - (count - 1) / 2) * height * 0.08) for i in range(count)]
    radius_x, radius_y = width * 0.33, height * 0.30
    phase = (progress - 0.5) * 0.14
    return [
        (cx + math.cos(phase + i * 2 * math.pi / count) * radius_x,
         cy + math.sin(phase + i * 2 * math.pi / count) * radius_y)
        for i in range(count)
    ]


def label_layout(chapter: LegacyChapter, width: int, height: int, progress: float) -> list[tuple[str, float, float, float]]:
    """Visible semantic labels in full-canvas pixel coordinates for typography."""
    z = ZONES["stage"]
    x0, y0 = z.x0 * width, z.y0 * height
    stage_w, stage_h = (z.x1 - z.x0) * width, (z.y1 - z.y0) * height
    shot = active_shot(chapter, progress)
    anchors = chapter.anchors[:6] or ([chapter.keyword] if chapter.keyword else [])
    positions = _positions(chapter.archetype, shot.composition, len(anchors), round(stage_w), round(stage_h), progress)
    if shot.typography == "giant" and anchors:
        focus = shot.focus if shot.focus in anchors else anchors[0]
        index = anchors.index(focus)
        at = chapter.reveal_points.get(focus, 0.0)
        strength = float(easing.step_reveal(progress, at=max(0.0, at - 0.05), width=0.10))
        return [(focus, x0 + stage_w * 0.5, y0 + stage_h * 0.46, strength)]
    result = []
    for index, (anchor, (x, y)) in enumerate(zip(anchors, positions)):
        at = chapter.reveal_points.get(anchor, 0.08 + index * 0.56 / max(1, len(anchors) - 1))
        strength = float(easing.step_reveal(progress, at=max(0.0, at - 0.04), width=0.12))
        result.append((anchor, x0 + x, y0 + y, strength))
    return result


def relation_label_layout(chapter: LegacyChapter, width: int, height: int,
                          progress: float) -> list[tuple[str, float, float, float]]:
    """Crisp relationship labels placed at edge midpoints in canvas pixels."""
    if not chapter.relations or not chapter.anchors:
        return []
    z = ZONES["stage"]
    x0, y0 = z.x0 * width, z.y0 * height
    stage_w, stage_h = (z.x1 - z.x0) * width, (z.y1 - z.y0) * height
    shot = active_shot(chapter, progress)
    anchors = chapter.anchors[:6]
    positions = _positions(chapter.archetype, shot.composition, len(anchors), round(stage_w), round(stage_h), progress)
    index_for = {anchor: index for index, anchor in enumerate(anchors)}
    labels = []
    for relation in chapter.relations[:4]:
        source, target = relation.get("source", ""), relation.get("target", "")
        if source not in index_for or target not in index_for:
            continue
        a, b = index_for[source], index_for[target]
        sa = chapter.reveal_points.get(source, 0.08 + a * 0.18)
        sb = chapter.reveal_points.get(target, 0.08 + b * 0.18)
        strength = float(easing.step_reveal(progress, at=max(sa, sb), width=0.12))
        p0, p1 = positions[a], positions[b]
        text = (relation.get("label") or relation.get("kind") or "relation").upper()
        labels.append((text[:18], x0 + (p0[0] + p1[0]) * 0.5,
                       y0 + (p0[1] + p1[1]) * 0.5, strength))
    return labels


def _camera(layer: np.ndarray, camera: str, local: float) -> np.ndarray:
    height, width = layer.shape
    eased = float(easing.cubic_in_out(local))
    scale, angle, dx, dy = 1.0, 0.0, 0.0, 0.0
    if camera == "push-in":
        scale = 1.0 + 0.10 * eased
    elif camera == "pull-out":
        scale = 1.10 - 0.10 * eased
    elif camera == "orbit":
        angle = -2.5 + 5.0 * eased
    elif camera == "drift":
        dx, dy = width * 0.025 * (eased - 0.5), height * 0.018 * math.sin(eased * math.pi)
    elif camera == "rack":
        sigma = 2.5 * abs(0.5 - eased)
        if sigma > 0.2:
            layer = cv2.GaussianBlur(layer, (0, 0), sigma)
    matrix = cv2.getRotationMatrix2D((width / 2, height / 2), angle, scale)
    matrix[:, 2] += (dx, dy)
    return cv2.warpAffine(layer, matrix, (width, height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


def render_semantic(chapter: LegacyChapter, shape: tuple[int, int], look: Look, progress: float) -> np.ndarray:
    height, width = shape
    z = ZONES["stage"]
    y0, y1 = int(z.y0 * height), int(z.y1 * height)
    x0, x1 = int(z.x0 * width), int(z.x1 * width)
    stage_h, stage_w = max(1, y1 - y0), max(1, x1 - x0)
    stage = np.zeros((stage_h, stage_w), dtype=np.float32)
    shot = active_shot(chapter, progress)
    anchors = chapter.anchors[:6] or ([chapter.keyword] if chapter.keyword else [chapter.archetype.upper()])
    positions = _positions(chapter.archetype, shot.composition, len(anchors), stage_w, stage_h, progress)
    reveal = []
    for index, anchor in enumerate(anchors):
        at = chapter.reveal_points.get(anchor, 0.08 + index * 0.56 / max(1, len(anchors) - 1))
        reveal.append(float(easing.step_reveal(progress, at=max(0.0, at - 0.04), width=0.12)))

    line_w = max(1, round(min(stage_w, stage_h) * 0.006))
    node_r = max(3, round(min(stage_w, stage_h) * (0.026 + 0.014 * shot.density)))
    index_for = {anchor: index for index, anchor in enumerate(anchors)}
    relations = chapter.relations or [
        {"source": anchors[i], "target": anchors[i + 1], "kind": "relates"}
        for i in range(len(anchors) - 1)
    ]
    for relation in relations:
        source, target = relation.get("source", ""), relation.get("target", "")
        if source not in index_for or target not in index_for:
            continue
        a, b = index_for[source], index_for[target]
        strength = min(reveal[a], reveal[b])
        if strength <= 0.01:
            continue
        p0, p1 = positions[a], positions[b]
        weight = float(np.clip(relation.get("weight", 0.75), 0.25, 1.0))
        value = 0.52 + 0.40 * strength
        edge_w = max(1, round(line_w * (0.65 + weight * 0.75)))
        p0i, p1i = tuple(map(round, p0)), tuple(map(round, p1))
        cv2.line(stage, p0i, p1i, float(value), edge_w, cv2.LINE_AA)
        dx, dy = p1[0] - p0[0], p1[1] - p0[1]
        length = max(1.0, math.hypot(dx, dy))
        ux, uy = dx / length, dy / length
        pxv, pyv = -uy, ux
        arrow = max(4.0, min(stage_w, stage_h) * 0.022)
        tip = (p1[0] - ux * node_r * 1.15, p1[1] - uy * node_r * 1.15)
        wing_a = (tip[0] - ux * arrow + pxv * arrow * 0.55, tip[1] - uy * arrow + pyv * arrow * 0.55)
        wing_b = (tip[0] - ux * arrow - pxv * arrow * 0.55, tip[1] - uy * arrow - pyv * arrow * 0.55)
        cv2.polylines(stage, [np.asarray([wing_a, tip, wing_b], dtype=np.int32)], False,
                      float(value), edge_w, cv2.LINE_AA)
        # A directional pulse travels from source to target during the explain shot.
        travel = float(easing.cubic_in_out(shot.local))
        px = p0[0] + (p1[0] - p0[0]) * travel
        py = p0[1] + (p1[1] - p0[1]) * travel
        cv2.circle(stage, (round(px), round(py)), max(2, line_w * 2), 1.0, -1, cv2.LINE_AA)

    for index, ((x, y), strength) in enumerate(zip(positions, reveal)):
        if strength <= 0.01:
            continue
        radius = max(2, round(node_r * (0.72 + 0.28 * strength)))
        cv2.circle(stage, (round(x), round(y)), radius, float(0.72 + 0.24 * strength), line_w, cv2.LINE_AA)
        if anchors[index] == shot.focus:
            cv2.circle(stage, (round(x), round(y)), round(radius * 1.7), float(0.46 * strength), line_w, cv2.LINE_AA)

    # Labels are redrawn as crisp UI typography after the ASCII grade; the
    # circles/edges remain fully asciified while words stay readable at feed size.
    if shot.purpose == "transform":
        resolve = float(easing.cubic_out(shot.local))
        cx, cy = stage_w // 2, stage_h // 2
        cv2.circle(stage, (cx, cy), max(3, round(min(stage_w, stage_h) * 0.08 * resolve)), 0.96, line_w, cv2.LINE_AA)
    stage = _camera(stage, shot.camera, shot.local)
    output = np.zeros((height, width), dtype=np.float32)
    output[y0:y1, x0:x1] = np.clip(stage, 0.0, 1.0)
    return output
