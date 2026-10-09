import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';

import { BorradoresLocales } from './MiEspacio/Borradores';
import { Cuenta } from './MiEspacio/Cuenta';
import { MisAportes } from './MiEspacio/MisAportes';
import { MisProcesos } from './MiEspacio/MisProcesos';
import { Recuperar } from './MiEspacio/Recuperar';

import type { EspacioPersonal } from '@v2/shared';

import {
  MarcoParticipacion,
  BotonAccion,
  EnlaceAccion,
  ErrorOperacion,
  Nota,
} from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { useMiEspacio, useOperacionPersonal } from '~/lib/queries/participacion';

const PESTANAS = [
  'Mis aportes',
  'Lo que sigo',
  'Mis borradores',
  'Mis análisis',
  'Avisos',
  'Cuenta y datos',
];
export function MiEspacio() {
  const auth = useAuth();
  const q = useMiEspacio(auth.user?.id);
  const [pestana, setPestana] = useState(0);
  return (
    <MarcoParticipacion
      titulo="Tu parte del país que imaginamos."
      entrada="Una voz necesita poder volver a sus manos. Acá seguís lo que compartiste, los procesos que elegiste y lo que todavía querés pensar."
      kicker="Mi espacio privado"
    >
      <nav aria-label="Mi espacio" className="mb-8 flex flex-wrap gap-2">
        {PESTANAS.map((p, i) => (
          <button
            type="button"
            key={p}
            aria-pressed={pestana === i}
            onClick={() => {
              setPestana(i);
            }}
            className={`font-space min-h-11 border px-4 py-3 text-xs ${pestana === i ? 'bg-tinta text-papel' : 'bg-papel text-tinta'}`}
          >
            {p}
          </button>
        ))}
      </nav>
      {pestana === 2 ? (
        <BorradoresLocales />
      ) : auth.isLoading ? (
        <p>Abriendo tu espacio…</p>
      ) : !auth.user ? (
        <Nota>
          Podés imaginar sin cuenta. Ingresar te permite recuperar aportes entre dispositivos y
          seguir sus procesos.{' '}
          <div className="mt-4 flex flex-wrap gap-3">
            <EnlaceAccion href="/ingresar?volver=%2Fmi-espacio">Ingresar</EnlaceAccion>
            <EnlaceAccion secundario href="/registrarse?volver=%2Fmi-espacio">
              Crear mi cuenta
            </EnlaceAccion>
          </div>
        </Nota>
      ) : (
        <>
          <ErrorOperacion mensaje={q.error?.message} />
          {q.isLoading ? (
            <p>Buscando tus aportes y seguimientos…</p>
          ) : q.data ? (
            <>
              {pestana === 0 ? (
                <>
                  <MisAportes aportes={q.data.aportes} total={q.data.totalAportes} />
                  <MisProcesos procesos={q.data.procesos ?? []} />
                  <Recuperar />
                </>
              ) : pestana === 1 ? (
                <Seguidos espacio={q.data} />
              ) : pestana === 3 ? (
                <AnalisisGuardados espacio={q.data} />
              ) : pestana === 4 ? (
                <Avisos />
              ) : (
                <Cuenta
                  nombre={auth.user.name}
                  email={auth.user.email}
                  verificado={auth.user.emailVerified}
                  salir={() => {
                    auth.logout.mutate();
                  }}
                />
              )}
            </>
          ) : (
            <p>Tu espacio no pudo leerse. Conservamos el recorrido; probá recargar.</p>
          )}
        </>
      )}
    </MarcoParticipacion>
  );
}
function Seguidos({ espacio }: { espacio: EspacioPersonal }) {
  const op = useOperacionPersonal();
  return (
    <section>
      <h2 className="font-anton text-3xl">Las mesas a las que querés volver.</h2>
      <p className="mt-3">
        Seguir un proceso es una elección privada. No cuenta como apoyo ni como voto.
      </p>
      <ErrorOperacion mensaje={op.error?.message} />
      <ul className="mt-6 divide-y border-y">
        {espacio.seguimientos.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <Link href={s.href} className="text-violeta underline">
              {s.titulo}
            </Link>
            <BotonAccion
              tono="papel"
              disabled={op.isPending}
              onClick={() => {
                op.mutate({ metodo: 'delete', ruta: `/api/v1/mi-espacio/seguimientos/${s.id}` });
              }}
            >
              Dejar de seguir
            </BotonAccion>
          </li>
        ))}
      </ul>
      {!espacio.seguimientos.length ? (
        <Nota>
          Todavía no elegiste un proceso. Encontrá una campaña o una ficha y decidí si querés
          acompañarla.
        </Nota>
      ) : null}
      <EnlaceAccion href="/campanas">Explorar campañas</EnlaceAccion>
    </section>
  );
}
function AnalisisGuardados({ espacio }: { espacio: EspacioPersonal }) {
  const op = useOperacionPersonal();
  return (
    <section>
      <h2 className="font-anton text-3xl">Preguntas que querés volver a mirar.</h2>
      <p className="mt-3 text-sm">
        Guardamos filtros y referencia al corte. Los textos vivos respetan correcciones y retiros;
        no archivamos una copia privada para eludirlos.
      </p>
      <ul className="mt-6 divide-y border-y">
        {espacio.analisis.map((a) => (
          <li key={a.id} className="py-5">
            <Link
              href={`/la-radiografia?${new URLSearchParams(a.consulta).toString()}`}
              className="text-violeta underline"
            >
              {a.nombre}
            </Link>
            <p className="mt-2 text-sm">
              Corte al guardar:{' '}
              {a.corte ? new Date(a.corte).toLocaleString('es-AR') : 'todavía sin análisis'}
            </p>
            <BotonAccion
              tono="papel"
              className="mt-3"
              disabled={op.isPending}
              onClick={() => {
                op.mutate({ metodo: 'delete', ruta: `/api/v1/mi-espacio/analisis/${a.id}` });
              }}
            >
              Quitar de mis análisis
            </BotonAccion>
          </li>
        ))}
      </ul>
      <ErrorOperacion mensaje={op.error?.message} />
      {!espacio.analisis.length ? (
        <Nota>Desde Radiografía podés guardar una lectura y seguir cómo cambia.</Nota>
      ) : null}
      <EnlaceAccion href="/la-radiografia">Abrir Radiografía</EnlaceAccion>
    </section>
  );
}
function Avisos() {
  const auth = useAuth();
  const q = useQuery({
    queryKey: ['avisos-civicos', auth.user?.id],
    queryFn: () =>
      api.get<
        { id: string; titulo: string; href: string; leidoEn: string | null; fecha: string }[]
      >('/api/v1/mi-espacio/avisos'),
  });
  const op = useOperacionPersonal();
  return (
    <section>
      <h2 className="font-anton text-3xl">Lo que cambió desde tu última visita.</h2>
      <ErrorOperacion mensaje={q.error?.message ?? op.error?.message} />
      <ul className="mt-6 divide-y border-y">
        {q.data?.map((a) => (
          <li key={a.id} className="py-5">
            <Link href={a.href} className="text-violeta underline">
              {a.titulo}
            </Link>
            <p className="mt-2 text-sm">{new Date(a.fecha).toLocaleString('es-AR')}</p>
            {!a.leidoEn ? (
              <BotonAccion
                tono="papel"
                className="mt-3"
                onClick={() => {
                  op.mutate({ metodo: 'post', ruta: `/api/v1/mi-espacio/avisos/${a.id}/leido` });
                }}
              >
                Marcar como leído
              </BotonAccion>
            ) : null}
          </li>
        ))}
      </ul>
      {q.data?.length === 0 ? (
        <Nota>
          Cuando un proceso seguido publique una devolución o cambie de fase, aparecerá acá. La
          devolución sigue disponible aunque un aviso falle.
        </Nota>
      ) : null}
      <Link
        href="/notificaciones"
        className="text-violeta mt-5 inline-flex min-h-11 items-center underline"
      >
        Ver otros avisos de mi actividad
      </Link>
    </section>
  );
}
