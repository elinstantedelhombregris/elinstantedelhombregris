import { Papelito } from '../comun/Papelito';

import { fraseDeTuAporte } from './formato';
import { Seccion } from './piezas';

import type { AporteEnVision, VisionCampana } from '@v2/shared';

/**
 * El aporte propio y cómo le va. Es privado: sólo lo ve quien lo publicó, sin puntaje de
 * afinidad ni comparación con nadie (spec §5, regla 7).
 *
 * `tuyo` no trae provincia ni tema; si el aporte ya aparece en alguna lista de la visión, se
 * toman de ahí para que el papelito se vea como lo ven los demás.
 */
export function TuAporte({
  tuyo,
  aportes,
}: {
  tuyo: NonNullable<VisionCampana['tuyo']>;
  aportes: readonly AporteEnVision[];
}) {
  const visto = aportes.find((a) => a.id === tuyo.id);
  return (
    <Seccion titulo="Tu aporte">
      <Papelito
        id={tuyo.id}
        texto={tuyo.texto}
        provincia={visto?.provincia ?? null}
        tema={visto?.tema?.etiqueta ?? null}
        quieto
        propio
      />
      <p className="font-space text-tinta-75 text-[13px] tabular-nums">{fraseDeTuAporte(tuyo)}</p>
      <p className="text-tinta-50 text-[13.5px]">Esto lo ves sólo vos.</p>
    </Seccion>
  );
}
