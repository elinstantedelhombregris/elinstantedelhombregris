import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { getActorKey } from '@/civic/identity';
import { civicCategoryLabel } from '@/civic/labels';
import {
  acceptMatchSide,
  actionsAll,
  createAction,
  matchesAll,
  needsAll,
  resourcesAll,
  transitionAction,
  transitionMatch,
} from '@/civic/repo';
import type { CivicActionRow, CivicMatchRow, CivicNeedRow, CivicResourceRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

type RoomSnapshot = {
  match: CivicMatchRow;
  need: CivicNeedRow;
  resource: CivicResourceRow;
  action: CivicActionRow | null;
};

type StageState = 'done' | 'active' | 'pending';

const REDACTED = 'dato protegido';

/**
 * Los títulos sincronizados son texto aportado por personas. Esta sala nunca
 * los usa como un canal lateral para revelar correo, teléfono o domicilio.
 */
const safeText = (value: string | null | undefined, fallback: string): string => {
  if (!value?.trim()) return fallback;
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, `[${REDACTED}]`)
    .replace(/(?:\+?\d[\s().-]*){7,}\d/g, `[${REDACTED}]`)
    .replace(/\b(?:calle|avenida|av\.?|pasaje|ruta)\s+[\p{L}\d .'-]+\s\d{1,5}\b/giu, `[${REDACTED}]`)
    .trim();
};

const parseReasons = (value: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
};

const parseAvailability = (value: string): string => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return 'A coordinar';
    const status = (parsed as Record<string, unknown>).status;
    if (status === 'a_coordinar') return 'A coordinar entre las partes';
    if (status === 'inmediata') return 'Disponibilidad inmediata';
    if (status === 'semanal') return 'Disponibilidad semanal';
    return 'A coordinar';
  } catch {
    return 'A coordinar';
  }
};

const formatAmount = (quantity: number | null, unit: string | null): string => {
  if (quantity == null) return 'Cantidad a acordar';
  return `${quantity.toLocaleString('es-AR')} ${safeText(unit, 'unidades')}`;
};

const shortDate = (value: string | null): string => {
  if (!value) return 'Sin vencimiento informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha a coordinar';
  return `Hasta ${new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date)}`;
};

const statusLabel = (match: CivicMatchRow, action: CivicActionRow | null): string => {
  if (match.status === 'cancelled') return 'Retirado';
  if (match.status === 'declined') return 'No acordado';
  if (action?.status === 'confirmed' || match.status === 'confirmed') return 'Impacto confirmado';
  if (action?.status === 'completed' || match.status === 'fulfilled') return 'Entrega declarada';
  if (action) return 'En coordinación';
  if (match.acceptedNeedAt && match.acceptedResourceAt) return 'Acuerdo bilateral';
  return 'Propuesta abierta';
};

function Stage({
  icon,
  title,
  description,
  state,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  state: StageState;
  last?: boolean;
}) {
  const color = state === 'done' ? '#6EE7B7' : state === 'active' ? '#C4B5FD' : '#475569';
  return (
    <View className="flex-row">
      <View className="items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: `${color}66`, backgroundColor: `${color}14` }}
        >
          <Ionicons name={state === 'done' ? 'checkmark' : icon} size={16} color={color} />
        </View>
        {!last && <View className="my-1 h-10 w-px" style={{ backgroundColor: state === 'done' ? '#6EE7B755' : '#FFFFFF14' }} />}
      </View>
      <View className="ml-3 flex-1 pb-5">
        <Text className="font-sans-semibold text-xs" style={{ color: state === 'pending' ? '#64748B' : '#E2E8F0' }}>{title}</Text>
        <Text className="mt-1 font-sans text-[11px] leading-[18px] text-slate-500">{description}</Text>
      </View>
    </View>
  );
}

function DataPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
      <Ionicons name={icon} size={13} color="#94A3B8" />
      <Text className="font-sans text-[10px] text-slate-300">{label}</Text>
    </View>
  );
}

export default function TramaRoom() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [actor, setActor] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);

  useEffect(() => { getActorKey().then(setActor); }, []);

  const refresh = useCallback(() => {
    const match = matchesAll().find((item) => item.id === id);
    if (!match) {
      setSnapshot(null);
      setLoaded(true);
      return;
    }
    const need = needsAll().find((item) => item.id === match.needId);
    const resource = resourcesAll().find((item) => item.id === match.resourceId);
    if (!need || !resource) {
      setSnapshot(null);
      setLoaded(true);
      return;
    }
    setSnapshot({
      match,
      need,
      resource,
      action: actionsAll().find((item) => item.matchId === match.id) ?? null,
    });
    setLoaded(true);
  }, [id]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const reasons = useMemo(() => snapshot ? parseReasons(snapshot.match.reasonsJson) : [], [snapshot]);

  if (!loaded) return <View className="flex-1 bg-fondo" />;

  if (!snapshot) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Sala del puente" />
        <View className="flex-1 items-center justify-center px-7 pb-20">
          <Ionicons name="link-outline" size={32} color="#64748B" />
          <Text className="mt-4 text-center font-serif text-2xl text-plata">Este puente ya no está disponible.</Text>
          <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-500">Puede haberse retirado o todavía no haber llegado a este dispositivo.</Text>
          <Pressable97 accessibilityRole="button" accessibilityLabel="Volver a conectar" onPress={() => router.replace('/conectar')} className="mt-6 rounded-full border border-white/10 bg-white/5 px-5 py-3">
            <Text className="font-sans-medium text-xs text-plata">Ver otros puentes</Text>
          </Pressable97>
        </View>
      </View>
    );
  }

  const { match, need, resource, action } = snapshot;
  const bothAccepted = Boolean(match.acceptedNeedAt && match.acceptedResourceAt);
  const closed = ['cancelled', 'declined'].includes(match.status) || action?.status === 'cancelled';
  const confirmed = match.status === 'confirmed' || action?.status === 'confirmed';
  const canRepresentNeed = need.ownedByMe;
  const canRepresentResource = resource.ownedByMe;

  const accept = (side: 'need' | 'resource') => {
    if (!actor || closed) return;
    const oppositeMine = side === 'need' ? match.acceptedResourceBy === actor : match.acceptedNeedBy === actor;
    if (oppositeMine) {
      setNotice('Una misma identidad no puede consentir por ambos lados. Compartí la propuesta con la otra parte.');
      return;
    }
    const next = acceptMatchSide(match.id, side, actor);
    if (next?.acceptedNeedAt && next.acceptedResourceAt) haptic.celebrate();
    else haptic.tick();
    setNotice(null);
    refresh();
  };

  const advance = () => {
    if (!bothAccepted || closed || confirmed) return;
    try {
      if (!action) {
        createAction({ matchId: match.id, title: 'Coordinar entrega y recepción' });
        transitionMatch(match.id, 'in_progress');
        setNotice('La coordinación comenzó. Acordá sólo lo necesario por un canal seguro y de confianza.');
      } else if (action.status === 'planned') {
        transitionAction(action.id, 'in_progress');
        setNotice('La acción está en marcha. Quien aporta podrá declarar la entrega.');
      } else if (action.status === 'in_progress') {
        if (!canRepresentResource) {
          setNotice('Sólo quien aporta puede declarar la entrega. La otra parte no puede hacerlo en su nombre.');
          return;
        }
        transitionAction(action.id, 'completed', { declaredBy: 'coordinator' });
        transitionMatch(match.id, 'fulfilled');
        setNotice('Entrega declarada. Falta la confirmación independiente de quien recibe.');
      } else if (action.status === 'completed') {
        if (!canRepresentNeed) {
          setNotice('Sólo quien recibe puede confirmar el resultado.');
          return;
        }
        transitionAction(action.id, 'confirmed', { confirmedBy: 'recipient' });
        transitionMatch(match.id, 'confirmed');
        haptic.celebrate();
        setNotice('Impacto confirmado por quien recibió. El puente queda listo para seguimiento.');
      }
    } catch {
      setNotice('No pudimos avanzar el puente. Su estado anterior quedó preservado; probá sincronizar antes de reintentar.');
    }
    refresh();
  };

  const withdraw = () => {
    Alert.alert(
      'Retirar mi participación',
      'Se detendrá este puente y quedará una marca auditable. La otra parte no recibirá ningún dato de contacto.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Retirarme',
          style: 'destructive',
          onPress: () => {
            if (action && action.status !== 'confirmed' && action.status !== 'cancelled') transitionAction(action.id, 'cancelled', { withdrawn: true });
            transitionMatch(match.id, 'cancelled');
            setNotice('Tu participación fue retirada. No hace falta justificarla para estar a salvo.');
            refresh();
          },
        },
      ],
    );
  };

  const primary = !action
    ? 'Abrir coordinación segura'
    : action.status === 'planned'
      ? 'Comenzar la acción'
      : action.status === 'in_progress'
        ? canRepresentResource ? 'Declarar entrega' : 'Esperando la entrega'
        : action.status === 'completed'
          ? canRepresentNeed ? 'Confirmar recepción' : 'Esperando confirmación'
          : 'Impacto confirmado';
  const primaryDisabled = closed || confirmed
    || (action?.status === 'in_progress' && !canRepresentResource)
    || (action?.status === 'completed' && !canRepresentNeed);

  const acceptedState: StageState = bothAccepted ? 'done' : 'active';
  const coordinationState: StageState = action
    ? (['completed', 'confirmed'].includes(action.status) ? 'done' : 'active')
    : bothAccepted ? 'active' : 'pending';
  const deliveryState: StageState = action?.status === 'completed' || action?.status === 'confirmed'
    ? 'done'
    : action?.status === 'in_progress' ? 'active' : 'pending';
  const confirmationState: StageState = confirmed ? 'done' : action?.status === 'completed' ? 'active' : 'pending';

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Sala del puente" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 48 }}>
        <Animated.View entering={fadeUp} className="relative mt-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#111015] p-6">
          <LivingHalo color={confirmed ? '#34D399' : '#8B5CF6'} />
          <View className="flex-row items-center justify-between gap-3">
            <View className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5">
              <Text className="font-mono text-[9px] uppercase tracking-[1.5px] text-violet-200">{statusLabel(match, action)}</Text>
            </View>
            <Text className="font-mono text-[11px] text-emerald-300">AFINIDAD {match.score}%</Text>
          </View>
          <Text className="mt-5 font-serif text-[31px] leading-[39px] text-plata">Un acuerdo, no una asignación.</Text>
          <Text className="mt-3 max-w-[390px] font-sans text-sm leading-6 text-slate-400">La afinidad explica por qué apareció el puente. Cada paso exige la decisión de la persona que representa ese lado.</Text>
        </Animated.View>

        {notice && (
          <Animated.View entering={fadeUp} className="mt-4 flex-row items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <Ionicons name="information-circle-outline" size={17} color="#FCD34D" />
            <Text className="flex-1 font-sans text-[11px] leading-5 text-amber-100">{notice}</Text>
          </Animated.View>
        )}

        <Animated.View entering={staggerDelay(1)} className="mt-6">
          <GlassCard className="overflow-hidden p-0">
            <View className="p-5">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-300/10"><Ionicons name="hand-left-outline" size={15} color="#FCD34D" /></View>
                <Text className="font-sans text-[10px] uppercase tracking-[2px] text-amber-200">Se necesita</Text>
              </View>
              <Text className="mt-4 font-serif text-2xl leading-8 text-plata">{safeText(need.title, 'Necesidad comunitaria')}</Text>
              <Text className="mt-1 font-sans text-xs text-slate-500">{civicCategoryLabel(need.category)}</Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <DataPill icon="cube-outline" label={formatAmount(need.quantity, need.unit)} />
                <DataPill icon="pulse-outline" label={`Urgencia ${need.urgency}/5`} />
                <DataPill icon="calendar-outline" label={shortDate(need.expiresAt)} />
              </View>
            </View>
            <View className="mx-5 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-white/10" />
              <View className="h-9 w-9 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10"><Ionicons name="link" size={15} color="#6EE7B7" /></View>
              <View className="h-px flex-1 bg-white/10" />
            </View>
            <View className="p-5">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-300/10"><Ionicons name="gift-outline" size={15} color="#6EE7B7" /></View>
                <Text className="font-sans text-[10px] uppercase tracking-[2px] text-emerald-200">Se puede aportar</Text>
              </View>
              <Text className="mt-4 font-serif text-2xl leading-8 text-plata">{safeText(resource.title, 'Recurso disponible')}</Text>
              <Text className="mt-1 font-sans text-xs text-slate-500">{civicCategoryLabel(resource.category)}</Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <DataPill icon="cube-outline" label={formatAmount(resource.quantity, resource.unit)} />
                <DataPill icon="time-outline" label={parseAvailability(resource.availabilityJson)} />
                <DataPill icon="navigate-outline" label={`Radio ${resource.radiusKm} km`} />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={staggerDelay(2)} className="mt-4">
          <GlassCard className="p-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="font-sans text-[10px] uppercase tracking-[2px] text-slate-500">Por qué se propuso</Text>
                <Text className="mt-2 font-serif text-xl text-plata">El puntaje se puede discutir.</Text>
              </View>
              <Text className="font-mono text-3xl text-plata">{match.score}</Text>
            </View>
            <View className="mt-4 gap-2">
              {(reasons.length ? reasons : ['La categoría y la disponibilidad pueden ser compatibles']).map((reason) => (
                <View key={reason} className="flex-row items-start gap-2">
                  <Ionicons name="checkmark-circle-outline" size={15} color="#6EE7B7" />
                  <Text className="flex-1 font-sans text-[11px] leading-[18px] text-slate-400">{safeText(reason, 'Criterio compatible')}</Text>
                </View>
              ))}
            </View>
            <Text className="mt-4 border-t border-white/10 pt-4 font-sans text-[10px] leading-[17px] text-slate-600">No mide el valor de ninguna persona ni toma decisiones. Usa categoría, cantidad, cercanía aproximada, urgencia y confianza declarada.</Text>
          </GlassCard>
        </Animated.View>

        <Text className="mt-8 font-sans text-[10px] uppercase tracking-[3px] text-slate-500">Consentimiento bilateral</Text>
        <View className="mt-3 gap-3">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel={match.acceptedNeedAt ? 'Necesidad aceptada' : 'Aceptar desde mi necesidad'}
            accessibilityState={{ disabled: Boolean(match.acceptedNeedAt) || !canRepresentNeed || closed }}
            disabled={Boolean(match.acceptedNeedAt) || !canRepresentNeed || closed}
            onPress={() => accept('need')}
            className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: match.acceptedNeedAt ? '#34D39918' : '#FFFFFF0A' }}>
              <Ionicons name={match.acceptedNeedAt ? 'checkmark-circle' : 'ellipse-outline'} size={19} color={match.acceptedNeedAt ? '#6EE7B7' : '#64748B'} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-xs text-slate-200">{match.acceptedNeedAt ? 'Quien necesita aceptó' : canRepresentNeed ? 'Aceptar desde mi necesidad' : 'Esperando a quien necesita'}</Text>
              <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">Consentimiento independiente · puede retirarse</Text>
            </View>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel={match.acceptedResourceAt ? 'Aporte aceptado' : 'Aceptar desde mi aporte'}
            accessibilityState={{ disabled: Boolean(match.acceptedResourceAt) || !canRepresentResource || closed }}
            disabled={Boolean(match.acceptedResourceAt) || !canRepresentResource || closed}
            onPress={() => accept('resource')}
            className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: match.acceptedResourceAt ? '#34D39918' : '#FFFFFF0A' }}>
              <Ionicons name={match.acceptedResourceAt ? 'checkmark-circle' : 'ellipse-outline'} size={19} color={match.acceptedResourceAt ? '#6EE7B7' : '#64748B'} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-xs text-slate-200">{match.acceptedResourceAt ? 'Quien aporta aceptó' : canRepresentResource ? 'Aceptar desde mi aporte' : 'Esperando a quien aporta'}</Text>
              <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">Nadie acepta en nombre de la otra parte</Text>
            </View>
          </Pressable97>
        </View>

        {bothAccepted && !closed && (
          <Animated.View entering={fadeUp} className="mt-5">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={primary}
              accessibilityState={{ disabled: primaryDisabled }}
              disabled={primaryDisabled}
              onPress={advance}
              className="flex-row items-center justify-center gap-2 rounded-full px-5 py-4"
              style={{ backgroundColor: primaryDisabled ? '#334155' : '#7D5BDE' }}
            >
              <Ionicons name={confirmed ? 'checkmark-circle' : 'arrow-forward'} size={17} color="#FFFFFF" />
              <Text className="font-sans-semibold text-xs text-white">{primary}</Text>
            </Pressable97>
          </Animated.View>
        )}

        <Text className="mt-9 font-sans text-[10px] uppercase tracking-[3px] text-slate-500">Camino del puente</Text>
        <GlassCard className="mt-3 p-5">
          <Stage icon="sparkles-outline" title="Propuesta explicable" description="El motor muestra razones; ninguna afinidad obliga." state="done" />
          <Stage icon="people-outline" title="Acuerdo de ambos lados" description="Dos consentimientos distintos abren la coordinación." state={acceptedState} />
          <Stage icon="construct-outline" title="Coordinación segura" description="Se acuerdan alcance, momento y responsabilidades mínimas." state={coordinationState} />
          <Stage icon="arrow-redo-outline" title="Entrega declarada" description="Sólo quien aporta puede marcar este momento." state={deliveryState} />
          <Stage icon="shield-checkmark-outline" title="Recepción confirmada" description="Sólo quien recibe confirma que el resultado ocurrió." state={confirmationState} last />
        </GlassCard>

        {confirmed && (
          <Animated.View entering={fadeUp} className="mt-4 overflow-hidden rounded-[24px] border border-emerald-300/20 bg-emerald-300/[0.07] p-5">
            <Text className="font-sans text-[10px] uppercase tracking-[2px] text-emerald-200">Cuidar lo que sigue</Text>
            <Text className="mt-3 font-serif text-2xl text-plata">El impacto también tiene memoria.</Text>
            <View className="mt-4 gap-3">
              <View className="flex-row gap-3"><Text className="font-mono text-xs text-emerald-300">DÍA 7</Text><Text className="flex-1 font-sans text-[11px] leading-[18px] text-slate-400">¿La solución se sostuvo? ¿Quedó algo urgente por resolver?</Text></View>
              <View className="flex-row gap-3"><Text className="font-mono text-xs text-emerald-300">DÍA 30</Text><Text className="flex-1 font-sans text-[11px] leading-[18px] text-slate-400">¿Aumentó la autonomía o hace falta reabrir la necesidad con otro enfoque?</Text></View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={staggerDelay(4)} className="mt-5 overflow-hidden rounded-[24px] border border-sky-300/15 bg-sky-300/[0.05] p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-sky-300/10"><Ionicons name="shield-half-outline" size={18} color="#7DD3FC" /></View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-xs text-sky-100">Frontera de contacto segura</Text>
              <Text className="mt-1 font-sans text-[10px] leading-[17px] text-slate-500">Esta sala nunca muestra teléfonos, correos, coordenadas exactas ni identidades técnicas.</Text>
            </View>
          </View>
          <Text className="mt-4 font-sans text-[11px] leading-5 text-slate-400">El permiso de contacto indica voluntad, no revela datos. Para coordinar, usá un círculo moderado o un canal de confianza ya acordado; compartí sólo lo mínimo necesario.</Text>
        </Animated.View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Ver guía ante un problema de seguridad"
          accessibilityState={{ expanded: showSafety }}
          onPress={() => setShowSafety((value) => !value)}
          className="mt-4 flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <View className="flex-1 flex-row items-center gap-3">
            <Ionicons name="warning-outline" size={18} color="#FDA4AF" />
            <Text className="font-sans-medium text-xs text-slate-300">Retirarse o pedir acompañamiento</Text>
          </View>
          <Ionicons name={showSafety ? 'chevron-up' : 'chevron-down'} size={17} color="#64748B" />
        </Pressable97>
        {showSafety && (
          <Animated.View entering={fadeUp} className="mt-2 rounded-2xl border border-rose-300/15 bg-rose-300/[0.05] p-5">
            <Text className="font-sans text-[11px] leading-5 text-slate-400">Si aparece presión, discriminación, intercambio de dinero no acordado o un riesgo físico, no avances. Podés retirarte sin justificarte. Conservá evidencia fuera de esta sala y pedí acompañamiento a un círculo de confianza o a servicios locales si hay peligro inmediato.</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {(canRepresentNeed || canRepresentResource) && !closed && !confirmed && (
                <Pressable97 accessibilityRole="button" accessibilityLabel="Retirar mi participación" onPress={withdraw} className="rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2.5">
                  <Text className="font-sans-medium text-xs text-rose-200">Retirar mi participación</Text>
                </Pressable97>
              )}
              <Pressable97 accessibilityRole="button" accessibilityLabel="Buscar un círculo de confianza" onPress={() => router.push('/circulos')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
                <Text className="font-sans-medium text-xs text-slate-300">Buscar un círculo seguro</Text>
              </Pressable97>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
