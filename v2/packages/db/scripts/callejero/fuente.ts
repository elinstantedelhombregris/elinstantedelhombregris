/**
 * CAPA 1 — TRAER. La API del Estado, y nada más que eso.
 *
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.7.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 1.
 *
 * Este módulo no sabe qué es una calle ni qué es una provincia: sabe pedir
 * páginas, contar filas y decir cuándo la fuente se quedó sin poder darnos lo
 * que declara. Que sea una capa aparte es lo que permite cambiar de fuente sin
 * tocar la normalización ni la escritura.
 *
 * ── LA PAGINACIÓN QUE EL PLAN DESCRIBÍA NO EXISTE ──────────────────────────
 *
 * El plan y la spec decían «con `max=1000` son 327 requests de calles», o sea
 * caminar `?inicio=` de mil en mil hasta 326.832. **Medido contra la API el
 * 2026-08-11: `inicio` topea en 10.000 y `max` topea en 5.000.** Son 15.000
 * filas por combinación de filtros y no hay forma de pedir la 15.001.
 *
 * Con el callejero como una sola consulta el corpus es inalcanzable, y el modo
 * de falla es el peor de todos: las primeras 15.000 filas entran perfecto, el
 * script no falla, y el país queda con el 4,6% de sus calles. Por eso hay dos
 * cosas acá y no una:
 *
 *   1. **La partición por departamento** —529 particiones— que hace que ninguna
 *      consulta se acerque al techo. El departamento más grande medido es
 *      Córdoba Capital con 8.542 calles: la partición no sólo alcanza, sobra.
 *   2. **El aborto por techo**, que es la parte que no se puede sacar. Si una
 *      partición declara o entrega 15.000 filas, el seed se detiene. `total`
 *      viene truncado en la misma respuesta, así que sin este chequeo
 *      `filas_escritas = total_declarado` cerraría igual y el país perdería
 *      calles en silencio el día que un departamento crezca.
 *
 * Medido: 534 llamadas secuenciales, concurrencia 1, 350 ms de pausa, 268
 * segundos, **cero 429**.
 */
import { setTimeout as dormirNativo } from 'node:timers/promises';

// ---------------------------------------------------------------------------
// Los números que la fuente impone
// ---------------------------------------------------------------------------

/** La API del Ministerio del Interior. Se puede apuntar a otra con `--base=`. */
export const BASE_GEOREF = 'https://apis.datos.gob.ar/georef/api';

/** El máximo que la API acepta en `max`. Pedir más devuelve 400. */
export const MAX_POR_PAGINA = 5_000;

/**
 * **El techo es la SUMA, y no dos topes independientes.** Medido contra la API
 * el 2026-08-12, pidiendo `max=5000&inicio=10000`:
 *
 * ```json
 * {"codigo_interno":1009,
 *  "mensaje":"La suma de parámetros 'max', 'inicio' debe ser menor o igual que 10000."}
 * ```
 *
 * Este archivo decía `TECHO = INICIO_MAXIMO + MAX_POR_PAGINA = 15.000`, o sea
 * los dos topes leídos como independientes. Con ese número:
 *
 *  - **`asentamientos` (14.673 filas) era IMPOSIBLE de bajar.** El plan de
 *    páginas daba `0, 5000, 10000`, y la tercera es un 400 duro: la fase moría
 *    después de traer 10.000 filas. El simulacro imprimía «3 páginas» y nunca
 *    lo descubría, porque en seco no se pide ninguna.
 *  - **`evaluarTecho` no podía disparar nunca.** Existe para abortar cuando una
 *    partición roza el techo —la única defensa contra perder filas en
 *    silencio— y estaba calibrado en un número que la fuente no puede
 *    devolver. La alarma del 90% quedaba en 13.500, también inalcanzable.
 *
 * Con el techo real, una partición de más de 10.000 aborta ANTES de pedir nada
 * y dice «hay que partir más fino», que es lo que la de asentamientos hace
 * ahora: 24 particiones por provincia, la mayor es Buenos Aires con 2.358.
 */
export const TECHO_DE_LA_API = 10_000;

/**
 * El `inicio` más grande que se puede pedir sin pasarse del techo. Se deriva y
 * no se declara: escrito a mano vuelve a poder contradecir a `TECHO_DE_LA_API`,
 * que es exactamente el defecto que esta línea cierra.
 */
export const INICIO_MAXIMO = TECHO_DE_LA_API - MAX_POR_PAGINA;

/**
 * Cuánto margen contra el techo se considera cómodo. Una partición que declara
 * más del 90% del techo **no aborta** —todavía entra entera— pero se avisa: es
 * la única forma de enterarse de que la partición elegida está por quedar
 * chica, un año antes de que quede chica de verdad.
 */
export const MARGEN_DE_ALARMA = 0.9;

/** Medida: con esta pausa, 534 llamadas seguidas y ningún 429. */
export const PAUSA_MS = 350;

/** Reintentos por página antes de dar la partición por fallida. */
export const REINTENTOS = 4;

// ---------------------------------------------------------------------------
// Los seis recursos, con sus paths exactos
// ---------------------------------------------------------------------------

export type Recurso =
  | 'provincias'
  | 'departamentos'
  | 'municipios'
  | 'localidades_censales'
  | 'asentamientos'
  | 'calles';

/**
 * El orden es obligatorio y no es estético: las FK no dejan otro. Una localidad
 * no puede entrar antes que su departamento.
 */
export const RECURSOS_EN_ORDEN = [
  'provincias',
  'departamentos',
  'municipios',
  'localidades_censales',
  'asentamientos',
  'calles',
] as const satisfies readonly Recurso[];

/**
 * **El path lleva guión y el recurso lleva guión bajo, y la diferencia importa:**
 * `/localidades-censales` y `/localidades` son DOS recursos distintos de la API.
 * Sembrar el equivocado entra filas plausibles y el `filas_escritas =
 * total_declarado` cierra igual — el error no falla, que es la peor clase de
 * error que hay.
 */
export const PATH_DE_RECURSO = {
  provincias: 'provincias',
  departamentos: 'departamentos',
  municipios: 'municipios',
  localidades_censales: 'localidades-censales',
  asentamientos: 'asentamientos',
  calles: 'calles',
} as const satisfies Record<Recurso, string>;

/** La clave del arreglo dentro del cuerpo de la respuesta. */
export const CLAVE_DE_RECURSO = {
  provincias: 'provincias',
  departamentos: 'departamentos',
  municipios: 'municipios',
  localidades_censales: 'localidades_censales',
  asentamientos: 'asentamientos',
  calles: 'calles',
} as const satisfies Record<Recurso, string>;

/** Una fila del payload, sin interpretar. La CAPA 2 es la que sabe leerla. */
export type FilaCruda = Readonly<Record<string, unknown>>;

// ---------------------------------------------------------------------------
// La URL
// ---------------------------------------------------------------------------

export interface Pedido {
  readonly recurso: Recurso;
  /** `provincia`, `departamento`… tal como los nombra la API. */
  readonly filtros?: Readonly<Record<string, string>>;
  readonly inicio: number;
  readonly max?: number;
}

/**
 * La URL de una página. `campos=completo` no es opcional: sin él, `/calles` no
 * trae `altura` y el callejero entra entero sin un solo rango, que es
 * exactamente el dato que hace que la dirección de una señal signifique algo.
 */
export const urlDePagina = (base: string, pedido: Pedido): string => {
  const url = new URL(`${base.replace(/\/+$/, '')}/${PATH_DE_RECURSO[pedido.recurso]}`);
  for (const [clave, valor] of Object.entries(pedido.filtros ?? {})) {
    url.searchParams.set(clave, valor);
  }
  url.searchParams.set('campos', 'completo');
  url.searchParams.set('max', String(pedido.max ?? MAX_POR_PAGINA));
  url.searchParams.set('inicio', String(pedido.inicio));
  return url.toString();
};

// ---------------------------------------------------------------------------
// La lectura del cuerpo
// ---------------------------------------------------------------------------

/**
 * Nunca `{ total: 0, filas: [] }` para decir «no entendí»: un cero que
 * significa «no sé» es el pecado que esta base entera está escrita para no
 * repetir. Un cuerpo ilegible es su propia rama y aborta la partición.
 */
export type CuerpoLeido =
  | { readonly estado: 'leido'; readonly total: number; readonly filas: readonly FilaCruda[] }
  | { readonly estado: 'ilegible'; readonly motivo: string };

export const leerCuerpo = (recurso: Recurso, cuerpo: unknown): CuerpoLeido => {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    return { estado: 'ilegible', motivo: 'el cuerpo de la respuesta no es un objeto' };
  }
  const raiz = cuerpo as Record<string, unknown>;

  const clave = CLAVE_DE_RECURSO[recurso];
  const filas = raiz[clave];
  if (!Array.isArray(filas)) {
    return { estado: 'ilegible', motivo: `el cuerpo no trae el arreglo \`${clave}\`` };
  }

  // `total` es contra lo que cierra toda la auditoría de completitud. Si no
  // viene, no hay nada contra qué verificar y seguir sería inventarse el número.
  const total = raiz.total;
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) {
    return { estado: 'ilegible', motivo: 'el cuerpo no trae un `total` que sea un número' };
  }

  const limpias: FilaCruda[] = [];
  for (const fila of filas) {
    if (typeof fila !== 'object' || fila === null) {
      return { estado: 'ilegible', motivo: 'el arreglo trae un elemento que no es un objeto' };
    }
    limpias.push(fila as FilaCruda);
  }

  return { estado: 'leido', total, filas: limpias };
};

// ---------------------------------------------------------------------------
// El techo
// ---------------------------------------------------------------------------

export type LecturaDelTecho =
  | { readonly estado: 'holgado'; readonly margen: number }
  | { readonly estado: 'al_filo'; readonly margen: number }
  | { readonly estado: 'tocado'; readonly motivo: string };

/**
 * Las dos formas de tocar el techo, y las dos abortan:
 *
 * - **La declarada:** `total >= 15.000`. La API ya dijo que tiene más de lo que
 *   puede entregar con esos filtros.
 * - **La entregada:** trajimos exactamente 15.000 filas. Es la firma de que
 *   `total` vino truncado — y con `total` truncado, `filas_escritas =
 *   total_declarado` cierra perfecto sobre un país incompleto.
 */
export const evaluarTecho = (total: number, traidas: number): LecturaDelTecho => {
  if (traidas >= TECHO_DE_LA_API) {
    return {
      estado: 'tocado',
      motivo:
        `la partición entregó ${String(traidas)} filas, que es el techo de la API ` +
        `(inicio<=${String(INICIO_MAXIMO)} + max<=${String(MAX_POR_PAGINA)}). ` +
        'Hay filas que esta consulta no va a devolver nunca: hay que partir más fino.',
    };
  }
  if (total >= TECHO_DE_LA_API) {
    return {
      estado: 'tocado',
      motivo:
        `la partición declara ${String(total)} filas y la API no entrega más de ` +
        `${String(TECHO_DE_LA_API)} por combinación de filtros. Hay que partir más fino.`,
    };
  }
  const margen = TECHO_DE_LA_API - total;
  return margen <= TECHO_DE_LA_API * (1 - MARGEN_DE_ALARMA)
    ? { estado: 'al_filo', margen }
    : { estado: 'holgado', margen };
};

/**
 * Los `inicio` que hay que pedir para cubrir `total` empezando en `inicioDesde`.
 * Nunca propone un `inicio` que la API va a rechazar: el corte por
 * `INICIO_MAXIMO` está acá y no en el que llama.
 */
export const planDePaginas = (
  total: number,
  inicioDesde: number,
  max: number = MAX_POR_PAGINA,
): readonly number[] => {
  const paginas: number[] = [];
  for (let inicio = Math.max(inicioDesde, 0); inicio < total; inicio += max) {
    if (inicio > INICIO_MAXIMO) break;
    paginas.push(inicio);
  }
  return paginas;
};

// ---------------------------------------------------------------------------
// El transporte
// ---------------------------------------------------------------------------

/**
 * Una respuesta HTTP, o la ausencia de una. Se separa `sin_respuesta` de un
 * código de estado porque no son lo mismo: un 503 es la fuente diciendo algo, y
 * un DNS caído no es un código 0.
 */
export type RespuestaHttp =
  | { readonly estado: 'respondio'; readonly codigo: number; readonly cuerpo: unknown }
  | { readonly estado: 'sin_respuesta'; readonly motivo: string };

/** El transporte, inyectable: los tests corren el recorrido entero sin red. */
export type Traedor = (url: string) => Promise<RespuestaHttp>;

export const traedorDeRed: Traedor = async (url) => {
  try {
    const respuesta = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(60_000),
    });
    // Un cuerpo que no es JSON con un 200 encima existe: es lo que devuelve un
    // portal cautivo o un proxy. Se trata como respuesta ilegible, no como red
    // caída, porque reintentarlo no lo va a arreglar.
    let cuerpo: unknown = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      cuerpo = null;
    }
    return { estado: 'respondio', codigo: respuesta.status, cuerpo };
  } catch (error) {
    return { estado: 'sin_respuesta', motivo: error instanceof Error ? error.message : 'error' };
  }
};

/** Backoff exponencial con techo. Pura, para que el test no espere de verdad. */
export const esperaDeReintento = (intento: number): number =>
  Math.min(500 * 2 ** Math.max(intento, 0), 8_000);

/** Reintentar sirve para 429 y para los 5xx; con un 400 sólo pierde tiempo. */
export const convieneReintentar = (respuesta: RespuestaHttp): boolean =>
  respuesta.estado === 'sin_respuesta' || respuesta.codigo === 429 || respuesta.codigo >= 500;

// ---------------------------------------------------------------------------
// El recorrido de una partición
// ---------------------------------------------------------------------------

export interface OpcionesDeFuente {
  readonly base?: string;
  readonly traedor?: Traedor;
  readonly pausaMs?: number;
  readonly reintentos?: number;
  readonly dormir?: (ms: number) => Promise<void>;
}

/** Lo que el recorrido le entrega al que escribe, página por página. */
export interface PaginaEntregada {
  readonly inicio: number;
  readonly total: number;
  readonly filas: readonly FilaCruda[];
}

export type Recorrido =
  | {
      readonly estado: 'completa';
      readonly total: number;
      readonly traidas: number;
      readonly inicioSiguiente: number;
      readonly alFilo: boolean;
    }
  | { readonly estado: 'techo'; readonly total: number; readonly motivo: string }
  | {
      readonly estado: 'fallida';
      readonly motivo: string;
      readonly total: number | null;
      readonly traidas: number;
      readonly inicioSiguiente: number;
    };

export class FuenteGeoref {
  private readonly base: string;
  private readonly traedor: Traedor;
  private readonly pausaMs: number;
  private readonly reintentos: number;
  private readonly dormir: (ms: number) => Promise<void>;

  constructor(opciones: OpcionesDeFuente = {}) {
    this.base = opciones.base ?? BASE_GEOREF;
    this.traedor = opciones.traedor ?? traedorDeRed;
    this.pausaMs = opciones.pausaMs ?? PAUSA_MS;
    this.reintentos = opciones.reintentos ?? REINTENTOS;
    this.dormir =
      opciones.dormir ??
      (async (ms) => {
        await dormirNativo(ms);
      });
  }

  /** Una página, con reintentos. La pausa entre llamadas la pone el recorrido. */
  async pagina(pedido: Pedido): Promise<CuerpoLeido> {
    const url = urlDePagina(this.base, pedido);
    let ultimo = 'sin intentos';

    for (let intento = 0; intento <= this.reintentos; intento++) {
      if (intento > 0) await this.dormir(esperaDeReintento(intento - 1));

      const respuesta = await this.traedor(url);
      if (respuesta.estado === 'respondio' && respuesta.codigo === 200) {
        const leido = leerCuerpo(pedido.recurso, respuesta.cuerpo);
        if (leido.estado === 'leido') return leido;
        // Un 200 con cuerpo ilegible no se reintenta: la fuente contestó y
        // contestó algo que no entendemos. Reintentarlo cuatro veces sólo
        // retrasa el error cuatro veces.
        return { estado: 'ilegible', motivo: `${leido.motivo} (${url})` };
      }

      ultimo =
        respuesta.estado === 'sin_respuesta'
          ? `sin respuesta: ${respuesta.motivo}`
          : `HTTP ${String(respuesta.codigo)}`;
      if (!convieneReintentar(respuesta)) break;
    }

    return { estado: 'ilegible', motivo: `${ultimo} (${url})` };
  }

  /** El `total` de un recurso sin traerse una sola fila. Es el pedido del simulacro. */
  async total(
    recurso: Recurso,
    filtros: Readonly<Record<string, string>> = {},
  ): Promise<CuerpoLeido> {
    return this.pagina({ recurso, filtros, inicio: 0, max: 1 });
  }

  /**
   * Una partición entera, página por página, entregando cada página a quien
   * escribe **antes** de pedir la siguiente: así un corte en la mitad deja
   * escrito lo que ya se trajo y `offset_siguiente` apuntando a la página que
   * falta, que es todo lo que la reanudación necesita.
   */
  async recorrer(
    pedido: Omit<Pedido, 'inicio'> & { readonly inicioDesde: number },
    alLlegarPagina: (pagina: PaginaEntregada) => Promise<void>,
  ): Promise<Recorrido> {
    const { recurso, inicioDesde } = pedido;
    const filtros = pedido.filtros ?? {};
    let inicio = Math.max(inicioDesde, 0);
    let traidas = 0;
    let total: number | null = null;
    let alFilo = false;

    for (;;) {
      if (inicio > INICIO_MAXIMO) {
        return {
          estado: 'techo',
          total: total ?? inicio,
          motivo: `hay que pedir inicio=${String(inicio)} y la API topea en ${String(INICIO_MAXIMO)}`,
        };
      }

      const leido = await this.pagina({ recurso, filtros, inicio });
      if (leido.estado === 'ilegible') {
        return {
          estado: 'fallida',
          motivo: leido.motivo,
          total,
          traidas,
          inicioSiguiente: inicio,
        };
      }

      if (total === null) {
        total = leido.total;
        // El techo se evalúa con lo DECLARADO antes de traer nada: si la
        // partición no cabe, no tiene sentido bajarle 15.000 filas primero.
        const techo = evaluarTecho(total, 0);
        if (techo.estado === 'tocado') return { estado: 'techo', total, motivo: techo.motivo };
        alFilo = techo.estado === 'al_filo';
      }

      if (leido.filas.length > 0) {
        await alLlegarPagina({ inicio, total: leido.total, filas: leido.filas });
        traidas += leido.filas.length;
      }

      const entregado = evaluarTecho(total, traidas);
      if (entregado.estado === 'tocado') {
        return { estado: 'techo', total, motivo: entregado.motivo };
      }

      // Una página vacía significa que la fuente dejó de entregar. Se corta sin
      // mover `inicio`: la partición queda incompleta y a la vista, en vez de
      // girar para siempre pidiendo páginas que no vienen.
      if (leido.filas.length === 0) break;
      inicio += leido.filas.length;
      if (inicioDesde + traidas >= total) break;

      if (this.pausaMs > 0) await this.dormir(this.pausaMs);
    }

    return {
      estado: 'completa',
      total,
      traidas,
      inicioSiguiente: inicio,
      alFilo,
    };
  }
}
