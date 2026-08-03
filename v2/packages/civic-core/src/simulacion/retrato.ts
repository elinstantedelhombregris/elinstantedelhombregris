import { COEFICIENTES } from './coeficientes.js';
import { hayMandato, pisoEfectivo, umbralDe } from './mandato.js';
import { derivado, medido } from './procedencia.js';

import type {
  EstadoMedido,
  Retrato,
  RetratoTerritorio,
  SinDato,
  Territorio,
} from './tipos.js';

/**
 * Los retratos — spec §5.
 *
 * El medido es el lado del silencio y NO lee ninguna palanca (S3): es el país
 * tal como está, no un modelo. Si las dos mitades de la cortina fueran
 * modelos, la comparación probaría una tautología.
 */

const MS_POR_PERIODO = (365.25 / COEFICIENTES.PERIODOS_POR_ANIO) * 24 * 3600 * 1000;

/** Territorios que no pueden participar de ningún total, con su razón. */
function separarSinDato(territorios: readonly Territorio[]): {
  utiles: Territorio[];
  sinDato: SinDato[];
} {
  const utiles: Territorio[] = [];
  const sinDato: SinDato[] = [];
  for (const t of territorios) {
    if (t.poblacion > 0) utiles.push(t);
    else sinDato.push({ territorioId: t.id, razon: 'Sin población conocida: no hay denominador.' });
  }
  return { utiles, sinDato };
}

/** En qué período cae un instante, contado hacia atrás desde `ahora`. */
const periodoDe = (fecha: number, ahora: number): number =>
  Math.floor((ahora - fecha) / MS_POR_PERIODO);

/**
 * El armado común a los dos lados. `esMedido` decide si el conteo se presenta
 * como dato real o como derivado de las palancas — la distinción que hace que
 * la procedencia sirva para algo.
 */
export function armarRetrato(
  conteo: ReadonlyMap<string, number>,
  sostenidosPorTerritorio: ReadonlyMap<string, number>,
  periodosTotales: number,
  piso: number,
  territorios: readonly Territorio[],
  fuente: string,
  esMedido: boolean,
): Retrato {
  const { utiles, sinDato } = separarSinDato(territorios);
  const marcar = (valor: number, unidad: string) =>
    esMedido
      ? medido(valor, unidad, fuente)
      : derivado(valor, unidad, fuente, ['participacion', 'dispersion']);

  const porTerritorio = new Map<string, RetratoTerritorio>();
  let poblacionConMandato = 0;
  let poblacionTotal = 0;
  let conVoz = 0;

  for (const t of utiles) {
    const voces = conteo.get(t.id) ?? 0;
    const umbral = umbralDe(t, piso);
    const sostenidos = sostenidosPorTerritorio.get(t.id) ?? 0;
    poblacionTotal += t.poblacion;
    if (voces > 0) conVoz += 1;
    const tieneMandato = hayMandato(voces, umbral, sostenidos);
    if (tieneMandato) poblacionConMandato += t.poblacion;

    porTerritorio.set(t.id, {
      territorioId: t.id,
      voces: marcar(voces, 'voces'),
      vocesPorCienMil: derivado(
        (voces / t.poblacion) * 100_000,
        'voces cada 100 mil hab.',
        'voces ÷ población × 100.000',
        ['voces', 'poblacion'],
      ),
      umbral: derivado(umbral, 'voces', 'piso × población ÷ 100.000', ['piso', 'poblacion']),
      tieneMandato,
    });
  }

  const alcance = poblacionTotal === 0 ? 0 : poblacionConMandato / poblacionTotal;
  const sostenidosMax = Math.max(0, ...[...sostenidosPorTerritorio.values()]);
  const persistencia = periodosTotales === 0 ? 0 : Math.min(1, sostenidosMax / periodosTotales);
  const cobertura = utiles.length === 0 ? 0 : conVoz / utiles.length;

  return {
    alcance: derivado(alcance, 'fracción', 'población con mandato ÷ población total', ['poblacion']),
    persistencia: derivado(
      persistencia,
      'fracción',
      'períodos sostenidos ÷ períodos del horizonte',
      ['constancia', 'horizonte'],
    ),
    legitimidad: derivado(alcance * persistencia, 'fracción', 'alcance × persistencia', [
      'alcance',
      'persistencia',
    ]),
    cobertura: derivado(cobertura, 'fracción', 'territorios con voz ÷ territorios con dato', [
      'voces',
    ]),
    porTerritorio,
    sinDato,
  };
}

export function retratoMedido(base: EstadoMedido, territorios: readonly Territorio[]): Retrato {
  const conteo = new Map<string, number>();
  const periodos = new Map<string, Set<number>>();

  for (const v of base.voces) {
    conteo.set(v.territorioId, (conteo.get(v.territorioId) ?? 0) + 1);
    const set = periodos.get(v.territorioId) ?? new Set<number>();
    set.add(periodoDe(v.fecha, base.ahora));
    periodos.set(v.territorioId, set);
  }

  const sostenidos = new Map([...periodos].map(([id, set]) => [id, set.size]));

  /**
   * La ventana del lado medido es TODO el dato que hay, del primer voz hasta
   * `ahora`. No sale del horizonte: si saliera, mover esa palanca cambiaría el
   * lado del silencio y S3 dejaría de valer.
   */
  const fechas = base.voces.map((v) => v.fecha);
  const abarcados = fechas.length === 0 ? 1 : periodoDe(Math.min(...fechas), base.ahora) + 1;

  return armarRetrato(
    conteo,
    sostenidos,
    Math.max(1, abarcados),
    pisoEfectivo(0),
    territorios,
    'voces cargadas',
    true,
  );
}
