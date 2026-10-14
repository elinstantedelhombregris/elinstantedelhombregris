import type { CapacidadPublica } from '@v2/shared';

export function ResumenCapacidad({ c }: { c: CapacidadPublica }) {
  return (
    <>
      <p className="mt-3 whitespace-pre-wrap break-words">{c.zona}</p>
      <p className="mt-2 text-sm">
        Período: {c.desde} al {c.hasta} (días UTC)
      </p>
      <p className="mt-3 font-semibold">
        {!c.vigente ? 'Oferta cerrada, vencida o sin aporte disponible' : 'Acepta solicitudes'}
      </p>
      {c.cantidad === null ? (
        <p className="mt-2">Sin cantidad definida: requiere evaluación de cada solicitud.</p>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            ['Declarada', c.cantidad],
            ['Disponible', c.disponible],
            ['Reservada', c.reservada],
            ['Recepción confirmada', c.entregada],
          ].map(([label, valor]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="font-semibold">
                {valor} {c.unidad}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {!c.vigente ? (
        <p className="mt-2 text-sm">
          Las cantidades conservan el historial del período; no habilitan nuevas reservas.
        </p>
      ) : null}
    </>
  );
}
