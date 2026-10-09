import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { escribir } from '~/lib/queries/participacion';
export function OpcionesCuenta({ salir }: { salir: () => void }) {
  const q = useQuery({
    queryKey: ['preferencias-civicas'],
    queryFn: () => api.get<{ avisos: boolean }>('/api/v1/mi-espacio/preferencias'),
  });
  const qc = useQueryClient();
  const [cerrar, setCerrar] = useState(false);
  const [password, setPassword] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cierre = async () => {
    setBusy(true);
    setError('');
    try {
      await escribir('post', '/api/v1/mi-espacio/cerrar-cuenta', { password, confirma });
      qc.clear();
      salir();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cerrar la cuenta.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-8 space-y-5">
      <h3 className="font-anton text-2xl">Cómo querés recibir novedades</h3>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={q.data?.avisos ?? true}
          disabled={!q.data}
          onChange={(e) => {
            void escribir('put', '/api/v1/mi-espacio/preferencias', { avisos: e.target.checked })
              .then(() => qc.invalidateQueries({ queryKey: ['preferencias-civicas'] }))
              .catch((e: unknown) => {
                setError(e instanceof Error ? e.message : 'No pudimos guardar tu preferencia.');
              });
          }}
        />
        Recibir nuevos avisos dentro de Mi espacio
      </label>
      <p className="text-tinta-50 text-sm">
        Seguir es privado y no suma apoyo. No mandamos correos ni avisos al teléfono: las novedades
        las ves acá. Si las silenciás, los avisos anteriores se conservan y lo que seguís sigue en
        «Lo que sigo».
      </p>
      <BotonAccion
        tono="papel"
        onClick={() => {
          setCerrar(!cerrar);
        }}
      >
        Cerrar mi cuenta
      </BotonAccion>
      {cerrar && (
        <form
          className="border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void cierre();
          }}
        >
          <h3 className="font-anton text-2xl">Antes de cerrar, llevate tu copia.</h3>
          <Nota>
            <p>Al cerrar tu cuenta:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Se borran tu contraseña, tu perfil, lo que seguís, tus análisis guardados, tus
                avisos y tus respuestas individuales.
              </li>
              <li>
                Se conservan tus aportes, fichas, campañas y firmas públicas, y el archivo de
                actividad anterior. Si no querés que queden, retiralos antes. Las campañas abiertas
                a tu cargo se pausan y queda constancia.
              </li>
              <li>
                Los borradores de este navegador siguen acá, y los archivos que otras personas ya
                descargaron no se pueden recuperar.
              </li>
            </ul>
          </Nota>
          <label>
            Contraseña actual
            <input
              className={CAMPO}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Escribí CERRAR MI CUENTA
            <input
              className={CAMPO}
              value={confirma}
              onChange={(e) => {
                setConfirma(e.target.value);
              }}
            />
          </label>
          <BotonAccion
            className="mt-4"
            type="submit"
            disabled={busy || !password || confirma !== 'CERRAR MI CUENTA'}
          >
            Cerrar mi cuenta y revocar sesiones
          </BotonAccion>
        </form>
      )}
      <ErrorOperacion mensaje={error || q.error?.message} />
    </div>
  );
}
