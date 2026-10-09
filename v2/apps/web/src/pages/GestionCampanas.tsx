import { Link, useSearch } from 'wouter';

import { FormularioCampana } from './Campanas/Formulario';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { MarcoParticipacion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useCampana, useCampanas } from '~/lib/queries/participacion';

export function GestionCampanas() {
  const auth = useAuth();
  const search = useSearch();
  const parametros = new URLSearchParams(search);
  const duplicar = parametros.get('duplicar');
  const id = parametros.get('editar') ?? duplicar;
  const campana = useCampana(id ?? undefined);
  return (
    <MarcoParticipacion
      titulo="Abrir una mesa también es cuidarla."
      entrada="Prepará una campaña con una pregunta clara, un equipo y una devolución que podamos sostener."
      kicker="Gestión de campañas"
    >
      {!auth.user ? (
        <Nota>
          Ingresá para preparar un contrato y gestionar sus revisiones.{' '}
          <Link href={`/ingresar?volver=${encodeURIComponent('/gestion/campanas' + search)}`} className="text-violeta underline">
            Volveremos a este recorrido después de ingresar.
          </Link>
        </Nota>
      ) : (
        <>
          <MisCampanas />
          {id && !campana.data ? (
            <>
              <p>Buscando el contrato…</p>
              <ErrorOperacion mensaje={campana.error?.message} />
            </>
          ) : id && !duplicar && !campana.data?.puedoEditarContrato ? (
            <Nota>Este contrato lo administra otro equipo.</Nota>
          ) : (
            <FormularioCampana
              key={`${duplicar ? 'copiar' : 'editar'}:${id ?? 'nueva'}:${campana.data?.revision ?? 0}`}
              {...(campana.data ? duplicar ? { plantilla: campana.data.contrato } : { campana: campana.data } : {})}
            />
          )}
        </>
      )}
    </MarcoParticipacion>
  );
}
function MisCampanas() {
  const q = useCampanas(true);
  return (
    <section className="mb-9 border-b pb-6">
      <h2 className="font-anton text-2xl">Las convocatorias que cuidás</h2>
      <ErrorOperacion mensaje={q.error?.message} />
      <ul className="mt-4 space-y-3">
        {q.data?.map((c) => (
          <li key={c.id}>
            <Link href={`/campanas/${c.id}`} className="text-violeta underline">
              {c.contrato.titulo}
            </Link>{' '}
            · {FASES_ROTULO[c.estado]}
          </li>
        ))}
      </ul>
      {q.data?.length === 0 ? <p className="mt-3">La primera todavía está por abrirse.</p> : null}
      <Link
        href="/gestion/campanas"
        className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
      >
        Preparar otra campaña
      </Link>
    </section>
  );
}
