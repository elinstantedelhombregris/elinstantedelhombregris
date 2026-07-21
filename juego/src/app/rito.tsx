/**
 * Rito de re-encendido (spec §2): la racha se apagó y vuelve a nacer en 1.
 * Releer una reflexión propia + 30 segundos de respiración guiada
 * (4 ciclos de expandir/contraer). Sin culpa: la recaída es parte del camino.
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ModalCielo } from '@/components/juego/ModalCielo';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RITO_REENCENDIDO } from '@/content';
import { reflexionesTodas, registrarRito } from '@/db/repos';
import type { ReflectionRow } from '@/db/schema';
import { bloom, fadeUp } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { glow } from '@/theme/glow';
import { haptic } from '@/theme/haptics';
import { PLATA } from '@/theme/tokens';

type Fase = 'intro' | 'reflexion' | 'respiracion' | 'cierre';

const MEDIO_CICLO_MS = 3750; // 4 ciclos de 7,5 s = 30 s

function Respiracion({ onTerminar }: { onTerminar: () => void }) {
  const escala = useSharedValue(1);
  const [faseRespiro, setFaseRespiro] = useState<'inhalá' | 'exhalá'>('inhalá');
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  useEffect(() => {
    // 4 ciclos: expandir (inhalar) y contraer (exhalar), 30 s en total.
    escala.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: MEDIO_CICLO_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: MEDIO_CICLO_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      4,
      false,
    );
    const medios = Array.from({ length: 8 }, (_, i) =>
      setTimeout(() => setFaseRespiro(i % 2 === 0 ? 'exhalá' : 'inhalá'), (i + 1) * MEDIO_CICLO_MS),
    );
    const fin = setTimeout(onTerminar, MEDIO_CICLO_MS * 8 + 300);
    return () => {
      medios.forEach(clearTimeout);
      clearTimeout(fin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 items-center justify-center py-16">
      <Animated.View
        style={[
          estilo,
          {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(245, 247, 250, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(245, 247, 250, 0.35)',
            ...glow(PLATA, 30, 0.35),
          },
        ]}
      />
      <Text className="mt-14 font-serif-italic text-2xl text-plata">{faseRespiro}</Text>
      <Text className="mt-2 font-sans text-xs text-slate-500">
        treinta segundos, nada más
      </Text>
    </View>
  );
}

export default function Rito() {
  const router = useRouter();
  const st = useJuego();
  const [fase, setFase] = useState<Fase>('intro');
  const [reflexiones] = useState<ReflectionRow[]>(() =>
    reflexionesTodas().slice(-20).reverse(),
  );
  const [elegida, setElegida] = useState<ReflectionRow | null>(null);

  const terminarRespiracion = () => {
    registrarRito();
    haptic.celebrate();
    st.refresh();
    setFase('cierre');
  };

  if (st.rachaInfo.viva && fase === 'intro') {
    // La Guía ya arde: acá no hay nada que reencender.
    return (
      <ModalCielo badge="Rito de re-encendido" onCerrar={() => router.back()}>
        <Text className="font-sans text-sm leading-6 text-slate-300">
          La Estrella Guía ya está encendida. El rito espera para cuando haga
          falta — ojalá sea nunca.
        </Text>
        <View className="mt-8 items-center">
          <AccentButton label="Volver al cielo" onPress={() => router.back()} />
        </View>
      </ModalCielo>
    );
  }

  return (
    <ModalCielo badge="Rito de re-encendido" onCerrar={() => router.back()}>
      {fase === 'intro' && (
        <Animated.View entering={fadeUp}>
          <Text className="font-serif text-3xl text-plata">{RITO_REENCENDIDO.titulo}</Text>
          <Text className="mt-5 font-sans text-sm leading-6 text-slate-300">
            {RITO_REENCENDIDO.intro}
          </Text>
          <View className="mt-10 items-center">
            <AccentButton
              label="Empezar"
              onPress={() => setFase(reflexiones.length > 0 ? 'reflexion' : 'respiracion')}
            />
          </View>
        </Animated.View>
      )}

      {fase === 'reflexion' && (
        <Animated.View entering={fadeUp}>
          <Text className="font-sans text-sm leading-6 text-slate-300">
            {RITO_REENCENDIDO.pasoReflexion}
          </Text>
          {elegida === null ? (
            <ScrollView className="mt-6" style={{ maxHeight: 380 }}>
              <View className="gap-3 pb-4">
                {reflexiones.map((r) => (
                  <Pressable97
                    key={r.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Reflexión del ${r.fecha}`}
                    onPress={() => setElegida(r)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <Text className="font-sans text-sm text-slate-200" numberOfLines={2}>
                      {r.texto}
                    </Text>
                    <Text className="mt-1.5 font-mono text-[10px] text-slate-500">
                      {r.fecha}
                    </Text>
                  </Pressable97>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="mt-6">
              <GlassCard className="p-5">
                <Text className="font-serif-italic text-lg leading-7 text-slate-200">
                  {elegida.texto}
                </Text>
                <Text className="mt-3 font-mono text-[10px] text-slate-500">
                  {elegida.fecha} — la escribiste vos
                </Text>
              </GlassCard>
              <View className="mt-8 items-center">
                <AccentButton label="Respirar" onPress={() => setFase('respiracion')} />
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Elegir otra reflexión"
                  onPress={() => setElegida(null)}
                  className="mt-4 px-4 py-2"
                >
                  <Text className="font-sans text-xs text-slate-500">← Otra reflexión</Text>
                </Pressable97>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {fase === 'respiracion' && (
        <View className="flex-1">
          <Text className="font-sans text-sm leading-6 text-slate-300">
            {RITO_REENCENDIDO.pasoRespiracion}
          </Text>
          <Respiracion onTerminar={terminarRespiracion} />
        </View>
      )}

      {fase === 'cierre' && (
        <Animated.View entering={bloom} className="flex-1 items-center justify-center">
          <Text className="text-center font-serif-italic text-2xl leading-9 text-plata">
            {RITO_REENCENDIDO.cierre}
          </Text>
          <View className="mt-10">
            <AccentButton label="Volver al cielo" onPress={() => router.back()} />
          </View>
        </Animated.View>
      )}
    </ModalCielo>
  );
}
