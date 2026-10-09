import { useEffect, useRef, useState } from 'react';

import type { DisenoFicha } from '@v2/shared';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';
const ROTULOS: Record<string, string> = {
  propuesta: 'Prueba propuesta',
  aceptada: 'Responsabilidad aceptada',
  en_curso: 'En curso',
  pausada: 'Pausada',
  implementada: 'Implementación declarada',
  resultado_observado: 'Resultado observado',
  resultado_revisado: 'Revisión por otra cuenta registrada',
};
const SIGUIENTES: Record<string, string[]> = {
  propuesta: ['aceptada'],
  aceptada: ['en_curso', 'pausada'],
  en_curso: ['implementada', 'pausada'],
  pausada: ['en_curso'],
  implementada: ['resultado_observado'],
  resultado_observado: ['resultado_revisado'],
  resultado_revisado: [],
};
export function Pruebas({ datos }: { datos: DisenoFicha }) {
  const auth = useAuth();
  const idLocal = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  const [a, setA] = useState('');
  const [titulo, setTitulo] = useState('');
  const [alcance, setAlcance] = useState('');
  const [plazo, setPlazo] = useState('');
  return (
    <section>
      <h3 className="font-anton text-3xl">
        El diseño aprende
        <br />
        cuando toca la vida.
      </h3>
      <p className="mt-4 leading-relaxed">
        Una prueba acota alcance, responsabilidad y evidencia. Lo que sale mal también queda como
        aprendizaje. Una declaración de ejecución todavía necesita observar su resultado.
      </p>
      <div className="mt-6 space-y-6">
        {datos.pruebas.map((p) => (
          <Prueba key={p.id} prueba={p} />
        ))}
      </div>
      {!datos.pruebas.length ? (
        <Nota>
          Todavía no hay pruebas propuestas. Primero hace falta una alternativa y un equipo
          dispuesto a sostener una prueba pequeña.
        </Nota>
      ) : null}
      {auth.user && datos.alternativas.length ? (
        <form
          className="mt-7 border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            op.mutate(
              {
                metodo: 'post',
                ruta: '/api/v1/fichas/pruebas',
                cuerpo: { idLocal: idLocal.current, alternativaId: a, titulo, alcance, plazo },
              },
              {
                onSuccess: () => {
                  setTitulo('');
                  idLocal.current = crypto.randomUUID();
                  setAlcance('');
                },
              },
            );
          }}
        >
          <h4 className="font-anton text-2xl">Proponer una prueba acotada</h4>
          <label className="mt-4 block">
            Alternativa
            <select
              className={CAMPO}
              value={a}
              onChange={(e) => {
                setA(e.target.value);
              }}
            >
              <option value="">Elegí el diseño que se pondría a prueba</option>
              {datos.alternativas.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            Nombre
            <input
              className={CAMPO}
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Dónde, con quién y a qué escala
            <textarea
              className={CAMPO}
              rows={3}
              value={alcance}
              onChange={(e) => {
                setAlcance(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Fecha de revisión
            <input
              className={CAMPO}
              type="date"
              value={plazo}
              onChange={(e) => {
                setPlazo(e.target.value);
              }}
            />
          </label>
          <Nota>
            Proponer no obliga a otras personas ni instituciones. La responsabilidad se acepta
            explícitamente antes de avanzar.
          </Nota>
          <ErrorOperacion mensaje={op.error?.message} />
          <BotonAccion type="submit" disabled={op.isPending || !a || !plazo}>
            Registrar propuesta de prueba
          </BotonAccion>
        </form>
      ) : null}
    </section>
  );
}
function Prueba({ prueba: p }: { prueba: DisenoFicha['pruebas'][number] }) {
  const op = useOperacionPersonal();
  const idLocal = useRef(crypto.randomUUID());
  const [firma, setFirma] = useState('');
  const [observacion, setObservacion] = useState('');
  const [evidencia, setEvidencia] = useState('');
  const [estado, setEstado] = useState(SIGUIENTES[p.estado]?.[0] ?? '');
  useEffect(() => {
    setEstado(SIGUIENTES[p.estado]?.[0] ?? '');
  }, [p.estado]);
  return (
    <article className="bg-papel-crudo border p-5">
      <p className="font-space text-violeta text-xs uppercase">{ROTULOS[p.estado]}</p>
      <h4 className="font-anton mt-3 text-3xl">{p.titulo}</h4>
      <p className="mt-3 leading-relaxed">{p.alcance}</p>
      <p className="text-tinta-50 mt-3 text-sm">
        Fecha prevista de revisión: {p.plazo} · versión {p.revision}
      </p>
      <p className="mt-3 text-sm">
        Responsabilidad aceptada: {p.responsableNombre ?? 'Todavía pendiente.'} La firma elegida no
        acredita representación institucional.
      </p>
      <ol className="mt-5 space-y-4">
        {p.eventos.map((e, i) => (
          <li key={`${e.fecha}-${i}`} className="border-t pt-4">
            <h5 className="font-semibold">{ROTULOS[e.estado]}</h5>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">{e.observacion}</p>
            <ul className="mt-3 space-y-2">
              {e.evidencia.map((url) => (
                <li key={url}>
                  <a
                    className="text-violeta break-all underline"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar evidencia
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {(p.estado === 'resultado_observado' ? p.puedoRevisar : p.puedoGestionar) &&
      SIGUIENTES[p.estado]?.length ? (
        <form
          className="mt-5 border-t pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            op.mutate(
              {
                metodo: 'post',
                ruta: `/api/v1/fichas/pruebas/${p.id}/estado`,
                cuerpo: {
                  idLocal: idLocal.current,
                  ...(estado === 'aceptada' ? { firma } : {}),
                  revision: p.revision,
                  estado,
                  observacion,
                  evidencia: evidencia.split(/\s+/).filter(Boolean),
                },
              },
              {
                onSuccess: () => {
                  setObservacion('');
                  idLocal.current = crypto.randomUUID();
                  setEvidencia('');
                },
              },
            );
          }}
        >
          <label className="block">
            Paso que vamos a registrar
            <select
              className={CAMPO}
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
              }}
            >
              {SIGUIENTES[p.estado]?.map((x) => (
                <option key={x} value={x}>
                  {ROTULOS[x]}
                </option>
              ))}
            </select>
          </label>
          {estado === 'aceptada' ? (
            <label className="mt-4 block">
              Firma pública de responsabilidad
              <input
                className={CAMPO}
                value={firma}
                onChange={(e) => {
                  setFirma(e.target.value);
                }}
                maxLength={120}
              />
            </label>
          ) : null}
          <label className="mt-4 block">
            Qué observamos y cómo lo sabemos
            <textarea
              className={CAMPO}
              rows={3}
              maxLength={4000}
              value={observacion}
              onChange={(e) => {
                setObservacion(e.target.value);
              }}
            />
          </label>
          <label className="mt-4 block">
            Enlaces de evidencia, separados por espacios
            <input
              className={CAMPO}
              value={evidencia}
              onChange={(e) => {
                setEvidencia(e.target.value);
              }}
            />
          </label>
          <ErrorOperacion mensaje={op.error?.message} />
          <BotonAccion
            className="mt-4"
            type="submit"
            disabled={op.isPending || observacion.trim().length < 15}
          >
            Registrar este paso
          </BotonAccion>
        </form>
      ) : null}
      <p className="text-tinta-50 mt-4 text-sm">
        La revisión viene de una cuenta distinta de la creadora y de la responsable. Eso no acredita
        independencia personal, no equivale a una auditoría ni demuestra causalidad.
      </p>
    </article>
  );
}
