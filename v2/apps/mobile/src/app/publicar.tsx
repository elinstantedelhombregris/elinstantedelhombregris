import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { BotonTinta, ChipTipo, GranoPapel, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { recordContextDraftFor } from '@/civic/record-context';
import { observationsAll, publishObservation, recordConsent, updateObservationContext } from '@/civic/repo';
import type { CivicRecordContextDraft } from '@/civic/types';
import type { CivicObservationRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { VIOLETA } from '@/theme/tokens';

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
          <Kicker>control en tus manos</Kicker>
          <TituloAnton tamano="lg" className="mt-1">Tu cielo es privado. El mapa común es una elección.</TituloAnton>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
        <Animated.View entering={fadeUp}>
          <Text className="font-archivo text-sm leading-6 text-tinta-75">
            Revisá cada captura antes de compartirla. La versión territorial reduce la ubicación y nunca incluye rutas de fotos del dispositivo.
          </Text>
        </Animated.View>

        <Kicker tono="neutro" className="mt-8">Capturas privadas</Kicker>
        {drafts.length > 0 ? (
          <View className="mt-3 gap-3">
            {drafts.map((observation, index) => (
              <Animated.View key={observation.id} entering={staggerDelay(index)}>
                <PapelCard className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-archivo-bold text-lg text-tinta">{observation.title}</Text>
                      {observation.summary && <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{observation.summary}</Text>}
                    </View>
                    <ChipTipo etiqueta="privada" />
                  </View>
                  <Text className="mt-4 font-archivo text-[11px] text-tinta-50">
                    {observation.locationLabel
                      ? `Se verá como ${observation.publicPrecision} · ${observation.locationLabel}`
                      : 'Falta confirmar el lugar antes de publicar'}
                  </Text>
                  <View className="mt-4 items-start">
                    <BotonTinta
                      etiqueta={editing?.id === observation.id ? 'Cerrar revisión' : 'Revisar lugar y firma'}
                      variante="fantasma"
                      tamano="compacto"
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
                    />
                  </View>
                  {editing?.id === observation.id && (
                    <View className="mt-4">
                      <GeoAttributionCard
                        value={editing.value}
                        onChange={(value) => setEditing({ id: observation.id, value })}
                        accent={VIOLETA}
                        title="Pasaporte de esta captura"
                        description="Corregí el pin del hecho, elegí cuánto verá el mapa y decidí si querés firmarlo."
                      />
                    </View>
                  )}
                  <View className="mt-5 items-center">
                    <BotonTinta
                      etiqueta="Sumar al mapa común"
                      variante="fantasma"
                      accessibilityLabel={`Publicar ${observation.title}`}
                      onPress={() => publish(observation)}
                    />
                  </View>
                </PapelCard>
              </Animated.View>
            ))}
          </View>
        ) : (
          <PapelCard className="mt-3 items-center p-8">
            <TituloAnton tamano="md" className="text-center">Vos decidiste sobre cada señal.</TituloAnton>
            <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-75">Las próximas capturas privadas van a aparecer acá.</Text>
            <View className="mt-5">
              <BotonTinta
                etiqueta="Volver al territorio"
                accessibilityLabel="Volver al territorio"
                onPress={() => router.replace('/territorio')}
              />
            </View>
          </PapelCard>
        )}
      </ScrollView>
    </View>
  );
}
