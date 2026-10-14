import {
  cuadernoFichaSchema,
  type CuadernoFicha,
  type FichaFuturo,
  type FuenteFicha,
  type ObjetivoFicha,
} from '@v2/shared';
import { useState } from 'react';

import { nuevaFuente, nuevoObjetivo } from './borradores';
import { FormularioFuente, LeerFuente } from './Fuentes';
import { LeerObjetivo } from './LeerObjetivo';
import { FormularioObjetivo } from './Objetivos';

import { BotonPapel } from '~/components/papel/primitives';
import { useGuardarFicha } from '~/lib/queries/fichas';

const VACIO: CuadernoFicha = { fuentes: [], objetivos: [] };
export function Cuaderno({ ficha }: { ficha: FichaFuturo }) {
  const [edicion, setEdicion] = useState<FichaFuturo | null>(null);
  const [aviso, setAviso] = useState('');
  const cuaderno = ficha.contenido.cuaderno ?? VACIO;
  return (
    <section
      id="evidencia"
      className="border-tinta mt-10 border-t-2 pt-8"
      aria-labelledby="titulo-cuaderno"
    >
      <h2 id="titulo-cuaderno" className="font-anton text-4xl">
        Evidencia y objetivos
      </h2>
      <p className="mt-4 leading-relaxed">
        Cada dato conserva su fuente, su fecha y sus límites. Una meta es una propuesta para
        comprobar; tener más menciones no la vuelve más urgente.
      </p>
      {aviso ? (
        <p role="status" className="mt-4">
          {aviso}
        </p>
      ) : null}
      {edicion ? (
        <EditorCuaderno
          ficha={edicion}
          cerrar={() => {
            setEdicion(null);
          }}
          guardado={() => {
            setEdicion(null);
            setAviso('Guardamos una nueva versión del cuaderno.');
          }}
        />
      ) : (
        <>
          <h3 className="font-anton mt-6 text-2xl">Fuentes e indicadores</h3>
          {!cuaderno.fuentes.length ? (
            <p className="mt-3">Evidencia pendiente: todavía no se documentaron fuentes.</p>
          ) : (
            <div className="mt-4 grid gap-5">
              {cuaderno.fuentes.map((f) => (
                <LeerFuente key={f.id} fuente={f} />
              ))}
            </div>
          )}
          <h3 className="font-anton mt-8 text-2xl">Objetivos verificables</h3>
          {!cuaderno.objetivos.length ? (
            <p className="mt-3">
              Objetivos pendientes: empezá por el resultado que querés poder comprobar.
            </p>
          ) : (
            <div className="mt-4 grid gap-5">
              {cuaderno.objetivos.map((o) => (
                <LeerObjetivo key={o.id} objetivo={o} fuentes={cuaderno.fuentes} />
              ))}
            </div>
          )}
          {ficha.puedoEditar ? (
            <BotonPapel
              className="mt-5"
              variant="fantasma"
              type="button"
              onClick={() => {
                setAviso('');
                setEdicion(ficha);
              }}
            >
              Editar evidencia y objetivos
            </BotonPapel>
          ) : null}
        </>
      )}
    </section>
  );
}
function EditorCuaderno({
  ficha,
  cerrar,
  guardado,
}: {
  ficha: FichaFuturo;
  cerrar: () => void;
  guardado: () => void;
}) {
  // La revisión queda fijada al abrir: un refetch no autoriza pisar cambios ajenos.
  const [valor, setValor] = useState(ficha.contenido.cuaderno ?? VACIO);
  const [fuente, setFuente] = useState<FuenteFicha | null>(null);
  const [objetivo, setObjetivo] = useState<ObjetivoFicha | null>(null);
  const [error, setError] = useState('');
  const guardar = useGuardarFicha(ficha.id, ficha.revision);
  const publicar = () => {
    const r = cuadernoFichaSchema.safeParse(valor);
    if (!r.success) {
      setError(r.error.issues.map((i) => i.message).join(' · '));
      return;
    }
    guardar.mutate(
      { contenido: { ...ficha.contenido, cuaderno: r.data }, idLocal: ficha.id },
      { onSuccess: guardado },
    );
  };
  return (
    <div className="mt-6">
      <p className="text-sm">
        Estás preparando una revisión de la versión {ficha.revision}. Incorporar un elemento al
        borrador todavía no lo publica.
      </p>
      <h3 className="font-anton mt-6 text-2xl">Fuentes del borrador</h3>
      <ul>
        {valor.fuentes.map((f) => (
          <li key={f.id} className="mt-3 border-b py-2">
            {f.titulo}
            <div className="flex gap-4">
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setFuente(f);
                  setObjetivo(null);
                }}
              >
                Editar fuente {f.titulo}
              </button>
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setValor({ ...valor, fuentes: valor.fuentes.filter((x) => x.id !== f.id) });
                }}
              >
                Quitar fuente {f.titulo}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="min-h-11 underline"
        disabled={valor.fuentes.length >= 20}
        onClick={() => {
          setFuente(nuevaFuente(ficha.contenido.territorioId));
          setObjetivo(null);
        }}
      >
        Agregar fuente
      </button>
      <h3 className="font-anton mt-6 text-2xl">Objetivos del borrador</h3>
      <ul>
        {valor.objetivos.map((o) => (
          <li key={o.id} className="mt-3 border-b py-2">
            {o.titulo}
            <div className="flex gap-4">
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setObjetivo(o);
                  setFuente(null);
                }}
              >
                Editar objetivo {o.titulo}
              </button>
              <button
                className="min-h-11 underline"
                onClick={() => {
                  setValor({ ...valor, objetivos: valor.objetivos.filter((x) => x.id !== o.id) });
                }}
              >
                Quitar objetivo {o.titulo}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="min-h-11 underline"
        disabled={valor.objetivos.length >= 12}
        onClick={() => {
          setObjetivo(nuevoObjetivo(ficha.contenido.territorioId));
          setFuente(null);
        }}
      >
        Agregar objetivo
      </button>
      {fuente ? (
        <FormularioFuente
          key={fuente.id}
          inicial={fuente}
          cancelar={() => {
            setFuente(null);
          }}
          guardar={(f) => {
            setValor({ ...valor, fuentes: [...valor.fuentes.filter((x) => x.id !== f.id), f] });
            setFuente(null);
          }}
        />
      ) : null}
      {objetivo ? (
        <FormularioObjetivo
          key={objetivo.id}
          inicial={objetivo}
          fuentes={valor.fuentes}
          cancelar={() => {
            setObjetivo(null);
          }}
          guardar={(o) => {
            setValor({ ...valor, objetivos: [...valor.objetivos.filter((x) => x.id !== o.id), o] });
            setObjetivo(null);
          }}
        />
      ) : null}
      {error || guardar.error ? (
        <p role="alert" className="mt-4">
          {error || guardar.error?.message}
        </p>
      ) : null}
      {guardar.error ? (
        <a
          className="mt-3 inline-flex min-h-11 underline"
          href={`/fichas/${ficha.id}#evidencia`}
          target="_blank"
          rel="noreferrer"
        >
          Consultar la versión actual sin perder este borrador
        </a>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-4">
        <BotonPapel
          type="button"
          disabled={guardar.isPending || fuente !== null || objetivo !== null}
          onClick={publicar}
        >
          {guardar.isPending ? 'Guardando…' : 'Publicar revisión del cuaderno'}
        </BotonPapel>
        <button
          type="button"
          disabled={guardar.isPending}
          className="min-h-11 underline"
          onClick={cerrar}
        >
          Cerrar sin guardar el cuaderno
        </button>
      </div>
    </div>
  );
}
