import { Text, View } from 'react-native';

import { DisplayText } from '@/components/ui/DisplayText';

/** Placeholder de G0 — G3 lo reemplaza por El Cielo. */
export default function Cielo() {
  return (
    <View className="flex-1 items-center justify-center bg-fondo px-8">
      <DisplayText className="text-4xl">El Cielo</DisplayText>
      <Text className="mt-4 font-sans text-sm text-slate-500">
        Acá van a vivir tus estrellas.
      </Text>
    </View>
  );
}
