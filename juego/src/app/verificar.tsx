import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { getActorKey } from '@/civic/identity';
import { selectedMapPointFirst } from '@/civic/map-point-action';
import { contextAttributionSummary, contextLocationSummary, recordContextFor } from '@/civic/record-context';
import { addVerification, observationsToVerify, verificationsFor } from '@/civic/repo';
import { syncCivicNetwork } from '@/civic/sync';
import type { VerificationVerdict } from '@/civic/types';
import { unreviewedObservationsForActor } from '@/civic/workflow-navigation';
import {
  observationAgeLabel,
  publicPrecisionLabel,
  summarizeObservationEvidence,
  VERIFICATION_METHODS,
  verificationProvenance,
  verdictsForMethod,
  type VerificationMethod,
} from '@/civic/verification-provenance';
import type { CivicObservationRow } from '@/db/schema';
import { haptic } from '@/theme/haptics';

const CAMPAIGN_LABEL: Record<string, string> = {
  'luminarias-v1': 'Luminarias',
  'ollas-v1': 'Ollas del barrio',
  'senal-libre-v1': 'Señal libre',
  'escucha-v1': 'Escucha colectiva',
};

const RESULT_MESSAGE: Record<VerificationVerdict, string> = {
  confirm: 'Corroboración registrada. Harán falta otras miradas independientes.',
  correct: 'La señal quedó marcada para revisión de sus datos.',
  duplicate: 'Registramos el posible duplicado sin borrar ninguna evidencia.',
  stale: 'La señal quedó marcada como desactualizada.',
  unsafe: 'La señal salió del circuito operativo para una revisión de cuidado.',
  cannot_verify: 'Gracias por no adivinar. Otra mirada podrá retomarla.',
};

function FactRow({ icon, label, value, warning = false }: {
  icon: string;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <View className="min-h-11 flex-row items-start gap-3 border-t border-white/[0.06] py-3">
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05]">
        <Ionicons name={icon as never} size={16} color={warning ? '#FBBF24' : '#94A3B8'} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-medium text-[10px] uppercase tracking-[1.6px] text-slate-500">{label}</Text>
        <Text className="mt-1 font-sans text-xs leading-5" style={{ color: warning ? '#FCD34D' : '#CBD5E1' }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ObservationCard({ observation, previousCount }: {
  observation: CivicObservationRow;
  previousCount: number;
}) {
  const evidence = summarizeObservationEvidence(observation.evidenceJson);
  const context = recordContextFor('observation', observation.id);
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <LivingHalo color="#38BDF8" />
      <View className="flex-row items-center justify-between gap-3">
        <View className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5">
          <Text className="font-sans-medium text-[10px] uppercase tracking-[2px] text-sky-200">
            {CAMPAIGN_LABEL[observation.campaignKey] ?? 'Señal'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={13} color="#64748B" />
          <Text className="font-mono text-[10px] text-slate-500">
            {previousCount} {previousCount === 1 ? 'mirada' : 'miradas'}
          </Text>
        </View>
      </View>

      <Text className="mt-6 font-serif text-[30px] leading-[38px] text-plata">{observation.title}</Text>
      {observation.summary && (
        <Text className="mt-3 font-sans text-sm leading-6 text-slate-300">{observation.summary}</Text>
      )}

      <View className="mt-5">
        <FactRow icon="time-outline" label="Vigencia" value={observationAgeLabel(observation.observedAt)} />
        <FactRow
          icon={evidence.count > 0 ? 'attach-outline' : 'alert-circle-outline'}
          label="Evidencia de origen"
          value={evidence.label}
          warning={evidence.count === 0}
        />
        <FactRow
          icon="location-outline"
          label="Lugar del hecho"
          value={contextLocationSummary(context) || publicPrecisionLabel(observation.publicPrecision)}
        />
        <FactRow icon="person-circle-outline" label="Autoría visible" value={contextAttributionSummary(context)} />
      </View>
    </GlassCard>
  );
}

export default function Verificar() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string }>();
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<CivicObservationRow[]>([]);
  const [actor, setActor] = useState<string | null>(null);
  const [methodChoice, setMethodChoice] = useState<{
    observationId: string;
    method: VerificationMethod;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [networkState, setNetworkState] = useState<'checking' | 'local' | 'link_required' | 'connected'>('checking');
  // Candado contra el doble toque: el ref corta sincrónicamente antes del
  // re-render y el estado deshabilita los botones de veredicto en pantalla.
  const submitLock = useRef<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const focusedObservationId = typeof params.focus === 'string' ? params.focus : null;
  const refresh = useCallback(() => setQueue(selectedMapPointFirst(
    unreviewedObservationsForActor(
      observationsToVerify(actor),
      actor,
      verificationsFor,
    ),
    focusedObservationId,
  )), [actor, focusedObservationId]);
  useFocusEffect(useCallback(() => {
    refresh();
    syncCivicNetwork()
      .then(({ pulled }) => {
        setNetworkState(!pulled.configured ? 'local' : pulled.linked ? 'connected' : 'link_required');
        refresh();
      })
      .catch(() => setNetworkState('local'));
  }, [refresh]));
  useEffect(() => { getActorKey().then(setActor); }, []);

  const observation = queue[0] ?? null;
  const previous = observation ? verificationsFor(observation.id) : [];
  const selectedMethod = observation && methodChoice?.observationId === observation.id
    ? methodChoice.method
    : null;
  const methodDefinition = VERIFICATION_METHODS.find((item) => item.key === selectedMethod) ?? null;

  const verdict = (value: VerificationVerdict) => {
    if (!observation || !actor || !selectedMethod) return;
    if (submitLock.current === observation.id) return;
    if (selectedMethod === 'cannot_verify' && value !== 'cannot_verify') return;
    if (previous.some((item) => item.verifierKey === actor)) {
      setMessage('Ya dejaste una mirada sobre esta señal. Hace falta otra persona.');
      return;
    }
    submitLock.current = observation.id;
    setSubmittingId(observation.id);
    try {
      const provenance = verificationProvenance({
        method: selectedMethod,
        verdict: value,
        observedAt: observation.observedAt,
      });
      addVerification({
        observationId: observation.id,
        verdict: value,
        verifierKey: actor,
        note: provenance.note,
        evidence: provenance.evidence,
      });
      haptic.send();
      setMessage(RESULT_MESSAGE[value]);
      setMethodChoice(null);
      setQueue((items) => items.slice(1));
    } catch {
      // Si falló, se libera el candado para que el reintento sea posible.
      submitLock.current = null;
      setSubmittingId(null);
      setMessage('No pudimos guardar esa mirada todavía. Probá de nuevo.');
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Corroborar" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5">
          <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">Mirada con procedencia</Text>
          <Text className="font-mono text-xs text-slate-500">{queue.length} en ronda</Text>
        </View>

        {message && (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
            accessibilityLiveRegion="polite"
            className="mx-5 mt-3 flex-row items-start gap-2 rounded-2xl border border-sky-300/15 bg-sky-300/[0.07] px-4 py-3"
          >
            <Ionicons name="information-circle-outline" size={17} color="#7DD3FC" />
            <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">{message}</Text>
          </Animated.View>
        )}

        {observation ? (
          <ScrollView
            key={observation.id}
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeIn.duration(300)}>
              <ObservationCard observation={observation} previousCount={previous.length} />
            </Animated.View>

            {!selectedMethod ? (
              <Animated.View entering={FadeInDown.duration(280).delay(80)} className="mt-7">
                <Text className="font-sans text-[10px] uppercase tracking-[2.6px] text-sky-300">Paso 1 de 2 · Procedencia</Text>
                <Text className="mt-2 font-serif text-[28px] leading-9 text-plata">¿Cómo sabés lo que sabés?</Text>
                <Text className="mt-2 font-sans text-sm leading-6 text-slate-400">
                  Elegí la base real de tu mirada. La honestidad del método importa tanto como el resultado.
                </Text>

                <View className="mt-5 gap-3">
                  {VERIFICATION_METHODS.map((option) => (
                    <Pressable97
                      key={option.key}
                      accessibilityRole="button"
                      accessibilityLabel={`${option.label}. ${option.description}`}
                      accessibilityHint="Continúa al resultado de la corroboración"
                      onPress={() => {
                        setMessage(null);
                        setMethodChoice({ observationId: observation.id, method: option.key });
                      }}
                      className="flex-row items-center gap-4 rounded-2xl border px-4 py-3"
                      style={{ minHeight: 68, borderColor: `${option.color}30`, backgroundColor: `${option.color}0C` }}
                    >
                      <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${option.color}18` }}>
                        <Ionicons name={option.icon as never} size={21} color={option.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-medium text-sm" style={{ color: option.color }}>{option.label}</Text>
                        <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{option.description}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={17} color="#64748B" />
                    </Pressable97>
                  ))}
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.duration(280)} className="mt-7">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-sans text-[10px] uppercase tracking-[2.6px] text-sky-300">Paso 2 de 2 · Resultado</Text>
                    <Text className="mt-2 font-serif text-[28px] leading-9 text-plata">¿Qué comprobaste?</Text>
                  </View>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Cambiar cómo lo sé"
                    onPress={() => setMethodChoice(null)}
                    className="min-h-11 justify-center rounded-full border border-white/10 bg-white/5 px-3"
                  >
                    <Text className="font-sans-medium text-[10px] text-slate-300">Cambiar método</Text>
                  </Pressable97>
                </View>

                {methodDefinition && (
                  <View className="mt-4 rounded-2xl border px-4 py-4" style={{ borderColor: `${methodDefinition.color}30`, backgroundColor: `${methodDefinition.color}0C` }}>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={methodDefinition.icon as never} size={17} color={methodDefinition.color} />
                      <Text className="font-sans-medium text-xs" style={{ color: methodDefinition.color }}>{methodDefinition.label}</Text>
                    </View>
                    <Text className="mt-2 font-sans text-xs leading-5 text-slate-300">{methodDefinition.instruction}</Text>
                  </View>
                )}

                <View className="mt-5 gap-3">
                  {verdictsForMethod(selectedMethod).map((option) => (
                    <Pressable97
                      key={option.key}
                      silent
                      disabled={!actor || submittingId === observation.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${option.label}. ${option.description}`}
                      accessibilityHint={option.consequence}
                      accessibilityState={{ disabled: !actor || submittingId === observation.id }}
                      onPress={() => verdict(option.key)}
                      className="rounded-2xl border px-4 py-4"
                      style={{ minHeight: 76, borderColor: `${option.color}30`, backgroundColor: `${option.color}0C`, opacity: actor && submittingId !== observation.id ? 1 : 0.5 }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${option.color}18` }}>
                          <Ionicons name={option.icon as never} size={20} color={option.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-sans-medium text-sm" style={{ color: option.color }}>{option.label}</Text>
                          <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{option.description}</Text>
                        </View>
                      </View>
                      <Text className="mt-3 border-t border-white/[0.06] pt-3 font-sans text-[11px] leading-5 text-slate-500">
                        {option.consequence}
                      </Text>
                    </Pressable97>
                  ))}
                </View>

                <View className="mt-5 flex-row items-start gap-2 rounded-2xl bg-white/[0.035] px-4 py-3">
                  <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
                  <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">
                    No mostramos porcentajes de “certeza”: cada envío registra el método declarado y sus límites para que otras personas puedan auditarlo.
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-10" style={{ paddingBottom: insets.bottom + 24 }}>
            <View className="h-20 w-20 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10">
              <Ionicons name="shield-checkmark" size={32} color="#6EE7B7" />
            </View>
            <Text className="mt-6 text-center font-serif text-3xl text-plata">
              {networkState === 'link_required' ? 'Abrí la ronda compartida.' : 'La ronda está al día.'}
            </Text>
            <Text className="mt-3 text-center font-sans text-sm leading-6 text-slate-400">
              {networkState === 'link_required'
                ? 'Vinculá una cuenta para recibir hechos de campo publicados por otras personas, sin revelar tu bitácora privada.'
                : networkState === 'local'
                  ? 'Tus capturas siguen funcionando offline. La ronda aparecerá cuando esta instalación se conecte a la red cívica.'
                  : 'Cuando haya hechos de campo que necesiten otra mirada, van a llegar acá. Sueños y propuestas se deliberan: no se verifican como hechos.'}
            </Text>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={networkState === 'link_required' ? 'Vincular mi cuenta' : 'Volver al territorio'}
              onPress={() => router.replace(networkState === 'link_required' ? '/circulos' : '/territorio')}
              className="mt-7 min-h-11 justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3"
            >
              <Text className="font-sans-medium text-xs text-plata">
                {networkState === 'link_required' ? 'Vincular mi cuenta' : 'Volver al territorio'}
              </Text>
            </Pressable97>
          </View>
        )}
      </View>
    </View>
  );
}
