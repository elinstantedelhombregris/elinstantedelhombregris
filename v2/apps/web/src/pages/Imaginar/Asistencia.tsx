import { useState } from 'react';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { useLecturaAsistida } from '~/lib/queries/participacion';

/**
 * Una lectura asistida de las respuestas, opcional.
 *
 * Sin proveedor configurado no hay nada que ofrecer, así que no se muestra
 * nada. Con proveedor, la sugerencia aparece APARTE del texto que la persona
 * está editando y solo lo reemplaza si ella elige «Usar esta versión»: lo que
 * escribió nunca se pisa en silencio. El nombre del proveedor es un dato de
 * infraestructura y no se muestra.
 */
export function Asistencia({
  texto,
  proveedor,
  usar,
}: {
  texto: string;
  proveedor: string | null;
  usar: (version: string) => void;
}) {
  const [autoriza, setAutoriza] = useState(false);
  const [usada, setUsada] = useState(false);
  const asistencia = useLecturaAsistida();
  if (!proveedor) return null;
  return (
    <div className="border-tinta mb-7 border p-5">
      <h4 className="font-anton text-xl">Una lectura asistida, si querés</h4>
      <p className="mt-3 text-sm leading-relaxed">
        Podés revisar tus palabras por tu cuenta o pedir que un servicio externo las lea y proponga
        una versión. Si la pedís, tus respuestas se envían a ese servicio; eso no las publica.
      </p>
      <label className="mt-4 flex items-start gap-3">
        <input
          type="checkbox"
          checked={autoriza}
          onChange={(e) => {
            setAutoriza(e.target.checked);
          }}
        />
        <span className="text-sm">
          Autorizo enviar mis respuestas a ese servicio. Revisé que no incluyan datos de otras
          personas que no quiero enviar.
        </span>
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <BotonConMotivo
          type="button"
          tono="papel"
          motivo={autoriza ? null : 'Marcá la casilla para autorizar el envío.'}
          ocupado={asistencia.isPending}
          onClick={() => {
            setUsada(false);
            asistencia.mutate(texto);
          }}
        >
          {asistencia.isPending ? 'Preparando una lectura…' : 'Pedir una lectura asistida'}
        </BotonConMotivo>
      </div>
      <ErrorOperacion mensaje={asistencia.error?.message} />
      {asistencia.data ? (
        <div className="mt-4" role="status">
          <p className="text-sm font-medium">Versión sugerida</p>
          <blockquote className="border-violeta mt-2 whitespace-pre-wrap border-l-2 pl-4 text-sm leading-relaxed">
            {asistencia.data.lectura}
          </blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <BotonAccion
              type="button"
              tono="papel"
              onClick={() => {
                usar(asistencia.data.lectura);
                setUsada(true);
              }}
            >
              Usar esta versión
            </BotonAccion>
            {usada ? (
              <span className="text-verde text-sm">
                Reemplazamos el texto de abajo; podés seguir editándolo.
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm">Pregunta para seguir: {asistencia.data.pregunta}</p>
        </div>
      ) : null}
    </div>
  );
}
