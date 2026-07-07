import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { login } from '@/api/auth';
import { ApiRequestError } from '@/api/client';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

export default function Entrar() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    setError(null);
    setEnviando(true);
    try {
      await login(username.trim(), password);
      haptic.celebrate();
      router.dismissAll();
    } catch (e) {
      setError(
        e instanceof ApiRequestError ? e.message : 'No pudimos conectar. Probá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-fondo"
    >
      <View
        className="flex-1 px-6"
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      >
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="self-start p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color="#94a3b8" />
        </Pressable97>

        <Animated.View entering={fadeUp} className="mt-6 flex-1">
          <Text className="font-serif text-3xl text-white">Volviste.</Text>

          <GlassCard className="mt-8 p-4">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Usuario"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              className="font-sans text-base text-white"
            />
          </GlassCard>
          <GlassCard className="mt-3 p-4">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor="#64748b"
              secureTextEntry
              className="font-sans text-base text-white"
            />
          </GlassCard>

          {error && (
            <Text className="mt-4 font-sans text-sm text-senal-basta">{error}</Text>
          )}

          <View className="mt-8">
            <AccentButton
              label={enviando ? 'Entrando…' : 'Entrar'}
              disabled={enviando || !username.trim() || !password}
              onPress={entrar}
            />
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
