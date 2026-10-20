import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';

import { ACCION_DE_PILA, PILA_DE_ACCIONES } from '~/components/participacion/constantes';
import { BotonAccion, EnlaceAccion } from '~/components/participacion/Elementos';

/** Escribir vuelve a Mirar al publicar. */
export const ESCRIBIR_DESDE_MIRAR = '/mi-argentina-ideal/imaginar?volver=mirar';

/**
 * La tarjeta en blanco: escribir es una tarjeta más, no otro lugar para
 * participar (spec §4, «La tarjeta de escribir vive adentro»). Se puede saltear.
 */
export function TarjetaEscribir({ onSaltear }: { onSaltear: () => void }) {
  return (
    <div data-foco tabIndex={-1} className="flex flex-col gap-4">
      <article
        aria-labelledby="escribir-titulo"
        className="border-tinta-30 flex min-h-[300px] flex-col justify-between gap-5 border-2 border-dashed px-5 pb-5 pt-6"
      >
        <p className="font-space text-tinta-50 text-[11px] font-bold uppercase tracking-[0.12em]">
          Te toca
        </p>
        <h2 id="escribir-titulo" className="font-anton text-[clamp(28px,8vw,34px)] leading-[1.05]">
          {PREGUNTA_MI_ARGENTINA_IDEAL}
        </h2>
        <p className="text-tinta-75 text-[14.5px] leading-relaxed">
          Lo que escribas lo van a ver otras personas, como vos ves éstos.
        </p>
      </article>
      <div className={PILA_DE_ACCIONES}>
        <EnlaceAccion href={ESCRIBIR_DESDE_MIRAR} className={ACCION_DE_PILA}>
          Escribir el mío
        </EnlaceAccion>
        <BotonAccion tono="papel" className={ACCION_DE_PILA} onClick={onSaltear}>
          Saltear por ahora
        </BotonAccion>
      </div>
    </div>
  );
}
