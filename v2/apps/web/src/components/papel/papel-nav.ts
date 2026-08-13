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

/**
 * «Quién está detrás» — la única página del sitio con entrada única, y
 * deliberadamente fuera del recorrido: vive en la franja inferior del
 * footer y en ningún otro lado (spec 2026-08-10-quien-esta-detras.md).
 *
 * Está acá y no suelta dentro del footer para que la regla sea auditable:
 * si algún día alguien la agrega a `PAPEL_NAV_ALL`, el test de PapelFooter
 * lo caza. La decisión es que el sitio no promocione a la persona; el
 * enlace existe para el que lo busca.
 */
export const QUIEN_HREF = '/quien-esta-detras';
export const QUIEN_LABEL = 'Quién está detrás';

/**
 * «Lo que falta» — el canal de escucha
 * (spec 2026-08-12-lo-que-falta.md). Comparte la franja inferior con «Quién
 * está detrás» y por la misma razón: es una puerta permanente que no compite
 * con las cinco del recorrido. Las dos juntas cierran la simetría —quién
 * sostiene esto, y qué le falta— y ninguna de las dos pide nada a cambio.
 */
export const FALTA_HREF = '/lo-que-falta';
export const FALTA_LABEL = 'Lo que falta';

/**
 * «La Simulación» — el instrumento de análisis
 * (spec 2026-08-13-el-modulo-de-simulacion.md §2.9). Comparte la franja
 * inferior con las dos de arriba y por el mismo motivo: es una **herramienta de
 * trabajo**, no una de las cinco puertas del recorrido. El propósito de la
 * constitución de producto —«no busca retener atención»— vale acá literal: un
 * barrido de sensibilidad no es una sección que compita por lectores, y
 * ponerla en el header prometería que hay algo que mirar cuando lo que hay es
 * algo con qué trabajar.
 */
export const SIMULACION_HREF = '/la-simulacion';
export const SIMULACION_LABEL = 'La simulación';

export const PAPEL_NAV_ALL: readonly PapelNavItem[] = [
  { href: '/', label: 'Inicio', num: '00' },
  ...PAPEL_NAV,
  { href: SEMBRAR_HREF, label: 'Sembrar', num: '06' },
];
