import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  ALTURAS_DEL_SELLO,
  pintar,
  SELLO_DEL_LIENZO,
  type Escena,
  type NodoDibujable,
  type Pincel,
} from '../constelacion-pintor';

import { COLOR_DE_CLASE, FONDO_DEL_TEMA, TINTA_DEL_TEMA } from '~/components/mapa/pintor-senales';

/**
 * El sello del lienzo — la única defensa que sobrevive a un recorte.
 *
 * Enmienda `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §4:
 *
 * > No es teórico y no es que alguien se confunda navegando. Es que **alguien
 * > saque una captura del ejemplo y la publique como si fuera el país**.
 *
 * La URL, el `<title>` y el encabezado dicen «ejemplo», y ninguno de los tres
 * entra en una captura de pantalla de la constelación. El sello adentro del
 * canvas es el único que sí, y por eso este archivo existe: **si alguien saca
 * el `fillText`, esto se pone rojo antes de que la página vuelva a publicar una
 * imagen que se puede pasar por dato del país.**
 *
 * Se verifica en tres alturas y no en una: una sola línea al pie se recorta con
 * el gesto más barato que hay.
 */

interface Escrito {
  texto: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  font: string;
}

/** El cuerpo en píxeles de un `font` de canvas. 0 si todavía no se fijó. */
const cuerpoDe = (font: string): number => Number(/(\d+)px/.exec(font)?.[1] ?? 0);

function pincelFalso(): { ctx: Pincel; escritos: Escrito[] } {
  const escritos: Escrito[] = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setLineDash: vi.fn(),
    // Un `TextMetrics` de mentira, pero **sensible al cuerpo**: si no lo fuera,
    // el achique del sello en un lienzo angosto no se podría verificar.
    measureText: vi.fn(
      (texto: string) => ({ width: texto.length * cuerpoDe(ctx.font) * 0.6 }) as TextMetrics,
    ),
    fillText: vi.fn((texto: string, x: number, y: number) => {
      escritos.push({
        texto,
        x,
        y,
        color: ctx.fillStyle,
        alpha: ctx.globalAlpha,
        font: ctx.font,
      });
    }),
  };
  return { ctx, escritos };
}

const nodo = (id: string, xyz: [number, number, number]): NodoDibujable => ({
  id,
  nucleoId: 'n1',
  x: xyz[0],
  y: xyz[1],
  z: xyz[2],
  color: COLOR_DE_CLASE.deseo,
  radio: 2,
});

const escena = (extra: Partial<Escena> = {}): Escena => ({
  nodos: [nodo('a', [-0.6, 0, 0.4]), nodo('b', [0.6, 0, -0.4])],
  aristas: [{ a: 'a', b: 'b', similitud: 0.9, tipo: 'medida' }],
  tema: 'papel',
  enfocado: null,
  onEnfocar: vi.fn(),
  origen: 'ejemplo',
  ...extra,
});

const CAJA = { width: 800, height: 500, dpr: 1 };

describe('el cielo del ejemplo se sella por dentro', () => {
  it('escribe la frase adentro del lienzo, y es la frase de siempre', () => {
    const { ctx, escritos } = pincelFalso();
    pintar(ctx, CAJA, escena(), 0, 0);

    expect(escritos.length).toBeGreaterThan(0);
    for (const escrito of escritos) expect(escrito.texto).toBe(SELLO_DEL_LIENZO);
    // La frase que la Simulación ya usa, más la palabra que nombra la ruta.
    expect(SELLO_DEL_LIENZO).toContain('Nadie dijo ninguna de estas cosas');
    expect(SELLO_DEL_LIENZO).toContain('ejemplo');
  });

  /**
   * Ésta es la afirmación entera: un recorte que muestre estrellas muestra el
   * sello. Se sostiene porque el sello va **repartido a lo alto**, y la banda
   * entre dos sellos consecutivos mide poco más de un cuarto del lienzo.
   */
  it('va repartido a lo alto: ningún recorte de un tercio del cielo lo esquiva', () => {
    const { ctx, escritos } = pincelFalso();
    pintar(ctx, CAJA, escena(), 0, 0);

    expect(escritos).toHaveLength(ALTURAS_DEL_SELLO.length);
    expect(ALTURAS_DEL_SELLO.length).toBeGreaterThanOrEqual(3);

    const alturas = escritos.map((e) => e.y).sort((a, b) => a - b);
    const separaciones = alturas.slice(1).map((y, i) => y - (alturas[i] ?? 0));
    for (const separacion of separaciones) {
      expect(separacion).toBeLessThanOrEqual(CAJA.height / 3);
    }
    // Y horizontalmente va al centro, que es donde caen las estrellas.
    for (const escrito of escritos) expect(escrito.x).toBeCloseTo(CAJA.width / 2);
  });

  it('va con la tinta del tema y a opacidad plena: es texto, no una marca de agua', () => {
    for (const tema of ['papel', 'nocturno'] as const) {
      const { ctx, escritos } = pincelFalso();
      pintar(ctx, { ...CAJA }, escena({ tema }), 0, 0);
      for (const escrito of escritos) {
        expect(escrito.color).toBe(TINTA_DEL_TEMA[tema]);
        expect(escrito.alpha).toBe(1);
        expect(escrito.font).not.toBe('');
      }
      expect(FONDO_DEL_TEMA[tema]).not.toBe(TINTA_DEL_TEMA[tema]);
    }
  });

  it('se dibuja ÚLTIMO: ningún nodo lo puede tapar', () => {
    const { ctx, escritos } = pincelFalso();
    const orden: string[] = [];
    const espia = {
      ...ctx,
      fill: vi.fn(() => orden.push('nodo')),
      fillText: vi.fn((texto: string, x: number, y: number) => {
        orden.push('sello');
        ctx.fillText(texto, x, y);
      }),
    };
    pintar(espia, CAJA, escena(), 0, 0);

    expect(escritos.length).toBeGreaterThan(0);
    expect(orden.indexOf('nodo')).toBeGreaterThanOrEqual(0);
    expect(orden.lastIndexOf('nodo')).toBeLessThan(orden.indexOf('sello'));
  });

  it('un lienzo sin tamaño no se sella ni rompe', () => {
    const { ctx, escritos } = pincelFalso();
    pintar(ctx, { width: 0, height: 0, dpr: 2 }, escena(), 0, 0);
    expect(escritos).toHaveLength(0);
  });

  /**
   * En un teléfono el lienzo mide un tercio de lo que mide en una pantalla, y
   * un sello que se sale por los costados es un sello del que después se puede
   * alegar que no se leía. Se achica hasta entrar, con un piso.
   */
  it('en un lienzo angosto se achica hasta entrar, en vez de salirse por los bordes', () => {
    const angosto = { width: 260, height: 420, dpr: 2 };
    const { ctx: anchoCtx, escritos: enAncho } = pincelFalso();
    pintar(anchoCtx, CAJA, escena(), 0, 0);

    const { ctx, escritos } = pincelFalso();
    pintar(ctx, angosto, escena(), 0, 0);

    expect(escritos).toHaveLength(ALTURAS_DEL_SELLO.length);
    for (const escrito of escritos) {
      const cuerpo = cuerpoDe(escrito.font);
      // Entra en el lienzo, y con un piso: nunca la letra chica de un contrato.
      expect(SELLO_DEL_LIENZO.length * cuerpo * 0.6).toBeLessThanOrEqual(angosto.width);
      expect(cuerpo).toBeGreaterThanOrEqual(9);
      // Y se achicó de verdad: en un lienzo ancho el cuerpo es mayor.
      expect(cuerpo).toBeLessThan(cuerpoDe(enAncho[0]?.font ?? ''));
    }
  });
});

describe('el cielo del corpus vivo NO se sella', () => {
  /**
   * La mentira simétrica: estampar «nadie dijo ninguna de estas cosas» encima
   * de lo que sí dijo la gente. El sello no es decoración de la página: es una
   * afirmación sobre el origen del dato, y sobre el corpus vivo sería falsa.
   */
  it('no escribe una sola letra adentro del lienzo', () => {
    const { ctx, escritos } = pincelFalso();
    pintar(ctx, CAJA, escena({ origen: 'corpus' }), 0, 0);
    expect(escritos).toHaveLength(0);
  });
});

/**
 * La guarda de última línea. Los tests de arriba ya se ponen rojos si alguien
 * saca el `fillText`, pero se ponen rojos *desde el comportamiento*: alguien
 * apurado podría borrarlos junto con la llamada y quedarse en verde. Esto lee
 * el archivo del pintor y verifica que la llamada siga escrita, con nombre,
 * para que sacarla obligue a tocar dos lugares y a leer este comentario.
 */
describe('la guarda del `fillText`', () => {
  // Desde la raíz del paquete, que es de donde corre vitest: `import.meta.url`
  // acá no es una URL de archivo (lo sirve vite) y no se puede resolver.
  const FUENTE = resolve(process.cwd(), 'src/pages/LaRadiografia/constelacion-pintor.ts');

  it('el pintor de la constelación sigue teniendo un `fillText`', () => {
    const codigo = readFileSync(FUENTE, 'utf8');
    expect(codigo).toContain('ctx.fillText(SELLO_DEL_LIENZO');
    expect(codigo).toContain("origen === 'ejemplo'");
  });

  it('la frase del sello es una constante del módulo y no una prop', () => {
    const codigo = readFileSync(FUENTE, 'utf8');
    expect(codigo).toContain('export const SELLO_DEL_LIENZO =');
    // Si algún día se pudiera pasar el texto desde afuera, dejaría de ser un
    // hecho y pasaría a ser un ajuste. La escena declara `origen`, y nada más.
    expect(codigo).not.toMatch(/sello\??:\s*string/);
  });
});
