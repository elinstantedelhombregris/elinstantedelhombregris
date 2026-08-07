"""Extractive social edit and hook generation with no network dependency."""

from __future__ import annotations

import re

from .rhetoric import classify_rhetoric, rhetoric_score


_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def sentences(text: str) -> list[str]:
    return [part.strip() for part in _SENTENCE_RE.split(" ".join(text.split())) if part.strip()]


def hook_candidates(title: str, text: str, limit: int = 3) -> list[str]:
    candidates = sentences(text)

    def score(index: int, sentence: str) -> float:
        label = classify_rhetoric(sentence)
        words = len(sentence.split())
        value = rhetoric_score(label)
        value += 0.28 if index < 2 else 0.0
        value += 0.18 if 5 <= words <= 16 else 0.0
        value += 0.12 if any(
            word.casefold() in sentence.casefold() for word in title.split() if len(word) > 4
        ) else 0.0
        value += 0.18 if label == "definition" else 0.0
        # Covers and cold opens must read as complete standalone thoughts.
        value -= 0.62 if re.match(r"^(pero|y|también|además|but|and)\b", sentence, re.I) else 0.0
        value -= 0.64 if re.search(r"\b(entonces|therefore|pues)[,.]?$", sentence, re.I) else 0.0
        value -= 0.8 if words > 28 else 0.0
        value -= 0.25 if words < 5 else 0.0
        return value

    ranked = sorted(
        enumerate(candidates),
        key=lambda item: score(item[0], item[1]),
        reverse=True,
    )
    return [sentence.rstrip(".") for _index, sentence in ranked[:limit]] or [title]


def adapt_for_reel(text: str, title: str, minimum_words: int = 170, maximum_words: int = 240) -> str:
    source = sentences(text)
    if len(text.split()) <= maximum_words:
        return " ".join(source)
    if not source:
        return text.strip()

    title_terms = {
        word.casefold().strip(".,:;!?¿¡()[]\"'") for word in title.split()
        if len(word.strip(".,:;!?¿¡()[]\"'")) >= 5
    }
    best: tuple[float, int, int] | None = None
    total_sentences = len(source)
    # A social adaptation is one focused argument, not a highlight reel of
    # disconnected aphorisms. Search contiguous sentence windows inside the
    # word budget and score each for rhetorical variety, thesis relevance and
    # a clean opening. Contiguity supplies the transitions the author wrote.
    for start in range(total_sentences):
        word_count = 0
        labels: list[str] = []
        relevance = 0
        for end in range(start, total_sentences):
            sentence = source[end]
            word_count += len(sentence.split())
            if word_count > maximum_words:
                break
            label = classify_rhetoric(sentence)
            labels.append(label)
            lowered = sentence.casefold()
            relevance += sum(1 for term in title_terms if term in lowered)
            if word_count < minimum_words:
                continue
            questions = sum(value == "question" for value in labels)
            variety = len(set(labels))
            per_sentence = sum(rhetoric_score(value) for value in labels) / len(labels)
            score = per_sentence
            score += min(1.2, relevance * 0.24)
            score += min(0.6, variety * 0.12)
            score += 0.55 * (1.0 - start / max(1, total_sentences - 1))
            score += 0.22 if labels[0] in {"question", "contrast", "definition"} else 0.0
            opening_words = len(source[start].split())
            score += 0.32 if 2 <= opening_words <= 8 else 0.0
            score -= max(0, questions - 2) * 0.75
            score -= 1.0 if re.match(
                r"^(no exclusivamente|pero también|esto|eso|ello|también|además|y|pero|por eso|de ahí|this|that|also)\b",
                source[start], re.I,
            ) else 0.0
            score -= 0.85 if re.search(r",\s*cuenta\.$", source[start], re.I) else 0.0
            candidate = (score, -start, end)
            if best is None or candidate > (best[0], -best[1], best[2]):
                best = (score, start, end)
    if best is None:
        # Degenerate documents with one enormous sentence: preserve the source
        # order and hard-bound the edit instead of inventing connective copy.
        return " ".join(text.split()[:maximum_words])
    _score, start, end = best
    return " ".join(source[start:end + 1])
