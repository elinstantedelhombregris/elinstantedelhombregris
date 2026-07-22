/**
 * Publicar una obra (Capability Layer, Protocolo Vivo): el proof-of-output
 * que alimenta La Corriente. Si viene de resolver una misión, el oficio se
 * hereda y queda fijo — la obra no puede desalinearse de la misión que la
 * produjo. Si es libre, se elige de la grilla de oficios. La evidencia
 * (una foto) es opcional y jamás retrata a nadie: registra el hecho, no a
 * las personas.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): al publicar, un
 * sello PUBLICADA cae antes de volver a La Corriente (spec §5).
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, GranoPapel, Kicker, PapelCard, Sello, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { OFICIOS, oficioPorId, type OficioId } from '@/content/oficios';
import { entradasDeExpedicion, expedicionPorId } from '@/db/repos';
import { misionPorId, publicarObra } from '@/db/repos-protocolo';
import { fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { PAPEL, TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

/** El sello «PUBLICADA» queda a la vista antes de volver a La Corriente
 * (spec §5): ni instantáneo, ni una espera larga. */
const DEMORA_SELLO_MS = 900;

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

export default function PublicarObra() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { misionId: misionIdParam } = useLocalSearchParams<{ misionId?: string }>();
  const misionId = Array.isArray(misionIdParam) ? misionIdParam[0] : misionIdParam;

  // Carga sincrónica: si la misión ya no está, cae a obra libre sin drama.
  const [mision] = useState(() => (misionId ? misionPorId(misionId)?.mision ?? null : null));
  const oficioHeredado = mision ? oficioPorId(mision.oficioId) : null;

  const [titulo, setTitulo] = useState('');
  // Prefill del resumen desde la expedición vinculada — solo una vez, al
  // montar: se calcula en el inicializador perezoso, así que jamás vuelve
  // a pisar lo que la persona ya haya tipeado.
  const [resumen, setResumen] = useState(() => {
    const expedicion = mision?.expeditionId ? expedicionPorId(mision.expeditionId) : null;
    if (!expedicion) return '';
    const capturas = entradasDeExpedicion(expedicion.id).length;
    return `Expedición «${expedicion.titulo}»: ${capturas} de ${expedicion.meta} capturas en ${expedicion.zona}.`;
  });
  const [oficioId, setOficioId] = useState<OficioId | null>(
    oficioHeredado ? oficioHeredado.id : null,
  );
  const [territorio, setTerritorio] = useState('');
  const [evidenciaUri, setEvidenciaUri] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [permisoCamara, pedirPermisoCamara] = useCameraPermissions();
  const camaraRef = useRef<CameraView>(null);
  const [publicando, setPublicando] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [enfocadoTitulo, setEnfocadoTitulo] = useState(false);
  const [enfocadoResumen, setEnfocadoResumen] = useState(false);
  const [enfocadoTerritorio, setEnfocadoTerritorio] = useState(false);
  const [selloPublicada, setSelloPublicada] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const lista = titulo.trim().length > 0 && oficioId !== null;

  const abrirCamara = async () => {
    try {
      if (!permisoCamara?.granted) {
        const r = await pedirPermisoCamara();
        if (!r.granted) return;
      }
      setCamaraAbierta(true);
    } catch {
      // sin cámara no hay drama: la evidencia es opcional
    }
  };

  const sacarFoto = async () => {
    try {
      const foto = await camaraRef.current?.takePictureAsync();
      if (foto?.uri) {
        setEvidenciaUri(foto.uri);
        haptic.tick();
      }
    } catch {
      // silencioso: se puede publicar sin foto
    } finally {
      setCamaraAbierta(false);
    }
  };

  // El sello PUBLICADA de Sello.tsx dispara su propio haptic.celebrate() al
  // montar — no hace falta llamarlo acá también.
  const publicar = () => {
    if (!lista || !oficioId || publicando) return;
    setPublicando(true);
    setNota(null);
    try {
      publicarObra({
        misionId: mision?.id,
        titulo: titulo.trim(),
        resumen: resumen.trim() || undefined,
        oficioId,
        evidenciaUri: evidenciaUri ?? undefined,
        territorio: territorio.trim() || undefined,
      });
      setSelloPublicada(true);
      timeoutRef.current = setTimeout(() => {
        router.replace('/corriente' as never);
      }, DEMORA_SELLO_MS);
    } catch {
      setNota('No pudimos publicarla ahora mismo. Probá de nuevo en un toque.');
      setPublicando(false);
    }
  };

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>la obra es la prueba</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Publicar la obra
          </TituloAnton>
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={fadeUp}>
            <ChipTipo etiqueta={mision ? 'Misión resuelta' : 'Obra libre'} activo={Boolean(mision)} />

            {mision && (
              <PapelCard variante="suave" className="mt-4 p-5">
                <Kicker tono="neutro">Nace de la misión</Kicker>
                <Text className="mt-2 font-archivo-bold text-sm text-tinta">{mision.titulo}</Text>
                <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                  {mision.proposito}
                </Text>
              </PapelCard>
            )}

            <Text className="mt-6 font-archivo text-base leading-7 text-tinta-90">
              Lo que se hizo, se muestra.
            </Text>

            {/* título */}
            <Kicker tono="neutro" className="mt-6">
              Título
            </Kicker>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              onFocus={() => setEnfocadoTitulo(true)}
              onBlur={() => setEnfocadoTitulo(false)}
              placeholder="Ej. Arreglamos la vereda de la esquina"
              placeholderTextColor={TINTA_50}
              maxLength={80}
              accessibilityLabel="Título de la obra"
              className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoTitulo)}
            />

            {/* resumen */}
            <Kicker tono="neutro" className="mt-6">
              Resumen
            </Kicker>
            <TextInput
              value={resumen}
              onChangeText={setResumen}
              onFocus={() => setEnfocadoResumen(true)}
              onBlur={() => setEnfocadoResumen(false)}
              placeholder="¿Qué se hizo? ¿Con quién?"
              placeholderTextColor={TINTA_50}
              maxLength={280}
              multiline
              accessibilityLabel="Resumen de la obra"
              className="mt-2 min-h-24 bg-papel-crudo px-5 py-4 font-archivo text-sm leading-6 text-tinta"
              style={estiloInput(enfocadoResumen)}
            />

            {/* oficio */}
            <Kicker tono="neutro" className="mt-6">
              Oficio
            </Kicker>
            {oficioHeredado ? (
              <View className="mt-2 flex-row items-center gap-2">
                <ChipTipo etiqueta={oficioHeredado.nombre} activo />
                <Text className="font-space text-[10px] uppercase tracking-[1px] text-tinta-50">
                  heredado de la misión
                </Text>
              </View>
            ) : (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {OFICIOS.map((oficio) => (
                  <ChipTipo
                    key={oficio.id}
                    etiqueta={oficio.nombre}
                    activo={oficioId === oficio.id}
                    onPress={() => setOficioId(oficio.id)}
                  />
                ))}
              </View>
            )}

            {/* evidencia */}
            <Kicker tono="neutro" className="mt-6">
              Evidencia (opcional)
            </Kicker>
            {camaraAbierta ? (
              <View className="mt-2 overflow-hidden border border-tinta">
                <CameraView ref={camaraRef} style={{ height: 300 }} facing="back" />
                <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center gap-8">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar la foto"
                    onPress={() => setCamaraAbierta(false)}
                    className="h-11 w-11 items-center justify-center border border-papel bg-tinta/70"
                  >
                    <Ionicons name="close" size={20} color={PAPEL} />
                  </Pressable97>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Sacar la foto"
                    onPress={sacarFoto}
                    className="h-16 w-16 items-center justify-center border-2 border-papel"
                  >
                    <View className="h-8 w-8 bg-papel" />
                  </Pressable97>
                </View>
              </View>
            ) : evidenciaUri ? (
              <View className="mt-2">
                <Image source={{ uri: evidenciaUri }} style={{ width: '100%', height: 220 }} />
                <View className="mt-3 flex-row items-center gap-5">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Sacar otra foto"
                    onPress={abrirCamara}
                    className="min-h-11 justify-center py-2"
                  >
                    <Text className="font-space text-xs uppercase tracking-[1px] text-tinta">
                      Sacar otra
                    </Text>
                  </Pressable97>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Quitar la foto"
                    onPress={() => setEvidenciaUri(null)}
                    className="min-h-11 justify-center py-2"
                  >
                    <Text className="font-space text-xs uppercase tracking-[1px] text-tinta-50">
                      Quitar
                    </Text>
                  </Pressable97>
                </View>
              </View>
            ) : (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Abrir la cámara para sacar la evidencia"
                onPress={abrirCamara}
                className="mt-2 items-center justify-center border border-dashed border-tinta py-12"
              >
                <Text className="font-space-bold text-xs uppercase tracking-[1.5px] text-tinta">
                  Agregar foto
                </Text>
              </Pressable97>
            )}
            <Text className="mt-3 font-archivo text-[11px] text-tinta-50">
              La evidencia es de la obra, no de las personas.
            </Text>

            {/* territorio */}
            <Kicker tono="neutro" className="mt-6">
              Territorio (opcional)
            </Kicker>
            <TextInput
              value={territorio}
              onChangeText={setTerritorio}
              onFocus={() => setEnfocadoTerritorio(true)}
              onBlur={() => setEnfocadoTerritorio(false)}
              placeholder="Barrio, ciudad — lo que quieras contar"
              placeholderTextColor={TINTA_50}
              maxLength={60}
              accessibilityLabel="Territorio de la obra"
              className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoTerritorio)}
            />

            {nota && (
              <View className="mt-6 border border-ambar px-4 py-3">
                <Text className="font-archivo text-xs leading-5 text-tinta-90">{nota}</Text>
              </View>
            )}

            <View className="mt-8 items-center">
              <BotonTinta
                // `key`: ver la nota en corriente.tsx (ObraFila) — Pressable97
                // no reemplaza limpio la clase vieja al cambiar `disabled`/
                // `cargando` en el mismo nodo; remontar lo evita.
                key={publicando ? 'publicando' : 'listo'}
                etiqueta="Publicar la obra"
                onPress={publicar}
                disabled={!lista || publicando}
                cargando={publicando}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {selloPublicada && (
        <View
          pointerEvents="auto"
          className="absolute inset-0 items-center justify-center bg-papel/85"
          style={{ zIndex: 60 }}
        >
          <Sello texto="PUBLICADA" color="verde" rotacion={-5} />
        </View>
      )}
    </View>
  );
}
