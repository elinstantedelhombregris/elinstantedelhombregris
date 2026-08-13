/**
 * El embebedor real de La Radiografía: un Ollama corriendo en la máquina.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` R2 y §4.2.
 *
 * ## La decisión que este archivo hace cierta
 *
 * **El texto que escribe la gente no se manda a ningún proveedor externo.
 * Nunca.** Ni a Groq, ni a OpenAI, ni a Voyage. Los vectores los calcula un
 * modelo que corre acá, y por eso la política de privacidad no tiene que
 * ensanchar su tabla de transferencias ni una coma (ADR 0009, hecho 4).
 *
 * La spec §4.2 proponía `transformers.js` sobre ONNX. Ollama hace lo mismo sin
 * meter cien megabytes de pesos ni una segunda cadena de dependencias en el
 * monorepo: el modelo vive afuera del repo, se baja una vez con `ollama pull`,
 * y acá adentro esto es un `fetch` a localhost. Cero dependencias nuevas —
 * literalmente cero: `fetch` es global desde Node 18.
 *
 * ## Por qué el import de `Embebedor` es relativo y no `@v2/civic-core`
 *
 * `scripts/` **no es un workspace de pnpm** —no tiene `package.json`, sus
 * herramientas viven en las `devDependencies` de la raíz (ADR 0009, hecho 5)—
 * y en `v2/node_modules/@v2` sólo están enlazados `db`, `shared` y
 * `config-eslint`. `@v2/civic-core` no resuelve desde acá, y enlazarlo pide un
 * `pnpm install` que este trabajo tiene prohibido. El import relativo apunta al
 * mismo archivo que resolvería el nombre del paquete, es sólo de tipo, y no
 * arrastra nada: `embebedor.ts` no importa a nadie.
 *
 * Si algún día `scripts/` gana su `package.json`, esta línea pasa a ser
 * `import type { Embebedor } from '@v2/civic-core'` y nada más cambia.
 */
import type { Embebedor } from '../../packages/civic-core/src/radiografia/embebedor.js';

/** Ollama escucha acá salvo que alguien diga otra cosa. */
export const OLLAMA_URL_POR_DEFECTO = 'http://127.0.0.1:11434';

/**
 * ¿La dirección apunta a esta misma máquina?
 *
 * Existe porque sin esta guarda la promesa del encabezado era falsa: bastaba
 * exportar `OLLAMA_URL=https://loquesea.com` para que el corpus entero de voces
 * saliera en crudo en el cuerpo de un POST, sin que nada avisara. «El texto no
 * sale» no puede depender de que nadie escriba mal una variable de entorno.
 */
/**
 * Los cuatro octetos de una IPv4, cada uno de 0 a 255 y sin ceros a la
 * izquierda: `010.0.0.1` es octal para algunas bibliotecas y decimal para
 * otras, y una guarda que no se decide no es una guarda.
 */
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Si la URL apunta a esta máquina y a ninguna otra.
 *
 * **Escrito por igualdad y por rango, nunca por prefijo de cadena.** La versión
 * anterior cerraba con `limpio.startsWith('127.')` y eso acepta cualquier
 * dominio que empiece con esos cuatro caracteres: `127.evil.com` y
 * `127.0.0.1.evil.example.com` son nombres registrables que resuelven a donde
 * quiera su dueño, y los dos pasaban. Verificado antes de tocar nada.
 *
 * Importa más de lo que parece: es la guarda que sostiene la promesa de la
 * ADR 0009 —«el texto que escribe la gente no se manda a ningún proveedor
 * externo, nunca»—, y la usan tanto el embebedor como el completer de la
 * Simulación. Una guarda de privacidad que se puede saltear con un dominio de
 * diez dólares no protege nada, y encima hace creer que sí.
 */
export function esDireccionLocal(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    // Una IPv6 en una URL viene entre corchetes; el hostname los conserva.
    const limpio = hostname.replace(/^\[|\]$/g, '').toLowerCase();

    if (limpio === 'localhost' || limpio === '::1' || limpio === '0:0:0:0:0:0:0:1') return true;

    // Todo 127.0.0.0/8 es loopback, no sólo 127.0.0.1 — pero tiene que ser una
    // IPv4 de verdad, con sus cuatro octetos en rango.
    const m = IPV4.exec(limpio);
    if (m === null) return false;
    const octetos = m.slice(1, 5).map(Number);
    if (octetos.some((o) => o > 255)) return false;
    return octetos[0] === 127;
  } catch {
    return false;
  }
}

/** El primario de la spec §4.2: multilingüe denso, 1024 dimensiones. */
export const MODELO_POR_DEFECTO = 'bge-m3';

/** Las de `bge-m3`. Cambiar de modelo sin cambiar esto es un error ruidoso. */
export const DIMENSIONES_POR_DEFECTO = 1024;

/** Un modelo grande sobre un lote grande tarda. Un modelo colgado, para siempre. */
export const ESPERA_MAXIMA_MS = 180_000;

/**
 * Qué hay que hacer, en criollo, cuando Ollama no está.
 *
 * Un `ECONNREFUSED` pelado no le sirve a nadie: dice que algo falló y no dice
 * qué hacer. Esto dice las dos órdenes exactas que hay que tipear.
 */
const comoLevantarlo = (url: string, modelo: string): string =>
  [
    `No pude hablar con Ollama en ${url}.`,
    '',
    'Para que esto ande:',
    '  1. Levantá el servidor:  ollama serve',
    `  2. Bajá el modelo:       ollama pull ${modelo}`,
    '',
    `Si lo tenés en otra máquina o en otro puerto, pasá la dirección por OLLAMA_URL.`,
    'Si todavía no instalaste Ollama, esto no va a andar hasta que lo hagas — y no',
    'hay plan B con un proveedor externo: el texto de la gente no sale de acá.',
  ].join('\n');

export interface OpcionesDeOllama {
  /** Base del servidor, sin barra final. Default `OLLAMA_URL_POR_DEFECTO`. */
  url?: string | undefined;
  /** Nombre del modelo tal como lo conoce Ollama. Default `bge-m3`. */
  modelo?: string | undefined;
  /** Largo esperado de cada vector. Default 1024. */
  dimensiones?: number | undefined;
  /** Milisegundos antes de cortar una petición colgada. */
  esperaMs?: number | undefined;
  /**
   * El `fetch` a usar. Inyectable para que los tests corran **sin red**: la
   * suite entera de este archivo pasa un doble y nunca abre un socket.
   */
  fetch?: typeof globalThis.fetch | undefined;
}

/** Lo que el ambiente puede fijar, ya resuelto contra los defaults. */
export interface ConfiguracionDeOllama {
  url: string;
  modelo: string;
  dimensiones: number;
}

/** Lee la configuración del ambiente. Lo que no está, cae al default. */
export function opcionesDelAmbiente(
  entorno: Record<string, string | undefined> = process.env,
): ConfiguracionDeOllama {
  const crudas = entorno.OLLAMA_DIMENSIONES;
  const dimensiones = crudas === undefined ? DIMENSIONES_POR_DEFECTO : Number(crudas);
  if (!Number.isInteger(dimensiones) || dimensiones <= 0) {
    throw new Error(
      `OLLAMA_DIMENSIONES tiene que ser un entero positivo y llegó «${String(crudas)}». ` +
        `Si no sabés cuántas tiene tu modelo, borrá la variable y usá ${MODELO_POR_DEFECTO}.`,
    );
  }
  const url = (entorno.OLLAMA_URL ?? OLLAMA_URL_POR_DEFECTO).replace(/\/+$/, '');

  /*
   * La guarda del texto. Un Ollama en otra máquina TUYA es un caso legítimo
   * —una desktop con GPU en la misma red— así que esto no lo prohíbe: lo hace
   * deliberado. Hay que nombrar el host que se acepta, y nombrarlo es la
   * diferencia entre una decisión y un accidente de variable de entorno.
   */
  if (!esDireccionLocal(url)) {
    const aceptado = entorno.OLLAMA_HOST_REMOTO;
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return url;
      }
    })();
    if (aceptado !== host) {
      throw new Error(
        `OLLAMA_URL apunta a «${host}», que no es esta máquina.\n\n` +
          `El texto que escribe la gente sale de acá en el cuerpo de cada pedido, y ` +
          `esta plataforma decidió que eso no pasa por accidente (ADR 0009).\n\n` +
          `Si ese host es tuyo y sabés lo que estás haciendo, declaralo:\n` +
          `  OLLAMA_HOST_REMOTO=${host}\n\n` +
          `Si no lo es, dejá OLLAMA_URL sin definir y corré Ollama en esta máquina.`,
      );
    }
  }

  return {
    url,
    modelo: entorno.OLLAMA_MODELO ?? MODELO_POR_DEFECTO,
    dimensiones,
  };
}

/** `{ embeddings: number[][] }` y nada más. Todo lo demás de la respuesta sobra. */
function leerEmbeddings(cuerpo: unknown): number[][] | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null;
  const campo: unknown = (cuerpo as Record<string, unknown>).embeddings;
  if (!Array.isArray(campo)) return null;

  const vectores: number[][] = [];
  for (const fila of campo as unknown[]) {
    if (!Array.isArray(fila)) return null;
    const numeros: number[] = [];
    for (const valor of fila as unknown[]) {
      if (typeof valor !== 'number') return null;
      numeros.push(valor);
    }
    vectores.push(numeros);
  }
  return vectores;
}

/** El `error` que manda Ollama cuando puede. Sirve para no tragarse el motivo. */
function leerError(cuerpo: unknown): string | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null;
  const campo: unknown = (cuerpo as Record<string, unknown>).error;
  return typeof campo === 'string' && campo.length > 0 ? campo : null;
}

/**
 * Norma 1.
 *
 * El coseno entre dos vectores de norma 1 es su producto punto, así que
 * normalizar acá le ahorra una raíz cuadrada por par a un motor que compara
 * todos contra todos. Y deja los vectores comparables aunque el día de mañana
 * entre un modelo que no normaliza su salida.
 */
function aNormaUno(vector: readonly number[], indice: number, modelo: string): number[] {
  let suma = 0;
  for (const valor of vector) {
    if (!Number.isFinite(valor)) {
      throw new Error(
        `El modelo ${modelo} devolvió un valor que no es un número finito en el vector ${String(indice)}. ` +
          'Un NaN acá envenena todas las distancias y no se guarda.',
      );
    }
    suma += valor * valor;
  }
  const norma = Math.sqrt(suma);
  if (norma === 0) {
    throw new Error(
      `El modelo ${modelo} devolvió el vector cero para el texto ${String(indice)}. ` +
        'Eso no se puede normalizar ni comparar: revisá que el modelo sea de embeddings y no de chat.',
    );
  }
  return vector.map((valor) => valor / norma);
}

/**
 * `Embebedor` contra un Ollama local.
 *
 * No guarda estado entre llamadas y no cachea: quien decide qué embeber y qué
 * saltear es el job, que lo sabe mirando la base.
 */
export class EmbebedorOllama implements Embebedor {
  readonly modelo: string;
  readonly dimensiones: number;
  private readonly url: string;
  private readonly esperaMs: number;
  private readonly pedir: typeof globalThis.fetch;

  constructor(opciones: OpcionesDeOllama = {}) {
    const delAmbiente = opcionesDelAmbiente();
    this.url = (opciones.url ?? delAmbiente.url).replace(/\/+$/, '');
    this.modelo = opciones.modelo ?? delAmbiente.modelo;
    this.dimensiones = opciones.dimensiones ?? delAmbiente.dimensiones;
    this.esperaMs = opciones.esperaMs ?? ESPERA_MAXIMA_MS;
    this.pedir = opciones.fetch ?? globalThis.fetch;
  }

  /** La dirección exacta que se golpea. Útil para que el job la reporte. */
  get direccion(): string {
    return `${this.url}/api/embed`;
  }

  async embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]> {
    // Un lote vacío no es un caso raro: es lo que pasa cuando el job ya
    // embebió todo. Golpear el servidor para nada sólo agrega una forma de
    // fallar.
    if (textos.length === 0) return [];

    const respuesta = await this.golpear(textos);
    const cuerpo = await this.leerCuerpo(respuesta);

    if (!respuesta.ok) {
      throw new Error(this.explicarHttp(respuesta.status, leerError(cuerpo)));
    }

    const vectores = leerEmbeddings(cuerpo);
    if (vectores === null) {
      throw new Error(
        `${this.direccion} contestó 200 pero sin un campo «embeddings» de números. ` +
          `¿Seguro que ${this.url} es un Ollama y no otra cosa escuchando en ese puerto?`,
      );
    }

    // El invariante que sostiene todo lo de aguas abajo: el job aparea por
    // POSICIÓN el texto que mandó con el vector que volvió. Si los largos no
    // coinciden, cada vector se guardaría con el id de otra fila y la
    // constelación entera quedaría mal sin que nada se rompa. Muere acá.
    if (vectores.length !== textos.length) {
      throw new Error(
        `Ollama devolvió ${String(vectores.length)} vectores para ${String(textos.length)} textos. ` +
          'El job aparea texto y vector por posición, así que con esta respuesta cada vector ' +
          'quedaría pegado a la fila equivocada. No se guarda nada.',
      );
    }

    return vectores.map((vector, indice) => {
      if (vector.length !== this.dimensiones) {
        throw new Error(
          `El modelo ${this.modelo} devolvió un vector de ${String(vector.length)} dimensiones y ` +
            `acá está declarado con ${String(this.dimensiones)}. Un vector de otro largo no se puede ` +
            'comparar con los que ya están guardados. Corregí OLLAMA_DIMENSIONES, o el modelo.',
        );
      }
      return aNormaUno(vector, indice, this.modelo);
    });
  }

  private async golpear(textos: readonly string[]): Promise<Response> {
    try {
      return await this.pedir(this.direccion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.modelo, input: [...textos] }),
        signal: AbortSignal.timeout(this.esperaMs),
      });
    } catch (error: unknown) {
      // `fetch` tira acá cuando no hay nadie del otro lado (ECONNREFUSED),
      // cuando el DNS no resuelve, o cuando venció el `AbortSignal`. Las tres
      // se contestan igual: decir qué hay que tipear.
      const motivo = error instanceof Error ? error.message : String(error);
      throw new Error(`${comoLevantarlo(this.url, this.modelo)}\n\nLo que dijo el sistema: ${motivo}`);
    }
  }

  private async leerCuerpo(respuesta: Response): Promise<unknown> {
    try {
      return (await respuesta.json()) as unknown;
    } catch {
      // Un cuerpo que no es JSON no es motivo para perder el status.
      return null;
    }
  }

  private explicarHttp(status: number, dicho: string | null): string {
    const eco = dicho === null ? '' : `\nLo que dijo Ollama: «${dicho}»`;

    if (status === 404) {
      return (
        `Ollama está levantado en ${this.url}, pero no conoce el modelo «${this.modelo}».${eco}\n\n` +
        `Bajalo con:  ollama pull ${this.modelo}\n` +
        'Y si querés usar otro, poné su nombre en OLLAMA_MODELO — y sus dimensiones en ' +
        'OLLAMA_DIMENSIONES, porque no todas son 1024.'
      );
    }
    if (status === 400) {
      return (
        `Ollama rechazó el pedido (400) en ${this.direccion}.${eco}\n\n` +
        `Suele ser que «${this.modelo}» no es un modelo de embeddings. Verificá con:  ollama show ${this.modelo}`
      );
    }
    return (
      `Ollama contestó ${String(status)} en ${this.direccion}.${eco}\n\n` +
      'Mirá la salida de `ollama serve`: el motivo está ahí. Nada se guardó.'
    );
  }
}
