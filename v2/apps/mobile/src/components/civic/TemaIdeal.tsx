import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ChipTipo } from '@/components/papel';
import { leerIdeal } from '@/civic/ideal';

type Tema = { clave: string; etiqueta: string };
const SIN_TEMA: Tema = { clave: '', etiqueta: 'Dejar el tema abierto' };

export function TemaIdeal({ valor, cambiar }: { valor: string; cambiar: (v: string) => void }) {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [falla, setFalla] = useState(false);
  useEffect(() => {
    let vivo = true;
    void leerIdeal<{ temas: Tema[] }>('/api/v1/contribuciones/contexto')
      .then((c) => {
        if (vivo) setTemas(c.temas);
      })
      .catch(() => {
        if (vivo) setFalla(true);
      });
    return () => {
      vivo = false;
    };
  }, []);
  // Se muestra la etiqueta («Salud»), no la clave interna («salud»). Un tema guardado en un
  // borrador que el servidor ya no lista se muestra como vino.
  const elegido = [SIN_TEMA, ...temas].find((t) => t.clave === valor);
  return (
    <View className="gap-3">
      <Text className="font-archivo text-tinta text-sm">
        Tema, si querés nombrarlo: {elegido?.etiqueta ?? valor}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {[SIN_TEMA, ...temas].map((t) => (
          <ChipTipo
            key={t.clave}
            etiqueta={t.etiqueta}
            activo={valor === t.clave}
            className="min-h-11"
            onPress={() => cambiar(t.clave)}
          />
        ))}
      </View>
      {falla && (
        <Text accessibilityRole="alert" className="font-archivo text-tinta-75 text-xs leading-5">
          No pudimos leer los temas. Podés seguir sin elegir uno.
        </Text>
      )}
    </View>
  );
}
