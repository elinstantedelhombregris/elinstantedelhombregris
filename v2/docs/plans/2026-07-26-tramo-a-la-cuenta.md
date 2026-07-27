# Tramo A — La cuenta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el canon de ¡BASTA! sepa cuánto está pidiendo — corregir los pisos constitucionales mal cargados, hacer que el grafo y los documentos digan lo mismo, y dejar por escrito el acta que levanta el freeze de PLANes nuevos.

**Architecture:** Un test de canon fija la tabla verificada documento por documento y falla contra el grafo actual; después se corrige el grafo hasta que el test pase. La inconsistencia bruto/neto se resuelve declarando que `constitutionalFloor` es siempre **bruto** y renombrando la métrica que hoy miente. Los dos documentos de papel (`PRESUPUESTO_CONSOLIDADO_BASTA.md` y `COVERAGE_GAPS_ASSIGNMENTS.md`) se corrigen después del código, no antes, porque el número correcto lo produce el código.

**Tech Stack:** TypeScript, vitest (`npm run test:unit` desde `SocialJusticeHub/`), tsx para scripts one-shot.

## Global Constraints

- **Spec de referencia:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`. Toda decisión ambigua se resuelve ahí — **salvo las tres correcciones que este plan le hace a la spec** (Task 6), que mandan sobre ella.
- **Manda el taller, no el grafo.** `Iniciativas Estratégicas/PLAN*_Argentina_ES.md` es la fuente autoritativa de todo piso constitucional. El grafo se corrige contra el documento, nunca al revés.
- **Este tramo no agrega ningún PLAN.** No se toca `PLAN_NODES` para sumar nodos, ni `EXPECTED_PLAN_COUNT`, ni ningún conteo de 22. Eso es tramo B en adelante.
- **Español rioplatense** en todo texto visible y en los comentarios de código nuevo.
- **Commits:** el repo raíz no usa commitlint (sí lo usa `v2/`). Formato de `../CLAUDE.md`: `Fix [issue]: [detail]`, `Add [name] [type] — [context]`. Los commits que tocan sólo `v2/docs/` usan conventional commits con alcance `docs`.
- **Verificación antes de cada commit que toca `SocialJusticeHub/`:** `npm run check` (tsc) y `npm run test:unit` desde `SocialJusticeHub/`.
- **`npm run verify` NO se corre en este tramo:** incluye `build`, que prerenderiza cursos y ensayos y tarda minutos. `check` + `test:unit` cubren todo lo que este tramo puede romper.

## File Structure

**Crear**

| Archivo | Responsabilidad |
|---|---|
| `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts` | Canon de los pisos: la tabla verificada contra los documentos, y las invariantes que impiden que vuelva a driftear. |
| `SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts` | One-shot: calcula la regla 3 de `COVERAGE_GAPS_ASSIGNMENTS.md` para los cuatro PLANes nuevos y emite la tabla que va al acta. |
| `Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md` | El acta que levanta el freeze, con la evidencia del gate. |

**Modificar**

| Archivo | Cambio |
|---|---|
| `SocialJusticeHub/shared/arquitecto-data.ts` | Tres pisos corregidos (CUIDADO, EN, TALLER), PLANSEG a bruto con su neto en comentario, `constitutionalFloorNet` → `constitutionalFloorGross`. |
| `SocialJusticeHub/client/src/components/arquitecto/BudgetFlow.tsx:84` | Consume el nombre nuevo de la métrica. |
| `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md` | La ALERTA FISCAL pasa de 12 agencias a 22. |
| `Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md` | Freeze levantado, con remisión al acta. |
| `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md` | Tres correcciones (§2.1, §2.2, §2.4). |

---

## Lo que se verificó antes de escribir este plan

Esto no es contexto de color: es la razón por la que las tareas están donde están. **La spec dice que el grafo está mal en cuatro nodos. Está mal en tres.**

| Nodo | Grafo (`arquitecto-data.ts`) | Documento | Veredicto |
|---|---|---|---|
| PLANSEG (:217) | `'0.05-0.10% PBI neto'` | `PLANSEG:1052` → **1,5% del PBI** | **No es bug.** `PRESUPUESTO_CONSOLIDADO_BASTA.md` nota (3) declara explícitamente que el neto nuevo es 0,05–0,10% porque el resto es reasignación de gasto que ya se ejecuta. El grafo cargó el neto **a propósito**. |
| PLANCUIDADO (:267) | `'0.75-1.1% PBI'` | `PLANCUIDADO:515` → **0.45% del PBI** | **Bug.** El 0,75–1,1% es la *inversión estimada para régimen pleno* que aparece en la tesis (línea 94), no el piso. Se cargó el campo equivocado. |
| PLANEN (:207) | `'0.50% PBI'` | `PLANEN:1471` → ANEN **0,5%** · `PLANEN:791` y `:1489` → LANEF **0,2%** | **Bug por omisión.** El documento declara dos pisos y el grafo carga uno. |
| PLANTALLER (:257) | `'0.08% PBI'` | `PLANTALLER:607` → **0.10% del PBI** | **Bug.** |

**El problema real es más grande que los tres bugs: el campo mezcla bruto y neto.** PLANSEG guarda neto; PLANVIV guarda `'2.00% PBI'` bruto aunque la nota (4) del mismo documento diga que se autofinancia. Y la métrica se llama `constitutionalFloorNet` mientras suma casi todo bruto. **El nombre miente.**

**La suma, calculada a mano sobre los 17 nodos con piso:**

| | Bajo | Alto |
|---|---|---|
| Hoy (grafo) | 6,45 | 8,44 |
| Corregido (3 bugs + SEG a bruto) | **7,82** | **9,41** |
| La spec dice | 7,82 | ~~9,49~~ |

El extremo bajo coincide exacto. El alto no: **9,41, no 9,49.** El 9,49 salió de una reconciliación a mano que sumó PLANSEG dos veces. Task 6 corrige la spec.

---

### Task 1: El canon de los pisos — el test y los tres nodos mal cargados

Fija la tabla verificada como autoridad ejecutable y corrige los tres nodos que discrepan. El test y los arreglos van en el mismo commit: la Global Constraint exige `npm run check` verde antes de cada commit, y un test rojo commiteado solo la viola.

**Files:**
- Create: `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts`
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts:207` (PLANEN), `:257` (PLANTALLER), `:267` (PLANCUIDADO)

**Interfaces:**
- Consumes: `PLAN_NODES` de `../../shared/arquitecto-data`.
- Produces: la guardia, y los tres pisos corregidos que Task 2 suma.

- [ ] **Step 1: Escribir el test que falla**

Crear `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PLAN_NODES } from '../../shared/arquitecto-data';

/**
 * Canon de los pisos constitucionales.
 *
 * Cada valor de esta tabla se transcribió del documento del PLAN en el taller
 * (`Iniciativas Estratégicas/PLAN*_Argentina_ES.md`), verificado línea por línea
 * el 2026-07-26. **Manda el documento, no el grafo**: si esta tabla y
 * arquitecto-data.ts discrepan, se corrige arquitecto-data.ts.
 *
 * El campo `constitutionalFloor` guarda siempre el piso **BRUTO** — la obligación
 * legal que el documento declara. El costo fiscal neto es otra cosa y no vive acá.
 */
const PISOS_SEGUN_EL_TALLER: Record<string, { floor: string; fuente: string }> = {
  PLANJUS: { floor: '0.25-0.30% PBI', fuente: 'PRESUPUESTO_CONSOLIDADO nota (1): 1% del presupuesto nacional ~ 0,30% PBI' },
  PLANEB: { floor: '0.10% PBI', fuente: 'PLANEB' },
  PLANDIG: { floor: '0.50-1.0% PBI', fuente: 'PLANDIG (inicial 0,5%, meta 1%)' },
  PLANSUS: { floor: '0.10% PBI', fuente: 'PLANSUS' },
  PLANEDU: { floor: '0.50% PBI', fuente: 'PLANEDU (adicional al sistema existente)' },
  PLANSAL: { floor: '0.50-1.50% PBI', fuente: 'PRESUPUESTO_CONSOLIDADO nota (2): 5% inicial a 15% del gasto en salud' },
  PLANISV: { floor: '0.10% PBI', fuente: 'PLANISV' },
  PLANAGUA: { floor: '0.15% PBI', fuente: 'PLANAGUA' },
  PLANEN: { floor: '0.70% PBI', fuente: 'PLANEN:1471 ANEN 0,5% + PLANEN:791,1489 LANEF 0,2%' },
  PLANSEG: { floor: '1.50% PBI', fuente: 'PLANSEG:1052, :1200, :1308' },
  PLANVIV: { floor: '2.00% PBI', fuente: 'PLANVIV (2% PBI / 8% del presupuesto nacional)' },
  PLANMESA: { floor: '0.07% PBI', fuente: 'PLANMESA' },
  PLANTALLER: { floor: '0.10% PBI', fuente: 'PLANTALLER:607' },
  PLANCUIDADO: { floor: '0.45% PBI', fuente: 'PLANCUIDADO:515, :591' },
  PLANMEMORIA: { floor: '0.10-0.14% PBI', fuente: 'PLANMEMORIA' },
  PLANTER: { floor: '0.20% PBI', fuente: 'PLANTER' },
  PLANMOV: { floor: '0.50% PBI', fuente: 'PLANMOV' },
};

/** Los PLANes que por diseño no tienen piso. PLANCUL no lo tiene por filosofía. */
const SIN_PISO = ['PLANREP', 'PLANMON', 'PLAN24CN', 'PLANGEO', 'PLANCUL'];

describe('pisos constitucionales (canon contra el taller)', () => {
  it('cada piso del grafo coincide con el documento de su PLAN', () => {
    for (const [id, esperado] of Object.entries(PISOS_SEGUN_EL_TALLER)) {
      const nodo = PLAN_NODES.find((p) => p.id === id);
      expect(nodo, `${id}: no esta en PLAN_NODES`).toBeDefined();
      expect(nodo?.constitutionalFloor, `${id}: el grafo discrepa del taller (${esperado.fuente})`).toBe(
        esperado.floor,
      );
    }
  });

  it('los PLANes sin piso siguen sin piso', () => {
    for (const id of SIN_PISO) {
      const nodo = PLAN_NODES.find((p) => p.id === id);
      expect(nodo?.constitutionalFloor, `${id}: le aparecio un piso`).toBeNull();
    }
  });

  it('la tabla cubre a los 22: con piso + sin piso = PLAN_NODES', () => {
    const cubiertos = new Set([...Object.keys(PISOS_SEGUN_EL_TALLER), ...SIN_PISO]);
    expect(cubiertos.size).toBe(PLAN_NODES.length);
    for (const p of PLAN_NODES) {
      expect(cubiertos.has(p.id), `${p.id}: no esta ni en la tabla ni en SIN_PISO`).toBe(true);
    }
  });

  it('ningun piso mezcla bruto con neto: el campo es siempre bruto', () => {
    for (const p of PLAN_NODES) {
      if (!p.constitutionalFloor) continue;
      expect(
        p.constitutionalFloor.toLowerCase(),
        `${p.id}: el campo dice «neto». El piso es la obligacion legal bruta.`,
      ).not.toContain('neto');
    }
  });

  it('el formato es «bajo-alto% PBI» o «unico% PBI»: nunca dos pisos sueltos', () => {
    // sumConstitutionalFloorsGross lee nums[0] como bajo y nums[1] como alto. Un piso
    // compuesto («0.50% + 0.20%») se leeria como rango 0,50-0,20 y daria alto < bajo.
    for (const p of PLAN_NODES) {
      if (!p.constitutionalFloor) continue;
      const nums = p.constitutionalFloor.match(/\d+(?:\.\d+)?/g) ?? [];
      expect(nums.length, `${p.id}: se esperaban 1 o 2 numeros`).toBeLessThanOrEqual(2);
      if (nums.length === 2) {
        expect(Number(nums[1]), `${p.id}: el alto es menor que el bajo`).toBeGreaterThanOrEqual(
          Number(nums[0]),
        );
      }
    }
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `cd SocialJusticeHub && npm run test:unit -- pisos-constitucionales`

Expected: FAIL. Los fallos esperados, exactamente cinco:
- `PLANEN: el grafo discrepa del taller` — dice `0.50% PBI`, se espera `0.70% PBI`
- `PLANSEG: el grafo discrepa del taller` — dice `0.05-0.10% PBI neto`, se espera `1.50% PBI`
- `PLANTALLER: el grafo discrepa del taller` — dice `0.08% PBI`, se espera `0.10% PBI`
- `PLANCUIDADO: el grafo discrepa del taller` — dice `0.75-1.1% PBI`, se espera `0.45% PBI`
- `PLANSEG: el campo dice «neto»`

Si falla algo **más** que esto, pará: significa que el grafo cambió desde la verificación del 2026-07-26 y hay que re-verificar contra los documentos antes de seguir.

- [ ] **Step 3: PLANEN — consolidar ANEN + LANEF**

En la línea 207, reemplazar:

```ts
    legalInstruments: 1, constitutionalFloor: '0.50% PBI',
```

por:

```ts
    // 0,70% = ANEN 0,50% (PLANEN:1471) + LANEF 0,20% de I+D (PLANEN:791, :1489).
    // Van sumados en un solo valor: el parser lee dos numeros como rango bajo-alto.
    legalInstruments: 1, constitutionalFloor: '0.70% PBI',
```

- [ ] **Step 4: PLANTALLER — el documento dice 0.10, no 0.08**

En la línea 257, reemplazar `constitutionalFloor: '0.08% PBI',` por:

```ts
    legalInstruments: 2, constitutionalFloor: '0.10% PBI', // PLANTALLER:607
```

- [ ] **Step 5: PLANCUIDADO — el piso, no la inversión**

En la línea 267, reemplazar `constitutionalFloor: '0.75-1.1% PBI',` por:

```ts
    // 0,45% es el piso (PLANCUIDADO:515, :591). El 0,75-1,1% que estaba aca es la
    // inversion estimada de regimen pleno de la tesis: otro numero, otro campo.
    legalInstruments: 5, constitutionalFloor: '0.45% PBI',
```

- [ ] **Step 6: Verificar que bajaron tres fallos**

Run: `cd SocialJusticeHub && npm run test:unit -- pisos-constitucionales`
Expected: siguen fallando sólo los de PLANSEG (dos: la discrepancia y el «neto») y el de la suma. Los de PLANEN, PLANTALLER y PLANCUIDADO pasaron.

- [ ] **Step 7: Type check**

Run: `cd SocialJusticeHub && npm run check`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts SocialJusticeHub/shared/arquitecto-data.ts
git commit -m "Fix tres pisos constitucionales mal cargados en el grafo

PLANEN le faltaba el 0,20% del LANEF; PLANTALLER decia 0,08 y su documento
dice 0,10; PLANCUIDADO tenia cargada la inversion de regimen pleno
(0,75-1,1%) en el campo del piso, que es 0,45%. Con el test de canon que
transcribe los 17 pisos del taller y los fija contra el grafo.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: PLANSEG a bruto y la métrica que deja de mentir

El campo guarda neto sólo para PLANSEG, mientras PLANVIV guarda bruto aunque también se autofinancie. Y `constitutionalFloorNet` suma casi todo bruto. **La decisión: el campo es siempre bruto —es la obligación legal— y el neto vive en el comentario y en `PRESUPUESTO_CONSOLIDADO_BASTA.md`, que es donde se discute costo fiscal.**

Esto es lo que sostiene la Escalera de Garantías de la spec: sus ocho escalones recortan pisos **brutos**.

**Files:**
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts:217` (PLANSEG), `:736` (la función), `:755` (la métrica)
- Modify: `SocialJusticeHub/client/src/components/arquitecto/BudgetFlow.tsx:84`

**Interfaces:**
- Consumes: los pisos corregidos de Task 1.
- Produces: `ECOSYSTEM_METRICS.constitutionalFloorGross: string` — reemplaza a `constitutionalFloorNet`, que **deja de existir**.

- [ ] **Step 1: PLANSEG al bruto**

En la línea 217, reemplazar `constitutionalFloor: '0.05-0.10% PBI neto',` por:

```ts
    // 1,50% es el piso que declara PLANSEG:1052. El costo fiscal NUEVO neto es
    // 0,05-0,10% porque el resto es reasignacion de gasto que ya se ejecuta
    // (PRESUPUESTO_CONSOLIDADO_BASTA.md nota 3). El campo guarda el bruto: es la
    // obligacion legal. El neto se discute en el consolidado, no aca.
    legalInstruments: 1, constitutionalFloor: '1.50% PBI',
```

- [ ] **Step 2: Renombrar la función y documentar qué suma**

En la línea 736, reemplazar la firma de `sumConstitutionalFloors` y anteponerle el comentario:

```ts
/**
 * Suma los pisos constitucionales BRUTOS declarados por los documentos.
 *
 * Bruto, no neto: varios PLANes se autofinancian en parte (PLANSEG con
 * reasignacion de gasto de seguridad, PLANVIV con repagos de la Bastarda
 * Inmobiliaria), y ese descuento se discute en PRESUPUESTO_CONSOLIDADO_BASTA.md.
 * Aca se suma la obligacion legal, que es lo que consume Techo.
 */
function sumConstitutionalFloorsGross(): string {
```

El cuerpo de la función no cambia.

- [ ] **Step 3: Renombrar la propiedad de la métrica**

En la línea 755, reemplazar:

```ts
  constitutionalFloorNet: sumConstitutionalFloors(),
```

por:

```ts
  constitutionalFloorGross: sumConstitutionalFloorsGross(),
```

- [ ] **Step 4: Actualizar el único consumidor**

En `SocialJusticeHub/client/src/components/arquitecto/BudgetFlow.tsx:84`, reemplazar
`value: ECOSYSTEM_METRICS.constitutionalFloorNet,` por
`value: ECOSYSTEM_METRICS.constitutionalFloorGross,`.

Mirá la etiqueta (`label` o equivalente) que acompaña a ese `value` en las líneas de alrededor: si el texto visible dice «neto», cambialo a «bruto». Es texto rioplatense visible en `/arquitecto`.

- [ ] **Step 5: Agregar la aserción de la suma al test de canon**

Recién ahora existe la propiedad. En `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts`,
agregar `ECOSYSTEM_METRICS` al import y este caso al final del `describe`:

```ts
  it('la suma de pisos es 7.82-9.41% del PBI', () => {
    expect(ECOSYSTEM_METRICS.constitutionalFloorGross).toBe('7.82-9.41% PBI');
  });
```

- [ ] **Step 6: Verificar que el test pasa entero**

Run: `cd SocialJusticeHub && npm run test:unit -- pisos-constitucionales`
Expected: PASS, los 6 tests. La suma da `7.82-9.41% PBI`.

Si la suma da otro número, **no ajustes el test**: recontá los pisos contra la tabla de Task 1 y encontrá cuál nodo quedó mal.

- [ ] **Step 7: Type check y suite completa**

Run: `cd SocialJusticeHub && npm run check && npm run test:unit`
Expected: tsc sin errores, y ningún test previamente verde en rojo. Si algún otro test rompió por el renombre, arreglalo acá — no en otro commit.

- [ ] **Step 8: Commit**

```bash
git add SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts SocialJusticeHub/shared/arquitecto-data.ts SocialJusticeHub/client/src/components/arquitecto/BudgetFlow.tsx
git commit -m "Fix el campo de piso mezclaba bruto y neto — ahora es siempre bruto

PLANSEG guardaba el neto (0,05-0,10%) mientras PLANVIV guardaba el bruto,
y la metrica se llamaba constitutionalFloorNet sumando casi todo bruto.
PLANSEG pasa a su piso declarado de 1,50% con el neto en comentario, y la
metrica pasa a constitutionalFloorGross. La suma real: 7,82-9,41% del PBI.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: La ALERTA FISCAL pasa de 12 agencias a 22

`PRESUPUESTO_CONSOLIDADO_BASTA.md` declara 5,45–6,25% del PBI. Esa tabla cubre 12 agencias y se escribió antes de que existieran los PLANes 17 a 22. Es la cifra que la spec y medio corpus citan.

**Files:**
- Modify: `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md` (sección «Suma de pisos constitucionales directos» y «ALERTA FISCAL», alrededor de las líneas 188–210)

**Interfaces:**
- Consumes: la suma que produce Task 2.
- Produces: la cifra canónica de papel que Task 5 y Task 6 citan.

- [ ] **Step 1: Leer la sección entera antes de tocarla**

Run: `sed -n '180,215p' "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md"`

Fijate qué filas tiene hoy la tabla de «Suma de pisos constitucionales directos» y cuáles de los 22 faltan.

- [ ] **Step 2: Completar la tabla a los 17 PLANes con piso**

Agregá las filas que faltan, con los mismos valores del test de Task 1:

PLANJUS 0,25–0,30 · PLANEB 0,10 · PLANDIG 0,50–1,00 · PLANSUS 0,10 · PLANEDU 0,50 · PLANSAL 0,50–1,50 · PLANISV 0,10 · PLANAGUA 0,15 · PLANEN 0,70 · PLANSEG 1,50 · PLANVIV 2,00 · PLANMESA 0,07 · PLANTALLER 0,10 · PLANCUIDADO 0,45 · PLANMEMORIA 0,10–0,14 · PLANTER 0,20 · PLANMOV 0,50.

Y las cinco sin piso, nombradas: PLANREP, PLANMON, PLAN24CN, PLANGEO, PLANCUL.

- [ ] **Step 3: Reescribir el párrafo de la ALERTA FISCAL**

Reemplazar el párrafo que arranca con `**La suma de pisos constitucionales directos (brutos) alcanza el 5,45% del PBI...` por:

```markdown
**La suma de pisos constitucionales directos (brutos) alcanza el 7,82-9,41% del PBI.**
La cifra de 5,45-6,25% que este documento declaro hasta el 2026-07-26 cubria 12
agencias y se escribio antes de que existieran los PLANes 17 a 22: le faltaban
PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER y PLANMOV, ademas del
0,20% del LANEF y del piso de ANVIP. El numero correcto lo calcula en vivo
`SocialJusticeHub/shared/arquitecto-data.ts` (`ECOSYSTEM_METRICS.constitutionalFloorGross`)
y lo fija el test `tests/unit/pisos-constitucionales.test.ts`.

El piso bruto sigue sobreestimando el costo fiscal real por las razones de las
notas (2) a (4) — ANSEG y ANVIV se financian en gran parte con reasignacion y
autofinanciamiento. Pero **el bruto es lo que consume rigidez presupuestaria**, y
por eso es el numero contra el que se mide el Techo.
```

- [ ] **Step 4: Barrer las otras apariciones de la cifra vieja en este archivo**

Run: `grep -n "5,45\|5\.45\|6,25\|6\.25\|18,2\|20,8" "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md"`

Expected: cada resultado o quedó actualizado, o es una cita histórica que ahora dice explícitamente «hasta el 2026-07-26».

Recalculá el «18,2-20,8% del presupuesto nacional»: con 7,82–9,41% sobre un presupuesto de ~30% del PBI da **26,1–31,4%**.

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md"
git commit -m "Fix la ALERTA FISCAL contaba 12 agencias de 22

La suma de pisos era 5,45-6,25% del PBI sobre una tabla escrita antes de
que existieran los PLANes 17 a 22. La real es 7,82-9,41%.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: El gate de spin-off de la regla 3

`COVERAGE_GAPS_ASSIGNMENTS.md` regla 3 habilita convertir un sub-mandato en PLAN cuando supera **1,5× el presupuesto del PLAN huésped**. Es la vía legítima para levantar el freeze. Hay que correrla para los cuatro y **reportar honestamente**, incluso donde no pase.

**Files:**
- Create: `SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts`

**Interfaces:**
- Consumes: `PLAN_NODES` de `../shared/arquitecto-data`.
- Produces: la tabla en stdout que Task 5 pega en el acta.

- [ ] **Step 1: Escribir el script**

Crear `SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts`:

```ts
/**
 * One-shot: corre la regla 3 de COVERAGE_GAPS_ASSIGNMENTS.md para los cuatro
 * PLANes nuevos de la spec 2026-07-26.
 *
 * Run: npx tsx scripts/gate-spinoff-planes-nuevos.ts
 *
 * La regla: un sub-mandato habilita gate de spin-off cuando supera 1,5x el
 * presupuesto del PLAN huesped. Se calcula bajo/bajo y alto/alto: comparar
 * bajo contra alto mezcla escenarios distintos y da ratios sin sentido.
 */
import { PLAN_NODES } from '../shared/arquitecto-data';

/** Presupuestos de los cuatro nuevos, en USD millones a 15 anos (spec seccion 1). */
const NUEVOS = [
  { code: 'PLANPACTO', low: 12_400, high: 22_000, huespedes: ['PLANREP'] },
  { code: 'PLANARCO', low: 53_000, high: 96_000, huespedes: ['PLANCUIDADO'] },
  { code: 'PLANPREGUNTA', low: 16_500, high: 26_000, huespedes: ['PLANEDU', 'PLANEB', 'PLANDIG'] },
  { code: 'PLANFOCO', low: 3_000, high: 5_000, huespedes: [] },
];

const UMBRAL = 1.5;

function main(): void {
  for (const nuevo of NUEVOS) {
    if (nuevo.huespedes.length === 0) {
      console.log(
        `${nuevo.code}: SIN HUESPED. COVERAGE_GAPS_ASSIGNMENTS.md nunca le asigno uno, ` +
          `asi que la regla 3 no aplica: no fue sub-mandato de nadie.`,
      );
      continue;
    }

    for (const id of nuevo.huespedes) {
      const h = PLAN_NODES.find((p) => p.id === id);
      if (!h) throw new Error(`${nuevo.code}: huesped ${id} no esta en PLAN_NODES`);
      const rBajo = h.budgetLow === 0 ? Infinity : nuevo.low / h.budgetLow;
      const rAlto = h.budgetHigh === 0 ? Infinity : nuevo.high / h.budgetHigh;
      const pasa = rBajo >= UMBRAL && rAlto >= UMBRAL;
      console.log(
        `${nuevo.code} vs ${id}: ${rBajo.toFixed(2)}x-${rAlto.toFixed(2)}x ` +
          `(huesped ${h.budgetLow}-${h.budgetHigh} USD MM) -> ${pasa ? 'PASA' : 'NO PASA'}`,
      );
    }

    // Con varios huespedes, la lectura conservadora es contra la suma.
    if (nuevo.huespedes.length > 1) {
      const sumLow = nuevo.huespedes.reduce(
        (s, id) => s + (PLAN_NODES.find((p) => p.id === id)?.budgetLow ?? 0), 0);
      const sumHigh = nuevo.huespedes.reduce(
        (s, id) => s + (PLAN_NODES.find((p) => p.id === id)?.budgetHigh ?? 0), 0);
      const rBajo = nuevo.low / sumLow;
      const rAlto = nuevo.high / sumHigh;
      console.log(
        `${nuevo.code} vs los ${nuevo.huespedes.length} huespedes sumados: ` +
          `${rBajo.toFixed(2)}x-${rAlto.toFixed(2)}x -> ` +
          `${rBajo >= UMBRAL && rAlto >= UMBRAL ? 'PASA' : 'NO PASA'}`,
      );
    }
  }
}

main();
```

- [ ] **Step 2: Correr el gate**

Run: `cd SocialJusticeHub && npx tsx scripts/gate-spinoff-planes-nuevos.ts`

Expected — copiá la salida literal, la vas a pegar en el acta. Los resultados que ya se calcularon a mano y tienen que coincidir:

- `PLANPACTO vs PLANREP: 5.64x-5.24x (huesped 2200-4200)` → **PASA**
- `PLANARCO vs PLANCUIDADO: 1.77x-2.13x (huesped 30000-45000)` → **PASA**
- `PLANPREGUNTA vs PLANEDU: 0.21x-0.26x (huesped 80000-100000)` → **NO PASA**
- `PLANPREGUNTA vs PLANEB: 33.00x-43.33x (huesped 500-600)` → **PASA**
- `PLANPREGUNTA vs PLANDIG: 3.51x-2.63x (huesped 4700-9900)` → **PASA**
- `PLANPREGUNTA vs los 3 huespedes sumados: 0.19x-0.24x` → **NO PASA**
- `PLANFOCO: SIN HUESPED`

**No maquilles esto.** Dos de los cuatro pasan el gate limpio, PLANPREGUNTA lo pasa contra dos de sus tres huéspedes y falla contra PLANEDU y contra la suma, y PLANFOCO nunca fue sub-mandato de nadie. El acta de Task 5 argumenta sobre estos resultados, no sobre los que nos gustaría.

- [ ] **Step 3: Commit**

```bash
git add SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts
git commit -m "Add gate-spinoff script — la regla 3 corrida para los cuatro PLANes nuevos

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: El acta que levanta el freeze

**Files:**
- Create: `Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`
- Modify: `Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md`

**Interfaces:**
- Consumes: la salida de Task 4 y la cifra de Task 3.
- Produces: la autoridad de papel que el tramo B cita para escribir el primer PLAN nuevo.

- [ ] **Step 1: Escribir el acta**

Crear `Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`:

```markdown
# Acta de levantamiento del freeze de PLANes nuevos

**Fecha:** 2026-07-26
**Deroga:** el freeze declarado en `COVERAGE_GAPS_ASSIGNMENTS.md` el 2026-04-26
**Spec que lo motiva:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`
**Resultado:** el canon pasa de 22 PLANes tematicos a 26, mas PLANRUTA

## Que decia el freeze

`COVERAGE_GAPS_ASSIGNMENTS.md` (2026-04-26) declaro *«Freeze sigue activo. Sin
PLANes nuevos»* y repartio cada hueco de cobertura como sub-mandato interno de un
PLAN huesped. Su regla 3 dejo abierta una sola puerta: **gate de spin-off cuando
un sub-mandato supera 1,5x el presupuesto del huesped**, con cierre de tranche,
propuesta abierta y firma.

## El gate, corrido

Salida de `SocialJusticeHub/scripts/gate-spinoff-planes-nuevos.ts`:

<!-- PEGAR ACA LA SALIDA LITERAL DEL SCRIPT (Task 4, Step 2) -->

## Lectura honesta del resultado

**Dos pasan el gate limpio.** PLANPACTO da 5,2-5,6x contra PLANREP y PLANARCO da
1,8-2,1x contra PLANCUIDADO. Para estos dos, la regla 3 se cumple como esta escrita.

**PLANPREGUNTA lo pasa contra dos huespedes de tres y falla contra el tercero.**
33x contra PLANEB y 2,6-3,5x contra PLANDIG; 0,2x contra PLANEDU, que es el PLAN
mas caro del corpus (USD 80-100 mil millones). Contra la suma de los tres, no pasa.
Que un sub-mandato repartido entre tres huespedes no supere a la suma de los tres
no dice que sea chico: dice que **la asignacion original era mala**. Un hueco
repartido entre tres duenos no tiene dueno, y eso es exactamente lo que paso: el
renglon «Ciencia y tecnologia (PLANCYT) → PLANEDU + PLANEB + PLANDIG — CyT
distribuido» no produjo una sola seccion en tres meses.

**PLANFOCO nunca tuvo huesped.** El hueco «Cultura/Medios/Artes» quedo calificado
IMPORTANTE en la auditoria de marzo y `COVERAGE_GAPS_ASSIGNMENTS.md` **no le asigno
ninguno**. La regla 3 no aplica porque nunca fue sub-mandato de nadie. No es un
spin-off: es un hueco que el freeze dejo abierto.

## El argumento independiente del gate

La regla 3 alcanza para dos de los cuatro. Los otros dos se fundan en el hallazgo
que produjo este mismo tramo: **`PRESUPUESTO_CONSOLIDADO_BASTA.md` declaraba
5,45-6,25% del PBI en pisos constitucionales sobre una tabla de 12 agencias. La
suma real de los 22 es 7,82-9,41%.** El proyecto no sabia cuanto estaba pidiendo.

El proposito declarado del freeze era la disciplina de alcance. Un freeze que
mantiene 22 PLANes fijos mientras el numero que los sostiene esta mal en mas de
dos puntos del PBI no disciplina nada: solo impide que alguien lleve la cuenta.
PLANPACTO es el PLAN que lleva la cuenta.

## Lo que se levanta y lo que no

**Se levanta:** la prohibicion de PLANes nuevos, para los cuatro nombrados en la
spec del 2026-07-26 y solo para ellos.

**Sigue vigente:** todo lo demas de `COVERAGE_GAPS_ASSIGNMENTS.md`. Los huecos
asignados a huespedes que no son estos cuatro siguen siendo sub-mandatos, con sus
owners y tranches. La regla 4 sigue en pie: ningun sub-mandato se convierte en PLAN
automaticamente.

**Se retiran de la tabla de asignacion**, porque pasan a tener documento propio:
- «Federalismo fiscal y coparticipacion → PLANREP» → **PLANPACTO**
- «Ciencia y tecnologia (PLANCYT) → PLANEDU + PLANEB + PLANDIG» → **PLANPREGUNTA**
- «Discapacidad y vejez → PLANCUIDADO + PLANSAL» → la parte de vejez pasa a
  **PLANARCO**; la de discapacidad **queda** en PLANCUIDADO + PLANSAL

**Lo no humano NO genera PLAN.** Se reparte entre diez huespedes existentes bajo la
Doctrina de la Sindicatura Viva (spec seccion 7). Es `COVERAGE_GAPS_ASSIGNMENTS.md`
funcionando como fue disenado, y este acta lo confirma como precedente.
```

- [ ] **Step 2: Pegar la salida literal del script**

Reemplazar el comentario `<!-- PEGAR ACA ... -->` por la salida de Task 4 Step 2, dentro de un bloque de código.

Si algún ratio de la salida real difiere de los que cita la sección «Lectura honesta», **corregí la prosa para que coincida con la salida**, no al revés.

- [ ] **Step 3: Marcar el freeze como levantado en su propio documento**

En `Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md`, reemplazar la línea del encabezado:

```markdown
> **PRINCIPIO:** todo hueco identificado en la auditoría sección "Coverage Gaps" se asigna como **sub-mandato** (sección interna) de un PLAN existente. **Freeze sigue activo. Sin PLANes nuevos.**
```

por:

```markdown
> **PRINCIPIO:** todo hueco identificado en la auditoría sección "Coverage Gaps" se asigna como **sub-mandato** (sección interna) de un PLAN existente.
> **FREEZE LEVANTADO el 2026-07-26** para cuatro PLANes y sólo cuatro — ver `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`. Para todo lo demás, el principio sigue vigente: sin PLANes nuevos.
```

Y en la tabla de asignación, agregá una nota al pie que marque los tres renglones retirados (federalismo fiscal, CyT, la parte de vejez de «Discapacidad y vejez») con remisión al acta. **No borres los renglones**: el historial de por qué se asignaron es lo que hace legible el acta.

- [ ] **Step 4: Verificar coherencia entre los dos documentos**

Run: `grep -n "Freeze\|freeze\|FREEZE" "Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md"`

Expected: ninguna línea afirma que el freeze sigue activo sin calificar. La regla 5 (`Mientras el freeze esté activo, ningún sub-mandato puede ser PLAN nuevo`) sigue tal cual — es condicional, y ahora la condición está acotada por el acta.

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md" "Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md"
git commit -m "Add acta de levantamiento del freeze — cuatro PLANes nuevos habilitados

Gate de la regla 3 corrido: PLANPACTO y PLANARCO pasan limpio, PLANPREGUNTA
pasa contra dos huespedes de tres, PLANFOCO nunca tuvo huesped asignado.
El argumento independiente: el proyecto declaraba 5,45-6,25% del PBI en
pisos y la suma real es 7,82-9,41%.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Corregir la spec con lo que este tramo encontró

La spec se escribió antes de verificar el grafo línea por línea. Tres afirmaciones suyas quedaron mal.

**Files:**
- Modify: `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md` (§2.1, §2.2, §2.4)

**Interfaces:**
- Consumes: los resultados de Tasks 1–5.
- Produces: la spec corregida, que es la autoridad del tramo B.

- [ ] **Step 1: §2.1 — no son cuatro nodos mal cargados, son tres**

Reemplazar el paréntesis que dice `(...) y además está mal cargado en cuatro nodos: PLANSEG carga el neto 0,05–0,10 en vez del bruto 1,50 —divergencia de 1,42 puntos—, PLANCUIDADO 0,75–1,1 en vez de 0,45, PLANEN pierde el 0,20 del LANEF, PLANTALLER dice 0,08 y el documento 0,10)` por:

```markdown
(y además estaba mal cargado en **tres** nodos: PLANCUIDADO tenía 0,75–1,1 —que es
la inversión de régimen pleno, no el piso— en vez de 0,45; PLANEN perdía el 0,20 del
LANEF; y PLANTALLER decía 0,08 contra el 0,10 de su documento. El cuarto caso,
PLANSEG con 0,05–0,10 «neto», **no era un bug**: `PRESUPUESTO_CONSOLIDADO_BASTA.md`
nota (3) declara ese neto a propósito. El problema ahí era que el campo mezclaba
bruto y neto entre PLANes, y que la métrica se llamaba `constitutionalFloorNet`
sumando casi todo bruto. Corregido en el tramo A: el campo es siempre bruto.)
```

- [ ] **Step 2: §2.1 y §2.2 — el alto de la suma es 9,41, no 9,49**

Reemplazar **todas** las apariciones de `9,49` por `9,41`, y el punto medio `8,66%` por `8,62%`.

Run: `grep -n "9,49\|8,66" v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`
Expected: sin resultados.

El 9,49 salió de una reconciliación a mano que sumó PLANSEG dos veces; el 9,41 lo calcula `ECOSYSTEM_METRICS.constitutionalFloorGross` y lo fija el test de canon (Task 2, Step 5).

- [ ] **Step 3: §2.4 — la línea del Techo se sostiene, el total de recortes baja**

En la tabla de la Escalera de Garantías, la **LÍNEA DEL TECHO en 2,40% no se toca**: es una decisión del fundador, no un derivado. Lo que cambia es el total de recortes, porque el punto de partida bajó de 8,66 a 8,62.

Reemplazar `Hay que quitar **6,26 puntos del PBI**: de 8,66% a 2,40%.` por:

```markdown
Hay que quitar **6,22 puntos del PBI**: de 8,62% a 2,40%. (El 2,40% es la decisión;
el total de recortes es lo que se deriva de ella.)
```

Y en el párrafo de control, reemplazar `= 6,26. Cierra.` por `= 6,22. Cierra.`, ajustando el sumando de PLANMEMORIA: la reconciliación a mano lo había contado como 0,14 flat y su rango real es 0,10–0,14.

Recalculá el control a mano antes de escribirlo y verificá que `8,62 − 6,22 = 2,40` exacto.

- [ ] **Step 4: Verificar que la spec no se contradice**

Run: `grep -n "7,82\|9,41\|8,62\|6,22\|2,40" v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`
Expected: toda aparición es consistente entre sí.

- [ ] **Step 5: Commit**

```bash
git add v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md
git commit -m "docs(v2): la spec se corrige con lo que verifico el tramo A

Eran tres nodos mal cargados, no cuatro: PLANSEG guardaba el neto a
proposito. Y el alto de la suma de pisos es 9,41%, no 9,49% — el 9,49
sumaba PLANSEG dos veces.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Cierre del tramo

- [ ] **Verificación final**

Run: `cd SocialJusticeHub && npm run check && npm run test:unit && npm run check:routes`
Expected: los tres verdes.

- [ ] **Confirmar que el tramo no tocó ningún conteo de 22**

Run: `git diff --stat HEAD~6`
Expected: **no** aparecen `validation-engine.ts`, `verify-planes-index.ts`, `planes-sources.ts`, ni ningún test de conteo de PLANes. Si aparecen, algo se coló de un tramo posterior.

Al terminar: el grafo y los documentos dicen lo mismo, la suma real está calculada y fijada por un test, el acta está firmada, y la spec corregida. **El tramo B (PLANPACTO) puede empezar.**
