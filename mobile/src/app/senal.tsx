import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RADAR_TYPES, type RadarTypeDef } from '@/lib/radar-types';
import { fadeIn, slideLeftIn, staggerDelay } from '@/motion/variants';

/**
 * El rito de señalar — ≤10 segundos de principio a fin.
 * Fase 1: elegir tipo (grilla con stagger). Fase 2: una pregunta, una respuesta.
 * El envío real (GPS + API + cola offline) llega en M1.4.
 */
export default function Senal() {
  const insets = useSafeAreaInsets();
  const [tipo, setTipo] = useState<RadarTypeDef | null>(null);
  const [texto, setTexto] = useState('');

  return (
    <Animated.View
      entering={fadeIn}
      className="flex-1 bg-fondo/95 px-6"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
    >
      {/* Cerrar */}
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        className="self-end p-2"
        onPress={() => (tipo ? setTipo(null) : router.back())}
      >
        <Ionicons name={tipo ? 'arrow-back' : 'close'} size={26} color="#94a3b8" />
      </Pressable97>

      {!tipo ? (
        <View className="flex-1 justify-center">
          <Text className="mb-8 text-center font-serif text-3xl text-white">
            ¿Qué querés decir?
          </Text>
          <View className="flex-row flex-wrap justify-center gap-4">
            {RADAR_TYPES.map((t, i) => (
              <Animated.View key={t.key} entering={staggerDelay(i)}>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={t.label}
                  onPress={() => setTipo(t)}
                  className="items-center justify-center rounded-2xl bg-white/5 border border-white/10"
                  style={{ width: 104, height: 104 }}
                >
                  <Ionicons name={t.icon as never} size={30} color={t.color} />
                  <Text className="mt-2 font-sans-medium text-xs text-slate-200">
                    {t.label}
                  </Text>
                </Pressable97>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <Animated.View entering={slideLeftIn} className="flex-1 justify-center">
          <Text className="mb-6 font-serif text-3xl leading-10 text-white">
            {tipo.question}
          </Text>
          <GlassCard className="mb-6 p-4">
            <TextInput
              autoFocus
              multiline
              value={texto}
              onChangeText={setTexto}
              placeholder={tipo.placeholder}
              placeholderTextColor="#64748b"
              className="min-h-28 font-sans text-base text-white"
              maxLength={1000}
            />
          </GlassCard>
          <AccentButton
            label="Enviar señal"
            disabled={texto.trim().length < 10}
            onPress={() => {
              // M1.4: GPS + POST /api/radar/senal + cola offline + payoff en el mapa.
              router.back();
            }}
          />
          <Text className="mt-4 text-center font-sans text-xs text-slate-500">
            Tu señal es anónima en el mapa. Siempre.
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
