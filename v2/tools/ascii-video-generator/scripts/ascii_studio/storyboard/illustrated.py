"""Narrative-first protocol for complete illustrated plates.

Illustrated videos are not ASCII chapters with a photograph underneath.  This
module first finds changes in proposition, rhetoric and visual subject; every
resulting unit earns one illustration.  There is deliberately no requested,
minimum or maximum image count.  After plates exist, deterministic computer-
vision inspection proposes protected and low-detail regions, while a human
semantic review remains mandatory before rendering.
"""

from __future__ import annotations

import hashlib
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import cv2
import numpy as np

from ..editorial.concepts import chapter_concepts
from ..editorial.rhetoric import classify_rhetoric
from ..editorial.verb_forms import is_conjugated_verb
from ..speech.captions import caption_text
from ..text import normalized_words, word_core
from .illustration_style import (
    DEFAULT_ILLUSTRATION_STYLE,
    assess_plate_style,
    generation_prompt,
    get_style,
    negative_prompt,
    style_contract,
)
from .schema import (
    Caption, GraphicCue, IllustrationDirection, PlateAnalysis, Relation, Storyboard,
)

ILLUSTRATED_LOOK = "tinta-papel-ilustrado"
PROTOCOL_VERSION = 3
FORBIDDEN_GRAPHIC_KINDS = {"label", "text", "title", "word", "caption"}

_TURN_MARKERS = (
    "pero ", "sin embargo", "aunque ", "en cambio", "por eso", "por lo tanto",
    "entonces ", "ahora ", "el problema", "la alternativa", "esa es", "esto no",
    "but ", "however", "instead", "therefore", "the problem", "the alternative",
)
_STRONG_RHETORIC = {
    "contrast", "question", "evidence", "consequence", "call-to-action",
    "definition", "process", "resolution",
}
_ELLIPTICAL_PIVOT_RE = re.compile(
    r"^(?:pero|sin embargo|aunque|en cambio)\s+"
    r"(?:(?:no|sí)\s+)?(?:lo|la|eso|esto|así|es|son)\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class NarrativeUnit:
    texts: list[str]
    boundary_reason: str
    rhetoric: str
    concepts: list[str]


def _sentence_units(text: str) -> list[str]:
    """Preserve every sentence occurrence; repetition can be narratively essential."""
    values = [value.strip() for value in re.split(r"(?<=[.!?])\s+|\n+", text) if value.strip()]
    return values or ([text.strip()] if text.strip() else [])


def _concept_keys(concepts: Sequence[str]) -> set[str]:
    return {
        word for concept in concepts for word in normalized_words(concept)
        if len(word) >= 4
    }


def _overlap(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def _boundary_reason(
    sentence: str, rhetoric: str, concepts: set[str],
    current_rhetoric: str, current_concepts: set[str],
) -> str:
    normalized = " ".join(normalized_words(sentence))
    if re.match(r"^\s*(?:[-*•]|\d+[.)])\s+", sentence):
        return "structured-point"
    if any(normalized.startswith(marker.strip()) for marker in _TURN_MARKERS):
        return "explicit-rhetorical-turn"
    concept_overlap = _overlap(concepts, current_concepts)
    if (
        rhetoric != current_rhetoric
        and rhetoric in _STRONG_RHETORIC
        and current_rhetoric in _STRONG_RHETORIC
        and concept_overlap < 0.42
    ):
        return "rhetorical-function-change"
    # A concept extractor can legitimately choose different nouns in two
    # consecutive sentences that still describe one drawable situation.
    # Subject change earns a cut only when both sides are materially populated
    # and the incoming sentence has enough substance to establish a new scene;
    # otherwise it becomes motion/graphics inside the current plate.
    if (
        len(concepts) >= 2 and len(current_concepts) >= 2
        and concept_overlap == 0.0 and len(sentence.split()) >= 18
    ):
        return "visual-subject-change"
    return ""


def _merge_elliptical_pivots(
    units: list[NarrativeUnit], title: str, full_text: str,
) -> list[NarrativeUnit]:
    """Attach a tiny rhetorical hinge to the scene it introduces.

    “Pero no lo es” is an edit cue, not a self-sufficient illustration.  It
    should trigger a change *within* the next plate rather than flash a new
    image for a handful of words.  This is semantic, not a minimum/maximum
    image-count rule: a short sentence with an actual subject and action (for
    example “Sin embargo la red lo distribuye”) remains its own unit.
    """
    merged: list[NarrativeUnit] = []
    index = 0
    while index < len(units):
        unit = units[index]
        proposition = " ".join(unit.texts).strip()
        if (
            index + 1 < len(units)
            and len(proposition.split()) <= 7
            and _ELLIPTICAL_PIVOT_RE.match(proposition)
        ):
            following = units[index + 1]
            texts = unit.texts + following.texts
            segment = " ".join(texts)
            merged.append(NarrativeUnit(
                texts=texts,
                boundary_reason=unit.boundary_reason,
                rhetoric=following.rhetoric,
                concepts=chapter_concepts(segment, full_text, title, limit=4),
            ))
            index += 2
            continue
        merged.append(unit)
        index += 1
    return merged


def split_illustrated_units(title: str, text: str) -> list[NarrativeUnit]:
    """Find image-worthy units without a target count or a length cap."""
    sentences = _sentence_units(text)
    if not sentences:
        return []
    units: list[NarrativeUnit] = []
    current: list[str] = []
    current_reason = "opening-proposition"
    current_rhetoric = "statement"
    current_concepts: set[str] = set()

    for sentence in sentences:
        rhetoric = classify_rhetoric(sentence)
        concepts = chapter_concepts(sentence, text, title, limit=4)
        keys = _concept_keys(concepts)
        reason = (
            _boundary_reason(sentence, rhetoric, keys, current_rhetoric, current_concepts)
            if current else ""
        )
        if current and reason:
            segment = " ".join(current)
            unit_concepts = chapter_concepts(segment, text, title, limit=4)
            units.append(NarrativeUnit(current, current_reason, current_rhetoric, unit_concepts))
            current = []
            current_reason = reason
            current_concepts = set()
        current.append(sentence)
        current_concepts |= keys
        current_rhetoric = rhetoric if rhetoric in _STRONG_RHETORIC else current_rhetoric

    if current:
        segment = " ".join(current)
        units.append(NarrativeUnit(
            current, current_reason, current_rhetoric,
            chapter_concepts(segment, text, title, limit=4),
        ))
    return _merge_elliptical_pivots(units, title, text)


def _local_trigger(tokens: Sequence[str], relation: Relation) -> int:
    candidates = normalized_words(relation.target) + normalized_words(relation.source)
    wanted = {word_core(value) for value in candidates if word_core(value)}
    for index, token in enumerate(tokens):
        if word_core(token) in wanted:
            return index
    return max(0, len(tokens) // 2)


def _phrase_trigger(tokens: Sequence[str], phrase: str, fallback: int) -> int:
    """Locate the exact first token of authored microtext in local narration."""
    wanted = normalized_words(phrase)
    surfaces = [word_core(token) for token in tokens]
    if wanted:
        for index in range(len(surfaces) - len(wanted) + 1):
            if surfaces[index:index + len(wanted)] == wanted:
                return index
    return fallback


def _graphic_kind(relation: Relation) -> str:
    return {
        "causes": "causal-path",
        "creates": "causal-path",
        "enables": "bridge",
        "reduces": "subtraction-mask",
        "contrasts": "split-field",
        "conceals": "reveal-mask",
        "reinforces": "feedback-loop",
        "connects": "connection-path",
    }.get(relation.kind, "relationship-path")


def _relation_callout(narrated: str, relation: Relation) -> str:
    """Return a short phrase already spoken, never invented overlay copy."""
    narration_words = normalized_words(narrated)
    tokens = narrated.split()
    valid: list[tuple[str, int]] = []
    for candidate in (
        f"{relation.source} {relation.target}".strip(),
        relation.target,
        relation.source,
    ):
        words = normalized_words(candidate)
        if not 1 <= len(words) <= 4:
            continue
        # The surface phrase must exist without punctuation inserted between
        # its words. Normalized-token adjacency alone accepted spans across a
        # comma ("debilidad, sostener") as if they were authored copy.
        if candidate.strip().casefold() not in narrated.casefold():
            continue
        # Relation extraction may join a noun at the end of one clause to the
        # verb that begins the next ("debilidad sostener").  Such a span is
        # technically present in token order but reads like broken copy.
        if len(words) > 1 and is_conjugated_verb(words[-1]):
            continue
        for index in range(len(narration_words) - len(words) + 1):
            if narration_words[index:index + len(words)] == words:
                valid.append((candidate.strip().upper(), index))
                break
    if not valid:
        return ""
    # Prefer the relation target while it still leaves enough narration to
    # reveal and hold.  A target on the final word would only flash; in that
    # case use the earliest valid source phrase and bind it to its own word.
    target = relation.target.strip().upper()
    minimum_tail = max(3, round(len(tokens) * 0.16))
    target_match = next((value for value in valid if value[0] == target), None)
    if (
        target_match
        and len(tokens) - target_match[1] - len(normalized_words(target)) >= minimum_tail
    ):
        return target_match[0]
    return min(valid, key=lambda value: value[1])[0]


def _cue_animation(kind: str) -> str:
    return {
        "causal-path": "draw-pulse-arrive",
        "connection-path": "thread-pulse-connect",
        "relationship-path": "thread-pulse-connect",
        "bridge": "arch-build-settle",
        "feedback-loop": "orbit-draw-pulse",
        "split-field": "seam-open-hold",
        "subtraction-mask": "hatch-cancel-clear",
        "reveal-mask": "corner-scan-reveal",
    }.get(kind, "draw-hold-retract")


def make_illustration_direction(
    *, texts: list[str], boundary_reason: str, rhetoric: str,
    concepts: Sequence[str], relations: Sequence[Relation], word_start: int,
    previous_subject: str = "",
    style_id: str = DEFAULT_ILLUSTRATION_STYLE,
) -> IllustrationDirection:
    narrated = " ".join(caption_text(value) for value in texts)
    tokens = narrated.split()
    proposition = " ".join(texts).strip()
    subject = concepts[0] if concepts else (normalized_words(proposition)[0] if proposition else "idea")
    visual_thesis = {
        "contrast": f"Hacer visible la oposición que organiza la idea de {subject}.",
        "question": f"Convertir la duda sobre {subject} en una situación visual abierta.",
        "evidence": f"Mostrar la evidencia material alrededor de {subject}, no un símbolo genérico.",
        "consequence": f"Mostrar la consecuencia concreta que nace de {subject}.",
        "call-to-action": f"Mostrar la acción posible y quién puede ejercerla sobre {subject}.",
        "definition": f"Dar una forma concreta y legible a la definición de {subject}.",
        "process": f"Mostrar cómo {subject} cambia de estado paso a paso.",
        "resolution": f"Resolver visualmente la tensión acumulada alrededor de {subject}.",
    }.get(rhetoric, f"Encarnar la proposición sobre {subject} en una escena específica.")
    profile = get_style(style_id)
    must_show = list(concepts[:4]) or [subject]
    continuity_in = (
        f"Conservar una relación visual reconocible con {previous_subject}; "
        f"el cambio hacia {subject} debe sentirse motivado por la narración."
        if previous_subject else "Establecer la gramática visual que continuará en las imágenes siguientes."
    )
    image_brief = (
        f"{profile.name}. Ilustración editorial completa para: {proposition} "
        f"La imagen debe sostener por sí sola esta tesis visual: {visual_thesis}"
    )
    prompt = generation_prompt(
        proposition=proposition, visual_thesis=visual_thesis,
        must_show=must_show, continuity_in=continuity_in, style_id=style_id,
    )
    graphics: list[GraphicCue] = []
    for index, relation in enumerate(relations):
        semantic_trigger = _local_trigger(tokens, relation)
        kind = _graphic_kind(relation)
        callout = _relation_callout(narrated, relation)
        callout_trigger = _phrase_trigger(tokens, callout, semantic_trigger)
        # The visual argument begins before the exact phrase that names it, then
        # develops through that phrase and resolves near the end of the image
        # unit.  Microtext remains tied to ``callout_trigger``; separating the
        # two timings gives the object enough screen life to tell a story.
        prelude = max(1, min(5, len(tokens) // 6))
        trigger = max(0, callout_trigger - prelude)
        minimum_life = max(6, round(len(tokens) * 0.62))
        end = min(
            len(tokens) - 1,
            max(callout_trigger + 4, trigger + minimum_life),
        )
        graphics.append(GraphicCue(
            id=f"relation-{index + 1:02d}", kind=kind,
            purpose=(
                f"Hacer perceptible la relación {relation.source} {relation.kind} "
                f"{relation.target}; el microtexto, si existe, sólo identifica una frase ya pronunciada."
            ),
            trigger_token=trigger, end_token=max(trigger, end),
            callout_trigger_token=callout_trigger,
            source=relation.source, target=relation.target,
            treatment="cobalt-indigo-ink-red-punctuation",
            callout=callout,
            animation=_cue_animation(kind),
            emphasis="primary" if index == 0 else "secondary",
        ))
    return IllustrationDirection(
        word_start=word_start,
        word_end=word_start + len(tokens),
        narration_checksum=hashlib.sha256(narrated.encode("utf-8")).hexdigest(),
        boundary_reason=boundary_reason,
        narrative_function=rhetoric,
        proposition=proposition,
        visual_thesis=visual_thesis,
        image_brief=image_brief,
        style_id=style_id,
        generation_prompt=prompt,
        negative_prompt=negative_prompt(style_id),
        must_show=must_show,
        must_avoid=[
            "texto incrustado", "rótulos flotantes", "metáfora genérica",
            "elementos decorativos sin función narrativa", "duplicar literalmente el subtítulo",
            "rostros o siluetas reconocibles de dirigentes, candidatos o figuras públicas reales",
            "peinados, gestos, patillas, trajes o poses asociados a líderes políticos contemporáneos",
            "un varón carismático central presentado como héroe, conductor o salvador",
            "símbolos, colores, consignas o iconografía de partidos políticos reales",
        ],
        continuity_in=continuity_in,
        transition="motivated-cut",
        graphics=graphics,
    )


def finalize_continuity(storyboard: Storyboard) -> None:
    for index, chapter in enumerate(storyboard.chapters):
        direction = chapter.illustration
        if direction is None:
            continue
        if index + 1 < len(storyboard.chapters):
            next_chapter = storyboard.chapters[index + 1]
            next_subject = (
                next_chapter.illustration.must_show[0]
                if next_chapter.illustration and next_chapter.illustration.must_show
                else next_chapter.hero_subject
            )
            direction.continuity_out = (
                f"Preparar el paso hacia {next_subject} mediante forma, mirada, dirección o escala; "
                "no cortar solamente porque terminó un intervalo de tiempo."
            )
        else:
            direction.continuity_out = "Cerrar la tesis visual sin introducir una idea nueva."


def _hex(rgb: Sequence[int]) -> str:
    return "#" + "".join(f"{int(value):02X}" for value in rgb)


def _palette(rgb: np.ndarray, limit: int = 6) -> list[str]:
    sample = rgb[::8, ::8].reshape(-1, 3)
    quantized = (sample // 32 * 32 + 16).clip(0, 255).astype(np.uint8)
    counts = Counter(map(tuple, quantized.tolist()))
    return [_hex(value) for value, _count in counts.most_common(limit)]


def _focus_box(gray: np.ndarray) -> list[float]:
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    saliency = cv2.GaussianBlur(cv2.magnitude(gx, gy), (0, 0), 5.0)
    threshold = float(np.percentile(saliency, 82))
    ys, xs = np.where(saliency >= threshold)
    height, width = gray.shape
    if not len(xs):
        return [0.2, 0.15, 0.8, 0.70]
    return [
        round(max(0.0, float(np.percentile(xs, 8)) / width), 4),
        round(max(0.0, float(np.percentile(ys, 8)) / height), 4),
        round(min(1.0, float(np.percentile(xs, 92)) / width), 4),
        round(min(1.0, float(np.percentile(ys, 92)) / height), 4),
    ]


def _overlay_regions(gray: np.ndarray, count: int = 3) -> list[list[float]]:
    height, width = gray.shape
    edges = cv2.Canny(gray, 38, 112)
    candidates: list[tuple[float, list[float]]] = []
    # Narrative stage only: captions/footer have their own reserved furniture.
    for row in range(3):
        for col in range(3):
            x0, x1 = col / 3, (col + 1) / 3
            y0, y1 = 0.09 + row * 0.17, 0.09 + (row + 1) * 0.17
            crop = gray[int(y0 * height):int(y1 * height), int(x0 * width):int(x1 * width)]
            edge_crop = edges[int(y0 * height):int(y1 * height), int(x0 * width):int(x1 * width)]
            if not crop.size:
                continue
            score = float(np.mean(edge_crop > 0)) * 0.72 + float(crop.std() / 255.0) * 0.28
            candidates.append((score, [round(x0, 4), round(y0, 4), round(x1, 4), round(y1, 4)]))
    return [region for _score, region in sorted(candidates, key=lambda value: value[0])[:count]]


def analyze_plate(
    path: Path, previous: PlateAnalysis | None = None,
    style_id: str = DEFAULT_ILLUSTRATION_STYLE,
) -> PlateAnalysis:
    path = Path(path).expanduser().resolve()
    if not path.exists() or not path.is_file():
        return PlateAnalysis(path=str(path), status="missing")
    payload = path.read_bytes()
    checksum = hashlib.sha256(payload).hexdigest()
    bgr = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if bgr is None:
        return PlateAnalysis(path=str(path), checksum=checksum, status="unreadable")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    height, width = gray.shape
    edge_density = float(np.mean(cv2.Canny(gray, 38, 112) > 0))
    style_score, style_checks, style_metrics = assess_plate_style(rgb, style_id)
    keep_review = (
        previous is not None and previous.checksum == checksum
        and previous.style_id in {"", style_id}
    )
    return PlateAnalysis(
        path=str(path), checksum=checksum, status="analyzed",
        width=width, height=height, aspect_ratio=round(width / max(1, height), 5),
        luma_mean=round(float(gray.mean()), 3), contrast=round(float(gray.std()), 3),
        edge_density=round(edge_density, 6), palette=_palette(rgb),
        focus_box=_focus_box(gray), overlay_regions=_overlay_regions(gray),
        semantic_summary=previous.semantic_summary if keep_review else "",
        narrative_match=previous.narrative_match if keep_review else "",
        must_show_coverage=list(previous.must_show_coverage) if keep_review else [],
        must_avoid_clear=bool(previous.must_avoid_clear) if keep_review else False,
        continuity_notes=previous.continuity_notes if keep_review else "",
        approved=bool(previous.approved) if keep_review else False,
        style_id=style_id, style_score=style_score,
        style_checks=style_checks, style_metrics=style_metrics,
    )


def analyze_storyboard_plates(storyboard: Storyboard) -> None:
    for chapter in storyboard.chapters:
        direction = chapter.illustration
        if direction is None:
            continue
        if not chapter.plate:
            direction.plate_analysis = PlateAnalysis(status="missing")
            continue
        direction.plate_analysis = analyze_plate(
            Path(chapter.plate),
            direction.plate_analysis,
            direction.style_id,
        )
        if direction.plate_analysis.status == "analyzed":
            for index, cue in enumerate(direction.graphics):
                if not cue.target_region and direction.plate_analysis.overlay_regions:
                    cue.target_region = list(
                        direction.plate_analysis.overlay_regions[
                            min(index, len(direction.plate_analysis.overlay_regions) - 1)
                        ]
                    )


def validate_illustrated_protocol(
    storyboard: Storyboard, *, require_render_ready: bool = False,
) -> list[str]:
    if storyboard.look != ILLUSTRATED_LOOK:
        return []
    problems: list[str] = []
    if storyboard.illustrated_protocol < PROTOCOL_VERSION:
        problems.append(f"storyboard: falta el protocolo ilustrado v{PROTOCOL_VERSION}")
    if storyboard.overlay_policy != "graphics-only":
        problems.append("storyboard: overlay_policy debe ser graphics-only")
    cursor = 0
    for chapter in storyboard.chapters:
        direction = chapter.illustration
        prefix = chapter.id
        if direction is None:
            problems.append(f"{prefix}: falta illustration")
            continue
        tokens = " ".join(caption_text(value) for value in chapter.texts).split()
        narrated = " ".join(caption_text(value) for value in chapter.texts)
        if direction.word_start != cursor:
            problems.append(f"{prefix}: word_start rompe la cobertura contigua")
        if direction.word_end - direction.word_start != len(tokens):
            problems.append(f"{prefix}: el rango de palabras no coincide con la narración")
        if direction.narration_checksum != hashlib.sha256(narrated.encode("utf-8")).hexdigest():
            problems.append(f"{prefix}: la narración cambió después de planificar la imagen")
        cursor = direction.word_end
        if not direction.proposition or not direction.visual_thesis or not direction.image_brief:
            problems.append(f"{prefix}: falta proposición, tesis visual o brief de imagen")
        if direction.style_id != storyboard.illustration_style:
            problems.append(f"{prefix}: el estilo de imagen no coincide con el storyboard")
        if not direction.generation_prompt or not direction.negative_prompt:
            problems.append(f"{prefix}: falta el contrato reproducible de generación")
        for cue in direction.graphics:
            if cue.kind.lower() in FORBIDDEN_GRAPHIC_KINDS:
                problems.append(f"{prefix}/{cue.id}: el ilustrado prohíbe gráficos de texto")
            if not (0 <= cue.trigger_token <= cue.end_token < max(1, len(tokens))):
                problems.append(f"{prefix}/{cue.id}: cue fuera del rango de narración")
            callout_token = (
                cue.callout_trigger_token
                if cue.callout_trigger_token >= 0 else cue.trigger_token
            )
            if not (cue.trigger_token <= callout_token <= cue.end_token):
                problems.append(f"{prefix}/{cue.id}: microtexto fuera del desarrollo visual")
            if not cue.purpose:
                problems.append(f"{prefix}/{cue.id}: falta propósito semántico")
            if len(cue.callout.split()) > 4:
                problems.append(f"{prefix}/{cue.id}: el microtexto supera cuatro palabras")
            if cue.callout:
                callout = normalized_words(cue.callout)
                narration = normalized_words(narrated)
                if not any(
                    narration[index:index + len(callout)] == callout
                    for index in range(len(narration) - len(callout) + 1)
                ):
                    problems.append(f"{prefix}/{cue.id}: el microtexto no pertenece a la narración")
        if not require_render_ready:
            continue
        if not direction.direction_approved:
            problems.append(f"{prefix}: dirección de imagen no aprobada")
        analysis = direction.plate_analysis
        if not chapter.plate or analysis.status != "analyzed":
            problems.append(f"{prefix}: falta una placa analizada")
        elif not Path(chapter.plate).exists():
            problems.append(f"{prefix}: la placa aprobada ya no existe")
        if not analysis.semantic_summary:
            problems.append(f"{prefix}: falta describir qué muestra realmente la placa")
        if not analysis.narrative_match:
            problems.append(f"{prefix}: falta justificar su correspondencia con la narración")
        if len(analysis.must_show_coverage) < len(direction.must_show):
            problems.append(f"{prefix}: falta confirmar visualmente cada elemento must_show")
        if not analysis.must_avoid_clear:
            problems.append(f"{prefix}: falta confirmar que la placa evita los must_avoid")
        if not analysis.continuity_notes:
            problems.append(f"{prefix}: falta revisar continuidad con las placas vecinas")
        if not analysis.approved:
            problems.append(f"{prefix}: análisis de placa no aprobado")
        if analysis.style_id != direction.style_id or analysis.style_score < 0.82:
            problems.append(
                f"{prefix}: la placa se aleja del estilo {direction.style_id} "
                f"({analysis.style_score:.2f})"
            )
        for cue in direction.graphics:
            if len(cue.target_region) != 4:
                problems.append(f"{prefix}/{cue.id}: falta ubicar el gráfico sobre la placa analizada")
            else:
                x0, y0, x1, y1 = cue.target_region
                if not (0.0 <= x0 < x1 <= 1.0 and 0.07 <= y0 < y1 <= 0.62):
                    problems.append(
                        f"{prefix}/{cue.id}: la región gráfica sale del área narrativa segura"
                    )
    if require_render_ready and storyboard.illustrated_review_status != "approved":
        problems.append("storyboard: illustrated_review_status debe ser approved")
    return problems


def illustrated_protocol_summary(storyboard: Storyboard) -> dict[str, object]:
    directions = [chapter.illustration for chapter in storyboard.chapters if chapter.illustration]
    analyzed = sum(value.plate_analysis.status == "analyzed" for value in directions)
    approved = sum(value.direction_approved and value.plate_analysis.approved for value in directions)
    return {
        "protocol": storyboard.illustrated_protocol,
        "status": storyboard.illustrated_review_status,
        "illustration_style": storyboard.illustration_style,
        "image_count": len(directions),
        "analyzed_images": analyzed,
        "approved_images": approved,
        "planning_errors": validate_illustrated_protocol(storyboard),
        "render_errors": validate_illustrated_protocol(storyboard, require_render_ready=True),
    }


def illustration_briefs(storyboard: Storyboard) -> dict[str, object]:
    """Ordered handoff package for creating plates after narrative approval."""
    units = []
    for chapter in storyboard.chapters:
        direction = chapter.illustration
        if direction is None:
            continue
        units.append({
            "id": chapter.id,
            "required_filename": f"{chapter.id}.png",
            "word_start": direction.word_start,
            "word_end": direction.word_end,
            "boundary_reason": direction.boundary_reason,
            "narration": direction.proposition,
            "narrative_function": direction.narrative_function,
            "visual_thesis": direction.visual_thesis,
            "image_brief": direction.image_brief,
            "style_id": direction.style_id,
            "generation_prompt": direction.generation_prompt,
            "negative_prompt": direction.negative_prompt,
            "must_show": direction.must_show,
            "must_avoid": direction.must_avoid,
            "continuity_in": direction.continuity_in,
            "continuity_out": direction.continuity_out,
            "planned_graphics": [
                {
                    "id": cue.id, "kind": cue.kind, "purpose": cue.purpose,
                    "trigger_token": cue.trigger_token, "end_token": cue.end_token,
                    "callout_trigger_token": cue.callout_trigger_token,
                    "callout": cue.callout, "animation": cue.animation,
                    "emphasis": cue.emphasis,
                }
                for cue in direction.graphics
            ],
        })
    return {
        "protocol": PROTOCOL_VERSION,
        "illustration_style": storyboard.illustration_style,
        "style_contract": style_contract(storyboard.illustration_style),
        "image_count": len(units),
        "count_policy": "narrative-earned-no-minimum-no-maximum",
        "units": units,
    }


def bind_illustrated_timeline(
    storyboard: Storyboard, captions: Sequence[Caption],
) -> dict[str, object]:
    """Resolve every image and graphic cue against native word-boundary times."""
    units: list[dict[str, object]] = []
    problems: list[str] = []
    chapter_payloads: list[tuple[object, IllustrationDirection, list[object]]] = []
    for chapter in storyboard.chapters:
        direction = chapter.illustration
        if direction is None:
            problems.append(f"{chapter.id}: falta dirección ilustrada")
            continue
        timed_words = [
            word for caption in captions if caption.section == chapter.id for word in caption.words
        ]
        expected = direction.word_end - direction.word_start
        if len(timed_words) != expected:
            problems.append(
                f"{chapter.id}: {len(timed_words)} palabras temporizadas para {expected} planificadas"
            )
            continue
        chapter_payloads.append((chapter, direction, timed_words))

    for payload_index, (chapter, direction, timed_words) in enumerate(chapter_payloads):
        graphics = []
        for cue in direction.graphics:
            if not (0 <= cue.trigger_token <= cue.end_token < len(timed_words)):
                problems.append(f"{chapter.id}/{cue.id}: cue sin palabra temporizada")
                continue
            callout_token = (
                cue.callout_trigger_token
                if cue.callout_trigger_token >= 0 else cue.trigger_token
            )
            if not (cue.trigger_token <= callout_token <= cue.end_token):
                problems.append(f"{chapter.id}/{cue.id}: microtexto fuera del desarrollo visual")
                continue
            graphics.append({
                "id": cue.id, "kind": cue.kind, "purpose": cue.purpose,
                "start_seconds": round(timed_words[cue.trigger_token].start, 4),
                "end_seconds": round(timed_words[cue.end_token].end, 4),
                "trigger_word": timed_words[cue.trigger_token].text,
                "callout_seconds": round(timed_words[callout_token].start, 4),
                "callout_word": timed_words[callout_token].text,
                "target_region": cue.target_region,
                "callout": cue.callout,
                "animation": cue.animation,
            })
        next_start = (
            chapter_payloads[payload_index + 1][2][0].start
            if payload_index + 1 < len(chapter_payloads) else timed_words[-1].end
        )
        units.append({
            "id": chapter.id,
            "word_start": direction.word_start,
            "word_end": direction.word_end,
            "start_seconds": round(timed_words[0].start, 4),
            "speech_end_seconds": round(timed_words[-1].end, 4),
            "end_seconds": round(next_start, 4),
            "boundary_reason": direction.boundary_reason,
            "proposition": direction.proposition,
            "plate": chapter.plate,
            "graphics": graphics,
        })
    return {
        "protocol": PROTOCOL_VERSION,
        "exact_word_boundaries": True,
        "image_count": len(units),
        "units": units,
        "errors": problems,
        "passed": not problems,
    }
