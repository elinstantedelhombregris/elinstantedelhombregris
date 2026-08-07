"""Reading and cleaning source markdown/text input."""

from __future__ import annotations

import re
from pathlib import Path


def parse_frontmatter(raw: str) -> tuple[dict[str, str], str]:
    if not raw.startswith("---"):
        return {}, raw
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return {}, raw
    meta: dict[str, str] = {}
    for line in parts[1].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip("\"'")
    return meta, parts[2]


def clean_markdown(raw: str) -> str:
    # Editorial appendices are useful in the source document but should never
    # become narration or win an extractive social edit merely because they are
    # at the end of the file.
    raw = re.sub(
        r"^#{1,6}\s+(?:cartograf[ií]a|references|referencias|fuentes|notas)\b.*\Z",
        " ", raw, flags=re.I | re.M | re.S,
    )
    raw = re.sub(r"```.*?```", " ", raw, flags=re.S)
    raw = re.sub(r"^(import|export)\s+.*$", " ", raw, flags=re.M)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", raw)
    raw = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", raw)
    # The first H1 is already used as the title by `read_source`; remaining
    # Markdown headings organize the essay but are not spoken sentences.
    raw = re.sub(r"^#{1,6}\s+.*$", " ", raw, flags=re.M)
    raw = re.sub(r"[*_>`~|]", " ", raw)
    raw = re.sub(r"\s+", " ", raw)
    return raw.strip()


def read_source(path: Path, title_override: str | None) -> tuple[str, str]:
    raw = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    heading = re.search(r"^#\s+(.+)$", body, flags=re.M)
    title = title_override or meta.get("title") or (heading.group(1).strip() if heading else path.stem)
    if heading:
        body = body[:heading.start()] + body[heading.end():]
    return title, clean_markdown(body)
