import { TerritorioDocumentado } from './TerritorioDocumentado';

import type { FuenteFicha, ObjetivoFicha } from '@v2/shared';

export function LeerObjetivo({
  objetivo: o,
  fuentes,
}: {
  objetivo: ObjetivoFicha;
  fuentes: FuenteFicha[];
}) {
  return (
    <article className="border-tinta border p-5" id={`objetivo-${o.id}`}>
      <h3 className="font-anton text-2xl">{o.titulo}</h3>
      <p className="mt-3">{o.resultado}</p>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Alcance y horizonte</dt>
          <dd>
            {o.ambito} · revisión: {o.horizonte}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Territorios del objetivo</dt>
          <dd>
            {o.territorios.length
              ? o.territorios.map((id) => (
                  <span key={id} className="mr-4">
                    <TerritorioDocumentado id={id} />
                  </span>
                ))
              : 'Sin territorios específicos declarados'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Indicador</dt>
          <dd>
            {o.indicador} · {o.unidad}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Base → meta propuesta</dt>
          <dd>
            {o.lineaBase === null
              ? 'Base pendiente'
              : `${o.lineaBase.toLocaleString('es-AR')} (${o.fechaBase ?? 'Fecha pendiente'})`}{' '}
            → {o.meta === null ? 'Meta pendiente' : o.meta.toLocaleString('es-AR')}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Comprobación</dt>
          <dd>{o.metodo}</dd>
        </div>
        <div>
          <dt className="font-semibold">Próxima investigación</dt>
          <dd>{o.tareaPendiente || 'Sin tarea pendiente declarada.'}</dd>
        </div>
        <div>
          <dt className="font-semibold">Decisión y competencia</dt>
          <dd>
            {o.escala.replaceAll('_', ' ')} · {o.institucionPropuesta || 'Institución pendiente'} ·{' '}
            {o.competencia === 'documentada' ? 'Competencia documentada' : 'Por validar'}. No
            constituye una obligación aceptada.
          </dd>
        </div>
        {(['principios', 'gravedad', 'desigualdad', 'viabilidad'] as const).map((k) => (
          <div key={k}>
            <dt className="font-semibold capitalize">{k}</dt>
            <dd>{o[k] || 'Pendiente de documentar.'}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4">
        {[...new Set([...o.fuenteIds, ...(o.fuenteCompetencia ? [o.fuenteCompetencia] : [])])].map(
          (id) => (
            <li key={id}>
              <a className="inline-flex min-h-11 underline" href={`#fuente-${id}`}>
                {fuentes.find((f) => f.id === id)?.titulo ?? 'Fuente pendiente'}
              </a>
            </li>
          ),
        )}
      </ul>
    </article>
  );
}
