import { enLista, fechaDeFicha, nombreDeCampo } from './presentacion';

import type { FichaFuturo } from '@v2/shared';

const LIMITE_DEL_HISTORIAL = 100;

function queCambio(campos: string[]): string {
  if (campos.includes('creación')) return 'Se creó la ficha.';
  if (campos.length === 0) return 'Sin cambios en el contenido.';
  return `Cambió: ${enLista(campos.map(nombreDeCampo))}.`;
}

/** Cada versión guardada, con los campos que cambiaron nombrados como los lee quien edita. */
export function HistorialFicha({ historial }: { historial: FichaFuturo['historial'] }) {
  return (
    <section className="mt-9" aria-labelledby="historial-ficha">
      <h2 id="historial-ficha" className="font-anton text-2xl">
        Historial de versiones
      </h2>
      <p className="my-3 text-sm">
        Cada versión guardada queda acá, con los campos que cambiaron. Los aportes se muestran como
        están hoy, no como estaban cuando se vincularon.
        {historial.length >= LIMITE_DEL_HISTORIAL
          ? ` Se ven las ${LIMITE_DEL_HISTORIAL} versiones más recientes.`
          : ''}
      </p>
      <ol>
        {historial.map((h) => (
          <li className="border-tinta/25 border-t py-3 text-sm" key={h.revision}>
            Versión {h.revision} · {fechaDeFicha(h.fecha)} · {queCambio(h.campos)}
          </li>
        ))}
      </ol>
    </section>
  );
}
