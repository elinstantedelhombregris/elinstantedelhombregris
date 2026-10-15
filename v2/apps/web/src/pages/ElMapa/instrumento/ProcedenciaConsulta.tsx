import { GEOGRAFIA } from '@v2/shared';
import { Link } from 'wouter';

import { frasePorPagina } from './conteo';

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
      <p>{frasePorPagina(datos.total, datos.entregados)}</p>
      <p className="text-xs">
        Datos al {new Date(datos.hasta).toLocaleString('es-AR')}. Se cuentan aportes, no personas.
      </p>
      <Link
        href="/fuentes#geografia"
        className="inline-flex min-h-11 items-center text-xs underline"
      >
        Fuentes y límites · edición {GEOGRAFIA.obtenida}
      </Link>
      {!datos.completa ? (
        <p className="w-full">
          El mapa y el área que dibujes muestran solo esta página de aportes. Los totales por
          provincia incluyen todos los que cumplen los filtros.
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
