import { Link } from 'wouter';

import { GestionFase } from '../GestionFase';
import { esEdicionAnterior } from '../presentacion';

import type { CampanaPublica } from '@v2/shared';

import { EnlaceAccion } from '~/components/participacion/Elementos';
import { Equipo } from '~/components/participacion/Equipo';

/**
 * Lo que solo ve quien coordina: abrir otra campaña desde esta, revisar las reglas, cambiar de
 * etapa e invitar al equipo. Que se oculte a los demás es cosmético: el servidor decide.
 */
export function PanelCoordinacion({
  campana: c,
  esAdmin,
}: {
  campana: CampanaPublica;
  esAdmin: boolean;
}) {
  const historica = esEdicionAnterior(c);
  const hayAlgo = [
    esAdmin,
    c.puedoEditarContrato === true,
    c.puedoEditar && !historica,
    c.puedoInvitar === true,
  ].some(Boolean);
  if (!hayAlgo) return null;
  return (
    <aside className="border-tinta/25 mt-8 border-t pt-6" aria-label="Coordinación de la campaña">
      {esAdmin ? (
        <Link
          href={`/gestion/campanas?duplicar=${c.id}`}
          className="text-violeta inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Tomar esta configuración para abrir otra campaña
        </Link>
      ) : null}
      {c.puedoEditarContrato ? (
        <div className="mt-4">
          <EnlaceAccion secundario href={`/gestion/campanas?editar=${c.id}`}>
            Revisar las reglas
          </EnlaceAccion>
        </div>
      ) : null}
      {esAdmin && c.puedoEditar && !historica ? <GestionFase campana={c} /> : null}
      {c.puedoInvitar && !historica ? <Equipo tipo="campana" objeto={c.id} /> : null}
    </aside>
  );
}
