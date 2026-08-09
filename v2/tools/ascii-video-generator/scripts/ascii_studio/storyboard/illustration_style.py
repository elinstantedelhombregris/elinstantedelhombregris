"""Named, reproducible art direction for complete illustrated plates.

The style is intentionally more specific than a loose ``tinta y papel`` mood.
It was distilled from the eight ``concept-plates`` made for the presidents
essay: civic allegory, carved black line, aged stock and two disciplined spot
inks.  The prompt contract is exported with every illustration brief, while a
small raster audit catches plates that drift into soft digital painting or
full-colour cinematic imagery before human narrative approval begins.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

import cv2
import numpy as np


DEFAULT_ILLUSTRATION_STYLE = "grabado-civico"


@dataclass(frozen=True)
class IllustrationStyleProfile:
    id: str
    name: str
    visual_lineage: str
    composition: tuple[str, ...]
    palette: tuple[str, ...]
    material: tuple[str, ...]
    overlay_space: tuple[str, ...]
    forbidden: tuple[str, ...]
    target_aspect_ratio: float
    luma_range: tuple[float, float]
    contrast_range: tuple[float, float]
    edge_density_range: tuple[float, float]
    ink_fraction_range: tuple[float, float]
    warm_paper_fraction_range: tuple[float, float]


GRABADO_CIVICO = IllustrationStyleProfile(
    id=DEFAULT_ILLUSTRATION_STYLE,
    name="Grabado cívico alegórico",
    visual_lineage=(
        "grabado editorial latinoamericano, xilografía y linograbado político del siglo XX, "
        "impreso como una lámina encontrada en una bitácora cívica"
    ),
    composition=(
        "una metáfora central inmediatamente legible, nunca un collage de símbolos inconexos",
        "perspectiva monumental y profundidad en primer plano, plano medio y horizonte",
        "personas y comunidades visibles como agentes del sistema, no como decoración",
        "arquitectura, territorio e infraestructura argentinos sin propaganda partidaria",
        "surrealismo material: la escala puede ser imposible, pero los objetos siguen siendo concretos",
        "alternar concentración y distribución, encierro y apertura, amenaza y posibilidad",
    ),
    palette=(
        "tinta negra dominante con línea tallada, rayado y trama manual",
        "papel crema/ocre envejecido como segundo tono dominante",
        "violeta #5227CC reservado para relaciones, recorridos, redes y alternativas",
        "rojo #C23B22 usado una sola vez como alarma, fractura o decisión",
        "sin paleta cinematográfica completa ni iluminación fotográfica de color",
    ),
    material=(
        "bordes de tinta irregulares, presión desigual y grano físico de papel",
        "detalle multiescala: silueta clara en móvil y descubrimientos al mirar de cerca",
        "negros sólidos combinados con rayado direccional, no sombreado aerografiado",
    ),
    overlay_space=(
        "reservar al menos una región de bajo detalle entre 8% y 58% de altura para gráficos editoriales",
        "mantener el área de subtítulos inferior respirable sin dejar una caja blanca artificial",
        "no colocar el foco narrativo debajo de la firma web ni de los subtítulos",
    ),
    forbidden=(
        "fotografía, fotorrealismo, render 3D o pintura digital suave",
        "estética de póster vectorial limpio, infografía corporativa o collage genérico",
        "texto, letras, números, logotipos, banderas partidarias o marcas dentro de la imagen",
        "rostros reconocibles de dirigentes reales salvo aprobación editorial explícita",
        "violeta o rojo usados como relleno masivo sin función semántica",
        "manos deformes, arquitectura imposible por error o multitudes clonadas",
    ),
    target_aspect_ratio=9.0 / 16.0,
    luma_range=(60.0, 140.0),
    contrast_range=(68.0, 96.0),
    edge_density_range=(0.20, 0.34),
    ink_fraction_range=(0.30, 0.65),
    warm_paper_fraction_range=(0.18, 0.55),
)


_PROFILES = {GRABADO_CIVICO.id: GRABADO_CIVICO}


def available_style_ids() -> tuple[str, ...]:
    return tuple(sorted(_PROFILES))


def get_style(style_id: str = DEFAULT_ILLUSTRATION_STYLE) -> IllustrationStyleProfile:
    try:
        return _PROFILES[style_id]
    except KeyError as exc:
        raise ValueError(
            f"Unknown illustrated style {style_id!r}; choose one of {available_style_ids()}"
        ) from exc


def style_contract(style_id: str = DEFAULT_ILLUSTRATION_STYLE) -> dict[str, object]:
    """Serializable contract included once in every illustration handoff."""
    return asdict(get_style(style_id))


def generation_prompt(
    *, proposition: str, visual_thesis: str, must_show: list[str],
    continuity_in: str, style_id: str = DEFAULT_ILLUSTRATION_STYLE,
) -> str:
    profile = get_style(style_id)
    return " ".join((
        "Crear una ilustración editorial vertical 9:16, sin texto incrustado.",
        f"Estilo obligatorio — {profile.name}: {profile.visual_lineage}.",
        "Composición: " + "; ".join(profile.composition) + ".",
        "Paleta: " + "; ".join(profile.palette) + ".",
        "Material: " + "; ".join(profile.material) + ".",
        "Espacio de intervención: " + "; ".join(profile.overlay_space) + ".",
        f"Proposición narrativa: {proposition}",
        f"Tesis visual: {visual_thesis}",
        "Debe mostrar de forma concreta: " + ", ".join(must_show) + ".",
        f"Continuidad: {continuity_in}",
    ))


def negative_prompt(style_id: str = DEFAULT_ILLUSTRATION_STYLE) -> str:
    profile = get_style(style_id)
    return "Evitar estrictamente: " + "; ".join(profile.forbidden) + "."


def assess_plate_style(
    rgb: np.ndarray, style_id: str = DEFAULT_ILLUSTRATION_STYLE,
) -> tuple[float, dict[str, bool], dict[str, float]]:
    """Measure the print traits shared by the approved reference plates.

    This is deliberately a drift detector, not an aesthetic oracle.  Semantic
    composition, anatomy and narrative meaning still require human review.
    """
    profile = get_style(style_id)
    rgb = np.asarray(rgb, dtype=np.uint8)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    height, width = gray.shape
    aspect = width / max(1, height)
    edge_density = float(np.mean(cv2.Canny(gray, 38, 112) > 0))
    ink_fraction = float(np.mean(gray < 64))
    warm_paper = (
        (rgb[..., 0] > 170) & (rgb[..., 1] > 140) & (rgb[..., 2] > 105)
        & (rgb[..., 0] >= rgb[..., 2])
    )
    warm_paper_fraction = float(np.mean(warm_paper))
    metrics = {
        "aspect_ratio": round(aspect, 5),
        "luma_mean": round(float(gray.mean()), 3),
        "contrast": round(float(gray.std()), 3),
        "edge_density": round(edge_density, 6),
        "ink_fraction": round(ink_fraction, 6),
        "warm_paper_fraction": round(warm_paper_fraction, 6),
    }

    def within(value: float, bounds: tuple[float, float]) -> bool:
        return bounds[0] <= value <= bounds[1]

    checks = {
        "vertical_9_16": abs(aspect - profile.target_aspect_ratio) <= 0.035,
        "engraved_contrast": within(metrics["contrast"], profile.contrast_range),
        "line_density": within(edge_density, profile.edge_density_range),
        "black_ink_dominance": within(ink_fraction, profile.ink_fraction_range),
        "warm_paper_presence": within(warm_paper_fraction, profile.warm_paper_fraction_range),
        "tonal_balance": within(metrics["luma_mean"], profile.luma_range),
    }
    score = sum(checks.values()) / len(checks)
    return round(float(score), 4), checks, metrics
