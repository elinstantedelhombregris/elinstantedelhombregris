# Plantilla canónica — Sección "Integración con el Marco ¡BASTA!"

Todos los PLANes del ecosistema ¡BASTA! deben incluir una sección con el formato que se describe acá. La sección se ubica siempre **cerca del final** del documento (después de "Hoja de Ruta" / "Fases" y antes de "Supuestos" / "Riesgos residuales").

La data estructurada equivalente vive en `SocialJusticeHub/shared/arquitecto-data.ts` dentro del array `DEPENDENCIES`. Cada entrada A→B en ese array **debe** aparecer dos veces en los markdowns: en **"Lo que aporta"** del PLAN B y en **"Lo que necesita"** del PLAN A. Si falta uno de los dos lados, el dashboard de El Arquitecto dispara una alerta `V-REF-01`.

---

## SECCIÓN X: INTEGRACIÓN CON EL MARCO ¡BASTA!

### Lo que este PLAN aporta al ecosistema

| Plan destinatario | Naturaleza | Tipo | Qué aporta |
|---|---|---|---|
| PLANXXX | CRITICAL / IMPORTANT / MINOR | TECHNICAL / FINANCIAL / INSTITUTIONAL / LEGAL / LABOR / DATA / TEMPORAL | *Descripción específica del aporte, escrita en voz del proveedor: qué provee, para qué uso, en qué momento.* |

### Lo que este PLAN necesita de otros

| Plan fuente | Naturaleza | Tipo | Qué recibe |
|---|---|---|---|
| PLANYYY | CRITICAL / IMPORTANT / MINOR | TECHNICAL / FINANCIAL / INSTITUTIONAL / LEGAL / LABOR / DATA / TEMPORAL | *Descripción específica del consumo: qué necesita, para qué operación, en qué fase del plan.* |

### Interdependencias críticas (bucles de coordinación bidireccional)

- **PLANZZZ** — *Descripción del bucle: ambos planes dependen del estado del otro y coordinan su ritmo de implementación. Incluir específicamente qué aporta cada uno al otro.*

---

## Glosario rápido

**Naturaleza**:
- `CRITICAL`: el plan no puede operar sin este vínculo; si el otro falla, este falla.
- `IMPORTANT`: el vínculo es central pero hay alternativas o grados de fallback.
- `MINOR`: el vínculo enriquece la operación pero no es necesario para el funcionamiento base.

**Tipo**:
- `TECHNICAL`: infraestructura digital, tecnológica, plataformas, datos de telemetría.
- `FINANCIAL`: flujos de fondos, presupuesto, capitalización, fondos soberanos.
- `INSTITUTIONAL`: marcos institucionales, agencias, resoluciones, gobernanza.
- `LEGAL`: instrumentos legales, leyes, decretos, jurisdicciones.
- `LABOR`: flujos de personal, reconversión, formación profesional.
- `DATA`: flujos de información estructurada entre planes.
- `TEMPORAL`: secuencia o sincronización obligatoria entre ambos planes.

---

## Reglas de escritura

1. **Evitar descripciones genéricas**. Mala: "PLANDIG recibe datos de PLANMON". Buena: "PLANDIG aloja los nodos SAPI donde corren los rieles de pago y el registro del Pulso".
2. **Cada aporte debe ser verificable**. Si no se puede identificar exactamente qué flujo o artefacto cruza la frontera, el vínculo está mal especificado.
3. **Los bucles bidireccionales genuinos van en la tercera subsección**, no duplicados en las dos primeras. Ejemplo real: PLANMON ↔ PLANEB (la Bastarda Financiera es ancla del Pulso; el Pulso provee los rails al costo a todas las Bastardas).
4. **Cuando una dependencia es no-bloqueante** (la integración profunda arranca en Fase 1, no en Fase 0), declararlo explícitamente en la descripción: *"A partir de Fase 1: …"*.
5. **Referencia por ID en negrita** la primera vez que aparece un plan: **PLANDIG**. Usar ID a secas en menciones subsiguientes.
