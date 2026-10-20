import { PASOS_DE_QUIEN_IMPULSA } from '@v2/shared';
import { useState } from 'react';

import type { CampanaPublica, EstadoCampana } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO, PASOS_CAMPANA, rotuloDeEstado } from '~/components/participacion/constantes';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useEstadoCampana } from '~/lib/queries/participacion';

const MOTIVO_MINIMO = 10;

/**
 * Cambiar la campaña de etapa: solo los pasos que el recorrido permite desde donde está, y
 * de esos, los que puede dar quien mira. Quien impulsa una campaña sin ser de la
 * administración la coordina una vez abierta, pero nunca la abre ni la programa (§11).
 */
export function GestionFase({
  campana,
  esAdmin = true,
}: {
  campana: CampanaPublica;
  esAdmin?: boolean;
}) {
  const pasos = esAdmin
    ? PASOS_CAMPANA[campana.estado]
    : (PASOS_DE_QUIEN_IMPULSA[campana.estado] ?? []).filter(
        (p) => p !== 'reuniendo' && p !== 'borrador',
      );
  const [elegido, setElegido] = useState<EstadoCampana | null>(null);
  const [motivo, setMotivo] = useState('');
  const [hecho, setHecho] = useState('');
  const op = useEstadoCampana(campana.id);
  const estado = elegido && pasos.includes(elegido) ? elegido : pasos[0];
  const faltan = MOTIVO_MINIMO - motivo.trim().length;
  return (
    <section className="mt-8 border p-5" aria-labelledby="cuidar-recorrido">
      <h2 id="cuidar-recorrido" className="font-anton text-2xl">
        Cuidar el recorrido
      </h2>
      <p className="text-tinta-75 mt-3 text-sm">
        Ahora la campaña está: {rotuloDeEstado(campana.estado)}.
      </p>
      <p role="status" className="mt-3 text-sm">
        {hecho}
      </p>
      {estado ? (
        <>
          <label className="mt-4 block">
            Próxima etapa
            <select
              className={CAMPO}
              value={estado}
              onChange={(e) => {
                setElegido(e.target.value as EstadoCampana);
              }}
            >
              {pasos.map((x) => (
                <option key={x} value={x}>
                  {rotuloDeEstado(x)}
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
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <BotonConMotivo
              motivo={
                faltan > 0
                  ? `Contá por qué en el motivo: faltan ${faltan} ${faltan === 1 ? 'carácter' : 'caracteres'}.`
                  : null
              }
              ocupado={op.isPending}
              onClick={() => {
                setHecho('');
                op.mutate(
                  { revision: campana.revision, estado, motivo },
                  {
                    onSuccess: () => {
                      setHecho(`Listo: la campaña pasó a “${rotuloDeEstado(estado)}”.`);
                      setMotivo('');
                      setElegido(null);
                    },
                  },
                );
              }}
            >
              Registrar el cambio
            </BotonConMotivo>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm">
          Esta campaña ya está cerrada y no admite más cambios de etapa.
        </p>
      )}
    </section>
  );
}
