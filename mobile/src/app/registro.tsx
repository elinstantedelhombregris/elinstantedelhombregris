import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { register } from '@/api/auth';
import { ApiRequestError } from '@/api/client';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

function Campo({
  value,
  onChangeText,
  placeholder,
  hint,
  secure,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  hint?: string;
  secure?: boolean;
}) {
  return (
    <View className="mt-3">
      <GlassCard className="p-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          secureTextEntry={secure}
          autoCapitalize={secure || placeholder === 'Email' ? 'none' : undefined}
          autoCorrect={false}
          className="font-sans text-base text-white"
        />
      </GlassCard>
      {hint && <Text className="mt-1.5 px-1 font-sans text-xs text-slate-500">{hint}</Text>}
    </View>
  );
}

export default function Registro() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const completo =
    name.trim().length >= 2 &&
    username.trim().length >= 3 &&
    email.includes('@') &&
    password.length >= 8 &&
    confirm === password;

  const crear = async () => {
    setError(null);
    setEnviando(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword: confirm,
      });
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
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="self-start p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color="#94a3b8" />
        </Pressable97>

        <Animated.View entering={fadeUp} className="mt-4">
          <Text className="font-serif text-3xl text-white">Sumate.</Text>
          <Text className="mt-2 font-sans text-sm leading-5 text-slate-400">
            Tu usuario es tu seudónimo. Tu nombre queda para tus círculos — vos elegís
            cuándo mostrarlo.
          </Text>

          <Campo
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            hint="Solo lo ven tus círculos si vos querés. Las células lo piden."
          />
          <Campo
            value={username}
            onChangeText={setUsername}
            placeholder="Usuario (seudónimo)"
          />
          <Campo value={email} onChangeText={setEmail} placeholder="Email" />
          <Campo
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secure
            hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
          />
          <Campo
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repetir contraseña"
            secure
          />

          {error && (
            <Text className="mt-4 font-sans text-sm text-senal-basta">{error}</Text>
          )}

          <View className="mt-8">
            <AccentButton
              label={enviando ? 'Creando…' : 'Crear cuenta'}
              disabled={enviando || !completo}
              onPress={crear}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
