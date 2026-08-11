#!/usr/bin/env python3
"""Stable public entry point for ASCII Studio.

All implementation lives in ``ascii_studio``.  Keeping this file deliberately
small prevents the desktop app, documentation, and terminal workflow from
silently drifting onto a second renderer.
"""

from __future__ import annotations

import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from ascii_studio.cli import main  # noqa: E402


def legacy_compatible_main(argv: list[str] | None = None) -> int:
    """Keep the historical flag-only command while also accepting subcommands."""
    values = list(sys.argv[1:] if argv is None else argv)
    if not values or values[0] not in {"render", "stills", "bench"}:
        values.insert(0, "render")
    return main(values)


if __name__ == "__main__":
    raise SystemExit(legacy_compatible_main())
