import { estadoTareaSchema } from '@v2/shared';
import { useState } from 'react';
import { Link } from 'wouter';

import { AbrirCuaderno } from '../Campo/Abrir';

import { texto, ESTADOS_TAREA } from './campos';
import { EvidenciasTarea } from './Evidencias';
import { FormularioGestion } from './Formulario';
import { ListaGestion } from './Lista';
import { RecursosTareaPanel } from './Recursos';
import { TareaFormulario } from './TareaFormulario';

import type { TareaIniciativa } from '@v2/shared';

function Tarjeta({ id, t }: { id: number; t: TareaIniciativa }) {
  const [recursos, setRecursos] = useState(false);
  const [evidencia, setEvidencia] = useState(false);
  const opciones = [
    ...(t.puedoAceptar ? [{ valor: 'aceptar', etiqueta: 'Acepto hacerme cargo' }] : []),
    ...(t.puedoGestionar && ['todo', 'blocked'].includes(t.estado)
      ? [{ valor: 'iniciar', etiqueta: 'Iniciar o retomar' }]
      : []),
    ...(t.puedoGestionar && t.estado === 'in_progress'
      ? [
          { valor: 'pausar', etiqueta: 'Pausar' },
          { valor: 'realizada', etiqueta: 'Declarar ejecución realizada' },
        ]
      : []),
    ...(t.puedoGestionar && ['todo', 'in_progress', 'blocked'].includes(t.estado)
      ? [{ valor: 'liberar', etiqueta: 'Liberar mi responsabilidad' }]
      : []),
    ...(t.puedoEditar ? [{ valor: 'cancelar', etiqueta: 'Cancelar tarea sin responsable' }] : []),
  ];
  return (
    <article id={`tarea-${t.id}`} className="border-tinta space-y-3 border p-5">
      <p className="text-sm">
        {ESTADOS_TAREA[t.estado] ?? t.estado} · versión {t.revision}
      </p>
      <h3 className="font-anton text-2xl">{t.titulo}</h3>
      <p>{t.alcance}</p>
      <p>
        Revisión prevista: {t.fecha || 'pendiente'}. Responsable:{' '}
        {t.firma ?? 'pendiente de aceptación'}.
      </p>
      <p>Recursos: {t.recursos || 'pendientes de detallar'}</p>
      {t.fecha &&
      t.fecha < new Date().toISOString().slice(0, 10) &&
      !['done', 'cancelled'].includes(t.estado) ? (
        <p className="text-sm">
          Pasó la fecha prevista. Falta actualizar el seguimiento; esto no determina incumplimiento.
        </p>
      ) : null}
      {t.escucha ? (
        <div className="border-tinta/30 space-y-2 border-t pt-3 text-sm">
          <p>
            Escucha {t.escucha.canal} · {t.escucha.zona}
          </p>
          <p>
            Unidad: {t.escucha.unidad} · versión {t.escucha.versionUnidad}
          </p>
          <p>Invitación y límites previstos: {t.escucha.convocatoria}</p>
          <Link className="underline" href="/imaginar">
            Registrar un aporte autorizado
          </Link>
          <p>
            Las notas privadas de campo se conservan en el dispositivo. Compartí solo lo que tenga
            autorización; después registrá acá un resumen sin datos personales.
          </p>
        </div>
      ) : null}
      <button
        className="min-h-11 underline"
        onClick={() => {
          setRecursos(!recursos);
        }}
      >
        {recursos ? 'Ocultar reservas' : 'Ver reservas de recursos'}
      </button>
      {recursos ? <RecursosTareaPanel id={id} t={t} /> : null}
      <AbrirCuaderno id={id} t={t} />
      {t.derivada ? (
        <p>
          Esta tarea se actualiza desde la prueba de su ficha. Consultá la pestaña Acciones de
          fichas.
        </p>
      ) : (
        <>
          {opciones.length ? (
            <details>
              <summary className="cursor-pointer underline">Aceptar o registrar un paso</summary>
              <p className="mt-3 text-sm">
                El paso, la firma y su nota serán públicos. Omití datos personales de otras
                personas.
              </p>
              <FormularioGestion
                ruta={`/${id}/tareas/${t.id}/estado`}
                revision={t.revision}
                boton="Registrar paso"
                campos={[
                  { clave: 'accion', etiqueta: 'Paso', opciones },
                  { clave: 'firma', etiqueta: 'Firma pública al aceptar' },
                  { clave: 'nota', etiqueta: 'Qué cambia y por qué', tipo: 'textarea' },
                ]}
                preparar={(v, r) =>
                  estadoTareaSchema.parse({
                    ...r,
                    accion: v.accion,
                    firma: texto(v, 'firma'),
                    nota: texto(v, 'nota'),
                  })
                }
              />
            </details>
          ) : null}
          {t.puedoEditar ? (
            <details>
              <summary className="cursor-pointer underline">
                Editar alcance antes de su aceptación
              </summary>
              <TareaFormulario id={id} tarea={t} escucha={Boolean(t.escucha)} />
            </details>
          ) : null}
          <button
            className="min-h-11 underline"
            onClick={() => {
              setEvidencia(!evidencia);
            }}
          >
            {evidencia ? 'Ocultar evidencia' : 'Ver evidencia y resultados'}
          </button>
          {evidencia ? <EvidenciasTarea id={id} t={t} /> : null}
        </>
      )}
    </article>
  );
}
export function TareasIniciativa({
  id,
  administrar,
  escuchaInicial = false,
  tareaId,
}: {
  id: number;
  administrar: boolean;
  escuchaInicial?: boolean;
  tareaId?: number;
}) {
  const [tipo, setTipo] = useState<'accion' | 'escucha'>(escuchaInicial ? 'escucha' : 'accion');
  return (
    <section>
      <h2 className="font-anton text-3xl">Tareas y escucha</h2>
      <ListaGestion<TareaIniciativa> ruta={`/${id}/tareas${tareaId ? `?tareaId=${tareaId}` : ''}`}>
        {(t) => <Tarjeta key={t.id} id={id} t={t} />}
      </ListaGestion>
      {tareaId ? (
        <Link
          className="mt-4 inline-flex underline"
          href={window.location.pathname + '?seccion=tareas'}
        >
          Ver todas las tareas
        </Link>
      ) : null}
      {administrar ? (
        <details open={escuchaInicial} className="border-tinta mt-6 border p-5">
          <summary className="cursor-pointer font-semibold">Crear tarea o planear escucha</summary>
          <label className="mt-4 block">
            Tipo de tarea
            <select
              className="border-tinta bg-papel mt-2 block w-full border p-3"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value === 'escucha' ? 'escucha' : 'accion');
              }}
            >
              <option value="accion">Acción comunitaria</option>
              <option value="escucha">Escucha territorial</option>
            </select>
          </label>
          <TareaFormulario key={tipo} id={id} escucha={tipo === 'escucha'} />
        </details>
      ) : null}
    </section>
  );
}
