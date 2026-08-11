"""Building a storyboard from source text: keywords, motifs, chapters."""

from __future__ import annotations

import hashlib
import math
import re
from collections import Counter
from pathlib import Path
from typing import Sequence

from ascii_studio.editorial.adapt import hook_candidates
from ascii_studio.editorial.concepts import chapter_concepts, extract_concepts
from ascii_studio.editorial.relations import direct_fallback_relations, extract_relations
from ascii_studio.editorial.rhetoric import classify_rhetoric
from ascii_studio.text import ends_clause, ends_sentence, is_function_word, normalized_words

from .director import (
    build_shots, choose_archetype, compact_anchor, reveal_bindings, temperature_for,
    world_direction,
)
from .illustrated import (
    ILLUSTRATED_LOOK, PROTOCOL_VERSION, finalize_continuity, make_illustration_direction,
    split_illustrated_units,
)
from .illustration_style import DEFAULT_ILLUSTRATION_STYLE
from .schema import Caption, Chapter, Shot, Storyboard

STOPWORDS = {
    "a", "aca", "ahora", "al", "algo", "alguien", "ante", "aqui", "asi", "aun",
    "aunque", "bien", "buscar", "cada", "cambiar", "como", "con", "contra", "crea", "crear",
    "cuando", "de", "decide", "del", "desde", "donde", "dos", "el", "ella", "en",
    "entre", "era", "es", "esa", "ese", "eso", "esta", "estan", "este", "esto",
    "forma", "genera", "hace", "hacer", "hasta", "hay", "la", "las", "lo", "los",
    "manera", "mas", "medio", "mi", "mismo", "mismos", "mitad", "momento", "mueve",
    "muy", "necesita", "necesitan", "ni", "no", "nos", "nueva", "nuevas", "nuevo",
    "nunca", "o", "para", "parte", "pero", "pide", "pierde", "poco", "por",
    "porque", "puede", "pueden", "que", "quien", "real", "se", "si", "siempre",
    "sin", "sino", "sobre", "solo", "son", "su", "sus", "tambien", "tanto", "te",
    "tener", "tenes", "tiene", "tienen", "todo", "trata", "tratar", "tu", "un",
    "una", "uno", "vez", "visible", "vuelva", "y", "ya",
    "a", "an", "and", "are", "as", "at", "be", "becomes", "been", "being", "but",
    "by", "can", "could", "did", "do", "does", "doing", "each", "for", "from",
    "had", "has", "have", "he", "her", "here", "him", "his", "how", "if", "in",
    "into", "is", "it", "its", "just", "makes", "may", "more", "most", "must",
    "my", "no", "not", "of", "on", "only", "or", "our", "out", "over", "she",
    "should", "so", "some", "than", "that", "the", "their", "them", "then",
    "there", "these", "they", "this", "those", "through", "to", "too", "turns",
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "who",
    "why", "will", "with", "would", "you", "your",
}
MOTIF_RULES = {
    "noise": {"caos", "confusion", "ruido", "azar", "exceso", "duda", "crisis", "incertidumbre", "chaos", "noise", "random", "uncertainty"},
    "signal": {"senal", "atencion", "descubrir", "detectar", "claridad", "evidencia", "observar", "ver", "signal", "attention", "discover", "detect", "clarity", "observe"},
    "network": {"comunidad", "confianza", "conectar", "red", "relacion", "social", "sistema", "vinculo", "community", "trust", "connect", "network", "relationship", "system", "cooperation", "transparency"},
    "orbit": {"ciclo", "habito", "patron", "repetir", "retorno", "ritmo", "rutina", "tiempo", "cycle", "habit", "pattern", "repeat", "return", "rhythm", "routine", "time"},
    "mirror": {"identidad", "interior", "memoria", "mirada", "reflejo", "verdad", "yo", "identity", "inner", "memory", "reflection", "truth", "self"},
    "blueprint": {"arquitectura", "construir", "estructura", "estrategia", "mapa", "modelo", "proceso", "architecture", "build", "structure", "strategy", "map", "model", "process", "design"},
    "pulse": {"cambio", "energia", "fuerza", "impacto", "movimiento", "poder", "transformacion", "vida", "change", "energy", "force", "impact", "movement", "power", "transformation", "life", "strengthen"},
    "fracture": {"cortar", "fractura", "limite", "quebrar", "romper", "ruptura", "salir", "cut", "fracture", "limit", "break", "rupture", "release"},
    "evidence": {"aprender", "decidir", "pregunta", "respuesta", "saber", "sentido", "pensar", "learn", "decide", "question", "answer", "know", "meaning", "think", "proof"},
    "horizon": {"camino", "comenzar", "futuro", "nuevo", "posible", "resolver", "salida", "transformar", "path", "begin", "future", "new", "possible", "resolve", "exit", "transform", "promise", "durable"},
}
FALLBACK_MOTIFS = ["noise", "signal", "network", "orbit", "mirror", "evidence", "fracture", "horizon"]
PALETTES = {
    "noise": ("#f2bc67", "#ee735f", "#c7d2ce"),
    "signal": ("#f5d47c", "#66d7c0", "#e5f3ef"),
    "network": ("#7dd5c2", "#e6bb63", "#edf4ef"),
    "orbit": ("#d5be75", "#ef7b65", "#72c7bc"),
    "mirror": ("#d8e4df", "#e7b963", "#78c9bd"),
    "blueprint": ("#86d6c8", "#edc66c", "#dbe8e5"),
    "pulse": ("#efbf65", "#ed755e", "#f4e6bc"),
    "fracture": ("#f0a25d", "#eb6a59", "#d7e5de"),
    "evidence": ("#e5c36e", "#76cabb", "#edf1e8"),
    "horizon": ("#f1cb73", "#6fd0bf", "#f5efe0"),
}


def extract_keywords(text: str, limit: int = 14) -> list[str]:
    counts = Counter(
        word for word in normalized_words(text)
        if len(word) >= 4 and word not in STOPWORDS and not word.isdigit()
    )
    return [word for word, _count in counts.most_common(limit)]


def _chunk_long_sentence(words: list[str], max_words: int) -> list[str]:
    """Hard-chunk a sentence longer than `max_words`, still avoiding a break
    on a dangling preposition/article/conjunction where one can be avoided.

    Mirrors the old behaviour (break once `max_words` is reached, forced by
    `max_words + 4` at the latest) but searches that same window for a
    clause-punctuation boundary first, and failing that backs off to the
    nearest word that is not a bare function word, instead of cutting
    blindly at whatever word the counter landed on.
    """
    n = len(words)
    hard_max = max_words + 4
    chunks: list[str] = []
    start = 0
    while start < n:
        remaining = n - start
        if remaining <= max_words:
            chunks.append(" ".join(words[start:n]))
            break
        target_index = min(n - 1, start + max_words - 1)
        soft_max_index = min(n - 1, start + hard_max - 1)
        best: int | None = None
        for i in range(target_index, soft_max_index + 1):
            if ends_clause(words[i]) or ends_sentence(words[i]):
                best = i
                break
        if best is None:
            for i in range(target_index, start - 1, -1):
                if not is_function_word(words[i]):
                    best = i
                    break
        if best is None:
            best = target_index
        chunks.append(" ".join(words[start:best + 1]))
        start = best + 1
    return chunks


def split_units(text: str, max_words: int = 15) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    units: list[str] = []
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        words = sentence.split()
        if len(words) <= max_words:
            units.append(sentence)
            continue
        units.extend(_chunk_long_sentence(words, max_words))
    deduped: list[str] = []
    seen: set[str] = set()
    for unit in units:
        key = " ".join(normalized_words(unit))
        if key and key not in seen:
            deduped.append(unit)
            seen.add(key)
    return deduped or [text]


def partition(items: Sequence[str], count: int) -> list[list[str]]:
    """Contiguous, word-balanced chapters rather than equal sentence counts."""
    if count <= 0 or not items:
        return []
    count = min(count, len(items))
    chunks: list[list[str]] = []
    cursor = 0
    remaining_words = sum(len(item.split()) for item in items)
    for chapter_index in range(count):
        remaining_chunks = count - chapter_index
        if remaining_chunks == 1:
            chunks.append(list(items[cursor:]))
            break
        target = remaining_words / remaining_chunks
        chunk: list[str] = []
        chunk_words = 0
        max_take = len(items) - cursor - (remaining_chunks - 1)
        while len(chunk) < max_take:
            next_item = items[cursor + len(chunk)]
            next_words = len(next_item.split())
            if chunk and chunk_words >= target:
                break
            chunk.append(next_item)
            chunk_words += next_words
        chunks.append(chunk)
        cursor += len(chunk)
        remaining_words -= chunk_words
    return chunks


def semantic_hits(words: set[str], vocabulary: set[str]) -> int:
    return sum(
        1 for root in vocabulary
        if any(word.startswith(root[:5]) or root.startswith(word[:5]) for word in words)
    )


def choose_motif(text: str, fallback: str, previous: str | None, used: Counter[str]) -> str:
    words = set(normalized_words(text))
    scored = sorted(
        ((semantic_hits(words, vocabulary) - used[motif] * 0.7, motif) for motif, vocabulary in MOTIF_RULES.items()),
        reverse=True,
    )
    motif = scored[0][1] if scored[0][0] > 0 else fallback
    if motif == previous:
        alternatives = [candidate for score, candidate in scored if score > 0 and candidate != previous]
        if alternatives:
            motif = alternatives[0]
    return motif


def content_seed(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:8], 16)


def chapter_anchors(segment: str, full_text: str, title: str, limit: int = 4) -> list[str]:
    """On-screen chapter anchors/keyword source.

    Backed by `editorial.concepts.chapter_concepts` (TF-IDF against a
    background Spanish corpus, multi-word noun phrases, position weighting,
    conjugated-verb and function-word rejection, proper-noun recurrence
    checks) instead of the raw word-frequency `extract_keywords` this used
    to call -- that produced function words and conjugated verbs as often as
    real concepts (e.g. "PALABRA", "PASA", "FALTA", "ESTAS" were real
    on-screen output). `extract_keywords` is kept for other callers (see its
    docstring) but is no longer in this path.
    """
    anchors = chapter_concepts(segment, full_text, title, limit)
    title_words = normalized_words(title)

    def title_position(anchor: str) -> int:
        positions = [title_words.index(word) for word in normalized_words(anchor) if word in title_words]
        return min(positions) if positions else len(title_words) + 1

    # When a chapter names the thesis, direct the proposition from the title's
    # subject to its complement instead of letting raw frequency reverse it.
    return [value for _index, value in sorted(
        enumerate(anchors), key=lambda pair: (title_position(pair[1]), pair[0])
    )]


def visual_metaphor(motif: str, anchors: Sequence[str]) -> str:
    subject = " / ".join(anchors[:3]) or motif.upper()
    templates = {
        "noise": "interference field concealing " + subject,
        "signal": "detector isolating " + subject,
        "network": "relational map connecting " + subject,
        "orbit": "recurring system revolving around " + subject,
        "mirror": "symmetrical reflection questioning " + subject,
        "blueprint": "editorial blueprint organizing " + subject,
        "pulse": "propagating force generated by " + subject,
        "fracture": "structural break releasing " + subject,
        "evidence": "evidence board indexing " + subject,
        "horizon": "converging paths opening toward " + subject,
    }
    return templates[motif]


def chapter_parameters(segment: str, motif: str, anchors: Sequence[str]) -> tuple[int, float, float, str]:
    seed = content_seed(segment + motif)
    words = normalized_words(segment)
    density = min(0.94, 0.36 + len(set(words)) / max(80, len(words) * 2.4))
    action_roots = {"cambiar", "construir", "crear", "mover", "romper", "transformar", "avanzar", "conectar"}
    action_hits = semantic_hits(set(words), action_roots)
    motion = min(0.96, 0.38 + action_hits * 0.09 + segment.count("!") * 0.04 + segment.count("?") * 0.025)
    compositions = {
        "noise": ("scan", "fault", "cascade"),
        "signal": ("radar", "beacon", "trace"),
        "network": ("constellation", "mesh", "bridge"),
        "orbit": ("orbital", "spiral", "return"),
        "mirror": ("axis", "echo", "reflection"),
        "blueprint": ("matrix", "diagram", "layers"),
        "pulse": ("wave", "core", "propagation"),
        "fracture": ("fault", "rupture", "release"),
        "evidence": ("archive", "index", "fragments"),
        "horizon": ("vanishing-point", "path", "opening"),
    }
    variants = compositions[motif]
    return seed, density, motion, variants[seed % len(variants)]


def build_storyboard(
    title: str, slug: str, text: str, chapter_limit: int, *, illustrated: bool = False,
    illustration_style: str = DEFAULT_ILLUSTRATION_STYLE,
) -> Storyboard:
    if illustrated:
        # An illustrated unit exists because the proposition, rhetorical job or
        # visual subject changed.  There is intentionally no target, minimum,
        # maximum, or `chapter_limit` in this branch.
        narrative_units = split_illustrated_units(title, text)
        chunks = [unit.texts for unit in narrative_units]
    else:
        units = split_units(text)
        # Pace by spoken length, not punctuation density.  A prose style full of
        # short sentences should not produce a parade of thin 10-word chapters.
        target_count = max(4, math.ceil(len(text.split()) / 42))
        count = min(len(units), chapter_limit, target_count)
        chunks = partition(units, count)
        narrative_units = []
    count = len(chunks)
    global_keywords = extract_concepts(text, title, limit=14) or extract_keywords(text)
    chapters: list[Chapter] = []
    previous: str | None = None
    previous_subject = ""
    word_cursor = 0
    used: Counter[str] = Counter()
    for index, texts in enumerate(chunks):
        segment = " ".join(texts)
        fallback = FALLBACK_MOTIFS[min(index, len(FALLBACK_MOTIFS) - 1)]
        motif = choose_motif(segment, fallback, previous, used)
        if index == count - 1 and not illustrated:
            motif = "horizon"
        anchors = [compact_anchor(value) for value in chapter_anchors(segment, text, title)]
        if len(anchors) < 2:
            for value in global_keywords:
                compact = compact_anchor(value)
                if compact not in anchors:
                    anchors.append(compact)
                if len(anchors) == 2:
                    break
        keyword = (anchors or [motif.upper()])[0]
        seed, density, motion, composition = chapter_parameters(segment, motif, anchors)
        primary, secondary, accent = PALETTES[motif]
        rhetoric = classify_rhetoric(segment)
        relations = direct_fallback_relations(extract_relations(segment, anchors), rhetoric)
        archetype = choose_archetype(motif, rhetoric, relations)
        world, lighting, metamorphosis, hero_subject = world_direction(motif, index, count, anchors)
        if illustrated:
            # One authored image unit, one continuous shot. Any intervention
            # inside it comes from exact word-bound graphic cues, not a generic
            # establish/explain/transform clock.
            shots = [Shot(
                "image-unit", 0.0, 1.0, "illustrate", composition, "drift", "none",
                density, "crossfade", keyword, "inhabit", lighting, "none",
            )]
            narrative_unit = narrative_units[index]
            illustration = make_illustration_direction(
                texts=texts, boundary_reason=narrative_unit.boundary_reason,
                rhetoric=rhetoric, concepts=narrative_unit.concepts or anchors,
                relations=relations, word_start=word_cursor,
                previous_subject=previous_subject,
                style_id=illustration_style,
            )
            word_cursor = illustration.word_end
        else:
            shots = build_shots(archetype, composition, anchors, density, lighting, metamorphosis)
            illustration = None
        chapters.append(Chapter(
            id=f"{index + 1:02d}-{motif}",
            label=f"{index + 1:02d} / {motif.upper()}",
            motif=motif,
            keyword=keyword,
            texts=texts,
            primary=primary,
            secondary=secondary,
            accent=accent,
            anchors=anchors,
            metaphor=visual_metaphor(motif, anchors),
            seed=seed,
            density=round(density, 3),
            motion=round(motion, 3),
            composition=composition,
            rhetoric=rhetoric,
            archetype=archetype,
            relations=relations,
            shots=shots,
            temperature=temperature_for(index, count, rhetoric),
            reveal_words=reveal_bindings(anchors, segment),
            camera=shots[0].camera if illustrated else shots[1].camera,
            world=world,
            hero_subject=hero_subject,
            depth_layers=4,
            lighting=lighting,
            metamorphosis=metamorphosis,
            illustration=illustration,
        ))
        previous = motif
        previous_subject = hero_subject
        used[motif] += 1
    thesis = " ".join(split_units(text, 22)[:2])
    hooks = hook_candidates(title, text)
    storyboard = Storyboard(
        title=title, slug=slug, thesis=thesis, keywords=global_keywords, chapters=chapters,
        version=5 if illustrated else 4,
        hook=hooks[0], cover_hook=hooks[1] if len(hooks) > 1 else hooks[0],
        format="reel" if len(text.split()) <= 240 else "long",
        look=ILLUSTRATED_LOOK if illustrated else "plata",
        illustrated_protocol=PROTOCOL_VERSION if illustrated else 0,
        illustrated_review_status="planning" if illustrated else "not-applicable",
        overlay_policy="graphics-only" if illustrated else "semantic-labels",
        illustration_style=illustration_style,
    )
    if illustrated:
        finalize_continuity(storyboard)
    return storyboard


def scene_ranges(captions: Sequence[Caption], chapters: Sequence[Chapter], duration: float) -> dict[str, tuple[float, float]]:
    if any(chapter.illustration is not None for chapter in chapters):
        # Exact illustrated cuts: the outgoing image holds through any spoken
        # pause and the new image begins on the first native word boundary of
        # its own proposition. Caption pre-roll/hold never moves an image cut.
        starts: list[float] = []
        for chapter in chapters:
            words = [
                word for caption in captions if caption.section == chapter.id for word in caption.words
            ]
            starts.append(words[0].start if words else (starts[-1] if starts else 0.0))
        return {
            chapter.id: (
                starts[index], starts[index + 1] if index + 1 < len(starts) else duration,
            )
            for index, chapter in enumerate(chapters)
        }
    ranges: dict[str, tuple[float, float]] = {}
    for chapter in chapters:
        matching = [caption for caption in captions if caption.section == chapter.id]
        ranges[chapter.id] = (
            matching[0].start if matching else 0.0,
            matching[-1].end if matching else duration,
        )
    return ranges


def write_art_direction(path: Path, storyboard: Storyboard) -> None:
    lines = [f"# {storyboard.title}", "", storyboard.thesis, ""]
    if storyboard.look == ILLUSTRATED_LOOK:
        lines.extend([
            "## Protocolo ilustrado",
            "",
            f"- Unidades de imagen determinadas por la narración: `{len(storyboard.chapters)}`",
            "- Límite mínimo/máximo: `ninguno`",
            f"- Política de superposición: `{storyboard.overlay_policy}`",
            f"- Estilo de imágenes: `{storyboard.illustration_style}`",
            f"- Estado de revisión: `{storyboard.illustrated_review_status}`",
            "- Regla: ninguna placa puede renderizarse sin análisis técnico, correspondencia narrativa y aprobación.",
            "",
        ])
    lines.extend(["## Visual Chapters", ""])
    for chapter in storyboard.chapters:
        lines.extend([
            f"### {chapter.label}",
            "",
            f"- Motif: `{chapter.motif}`",
            f"- Archetype: `{chapter.archetype}`",
            f"- Rhetoric: `{chapter.rhetoric}`",
            f"- Composition: `{chapter.composition}`",
            f"- Camera: `{chapter.camera}`",
            f"- World: `{chapter.world}`",
            f"- Hero subject: {chapter.hero_subject}",
            f"- Depth layers: `{chapter.depth_layers}`",
            f"- Lighting: `{chapter.lighting}`",
            f"- Metamorphosis: `{chapter.metamorphosis}`",
            f"- Anchors: {', '.join(chapter.anchors)}",
            f"- Relations: {', '.join(f'{relation.source} {relation.kind} {relation.target}' for relation in chapter.relations) or 'none'}",
            f"- Metaphor: {chapter.metaphor}",
            f"- Density: `{chapter.density}`",
            f"- Motion: `{chapter.motion}`",
            f"- Temperature: `{chapter.temperature}`",
            f"- Shots: {', '.join(f'{shot.purpose}:{shot.camera}/{shot.typography}' for shot in chapter.shots)}",
            f"- Seed: `{chapter.seed}`",
            "",
        ])
        if chapter.illustration:
            direction = chapter.illustration
            lines.extend([
                f"#### Contrato de imagen {chapter.id}",
                "",
                f"- Rango de palabras: `[{direction.word_start}, {direction.word_end})`",
                f"- Motivo del corte: `{direction.boundary_reason}`",
                f"- Proposición: {direction.proposition}",
                f"- Tesis visual: {direction.visual_thesis}",
                f"- Brief: {direction.image_brief}",
                f"- Estilo: `{direction.style_id}`",
                f"- Prompt de generación: {direction.generation_prompt}",
                f"- Prompt negativo: {direction.negative_prompt}",
                f"- Debe mostrar: {', '.join(direction.must_show)}",
                f"- Debe evitar: {', '.join(direction.must_avoid)}",
                f"- Continuidad de entrada: {direction.continuity_in}",
                f"- Continuidad de salida: {direction.continuity_out}",
                "- Intervenciones: " + (
                    ", ".join(
                        f"{cue.kind}/{cue.animation}"
                        + (f" «{cue.callout}»" if cue.callout else "")
                        for cue in direction.graphics
                    ) or "ninguna"
                ),
                f"- Estado de placa: `{direction.plate_analysis.status}`",
                f"- Coincidencia de estilo: `{direction.plate_analysis.style_score:.2f}`",
                "",
            ])
    path.write_text("\n".join(lines), encoding="utf-8")
