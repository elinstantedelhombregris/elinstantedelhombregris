/**
 * `medirForma` — el pivote de la espina, spec §5.1.
 *
 * Corre sobre las dos cosechas con el mismo código. Lo que en un modo es
 * entrada, en el otro es resultado: el modo forma **declara** participación,
 * dispersión, constancia y composición, y el modo gente las **produce**. Como
 * las mismas cuatro se miden sobre las dos salidas con la misma función, el
 * desacuerdo entre modos deja de ser una incomodidad y se vuelve un número que
 * se calcula, se mapea y se lee: el resto (§5.2).
 *
 * En modo forma, `medirForma(modoForma(esc, pais, null))` tiene que reproducir
 * `esc.forma`. **Eso es una guarda, y caza dos defectos que ya existían**: el
 * reparto que cerraba exacto sobre todos los territorios mientras el retrato
 * descartaba los de población ≤ 0, y las voces que ahí se perdían sin que nada
 * lo dijera.
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';
import { pesosConcentrado, pesosProporcional } from '../reparto.js';
import { separarSinDato } from '../retrato.js';

import {
  periodosConVozPorTerritorio,
  totalDeVoces,
  vocesPorClase,
  vocesPorTerritorio,
} from './cosecha.js';

import type { Cosecha } from './cosecha.js';
import type { Forma, Pais } from './escenario.js';
import type { ClaseSenal } from '../../senal/vocabulario.js';

/**
 * Cuánto se parece un reparto real a la mezcla `(1−m)·concentrado + m·proporcional`.
 *
 * Es la proyección de mínimos cuadrados del reparto observado sobre la recta
 * que une las dos referencias, acotada a [0, 1]. Cuando las dos referencias
 * coinciden —un solo territorio útil, o todos con la misma población— la
 * mezcla no es identificable: cualquier valor produce el mismo país, y devuelve
 * 0 porque hay que devolver algo. Se dice acá en vez de esconderlo: es la
 * única de las cuatro que no es una lectura directa.
 */
function dispersionObservada(
  reparto: ReadonlyMap<string, number>,
  pais: Pais,
  total: number,
): number {
  if (total <= 0) return 0;
  const { utiles } = separarSinDato(pais.territorios);

  /**
   * Las dos referencias se arman con las voces BASE del país, exactamente como
   * las armó `repartir()`. Armarlas con el reparto observado sería el error
   * sutil: el desempate de la concentrada elegiría un territorio distinto del
   * que el reparto usó, y la lectura devolvería un número que no es el que se
   * declaró — justo en la única de las cuatro que no es una lectura directa.
   */
  const vocesBase = new Map<string, number>();
  for (const v of pais.base.voces) {
    vocesBase.set(v.territorioId, (vocesBase.get(v.territorioId) ?? 0) + 1);
  }
  const concentrado = pesosConcentrado(utiles, vocesBase);
  const proporcional = pesosProporcional(utiles);

  let numerador = 0;
  let denominador = 0;
  for (const t of utiles) {
    const a = (reparto.get(t.id) ?? 0) / total;
    const c = concentrado.get(t.id) ?? 0;
    const p = proporcional.get(t.id) ?? 0;
    numerador += (a - c) * (p - c);
    denominador += (p - c) * (p - c);
  }
  if (denominador === 0) return 0;
  return Math.min(1, Math.max(0, numerador / denominador));
}

/**
 * La forma que efectivamente salió.
 *
 * `constancia` se mide como la spec la define —períodos con voz ÷ períodos de
 * la ventana, promediado sobre los territorios que hablaron— y no como la
 * inversa exacta de `periodosSostenidos`, que hace `round(1 + c·(P−1))`. Las
 * dos difieren en `(1−c)/P`, o sea a lo sumo un período: con horizonte de dos
 * años eso son 4 centésimas, y la guarda de identidad lo tolera con esa cota
 * escrita. Preferir la definición legible a la inversa exacta es deliberado:
 * el número que se muestra tiene que significar lo que dice que significa.
 *
 * Sin voces no hay composición: las cuatro dan 0 y la suma da 0, no 1. Repartir
 * un cuarto a cada clase para que «sume 1» sería inventar la única cosa que
 * esta función existe para medir.
 */
export function medirForma(cosecha: Cosecha, pais: Pais): Forma {
  const { utiles } = separarSinDato(pais.territorios);
  let poblacionTotal = 0;
  for (const t of utiles) poblacionTotal += t.poblacion;

  const total = totalDeVoces(cosecha);
  const porTerritorio = vocesPorTerritorio(cosecha);
  const conVoz = periodosConVozPorTerritorio(cosecha);
  const porClase = vocesPorClase(cosecha);

  let constanciaPonderada = 0;
  let territoriosQueHablaron = 0;
  for (const t of utiles) {
    if ((porTerritorio.get(t.id) ?? 0) <= 0) continue;
    territoriosQueHablaron += 1;
    constanciaPonderada += Math.min(1, (conVoz.get(t.id) ?? 0) / cosecha.periodos);
  }

  const composicion = {} as Record<ClaseSenal, number>;
  for (const clase of CLASES_SENAL) {
    composicion[clase] = total <= 0 ? 0 : (porClase.get(clase) ?? 0) / total;
  }

  return {
    participacion: poblacionTotal <= 0 ? 0 : (total / poblacionTotal) * 100_000,
    dispersion: dispersionObservada(porTerritorio, pais, total),
    constancia: territoriosQueHablaron === 0 ? 0 : constanciaPonderada / territoriosQueHablaron,
    composicion,
  };
}

/**
 * Normaliza una composición declarada a que sume 1.
 *
 * Con las cuatro en cero devuelve el reparto parejo y **eso es distinto de
 * medir**: acá es una entrada que la persona no terminó de completar, y el
 * único default no arbitrario es «todas por igual». En `medirForma`, en cambio,
 * cero voces devuelve ceros, porque ahí un cuarto a cada clase sería inventar
 * un dato.
 */
export function normalizarComposicion(
  composicion: Readonly<Record<ClaseSenal, number>>,
): Record<ClaseSenal, number> {
  let suma = 0;
  for (const clase of CLASES_SENAL) suma += Math.max(0, composicion[clase]);

  const salida = {} as Record<ClaseSenal, number>;
  for (const clase of CLASES_SENAL) {
    salida[clase] = suma <= 0 ? 1 / CLASES_SENAL.length : Math.max(0, composicion[clase]) / suma;
  }
  return salida;
}
