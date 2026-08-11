import { describe, expect, it } from 'vitest';

import {
  ALTURA_PISO_EXCLUSIVO,
  ALTURA_TECHO_EXCLUSIVO,
  checkDeAltura,
  clasificarAltura,
  componerDireccion,
  direccionSinAltura,
  ubicacionPublicable,
  validarAltura,
} from '../direcciones.js';

import {
  ALBERDI,
  RANGO_COMPLETO,
  ROLES,
  SENSIBILIDADES,
  SIN_RANGO,
  TIPOS,
  entrada,
  precisionReal,
} from './_direcciones.js';

import type { MotivoAlturaInvalida, RangoDeAltura } from '../direcciones.js';

/**
 * El dominio de la altura — spec `docs/specs/2026-08-11-a-la-tierra.md` §3.4.
 *
 * Todo lo de acá defiende una sola frase: **nada puede fallar abierto**. Una
 * función que decide cuánto se publica y recibe algo que no entiende publica
 * menos, nunca más — y antes de eso lo dice con una frase que se pueda leer, en
 * vez de dejar que reviente el INSERT contra `senales_altura_chk` y que quien
 * está parado en el barrio con el celular vea un 500.
 *
 * Los cuatro valores que se repiten son los medidos: `0`, `−5`, `99.999.999` y
 * `1450,7` salían los cuatro sin tocar y con estado compuesto. Los tres
 * primeros reventaban el INSERT; el cuarto es peor, porque **no lo rechaza
 * ningún CHECK** —contra la parte decimal no hay constraint que valga— y
 * entraba a la base, salía al público adentro de `direccion_texto` y
 * `direccionSinAltura` ya no lo podía sacar.
 */

/** Los cuatro medidos, más los dos que `z.number()` deja pasar sin `.finite()`. */
const IMPOSIBLES: readonly { valor: number; motivo: MotivoAlturaInvalida }[] = [
  { valor: 0, motivo: 'cero' },
  { valor: -5, motivo: 'negativa' },
  { valor: 99_999_999, motivo: 'sobre_el_techo' },
  { valor: 1450.7, motivo: 'no_entera' },
  { valor: Number.NaN, motivo: 'no_es_un_numero' },
  { valor: Number.POSITIVE_INFINITY, motivo: 'no_es_un_numero' },
  { valor: Number.NEGATIVE_INFINITY, motivo: 'no_es_un_numero' },
];

const RANGOS: readonly RangoDeAltura[] = [
  RANGO_COMPLETO,
  ALBERDI,
  SIN_RANGO,
  { tipo: 'parcialDesde', desde: 1301 },
];

// ---------------------------------------------------------------------------

describe('el dominio de la altura se escribe una sola vez', () => {
  /**
   * La línea de A §3.4, carácter por carácter. Si alguien mueve el techo, este
   * test se cae y lo obliga a mirar la migración: es toda la garantía de que la
   * constante de la validación y la del CHECK sigan siendo la misma.
   */
  it('el CHECK de la migración sale de las constantes de la validación', () => {
    expect(checkDeAltura('altura')).toBe('altura IS NULL OR (altura > 0 AND altura < 1000000)');
    expect(checkDeAltura('altura')).toContain(String(ALTURA_PISO_EXCLUSIVO));
    expect(checkDeAltura('altura')).toContain(String(ALTURA_TECHO_EXCLUSIVO));
  });

  /**
   * Y el acuerdo de fondo: lo que la validación acepta es exactamente lo que el
   * predicado del CHECK acepta. Con los dos bordes adentro, que es donde un
   * `>` escrito `>=` se esconde por años.
   */
  it('la validación acepta exactamente lo que acepta el CHECK', () => {
    const enteros: readonly number[] = [
      -1,
      ALTURA_PISO_EXCLUSIVO,
      ALTURA_PISO_EXCLUSIVO + 1,
      1450,
      11_500,
      ALTURA_TECHO_EXCLUSIVO - 1,
      ALTURA_TECHO_EXCLUSIVO,
      ALTURA_TECHO_EXCLUSIVO + 1,
    ];
    const desalineados: string[] = [];
    for (const valor of enteros) {
      const loAceptaElCheck = valor > ALTURA_PISO_EXCLUSIVO && valor < ALTURA_TECHO_EXCLUSIVO;
      if ((validarAltura(valor).tipo === 'valida') !== loAceptaElCheck) {
        desalineados.push(String(valor));
      }
    }
    expect(desalineados).toEqual([]);
    // Y no es vacuo: hay aceptados y rechazados de los dos lados.
    expect(validarAltura(ALTURA_TECHO_EXCLUSIVO - 1).tipo).toBe('valida');
    expect(validarAltura(ALTURA_TECHO_EXCLUSIVO).tipo).toBe('invalida');
    expect(validarAltura(ALTURA_PISO_EXCLUSIVO + 1).tipo).toBe('valida');
    expect(validarAltura(ALTURA_PISO_EXCLUSIVO).tipo).toBe('invalida');
  });
});

describe('validarAltura — los cinco modos de no ser una altura', () => {
  /**
   * El rechazo, ya destapado de la unión. Que el `throw` sea la única forma de
   * salir de acá es a propósito: un test que mirara `salida.motivo` sobre la
   * unión sin estrechar estaría probando lo mismo que el defecto que arregla.
   */
  const invalidez = (valor: number): { motivo: MotivoAlturaInvalida; razon: string } => {
    const salida = validarAltura(valor);
    if (salida.tipo !== 'invalida') throw new Error(`${valor} pasó la validación y no debería`);
    return { motivo: salida.motivo, razon: salida.razon };
  };

  it('el cero no es una puerta: es el «no sé» del callejero', () => {
    expect(invalidez(0).motivo).toBe('cero');
    expect(invalidez(0).razon).toContain('mayor que cero');
  });

  it('no hay puertas con número negativo', () => {
    expect(invalidez(-5).motivo).toBe('negativa');
  });

  it('una altura con coma no es una altura', () => {
    expect(invalidez(1450.7).motivo).toBe('no_entera');
    expect(invalidez(0.5).motivo).toBe('no_entera');
  });

  it('por encima del techo hay un teléfono, no una dirección', () => {
    expect(invalidez(99_999_999).motivo).toBe('sobre_el_techo');
    expect(invalidez(ALTURA_TECHO_EXCLUSIVO).motivo).toBe('sobre_el_techo');
  });

  /**
   * `z.number()` deja pasar `NaN` e `Infinity` si nadie pide `.finite()`, y
   * contra `NaN` **toda** comparación da `false`: un `if (altura <= 0)` suelto
   * los manda por la rama de los números buenos. Por eso `Number.isFinite` va
   * primero y no último.
   */
  it('NaN e Infinity no se cuelan por el lado de las comparaciones', () => {
    for (const valor of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(invalidez(valor).motivo).toBe('no_es_un_numero');
    }
  });

  it('una altura real pasa y vuelve el mismo número', () => {
    expect(validarAltura(1450)).toEqual({ tipo: 'valida', altura: 1450 });
    expect(validarAltura(1)).toEqual({ tipo: 'valida', altura: 1 });
    expect(validarAltura(999_999)).toEqual({ tipo: 'valida', altura: 999_999 });
  });

  /**
   * Regla 9: la persona tiene que poder arreglar lo que escribió. Cada motivo
   * dice qué pasó con la altura y ninguno dice «validation failed», ni nombra
   * una columna, ni la hace sentir que rompió algo.
   */
  it('cada motivo trae una razón que se puede leer', () => {
    const vistas = new Set<string>();
    for (const { valor, motivo } of IMPOSIBLES) {
      const salida = invalidez(valor);
      expect(salida.motivo).toBe(motivo);
      expect(salida.razon).toMatch(/altura/i);
      expect(salida.razon).not.toMatch(/validation|invalid|error|null|undefined|NaN/i);
      expect(salida.razon.length).toBeGreaterThan(40);
      vistas.add(salida.razon);
    }
    // Cinco motivos, cinco frases distintas: ninguna se fusiona con otra.
    expect(vistas.size).toBe(5);
  });
});

describe('clasificarAltura', () => {
  /**
   * La defensa de forma: `clasificarAltura` es el único productor de
   * `EstadoDeAltura` del módulo y valida antes de clasificar, así que no hay
   * camino que convierta un `1450,7` en un estado que afirme que hay altura.
   */
  it('un número que no es altura no sale clasificado por ningún rango', () => {
    const clasificados: string[] = [];
    for (const rango of RANGOS) {
      for (const { valor } of IMPOSIBLES) {
        const salida = clasificarAltura(rango, valor);
        if (salida.tipo !== 'rechazada') clasificados.push(`${rango.tipo}/${valor}`);
      }
    }
    expect(clasificados).toEqual([]);
  });

  it('el rechazo dice cuál de los cinco motivos fue', () => {
    const salida = clasificarAltura(RANGO_COMPLETO, 1450.7);
    expect(salida.tipo).toBe('rechazada');
    expect(salida.tipo === 'rechazada' && salida.motivo).toBe('no_entera');
    expect(salida.tipo === 'rechazada' && salida.razon).toMatch(/entero/);
  });

  /** El número que vuelve es el que se clasificó: no hay dos variables. */
  it('una altura válida vuelve clasificada y con su número', () => {
    expect(clasificarAltura(RANGO_COMPLETO, 1450)).toEqual({
      tipo: 'clasificada',
      estado: 'altura_en_rango',
      altura: 1450,
    });
    expect(clasificarAltura(SIN_RANGO, 1450)).toEqual({
      tipo: 'clasificada',
      estado: 'altura_sin_rango',
      altura: 1450,
    });
  });
});

describe('ubicacionPublicable — la altura imposible se cae en la puerta', () => {
  /**
   * La guarda grande: sobre la matriz entera de tipo × rol × sensibilidad, un
   * valor imposible nunca produce un estado que afirme que hay altura, nunca
   * deja un número en la columna y siempre deja recibo. El oráculo es el CHECK:
   * lo que sale de acá tiene que satisfacer `senales_altura_chk`, porque una
   * función que pase los tests y no el motor no sirve de nada.
   */
  it('ningún valor imposible sobrevive a ninguna combinación', () => {
    const conAltura: string[] = [];
    const violanElCheck: string[] = [];
    const sinRecibo: string[] = [];
    let corridas = 0;

    for (const { valor } of IMPOSIBLES) {
      for (const tipo of TIPOS) {
        for (const role of ROLES) {
          for (const sensitivity of SENSIBILIDADES) {
            const salida = ubicacionPublicable(
              entrada({
                tipo,
                role,
                sensitivity,
                precision: precisionReal('exact', role, sensitivity),
                direccion: { calleId: 77, altura: valor, textoLibre: null },
              }),
            );
            const clave = `${valor}/${tipo}/${role}/${sensitivity}`;
            corridas += 1;

            if (
              salida.altura !== null ||
              salida.estado === 'altura_en_rango' ||
              salida.estado === 'altura_sin_rango' ||
              salida.estado === 'altura_fuera_de_rango'
            ) {
              conAltura.push(clave);
            }
            // `senales_altura_chk`, tal como lo va a escribir la migración.
            const pasaElCheck =
              salida.altura === null ||
              (Number.isInteger(salida.altura) &&
                salida.altura > ALTURA_PISO_EXCLUSIVO &&
                salida.altura < ALTURA_TECHO_EXCLUSIVO);
            if (!pasaElCheck) violanElCheck.push(clave);
            // Y la persona se entera: nada se retira en silencio.
            if (salida.retirado === null) sinRecibo.push(clave);
          }
        }
      }
    }

    expect(conAltura).toEqual([]);
    expect(violanElCheck).toEqual([]);
    expect(sinRecibo).toEqual([]);
    expect(corridas).toBe(IMPOSIBLES.length * TIPOS.length * ROLES.length * SENSIBILIDADES.length);
  });

  /** Y la matriz no prueba nada si la altura buena tampoco pasara. */
  it('la altura buena del mismo caso sí sobrevive', () => {
    const salida = ubicacionPublicable(
      entrada({ direccion: { calleId: 77, altura: 1450, textoLibre: null } }),
    );
    expect(salida.altura).toBe(1450);
    expect(salida.estado).toBe('altura_en_rango');
    expect(salida.retirado).toBeNull();
  });

  it('el recibo explica el motivo de la altura y no otro', () => {
    const salida = ubicacionPublicable(
      entrada({ direccion: { calleId: 77, altura: 0, textoLibre: null } }),
    );
    expect(salida.estado).toBe('calle');
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toContain('mayor que cero');
    // No se le explica a alguien por qué no publicamos una altura que no existía.
    expect(salida.retirado).not.toContain('habla del lugar de una persona');
  });

  /**
   * El caso que ningún CHECK podía cazar: el decimal entraba a la base y salía
   * al público compuesto adentro de `direccion_texto`, de donde
   * `direccionSinAltura` —que recorta el sufijo con el número ENTERO— ya no lo
   * podía sacar. Se corre la secuencia entera de §4.5 para probarlo.
   */
  it('el decimal no queda escrito en el texto que se publica', () => {
    const salida = ubicacionPublicable(
      entrada({ direccion: { calleId: 77, altura: 1450.7, textoLibre: null } }),
    );
    expect(salida.altura).toBeNull();

    const texto = componerDireccion({
      estado: salida.estado,
      nombreCalle: 'AV JOSE MARIA MORENO',
      altura: salida.altura,
      textoLibre: null,
    });
    expect(texto).toBe('AV JOSE MARIA MORENO');
    expect(texto).not.toContain('1450.7');
    expect(texto).not.toContain('1450,7');
    expect(direccionSinAltura({ direccionTexto: texto, altura: salida.altura })).toBe(
      'AV JOSE MARIA MORENO',
    );
  });

  it('una altura imposible sin calle tampoco inventa un texto libre', () => {
    const salida = ubicacionPublicable(
      entrada({ direccion: { calleId: null, altura: 99_999_999, textoLibre: null } }),
    );
    expect(salida).toMatchObject({ calleId: null, altura: null, estado: 'sin_direccion' });
    expect(salida.retirado).toMatch(/cinco\s+cifras/);
  });
});
