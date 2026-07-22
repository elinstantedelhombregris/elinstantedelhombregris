/**
 * Recorrido del sitio en el sistema «Papel y Tinta».
 *
 * Los labels vienen del diseño (BASTA v2); los href apuntan a las rutas
 * v2 existentes hasta que cada página se rediseñe (ver spec
 * docs/specs/2026-07-21-landing-papel-y-tinta.md).
 */
export interface PapelNavItem {
  href: string;
  label: string;
  /** Número de expediente mostrado en el menú móvil y el footer. */
  num: string;
}

export const PAPEL_NAV: readonly PapelNavItem[] = [
  { href: '/la-idea', label: 'La idea', num: '01' },
  { href: '/el-mapa', label: 'El mapa', num: '02' },
  { href: '/mandato-vivo', label: 'El mandato', num: '03' },
  { href: '/planes', label: 'La prueba', num: '04' },
  { href: '/ensayos', label: 'La biblioteca', num: '05' },
];

export const PAPEL_NAV_ALL: readonly PapelNavItem[] = [
  { href: '/', label: 'Inicio', num: '00' },
  ...PAPEL_NAV,
  { href: '/la-semilla-de-basta', label: 'Sembrar', num: '06' },
];

export const SEMBRAR_HREF = '/la-semilla-de-basta';

/**
 * Contador FOMO del header: «{N} voces · falta la tuya».
 * Dato de demostración hasta que exista el endpoint real de voces
 * (la plataforma real arranca en cero, y eso también está bien).
 */
export const DEMO_VOCES_COUNT = '12.496';
