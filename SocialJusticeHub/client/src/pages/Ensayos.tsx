import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import { ArrowRight, BookOpen, Mail } from 'lucide-react';
import { ensayos } from '@/content/ensayos.generated';
import type { Ensayo } from '@shared/ensayo-types';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const Ensayos = () => {
  useEffect(() => {
    document.title = 'Ensayos — El Instante del Hombre Gris';
    window.scrollTo(0, 0);
  }, []);

  const groupedEnsayos = useMemo(() => {
    const groups = new Map<string, Ensayo[]>();
    for (const e of ensayos) {
      const list = groups.get(e.category) ?? [];
      list.push(e);
      groups.set(e.category, list);
    }
    return Array.from(groups.entries());
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-mist-white">
      <FluidBackground />
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-16">
          <motion.header variants={fadeUp} className="space-y-4">
            <p className="uppercase tracking-widest text-xs text-amber-300/80">Pensamiento</p>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight">Ensayos</h1>
            <p className="text-lg text-mist-white/70 max-w-2xl">
              Un cuaderno abierto del Hombre Gris. Acá se ensayan ideas, se discuten arquitecturas, y se busca la palabra justa antes de bajar al gesto. Dos ciclos hasta ahora: el primero diseña la arquitectura de la república; el segundo indaga las condiciones interiores que la hacen posible. Va a haber más.
            </p>
          </motion.header>

          {groupedEnsayos.map(([category, items]) => (
            <motion.section key={category} variants={fadeUp} className="space-y-6">
              <div className="space-y-2 border-l-2 border-amber-300/30 pl-4">
                <p className="uppercase tracking-widest text-xs text-amber-300/70">Sección</p>
                <h2 className="font-serif text-2xl md:text-3xl leading-tight text-mist-white">{category}</h2>
              </div>
              <motion.ol variants={staggerContainer} className="space-y-6 list-none p-0">
                {items.map((ensayo) => (
                  <motion.li key={ensayo.slug} variants={fadeUp}>
                    <Link href={`/recursos/ensayos/${ensayo.slug}`}>
                      <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 cursor-pointer group hover:border-amber-300/30 transition-colors">
                        <div className="flex items-start gap-4 md:gap-6">
                          <div className="flex-shrink-0 hidden md:flex flex-col items-center pt-1">
                            <span className="text-amber-300/60 font-mono text-sm">{String(ensayo.order).padStart(2, '0')}</span>
                            {ensayo.type === 'carta' ? <Mail className="mt-3 w-5 h-5 text-amber-300/60" /> : <BookOpen className="mt-3 w-5 h-5 text-amber-300/60" />}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-baseline gap-3">
                              <span className="md:hidden text-amber-300/60 font-mono text-sm">{String(ensayo.order).padStart(2, '0')}</span>
                              <h3 className="font-serif text-2xl md:text-3xl leading-tight">{ensayo.title}</h3>
                            </div>
                            <p className="text-mist-white/60 italic">{ensayo.subtitle}</p>
                            <p className="text-mist-white/75 leading-relaxed">{ensayo.opening}</p>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs uppercase tracking-widest text-mist-white/40">{ensayo.type} · {ensayo.readingMinutes} min de lectura</span>
                              <span className="flex items-center gap-1 text-amber-300/80 group-hover:translate-x-1 transition-transform">
                                Leer <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.section>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Ensayos;
