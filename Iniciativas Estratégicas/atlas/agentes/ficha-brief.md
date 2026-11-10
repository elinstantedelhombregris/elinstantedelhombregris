# Encargo: la ficha de un PLAN para el atlas del corpus

You are filling ONE record ("ficha") for ONE document of a 28-document Spanish policy corpus.
Your prompt tells you which document (`CODE`). Everything else you need is here.

Paths below are relative to the repository root; run commands from there.

## Goal

The corpus is the **¡BASTA!** framework: 27 thematic "PLANes" plus PLANRUTA (the bootstrap protocol),
about 1.1 million words describing an idealized design for Argentina. They live in
`Iniciativas Estratégicas/<CODE>_Argentina_ES.md`.

Editors keep breaking harmony between documents: plan A is edited and plan B still quotes the old
number, the old name of an agency, or a mechanism that no longer exists. We are building an **atlas**
(a graph) so an editor can see, before touching anything, what a PLAN is about, which named things it
owns, which it borrows from other PLANes, and which numbers it commits to.

Your ficha is the semantic layer of that graph. A script will take every `alias` you write and search
it literally across all 28 documents to draw the edges "this concept, owned by PLAN X, is used in
PLAN Y at these lines". So **precision beats coverage**: a wrong alias draws hundreds of false edges;
a fabricated quote is deleted by a validator and wastes the slot.

## Output — exactly one file

`Iniciativas Estratégicas/atlas/fichas/<CODE>.json`

All prose values in **Spanish**, plain and descriptive (no praise, no critique, no "este ambicioso plan").
Write ¡BASTA! always with both marks.

```json
{
  "code": "PLANTER",
  "nombre": "Plan Nacional de Tierra, Subsuelo, Pueblos Originarios y Soberanía Territorial",
  "version": "1.0 — Abril 2026",
  "tesis": "≤45 palabras. La apuesta central en una oración: qué cambia y por qué mecanismo.",
  "problema": "≤70 palabras. Qué falla hoy, según el documento.",
  "resumen": "≤120 palabras. Qué propone, en llano, para alguien que no lo leyó.",
  "horizonte": "≤40 palabras. Fases y plazos.",
  "financiamiento": "≤45 palabras. De dónde sale la plata y cuánto, si lo dice.",
  "temas": ["2 a 5 etiquetas del vocabulario cerrado de abajo"],

  "conceptos": [
    {
      "nombre": "Fondo Soberano Ciudadano",
      "alias": ["Fondo Soberano Ciudadano", "FSC"],
      "tipo": "fondo",
      "que_es": "≤40 palabras. Qué es y qué hace.",
      "seccion": "3.3",
      "linea": 349,
      "cita": "Fondo Soberano Ciudadano (FSC) y Dividendo Ciudadano Mensual (DCM)"
    }
  ],
  "usa": [
    {
      "nombre": "Infraestructura Digital Soberana",
      "alias": ["IDS"],
      "origen": "PLANDIG",
      "para_que": "≤30 palabras. Para qué lo necesita este PLAN.",
      "linea": 645,
      "cita": "IDS provee monitoreo satelital soberano"
    }
  ],
  "cifras": [
    {
      "concepto": "Dividendo Ciudadano Mensual por adulto",
      "valor": "USD 70–180 por año",
      "tipo": "parametro",
      "linea": 489,
      "cita": "texto literal de esa línea que CONTIENE el número"
    }
  ],
  "acoples": [
    { "con": "PLANMON", "que": "≤35 palabras. El punto de contacto sustantivo: qué se pasan.", "linea": 640, "cita": "…" }
  ],
  "tensiones": [
    { "con": "PLANEN", "que": "≤45 palabras. Qué choca con qué.", "linea": 0, "cita": "…" }
  ],
  "sin_resolver": [
    { "que": "≤35 palabras. Algo que el propio documento declara no saber o dejar abierto.", "linea": 0, "cita": "…" }
  ]
}
```

### What goes in each list

| Lista | Cuántos | Qué entra |
|---|---|---|
| `conceptos` | 8–22 | Named things **this PLAN creates, defines or owns**: agencies and bodies (`institucion`), funds (`fondo`), devices/instruments/protocols (`mecanismo`), named programmes (`programa`), named roles of people such as «Granaderos» or «Dendritas» (`figura`), laws/regimes it enacts (`norma`), named indicators or dashboards (`metrica`), coined vocabulary (`termino`). Anchor each at the line where it is **defined or first introduced**, not at a passing mention. `seccion` is the section number as written in the heading ("3.3", "12", "Anexo B") or `null`. |
| `usa` | 3–14 | Named things **owned by another PLAN** that this one relies on. `origen` is the owner PLAN code. If the document does not make the owner clear, leave the item out. |
| `cifras` | 6–16 | The numbers another PLAN could quote or contradict: total budget, annual cost, funding sources and percentages, headline targets, legal floors/ceilings, key parameters, deadlines. `tipo`: `presupuesto` · `meta` · `plazo` · `fuente` · `parametro` · `diagnostico`. Prefer the document's own commitments over diagnostic statistics (at most 3 `diagnostico`). `valor` as written, with unit and range. |
| `acoples` | 4–14 | Substantive couplings with **other** PLANes: one per PLAN, the most load-bearing ones. Say what actually flows (money, data, legal authority, people, infrastructure). |
| `tensiones` | 0–6 | Conflicts or fragile points **the text itself evidences**: it contradicts itself, cites a PLAN code that is not in the registry, says "22 PLANes" where the canon is 27, declares a dependency on something another PLAN defers, admits a clash with another PLAN. `con` is a PLAN code or `"interno"`. Only with a literal quote. An empty list is a fine answer; do not manufacture tensions. |
| `sin_resolver` | 0–5 | Open questions the document itself declares (look for «Lo que no sabemos», «queda abierto», «pendiente»). |

Closed vocabulary for `temas`:
`territorio-ambiente` `agua-energia` `vivienda-ciudad` `movilidad` `salud` `cuidado-ciclo-de-vida`
`educacion-conocimiento` `cultura-memoria` `digital-datos` `trabajo-produccion` `moneda-finanzas`
`fiscal-presupuesto` `justicia-seguridad` `estado-instituciones` `soberania-exterior`
`democracia-participacion` `palabra-publica` `poblacion-migracion` `transicion-implementacion`

The 28 valid PLAN codes (anything else is not a PLAN):
PLAN24CN PLANAGUA PLANARCO PLANCUIDADO PLANCUL PLANDIG PLANEB PLANEDU PLANEN PLANFOCO PLANGEO PLANISV
PLANJUS PLANMEMORIA PLANMESA PLANMON PLANMOV PLANPACTO PLANPREGUNTA PLANPUERTA PLANREP PLANRUTA
PLANSAL PLANSEG PLANSUS PLANTALLER PLANTER PLANVIV

## How to read the document

1. `grep -nE '^#{1,3} ' "<file>"` to get the outline with line numbers. Keep it; it is your map.
2. Use the Read tool with `offset`/`limit`. Lines are whole paragraphs, so read in chunks of
   **about 250–400 lines**; a bigger chunk gets truncated.
3. If the file has **fewer than 2,600 lines, read all of it.** If it has more, read in full: the
   opening through the end of the «TESIS CENTRAL»/preamble; every section that defines the solution,
   its devices, its agency or governance, its economic model/budget, its roadmap, its risks, «Lo que
   no sabemos», and «INTEGRACIÓN CON EL MARCO ¡BASTA!»; and at least the first 30 lines of every
   other `## ` section. Never describe a section you did not open.
4. Use `grep -n` to find where a sigla is first defined before anchoring it.

## Decisions already made — do not revisit

- **Every item carries `linea` and `cita`.** `linea` is the 1-based line number in the file (the number
  the Read tool prints). `cita` is a **verbatim substring of that single line**: 12–200 characters,
  copied exactly, including `**`, backticks, accents and punctuation. No ellipsis, no paraphrase, no
  joining two lines, no trimming words from the middle. Pick a short distinctive run of the line.
- **`alias` are literal search strings**, case-sensitive, and each must appear verbatim in this document.
  Give the sigla (≥3 capitals: `ANTSPO`, `FSC`) and/or the full coined name (`Licencia Territorial`).
  Never a generic word that occurs in ordinary prose: not `Fondo`, `Agencia`, `Mesa`, `Pacto`, `Red`,
  `Consejo`, `Tablero`, `Dividendo`, `Sistema`. `Mesa de la Palabra` is fine; `Mesa` is not. A coined
  single word is fine when it is unmistakable (`Bastardas`, `Dendritas`, `Granaderos`).
- **Owned vs borrowed is the point of the exercise.** If this document only mentions something another
  PLAN created, it goes in `usa`, never in `conceptos`.
- Existing state bodies (BCRA, ANSES, INTA, CONICET, AFIP…) are **not** concepts unless the PLAN
  redesigns them into something it names.
- The block of `>` quoted lines at the very top of each file is audit apparatus (tranche, gates, review
  stamps). It is not the plan's content. Take `version` from the document's own title page. Do not
  anchor concepts there. You may anchor a `cifras` or `tensiones` item there if that is where it lives.
- Report numbers as the document writes them. Do not convert currencies, annualize, or sum.
- You are describing an idealized design. Do not assess feasibility; do not editorialize.

## Scope

IN: writing the one JSON file. OUT: every other file.
**DO NOT edit any PLAN document or any file outside `atlas/fichas/`.** If you find an error in the
document, report it in your return message; do not fix it.

## Acceptance — this is checked by machine

```bash
node "Iniciativas Estratégicas/atlas/validar-ficha.mjs" <CODE>
```

It must print `✓ <CODE>`. It verifies every quote against its line, every alias against the document,
every code against the registry, list sizes and word limits. Run it, fix what it reports (it tells
you the real line of a misplaced quote), and repeat until it passes. If after four rounds an item
still fails, **delete that item** rather than bend the quote. Do not edit the validator.

## Return (≤150 words, nothing else)

1. The validator's final line.
2. Which sections you did NOT read (line ranges), if any.
3. Up to 5 bullets of real defects you noticed in the document and did not touch, each with a line
   number: PLAN codes that do not exist, stale counts («22 PLANes», «18 mandatos»), a number that
   contradicts another number, a reference to a section that does not exist. If none, say «ninguno».

STOP and report instead of guessing if: the file does not exist, the validator crashes (stack trace
rather than a list of errors), or the document is not a PLAN (no thesis, no proposal).
