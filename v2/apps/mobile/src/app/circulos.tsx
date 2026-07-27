import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CustodyExecutionCard,
  type CustodyExecutionActionDraft,
} from '@/components/civic/CustodyExecutionCard';
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
import {
  createCircleInvite,
  joinCircle,
  loadCampaignProgress,
  loadCircleDetail,
  loadCircles,
  loadCommunityNotifications,
  loadCustodyGrantInbox,
  loadNetworkCampaigns,
  loadPendingCustodyGrantResponses,
  markAllCommunityNotificationsRead,
  redeemCircleInvite,
  reportCircle,
  respondToCustodyGrant,
  revokeCustodyInboxGrant,
  type CampaignProgress,
  type CircleDetail,
  type CircleSummary,
  type CommunityNotification,
  type CustodyGrantLocation,
  type CustodyInboxGrant,
  type CustodyNeedUnit,
  type NetworkCampaign,
  type PendingCustodyGrantResponse,
} from '@/civic/community-api';
import {
  getCommunitySession,
  loginCommunity,
  logoutCommunity,
  registerCommunity,
  type CommunitySession,
} from '@/civic/community-auth';
import { CIVIC_API_URL } from '@/civic/config';
import { countPendingNeedGrantRemoteRevocations } from '@/civic/need-access-grant-delivery';
import {
  custodyCoordinationErrorMessage,
  loadCustodyCoordinationCoordinatorInbox,
  proposeCustodyCoordination,
  type CustodyCoordinationProposal,
} from '@/civic/custody-coordination';
import {
  custodyExecutionErrorMessage,
  loadCustodyExecutionCoordinatorInbox,
  loadCustodyExecutionIntentInventory,
  retryCustodyExecutionEvent,
  submitCustodyExecutionEvent,
  type CustodyExecutionEventCommand,
  type CustodyExecutionIntentIncident,
  type CustodyExecutionMutationReceipt,
  type CustodyExecutionView,
  type PendingCustodyExecutionIntent,
} from '@/civic/custody-execution';
import { civicCategoryLabel } from '@/civic/labels';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { AMBAR_PT, ROJO_SELLO, TINTA, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

const KIND_LABEL: Record<CircleSummary['kind'], string> = {
  territorial: 'Territorio',
  tematica: 'Causa común',
  celula: 'Célula de confianza',
};

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

const CUSTODY_UNIT_LABEL: Record<CustodyNeedUnit, string> = {
  people: 'personas',
  meals: 'comidas',
  units: 'unidades',
  hours: 'horas',
  kilograms: 'kg',
  liters: 'litros',
  trips: 'viajes',
  days: 'días',
  beds: 'camas',
  kits: 'kits',
  other: 'otra unidad',
};

const CUSTODY_PRECISION_LABEL: Record<CustodyGrantLocation['precision'], string> = {
  '500m': 'radio de 500 m',
  neighborhood: 'escala de barrio',
  city: 'escala de ciudad',
};

const custodyExpiryLabel = (value: string): string => new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

const custodyQuantityLabel = (grant: CustodyInboxGrant): string => {
  const { quantity, unit } = grant.payload;
  if (quantity == null) return 'Cantidad no declarada';
  const formatted = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(quantity);
  return unit ? `${formatted} ${CUSTODY_UNIT_LABEL[unit]}` : `${formatted} · sin unidad declarada`;
};

const custodyZoneLabel = (location: CustodyGrantLocation | null): string => {
  if (!location) return 'Sin zona compartida';
  const decimals = location.precision === '500m' ? 3 : location.precision === 'neighborhood' ? 2 : 1;
  return `Centro de zona segura ${location.lat.toFixed(decimals)}, ${location.lng.toFixed(decimals)} · ${CUSTODY_PRECISION_LABEL[location.precision]}`;
};

const coordinationCapacityLabel = (proposal: CustodyCoordinationProposal): string => {
  if (proposal.capacity.quantity == null || proposal.capacity.unit == null) {
    return 'capacidad sin cantidad declarada';
  }
  return `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(proposal.capacity.quantity)} ${CUSTODY_UNIT_LABEL[proposal.capacity.unit]}`;
};

/**
 * Color semántico por estado (spec: propuesto/pendiente → violeta,
 * aceptado → verde, declinado → sello, vencido → ámbar, cerrado → tinta-50).
 * Sin ícono: la tipografía y el borde ya cargan el significado.
 */
const coordinationCopy = (proposal: CustodyCoordinationProposal): {
  title: string;
  detail: string;
  color: string;
} => {
  if (proposal.state === 'proposed') return {
    title: 'Propuesta privada enviada',
    detail: 'Otra cuenta coordinadora expresó que quiere coordinar. Falta la decisión separada de la cuenta grantora. No reserva recursos ni prueba contacto, entrega o resolución.',
    color: VIOLETA,
  };
  if (proposal.state === 'accepted') return {
    title: 'Acuerdo para coordinar',
    detail: 'Ambas partes aceptaron abrir una coordinación privada. El acuerdo no reserva recursos ni prueba contacto, entrega o resolución.',
    color: VERDE,
  };
  if (proposal.state === 'declined') return {
    title: 'No hubo acuerdo de coordinación',
    detail: 'La propuesta no fue aceptada. Esto no describe un rechazo a la persona ni dice nada sobre la validez o urgencia de su necesidad.',
    color: ROJO_SELLO,
  };
  if (proposal.state === 'expired') return {
    title: 'Propuesta vencida',
    detail: 'Terminó el plazo sin una coordinación activa. No inferimos falta de necesidad, rechazo, contacto, entrega ni resolución.',
    color: AMBAR_PT,
  };
  return {
    title: 'Coordinación cerrada',
    detail: 'El permiso dejó de estar operativo. Este cierre no demuestra contacto, entrega ni resolución de la necesidad.',
    color: TINTA_50,
  };
};

const executionReceiptMessage = (receipt: CustodyExecutionMutationReceipt): string => {
  if (receipt.status === 'rejected') {
    return receipt.reason === 'version_changed'
      ? 'La ruta avanzó en otra pestaña o dispositivo. El comando no se aplicó y mostramos el estado autoritativo para que decidas de nuevo.'
      : 'La red confirmó que ese paso no correspondía al estado actual. No se aplicó ni se reinterpretó como otro hito.';
  }
  const type = receipt.recordedEvent.type;
  if (type === 'reserve') return 'Reserva operativa registrada. Todavía no prueba stock físico, contacto ni entrega.';
  if (type === 'coordinator_ready') return 'Disposición de coordinación registrada sin compartir datos de contacto.';
  if (type === 'start_delivery') return 'Movimiento iniciado. La recepción seguirá dependiendo de una constancia separada.';
  if (type === 'report_delivery') return 'Entrega declarada por coordinación. Falta la confirmación independiente de la persona.';
  if (type === 'withdraw') return 'Retiro registrado. Corta nuevas acciones, pero no borra lo ya ocurrido.';
  return 'Constancia privada registrada y verificada.';
};

const executionEventLabel = (type: PendingCustodyExecutionIntent['type']): string => ({
  reserve: 'reserva operativa',
  grantor_ready: 'disposición de la persona',
  coordinator_ready: 'disposición de coordinación',
  start_delivery: 'inicio de movimiento',
  report_delivery: 'entrega declarada',
  confirm_receipt: 'recepción',
  record_follow_up: 'seguimiento',
  withdraw: 'retiro',
})[type];

const parseCustodySupportQuantity = (
  rawValue: string,
  maximum: number | null,
): number | undefined | null => {
  const normalized = rawValue.trim().replace(',', '.');
  if (!normalized) return undefined;
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const quantity = Number(normalized);
  if (!Number.isFinite(quantity) || quantity <= 0 || maximum == null || quantity > maximum) return null;
  return quantity;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
}) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View className="mt-4">
      <Kicker tono="neutro">{label}</Kicker>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        placeholder={placeholder}
        placeholderTextColor={TINTA_50}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
        style={estiloInput(enfocado)}
      />
    </View>
  );
}

export default function Circulos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const privateRefreshEpoch = useRef(0);
  const executionActionEpoch = useRef(0);
  const executionReadEpoch = useRef(0);
  const executionInboxRefreshPromise = useRef<Promise<void> | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => undefined);
  const [session, setSession] = useState<CommunitySession | null>(null);
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [campaigns, setCampaigns] = useState<NetworkCampaign[]>([]);
  const [progress, setProgress] = useState<Record<number, CampaignProgress>>({});
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [custodyGrants, setCustodyGrants] = useState<CustodyInboxGrant[]>([]);
  const [custodyInboxError, setCustodyInboxError] = useState<string | null>(null);
  const [custodyTruncated, setCustodyTruncated] = useState(false);
  const [custodyConfirmId, setCustodyConfirmId] = useState<string | null>(null);
  const [custodyBusyId, setCustodyBusyId] = useState<string | null>(null);
  const [custodyResponseConfirm, setCustodyResponseConfirm] = useState<{
    grantId: string;
    disposition: 'assessing' | 'support_available';
  } | null>(null);
  const [custodyResponseErrors, setCustodyResponseErrors] = useState<Record<string, string>>({});
  const [custodySupportInputs, setCustodySupportInputs] = useState<Record<string, string>>({});
  const [custodyPendingResponses, setCustodyPendingResponses] = useState<Record<string, PendingCustodyGrantResponse>>({});
  const [coordinationProposals, setCoordinationProposals] = useState<Record<string, CustodyCoordinationProposal>>({});
  const [coordinationInboxError, setCoordinationInboxError] = useState<string | null>(null);
  const [coordinationTruncated, setCoordinationTruncated] = useState(false);
  const [coordinationConfirmId, setCoordinationConfirmId] = useState<string | null>(null);
  const [coordinationBusyId, setCoordinationBusyId] = useState<string | null>(null);
  const [coordinationErrors, setCoordinationErrors] = useState<Record<string, string>>({});
  const [custodyExecutions, setCustodyExecutions] = useState<Record<string, CustodyExecutionView>>({});
  const [executionObservedAt, setExecutionObservedAt] = useState<Record<string, string>>({});
  const [executionInboxError, setExecutionInboxError] = useState<string | null>(null);
  const [executionTruncated, setExecutionTruncated] = useState(false);
  const [executionBusyId, setExecutionBusyId] = useState<string | null>(null);
  const [executionErrors, setExecutionErrors] = useState<Record<string, string>>({});
  const [pendingExecutionIntents, setPendingExecutionIntents] = useState<Record<string, PendingCustodyExecutionIntent>>({});
  const [executionIntentIncidents, setExecutionIntentIncidents] = useState<CustodyExecutionIntentIncident[]>([]);
  const [lockedExecutionProposalIds, setLockedExecutionProposalIds] = useState<string[]>([]);
  const [logoutConfirming, setLogoutConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [auth, setAuth] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CircleDetail | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
  // Foco visible de los inputs canónicos (spec §3.5/§10) — uno por campo;
  // la cantidad de custodia es un input por permiso, así que su foco se
  // trackea por grantId en vez de un booleano único.
  const [custodySupportFocusId, setCustodySupportFocusId] = useState<string | null>(null);
  const [enfocadoReporte, setEnfocadoReporte] = useState(false);
  const [enfocadoInvite, setEnfocadoInvite] = useState(false);

  const clearAccountBoundUi = useCallback(() => {
    executionActionEpoch.current += 1;
    executionReadEpoch.current += 1;
    executionInboxRefreshPromise.current = null;
    setSession(null);
    setCircles([]);
    setCampaigns([]);
    setProgress({});
    setNotifications([]);
    setCustodyGrants([]);
    setCustodyInboxError(null);
    setCustodyTruncated(false);
    setCustodyConfirmId(null);
    setCustodyResponseConfirm(null);
    setCustodyResponseErrors({});
    setCustodySupportInputs({});
    setCustodyPendingResponses({});
    setCoordinationProposals({});
    setCoordinationInboxError(null);
    setCoordinationTruncated(false);
    setCoordinationConfirmId(null);
    setCoordinationErrors({});
    setCustodyExecutions({});
    setExecutionObservedAt({});
    setExecutionInboxError(null);
    setExecutionTruncated(false);
    setExecutionBusyId(null);
    setExecutionErrors({});
    setPendingExecutionIntents({});
    setExecutionIntentIncidents([]);
    setLockedExecutionProposalIds([]);
    setLogoutConfirming(false);
    setExpandedId(null);
    setDetail(null);
    setGeneratedInvite(null);
    setInviteCode('');
    setReportReason('');
  }, []);

  const refresh = useCallback(async () => {
    const refreshEpoch = ++privateRefreshEpoch.current;
    // El Stack conserva pantallas. Vaciar antes del primer await evita que una
    // cuenta recién cambiada vea durante un frame la bandeja o capacidades de
    // la cuenta anterior.
    clearAccountBoundUi();
    setLoading(true);
    try {
      const currentSession = await getCommunitySession();
      if (privateRefreshEpoch.current !== refreshEpoch) return;
      setSession(currentSession);
      const pendingResponses = currentSession
        ? loadPendingCustodyGrantResponses(currentSession.user.id)
        : [];
      const executionInventory = currentSession
        ? loadCustodyExecutionIntentInventory(currentSession.user.id)
        : { intents: [], incidents: [], lockedProposalIds: [] };
      setCustodyPendingResponses(Object.fromEntries(
        pendingResponses.map((intent) => [intent.grant.grantId, intent]),
      ));
      setCustodySupportInputs(Object.fromEntries(pendingResponses
          .filter((intent) => intent.disposition === 'support_available' && intent.quantity != null)
          .map((intent) => [intent.grant.grantId, String(intent.quantity)])));
      setPendingExecutionIntents(Object.fromEntries(
        executionInventory.intents.map((intent) => [intent.proposalId, intent]),
      ));
      setExecutionIntentIncidents(executionInventory.incidents);
      setLockedExecutionProposalIds(executionInventory.lockedProposalIds);
      if (!CIVIC_API_URL) {
        setCustodyGrants([]);
        setCustodyInboxError(null);
        setCustodyTruncated(false);
        setCoordinationProposals({});
        setCoordinationInboxError(null);
        setCoordinationTruncated(false);
        setCustodyExecutions({});
        setExecutionObservedAt({});
        setExecutionInboxError(null);
        setExecutionTruncated(false);
        return;
      }
      const custodyRequest = currentSession
        ? loadCustodyGrantInbox(currentSession.user.id)
          .then(async (inbox) => {
            const [coordinationResult, executionResult] = await Promise.all([
              loadCustodyCoordinationCoordinatorInbox(
                inbox.grants,
                currentSession.user.id,
              ).then((coordination) => ({ coordination, coordinationError: null as string | null }))
                .catch(() => ({
                  coordination: null,
                  coordinationError: 'No pudimos verificar las propuestas privadas. Esto no significa que no existan.',
                })),
              loadCustodyExecutionCoordinatorInbox(currentSession.user.id)
                .then((execution) => ({ execution, executionError: null as string | null }))
                .catch(() => ({
                  execution: null,
                  executionError: 'No pudimos verificar las rutas de apoyo. Esto no significa que no existan avances.',
                })),
            ]);
            return { inbox, error: null, ...coordinationResult, ...executionResult };
          })
          .catch(() => ({
            inbox: null,
            error: 'No pudimos verificar la bandeja privada. Esto no significa que esté vacía.',
            coordination: null,
            coordinationError: null,
            execution: null,
            executionError: null,
          }))
        : Promise.resolve({
          inbox: null,
          error: null,
          coordination: null,
          coordinationError: null,
          execution: null,
          executionError: null,
        });
      const [circleRows, campaignRows, notificationRows, custodyResult] = await Promise.all([
        loadCircles(currentSession?.user.id),
        loadNetworkCampaigns(),
        currentSession ? loadCommunityNotifications(currentSession.user.id).catch(() => []) : Promise.resolve([]),
        custodyRequest,
      ]);
      const completionSession = await getCommunitySession();
      if (privateRefreshEpoch.current !== refreshEpoch) return;
      if ((completionSession?.user.id ?? null) !== (currentSession?.user.id ?? null)) {
        clearAccountBoundUi();
        setSession(completionSession);
        setMessage('La cuenta activa cambió durante la actualización. La información privada anterior fue retirada.');
        return;
      }
      // Releer al final evita que un refresh iniciado antes de recuperar una
      // constancia vuelva a insertar en React una intención que SQLite ya borró.
      const verifiedPendingResponses = currentSession
        ? loadPendingCustodyGrantResponses(currentSession.user.id)
        : [];
      const verifiedExecutionInventory = currentSession
        ? loadCustodyExecutionIntentInventory(currentSession.user.id)
        : { intents: [], incidents: [], lockedProposalIds: [] };
      setCustodyPendingResponses(Object.fromEntries(
        verifiedPendingResponses.map((intent) => [intent.grant.grantId, intent]),
      ));
      setCustodySupportInputs(Object.fromEntries(verifiedPendingResponses
        .filter((intent) => intent.disposition === 'support_available' && intent.quantity != null)
        .map((intent) => [intent.grant.grantId, String(intent.quantity)])));
      setPendingExecutionIntents(Object.fromEntries(
        verifiedExecutionInventory.intents.map((intent) => [intent.proposalId, intent]),
      ));
      setExecutionIntentIncidents(verifiedExecutionInventory.incidents);
      setLockedExecutionProposalIds(verifiedExecutionInventory.lockedProposalIds);
      setCircles(circleRows);
      setCampaigns(campaignRows);
      setNotifications(notificationRows);
      setCustodyGrants(custodyResult.inbox?.grants ?? []);
      setCustodyInboxError(custodyResult.error);
      setCustodyTruncated(custodyResult.inbox?.truncated ?? false);
      setCoordinationProposals(Object.fromEntries(
        (custodyResult.coordination?.proposals ?? []).map((proposal) => [proposal.grantId, proposal]),
      ));
      setCoordinationInboxError(custodyResult.coordinationError);
      setCoordinationTruncated(custodyResult.coordination?.truncated ?? false);
      setCustodyExecutions(Object.fromEntries(
        (custodyResult.execution?.executions ?? []).map((execution) => [execution.proposalId, execution]),
      ));
      setExecutionObservedAt(Object.fromEntries(
        (custodyResult.execution?.executions ?? []).map((execution) => [
          execution.proposalId,
          custodyResult.execution!.refreshedAt,
        ]),
      ));
      setExecutionInboxError(custodyResult.executionError);
      setExecutionTruncated(custodyResult.execution?.nextCursor != null);
      if (!currentSession) {
        setCustodyConfirmId(null);
        setCustodyResponseConfirm(null);
        setCustodyResponseErrors({});
        setCustodySupportInputs({});
        setCustodyPendingResponses({});
        setCoordinationProposals({});
        setCoordinationConfirmId(null);
        setCoordinationErrors({});
        setCustodyExecutions({});
        setExecutionObservedAt({});
        setExecutionInboxError(null);
        setExecutionTruncated(false);
        setExecutionErrors({});
        setPendingExecutionIntents({});
        setExecutionIntentIncidents([]);
        setLockedExecutionProposalIds([]);
        setLogoutConfirming(false);
      }
      const progressRows = await Promise.all(campaignRows.slice(0, 8).map(async (campaign) => {
        try { return await loadCampaignProgress(campaign.id); } catch { return null; }
      }));
      const progressSession = await getCommunitySession();
      if (
        privateRefreshEpoch.current !== refreshEpoch
        || (progressSession?.user.id ?? null) !== (currentSession?.user.id ?? null)
      ) return;
      setProgress(Object.fromEntries(progressRows.filter((item): item is CampaignProgress => item != null).map((item) => [item.campaignId, item])));
    } catch (error) {
      if (privateRefreshEpoch.current === refreshEpoch) {
        setMessage(error instanceof Error ? error.message : 'La red territorial no respondió.');
      }
    } finally {
      if (privateRefreshEpoch.current === refreshEpoch) setLoading(false);
    }
  }, [clearAccountBoundUi]);

  refreshRef.current = refresh;

  useFocusEffect(useCallback(() => {
    void refresh();
    return () => {
      privateRefreshEpoch.current += 1;
      clearAccountBoundUi();
    };
  }, [clearAccountBoundUi, refresh]));

  // Mismo requisito que promete el placeholder: 8+ caracteres, mayúscula, número y símbolo.
  const registerIssue = (): string | null => {
    if (!auth.name.trim()) return 'Falta tu nombre para crear la cuenta.';
    if (!auth.email.trim()) return 'Falta tu email para crear la cuenta.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auth.email.trim())) return 'Ese email no parece válido. Revisalo antes de seguir.';
    if (
      auth.password.length < 8
      || !/\p{Lu}/u.test(auth.password)
      || !/\d/.test(auth.password)
      || !/[^\p{L}\p{N}]/u.test(auth.password)
    ) return 'La contraseña necesita 8+ caracteres, una mayúscula, un número y un símbolo.';
    if (auth.password !== auth.confirmPassword) return 'Las contraseñas no coinciden.';
    return null;
  };

  const connect = async () => {
    if (busy) return;
    if (authMode === 'register') {
      const issue = registerIssue();
      if (issue) {
        setMessage(issue);
        return;
      }
    }
    setBusy(true);
    setMessage(null);
    try {
      const next = authMode === 'login'
        ? await loginCommunity(auth.username, auth.password)
        : await registerCommunity(auth);
      setSession(next);
      setAuth((current) => ({ ...current, password: '', confirmPassword: '' }));
      setMessage('Cuenta vinculada. Tu bitácora privada sigue viviendo sólo en este teléfono.');
      haptic.celebrate();
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No pudimos vincular la cuenta.');
    } finally {
      setBusy(false);
    }
  };

  const openCircle = async (circle: CircleSummary) => {
    if (expandedId === circle.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(circle.id);
    setGeneratedInvite(null);
    setReportReason('');
    const expectedUserId = session?.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    try {
      const loaded = await loadCircleDetail(circle.id, expectedUserId);
      const completionSession = await getCommunitySession();
      if (
        privateRefreshEpoch.current !== actionEpoch
        || (completionSession?.user.id ?? undefined) !== expectedUserId
      ) return;
      setDetail(loaded);
    } catch {
      setDetail(null);
    }
  };

  const act = async (
    work: () => Promise<unknown>,
    success: string,
    refreshAfter = true,
  ) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await work();
      setMessage(success);
      haptic.send();
      if (refreshAfter) await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'La acción no pudo completarse.');
    } finally {
      setBusy(false);
    }
  };

  const withdrawCustodyGrant = async (grantId: string) => {
    if (custodyBusyId || coordinationBusyId || busy || !session) return;
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    setCustodyBusyId(grantId);
    setMessage(null);
    try {
      await revokeCustodyInboxGrant(grantId, expectedUserId);
      const completionSession = await getCommunitySession();
      if (completionSession?.user.id !== expectedUserId || privateRefreshEpoch.current !== actionEpoch) return;
      setCustodyGrants((current) => current.filter((grant) => grant.grantId !== grantId));
      setCustodyConfirmId(null);
      setMessage('El permiso fue retirado de la bandeja. Esto no declara resuelta ni cerrada la necesidad.');
      haptic.send();
      await refresh();
    } catch {
      setMessage('No pudimos confirmar el retiro. El pedido sigue visible hasta recibir una constancia válida de la red.');
    } finally {
      setCustodyBusyId(null);
    }
  };

  const clearCustodyResponseError = (grantId: string) => {
    setCustodyResponseErrors((current) => {
      if (!(grantId in current)) return current;
      const next = { ...current };
      delete next[grantId];
      return next;
    });
  };

  const updateCustodySupportInput = (grantId: string, value: string) => {
    if (custodyPendingResponses[grantId]) return;
    const numericValue = value.replace(/[^\d.,]/g, '');
    if ((custodySupportInputs[grantId] ?? '') === numericValue) return;
    setCustodySupportInputs((current) => ({ ...current, [grantId]: numericValue }));
    clearCustodyResponseError(grantId);
  };

  const prepareCustodySupportResponse = (grant: CustodyInboxGrant) => {
    const hasComparableQuantity = grant.payload.quantity != null && grant.payload.unit != null;
    const quantity = hasComparableQuantity
      ? parseCustodySupportQuantity(custodySupportInputs[grant.grantId] ?? '', grant.payload.quantity)
      : undefined;
    if (quantity === null) {
      setCustodyResponseErrors((current) => ({
        ...current,
        [grant.grantId]: `Ingresá una cantidad mayor que 0 y no mayor que ${custodyQuantityLabel(grant)}.`,
      }));
      return;
    }
    clearCustodyResponseError(grant.grantId);
    setCustodyConfirmId(null);
    setCustodyResponseConfirm({ grantId: grant.grantId, disposition: 'support_available' });
  };

  const submitCustodyResponse = async (
    grant: CustodyInboxGrant,
    disposition: 'assessing' | 'support_available',
  ) => {
    if (custodyBusyId || coordinationBusyId || busy) return;
    if (!session) return;
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    const pendingIntent = custodyPendingResponses[grant.grantId] ?? null;
    if (pendingIntent && pendingIntent.disposition !== disposition) {
      setCustodyResponseErrors((current) => ({
        ...current,
        [grant.grantId]: 'Hay una operación anterior sin constancia. Recuperala antes de registrar otra respuesta.',
      }));
      return;
    }
    const hasComparableQuantity = grant.payload.quantity != null && grant.payload.unit != null;
    const quantity = pendingIntent
      ? pendingIntent.quantity ?? undefined
      : disposition === 'support_available' && hasComparableQuantity
        ? parseCustodySupportQuantity(custodySupportInputs[grant.grantId] ?? '', grant.payload.quantity)
        : undefined;
    if (quantity === null) {
      setCustodyResponseErrors((current) => ({
        ...current,
        [grant.grantId]: `Ingresá una cantidad mayor que 0 y no mayor que ${custodyQuantityLabel(grant)}.`,
      }));
      setCustodyResponseConfirm(null);
      return;
    }

    setCustodyBusyId(grant.grantId);
    clearCustodyResponseError(grant.grantId);
    setMessage(null);
    try {
      const receipt = await respondToCustodyGrant(
        pendingIntent?.grant ?? grant,
        expectedUserId,
        disposition,
        quantity,
      );
      const completionSession = await getCommunitySession();
      if (completionSession?.user.id !== expectedUserId) return;
      if (privateRefreshEpoch.current !== actionEpoch) {
        // La constancia ya limpió la intención durable. Un refresh más nuevo
        // pudo haber leído la fila anterior; repetirlo después del recibo evita
        // dejar un botón de recuperación fantasma que crearía otra identidad.
        await refreshRef.current();
        return;
      }
      setCustodyGrants((current) => receipt.grant.state === 'active'
        ? current.map((item) => (
          item.grantId === receipt.grant.grantId
            ? { ...receipt.grant, state: 'active' as const }
            : item
        ))
        : current.filter((item) => item.grantId !== receipt.grant.grantId));
      setCustodyResponseConfirm(null);
      setCustodyPendingResponses((current) => {
        if (!(grant.grantId in current)) return current;
        const next = { ...current };
        delete next[grant.grantId];
        return next;
      });
      if (disposition === 'support_available') {
        setCustodySupportInputs((current) => ({ ...current, [grant.grantId]: '' }));
      }
      setMessage(receipt.grant.state !== 'active'
        ? 'Constancia recuperada: la respuesta ya estaba registrada, pero el permiso ya no está operativo. Esto no confirma contacto, entrega ni resolución.'
        : disposition === 'assessing'
          ? 'Constancia válida: el círculo tomó el pedido para evaluarlo. Esto no confirma capacidad, entrega ni resolución.'
          : 'Constancia válida: el círculo declaró capacidad disponible. Esto no confirma contacto, entrega ni resolución.');
      haptic.send();
    } catch (error) {
      try {
        const currentSession = await getCommunitySession();
        if (currentSession?.user.id !== expectedUserId) return;
        if (privateRefreshEpoch.current !== actionEpoch) {
          await refreshRef.current();
          return;
        }
        setCustodyPendingResponses(Object.fromEntries(
          loadPendingCustodyGrantResponses(expectedUserId)
            .map((intent) => [intent.grant.grantId, intent]),
        ));
      } catch {
        // El repositorio seguirá bloqueando un payload nuevo aunque una fila
        // local dañada no pueda mostrarse.
      }
      setCustodyResponseErrors((current) => ({
        ...current,
        [grant.grantId]: error instanceof Error
          ? error.message
          : 'No pudimos verificar la constancia. La respuesta visible no cambió.',
      }));
    } finally {
      setCustodyBusyId(null);
    }
  };

  const submitCoordinationProposal = async (grant: CustodyInboxGrant) => {
    if (coordinationBusyId || custodyBusyId || busy || !session) return;
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    setCoordinationBusyId(grant.grantId);
    setCoordinationErrors((current) => {
      const next = { ...current };
      delete next[grant.grantId];
      return next;
    });
    setMessage(null);
    try {
      const receipt = await proposeCustodyCoordination(grant, expectedUserId);
      const completionSession = await getCommunitySession();
      if (completionSession?.user.id !== expectedUserId || privateRefreshEpoch.current !== actionEpoch) return;
      setCoordinationProposals((current) => ({
        ...current,
        [grant.grantId]: receipt.proposal,
      }));
      setCoordinationConfirmId(null);
      setMessage(receipt.proposal.state === 'accepted'
        ? 'Constancia válida: ya existe un acuerdo privado para coordinar. No prueba contacto, reserva, entrega ni resolución.'
        : receipt.proposal.state === 'declined'
          ? 'Constancia válida: no hubo acuerdo de coordinación. Esto no es un juicio sobre la persona ni su necesidad.'
          : 'Constancia válida: otra cuenta coordinadora propuso coordinar. Falta la decisión separada de la cuenta grantora.');
      haptic.send();
    } catch (error) {
      setCoordinationErrors((current) => ({
        ...current,
        [grant.grantId]: custodyCoordinationErrorMessage(error),
      }));
    } finally {
      setCoordinationBusyId(null);
    }
  };

  const applyExecutionReceipt = (
    proposalId: string,
    receipt: CustodyExecutionMutationReceipt,
  ) => {
    setCustodyExecutions((current) => ({
      ...current,
      [proposalId]: receipt.execution,
    }));
    setExecutionObservedAt((current) => ({
      ...current,
      [proposalId]: receipt.refreshedAt,
    }));
    if (receipt.status === 'rejected') {
      setExecutionErrors((current) => ({
        ...current,
        [proposalId]: executionReceiptMessage(receipt),
      }));
    } else {
      setExecutionErrors((current) => {
        if (!(proposalId in current)) return current;
        const next = { ...current };
        delete next[proposalId];
        return next;
      });
      haptic.send();
    }
    setMessage(executionReceiptMessage(receipt));
  };

  const reloadExecutionIntentInventory = (userId: number) => {
    const inventory = loadCustodyExecutionIntentInventory(userId);
    setPendingExecutionIntents(Object.fromEntries(
      inventory.intents.map((intent) => [intent.proposalId, intent]),
    ));
    setExecutionIntentIncidents(inventory.incidents);
    setLockedExecutionProposalIds(inventory.lockedProposalIds);
  };

  const runExecutionAction = async (
    proposalId: string,
    action: CustodyExecutionActionDraft,
  ) => {
    if (privateBusy || !session) return;
    const execution = custodyExecutions[proposalId];
    if (!execution) return;
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    executionReadEpoch.current += 1;
    const executionToken = ++executionActionEpoch.current;
    setExecutionBusyId(proposalId);
    setMessage(null);
    setExecutionErrors((current) => {
      if (!(proposalId in current)) return current;
      const next = { ...current };
      delete next[proposalId];
      return next;
    });
    try {
      const command = {
        proposalId,
        ...action,
        snapshot: {
          execution,
          observedAt: executionObservedAt[proposalId] ?? execution.updatedAt,
        },
      } as CustodyExecutionEventCommand;
      const receipt = await submitCustodyExecutionEvent(command, expectedUserId);
      const completionSession = await getCommunitySession();
      if (
        completionSession?.user.id !== expectedUserId
        || privateRefreshEpoch.current !== actionEpoch
        || executionActionEpoch.current !== executionToken
      ) return;
      applyExecutionReceipt(proposalId, receipt);
      reloadExecutionIntentInventory(expectedUserId);
    } catch (error) {
      const completionSession = await getCommunitySession();
      if (
        completionSession?.user.id !== expectedUserId
        || privateRefreshEpoch.current !== actionEpoch
        || executionActionEpoch.current !== executionToken
      ) return;
      try {
        reloadExecutionIntentInventory(expectedUserId);
      } catch {
        // El repositorio sigue bloqueando otro comando aunque una fila dañada
        // no pueda representarse de forma segura en la interfaz.
      }
      setExecutionErrors((current) => ({
        ...current,
        [proposalId]: custodyExecutionErrorMessage(error),
      }));
    } finally {
      if (
        privateRefreshEpoch.current === actionEpoch
        && executionActionEpoch.current === executionToken
      ) setExecutionBusyId(null);
    }
  };

  const retryExecutionAction = async (proposalId: string) => {
    if (privateBusy || !session) return;
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    executionReadEpoch.current += 1;
    const executionToken = ++executionActionEpoch.current;
    setExecutionBusyId(proposalId);
    setMessage(null);
    try {
      const receipt = await retryCustodyExecutionEvent(proposalId, expectedUserId);
      const completionSession = await getCommunitySession();
      if (
        completionSession?.user.id !== expectedUserId
        || privateRefreshEpoch.current !== actionEpoch
        || executionActionEpoch.current !== executionToken
      ) return;
      applyExecutionReceipt(proposalId, receipt);
      reloadExecutionIntentInventory(expectedUserId);
    } catch (error) {
      const completionSession = await getCommunitySession();
      if (
        completionSession?.user.id !== expectedUserId
        || privateRefreshEpoch.current !== actionEpoch
        || executionActionEpoch.current !== executionToken
      ) return;
      try {
        reloadExecutionIntentInventory(expectedUserId);
      } catch {
        // El intent permanece bloqueado en el repositorio aunque no pueda
        // representarse de forma segura.
      }
      setExecutionErrors((current) => ({
        ...current,
        [proposalId]: custodyExecutionErrorMessage(error),
      }));
    } finally {
      if (
        privateRefreshEpoch.current === actionEpoch
        && executionActionEpoch.current === executionToken
      ) setExecutionBusyId(null);
    }
  };

  const refreshExecutionStatus = (proposalId: string): Promise<void> => {
    if (executionInboxRefreshPromise.current) return executionInboxRefreshPromise.current;
    if (privateBusy || !session) return Promise.resolve();
    const expectedUserId = session.user.id;
    const actionEpoch = privateRefreshEpoch.current;
    const readToken = ++executionReadEpoch.current;
    const request = (async () => {
      setExecutionBusyId(proposalId);
      setExecutionErrors((current) => {
        if (!(proposalId in current)) return current;
        const next = { ...current };
        delete next[proposalId];
        return next;
      });
      try {
        const inbox = await loadCustodyExecutionCoordinatorInbox(expectedUserId);
        const completionSession = await getCommunitySession();
        if (
          completionSession?.user.id !== expectedUserId
          || privateRefreshEpoch.current !== actionEpoch
          || executionReadEpoch.current !== readToken
        ) return;
        setExecutionInboxError(null);
        setCustodyExecutions((current) => ({
          ...current,
          ...Object.fromEntries(inbox.executions.map((item) => [item.proposalId, item])),
        }));
        setExecutionObservedAt((current) => ({
          ...current,
          ...Object.fromEntries(inbox.executions.map((item) => [item.proposalId, inbox.refreshedAt])),
        }));
        setExecutionTruncated(inbox.nextCursor != null);
        const refreshedExecution = inbox.executions.find((item) => item.proposalId === proposalId);
        if (refreshedExecution) return;
        setExecutionErrors((current) => ({
          ...current,
          [proposalId]: inbox.nextCursor
            ? 'La lectura alcanzó el corte seguro antes de encontrar esta ruta. Volvé a cargar la bandeja completa.'
            : 'Esta cuenta ya no tiene una ruta operativa verificable para esa coordinación.',
        }));
      } catch (error) {
        const completionSession = await getCommunitySession();
        if (
          completionSession?.user.id !== expectedUserId
          || privateRefreshEpoch.current !== actionEpoch
          || executionReadEpoch.current !== readToken
        ) return;
        const message = custodyExecutionErrorMessage(error);
        setExecutionInboxError(message);
        setExecutionErrors((current) => ({
          ...current,
          [proposalId]: message,
        }));
      } finally {
        if (
          privateRefreshEpoch.current === actionEpoch
          && executionReadEpoch.current === readToken
        ) setExecutionBusyId(null);
      }
    })();
    executionInboxRefreshPromise.current = request;
    void request.finally(() => {
      if (executionInboxRefreshPromise.current === request) {
        executionInboxRefreshPromise.current = null;
      }
    });
    return request;
  };

  const pendingRemoteRevocationCount = session
    ? countPendingNeedGrantRemoteRevocations(session.user.id)
    : 0;
  const pendingResponseIntentCount = Object.keys(custodyPendingResponses).length;
  const pendingExecutionIntentCount = Object.keys(pendingExecutionIntents).length
    + executionIntentIncidents.length;
  const privateBusy = busy
    || custodyBusyId != null
    || coordinationBusyId != null
    || executionBusyId != null;

  const disconnectAccount = async () => {
    if (!session) return;
    const expectedUserId = session.user.id;
    const recoveryNotes = [
      pendingRemoteRevocationCount > 0
        ? 'Los permisos remotos entregados siguen vigentes hasta revocarlos con esta misma cuenta.'
        : null,
      pendingResponseIntentCount > 0
        ? 'La respuesta pendiente conserva su comando exacto y proyección mínima para recuperar constancia.'
        : null,
      pendingExecutionIntentCount > 0
        ? 'La operación pendiente de la ruta de apoyo conserva su evento exacto para recuperar una aplicación o rechazo verificable.'
        : null,
    ].filter((note): note is string => note != null);
    await act(async () => {
      try {
        await logoutCommunity(expectedUserId);
      } catch (error) {
        const latestSession = await getCommunitySession();
        if (latestSession?.user.id !== expectedUserId) {
          clearAccountBoundUi();
          setSession(latestSession);
        }
        throw error;
      }
      clearAccountBoundUi();
    }, recoveryNotes.length > 0
      ? `Cuenta desvinculada. ${recoveryNotes.join(' ')} Volvé a entrar con la misma cuenta para gestionarlo.`
      : 'Cuenta desvinculada. Las proyecciones recibidas se retiraron; tus capturas propias siguen intactas.');
  };

  const orphanPendingResponses = Object.values(custodyPendingResponses)
    .filter((intent) => !custodyGrants.some((grant) => grant.grantId === intent.grant.grantId));
  const orphanPendingExecutions = Object.values(pendingExecutionIntents)
    .filter((intent) => custodyExecutions[intent.proposalId] == null);
  const lockedExecutionProposalIdSet = new Set(lockedExecutionProposalIds);
  const activeExecutionProposalIds = new Set(
    Object.values(coordinationProposals).map((proposal) => proposal.proposalId),
  );
  const historicalCustodyExecutions = Object.values(custodyExecutions)
    .filter((execution) => !activeExecutionProposalIds.has(execution.proposalId));

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
          <Kicker>red de confianza</Kicker>
          <TituloAnton tamano="lg" className="mt-1">
            Círculos
          </TituloAnton>
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 44 }}
        >
          <Animated.View entering={fadeUp}>
            <PapelCard className="mt-1 p-6">
              <TituloAnton tamano="md">Ningún dato cambia el barrio por sí solo.</TituloAnton>
              <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
                Los círculos convierten señales dispersas en cobertura, cuidado y acción coordinada.
              </Text>
              <Text className="mt-4 font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">
                persona · círculo · territorio
              </Text>
            </PapelCard>
          </Animated.View>

          {!CIVIC_API_URL && (
            <View className="mt-5 border border-ambar px-4 py-3">
              <Text className="font-archivo text-xs leading-5 text-tinta-90">
                Esta instalación está en modo local. Tus capturas funcionan; la red aparecerá cuando se configure la API cívica.
              </Text>
            </View>
          )}

          {message && (
            <View className="mt-5 border border-ambar px-4 py-3">
              <Text className="font-archivo text-xs leading-5 text-tinta-90">{message}</Text>
            </View>
          )}

          <View className="mt-8 flex-row items-end justify-between">
            <View>
              <Kicker tono="neutro">Pulso compartido</Kicker>
              <TituloAnton tamano="md" className="mt-2">
                Campañas activas
              </TituloAnton>
            </View>
            <Text className="font-space text-xs text-tinta-50">{campaigns.length}</Text>
          </View>

          {loading ? (
            <View className="h-32 items-center justify-center"><ActivityIndicator color={VIOLETA} /></View>
          ) : campaigns.length === 0 ? (
            <PapelCard className="mt-3 p-5">
              <Text className="font-archivo text-sm text-tinta-90">Todavía no hay campañas activas en la red.</Text>
              <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-50">Las expediciones fundadoras siguen disponibles y guardan todo offline.</Text>
            </PapelCard>
          ) : (
            <View className="mt-3 gap-3">
              {campaigns.slice(0, 8).map((campaign, index) => {
                const pulse = progress[campaign.id];
                const pct = pulse?.progressPct ?? (campaign.targetEntries ? Math.min(100, Math.round(campaign.entryCount / campaign.targetEntries * 100)) : 0);
                const color = campaign.mapColor ?? VIOLETA;
                return (
                  <Animated.View key={campaign.id} entering={staggerDelay(index)}>
                    <PapelCard className="p-5">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="font-space text-[10px] uppercase tracking-[1.76px]" style={{ color }}>{campaign.circleName}</Text>
                          <Text className="mt-1 font-archivo-bold text-lg leading-7 text-tinta">{campaign.title}</Text>
                        </View>
                        <ChipTipo etiqueta={campaign.type} />
                      </View>
                      {campaign.description && <Text className="mt-3 font-archivo text-xs leading-5 text-tinta-75">{campaign.description}</Text>}
                      <View className="mt-5 h-1.5 overflow-hidden bg-bordeSuave">
                        <View className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </View>
                      <View className="mt-2 flex-row justify-between">
                        <Text className="font-space text-[10px] text-tinta-50">{pulse?.entries ?? campaign.entryCount} señales</Text>
                        <Text className="font-space text-[10px] text-tinta-50">{pulse ? `${pulse.verifiedPct}% corroborado` : campaign.targetEntries ? `${pct}% cobertura` : 'meta abierta'}</Text>
                      </View>
                    </PapelCard>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {session && (
            <View className="mt-9">
              <View className="flex-row items-end justify-between">
                <View className="flex-1 pr-4">
                  <Kicker tono="neutro">Canal privado</Kicker>
                  <TituloAnton tamano="md" className="mt-2">
                    Pedidos bajo custodia
                  </TituloAnton>
                </View>
                <Text className="font-space text-xs text-tinta-50">{custodyInboxError ? '—' : custodyGrants.length}</Text>
              </View>

              <View className="mt-3 border border-verde px-4 py-3">
                <Text className="font-archivo text-[11px] leading-5 text-tinta-90">
                  Cada permiso muestra sólo categoría, urgencia, cantidad y unidad opcionales, y una zona segura si fue autorizada. No incluye relato, identidad, contacto ni ubicación exacta.
                </Text>
              </View>

              {orphanPendingResponses.map((intent) => {
                const grant = intent.grant;
                const responseError = custodyResponseErrors[grant.grantId];
                const pendingQuantity = intent.quantity != null && grant.payload.unit != null
                  ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(intent.quantity)} ${CUSTODY_UNIT_LABEL[grant.payload.unit]}`
                  : 'sin cantidad fijada';
                return (
                  <View key={grant.grantId} className="mt-3 border bg-papel-crudo p-5" style={{ borderColor: AMBAR_PT }}>
                    <Text className="font-archivo-bold text-sm text-tinta">Constancia pendiente de recuperar</Text>
                    <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                      El permiso ya no aparece en el corte activo, pero este teléfono conserva el comando exacto de {intent.disposition === 'assessing' ? 'evaluación' : `capacidad · ${pendingQuantity}`}. No se creará una respuesta nueva.
                    </Text>
                    <Text className="mt-2 font-space text-[9px] text-tinta-50">
                      {civicCategoryLabel(grant.payload.category)} · círculo {grant.recipient.id}
                    </Text>
                    <View className="mt-4 items-start">
                      <BotonTinta
                        etiqueta="Recuperar constancia"
                        accessibilityLabel="Recuperar constancia pendiente sin crear otra respuesta"
                        variante="fantasma"
                        tamano="compacto"
                        disabled={privateBusy}
                        cargando={custodyBusyId === grant.grantId}
                        onPress={() => { void submitCustodyResponse(grant, intent.disposition); }}
                      />
                    </View>
                    {responseError && (
                      <Text accessibilityLiveRegion="assertive" className="mt-3 font-archivo text-[11px] leading-5 text-tinta-90">
                        {responseError}
                      </Text>
                    )}
                  </View>
                );
              })}

              {executionIntentIncidents.map((incident, index) => (
                <View
                  key={incident.eventId ?? incident.proposalId ?? `execution-incident-${index}`}
                  className="mt-3 border bg-papel-crudo p-5"
                  style={{ borderColor: ROJO_SELLO }}
                >
                  <Text className="font-archivo-bold text-sm text-tinta">Constancia local en cuarentena</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                    Una operación pendiente no supera la verificación de integridad. La app conserva la fila, bloquea otro comando para esa ruta cuando puede identificarla y no intenta reconstruirla ni enviarla.
                  </Text>
                  <Text className="mt-2 font-space text-[9px] text-tinta-50">
                    {incident.type ? executionEventLabel(incident.type) : 'tipo no verificable'}
                    {incident.createdAt ? ` · guardado ${custodyExpiryLabel(incident.createdAt)}` : ''}
                  </Text>
                  <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">
                    Conservá este dispositivo y esta cuenta. Actualizar la bandeja es seguro; borrar datos puede destruir la evidencia necesaria para una recuperación asistida.
                  </Text>
                </View>
              ))}

              {orphanPendingExecutions.map((intent) => (
                <View key={intent.eventId} className="mt-3 border bg-papel-crudo p-5" style={{ borderColor: AMBAR_PT }}>
                  <Text className="font-archivo-bold text-sm text-tinta">Ruta pendiente de reconciliar</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                    La ruta ya no aparece en el corte verificable, pero este dispositivo conserva el evento exacto de {executionEventLabel(intent.type)}. Recuperar usa la misma identidad; nunca crea otro hito.
                  </Text>
                  <Text className="mt-2 font-space text-[9px] text-tinta-50">
                    Guardado {custodyExpiryLabel(intent.createdAt)}
                  </Text>
                  <View className="mt-4 items-start">
                    <BotonTinta
                      etiqueta="Recuperar constancia"
                      accessibilityLabel="Recuperar constancia exacta de la ruta privada"
                      variante="fantasma"
                      tamano="compacto"
                      disabled={privateBusy}
                      cargando={executionBusyId === intent.proposalId}
                      onPress={() => { void retryExecutionAction(intent.proposalId); }}
                    />
                  </View>
                  {executionErrors[intent.proposalId] && (
                    <Text accessibilityLiveRegion="assertive" className="mt-3 font-archivo text-[11px] leading-5 text-tinta-90">
                      {executionErrors[intent.proposalId]}
                    </Text>
                  )}
                </View>
              ))}

              {coordinationInboxError && !custodyInboxError && (
                <View accessibilityLiveRegion="assertive" className="mt-3 border border-ambar px-4 py-3">
                  <Text className="font-archivo-bold text-xs text-tinta">No pudimos verificar las coordinaciones.</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{coordinationInboxError}</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-90">
                    No presentamos una bandeja vacía como evidencia de ausencia. Una propuesta explícita puede reintentarse de forma idempotente.
                  </Text>
                  <View className="mt-3 items-start">
                    <BotonTinta
                      etiqueta="Actualizar estado"
                      accessibilityLabel="Reintentar verificación de coordinaciones privadas"
                      variante="fantasma"
                      tamano="compacto"
                      disabled={loading || busy || custodyBusyId != null || coordinationBusyId != null}
                      onPress={() => { void refresh(); }}
                    />
                  </View>
                </View>
              )}

              {executionInboxError && !custodyInboxError && (
                <View accessibilityLiveRegion="assertive" className="mt-3 border border-ambar px-4 py-3">
                  <Text className="font-archivo-bold text-xs text-tinta">No pudimos verificar las rutas de apoyo.</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{executionInboxError}</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-90">
                    Conservamos cualquier comando pendiente y no interpretamos la falla como ausencia de reserva, entrega o recepción.
                  </Text>
                  <View className="mt-3 items-start">
                    <BotonTinta
                      etiqueta="Actualizar rutas"
                      accessibilityLabel="Reintentar verificación de rutas privadas"
                      variante="fantasma"
                      tamano="compacto"
                      disabled={loading || privateBusy}
                      onPress={() => { void refresh(); }}
                    />
                  </View>
                </View>
              )}

              {custodyInboxError ? (
                <View className="mt-3 border border-ambar bg-papel-crudo p-5">
                  <Text className="font-archivo-bold text-sm text-tinta">No pudimos verificar esta bandeja.</Text>
                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{custodyInboxError}</Text>
                </View>
              ) : custodyGrants.length === 0 ? (
                <PapelCard className="mt-3 p-5">
                  <Text className="font-archivo text-sm text-tinta-90">No hay pedidos activos disponibles para tus roles actuales de coordinación.</Text>
                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-50">
                    Esta bandeja no muestra permisos vencidos o retirados. Vacía no significa que una necesidad haya sido resuelta.
                  </Text>
                </PapelCard>
              ) : (
                <View className="mt-3 gap-3">
                  {custodyGrants.map((grant, index) => {
                    const circleName = circles.find((circle) => circle.id === grant.recipient.id)?.name;
                    const confirming = custodyConfirmId === grant.grantId;
                    const withdrawing = custodyBusyId === grant.grantId;
                    const responseConfirming = custodyResponseConfirm?.grantId === grant.grantId
                      ? custodyResponseConfirm.disposition
                      : null;
                    const responseError = custodyResponseErrors[grant.grantId];
                    const pendingResponse = custodyPendingResponses[grant.grantId] ?? null;
                    const pendingResponseQuantity = pendingResponse?.quantity != null && pendingResponse.grant.payload.unit != null
                      ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(pendingResponse.quantity)} ${CUSTODY_UNIT_LABEL[pendingResponse.grant.payload.unit]}`
                      : 'sin cantidad fijada';
                    const coordinationProposal = coordinationProposals[grant.grantId] ?? null;
                    const coordinationPresentation = coordinationProposal
                      ? coordinationCopy(coordinationProposal)
                      : null;
                    const coordinationConfirming = coordinationConfirmId === grant.grantId;
                    const coordinationError = coordinationErrors[grant.grantId];
                    const coordinationBusy = coordinationBusyId === grant.grantId;
                    const custodyExecution = coordinationProposal
                      ? custodyExecutions[coordinationProposal.proposalId] ?? null
                      : null;
                    const pendingExecution = coordinationProposal
                      ? pendingExecutionIntents[coordinationProposal.proposalId] ?? null
                      : null;
                    const executionIncident = coordinationProposal
                      ? executionIntentIncidents.find(
                        (incident) => incident.proposalId === coordinationProposal.proposalId,
                      ) ?? null
                      : null;
                    const executionError = coordinationProposal
                      ? executionErrors[coordinationProposal.proposalId]
                        ?? (executionIncident
                          ? 'La constancia pendiente local no supera su control de integridad. Esta ruta queda bloqueada para evitar duplicar o reinterpretar el comando.'
                          : null)
                      : null;
                    const hasComparableQuantity = grant.payload.quantity != null && grant.payload.unit != null;
                    const supportInput = custodySupportInputs[grant.grantId] ?? '';
                    const proposedSupportQuantity = hasComparableQuantity
                      ? parseCustodySupportQuantity(supportInput, grant.payload.quantity)
                      : undefined;
                    const recordedSupportQuantity = grant.response?.quantity != null && grant.response.unit != null
                      ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(grant.response.quantity)} ${CUSTODY_UNIT_LABEL[grant.response.unit]}`
                      : 'sin cantidad declarada';
                    return (
                      <Animated.View key={grant.grantId} entering={staggerDelay(index)}>
                        <PapelCard className="p-5">
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                              <Kicker tono="neutro">{civicCategoryLabel(grant.payload.category)}</Kicker>
                              <Text className="mt-1 font-archivo-bold text-base text-tinta">
                                {circleName ?? `Círculo ${grant.recipient.id}`}
                              </Text>
                            </View>
                            <ChipTipo etiqueta="Permiso activo" activo color={VERDE} />
                          </View>

                          <View className="mt-4 gap-1.5">
                            <Text className="font-archivo text-xs leading-5 text-tinta-75">Urgencia {grant.payload.urgency}/5</Text>
                            <Text className="font-archivo text-xs leading-5 text-tinta-75">{custodyQuantityLabel(grant)}</Text>
                            <Text className="font-archivo text-xs leading-5 text-tinta-75">{custodyZoneLabel(grant.payload.location)}</Text>
                            <Text className="font-archivo text-xs leading-5 text-tinta-75">Vence {custodyExpiryLabel(grant.expiresAt)}</Text>
                          </View>

                          <PapelCard variante="suave" className="mt-4 p-3">
                            <Text className="font-archivo text-[11px] leading-5 text-tinta-50">
                              Recibir este permiso no asigna el caso ni afirma que el círculo pueda responder. Sólo habilita evaluar una coordinación dentro del plazo.
                            </Text>
                          </PapelCard>

                          {pendingResponse ? (
                            <View accessibilityLiveRegion="polite" className="mt-4 border border-ambar px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">Operación protegida pendiente</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                Este teléfono conservará el mismo comando de {pendingResponse.disposition === 'assessing' ? 'evaluación' : `capacidad · ${pendingResponseQuantity}`} hasta verificar su constancia. No podés cambiar el contenido ni crear otra identidad mientras tanto.
                              </Text>
                              <View className="mt-4 items-start">
                                <BotonTinta
                                  etiqueta="Recuperar constancia"
                                  accessibilityLabel="Reintentar exactamente la respuesta pendiente"
                                  variante="fantasma"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  cargando={withdrawing}
                                  onPress={() => { void submitCustodyResponse(grant, pendingResponse.disposition); }}
                                />
                              </View>
                            </View>
                          ) : grant.response ? (
                            <View
                              accessibilityLiveRegion="polite"
                              className={`mt-4 border px-4 py-3 ${grant.response.disposition === 'assessing' ? 'border-violeta' : 'border-verde'}`}
                            >
                              <Text className="font-archivo-bold text-xs text-tinta">
                                {grant.response.disposition === 'assessing'
                                  ? 'El círculo está evaluando'
                                  : `Capacidad declarada · ${recordedSupportQuantity}`}
                              </Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                {grant.response.disposition === 'assessing'
                                  ? 'Esta constancia sólo registra que comenzó una evaluación. No confirma capacidad, contacto, entrega ni resolución.'
                                  : 'Esta constancia expresa capacidad disponible. No confirma que haya habido contacto, entrega ni resolución.'}
                              </Text>
                              <Text className="mt-2 font-space text-[9px] text-tinta-50">
                                Registrado {custodyExpiryLabel(grant.response.recordedAt)}
                              </Text>
                            </View>
                          ) : responseConfirming === 'assessing' ? (
                            <View accessibilityLiveRegion="polite" className="mt-4 border border-violeta px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">¿Tomar este pedido para evaluar?</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                Se registrará una constancia del círculo. Evaluar no promete capacidad, contacto, entrega ni resolución.
                              </Text>
                              <View className="mt-4 flex-row flex-wrap gap-2">
                                <BotonTinta
                                  etiqueta="Volver"
                                  accessibilityLabel="Volver sin tomar el pedido para evaluar"
                                  variante="fantasma"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  onPress={() => setCustodyResponseConfirm(null)}
                                />
                                <BotonTinta
                                  etiqueta="Confirmar evaluación"
                                  accessibilityLabel="Confirmar tomar para evaluar"
                                  variante="tinta"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  cargando={withdrawing}
                                  onPress={() => { void submitCustodyResponse(grant, 'assessing'); }}
                                />
                              </View>
                            </View>
                          ) : (
                            <PapelCard variante="suave" className="mt-4 p-4">
                              <Text className="font-archivo-bold text-xs text-tinta">Sin respuesta del círculo</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-50">
                                El primer paso permitido es dejar constancia de que el pedido será evaluado.
                              </Text>
                              <View className="mt-4 items-start">
                                <BotonTinta
                                  etiqueta="Tomar para evaluar"
                                  accessibilityLabel="Tomar pedido para evaluar"
                                  variante="fantasma"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  onPress={() => {
                                    clearCustodyResponseError(grant.grantId);
                                    setCustodyConfirmId(null);
                                    setCustodyResponseConfirm({ grantId: grant.grantId, disposition: 'assessing' });
                                  }}
                                />
                              </View>
                            </PapelCard>
                          )}

                          {grant.response && !pendingResponse && !coordinationProposal && !coordinationInboxError && !coordinationTruncated && !coordinationConfirming && (
                            <View className="mt-4 border border-violeta px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">
                                {grant.response.disposition === 'assessing' ? '¿Hay capacidad disponible?' : 'Revisar capacidad declarada'}
                              </Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                {grant.response.disposition === 'assessing'
                                  ? 'Declarala sólo si el círculo puede poner un recurso a disposición. No equivale a entregarlo.'
                                  : 'Una revisión crea una nueva constancia auditada. No borra el historial ni demuestra una entrega.'}
                              </Text>

                              {hasComparableQuantity && responseConfirming !== 'support_available' && (
                                <View className="mt-4">
                                  <Kicker tono="neutro">Cantidad disponible (opcional)</Kicker>
                                  <TextInput
                                    accessibilityLabel={`Cantidad disponible, máximo ${custodyQuantityLabel(grant)}`}
                                    accessibilityHint="Campo numérico opcional; la unidad coincide con la solicitada"
                                    value={supportInput}
                                    onChangeText={(value) => updateCustodySupportInput(grant.grantId, value)}
                                    onFocus={() => setCustodySupportFocusId(grant.grantId)}
                                    onBlur={() => setCustodySupportFocusId((current) => (current === grant.grantId ? null : current))}
                                    editable={!privateBusy}
                                    keyboardType="decimal-pad"
                                    inputMode="decimal"
                                    placeholder={`Hasta ${custodyQuantityLabel(grant)}`}
                                    placeholderTextColor={TINTA_50}
                                    className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
                                    style={estiloInput(custodySupportFocusId === grant.grantId)}
                                  />
                                  <Text className="mt-2 font-archivo text-[10px] leading-4 text-tinta-50">
                                    La unidad se fija en {CUSTODY_UNIT_LABEL[grant.payload.unit!]}; no se puede cambiar ni superar lo solicitado.
                                  </Text>
                                </View>
                              )}

                              {responseConfirming === 'support_available' ? (
                                <View accessibilityLiveRegion="polite" className="mt-4 border border-violeta bg-papel-presionado px-4 py-3">
                                  <Text className="font-archivo-bold text-xs text-tinta">¿Confirmar capacidad disponible?</Text>
                                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                    Se declarará {typeof proposedSupportQuantity === 'number'
                                      ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(proposedSupportQuantity)} ${CUSTODY_UNIT_LABEL[grant.payload.unit!]}`
                                      : 'capacidad sin fijar una cantidad'}. Esto no registra contacto, entrega ni resolución.
                                  </Text>
                                  <View className="mt-4 flex-row flex-wrap gap-2">
                                    <BotonTinta
                                      etiqueta="Volver"
                                      accessibilityLabel="Volver sin declarar capacidad"
                                      variante="fantasma"
                                      tamano="compacto"
                                      disabled={privateBusy}
                                      onPress={() => setCustodyResponseConfirm(null)}
                                    />
                                    <BotonTinta
                                      etiqueta="Confirmar declaración"
                                      accessibilityLabel="Confirmar capacidad disponible"
                                      variante="tinta"
                                      tamano="compacto"
                                      disabled={privateBusy}
                                      cargando={withdrawing}
                                      onPress={() => { void submitCustodyResponse(grant, 'support_available'); }}
                                    />
                                  </View>
                                </View>
                              ) : (
                                <View className="mt-4 items-start">
                                  <BotonTinta
                                    etiqueta={grant.response.disposition === 'assessing' ? 'Declarar capacidad disponible' : 'Registrar una revisión'}
                                    accessibilityLabel={grant.response.disposition === 'assessing'
                                      ? 'Declarar capacidad disponible'
                                      : 'Revisar capacidad declarada'}
                                    variante="fantasma"
                                    tamano="compacto"
                                    disabled={privateBusy}
                                    onPress={() => prepareCustodySupportResponse(grant)}
                                  />
                                </View>
                              )}
                            </View>
                          )}

                          {coordinationProposal && coordinationPresentation && (
                            <View
                              accessibilityLiveRegion="polite"
                              className="mt-4 border bg-papel-crudo px-4 py-3"
                              style={{ borderColor: coordinationPresentation.color }}
                            >
                              <Text className="font-archivo-bold text-xs text-tinta">{coordinationPresentation.title}</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{coordinationPresentation.detail}</Text>
                              <Text className="mt-3 font-archivo text-[10px] leading-5 text-tinta-50">
                                {coordinationProposal.state === 'accepted' ? 'Capacidad acordada' : 'Capacidad incluida en la propuesta'}: {coordinationCapacityLabel(coordinationProposal)}.
                              </Text>
                              <Text className="mt-1 font-space text-[9px] text-tinta-30">
                                Vence {custodyExpiryLabel(coordinationProposal.expiresAt)}
                              </Text>
                            </View>
                          )}

                          {coordinationProposal?.state === 'accepted' && custodyExecution && (
                            <CustodyExecutionCard
                              execution={custodyExecution}
                              role="coordinator"
                              refreshAtDeadline
                              busy={executionBusyId === coordinationProposal.proposalId}
                              disabled={
                                (privateBusy && executionBusyId !== coordinationProposal.proposalId)
                                || (lockedExecutionProposalIdSet.has(coordinationProposal.proposalId) && !pendingExecution)
                              }
                              pendingEventType={pendingExecution?.type ?? null}
                              error={executionError}
                              onAction={(action) => runExecutionAction(coordinationProposal.proposalId, action)}
                              onRefresh={() => {
                                void refreshExecutionStatus(coordinationProposal.proposalId);
                              }}
                              onRetryPending={() => { void retryExecutionAction(coordinationProposal.proposalId); }}
                            />
                          )}

                          {coordinationProposal?.state === 'accepted'
                            && !custodyExecution
                            && (executionInboxError || executionTruncated)
                            && (
                              <View accessibilityLiveRegion="assertive" className="mt-4 border border-ambar px-4 py-3">
                                <Text className="font-archivo-bold text-xs text-tinta">La ruta de apoyo no pudo verificarse</Text>
                                <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                  {executionInboxError ?? 'La lectura alcanzó el corte seguro antes de encontrar esta ruta.'} La ausencia de la tarjeta no demuestra que no haya avances.
                                </Text>
                                <View className="mt-3 items-start">
                                  <BotonTinta
                                    etiqueta="Actualizar ruta"
                                    accessibilityLabel="Actualizar rutas privadas de apoyo"
                                    variante="fantasma"
                                    tamano="compacto"
                                    disabled={privateBusy}
                                    onPress={() => { void refresh(); }}
                                  />
                                </View>
                              </View>
                            )}

                          {grant.response?.disposition === 'support_available' && !pendingResponse && !coordinationProposal && (
                            coordinationConfirming ? (
                              <View accessibilityLiveRegion="polite" className="mt-4 border border-violeta px-4 py-3">
                                <Text className="font-archivo-bold text-xs text-tinta">¿Proponer una coordinación privada?</Text>
                                <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                  Esta confirmación expresa el acuerdo del círculo para intentar coordinar {recordedSupportQuantity}. La otra parte decidirá por separado. No reserva recursos ni registra contacto, entrega o resolución.
                                </Text>
                                <View className="mt-4 flex-row flex-wrap gap-2">
                                  <BotonTinta
                                    etiqueta="Volver"
                                    accessibilityLabel="Volver sin proponer coordinación"
                                    variante="fantasma"
                                    tamano="compacto"
                                    disabled={privateBusy}
                                    onPress={() => setCoordinationConfirmId(null)}
                                  />
                                  <BotonTinta
                                    etiqueta="Confirmar propuesta"
                                    accessibilityLabel="Confirmar propuesta privada de coordinación"
                                    variante="tinta"
                                    tamano="compacto"
                                    disabled={privateBusy}
                                    cargando={coordinationBusy}
                                    onPress={() => { void submitCoordinationProposal(grant); }}
                                  />
                                </View>
                              </View>
                            ) : (
                              <View className="mt-4 border border-violeta px-4 py-3">
                                <Text className="font-archivo-bold text-xs text-tinta">
                                  {coordinationInboxError || coordinationTruncated
                                    ? 'Proponer o recuperar una coordinación'
                                    : 'Siguiente decisión: proponer coordinación'}
                                </Text>
                                <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                  {coordinationInboxError || coordinationTruncated
                                    ? 'La página actual no prueba que no exista una propuesta y no habilitamos revisar la capacidad. Confirmar usa la misma identidad determinista: crea la propuesta o recupera su constancia sin duplicarla.'
                                    : 'La capacidad declarada queda congelada en la propuesta. Quien pidió apoyo podrá aceptarla o declinarla sin exponer relato, identidad, contacto ni ubicación exacta.'}
                                </Text>
                                <View className="mt-4 items-start">
                                  <BotonTinta
                                    etiqueta="Proponer coordinación"
                                    accessibilityLabel="Proponer coordinación privada"
                                    variante="fantasma"
                                    tamano="compacto"
                                    disabled={privateBusy}
                                    onPress={() => {
                                      setCustodyConfirmId(null);
                                      setCustodyResponseConfirm(null);
                                      setCoordinationConfirmId(grant.grantId);
                                    }}
                                  />
                                </View>
                              </View>
                            )
                          )}

                          {coordinationError && (
                            <View accessibilityLiveRegion="assertive" className="mt-4 border border-ambar px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">No pudimos verificar la propuesta</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{coordinationError}</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-90">
                                El estado visible no cambió. Podés reintentar la misma operación sin crear otra identidad.
                              </Text>
                            </View>
                          )}

                          {responseError && (
                            <View accessibilityLiveRegion="assertive" className="mt-4 border border-ambar px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">No pudimos verificar la constancia</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{responseError}</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-90">
                                La respuesta visible no cambió. Podés reintentar la misma operación.
                              </Text>
                            </View>
                          )}

                          {confirming ? (
                            <View accessibilityLiveRegion="polite" className="mt-4 border border-sello px-4 py-3">
                              <Text className="font-archivo-bold text-xs text-tinta">¿Retirar este permiso de la bandeja?</Text>
                              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                                Solicitaremos retirar estos datos de la bandeja. El permiso seguirá figurando operativo hasta recibir una constancia válida; la necesidad no se marcará como resuelta y no hace falta justificar el retiro.
                              </Text>
                              <View className="mt-4 flex-row flex-wrap gap-2">
                                <BotonTinta
                                  etiqueta="Volver"
                                  accessibilityLabel="Volver sin retirar el permiso"
                                  variante="fantasma"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  onPress={() => setCustodyConfirmId(null)}
                                />
                                <BotonTinta
                                  etiqueta="Confirmar retiro"
                                  accessibilityLabel="Confirmar retiro del permiso de custodia"
                                  variante="tinta"
                                  tamano="compacto"
                                  disabled={privateBusy}
                                  cargando={withdrawing}
                                  onPress={() => withdrawCustodyGrant(grant.grantId)}
                                />
                              </View>
                            </View>
                          ) : (
                            <Pressable97
                              accessibilityRole="button"
                              accessibilityLabel="No podemos custodiar, retirar de la bandeja"
                              disabled={privateBusy}
                              onPress={() => {
                                setCustodyResponseConfirm(null);
                                setCustodyConfirmId(grant.grantId);
                              }}
                              className="mt-4 min-h-11 items-start justify-center"
                            >
                              <Text className="font-space text-xs text-tinta-50">No podemos custodiar / retirar de la bandeja</Text>
                            </Pressable97>
                          )}
                        </PapelCard>
                      </Animated.View>
                    );
                  })}
                  {custodyTruncated && (
                    <Text className="px-1 font-archivo text-[11px] leading-5 text-ambar">
                      Se alcanzó el tope seguro de 1.000 permisos por actualización. Puede haber más; esta vista no interpreta el corte como una bandeja completa.
                    </Text>
                  )}
                  {coordinationTruncated && (
                    <Text className="px-1 font-archivo text-[11px] leading-5 text-ambar">
                      La lectura de propuestas quedó parcial por el tope seguro de 1.000 o por un cambio concurrente. La ausencia de una tarjeta no demuestra que no exista otra propuesta.
                    </Text>
                  )}
                  {executionTruncated && (
                    <Text className="px-1 font-archivo text-[11px] leading-5 text-ambar">
                      La lectura de rutas de apoyo alcanzó el tope seguro de 1.000. Puede haber más; ninguna ausencia se interpreta como falta de avance.
                    </Text>
                  )}
                </View>
              )}

              {historicalCustodyExecutions.length > 0 && (
                <View className="mt-7">
                  <Kicker tono="neutro">Historia y rutas fuera del corte activo</Kicker>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-50">
                    No aparecen enlazadas a un permiso del corte activo: puede tratarse de historia o de una lectura parcial. Se conservan para auditoría; un cierre no demuestra entrega ni resolución y cualquier retiro operativo queda como hito separado.
                  </Text>
                  {historicalCustodyExecutions.map((execution) => {
                    const pending = pendingExecutionIntents[execution.proposalId] ?? null;
                    const incident = executionIntentIncidents.find(
                      (item) => item.proposalId === execution.proposalId,
                    ) ?? null;
                    const executionError = executionErrors[execution.proposalId]
                      ?? (incident
                        ? 'La constancia pendiente local no supera su control de integridad. La ruta permanece bloqueada y la fila no fue borrada ni reenviada.'
                        : null);
                    return (
                      <CustodyExecutionCard
                        key={execution.proposalId}
                        execution={execution}
                        role="coordinator"
                        refreshAtDeadline
                        busy={executionBusyId === execution.proposalId}
                        disabled={
                          (privateBusy && executionBusyId !== execution.proposalId)
                          || (lockedExecutionProposalIdSet.has(execution.proposalId) && !pending)
                        }
                        pendingEventType={pending?.type ?? null}
                        error={executionError}
                        onAction={(action) => runExecutionAction(execution.proposalId, action)}
                        onRefresh={() => { void refreshExecutionStatus(execution.proposalId); }}
                        onRetryPending={() => { void retryExecutionAction(execution.proposalId); }}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View className="mt-9 flex-row items-end justify-between">
            <View>
              <Kicker tono="neutro">Organización viva</Kicker>
              <TituloAnton tamano="md" className="mt-2">
                Círculos cercanos
              </TituloAnton>
            </View>
            <Text className="font-space text-xs text-tinta-50">{circles.length}</Text>
          </View>

          <View className="mt-3 gap-3">
            {circles.map((circle, index) => {
              const expanded = expandedId === circle.id;
              const currentDetail = expanded && detail?.id === circle.id ? detail : null;
              return (
                <Animated.View key={circle.id} entering={staggerDelay(index)}>
                  <PapelCard className="p-5">
                    <Pressable97 accessibilityRole="button" accessibilityLabel={`Abrir ${circle.name}`} onPress={() => openCircle(circle)}>
                      <View className="flex-row items-start">
                        <View className="flex-1">
                          <ChipTipo etiqueta={KIND_LABEL[circle.kind]} />
                          <Text className="mt-2 font-archivo-bold text-base text-tinta">{circle.name}</Text>
                          <Text className="mt-1 font-space text-[10px] text-tinta-50">
                            {circle.memberCount} personas{circle.city ? ` · ${circle.city}` : circle.province ? ` · ${circle.province}` : ''}
                          </Text>
                        </View>
                        <Text className="font-space text-lg text-tinta">{expanded ? '−' : '+'}</Text>
                      </View>
                      {circle.description && <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">{circle.description}</Text>}
                    </Pressable97>

                      {expanded && (
                        <View className="mt-5 border-t border-bordeSuave pt-4">
                          {!session ? (
                            <Text className="font-archivo text-xs leading-5 text-tinta-50">Vinculá tu cuenta para sumarte, recibir invitaciones o reportar un problema.</Text>
                          ) : !circle.isMember && circle.kind !== 'celula' ? (
                            <BotonTinta
                              etiqueta="Sumarme al círculo"
                              variante="fantasma"
                              tamano="compacto"
                              disabled={busy}
                              onPress={() => act(() => joinCircle(circle.id, session.user.id), `Ya sos parte de ${circle.name}.`)}
                            />
                          ) : circle.kind === 'celula' && !circle.isMember ? (
                            <Text className="font-archivo text-xs leading-5 text-tinta-50">Las células se abren con un código de alguien de adentro.</Text>
                          ) : (
                            <Text className="font-archivo-bold text-xs text-verde">Sos parte · {currentDetail?.role ?? 'miembro'}</Text>
                          )}

                          {session && currentDetail?.role === 'coordinador' && (
                            <View className="mt-4">
                              <BotonTinta
                                etiqueta="Crear invitación"
                                variante="tinta"
                                tamano="compacto"
                                disabled={busy}
                                onPress={() => act(async () => {
                                  const expectedUserId = session.user.id;
                                  const actionEpoch = privateRefreshEpoch.current;
                                  const created = await createCircleInvite(circle.id, expectedUserId);
                                  const completionSession = await getCommunitySession();
                                  if (
                                    completionSession?.user.id !== expectedUserId
                                    || privateRefreshEpoch.current !== actionEpoch
                                  ) {
                                    clearAccountBoundUi();
                                    setSession(completionSession);
                                    throw new Error('La cuenta activa cambió. La invitación no se mostrará en esta sesión.');
                                  }
                                  setGeneratedInvite(created.code);
                                }, 'Invitación lista para compartir durante siete días.', false)}
                              />
                              {generatedInvite && <Text selectable className="mt-3 font-space text-sm tracking-[2px] text-tinta">{generatedInvite}</Text>}
                            </View>
                          )}

                          {session && (
                            <View className="mt-4">
                              <TextInput
                                value={reportReason}
                                onChangeText={setReportReason}
                                onFocus={() => setEnfocadoReporte(true)}
                                onBlur={() => setEnfocadoReporte(false)}
                                placeholder="Reportar un riesgo o abuso…"
                                placeholderTextColor={TINTA_50}
                                multiline
                                className="min-h-[72px] bg-papel-crudo px-5 py-4 font-archivo text-sm text-tinta"
                                style={estiloInput(enfocadoReporte)}
                              />
                              {reportReason.trim().length >= 10 && (
                                <View className="mt-3 items-start">
                                  <BotonTinta
                                    etiqueta="Enviar a moderación"
                                    variante="fantasma"
                                    tamano="compacto"
                                    disabled={busy}
                                    onPress={() => act(() => reportCircle(circle.id, reportReason, session.user.id), 'Reporte recibido por moderación.')}
                                  />
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      )}
                  </PapelCard>
                </Animated.View>
              );
            })}
          </View>

          <Kicker tono="neutro" className="mt-9">entrada</Kicker>
          {session ? (
            <PapelCard className="mt-3 p-5">
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="font-archivo-bold text-sm text-tinta">{session.user.name}</Text>
                  <Text className="mt-1 font-space text-[10px] text-tinta-50">@{session.user.username} · dispositivo vinculado</Text>
                </View>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar sesión"
                  disabled={busy}
                  onPress={() => {
                    if (
                      pendingRemoteRevocationCount > 0
                      || pendingResponseIntentCount > 0
                      || pendingExecutionIntentCount > 0
                    ) {
                      setLogoutConfirming(true);
                    } else {
                      void disconnectAccount();
                    }
                  }}
                  className="min-h-11 min-w-11 items-center justify-center"
                >
                  <Text className="font-space text-xs uppercase tracking-[1px] text-tinta-50">Salir</Text>
                </Pressable97>
              </View>

              {logoutConfirming && (
                <View accessibilityLiveRegion="polite" className="mt-4 border border-ambar px-4 py-3">
                  <Text className="font-archivo-bold text-xs text-tinta">
                    {pendingExecutionIntentCount > 0
                      ? 'Hay una ruta privada pendiente de constancia'
                      : pendingRemoteRevocationCount > 0 && pendingResponseIntentCount > 0
                        ? 'Hay permisos remotos y respuestas pendientes'
                      : pendingRemoteRevocationCount > 0
                        ? 'Hay permisos remotos todavía vigentes'
                        : 'Hay una respuesta pendiente de constancia'}
                  </Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                    {pendingRemoteRevocationCount > 0
                      ? 'Cerrar sesión no revoca los permisos entregados; necesitarás esta misma cuenta para retirarlos. '
                      : ''}
                    {pendingResponseIntentCount > 0
                      ? 'La respuesta exacta y su proyección mínima seguirán guardadas para recuperar su constancia. '
                      : ''}
                    {pendingExecutionIntentCount > 0
                      ? 'El evento exacto de la ruta seguirá guardado hasta recuperar una aplicación o rechazo verificable con esta cuenta. '
                      : ''}
                    {' '}Borrar todos los datos del dispositivo podría destruir esa capacidad de recuperación.
                  </Text>
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <BotonTinta
                      etiqueta="Conservar sesión"
                      accessibilityLabel="Conservar la sesión"
                      variante="fantasma"
                      tamano="compacto"
                      disabled={busy}
                      onPress={() => setLogoutConfirming(false)}
                    />
                    <BotonTinta
                      etiqueta="Cerrar de todos modos"
                      accessibilityLabel="Cerrar sesión de todos modos"
                      variante="tinta"
                      tamano="compacto"
                      disabled={busy}
                      onPress={() => { void disconnectAccount(); }}
                    />
                  </View>
                </View>
              )}

              <Text className="mt-4 font-archivo text-[11px] leading-5 text-tinta-50">
                Tu ronda ya puede recibir señales para corroborar y puentes donde representás a una de las dos partes.
              </Text>

              <View className="mt-5 flex-row items-start gap-2">
                <TextInput
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  onFocus={() => setEnfocadoInvite(true)}
                  onBlur={() => setEnfocadoInvite(false)}
                  autoCapitalize="characters"
                  placeholder="Código de invitación"
                  placeholderTextColor={TINTA_50}
                  className="flex-1 bg-papel-crudo px-5 py-4 font-space text-sm text-tinta"
                  style={estiloInput(enfocadoInvite)}
                />
                <BotonTinta
                  etiqueta="Canjear →"
                  accessibilityLabel="Canjear invitación"
                  variante="tinta"
                  disabled={inviteCode.trim().length < 6 || busy}
                  onPress={() => act(() => redeemCircleInvite(inviteCode, session.user.id), 'Invitación aceptada. El círculo ya está en tu red.')}
                />
              </View>

              {notifications.length > 0 && (
                <View className="mt-6 border-t border-bordeSuave pt-5">
                  <View className="flex-row items-center justify-between">
                    <Kicker tono="neutro">Movimientos de tu red</Kicker>
                    <Pressable97 accessibilityRole="button" accessibilityLabel="Marcar notificaciones leídas" onPress={() => act(() => markAllCommunityNotificationsRead(session.user.id), 'Bandeja al día.')}>
                      <Text className="font-space text-[10px] uppercase tracking-[1px] text-tinta-50">Marcar leídas</Text>
                    </Pressable97>
                  </View>
                  {notifications.slice(0, 4).map((item, index) => (
                    <FilaIndice key={item.id} numero={String(index + 1).padStart(2, '0')} glifo="">
                      <Text className="font-archivo-bold text-xs text-tinta">{item.title}</Text>
                      <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-50">{item.content}</Text>
                    </FilaIndice>
                  ))}
                </View>
              )}
            </PapelCard>
          ) : (
            <PapelCard className="mt-3 p-5">
              <View className="flex-row gap-2">
                <ChipTipo etiqueta="Ya tengo cuenta" activo={authMode === 'login'} onPress={() => setAuthMode('login')} />
                <ChipTipo etiqueta="Crear cuenta" activo={authMode === 'register'} onPress={() => setAuthMode('register')} />
              </View>
              <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-50">
                Vincularte abre la ronda entre teléfonos: señales para corroborar y puentes donde sos una de las partes. No sube tu bitácora, borradores ni ubicación exacta.
              </Text>
              {authMode === 'register' && (
                <>
                  <Field label="Nombre" value={auth.name} onChangeText={(name) => setAuth((v) => ({ ...v, name }))} placeholder="Tu nombre" />
                  <Field label="Email" value={auth.email} onChangeText={(email) => setAuth((v) => ({ ...v, email }))} placeholder="vos@ejemplo.org" keyboardType="email-address" />
                </>
              )}
              <Field label="Usuario" value={auth.username} onChangeText={(username) => setAuth((v) => ({ ...v, username }))} placeholder="nombre_de_usuario" />
              <Field label="Contraseña" value={auth.password} onChangeText={(password) => setAuth((v) => ({ ...v, password }))} placeholder={authMode === 'register' ? '8+ caracteres, mayúscula, número y símbolo' : 'Tu contraseña'} secureTextEntry />
              {authMode === 'register' && <Field label="Repetir contraseña" value={auth.confirmPassword} onChangeText={(confirmPassword) => setAuth((v) => ({ ...v, confirmPassword }))} placeholder="Repetila" secureTextEntry />}
              <View className="mt-6 items-center">
                <BotonTinta
                  etiqueta={authMode === 'login' ? 'Vincular mi cuenta' : 'Crear y vincular'}
                  onPress={connect}
                  disabled={busy || !auth.username.trim() || !auth.password}
                  cargando={busy}
                />
              </View>
            </PapelCard>
          )}

          <Text className="mt-8 font-archivo text-[11px] leading-5 text-tinta-50">
            Una cuenta habilita pertenencia y coordinación entre dispositivos. La identidad de captura sigue seudónima; el feed omite claves de actor, contacto, notas privadas y coordenadas exactas.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
