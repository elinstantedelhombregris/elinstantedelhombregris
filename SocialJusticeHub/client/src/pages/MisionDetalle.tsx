import { useContext, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users, Target, Eye, Zap, Hammer, BarChart3,
  ArrowLeft, Loader2,
} from 'lucide-react';

import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import SmoothReveal from '@/components/ui/SmoothReveal';
import GlassCard from '@/components/ui/GlassCard';
import ShockStats from '@/components/ShockStats';
import { CitizenRoleList } from '@/components/CitizenRoleBadge';

import MissionTimeline from '@/components/mission/MissionTimeline';
import MissionTaskBoard from '@/components/mission/MissionTaskBoard';
import MissionJoinCTA from '@/components/mission/MissionJoinCTA';
import EvidenceSubmitForm from '@/components/mission/EvidenceSubmitForm';
import EvidenceFeed from '@/components/mission/EvidenceFeed';
import SignalFeed from '@/components/mission/SignalFeed';
import ChronicleSection from '@/components/mission/ChronicleSection';
import GuardrailsPanel from '@/components/mission/GuardrailsPanel';

import { MISSIONS } from '../../../shared/mission-registry';
import { MISSION_META, getInitiativesByMission } from '@/lib/initiative-utils';
import type { MissionSlug } from '../../../shared/strategic-initiatives';

export default function MisionDetalle() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const userContext = useContext(UserContext);

  const slug = params.slug as MissionSlug;
  const mission = MISSIONS.find(m => m.slug === slug);
  const meta = slug ? MISSION_META[slug] : undefined;

  // ---- Data loading ----

  const { data: missionPost, isLoading: postLoading } = useQuery({
    queryKey: ['mission-post', slug],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/community?type=mission');
      if (!res.ok) return null;
      const posts = await res.json();
      return posts.find((p: any) => p.missionSlug === slug) ?? null;
    },
    enabled: !!slug,
  });

  const postId = missionPost?.id;

  const { data: members = [] } = useQuery({
    queryKey: ['mission-members', postId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/community/${postId}/members`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['mission-milestones', postId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/community/${postId}/milestones`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['mission-tasks', postId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/community/${postId}/tasks`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  const { data: evidence = [] } = useQuery({
    queryKey: ['mission-evidence', postId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/community/${postId}/evidence`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  const { data: chronicles = [] } = useQuery({
    queryKey: ['mission-chronicles', postId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/community/${postId}/chronicles`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['mission-signals', slug],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/missions/${slug}/signals`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug,
  });

  // ---- Derived state ----

  const userMembership = useMemo(
    () =>
      members.find(
        (m: any) => m.userId === userContext?.user?.id && m.status === 'active',
      ) || null,
    [members, userContext?.user?.id],
  );

  const linkedInitiatives = useMemo(
    () => (slug ? getInitiativesByMission(slug) : []),
    [slug],
  );

  // ---- Guard: invalid slug ----

  if (!mission || !meta) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-xl text-slate-400">Mision no encontrada</p>
            <button
              onClick={() => setLocation('/community')}
              className="text-sm text-blue-400 hover:underline flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la comunidad
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- Guard: post still loading ----

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans relative overflow-hidden">
      <FluidBackground className="opacity-40" />
      <Header />

      <main className="relative z-10 pt-20">
        {/* ============================================================
            SECTION 1: DONDE DUELE — Hero + Emotional Context
            ============================================================ */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${meta.accent}15 0%, transparent 70%)`,
            }}
          />

          <div className="container-content relative z-10">
            {/* Back link */}
            <SmoothReveal>
              <button
                onClick={() => setLocation('/community')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10"
              >
                <ArrowLeft className="w-4 h-4" />
                Comunidad
              </button>
            </SmoothReveal>

            <div className="max-w-4xl mx-auto relative">
              {/* Ghost number */}
              <div
                className="absolute top-0 right-0 text-[8rem] font-bold select-none pointer-events-none leading-none"
                style={{ color: `${meta.accent}10` }}
              >
                {mission.number}
              </div>

              <SmoothReveal>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono tracking-widest uppercase backdrop-blur-md mb-8"
                  style={{
                    borderColor: `${meta.accent}40`,
                    color: meta.accent,
                    backgroundColor: `${meta.accent}10`,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  Mision {mission.number}
                </div>
              </SmoothReveal>

              <SmoothReveal delay={0.1}>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
                  {mission.label}
                </h1>
              </SmoothReveal>

              <SmoothReveal delay={0.2}>
                <blockquote
                  className="text-xl md:text-2xl font-serif italic text-slate-400/80 leading-relaxed mb-8 border-l-2 pl-6"
                  style={{ borderColor: meta.accent }}
                >
                  {mission.whatHurts}
                </blockquote>
              </SmoothReveal>

              <SmoothReveal delay={0.3}>
                <p className="text-lg text-slate-300 leading-relaxed mb-12">
                  {mission.whatWeGuarantee}
                </p>
              </SmoothReveal>

              {/* ShockStats */}
              <SmoothReveal delay={0.4}>
                <ShockStats
                  stats={[
                    {
                      id: 'members',
                      label: 'Miembros',
                      value: members.length,
                      unit: '',
                      color: 'blue' as const,
                      icon: <Users className="w-5 h-5" />,
                      description: 'En esta mision',
                    },
                    {
                      id: 'milestones',
                      label: 'Hitos Cumplidos',
                      value: milestones.filter((m: any) => m.status === 'completed').length,
                      unit: `/${milestones.length}`,
                      color: 'purple' as const,
                      icon: <Target className="w-5 h-5" />,
                      description: 'Avance real',
                    },
                    {
                      id: 'evidence',
                      label: 'Evidencias',
                      value: evidence.length,
                      unit: '',
                      color: 'green' as const,
                      icon: <Eye className="w-5 h-5" />,
                      description: 'Documentadas',
                    },
                    {
                      id: 'tasks',
                      label: 'Tareas Activas',
                      value: tasks.filter((t: any) => t.status !== 'done' && t.status !== 'completed').length,
                      unit: '',
                      color: 'yellow' as const,
                      icon: <Zap className="w-5 h-5" />,
                      description: 'En curso',
                    },
                  ]}
                  title="PULSO DE LA MISION"
                  variant="dark"
                />
              </SmoothReveal>

              {/* Citizen Roles */}
              <SmoothReveal delay={0.5}>
                <div className="mt-12">
                  <h3
                    className="font-mono text-xs tracking-[0.3em] uppercase mb-4"
                    style={{ color: meta.accent }}
                  >
                    Roles Ciudadanos
                  </h3>
                  <CitizenRoleList roles={mission.citizenRoles} size="md" />
                </div>
              </SmoothReveal>

              {/* Join CTA */}
              <SmoothReveal delay={0.6}>
                <div className="mt-12">
                  <MissionJoinCTA
                    mission={mission}
                    postId={postId || 0}
                    userMembership={userMembership}
                    onJoined={() =>
                      queryClient.invalidateQueries({
                        queryKey: ['mission-members', postId],
                      })
                    }
                  />
                </div>
              </SmoothReveal>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 2: QUE HACEMOS — Operational Dashboard
            ============================================================ */}
        <section className="py-16 border-t border-white/5">
          <div className="container-content">
            <SmoothReveal>
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${meta.accent}20` }}
                >
                  <Hammer className="w-5 h-5" style={{ color: meta.accent }} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    Que Hacemos
                  </h2>
                  <p className="text-sm text-slate-500">
                    Hitos, tareas y planes de accion
                  </p>
                </div>
              </div>
            </SmoothReveal>

            {/* Timeline */}
            <MissionTimeline milestones={milestones} mission={mission} />

            {/* Linked PLANs */}
            {linkedInitiatives.length > 0 && (
              <div className="mt-12">
                <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                  Planes Estrategicos Vinculados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedInitiatives.map((initiative, i) => (
                    <SmoothReveal key={initiative.slug} delay={i * 0.08}>
                      <GlassCard
                        className="p-4 cursor-pointer hover:border-white/20 transition-all"
                        onClick={() =>
                          setLocation(`/recursos/iniciativas/${initiative.slug}`)
                        }
                      >
                        <h4 className="text-sm font-bold text-white mb-1">
                          {initiative.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {initiative.summary}
                        </p>
                      </GlassCard>
                    </SmoothReveal>
                  ))}
                </div>
              </div>
            )}

            {/* Task Board */}
            <div className="mt-12">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                Tablero de Tareas
              </h3>
              <MissionTaskBoard
                tasks={tasks}
                postId={postId || 0}
                userMembership={userMembership}
              />
            </div>

            {/* Evidence Submit Form (only for members) */}
            {userMembership && (
              <div className="mt-12">
                <EvidenceSubmitForm
                  postId={postId || 0}
                  mission={mission}
                  onSuccess={() =>
                    queryClient.invalidateQueries({
                      queryKey: ['mission-evidence', postId],
                    })
                  }
                />
              </div>
            )}

            {/* Signal Feed */}
            {signals.length > 0 && (
              <div className="mt-12">
                <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                  Senales Ciudadanas
                </h3>
                <SignalFeed signals={signals} />
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            SECTION 3: COMO VAMOS — Accountability + Story
            ============================================================ */}
        <section className="py-16 border-t border-white/5">
          <div className="container-content">
            <SmoothReveal>
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${meta.accent}20` }}
                >
                  <BarChart3 className="w-5 h-5" style={{ color: meta.accent }} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    Como Vamos
                  </h2>
                  <p className="text-sm text-slate-500">
                    Evidencia, transparencia y rendicion de cuentas
                  </p>
                </div>
              </div>
            </SmoothReveal>

            {/* Guardrails Panel */}
            <GuardrailsPanel
              pauseConditions={mission.pauseConditions}
              evidence={evidence}
              missionStatus={missionPost?.status || 'active'}
            />

            {/* KPI Placeholders */}
            <div className="mt-8">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                Indicadores Clave
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mission.kpiNames.map((kpi, i) => (
                  <GlassCard key={i} className="p-4 text-center">
                    <p className="text-sm text-slate-300 mb-2">{kpi}</p>
                    <p className="text-xs text-slate-600">Pendiente de datos</p>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Evidence Feed */}
            <div className="mt-8">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                Registro de Evidencia
              </h3>
              {evidence.length > 0 ? (
                <EvidenceFeed
                  evidence={evidence}
                  userRole={userMembership?.role || userMembership?.citizenRole || null}
                  postId={postId || 0}
                />
              ) : (
                <GlassCard className="p-8 text-center">
                  <Eye className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">
                    Se el primero en documentar la realidad de tu territorio
                  </p>
                </GlassCard>
              )}
            </div>

            {/* Chronicles */}
            <div className="mt-8">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                Cronicas del Proceso
              </h3>
              <ChronicleSection
                chronicles={chronicles}
                postId={postId || 0}
                userRole={userMembership?.role || userMembership?.citizenRole || null}
              />
            </div>

            {/* What We Won't Promise */}
            <div className="mt-8">
              <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5" hoverEffect={false}>
                <h3 className="text-sm font-bold text-amber-400 mb-3 font-mono tracking-wider uppercase">
                  Lo Que No Prometemos Todavia
                </h3>
                <ul className="space-y-2">
                  {mission.whatWeWontPromiseYet.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-400 flex items-start gap-2"
                    >
                      <span className="text-amber-500 mt-1">--</span> {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* The story it tells */}
            <SmoothReveal delay={0.1}>
              <div className="mt-8">
                <GlassCard className="p-6" hoverEffect={false}>
                  <p className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-3">
                    La historia que cuenta esta mision
                  </p>
                  <p className="text-lg font-serif italic text-slate-300 leading-relaxed">
                    {mission.storyItTells}
                  </p>
                </GlassCard>
              </div>
            </SmoothReveal>

            {/* Members */}
            <div className="mt-8">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">
                Miembros ({members.length})
              </h3>
              {members.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {members.slice(0, 12).map((m: any, i: number) => (
                    <GlassCard key={m.id || i} className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {m.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm text-white truncate">
                          {m.user?.name || 'Anonimo'}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">
                          {m.citizenRole || m.role || 'miembro'}
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-6 text-center">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Todavia no hay miembros. Se el primero en sumarte.
                  </p>
                </GlassCard>
              )}
              {members.length > 12 && (
                <p className="text-xs text-slate-600 text-center mt-3">
                  y {members.length - 12} mas...
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
