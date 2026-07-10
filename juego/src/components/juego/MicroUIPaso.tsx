/**
 * Micro-UI por paso de expedición (spec §3.2) — nunca un formulario
 * plano: cada paso trae su gesto propio. La cámara guiada (salteable,
 * como en ENCENDER), el contador grande en mono, los soles de urgencia,
 * los chips, o una línea de texto con la voz del otro.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';

import { Pressable97 } from '@/components/ui/Pressable97';
import type { PasoExpedicion } from '@/content';
import { haptic } from '@/theme/haptics';

/** Lo que produce cada micro-UI (la foto es un uri local). */
export type ValorPaso = string | number | null;

/**
 * ¿El paso tiene lo que necesita para avanzar?
 * La foto guiada es opcional — guía, no obliga (spec §3.7: la cámara
 * jamás es condición).
 */
export const pasoValido = (
  paso: PasoExpedicion,
  valor: ValorPaso | undefined,
): boolean => {
  switch (paso.microUI) {
    case 'foto-guiada':
      return true;
    case 'contador':
      return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1;
    case 'rating-soles':
      return typeof valor === 'number' && valor >= 1;
    case 'chips':
      return typeof valor === 'string' && valor.length > 0;
    case 'texto-corto':
      return typeof valor === 'string' && valor.trim().length > 0;
  }
};

export function MicroUIPaso({
  paso,
  color,
  valor,
  onCambiar,
}: {
  paso: PasoExpedicion;
  /** Color de señal de la plantilla — los datos brillan en su color. */
  color: string;
  valor: ValorPaso | undefined;
  onCambiar: (v: ValorPaso) => void;
}) {
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [permisoCamara, pedirPermisoCamara] = useCameraPermissions();
  const camaraRef = useRef<CameraView>(null);

  // ---------------------------------------------------------------- foto
  if (paso.microUI === 'foto-guiada') {
    const uri = typeof valor === 'string' ? valor : null;

    const abrirCamara = async () => {
      try {
        if (!permisoCamara?.granted) {
          const r = await pedirPermisoCamara();
          if (!r.granted) return;
        }
        setCamaraAbierta(true);
      } catch {
        // sin cámara no hay drama: la foto es opcional
      }
    };

    const sacarFoto = async () => {
      try {
        const foto = await camaraRef.current?.takePictureAsync();
        if (foto?.uri) {
          onCambiar(foto.uri);
          haptic.tick();
        }
      } catch {
        // silencioso: se puede seguir sin foto
      } finally {
        setCamaraAbierta(false);
      }
    };

    if (camaraAbierta) {
      return (
        <View className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <CameraView ref={camaraRef} style={{ height: 300 }} facing="back" />
          <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-6">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Cancelar la foto"
              onPress={() => setCamaraAbierta(false)}
              className="rounded-full bg-black/50 p-3"
            >
              <Ionicons name="close" size={20} color="#F5F7FA" />
            </Pressable97>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sacar la foto"
              onPress={sacarFoto}
              className="rounded-full border-2 border-white bg-white/20 p-5"
            >
              <View className="h-4 w-4 rounded-full bg-white" />
            </Pressable97>
          </View>
        </View>
      );
    }

    if (uri) {
      return (
        <View className="mt-6">
          <Image
            source={{ uri }}
            style={{ width: '100%', height: 220, borderRadius: 16 }}
          />
          <View className="mt-3 flex-row items-center gap-3">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sacar otra foto"
              onPress={abrirCamara}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Text className="font-sans text-xs text-slate-300">Sacar otra</Text>
            </Pressable97>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Quitar la foto"
              onPress={() => onCambiar(null)}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={16} color="#64748b" />
            </Pressable97>
          </View>
        </View>
      );
    }

    return (
      <View className="mt-6">
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Abrir la cámara"
          onPress={abrirCamara}
          className="items-center justify-center rounded-2xl border border-dashed py-12"
          style={{ borderColor: `${color}55`, backgroundColor: `${color}0d` }}
        >
          <Ionicons name="camera-outline" size={34} color={color} />
          <Text className="mt-3 font-sans-medium text-sm text-slate-300">
            Abrir la cámara
          </Text>
        </Pressable97>
        <Text className="mt-3 font-sans text-[11px] text-slate-500">
          La foto es guía, no obligación: podés seguir sin ella.
        </Text>
      </View>
    );
  }

  // ------------------------------------------------------------ contador
  if (paso.microUI === 'contador') {
    const n = typeof valor === 'number' ? valor : 0;
    const tope = paso.max ?? 999999;
    const fijar = (v: number) =>
      onCambiar(Math.max(0, Math.min(tope, Math.floor(v))));

    return (
      <View className="mt-8 flex-row items-center justify-center gap-5">
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Restar uno"
          onPress={() => fijar(n - 1)}
          className="h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <Ionicons name="remove" size={24} color="#94a3b8" />
        </Pressable97>
        <TextInput
          value={String(n)}
          onChangeText={(t) => {
            const v = parseInt(t.replace(/\D/g, ''), 10);
            fijar(Number.isNaN(v) ? 0 : v);
          }}
          keyboardType="number-pad"
          accessibilityLabel="El número contado"
          className="min-w-[130px] text-center font-mono text-6xl"
          style={{ color }}
        />
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Sumar uno"
          onPress={() => fijar(n + 1)}
          className="h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"
        >
          <Ionicons name="add" size={24} color="#94a3b8" />
        </Pressable97>
      </View>
    );
  }

  // -------------------------------------------------------- rating-soles
  if (paso.microUI === 'rating-soles') {
    const max = paso.max ?? 5;
    const elegido = typeof valor === 'number' ? valor : 0;
    return (
      <View className="mt-8 items-center">
        <View className="flex-row justify-center gap-2.5">
          {Array.from({ length: max }, (_, i) => {
            const lleno = i < elegido;
            return (
              <Pressable97
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1} de ${max} soles`}
                onPress={() => onCambiar(i + 1)}
                className="p-1"
              >
                <Ionicons
                  name={lleno ? 'sunny' : 'sunny-outline'}
                  size={40}
                  color={lleno ? '#F59E0B' : '#475569'}
                />
              </Pressable97>
            );
          })}
        </View>
        {elegido > 0 && (
          <Text className="mt-3 font-mono text-sm text-brasa">
            {elegido} de {max}
          </Text>
        )}
      </View>
    );
  }

  // --------------------------------------------------------------- chips
  if (paso.microUI === 'chips') {
    return (
      <View className="mt-8 flex-row flex-wrap gap-2.5">
        {(paso.opciones ?? []).map((op) => {
          const activa = valor === op;
          return (
            <Pressable97
              key={op}
              accessibilityRole="button"
              accessibilityLabel={op}
              onPress={() => onCambiar(activa ? null : op)}
              className="rounded-full border px-4 py-2.5"
              style={{
                borderColor: activa ? color : 'rgba(255, 255, 255, 0.12)',
                backgroundColor: activa ? `${color}22` : 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <Text
                className="font-sans-medium text-sm"
                style={{ color: activa ? color : '#cbd5e1' }}
              >
                {op}
              </Text>
            </Pressable97>
          );
        })}
      </View>
    );
  }

  // --------------------------------------------------------- texto-corto
  return (
    <TextInput
      value={typeof valor === 'string' ? valor : ''}
      onChangeText={(t) => onCambiar(t)}
      placeholder="Una línea alcanza."
      placeholderTextColor="#64748b"
      accessibilityLabel={paso.titulo}
      className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
    />
  );
}
