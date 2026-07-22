import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, GranoPapel, Kicker, Palitos, PapelCard, TituloAnton } from '@/components/papel';
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
import { AMBAR_PT } from '@/theme/tokens';

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

function FactRow({ label, value, warning = false }: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <View className="border-t border-bordeSuave py-3">
      <Text className="font-space text-[10px] uppercase tracking-[1.6px] text-tinta-50">{label}</Text>
      <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-90" style={warning ? { color: AMBAR_PT } : undefined}>
        {value}
      </Text>
    </View>
  );
}

/** Fila de opción neutra — sin color por opción (spec: la procedencia no es
 * una señal, spec §2/§8). Reusada para el método (paso 1) y el veredicto
 * (paso 2); `disabled`/`silent`/`accessibilityHint` sólo los usa el paso 2. */
function OpcionFila({
  title,
  description,
  footer,
  disabled = false,
  silent = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: {
  title: string;
  description: string;
  footer?: string;
  disabled?: boolean;
  silent?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable97
      silent={silent}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      onPress={onPress}
      className={`bg-papel-crudo px-4 py-4 border ${disabled ? 'border-tinta-30' : 'border-tinta'}`}
    >
      <Text className={`font-archivo-bold text-sm ${disabled ? 'text-tinta-30' : 'text-tinta'}`}>{title}</Text>
      <Text className={`mt-1 font-archivo text-xs leading-5 ${disabled ? 'text-tinta-30' : 'text-tinta-75'}`}>{description}</Text>
      {footer && (
        <Text className={`mt-3 border-t border-bordeSuave pt-3 font-archivo text-[11px] leading-5 ${disabled ? 'text-tinta-30' : 'text-tinta-50'}`}>
          {footer}
        </Text>
      )}
    </Pressable97>
  );
}

function ObservationCard({ observation, previousCount }: {
  observation: CivicObservationRow;
  previousCount: number;
}) {
  const evidence = summarizeObservationEvidence(observation.evidenceJson);
  const context = recordContextFor('observation', observation.id);
  return (
    <PapelCard className="p-5">
      <View className="flex-row items-center justify-between gap-3">
        <ChipTipo etiqueta={CAMPAIGN_LABEL[observation.campaignKey] ?? 'Señal'} activo />
        <Text className="font-space text-[10px] text-tinta-50">
          {previousCount} {previousCount === 1 ? 'mirada' : 'miradas'}
        </Text>
      </View>

      <TituloAnton tamano="md" className="mt-5">{observation.title}</TituloAnton>
      {observation.summary && (
        <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">{observation.summary}</Text>
      )}

      <View className="mt-4">
        <FactRow label="Vigencia" value={observationAgeLabel(observation.observedAt)} />
        <FactRow
          label="Evidencia de origen"
          value={evidence.label}
          warning={evidence.count === 0}
        />
        <FactRow
          label="Lugar del hecho"
          value={contextLocationSummary(context) || publicPrecisionLabel(observation.publicPrecision)}
        />
        <FactRow label="Autoría visible" value={contextAttributionSummary(context)} />
      </View>
    </PapelCard>
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>mirada con procedencia</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Corroborar</TituloAnton>
        </View>
        <View className="mt-4 flex-row items-center gap-2.5">
          <Palitos total={queue.length} />
          <Text className="font-space text-[11px] uppercase tracking-[1px] text-tinta-50">
            {queue.length} en ronda
          </Text>
        </View>
      </View>
      <View className="flex-1">
        {message && (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
            accessibilityLiveRegion="polite"
            className="mx-5 mt-3"
          >
            <PapelCard variante="suave" className="px-4 py-3">
              <Text className="font-archivo text-xs leading-5 text-tinta-75">{message}</Text>
            </PapelCard>
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
                <Kicker tono="neutro">Paso 1 de 2 · Procedencia</Kicker>
                <TituloAnton tamano="md" className="mt-2">¿Cómo sabés lo que sabés?</TituloAnton>
                <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
                  Elegí la base real de tu mirada. La honestidad del método importa tanto como el resultado.
                </Text>

                <View className="mt-5 gap-3">
                  {VERIFICATION_METHODS.map((option) => (
                    <OpcionFila
                      key={option.key}
                      title={`${option.label} →`}
                      description={option.description}
                      accessibilityLabel={`${option.label}. ${option.description}`}
                      accessibilityHint="Continúa al resultado de la corroboración"
                      onPress={() => {
                        setMessage(null);
                        setMethodChoice({ observationId: observation.id, method: option.key });
                      }}
                    />
                  ))}
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.duration(280)} className="mt-7">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Kicker tono="neutro">Paso 2 de 2 · Resultado</Kicker>
                    <TituloAnton tamano="md" className="mt-2">¿Qué comprobaste?</TituloAnton>
                  </View>
                  <BotonTinta
                    etiqueta="Cambiar método"
                    variante="fantasma"
                    tamano="compacto"
                    accessibilityLabel="Cambiar cómo lo sé"
                    onPress={() => setMethodChoice(null)}
                  />
                </View>

                {methodDefinition && (
                  <PapelCard variante="suave" className="mt-4 px-4 py-4">
                    <Text className="font-archivo-bold text-xs text-tinta">{methodDefinition.label}</Text>
                    <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{methodDefinition.instruction}</Text>
                  </PapelCard>
                )}

                <View className="mt-5 gap-3">
                  {verdictsForMethod(selectedMethod).map((option) => (
                    <OpcionFila
                      key={option.key}
                      title={option.label}
                      description={option.description}
                      footer={option.consequence}
                      silent
                      disabled={!actor || submittingId === observation.id}
                      accessibilityLabel={`${option.label}. ${option.description}`}
                      accessibilityHint={option.consequence}
                      onPress={() => verdict(option.key)}
                    />
                  ))}
                </View>

                <Text className="mt-5 font-archivo text-[11px] leading-5 text-tinta-50">
                  No mostramos porcentajes de “certeza”: cada envío registra el método declarado y sus límites para que otras personas puedan auditarlo.
                </Text>
              </Animated.View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-10" style={{ paddingBottom: insets.bottom + 24 }}>
            <TituloAnton tamano="lg" className="text-center">
              {networkState === 'link_required' ? 'Abrí la ronda compartida.' : 'La ronda está al día.'}
            </TituloAnton>
            <Text className="mt-3 text-center font-archivo text-sm leading-6 text-tinta-75">
              {networkState === 'link_required'
                ? 'Vinculá una cuenta para recibir hechos de campo publicados por otras personas, sin revelar tu bitácora privada.'
                : networkState === 'local'
                  ? 'Tus capturas siguen funcionando offline. La ronda aparecerá cuando esta instalación se conecte a la red cívica.'
                  : 'Cuando haya hechos de campo que necesiten otra mirada, van a llegar acá. Sueños y propuestas se deliberan: no se verifican como hechos.'}
            </Text>
            <View className="mt-7">
              <BotonTinta
                etiqueta={networkState === 'link_required' ? 'Vincular mi cuenta' : 'Volver al territorio'}
                accessibilityLabel={networkState === 'link_required' ? 'Vincular mi cuenta' : 'Volver al territorio'}
                onPress={() => router.replace(networkState === 'link_required' ? '/circulos' : '/territorio')}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
