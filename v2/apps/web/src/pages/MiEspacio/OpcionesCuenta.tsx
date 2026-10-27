import { useQuery, useQueryClient } from '@tanstack/react-query';
import { esErrorDeIngresoExterno } from '@v2/shared';
import { useState } from 'react';

import { BotonGoogle } from '~/components/auth/IngresoExterno';
import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { MENSAJES_DE_INGRESO_EXTERNO, useIngresoDeLaCuenta } from '~/lib/queries/ingreso-externo';
import { escribir } from '~/lib/queries/participacion';

/** Adónde vuelve la confirmación con Google: esta pestaña, con el formulario abierto. */
const VOLVER_A_LA_CUENTA = '/mi-espacio?pestana=cuenta';

/** Lo que dejó en la dirección la vuelta de Google: si confirmó o por qué no. */
function vueltaDeGoogle(): { confirmado: boolean; error: string | null } {
  const q = new URLSearchParams(window.location.search);
  const error = q.get('error');
  return {
    confirmado: q.get('confirmado') === 'google',
    error: esErrorDeIngresoExterno(error) ? MENSAJES_DE_INGRESO_EXTERNO[error] : null,
  };
}

export function OpcionesCuenta({ salir }: { salir: () => void }) {
  const q = useQuery({
    queryKey: ['preferencias-civicas'],
    queryFn: () => api.get<{ avisos: boolean }>('/api/v1/mi-espacio/preferencias'),
  });
  const qc = useQueryClient();
  const ingreso = useIngresoDeLaCuenta();
  // Sin contraseña, la cuenta entra sólo con Google y confirma con Google (ADR 0012).
  const sinContrasena = ingreso.data?.tieneContrasena === false;
  const [vuelta] = useState(vueltaDeGoogle);
  const [cerrar, setCerrar] = useState(vuelta.confirmado || vuelta.error !== null);
  const [password, setPassword] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cierre = async () => {
    setBusy(true);
    setError('');
    try {
      await escribir(
        'post',
        '/api/v1/mi-espacio/cerrar-cuenta',
        sinContrasena ? { confirma } : { password, confirma },
      );
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
      {ingreso.data && ingreso.data.identidades.length > 0 ? (
        <p className="text-tinta-75 text-sm">
          Entrás con Google ({ingreso.data.identidades.map((i) => i.correo).join(', ')})
          {ingreso.data.tieneContrasena ? ' y con tu contraseña.' : '.'}
        </p>
      ) : null}
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
          {sinContrasena ? (
            vuelta.confirmado ? (
              <p role="status" className="text-sm">
                Confirmaste con Google que sos vos. Tenés cinco minutos para cerrar la cuenta.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  Tu cuenta entra con Google y no tiene contraseña. Para cerrarla, confirmá con
                  Google que sos vos.
                </p>
                <ErrorOperacion mensaje={vuelta.error} className="my-0" />
                <BotonGoogle volver={VOLVER_A_LA_CUENTA} para="confirmar">
                  Confirmar con Google
                </BotonGoogle>
              </div>
            )
          ) : (
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
          )}
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
            disabled={
              busy ||
              !ingreso.data ||
              (sinContrasena ? !vuelta.confirmado : !password) ||
              confirma !== 'CERRAR MI CUENTA'
            }
          >
            Cerrar mi cuenta y revocar sesiones
          </BotonAccion>
        </form>
      )}
      <ErrorOperacion mensaje={error || q.error?.message} />
    </div>
  );
}
