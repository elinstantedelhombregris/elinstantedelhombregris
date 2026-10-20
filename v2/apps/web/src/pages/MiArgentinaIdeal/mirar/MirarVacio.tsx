import { PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';

import { Compartir } from '../comun/Compartir';

import { ESCRIBIR_DESDE_MIRAR } from './TarjetaEscribir';

import type { ContenidoDeImagen } from '../comun/imagen-para-compartir';

import { ACCION_DE_PILA, PILA_DE_ACCIONES } from '~/components/participacion/constantes';
import { EnlaceAccion } from '~/components/participacion/Elementos';

const INVITACION: ContenidoDeImagen = {
  kicker: 'Mi Argentina ideal',
  texto: PREGUNTA_MI_ARGENTINA_IDEAL,
  pie: 'Imaginar · Mirar · Ver',
  llamado: '¿Y vos?',
  bajada: 'Sumá tu aporte',
};

/**
 * Mirar sólo muestra aportes reales (decisión D1): si para esta persona no hay
 * ninguno, el momento no se finge. Dice qué falta para que haya algo y ofrece lo
 * que sí se puede hacer, sin pedir perdón. Se apaga solo cuando llegan aportes.
 */
export function MirarVacio({ yaAporto }: { yaAporto: boolean }) {
  return (
    <div
      data-foco
      tabIndex={-1}
      aria-labelledby="vacio-titulo"
      role="group"
      className="flex flex-col gap-4"
    >
      <h2 id="vacio-titulo" className="font-anton text-[clamp(28px,7.5vw,38px)] leading-[1.05]">
        Todavía nadie más publicó su aporte en Mi Argentina ideal.
      </h2>
      <p className="text-tinta-75 text-[16px] leading-relaxed">
        El tuyo va a ser de los primeros que vean otras personas.
      </p>
      {yaAporto ? (
        <div className="max-w-[26rem]">
          <p className="text-tinta-75 mb-3 text-[15px] leading-relaxed">
            Mientras tanto, invitá a alguien a contar el suyo.
          </p>
          <Compartir
            contenido={INVITACION}
            enlace="/mi-argentina-ideal/imaginar"
            texto="¿Y vos? Contá qué te gustaría que fuera posible en tu vida."
            rotulo="Invitar a otras personas"
            nombreDeArchivo="mi-argentina-ideal-invitacion.png"
          />
        </div>
      ) : (
        <div className={PILA_DE_ACCIONES}>
          <EnlaceAccion href={ESCRIBIR_DESDE_MIRAR} className={ACCION_DE_PILA}>
            Escribir el mío
          </EnlaceAccion>
        </div>
      )}
    </div>
  );
}
