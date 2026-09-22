interface EstadoConsultaProps {
  cargando: boolean;
  fallo: boolean;
  tieneDatos: boolean;
  actualizadoEn: number;
  reintentar: () => void;
}

/** Una consulta fallida no permite afirmar nada sobre el territorio. */
export function EstadoConsulta({
  cargando,
  fallo,
  tieneDatos,
  actualizadoEn,
  reintentar,
}: EstadoConsultaProps) {
  if (!cargando && !fallo) return null;
  return (
    <div
      role={fallo ? 'alert' : 'status'}
      className="border-oscuro-borde bg-oscuro-barra text-oscuro-texto border-b px-5 py-4 text-sm"
    >
      <p>
        {fallo
          ? tieneDatos
            ? 'No pudimos actualizar los datos. Estás viendo la última lectura recibida.'
            : 'No pudimos cargar los datos. No sabemos cuántos registros hay en este territorio.'
          : 'Cargando los registros del territorio…'}
      </p>
      {tieneDatos && actualizadoEn > 0 ? (
        <p className="mt-1 text-xs">
          Última lectura: {new Date(actualizadoEn).toLocaleString('es-AR')}.
        </p>
      ) : null}
      {fallo ? (
        <button type="button" onClick={reintentar} className="mt-2 min-h-11 underline">
          Volver a intentar
        </button>
      ) : null}
    </div>
  );
}
