import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQueryClient } from '@tanstack/react-query';

import { ApiRequestError } from '@/api/client';
import { canjearInvitacion } from '@/api/circulos';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { bloom, fadeUp } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { haptic } from '@/theme/haptics';

/** Extrae el código de un QR: acepta el deep link basta://... o el código pelado. */
export function parseInviteCode(raw: string): string | null {
  const trimmed = raw.trim();
  const match = trimmed.match(/circulo-invite\/([A-Za-z0-9_-]{6,64})/);
  if (match?.[1]) return match[1];
  if (/^[A-Za-z0-9_-]{6,64}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Canjear una invitación — con el código escrito o escaneando el QR.
 * Las células piden nombre real: el error del backend se muestra tal cual.
 */
export default function Invitacion() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [permission, requestPermission] = useCameraPermissions();

  const [code, setCode] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const [canjeando, setCanjeando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realNameError, setRealNameError] = useState(false);
  const [exito, setExito] = useState<{ id: number; name: string } | null>(null);
  const scannedRef = useRef(false);

  const canjear = async (raw: string) => {
    const parsed = parseInviteCode(raw);
    if (!parsed) {
      setError('Ese código no parece válido.');
      return;
    }
    if (!useAuthStore.getState().user) {
      router.push('/identidad');
      return;
    }
    setError(null);
    setRealNameError(false);
    setCanjeando(true);
    haptic.send();
    try {
      const result = await canjearInvitacion(parsed);
      haptic.celebrate();
      await queryClient.invalidateQueries({ queryKey: ['circulos'] });
      setExito({ id: result.circulo.id, name: result.circulo.name });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setError(e.message);
        setRealNameError(e.code === 'REAL_NAME_REQUIRED');
      } else {
        setError('No pudimos canjear la invitación. Probá de nuevo.');
      }
      scannedRef.current = false;
    } finally {
      setCanjeando(false);
    }
  };

  const abrirEscaner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError('Sin permiso de cámara no podemos escanear. Podés escribir el código.');
        return;
      }
    }
    scannedRef.current = false;
    setEscaneando(true);
  };

  if (exito) {
    return (
      <View className="flex-1 bg-fondo" style={{ paddingBottom: insets.bottom + 16 }}>
        <PanelHeader title="Invitación" />
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={bloom}
            className="items-center justify-center rounded-full bg-white/5 border border-white/20"
            style={{ width: 96, height: 96 }}
          >
            <Ionicons name="checkmark" size={40} color="#F5F7FA" />
          </Animated.View>
          <Text className="mt-8 text-center font-serif text-2xl text-white">
            Ya sos parte de {exito.name}.
          </Text>
          <Text className="mt-3 text-center font-sans text-sm leading-5 text-slate-400">
            Alguien te abrió la puerta. Ahora la constelación también es tuya.
          </Text>
        </View>
        <View className="px-6">
          <AccentButton label="Ir al círculo" onPress={() => router.replace(`/circulos/${exito.id}`)} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Invitación" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={fadeUp}>
          <Text className="font-sans text-sm leading-5 text-slate-400">
            Escaneá el QR que te mostraron o escribí el código.
          </Text>

          {escaneando ? (
            <View className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              <CameraView
                style={{ width: '100%', height: 320 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => {
                  if (scannedRef.current) return;
                  scannedRef.current = true;
                  haptic.tick();
                  setEscaneando(false);
                  void canjear(data);
                }}
              />
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Cerrar escáner"
                className="items-center bg-white/5 py-3"
                onPress={() => setEscaneando(false)}
              >
                <Text className="font-sans text-sm text-slate-300">Cerrar escáner</Text>
              </Pressable97>
            </View>
          ) : (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Escanear QR"
              className="mt-5"
              onPress={abrirEscaner}
            >
              <GlassCard className="items-center p-6">
                <Ionicons name="qr-code-outline" size={40} color="#94a3b8" />
                <Text className="mt-3 font-sans-medium text-sm text-slate-200">Escanear QR</Text>
              </GlassCard>
            </Pressable97>
          )}

          <Text className="mt-6 text-center font-sans text-xs uppercase tracking-[3px] text-slate-500">
            o con código
          </Text>

          <GlassCard className="mt-4 p-4">
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Código de invitación"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-center font-mono text-base tracking-widest text-white"
              maxLength={64}
            />
          </GlassCard>

          {error && (
            <Text className="mt-4 text-center font-sans text-sm text-senal-basta">{error}</Text>
          )}
          {realNameError && (
            <Text className="mt-2 text-center font-sans text-xs leading-4 text-slate-400">
              Cargá tu nombre real en tu perfil del sitio y volvé a intentar.
            </Text>
          )}

          <View className="mt-6">
            <AccentButton
              label={canjeando ? 'Canjeando…' : 'Canjear invitación'}
              disabled={canjeando || parseInviteCode(code) === null}
              onPress={() => void canjear(code)}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
