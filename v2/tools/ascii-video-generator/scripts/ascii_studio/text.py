"""Text normalisation helpers shared across the studio."""

from __future__ import annotations

import re
import unicodedata


def strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def normalized_words(value: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", strip_accents(value).lower())


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", strip_accents(value).lower()).strip("-")
    return slug or "cinematic-ascii-video"


# --- Spanish function-word / clause-boundary helpers -----------------------
#
# Shared by storyboard.build.split_units and speech.captions caption
# segmentation, so both layers agree on what counts as a "dangling" word a
# caption/unit must not end on, and on where a clause naturally continues.

FUNCTION_WORDS = {
    # articles / contractions
    "el", "la", "los", "las", "lo", "un", "una", "unos", "unas", "al", "del",
    # prepositions
    "a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante",
    "en", "entre", "hacia", "hasta", "mediante", "para", "por", "segun",
    "sin", "so", "sobre", "tras", "versus", "via",
    # coordinating / subordinating conjunctions
    "y", "e", "o", "u", "ni", "pero", "mas", "sino", "que", "porque",
    "aunque", "como", "cuando", "mientras", "si", "pues", "entonces", "luego",
    "no",
    # unstressed pronouns / possessive determiners
    "su", "sus", "tu", "tus", "mi", "mis", "se", "le", "les", "me", "te",
    "nos", "os",
}

# Words that naturally open a new clause -- good places to START a caption,
# never to end one.
CLAUSE_CONJUNCTIONS = {
    "pero", "porque", "aunque", "cuando", "mientras", "entonces", "sino",
    "si", "pues", "y", "o", "como", "que", "luego",
}


def word_core(word: str) -> str:
    """The bare alphanumeric core of a token, punctuation/accents stripped."""
    matches = re.findall(r"[a-z0-9]+", strip_accents(word).lower())
    return matches[0] if matches else ""


def _accented_core(word: str) -> str:
    """Like `word_core`, but keeps accents -- for the handful of Spanish
    pairs where the accent changes the part of speech (see `is_function_word`).
    """
    matches = re.findall(r"[a-zà-ÿ0-9]+", word.lower())
    return matches[0] if matches else ""


def is_function_word(word: str) -> bool:
    # "sí" (yes / reflexive pronoun, a content word) must not be treated as
    # its unaccented look-alike "si" (if, a subordinating conjunction) --
    # `word_core`'s accent-stripping alone would flag a perfectly natural
    # caption ending like "...lo mejor de sí,".
    if _accented_core(word) == "sí":
        return False
    core = word_core(word)
    return bool(core) and core in FUNCTION_WORDS


def ends_sentence(word: str) -> bool:
    return word.rstrip("\"'”»)]").endswith((".", "!", "?"))


def ends_clause(word: str) -> bool:
    return word.rstrip("\"'”»)]").endswith((",", ";", ":"))


def starts_clause_conjunction(word: str) -> bool:
    return word_core(word) in CLAUSE_CONJUNCTIONS
