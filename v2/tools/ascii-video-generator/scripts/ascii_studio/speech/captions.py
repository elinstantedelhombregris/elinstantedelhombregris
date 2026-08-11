"""Karaoke caption construction, sync validation and wrapping."""

from __future__ import annotations

import difflib
import re
import textwrap
import unicodedata
from dataclasses import asdict
from pathlib import Path
from typing import Sequence

from ascii_studio.editorial.script import is_number_word, normalize_spoken_numbers
from ascii_studio.storyboard.schema import Caption, Chapter, WordTiming, write_json
from ascii_studio.text import (
    ends_clause, ends_sentence, is_function_word, normalized_words, starts_clause_conjunction, word_core,
)

CAPTION_MAX_CHARS = 29
CAPTION_MAX_LINES = 3
CAPTION_FIRST_PREROLL = 0.08
CAPTION_LAST_HOLD = 0.35

# Caption segmentation targets (DEFECT 2): a caption should read as one
# breath group, not a greedy fill of whatever fits the character budget.
CAPTION_TARGET_MIN_WORDS = 4
CAPTION_TARGET_MAX_WORDS = 9
CAPTION_MIN_WORDS = 3


def caption_text(text: str) -> str:
    """Normalise source prose into the text shared by karaoke captions and the
    voice script (cli.py joins this per-chapter output into `script`, which
    `performance_script` then paces into `voice_script` for the TTS engine).

    Because both the visible captions and the spoken audio descend from this
    same function, any pause we want the *voice* to take has to be encoded
    here as something that (a) reads naturally as caption text and (b) never
    becomes its own karaoke token -- it must attach to an adjacent word
    rather than stand alone, since Edge TTS emits a WordBoundary per
    whitespace-delimited token and a standalone dash/paren would consume a
    karaoke highlight with no real word behind it.

    Em/en dashes and parenthetical asides become commas for exactly this
    reason: a comma is the simplest reliable way to get Edge TTS to breathe,
    it attaches to the preceding word (no orphan token), and it reads as
    ordinary punctuation on screen. Semicolons already get a pause downstream
    (performance_script's clause-boundary newline rule) and ellipses now do
    too -- neither needs to change here.
    """
    result = unicodedata.normalize("NFC", text)
    result = re.sub(r"\([^)]*[\u0370-\u03ff\u1f00-\u1fff\u0590-\u05ff][^)]*\)", "", result)
    result = re.sub(r"(?<=\d)[—–-](?=\d)", " a ", result)
    result = normalize_spoken_numbers(result)
    result = re.sub(r"[\"“”«»]", "", result)
    # Em/en dashes mark a pause between clauses, not a range -- turn them into
    # a comma (attached to the preceding word) so Edge TTS breathes there
    # without adding a standalone dash token to the karaoke layer.
    result = re.sub(r"\s*[—–]\s*", ", ", result)
    # A bare hyphen (bullet marker, awkward line-break leftover) still just
    # becomes a space, as before -- it is not a clause pause.
    result = result.replace("-", " ")
    # Parenthetical asides get the same comma-pause treatment: "word (aside)
    # word" reads and speaks as "word, aside, word" instead of Edge trying to
    # voice the parenthesis marks themselves.
    result = re.sub(r"\s*\(\s*", ", ", result)
    result = re.sub(r"\s*\)\s*", ", ", result)
    # Clean up commas introduced above: collapse doubles, and drop a comma
    # that now sits directly before another punctuation mark or at the very
    # start of the text (both can happen when a dash/paren lands next to
    # existing punctuation, e.g. a quoted aside right before a sentence end).
    result = re.sub(r",\s*,", ",", result)
    result = re.sub(r",\s*([.!?:;])", r"\1", result)
    result = re.sub(r"^\s*,\s*", "", result)
    result = "".join(" " if unicodedata.category(char) in {"So", "Sm"} else char for char in result)
    result = re.sub(r"\s+([,;:.!?])", r"\1", result)
    result = re.sub(r"([,:;!?])(?=\S)", r"\1 ", result)
    return re.sub(r"\s+", " ", result).strip()


def validate_caption_sync(captions: Sequence[Caption], timings: Sequence[WordTiming]) -> None:
    problems: list[str] = []
    for caption in captions:
        visible_count = len(re.findall(r"\S+", caption.text))
        timing_count = len(caption.words)
        if visible_count != timing_count:
            problems.append(
                f"caption {caption.index}: {visible_count} visible tokens, {timing_count} timed words: {caption.text}"
            )
        if caption_wrap_count(caption.text.split()) > CAPTION_MAX_LINES:
            problems.append(f"caption {caption.index}: visible text exceeds {CAPTION_MAX_LINES} lines: {caption.text}")
    used_timing_ids = {id(word) for caption in captions for word in caption.words}
    uncovered = [timing.text for timing in timings if id(timing) not in used_timing_ids and alignment_token(timing.text)]
    if uncovered:
        problems.append(f"semantic WordBoundary events are missing from karaoke captions: {uncovered[:12]}")
    if problems:
        sample = "\n".join(problems[:12])
        raise RuntimeError(f"Caption sync QA failed before render:\n{sample}")


def alignment_token(value: str) -> str:
    return "".join(normalized_words(value))


def caption_wrap_count(words: Sequence[str], max_chars: int = CAPTION_MAX_CHARS) -> int:
    text = " ".join(words)
    return len(textwrap.wrap(text, width=max_chars, break_long_words=False, break_on_hyphens=False) or [""])


def _clause_segments(words: Sequence[str]) -> list[list[str]]:
    """Split a unit's words at every sentence-end / clause-punctuation word.

    This is the strongest, cheapest signal for "a caption should end here":
    commas, colons, semicolons and sentence enders already mark where a
    speaker would breathe. Everything downstream (`_split_long_segment`,
    the merge-forward pass in `split_visible_caption_words`) only has to
    decide how to *combine* or *further break* these segments to hit the
    target caption size -- it never has to invent a clause boundary.
    """
    segments: list[list[str]] = []
    current: list[str] = []
    for word in words:
        current.append(word)
        if ends_sentence(word) or ends_clause(word):
            segments.append(current)
            current = []
    if current:
        segments.append(current)
    return segments


def _splits_number_phrase(words: Sequence[str], i: int) -> bool:
    """True if ending a chunk right after word `i` would tear a spoken-out
    Spanish number in half (e.g. "...doscientos noventa" / "y ocho mil...").

    `normalize_spoken_numbers` expands a single digit token into several
    words with no punctuation between them, so the only signal left by the
    time captions are segmented is the number vocabulary itself.
    """
    if not is_number_word(words[i]):
        return False
    if i + 1 >= len(words):
        return False
    nxt = word_core(words[i + 1])
    if nxt in {"y", "e"} and i + 2 < len(words):
        return is_number_word(words[i + 2])
    return is_number_word(words[i + 1])


def _split_long_segment(
    segment: Sequence[str], max_chars: int, max_lines: int
) -> list[list[str]]:
    """Break a single (punctuation-bounded) clause that is still too big.

    Preference order, per word: a clause-starting conjunction (break just
    before it) beats a plain word-count cut; either way we refuse to end on
    a function word, or in the middle of a spoken-out number, unless there
    is truly no alternative in reach.
    """
    words = list(segment)
    n = len(words)
    chunks: list[list[str]] = []
    start = 0
    while start < n:
        limit = start
        for end in range(start, n):
            if caption_wrap_count(words[start:end + 1], max_chars) > max_lines:
                break
            limit = end
        if limit == start and caption_wrap_count(words[start:start + 1], max_chars) > max_lines:
            # A single word already overflows the box (pathological input) --
            # take it anyway rather than looping forever.
            limit = start
        remaining = n - start
        if remaining <= CAPTION_TARGET_MAX_WORDS and limit == n - 1:
            chunks.append(words[start:n])
            break
        soft_max = min(limit, start + CAPTION_TARGET_MAX_WORDS - 1)
        min_index = min(soft_max, start + CAPTION_MIN_WORDS - 1)
        target = start + (CAPTION_TARGET_MIN_WORDS + CAPTION_TARGET_MAX_WORDS) // 2 - 1

        def _search(hi: int) -> int | None:
            best: int | None = None
            best_key: tuple[int, int] | None = None
            for i in range(min_index, hi + 1):
                if is_function_word(words[i]) or _splits_number_phrase(words, i):
                    continue
                quality = 0 if (i + 1 < n and starts_clause_conjunction(words[i + 1])) else 1
                key = (quality, abs(i - target))
                if best_key is None or key < best_key:
                    best_key, best = key, i
            return best

        best = _search(soft_max)
        if best is None:
            # Nothing valid in the target window -- widen up to the hard
            # char/line limit before accepting a bad (function-word or
            # mid-number) cut as a last resort.
            best = _search(limit)
        if best is None:
            best = soft_max
        chunks.append(words[start:best + 1])
        start = best + 1
    return chunks


def split_visible_caption_words(
    words: Sequence[str],
    max_chars: int = CAPTION_MAX_CHARS,
    max_lines: int = CAPTION_MAX_LINES,
) -> list[list[str]]:
    """Group a unit's words into on-screen captions.

    Clause-aware (DEFECT 2): breaks preferentially at commas/colons/
    semicolons/sentence ends, then at clause-starting conjunctions, only
    then at a raw word count -- and never leaves a caption ending on a bare
    preposition/article/conjunction/other function word if a better cut is
    reachable. Short (<3 word) fragments merge into a neighbour instead of
    standing alone, unless they are the last caption of the unit or are
    themselves a genuinely complete short sentence (e.g. "No fue casualidad.").
    """
    if not words:
        return []
    segments = _clause_segments(words)
    chunks: list[list[str]] = []
    pending: list[str] = []
    for seg_index, segment in enumerate(segments):
        is_last_segment = seg_index == len(segments) - 1
        is_complete_sentence = ends_sentence(segment[-1])
        # Fold any carried-over short fragment onto the *front* of this
        # segment rather than only trying it as a standalone caption: if the
        # combined text still needs splitting, `_split_long_segment` will
        # naturally absorb the short lead-in into its first chunk (a 1-word
        # "Preparación:" heading merges into "Preparación: definí la
        # emoción..." instead of being stranded because the *whole* next
        # segment didn't fit next to it in a single caption).
        segment = pending + segment if pending else segment
        pending = []
        if len(segment) > CAPTION_TARGET_MAX_WORDS or caption_wrap_count(segment, max_chars) > max_lines:
            sub_chunks = _split_long_segment(segment, max_chars, max_lines)
            chunks.extend(sub_chunks[:-1])
            tail = sub_chunks[-1]
            if len(tail) < CAPTION_MIN_WORDS and not is_complete_sentence and not is_last_segment:
                pending = tail
            else:
                chunks.append(tail)
        elif len(segment) < CAPTION_MIN_WORDS and not is_complete_sentence and not is_last_segment:
            pending = segment
        else:
            chunks.append(segment)
    if pending:
        if (
            chunks
            and caption_wrap_count(chunks[-1] + pending, max_chars) <= max_lines
            and len(chunks[-1]) + len(pending) <= CAPTION_TARGET_MAX_WORDS + 2
        ):
            chunks[-1] = chunks[-1] + pending
        else:
            chunks.append(pending)
    return chunks


def write_word_timings(path: Path, timings: Sequence[WordTiming], captions: Sequence[Caption]) -> None:
    write_json(path, {
        "words": [asdict(timing) for timing in timings],
        "captions": [
            {
                "index": caption.index,
                "start": round(caption.start, 3),
                "end": round(caption.end, 3),
                "text": caption.text,
                "section": caption.section,
                "word_count": len(caption.words),
                "wrapped_lines": caption_wrap_count(caption.text.split()),
                "words": [
                    {"start": round(word.start, 3), "end": round(word.end, 3), "text": word.text}
                    for word in caption.words
                ],
            }
            for caption in captions
        ],
    })


def build_precise_captions(chapters: Sequence[Chapter], timings: Sequence[WordTiming]) -> list[Caption]:
    unit_specs = [(chapter.id, caption_text(text)) for chapter in chapters for text in chapter.texts]
    script_words = [word for _section, text in unit_specs for word in re.findall(r"\S+", text)]
    spoken_words = [timing.text for timing in timings]
    matcher = difflib.SequenceMatcher(
        a=[alignment_token(word) for word in script_words],
        b=[alignment_token(word) for word in spoken_words],
        autojunk=False,
    )
    mapping: dict[int, int] = {}
    for block in matcher.get_matching_blocks():
        for offset in range(block.size):
            mapping[block.a + offset] = block.b + offset
    captions: list[Caption] = []
    cursor = 0
    index = 1
    for section, text in unit_specs:
        unit_words = re.findall(r"\S+", text)
        local_cursor = 0
        for visible_words in split_visible_caption_words(unit_words):
            count = len(visible_words)
            left = cursor + local_cursor
            right = left + count
            aligned = [mapping[word_index] for word_index in range(left, right) if word_index in mapping]
            if len(aligned) == count:
                words = [timings[timing_index] for timing_index in aligned] if timings else []
            elif aligned:
                first, last = min(aligned), max(aligned)
                words = list(timings[first:last + 1]) if timings else []
            else:
                first = min(left, max(0, len(timings) - 1))
                last = min(right - 1, max(0, len(timings) - 1))
                words = list(timings[first:last + 1]) if timings else []
            start = words[0].start if words else 0.0
            end = words[-1].end if words else start + 1.0
            captions.append(Caption(index, start, end, " ".join(visible_words), section, words))
            index += 1
            local_cursor += count
        cursor += len(unit_words)
    return captions


def active_caption(captions: Sequence[Caption], t: float) -> Caption | None:
    for index, caption in enumerate(captions):
        start = caption.start - (CAPTION_FIRST_PREROLL if index == 0 else 0.0)
        end = captions[index + 1].start if index + 1 < len(captions) else caption.end + CAPTION_LAST_HOLD
        if start <= t < end:
            return caption
    return None


def active_word_index(caption: Caption, t: float) -> int:
    if not caption.words:
        return 0
    if t <= caption.words[0].start:
        return 0
    for index, word in enumerate(caption.words):
        if word.start <= t <= word.end:
            return index
        if t < word.start:
            return max(0, index - 1)
    return len(caption.words) - 1


def caption_lines(text: str, max_chars: int = CAPTION_MAX_CHARS) -> list[list[str]]:
    wrapped = textwrap.wrap(text, width=max_chars, break_long_words=False, break_on_hyphens=False)
    return [line.split() for line in wrapped[:CAPTION_MAX_LINES]]
