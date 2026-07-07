import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import {
  cambiarEstado,
  crearCampana,
  fetchPlantillas,
  type CampaignFieldType,
  type Plantilla,
} from '@/api/campanas';
import { fetchCirculos } from '@/api/circulos';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { GlifoCirculo } from '@/features/circulos/GlifoCirculo';
import { fadeUp, slideLeftIn, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { ACCENT_TEXT, PLATA } from '@/theme/tokens';

const FIELD_TYPE_LABEL: Record<CampaignFieldType, string> = {
  text: 'texto',
  number: 'número',
  select: 'opciones',
  photo: 'foto',
  rating: 'puntaje',
};

type Paso = 'circulo' | 'plantilla' | 'editar';

/**
 * Lanzar una campaña: elegir círculo → elegir plantilla → ajustar y salir.
 * La campaña nace en borrador y se activa sola al crearla desde acá.
 */
export default function CrearCampana() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ circleId?: string }>();
  const circleIdParam = params.circleId ? Number(params.circleId) : null;
  const queryClient = useQueryClient();

  const [circleId, setCircleId] = useState<number | null>(
    circleIdParam && Number.isFinite(circleIdParam) ? circleIdParam : null,
  );
  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetEntries, setTargetEntries] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetProvince, setTargetProvince] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const paso: Paso = circleId === null ? 'circulo' : plantilla === null ? 'plantilla' : 'editar';

  const misCirculos = useQuery({
    queryKey: ['circulos'],
    queryFn: () => fetchCirculos(),
    select: (all) => all.filter((c) => c.isMember),
    enabled: paso === 'circulo',
  });

  const plantillas = useQuery({
    queryKey: ['plantillas'],
    queryFn: fetchPlantillas,
    enabled: circleId !== null,
  });

  const elegirPlantilla = (p: Plantilla) => {
    haptic.tick();
    setPlantilla(p);
    setTitle(p.title);
    setDescription(p.description ?? '');
  };

  const lanzar = async () => {
    if (!circleId || !plantilla) return;
    setError(null);
    setEnviando(true);
    haptic.send();
    try {
      const target = parseInt(targetEntries, 10);
      const campana = await crearCampana(circleId, {
        templateId: plantilla.id,
        type: plantilla.type,
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(Number.isInteger(target) && target > 0 ? { targetEntries: target } : {}),
        ...(deadline.trim() ? { deadline: deadline.trim() } : {}),
        ...(plantilla.type === 'consulta' && targetProvince.trim()
          ? { targetProvince: targetProvince.trim() }
          : {}),
        ...(plantilla.type === 'consulta' && targetCity.trim()
          ? { targetCity: targetCity.trim() }
          : {}),
      });
      // Nace en borrador — la activamos para que empiece a recibir luz ya.
      try {
        await cambiarEstado(campana.id, 'activa');
      } catch {
        // Si la activación falla, la campaña queda en borrador y se activa
        // desde su pantalla de detalle.
      }
      haptic.celebrate();
      await queryClient.invalidateQueries({ queryKey: ['campanas'] });
      router.replace(`/campanas/${campana.id}`);
    } catch (e) {
      setError(
        e instanceof ApiRequestError ? e.message : 'No pudimos crear la campaña. Probá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Lanzar campaña" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Paso 1: ¿desde qué círculo? */}
        {paso === 'circulo' && (
          <Animated.View entering={fadeUp}>
            <Text className="font-serif text-xl text-white">¿Desde qué círculo?</Text>
            <Text className="mt-2 font-sans text-sm leading-5 text-slate-400">
              Las campañas las lanza un círculo. En los coordinados decide quien coordina;
              en los abiertos, cualquier miembro.
            </Text>
            {misCirculos.isLoading && <ActivityIndicator className="mt-8" color="#94a3b8" />}
            {misCirculos.isSuccess && misCirculos.data.length === 0 && (
              <GlassCard className="mt-6 p-5">
                <Text className="font-sans text-sm leading-5 text-slate-400">
                  Todavía no sos parte de ningún círculo. Sumate a uno o creá el tuyo.
                </Text>
                <View className="mt-4">
                  <AccentButton label="Ver círculos" onPress={() => router.replace('/circulos')} />
                </View>
              </GlassCard>
            )}
            <View className="mt-5 gap-3">
              {(misCirculos.data ?? []).map((c, i) => (
                <Animated.View key={c.id} entering={staggerDelay(i)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={c.name}
                    onPress={() => {
                      haptic.tick();
                      setCircleId(c.id);
                    }}
                  >
                    <GlassCard className="flex-row items-center p-4">
                      <GlifoCirculo id={c.id} />
                      <Text
                        className="ml-3 flex-1 font-sans-semibold text-base text-white"
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#64748b" />
                    </GlassCard>
                  </Pressable97>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Paso 2: plantilla */}
        {paso === 'plantilla' && (
          <Animated.View entering={slideLeftIn}>
            <Text className="font-serif text-xl text-white">¿Qué van a relevar?</Text>
            <Text className="mt-2 font-sans text-sm leading-5 text-slate-400">
              Elegí una plantilla: el formulario ya viene armado para cargar rápido en la calle.
            </Text>
            {plantillas.isLoading && <ActivityIndicator className="mt-8" color="#94a3b8" />}
            {plantillas.isError && (
              <Text className="mt-8 text-center font-sans text-sm text-slate-400">
                No pudimos cargar las plantillas. Probá de nuevo.
              </Text>
            )}
            <View className="mt-5 gap-3">
              {(plantillas.data ?? []).map((p, i) => (
                <Animated.View key={p.id} entering={staggerDelay(i)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={p.title}
                    onPress={() => elegirPlantilla(p)}
                  >
                    <GlassCard className="p-4">
                      <View className="flex-row items-center">
                        <View
                          className="mr-2 rounded-full"
                          style={{ width: 8, height: 8, backgroundColor: p.mapColor ?? PLATA }}
                        />
                        <Text
                          className="flex-1 font-sans-semibold text-base text-white"
                          numberOfLines={1}
                        >
                          {p.title}
                        </Text>
                        <View className="rounded-full bg-white/5 px-2 py-0.5">
                          <Text className="font-sans text-[10px] text-slate-400">
                            {p.type === 'relevamiento' ? 'Relevamiento' : 'Consulta'}
                          </Text>
                        </View>
                      </View>
                      {p.description && (
                        <Text className="mt-1 font-sans text-sm leading-5 text-slate-400">
                          {p.description}
                        </Text>
                      )}
                    </GlassCard>
                  </Pressable97>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Paso 3: ajustar y lanzar */}
        {paso === 'editar' && plantilla && (
          <Animated.View entering={slideLeftIn}>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Cambiar plantilla"
              className="mb-4 flex-row items-center"
              onPress={() => setPlantilla(null)}
            >
              <Ionicons name="arrow-back" size={16} color={ACCENT_TEXT} />
              <Text className="ml-1 font-sans text-sm text-accent-text">Cambiar plantilla</Text>
            </Pressable97>

            <GlassCard className="p-4">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Título de la campaña"
                placeholderTextColor="#64748b"
                className="font-sans text-base text-white"
                maxLength={120}
              />
            </GlassCard>
            <GlassCard className="mt-3 p-4">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="¿Para qué es esta campaña? (opcional)"
                placeholderTextColor="#64748b"
                multiline
                className="min-h-16 font-sans text-base text-white"
                maxLength={1000}
              />
            </GlassCard>

            <View className="mt-3 flex-row gap-3">
              <GlassCard className="flex-1 p-4">
                <Text className="font-sans text-[11px] text-slate-500">Meta de entradas</Text>
                <TextInput
                  value={targetEntries}
                  onChangeText={setTargetEntries}
                  placeholder="120"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  className="mt-1 font-mono text-base text-white"
                  maxLength={6}
                />
              </GlassCard>
              <GlassCard className="flex-1 p-4">
                <Text className="font-sans text-[11px] text-slate-500">Fecha límite</Text>
                <TextInput
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="2026-08-31"
                  placeholderTextColor="#64748b"
                  autoCorrect={false}
                  className="mt-1 font-mono text-base text-white"
                  maxLength={10}
                />
              </GlassCard>
            </View>

            {plantilla.type === 'consulta' && (
              <View className="mt-3 gap-3">
                <Text className="mt-2 font-sans text-sm leading-5 text-slate-400">
                  ¿Para gente de qué zona es la consulta? Sin zona, responde todo el país.
                </Text>
                <GlassCard className="p-4">
                  <TextInput
                    value={targetProvince}
                    onChangeText={setTargetProvince}
                    placeholder="Provincia (opcional)"
                    placeholderTextColor="#64748b"
                    className="font-sans text-base text-white"
                    maxLength={100}
                  />
                </GlassCard>
                <GlassCard className="p-4">
                  <TextInput
                    value={targetCity}
                    onChangeText={setTargetCity}
                    placeholder="Ciudad (opcional)"
                    placeholderTextColor="#64748b"
                    className="font-sans text-base text-white"
                    maxLength={100}
                  />
                </GlassCard>
              </View>
            )}

            {/* Vista previa del formulario que va a cargar la gente */}
            {plantilla.formSchema && (
              <View className="mt-6">
                <SectionBadge>El formulario</SectionBadge>
                <View className="mt-3 gap-2">
                  {plantilla.formSchema.fields.map((field) => (
                    <GlassCard key={field.key} className="flex-row items-center px-4 py-3">
                      <Text className="flex-1 font-sans text-sm text-slate-300" numberOfLines={1}>
                        {field.label}
                        {field.required ? '' : '  (opcional)'}
                      </Text>
                      <View className="rounded-full bg-white/5 px-2 py-0.5">
                        <Text className="font-sans text-[10px] text-slate-500">
                          {FIELD_TYPE_LABEL[field.type]}
                        </Text>
                      </View>
                    </GlassCard>
                  ))}
                </View>
              </View>
            )}

            {error && (
              <Text className="mt-4 font-sans text-sm text-senal-basta">{error}</Text>
            )}

            <View className="mt-8">
              <AccentButton
                label={enviando ? 'Lanzando…' : 'Lanzar campaña'}
                disabled={enviando || title.trim().length < 3}
                onPress={lanzar}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
