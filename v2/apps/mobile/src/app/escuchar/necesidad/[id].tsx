import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { NeedAccessGrantPanel } from '@/components/civic/NeedAccessGrantPanel';
import { BotonTinta, ChipTipo, FilaIndice, GranoPapel, Kicker, PapelCard, TituloAnton } from '@/components/papel';
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
import { TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

/**
 * Preparar un pedido bajo custodia — separa lo operativo (cantidad, unidad,
 * urgencia, vigencia) del relato original, que nunca se copia. Sigue local
 * hasta que exista un permiso territorial verificable.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): pantalla profunda —
 * título sin entintar, formulario canónico. No hay sello acá: "pedido
 * estructurado" no está en el catálogo cerrado (spec §5).
 */

const CUSTODIANS: readonly { key: NeedCustodianKind; label: string; detail: string }[] = [
  { key: 'self', label: 'Yo, por ahora', detail: 'Conservo el pedido en este dispositivo.' },
  { key: 'trusted_circle', label: 'Círculo de confianza', detail: 'Una red cercana cuidará la derivación.' },
  { key: 'organization', label: 'Organización', detail: 'Una entidad comunitaria acompaña el caso.' },
  { key: 'public_service', label: 'Servicio público', detail: 'Un área institucional debería custodiar la respuesta.' },
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

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

function Encabezado({ titulo, onVolver }: { titulo: string; onVolver: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onVolver}
        className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
      >
        <Text className="font-space text-2xl text-tinta">←</Text>
      </Pressable97>
      <View className="mt-2">
        <Kicker tono="neutro">pedido bajo custodia</Kicker>
        <TituloAnton tamano="lg" className="mt-1">{titulo}</TituloAnton>
      </View>
    </View>
  );
}

function OptionCard({
  selected,
  label,
  detail,
  onPress,
}: {
  selected: boolean;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${detail}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-[82px] flex-row items-center bg-papel-crudo p-4"
      style={{ borderWidth: selected ? 2 : 1, borderColor: selected ? VIOLETA : TINTA }}
    >
      <View className="flex-1">
        <Text className="font-archivo-bold text-sm text-tinta">{label}</Text>
        <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-50">{detail}</Text>
      </View>
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
  const [enfocadoCustodio, setEnfocadoCustodio] = useState(false);
  const [enfocadoDestinatario, setEnfocadoDestinatario] = useState(false);
  const [enfocadoCantidad, setEnfocadoCantidad] = useState(false);
  const [enfocadoUnidad, setEnfocadoUnidad] = useState(false);
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
      <View className="flex-1 bg-papel">
        <GranoPapel />
        <Encabezado titulo="Pedido bajo custodia" onVolver={volver} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
          <PapelCard className="p-6">
            <Kicker tono="neutro">Estructurado · todavía local</Kicker>
            <TituloAnton tamano="md" className="mt-2">Ya tiene dirección sin perder refugio.</TituloAnton>
            <Text className="mt-4 font-archivo text-sm leading-6 text-tinta-75">
              Creamos un pedido de {listeningThemeLabel(listening.theme).toLowerCase()} separado del relato. Custodia, destinatario y punto seguro quedan en este dispositivo.
            </Text>
          </PapelCard>

          <View className="mt-5 border border-ambar px-4 py-3">
            <Text className="font-archivo text-xs leading-5 text-tinta-90">
              No lo enviamos al feed colectivo. Ahora podés dejar un permiso local para un destinatario concreto; la entrega seguirá cerrada hasta que exista un canal autenticado y aceptación del receptor.
            </Text>
          </View>

          {storedNeed && storedCustody && (
            <PapelCard className="mt-5 p-5">
              <Kicker tono="neutro">Pasaporte privado del pedido</Kicker>
              <View className="mt-3">
                <FilaIndice numero="01" glifo="">
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">
                    Custodia: {CUSTODIANS.find((item) => item.key === storedCustody.custodianKind)?.label ?? storedCustody.custodianKind}
                    {storedCustody.custodianLabel ? ` · ${storedCustody.custodianLabel}` : ''}
                  </Text>
                </FilaIndice>
                <FilaIndice numero="02" glifo="">
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">
                    Respuesta esperada: {RECIPIENTS.find((item) => item.key === storedCustody.decisionRecipient)?.label ?? storedCustody.decisionRecipient}
                    {storedCustody.decisionRecipientLabel ? ` · ${storedCustody.decisionRecipientLabel}` : ''}
                  </Text>
                </FilaIndice>
                <FilaIndice numero="03" glifo="">
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">
                    Contacto: {CONTACT_ROUTES.find((item) => item.key === storedCustody.contactRoute)?.label ?? storedCustody.contactRoute}
                  </Text>
                </FilaIndice>
                <FilaIndice numero="04" glifo="">
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">
                    {storedNeed.quantity != null ? `${storedNeed.quantity} ${storedNeed.unit ?? 'unidades'} · ` : ''}urgencia {storedNeed.urgency}/5 · revisar {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(storedNeed.expiresAt ?? storedNeed.updatedAt))}
                  </Text>
                </FilaIndice>
                <FilaIndice numero="05" glifo="">
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">{contextLocationSummary(storedContext)}</Text>
                </FilaIndice>
              </View>
            </PapelCard>
          )}

          {storedNeed && storedCustody && <NeedAccessGrantPanel need={storedNeed} />}

          <View className="mt-6">
            <FilaIndice numero="01" onPress={() => router.replace('/mis-datos')} accessibilityLabel="Ver y controlar el pedido">
              <Text className="font-archivo-bold text-base text-tinta">Ver y controlar el pedido</Text>
            </FilaIndice>
            <FilaIndice numero="02" onPress={() => router.replace('/circulos')} accessibilityLabel="Preparar mi red de confianza">
              <Text className="font-archivo-bold text-base text-tinta">Preparar mi red de confianza</Text>
            </FilaIndice>
            <FilaIndice numero="03" onPress={() => router.replace('/territorio')} accessibilityLabel="Volver al territorio">
              <Text className="font-archivo-bold text-base text-tinta">Volver al territorio</Text>
            </FilaIndice>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <Encabezado titulo="Preparar pedido" onVolver={volver} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
          <TituloAnton tamano="md" className="mt-2">¿Quién cuidará este pedido?</TituloAnton>
          <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
            El relato nunca se copia. Sólo estructuramos categoría, cantidad, urgencia, vigencia y un punto seguro para que después pueda existir una derivación responsable.
          </Text>

          {listening && (
            <PapelCard variante="suave" className="mt-6 p-5">
              <Kicker tono="neutro">Origen privado</Kicker>
              <Text className="mt-2 font-archivo-bold text-lg text-tinta">Necesidad de {listeningThemeLabel(listening.theme).toLowerCase()}</Text>
              <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-50">El texto completo sigue sólo en la bitácora.</Text>
            </PapelCard>
          )}

          <Kicker tono="neutro" className="mt-8">Custodia</Kicker>
          <View className="mt-3 gap-2">
            {CUSTODIANS.map((option) => (
              <OptionCard
                key={option.key}
                label={option.label}
                detail={option.detail}
                selected={custodianKind === option.key}
                onPress={() => setCustodianKind(option.key)}
              />
            ))}
          </View>
          {custodianKind !== 'self' && (
            <TextInput
              value={custodianLabel}
              onChangeText={setCustodianLabel}
              onFocus={() => setEnfocadoCustodio(true)}
              onBlur={() => setEnfocadoCustodio(false)}
              maxLength={120}
              placeholder="Nombre local del círculo, organización o servicio"
              placeholderTextColor={TINTA_50}
              accessibilityLabel="Nombre local del custodio"
              className="mt-3 bg-papel-crudo px-4 py-3.5 font-archivo text-sm text-tinta"
              style={estiloInput(enfocadoCustodio)}
            />
          )}
          <Text className="mt-2 font-archivo text-[10px] leading-4 text-tinta-30">Este nombre queda local y no demuestra pertenencia ni autoridad.</Text>

          <Kicker tono="neutro" className="mt-8">¿Quién debería responder?</Kicker>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {RECIPIENTS.map((option) => (
              <ChipTipo key={option.key} etiqueta={option.label} activo={decisionRecipient === option.key} onPress={() => setDecisionRecipient(option.key)} />
            ))}
          </View>
          <TextInput
            value={decisionRecipientLabel}
            onChangeText={setDecisionRecipientLabel}
            onFocus={() => setEnfocadoDestinatario(true)}
            onBlur={() => setEnfocadoDestinatario(false)}
            maxLength={120}
            placeholder="Área o institución concreta, si la conocés"
            placeholderTextColor={TINTA_50}
            accessibilityLabel="Destinatario concreto"
            className="mt-3 bg-papel-crudo px-4 py-3.5 font-archivo text-sm text-tinta"
            style={estiloInput(enfocadoDestinatario)}
          />

          <Kicker tono="neutro" className="mt-8">Vía de contacto preferida</Kicker>
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

          <PapelCard className="mt-6 p-5">
            <Kicker tono="neutro">Dimensión operativa</Kicker>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Kicker tono="neutro">Cantidad, si aplica</Kicker>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  onFocus={() => setEnfocadoCantidad(true)}
                  onBlur={() => setEnfocadoCantidad(false)}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="Ej. 12"
                  placeholderTextColor={TINTA_50}
                  className="mt-2 bg-papel px-4 py-3 font-space text-sm text-tinta"
                  style={estiloInput(enfocadoCantidad)}
                />
              </View>
              <View className="flex-1">
                <Kicker tono="neutro">Unidad</Kicker>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  onFocus={() => setEnfocadoUnidad(true)}
                  onBlur={() => setEnfocadoUnidad(false)}
                  maxLength={120}
                  placeholder="raciones, horas…"
                  placeholderTextColor={TINTA_50}
                  className="mt-2 bg-papel px-4 py-3 font-archivo text-sm text-tinta"
                  style={estiloInput(enfocadoUnidad)}
                />
              </View>
            </View>
            <Kicker tono="neutro" className="mt-5">Urgencia operativa</Kicker>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <ChipTipo key={value} etiqueta={String(value)} activo={urgency === value} accessibilityLabel={`Urgencia ${value} de 5`} onPress={() => setUrgency(value)} />
              ))}
            </View>
            <Kicker tono="neutro" className="mt-5">Revisar vigencia en</Kicker>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {[7, 30, 60].map((value) => (
                <ChipTipo key={value} etiqueta={`${value} días`} activo={expiresInDays === value} onPress={() => setExpiresInDays(value)} />
              ))}
            </View>
          </PapelCard>

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

          <Pressable97
            accessibilityRole="checkbox"
            accessibilityLabel="Confirmar que el pedido no se sincroniza"
            accessibilityState={{ checked: understood }}
            onPress={() => setUnderstood((value) => !value)}
            className="mt-5 flex-row items-start gap-3 border border-ambar p-4"
          >
            <View className={`mt-0.5 h-5 w-5 border border-tinta ${understood ? 'bg-violeta' : 'bg-papel-presionado'}`} />
            <View className="flex-1">
              <Text className="font-archivo-bold text-xs text-tinta">Entiendo: la app no sincroniza este pedido</Text>
              <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-50">Permanece en el almacenamiento local, todavía sin cifrado propio de la app. No se envía a la red ni a la persona nombrada: eso requiere un permiso verificable y una confirmación posterior.</Text>
            </View>
          </Pressable97>

          <View
            accessibilityLiveRegion="polite"
            className={`mt-5 border px-4 py-3 ${canSave ? 'border-verde' : 'border-ambar'}`}
          >
            <Text className="font-archivo text-[11px] leading-5 text-tinta-90">{error ?? statusNote}</Text>
          </View>

          <View className="mt-8 items-center">
            <BotonTinta etiqueta="Crear pedido bajo custodia" onPress={save} disabled={!canSave} cargando={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
