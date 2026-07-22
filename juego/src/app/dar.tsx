/**
 * DAR — el micro-compromiso del día (spec §2). Primero rinde cuentas el de
 * ayer ("¿Lo hiciste?" — sin verificación externa: la confianza es la
 * mecánica, y el "no pude" no castiga). Después, tres sugerencias del mazo
 * rotadas por fecha o el compromiso propio.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7).
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, PapelCard, TituloAnton } from '@/components/papel';
import { ModalCielo } from '@/components/juego/ModalCielo';
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
import { OSCURO_BORDE, OSCURO_TENUE, VIOLETA } from '@/theme/tokens';

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
  const [enfocadoPropio, setEnfocadoPropio] = useState(false);
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
          <TituloAnton registro="noche" tamano="xl">
            {COMPROMISO_AYER.pregunta}
          </TituloAnton>
          <PapelCard registro="noche" className="mt-6 p-5">
            <Text className="font-archivo-italic text-lg leading-7 text-oscuro-texto">
              {ayer.texto}
            </Text>
            <Text className="mt-2 font-space text-[11px] text-oscuro-meta">ayer</Text>
          </PapelCard>

          {resultadoAyer === null ? (
            <View className="mt-8 items-center gap-4">
              <BotonTinta
                etiqueta="Sí, lo hice"
                variante="primaria"
                registro="noche"
                onPress={() => responderAyer(true)}
              />
              <BotonTinta
                etiqueta="No pude"
                accessibilityLabel="No pude"
                variante="fantasma"
                registro="noche"
                onPress={() => responderAyer(false)}
              />
            </View>
          ) : (
            <Animated.View entering={fadeUp} className="mt-8 items-center">
              <Text className="text-center font-archivo text-sm leading-6 text-oscuro-secundario">
                {resultadoAyer === 'hecho' ? COMPROMISO_AYER.hecho : COMPROMISO_AYER.noHecho}
              </Text>
              <View className="mt-6">
                <BotonTinta
                  etiqueta="Al de hoy"
                  variante="primaria"
                  registro="noche"
                  onPress={() => setFaseAyerLista(true)}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Paso 2: el compromiso de hoy */}
      {faseAyerLista &&
        (deHoy ? (
          <Animated.View entering={fadeUp}>
            <TituloAnton registro="noche" tamano="lg">
              Tu compromiso de hoy
            </TituloAnton>
            <PapelCard registro="noche" className="mt-6 p-5">
              <Text className="font-archivo-italic text-lg leading-7 text-oscuro-texto">
                {deHoy.texto}
              </Text>
            </PapelCard>
            <Text className="mt-4 font-space text-xs text-oscuro-meta">
              Mañana el cielo te pregunta si lo hiciste. Nadie más.
            </Text>
            <View className="mt-8 items-center">
              <BotonTinta
                etiqueta="Volver al cielo →"
                accessibilityLabel="Volver al cielo"
                variante="fantasma"
                registro="noche"
                onPress={() => router.back()}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={fadeUp}>
            <TituloAnton registro="noche" tamano="lg">
              Un gesto chico para hoy. Elegilo, o escribí el tuyo.
            </TituloAnton>

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
                      className="border p-4"
                      style={{ borderWidth: activa ? 2 : 1, borderColor: activa ? VIOLETA : OSCURO_BORDE }}
                    >
                      <Text className="font-archivo text-sm leading-5 text-oscuro-texto">
                        {c.texto}
                      </Text>
                      <Text className="mt-1 font-space text-[10px] uppercase tracking-[2px] text-oscuro-meta">
                        {c.categoria}
                      </Text>
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
              onFocus={() => setEnfocadoPropio(true)}
              onBlur={() => setEnfocadoPropio(false)}
              placeholder="…o escribí el tuyo: concreto, chico, de hoy."
              placeholderTextColor={OSCURO_TENUE}
              maxLength={140}
              className="mt-4 bg-transparent px-5 py-4 font-archivo text-sm text-oscuro-texto"
              style={{
                borderWidth: enfocadoPropio ? 2 : 1,
                borderColor: enfocadoPropio ? VIOLETA : OSCURO_BORDE,
                outlineColor: VIOLETA,
                outlineStyle: 'solid',
                outlineWidth: enfocadoPropio ? 2 : 0,
                outlineOffset: 2,
              }}
            />

            <View className="mt-8 items-center">
              <BotonTinta
                etiqueta="Me comprometo →"
                accessibilityLabel="Me comprometo"
                variante="primaria"
                registro="noche"
                onPress={comprometerse}
                disabled={comprometiendo || (elegida === null && !propio.trim())}
              />
            </View>
          </Animated.View>
        ))}
    </ModalCielo>
  );
}
