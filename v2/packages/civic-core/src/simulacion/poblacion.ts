/**
 * La población del modo gente — spec §3.8.
 *
 * Acá están **la forma y la huella**, no la generación ni la dinámica: generar
 * personas es un script local contra Ollama (rebanada 4) y hacerlas hablar es
 * `modo-gente.ts` (rebanada 5). Los tipos viven igual desde ahora porque son lo
 * que hace real la firma del `Modo` y lo que le da a `SelloDelModelo` una
 * `poblacionHuella` que signifique algo.
 *
 * Tres bloques separados a propósito, porque cada uno tiene un consumidor y un
 * costo distintos, y la separación no es prolijidad: es lo que hace que un
 * elenco de 1.000 personas pese 46,9 KB de conducta —lo único que la dinámica
 * lee— mientras las semblanzas, ~1,8 MB, van en shards pedidos bajo demanda.
 * **La dinámica no necesita el texto.**
 *
 * Y qué memoria tiene una persona, dicho en vez de prometido: **ninguna** en el
 * sentido que promete MiroFish. La memoria inicial es prosa dentro de la
 * semblanza; durante la función su estado son cuatro números; no hay almacén
 * vectorial. Lo que se guarda de la corrida se llama `rastro_funcion` y es lo
 * que es —nadie lo lee durante la corrida—, no `memoria`.
 */

import { TIPOS_SENAL } from '../senal/vocabulario.js';

import { acumularHuella, huellaHex, SEMILLA_FNV } from './espina/azar.js';

import type { SelloDelModelo } from './procedencia.js';
import type { ClaseSenal, TipoSenal } from '../senal/vocabulario.js';

/**
 * Hasta dónde mira una persona. Es lo que acota la dinámica a O(N · grado) —
 * el recomendador de OASIS pero territorial en vez de viral—, y por eso una
 * función cuesta milisegundos y no horas.
 */
export type RadioAtencion = 'cuadra' | 'barrio' | 'municipio' | 'provincia' | 'pais';

/**
 * Lo único que la dinámica lee. ~48 bytes por persona, serializado.
 *
 * La regla dura, que es la vacuna contra las trece perillas de utilería que
 * MiroFish genera y no lee nadie: **todo campo que la dinámica no lee, no
 * existe**, y hay un test que mueve cada campo por separado y falla si el
 * resultado no cambia.
 */
export interface Conducta {
  readonly propension: number;
  readonly constanciaPersonal: number;
  readonly umbralAdhesion: number;
  readonly umbralCorroboracion: number;
  readonly radioAtencion: RadioAtencion;
  readonly mezclaTipos: Readonly<Record<TipoSenal, number>>;
  /** Índices de otras personas del mismo elenco. */
  readonly vinculos: readonly number[];
}

/** La textura, que la dinámica NO toca. ~1,9 KB por persona. */
export interface Semblanza {
  readonly texto: string;
  readonly oficio: string;
  readonly tramoEdad: string;
  readonly arraigoAnios: number;
  readonly frases: readonly { tipo: TipoSenal; clase: ClaseSenal; texto: string }[];
}

export interface Persona {
  readonly id: number;
  /**
   * De qué documento salió, con el sha del archivo — el `source_entity_uuid` de
   * MiroFish hecho honesto. El corpus semilla es **exclusivamente propio del
   * proyecto** (los PLANes, los ensayos, el blog), nunca texto que escribió
   * gente real: eso sería un uso que la línea de consentimiento no cubre, y no
   * se arregla con un aviso (regla 9).
   */
  readonly origen: { documento: string; ancla: string; sha: string };
  readonly territorio: {
    /** La clave con la que la cosecha agrupa: el mismo id que `Territorio.id`. */
    territorioId: string;
    provinciaId: number;
    departamentoId: number | null;
    localidadId: number | null;
    celdaId: string;
  };
  readonly conducta: Conducta;
  readonly semblanza: Semblanza;
}

export interface Poblacion {
  /** La huella del elenco congelado. Viaja con cada resultado del barrido. */
  readonly huella: string;
  readonly personas: readonly Persona[];
  /** El elenco del que se derivó éste al editarlo, si hubo uno (regla 6). */
  readonly padre: string | null;
  /**
   * De qué modelo salió este elenco. `null` cuando lo escribió una regla y no
   * un modelo —el elenco fabricado que corre en CI—, y esa distinción es la que
   * decide si la cosecha sale con autoridad `declarada` o `hipotesis`. No se
   * inventa un sello para uniformar: un sello falso es peor que ninguno.
   */
  readonly sello: SelloDelModelo | null;
}

/**
 * La huella de un elenco: sólo la CONDUCTA y el territorio, nunca el texto.
 *
 * Es deliberado y es lo que hace que la huella signifique lo correcto. Editar
 * una semblanza no cambia una sola voz de la cosecha —la dinámica no lee el
 * texto—, así que dos elencos con la misma conducta **son** el mismo elenco
 * para un barrido. Si el texto entrara en la huella, corregir una tilde
 * invalidaría un barrido de mil corridas sin cambiar un número.
 *
 * **Todo lo que entra, entra en un orden que no depende de cómo se construyó el
 * objeto**: las personas por `id`, y la mezcla por `TIPOS_SENAL`. Lo segundo no
 * es simetría por prolijidad, es un bug real que ya estaba: `mezcla_tipos` se
 * guarda en `jsonb`, y `jsonb` reordena las claves por (longitud en bytes,
 * después bytes). Entra
 * `basta, necesidad, recurso, práctica, saber, sueño, propuesta, compromiso, pregunta`
 * y sale
 * `basta, saber, sueño, recurso, pregunta, necesidad, propuesta, práctica, compromiso`.
 * Hasheando en orden de inserción, **un elenco escrito en la base y leído de
 * vuelta perdía su identidad**: la misma conducta daba otra huella, y el worker
 * abortaba con «Alguien editó el archivo» sobre un elenco que nadie tocó.
 *
 * Las claves se recorren desde el vocabulario y no desde el objeto por la otra
 * mitad del mismo motivo: una mezcla a la que le falte un tipo rompe acá, en
 * vez de hashear ocho claves y quedar indistinguible de otra mezcla distinta.
 */
export function huellaDePoblacion(personas: readonly Persona[]): string {
  let h = acumularHuella(SEMILLA_FNV, `n=${String(personas.length)}|`);
  const ordenadas = [...personas].sort((a, b) => a.id - b.id);
  for (const p of ordenadas) {
    const c = p.conducta;
    h = acumularHuella(
      h,
      `${String(p.id)}:${p.territorio.territorioId}:${p.territorio.celdaId}:` +
        `${c.propension.toFixed(6)}:${c.constanciaPersonal.toFixed(6)}:` +
        `${c.umbralAdhesion.toFixed(6)}:${c.umbralCorroboracion.toFixed(6)}:` +
        `${c.radioAtencion}:${c.vinculos.join(',')};`,
    );
    for (const tipo of TIPOS_SENAL) {
      h = acumularHuella(h, `${tipo}=${c.mezclaTipos[tipo].toFixed(6)},`);
    }
  }
  return huellaHex(h);
}
