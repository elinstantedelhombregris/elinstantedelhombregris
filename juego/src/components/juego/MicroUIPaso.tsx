/**
 * Micro-UI por paso de expedición (spec §3.2) — nunca un formulario
 * plano: cada paso trae su gesto propio. La cámara guiada (salteable,
 * como en ENCENDER), el contador grande en mono, los soles de urgencia,
 * los chips, o una línea de texto con la voz del otro.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): la cámara conserva
 * su lógica intacta con un marco discontinuo en tinta; el contador usa
 * dígitos mono + BotonTinta compactos; los soles se quedan (glifo
 * permitido) pero en tinta/ámbar, sin glow; los chips son ChipTipo.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';

import { BotonTinta, ChipTipo } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import type { PasoExpedicion } from '@/content';
import { haptic } from '@/theme/haptics';
import { AMBAR_PT, PAPEL, TINTA, TINTA_30, TINTA_50, VIOLETA } from '@/theme/tokens';

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

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

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
  const [enfocado, setEnfocado] = useState(false);

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
        <View className="mt-6 overflow-hidden border border-tinta">
          <CameraView ref={camaraRef} style={{ height: 300 }} facing="back" />
          <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-6">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Cancelar la foto"
              onPress={() => setCamaraAbierta(false)}
              className="bg-tinta/70 p-3"
            >
              <Ionicons name="close" size={20} color={PAPEL} />
            </Pressable97>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sacar la foto"
              onPress={sacarFoto}
              className="border-2 border-papel bg-papel/20 p-5"
            >
              <View className="h-4 w-4 bg-papel" />
            </Pressable97>
          </View>
        </View>
      );
    }

    if (uri) {
      return (
        <View className="mt-6">
          <Image source={{ uri }} style={{ width: '100%', height: 220 }} />
          <View className="mt-3 flex-row items-center gap-3">
            <BotonTinta
              etiqueta="Sacar otra"
              variante="fantasma"
              tamano="compacto"
              onPress={abrirCamara}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Quitar la foto"
              onPress={() => onCambiar(null)}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={16} color={TINTA_50} />
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
          className="items-center justify-center border border-dashed border-tinta bg-papel-crudo py-12"
        >
          <Ionicons name="camera-outline" size={30} color={TINTA} />
          <Text className="mt-3 font-archivo-bold text-sm text-tinta">
            Abrir la cámara
          </Text>
        </Pressable97>
        <Text className="mt-3 font-archivo text-[11px] text-tinta-50">
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
        <BotonTinta
          etiqueta="−"
          variante="fantasma"
          tamano="compacto"
          accessibilityLabel="Restar uno"
          onPress={() => fijar(n - 1)}
        />
        <TextInput
          value={String(n)}
          onChangeText={(t) => {
            const v = parseInt(t.replace(/\D/g, ''), 10);
            fijar(Number.isNaN(v) ? 0 : v);
          }}
          keyboardType="number-pad"
          accessibilityLabel="El número contado"
          className="min-w-[130px] text-center font-space text-6xl"
          style={{ color }}
        />
        <BotonTinta
          etiqueta="+"
          variante="fantasma"
          tamano="compacto"
          accessibilityLabel="Sumar uno"
          onPress={() => fijar(n + 1)}
        />
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
                  color={lleno ? AMBAR_PT : TINTA_30}
                />
              </Pressable97>
            );
          })}
        </View>
        {elegido > 0 && (
          <Text className="mt-3 font-space text-sm text-tinta-50">
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
            <ChipTipo
              key={op}
              etiqueta={op}
              activo={activa}
              color={color}
              onPress={() => onCambiar(activa ? null : op)}
            />
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
      onFocus={() => setEnfocado(true)}
      onBlur={() => setEnfocado(false)}
      placeholder="Una línea alcanza."
      placeholderTextColor={TINTA_50}
      accessibilityLabel={paso.titulo}
      className="mt-8 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
      style={estiloInput(enfocado)}
    />
  );
}
