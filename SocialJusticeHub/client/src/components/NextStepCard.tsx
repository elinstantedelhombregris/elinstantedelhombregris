import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

interface NextStepCardProps {
  title: string;
  description: string;
  href: string;
  gradient?: string;
  icon?: React.ReactNode;
}

const NextStepCard = ({
  title,
  description,
  href,
  gradient = "from-[#10132a] to-[#1a1030]",
  icon,
}: NextStepCardProps) => {
  return (
    <section className="py-16 md:py-20 bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className={`relative bg-gradient-to-br ${gradient} border border-white/[0.08] rounded-2xl overflow-hidden`}>
              {/* Top accent */}
              <div className="h-[2px] bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-transparent" />

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-5 text-[11px] uppercase tracking-[0.2em] text-blue-300/70 font-semibold">
                      Siguiente Paso
                    </span>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                      {title}
                    </h2>

                    <p className="text-slate-400 mb-7 max-w-2xl leading-relaxed text-[15px]">
                      {description}
                    </p>

                    <Link href={href}>
                      <button className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-[15px] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_25px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]">
                        {icon}
                        <span>Continuar el Viaje</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NextStepCard;
