/**
 * Rito de re-encendido (spec §2): la racha se apagó y vuelve a nacer en 1.
 * Releer una reflexión propia + 30 segundos de respiración guiada
 * (4 ciclos de expandir/contraer). Sin culpa: la recaída es parte del camino.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7): el cierre sella
 * `REENCENDIDA` (spec §5, catálogo cerrado) antes de volver al cielo.
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BotonTinta, PapelCard, Sello, TituloAnton } from '@/components/papel';
import { ModalCielo } from '@/components/juego/ModalCielo';
import { Pressable97 } from '@/components/ui/Pressable97';
import { RITO_REENCENDIDO } from '@/content';
import { reflexionesTodas, registrarRito } from '@/db/repos';
import type { ReflectionRow } from '@/db/schema';
import { fadeUp } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

type Fase = 'intro' | 'reflexion' | 'respiracion' | 'cierre';

const MEDIO_CICLO_MS = 3750; // 4 ciclos de 7,5 s = 30 s

function Respiracion({ onTerminar }: { onTerminar: () => void }) {
  const escala = useSharedValue(1);
  const [faseRespiro, setFaseRespiro] = useState<'inhalá' | 'exhalá'>('inhalá');
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  useEffect(() => {
    // 4 ciclos: expandir (inhalar) y contraer (exhalar), 30 s en total.
    escala.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: MEDIO_CICLO_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: MEDIO_CICLO_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      4,
      false,
    );
    const medios = Array.from({ length: 8 }, (_, i) =>
      setTimeout(() => setFaseRespiro(i % 2 === 0 ? 'exhalá' : 'inhalá'), (i + 1) * MEDIO_CICLO_MS),
    );
    const fin = setTimeout(onTerminar, MEDIO_CICLO_MS * 8 + 300);
    return () => {
      medios.forEach(clearTimeout);
      clearTimeout(fin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="flex-1 items-center justify-center py-16">
      <Animated.View
        style={[
          estilo,
          {
            width: 120,
            height: 120,
            // rgba de OSCURO_TEXTO (#F2EFE7) — cero radius (spec §1: sin
            // excepciones), el aro respira solo con opacidad y escala.
            backgroundColor: 'rgba(242, 239, 231, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(242, 239, 231, 0.35)',
          },
        ]}
      />
      <Text className="mt-14 font-archivo-italic text-2xl text-oscuro-texto">{faseRespiro}</Text>
      <Text className="mt-2 font-space text-xs text-oscuro-tenue">
        treinta segundos, nada más
      </Text>
    </View>
  );
}

export default function Rito() {
  const router = useRouter();
  const st = useJuego();
  const [fase, setFase] = useState<Fase>('intro');
  const [reflexiones] = useState<ReflectionRow[]>(() =>
    reflexionesTodas().slice(-20).reverse(),
  );
  const [elegida, setElegida] = useState<ReflectionRow | null>(null);

  const terminarRespiracion = () => {
    registrarRito();
    haptic.celebrate();
    st.refresh();
    setFase('cierre');
  };

  if (st.rachaInfo.viva && fase === 'intro') {
    // La Guía ya arde: acá no hay nada que reencender.
    return (
      <ModalCielo badge="Rito de re-encendido" onCerrar={() => router.back()}>
        <Text className="font-archivo text-sm leading-6 text-oscuro-secundario">
          La Estrella Guía ya está encendida. El rito espera para cuando haga
          falta — ojalá sea nunca.
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
      </ModalCielo>
    );
  }

  return (
    <ModalCielo badge="Rito de re-encendido" onCerrar={() => router.back()}>
      {fase === 'intro' && (
        <Animated.View entering={fadeUp}>
          <TituloAnton registro="noche" tamano="xl">
            {RITO_REENCENDIDO.titulo}
          </TituloAnton>
          <Text className="mt-5 font-archivo text-sm leading-6 text-oscuro-secundario">
            {RITO_REENCENDIDO.intro}
          </Text>
          <View className="mt-10 items-center">
            <BotonTinta
              etiqueta="Empezar"
              variante="primaria"
              registro="noche"
              onPress={() => setFase(reflexiones.length > 0 ? 'reflexion' : 'respiracion')}
            />
          </View>
        </Animated.View>
      )}

      {fase === 'reflexion' && (
        <Animated.View entering={fadeUp}>
          <Text className="font-archivo text-sm leading-6 text-oscuro-secundario">
            {RITO_REENCENDIDO.pasoReflexion}
          </Text>
          {elegida === null ? (
            <ScrollView className="mt-6" style={{ maxHeight: 380 }}>
              <View className="gap-3 pb-4">
                {reflexiones.map((r) => (
                  <Pressable97
                    key={r.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Reflexión del ${r.fecha}`}
                    onPress={() => setElegida(r)}
                  >
                    <PapelCard registro="noche" className="p-4">
                      <Text className="font-archivo text-sm text-oscuro-texto" numberOfLines={2}>
                        {r.texto}
                      </Text>
                      <Text className="mt-1.5 font-space text-[10px] text-oscuro-meta">
                        {r.fecha}
                      </Text>
                    </PapelCard>
                  </Pressable97>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="mt-6">
              <PapelCard registro="noche" className="p-5">
                <Text className="font-archivo-italic text-lg leading-7 text-oscuro-texto">
                  {elegida.texto}
                </Text>
                <Text className="mt-3 font-space text-[10px] text-oscuro-meta">
                  {elegida.fecha} — la escribiste vos
                </Text>
              </PapelCard>
              <View className="mt-8 items-center">
                <BotonTinta
                  etiqueta="Respirar"
                  variante="primaria"
                  registro="noche"
                  onPress={() => setFase('respiracion')}
                />
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Elegir otra reflexión"
                  onPress={() => setElegida(null)}
                  className="mt-4 px-4 py-2"
                >
                  <Text className="font-archivo text-xs text-oscuro-tenue">← Otra reflexión</Text>
                </Pressable97>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {fase === 'respiracion' && (
        <View className="flex-1">
          <Text className="font-archivo text-sm leading-6 text-oscuro-secundario">
            {RITO_REENCENDIDO.pasoRespiracion}
          </Text>
          <Respiracion onTerminar={terminarRespiracion} />
        </View>
      )}

      {fase === 'cierre' && (
        <View className="flex-1 items-center justify-center px-4">
          <Sello texto="REENCENDIDA" color="sello" rotacion={6} />
          <Animated.View entering={fadeUp} className="mt-8 items-center">
            <Text className="text-center font-archivo-italic text-xl leading-8 text-oscuro-texto">
              {RITO_REENCENDIDO.cierre}
            </Text>
          </Animated.View>
          <View className="mt-10">
            <BotonTinta
              etiqueta="Volver al cielo →"
              accessibilityLabel="Volver al cielo"
              variante="fantasma"
              registro="noche"
              onPress={() => router.back()}
            />
          </View>
        </View>
      )}
    </ModalCielo>
  );
}
