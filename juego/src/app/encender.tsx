/**
 * ENCENDER — el rito de captura (spec §2): elegir la señal, responder su
 * pregunta en una línea, foto opcional, GPS silencioso de mejor esfuerzo.
 * El payoff es el nacimiento: el modal se cierra y la estrella florece
 * en el Cielo (bloom + háptica).
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ModalCielo } from '@/components/juego/ModalCielo';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SENALES, type SenalDef } from '@/content';
import { crearEstrella, expedicionesTodas, hoyLocal, marcarLuz } from '@/db/repos';
import { obtenerCoords } from '@/lib/capturar-gps';
import { slideLeftIn, staggerDelay } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

export default function Encender() {
  const router = useRouter();
  const st = useJuego();
  const fecha = st.fecha || hoyLocal();

  const [senal, setSenal] = useState<SenalDef | null>(null);
  const [texto, setTexto] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [naciendo, setNaciendo] = useState(false);
  const [permisoCamara, pedirPermisoCamara] = useCameraPermissions();
  const camaraRef = useRef<CameraView>(null);

  const expedicionActiva = expedicionesTodas().some((e) => e.estado === 'activa');

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
        setPhotoUri(foto.uri);
        haptic.tick();
      }
    } catch {
      // silencioso: se puede seguir sin foto
    } finally {
      setCamaraAbierta(false);
    }
  };

  const queNazca = async () => {
    if (!senal || naciendo) return;
    setNaciendo(true);
    const coords = await obtenerCoords(); // jamás bloquea más de 3 s
    const star = crearEstrella({
      tipo: senal.key,
      texto: texto.trim() || null,
      photoUri,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      eventoActivo: st.eventoHoy !== null,
    });
    marcarLuz(fecha, 'encender', { multiplicador: multiplicadorHoy() });
    useJuego.getState().setNewStar(star.id);
    haptic.celebrate();
    st.refresh();
    router.back(); // la estrella florece en el Cielo
  };

  return (
    <ModalCielo
      badge={st.luces.encender ? 'Encender — otra estrella' : 'Encender — la captura'}
      onCerrar={() => router.back()}
    >
      {!senal ? (
        <View>
          <Text className="font-serif text-2xl leading-9 text-plata">
            ¿Qué viste hoy, ahí donde estás?
          </Text>
          <View className="mt-8 flex-row flex-wrap justify-between">
            {SENALES.map((s, i) => (
              <Animated.View key={s.key} entering={staggerDelay(i)} className="mb-4 w-[31%]">
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={s.label}
                  onPress={() => setSenal(s)}
                  className="items-center rounded-2xl border border-white/10 bg-white/5 px-2 py-5"
                  style={{ borderColor: `${s.color}44` }}
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${s.color}22` }}
                  >
                    <Ionicons name={s.icon as never} size={22} color={s.color} />
                  </View>
                  <Text className="mt-2 font-sans-medium text-[11px] text-slate-300">
                    {s.label}
                  </Text>
                </Pressable97>
              </Animated.View>
            ))}
          </View>

          {expedicionActiva && (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Jugá una expedición"
              onPress={() => router.push('/expediciones')}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3"
            >
              <Ionicons name="map-outline" size={15} color="#94a3b8" />
              <Text className="font-sans-medium text-xs text-slate-300">
                Tenés una expedición en marcha — jugala desde su panel
              </Text>
            </Pressable97>
          )}
        </View>
      ) : (
        <Animated.View entering={slideLeftIn}>
          <View className="flex-row items-center gap-2">
            <Ionicons name={senal.icon as never} size={16} color={senal.color} />
            <Text className="font-sans text-[11px] uppercase tracking-[3px]" style={{ color: senal.color }}>
              {senal.label}
            </Text>
          </View>
          <Text className="mt-4 font-serif text-3xl leading-[42px] text-plata">
            {senal.question}
          </Text>

          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder={senal.placeholder}
            placeholderTextColor="#64748b"
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
          />

          {/* Foto opcional, jamás obligatoria */}
          {camaraAbierta ? (
            <View className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <CameraView ref={camaraRef} style={{ height: 260 }} facing="back" />
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
          ) : photoUri ? (
            <View className="mt-4 flex-row items-center gap-3">
              <Image
                source={{ uri: photoUri }}
                style={{ width: 72, height: 72, borderRadius: 14 }}
              />
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
                onPress={() => setPhotoUri(null)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={16} color="#64748b" />
              </Pressable97>
            </View>
          ) : (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sumar una foto"
              onPress={abrirCamara}
              className="mt-4 flex-row items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2.5"
            >
              <Ionicons name="camera-outline" size={16} color="#94a3b8" />
              <Text className="font-sans text-xs text-slate-300">
                Sumale una foto (opcional)
              </Text>
            </Pressable97>
          )}

          <View className="mt-10 items-center">
            <AccentButton
              label={naciendo ? 'Naciendo…' : 'Que nazca'}
              onPress={queNazca}
              disabled={naciendo}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Elegir otra señal"
              onPress={() => setSenal(null)}
              className="mt-4 px-4 py-2"
            >
              <Text className="font-sans text-xs text-slate-500">← Otra señal</Text>
            </Pressable97>
          </View>
        </Animated.View>
      )}

      {st.luces.encender && !senal && (
        <GlassCard className="mt-6 p-4">
          <Text className="font-sans text-xs leading-5 text-slate-400">
            La luz de hoy ya está encendida. Cada captura extra suma una
            estrella igual — el cielo no tiene techo.
          </Text>
        </GlassCard>
      )}
    </ModalCielo>
  );
}
