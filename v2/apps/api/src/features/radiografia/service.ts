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
 *    licencia** (§4.5.4). Quién puede prestarla no lo decide este archivo: lo
 *    decide `textoPublicable()` de `@v2/shared`, la misma regla ejecutable que
 *    gobierna el volcado del registro público. Donde no hay cesión no hay
 *    frase, y en su lugar va el motivo por el que no está.
 */
import {
  PROVINCIAS_CANONICAS,
  aristasMedidas,
  dosMasLejanos,
  fraseDelNucleo,
  nucleosAlUmbral,
} from '@v2/civic-core';
import { MOTIVO_TEXTO_OMITIDO, textoPublicable } from '@v2/shared';

import { centrosDelCielo, miembrosDelNucleo, puntoDeVozSola } from './constelacion.js';

import type { FuenteDeRadiografia, VozDelCorpus } from './lectura.js';
import type { ConsultaRadiografia } from './validation.js';
import type { Punto3, SenalParaNucleo } from '@v2/civic-core';

/**
 * El texto que una voz puede prestar como etiqueta de núcleo.
 *
 * **No hay una segunda redacción de la regla acá.** `textoPublicable` es la
 * versión ejecutable de §2.8 del registro público, y llamarla es lo que impide
 * que dos superficies que omiten lo mismo por la misma razón lo decidan con dos
 * condiciones escritas a mano que un día divergen. Una fila sin cesión no
 * presta su frase aunque sea la más cercana al centroide.
 */
const textoDeLaSenal = (voz: VozDelCorpus): string | null =>
  textoPublicable({ texto: voz.texto, cesionLicencia: voz.cesionLicencia }).texto;

export interface MiembroPublico {
  id: string;
  /** La clase tal cual la columna. Ver `VozDelCorpus.clase` en `lectura.ts`. */
  clase: string;
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

/**
 * Cuando `n <= k + 1` el grafo k-NN es COMPLETO POR CONSTRUCCIÓN: cada señal
 * es vecina de todas las demás, así que la partición en núcleos no depende del
 * contenido. Publicarla como medición sin decirlo es la regla 11 rota por
 * álgebra. `null` cuando no aplica.
 */
export interface RegimenDegenerado {
  readonly n: number;
  readonly k: number;
}

/**
 * El aviso, cuando corresponde.
 *
 * `n` son las señales que **entraron al grafo** —las que tienen vector—, no el
 * total del corpus: las que esperan análisis no tienen vecinas ni pueden
 * tenerlas.
 *
 * El piso de `n >= 2` no está de adorno y es la única parte que no se lee
 * directo del contrato: con cero o una señal no hay ningún par cuya adyacencia
 * pudiera haber dependido del contenido, no hay partición publicada y la
 * pantalla ya muestra el vacío diseñado. Declarar «el grafo es completo» sobre
 * un cielo sin estrellas sería un aviso verdadero sobre nada, encima del único
 * lugar de la página donde el silencio ya es el dato.
 */
const regimenDegenerado = (n: number, k: number): RegimenDegenerado | null =>
  n >= 2 && n <= k + 1 ? { n, k } : null;

export interface RadiografiaPublica {
  /**
   * De qué tabla salió esto, por su nombre. Se declara al lado del modelo y
   * por el mismo motivo (R4): una constelación sin procedencia es un dibujo.
   */
  corpus: string;
  /** El corte de la última corrida del job. Única fuente de frescura (R4). */
  corte: string | null;
  modelo: string | null;
  analizadas: number;
  sinVector: number;
  total: number;
  provinciasSinSenal: number;
  umbral: number;
  /** Ver `RegimenDegenerado`. `null` cuando la partición sí depende del texto. */
  regimenDegenerado: RegimenDegenerado | null;
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
      textoOmitido: frase === null ? MOTIVO_TEXTO_OMITIDO : null,
      senales: nucleo.ids.length,
      clases: contarClases(vocesDelNucleo),
      provincias: contarProvincias(vocesDelNucleo),
      distancia: dosMasLejanos(senales),
      // Los miembros salen de las VOCES y no de los ids: así la clase es la
      // que trajo la fila, sin un `?? 'hecho'` que le inventara una clase
      // —«esto se corrobora»— a una voz que no encontramos. `vocesDelNucleo`
      // conserva el orden de `nucleo.ids` y tiene su mismo largo, porque todo
      // id de la partición salió de una voz con vector.
      miembros: vocesDelNucleo.map((voz, j) => {
        const lugar = lugares[j] ?? centro;
        return { id: voz.id, clase: voz.clase, x: lugar.x, y: lugar.y, z: lugar.z };
      }),
    };
  });

  const solas: MiembroPublico[] = particion.solas
    .map((id) => porId.get(id))
    .filter((voz): voz is VozDelCorpus => voz !== undefined)
    .map((voz, j) => {
      const lugar = puntoDeVozSola(centros[particion.nucleos.length + j] ?? ORIGEN);
      return { id: voz.id, clase: voz.clase, x: lugar.x, y: lugar.y, z: lugar.z };
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
    corpus: fuente.corpus,
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
    regimenDegenerado: regimenDegenerado(conVector.length, k),
    nucleos,
    solas,
    aristas,
  };
}
