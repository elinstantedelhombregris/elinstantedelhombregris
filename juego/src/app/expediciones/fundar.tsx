/**
 * Fundar una expedición (spec §3.2): plantilla → nombre y zona → meta.
 * Cuesta 15 brasas; si no alcanzan, el botón espera sin culpa. La
 * definición después viaja por QR para que otro la juegue en su barrio.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { PLANTILLAS_EXPEDICION, SENAL_POR_KEY, type PlantillaExpedicion } from '@/content';
import { fundarExpedicion } from '@/db/repos';
import { COSTOS } from '@/game/brasas';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

const META_MIN = 10;
const META_MAX = 200;
const META_PASO = 5;

const clampMeta = (v: number): number =>
  Math.max(META_MIN, Math.min(META_MAX, Math.round(v)));

export default function Fundar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const [plantilla, setPlantilla] = useState<PlantillaExpedicion | null>(null);
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState('');
  const [meta, setMeta] = useState(META_MIN);
  const [fundando, setFundando] = useState(false);

  const elegirPlantilla = (p: PlantillaExpedicion) => {
    setPlantilla(p);
    setMeta(clampMeta(p.metaSugerida));
    if (!nombre.trim() || PLANTILLAS_EXPEDICION.some((x) => x.titulo === nombre)) {
      setNombre(p.titulo);
    }
  };

  const costo = COSTOS.fundarExpedicion;
  const faltan = Math.max(0, costo - st.brasas);
  const lista =
    plantilla !== null && nombre.trim().length > 0 && zona.trim().length > 0;

  const fundarla = () => {
    if (!plantilla || !lista || fundando || faltan > 0) return;
    setFundando(true);
    try {
      const row = fundarExpedicion({
        plantillaId: plantilla.id,
        titulo: nombre.trim(),
        zona: zona.trim(),
        meta,
        origen: 'propia',
      });
      haptic.celebrate();
      st.refresh();
      router.replace(`/expediciones/${row.id}`);
    } catch {
      // el único error posible es quedarse sin brasas entre render y toque
      st.refresh();
    } finally {
      setFundando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Fundá la tuya" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 32,
          }}
        >
          <Animated.View entering={fadeUp}>
            <Text className="mt-1 font-serif text-2xl leading-9 text-plata">
              Una expedición tuya, con tu nombre y tu zona.
            </Text>

            {/* 1 — la plantilla */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              La plantilla
            </Text>
            <View className="mt-3 gap-2.5">
              {PLANTILLAS_EXPEDICION.map((p, i) => {
                const senal = SENAL_POR_KEY[p.senal];
                const activa = plantilla?.id === p.id;
                return (
                  <Animated.View key={p.id} entering={staggerDelay(i)}>
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel={p.titulo}
                      onPress={() => elegirPlantilla(p)}
                      className="flex-row items-center gap-3 rounded-2xl border bg-white/5 p-3.5"
                      style={{
                        borderColor: activa ? `${senal.color}88` : 'rgba(255,255,255,0.1)',
                        backgroundColor: activa
                          ? `${senal.color}14`
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Ionicons
                        name={senal.icon as never}
                        size={18}
                        color={activa ? senal.color : '#64748b'}
                      />
                      <View className="flex-1">
                        <Text
                          className="font-sans-medium text-sm"
                          style={{ color: activa ? senal.color : '#e2e8f0' }}
                        >
                          {p.titulo}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="mt-0.5 font-sans text-[11px] text-slate-500"
                        >
                          {p.descripcion}
                        </Text>
                      </View>
                      <Ionicons
                        name={activa ? 'radio-button-on' : 'radio-button-off'}
                        size={17}
                        color={activa ? senal.color : '#475569'}
                      />
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>

            {/* 2 — nombre y zona */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Nombre y zona
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de tu expedición"
              placeholderTextColor="#64748b"
              maxLength={80}
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
            />
            <TextInput
              value={zona}
              onChangeText={setZona}
              placeholder="¿Por dónde? El barrio, esas seis cuadras, la feria…"
              placeholderTextColor="#64748b"
              maxLength={100}
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
            />

            {/* 3 — la meta */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              La meta
            </Text>
            <Text className="mt-1.5 font-sans text-xs text-slate-500">
              Cuántas capturas cierran la expedición ({META_MIN}–{META_MAX}).
            </Text>
            <View className="mt-4 flex-row items-center justify-center gap-5">
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={`Restar ${META_PASO}`}
                onPress={() => setMeta((m) => clampMeta(m - META_PASO))}
                className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <Ionicons name="remove" size={22} color="#94a3b8" />
              </Pressable97>
              <Text className="min-w-[110px] text-center font-mono text-5xl text-plata">
                {meta}
              </Text>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={`Sumar ${META_PASO}`}
                onPress={() => setMeta((m) => clampMeta(m + META_PASO))}
                className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <Ionicons name="add" size={22} color="#94a3b8" />
              </Pressable97>
            </View>

            {/* 4 — el costo y el acto */}
            <GlassCard className="mt-8 p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="flame" size={16} color="#F59E0B" />
                  <Text className="font-mono text-base text-brasa">{costo}</Text>
                  <Text className="font-sans text-xs text-slate-400">
                    cuesta fundarla
                  </Text>
                </View>
                <Text className="font-sans text-xs text-slate-500">
                  tenés <Text className="font-mono text-brasa">{st.brasas}</Text>
                </Text>
              </View>
              {faltan > 0 && (
                <Text className="mt-3 font-sans text-xs leading-5 text-slate-400">
                  Te faltan {faltan} brasas. Las luces de cada día las suman —
                  mañana ya podés estar más cerca.
                </Text>
              )}
            </GlassCard>

            <View className="mt-7 items-center">
              <AccentButton
                label={fundando ? 'Fundando…' : 'Fundarla'}
                onPress={fundarla}
                disabled={!lista || faltan > 0 || fundando}
              />
              <View className="mt-4 flex-row items-center gap-2 px-6">
                <Ionicons name="qr-code-outline" size={13} color="#64748b" />
                <Text className="flex-1 font-sans text-[11px] leading-4 text-slate-500">
                  Cuando esté fundada vas a poder pasarla por QR, para que otra
                  persona la juegue en su barrio con su propio progreso.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
