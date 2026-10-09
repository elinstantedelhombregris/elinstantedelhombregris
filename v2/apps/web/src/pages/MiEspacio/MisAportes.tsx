import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import type { AportePropio } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

export function MisAportes({ aportes, total }: { aportes: AportePropio[]; total: number }) {
  const auth = useAuth();
  const [pagina, setPagina] = useState(0);
  const q = useQuery({
    queryKey: ['mi-espacio', 'aportes', auth.user?.id, pagina],
    enabled: pagina > 0,
    queryFn: () =>
      api.get<{ aportes: AportePropio[]; totalAportes: number }>(
        `/api/v1/mi-espacio/aportes?offset=${pagina * 200}`,
      ),
  });
  const lista = pagina === 0 ? aportes : (q.data?.aportes ?? []);
  const [editando, setEditando] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [cede, setCede] = useState(false);
  const [retirando, setRetirando] = useState<string | null>(null);
  const op = useOperacionPersonal();
  return (
    <section aria-labelledby="mis-aportes-titulo">
      <h2 id="mis-aportes-titulo" className="font-anton text-3xl">
        Lo que pusiste en palabras.
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        Podés cuidar el sentido de cada aporte y ver dónde participa.{' '}
        {total > lista.length
          ? `Mostrando ${lista.length} de ${total}; la descarga privada incluye tus registros completos.`
          : ''}
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
      {!lista.length ? (
        <Nota>
          Todavía no hay aportes ligados a tu cuenta. Podés empezar a imaginar o recuperar los que
          conserva este navegador.
        </Nota>
      ) : (
        <ul className="mt-6 space-y-5">
          {lista.map((a) => (
            <li key={a.id} className="bg-papel-crudo border p-5">
              <p className="font-space text-violeta text-xs uppercase">
                {a.tipo} · {a.estado.replaceAll('_', ' ')} ·{' '}
                {new Date(a.creadaEn).toLocaleDateString('es-AR')}
              </p>
              {editando === a.id ? (
                <>
                  <label className="mt-4 block">
                    La frase que quiero compartir
                    <textarea
                      rows={4}
                      className={CAMPO}
                      maxLength={2000}
                      value={texto}
                      onChange={(e) => {
                        setTexto(e.target.value);
                      }}
                    />
                  </label>
                  <label className="mt-4 flex gap-3">
                    <input
                      type="checkbox"
                      checked={cede}
                      onChange={(e) => {
                        setCede(e.target.checked);
                      }}
                    />
                    <span>
                      Cedo este texto según el contrato del registro. Si no, queda reservado.
                    </span>
                  </label>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <BotonAccion
                      disabled={op.isPending || !texto.trim()}
                      onClick={() => {
                        op.mutate(
                          {
                            metodo: 'patch',
                            ruta: `/api/v1/contribuciones/${a.id}`,
                            cuerpo: {
                              revision: a.revision,
                              texto,
                              cedeLicencia: cede,
                              aceptaPublicar: true,
                            },
                          },
                          {
                            onSuccess: () => {
                              setEditando(null);
                            },
                          },
                        );
                      }}
                    >
                      Guardar corrección
                    </BotonAccion>
                    <BotonAccion
                      tono="papel"
                      onClick={() => {
                        setEditando(null);
                      }}
                    >
                      Conservar lo publicado
                    </BotonAccion>
                  </div>
                </>
              ) : (
                <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">
                  {a.estado === 'retirada' ? 'El texto fue retirado.' : a.texto}
                </p>
              )}
              <p className="text-tinta-50 mt-3 text-sm">
                {a.cedeLicencia ? 'Texto compartido con cesión.' : 'Texto reservado públicamente.'}{' '}
                Ubicación: {a.precision}.
              </p>
              {a.campanaId ? (
                <Link
                  href={`/campanas/${a.campanaId}`}
                  className="text-violeta mt-3 inline-flex min-h-11 items-center underline"
                >
                  {a.campanaTitulo ?? 'Ver campaña'} · edición {a.edicion}
                </Link>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-5">
                <Link
                  href={`/senal/${a.id}`}
                  className="text-violeta inline-flex min-h-11 items-center underline"
                >
                  Ver aporte y estado
                </Link>
                {a.estado !== 'retirada' ? (
                  <>
                    <button
                      type="button"
                      className="text-violeta min-h-11 underline"
                      onClick={() => {
                        setEditando(a.id);
                        setTexto(a.texto);
                        setCede(a.cedeLicencia);
                      }}
                    >
                      Corregir mis palabras
                    </button>
                    <button
                      type="button"
                      className="text-sello min-h-11 underline"
                      onClick={() => {
                        setRetirando(a.id);
                      }}
                    >
                      Retirar
                    </button>
                    <Link
                      href={`/fichas/nueva?senal=${a.id}`}
                      className="text-violeta min-h-11 underline"
                    >
                      Desarrollar un futuro
                    </Link>
                  </>
                ) : null}
              </div>
              {retirando === a.id ? (
                <Nota>
                  <p>
                    El aporte deja de mostrarse en las lecturas vivas. Los archivos que otras
                    personas ya descargaron no pueden recuperarse.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <BotonAccion
                      tono="sello"
                      disabled={op.isPending}
                      onClick={() => {
                        op.mutate(
                          { metodo: 'delete', ruta: `/api/v1/contribuciones/${a.id}` },
                          {
                            onSuccess: () => {
                              setRetirando(null);
                            },
                          },
                        );
                      }}
                    >
                      Confirmar retiro
                    </BotonAccion>
                    <BotonAccion
                      tono="papel"
                      onClick={() => {
                        setRetirando(null);
                      }}
                    >
                      Dejarlo publicado
                    </BotonAccion>
                  </div>
                </Nota>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <ErrorOperacion mensaje={q.error?.message} />
      {total > 200 && (
        <div className="mt-6 flex gap-3">
          <BotonAccion
            tono="papel"
            disabled={pagina === 0}
            onClick={() => {
              setPagina((p) => p - 1);
            }}
          >
            Aportes anteriores
          </BotonAccion>
          <span className="py-3">Página {pagina + 1}</span>
          <BotonAccion
            tono="papel"
            disabled={(pagina + 1) * 200 >= total || q.isFetching}
            onClick={() => {
              setPagina((p) => p + 1);
            }}
          >
            Más aportes
          </BotonAccion>
        </div>
      )}
    </section>
  );
}
