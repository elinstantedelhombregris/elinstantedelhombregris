# Matriz RACI — Dependencias Inter-PLAN

> **STATUS:** current
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol
> **REGISTRY:** ver `PLAN_REGISTRY.yml`
> **PRINCIPIO:** ninguna decisión inter-PLAN se toma por defecto. Toda colisión tiene un dueño explícito.
> **LAST_AUDIT:** 2026-04-26

## Convención

- **R** = Responsable de ejecutar
- **A** = Aprobador final (uno solo)
- **C** = Consultado (debe ser oído)
- **I** = Informado

## Decisiones cruzadas críticas

| Decisión | PLANes involucrados | R | A | C | I |
|----------|---------------------|---|---|---|---|
| Asignación de tierra urbana entre vivienda nueva y restauración ecológica | PLANVIV / PLANISV / PLANTER | PEO Oficial Evaluación | Director PEO | Min Habitat, Min Ambiente, INTA | Provincias, comunidades |
| Prioridad fiscal entre cuidado, vivienda, movilidad | PLANCUIDADO / PLANVIV / PLANMOV | Tesorero PEO | Director PEO | Hacienda, cabezas de PLAN | Mesa Gobierno |
| Promoción de PLAN Rojo a piloto operativo | matriz misiones (MON, SUS, 24CN) | Director PEO | Mesa Gobierno + auditor externo | Cabezas de PLAN, sociedad civil | público |
| Acceso a capacidades del estadio A de PLANDIG entre múltiples PLANes simultáneamente | PLANDIG / consumidores | Custodio Registro PEO | Director PEO | Cabezas de PLAN | público |
| Promoción de PLANDIG del estadio A al estadio B (por componente) | PLANDIG | Cabeza PLANDIG | Director PEO + auditor externo | Sociedad civil técnica | público |
| Asignación de agua entre uso humano, agro, industria | PLANAGUA / PLANISV / PLANEN | Cabeza PLANAGUA | Director PEO | Min Ambiente, INTA | Provincias, comunidades |
| Reasignación de personal estatal (PLANREP) | PLANREP / todos | Cabeza PLANREP | Director PEO + Hacienda | Sindicatos | público |
| Conflicto territorial originario vs extracción | PLANTER (L1/L2/L3) / PLANEN / PLAN24CN | Cabeza PLANTER | Director PEO + INAI | Comunidades, provincias | público |
| Activación de stress test fiscal por PLAN | n/a / todos | Tesorero PEO | Director PEO | Cabezas de PLAN afectados | público |
| Promoción tranche-1 → tranche-2 | n/a / todos | Director PEO | Mesa Gobierno | Auditor externo | público |
| Edición de `PLAN_REGISTRY.yml` | meta | Custodio Registro | Director PEO | — | público (commit log) |
| Ingreso de un nuevo PLAN al freeze | meta | Propuesta abierta | Director PEO + auditor externo | Mesa Gobierno | público |
| Publicación de material PLANGEO confrontacional | PLANGEO / todos | Cabeza PLANGEO | Director PEO + Cancillería | Inteligencia | restringido |
| Promoción de PLANEB Bastarda piloto a sistema | PLANEB / mercado | Cabeza PLANEB + ANEB | Director PEO | Competencia, sociedad civil | público |
| Activación de línea interna de PLANTER (L1, L2 o L3) | PLANTER | Cabeza PLANTER | Director PEO + auditor externo | INAI, provincias | público |
| Activación de línea interna de PLANMOV (L1, L2, L3) — L4 NO se activa operativamente | PLANMOV | Cabeza PLANMOV | Director PEO + Mesa Gobierno | Sindicatos transporte, AMBA gobernadores | público |
| Conflicto AMBA-provincias en PLANMOV L3 | PLANMOV / provincias | Cabeza PLANMOV | Director PEO | Gobernadores AMBA | público |
| Promoción de PLANJUS de research a piloto | PLANJUS / PLANSEG | Cabeza PLANJUS | Director PEO + Mesa Gobierno | Sociedad civil técnica | público |
| Conflicto de uso de suelo entre PLANISV y PLANTER L1 | PLANISV / PLANTER | Cabeza PLANISV | Director PEO | INTA, comunidades | provincias |

## Reglas

1. **Un solo A por decisión.** Si hay dos, falta diseño.
2. **Sin C no hay decisión.** Saltarse a un consultado documentado anula la decisión.
3. **Toda decisión cruzada se registra** en el `portfolio_risk_register.md` aunque no genere riesgo.
4. **El Director del PEO no es A de su propio plan sectorial** (no tiene PLAN sectorial; solo decisiones inter-PLAN).
5. **Las cabezas de PLAN no son A en decisiones que afectan a otros PLANes** salvo cuando la decisión es operativa interna de su PLAN.

## Cómo se actualiza esta matriz

- Cualquier nueva colisión inter-PLAN identificada por el PEO se incorpora.
- Revisión trimestral por Director PEO + Oficial Evaluación.
- Cambios requieren commit con justificación.
