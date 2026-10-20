import { REGLAS_DE_VISION } from '@v2/civic-core';

import { MIRAR_HREF, numero } from './formato';
import { FilaAporte, Meta, Seccion, Vacio } from './piezas';

import type { AporteEnVision } from '@v2/shared';

import { EnlaceAccion } from '~/components/participacion/Elementos';

const TOPE = 3;

/** Los que todavía no entran en la visión: con menos opiniones primero, como los ordena el servidor. */
export function LoQueRecienLlega({ recien }: { recien: AporteEnVision[] }) {
  return (
    <Seccion
      titulo="Lo que recién llega"
      bajada={
        recien.length > 0
          ? 'Todavía tienen pocas opiniones. Sin las tuyas, no pueden entrar en la visión.'
          : undefined
      }
    >
      {recien.length === 0 ? (
        <Vacio>
          Cada aporte nuevo aparece acá mientras junta sus primeras{' '}
          {REGLAS_DE_VISION.MINIMO_OPINIONES} opiniones.
        </Vacio>
      ) : (
        <>
          <ul>
            {recien.slice(0, TOPE).map((a) => (
              <FilaAporte key={a.id} texto={a.texto}>
                <Meta>
                  <span>
                    {a.opiniones === 1 ? '1 opinión' : `${numero(a.opiniones)} opiniones`}
                  </span>
                  {a.tema ? <span>{a.tema.etiqueta}</span> : null}
                </Meta>
              </FilaAporte>
            ))}
          </ul>
          <EnlaceAccion href={MIRAR_HREF} secundario className="justify-center">
            Mirarlos
          </EnlaceAccion>
        </>
      )}
    </Seccion>
  );
}
