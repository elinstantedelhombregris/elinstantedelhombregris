/**
 * Placa de una de las Tres Luces (spec §7) — reemplaza al orbe redondo por
 * un cuadrado: apagada es borde tenue sin relleno; encendida queda
 * SELLADA — fondo del color de la luz al 20%, borde 2px del color, la
 * palabra tachada y rotada −3° (estilo sello). SIN glifo: la palabra basta.
 * `LuzOrb` queda intacto hasta la limpieza de Task PT8.
 */

import { Text } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';
import type { Luz } from '@/game/types';
import { VERDE, VIOLETA, VIOLETA_CLARO } from '@/theme/tokens';

/** Caso natural para accessibilityLabel; el trazo visual lo uppercasea la clase. */
const LUZ_DEF: Record<
  Luz,
  { label: string; color: string; claseFondo: string; claseBorde: string; claseTexto: string }
> = {
  ver: {
    label: 'Ver',
    color: VIOLETA_CLARO,
    claseFondo: 'bg-violeta-claro/20',
    claseBorde: 'border-violeta-claro',
    claseTexto: 'text-violeta-claro',
  },
  encender: {
    label: 'Encender',
    color: VIOLETA,
    claseFondo: 'bg-violeta/20',
    claseBorde: 'border-violeta',
    claseTexto: 'text-violeta',
  },
  dar: {
    label: 'Dar',
    color: VERDE,
    claseFondo: 'bg-verde/20',
    claseBorde: 'border-verde',
    claseTexto: 'text-verde',
  },
};

export function LuzPlaca({
  luz,
  encendida,
  onPress,
  destacada = false,
}: {
  luz: Luz;
  encendida: boolean;
  onPress: () => void;
  /** La placa central (ENCENDER) va 84px y elevada, como antes. */
  destacada?: boolean;
}) {
  const def = LUZ_DEF[luz];
  const lado = destacada ? 84 : 72;

  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={`${def.label}${encendida ? ', encendida' : ''}`}
      onPress={onPress}
      className={`items-center justify-center ${
        encendida
          ? `border-2 ${def.claseBorde} ${def.claseFondo}`
          : 'border border-oscuro-borde bg-transparent'
      }`}
      style={{ width: lado, height: lado }}
    >
      <Text
        className={`font-space-bold text-[11px] uppercase tracking-[0.88px] ${
          encendida ? def.claseTexto : 'text-oscuro-meta'
        }`}
        style={
          encendida
            ? { transform: [{ rotate: '-3deg' }], textDecorationLine: 'line-through' }
            : undefined
        }
      >
        {def.label}
      </Text>
    </Pressable97>
  );
}
