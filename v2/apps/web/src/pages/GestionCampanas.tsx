import { Link, useSearch } from 'wouter';

import { FormularioCampana } from './Campanas/Formulario';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { MarcoParticipacion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { hrefIngresar } from '~/lib/auth/volver';
import { useCampana, useCampanas } from '~/lib/queries/participacion';

export function GestionCampanas() {
  const auth = useAuth();
  const search = useSearch();
  const parametros = new URLSearchParams(search);
  const duplicar = parametros.get('duplicar');
  const id = parametros.get('editar') ?? duplicar;
  const campana = useCampana(id ?? undefined);
  const esAdmin = auth.user?.esAdmin === true;
  // Abrir una campaña, nueva o copiada de otra, es de la coordinación; revisar las reglas de una
  // que ya existe lo puede hacer también quien la edita. El servidor decide en los dos casos.
  const abreUnaNueva = !id || Boolean(duplicar);
  return (
    <MarcoParticipacion
      titulo="Gestión de campañas"
      entrada="Acá se prepara una campaña: la pregunta, el equipo que la coordina y la devolución que se compromete."
    >
      {auth.isLoading ? (
        <p role="status">Un momento…</p>
      ) : !auth.user ? (
        <Nota>
          Ingresá para preparar y gestionar campañas.{' '}
          <Link href={hrefIngresar()} className="text-violeta underline underline-offset-4">
            Ingresar
          </Link>
        </Nota>
      ) : abreUnaNueva && !esAdmin ? (
        <Nota>
          Por ahora las campañas las abre la coordinación de ¡BASTA!. Si querés proponer una,
          contanos en{' '}
          <Link href="/lo-que-falta" className="text-violeta underline underline-offset-4">
            Lo que falta
          </Link>
          .
        </Nota>
      ) : (
        <>
          {esAdmin ? <MisCampanas /> : null}
          {id && !campana.data ? (
            <>
              <p role="status">Buscando la campaña…</p>
              <ErrorOperacion mensaje={campana.error?.message} />
            </>
          ) : id && !duplicar && !campana.data?.puedoEditarContrato ? (
            <Nota>Las reglas de esta campaña las administra otro equipo.</Nota>
          ) : (
            <FormularioCampana
              key={`${duplicar ? 'copiar' : 'editar'}:${id ?? 'nueva'}:${campana.data?.revision ?? 0}`}
              {...(campana.data
                ? duplicar
                  ? { plantilla: campana.data.contrato }
                  : { campana: campana.data }
                : {})}
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
      <h2 className="font-anton text-2xl">Las campañas que cuidás</h2>
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
      {q.data?.length === 0 ? <p className="mt-3">Todavía no abriste ninguna campaña.</p> : null}
      <Link
        href="/gestion/campanas"
        className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
      >
        Preparar otra campaña
      </Link>
      <Link
        href="/gestion/pila"
        className="text-violeta ml-6 mt-4 inline-flex min-h-11 items-center underline"
      >
        Reportes y retenciones de Mirar →
      </Link>
    </section>
  );
}
