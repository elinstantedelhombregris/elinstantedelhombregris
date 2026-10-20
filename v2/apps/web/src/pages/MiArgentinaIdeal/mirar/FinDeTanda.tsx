import { nombreCorto } from '../comun/lugar';

import { ESCRIBIR_DESDE_MIRAR } from './TarjetaEscribir';

import type { TarjetaPila } from '@v2/shared';

import { ACCION_DE_PILA, PILA_DE_ACCIONES } from '~/components/participacion/constantes';
import { BotonAccion, EnlaceAccion } from '~/components/participacion/Elementos';

export interface FinDeTandaProps {
  /** Las que contestó o reportó. */
  miradas: number;
  /** A las que dijo «Yo también», en orden. */
  acuerdos: readonly TarjetaPila[];
  yaAporto: boolean;
  /** Pedir otra: nunca empieza sola. */
  onOtra: () => void;
  pidiendo: boolean;
}

/**
 * La tanda tiene fin: ¡BASTA! no busca retener atención, y una pila infinita es
 * exactamente eso (spec §4, «Una tanda tiene fin»).
 */
export function FinDeTanda({ miradas, acuerdos, yaAporto, onOtra, pidiendo }: FinDeTandaProps) {
  return (
    <div
      data-foco
      tabIndex={-1}
      aria-labelledby="fin-titulo"
      role="group"
      className="flex flex-col gap-4"
    >
      <h2 id="fin-titulo" className="font-anton text-[clamp(30px,8vw,40px)] leading-[1.05]">
        Listo. Miraste {miradas}.
      </h2>
      <p className="text-tinta-75 text-[16px] leading-relaxed">
        {acuerdos.length
          ? `Dijiste yo también a ${acuerdos.length}.`
          : 'Esta vez no dijiste yo también a ninguno. Está bien: eso también cuenta.'}
      </p>
      {acuerdos.length ? (
        <ul className="border-tinta border-t-2">
          {acuerdos.map((t) => (
            <li key={t.id} className="border-papel-borde flex flex-col gap-1.5 border-b py-3">
              <p className="font-archivo text-[17px] font-semibold leading-[1.32]">«{t.texto}»</p>
              <p className="font-space text-tinta-50 flex flex-wrap justify-between gap-2 text-[11.5px] tracking-[0.04em]">
                <span>{t.provincia ? nombreCorto(t.provincia.nombre) : 'Todo el país'}</span>
                <span>{t.tema?.etiqueta ?? 'Sin tema'}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={PILA_DE_ACCIONES}>
        <EnlaceAccion href="/mi-argentina-ideal" className={ACCION_DE_PILA}>
          Ver cómo se va armando →
        </EnlaceAccion>
        <BotonAccion tono="papel" className={ACCION_DE_PILA} ocupado={pidiendo} onClick={onOtra}>
          Otra tanda
        </BotonAccion>
        {yaAporto ? null : (
          <EnlaceAccion secundario href={ESCRIBIR_DESDE_MIRAR} className={ACCION_DE_PILA}>
            Escribir el mío
          </EnlaceAccion>
        )}
      </div>
    </div>
  );
}
