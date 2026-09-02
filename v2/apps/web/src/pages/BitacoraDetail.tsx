import { Link, Redirect, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import { type BlogPost } from '~/lib/blog-registry';
import {
  categoriaVisible,
  fechaLarga,
  resolverCronica,
  ubicarCronica,
} from '~/pages/Bitacora/bitacora-data';
import { PortadaCronica } from '~/pages/Bitacora/sections/PortadaCronica';

/** 404 §5: el expediente extraviado, sobre papel (el lector es editorial). */
function CronicaExtraviada() {
  return (
    <main className="mx-auto max-w-md px-10 py-24 text-center max-[560px]:px-5">
      <Kicker className="mb-4">expediente extraviado</Kicker>
      <h1 className="font-anton mb-6 text-4xl leading-none">Esa crónica no está.</h1>
      <div className="mb-8">
        <Sello color="rojo">Extraviado</Sello>
      </div>
      <BotonPapel asChild variant="tinta">
        <Link href="/bitacora">Volver a la bitácora →</Link>
      </BotonPapel>
    </main>
  );
}

/** Un eslabón de la línea de tiempo; dice siempre hacia qué lado del tiempo va. */
function Eslabon({ post, lado }: { post: BlogPost; lado: 'reciente' | 'antigua' }) {
  const antigua = lado === 'antigua';
  return (
    <Link
      href={`/bitacora/${post.slug}`}
      className={`font-space max-w-[300px] text-xs uppercase tracking-[0.06em] ${
        antigua
          ? 'text-tinta hover:text-violeta ml-auto text-right font-bold'
          : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      <span className="text-tinta-50 block text-[10px] tracking-[0.1em]">
        {antigua ? 'más antigua' : 'más reciente'}
      </span>
      {antigua ? `${post.title} →` : `← ${post.title}`}
    </Link>
  );
}

/**
 * Lector de crónica — página 3.4 «Papel y Tinta»
 * (docs/specs/2026-07-24-manifiesto-y-bitacora-papel-y-tinta.md). Cuerpo MDX
 * VERBATIM y edición impresa reusada de 2.4. Sin cifras, sin ♥ y sin hilo de
 * comentarios: no hay fila en `blog_posts` y los endpoints direccionan por id
 * numérico — el hilo del v1-port devolvía 400 (spec, Decisión 12).
 *
 * El video ASCII sigue dormido: `public/media/` está vacío, el registry
 * generado quedó con las claves viejas y el componente es chrome v1
 * (lucide + colores). Con medios en disco, registry regenerado y el
 * componente rehecho en papel, se cablea una línea acá, entre la bajada y el
 * cuerpo: <CronicaVideoAscii slug={post.slug} /> (spec, Decisión 18).
 */
export function BitacoraDetail() {
  const [match, params] = useRoute<{ slug: string }>('/bitacora/:slug');
  if (!match) return null;
  const resolucion = resolverCronica(params.slug);
  if (resolucion.estado === 'legado') {
    return <Redirect to={`/bitacora/${resolucion.canonico}`} replace />;
  }
  if (resolucion.estado === 'desconocida') return <CronicaExtraviada />;

  const post = resolucion.post;
  const ubicacion = ubicarCronica(post.slug);
  const categoria = post.category !== '' ? ` · ${categoriaVisible(post.category)}` : '';
  const fecha = fechaLarga(post.publishedAt);
  const fechaTramo = fecha !== '' ? ` · ${fecha}` : '';
  const minutos = post.readingMinutes > 0 ? ` · ${String(post.readingMinutes)} min` : '';

  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/bitacora"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La bitácora
      </Link>

      <article className="edicion-impresa">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
        <Kicker className="mb-4 mt-10">
          Bitácora
          {categoria}
          {fechaTramo}
          {minutos}
        </Kicker>
        <h1
          aria-label={post.title}
          className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
        >
          <RitoTinta lineas={[post.title]} />
        </h1>
        {post.summary !== '' ? (
          <p className="text-tinta-75 mb-7 max-w-[620px] text-pretty text-lg leading-[1.6]">
            {post.summary}
          </p>
        ) : null}
        <PortadaCronica post={post} />
        <div className="border-tinta border-t-2 pt-7">
          <MdxPapel raw={post.body} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </div>
        <p className="font-space text-tinta-50 mt-9 text-xs">— Un hombre gris</p>
      </article>

      <nav className="border-tinta mt-11 flex flex-wrap justify-between gap-5 border-t pt-[22px] print:hidden">
        {ubicacion?.anterior ? <Eslabon post={ubicacion.anterior} lado="reciente" /> : null}
        {ubicacion?.siguiente ? <Eslabon post={ubicacion.siguiente} lado="antigua" /> : null}
      </nav>

      <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
        <span className="font-anton text-[22px] leading-tight">
          Esto ya pasó. Lo que sigue lo escribís vos.
        </span>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Decir la mía →</Link>
        </BotonPapel>
      </div>
    </main>
  );
}

export default BitacoraDetail;
