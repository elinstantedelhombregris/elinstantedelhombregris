import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sendSignal } from '@/api/signals';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { getCoords, type Coords } from '@/lib/location';
import { RADAR_TYPES, type RadarTypeDef } from '@/lib/radar-types';
import { bloom, fadeIn, slideLeftIn, staggerDelay } from '@/motion/variants';
import { enqueue } from '@/offline/queue';
import { useAuthStore } from '@/stores/auth';
import { useMapStore } from '@/stores/map';
import { haptic } from '@/theme/haptics';

type Fase = 'elegir' | 'escribir' | 'listo' | 'encolada';

/**
 * El rito de señalar — ≤10 segundos de principio a fin.
 * Elegir tipo → una pregunta, una respuesta → tu voz en el mapa.
 * Sin red el rito no se rompe: la señal queda encolada y sale sola.
 */
export default function Senal() {
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('elegir');
  const [tipo, setTipo] = useState<RadarTypeDef | null>(null);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const coordsRef = useRef<Promise<Coords | null> | null>(null);

  const elegir = (t: RadarTypeDef) => {
    if (t.requiresAuth && !useAuthStore.getState().user) {
      router.replace('/identidad');
      return;
    }
    setTipo(t);
    setFase('escribir');
    // El GPS se busca mientras la persona escribe — cero espera percibida.
    coordsRef.current = getCoords();
  };

  const enviar = async () => {
    if (!tipo) return;
    setError(null);
    setEnviando(true);
    haptic.send();

    const coords = await Promise.race([
      coordsRef.current ?? Promise.resolve(null),
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);

    const payload = {
      type: tipo.key,
      text: texto.trim(),
      ...(coords ?? {}),
    };

    const result = await sendSignal(payload);
    setEnviando(false);

    if (result.ok) {
      haptic.celebrate();
      if (coords) {
        useMapStore.getState().celebrate({ ...coords, color: tipo.color, pending: false });
      }
      setFase('listo');
    } else if (result.reason === 'offline') {
      await enqueue({ kind: 'senal', payload });
      haptic.celebrate();
      if (coords) {
        useMapStore.getState().celebrate({ ...coords, color: tipo.color, pending: true });
      }
      setFase('encolada');
    } else if (result.reason === 'auth') {
      router.replace('/identidad');
    } else {
      setError(result.message);
    }
  };

  return (
    <Animated.View
      entering={fadeIn}
      className="flex-1 bg-fondo/95 px-6"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
    >
      {(fase === 'elegir' || fase === 'escribir') && (
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel={fase === 'escribir' ? 'Volver' : 'Cerrar'}
          className="self-end p-2"
          onPress={() => (fase === 'escribir' ? setFase('elegir') : router.back())}
        >
          <Ionicons
            name={fase === 'escribir' ? 'arrow-back' : 'close'}
            size={26}
            color="#94a3b8"
          />
        </Pressable97>
      )}

      {fase === 'elegir' && (
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
                  onPress={() => elegir(t)}
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
      )}

      {fase === 'escribir' && tipo && (
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
          {error && (
            <Text className="mb-4 font-sans text-sm text-senal-basta">{error}</Text>
          )}
          <AccentButton
            label={enviando ? 'Enviando…' : 'Enviar señal'}
            disabled={enviando || texto.trim().length < 10}
            onPress={enviar}
          />
          <Text className="mt-4 text-center font-sans text-xs text-slate-500">
            Tu señal es anónima en el mapa. Siempre.
          </Text>
        </Animated.View>
      )}

      {(fase === 'listo' || fase === 'encolada') && tipo && (
        <View className="flex-1 items-center justify-center">
          <Animated.View
            entering={bloom}
            className="items-center justify-center rounded-full"
            style={{
              width: 96,
              height: 96,
              backgroundColor: `${tipo.color}22`,
              borderWidth: 1,
              borderColor: `${tipo.color}66`,
            }}
          >
            <View
              className="rounded-full"
              style={{ width: 14, height: 14, backgroundColor: tipo.color }}
            />
          </Animated.View>
          <Animated.View entering={staggerDelay(2)} className="items-center px-6">
            <Text className="mt-8 text-center font-serif text-2xl text-white">
              {fase === 'listo'
                ? 'Tu voz ya es parte del mapa.'
                : 'Tu señal está guardada.'}
            </Text>
            <Text className="mt-3 text-center font-sans text-sm leading-5 text-slate-400">
              {fase === 'listo'
                ? 'Un punto de luz más. Juntos, un mapa.'
                : 'Sin conexión ahora — va a salir sola apenas vuelva la red.'}
            </Text>
          </Animated.View>
          <View className="mt-10 w-full px-6">
            <AccentButton label="Listo" onPress={() => router.back()} />
          </View>
        </View>
      )}
    </Animated.View>
  );
}
