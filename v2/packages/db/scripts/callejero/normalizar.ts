/**
 * CAPA 2 — NORMALIZAR. Del payload de georef a la fila que la base acepta.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §3.3, §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 2.
 *
 * **Módulo puro: sin red, sin base, sin reloj.** Todo lo que decide acá se
 * puede afirmar en un test que corre sin Postgres y sin internet, que es la
 * mitad del punto de separar las tres capas.
 *
 * ── UN SOLO NORMALIZADOR ───────────────────────────────────────────────────
 *
 * `normalizarNombreDeLugar`, `normalizarNombreDeCalle` y `rangoDeAltura` vienen
 * de civic-core y son **las mismas** que corre la consulta. Escribir acá una
 * segunda versión —en TS o en SQL— es el defecto que la spec A §5 prohíbe
 * explícitamente, y su síntoma no es un error sino resultados que faltan, en
 * silencio, en unas provincias y no en otras (D-012).
 *
 * Cada calle se normaliza con **su propio campo `categoria`** y no con la tabla
 * `geo_calle_categorias`, y no leerla es la decisión (§3.3): el seed carga de a
 * una partición y esa tabla se llena a medida que avanza, así que leerla
 * normalizaría las primeras provincias contra una lista incompleta y
 * `nombre_norm` quedaría inconsistente a lo largo de la tabla. La consulta sí
 * pasa la lista entera, porque todavía no sabe de qué calle habla; la guarda 7
 * de la Task 2 afirma que los dos lados dan el mismo resultado igual.
 *
 * ── LAS TRES SUCIEDADES DE LA FUENTE, Y QUÉ SE HACE CON CADA UNA ───────────
 *
 * Medidas cargando el corpus completo el 2026-08-11.
 *
 * **1. 30 calles traen el rango invertido** (`altura_desde > altura_hasta`) y el
 * CHECK `geo_calles_rango_chk` las rechaza. El plan proponía anular el `desde` y
 * conservar el `hasta`, o sea entrarlas como `parcialHasta`. **Acá gana lo que
 * ya está compilado: `rangoDeAltura` descarta el rango entero como `ausente`**,
 * y la calle entra igual (una calle sin rango sigue sirviendo para elegirla por
 * nombre). Tres razones, en orden de peso:
 *
 *   - La regla 7 de esta tarea es que el seed use `rangoDeAltura` y ninguna
 *     versión propia. Parchear su resultado desde acá es tener dos traductores
 *     de altura con una capa de pintura encima.
 *   - `altura_fuera_de_rango` es **una afirmación sobre el catálogo del
 *     Estado**. Con `desde=1500, hasta=800` no se puede saber cuál de los dos
 *     números está mal; quedarse con el `hasta` afirma «la altura 900 está
 *     fuera del rango» apoyado en un registro que se contradice a sí mismo.
 *   - Son 30 filas sobre 326.832 —el 0,009%— y las 30 se cuentan y se reportan
 *     en la corrida, así que la decisión es visible y revisable con el número
 *     al lado.
 *
 * **2. `categoria` trae basura del Estado y hay que dejarla entrar.** 23
 * categorías distintas, cinco numéricas («0» ×3, «101», «330», «1015»,
 * «301050»), una literal «TIPO», y cuatro que no son calles: `LINEA FERREA`
 * (23), `LIMITE DE PROPIEDAD` (20), `LINEA IMAGINARIA` (20), `CURSO DE AGUA`
 * (13). Valida la decisión de A de no ponerle CHECK a `categoria`: con un CHECK
 * el seed habría muerto en la primera «301050» y alguien habría «arreglado» el
 * dato del Estado a mano. **El dominio se descubre, se publica en
 * `geo_calle_categorias` y se puede mirar; no se decreta.** Las cuatro que no
 * son calles tampoco se filtran: sacarlas sería que `filas_escritas =
 * total_declarado` deje de cerrar, y esconder que el callejero del INDEC tiene
 * vías de tren adentro.
 *
 * **3. La provincia no matchea por nombre en 1 de 24.** Georef dice «Tierra del
 * Fuego, Antártida e Islas del Atlántico Sur» y la base dice «Tierra del
 * Fuego». Por eso **todo se resuelve por `georef_id`** y el nombre no participa
 * de ninguna reconciliación. Donde el nombre hace falta —el chequeo cruzado de
 * la corrida— se usa `claveDeProvincia`, que es la tabla de alias de la Task 3
 * por encima del normalizador, nunca un segundo normalizador.
 */
import { createHash } from 'node:crypto';

import { normalizarNombreDeCalle, normalizarNombreDeLugar, rangoDeAltura } from '@v2/civic-core';

import type { FilaCruda } from './fuente.js';
import type { CalleParaSembrar, ClaseDeNombre } from '../../src/repositories/geo-calles.js';
import type { NivelDeLugar } from '../../src/repositories/geographic.js';
import type { NewGeographicLocation } from '../../src/schema/geographic.js';
import type { AlturasDeGeoref } from '@v2/civic-core';

// ---------------------------------------------------------------------------
// Lectores de campos crudos
// ---------------------------------------------------------------------------

const texto = (valor: unknown): string | null =>
  typeof valor === 'string' && valor.trim().length > 0 ? valor.trim() : null;

const numero = (valor: unknown): number | null =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : null;

const objeto = (valor: unknown): FilaCruda | null =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)
    ? (valor as FilaCruda)
    : null;

/**
 * El id de un ancestro anidado (`provincia.id`, `departamento.id`…).
 *
 * **Sólo acepta strings.** Los ids del Estado tienen ceros a la izquierda
 * («02», «06001», «0204901005420») y coercionar un número los perdería: «02»
 * pasaría a ser «2» y no reconciliaría con nada, entrando el país entero
 * duplicado sin un solo error. Si georef algún día devuelve números, esto falla
 * fuerte y a la primera fila, que es lo que corresponde.
 */
const idAnidado = (fila: FilaCruda, clave: string): string | null => {
  const anidado = objeto(fila[clave]);
  return anidado === null ? null : texto(anidado.id);
};

const nombreAnidado = (fila: FilaCruda, clave: string): string | null => {
  const anidado = objeto(fila[clave]);
  return anidado === null ? null : texto(anidado.nombre);
};

// ---------------------------------------------------------------------------
// Un lugar de la jerarquía
// ---------------------------------------------------------------------------

export interface Centroide {
  readonly lat: number;
  readonly lon: number;
}

/** Un lugar del payload, ya leído y sin interpretar la jerarquía. */
export interface LugarCrudo {
  readonly georefId: string;
  readonly nombre: string;
  readonly centroide: Centroide | null;
  readonly provincia: string | null;
  readonly departamento: string | null;
  readonly municipio: string | null;
  readonly localidadCensal: string | null;
  /** El nombre de la provincia según la fuente. Sólo para el chequeo cruzado. */
  readonly provinciaNombre: string | null;
}

export type LecturaDeLugar =
  | { readonly estado: 'leido'; readonly lugar: LugarCrudo }
  | { readonly estado: 'ilegible'; readonly motivo: string };

export const leerLugar = (fila: FilaCruda): LecturaDeLugar => {
  const georefId = texto(fila.id);
  if (georefId === null) return { estado: 'ilegible', motivo: 'la fila no trae `id` de texto' };
  const nombre = texto(fila.nombre);
  if (nombre === null) {
    return { estado: 'ilegible', motivo: `la fila ${georefId} no trae \`nombre\`` };
  }

  const centro = objeto(fila.centroide);
  const lat = centro === null ? null : numero(centro.lat);
  const lon = centro === null ? null : numero(centro.lon);

  return {
    estado: 'leido',
    lugar: {
      georefId,
      nombre,
      centroide: lat === null || lon === null ? null : { lat, lon },
      provincia: idAnidado(fila, 'provincia'),
      departamento: idAnidado(fila, 'departamento'),
      municipio: idAnidado(fila, 'municipio'),
      localidadCensal: idAnidado(fila, 'localidad_censal'),
      provinciaNombre: nombreAnidado(fila, 'provincia'),
    },
  };
};

// ---------------------------------------------------------------------------
// Una calle
// ---------------------------------------------------------------------------

export interface CalleCruda {
  readonly georefId: string;
  readonly nombre: string;
  readonly categoria: string;
  readonly provincia: string | null;
  readonly departamento: string | null;
  readonly localidadCensal: string | null;
  readonly alturas: AlturasDeGeoref;
}

export type LecturaDeCalle =
  | { readonly estado: 'leida'; readonly calle: CalleCruda }
  | { readonly estado: 'ilegible'; readonly motivo: string };

/** `altura.{inicio,fin}.{derecha,izquierda}`, con el `0` todavía sin traducir. */
const alturasDe = (fila: FilaCruda): AlturasDeGeoref => {
  const altura = objeto(fila.altura);
  const inicio = altura === null ? null : objeto(altura.inicio);
  const fin = altura === null ? null : objeto(altura.fin);
  return {
    inicio: inicio === null ? [] : [numero(inicio.derecha), numero(inicio.izquierda)],
    fin: fin === null ? [] : [numero(fin.derecha), numero(fin.izquierda)],
  };
};

export const leerCalle = (fila: FilaCruda): LecturaDeCalle => {
  const georefId = texto(fila.id);
  if (georefId === null) return { estado: 'ilegible', motivo: 'la calle no trae `id` de texto' };
  const nombre = texto(fila.nombre);
  if (nombre === null) {
    return { estado: 'ilegible', motivo: `la calle ${georefId} no trae \`nombre\`` };
  }
  // Una calle sin categoría no existe en el payload medido, pero si apareciera
  // entra como 'SIN CATEGORIA' y no rompe: la columna es NOT NULL y el dominio
  // se publica tal como se descubre, con esta fila adentro y a la vista.
  const categoria = texto(fila.categoria) ?? 'SIN CATEGORIA';

  return {
    estado: 'leida',
    calle: {
      georefId,
      nombre,
      categoria,
      provincia: idAnidado(fila, 'provincia'),
      departamento: idAnidado(fila, 'departamento'),
      localidadCensal: idAnidado(fila, 'localidad_censal'),
      alturas: alturasDe(fila),
    },
  };
};

// ---------------------------------------------------------------------------
// «CALLE SN» — el 36,8% del país
// ---------------------------------------------------------------------------

/**
 * Las formas con las que el Estado escribe «esta calle no tiene nombre».
 * Normalizadas: «CALLE S N», «CALLE SN», «S N», «SN», «SIN NOMBRE».
 *
 * Son 120.115 filas —el 36,8% del callejero— y **no son un vacío**: son calles
 * que el Estado registró SIN nombre. Se marcan `sin_nombre`, no entran en el
 * autocompletado (elegir «CALLE S N» no querría decir nada) y sí entran en los
 * totales, para que la auditoría contra la fuente cierre.
 */
const NOMBRES_SIN_NOMBRE = new Set(['S N', 'SN', 'SIN NOMBRE', 'S/N']);

export const claseDelNombre = (nombreNorm: string): ClaseDeNombre =>
  nombreNorm.length === 0 || NOMBRES_SIN_NOMBRE.has(nombreNorm) ? 'sin_nombre' : 'nominada';

// ---------------------------------------------------------------------------
// El índice de la jerarquía
// ---------------------------------------------------------------------------

/** Lo que hace falta saber de una fila que ya está en la base para compararla. */
export interface LugarEnBase {
  readonly id: number;
  readonly level: string;
  readonly name: string;
  readonly nameNorm: string | null;
  readonly provinceId: number;
  readonly parentId: number | null;
  readonly departmentId: number | null;
  readonly municipalityId: number | null;
  readonly latitude: string | null;
  readonly longitude: string | null;
  readonly vigenteHasta: Date | null;
}

/** `georef_id` → la fila. Es la ÚNICA clave por la que el seed reconcilia. */
export type IndiceDeLugares = ReadonlyMap<string, LugarEnBase>;

export type FilaDeLugar = NewGeographicLocation & { georefId: string };

export type PlanDeLugar =
  | { readonly estado: 'listo'; readonly fila: FilaDeLugar; readonly cambia: boolean }
  /** Ya entró por otro recurso: los 3.349 asentamientos que son una localidad. */
  | {
      readonly estado: 'duplicado';
      readonly georefId: string;
      readonly nombre: string;
      readonly comoNivel: string;
    }
  | {
      readonly estado: 'sin_ancestro';
      readonly georefId: string;
      readonly nombre: string;
      readonly falta: string;
    };

/**
 * Las coordenadas se guardan con la misma escala que la columna
 * (`numeric(9,6)`) para que la comparación de «¿cambió?» no vea una diferencia
 * donde no la hay: Postgres devuelve «-34.603722» y `toFixed(6)` produce
 * exactamente eso. Sin esta simetría, cada re-siembra escribiría las 17.986
 * filas de la jerarquía por una diferencia de formato.
 */
const aDecimal = (valor: number): string => valor.toFixed(6);

/**
 * `parent_id` vale distinto en cada nivel, y por eso esta tabla no es opcional
 * (A §3.1):
 *
 * | nivel        | parent            | department_id        | municipality_id |
 * |--------------|-------------------|----------------------|-----------------|
 * | province     | NULL (es la raíz) | NULL                 | NULL            |
 * | department   | provincia         | NULL                 | NULL            |
 * | municipality | provincia (§2.2)  | NULL                 | NULL            |
 * | locality     | departamento      | su departamento      | si el Estado lo lista |
 * | settlement   | localidad o dpto  | su departamento      | si el Estado lo lista |
 *
 * **`department_id` de un departamento queda NULL y no en sí mismo.** La
 * simetría con `province_id = id` es tentadora y no aplica: `province_id` es
 * NOT NULL y existe para que `where province_id = X` traiga el subárbol entero;
 * `department_id` es nullable y su único consumidor —`resolveAncestors`, vía
 * `destinoDelPaquete`— nunca pregunta por el departamento de un departamento,
 * porque para ese caso ya tiene `level = 'department'`. Ponerle el propio id
 * costaría un UPDATE extra por fila para inventar un dato que nadie lee.
 *
 * **Un municipio cuelga de la provincia y no del departamento**: en Buenos
 * Aires el partido es las dos cosas a la vez y en Córdoba los municipios cruzan
 * límites departamentales. La pertenencia municipal es CRUZADA, no un escalón.
 */
export const planificarLugar = (entrada: {
  readonly nivel: NivelDeLugar;
  readonly lugar: LugarCrudo;
  readonly indice: IndiceDeLugares;
}): PlanDeLugar => {
  const { nivel, lugar, indice } = entrada;

  // ── La deduplicación entre recursos ──────────────────────────────────────
  // Los ids de georef son únicos DENTRO de cada recurso y no ENTRE recursos:
  // 3.349 asentamientos traen el mismo id que una localidad censal —son el
  // mismo lugar listado en dos niveles, testigo `58112040`, Zapala— y el
  // `UNIQUE (georef_id)` los rechaza. El lugar YA entró como `locality`, que es
  // el nivel más informativo de los dos, así que el asentamiento se saltea y se
  // cuenta. Sin esto la jerarquía muere en la fila 6.690 de asentamientos.
  const existente = indice.get(lugar.georefId);
  if (existente !== undefined && existente.level !== nivel) {
    return {
      estado: 'duplicado',
      georefId: lugar.georefId,
      nombre: lugar.nombre,
      comoNivel: existente.level,
    };
  }

  const faltante = (falta: string): PlanDeLugar => ({
    estado: 'sin_ancestro',
    georefId: lugar.georefId,
    nombre: lugar.nombre,
    falta,
  });

  const provincia = lugar.provincia === null ? undefined : indice.get(lugar.provincia);
  if (provincia === undefined) {
    return faltante(`provincia ${lugar.provincia ?? '(ausente)'}`);
  }

  const departamento = lugar.departamento === null ? undefined : indice.get(lugar.departamento);
  const municipio = lugar.municipio === null ? undefined : indice.get(lugar.municipio);
  const localidad = lugar.localidadCensal === null ? undefined : indice.get(lugar.localidadCensal);

  let parentId: number | null;
  let departmentId: number | null = null;
  let municipalityId: number | null = null;

  switch (nivel) {
    case 'province':
      parentId = null;
      break;
    case 'department':
    case 'municipality':
      parentId = provincia.id;
      break;
    case 'locality':
      /**
       * **Una localidad censal SIN departamento cuelga de su provincia, y no es
       * un error: es CABA.**
       *
       * georef entrega `02000010` «Ciudad Autónoma de Buenos Aires» con
       * `departamento: {id: null}`. No es un dato que falte — la ciudad no está
       * dentro de ningún departamento; sus 15 comunas son las que georef lista
       * COMO departamentos, y esta fila, que es la ciudad entera, no cuelga de
       * ninguna. La provincia es su ancestro real y `department_id` queda NULL,
       * que acá significa «no tiene», no «no sé».
       *
       * Sin esta salida la fila es huérfana en TODA corrida, y no se sale
       * re-corriendo: es la familia del defecto 6. Y no se cae sola —
       * `planificarCalle` exige la localidad, y las **3.127 calles de CABA**
       * traen `localidad_censal = 02000010`—, así que las 15 particiones de
       * comuna cerrarían con 3.127 `sin_territorio`: el país entero menos su
       * capital, con `--tolerar-huerfanas` firmando que está bien.
       *
       * Es la misma salida que `settlement` ya tenía cuatro líneas más abajo.
       *
       * **La distinción que se conserva:** «georef no declara departamento»
       * (null → provincia) NO es «georef declara uno que no tenemos»
       * (→ huérfana). Lo segundo es un agujero real en la jerarquía y tiene que
       * seguir doliendo.
       */
      if (lugar.departamento !== null && departamento === undefined)
        return faltante(`departamento ${lugar.departamento}`);
      parentId = departamento?.id ?? provincia.id;
      departmentId = departamento?.id ?? null;
      municipalityId = municipio?.id ?? null;
      break;
    case 'settlement':
      // BAHRA no siempre lo cuelga de una localidad censal. Cuando no lo hace,
      // cuelga del departamento — y ese NULL en `localidadId` es lo que hace
      // que §4.3 le dé el paquete de la zona en vez de inventarle una localidad.
      if (localidad === undefined && departamento === undefined) {
        return faltante('localidad censal y departamento');
      }
      parentId = localidad?.id ?? departamento?.id ?? null;
      departmentId = departamento?.id ?? null;
      municipalityId = municipio?.id ?? null;
      break;
  }

  const nameNorm = normalizarNombreDeLugar(lugar.nombre);
  const latitude = lugar.centroide === null ? null : aDecimal(lugar.centroide.lat);
  const longitude = lugar.centroide === null ? null : aDecimal(lugar.centroide.lon);

  const fila: FilaDeLugar = {
    georefId: lugar.georefId,
    level: nivel,
    name: lugar.nombre,
    nameNorm,
    provinceId: provincia.id,
    parentId,
    departmentId,
    municipalityId,
    latitude,
    longitude,
    // Un lugar que vuelve a aparecer deja de estar retirado. Que el Estado lo
    // haya dejado de listar un mes no lo borra, y volver a listarlo no crea un
    // lugar nuevo: conserva su `id` y sus señales.
    vigenteHasta: null,
  };

  return { estado: 'listo', fila, cambia: cambiaElLugar(existente, fila) };
};

/**
 * «¿Hay que escribir esta fila?». Es el equivalente en memoria del `WHERE` del
 * `DO UPDATE`: sin él, una re-siembra sin cambios reescribiría las 17.986 filas
 * de la jerarquía y movería 17.986 `updated_at` por nada.
 */
export const cambiaElLugar = (previa: LugarEnBase | undefined, fila: FilaDeLugar): boolean => {
  if (previa === undefined) return true;
  return (
    previa.level !== fila.level ||
    previa.name !== fila.name ||
    previa.nameNorm !== fila.nameNorm ||
    previa.provinceId !== fila.provinceId ||
    previa.parentId !== (fila.parentId ?? null) ||
    previa.departmentId !== (fila.departmentId ?? null) ||
    previa.municipalityId !== (fila.municipalityId ?? null) ||
    previa.latitude !== (fila.latitude ?? null) ||
    previa.longitude !== (fila.longitude ?? null) ||
    previa.vigenteHasta !== null
  );
};

// ---------------------------------------------------------------------------
// La calle, ya lista para entrar
// ---------------------------------------------------------------------------

export type PlanDeCalle =
  | {
      readonly estado: 'lista';
      readonly calle: CalleParaSembrar;
      /** El rango venía invertido y `rangoDeAltura` lo descartó entero. */
      readonly rangoInvertido: boolean;
    }
  | {
      readonly estado: 'sin_territorio';
      readonly georefId: string;
      readonly nombre: string;
      readonly falta: string;
    };

/** ¿La fuente se contradice a sí misma en el rango? Se cuenta para el reporte. */
export const rangoVieneInvertido = (alturas: AlturasDeGeoref): boolean => {
  const inicios = alturas.inicio.filter((n): n is number => typeof n === 'number' && n > 0);
  const fines = alturas.fin.filter((n): n is number => typeof n === 'number' && n > 0);
  if (inicios.length === 0 || fines.length === 0) return false;
  return Math.min(...inicios) > Math.max(...fines);
};

export const planificarCalle = (entrada: {
  readonly calle: CalleCruda;
  readonly indice: IndiceDeLugares;
}): PlanDeCalle => {
  const { calle, indice } = entrada;

  const faltante = (falta: string): PlanDeCalle => ({
    estado: 'sin_territorio',
    georefId: calle.georefId,
    nombre: calle.nombre,
    falta,
  });

  // **La FK a la localidad sale del campo `localidad_censal.id` del payload,
  // nunca de cortar el id de la calle** (§3.1): el prefijo jerárquico de los 13
  // dígitos tiene un componente de localidad que NO reconstruye
  // `localidad_censal.id` — para la calle de CABA el componente es «01» y la
  // localidad censal es «02000010». Se parecen y no son lo mismo.
  const localidad = calle.localidadCensal === null ? undefined : indice.get(calle.localidadCensal);
  if (localidad === undefined) return faltante(`localidad ${calle.localidadCensal ?? '(ausente)'}`);
  const departamento = calle.departamento === null ? undefined : indice.get(calle.departamento);
  if (departamento === undefined)
    return faltante(`departamento ${calle.departamento ?? '(ausente)'}`);
  const provincia = calle.provincia === null ? undefined : indice.get(calle.provincia);
  if (provincia === undefined) return faltante(`provincia ${calle.provincia ?? '(ausente)'}`);

  const nombreNorm = normalizarNombreDeCalle(calle.nombre, [calle.categoria]);

  return {
    estado: 'lista',
    calle: {
      georefId: calle.georefId,
      localidadId: localidad.id,
      departamentoId: departamento.id,
      provinciaId: provincia.id,
      nombre: calle.nombre,
      nombreNorm,
      nombreClase: claseDelNombre(nombreNorm),
      categoria: calle.categoria,
      // El `0` de georef se traduce a ausencia ACÁ, en el borde, una sola vez.
      // El CHECK `altura > 0` de la Task 1 le prohíbe la entrada para siempre.
      rango: rangoDeAltura(calle.alturas),
    },
    rangoInvertido: rangoVieneInvertido(calle.alturas),
  };
};

// ---------------------------------------------------------------------------
// La huella de una partición
// ---------------------------------------------------------------------------

/**
 * `hash_fuente`: lo que hace que una partición sin cambios se saltee entera sin
 * tocar la base.
 *
 * **No ahorra requests y no puede ahorrarlos**: georef no tiene `?desde=`, así
 * que para saber si algo cambió hay que bajar la partición igual (D-034). Lo
 * que ahorra son escrituras, que es lo caro en una base con techo de 512 MB.
 *
 * La huella se arma por página y en el orden en que la fuente entrega: se
 * ordenan las líneas DENTRO de cada página y después se encadenan los digests
 * en orden de página. Un reordenamiento entre páginas sin cambio de contenido
 * se vería como cambio y provocaría un re-upsert — que escribe **cero filas**
 * gracias al `WHERE` del `DO UPDATE`. O sea: el falso «cambió» cuesta nada, y
 * el falso «no cambió», que sería el caro, no puede pasar.
 */
export const huellaDePagina = (lineas: readonly string[]): string =>
  createHash('sha256')
    .update([...lineas].sort().join('\n'))
    .digest('hex');

export const huellaDeParticion = (huellasDePagina: readonly string[]): string =>
  createHash('sha256').update(huellasDePagina.join('|')).digest('hex');

/**
 * El separador de campos de una línea canónica: `US`, el separador de unidades
 * de ASCII.
 *
 * **No es cosmética.** Con `.join('')` dos estados distintos dan la misma
 * huella: `nombre = 'SAN MARTIN 1'` con `nombreNorm = '00'` concatena igual que
 * `nombre = 'SAN MARTIN'` con `nombreNorm = '100'`. Y la huella es lo que decide
 * SALTEAR una partición entera, así que una colisión no devuelve un resultado
 * raro: deja 618 calles sin mirar y cierra la partición en verde.
 *
 * `\u001f` (US) y no `|` porque un `|` puede aparecer en un nombre del Estado.
 */
const SEPARADOR = '\u001f';

/** La línea canónica de una calle: todo lo que se escribe y nada más. */
export const lineaDeCalle = (calle: CalleParaSembrar): string => {
  const { rango } = calle;
  const desde = rango.tipo === 'completo' || rango.tipo === 'parcialDesde' ? rango.desde : '';
  const hasta = rango.tipo === 'completo' || rango.tipo === 'parcialHasta' ? rango.hasta : '';
  return [
    calle.georefId,
    calle.localidadId,
    calle.departamentoId,
    calle.provinciaId,
    calle.nombre,
    calle.nombreNorm,
    calle.nombreClase,
    calle.categoria,
    desde,
    hasta,
  ].join(SEPARADOR);
};

/** La línea canónica de un lugar de la jerarquía. */
export const lineaDeLugar = (fila: FilaDeLugar): string =>
  [
    fila.georefId,
    fila.level,
    fila.name,
    fila.nameNorm ?? '',
    fila.provinceId,
    fila.parentId ?? '',
    fila.departmentId ?? '',
    fila.municipalityId ?? '',
    fila.latitude ?? '',
    fila.longitude ?? '',
  ].join(SEPARADOR);

// ---------------------------------------------------------------------------
// La deduplicación, antes de que la sentencia la vea
// ---------------------------------------------------------------------------

export interface Deduplicado<T> {
  /** Una fila por `georefId`, en el orden en que la fuente las entregó. */
  readonly unicas: readonly T[];
  /** Un `georefId` por repetición: es lo que la partición tiene que rendir. */
  readonly duplicados: readonly string[];
}

/**
 * Dos filas con el mismo `georef_id` adentro del mismo `INSERT … ON CONFLICT DO
 * UPDATE` son el error 21000 de Postgres —«no puede afectar la misma fila dos
 * veces»— y **revientan la corrida entera**, no la fila.
 *
 * La fuente no las entregó el 2026-08-11, y por eso mismo esto no se puede
 * descubrir corriendo: se descubre el día que las entregue, en producción, a la
 * mitad de una carga de cinco minutos.
 *
 * Gana la primera, que es la que la fuente entregó primero. Las repeticiones se
 * devuelven contadas para que la suma de la partición cierre: una fila que la
 * fuente declaró y que la tabla no puede guardar dos veces sigue teniendo que
 * estar contada en algún lado.
 */
export const deduplicarPorGeorefId = <T extends { readonly georefId: string }>(
  filas: readonly T[],
): Deduplicado<T> => {
  const unicas: T[] = [];
  const duplicados: string[] = [];
  const vistos = new Set<string>();
  for (const fila of filas) {
    if (vistos.has(fila.georefId)) {
      duplicados.push(fila.georefId);
      continue;
    }
    vistos.add(fila.georefId);
    unicas.push(fila);
  }
  return { unicas, duplicados };
};
