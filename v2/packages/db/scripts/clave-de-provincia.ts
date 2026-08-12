/**
 * La clave por la que una provincia se encuentra por nombre.
 *
 * **Es la misma expresión que `findProvinceByName` corre del lado de la
 * consulta**, y por eso está escrita una sola vez: la spec A §5 prohíbe el
 * segundo normalizador porque su diferencia no aparece como un error sino como
 * filas que faltan, en silencio.
 *
 * Los dos pasos no son intercambiables ni redundantes. `normalizeProvinceName`
 * TRADUCE —«CABA» y «Tierra del Fuego, Antártida e Islas del Atlántico Sur» son
 * nombres distintos del mismo lugar, y ninguna función de texto puede saberlo—;
 * `normalizarNombreDeLugar` NORMALIZA. Escribir `name_norm` con la traducción
 * adentro es lo que hace que la consulta encuentre a Tierra del Fuego por
 * cualquiera de sus dos nombres.
 *
 * Vive de este lado, y no en `civic-core` con `PROVINCIAS_CANONICAS`, porque
 * depende de la tabla de alias — que es de la base y no del país. La LISTA de
 * las 24 sí es del país: está en `@v2/civic-core`, donde también la puede
 * importar `apps/web`, que no puede importar de `packages/db`.
 */
import { normalizarNombreDeLugar } from '@v2/civic-core';

import { normalizeProvinceName } from '../src/repositories/geographic.js';

export const claveDeProvincia = (nombre: string): string =>
  normalizarNombreDeLugar(normalizeProvinceName(nombre));
