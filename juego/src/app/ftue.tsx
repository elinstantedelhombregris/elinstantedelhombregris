/**
 * FTUE del asombro (spec §3.6) — de la pregunta a la primera estrella en
 * menos de un minuto. Tres fases: pregunta → nacimiento → tooltips. Nada de
 * pantallas de contrato: el asombro va primero, la explicación viene después
 * y ya con una estrella propia ardiendo en el cielo.
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
import { FTUE_ASOMBRO } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import { CLAVES, crearEstrellaCivicaUnaVez, ganarBrasasUnaVez, getSetting, setSetting } from '@/db/repos';
import type { StarRow } from '@/db/schema';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import type { Luz } from '@/game/types';
import { bloom, fadeIn, fadeUp } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

type Fase = 'pregunta' | 'nacimiento' | 'tooltips';

/** Orden canónico de las Tres Luces — el mismo del dock en index.tsx. */
const ORDEN_LUCES: readonly Luz[] = ['ver', 'encender', 'dar'];

export default function Ftue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('pregunta');
  const [texto, setTexto] = useState('');
  const [estrella, setEstrella] = useState<StarRow | null>(null);
  const [encendiendo, setEncendiendo] = useState(false);
  const [luzActiva, setLuzActiva] = useState<Luz>('ver');

  if (getSetting(CLAVES.ftueCompleto) === '1') {
    return <Redirect href="/" />;
  }

  // Al encender: nace la estrella, arranca el fuego con la bienvenida
  // (idempotente — un reintento tras un cierre a mitad de camino no duplica
  // las brasas) y el Cielo la hace florecer.
  const encender = () => {
    if (encendiendo || !texto.trim()) return;
    setEncendiendo(true);
    const star = crearEstrellaCivicaUnaVez('ftue-primera-estrella', { tipo: 'need', texto: texto.trim() });
    ganarBrasasUnaVez('ftue-bienvenida', GANANCIAS.bienvenida, MOTIVOS.bienvenida);
    useJuego.getState().setNewStar(star.id);
    haptic.celebrate();
    setEstrella(star);
    setFase('nacimiento');
  };

  const terminar = () => {
    setSetting(CLAVES.ftueCompleto, '1');
    useJuego.getState().clearNewStar();
    router.replace('/');
  };

  const avanzarTooltip = () => {
    const i = ORDEN_LUCES.indexOf(luzActiva);
    if (i < ORDEN_LUCES.length - 1) {
      setLuzActiva(ORDEN_LUCES[i + 1] as Luz);
      return;
    }
    terminar();
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <SkyView
          estrellas={estrella ? [estrella] : []}
          rachaViva
          nuevaEstrellaId={fase === 'nacimiento' ? estrella?.id : null}
        />
      </View>

      {fase === 'pregunta' && (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            className="flex-1 justify-center px-7"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
          >
            <Animated.View entering={fadeUp}>
              <Text className="font-serif text-4xl leading-[46px] text-plata">
                {FTUE_ASOMBRO.pregunta}
              </Text>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder={FTUE_ASOMBRO.placeholderRespuesta}
                placeholderTextColor="#64748b"
                maxLength={280}
                returnKeyType="done"
                onSubmitEditing={encender}
                accessibilityLabel={FTUE_ASOMBRO.pregunta}
                className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
              />
              <View className="mt-8 items-center">
                <AccentButton label="Que se encienda" onPress={encender} disabled={!texto.trim() || encendiendo} />
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      )}

      {fase === 'nacimiento' && (
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        >
          <Animated.View entering={bloom} className="items-center">
            <Text className="text-center font-serif-italic text-3xl leading-10 text-plata">
              {FTUE_ASOMBRO.nacimiento}
            </Text>
            <Text className="mt-4 text-center font-sans text-sm leading-6 text-slate-400">
              {FTUE_ASOMBRO.bienvenidaBrasas}
            </Text>
          </Animated.View>
          <View className="mt-10">
            <AccentButton label="Seguir" onPress={() => setFase('tooltips')} />
          </View>
        </View>
      )}

      {fase === 'tooltips' && (
        <Animated.View
          entering={fadeIn}
          className="flex-1 justify-end px-7"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 28 }}
        >
          <View className="mb-8 flex-row items-end justify-center gap-9">
            <View style={{ opacity: luzActiva === 'ver' ? 1 : 0.35 }}>
              <LuzOrb luz="ver" encendida={false} onPress={() => setLuzActiva('ver')} />
            </View>
            <View className="mb-4" style={{ opacity: luzActiva === 'encender' ? 1 : 0.35 }}>
              <LuzOrb luz="encender" encendida={false} destacada onPress={() => setLuzActiva('encender')} />
            </View>
            <View style={{ opacity: luzActiva === 'dar' ? 1 : 0.35 }}>
              <LuzOrb luz="dar" encendida={false} onPress={() => setLuzActiva('dar')} />
            </View>
          </View>

          <GlassCard className="p-5">
            <Text className="font-sans text-sm leading-6 text-slate-200">
              {FTUE_ASOMBRO.tooltips[luzActiva]}
            </Text>
          </GlassCard>

          <View className="mt-5 flex-row items-center justify-center gap-2">
            {ORDEN_LUCES.map((luz) => (
              <View
                key={luz}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: luz === luzActiva ? '#F5F7FA' : 'rgba(245,247,250,0.25)' }}
              />
            ))}
          </View>

          <View className="mt-6 items-center">
            <AccentButton
              label={luzActiva === 'dar' ? 'A mi cielo' : 'Siguiente'}
              onPress={avanzarTooltip}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={FTUE_ASOMBRO.saltearTour}
              onPress={terminar}
              className="mt-4 min-h-11 items-center justify-center rounded-xl px-4"
            >
              <Text className="font-sans-medium text-xs text-slate-500">{FTUE_ASOMBRO.saltearTour}</Text>
            </Pressable97>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
