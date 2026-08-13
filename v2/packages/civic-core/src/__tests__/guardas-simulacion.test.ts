import { describe, expect, it } from 'vitest';

import { esMagnitud } from '../simulacion/procedencia.js';
import { simular } from '../simulacion/simular.js';

import type { EntradaSimulacion, Palancas, Retrato, Territorio, VozMedida } from '../simulacion/tipos.js';

/** Una voz del canon, ya leída. El motor nunca recibe un tipo plegado. */
const TIPO_BASTA: VozMedida['tipo'] = { reconocido: true, tipo: 'basta' };

/**
 * Las guardas de honestidad — spec §12.
 *
 * No son cobertura de rutina: son el contrato del §3 hecho ejecutable. Las dos
 * últimas son de CALIBRACIÓN y no de implementación: verifican que el modelo
 * produce las lecciones que la spec dice que produce. Si dejan de pasar, o
 * está mal calibrado o la lección era falsa — y las dos cosas hay que saberlas.
 */

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
  { id: 'vacio', nombre: 'Vacío', poblacion: 0, km2: 10 },
];

const PALANCAS: Palancas = {
  participacion: 200,
  dispersion: 1,
  composicion: { hecho: 1, deseo: 0, acto: 0, meta: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
};

const AHORA = 1_800_000_000_000;
const MES = 31 * 24 * 3600 * 1000;

const entrada = (over: Partial<Palancas> = {}): EntradaSimulacion => ({
  palancas: { ...PALANCAS, ...over },
  base: {
    voces: Array.from({ length: 40 }, (_, i) => ({
      territorioId: 'chico',
      tipo: TIPO_BASTA,
      fecha: AHORA - (i % 5) * MES,
    })),
    ahora: AHORA,
  },
  territorios: TERRITORIOS,
});

/** Recorre el resultado entero y junta todo número que no venga en Magnitud. */
function numerosHuerfanos(valor: unknown, ruta = ''): string[] {
  if (typeof valor === 'number') return [ruta];
  if (valor === null || typeof valor !== 'object') return [];
  if (esMagnitud(valor)) return [];
  if (valor instanceof Map) {
    return [...valor.entries()].flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${String(k)}`));
  }
  if (Array.isArray(valor)) return valor.flatMap((v, i) => numerosHuerfanos(v, `${ruta}[${i}]`));
  return Object.entries(valor).flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${k}`));
}

/** El Map no serializa; se lo pasa a array ordenado para poder comparar. */
function aComparable(r: Retrato): unknown {
  return { ...r, porTerritorio: [...r.porTerritorio.entries()].sort() };
}

describe('guardas de honestidad', () => {
  it('sin números huérfanos: todo valor numérico trae su procedencia', () => {
    expect(numerosHuerfanos(simular(entrada()), 'resultado')).toEqual([]);
  });

  it('el silencio es sordo: mover las siete palancas no lo cambia', () => {
    const referencia = JSON.stringify(aComparable(simular(entrada()).silencio));
    const variaciones: Partial<Palancas>[] = [
      { participacion: 100_000 },
      { dispersion: 0 },
      { composicion: { hecho: 0, deseo: 1, acto: 0, meta: 0 } },
      { horizonte: 50 },
      { resistencia: 1 },
      { constancia: 0 },
      { cumplimiento: 0 },
    ];
    for (const v of variaciones) {
      expect(JSON.stringify(aComparable(simular(entrada(v)).silencio))).toBe(referencia);
    }
  });

  it('sin dato, sin total: un territorio sin población no entra a ningún agregado', () => {
    const r = simular(entrada());
    expect(r.silencio.sinDato.map((s) => s.territorioId)).toContain('vacio');
    expect(r.voz.porTerritorio.has('vacio')).toBe(false);
    expect(r.diferencia.porTerritorio.has('vacio')).toBe(false);
  });

  it('CALIBRACIÓN: el que sostiene le gana al que grita en legitimidad', () => {
    const grita = simular(entrada({ participacion: 5000, constancia: 0 })).voz;
    const sostiene = simular(entrada({ participacion: 500, constancia: 1 })).voz;
    expect(sostiene.legitimidad.valor).toBeGreaterThan(grita.legitimidad.valor);
  });

  it('CALIBRACIÓN: contra la resistencia, la voz es lo único que gana en todos lados', () => {
    const bloqueado = simular(entrada({ resistencia: 1 })).voz;
    expect(bloqueado.alcance.valor).toBe(0);

    // Subir la voz recupera el mandato, y lo recupera donde vive la mayoría.
    const conMasVoz = simular(entrada({ resistencia: 1, participacion: 2000 })).voz;
    expect(conMasVoz.porTerritorio.get('grande')?.veredicto.hay).toBe(true);
    expect(conMasVoz.alcance.valor).toBeGreaterThan(0.5);

    // Constancia, horizonte y cumplimiento por sí solos no mueven nada: no
    // tocan el piso ni el conteo.
    for (const sola of [{ constancia: 1 }, { horizonte: 50 }, { cumplimiento: 1 }]) {
      expect(simular(entrada({ resistencia: 1, ...sola })).voz.alcance.valor).toBe(0);
    }
  });

  it('CALIBRACIÓN: concentrar también rompe el bloqueo, pero deja el país mudo', () => {
    // La excepción honesta a la regla de arriba, y vale la pena que el motor
    // la enseñe: amontonar todas las voces en un solo territorio cruza el piso
    // ahí aunque haya bloqueo total. El precio es que el resto queda sin nada.
    const concentrado = simular(entrada({ resistencia: 1, dispersion: 0 })).voz;
    expect(concentrado.porTerritorio.get('chico')?.veredicto.hay).toBe(true);
    expect(concentrado.porTerritorio.get('grande')?.veredicto.hay).toBe(false);
    expect(concentrado.alcance.valor).toBeLessThan(0.5);
    expect(concentrado.cobertura.valor).toBeLessThan(0.6);
  });
});
