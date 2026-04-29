#!/usr/bin/env python3
"""
Body cleanup para PLANes con MARCO TEMPORAL CANÓNICO.
Reemplaza "Año N" en cuerpo del documento con ventana absoluta + tranche label.
Conservador: respeta líneas que ya tienen REVISIÓN, MARCO TEMPORAL, o anexo histórico.
"""
import re
import sys
import os

# year_base por PLAN
YEAR_BASE = {
    "PLANVIV": 2026,
    "PLANISV": 2026,
    "PLANSUS": 2026,
    "PLANEDU": 2026,
    "PLANEN": 2028,
    "PLANJUS": 2030,
    "PLANAGUA": 2026,
    "PLANMOV": 2030,
    "PLANDIG": 2026,
}

def tranche_label(yr_offset):
    """Map year offset → tranche label."""
    if yr_offset <= 0:
        return "tranche-1 inicial"
    elif yr_offset <= 2:
        return "tranche-1"
    elif yr_offset == 3:
        return "tranche-2 entrada"
    elif yr_offset <= 5:
        return "tranche-2"
    elif yr_offset == 6:
        return "tranche-3 entrada"
    elif yr_offset <= 9:
        return "tranche-3"
    elif yr_offset <= 14:
        return "tranche-3 maduración"
    else:
        return "Visión 2040+"

def process_plan(code):
    if code not in YEAR_BASE:
        print(f"Unknown plan: {code}")
        return
    base = YEAR_BASE[code]
    f_path = f"{code}_Argentina_ES.md"
    if not os.path.exists(f_path):
        print(f"Missing: {f_path}")
        return

    with open(f_path, "r") as f:
        lines = f.readlines()

    # Skip lines that are inside the MARCO TEMPORAL block or REVISIÓN markers
    out_lines = []
    edits = 0
    in_authority_block = False

    for i, line in enumerate(lines):
        # Detect when we're inside an authority block (MARCO TEMPORAL table)
        if "MARCO TEMPORAL CANÓNICO" in line or "marco editorial" in line:
            in_authority_block = True
        elif "Reglas de tranche aplicadas" in line or "Presupuesto canónico" in line:
            in_authority_block = True  # still authority
        elif in_authority_block and line.strip().startswith("---"):
            in_authority_block = False

        # Skip authority lines, REVISIÓN markers, anexo histórico, hace X años
        if in_authority_block:
            out_lines.append(line)
            continue
        if "REVISIÓN" in line or "REVISION_PROFUNDA" in line:
            out_lines.append(line)
            continue
        if "STATUS:" in line[:30]:
            out_lines.append(line)
            continue
        if re.search(r"hace\s+\d+\s+años", line):
            out_lines.append(line)
            continue
        if "anexo" in line.lower()[:50] and "histórico" in line.lower()[:60]:
            out_lines.append(line)
            continue

        # Replace "Año N" with absolute window + tranche
        def repl(m):
            nonlocal edits
            n_str = m.group(1)
            n = int(n_str)
            if n > 50:  # likely something else (e.g., a count)
                return m.group(0)
            # If n=0, special label
            if n == 0:
                edits += 1
                return f"{base} ({tranche_label(0)})"
            yr = base + n
            edits += 1
            return f"{yr} ({tranche_label(n)})"

        # Match "Año N" but not "Año N-M" range start (handle ranges separately)
        # Also avoid matching things like "Año Internacional" by requiring number
        new_line = re.sub(r"\bAño\s+(\d+)\+", lambda m: f"{base + int(m.group(1))}+ ({tranche_label(int(m.group(1)))})", line)
        new_line = re.sub(r"\bAño\s+(\d+)\b(?!\s*-\d)", repl, new_line)
        # Handle ranges "Año N-M" → "ventana N-M"
        def range_repl(m):
            nonlocal edits
            n1, n2 = int(m.group(1)), int(m.group(2))
            if n1 > 50 or n2 > 50:
                return m.group(0)
            yr1 = base + n1 if n1 > 0 else base
            yr2 = base + n2 if n2 > 0 else base
            edits += 1
            return f"{yr1}-{yr2} ({tranche_label(n2)})"
        new_line = re.sub(r"\bAño\s+(\d+)-(\d+)\b", range_repl, new_line)
        # Handle "Año N–M" with em-dash
        new_line = re.sub(r"\bAño\s+(\d+)–(\d+)\b", range_repl, new_line)

        out_lines.append(new_line)

    with open(f_path, "w") as f:
        f.writelines(out_lines)

    print(f"{code}: {edits} edits applied")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: _body_cleanup.py PLANCODE [PLANCODE ...]")
        sys.exit(1)
    for code in sys.argv[1:]:
        process_plan(code)
