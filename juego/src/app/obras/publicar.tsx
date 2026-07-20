/**
 * Publicar una obra (Capability Layer, Protocolo Vivo): el proof-of-output
 * que alimenta La Corriente. Si viene de resolver una misión, el oficio se
 * hereda y queda fijo — la obra no puede desalinearse de la misión que la
 * produjo. Si es libre, se elige de la grilla de oficios. La evidencia
 * (una foto) es opcional y jamás retrata a nadie: registra el hecho, no a
 * las personas.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
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

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { OFICIOS, oficioPorId, type OficioId } from '@/content/oficios';
import { misionPorId, publicarObra } from '@/db/repos-protocolo';
import { fadeUp } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

export default function PublicarObra() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { misionId: misionIdParam } = useLocalSearchParams<{ misionId?: string }>();
  const misionId = Array.isArray(misionIdParam) ? misionIdParam[0] : misionIdParam;

  // Carga sincrónica: si la misión ya no está, cae a obra libre sin drama.
  const [mision] = useState(() => (misionId ? misionPorId(misionId)?.mision ?? null : null));
  const oficioHeredado = mision ? oficioPorId(mision.oficioId) : null;

  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
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
      haptic.celebrate();
      router.replace('/corriente' as never);
    } catch {
      setNota('No pudimos publicarla ahora mismo. Probá de nuevo en un toque.');
      setPublicando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Publicar la obra" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={fadeUp}>
            <SectionBadge>{mision ? 'Misión resuelta' : 'Obra libre'}</SectionBadge>

            {mision && (
              <GlassCard className="mt-4 p-5">
                <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                  Nace de la misión
                </Text>
                <Text className="mt-2 font-sans-medium text-sm text-plata">{mision.titulo}</Text>
                <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
                  {mision.proposito}
                </Text>
              </GlassCard>
            )}

            <Text className="mt-6 font-serif text-2xl leading-9 text-plata">
              Lo que se hizo, se muestra. La obra es la prueba.
            </Text>

            {/* título */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Título
            </Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej. Arreglamos la vereda de la esquina"
              placeholderTextColor="#64748b"
              maxLength={80}
              accessibilityLabel="Título de la obra"
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
            />

            {/* resumen */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Resumen
            </Text>
            <TextInput
              value={resumen}
              onChangeText={setResumen}
              placeholder="¿Qué se hizo? ¿Con quién?"
              placeholderTextColor="#64748b"
              maxLength={280}
              multiline
              accessibilityLabel="Resumen de la obra"
              className="mt-3 min-h-24 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-sm leading-6 text-plata"
            />

            {/* oficio */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Oficio
            </Text>
            {oficioHeredado ? (
              <View className="mt-3 flex-row items-center gap-2">
                <View
                  className="flex-row items-center gap-2 rounded-full border px-3.5 py-2.5"
                  style={{
                    borderColor: `${oficioHeredado.color}66`,
                    backgroundColor: `${oficioHeredado.color}1c`,
                  }}
                >
                  <Ionicons name={oficioHeredado.icono as never} size={14} color={oficioHeredado.color} />
                  <Text className="font-sans-medium text-xs" style={{ color: oficioHeredado.color }}>
                    {oficioHeredado.nombre}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="lock-closed-outline" size={12} color="#64748b" />
                  <Text className="font-sans text-[10px] text-slate-500">heredado de la misión</Text>
                </View>
              </View>
            ) : (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {OFICIOS.map((oficio) => {
                  const activo = oficioId === oficio.id;
                  return (
                    <Pressable97
                      key={oficio.id}
                      accessibilityRole="button"
                      accessibilityLabel={oficio.nombre}
                      accessibilityState={{ selected: activo }}
                      onPress={() => setOficioId(oficio.id)}
                      className="min-h-11 flex-row items-center gap-2 rounded-full border px-3.5 py-2.5"
                      style={{
                        borderColor: activo ? `${oficio.color}66` : 'rgba(255,255,255,0.1)',
                        backgroundColor: activo ? `${oficio.color}1c` : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Ionicons name={oficio.icono as never} size={14} color={activo ? oficio.color : '#64748b'} />
                      <Text
                        className="font-sans-medium text-xs"
                        style={{ color: activo ? oficio.color : '#94a3b8' }}
                      >
                        {oficio.nombre}
                      </Text>
                    </Pressable97>
                  );
                })}
              </View>
            )}

            {/* evidencia */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Evidencia (opcional)
            </Text>
            {camaraAbierta ? (
              <View className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <CameraView ref={camaraRef} style={{ height: 300 }} facing="back" />
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
            ) : evidenciaUri ? (
              <View className="mt-3">
                <Image
                  source={{ uri: evidenciaUri }}
                  style={{ width: '100%', height: 220, borderRadius: 16 }}
                />
                <View className="mt-3 flex-row items-center gap-3">
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
                    onPress={() => setEvidenciaUri(null)}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={16} color="#64748b" />
                  </Pressable97>
                </View>
              </View>
            ) : (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Abrir la cámara para sacar la evidencia"
                onPress={abrirCamara}
                className="mt-3 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] py-12"
              >
                <Ionicons name="camera-outline" size={34} color="#7D5BDE" />
                <Text className="mt-3 font-sans-medium text-sm text-slate-300">
                  Abrir la cámara
                </Text>
              </Pressable97>
            )}
            <Text className="mt-3 font-sans text-[11px] text-slate-500">
              La evidencia es de la obra, no de las personas.
            </Text>

            {/* territorio */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Territorio (opcional)
            </Text>
            <TextInput
              value={territorio}
              onChangeText={setTerritorio}
              placeholder="Barrio, ciudad — lo que quieras contar"
              placeholderTextColor="#64748b"
              maxLength={60}
              accessibilityLabel="Territorio de la obra"
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
            />

            {nota && (
              <View className="mt-6 flex-row items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <Ionicons name="alert-circle-outline" size={16} color="#FCD34D" />
                <Text className="flex-1 font-sans text-xs leading-5 text-amber-100">{nota}</Text>
              </View>
            )}

            <View className="mt-8 items-center">
              <AccentButton
                label={publicando ? 'Publicando…' : 'Publicar la obra'}
                onPress={publicar}
                disabled={!lista || publicando}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
