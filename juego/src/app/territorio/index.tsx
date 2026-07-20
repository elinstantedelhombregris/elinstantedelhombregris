import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIVIC_CAMPAIGNS, type CivicCampaignDefinition } from '@/civic/campaigns';
import { listeningsAll } from '@/civic/listening';
import { missionsAll } from '@/civic/missions';
import { retryDeadLetters, syncCivicNetwork } from '@/civic/sync';
import {
  matchesAll,
  isCivicRecordExpired,
  needsAll,
  observationsAll,
  observationsToVerify,
  outboxHealth,
  pendingOutbox,
  resourcesAll,
  territoriesAll,
} from '@/civic/repo';
import { PLANTILLAS_EXPEDICION } from '@/content';
import { expedicionesTodas, fundarExpedicion } from '@/db/repos';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { PLATA } from '@/theme/tokens';

interface Pulse {
  observations: number;
  review: number;
  needs: number;
  resources: number;
  matches: number;
  queued: number;
  deadLetters: number;
  sending: number;
  territories: number;
  drafts: number;
  voices: number;
  missions: number;
}

const EMPTY: Pulse = { observations: 0, review: 0, needs: 0, resources: 0, matches: 0, queued: 0, deadLetters: 0, sending: 0, territories: 0, drafts: 0, voices: 0, missions: 0 };

export default function Territorio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pulse, setPulse] = useState<Pulse>(EMPTY);
  const [repairing, setRepairing] = useState(false);

  const refresh = useCallback(() => {
    const observations = observationsAll();
    const outbox = outboxHealth();
    setPulse({
      observations: observations.length,
      review: observationsToVerify().filter((item) => item.creatorKey?.startsWith('remote:')).length,
      needs: needsAll().filter((item) =>
        !['resolved', 'withdrawn'].includes(item.status) && !isCivicRecordExpired(item)).length,
      resources: resourcesAll().filter((item) =>
        item.status === 'available'
        && !isCivicRecordExpired(item)
        && (item.quantity == null || item.quantity > 0)).length,
      matches: matchesAll().filter((item) => !['confirmed', 'declined', 'cancelled'].includes(item.status)).length,
      queued: pendingOutbox().length,
      deadLetters: outbox.deadLetter,
      sending: outbox.sending,
      territories: territoriesAll().length,
      drafts: observations.filter((item) => item.status === 'draft').length,
      voices: listeningsAll().length,
      missions: missionsAll().filter((item) => ['planning', 'active', 'paused'].includes(item.status)).length,
    });
  }, []);

  const repairOutbox = async () => {
    if (repairing) return;
    setRepairing(true);
    try {
      retryDeadLetters();
      await syncCivicNetwork();
      refresh();
    } finally {
      setRepairing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    refresh();
    syncCivicNetwork().then(refresh);
  }, [refresh]));

  const play = (campaign: CivicCampaignDefinition) => {
    const template = PLANTILLAS_EXPEDICION.find((item) => item.slug === campaign.expeditionSlug);
    if (!template) return;
    const existing = expedicionesTodas().find(
      (item) => item.plantillaId === template.id && item.estado === 'activa',
    );
    if (existing) {
      router.push(`/expediciones/${existing.id}`);
      return;
    }
    const expedition = fundarExpedicion({
      plantillaId: template.id,
      titulo: template.titulo,
      zona: 'Zona a confirmar',
      meta: template.metaSugerida,
      origen: 'precargada',
    });
    router.push(`/expediciones/${expedition.id}`);
  };

  const nextTitle = pulse.voices === 0
    ? 'Escuchá la primera voz'
    : pulse.observations === 0
      ? 'Encendé el primer dato'
    : pulse.drafts > 0
      ? 'Elegí qué sumar al mapa común'
    : pulse.review > 0
      ? 'Corroborá una señal cercana'
      : pulse.needs > pulse.resources
        ? 'Ofrecé un recurso concreto'
        : 'Dibujá tu próximo territorio';
  const nextRoute = pulse.voices === 0
    ? '/escuchar'
    : pulse.observations === 0
      ? null
    : pulse.drafts > 0
      ? '/publicar'
    : pulse.review > 0
      ? '/verificar'
      : pulse.needs > pulse.resources
        ? '/aportar'
        : '/territorio/mapa';

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Territorio" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[28px] border border-white/10">
          <LinearGradient
            colors={['#171226', '#0D0C14', '#090909']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22, minHeight: 236 }}
          >
            <LivingHalo />
            <View className="self-start rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
              <Text className="font-sans-medium text-[10px] uppercase tracking-[2.5px] text-violet-200">
                Inteligencia colectiva
              </Text>
            </View>
            <Text className="mt-5 max-w-[300px] font-serif text-[32px] leading-[39px] text-plata">
              Del cielo íntimo al poder del territorio.
            </Text>
            <Text className="mt-3 max-w-[320px] font-sans text-sm leading-6 text-slate-400">
              Capturá, corroborá y conectá. Cada dato visible debe acercar una acción real.
            </Text>
            <View className="mt-6 flex-row items-center gap-5">
              {[
                [pulse.voices, 'voces'],
                [pulse.observations, 'señales'],
                [pulse.needs, 'necesidades'],
              ].map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-mono text-xl text-plata">{value}</Text>
                  <Text className="mt-0.5 font-sans text-[10px] uppercase tracking-[1.5px] text-slate-500">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        <Text className="mt-8 font-sans text-xs uppercase tracking-[2.5px] text-slate-400">
          ¿Qué pide tu atención hoy?
        </Text>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Escuchar una voz"
          onPress={() => router.push('/escuchar')}
          className="mt-3 overflow-hidden rounded-[24px] border border-violet-300/25 bg-violet-300/[0.08] p-5"
        >
          <LivingHalo color="#A78BFA" />
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
              <Ionicons name="ear-outline" size={22} color="#C4B5FD" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-serif text-xl text-plata">Escuchar una voz</Text>
              <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">
                Necesidad, sueño, propuesta o capacidad. Privada primero.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#A78BFA" />
          </View>
        </Pressable97>
        <View className="mt-3 flex-row gap-3">
          {[
            ['/verificar', 'shield-checkmark-outline', 'Cuidar una señal', `${pulse.review} por mirar`, '#7DD3FC'],
            ['/conectar', 'git-merge-outline', 'Tejer un puente', `${pulse.needs} ↔ ${pulse.resources}`, '#6EE7B7'],
          ].map(([route, icon, title, detail, color]) => (
            <Pressable97
              key={route}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => router.push(route as never)}
              className="min-h-[110px] flex-1 rounded-[20px] border border-white/10 bg-white/[0.04] p-4"
            >
              <Ionicons name={icon as never} size={20} color={color} />
              <Text className="mt-4 font-sans-semibold text-sm leading-5 text-plata">{title}</Text>
              <Text className="mt-1 font-mono text-xs text-slate-500">{detail}</Text>
            </Pressable97>
          ))}
        </View>
        <Text className="mt-3 text-center font-sans text-xs leading-5 text-slate-600">
          Hoy no hay tarea obligatoria. También podés mirar el cielo.
        </Text>

        <Text className="mt-8 font-sans text-xs uppercase tracking-[2.5px] text-slate-400">
          Gesto sugerido
        </Text>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel={nextTitle}
          onPress={() => nextRoute ? router.push(nextRoute as never) : play(CIVIC_CAMPAIGNS[0]!)}
          className="mt-3 overflow-hidden rounded-2xl border border-violet-300/25 bg-violet-300/10 px-5 py-4"
        >
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-violet-300/15">
              <Ionicons name="arrow-forward" size={18} color="#C4B5FD" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-sans-semibold text-sm text-plata">{nextTitle}</Text>
              <Text className="mt-1 font-sans text-xs text-slate-400">
                {pulse.deadLetters > 0
                  ? `${pulse.deadLetters} envíos necesitan reintento.`
                  : pulse.sending > 0
                    ? `${pulse.sending} movimientos se están enviando.`
                    : pulse.queued > 0
                      ? `${pulse.queued} movimientos esperan conexión y conservan su estado local.`
                      : 'Una acción pequeña, una consecuencia verificable.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8B7BB8" />
          </View>
        </Pressable97>

        {pulse.deadLetters > 0 && (
          <View className="mt-3 flex-row items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-4">
            <Ionicons name="warning-outline" size={18} color="#FDA4AF" />
            <View className="flex-1">
              <Text className="font-sans-semibold text-xs text-rose-100">Hay movimientos que no llegaron</Text>
              <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-400">Podés reabrir la cola; el servidor evita duplicados.</Text>
            </View>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Reintentar envíos detenidos"
              accessibilityState={{ disabled: repairing, busy: repairing }}
              disabled={repairing}
              onPress={() => { void repairOutbox(); }}
              className="min-h-11 justify-center rounded-full border border-rose-300/25 bg-rose-300/10 px-4"
              style={{ opacity: repairing ? 0.6 : 1 }}
            >
              <Text className="font-sans-semibold text-[11px] text-rose-100">{repairing ? 'Reintentando…' : 'Reintentar'}</Text>
            </Pressable97>
          </View>
        )}

        <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Campañas fundadoras
        </Text>
        <View className="mt-3 gap-3">
          {CIVIC_CAMPAIGNS.map((campaign, index) => (
            <Animated.View key={campaign.key} entering={staggerDelay(index)}>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={`Jugar ${campaign.title}`}
                onPress={() => play(campaign)}
              >
                <GlassCard className="overflow-hidden p-5">
                  <LivingHalo color={campaign.color} />
                  <View className="flex-row items-start">
                    <View
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${campaign.color}18`, borderColor: `${campaign.color}38`, borderWidth: 1 }}
                    >
                      <Ionicons name={campaign.icon as never} size={20} color={campaign.color} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-sans text-[10px] uppercase tracking-[2px]" style={{ color: campaign.color }}>
                        {campaign.eyebrow}
                      </Text>
                      <Text className="mt-1 font-serif text-xl leading-7 text-plata">{campaign.title}</Text>
                    </View>
                  </View>
                  <Text className="mt-4 font-sans text-xs leading-5 text-slate-400">{campaign.promise}</Text>
                  <View className="mt-4 flex-row items-center gap-2">
                    <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: campaign.color }} />
                    <Text className="flex-1 font-sans-medium text-[11px] leading-4 text-slate-300">{campaign.proof}</Text>
                  </View>
                </GlassCard>
              </Pressable97>
            </Animated.View>
          ))}
        </View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Abrir inteligencia territorial para evaluar calidad, cobertura y respuesta"
          onPress={() => router.push('/territorio/inteligencia')}
          className="mt-8 overflow-hidden rounded-[24px] border border-sky-300/20 bg-sky-300/[0.06] p-5"
        >
          <LivingHalo color="#38BDF8" />
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10">
              <Ionicons name="analytics-outline" size={22} color="#7DD3FC" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="font-sans text-[9px] uppercase tracking-[2px] text-sky-300">Sala de análisis</Text>
              <Text className="mt-1 font-serif text-xl text-plata">Inteligencia territorial</Text>
              <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">Calidad, vigencia, brechas, cobertura y prioridades explicadas.</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#7DD3FC" />
          </View>
        </Pressable97>

        <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Mesa territorial
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
          {[
            ['/territorio/misiones', 'grid-outline', 'Misiones', pulse.missions > 0 ? `${pulse.missions} en marcha` : 'Lazo → operación'],
            ['/territorio/mapa', 'map-outline', 'Trazar zona', pulse.territories > 0 ? `${pulse.territories} guardadas` : 'Lazo vivo'],
            ['/verificar', 'shield-checkmark-outline', 'Corroborar', `${pulse.review} por mirar`],
            ['/conectar', 'git-merge-outline', 'Conectar', `${pulse.needs} ↔ ${pulse.resources}`],
            ['/aportar', 'hand-left-outline', 'Aportar', 'Recurso concreto'],
            ['/mis-datos', 'receipt-outline', 'Mis datos', 'Corregir o retirar'],
          ].map(([route, icon, title, detail]) => (
            <Pressable97
              key={route}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => router.push(route as never)}
              className="w-[48.5%] rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <Ionicons name={icon as never} size={19} color={PLATA} />
              <Text className="mt-4 font-sans-semibold text-sm text-plata">{title}</Text>
              <Text className="mt-1 font-mono text-[10px] text-slate-500">{detail}</Text>
            </Pressable97>
          ))}
        </View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Abrir círculos y campañas de la red"
          onPress={() => router.push('/circulos')}
          className="mt-4 overflow-hidden rounded-2xl border border-sky-300/20 bg-sky-300/[0.07] p-5"
        >
          <LivingHalo color="#38BDF8" />
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10">
              <Ionicons name="people-outline" size={20} color="#7DD3FC" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-sans-semibold text-sm text-plata">Círculos y campañas</Text>
              <Text className="mt-1 font-sans text-xs text-slate-400">Del dato individual a la cobertura coordinada.</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#7DD3FC" />
          </View>
        </Pressable97>

        <View className="mt-8 flex-row items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-4">
          <Ionicons name="lock-closed-outline" size={16} color="#64748b" />
          <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">
            Cada registro confirma el lugar del asunto, la precisión pública y su firma. El punto exacto y las fotos permanecen en tu dispositivo; el contacto exige un puente aceptado.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
