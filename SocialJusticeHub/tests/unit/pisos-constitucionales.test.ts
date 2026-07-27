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
