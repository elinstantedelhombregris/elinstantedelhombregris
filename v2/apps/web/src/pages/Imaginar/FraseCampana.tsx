import { SLUG_CAMPANA_NACIONAL, type CampanaPublica } from '@v2/shared';

import { fechaCampana } from '../Campanas/presentacion';

/** Lo mínimo que hace falta saber de una campaña para decirle a alguien qué pasó con su aporte. */
export type CampanaDeAporte = Pick<CampanaPublica, 'id' | 'slug' | 'revision'> & {
  contrato: Pick<CampanaPublica['contrato'], 'titulo' | 'responsable' | 'fechaDevolucion'>;
};

/** El nombre con el que la campaña nacional se presenta; los demás nombres salen de sus datos. */
const NOMBRE_NACIONAL = 'Mi Argentina ideal';

/**
 * Lo que de verdad pasó con un aporte, dicho en una frase.
 *
 * Con campaña: quién la coordina y cuándo devuelve, leídos de la campaña — nada
 * de eso está escrito acá. Sin campaña: se dice que nadie se comprometió a
 * responder, porque es lo que pasó.
 */
export function FraseCampana({
  campana,
  momento = 'despues',
}: {
  campana: CampanaDeAporte | null;
  /** `antes` habla de lo que va a pasar al publicar; `despues`, de lo que pasó. */
  momento?: 'antes' | 'despues';
}) {
  if (!campana)
    return momento === 'despues' ? (
      <p>
        Tu aporte quedó publicado en el mapa. Por ahora no está en ninguna campaña, así que nadie se
        comprometió a responderlo.
      </p>
    ) : (
      <p>
        Por ahora no hay una campaña abierta para este aporte: se publica en el mapa, sin campaña.
      </p>
    );
  const nombre =
    campana.slug === SLUG_CAMPANA_NACIONAL
      ? `campaña nacional «${NOMBRE_NACIONAL}»`
      : `campaña «${campana.contrato.titulo}»`;
  const { responsable, fechaDevolucion } = campana.contrato;
  return momento === 'despues' ? (
    <p>
      Tu aporte entró en la {nombre}. {responsable}, que la coordina, va a publicar una devolución
      el {fechaCampana(fechaDevolucion)} con lo que se leyó.
    </p>
  ) : (
    <p>
      Tu aporte va a entrar en la {nombre}. {responsable}, que la coordina, va a publicar una
      devolución el {fechaCampana(fechaDevolucion)}.
    </p>
  );
}
