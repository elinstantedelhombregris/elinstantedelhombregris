import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  ALCANCES,
  GLOSARIO,
  PERMITIDOS,
  RAIZ_V2,
  RUTA_LINEA_DE_BASE,
  contar,
  escanearCodigo,
  escanearTodo,
  leerLineaDeBase,
  plegar,
  serializarLineaDeBase,
  textosDeUsuario,
  type Hallazgo,
  type LineaDeBase,
  type Permitido,
  type ResultadoDelAlcance,
} from '../glosario';

/**
 * **La guardia del glosario.**
 *
 * El dueño fijó una palabra para cada cosa que se le muestra a una persona: lo
 * que alguien publica es un **aporte**, lo que arma un equipo es una **campaña**,
 * y así. Varias unidades reescribieron el copy para que fuera así; sin esta
 * guarda, los sinónimos vuelven con la próxima funcionalidad.
 *
 * Tres piezas, y cada una existe porque la otra sola no alcanza:
 *
 *  1. el **escáner** (`scripts/content/glosario.ts`) lee el AST y se queda sólo
 *     con lo que ve una persona: no mira identificadores, imports, clases,
 *     enlaces ni comentarios;
 *  2. `PERMITIDOS` deja pasar lo que el glosario no quiso decir (un modismo, otro
 *     significado), siempre con su motivo escrito;
 *  3. la **línea de base** (`glosario-linea-de-base.json`) congela lo que todavía
 *     está mal y sólo baja: una palabra nueva en un archivo falla, y una que se
 *     fue sin actualizar el archivo también, para que el piso baje con vos.
 *
 * Para regenerar la línea de base: `pnpm glosario:linea-de-base`.
 */

const textos = (codigo: string, nombre = 'x.tsx'): string[] =>
  textosDeUsuario(codigo, nombre).map((t) => t.texto.replace(/\s+/gu, ' ').trim());

/* -------------------------------------------------------------------------- */
/*  El extractor                                                               */
/* -------------------------------------------------------------------------- */

describe('el extractor: lo que ve una persona', () => {
  it('encuentra el texto de JSX', () => {
    expect(textos('export const A = () => <p>Sumá tu mirada</p>;')).toEqual(['Sumá tu mirada']);
  });

  it('encuentra los atributos con texto: aria-label, title, placeholder, alt y label', () => {
    const codigo = `export const A = () => (
      <div aria-label="Cerrar el panel" title="Ayuda de la campaña">
        <input placeholder="Escribí acá" />
        <img alt="Mapa del país" />
        <Campo label="Tu nombre" />
      </div>
    );`;
    expect(textos(codigo)).toEqual([
      'Cerrar el panel',
      'Ayuda de la campaña',
      'Escribí acá',
      'Mapa del país',
      'Tu nombre',
    ]);
  });

  it('encuentra una constante de cadena y las partes de una plantilla', () => {
    const codigo = [
      "export const TITULO = 'Tu mirada cuenta';",
      'export const sin = `Sin sustituciones`;',
      'export const con = (n: number) => `${String(n)} voces en el mapa, ${String(n)} más`;',
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([
      'Tu mirada cuenta',
      'Sin sustituciones',
      'voces en el mapa,',
      'más',
    ]);
  });

  it('encuentra el texto de un atributo con expresión, en las dos ramas', () => {
    const codigo =
      "export const A = ({ ok }: { ok: boolean }) => <Boton label={ok ? 'Sí, listo' : 'Todavía no'} />;";
    expect(textos(codigo)).toEqual(['Sí, listo', 'Todavía no']);
  });

  it('ignora los imports y los exports con origen', () => {
    const codigo = [
      "import { voz } from './mirada-señal';",
      "export { relato } from './relato de campaña';",
      "export * from '../contrato';",
      "const m = () => import('./fase-lazy');",
      "const r = require('./ronda-vieja');",
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([]);
  });

  it('ignora className, href, to, key, id, style y data-*', () => {
    const codigo = `export const A = () => (
      <a
        className="voz señal mirada"
        href="/senal/abc"
        to="/voces"
        key="fase de la campaña"
        id="mi voz"
        data-testid="núcleo de voces"
        style={{ fontFamily: 'ronda' }}
      />
    );`;
    expect(textos(codigo)).toEqual([]);
  });

  it('ignora todo lo que está adentro de un className con expresión', () => {
    const codigo =
      "export const A = ({ ok }: { ok: boolean }) => <p className={cn('mirada grande', ok && 'voz clara')}>x</p>;";
    expect(textos(codigo)).toEqual([]);
  });

  it('ignora las claves de un objeto, entre comillas o no', () => {
    const codigo = [
      "const a = { 'voz clara': 1, [`señal larga`]: 2, mirada: 3 };",
      "interface T { 'fase de la campaña': string }",
      'const { relato: r } = a;',
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([]);
  });

  it('ignora las URL y las rutas', () => {
    const codigo = [
      "const a = '/mapa/aportar?fase=voz';",
      "const b = 'https://ejemplo.org/convocatoria';",
      "const c = 'mailto:hola@ejemplo.org';",
      "const d = 'aportes/voces/miradas';",
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([]);
  });

  it('ignora las cadenas sin letras', () => {
    expect(textos("const a = '—'; const b = '12 · 34'; const c = ' ';", 'x.ts')).toEqual([]);
  });

  it('ignora los comentarios, de línea, de bloque y de JSX', () => {
    const codigo = `// la voz de la campaña
    /** La mirada, la señal, el relato. */
    export const A = () => (
      <div>
        {/* una voz que no se ve */}
        <p>Hola</p>
      </div>
    );`;
    expect(textos(codigo)).toEqual(['Hola']);
  });

  it('ignora lo que se compara y no se muestra', () => {
    const codigo = [
      "if (tipo === 'voz') {}",
      "if ('señal' !== tipo) {}",
      "switch (tipo) { case 'mirada': break; }",
      "const ok = lista.includes('relato de campaña');",
      "const m = /voz/.test('la voz del país');",
      "const t = typeof x === 'string';",
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([]);
  });

  it('ignora los tipos de unión y las directivas', () => {
    const codigo = [
      "'use client';",
      "type Capa = 'voz' | 'pulso con voz';",
      "const f = (x: Record<'voz de todos', number>) => x;",
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual([]);
  });

  it('ignora los identificadores en una sola ficha, pero no las palabras con tilde ni con mayúscula', () => {
    const codigo = [
      "const a = ['voz', 'senales', 'mapa-voces', 'senal.aporte'];",
      "const b = ['señales', 'Voces'];",
    ].join('\n');
    expect(textos(codigo, 'x.ts')).toEqual(['señales', 'Voces']);
  });

  it('da la línea de cada texto, también en JSX partido en varias líneas', () => {
    const codigo = [
      'const A = () => (',
      '  <p>',
      '    Primera línea',
      '    y la voz',
      '  </p>',
      ');',
    ].join('\n');
    const [texto] = textosDeUsuario(codigo);
    expect(texto?.linea).toBe(2);
    const [hallazgo] = escanearCodigo('x.tsx', codigo, []).hallazgos;
    expect(hallazgo?.linea).toBe(4);
  });
});

/* -------------------------------------------------------------------------- */
/*  El glosario                                                                */
/* -------------------------------------------------------------------------- */

const hallazgosDe = (codigo: string, permitidos: readonly Permitido[] = []): Hallazgo[] =>
  escanearCodigo('x.tsx', codigo, permitidos).hallazgos;

const formasEn = (frase: string): string[] =>
  hallazgosDe(`export const A = () => <p>${frase}</p>;`).map((h) => h.forma);

describe('la tabla del glosario', () => {
  it('cada entrada dice qué usar en su lugar', () => {
    for (const entrada of GLOSARIO) {
      expect(entrada.preferida.length, entrada.concepto).toBeGreaterThan(0);
      expect(entrada.explicacion.length, entrada.concepto).toBeGreaterThan(10);
      expect(entrada.prohibidas.length, entrada.concepto).toBeGreaterThan(0);
    }
  });

  it('ninguna palabra prohibida es a la vez la preferida de otra entrada', () => {
    const preferidas = new Set(GLOSARIO.map((e) => plegar(e.preferida)));
    for (const forma of GLOSARIO.flatMap((e) => e.prohibidas.flatMap((p) => p.formas))) {
      expect(preferidas.has(plegar(forma)), forma).toBe(false);
    }
  });

  it('cada palabra está una sola vez, y su forma principal es la primera', () => {
    const terminos = GLOSARIO.flatMap((e) => e.prohibidas.map((p) => p.termino));
    expect(new Set(terminos).size).toBe(terminos.length);
    for (const p of GLOSARIO.flatMap((e) => e.prohibidas)) expect(p.formas[0]).toBe(p.termino);
  });

  it('cubre las palabras que el dueño retiró', () => {
    const retiradas = GLOSARIO.flatMap((e) => e.prohibidas.map((p) => p.termino));
    expect(retiradas).toEqual([
      'mirada',
      'voz',
      'señal',
      'posibilidad',
      'reflexión',
      'relato',
      'convocatoria',
      'ronda',
      'contrato',
      'fase',
      'ámbito',
      'alcance nacional',
      'borrador público',
      'núcleo',
    ]);
  });
});

describe('qué cuenta como un uso', () => {
  it('encuentra el singular y el plural', () => {
    expect(formasEn('Una mirada, dos miradas.')).toEqual(['mirada', 'miradas']);
    expect(formasEn('La voz y las voces.')).toEqual(['voz', 'voces']);
  });

  it('no distingue mayúsculas ni tildes', () => {
    expect(formasEn('SEÑALES, senales y Señal')).toEqual(['señales', 'señales', 'señal']);
    expect(formasEn('Reflexion y REFLEXIÓN')).toEqual(['reflexión', 'reflexión']);
  });

  it('respeta el límite de la palabra', () => {
    expect(formasEn('vozarrón, señalan, señalización, rondador, faseología, relatora')).toEqual([]);
    expect(formasEn('«voz», (señal) y mirada.')).toEqual(['voz', 'señal', 'mirada']);
  });

  it('encuentra las frases, aunque el JSX las parta en dos líneas', () => {
    const codigo = [
      'export const A = () => (',
      '  <p>',
      '    Alcance',
      '    nacional y borrador   público',
      '  </p>',
      ');',
    ].join('\n');
    expect(hallazgosDe(codigo).map((h) => [h.forma, h.linea])).toEqual([
      ['alcance nacional', 3],
      ['borrador público', 4],
    ]);
  });

  it('cada hallazgo trae el término de la línea de base y la explicación', () => {
    const [h] = hallazgosDe('export const A = () => <p>Las voces</p>;');
    expect(h?.termino).toBe('voz');
    expect(h?.forma).toBe('voces');
    expect(h?.explicacion).toContain('aporte');
  });

  it('cada palabra del glosario tiene un caso que la atrapa', () => {
    const ejemplos: Record<string, string> = {
      mirada: 'Sumá tu mirada',
      voz: 'Sumá tu voz',
      señal: 'Sumá tu señal',
      posibilidad: 'Una posibilidad',
      reflexión: 'Tu reflexión',
      relato: 'Tu relato',
      convocatoria: 'Una convocatoria',
      ronda: 'La ronda abre hoy',
      contrato: 'El contrato de la campaña',
      fase: 'La fase dos',
      ámbito: 'El ámbito',
      'alcance nacional': 'De alcance nacional',
      'borrador público': 'Un borrador público',
      núcleo: 'Un núcleo',
    };
    for (const p of GLOSARIO.flatMap((e) => e.prohibidas)) {
      const frase = ejemplos[p.termino];
      expect(frase, `falta un ejemplo para «${p.termino}»`).toBeDefined();
      expect(
        hallazgosDe(`export const A = () => <p>${frase ?? ''}</p>;`).map((h) => h.termino),
        p.termino,
      ).toEqual([p.termino]);
    }
  });
});

describe('la lista de permitidos', () => {
  const codigo = (frase: string): string => `export const A = () => <p>${frase}</p>;`;
  const modismo: Permitido = { archivo: '*', termino: 'en voz alta', motivo: 'modismo' };

  it('deja pasar la frase y sólo la frase', () => {
    expect(hallazgosDe(codigo('Pensá en voz alta'), [modismo])).toEqual([]);
    expect(
      hallazgosDe(codigo('Pensá en voz alta y sumá tu voz'), [modismo]).map((h) => h.forma),
    ).toEqual(['voz']);
  });

  it('no hace falta que coincidan las tildes ni las mayúsculas', () => {
    expect(hallazgosDe(codigo('EN VOZ ALTA'), [modismo])).toEqual([]);
  });

  it('vale para el archivo que nombra, para una carpeta si termina en barra, o para todos', () => {
    const delArchivo: Permitido = { archivo: 'a/b.tsx', termino: 'en voz alta', motivo: 'm' };
    const deLaCarpeta: Permitido = { archivo: 'a/', termino: 'en voz alta', motivo: 'm' };
    const frase = codigo('Pensá en voz alta');
    expect(escanearCodigo('a/b.tsx', frase, [delArchivo]).hallazgos).toEqual([]);
    expect(escanearCodigo('a/c.tsx', frase, [delArchivo]).hallazgos).toHaveLength(1);
    expect(escanearCodigo('a/c.tsx', frase, [deLaCarpeta]).hallazgos).toEqual([]);
    expect(escanearCodigo('ab/c.tsx', frase, [deLaCarpeta]).hallazgos).toHaveLength(1);
  });

  it('avisa cuál usó, para poder detectar las que sobran', () => {
    const { usados } = escanearCodigo('x.tsx', codigo('Pensá en voz alta'), [modismo]);
    expect([...usados]).toEqual([modismo]);
    expect(escanearCodigo('x.tsx', codigo('Hola'), [modismo]).usados.size).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  La línea de base                                                           */
/* -------------------------------------------------------------------------- */

describe('la línea de base', () => {
  it('cuenta por archivo y por palabra, con las claves ordenadas', () => {
    const h = (archivo: string, termino: string): Hallazgo => ({
      archivo,
      termino,
      linea: 1,
      forma: termino,
      explicacion: '',
    });
    const linea = contar([
      h('b.ts', 'voz'),
      h('a.ts', 'voz'),
      h('a.ts', 'mirada'),
      h('a.ts', 'voz'),
    ]);
    expect(JSON.stringify(linea)).toBe('{"a.ts":{"mirada":1,"voz":2},"b.ts":{"voz":1}}');
  });

  it('se serializa igual cada vez: dos espacios y un salto final', () => {
    expect(serializarLineaDeBase({ 'a.ts': { voz: 2 } })).toBe(
      '{\n  "a.ts": {\n    "voz": 2\n  }\n}\n',
    );
  });
});

/* -------------------------------------------------------------------------- */
/*  El código de verdad                                                        */
/* -------------------------------------------------------------------------- */

const TIEMPO = 60_000;

describe('el código de v2', () => {
  let alcances: ResultadoDelAlcance[] = [];
  let hallazgos: Hallazgo[] = [];
  let base: LineaDeBase = {};

  beforeAll(() => {
    alcances = escanearTodo();
    hallazgos = alcances.flatMap((a) => a.hallazgos);
    base = leerLineaDeBase();
  }, TIEMPO);

  // Una guarda que no lee nada pasa en verde. Un mínimo por alcance, y un archivo
  // conocido en cada uno, para que mover una carpeta no la deje decorativa.
  it('escanea los cuatro alcances y no está vacía', () => {
    const minimos: Record<string, { archivos: number; conocido: string }> = {
      web: { archivos: 350, conocido: 'apps/web/src/lib/vocabulario.ts' },
      mobile: { archivos: 100, conocido: 'apps/mobile/src/civic/verification-provenance.ts' },
      shared: { archivos: 25, conocido: 'packages/shared/src/open-data/consentimiento.ts' },
      'civic-core': { archivos: 40, conocido: 'packages/civic-core/src/direcciones.ts' },
    };
    expect(alcances.map((a) => a.nombre)).toEqual(ALCANCES.map((a) => a.nombre));
    expect(Object.keys(minimos)).toEqual(ALCANCES.map((a) => a.nombre));
    for (const alcance of alcances) {
      const minimo = minimos[alcance.nombre];
      expect(alcance.archivos, `archivos escaneados en ${alcance.nombre}`).toBeGreaterThanOrEqual(
        minimo?.archivos ?? Infinity,
      );
      expect(existsSync(join(RAIZ_V2, minimo?.conocido ?? 'no-existe')), minimo?.conocido).toBe(
        true,
      );
    }
  });

  it('no escanea pruebas ni código generado', () => {
    const rutas = new Set(hallazgos.map((h) => h.archivo));
    for (const ruta of rutas) {
      expect(ruta).not.toMatch(/__tests__|\.test\.|\.generated\.|node_modules|\/dist\//u);
    }
  });

  it('la línea de base nombra archivos que existen', () => {
    for (const archivo of Object.keys(base)) {
      expect(
        existsSync(join(RAIZ_V2, archivo)) && statSync(join(RAIZ_V2, archivo)).isFile(),
        archivo,
      ).toBe(true);
    }
  });

  it('la línea de base sólo nombra palabras del glosario, con recuentos enteros y positivos', () => {
    const conocidas = new Set(GLOSARIO.flatMap((e) => e.prohibidas.map((p) => p.termino)));
    for (const [archivo, porTermino] of Object.entries(base)) {
      for (const [termino, cuenta] of Object.entries(porTermino)) {
        expect(conocidas.has(termino), `${archivo}: «${termino}»`).toBe(true);
        expect(Number.isInteger(cuenta) && cuenta > 0, `${archivo}: «${termino}»`).toBe(true);
      }
    }
  });

  it('la línea de base está ordenada y con el formato de siempre', () => {
    expect(readFileSync(RUTA_LINEA_DE_BASE, 'utf8')).toBe(serializarLineaDeBase(base));
  });

  // Si esto falla: o es un uso legítimo (agregalo a PERMITIDOS con su motivo en
  // `scripts/content/glosario.ts`) o es una palabra que el glosario retiró, y se
  // cambia por la que corresponde. La línea de base NO se sube a mano.
  it('no aparece ninguna palabra retirada que la línea de base no tenga', () => {
    const actual = contar(hallazgos);
    const culpables: string[] = [];
    for (const [archivo, porTermino] of Object.entries(actual)) {
      for (const [termino, cuenta] of Object.entries(porTermino)) {
        const permitido = base[archivo]?.[termino] ?? 0;
        if (cuenta <= permitido) continue;
        // Con el piso ya en el archivo no se sabe cuál de los usos es el nuevo:
        // se avisa cuánto subió y se muestran todos.
        if (permitido > 0) {
          culpables.push(
            `${archivo}: «${termino}» pasó de ${String(permitido)} a ${String(cuenta)}; la línea de base sólo baja. Los usos:`,
          );
        }
        culpables.push(
          ...hallazgos
            .filter((h) => h.archivo === archivo && h.termino === termino)
            .map(
              (h) =>
                `${h.archivo}:${String(h.linea)} usa «${h.forma}»: ${h.explicacion}. Si es un uso legítimo, agregalo a PERMITIDOS con el motivo.`,
            ),
        );
      }
    }
    expect(culpables).toEqual([]);
  });

  // El otro lado del trinquete: lo que se arregló tiene que bajar el piso, si no
  // la próxima palabra nueva entra por el hueco que dejó la anterior.
  it('la línea de base no tiene holgura: lo que bajó, bajó también en el archivo', () => {
    const actual = contar(hallazgos);
    const holguras: string[] = [];
    for (const [archivo, porTermino] of Object.entries(base)) {
      for (const [termino, permitido] of Object.entries(porTermino)) {
        const cuenta = actual[archivo]?.[termino] ?? 0;
        if (cuenta < permitido) {
          holguras.push(
            `${archivo}: «${termino}» bajó de ${String(permitido)} a ${String(cuenta)}. Regenerá la línea de base con \`pnpm glosario:linea-de-base\` para que el piso baje con vos.`,
          );
        }
      }
    }
    expect(holguras).toEqual([]);
  });

  it('cada excepción de PERMITIDOS tiene motivo, nombra algo que existe y todavía tapa algo', () => {
    const usados = new Set(alcances.flatMap((a) => [...a.usados]));
    const sobran: string[] = [];
    for (const permitido of PERMITIDOS) {
      const rotulo = `${permitido.archivo} · «${permitido.termino}»`;
      expect(permitido.motivo.trim().length, `${rotulo}: falta el motivo`).toBeGreaterThanOrEqual(
        20,
      );
      const formas = GLOSARIO.flatMap((e) => e.prohibidas.flatMap((p) => p.formas.map(plegar)));
      const plegada = plegar(permitido.termino);
      expect(
        formas.some((forma) =>
          new RegExp(`(?<![\\p{L}\\p{N}_])${forma}(?![\\p{L}\\p{N}_])`, 'u').test(plegada),
        ),
        `${rotulo}: la frase no contiene ninguna palabra del glosario`,
      ).toBe(true);
      if (permitido.archivo !== '*') {
        expect(existsSync(join(RAIZ_V2, permitido.archivo)), `${rotulo}: no existe`).toBe(true);
      }
      if (!usados.has(permitido)) sobran.push(`${rotulo}: ya no tapa nada; sacala de PERMITIDOS.`);
    }
    expect(sobran).toEqual([]);
  });
});
