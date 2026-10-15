import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ZodError } from 'zod';

import { CamposResumen } from './Campos';
import { CAMPOS } from './campos-resumen';
import { RevisionCampo } from './Revision';

import { BotonPapel } from '~/components/papel/primitives';
import { CAMPO } from '~/components/participacion/constantes';
import { borrarCuaderno, guardarCuaderno } from '~/lib/campo/archivo';
import { autorizarCuaderno, type Cuaderno } from '~/lib/campo/modelo';

const ESTADO = {
  borrador: 'Borrador local',
  pendiente: 'Autorizado para enviar',
  enviando: 'Recepción por confirmar',
  espera: 'Pendiente de reintento',
  conflicto: 'Revisión necesaria',
  enviado: 'Resumen recibido',
};
export function EditorCampo({
  inicial,
  cambiar,
}: {
  inicial: Cuaderno;
  cambiar: () => Promise<void>;
}) {
  const [c, setC] = useState(inicial),
    [error, setError] = useState(''),
    [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false),
    [autoriza, setAutoriza] = useState(false),
    [realizada, setRealizada] = useState(false);
  const [sucio, setSucio] = useState(false),
    [borrar, setBorrar] = useState(false);
  const editable = c.estado === 'borrador';
  useEffect(() => {
    if (!sucio && inicial.version > c.version) setC(inicial);
  }, [inicial, c.version, sucio]);
  useEffect(() => {
    const salir = (e: BeforeUnloadEvent) => {
      if (sucio) e.preventDefault();
    };
    window.addEventListener('beforeunload', salir);
    return () => {
      window.removeEventListener('beforeunload', salir);
    };
  }, [sucio]);
  async function operar(fn: () => Promise<void>) {
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof ZodError
          ? (e.issues[0]?.message ?? 'Revisá los datos.')
          : e instanceof Error
            ? e.message
            : 'No pudimos guardar. Conservá tu texto.',
      );
    } finally {
      setOcupado(false);
    }
  }
  async function guardar(v: Cuaderno) {
    const r = await guardarCuaderno(v);
    setC(r);
    setSucio(false);
    setAviso('Guardado en este navegador.');
    await cambiar();
  }
  return (
    <article className="border-tinta space-y-4 border p-5">
      <p className="text-sm">
        {ESTADO[c.estado]} · tarea #{c.tareaId} · versión del alcance {c.revisionTarea}
      </p>
      <p className="text-sm">
        Copia guardada en este navegador. {sucio ? 'Hay cambios posteriores sin guardar.' : ''}
      </p>
      <h2 className="font-anton text-3xl">{c.tarea}</h2>
      <p>{c.alcance}</p>
      <p>Zona: {c.zona}</p>
      <p>
        Devolución:{' '}
        {c.fichaId ? (
          <Link className="underline" href={`/fichas/${c.fichaId}`}>
            ficha vinculada e iniciativa
          </Link>
        ) : c.fichaId === null ? (
          'sólo la iniciativa'
        ) : (
          'consultá el destino en la tarea antes de autorizar'
        )}
        .
      </p>
      <Link className="inline-flex min-h-11 underline" href={c.enlace}>
        Consultar tarea y evidencia publicada
      </Link>
      {c.mensaje ? <p role="status">{c.mensaje}</p> : null}
      {c.evidenciaId ? (
        <p>
          Recibo de evidencia #{c.evidenciaId}. Consultá en la tarea su publicación y revisión
          actual.
        </p>
      ) : null}
      {editable ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void operar(() => guardar(c));
          }}
          className="space-y-4"
        >
          <fieldset disabled={ocupado} className="space-y-4">
            <label className="block font-semibold">
              Notas privadas de campo
              <textarea
                className={CAMPO}
                rows={4}
                maxLength={12000}
                value={c.notas}
                onChange={(e) => {
                  setC({ ...c, notas: e.target.value });
                  setSucio(true);
                }}
              />
            </label>
            <p className="text-sm">
              Estas notas quedan en este navegador. No se incluyen al enviar. Evitá nombres,
              domicilios y datos sensibles; cualquier persona con acceso al dispositivo podría
              leerlas.
            </p>
            <h3 className="font-anton text-2xl">Preparar resumen para compartir</h3>
            <p>
              Se publicará solo lo que escribas en estos campos. Las observaciones no son personas
              únicas ni porcentaje de población.
            </p>
            <CamposResumen
              campos={c.campos}
              cambiar={(campos) => {
                setC({ ...c, campos });
                setSucio(true);
              }}
            />
            <BotonPapel type="submit">Guardar borrador local</BotonPapel>
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={realizada}
                onChange={(e) => {
                  setRealizada(e.target.checked);
                }}
              />
              Realicé la escucha y declaro su ejecución.
            </label>
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={autoriza}
                onChange={(e) => {
                  setAutoriza(e.target.checked);
                }}
              />
              Revisé el resumen, sus ausencias y límites; autorizo publicarlo en la iniciativa y su
              ficha vinculada cuando haya conexión. No contiene datos personales de otras personas.
            </label>
            <BotonPapel
              type="button"
              disabled={!autoriza || !realizada}
              onClick={() => {
                void operar(() => guardar(autorizarCuaderno(c)));
              }}
            >
              Autorizar resumen y poner en cola
            </BotonPapel>
            <p className="text-sm">
              La cola enviará este resumen con la pantalla abierta. Iniciá la tarea antes de salir a
              campo. La recepción no equivale a revisión del resultado.
            </p>
          </fieldset>
        </form>
      ) : (
        <details>
          <summary className="min-h-11 cursor-pointer underline">
            Revisar contenido conservado
          </summary>
          <p className="whitespace-pre-wrap">Notas privadas: {c.notas || 'Sin notas.'}</p>
          {CAMPOS.map((f) => (
            <p key={f.clave} className="mt-3 whitespace-pre-wrap">
              <strong>{f.etiqueta}:</strong> {c.campos[f.clave]}
            </p>
          ))}
        </details>
      )}
      {c.estado === 'pendiente' && c.intentos === 0 ? (
        <button
          disabled={ocupado}
          className="min-h-11 underline"
          onClick={() => {
            void operar(() => guardar({ ...c, estado: 'borrador', sobre: null }));
          }}
        >
          Quitar autorización antes del primer envío
        </button>
      ) : null}
      {c.estado === 'conflicto' || editable ? (
        <RevisionCampo
          c={c}
          ocupado={ocupado}
          operar={operar}
          recuperar={async (v) => {
            await guardar(v);
            setAutoriza(false);
            setRealizada(false);
          }}
        />
      ) : null}
      {['borrador', 'enviado'].includes(c.estado) ? (
        <div>
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={borrar}
              onChange={(e) => {
                setBorrar(e.target.checked);
              }}
            />
            Quiero borrar esta copia local y sus notas. Esto no retira evidencia publicada.
          </label>
          <button
            className="min-h-11 underline"
            disabled={!borrar || ocupado}
            onClick={() => {
              void operar(async () => {
                await borrarCuaderno(c);
                await cambiar();
              });
            }}
          >
            Borrar copia local
          </button>
        </div>
      ) : null}
      {sucio ? (
        <p role="status">Tenés cambios sin guardar. Guardalos antes de cambiar de página.</p>
      ) : null}
      {sucio && inicial.version > c.version ? (
        <div role="alert">
          <p>
            La copia guardada cambió en otra pestaña. Tus cambios siguen en pantalla; conservalos
            antes de cargar la otra versión.
          </p>
          <button
            className="min-h-11 underline"
            onClick={() => {
              setC(inicial);
              setSucio(false);
              setAutoriza(false);
              setRealizada(false);
            }}
          >
            Descartar mis cambios sin guardar y cargar la copia guardada
          </button>
        </div>
      ) : null}
      {aviso ? <p role="status">{aviso}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </article>
  );
}
