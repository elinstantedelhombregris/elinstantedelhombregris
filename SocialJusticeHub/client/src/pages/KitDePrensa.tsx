import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Copy, Check, Download, Eye, Users, Brain, MapPin, Vote,
  Sparkles, Globe, Zap, BookOpen, GraduationCap, Building2,
  Briefcase, Leaf, Scale, ArrowRight, ChevronDown, FileText,
  Palette, Type, Image, Monitor, Smartphone, Square,
  Code2, Shield, BarChart3, Heart, Mail, HeartPulse, Store,
  FlaskConical, Droplets, Landmark, Cpu, Flame, ShieldCheck,
  Home, Music, Hammer, HeartHandshake, Archive, Mountain, Route
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const KitDePrensa = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: platformStats } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    totalPosts: number;
    totalDreams: number;
  }>({ queryKey: ['/api/stats'] });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Kit de Prensa - El Instante del Hombre Gris';
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const descriptions = [
    {
      label: 'Una línea',
      text: 'El Instante del Hombre Gris es una plataforma argentina de inteligencia colectiva con 22 planes estratégicos para rediseñar el país desde la participación ciudadana, los datos abiertos y la acción organizada.',
    },
    {
      label: 'Un párrafo',
      text: 'El Instante del Hombre Gris es una plataforma de inteligencia colectiva nacida en Argentina que opera en tres niveles: transformación personal (diagnóstico de 12 áreas de vida con 60 dimensiones y coaching con IA), inteligencia colectiva (un viaje de 6 pasos donde sueños, valores y necesidades se vuelven visibles en el territorio a través de El Mapa y se convierten en mandatos ciudadanos en tiempo real) y diseño de país (22 planes estratégicos completos que cubren justicia, economía, educación, salud, energía, seguridad, cultura, vivienda, soberanía digital y más — cada uno con diagnóstico, solución, costos y métricas auditables). El nombre viene de una profecía que habla de un momento bisagra para Argentina — no un líder mesiánico, sino el despertar de las personas comunes que eligen construir en vez de destruir.',
    },
    {
      label: 'Descripción completa',
      text: `El Instante del Hombre Gris es una plataforma de inteligencia colectiva para rediseñar Argentina desde los valores, la visión y la acción. Nace de la convicción de que los problemas del país no son mala suerte sino procesos mal diseñados — y que si son un bug, se pueden arreglar.

El "Hombre Gris" no es un líder mesiánico. Es exactamente lo contrario: es alguien común que decide dejar de culpar y empezar a crear. Gris no es ausencia de color — es la mezcla de todos. Es quien se salió de la cancha de la grieta y eligió construir.

La plataforma funciona en tres niveles. Primero, la transformación personal: un sistema de diagnóstico sobre 12 áreas de vida con 60 dimensiones, contenido de estudio real, coaching con inteligencia artificial y herramientas concretas para el cambio. Segundo, la inteligencia colectiva: un viaje de seis pasos que va desde la Visión de Argentina hasta la Tribu activa, pasando por El Mapa donde los sueños se vuelven visibles en el territorio, el Mandato Vivo donde los datos construyen democracia directa en tiempo real, y El Arquitecto donde los 22 planes estratégicos se visualizan como un sistema vivo de dependencias. Tercero, el diseño de un país nuevo: 22 planes estratégicos completos que cubren justicia popular, reconversión del empleo público, empresas al costo real, soberanía monetaria, soberanía digital, regulación de sustancias, refundación educativa, salud integral, suelo vivo, soberanía hídrica, 24 ciudades nuevas, posicionamiento geopolítico, soberanía energética, seguridad ciudadana, vivienda digna, cultura viva, mesa civil deliberativa, talleres federales, cuidado y vínculo, memoria operativa, tierra y pueblos originarios, y movilidad y logística.

Todo es abierto. Todo es auditable. Todo el código es público. El movimiento se llama ¡BASTA! — no como grito de enojo, sino como el susurro que cambia todo por dentro cuando decidís hacerte cargo. No depende de ningún partido político. Depende de vos.`,
    },
  ];

  const brandAssets = [
    {
      name: 'Logo Principal',
      description: 'Marca completa con isotipo y texto',
      file: '/press-kit/logo-principal.svg',
      icon: Image,
      aspect: 'landscape',
    },
    {
      name: 'Logo ¡BASTA!',
      description: 'Marca del movimiento',
      file: '/press-kit/logo-basta.svg',
      icon: Type,
      aspect: 'landscape',
    },
    {
      name: 'Social Card — Landscape',
      description: '1200×630 — Twitter, Facebook, LinkedIn',
      file: '/press-kit/social-card-landscape.svg',
      icon: Monitor,
      aspect: 'landscape',
    },
    {
      name: 'Social Card — Cuadrado',
      description: '1080×1080 — Instagram, Feed',
      file: '/press-kit/social-card-square.svg',
      icon: Square,
      aspect: 'square',
    },
    {
      name: 'Social Card — Story',
      description: '1080×1920 — Instagram/WhatsApp Stories',
      file: '/press-kit/social-card-story.svg',
      icon: Smartphone,
      aspect: 'portrait',
    },
  ];

  const colorPalette = [
    { name: 'Negro Base', hex: '#0a0a0a', text: 'white' },
    { name: 'Azul Principal', hex: '#3b82f6', text: 'white' },
    { name: 'Púrpura Acento', hex: '#8b5cf6', text: 'white' },
    { name: 'Slate 950', hex: '#020617', text: 'white' },
    { name: 'Slate 400', hex: '#94a3b8', text: 'black' },
    { name: 'Blanco', hex: '#f8fafc', text: 'black' },
  ];

  const journeySteps = [
    { icon: Eye, name: 'La Visión', desc: 'Diagnóstico real de Argentina con datos vivos' },
    { icon: Users, name: 'El Hombre Gris', desc: 'El marco filosófico de la identidad colectiva' },
    { icon: Sparkles, name: 'La Semilla', desc: 'Visualización del movimiento creciendo' },
    { icon: MapPin, name: 'El Mapa', desc: 'Sueños, valores y necesidades visibles en el territorio' },
    { icon: Vote, name: 'El Mandato Vivo', desc: 'Convergencia ciudadana en tiempo real. Lo que se prueba se puede exigir.' },
    { icon: Globe, name: 'Los Círculos', desc: 'Círculos de reconstrucción donde la acción se sostiene' },
  ];

  const strategicPlans = [
    { code: 'PLANJUS', name: 'Justicia Popular', icon: Scale, desc: '3 a 11 años por caso y <20% de confianza. Paneles ciudadanos por sorteo que resuelven en 15, 45 o 90 días.' },
    { code: 'PLANREP', name: 'Reconversión del Empleo Público', icon: Briefcase, desc: '1,2–1,8M empleados sin valor verificable. Reconversión hacia la Economía de la Vida y la Inteligencia.' },
    { code: 'PLANEB', name: 'Empresas Bastardas', icon: Store, desc: 'Entidades sin dueño, gobernadas por DAO, al costo real. Red Bastarda con transparencia radical.' },
    { code: 'PLANMON', name: 'Soberanía Monetaria', icon: Landmark, desc: 'Arquitectura financiera soberana con sistema peso-canasta. El sistema circulatorio de la economía real.' },
    { code: 'PLANDIG', name: 'Soberanía Digital', icon: Cpu, desc: 'Infraestructura digital independiente, IA soberana, sistema IDS, rieles de pago SAPI y El Mapa como nervio central.' },
    { code: 'PLANSUS', name: 'Soberanía sobre Sustancias', icon: FlaskConical, desc: 'USD 3.000–8.000M/año para el narco por la prohibición. Regulación integral en cascada con ROI de 5:1 a 15:1.' },
    { code: 'PLANEDU', name: 'Refundación Educativa', icon: GraduationCap, desc: 'Argentina ocupa el puesto 63/81 en PISA. Refundación basada en Siete Capacidades, Maestros Creadores y AI como co-tutor.' },
    { code: 'PLANSAL', name: 'Salud Integral y Vitalidad', icon: HeartPulse, desc: '10% del PBI en salud con resultados de país en desarrollo. 3.000 Centros de Vitalidad barriales y 25.000 Familias Mentoras.' },
    { code: 'PLANISV', name: 'Infraestructura de Suelo Vivo', icon: Leaf, desc: 'El suelo que genera el 60–70% de las exportaciones se degrada. Ingeniería biológica con retorno 8:1 a 15:1.' },
    { code: 'PLANAGUA', name: 'Soberanía Hídrica', icon: Droplets, desc: '7 millones sin agua segura, 40% se pierde en fugas. Censo Nacional del Agua, 50.000 sensores IoT y Bastardas Hídricas.' },
    { code: 'PLAN24CN', name: '24 Ciudades Nuevas', icon: Building2, desc: 'Una ciudad nueva por provincia, diseñada desde cero. Instanciación física de la visión ¡BASTA!' },
    { code: 'PLANGEO', name: 'Posicionamiento Geopolítico', icon: Globe, desc: 'Escudo diplomático y Stack de Soberanía exportable. Argentina como referente de diseño de país.' },
    { code: 'PLANEN', name: 'Soberanía Energética', icon: Flame, desc: 'Industrialización de Vaca Muerta, litio, solar, eólica y nuclear. Transición de la matriz productiva.' },
    { code: 'PLANSEG', name: 'Seguridad Ciudadana', icon: ShieldCheck, desc: 'Transición del orden público sincronizada con PLANSUS. Justicia restaurativa y sistema guardián.' },
    { code: 'PLANVIV', name: 'Vivienda Digna', icon: Home, desc: '1.800+ urbanizaciones en ciudades existentes. Hábitat digno como derecho, no como negocio.' },
    { code: 'PLANCUL', name: 'Cultura Viva', icon: Music, desc: 'Red de Dendritas culturales barriales. El alma del sistema, con presupuesto cero del Estado — sostenida por la comunidad.' },
    { code: 'PLANMESA', name: 'Mesa Civil', icon: Users, desc: 'Corteza deliberativa: mesas ciudadanas institucionales, cédula civil y dietas de servicio. Representación rotativa sin profesionalización política.' },
    { code: 'PLANTALLER', name: 'Talleres Federales', icon: Hammer, desc: 'Red nacional de talleres productivos federales. Galpones públicos + Red Bastarda: manos que producen, formación en oficios y empleo con sentido.' },
    { code: 'PLANCUIDADO', name: 'Cuidado y Vínculo', icon: HeartHandshake, desc: 'Capa cero del sistema: infancia, mayores, discapacidad y salud mental. Fondo Federal de Cuidado y jornada 6+2 para que cuidar no sea invisible.' },
    { code: 'PLANMEMORIA', name: 'Memoria Operativa', icon: Archive, desc: 'Columna memorial: archivo vivo del país. Convenios con universidades y el Archivo General para que lo aprendido no se vuelva a perder.' },
    { code: 'PLANTER', name: 'Tierra, Subsuelo y Pueblos Originarios', icon: Mountain, desc: 'Raíz territorial: soberanía sobre tierra y subsuelo, con Fondo Soberano Ciudadano de regalías extractivas que paga dividendo a todos.' },
    { code: 'PLANMOV', name: 'Movilidad, Logística y Conectividad Territorial', icon: Route, desc: 'Arterias del país: reconstrucción ferroviaria, hidrovía, corredores federales y logística soberana. 20 años, financiamiento mixto.' },
  ];

  const downloadAsset = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Atmospheric gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-600/[0.08] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-purple-600/[0.06] rounded-full blur-[100px]" />
        </div>
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container mx-auto px-4 relative z-10 text-center py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400 mb-8">
              <FileText className="w-4 h-4 text-blue-400" />
              Recursos para prensa y comunidad
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-[0.95] tracking-tight">
              Kit de{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Prensa
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              Todo lo que necesitás para contar esta historia. Para periodistas,
              creadores y cualquiera que quiera compartir el movimiento con claridad.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16"
          >
            <ChevronDown className="w-6 h-6 text-slate-600 mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DESCRIPCIONES COPIABLES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold">
              Descripciones listas para usar
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg">
              Copiá la versión que necesites con un click. Están pensadas para artículos, posteos y presentaciones.
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            {descriptions.map((desc, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i + 2}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                    {desc.label}
                  </span>
                  <button
                    onClick={() => copyToClipboard(desc.text, i)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-sm text-slate-300 hover:text-white transition-all duration-300 shrink-0"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[15px]">
                  {desc.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: IDENTIDAD VISUAL
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold">
              Identidad visual
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg max-w-2xl">
              Logos, tarjetas para redes sociales y paleta de colores. Descargá lo que necesites.
            </motion.p>
          </motion.div>

          {/* Downloadable Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {brandAssets.map((asset, i) => {
              const Icon = asset.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-500"
                >
                  {/* Preview */}
                  <div className={`relative bg-white/[0.02] flex items-center justify-center overflow-hidden ${
                    asset.aspect === 'portrait' ? 'h-48' : asset.aspect === 'square' ? 'h-44' : 'h-36'
                  }`}>
                    <img
                      src={asset.file}
                      alt={asset.name}
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {/* Info */}
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{asset.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{asset.description}</p>
                    </div>
                    <button
                      onClick={() => downloadAsset(asset.file, asset.file.split('/').pop()!)}
                      className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 flex items-center justify-center text-blue-400 transition-all duration-300 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Color Palette */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Paleta de colores
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {colorPalette.map((color, i) => (
                <motion.button
                  key={i}
                  variants={fadeUp}
                  custom={i + 1}
                  onClick={() => copyToClipboard(color.hex, 100 + i)}
                  className="group text-left"
                >
                  <div
                    className="h-20 rounded-xl mb-2 border border-white/10 group-hover:scale-[1.03] transition-transform duration-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-xs font-medium text-slate-300">{color.name}</p>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    {color.hex}
                    {copiedIndex === 100 + i ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Typography */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-blue-400" />
              Tipografía
            </motion.h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Títulos</p>
                <p className="font-serif text-3xl font-bold text-white">Playfair Display</p>
                <p className="text-sm text-slate-400 mt-2">Usado en títulos, encabezados y textos de impacto emocional.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Cuerpo</p>
                <p className="font-sans text-3xl font-bold text-white">Inter</p>
                <p className="text-sm text-slate-400 mt-2">Usado en cuerpo de texto, etiquetas, navegación y datos.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Monoespaciada</p>
                <p className="font-mono text-3xl font-bold text-white">JetBrains Mono</p>
                <p className="text-sm text-slate-400 mt-2">Usado en códigos de planes estratégicos y datos técnicos.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: EL MOVIMIENTO
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold">
              El movimiento
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg max-w-2xl">
              Las ideas centrales que impulsan todo.
            </motion.p>
          </motion.div>

          {/* Hombre Gris + BASTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-blue-500/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">¿Quién es el Hombre Gris?</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">
                No es un líder mesiánico ni un caudillo. Es alguien común — tan común que pasa
                desapercibido. Gris no es tibio: es lo que queda cuando dejás de pintarte de
                azul o de amarillo para pertenecer a una tribuna. Es el color de quien eligió
                construir en vez de pelear. Es el vecino, la madre, el trabajador que un día
                decide dejar de culpar y empezar a crear. No somos uno — somos muchos.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-red-500/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">¿Qué es ¡BASTA!?</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">
                No es un grito de enojo — es un susurro que cambia todo por dentro. Es el
                momento en que dejás de esperar que alguien venga a salvarte y decidís hacerte
                cargo. ¡BASTA! es el movimiento que nace de esa decisión: un sistema completo
                para la transformación personal, colectiva y de país. Con herramientas concretas,
                datos abiertos y planes estratégicos auditables. Todo transparente, todo público.
              </p>
            </motion.div>
          </div>

          {/* 6-Step Journey */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-xl font-semibold mb-8">
              El viaje de 6 pasos — Inteligencia Colectiva
            </motion.h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {journeySteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i + 1}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center hover:border-blue-500/20 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{step.name}</p>
                    <p className="text-xs text-slate-500 leading-snug">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Diseño Idealizado — framing */}
          <aside
            role="note"
            aria-label="Diseño Idealizado"
            className="mx-auto max-w-3xl my-12 p-8 rounded-xl bg-white/[0.03] border border-white/20 ring-1 ring-white/10"
          >
            <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 tracking-wide">
              Diseño Idealizado
            </h3>
            <p className="text-base md:text-lg leading-relaxed text-white/90">
              La Ruta para Argentina y sus 22 planes son un ejercicio de <strong>diseño idealizado</strong>: no son una hoja de ruta cerrada ni una promesa de gobierno.
            </p>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-white/90">
              Son un mapa de hacia dónde <em>podríamos apuntar</em> si las personas dejan de esperar y empiezan a diseñar. Sirven como <strong>ejemplo e inspiración</strong> — muestran lo que se puede pensar, medir, proponer y ordenar cuando la ciudadanía se toma en serio el rediseño del país.
            </p>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-white/90">
              Construirlos de verdad <strong>requiere la participación de las personas</strong>. Vos, tu barrio, tu oficio, tu comunidad. Sin ese aporte, ninguno de estos planes es real.
            </p>
          </aside>

          {/* 16 Strategic Plans */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-xl font-semibold mb-8">
              Los 22 planes estratégicos — Diseño de País
            </motion.h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategicPlans.map((plan, i) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i + 1}
                    className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-purple-500/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-purple-400 mb-1">{plan.code}</p>
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: LA PLATAFORMA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold">
              La plataforma
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg max-w-2xl">
              Tecnología abierta al servicio de la transformación.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Brain, title: 'Diagnóstico Personal', desc: '12 áreas de vida, 60 dimensiones, cuestionario conversacional con contenido de estudio real.' },
              { icon: BarChart3, title: 'Inteligencia Colectiva', desc: 'Sueños, valores y necesidades mapeados en el territorio. Datos que construyen democracia directa.' },
              { icon: BookOpen, title: 'Planes Estratégicos', desc: '22 documentos completos con diagnóstico, solución, costos y métricas. Todo abierto y auditable.' },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Live Stats */}
          {platformStats && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/[0.06] rounded-2xl p-8"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Datos en vivo de la plataforma
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Miembros', value: platformStats.totalMembers || 0 },
                  { label: 'Miembros Activos', value: platformStats.activeMembers || 0 },
                  { label: 'Sueños Compartidos', value: platformStats.totalDreams || 0 },
                  { label: 'Publicaciones', value: platformStats.totalPosts || 0 },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-3xl font-bold text-white">{stat.value.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tech Stack */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-8 flex flex-wrap gap-3"
          >
            {[
              { icon: Code2, label: 'Código abierto' },
              { icon: Shield, label: 'Datos transparentes' },
              { icon: Globe, label: 'Acceso público' },
            ].map((tag, i) => {
              const Icon = tag.icon;
              return (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400">
                  <Icon className="w-4 h-4" />
                  {tag.label}
                </span>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: QUIÉN ESTÁ DETRÁS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold mb-12">
              Quién está detrás
            </motion.h2>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 md:p-10"
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold mb-1">El Fundador</h3>
                  <p className="text-sm text-blue-400 mb-4">Ingeniero Industrial · Padre de familia · Hombre Gris</p>
                  <div className="space-y-4 text-slate-400 leading-relaxed text-[15px]">
                    <p>
                      Un ingeniero industrial argentino, padre de familia, que durante años fue lo que
                      Nietzsche llama camello — cargó con el peso de un sistema que le repetía que las
                      cosas eran así y punto. Que el destino del país se decidía cada cuatro años en
                      una urna, y que después no quedaba más que esperar, quejarse o irse.
                    </p>
                    <p>
                      Hasta que un día, mirando a sus hijos, sintió algo que no pudo ignorar: si no
                      hacía nada, les iba a heredar exactamente el mismo ciclo de frustración,
                      dependencia y resignación.
                    </p>
                    <p>
                      De las noches de estudio obsesivo — conectando ideas entre Russell Ackoff,
                      Nietzsche, Buckminster Fuller y el Kybalión — nació algo concreto: no un blog
                      ni una red social más, sino un sistema completo de transformación que opera en
                      tres niveles — personal, colectivo y de país. Con herramientas reales, datos
                      abiertos y 22 planes estratégicos auditables.
                    </p>
                    <p>
                      Su objetivo no es fundar un partido político ni postularse a nada. Es exactamente
                      lo contrario: demostrar que cuando las personas se organizan con inteligencia,
                      con datos y con herramientas concretas, pueden hacer que las cosas pasen —
                      independientemente del color del partido que esté en el gobierno. Que el poder
                      real no está en la Casa Rosada, sino en la capacidad de la gente de diseñar,
                      exigir y construir el país que quiere vivir.
                    </p>
                    <p>
                      La premisa es simple: si un país mal diseñado produce sufrimiento, un país bien
                      diseñado puede producir dignidad. Y el diseño no es algo que se delega — es algo
                      que se ejerce.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Contacto para prensa</p>
                <a
                  href="mailto:prensa@elinstantedelhombregris.com"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  prensa@elinstantedelhombregris.com
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7: RECURSOS Y DESCARGAS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-serif font-bold">
              Recursos adicionales
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { label: 'Leer el Manifiesto completo', href: '/manifiesto', icon: FileText },
              { label: 'Ver La Visión de Argentina', href: '/la-vision', icon: Eye },
              { label: 'Explorar El Mapa Soberano', href: '/el-mapa', icon: MapPin },
              { label: 'Ver El Mandato Vivo', href: '/el-mandato-vivo', icon: Vote },
              { label: 'Explorar Una Ruta Para Argentina', href: '/recursos/ruta', icon: Brain },
            ].map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <Link href={link.href}>
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer group">
                      <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors flex-1">
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-6">
              ¿Necesitás algo más? ¿Querés coordinar una entrevista o cobertura?
            </p>
            <a
              href="mailto:prensa@elinstantedelhombregris.com"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20"
            >
              <Mail className="w-4 h-4" />
              Contactanos
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KitDePrensa;
