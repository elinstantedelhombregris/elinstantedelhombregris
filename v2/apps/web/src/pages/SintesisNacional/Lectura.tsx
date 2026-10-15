import { Link } from 'wouter';

import { ESTADOS } from './estados';

import type { EdicionSintesisNacional } from '@v2/shared';

const TIPOS = {
  propuesta: 'Propuesta sin acuerdo atribuido',
  acuerdo_participantes: 'Acuerdo entre participantes del proceso',
  hecho_revisado: 'Resultado de campo con revisión',
};
export function LecturaSintesis({ edicion: e }: { edicion: EdicionSintesisNacional }) {
  return (
    <article className="min-w-0">
      <p className="font-semibold">{ESTADOS[e.estado]}</p>
      <p className="mt-2 text-sm">
        Autor: @{e.autor}.{' '}
        {e.revisor
          ? `Revisión: @${e.revisor}, ${new Date(e.revisadaEn ?? e.creadaEn).toLocaleDateString('es-AR')}.`
          : 'Falta la revisión de otra persona editora de las fichas seleccionadas.'}
      </p>
      <p className="mt-3">
        Selección editorial de quienes participan. No expresa un mandato de toda la población ni una
        auditoría independiente. La cantidad de apoyos no determina la urgencia.
      </p>
      {e.revisionVencida && (
        <p className="mt-3 font-semibold">
          La fecha prevista de revisión ya pasó. Revisá la vigencia antes de usar esta lectura.
        </p>
      )}
      {e.contenido ? (
        <>
          <h2 className="font-anton mt-6 text-4xl">{e.contenido.titulo}</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            {(
              [
                ['alcance', 'A quiénes comprende'],
                ['criterio', 'Criterio de selección'],
                ['metodo', 'Cómo se elaboró'],
                ['ausencias', 'Quiénes y qué faltan'],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words">{e.contenido?.[k]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4">Próxima revisión: {e.contenido.proximaRevision}.</p>
          <ol className="mt-8 space-y-8">
            {e.contenido.referencias.map((r, i) => {
              const a = e.apoyos.find(
                (a) => a.fichaId === r.fichaId && a.objetivoId === r.objetivoId,
              );
              return (
                <li className="border-tinta/40 border-t pt-5" key={`${r.fichaId}/${r.objetivoId}`}>
                  <p className="text-sm">
                    Objetivo {i + 1} · {TIPOS[r.tipo]}
                  </p>
                  <h3 className="font-anton mt-2 text-3xl">
                    {a?.objetivo.titulo ?? 'Objetivo no disponible'}
                  </h3>
                  {a && (
                    <>
                      <p className="mt-3 whitespace-pre-wrap break-words">
                        Futuro deseado: {a.objetivo.resultado}
                      </p>
                      <p className="mt-3">
                        Territorio de la ficha: {a.territorio ?? 'Todo el país, según la ficha'}.
                        Escala propuesta: {a.objetivo.escala.replaceAll('_', ' ')}. Horizonte:{' '}
                        {a.objetivo.horizonte}.
                      </p>
                      <p className="mt-3">
                        Institución propuesta:{' '}
                        {a.objetivo.institucionPropuesta || 'Por identificar'}. Competencia:{' '}
                        {a.objetivo.competencia === 'documentada'
                          ? 'Documentada por el equipo; consultá su fuente'
                          : 'Por validar'}
                        .
                      </p>
                      <p className="mt-3">
                        Indicador: {a.objetivo.indicador}. Base:{' '}
                        {a.objetivo.lineaBase ?? 'pendiente'}; meta:{' '}
                        {a.objetivo.meta ?? 'pendiente'} {a.objetivo.unidad}.{' '}
                        {a.objetivo.tareaPendiente}
                      </p>
                    </>
                  )}
                  <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    {(
                      [
                        ['variantes', 'Diferencias entre territorios'],
                        ['recursos', 'Recursos y límites'],
                        ['alternativas', 'Alternativas consideradas'],
                        ['tensiones', 'Disensos y tensiones'],
                        ['tarea', 'Próxima tarea'],
                      ] as const
                    ).map(([k, label]) => (
                      <div key={k}>
                        <dt className="font-semibold">{label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words">{r[k]}</dd>
                      </div>
                    ))}
                  </dl>
                  {a?.sintesis && (
                    <div className="mt-4">
                      <p className="font-semibold">Proceso de la ficha: acuerdos y disensos</p>
                      <p>{a.sintesis.alcance}</p>
                      <ul className="mt-2 list-disc pl-5">
                        {a.sintesis.acuerdos.map((ac, j) => (
                          <li key={j}>{ac.texto}</li>
                        ))}
                      </ul>
                      <p className="mt-2 whitespace-pre-wrap break-words">
                        Disensos del proceso: {a.sintesis.disensos}
                      </p>
                      <p>Ausencias: {a.sintesis.ausencias}</p>
                    </div>
                  )}
                  {a?.resultado && (
                    <div className="mt-4">
                      <p className="font-semibold">Resultado de campo: {a.resultado.titulo}</p>
                      <p className="whitespace-pre-wrap break-words">{a.resultado.texto}</p>
                      <p>
                        Revisión {a.resultado.revision}: {a.resultado.nota}
                      </p>
                    </div>
                  )}
                  <p className="mt-4">
                    <Link
                      className="inline-flex min-h-11 items-center underline"
                      href={`/fichas/${r.fichaId}#evidencia`}
                    >
                      Abrir {a?.titulo ?? 'ficha'} · revisión citada {r.revision}
                    </Link>
                  </p>
                  <ul className="mt-3 space-y-2">
                    {a?.fuentes.map((f) => (
                      <li key={f.id}>
                        <a className="underline" href={f.url} target="_blank" rel="noreferrer">
                          {f.titulo} · {f.institucion}
                        </a>
                        <p className="text-sm">
                          Referencia: {f.referencia}. Universo: {f.universo}. Límites: {f.limites}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <Link
                      className="inline-flex min-h-11 items-center underline"
                      href={`/fichas/${r.fichaId}#conversacion`}
                    >
                      Revisar argumentos del proceso
                    </Link>
                    {r.resultadoCampo && (
                      <Link
                        className="inline-flex min-h-11 items-center underline"
                        href={`/fichas/${r.fichaId}#resultados-campo`}
                      >
                        Abrir el resultado y su tarea de origen
                      </Link>
                    )}
                  </div>
                  {!a?.fuentes.length && (
                    <p className="mt-2">Este objetivo todavía no tiene fuentes enlazadas.</p>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="mt-6" role="status">
          El contenido se ocultó porque la edición fue retirada o cambió alguno de sus apoyos. Esta
          dirección conserva la referencia, sin reproducir el texto anterior.
        </p>
      )}
      <details className="border-tinta/30 mt-8 border-t pt-5">
        <summary className="cursor-pointer">Cómo citar y comprobar esta edición</summary>
        <p className="mt-3 break-all">
          Edición {e.id}, creada {e.creadaEn}. Consulta {e.consultadaEn}.
        </p>
        <p className="mt-3 break-words">
          Ediciones disponibles al preparar esta lectura: geografía {e.versionGeo}; nomenclador{' '}
          {e.versionCenso}. Estas referencias no certifican equivalencia de límites.
        </p>
        <code className="mt-2 block break-all text-xs">
          Huella SHA-256 del envío editorial: {e.huella}
        </code>
        <p className="mt-3">
          Las correcciones producen otra edición. La lectura pública aplica retiros y oculta
          contenido desactualizado; una descarga anterior no se puede revocar.
        </p>
        {e.anteriorId && (
          <Link
            className="mt-3 inline-flex min-h-11 items-center underline"
            href={`/sintesis-nacional/${e.anteriorId}`}
          >
            Ver la edición anterior
          </Link>
        )}
      </details>
    </article>
  );
}
