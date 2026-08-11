/**
 * La resolución de la jerarquía AL ESCRIBIR.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §2.7, §4.4 y §4.6.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 4.
 *
 * No es un endpoint: es la función que la ingesta llama antes de insertar.
 * Extiende `provinciaIdDePunto` —que cerró D-001 y llegaba hasta provincia— a
 * los cuatro niveles, y lo hace sin la geometría que no tenemos.
 *
 * **La regla que gobierna todo lo de acá: cuando un nivel no se puede resolver
 * se guarda `NULL` en su id, con `ubicacion_origen` diciendo por qué vía se
 * intentó. Nunca un centroide, nunca la localidad más cercana, nunca un cero.**
 * En la provincia de Buenos Aires el centroide más cercano puede estar a 40 km y
 * en otro partido: atribuir por cercanía es inventar con cara de dato, y una
 * fila inventada no se distingue después de una medida.
 *
 * El efecto colateral que vale por sí solo: `where ubicacion_origen = 'punto'`
 * es, por primera vez, el conjunto EXACTO de filas cuya provincia sale del
 * polígono de 29 vértices de D-011. El daño de esa deuda deja de ser anécdota y
 * pasa a ser una consulta.
 */
import { NIVELES_DE_LOCALIDAD, GeoCallesRepository, GeographicRepository } from '@v2/db';

import { HttpError } from '../../middleware/error-handler.js';
import { nombreProvinciaDePunto, provinciaIdDePunto } from '../geographic/provincias.js';

import type { GeoPoint } from '@v2/civic-core';
import type { Db } from '@v2/db';

/**
 * De dónde salió cada nivel de la jerarquía (§2.7). Es la idea de `Procedencia`
 * (`simulacion/procedencia.ts`) aplicada a la geografía.
 *
 * `catalogo` es el rótulo de más confianza del sistema y es **enteramente
 * declarado por quien carga**: `calleId` es un entero que manda el cliente
 * contra un catálogo público. Quiere decir «la jerarquía sale del registro del
 * Estado», no «la señal es verdadera».
 */
export type UbicacionResuelta =
  | {
      origen: 'catalogo';
      provinciaId: number;
      departamentoId: number;
      localidadId: number;
      municipioId: number | null;
      calleId: number;
      /** Cuando hay punto y no cae en la provincia de la calle. Va al recibo. */
      discrepancia: string | null;
    }
  | {
      origen: 'declarada';
      provinciaId: number;
      localidadId: number | null;
      /**
       * Los dos que la unión de §4.4 no nombra y que esta vía SÍ resuelve
       * cuando la localidad vino elegida: la fila los tiene desnormalizados
       * desde la `0013`, así que devolverlos no cuesta una consulta más.
       * Dejarlos afuera habría guardado `department_id = NULL` sabiendo el
       * departamento, que es la misma clase de mentira que un cero.
       */
      departamentoId: number | null;
      municipioId: number | null;
    }
  | { origen: 'punto'; provinciaId: number; advertencia: string }
  | { origen: 'ninguna'; razon: string };

export interface EntradaDeUbicacion {
  calleId?: number;
  localidadId?: number;
  provinciaId?: number;
  punto: GeoPoint | null;
}

/** La advertencia de la vía 4, textual de §4.4. */
export const ADVERTENCIA_DEL_PUNTO =
  'Provincia derivada de un polígono simplificado; puede errar cerca de un límite.';

/** La discrepancia de §4.6, textual. La única verificación cruzada gratis del sistema. */
export const DISCREPANCIA_PUNTO_CALLE =
  'El punto que marcaste no cae en la provincia de esa calle.';

const DISCREPANCIA_PUNTO_FUERA =
  'El punto que marcaste no cae en ninguna provincia del país, y la calle que elegiste sí tiene una.';

/**
 * Resolver la jerarquía de una señal antes de insertarla.
 *
 * **El orden de precedencia es el de §4.4 y no es negociable:**
 *   1. `calleId` — la persona eligió una calle: la jerarquía sale del registro
 *      del Estado, y es la única vía que resuelve los cuatro niveles.
 *   2. `localidadId` — la persona la eligió; el resto sube por la propia fila.
 *   3. `provinciaId` declarado — lo que hace hoy `POST /api/open-data/dreams`.
 *   4. `punto` — `provinciaIdDePunto`, con la advertencia puesta.
 *   5. Nada — `origen: 'ninguna'` con su razón, y `province_id` NULL.
 *
 * Los ids que manda el cliente se validan ACÁ y no en la clave foránea: un
 * `calleId` inexistente tiene que dar 400 en castellano y no una violación de FK
 * convertida en 500. No impide que alguien plante señales con ids que sacó del
 * catálogo público —nada lo impide sin cuentas— pero sí impide las dos formas
 * silenciosas del problema.
 */
export async function resolverUbicacion(
  db: Db,
  entrada: EntradaDeUbicacion,
): Promise<UbicacionResuelta> {
  if (entrada.calleId !== undefined) {
    return resolverPorCalle(db, entrada.calleId, entrada.punto);
  }
  if (entrada.localidadId !== undefined) {
    return resolverPorLocalidad(db, entrada.localidadId);
  }
  if (entrada.provinciaId !== undefined) {
    return resolverPorProvincia(db, entrada.provinciaId);
  }
  return resolverPorPunto(db, entrada.punto);
}

/** Vía 1: la calle trae la jerarquía puesta. */
async function resolverPorCalle(
  db: Db,
  calleId: number,
  punto: GeoPoint | null,
): Promise<UbicacionResuelta> {
  const calle = await new GeoCallesRepository(db).porId(calleId);

  if (calle === undefined) {
    throw new HttpError(
      400,
      'CALLE_DESCONOCIDA',
      'Esa calle no está en el callejero. Elegí una de la lista o cargá sin dirección.',
    );
  }
  if (calle.nombreClase === 'sin_nombre') {
    // «CALLE S N» son 120.115 filas: calles que el Estado registró SIN nombre.
    // Elegir una no querría decir nada, y por eso el buscador no las devuelve.
    throw new HttpError(
      400,
      'CALLE_SIN_NOMBRE',
      'Esa calle figura sin nombre en el registro del Estado, así que no sirve como dirección. Elegí otra o cargá sin dirección.',
    );
  }

  // Una calle retirada (`vigente_hasta` puesto) SÍ se acepta: puede venir de un
  // paquete offline de la corrida anterior, y la fila sigue existiendo con su
  // jerarquía. Rechazarla castigaría a quien trabaja sin señal, que es
  // exactamente a quien el paquete existe para servir.

  return {
    origen: 'catalogo',
    provinciaId: calle.provincia.id,
    departamentoId: calle.departamento.id,
    localidadId: calle.localidad.id,
    municipioId: calle.municipio?.id ?? null,
    calleId: calle.id,
    discrepancia: await discrepanciaConElPunto(db, punto, calle.provincia.id),
  };
}

/**
 * La verificación cruzada de §4.6: cuando hay punto Y calle se corre
 * `provinciaIdDePunto` igual.
 *
 * Gana la calle para la jerarquía y el punto sigue siendo el punto: son dos
 * hechos y no compiten. Lo que no se hace es tirar la contradicción — es la
 * única verificación gratis que el sistema tiene.
 */
async function discrepanciaConElPunto(
  db: Db,
  punto: GeoPoint | null,
  provinciaDeLaCalle: number,
): Promise<string | null> {
  if (punto === null) return null;

  const provinciaDelPunto = await provinciaIdDePunto(db, punto);
  if (provinciaDelPunto !== null) {
    return provinciaDelPunto === provinciaDeLaCalle ? null : DISCREPANCIA_PUNTO_CALLE;
  }

  // El punto no resolvió. Si ni siquiera cae en el país, eso SÍ es decible; si
  // cae en una provincia que no está en el catálogo, no hay nada que afirmar y
  // se calla, que es distinto de decir que no hay discrepancia.
  return nombreProvinciaDePunto(punto) === null ? DISCREPANCIA_PUNTO_FUERA : null;
}

/** Vía 2: la persona eligió la localidad; el resto sube por la propia fila. */
async function resolverPorLocalidad(db: Db, localidadId: number): Promise<UbicacionResuelta> {
  const ancestros = await new GeographicRepository(db).resolveAncestors(localidadId);

  if (ancestros === undefined) {
    throw new HttpError(
      400,
      'LOCALIDAD_DESCONOCIDA',
      'Esa localidad no está en el catálogo. Elegí una de la lista o cargá sin localidad.',
    );
  }
  if (!(NIVELES_DE_LOCALIDAD as readonly string[]).includes(ancestros.lugar.level)) {
    throw new HttpError(
      400,
      'NIVEL_EQUIVOCADO',
      `Ese id es un ${ancestros.lugar.level}, no una localidad ni un asentamiento.`,
    );
  }

  return {
    origen: 'declarada',
    provinciaId: ancestros.provinciaId,
    // Para un asentamiento que BAHRA cuelga del departamento, `localidadId` es
    // NULL aunque el id que llegó exista: no tiene localidad censal, y decir que
    // sí sería inventarle una.
    localidadId: ancestros.localidadId,
    departamentoId: ancestros.departamentoId,
    municipioId: ancestros.municipioId,
  };
}

/** Vía 3: la provincia declarada, que es lo que hoy acepta la ingesta pública. */
async function resolverPorProvincia(db: Db, provinciaId: number): Promise<UbicacionResuelta> {
  const fila = await new GeographicRepository(db).resolveAncestors(provinciaId);

  if (fila?.lugar.level !== 'province') {
    throw new HttpError(
      400,
      'PROVINCIA_DESCONOCIDA',
      'Esa provincia no está en el catálogo. Elegí una de la lista o cargá sin provincia.',
    );
  }

  return {
    origen: 'declarada',
    provinciaId: fila.lugar.id,
    localidadId: null,
    departamentoId: null,
    municipioId: null,
  };
}

/** Vías 4 y 5: el punto, y después nada. */
async function resolverPorPunto(db: Db, punto: GeoPoint | null): Promise<UbicacionResuelta> {
  if (punto === null) {
    return {
      origen: 'ninguna',
      razon: 'No llegó ni calle, ni localidad, ni provincia, ni punto.',
    };
  }

  const provinciaId = await provinciaIdDePunto(db, punto);
  if (provinciaId !== null) {
    return { origen: 'punto', provinciaId, advertencia: ADVERTENCIA_DEL_PUNTO };
  }

  // Las dos razones son distintas y hay que poder distinguirlas: una es un
  // hecho sobre el punto y la otra es un agujero de nuestro catálogo.
  const nombre = nombreProvinciaDePunto(punto);
  return {
    origen: 'ninguna',
    razon:
      nombre === null
        ? 'El punto que marcaste no cae en ninguna provincia del país.'
        : `El punto cae en ${nombre}, y esa provincia todavía no está en el catálogo.`,
  };
}
