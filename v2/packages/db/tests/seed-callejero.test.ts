/**
 * El seed del callejero, sin base y sin internet.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5.
 *
 * **Este archivo no abre una conexión ni hace una request, y corre siempre.**
 * Es la mitad del punto de haber separado el seed en tres capas: las decisiones
 * que deciden si el país entra completo —la partición, el techo de la API, la
 * deduplicación, la traducción del `0`, la normalización— son funciones puras, y
 * una función pura se puede afirmar en cuarenta milisegundos.
 *
 * Lo que NO se puede afirmar acá, y dónde está:
 *
 *   - que una re-siembra sin cambios escriba cero filas → `seed-callejero-idempotencia.test.ts`
 *     (necesita Postgres: es una propiedad del `ON CONFLICT … WHERE`, no del código)
 *   - que los conteos den 17.986 y 326.832 → la verificación del Step 6, a mano,
 *     después de sembrar, contra la base
 *   - que la fuente entregue lo que declara → la auditoría del Step 7, a mano y
 *     **nunca en CI**: un test que dependa de una API de terceros convierte una
 *     caída de georef en un build roto, y esta plataforma tiene el argumento de
 *     la soberanía del dato justamente para no depender de eso.
 */
import { describe, expect, it } from 'vitest';

import {
  AVISO_DE_DESTINO,
  cerrarParticion,
  decidirPublicacion,
  elegirCorrida,
  elegirDestino,
  evaluarCompletitud,
  fechaDeCorrida,
  leerOpciones,
  nuevaCorrida,
  particionesDeCalles,
  salteaElNivel,
  salteaLaParticionDeCalles,
  VENTANA_DE_REANUDACION_MS,
} from '../scripts/callejero/corrida.js';
import {
  esAnotacion,
  faltantesDeIndices,
  INDICES_ESPERADOS_DE_CALLES,
  SUFIJO_DUPLICADOS,
  SUFIJO_HUERFANAS,
} from '../scripts/callejero/escribir.js';
import {
  evaluarTecho,
  FuenteGeoref,
  INICIO_MAXIMO,
  leerCuerpo,
  MAX_POR_PAGINA,
  planDePaginas,
  TECHO_DE_LA_API,
  urlDePagina,
} from '../scripts/callejero/fuente.js';
import {
  cambiaElLugar,
  claseDelNombre,
  deduplicarPorGeorefId,
  huellaDePagina,
  huellaDeParticion,
  leerCalle,
  leerLugar,
  lineaDeCalle,
  planificarCalle,
  planificarLugar,
  rangoVieneInvertido,
} from '../scripts/callejero/normalizar.js';

import type {
  CompletitudDeParticion,
  LugarIndexado,
} from '../scripts/callejero/corrida.js';
import type { RespuestaHttp, Recurso } from '../scripts/callejero/fuente.js';
import type { LugarEnBase } from '../scripts/callejero/normalizar.js';
import type { CalleParaSembrar } from '../src/repositories/geo-calles.js';

// ---------------------------------------------------------------------------
// Andamios
// ---------------------------------------------------------------------------

const lugar = (parcial: Partial<LugarEnBase> & { id: number; level: string }): LugarEnBase => ({
  name: 'X',
  nameNorm: 'X',
  provinceId: parcial.id,
  parentId: null,
  departmentId: null,
  municipalityId: null,
  latitude: null,
  longitude: null,
  vigenteHasta: null,
  ...parcial,
});

/** Un índice mínimo pero real: una provincia, un departamento, una localidad. */
const indiceBase = (): Map<string, LugarEnBase> =>
  new Map<string, LugarEnBase>([
    [
      '58',
      lugar({ id: 1, level: 'province', name: 'Neuquén', nameNorm: 'NEUQUEN', provinceId: 1 }),
    ],
    [
      '58112',
      lugar({ id: 2, level: 'department', name: 'Zapala', nameNorm: 'ZAPALA', provinceId: 1 }),
    ],
    [
      '58112040',
      lugar({ id: 3, level: 'locality', name: 'Zapala', nameNorm: 'ZAPALA', provinceId: 1 }),
    ],
  ]);

const respuesta = (recurso: Recurso, total: number, filas: unknown[]): RespuestaHttp => ({
  estado: 'respondio',
  codigo: 200,
  cuerpo: { total, cantidad: filas.length, inicio: 0, [recurso]: filas },
});

const filasFalsas = (n: number, desde = 0): unknown[] =>
  Array.from({ length: n }, (_, i) => ({ id: String(desde + i), nombre: `X${String(desde + i)}` }));

const fuenteFalsa = (paginas: readonly RespuestaHttp[]): FuenteGeoref => {
  let llamada = 0;
  return new FuenteGeoref({
    base: 'https://ninguna.parte.invalid/georef/api',
    pausaMs: 0,
    dormir: async () => Promise.resolve(),
    traedor: async () => {
      const respuestaDeTurno = paginas[Math.min(llamada, paginas.length - 1)];
      llamada++;
      return Promise.resolve(
        respuestaDeTurno ?? { estado: 'sin_respuesta', motivo: 'sin páginas' },
      );
    },
  });
};

// ---------------------------------------------------------------------------
// La fuente: los paths, la paginación y EL TECHO
// ---------------------------------------------------------------------------

describe('la fuente', () => {
  it('el path de las localidades censales lleva guión, y no es `/localidades`', () => {
    // `/localidades` es OTRO recurso de la API. Sembrar el equivocado entra
    // filas plausibles y `filas_escritas = total_declarado` cierra igual: el
    // error no falla, y por eso hay un test que lo mira.
    const url = urlDePagina('https://x.invalid/georef/api', {
      recurso: 'localidades_censales',
      inicio: 0,
    });
    expect(url).toContain('/localidades-censales?');
    expect(url).not.toContain('/localidades?');
  });

  it('toda página pide `campos=completo`: sin eso las calles entran sin altura', () => {
    const url = urlDePagina('https://x.invalid/georef/api', { recurso: 'calles', inicio: 0 });
    expect(url).toContain('campos=completo');
    expect(url).toContain(`max=${String(MAX_POR_PAGINA)}`);
  });

  it('un cuerpo sin `total` es ilegible, y no un total de cero', () => {
    // Un cero que significa «no entendí» es el pecado del que sale `brillo.ts`.
    const sinTotal = leerCuerpo('calles', { calles: [] });
    expect(sinTotal.estado).toBe('ilegible');
    const conTotal = leerCuerpo('calles', { total: 0, calles: [] });
    expect(conTotal).toMatchObject({ estado: 'leido', total: 0 });
  });

  it('el plan de páginas nunca propone un `inicio` que la API rechaza', () => {
    expect(planDePaginas(8_542, 0)).toEqual([0, 5_000]);
    expect(planDePaginas(600, 0)).toEqual([0]);
    expect(planDePaginas(0, 0)).toEqual([]);
    for (const inicio of planDePaginas(500_000, 0))
      expect(inicio).toBeLessThanOrEqual(INICIO_MAXIMO);
  });

  it('el techo de la API es la SUMA `max + inicio`, y ninguna página se pasa', () => {
    // Medido contra la API el 2026-08-12: `max=5000&inicio=10000` devuelve 400
    // con «La suma de parámetros 'max', 'inicio' debe ser menor o igual que
    // 10000». Leer los dos topes como independientes daba 15.000 y hacía
    // IMPOSIBLE bajar los 14.673 asentamientos: la tercera página era un 400.
    expect(TECHO_DE_LA_API).toBe(10_000);
    for (const inicio of planDePaginas(500_000, 0)) {
      expect(inicio + MAX_POR_PAGINA).toBeLessThanOrEqual(TECHO_DE_LA_API);
    }
  });

  it('10.000 es el techo, y las dos formas de tocarlo abortan', () => {
    expect(evaluarTecho(TECHO_DE_LA_API, 0).estado).toBe('tocado');
    expect(evaluarTecho(9_999, TECHO_DE_LA_API).estado).toBe('tocado');
    expect(evaluarTecho(8_542, 8_542).estado).toBe('holgado');
    // Entra entera, pero avisa: el día que no entre, el país pierde calles.
    expect(evaluarTecho(9_500, 0).estado).toBe('al_filo');
    // Y los 14.673 asentamientos del país NO entran por una sola consulta:
    // por eso esa fase se parte en 24 provincias.
    expect(evaluarTecho(14_673, 0).estado).toBe('tocado');
  });

  it('una partición que DECLARA el techo aborta antes de bajar una sola fila', async () => {
    const fuente = fuenteFalsa([respuesta('calles', TECHO_DE_LA_API, filasFalsas(5_000))]);
    const vistas: number[] = [];
    const recorrido = await fuente.recorrer(
      { recurso: 'calles', inicioDesde: 0 },
      async (pagina) => {
        vistas.push(pagina.filas.length);
        return Promise.resolve();
      },
    );
    expect(recorrido.estado).toBe('techo');
    expect(vistas).toEqual([]);
  });

  it('una partición que ENTREGA 15.000 aborta aunque `total` diga menos', async () => {
    // Es el caso peligroso: `total` viene truncado en la misma respuesta, así
    // que sin este chequeo `filas_escritas = total_declarado` cerraría sobre un
    // país al que le faltan calles.
    const fuente = fuenteFalsa([respuesta('calles', 14_999, filasFalsas(5_000))]);
    const recorrido = await fuente.recorrer({ recurso: 'calles', inicioDesde: 0 }, async () =>
      Promise.resolve(),
    );
    expect(recorrido.estado).toBe('techo');
  });

  it('una partición normal se recorre entera y entrega sus páginas en orden', async () => {
    const fuente = fuenteFalsa([
      respuesta('calles', 7_000, filasFalsas(5_000)),
      respuesta('calles', 7_000, filasFalsas(2_000, 5_000)),
    ]);
    const inicios: number[] = [];
    const recorrido = await fuente.recorrer({ recurso: 'calles', inicioDesde: 0 }, async (p) => {
      inicios.push(p.inicio);
      return Promise.resolve();
    });
    expect(inicios).toEqual([0, 5_000]);
    expect(recorrido).toMatchObject({ estado: 'completa', total: 7_000, traidas: 7_000 });
  });

  it('una página que no llega deja la partición fallida, con su offset', async () => {
    const fuente = fuenteFalsa([
      respuesta('calles', 7_000, filasFalsas(5_000)),
      { estado: 'sin_respuesta', motivo: 'ECONNRESET' },
    ]);
    const recorrido = await fuente.recorrer({ recurso: 'calles', inicioDesde: 0 }, async () =>
      Promise.resolve(),
    );
    expect(recorrido).toMatchObject({ estado: 'fallida', traidas: 5_000, inicioSiguiente: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// La partición
// ---------------------------------------------------------------------------

describe('la partición del callejero', () => {
  const indice = new Map<string, LugarIndexado>([
    ['06', { id: 1, level: 'province', name: 'Buenos Aires', provinceId: 1, vigenteHasta: null }],
    [
      '06007',
      { id: 2, level: 'department', name: 'Adolfo Alsina', provinceId: 1, vigenteHasta: null },
    ],
    [
      '06003',
      { id: 3, level: 'department', name: 'Almirante Brown', provinceId: 1, vigenteHasta: null },
    ],
    ['14014', { id: 4, level: 'department', name: 'Capital', provinceId: 5, vigenteHasta: null }],
    [
      '06999',
      { id: 5, level: 'department', name: 'Uno viejo', provinceId: 1, vigenteHasta: new Date() },
    ],
    ['0600701', { id: 6, level: 'locality', name: 'Carhué', provinceId: 1, vigenteHasta: null }],
  ]);

  it('es por departamento y sale ordenada, para que dos corridas recorran igual', () => {
    expect(particionesDeCalles(indice).map((p) => p.georefId)).toEqual(['06003', '06007', '14014']);
  });

  it('un departamento retirado no se recorre', () => {
    expect(particionesDeCalles(indice).some((p) => p.georefId === '06999')).toBe(false);
  });

  it('se puede acotar a una provincia sin tocar el resto', () => {
    expect(particionesDeCalles(indice, { provinciaId: 5 }).map((p) => p.nombre)).toEqual([
      'Capital',
    ]);
  });
});

// ---------------------------------------------------------------------------
// La normalización
// ---------------------------------------------------------------------------

describe('la normalización de una calle', () => {
  const calleCruda = (extra: Record<string, unknown>): Record<string, unknown> => ({
    id: '5811204000123',
    nombre: 'AV JOSE MARIA MORENO',
    categoria: 'AV',
    provincia: { id: '58', nombre: 'Neuquén' },
    departamento: { id: '58112', nombre: 'Zapala' },
    localidad_censal: { id: '58112040', nombre: 'Zapala' },
    ...extra,
  });

  const planificar = (extra: Record<string, unknown>) => {
    const lectura = leerCalle(calleCruda(extra));
    if (lectura.estado !== 'leida') throw new Error(`ilegible: ${lectura.motivo}`);
    return planificarCalle({ calle: lectura.calle, indice: indiceBase() });
  };

  it('le saca la categoría al nombre, y sólo por token completo', () => {
    const plan = planificar({ altura: null });
    expect(plan.estado === 'lista' && plan.calle.nombreNorm).toBe('JOSE MARIA MORENO');
    const avellaneda = planificar({ nombre: 'AVELLANEDA', categoria: 'AV', altura: null });
    expect(avellaneda.estado === 'lista' && avellaneda.calle.nombreNorm).toBe('AVELLANEDA');
  });

  it('el `0` de georef es ausencia de rango, no la altura cero', () => {
    // El ejemplo textual de Córdoba: inicio y fin en 0 de los dos lados.
    const plan = planificar({
      altura: { inicio: { derecha: 0, izquierda: 0 }, fin: { derecha: 0, izquierda: 0 } },
    });
    expect(plan.estado === 'lista' && plan.calle.rango).toEqual({ tipo: 'ausente' });
  });

  it('las cuatro alturas se resumen en desde = mínimo y hasta = máximo', () => {
    const plan = planificar({
      altura: { inicio: { derecha: 101, izquierda: 100 }, fin: { derecha: 399, izquierda: 400 } },
    });
    expect(plan.estado === 'lista' && plan.calle.rango).toEqual({
      tipo: 'completo',
      desde: 100,
      hasta: 400,
    });
  });

  it('un rango a medias es `parcialHasta`, y no un rango que arranca en cero', () => {
    const plan = planificar({
      altura: { inicio: { derecha: 0, izquierda: 0 }, fin: { derecha: 3200, izquierda: 0 } },
    });
    expect(plan.estado === 'lista' && plan.calle.rango).toEqual({
      tipo: 'parcialHasta',
      hasta: 3200,
    });
  });

  it('las 30 calles con el rango invertido entran SIN rango, y se cuentan', () => {
    // La fuente se contradice: no se puede saber cuál de los dos números está
    // mal, y afirmar `altura_fuera_de_rango` sobre eso sería inventar. La calle
    // entra igual — sin rango sigue sirviendo para elegirla por nombre.
    const alturas = {
      altura: { inicio: { derecha: 1500, izquierda: 0 }, fin: { derecha: 800, izquierda: 0 } },
    };
    const plan = planificar(alturas);
    expect(plan.estado === 'lista' && plan.calle.rango).toEqual({ tipo: 'ausente' });
    expect(plan.estado === 'lista' && plan.rangoInvertido).toBe(true);
    expect(rangoVieneInvertido({ inicio: [1500], fin: [800] })).toBe(true);
    expect(rangoVieneInvertido({ inicio: [800], fin: [1500] })).toBe(false);
  });

  it('la basura de `categoria` entra: el dominio se descubre, no se decreta', () => {
    for (const categoria of ['301050', 'TIPO', 'LINEA FERREA', 'CURSO DE AGUA']) {
      const plan = planificar({ categoria, nombre: 'ALGO', altura: null });
      expect(plan.estado === 'lista' && plan.calle.categoria).toBe(categoria);
    }
  });

  it('«CALLE SN» es `sin_nombre`: un hecho del Estado, no un vacío', () => {
    expect(claseDelNombre('S N')).toBe('sin_nombre');
    expect(claseDelNombre('SN')).toBe('sin_nombre');
    expect(claseDelNombre('')).toBe('sin_nombre');
    expect(claseDelNombre('MITRE')).toBe('nominada');
    const plan = planificar({ nombre: 'CALLE S N', categoria: 'CALLE', altura: null });
    expect(plan.estado === 'lista' && plan.calle.nombreClase).toBe('sin_nombre');
  });

  it('la localidad sale del payload, no de cortar el id de 13 dígitos', () => {
    // El componente de localidad del id NO reconstruye `localidad_censal.id`.
    const plan = planificar({ localidad_censal: { id: '99999999', nombre: 'Otra' }, altura: null });
    expect(plan.estado).toBe('sin_territorio');
  });

  it('un id que viene como número es ilegible: los ceros a la izquierda se pierden', () => {
    const lectura = leerCalle({ ...calleCruda({}), id: 5_811_204_000_123 });
    expect(lectura.estado).toBe('ilegible');
  });
});

// ---------------------------------------------------------------------------
// La jerarquía y LA DEDUPLICACIÓN
// ---------------------------------------------------------------------------

describe('la jerarquía', () => {
  const crudo = (extra: Record<string, unknown>): Record<string, unknown> => ({
    id: '58112040',
    nombre: 'Zapala',
    provincia: { id: '58', nombre: 'Neuquén' },
    departamento: { id: '58112', nombre: 'Zapala' },
    ...extra,
  });

  const planificar = (
    nivel: 'department' | 'municipality' | 'locality' | 'settlement',
    extra: Record<string, unknown>,
    indice = indiceBase(),
  ) => {
    const lectura = leerLugar(crudo(extra));
    if (lectura.estado !== 'leido') throw new Error(`ilegible: ${lectura.motivo}`);
    return planificarLugar({ nivel, lugar: lectura.lugar, indice });
  };

  it('los 3.349 asentamientos que ya son una localidad censal se deduplican', () => {
    // Testigo real: 58112040, Zapala. El lugar YA entró como `locality`, que es
    // el nivel más informativo. Dos filas para el mismo lugar es exactamente el
    // defecto que `georef_id UNIQUE` vino a cerrar.
    const plan = planificar('settlement', { localidad_censal: { id: '58112040' } });
    expect(plan).toMatchObject({
      estado: 'duplicado',
      georefId: '58112040',
      comoNivel: 'locality',
    });
  });

  it('un asentamiento nuevo cuelga de su localidad censal', () => {
    const plan = planificar('settlement', {
      id: '5811204001',
      nombre: 'Paraje',
      localidad_censal: { id: '58112040' },
    });
    expect(plan.estado === 'listo' && plan.fila.parentId).toBe(3);
    expect(plan.estado === 'listo' && plan.fila.departmentId).toBe(2);
  });

  it('un asentamiento que BAHRA no cuelga de ninguna localidad cae en su departamento', () => {
    const plan = planificar('settlement', { id: '5811204002', nombre: 'Puesto' });
    expect(plan.estado === 'listo' && plan.fila.parentId).toBe(2);
  });

  it('un municipio cuelga de la provincia y NO del departamento (§2.2)', () => {
    const plan = planificar('municipality', { id: '580007', nombre: 'Zapala' });
    expect(plan.estado === 'listo' && plan.fila.parentId).toBe(1);
    expect(plan.estado === 'listo' && plan.fila.departmentId).toBe(null);
  });

  it('sin provincia no entra: no hay unidad territorial argentina sin provincia', () => {
    const plan = planificar('locality', { provincia: { id: '99' } });
    expect(plan).toMatchObject({ estado: 'sin_ancestro' });
  });

  it('una localidad censal SIN departamento cuelga de su provincia: es CABA', () => {
    // El payload real de `02000010`: georef lo entrega con `departamento` en
    // null porque la ciudad no está dentro de ningún departamento. Si esto
    // vuelve a ser huérfana, se van con ella las 3.127 calles de la ciudad, que
    // traen `localidad_censal = 02000010` y a las que `planificarCalle` les
    // exige la localidad.
    const plan = planificar('locality', {
      id: '02000010',
      nombre: 'Ciudad Autónoma de Buenos Aires',
      departamento: { id: null, nombre: null },
    });
    expect(plan.estado).toBe('listo');
    // La provincia es el ancestro real, y `department_id` NULL dice «no tiene»,
    // no «no sé»: no hay un 0 ni un id inventado en el medio.
    expect(plan.estado === 'listo' && plan.fila.parentId).toBe(1);
    expect(plan.estado === 'listo' && plan.fila.departmentId).toBe(null);
  });

  it('una localidad con un departamento que NO tenemos sigue siendo huérfana', () => {
    // La otra mitad de la distinción: «georef no declara departamento» es un
    // hecho sobre CABA; «declara uno que no está en la base» es un agujero en
    // la jerarquía y tiene que seguir doliendo.
    const plan = planificar('locality', { departamento: { id: '58999' } });
    expect(plan).toMatchObject({ estado: 'sin_ancestro', falta: 'departamento 58999' });
  });

  it('una fila idéntica a la que ya está no se reescribe', () => {
    const indice = indiceBase();
    const plan = planificar('locality', { centroide: { lat: -38.9, lon: -70.06 } }, indice);
    expect(plan.estado === 'listo' && plan.cambia).toBe(true);

    // Ahora el índice ya tiene esa misma fila: la segunda pasada no cambia nada.
    if (plan.estado !== 'listo') throw new Error('debería estar lista');
    indice.set('58112040', {
      id: 3,
      level: 'locality',
      name: 'Zapala',
      nameNorm: 'ZAPALA',
      provinceId: 1,
      parentId: 2,
      departmentId: 2,
      municipalityId: null,
      latitude: '-38.900000',
      longitude: '-70.060000',
      vigenteHasta: null,
    });
    const segunda = planificar('locality', { centroide: { lat: -38.9, lon: -70.06 } }, indice);
    expect(segunda.estado === 'listo' && segunda.cambia).toBe(false);
  });

  it('un lugar retirado que vuelve a aparecer se reescribe, y conserva su id', () => {
    const indice = indiceBase();
    indice.set('58112040', {
      id: 3,
      level: 'locality',
      name: 'Zapala',
      nameNorm: 'ZAPALA',
      provinceId: 1,
      parentId: 2,
      departmentId: 2,
      municipalityId: null,
      latitude: null,
      longitude: null,
      vigenteHasta: new Date(),
    });
    const plan = planificar('locality', {}, indice);
    expect(plan.estado === 'listo' && plan.cambia).toBe(true);
    expect(plan.estado === 'listo' && plan.fila.vigenteHasta).toBe(null);
  });

  it('`cambiaElLugar` sobre una fila que no existía siempre dice que sí', () => {
    expect(
      cambiaElLugar(undefined, {
        georefId: 'x',
        level: 'locality',
        name: 'X',
        provinceId: 1,
      }),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// La huella
// ---------------------------------------------------------------------------

describe('la huella de una partición', () => {
  const calle = (nombre: string) => ({
    georefId: '5811204000123',
    localidadId: 3,
    departamentoId: 2,
    provinciaId: 1,
    nombre,
    nombreNorm: nombre,
    nombreClase: 'nominada' as const,
    categoria: 'CALLE',
    rango: { tipo: 'ausente' } as const,
  });

  it('el mismo contenido en otro orden da la misma huella', () => {
    const a = huellaDePagina([lineaDeCalle(calle('MITRE')), lineaDeCalle(calle('SAN MARTIN'))]);
    const b = huellaDePagina([lineaDeCalle(calle('SAN MARTIN')), lineaDeCalle(calle('MITRE'))]);
    expect(a).toBe(b);
  });

  it('un solo campo distinto cambia la huella', () => {
    const a = huellaDePagina([lineaDeCalle(calle('MITRE'))]);
    const b = huellaDePagina([lineaDeCalle({ ...calle('MITRE'), categoria: 'AV' })]);
    expect(a).not.toBe(b);
  });

  it('el orden de las páginas sí cuenta, y eso es lo barato de equivocarse', () => {
    // Un falso «cambió» cuesta un upsert que escribe cero filas. Un falso «no
    // cambió» sería el caro, y no puede pasar: el contenido está adentro.
    expect(huellaDeParticion(['a', 'b'])).not.toBe(huellaDeParticion(['b', 'a']));
  });
});

// ---------------------------------------------------------------------------
// La corrida
// ---------------------------------------------------------------------------

describe('la elección de corrida', () => {
  const ahora = new Date('2026-08-12T15:30:45.123Z');
  /** Hace un rato: adentro de la ventana de reanudación. */
  const recien = new Date('2026-08-12T15:00:00.000Z');

  it('el id ordena cronológicamente y pasa el regex de la ruta del paquete', () => {
    expect(nuevaCorrida(ahora)).toBe('20260812-153045');
    expect(nuevaCorrida(ahora)).toMatch(/^[A-Za-z0-9._:-]+$/);
  });

  it('sin progreso previo, empieza una corrida nueva', () => {
    expect(elegirCorrida({ progresos: [], publicadas: [], ahora })).toEqual({
      tipo: 'nueva',
      corrida: '20260812-153045',
      abandonada: null,
    });
  });

  it('reanuda la última corrida que no llegó a ser vigente', () => {
    const eleccion = elegirCorrida({
      progresos: [
        { corrida: '20260810-000000', estado: 'completa', actualizadoEn: recien },
        { corrida: '20260811-000000', estado: 'completa', actualizadoEn: recien },
        { corrida: '20260811-000000', estado: 'fallida', actualizadoEn: recien },
      ],
      publicadas: ['20260810-000000'],
      ahora,
    });
    expect(eleccion).toEqual({
      tipo: 'reanuda',
      corrida: '20260811-000000',
      pendientes: 1,
      ultimaActividad: recien,
    });
  });

  it('una corrida con todo completo pero sin publicar TAMBIÉN se reanuda', () => {
    // El caso que más duele: el proceso cerró las 535 particiones y se murió
    // justo antes de marcar la versión. Empezar de cero volvería a bajar el país
    // entero para no escribir una sola fila.
    const eleccion = elegirCorrida({
      progresos: [{ corrida: '20260811-000000', estado: 'completa', actualizadoEn: recien }],
      publicadas: [],
      ahora,
    });
    expect(eleccion).toEqual({
      tipo: 'reanuda',
      corrida: '20260811-000000',
      pendientes: 0,
      ultimaActividad: recien,
    });
  });

  it('después de una corrida vigente, la siguiente es nueva', () => {
    const eleccion = elegirCorrida({
      progresos: [{ corrida: '20260811-000000', estado: 'completa', actualizadoEn: recien }],
      publicadas: ['20260811-000000'],
      ahora,
    });
    expect(eleccion.tipo).toBe('nueva');
  });

  /**
   * ── EL CASO MEDIDO, Y ES EL QUE REPORTÓ ÉXITO SIN REPARAR NADA ────────────
   *
   * Publicar, publicar otra vez, y la PRIMERA vuelve a parecer abierta: dejó de
   * ser la vigente y el filtro excluía sólo a la vigente de ese momento. Con
   * todas sus particiones en `completa` es indistinguible de la corrida que la
   * reanudación existe para cubrir. Medido: se borraron 300 calles de La
   * Matanza, el seed reanudó la corrida vieja, tomó el atajo `ya_completa` y
   * reportó éxito con las 300 calles todavía faltando.
   *
   * Las dos siguen en `geo_seed_progreso` y ninguna se borra: lo que cambia es
   * que ninguna de las dos es candidata.
   */
  it('una corrida que YA SE PUBLICÓ no vuelve a ser candidata, ni cuando deja de ser la vigente', () => {
    const eleccion = elegirCorrida({
      progresos: [
        { corrida: '20260811-000000', estado: 'completa', actualizadoEn: recien },
        { corrida: '20260812-000000', estado: 'completa', actualizadoEn: recien },
      ],
      // La primera se publicó y después la segunda la reemplazó: hoy la vigente
      // es la segunda, y la primera ya no es «una corrida abierta».
      publicadas: ['20260811-000000', '20260812-000000'],
      ahora,
    });
    expect(eleccion).toEqual({
      tipo: 'nueva',
      corrida: '20260812-153045',
      abandonada: null,
    });
  });

  it('--corrida=<id> reanuda una publicada igual: es la salida de emergencia', () => {
    const eleccion = elegirCorrida({
      progresos: [{ corrida: '20260811-000000', estado: 'fallida', actualizadoEn: recien }],
      publicadas: ['20260811-000000'],
      pedida: '20260811-000000',
      ahora,
    });
    expect(eleccion).toEqual({
      tipo: 'reanuda',
      corrida: '20260811-000000',
      pendientes: 1,
      ultimaActividad: recien,
    });
  });

  // ── La ventana. Sin esto, una corrida de hace tres meses se «reanuda», no
  //    encuentra nada pendiente y publica el país de mayo fechado hoy.
  it('una corrida vieja NO se reanuda: se empieza una nueva y la vieja queda donde está', () => {
    const haceTresMeses = new Date('2026-05-11T00:00:00.000Z');
    const eleccion = elegirCorrida({
      progresos: [
        { corrida: '20260511-000000', estado: 'completa', actualizadoEn: haceTresMeses },
      ],
      publicadas: [],
      ahora,
    });
    expect(eleccion).toEqual({
      tipo: 'nueva',
      corrida: '20260812-153045',
      abandonada: { corrida: '20260511-000000', ultimaActividad: haceTresMeses },
    });
  });

  it('sin fecha de última actividad tampoco se reanuda: «no sé» no es «dale»', () => {
    const eleccion = elegirCorrida({
      progresos: [{ corrida: '20260811-000000', estado: 'completa', actualizadoEn: null }],
      publicadas: [],
      ahora,
    });
    expect(eleccion.tipo).toBe('nueva');
  });

  it('justo adentro de la ventana sí se reanuda, justo afuera no', () => {
    const progresoA = (cuando: Date): Parameters<typeof elegirCorrida>[0] => ({
      progresos: [{ corrida: '20260811-000000', estado: 'fallida', actualizadoEn: cuando }],
      publicadas: [],
      ahora,
    });
    const justoAdentro = new Date(ahora.getTime() - VENTANA_DE_REANUDACION_MS);
    const justoAfuera = new Date(ahora.getTime() - VENTANA_DE_REANUDACION_MS - 1);
    expect(elegirCorrida(progresoA(justoAdentro)).tipo).toBe('reanuda');
    expect(elegirCorrida(progresoA(justoAfuera)).tipo).toBe('nueva');
  });

  it('--corrida=<id> reanuda una corrida vieja igual: ahí hay una persona pidiéndolo', () => {
    const eleccion = elegirCorrida({
      progresos: [
        { corrida: '20260511-000000', estado: 'fallida', actualizadoEn: new Date('2026-05-11') },
      ],
      publicadas: [],
      pedida: '20260511-000000',
      ahora,
    });
    expect(eleccion.tipo).toBe('reanuda');
  });
});

describe('la fecha de corte sale del nombre de la corrida', () => {
  // Con `new Date()`, una corrida que se reanuda y publica sale fechada hoy
  // sobre datos de otro día.
  it('ida y vuelta con `nuevaCorrida`', () => {
    const ahora = new Date('2026-08-12T15:30:45.000Z');
    expect(fechaDeCorrida(nuevaCorrida(ahora))?.toISOString()).toBe('2026-08-12T15:30:45.000Z');
  });

  it('devuelve null —y nunca una fecha inventada— si el nombre no es uno de los nuestros', () => {
    expect(fechaDeCorrida('ensayo-3')).toBe(null);
    expect(fechaDeCorrida('')).toBe(null);
  });

  it('rechaza una fecha imposible que `Date.UTC` normalizaría en silencio', () => {
    // El 13.º mes existiría como enero del año siguiente sin el ida y vuelta.
    expect(fechaDeCorrida('20261345-996060')).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// La regla de cierre, que es una suma
// ---------------------------------------------------------------------------

describe('cerrar una partición', () => {
  const cuenta = { entraron: 100, duplicados: 0, huerfanas: 0, total: 100 };

  it('cierra cuando la suma da el total declarado', () => {
    expect(cerrarParticion(cuenta, { tolerarHuerfanas: false })).toEqual({
      estado: 'completa',
      motivo: null,
    });
  });

  it('los duplicados cierran sin pedir permiso: son los 3.349 asentamientos', () => {
    const cierre = cerrarParticion(
      { entraron: 11_324, duplicados: 3_349, huerfanas: 0, total: 14_673 },
      { tolerarHuerfanas: false },
    );
    expect(cierre.estado).toBe('completa');
  });

  it('una sola huérfana NO cierra sin la bandera, y el motivo dice cómo salir', () => {
    const cierre = cerrarParticion(
      { entraron: 99, duplicados: 0, huerfanas: 1, total: 100 },
      { tolerarHuerfanas: false },
    );
    expect(cierre.estado).toBe('fallida');
    expect(cierre.motivo).toContain('--tolerar-huerfanas');
  });

  it('con la bandera cierra, y el motivo deja dicho que quedaron afuera', () => {
    const cierre = cerrarParticion(
      { entraron: 99, duplicados: 0, huerfanas: 1, total: 100 },
      { tolerarHuerfanas: true },
    );
    expect(cierre.estado).toBe('completa');
    expect(cierre.motivo).toContain('1');
  });

  it('si la suma no da, NO cierra ni con la bandera: eso es perder filas', () => {
    const cierre = cerrarParticion(
      { entraron: 90, duplicados: 0, huerfanas: 0, total: 100 },
      { tolerarHuerfanas: true },
    );
    expect(cierre.estado).toBe('fallida');
  });
});

// ---------------------------------------------------------------------------
// El salteo por huella, que ahora también mira la base
// ---------------------------------------------------------------------------

describe('saltear una partición', () => {
  it('la jerarquía se saltea sólo si NINGUNA fila cambiaría', () => {
    expect(salteaElNivel({ huellaPrevia: 'h', hash: 'h', filasQueCambian: 0 })).toBe(true);
    expect(salteaElNivel({ huellaPrevia: 'h', hash: 'h', filasQueCambian: 1 })).toBe(false);
  });

  it('la tabla vaciada A MEDIAS no se saltea aunque la huella coincida', () => {
    // 27 localidades sobrevivientes de 4.027: la huella de la FUENTE coincide
    // igual, y antes eso alcanzaba para cerrar `completa` sobre una jerarquía
    // rota.
    expect(salteaElNivel({ huellaPrevia: 'h', hash: 'h', filasQueCambian: 4_000 })).toBe(false);
  });

  it('sin huella previa nunca se saltea', () => {
    expect(salteaElNivel({ huellaPrevia: undefined, hash: 'h', filasQueCambian: 0 })).toBe(false);
  });

  it('las calles se saltean sólo si la tabla tiene exactamente esas filas', () => {
    const base = { huellaPrevia: 'h', hash: 'h' };
    expect(salteaLaParticionDeCalles({ ...base, enTabla: 618, entraran: 618 })).toBe(true);
    expect(salteaLaParticionDeCalles({ ...base, enTabla: 0, entraran: 618 })).toBe(false);
    expect(salteaLaParticionDeCalles({ ...base, enTabla: 617, entraran: 618 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// La completitud, con los dos lados separados
// ---------------------------------------------------------------------------

describe('evaluar la completitud', () => {
  const particion = (sobre: Partial<CompletitudDeParticion> = {}): CompletitudDeParticion => ({
    recurso: 'calles',
    particion: '06007',
    estado: 'completa',
    totalDeclarado: 618,
    filasEscritas: 618,
    enTabla: 618,
    duplicados: 0,
    huerfanas: 0,
    ...sobre,
  });

  it('cierra cuando la tabla tiene lo que la fuente declaró', () => {
    const { rotas, toleradas } = evaluarCompletitud([particion()]);
    expect(rotas).toEqual([]);
    expect(toleradas).toEqual([]);
  });

  // ── ÉSTA es la afirmación que la verificación circular no podía hacer.
  it('LAS FILAS QUE NO LLEGARON A LA TABLA se ven, aunque el seed diga que cerró', () => {
    const rota = particion({ enTabla: 0, estado: 'completa', filasEscritas: 618 });
    const { rotas } = evaluarCompletitud([rota]);
    expect(rotas).toHaveLength(1);
    expect(rotas[0]?.motivo).toContain('faltan 618');
  });

  it('el 4% faltante del país entero no pasa en verde', () => {
    // 529 particiones que dicen «completa» con `filas_escritas = total_declarado`
    // y 21 de ellas sin una sola fila en la tabla.
    const filas = Array.from({ length: 529 }, (_, i) =>
      particion({ particion: String(i).padStart(5, '0'), ...(i < 21 && { enTabla: 0 }) }),
    );
    const { rotas, totales } = evaluarCompletitud(filas);
    expect(rotas).toHaveLength(21);
    expect(totales.declarado - totales.enTabla).toBe(21 * 618);
  });

  it('los duplicados explican la diferencia sin pedir permiso', () => {
    const { rotas, toleradas } = evaluarCompletitud([
      particion({
        recurso: 'asentamientos',
        particion: '00',
        totalDeclarado: 14_673,
        filasEscritas: 14_673,
        enTabla: 11_324,
        duplicados: 3_349,
      }),
    ]);
    expect(rotas).toEqual([]);
    expect(toleradas).toEqual([]);
  });

  it('las huérfanas cierran la suma pero quedan a la vista, aparte', () => {
    const { rotas, toleradas } = evaluarCompletitud([
      particion({ enTabla: 615, huerfanas: 3 }),
    ]);
    expect(rotas).toEqual([]);
    expect(toleradas).toHaveLength(1);
  });

  it('una partición que nunca cerró es una falla, tenga los números que tenga', () => {
    const { rotas } = evaluarCompletitud([particion({ estado: 'en_curso' })]);
    expect(rotas).toHaveLength(1);
  });

  it('sin `total_declarado` no hay contra qué cerrar, y eso también falla', () => {
    const { rotas } = evaluarCompletitud([particion({ totalDeclarado: null })]);
    expect(rotas).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// El gate de publicación
// ---------------------------------------------------------------------------

/**
 * **Que la completitud sepa que faltan filas no sirve de nada si no es ella la
 * que decide publicar.** El 2026-08-11 la corrida declaró 326.832 calles
 * completas, la tabla tenía 323.865, y el catálogo se publicó igual: el gate
 * consultaba la contabilidad de la FUENTE, donde `entraron` es lo planificado.
 */
describe('el gate de publicación lo decide `count(*)` de la tabla', () => {
  const particion = (sobre: Partial<CompletitudDeParticion> = {}): CompletitudDeParticion => ({
    recurso: 'calles',
    particion: '06007',
    estado: 'completa',
    totalDeclarado: 618,
    filasEscritas: 618,
    enTabla: 618,
    duplicados: 0,
    huerfanas: 0,
    ...sobre,
  });

  const decidir = (filas: readonly CompletitudDeParticion[]): ReturnType<typeof decidirPublicacion> =>
    decidirPublicacion(evaluarCompletitud(filas), '20260812-153045');

  it('el camino feliz sigue publicando: la que cierra, cierra', () => {
    expect(decidir([particion(), particion({ particion: '06014' })])).toEqual({ tipo: 'publica' });
  });

  // ── LAS TRES PROPIEDADES DEL BLOQUEANTE, sobre el 1,2% que se publicó ────
  it('la corrida cuya completitud no cierra NO se publica', () => {
    // 529 particiones que dicen `completa` con `filas_escritas = total_declarado`
    // y a cinco de ellas les faltan filas en la tabla: 1,2% del país.
    const filas = Array.from({ length: 529 }, (_, i) =>
      particion({ particion: String(i).padStart(5, '0'), ...(i < 5 && { enTabla: 0 }) }),
    );
    expect(decidir(filas).tipo).toBe('no_publica');
  });

  it('sale con código ≠ 0, y dice cuántas filas faltan y en qué particiones', () => {
    const decision = decidir([
      particion({ particion: '06007', enTabla: 600 }),
      particion({ particion: '06014', enTabla: 0 }),
      particion({ particion: '14014' }),
    ]);
    expect(decision.tipo).toBe('no_publica');
    if (decision.tipo !== 'no_publica') return;

    expect(decision.codigoDeSalida).not.toBe(0);
    expect(decision.faltan).toBe(18 + 618);
    expect(decision.aviso).toContain('faltan 636');
    // Y las nombra: sin los nombres, «faltan 636» no dice dónde volver a mirar.
    expect(decision.aviso).toContain('calles/06007');
    expect(decision.aviso).toContain('calles/06014');
    expect(decision.aviso).not.toContain('calles/14014');
    expect(decision.aviso).toContain('NO se marca vigente');
  });

  it('las huérfanas ya toleradas no vuelven a bloquear: eso ya se decidió', () => {
    expect(decidir([particion({ enTabla: 615, huerfanas: 3 })])).toEqual({ tipo: 'publica' });
  });

  it('una corrida sin UNA SOLA partición anotada no publica: «nada» no es «todo»', () => {
    const decision = decidir([]);
    expect(decision.tipo).toBe('no_publica');
    if (decision.tipo !== 'no_publica') return;
    expect(decision.codigoDeSalida).not.toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Contra qué base se escribe
// ---------------------------------------------------------------------------

describe('elegir el destino de escritura', () => {
  const rama = 'postgresql://u:p@ep-silent-waterfall-aj40sse5-pooler.c-3.aws.neon.tech/neondb';
  const prod = 'postgresql://u:p@ep-flat-art-ajjmw0zc.c-3.aws.neon.tech/neondb';

  it('gana la sin pooler, que es la que una carga larga necesita', () => {
    const destino = elegirDestino({ DATABASE_URL_UNPOOLED: prod, DATABASE_URL: prod });
    expect(destino?.variable).toBe('DATABASE_URL_UNPOOLED');
    expect(destino?.host).toBe('ep-flat-art-ajjmw0zc.c-3.aws.neon.tech');
  });

  // El footgun real: `dotenv` no pisa el ambiente, pero lo hace VARIABLE POR
  // VARIABLE. Exportar sólo `DATABASE_URL` apuntando a una rama efímera deja
  // que `DATABASE_URL_UNPOOLED` siga saliendo del `.env`, o sea de producción.
  it('avisa cuando las dos variables apuntan a bases distintas', () => {
    const destino = elegirDestino({ DATABASE_URL_UNPOOLED: prod, DATABASE_URL: rama });
    expect(destino).not.toBe(null);
    if (destino === null) return;
    expect(destino.host).toBe('ep-flat-art-ajjmw0zc.c-3.aws.neon.tech');
    expect(destino.conflicto?.host).toBe('ep-silent-waterfall-aj40sse5-pooler.c-3.aws.neon.tech');
    expect(AVISO_DE_DESTINO(destino)).toContain('ATENCIÓN');
  });

  it('el `-pooler` de la misma base NO es una discrepancia', () => {
    const conPooler = prod.replace('ajjmw0zc.', 'ajjmw0zc-pooler.');
    const destino = elegirDestino({ DATABASE_URL_UNPOOLED: prod, DATABASE_URL: conPooler });
    expect(destino?.conflicto).toBe(null);
  });

  it('sin ninguna de las dos, no hay destino', () => {
    expect(elegirDestino({})).toBe(null);
  });
});

describe('la línea de comandos', () => {
  it('en seco por defecto', () => {
    expect(leerOpciones([]).aplicar).toBe(false);
    expect(leerOpciones(['--aplicar']).aplicar).toBe(true);
  });

  it('una opción mal tipeada se junta y no se ignora', () => {
    // Un `--aplicarr` que corriera igual haría un simulacro que alguien va a
    // leer como una siembra hecha.
    expect(leerOpciones(['--aplicarr']).desconocidas).toEqual(['--aplicarr']);
    expect(leerOpciones(['--aplicar', '--provincia=6']).desconocidas).toEqual([]);
  });

  it('lee los valores con nombre', () => {
    const opciones = leerOpciones(['--corrida=20260812-000000', '--provincia=6', '--pausa-ms=0']);
    expect(opciones.corrida).toBe('20260812-000000');
    expect(opciones.provinciaId).toBe(6);
    expect(opciones.pausaMs).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// La huella no puede colisionar por concatenación
// ---------------------------------------------------------------------------

describe('la línea canónica separa sus campos', () => {
  const calle = (sobre: Partial<CalleParaSembrar>): CalleParaSembrar => ({
    georefId: '5811204000123',
    localidadId: 3,
    departamentoId: 2,
    provinciaId: 1,
    nombre: 'SAN MARTIN',
    nombreNorm: 'SAN MARTIN',
    nombreClase: 'nominada',
    categoria: 'CALLE',
    rango: { tipo: 'ausente' },
    ...sobre,
  });

  /**
   * Con `.join('')` estos dos estados dan la MISMA línea, y por lo tanto la
   * misma huella de partición. Y la huella decide SALTEAR: la colisión no
   * devuelve un resultado raro, deja 618 calles sin mirar y cierra en verde.
   */
  it('dos estados distintos que concatenan igual dan huellas distintas', () => {
    const a = lineaDeCalle(calle({ nombre: 'SAN MARTIN 1', nombreNorm: '00' }));
    const b = lineaDeCalle(calle({ nombre: 'SAN MARTIN', nombreNorm: '100' }));
    expect(a).not.toBe(b);
    expect(huellaDePagina([a])).not.toBe(huellaDePagina([b]));
  });

  it('el corrimiento entre id y localidad tampoco colisiona', () => {
    const a = lineaDeCalle(calle({ georefId: '5811204000123', localidadId: 45 }));
    const b = lineaDeCalle(calle({ georefId: '581120400012', localidadId: 345 }));
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// La deduplicación, antes de que la sentencia la vea
// ---------------------------------------------------------------------------

describe('deduplicar por georef_id', () => {
  const fila = (georefId: string, nombre = 'X'): { georefId: string; nombre: string } => ({
    georefId,
    nombre,
  });

  /**
   * Dos filas iguales adentro del mismo `INSERT … ON CONFLICT DO UPDATE` son el
   * error 21000 de Postgres: no falla la fila, **falla la corrida entera**.
   */
  it('deja una sola por id y cuenta las repeticiones', () => {
    const { unicas, duplicados } = deduplicarPorGeorefId([
      fila('a', 'primera'),
      fila('b'),
      fila('a', 'segunda'),
      fila('a', 'tercera'),
    ]);
    expect(unicas.map((f) => f.georefId)).toEqual(['a', 'b']);
    expect(duplicados).toEqual(['a', 'a']);
  });

  it('gana la primera, que es la que la fuente entregó primero', () => {
    const { unicas } = deduplicarPorGeorefId([fila('a', 'primera'), fila('a', 'segunda')]);
    expect(unicas[0]?.nombre).toBe('primera');
  });

  it('sin repetidas no toca nada', () => {
    const { unicas, duplicados } = deduplicarPorGeorefId([fila('a'), fila('b'), fila('c')]);
    expect(unicas).toHaveLength(3);
    expect(duplicados).toEqual([]);
  });

  /** La suma de la partición tiene que seguir cerrando contra el total declarado. */
  it('únicas + duplicados es siempre lo que la fuente entregó', () => {
    const entregadas = [fila('a'), fila('a'), fila('b'), fila('c'), fila('c'), fila('c')];
    const { unicas, duplicados } = deduplicarPorGeorefId(entregadas);
    expect(unicas.length + duplicados.length).toBe(entregadas.length);
  });
});

// ---------------------------------------------------------------------------
// Los cuatro índices de `geo_calles`
// ---------------------------------------------------------------------------

describe('el padrón de índices de geo_calles', () => {
  const TODOS = INDICES_ESPERADOS_DE_CALLES.map((i) => i.nombre);

  it('son los tres btree del autocompletado MÁS el unique de la identidad', () => {
    expect(TODOS).toEqual([
      'geo_calles_localidad_nombre_idx',
      'geo_calles_departamento_nombre_idx',
      'geo_calles_provincia_nombre_idx',
      'geo_calles_georef_unique',
    ]);
  });

  it('con los cuatro presentes no falta ninguno', () => {
    expect(faltantesDeIndices(new Set(TODOS))).toEqual([]);
  });

  /**
   * El escenario real: un SIGKILL no ejecuta el `finally` que repone los btree.
   * Sin esta afirmación, «la verificación pasa» con el país entero en seq scan.
   */
  it('el que falta se nombra y viene con la sentencia que lo repone', () => {
    const sinLosBtree = faltantesDeIndices(new Set(['geo_calles_georef_unique']));
    expect(sinLosBtree.map((i) => i.nombre)).toEqual([
      'geo_calles_localidad_nombre_idx',
      'geo_calles_departamento_nombre_idx',
      'geo_calles_provincia_nombre_idx',
    ]);
    for (const indice of sinLosBtree) expect(indice.crear).toMatch(/^CREATE INDEX IF NOT EXISTS/);
  });

  it('el unique también se afirma, y es el que el seed NUNCA baja', () => {
    const faltan = faltantesDeIndices(new Set<string>());
    expect(faltan.map((i) => i.nombre)).toContain('geo_calles_georef_unique');
    expect(faltan.find((i) => i.nombre === 'geo_calles_georef_unique')?.crear).toMatch(
      /^CREATE UNIQUE INDEX/,
    );
  });
});

// ---------------------------------------------------------------------------
// Las anotaciones de `geo_seed_progreso`
// ---------------------------------------------------------------------------

describe('las anotaciones no se confunden con particiones', () => {
  it('una partición de calles es un id de departamento y nada más', () => {
    expect(esAnotacion('06007')).toBe(false);
    expect(esAnotacion('00')).toBe(false);
  });

  it('las dos anotaciones se reconocen por su sufijo', () => {
    expect(esAnotacion(`06007${SUFIJO_DUPLICADOS}`)).toBe(true);
    expect(esAnotacion(`00${SUFIJO_HUERFANAS}`)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Las dos banderas nuevas
// ---------------------------------------------------------------------------

describe('las banderas de índices y de huérfanas', () => {
  it('el default baja los índices: el camino recomendado es el del presupuesto', () => {
    expect(leerOpciones(['--aplicar']).conservarIndices).toBe(false);
    expect(leerOpciones(['--aplicar', '--conservar-indices']).conservarIndices).toBe(true);
  });

  it('tolerar huérfanas es explícito y nunca el default', () => {
    expect(leerOpciones(['--aplicar']).tolerarHuerfanas).toBe(false);
    expect(leerOpciones(['--aplicar', '--tolerar-huerfanas']).tolerarHuerfanas).toBe(true);
  });

  it('la bandera vieja `--rehacer-indices` ya no existe y no se ignora en silencio', () => {
    expect(leerOpciones(['--rehacer-indices']).desconocidas).toEqual(['--rehacer-indices']);
  });
});
