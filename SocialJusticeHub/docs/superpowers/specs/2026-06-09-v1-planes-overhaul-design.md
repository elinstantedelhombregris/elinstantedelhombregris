# Overhaul integral de los 22 PLANes de V1 + El Arquitecto — Diseño

**Fecha:** 2026-06-09
**Alcance:** Solo V1 (`SocialJusticeHub/`). V2 no se toca.
**Objetivo:** Mejorar dramáticamente consistencia, novedad, factibilidad e impacto de los 22 PLANes en sus tres capas: briefs (`shared/strategic-initiatives.ts`), documentos completos (`client/public/docs/PLAN*_Argentina_ES.md`) y la herramienta El Arquitecto (`shared/arquitecto-data.ts`, `shared/validation-engine.ts`, `client/src/components/arquitecto/`).

## Hallazgos de auditoría (resumen)

1. **6 documentos completos faltantes** — PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER, PLANMOV declaran `documentFile` que no existe → 404 en producción.
2. **El Arquitecto muestra datos falsos** — `ECOSYSTEM_METRICS` desactualizado (74 deps vs 142 reales, 27 críticas vs 58, presupuestos erróneos); `V-REF-02` espera 16 planes → ERROR permanente; AdversarialSimulator tiene bug NaN con 22 planes; `simulateFailure` y WhatIfSimulator quedaron sin sentido porque las dependencias inversas (d77–d145) hacen que cualquier falla cascadee a ~todo el ecosistema.
3. **Corpus congelado en eras distintas** — los docs dicen "cinco/ocho/diez/dieciséis mandatos" (nunca 22); 184+ "BASTA" sin signos; 6 docs con metáfora "acero" (canon: plata/argentum); PLANSEG se contradice 6× en su propio presupuesto; numeración de secciones rota en PLANSEG; PLANSAL sin SECCIÓN 1 y con tildes peladas en portada.
4. **Briefs con bugs reales** — slug roto en PLANMON; milestones rotos en PLANCUL; contradicción 180k/420k en PLANMESA; aritmética que no cierra en PLANAGUA y PLANTER; tres planes con metas incompatibles para el mismo Fondo Soberano; PLANJUS con dependencies numéricas y fuente "PISA Judicial" inexistente.

## Diseño de la solución — 4 streams

### Stream A — El Arquitecto: corrección estructural
- `ECOSYSTEM_METRICS` pasa a ser **computado** desde `PLAN_NODES`/`DEPENDENCIES` (no más constantes a mano).
- Nuevo campo `kind: 'requires' | 'provides'` en `Dependency`; d77–d145 se etiquetan `provides`. `simulateFailure`, `getInDegree`, V-RES-01/02/03 y el cascade del WhatIfSimulator recorren **solo** `requires` → las simulaciones vuelven a discriminar.
- `CRITICAL_CHAINS` se expande de 3 a 7 cadenas para cubrir los 22 planes (cadena deliberativa LDEA, cadena de cuidado, cadena territorial, cadena de movilidad); se corrige la descripción corrupta de chain-1.
- `validation-engine.ts`: V-REF-02 usa el conteo real (22); umbrales de V-FIN-05/06, V-TIME-02/03 pasan a ser proporcionales; AMCC se agrega a excepciones de V-TERM-01.
- Componentes: sweep "16 mandatos"→dinámico; fix NaN/histograma 0..22 + nuevos adversarios y coaliciones para los 6 planes nuevos en AdversarialSimulator; horizonte de BudgetFlow unificado (20 años); `maxBudget` computado en PlanDetailDrawer; grid de cadenas no hardcodeado; toggle de aristas inversas en DependencyGraph + filtros de tipo completos; `computeProgress` soporta KPIs de reducción; `mission-registry.ts` suma los 6 planes faltantes.
- Datos por plan: agencyFull completos (ANDIG, ANAGUA, ANVIV, ANEN unificada como "Energía y Transición de Matriz"); "Ley ANSV"→"Ley ENSV"; PLANREP corrige presupuesto (el nodo tenía el costo del problema, no el del plan: pasa a USD 2.200–4.200M según inversiones del doc); timelines alineados a fases de los docs (PLANJUS 15, PLANSAL 15, PLANGEO 15); convención documentada para `timelineYears: -1` y para el esquema de ordinales (orden estratégico de lanzamiento ≠ orden histórico de los docs).

### Stream B — 6 documentos completos nuevos
PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER, PLANMOV reciben documentos completos (~1.500–2.200 líneas) siguiendo la plantilla canónica derivada de los mejores docs (PLANAGUA/PLANJUS/PLANDIG): cartela, preámbulo con voces, tesis central, diagnóstico con tablas, lecciones del mundo, arquitectura, agencia, presupuesto/ROI, marco legal, tablero, integración con los 22, stakeholders, riesgos + respuesta a críticas, comunicación, hoja de ruta, dimensión federal, visión 2040, protocolo de falla. Consistentes con presupuestos/pisos/fases de `arquitecto-data.ts` y resolviendo los gaps detectados (art. 124 CN en PLANTER; reconciliación 420k con fuente metodológica en PLANMESA; rampa presupuestaria explícita en PLANMEMORIA; escenarios 80k/104k en PLANMOV).

### Stream C — Briefs (`strategic-initiatives.ts`)
- Fixes de integridad: slug PLANMON, milestones PLANCUL, pullQuote PLANMESA, dependencies de PLANJUS, fuente "PISA Judicial"→ACIJ/CIPCE, milestones Año 15 en PLANSAL, unidad KPI PLANEB, KPIs vs texto (PLANSUS, PLANMOV, PLANEDU).
- Consistencia cross-brief: conteo de mandatos unificado a 22; reconciliación del Fondo Soberano Ciudadano (PLANMON agrega desglose por fuente que contiene los aportes de PLANEN y PLANTER); de-duplicación del beneficio "reducción de reversiones" entre PLANMESA y PLANMEMORIA (atribución repartida y explícita).
- Profundización de los 8 más flojos (PLAN24CN, PLANJUS, PLANSAL, PLANGEO, PLANAGUA, PLANMESA, PLANTER, PLANMON) según punch-lists: aritmética corregida, financiamiento con mecanismo, riesgos constitucionales nombrados (art. 18 CN en PLANJUS, art. 124 CN en PLANTER), KPIs con baseline externo.

### Stream D — Documentos existentes
- Mejora profunda de los 5 más débiles: PLANCUL (fuentes, lecciones del mundo, instrumentos legales de las Tres Acciones, costo de Plataforma Dendrita), PLANGEO (marco legal, tablero propio, dimensión federal art. 124, re-derivación de Stacks contra 22 planes), PLANSEG (reconciliación presupuestaria neta/bruta, renumeración, stakeholders, comunicación), PLANEB (integración con los 22, hoja de ruta real, glosario, fallback regulatorio coherente), PLANSAL (SECCIÓN 1, tildes, lecciones del mundo).
- Pase mecánico corpus-wide en los 11 docs restantes: ¡BASTA! con signos, plata/argentum, conteo 22 (al 23 de abril de 2026), versiones header/footer alineadas, typo PLANED→PLANEDU.

## Verificación
`npm run check` + `npm run check:routes` + `npm run build`; smoke del Validation tab (0 ERRORs espurios); conteo de docs = 22.

## No-objetivos
- No se toca V2 ni la base de datos.
- No se cambia la doctrina (idealized design, no promesas de gobierno); PLANRUTA sigue fuera de los 22.
- CommandCenter no gana persistencia DB (solo se reemplaza el progreso random por uno derivado del estado del plan).
