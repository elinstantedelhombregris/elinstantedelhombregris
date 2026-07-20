/**
 * DAR — el micro-compromiso del día (spec §2). Primero rinde cuentas el de
 * ayer ("¿Lo hiciste?" — sin verificación externa: la confianza es la
 * mecánica, y el "no pude" no castiga). Después, tres sugerencias del mazo
 * rotadas por fecha o el compromiso propio.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ModalCielo } from '@/components/juego/ModalCielo';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { COMPROMISO_AYER, COMPROMISOS } from '@/content';
import {
  compromisoDeAyer,
  compromisoDeFecha,
  crearCompromiso,
  hoyLocal,
  marcarLuz,
  resolverCompromiso,
} from '@/db/repos';
import { indicesCompromisosDelDia } from '@/game/dia';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

export default function Dar() {
  const router = useRouter();
  const st = useJuego();
  const fecha = st.fecha || hoyLocal();

  const [ayer] = useState(() => compromisoDeAyer(fecha));
  const [resultadoAyer, setResultadoAyer] = useState<'hecho' | 'no' | null>(null);
  const [faseAyerLista, setFaseAyerLista] = useState(ayer === null);

  const deHoy = useMemo(
    () => (st.luces.dar ? compromisoDeFecha(fecha) : null),
    [st.luces.dar, fecha],
  );

  const sugerencias = useMemo(
    () => indicesCompromisosDelDia(fecha, COMPROMISOS).map((i) => COMPROMISOS[i]!),
    [fecha],
  );
  const [elegida, setElegida] = useState<number | null>(null);
  const [propio, setPropio] = useState('');
  const [comprometiendo, setComprometiendo] = useState(false);

  const responderAyer = (cumplido: boolean) => {
    if (!ayer) return;
    resolverCompromiso(ayer.id, cumplido, { multiplicador: multiplicadorHoy() });
    if (cumplido) haptic.celebrate();
    setResultadoAyer(cumplido ? 'hecho' : 'no');
    st.refresh();
  };

  const comprometerse = () => {
    // doble toque no compromete dos veces el mismo día
    if (comprometiendo) return;
    const textoPropio = propio.trim();
    const sugerida = elegida !== null ? sugerencias[elegida]! : null;
    if (!sugerida && !textoPropio) return;
    setComprometiendo(true);
    if (textoPropio) {
      crearCompromiso(textoPropio, 'propio', fecha);
    } else if (sugerida) {
      crearCompromiso(sugerida.texto, sugerida.categoria, fecha);
    }
    marcarLuz(fecha, 'dar', { multiplicador: multiplicadorHoy() });
    haptic.send();
    st.refresh();
    router.back();
  };

  return (
    <ModalCielo badge="Dar — el compromiso" onCerrar={() => router.back()}>
      {/* Paso 1: rendirle cuentas al de ayer */}
      {!faseAyerLista && ayer && (
        <Animated.View entering={fadeUp}>
          <Text className="font-serif text-3xl text-plata">{COMPROMISO_AYER.pregunta}</Text>
          <GlassCard className="mt-6 p-5">
            <Text className="font-serif-italic text-lg leading-7 text-slate-200">
              {ayer.texto}
            </Text>
            <Text className="mt-2 font-sans text-[11px] text-slate-500">ayer</Text>
          </GlassCard>

          {resultadoAyer === null ? (
            <View className="mt-8 items-center gap-4">
              <AccentButton label="Sí, lo hice" onPress={() => responderAyer(true)} />
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="No pude"
                onPress={() => responderAyer(false)}
                className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5"
              >
                <Text className="font-sans-medium text-sm text-slate-300">No pude</Text>
              </Pressable97>
            </View>
          ) : (
            <Animated.View entering={fadeUp} className="mt-8 items-center">
              <Text className="text-center font-sans text-sm leading-6 text-slate-300">
                {resultadoAyer === 'hecho' ? COMPROMISO_AYER.hecho : COMPROMISO_AYER.noHecho}
              </Text>
              <View className="mt-6">
                <AccentButton label="Al de hoy" onPress={() => setFaseAyerLista(true)} />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Paso 2: el compromiso de hoy */}
      {faseAyerLista &&
        (deHoy ? (
          <Animated.View entering={fadeUp}>
            <Text className="font-serif text-2xl text-plata">Tu compromiso de hoy</Text>
            <GlassCard className="mt-6 p-5">
              <Text className="font-serif-italic text-lg leading-7 text-slate-200">
                {deHoy.texto}
              </Text>
            </GlassCard>
            <Text className="mt-4 font-sans text-xs text-slate-500">
              Mañana el cielo te pregunta si lo hiciste. Nadie más.
            </Text>
            <View className="mt-8 items-center">
              <AccentButton label="Volver al cielo" onPress={() => router.back()} />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={fadeUp}>
            <Text className="font-serif text-2xl leading-9 text-plata">
              Un gesto chico para hoy. Elegilo, o escribí el tuyo.
            </Text>

            <View className="mt-6 gap-3">
              {sugerencias.map((c, i) => {
                const activa = elegida === i;
                return (
                  <Animated.View key={c.id} entering={staggerDelay(i)}>
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel={c.texto}
                      onPress={() => {
                        setElegida(activa ? null : i);
                        setPropio('');
                      }}
                      className="flex-row items-center gap-3 rounded-2xl border bg-white/5 p-4"
                      style={{
                        borderColor: activa ? 'rgba(125, 91, 222, 0.6)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Ionicons
                        name={activa ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={activa ? '#7D5BDE' : '#475569'}
                      />
                      <View className="flex-1">
                        <Text className="font-sans text-sm leading-5 text-slate-200">
                          {c.texto}
                        </Text>
                        <Text className="mt-1 font-sans text-[10px] uppercase tracking-[2px] text-slate-500">
                          {c.categoria}
                        </Text>
                      </View>
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>

            <TextInput
              value={propio}
              onChangeText={(t) => {
                setPropio(t);
                if (t.trim()) setElegida(null);
              }}
              placeholder="…o escribí el tuyo: concreto, chico, de hoy."
              placeholderTextColor="#64748b"
              maxLength={140}
              className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-sm text-plata"
            />

            <View className="mt-8 items-center">
              <AccentButton
                label="Me comprometo"
                onPress={comprometerse}
                disabled={comprometiendo || (elegida === null && !propio.trim())}
              />
            </View>
          </Animated.View>
        ))}
    </ModalCielo>
  );
}
