import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { detectarTuteo } from '../../content/voseo.js';
import {
  CONSENTIMIENTO_ANTES_DE_ENVIAR,
  DECLARACION_DELIBERACION,
  declaracionDeliberacionDe,
  LICENCIAS,
  MOTIVO_TEXTO_OMITIDO,
  TEXTO_CESION_LICENCIA,
  TEXTO_CONSENTIMIENTO_ACTOR,
  TEXTO_PUBLICACION_IRREVOCABLE,
  textoPublicable,
} from '../consentimiento.js';

/** `v2/`, subiendo desde `packages/shared/src/open-data/__tests__/`. */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');

describe('los textos del consentimiento', () => {
  const todos = [
    ['TEXTO_CONSENTIMIENTO_ACTOR', TEXTO_CONSENTIMIENTO_ACTOR],
    ['TEXTO_CESION_LICENCIA', TEXTO_CESION_LICENCIA],
    ['TEXTO_PUBLICACION_IRREVOCABLE', TEXTO_PUBLICACION_IRREVOCABLE],
    ['DECLARACION_DELIBERACION.sueño', DECLARACION_DELIBERACION.sueño],
    ['DECLARACION_DELIBERACION.propuesta', DECLARACION_DELIBERACION.propuesta],
  ] as const;

  // Regla 9 de la Constitución de producto: comprensible y revocable. Un texto
  // que nadie entiende no es consentimiento, y la longitud es el único proxy
  // barato que tenemos de eso. El piso existe para que nadie lo vacíe a «Acepto».
  it.each(todos)('%s cabe en una pantalla y dice algo', (_nombre, texto) => {
    expect(texto.length).toBeGreaterThan(80);
    expect(texto.length).toBeLessThan(260);
    expect(texto.trim()).toBe(texto);
    expect(texto.endsWith('.')).toBe(true);
  });

  it.each(todos)('%s está en voseo, no en tuteo', (_nombre, texto) => {
    expect(detectarTuteo(texto)).toEqual([]);
  });

  // No es cosmética: `'sueño'` con la ñ precompuesta y con la tilde combinante
  // son dos strings distintos, y esta constante se compara contra tipos que
  // llegan de un cliente iOS. Misma disciplina que `leerTipo` en civic-core.
  it.each(todos)('%s está normalizado en NFC', (_nombre, texto) => {
    expect(texto.normalize('NFC')).toBe(texto);
  });

  it('el consentimiento previo al envío son los tres, de lo reversible a lo irreversible', () => {
    expect(CONSENTIMIENTO_ANTES_DE_ENVIAR).toEqual([
      TEXTO_CONSENTIMIENTO_ACTOR,
      TEXTO_CESION_LICENCIA,
      TEXTO_PUBLICACION_IRREVOCABLE,
    ]);
  });

  // El texto de la cesión es lo único que autoriza a publicar obra ajena: tiene
  // que nombrar la licencia que dice otorgar, y tiene que decir qué pasa si no.
  it('la cesión nombra CC BY 4.0 y dice qué pasa cuando no la das', () => {
    expect(TEXTO_CESION_LICENCIA).toContain('CC BY 4.0');
    expect(TEXTO_CESION_LICENCIA).toContain('Si no querés');
  });

  it('la irrevocabilidad dice a la vez que se puede retirar y qué no se retira', () => {
    expect(TEXTO_PUBLICACION_IRREVOCABLE).toContain('retirarlo cuando quieras');
    expect(TEXTO_PUBLICACION_IRREVOCABLE).toContain('archivos mensuales que ya se publicaron');
  });

  // «Lo estamos construyendo» va al final y no al principio: lo primero que se
  // lee es la limitación, no el consuelo.
  it.each(['sueño', 'propuesta'] as const)(
    'la declaración de %s abre con la limitación y cierra con la promesa',
    (tipo) => {
      const frase = DECLARACION_DELIBERACION[tipo];
      expect(frase.startsWith('Todavía no se puede deliberar.')).toBe(true);
      expect(frase.endsWith('Lo estamos construyendo.')).toBe(true);
      // Lo único que evita que «yo también» se lea como voto.
      expect(frase).toContain('adhesiones');
    },
  );
});

describe('declaracionDeliberacionDe', () => {
  it('devuelve la frase de cada tipo de la clase deseo', () => {
    expect(declaracionDeliberacionDe('sueño')).toBe(DECLARACION_DELIBERACION.sueño);
    expect(declaracionDeliberacionDe('propuesta')).toBe(DECLARACION_DELIBERACION.propuesta);
  });

  it('devuelve null para lo que no es un deseo, en vez de una frase por descarte', () => {
    for (const tipo of [
      'basta',
      'necesidad',
      'recurso',
      'práctica',
      'saber',
      'compromiso',
      'pregunta',
    ]) {
      expect(declaracionDeliberacionDe(tipo)).toBeNull();
    }
    expect(declaracionDeliberacionDe('lo-que-sea')).toBeNull();
  });

  it('reconoce `sueño` escrito con la tilde combinante', () => {
    const descompuesto = 'sueño'.normalize('NFD');
    expect(descompuesto).not.toBe('sueño');
    expect(declaracionDeliberacionDe(descompuesto)).toBe(DECLARACION_DELIBERACION.sueño);
  });
});

describe('las dos licencias', () => {
  it('la compilación se otorga con atribución, porque la atribución es la trazabilidad', () => {
    expect(LICENCIAS.compilacion.id).toBe('CC-BY-4.0');
    expect(LICENCIAS.compilacion.url).toContain('creativecommons.org');
    expect(LICENCIAS.compilacion.atribucion).toContain('¡BASTA!');
  });

  // El proyecto es custodio, no titular. Si esta línea dijera que la otorga el
  // proyecto, el archivo entero estaría estampando una licencia inventada.
  it('la de los textos la otorga quien escribió, no el proyecto', () => {
    expect(LICENCIAS.textos.otorgadaPor).toBe('quien escribió cada señal');
    expect(LICENCIAS.textos.nota).toContain('textoOmitido');
  });

  it('ninguna licencia es CC0: CC0 renuncia a la atribución', () => {
    expect(JSON.stringify(LICENCIAS)).not.toContain('CC0');
  });
});

describe('textoPublicable', () => {
  it('sin cesión, la fila sale igual pero sin texto y con el motivo declarado', () => {
    expect(textoPublicable({ texto: 'no hay agua hace tres días', cesionLicencia: false })).toEqual(
      {
        texto: null,
        textoOmitido: MOTIVO_TEXTO_OMITIDO,
      },
    );
    expect(MOTIVO_TEXTO_OMITIDO).toBe('sin cesión de licencia');
  });

  it('con cesión, sale el texto y no hay motivo', () => {
    expect(textoPublicable({ texto: 'no hay agua hace tres días', cesionLicencia: true })).toEqual({
      texto: 'no hay agua hace tres días',
      textoOmitido: null,
    });
  });

  // Una señal que era sólo un punto en el mapa: no hay texto y tampoco hay nada
  // omitido. Declarar «sin cesión de licencia» ahí sería un motivo falso.
  it('con cesión y sin texto, los dos campos van en null', () => {
    expect(textoPublicable({ texto: null, cesionLicencia: true })).toEqual({
      texto: null,
      textoOmitido: null,
    });
  });

  it('nunca devuelve los dos campos llenos a la vez', () => {
    for (const texto of ['algo', null]) {
      for (const cesionLicencia of [true, false]) {
        const { texto: publicado, textoOmitido } = textoPublicable({ texto, cesionLicencia });
        expect(publicado === null || textoOmitido === null).toBe(true);
      }
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  La guarda de la fuente única                                               */
/* -------------------------------------------------------------------------- */

/**
 * Un fragmento distintivo de cada texto, y de qué constante sale.
 *
 * Se busca un fragmento y no el texto entero porque una copia a mano casi nunca
 * es carácter por carácter: se le corre una coma o se parte en otro punto. Cada
 * fragmento se verifica contra su constante en el primer test de este bloque,
 * así que una reescritura del texto rompe la suite en vez de degradar la guarda
 * en silencio.
 */
const FRAGMENTOS: readonly { readonly constante: string; readonly fragmento: string }[] = [
  {
    constante: 'TEXTO_CONSENTIMIENTO_ACTOR',
    fragmento: 'guardamos un identificador al azar en este navegador',
  },
  { constante: 'TEXTO_CESION_LICENCIA', fragmento: 'se publica bajo CC BY 4.0' },
  {
    constante: 'TEXTO_PUBLICACION_IRREVOCABLE',
    fragmento: 'un registro público que se descarga entero en un archivo',
  },
  { constante: 'DECLARACION_DELIBERACION', fragmento: 'Todavía no se puede deliberar' },
];

const TEXTO_DE: Readonly<Record<string, string>> = {
  TEXTO_CONSENTIMIENTO_ACTOR,
  TEXTO_CESION_LICENCIA,
  TEXTO_PUBLICACION_IRREVOCABLE,
  DECLARACION_DELIBERACION: DECLARACION_DELIBERACION.sueño,
};

/**
 * Aplana el código antes de buscar.
 *
 * Colapsa los espacios —una copia con distinto ancho de línea no se escapa— y
 * cose las concatenaciones de literales, que es como se parte un texto largo en
 * TypeScript: `'Todavía no se ' + 'puede deliberar'` queda como el original.
 */
const aplanar = (fuente: string): string =>
  fuente
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/['"`] ?\+ ?['"`]/g, '');

const DIRECTORIOS_VIGILADOS = ['apps/web/src', 'apps/mobile/src', 'apps/api/src', 'scripts'];
const EXTENSIONES = ['.ts', '.tsx', '.js', '.jsx'];

function archivosDe(relativo: string): string[] {
  const base = path.join(RAIZ, relativo);
  let entradas: string[];
  try {
    entradas = readdirSync(base, { recursive: true, encoding: 'utf8' });
  } catch {
    return []; // El directorio todavía no existe: no es un fallo de esta guarda.
  }
  return entradas
    .filter((entrada) => EXTENSIONES.includes(path.extname(entrada)))
    .map((entrada) => path.join(base, entrada))
    .filter((absoluto) => statSync(absoluto).isFile());
}

describe('la fuente única: nadie vuelve a escribir estos textos a mano', () => {
  it('cada fragmento vigilado sigue siendo parte de su constante', () => {
    for (const { constante, fragmento } of FRAGMENTOS) {
      const texto = TEXTO_DE[constante];
      expect(texto, `no hay constante ${constante}`).toBeDefined();
      expect(texto ?? '', `el fragmento vigilado de ${constante} ya no está en el texto`).toContain(
        fragmento,
      );
    }
  });

  // Si esto falla, la solución NO es cambiarle una coma al texto copiado: es
  // importar la constante de `@v2/shared`. Dos redacciones del mismo permiso
  // que pueden divergir van a divergir, y ésta sostiene una promesa legal.
  it.each(DIRECTORIOS_VIGILADOS)('%s importa los textos y no los copia', (directorio) => {
    const culpables: string[] = [];
    for (const archivo of archivosDe(directorio)) {
      const codigo = aplanar(readFileSync(archivo, 'utf8'));
      for (const { constante, fragmento } of FRAGMENTOS) {
        if (codigo.includes(aplanar(fragmento))) {
          culpables.push(
            `${path.relative(RAIZ, archivo)} copia ${constante} — importalo de @v2/shared`,
          );
        }
      }
    }
    expect(culpables).toEqual([]);
  });

  it('vigila directorios que existen, para que la guarda no sea decorativa', () => {
    const existentes = DIRECTORIOS_VIGILADOS.filter((d) => archivosDe(d).length > 0);
    expect(existentes.length).toBeGreaterThanOrEqual(3);
  });
});

/* -------------------------------------------------------------------------- */
/*  La exhaustividad sobre la clase `deseo`                                    */
/* -------------------------------------------------------------------------- */

/**
 * El vocabulario canónico vive en `@v2/civic-core` y este paquete no lo declara
 * entre sus dependencias, así que la exhaustividad no la puede dar el
 * compilador (ver el comentario de `ClaveDeseo` en `consentimiento.ts`). Se lee
 * del disco: menos elegante, mismo efecto — el día que la clase `deseo` gane un
 * tercer tipo, esto se pone rojo antes de que ese tipo salga sin frase.
 */
const VOCABULARIO = path.join(RAIZ, 'packages/civic-core/src/senal/vocabulario.ts');

function tiposDeClaseDeseo(): string[] {
  const fuente = readFileSync(VOCABULARIO, 'utf8');
  const tabla = /CLASE_DE_TIPO[^=]*=\s*\{([\s\S]*?)\n\};/.exec(fuente);
  if (tabla === null) {
    throw new Error(`no se pudo leer CLASE_DE_TIPO en ${VOCABULARIO}`);
  }
  const filas = [...(tabla[1] ?? '').matchAll(/^\s*([^\s:]+):\s*'([a-zá-ú]+)',/gm)];
  return filas
    .filter(([, , clase]) => clase === 'deseo')
    .map(([, tipo]) => (tipo ?? '').normalize('NFC'));
}

describe('la clase `deseo` no puede ganar un tipo sin frase', () => {
  it('el vocabulario sigue estando donde se lo lee', () => {
    const tipos = tiposDeClaseDeseo();
    // Si esto da cero, el regex dejó de matchear y la guarda quedaría verde por
    // vacío — que es exactamente la forma en que estas guardas se mueren.
    expect(tipos.length).toBeGreaterThan(0);
  });

  it('hay una declaración por cada tipo de la clase deseo, y ninguna de más', () => {
    const claves = Object.keys(DECLARACION_DELIBERACION).map((c) => c.normalize('NFC'));
    expect([...claves].sort()).toEqual([...tiposDeClaseDeseo()].sort());
  });
});
