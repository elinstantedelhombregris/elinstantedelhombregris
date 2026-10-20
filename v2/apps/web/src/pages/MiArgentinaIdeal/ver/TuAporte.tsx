import { Papelito } from '../comun/Papelito';

import { fraseDeTuAporte } from './formato';
import { Seccion } from './piezas';

import type { VisionCampana } from '@v2/shared';

/**
 * El aporte propio y cómo le va. Es privado: sólo lo ve quien lo publicó, sin puntaje de
 * afinidad ni comparación con nadie (spec §5, regla 7).
 */
export function TuAporte({ tuyo }: { tuyo: NonNullable<VisionCampana['tuyo']> }) {
  return (
    <Seccion titulo="Tu aporte">
      <Papelito
        id={tuyo.id}
        texto={tuyo.texto}
        provincia={tuyo.provincia}
        tema={tuyo.tema?.etiqueta ?? null}
        quieto
        propio
      />
      <p className="font-space text-tinta-75 text-[13px] tabular-nums">{fraseDeTuAporte(tuyo)}</p>
      <p className="text-tinta-50 text-[13.5px]">Esto lo ves sólo vos.</p>
    </Seccion>
  );
}
