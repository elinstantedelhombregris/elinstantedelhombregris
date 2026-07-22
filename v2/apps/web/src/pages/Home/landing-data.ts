import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * Datos de la landing «Papel y Tinta».
 *
 * Las voces, propuestas y señales de la home vienen de la API real
 * (ver `~/lib/queries/analytics`) — no hay datos de demostración acá.
 * Los planes son reales: salen de PLAN_REGISTRY (MDX).
 */

export interface TresLineasRow {
  num: string;
  a: string;
  b: string;
  def: string;
}

export const TRES_LINEAS: readonly TresLineasRow[] = [
  {
    num: '01',
    a: 'La ciudadanía',
    b: 'diseña.',
    def: 'Vos decís qué país querés — en el mapa, con tu voz. Nadie interpreta por vos.',
  },
  {
    num: '02',
    a: 'El Estado',
    b: 'administra.',
    def: 'Técnicos que gestionan lo diseñado. Gerentes, no dueños.',
  },
  {
    num: '03',
    a: 'La política',
    b: 'ejecuta.',
    def: 'El que quiera un cargo firma el mandato ciudadano. Y rinde cuentas en público.',
  },
];

/** Planes reales (sin PLANRUTA, que es meta) ordenados por orderIndex. */
export const PLANES_REALES = PLAN_REGISTRY.filter((p) => !p.isMeta);

export const PLAN_COUNT = PLANES_REALES.length;

/** Los tres planes destacados del teaser. */
export const PLANES_TEASER = PLANES_REALES.slice(0, 3);

export interface Tally {
  alto: number;
  rot: number;
  color: string;
}

/** Palitos de la banda del hombre gris — pseudo-aleatorio determinista del diseño. */
export const TALLIES: readonly Tally[] = Array.from({ length: 72 }, (_, i) => ({
  alto: 22 + ((i * 7) % 16),
  rot: ((i * 13) % 11) - 5,
  color: i === 47 ? '#5227CC' : i % 9 === 0 ? '#F2EFE7' : '#6B675E',
}));
