import { useEffect, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';
import type { EnsayoCartografiaGroup } from '@shared/ensayo-types';
import { fadeUp } from '@/lib/motion-variants';

const CartografiaBlock = ({ groups }: { groups: EnsayoCartografiaGroup[] }) => {
  if (groups.length === 0) return null;
  return (
    <div className="text-sm space-y-6">
      <p className="uppercase tracking-widest text-xs text-mist-white/40">Cartografía</p>
      {groups.map((group) => (
        <div key={group.heading} className="space-y-3">
          <p className="font-semibold text-mist-white/80">{group.heading}</p>
          <ul className="space-y-2 list-none p-0">
            {group.items.map((item) => (
              <li key={item.label} className="text-mist-white/60 leading-relaxed">
                {item.href ? (
                  <Link href={item.href} className="text-amber-300/90 hover:text-amber-300 italic">{item.label}</Link>
                ) : (
                  <em className="text-mist-white/80">{item.label}</em>
                )}
                {' — '}
                <span>{item.blurb}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const EnsayoDetail = () => {
  const [, params] = useRoute('/recursos/ensayos/:slug');
  const slug = params?.slug;
  const ensayo = useMemo(() => ensayos.find((e) => e.slug === slug), [slug]);

  useEffect(() => {
    if (ensayo) document.title = `${ensayo.title} — Ensayos — El Instante del Hombre Gris`;
    window.scrollTo(0, 0);
  }, [ensayo]);

  if (!ensayo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="font-serif text-3xl">Ensayo no encontrado</h1>
          <Link href="/recursos/ensayos" className="text-amber-300/80 underline mt-4 inline-block">Volver al índice</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
      <FluidBackground />
      <Header />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,680px)_280px] gap-8 lg:gap-12 lg:justify-center">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 text-sm space-y-2">
              <p className="uppercase tracking-widest text-xs text-mist-white/40 mb-3">Secciones</p>
              <ul className="space-y-2 list-none p-0">
                {ensayo.toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                    <a href={`#${item.id}`} className="text-mist-white/60 hover:text-amber-300/90 transition-colors block">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <motion.article initial="initial" animate="animate" variants={fadeUp} className="min-w-0">
            <header className="mb-12 space-y-3">
              <Link href="/recursos/ensayos" className="inline-flex items-center gap-1 text-sm text-mist-white/50 hover:text-amber-300/80 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Ensayos
              </Link>
              <p className="uppercase tracking-widest text-xs text-amber-300/80">{String(ensayo.order).padStart(2, '0')} · {ensayo.type}</p>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight">{ensayo.title}</h1>
              <p className="text-lg italic text-mist-white/60">{ensayo.subtitle}</p>
              <p className="text-xs text-mist-white/40">{ensayo.readingMinutes} min de lectura</p>
            </header>

            <div
              className="prose prose-invert max-w-none font-sans prose-headings:font-serif prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-p:text-[1.0625rem] prose-p:leading-[1.8] prose-p:text-mist-white/85 prose-em:text-amber-200/90 prose-em:font-serif prose-strong:text-mist-white prose-blockquote:font-serif prose-blockquote:border-amber-300/40"
              dangerouslySetInnerHTML={{ __html: ensayo.bodyHtml }}
            />

            <aside className="lg:hidden mt-16">
              <CartografiaBlock groups={ensayo.cartografia} />
            </aside>

            <footer className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
              <Link href="/recursos/ensayos" className="inline-flex items-center gap-2 text-mist-white/60 hover:text-amber-300/90 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al índice
              </Link>
              {ensayo.next && (
                <Link href={`/recursos/ensayos/${ensayo.next.slug}`} className="inline-flex items-center gap-2 text-amber-300/80 hover:text-amber-300 transition-colors text-right">
                  <span>
                    <span className="block text-xs uppercase tracking-widest text-mist-white/40">Continúa en</span>
                    <span className="font-serif">{ensayo.next.title}</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </footer>
          </motion.article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CartografiaBlock groups={ensayo.cartografia} />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnsayoDetail;
