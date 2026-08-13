import { esferaDeFibonacci, espiralAurea, nucleosAlUmbral } from '@v2/civic-core';

import { type NucleoEnPantalla } from './radiografia-data';

import type { AristaMedida } from '@v2/civic-core';
import type { MiembroDeNucleo, NucleoPublico, RadiografiaPublica } from '~/lib/queries/radiografia';

/**
 * El recálculo de los núcleos en el navegador.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` R5, R7, §4.5.
 *
 * El deslizador de umbral es el mando principal de la página, y un mando que
 * espera un viaje al servidor en cada milímetro no es un mando. Acá se corta
 * el mismo grafo con la **misma** función de `@v2/civic-core` que usa el
 * servidor —`nucleosAlUmbral`—, así la métrica y el dibujo no pueden discrepar
 * (R5). Lo que el navegador no puede saber, no lo inventa: lo declara.
 */

/**
 * De dónde sale lo que se está viendo. **Tres estados y no dos**, y el tercero
 * existe por un detalle del servidor que no se puede ignorar sin mentir.
 *
 * El endpoint devuelve **sólo las aristas visibles a su propio umbral**
 * (`aristas.filter(a => a.similitud >= umbral)` en su servicio). Entonces:
 *
 * - **`medido`** — el lector está en el corte que el servidor midió. Es la
 *   partición del servidor, tal cual (R5).
 * - **`recalculado`** — el lector SUBIÓ el umbral. Todas las aristas que hacen
 *   falta para ese corte —las de similitud ≥ umbral— están en la mano, porque
 *   son un subconjunto de las que llegaron. El recálculo es **exacto**: le
 *   faltan las provincias y los kilómetros, que los mide el servidor, y nada más.
 * - **`esperando`** — el lector BAJÓ el umbral. Las aristas que fundirían las
 *   islas se quedaron del otro lado del filtro del servidor y el navegador no
 *   las tiene. Recalcular acá daría **más islas de las que hay**, o sea una
 *   afirmación falsa presentada como medición. Se muestra lo último medido y
 *   se dice que se está esperando.
 */
export type OrigenDeLaVista = 'medido' | 'recalculado' | 'esperando';

export interface VistaDeRadiografia {
  nucleos: NucleoEnPantalla[];
  solas: MiembroDeNucleo[];
  origen: OrigenDeLaVista;
}

/** Radio del disco donde se acomodan las señales de un núcleo (φ, §5.6). */
const RADIO_DE_NUCLEO = 0.18;

/**
 * Los núcleos al umbral que el lector tiene en la mano.
 *
 * Si coincide con el que midió el servidor, se devuelve tal cual: **la métrica
 * y el dibujo son el mismo objeto** (R5), y nada que se calcule acá puede
 * discrepar de lo que dice la lista. Si el lector subió el umbral, se corta el
 * mismo grafo con la misma función de `@v2/civic-core` que usó el servidor,
 * para que las islas se partan mientras arrastra y no cuando suelta. Si lo
 * bajó, se espera — ver `OrigenDeLaVista`.
 */
export function construirVista(
  datos: RadiografiaPublica | undefined,
  umbral: number,
): VistaDeRadiografia {
  if (!datos) return { nucleos: [], solas: [], origen: 'medido' };
  if (Math.abs(datos.umbral - umbral) < 1e-9) {
    return { nucleos: datos.nucleos, solas: datos.solas, origen: 'medido' };
  }
  // Bajar el umbral pide aristas que el servidor no mandó. Mostrar lo último
  // medido y decirlo es honesto; recalcular con un grafo incompleto sería
  // publicar más islas de las que hay como si fueran una medición.
  if (umbral < datos.umbral) {
    return { nucleos: datos.nucleos, solas: datos.solas, origen: 'esperando' };
  }

  const porId = new Map<string, MiembroDeNucleo>();
  for (const nucleo of datos.nucleos) for (const m of nucleo.miembros) porId.set(m.id, m);
  for (const sola of datos.solas) porId.set(sola.id, sola);

  // El corte se hace SÓLO sobre las aristas medidas. Una declarada es la
  // afirmación de una persona, no una medición de parecido: se dibuja (R6) y
  // no funde dos núcleos, porque «a mí me importan las dos» no es «las dos
  // dicen lo mismo».
  const medidas: AristaMedida[] = datos.aristas
    .filter((a) => a.tipo === 'medida')
    .map((a) => ({ a: a.a, b: a.b, similitud: a.similitud }));

  const particion = nucleosAlUmbral([...porId.keys()], medidas, umbral);
  const centros = esferaDeFibonacci(particion.nucleos.length);

  // La frase la escribió una persona y sigue siendo suya: un núcleo
  // recalculado sólo puede quedarse con la frase de un núcleo del servidor
  // cuya señal etiqueta esté adentro. Si no hay ninguna, va sin frase — nunca
  // se inventa una ni se hereda la del vecino.
  const fraseDe = new Map<string, NucleoPublico['frase']>();
  for (const n of datos.nucleos) if (n.frase) fraseDe.set(n.frase.id, n.frase);

  const nucleos: NucleoEnPantalla[] = particion.nucleos.map((nucleo, i) => {
    const centro = centros[i] ?? { x: 0, y: 0, z: 0 };
    const disco = espiralAurea(nucleo.ids.length, RADIO_DE_NUCLEO);
    const [ejeU, ejeV] = tangentes(centro);
    const clases: Record<string, number> = {};
    const miembros: MiembroDeNucleo[] = nucleo.ids.map((id, j) => {
      const original = porId.get(id);
      const clase = original?.clase ?? 'desconocida';
      clases[clase] = (clases[clase] ?? 0) + 1;
      const d = disco[j] ?? { x: 0, y: 0 };
      return {
        id,
        clase,
        x: centro.x + ejeU.x * d.x + ejeV.x * d.y,
        y: centro.y + ejeU.y * d.x + ejeV.y * d.y,
        z: centro.z + ejeU.z * d.x + ejeV.z * d.y,
      };
    });

    const frase = nucleo.ids.map((id) => fraseDe.get(id)).find((f) => f != null) ?? null;

    return {
      id: `recalculado:${nucleo.ids[0] ?? String(i)}`,
      frase,
      textoOmitido: frase ? null : 'el servidor todavía no midió este corte',
      senales: nucleo.ids.length,
      clases,
      provincias: null,
      distancia: null,
      miembros,
    };
  });

  const solas = particion.solas
    .map((id) => porId.get(id))
    .filter((m): m is MiembroDeNucleo => m !== undefined);

  return { nucleos, solas, origen: 'recalculado' };
}

/** Dos vectores unitarios perpendiculares a `n`, para el disco del núcleo. */
function tangentes(n: {
  x: number;
  y: number;
  z: number;
}): [{ x: number; y: number; z: number }, { x: number; y: number; z: number }] {
  const auxiliar = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
  const u = normalizar(cruz(auxiliar, n));
  return [u, normalizar(cruz(n, u))];
}

function cruz(
  p: { x: number; y: number; z: number },
  q: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  return {
    x: p.y * q.z - p.z * q.y,
    y: p.z * q.x - p.x * q.z,
    z: p.x * q.y - p.y * q.x,
  };
}

function normalizar(p: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const largo = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  if (largo === 0) return { x: 1, y: 0, z: 0 };
  return { x: p.x / largo, y: p.y / largo, z: p.z / largo };
}
