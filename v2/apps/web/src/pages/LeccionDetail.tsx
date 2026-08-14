import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import { visualParaCurso, type CourseVisual } from '~/lib/course-visuals';
import { cargarLeccion, findCursoBySlug } from '~/lib/courses-registry';
import { fechaLarga } from '~/pages/Biblioteca/biblioteca-data';
import { ubicarLeccion } from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * Quita el primer bloque `# …` SOLO cuando repite el título del frontmatter
 * (spec, Decisión 8). Exportada aparte del componente para poder testear la
 * regla de deduplicación en aislamiento (patrón del plan T7).
 */
// eslint-disable-next-line react-refresh/only-export-components -- función pura co-ubicada a propósito, ver comentario de arriba
export function sinTituloDuplicado(cuerpo: string, titulo: string): string {
  const m = /^#\s+(.+?)\s*\n/.exec(cuerpo);
  if (!m) return cuerpo;
  const normalizar = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-AR');
  return normalizar(m[1] ?? '') === normalizar(titulo)
    ? cuerpo.slice(m[0].length).trimStart()
    : cuerpo;
}

type EstadoCuerpo = { fase: 'cargando' } | { fase: 'listo'; cuerpo: string } | { fase: 'error' };

type Tramo = 'observar' | 'ensayar' | 'integrar';

function LaminaCurso({ visual, curso }: { visual: CourseVisual; curso: string }) {
  return (
    <figure className="border-tinta bg-papel-crudo mb-9 overflow-hidden border-2">
      <img
        src={visual.src}
        alt={visual.alt}
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
      <figcaption className="border-tinta border-t px-4 py-3 sm:px-5">
        <span className="font-space text-tinta-50 block text-[9px] font-bold uppercase tracking-[0.12em]">
          {visual.credit} · {curso}
        </span>
        <span className="mt-1 block text-sm leading-relaxed">{visual.caption}</span>
      </figcaption>
    </figure>
  );
}

function tramoDe(posicion: number, total: number): Tramo {
  const avance = posicion / total;
  if (avance <= 1 / 3) return 'observar';
  if (avance <= 2 / 3) return 'ensayar';
  return 'integrar';
}

const CONSIGNA_POR_TRAMO: Record<Tramo, { rotulo: string; titulo: string; accion: string }> = {
  observar: {
    rotulo: 'Laboratorio · observar',
    titulo: 'Bajá la idea a un caso real.',
    accion: 'Separá qué viste, qué interpretaste y qué todavía necesitás averiguar.',
  },
  ensayar: {
    rotulo: 'Laboratorio · poner a prueba',
    titulo: 'Hacé una prueba pequeña.',
    accion: 'Elegí una herramienta de la lección, aplicala a tu caso y registrá qué cambió.',
  },
  integrar: {
    rotulo: 'Laboratorio · integrar',
    titulo: 'Conectalo con tu entrega final.',
    accion: 'Decidí qué incorporás, qué descartás y qué supuesto falta contrastar.',
  },
};

/**
 * Una bitácora deliberadamente local: vuelve activa la lectura sin pedir cuenta
 * ni enviar reflexiones personales. Cada lección conserva su propia nota.
 */
function LaboratorioLeccion({
  cursoSlug,
  leccionSlug,
  titulo,
  tramo,
  productoFinal,
}: {
  cursoSlug: string;
  leccionSlug: string;
  titulo: string;
  tramo: Tramo;
  productoFinal: string | undefined;
}) {
  const clave = `entrenamiento:bitacora:${cursoSlug}:${leccionSlug}`;
  const [nota, setNota] = useState('');
  const [lista, setLista] = useState(false);
  const consigna = CONSIGNA_POR_TRAMO[tramo];
  const entrega = productoFinal?.replace(/[.!?]+$/, '').toLocaleLowerCase('es-AR');

  useEffect(() => {
    try {
      setNota(window.localStorage.getItem(clave) ?? '');
    } catch {
      setNota('');
    }
    setLista(true);
  }, [clave]);

  useEffect(() => {
    if (!lista) return;
    try {
      if (nota.trim()) window.localStorage.setItem(clave, nota);
      else window.localStorage.removeItem(clave);
    } catch {
      // El ejercicio sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  }, [clave, lista, nota]);

  return (
    <aside className="border-violeta bg-papel-crudo mt-10 border-2 p-6 print:border-black">
      <Kicker className="mb-3">{consigna.rotulo}</Kicker>
      <h2 className="font-anton text-2xl leading-tight">{consigna.titulo}</h2>
      <ol className="mt-5 grid gap-3 text-[15px] leading-relaxed sm:grid-cols-3">
        <li className="border-papel-borde border-t pt-3">
          <strong className="block">1 · Caso</strong>
          ¿Dónde aparece “{titulo}” en una situación que conocés de primera mano?
        </li>
        <li className="border-papel-borde border-t pt-3">
          <strong className="block">2 · Contraste</strong>
          {consigna.accion}
        </li>
        <li className="border-papel-borde border-t pt-3">
          <strong className="block">3 · Movimiento</strong>
          {entrega
            ? `¿Qué cambio concreto harías ahora en ${entrega}?`
            : 'Definí una acción de menos de quince minutos y una señal que te diga qué aprendiste.'}
        </li>
      </ol>
      <label
        className="font-space mt-6 block text-[11px] font-bold uppercase tracking-[0.1em]"
        htmlFor="nota-leccion"
      >
        Tu bitácora privada
      </label>
      <textarea
        id="nota-leccion"
        value={nota}
        onChange={(evento) => {
          setNota(evento.currentTarget.value);
        }}
        rows={5}
        placeholder="Escribí sin pulir: caso, evidencia, duda y próximo movimiento…"
        className="border-tinta bg-papel focus:ring-violeta mt-2 w-full resize-y border p-4 text-[15px] leading-relaxed outline-none focus:ring-2"
      />
      <p className="font-space text-tinta-50 mt-2 text-[10px] uppercase tracking-[0.08em] print:hidden">
        {nota.trim() ? 'Guardado en este navegador.' : 'No se envía ni se comparte.'}
      </p>
    </aside>
  );
}

/** Carga perezosa del cuerpo (el registry no lo trae eager) + deduplicación del H1. */
function useCuerpoDeLeccion(cursoSlug: string, leccionSlug: string, titulo: string): EstadoCuerpo {
  const [estado, setEstado] = useState<EstadoCuerpo>({ fase: 'cargando' });
  useEffect(() => {
    let vivo = true;
    setEstado({ fase: 'cargando' });
    cargarLeccion(cursoSlug, leccionSlug)
      .then((crudo) => {
        if (!vivo) return;
        setEstado(
          crudo === null
            ? { fase: 'error' }
            : { fase: 'listo', cuerpo: sinTituloDuplicado(crudo, titulo) },
        );
      })
      .catch(() => {
        if (vivo) setEstado({ fase: 'error' });
      });
    return () => {
      vivo = false;
    };
  }, [cursoSlug, leccionSlug, titulo]);
  return estado;
}

/** 404 §5: el expediente extraviado, sobre papel (el lector es editorial). */
function LeccionExtraviada() {
  return (
    <main className="mx-auto max-w-md px-10 py-24 text-center max-[560px]:px-5">
      <Kicker className="mb-4">expediente extraviado</Kicker>
      <h1 className="font-anton mb-6 text-4xl leading-none">Esa lección no está.</h1>
      <div className="mb-8">
        <Sello color="rojo">Extraviado</Sello>
      </div>
      <BotonPapel asChild variant="tinta">
        <Link href="/entrenamientos">Ver los entrenamientos →</Link>
      </BotonPapel>
    </main>
  );
}

/** Skeleton §5: bloques del alto real del cuerpo + el microcopy de carga §10.9. */
function EsqueletoCuerpo() {
  return (
    <div className="border-tinta overflow-x-auto border-t-2 pt-7">
      <div className="anim-pulso-papel bg-papel-presionado h-7 w-3/4" />
      <div className="anim-pulso-papel bg-papel-presionado mt-4 h-40 w-full" />
      <div className="anim-pulso-papel bg-papel-presionado mt-4 h-40 w-full" />
      <p className="font-space text-tinta-50 mt-4 text-[11px] uppercase tracking-[0.12em]">
        Cargando — menos que un trámite.
      </p>
    </div>
  );
}

/** Error de carga §10.9 — misma honestidad que el resto del sistema, con el camino de vuelta. */
function CuerpoRoto({ cursoSlug }: { cursoSlug: string }) {
  return (
    <div className="border-tinta border-t-2 pt-7">
      <p className="font-archivo text-tinta-75 text-[15px] leading-relaxed">
        Esto se rompió. Lo decimos porque publicamos todo.
      </p>
      <Link
        href={`/entrenamientos/${cursoSlug}`}
        className="font-space text-tinta-50 hover:text-tinta mt-6 inline-block text-xs uppercase tracking-[0.1em]"
      >
        ← Volver al entrenamiento
      </Link>
    </div>
  );
}

const CLASE_CUERPO =
  'max-w-[680px] [&>*:first-child]:mt-0 prose-table:w-full prose-table:border-collapse ' +
  'prose-th:font-space prose-th:border-tinta prose-th:border-b prose-th:text-[11px] prose-th:uppercase prose-th:text-tinta-50 ' +
  'prose-td:border-papel-borde prose-td:border-b';

const CLASE_ANTERIOR =
  'font-space text-tinta-50 hover:text-tinta max-w-[300px] text-xs uppercase tracking-[0.06em]';
const CLASE_SIGUIENTE =
  'font-space text-tinta ml-auto max-w-[300px] text-right text-xs font-bold uppercase tracking-[0.06em] hover:text-violeta';

/**
 * Lector de lección — página 3.5 «Página C»
 * (docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md). Cuerpo MDX
 * VERBATIM vía `MdxPapel`, carga perezosa (el registry no trae los 329
 * cuerpos eager) y edición impresa reusada de 2.4/3.2. `:n` es la posición
 * 1-based en la lista ordenada de lecciones, nunca el `orderIndex` crudo
 * (hay un curso que arranca en 0, Decisión 11). Sin firma, sin sello, sin
 * cierre al mapa: la lección cierra en la lección siguiente o, la última,
 * en la práctica (Decisión 10).
 */
export function LeccionDetail() {
  const [match, params] = useRoute<{ slug: string; n: string }>('/entrenamientos/:slug/leccion/:n');
  const cursoSlug = params?.slug ?? '';
  const n = Number(params?.n);
  const curso = findCursoBySlug(cursoSlug);
  const ubicacion = curso ? ubicarLeccion(cursoSlug, n) : null;

  // Los hooks se llaman siempre, en el mismo orden — el early return de
  // "no matchea / no existe" llega recién después.
  const estado = useCuerpoDeLeccion(
    ubicacion ? cursoSlug : '',
    ubicacion ? ubicacion.leccion.slug : '',
    ubicacion ? ubicacion.leccion.titulo : '',
  );

  if (!match) return null;
  if (!curso || !ubicacion) return <LeccionExtraviada />;

  const { leccion, posicion, total, anterior, siguiente } = ubicacion;
  const visual = posicion === 1 ? visualParaCurso(cursoSlug) : undefined;

  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href={`/entrenamientos/${cursoSlug}`}
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← {curso.title}
      </Link>

      <article className="edicion-impresa">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
        <Kicker className="mb-4 mt-10">
          Lección {posicion} de {total} · {leccion.minutos} min
        </Kicker>
        <div
          className="bg-papel-presionado mb-7 h-1 overflow-hidden print:hidden"
          role="progressbar"
          aria-label="Avance en el entrenamiento"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={posicion}
        >
          <span
            className="bg-violeta block h-full"
            style={{ width: `${String((posicion / total) * 100)}%` }}
          />
        </div>
        <h1
          aria-label={leccion.titulo}
          className="font-anton riso-hover mb-7 text-pretty text-[clamp(30px,4.4vw,52px)] leading-none print:[&_span]:animate-none"
        >
          <RitoTinta lineas={[leccion.titulo]} />
        </h1>
        {leccion.resumen ? (
          <p className="text-tinta-75 mb-7 max-w-[680px] text-pretty text-[17px] leading-[1.6]">
            {leccion.resumen}
          </p>
        ) : null}
        {visual ? <LaminaCurso visual={visual} curso={curso.title} /> : null}
        {estado.fase === 'cargando' ? <EsqueletoCuerpo /> : null}
        {estado.fase === 'error' ? <CuerpoRoto cursoSlug={cursoSlug} /> : null}
        {estado.fase === 'listo' ? (
          <>
            <div className="border-tinta overflow-x-auto border-t-2 pt-7">
              <MdxPapel raw={estado.cuerpo} className={CLASE_CUERPO} />
            </div>
            <LaboratorioLeccion
              cursoSlug={cursoSlug}
              leccionSlug={leccion.slug}
              titulo={leccion.titulo}
              tramo={tramoDe(posicion, total)}
              productoFinal={curso.productoFinal}
            />
          </>
        ) : null}
      </article>

      <nav className="border-tinta mt-11 flex flex-wrap justify-between gap-5 border-t pt-[22px] print:hidden">
        {anterior ? (
          <Link
            href={`/entrenamientos/${cursoSlug}/leccion/${anterior.posicion}`}
            className={CLASE_ANTERIOR}
          >
            ← {anterior.leccion.titulo}
          </Link>
        ) : null}
        {siguiente ? (
          <Link
            href={`/entrenamientos/${cursoSlug}/leccion/${siguiente.posicion}`}
            className={CLASE_SIGUIENTE}
          >
            {siguiente.leccion.titulo} →
          </Link>
        ) : (
          <Link href={`/entrenamientos/${cursoSlug}/practica`} className={CLASE_SIGUIENTE}>
            La práctica →
          </Link>
        )}
      </nav>
    </main>
  );
}

export default LeccionDetail;
