import { describe, it, expect } from 'vitest';
import { PLAN_NODES, ECOSYSTEM_METRICS } from '../../shared/arquitecto-data';
import { runValidationsByCategory } from '../../shared/validation-engine';

/**
 * Canon de los pisos constitucionales.
 *
 * ALCANCE — este test fija el grafo contra una **transcripción humana** del taller,
 * no contra el taller mismo. Las tablas de acá abajo son esa transcripción. Si
 * alguien edita un piso en un documento de `Iniciativas Estratégicas/`, este test
 * sigue verde: lo que detecta es el drift del grafo respecto de la transcripción,
 * y para eso la transcripción tiene que re-verificarse a mano contra el taller.
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
  /**
   * PLANPACTO es el único piso SUSTITUTIVO: su 2,40% reemplaza a los diecisiete de
   * arriba en vez de sumarse a ellos. `sumConstitutionalFloorsGross()` lo excluye a
   * propósito (`PISOS_SUSTITUTIVOS` en arquitecto-data.ts) — sumarlo daría
   * 10,22-11,81%, que es exactamente la lectura aditiva que ese PLAN existe para
   * impedir, y es lo que este grafo empezó a computar solo el día que se cargó el nodo.
   */
  PLANPACTO: { floor: '2.40% PBI', fuente: 'PLANPACTO §2.3: 7,5% del gasto primario consolidado ~ 2,40% del PBI. BRUTO y SUSTITUTIVO' },
};

/**
 * Los PLANes que por diseño no tienen piso. PLANCUL no lo tiene por filosofía.
 *
 * Los tres nuevos de 2026-08 tampoco, y cada uno por su razón escrita:
 * PLANARCO entra como eje intergeneracional DENTRO de la Escalera de PLANPACTO en
 * vez de tener instrumento paralelo; PLANPREGUNTA se financia con ocho puntos del
 * FSC de PLANTER y renuncia expresamente al 0,39% de CyT y al 0,20% del LANEF;
 * PLANFOCO difiere su piso a Visión 2040+ y su techo lo fija la pauta que extingue.
 */
const SIN_PISO = [
  'PLANREP', 'PLANMON', 'PLAN24CN', 'PLANGEO', 'PLANCUL',
  'PLANARCO', 'PLANPREGUNTA', 'PLANFOCO',
];

/**
 * Presupuestos de los seis PLANes huésped que consume el gate de spin-off
 * (`scripts/gate-spinoff-planes-nuevos.ts`), en USD millones.
 *
 * **El acta del 2026-07-26 depende de estos números.**
 * `Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md` publica la
 * salida del gate como evidencia y razona sobre ella — en particular que PLANARCO
 * queda a tres centésimas del umbral (1,47x contra 1,5) midiendo contra
 * PLANCUIDADO + PLANSAL sumados. Bajar `PLANCUIDADO.budgetLow` de 30.000 a 29.333
 * da vuelta ese resultado y vuelve falsa la sección más honesta del acta. Sin esta
 * tabla, eso pasaba sin que fallara un solo test.
 *
 * Si un presupuesto cambia con fundamento, hay que actualizar acá, volver a correr
 * el gate y revisar el acta — en ese orden.
 */
const PRESUPUESTOS_QUE_EL_GATE_CONSUME: Record<string, { low: number; high: number }> = {
  PLANREP: { low: 2_200, high: 4_200 },
  PLANCUIDADO: { low: 30_000, high: 45_000 },
  PLANSAL: { low: 6_000, high: 6_000 },
  PLANEDU: { low: 80_000, high: 100_000 },
  PLANEB: { low: 500, high: 600 },
  PLANDIG: { low: 4_700, high: 9_900 },
};

describe('pisos constitucionales (canon contra el taller)', () => {
  it('cada piso del grafo coincide con el documento de su PLAN', () => {
    for (const [id, esperado] of Object.entries(PISOS_SEGUN_EL_TALLER)) {
      const nodo = PLAN_NODES.find((p) => p.id === id);
      expect(nodo, `${id}: no está en PLAN_NODES`).toBeDefined();
      expect(nodo?.constitutionalFloor, `${id}: el grafo discrepa del taller (${esperado.fuente})`).toBe(
        esperado.floor,
      );
    }
  });

  it('los PLANes sin piso siguen sin piso', () => {
    for (const id of SIN_PISO) {
      const nodo = PLAN_NODES.find((p) => p.id === id);
      expect(nodo?.constitutionalFloor, `${id}: le apareció un piso`).toBeNull();
    }
  });

  it('la tabla cubre a los 26: con piso + sin piso = PLAN_NODES', () => {
    const cubiertos = new Set([...Object.keys(PISOS_SEGUN_EL_TALLER), ...SIN_PISO]);
    expect(cubiertos.size).toBe(PLAN_NODES.length);
    for (const p of PLAN_NODES) {
      expect(cubiertos.has(p.id), `${p.id}: no está ni en la tabla ni en SIN_PISO`).toBe(true);
    }
  });

  it('ningún piso mezcla bruto con neto: el campo es siempre bruto', () => {
    for (const p of PLAN_NODES) {
      if (!p.constitutionalFloor) continue;
      expect(
        p.constitutionalFloor.toLowerCase(),
        `${p.id}: el campo dice «neto». El piso es la obligación legal bruta.`,
      ).not.toContain('neto');
    }
  });

  it('el formato es «bajo-alto% PBI» o «único% PBI»: nunca dos pisos sueltos', () => {
    // sumConstitutionalFloorsGross lee nums[0] como bajo y nums[1] como alto. Un piso
    // compuesto («0.50% + 0.20%») se leería como rango 0,50-0,20 y daria alto < bajo.
    for (const p of PLAN_NODES) {
      if (!p.constitutionalFloor) continue;
      const nums = p.constitutionalFloor.match(/\d+(?:\.\d+)?/g) ?? [];
      expect(nums.length, `${p.id}: se esperaban 1 o 2 números`).toBeLessThanOrEqual(2);
      if (nums.length === 2) {
        expect(Number(nums[1]), `${p.id}: el alto es menor que el bajo`).toBeGreaterThanOrEqual(
          Number(nums[0]),
        );
      }
    }
  });

  it('el piso EFECTIVO después de la sustitución es el 2,40% de PLANPACTO y nada más', () => {
    // Si esto diera 10.22-11.81, el grafo estaría sumando el piso sustitutivo a los
    // que sustituye: la lectura aditiva que PLANPACTO §2.3 declara ilegítima.
    expect(ECOSYSTEM_METRICS.constitutionalFloorEffective).toBe('2.40-2.40% PBI');
  });

  it('la suma de los pisos RECLAMADOS sigue siendo 7.82-9.41% del PBI', () => {
    // Es el hallazgo que funda a PLANPACTO: lo que el ecosistema pedía sin saberlo.
    // No cambia al sustituir — la cuenta de la que se viene no se borra.
    expect(ECOSYSTEM_METRICS.constitutionalFloorGross).toBe('7.82-9.41% PBI');
  });

  /**
   * D-013. La regla V-FIN-05 tiene su propia suma de pisos, separada de la de
   * `arquitecto-data.ts`, y no se enteró de la sustitución: sumaba el 2,40% de
   * PLANPACTO **encima** de los 9,41% que ese mismo piso reemplaza y avisaba
   * 11,81%, que no es ninguna cantidad real. Es la lectura aditiva que el PLAN
   * existe para impedir, publicada por el tablero del propio proyecto.
   *
   * **Cuál de las dos cifras vigila la regla, y por qué el bruto.** El efectivo
   * (2,40%) es lo que el ecosistema se compromete a gastar, y por diseño no va a
   * moverse: vigilarlo sería poner un guardia en una puerta tapiada. El bruto es
   * lo que los PLANes **reclaman uno por uno**, así que crece el día que alguien
   * escribe un piso nuevo — que es exactamente el evento que esta regla existe
   * para ver. Se vigila el bruto, y el mensaje nombra el efectivo al lado para
   * que nadie vuelva a leer el aviso como si fuera deuda comprometida.
   */
  it('V-FIN-05 no suma el piso sustitutivo a los pisos que sustituye', () => {
    const avisos = runValidationsByCategory('FIN').filter((r) => r.ruleId === 'V-FIN-05');
    // 9,41% en el extremo alto está por debajo del umbral de 10: la regla calla.
    // Si vuelve a sumar PLANPACTO da 11,81 y avisa — y eso es el bug, no el aviso.
    expect(avisos.map((a) => a.message)).toEqual([]);
  });

  it('los presupuestos que el gate de spin-off consume no se movieron', () => {
    for (const [id, esperado] of Object.entries(PRESUPUESTOS_QUE_EL_GATE_CONSUME)) {
      const nodo = PLAN_NODES.find((p) => p.id === id);
      expect(nodo, `${id}: no está en PLAN_NODES`).toBeDefined();
      expect(
        nodo?.budgetLow,
        `${id}: cambió budgetLow. El acta del 2026-07-26 razona sobre este número: re-corré el gate y revisá el acta.`,
      ).toBe(esperado.low);
      expect(
        nodo?.budgetHigh,
        `${id}: cambió budgetHigh. El acta del 2026-07-26 razona sobre este número: re-corré el gate y revisá el acta.`,
      ).toBe(esperado.high);
    }
  });
});
