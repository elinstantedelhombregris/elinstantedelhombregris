import { useGeometriaProvincial } from './useGeometriaProvincial';

export function EstadoGeometria({
  falloMapa,
  tieneDatos,
  reintentarMapa,
  necesitaProvincias,
}: {
  falloMapa: boolean;
  tieneDatos: boolean;
  reintentarMapa: () => void;
  necesitaProvincias: boolean;
}) {
  const geometria = useGeometriaProvincial();
  const falloLimites = necesitaProvincias && geometria.isError;
  if (!falloMapa && !falloLimites) {
    return necesitaProvincias && geometria.isLoading ? (
      <p role="status" className="text-oscuro-texto px-4 py-2">
        Cargando límites provinciales…
      </p>
    ) : null;
  }
  return (
    <div role="alert" className="text-oscuro-texto border-oscuro-borde border-y p-4 text-sm">
      <p>
        {falloMapa ? 'Parte del mapa no pudo cargarse. ' : ''}
        {falloLimites
          ? geometria.data
            ? 'No pudimos actualizar los límites provinciales. Se conserva el último dibujo disponible. '
            : 'No pudimos cargar los límites provinciales. El sombreado no está disponible. '
          : ''}
        {tieneDatos
          ? 'Los aportes y sus totales siguen disponibles en la lista.'
          : 'Cuando lleguen los aportes, vas a poder consultarlos en la lista aunque falle el dibujo.'}
      </p>
      <button
        type="button"
        className="mt-2 min-h-11 underline"
        disabled={geometria.isFetching}
        onClick={() => {
          if (falloLimites) void geometria.refetch();
          if (falloMapa) reintentarMapa();
        }}
      >
        {geometria.isFetching ? 'Reintentando…' : 'Reintentar el mapa'}
      </button>
    </div>
  );
}
