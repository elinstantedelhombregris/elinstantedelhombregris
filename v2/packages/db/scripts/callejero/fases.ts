/**
 * Las seis fases, en el único orden que las FK permiten.
 *
 *   provincias → departamentos → municipios → localidades censales →
 *   asentamientos → calles
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5.
 *
 * ── LA UNIDAD DE REANUDACIÓN ES LA PARTICIÓN, Y ACÁ ESTÁ POR QUÉ ────────────
 *
 * Cada partición se **baja entera a memoria antes de escribir una sola fila**.
 * No es una comodidad: es lo que hace posible el `hash_fuente`. La huella se
 * calcula sobre la partición completa, así que compararla exige tenerla
 * completa — y esa comparación es lo único que hace que una partición sin
 * cambios se saltee sin tocar la base.
 *
 * El costo es que una partición cortada a la mitad se rehace entera. Con 529
 * particiones de 618 calles promedio, eso es **una llamada**, no una corrida:
 * el peor caso del país —Córdoba Capital, 8.542 calles— son dos. `offset_siguiente`
 * se sigue escribiendo mientras se baja, para que quede a la vista dónde murió
 * la corrida anterior, pero la partición arranca de cero al retomarse.
 *
 * Lo que la reanudación sí evita es lo que importa: las 300 particiones que ya
 * cerraron no se vuelven a bajar ni a escribir.
 *
 * ── LO QUE NUNCA PASA EN SILENCIO ──────────────────────────────────────────
 *
 * Una fila que la fuente entregó y que no pudo entrar —ilegible, sin ancestro,
 * recodificada— **se cuenta como huérfana**, se anota en `geo_seed_progreso` y
 * se nombra en el reporte con su id. La partición cierra sólo con
 * `--tolerar-huerfanas`, y aun cerrada la anotación queda.
 *
 * Antes esas filas no se contaban en ningún lado y la partición no llegaba
 * nunca a `completa`: la corrida nunca publicaba y **el único remedio era editar
 * el código**. Una salida que exige editar el código no es una salida, es un
 * bloqueo con otro nombre.
 *
 * ── LA REGLA DE CIERRE, Y ES UNA SUMA ──────────────────────────────────────
 *
 *     entraron + duplicados + huérfanas = total que declaró la fuente
 *
 * `cerrarParticion` la aplica y el verificador la vuelve a aplicar del otro
 * lado, con `count(*)` de la tabla en lugar de `entraron`. Que sea una suma es
 * lo que hace imposible cerrar perdiendo filas: lo que no entró tiene que estar
 * contado en algún sumando.
 */
import { cerrarParticion, salteaElNivel, salteaLaParticionDeCalles } from './corrida.js';
import {
  claveDeParticion,
  callesDelDepartamento,
  LOTE_DE_CALLES,
  PARTICION_ENTERA,
  retirarCalles,
  retirarLugares,
  vigentesDelNivel,
} from './escribir.js';
import {
  deduplicarPorGeorefId,
  huellaDePagina,
  huellaDeParticion,
  leerCalle,
  leerLugar,
  lineaDeCalle,
  lineaDeLugar,
  planificarCalle,
  planificarLugar,
} from './normalizar.js';

import type { ParticionDeCalles } from './corrida.js';
import type { RegistroDeProgreso, EstadoDeParticion } from './escribir.js';
import type { FuenteGeoref, Recurso } from './fuente.js';
import type { FilaDeLugar, LugarEnBase } from './normalizar.js';
import type { Db } from '../../src/client.js';
import type { CalleParaSembrar, GeoCallesRepository } from '../../src/repositories/geo-calles.js';
import type { GeographicRepository, NivelDeLugar } from '../../src/repositories/geographic.js';
import type { GeoSeedProgreso } from '../../src/schema/geo-seed.js';
import type { GeographicLocation } from '../../src/schema/geographic.js';

/**
 * El techo de la API tocado. Es un `throw` y no un valor de retorno porque no
 * hay decisión que tomar: si una partición no cabe, todas las demás son
 * sospechosas y seguir sembraría un país con agujeros que cierran la auditoría.
 */
export class ErrorDeTecho extends Error {
  constructor(
    readonly recurso: Recurso,
    readonly particion: string,
    motivo: string,
  ) {
    super(`[${recurso} · ${particion}] ${motivo}`);
    this.name = 'ErrorDeTecho';
  }
}

export interface ResumenDeParticion {
  readonly recurso: Recurso;
  readonly particion: string;
  readonly etiqueta: string;
  readonly estado: EstadoDeParticion;
  readonly totalDeclarado: number | null;
  /** Filas de la fuente contabilizadas. Es lo que cierra contra `total`. */
  readonly contabilizadas: number;
  readonly escritas: number;
  readonly sinCambios: number;
  /** El mismo `georef_id` declarado dos veces por la fuente. Benigno y esperado. */
  readonly duplicadas: number;
  /** Filas que la fuente entregó y que NO entraron. Cierran sólo si se toleran. */
  readonly huerfanas: number;
  readonly retiradas: number;
  readonly recodificaciones: readonly string[];
  readonly rangosInvertidos: number;
  readonly problemas: readonly string[];
  readonly salteada: 'no' | 'huella' | 'ya_completa';
  readonly alFilo: boolean;
  readonly motivo: string | null;
  readonly ms: number;
}

export interface Contexto {
  readonly db: Db;
  readonly fuente: FuenteGeoref;
  readonly registro: RegistroDeProgreso;
  readonly indice: Map<string, LugarEnBase>;
  readonly lugares: GeographicRepository;
  readonly calles: GeoCallesRepository;
  /** Las huellas de la corrida vigente: con eso se saltea lo que no cambió. */
  readonly huellasPrevias: ReadonlyMap<string, string>;
  /** El progreso de ESTA corrida, para no rehacer lo ya cerrado. */
  readonly hechas: ReadonlyMap<string, GeoSeedProgreso>;
  /** ¿Había calles antes de esta corrida? Decide si hay que buscar desapariciones. */
  readonly habiaCalles: boolean;
  /**
   * Las calles VIGENTES que la tabla ya tiene, por departamento, medidas ANTES
   * de escribir una sola fila. Es la segunda condición del salteo por huella: la
   * huella dice que la fuente no cambió, esto dice que la base efectivamente las
   * tiene. Una sola agregación al arrancar, no 529 `count(*)`.
   */
  readonly callesPorDepartamento: ReadonlyMap<string, number>;
  /**
   * Cerrar particiones que tienen filas que la fuente entregó y que no pudieron
   * entrar. Sin esto, una sola fila `sin_territorio` o `ilegible` —o una sola
   * recodificación— deja la partición sin llegar nunca a `completa`, la corrida
   * sin publicar, y el único remedio era editar el código.
   */
  readonly tolerarHuerfanas: boolean;
}

const aLugarEnBase = (fila: GeographicLocation): LugarEnBase => ({
  id: fila.id,
  level: fila.level,
  name: fila.name,
  nameNorm: fila.nameNorm,
  provinceId: fila.provinceId,
  parentId: fila.parentId,
  departmentId: fila.departmentId,
  municipalityId: fila.municipalityId,
  latitude: fila.latitude,
  longitude: fila.longitude,
  vigenteHasta: fila.vigenteHasta,
});

/** ¿Esta partición ya cerró en esta misma corrida? */
const yaCerrada = (ctx: Contexto, recurso: Recurso, particion: string): GeoSeedProgreso | null => {
  const previa = ctx.hechas.get(claveDeParticion(recurso, particion));
  if (previa === undefined) return null;
  if (previa.estado !== 'completa') return null;
  if (previa.totalDeclarado === null) return null;
  return previa.filasEscritas === previa.totalDeclarado ? previa : null;
};

const vacio = (
  recurso: Recurso,
  particion: string,
  etiqueta: string,
  salteada: 'huella' | 'ya_completa',
  previa: { totalDeclarado: number | null; filasEscritas: number },
): ResumenDeParticion => ({
  recurso,
  particion,
  etiqueta,
  estado: 'completa',
  totalDeclarado: previa.totalDeclarado,
  contabilizadas: previa.filasEscritas,
  escritas: 0,
  sinCambios: 0,
  duplicadas: 0,
  huerfanas: 0,
  retiradas: 0,
  recodificaciones: [],
  rangosInvertidos: 0,
  problemas: [],
  salteada,
  alFilo: false,
  motivo: null,
  ms: 0,
});

// ---------------------------------------------------------------------------
// Fase 1 · Las 24 provincias
// ---------------------------------------------------------------------------

/**
 * Las provincias **no se escriben desde el payload de georef**: entran desde
 * `PROVINCIAS_CANONICAS` (`seed-provinces.ts`), que es la lista con `iso_code`
 * y centroide que la plataforma ya tenía y que la `0013` no toca. Lo que hace
 * esta fase es la otra mitad: **auditar** que las 24 filas de la base y las 24
 * de la fuente son las mismas, por `georef_id`.
 *
 * El chequeo cruzado por nombre se hace y **no falla la corrida**: georef llama
 * a Tierra del Fuego «Tierra del Fuego, Antártida e Islas del Atlántico Sur» y
 * la base la llama «Tierra del Fuego». Con la tabla de alias de la Task 3 las
 * 24 coinciden; si una dejara de coincidir, el aviso dice que hay un alias que
 * agregar — pero la reconciliación real ya está hecha por `georef_id`, que es
 * precisamente para lo que existe esa columna.
 */
export async function auditarProvincias(
  ctx: Contexto,
  claveDeProvincia: (nombre: string) => string,
): Promise<ResumenDeParticion> {
  const desde = Date.now();
  const problemas: string[] = [];
  const lineas: string[] = [];
  let contabilizadas = 0;

  const leido = await ctx.fuente.pagina({ recurso: 'provincias', inicio: 0 });
  if (leido.estado === 'ilegible') {
    await ctx.registro.guardar({
      recurso: 'provincias',
      particion: '00',
      estado: 'fallida',
      totalDeclarado: null,
      filasEscritas: 0,
      offsetSiguiente: 0,
      hashFuente: null,
    });
    return {
      recurso: 'provincias',
      particion: '00',
      etiqueta: 'las 24 provincias',
      estado: 'fallida',
      totalDeclarado: null,
      contabilizadas: 0,
      escritas: 0,
      sinCambios: 0,
      duplicadas: 0,
      huerfanas: 0,
      retiradas: 0,
      recodificaciones: [],
      rangosInvertidos: 0,
      problemas: [leido.motivo],
      salteada: 'no',
      alFilo: false,
      motivo: leido.motivo,
      ms: Date.now() - desde,
    };
  }

  for (const cruda of leido.filas) {
    const lectura = leerLugar(cruda);
    if (lectura.estado === 'ilegible') {
      problemas.push(lectura.motivo);
      continue;
    }
    const { georefId, nombre } = lectura.lugar;
    const enBase = ctx.indice.get(georefId);
    if (enBase === undefined) {
      problemas.push(`la provincia ${georefId} «${nombre}» no está en la base`);
      continue;
    }
    if (enBase.level !== 'province') {
      problemas.push(`el georef_id ${georefId} está en la base como ${enBase.level}`);
      continue;
    }
    if (enBase.nameNorm !== claveDeProvincia(nombre)) {
      // No es un error de datos: es la señal de que falta un alias. La
      // reconciliación por `georef_id` ya salió bien.
      problemas.push(
        `«${nombre}» normaliza a «${claveDeProvincia(nombre)}» y la base tiene ` +
          `«${enBase.nameNorm ?? '(null)'}» — falta un alias en normalizeProvinceName`,
      );
    }
    lineas.push(`${georefId}${nombre}`);
    contabilizadas++;
  }

  const hash = huellaDeParticion([huellaDePagina(lineas)]);
  const completa = problemas.length === 0 && contabilizadas === leido.total;
  await ctx.registro.guardar({
    recurso: 'provincias',
    particion: '00',
    estado: completa ? 'completa' : 'fallida',
    totalDeclarado: leido.total,
    filasEscritas: contabilizadas,
    offsetSiguiente: leido.filas.length,
    hashFuente: completa ? hash : null,
  });

  return {
    recurso: 'provincias',
    particion: '00',
    etiqueta: 'las 24 provincias',
    estado: completa ? 'completa' : 'fallida',
    totalDeclarado: leido.total,
    contabilizadas,
    escritas: 0,
    sinCambios: contabilizadas,
    duplicadas: 0,
    huerfanas: 0,
    retiradas: 0,
    recodificaciones: [],
    rangosInvertidos: 0,
    problemas,
    salteada: 'no',
    alFilo: false,
    motivo: null,
    ms: Date.now() - desde,
  };
}

// ---------------------------------------------------------------------------
// Fases 2 a 5 · La jerarquía
// ---------------------------------------------------------------------------

/**
 * Una provincia como partición de un nivel de la jerarquía.
 *
 * Existe por una sola razón medida: **`asentamientos` son 14.673 filas y la API
 * entrega 10.000 por combinación de filtros**, así que ese nivel no se puede
 * bajar con una sola consulta — la tercera página es un 400 duro. Partido por
 * provincia, la mayor es Buenos Aires con 2.358.
 *
 * Es la misma forma que ya tenían las calles (partidas por departamento), y la
 * unidad de `geo_seed_progreso` pasa a ser la provincia: la reanudación queda
 * 24 veces más fina y una provincia sin cambios se saltea por huella.
 */
export interface ProvinciaComoParticion {
  /** El `georef_id` de la provincia: es la clave en `geo_seed_progreso`. */
  readonly georefId: string;
  /** El id interno, que acota las desapariciones a esta provincia. */
  readonly id: number;
  readonly nombre: string;
}

/** Las 24 provincias del índice, ordenadas por `georef_id` para que la corrida sea reproducible. */
export const provinciasDelIndice = (
  indice: Contexto['indice'],
): readonly ProvinciaComoParticion[] => {
  const provincias: ProvinciaComoParticion[] = [];
  for (const [georefId, fila] of indice) {
    if (fila.level === 'province' && fila.vigenteHasta === null) {
      provincias.push({ georefId, id: fila.id, nombre: fila.name });
    }
  }
  return provincias.sort((a, b) => a.georefId.localeCompare(b.georefId));
};

export async function sembrarNivel(
  ctx: Contexto,
  recurso: Recurso,
  nivel: NivelDeLugar,
  provincia?: ProvinciaComoParticion,
): Promise<ResumenDeParticion> {
  const desde = Date.now();
  const particion = provincia?.georefId ?? PARTICION_ENTERA;
  const etiqueta =
    provincia === undefined
      ? recurso.replaceAll('_', ' ')
      : `${recurso.replaceAll('_', ' ')} · ${provincia.nombre}`;

  const cerrada = yaCerrada(ctx, recurso, particion);
  if (cerrada !== null) return vacio(recurso, particion, etiqueta, 'ya_completa', cerrada);

  /**
   * Lo que la base YA tiene de este nivel, tomado **antes** de escribir nada.
   * Sirve para dos cosas y las dos lo necesitan crudo:
   *
   *  - decidir las desapariciones (lo que estaba y la fuente ya no lista);
   *  - **habilitar el salteo por huella.** Si el nivel está vacío, la huella no
   *    se puede usar: alguien que vacía la tabla a mano y vuelve a correr
   *    tendría todas las huellas coincidiendo con la corrida vigente, el seed
   *    saltearía el país entero sin escribir una fila, y publicaría una versión
   *    sobre una tabla vacía. La huella dice «la FUENTE no cambió», nunca «la
   *    base tiene esto».
   */
  const previosDelNivel = vigentesDelNivel(
    ctx.indice,
    nivel,
    ...(provincia === undefined ? [] : ([provincia.id] as const)),
  );

  // ── 1. Bajar la partición entera ────────────────────────────────────────
  const crudas: Record<string, unknown>[] = [];
  const recorrido = await ctx.fuente.recorrer(
    {
      recurso,
      inicioDesde: 0,
      ...(provincia === undefined ? {} : { filtros: { provincia: provincia.georefId } }),
    },
    async (pagina) => {
      for (const fila of pagina.filas) crudas.push({ ...fila });
      await ctx.registro.guardar({
        recurso,
        particion,
        estado: 'en_curso',
        totalDeclarado: pagina.total,
        filasEscritas: 0,
        offsetSiguiente: pagina.inicio + pagina.filas.length,
        hashFuente: null,
      });
    },
  );

  if (recorrido.estado === 'techo') {
    await ctx.registro.guardar({
      recurso,
      particion,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      filasEscritas: 0,
      offsetSiguiente: 0,
      hashFuente: null,
    });
    throw new ErrorDeTecho(recurso, particion, recorrido.motivo);
  }

  if (recorrido.estado === 'fallida') {
    await ctx.registro.guardar({
      recurso,
      particion,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      filasEscritas: 0,
      offsetSiguiente: recorrido.inicioSiguiente,
      hashFuente: null,
    });
    return {
      recurso,
      particion,
      etiqueta,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      contabilizadas: 0,
      escritas: 0,
      sinCambios: 0,
      duplicadas: 0,
      huerfanas: 0,
      retiradas: 0,
      recodificaciones: [],
      rangosInvertidos: 0,
      problemas: [recorrido.motivo],
      salteada: 'no',
      alFilo: false,
      motivo: recorrido.motivo,
      ms: Date.now() - desde,
    };
  }

  // ── 2. Normalizar ───────────────────────────────────────────────────────
  const problemas: string[] = [];
  const planificadas: { fila: FilaDeLugar; cambia: boolean }[] = [];
  const vistos = new Set<string>();
  const lineas: string[] = [];
  let duplicadas = 0;

  for (const cruda of crudas) {
    const lectura = leerLugar(cruda);
    if (lectura.estado === 'ilegible') {
      problemas.push(lectura.motivo);
      continue;
    }
    const plan = planificarLugar({ nivel, lugar: lectura.lugar, indice: ctx.indice });
    if (plan.estado === 'sin_ancestro') {
      problemas.push(`${plan.georefId} «${plan.nombre}»: falta ${plan.falta}`);
      continue;
    }
    if (plan.estado === 'duplicado') {
      // Los 3.349 asentamientos que ya entraron como localidad censal. Cuentan
      // como contabilizados —la fuente los declaró y los procesamos— y NO se
      // escriben: dos filas para el mismo lugar es el defecto que `georef_id`
      // vino a cerrar.
      duplicadas++;
      vistos.add(plan.georefId);
      lineas.push(`${plan.georefId}=${plan.comoNivel}`);
      continue;
    }
    vistos.add(plan.fila.georefId);
    lineas.push(lineaDeLugar(plan.fila));
    planificadas.push({ fila: plan.fila, cambia: plan.cambia });
  }

  const contabilizadas = planificadas.length + duplicadas + problemas.length;
  const hash = huellaDeParticion([huellaDePagina(lineas)]);

  // ── 3. Escribir sólo lo que cambió ──────────────────────────────────────
  let escritas = 0;
  let sinCambios = 0;
  const huellaPrevia = ctx.huellasPrevias.get(claveDeParticion(recurso, particion));

  /**
   * **El salteo mira las filas, no el tamaño del nivel.**
   *
   * `previosDelNivel.size > 0` cubría la tabla vaciada del todo y no la vaciada
   * a medias: con 27 localidades sobrevivientes de 4.027, la huella de la fuente
   * coincidía igual, la partición cerraba `completa` sobre una jerarquía rota, y
   * las 4.000 que faltaban no las miraba nadie.
   *
   * `cambia` sale de comparar cada fila planificada contra el índice de la base
   * —ya está calculado, no cuesta una consulta— y vale `true` para toda fila que
   * falta. Con una sola fila que cambiaría, no se saltea.
   */
  const filasQueCambian = planificadas.filter((p) => p.cambia).length;
  const salteada = salteaElNivel({ huellaPrevia, hash, filasQueCambian });

  if (!salteada) {
    for (const { fila, cambia } of planificadas) {
      if (!cambia) {
        sinCambios++;
        continue;
      }
      const guardada = await ctx.lugares.upsertLocation(fila);
      ctx.indice.set(fila.georefId, aLugarEnBase(guardada));
      escritas++;
    }
  } else {
    sinCambios = planificadas.length;
  }

  // ── 4. Las desapariciones no borran ─────────────────────────────────────
  let retiradas = 0;
  if (!salteada && problemas.length === 0) {
    const idsARetirar: number[] = [];
    for (const georefId of previosDelNivel) {
      if (vistos.has(georefId)) continue;
      const fila = ctx.indice.get(georefId);
      if (fila !== undefined) idsARetirar.push(fila.id);
    }
    retiradas = await retirarLugares(ctx.db, idsARetirar);
  }

  const cierre = cerrarParticion(
    {
      entraron: planificadas.length,
      duplicados: duplicadas,
      huerfanas: problemas.length,
      total: recorrido.total,
    },
    { tolerarHuerfanas: ctx.tolerarHuerfanas },
  );
  const completa = cierre.estado === 'completa';

  // Las dos anotaciones que hacen que la suma del verificador cierre, y van
  // ANTES de marcar la partición `completa`: si el proceso se muere en el medio,
  // queda una anotación sin partición cerrada —que la próxima corrida reescribe
  // al rehacer la partición— y nunca una partición cerrada sin sus anotaciones,
  // que le daría al verificador una suma rota sobre datos que están bien.
  await ctx.registro.anotar({
    recurso,
    particion,
    duplicados: duplicadas,
    huerfanas: problemas.length,
    yaAnotadas: new Set(ctx.hechas.keys()),
  });
  await ctx.registro.guardar({
    recurso,
    particion,
    estado: cierre.estado,
    totalDeclarado: recorrido.total,
    filasEscritas: contabilizadas,
    offsetSiguiente: recorrido.inicioSiguiente,
    hashFuente: completa ? hash : null,
  });

  return {
    recurso,
    particion,
    etiqueta,
    estado: cierre.estado,
    totalDeclarado: recorrido.total,
    contabilizadas,
    escritas,
    sinCambios,
    duplicadas,
    huerfanas: problemas.length,
    retiradas,
    recodificaciones: [],
    rangosInvertidos: 0,
    problemas,
    salteada: salteada ? 'huella' : 'no',
    alFilo: recorrido.alFilo,
    motivo: cierre.motivo,
    ms: Date.now() - desde,
  };
}

// ---------------------------------------------------------------------------
// Fase 6 · El callejero, partido por departamento
// ---------------------------------------------------------------------------

export async function sembrarCallesDeDepartamento(
  ctx: Contexto,
  departamento: ParticionDeCalles,
): Promise<ResumenDeParticion> {
  const desde = Date.now();
  const recurso: Recurso = 'calles';
  const particion = departamento.georefId;
  const etiqueta = departamento.nombre;

  const cerrada = yaCerrada(ctx, recurso, particion);
  if (cerrada !== null) return vacio(recurso, particion, etiqueta, 'ya_completa', cerrada);

  // ── 1. Bajar la partición entera ────────────────────────────────────────
  const crudas: Record<string, unknown>[] = [];
  const recorrido = await ctx.fuente.recorrer(
    { recurso, filtros: { departamento: departamento.georefId }, inicioDesde: 0 },
    async (pagina) => {
      for (const fila of pagina.filas) crudas.push({ ...fila });
      await ctx.registro.guardar({
        recurso,
        particion,
        estado: 'en_curso',
        totalDeclarado: pagina.total,
        filasEscritas: 0,
        offsetSiguiente: pagina.inicio + pagina.filas.length,
        hashFuente: null,
      });
    },
  );

  if (recorrido.estado === 'techo') {
    await ctx.registro.guardar({
      recurso,
      particion,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      filasEscritas: 0,
      offsetSiguiente: 0,
      hashFuente: null,
    });
    throw new ErrorDeTecho(recurso, particion, `${departamento.nombre}: ${recorrido.motivo}`);
  }

  if (recorrido.estado === 'fallida') {
    await ctx.registro.guardar({
      recurso,
      particion,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      filasEscritas: 0,
      offsetSiguiente: recorrido.inicioSiguiente,
      hashFuente: null,
    });
    return {
      recurso,
      particion,
      etiqueta,
      estado: 'fallida',
      totalDeclarado: recorrido.total,
      contabilizadas: 0,
      escritas: 0,
      sinCambios: 0,
      duplicadas: 0,
      huerfanas: 0,
      retiradas: 0,
      recodificaciones: [],
      rangosInvertidos: 0,
      problemas: [recorrido.motivo],
      salteada: 'no',
      alFilo: false,
      motivo: recorrido.motivo,
      ms: Date.now() - desde,
    };
  }

  // ── 2. Normalizar ───────────────────────────────────────────────────────
  const problemas: string[] = [];
  const listas: CalleParaSembrar[] = [];
  const lineas: string[] = [];
  let rangosInvertidos = 0;

  for (const cruda of crudas) {
    const lectura = leerCalle(cruda);
    if (lectura.estado === 'ilegible') {
      problemas.push(lectura.motivo);
      continue;
    }
    const plan = planificarCalle({ calle: lectura.calle, indice: ctx.indice });
    if (plan.estado === 'sin_territorio') {
      problemas.push(`${plan.georefId} «${plan.nombre}»: falta ${plan.falta}`);
      continue;
    }
    if (plan.rangoInvertido) rangosInvertidos++;
    listas.push(plan.calle);
    lineas.push(lineaDeCalle(plan.calle));
  }

  const hash = huellaDeParticion([huellaDePagina(lineas)]);

  /**
   * **La fuente puede declarar dos veces el mismo `georef_id`**, y dos filas
   * iguales adentro del mismo `INSERT … ON CONFLICT DO UPDATE` son el error
   * 21000 de Postgres: no falla la fila, **falla la corrida entera**. El
   * 2026-08-11 no las entregó, que es exactamente por qué esto no se descubre
   * corriendo — se descubre el día que las entregue.
   *
   * La huella se calcula ANTES de deduplicar, sobre lo que la fuente entregó: si
   * mañana empieza a mandar una repetida, eso es un cambio de la fuente y la
   * partición tiene que volver a mirarse.
   */
  const { unicas, duplicados } = deduplicarPorGeorefId(listas);

  /**
   * **El salteo pregunta también qué tiene la tabla.**
   *
   * `habiaCalles` era global: cubría la tabla vaciada del todo y no la vaciada a
   * medias, ni la de un departamento borrado a mano. El conteo por departamento
   * —medido antes de escribir, en una sola agregación— es la pregunta que
   * corresponde: la huella afirma que **la fuente** no cambió; esto afirma que
   * la base efectivamente tiene esas filas.
   */
  const enTabla = ctx.callesPorDepartamento.get(particion) ?? 0;
  const salteada = salteaLaParticionDeCalles({
    huellaPrevia: ctx.huellasPrevias.get(claveDeParticion(recurso, particion)),
    hash,
    enTabla,
    entraran: unicas.length,
  });

  // ── 3. Escribir, de a lotes ─────────────────────────────────────────────
  let escritas = 0;
  let sinCambios = 0;
  const recodificaciones: string[] = [];

  if (salteada) {
    sinCambios = unicas.length;
  } else {
    for (let i = 0; i < unicas.length; i += LOTE_DE_CALLES) {
      const lote = unicas.slice(i, i + LOTE_DE_CALLES);
      const resultado = await ctx.calles.upsertLote(lote);
      escritas += resultado.escritas;
      sinCambios += resultado.sinCambios;
      recodificaciones.push(...resultado.recodificaciones);
      await ctx.registro.guardar({
        recurso,
        particion,
        estado: 'en_curso',
        totalDeclarado: recorrido.total,
        filasEscritas: Math.min(i + lote.length, unicas.length),
        offsetSiguiente: recorrido.inicioSiguiente,
        hashFuente: null,
      });
    }
  }

  // ── 4. Las desapariciones no borran ─────────────────────────────────────
  let retiradas = 0;
  if (!salteada && enTabla > 0 && problemas.length === 0) {
    const previas = await callesDelDepartamento(ctx.db, departamento.id);
    const vistas = new Set(unicas.map((c) => c.georefId));
    const idsARetirar = previas
      .filter((c) => c.vigenteHasta === null && !vistas.has(c.georefId))
      .map((c) => c.id);
    retiradas = await retirarCalles(ctx.db, idsARetirar);
  }

  /**
   * Una recodificación es una fila que la fuente entregó y que **no entró**: el
   * `georef_id` ya existe apuntando a otra localidad, y mientras
   * `geo_calles_georef_unique` sea un unique total, el retiro + alta que
   * corresponde no se puede expresar. Cuenta como huérfana, con las ilegibles y
   * las que no encontraron territorio: las tres son «la fuente la entregó y la
   * tabla no la tiene», y las tres se anotan con nombre y apellido.
   */
  const huerfanas = problemas.length + recodificaciones.length;
  const entraron = unicas.length - recodificaciones.length;
  const contabilizadas = entraron + duplicados.length + huerfanas;

  const cierre = cerrarParticion(
    { entraron, duplicados: duplicados.length, huerfanas, total: recorrido.total },
    { tolerarHuerfanas: ctx.tolerarHuerfanas },
  );
  const completa = cierre.estado === 'completa';

  // Las anotaciones ANTES del cierre: ver el mismo paso en `sembrarNivel`.
  await ctx.registro.anotar({
    recurso,
    particion,
    duplicados: duplicados.length,
    huerfanas,
    yaAnotadas: new Set(ctx.hechas.keys()),
  });
  await ctx.registro.guardar({
    recurso,
    particion,
    estado: cierre.estado,
    totalDeclarado: recorrido.total,
    filasEscritas: contabilizadas,
    offsetSiguiente: recorrido.inicioSiguiente,
    hashFuente: completa ? hash : null,
  });

  return {
    recurso,
    particion,
    etiqueta,
    estado: cierre.estado,
    totalDeclarado: recorrido.total,
    contabilizadas,
    escritas,
    sinCambios,
    duplicadas: duplicados.length,
    huerfanas,
    retiradas,
    recodificaciones,
    rangosInvertidos,
    problemas,
    salteada: salteada ? 'huella' : 'no',
    alFilo: recorrido.alFilo,
    motivo: cierre.motivo,
    ms: Date.now() - desde,
  };
}
