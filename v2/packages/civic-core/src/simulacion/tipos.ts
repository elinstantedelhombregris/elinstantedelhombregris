import type { Veredicto } from './espina/veredicto.js';
import type { Magnitud } from './procedencia.js';

/**
 * El vocabulario VIEJO de la Simulación — spec §4 y §5 de la spec previa.
 *
 * **Está desfasado y se migra en la rebanada 2.** El canon son nueve tipos en
 * cuatro clases (`senal/vocabulario.ts`, que ya existe y es la fuente única), y
 * `valor` salió del mapa: un valor no tiene coordenada. Esta lista de seis
 * sigue viva porque `Palancas` la usa y `Palancas` la usan `/el-mapa` y su
 * panel; migrarla es un movimiento de la web, y el orden importa —primero
 * migrar el vocabulario, después conectar la palanca—, así que se hace de una
 * sola vez ahí y no a mitad de camino desde acá.
 *
 * Lo nuevo NO la usa: `Forma.composicion` de la espina es
 * `Record<ClaseSenal, number>` con cuatro claves, y el motor **la lee** — la
 * clase es el eje de la cosecha.
 *
 * La fuente única del canon es `senal/vocabulario.ts`. Esta lista no lleva
 * `@deprecated` porque el marcador haría fallar el lint en cada uso legítimo
 * que le queda —`Palancas` y su panel— y un error de lint que hay que ignorar
 * tres veces enseña a ignorar los errores de lint.
 */
export type TipoVozCivica = 'basta' | 'sueño' | 'necesidad' | 'compromiso' | 'recurso' | 'valor';

export const TIPOS_VOZ_CIVICOS: readonly TipoVozCivica[] = [
  'basta',
  'sueño',
  'necesidad',
  'compromiso',
  'recurso',
  'valor',
];

export interface Territorio {
  id: string;
  nombre: string;
  poblacion: number;
  km2: number;
}

export interface VozMedida {
  territorioId: string;
  tipo: TipoVozCivica;
  /** Epoch en milisegundos. */
  fecha: number;
}

/**
 * Lo que hay hoy. `ahora` entra por parámetro: el motor no lee el reloj,
 * porque un motor que lee el reloj no es reproducible.
 */
export interface EstadoMedido {
  voces: readonly VozMedida[];
  ahora: number;
}

export interface Palancas {
  /** Voces cada 100.000 habitantes. */
  participacion: number;
  /** 0 = todo concentrado · 1 = repartido en proporción a la población. */
  dispersion: number;
  /** Mezcla de los seis tipos. Las claves suman 1. */
  composicion: Readonly<Record<TipoVozCivica, number>>;
  /** Horizonte en años. */
  horizonte: number;
  /** 0 = el sistema colabora · 1 = bloquea. */
  resistencia: number;
  /** 0 = estallido · 1 = goteo parejo. */
  constancia: number;
  /** Fracción de los compromisos que se cumplen. */
  cumplimiento: number;
}

export interface RetratoTerritorio {
  territorioId: string;
  voces: Magnitud;
  vocesPorCienMil: Magnitud;
  umbral: Magnitud;
  /**
   * Antes era un `boolean` pelado, y era el único campo del resultado sin
   * procedencia — justo la afirmación que alguien captura en pantalla.
   */
  veredicto: Veredicto;
}

export interface SinDato {
  territorioId: string;
  razon: string;
  /**
   * Las voces que este territorio tenía y que ningún total va a contar.
   *
   * Sin este campo el motor mentía en silencio: `repartir()` garantiza que la
   * suma cierra exacta sobre todos los territorios, y `separarSinDato()`
   * después descartaba los de población ≤ 0. Con dispersión 0 y un territorio
   * sin población que tuviera voces base, el total entero desaparecía y
   * `sinDato` decía «no hay denominador» sin decir que ahí se fue el total.
   */
  vocesPerdidas: Magnitud;
}

export interface Retrato {
  alcance: Magnitud;
  /**
   * Promedio ponderado por población. Antes era el MÁXIMO sobre territorios:
   * uno solo que hubiera sostenido todos los meses fijaba la persistencia
   * NACIONAL en 1,0000 aunque los otros veintitrés hubieran hablado una vez, y
   * como `legitimidad = alcance × persistencia`, la legitimidad del país
   * quedaba multiplicada por su mejor caso. Eso rozaba de frente la regla 5.
   */
  persistencia: Magnitud;
  /** El máximo, que sigue siendo una lectura útil, publicado y rotulado aparte. */
  persistenciaMaxima: Magnitud;
  legitimidad: Magnitud;
  cobertura: Magnitud;
  porTerritorio: ReadonlyMap<string, RetratoTerritorio>;
  /** Territorios excluidos de TODO total, con su razón. */
  sinDato: readonly SinDato[];
}

export interface DiferenciaTerritorio {
  territorioId: string;
  delta: Magnitud;
  ganaMandato: boolean;
}

export interface Diferencia {
  porTerritorio: ReadonlyMap<string, DiferenciaTerritorio>;
  territoriosQueGananMandato: Magnitud;
}

export interface EntradaSimulacion {
  palancas: Palancas;
  base: EstadoMedido;
  territorios: readonly Territorio[];
}

export interface ResultadoSimulacion {
  /** El país medido. Idéntico para toda configuración de palancas (spec S3). */
  silencio: Retrato;
  voz: Retrato;
  diferencia: Diferencia;
}
