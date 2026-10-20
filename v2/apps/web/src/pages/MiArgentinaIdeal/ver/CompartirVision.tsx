import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';
import { useMemo } from 'react';

import { Compartir } from '../comun/Compartir';

import type { ContenidoDeImagen } from '../comun/imagen-para-compartir';

/**
 * Compartir la visión como imagen: el aporte que más nos une o, si todavía no hay ninguno,
 * la pregunta de la campaña. El contenido se memoriza porque `Compartir` vuelve a dibujar
 * el lienzo cada vez que cambia.
 */
export function CompartirVision({ primero }: { primero: string | null }) {
  const contenido = useMemo<ContenidoDeImagen>(
    () => ({
      kicker: 'La Argentina que estamos imaginando',
      texto: primero ?? PREGUNTA_MI_ARGENTINA_IDEAL,
      pie: 'Mi Argentina ideal',
      llamado: '¿Y vos?',
      bajada: 'Sumá el tuyo',
    }),
    [primero],
  );
  return (
    <section aria-label="Compartir esta visión" className="flex flex-col gap-3">
      <Compartir
        contenido={contenido}
        enlace="/mi-argentina-ideal"
        texto="La Argentina que estamos imaginando. ¿Y vos? Sumá el tuyo."
        rotulo="Compartir esta visión"
        nombreDeArchivo="la-argentina-que-estamos-imaginando.png"
      />
    </section>
  );
}
