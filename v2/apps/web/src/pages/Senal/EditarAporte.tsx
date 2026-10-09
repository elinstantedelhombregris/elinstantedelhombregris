import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

/**
 * El único editor de un aporte propio: lo usan la página del aporte y «Mis
 * aportes». Antes cada lugar tenía el suyo, con textos distintos para el mismo
 * permiso.
 */
export function EditarAporte({ id }: { id: string }) {
  const auth = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [texto, setTexto] = useState('');
  const [cede, setCede] = useState(false);
  const op = useOperacionPersonal();
  const q = useQuery({
    queryKey: ['aporte-privado', id, auth.user?.id],
    enabled: abierto,
    queryFn: () =>
      api.get<{ texto: string; revision: string; cedeLicencia: boolean; textoProtegido: boolean }>(
        `/api/v1/contribuciones/${id}/privado`,
      ),
  });
  useEffect(() => {
    setTexto(q.data?.texto ?? '');
    setCede(q.data?.cedeLicencia ?? false);
  }, [q.data, auth.user?.id]);
  return (
    <section className="mt-8 border-t pt-6">
      <BotonAccion
        tono="papel"
        aria-expanded={abierto}
        onClick={() => {
          setAbierto(!abierto);
          setGuardado(false);
        }}
      >
        {abierto ? 'Cerrar sin guardar' : 'Corregir mi aporte'}
      </BotonAccion>
      {guardado && !abierto ? (
        <p role="status" className="mt-3 text-sm">
          Guardamos tu corrección.
        </p>
      ) : null}
      {abierto && (
        <>
          <Nota>
            Antes de mostrarte el texto comprobamos que sea tuyo. Si lo reservaste, sigue fuera de
            las lecturas y descargas públicas. La corrección se guarda sobre la versión que estás
            viendo, y el permiso de uso se elige aparte.
          </Nota>
          {q.isLoading ? (
            <p>Comprobando que sea tuyo…</p>
          ) : (
            q.data && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  op.mutate(
                    {
                      metodo: 'patch',
                      ruta: '/api/v1/contribuciones/' + id,
                      cuerpo: {
                        revision: q.data.revision,
                        texto,
                        cedeLicencia: cede,
                        aceptaPublicar: true,
                      },
                    },
                    {
                      onSuccess: () => {
                        setAbierto(false);
                        setGuardado(true);
                      },
                    },
                  );
                }}
              >
                <label>
                  El texto que quiero conservar
                  <textarea
                    className={CAMPO}
                    rows={4}
                    maxLength={2000}
                    readOnly={q.data.textoProtegido}
                    value={texto}
                    onChange={(e) => {
                      setTexto(e.target.value);
                    }}
                  />
                </label>
                {q.data.textoProtegido && (
                  <Nota>
                    Este texto ya tiene adhesiones o comprobaciones de otras personas, y cambiarlo
                    las dejaría asociadas a algo que no leyeron. Para cambiarlo, publicá un aporte
                    nuevo. Sí podés cambiar el permiso de uso o retirar el aporte.
                  </Nota>
                )}
                <label className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={cede}
                    onChange={(e) => {
                      setCede(e.target.checked);
                    }}
                  />
                  Dejo que cualquiera pueda leer y compartir este texto (licencia CC BY 4.0). Si no
                  la tildás, queda reservado.
                </label>
                <BotonAccion
                  type="submit"
                  className="mt-4"
                  disabled={op.isPending || !texto.trim()}
                >
                  Guardar la corrección
                </BotonAccion>
              </form>
            )
          )}
          <ErrorOperacion mensaje={q.error?.message ?? op.error?.message} />
        </>
      )}
    </section>
  );
}
