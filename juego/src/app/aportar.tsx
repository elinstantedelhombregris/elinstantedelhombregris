import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIVIC_CATEGORY_LABELS } from '@/civic/labels';
import { defaultRecordContextDraft } from '@/civic/record-context';
import { createResource, recordConsent } from '@/civic/repo';
import { haptic } from '@/theme/haptics';

const CATEGORIES = Object.entries(CIVIC_CATEGORY_LABELS).filter(([key]) => key !== 'red-comunitaria-alimentaria');

export default function Aportar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(CATEGORIES[0]![0]);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('unidades');
  const [radius, setRadius] = useState('5');
  const [publish, setPublish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [context, setContext] = useState(() => defaultRecordContextDraft({
    sensitivity: 'low',
    precision: '500m',
  }));
  const contextReady = isGeoAttributionReady(context);
  const publicationIssue = !context.point
    ? 'Falta marcar el lugar en el mapa.'
    : context.locationLabel.trim().length < 3
      ? 'Falta escribir una referencia pública de al menos 3 caracteres.'
      : context.attributionMode !== 'anonymous' && context.attributionName.trim().length < 2
        ? 'Falta completar el alias o nombre que querés mostrar.'
        : !publish
          ? 'Último paso: marcá “Autorizo publicar este aporte”.'
          : null;

  const save = async () => {
    if (saving) return;
    if (publicationIssue || !contextReady) {
      haptic.tick();
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      recordConsent({ scope: 'publish', purpose: 'Publicar este recurso en el territorio para encontrar una necesidad compatible.', granted: true });
      recordConsent({ scope: 'location', purpose: `Compartir una proyección ${context.sharedPrecision} del lugar confirmado.`, granted: true, version: 3 });
      const resource = createResource({
        category,
        title: title.trim() || CIVIC_CATEGORY_LABELS[category] || 'Recurso disponible',
        // Mismo tope de 1e9 que valida community-api al leer cantidades.
        quantity: Number(quantity) > 0 ? Math.min(Number(quantity), 1_000_000_000) : null,
        unit: unit.trim() || null,
        radiusKm: Math.max(1, Math.min(50, Number(radius) || 5)),
        confidence: 0.65,
        publicLocation: context.point,
        publicPrecision: context.sharedPrecision,
        locationLabel: context.locationLabel.trim(),
        availability: { status: 'a_coordinar' },
        context: {
          ...context,
          locationRole: 'service_area',
          locationConsent: true,
          attributionConsent: context.attributionMode !== 'anonymous',
          confirmedAt: new Date().toISOString(),
        },
        publish: true,
      });
      haptic.celebrate();
      router.replace({
        pathname: '/territorio/mapa',
        params: { focus: `resource:${resource.id}`, published: 'resource' },
      });
    } catch {
      setSaveError('No pudimos guardar el recurso. Tus datos siguen en esta pantalla: revisalos e intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Aportar" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
        >
          <Text className="mt-1 font-sans text-[11px] uppercase tracking-[3px] text-amber-300">Recurso concreto</Text>
          <Text className="mt-4 font-serif text-[32px] leading-[41px] text-plata">¿Qué podés poner en movimiento?</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
            Publicá disponibilidad real, con cantidad y radio. Cuando ambas partes aceptan, se abre una sala protegida para acordar la coordinación; los datos de contacto no se exponen.
          </Text>

          <Text className="mt-8 font-sans-medium text-xs text-slate-300">Tipo de aporte</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {CATEGORIES.map(([key, label]) => {
              const active = key === category;
              return (
                <Pressable97
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: active }}
                  onPress={() => setCategory(key)}
                  className="rounded-full border px-4 py-2.5"
                  style={{ borderColor: active ? '#FBBF2455' : '#FFFFFF18', backgroundColor: active ? '#FBBF2414' : '#FFFFFF08' }}
                >
                  <Text className="font-sans-medium text-xs" style={{ color: active ? '#FCD34D' : '#94A3B8' }}>{label}</Text>
                </Pressable97>
              );
            })}
          </View>

          <GlassCard className="mt-6 p-5">
            <Text className="font-sans-medium text-xs text-slate-300">Descripción breve</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              placeholder="Ej. 20 kg de arroz disponibles esta semana"
              placeholderTextColor="#64748b"
              className="mt-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 font-sans text-sm text-plata"
            />
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="font-sans-medium text-xs text-slate-300">Cantidad</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor="#64748b"
                  className="mt-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 font-mono text-sm text-plata"
                />
              </View>
              <View className="flex-1">
                <Text className="font-sans-medium text-xs text-slate-300">Unidad</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  maxLength={24}
                  placeholder="kg, cajas…"
                  placeholderTextColor="#64748b"
                  className="mt-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 font-sans text-sm text-plata"
                />
              </View>
            </View>
            <Text className="mt-4 font-sans-medium text-xs text-slate-300">¿Hasta cuántos km puede moverse?</Text>
            <TextInput
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor="#64748b"
              className="mt-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 font-mono text-sm text-plata"
            />
          </GlassCard>

          <View className="mt-5">
            <GeoAttributionCard
              value={context}
              onChange={setContext}
              accent="#FBBF24"
              title="¿Dónde existe este recurso?"
              description="Marcá su origen o un punto útil del área de servicio. El pin exacto queda local; la red recibe la precisión que elijas."
            />
          </View>

          <Pressable97
            accessibilityRole="checkbox"
            accessibilityState={{ checked: publish }}
            accessibilityLabel="Autorizar publicación del recibo visible"
            onPress={() => {
              setSaveError(null);
              setPublish((value) => !value);
            }}
            className="mt-5 flex-row items-start gap-3 rounded-2xl border bg-white/[0.04] p-4"
            style={{ borderColor: publish ? '#A78BFA55' : '#FBBF2455' }}
          >
            <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border" style={{ borderColor: publish ? '#A78BFA' : '#475569', backgroundColor: publish ? '#7D5BDE' : 'transparent' }}>
              {publish && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-xs text-slate-200">Autorizo publicar este aporte</Text>
              <Text className="mt-1 font-sans text-[11px] leading-5 text-slate-500">
                Se comparte la proyección elegida, el nombre del lugar y la firma que viste en el recibo. Nunca el punto exacto local ni datos de contacto.
              </Text>
            </View>
          </Pressable97>

          <View
            accessibilityLiveRegion="polite"
            className="mt-5 flex-row items-center gap-2 rounded-2xl border px-4 py-3"
            style={{
              borderColor: publicationIssue || saveError ? '#FBBF2438' : '#34D39938',
              backgroundColor: publicationIssue || saveError ? '#FBBF240D' : '#34D3990D',
            }}
          >
            <Ionicons
              name={publicationIssue || saveError ? 'information-circle-outline' : 'checkmark-circle-outline'}
              size={17}
              color={publicationIssue || saveError ? '#FCD34D' : '#6EE7B7'}
            />
            <Text
              className="flex-1 font-sans text-[11px] leading-5"
              style={{ color: publicationIssue || saveError ? '#FDE68A' : '#A7F3D0' }}
            >
              {saveError ?? publicationIssue ?? 'Todo listo. Ya podés ofrecer este recurso.'}
            </Text>
          </View>

          <View className="mt-8 items-center">
            <AccentButton label={saving ? 'Poniéndolo en movimiento…' : 'Ofrecer este recurso'} onPress={save} disabled={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
