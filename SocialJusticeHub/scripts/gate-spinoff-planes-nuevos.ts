/**
 * One-shot: corre la regla 3 de COVERAGE_GAPS_ASSIGNMENTS.md para los cuatro
 * PLANes nuevos de la spec 2026-07-26.
 *
 * Run: npx tsx scripts/gate-spinoff-planes-nuevos.ts
 *
 * ATENCIÓN — este script mide UN sub-criterio, no la regla entera. La regla 3
 * completa (`COVERAGE_GAPS_ASSIGNMENTS.md:39`) dice: «Si un sub-mandato crece más
 * allá de cierto tamaño (≥ 1.5x del PLAN huésped en presupuesto), gateo de spin-off
 * al cierre de tranche — pero nunca antes y nunca sin auditoría externa firmada.»
 * Son tres condiciones: umbral de tamaño, cierre de tranche y auditoría externa
 * firmada. Acá se calcula sólo la primera, así que un `PASA` de esta salida
 * significa «supera el umbral de tamaño», NO «cumple la regla 3». El primer tranche
 * corre de 2026-05 a 2028-05 (`PRIMER_TRANCHE_24M.md`): a la fecha del acta que
 * publica esta salida, la puerta procedimental no estaba abierta para nadie.
 *
 * El umbral se calcula bajo/bajo y alto/alto: comparar bajo contra alto mezcla
 * escenarios distintos y da ratios sin sentido.
 */
import { PLAN_NODES } from '../shared/arquitecto-data';

/** Presupuestos de los cuatro nuevos, en USD millones a 15 años (spec sección 1). */
const NUEVOS = [
  { code: 'PLANPACTO', low: 12_400, high: 22_000, huespedes: ['PLANREP'] },
  { code: 'PLANARCO', low: 53_000, high: 96_000, huespedes: ['PLANCUIDADO', 'PLANSAL'] },
  { code: 'PLANPREGUNTA', low: 16_500, high: 26_000, huespedes: ['PLANEDU', 'PLANEB', 'PLANDIG'] },
  { code: 'PLANFOCO', low: 3_000, high: 5_000, huespedes: [] },
];

const UMBRAL = 1.5;

function main(): void {
  for (const nuevo of NUEVOS) {
    if (nuevo.huespedes.length === 0) {
      console.log(
        `${nuevo.code}: SIN HUÉSPED. COVERAGE_GAPS_ASSIGNMENTS.md nunca le asignó uno, ` +
          `así que la regla 3 no aplica: no fue sub-mandato de nadie.`,
      );
      continue;
    }

    for (const id of nuevo.huespedes) {
      const h = PLAN_NODES.find((p) => p.id === id);
      if (!h) throw new Error(`${nuevo.code}: huésped ${id} no está en PLAN_NODES`);
      const rBajo = h.budgetLow === 0 ? Infinity : nuevo.low / h.budgetLow;
      const rAlto = h.budgetHigh === 0 ? Infinity : nuevo.high / h.budgetHigh;
      const pasa = rBajo >= UMBRAL && rAlto >= UMBRAL;
      console.log(
        `${nuevo.code} vs ${id}: ${rBajo.toFixed(2)}x-${rAlto.toFixed(2)}x ` +
          `(huésped ${h.budgetLow}-${h.budgetHigh} USD MM) -> ${pasa ? 'PASA' : 'NO PASA'}`,
      );
    }

    // Con varios huéspedes, la lectura conservadora es contra la suma.
    if (nuevo.huespedes.length > 1) {
      const sumLow = nuevo.huespedes.reduce(
        (s, id) => s + (PLAN_NODES.find((p) => p.id === id)?.budgetLow ?? 0), 0);
      const sumHigh = nuevo.huespedes.reduce(
        (s, id) => s + (PLAN_NODES.find((p) => p.id === id)?.budgetHigh ?? 0), 0);
      const rBajo = sumLow === 0 ? Infinity : nuevo.low / sumLow;
      const rAlto = sumHigh === 0 ? Infinity : nuevo.high / sumHigh;
      console.log(
        `${nuevo.code} vs los ${nuevo.huespedes.length} huéspedes sumados: ` +
          `${rBajo.toFixed(2)}x-${rAlto.toFixed(2)}x -> ` +
          `${rBajo >= UMBRAL && rAlto >= UMBRAL ? 'PASA' : 'NO PASA'}`,
      );
    }
  }
}

main();
