"""Voice performance pacing and Spanish spoken-number normalisation."""

from __future__ import annotations

import re
import unicodedata

from ascii_studio.text import word_core

# Every word `spanish_integer` can produce, unaccented/lowercased so it can be
# compared against `word_core(...)`. Used by caption segmentation to avoid
# ever breaking a caption in the middle of a spoken-out number -- e.g.
# "doscientos noventa" / "y ocho mil" reads as a torn number, not a pause.
NUMBER_WORDS = frozenset({
    "cero", "uno", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete",
    "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciseis", "diecisiete", "dieciocho", "diecinueve", "veinte",
    "veintiuno", "veintiuna", "veintidos", "veintitres", "veinticuatro",
    "veinticinco", "veintiseis", "veintisiete", "veintiocho", "veintinueve",
    "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta",
    "noventa", "cien", "ciento", "doscientos", "doscientas", "trescientos",
    "trescientas", "cuatrocientos", "cuatrocientas", "quinientos",
    "quinientas", "seiscientos", "seiscientas", "setecientos", "setecientas",
    "ochocientos", "ochocientas", "novecientos", "novecientas", "mil",
    "millon", "millones", "menos",
})


def is_number_word(word: str) -> bool:
    return word_core(word) in NUMBER_WORDS


def performance_script(text: str, mode: str) -> str:
    if mode == "flat":
        return text
    result = unicodedata.normalize("NFC", text)
    result = re.sub(r"\s+([,;:.!?])", r"\1", result)
    result = re.sub(r"\s+", " ", result).strip()
    # Sentence enders get a pacing break; "…" reads as a hanging-thought
    # pause just like ".", "!" or "?" so it earns the same treatment.
    result = re.sub(r"([.!?…])\s+", r"\1\n", result)
    result = re.sub(r"([:;])\s+", r"\1\n", result)
    result = re.sub(
        r",\s+(pero|porque|aunque|cuando|mientras|entonces|sino|si|no)\b",
        lambda match: ",\n" + match.group(1),
        result,
        flags=re.I,
    )
    if mode == "dramatic":
        result = re.sub(
            r"\b(Pero|No|Porque|Ahora|Entonces|Cuando|Mientras|Hay|Cada|Pensar|Cambiar|Crear)\b",
            r"\n\1",
            result,
        )
        result = re.sub(r"([.!?…])\n", r"\1\n\n", result)
    return re.sub(r"\n{3,}", "\n\n", result).strip()


def spanish_integer(value: int, feminine: bool = False) -> str:
    units = (
        "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
        "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
        "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés",
        "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
    )
    tens = ("", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa")
    hundreds = (
        ("", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"),
        ("", "ciento", "doscientas", "trescientas", "cuatrocientas", "quinientas", "seiscientas", "setecientas", "ochocientas", "novecientas"),
    )
    if value < 0:
        return "menos " + spanish_integer(-value, feminine)
    if value < 30:
        if feminine and value in (1, 21):
            return "una" if value == 1 else "veintiuna"
        return units[value]
    if value < 100:
        ten, unit = divmod(value, 10)
        return tens[ten] if unit == 0 else f"{tens[ten]} y {spanish_integer(unit, feminine)}"
    if value == 100:
        return "cien"
    if value < 1000:
        hundred, rest = divmod(value, 100)
        stem = hundreds[1 if feminine else 0][hundred]
        return stem if rest == 0 else f"{stem} {spanish_integer(rest, feminine)}"
    if value < 1_000_000:
        thousands, rest = divmod(value, 1000)
        prefix = "mil" if thousands == 1 else f"{spanish_integer(thousands, feminine)} mil"
        return prefix if rest == 0 else f"{prefix} {spanish_integer(rest, feminine)}"
    millions, rest = divmod(value, 1_000_000)
    prefix = "un millón" if millions == 1 else f"{spanish_integer(millions)} millones"
    return prefix if rest == 0 else f"{prefix} {spanish_integer(rest, feminine)}"


def normalize_spoken_numbers(text: str) -> str:
    text = re.sub(
        r"\b\d{1,3}(?:\.\d{3})+\b",
        lambda match: match.group(0).replace(".", ""),
        text,
    )
    feminine_nouns = (
        "personas", "habilidades", "cosas", "decisiones", "generaciones", "empresas",
        "semanas", "acciones", "instituciones", "fuentes", "capas", "reglas", "preguntas",
    )
    feminine_pattern = "|".join(feminine_nouns)
    result = re.sub(
        rf"(?<![\w.])(\d+)(?!\.\d)(?=\s+(?:{feminine_pattern})\b)",
        lambda match: spanish_integer(int(match.group(1)), feminine=True),
        text,
        flags=re.I,
    )
    result = re.sub(
        r"(?<!\w)(\d+)\s*%",
        lambda match: f"{spanish_integer(int(match.group(1)))} por ciento",
        result,
    )
    return re.sub(
        r"(?<![\w.])\d+(?!\.\d)(?!\w)",
        lambda match: spanish_integer(int(match.group(0))),
        result,
    )
