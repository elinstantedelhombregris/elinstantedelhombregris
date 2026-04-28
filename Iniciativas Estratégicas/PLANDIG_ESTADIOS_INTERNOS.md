# Estadios Internos de PLANDIG — Núcleo y Soberanía

> **STATUS:** current
> **PLAN:** PLANDIG (un solo PLAN, sin división)
> **CANONICAL_ARCHITECTURE:** 22 thematic + PLANRUTA protocol — PLANDIG es **uno** de los 22.
> **REGISTRY:** ver `PLAN_REGISTRY.yml` (campo `internal_stages`)
> **MOTIVO:** PLANDIG es punto único de falla sistémico. La auditoría 2026-04-26 identificó 167 referencias entrantes desde otros PLANes. Estadiamos internamente las capacidades para reducir riesgo, sin partir el PLAN.
> **LAST_AUDIT:** 2026-04-26

## Principio rector

PLANDIG no se divide en dos PLANes. PLANDIG es **un solo PLAN** con dos estadios operativos internos. Esto preserva el conteo canónico (22 thematic + PLANRUTA) y evita inflar la coordinación.

## Estadio A — Núcleo Digital (tranche-1, dentro de PLANDIG)

**Alcance entregable en tranche-1:**

- Identidad-lite (no biométrica masiva, no SAPI completo).
- Estándares de datos públicos abiertos.
- Logs de auditoría inmutables (stack open source).
- Mensajería segura entre agencias.
- Reglas de interoperabilidad publicadas.
- Dashboards públicos básicos por PLAN.
- Cyber resilience básica (SOC 24/7, red team trimestral, certificación externa anual).
- Offline-first as policy: todo servicio público crítico debe operar 30 días sin PLANDIG.

**Lo que NO se entrega en este estadio:**

- Cloud soberano a escala.
- IA de frontera.
- SAPI completa.
- Gemelo digital nacional.
- Gobernanza algorítmica.
- Rieles monetarios protocolares.
- ArgenCloud, LANIA, El Mapa completos.
- Voto digital vinculante.
- IA generativa de gobierno.
- Computación cuántica.
- Blockchain protocolar.

**Costo del estadio A:** USD 1.2B operativo anual + USD 1.2B inversión en 24 meses (línea PLANDIG del libro mayor).
**Owner del estadio A:** Subsecretaría de Datos (execution cell en Jefatura de Gabinete).

## Estadio B — Capacidades Soberanas (tranche-3+, dentro de PLANDIG)

**Alcance entregable en tranche-3+:** todo lo excluido del estadio A.

**Condiciones para iniciar el estadio B (todas obligatorias, sin excepción):**

1. Estadio A en operación estable ≥ 18 meses.
2. PIA aprobado por cada componente del estadio B (Privacy Impact Assessment).
3. Auditoría externa de seguridad firmada.
4. Demanda concreta documentada de ≥ 3 PLANes consumidores en operación.
5. Marco legal de protección de datos vigente y aplicado.
6. Opinión legal stub (`LEGAL_OPINIONS/PLANDIG_estadio_B.md`) firmada por constitucionalista externo.

**Owner del estadio B:** se evalúa al cierre del estadio A. Hasta entonces no se asigna recurso.

**Costo del estadio B:** sin estimar hasta cierre del estadio A.

## Cómo otros PLANes consumen capacidades de PLANDIG

Cada PLAN consumidor declara qué capacidad de PLANDIG necesita y de qué estadio. La fila "Acción si el estadio B no está" describe el modo degradado.

| PLAN consumidor | Capacidad estadio A | Capacidad estadio B | Acción si estadio B aún no está |
|-----------------|---------------------|---------------------|----------------------------------|
| PLANAGUA | datos cuenca | — | OK |
| PLANVIV | registro | — | OK |
| PLANSAL | HCE básica | — | OK |
| PLANEDU | asistencia | — | OK |
| PLANSEG | logs | SAPI parcial | operación degradada manual |
| PLANJUS | datos parciales | AI audit | piloto solo en tranche-3 |
| PLANMON | — | rieles | diferido por defecto |
| PLANMOV | datos parciales | LNMA, AV | fase básica solo (líneas L1-L3) |
| PLANCUIDADO | registro | automatización parcial | operación con menor automatización |
| PLANMEMORIA | logs | archivo digital | archivo físico+digital simple |
| PLANTER | catastro | parcial | OK |
| PLANGEO | — | parcial | diferido |
| PLAN24CN | — | gemelo digital ciudad | solo labs |
| PLANEN | datos abiertos | — | OK |
| PLANEB | registro DAO básico | — | OK |
| PLANREP | datos empleo + Procurement OS | — | OK |
| PLANISV | datos suelo | — | OK |
| PLANCUL | — | — | OK |
| PLANSUS | datos básicos | parcial | investigación solo |
| PLANMESA | datos básicos | parcial | piloto deliberativo OK |
| PLANTALLER | registro talleres | — | OK |

## Anclaje en el archivo PLANDIG

En `PLANDIG_Argentina_ES.md`, la Fase 13.B.2 inserta dos secciones explícitas: "Estadio A — Núcleo Digital (tranche-1)" y "Estadio B — Capacidades Soberanas (tranche-3+, condicional)". Ambas dentro del mismo PLAN. **No se crea PLAN nuevo. No se cambia el conteo canónico (22 thematic + PLANRUTA).**

## Reglas de promoción del estadio A al estadio B

1. La decisión de activar el estadio B es del **Director del PEO + auditor externo + Mesa de Gobierno**.
2. La activación es **por componente**, no en bloque.
3. Cada componente requiere su propio PIA antes de activarse.
4. Si un componente del estadio B falla en piloto, el estadio A continúa operando independientemente.
5. **El estadio A no se desactiva nunca para "migrar" al B**: ambos coexisten en operación cuando B se active.

## Continuidad entre estadios

El estadio A es la **infraestructura permanente**. El estadio B es **complemento opcional, condicional y reversible**. Si las condiciones de seguridad o legitimidad se deterioran, los componentes del estadio B se pueden desactivar sin perder la operación del estadio A.
