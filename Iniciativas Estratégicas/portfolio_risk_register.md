# Registro de Riesgo del Portfolio

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **CADENCIA:** revisión mensual por PEO + revisión trimestral por Mesa de Gobierno + auditoría externa anual.
> **LAST_AUDIT:** 2026-04-26

## Categorías

- **F** = fiscal
- **L** = legal
- **T** = técnico/digital
- **A** = adversarial/político
- **C** = capacidad institucional
- **O** = operacional

## Tabla maestra

| ID | Riesgo | Cat | PLAN | Probabilidad | Impacto | Mitigación principal | Owner | Trigger |
|----|--------|-----|------|--------------|---------|----------------------|-------|---------|
| R-01 | Sobrecosto agregado tranche-1 > tope 3.5% PBI | F | todos | media | alto | Stress tests + freeze de promociones | Tesorero PEO | gasto > 80% tope |
| R-02 | PLANDIG ciberataque crítico | T | DIG | media | alto | Fallback offline + auditoría externa + SOC 24/7 | Oficial Seguridad | downtime > 24h |
| R-03 | Captura del PEO por intereses sectoriales | A | meta | media | alto | Auditor externo + rotación + transparencia | Director PEO + auditor | 2 vetos sin justificación |
| R-04 | Litigio masivo PLANTER bloquea PLANEN/PLAN24CN | L | TER, EN, 24CN | alta | alto | Pre-clearance CSJN + adhesión provincial | Oficial Legal | 1 cautelar nacional |
| R-05 | Promoción de PLAN Rojo (MON, SUS, 24CN) por presión política | A | matriz | media | alto | Matriz vinculante + auditor externo | Director PEO | propuesta formal de promoción |
| R-06 | Provincias no adhieren a LMV-03 (FONAVI/RENABAP) | C | VIV | alta | medio | Mapa de adhesión + incentivos fiscales | Oficial Legal | < 12 provincias en 12m |
| R-07 | Multilateral demora F02 (BID agua) | F | AGUA | media | medio | Bonos largos como cobertura | Tesorero PEO | retraso > 6m |
| R-08 | Captura sindical PLANSEG (militarización) | A | SEG | alta | alto | Auditoría externa permanente + canal OEA | Oficial Seguridad | 3 incidentes/año |
| R-09 | Fatiga participativa PLANMESA | C | MESA | media | medio | Sortición rotativa + remuneración | Cabeza PLANMESA | participación < 60% |
| R-10 | Backlash religioso PLANCUIDADO/PLANSUS | A | CUIDADO, SUS | alta | medio | Diálogo iglesias + lenguaje aplicable | Oficial Comunicación | campaña sostenida 3m |
| R-11 | Falla en evaluación independiente | C | meta | media | alto | Convenio universitario + auditor externo | Oficial Evaluación | 1 trimestre sin reporte |
| R-12 | Drift documental retorna | O | meta | alta | medio | Custodia registry + commit hooks | Custodio Registro | desviación detectada |
| R-13 | Ahorros PLANREP no se materializan | F | REP | alta | alto | Sin contar como fuente activa en tranche-1 | Tesorero PEO | gap > 30% al mes 18 |
| R-14 | Coalición pierde elección intermedia | A | meta | media | alto | Visibilidad de logros tranche-1 + irreversibilidad operativa | Director PEO + Comunicación | encuestas adversas 3 meses |
| R-15 | PLANMOV mega-presupuesto absorbe fiscalidad | F | MOV | alta | alto | Cuatro líneas internas con gates separados + diferimiento de AV (sin partir el PLAN) | Tesorero PEO | propuesta de adelanto a tranche-2 |
| R-16 | Fragmentación de la 5-misiones narrativa | A | público | media | medio | Guía de voz + entrenamiento de voceros | Oficial Comunicación | desviación pública sostenida |
| R-17 | Activación prematura del estadio B de PLANDIG | T | DIG | media | alto | 6 condiciones obligatorias + por componente + PIA por componente | Cabeza PLANDIG + auditor externo | propuesta de activación sin condiciones |
| R-18 | Promoción de línea L4 de PLANMOV (AV) a operativo | A | MOV | media | alto | Matriz vinculante + research-only indefinida + sin marco legal | Director PEO | propuesta de implementación AV |
| R-19 | Brecha de datos personales en PLANCUIDADO o PLANMEMORIA | T | CUIDADO, MEMORIA | media | alto | PIA aprobado + cláusula de revocabilidad | Oficial Seguridad | brecha confirmada |
| R-20 | Captura municipal de transferencias PLANVIV | A | VIV | alta | medio | Auditoría externa por programa + canal denuncia + transferencia escalonada | Oficial Riesgo | 1 municipio con desvío |

## Ritmo de revisión

- **Mensual:** PEO actualiza probabilidad/impacto y dispara mitigaciones.
- **Trimestral:** revisión con Mesa de Gobierno + publicación de resumen ejecutivo.
- **Anual:** re-auditoría completa al estilo de la auditoría 2026-04-26.
- **Trigger automático:** cuando un trigger se cumple, el owner tiene 72hs para reportar al Director PEO.

## Cómo se actualiza

- Cualquier nuevo riesgo identificado por el PEO o cabeza de PLAN se incorpora.
- Cambios requieren commit con justificación.
- Si un riesgo activa más de dos veces en 12 meses, su PLAN se evalúa para freeze.
