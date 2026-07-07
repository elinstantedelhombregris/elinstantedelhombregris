import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import {
  enviarEntrada,
  fetchCampana,
  type CampaignEntryData,
  type CampaignFormField,
} from '@/api/campanas';
import { cloudinaryConfigured, uploadToCloudinary } from '@/api/upload';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { getCoords, type Coords } from '@/lib/location';
import { bloom, fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { PLATA } from '@/theme/tokens';

type Fase = 'cargar' | 'listo';

/**
 * EL FORMULARIO DINÁMICO — interpreta el formSchema de la campaña
 * (text / number / select / photo / rating) y convierte cada carga en
 * una luz más del mapa. Mismo rito que señalar: GPS silencioso,
 * bloom y haptic al terminar.
 */
// M4: cola offline para entradas (hoy la señal tiene cola; la entrada todavía no)
export default function Capturar() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ campaignId: string }>();
  const campaignId = Number(params.campaignId);
  const queryClient = useQueryClient();

  const [fase, setFase] = useState<Fase>('cargar');
  const [values, setValues] = useState<Record<string, string | number | null>>({});
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});
  const [anonima, setAnonima] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // GPS mientras la persona completa — cero espera percibida (patrón senal.tsx)
  const coordsRef = useRef<Promise<Coords | null>>(getCoords());

  const campana = useQuery({
    queryKey: ['campana', campaignId],
    queryFn: () => fetchCampana(campaignId),
    enabled: Number.isFinite(campaignId) && campaignId > 0,
  });

  const setValue = (key: string, value: string | number | null) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const enviar = async () => {
    const schema = campana.data?.formSchema;
    if (!schema) return;
    setError(null);

    // Chequeo de requeridos antes de gastar red
    for (const field of schema.fields) {
      if (!field.required) continue;
      if (field.type === 'photo') {
        if (cloudinaryConfigured && !photoUris[field.key]) {
          setError(`Te faltó la foto de "${field.label}"`);
          return;
        }
        continue;
      }
      const v = values[field.key];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        setError(`Te faltó responder "${field.label}"`);
        return;
      }
    }

    setEnviando(true);
    haptic.send();

    const coords = await Promise.race([
      coordsRef.current,
      new Promise<null>((r) => setTimeout(() => r(null), 6000)),
    ]);
    if (!coords) {
      setEnviando(false);
      setError('Necesitamos tu ubicación para poner esta luz en el mapa. Activá el GPS y probá de nuevo.');
      return;
    }

    // Subir fotos (si hay credenciales); la primera es la foto principal
    let photoUrl: string | undefined;
    const data: CampaignEntryData = {};
    for (const field of schema.fields) {
      if (field.type === 'photo') {
        const uri = photoUris[field.key];
        const uploaded = uri ? await uploadToCloudinary(uri) : null;
        data[field.key] = uploaded;
        if (uploaded && !photoUrl) photoUrl = uploaded;
        continue;
      }
      const raw = values[field.key];
      if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
        data[field.key] = null;
      } else if (field.type === 'number') {
        data[field.key] = Number(raw);
      } else {
        data[field.key] = typeof raw === 'string' ? raw.trim() : raw;
      }
    }

    try {
      await enviarEntrada(campaignId, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        data,
        ...(anonima ? { anonymous: true } : {}),
        ...(photoUrl ? { photoUrl } : {}),
      });
      haptic.celebrate();
      queryClient.invalidateQueries({ queryKey: ['campana-progreso', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campanas'] });
      setFase('listo');
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.status === 401) {
          router.push('/identidad');
        } else {
          setError(e.message);
        }
      } else {
        setError('Sin conexión. Guardá lo que ves y probá de nuevo cuando vuelva la red.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (campana.isLoading) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Cargar" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#94a3b8" />
        </View>
      </View>
    );
  }

  const formSchema = campana.data?.formSchema;
  if (campana.isError || !campana.data || !formSchema) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Cargar" />
        <Text className="mt-16 px-6 text-center font-sans text-sm text-slate-400">
          {campana.error instanceof ApiRequestError
            ? campana.error.message
            : 'El formulario de esta campaña no está disponible. Probá de nuevo.'}
        </Text>
      </View>
    );
  }

  const c = campana.data;
  const color = c.mapColor ?? PLATA;

  if (fase === 'listo') {
    return (
      <View className="flex-1 bg-fondo" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={bloom}
            className="items-center justify-center rounded-full"
            style={{
              width: 96,
              height: 96,
              backgroundColor: `${color}22`,
              borderWidth: 1,
              borderColor: `${color}66`,
            }}
          >
            <View
              className="rounded-full"
              style={{ width: 14, height: 14, backgroundColor: color }}
            />
          </Animated.View>
          <Animated.View entering={staggerDelay(2)} className="items-center px-6">
            <Text className="mt-8 text-center font-serif text-2xl text-white">
              Una luz más en el mapa.
            </Text>
            <Text className="mt-3 text-center font-sans text-sm leading-5 text-slate-400">
              Lo que hay que hacer, hecho visible. Gracias por salir a mirar.
            </Text>
          </Animated.View>
        </View>
        <View className="px-6">
          <AccentButton label="Listo" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title={c.title} />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={fadeUp} className="gap-4">
          {formSchema.fields.map((field, i) => (
            <Animated.View key={field.key} entering={staggerDelay(Math.min(i, 6))}>
              <CampoDinamico
                field={field}
                value={values[field.key] ?? null}
                photoUri={photoUris[field.key] ?? null}
                onChange={(v) => setValue(field.key, v)}
                onPhoto={(uri) => setPhotoUris((prev) => ({ ...prev, [field.key]: uri }))}
              />
            </Animated.View>
          ))}

          {/* Anonimato — el mapa público siempre es anónimo; esto es hacia el círculo */}
          <Pressable97
            accessibilityRole="checkbox"
            accessibilityLabel="Cargar como anónimo"
            className="flex-row items-center px-1 py-2"
            onPress={() => setAnonima((v) => !v)}
          >
            <Ionicons
              name={anonima ? 'checkbox-outline' : 'square-outline'}
              size={20}
              color={anonima ? PLATA : '#64748b'}
            />
            <Text className="ml-2 font-sans text-sm text-slate-400">
              Que el círculo no vea mi nombre en esta entrada
            </Text>
          </Pressable97>

          {error && <Text className="font-sans text-sm text-senal-basta">{error}</Text>}

          <AccentButton
            label={enviando ? 'Enviando…' : 'Sumar al mapa'}
            disabled={enviando}
            onPress={enviar}
          />
          <Text className="mb-2 text-center font-sans text-xs text-slate-500">
            En el mapa público esta entrada es anónima. Siempre.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Campos del formulario dinámico ──

function CampoDinamico({
  field,
  value,
  photoUri,
  onChange,
  onPhoto,
}: {
  field: CampaignFormField;
  value: string | number | null;
  photoUri: string | null;
  onChange: (v: string | number | null) => void;
  onPhoto: (uri: string) => void;
}) {
  return (
    <View>
      <Text className="mb-2 font-sans-medium text-sm text-slate-200">
        {field.label}
        {!field.required && <Text className="text-slate-500">  (opcional)</Text>}
      </Text>
      {field.hint && (
        <Text className="-mt-1 mb-2 font-sans text-xs text-slate-500">{field.hint}</Text>
      )}
      {field.type === 'text' && (
        <GlassCard className="p-4">
          <TextInput
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            placeholder="Escribí acá…"
            placeholderTextColor="#64748b"
            multiline
            className="min-h-12 font-sans text-base text-white"
            maxLength={1000}
          />
        </GlassCard>
      )}
      {field.type === 'number' && (
        <GlassCard className="p-4">
          <TextInput
            value={value === null ? '' : String(value)}
            onChangeText={(t) => onChange(t.replace(/[^0-9.,-]/g, '').replace(',', '.'))}
            placeholder="0"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            className="font-mono text-base text-white"
            maxLength={12}
          />
        </GlassCard>
      )}
      {field.type === 'select' && (
        <View className="flex-row flex-wrap gap-2">
          {(field.options ?? []).map((option) => {
            const active = value === option;
            return (
              <Pressable97
                key={option}
                accessibilityRole="button"
                accessibilityLabel={option}
                onPress={() => onChange(active ? null : option)}
                className={`rounded-full border px-4 py-2 ${
                  active ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10'
                }`}
              >
                <Text
                  className={`font-sans-medium text-xs ${active ? 'text-white' : 'text-slate-400'}`}
                >
                  {option}
                </Text>
              </Pressable97>
            );
          })}
        </View>
      )}
      {field.type === 'rating' && (
        <EscalaRating value={value} max={field.max ?? 5} onChange={onChange} />
      )}
      {field.type === 'photo' && (
        <CampoFoto photoUri={photoUri} onPhoto={onPhoto} />
      )}
    </View>
  );
}

function EscalaRating({
  value,
  max,
  onChange,
}: {
  value: string | number | null;
  max: number;
  onChange: (v: number) => void;
}) {
  const selected = typeof value === 'number' ? value : 0;
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const lit = n <= selected;
        return (
          <Pressable97
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Puntaje ${n} de ${max}`}
            onPress={() => onChange(n)}
            className={`items-center justify-center rounded-full border ${
              lit ? 'border-white/40 bg-white/15' : 'border-white/10 bg-white/5'
            }`}
            style={{ width: 40, height: 40 }}
          >
            <View
              className="rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: lit ? PLATA : 'rgba(245,247,250,0.2)',
              }}
            />
          </Pressable97>
        );
      })}
    </View>
  );
}

function CampoFoto({
  photoUri,
  onPhoto,
}: {
  photoUri: string | null;
  onPhoto: (uri: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [sacando, setSacando] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!cloudinaryConfigured) {
    return (
      <GlassCard className="flex-row items-center p-4">
        <Ionicons name="camera-outline" size={18} color="#64748b" />
        <Text className="ml-2 font-sans text-sm text-slate-500">Fotos disponibles pronto.</Text>
      </GlassCard>
    );
  }

  const abrirCamara = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setCamaraAbierta(true);
  };

  const sacarFoto = async () => {
    if (sacando) return;
    setSacando(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) {
        haptic.tick();
        onPhoto(photo.uri);
        setCamaraAbierta(false);
      }
    } finally {
      setSacando(false);
    }
  };

  return (
    <>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={photoUri ? 'Cambiar foto' : 'Sacar foto'}
        onPress={abrirCamara}
      >
        {photoUri ? (
          <View className="overflow-hidden rounded-2xl border border-white/10">
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: 160 }} contentFit="cover" />
            <View className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1">
              <Text className="font-sans text-xs text-white">Cambiar</Text>
            </View>
          </View>
        ) : (
          <GlassCard className="items-center p-6">
            <Ionicons name="camera-outline" size={28} color="#94a3b8" />
            <Text className="mt-2 font-sans-medium text-sm text-slate-300">Sacar foto</Text>
          </GlassCard>
        )}
      </Pressable97>

      <Modal visible={camaraAbierta} animationType="fade" onRequestClose={() => setCamaraAbierta(false)}>
        <View className="flex-1 bg-fondo">
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
          <View className="absolute inset-x-0 bottom-10 flex-row items-center justify-center">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Cerrar cámara"
              className="absolute left-8 p-3"
              onPress={() => setCamaraAbierta(false)}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </Pressable97>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Sacar foto"
              silent
              onPress={sacarFoto}
              className="items-center justify-center rounded-full border-4 border-white/80"
              style={{ width: 72, height: 72 }}
            >
              <View className="rounded-full bg-white" style={{ width: 54, height: 54 }} />
            </Pressable97>
          </View>
        </View>
      </Modal>
    </>
  );
}
