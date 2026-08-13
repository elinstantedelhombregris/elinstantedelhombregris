import type { Veredicto } from './espina/veredicto.js';
import type { Magnitud } from './procedencia.js';
import type { ClaseSenal, LecturaDeTipo } from '../senal/vocabulario.js';

/**
 * El vocabulario viejo de la Simulación —seis tipos con `valor` adentro— **ya
 * no vive acá**.
 *
 * Vivía: `TipoVozCivica` y `TIPOS_VOZ_CIVICOS`, con un comentario que prometía
 * migrarlos «en la rebanada 2». Mientras existieron, `Palancas.composicion`
 * pedía seis claves que ningún cálculo leía y `VozMedida.tipo` sólo aceptaba
 * uno de esos seis — así que la web tenía que plegar con `?? 'valor'` todo lo
 * que no fuera del catálogo **antes de entrar al motor**, y la huella del país
 * no podía distinguir una voz de tipo `basta` de una que decía cualquier otra
 * cosa. Un vocabulario muerto no se muere solo: se muere cuando se le sacan los
 * dos campos que lo obligaban a existir.
 *
 * La fuente única del canon es `senal/vocabulario.ts`: nueve tipos en cuatro
 * clases, sin `valor` —un valor no tiene coordenada— y sin sumidero.
 */

export interface Territorio {
  id: string;
  nombre: string;
  poblacion: number;
  km2: number;
}

export interface VozMedida {
  territorioId: string;
  /**
   * El tipo **tal como se lo leyó**, no plegado.
   *
   * Es una `LecturaDeTipo` y no un `TipoSenal` porque lo que entra al motor
   * viene de una base con años de categorías escritas antes de que el canon
   * existiera. Un tipo pelado obligaría al call site a elegir uno del canon
   * para lo que no matchea, que es exactamente el `?? 'valor'` que esto viene a
   * sacar: lo desconocido entra diciendo que es desconocido, y `claveDeTipo` le
   * da una clave estable para la huella sin darle un tipo real.
   */
  tipo: LecturaDeTipo;
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
  /**
   * Mezcla de las cuatro CLASES. Las claves suman 1.
   *
   * Las mismas cuatro que `Forma.composicion` de la espina, y por la misma
   * razón: la clase es la que toca maquinaria —`hecho` y `acto` se corroboran,
   * `deseo` se delibera, `meta` se responde— y `composicion.hecho +
   * composicion.acto` es «cuánto de lo que se dice es comprobable». Nueve
   * deslizadores que suman 1 no son un control; cuatro sí.
   *
   * Este motor todavía **no la lee** —el panel lo dice con esas palabras—, pero
   * pedir las claves del canon es lo que hace que conectarla sea conectar una
   * palanca y no migrar un vocabulario.
   */
  composicion: Readonly<Record<ClaseSenal, number>>;
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
