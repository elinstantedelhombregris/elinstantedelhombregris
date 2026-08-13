/**
 * El completer local: un Ollama corriendo en esta máquina.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §4.2.1 · ADR 0009.
 *
 * ## La decisión que este archivo hace cierta
 *
 * **El texto del proyecto no se manda a ningún proveedor externo. Nunca.** Ni
 * a Groq, ni a Anthropic, ni a OpenAI. Las personas del elenco las escribe un
 * modelo que corre acá, y por eso la política de privacidad no tiene que
 * ensanchar su tabla de transferencias ni una coma.
 *
 * ## Tres correcciones al mapa mental que hay que dejar escritas
 *
 * 1. **`OllamaCompleter` no existía.** `apps/api/src/lib/ai/` tiene
 *    exactamente `anthropic.ts`, `groq.ts`, `index.ts`, `stub.ts` y `types.ts`.
 *    La ADR 0009 lo nombra como *camino*, no como pieza hecha.
 * 2. **`getAICompleter()` elige Groq apenas ve `GROQ_API_KEY`**, y esa clave
 *    está en el `.env` de esta máquina. Un completer local agregado al final de
 *    esa cadena **nunca se usaría**, y el corpus saldría afuera en silencio.
 *    Por eso este archivo no se enchufa a esa fábrica: se pide explícito, y
 *    expone `local: true` para que el generador pueda abortar si le pasan otro.
 * 3. **Ollama no está instalado hoy.** Verificado: `which ollama` no devuelve
 *    nada y `curl 127.0.0.1:11434/api/tags` no contesta. La conexión se escribe
 *    igual y se prueba con un `fetch` inyectado —la suite entera de este
 *    archivo corre sin abrir un socket—, y cuando falta, el error dice los dos
 *    comandos exactos que hay que tipear. Es la decisión D4 de la ADR 0009,
 *    copiada del embebedor en vez de reinventada.
 *
 * ## La procedencia por corrida (D5)
 *
 * `sello()` pregunta por el modelo a `/api/show` y se trae **nombre, digest,
 * familia y cantidad de parámetros**. Dos corridas de modelos distintos lo
 * dicen en vez de esconderlo, y ese sello viaja después con cada magnitud que
 * cuelgue de este elenco.
 */
import { esDireccionLocal } from '../radiografia/embebedor-ollama.js';

import type {
  AICompleter,
  CompleteOptions,
  Completion,
  Message,
} from '../../apps/api/src/lib/ai/types.js';

/** Ollama escucha acá salvo que alguien diga otra cosa. */
export const OLLAMA_URL_POR_DEFECTO = 'http://127.0.0.1:11434';

/** Un 8B cuantizado: entra en 18 GB y escribe castellano rioplatense pasable. */
export const MODELO_POR_DEFECTO = 'llama3.1:8b-instruct-q4_K_M';

/** Escribir una persona son ~575 tokens de salida. Un modelo colgado, para siempre. */
export const ESPERA_MAXIMA_MS = 300_000;

/**
 * Qué hay que tipear cuando Ollama no está.
 *
 * Un `ECONNREFUSED` pelado dice que algo falló y no dice qué hacer. Esto dice
 * las tres órdenes exactas, y dice también que no hay plan B: el corpus no
 * sale de acá aunque haya una clave de proveedor a mano.
 */
const comoLevantarlo = (url: string, modelo: string): string =>
  [
    `No pude hablar con Ollama en ${url}.`,
    '',
    'Para que esto ande:',
    '  1. Instalalo:        brew install ollama',
    '  2. Levantá el server: ollama serve',
    `  3. Bajá el modelo:    ollama pull ${modelo}`,
    '',
    'Si lo tenés en otro puerto, pasá la dirección por OLLAMA_URL.',
    '',
    'Mientras tanto el modo gente sigue andando con el escritor fabricado',
    '(`--escritor=fabricado`): el elenco sale de una fórmula en vez de un modelo,',
    'lo dice en su texto, y su sello queda en null. Lo que NO hay es plan B con un',
    'proveedor externo: el texto del proyecto no sale de esta máquina.',
  ].join('\n');

export interface OpcionesDelCompleter {
  readonly url?: string | undefined;
  readonly modelo?: string | undefined;
  readonly esperaMs?: number | undefined;
  /** Inyectable para que los tests corran **sin red**. */
  readonly fetch?: typeof globalThis.fetch | undefined;
}

/** Lo que el ambiente puede fijar, ya resuelto contra los defaults. */
export function opcionesDelAmbiente(
  entorno: Record<string, string | undefined> = process.env,
): { url: string; modelo: string } {
  return {
    url: (entorno.OLLAMA_URL ?? OLLAMA_URL_POR_DEFECTO).replace(/\/+$/, ''),
    modelo: entorno.OLLAMA_MODELO_CHAT ?? MODELO_POR_DEFECTO,
  };
}

/** La ficha del modelo que `/api/show` devuelve, ya podada a lo que importa. */
export interface FichaDelModelo {
  readonly modelo: string;
  readonly digest: string;
  readonly familia: string;
  readonly parametros: string;
  readonly cuantizacion: string;
}

function leerTexto(cuerpo: unknown, ...camino: readonly string[]): string | null {
  let actual: unknown = cuerpo;
  for (const paso of camino) {
    if (typeof actual !== 'object' || actual === null) return null;
    actual = (actual as Record<string, unknown>)[paso];
  }
  return typeof actual === 'string' && actual.length > 0 ? actual : null;
}

function leerNumero(cuerpo: unknown, clave: string): number | undefined {
  if (typeof cuerpo !== 'object' || cuerpo === null) return undefined;
  const valor: unknown = (cuerpo as Record<string, unknown>)[clave];
  return typeof valor === 'number' ? valor : undefined;
}

/**
 * `AICompleter` contra un Ollama local.
 *
 * Implementa la misma interfaz que Groq y Anthropic —así el día que alguien
 * quiera cambiar de modelo local no hay una segunda forma de llamar a un
 * modelo— y le agrega dos cosas que esa interfaz no tiene y este módulo
 * necesita: `local`, para que el generador pueda **abortar** si le pasan un
 * completer remoto, y `ficha()`, que es de dónde sale la procedencia por
 * corrida de la D5.
 */
export class CompleterOllama implements AICompleter {
  readonly local = true;
  readonly modelo: string;
  private readonly url: string;
  private readonly esperaMs: number;
  private readonly pedir: typeof globalThis.fetch;
  private fichaCacheada: FichaDelModelo | null = null;

  constructor(opciones: OpcionesDelCompleter = {}) {
    const ambiente = opcionesDelAmbiente();
    this.url = (opciones.url ?? ambiente.url).replace(/\/+$/, '');
    this.modelo = opciones.modelo ?? ambiente.modelo;
    this.esperaMs = opciones.esperaMs ?? ESPERA_MAXIMA_MS;
    this.pedir = opciones.fetch ?? globalThis.fetch;

    /**
     * La guarda que hace verdadera la promesa del encabezado.
     *
     * Sin esto bastaba exportar `OLLAMA_URL=https://loquesea.com` para que el
     * corpus entero saliera en el cuerpo de un POST sin que nada avisara. «El
     * texto no sale» no puede depender de que nadie escriba mal una variable
     * de entorno.
     */
    if (!esDireccionLocal(this.url)) {
      throw new Error(
        `OLLAMA_URL apunta a ${this.url}, que no es esta máquina. El corpus del proyecto no sale ` +
          'de acá: es la ADR 0009, y no tiene excepción por comodidad. Usá 127.0.0.1 o localhost.',
      );
    }
  }

  get direccion(): string {
    return `${this.url}/api/chat`;
  }

  /**
   * La ficha del modelo — nombre, digest, familia, parámetros, cuantización.
   *
   * Se cachea por instancia porque no cambia mientras corre, y porque un
   * elenco de mil personas no tiene por qué preguntar mil veces lo mismo.
   */
  async ficha(): Promise<FichaDelModelo> {
    if (this.fichaCacheada !== null) return this.fichaCacheada;

    const respuesta = await this.golpear(`${this.url}/api/show`, { model: this.modelo });
    const cuerpo = await this.leerCuerpo(respuesta);
    if (!respuesta.ok) {
      throw new Error(this.explicarHttp(respuesta.status, leerTexto(cuerpo, 'error')));
    }

    const digest =
      leerTexto(cuerpo, 'details', 'parent_model') ??
      leerTexto(cuerpo, 'model_info', 'general.basename') ??
      leerTexto(cuerpo, 'digest') ??
      'sin-digest';

    this.fichaCacheada = {
      modelo: this.modelo,
      digest,
      familia: leerTexto(cuerpo, 'details', 'family') ?? 'desconocida',
      parametros: leerTexto(cuerpo, 'details', 'parameter_size') ?? 'desconocidos',
      cuantizacion: leerTexto(cuerpo, 'details', 'quantization_level') ?? 'desconocida',
    };
    return this.fichaCacheada;
  }

  async complete(messages: Message[], opts: CompleteOptions = {}): Promise<Completion> {
    if (messages.length === 0) {
      throw new Error('Un `complete` sin mensajes no tiene qué contestar.');
    }

    const respuesta = await this.golpear(this.direccion, {
      model: this.modelo,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        // Temperatura 0 por defecto y a propósito: una corrida con temperatura
        // > 0 **no es reproducible**, y la `Corrida` lo dice en vez de
        // esconderlo. Quien quiera variedad la pide, y paga saberlo.
        temperature: opts.temperature ?? 0,
        num_predict: opts.maxTokens ?? 900,
        ...(opts.stop === undefined ? {} : { stop: opts.stop }),
      },
    });

    const cuerpo = await this.leerCuerpo(respuesta);
    if (!respuesta.ok) {
      throw new Error(this.explicarHttp(respuesta.status, leerTexto(cuerpo, 'error')));
    }

    const contenido = leerTexto(cuerpo, 'message', 'content');
    if (contenido === null) {
      throw new Error(
        `${this.direccion} contestó 200 pero sin un «message.content» de texto. ` +
          `¿Seguro que ${this.url} es un Ollama y no otra cosa escuchando en ese puerto?`,
      );
    }

    const promptTokens = leerNumero(cuerpo, 'prompt_eval_count');
    const completionTokens = leerNumero(cuerpo, 'eval_count');
    return {
      content: contenido,
      provider: 'ollama',
      model: this.modelo,
      ...(promptTokens === undefined ? {} : { promptTokens }),
      ...(completionTokens === undefined ? {} : { completionTokens }),
    };
  }

  /** Lo que Ollama informa de su propio reloj. Es lo que `calibrar` mide. */
  async medir(messages: Message[], opts: CompleteOptions = {}): Promise<MedicionDeOllama> {
    const respuesta = await this.golpear(this.direccion, {
      model: this.modelo,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: { temperature: opts.temperature ?? 0, num_predict: opts.maxTokens ?? 300 },
    });
    const cuerpo = await this.leerCuerpo(respuesta);
    if (!respuesta.ok) {
      throw new Error(this.explicarHttp(respuesta.status, leerTexto(cuerpo, 'error')));
    }
    return {
      entrada: leerNumero(cuerpo, 'prompt_eval_count') ?? 0,
      salida: leerNumero(cuerpo, 'eval_count') ?? 0,
      // Ollama informa en nanosegundos.
      prefillMs: (leerNumero(cuerpo, 'prompt_eval_duration') ?? 0) / 1e6,
      decodeMs: (leerNumero(cuerpo, 'eval_duration') ?? 0) / 1e6,
      totalMs: (leerNumero(cuerpo, 'total_duration') ?? 0) / 1e6,
    };
  }

  private async golpear(direccion: string, cuerpo: unknown): Promise<Response> {
    try {
      return await this.pedir(direccion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(this.esperaMs),
      });
    } catch (error: unknown) {
      // `fetch` tira acá cuando no hay nadie del otro lado (ECONNREFUSED),
      // cuando el DNS no resuelve, o cuando venció el `AbortSignal`. Las tres
      // se contestan igual: diciendo qué hay que tipear.
      const motivo = error instanceof Error ? error.message : String(error);
      throw new Error(
        `${comoLevantarlo(this.url, this.modelo)}\n\nLo que dijo el sistema: ${motivo}`,
      );
    }
  }

  private async leerCuerpo(respuesta: Response): Promise<unknown> {
    try {
      return (await respuesta.json()) as unknown;
    } catch {
      return null;
    }
  }

  private explicarHttp(status: number, dicho: string | null): string {
    const eco = dicho === null ? '' : `\nLo que dijo Ollama: «${dicho}»`;
    if (status === 404) {
      return (
        `Ollama está levantado en ${this.url}, pero no conoce el modelo «${this.modelo}».${eco}\n\n` +
        `Bajalo con:  ollama pull ${this.modelo}\n` +
        'Y si querés usar otro, poné su nombre en OLLAMA_MODELO_CHAT.'
      );
    }
    if (status === 400) {
      return (
        `Ollama rechazó el pedido (400).${eco}\n\n` +
        `Suele ser que «${this.modelo}» no es un modelo de chat. Verificá con:  ollama show ${this.modelo}`
      );
    }
    return (
      `Ollama contestó ${String(status)}.${eco}\n\n` +
      'Mirá la salida de `ollama serve`: el motivo está ahí. Nada se guardó.'
    );
  }
}

/** Lo que Ollama informa de una corrida, para calibrar el presupuesto. */
export interface MedicionDeOllama {
  readonly entrada: number;
  readonly salida: number;
  readonly prefillMs: number;
  readonly decodeMs: number;
  readonly totalMs: number;
}
