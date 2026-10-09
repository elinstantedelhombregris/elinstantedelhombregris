import { View, Text, Switch } from 'react-native';
export function Eleccion({
  texto,
  valor,
  cambiar,
}: {
  texto: string;
  valor: boolean;
  cambiar: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Switch accessibilityLabel={texto} value={valor} onValueChange={cambiar} />
      <Text className="font-archivo text-tinta flex-1 text-sm leading-5">{texto}</Text>
    </View>
  );
}
