import { huellaDePais } from './espina/escenario.js';
import { derivado } from './procedencia.js';
import { retratoMedido, retratoSimulado } from './retrato.js';

import type { Pais } from './espina/escenario.js';
import type {
  Diferencia,
  DiferenciaTerritorio,
  EntradaSimulacion,
  Palancas,
  ResultadoSimulacion,
  Retrato,
} from './tipos.js';

/**
 * El orquestador de la Simulación — spec §5.1.
 *
 * Corre los dos lados y los resta. El lado del silencio se calcula sin mirar
 * las palancas, y esa asimetría es el corazón de S3: si las dos mitades
 * salieran del mismo modelo, la cortina no probaría nada.
 */
function restar(silencio: Retrato, voz: Retrato): Diferencia {
  const porTerritorio = new Map<string, DiferenciaTerritorio>();
  let ganan = 0;

  for (const [id, deVoz] of voz.porTerritorio) {
    const deSilencio = silencio.porTerritorio.get(id);
    const gana = deVoz.veredicto.hay && !(deSilencio?.veredicto.hay ?? false);
    if (gana) ganan += 1;

    porTerritorio.set(id, {
      territorioId: id,
      delta: derivado(
        deVoz.voces.valor - (deSilencio?.voces.valor ?? 0),
        'voces',
        'voces simuladas − voces medidas',
        ['voz.voces', 'silencio.voces'],
      ),
      ganaMandato: gana,
    });
  }

  return {
    porTerritorio,
    territoriosQueGananMandato: derivado(
      ganan,
      'territorios',
      'territorios con mandato en la voz y sin mandato en el silencio',
      ['voz.veredicto', 'silencio.veredicto'],
    ),
  };
}

export function simular(entrada: EntradaSimulacion): ResultadoSimulacion {
  const silencio = retratoMedido(entrada.base, entrada.territorios);
  const voz = retratoSimulado(entrada.palancas, entrada.base, entrada.territorios);
  return { silencio, voz, diferencia: restar(silencio, voz) };
}

/**
 * Una simulación abierta sobre un país YA CONGELADO — el camino del mapa.
 *
 * Existe por el defecto del §1.5 de la spec, que vivió en producción aunque el
 * motor cumpliera su parte: `useModoSimulacion.tsx` llamaba `Date.now()` adentro
 * de un `useMemo` que dependía de las palancas, así que **mover una perilla
 * recalculaba el lado medido con otro reloj**. Medido: 1 ms de avance movió el
 * alcance del silencio de 0,0000 a 0,2857. La tesis del instrumento —el lado de
 * hoy es medición y es idéntico para toda configuración (S3)— se caía en la
 * pantalla mientras el motor la sostenía en los tests.
 *
 * `simular()` no podía cazarlo: recibe `base` y `territorios` sueltos y no tiene
 * con qué saber que el reloj de esta llamada no es el de la anterior. Acá el
 * reloj entra una sola vez, congelado adentro del `Pais` que `armarPais()`
 * construyó, y **el silencio se calcula una sola vez por país**: toda corrida
 * sobre esta simulación devuelve el MISMO objeto `silencio`, no uno igual. La
 * garantía deja de ser una promesa del call site y pasa a ser inexpresable de
 * otra forma — que es lo que `correr()` hace con la huella para el barrido.
 */
export interface SimulacionAbierta {
  readonly pais: Pais;
  /** El país medido. UN objeto, compartido por toda corrida de este país. */
  readonly silencio: Retrato;
  readonly correr: (palancas: Palancas) => ResultadoSimulacion;
}

/**
 * Abre la simulación de un país.
 *
 * Verifica la huella ANTES de calcular nada, con el mismo argumento que
 * `verificarPais()`: un `Pais` cuyo contenido no da su huella es uno que alguien
 * mutó después de armarlo, y las corridas que salgan de él se van a comparar
 * entre sí como si fueran el mismo país. Se recalcula acá y no en cada corrida
 * porque la huella recorre todas las voces: una vez por país es una guarda, una
 * vez por movimiento de perilla sería un costo por render.
 */
export function abrirSimulacion(pais: Pais): SimulacionAbierta {
  const real = huellaDePais(pais.base, pais.territorios, pais.nivel);
  if (real !== pais.huella) {
    throw new Error(
      `Este país dice tener la huella ${pais.huella} y su contenido da ${real}. Alguien lo cambió ` +
        'después de armarlo: las corridas que salgan de acá se van a leer como comparables y no ' +
        'lo son.',
    );
  }

  const silencio = retratoMedido(pais.base, pais.territorios);

  return {
    pais,
    silencio,
    correr: (palancas: Palancas): ResultadoSimulacion => {
      const voz = retratoSimulado(palancas, pais.base, pais.territorios);
      return { silencio, voz, diferencia: restar(silencio, voz) };
    },
  };
}
