import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import type {
  CustodyExecutionEventType,
  CustodyExecutionView,
} from '@/civic/custody-execution';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  AMBAR_PT,
  CIAN,
  ROJO_SELLO,
  TINTA_30,
  TINTA_50,
  VERDE,
  VIOLETA,
} from '@/theme/tokens';

export type CustodyExecutionRole = 'coordinator' | 'grantor';

export type CustodyExecutionActionDraft =
  | { type: 'reserve' }
  | { type: 'grantor_ready' }
  | { type: 'coordinator_ready' }
  | { type: 'start_delivery' }
  | { type: 'report_delivery'; quantity?: number }
  | { type: 'confirm_receipt'; receipt: 'full' | 'partial' | 'not_received'; quantity?: number }
  | { type: 'record_follow_up'; followUp: 'need_met' | 'still_open' }
  | { type: 'withdraw' };

interface CustodyExecutionCardProps {
  execution: CustodyExecutionView;
  role: CustodyExecutionRole;
  busy?: boolean;
  disabled?: boolean;
  pendingEventType?: CustodyExecutionEventType | null;
  error?: string | null;
  /** Sólo activar cuando el padre centraliza o limita las consultas automáticas. */
  refreshAtDeadline?: boolean;
  onAction: (action: CustodyExecutionActionDraft) => void | Promise<void>;
  onRefresh: () => void;
  onRetryPending?: () => void;
}

const UNIT_LABEL: Record<string, string> = {
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

const EVENT_LABEL: Record<CustodyExecutionEventType, string> = {
  reserve: 'reserva declarada',
  grantor_ready: 'disposición de la persona',
  coordinator_ready: 'disposición de coordinación',
  start_delivery: 'inicio de movimiento',
  report_delivery: 'entrega declarada',
  confirm_receipt: 'recepción registrada',
  record_follow_up: 'seguimiento registrado',
  withdraw: 'retiro de la coordinación',
};

const STATE_PRESENTATION: Record<CustodyExecutionView['state'], {
  title: string;
  detail: string;
  color: string;
}> = {
  awaiting_reservation: {
    title: 'Esperando reserva operativa',
    detail: 'Existe acuerdo para intentar coordinar, pero todavía nadie declaró haber apartado la capacidad.',
    color: VIOLETA,
  },
  reserved: {
    title: 'Capacidad declarada como reservada',
    detail: 'La coordinación apartó la capacidad acordada. Es una declaración operativa, no prueba stock físico ni entrega.',
    color: VIOLETA,
  },
  ready: {
    title: 'Ambas partes están listas',
    detail: 'Las dos partes declararon disposición para coordinar. La app no compartió teléfono, domicilio ni identidad.',
    color: CIAN,
  },
  in_transit: {
    title: 'Movimiento iniciado',
    detail: 'La coordinación declaró que inició el movimiento. Todavía no hay recepción confirmada por la persona.',
    color: AMBAR_PT,
  },
  delivery_reported: {
    title: 'Entrega declarada por coordinación',
    detail: 'La contraparte declaró la entrega. Falta la constancia independiente de quien debía recibirla.',
    color: AMBAR_PT,
  },
  received: {
    title: 'Recepción registrada',
    detail: 'La persona confirmó recepción. Esto todavía no permite afirmar que su necesidad quedó cubierta.',
    color: VERDE,
  },
  needs_follow_up: {
    title: 'La necesidad sigue abierta',
    detail: 'Hubo una conexión, pero el seguimiento indicó que todavía hace falta respuesta. No se presenta como fracaso ni resolución.',
    color: AMBAR_PT,
  },
  completed: {
    title: 'Resultado declarado por la persona',
    detail: 'La persona indicó en el seguimiento que esta necesidad quedó cubierta. Es su declaración, conservada por separado de las afirmaciones de coordinación.',
    color: VERDE,
  },
  disputed: {
    title: 'La recepción no fue confirmada',
    detail: 'La persona indicó que no recibió el apoyo. La app no atribuye culpa ni cierra la necesidad.',
    color: ROJO_SELLO,
  },
  cancelled: {
    title: 'Coordinación interrumpida',
    detail: 'Una parte retiró esta coordinación. Si el movimiento ya había comenzado, la persona aún puede registrar qué ocurrió.',
    color: TINTA_50,
  },
  expired: {
    title: 'Ventana operativa vencida',
    detail: 'No se permiten nuevos compromisos de coordinación. Una recepción ya iniciada todavía puede reconciliarse sin reabrir el acceso.',
    color: AMBAR_PT,
  },
  closed: {
    title: 'Acceso operativo cerrado',
    detail: 'El permiso dejó de habilitar acciones del círculo. Los hechos ya registrados no se borran ni se convierten en resolución.',
    color: TINTA_50,
  },
};

const formatDate = (value: string | null): string => {
  if (!value) return 'pendiente';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatQuantity = (quantity: number | null, unit: string | null): string => {
  if (quantity == null) return 'sin cantidad declarada';
  const value = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(quantity);
  return `${value} ${unit ? UNIT_LABEL[unit] ?? unit : 'unidades'}`;
};

const parseQuantity = (raw: string, maximum: number | null, requireBelowMaximum = false): number | null => {
  const normalized = raw.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (maximum != null && (value > maximum || (requireBelowMaximum && value >= maximum))) return null;
  return value;
};

const actionTitle = (action: CustodyExecutionActionDraft): string => {
  if (action.type === 'reserve') return '¿Declarar esta capacidad como reservada?';
  if (action.type === 'grantor_ready') return '¿Registrar que estás listo/a para coordinar?';
  if (action.type === 'coordinator_ready') return '¿Registrar disposición de coordinación?';
  if (action.type === 'start_delivery') return '¿Declarar que comenzó el movimiento?';
  if (action.type === 'report_delivery') return '¿Declarar esta entrega?';
  if (action.type === 'confirm_receipt') {
    if (action.receipt === 'full') return '¿Confirmás que recibiste todo?';
    if (action.receipt === 'partial') return '¿Confirmás una recepción parcial?';
    return '¿Confirmás que el apoyo no llegó?';
  }
  if (action.type === 'record_follow_up') {
    return action.followUp === 'need_met'
      ? '¿La necesidad quedó cubierta?'
      : '¿La necesidad sigue abierta?';
  }
  return '¿Retirar esta coordinación?';
};

const actionDetail = (
  action: CustodyExecutionActionDraft,
  execution: CustodyExecutionView,
): string => {
  if (action.type === 'reserve') return 'Se registra una declaración operativa. No prueba existencia física ni entrega.';
  if (action.type === 'grantor_ready' || action.type === 'coordinator_ready') {
    return 'No se almacena ni comparte teléfono, domicilio, nombre o mensaje. Esta marca expresa sólo disposición para coordinar.';
  }
  if (action.type === 'start_delivery') return 'Iniciar no prueba recepción. La persona conservará una decisión separada.';
  if (action.type === 'report_delivery') {
    return `Quedará como declaración de coordinación por ${formatQuantity(action.quantity ?? null, execution.capacity.unit)}; no como recepción confirmada.`;
  }
  if (action.type === 'confirm_receipt') {
    if (action.receipt === 'not_received') return 'La necesidad seguirá abierta y no se atribuirá culpa automáticamente.';
    const reference = action.quantity ?? execution.delivery?.quantity ?? execution.capacity.quantity;
    return `La recepción${reference == null ? '' : ` de ${formatQuantity(reference, execution.delivery?.unit ?? execution.capacity.unit)}`} se registra por separado del resultado. Después podrás indicar si la necesidad quedó cubierta.`;
  }
  if (action.type === 'record_follow_up') {
    return action.followUp === 'need_met'
      ? 'Esta declaración de la persona permite registrar que, desde su perspectiva, la necesidad quedó cubierta.'
      : 'La conexión quedará documentada, pero la necesidad continuará abierta a nuevas respuestas.';
  }
  return 'El retiro corta nuevas acciones. No borra reservas, movimientos ni constancias anteriores.';
};

function SmallAction({
  label,
  color,
  disabled,
  onPress,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 flex-row items-center justify-center gap-2 border bg-papel-crudo px-4 ${disabled ? 'opacity-40' : ''}`}
      style={{ borderColor: color }}
    >
      <Text className="font-archivo-bold text-[11px] text-tinta">{label}</Text>
    </Pressable97>
  );
}

export function CustodyExecutionCard({
  execution,
  role,
  busy = false,
  disabled = false,
  pendingEventType = null,
  error = null,
  refreshAtDeadline = false,
  onAction,
  onRefresh,
  onRetryPending,
}: CustodyExecutionCardProps) {
  const actionContext = JSON.stringify([
    execution.proposalId,
    execution.state,
    execution.version,
    pendingEventType,
    role,
    error,
  ]);
  const [draftState, setDraftState] = useState<{
    context: string;
    value: CustodyExecutionActionDraft | null;
  }>({ context: actionContext, value: null });
  const [quantityState, setQuantityState] = useState({ context: actionContext, value: '' });
  const [locallySubmitting, setLocallySubmitting] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  const deadlineRefreshRequested = useRef<string | null>(null);
  const draft = draftState.context === actionContext ? draftState.value : null;
  const quantityInput = quantityState.context === actionContext ? quantityState.value : '';
  const setDraft = (value: CustodyExecutionActionDraft | null) => {
    setDraftState({ context: actionContext, value });
  };
  const setQuantityInput = (value: string) => {
    setQuantityState({ context: actionContext, value });
  };
  const presentation = STATE_PRESENTATION[execution.state];
  const capacityQuantity = execution.capacity.quantity;
  const receiptMaximum = execution.delivery?.quantity ?? capacityQuantity;

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const availableAt = execution.reconciliation.receiptAvailableAt;
    if (!refreshAtDeadline || disabled || busy) return undefined;
    if (!availableAt || execution.reconciliation.receiptWindowOpen || execution.receipt) {
      deadlineRefreshRequested.current = null;
      return undefined;
    }
    const reconciliationAt = Date.parse(availableAt);
    if (!Number.isFinite(reconciliationAt) || reconciliationAt <= Date.now()) {
      if (deadlineRefreshRequested.current !== availableAt) {
        deadlineRefreshRequested.current = availableAt;
        onRefreshRef.current();
      }
      return undefined;
    }
    const timeout = setTimeout(
      () => {
        if (deadlineRefreshRequested.current === availableAt) return;
        deadlineRefreshRequested.current = availableAt;
        onRefreshRef.current();
      },
      Math.min(reconciliationAt - Date.now() + 25, 2_147_000_000),
    );
    return () => clearTimeout(timeout);
  }, [
    execution.receipt,
    execution.reconciliation.receiptAvailableAt,
    execution.reconciliation.receiptWindowOpen,
    busy,
    disabled,
    refreshAtDeadline,
  ]);

  const stages = useMemo(() => [
    {
      label: 'Reserva',
      done: execution.milestones.reservedAt != null,
      color: VIOLETA,
      icon: 'bookmark-outline' as const,
      detail: execution.milestones.reservedAt ? formatDate(execution.milestones.reservedAt) : 'Sin declaración',
    },
    {
      label: 'Enlace',
      done: execution.readiness.grantor && execution.readiness.coordinator,
      color: CIAN,
      icon: 'people-outline' as const,
      detail: execution.readiness.grantor && execution.readiness.coordinator
        ? 'Ambas partes listas'
        : `${execution.readiness.grantor ? 'persona lista' : 'falta persona'} · ${execution.readiness.coordinator ? 'coordinación lista' : 'falta coordinación'}`,
    },
    {
      label: 'Movimiento',
      done: execution.milestones.deliveryStartedAt != null,
      color: execution.milestones.deliveryReportedAt ? AMBAR_PT : AMBAR_PT,
      icon: 'navigate-outline' as const,
      detail: execution.milestones.deliveryReportedAt
        ? `Declarado ${formatDate(execution.milestones.deliveryReportedAt)}`
        : execution.milestones.deliveryStartedAt
          ? `Iniciado ${formatDate(execution.milestones.deliveryStartedAt)}`
          : 'Sin iniciar',
    },
    {
      label: 'Recepción',
      done: execution.receipt != null,
      color: execution.receipt?.outcome === 'full'
        ? VERDE
        : execution.receipt?.outcome === 'partial' ? AMBAR_PT : ROJO_SELLO,
      icon: execution.receipt?.outcome === 'full'
        ? 'checkmark-outline' as const
        : execution.receipt?.outcome === 'partial' ? 'remove-outline' as const : 'close-outline' as const,
      detail: execution.receipt
        ? execution.receipt.outcome === 'full'
          ? 'Completa'
          : execution.receipt.outcome === 'partial' ? 'Parcial' : 'No recibida'
        : 'Sin constancia',
    },
    {
      label: 'Seguimiento',
      done: execution.followUp != null,
      color: execution.followUp === 'need_met' ? VERDE : AMBAR_PT,
      icon: execution.followUp === 'need_met' ? 'checkmark-done-outline' as const : 'git-branch-outline' as const,
      detail: execution.followUp === 'need_met'
        ? 'Necesidad cubierta'
        : execution.followUp === 'still_open' ? 'Necesidad abierta' : 'Pendiente',
    },
  ], [execution]);

  const terminal = ['completed', 'needs_follow_up', 'disputed'].includes(execution.state);
  const operationallyClosed = ['cancelled', 'expired', 'closed'].includes(execution.state);
  const coordinatorCanAct = role === 'coordinator'
    && !terminal
    && !operationallyClosed
    && execution.receipt == null
    && execution.milestones.withdrawnAt == null;
  const grantorCanPrepare = role === 'grantor'
    && !terminal
    && !operationallyClosed
    && execution.milestones.deliveryStartedAt == null
    && execution.milestones.withdrawnAt == null;
  const grantorCanRecordReceipt = role === 'grantor'
    && execution.receipt == null
    && execution.milestones.deliveryStartedAt != null
    && execution.reconciliation.receiptWindowOpen;
  const grantorCanFollowUp = role === 'grantor'
    && execution.followUp == null
    && (execution.receipt?.outcome === 'full' || execution.receipt?.outcome === 'partial');
  const canWithdraw = execution.receipt == null
    && execution.milestones.withdrawnAt == null;
  const controlsDisabled = busy || disabled || locallySubmitting || pendingEventType != null;

  const prepareQuantityAction = (kind: 'report_delivery' | 'receipt_partial') => {
    const maximum = kind === 'report_delivery' ? capacityQuantity : receiptMaximum;
    if (maximum == null) {
      setDraft(kind === 'report_delivery'
        ? { type: 'report_delivery' }
        : { type: 'confirm_receipt', receipt: 'partial' });
      return;
    }
    const quantity = parseQuantity(quantityInput, maximum, kind === 'receipt_partial');
    if (quantity == null) return;
    setDraft(kind === 'report_delivery'
      ? { type: 'report_delivery', quantity }
      : { type: 'confirm_receipt', receipt: 'partial', quantity });
  };

  const submitDraft = async () => {
    if (!draft || locallySubmitting) return;
    setLocallySubmitting(true);
    try {
      await onAction(draft);
    } finally {
      setLocallySubmitting(false);
    }
  };

  return (
    <View className="mt-4 overflow-hidden border border-violeta bg-papel-crudo">
      <View className="border-b border-bordeSuave bg-papel-crudo p-5">
        <Text className="font-space text-[9px] uppercase tracking-[2.2px] text-violeta">Ruta de apoyo · privada</Text>
        <Text className="mt-1 font-archivo-bold text-xl leading-7" style={{ color: presentation.color }}>{presentation.title}</Text>
        <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{presentation.detail}</Text>
        <View className="mt-4 flex-row flex-wrap items-center gap-2">
          <View className="border border-bordeSuave bg-papel-presionado px-3 py-1.5">
            <Text className="font-space text-[9px] text-tinta-75">Capacidad · {formatQuantity(execution.capacity.quantity, execution.capacity.unit)}</Text>
          </View>
          <View className="border border-bordeSuave bg-papel-presionado px-3 py-1.5">
            <Text className="font-space text-[9px] text-tinta-75">Vence · {formatDate(execution.expiresAt)}</Text>
          </View>
        </View>
        {(execution.delivery || execution.receipt) && (
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            {execution.delivery && (
              <View className="border border-ambar bg-papel-crudo px-3 py-1.5">
                <Text className="font-space text-[9px] text-ambar/75">Entrega declarada · {formatQuantity(execution.delivery.quantity, execution.delivery.unit)}</Text>
              </View>
            )}
            {execution.receipt && execution.receipt.outcome !== 'not_received' && (
              <View className="border border-verde bg-papel-crudo px-3 py-1.5">
                <Text className="font-space text-[9px] text-verde/75">Recepción declarada · {formatQuantity(execution.receipt.quantity, execution.receipt.unit)}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className="p-5">
        <View className="gap-0">
          {stages.map((stage, index) => (
            <View key={stage.label} className="flex-row">
              <View className="w-7 items-center">
                <View
                  className="h-5 w-5 items-center justify-center border"
                  style={{
                    borderColor: stage.done ? stage.color : TINTA_30,
                    backgroundColor: stage.done ? stage.color : 'transparent',
                  }}
                >
                  {!stage.done && (
                    <Text className="font-space text-[8px] text-tinta-50">{index + 1}</Text>
                  )}
                </View>
                {index < stages.length - 1 && (
                  <View className="min-h-7 w-px flex-1 bg-bordeSuave" />
                )}
              </View>
              <View className="flex-1 pb-4 pl-2">
                <Text className={`font-archivo-bold text-[11px] ${stage.done ? 'text-tinta-90' : 'text-tinta-50'}`}>{stage.label}</Text>
                <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{stage.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="border border-cian bg-papel-crudo p-3">
          <View className="flex-row items-start gap-2">
            <Text className="flex-1 font-archivo text-[10px] leading-5 text-cian/75">
              No contiene teléfono, domicilio, relato ni coordenada. “Listo” no comparte contacto; “entrega declarada” no equivale a recepción; sólo la persona puede registrar el resultado.
            </Text>
          </View>
        </View>

        {execution.milestones.withdrawnAt && (
          <View className="mt-4 border border-bordeSuave bg-papel-presionado p-3">
            <Text className="font-archivo-bold text-[11px] text-tinta-90">Retiro conservado en la historia</Text>
            <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-75">
              {execution.reconciliation.withdrawnBy === 'coordinator'
                ? 'La coordinación retiró su participación.'
                : 'La persona retiró esta coordinación.'}{' '}
              Registrado {formatDate(execution.milestones.withdrawnAt)}. Una recepción o seguimiento posterior no borra este hecho.
            </Text>
          </View>
        )}

        {role === 'grantor'
          && execution.milestones.deliveryStartedAt
          && !execution.receipt
          && !execution.reconciliation.receiptWindowOpen
          && (
            <View className="mt-4 border border-ambar bg-papel-crudo p-3">
              <Text className="font-archivo-bold text-[11px] text-ambar">Recepción todavía no habilitada</Text>
              <Text className="mt-1 font-archivo text-[10px] leading-5 text-tinta-75">
                Podrás registrar qué ocurrió cuando coordinación declare la entrega o desde {formatDate(execution.reconciliation.receiptAvailableAt)}. {refreshAtDeadline
                  ? 'Al llegar ese momento, la app volverá a consultar el reloj de la red antes de habilitarte.'
                  : 'Cuando llegue ese momento, tocá “Comprobar ruta” para consultar el reloj de la red antes de habilitarte.'}
              </Text>
            </View>
          )}

        {pendingEventType && (
          <View accessibilityLiveRegion="polite" className="mt-4 border border-ambar bg-papel-crudo p-4">
            <Text className="font-archivo-bold text-xs text-ambar">Constancia pendiente</Text>
            <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">
              El comando de {EVENT_LABEL[pendingEventType]} está guardado en este dispositivo. No crearemos otro hasta recuperar su recibo exacto o su rechazo verificable.
            </Text>
            {onRetryPending && (
              <View className="mt-3 self-start">
                <SmallAction
                  label="Recuperar constancia"
                 
                  color={AMBAR_PT}
                  disabled={busy || disabled}
                  onPress={onRetryPending}
                />
              </View>
            )}
          </View>
        )}

        {error && (
          <View accessibilityLiveRegion="polite" className="mt-4 border border-sello bg-papel-crudo p-4">
            <Text className="font-archivo-bold text-xs text-sello">Tu comando no fue reinterpretado</Text>
            <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">{error}</Text>
          </View>
        )}

        {!pendingEventType && draft && (
          <View className="mt-4 border border-violeta bg-papel-crudo p-4">
            <Text className="font-archivo-bold text-xs text-violeta">{actionTitle(draft)}</Text>
            <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-75">{actionDetail(draft, execution)}</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <SmallAction label="Volver" color={TINTA_50} disabled={busy || disabled} onPress={() => setDraft(null)} />
              <SmallAction
                label={busy ? 'Registrando…' : 'Confirmar con constancia'}
               
                color={VIOLETA}
                disabled={busy || disabled || locallySubmitting}
                onPress={() => {
                  void submitDraft();
                }}
              />
            </View>
          </View>
        )}

        {!pendingEventType && !draft && (
          <View className="mt-4 gap-3">
            {coordinatorCanAct && !execution.milestones.reservedAt && (
              <SmallAction label="Reservar capacidad acordada" color={VIOLETA} disabled={controlsDisabled} onPress={() => setDraft({ type: 'reserve' })} />
            )}
            {coordinatorCanAct && !execution.readiness.coordinator && (
              <SmallAction label="Coordinación lista" color={CIAN} disabled={controlsDisabled} onPress={() => setDraft({ type: 'coordinator_ready' })} />
            )}
            {grantorCanPrepare && !execution.readiness.grantor && (
              <SmallAction label="Estoy listo/a para coordinar" color={CIAN} disabled={controlsDisabled} onPress={() => setDraft({ type: 'grantor_ready' })} />
            )}
            {coordinatorCanAct && execution.state === 'ready' && (
              <SmallAction label="Iniciar movimiento" color={AMBAR_PT} disabled={controlsDisabled} onPress={() => setDraft({ type: 'start_delivery' })} />
            )}
            {coordinatorCanAct && execution.state === 'in_transit' && (
              <View className="border border-ambar bg-papel-crudo p-4">
                <Text className="font-archivo-bold text-[11px] text-ambar">Declarar entrega</Text>
                {capacityQuantity != null && (
                  <>
                    <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-50">
                      Cantidad trasladada, máximo {formatQuantity(capacityQuantity, execution.capacity.unit)}.
                    </Text>
                    <TextInput
                      value={quantityInput}
                      onChangeText={(value) => setQuantityInput(value.replace(/[^\d.,]/g, ''))}
                      placeholder={String(capacityQuantity)}
                      placeholderTextColor={TINTA_50}
                      keyboardType="decimal-pad"
                      accessibilityLabel={`Cantidad entregada en ${execution.capacity.unit ? UNIT_LABEL[execution.capacity.unit] ?? execution.capacity.unit : 'unidades'}`}
                      accessibilityHint={`Debe ser mayor que cero y no superar ${capacityQuantity}`}
                      maxLength={20}
                      className="mt-3 border border-bordeSuave bg-papel-presionado px-4 py-3 font-archivo text-sm text-tinta"
                    />
                  </>
                )}
                <View className="mt-3 self-start">
                  <SmallAction
                    label="Revisar declaración"
                   
                    color={AMBAR_PT}
                    disabled={controlsDisabled || (capacityQuantity != null && parseQuantity(quantityInput, capacityQuantity) == null)}
                    onPress={() => prepareQuantityAction('report_delivery')}
                  />
                </View>
              </View>
            )}
            {grantorCanRecordReceipt && (
              <View className="border border-verde bg-papel-crudo p-4">
                <Text className="font-archivo-bold text-[11px] text-verde">¿Qué llegó realmente?</Text>
                <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-50">Tu constancia es independiente de lo declarado por coordinación.</Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <SmallAction label="Recibí todo" color={VERDE} disabled={controlsDisabled} onPress={() => setDraft({ type: 'confirm_receipt', receipt: 'full' })} />
                  <SmallAction label="No llegó" color={ROJO_SELLO} disabled={controlsDisabled} onPress={() => setDraft({ type: 'confirm_receipt', receipt: 'not_received' })} />
                </View>
                <View className="mt-3 border-t border-bordeSuave pt-3">
                  <Text className="font-archivo text-[10px] text-tinta-75">Recibí una parte</Text>
                  {receiptMaximum != null && (
                    <TextInput
                      value={quantityInput}
                      onChangeText={(value) => setQuantityInput(value.replace(/[^\d.,]/g, ''))}
                      placeholder={`Menos de ${receiptMaximum}`}
                      placeholderTextColor={TINTA_50}
                      keyboardType="decimal-pad"
                      accessibilityLabel={`Cantidad recibida parcialmente en ${
                        (execution.delivery?.unit ?? execution.capacity.unit)
                          ? UNIT_LABEL[execution.delivery?.unit ?? execution.capacity.unit ?? '']
                            ?? execution.delivery?.unit
                            ?? execution.capacity.unit
                          : 'unidades'
                      }`}
                      accessibilityHint={`Debe ser mayor que cero y menor que ${receiptMaximum}`}
                      maxLength={20}
                      className="mt-2 border border-bordeSuave bg-papel-presionado px-4 py-3 font-archivo text-sm text-tinta"
                    />
                  )}
                  <View className="mt-3 self-start">
                    <SmallAction
                      label="Revisar recepción parcial"
                     
                      color={AMBAR_PT}
                      disabled={controlsDisabled || (receiptMaximum != null && parseQuantity(quantityInput, receiptMaximum, true) == null)}
                      onPress={() => prepareQuantityAction('receipt_partial')}
                    />
                  </View>
                </View>
              </View>
            )}
            {grantorCanFollowUp && (
              <View className="border border-violeta bg-papel-crudo p-4">
                <Text className="font-archivo-bold text-[11px] text-violeta">Seguimiento separado</Text>
                <Text className="mt-2 font-archivo text-[10px] leading-5 text-tinta-50">Recibir algo no significa automáticamente que la necesidad terminó.</Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <SmallAction label="Quedó cubierta" color={VERDE} disabled={controlsDisabled} onPress={() => setDraft({ type: 'record_follow_up', followUp: 'need_met' })} />
                  <SmallAction label="Sigue abierta" color={AMBAR_PT} disabled={controlsDisabled} onPress={() => setDraft({ type: 'record_follow_up', followUp: 'still_open' })} />
                </View>
              </View>
            )}
            {canWithdraw && (
              <View className="self-start">
                <SmallAction label="No puedo continuar" color={ROJO_SELLO} disabled={controlsDisabled} onPress={() => setDraft({ type: 'withdraw' })} />
              </View>
            )}
          </View>
        )}

        <View className="mt-4 self-start">
          <SmallAction
            label={busy ? 'Comprobando…' : 'Comprobar ruta'}
           
            color={TINTA_50}
            disabled={busy || disabled}
            onPress={onRefresh}
          />
        </View>
      </View>
    </View>
  );
}
