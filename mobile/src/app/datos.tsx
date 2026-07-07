import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchMiAporte, fetchNacional, type NacionalDashboard } from '@/api/dashboards';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { BarraLuminosa } from '@/features/campanas/BarraLuminosa';
import { RADAR_TYPE_MAP, type RadarTypeKey } from '@/lib/radar-types';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useIsLoggedIn } from '@/stores/auth';
import { PLATA } from '@/theme/tokens';

/**
 * DATOS — dashboards editoriales: primero el número enorme y la frase,
 * después las barras. Los datos se cuentan como los ensayos, no como
 * un panel de administración.
 */
export default function Datos() {
  const insets = useSafeAreaInsets();
  const isLoggedIn = useIsLoggedIn();

  const nacional = useQuery({
    queryKey: ['dashboard-nacional'],
    queryFn: fetchNacional,
    staleTime: 15 * 60 * 1000,
  });

  const miAporte = useQuery({
    queryKey: ['mi-aporte'],
    queryFn: fetchMiAporte,
    enabled: isLoggedIn,
  });

  const resumen = useMemo(() => resumirNacional(nacional.data), [nacional.data]);

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Datos" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {nacional.isLoading && (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#94a3b8" />
          </View>
        )}
        {nacional.isError && (
          <Text className="mt-16 text-center font-sans text-sm text-slate-400">
            No pudimos cargar el panorama nacional. Probá de nuevo.
          </Text>
        )}

        {resumen && (
          <>
            {/* El país esta semana */}
            <Animated.View entering={fadeUp} className="mt-2">
              <SectionBadge>El país esta semana</SectionBadge>
              <Text className="mt-4 font-mono text-6xl text-plata">
                {resumen.semanaActual}
              </Text>
              <Text className="mt-2 font-sans text-sm leading-6 text-slate-400">
                {resumen.semanaActual === 1
                  ? 'Esta semana una persona dijo lo suyo en el mapa.'
                  : `Esta semana ${resumen.semanaActual} personas dijeron lo suyo en el mapa.`}
              </Text>
              <View className="mt-5 gap-2">
                {resumen.porTipo.map((t, i) => (
                  <Animated.View key={t.type} entering={staggerDelay(i)}>
                    <View className="flex-row items-center">
                      <Text className="w-28 font-sans text-xs text-slate-400" numberOfLines={1}>
                        {t.label}
                      </Text>
                      <View className="ml-2 flex-1">
                        <BarraLuminosa
                          pct={Math.round((t.count / resumen.maxTipo) * 100)}
                          color={t.color}
                          height={4}
                        />
                      </View>
                      <Text className="ml-2 w-12 text-right font-mono text-xs text-plata">
                        {t.count}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
              <Text className="mt-3 font-sans text-[11px] text-slate-500">
                Últimas 12 semanas, todo el país.
              </Text>
            </Animated.View>

            {/* Ranking de provincias */}
            {resumen.provincias.length > 0 && (
              <Animated.View entering={fadeUp} className="mt-10">
                <SectionBadge>Dónde suena más fuerte</SectionBadge>
                <Text className="mt-4 font-mono text-6xl text-plata">
                  {resumen.provincias[0]?.count ?? 0}
                </Text>
                <Text className="mt-2 font-sans text-sm leading-6 text-slate-400">
                  {resumen.provincias[0]
                    ? `${resumen.provincias[0].province} encabeza la constelación.`
                    : ''}
                </Text>
                <View className="mt-5 gap-2">
                  {resumen.provincias.map((p, i) => (
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
                            pct={Math.round((p.count / resumen.maxProvincia) * 100)}
                            color={PLATA}
                            height={4}
                          />
                        </View>
                        <Text className="ml-2 w-12 text-right font-mono text-xs text-plata">
                          {p.count}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Campañas activas */}
            <Animated.View entering={fadeUp} className="mt-10">
              <SectionBadge>Misiones en curso</SectionBadge>
              <Text className="mt-4 font-mono text-6xl text-plata">
                {resumen.activeCampaigns}
              </Text>
              <Text className="mt-2 font-sans text-sm leading-6 text-slate-400">
                {resumen.activeCampaigns === 1
                  ? 'Una campaña está iluminando el mapa ahora mismo.'
                  : `${resumen.activeCampaigns} campañas están iluminando el mapa ahora mismo.`}
              </Text>
            </Animated.View>
          </>
        )}

        {/* Mi aporte */}
        {isLoggedIn && miAporte.data && (
          <Animated.View entering={fadeUp} className="mt-10">
            <SectionBadge>Mi aporte</SectionBadge>
            <Text className="mt-2 font-sans text-sm leading-6 text-slate-400">
              Tu constelación personal — cada aporte es una estrella que ya nadie apaga.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <Stat label="Señales" value={miAporte.data.senales} />
              <Stat label="Compromisos" value={miAporte.data.compromisos} />
              <Stat label="Recursos" value={miAporte.data.recursos} />
              <Stat label="Entradas" value={miAporte.data.entradas} />
              <Stat label="Verificadas" value={miAporte.data.entradasVerificadas} />
              <Stat label="Campañas" value={miAporte.data.campanasCreadas} />
              <Stat label="Círculos" value={miAporte.data.circulos} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <GlassCard className="items-center px-5 py-4" style={{ minWidth: '30%', flexGrow: 1 }}>
      <Text className="font-mono text-2xl text-plata">{value}</Text>
      <Text className="mt-1 font-sans text-[11px] text-slate-500">{label}</Text>
    </GlassCard>
  );
}

// ── Reducción editorial del dashboard nacional ──

interface ResumenNacional {
  semanaActual: number;
  porTipo: Array<{ type: string; label: string; color: string; count: number }>;
  maxTipo: number;
  provincias: Array<{ province: string; count: number }>;
  maxProvincia: number;
  activeCampaigns: number;
}

function resumirNacional(data: NacionalDashboard | undefined): ResumenNacional | null {
  if (!data) return null;

  const ultimaSemana = data.totalsByTypeWeek.reduce(
    (max, row) => (row.week > max ? row.week : max),
    '',
  );
  const semanaActual = data.totalsByTypeWeek
    .filter((row) => row.week === ultimaSemana)
    .reduce((sum, row) => sum + row.count, 0);

  const porTipoMap = new Map<string, number>();
  for (const row of data.totalsByTypeWeek) {
    porTipoMap.set(row.type, (porTipoMap.get(row.type) ?? 0) + row.count);
  }
  const porTipo = Array.from(porTipoMap.entries())
    .map(([type, count]) => {
      const def = RADAR_TYPE_MAP[type as RadarTypeKey] as
        | (typeof RADAR_TYPE_MAP)[RadarTypeKey]
        | undefined;
      return {
        type,
        label: def?.label ?? type,
        color: def?.color ?? PLATA,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const provincias = data.provinceRanking.slice(0, 8);

  return {
    semanaActual,
    porTipo,
    maxTipo: Math.max(1, ...porTipo.map((t) => t.count)),
    provincias,
    maxProvincia: Math.max(1, ...provincias.map((p) => p.count)),
    activeCampaigns: data.activeCampaigns,
  };
}
