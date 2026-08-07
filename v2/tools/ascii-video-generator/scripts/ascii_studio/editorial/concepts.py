"""Real concept extraction for Spanish article text.

Replaces the raw word-frequency approach in `storyboard.build.extract_keywords`
for anything that gets displayed on screen as a "keyword": a `Counter` over
4+ letter words minus a stoplist surfaces function words and conjugated
verbs as often as it surfaces anything meaningful (`PALABRA`, `PASA`,
`FALTA`, `ESTAS`, `OTRO`, `TRES`, `FOWLER` are real examples it produced).

This module scores *candidate noun phrases* (1-3 content words) instead of
single raw words, using:

- TF-IDF against a background Spanish corpus (`data/es_freq.txt`, ~5000
  words with counts, built from 22 articles on this site plus a hand-written
  function-word list -- see `build_freq_table.py` for exactly how). A term
  frequent in the article but rare in the background corpus scores high; a
  term frequent everywhere (background corpus *and* article) scores low.
- Position weighting: terms in the title, in the first sentence of the text
  being scored, or repeated across sentences far apart in the source score
  higher.
- A generated blocklist of conjugated Spanish verb forms
  (`verb_forms.is_conjugated_verb`), so "PASA"/"FALTA"/"ESTAS" can never be
  selected regardless of frequency.
- A recurrence requirement for capitalized words that look like proper nouns
  (appear capitalized somewhere other than the start of a sentence, or are
  entirely absent from the background corpus): a name mentioned once (e.g. a
  citation -- "Fowler y Christakis demostraron...") is dropped; a name that
  recurs survives.

Public interface
-----------------
`extract_concepts(text, title, limit=8)` -- top concepts for a whole article.
`chapter_concepts(segment, full_text, title, limit=4)` -- top concepts for one
chapter/segment, using `full_text` to judge proper-noun recurrence and
cross-chapter repetition even when the chapter itself only mentions a term
once.
`term_weights(text, limit=40)` -- normalised 0..1 per-word salience, for
driving a visual density field (see that function's docstring for the exact
shape another module should expect).
"""

from __future__ import annotations

import math
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import NamedTuple

from ascii_studio.editorial.script import NUMBER_WORDS
from ascii_studio.editorial.verb_forms import is_conjugated_verb
from ascii_studio.text import FUNCTION_WORDS, word_core

DATA_PATH = Path(__file__).resolve().parent / "data" / "es_freq.txt"

# Quantifiers / demonstratives / adverbs that are not in
# `ascii_studio.text.FUNCTION_WORDS` (that set is scoped narrowly to
# clause-boundary detection for captions) but are still background noise for
# concept extraction -- "OTRO" and "TRES" leaking into on-screen keywords
# were exactly this gap.
EXTRA_STOPWORDS = {
    "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "esos",
    "esas", "aquel", "aquella", "aquello", "aquellos", "aquellas",
    "otro", "otra", "otros", "otras", "algo", "alguien", "alguna",
    "algunas", "algunos", "algun", "cada", "mismo", "misma", "mismos",
    "mismas", "mucho", "mucha", "muchos", "muchas", "poco", "poca", "pocos",
    "pocas", "tanto", "tanta", "tantos", "tantas", "todo", "toda", "todos",
    "todas", "varios", "varias", "cualquier", "cualquiera", "ambos",
    "ambas", "demas", "nada", "nadie", "ninguna", "ninguno", "ningunos",
    "ningunas", "muy", "menos", "tan", "bien", "mal", "aqui", "alli", "ahi",
    "alla", "aca", "ahora", "siempre", "nunca", "jamas", "tampoco",
    "tambien", "asi", "solo", "solamente", "casi", "apenas", "quiza",
    "quizas", "acaso", "recien", "ya", "aun", "todavia", "adentro",
    "afuera", "arriba", "abajo", "dentro", "fuera", "encima", "debajo",
    "antes", "despues", "hoy", "ayer", "pronto", "enseguida", "temprano",
    "vos", "yo", "el", "ella", "ello", "nosotros", "nosotras", "ustedes",
    "ellos", "ellas", "usted", "nuestro", "nuestra", "nuestros",
    "nuestras", "quien", "quienes", "cual", "cuales", "cuanto", "cuanta",
    "cuantos", "cuantas", "donde",
    # generic-noise nouns: legitimate words, but too vague to ever be "the"
    # concept of a sentence, and they crowded out real content in the old
    # frequency counter.
    "vez", "veces", "forma", "formas", "manera", "maneras", "parte",
    "partes", "momento", "momentos", "cosa", "cosas", "punto", "puntos",
    "exclusivamente", "poquito", "enfrente", "hacerlo", "solas", "serie",
    "poner", "modo", "unidad", "segundo", "hora", "tarde", "dia", "situacion",
    "persona", "mirar", "hablar", "pelear",
}

# The skill accepts arbitrary Spanish or English source text.  The original
# corpus and morphology are Spanish-first, so English connective words used to
# leak into otherwise good phrases ("FRICTION AND") and common verbs became the
# concept itself ("MAKES COOPERATION").  Keep this deliberately lexical rather
# than pretending the offline extractor is a full English parser.
ENGLISH_STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "than", "that",
    "this", "these", "those", "who", "whom", "whose", "which", "what",
    "when", "where", "why", "how", "as", "at", "by", "for", "from", "in",
    "into", "of", "on", "onto", "over", "through", "to", "under", "with",
    "without", "about", "against", "between", "during", "before", "after",
    "is", "am", "are", "was", "were", "be", "been", "being", "do", "does",
    "did", "have", "has", "had", "not", "no", "nor", "only", "very",
    "more", "most", "less", "least", "some", "any", "each", "every",
    "all", "both", "either", "neither", "another", "other", "same", "so",
    "such", "too", "also", "just", "yet", "still", "already", "here",
    "there", "now", "always", "never", "often", "sometimes", "i", "me",
    "my", "mine", "we", "us", "our", "ours", "you", "your", "yours",
    "he", "him", "his", "she", "her", "hers", "it", "its", "they",
    "them", "their", "theirs", "can", "could", "may", "might", "must",
    "shall", "should", "will", "would",
}

ENGLISH_VERBS = {
    "appear", "appears", "become", "becomes", "begin", "begins", "build",
    "builds", "built", "change", "changes", "changed", "connect", "connects",
    "connected", "create", "creates", "created", "decide", "decides", "decided",
    "enable", "enables", "enabled", "feel", "feels", "felt", "generate",
    "generates", "generated", "give", "gives", "given", "grow", "grows",
    "grew", "happen", "happens", "help", "helps", "helped", "keep", "keeps",
    "kept", "know", "knows", "known", "lead", "leads", "led", "make",
    "makes", "made", "mean", "means", "meant", "move", "moves", "moved",
    "need", "needs", "needed", "open", "opens", "opened", "produce",
    "produces", "produced", "reduce", "reduces", "reduced", "remain",
    "remains", "remained", "reveal", "reveals", "revealed", "say", "says",
    "said", "see", "sees", "seen", "show", "shows", "shown", "strengthen",
    "strengthens", "strengthened", "transform", "transforms", "transformed",
    "turn", "turns", "turned", "use", "uses", "used", "want", "wants",
    "wanted", "work", "works", "worked",
}

STOPWORDS = FUNCTION_WORDS | NUMBER_WORDS | EXTRA_STOPWORDS | ENGLISH_STOPWORDS

MIN_WORD_LEN = 3
NGRAM_BONUS = {1: 1.0, 2: 1.35, 3: 1.6}
TITLE_BONUS = 1.6
FIRST_SENTENCE_BONUS = 1.3
SPREAD_BONUS = 1.25
REPEAT_BONUS = 1.1
PROPER_NOUN_MIN_MENTIONS = 2

_WORD_RE = re.compile(r"[^\W\d_]+", re.UNICODE)
_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


@lru_cache(maxsize=1)
def _background_freq() -> dict[str, int]:
    """word -> count, loaded from `data/es_freq.txt` (see module docstring
    and `build_freq_table.py` for how that file was produced)."""
    freq: dict[str, int] = {}
    for line in DATA_PATH.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        word, _, count = line.partition("\t")
        freq[word] = int(count)
    return freq


@lru_cache(maxsize=1)
def _background_total() -> int:
    return sum(_background_freq().values())


def _idf(word: str) -> float:
    """Higher for words rare (or absent) in the background corpus."""
    freq = _background_freq()
    total = _background_total()
    count = freq.get(word, 0)
    return math.log(total / (count + 1) + 1)


class _Token(NamedTuple):
    surface: str
    core: str
    sentence_index: int
    is_sentence_first: bool


def _tokenize_sentences(text: str) -> list[str]:
    sentences = [s.strip() for s in _SENTENCE_SPLIT_RE.split(text) if s.strip()]
    return sentences or ([text.strip()] if text.strip() else [])


def _tokens(text: str) -> list[_Token]:
    tokens: list[_Token] = []
    for sentence_index, sentence in enumerate(_tokenize_sentences(text)):
        first = True
        for match in _WORD_RE.finditer(sentence):
            surface = match.group(0)
            core = word_core(surface)
            if core:
                tokens.append(_Token(surface, core, sentence_index, first))
                first = False
    return tokens


def _is_content(core: str) -> bool:
    return (
        len(core) >= MIN_WORD_LEN
        and core not in STOPWORDS
        and not core.isdigit()
        and not is_conjugated_verb(core)
        and core not in ENGLISH_VERBS
        and not (len(core) > 5 and core.endswith(("ing", "ed")))
    )


class _Candidate:
    __slots__ = ("cores", "surfaces", "count", "sentence_indices", "first_sentence_hit")

    def __init__(self, cores: tuple[str, ...]):
        self.cores = cores
        self.surfaces: Counter[str] = Counter()
        self.count = 0
        self.sentence_indices: set[int] = set()
        self.first_sentence_hit = False

    def add(self, surface_words: tuple[str, ...], sentence_index: int, is_first_sentence: bool) -> None:
        self.surfaces[" ".join(surface_words)] += 1
        self.count += 1
        self.sentence_indices.add(sentence_index)
        if is_first_sentence:
            self.first_sentence_hit = True

    def display(self) -> str:
        surface = self.surfaces.most_common(1)[0][0]
        return surface.upper()


def _proper_noun_signal(text: str) -> Counter[str]:
    """core -> count of occurrences that look like a proper noun: capitalized
    and either not the first word of their sentence, or capitalized every
    single time it occurs (so it never shows up as an ordinary lowercase
    word elsewhere)."""
    tokens = _tokens(text)
    by_core: dict[str, list[_Token]] = {}
    for token in tokens:
        by_core.setdefault(token.core, []).append(token)
    signal: Counter[str] = Counter()
    for core, occurrences in by_core.items():
        capitalized = [t for t in occurrences if t.surface[:1].isupper()]
        if not capitalized:
            continue
        mid_sentence_capitalized = any(not t.is_sentence_first for t in capitalized)
        always_capitalized = len(capitalized) == len(occurrences)
        if mid_sentence_capitalized or always_capitalized:
            signal[core] = len(occurrences)
    return signal


def _rejected_proper_nouns(text: str, title: str = "") -> set[str]:
    signal = _proper_noun_signal(text)
    title_words = {token.core for token in _tokens(title)}
    return {
        core for core, count in signal.items()
        if count < PROPER_NOUN_MIN_MENTIONS and core not in title_words
    }


def _build_candidates(text: str, reject: set[str]) -> dict[tuple[str, ...], _Candidate]:
    candidates: dict[tuple[str, ...], _Candidate] = {}
    for sentence_index, sentence in enumerate(_tokenize_sentences(text)):
        run: list[_Token] = []

        def flush(run: list[_Token]) -> None:
            n = len(run)
            for size in (1, 2, 3):
                if size > n:
                    break
                for start in range(0, n - size + 1):
                    window = run[start:start + size]
                    cores = tuple(t.core for t in window)
                    if any(core in reject for core in cores):
                        continue
                    key = cores
                    candidate = candidates.setdefault(key, _Candidate(cores))
                    candidate.add(
                        tuple(t.surface for t in window),
                        sentence_index,
                        window[0].is_sentence_first,
                    )

        first = True
        for match in _WORD_RE.finditer(sentence):
            surface = match.group(0)
            core = word_core(surface)
            if core and _is_content(core):
                run.append(_Token(surface, core, sentence_index, first))
            else:
                flush(run)
                run = []
            first = False
        flush(run)
    return candidates


def _title_cores(title: str) -> set[str]:
    return {t.core for t in _tokens(title) if _is_content(t.core)}


def _score(
    candidate: _Candidate,
    total_content_tokens: int,
    total_sentences: int,
    title_cores: set[str],
    recurs_outside: bool,
) -> float:
    n = len(candidate.cores)
    tf = candidate.count / max(1, total_content_tokens)
    idf_value = sum(_idf(core) for core in candidate.cores) / n
    score = tf * idf_value * NGRAM_BONUS.get(n, NGRAM_BONUS[3])

    if title_cores and title_cores.intersection(candidate.cores):
        score *= TITLE_BONUS
    if candidate.first_sentence_hit:
        score *= FIRST_SENTENCE_BONUS
    if len(candidate.sentence_indices) >= 2:
        span = max(candidate.sentence_indices) - min(candidate.sentence_indices)
        if total_sentences >= 4 and span >= max(2, total_sentences // 3):
            score *= SPREAD_BONUS
        else:
            score *= REPEAT_BONUS
    if recurs_outside:
        score *= REPEAT_BONUS
    return score


def _rank(
    text: str,
    title: str,
    limit: int,
    reject: set[str],
    recurring_cores: set[str] | None = None,
) -> list[str]:
    candidates = _build_candidates(text, reject)
    if not candidates:
        return []
    total_content_tokens = sum(1 for t in _tokens(text) if _is_content(t.core))
    total_sentences = len(_tokenize_sentences(text))
    title_cores = _title_cores(title)

    scored: list[tuple[float, tuple[str, ...], _Candidate]] = []
    for cores, candidate in candidates.items():
        recurs_outside = bool(recurring_cores) and any(c in recurring_cores for c in cores)
        score = _score(candidate, total_content_tokens, total_sentences, title_cores, recurs_outside)
        scored.append((score, cores, candidate))
    scored.sort(key=lambda item: item[0], reverse=True)

    selected: list[str] = []
    used_cores: set[str] = set()
    # Near-duplicate suppression for singular/plural pairs of the *same*
    # word ("servidor" / "servidores", "parametro" / "parametros"): once one
    # form of a word has been selected, its plural or singular counterpart
    # is redundant and should not also take a slot. Deliberately narrow --
    # this only fires when the *other* form was actually selected, so it
    # never mangles an invariable word like "crisis" or "lunes" that merely
    # happens to end in "s".
    blocked_variants: set[str] = set()
    for score, cores, candidate in scored:
        if score <= 0:
            continue
        if all(core in used_cores for core in cores):
            continue
        if len(cores) == 1 and cores[0] in blocked_variants:
            continue
        selected.append(candidate.display())
        used_cores.update(cores)
        if len(cores) == 1:
            blocked_variants.update(_plural_variants(cores[0]))
            singular_guess = _singular_guess(cores[0])
            if singular_guess:
                blocked_variants.add(singular_guess)
        if len(selected) == limit:
            break
    return selected


def _singular_guess(core: str) -> str | None:
    if len(core) >= 5 and core.endswith("es"):
        return core[:-2]
    if len(core) >= 4 and core.endswith("s"):
        return core[:-1]
    return None


def _plural_variants(core: str) -> set[str]:
    return {core + "s", core + "es"}


def extract_concepts(text: str, title: str, limit: int = 8) -> list[str]:
    """Top `limit` display-ready concepts (UPPER CASE, accents preserved) for
    a whole article, ranked by TF-IDF against the background Spanish corpus
    plus title/position weighting. Multi-word noun phrases are preferred
    over single words when both are well attested. Conjugated verbs, function
    words, and proper nouns mentioned only once are never returned.
    """
    reject = _rejected_proper_nouns(text, title)
    return _rank(text, title, limit, reject)


def chapter_concepts(segment: str, full_text: str, title: str, limit: int = 4) -> list[str]:
    """Top `limit` display-ready concepts for one chapter/segment of a larger
    article. Scored the same way as `extract_concepts`, but:

    - a capitalized word is only rejected as an incidental proper noun if it
      fails to recur across the *whole* article (`full_text`), not just this
      segment -- a name introduced in one chapter and referenced again in
      another should survive even though each individual chapter only
      mentions it once;
    - a term that also appears elsewhere in `full_text`, outside this
      segment, gets the same "repeated across distant parts of the text"
      bonus `extract_concepts` gives to terms that repeat within a single
      document.
    """
    reject = _rejected_proper_nouns(full_text, title)
    full_candidates = _build_candidates(full_text, reject)
    segment_candidates = _build_candidates(segment, reject)
    recurring_cores = {
        core
        for cores, candidate in full_candidates.items()
        for core in cores
        if candidate.count >= 2
    }
    # Only count as "recurs outside" if the term shows up outside this
    # segment's own sentences, not merely because it repeats within it.
    outside_only: set[str] = set()
    for cores, candidate in full_candidates.items():
        segment_hit = segment_candidates.get(cores)
        segment_count = segment_hit.count if segment_hit else 0
        if candidate.count > segment_count:
            outside_only.update(cores)
    recurring_cores &= outside_only
    return _rank(segment, title, limit, reject, recurring_cores=recurring_cores)


def term_weights(text: str, limit: int = 40) -> dict[str, float]:
    """Per-word salience for driving a visual effect (background field
    density), NOT for display.

    Shape: a plain `dict[str, float]`, at most `limit` entries, keys are
    single Spanish words normalised exactly like
    `ascii_studio.text.normalized_words` produces them (lowercase, accents
    stripped, `[a-z0-9]+` tokens -- match your text against that function to
    look a word up here). Values are TF-IDF-against-background-corpus scores
    rescaled to the closed interval [0, 1], where 1.0 is the single most
    salient word in `text` and 0.0 would be a word with no salience (no
    entry actually has 0.0 -- the least salient included word is whatever
    scored lowest and survived the `limit` cutoff). Iteration order is
    descending salience (Python dicts preserve insertion order), but callers
    should not rely on that -- use the float value.

    Only single words are scored (not phrases): a density field keyed by
    word position/count wants one weight per token, not per noun phrase.
    Function words, conjugated verbs, and single-mention incidental proper
    nouns are excluded exactly as in `extract_concepts`, since a background
    field should not glow on a name that got cited once and never again.
    """
    reject = _rejected_proper_nouns(text)
    tokens = [t for t in _tokens(text) if _is_content(t.core) and t.core not in reject]
    if not tokens:
        return {}
    total = len(tokens)
    counts = Counter(t.core for t in tokens)
    raw_scores = {core: (count / total) * _idf(core) for core, count in counts.items()}
    top = sorted(raw_scores.items(), key=lambda item: item[1], reverse=True)[:limit]
    if not top:
        return {}
    max_score = top[0][1] or 1.0
    return {core: round(score / max_score, 4) for core, score in top}
