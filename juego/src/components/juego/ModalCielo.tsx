/**
 * Cáscara común de los modales del día (VER / ENCENDER / DAR / rito):
 * scrim oscuro sobre el Cielo, kicker de sección, cierre arriba a la
 * derecha, scroll amable con teclado.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7): cero vidrio,
 * cero radius — el kicker reemplaza al badge en píldora.
 */

import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Kicker } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { OSCURO_META } from '@/theme/tokens';

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
      style={{ backgroundColor: 'rgba(22, 19, 14, 0.94)' }}
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
              <Kicker registro="noche">{badge}</Kicker>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={onCerrar}
                className="border border-oscuro-borde p-2"
              >
                <Ionicons name="close" size={18} color={OSCURO_META} />
              </Pressable97>
            </View>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pressable>
  );
}
