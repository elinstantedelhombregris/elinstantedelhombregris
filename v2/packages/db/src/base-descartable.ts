/**
 * A qué base se le permite escribir cuando lo que se escribe es descartable.
 *
 * Vivía adentro de `tests/migracion-0013.test.ts`, que fue el primero que
 * necesitó la pregunta. Ahora la necesita también el escritor del esquema
 * `simulacion` —que siembra miles de filas sintéticas— y una segunda copia de
 * «¿puedo romper esta base?» es exactamente la clase de duplicación que termina
 * con las dos respuestas en desacuerdo el día que importa. Una sola librería de
 * cada cosa.
 *
 * No abre conexiones y no lee `process.env`: son funciones de cadenas a
 * uniones discriminadas, y por eso se pueden testear sin Postgres.
 */

/**
 * Host + nombre de base, sin credenciales ni parámetros.
 *
 * El endpoint pooled y el directo de Neon son la MISMA base y se diferencian
 * sólo por el sufijo `-pooler` en el host. Comparar los DSN como cadenas
 * dejaría pasar justo el error más fácil de cometer: apuntar la descartable al
 * endpoint directo de la base que el sitio sirve por el pooled.
 */
export function huellaDeBase(dsn: string): string | null {
  try {
    const u = new URL(dsn);
    return `${u.hostname.replace('-pooler', '')}${u.pathname}`;
  } catch {
    return null;
  }
}

export type BaseDescartable =
  | { readonly corre: true; readonly url: string }
  | { readonly corre: false; readonly motivo: 'ausente' | 'es_la_viva' | 'ilegible' };

/**
 * **No hay default y no cae a `DATABASE_URL`.** El valor por omisión de «¿puedo
 * romper esta base?» es que no; un default sería exactamente la respuesta
 * contraria, y es la que quemaba 24 ids de producción por corrida.
 *
 * Devuelve una unión discriminada y no una cadena vacía ni un booleano: el
 * motivo del «no» es lo que hace que el salteo se pueda leer.
 */
export function elegirBaseDescartable(
  descartable: string | undefined,
  vivas: readonly string[],
): BaseDescartable {
  if (descartable === undefined || descartable.length === 0) {
    return { corre: false, motivo: 'ausente' };
  }
  const huella = huellaDeBase(descartable);
  // Un DSN que no se puede parsear no se puede comparar contra las vivas, y lo
  // que no se puede comparar no se declara seguro.
  if (huella === null) return { corre: false, motivo: 'ilegible' };
  for (const viva of vivas) {
    if (huellaDeBase(viva) === huella) return { corre: false, motivo: 'es_la_viva' };
  }
  return { corre: true, url: descartable };
}

// ---------------------------------------------------------------------------
// La siembra sintética, que es más peligrosa que un test
// ---------------------------------------------------------------------------

/**
 * Los endpoints donde no se siembra ni con permiso.
 *
 * `ep-flat-art-ajjmw0zc` es la rama **por defecto** del proyecto Neon de v2 —la
 * que sirve el sitio— y está acá escrita a mano y no derivada de una variable
 * de entorno. La razón es la forma en que fallan las otras defensas: comparar
 * contra `DATABASE_URL` protege sólo mientras `DATABASE_URL` esté puesta, y una
 * terminal sin `.env` cargado convierte esa comparación en un «no encontré
 * ninguna base viva, adelante». Un denylist literal no tiene ese agujero.
 *
 * Es un prefijo de host, así que cubre el pooled y el directo juntos.
 */
export const HOSTS_DONDE_NO_SE_SIEMBRA: readonly string[] = ['ep-flat-art-ajjmw0zc'];

export type BaseParaSembrar =
  | { readonly siembra: true; readonly url: string }
  | {
      readonly siembra: false;
      readonly motivo: 'ausente' | 'es_la_viva' | 'ilegible' | 'rama_por_defecto';
    };

/** Si el DSN apunta a un endpoint de la lista negra, mire lo que mire el resto. */
export function esRamaProhibida(dsn: string): boolean {
  let host: string;
  try {
    host = new URL(dsn).hostname;
  } catch {
    // Lo que no se puede leer no se puede declarar permitido.
    return true;
  }
  return HOSTS_DONDE_NO_SE_SIEMBRA.some((prohibido) => host.startsWith(prohibido));
}

/**
 * Dónde se puede sembrar el esquema `simulacion`.
 *
 * Dos filtros y el orden importa: primero la lista negra —que no depende de que
 * el ambiente esté bien cargado—, después la comparación contra las bases
 * vivas. Si el primero pasara segundo, un `.env` ausente alcanzaría para
 * habilitar la rama por defecto.
 */
export function elegirBaseParaSembrar(
  candidata: string | undefined,
  vivas: readonly string[],
): BaseParaSembrar {
  if (candidata === undefined || candidata.length === 0) {
    return { siembra: false, motivo: 'ausente' };
  }
  if (huellaDeBase(candidata) === null) return { siembra: false, motivo: 'ilegible' };
  if (esRamaProhibida(candidata)) return { siembra: false, motivo: 'rama_por_defecto' };

  const elegida = elegirBaseDescartable(candidata, vivas);
  if (!elegida.corre) return { siembra: false, motivo: elegida.motivo };
  return { siembra: true, url: elegida.url };
}
