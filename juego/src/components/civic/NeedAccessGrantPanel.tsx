import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  deliverCustodiedNeedAccess,
  needGrantDeliveryErrorMessage,
  revokeCustodiedNeedAccessEverywhere,
} from '@/civic/need-access-grant-delivery';
import {
  custodyCoordinationErrorMessage,
  decideCustodyCoordination,
  refreshCustodyCoordinationStatus,
} from '@/civic/custody-coordination';
import {
  cachedCustodyExecutionForGrant,
  custodyExecutionErrorMessage,
  loadCustodyExecutionIntentInventory,
  loadCustodyExecutionStatus,
  retryCustodyExecutionEvent,
  submitCustodyExecutionEvent,
  type CustodyExecutionEventCommand,
  type CustodyExecutionIntentIncident,
  type CustodyExecutionMutationReceipt,
  type CustodyExecutionSnapshot,
  type PendingCustodyExecutionIntent,
} from '@/civic/custody-execution';
import {
  grantCustodiedNeedAccess,
  NEED_GRANT_PURPOSES,
  NEED_GRANT_RECIPIENTS,
  NEED_GRANT_REVOCATION_REASONS,
  NEED_GRANT_SCOPES,
  needAccessGrantsForNeed,
  needGrantStatusAt,
} from '@/civic/need-access-grants';
import { loadCircles, type CircleSummary } from '@/civic/community-api';
import { getCommunitySession } from '@/civic/community-auth';
import { CIVIC_API_URL } from '@/civic/config';
import type {
  NeedGrantPurpose,
  NeedGrantRecipientKind,
  NeedGrantRevocationReason,
  NeedGrantScope,
  NeedCoordinationDecision,
  NeedCoordinationState,
} from '@/civic/types';
import type { CivicNeedAccessGrantRow, CivicNeedRow } from '@/db/schema';
import { haptic } from '@/theme/haptics';
import {
  AMBAR_PT,
  CIAN,
  PAPEL_CRUDO,
  ROJO_SELLO,
  TINTA,
  TINTA_50,
  VERDE,
  VIOLETA,
} from '@/theme/tokens';

import {
  CustodyExecutionCard,
  type CustodyExecutionActionDraft,
} from './CustodyExecutionCard';
import { BotonTinta, Kicker, PapelCard } from '../papel';
import { Pressable97 } from '../ui/Pressable97';

const STATUS_LABEL = {
  active: 'Vigente',
  revoked: 'Revocado',
  expired: 'Vencido',
} as const;

const DELIVERY_STATUS = {
  local: {
    label: 'sólo local',
    color: CIAN,
    detail: 'El acta existe sólo en este dispositivo. Todavía no fue entregada al destinatario.',
  },
  delivering: {
    label: 'entregando',
    color: AMBAR_PT,
    detail: 'La entrega está en curso. No cierres la app hasta recibir confirmación.',
  },
  delivered: {
    label: 'entregado',
    color: VERDE,
    detail: 'La red confirmó la recepción de la proyección mínima por el círculo autorizado.',
  },
  failed: {
    label: 'no confirmado',
    color: ROJO_SELLO,
    detail: 'La red no confirmó la entrega. Podés reintentar sin crear un permiso nuevo.',
  },
  revocation_pending: {
    label: 'revocación pendiente',
    color: AMBAR_PT,
    detail: 'Todavía no hay confirmación remota de la revocación. El permiso no se presenta como revocado.',
  },
  revoked_remote: {
    label: 'revocado en red',
    color: ROJO_SELLO,
    detail: 'La red confirmó la revocación y el acta local conserva la trazabilidad.',
  },
} as const;

const RESPONSE_UNIT_LABEL: Record<string, string> = {
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
  other: 'unidades controladas',
};

const COORDINATION_PRESENTATION: Record<NeedCoordinationState, {
  title: string;
  detail: string;
  color: string;
}> = {
  proposed: {
    title: 'Te propusieron coordinar',
    detail: 'Otra cuenta coordinadora del círculo expresó su disposición. Tu decisión se registra por separado. Aceptar abre un acuerdo para intentar coordinar; no reserva recursos ni prueba contacto, entrega o resolución.',
    color: VIOLETA,
  },
  accepted: {
    title: 'Acuerdo para coordinar',
    detail: 'Ambas partes aceptaron intentar una coordinación privada. Esto no reserva recursos ni prueba contacto, entrega o resolución.',
    color: VERDE,
  },
  declined: {
    title: 'No hubo acuerdo de coordinación',
    detail: 'La propuesta no fue aceptada. Esta constancia no juzga a ninguna persona ni la legitimidad o urgencia de la necesidad.',
    color: ROJO_SELLO,
  },
  expired: {
    title: 'La propuesta venció',
    detail: 'Terminó su plazo. No inferimos rechazo, falta de necesidad, contacto, entrega ni resolución.',
    color: AMBAR_PT,
  },
  closed: {
    title: 'La coordinación quedó cerrada',
    detail: 'El permiso dejó de estar operativo. El cierre no demuestra contacto, entrega ni resolución de la necesidad.',
    color: TINTA_50,
  },
};

const COORDINATION_DECISION_LABEL: Record<NeedCoordinationDecision, string> = {
  accept: 'Aceptaste intentar coordinar',
  decline: 'Decidiste no abrir la coordinación',
};

const grantorExecutionMessage = (receipt: CustodyExecutionMutationReceipt): string => {
  if (receipt.status === 'rejected') {
    return receipt.reason === 'version_changed'
      ? 'La ruta cambió en otra pestaña o dispositivo. Tu comando no se aplicó; mostramos el estado autoritativo para que puedas decidir de nuevo.'
      : 'La red confirmó que ese paso no correspondía al estado actual. No fue aplicado ni reinterpretado.';
  }
  const type = receipt.recordedEvent.type;
  if (type === 'grantor_ready') return 'Tu disposición quedó registrada sin compartir contacto, identidad ni domicilio.';
  if (type === 'confirm_receipt') {
    if (receipt.recordedEvent.receipt === 'not_received') return 'Registraste que el apoyo no llegó. La necesidad sigue abierta y no atribuimos culpa automáticamente.';
    if (receipt.recordedEvent.receipt === 'partial') return 'Registraste una recepción parcial. Falta el seguimiento separado sobre el estado real de la necesidad.';
    return 'Registraste la recepción. Falta el seguimiento separado antes de presentar la necesidad como cubierta.';
  }
  if (type === 'record_follow_up') {
    return receipt.recordedEvent.followUp === 'need_met'
      ? 'Registraste que, desde tu perspectiva, la necesidad quedó cubierta.'
      : 'Registraste que la necesidad sigue abierta a nuevas respuestas.';
  }
  if (type === 'withdraw') return 'Retiro registrado. Corta nuevas acciones, pero no borra ningún hecho anterior.';
  return 'Constancia privada registrada y verificada.';
};

const verifiedCircleIdFromKey = (recipientKey: string): number | null => {
  const matched = /^circle:([1-9]\d*)$/.exec(recipientKey);
  if (!matched) return null;
  const id = Number(matched[1]);
  return Number.isSafeInteger(id) ? id : null;
};

const grantErrorMessage = (error: unknown): string => {
  const code = error instanceof Error ? error.message : '';
  if (code === 'need_grant_recipient_reference_invalid') {
    return 'El identificador debe tener hasta 64 caracteres y usar sólo letras, números, punto, guión, dos puntos o guion bajo.';
  }
  if (code === 'need_grant_recipient_label_unsafe') {
    return 'Usá sólo el nombre público del círculo u organización; no escribas teléfonos, correos ni enlaces.';
  }
  if (code === 'need_grant_active_recipient_exists') {
    return 'Ya existe un permiso vigente. Revocalo antes de autorizar a otro destinatario.';
  }
  if (code === 'need_grant_safe_area_unavailable') {
    return 'Este pedido no tiene una zona aproximada segura. Elegí “Sólo lo esencial”.';
  }
  if (code === 'need_grant_need_expired') {
    return 'El pedido ya venció. Revisá su vigencia antes de preparar un permiso.';
  }
  if (code === 'need_grant_private_custody_required' || code === 'need_grant_collective_state_detected') {
    return 'La comprobación de privacidad falló y el permiso no se creó. El pedido permanece cerrado.';
  }
  return 'No pudimos registrar el permiso. El pedido sigue privado y no se envió nada.';
};

const displayDate = (value: string): string => {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return 'fecha no disponible';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const recipientKindLabel = (kind: NeedGrantRecipientKind): string =>
  NEED_GRANT_RECIPIENTS.find((item) => item.key === kind)?.label ?? kind;

const purposeLabel = (purpose: NeedGrantPurpose): string =>
  NEED_GRANT_PURPOSES.find((item) => item.key === purpose)?.label ?? purpose;

const scopeLabel = (scope: NeedGrantScope): string =>
  NEED_GRANT_SCOPES.find((item) => item.key === scope)?.label ?? scope;

function Choice({
  selected,
  label,
  detail,
  disabled,
  onPress,
}: {
  selected: boolean;
  label: string;
  detail?: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="radio"
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 bg-papel-crudo px-4 py-3 ${disabled ? 'opacity-35' : ''}`}
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? CIAN : TINTA,
      }}
    >
      <Text className="font-archivo-bold text-xs text-tinta">{label}</Text>
      {detail && <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{detail}</Text>}
    </Pressable97>
  );
}

export function NeedAccessGrantPanel({ need }: { need: CivicNeedRow }) {
  const router = useRouter();
  const [, setRefreshToken] = useState(0);
  const [recipientKind, setRecipientKind] = useState<NeedGrantRecipientKind>('circle');
  const [recipientLabel, setRecipientLabel] = useState('');
  const [recipientReference, setRecipientReference] = useState('');
  const [recipientEntryMode, setRecipientEntryMode] = useState<'verified' | 'manual'>('manual');
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [purpose, setPurpose] = useState<NeedGrantPurpose>('assess_support');
  const [scope, setScope] = useState<NeedGrantScope>('essentials');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState<
    | 'create'
    | 'deliver'
    | 'revoke'
    | 'coordination_refresh'
    | 'coordination_decide'
    | 'execution_refresh'
    | 'execution_event'
    | null
  >(null);
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revocationReason, setRevocationReason] = useState<NeedGrantRevocationReason>('custodian_decision');
  const [hasCommunitySession, setHasCommunitySession] = useState<boolean | null>(null);
  const [communityUserId, setCommunityUserId] = useState<number | null>(null);
  const [eligibleCircles, setEligibleCircles] = useState<CircleSummary[]>([]);
  const [circlesLoading, setCirclesLoading] = useState(true);
  const [circlesUnavailable, setCirclesUnavailable] = useState(false);
  const [coordinationDecision, setCoordinationDecision] = useState<'accept' | 'decline' | null>(null);
  const [coordinationObservedAt, setCoordinationObservedAt] = useState(Number.POSITIVE_INFINITY);
  const [historyCoordinationBusyId, setHistoryCoordinationBusyId] = useState<string | null>(null);
  const [executionErrors, setExecutionErrors] = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    let mounted = true;
    setCoordinationObservedAt(Date.now());
    setHasCommunitySession(null);
    setCommunityUserId(null);
    setEligibleCircles([]);
    setExecutionErrors({});

    const loadRemoteRecipients = async () => {
      setCirclesLoading(true);
      setCirclesUnavailable(false);
      try {
        const session = await getCommunitySession();
        if (!mounted) return;
        setHasCommunitySession(Boolean(session));
        setCommunityUserId(session?.user.id ?? null);

        if (!CIVIC_API_URL) {
          setEligibleCircles([]);
          return;
        }

        const circles = await loadCircles(session?.user.id);
        if (!mounted) return;
        const completionSession = await getCommunitySession();
        if (!mounted) return;
        if ((completionSession?.user.id ?? null) !== (session?.user.id ?? null)) {
          setHasCommunitySession(Boolean(completionSession));
          setCommunityUserId(completionSession?.user.id ?? null);
          setEligibleCircles([]);
          return;
        }
        setEligibleCircles(circles.filter((circle) =>
          circle.isMember && (circle.kind === 'celula' || circle.isPrivate === true)));
      } catch {
        if (!mounted) return;
        // Una falla de red al listar círculos no equivale a perder la sesión.
        // Releer storage conserva la cuenta válida sin inventar membresías.
        try {
          const latestSession = await getCommunitySession();
          if (!mounted) return;
          setHasCommunitySession(Boolean(latestSession));
          setCommunityUserId(latestSession?.user.id ?? null);
        } catch {
          // Storage incierto: mantener el estado de sesión desconocido y fallar
          // cerrado sólo para la elegibilidad remota.
        }
        setEligibleCircles([]);
        setCirclesUnavailable(true);
      } finally {
        if (mounted) setCirclesLoading(false);
      }
    };

    void loadRemoteRecipients();
    return () => { mounted = false; };
  }, []));

  const grants = needAccessGrantsForNeed(need.id);
  const active = grants.find((grant) => needGrantStatusAt(grant) === 'active') ?? null;
  const history = grants.filter((grant) => needGrantStatusAt(grant) !== 'active');
  const safeAreaAvailable = ['500m', 'neighborhood', 'city'].includes(need.publicPrecision)
    && need.publicLat != null
    && need.publicLng != null;
  const canGrant = recipientLabel.trim().length >= 2
    && recipientReference.trim().length >= 1
    && authorized
    && !active
    && !busy;
  const activeCircleId = active ? verifiedCircleIdFromKey(active.recipientKey) : null;
  const activeCircleIsEligible = activeCircleId != null
    && eligibleCircles.some((circle) => circle.id === activeCircleId);
  const activeDelivery = active ? DELIVERY_STATUS[active.deliveryStatus] : null;
  const activeBoundToCommunityAccount = Boolean(
    active
    && communityUserId != null
    && active.remoteGrantorUserId === communityUserId,
  );
  const deliveryEligible = Boolean(
    active
    && activeCircleId != null
    && activeCircleIsEligible
    && hasCommunitySession
    && CIVIC_API_URL
    && (active.remoteGrantorUserId == null || active.remoteGrantorUserId === communityUserId)
    && (
      active.deliveryStatus === 'local'
      || active.deliveryStatus === 'delivering'
      || active.deliveryStatus === 'failed'
      || active.deliveryStatus === 'delivered'
    ),
  );
  const canDeliver = deliveryEligible && !busy;
  const sameCommunityUser = async (expectedUserId: number): Promise<boolean> =>
    (await getCommunitySession())?.user.id === expectedUserId;
  const hasCoordinationSnapshot = Boolean(
    activeBoundToCommunityAccount
    && active?.remoteCoordinationProposalId
    && active.remoteCoordinationState
    && active.remoteCoordinationCreatedAt
    && active.remoteCoordinationExpiresAt
    && active.remoteCoordinationRefreshedAt,
  );
  const coordinationStillInTime = Boolean(
    active?.remoteCoordinationExpiresAt
    && Date.parse(active.remoteCoordinationExpiresAt) > coordinationObservedAt,
  );
  const coordinationActionable = Boolean(
    active?.remoteCoordinationState === 'proposed'
    && hasCoordinationSnapshot
    && coordinationStillInTime
    && active?.deliveryStatus === 'delivered'
    && hasCommunitySession === true
    && Boolean(CIVIC_API_URL)
  );
  const canRefreshCoordination = Boolean(
    active
    && activeBoundToCommunityAccount
    && active.deliveryStatus === 'delivered'
    && hasCommunitySession
    && CIVIC_API_URL
    && (active.remoteResponseDisposition === 'support_available' || hasCoordinationSnapshot)
    && !busy,
  );
  const coordinationPresentation = active?.remoteCoordinationState
    ? COORDINATION_PRESENTATION[active.remoteCoordinationState]
    : null;
  const coordinationCapacity = active?.remoteCoordinationQuantity != null
    && active.remoteCoordinationUnit != null
    ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(active.remoteCoordinationQuantity)} ${RESPONSE_UNIT_LABEL[active.remoteCoordinationUnit]}`
    : 'capacidad sin cantidad declarada';
  let executionSnapshot: CustodyExecutionSnapshot | null = null;
  if (active && activeBoundToCommunityAccount) {
    try {
      executionSnapshot = cachedCustodyExecutionForGrant(active);
    } catch {
      executionSnapshot = null;
    }
  }
  let pendingExecutions: Record<string, PendingCustodyExecutionIntent> = {};
  let executionIntentIncidents: CustodyExecutionIntentIncident[] = [];
  let lockedExecutionProposalIds = new Set<string>();
  if (communityUserId != null) {
    try {
      const inventory = loadCustodyExecutionIntentInventory(communityUserId);
      pendingExecutions = Object.fromEntries(
        inventory.intents.map((intent) => [intent.proposalId, intent]),
      );
      executionIntentIncidents = inventory.incidents;
      lockedExecutionProposalIds = new Set(inventory.lockedProposalIds);
    } catch {
      pendingExecutions = {};
      executionIntentIncidents = [];
      lockedExecutionProposalIds = new Set();
    }
  }
  const pendingExecution = active?.remoteCoordinationProposalId && activeBoundToCommunityAccount
    ? pendingExecutions[active.remoteCoordinationProposalId] ?? null
    : null;
  const executionError = active?.remoteCoordinationProposalId
    ? executionErrors[active.remoteCoordinationProposalId]
      ?? (executionIntentIncidents.some(
        (incident) => incident.proposalId === active.remoteCoordinationProposalId,
      )
        ? 'La constancia pendiente local no supera su control de integridad. Esta ruta queda bloqueada; la app no borra, reconstruye ni reenvía el comando.'
        : null)
    : null;
  const executionControlsDisabled = busy
    || hasCommunitySession !== true
    || communityUserId == null
    || !CIVIC_API_URL;

  const chooseRecipientKind = (nextKind: NeedGrantRecipientKind) => {
    if (nextKind === recipientKind) return;
    setRecipientKind(nextKind);
    setRecipientEntryMode('manual');
    setSelectedCircleId(null);
    setRecipientLabel('');
    setRecipientReference('');
  };

  const chooseVerifiedCircle = (circle: CircleSummary) => {
    setRecipientKind('circle');
    setRecipientEntryMode('verified');
    setSelectedCircleId(circle.id);
    setRecipientLabel(circle.name);
    setRecipientReference(String(circle.id));
  };

  const chooseManualRecipient = () => {
    setRecipientEntryMode('manual');
    setSelectedCircleId(null);
    setRecipientLabel('');
    setRecipientReference('');
  };

  const createGrant = () => {
    if (!canGrant) return;
    setBusy(true);
    setBusyAction('create');
    setNotice(null);
    try {
      grantCustodiedNeedAccess({
        needId: need.id,
        recipientKind,
        recipientLabel,
        recipientReference,
        purpose,
        scope,
        expiresInDays,
      });
      setRefreshToken((value) => value + 1);
      setAuthorized(false);
      setNotice({
        message: 'Permiso local registrado. Todavía no se publicó ni se entregó ningún dato; si el círculo es verificable, el próximo paso será entregarlo de forma explícita.',
        error: false,
      });
      haptic.celebrate();
    } catch (error) {
      setNotice({ message: grantErrorMessage(error), error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const deliver = async () => {
    if (!active || !canDeliver || communityUserId == null) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('deliver');
    setNotice(null);
    try {
      let updated = await deliverCustodiedNeedAccess({
        grantId: active.id,
        expectedUserId,
      });
      let coordinationCheckFailed = false;
      if (
        updated.deliveryStatus === 'delivered'
        && needGrantStatusAt(updated) === 'active'
        && updated.remoteResponseDisposition === 'support_available'
      ) {
        try {
          updated = await refreshCustodyCoordinationStatus(updated.id, expectedUserId);
        } catch {
          coordinationCheckFailed = true;
        }
      }
      if (!(await sameCommunityUser(expectedUserId))) return;
      setRefreshToken((value) => value + 1);
      const updatedStatus = needGrantStatusAt(updated);
      if (updatedStatus === 'revoked' && updated.deliveryStatus === 'revoked_remote') {
        setNotice({
          message: 'La red confirmó que este permiso fue cerrado. El contrato no revela si lo retiró el círculo u otro dispositivo de tu cuenta; la historia local conserva cuándo se observó.',
          error: false,
        });
        haptic.send();
      } else if (updatedStatus === 'expired') {
        setNotice({
          message: 'La red confirmó que el permiso ya venció. No sigue disponible en la bandeja.',
          error: false,
        });
      } else if (updated.deliveryStatus === 'delivered') {
        setNotice({
          message: coordinationCheckFailed
            ? 'Capacidad comprobada; la propuesta privada todavía no pudo verificarse. La respuesta válida se conserva y podés reintentar la consulta específica.'
            : updated.remoteCoordinationState === 'proposed'
              ? 'Capacidad y propuesta comprobadas. Podés aceptar o no abrir la coordinación; todavía no hubo reserva, contacto, entrega ni resolución.'
              : updated.remoteCoordinationState === 'accepted'
                ? 'Estado comprobado: existe un acuerdo privado para coordinar. No prueba reserva, contacto, entrega ni resolución.'
                : updated.remoteCoordinationState === 'declined'
                  ? 'Estado comprobado: no hubo acuerdo de coordinación. Esto no juzga a la persona ni la validez de su necesidad.'
                  : updated.remoteCoordinationState === 'expired'
                    ? 'Estado comprobado: la propuesta venció sin inferir rechazo, contacto, entrega ni resolución.'
                    : updated.remoteCoordinationState === 'closed'
                      ? 'Estado comprobado: la coordinación quedó cerrada junto con el permiso. Esto no demuestra resolución.'
                      : updated.remoteResponseDisposition === 'support_available'
                        ? 'El círculo declaró capacidad disponible y todavía no hay una propuesta comprobada. No hubo reserva, contacto, entrega ni resolución.'
            : updated.remoteResponseDisposition === 'assessing'
              ? 'El círculo aceptó evaluar el pedido. Todavía no declaró capacidad ni asumió una entrega.'
              : active.deliveryStatus === 'delivered'
                ? 'Estado comprobado: el permiso sigue activo en la red y todavía no tiene respuesta.'
                : 'Entrega confirmada. El círculo recibió únicamente la proyección mínima autorizada.',
          error: false,
        });
        haptic.celebrate();
      } else {
        setNotice({
          message: 'La entrega todavía no fue confirmada. El permiso conserva su estado auditable.',
          error: true,
        });
      }
    } catch (error) {
      setRefreshToken((value) => value + 1);
      setNotice({ message: needGrantDeliveryErrorMessage(error), error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const revoke = async () => {
    if (!active || busy) return;
    setBusy(true);
    setBusyAction('revoke');
    setNotice(null);
    try {
      const updated = await revokeCustodiedNeedAccessEverywhere({
        grantId: active.id,
        reason: revocationReason,
      });
      setRefreshToken((value) => value + 1);
      if (needGrantStatusAt(updated) === 'revoked') {
        setRevoking(false);
        setNotice({
          message: updated.deliveryStatus === 'revoked_remote'
            ? 'Revocación confirmada por la red. La historia queda guardada para auditoría.'
            : 'Permiso local revocado. La historia queda guardada para auditoría local.',
          error: false,
        });
        haptic.send();
      } else {
        setNotice({
          message: 'La revocación remota todavía no fue confirmada. No presentamos el permiso como revocado; podés reintentar.',
          error: true,
        });
      }
    } catch (error) {
      setRefreshToken((value) => value + 1);
      setNotice({ message: needGrantDeliveryErrorMessage(error), error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const refreshCoordination = async () => {
    if (!active || !canRefreshCoordination || communityUserId == null) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('coordination_refresh');
    setNotice(null);
    setCoordinationDecision(null);
    try {
      const updated = await refreshCustodyCoordinationStatus(active.id, expectedUserId);
      if (!(await sameCommunityUser(expectedUserId))) return;
      let executionVerified = false;
      if (updated.remoteCoordinationState === 'accepted' && updated.remoteCoordinationProposalId) {
        try {
          await loadCustodyExecutionStatus(updated.remoteCoordinationProposalId, expectedUserId);
          executionVerified = true;
        } catch {
          // La propuesta conserva su propia constancia; no se degrada porque
          // el tramo de ejecución no haya respondido.
        }
      }
      setRefreshToken((value) => value + 1);
      setNotice({
        message: updated.remoteCoordinationState === 'proposed'
          ? 'Hay una propuesta privada para coordinar. Podés aceptarla o declinarla; ninguna opción prueba contacto, entrega o resolución.'
          : updated.remoteCoordinationState === 'accepted'
            ? executionVerified
              ? 'Acuerdo y Ruta de apoyo comprobados. Reserva, movimiento, recepción y resultado se registran por separado.'
              : 'Estado comprobado: existe un acuerdo, pero la ruta posterior no pudo verificarse. No inferimos reserva, contacto, entrega ni resolución.'
            : updated.remoteCoordinationState === 'declined'
              ? 'Estado comprobado: no hubo acuerdo de coordinación. Esto no es un rechazo a la persona ni a la legitimidad de su necesidad.'
              : updated.remoteCoordinationState === 'expired'
                ? 'Estado comprobado: la propuesta venció sin inferir rechazo, contacto, entrega ni resolución.'
                : updated.remoteCoordinationState === 'closed'
                  ? 'Estado comprobado: la coordinación quedó cerrada junto con el permiso. Esto no demuestra resolución.'
                  : 'Estado comprobado: todavía no hay una propuesta privada de coordinación.',
        error: false,
      });
      haptic.send();
    } catch (error) {
      setNotice({
        message: custodyCoordinationErrorMessage(error),
        error: true,
      });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const decideCoordination = async (decision: 'accept' | 'decline') => {
    if (!active?.remoteCoordinationProposalId || !coordinationActionable || busy || communityUserId == null) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('coordination_decide');
    setNotice(null);
    try {
      const updated = await decideCustodyCoordination(
        active.remoteCoordinationProposalId,
        decision,
        expectedUserId,
      );
      if (!(await sameCommunityUser(expectedUserId))) return;
      let executionVerified = false;
      if (updated.remoteCoordinationState === 'accepted' && updated.remoteCoordinationProposalId) {
        try {
          await loadCustodyExecutionStatus(updated.remoteCoordinationProposalId, expectedUserId);
          executionVerified = true;
        } catch {
          // El acuerdo ya tiene constancia propia. Una falla del tramo siguiente
          // no lo revierte ni inventa una ruta visible.
        }
      }
      setRefreshToken((value) => value + 1);
      setCoordinationDecision(null);
      setNotice({
        message: updated.remoteCoordinationState === 'accepted'
          ? executionVerified
            ? 'Acuerdo privado confirmado. La Ruta de apoyo ya está lista para separar reserva, movimiento, recepción y resultado.'
            : 'Acuerdo privado confirmado. La ruta posterior todavía no pudo verificarse; no inferimos reserva, contacto, entrega ni resolución.'
          : 'Constancia confirmada: no hubo acuerdo de coordinación. Esto no juzga a la persona ni la validez de su necesidad.',
        error: false,
      });
      haptic.send();
    } catch (error) {
      setNotice({
        message: custodyCoordinationErrorMessage(error),
        error: true,
      });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const setExecutionErrorFor = (proposalId: string, message: string | null) => {
    setExecutionErrors((current) => {
      if (message) return { ...current, [proposalId]: message };
      if (!(proposalId in current)) return current;
      const next = { ...current };
      delete next[proposalId];
      return next;
    });
  };

  const refreshExecutionFor = async (proposalId: string, boundGrantorUserId: number | null) => {
    if (busy || communityUserId == null || boundGrantorUserId !== communityUserId) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('execution_refresh');
    setExecutionErrorFor(proposalId, null);
    try {
      const status = await loadCustodyExecutionStatus(proposalId, expectedUserId);
      if (!(await sameCommunityUser(expectedUserId))) return;
      setRefreshToken((value) => value + 1);
      setNotice({
        message: status.execution.state === 'awaiting_reservation'
          ? 'Ruta comprobada: hay acuerdo, pero todavía no existe una reserva operativa declarada.'
          : 'Ruta privada actualizada. Cada declaración, recepción y resultado permanece separado.',
        error: false,
      });
    } catch (error) {
      if (!(await sameCommunityUser(expectedUserId))) return;
      const message = custodyExecutionErrorMessage(error);
      setExecutionErrorFor(proposalId, message);
      setNotice({ message, error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const runGrantorExecutionActionFor = async (
    proposalId: string,
    snapshot: CustodyExecutionSnapshot,
    action: CustodyExecutionActionDraft,
    boundGrantorUserId: number | null,
  ) => {
    if (busy || communityUserId == null || boundGrantorUserId !== communityUserId) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('execution_event');
    setExecutionErrorFor(proposalId, null);
    try {
      const command = {
        proposalId,
        ...action,
        snapshot,
      } as CustodyExecutionEventCommand;
      const receipt = await submitCustodyExecutionEvent(command, expectedUserId);
      if (!(await sameCommunityUser(expectedUserId))) return;
      const message = grantorExecutionMessage(receipt);
      setRefreshToken((value) => value + 1);
      setExecutionErrorFor(proposalId, receipt.status === 'rejected' ? message : null);
      setNotice({ message, error: receipt.status === 'rejected' });
      if (receipt.status !== 'rejected') haptic.send();
    } catch (error) {
      if (!(await sameCommunityUser(expectedUserId))) return;
      const message = custodyExecutionErrorMessage(error);
      setRefreshToken((value) => value + 1);
      setExecutionErrorFor(proposalId, message);
      setNotice({ message, error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const retryGrantorExecutionActionFor = async (proposalId: string, boundGrantorUserId: number | null) => {
    if (busy || communityUserId == null || boundGrantorUserId !== communityUserId) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('execution_event');
    setExecutionErrorFor(proposalId, null);
    try {
      const receipt = await retryCustodyExecutionEvent(proposalId, expectedUserId);
      if (!(await sameCommunityUser(expectedUserId))) return;
      const message = grantorExecutionMessage(receipt);
      setRefreshToken((value) => value + 1);
      setExecutionErrorFor(proposalId, receipt.status === 'rejected' ? message : null);
      setNotice({ message, error: receipt.status === 'rejected' });
      if (receipt.status !== 'rejected') haptic.send();
    } catch (error) {
      if (!(await sameCommunityUser(expectedUserId))) return;
      const message = custodyExecutionErrorMessage(error);
      setRefreshToken((value) => value + 1);
      setExecutionErrorFor(proposalId, message);
      setNotice({ message, error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  };

  const reconcileHistoricalCoordination = async (grant: CivicNeedAccessGrantRow) => {
    if (
      !grant.remoteCoordinationProposalId
      || busy
      || historyCoordinationBusyId
      || communityUserId == null
      || grant.remoteGrantorUserId !== communityUserId
    ) return;
    const expectedUserId = communityUserId;
    setBusy(true);
    setBusyAction('coordination_refresh');
    setHistoryCoordinationBusyId(grant.id);
    setNotice(null);
    try {
      const updated = grant.remoteCoordinationTerminalDecision
        ? await decideCustodyCoordination(
          grant.remoteCoordinationProposalId,
          grant.remoteCoordinationTerminalDecision,
          expectedUserId,
        )
        : await refreshCustodyCoordinationStatus(grant.id, expectedUserId);
      if (!(await sameCommunityUser(expectedUserId))) return;
      setRefreshToken((value) => value + 1);
      setNotice({
        message: updated.remoteCoordinationTerminalDecision
          ? `${COORDINATION_DECISION_LABEL[updated.remoteCoordinationTerminalDecision]}. La constancia histórica fue verificada; el estado operativo actual sigue siendo ${updated.remoteCoordinationState === 'expired' ? 'vencido' : 'cerrado'}.`
          : 'La red confirmó que no existe una decisión terminal registrada. El permiso sigue cerrado o vencido.',
        error: false,
      });
      haptic.send();
    } catch (error) {
      setNotice({ message: custodyCoordinationErrorMessage(error), error: true });
    } finally {
      setBusy(false);
      setBusyAction(null);
      setHistoryCoordinationBusyId(null);
    }
  };

  return (
    <PapelCard className="mt-5 overflow-hidden p-0">
      <View className="border-b border-tinta bg-papel-crudo p-5">
        <Kicker style={{ color: CIAN }}>Permiso destinatario</Kicker>
        <Text className="mt-1 font-archivo-bold text-xl leading-7 text-tinta">Autorizar sin publicar</Text>
        <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">
          Este permiso prepara una proyección mínima para un solo círculo u organización. Al registrarlo, la app lo guarda localmente y no lo sincroniza de forma automática: no entra al feed, no envía el relato y todavía no entrega datos. Una entrega posterior exige una acción explícita. El almacenamiento local aún no tiene cifrado propio de la app.
        </Text>
      </View>

      {notice && (
        <View
          accessibilityLiveRegion="polite"
          className="mx-5 mt-5 flex-row items-start gap-3 border bg-papel-crudo p-4"
          style={{ borderColor: notice.error ? ROJO_SELLO : VERDE }}
        >
          <Text className="flex-1 font-archivo text-[11px] leading-5 text-tinta-90">{notice.message}</Text>
        </View>
      )}

      {executionIntentIncidents.length > 0 && (
        <View accessibilityLiveRegion="assertive" className="mx-5 mt-5 border border-sello bg-papel-crudo p-4">
          <Text className="font-archivo-bold text-xs text-sello">Constancia local en cuarentena</Text>
          <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">
            Una operación pendiente no puede asociarse de forma segura con una ruta. La app la conserva sin enviarla y no intenta reconstruirla. Conservá este dispositivo y evitá borrar sus datos hasta una recuperación asistida.
          </Text>
        </View>
      )}

      {active ? (
        <View className="p-5">
          <View className="border border-verde bg-papel-crudo p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="font-archivo-bold text-xs text-verde">Permiso vigente</Text>
              </View>
              <Text
                className="font-space text-[9px] uppercase tracking-[1.3px]"
                style={{ color: activeDelivery?.color ?? CIAN }}
              >
                {activeDelivery?.label ?? 'estado local'}
              </Text>
            </View>
            <Text className="mt-4 font-archivo-bold text-xl text-tinta">{active.recipientLabel}</Text>
            <Text className="mt-1 font-space text-[10px] text-tinta-50">{recipientKindLabel(active.recipientKind)} · {active.recipientKey}</Text>
            <View className="mt-4 gap-2">
              <Text className="font-archivo text-[11px] leading-5 text-tinta-90">Propósito: {purposeLabel(active.purpose)}</Text>
              <Text className="font-archivo text-[11px] leading-5 text-tinta-90">Alcance: {scopeLabel(active.scope)}</Text>
              <Text className="font-archivo text-[11px] leading-5 text-tinta-90">Vence: {displayDate(active.expiresAt)}</Text>
            </View>
            <View className="mt-4 border-t border-bordeSuave pt-3">
              <Text className="font-archivo text-[10px] leading-5 text-tinta-75">{activeDelivery?.detail}</Text>
              {active.deliveryStatus === 'delivered' && active.deliveredAt && (
                <Text className="mt-1 font-archivo text-[10px] leading-5 text-verde">
                  Confirmado {displayDate(active.deliveredAt)} · círculo #{active.remoteRecipientCircleId ?? activeCircleId}
                </Text>
              )}
              {active.deliveryStatus === 'revocation_pending' && active.deliveryLastAttemptAt && (
                <Text className="mt-1 font-archivo text-[10px] leading-5 text-ambar">
                  Último intento {displayDate(active.deliveryLastAttemptAt)}
                </Text>
              )}
            </View>
          </View>

          <View className="mt-4 border border-bordeSuave bg-papel-presionado p-4">
            <Text className="font-archivo-bold text-xs text-tinta-90">Lista permitida</Text>
            <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-50">
              Categoría, urgencia, vigencia{need.quantity != null ? ' y cantidad' : ''}{active.scope === 'essentials_and_safe_area' ? '; además, zona aproximada sin nombre' : ''}. Una unidad no reconocida se omite. Nunca: relato, custodio, contacto, firma, etiqueta del lugar o punto exacto.
            </Text>
          </View>

          {activeBoundToCommunityAccount && active.remoteResponseDisposition && (
            <View
              className="mt-4 border bg-papel-crudo p-4"
              style={{
                borderColor: active.remoteResponseDisposition === 'support_available' ? VERDE : AMBAR_PT,
              }}
            >
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  <Text className="font-archivo-bold text-xs text-tinta-90">
                    {active.remoteResponseDisposition === 'support_available'
                      ? 'El círculo declaró capacidad'
                      : 'El círculo está evaluando'}
                  </Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                    {active.remoteResponseDisposition === 'support_available'
                      ? active.remoteResponseQuantity != null
                        ? `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(active.remoteResponseQuantity)} ${RESPONSE_UNIT_LABEL[active.remoteResponseUnit ?? ''] ?? 'unidades controladas'} disponibles para coordinar. Esto aún no prueba entrega ni resolución.`
                        : 'Hay capacidad para coordinar, sin cantidad declarada. Esto aún no prueba entrega ni resolución.'
                      : 'Aceptar la evaluación no promete capacidad, contacto ni respuesta positiva.'}
                  </Text>
                  {active.remoteResponseAt && (
                    <Text className="mt-1 font-space text-[9px] text-tinta-50">Respuesta {displayDate(active.remoteResponseAt)}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {hasCoordinationSnapshot && active.remoteCoordinationState && coordinationPresentation && (
            <View
              accessibilityLiveRegion="polite"
              className="mt-4 border bg-papel-crudo p-4"
              style={{ borderColor: coordinationPresentation.color }}
            >
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  <Text className="font-archivo-bold text-xs text-tinta-90">{coordinationPresentation.title}</Text>
                  <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{coordinationPresentation.detail}</Text>
                  <Text className="mt-3 font-archivo text-[10px] leading-5 text-tinta-50">
                    Capacidad incluida: {coordinationCapacity}.
                  </Text>
                  <Text className="mt-1 font-space text-[9px] text-tinta-50">
                    Vence {displayDate(active.remoteCoordinationExpiresAt!)}
                  </Text>
                  {active.remoteCoordinationTerminalDecision && active.remoteCoordinationDecidedAt && (
                    <View className="mt-3 border border-bordeSuave bg-papel-presionado p-3">
                      <Text className="font-archivo-bold text-[10px] text-tinta-90">Decisión terminal conservada</Text>
                      <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-75">
                        {COORDINATION_DECISION_LABEL[active.remoteCoordinationTerminalDecision]}.
                        {active.remoteCoordinationState === 'closed' || active.remoteCoordinationState === 'expired'
                          ? ' El cierre o vencimiento posterior prevalece sólo sobre el estado operativo; no borra la decisión histórica.'
                          : ''}
                      </Text>
                      <Text className="mt-1 font-space text-[9px] text-tinta-50">
                        Registrada {displayDate(active.remoteCoordinationDecidedAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {active.remoteCoordinationState === 'proposed' && !coordinationStillInTime && (
                <View className="mt-4 border border-ambar bg-papel-crudo p-3">
                  <Text className="font-archivo text-[10px] leading-5 text-ambar">
                    El reloj local alcanzó el vencimiento. Comprobá la red antes de decidir; no cambiamos el estado sin constancia.
                  </Text>
                </View>
              )}

              {active.remoteCoordinationState === 'proposed'
                && coordinationStillInTime
                && !coordinationActionable
                && hasCommunitySession !== null
                && (
                  <View className="mt-4 border border-cian bg-papel-crudo p-3">
                    <Text className="font-archivo text-[10px] leading-5 text-cian">
                      {hasCommunitySession === false || !CIVIC_API_URL
                        ? 'Para decidir, volvé a vincular la misma cuenta y este dispositivo. La propuesta sigue visible, pero no intentamos una acción sin esa autoridad.'
                        : 'Primero comprobá que el permiso remoto sigue entregado y operativo. La propuesta permanece visible sin habilitar una decisión insegura.'}
                    </Text>
                  </View>
                )}

              {coordinationActionable && (
                coordinationDecision ? (
                  <View className="mt-4 border border-bordeSuave bg-papel-presionado p-4">
                    <Text className="font-archivo-bold text-xs text-tinta-90">
                      {coordinationDecision === 'accept'
                        ? '¿Aceptar intentar esta coordinación?'
                        : '¿Confirmar que no querés abrir esta coordinación?'}
                    </Text>
                    <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">
                      {coordinationDecision === 'accept'
                        ? 'Tu acuerdo no reserva recursos, comparte contacto ni confirma entrega o resolución.'
                        : 'No se enviará un motivo. Esta decisión no cuestiona tu necesidad y no se presentará como rechazo a tu persona.'}
                    </Text>
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel="Volver sin decidir la propuesta"
                        disabled={busy}
                        onPress={() => setCoordinationDecision(null)}
                        className="min-h-11 items-center justify-center border border-bordeSuave bg-papel-crudo px-4"
                      >
                        <Text className="font-archivo-bold text-xs text-tinta-90">Volver</Text>
                      </Pressable97>
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel={coordinationDecision === 'accept'
                          ? 'Confirmar acuerdo para coordinar'
                          : 'Confirmar que no hay acuerdo de coordinación'}
                        accessibilityState={{ busy: busyAction === 'coordination_decide', disabled: busy }}
                        disabled={busy}
                        onPress={() => { void decideCoordination(coordinationDecision); }}
                        className="min-h-11 items-center justify-center px-4"
                        style={{
                          backgroundColor: coordinationDecision === 'accept' ? VERDE : ROJO_SELLO,
                        }}
                      >
                        <Text className="font-archivo-bold text-xs text-papel">
                          {busyAction === 'coordination_decide'
                            ? 'Confirmando…'
                            : coordinationDecision === 'accept' ? 'Confirmar acuerdo' : 'Confirmar sin acuerdo'}
                        </Text>
                      </Pressable97>
                    </View>
                  </View>
                ) : (
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel="Aceptar propuesta para intentar coordinar"
                      accessibilityHint="Abre una segunda confirmación; no registra entrega ni resolución"
                      disabled={busy}
                      onPress={() => setCoordinationDecision('accept')}
                      className="min-h-11 items-center justify-center border border-verde bg-papel-crudo px-4"
                    >
                      <Text className="font-archivo-bold text-xs text-verde">Aceptar coordinar</Text>
                    </Pressable97>
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel="Declinar propuesta de coordinación"
                      accessibilityHint="Abre una segunda confirmación y no solicita un motivo"
                      disabled={busy}
                      onPress={() => setCoordinationDecision('decline')}
                      className="min-h-11 items-center justify-center border border-sello bg-papel-crudo px-4"
                    >
                      <Text className="font-archivo-bold text-xs text-sello">No abrir coordinación</Text>
                    </Pressable97>
                  </View>
                )
              )}
            </View>
          )}

          {active.remoteCoordinationTerminalDecision === 'accept' && executionSnapshot && (
            <CustodyExecutionCard
              execution={executionSnapshot.execution}
              role="grantor"
              busy={busy}
              refreshAtDeadline
              disabled={
                (executionControlsDisabled && !busy)
                || (
                  lockedExecutionProposalIds.has(executionSnapshot.execution.proposalId)
                  && !pendingExecution
                )
              }
              pendingEventType={pendingExecution?.type ?? null}
              error={executionError}
              onAction={(action) =>
                runGrantorExecutionActionFor(
                  executionSnapshot.execution.proposalId,
                  executionSnapshot,
                  action,
                  active.remoteGrantorUserId,
                )}
              onRefresh={() => {
                void refreshExecutionFor(
                  executionSnapshot.execution.proposalId,
                  active.remoteGrantorUserId,
                );
              }}
              onRetryPending={() => {
                void retryGrantorExecutionActionFor(
                  executionSnapshot.execution.proposalId,
                  active.remoteGrantorUserId,
                );
              }}
            />
          )}

          {active.remoteCoordinationTerminalDecision === 'accept'
            && !executionSnapshot
            && active.remoteCoordinationProposalId
            && activeBoundToCommunityAccount
            && (
              <View className="mt-4 border border-violeta bg-papel-crudo p-4">
                <Text className="font-archivo-bold text-xs text-violeta">Abrir la Ruta de apoyo</Text>
                <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">
                  El acuerdo ya existe. Comprobá el tramo protegido que separa reserva, movimiento, recepción y resultado.
                </Text>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Comprobar ruta privada de apoyo"
                  accessibilityState={{ busy: busyAction === 'execution_refresh', disabled: busy }}
                  disabled={busy}
                  onPress={() => {
                    void refreshExecutionFor(
                      active.remoteCoordinationProposalId!,
                      active.remoteGrantorUserId,
                    );
                  }}
                  className="mt-3 min-h-11 self-start items-center justify-center border border-violeta bg-papel-crudo px-4"
                >
                  <Text className="font-archivo-bold text-xs text-violeta">
                    {busyAction === 'execution_refresh' ? 'Comprobando…' : 'Comprobar ruta'}
                  </Text>
                </Pressable97>
                {executionError && (
                  <Text accessibilityLiveRegion="assertive" className="mt-3 font-archivo text-[10px] leading-5 text-ambar">
                    {executionError}
                  </Text>
                )}
              </View>
            )}

          {(active.remoteResponseDisposition === 'support_available' || hasCoordinationSnapshot) && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Comprobar propuesta privada de coordinación"
              accessibilityHint="Consulta el estado mediante el canal custodial y conserva el snapshot sólo si la constancia es válida"
              disabled={!canRefreshCoordination}
              onPress={() => { void refreshCoordination(); }}
              className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 border border-violeta bg-papel-crudo px-5 ${canRefreshCoordination ? '' : 'opacity-40'}`}
            >
              <Text className="font-archivo-bold text-xs text-violeta">
                {busyAction === 'coordination_refresh' ? 'Comprobando propuesta…' : 'Comprobar propuesta privada'}
              </Text>
            </Pressable97>
          )}

          {deliveryEligible && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={active.deliveryStatus === 'delivered'
                ? `Comprobar estado del permiso para ${active.recipientLabel}`
                : `Entregar permiso al círculo ${active.recipientLabel}`}
              accessibilityHint={active.deliveryStatus === 'delivered'
                ? 'Consulta mediante replay idempotente si el permiso sigue activo, venció o fue retirado'
                : 'Envía sólo la proyección mínima autorizada y espera confirmación de la red'}
              disabled={!canDeliver}
              onPress={() => { void deliver(); }}
              className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 border border-cian bg-papel-crudo px-5 ${busy ? 'opacity-40' : ''}`}
            >
              <Text className="font-archivo-bold text-xs text-cian">
                {busyAction === 'deliver'
                  ? active.deliveryStatus === 'delivered' ? 'Comprobando…' : 'Entregando…'
                  : active.deliveryStatus === 'delivered' ? 'Comprobar estado en red' : 'Entregar permiso al círculo'}
              </Text>
            </Pressable97>
          )}

          {active.recipientKind === 'circle' && hasCommunitySession === false && (
            <View className="mt-4 border border-cian bg-papel-crudo p-4">
              <Text className="font-archivo-bold text-xs text-cian">Falta vincular una cuenta</Text>
              <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-50">
                Para entregar, vinculá tu cuenta y verificá que pertenecés al círculo destinatario. El permiso permanece sólo local mientras tanto.
              </Text>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Ir a Círculos para vincular una cuenta"
                onPress={() => router.push('/circulos')}
                className="mt-3 min-h-11 items-center justify-center border border-cian bg-papel-crudo px-4"
              >
                <Text className="font-archivo-bold text-xs text-cian">Ir a Círculos</Text>
              </Pressable97>
            </View>
          )}

          {active.recipientKind === 'circle'
            && hasCommunitySession
            && CIVIC_API_URL
            && !circlesLoading
            && activeCircleId != null
            && !activeCircleIsEligible
            && (
              <View className="mt-4 border border-ambar bg-papel-crudo p-4">
                <Text className="font-archivo text-[10px] leading-5 text-ambar">
                  Este identificador no corresponde a un círculo custodio del que seas miembro. El permiso queda como constancia local y no habilita entrega.
                </Text>
              </View>
            )}

          {active.recipientKind === 'organization' && (
            <View className="mt-4 border border-bordeSuave bg-papel-presionado p-4">
              <Text className="font-archivo text-[10px] leading-5 text-tinta-50">
                Las organizaciones todavía no tienen un canal de identidad verificable. Este permiso es sólo una constancia local y no puede entregarse desde la app.
              </Text>
            </View>
          )}

          {!revoking ? (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={`Revocar permiso para ${active.recipientLabel}`}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => setRevoking(true)}
              className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 border border-sello bg-papel-crudo px-5 ${busy ? 'opacity-40' : ''}`}
            >
              <Text className="font-archivo-bold text-xs text-sello">Revocar permiso</Text>
            </Pressable97>
          ) : (
            <View className="mt-4 border border-sello bg-papel-crudo p-4">
              <Text className="font-archivo-bold text-sm text-sello">Revocación auditable</Text>
              <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                La app intentará retirar el permiso. Si ya fue entregado, seguirá figurando vigente hasta recibir una constancia remota válida; su acta no se borrará.
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {NEED_GRANT_REVOCATION_REASONS.map((item) => {
                  const selected = revocationReason === item.key;
                  return (
                    <Pressable97
                      key={item.key}
                      accessibilityRole="radio"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected }}
                      onPress={() => setRevocationReason(item.key)}
                      className="min-h-11 justify-center bg-papel-crudo px-3"
                      style={{
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? ROJO_SELLO : TINTA,
                      }}
                    >
                      <Text className="font-archivo-bold text-[10px] text-tinta">{item.label}</Text>
                    </Pressable97>
                  );
                })}
              </View>
              <View className="mt-4 flex-row gap-3">
                <Pressable97 accessibilityRole="button" accessibilityLabel="Conservar permiso" disabled={busy} onPress={() => setRevoking(false)} className="min-h-11 flex-1 items-center justify-center border border-bordeSuave bg-papel-crudo px-4">
                  <Text className="font-archivo-bold text-xs text-tinta-90">Conservar</Text>
                </Pressable97>
                <Pressable97 accessibilityRole="button" accessibilityLabel="Confirmar revocación" disabled={busy} onPress={() => { void revoke(); }} className={`min-h-11 flex-1 items-center justify-center bg-sello px-4 ${busy ? 'opacity-40' : ''}`}>
                  <Text className="font-archivo-bold text-xs text-papel">{busyAction === 'revoke' ? 'Revocando…' : 'Confirmar'}</Text>
                </Pressable97>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="p-5">
          <Text className="font-archivo-bold text-sm text-tinta-90">1. Destinatario concreto</Text>
          <View className="mt-3 flex-row gap-2">
            {NEED_GRANT_RECIPIENTS.map((item) => (
              <View key={item.key} className="flex-1">
                <Choice selected={recipientKind === item.key} label={item.label} detail={item.detail} onPress={() => chooseRecipientKind(item.key)} />
              </View>
            ))}
          </View>

          {recipientKind === 'circle' && (
            <View className="mt-4">
              <Text className="font-archivo text-[10px] uppercase tracking-[1.5px] text-cian">Círculos custodios verificados</Text>
              <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-50">
                Sólo un círculo del que seas miembro, y que sea célula o privado, puede recibir luego la proyección mínima.
              </Text>

              {circlesLoading ? (
                <View className="mt-3 border border-bordeSuave bg-papel-presionado p-4">
                  <Text accessibilityLiveRegion="polite" className="font-archivo text-[10px] text-tinta-50">Comprobando membresías…</Text>
                </View>
              ) : eligibleCircles.length > 0 ? (
                <View className="mt-3 gap-2">
                  {eligibleCircles.map((circle) => (
                    <Choice
                      key={circle.id}
                      selected={recipientEntryMode === 'verified' && selectedCircleId === circle.id}
                      label={circle.name}
                      detail={`Círculo #${circle.id} · membresía comprobada${circle.kind === 'celula' ? ' · célula' : ' · privado'}`}
                      onPress={() => chooseVerifiedCircle(circle)}
                    />
                  ))}
                </View>
              ) : hasCommunitySession === false ? (
                <View className="mt-3 border border-cian bg-papel-crudo p-4">
                  <Text className="font-archivo text-[10px] leading-5 text-tinta-75">
                    Vinculá una cuenta para comprobar tus círculos. Hasta entonces, cualquier referencia será sólo una constancia local.
                  </Text>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Ir a Círculos para vincular una cuenta"
                    onPress={() => router.push('/circulos')}
                    className="mt-3 min-h-11 items-center justify-center border border-cian bg-papel-crudo px-4"
                  >
                    <Text className="font-archivo-bold text-xs text-cian">Ir a Círculos</Text>
                  </Pressable97>
                </View>
              ) : (
                <View className="mt-3 border border-bordeSuave bg-papel-presionado p-4">
                  <Text className="font-archivo text-[10px] leading-5 text-tinta-50">
                    {!CIVIC_API_URL
                      ? 'La red no está configurada en esta instalación. Sólo podés registrar una constancia local.'
                      : circlesUnavailable
                        ? 'No pudimos comprobar tus círculos. No habilitamos entrega mientras la identidad no esté verificada.'
                        : 'No encontramos círculos custodios elegibles entre tus membresías.'}
                  </Text>
                </View>
              )}

              <View className="mt-3">
                <Choice
                  selected={recipientEntryMode === 'manual'}
                  label="Referencia manual · sólo local"
                  detail="Sirve como acta en este dispositivo. No habilita entrega por sí sola; una entrega futura exige que coincida con una membresía verificada."
                  onPress={chooseManualRecipient}
                />
              </View>
            </View>
          )}

          {(recipientKind === 'organization' || recipientEntryMode === 'manual') && (
            <View className="mt-3">
              {recipientKind === 'organization' && (
                <Text className="mb-3 font-archivo text-[10px] leading-5 text-tinta-50">
                  Las organizaciones aún no tienen un canal de identidad verificable. Este permiso quedará sólo local.
                </Text>
              )}
              <TextInput
                value={recipientLabel}
                onChangeText={(value) => {
                  setSelectedCircleId(null);
                  setRecipientEntryMode('manual');
                  setRecipientLabel(value);
                }}
                maxLength={80}
                placeholder="Nombre público, sin persona ni contacto"
                placeholderTextColor={TINTA_50}
                accessibilityLabel="Nombre público del destinatario local"
                className="min-h-12 border border-bordeSuave bg-papel-presionado px-4 font-archivo text-sm text-tinta"
              />
              <TextInput
                value={recipientReference}
                onChangeText={(value) => {
                  setSelectedCircleId(null);
                  setRecipientEntryMode('manual');
                  setRecipientReference(value);
                }}
                maxLength={64}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={recipientKind === 'circle' ? 'ID local, ej. circulo-sur' : 'ID local, ej. org-alimentos'}
                placeholderTextColor={TINTA_50}
                accessibilityLabel="Identificador local estable del destinatario"
                className="mt-3 min-h-12 border border-bordeSuave bg-papel-presionado px-4 font-space text-sm text-tinta"
              />
              <Text className="mt-2 font-archivo text-[10px] leading-4 text-tinta-50">
                El identificador separa nombres parecidos, pero no prueba identidad ni membresía. Sólo podrá entregarse si luego coincide con un círculo custodio verificado de tu cuenta.
              </Text>
            </View>
          )}

          <Text className="mt-7 font-archivo-bold text-sm text-tinta-90">2. Propósito</Text>
          <View className="mt-3 gap-2">
            {NEED_GRANT_PURPOSES.map((item) => (
              <Choice key={item.key} selected={purpose === item.key} label={item.label} detail={item.detail} onPress={() => setPurpose(item.key)} />
            ))}
          </View>

          <Text className="mt-7 font-archivo-bold text-sm text-tinta-90">3. Alcance</Text>
          <View className="mt-3 gap-2">
            {NEED_GRANT_SCOPES.map((item) => (
              <Choice
                key={item.key}
                selected={scope === item.key}
                label={item.label}
                detail={item.key === 'essentials_and_safe_area' && !safeAreaAvailable ? 'No disponible: falta una zona aproximada segura.' : item.detail}
                disabled={item.key === 'essentials_and_safe_area' && !safeAreaAvailable}
                onPress={() => setScope(item.key)}
              />
            ))}
          </View>

          <Text className="mt-7 font-archivo-bold text-sm text-tinta-90">4. Vencimiento</Text>
          <View className="mt-3 flex-row gap-2">
            {[3, 7, 14, 30].map((days) => {
              const selected = expiresInDays === days;
              return (
                <Pressable97
                  key={days}
                  accessibilityRole="radio"
                  accessibilityLabel={`${days} días`}
                  accessibilityState={{ selected }}
                  onPress={() => setExpiresInDays(days)}
                  className="min-h-11 flex-1 items-center justify-center bg-papel-crudo"
                  style={{ borderWidth: selected ? 2 : 1, borderColor: selected ? CIAN : TINTA }}
                >
                  <Text className="font-space text-[11px] text-tinta">{days}d</Text>
                </Pressable97>
              );
            })}
          </View>
          <Text className="mt-2 font-archivo text-[10px] leading-4 text-tinta-50">Si el pedido vence antes, el permiso se acorta automáticamente.</Text>

          <Pressable97
            accessibilityRole="checkbox"
            accessibilityLabel="Autorizar la proyección mínima para este destinatario"
            accessibilityState={{ checked: authorized }}
            onPress={() => setAuthorized((value) => !value)}
            className="mt-5 flex-row items-start gap-3 border border-tinta bg-papel-crudo p-4"
          >
            <View className={`mt-0.5 h-5 w-5 border border-tinta ${authorized ? 'bg-violeta' : 'bg-papel-presionado'}`} />
            <View className="flex-1">
              <Text className="font-archivo-bold text-xs text-tinta">Autorizo sólo esta proyección y este propósito</Text>
              <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-50">No autorizo el relato, custodia, contacto, firma, nombre del lugar ni punto exacto. Entiendo que esto registra permiso local, no una entrega.</Text>
            </View>
          </Pressable97>

          <View className="mt-6 items-center">
            <BotonTinta
              etiqueta="Registrar permiso local"
              onPress={createGrant}
              disabled={!canGrant}
              cargando={busyAction === 'create'}
            />
          </View>
        </View>
      )}

      {history.length > 0 && (
        <View className="border-t border-bordeSuave p-5">
          <Text className="font-archivo text-[10px] uppercase tracking-[2px] text-tinta-50">Historia de permisos</Text>
          <View className="mt-3 gap-2">
            {history.map((grant) => {
              const status = needGrantStatusAt(grant);
              const historicalBoundToCommunityAccount = Boolean(
                communityUserId != null
                && grant.remoteGrantorUserId === communityUserId,
              );
              let historicalExecution: CustodyExecutionSnapshot | null = null;
              if (historicalBoundToCommunityAccount) {
                try {
                  historicalExecution = cachedCustodyExecutionForGrant(grant);
                } catch {
                  historicalExecution = null;
                }
              }
              const historicalProposalId = grant.remoteCoordinationProposalId;
              const historicalPending = historicalProposalId
                ? pendingExecutions[historicalProposalId] ?? null
                : null;
              const historicalExecutionError = historicalProposalId
                ? executionErrors[historicalProposalId]
                  ?? (executionIntentIncidents.some(
                    (incident) => incident.proposalId === historicalProposalId,
                  )
                    ? 'La constancia pendiente local no supera su control de integridad. La ruta permanece bloqueada y la fila no fue borrada ni reenviada.'
                    : null)
                : null;
              return (
                <View key={grant.id} className="border border-bordeSuave bg-papel-presionado p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-archivo-bold text-xs text-tinta-90">{grant.recipientLabel}</Text>
                      <Text className="mt-1 font-space text-[9px] text-tinta-50">{grant.recipientKey}</Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="font-archivo-bold text-[9px] uppercase tracking-[1.2px]" style={{ color: status === 'revoked' ? ROJO_SELLO : AMBAR_PT }}>{STATUS_LABEL[status]}</Text>
                      <Text
                        className="font-space text-[8px] uppercase tracking-[1px]"
                        style={{ color: DELIVERY_STATUS[grant.deliveryStatus].color }}
                      >
                        {DELIVERY_STATUS[grant.deliveryStatus].label}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-3 font-archivo text-[10px] leading-4 text-tinta-50">Otorgado {displayDate(grant.grantedAt)} · {scopeLabel(grant.scope)}</Text>
                  {grant.deliveredAt && <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">Entregado {displayDate(grant.deliveredAt)}</Text>}
                  {grant.revokedAt && <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">Revocado {displayDate(grant.revokedAt)}</Text>}
                  {grant.remoteRevokedAt && <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">Confirmado en red {displayDate(grant.remoteRevokedAt)}</Text>}
                  {historicalBoundToCommunityAccount
                    && grant.remoteCoordinationProposalId
                    && grant.remoteCoordinationState && (
                    <View className="mt-3 border border-violeta bg-papel-crudo p-3">
                      <Text className="font-archivo-bold text-[10px] text-violeta">Coordinación privada · historia</Text>
                      <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-75">
                        Estado operativo observado: {COORDINATION_PRESENTATION[grant.remoteCoordinationState].title.toLocaleLowerCase('es-AR')}.
                      </Text>
                      {grant.remoteCoordinationTerminalDecision ? (
                        <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-90">
                          Decisión terminal: {COORDINATION_DECISION_LABEL[grant.remoteCoordinationTerminalDecision].toLocaleLowerCase('es-AR')}
                          {grant.remoteCoordinationDecidedAt ? ` · ${displayDate(grant.remoteCoordinationDecidedAt)}` : ''}.
                          {' '}El cierre o vencimiento no la convierte en entrega ni resolución.
                        </Text>
                      ) : (
                        <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-50">
                          No hay una decisión terminal verificada en esta copia local. No inferimos aceptación ni rechazo.
                        </Text>
                      )}
                      {hasCommunitySession === true && Boolean(CIVIC_API_URL) && (
                        <Pressable97
                          accessibilityRole="button"
                          accessibilityLabel={grant.remoteCoordinationTerminalDecision
                            ? 'Revalidar decisión histórica registrada'
                            : 'Comprobar decisión histórica en la red'}
                          accessibilityHint={grant.remoteCoordinationTerminalDecision
                            ? 'Repite exactamente la operación idempotente; no crea ni cambia una decisión'
                            : 'Consulta la constancia privada sin inventar una decisión local'}
                          accessibilityState={{
                            busy: historyCoordinationBusyId === grant.id,
                            disabled: busy,
                          }}
                          disabled={busy}
                          onPress={() => { void reconcileHistoricalCoordination(grant); }}
                          className={`mt-3 min-h-11 items-center justify-center border border-violeta bg-papel-crudo px-4 ${busy ? 'opacity-40' : ''}`}
                        >
                          <Text className="font-archivo-bold text-[10px] text-violeta">
                            {historyCoordinationBusyId === grant.id
                              ? 'Comprobando…'
                              : grant.remoteCoordinationTerminalDecision
                                ? 'Revalidar decisión registrada'
                                : 'Comprobar decisión en red'}
                          </Text>
                        </Pressable97>
                      )}
                    </View>
                  )}
                  {grant.remoteCoordinationTerminalDecision === 'accept' && historicalExecution && (
                    <CustodyExecutionCard
                      execution={historicalExecution.execution}
                      role="grantor"
                      busy={busy}
                      disabled={
                        (executionControlsDisabled && !busy)
                        || (
                          lockedExecutionProposalIds.has(historicalExecution.execution.proposalId)
                          && !historicalPending
                        )
                      }
                      pendingEventType={historicalPending?.type ?? null}
                      error={historicalExecutionError}
                      onAction={(action) =>
                        runGrantorExecutionActionFor(
                          historicalExecution!.execution.proposalId,
                          historicalExecution!,
                          action,
                          grant.remoteGrantorUserId,
                        )}
                      onRefresh={() => {
                        void refreshExecutionFor(
                          historicalExecution!.execution.proposalId,
                          grant.remoteGrantorUserId,
                        );
                      }}
                      onRetryPending={() => {
                        void retryGrantorExecutionActionFor(
                          historicalExecution!.execution.proposalId,
                          grant.remoteGrantorUserId,
                        );
                      }}
                    />
                  )}
                  {grant.remoteCoordinationTerminalDecision === 'accept'
                    && !historicalExecution
                    && historicalProposalId
                    && historicalBoundToCommunityAccount
                    && hasCommunitySession === true
                    && Boolean(CIVIC_API_URL)
                    && (
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel="Comprobar ruta histórica de apoyo"
                        accessibilityState={{ busy: busyAction === 'execution_refresh', disabled: busy }}
                        disabled={busy}
                        onPress={() => {
                          void refreshExecutionFor(historicalProposalId, grant.remoteGrantorUserId);
                        }}
                        className="mt-3 min-h-11 items-center justify-center border border-ambar bg-papel-crudo px-4"
                      >
                        <Text className="font-archivo-bold text-[10px] text-ambar">
                          {busyAction === 'execution_refresh' ? 'Comprobando ruta…' : 'Comprobar ruta y reconciliar'}
                        </Text>
                      </Pressable97>
                    )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </PapelCard>
  );
}
