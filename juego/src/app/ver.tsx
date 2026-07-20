/**
 * VER — la pregunta honda del día (spec §2). Pantalla completa en Playfair,
 * reflexión escrita opcional que va a la Bitácora privada. Si la estrella
 * fugaz trajo pregunta extra, acá se responde (+2 brasas).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ModalCielo } from '@/components/juego/ModalCielo';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
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

export default function Ver() {
  const router = useRouter();
  const st = useJuego();
  const fecha = st.fecha || hoyLocal();
  const pregunta = PREGUNTAS[indicePregunta(fecha, PREGUNTAS.length)]!;
  const yaEncendida = st.luces.ver;

  const [reflexion, setReflexion] = useState('');
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
        <Text className="font-serif text-3xl leading-[42px] text-plata">
          {pregunta.texto}
        </Text>
        <Text className="mt-3 font-sans text-xs text-slate-500">
          de «{pregunta.fuente}»
        </Text>

        {yaEncendida ? (
          <View className="mt-10">
            {guardada && (
              <GlassCard className="p-5">
                <Text className="font-serif-italic text-base leading-6 text-slate-300">
                  {guardada.texto}
                </Text>
              </GlassCard>
            )}
            <Text className="mt-6 font-sans text-sm text-slate-400">
              La pregunta ya viaja con vos. Volvé cuando quieras releerla.
            </Text>
            <View className="mt-8 items-center">
              <AccentButton label="Volver al cielo" onPress={() => router.back()} />
            </View>
          </View>
        ) : (
          <View className="mt-10">
            <TextInput
              value={reflexion}
              onChangeText={setReflexion}
              placeholder="Si querés, dejala escrita. Va a tu Bitácora."
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              maxLength={2000}
              className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base leading-6 text-plata"
            />
            <Text className="mt-2 font-sans text-[11px] text-slate-500">
              Nadie más la lee: es tuya.
            </Text>
            <View className="mt-8 items-center">
              <AccentButton label="La llevo conmigo" onPress={llevarla} disabled={guardando} />
            </View>
          </View>
        )}

        {extraActiva && (
          <View className="mt-12">
            <View className="mb-4 h-px bg-white/10" />
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles" size={14} color="#F5F7FA" />
              <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                La pregunta extra de la fugaz
              </Text>
            </View>
            {extraRespondida ? (
              <View className="mt-4 flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text className="font-sans text-sm text-slate-400">
                  Respondida: dos brasas más al fuego.
                </Text>
              </View>
            ) : (
              <View className="mt-4">
                <Text className="font-serif text-xl leading-8 text-plata">
                  {preguntaExtra.texto}
                </Text>
                <TextInput
                  value={textoExtra}
                  onChangeText={setTextoExtra}
                  placeholder="Una línea alcanza."
                  placeholderTextColor="#64748b"
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                  className="mt-4 min-h-[80px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base leading-6 text-plata"
                />
                <View className="mt-4 items-center">
                  <AccentButton
                    label="Responderla (+2)"
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
