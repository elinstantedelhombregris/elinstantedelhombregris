import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin } from 'lucide-react';
import AnimatedScore from '@/components/life-areas/AnimatedScore';
import { GLASS_CARD, DISPLAY_GRADIENT } from '@/lib/design-tokens';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { RADAR_TYPES, RADAR_TYPE_MAP, relativeTime, type RadarTypeKey } from './radar-types';

interface ResumenResponse {
  totals: Record<RadarTypeKey | 'total', number>;
  recientes: Array<{
    id: number;
    type: RadarTypeKey;
    excerpt: string;
    location: string | null;
    createdAt: string | null;
  }>;
}

/**
 * El Pulso: el gemelo digital en el bolsillo — totales por tipo y señales recientes.
 */
export default function RadarPulse() {
  const { data, isLoading, isError } = useQuery<ResumenResponse>({
    queryKey: ['/api/radar/resumen'],
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pb-28">
        <div className="relative w-16 h-16">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-[#7D5BDE]"
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.4, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
          <span className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#9D85E8]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-28 px-8 text-center">
        <p className="text-slate-400 text-sm">
          No pudimos cargar el pulso. Revisá tu conexión y volvé a intentar.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex-1 px-5 pb-28 pt-2"
    >
      <motion.div variants={fadeUp} className="text-center mt-4 mb-7">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mb-2">
          El pulso del país
        </p>
        <div className={`font-serif text-6xl ${DISPLAY_GRADIENT}`}>
          <AnimatedScore value={data.totals.total} />
        </div>
        <p className="text-sm text-slate-400 mt-1.5">
          señales capturadas hasta ahora
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 mb-8">
        {RADAR_TYPES.map((type) => (
          <div key={type.key} className={`${GLASS_CARD} px-2 py-3 text-center`}>
            <span
              aria-hidden
              className="mx-auto mb-1.5 block w-2 h-2 rounded-full"
              style={{ backgroundColor: type.color, boxShadow: `0 0 8px ${type.color}88` }}
            />
            <div className="text-lg font-semibold text-white leading-none">
              <AnimatedScore value={data.totals[type.key] ?? 0} />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">{type.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mb-3">
        Últimas señales
      </motion.h2>

      <div className="space-y-2.5">
        {data.recientes.length === 0 && (
          <motion.p variants={fadeUp} className="text-sm text-slate-500">
            Todavía no hay señales. La tuya puede ser la primera.
          </motion.p>
        )}
        {data.recientes.map((signal) => {
          const def = RADAR_TYPE_MAP[signal.type] ?? RADAR_TYPES[0];
          return (
            <motion.div key={signal.id} variants={fadeUp} className={`${GLASS_CARD} p-3.5`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: def.color }}
                />
                <span className="text-[11px] font-medium" style={{ color: def.color }}>
                  {def.label}
                </span>
                <span className="text-[11px] text-slate-600 ml-auto shrink-0">
                  {relativeTime(signal.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed">{signal.excerpt}</p>
              {signal.location && (
                <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5">
                  <MapPin className="w-3 h-3" /> {signal.location}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.a
        variants={fadeUp}
        href="/explorar-datos"
        className="mt-8 mb-2 flex items-center justify-center gap-2 text-sm text-[#9D85E8] py-3"
      >
        Ver la Radiografía completa <ExternalLink className="w-4 h-4" />
      </motion.a>
    </motion.div>
  );
}
