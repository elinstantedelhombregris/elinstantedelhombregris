import { provinciaDelPunto } from '@v2/civic-core';
import { GeographicRepository, normalizeProvinceName } from '@v2/db';

import { AREAS_PROVINCIAS } from './provincias.generated.js';

import type { GeoPoint } from '@v2/civic-core';
import type { Db } from '@v2/db';

/**
 * Resolución geográfica del lado del servidor — D-001 en `docs/DEUDAS.md`.
 *
 * Hasta acá `province_id` se guardaba solo si el cliente lo mandaba, y no
 * había nada que lo derivara del punto. Una voz clavada en una esquina exacta
 * quedaba sin provincia y desaparecía del coroplético, del detalle por
 * provincia y de todo lo que agrega por territorio. La plataforma aceptaba el
 * dato más preciso que existe y después no lo podía contar.
 *
 * Se resuelve AL ESCRIBIR, no al leer: si se hiciera al leer, cada consulta
 * pagaría el point-in-polygon de vuelta y el dato seguiría sin existir en la
 * fila. Es también lo que hace v1.
 */

export { AREAS_PROVINCIAS };

/**
 * El nombre canónico de la provincia que contiene el punto, o `null`.
 *
 * Canónico importa: el GeoJSON dice «Ciudad de Buenos Aires» y
 * `geographic_locations` guarda «Ciudad Autónoma de Buenos Aires». Sin
 * normalizar, la búsqueda por nombre no encuentra la fila y la voz se queda
 * sin provincia igual — el mismo bug un paso más adelante.
 */
export function nombreProvinciaDePunto(punto: GeoPoint): string | null {
  const nombre = provinciaDelPunto(punto, AREAS_PROVINCIAS);
  return nombre === null ? null : normalizeProvinceName(nombre);
}

/**
 * El id de `geographic_locations` de la provincia que contiene el punto.
 *
 * Devuelve `null` sin drama cuando no hay punto, cuando el punto cae fuera del
 * país, o cuando la provincia no está en el catálogo. Una voz sin provincia es
 * peor que una voz con provincia, pero es mucho mejor que una captura perdida:
 * esto nunca puede hacer fallar una ingesta.
 */
export async function provinciaIdDePunto(db: Db, punto: GeoPoint | null): Promise<number | null> {
  if (punto === null) return null;
  const nombre = nombreProvinciaDePunto(punto);
  if (nombre === null) return null;
  const fila = await new GeographicRepository(db).findProvinceByName(nombre);
  return fila?.id ?? null;
}
