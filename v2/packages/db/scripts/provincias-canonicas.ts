/**
 * Las 24 provincias, con el id que les da el Estado. Datos, sin efectos.
 *
 * Vive en su propio módulo porque **tres lugares necesitan la misma lista y
 * ninguno puede importarla del otro**: `seed-provinces.ts` siembra al
 * importarlo, así que el relleno y el test tenían que copiarla, y una lista
 * copiada tres veces es una lista que va a divergir en la copia que nadie mira.
 *
 * Lo que se copiaba, además, no era inocuo: el test de la migración tenía su
 * propio par `[nombre, georefId]` y una `Tucumán`/`Tierra del Fuego` en otro
 * orden. Mientras las dos listas digan lo mismo eso no se nota; el día que una
 * cambie, el test seguiría verde afirmando algo sobre una lista que ya no es la
 * que se siembra.
 */
import { normalizarNombreDeLugar } from '@v2/civic-core';

import { normalizeProvinceName } from '../src/repositories/geographic.js';

export interface ProvinciaCanonica {
  /** El nombre tal como lo publica el Estado y como está guardado hoy. */
  readonly name: string;
  /** ISO 3166-2. */
  readonly isoCode: string;
  /** El id del Estado (INDEC / georef). Es la clave por la que reconcilia el seed. */
  readonly georefId: string;
  readonly latitude: string;
  readonly longitude: string;
}

/**
 * Los `georefId` son los códigos de provincia del INDEC, que es lo que georef
 * usa como id: dos dígitos, en el orden alfabético castellano (Ch después de C).
 * El nombre NO se toca — georef llama a Tierra del Fuego «Tierra del Fuego,
 * Antártida e Islas del Atlántico Sur» y la base la llama «Tierra del Fuego»;
 * reconciliar por nombre es justamente lo que `georef_id` viene a evitar.
 *
 * Las coordenadas son centroides aproximados — alcanzan para pinchar una
 * provincia. Las ciudades se rellenan después.
 */
export const PROVINCIAS_CANONICAS: readonly ProvinciaCanonica[] = [
  { name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C', georefId: '02', latitude: '-34.603722', longitude: '-58.381592' },
  { name: 'Buenos Aires', isoCode: 'AR-B', georefId: '06', latitude: '-37.000000', longitude: '-60.000000' },
  { name: 'Catamarca', isoCode: 'AR-K', georefId: '10', latitude: '-28.469570', longitude: '-65.779000' },
  { name: 'Chaco', isoCode: 'AR-H', georefId: '22', latitude: '-26.500000', longitude: '-60.500000' },
  { name: 'Chubut', isoCode: 'AR-U', georefId: '26', latitude: '-44.000000', longitude: '-69.000000' },
  { name: 'Córdoba', isoCode: 'AR-X', georefId: '14', latitude: '-32.142932', longitude: '-63.801753' },
  { name: 'Corrientes', isoCode: 'AR-W', georefId: '18', latitude: '-28.751000', longitude: '-57.812000' },
  { name: 'Entre Ríos', isoCode: 'AR-E', georefId: '30', latitude: '-32.500000', longitude: '-59.500000' },
  { name: 'Formosa', isoCode: 'AR-P', georefId: '34', latitude: '-25.000000', longitude: '-59.500000' },
  { name: 'Jujuy', isoCode: 'AR-Y', georefId: '38', latitude: '-23.500000', longitude: '-65.800000' },
  { name: 'La Pampa', isoCode: 'AR-L', georefId: '42', latitude: '-37.000000', longitude: '-65.500000' },
  { name: 'La Rioja', isoCode: 'AR-F', georefId: '46', latitude: '-29.700000', longitude: '-67.500000' },
  { name: 'Mendoza', isoCode: 'AR-M', georefId: '50', latitude: '-34.500000', longitude: '-68.500000' },
  { name: 'Misiones', isoCode: 'AR-N', georefId: '54', latitude: '-26.800000', longitude: '-54.500000' },
  { name: 'Neuquén', isoCode: 'AR-Q', georefId: '58', latitude: '-38.500000', longitude: '-69.500000' },
  { name: 'Río Negro', isoCode: 'AR-R', georefId: '62', latitude: '-40.500000', longitude: '-67.500000' },
  { name: 'Salta', isoCode: 'AR-A', georefId: '66', latitude: '-25.500000', longitude: '-65.000000' },
  { name: 'San Juan', isoCode: 'AR-J', georefId: '70', latitude: '-31.500000', longitude: '-69.000000' },
  { name: 'San Luis', isoCode: 'AR-D', georefId: '74', latitude: '-33.500000', longitude: '-66.000000' },
  { name: 'Santa Cruz', isoCode: 'AR-Z', georefId: '78', latitude: '-49.000000', longitude: '-70.000000' },
  { name: 'Santa Fe', isoCode: 'AR-S', georefId: '82', latitude: '-30.500000', longitude: '-60.800000' },
  { name: 'Santiago del Estero', isoCode: 'AR-G', georefId: '86', latitude: '-27.800000', longitude: '-63.500000' },
  { name: 'Tierra del Fuego', isoCode: 'AR-V', georefId: '94', latitude: '-54.000000', longitude: '-67.500000' },
  { name: 'Tucumán', isoCode: 'AR-T', georefId: '90', latitude: '-26.800000', longitude: '-65.300000' },
];

/**
 * La clave por la que una provincia se encuentra por nombre. **Es la misma
 * expresión que `findProvinceByName` corre del lado de la consulta**, y por eso
 * está escrita una sola vez: la spec A §5 prohíbe el segundo normalizador
 * porque su diferencia no aparece como un error sino como filas que faltan.
 *
 * Los dos pasos no son intercambiables ni redundantes. `normalizeProvinceName`
 * TRADUCE —«CABA» y «Tierra del Fuego, Antártida e Islas del Atlántico Sur» son
 * nombres distintos del mismo lugar, y ninguna función de texto puede saberlo—;
 * `normalizarNombreDeLugar` NORMALIZA. Escribir `name_norm` con la traducción
 * adentro es lo que hace que la consulta encuentre a Tierra del Fuego por
 * cualquiera de sus dos nombres.
 */
export const claveDeProvincia = (nombre: string): string =>
  normalizarNombreDeLugar(normalizeProvinceName(nombre));
