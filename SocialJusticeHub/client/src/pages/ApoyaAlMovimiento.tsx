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
      color: 'blue',
    },
    {
      icon: Brain,
      title: 'Inteligencia Artificial',
      description: 'Modelos de IA que potencian el coaching personal, el análisis colectivo y la generación de planes estratégicos para el país.',
      color: 'purple',
    },
    {
      icon: Building2,
      title: 'ONG Transparente',
      description: 'Estamos construyendo una organización sin fines de lucro que administre la plataforma con total transparencia y rendición de cuentas.',
      color: 'green',
    },
    {
      icon: Code2,
      title: 'Desarrollo Continuo',
      description: 'Nuevas herramientas, mejoras y funcionalidades que nacen de las necesidades reales de la comunidad.',
      color: 'orange',
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
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8"
            >
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Cada aporte construye país</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight"
            >
              Apoyá al{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Movimiento
              </span>
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
      <section className="py-20 relative">
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
              const colorMap: Record<string, string> = {
                blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
                purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
                green: 'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
                orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
              };
              const iconColorMap: Record<string, string> = {
                blue: 'bg-blue-500/10 text-blue-400',
                purple: 'bg-purple-500/10 text-purple-400',
                green: 'bg-green-500/10 text-green-400',
                orange: 'bg-orange-500/10 text-orange-400',
              };
              return (
                <motion.div
                  key={uso.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={i}
                  className={`bg-gradient-to-br ${colorMap[uso.color]} border rounded-2xl p-8 backdrop-blur-sm`}
                >
                  <div className={`w-12 h-12 rounded-xl ${iconColorMap[uso.color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
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
      <section className="py-20 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px]" />
        </div>

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
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/[0.07] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 relative">
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
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/10 border-2 border-purple-500/30 relative overflow-hidden'
                    : 'bg-white/5 backdrop-blur-md border border-white/10'
                }`}
              >
                {forma.highlight && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
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
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-purple-900/30">
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
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-[20%] w-[500px] h-[300px] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-6" />
            </motion.div>
            <motion.blockquote
              variants={fadeUp}
              custom={1}
              className="text-2xl md:text-3xl font-serif italic text-slate-300 leading-relaxed mb-6"
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
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl px-10 h-14 text-lg shadow-xl shadow-purple-900/30">
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
