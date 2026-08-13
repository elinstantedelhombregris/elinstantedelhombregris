/**
 * El ensamblado de La Radiografía: de filas a constelación.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §3, §4.5, §6.
 *
 * Acá no se mide nada. Todo lo que es medición —similitud, k-NN, componentes
 * conexas al umbral, frase del centro, los dos más lejanos— vive en
 * `@v2/civic-core/radiografia`, se prueba sin levantar nada y no sabe que
 * existe un HTTP. Este archivo lee por el puerto, llama al motor en orden, y
 * arma la forma que la página consume.
 *
 * Las tres cosas que este archivo existe para no equivocar:
 *
 * 1. **Nada se pierde en silencio.** `analizadas + sinVector === total` es un
 *    invariante, no una coincidencia: una señal sin vector no desaparece del
 *    conteo, se declara «esperando análisis» (§3.2, §6, y la guarda del
 *    conteo de §11).
 * 2. **Los kilómetros salen del punto engrosado** (R13). Eso lo hace
 *    `puntoPublicable` en `lectura.ts`, que es la única puerta por la que sale
 *    una coordenada; acá ya no hay coordenada cruda que usar mal.
 * 3. **La frase de un núcleo sólo puede salir de una fila con cesión de
 *    licencia** (§4.5.4). Hoy ninguna la tiene, y el resultado es honesto y
 *    feo: los núcleos existen, se cuentan, se miden y se ordenan, y donde va
 *    la frase va el motivo por el que no está.
 */
import {
  PROVINCIAS_CANONICAS,
  aristasMedidas,
  dosMasLejanos,
  fraseDelNucleo,
  nucleosAlUmbral,
} from '@v2/civic-core';

import { centrosDelCielo, miembrosDelNucleo, puntoDeVozSola } from './constelacion.js';

import type { ClaseProvisional } from './clase-provisional.js';
import type { FuenteDeRadiografia, VozDelCorpus } from './lectura.js';
import type { ConsultaRadiografia } from './validation.js';
import type { Punto3, SenalParaNucleo } from '@v2/civic-core';

/**
 * El motivo, palabra por palabra, con el que el volcado del registro público
 * omite un texto (`docs/specs/2026-08-11-d-el-registro-publico.md` §2.8). Se
 * repite acá **el mismo string** a propósito: dos superficies que omiten lo
 * mismo por la misma razón tienen que decirlo igual.
 *
 * TODO: cuando la spec B escriba la columna de cesión sobre la tabla de texto
 * y D exporte `texto`, `textoDeLaSenal` deja de ser `null` y estos núcleos
 * empiezan a tener etiqueta. Hasta entonces esto no es un bug.
 * Ver `docs/specs/2026-08-12-la-radiografia.md` §4.5.4 y §8.
 */
export const TEXTO_OMITIDO = 'sin cesión de licencia';

/**
 * El texto que una voz puede prestar como etiqueta de núcleo.
 *
 * Devuelve `null` para **toda** fila, porque la columna de cesión de licencia
 * todavía no existe en el corpus de hoy y una fila sin cesión no presta su
 * frase aunque sea la más cercana al centroide. Es una función y no un literal
 * pegado en el `map` para que el día que la columna exista se cambie un cuerpo
 * de una línea y no se salga a buscar dónde estaba el `null`.
 */
const textoDeLaSenal = (_voz: VozDelCorpus): string | null => null;

export interface MiembroPublico {
  id: string;
  clase: ClaseProvisional;
  x: number;
  y: number;
  z: number;
}

export interface NucleoPublico {
  id: string;
  frase: { id: string; texto: string } | null;
  /** El motivo, cuando no hay frase. `null` cuando sí la hay. */
  textoOmitido: string | null;
  senales: number;
  clases: Record<string, number>;
  provincias: number;
  distancia: { a: string; b: string; km: number } | null;
  miembros: MiembroPublico[];
}

export interface AristaPublica {
  a: string;
  b: string;
  similitud: number;
  /**
   * `'medida'` la infirió la máquina desde los vectores; `'declarada'` la
   * afirmó una persona (R6). **Hoy sólo hay medidas**: las declaradas salen de
   * `adhesiones`, que es de la spec B y todavía no existe. Nunca se mezclan en
   * un mismo trazo.
   */
  tipo: 'medida' | 'declarada';
}

export interface RadiografiaPublica {
  /** El corte de la última corrida del job. Única fuente de frescura (R4). */
  corte: string | null;
  modelo: string | null;
  analizadas: number;
  sinVector: number;
  total: number;
  provinciasSinSenal: number;
  umbral: number;
  nucleos: NucleoPublico[];
  solas: MiembroPublico[];
  aristas: AristaPublica[];
}

const contarClases = (voces: readonly VozDelCorpus[]): Record<string, number> => {
  const cuenta: Record<string, number> = {};
  for (const voz of voces) cuenta[voz.clase] = (cuenta[voz.clase] ?? 0) + 1;
  return cuenta;
};

const contarProvincias = (voces: readonly VozDelCorpus[]): number =>
  new Set(voces.map((v) => v.provinciaId).filter((id): id is number => id !== null)).size;

const ORIGEN: Punto3 = { x: 0, y: 0, z: 0 };

export async function construirRadiografia(
  fuente: FuenteDeRadiografia,
  consulta: ConsultaRadiografia,
): Promise<RadiografiaPublica> {
  const { umbral, k } = consulta;

  // El orden importa: la corrida manda. Sin corrida no se leen vectores —
  // mezclar modelos mezcla dimensiones, y la página declara la procedencia de
  // lo que muestra o no muestra nada (R4).
  const corrida = await fuente.corrida();
  const voces = await fuente.voces();
  const vectores = corrida
    ? await fuente.vectores(corrida.modelo)
    : new Map<string, readonly number[]>();

  const porId = new Map(voces.map((voz) => [voz.id, voz]));
  const conVector = voces.filter((voz) => vectores.has(voz.id));

  const paraElMotor = new Map<string, readonly number[]>(
    conVector.map((voz) => [voz.id, vectores.get(voz.id) ?? []]),
  );

  const medidas = aristasMedidas(paraElMotor, k);
  const particion = nucleosAlUmbral(
    conVector.map((voz) => voz.id),
    medidas,
    umbral,
  );

  const centros = centrosDelCielo(particion.nucleos.length, particion.solas.length);

  const senalParaNucleo = (id: string): SenalParaNucleo | null => {
    const voz = porId.get(id);
    if (!voz) return null;
    return {
      id,
      vector: vectores.get(id) ?? [],
      texto: textoDeLaSenal(voz),
      punto: voz.punto,
    };
  };

  const nucleos: NucleoPublico[] = particion.nucleos.map((nucleo, i) => {
    const centro = centros[i] ?? ORIGEN;
    const lugares = miembrosDelNucleo(centro, nucleo.ids.length);
    const vocesDelNucleo = nucleo.ids
      .map((id) => porId.get(id))
      .filter((voz): voz is VozDelCorpus => voz !== undefined);
    const senales = nucleo.ids
      .map(senalParaNucleo)
      .filter((s): s is SenalParaNucleo => s !== null);

    const frase = fraseDelNucleo(senales);

    return {
      // El id del núcleo sale de su miembro menor —`nucleo.ids` ya viene
      // ordenado— y no de un contador: con un contador, mover el umbral un
      // paso renumera todo y el navegador pierde de vista el núcleo que el
      // lector estaba mirando.
      id: `nucleo:${nucleo.ids[0] ?? String(i)}`,
      frase,
      textoOmitido: frase === null ? TEXTO_OMITIDO : null,
      senales: nucleo.ids.length,
      clases: contarClases(vocesDelNucleo),
      provincias: contarProvincias(vocesDelNucleo),
      distancia: dosMasLejanos(senales),
      miembros: nucleo.ids.map((id, j) => {
        const lugar = lugares[j] ?? centro;
        return {
          id,
          clase: porId.get(id)?.clase ?? 'hecho',
          x: lugar.x,
          y: lugar.y,
          z: lugar.z,
        };
      }),
    };
  });

  const solas: MiembroPublico[] = particion.solas.map((id, j) => {
    const lugar = puntoDeVozSola(centros[particion.nucleos.length + j] ?? ORIGEN);
    return { id, clase: porId.get(id)?.clase ?? 'hecho', x: lugar.x, y: lugar.y, z: lugar.z };
  });

  /*
   * Sólo las aristas VISIBLES al umbral que el lector eligió. Devolver también
   * las de abajo dibujaría un grafo distinto del que se midió, y la spec R5 es
   * exactamente eso: la métrica y el dibujo son el mismo objeto, no hay dos
   * verdades que puedan discrepar.
   */
  const aristas: AristaPublica[] = medidas
    .filter((arista) => arista.similitud >= umbral)
    .map((arista) => ({
      a: arista.a,
      b: arista.b,
      similitud: Number(arista.similitud.toFixed(4)),
      tipo: 'medida' as const,
    }))
    .sort((p, q) => q.similitud - p.similitud || p.a.localeCompare(q.a) || p.b.localeCompare(q.b));

  return {
    corte: corrida?.corte ?? null,
    modelo: corrida?.modelo ?? null,
    analizadas: conVector.length,
    // Por resta y no por otro conteo: dos conteos de lo mismo son dos números
    // que pueden discrepar, y el invariante del §11 dejaría de ser un
    // invariante para pasar a ser una esperanza.
    sinVector: voces.length - conVector.length,
    total: voces.length,
    provinciasSinSenal: Math.max(0, PROVINCIAS_CANONICAS.length - contarProvincias(voces)),
    umbral,
    nucleos,
    solas,
    aristas,
  };
}
