import type { Magnitud } from './procedencia.js';

/**
 * El vocabulario de la Simulación — spec §4 y §5.
 *
 * `TipoVozCivica` se define acá y no se importa de la web porque `civic-core`
 * no puede depender de una app. La web mantiene su propia lista en
 * `apps/web/src/lib/tipos-voz.ts`; un test de la web afirma que son idénticas,
 * que es más barato que reestructurar sus tipos.
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
  tieneMandato: boolean;
}

export interface SinDato {
  territorioId: string;
  razon: string;
}

export interface Retrato {
  alcance: Magnitud;
  persistencia: Magnitud;
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
