import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { COEFICIENTES } from '../../../packages/civic-core/src/simulacion/coeficientes.js';
import { huellaDeCosecha } from '../../../packages/civic-core/src/simulacion/espina/cosecha.js';
import { armarPais, MOTOR } from '../../../packages/civic-core/src/simulacion/espina/escenario.js';
import { correrFuncion } from '../../../packages/civic-core/src/simulacion/modo-gente.js';
import { armarElenco, territoriosDeProvincias } from '../armar-elenco.js';
import { CompleterOllama } from '../completer-ollama.js';
import { leerCorpus } from '../corpus-semilla.js';
import { escribirElencoADisco, leerElencoDeDisco } from '../elenco-disco.js';
import { EscritorOllama, leerJson, prompt } from '../elenco-ollama.js';
import { EscritorFabricado } from '../escritor-falso.js';

import type { Elenco } from '../../../packages/civic-core/src/simulacion/elenco.js';
import type { Ancla, EscritorDeElenco } from '../armar-elenco.js';

/**
 * El elenco: se genera una vez, se congela, y se reusa.
 *
 * El error que estas guardas hacen imposible es el del §1.2 de la spec: si la
 * población se regenerara en cada corrida del barrido, se estaría midiendo la
 * varianza del modelo y no la palanca. **No da error y devuelve números
 * plausibles**, que es lo que lo vuelve caro.
 */

const TERRITORIOS = territoriosDeProvincias();

/** Un corpus de juguete, escrito en un directorio temporal. */
function corpusDeJuguete(): { dir: string; borrar: () => void } {
  const raiz = mkdtempSync(join(tmpdir(), 'elenco-'));
  // El nombre de la carpeta importa: `leerCorpus` lo usa como prefijo del
  // documento, y de ahí sale el sesgo de familia de la conducta.
  const planes = join(raiz, 'planes');
  mkdirSync(planes, { recursive: true });

  const relleno = (n: number): string =>
    Array.from({ length: n }, (_, i) => `Oración número ${String(i)} sobre el agua del barrio.`).join(' ');

  writeFileSync(
    join(planes, 'PLANAGUA.mdx'),
    ['---', 'title: Agua', '---', '# PLANAGUA', relleno(20), '## El problema', relleno(30), '## La salida', relleno(30)].join('\n'),
  );
  writeFileSync(
    join(planes, 'PLANLUZ.mdx'),
    ['# PLANLUZ', relleno(25), '## El corte', relleno(30)].join('\n'),
  );
  return { dir: planes, borrar: () => { rmSync(raiz, { recursive: true, force: true }); } };
}

function anclasDeJuguete(): readonly Ancla[] {
  const { dir, borrar } = corpusDeJuguete();
  const corpus = leerCorpus([dir]);
  borrar();
  return corpus.anclas;
}

async function elencoFabricado(cuantas = 40, semilla = 7): Promise<Elenco> {
  return armarElenco(
    anclasDeJuguete(),
    { cuantas, semilla, grado: 6, frasesPorPersona: 3 },
    new EscritorFabricado(semilla),
  );
}

describe('el corpus semilla', () => {
  it('parte por encabezados, guarda el sha del archivo y descarta lo que no dice nada', () => {
    const { dir, borrar } = corpusDeJuguete();
    const corpus = leerCorpus([dir]);
    borrar();

    expect(corpus.anclas.length).toBeGreaterThan(0);
    expect(corpus.documentos.map((d) => d.documento).sort()).toEqual([
      'planes/PLANAGUA.mdx',
      'planes/PLANLUZ.mdx',
    ]);
    for (const ancla of corpus.anclas) {
      expect(ancla.sha).toHaveLength(12);
      expect(ancla.texto).not.toContain('---');
      expect(ancla.texto).not.toContain('#');
    }
  });

  it('un directorio que no existe se dice con su motivo, no se saltea', () => {
    expect(() => leerCorpus(['/no/existe/este/corpus'])).toThrow(/texto propio del proyecto/i);
  });
});

describe('el armado congela y la huella dice la verdad', () => {
  it('la misma semilla da la misma huella', async () => {
    const a = await elencoFabricado();
    const b = await elencoFabricado();
    expect(a.poblacion.huella).toBe(b.poblacion.huella);
  });

  it('otra semilla da otra huella', async () => {
    const a = await elencoFabricado(40, 7);
    const b = await elencoFabricado(40, 8);
    expect(a.poblacion.huella).not.toBe(b.poblacion.huella);
  });

  it('está congelado: mutarlo tira en vez de corromper el barrido en silencio', async () => {
    const elenco = await elencoFabricado();
    expect(Object.isFrozen(elenco.poblacion.personas)).toBe(true);
    expect(() => {
      (elenco.poblacion.personas[0] as { id: number }).id = 99;
    }).toThrow();
  });

  it('un elenco fabricado NO lleva sello: no es una hipótesis de modelo', async () => {
    const elenco = await elencoFabricado();
    expect(elenco.sello).toBeNull();
  });

  it('el sesgo se mide contra el país y viaja con el elenco', async () => {
    const elenco = await elencoFabricado(200);
    expect(elenco.sesgo.porTerritorio).toHaveLength(TERRITORIOS.length);
    const suma = elenco.sesgo.porTerritorio.reduce((s, t) => s + t.fraccionElenco, 0);
    expect(suma).toBeCloseTo(1, 6);
    expect(elenco.sesgo.advertencia).toMatch(/una sola voz/i);
    expect(elenco.sesgo.corpus.length).toBeGreaterThan(0);
  });

  it('cada persona dice de qué documento salió, con su sha', async () => {
    const elenco = await elencoFabricado();
    for (const persona of elenco.poblacion.personas) {
      expect(persona.origen.documento).toMatch(/^planes\//);
      expect(persona.origen.sha).toHaveLength(12);
      expect(persona.origen.ancla.length).toBeGreaterThan(0);
    }
  });

  it('un escritor que no corre acá aborta antes de escribir una línea', async () => {
    const remoto: EscritorDeElenco = {
      nombre: 'un-proveedor',
      local: false,
      sello: () => Promise.resolve(null),
      escribir: () => Promise.reject(new Error('no debería llegar acá')),
    };
    await expect(
      armarElenco(anclasDeJuguete(), { cuantas: 4, semilla: 1, grado: 2 }, remoto),
    ).rejects.toThrow(/ADR 0009|no corre en esta máquina/i);
  });
});

describe('el modelo escribe pocos campos, y están enumerados', () => {
  it('el tipo y la clase de cada frase los pone la regla, no el escritor', async () => {
    // El escritor devuelve textos y nada más: no tiene un campo donde poner un
    // tipo. Es la regla 6 hecha forma de dato, no una promesa del prompt.
    const elenco = await elencoFabricado(12);
    for (const persona of elenco.poblacion.personas) {
      for (const frase of persona.semblanza.frases) {
        expect(frase.tipo.length).toBeGreaterThan(0);
        // La clase se deriva con `claseDe`, la misma función de la ingesta real.
        if (frase.tipo === 'compromiso') expect(frase.clase).toBe('acto');
        if (frase.tipo === 'pregunta') expect(frase.clase).toBe('meta');
        if (frase.tipo === 'basta') expect(frase.clase).toBe('hecho');
      }
    }
  });

  it('el prompt no le ofrece al modelo la lista de tipos para elegir', () => {
    const [ancla] = anclasDeJuguete();
    expect(ancla).toBeDefined();
    if (ancla === undefined) return;
    const texto = prompt({
      indice: 0,
      ancla,
      territorioId: 'Chaco',
      tiposPedidos: ['basta', 'compromiso'],
    });
    expect(texto).not.toContain('"tipo"');
    expect(texto).not.toContain('"clase"');
    expect(texto).toContain('"frases"');
  });

  it('el texto del escritor fabricado se ve fabricado', async () => {
    const elenco = await elencoFabricado(5);
    for (const persona of elenco.poblacion.personas) {
      expect(persona.semblanza.texto).toMatch(/fabricada por una regla/i);
    }
  });
});

describe('el elenco va y vuelve del disco sin cambiar de identidad', () => {
  it('se escribe, se lee, y la huella se verifica al leer', async () => {
    const elenco = await elencoFabricado(120);
    const raiz = mkdtempSync(join(tmpdir(), 'elencos-'));
    try {
      const destino = escribirElencoADisco(elenco, raiz, {
        escritor: 'fabricado',
        semilla: 7,
        grado: 6,
      });
      expect(destino.endsWith(elenco.poblacion.huella)).toBe(true);

      const leido = leerElencoDeDisco(destino, TERRITORIOS);
      expect(leido.poblacion.huella).toBe(elenco.poblacion.huella);
      expect(leido.poblacion.personas).toHaveLength(elenco.poblacion.personas.length);
      expect(leido.territorioDe).toEqual(elenco.territorioDe);
    } finally {
      rmSync(raiz, { recursive: true, force: true });
    }
  });

  it('un manifiesto que miente sobre su huella no se carga', async () => {
    const elenco = await elencoFabricado(20);
    const raiz = mkdtempSync(join(tmpdir(), 'elencos-'));
    try {
      const destino = escribirElencoADisco(elenco, raiz, {
        escritor: 'fabricado',
        semilla: 7,
        grado: 6,
      });
      const manifiesto = JSON.parse(readFileSync(join(destino, 'manifiesto.json'), 'utf8')) as {
        huella: string;
      };
      manifiesto.huella = 'deadbeef';
      writeFileSync(join(destino, 'manifiesto.json'), JSON.stringify(manifiesto));
      expect(() => leerElencoDeDisco(destino, TERRITORIOS)).toThrow(/huella/i);
    } finally {
      rmSync(raiz, { recursive: true, force: true });
    }
  });
});

describe('un elenco congelado corre la dinámica, sin modelo de por medio', () => {
  it('la función corre y da la misma cosecha dos veces', async () => {
    const elenco = await elencoFabricado(300);
    const pais = armarPais({ voces: [], ahora: 1_800_000_000_000 }, TERRITORIOS, 'provincia');
    const esc = {
      id: 'demo',
      nombre: 'Demo',
      pregunta: '¿Qué pasa si habla este elenco?',
      paisHuella: pais.huella,
      eje: { eje: 'ninguno' } as const,
      forma: {
        participacion: 0,
        dispersion: 0,
        constancia: 0,
        composicion: { hecho: 0.25, deseo: 0.25, acto: 0.25, meta: 0.25 },
      },
      ajustes: { horizonte: 1, resistencia: 0.2, cumplimiento: 0.5 },
      coeficientes: COEFICIENTES,
      semilla: 11,
      mecanismo: {
        poblacionHuella: elenco.poblacion.huella,
        chispa: 0.2,
        contagio: 0.5,
        desaliento: 0.4,
        grado: 6,
      },
      motor: MOTOR,
    };

    const uno = correrFuncion(esc, pais, elenco);
    const otro = correrFuncion(esc, pais, elenco);
    expect(huellaDeCosecha(uno.cosecha)).toBe(huellaDeCosecha(otro.cosecha));
    expect(uno.cosecha.autoridad).toBe('declarada');
    expect(uno.poblacionHuella).toBe(elenco.poblacion.huella);
  });
});

describe('el escritor de Ollama', () => {
  const respuesta = (contenido: string): Response =>
    new Response(JSON.stringify({ message: { content: contenido } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  it('lee el JSON del modelo cuando viene envuelto en charla', () => {
    const bruto = 'Claro, acá va:\n```json\n{"texto":"a","oficio":"b","tramoEdad":"35-44","arraigoAnios":9,"frases":["x","y"]}\n```';
    const leido = leerJson(bruto, 2);
    expect(leido?.oficio).toBe('b');
    expect(leido?.frases).toHaveLength(2);
  });

  it('rechaza un JSON con la cantidad de frases equivocada', () => {
    // Aparear frases por posición con un largo distinto pegaría cada frase al
    // tipo de otra, y nada se rompería a la vista.
    const bruto = '{"texto":"a","oficio":"b","tramoEdad":"35-44","arraigoAnios":9,"frases":["x"]}';
    expect(leerJson(bruto, 2)).toBeNull();
  });

  it('reintenta y después tira con el texto crudo: no hay reparador de JSON', async () => {
    // `mockImplementation` y no `mockResolvedValue`: el cuerpo de un `Response`
    // se lee una sola vez, y el segundo intento leería un cuerpo ya consumido.
    const pedir = vi.fn().mockImplementation(() => Promise.resolve(respuesta('no pienso contestar en JSON')));
    const escritor = new EscritorOllama({
      completer: new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch }),
      reintentos: 1,
    });
    const [ancla] = anclasDeJuguete();
    expect(ancla).toBeDefined();
    if (ancla === undefined) return;

    await expect(
      escritor.escribir([{ indice: 0, ancla, territorioId: 'Chaco', tiposPedidos: ['basta'] }]),
    ).rejects.toThrow(/no devolvió un JSON usable/);
    expect(pedir).toHaveBeenCalledTimes(2);
  });

  it('el sello lleva modelo, digest y temperatura 0', async () => {
    const show = new Response(
      JSON.stringify({
        digest: 'sha256:cafe',
        details: { family: 'llama', parameter_size: '8.0B', quantization_level: 'Q4_K_M' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
    const pedir = vi.fn().mockResolvedValue(show);
    const escritor = new EscritorOllama({
      completer: new CompleterOllama({ fetch: pedir as unknown as typeof globalThis.fetch }),
    });
    const sello = await escritor.sello();
    expect(sello?.modelo).toContain('8.0B');
    expect(sello?.digest.length).toBeGreaterThan(0);
    expect(sello?.temperatura).toBe(0);
  });
});
