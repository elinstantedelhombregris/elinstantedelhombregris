"""One-time generator for `editorial/data/es_freq.txt`.

Not imported by the studio at runtime -- `concepts.py` only reads the data
file this script produces. Kept in the tree so the table is reproducible and
so the next person who needs to regenerate it (e.g. once more articles exist)
does not have to reverse-engineer the format.

Method
------
1. Walk every ``*.txt`` article under the blog content-txt export
   (``v2/content-txt/blog/*.txt`` in the main site repo -- 22 articles at the
   time this was built), strip YAML frontmatter with
   ``ascii_studio.source.parse_frontmatter`` and markdown syntax with
   ``ascii_studio.source.clean_markdown`` (the same cleaning the render
   pipeline itself applies before any text reaches the storyboard builder),
   then tokenise with ``ascii_studio.text.normalized_words`` (lowercased,
   accents stripped, ``[a-z0-9]+`` runs only -- the same normalisation used
   everywhere else in the studio so lookups agree).
2. Count tokens across the whole corpus with ``collections.Counter``.
3. Merge in `concepts.STOPWORDS` -- the same function-word/quantifier/
   demonstrative/number-word list `concepts.py` itself treats as noise, so
   the background table and the candidate filter agree on what "not a
   concept" means -- at a synthetic count high enough to outrank anything
   the ~35k-word article corpus alone produced. The corpus already puts most
   of these at the top naturally (see ``que``, ``de``, ``la`` in the raw
   counts), but a 22-article corpus is small enough that a handful of common
   words could be under-represented or absent (e.g. a word that happens not
   to occur in these specific 22 essays). The synthetic floor guarantees the
   background table always treats them as noise regardless of corpus luck,
   without changing the ranking of the words that *are* well attested.
4. Keep the top 5000 entries by count, write ``word<TAB>count`` lines sorted
   descending.

Run it (from the skill root) with:
    /opt/anaconda3/bin/python3 -m ascii_studio.editorial.build_freq_table
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[2]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from ascii_studio.editorial.concepts import STOPWORDS as HAND_WRITTEN_FUNCTION_WORDS  # noqa: E402
from ascii_studio.source import clean_markdown, parse_frontmatter  # noqa: E402
from ascii_studio.text import normalized_words  # noqa: E402

ARTICLES_GLOB = Path(
    "/Users/juanb/Desktop/ElInstantedelHombreGris/v2/content-txt/blog"
)
OUTPUT_PATH = Path(__file__).resolve().parent / "data" / "es_freq.txt"
TOP_N = 5000
SYNTHETIC_FLOOR = 5000


def build() -> Counter[str]:
    files = sorted(ARTICLES_GLOB.glob("*.txt"))
    if not files:
        raise SystemExit(f"no articles found under {ARTICLES_GLOB}")
    counts: Counter[str] = Counter()
    for path in files:
        raw = path.read_text(encoding="utf-8")
        _meta, body = parse_frontmatter(raw)
        text = clean_markdown(body)
        counts.update(normalized_words(text))
    for word in HAND_WRITTEN_FUNCTION_WORDS:
        counts[word] = max(counts[word], SYNTHETIC_FLOOR)
    return counts


def write(counts: Counter[str]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"{word}\t{count}" for word, count in counts.most_common(TOP_N)]
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    counts = build()
    write(counts)
    print(f"wrote {min(len(counts), TOP_N)} entries to {OUTPUT_PATH}")
