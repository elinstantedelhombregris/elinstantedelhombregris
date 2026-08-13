import { describe, expect, it, vi } from 'vitest';

import { CompleterOllama, opcionesDelAmbiente } from '../completer-ollama.js';

/**
 * El completer local, probado **sin demonio y sin red**.
 *
 * Hoy Ollama no está instalado en esta máquina —`which ollama` no devuelve
 * nada y `curl 127.0.0.1:11434/api/tags` no contesta— y la suite entera de
 * este archivo pasa igual, porque el `fetch` entra por constructor. Es la
 * decisión D4 de la ADR 0009: la conexión se escribe y se prueba aunque el
 * modelo no esté, y CI nunca va a tener un demonio levantado.
 */

const respuesta = (cuerpo: unknown, status = 200): Response =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const CHAT_OK = {
  message: { role: 'assistant', content: 'Una vecina de Formosa.' },
  prompt_eval_count: 890,
  eval_count: 575,
  prompt_eval_duration: 2_500_000_000,
  eval_duration: 27_000_000_000,
  total_duration: 29_500_000_000,
};

const SHOW_OK = {
  digest: 'sha256:deadbeef',
  details: {
    family: 'llama',
    parameter_size: '8.0B',
    quantization_level: 'Q4_K_M',
    parent_model: 'llama3.1:8b',
  },
};

describe('la promesa de que el texto no sale de esta máquina', () => {
  it('rechaza una URL que no sea local, en el constructor', () => {
    // Sin esta guarda bastaba exportar OLLAMA_URL=https://loquesea.com para que
    // el corpus entero saliera en el cuerpo de un POST sin que nada avisara.
    expect(() => new CompleterOllama({ url: 'https://api.ejemplo.com' })).toThrow(/no es esta máquina/i);
  });

  it('acepta 127.0.0.1 y localhost', () => {
    expect(() => new CompleterOllama({ url: 'http://127.0.0.1:11434' })).not.toThrow();
    expect(() => new CompleterOllama({ url: 'http://localhost:11434' })).not.toThrow();
  });

  it('se declara local, que es lo que el generador exige antes de escribir nada', () => {
    expect(new CompleterOllama({ fetch: vi.fn() }).local).toBe(true);
  });
});

describe('cuando Ollama no está —que es el caso de hoy—', () => {
  it('el error dice los tres comandos exactos, y que no hay plan B', async () => {
    const pedir = vi.fn().mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));
    const completer = new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch });

    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /brew install ollama/,
    );
    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /ollama pull/,
    );
    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /escritor fabricado/,
    );
    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /no sale de esta máquina/,
    );
  });

  it('un 404 enseña el `ollama pull` del modelo que falta', async () => {
    const pedir = vi.fn().mockResolvedValue(respuesta({ error: 'model not found' }, 404));
    const completer = new CompleterOllama({
      fetch: pedir as unknown as typeof globalThis.fetch,
      modelo: 'unmodelo:8b',
    });
    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /ollama pull unmodelo:8b/,
    );
  });

  it('un 200 que no es de Ollama se dice, en vez de devolver texto vacío', async () => {
    const pedir = vi.fn().mockResolvedValue(respuesta({ cualquier: 'cosa' }));
    const completer = new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch });
    await expect(completer.complete([{ role: 'user', content: 'hola' }])).rejects.toThrow(
      /message.content/,
    );
  });
});

describe('con Ollama contestando', () => {
  it('manda el modelo, no streamea, y usa temperatura 0 por defecto', async () => {
    const pedir = vi.fn().mockResolvedValue(respuesta(CHAT_OK));
    const completer = new CompleterOllama({
      fetch: pedir as unknown as typeof globalThis.fetch,
      modelo: 'llama3.1:8b-instruct-q4_K_M',
    });

    const salida = await completer.complete([{ role: 'user', content: 'hola' }]);
    expect(salida.content).toBe('Una vecina de Formosa.');
    expect(salida.provider).toBe('ollama');
    expect(salida.promptTokens).toBe(890);
    expect(salida.completionTokens).toBe(575);

    const [direccion, opciones] = pedir.mock.calls[0] as [string, { body: string }];
    expect(direccion).toBe('http://127.0.0.1:11434/api/chat');
    const cuerpo = JSON.parse(opciones.body) as {
      model: string;
      stream: boolean;
      options: { temperature: number };
    };
    expect(cuerpo.model).toBe('llama3.1:8b-instruct-q4_K_M');
    expect(cuerpo.stream).toBe(false);
    // Temperatura > 0 vuelve la corrida no reproducible. El default la deja en 0
    // y quien quiera variedad la pide, sabiendo lo que paga.
    expect(cuerpo.options.temperature).toBe(0);
  });

  it('la procedencia por corrida trae modelo, digest, parámetros y cuantización', async () => {
    const pedir = vi.fn().mockResolvedValue(respuesta(SHOW_OK));
    const completer = new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch });

    const ficha = await completer.ficha();
    expect(ficha.parametros).toBe('8.0B');
    expect(ficha.cuantizacion).toBe('Q4_K_M');
    expect(ficha.familia).toBe('llama');
    expect(ficha.digest.length).toBeGreaterThan(0);

    // Se cachea: un elenco de mil personas no pregunta mil veces lo mismo.
    await completer.ficha();
    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('lo que informa el propio Ollama de su reloj es lo que `calibrar` mide', async () => {
    const pedir = vi.fn().mockResolvedValue(respuesta(CHAT_OK));
    const completer = new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch });
    const medicion = await completer.medir([{ role: 'user', content: 'hola' }]);
    expect(medicion.entrada).toBe(890);
    expect(medicion.salida).toBe(575);
    expect(medicion.prefillMs).toBeCloseTo(2500, 0);
    expect(medicion.decodeMs).toBeCloseTo(27000, 0);
  });
});

describe('la configuración del ambiente', () => {
  it('cae a los defaults y saca la barra final', () => {
    expect(opcionesDelAmbiente({})).toEqual({
      url: 'http://127.0.0.1:11434',
      modelo: 'llama3.1:8b-instruct-q4_K_M',
    });
    expect(opcionesDelAmbiente({ OLLAMA_URL: 'http://127.0.0.1:9999/' }).url).toBe(
      'http://127.0.0.1:9999',
    );
  });

  it('el modelo de chat tiene su propia variable, distinta de la del embebedor', () => {
    // `OLLAMA_MODELO` es de embeddings (bge-m3). Compartir la variable haría que
    // bajar un modelo de chat rompiera La Radiografía en silencio.
    expect(opcionesDelAmbiente({ OLLAMA_MODELO: 'bge-m3' }).modelo).toBe(
      'llama3.1:8b-instruct-q4_K_M',
    );
    expect(opcionesDelAmbiente({ OLLAMA_MODELO_CHAT: 'qwen2.5:7b' }).modelo).toBe('qwen2.5:7b');
  });
});
