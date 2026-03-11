import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Scroll,
  Anchor,
  Users,
  Brain,
  FileText,
  Rocket,
  Wrench,
  MapPin,
  Map,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimulatedMandate from '@/components/SimulatedMandate';
import MandateCascade from '@/components/MandateCascade';
import ImpactCaseStudy from '@/components/ImpactCaseStudy';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';

// ─── Simulated mandate data ───────────────────────────────────────────────────

const cordobaData = {
  territory: "Córdoba",
  level: "provincial" as const,
  voiceCount: 5200,
  convergenceScore: 78,
  priorities: [
    { rank: 1, theme: "Salud y Vida", convergencePercent: 87, voiceCount: 4524 },
    { rank: 2, theme: "Economía y Recursos", convergencePercent: 74, voiceCount: 3848 },
    { rank: 3, theme: "Desarrollo Humano", convergencePercent: 71, voiceCount: 3692 },
  ],
  resources: [
    { category: "Profesionales de Salud", count: 340 },
    { category: "Educadores", count: 220 },
    { category: "Tecnología", count: 180 },
  ],
  gaps: [
    { theme: "Salud y Vida", needCount: 4500, resourceCount: 340, urgency: "critical" as const },
    { theme: "Economía y Recursos", needCount: 3200, resourceCount: 180, urgency: "high" as const },
  ],
  suggestedActions: [
    {
      title: "Red de Atención Comunitaria",
      description: "Jornadas de salud gratuitas coordinadas entre 340 profesionales voluntarios y centros barriales en toda la provincia.",
      estimatedImpact: "4.500 familias atendidas por trimestre",
    },
  ],
  precedent: "En Rosario, 15 médicos voluntarios atienden a 200 familias por mes con este modelo. Escalado a nivel provincial, el impacto se multiplica por 20.",
};

const laMatanzaData = {
  territory: "La Matanza",
  level: "municipal" as const,
  voiceCount: 3100,
  convergenceScore: 82,
  priorities: [
    { rank: 1, theme: "Economía y Recursos", convergencePercent: 91, voiceCount: 2821 },
    { rank: 2, theme: "Comunidad y Colectivo", convergencePercent: 79, voiceCount: 2449 },
    { rank: 3, theme: "Salud y Vida", convergencePercent: 73, voiceCount: 2263 },
  ],
  resources: [
    { category: "Tecnología y Oficios", count: 180 },
    { category: "Construcción", count: 95 },
    { category: "Agricultura Urbana", count: 60 },
  ],
  gaps: [
    { theme: "Economía y Recursos", needCount: 2800, resourceCount: 180, urgency: "critical" as const },
    { theme: "Alimentación", needCount: 1900, resourceCount: 60, urgency: "high" as const },
  ],
  suggestedActions: [
    {
      title: "Hub de Emprendedores Digitales",
      description: "Espacio compartido de co-trabajo y capacitación técnica para 180 personas con habilidades en tecnología y oficios.",
      estimatedImpact: "300 nuevos emprendimientos en 6 meses",
    },
    {
      title: "Red de Huertas Comunitarias",
      description: "60 agricultores urbanos capacitan a 500 familias en producción de alimentos frescos.",
      estimatedImpact: "1.900 familias con acceso a alimento fresco",
    },
  ],
};

const argentinaData = {
  territory: "Argentina",
  level: "national" as const,
  voiceCount: 50000,
  convergenceScore: 72,
  priorities: [
    { rank: 1, theme: "Economía y Recursos", convergencePercent: 88, voiceCount: 44000 },
    { rank: 2, theme: "Salud y Vida", convergencePercent: 82, voiceCount: 41000 },
    { rank: 3, theme: "Justicia y Derechos", convergencePercent: 76, voiceCount: 38000 },
    { rank: 4, theme: "Desarrollo Humano", convergencePercent: 73, voiceCount: 36500 },
    { rank: 5, theme: "Comunidad y Colectivo", convergencePercent: 69, voiceCount: 34500 },
  ],
  resources: [
    { category: "Profesionales de Salud", count: 4200 },
    { category: "Educadores", count: 3800 },
    { category: "Tecnología", count: 2900 },
    { category: "Legal", count: 1600 },
    { category: "Construcción", count: 1200 },
  ],
  gaps: [
    { theme: "Economía y Recursos", needCount: 44000, resourceCount: 2900, urgency: "critical" as const },
    { theme: "Salud y Vida", needCount: 41000, resourceCount: 4200, urgency: "critical" as const },
    { theme: "Justicia y Derechos", needCount: 38000, resourceCount: 1600, urgency: "high" as const },
  ],
  suggestedActions: [
    {
      title: "Red Nacional de Salud Comunitaria",
      description: "4.200 profesionales de salud organizados en redes provinciales para atención primaria gratuita en territorios desatendidos.",
      estimatedImpact: "Cobertura para 2 millones de personas sin acceso",
    },
  ],
  precedent: "24 mandatos provinciales alimentan este mandato nacional. La cascada va del barrio al país — cada voz local construye la dirección nacional.",
};

// ─── How-it-works cards data ──────────────────────────────────────────────────

const howItWorksCards = [
  {
    icon: Users,
    color: "blue-400",
    bg: "blue-500/10",
    title: "El Pueblo Habla",
    desc: "El mapa recoge sueños, necesidades, valores, gritos de ¡BASTA! y recursos de cada rincón del territorio argentino.",
  },
  {
    icon: Brain,
    color: "purple-400",
    bg: "purple-500/10",
    title: "La Inteligencia Emerge",
    desc: "Algoritmos de convergencia detectan patrones: qué pide cada territorio, qué tiene disponible, qué le falta.",
  },
  {
    icon: FileText,
    color: "amber-400",
    bg: "amber-500/10",
    title: "El Mandato Se Escribe Solo",
    desc: "Cuando la convergencia supera el umbral, el mandato territorial se genera automáticamente. Nadie vota. Nadie debate.",
  },
  {
    icon: Rocket,
    color: "emerald-400",
    bg: "emerald-500/10",
    title: "La Acción Se Activa",
    desc: "El casamentero conecta necesidades con recursos disponibles y sugiere iniciativas concretas con precedentes reales.",
  },
];

// ─── Color maps for dynamic Tailwind classes ──────────────────────────────────

const iconColorMap: Record<string, string> = {
  "blue-400": "text-blue-400",
  "purple-400": "text-purple-400",
  "amber-400": "text-amber-400",
  "emerald-400": "text-emerald-400",
};

const bgColorMap: Record<string, string> = {
  "blue-500/10": "bg-blue-500/10",
  "purple-500/10": "bg-purple-500/10",
  "amber-500/10": "bg-amber-500/10",
  "emerald-500/10": "bg-emerald-500/10",
};

// ─── Stat card color map ──────────────────────────────────────────────────────

const statStyles: Record<string, { text: string; bgIcon: string; border: string }> = {
  blue: { text: "text-blue-400", bgIcon: "text-blue-500/10", border: "border-blue-500/20" },
  teal: { text: "text-teal-400", bgIcon: "text-teal-500/10", border: "border-teal-500/20" },
  purple: { text: "text-purple-400", bgIcon: "text-purple-500/10", border: "border-purple-500/20" },
  amber: { text: "text-amber-400", bgIcon: "text-amber-500/10", border: "border-amber-500/20" },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ElMandatoVivo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Mandato Vivo - Democracia Directa por Datos';
  }, []);

  const { data: dreams = [] } = useQuery<any[]>({ queryKey: ['/api/dreams'] });
  const { data: resources = [] } = useQuery<any[]>({ queryKey: ['/api/resources-map'] });
  const { data: mandates = [] } = useQuery<any[]>({ queryKey: ['/api/mandates'] });

  const totalVoices = dreams.length + resources.length;
  const uniqueLocations = new Set(dreams.filter((d: any) => d.location).map((d: any) => d.location)).size;

  const stats = [
    { value: dreams.length, label: "Voces en el Mapa", icon: Users, color: "blue" },
    { value: resources.length, label: "Recursos Ofrecidos", icon: Wrench, color: "teal" },
    { value: uniqueLocations, label: "Territorios Activos", icon: MapPin, color: "purple" },
    { value: mandates.length, label: "Mandatos Generados", icon: FileText, color: "amber" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-900/30 font-sans">
      <Header />
      <main className="overflow-hidden">

        {/* ━━━ SECTION 1: HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

          <div className="relative z-10 text-center px-4">
            {/* Animated label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <Scroll className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Democracia Directa por Datos
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
            >
              <span className="text-white">El Mandato</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                Vivo
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10"
            >
              Lo que el pueblo declara se convierte en mandato irrefutable. Sin debates. Sin votaciones. La convergencia habla.
            </motion.p>

            {/* Live counter badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mb-16"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {totalVoices} voces alimentando el mandato
              </span>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Anchor className="w-5 h-5 text-slate-600 mx-auto" />
            </motion.div>
          </div>
        </section>

        {/* ━━━ SECTION 2: HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-[#0f1116] border-y border-white/5 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                El Sistema
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Cómo Nace un Mandato
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {howItWorksCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.12 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center"
                  >
                    <div className={`w-14 h-14 rounded-full ${bgColorMap[card.bg]} flex items-center justify-center mx-auto mb-5`}>
                      <Icon className={`w-6 h-6 ${iconColorMap[card.color]}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 font-serif">{card.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 3: LIVE STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Datos Reales
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                La Base del Mandato — Ahora Mismo
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const style = statStyles[stat.color];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden`}
                  >
                    {/* Background icon */}
                    <Icon className={`absolute -bottom-2 -right-2 w-20 h-20 ${style.bgIcon} opacity-30`} />
                    <div className="relative z-10">
                      <span className={`text-4xl font-bold ${style.text}`}>
                        {stat.value}
                      </span>
                      <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 4: SIMULATED EXAMPLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Simulación a Escala
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Cuando Miles de Voces Convergen
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                Estos ejemplos simulan lo que el sistema genera cuando miles de personas alimentan el mapa. Es el futuro que estamos construyendo — y cada voz que se suma lo acerca.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <SimulatedMandate {...cordobaData} />
              <SimulatedMandate {...laMatanzaData} />
              <SimulatedMandate {...argentinaData} />
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 5: MANDATE CASCADE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                La Cascada
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Del Barrio a la Nación
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                Cada nivel alimenta al siguiente. El mandato no baja: sube. Desde el barrio hasta la nación, la voz del pueblo se amplifica.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <MandateCascade currentLevel="national" currentName="Argentina" />
            </div>

            {mandates.length === 0 && (
              <p className="text-center text-slate-500 text-sm mt-8 font-mono">
                A medida que el mapa crece, los mandatos reales aparecerán aquí.
              </p>
            )}
          </div>
        </section>

        {/* ━━━ SECTION 6: IMPACT CASE STUDIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-gradient-to-b from-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Map className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-mono text-[10px] tracking-widest uppercase">
                  Verificado en Territorio
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white font-serif">
                Imaginen qué pasaría si dejamos las cosas en claro
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                La política ya no tiene excusas; imaginen cuando escenarios como estos sean moneda corriente.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <ImpactCaseStudy />
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 7: CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-amber-900/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white font-serif mb-6"
            >
              El Mandato Te Necesita
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-400 max-w-2xl mx-auto text-lg mb-10"
            >
              Cada voz que entra al mapa hace el mandato más fuerte, más preciso, más irrefutable. No hay mínimo. No hay máximo. Solo convergencia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <PowerCTA
                text="ALIMENTÁ EL MANDATO"
                variant="primary"
                size="xl"
                onClick={() => {
                  window.location.href = '/el-mapa#mapa-interactivo';
                }}
              />
              <Link
                href="/mandato/national/Argentina"
                className="px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-semibold text-lg inline-flex items-center gap-2"
              >
                EXPLORÁ LOS MANDATOS
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ━━━ SECTION 8: NEXT STEP CARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <NextStepCard
          title="Únete a la Tribu"
          description="El mandato no se defiende solo. Encontrá a otros que vibran en tu misma frecuencia y empezá a construir."
          href="/community"
          gradient="from-[#0f172a] to-[#1e293b]"
          icon={<Users className="w-5 h-5" />}
        />

      </main>
      <Footer />
    </div>
  );
};

export default ElMandatoVivo;
