import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import {
  CAMPAIGN_STATUS_LABEL,
  fetchCampana,
  fetchProgreso,
} from '@/api/campanas';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { BarraLuminosa } from '@/features/campanas/BarraLuminosa';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { PLATA } from '@/theme/tokens';

/**
 * Detalle de campaña: el territorio a oscuras y cuánta luz ya se juntó.
 * "Iluminaste 34 de 120 luminarias" — el progreso es luminosidad.
 */
export default function CampanaDetalle() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);

  const campana = useQuery({
    queryKey: ['campana', id],
    queryFn: () => fetchCampana(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const progreso = useQuery({
    queryKey: ['campana-progreso', id],
    queryFn: () => fetchProgreso(id),
    enabled: campana.isSuccess,
    staleTime: 60 * 1000,
  });

  if (campana.isLoading) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Campaña" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#94a3b8" />
        </View>
      </View>
    );
  }

  if (campana.isError || !campana.data) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Campaña" />
        <Text className="mt-16 px-6 text-center font-sans text-sm text-slate-400">
          {campana.error instanceof ApiRequestError
            ? campana.error.message
            : 'No pudimos cargar la campaña. Probá de nuevo.'}
        </Text>
      </View>
    );
  }

  const c = campana.data;
  const color = c.mapColor ?? PLATA;
  const entries = progreso.data?.entries ?? c.entryCount;
  const pct = progreso.data?.progressPct ?? null;
  const esRelevamiento = c.type === 'relevamiento';
  const maxProvincia = Math.max(1, ...(progreso.data?.byProvince ?? []).map((p) => p.count));

  const capturar = () => {
    if (!useAuthStore.getState().user) {
      router.push('/identidad');
      return;
    }
    router.push(`/campanas/capturar?campaignId=${c.id}`);
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title={c.title} />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Animated.View entering={fadeUp}>
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full"
              style={{ width: 8, height: 8, backgroundColor: color }}
            />
            <Text className="font-sans text-xs text-slate-400">
              {esRelevamiento ? 'Relevamiento' : 'Consulta'} · {c.circleName}
            </Text>
            <View className="rounded-full bg-white/5 px-2 py-0.5">
              <Text className="font-sans text-[10px] text-slate-400">
                {CAMPAIGN_STATUS_LABEL[c.status]}
              </Text>
            </View>
          </View>

          {c.description && (
            <Text className="mt-4 font-sans text-sm leading-6 text-slate-300">
              {c.description}
            </Text>
          )}

          {/* Progreso como luminosidad */}
          <GlassCard className="mt-6 p-5">
            <Text className="font-mono text-4xl text-plata">
              {entries}
              {c.targetEntries ? (
                <Text className="font-mono text-xl text-slate-500"> de {c.targetEntries}</Text>
              ) : null}
            </Text>
            <Text className="mt-1 font-sans text-sm text-slate-400">
              {esRelevamiento
                ? entries === 1
                  ? 'punto iluminado hasta ahora'
                  : 'puntos iluminados hasta ahora'
                : entries === 1
                  ? 'voz respondió hasta ahora'
                  : 'voces respondieron hasta ahora'}
            </Text>
            <View className="mt-4">
              <BarraLuminosa pct={pct ?? (entries > 0 ? 100 : 0)} color={color} height={8} />
            </View>
            {progreso.data && progreso.data.entries > 0 && (
              <Text className="mt-3 font-sans text-xs text-slate-500">
                {progreso.data.verifiedPct}% verificadas por el círculo
              </Text>
            )}
            {c.deadline && (
              <Text className="mt-1 font-sans text-xs text-slate-500">
                Hasta el {c.deadline}
              </Text>
            )}
          </GlassCard>

          {/* Por provincia */}
          {(progreso.data?.byProvince ?? []).length > 0 && (
            <View className="mt-6">
              <SectionBadge>Dónde brilla</SectionBadge>
              <View className="mt-3 gap-2">
                {(progreso.data?.byProvince ?? []).slice(0, 6).map((p, i) => (
                  <Animated.View key={p.province} entering={staggerDelay(i)}>
                    <View className="flex-row items-center">
                      <Text
                        className="w-28 font-sans text-xs text-slate-400"
                        numberOfLines={1}
                      >
                        {p.province}
                      </Text>
                      <View className="ml-2 flex-1">
                        <BarraLuminosa
                          pct={Math.round((p.count / maxProvincia) * 100)}
                          color={color}
                          height={4}
                        />
                      </View>
                      <Text className="ml-2 w-8 text-right font-mono text-xs text-plata">
                        {p.count}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {c.targetProvince && !esRelevamiento && (
            <Text className="mt-6 font-sans text-xs leading-4 text-slate-500">
              Esta consulta es para gente de {c.targetCity ? `${c.targetCity}, ` : ''}
              {c.targetProvince}.
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* CTA — solo si la campaña está recibiendo entradas */}
      {c.status === 'activa' && (
        <View className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
          <AccentButton
            label={esRelevamiento ? 'Sumar entrada' : 'Responder'}
            onPress={capturar}
          />
          {esRelevamiento && (
            <Text className="mt-2 text-center font-sans text-xs text-slate-500">
              Los relevamientos los carga la gente del círculo.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
