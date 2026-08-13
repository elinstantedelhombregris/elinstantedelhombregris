/**
 * El adaptador de Ollama, **sin red**.
 *
 * Todo acá corre contra un `fetch` simulado. Ollama todavía no está instalado
 * en ninguna máquina de este proyecto, y ése es exactamente el motivo por el
 * que la conexión tiene que quedar probada antes: el día que alguien corra
 * `ollama serve`, esto tiene que andar sin que nadie toque una línea.
 *
 * Los cuatro casos que la suite existe para cubrir son los cuatro que se van a
 * dar de verdad: anda, contesta cualquier cosa, no está levantado, o no tiene
 * el modelo.
 */
import { describe, expect, it } from 'vitest';

import {
  esDireccionLocal,
  DIMENSIONES_POR_DEFECTO,
  EmbebedorOllama,
  MODELO_POR_DEFECTO,
  OLLAMA_URL_POR_DEFECTO,
  opcionesDelAmbiente,
} from '../embebedor-ollama.js';

/** Un `fetch` que devuelve siempre lo mismo y anota con qué lo llamaron. */
function fetchQueDevuelve(
  cuerpo: unknown,
  status = 200,
): { fetch: typeof globalThis.fetch; llamadas: { url: string; cuerpo: unknown }[] } {
  const llamadas: { url: string; cuerpo: unknown }[] = [];
  const fetchFalso: typeof globalThis.fetch = (entrada, init) => {
    const crudo = typeof init?.body === 'string' ? init.body : '{}';
    const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    llamadas.push({ url, cuerpo: JSON.parse(crudo) as unknown });
    return Promise.resolve(
      new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } }),
    );
  };
  return { fetch: fetchFalso, llamadas };
}

/** Un `fetch` que tira, como cuando no hay nadie escuchando en el puerto. */
const fetchCaido: typeof globalThis.fetch = () =>
  Promise.reject(new TypeError('fetch failed: connect ECONNREFUSED 127.0.0.1:11434'));

/** Tres dimensiones alcanzan para probar todo salvo el largo declarado. */
const chico = (opciones: Partial<ConstructorParameters<typeof EmbebedorOllama>[0]> = {}) =>
  new EmbebedorOllama({ dimensiones: 3, esperaMs: 50, ...opciones });

describe('los defaults', () => {
  it('apunta a un Ollama local con bge-m3 de 1024 dimensiones', () => {
    expect(OLLAMA_URL_POR_DEFECTO).toBe('http://127.0.0.1:11434');
    expect(MODELO_POR_DEFECTO).toBe('bge-m3');
    expect(DIMENSIONES_POR_DEFECTO).toBe(1024);
  });

  it('el ambiente puede mover la dirección, el modelo y las dimensiones', () => {
    // La dirección remota va acompañada de su declaración: sin eso la guarda
    // del host la rechaza, y ése es el punto de la guarda.
    expect(
      opcionesDelAmbiente({
        OLLAMA_URL: 'http://192.168.0.9:11434/',
        OLLAMA_HOST_REMOTO: '192.168.0.9:11434',
        OLLAMA_MODELO: 'nomic-embed-text',
        OLLAMA_DIMENSIONES: '768',
      }),
    ).toEqual({ url: 'http://192.168.0.9:11434', modelo: 'nomic-embed-text', dimensiones: 768 });
  });

  it('unas dimensiones que no son un entero positivo no arrancan la corrida', () => {
    expect(() => opcionesDelAmbiente({ OLLAMA_DIMENSIONES: 'mil' })).toThrow(/entero positivo/);
    expect(() => opcionesDelAmbiente({ OLLAMA_DIMENSIONES: '0' })).toThrow(/entero positivo/);
  });
});

describe('la respuesta buena', () => {
  it('manda model e input y devuelve un vector por texto', async () => {
    const { fetch, llamadas } = fetchQueDevuelve({
      embeddings: [
        [3, 0, 4],
        [0, 0, 2],
      ],
    });
    const embebedor = chico({ fetch, modelo: 'bge-m3' });

    const vectores = await embebedor.embeber(['la guita no alcanza', 'la plata no alcanza']);

    expect(llamadas).toHaveLength(1);
    expect(llamadas[0]?.url).toBe('http://127.0.0.1:11434/api/embed');
    expect(llamadas[0]?.cuerpo).toEqual({
      model: 'bge-m3',
      input: ['la guita no alcanza', 'la plata no alcanza'],
    });
    expect(vectores).toHaveLength(2);
  });

  it('normaliza cada vector a norma 1', async () => {
    const { fetch } = fetchQueDevuelve({
      embeddings: [
        [3, 0, 4],
        [0, 0, 2],
      ],
    });

    const vectores = await chico({ fetch }).embeber(['a', 'b']);

    // (3,0,4) tiene norma 5 — el 3-4-5 de siempre.
    expect(vectores[0]).toEqual([0.6, 0, 0.8]);
    expect(vectores[1]).toEqual([0, 0, 1]);
    for (const vector of vectores) {
      const norma = Math.sqrt(vector.reduce((suma, valor) => suma + valor * valor, 0));
      expect(norma).toBeCloseTo(1, 12);
    }
  });

  it('un lote vacío no golpea el servidor', async () => {
    const { fetch, llamadas } = fetchQueDevuelve({ embeddings: [] });

    await expect(chico({ fetch }).embeber([])).resolves.toEqual([]);
    expect(llamadas).toHaveLength(0);
  });
});

describe('la respuesta que no cierra', () => {
  it('menos vectores que textos no se guarda: el apareo es por posición', async () => {
    const { fetch } = fetchQueDevuelve({ embeddings: [[1, 0, 0]] });

    await expect(chico({ fetch }).embeber(['una', 'dos', 'tres'])).rejects.toThrow(
      /devolvió 1 vectores para 3 textos/,
    );
    await expect(chico({ fetch }).embeber(['una', 'dos', 'tres'])).rejects.toThrow(/No se guarda nada/);
  });

  it('más vectores que textos tampoco', async () => {
    const { fetch } = fetchQueDevuelve({
      embeddings: [
        [1, 0, 0],
        [0, 1, 0],
      ],
    });

    await expect(chico({ fetch }).embeber(['una'])).rejects.toThrow(/devolvió 2 vectores para 1 textos/);
  });

  it('un vector de otro largo que el declarado no entra', async () => {
    const { fetch } = fetchQueDevuelve({ embeddings: [[1, 0, 0, 0, 0]] });

    await expect(chico({ fetch }).embeber(['una'])).rejects.toThrow(
      /5 dimensiones y acá está declarado con 3/,
    );
  });

  it('el vector cero no se puede normalizar y se dice por qué', async () => {
    const { fetch } = fetchQueDevuelve({ embeddings: [[0, 0, 0]] });

    await expect(chico({ fetch }).embeber(['una'])).rejects.toThrow(/vector cero/);
  });

  it('un 200 sin embeddings avisa que del otro lado puede no haber un Ollama', async () => {
    const { fetch } = fetchQueDevuelve({ response: 'hola' });

    await expect(chico({ fetch }).embeber(['una'])).rejects.toThrow(/sin un campo «embeddings»/);
  });
});

describe('Ollama caído', () => {
  it('no devuelve un ECONNREFUSED pelado: dice qué hay que tipear', async () => {
    const embebedor = chico({ fetch: fetchCaido });

    const error = await embebedor.embeber(['una']).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    const mensaje = error instanceof Error ? error.message : '';
    expect(mensaje).toContain('No pude hablar con Ollama en http://127.0.0.1:11434');
    expect(mensaje).toContain('ollama serve');
    expect(mensaje).toContain('ollama pull bge-m3');
    expect(mensaje).toContain('OLLAMA_URL');
    // Y el motivo del sistema no se pierde: sigue estando, abajo.
    expect(mensaje).toContain('ECONNREFUSED');
  });

  it('el modelo configurado es el que aparece en el `pull`', async () => {
    const embebedor = chico({ fetch: fetchCaido, modelo: 'multilingual-e5-large' });

    await expect(embebedor.embeber(['una'])).rejects.toThrow(/ollama pull multilingual-e5-large/);
  });
});

describe('el modelo que no está bajado', () => {
  it('un 404 dice el pull exacto y no lo confunde con el servidor caído', async () => {
    const { fetch } = fetchQueDevuelve({ error: 'model "bge-m3" not found, try pulling it first' }, 404);
    const embebedor = chico({ fetch, modelo: 'bge-m3' });

    const error = await embebedor.embeber(['una']).catch((e: unknown) => e);
    const mensaje = error instanceof Error ? error.message : '';

    expect(mensaje).toContain('está levantado');
    expect(mensaje).toContain('no conoce el modelo «bge-m3»');
    expect(mensaje).toContain('ollama pull bge-m3');
    expect(mensaje).toContain('model "bge-m3" not found');
    // Lo contrario del caso de arriba: acá el servidor SÍ está.
    expect(mensaje).not.toContain('ollama serve');
  });

  it('un 400 sospecha del modelo que no es de embeddings', async () => {
    const { fetch } = fetchQueDevuelve({ error: 'invalid input type' }, 400);

    await expect(chico({ fetch, modelo: 'llama3' }).embeber(['una'])).rejects.toThrow(
      /no es un modelo de embeddings/,
    );
  });

  it('cualquier otro status manda a mirar la salida de ollama serve', async () => {
    const { fetch } = fetchQueDevuelve({ error: 'out of memory' }, 500);

    const error = await chico({ fetch }).embeber(['una']).catch((e: unknown) => e);
    const mensaje = error instanceof Error ? error.message : '';

    expect(mensaje).toContain('contestó 500');
    expect(mensaje).toContain('out of memory');
    expect(mensaje).toContain('Nada se guardó');
  });
});

describe('la guarda del host — el texto no sale por accidente', () => {
  it('reconoce las direcciones de esta máquina', () => {
    for (const url of [
      'http://127.0.0.1:11434',
      'http://localhost:11434',
      'http://127.5.5.5:11434',
      'http://[::1]:11434',
    ]) {
      expect(esDireccionLocal(url)).toBe(true);
    }
  });

  it('no toma por local nada que no lo sea', () => {
    for (const url of [
      'https://api.groq.com',
      'http://192.168.1.40:11434',
      'http://ollama.midominio.com',
      'no-es-una-url',
    ]) {
      expect(esDireccionLocal(url)).toBe(false);
    }
  });

  it('SE NIEGA a mandar el corpus a un host remoto sin que alguien lo declare', () => {
    // El agujero que esta guarda tapa: bastaba exportar una variable mal
    // escrita para que el texto entero de las voces saliera en el cuerpo de un
    // POST, sin que nada avisara.
    expect(() => opcionesDelAmbiente({ OLLAMA_URL: 'https://api.groq.com' })).toThrow(
      /no es esta máquina/,
    );
    expect(() => opcionesDelAmbiente({ OLLAMA_URL: 'https://api.groq.com' })).toThrow(
      /OLLAMA_HOST_REMOTO/,
    );
  });

  it('deja pasar el host remoto que alguien nombró, y sólo ése', () => {
    expect(
      opcionesDelAmbiente({
        OLLAMA_URL: 'http://192.168.1.40:11434',
        OLLAMA_HOST_REMOTO: '192.168.1.40:11434',
      }).url,
    ).toBe('http://192.168.1.40:11434');

    // Declarar un host no habilita otro.
    expect(() =>
      opcionesDelAmbiente({
        OLLAMA_URL: 'https://api.groq.com',
        OLLAMA_HOST_REMOTO: '192.168.1.40:11434',
      }),
    ).toThrow(/no es esta máquina/);
  });

  it('el default no necesita que nadie declare nada', () => {
    expect(opcionesDelAmbiente({}).url).toBe(OLLAMA_URL_POR_DEFECTO);
  });
});
