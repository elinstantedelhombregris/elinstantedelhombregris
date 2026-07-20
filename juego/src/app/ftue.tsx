/**
 * Primera experiencia cívica.
 *
 * No pide un relato, una cuenta ni permisos para poder entrar. Primero explica
 * el propósito y el pacto de datos; recién después la persona elige su primer
 * acto. Completar este recorrido no equivale a consentir ninguna publicación.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect, type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { FTUE } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import { CLAVES, getSetting, setSetting } from '@/db/repos';
import { fadeIn, fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';

type Fase = 'proposito' | 'pacto' | 'eleccion';

const PRINCIPIOS = [
  ['ear-outline', 'Escuchar', 'Registrar lo que la gente vive, necesita, sabe y sueña.'],
  ['shield-checkmark-outline', 'Cuidar', 'Separar el relato privado de los datos mínimos que decidís compartir.'],
  ['git-network-outline', 'Conectar', 'Vincular necesidades y recursos con responsables y seguimiento.'],
] as const;

const ACTOS: readonly {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  promise: string;
  route: Href;
  color: string;
}[] = [
  {
    key: 'escuchar',
    icon: 'ear-outline',
    title: 'Guardar una escucha',
    detail: 'Una necesidad, un sueño, una propuesta o una capacidad.',
    promise: 'Empieza privada en este dispositivo.',
    route: '/escuchar',
    color: '#C4B5FD',
  },
  {
    key: 'territorio',
    icon: 'earth-outline',
    title: 'Leer el territorio',
    detail: 'Ver el mapa, la cobertura y lo que todavía no sabemos.',
    promise: 'No pide ubicación para explorar.',
    route: '/territorio',
    color: '#93C5FD',
  },
  {
    key: 'aportar',
    icon: 'hand-right-outline',
    title: 'Ofrecer un recurso',
    detail: 'Poner tiempo, conocimiento o algo concreto a disposición.',
    promise: 'Vos confirmás qué dato y qué lugar salen del teléfono.',
    route: '/aportar',
    color: '#6EE7B7',
  },
];

export default function Ftue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('proposito');

  if (getSetting(CLAVES.ftueCompleto) === '1') {
    return <Redirect href="/" />;
  }

  const terminar = (route: Href) => {
    setSetting(CLAVES.ftueCompleto, '1');
    useJuego.getState().clearNewStar();
    router.replace(route);
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="absolute inset-0 opacity-50" pointerEvents="none">
        <SkyView estrellas={[]} rachaViva />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 28,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-semibold text-xs uppercase tracking-[2.5px] text-violet-200">¡BASTA! · territorio vivo</Text>
          <Text className="font-mono text-xs text-slate-500">
            {fase === 'proposito' ? '1' : fase === 'pacto' ? '2' : '3'} / 3
          </Text>
        </View>

        {fase === 'proposito' && (
          <Animated.View entering={fadeUp} className="flex-1 justify-center py-10">
            <Text className="max-w-md font-serif text-5xl leading-[54px] text-plata">{FTUE.propositoTitulo}</Text>
            <Text className="mt-5 max-w-lg font-sans text-base leading-7 text-slate-300">{FTUE.propositoDetalle}</Text>

            <View className="mt-9 gap-3">
              {PRINCIPIOS.map(([icon, title, detail], index) => (
                <Animated.View key={title} entering={staggerDelay(index)}>
                  <GlassCard className="flex-row items-start p-4">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-violet-300/10">
                      <Ionicons name={icon} size={19} color="#C4B5FD" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-sans-semibold text-sm text-plata">{title}</Text>
                      <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{detail}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>

            <View className="mt-8">
              <AccentButton label="Conocer el pacto de datos" onPress={() => setFase('pacto')} />
            </View>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Explorar el territorio sin registrar datos"
              onPress={() => terminar('/territorio')}
              className="mt-4 min-h-11 items-center justify-center rounded-xl px-4"
            >
              <Text className="font-sans-medium text-xs text-slate-400">Explorar sin registrar nada</Text>
            </Pressable97>
          </Animated.View>
        )}

        {fase === 'pacto' && (
          <Animated.View entering={fadeIn} className="flex-1 justify-center py-10">
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
              <Ionicons name="shield-checkmark-outline" size={24} color="#6EE7B7" />
            </View>
            <Text className="mt-6 font-serif text-4xl leading-[46px] text-plata">{FTUE.pactoTitulo}</Text>
            <Text className="mt-4 font-sans text-sm leading-6 text-slate-300">{FTUE.pactoDetalle}</Text>

            <GlassCard className="mt-8 p-5">
              {FTUE.pacto.map((item, index) => (
                <View key={item.title} className={index === 0 ? '' : 'mt-5 border-t border-white/10 pt-5'}>
                  <Text className="font-sans-semibold text-sm text-emerald-100">{item.title}</Text>
                  <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{item.detail}</Text>
                </View>
              ))}
            </GlassCard>

            <Text className="mt-5 font-sans text-xs leading-5 text-slate-500">Pasar esta pantalla no concede permiso para publicar, ubicarte ni identificarte. Cada entrega se decide por separado.</Text>
            <View className="mt-8">
              <AccentButton label="Elegir mi primer acto" onPress={() => setFase('eleccion')} />
            </View>
            <Pressable97 accessibilityRole="button" accessibilityLabel="Volver al propósito" onPress={() => setFase('proposito')} className="mt-4 min-h-11 items-center justify-center rounded-xl px-4">
              <Text className="font-sans-medium text-xs text-slate-500">Volver</Text>
            </Pressable97>
          </Animated.View>
        )}

        {fase === 'eleccion' && (
          <Animated.View entering={fadeUp} className="flex-1 justify-center py-10">
            <Text className="font-serif text-4xl leading-[46px] text-plata">{FTUE.eleccionTitulo}</Text>
            <Text className="mt-4 font-sans text-sm leading-6 text-slate-400">No hay una ruta correcta. Podés volver al cielo y elegir otra cuando quieras.</Text>

            <View className="mt-8 gap-3">
              {ACTOS.map((acto, index) => (
                <Animated.View key={acto.key} entering={staggerDelay(index)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={acto.title}
                    accessibilityHint={acto.promise}
                    onPress={() => terminar(acto.route)}
                    className="min-h-28 flex-row items-center rounded-[24px] border border-white/10 bg-white/[0.05] p-5"
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${acto.color}18` }}>
                      <Ionicons name={acto.icon} size={23} color={acto.color} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-sans-semibold text-base text-plata">{acto.title}</Text>
                      <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{acto.detail}</Text>
                      <Text className="mt-2 font-sans-medium text-[11px] leading-4" style={{ color: acto.color }}>{acto.promise}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
                  </Pressable97>
                </Animated.View>
              ))}
            </View>

            <Pressable97 accessibilityRole="button" accessibilityLabel="Volver al pacto de datos" onPress={() => setFase('pacto')} className="mt-5 min-h-11 items-center justify-center rounded-xl px-4">
              <Text className="font-sans-medium text-xs text-slate-500">Volver al pacto</Text>
            </Pressable97>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
