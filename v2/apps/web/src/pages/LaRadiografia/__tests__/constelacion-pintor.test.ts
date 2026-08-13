import { describe, expect, it, vi } from 'vitest';

import {
  atenuacion,
  golpear,
  haciaElFondo,
  pintar,
  proyectar,
  type Escena,
  type NodoDibujable,
  type Pincel,
} from '../constelacion-pintor';
import { COLOR_DE_CLASE, FONDO_DE_TEMA } from '../radiografia-data';

/**
 * El pintor de la constelación.
 *
 * Un canvas no se puede leer: `getContext('2d')` ni siquiera existe en el
 * entorno de test. Por eso el pintor recibe su pincel por parámetro — se le
 * pasa uno falso que anota lo que le pidieron, y lo que se verifica es
 * exactamente lo que el lector va a ver.
 *
 * Las afirmaciones son de la spec, no de geometría por deporte:
 *
 *   1. una arista **declarada** nunca lleva el trazo de una **medida** (R6);
 *   2. la opacidad de una arista la manda su similitud;
 *   3. la profundidad se resuelve **hacia el fondo del tema activo** (§5.1) —
 *      lo de atrás se va al papel en claro y a `oscuro.barra` en nocturno;
 *   4. con un núcleo enfocado, el resto del cielo se apaga (§5.4).
 */

interface Trazo {
  dash: number[];
  ancho: number;
  alpha: number;
  color: string;
}

interface Relleno {
  color: string;
  radio: number;
}

function pincelFalso(): { ctx: Pincel; trazos: Trazo[]; rellenos: Relleno[] } {
  const trazos: Trazo[] = [];
  const rellenos: Relleno[] = [];
  let dash: number[] = [];
  let radio = 0;

  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn((_x: number, _y: number, r: number) => {
      radio = r;
    }),
    setLineDash: vi.fn((patron: number[]) => {
      dash = patron;
    }),
    stroke: vi.fn(() => {
      trazos.push({
        dash: [...dash],
        ancho: ctx.lineWidth,
        alpha: ctx.globalAlpha,
        color: ctx.strokeStyle,
      });
    }),
    fill: vi.fn(() => {
      rellenos.push({ color: ctx.fillStyle, radio });
    }),
  };

  return { ctx, trazos, rellenos };
}

const nodo = (
  id: string,
  nucleoId: string | null,
  xyz: [number, number, number],
): NodoDibujable => ({
  id,
  nucleoId,
  x: xyz[0],
  y: xyz[1],
  z: xyz[2],
  color: COLOR_DE_CLASE.deseo,
  radio: 2,
});

const escena = (extra: Partial<Escena> = {}): Escena => ({
  nodos: [nodo('a', 'n1', [-0.6, 0, 0.4]), nodo('b', 'n1', [0.6, 0, -0.4])],
  aristas: [{ a: 'a', b: 'b', similitud: 0.9, tipo: 'medida' }],
  tema: 'papel',
  enfocado: null,
  onEnfocar: vi.fn(),
  ...extra,
});

describe('la proyección', () => {
  it('dos nodos distintos caen en dos puntos distintos de la pantalla', () => {
    const p = proyectar({ x: -0.6, y: 0, z: 0.4 }, 0.6, -0.25, 800, 500);
    const q = proyectar({ x: 0.6, y: 0, z: -0.4 }, 0.6, -0.25, 800, 500);
    expect(p.sx).not.toBeCloseTo(q.sx);
    expect(Number.isFinite(p.sx) && Number.isFinite(p.sy)).toBe(true);
  });

  it('lo que está más cerca del lector tiene más «frente» y más escala', () => {
    const cerca = proyectar({ x: 0, y: 0, z: 1 }, 0, 0, 800, 500);
    const lejos = proyectar({ x: 0, y: 0, z: -1 }, 0, 0, 800, 500);
    expect(cerca.frente).toBeGreaterThan(lejos.frente);
    expect(cerca.escala).toBeGreaterThan(lejos.escala);
  });

  it('el frente queda siempre entre 0 y 1, incluso con un punto fuera de la esfera', () => {
    for (const z of [-9, -1, 0, 1, 9]) {
      const p = proyectar({ x: 0, y: 0, z }, 0.3, 0.3, 800, 500);
      expect(p.frente).toBeGreaterThanOrEqual(0);
      expect(p.frente).toBeLessThanOrEqual(1);
    }
  });
});

describe('la profundidad se desvanece hacia el fondo del tema (§5.1)', () => {
  it('con peso 0 el color ES el fondo, y con peso 1 es el color pleno', () => {
    expect(haciaElFondo(COLOR_DE_CLASE.deseo, FONDO_DE_TEMA.papel, 0)).toBe('rgb(242, 239, 231)');
    expect(haciaElFondo(COLOR_DE_CLASE.deseo, FONDO_DE_TEMA.papel, 1)).toBe('rgb(82, 39, 204)');
  });

  it('en nocturno se va a `oscuro.barra` y no al papel', () => {
    expect(haciaElFondo(COLOR_DE_CLASE.deseo, FONDO_DE_TEMA.nocturno, 0)).toBe('rgb(36, 31, 23)');
  });

  it('lo que está atrás se dibuja más cerca del fondo que lo que está adelante', () => {
    const { ctx, rellenos } = pincelFalso();
    pintar(ctx, { width: 800, height: 500, dpr: 1 }, escena(), 0, 0);
    // Se pintan del fondo hacia el frente: el primero es el más lejano.
    expect(rellenos).toHaveLength(2);
    const [atras, adelante] = rellenos;
    expect(atras?.color).not.toBe(adelante?.color);
    expect(distanciaAlFondo(atras?.color ?? '')).toBeLessThan(
      distanciaAlFondo(adelante?.color ?? ''),
    );
  });
});

describe('las dos clases de arista no llevan el mismo trazo (R6)', () => {
  it('la medida va entera y la declarada va punteada', () => {
    const { ctx, trazos } = pincelFalso();
    pintar(
      ctx,
      { width: 800, height: 500, dpr: 1 },
      escena({
        aristas: [
          { a: 'a', b: 'b', similitud: 0.9, tipo: 'medida' },
          { a: 'a', b: 'b', similitud: 0.9, tipo: 'declarada' },
        ],
      }),
      0,
      0,
    );
    expect(trazos).toHaveLength(2);
    expect(trazos[0]?.dash).toEqual([]);
    expect(trazos[1]?.dash).toEqual([3, 4]);
    expect(trazos[0]?.ancho).not.toBe(trazos[1]?.ancho);
  });

  it('una arista al filo del umbral se ve al filo: la opacidad la manda la similitud', () => {
    const { ctx, trazos } = pincelFalso();
    pintar(
      ctx,
      { width: 800, height: 500, dpr: 1 },
      escena({
        aristas: [
          { a: 'a', b: 'b', similitud: 0.95, tipo: 'medida' },
          { a: 'a', b: 'b', similitud: 0.31, tipo: 'medida' },
        ],
      }),
      0,
      0,
    );
    expect(trazos[0]?.alpha).toBeGreaterThan(trazos[1]?.alpha ?? 1);
  });

  it('una arista que apunta a un nodo que no está no se dibuja ni rompe', () => {
    const { ctx, trazos } = pincelFalso();
    pintar(
      ctx,
      { width: 800, height: 500, dpr: 1 },
      escena({ aristas: [{ a: 'a', b: 'fantasma', similitud: 0.9, tipo: 'medida' }] }),
      0,
      0,
    );
    expect(trazos).toHaveLength(0);
  });
});

describe('el enfoque de un núcleo (§5.4)', () => {
  it('el resto del cielo se apaga y el núcleo enfocado queda pleno', () => {
    const e = escena({
      nodos: [nodo('a', 'n1', [0, 0, 0.5]), nodo('c', 'n2', [0.5, 0, 0])],
      enfocado: 'n1',
    });
    expect(atenuacion(e, enPosicion(e.nodos, 0))).toBe(1);
    expect(atenuacion(e, enPosicion(e.nodos, 1))).toBeLessThan(1);
  });

  it('sin nada enfocado nadie se apaga', () => {
    const e = escena();
    expect(atenuacion(e, enPosicion(e.nodos, 0))).toBe(1);
  });
});

describe('apuntarle a un nodo', () => {
  const nodos = [nodo('a', 'n1', [0, 0, 0]), nodo('b', 'n2', [0.9, 0, 0])];
  const caja = { width: 800, height: 500 };

  it('un click sobre un nodo devuelve SU núcleo', () => {
    const centro = proyectar(enPosicion(nodos, 0), 0, 0, 800, 500);
    expect(golpear(nodos, 0, 0, caja, { x: centro.sx, y: centro.sy })).toBe('n1');
  });

  it('un click en el vacío no enfoca nada', () => {
    expect(golpear(nodos, 0, 0, caja, { x: 5, y: 5 })).toBeNull();
  });

  it('una voz sola se puede clickear y no pertenece a ningún núcleo', () => {
    const sola = [nodo('s', null, [0, 0, 0])];
    const centro = proyectar(enPosicion(sola, 0), 0, 0, 800, 500);
    expect(golpear(sola, 0, 0, caja, { x: centro.sx, y: centro.sy })).toBeNull();
  });
});

describe('el lienzo sin tamaño', () => {
  it('no dibuja nada en vez de romper', () => {
    const { ctx, rellenos } = pincelFalso();
    pintar(ctx, { width: 0, height: 0, dpr: 2 }, escena(), 0, 0);
    expect(rellenos).toHaveLength(0);
  });
});

/** El elemento `i`, o un fallo con nombre. `noUncheckedIndexedAccess` manda. */
function enPosicion<T>(lista: readonly T[], i: number): T {
  const x = lista[i];
  if (x === undefined) throw new Error(`no hay elemento en la posición ${String(i)}`);
  return x;
}

/** Cuánto se alejó un `rgb(...)` del papel. Más chico = más hundido al fondo. */
function distanciaAlFondo(color: string): number {
  const nums = /rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  if (!nums) return 0;
  const [r, g, b] = [Number(nums[1]), Number(nums[2]), Number(nums[3])];
  return Math.abs(r - 242) + Math.abs(g - 239) + Math.abs(b - 231);
}
