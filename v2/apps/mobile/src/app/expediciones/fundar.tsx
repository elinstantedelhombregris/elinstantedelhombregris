/**
 * Fundar una expedición (spec §3.2): plantilla → nombre y zona → meta.
 * Cuesta 15 brasas; si no alcanzan, el botón espera sin culpa. La
 * definición después viaja por QR para que otro la juegue en su barrio.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): formulario canónico
 * — inputs borde tinta sobre papel crudo, foco violeta, plantillas como
 * fichas cuadradas, el stepper de la meta en mono. Cero radius, cero glow.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { PLANTILLAS_EXPEDICION, SENAL_POR_KEY, type PlantillaExpedicion } from '@/content';
import { fundarExpedicion } from '@/db/repos';
import { COSTOS } from '@/game/brasas';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

const META_MIN = 10;
const META_MAX = 200;
const META_PASO = 5;

const clampMeta = (v: number): number =>
  Math.max(META_MIN, Math.min(META_MAX, Math.round(v)));

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

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
  const [enfocadoNombre, setEnfocadoNombre] = useState(false);
  const [enfocadoZona, setEnfocadoZona] = useState(false);

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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/expediciones'));

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
          <Kicker>tu consigna · tu zona · tu meta</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Fundá la tuya
          </TituloAnton>
        </View>
      </View>

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
            {/* 1 — la plantilla */}
            <Kicker tono="neutro" className="mt-2">
              La plantilla
            </Kicker>
            <View className="mt-3 gap-2.5">
              {PLANTILLAS_EXPEDICION.map((p, i) => {
                const senal = SENAL_POR_KEY[p.senal];
                const activa = plantilla?.id === p.id;
                return (
                  <Animated.View key={p.id} entering={staggerDelay(i)}>
                    <Pressable97
                      accessibilityRole="radio"
                      accessibilityState={{ selected: activa }}
                      accessibilityLabel={p.titulo}
                      onPress={() => elegirPlantilla(p)}
                      className="flex-row items-center gap-3 bg-papel-crudo p-3.5"
                      style={{
                        borderWidth: activa ? 2 : 1,
                        borderColor: activa ? senal.color : TINTA,
                      }}
                    >
                      <View className="flex-1">
                        <Text className="font-archivo-bold text-sm text-tinta">
                          {p.titulo}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="mt-0.5 font-archivo text-[11px] text-tinta-50"
                        >
                          {p.descripcion}
                        </Text>
                      </View>
                      <ChipTipo etiqueta={senal.label} activo={activa} color={senal.color} />
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>

            {/* 2 — nombre y zona */}
            <Kicker tono="neutro" className="mt-7">
              Nombre y zona
            </Kicker>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              onFocus={() => setEnfocadoNombre(true)}
              onBlur={() => setEnfocadoNombre(false)}
              placeholder="Nombre de tu expedición"
              placeholderTextColor={TINTA_50}
              maxLength={80}
              accessibilityLabel="Nombre de tu expedición"
              className="mt-3 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoNombre)}
            />
            <TextInput
              value={zona}
              onChangeText={setZona}
              onFocus={() => setEnfocadoZona(true)}
              onBlur={() => setEnfocadoZona(false)}
              placeholder="¿Por dónde? El barrio, esas seis cuadras, la feria…"
              placeholderTextColor={TINTA_50}
              maxLength={100}
              accessibilityLabel="Zona de tu expedición"
              className="mt-3 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoZona)}
            />

            {/* 3 — la meta */}
            <Kicker tono="neutro" className="mt-7">
              La meta
            </Kicker>
            <Text className="mt-1.5 font-archivo text-xs text-tinta-50">
              Cuántas capturas cierran la expedición ({META_MIN}–{META_MAX}).
            </Text>
            <View className="mt-4 flex-row items-center justify-center gap-5">
              <BotonTinta
                etiqueta="−"
                variante="fantasma"
                tamano="compacto"
                accessibilityLabel={`Restar ${META_PASO}`}
                onPress={() => setMeta((m) => clampMeta(m - META_PASO))}
              />
              <Text className="min-w-[110px] text-center font-space text-5xl text-tinta">
                {meta}
              </Text>
              <BotonTinta
                etiqueta="+"
                variante="fantasma"
                tamano="compacto"
                accessibilityLabel={`Sumar ${META_PASO}`}
                onPress={() => setMeta((m) => clampMeta(m + META_PASO))}
              />
            </View>

            {/* 4 — el costo y el acto */}
            <PapelCard className="mt-8 p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-baseline gap-2">
                  <Text className="font-space text-base text-tinta">{costo}</Text>
                  <Text className="font-archivo text-xs text-tinta-75">
                    brasas cuesta fundarla
                  </Text>
                </View>
                <Text className="font-archivo text-xs text-tinta-50">
                  tenés <Text className="font-space text-tinta">{st.brasas}</Text>
                </Text>
              </View>
              {faltan > 0 && (
                <Text className="mt-3 font-archivo text-xs leading-5 text-tinta-75">
                  Te faltan {faltan} brasas. Las luces de cada día las suman —
                  mañana ya podés estar más cerca.
                </Text>
              )}
            </PapelCard>

            <View className="mt-7 items-center">
              <BotonTinta
                etiqueta="Fundarla →"
                onPress={fundarla}
                disabled={!lista || faltan > 0 || fundando}
                cargando={fundando}
              />
              <Text className="mt-4 px-6 text-center font-archivo text-[11px] leading-4 text-tinta-50">
                Cuando esté fundada vas a poder pasarla por QR, para que otra
                persona la juegue en su barrio con su propio progreso.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
