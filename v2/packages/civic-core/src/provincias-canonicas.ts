/**
 * Las 24 provincias, con el id que les da el Estado. Datos, sin efectos.
 *
 * **Vive acá porque no es dato de `packages/db`: es dato del país.** La lista
 * vivía en `packages/db/scripts/`, donde la podían importar el seed, el relleno
 * y el test de la migración — y no `apps/web`, que no puede importar de
 * `packages/db`. Así que la web se quedó con **una copia hardcodeada** en
 * `apps/web/src/pages/ElMapa/__tests__/argentina-mapa.test.ts`, con un
 * comentario que apuntaba a un archivo que ya no la tenía: una lista sin dueño.
 *
 * Que la copia importe no es teórico. `MapaArgentina.tsx` matchea
 * `PROVINCIAS_SVG[].nombre` contra `geographic_locations.name` **por igualdad
 * exacta de cadena**: el día que un nombre canónico cambie, la provincia
 * desaparece del coroplético y del popover sin un solo error. El único aviso
 * posible es que los dos lados lean la misma lista y un test lo afirme.
 *
 * Cuatro consumidores, ninguno de los cuales puede importarla de otro:
 * `seed-provinces.ts`, `rellenar-provincias.ts`, `migracion-0013.test.ts` y el
 * test del mapa de la web. Antes de esto había dos listas —y lo que se copiaba
 * no era inocuo: el test de la migración tenía su propio par
 * `[nombre, georefId]` y una `Tucumán`/`Tierra del Fuego` en otro orden.
 * Mientras las listas digan lo mismo eso no se nota; el día que una cambie, el
 * test sigue verde afirmando algo sobre una lista que ya no es la que se
 * siembra.
 *
 * La **clave** por la que una provincia se busca por nombre NO está acá:
 * necesita la tabla de alias de `packages/db`, que traduce «CABA» y «Tierra del
 * Fuego, Antártida e Islas del Atlántico Sur». Está en
 * `packages/db/scripts/clave-de-provincia.ts`, del lado de la base, escrita una
 * sola vez.
 *
 * Módulo puro: sin red, sin disco, sin reloj — como todo `civic-core`.
 */

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
 *
 * El orden es el del `georefId` y no importa: quien necesite un orden de
 * lectura lo pide explícito (el mapa precomputado ordena por
 * `localeCompare(…, 'es')`).
 */
// prettier-ignore
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
 * Los 24 nombres canónicos, ordenados como los ordena el mapa precomputado
 * (`scripts/build/geo/capas/provincias.ts`: `localeCompare(…, 'es')`).
 *
 * Existe para que el test de la web compare contra la lista canónica sin
 * reescribir el criterio de orden — y para que quien lo cambie tenga un solo
 * lugar donde hacerlo. `localeCompare` con `'es'` no es cosmética: pone
 * «Córdoba» antes que «Corrientes», que el orden por code point invierte.
 */
export const NOMBRES_DE_PROVINCIA: readonly string[] = PROVINCIAS_CANONICAS.map(
  (provincia) => provincia.name,
)
  .slice()
  .sort((a, b) => a.localeCompare(b, 'es'));
