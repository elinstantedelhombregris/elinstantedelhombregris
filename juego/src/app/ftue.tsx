/**
 * FTUE — del cielo vacío a la primera estrella en menos de un minuto
 * (spec §3.6). Sin registro, sin permisos: una pregunta, una línea,
 * y nace tu estrella. Después, tres tooltips salteables y +5 brasas.
 */

import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LuzOrb } from '@/components/juego/LuzOrb';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { FTUE } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import {
  CLAVES,
  crearEstrella,
  ganarBrasas,
  getSetting,
  setSetting,
} from '@/db/repos';
import type { StarRow } from '@/db/schema';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import type { Luz } from '@/game/types';
import { bloom, fadeIn, fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { useJuego } from '@/stores/juego';

type Fase = 'pregunta' | 'nacimiento' | 'tooltips';

const ORDEN_TOOLTIPS: Luz[] = ['ver', 'encender', 'dar'];

export default function Ftue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('pregunta');
  const [texto, setTexto] = useState('');
  const [estrella, setEstrella] = useState<StarRow | null>(null);
  const [tooltip, setTooltip] = useState(0);

  if (getSetting(CLAVES.ftueCompleto) === '1') {
    return <Redirect href="/" />;
  }

  const encenderPrimera = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    const star = crearEstrella({ tipo: 'need', texto: limpio });
    ganarBrasas(GANANCIAS.bienvenida, MOTIVOS.bienvenida);
    setEstrella(star);
    useJuego.getState().setNewStar(star.id);
    haptic.celebrate();
    setFase('nacimiento');
  };

  const terminar = () => {
    setSetting(CLAVES.ftueCompleto, '1');
    useJuego.getState().clearNewStar();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="absolute inset-0" pointerEvents="none">
        <SkyView
          estrellas={estrella ? [estrella] : []}
          rachaViva
          nuevaEstrellaId={fase === 'nacimiento' ? estrella?.id : null}
        />
      </View>

      {fase === 'pregunta' && (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-center px-7">
            <Animated.View entering={fadeUp}>
              <Text className="font-serif text-4xl leading-[46px] text-plata">
                {FTUE.pregunta}
              </Text>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder={FTUE.placeholderRespuesta}
                placeholderTextColor="#64748b"
                returnKeyType="done"
                onSubmitEditing={encenderPrimera}
                className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
              />
              <View className="mt-6">
                <AccentButton
                  label="Que se encienda"
                  onPress={encenderPrimera}
                  disabled={!texto.trim()}
                />
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      )}

      {fase === 'nacimiento' && (
        <View className="flex-1 items-center justify-end px-7" style={{ paddingBottom: insets.bottom + 48 }}>
          <Animated.View entering={bloom} className="items-center">
            <Text className="text-center font-serif-italic text-3xl text-plata">
              {FTUE.nacimiento}
            </Text>
            <Text className="mt-4 text-center font-sans text-sm text-slate-400">
              {FTUE.bienvenidaBrasas}
            </Text>
            <View className="mt-8">
              <AccentButton label="Seguir" onPress={() => setFase('tooltips')} />
            </View>
          </Animated.View>
        </View>
      )}

      {fase === 'tooltips' && (
        <View
          className="flex-1 justify-end px-7"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={fadeIn} className="mb-8 flex-row items-end justify-center gap-9">
            {ORDEN_TOOLTIPS.map((luz, i) => (
              <View key={luz} style={{ opacity: i === tooltip ? 1 : 0.35 }}>
                <View className={luz === 'encender' ? 'mb-4' : ''}>
                  <LuzOrb luz={luz} encendida={false} onPress={() => setTooltip(i)} />
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View key={tooltip} entering={fadeUp}>
            <GlassCard className="p-5">
              <Text className="font-sans text-sm leading-6 text-plata">
                {FTUE.tooltips[ORDEN_TOOLTIPS[tooltip]!]}
              </Text>
            </GlassCard>
          </Animated.View>

          <View className="mt-3 flex-row items-center justify-center gap-1.5">
            {ORDEN_TOOLTIPS.map((_, i) => (
              <View
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: i === tooltip ? '#F5F7FA' : 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </View>

          <View className="mt-6 items-center">
            <AccentButton
              label={tooltip < 2 ? 'Siguiente' : 'A mi cielo'}
              onPress={() => (tooltip < 2 ? setTooltip(tooltip + 1) : terminar())}
            />
            {tooltip < 2 && (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={FTUE.saltearTour}
                onPress={terminar}
                className="mt-4 px-4 py-2"
              >
                <Text className="font-sans text-xs text-slate-500">{FTUE.saltearTour}</Text>
              </Pressable97>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
