/**
 * FTUE del asombro (spec §3.6) — de la pregunta a la primera estrella en
 * menos de un minuto. Tres fases: pregunta → nacimiento → tooltips. Nada de
 * pantallas de contrato: el asombro va primero, la explicación viene después
 * y ya con una estrella propia ardiendo en el cielo.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7): el cielo se
 * renderiza desaturado hasta que nace la estrella (el despertar, spec §7).
 */

import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, PapelCard, Sello, TituloAnton } from '@/components/papel';
import { LuzPlaca } from '@/components/juego/LuzPlaca';
import { Pressable97 } from '@/components/ui/Pressable97';
import { FTUE_ASOMBRO } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import { CLAVES, crearEstrellaCivicaUnaVez, ganarBrasasUnaVez, getSetting, setSetting } from '@/db/repos';
import type { StarRow } from '@/db/schema';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import type { Luz } from '@/game/types';
import { fadeIn, fadeUp } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { OSCURO_BORDE, OSCURO_TENUE, OSCURO_TEXTO, VIOLETA } from '@/theme/tokens';

type Fase = 'pregunta' | 'nacimiento' | 'tooltips';

/** Orden canónico de las Tres Luces — el mismo del dock en index.tsx. */
const ORDEN_LUCES: readonly Luz[] = ['ver', 'encender', 'dar'];

export default function Ftue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fase, setFase] = useState<Fase>('pregunta');
  const [texto, setTexto] = useState('');
  const [estrella, setEstrella] = useState<StarRow | null>(null);
  const [encendiendo, setEncendiendo] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const [luzActiva, setLuzActiva] = useState<Luz>('ver');

  if (getSetting(CLAVES.ftueCompleto) === '1') {
    return <Redirect href="/" />;
  }

  // Al encender: nace la estrella, arranca el fuego con la bienvenida
  // (idempotente — un reintento tras un cierre a mitad de camino no duplica
  // las brasas) y el Cielo la hace florecer.
  const encender = () => {
    if (encendiendo || !texto.trim()) return;
    setEncendiendo(true);
    const star = crearEstrellaCivicaUnaVez('ftue-primera-estrella', { tipo: 'need', texto: texto.trim() });
    ganarBrasasUnaVez('ftue-bienvenida', GANANCIAS.bienvenida, MOTIVOS.bienvenida);
    useJuego.getState().setNewStar(star.id);
    haptic.celebrate();
    setEstrella(star);
    setFase('nacimiento');
  };

  const terminar = () => {
    setSetting(CLAVES.ftueCompleto, '1');
    useJuego.getState().clearNewStar();
    router.replace('/');
  };

  const avanzarTooltip = () => {
    const i = ORDEN_LUCES.indexOf(luzActiva);
    if (i < ORDEN_LUCES.length - 1) {
      setLuzActiva(ORDEN_LUCES[i + 1] as Luz);
      return;
    }
    terminar();
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <SkyView
          estrellas={estrella ? [estrella] : []}
          rachaViva
          nuevaEstrellaId={fase === 'nacimiento' ? estrella?.id : null}
          dormido={fase === 'pregunta'}
        />
      </View>

      {fase === 'pregunta' && (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            className="flex-1 justify-center px-7"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
          >
            <Animated.View entering={fadeUp}>
              <TituloAnton entintar registro="noche" tamano="xl">
                {FTUE_ASOMBRO.pregunta}
              </TituloAnton>
              <TextInput
                value={texto}
                onChangeText={setTexto}
                onFocus={() => setEnfocado(true)}
                onBlur={() => setEnfocado(false)}
                placeholder={FTUE_ASOMBRO.placeholderRespuesta}
                placeholderTextColor={OSCURO_TENUE}
                maxLength={280}
                returnKeyType="done"
                onSubmitEditing={encender}
                accessibilityLabel={FTUE_ASOMBRO.pregunta}
                className="mt-8 bg-transparent px-5 py-4 font-archivo text-base text-oscuro-texto"
                style={{
                  borderWidth: enfocado ? 2 : 1,
                  borderColor: enfocado ? VIOLETA : OSCURO_BORDE,
                  // Spec §10: el foco visible en web es el `outline`, no un
                  // segundo halo — pisa el anillo nativo del navegador
                  // (que sale en el color del sistema, no en violeta).
                  outlineColor: VIOLETA,
                  outlineStyle: 'solid',
                  outlineWidth: enfocado ? 2 : 0,
                  outlineOffset: 2,
                }}
              />
              <View className="mt-8 items-center">
                <BotonTinta
                  etiqueta="Que se encienda →"
                  accessibilityLabel="Que se encienda"
                  variante="primaria"
                  registro="noche"
                  onPress={encender}
                  disabled={!texto.trim()}
                  cargando={encendiendo}
                />
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      )}

      {fase === 'nacimiento' && (
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        >
          <Sello texto="ENCENDIDA" color="violeta" rotacion={-6} />
          <Animated.View entering={fadeUp} className="mt-8 items-center">
            <TituloAnton registro="noche" tamano="lg" className="text-center">
              {FTUE_ASOMBRO.nacimiento}
            </TituloAnton>
            <Text className="mt-4 text-center font-archivo text-sm leading-6 text-oscuro-secundario">
              {FTUE_ASOMBRO.bienvenidaBrasas}
            </Text>
          </Animated.View>
          <View className="mt-10">
            <BotonTinta
              etiqueta="Seguir"
              variante="primaria"
              registro="noche"
              onPress={() => setFase('tooltips')}
            />
          </View>
        </View>
      )}

      {fase === 'tooltips' && (
        <Animated.View
          entering={fadeIn}
          className="flex-1 justify-end px-7"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 28 }}
        >
          <View className="mb-8 flex-row items-end justify-center gap-9">
            <View style={{ opacity: luzActiva === 'ver' ? 1 : 0.35 }}>
              <LuzPlaca luz="ver" encendida={false} onPress={() => setLuzActiva('ver')} />
            </View>
            <View className="mb-4" style={{ opacity: luzActiva === 'encender' ? 1 : 0.35 }}>
              <LuzPlaca luz="encender" encendida={false} destacada onPress={() => setLuzActiva('encender')} />
            </View>
            <View style={{ opacity: luzActiva === 'dar' ? 1 : 0.35 }}>
              <LuzPlaca luz="dar" encendida={false} onPress={() => setLuzActiva('dar')} />
            </View>
          </View>

          <PapelCard registro="noche" className="p-5">
            <Text className="font-archivo text-sm leading-6 text-oscuro-texto">
              {FTUE_ASOMBRO.tooltips[luzActiva]}
            </Text>
          </PapelCard>

          <View className="mt-5 flex-row items-center justify-center gap-2">
            {ORDEN_LUCES.map((luz) => (
              <View
                key={luz}
                className="h-1.5 w-1.5"
                style={{ backgroundColor: luz === luzActiva ? OSCURO_TEXTO : OSCURO_TENUE }}
              />
            ))}
          </View>

          <View className="mt-6 items-center">
            <BotonTinta
              etiqueta={luzActiva === 'dar' ? 'A mi cielo →' : 'Siguiente'}
              accessibilityLabel={luzActiva === 'dar' ? 'A mi cielo' : 'Siguiente'}
              variante="primaria"
              registro="noche"
              onPress={avanzarTooltip}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel={FTUE_ASOMBRO.saltearTour}
              onPress={terminar}
              className="mt-4 min-h-11 items-center justify-center px-4"
            >
              <Text className="font-archivo-medium text-xs text-oscuro-tenue">
                {FTUE_ASOMBRO.saltearTour}
              </Text>
            </Pressable97>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
