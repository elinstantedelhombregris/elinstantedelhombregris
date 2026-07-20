import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { NeedAccessGrantPanel } from '@/components/civic/NeedAccessGrantPanel';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  createCustodiedNeedDraft,
  listeningById,
  listeningThemeLabel,
  needCustodyByNeedId,
} from '@/civic/listening';
import {
  contextLocationSummary,
  recordContextDraftFor,
  recordContextFor,
} from '@/civic/record-context';
import { needById } from '@/civic/repo';
import type {
  CivicRecordContextDraft,
  NeedContactRoute,
  NeedCustodianKind,
  NeedDecisionRecipient,
} from '@/civic/types';
import { haptic } from '@/theme/haptics';

const CUSTODIANS: readonly { key: NeedCustodianKind; label: string; detail: string; icon: string }[] = [
  { key: 'self', label: 'Yo, por ahora', detail: 'Conservo el pedido en este dispositivo.', icon: 'person-outline' },
  { key: 'trusted_circle', label: 'Círculo de confianza', detail: 'Una red cercana cuidará la derivación.', icon: 'people-outline' },
  { key: 'organization', label: 'Organización', detail: 'Una entidad comunitaria acompaña el caso.', icon: 'home-outline' },
  { key: 'public_service', label: 'Servicio público', detail: 'Un área institucional debería custodiar la respuesta.', icon: 'business-outline' },
];

const RECIPIENTS: readonly { key: NeedDecisionRecipient; label: string }[] = [
  { key: 'community_network', label: 'Red comunitaria' },
  { key: 'civil_organization', label: 'Organización social' },
  { key: 'municipal', label: 'Municipio' },
  { key: 'provincial', label: 'Provincia' },
  { key: 'national', label: 'Nación' },
  { key: 'to_define', label: 'A definir con el custodio' },
];

const CONTACT_ROUTES: readonly { key: NeedContactRoute; label: string; detail: string }[] = [
  { key: 'through_custodian', label: 'Por medio del custodio', detail: 'La opción recomendada: no expone contacto.' },
  { key: 'in_app', label: 'Sala protegida de la app', detail: 'Se habilitará sólo con aceptación bilateral.' },
  { key: 'in_person', label: 'Encuentro acordado', detail: 'En un punto seguro, nunca domicilio por defecto.' },
  { key: 'to_define', label: 'A definir', detail: 'No se abre contacto hasta elegir una vía.' },
];

function OptionCard({
  selected,
  label,
  detail,
  icon,
  onPress,
}: {
  selected: boolean;
  label: string;
  detail: string;
  icon?: string;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${detail}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-[82px] flex-row items-center rounded-2xl border p-4"
      style={{ borderColor: selected ? '#FB718566' : '#FFFFFF18', backgroundColor: selected ? '#FB718512' : '#FFFFFF07' }}
    >
      {icon && (
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-rose-300/10">
          <Ionicons name={icon as never} size={18} color={selected ? '#FDA4AF' : '#64748B'} />
        </View>
      )}
      <View className={icon ? 'ml-3 flex-1' : 'flex-1'}>
        <Text className="font-sans-semibold text-sm" style={{ color: selected ? '#FFE4E6' : '#CBD5E1' }}>{label}</Text>
        <Text className="mt-1 font-sans text-[11px] leading-5 text-slate-500">{detail}</Text>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={19} color="#FB7185" />}
    </Pressable97>
  );
}

export default function PrepararNecesidad() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const listening = id ? listeningById(id) : null;
  const [custodianKind, setCustodianKind] = useState<NeedCustodianKind>('self');
  const [custodianLabel, setCustodianLabel] = useState('');
  const [decisionRecipient, setDecisionRecipient] = useState<NeedDecisionRecipient>('to_define');
  const [decisionRecipientLabel, setDecisionRecipientLabel] = useState('');
  const [contactRoute, setContactRoute] = useState<NeedContactRoute>('through_custodian');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [urgency, setUrgency] = useState(listening?.importance ?? 3);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [understood, setUnderstood] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(listening?.needId));
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<CivicRecordContextDraft>(() => ({
    ...recordContextDraftFor('listening', id ?? '', {
      audience: 'private',
      sensitivity: 'high',
      sharedPrecision: 'neighborhood',
    }),
    audience: 'private',
    attributionMode: 'anonymous',
    attributionName: '',
    sensitivity: 'high',
  }));
  const storedNeed = listening?.needId ? needById(listening.needId) : null;
  const storedCustody = listening?.needId ? needCustodyByNeedId(listening.needId) : null;
  const storedContext = listening?.needId ? recordContextFor('need', listening.needId) : null;

  const custodianReady = custodianKind === 'self' || custodianLabel.trim().length >= 2;
  const contextReady = isGeoAttributionReady(context);
  const canSave = Boolean(listening && listening.kind === 'need' && listening.supportWanted)
    && custodianReady && contextReady && understood && !saving;
  const statusNote = (() => {
    if (!listening) return 'No encontramos la escucha original en este dispositivo.';
    if (listening.kind !== 'need' || !listening.supportWanted) return 'Esta escucha no fue marcada como un pedido de apoyo.';
    if (!custodianReady) return 'Nombrá el círculo, organización o servicio que cuidará la derivación.';
    if (!contextReady) return 'Marcá un punto seguro y una referencia local.';
    if (!understood) return 'Confirmá que entendés el alcance: se guarda local y todavía no se envía.';
    return 'Todo listo para crear el pedido bajo custodia.';
  })();

  const save = () => {
    if (!canSave || !listening) return;
    setSaving(true);
    setError(null);
    try {
      createCustodiedNeedDraft({
        listeningId: listening.id,
        custodianKind,
        custodianLabel,
        decisionRecipient,
        decisionRecipientLabel,
        contactRoute,
        // Mismo tope de 1e9 que valida community-api al leer cantidades.
        quantity: Number(quantity) > 0 ? Math.min(Number(quantity), 1_000_000_000) : null,
        unit,
        urgency,
        expiresInDays,
        context: {
          ...context,
          audience: 'private',
          locationRole: 'meeting_point',
          locationConsent: false,
          attributionConsent: false,
        },
      });
      setSaved(true);
      haptic.celebrate();
    } catch {
      setError('No pudimos estructurar el pedido. La escucha original sigue a salvo; revisá los datos e intentá otra vez.');
    } finally {
      setSaving(false);
    }
  };

  if (saved && listening) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Pedido bajo custodia" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
          <GlassCard className="mt-4 overflow-hidden p-7">
            <View className="h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-300/10">
              <Ionicons name="shield-checkmark-outline" size={29} color="#6EE7B7" />
            </View>
            <Text className="mt-6 font-sans text-[10px] uppercase tracking-[2.5px] text-emerald-300">Estructurado · todavía local</Text>
            <Text className="mt-3 font-serif text-[34px] leading-[42px] text-plata">Ya tiene dirección sin perder refugio.</Text>
            <Text className="mt-4 font-sans text-sm leading-6 text-slate-400">
              Creamos un pedido de {listeningThemeLabel(listening.theme).toLowerCase()} separado del relato. Custodia, destinatario y punto seguro quedan en este dispositivo.
            </Text>
          </GlassCard>

          <View className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4">
            <View className="flex-row items-start gap-3">
              <Ionicons name="lock-closed-outline" size={18} color="#FCD34D" />
              <Text className="flex-1 font-sans text-xs leading-5 text-amber-100/80">
                No lo enviamos al feed colectivo. Ahora podés dejar un permiso local para un destinatario concreto; la entrega seguirá cerrada hasta que exista un canal autenticado y aceptación del receptor.
              </Text>
            </View>
          </View>

          {storedNeed && storedCustody && (
            <GlassCard className="mt-5 p-5">
              <Text className="font-sans text-[10px] uppercase tracking-[2px] text-slate-500">Pasaporte privado del pedido</Text>
              <View className="mt-4 gap-3">
                <View className="flex-row items-start gap-3">
                  <Ionicons name="person-outline" size={16} color="#FDA4AF" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">
                    Custodia: {CUSTODIANS.find((item) => item.key === storedCustody.custodianKind)?.label ?? storedCustody.custodianKind}
                    {storedCustody.custodianLabel ? ` · ${storedCustody.custodianLabel}` : ''}
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <Ionicons name="navigate-outline" size={16} color="#FCD34D" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">
                    Respuesta esperada: {RECIPIENTS.find((item) => item.key === storedCustody.decisionRecipient)?.label ?? storedCustody.decisionRecipient}
                    {storedCustody.decisionRecipientLabel ? ` · ${storedCustody.decisionRecipientLabel}` : ''}
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <Ionicons name="chatbubbles-outline" size={16} color="#C4B5FD" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">
                    Contacto: {CONTACT_ROUTES.find((item) => item.key === storedCustody.contactRoute)?.label ?? storedCustody.contactRoute}
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <Ionicons name="cube-outline" size={16} color="#7DD3FC" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">
                    {storedNeed.quantity != null ? `${storedNeed.quantity} ${storedNeed.unit ?? 'unidades'} · ` : ''}urgencia {storedNeed.urgency}/5 · revisar {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(storedNeed.expiresAt ?? storedNeed.updatedAt))}
                  </Text>
                </View>
                <View className="flex-row items-start gap-3">
                  <Ionicons name="location-outline" size={16} color="#6EE7B7" />
                  <Text className="flex-1 font-sans text-xs leading-5 text-slate-300">{contextLocationSummary(storedContext)}</Text>
                </View>
              </View>
            </GlassCard>
          )}

          {storedNeed && storedCustody && <NeedAccessGrantPanel need={storedNeed} />}

          <View className="mt-6 gap-3">
            <Pressable97 accessibilityRole="button" accessibilityLabel="Abrir mis datos" onPress={() => router.replace('/mis-datos')} className="min-h-14 flex-row items-center rounded-2xl bg-rose-400 px-5">
              <Ionicons name="documents-outline" size={19} color="white" />
              <Text className="ml-3 flex-1 font-sans-semibold text-sm text-white">Ver y controlar el pedido</Text>
              <Ionicons name="arrow-forward" size={17} color="white" />
            </Pressable97>
            <Pressable97 accessibilityRole="button" accessibilityLabel="Preparar mi red de confianza" onPress={() => router.replace('/circulos')} className="min-h-14 flex-row items-center rounded-2xl border border-violet-300/20 bg-violet-300/10 px-5">
              <Ionicons name="people-outline" size={19} color="#C4B5FD" />
              <Text className="ml-3 flex-1 font-sans-semibold text-sm text-violet-100">Preparar mi red de confianza</Text>
              <Ionicons name="arrow-forward" size={17} color="#C4B5FD" />
            </Pressable97>
            <Pressable97 accessibilityRole="button" accessibilityLabel="Volver al territorio" onPress={() => router.replace('/territorio')} className="min-h-14 flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-5">
              <Ionicons name="earth-outline" size={19} color="#94A3B8" />
              <Text className="ml-3 flex-1 font-sans-medium text-sm text-slate-300">Volver al territorio</Text>
            </Pressable97>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Preparar pedido" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
          <Text className="mt-2 font-sans text-[10px] uppercase tracking-[2.8px] text-rose-300">Del relato a una respuesta segura</Text>
          <Text className="mt-4 font-serif text-[34px] leading-[42px] text-plata">¿Quién cuidará este pedido?</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
            El relato nunca se copia. Sólo estructuramos categoría, cantidad, urgencia, vigencia y un punto seguro para que después pueda existir una derivación responsable.
          </Text>

          {listening && (
            <GlassCard className="mt-6 p-5">
              <Text className="font-sans text-[10px] uppercase tracking-[2px] text-slate-500">Origen privado</Text>
              <Text className="mt-2 font-serif text-xl text-plata">Necesidad de {listeningThemeLabel(listening.theme).toLowerCase()}</Text>
              <Text className="mt-2 font-sans text-xs leading-5 text-slate-500">El texto completo sigue sólo en la bitácora.</Text>
            </GlassCard>
          )}

          <Text className="mt-8 font-sans-medium text-sm text-slate-200">Custodia</Text>
          <View className="mt-3 gap-2">
            {CUSTODIANS.map((option) => (
              <OptionCard
                key={option.key}
                label={option.label}
                detail={option.detail}
                icon={option.icon}
                selected={custodianKind === option.key}
                onPress={() => setCustodianKind(option.key)}
              />
            ))}
          </View>
          {custodianKind !== 'self' && (
            <TextInput value={custodianLabel} onChangeText={setCustodianLabel} maxLength={120} placeholder="Nombre local del círculo, organización o servicio" placeholderTextColor="#64748B" accessibilityLabel="Nombre local del custodio" className="mt-3 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-sans text-sm text-plata" />
          )}
          <Text className="mt-2 font-sans text-[10px] leading-4 text-slate-600">Este nombre queda local y no demuestra pertenencia ni autoridad.</Text>

          <Text className="mt-8 font-sans-medium text-sm text-slate-200">¿Quién debería responder?</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {RECIPIENTS.map((option) => (
              <Pressable97 key={option.key} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ selected: decisionRecipient === option.key }} onPress={() => setDecisionRecipient(option.key)} className="min-h-11 justify-center rounded-full border px-4" style={{ borderColor: decisionRecipient === option.key ? '#FB718566' : '#FFFFFF18', backgroundColor: decisionRecipient === option.key ? '#FB718512' : '#FFFFFF07' }}>
                <Text className="font-sans-medium text-xs" style={{ color: decisionRecipient === option.key ? '#FFE4E6' : '#94A3B8' }}>{option.label}</Text>
              </Pressable97>
            ))}
          </View>
          <TextInput value={decisionRecipientLabel} onChangeText={setDecisionRecipientLabel} maxLength={120} placeholder="Área o institución concreta, si la conocés" placeholderTextColor="#64748B" accessibilityLabel="Destinatario concreto" className="mt-3 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-sans text-sm text-plata" />

          <Text className="mt-8 font-sans-medium text-sm text-slate-200">Vía de contacto preferida</Text>
          <View className="mt-3 gap-2">
            {CONTACT_ROUTES.map((option) => (
              <OptionCard
                key={option.key}
                label={option.label}
                detail={option.detail}
                selected={contactRoute === option.key}
                onPress={() => setContactRoute(option.key)}
              />
            ))}
          </View>

          <GlassCard className="mt-6 p-5">
            <Text className="font-sans-medium text-sm text-slate-200">Dimensión operativa</Text>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="font-sans text-xs text-slate-400">Cantidad, si aplica</Text>
                <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" maxLength={10} placeholder="Ej. 12" placeholderTextColor="#64748B" className="mt-2 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-mono text-sm text-plata" />
              </View>
              <View className="flex-1">
                <Text className="font-sans text-xs text-slate-400">Unidad</Text>
                <TextInput value={unit} onChangeText={setUnit} maxLength={120} placeholder="raciones, horas…" placeholderTextColor="#64748B" className="mt-2 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-sans text-sm text-plata" />
              </View>
            </View>
            <Text className="mt-5 font-sans text-xs text-slate-400">Urgencia operativa</Text>
            <View className="mt-3 flex-row gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable97 key={value} accessibilityRole="radio" accessibilityLabel={`Urgencia ${value} de 5`} accessibilityState={{ selected: urgency === value }} onPress={() => setUrgency(value)} className="min-h-11 flex-1 items-center justify-center rounded-xl border" style={{ borderColor: urgency === value ? '#FB718566' : '#FFFFFF18', backgroundColor: urgency === value ? '#FB718512' : '#FFFFFF07' }}>
                  <Text className="font-mono text-sm" style={{ color: urgency === value ? '#FFE4E6' : '#64748B' }}>{value}</Text>
                </Pressable97>
              ))}
            </View>
            <Text className="mt-5 font-sans text-xs text-slate-400">Revisar vigencia en</Text>
            <View className="mt-3 flex-row gap-2">
              {[7, 30, 60].map((value) => (
                <Pressable97 key={value} accessibilityRole="radio" accessibilityLabel={`${value} días`} accessibilityState={{ selected: expiresInDays === value }} onPress={() => setExpiresInDays(value)} className="min-h-11 flex-1 items-center justify-center rounded-xl border" style={{ borderColor: expiresInDays === value ? '#FB718566' : '#FFFFFF18', backgroundColor: expiresInDays === value ? '#FB718512' : '#FFFFFF07' }}>
                  <Text className="font-sans-medium text-xs" style={{ color: expiresInDays === value ? '#FFE4E6' : '#64748B' }}>{value} días</Text>
                </Pressable97>
              ))}
            </View>
          </GlassCard>

          <View className="mt-5">
            <GeoAttributionCard
              value={context}
              onChange={(next) => setContext({ ...next, audience: 'private', attributionMode: 'anonymous', attributionName: '', sensitivity: 'high' })}
              privateOnly
              showAttribution={false}
              accent="#FB7185"
              title="Elegí un punto seguro de referencia"
              description="Usá un centro comunitario, institución o hito del barrio. Nunca marques un domicilio personal para pedir ayuda."
            />
          </View>

          <Pressable97 accessibilityRole="checkbox" accessibilityLabel="Confirmar que el pedido no se sincroniza" accessibilityState={{ checked: understood }} onPress={() => setUnderstood((value) => !value)} className="mt-5 flex-row items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border" style={{ borderColor: understood ? '#FCD34D' : '#64748B', backgroundColor: understood ? '#FCD34D' : 'transparent' }}>
              {understood && <Ionicons name="checkmark" size={14} color="#422006" />}
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-xs text-amber-100">Entiendo: la app no sincroniza este pedido</Text>
              <Text className="mt-1 font-sans text-[11px] leading-5 text-slate-500">Permanece en el almacenamiento local, todavía sin cifrado propio de la app. No se envía a la red ni a la persona nombrada: eso requiere un permiso verificable y una confirmación posterior.</Text>
            </View>
          </Pressable97>

          <View accessibilityLiveRegion="polite" className="mt-5 flex-row items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Ionicons name={canSave ? 'checkmark-circle-outline' : 'information-circle-outline'} size={17} color={canSave ? '#6EE7B7' : '#FCD34D'} />
            <Text className="flex-1 font-sans text-[11px] leading-5" style={{ color: canSave ? '#A7F3D0' : '#FDE68A' }}>{error ?? statusNote}</Text>
          </View>

          <View className="mt-8 items-center">
            <AccentButton label={saving ? 'Estructurando…' : 'Crear pedido bajo custodia'} onPress={save} disabled={!canSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
