import { cantidadDe } from './presentacion';

import type { AnalisisOpiniones } from '@v2/civic-core';
import type { DisenoFicha } from '@v2/shared';

function apoyoEnCastellano(apoyo: number | null): string {
  return apoyo === null
    ? 'pendiente'
    : apoyo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resumenDeParticipacion({ participantes, incluidos }: AnalisisOpiniones): string {
  if (participantes === 0) return 'Todavía nadie vio ni respondió estas afirmaciones.';
  const vieron =
    participantes === 1
      ? '1 cuenta vio o respondió estas afirmaciones.'
      : `${participantes} cuentas vieron o respondieron estas afirmaciones.`;
  if (incluidos === 0)
    return `${vieron} Ninguna respondió lo suficiente como para entrar en la lectura por grupos.`;
  return `${vieron} ${incluidos === 1 ? '1 respondió' : `${incluidos} respondieron`} lo suficiente como para entrar en la lectura por grupos.`;
}

/** Qué dicen las respuestas y con qué método y límites se leen. */
export function LecturaDeRespuestas({
  afirmaciones,
  analisis,
}: {
  afirmaciones: DisenoFicha['afirmaciones'];
  analisis: AnalisisOpiniones;
}) {
  return (
    <>
      <section className="border-tinta/25 mt-9 border-t pt-6" aria-labelledby="lectura-respuestas">
        <h4 id="lectura-respuestas" className="font-anton text-2xl">
          Lectura de las respuestas
        </h4>
        <p className="mt-3 text-sm leading-relaxed">{analisis.motivo}</p>
        <p className="text-tinta-50 mt-3 text-sm">{resumenDeParticipacion(analisis)}</p>
        {analisis.grupos.length ? (
          <>
            <ul className="mt-4 flex flex-wrap gap-4">
              {analisis.grupos.map((g) => (
                <li key={g.nombre} className="border-tinta border px-4 py-3">
                  {g.nombre}: {cantidadDe(g.cuentas, 'cuenta', 'cuentas')}
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-3">
              {analisis.condiciones.map((c) => (
                <li key={c.afirmacion} className="border-tinta border p-4">
                  <p>{afirmaciones.find((a) => a.id === c.afirmacion)?.texto}</p>
                  <p className="mt-2 text-sm">
                    {c.grupos
                      .map(
                        (g) =>
                          `${g.nombre}: ${g.acuerdos === null ? 'datos insuficientes' : `${cantidadDe(g.acuerdos, 'acuerdo', 'acuerdos', 'ningún acuerdo')} de ${g.respuestas === null ? '—' : cantidadDe(g.respuestas, 'respuesta', 'respuestas', 'ninguna respuesta')}`}`,
                      )
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
      <section className="border-tinta/25 mt-9 border-t pt-6" aria-labelledby="metodo-limites">
        <h4 id="metodo-limites" className="font-anton text-2xl">
          Método y límites
        </h4>
        <p className="mt-3 text-sm leading-relaxed">
          El indicador de apoyo distribuido va de 0 a 1 y es alto solo cuando los dos grupos
          coinciden en estar de acuerdo; sirve para comparar afirmaciones dentro de esta lectura y
          no es una votación.
        </p>
        {analisis.condiciones.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {analisis.condiciones.map((c) => (
              <li key={c.afirmacion}>
                {afirmaciones.find((a) => a.id === c.afirmacion)?.texto} ·{' '}
                <strong>{apoyoEnCastellano(c.apoyo)}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-tinta-75 mt-3 text-sm leading-relaxed">
          El pase cuenta como respuesta; la ausencia no se interpreta como acuerdo. Los grupos son
          una hipótesis de esta ficha y no una identidad política ni una representación del país.
        </p>
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer py-3 text-sm underline">
            Detalle técnico del método
          </summary>
          <p className="text-tinta-75 mt-2 text-sm leading-relaxed">{analisis.metodo}</p>
        </details>
      </section>
    </>
  );
}
