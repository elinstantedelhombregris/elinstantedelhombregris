/**
 * Expediciones — el panel (spec §3.2). Dos secciones: "En curso" (las
 * tuyas, con su progreso luminoso) y "Para empezar" (las cinco plantillas
 * precargadas, gratis). Fundar la propia cuesta 15 brasas y vive en su
 * propia pantalla.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraLuminosa } from '@/components/juego/BarraLuminosa';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  ESTADOS_VACIOS,
  PLANTILLAS_EXPEDICION,
  SENAL_POR_KEY,
  type PlantillaExpedicion,
} from '@/content';
import { entradasDeExpedicion, expedicionesTodas, fundarExpedicion } from '@/db/repos';
import type { ExpeditionRow } from '@/db/schema';
import { COSTOS } from '@/game/brasas';
import { progresoExpedicion } from '@/game/expediciones';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

const ORIGEN_LABEL: Record<ExpeditionRow['origen'], string> = {
  propia: 'fundada por vos',
  precargada: 'del movimiento',
  qr: 'recibida por QR',
};

export default function Expediciones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();

  const [exps, setExps] = useState<ExpeditionRow[]>([]);
  const [conteos, setConteos] = useState<Map<string, number>>(new Map());

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      const todas = expedicionesTodas();
      setExps(todas);
      setConteos(new Map(todas.map((e) => [e.id, entradasDeExpedicion(e.id).length])));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Las activas primero, y dentro de cada grupo las más nuevas arriba.
  const ordenadas = [...exps].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'activa' ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const activaDePlantilla = (plantillaId: string): ExpeditionRow | undefined =>
    exps.find((e) => e.plantillaId === plantillaId && e.estado === 'activa');

  const jugarPrecargada = (p: PlantillaExpedicion) => {
    const yaActiva = activaDePlantilla(p.id);
    if (yaActiva) {
      router.push(`/expediciones/${yaActiva.id}`);
      return;
    }
    try {
      const row = fundarExpedicion({
        plantillaId: p.id,
        titulo: p.titulo,
        zona: 'Mi barrio',
        meta: p.metaSugerida,
        origen: 'precargada',
      });
      haptic.send();
      st.refresh();
      router.push(`/expediciones/${row.id}`);
    } catch {
      // precargada es gratis: si algo falla acá, no hay nada que cobrar
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Expediciones" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* ------------------------------------------------ En curso */}
        <Text className="mt-2 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          En curso
        </Text>

        {ordenadas.length === 0 ? (
          <GlassCard className="mt-3 p-5">
            <Text className="font-sans text-sm leading-6 text-slate-400">
              {ESTADOS_VACIOS.expediciones}
            </Text>
          </GlassCard>
        ) : (
          <View className="mt-3 gap-3">
            {ordenadas.map((e, i) => {
              const plantilla = PLANTILLAS_EXPEDICION.find((p) => p.id === e.plantillaId);
              const color = plantilla ? SENAL_POR_KEY[plantilla.senal].color : '#94a3b8';
              const entradas = conteos.get(e.id) ?? 0;
              const { porcentaje } = progresoExpedicion(entradas, e.meta);
              const hitos = JSON.parse(e.hitosOtorgados) as number[];
              return (
                <Animated.View key={e.id} entering={staggerDelay(i)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={`${e.titulo}, ${porcentaje} por ciento`}
                    onPress={() => router.push(`/expediciones/${e.id}`)}
                  >
                    <GlassCard className="p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center gap-2 pr-3">
                          {plantilla && (
                            <Ionicons
                              name={SENAL_POR_KEY[plantilla.senal].icon as never}
                              size={15}
                              color={color}
                            />
                          )}
                          <Text
                            numberOfLines={1}
                            className="flex-1 font-sans-semibold text-sm text-plata"
                          >
                            {e.titulo}
                          </Text>
                        </View>
                        {e.estado === 'completa' ? (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="checkmark-circle" size={14} color={color} />
                            <Text className="font-sans text-[11px]" style={{ color }}>
                              completa
                            </Text>
                          </View>
                        ) : (
                          <Text className="font-mono text-xs text-slate-400">
                            {entradas} de {e.meta}
                          </Text>
                        )}
                      </View>
                      <Text className="mt-1 font-sans text-[11px] text-slate-500">
                        {e.zona} · {ORIGEN_LABEL[e.origen]}
                      </Text>
                      <View className="mt-3">
                        <BarraLuminosa
                          porcentaje={porcentaje}
                          color={color}
                          hitosOtorgados={hitos}
                        />
                      </View>
                    </GlassCard>
                  </Pressable97>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* -------------------------------------------- Para empezar */}
        <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Para empezar
        </Text>
        <Text className="mt-1.5 font-sans text-xs leading-5 text-slate-500">
          Las del movimiento salen gratis: elegí una y jugala en tu barrio.
        </Text>

        <View className="mt-3 gap-3">
          {PLANTILLAS_EXPEDICION.map((p, i) => {
            const senal = SENAL_POR_KEY[p.senal];
            const enMarcha = activaDePlantilla(p.id) !== undefined;
            return (
              <Animated.View key={p.id} entering={staggerDelay(i)}>
                <GlassCard className="p-4">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${senal.color}22` }}
                    >
                      <Ionicons name={senal.icon as never} size={17} color={senal.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-sm text-plata">
                        {p.titulo}
                      </Text>
                      <Text className="mt-0.5 font-mono text-[10px] text-slate-500">
                        meta sugerida {p.metaSugerida} · ~{p.duracionDiasSugerida} días
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-3 font-sans text-xs leading-5 text-slate-400">
                    {p.descripcion}
                  </Text>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={
                      enMarcha ? `Seguir ${p.titulo}` : `Jugar ${p.titulo}`
                    }
                    onPress={() => jugarPrecargada(p)}
                    className="mt-4 flex-row items-center justify-center gap-2 self-start rounded-full border px-4 py-2"
                    style={{
                      borderColor: `${senal.color}55`,
                      backgroundColor: `${senal.color}14`,
                    }}
                  >
                    <Ionicons
                      name={enMarcha ? 'arrow-forward' : 'flag-outline'}
                      size={13}
                      color={senal.color}
                    />
                    <Text
                      className="font-sans-medium text-xs"
                      style={{ color: senal.color }}
                    >
                      {enMarcha ? 'Ya está en marcha — seguila' : 'Jugarla gratis'}
                    </Text>
                  </Pressable97>
                </GlassCard>
              </Animated.View>
            );
          })}
        </View>

        {/* -------------------------------------------- Fundá la tuya */}
        <Animated.View entering={fadeUp} className="mt-9 items-center">
          <AccentButton
            label="Fundá la tuya"
            onPress={() => router.push('/expediciones/fundar')}
          />
          <Text className="mt-3 text-center font-sans text-[11px] text-slate-500">
            Elegís plantilla, zona y meta. Cuesta {COSTOS.fundarExpedicion} brasas
            {'\n'}y después viaja por QR a quien quieras.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
