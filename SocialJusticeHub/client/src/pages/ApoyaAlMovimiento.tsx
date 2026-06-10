import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Heart, Server, Brain, Building2, Eye, Users,
  Shield, ArrowRight, Sparkles, Code2, Globe,
  HandHeart, Landmark, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GLASS_CARD,
  GLASS_CARD_HOVER,
  SECTION_BADGE,
  DISPLAY_GRADIENT,
  PULL_QUOTE,
  ACCENT_BUTTON,
  SECTION_PAD,
} from '@/lib/design-tokens';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const ApoyaAlMovimiento = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Apoyá al Movimiento - El Instante del Hombre Gris';
  }, []);

  const usosDelAporte = [
    {
      icon: Server,
      title: 'Infraestructura',
      description: 'Servidores, bases de datos y hosting para que la plataforma esté siempre disponible, rápida y segura para todos.',
    },
    {
      icon: Brain,
      title: 'Inteligencia Artificial',
      description: 'Modelos de IA que potencian el coaching personal, el análisis colectivo y la generación de planes estratégicos para el país.',
    },
    {
      icon: Building2,
      title: 'ONG Transparente',
      description: 'Estamos construyendo una organización sin fines de lucro que administre la plataforma con total transparencia y rendición de cuentas.',
    },
    {
      icon: Code2,
      title: 'Desarrollo Continuo',
      description: 'Nuevas herramientas, mejoras y funcionalidades que nacen de las necesidades reales de la comunidad.',
    },
  ];

  const principios = [
    {
      icon: Eye,
      title: 'Transparencia Total',
      description: 'Cada peso recibido se reporta públicamente. Vas a saber exactamente en qué se usa tu aporte.',
    },
    {
      icon: Shield,
      title: 'Código Abierto',
      description: 'Todo el código de la plataforma es público y auditable. No hay cajas negras ni secretos.',
    },
    {
      icon: Users,
      title: 'Gobernanza Colectiva',
      description: 'La comunidad participa en las decisiones sobre prioridades y uso de los recursos.',
    },
    {
      icon: Landmark,
      title: 'Sin Fines de Lucro',
      description: 'Nadie se enriquece con esto. Cada peso va directamente a sostener y mejorar la plataforma.',
    },
  ];

  const formasDeAyudar = [
    {
      title: 'Doná lo que puedas',
      description: 'No hay monto mínimo. Cada aporte, por más chico que sea, sostiene el movimiento. Un café menos por mes puede hacer la diferencia.',
      cta: 'Hacer un aporte',
      href: 'https://cafecito.app/instantehombregris',
      highlight: true,
    },
    {
      title: 'Compartí la plataforma',
      description: 'A veces el mejor aporte no es plata: es contarle a alguien que esto existe. Cada persona nueva fortalece la red.',
      cta: 'Ir a la comunidad',
      href: '/community',
      internal: true,
    },
    {
      title: 'Sumá tu talento',
      description: 'Si sabés programar, diseñar, comunicar o tenés cualquier habilidad, podés sumar al desarrollo de la plataforma.',
      cta: 'Escribinos',
      href: '/feedback',
      internal: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Single violet ambient blob */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#7D5BDE]/[0.06] rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-8"
            >
              <span className={SECTION_BADGE}>Cada aporte construye país</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight"
            >
              Apoyá al{' '}
              <span className={DISPLAY_GRADIENT}>Movimiento</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-4"
            >
              Esta plataforma no tiene dueños, no tiene sponsors, no tiene partidos detrás.
              La sostienen personas comunes que creen que Argentina se puede rediseñar.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-base text-slate-500 max-w-xl mx-auto"
            >
              Si estás acá, es porque algo adentro tuyo ya dijo{' '}
              <span className="text-white font-semibold">¡BASTA!</span>{' '}
              Ahora podés ser parte de lo que viene.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* En qué se usa tu aporte */}
      <section className={`${SECTION_PAD} relative`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-serif font-bold mb-4"
            >
              ¿En qué se usa tu aporte?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-slate-400 max-w-xl mx-auto"
            >
              Cada peso tiene destino claro. No hay intermediarios ni gastos ocultos.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {usosDelAporte.map((uso, i) => {
              const Icon = uso.icon;
              return (
                <motion.div
                  key={uso.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={i}
                  className={`${GLASS_CARD} ${GLASS_CARD_HOVER} p-8`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{uso.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{uso.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principios */}
      <section className={`${SECTION_PAD} relative`}>
        {/* Single violet blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7D5BDE]/[0.04] rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-serif font-bold mb-4"
            >
              Nuestros principios
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-slate-400 max-w-xl mx-auto"
            >
              No pedimos confianza ciega. Pedimos que nos auditen.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {principios.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={i}
                  className={`${GLASS_CARD} ${GLASS_CARD_HOVER} p-6 text-center`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-slate-300" />
                  </div>
                  <h3 className="font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formas de ayudar */}
      <section className={`${SECTION_PAD} relative`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-serif font-bold mb-4"
            >
              ¿Cómo podés ayudar?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-slate-400 max-w-xl mx-auto"
            >
              No hace falta plata para ser parte. Pero si podés, tu aporte mueve montañas.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {formasDeAyudar.map((forma, i) => (
              <motion.div
                key={forma.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                custom={i}
                className={`rounded-2xl p-8 flex flex-col ${
                  forma.highlight
                    ? `${GLASS_CARD} border-[#7D5BDE]/30 ring-1 ring-[#7D5BDE]/10 relative overflow-hidden`
                    : `${GLASS_CARD}`
                }`}
              >
                {forma.highlight && (
                  <div className="absolute top-0 right-0 bg-[#7D5BDE] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Más impacto
                  </div>
                )}
                <h3 className="text-xl font-bold mb-3">{forma.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6 flex-1">{forma.description}</p>
                {forma.internal ? (
                  <Link href={forma.href}>
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12"
                    >
                      {forma.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <a href={forma.href} target="_blank" rel="noopener noreferrer">
                    <Button className={`w-full ${ACCENT_BUTTON} rounded-xl h-12`}>
                      <HandHeart className="mr-2 w-5 h-5" />
                      {forma.cta}
                    </Button>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote / cierre emocional */}
      <section className={`${SECTION_PAD} relative`}>
        {/* Single violet blob */}
        <div className="absolute bottom-0 left-[20%] w-[500px] h-[300px] bg-[#7D5BDE]/[0.05] rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Sparkles className="w-8 h-8 text-[#9D85E8] mx-auto mb-6" />
            </motion.div>
            <motion.blockquote
              variants={fadeUp}
              custom={1}
              className={`text-2xl md:text-3xl ${PULL_QUOTE} leading-relaxed mb-6`}
            >
              "No necesitamos millones para empezar.
              Necesitamos los que ya dijeron ¡BASTA!"
            </motion.blockquote>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-500"
            >
              Cada persona que aporta no está donando a un proyecto.
              Está invirtiendo en el país que quiere vivir.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-10">
              <a href="https://cafecito.app/instantehombregris" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className={`${ACCENT_BUTTON} rounded-xl px-10 h-14 text-lg`}>
                  <Heart className="mr-2 w-5 h-5" />
                  Quiero apoyar
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApoyaAlMovimiento;
