import { Link } from 'wouter';

import { FASES_ROTULO } from '~/components/participacion/constantes';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas, useCampana, useDisenoFicha } from '~/lib/queries/participacion';

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

/** Selección de procesos reales; nunca transforma su cantidad en un mandato. */
export function ProcesosPublicos() {
  const campanas = useCampanas();
  const fichas = useFichas();
  return (
    <section
      aria-labelledby="procesos-publicos"
      className="mx-auto max-w-[1100px] px-10 pb-16 max-[560px]:px-5"
    >
      <h2 id="procesos-publicos" className="font-anton text-oscuro-texto text-4xl">
        Lo que ya podemos seguir.
      </h2>
      <p className="text-oscuro-secundario mt-4 max-w-[760px] leading-relaxed">
        Una voluntad encuentra a otras cuando podemos revisar qué se preguntó, qué se respondió y
        qué se puso a prueba. Estas convocatorias y fichas conservan sus diferencias y sus fuentes.
        Su presencia acá no les concede representación nacional ni efecto institucional.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-anton text-violeta-claro text-2xl">Campañas y devoluciones</h3>
          {campanas.isLoading ? (
            <p role="status" className="mt-4">Buscando convocatorias públicas…</p>
          ) : campanas.isError ? (
            <p role="alert" className="mt-4">No pudimos consultar las campañas. Su ausencia en esta lectura no prueba que no existan.</p>
          ) : campanas.data?.length ? (
            <>
              <p className="text-oscuro-meta mt-4 text-sm">
                Mostramos {Math.min(3, campanas.data.length)} de las {campanas.data.length} campañas
                recibidas. El catálogo devuelve hasta 100; esta selección no es el total nacional.
              </p>
              <ul className="mt-4 space-y-4">
                {campanas.data.slice(0, 3).map((c) => (
                  <li key={c.id} className="border-oscuro-borde border p-5">
                    <Link href={`/campanas/${c.slug}`} className={ENLACE}>{c.contrato.titulo}</Link>
                    <p className="text-oscuro-meta mt-2 text-sm">{FASES_ROTULO[c.estado]} · edición {c.revision}</p>
                    <DevolucionPublica id={c.id} slug={c.slug} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-oscuro-secundario mt-4">Todavía no hay campañas públicas en este catálogo.</p>
          )}
          <Link href="/campanas" className={`${ENLACE} mt-4`}>Consultar todas las campañas →</Link>
        </div>
        <div>
          <h3 className="font-anton text-violeta-claro text-2xl">Condiciones, diseños y pruebas</h3>
          {fichas.isLoading ? (
            <p role="status" className="mt-4">Buscando fichas de futuro…</p>
          ) : fichas.isError ? (
            <p role="alert" className="mt-4">No pudimos consultar las fichas. Podés volver a abrir su catálogo.</p>
          ) : fichas.data?.fichas.length ? (
            <>
              <p className="text-oscuro-meta mt-4 text-sm">
                Mostramos {Math.min(3, fichas.data.fichas.length)} fichas de {fichas.data.total} en
                el registro consultado. Cada una mantiene su propio alcance.
              </p>
              <ul className="mt-4 space-y-4">
                {fichas.data.fichas.slice(0, 3).map((f) => (
                  <li key={f.id} className="border-oscuro-borde border p-5">
                    <Link href={`/fichas/${f.id}`} className={ENLACE}>{f.titulo}</Link>
                    <p className="text-oscuro-meta mt-2 text-sm">{f.territorioNombre ?? 'Alcance nacional'} · revisión {f.revision}</p>
                    <DisenoPublico id={f.id} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-oscuro-secundario mt-4">Todavía no encontramos fichas en este registro.</p>
          )}
          <Link href="/fichas" className={`${ENLACE} mt-4`}>Examinar los futuros en elaboración →</Link>
        </div>
      </div>
    </section>
  );
}

function DevolucionPublica({ id, slug }: { id: string; slug: string }) {
  const q = useCampana(id);
  if (q.isLoading) return <p className="text-oscuro-meta mt-3 text-sm">Consultando devoluciones…</p>;
  if (q.isError || !q.data)
    return <p className="text-oscuro-meta mt-3 text-sm">No pudimos comprobar sus devoluciones en esta lectura.</p>;
  const ultima = q.data.devoluciones[0];
  return ultima ? (
    <p className="text-oscuro-secundario mt-3 text-sm">
      {q.data.devoluciones.length} devoluciones registradas. La última corresponde a la edición {ultima.edicion}.
      {' '}<Link href={`/campanas/${slug}/devolucion`} className={ENLACE}>Leer fuentes, límites y revisiones</Link>
    </p>
  ) : (
    <p className="text-oscuro-meta mt-3 text-sm">Todavía no hay devolución publicada. Fecha prevista: {q.data.contrato.fechaDevolucion}.</p>
  );
}

function DisenoPublico({ id }: { id: string }) {
  const q = useDisenoFicha(id);
  if (q.isLoading) return <p className="text-oscuro-meta mt-3 text-sm">Consultando respuestas y pruebas…</p>;
  if (q.isError || !q.data)
    return <p className="text-oscuro-meta mt-3 text-sm">No pudimos comprobar el desarrollo de esta ficha.</p>;
  const d = q.data;
  return (
    <div className="text-oscuro-secundario mt-3 space-y-3 text-sm">
      <p>{d.afirmaciones.length} afirmaciones · {d.alternativas.length} alternativas · {d.pruebas.length} pruebas en esta ficha.</p>
      {d.afirmaciones.slice(0, 2).map((a) => (
        <p key={a.id}>
          «{a.texto}» — {a.acuerdo === null
            ? `${a.respuestas} respuestas; el desglose público espera al menos cinco.`
            : `${a.acuerdo} acuerdos, ${a.desacuerdo ?? '—'} desacuerdos y ${a.paso ?? '—'} pases.`}
        </p>
      ))}
      {d.alternativas.slice(0, 2).map((a) => <p key={a.id}>Diseño alternativo: {a.titulo}.</p>)}
      {d.pruebas.slice(0, 2).map((p) => (
        <p key={p.id}>{p.titulo} · {ESTADOS_PRUEBA[p.estado]}. {p.eventos.length} eventos con observación y evidencia consultable.</p>
      ))}
      <p className="text-oscuro-meta">Se ven hasta dos elementos de cada clase. Responder una afirmación no comprueba un hecho ni autoriza una política. Revisar con otra cuenta no acredita independencia civil.</p>
    </div>
  );
}
