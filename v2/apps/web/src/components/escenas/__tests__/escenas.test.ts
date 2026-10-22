import { IcosahedronGeometry } from 'three';
import { describe, expect, it } from 'vitest';

import { asentar, avanzar, CIUDADANOS, crearCorriente, PARTICULAS } from '../corriente/corriente-modelo';
import { grafoDeTriangulos } from '../grafo';
import {
  disposicionPara,
  horasEncendidas,
  posicionesDeHoras,
  TOTAL_DE_HORAS,
  umbralesDeHoras,
} from '../horas/horas-geometria';
import { escenasPedidas, esNombreDeEscena } from '../registro';
import { avanzarVelo, crearVelo, cuantoSalieron } from '../velo/velo-modelo';

import { BLOG_POSTS } from '~/lib/blog-registry';

describe('escenas pedidas por la bitácora', () => {
  it('toda escena que pide un MDX existe en el registro (si no, queda un hueco vacío publicado)', () => {
    for (const post of BLOG_POSTS) {
      for (const nombre of escenasPedidas(post.body)) {
        expect(esNombreDeEscena(nombre), `${post.slug} pide «${nombre}»`).toBe(true);
      }
    }
  });

  it('lee los nombres en orden de aparición', () => {
    expect(escenasPedidas('<div data-escena="velo"></div> y <div data-escena="horas"></div>')).toEqual([
      'velo',
      'horas',
    ]);
  });
});

describe('horas: la cuenta del post hecha geometría', () => {
  it('son 82.800 horas, una posición por hora', () => {
    expect(TOTAL_DE_HORAS).toBe(8 * 5 * 46 * 45);
    expect(posicionesDeHoras(disposicionPara(1.6))).toHaveLength(TOTAL_DE_HORAS * 3);
  });

  it('acomoda los años en filas anchas para un lienzo apaisado y en columnas para uno vertical', () => {
    expect(disposicionPara(1.6).columnas).toBeGreaterThan(disposicionPara(0.8).columnas);
    const vertical = disposicionPara(0.8);
    expect(vertical.columnas * vertical.filas).toBeGreaterThanOrEqual(45);
  });

  it('encender una fracción enciende exactamente esa fracción de horas', () => {
    const umbrales = umbralesDeHoras();
    for (const f of [0, 0.25, 0.5, 0.9, 1]) {
      const encendidas = umbrales.filter((u) => u < f).length;
      expect(Math.abs(encendidas - horasEncendidas(f))).toBeLessThanOrEqual(1);
    }
  });

  it('dibuja la misma vida en cada visita', () => {
    expect(umbralesDeHoras().slice(0, 50)).toEqual(umbralesDeHoras().slice(0, 50));
  });
});

describe('grafo de una malla', () => {
  it('reduce el icosaedro subdividido a sus 42 vértices y 120 aristas', () => {
    const geometria = new IcosahedronGeometry(1, 1);
    const grafo = grafoDeTriangulos(geometria.getAttribute('position').array);
    expect(grafo.vertices.length / 3).toBe(42);
    expect(grafo.aristas.length / 2).toBe(120);
    expect(grafo.vecinos.every((v) => v.length >= 5)).toBe(true);
  });
});

describe('corriente: el lazo de la confianza', () => {
  const grafo = grafoDeTriangulos(new IcosahedronGeometry(3.6, 1).getAttribute('position').array);
  const red = new Float32Array(grafo.vertices);

  function luzMedia(luz: Float32Array) {
    return luz.reduce((a, b) => a + b, 0) / CIUDADANOS;
  }

  function correr(destino: 'persona' | 'sistema', segundos: number) {
    const c = crearCorriente(grafo);
    for (let t = 0; t < segundos; t += 1 / 30) avanzar(c, 1 / 30, destino, red);
    return c;
  }

  it('hacia una persona, nada vuelve: los ciudadanos se apagan', () => {
    const c = correr('persona', 25);
    expect(luzMedia(c.luz)).toBeLessThan(0.3);
  });

  it('hacia un sistema, la confianza vuelve: los ciudadanos se iluminan', () => {
    const c = correr('sistema', 25);
    expect(luzMedia(c.luz)).toBeGreaterThan(0.9);
    expect(Math.max(...c.calorDeArista)).toBeGreaterThan(0);
  });

  it('quieto, deja cada destino en su estado estable sin animar', () => {
    const c = crearCorriente(grafo);
    asentar(c, 'sistema', red);
    expect(luzMedia(c.luz)).toBe(1);
    expect(c.alfas.filter((a) => a > 0).length).toBeGreaterThan(PARTICULAS / 2);
  });
});

describe('velo: correrlo y volver', () => {
  it('todos salen a su órbita y pueden volver a la pista', () => {
    const v = crearVelo();
    let desde = 0;
    for (let t = 0; t < 6; t += 1 / 30, desde += 1 / 30) avanzarVelo(v, 1 / 30, t, true, desde);
    expect(cuantoSalieron(v)).toBe(1);
    desde = 0;
    for (let t = 6; t < 12; t += 1 / 30, desde += 1 / 30) avanzarVelo(v, 1 / 30, t, false, desde);
    expect(cuantoSalieron(v)).toBe(0);
  });
});
