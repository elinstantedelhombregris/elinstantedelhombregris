/**
 * VER — la pregunta honda del día (spec §2). Pantalla completa en Anton,
 * reflexión escrita opcional que va a la Bitácora privada. Si la estrella
 * fugaz trajo pregunta extra, acá se responde (+2 brasas).
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7).
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import { ModalCielo } from '@/components/juego/ModalCielo';
import { PREGUNTAS } from '@/content';
import {
  ganarBrasas,
  getSetting,
  guardarReflexion,
  hoyLocal,
  marcarLuz,
  reflexionesTodas,
  setSetting,
} from '@/db/repos';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import { indicePregunta, indicePreguntaExtra } from '@/game/dia';
import { fadeUp } from '@/motion/variants';
import { CLAVES_DIA, multiplicadorHoy, useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { OSCURO_BORDE, OSCURO_TENUE, VERDE, VIOLETA } from '@/theme/tokens';

export default function Ver() {
  const router = useRouter();
  const st = useJuego();
  const fecha = st.fecha || hoyLocal();
  const pregunta = PREGUNTAS[indicePregunta(fecha, PREGUNTAS.length)]!;
  const yaEncendida = st.luces.ver;

  const [reflexion, setReflexion] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const guardada = useMemo(
    () =>
      reflexionesTodas()
        .filter((r) => r.fecha === fecha && r.preguntaId === pregunta.id)
        .pop() ?? null,
    // se relee tras guardar gracias al refresh del store
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fecha, pregunta.id, st.luces.ver, st.brasas],
  );

  const [guardando, setGuardando] = useState(false);

  const llevarla = () => {
    // doble toque no guarda dos veces: una vez alcanza
    if (guardando || yaEncendida) return;
    setGuardando(true);
    const texto = reflexion.trim();
    if (texto) guardarReflexion(pregunta.id, texto, fecha);
    marcarLuz(fecha, 'ver', { multiplicador: multiplicadorHoy() });
    haptic.send();
    st.refresh();
    router.back();
  };

  // Pregunta extra de la estrella fugaz (spec §3.4)
  const extraActiva = st.eventoHoy === 'pregunta-extra';
  const preguntaExtra = PREGUNTAS[indicePreguntaExtra(fecha, PREGUNTAS.length)]!;
  const extraRespondida = getSetting(CLAVES_DIA.preguntaExtra) === fecha;
  const [textoExtra, setTextoExtra] = useState('');
  const [enfocadoExtra, setEnfocadoExtra] = useState(false);
  const [respondiendoExtra, setRespondiendoExtra] = useState(false);

  const responderExtra = () => {
    // doble toque no cobra las dos brasas dos veces
    if (respondiendoExtra || extraRespondida) return;
    const texto = textoExtra.trim();
    if (!texto) return;
    setRespondiendoExtra(true);
    guardarReflexion(preguntaExtra.id, texto, fecha);
    ganarBrasas(GANANCIAS.preguntaExtra, MOTIVOS.preguntaExtra, {
      multiplicador: multiplicadorHoy(),
    });
    setSetting(CLAVES_DIA.preguntaExtra, fecha);
    haptic.celebrate();
    st.refresh();
  };

  return (
    <ModalCielo badge="Ver — la pregunta del día" onCerrar={() => router.back()}>
      <Animated.View entering={fadeUp} className="flex-1">
        <TituloAnton registro="noche" tamano="xl">
          {pregunta.texto}
        </TituloAnton>
        <Text className="mt-3 font-space text-xs text-oscuro-meta">
          de «{pregunta.fuente}»
        </Text>

        {yaEncendida ? (
          <View className="mt-10">
            {guardada && (
              <PapelCard registro="noche" className="p-5">
                <Text className="font-archivo-italic text-base leading-6 text-oscuro-secundario">
                  {guardada.texto}
                </Text>
              </PapelCard>
            )}
            <Text className="mt-6 font-archivo text-sm text-oscuro-secundario">
              La pregunta ya viaja con vos. Volvé cuando quieras releerla.
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
          </View>
        ) : (
          <View className="mt-10">
            <TextInput
              value={reflexion}
              onChangeText={setReflexion}
              onFocus={() => setEnfocado(true)}
              onBlur={() => setEnfocado(false)}
              placeholder="Si querés, dejala escrita. Va a tu Bitácora."
              placeholderTextColor={OSCURO_TENUE}
              multiline
              textAlignVertical="top"
              maxLength={2000}
              className="min-h-[120px] bg-transparent px-5 py-4 font-archivo text-base leading-6 text-oscuro-texto"
              style={{
                borderWidth: enfocado ? 2 : 1,
                borderColor: enfocado ? VIOLETA : OSCURO_BORDE,
                // Spec §10: el foco visible en web es el `outline`, no un
                // segundo halo — pisa el anillo nativo del navegador.
                outlineColor: VIOLETA,
                outlineStyle: 'solid',
                outlineWidth: enfocado ? 2 : 0,
                outlineOffset: 2,
              }}
            />
            <Text className="mt-2 font-space text-[11px] text-oscuro-meta">
              Nadie más la lee: es tuya.
            </Text>
            <View className="mt-8 items-center">
              <BotonTinta
                etiqueta="La llevo conmigo →"
                accessibilityLabel="La llevo conmigo"
                variante="primaria"
                registro="noche"
                onPress={llevarla}
                disabled={guardando}
              />
            </View>
          </View>
        )}

        {extraActiva && (
          <View className="mt-12">
            <View className="mb-4 h-px bg-oscuro-borde" />
            <Kicker registro="noche">La pregunta extra de la fugaz</Kicker>
            {extraRespondida ? (
              <Text className="mt-4 font-space text-sm" style={{ color: VERDE }}>
                Respondida: dos brasas más al fuego.
              </Text>
            ) : (
              <View className="mt-4">
                <TituloAnton registro="noche" tamano="md">
                  {preguntaExtra.texto}
                </TituloAnton>
                <TextInput
                  value={textoExtra}
                  onChangeText={setTextoExtra}
                  onFocus={() => setEnfocadoExtra(true)}
                  onBlur={() => setEnfocadoExtra(false)}
                  placeholder="Una línea alcanza."
                  placeholderTextColor={OSCURO_TENUE}
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                  className="mt-4 min-h-[80px] bg-transparent px-5 py-4 font-archivo text-base leading-6 text-oscuro-texto"
                  style={{
                    borderWidth: enfocadoExtra ? 2 : 1,
                    borderColor: enfocadoExtra ? VIOLETA : OSCURO_BORDE,
                    outlineColor: VIOLETA,
                    outlineStyle: 'solid',
                    outlineWidth: enfocadoExtra ? 2 : 0,
                    outlineOffset: 2,
                  }}
                />
                <View className="mt-4 items-center">
                  <BotonTinta
                    etiqueta="Responderla (+2)"
                    variante="fantasma"
                    registro="noche"
                    onPress={responderExtra}
                    disabled={!textoExtra.trim() || respondiendoExtra}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </ModalCielo>
  );
}
