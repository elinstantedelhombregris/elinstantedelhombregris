import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { recordContextDraftFor } from '@/civic/record-context';
import { observationsAll, publishObservation, recordConsent, updateObservationContext } from '@/civic/repo';
import type { CivicRecordContextDraft } from '@/civic/types';
import type { CivicObservationRow } from '@/db/schema';
import { staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

export default function Publicar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drafts, setDrafts] = useState<CivicObservationRow[]>([]);
  const [editing, setEditing] = useState<{ id: string; value: CivicRecordContextDraft } | null>(null);
  const refresh = useCallback(() => {
    setDrafts(observationsAll().filter((item) => item.status === 'draft'));
  }, []);
  useFocusEffect(refresh);

  const publish = (observation: CivicObservationRow) => {
    const context = editing?.id === observation.id
      ? editing.value
      : recordContextDraftFor('observation', observation.id, {
          point: observation.exactLat == null || observation.exactLng == null
            ? null
            : { lat: observation.exactLat, lng: observation.exactLng },
          locationLabel: observation.locationLabel ?? '',
          sharedPrecision: observation.publicPrecision === 'exact' ? '100m' : observation.publicPrecision,
        });
    if (!isGeoAttributionReady(context)) {
      setEditing({ id: observation.id, value: context });
      return;
    }
    updateObservationContext(observation.id, {
      ...context,
      audience: 'collective',
      locationConsent: true,
      attributionConsent: context.attributionMode !== 'anonymous',
      confirmedAt: new Date().toISOString(),
    });
    recordConsent({
      scope: 'publish',
      purpose: `Publicar “${observation.title}” con ubicación reducida y sin archivos locales.`,
      granted: true,
    });
    publishObservation(observation.id);
    setEditing(null);
    haptic.send();
    refresh();
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Mapa común" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
        <View className="mt-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#121018] p-6">
          <LivingHalo />
          <Text className="font-sans text-[10px] uppercase tracking-[2.5px] text-violet-300">Control en tus manos</Text>
          <Text className="mt-3 font-serif text-[30px] leading-[39px] text-plata">Tu cielo es privado. El mapa común es una elección.</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
            Revisá cada captura antes de compartirla. La versión territorial reduce la ubicación y nunca incluye rutas de fotos del dispositivo.
          </Text>
        </View>

        <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">Capturas privadas</Text>
        {drafts.length > 0 ? (
          <View className="mt-3 gap-3">
            {drafts.map((observation, index) => (
              <Animated.View key={observation.id} entering={staggerDelay(index)}>
                <GlassCard className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-serif text-xl text-plata">{observation.title}</Text>
                      {observation.summary && <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{observation.summary}</Text>}
                    </View>
                    <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <Text className="font-mono text-[9px] uppercase text-slate-500">privada</Text>
                    </View>
                  </View>
                  <View className="mt-4 flex-row items-center gap-2">
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text className="font-sans text-[11px] text-slate-500">
                      {observation.locationLabel
                        ? `Se verá como ${observation.publicPrecision} · ${observation.locationLabel}`
                        : 'Falta confirmar el lugar antes de publicar'}
                    </Text>
                  </View>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={`Revisar lugar y firma de ${observation.title}`}
                    onPress={() => setEditing((current) => current?.id === observation.id
                      ? null
                      : { id: observation.id, value: recordContextDraftFor('observation', observation.id, {
                          point: observation.exactLat == null || observation.exactLng == null
                            ? null
                            : { lat: observation.exactLat, lng: observation.exactLng },
                          locationLabel: observation.locationLabel ?? '',
                          sharedPrecision: observation.publicPrecision === 'exact' ? '100m' : observation.publicPrecision,
                        }) })}
                    className="mt-4 min-h-11 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4"
                  >
                    <Ionicons name="location-outline" size={15} color="#C4B5FD" />
                    <Text className="font-sans-semibold text-xs text-violet-200">
                      {editing?.id === observation.id ? 'Cerrar revisión' : 'Revisar lugar y firma'}
                    </Text>
                  </Pressable97>
                  {editing?.id === observation.id && (
                    <View className="mt-4">
                      <GeoAttributionCard
                        value={editing.value}
                        onChange={(value) => setEditing({ id: observation.id, value })}
                        title="Pasaporte de esta captura"
                        description="Corregí el pin del hecho, elegí cuánto verá el mapa y decidí si querés firmarlo."
                      />
                    </View>
                  )}
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={`Publicar ${observation.title}`}
                    onPress={() => publish(observation)}
                    className="mt-5 flex-row items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5"
                  >
                    <Ionicons name="sparkles" size={15} color="white" />
                    <Text className="font-sans-semibold text-xs text-white">Sumar al mapa común</Text>
                  </Pressable97>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View className="mt-3 items-center rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <Ionicons name="checkmark-circle-outline" size={30} color="#6EE7B7" />
            <Text className="mt-4 text-center font-serif text-2xl text-plata">Vos decidiste sobre cada señal.</Text>
            <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-400">Las próximas capturas privadas van a aparecer acá.</Text>
            <Pressable97 accessibilityRole="button" accessibilityLabel="Volver al territorio" onPress={() => router.replace('/territorio')} className="mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-3">
              <Text className="font-sans-medium text-xs text-plata">Volver al territorio</Text>
            </Pressable97>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
