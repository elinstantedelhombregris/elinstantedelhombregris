import { Text, type StyleProp, type ViewStyle } from 'react-native';

import { glow } from '@/theme/glow';
import { ACCENT } from '@/theme/tokens';
import { Pressable97 } from './Pressable97';

/**
 * CTA primario violeta con glow — espejo de ACCENT_BUTTON del sitio.
 * El violeta es SOLO para acción: si no dispara algo, no es violeta.
 */
export function AccentButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-full bg-accent px-8 py-4 ${
        disabled ? 'opacity-40' : ''
      }`}
      style={[
        glow(ACCENT, 20, 0.45, 8),
        style,
      ]}
    >
      <Text className="font-sans-semibold text-base text-white">{label}</Text>
    </Pressable97>
  );
}
