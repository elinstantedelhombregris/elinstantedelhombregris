/**
 * El elenco en disco — cómo se guarda y cómo se vuelve a leer.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.9.
 *
 * ## Tres archivos, y cada uno tiene su motivo
 *
 * - `manifiesto.json` — modelo, digest, semilla, huella, N, sesgo y fecha. Es
 *   lo que se lee para saber qué es este elenco sin cargarlo.
 * - `conducta.json` — lo único que la dinámica lee. Un elenco de mil personas
 *   entra en ~47 KB, así que puede viajar entero al navegador.
 * - `semblanzas-<n>.json` — la textura, en shards de 100. **La dinámica no
 *   necesita el texto**, así que se piden bajo demanda y no tocan el
 *   presupuesto del bundle. Es toda la razón de que `Conducta` y `Semblanza`
 *   estén separadas.
 *
 * ## La huella es el nombre del directorio
 *
 * No una fecha ni un número de versión: la huella. Dos elencos con la misma
 * conducta **son** el mismo elenco para un barrido, y con este nombre eso es
 * visible en el `ls`. Al leer se recalcula y se contrasta: si el contenido no
 * da la huella que dice el directorio, no se corre.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { congelarElenco, verificarHuella } from '../../packages/civic-core/src/simulacion/elenco.js';

import type { Elenco } from '../../packages/civic-core/src/simulacion/elenco.js';
import type { Persona, Semblanza } from '../../packages/civic-core/src/simulacion/poblacion.js';
import type { Territorio } from '../../packages/civic-core/src/simulacion/tipos.js';

export const PERSONAS_POR_SHARD = 100;

export interface NotasDeGeneracion {
  readonly escritor: string;
  readonly semilla: number;
  readonly grado: number;
}

/** Lo que se escribe arriba de todo, y lo que se lee primero. */
export interface Manifiesto {
  readonly huella: string;
  readonly personas: number;
  readonly padre: string | null;
  readonly sello: Elenco['sello'];
  readonly notas: NotasDeGeneracion;
  readonly sesgo: Elenco['sesgo'];
}

/** Guarda el elenco. Devuelve el directorio, que se llama como la huella. */
export function escribirElencoADisco(
  elenco: Elenco,
  raiz: string,
  notas: NotasDeGeneracion,
): string {
  const destino = join(raiz, elenco.poblacion.huella);
  mkdirSync(destino, { recursive: true });

  const manifiesto: Manifiesto = {
    huella: elenco.poblacion.huella,
    personas: elenco.poblacion.personas.length,
    padre: elenco.poblacion.padre,
    sello: elenco.sello,
    notas,
    sesgo: elenco.sesgo,
  };
  writeFileSync(join(destino, 'manifiesto.json'), `${JSON.stringify(manifiesto, null, 2)}\n`);

  const conducta = elenco.poblacion.personas.map((p) => ({
    id: p.id,
    origen: p.origen,
    territorio: p.territorio,
    conducta: p.conducta,
  }));
  writeFileSync(join(destino, 'conducta.json'), `${JSON.stringify(conducta)}\n`);

  for (let desde = 0; desde < elenco.poblacion.personas.length; desde += PERSONAS_POR_SHARD) {
    const shard = elenco.poblacion.personas
      .slice(desde, desde + PERSONAS_POR_SHARD)
      .map((p) => ({ id: p.id, semblanza: p.semblanza }));
    const numero = String(Math.floor(desde / PERSONAS_POR_SHARD)).padStart(3, '0');
    writeFileSync(join(destino, `semblanzas-${numero}.json`), `${JSON.stringify(shard)}\n`);
  }

  return destino;
}

interface FilaDeConducta {
  id: number;
  origen: Persona['origen'];
  territorio: Persona['territorio'];
  conducta: Persona['conducta'];
}

/**
 * Lee un elenco del disco y lo vuelve a congelar.
 *
 * Pasa por `congelarElenco` como cualquier otro: **no hay un camino que
 * produzca un `Elenco` sin verificar**. Y antes recalcula la huella y la
 * contrasta con la que declara el manifiesto — si alguien editó un JSON a
 * mano, o si el escritor cambió de versión, correr igual produciría
 * resultados que dicen la misma etiqueta y no son comparables con los de ayer.
 */
export function leerElencoDeDisco(directorio: string, territorios: readonly Territorio[]): Elenco {
  const manifiesto = JSON.parse(
    readFileSync(join(directorio, 'manifiesto.json'), 'utf8'),
  ) as Manifiesto;
  const conducta = JSON.parse(
    readFileSync(join(directorio, 'conducta.json'), 'utf8'),
  ) as FilaDeConducta[];

  const semblanzas = new Map<number, Semblanza>();
  for (const archivo of readdirSync(directorio).filter((a) => a.startsWith('semblanzas-'))) {
    const shard = JSON.parse(readFileSync(join(directorio, archivo), 'utf8')) as {
      id: number;
      semblanza: Semblanza;
    }[];
    for (const fila of shard) semblanzas.set(fila.id, fila.semblanza);
  }

  const personas: Persona[] = conducta.map((fila): Persona => {
    const semblanza = semblanzas.get(fila.id);
    if (semblanza === undefined) {
      throw new Error(
        `La persona ${String(fila.id)} del elenco ${manifiesto.huella} no tiene semblanza en ` +
          'ningún shard. Falta un archivo: no se arma un elenco a medias, porque la ficha de ' +
          'esa persona quedaría vacía sin que nada avise.',
      );
    }
    return {
      id: fila.id,
      origen: fila.origen,
      territorio: fila.territorio,
      conducta: fila.conducta,
      semblanza,
    };
  });

  verificarHuella(personas, manifiesto.huella);

  const sello =
    manifiesto.sello === null
      ? null
      : {
          modelo: manifiesto.sello.modelo,
          digest: manifiesto.sello.digest,
          temperatura: manifiesto.sello.temperatura,
          semilla: manifiesto.sello.semilla,
          generadaEn: manifiesto.sello.generadaEn,
        };

  return congelarElenco(
    {
      personas,
      padre: manifiesto.padre,
      sello,
      corpus: manifiesto.sesgo.corpus,
    },
    territorios,
  );
}
