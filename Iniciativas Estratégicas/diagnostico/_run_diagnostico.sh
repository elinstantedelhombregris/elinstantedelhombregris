#!/bin/bash
# Diagnóstico automatizado por PLAN — Etapa R1 del PLAN_REFINAMIENTO_EDITORIAL_2026-04-28
# Uso: ./_run_diagnostico.sh PLANCODE
# Output: DIAGNOSTICO_PLANCODE.md con findings exactos por patrón

set -e
cd "$(dirname "$0")/.."  # Iniciativas Estratégicas/

PLAN="$1"
if [ -z "$PLAN" ]; then echo "Uso: $0 PLANCODE"; exit 1; fi

F="${PLAN}_Argentina_ES.md"
if [ ! -f "$F" ]; then echo "FALTA: $F"; exit 1; fi

OUT="diagnostico/DIAGNOSTICO_${PLAN}.md"

echo "# Diagnóstico de Refinamiento — ${PLAN}" > "$OUT"
echo "" >> "$OUT"
echo "Generado: $(date +%Y-%m-%d)" >> "$OUT"
echo "" >> "$OUT"
echo "Source: \`${F}\`" >> "$OUT"
echo "" >> "$OUT"

# Patrón 1 — Reformas constitucionales sin diferimiento
echo "## Patrón 1 — Reformas constitucionales sin diferimiento" >> "$OUT"
P1=$(grep -n "reforma constitucional\|enmienda constitucional\|constitucionaliz\|personería jurídica de" "$F" 2>/dev/null \
  | grep -v "diferid\|tranche-3\|2040\|anexo\|histórico\|REVISIÓN\|STATUS:" || true)
if [ -z "$P1" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P1" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 2 — Agencias autónomas en tranche-1/2
echo "## Patrón 2 — Agencias autónomas en tranche-1/2" >> "$OUT"
P2=$(grep -n "ente autónomo\|autoridad nacional\|instituto autónomo\|autarquía constitucional\|presupuesto protegido\|directorio independiente nombrado" "$F" 2>/dev/null \
  | grep -v "execution cell\|diferid\|REVISIÓN\|STATUS:\|TABLA_AGENCIAS" || true)
if [ -z "$P2" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P2" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 3 — Future returns como fuente activa
echo "## Patrón 3 — Future returns como fuente activa de tranche-1" >> "$OUT"
P3=$(grep -n "ahorro PLANREP\|reflujo\|renta capturada\|canon AV\|fondo soberano\|retorno futuro" "$F" 2>/dev/null \
  | grep -v "diferid\|tranche-2\|tranche-3\|prohibid\|REVISIÓN\|provee a\|provides_to" || true)
if [ -z "$P3" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P3" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 4 — Capacidades estadio B PLANDIG en tranche-1/2
echo "## Patrón 4 — Capacidades estadio B PLANDIG en tranche-1/2" >> "$OUT"
P4=$(grep -n "ArgenCloud\|SAPI completa\|LANIA\|gemelo digital\|frontier AI\|gobernanza algorítmica\|rieles monetarios\|cloud soberano\|IA generativa\|biometría masiva\|voto digital vinculante" "$F" 2>/dev/null \
  | grep -v "estadio B\|diferid\|tranche-3\|REVISIÓN\|excluid\|sin compromis" || true)
if [ -z "$P4" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P4" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 5 — Verbos operativos en PLAN Rojo (solo MON, SUS, 24CN)
if echo "$PLAN" | grep -qE "PLANMON|PLANSUS|PLAN24CN"; then
  echo "## Patrón 5 — Verbos operativos en PLAN Rojo" >> "$OUT"
  P5=$(grep -n "lanzaremos\|implementaremos\|construiremos\|inauguraremos\|ejecutaremos\|operativizaremos" "$F" 2>/dev/null \
    | grep -v "investigación\|laboratorio\|research\|piloto académico\|REVISIÓN\|no vamos a\|sin compromis" || true)
  if [ -z "$P5" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P5" >> "$OUT"; echo '```' >> "$OUT"; fi
  echo "" >> "$OUT"
fi

# Patrón 6 — Fechas relativas en cronograma
echo "## Patrón 6 — Fechas relativas (Año X) en cronograma" >> "$OUT"
P6=$(grep -nE "Año [0-9]+" "$F" 2>/dev/null \
  | grep -v "REVISIÓN\|anexo\|histórico\|2040\|hace [0-9]+ años\|antes del Año\|al año\|por año" || true)
if [ -z "$P6" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P6" | head -30 >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 7 — Sortición sin justificación
echo "## Patrón 7 — Sortición sin justificación de oversight" >> "$OUT"
P7=$(grep -nE "sortición|sortear|jurado popular|panel ciudadano" "$F" 2>/dev/null \
  | grep -v "control\|veeduría\|consulta\|legitimidad\|oversight\|REVISIÓN\|delitos menores\|junta de" || true)
if [ -z "$P7" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P7" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Patrón 8 — Lenguaje místico/espiritual en plataforma pública (solo si la sección existe)
echo "## Patrón 8 — Lenguaje místico/espiritual en sección de plataforma pública" >> "$OUT"
P8=$(awk '/[Pp]lataforma [Pp]ública|[Vv]oz [Pp]ública|[Cc]omunicación [Pp]ública/,/^## /' "$F" 2>/dev/null \
  | grep -nE "Hombre Gris|sagrado|alma|espíritu de la nación|místico|trascendente" \
  | grep -v "REVISIÓN" || true)
if [ -z "$P8" ]; then echo "(no findings)" >> "$OUT"; else echo '```' >> "$OUT"; echo "$P8" >> "$OUT"; echo '```' >> "$OUT"; fi
echo "" >> "$OUT"

# Total
TOTAL=$(grep -cE "^[0-9]+:" "$OUT" 2>/dev/null || echo 0)
echo "## Total findings: ${TOTAL}" >> "$OUT"

echo "${PLAN}: ${TOTAL} findings → ${OUT}"
