/**
 * Orbe de una de las Tres Luces — apagado (borde tenue) o encendido
 * (lleno de su color con glow suave + tilde). Cada luz tiene su color:
 * VER plata, ENCENDER brasa, DAR verde compromiso.
 */

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';
import type { Luz } from '@/game/types';
import { PLATA } from '@/theme/tokens';

export const LUZ_DEF: Record<
  Luz,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  ver: { label: 'Ver', icon: 'eye-outline', color: PLATA },
  encender: { label: 'Encender', icon: 'flash-outline', color: '#F59E0B' },
  dar: { label: 'Dar', icon: 'hand-left-outline', color: '#10b981' },
};

export function LuzOrb({
  luz,
  encendida,
  onPress,
  destacada = false,
}: {
  luz: Luz;
  encendida: boolean;
  onPress: () => void;
  /** El orbe central (ENCENDER) va apenas más grande y elevado. */
  destacada?: boolean;
}) {
  const def = LUZ_DEF[luz];
  const lado = destacada ? 76 : 64;

  return (
    <View className="items-center">
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={`${def.label}${encendida ? ', encendida' : ''}`}
        onPress={onPress}
        className="items-center justify-center rounded-full border"
        style={{
          width: lado,
          height: lado,
          backgroundColor: encendida ? `${def.color}26` : 'rgba(255,255,255,0.05)',
          borderColor: encendida ? `${def.color}66` : 'rgba(255,255,255,0.10)',
          shadowColor: encendida ? def.color : 'transparent',
          shadowOpacity: encendida ? 0.55 : 0,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
          elevation: encendida ? 8 : 0,
        }}
      >
        <Ionicons
          name={def.icon}
          size={destacada ? 30 : 26}
          color={encendida ? def.color : '#94a3b8'}
        />
        {encendida && (
          <View
            className="absolute -right-0.5 -top-0.5 rounded-full"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <Ionicons name="checkmark-circle" size={18} color={def.color} />
          </View>
        )}
      </Pressable97>
      <Text
        className="mt-2 font-sans text-[10px] uppercase tracking-[2px]"
        style={{ color: encendida ? def.color : '#64748b' }}
      >
        {def.label}
      </Text>
    </View>
  );
}
