import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';
export function EditarAporte({ id }: { id: string }) {
  const auth = useAuth();
  const [abierto, setAbierto] = useState(false);
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
        onClick={() => {
          setAbierto(!abierto);
        }}
      >
        {abierto ? 'Cerrar revisión de mi aporte' : 'Revisar mi texto y permiso'}
      </BotonAccion>
      {abierto && (
        <>
          <Nota>
            Este texto se muestra después de comprobar tu autoría. Si lo reservaste, sigue fuera de
            las lecturas y descargas públicas. Una corrección usa la revisión actual y mantiene la
            elección de licencia separada.
          </Nota>
          {q.isLoading ? (
            <p>Comprobando la autoría…</p>
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
                    El enunciado ya conserva adhesiones o evidencia de un hecho o una acción. Para
                    cambiarlo, compartí un aporte nuevo. Así las otras personas siguen asociadas a
                    lo que realmente leyeron. Podés revisar la licencia o retirar la publicación.
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
                  Cedo el texto bajo CC BY 4.0 para su reproducción. Sin cesión, queda reservado.
                </label>
                <BotonAccion
                  type="submit"
                  className="mt-4"
                  disabled={op.isPending || !texto.trim()}
                >
                  Guardar esta revisión
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
