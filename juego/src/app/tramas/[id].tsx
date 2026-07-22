/**
 * Sala del puente (Conectar): consentimiento bilateral entre quien necesita
 * y quien aporta. Cada lado acepta por separado — nadie firma en nombre del
 * otro (civic/repo `acceptMatchSide`, `transitionMatch`, `transitionAction`).
 *
 * Registro papel del sistema Papel y Tinta (spec §8): pantalla profunda,
 * título sin entintar. Que ambos lados acepten, o que se confirme el
 * impacto, no son entradas del catálogo cerrado de sellos (spec §5): esos
 * momentos quedan como nota de borde plana, nunca como un Sello inventado.
 */

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  FilaIndice,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
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
import { ROJO_SELLO, TINTA, TINTA_30, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

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

/** Estado del puente → color (spec: pendiente/propuesto → violeta, confirmado
 * → verde, declinado → sello, retirado/cerrado → tinta-50). */
const MATCH_STATUS_COLOR: Record<string, string> = {
  Retirado: TINTA_50,
  'No acordado': ROJO_SELLO,
  'Impacto confirmado': VERDE,
  'Entrega declarada': VIOLETA,
  'En coordinación': VIOLETA,
  'Acuerdo bilateral': VIOLETA,
  'Propuesta abierta': VIOLETA,
};

const matchStatusColor = (match: CivicMatchRow, action: CivicActionRow | null): string =>
  MATCH_STATUS_COLOR[statusLabel(match, action)] ?? TINTA_50;

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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!loaded) return <View className="flex-1 bg-papel" />;

  if (!snapshot) {
    return (
      <View className="flex-1 bg-papel">
        <GranoPapel />
        <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <PapelCard className="w-full p-6">
            <TituloAnton tamano="md">Este puente ya no está disponible.</TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              Puede haberse retirado o todavía no haber llegado a este dispositivo.
            </Text>
            <View className="mt-5 items-start">
              <BotonTinta etiqueta="Ver otros puentes" variante="fantasma" onPress={() => router.replace('/conectar')} />
            </View>
          </PapelCard>
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
          <Kicker>un puente, dos consentimientos</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Sala del puente</TituloAnton>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 48 }}>
        <Animated.View entering={fadeUp} className="mt-1">
          <PapelCard className="p-6">
            <View className="flex-row items-center justify-between gap-3">
              <ChipTipo etiqueta={statusLabel(match, action)} activo color={matchStatusColor(match, action)} />
              <Text className="font-space text-[11px] text-tinta-50">AFINIDAD {match.score}%</Text>
            </View>
            <TituloAnton tamano="lg" className="mt-5">Un acuerdo, no una asignación.</TituloAnton>
            <Text className="mt-3 max-w-[390px] font-archivo text-sm leading-6 text-tinta-75">La afinidad explica por qué apareció el puente. Cada paso exige la decisión de la persona que representa ese lado.</Text>
          </PapelCard>
        </Animated.View>

        {notice && (
          <Animated.View entering={fadeUp} className="mt-4 border border-ambar px-4 py-3">
            <Text className="font-archivo text-[11px] leading-5 text-tinta-90">{notice}</Text>
          </Animated.View>
        )}

        <Animated.View entering={staggerDelay(1)} className="mt-6">
          <PapelCard className="p-0">
            <View className="p-5">
              <Kicker tono="neutro">Se necesita</Kicker>
              <Text className="mt-4 font-archivo-bold text-2xl leading-8 text-tinta">{safeText(need.title, 'Necesidad comunitaria')}</Text>
              <Text className="mt-1 font-archivo text-xs text-tinta-50">{civicCategoryLabel(need.category)}</Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <ChipTipo etiqueta={formatAmount(need.quantity, need.unit)} />
                <ChipTipo etiqueta={`Urgencia ${need.urgency}/5`} />
                <ChipTipo etiqueta={shortDate(need.expiresAt)} />
              </View>
            </View>
            <View className="mx-5 h-px bg-bordeSuave" />
            <View className="p-5">
              <Kicker tono="neutro">Se puede aportar</Kicker>
              <Text className="mt-4 font-archivo-bold text-2xl leading-8 text-tinta">{safeText(resource.title, 'Recurso disponible')}</Text>
              <Text className="mt-1 font-archivo text-xs text-tinta-50">{civicCategoryLabel(resource.category)}</Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <ChipTipo etiqueta={formatAmount(resource.quantity, resource.unit)} />
                <ChipTipo etiqueta={parseAvailability(resource.availabilityJson)} />
                <ChipTipo etiqueta={`Radio ${resource.radiusKm} km`} />
              </View>
            </View>
          </PapelCard>
        </Animated.View>

        <Animated.View entering={staggerDelay(2)} className="mt-4">
          <PapelCard className="p-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Kicker tono="neutro">Por qué se propuso</Kicker>
                <TituloAnton tamano="md" className="mt-2">El puntaje se puede discutir.</TituloAnton>
              </View>
              <Text className="font-space text-3xl text-tinta">{match.score}</Text>
            </View>
            <View className="mt-4 gap-2">
              {(reasons.length ? reasons : ['La categoría y la disponibilidad pueden ser compatibles']).map((reason) => (
                <Text key={reason} className="font-archivo text-[11px] leading-[18px] text-tinta-75">— {safeText(reason, 'Criterio compatible')}</Text>
              ))}
            </View>
            <Text className="mt-4 border-t border-bordeSuave pt-4 font-archivo text-[10px] leading-[17px] text-tinta-30">No mide el valor de ninguna persona ni toma decisiones. Usa categoría, cantidad, cercanía aproximada, urgencia y confianza declarada.</Text>
          </PapelCard>
        </Animated.View>

        <Kicker tono="neutro" className="mt-8">Consentimiento bilateral</Kicker>
        <View className="mt-3 gap-3">
          <ConsentCard
            accepted={Boolean(match.acceptedNeedAt)}
            interactive={!match.acceptedNeedAt && canRepresentNeed && !closed}
            title={match.acceptedNeedAt ? 'Quien necesita aceptó' : canRepresentNeed ? 'Aceptar desde mi necesidad' : 'Esperando a quien necesita'}
            detail="Consentimiento independiente · puede retirarse"
            accessibilityLabel={match.acceptedNeedAt ? 'Necesidad aceptada' : 'Aceptar desde mi necesidad'}
            onPress={() => accept('need')}
          />
          <ConsentCard
            accepted={Boolean(match.acceptedResourceAt)}
            interactive={!match.acceptedResourceAt && canRepresentResource && !closed}
            title={match.acceptedResourceAt ? 'Quien aporta aceptó' : canRepresentResource ? 'Aceptar desde mi aporte' : 'Esperando a quien aporta'}
            detail="Nadie acepta en nombre de la otra parte"
            accessibilityLabel={match.acceptedResourceAt ? 'Aporte aceptado' : 'Aceptar desde mi aporte'}
            onPress={() => accept('resource')}
          />
        </View>

        {bothAccepted && !closed && (
          <Animated.View entering={fadeUp} className="mt-5">
            <BotonTinta
              etiqueta={primary}
              accessibilityLabel={primary}
              disabled={primaryDisabled}
              onPress={advance}
            />
          </Animated.View>
        )}

        <Kicker tono="neutro" className="mt-9">Camino del puente</Kicker>
        <PapelCard className="mt-3 p-5">
          <StageRow numero="01" title="Propuesta explicable" description="El motor muestra razones; ninguna afinidad obliga." state="done" />
          <StageRow numero="02" title="Acuerdo de ambos lados" description="Dos consentimientos distintos abren la coordinación." state={acceptedState} />
          <StageRow numero="03" title="Coordinación segura" description="Se acuerdan alcance, momento y responsabilidades mínimas." state={coordinationState} />
          <StageRow numero="04" title="Entrega declarada" description="Sólo quien aporta puede marcar este momento." state={deliveryState} />
          <StageRow numero="05" title="Recepción confirmada" description="Sólo quien recibe confirma que el resultado ocurrió." state={confirmationState} />
        </PapelCard>

        {confirmed && (
          <Animated.View entering={fadeUp} className="mt-4 border border-verde p-5">
            <Kicker tono="neutro">Cuidar lo que sigue</Kicker>
            <TituloAnton tamano="md" className="mt-3">El impacto también tiene memoria.</TituloAnton>
            <View className="mt-4 gap-3">
              <View className="flex-row gap-3"><Text className="font-space text-xs text-tinta-50">DÍA 7</Text><Text className="flex-1 font-archivo text-[11px] leading-[18px] text-tinta-75">¿La solución se sostuvo? ¿Quedó algo urgente por resolver?</Text></View>
              <View className="flex-row gap-3"><Text className="font-space text-xs text-tinta-50">DÍA 30</Text><Text className="flex-1 font-archivo text-[11px] leading-[18px] text-tinta-75">¿Aumentó la autonomía o hace falta reabrir la necesidad con otro enfoque?</Text></View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={staggerDelay(4)} className="mt-5 border border-cian p-5">
          <Text className="font-archivo-bold text-xs text-tinta">Frontera de contacto segura</Text>
          <Text className="mt-1 font-archivo text-[10px] leading-[17px] text-tinta-50">Esta sala nunca muestra teléfonos, correos, coordenadas exactas ni identidades técnicas.</Text>
          <Text className="mt-4 font-archivo text-[11px] leading-5 text-tinta-75">El permiso de contacto indica voluntad, no revela datos. Para coordinar, usá un círculo moderado o un canal de confianza ya acordado; compartí sólo lo mínimo necesario.</Text>
        </Animated.View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Ver guía ante un problema de seguridad"
          accessibilityState={{ expanded: showSafety }}
          onPress={() => setShowSafety((value) => !value)}
          className="mt-4 flex-row items-center justify-between border border-tinta bg-papel-crudo p-4"
        >
          <Text className="flex-1 font-archivo-bold text-xs text-tinta">Retirarse o pedir acompañamiento</Text>
          <Text className="font-space text-lg text-tinta">{showSafety ? '−' : '+'}</Text>
        </Pressable97>
        {showSafety && (
          <Animated.View entering={fadeUp} className="mt-2 border border-sello p-5">
            <Text className="font-archivo text-[11px] leading-5 text-tinta-75">Si aparece presión, discriminación, intercambio de dinero no acordado o un riesgo físico, no avances. Podés retirarte sin justificarte. Conservá evidencia fuera de esta sala y pedí acompañamiento a un círculo de confianza o a servicios locales si hay peligro inmediato.</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {(canRepresentNeed || canRepresentResource) && !closed && !confirmed && (
                <BotonTinta etiqueta="Retirar mi participación" variante="fantasma" tamano="compacto" onPress={withdraw} />
              )}
              <BotonTinta etiqueta="Buscar un círculo seguro" variante="fantasma" tamano="compacto" onPress={() => router.push('/circulos')} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function ConsentCard({
  accepted,
  interactive,
  title,
  detail,
  onPress,
  accessibilityLabel,
}: {
  accepted: boolean;
  interactive: boolean;
  title: string;
  detail: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const borderColor = accepted ? VERDE : interactive ? TINTA : TINTA_30;
  const textColor = interactive || accepted ? TINTA : TINTA_30;
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !interactive, selected: accepted }}
      disabled={!interactive}
      onPress={onPress}
      className="min-h-[72px] justify-center bg-papel-crudo p-4"
      style={{ borderWidth: accepted ? 2 : 1, borderColor }}
    >
      <Text className="font-archivo-bold text-xs" style={{ color: textColor }}>{title}</Text>
      <Text className="mt-1 font-archivo text-[11px] leading-4 text-tinta-50">{detail}</Text>
    </Pressable97>
  );
}

function StageRow({
  numero,
  title,
  description,
  state,
}: {
  numero: string;
  title: string;
  description: string;
  state: StageState;
}) {
  const color = state === 'done' ? VERDE : state === 'active' ? VIOLETA : TINTA_30;
  return (
    <FilaIndice numero={numero} glifo="">
      <Text className="font-archivo-bold text-xs" style={{ color }}>{title}</Text>
      <Text className="mt-1 font-archivo text-[11px] leading-[18px] text-tinta-50">{description}</Text>
    </FilaIndice>
  );
}
