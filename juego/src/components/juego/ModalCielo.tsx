/**
 * Cáscara común de los modales del día (VER / ENCENDER / DAR / rito):
 * scrim oscuro sobre el Cielo, badge de sección, cierre arriba a la
 * derecha, scroll amable con teclado.
 */

import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';

export function ModalCielo({
  badge,
  onCerrar,
  children,
}: {
  badge: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    // Tocar el scrim cierra; el lector de pantalla usa la cruz de arriba.
    <Pressable
      accessible={false}
      accessibilityLabel="Cerrar"
      onPress={onCerrar}
      className="flex-1"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.94)' }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {/* El contenido atrapa sus propios toques: tocar adentro no cierra. */}
          <Pressable accessible={false} onPress={() => {}}>
            <View className="mb-8 flex-row items-center justify-between">
              <SectionBadge>{badge}</SectionBadge>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={onCerrar}
                className="rounded-full border border-white/10 bg-white/5 p-2"
              >
                <Ionicons name="close" size={18} color="#94a3b8" />
              </Pressable97>
            </View>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pressable>
  );
}
