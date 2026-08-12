/**
 * La corrida, sus particiones y las opciones de la línea de comandos.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 4.
 *
 * Todo lo de acá es **puro**: son las decisiones que se toman antes de tocar la
 * red o la base, y son justamente las que hay que poder afirmar en un test que
 * corre en cuarenta milisegundos. «¿Esta corrida se reanuda o empieza una
 * nueva?» es una pregunta que no debería necesitar una base de 500 MB para
 * contestarse.
 */

// ---------------------------------------------------------------------------
// El identificador de una corrida
// ---------------------------------------------------------------------------

/**
 * `20260812-153045`. Ordena cronológicamente al ordenarse alfabéticamente
 * —de eso depende `elegirCorrida`— y pasa el `^[A-Za-z0-9._:-]+$` con el que la
 * API valida `/paquete/:corrida/...`, porque este texto termina adentro de una
 * URL que se sirve `immutable`.
 */
export const nuevaCorrida = (ahora: Date): string => {
  const iso = ahora.toISOString();
  return `${iso.slice(0, 10).replaceAll('-', '')}-${iso.slice(11, 19).replaceAll(':', '')}`;
};

/**
 * `20260812-153045` de vuelta a la fecha que lo nombró.
 *
 * Es lo que hace que `fecha_de_corte` diga cuándo se LEYÓ la fuente y no cuándo
 * se corrió el `INSERT` de la versión. La diferencia sólo se nota en el caso que
 * importa: una corrida que quedó a medias hace tres meses, se reanuda hoy, no
 * encuentra nada pendiente y publica. Con `new Date()` el catálogo saldría
 * fechado hoy sobre datos de hace tres meses.
 *
 * Devuelve `null` —y nunca una fecha inventada— cuando el nombre no es uno de
 * los nuestros (`--corrida=ensayo-3`): quien la llama decide, con eso a la
 * vista, contra qué otra fecha real caer.
 */
export const fechaDeCorrida = (corrida: string): Date | null => {
  const partes = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/.exec(corrida);
  if (partes === null) return null;
  const n = (i: number): number => Number.parseInt(partes[i] ?? '', 10);
  const fecha = new Date(Date.UTC(n(1), n(2) - 1, n(3), n(4), n(5), n(6)));
  if (Number.isNaN(fecha.getTime())) return null;
  // El ida y vuelta descarta un `20261345-996060` que `Date.UTC` normalizaría
  // en silencio a otra fecha perfectamente plausible.
  return nuevaCorrida(fecha) === corrida ? fecha : null;
};

export interface ProgresoConocido {
  readonly corrida: string;
  readonly estado: string;
  /** Cuándo se tocó por última vez. `null` es «no se sabe», y no se reanuda a ciegas. */
  readonly actualizadoEn: Date | null;
}

export type EleccionDeCorrida =
  | {
      readonly tipo: 'reanuda';
      readonly corrida: string;
      readonly pendientes: number;
      readonly ultimaActividad: Date | null;
    }
  | {
      readonly tipo: 'nueva';
      readonly corrida: string;
      /** La corrida abierta que se dejó donde estaba, si había una. */
      readonly abandonada: {
        readonly corrida: string;
        readonly ultimaActividad: Date | null;
      } | null;
    };

/**
 * Cuánto puede quedarse quieta una corrida y seguir siendo reanudable.
 *
 * Un día. No es un número mágico: es «lo que se cortó anoche», que es el caso
 * real de la reanudación —matar el proceso, volver mañana— y ninguno de los
 * otros. Una corrida que quedó abierta hace un mes describe un país de hace un
 * mes, y reanudarla es publicar ese país con fecha de hoy.
 */
export const VENTANA_DE_REANUDACION_MS = 24 * 60 * 60 * 1000;

/**
 * Reanudar o empezar de nuevo.
 *
 * **Una corrida está cerrada cuando SE PUBLICÓ, no cuando sus particiones están
 * completas.** La diferencia es el caso que más duele: un proceso que completó
 * las 535 particiones y se murió justo antes de marcar la versión vigente. Con
 * «cerrada = todas completas», la corrida siguiente empezaría de cero y volvería
 * a bajar 534 particiones para no escribir una sola fila. Con esta regla,
 * retoma, no encuentra nada pendiente, publica la versión y termina en segundos.
 *
 * **Y «publicada» es «alguna vez», no «vigente ahora».** Esto decía
 * `c !== vigente`, que excluye sólo a la vigente DE ESTE MOMENTO: cuando una
 * segunda corrida se publica, la primera deja de ser vigente y vuelve a parecer
 * abierta —con todas sus particiones en `completa`, indistinguible de la corrida
 * que la reanudación existe para cubrir—. Medido: se borraron 300 calles de La
 * Matanza, se corrió el comando plano, el seed reanudó la corrida vieja, tomó el
 * atajo `ya_completa` en las 529 particiones y **reportó éxito sin reparar
 * nada**. Por eso `publicadas` son TODAS las filas de `geo_catalogo_version` y
 * ninguna de ellas es candidata.
 *
 * Si hay varias corridas abiertas gana la última, y las viejas quedan en la
 * tabla: `geo_seed_progreso` con la corrida adentro de la clave es el registro
 * de qué pasó cada vez, no un tablero que se borra.
 *
 * **Y una corrida vieja no se reanuda.** Sin la ventana, una corrida de hace
 * tres meses con todas sus particiones en `completa` se «reanuda», no encuentra
 * nada pendiente, saltea las 534 y publica una versión con `fecha_de_corte` de
 * hoy sobre datos que nadie volvió a mirar. Pasada la ventana se empieza una
 * corrida nueva y la vieja **se deja donde está**, con su nombre y su progreso:
 * la que se abandona se nombra en pantalla, no se borra.
 *
 * `--corrida=<id>` explícito reanuda igual, sin ventana: ahí hay una persona
 * que escribió el nombre y sabe lo que está pidiendo.
 */
export const elegirCorrida = (entrada: {
  readonly progresos: readonly ProgresoConocido[];
  /**
   * Las corridas que YA SE PUBLICARON ALGUNA VEZ: todas las filas de
   * `geo_catalogo_version`, vigentes o no. Es obligatorio y no tiene default —un
   * `[]` implícito sería «no sé» leído como «ninguna», que es exactamente el
   * defecto que esto arregla.
   */
  readonly publicadas: readonly string[];
  readonly pedida?: string | undefined;
  readonly ahora: Date;
  readonly ventanaMs?: number;
}): EleccionDeCorrida => {
  const { progresos, publicadas, pedida, ahora } = entrada;
  const ventanaMs = entrada.ventanaMs ?? VENTANA_DE_REANUDACION_MS;

  const pendientesDe = (corrida: string): number =>
    progresos.filter((p) => p.corrida === corrida && p.estado !== 'completa').length;

  /** La última vez que ALGUNA partición de esa corrida se tocó. */
  const actividadDe = (corrida: string): Date | null => {
    let ultima: Date | null = null;
    for (const p of progresos) {
      if (p.corrida !== corrida || p.actualizadoEn === null) continue;
      if (ultima === null || p.actualizadoEn.getTime() > ultima.getTime()) ultima = p.actualizadoEn;
    }
    return ultima;
  };

  if (pedida !== undefined && pedida.length > 0) {
    const existe = progresos.some((p) => p.corrida === pedida);
    return existe
      ? {
          tipo: 'reanuda',
          corrida: pedida,
          pendientes: pendientesDe(pedida),
          ultimaActividad: actividadDe(pedida),
        }
      : { tipo: 'nueva', corrida: pedida, abandonada: null };
  }

  const yaPublicadas = new Set(publicadas);
  const abiertas = [...new Set(progresos.map((p) => p.corrida))]
    .filter((corrida) => !yaPublicadas.has(corrida))
    .sort();
  const ultima = abiertas.at(-1);

  if (ultima === undefined) return { tipo: 'nueva', corrida: nuevaCorrida(ahora), abandonada: null };

  const actividad = actividadDe(ultima);
  // Sin fecha NO se reanuda. `null` es «no se sabe cuándo se tocó», y la lectura
  // permisiva de «no sé» es exactamente la que publica el país de otro mes.
  const vencida = actividad === null || ahora.getTime() - actividad.getTime() > ventanaMs;

  return vencida
    ? {
        tipo: 'nueva',
        corrida: nuevaCorrida(ahora),
        abandonada: { corrida: ultima, ultimaActividad: actividad },
      }
    : {
        tipo: 'reanuda',
        corrida: ultima,
        pendientes: pendientesDe(ultima),
        ultimaActividad: actividad,
      };
};

// ---------------------------------------------------------------------------
// Cerrar una partición, y saltearla
// ---------------------------------------------------------------------------

/**
 * Las tres clases de fila que la fuente entrega y que **no terminan siendo una
 * fila de la tabla**. Están juntas porque la contabilidad de la partición las
 * trata igual —hay que rendir cuentas de las tres— y separadas porque una es
 * benigna y las otras dos no.
 *
 *  - `duplicados`: la fuente declaró dos veces el mismo `georef_id`. La tabla
 *    guarda uno. Es el caso de los 3.349 asentamientos que ya entraron como
 *    localidad censal: **benigno, esperado, no pide permiso**.
 *  - `huerfanas`: la fila no pudo entrar (ilegible, sin ancestro, o un
 *    `georef_id` que se recodificó a otra localidad). **Cierra la partición
 *    sólo con `--tolerar-huerfanas`**, y aun así queda anotada.
 */
export interface CuentaDeParticion {
  /** Filas de la fuente que quedaron —o quedarán— como fila de la tabla. */
  readonly entraron: number;
  readonly duplicados: number;
  readonly huerfanas: number;
  /** Lo que declaró la fuente. */
  readonly total: number;
}

export type CierreDeParticion =
  | { readonly estado: 'completa'; readonly motivo: string | null }
  | { readonly estado: 'fallida'; readonly motivo: string };

/**
 * **La única regla de cierre, y es de suma.**
 *
 *     entraron + duplicados + huerfanas = total declarado por la fuente
 *
 * Es la que el verificador vuelve a afirmar del otro lado, contra `count(*)` de
 * la tabla. Que sea una suma y no una comparación de dos contadores es lo que
 * hace que las filas que no entraron tengan que estar contadas EN ALGÚN LADO:
 * no hay forma de cerrar una partición perdiendo filas en silencio.
 */
export const cerrarParticion = (
  cuenta: CuentaDeParticion,
  opciones: { readonly tolerarHuerfanas: boolean },
): CierreDeParticion => {
  const rendidas = cuenta.entraron + cuenta.duplicados + cuenta.huerfanas;
  if (rendidas !== cuenta.total) {
    return {
      estado: 'fallida',
      motivo:
        `la fuente declaró ${String(cuenta.total)} filas y se rindió cuenta de ` +
        `${String(rendidas)} (${String(cuenta.entraron)} entraron, ` +
        `${String(cuenta.duplicados)} duplicadas, ${String(cuenta.huerfanas)} huérfanas)`,
    };
  }
  if (cuenta.huerfanas > 0 && !opciones.tolerarHuerfanas) {
    return {
      estado: 'fallida',
      motivo:
        `${String(cuenta.huerfanas)} filas que la fuente entregó no pudieron entrar. ` +
        'Volvé a correr con --tolerar-huerfanas para cerrar la partición con esas filas ' +
        'anotadas en `geo_seed_progreso`, o arreglá la jerarquía que les falta.',
    };
  }
  return {
    estado: 'completa',
    motivo:
      cuenta.huerfanas > 0
        ? `cerrada con ${String(cuenta.huerfanas)} huérfanas toleradas y anotadas`
        : null,
  };
};

/**
 * Saltear una partición de la jerarquía por huella.
 *
 * La huella dice «**la fuente** no cambió», nunca «la base tiene esto». Lo
 * segundo lo dice `filasQueCambian`, que sale de comparar cada fila planificada
 * contra el índice de la base: si una sola fila entraría distinta —o no está—,
 * la partición NO se saltea.
 *
 * Sin esa segunda condición, una tabla vaciada A MEDIAS pasa: con 27 localidades
 * sobrevivientes de 4.027 la huella de la fuente coincide igual, la partición
 * cierra `completa`, y las 4.000 que faltan no las vuelve a mirar nadie.
 */
export const salteaElNivel = (entrada: {
  readonly huellaPrevia: string | undefined;
  readonly hash: string;
  readonly filasQueCambian: number;
}): boolean => entrada.huellaPrevia === entrada.hash && entrada.filasQueCambian === 0;

/**
 * Saltear una partición de calles por huella.
 *
 * Mismo argumento que `salteaElNivel`, con el conteo de la tabla en lugar del
 * flag por fila: las calles no traen un «¿cambió?» calculado en memoria —lo
 * decide el `WHERE` del `DO UPDATE`, adentro del motor— así que la segunda
 * condición es que la tabla tenga **exactamente** las filas vigentes que esta
 * partición va a poner.
 */
export const salteaLaParticionDeCalles = (entrada: {
  readonly huellaPrevia: string | undefined;
  readonly hash: string;
  /** `count(*)` vigente de ese departamento, medido ANTES de escribir nada. */
  readonly enTabla: number;
  readonly entraran: number;
}): boolean => entrada.huellaPrevia === entrada.hash && entrada.enTabla === entrada.entraran;

// ---------------------------------------------------------------------------
// La completitud, con los dos lados separados
// ---------------------------------------------------------------------------

/**
 * Una partición vista desde los dos lados a la vez.
 *
 * `totalDeclarado` y `filasEscritas` salen del MISMO lado —los dos los escribió
 * el seed leyendo la fuente— y compararlos entre sí es la verificación circular
 * que motivó todo esto: si las filas nunca llegaron a la tabla, los dos números
 * coinciden igual y el verificador pasa en verde con el 4% faltando.
 *
 * `enTabla` es el otro lado: `count(*)` de la propia tabla, medido en el momento
 * de verificar y sin mirar nada de lo que el seed dejó escrito.
 */
export interface CompletitudDeParticion {
  readonly recurso: string;
  readonly particion: string;
  readonly estado: string;
  readonly totalDeclarado: number | null;
  readonly filasEscritas: number;
  /** `count(*)` de la propia tabla. El único lado independiente. */
  readonly enTabla: number;
  readonly duplicados: number;
  readonly huerfanas: number;
}

export interface ParticionObservada {
  readonly recurso: string;
  readonly particion: string;
  readonly motivo: string;
}

export interface TotalesDeCompletitud {
  readonly particiones: number;
  readonly declarado: number;
  readonly enTabla: number;
  readonly duplicados: number;
  readonly huerfanas: number;
}

export interface Completitud {
  /** La suma no cierra, o la partición nunca llegó a `completa`. Es una falla. */
  readonly rotas: readonly ParticionObservada[];
  /** Cierra, pero con filas que la fuente entregó y que no entraron. */
  readonly toleradas: readonly ParticionObservada[];
  readonly totales: TotalesDeCompletitud;
  readonly porRecurso: ReadonlyMap<string, TotalesDeCompletitud>;
}

const sumar = (a: TotalesDeCompletitud, fila: CompletitudDeParticion): TotalesDeCompletitud => ({
  particiones: a.particiones + 1,
  declarado: a.declarado + (fila.totalDeclarado ?? 0),
  enTabla: a.enTabla + fila.enTabla,
  duplicados: a.duplicados + fila.duplicados,
  huerfanas: a.huerfanas + fila.huerfanas,
});

const EN_CERO_TOTALES: TotalesDeCompletitud = {
  particiones: 0,
  declarado: 0,
  enTabla: 0,
  duplicados: 0,
  huerfanas: 0,
};

/**
 * **LA verificación de completitud, y es una suma.**
 *
 *     count(*) de la tabla  +  duplicados  +  huérfanas  =  total declarado
 *
 * Los tres sumandos de la izquierda son cosas distintas medidas de formas
 * distintas: el primero es la tabla, los otros dos son las filas que el seed
 * anotó como «entregadas y no guardadas» en `geo_seed_progreso`. El de la
 * derecha es la fuente. Si el seed pierde filas en silencio, el primero baja y
 * la igualdad se rompe: no hay forma de cerrar perdiendo filas.
 *
 * Para las particiones de la jerarquía —una por recurso— `enTabla` es el
 * `count(*)` del nivel entero, que es exactamente lo que esa partición escribe.
 * Para las 529 de calles es el `count(*)` de ese departamento.
 */
export const evaluarCompletitud = (
  filas: readonly CompletitudDeParticion[],
): Completitud => {
  const rotas: ParticionObservada[] = [];
  const toleradas: ParticionObservada[] = [];
  let totales = EN_CERO_TOTALES;
  const porRecurso = new Map<string, TotalesDeCompletitud>();

  for (const fila of filas) {
    totales = sumar(totales, fila);
    porRecurso.set(fila.recurso, sumar(porRecurso.get(fila.recurso) ?? EN_CERO_TOTALES, fila));

    const donde = { recurso: fila.recurso, particion: fila.particion };

    if (fila.totalDeclarado === null) {
      rotas.push({
        ...donde,
        motivo: 'la fuente nunca dijo cuántas filas hay: no hay contra qué cerrar',
      });
      continue;
    }
    if (fila.estado !== 'completa') {
      rotas.push({ ...donde, motivo: `quedó en \`${fila.estado}\`` });
      continue;
    }

    const rendidas = fila.enTabla + fila.duplicados + fila.huerfanas;
    if (rendidas !== fila.totalDeclarado) {
      rotas.push({
        ...donde,
        motivo:
          `la fuente declaró ${conMiles(fila.totalDeclarado)} y la TABLA tiene ` +
          conMiles(fila.enTabla) +
          (fila.duplicados + fila.huerfanas > 0
            ? ` (+${conMiles(fila.duplicados)} duplicadas, +${conMiles(fila.huerfanas)} huérfanas)`
            : '') +
          `: faltan ${conMiles(fila.totalDeclarado - rendidas)}`,
      });
      continue;
    }
    if (fila.huerfanas > 0) {
      toleradas.push({
        ...donde,
        motivo: `${conMiles(fila.huerfanas)} filas de la fuente que no pudieron entrar`,
      });
    }
  }

  return { rotas, toleradas, totales, porRecurso };
};

/**
 * **QUIÉN DECIDE PUBLICAR.**
 *
 * El gate viejo decidía con las particiones que no cerraron según
 * `cerrarParticion`, y ahí `entraron` es lo PLANIFICADO —el lado de la fuente—.
 * Si las filas nunca llegaron a la tabla, esa suma cierra igual: el 2026-08-11
 * la corrida declaró 326.832 calles completas, la tabla tenía 323.865, y el
 * catálogo se publicó igual con el 1,2% faltando.
 *
 * `evaluarCompletitud` ya hace la cuenta con `count(*)` de la propia tabla, que
 * es el único lado independiente. Lo único que faltaba era que fuera ELLA la que
 * manda. Es una función pura y devuelve una unión: quien la llama no puede
 * publicar «igual» sin ignorar explícitamente la rama que dice que no.
 *
 * Las `toleradas` no bloquean: ésas ya pasaron por una decisión humana
 * —`--tolerar-huerfanas`, partición por partición— y quedan contadas en
 * `geo_seed_progreso` y nombradas en el reporte. Tolerar no es esconder, pero
 * tampoco es volver a preguntar.
 */
export type Publicacion =
  | { readonly tipo: 'publica' }
  | {
      readonly tipo: 'no_publica';
      /** Filas que la fuente declaró y que la tabla no tiene ni tiene anotadas. */
      readonly faltan: number;
      /** **Nunca 0.** Publicar sin cerrar es el defecto que este gate existe para no repetir. */
      readonly codigoDeSalida: 1;
      readonly aviso: string;
    };

export const decidirPublicacion = (completitud: Completitud, corrida: string): Publicacion => {
  const { rotas, totales } = completitud;
  const faltan = totales.declarado - (totales.enTabla + totales.duplicados + totales.huerfanas);

  const noSeMarcaVigente =
    `  La corrida ${corrida} NO se marca vigente: los endpoints siguen sirviendo el\n` +
    '  catálogo anterior, que es lo correcto. Volvé a correr el mismo comando.\n';

  // Una corrida sin una sola partición anotada no se lee como «entró todo»: se
  // lee como «no hay contra qué cerrar», que es una falla y no un permiso.
  if (totales.particiones === 0) {
    return {
      tipo: 'no_publica',
      faltan,
      codigoDeSalida: 1,
      aviso:
        '\nLa corrida no dejó UNA SOLA partición en `geo_seed_progreso`: no hay contra qué\n' +
        '  cerrar, y «nada anotado» no es «entró todo».\n' +
        noSeMarcaVigente,
    };
  }

  if (rotas.length === 0) return { tipo: 'publica' };

  return {
    tipo: 'no_publica',
    faltan,
    codigoDeSalida: 1,
    aviso:
      `\n${conMiles(rotas.length)} particiones NO cierran contra \`count(*)\` de la TABLA.\n` +
      `  La fuente declaró ${conMiles(totales.declarado)} filas y la tabla tiene ` +
      `${conMiles(totales.enTabla)} (+${conMiles(totales.duplicados)} duplicadas, ` +
      `+${conMiles(totales.huerfanas)} huérfanas): faltan ${conMiles(faltan)}.\n` +
      rotas
        .slice(0, 20)
        .map((r) => `    ${r.recurso}/${r.particion}: ${r.motivo}\n`)
        .join('') +
      (rotas.length > 20 ? `    … y ${conMiles(rotas.length - 20)} más\n` : '') +
      noSeMarcaVigente,
  };
};

// ---------------------------------------------------------------------------
// Las particiones del callejero
// ---------------------------------------------------------------------------

export interface ParticionDeCalles {
  /** El id del Estado del departamento: 5 dígitos. Es la `particion` en la tabla. */
  readonly georefId: string;
  /** El id interno del departamento, para diferenciar contra lo que ya está. */
  readonly id: number;
  readonly nombre: string;
  readonly provinciaId: number;
}

export interface LugarIndexado {
  readonly id: number;
  readonly level: string;
  readonly name: string;
  readonly provinceId: number;
  readonly vigenteHasta: Date | null;
}

/**
 * **La partición es por departamento y es obligatoria.** No por provincia: la
 * API entrega 15.000 filas por combinación de filtros y Buenos Aires sola tiene
 * más. Por departamento son 529 particiones y el más grande medido —Córdoba
 * Capital, 8.542 calles— usa el 57% del techo.
 *
 * Se ordenan por `georef_id` para que dos corridas recorran el país en el mismo
 * orden: con orden estable, «va por la 300 de 529» significa lo mismo hoy que
 * mañana, y una corrida interrumpida retoma donde se la ve retomar.
 *
 * Un departamento retirado (`vigente_hasta`) no se recorre: la fuente ya no lo
 * lista, así que preguntarle por sus calles devolvería cero y marcaría 529
 * particiones donde hay 528.
 */
export const particionesDeCalles = (
  indice: ReadonlyMap<string, LugarIndexado>,
  filtro?: { readonly provinciaId?: number },
): readonly ParticionDeCalles[] => {
  const particiones: ParticionDeCalles[] = [];
  for (const [georefId, lugar] of indice) {
    if (lugar.level !== 'department') continue;
    if (lugar.vigenteHasta !== null) continue;
    if (filtro?.provinciaId !== undefined && lugar.provinceId !== filtro.provinciaId) continue;
    particiones.push({
      georefId,
      id: lugar.id,
      nombre: lugar.name,
      provinciaId: lugar.provinceId,
    });
  }
  return particiones.sort((a, b) => a.georefId.localeCompare(b.georefId));
};

// ---------------------------------------------------------------------------
// La línea de comandos
// ---------------------------------------------------------------------------

export interface Opciones {
  /** **En seco por defecto**, igual que `geo:rellenar-provincias`. */
  readonly aplicar: boolean;
  readonly corrida: string | undefined;
  readonly base: string | undefined;
  readonly pausaMs: number | undefined;
  readonly soloJerarquia: boolean;
  readonly soloCalles: boolean;
  /** Limitar las particiones de calles a una provincia (id interno). Para ensayar. */
  readonly provinciaId: number | undefined;
  /**
   * **Dejar los tres btree compuestos en pie durante la carga.**
   *
   * El default es bajarlos SIEMPRE y reponerlos en el `finally`, porque es el
   * único camino con presupuesto medido. Esta bandera es la salida para la
   * re-siembra sobre datos vivos, donde cinco minutos de autocompletado en seq
   * scan sobre 326.832 filas puede doler más que el pico.
   */
  readonly conservarIndices: boolean;
  /**
   * Cerrar una partición que tiene filas que la fuente entregó y que no
   * pudieron entrar. Quedan contadas en `geo_seed_progreso` y nombradas en el
   * reporte: tolerar no es esconder.
   */
  readonly tolerarHuerfanas: boolean;
  readonly ayuda: boolean;
  readonly desconocidas: readonly string[];
}

const valorDe = (argv: readonly string[], nombre: string): string | undefined => {
  const prefijo = `--${nombre}=`;
  const encontrado = argv.find((a) => a.startsWith(prefijo));
  return encontrado === undefined ? undefined : encontrado.slice(prefijo.length);
};

const enteroDe = (argv: readonly string[], nombre: string): number | undefined => {
  const crudo = valorDe(argv, nombre);
  if (crudo === undefined) return undefined;
  const valor = Number.parseInt(crudo, 10);
  return Number.isFinite(valor) ? valor : undefined;
};

const BANDERAS = new Set([
  '--aplicar',
  '--solo-jerarquia',
  '--solo-calles',
  '--conservar-indices',
  '--tolerar-huerfanas',
  '--ayuda',
  '--help',
]);

const CON_VALOR = new Set(['corrida', 'base', 'pausa-ms', 'provincia']);

/**
 * **Las opciones desconocidas se juntan y se reportan, y el script no arranca.**
 * Un `--aplicarr` mal tipeado que corriera igual haría un simulacro de cuatro
 * minutos que alguien va a leer como una siembra hecha.
 */
export const leerOpciones = (argv: readonly string[]): Opciones => {
  const desconocidas = argv.filter(
    (a) => !BANDERAS.has(a) && ![...CON_VALOR].some((n) => a.startsWith(`--${n}=`)),
  );

  return {
    aplicar: argv.includes('--aplicar'),
    corrida: valorDe(argv, 'corrida'),
    base: valorDe(argv, 'base'),
    pausaMs: enteroDe(argv, 'pausa-ms'),
    soloJerarquia: argv.includes('--solo-jerarquia'),
    soloCalles: argv.includes('--solo-calles'),
    provinciaId: enteroDe(argv, 'provincia'),
    conservarIndices: argv.includes('--conservar-indices'),
    tolerarHuerfanas: argv.includes('--tolerar-huerfanas'),
    ayuda: argv.includes('--ayuda') || argv.includes('--help'),
    desconocidas,
  };
};

// ---------------------------------------------------------------------------
// Contra qué base se va a escribir, dicho en voz alta
// ---------------------------------------------------------------------------

export interface DestinoDeEscritura {
  readonly url: string;
  /** El host, sin usuario ni contraseña. Es lo único que se imprime. */
  readonly host: string;
  readonly variable: 'DATABASE_URL_UNPOOLED' | 'DATABASE_URL';
  /** La OTRA variable apunta a otro host. */
  readonly conflicto: { readonly variable: string; readonly host: string } | null;
}

const hostDe = (dsn: string): string => {
  try {
    return new URL(dsn).hostname;
  } catch {
    return '(DSN ilegible)';
  }
};

/**
 * **Cuál de las dos variables manda, y avisar cuando no coinciden.**
 *
 * `dotenv` no pisa lo que ya está en el ambiente, pero eso es **por variable**:
 * exportar `DATABASE_URL` apuntando a una rama efímera no impide que
 * `DATABASE_URL_UNPOOLED` siga saliendo del `.env` —o sea, de producción— y
 * estos scripts prefieren la segunda. El resultado sería una siembra de 326.832
 * filas contra la base equivocada sin un solo aviso.
 *
 * No se puede resolver eligiendo distinto: `DATABASE_URL_UNPOOLED` tiene que
 * ganar, es la conexión sin pooler que una carga larga necesita. Lo que sí se
 * puede es **decir el host en pantalla y gritar cuando las dos discrepan**, que
 * es la diferencia entre un error que se ve antes y uno que se ve después.
 */
export const elegirDestino = (env: {
  readonly DATABASE_URL_UNPOOLED?: string | undefined;
  readonly DATABASE_URL?: string | undefined;
}): DestinoDeEscritura | null => {
  const sinPooler = env.DATABASE_URL_UNPOOLED;
  const conPooler = env.DATABASE_URL;
  const elegida =
    sinPooler !== undefined && sinPooler.length > 0
      ? ({ url: sinPooler, variable: 'DATABASE_URL_UNPOOLED' } as const)
      : conPooler !== undefined && conPooler.length > 0
        ? ({ url: conPooler, variable: 'DATABASE_URL' } as const)
        : null;
  if (elegida === null) return null;

  const host = hostDe(elegida.url);
  // El `-pooler` es la MISMA base por otra puerta: no es una discrepancia.
  const raiz = (h: string): string => h.replace('-pooler.', '.');
  const otra =
    elegida.variable === 'DATABASE_URL_UNPOOLED' && conPooler !== undefined && conPooler.length > 0
      ? { variable: 'DATABASE_URL', host: hostDe(conPooler) }
      : null;

  return {
    url: elegida.url,
    host,
    variable: elegida.variable,
    conflicto: otra !== null && raiz(otra.host) !== raiz(host) ? otra : null,
  };
};

export const AVISO_DE_DESTINO = (destino: DestinoDeEscritura): string =>
  `base: ${destino.host}  (de ${destino.variable})\n` +
  (destino.conflicto === null
    ? ''
    : `\n  ATENCIÓN: ${destino.conflicto.variable} apunta a OTRA base: ${destino.conflicto.host}.\n` +
      `  Manda ${destino.variable}, que es la que ves arriba. Si querés escribir en la otra,\n` +
      `  exportá ${destino.variable} también — \`dotenv\` no pisa el ambiente, pero lo hace\n` +
      '  variable por variable, y la que quedó del `.env` es la que va a recibir las filas.\n\n');

export const AYUDA = `
El callejero del Estado, espejado. 326.832 calles y 17.986 lugares.

  pnpm --filter @v2/db geo:seed-callejero              # en seco: dice qué haría
  pnpm --filter @v2/db geo:seed-callejero --aplicar    # escribe

  --aplicar            escribe. Sin esto no toca una sola fila.
  --corrida=<id>       reanuda (o crea) una corrida puntual.
  --solo-jerarquia     las cinco fases de territorio, sin calles.
  --solo-calles        sólo el callejero (la jerarquía tiene que estar sembrada).
  --provincia=<id>     limita las particiones de calles a una provincia (id interno).
  --conservar-indices  deja los tres btree en pie durante la carga. NO es el default:
                       el camino con presupuesto medido los baja y los repone.
  --tolerar-huerfanas  cierra las particiones que tienen filas que la fuente entregó
                       y que no pudieron entrar. Quedan CONTADAS en geo_seed_progreso
                       y nombradas en el reporte; el verificador las sigue viendo.
  --base=<url>         otra base de la API (para ensayar contra un espejo).
  --pausa-ms=<n>       pausa entre llamadas. 350 ms es lo medido sin un solo 429.

Es reanudable: matarlo a la mitad y volver a arrancar sigue donde quedó (dentro de
las 24 h; pasadas, empieza una corrida nueva y deja la vieja donde está).
Es idempotente: una segunda corrida sin cambios en la fuente escribe cero filas.
`;

// ---------------------------------------------------------------------------
// Números para mirar mientras corre
// ---------------------------------------------------------------------------

export const conMiles = (n: number): string => new Intl.NumberFormat('es-AR').format(Math.trunc(n));

export const duracion = (ms: number): string => {
  const segundos = Math.round(ms / 1000);
  if (segundos < 60) return `${String(segundos)} s`;
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos)} min ${String(segundos % 60)} s`;
};

/**
 * Cuánto falta, con la velocidad de lo que ya pasó. Es una estimación y se dice
 * como estimación: un `~` adelante y nada de barras de progreso que prometen
 * exactitud sobre una API de terceros.
 */
export const faltante = (hechas: number, totales: number, transcurridoMs: number): string => {
  if (hechas <= 0 || hechas >= totales) return '';
  const restante = ((totales - hechas) * transcurridoMs) / hechas;
  return `~${duracion(restante)}`;
};
