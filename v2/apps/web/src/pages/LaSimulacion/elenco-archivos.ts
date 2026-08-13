import type { ElencoTransferible } from './barrido-mensajes';
import type { Persona, SelloDelModelo, SesgoDeElenco } from '@v2/civic-core';

/**
 * Cargar un elenco desde la máquina de quien lo corre.
 *
 * Ésta es la traducción a pantalla de la ADR 0008 y de la ADR 0009 juntas. La
 * API corre como función serverless: **no hay dónde meter un modelo en
 * producción**, y el texto que escribe la gente no sale a ningún proveedor. La
 * consecuencia no es una limitación disimulada, es el diseño: el elenco lo
 * genera un script local con Ollama (`pnpm simulacion:elenco`) y la página lo
 * **lee del disco de quien lo generó**. Cero red, cero CSP que ensanchar, cero
 * `OLLAMA_ORIGINS` que cada persona tenga que configurar en su máquina.
 *
 * El formato es exactamente el que escribe `scripts/simulacion/elenco-disco.ts`
 * —`manifiesto.json`, `conducta.json` y los shards `semblanzas-NNN.json`—, y se
 * lee acá con las mismas verificaciones: si falta una semblanza no se arma un
 * elenco a medias, porque la ficha de esa persona quedaría vacía sin que nada
 * avise.
 */

export interface NotasDeGeneracion {
  readonly escritor: string;
  readonly semilla: number;
  readonly grado: number;
}

export interface ManifiestoDeElenco {
  readonly huella: string;
  readonly personas: number;
  readonly padre: string | null;
  readonly sello: SelloDelModelo | null;
  readonly notas: NotasDeGeneracion;
  readonly sesgo: SesgoDeElenco;
}

export interface ElencoCargado {
  readonly manifiesto: ManifiestoDeElenco;
  readonly transferible: ElencoTransferible;
  /** Las personas con su texto: la ficha las lee, la dinámica no. */
  readonly personas: readonly Persona[];
}

export type LecturaDeElenco =
  | { readonly ok: true; readonly elenco: ElencoCargado }
  | { readonly ok: false; readonly motivo: string };

interface FilaDeConducta {
  readonly id: number;
  readonly origen: Persona['origen'];
  readonly territorio: Persona['territorio'];
  readonly conducta: Persona['conducta'];
}

interface FilaDeSemblanza {
  readonly id: number;
  readonly semblanza: Persona['semblanza'];
}

const FALTA =
  'Elegí la carpeta entera del elenco: hacen falta `manifiesto.json`, `conducta.json` y los ' +
  '`semblanzas-NNN.json`. La escribe `pnpm simulacion:elenco` dentro de `content/elencos/`.';

/**
 * Arma el elenco a partir de los archivos elegidos.
 *
 * No congela: eso pasa en el worker, con `congelarElenco`, que es el único
 * camino que existe para tener un `Elenco`. Acá sólo se junta el contenido y se
 * comprueba que esté completo — la huella la recalcula el otro lado sobre lo
 * que efectivamente llegó, que es donde tiene sentido comprobarla.
 */
export async function leerElencoDeArchivos(archivos: readonly File[]): Promise<LecturaDeElenco> {
  const porNombre = new Map<string, File>();
  for (const archivo of archivos) {
    const nombre = archivo.name.slice(archivo.name.lastIndexOf('/') + 1);
    porNombre.set(nombre, archivo);
  }

  const manifiestoArchivo = porNombre.get('manifiesto.json');
  const conductaArchivo = porNombre.get('conducta.json');
  if (manifiestoArchivo === undefined || conductaArchivo === undefined) {
    return { ok: false, motivo: FALTA };
  }

  try {
    const manifiesto = JSON.parse(await manifiestoArchivo.text()) as ManifiestoDeElenco;
    const conducta = JSON.parse(await conductaArchivo.text()) as readonly FilaDeConducta[];

    const semblanzas = new Map<number, Persona['semblanza']>();
    for (const [nombre, archivo] of porNombre) {
      if (!nombre.startsWith('semblanzas-')) continue;
      const shard = JSON.parse(await archivo.text()) as readonly FilaDeSemblanza[];
      for (const fila of shard) semblanzas.set(fila.id, fila.semblanza);
    }

    const personas: Persona[] = [];
    for (const fila of conducta) {
      const semblanza = semblanzas.get(fila.id);
      if (semblanza === undefined) {
        return {
          ok: false,
          motivo:
            `La persona ${String(fila.id)} no tiene semblanza en ningún shard: falta un archivo. ` +
            'No se arma un elenco a medias — la ficha de esa persona quedaría vacía sin que nada ' +
            'avise.',
        };
      }
      personas.push({
        id: fila.id,
        origen: fila.origen,
        territorio: fila.territorio,
        conducta: fila.conducta,
        semblanza,
      });
    }

    /**
     * El sello viaja **sin** `poblacionHuella`: se sella con la huella que
     * calcula `congelarElenco` sobre el contenido que llegó, no con la que el
     * manifiesto declara. Un sello que se copiara tal cual estaría afirmando
     * una identidad que este lado no verificó.
     */
    const sello =
      manifiesto.sello === null
        ? null
        : {
            modelo: manifiesto.sello.modelo,
            digest: manifiesto.sello.digest,
            temperatura: manifiesto.sello.temperatura,
            semilla: manifiesto.sello.semilla,
            generadaEn: manifiesto.sello.generadaEn,
          };

    return {
      ok: true,
      elenco: {
        manifiesto,
        personas,
        transferible: {
          huellaDeclarada: manifiesto.huella,
          personas,
          padre: manifiesto.padre,
          sello,
          corpus: manifiesto.sesgo.corpus,
        },
      },
    };
  } catch (error) {
    return {
      ok: false,
      motivo: `No se pudo leer el elenco: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
