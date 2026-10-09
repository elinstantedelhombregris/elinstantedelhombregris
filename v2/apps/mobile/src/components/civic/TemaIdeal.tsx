import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { BotonTinta } from '@/components/papel';
import { leerIdeal } from '@/civic/ideal';
export function TemaIdeal({ valor, cambiar }: { valor: string; cambiar: (v: string) => void }) {
  const [temas, setTemas] = useState<{ clave: string; etiqueta: string }[]>([]);
  useEffect(() => {
    let vivo = true;
    void leerIdeal<{ temas: { clave: string; etiqueta: string }[] }>(
      '/api/v1/contribuciones/contexto',
    )
      .then((c) => {
        if (vivo) setTemas(c.temas);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);
  return (
    <View className="gap-3">
      <Text className="font-archivo text-tinta text-sm">Tema opcional: {valor || 'abierto'}</Text>
      <View className="flex-row flex-wrap gap-2">
        {[{ clave: '', etiqueta: 'Dejar abierto' }, ...temas].map((t) => (
          <BotonTinta
            key={t.clave}
            etiqueta={t.etiqueta}
            variante={valor === t.clave ? 'primaria' : 'fantasma'}
            tamano="compacto"
            onPress={() => cambiar(t.clave)}
          />
        ))}
      </View>
    </View>
  );
}
