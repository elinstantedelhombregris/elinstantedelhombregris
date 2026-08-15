/**
 * La ingesta de una señal — la secuencia de cinco pasos, en orden.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 13.
 *
 * ## Por qué el orden es el diseño y no una preferencia
 *
 * Los cinco pasos —resolver, preparar, degradar, componer, normalizar— tienen
 * que correr en ese orden y no en otro. Invertir los dos del medio produce el
 * único modo de falla del módulo que **ningún CHECK puede cazar**: componer la
 * dirección ANTES de degradarla mete `"AV JOSE MARIA MORENO 1450"` dentro de
 * `direccion_texto`, que es `text` libre, con la columna `altura` en NULL
 * porque la política sí la retiró. La fila queda internamente contradictoria,
 * pasa las nueve guardas de dirección, sale por la API y sale por el volcado
 * público. Es una puerta de calle publicada a nombre de alguien que pidió que
 * no se publicara.
 *
 * Por eso `componerDireccion` se llavea en el `estado` que sale del paso 3 y no
 * en los campos crudos: el error queda inexpresable en la firma. Lo que la
 * firma **no** puede sostener es que ese `estado` haya salido efectivamente del
 * paso 3 — eso lo sostienen este archivo y su test.
 *
 * ## Qué decide el servidor y qué no
 *
 * `origen` lo decide la RUTA, nunca el cuerpo: si lo declarara el cliente, un
 * script se diría `campo` y lavaría spam de web como si fuera terreno
 * recorrido. La precisión publicada la recalcula el servidor y no le cree a
 * nadie. La `clase` sale de `claseDe(tipo)` y no del cuerpo: son dos columnas
 * porque los CHECK la necesitan sin un join, no porque haya dos fuentes.
 */
import {
  claseDe,
  componerDireccion,
  encuadreDeUbicacion,
  esVerificable,
  normalizedLocationLabel,
  prepareRecordLocation,
  techoDeTipo,
  ubicacionPublicable,
  vencimientosDe,
  DIA_MS,
  type PublishedPrecisionResult,
  type RangoDeAltura,
  type TipoSenal,
} from '@v2/civic-core';
import { GeoCallesRepository, SenalesRepository, getDb, type NewSenal } from '@v2/db';

import { HttpError } from '../../middleware/error-handler.js';
import { resolverUbicacion } from '../geo/resolver.js';

import type { CuerpoDeSenal } from '@v2/shared';

/** La versión del texto de cesión que firmó esta fila. Sube cuando cambia la pantalla. */
export const VERSION_DE_CESION = 1;

export interface OrigenDeIngesta {
  /** Lo decide la ruta y la credencial. Nunca el cuerpo. */
  readonly origen: 'web' | 'campo' | 'campo-v1';
  readonly actorId?: number | null;
  readonly userId?: number | null;
}

/** El recibo. Lo que sale y, sobre todo, lo que no. */
export interface ReciboDeSenal {
  readonly idPublico: string;
  readonly idLocal: string;
  readonly yaExistia: boolean;
  readonly estado: string;
  readonly tipo: string;
  readonly clase: string;
  readonly precisionPublicada: string;
  /** Por qué se engrosó el punto, en castellano, si se engrosó. */
  readonly engrosado: string | null;
  /** Qué se retiró de la dirección y por qué. */
  readonly direccionRetirada: string | null;
  readonly direccionTexto: string | null;
  /** Cuándo vuelve a mirarse esta señal. `null` mientras no tenga reloj. */
  readonly venceEl: string | null;
  /** Advertencias de la resolución geográfica, para mostrarlas y no esconderlas. */
  readonly avisos: readonly string[];
}

export async function ingerirSenal(
  cuerpo: CuerpoDeSenal,
  contexto: OrigenDeIngesta,
): Promise<ReciboDeSenal> {
  const db = getDb();
  const tipo = cuerpo.tipo;
  const clase = claseDe(tipo);
  const avisos: string[] = [];

  /**
   * La pregunta de la casa decide el rol y la sensibilidad, y por lo tanto
   * decide si se puede guardar una dirección. Va PRIMERO porque los cinco pasos
   * de abajo la necesitan: sin ella, los defaults de la tabla
   * (`subject` + `high`) disparan `senales_direccion_protegida_chk` y cualquier
   * dirección se cae. No es un extra del formulario — es su llave.
   */
  const encuadre = encuadreDeUbicacion(tipo, cuerpo.casa);

  // ── Paso 1 · Resolver la jerarquía ─────────────────────────────────────────
  const resuelta = await resolverUbicacion(db, {
    ...(cuerpo.calleId === null ? {} : { calleId: cuerpo.calleId }),
    ...(cuerpo.cityId === null ? {} : { localidadId: cuerpo.cityId }),
    ...(cuerpo.provinceId === null ? {} : { provinciaId: cuerpo.provinceId }),
    punto: cuerpo.punto,
  });

  const jerarquia = leerJerarquia(resuelta);
  if (jerarquia.aviso !== null) avisos.push(jerarquia.aviso);

  // ── Paso 2 · Preparar la ubicación, SIN etiqueta ───────────────────────────
  /**
   * `locationLabel` va deliberadamente ausente. La etiqueta se compone en el
   * paso 4, DESPUÉS de degradar; pasarla acá sería componerla antes y es
   * exactamente la inversión que el header describe.
   */
  const lugar = prepareRecordLocation({
    point: cuerpo.punto,
    requestedPrecision: cuerpo.precisionPedida ?? 'province',
    role: encuadre.role,
    sensitivity: encuadre.sensitivity,
    sujeto: encuadre.sujeto,
    audience: 'collective',
    overrideCoarsening: !cuerpo.aceptaEngrosado,
  });

  // ── Paso 3 · Degradar la dirección y la jerarquía ──────────────────────────
  const techo = techoDeTipo(tipo);
  if (!techo.reconocido) {
    // Inalcanzable: el contrato ya validó contra el canon. Se dice igual porque
    // un `as` silencioso acá sería el sumidero que todo el módulo evita.
    throw new HttpError(400, 'TIPO_DESCONOCIDO', `No conozco el tipo «${cuerpo.tipo}».`);
  }

  /**
   * Una sola lectura del catálogo y no dos. La calle trae su `rango` ya
   * normalizado —`RangoDeAltura`, nunca un par de ceros— y su `nombre`
   * presentable, que son las dos cosas que los pasos 3 y 4 necesitan.
   */
  const calle = cuerpo.calleId === null ? null : await leerCalle(db, cuerpo.calleId);
  const rango: RangoDeAltura = calle?.rango ?? { tipo: 'ausente' };

  const precisionEntera: PublishedPrecisionResult = {
    precision: lugar.publishedPrecision,
    coarsenedBecause: lugar.coarsenedBecause,
    overridable: encuadre.sujeto === 'propio',
  };

  const publicable = ubicacionPublicable({
    tipo,
    direccion: {
      calleId: cuerpo.calleId,
      altura: cuerpo.altura,
      textoLibre: cuerpo.direccionLibre,
    },
    rango,
    jerarquia: { cityId: jerarquia.cityId, departmentId: jerarquia.departmentId },
    precision: precisionEntera,
    hayPunto: lugar.exact !== null,
    role: encuadre.role,
    sensitivity: encuadre.sensitivity,
  });

  // ── Paso 4 · Componer el texto, sobre lo que salió del paso 3 ──────────────
  const compuesta = componerDireccion({
    estado: publicable.estado,
    nombreCalle: publicable.calleId === null ? null : (calle?.nombre ?? null),
    altura: publicable.altura,
    textoLibre: cuerpo.direccionLibre,
  });

  // ── Paso 5 · Normalizar la etiqueta ────────────────────────────────────────
  const direccionTexto = normalizedLocationLabel(compuesta);

  /**
   * El rechazo del engrosado necesita las DOS condiciones del CHECK, no una.
   *
   * `senales_rechazo_chk` exige `casa = 'propia' AND location_role = 'subject'`,
   * y acá se comprobaba sólo la primera. En cinco de los nueve tipos el rol NO
   * es `subject` —`práctica` es `meeting_point`, y `saber`, `sueño`, `propuesta`
   * y `pregunta` son `service_area`, porque hablan **de** un lugar y no señalan
   * la casa de nadie—, así que un envío con `casa: 'propia'` y
   * `aceptaEngrosado: false` pasaba el contrato Zod, llegaba al INSERT y moría
   * contra el CHECK: **500 en un endpoint público y sin auth, y la señal
   * perdida**. Lo encontró una revisión adversaria y lo disparó de verdad.
   *
   * Cuando el rol no es `subject` no hay nada que rechazar: no corrió ninguna
   * protección sobre la vivienda, así que la casilla no describe un
   * consentimiento sino una preferencia sin objeto. Se guarda `false` y **se
   * dice en el recibo** en vez de asentar en silencio el rechazo de una
   * propuesta que nunca se le hizo a nadie — que es justamente lo que la
   * columna existe para no hacer.
   */
  const rechazoPedido = !cuerpo.aceptaEngrosado && cuerpo.casa === 'propia';
  const rechazoHonrado = rechazoPedido && encuadre.role === 'subject';
  if (rechazoPedido && !rechazoHonrado) {
    avisos.push(
      `Pediste que no engrosemos el punto, pero un «${tipo}» habla de un área y no de una ` +
        'vivienda: no corre ninguna protección que rechazar, así que no quedó registrado ' +
        'ningún rechazo.',
    );
  }

  // ── La fila ────────────────────────────────────────────────────────────────
  const ahora = new Date();
  const relojes = calcularRelojes(tipo, ahora, cuerpo.comprometidoPara, cuerpo.diasDeVigencia);

  /**
   * `enviada → por_verificar`, en la MISMA sentencia del ingreso.
   *
   * La spec C §2.4 lo dice como una regla y no como una intención: una señal
   * pasa a `por_verificar` cuando (a) tiene provincia resuelta del lado del
   * servidor y (b) su evidencia terminó de procesarse, o no tiene evidencia.
   * Como todavía no hay sistema de evidencia, (b) se cumple siempre y el caso
   * normal es que las dos ya estén al llegar.
   *
   * **Sin esta línea toda señal nace y muere en `enviada`**, que es lo que
   * pasaba: `verificables` cuenta sólo los estados publicados, así que con todo
   * el país en `enviada` la nitidez de cada celda daba `inaplicable` y el mapa
   * se dibujaba perfectamente nítido sin haber comprobado una sola cosa.
   *
   * Sin provincia se queda en `enviada` y es correcto: una señal que no cae en
   * ningún lado no se le puede repartir a nadie para que la mire.
   *
   * **Y sólo avanzan los HECHOS y los ACTOS.** El catálogo `estados_senal` no
   * siembra el par `('por_verificar','deseo')` ni `('por_verificar','meta')`, y
   * eso no es un olvido: un deseo se delibera (regla 11) y una pregunta se
   * responde — ninguna de las dos pasa por un segundo par de ojos. Avanzarlas
   * igual reventaría contra la FK compuesta `(estado, clase)` con un 500 en cada
   * sueño, cada propuesta y cada pregunta del país. `esVerificable` es el mismo
   * predicado que decide quién entra al denominador de la nitidez, y tiene que
   * ser el mismo: si divergen, el mapa mide una cosa y la máquina corre otra.
   */
  const estadoInicial =
    esVerificable(clase) && jerarquia.provinceId !== null ? 'por_verificar' : 'enviada';

  const fila: NewSenal = {
    tipo,
    clase,
    estado: estadoInicial,
    origen: contexto.origen,
    idLocal: cuerpo.idLocal,
    texto: cuerpo.texto,
    titulo: cuerpo.titulo,
    fuente: cuerpo.fuente,
    firma: cuerpo.firma,
    actorId: contexto.actorId ?? null,
    userId: contexto.userId ?? null,

    /**
     * Los dos CHECK de la cesión se amarran entre sí: `senales_cesion_chk`
     * exige que `(cesion_en is null) <> cesion_licencia`, y
     * `senales_cesion_coherente_chk` que la fecha y la versión vayan juntas.
     * O sea que un booleano suelto no compila contra la base: sin fecha no hay
     * cesión, y sin cesión no puede haber fecha.
     */
    cesionLicencia: cuerpo.cedeLicencia,
    cesionEn: cuerpo.cedeLicencia ? ahora : null,
    cesionVersion: cuerpo.cedeLicencia ? VERSION_DE_CESION : null,

    /** `tema_origen` y `tema` se amarran con `senales_tema_coherente_chk`. */
    tema: cuerpo.tema,
    temaOrigen: cuerpo.tema === null ? 'ninguno' : 'declarado',
    ...(cuerpo.sinTema ? { temaIntentadoEn: ahora } : {}),

    provinceId: jerarquia.provinceId,
    cityId: publicable.cityId,
    departmentId: publicable.departmentId,
    lat: lugar.publicPoint === null ? null : String(lugar.publicPoint.lat),
    lng: lugar.publicPoint === null ? null : String(lugar.publicPoint.lng),
    precision: lugar.publishedPrecision,
    locationRole: encuadre.role,
    sensitivity: encuadre.sensitivity,
    ubicacionOrigen: jerarquia.origen,

    calleId: publicable.calleId,
    altura: publicable.altura,
    direccionEstado: publicable.estado,
    direccionTexto,

    casa: cuerpo.casa,
    engrosadoRechazado: rechazoHonrado,

    publicadaEn: ahora,
    ...(relojes === null ? {} : { venceElRevision: relojes.venceEl, caducaEl: relojes.caducaEl }),

    /**
     * Un `acto` necesita desenlace Y fecha, y el CHECK
     * `senales_acto_coherente_chk` amarra el par (desenlace, estado): `abierto`
     * sólo convive con `enviada`, `por_verificar` o `corroborada`.
     */
    ...(clase === 'acto'
      ? { desenlace: 'abierto' as const, comprometidoPara: cuerpo.comprometidoPara }
      : {}),
    ...(tipo === 'práctica'
      ? { periodicidad: cuerpo.periodicidad, sostenidaPor: cuerpo.sostenidaPor }
      : {}),
  };

  const repo = new SenalesRepository(db);
  const escrita = await repo.crear(fila);

  if (publicable.retirado !== null) avisos.push(publicable.retirado);

  /**
   * **Un reintento describe la fila GUARDADA, no la que acaba de llegar.**
   *
   * `crear` con `yaExistia: true` no escribe nada y devuelve tres campos. El
   * recibo armaba los otros ocho —`tipo`, `precisionPublicada`, `engrosado`,
   * `direccionTexto`…— con las variables locales de ESTA request, que nunca
   * tocó la base. Con el mismo `idLocal` y un cuerpo distinto, el servidor
   * confirmaba una publicación que no ocurrió: un reenvío que afina informaba
   * punto fino sobre una fila gruesa, y uno que achica informaba protección
   * sobre una fila fina. Es el campo que este módulo trata como el recibo del
   * consentimiento, así que mentirlo es peor que fallar.
   *
   * La web no lo dispara —genera un uuid nuevo por envío— pero el contrato dice
   * que `idLocal` **es** la clave de idempotencia del outbox, y el endpoint es
   * público y sin auth: cualquier cliente que lo use para lo que el contrato
   * dice lo dispara.
   *
   * Se relee y se contesta lo que hay. `avisos` lleva la diferencia dicha, para
   * que un outbox que mandó dos cuerpos distintos se entere en vez de creer que
   * el segundo pisó al primero.
   */
  if (escrita.yaExistia) {
    const guardada = await repo.porIdPublico(escrita.idPublico);
    if (guardada !== null) {
      const distinto = guardada.tipo !== tipo || guardada.texto !== cuerpo.texto;
      return {
        idPublico: guardada.idPublico,
        idLocal: cuerpo.idLocal,
        yaExistia: true,
        estado: guardada.estado,
        tipo: guardada.tipo,
        clase: guardada.clase,
        precisionPublicada: guardada.precision,
        // No se puede reconstruir por qué se engrosó una fila que se escribió
        // en otra request: `null` y no el motivo de ESTA, que sería inventarlo.
        engrosado: null,
        direccionRetirada: null,
        direccionTexto: guardada.direccionTexto,
        venceEl: null,
        avisos: distinto
          ? [
              ...avisos,
              'Esta señal ya estaba cargada con ese mismo identificador y NO se sobrescribió. ' +
                'Lo que ves es lo que quedó guardado la primera vez, no lo que acabás de mandar.',
            ]
          : avisos,
      };
    }
  }

  return {
    idPublico: escrita.idPublico,
    idLocal: cuerpo.idLocal,
    yaExistia: escrita.yaExistia,
    estado: escrita.estado,
    tipo,
    clase,
    precisionPublicada: lugar.publishedPrecision,
    engrosado: lugar.coarsenedBecause,
    direccionRetirada: publicable.retirado,
    direccionTexto,
    venceEl: relojes === null ? null : relojes.venceEl.toISOString(),
    avisos,
  };
}

/* -------------------------------------------------------------------------- */

interface Jerarquia {
  provinceId: number | null;
  cityId: number | null;
  departmentId: number | null;
  origen: string;
  aviso: string | null;
}

/**
 * `ubicacion_origen` no puede quedarse en `'ninguna'` si hay jerarquía: el
 * default de la columna no sirve como valor, hay que declarar de dónde salió.
 * Es la misma disciplina que `procedencia` en la Simulación — un número sin
 * origen es un número que nadie puede auditar.
 */
function leerJerarquia(r: Awaited<ReturnType<typeof resolverUbicacion>>): Jerarquia {
  switch (r.origen) {
    case 'catalogo':
      return {
        provinceId: r.provinciaId,
        cityId: r.localidadId,
        departmentId: r.departamentoId,
        origen: 'catalogo',
        aviso: r.discrepancia,
      };
    case 'declarada':
      return {
        provinceId: r.provinciaId,
        cityId: r.localidadId,
        departmentId: r.departamentoId,
        origen: 'declarada',
        aviso: null,
      };
    case 'punto':
      return {
        provinceId: r.provinciaId,
        cityId: null,
        departmentId: null,
        origen: 'punto',
        aviso: r.advertencia,
      };
    case 'ninguna':
      return {
        provinceId: null,
        cityId: null,
        departmentId: null,
        origen: 'ninguna',
        aviso: r.razon,
      };
  }
}

async function leerCalle(db: ReturnType<typeof getDb>, calleId: number) {
  const calle = await new GeoCallesRepository(db).porId(calleId);
  if (calle === undefined) {
    throw new HttpError(400, 'CALLE_DESCONOCIDA', 'Esa calle no está en el catálogo.');
  }
  return calle;
}

/**
 * Los dos relojes, calculados con `vencimientosDe` del núcleo.
 *
 * Se setean **al publicar** y no al corroborarse: un hecho que nadie confirma
 * también envejece, y con los relojes en NULL se quedaría en `por_verificar`
 * para siempre, contando en el denominador de su celda sin que ningún cron lo
 * barra.
 *
 * Una vigencia declarada acorta, nunca alarga: `Math.min` contra el techo del
 * tipo. Elegir cuánto dura lo propio es una preferencia; durar más de lo que la
 * clase de dato aguanta sería un permiso, y no lo da el formulario.
 *
 * `vencimientosDe` **tira** si un compromiso llega sin fecha. Acá no puede
 * pasar —el contrato Zod ya lo rechazó con un 400 que nombra el campo— y el
 * `catch` existe igual para que, si algún día un camino nuevo se saltea el
 * contrato, salga un 400 y no un 500 con un stack en castellano adentro.
 */
function calcularRelojes(
  tipo: TipoSenal,
  publicadaEn: Date,
  comprometidoPara: string | null,
  diasDeclarados: number | null,
): { venceEl: Date; caducaEl: Date } | null {
  const fecha = comprometidoPara === null ? null : Date.parse(comprometidoPara);
  let v;
  try {
    v = vencimientosDe(tipo, publicadaEn.getTime(), fecha);
  } catch (error) {
    throw new HttpError(
      400,
      'SIN_FECHA',
      error instanceof Error ? error.message : 'Falta la fecha del compromiso.',
    );
  }

  if (diasDeclarados === null) {
    return { venceEl: new Date(v.venceEl), caducaEl: new Date(v.caducaEl) };
  }
  const pedido = publicadaEn.getTime() + diasDeclarados * DIA_MS;
  const venceEl = Math.min(pedido, v.venceEl);
  return { venceEl: new Date(venceEl), caducaEl: new Date(venceEl + (v.caducaEl - v.venceEl)) };
}
