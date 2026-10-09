import { LecturaFicha } from './LecturaFicha';
import { LEAD_FICHA } from './presentacion';
import { VolverALasFichas } from './VolverALasFichas';

import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useFicha } from '~/lib/queries/fichas';

export function DetalleFicha({ id }: { id: string }) {
  const detalle = useFicha(id);
  if (detalle.data) return <LecturaFicha ficha={detalle.data} />;
  return (
    <MarcoParticipacion titulo="Ficha" entrada={LEAD_FICHA} kicker="La ciudadanía diseña · Fichas">
      <VolverALasFichas className="mb-6" />
      {detalle.isError ? (
        <p role="alert">
          No pudimos abrir esta ficha.{' '}
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              void detalle.refetch();
            }}
          >
            Reintentar
          </button>
        </p>
      ) : (
        <p role="status">Cargando la ficha…</p>
      )}
    </MarcoParticipacion>
  );
}
