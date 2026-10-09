import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { EditarAporte } from '../Senal/EditarAporte';

import type { AportePropio } from '@v2/shared';

import { BotonAccion, EnlaceAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useOperacionPersonal } from '~/lib/queries/participacion';
import { ESTADO_EN_CASTELLANO, leerTipoSenal } from '~/lib/vocabulario';
import { etiquetaDePrecision, precisionValida } from '~/pages/ElMapa/lienzo/precision';

/** Lo que se lee en la fila de un aporte: ningún valor crudo de la base. */
function rotuloDeTipo(tipo: string): string {
  const lectura = leerTipoSenal(tipo);
  return lectura.reconocido ? lectura.tipo : 'sin clasificar';
}

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
  const sinAportes = pagina === 0 && aportes.length === 0;
  const [retirando, setRetirando] = useState<string | null>(null);
  const op = useOperacionPersonal();
  return (
    <section aria-labelledby="mis-aportes-titulo">
      <h2 id="mis-aportes-titulo" className="font-anton text-3xl">
        Mis aportes
      </h2>
      {lista.length ? (
        <p className="mt-3 text-sm leading-relaxed">
          Podés corregir o retirar cada aporte y ver en qué campaña está.{' '}
          {total > lista.length
            ? `Mostrando ${lista.length} de ${total}. Con «Descargar mis datos», en Cuenta y datos, te llevás todos.`
            : ''}
        </p>
      ) : null}
      <ErrorOperacion mensaje={op.error?.message} />
      {sinAportes ? (
        <div className="mt-6">
          <p className="leading-relaxed">Todavía no publicaste nada desde esta cuenta.</p>
          <div className="mt-5">
            <EnlaceAccion href={APORTAR_HREF}>Imaginar mi Argentina</EnlaceAccion>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {lista.map((a) => (
            <li key={a.id} className="bg-papel-crudo border p-5">
              <p className="font-space text-violeta text-xs uppercase">
                {rotuloDeTipo(a.tipo)} · {ESTADO_EN_CASTELLANO[a.estado] ?? 'estado sin clasificar'}{' '}
                · {new Date(a.creadaEn).toLocaleDateString('es-AR')}
              </p>
              <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">
                {a.estado === 'retirada' ? 'El texto fue retirado.' : a.texto}
              </p>
              <p className="text-tinta-50 mt-3 text-sm">
                {a.cedeLicencia
                  ? 'Cualquiera puede leer y compartir este texto (licencia CC BY 4.0).'
                  : 'El texto está reservado: no aparece en lecturas ni descargas públicas.'}{' '}
                Ubicación publicada: {etiquetaDePrecision(precisionValida(a.precision))}.
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
                      className="text-sello min-h-11 underline"
                      onClick={() => {
                        setRetirando(a.id);
                      }}
                    >
                      Retirar
                    </button>
                    <Link
                      href={`/fichas/nueva?senal=${a.id}`}
                      className="text-violeta inline-flex min-h-11 items-center underline"
                    >
                      Armar una ficha con este aporte
                    </Link>
                  </>
                ) : null}
              </div>
              {a.estado !== 'retirada' ? <EditarAporte id={a.id} /> : null}
              {retirando === a.id ? (
                <Nota>
                  <p>
                    El aporte deja de mostrarse en el mapa y en las lecturas. Lo que otras personas
                    ya descargaron no se puede recuperar.
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
