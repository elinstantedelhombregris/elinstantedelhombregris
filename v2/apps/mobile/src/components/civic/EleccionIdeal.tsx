import { Text, View } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';

/**
 * Una casilla de elección: toda la fila se toca (mínimo 44pt) y el lector de pantalla la anuncia
 * como casilla marcada o sin marcar. `detalle` es texto que acompaña a la casilla y nunca se
 * recorta (un aviso de consentimiento no puede quedar cortado); la etiqueta, que a veces es el
 * texto entero de un aporte, se limita a tres líneas.
 */
export function Eleccion({
  texto,
  valor,
  cambiar,
  detalle,
}: {
  texto: string;
  valor: boolean;
  cambiar: (v: boolean) => void;
  detalle?: string;
}) {
  return (
    <Pressable97
      accessibilityRole="checkbox"
      accessibilityState={{ checked: valor }}
      accessibilityLabel={detalle ? `${texto}. ${detalle}` : texto}
      onPress={() => cambiar(!valor)}
      className="min-h-11 flex-row items-start gap-3 py-1"
    >
      <View
        className={`border-tinta mt-0.5 h-6 w-6 items-center justify-center border ${valor ? 'bg-violeta' : 'bg-papel-presionado'}`}
      >
        {valor && <Text className="font-space-bold text-papel text-xs">✓</Text>}
      </View>
      <View className="flex-1">
        <Text numberOfLines={3} className="font-archivo text-tinta text-sm leading-5">
          {texto}
        </Text>
        {!!detalle && (
          <Text className="font-archivo text-tinta-75 mt-1 text-xs leading-5">{detalle}</Text>
        )}
      </View>
    </Pressable97>
  );
}
