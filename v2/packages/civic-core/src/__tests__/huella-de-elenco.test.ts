import { describe, expect, it } from 'vitest';

import { TIPOS_SENAL } from '../senal/vocabulario.js';
import { congelarElenco } from '../simulacion/elenco.js';
import { huellaDePoblacion } from '../simulacion/poblacion.js';

import type { TipoSenal } from '../senal/vocabulario.js';
import type { Conducta, Persona } from '../simulacion/poblacion.js';
import type { Territorio } from '../simulacion/tipos.js';

/**
 * La huella del elenco no puede depender del orden de las claves.
 *
 * El caso real, y no uno inventado: `mezcla_tipos` se guarda en `jsonb`, y
 * `jsonb` **no conserva el orden de inserción** — reordena por (longitud en
 * bytes, después bytes). Entra
 * `basta, necesidad, recurso, práctica, saber, sueño, propuesta, compromiso, pregunta`
 * y sale
 * `basta, saber, sueño, recurso, pregunta, necesidad, propuesta, práctica, compromiso`.
 *
 * Con la huella hasheando `Object.entries()` —o sea el orden de inserción— un
 * elenco escrito en la base y leído de vuelta **pierde su identidad**:
 * `congelarElenco` calcula otra huella sobre exactamente la misma conducta, y
 * el worker aborta con «Alguien editó el archivo» sobre un elenco que nadie
 * tocó. El mismo daño lo hace cualquier ida y vuelta que reordene claves: un
 * `.json` reescrito por otra herramienta, un `structuredClone` de otro motor.
 *
 * Por eso la huella se toma en el orden canónico de `TIPOS_SENAL`, y esto lo
 * verifica con las claves desordenadas a propósito.
 */

const TERRITORIOS: readonly Territorio[] = [
  { id: 'Alfa', nombre: 'Alfa', poblacion: 400_000, km2: 100 },
  { id: 'Beta', nombre: 'Beta', poblacion: 200_000, km2: 100 },
];

/** El orden exacto en que Postgres devuelve las nueve claves desde `jsonb`. */
const ORDEN_JSONB: readonly TipoSenal[] = [
  'basta',
  'saber',
  'sueño',
  'recurso',
  'pregunta',
  'necesidad',
  'propuesta',
  'práctica',
  'compromiso',
];

/**
 * Pesos distintos para cada tipo, a propósito: con los nueve iguales el orden
 * no podría notarse y el test pasaría sin probar nada.
 */
const PESO_DE_TIPO: Readonly<Record<TipoSenal, number>> = {
  basta: 0.31,
  necesidad: 0.17,
  recurso: 0.13,
  práctica: 0.11,
  saber: 0.09,
  sueño: 0.07,
  propuesta: 0.05,
  compromiso: 0.04,
  pregunta: 0.03,
};

/** La misma mezcla, insertada en el orden que se pida. */
function mezclaEnOrden(orden: readonly TipoSenal[]): Record<TipoSenal, number> {
  const mezcla = {} as Record<TipoSenal, number>;
  for (const tipo of orden) mezcla[tipo] = PESO_DE_TIPO[tipo];
  return mezcla;
}

const conducta = (mezclaTipos: Record<TipoSenal, number>): Conducta => ({
  propension: 0.4,
  constanciaPersonal: 0.6,
  umbralAdhesion: 0.15,
  umbralCorroboracion: 0.25,
  radioAtencion: 'barrio',
  mezclaTipos,
  vinculos: [1],
});

function personas(orden: readonly TipoSenal[]): Persona[] {
  return [0, 1].map((i) => ({
    id: i,
    origen: { documento: 'planes/PLANAGUA.mdx', ancla: 'El problema', sha: 'aaaaaaaaaaaa' },
    territorio: {
      territorioId: i === 0 ? 'Alfa' : 'Beta',
      provinciaId: 6,
      departamentoId: null,
      localidadId: null,
      celdaId: `celda-${String(i)}`,
    },
    conducta: conducta(mezclaEnOrden(orden)),
    semblanza: {
      texto: `Persona fabricada ${String(i)}.`,
      oficio: 'docente',
      tramoEdad: '35-44',
      arraigoAnios: 10,
      frases: [],
    },
  }));
}

describe('GUARDA: la huella del elenco no depende del orden de las claves', () => {
  it('la mezcla en orden canónico y la que devuelve `jsonb` dan la MISMA huella', () => {
    // Las dos listas son las mismas nueve claves con los mismos nueve valores.
    expect([...ORDEN_JSONB].sort()).toEqual([...TIPOS_SENAL].sort());

    const canonica = huellaDePoblacion(personas(TIPOS_SENAL));
    const desdeLaBase = huellaDePoblacion(personas(ORDEN_JSONB));

    expect(desdeLaBase).toBe(canonica);
  });

  it('ningún reordenamiento de las nueve claves mueve la huella', () => {
    const canonica = huellaDePoblacion(personas(TIPOS_SENAL));
    // Nueve rotaciones y el orden invertido: cubre el borde y el medio.
    for (let corte = 0; corte < TIPOS_SENAL.length; corte += 1) {
      const rotado = [...TIPOS_SENAL.slice(corte), ...TIPOS_SENAL.slice(0, corte)];
      expect(huellaDePoblacion(personas(rotado)), `rotación ${String(corte)}`).toBe(canonica);
    }
    expect(huellaDePoblacion(personas([...TIPOS_SENAL].reverse()))).toBe(canonica);
  });

  it('pero cambiar un PESO sí mueve la huella: no se volvió ciega', () => {
    const canonica = huellaDePoblacion(personas(TIPOS_SENAL));
    const otras = personas(TIPOS_SENAL);
    const primera = otras[0];
    expect(primera).toBeDefined();
    if (primera === undefined) return;
    const movida: Persona = {
      ...primera,
      conducta: {
        ...primera.conducta,
        mezclaTipos: { ...primera.conducta.mezclaTipos, basta: 0.32 },
      },
    };
    expect(huellaDePoblacion([movida, ...otras.slice(1)])).not.toBe(canonica);
  });

  it('el elenco congelado sobrevive la ida y vuelta por la base', () => {
    // Lo que hace el worker: congelar de este lado y contrastar contra la
    // huella declarada. Con la huella dependiendo del orden de inserción, esto
    // tiraba «Alguien editó el archivo» sobre un elenco que nadie tocó.
    const escrito = congelarElenco(
      { personas: personas(TIPOS_SENAL), padre: null, sello: null, corpus: [] },
      TERRITORIOS,
    );
    const leidoDeLaBase = congelarElenco(
      { personas: personas(ORDEN_JSONB), padre: null, sello: null, corpus: [] },
      TERRITORIOS,
    );

    expect(leidoDeLaBase.poblacion.huella).toBe(escrito.poblacion.huella);
  });
});
