import { evidenciaTareaSchema, revisarEvidenciaSchema } from '@v2/shared';

import { AUTORIZACION, texto } from './campos';
import { FormularioGestion } from './Formulario';
import { ListaGestion } from './Lista';

import type { CampoGestion } from './campos';
import type { EvidenciaIniciativa, TareaIniciativa } from '@v2/shared';

const CAMPOS: CampoGestion[] = [
  { clave: 'titulo', etiqueta: 'Nombre de la evidencia' },
  { clave: 'texto', etiqueta: 'Resultado observado y cómo se obtuvo', tipo: 'textarea' },
  {
    clave: 'url',
    etiqueta: 'Fuente pública, si existe',
    ayuda: 'Enlace HTTP(S). No subas rostros, documentos personales ni notas privadas.',
  },
];
const ESCUCHA: CampoGestion[] = [
  { clave: 'desde', etiqueta: 'Inicio del período observado', tipo: 'date' },
  { clave: 'hasta', etiqueta: 'Fin del período observado', tipo: 'date' },
  {
    clave: 'observaciones',
    etiqueta: 'Número de encuentros u observaciones',
    tipo: 'number',
    ayuda: 'No son personas únicas ni porcentaje de población. Cero solo si se comprobó.',
  },
  { clave: 'ausencias', etiqueta: 'A quiénes faltó escuchar', tipo: 'textarea' },
  { clave: 'limites', etiqueta: 'Límites del método y de la invitación', tipo: 'textarea' },
  { clave: 'proximoPaso', etiqueta: 'Próximo paso de escucha', tipo: 'textarea' },
];
function Evidencia({ id, e }: { id: number; e: EvidenciaIniciativa }) {
  return (
    <article className="border-tinta/30 space-y-3 border p-4">
      <h4 className="font-semibold">{e.titulo}</h4>
      <p className="whitespace-pre-wrap">{e.texto}</p>
      {e.url ? (
        <a className="break-all underline" href={e.url} target="_blank" rel="noreferrer">
          Consultar fuente
        </a>
      ) : null}
      {e.resultadoEscucha ? (
        <div className="space-y-2 text-sm">
          <p>
            Período: {e.resultadoEscucha.desde} a {e.resultadoEscucha.hasta}. Observaciones:{' '}
            {e.resultadoEscucha.observaciones}.
          </p>
          <p>Ausencias: {e.resultadoEscucha.ausencias}</p>
          <p>Límites: {e.resultadoEscucha.limites}</p>
          <p>Próximo paso: {e.resultadoEscucha.proximoPaso}</p>
        </div>
      ) : null}
      <p>
        {e.revisada
          ? `Revisión registrada por ${e.firmaRevision ?? 'otra cuenta'}.`
          : 'Pendiente de revisión por otra cuenta.'}
      </p>
      {e.notaRevision ? <p>{e.notaRevision}</p> : null}
      {e.puedoRetirar || e.puedoRevisar ? (
        <details>
          <summary className="cursor-pointer underline">Revisar o retirar evidencia</summary>
          <FormularioGestion
            ruta={`/${id}/evidencias/${e.id}`}
            revision={e.revision}
            boton="Registrar decisión"
            campos={[
              {
                clave: 'accion',
                etiqueta: 'Decisión',
                opciones: [
                  ...(e.puedoRevisar ? [{ valor: 'revisar', etiqueta: 'Registrar revisión' }] : []),
                  ...(e.puedoRetirar
                    ? [{ valor: 'retirar', etiqueta: 'Retirar texto, enlace y revisión' }]
                    : []),
                ],
              },
              { clave: 'firma', etiqueta: 'Firma pública para revisar' },
              { clave: 'nota', etiqueta: 'Fundamento y límites de la decisión', tipo: 'textarea' },
            ]}
            preparar={(v, r) =>
              revisarEvidenciaSchema.parse({
                ...r,
                accion: v.accion,
                firma: texto(v, 'firma'),
                nota: texto(v, 'nota'),
              })
            }
          />
        </details>
      ) : null}
    </article>
  );
}
export function EvidenciasTarea({ id, t }: { id: number; t: TareaIniciativa }) {
  return (
    <section className="mt-5">
      <h3 className="font-anton text-2xl">Evidencia y revisión del resultado</h3>
      <p className="mt-3 text-sm">
        Otra cuenta integrante revisa el método y sus límites. Una cuenta distinta no acredita
        independencia personal ni demuestra causalidad.
      </p>
      <ListaGestion<EvidenciaIniciativa>
        ruta={`/${id}/tareas/${t.id}/evidencias`}
        vacio="Todavía no hay evidencia publicada para esta tarea."
      >
        {(e) => <Evidencia key={e.id} id={id} e={e} />}
      </ListaGestion>
      {t.puedoEvidenciar ? (
        <details className="mt-5">
          <summary className="cursor-pointer underline">Registrar evidencia del resultado</summary>
          <FormularioGestion
            ruta={`/${id}/tareas/${t.id}/evidencias`}
            boton="Publicar evidencia"
            campos={[...CAMPOS, ...(t.escucha ? ESCUCHA : []), AUTORIZACION]}
            preparar={(v, r) =>
              evidenciaTareaSchema.parse({
                ...r,
                titulo: texto(v, 'titulo'),
                texto: texto(v, 'texto'),
                url: texto(v, 'url') || null,
                autorizoPublicacion: v.autorizo,
                resultadoEscucha: t.escucha
                  ? {
                      desde: v.desde,
                      hasta: v.hasta,
                      observaciones:
                        texto(v, 'observaciones') === '' ? null : Number(v.observaciones),
                      ausencias: texto(v, 'ausencias'),
                      limites: texto(v, 'limites'),
                      proximoPaso: texto(v, 'proximoPaso'),
                    }
                  : null,
              })
            }
          />
        </details>
      ) : null}
    </section>
  );
}
