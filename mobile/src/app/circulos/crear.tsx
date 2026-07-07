import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import { crearCirculo, type CircleGovernance, type CircleKind } from '@/api/circulos';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIRCLE_KINDS, GOVERNANCES } from '@/features/circulos/kinds';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { ACCENT_TEXT } from '@/theme/tokens';

/**
 * Crear un círculo — elegir tipo y gobernanza como actos con sentido,
 * no como campos de un formulario.
 */
export default function CrearCirculo() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CircleKind>('territorial');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [theme, setTheme] = useState('');
  const [governance, setGovernance] = useState<CircleGovernance>('coordinado');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    setError(null);
    setEnviando(true);
    haptic.send();
    try {
      const circle = await crearCirculo({
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        kind,
        ...(kind === 'territorial' && province.trim() ? { province: province.trim() } : {}),
        ...(kind === 'territorial' && city.trim() ? { city: city.trim() } : {}),
        ...(kind === 'tematica' && theme.trim() ? { theme: theme.trim() } : {}),
        governance,
      });
      haptic.celebrate();
      await queryClient.invalidateQueries({ queryKey: ['circulos'] });
      router.replace(`/circulos/${circle.id}`);
    } catch (e) {
      setError(
        e instanceof ApiRequestError ? e.message : 'No pudimos crear el círculo. Probá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Nuevo círculo" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={fadeUp}>
          <Text className="font-sans text-sm leading-5 text-slate-400">
            Un círculo es gente que se junta para mirar su realidad y hacerla visible.
          </Text>

          <GlassCard className="mt-5 p-4">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre del círculo"
              placeholderTextColor="#64748b"
              className="font-sans text-base text-white"
              maxLength={80}
            />
          </GlassCard>
          <GlassCard className="mt-3 p-4">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="¿De qué se trata? (opcional)"
              placeholderTextColor="#64748b"
              multiline
              className="min-h-16 font-sans text-base text-white"
              maxLength={500}
            />
          </GlassCard>
        </Animated.View>

        {/* Tipo de círculo — cards con explicación, como identidad.tsx */}
        <View className="mt-8 gap-3">
          <Text className="font-serif text-xl text-white">¿Qué clase de círculo es?</Text>
          {CIRCLE_KINDS.map((k, i) => {
            const active = kind === k.key;
            return (
              <Animated.View key={k.key} entering={staggerDelay(i)}>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={k.label}
                  onPress={() => setKind(k.key)}
                >
                  <GlassCard className={`p-5 ${active ? 'border-white/30 bg-white/10' : ''}`}>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={k.icon as never}
                        size={18}
                        color={active ? '#F5F7FA' : '#94a3b8'}
                      />
                      <Text className="ml-2 font-sans-semibold text-base text-white">
                        {k.label}
                      </Text>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={ACCENT_TEXT}
                          style={{ marginLeft: 'auto' }}
                        />
                      )}
                    </View>
                    <Text className="mt-1 font-sans text-sm leading-5 text-slate-400">
                      {k.description}
                    </Text>
                  </GlassCard>
                </Pressable97>
              </Animated.View>
            );
          })}
        </View>

        {kind === 'territorial' && (
          <Animated.View entering={fadeUp} className="mt-4 gap-3">
            <GlassCard className="p-4">
              <TextInput
                value={province}
                onChangeText={setProvince}
                placeholder="Provincia (ej.: Buenos Aires)"
                placeholderTextColor="#64748b"
                className="font-sans text-base text-white"
                maxLength={100}
              />
            </GlassCard>
            <GlassCard className="p-4">
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Ciudad o barrio (opcional)"
                placeholderTextColor="#64748b"
                className="font-sans text-base text-white"
                maxLength={100}
              />
            </GlassCard>
          </Animated.View>
        )}

        {kind === 'tematica' && (
          <Animated.View entering={fadeUp} className="mt-4">
            <GlassCard className="p-4">
              <TextInput
                value={theme}
                onChangeText={setTheme}
                placeholder="Tema o causa (ej.: PLANSUS, educación)"
                placeholderTextColor="#64748b"
                className="font-sans text-base text-white"
                maxLength={100}
              />
            </GlassCard>
          </Animated.View>
        )}

        {kind === 'celula' && (
          <Animated.View entering={fadeUp} className="mt-4">
            <GlassCard className="flex-row items-start p-4">
              <Ionicons name="information-circle-outline" size={18} color="#94a3b8" />
              <Text className="ml-2 flex-1 font-sans text-sm leading-5 text-slate-400">
                Las células piden nombre real: la confianza se construye a cara descubierta.
                Va a ser invisible para quien no sea miembro y se entra solo con invitación.
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Gobernanza — quién puede lanzar campañas */}
        <View className="mt-8 gap-3">
          <Text className="font-serif text-xl text-white">¿Cómo se gobierna?</Text>
          {GOVERNANCES.map((g, i) => {
            const active = governance === g.key;
            return (
              <Animated.View key={g.key} entering={staggerDelay(i)}>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={g.label}
                  onPress={() => setGovernance(g.key)}
                >
                  <GlassCard className={`p-5 ${active ? 'border-white/30 bg-white/10' : ''}`}>
                    <View className="flex-row items-center">
                      <Text className="font-sans-semibold text-base text-white">{g.label}</Text>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={ACCENT_TEXT}
                          style={{ marginLeft: 'auto' }}
                        />
                      )}
                    </View>
                    <Text className="mt-1 font-sans text-sm leading-5 text-slate-400">
                      {g.description}
                    </Text>
                  </GlassCard>
                </Pressable97>
              </Animated.View>
            );
          })}
        </View>

        {error && (
          <Text className="mt-4 font-sans text-sm text-senal-basta">{error}</Text>
        )}

        <View className="mt-8">
          <AccentButton
            label={enviando ? 'Creando…' : 'Crear círculo'}
            disabled={enviando || name.trim().length < 3}
            onPress={crear}
          />
        </View>
      </ScrollView>
    </View>
  );
}
