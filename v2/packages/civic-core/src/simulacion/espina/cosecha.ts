/**
 * La cosecha — spec §2.3 y §3.3.
 *
 * Los dos modos devuelven celdas `(territorioId, periodo, clase)`. Que lleve el
 * **período** —y no sólo el territorio, como hoy— es la decisión estructural
 * del módulo, y resuelve cuatro cosas de una:
 *
 * 1. `sostenidos` deja de ser un parámetro y pasa a ser **derivable**: son los
 *    períodos con voces. Hoy el lado medido lo deriva y el simulado lo impone
 *    parejo a todos los territorios; con la cosecha los dos lo derivan igual.
 * 2. Es la forma natural de lo que produce una corrida de agentes —la persona
 *    412 habló en la ronda 7 en Chaco—, así que no hace falta ningún adaptador.
 * 3. Arregla `persistencia`, que era un máximo sobre territorios.
 * 4. Mata el `RangeError` del spread, porque el pliegue pasa a ser un `for` con
 *    acumulador. No es teórico: el techo medido está en ~110.000 valores y una
 *    función de 10.000 personas × 120 rondas emite 415.645 señales.
 *
 * La cosecha es **transitoria**: se produce, se reduce a `Corrida` y se tira.
 * Con 2.082 municipios × 24 períodos × 4 clases serían ~200.000 celdas, y
 * guardar mil de ésas es exactamente lo que hace inviable un barrido (×148
 * medido). El retrato completo se rehidrata bajo demanda para la única corrida
 * que la persona abre: recalcularlo cuesta menos que guardarlo.
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';

import { acumularHuella, huellaHex, SEMILLA_FNV } from './azar.js';

import type { ClaseSenal } from '../../senal/vocabulario.js';
import type { Poblacion } from '../poblacion.js';
import type { Escenario, Pais } from './escenario.js';

export interface CeldaDeCosecha {
  readonly territorioId: string;
  /** 0 = el más viejo de la ventana. */
  readonly periodo: number;
  readonly clase: ClaseSenal;
  readonly voces: number;
  /** Actores DISTINTOS. El brillo cuenta personas, no filas (regla 8). */
  readonly actores: number;
  /**
   * Señales sin actor conocido. Sin esto, `actores: 0` miente diciendo «no sé»:
   * un generador que siempre asigna actor no puede reproducir el estado de
   * celda `sin_actor_conocido`, y hace que todo barrido sea sistemáticamente
   * optimista sobre la nitidez.
   */
  readonly sinActor: number;
}

export interface Cosecha {
  /** Rala, plana y ordenada: transferible sin serializar Maps. */
  readonly celdas: readonly CeldaDeCosecha[];
  readonly periodos: number;
  /**
   * `declarada` cuando la produjo una fórmula a la vista; `hipotesis` cuando la
   * produjo una población escrita por un modelo. Es lo que decide si las
   * magnitudes del retrato salen selladas.
   */
  readonly autoridad: 'declarada' | 'hipotesis';
}

/**
 * Un modo **no** es una implementación de `simular()`: es una función que
 * produce una cosecha. Todo lo que viene después —mandato, retrato,
 * procedencia, cobertura, barrido, cortina— es uno solo y no sabe qué modo lo
 * produjo. Ésa es la espina, y es lo que hace que esto sea un módulo y no dos
 * programas que comparten carpeta.
 */
export type Modo = (esc: Escenario, pais: Pais, pob: Poblacion | null) => Cosecha;

const ORDEN_DE_CLASE = new Map(CLASES_SENAL.map((c, i) => [c, i]));

/**
 * El separador es NUL escapado y no un espacio: un `territorioId` es el nombre
 * canónico de la provincia y «Buenos Aires» tiene uno adentro. Con un espacio,
 * dos celdas distintas podrían compartir clave, y el bug sería un conteo mal
 * sumado sin ningún error a la vista. Los campos se guardan en el acumulado y
 * no se vuelven a parsear de la clave: es la otra mitad del mismo cuidado.
 */
const clave = (territorioId: string, periodo: number, clase: ClaseSenal): string =>
  `${territorioId}\u0000${String(periodo)}\u0000${clase}`;

interface Acumulado {
  readonly territorioId: string;
  readonly periodo: number;
  readonly clase: ClaseSenal;
  voces: number;
  actores: number;
  sinActor: number;
}

/**
 * El acumulador. Existe para que las dos dinámicas —la que reparte enteros y la
 * que cuenta lo que hizo cada persona— escriban en la misma estructura y
 * salgan con el mismo orden canónico, que es lo que hace comparable una huella
 * de cosecha con otra.
 */
export class ConstructorDeCosecha {
  readonly #celdas = new Map<string, Acumulado>();

  sumar(
    territorioId: string,
    periodo: number,
    clase: ClaseSenal,
    voces: number,
    actores: number,
    sinActor: number,
  ): void {
    if (voces === 0 && actores === 0 && sinActor === 0) return;
    const k = clave(territorioId, periodo, clase);
    const previo = this.#celdas.get(k);
    if (previo === undefined) {
      this.#celdas.set(k, { territorioId, periodo, clase, voces, actores, sinActor });
      return;
    }
    previo.voces += voces;
    previo.actores += actores;
    previo.sinActor += sinActor;
  }

  cerrar(periodos: number, autoridad: 'declarada' | 'hipotesis'): Cosecha {
    const celdas: CeldaDeCosecha[] = [];
    for (const a of this.#celdas.values()) {
      celdas.push({
        territorioId: a.territorioId,
        periodo: a.periodo,
        clase: a.clase,
        voces: a.voces,
        actores: a.actores,
        sinActor: a.sinActor,
      });
    }
    celdas.sort(compararCeldas);
    return { celdas, periodos: Math.max(1, Math.round(periodos)), autoridad };
  }
}

/**
 * El orden canónico de las celdas. Se exporta porque las dos dinámicas ordenan
 * con ella: si cada una eligiera el suyo, dos cosechas iguales tendrían huellas
 * distintas y el barrido compararía corridas que creería incomparables.
 */
export function compararCeldas(a: CeldaDeCosecha, b: CeldaDeCosecha): number {
  if (a.territorioId !== b.territorioId) return a.territorioId < b.territorioId ? -1 : 1;
  if (a.periodo !== b.periodo) return a.periodo - b.periodo;
  return (ORDEN_DE_CLASE.get(a.clase) ?? 0) - (ORDEN_DE_CLASE.get(b.clase) ?? 0);
}

// ---------------------------------------------------------------------------
// Los pliegues. Todos con `for` y acumulador: ni un spread sobre las celdas.
// ---------------------------------------------------------------------------

export function totalDeVoces(cosecha: Cosecha): number {
  let total = 0;
  for (const c of cosecha.celdas) total += c.voces;
  return total;
}

export function vocesPorTerritorio(cosecha: Cosecha): Map<string, number> {
  const salida = new Map<string, number>();
  for (const c of cosecha.celdas) {
    salida.set(c.territorioId, (salida.get(c.territorioId) ?? 0) + c.voces);
  }
  return salida;
}

export function actoresPorTerritorio(cosecha: Cosecha): Map<string, number> {
  const salida = new Map<string, number>();
  for (const c of cosecha.celdas) {
    salida.set(c.territorioId, (salida.get(c.territorioId) ?? 0) + c.actores);
  }
  return salida;
}

export function sinActorPorTerritorio(cosecha: Cosecha): Map<string, number> {
  const salida = new Map<string, number>();
  for (const c of cosecha.celdas) {
    salida.set(c.territorioId, (salida.get(c.territorioId) ?? 0) + c.sinActor);
  }
  return salida;
}

/**
 * Cuántos períodos DISTINTOS con voz tiene cada territorio.
 *
 * Es la definición operativa de «sostener»: un pico de setecientas voces en un
 * solo mes no sostiene nada, y con la cosecha eso se deriva en los dos modos
 * en vez de imponerse en uno.
 */
export function periodosConVozPorTerritorio(cosecha: Cosecha): Map<string, number> {
  const vistos = new Map<string, Set<number>>();
  for (const c of cosecha.celdas) {
    if (c.voces <= 0) continue;
    const set = vistos.get(c.territorioId) ?? new Set<number>();
    set.add(c.periodo);
    vistos.set(c.territorioId, set);
  }
  const salida = new Map<string, number>();
  for (const [id, set] of vistos) salida.set(id, set.size);
  return salida;
}

export function vocesPorClase(cosecha: Cosecha): Map<ClaseSenal, number> {
  const salida = new Map<ClaseSenal, number>();
  for (const clase of CLASES_SENAL) salida.set(clase, 0);
  for (const c of cosecha.celdas) {
    salida.set(c.clase, (salida.get(c.clase) ?? 0) + c.voces);
  }
  return salida;
}

/** Sólo las celdas de una clase. Es el eje de mandato por clase, y nada más. */
export function filtrarPorClase(cosecha: Cosecha, clase: ClaseSenal): Cosecha {
  const celdas: CeldaDeCosecha[] = [];
  for (const c of cosecha.celdas) if (c.clase === clase) celdas.push(c);
  return { celdas, periodos: cosecha.periodos, autoridad: cosecha.autoridad };
}

/** La huella de la cosecha, para poder rehidratar el retrato bajo demanda. */
export function huellaDeCosecha(cosecha: Cosecha): string {
  let h = acumularHuella(SEMILLA_FNV, `${String(cosecha.periodos)}|${cosecha.autoridad}|`);
  for (const c of cosecha.celdas) {
    h = acumularHuella(
      h,
      `${c.territorioId}:${String(c.periodo)}:${c.clase}:${String(c.voces)}:${String(c.actores)}:${String(c.sinActor)};`,
    );
  }
  return huellaHex(h);
}
