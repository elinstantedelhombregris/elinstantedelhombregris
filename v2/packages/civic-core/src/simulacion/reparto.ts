import type { Territorio } from './tipos.js';

/**
 * Repartir un total de voces entre territorios — spec §5.2.
 *
 * `dispersion` interpola entre dos distribuciones: la concentrada (todo donde
 * ya se habla más) y la proporcional a la población. Es una operación
 * DECLARADA, no un supuesto sobre el mundo: no afirma que la gente se reparte
 * así, afirma que se pidió esa mezcla.
 */

/** Peso de cada territorio en la distribución concentrada. */
function pesosConcentrado(
  territorios: readonly Territorio[],
  vocesBase: ReadonlyMap<string, number>,
): Map<string, number> {
  const elegido = [...territorios].sort((a, b) => {
    const porVoces = (vocesBase.get(b.id) ?? 0) - (vocesBase.get(a.id) ?? 0);
    if (porVoces !== 0) return porVoces;
    const porPoblacion = b.poblacion - a.poblacion;
    if (porPoblacion !== 0) return porPoblacion;
    return a.id < b.id ? -1 : 1;
  })[0];
  return new Map(territorios.map((t) => [t.id, t.id === elegido?.id ? 1 : 0]));
}

/** Peso de cada territorio en la distribución proporcional. */
function pesosProporcional(territorios: readonly Territorio[]): Map<string, number> {
  const total = territorios.reduce((suma, t) => suma + Math.max(0, t.poblacion), 0);
  if (total <= 0) {
    const parejo = territorios.length === 0 ? 0 : 1 / territorios.length;
    return new Map(territorios.map((t) => [t.id, parejo]));
  }
  return new Map(territorios.map((t) => [t.id, Math.max(0, t.poblacion) / total]));
}

/**
 * Reparte enteros con el método del resto mayor: el piso de cada cociente y
 * las unidades sobrantes a los restos más grandes. Garantiza que la suma es
 * exactamente `total` — un reparto que no cierra invalida cualquier lectura.
 */
function repartirEnteros(total: number, pesos: ReadonlyMap<string, number>): Map<string, number> {
  const exactos = [...pesos.entries()].map(([id, peso]) => ({ id, exacto: total * peso }));
  const salida = new Map(exactos.map(({ id, exacto }) => [id, Math.floor(exacto)]));
  const asignado = [...salida.values()].reduce((a, b) => a + b, 0);

  const sobrantes = [...exactos]
    .sort((a, b) => {
      const porResto = b.exacto - Math.floor(b.exacto) - (a.exacto - Math.floor(a.exacto));
      return porResto !== 0 ? porResto : a.id < b.id ? -1 : 1;
    })
    .slice(0, Math.max(0, Math.round(total) - asignado));

  for (const { id } of sobrantes) salida.set(id, (salida.get(id) ?? 0) + 1);
  return salida;
}

export function repartir(
  total: number,
  territorios: readonly Territorio[],
  dispersion: number,
  vocesBase: ReadonlyMap<string, number>,
): Map<string, number> {
  const mezcla = Math.min(1, Math.max(0, dispersion));
  const concentrado = pesosConcentrado(territorios, vocesBase);
  const proporcional = pesosProporcional(territorios);
  const pesos = new Map(
    territorios.map((t) => [
      t.id,
      (1 - mezcla) * (concentrado.get(t.id) ?? 0) + mezcla * (proporcional.get(t.id) ?? 0),
    ]),
  );
  return repartirEnteros(Math.max(0, total), pesos);
}
