import type { LecturaMapa } from '~/lib/queries/civic-map';

export function ProcedenciaConsulta({
  datos,
  siguiente,
  inicio,
}: {
  datos: LecturaMapa['metadata'];
  siguiente: () => void;
  inicio: () => void;
}) {
  return (
    <div
      className="border-oscuro-borde text-oscuro-texto flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-5 py-3 text-sm"
      aria-label="Alcance de la lectura"
    >
      <p>
        <strong>{datos.total.toLocaleString('es-AR')}</strong> registros en la consulta ·{' '}
        {datos.entregados.toLocaleString('es-AR')} en esta página.
      </p>
      <p className="text-xs">
        Corte: {new Date(datos.hasta).toLocaleString('es-AR')}. Se cuentan registros, no personas.
      </p>
      {!datos.completa ? (
        <p className="w-full">
          El dibujo y el área trazada muestran solo esta página. Los totales por provincia incluyen
          todos los registros de la consulta.
        </p>
      ) : null}
      {!datos.completa ? (
        <button type="button" onClick={inicio} className="min-h-11 underline">
          Primera página
        </button>
      ) : null}
      {datos.siguiente ? (
        <button type="button" onClick={siguiente} className="min-h-11 underline">
          Página siguiente
        </button>
      ) : null}
    </div>
  );
}
