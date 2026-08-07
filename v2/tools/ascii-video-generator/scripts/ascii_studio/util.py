"""Small process and math helpers shared across the studio."""

from __future__ import annotations

import shutil
import subprocess
from typing import Sequence

import numpy as np


def smoothstep(value: float) -> float:
    value = float(np.clip(value, 0.0, 1.0))
    return value * value * (3.0 - 2.0 * value)


def run(cmd: Sequence[str], quiet: bool = False) -> None:
    if not quiet:
        print("+", " ".join(str(part) for part in cmd), flush=True)
    subprocess.run([str(part) for part in cmd], check=True)


def capture(cmd: Sequence[str]) -> str:
    return subprocess.check_output([str(part) for part in cmd], text=True).strip()


def require_binary(name: str) -> None:
    if not shutil.which(name):
        raise RuntimeError(f"Required executable not found: {name}")
