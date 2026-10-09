import { useState } from 'react';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useLecturaAsistida } from '~/lib/queries/participacion';

export function Asistencia({
  texto,
  proveedor,
  leer,
}: {
  texto: string;
  proveedor: string | null;
  leer: (v: string) => void;
}) {
  const [autoriza, setAutoriza] = useState(false);
  const asistencia = useLecturaAsistida();
  return (
    <div className="mb-7 border p-5">
      <h2 className="font-anton text-2xl">Una lectura que podés discutir.</h2>
      <p className="mt-3 text-sm leading-relaxed">
        Podés revisar tus palabras por tu cuenta o pedir una lectura asistida. Si la pedís, estos
        fragmentos se envían al proveedor configurado; no se publican por eso.
      </p>
      {proveedor ? (
        <>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={autoriza}
              onChange={(e) => {
                setAutoriza(e.target.checked);
              }}
            />
            <span className="text-sm">
              Autorizo enviar esta reflexión a {proveedor}. Revisé que no incluya datos de otras
              personas que no quiero enviar.
            </span>
          </label>
          <BotonAccion
            tono="papel"
            className="mt-4"
            disabled={!autoriza || asistencia.isPending}
            onClick={() => {
              asistencia.mutate(texto, {
                onSuccess: (r) => {
                  leer(r.lectura);
                },
              });
            }}
          >
            {asistencia.isPending ? 'Preparando una lectura…' : 'Pedir una lectura asistida'}
          </BotonAccion>
        </>
      ) : (
        <p className="text-tinta-50 mt-3 text-sm">
          La revisión guiada funciona sin IA. No hay proveedor disponible en esta instalación.
        </p>
      )}
      <ErrorOperacion mensaje={asistencia.error?.message} />
      {asistencia.data ? (
        <p className="mt-3 text-sm">Pregunta para seguir: {asistencia.data.pregunta}</p>
      ) : null}
    </div>
  );
}
