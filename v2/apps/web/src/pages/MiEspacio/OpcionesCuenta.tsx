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
        Los seguimientos son privados y no suman apoyo. Este recorrido no envía correos ni
        notificaciones al teléfono. Al silenciar, los avisos anteriores permanecen y los procesos
        siguen consultables.
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
            La cuenta dejará de admitir sesiones. Se eliminan credenciales, identidad del perfil,
            seguimientos, análisis guardados, avisos y respuestas individuales de este nuevo
            recorrido. Tus publicaciones, fichas, campañas, firmas públicas y el archivo de
            actividad histórica se conservan; las campañas abiertas bajo tu responsabilidad se
            pausan y dejan constancia. Retiralas antes si eso es lo que querés. Los borradores
            locales permanecen en el dispositivo. Esta operación no recupera archivos que otras
            personas ya descargaron.
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
