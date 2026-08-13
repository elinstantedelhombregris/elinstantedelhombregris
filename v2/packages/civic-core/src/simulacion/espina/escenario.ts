/**
 * El país y el escenario, partidos a propósito — spec §3.1 y §3.2.
 *
 * Lo pesado (`Pais`) no viaja en una URL: viaja su **huella**. Lo liviano
 * (`Escenario`) entra entero en un hash y es lo que se comparte, se guarda y se
 * barre.
 *
 * Tres cosas que este corte resuelve:
 *
 * - **`ahora` vive en `Pais`** y no se lee en el render. Hoy
 *   `useModoSimulacion.tsx:62` llama `Date.now()` adentro de un `useMemo` que
 *   depende de las palancas: mover un dial recalcula el silencio con un reloj
 *   nuevo, y un milisegundo alcanza para voltear el mandato de un territorio
 *   cuando una voz cae cerca del borde de un período. Para el mapa es un bug;
 *   para un barrido es bloqueante, porque dos corridas del mismo diseño dejan
 *   de ser comparables.
 * - **`correr()` tira si `pais.huella !== esc.paisHuella`.** Es la guarda que
 *   impide comparar dos corridas contra países distintos creyendo que
 *   comparaste palancas.
 * - **`pregunta` es obligatoria.** Un escenario sin pregunta es un juego de
 *   perillas, y barrer una perilla sin pregunta no significa nada.
 */

import { claveDeTipo } from '../../senal/vocabulario.js';

import { acumularHuella, huellaHex, SEMILLA_FNV } from './azar.js';

import type { ClaseSenal, TemaClave, TipoSenal } from '../../senal/vocabulario.js';
import type { Coeficientes } from '../coeficientes.js';
import type { EstadoMedido, Territorio } from '../tipos.js';

/**
 * La versión del motor. Viaja con cada corrida serializada: dos resultados
 * calculados por motores distintos no son comparables, y sin este campo la
 * diferencia se descubre discutiendo en vez de leyendo.
 *
 * Se mueve cuando cambia un número del resultado, no cuando cambia un comentario.
 */
export const MOTOR = 'civic-core/simulacion@2026-08-13';

export type NivelTerritorial = 'provincia' | 'departamento' | 'municipio' | 'localidad';

/** Lo pesado. No viaja en una URL: viaja su huella. */
export interface Pais {
  /** FNV-1a sobre las voces ordenadas, los territorios, `ahora` y el nivel. */
  readonly huella: string;
  /** EL RELOJ CONGELADO. Entra por parámetro una vez y no se vuelve a leer. */
  readonly ahora: number;
  readonly base: EstadoMedido;
  readonly territorios: readonly Territorio[];
  readonly nivel: NivelTerritorial;
}

/**
 * LA FORMA — el modo forma la **declara**, el modo gente la **produce**.
 *
 * Que las cuatro sean entrada de un modo y salida del otro es lo que hace que
 * el desacuerdo entre modos se pueda calcular en vez de discutir (§5.2).
 */
export interface Forma {
  /** Voces cada 100.000 habitantes. */
  readonly participacion: number;
  /** 0 = todo concentrado · 1 = repartido en proporción a la población. */
  readonly dispersion: number;
  /** 0 = estallido · 1 = goteo parejo. */
  readonly constancia: number;
  /**
   * Cuatro claves que suman 1. **La palanca es la CLASE, no el tipo**, porque
   * la clase es la única que toca maquinaria: `hecho` y `acto` corren
   * corroboración, `deseo` no (y la deliberación no está construida), `meta` se
   * responde. `composicion.hecho + composicion.acto` es literalmente «cuánto de
   * lo que se dice es comprobable», que es el multiplicador del denominador de
   * la nitidez. Nueve deslizadores que suman 1 no son un control; cuatro sí.
   */
  readonly composicion: Readonly<Record<ClaseSenal, number>>;
}

/** LOS AJUSTES — los dos modos los obedecen, en el mismo lugar del cálculo. */
export interface Ajustes {
  /** Años. `periodosDelHorizonte()` lo vuelve meses, que son las rondas. */
  readonly horizonte: number;
  /**
   * 0 = el sistema colabora · 1 = bloquea. Toca `pisoEfectivo()` y **nada
   * más**, en los dos modos. Cargarle también la desmovilización sería
   * tentador y sería el error: una variable que entra en dos lugares distintos
   * deja de ser comparable entre modos. El desánimo se llama `desaliento` y es
   * de mecanismo.
   */
  readonly resistencia: number;
  /**
   * Fracción de los `acto` que cierran cumplidos. **Nunca multiplica la
   * legitimidad**: cumplir es una propiedad de la señal, no un descuento sobre
   * el mandato de un territorio.
   */
  readonly cumplimiento: number;
}

/** EL MECANISMO — sólo modo gente. En modo forma es `null`, y se ve. */
export interface Mecanismo {
  readonly poblacionHuella: string;
  /** Fracción que arranca sin que nadie la mueva. */
  readonly chispa: number;
  /** Cuánto pesa un vecino que ya habla. */
  readonly contagio: number;
  /** Cuánto desmoviliza la resistencia. NO es `resistencia`. */
  readonly desaliento: number;
  /** Vínculos por persona. */
  readonly grado: number;
}

/**
 * Sobre qué hay mandato.
 *
 * Hoy el motor genera exactamente uno, indiferenciado —«este territorio cruzó
 * el piso y lo sostuvo»— porque `VozMedida.tipo` nunca se lee. Con este eje,
 * «qué mandatos podemos generar» pasa a tener respuesta contable: 4 clases +
 * 9 tipos + los temas, por territorio. `hayMandato()` no se toca: se la llama
 * una vez por clave.
 *
 * `tipo` y `tema` **no son computables desde una `Cosecha`**, que lleva
 * territorio × período × clase: entran cuando la cosecha lleve esos ejes
 * (rebanadas 2 y 5). Pedirlos antes tira, y tirar es mejor que devolver un
 * retrato de todas las clases haciéndolo pasar por uno de un tipo.
 */
export type EjeDeMandato =
  | { eje: 'ninguno' }
  | { eje: 'clase'; clave: ClaseSenal }
  | { eje: 'tipo'; clave: TipoSenal }
  | { eje: 'tema'; clave: TemaClave };

/** Lo liviano y citable. Entra entero en un hash de URL. */
export interface Escenario {
  /** `'el-que-sostiene'`. */
  readonly id: string;
  readonly nombre: string;
  /** OBLIGATORIA. Un escenario sin pregunta es un juego de perillas. */
  readonly pregunta: string;
  readonly paisHuella: string;
  readonly eje: EjeDeMandato;
  readonly forma: Forma;
  readonly ajustes: Ajustes;
  /** Decisiones nuestras, no de la gente. Barrerlas es media pregunta más. */
  readonly coeficientes: Coeficientes;
  /** Identidad de la corrida, no una perilla: por eso no vive en `Forma`. */
  readonly semilla: number;
  /** `null` en modo forma, y se ve. */
  readonly mecanismo: Mecanismo | null;
  readonly motor: string;
}

/**
 * La huella del país.
 *
 * La spec la define sobre `(territorioId, fecha)` ordenado; entran además los
 * territorios, `ahora` y el nivel, porque los tres cambian el resultado y la
 * huella existe justamente para que dos corridas contra países distintos no se
 * comparen. Una huella que ignorara `ahora` dejaría pasar exactamente el bug
 * del §1.5.
 */
export function huellaDePais(
  base: EstadoMedido,
  territorios: readonly Territorio[],
  nivel: NivelTerritorial,
): string {
  let h = acumularHuella(SEMILLA_FNV, `${nivel}|${String(base.ahora)}|`);

  const territoriosOrdenados = [...territorios].sort((a, b) => (a.id < b.id ? -1 : 1));
  for (const t of territoriosOrdenados) {
    h = acumularHuella(h, `${t.id}:${String(t.poblacion)};`);
  }

  h = acumularHuella(h, '|voces|');
  /**
   * El tipo entra por `claveDeTipo` y no pelado: una voz cuyo tipo no está en el
   * canon conserva su nombre crudo detrás de un prefijo, en vez de plegarse
   * contra un tipo real. Con el `?? 'valor'` de antes, dos países con voces
   * distintas podían compartir huella y compararse como si fueran el mismo.
   */
  const clave = (v: EstadoMedido['voces'][number]): string => claveDeTipo(v.tipo);
  const voces = [...base.voces].sort((a, b) => {
    if (a.territorioId !== b.territorioId) return a.territorioId < b.territorioId ? -1 : 1;
    if (a.fecha !== b.fecha) return a.fecha - b.fecha;
    const [ca, cb] = [clave(a), clave(b)];
    return ca < cb ? -1 : ca > cb ? 1 : 0;
  });
  for (const v of voces) {
    h = acumularHuella(h, `${v.territorioId}:${String(v.fecha)}:${clave(v)};`);
  }

  return huellaHex(h);
}

/** Congela el reloj y calcula la huella. Es el único constructor de `Pais`. */
export function armarPais(
  base: EstadoMedido,
  territorios: readonly Territorio[],
  nivel: NivelTerritorial,
): Pais {
  return {
    huella: huellaDePais(base, territorios, nivel),
    ahora: base.ahora,
    base,
    territorios,
    nivel,
  };
}

/**
 * La guarda del §3.1, escrita una sola vez. Tira: no es un estado esperado que
 * alguien tenga que manejar, es un error de programa —dos objetos que no se
 * corresponden— y devolverlo como valor invitaría a ignorarlo.
 */
export function verificarPais(esc: Escenario, pais: Pais): void {
  if (esc.paisHuella !== pais.huella) {
    throw new Error(
      `El escenario «${esc.id}» se armó contra el país ${esc.paisHuella} y se lo está corriendo ` +
        `contra ${pais.huella}. Dos países distintos: la diferencia que salga no son las palancas.`,
    );
  }
}

/**
 * Un escenario con todo lo obligatorio y nada inventado.
 *
 * `pregunta` no tiene default y no lo va a tener: es el campo que separa un
 * instrumento de un juego de perillas, y un default como «¿qué pasa si…?» lo
 * convertiría en decoración. La composición arranca pareja entre las cuatro
 * clases porque es el único reparto que no afirma nada.
 */
export function escenarioBase(
  pais: Pais,
  id: string,
  nombre: string,
  pregunta: string,
  semilla: number,
  coeficientes: Coeficientes,
): Escenario {
  return {
    id,
    nombre,
    pregunta,
    paisHuella: pais.huella,
    eje: { eje: 'ninguno' },
    forma: {
      participacion: 200,
      dispersion: 0.6,
      constancia: 0.7,
      composicion: { hecho: 0.25, deseo: 0.25, acto: 0.25, meta: 0.25 },
    },
    ajustes: { horizonte: 2, resistencia: 0.3, cumplimiento: 0.5 },
    coeficientes,
    semilla,
    mecanismo: null,
    motor: MOTOR,
  };
}
