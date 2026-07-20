/**
 * Misiones del Protocolo Vivo (Mission Layer, §0x01) — el panel. Secciones
 * por estado: las vivas primero, las resueltas colapsadas al final (nada es
 * permanente; lo resuelto queda como memoria, no como pila creciente).
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { oficioPorId } from '@/content/oficios';
import { misionesTodas } from '@/db/repos-protocolo';
import type { PvMisionRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import type { EstadoMision } from '@/protocolo/tipos';

const ESTADO_LABEL: Record<EstadoMision, string> = {
  propuesta: 'Convocando',
  equipo: 'Equipo listo',
  activa: 'En marcha',
  verificacion: 'En verificación',
  resuelta: 'Resuelta',
  abandonada: 'Abandonada',
};

const SECCIONES: readonly EstadoMision[] = ['propuesta', 'equipo', 'activa', 'verificacion'];

export default function Misiones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [misiones, setMisiones] = useState<PvMisionRow[]>([]);
  const [verResueltas, setVerResueltas] = useState(false);

  useFocusEffect(useCallback(() => setMisiones(misionesTodas()), []));

  const resueltas = misiones.filter((m) => m.estado === 'resuelta');

  const irAlDetalle = (id: string) =>
    router.push({ pathname: '/misiones/[id]', params: { id } } as never);

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Misiones" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        {misiones.length === 0 ? (
          <GlassCard className="mt-3 p-5">
            <Text className="font-sans text-sm leading-6 text-slate-400">
              Ninguna misión todavía. La primera la puede fundar cualquiera —
              por ejemplo, vos.
            </Text>
          </GlassCard>
        ) : (
          SECCIONES.map((estado) => {
            const items = misiones.filter((m) => m.estado === estado);
            if (items.length === 0) return null;
            return (
              <View key={estado} className="mt-7">
                <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                  {ESTADO_LABEL[estado]}
                </Text>
                <View className="mt-3 gap-3">
                  {items.map((m, i) => (
                    <MisionCard key={m.id} mision={m} index={i} onPress={() => irAlDetalle(m.id)} />
                  ))}
                </View>
              </View>
            );
          })
        )}

        {resueltas.length > 0 && (
          <View className="mt-7">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={
                verResueltas ? 'Ocultar misiones resueltas' : `Ver ${resueltas.length} misiones resueltas`
              }
              accessibilityState={{ expanded: verResueltas }}
              onPress={() => setVerResueltas((v) => !v)}
              className="flex-row items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
            >
              <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-500">
                Resueltas · {resueltas.length}
              </Text>
              <Ionicons name={verResueltas ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
            </Pressable97>
            {verResueltas && (
              <View className="mt-3 gap-3">
                {resueltas.map((m, i) => (
                  <MisionCard key={m.id} mision={m} index={i} onPress={() => irAlDetalle(m.id)} />
                ))}
              </View>
            )}
          </View>
        )}

        <Animated.View entering={fadeUp} className="mt-9 items-center">
          <AccentButton label="Fundar una misión" onPress={() => router.push('/misiones/fundar' as never)} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MisionCard({
  mision,
  index,
  onPress,
}: {
  mision: PvMisionRow;
  index: number;
  onPress: () => void;
}) {
  const oficio = oficioPorId(mision.oficioId);
  return (
    <Animated.View entering={staggerDelay(index)}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={mision.titulo}
        onPress={onPress}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <View className="flex-row items-center gap-2">
          {oficio && <Ionicons name={oficio.icono as never} size={16} color={oficio.color} />}
          <Text numberOfLines={1} className="flex-1 font-sans-semibold text-sm text-plata">
            {mision.titulo}
          </Text>
          <Text className="font-mono text-[10px] uppercase text-slate-500">
            {ESTADO_LABEL[mision.estado as EstadoMision]}
          </Text>
        </View>
        <Text className="mt-1 font-sans text-xs leading-5 text-slate-400" numberOfLines={2}>
          {mision.proposito}
        </Text>
      </Pressable97>
    </Animated.View>
  );
}
