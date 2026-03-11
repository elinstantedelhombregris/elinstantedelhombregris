import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Home, Building2, Map, Globe, Users, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { getQueryFn } from '@/lib/queryClient';

interface Mandate {
  id: number;
  territoryLevel: string;
  territoryName: string;
  voiceCount: number;
  convergenceScore: number;
  status: string;
}

interface MandateCascadeProps {
  currentLevel: 'barrio' | 'city' | 'province' | 'national';
  currentName: string;
}

const LEVELS = [
  { key: 'barrio', label: 'Barrios', icon: Home },
  { key: 'city', label: 'Ciudades', icon: Building2 },
  { key: 'province', label: 'Provincias', icon: Map },
  { key: 'national', label: 'Nacional', icon: Globe },
] as const;

export default function MandateCascade({ currentLevel, currentName }: MandateCascadeProps) {
  const { data: mandates = [], isLoading } = useQuery<Mandate[]>({
    queryKey: ['/api/mandates'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const mandatesByLevel = LEVELS.reduce<Record<string, Mandate[]>>((acc, level) => {
    acc[level.key] = mandates.filter((m) => m.territoryLevel === level.key);
    return acc;
  }, {});

  return (
    <section className="w-full py-8">
      <h3 className="text-lg font-semibold text-white mb-6 text-center">
        Cascada de Mandatos
      </h3>

      {/* Vertical on mobile, horizontal on lg+ */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-0 lg:gap-0">
        {LEVELS.map((level, index) => {
          const Icon = level.icon;
          const isCurrent = level.key === currentLevel;
          const levelMandates = mandatesByLevel[level.key] ?? [];

          return (
            <div key={level.key} className="flex flex-col lg:flex-row items-center">
              {/* Level node */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.4 }}
                className={`
                  relative w-full lg:w-56 p-4 rounded-2xl backdrop-blur-md
                  border transition-colors
                  ${isCurrent
                    ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                    : 'bg-white/5 border-white/10'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg
                      ${isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${isCurrent ? 'text-amber-300' : 'text-white'}`}
                  >
                    {level.label}
                  </span>
                </div>

                {/* Mandates list */}
                {isLoading ? (
                  <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
                ) : levelMandates.length === 0 ? (
                  <p className="text-xs text-white/30 italic">Sin mandatos</p>
                ) : (
                  <ul className="space-y-1.5">
                    {levelMandates.map((mandate) => {
                      const isHighlighted =
                        isCurrent &&
                        mandate.territoryName.toLowerCase() === currentName.toLowerCase();

                      return (
                        <li key={mandate.id}>
                          <Link
                            href={`/mandato/${mandate.territoryLevel}/${encodeURIComponent(mandate.territoryName)}`}
                            className={`
                              group flex items-center justify-between gap-2 px-2 py-1 rounded-lg
                              text-xs transition-colors
                              ${isHighlighted
                                ? 'bg-amber-500/15 text-amber-200'
                                : 'hover:bg-white/5 text-white/70 hover:text-white'
                              }
                            `}
                          >
                            <span className="truncate">{mandate.territoryName}</span>
                            <span className="flex items-center gap-1 shrink-0 text-white/40 group-hover:text-white/60">
                              <Users className="w-3 h-3" />
                              {mandate.voiceCount}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>

              {/* Connector arrow between levels */}
              {index < LEVELS.length - 1 && (
                <div className="flex flex-col lg:flex-row items-center justify-center py-1 lg:py-0 lg:px-1">
                  {/* Vertical connector (mobile) */}
                  <div className="flex flex-col items-center lg:hidden">
                    <motion.div
                      className="w-px h-4 bg-gradient-to-b from-white/20 to-white/5"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.12 + 0.3, duration: 0.3 }}
                    />
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    >
                      <ChevronDown className="w-4 h-4 text-white/25" />
                    </motion.div>
                    <motion.div
                      className="w-px h-4 bg-gradient-to-b from-white/5 to-white/20"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: index * 0.12 + 0.35, duration: 0.3 }}
                    />
                  </div>

                  {/* Horizontal connector (desktop) */}
                  <div className="hidden lg:flex items-center">
                    <motion.div
                      className="h-px w-4 bg-gradient-to-r from-white/20 to-white/5"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.12 + 0.3, duration: 0.3 }}
                    />
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      className="rotate-[-90deg]"
                    >
                      <ChevronDown className="w-4 h-4 text-white/25" />
                    </motion.div>
                    <motion.div
                      className="h-px w-4 bg-gradient-to-r from-white/5 to-white/20"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.12 + 0.35, duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
