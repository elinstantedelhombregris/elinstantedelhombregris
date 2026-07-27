/**
 * ENCENDER — el rito de captura (spec §2): elegir la señal, responder su
 * pregunta en una línea, foto opcional, GPS silencioso de mejor esfuerzo.
 * El payoff es el nacimiento: el modal se cierra y la estrella florece
 * en el Cielo (bloom + háptica).
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7): los chips de
 * señal van sobrios (mono, sin ícono) — solo la señal elegida se tiñe,
 * y con los colores nocturnos de `COLOR_ESTRELLA`, no los de papel.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, PapelCard, TituloAnton } from '@/components/papel';
import { ModalCielo } from '@/components/juego/ModalCielo';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SENALES, type SenalDef } from '@/content';
import { getActorKey } from '@/civic/identity';
import { createObservation } from '@/civic/repo';
import { COLOR_ESTRELLA } from '@/cielo/posiciones';
import { crearEstrella, expedicionesTodas, hoyLocal, marcarLuz } from '@/db/repos';
import { obtenerCoords } from '@/lib/capturar-gps';
import { slideLeftIn, staggerDelay } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { OSCURO_BORDE, OSCURO_META, OSCURO_TENUE, OSCURO_TEXTO, VIOLETA } from '@/theme/tokens';

export default function Encender() {
  const router = useRouter();
  const st = useJuego();
  const fecha = st.fecha || hoyLocal();

  const [senal, setSenal] = useState<SenalDef | null>(null);
  const [texto, setTexto] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [naciendo, setNaciendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const coords = await obtenerCoords(); // jamás bloquea más de 3 s
      const star = crearEstrella({
        tipo: senal.key,
        texto: texto.trim() || null,
        photoUri,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        eventoActivo: st.eventoHoy !== null,
      });
      const creatorKey = await getActorKey();
      createObservation({
        campaignKey: 'senal-libre-v1',
        starId: star.id,
        creatorKey,
        category: senal.key,
        title: senal.label,
        summary: texto.trim() || null,
        data: { signalType: senal.key },
        evidence: photoUri ? [{ kind: 'photo', uri: photoUri, capturedAt: new Date().toISOString() }] : [],
        exactLocation: coords,
        publicPrecision: '500m',
        locationLabel: 'Mi zona',
      });
      marcarLuz(fecha, 'encender', { multiplicador: multiplicadorHoy() });
      useJuego.getState().setNewStar(star.id);
      haptic.celebrate();
      st.refresh();
      router.back(); // la estrella florece en el Cielo
    } catch {
      // si algo se traba, el rito no queda colgado: se avisa y se reintenta
      setError('Uy, algo se trabó al guardar. Probá de nuevo.');
    } finally {
      setNaciendo(false);
    }
  };

  return (
    <ModalCielo
      badge={st.luces.encender ? 'Encender — otra estrella' : 'Encender — la captura'}
      onCerrar={() => router.back()}
    >
      {!senal ? (
        <View>
          <TituloAnton registro="noche" tamano="lg">
            ¿Qué viste hoy, ahí donde estás?
          </TituloAnton>
          <View className="mt-8 flex-row flex-wrap justify-between">
            {SENALES.map((s, i) => (
              <Animated.View key={s.key} entering={staggerDelay(i)} className="mb-4 w-[31%]">
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel={s.label}
                  onPress={() => setSenal(s)}
                  className="items-center justify-center border border-oscuro-borde px-2 py-5"
                >
                  <Text className="font-space-bold text-[11px] uppercase tracking-[0.88px] text-oscuro-meta">
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
              className="mt-2 flex-row items-center justify-center gap-2 border border-oscuro-borde px-4 py-3"
            >
              <Ionicons name="map-outline" size={15} color={OSCURO_META} />
              <Text className="font-archivo text-xs text-oscuro-secundario">
                Tenés una expedición en marcha — jugala desde su panel
              </Text>
            </Pressable97>
          )}
        </View>
      ) : (
        <Animated.View entering={slideLeftIn}>
          <View
            className="flex-row items-center self-start border-2 px-3 py-2"
            style={{
              borderColor: COLOR_ESTRELLA[senal.key],
              backgroundColor: `${COLOR_ESTRELLA[senal.key]}33`,
            }}
          >
            <Text
              className="font-space-bold text-[11px] uppercase tracking-[0.88px]"
              style={{ color: COLOR_ESTRELLA[senal.key] }}
            >
              {senal.label}
            </Text>
          </View>
          <View className="mt-4">
            <TituloAnton registro="noche" tamano="xl">
              {senal.question}
            </TituloAnton>
          </View>

          <TextInput
            value={texto}
            onChangeText={setTexto}
            onFocus={() => setEnfocado(true)}
            onBlur={() => setEnfocado(false)}
            placeholder={senal.placeholder}
            placeholderTextColor={OSCURO_TENUE}
            maxLength={280}
            className="mt-8 bg-transparent px-5 py-4 font-archivo text-base text-oscuro-texto"
            style={{
              borderWidth: enfocado ? 2 : 1,
              borderColor: enfocado ? VIOLETA : OSCURO_BORDE,
              outlineColor: VIOLETA,
              outlineStyle: 'solid',
              outlineWidth: enfocado ? 2 : 0,
              outlineOffset: 2,
            }}
          />

          {/* Foto opcional, jamás obligatoria */}
          {camaraAbierta ? (
            <View className="mt-4 overflow-hidden border border-oscuro-borde">
              <CameraView ref={camaraRef} style={{ height: 260 }} facing="back" />
              <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-6">
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar la foto"
                  onPress={() => setCamaraAbierta(false)}
                  className="bg-black/50 p-3"
                >
                  <Ionicons name="close" size={20} color={OSCURO_TEXTO} />
                </Pressable97>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Sacar la foto"
                  onPress={sacarFoto}
                  className="border-2 p-5"
                  style={{ borderColor: OSCURO_TEXTO, backgroundColor: `${OSCURO_TEXTO}33` }}
                >
                  <View className="h-4 w-4" style={{ backgroundColor: OSCURO_TEXTO }} />
                </Pressable97>
              </View>
            </View>
          ) : photoUri ? (
            <View className="mt-4 flex-row items-center gap-3">
              <Image
                source={{ uri: photoUri }}
                style={{ width: 72, height: 72, borderWidth: 1, borderColor: OSCURO_BORDE }}
              />
              <BotonTinta
                etiqueta="Sacar otra"
                accessibilityLabel="Sacar otra foto"
                variante="fantasma"
                registro="noche"
                tamano="compacto"
                onPress={abrirCamara}
              />
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Quitar la foto"
                onPress={() => setPhotoUri(null)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={16} color={OSCURO_META} />
              </Pressable97>
            </View>
          ) : (
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sumar una foto"
              onPress={abrirCamara}
              className="mt-4 flex-row items-center gap-2 self-start border border-oscuro-borde px-4 py-2.5"
            >
              <Ionicons name="camera-outline" size={16} color={OSCURO_META} />
              <Text className="font-archivo text-xs text-oscuro-secundario">
                Sumale una foto (opcional)
              </Text>
            </Pressable97>
          )}

          <View className="mt-10 items-center">
            <BotonTinta
              etiqueta="Que nazca →"
              accessibilityLabel="Que nazca"
              variante="primaria"
              registro="noche"
              onPress={queNazca}
              disabled={naciendo}
              cargando={naciendo}
            />
            {error && (
              <Text
                className="mt-4 text-center font-archivo text-sm"
                style={{ color: COLOR_ESTRELLA.basta }}
              >
                {error}
              </Text>
            )}
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Elegir otra señal"
              onPress={() => setSenal(null)}
              className="mt-4 px-4 py-2"
            >
              <Text className="font-archivo text-xs text-oscuro-tenue">← Otra señal</Text>
            </Pressable97>
          </View>
        </Animated.View>
      )}

      {st.luces.encender && !senal && (
        <PapelCard registro="noche" className="mt-6 p-4">
          <Text className="font-archivo text-xs leading-5 text-oscuro-secundario">
            La luz de hoy ya está encendida. Cada captura extra suma una
            estrella igual — el cielo no tiene techo.
          </Text>
        </PapelCard>
      )}
    </ModalCielo>
  );
}
