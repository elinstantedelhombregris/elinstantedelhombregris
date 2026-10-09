import { Link } from 'wouter';

import { fechaEnCastellano } from '../mandato-regimen';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas, useCampana, useDisenoFicha } from '~/lib/queries/participacion';
import { cuantos } from '~/lib/vocabulario';

const ENLACE = 'text-violeta-claro inline-flex min-h-11 items-center underline';
const ESTADOS_PRUEBA = {
  propuesta: 'Propuesta',
  aceptada: 'Responsabilidad aceptada',
  en_curso: 'En curso',
  pausada: 'Pausada',
  implementada: 'Implementada',
  resultado_observado: 'Resultado observado',
  resultado_revisado: 'Resultado revisado por otra cuenta',
} as const;

/** Cuántas se muestran. Más de esto, y la lista dice «mostramos 3 de n». */
const A_LA_VISTA = 3;

/** El error de cualquiera de las dos listas, dicho UNA vez para toda la sección. */
const ERROR_AL_CARGAR = 'No pudimos cargar esto. Probá de nuevo en un rato.';

/** Selección de procesos reales; nunca transforma su cantidad en un mandato. */
export function ProcesosPublicos() {
  const campanas = useCampanas();
  const fichas = useFichas();
  const hayError = campanas.isError || fichas.isError;
  const listaCampanas = campanas.data ?? [];
  const listaFichas = fichas.data?.fichas ?? [];
  const totalFichas = fichas.data?.total ?? listaFichas.length;
  return (
    <section
      aria-labelledby="procesos-publicos"
      className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5"
    >
      <h2 id="procesos-publicos" className="font-anton text-oscuro-texto text-4xl">
        Lo que ya podemos seguir
      </h2>
      <p className="text-oscuro-secundario mt-4 max-w-[760px] leading-relaxed">
        Campañas y fichas abiertas hoy. Aparecer acá no les da representación ni efecto oficial.
      </p>
      {hayError ? (
        <p role="alert" className="text-oscuro-texto mt-4">
          {ERROR_AL_CARGAR}
        </p>
      ) : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-anton text-violeta-claro text-2xl">Campañas y devoluciones</h3>
          {campanas.isLoading ? (
            <p role="status" className="mt-4">
              Buscando campañas públicas…
            </p>
          ) : campanas.isError ? null : listaCampanas.length ? (
            <>
              {listaCampanas.length > A_LA_VISTA ? (
                <p className="text-oscuro-meta mt-4 text-sm">
                  Mostramos {A_LA_VISTA} de {listaCampanas.length.toLocaleString('es-AR')} campañas.
                  No es el total del país.
                </p>
              ) : null}
              <ul className="mt-4 space-y-4">
                {listaCampanas.slice(0, A_LA_VISTA).map((c) => (
                  <li key={c.id} className="border-oscuro-borde border p-5">
                    <Link href={`/campanas/${c.slug}`} className={ENLACE}>
                      {c.contrato.titulo}
                    </Link>
                    <p className="text-oscuro-meta mt-2 text-sm">
                      {FASES_ROTULO[c.estado]} · edición {c.revision}
                    </p>
                    <DevolucionPublica id={c.id} slug={c.slug} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-oscuro-secundario mt-4">Todavía no hay campañas abiertas.</p>
          )}
          <Link href="/campanas" className={`${ENLACE} mt-4`}>
            Consultar todas las campañas →
          </Link>
        </div>
        <div>
          <h3 className="font-anton text-violeta-claro text-2xl">Condiciones, diseños y pruebas</h3>
          {fichas.isLoading ? (
            <p role="status" className="mt-4">
              Buscando fichas de futuro…
            </p>
          ) : fichas.isError ? null : listaFichas.length ? (
            <>
              {totalFichas > A_LA_VISTA ? (
                <p className="text-oscuro-meta mt-4 text-sm">
                  Mostramos {A_LA_VISTA} de {totalFichas.toLocaleString('es-AR')} fichas. Cada una
                  mantiene su propio alcance.
                </p>
              ) : null}
              <ul className="mt-4 space-y-4">
                {listaFichas.slice(0, A_LA_VISTA).map((f) => (
                  <li key={f.id} className="border-oscuro-borde border p-5">
                    <Link href={`/fichas/${f.id}`} className={ENLACE}>
                      {f.titulo}
                    </Link>
                    <p className="text-oscuro-meta mt-2 text-sm">
                      {f.territorioNombre ?? 'Todo el país'} · versión {f.revision}
                    </p>
                    <DisenoPublico id={f.id} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-oscuro-secundario mt-4">Todavía no hay fichas abiertas.</p>
          )}
          <Link href="/fichas" className={`${ENLACE} mt-4`}>
            Examinar los futuros en elaboración →
          </Link>
        </div>
      </div>
    </section>
  );
}

function DevolucionPublica({ id, slug }: { id: string; slug: string }) {
  const q = useCampana(id);
  if (q.isLoading)
    return <p className="text-oscuro-meta mt-3 text-sm">Consultando devoluciones…</p>;
  // Sin respuesta no se afirma ni «hay» ni «no hay»: se dice qué no se pudo leer.
  if (q.isError || !q.data)
    return <p className="text-oscuro-meta mt-3 text-sm">No pudimos cargar sus devoluciones.</p>;
  const ultima = q.data.devoluciones[0];
  return ultima ? (
    <p className="text-oscuro-secundario mt-3 text-sm">
      {cuantos(q.data.devoluciones.length, 'devolución publicada', 'devoluciones publicadas', true)}
      . La última corresponde a la edición {ultima.edicion}.{' '}
      <Link href={`/campanas/${slug}/devolucion`} className={ENLACE}>
        Leer fuentes, límites y revisiones
      </Link>
    </p>
  ) : (
    <p className="text-oscuro-meta mt-3 text-sm">
      Todavía no hay devolución publicada. Fecha prevista:{' '}
      {fechaEnCastellano(q.data.contrato.fechaDevolucion)}.
    </p>
  );
}

function DisenoPublico({ id }: { id: string }) {
  const q = useDisenoFicha(id);
  if (q.isLoading)
    return <p className="text-oscuro-meta mt-3 text-sm">Consultando respuestas y pruebas…</p>;
  if (q.isError || !q.data)
    return <p className="text-oscuro-meta mt-3 text-sm">No pudimos cargar esta ficha.</p>;
  const d = q.data;
  return (
    <div className="text-oscuro-secundario mt-3 space-y-3 text-sm">
      <p>
        {[
          cuantos(d.afirmaciones.length, 'afirmación', 'afirmaciones', true),
          cuantos(d.alternativas.length, 'alternativa', 'alternativas', true),
          cuantos(d.pruebas.length, 'prueba', 'pruebas', true),
        ].join(' · ')}{' '}
        en esta ficha.
      </p>
      {d.afirmaciones.slice(0, 2).map((a) => (
        <p key={a.id}>
          «{a.texto}» —{' '}
          {a.acuerdo === null
            ? `${cuantos(a.respuestas, 'respuesta', 'respuestas', true)}; el desglose público espera al menos cinco.`
            : `${cuantos(a.acuerdo, 'acuerdo', 'acuerdos')}, ${cuantos(a.desacuerdo ?? 0, 'desacuerdo', 'desacuerdos')} y ${cuantos(a.paso ?? 0, 'pase', 'pases')}.`}
        </p>
      ))}
      {d.alternativas.slice(0, 2).map((a) => (
        <p key={a.id}>Diseño alternativo: {a.titulo}.</p>
      ))}
      {d.pruebas.slice(0, 2).map((p) => (
        <p key={p.id}>
          {p.titulo} · {ESTADOS_PRUEBA[p.estado]}. {cuantos(p.eventos.length, 'evento', 'eventos')}{' '}
          con observación y evidencia consultable.
        </p>
      ))}
      <p className="text-oscuro-meta">
        Se ven hasta dos elementos de cada clase. Responder una afirmación no comprueba un hecho ni
        autoriza una política. Revisar con otra cuenta no acredita independencia civil.
      </p>
    </div>
  );
}
