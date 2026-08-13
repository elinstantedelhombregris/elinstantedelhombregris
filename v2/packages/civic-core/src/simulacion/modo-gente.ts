/**
 * El modo gente — declarás quiénes son, y la forma sale de lo que hacen.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §4.2 y §5.
 *
 * ## Qué es esto, y qué no es
 *
 * **No es un modelo de agentes con un LLM adentro del bucle. Es un modelo de
 * agentes con población escrita por un LLM y conducta declarada.** Decirlo de
 * otro modo sería la mentira de MiroFish al revés, y la aritmética no deja
 * lugar a dudas: con el modelo adentro del bucle, 1.000 personas × 60 rondas
 * con activación 0,35 son 21.000 agente-rondas × ~9,8 s ≈ **57 horas para UN
 * punto** del espacio de parámetros. Con el modelo afuera: 2 h 43 min una sola
 * vez, y después ~1,9 ms por punto. Para un barrido de mil puntos son 6,5 años
 * contra 2 h 43 min más dos segundos.
 *
 * Por eso este archivo **no abre un socket, no lee un reloj y no llama a
 * nadie**. Vive en `civic-core`, que es puro, y recibe un `Elenco` ya
 * congelado en vez de un generador: el error central —regenerar la población
 * en cada corrida y terminar midiendo la varianza del modelo— no se evita con
 * disciplina, es que no hay dónde escribirlo.
 *
 * ## Una ronda es un período es un mes
 *
 * Es lo único que hace comparables los dos modos, y va con guarda:
 * `rondas === periodosDelHorizonte(ajustes.horizonte)`.
 *
 * ## Lo que este modo NO lee, y es a propósito
 *
 * **No lee `esc.forma`.** Participación, dispersión, constancia y composición
 * son **salida** de este modo, no entrada: se miden sobre la cosecha y son lo
 * que se compara contra el modo forma para calcular el resto. Si el sorteo de
 * activación saliera de `forma.participacion`, los dos modos estarían
 * declarando lo mismo y el resto no mediría nada. Hay una guarda que lo
 * afirma: mover las cuatro no cambia la cosecha.
 */
import { vencimientosDe } from '../senal/relojes.js';
import { RESPUESTAS_DE_VIVIENDA } from '../senal/ubicacion.js';
import { claseDe, esVerificable, TIPOS_SENAL } from '../senal/vocabulario.js';

import { COEFICIENTES } from './coeficientes.js';
import { azarDe } from './espina/azar.js';
import { compararCeldas } from './espina/cosecha.js';
import { verificarPais } from './espina/escenario.js';
import { periodosDelHorizonte, pisoEfectivo } from './mandato.js';
import { declarado, hipotesis } from './procedencia.js';
import { armarRetrato } from './retrato.js';
import { ubicacionEnsayada, VIVIENDA_SIN_DECLARAR } from './ubicacion-ensayada.js';

import type { Elenco } from './elenco.js';
import type { CeldaDeCosecha, Cosecha } from './espina/cosecha.js';
import type { Escenario, Pais } from './espina/escenario.js';
import type { Conducta, Persona } from './poblacion.js';
import type { Magnitud, SelloDelModelo } from './procedencia.js';
import type { Retrato, Territorio } from './tipos.js';
import type { RepartoDeVivienda, UbicacionEnsayada } from './ubicacion-ensayada.js';
import type { RespuestaDeVivienda } from '../senal/ubicacion.js';
import type { ClaseSenal, TipoSenal } from '../senal/vocabulario.js';

/**
 * Los propósitos del azar.
 *
 * Cada sorteo lleva el suyo como última coordenada. Sin esto, «¿habla?» y
 * «¿qué tipo emite?» compartirían el número y quedarían correlacionados: el
 * que habla elegiría siempre el mismo tipo, y nadie lo notaría porque el
 * resultado igual se ve razonable.
 */
const PROPOSITO = {
  ACTIVAR: 101,
  TIPO: 102,
  FRASE: 103,
  ADHERIR: 104,
  CORROBORAR: 105,
  CUMPLIR: 106,
  ANONIMO: 107,
  PLAZO: 108,
  /** «¿Esto habla de una casa donde vive alguien?», sorteada aparte de todo lo demás. */
  VIVIENDA: 109,
} as const;

/**
 * Cuánto pesa el ambiente frente a los vínculos, por radio de atención.
 *
 * El que mira su cuadra ve a los suyos; el que mira el país ve el promedio
 * nacional. Es el recomendador de OASIS pero **territorial en vez de viral**,
 * y acotado a O(N · grado) — que es exactamente por qué la función cuesta
 * milisegundos y no horas.
 */
const PESO_DEL_AMBIENTE: Readonly<Record<Conducta['radioAtencion'], number>> = {
  cuadra: 0,
  barrio: 0.15,
  municipio: 0.35,
  provincia: 0.6,
  pais: 1,
};

/**
 * Cuántos actores distintos hacen falta para que un hecho pase a corroborado.
 *
 * Dos, y son dos personas **distintas de la que emitió**: una sola es la misma
 * afirmación dicha dos veces. Es un coeficiente publicado y no un número
 * suelto — vive acá con su razón escrita, igual que `COEFICIENTES`.
 */
export const ACTORES_PARA_CORROBORAR = 2;

/** Cuántas rondas adelante se compromete un `acto`, como máximo. */
export const PLAZO_MAXIMO_DE_ACTO = 6;

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** El mes del motor, con la misma definición que `retrato.ts`. */
const MS_POR_PERIODO = (365.25 / COEFICIENTES.PERIODOS_POR_ANIO) * 24 * 3600 * 1000;

/** Elige un índice según pesos. `-1` cuando no hay nada que elegir. */
function elegirPorPeso(pesos: readonly number[], sorteo: number): number {
  let total = 0;
  for (const peso of pesos) total += Math.max(0, peso);
  if (total <= 0) return -1;
  let acumulado = 0;
  const objetivo = sorteo * total;
  for (let i = 0; i < pesos.length; i += 1) {
    acumulado += Math.max(0, pesos[i] ?? 0);
    if (objetivo < acumulado) return i;
  }
  return pesos.length - 1;
}

/* ------------------------------------------------------------------ *
 * El guion — la inyección desde arriba
 * ------------------------------------------------------------------ */

/**
 * Un evento programado.
 *
 * A diferencia de MiroFish —donde `scheduled_events` está declarado en el
 * dataclass y **no lo lee ningún script**— acá se leen, y hay una guarda que
 * falla si un evento programado no cambia el resultado.
 *
 * Y acá está la salida al conflicto entre la vista de dios y la
 * reproducibilidad: toda intervención en vivo **queda escrita en el guion**,
 * así que la función se reproduce entera desde su guion y mirar y tocar no
 * rompe nada.
 */
export type Evento =
  | {
      readonly ronda: number;
      readonly que: 'sembrarSenal';
      readonly territorioId: string;
      readonly tipo: TipoSenal;
      readonly cuantas: number;
    }
  | { readonly ronda: number; readonly que: 'silenciar'; readonly territorioId: string }
  | {
      readonly ronda: number;
      readonly que: 'moverPalanca';
      readonly campo: 'chispa' | 'contagio' | 'desaliento' | 'cumplimiento';
      readonly valor: number;
    }
  | { readonly ronda: number; readonly que: 'sumarResistencia'; readonly cuanta: number };

/* ------------------------------------------------------------------ *
 * Lo que la función produce, además de la cosecha
 * ------------------------------------------------------------------ */

/** El estado de calidad. Una señal sin estado no se puede dibujar — regla 4. */
export type EstadoEnsayado = 'enviada' | 'corroborada' | 'resuelta';

export type DesenlaceEnsayado = 'abierto' | 'cumplido' | 'no_cumplido';

/**
 * Una señal ensayada, con los campos que la ingesta real exige.
 *
 * La regla que la sostiene: *todo campo que la ingesta real exige, el
 * generador lo produce; y todo campo que la ingesta real deriva, el generador
 * lo deriva **con la misma función***. Los relojes salen de `vencimientosDe`,
 * la clase de `claseDe`. Cualquier campo que se llene con una constante es una
 * dimensión que el análisis va a reportar como insensible, y va a tener razón.
 */
export interface SenalEnsayada {
  readonly id: number;
  readonly ronda: number;
  readonly territorioId: string;
  readonly celdaId: string;
  readonly tipo: TipoSenal;
  readonly clase: ClaseSenal;
  /** `null` a propósito: el residuo sin actor tiene que ser simulable. */
  readonly actorId: number | null;
  readonly texto: string;
  readonly publicadaEn: number;
  readonly venceEl: number;
  readonly caducaEl: number;
  readonly comprometidoPara: number | null;
  readonly estado: EstadoEnsayado;
  readonly desenlace: DesenlaceEnsayado | null;
  /**
   * De dónde viene lo que dice esta señal.
   *
   * `hipotesis` cuando el elenco lo escribió un modelo, `declarado` cuando lo
   * escribió el escritor determinista. **Jamás `medido`**: nada la midió.
   */
  readonly voz: Magnitud;
  /**
   * Precisión, rol y sensibilidad — derivados con `prepareRecordLocation`, la
   * misma función que corre el servidor sobre una señal real (regla 2).
   *
   * Faltaba entero, y no se veía porque el modo gente todavía no pinta un mapa.
   * El día que lo pinte, una señal ensayada saldría con una precisión que
   * ninguna real puede tener. Una señal sin estos tres campos **no se puede
   * dibujar**: el esquema los tiene `NOT NULL` justamente por eso.
   */
  readonly ubicacion: UbicacionEnsayada;
}

/** Una adhesión es una ARISTA, nunca un contador en la fila de la señal. */
export interface AdhesionEnsayada {
  readonly senalId: number;
  readonly personaId: number;
  readonly ronda: number;
}

export interface ConfirmacionEnsayada {
  readonly senalId: number;
  readonly personaId: number;
  readonly ronda: number;
  readonly veredicto: 'confirma';
}

/**
 * El rastro de la función.
 *
 * Se llama `rastro` y no «memoria»: **nadie lo lee durante la corrida**, y
 * llamarlo memoria sería prometer lo que MiroFish promete y no cumple —su
 * memoria de largo plazo viene apagada por defecto y los agentes nunca la
 * consultan mientras corren.
 */
export interface RastroDeFuncion {
  readonly senales: readonly SenalEnsayada[];
  readonly adhesiones: readonly AdhesionEnsayada[];
  readonly confirmaciones: readonly ConfirmacionEnsayada[];
}

export interface ResultadoDeFuncion {
  readonly cosecha: Cosecha;
  readonly rondas: number;
  readonly poblacionHuella: string;
  /** El sello del modelo que escribió el elenco, o `null` si no hubo modelo. */
  readonly sello: SelloDelModelo | null;
  /** `null` si no se pidió: 415.645 filas cuestan, y el barrido no las mira. */
  readonly rastro: RastroDeFuncion | null;
  /** Cuántas personas se activaron en cada ronda. Para dibujar la curva. */
  readonly activasPorRonda: readonly number[];
}

export interface OpcionesDeFuncion {
  /** Junta señales, adhesiones y confirmaciones. Cuesta memoria: apagado por defecto. */
  readonly rastro?: boolean;
  /**
   * Fracción de señales sin actor conocido.
   *
   * **No tiene default escondido: es 0, y eso es una declaración** —«todas las
   * señales de esta corrida tienen actor conocido»—, no una omisión. Un corpus
   * sintético donde todo el mundo tiene actor no puede reproducir el estado de
   * celda `sin_actor_conocido` y hace que todo barrido sea sistemáticamente
   * optimista sobre la nitidez.
   */
  readonly anonimato?: number;
  readonly guion?: readonly Evento[];
  /**
   * Cómo se reparte «¿esto habla de una casa donde vive alguien?».
   *
   * Sin declararlo, `VIVIENDA_SIN_DECLARAR`: todas sin respuesta, o sea todas
   * `subject` + `high`. **El default es el lado seguro y no el permisivo**, y se
   * nota en el resultado: una corrida que no declaró de qué habla su población
   * sale con todo protegido, que es visible y raro, en vez de salir publicable
   * y parecer normal. Un default de `no` al 100% haría que todo barrido fuera
   * sistemáticamente optimista sobre la protección.
   */
  readonly vivienda?: RepartoDeVivienda;
}

/* ------------------------------------------------------------------ *
 * La función
 * ------------------------------------------------------------------ */

interface SenalViva {
  readonly indice: number;
  readonly clase: ClaseSenal;
  readonly actorId: number | null;
}

/**
 * Corre la función: una ronda por período, cada una con sus ocho fases.
 *
 * Pura, sembrada, sin modelo y sin reloj. El único azar entra por
 * `azarDe(semilla, ronda, persona, proposito)`, que es un mezclador sin
 * estado: agregar una persona no corre el azar de las demás, y por eso dos
 * corridas con distinto N siguen siendo comparables.
 */
export function correrFuncion(
  esc: Escenario,
  pais: Pais,
  elenco: Elenco,
  opciones: OpcionesDeFuncion = {},
): ResultadoDeFuncion {
  verificarPais(esc, pais);

  const mecanismo = esc.mecanismo;
  if (mecanismo === null) {
    throw new Error(
      'El modo gente necesita un mecanismo y llegó en `null`. Un escenario sin mecanismo es de ' +
        'modo forma: no tiene chispa, ni contagio, ni desaliento, y por lo tanto no tiene con ' +
        'qué mover a nadie.',
    );
  }
  if (mecanismo.poblacionHuella !== elenco.poblacion.huella) {
    throw new Error(
      `El escenario «${esc.id}» se armó contra la población ${mecanismo.poblacionHuella} y se lo ` +
        `está corriendo contra ${elenco.poblacion.huella}. Si la población cambia entre corridas, ` +
        'lo que se mide es la varianza del modelo y no la palanca — y eso no da error, da ' +
        'números plausibles.',
    );
  }

  const rondas = periodosDelHorizonte(esc.ajustes.horizonte, esc.coeficientes);
  const personas = elenco.poblacion.personas;
  const territorioDe = elenco.territorioDe;
  const n = personas.length;
  const anonimato = acotar(opciones.anonimato ?? 0, 0, 1);
  const quiereRastro = opciones.rastro === true;
  const vivienda = opciones.vivienda ?? VIVIENDA_SIN_DECLARAR;

  // Lo que el guion puede mover mientras corre.
  let chispa = mecanismo.chispa;
  let contagio = mecanismo.contagio;
  let desaliento = mecanismo.desaliento;
  let cumplimiento = esc.ajustes.cumplimiento;
  let resistencia = esc.ajustes.resistencia;
  const silenciados = new Set<string>();
  const guion = ordenarGuion(opciones.guion ?? []);

  const personasPorTerritorio = new Map<string, number>();
  for (const territorioId of territorioDe) {
    personasPorTerritorio.set(territorioId, (personasPorTerritorio.get(territorioId) ?? 0) + 1);
  }

  const activoAnterior = new Uint8Array(n);
  const activoActual = new Uint8Array(n);
  const yaHablo = new Uint8Array(n);
  let activosPaisAnterior = 0;
  const activosTerritorioAnterior = new Map<string, number>();

  const senales: SenalEnsayada[] = [];
  const adhesiones: AdhesionEnsayada[] = [];
  const confirmaciones: ConfirmacionEnsayada[] = [];
  const activasPorRonda: number[] = [];
  const confirmantes: Set<number>[] = [];
  /** Actos abiertos, indexados por la ronda en que cierran. */
  const cierresPorRonda = new Map<number, number[]>();
  /** Las señales de la ronda anterior, por territorio: lo único que se «ve». */
  let vivasPorTerritorio = new Map<string, SenalViva[]>();

  const cosecha = new CosechaEnArmado();
  const autoridad: 'declarada' | 'hipotesis' = elenco.sello === null ? 'declarada' : 'hipotesis';

  for (let r = 0; r < rondas; r += 1) {
    const vivasDeEstaRonda = new Map<string, SenalViva[]>();

    // ---- 1. Guion. En orden canónico, nunca en orden de llegada. ----
    for (const evento of guion) {
      if (evento.ronda !== r) continue;
      switch (evento.que) {
        case 'silenciar':
          silenciados.add(evento.territorioId);
          break;
        case 'sumarResistencia':
          resistencia = acotar(resistencia + evento.cuanta, 0, 1);
          break;
        case 'moverPalanca':
          if (evento.campo === 'chispa') chispa = evento.valor;
          else if (evento.campo === 'contagio') contagio = evento.valor;
          else if (evento.campo === 'desaliento') desaliento = evento.valor;
          else cumplimiento = evento.valor;
          break;
        case 'sembrarSenal': {
          // Sembradas desde arriba: no las emitió nadie del elenco, así que van
          // SIN actor. Es la segunda fuente honesta de `sinActor`.
          const clase = claseDe(evento.tipo);
          for (let k = 0; k < Math.max(0, Math.trunc(evento.cuantas)); k += 1) {
            const senal = armarSenal({
              id: senales.length,
              ronda: r,
              rondas,
              ahora: pais.ahora,
              territorioId: evento.territorioId,
              celdaId: `${evento.territorioId}#guion`,
              tipo: evento.tipo,
              actorId: null,
              texto: `Señal sembrada por el guion en la ronda ${String(r)}.`,
              plazoRondas: clase === 'acto' ? 1 : null,
              sello: elenco.sello,
              /**
               * A una señal que sembró el guion no le contestó nadie la
               * pregunta de la casa —no la emitió una persona—, así que cae del
               * lado seguro. Darle el reparto declarado de la corrida sería
               * hacerle decir a la población algo que no dijo.
               */
              vivienda: 'sinRespuesta',
            });
            senales.push(senal);
            confirmantes.push(new Set());
            cosecha.anotarSenal(evento.territorioId, r, clase, null);
            agregarViva(vivasDeEstaRonda, evento.territorioId, {
              indice: senal.id,
              clase,
              actorId: null,
            });
            if (clase === 'acto') anotarCierre(cierresPorRonda, r + 1, senal.id);
          }
          break;
        }
      }
    }

    activoActual.fill(0);
    let activasAhora = 0;

    // ---- 2 a 6. Una pasada por persona, SIEMPRE en orden de id. ----
    for (let i = 0; i < n; i += 1) {
      const persona = personas[i];
      const territorioId = territorioDe[i];
      if (persona === undefined || territorioId === undefined) continue;
      const conducta = persona.conducta;

      // ---- 4. Ve. `radioAtencion` acota qué mira de la ronda anterior. ----
      const visto = loQueVe(
        conducta,
        activoAnterior,
        mecanismo.grado,
        activosTerritorioAnterior.get(territorioId) ?? 0,
        personasPorTerritorio.get(territorioId) ?? 0,
        activosPaisAnterior,
        n,
      );

      // ---- 2. Activación en dos pasos: empuje del mundo × propensión propia.
      const empuje =
        chispa + contagio * visto + (yaHablo[i] === 1 ? conducta.constanciaPersonal : 0);
      /**
       * El desaliento es el ÚNICO camino por el que la resistencia desmoviliza,
       * y sólo existe en este modo. Con `desaliento = 0` los dos modos obedecen
       * la resistencia exactamente igual —sólo en el piso—, que es lo que los
       * mantiene comparables.
       */
      const freno = acotar(1 - desaliento * resistencia, 0, 1);
      const probabilidad = acotar(conducta.propension * empuje * freno, 0, 1);
      const habla =
        !silenciados.has(territorioId) &&
        azarDe(esc.semilla, r, i, PROPOSITO.ACTIVAR) < probabilidad;

      if (habla) {
        // ---- 3. Emite. ----
        const tipo = elegirTipo(conducta, azarDe(esc.semilla, r, i, PROPOSITO.TIPO));
        const clase = claseDe(tipo);
        const anonima = azarDe(esc.semilla, r, i, PROPOSITO.ANONIMO) < anonimato;
        const actorId = anonima ? null : i;
        const plazoRondas =
          clase === 'acto'
            ? 1 +
              Math.floor(
                azarDe(esc.semilla, r, i, PROPOSITO.PLAZO) * Math.max(1, PLAZO_MAXIMO_DE_ACTO),
              )
            : null;

        const senal = armarSenal({
          id: senales.length,
          ronda: r,
          rondas,
          ahora: pais.ahora,
          territorioId,
          celdaId: persona.territorio.celdaId,
          tipo,
          actorId,
          texto: elegirFrase(persona, tipo, azarDe(esc.semilla, r, i, PROPOSITO.FRASE)),
          plazoRondas,
          sello: elenco.sello,
          /**
           * La pregunta de la casa se sortea con su propio propósito: si
           * compartiera el número con «¿qué tipo emite?», el que dice `basta`
           * contestaría siempre lo mismo y el mapa ensayado tendría una
           * correlación que nadie puso y que igual se vería razonable.
           */
          vivienda: elegirVivienda(vivienda, azarDe(esc.semilla, r, i, PROPOSITO.VIVIENDA)),
        });
        senales.push(senal);
        confirmantes.push(new Set());
        cosecha.anotarSenal(territorioId, r, clase, actorId);
        agregarViva(vivasDeEstaRonda, territorioId, { indice: senal.id, clase, actorId });
        if (plazoRondas !== null) anotarCierre(cierresPorRonda, r + plazoRondas, senal.id);

        activoActual[i] = 1;
        yaHablo[i] = 1;
        activasAhora += 1;
      }

      const candidatas = vivasPorTerritorio.get(territorioId) ?? [];
      if (candidatas.length === 0) continue;

      // ---- 5. Adhiere. Una ARISTA, nunca un contador en la fila. ----
      if (visto >= conducta.umbralAdhesion) {
        const elegida = elegirDe(candidatas, azarDe(esc.semilla, r, i, PROPOSITO.ADHERIR));
        if (elegida !== null && elegida.actorId !== i) {
          adhesiones.push({ senalId: elegida.indice, personaId: i, ronda: r });
          cosecha.anotarActuacion(territorioId, r, elegida.clase, i);
        }
      }

      // ---- 6. Corrobora. Sólo `hecho` y `acto` — regla 11. ----
      if (visto >= conducta.umbralCorroboracion) {
        const verificables = candidatas.filter((c) => esVerificable(c.clase) && c.actorId !== i);
        const elegida = elegirDe(verificables, azarDe(esc.semilla, r, i, PROPOSITO.CORROBORAR));
        if (elegida !== null) {
          const set = confirmantes[elegida.indice];
          if (set !== undefined && !set.has(i)) {
            set.add(i);
            confirmaciones.push({
              senalId: elegida.indice,
              personaId: i,
              ronda: r,
              veredicto: 'confirma',
            });
            cosecha.anotarActuacion(territorioId, r, elegida.clase, i);
            if (set.size >= ACTORES_PARA_CORROBORAR) {
              const previa = senales[elegida.indice];
              if (previa?.estado === 'enviada') {
                senales[elegida.indice] = { ...previa, estado: 'corroborada' };
              }
            }
          }
        }
      }
    }

    // ---- 7. Cumple. Es la primera vez que `cumplimiento` hace algo. ----
    for (const senalId of cierresPorRonda.get(r) ?? []) {
      const acto = senales[senalId];
      if (acto?.desenlace !== 'abierto') continue;
      const cumple = azarDe(esc.semilla, r, senalId, PROPOSITO.CUMPLIR) < acotar(cumplimiento, 0, 1);
      senales[senalId] = {
        ...acto,
        desenlace: cumple ? 'cumplido' : 'no_cumplido',
        estado: cumple ? 'resuelta' : acto.estado,
      };
      if (cumple) {
        // Cerrar un compromiso es un acto, y deja marca: una voz más en la
        // ronda del cierre. Sin esto `cumplimiento` sería la novena perilla de
        // utilería, que es exactamente lo que este módulo viene a no repetir.
        const cierre = armarSenal({
          id: senales.length,
          ronda: r,
          rondas,
          ahora: pais.ahora,
          territorioId: acto.territorioId,
          celdaId: acto.celdaId,
          tipo: acto.tipo,
          actorId: acto.actorId,
          texto: `Cumplido: ${acto.texto}`,
          plazoRondas: 1,
          sello: elenco.sello,
          /**
           * El cierre habla del MISMO lugar que el compromiso que cierra: se
           * hereda su respuesta en vez de sortear una nueva. Sortearla otra vez
           * dejaría dos filas del mismo lugar con distinta protección, y la más
           * floja de las dos manda.
           */
          vivienda: acto.ubicacion.vivienda,
        });
        senales.push({ ...cierre, estado: 'resuelta', desenlace: 'cumplido' });
        confirmantes.push(new Set());
        cosecha.anotarSenal(acto.territorioId, r, 'acto', acto.actorId);
      }
    }

    // ---- 8. Cierra la ronda. ----
    activasPorRonda.push(activasAhora);
    activoAnterior.set(activoActual);
    activosPaisAnterior = activasAhora;
    activosTerritorioAnterior.clear();
    for (let i = 0; i < n; i += 1) {
      if (activoActual[i] !== 1) continue;
      const t = territorioDe[i];
      if (t !== undefined) {
        activosTerritorioAnterior.set(t, (activosTerritorioAnterior.get(t) ?? 0) + 1);
      }
    }
    vivasPorTerritorio = vivasDeEstaRonda;
  }

  return {
    cosecha: cosecha.cerrar(rondas, autoridad),
    rondas,
    poblacionHuella: elenco.poblacion.huella,
    sello: elenco.sello,
    rastro: quiereRastro ? { senales, adhesiones, confirmaciones } : null,
    activasPorRonda,
  };
}

/** La forma del modo: escenario y país entran, cosecha sale. */
export function modoGente(esc: Escenario, pais: Pais, elenco: Elenco | null): Cosecha {
  if (elenco === null) {
    throw new Error(
      'El modo gente necesita un elenco y llegó `null`. El modo forma no tiene ninguno, y darle ' +
        'una población falsa para «unificar» sería inventar exactamente lo que este modo existe ' +
        'para modelar.',
    );
  }
  return correrFuncion(esc, pais, elenco).cosecha;
}

/**
 * El retrato de lo que produjo la gente, con el MISMO motor de mandatos.
 *
 * No hay un segundo `hayMandato` ni un segundo piso: la cosecha se pliega y
 * entra por `armarRetrato`, la misma función que arma el lado del silencio. Es
 * lo que hace que las dos mitades de la cortina sean comparables — y el
 * `sello` es lo que impide que se lean con el mismo peso.
 */
export function retratoDeLaFuncion(
  cosecha: Cosecha,
  territorios: readonly Territorio[],
  esc: Escenario,
  sello: SelloDelModelo | null,
  clase: ClaseSenal | null = null,
): Retrato {
  const conteo = new Map<string, number>();
  const periodos = new Map<string, Set<number>>();
  for (const celda of cosecha.celdas) {
    if (clase !== null && celda.clase !== clase) continue;
    conteo.set(celda.territorioId, (conteo.get(celda.territorioId) ?? 0) + celda.voces);
    if (celda.voces > 0) {
      const set = periodos.get(celda.territorioId);
      if (set === undefined) periodos.set(celda.territorioId, new Set([celda.periodo]));
      else set.add(celda.periodo);
    }
  }
  const sostenidos = new Map<string, number>();
  for (const [id, set] of periodos) sostenidos.set(id, set.size);

  return armarRetrato({
    conteo,
    sostenidosPorTerritorio: sostenidos,
    periodosTotales: cosecha.periodos,
    piso: pisoEfectivo(esc.ajustes.resistencia, esc.coeficientes),
    territorios,
    fuente: 'función del elenco: una voz por señal emitida',
    esMedido: false,
    coeficientes: esc.coeficientes,
    sello,
  });
}

/* ------------------------------------------------------------------ *
 * Piezas
 * ------------------------------------------------------------------ */

/**
 * El orden canónico del guion.
 *
 * Nunca el orden de llegada: es el bug del `asyncio.gather` de OASIS, donde
 * dos corridas idénticas aplican los mismos efectos en distinto orden y dan
 * resultados distintos sin que nada avise.
 */
function ordenarGuion(guion: readonly Evento[]): readonly Evento[] {
  return [...guion].sort((a, b) => {
    if (a.ronda !== b.ronda) return a.ronda - b.ronda;
    if (a.que !== b.que) return a.que < b.que ? -1 : 1;
    const ja = JSON.stringify(a);
    const jb = JSON.stringify(b);
    return ja < jb ? -1 : ja > jb ? 1 : 0;
  });
}

/**
 * Qué ve una persona de la ronda anterior.
 *
 * `grado` acota cuántos de sus vínculos declarados mira efectivamente: la
 * topología vive en el elenco y es fija, pero **cuánta de esa topología se
 * atiende** es una palanca del mecanismo que se puede barrer sin regenerar el
 * elenco. Sin esto, `grado` sería una perilla que nadie lee — la decimocuarta.
 */
function loQueVe(
  conducta: Conducta,
  activoAnterior: Uint8Array,
  grado: number,
  activosTerritorio: number,
  personasTerritorio: number,
  activosPais: number,
  n: number,
): number {
  const cuantos = Math.max(0, Math.min(conducta.vinculos.length, Math.trunc(grado)));
  let activos = 0;
  for (let k = 0; k < cuantos; k += 1) {
    const vinculo = conducta.vinculos[k];
    if (vinculo !== undefined && activoAnterior[vinculo] === 1) activos += 1;
  }
  const porVinculos = cuantos === 0 ? 0 : activos / cuantos;

  const ambiente =
    conducta.radioAtencion === 'pais'
      ? n === 0
        ? 0
        : activosPais / n
      : personasTerritorio === 0
        ? 0
        : activosTerritorio / personasTerritorio;

  const peso = PESO_DEL_AMBIENTE[conducta.radioAtencion];
  return acotar((1 - peso) * porVinculos + peso * ambiente, 0, 1);
}

/** Qué tipo emite, según su mezcla. */
function elegirTipo(conducta: Conducta, sorteo: number): TipoSenal {
  const pesos = TIPOS_SENAL.map((t) => conducta.mezclaTipos[t]);
  const indice = elegirPorPeso(pesos, sorteo);
  return TIPOS_SENAL[indice === -1 ? 0 : indice] ?? 'basta';
}

/**
 * Qué dice.
 *
 * Fidelidad `guionada`: elige entre las frases que el modelo escribió cuando
 * se generó el elenco. **Cero llamadas al modelo durante la función**, y es la
 * única fidelidad que un barrido puede usar.
 */
function elegirFrase(persona: Persona, tipo: TipoSenal, sorteo: number): string {
  const propias = persona.semblanza.frases.filter((f) => f.tipo === tipo);
  const banco = propias.length > 0 ? propias : persona.semblanza.frases;
  if (banco.length === 0) return '';
  const elegida = banco[Math.min(banco.length - 1, Math.floor(sorteo * banco.length))];
  return elegida?.texto ?? '';
}

function elegirDe(candidatas: readonly SenalViva[], sorteo: number): SenalViva | null {
  if (candidatas.length === 0) return null;
  const indice = Math.min(candidatas.length - 1, Math.floor(sorteo * candidatas.length));
  return candidatas[indice] ?? null;
}

/**
 * Qué contesta esta señal a la pregunta de la casa, según el reparto declarado.
 *
 * Con todos los pesos en cero —que es lo que devuelve `elegirPorPeso` con
 * `-1`— la respuesta es `'sinRespuesta'`: el lado seguro. No hay reparto que
 * pueda producir «publicable» por omisión.
 */
function elegirVivienda(reparto: RepartoDeVivienda, sorteo: number): RespuestaDeVivienda {
  const indice = elegirPorPeso(
    RESPUESTAS_DE_VIVIENDA.map((r) => reparto[r]),
    sorteo,
  );
  return indice === -1 ? 'sinRespuesta' : (RESPUESTAS_DE_VIVIENDA[indice] ?? 'sinRespuesta');
}

interface ArmadoDeSenal {
  id: number;
  ronda: number;
  rondas: number;
  ahora: number;
  territorioId: string;
  celdaId: string;
  tipo: TipoSenal;
  actorId: number | null;
  texto: string;
  plazoRondas: number | null;
  sello: SelloDelModelo | null;
  vivienda: RespuestaDeVivienda;
}

/**
 * Arma una señal con todos los campos que la ingesta real exige.
 *
 * La fecha se ubica en el MEDIO de su período para que `periodoDe` de
 * `retrato.ts` —`floor((ahora − fecha) / mes)`— la cuente en el período de su
 * ronda. Un milisegundo de corrimiento voltea el mandato de un territorio, y
 * eso ya pasó una vez en producción.
 */
function armarSenal(a: ArmadoDeSenal): SenalEnsayada {
  const clase = claseDe(a.tipo);
  const publicadaEn = a.ahora - (a.rondas - 1 - a.ronda) * MS_POR_PERIODO - MS_POR_PERIODO / 2;
  const comprometidoPara =
    clase === 'acto' && a.plazoRondas !== null ? publicadaEn + a.plazoRondas * MS_POR_PERIODO : null;
  const { venceEl, caducaEl } = vencimientosDe(a.tipo, publicadaEn, comprometidoPara);

  const base = declarado(
    1,
    'voz',
    a.actorId === null ? 'elenco: señal sin actor conocido' : `elenco: persona ${String(a.actorId)}`,
  );

  return {
    id: a.id,
    ronda: a.ronda,
    territorioId: a.territorioId,
    celdaId: a.celdaId,
    tipo: a.tipo,
    clase,
    actorId: a.actorId,
    texto: a.texto,
    publicadaEn,
    venceEl,
    caducaEl,
    comprometidoPara,
    estado: 'enviada',
    desenlace: clase === 'acto' ? 'abierto' : null,
    voz: a.sello === null ? base : hipotesis(base, a.sello),
    /**
     * La ubicación sale de `ubicacionEnsayada`, que llama a
     * `prepareRecordLocation` — la misma función que corre el servidor sobre una
     * señal real. Ninguna decisión de protección se toma acá adentro: si se
     * tomara, sería una segunda política, y dos políticas divergen.
     */
    ubicacion: ubicacionEnsayada(a.tipo, a.vivienda),
  };
}

function agregarViva(
  mapa: Map<string, SenalViva[]>,
  territorioId: string,
  viva: SenalViva,
): void {
  const lista = mapa.get(territorioId);
  if (lista === undefined) mapa.set(territorioId, [viva]);
  else lista.push(viva);
}

function anotarCierre(mapa: Map<number, number[]>, ronda: number, senalId: number): void {
  const lista = mapa.get(ronda);
  if (lista === undefined) mapa.set(ronda, [senalId]);
  else lista.push(senalId);
}

/* ------------------------------------------------------------------ *
 * El acumulador de la cosecha
 * ------------------------------------------------------------------ */

/**
 * Arma una cosecha contando personas DISTINTAS por celda.
 *
 * El `ConstructorDeCosecha` de la espina suma contadores, que es lo que
 * necesita el modo forma; acá hace falta un conjunto por celda, porque la
 * misma persona puede emitir, adherir y confirmar en la misma celda y es **una
 * sola persona**. Contarla tres veces sería contar filas, que es exactamente
 * lo que la regla 8 prohíbe.
 *
 * La clave junta territorio, período y clase con **U+0000, escrito como
 * secuencia de escape y no como byte crudo**, y las dos mitades importan.
 *
 * El separador es NUL porque es el único carácter que no puede aparecer adentro
 * de un `territorioId`: «Buenos Aires» tiene un espacio, y un id podría tener
 * un guion, un punto o una coma. Con un separador que el dato puede contener,
 * dos ternas distintas colisionan en la misma cadena y dos celdas se cuentan
 * como una — que es contar mal justo donde la regla 8 pide contar personas.
 *
 * Y va **escapado** y no crudo. Con el byte literal en el archivo, `file` lo
 * reporta como `data`, `grep` no encuentra una sola función de las trece que
 * tiene, y `rg` avisa «binary file matches» y no muestra nada: el archivo más
 * grande del modo gente queda invisible para toda búsqueda. El valor en tiempo
 * de ejecución es idéntico; lo que cambia es que se pueda leer.
 *
 * Este comentario ya se escribió mal dos veces —una prometiendo un NUL que no
 * estaba, otra negando el que sí está— así que hay un test que lo fija: si
 * alguien cambia el separador, falla.
 */
export class CosechaEnArmado {
  private readonly voces = new Map<string, number>();
  private readonly sinActor = new Map<string, number>();
  private readonly actores = new Map<string, Set<number>>();
  private readonly indice = new Map<string, { territorioId: string; periodo: number; clase: ClaseSenal }>();
  private periodoMaximo = -1;

  private registrar(territorioId: string, periodo: number, clase: ClaseSenal): string {
    const k = `${territorioId}\u0000${String(periodo)}\u0000${clase}`;
    if (!this.indice.has(k)) this.indice.set(k, { territorioId, periodo, clase });
    if (periodo > this.periodoMaximo) this.periodoMaximo = periodo;
    return k;
  }

  anotarSenal(
    territorioId: string,
    periodo: number,
    clase: ClaseSenal,
    actorId: number | null,
  ): void {
    const k = this.registrar(territorioId, periodo, clase);
    this.voces.set(k, (this.voces.get(k) ?? 0) + 1);
    if (actorId === null) this.sinActor.set(k, (this.sinActor.get(k) ?? 0) + 1);
    else this.sumarActor(k, actorId);
  }

  /** Alguien actuó sin emitir: adhirió o confirmó. Suma persona, no voz. */
  anotarActuacion(territorioId: string, periodo: number, clase: ClaseSenal, actorId: number): void {
    const k = this.registrar(territorioId, periodo, clase);
    if (!this.voces.has(k)) this.voces.set(k, 0);
    this.sumarActor(k, actorId);
  }

  private sumarActor(clave: string, actorId: number): void {
    const set = this.actores.get(clave);
    if (set === undefined) this.actores.set(clave, new Set([actorId]));
    else set.add(actorId);
  }

  /**
   * Cierra en el orden canónico de la espina: dos corridas iguales dan el
   * mismo array, y **las dos dinámicas dan el mismo array**.
   *
   * `compararCeldas` y no un comparador propio, porque `huellaDeCosecha` hashea
   * `celdas` en el orden del array: el orden ES parte de la identidad. Este
   * método tenía el suyo y ordenaba la clase alfabéticamente
   * —`acto, deseo, hecho, meta`— contra el orden canónico del vocabulario
   * —`hecho, deseo, acto, meta`—, así que las mismas celdas hasheaban distinto
   * según qué modo las hubiera producido. Es exactamente lo que el comentario
   * de `compararCeldas` advertía que pasaría si cada dinámica elegía el suyo.
   */
  cerrar(periodos: number, autoridad: 'declarada' | 'hipotesis'): Cosecha {
    const celdas: CeldaDeCosecha[] = [];
    for (const [clave, campos] of this.indice) {
      celdas.push({
        territorioId: campos.territorioId,
        periodo: campos.periodo,
        clase: campos.clase,
        voces: this.voces.get(clave) ?? 0,
        actores: this.actores.get(clave)?.size ?? 0,
        sinActor: this.sinActor.get(clave) ?? 0,
      });
    }
    celdas.sort(compararCeldas);
    return { celdas, periodos: Math.max(periodos, this.periodoMaximo + 1), autoridad };
  }
}
