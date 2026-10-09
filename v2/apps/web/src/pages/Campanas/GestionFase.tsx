import { useState } from 'react';

import type { EstadoCampana, CampanaPublica } from '@v2/shared';

import { CAMPO, FASES_ROTULO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useEstadoCampana } from '~/lib/queries/participacion';

export function GestionFase({ campana }: { campana: CampanaPublica }) {
  const [estado, setEstado] = useState<EstadoCampana>('abierta');
  const [motivo, setMotivo] = useState('');
  const op = useEstadoCampana(campana.id);
  return (
    <section className="mt-8 border p-5">
      <h2 className="font-anton text-2xl">Cuidar el recorrido</h2>
      <label className="mt-4 block">
        Próxima fase
        <select
          className={CAMPO}
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoCampana);
          }}
        >
          {(['programada', 'abierta', 'pausada', 'en_devolucion', 'cerrada'] as const).map((x) => (
            <option key={x} value={x}>
              {FASES_ROTULO[x]}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block">
        Por qué damos este paso
        <textarea
          className={CAMPO}
          rows={3}
          value={motivo}
          maxLength={1000}
          onChange={(e) => {
            setMotivo(e.target.value);
          }}
        />
      </label>
      <ErrorOperacion mensaje={op.error?.message} />
      <BotonAccion
        className="mt-5"
        disabled={op.isPending || motivo.trim().length < 10}
        onClick={() => {
          op.mutate({ revision: campana.revision, estado, motivo });
        }}
      >
        Registrar el cambio
      </BotonAccion>
    </section>
  );
}
