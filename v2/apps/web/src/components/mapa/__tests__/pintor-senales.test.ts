import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLASES_SENAL, sembrarCelda, TECHO_DE_PUNTOS_POR_CELDA, TIPOS_SENAL } from '@v2/civic-core';
import { describe, expect, it, vi } from 'vitest';

import {
  colorDeClase,
  colorDeSenal,
  contraste,
  CONTRASTE_MINIMO,
  enFoco,
  FONDO_DEL_TEMA,
  GRIS_DEL_TEMA,
  haciaElFondo,
  marcasDeCeldas,
  pintarSenales,
  saturacionDeCeldas,
  TEMAS_DEL_MAPA,
  tintaDeMarca,
} from '../pintor-senales';

import type {
  CeldaDeSenales,
  MarcaDeSenal,
  PincelDeMapa,
  ProyectarAPixel,
  TemaDelMapa,
} from '../pintor-senales';
import type { ClaseSenal } from '@v2/civic-core';

/**
 * Las reglas visuales del pintor de señales.
 *
 * Un canvas no se puede leer —`getContext('2d')` ni siquiera existe en el
 * entorno de test—, así que el pintor recibe su pincel por parámetro: se le
 * pasa uno falso que anota lo que le pidieron, y lo que se verifica es
 * exactamente lo que el lector va a ver.
 *
 * Las afirmaciones son las tres reglas del módulo, no geometría por deporte:
 * el color codifica la clase, los filtros destiñen sin ocultar, y la
 * profundidad se resuelve hacia el fondo del tema activo.
 */

interface Relleno {
  color: string;
  x: number;
  y: number;
  radio: number;
}

function pincelFalso(): { ctx: PincelDeMapa; rellenos: Relleno[]; limpiadas: number } {
  const rellenos: Relleno[] = [];
  const estado = { x: 0, y: 0, radio: 0, limpiadas: 0 };

  const ctx = {
    fillStyle: '',
    setTransform: vi.fn(),
    clearRect: vi.fn(() => {
      estado.limpiadas += 1;
    }),
    beginPath: vi.fn(),
    arc: vi.fn((x: number, y: number, r: number) => {
      estado.x = x;
      estado.y = y;
      estado.radio = r;
    }),
    fill: vi.fn(() => {
      rellenos.push({ color: ctx.fillStyle, x: estado.x, y: estado.y, radio: estado.radio });
    }),
  };

  return {
    ctx,
    rellenos,
    get limpiadas() {
      return estado.limpiadas;
    },
  };
}

const marca = (clase: ClaseSenal, x = 10, y = 10, profundidad = 1): MarcaDeSenal => ({
  x,
  y,
  clase,
  profundidad,
});

const CAJA = { ancho: 800, alto: 500, dpr: 1 };

const igual = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

describe('el color codifica la CLASE, no el tipo', () => {
  it('los nueve tipos se pintan con el color de su clase, sin excepción', () => {
    // `sueño` y `propuesta` son dos tipos y un solo color, porque son una sola
    // clase: lo que se hace con los dos es deliberarlos.
    for (const tema of TEMAS_DEL_MAPA) {
      expect(colorDeSenal('sueño', tema)).toBe(colorDeClase('deseo', tema));
      expect(colorDeSenal('propuesta', tema)).toBe(colorDeClase('deseo', tema));
      expect(colorDeSenal('basta', tema)).toBe(colorDeClase('hecho', tema));
      expect(colorDeSenal('compromiso', tema)).toBe(colorDeClase('acto', tema));
      expect(colorDeSenal('pregunta', tema)).toBe(colorDeClase('meta', tema));
    }
  });

  it('los nueve tipos producen exactamente cuatro colores', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      const colores = new Set(TIPOS_SENAL.map((t) => colorDeSenal(t, tema)));
      expect(colores.size).toBe(CLASES_SENAL.length);
      expect(colores.size).toBe(4);
    }
  });

  it('toda clase del canon tiene color, y no hay dos clases del mismo color', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      const colores = CLASES_SENAL.map((c) => colorDeClase(c, tema));
      for (const color of colores) expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(new Set(colores).size).toBe(CLASES_SENAL.length);
    }
  });

  it('cada color cruza 3:1 contra su fondo, en los dos temas', () => {
    // Es la razón de que sean cuatro y no nueve, y de que sobre nocturno el
    // violeta y el cian salgan aclarados: plenos dan 2,5:1 y 2,7:1.
    for (const tema of TEMAS_DEL_MAPA) {
      for (const clase of CLASES_SENAL) {
        expect(
          contraste(colorDeClase(clase, tema), FONDO_DEL_TEMA[tema]),
          `${clase} sobre ${tema}`,
        ).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
      }
    }
  });

  it('sobre papel los tokens salen intactos: no se corrige lo que ya contrasta', () => {
    expect(colorDeClase('hecho', 'papel').toLowerCase()).toBe('#a16c00');
    expect(colorDeClase('deseo', 'papel').toLowerCase()).toBe('#5227cc');
  });

  it('sobre nocturno el violeta se aclara en vez de hundirse en el fondo', () => {
    expect(igual(colorDeClase('deseo', 'nocturno'), '#5227cc')).toBe(false);
    expect(contraste('#5227CC', FONDO_DEL_TEMA.nocturno)).toBeLessThan(CONTRASTE_MINIMO);
  });
});

describe('los filtros DESTIÑEN, no ocultan', () => {
  const marcas = [marca('hecho'), marca('deseo', 20), marca('acto', 30), marca('meta', 40)];

  it('con foco se pinta EXACTAMENTE la misma cantidad de marcas que sin foco', () => {
    const sinFoco = pincelFalso();
    const conFoco = pincelFalso();

    const pintadasSinFoco = pintarSenales(sinFoco.ctx, CAJA, {
      marcas,
      foco: null,
      tema: 'papel',
      radio: 3,
    });
    const pintadasConFoco = pintarSenales(conFoco.ctx, CAJA, {
      marcas,
      foco: new Set<ClaseSenal>(['hecho']),
      tema: 'papel',
      radio: 3,
    });

    expect(pintadasSinFoco).toBe(marcas.length);
    expect(pintadasConFoco).toBe(marcas.length);
    expect(conFoco.rellenos).toHaveLength(sinFoco.rellenos.length);
  });

  it('un foco VACÍO destiñe todo y no borra nada', () => {
    const { ctx, rellenos } = pincelFalso();
    const pintadas = pintarSenales(ctx, CAJA, {
      marcas,
      foco: new Set<ClaseSenal>(),
      tema: 'papel',
      radio: 3,
    });
    expect(pintadas).toBe(marcas.length);
    expect(rellenos).toHaveLength(marcas.length);
  });

  it('lo desteñido sale en el gris del tema y NUNCA en el fondo', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      const tinta = tintaDeMarca(marca('deseo'), new Set<ClaseSenal>(['hecho']), tema);
      expect(igual(tinta, GRIS_DEL_TEMA[tema])).toBe(true);
      expect(igual(tinta, FONDO_DEL_TEMA[tema])).toBe(false);
      // Desteñido sigue siendo legible: es la diferencia entre destiñer y ocultar.
      expect(contraste(tinta, FONDO_DEL_TEMA[tema])).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
    }
  });

  it('lo desteñido no se escalona además por profundidad: se desvanecería dos veces', () => {
    const fuera = new Set<ClaseSenal>(['hecho']);
    const alFrente = tintaDeMarca(marca('deseo', 0, 0, 1), fuera, 'papel');
    const alFondo = tintaDeMarca(marca('deseo', 0, 0, 0), fuera, 'papel');
    expect(alFrente).toBe(alFondo);
  });

  it('lo desteñido se pinta PRIMERO: queda debajo, no afuera', () => {
    const { ctx, rellenos } = pincelFalso();
    pintarSenales(ctx, CAJA, {
      marcas: [marca('hecho', 1), marca('deseo', 2)],
      foco: new Set<ClaseSenal>(['hecho']),
      tema: 'papel',
      radio: 3,
    });
    expect(rellenos[0]?.x).toBe(2);
    expect(igual(rellenos[0]?.color ?? '', GRIS_DEL_TEMA.papel)).toBe(true);
    expect(rellenos[1]?.x).toBe(1);
  });

  it('`enFoco` con `null` deja todo en foco', () => {
    for (const clase of CLASES_SENAL) expect(enFoco(null, clase)).toBe(true);
  });
});

describe('la profundidad se desvanece hacia el fondo del tema activo', () => {
  it('peso 0 ES el fondo y peso 1 es el color pleno', () => {
    expect(igual(haciaElFondo('#5227CC', FONDO_DEL_TEMA.papel, 0), FONDO_DEL_TEMA.papel)).toBe(true);
    expect(igual(haciaElFondo('#5227CC', FONDO_DEL_TEMA.papel, 1), '#5227CC')).toBe(true);
  });

  it('en nocturno se va a `oscuro.barra` y no al papel', () => {
    expect(igual(haciaElFondo('#5227CC', FONDO_DEL_TEMA.nocturno, 0), '#241F17')).toBe(true);
  });

  it('lo hundido queda más cerca del fondo que lo del frente, en los dos temas', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      const frente = tintaDeMarca(marca('acto', 0, 0, 1), null, tema);
      const fondo = tintaDeMarca(marca('acto', 0, 0, 0), null, tema);
      expect(frente).not.toBe(fondo);
      expect(contraste(fondo, FONDO_DEL_TEMA[tema])).toBeLessThan(
        contraste(frente, FONDO_DEL_TEMA[tema]),
      );
    }
  });

  it('una profundidad fuera de rango no rompe la mezcla', () => {
    for (const p of [-5, 0, 0.5, 1, 9]) {
      expect(tintaDeMarca(marca('meta', 0, 0, p), null, 'papel')).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('el lienzo', () => {
  it('se limpia y queda transparente: es un calco, no un fondo', () => {
    const falso = pincelFalso();
    pintarSenales(falso.ctx, CAJA, { marcas: [marca('hecho')], foco: null, tema: 'papel', radio: 3 });
    expect(falso.limpiadas).toBe(1);
    // El tipo `PincelDeMapa` no incluye `fillRect`: este pintor no puede pintar
    // un fondo opaco ni por accidente, y por eso sirve arriba de maplibre.
    expect('fillRect' in falso.ctx).toBe(false);
  });

  it('sin tamaño no dibuja nada en vez de romper', () => {
    const { ctx, rellenos } = pincelFalso();
    expect(
      pintarSenales(ctx, { ancho: 0, alto: 0, dpr: 2 }, {
        marcas: [marca('hecho')],
        foco: null,
        tema: 'papel',
        radio: 3,
      }),
    ).toBe(0);
    expect(rellenos).toHaveLength(0);
  });

  it('un radio absurdo se acota, y el punto sigue existiendo', () => {
    const { ctx, rellenos } = pincelFalso();
    pintarSenales(ctx, CAJA, { marcas: [marca('hecho')], foco: null, tema: 'papel', radio: 0 });
    expect(rellenos[0]?.radio).toBeGreaterThanOrEqual(1);
  });
});

describe('de celdas agregadas a marcas', () => {
  const celda = (id: string, voces: number, clase: ClaseSenal = 'hecho'): CeldaDeSenales => ({
    id,
    nombre: id,
    clase,
    voces,
    lng: -60,
    lat: -35,
    anchoGrados: 4,
    altoGrados: 3,
  });

  /** Identidad: así se puede afirmar dónde cayó cada punto en grados. */
  const identidad: ProyectarAPixel = (lng, lat) => ({ x: lng, y: lat });

  it('dibuja una marca por voz mientras no se pase del techo', () => {
    const { marcas } = marcasDeCeldas([celda('chaco', 40)], 7, identidad);
    expect(marcas).toHaveLength(40);
  });

  it('por encima del techo dibuja el techo, y el conteo sigue intacto', () => {
    const celdas = [celda('buenos aires', TECHO_DE_PUNTOS_POR_CELDA + 3400)];
    expect(marcasDeCeldas(celdas, 7, identidad).marcas).toHaveLength(TECHO_DE_PUNTOS_POR_CELDA);

    const saturadas = saturacionDeCeldas(celdas);
    expect(saturadas).toHaveLength(1);
    expect(saturadas[0]?.leyenda).toBe('+3.400 más');
    expect(saturadas[0]?.voces).toBe(TECHO_DE_PUNTOS_POR_CELDA + 3400);
  });

  it('la saturación coincide con la que decide el sembrado, sin una segunda aritmética', () => {
    for (const voces of [0, 1, 499, 500, 501, 12_000]) {
      const declarada = saturacionDeCeldas([celda('x', voces)])[0]?.leyenda ?? null;
      expect(declarada).toBe(sembrarCelda(voces, 0).leyenda);
    }
  });

  it('ningún punto se sale de la celda que lo contiene', () => {
    const { marcas } = marcasDeCeldas([celda('chaco', 300)], 11, identidad);
    for (const m of marcas) {
      expect(m.x).toBeGreaterThanOrEqual(-62);
      expect(m.x).toBeLessThanOrEqual(-58);
      expect(m.y).toBeGreaterThanOrEqual(-36.5);
      expect(m.y).toBeLessThanOrEqual(-33.5);
    }
  });

  it('lo que la proyección no puede ubicar se cuenta, no se traga', () => {
    const { marcas, sinProyectar } = marcasDeCeldas([celda('chaco', 25)], 3, () => null);
    expect(marcas).toHaveLength(0);
    expect(sinProyectar).toBe(25);
  });

  it('es determinista: la misma corrida dibuja el mismo mapa', () => {
    const celdas = [celda('chaco', 90), celda('formosa', 90, 'deseo')];
    expect(marcasDeCeldas(celdas, 5, identidad)).toEqual(marcasDeCeldas(celdas, 5, identidad));
  });

  it('dos celdas con el mismo conteo no dibujan la misma figura', () => {
    const { marcas } = marcasDeCeldas([celda('chaco', 60), celda('formosa', 60)], 5, identidad);
    const chaco = marcas.slice(0, 60).map((m) => m.x.toFixed(6));
    const formosa = marcas.slice(60).map((m) => m.x.toFixed(6));
    expect(chaco).not.toEqual(formosa);
  });

  it('cada marca lleva la clase de su celda, y de ahí sale su color', () => {
    const { marcas } = marcasDeCeldas([celda('chaco', 3, 'meta')], 1, identidad);
    for (const m of marcas) expect(m.clase).toBe('meta');
  });
});

describe('GUARDA: no existe una forma de ocultar', () => {
  // `join(dirname(...))` y no `new URL(..., import.meta.url)`: en el entorno
  // de test el `URL` global lo pone happy-dom y resuelve la base a la raíz.
  const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

  const fuente = (archivo: string): string =>
    readFileSync(join(DIR, archivo), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');

  it('ni el módulo ni el componente nombran una salida para esconder una marca', () => {
    /*
     * La regla 2 no es una preferencia de diseño: es la afirmación de que un
     * país filtrado que parece vacío es un país que miente. Una prop nueva que
     * permitiera saltear una clase la rompería en una línea y nadie se
     * enteraría — por eso la guarda mira el fuente y no sólo el comportamiento.
     */
    const prohibidos = /\b(ocultar|oculta|oculto|ocultos|esconder|omitir|saltear|visibles?)\b/;
    for (const archivo of ['pintor-senales.ts', 'PintorDeSenales.tsx']) {
      expect(fuente(archivo), archivo).not.toMatch(prohibidos);
    }
  });

  it('el conteo pintado es siempre el total, para cualquier foco', () => {
    const marcas = CLASES_SENAL.map((c, i) => marca(c, i * 10));
    for (const foco of [
      null,
      new Set<ClaseSenal>(),
      new Set<ClaseSenal>(['hecho']),
      new Set<ClaseSenal>(CLASES_SENAL),
    ]) {
      const { ctx } = pincelFalso();
      const tema: TemaDelMapa = 'nocturno';
      expect(pintarSenales(ctx, CAJA, { marcas, foco, tema, radio: 3 })).toBe(marcas.length);
    }
  });
});
