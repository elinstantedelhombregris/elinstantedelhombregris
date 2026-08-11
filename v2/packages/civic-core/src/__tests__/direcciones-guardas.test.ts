import { describe, expect, it } from 'vitest';

import {
  clasificarAltura,
  componerDireccion,
  direccionSinAltura,
  etiquetaDeDireccion,
  normalizarNombreDeCalle,
  rangoDeAltura,
  techoDeTipo,
  ubicacionPublicable,
} from '../direcciones.js';

import {
  ALBERDI,
  PRECISIONES,
  RANGO_COMPLETO,
  ROLES,
  SENSIBILIDADES,
  SIN_RANGO,
  TIPOS,
  entrada,
  precisionReal,
} from './_direcciones.js';

import type { DireccionEstado, RangoDeAltura } from '../direcciones.js';

/**
 * Las guardas de la dirección — spec `docs/specs/2026-08-11-a-la-tierra.md` §8.1,
 * con la redacción de frase-afirmación de `brillo-guardas.test.ts`: cada nombre
 * de test es la afirmación que el sistema tiene que seguir cumpliendo, no una
 * descripción de lo que el test hace.
 *
 * Son nueve de las once de §8.1. Las otras dos viven en `packages/db` porque
 * hablan de la base y no de este módulo: la 9 —«una provincia se sigue
 * encontrando por su nombre después de la migración»— es de la Task 3 del plan,
 * y la 11 —«todo nivel usado en un filtro está en el CHECK»— es de la Task 1.
 */

const DEPARTAMENTO = 512;
const LOCALIDAD = 3040;

// ---------------------------------------------------------------------------

describe('guardas de la dirección', () => {
  /**
   * §2.5: georef codifica «no sé» como `0`, y un cero que significa «no sé» es
   * el pecado del que sale `brillo.ts`. La traducción pasa una sola vez, en la
   * frontera del seed, y después ningún camino puede volver a producirlo.
   */
  it('el cero de georef nunca entra como altura', () => {
    const valores: readonly (number | null | undefined)[] = [0, null, undefined, 3200];
    const conCero: string[] = [];

    for (const a of valores) {
      for (const b of valores) {
        for (const c of valores) {
          for (const d of valores) {
            const rango = rangoDeAltura({ inicio: [a, b], fin: [c, d] });
            const desde = 'desde' in rango ? rango.desde : null;
            const hasta = 'hasta' in rango ? rango.hasta : null;
            if (desde === 0 || hasta === 0) conCero.push(JSON.stringify(rango));
          }
        }
      }
    }

    expect(conCero).toEqual([]);
    expect(rangoDeAltura({ inicio: [0, 0], fin: [0, 0] })).toEqual<RangoDeAltura>({
      tipo: 'ausente',
    });
  });

  /**
   * §2.5: no saber si la altura está bien no es lo mismo que saber que está
   * mal, y tampoco es lo mismo que saber que está bien. Córdoba entera cae acá.
   */
  it('una calle sin rango no dice que la altura esté bien ni que esté mal', () => {
    const sinRango = clasificarAltura(SIN_RANGO, 1234);
    expect(sinRango).toEqual({ tipo: 'clasificada', estado: 'altura_sin_rango', altura: 1234 });
    expect(sinRango).not.toMatchObject({ estado: 'altura_en_rango' });
    expect(sinRango).not.toMatchObject({ estado: 'altura_fuera_de_rango' });
  });

  /**
   * `AV JUAN BAUTISTA ALBERDI`, CABA, id `0204901001480`, verificado contra la
   * API: se conoce el fin —3200— y no el inicio. Un booleano `tiene_rango`
   * trata igual a 4000 y a 100, y miente en las dos direcciones.
   */
  it('medio rango clasifica lo que puede y no clasifica lo que no', () => {
    expect(clasificarAltura(ALBERDI, 4000)).toMatchObject({ estado: 'altura_fuera_de_rango' });
    expect(clasificarAltura(ALBERDI, 100)).toMatchObject({ estado: 'altura_sin_rango' });
  });

  /**
   * La guarda 4, y la más grande: §2.6 hecha property test sobre la matriz
   * entera. El oráculo es el CHECK de §3.4 —cada resultado tiene que satisfacer
   * la disyunción de `senales_direccion_chk` y los cuatro CHECK de piso—,
   * porque una función que pase los tests y no el motor no sirve de nada: el
   * INSERT falla en producción y no acá.
   */
  it('la dirección se retira cuando corrió la protección o cuando el tipo no la admite, no cuando falta el punto', () => {
    interface Fixture {
      nombre: DireccionEstado;
      calleId: number | null;
      altura: number | null;
      textoLibre: string | null;
      nombreCalle: string | null;
      rango: RangoDeAltura;
    }

    const fixtures: readonly Fixture[] = [
      {
        nombre: 'sin_direccion',
        calleId: null,
        altura: null,
        textoLibre: null,
        nombreCalle: null,
        rango: SIN_RANGO,
      },
      {
        nombre: 'calle',
        calleId: 77,
        altura: null,
        textoLibre: null,
        nombreCalle: '25 DE MAYO',
        rango: RANGO_COMPLETO,
      },
      {
        nombre: 'altura_en_rango',
        calleId: 77,
        altura: 1450,
        textoLibre: null,
        nombreCalle: '25 DE MAYO',
        rango: RANGO_COMPLETO,
      },
      {
        nombre: 'altura_sin_rango',
        calleId: 77,
        altura: 1450,
        textoLibre: null,
        nombreCalle: '25 DE MAYO',
        rango: SIN_RANGO,
      },
      {
        nombre: 'altura_fuera_de_rango',
        calleId: 77,
        altura: 4000,
        textoLibre: null,
        nombreCalle: '25 DE MAYO',
        rango: ALBERDI,
      },
      {
        nombre: 'texto_libre',
        calleId: null,
        altura: null,
        textoLibre: 'Pasillo del fondo, casilla 14',
        nombreCalle: null,
        rango: SIN_RANGO,
      },
    ];

    /** `senales_direccion_chk`: la unión discriminada, hecha cumplir por la base. */
    const satisfaceLaDisyuncion = (
      estado: DireccionEstado,
      calleId: number | null,
      altura: number | null,
      texto: string | null,
    ): boolean => {
      switch (estado) {
        case 'sin_direccion':
          return calleId === null && altura === null && texto === null;
        case 'calle':
          return calleId !== null && altura === null && texto !== null;
        case 'altura_en_rango':
        case 'altura_sin_rango':
        case 'altura_fuera_de_rango':
          return calleId !== null && altura !== null && texto !== null;
        case 'texto_libre':
          return calleId === null && altura === null && texto !== null;
      }
    };

    const violanElCheck: string[] = [];
    const conAlturaEnSubject: string[] = [];
    const conAlturaEnAmbito: string[] = [];
    const protegidasQueGuardaronAlgo: string[] = [];
    const estadoInesperado: string[] = [];
    let enteras = 0;

    for (const fixture of fixtures) {
      for (const requested of PRECISIONES) {
        for (const role of ROLES) {
          for (const sensitivity of SENSIBILIDADES) {
            for (const tipo of TIPOS) {
              for (const hayPunto of [false, true]) {
                const precision = precisionReal(requested, role, sensitivity);
                const salida = ubicacionPublicable(
                  entrada({
                    tipo,
                    direccion: {
                      calleId: fixture.calleId,
                      altura: fixture.altura,
                      textoLibre: fixture.textoLibre,
                    },
                    rango: fixture.rango,
                    jerarquia: { cityId: LOCALIDAD, departmentId: DEPARTAMENTO },
                    precision,
                    hayPunto,
                    role,
                    sensitivity,
                  }),
                );
                const texto = componerDireccion({
                  estado: salida.estado,
                  nombreCalle: fixture.nombreCalle,
                  altura: salida.altura,
                  textoLibre: fixture.textoLibre,
                });
                const clave = `${fixture.nombre}/${requested}/${role}/${sensitivity}/${tipo}/punto:${hayPunto}`;

                // El oráculo: los cinco CHECK de la migración 0015.
                const ok =
                  satisfaceLaDisyuncion(salida.estado, salida.calleId, salida.altura, texto) &&
                  (salida.altura === null || !hayPunto || precision.precision === 'exact') &&
                  (salida.altura === null || role === 'capture' || role === 'meeting_point') &&
                  (salida.estado !== 'texto_libre' ||
                    role === 'capture' ||
                    role === 'meeting_point') &&
                  (!(role === 'subject' && sensitivity === 'high') ||
                    salida.estado === 'sin_direccion');
                if (!ok) violanElCheck.push(clave);

                // Con rol `subject` nunca vuelve altura ni texto libre.
                if (
                  role === 'subject' &&
                  (salida.altura !== null || salida.estado === 'texto_libre')
                ) {
                  conAlturaEnSubject.push(clave);
                }
                // Con rol `service_area` tampoco, cualquiera sea el tipo.
                if (
                  role === 'service_area' &&
                  (salida.altura !== null || salida.estado === 'texto_libre')
                ) {
                  conAlturaEnAmbito.push(clave);
                }
                // Con la protección corrida: sin dirección, y la localidad se
                // retira dejando el departamento en su lugar.
                if (precision.coarsenedBecause !== null) {
                  if (
                    salida.estado !== 'sin_direccion' ||
                    salida.cityId !== null ||
                    salida.departmentId !== DEPARTAMENTO
                  ) {
                    protegidasQueGuardaronAlgo.push(clave);
                  }
                }

                const sinProteccion = precision.coarsenedBecause === null;
                const esCosa = role === 'capture' || role === 'meeting_point';
                const techo = techoDeTipo(tipo);
                const techoCompleto = techo.reconocido && techo.techo === 'completa';
                // Sin punto, con rol de cosa y sin protección: la dirección
                // vuelve entera. Es el caso emblemático de la spec —Córdoba, sin
                // GPS, calle escrita a mano— y el que un diseño llaveado en
                // `LocationPrecision` borraba en silencio.
                if (!hayPunto && esCosa && techoCompleto && sinProteccion) {
                  if (salida.estado !== fixture.nombre) estadoInesperado.push(clave);
                  else enteras += 1;
                }
              }
            }
          }
        }
      }
    }

    expect(violanElCheck).toEqual([]);
    expect(conAlturaEnSubject).toEqual([]);
    expect(conAlturaEnAmbito).toEqual([]);
    expect(protegidasQueGuardaronAlgo).toEqual([]);
    expect(estadoInesperado).toEqual([]);
    // Y la matriz no es vacua: los seis estados salieron enteros, en las seis
    // precisiones, con los dos roles de cosa y los cuatro tipos de techo completo.
    expect(enteras).toBe(fixtures.length * PRECISIONES.length * 2 * 4 * SENSIBILIDADES.length);
  });

  /**
   * §4.5: el orden numerado. Si el texto se compusiera primero, la fila quedaría
   * con `altura IS NULL` y con «25 DE MAYO 1450» adentro de `direccion_texto`,
   * que sale por la API pública y por el volcado. La fixture tiene números en el
   * nombre a propósito: un regex sobre dígitos daría `DE MAYO`.
   */
  it('lo que no se publica no deja rastro, tampoco en el texto', () => {
    const salida = ubicacionPublicable(
      entrada({
        tipo: 'necesidad',
        role: 'subject',
        sensitivity: 'moderate',
        direccion: { calleId: 77, altura: 1450, textoLibre: null },
      }),
    );
    expect(salida.altura).toBeNull();

    const texto = componerDireccion({
      estado: salida.estado,
      nombreCalle: '25 DE MAYO',
      altura: salida.altura,
      textoLibre: null,
    });
    expect(texto).toBe('25 DE MAYO');
    expect(texto).not.toContain('1450');

    // Y lo mismo del lado del registro público, sobre una fila con altura
    // guardada legítimamente.
    expect(direccionSinAltura({ direccionTexto: '25 DE MAYO 1450', altura: 1450 })).toBe(
      '25 DE MAYO',
    );
  });

  /**
   * §2.5: las 326.832 calles del INDEC no son todas las calles del país.
   * Negarse a guardar lo que no está en el catálogo del Estado sería que esta
   * plataforma le diga a un barrio que no existe.
   */
  it('lo que no está en el callejero se guarda igual', () => {
    const barrio = 'Barrio Nuevo, manzana 4, casa 12';
    const salida = ubicacionPublicable(
      entrada({
        tipo: 'basta',
        role: 'capture',
        direccion: { calleId: null, altura: null, textoLibre: barrio },
        rango: SIN_RANGO,
      }),
    );
    expect(salida.estado).toBe('texto_libre');
    expect(
      componerDireccion({
        estado: salida.estado,
        nombreCalle: null,
        altura: salida.altura,
        textoLibre: barrio,
      }),
    ).toBe(barrio);
  });

  /**
   * §3.3: el seed pasa `[fila.categoria]` porque la tabla de categorías se
   * llena a medida que avanza; la consulta pasa la lista entera. Si los dos
   * lados no coincidieran, la búsqueda devolvería menos filas en unas
   * provincias que en otras, en silencio.
   */
  it('el mismo texto normaliza igual en el seed y en la consulta', () => {
    const categorias = ['CALLE', 'AV', 'AVENIDA', 'PASAJE', 'PJE', 'RUTA', 'BOULEVARD', 'DIAGONAL'];
    const nombres: readonly { nombre: string; categoria: string }[] = [
      { nombre: 'AV JOSE MARIA MORENO', categoria: 'AV' },
      { nombre: 'FARADAY', categoria: 'CALLE' },
      { nombre: 'CALLE S N', categoria: 'CALLE' },
      { nombre: 'CALLE', categoria: 'CALLE' },
      { nombre: 'AVELLANEDA', categoria: 'AV' },
      { nombre: '25 DE MAYO', categoria: 'CALLE' },
      { nombre: 'PJE SIN NOMBRE', categoria: 'PJE' },
      { nombre: 'DIAGONAL NORTE', categoria: 'DIAGONAL' },
      { nombre: 'RUTA PROVINCIAL 11', categoria: 'RUTA' },
      { nombre: 'BOULEVARD OROÑO', categoria: 'BOULEVARD' },
    ];
    // Cincuenta filas: las diez de arriba, más las mismas con tildes, en
    // minúsculas, con metacaracteres de LIKE y con espacios de más.
    const variantes = (base: string): readonly string[] => [
      base,
      base.toLowerCase(),
      base.replace(/O/g, 'Ó'),
      `  ${base}  `,
      `${base}%`,
    ];

    const desalineadas: string[] = [];
    for (const fila of nombres) {
      for (const variante of variantes(fila.nombre)) {
        const delSeed = normalizarNombreDeCalle(variante, [fila.categoria]);
        const deLaConsulta = normalizarNombreDeCalle(variante, categorias);
        if (delSeed !== deLaConsulta)
          desalineadas.push(`${variante} → ${delSeed} / ${deLaConsulta}`);
        // Y ninguna puede quedar vacía: `nombre_norm` es NOT NULL.
        expect(delSeed).not.toBe('');
      }
    }
    expect(desalineadas).toEqual([]);
  });

  /**
   * §4.2: el corte de la categoría es por token completo. Sin eso, la calle
   * `AVELLANEDA` de una localidad con categoría `AV` se guardaría como
   * `ELLANEDA` y no la encontraría nadie.
   */
  it('el prefijo de categoría no come una calle que empieza parecido', () => {
    expect(normalizarNombreDeCalle('AVELLANEDA', ['AV'])).toBe('AVELLANEDA');
    expect(normalizarNombreDeCalle('AVELLANEDA 1200', ['AV', 'CALLE'])).toBe('AVELLANEDA 1200');
    expect(normalizarNombreDeCalle('CALLEJON DEL SOL', ['CALLE'])).toBe('CALLEJON DEL SOL');
  });

  /**
   * Regla 4: el estado de la dirección NO es el estado de calidad de la señal.
   * Uno dice hasta dónde se pudo verificar la ubicación contra el catálogo del
   * Estado, el otro si la señal fue corroborada por gente. Una etiqueta que
   * dijera «confirmada» haría entender que alguien corroboró la señal, cuando
   * lo único que pasó es que un número cayó adentro de un rango del INDEC.
   */
  it('la etiqueta de dirección no usa la palabra de la regla 4', () => {
    const prohibidas = /confirmad[ao]|verificad[ao]/i;
    const estados: readonly DireccionEstado[] = [
      'sin_direccion',
      'calle',
      'altura_en_rango',
      'altura_sin_rango',
      'altura_fuera_de_rango',
      'texto_libre',
    ];
    for (const estado of estados) {
      expect(etiquetaDeDireccion(estado) ?? '').not.toMatch(prohibidas);
    }
  });

  /** Y lo mismo para el recibo, que se lee en la misma pantalla. */
  it('el recibo del retiro tampoco la usa', () => {
    const prohibidas = /confirmad[ao]|verificad[ao]/i;
    const recibos: (string | null)[] = [];
    for (const role of ROLES) {
      for (const sensitivity of SENSIBILIDADES) {
        for (const tipo of TIPOS) {
          recibos.push(
            ubicacionPublicable(
              entrada({
                tipo,
                role,
                sensitivity,
                hayPunto: true,
                precision: precisionReal('exact', role, sensitivity),
              }),
            ).retirado,
          );
        }
      }
    }
    for (const recibo of recibos) {
      expect(recibo ?? '').not.toMatch(prohibidas);
    }
    expect(recibos.some((recibo) => recibo !== null)).toBe(true);
  });
});
