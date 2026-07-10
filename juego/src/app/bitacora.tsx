/**
 * Bitácora (spec §2): tus reflexiones de la luz VER, agrupadas por mes.
 * Privada y en calma — nadie más las lee, nada acá suma puntos. Tocar
 * una la expande para releerla entera.
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { ESTADOS_VACIOS, PREGUNTAS } from '@/content';
import { reflexionesTodas } from '@/db/repos';
import type { ReflectionRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const PREGUNTA_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

const tituloMes = (clave: string): string => {
  const [y, m] = clave.split('-').map(Number) as [number, number];
  return `${MESES[m - 1]} ${y}`;
};

const diaLindo = (fecha: string): string => {
  const [, m, d] = fecha.split('-').map(Number) as [number, number, number];
  return `${d} de ${MESES[m - 1]}`;
};

interface GrupoMes {
  clave: string; // YYYY-MM
  items: ReflectionRow[];
}

const agruparPorMes = (rows: ReflectionRow[]): GrupoMes[] => {
  // Más nuevas arriba, dentro y entre meses.
  const desc = [...rows].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const grupos: GrupoMes[] = [];
  for (const r of desc) {
    const clave = r.fecha.slice(0, 7);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.clave === clave) ultimo.items.push(r);
    else grupos.push({ clave, items: [r] });
  }
  return grupos;
};

export default function Bitacora() {
  const insets = useSafeAreaInsets();
  const [reflexiones, setReflexiones] = useState<ReflectionRow[]>([]);
  const [abierta, setAbierta] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setReflexiones(reflexionesTodas());
    }, []),
  );

  const grupos = agruparPorMes(reflexiones);

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Bitácora" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {reflexiones.length === 0 ? (
          <Animated.View entering={fadeUp} className="mt-16 items-center">
            <GlassCard className="w-full p-6">
              <Text className="font-serif text-2xl text-plata">Todavía nada.</Text>
              <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
                {ESTADOS_VACIOS.bitacora}
              </Text>
            </GlassCard>
          </Animated.View>
        ) : (
          <>
            <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
              Nadie más las lee: son tuyas.
            </Text>
            {grupos.map((g) => (
              <View key={g.clave}>
                <Text className="mb-3 mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                  {tituloMes(g.clave)}
                </Text>
                <View className="gap-2.5">
                  {g.items.map((r, i) => {
                    const pregunta = PREGUNTA_POR_ID.get(r.preguntaId);
                    const expandida = abierta === r.id;
                    return (
                      <Animated.View key={r.id} entering={staggerDelay(Math.min(i, 6))}>
                        <Pressable97
                          accessibilityRole="button"
                          accessibilityLabel={`Reflexión del ${diaLindo(r.fecha)}`}
                          onPress={() => setAbierta(expandida ? null : r.id)}
                          silent
                        >
                          <GlassCard className="p-4">
                            <Text className="font-mono text-[10px] text-slate-500">
                              {diaLindo(r.fecha)}
                            </Text>
                            {pregunta && (
                              <Text
                                numberOfLines={expandida ? undefined : 1}
                                className="mt-2 font-sans text-xs leading-5 text-slate-400"
                              >
                                {pregunta.texto}
                              </Text>
                            )}
                            <Text
                              numberOfLines={expandida ? undefined : 2}
                              className="mt-2.5 font-serif-italic text-base leading-7 text-slate-200"
                            >
                              «{r.texto}»
                            </Text>
                            {expandida && pregunta && (
                              <Text className="mt-3 font-sans text-[10px] text-slate-600">
                                la pregunta venía de «{pregunta.fuente}»
                              </Text>
                            )}
                          </GlassCard>
                        </Pressable97>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
