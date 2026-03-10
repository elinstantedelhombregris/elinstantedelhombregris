import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { getLifeAreaIcon } from '@/lib/lucide-icon-registry';
import { fadeUp } from '@/lib/motion-variants';

interface AreaTileProps {
  area: {
    id: number;
    name: string;
    iconName: string | null;
    colorTheme: string | null;
    score: { currentScore: number; desiredScore: number; gap: number } | null;
  };
}

const statusDot = (score: number) => {
  if (score >= 70) return 'bg-emerald-400';
  if (score >= 50) return 'bg-blue-400';
  if (score >= 30) return 'bg-amber-400';
  return 'bg-red-400';
};

const parseColor = (colorTheme: string | null): string => {
  if (!colorTheme) return '#64748b';
  try { return JSON.parse(colorTheme)?.primary || '#64748b'; } catch { return '#64748b'; }
};

export default function AreaTile({ area }: AreaTileProps) {
  const Icon = getLifeAreaIcon(area.iconName);
  const color = parseColor(area.colorTheme);
  const current = area.score?.currentScore ?? 0;
  const desired = area.score?.desiredScore ?? 0;
  const gap = area.score?.gap ?? 0;
  const hasScore = area.score !== null;

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/life-areas/${area.id}`}>
        <div className="group relative rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 cursor-pointer transition-all duration-200 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-lg hover:shadow-black/20">
          {/* Header: icon + name + score */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                {area.name}
              </h3>
            </div>
            {hasScore && (
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot(current)}`} />
                <span className="text-sm font-mono text-slate-300">{current}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {hasScore ? (
            <>
              <div className="relative h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${current}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
                {desired > 0 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white/40"
                    style={{ left: `${Math.min(desired, 100)}%` }}
                  />
                )}
              </div>
              {gap > 0 && (
                <p className={`text-[10px] mt-1.5 ${
                  gap > 30 ? 'text-amber-400/70' : gap > 15 ? 'text-blue-400/60' : 'text-slate-500'
                }`}>
                  {gap > 30 ? 'Brecha alta' : gap > 15 ? 'Espacio para crecer' : 'Cerca del ideal'}
                </p>
              )}
            </>
          ) : (
            <div className="h-1.5 rounded-full bg-white/5">
              <div className="text-[10px] text-slate-500 mt-1">Sin evaluar</div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
