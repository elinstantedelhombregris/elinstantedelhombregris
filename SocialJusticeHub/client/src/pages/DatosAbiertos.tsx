import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Globe,
  Shield,
  Heart,
  Handshake,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'wouter';

type Stats = {
  dreams: number;
  commitments: number;
  resources: number;
  lastGenerated: string | null;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function FormatCard({
  icon: Icon,
  title,
  description,
  format,
  extension,
}: {
  icon: typeof FileJson;
  title: string;
  description: string;
  format: string;
  extension: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">{title}</h3>
          <p className="text-slate-500 text-xs font-mono">.{extension}</p>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">{description}</p>
      <a
        href={`/api/open-data/download?format=${format}`}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all group-hover:border-blue-500/30"
      >
        <Download className="w-4 h-4" />
        Descargar {title}
      </a>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof Heart;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-white mb-1">
        {count.toLocaleString('es-AR')}
      </p>
      <p className="text-slate-500 text-xs font-mono uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

export default function DatosAbiertos() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/open-data/stats'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono mb-8">
                <Database className="w-4 h-4" />
                DATOS ABIERTOS
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Los datos son de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                todos
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Descargá los datos del mapa colectivo en formato abierto. Sin restricciones, sin permisos.
              Procesalos, analizalos, crealos de nuevo. Son de la comunidad.
            </motion.p>
          </div>
        </section>

        {/* STATS */}
        {stats && (
          <section className="pb-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={Heart}
                  label="Sueños y Declaraciones"
                  count={stats.dreams}
                  color="bg-blue-500/10 text-blue-400"
                />
                <StatCard
                  icon={Handshake}
                  label="Compromisos"
                  count={stats.commitments}
                  color="bg-emerald-500/10 text-emerald-400"
                />
                <StatCard
                  icon={Wrench}
                  label="Recursos"
                  count={stats.resources}
                  color="bg-teal-500/10 text-teal-400"
                />
              </div>
              {stats.lastGenerated && (
                <p className="text-slate-600 text-xs text-center mt-4 font-mono">
                  Última exportación generada: {new Date(stats.lastGenerated).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </section>
        )}

        {/* WHAT'S INCLUDED */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <motion.h2
              {...fadeUp}
              className="text-2xl font-bold text-white mb-2 text-center"
            >
              Qué incluyen los datos
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="text-slate-500 text-sm text-center mb-8 max-w-lg mx-auto"
            >
              Toda la información visible en El Mapa, anonimizada. Sin nombres, sin IDs de usuario,
              sin datos de contacto.
            </motion.p>

            <div className="space-y-4">
              <motion.div {...fadeUp} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Sueños y Declaraciones</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Sueños, valores, necesidades y declaraciones ¡Basta! con su tipo, ubicación geográfica y fecha.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Handshake className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Compromisos</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Compromisos públicos de la comunidad con su tipo (inicial, intermedio, público), provincia, ciudad y coordenadas.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Recursos</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Recursos declarados: habilidades, tiempo disponible, categoría (legal, educación, tecnología, etc.), ubicación y estado activo.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* DOWNLOAD FORMATS */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <motion.h2
              {...fadeUp}
              className="text-2xl font-bold text-white mb-2 text-center"
            >
              Elegí tu formato
            </motion.h2>
            <motion.p
              {...fadeUp}
              className="text-slate-500 text-sm text-center mb-8"
            >
              Tres formatos, el mismo dataset completo
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormatCard
                icon={FileJson}
                title="JSON"
                description="Ideal para desarrolladores. Un archivo estructurado con metadatos, listo para consumir desde cualquier lenguaje."
                format="json"
                extension="json"
              />
              <FormatCard
                icon={FileSpreadsheet}
                title="CSV"
                description="Tres archivos CSV comprimidos en ZIP. Perfecto para Excel, Google Sheets o análisis con pandas."
                format="csv"
                extension="zip"
              />
              <FormatCard
                icon={Database}
                title="SQLite"
                description="Base de datos local lista para consultas SQL. Abrilo con DB Browser, DBeaver, o tu herramienta favorita."
                format="sqlite"
                extension="sqlite"
              />
            </div>
          </div>
        </section>

        {/* LICENSE & PRIVACY */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div {...fadeUp} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-bold">Licencia CC BY 4.0</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Podés usar, compartir y adaptar estos datos para cualquier propósito, incluso comercial.
                  Solo pedimos que atribuyas la fuente: "El Instante del Hombre Gris".
                </p>
              </motion.div>

              <motion.div {...fadeUp} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-white font-bold">Privacidad</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Los datos no contienen nombres, emails ni identificadores de usuario. Cada persona puede
                  excluir sus datos desde{' '}
                  <Link href="/profile" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                    su perfil <ExternalLink className="w-3 h-3" />
                  </Link>.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
