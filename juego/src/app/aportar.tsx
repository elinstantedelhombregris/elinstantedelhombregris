import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { BotonTinta, ChipTipo, GranoPapel, Kicker, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIVIC_CATEGORY_LABELS } from '@/civic/labels';
import { defaultRecordContextDraft } from '@/civic/record-context';
import { createResource, recordConsent } from '@/civic/repo';
import { fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { CIAN, TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

const CATEGORIES = Object.entries(CIVIC_CATEGORY_LABELS).filter(([key]) => key !== 'red-comunitaria-alimentaria');

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

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
  const [enfocadoTitulo, setEnfocadoTitulo] = useState(false);
  const [enfocadoCantidad, setEnfocadoCantidad] = useState(false);
  const [enfocadoUnidad, setEnfocadoUnidad] = useState(false);
  const [enfocadoRadio, setEnfocadoRadio] = useState(false);
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
          <Kicker>recurso concreto</Kicker>
          <TituloAnton tamano="lg" className="mt-1">¿Qué podés poner en movimiento?</TituloAnton>
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
        >
          <Animated.View entering={fadeUp}>
            <Text className="font-archivo text-sm leading-6 text-tinta-75">
              Publicá disponibilidad real, con cantidad y radio. Cuando ambas partes aceptan, se abre una sala protegida para acordar la coordinación; los datos de contacto no se exponen.
            </Text>

            <Kicker tono="neutro" className="mt-8">Tipo de aporte</Kicker>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {CATEGORIES.map(([key, label]) => (
                <ChipTipo
                  key={key}
                  etiqueta={label}
                  activo={key === category}
                  color={CIAN}
                  onPress={() => setCategory(key)}
                />
              ))}
            </View>

            <Kicker tono="neutro" className="mt-6">Descripción breve</Kicker>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onFocus={() => setEnfocadoTitulo(true)}
              onBlur={() => setEnfocadoTitulo(false)}
              maxLength={80}
              placeholder="Ej. 20 kg de arroz disponibles esta semana"
              placeholderTextColor={TINTA_50}
              accessibilityLabel="Descripción breve del recurso"
              className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-sm text-tinta"
              style={estiloInput(enfocadoTitulo)}
            />

            <View className="mt-6 flex-row gap-3">
              <View className="flex-1">
                <Kicker tono="neutro">Cantidad</Kicker>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  onFocus={() => setEnfocadoCantidad(true)}
                  onBlur={() => setEnfocadoCantidad(false)}
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor={TINTA_50}
                  accessibilityLabel="Cantidad disponible"
                  className="mt-2 bg-papel-crudo px-5 py-4 font-space text-sm text-tinta"
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
                  maxLength={24}
                  placeholder="kg, cajas…"
                  placeholderTextColor={TINTA_50}
                  accessibilityLabel="Unidad de medida"
                  className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-sm text-tinta"
                  style={estiloInput(enfocadoUnidad)}
                />
              </View>
            </View>

            <Kicker tono="neutro" className="mt-6">¿Hasta cuántos km puede moverse?</Kicker>
            <TextInput
              value={radius}
              onChangeText={setRadius}
              onFocus={() => setEnfocadoRadio(true)}
              onBlur={() => setEnfocadoRadio(false)}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={TINTA_50}
              accessibilityLabel="Radio en kilómetros"
              className="mt-2 bg-papel-crudo px-5 py-4 font-space text-sm text-tinta"
              style={estiloInput(enfocadoRadio)}
            />

            <View className="mt-6">
              <GeoAttributionCard
                value={context}
                onChange={setContext}
                accent={CIAN}
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
              className="mt-6 flex-row items-start gap-3 border border-tinta bg-papel-crudo p-4"
            >
              <View className={`mt-0.5 h-6 w-6 items-center justify-center border border-tinta ${publish ? 'bg-violeta' : 'bg-papel-presionado'}`} />
              <View className="flex-1">
                <Text className="font-archivo-bold text-sm text-tinta">Autorizo publicar este aporte</Text>
                <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                  Se comparte la proyección elegida, el nombre del lugar y la firma que viste en el recibo. Nunca el punto exacto local ni datos de contacto.
                </Text>
              </View>
            </Pressable97>

            <View
              accessibilityLiveRegion="polite"
              className={`mt-5 border px-4 py-3 ${publicationIssue || saveError ? 'border-ambar' : 'border-verde'}`}
            >
              <Text className="font-archivo text-xs leading-5 text-tinta-90">
                {saveError ?? publicationIssue ?? 'Todo listo. Ya podés ofrecer este recurso.'}
              </Text>
            </View>

            <View className="mt-8 items-center">
              <BotonTinta etiqueta="Ofrecer este recurso" onPress={save} disabled={saving} cargando={saving} />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
