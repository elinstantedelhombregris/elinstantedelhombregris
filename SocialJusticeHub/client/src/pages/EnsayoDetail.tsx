import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import LikeButton from '@/components/LikeButton';
import ShareButtons from '@/components/ShareButtons';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';
import type { EnsayoCartografiaGroup } from '@shared/ensayo-types';
import { fadeUp } from '@/lib/motion-variants';
import { getAnonSessionId } from '@/lib/anonSession';
import { apiRequest } from '@/lib/queryClient';

const LINK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const CHECK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

function scrollToSection(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (!smooth) {
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
    return true;
  }
  const startY = window.scrollY;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Algunos entornos (reduced motion, automatización) ignoran el scroll suave: saltar directo.
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - startY) < 4) el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, 250);
  return true;
}

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
  const proseRef = useRef<HTMLDivElement>(null);
  const [likes, setLikes] = useState<{ count: number; liked: boolean }>({ count: 0, liked: false });

  const shareUrl = useMemo(() => {
    if (!ensayo) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://elinstantedelhombregris.com';
    return `${origin}/recursos/ensayos/${ensayo.slug}`;
  }, [ensayo]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLikes({ count: 0, liked: false });
    fetch(`/api/ensayos/${slug}/likes?sessionId=${encodeURIComponent(getAnonSessionId())}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data) setLikes({ count: data.count ?? 0, liked: !!data.liked });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  const handleToggleLike = async () => {
    const response = await apiRequest('POST', `/api/ensayos/${slug}/like`, {
      sessionId: getAnonSessionId(),
    });
    if (!response.ok) throw new Error('No se pudo registrar el like');
    const result: { liked: boolean; count: number } = await response.json();
    setLikes({ liked: result.liked, count: result.count });
  };

  useEffect(() => {
    if (ensayo) document.title = `${ensayo.title} — Ensayos — El Instante del Hombre Gris`;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) {
      // Esperar a que la animación de entrada asiente el layout antes de saltar a la sección.
      const t = window.setTimeout(() => {
        if (!scrollToSection(hash, false)) window.scrollTo(0, 0);
      }, 150);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [ensayo]);

  useEffect(() => {
    const root = proseRef.current;
    if (!root || !ensayo) return;
    const timers = new Set<number>();
    const buttons: HTMLButtonElement[] = [];

    root.querySelectorAll<HTMLElement>('h2[id], h3[id]').forEach((heading) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'ensayo-anchor inline-flex items-center align-baseline ml-2 font-sans not-prose text-mist-white/25 hover:text-amber-300/90 focus-visible:text-amber-300/90 transition-colors cursor-pointer bg-transparent border-0 p-0';
      btn.setAttribute('aria-label', 'Copiar enlace a esta sección');
      btn.title = 'Copiar enlace a esta sección';
      btn.innerHTML = LINK_ICON_SVG;
      btn.addEventListener('click', async () => {
        const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
        window.history.replaceState(null, '', `#${heading.id}`);
        const ok = await copyToClipboard(url);
        btn.innerHTML = CHECK_ICON_SVG + `<span class="text-xs ml-1 text-amber-300/90">${ok ? 'Enlace copiado' : 'Enlace en la barra'}</span>`;
        btn.classList.add('text-amber-300/90');
        const t = window.setTimeout(() => {
          btn.innerHTML = LINK_ICON_SVG;
          btn.classList.remove('text-amber-300/90');
          timers.delete(t);
        }, 1800);
        timers.add(t);
      });
      heading.appendChild(btn);
      buttons.push(btn);
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      buttons.forEach((btn) => btn.remove());
    };
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
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.replaceState(null, '', `#${item.id}`);
                        scrollToSection(item.id, true);
                      }}
                      className="text-mist-white/60 hover:text-amber-300/90 transition-colors block"
                    >
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
              ref={proseRef}
              className="prose prose-invert max-w-none font-sans prose-headings:font-serif prose-headings:scroll-mt-28 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-p:text-[1.0625rem] prose-p:leading-[1.8] prose-p:text-mist-white/85 prose-em:text-amber-200/90 prose-em:font-serif prose-strong:text-mist-white prose-blockquote:font-serif prose-blockquote:border-amber-300/40"
              dangerouslySetInnerHTML={{ __html: ensayo.bodyHtml }}
            />

            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
              <LikeButton
                postId={0}
                initialLiked={likes.liked}
                initialCount={likes.count}
                onLike={handleToggleLike}
                onUnlike={handleToggleLike}
                size="sm"
                showCount
              />
              <ShareButtons
                url={shareUrl}
                title={ensayo.title}
                description={ensayo.subtitle}
                hashtags={['ElHombreGris', 'Ensayos', 'Argentina']}
                size="sm"
                variant="ghost"
                showLabel={false}
              />
            </div>

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
