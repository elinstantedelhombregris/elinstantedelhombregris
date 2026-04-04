import { motion } from 'framer-motion';
import { Users, ShieldCheck } from 'lucide-react';
import { MISSION_META, MISSION_ORDER } from '@/lib/initiative-utils';
import type { MissionSlug } from '../../../../shared/strategic-initiatives';

interface MisionesSectionProps {
  missionStatsData: any[];
  missionPosts: any[];
  onNavigate: (path: string) => void;
}

export default function MisionesSection({ missionStatsData, missionPosts, onNavigate }: MisionesSectionProps) {
  return (
    <>
      {/* PULSO NACIONAL */}
      {missionStatsData.length > 0 && (
        <section className="py-6 border-b border-white/5">
          <div className="container-content">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">Pulso Nacional</div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {missionStatsData.map((stat: any) => {
                const statMeta = MISSION_META[stat.slug as MissionSlug];
                if (!statMeta) return null;
                return (
                  <div
                    key={stat.slug}
                    onClick={() => onNavigate(`/mision/${stat.slug}`)}
                    className="flex-shrink-0 w-48 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${statMeta.accent}20` }}>
                        <statMeta.icon className="w-4 h-4" style={{ color: statMeta.accent }} />
                      </div>
                      <span className="text-xs font-bold text-white truncate">{statMeta.shortLabel}</span>
                      {stat.status === 'paused' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                    <div className="flex gap-3 text-[10px] text-slate-500">
                      <span>{stat.memberCount} miembros</span>
                      <span>{stat.milestonesCompleted}/{stat.milestonesTotal} hitos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* MISIONES NACIONALES */}
      <section className="py-8 border-b border-white/5">
        <div className="container-content">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Misiones Nacionales</h2>
              <p className="text-sm text-slate-500">Cinco ejes de reconstrucción. Elegí dónde poner el cuerpo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {MISSION_ORDER.map((slug) => {
              const meta = MISSION_META[slug];
              const missionPost = missionPosts.find((p: any) => p.missionSlug === slug);
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: meta.number * 0.08 }}
                  onClick={() => onNavigate(`/mision/${slug}`)}
                  className={`relative group cursor-pointer rounded-2xl p-4 border border-white/10 bg-gradient-to-br ${meta.gradient} hover:border-white/20 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold tracking-wider uppercase" style={{ color: meta.accent }}>
                      Misión {meta.number}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 leading-tight">{meta.shortLabel}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{meta.description}</p>
                  {missionPost && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Users className="w-3 h-3" />
                      <span>{missionPost.memberCount || 0} miembros</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <meta.icon className="w-5 h-5 opacity-20 group-hover:opacity-40 transition-opacity" style={{ color: meta.accent }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
