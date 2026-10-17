/**
 * Recorrido del sitio en el sistema «Papel y Tinta».
 *
 * Los labels vienen del diseño (BASTA v2); los href apuntan a las rutas
 * v2 existentes hasta que cada página se rediseñe (ver spec
 * docs/specs/2026-07-21-landing-papel-y-tinta.md).
 */
import { APORTAR_HREF } from '~/lib/participacion/aportar';

export interface PapelNavItem {
  href: string;
  label: string;
  /** Número de expediente mostrado en el menú móvil y el footer. */
  num: string;
}

export const BIBLIOTECA_HREF = '/biblioteca';

export const LA_IDEA_HREF = '/la-idea';

export const CAMPANAS_HREF = '/campanas';

export const PAPEL_NAV: readonly PapelNavItem[] = [
  { href: LA_IDEA_HREF, label: 'La idea', num: '01' },
  { href: '/el-mapa', label: 'Mapa', num: '02' },
  { href: CAMPANAS_HREF, label: 'Campañas', num: '03' },
  { href: '/la-radiografia', label: 'Radiografía', num: '04' },
  { href: BIBLIOTECA_HREF, label: 'Biblioteca', num: '05' },
];

/**
 * Lo que cuelga de «La idea»: los planes, que son el ejemplo de lo que el
 * método puede producir (el capítulo II de la página termina mandando ahí).
 * Hasta ahora `/planes` no tenía una puerta en ningún menú.
 */
export const SECCIONES_LA_IDEA: readonly PapelNavItem[] = [
  { href: '/planes', label: 'Los planes', num: '01.1' },
];

/**
 * Lo que cuelga de «Campañas»: las fichas, que es adonde sigue una campaña
 * (una campaña pregunta; una ficha junta lo que un grupo va armando con las
 * respuestas). Tampoco tenían puerta en el recorrido.
 *
 * La Radiografía no cuelga de ningún lado: ya es la cuarta entrada del
 * recorrido, y durante un tiempo estuvo repetida como hija de «Mapa».
 */
export const SECCIONES_CAMPANAS: readonly PapelNavItem[] = [
  { href: '/fichas', label: 'Las fichas', num: '03.1' },
  { href: '/iniciativas', label: 'Sumarme a una tarea', num: '03.2' },
];

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
  { href: APORTAR_HREF, label: 'Imaginar mi Argentina', num: '06' },
  { href: '/mi-espacio', label: 'Mi espacio', num: '07' },
  { href: '/datos-abiertos', label: 'Datos abiertos', num: '08' },
];

/**
 * Las entradas del recorrido que despliegan hijos, por href.
 *
 * Era un `if (item.href === BIBLIOTECA_HREF)` hardcodeado en el header, en dos
 * lugares —el menú grande y el chico—. Con el segundo caso ese `if` se vuelve
 * una escalera, así que la relación pasa a ser dato: agregar una entrada con
 * hijos es una línea acá y ninguna en el header.
 */
export const SUBSECCIONES: Readonly<Record<string, readonly PapelNavItem[]>> = {
  [LA_IDEA_HREF]: SECCIONES_LA_IDEA,
  [CAMPANAS_HREF]: SECCIONES_CAMPANAS,
  [BIBLIOTECA_HREF]: SECCIONES_BIBLIOTECA,
};
