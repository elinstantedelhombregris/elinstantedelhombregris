import { COEFICIENTES } from './coeficientes.js';
import { veredictoDe } from './espina/veredicto.js';
import {
  periodosDelHorizonte,
  periodosSostenidos,
  pisoEfectivo,
  umbralDe,
} from './mandato.js';
import { derivado, hipotesis, medido } from './procedencia.js';
import { repartir } from './reparto.js';

import type { Coeficientes } from './coeficientes.js';
import type { Magnitud, SelloDelModelo } from './procedencia.js';
import type {
  EstadoMedido,
  Palancas,
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
 *
 * Este archivo lleva cinco de los seis arreglos del §6.1 del módulo de
 * Simulación, y los cinco pasan de molestia a bloqueante en cuanto hay un
 * barrido: el `RangeError` del spread, la fuga de voces del reparto, la
 * etiqueta de procedencia falsa del lado medido, el `tieneMandato` sin
 * procedencia, y la persistencia que era un máximo.
 */

const MS_POR_PERIODO = (365.25 / COEFICIENTES.PERIODOS_POR_ANIO) * 24 * 3600 * 1000;

/**
 * Territorios que no pueden participar de ningún total, con su razón.
 *
 * Se exporta porque quien reparte tiene que repartir **sólo entre los útiles**:
 * ése es el arreglo #3. Repartir sobre todos y descartar después es cómo se
 * perdían las voces sin que nada lo dijera.
 */
export function separarSinDato(territorios: readonly Territorio[]): {
  utiles: Territorio[];
  descartados: Territorio[];
} {
  const utiles: Territorio[] = [];
  const descartados: Territorio[] = [];
  for (const t of territorios) {
    if (t.poblacion > 0) utiles.push(t);
    else descartados.push(t);
  }
  return { utiles, descartados };
}

export const SIN_POBLACION = 'Sin población conocida: no hay denominador.';

/** En qué período cae un instante, contado hacia atrás desde `ahora`. */
const periodoDe = (fecha: number, ahora: number): number =>
  Math.floor((ahora - fecha) / MS_POR_PERIODO);

/** Lo que `armarRetrato` necesita, con nombre. Siete parámetros sueltos era una trampa. */
export interface EntradaDeRetrato {
  readonly conteo: ReadonlyMap<string, number>;
  readonly sostenidosPorTerritorio: ReadonlyMap<string, number>;
  readonly periodosTotales: number;
  readonly piso: number;
  readonly territorios: readonly Territorio[];
  readonly fuente: string;
  readonly esMedido: boolean;
  readonly coeficientes?: Coeficientes;
  /**
   * Cuando la cosecha salió de una población escrita por un modelo, TODA
   * magnitud derivada de ese conteo sale sellada como hipótesis. El lado del
   * silencio nunca lo lleva, y eso es una guarda.
   */
  readonly sello?: SelloDelModelo | null;
}

/**
 * El armado común a los dos lados y a los dos modos. `esMedido` decide si el
 * conteo se presenta como dato real o como derivado de las palancas — la
 * distinción que hace que la procedencia sirva para algo.
 */
export function armarRetrato(entrada: EntradaDeRetrato): Retrato {
  const {
    conteo,
    sostenidosPorTerritorio,
    periodosTotales,
    piso,
    territorios,
    fuente,
    esMedido,
    coeficientes = COEFICIENTES,
    sello = null,
  } = entrada;

  const { utiles, descartados } = separarSinDato(territorios);
  const sellar = (m: Magnitud): Magnitud => (sello === null ? m : hipotesis(m, sello));
  const marcar = (valor: number, unidad: string): Magnitud =>
    esMedido
      ? medido(valor, unidad, fuente)
      : sellar(derivado(valor, unidad, fuente, ['participacion', 'dispersion']));

  /**
   * Arreglo #4: el lado medido declaraba derivar de `constancia` y `horizonte`,
   * dos palancas que `retratoMedido` no mira — y es justo el lado cuya
   * independencia de las palancas es la tesis del módulo. Ahora cada lado dice
   * de qué deriva de verdad, y los dos pisos —el del silencio es siempre
   * `pisoEfectivo(0)`— dejan de mostrar la misma fórmula.
   */
  const formulaPersistencia = esMedido
    ? 'Σ población × (períodos con voz ÷ períodos de la ventana) ÷ población total'
    : 'Σ población × (períodos sostenidos ÷ períodos del horizonte) ÷ población total';
  const dePersistencia = esMedido ? ['voces', 'poblacion'] : ['constancia', 'horizonte', 'poblacion'];
  const deUmbral = esMedido ? ['piso base', 'poblacion'] : ['piso', 'resistencia', 'poblacion'];

  const porTerritorio = new Map<string, RetratoTerritorio>();
  let poblacionConMandato = 0;
  let poblacionTotal = 0;
  let conVoz = 0;
  let persistenciaPonderada = 0;
  let persistenciaMaxima = 0;

  for (const t of utiles) {
    const voces = conteo.get(t.id) ?? 0;
    const umbral = umbralDe(t, piso);
    const sostenidos = sostenidosPorTerritorio.get(t.id) ?? 0;
    poblacionTotal += t.poblacion;
    if (voces > 0) conVoz += 1;

    const sostenidaAqui =
      periodosTotales === 0 ? 0 : Math.min(1, Math.max(0, sostenidos) / periodosTotales);
    persistenciaPonderada += t.poblacion * sostenidaAqui;
    if (sostenidaAqui > persistenciaMaxima) persistenciaMaxima = sostenidaAqui;

    const veredicto = veredictoDe(
      marcar(voces, 'voces'),
      sellar(derivado(umbral, 'voces', 'piso × población ÷ 100.000', deUmbral)),
      marcar(sostenidos, 'períodos'),
      coeficientes,
    );
    if (veredicto.hay) poblacionConMandato += t.poblacion;

    porTerritorio.set(t.id, {
      territorioId: t.id,
      voces: veredicto.voces,
      vocesPorCienMil: sellar(
        derivado(
          (voces / t.poblacion) * 100_000,
          'voces cada 100 mil hab.',
          'voces ÷ población × 100.000',
          ['voces', 'poblacion'],
        ),
      ),
      umbral: veredicto.umbral,
      veredicto,
    });
  }

  /** Arreglo #3: lo que se pierde se dice, y se dice con su magnitud. */
  const sinDato: SinDato[] = descartados.map((t) => ({
    territorioId: t.id,
    razon: SIN_POBLACION,
    vocesPerdidas: marcar(conteo.get(t.id) ?? 0, 'voces'),
  }));

  const alcance = poblacionTotal === 0 ? 0 : poblacionConMandato / poblacionTotal;
  const persistencia = poblacionTotal === 0 ? 0 : persistenciaPonderada / poblacionTotal;
  const cobertura = utiles.length === 0 ? 0 : conVoz / utiles.length;

  return {
    alcance: sellar(
      derivado(alcance, 'fracción', 'población con mandato ÷ población total', ['poblacion']),
    ),
    persistencia: sellar(derivado(persistencia, 'fracción', formulaPersistencia, dePersistencia)),
    persistenciaMaxima: sellar(
      derivado(persistenciaMaxima, 'fracción', 'la del territorio más constante', dePersistencia),
    ),
    legitimidad: sellar(
      derivado(alcance * persistencia, 'fracción', 'alcance × persistencia', [
        'alcance',
        'persistencia',
      ]),
    ),
    cobertura: sellar(
      derivado(cobertura, 'fracción', 'territorios con voz ÷ territorios con dato', ['voces']),
    ),
    porTerritorio,
    sinDato,
  };
}

export function retratoMedido(
  base: EstadoMedido,
  territorios: readonly Territorio[],
  coeficientes: Coeficientes = COEFICIENTES,
): Retrato {
  const conteo = new Map<string, number>();
  const periodos = new Map<string, Set<number>>();

  /**
   * Arreglo #2: el mínimo se acumula en el mismo recorrido, sin `Math.min(...)`
   * sobre un array. El spread revienta con `RangeError` a los ~110.000 valores
   * —bisecado en esta máquina, y más bajo todavía en un Web Worker—, y una
   * función del modo gente de 10.000 personas × 120 rondas emite 415.645
   * señales. No es un riesgo remoto: es la primera cosa que rompería.
   */
  let masVieja = Number.POSITIVE_INFINITY;
  for (const v of base.voces) {
    conteo.set(v.territorioId, (conteo.get(v.territorioId) ?? 0) + 1);
    const set = periodos.get(v.territorioId) ?? new Set<number>();
    set.add(periodoDe(v.fecha, base.ahora));
    periodos.set(v.territorioId, set);
    if (v.fecha < masVieja) masVieja = v.fecha;
  }

  const sostenidos = new Map<string, number>();
  for (const [id, set] of periodos) sostenidos.set(id, set.size);

  /**
   * La ventana del lado medido es TODO el dato que hay, desde la primera voz
   * hasta `ahora`. No sale del horizonte: si saliera, mover esa palanca
   * cambiaría el lado del silencio y S3 dejaría de valer.
   */
  const abarcados = base.voces.length === 0 ? 1 : periodoDe(masVieja, base.ahora) + 1;

  return armarRetrato({
    conteo,
    sostenidosPorTerritorio: sostenidos,
    periodosTotales: Math.max(1, abarcados),
    piso: pisoEfectivo(0, coeficientes),
    territorios,
    fuente: 'voces cargadas',
    esMedido: true,
    coeficientes,
  });
}

/**
 * El lado de la voz. Acá sí mandan las palancas — es la única mitad simulada.
 *
 * Se conserva como **implementación de referencia** del modo forma: hay un test
 * que afirma que `retratar(modoForma(...))` le da lo mismo, territorio por
 * territorio. Sin ese test, izar el silencio fuera del bucle del barrido sería
 * una divergencia esperando pasar, y el instrumento mediría otro motor que el
 * mapa.
 */
export function retratoSimulado(
  palancas: Palancas,
  base: EstadoMedido,
  territorios: readonly Territorio[],
  coeficientes: Coeficientes = COEFICIENTES,
): Retrato {
  const { utiles } = separarSinDato(territorios);

  let poblacionTotal = 0;
  for (const t of utiles) poblacionTotal += t.poblacion;
  const totalVoces = Math.round((palancas.participacion * poblacionTotal) / 100_000);

  const vocesBase = new Map<string, number>();
  for (const v of base.voces) {
    vocesBase.set(v.territorioId, (vocesBase.get(v.territorioId) ?? 0) + 1);
  }

  // Arreglo #3: se reparte SÓLO entre los útiles. Repartiendo sobre todos, un
  // territorio sin población podía ganar el sorteo de la concentración y
  // llevarse el total entero a un lugar que ningún agregado cuenta.
  const conteo = repartir(totalVoces, utiles, palancas.dispersion, vocesBase);

  const periodosTotales = periodosDelHorizonte(palancas.horizonte, coeficientes);
  const sostenidos = periodosSostenidos(palancas.constancia, periodosTotales);

  /**
   * Un territorio sostiene, como mucho, tantos períodos como voces tiene: con
   * dos voces no se sostienen doce meses. Antes se le asignaba `sostenidos` a
   * TODOS los territorios por igual, incluidos los que no recibían ni una voz,
   * y eso inflaba la persistencia nacional apenas dejó de ser un máximo.
   */
  const sostenidosPorTerritorio = new Map<string, number>();
  for (const t of utiles) {
    const voces = conteo.get(t.id) ?? 0;
    sostenidosPorTerritorio.set(t.id, Math.min(sostenidos, voces));
  }

  return armarRetrato({
    conteo,
    sostenidosPorTerritorio,
    periodosTotales,
    piso: pisoEfectivo(palancas.resistencia, coeficientes),
    territorios,
    fuente: 'participación × población ÷ 100.000, repartida por dispersión',
    esMedido: false,
    coeficientes,
  });
}
