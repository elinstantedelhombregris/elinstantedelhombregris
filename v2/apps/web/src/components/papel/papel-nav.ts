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
  { href: '/planes', label: 'El ejemplo', num: '04' },
  { href: '/biblioteca', label: 'La biblioteca', num: '05' },
];

export const BIBLIOTECA_HREF = '/biblioteca';

/**
 * Los cinco estantes de la biblioteca, en el mismo orden en que aparecen en
 * el hub. El header los despliega al pasar el mouse por «La biblioteca»:
 * hasta ahora el único destino era el hub, y para llegar a la bitácora o a
 * los entrenamientos había que atravesarlo entero.
 *
 * `/biblioteca#ensayos` es ancla y no ruta porque el índice de ensayos ES el
 * hub — `/ensayos` redirige ahí desde 3.1. Los otros cuatro son páginas de
 * verdad. La crónica se nombra siempre con el título completo: «crónica» a
 * secas ya significa una entrada de la bitácora (spec 3.6).
 */
export const SECCIONES_BIBLIOTECA: readonly PapelNavItem[] = [
  { href: '/manifiesto', label: 'El manifiesto', num: '05.1' },
  { href: '/biblioteca#ensayos', label: 'Los ensayos', num: '05.2' },
  { href: '/entrenamientos', label: 'Los entrenamientos', num: '05.3' },
  { href: '/cronica', label: 'La crónica del país que viene', num: '05.4' },
  { href: '/bitacora', label: 'La bitácora', num: '05.5' },
];

export const SEMBRAR_HREF = '/sembrar';

export const PAPEL_NAV_ALL: readonly PapelNavItem[] = [
  { href: '/', label: 'Inicio', num: '00' },
  ...PAPEL_NAV,
  { href: SEMBRAR_HREF, label: 'Sembrar', num: '06' },
];
