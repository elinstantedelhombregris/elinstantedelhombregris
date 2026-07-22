/**
 * Expediciones — el panel (spec §3.2). Dos secciones: "En curso" (las
 * tuyas, con su progreso) y "Para empezar" (las plantillas precargadas,
 * gratis). Fundar la propia cuesta 15 brasas y vive en su propia pantalla.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el cuaderno de
 * campo — cada expedición en curso es una entrada numerada; cada
 * plantilla, una ficha para empezar. La barra de luminosidad muere:
 * el progreso ahora son palitos (spec §4).
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  FilaIndice,
  GranoPapel,
  Kicker,
  Palitos,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  ESTADOS_VACIOS,
  PLANTILLAS_EXPEDICION,
  SENAL_POR_KEY,
  type PlantillaExpedicion,
} from '@/content';
import { entradasDeExpedicion, expedicionesTodas, fundarExpedicion } from '@/db/repos';
import type { ExpeditionRow } from '@/db/schema';
import { COSTOS } from '@/game/brasas';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

const ORIGEN_LABEL: Record<ExpeditionRow['origen'], string> = {
  propia: 'fundada por vos',
  precargada: 'del movimiento',
  qr: 'recibida por QR',
};

const pad = (n: number): string => String(n).padStart(3, '0');

export default function Expediciones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();

  const [exps, setExps] = useState<ExpeditionRow[]>([]);
  const [conteos, setConteos] = useState<Map<string, number>>(new Map());
  const [fundando, setFundando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      setFundando(false); // al volver al panel, se puede fundar de nuevo
      const todas = expedicionesTodas();
      setExps(todas);
      setConteos(new Map(todas.map((e) => [e.id, entradasDeExpedicion(e.id).length])));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Las activas primero, y dentro de cada grupo las más nuevas arriba.
  const ordenadas = [...exps].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'activa' ? -1 : 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const activaDePlantilla = (plantillaId: string): ExpeditionRow | undefined =>
    exps.find((e) => e.plantillaId === plantillaId && e.estado === 'activa');

  const jugarPrecargada = (p: PlantillaExpedicion) => {
    // doble toque no funda dos veces la misma plantilla
    if (fundando) return;
    const yaActiva = activaDePlantilla(p.id);
    if (yaActiva) {
      router.push(`/expediciones/${yaActiva.id}`);
      return;
    }
    setFundando(true);
    try {
      const row = fundarExpedicion({
        plantillaId: p.id,
        titulo: p.titulo,
        zona: 'Mi barrio',
        meta: p.metaSugerida,
        origen: 'precargada',
      });
      haptic.send();
      st.refresh();
      router.push(`/expediciones/${row.id}`);
    } catch {
      // precargada es gratis: si algo falla acá, no hay nada que cobrar
      setFundando(false);
    }
  };

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>el mapa se hace caminando</Kicker>
          <TituloAnton tamano="lg" className="mt-1">
            Expediciones
          </TituloAnton>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* ------------------------------------------------ En curso */}
        <Kicker tono="neutro">En curso</Kicker>

        {ordenadas.length === 0 ? (
          <PapelCard className="mt-3 items-center p-6">
            <Text className="text-center font-archivo text-sm leading-6 text-tinta-75">
              {ESTADOS_VACIOS.expediciones}
            </Text>
          </PapelCard>
        ) : (
          <View className="mt-2">
            {ordenadas.map((e, i) => {
              const plantilla = PLANTILLAS_EXPEDICION.find((p) => p.id === e.plantillaId);
              const color = plantilla ? SENAL_POR_KEY[plantilla.senal].color : undefined;
              const entradas = conteos.get(e.id) ?? 0;
              return (
                <Animated.View key={e.id} entering={staggerDelay(i)}>
                  <FilaIndice
                    numero={pad(i + 1)}
                    accessibilityLabel={`${e.titulo}, ${entradas} de ${e.meta} capturas`}
                    onPress={() => router.push(`/expediciones/${e.id}`)}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text numberOfLines={1} className="flex-1 font-archivo-bold text-sm text-tinta">
                        {e.titulo}
                      </Text>
                      {e.estado === 'completa' ? (
                        <ChipTipo etiqueta="Completa" activo color={color} />
                      ) : (
                        <Text className="font-space text-xs text-tinta-50">
                          {entradas} de {e.meta}
                        </Text>
                      )}
                    </View>
                    <Text className="mt-1 font-space text-[11px] text-tinta-30">
                      {e.zona} · {ORIGEN_LABEL[e.origen]}
                    </Text>
                    {/* Palitos solo para metas chicas (spec §4: tally <100);
                        más allá, el «N de M» mono de arriba alcanza. */}
                    {e.meta <= 40 && (
                      <View className="mt-3">
                        <Palitos total={entradas} de={e.meta} color={color} />
                      </View>
                    )}
                  </FilaIndice>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* -------------------------------------------- Para empezar */}
        <Kicker tono="neutro" className="mt-8">
          Para empezar
        </Kicker>
        <Text className="mt-1.5 font-archivo text-xs leading-5 text-tinta-75">
          Las del movimiento salen gratis: elegí una y jugala en tu barrio.
        </Text>

        <View className="mt-3 gap-3">
          {PLANTILLAS_EXPEDICION.map((p, i) => {
            const senal = SENAL_POR_KEY[p.senal];
            const enMarcha = activaDePlantilla(p.id) !== undefined;
            return (
              <Animated.View key={p.id} entering={staggerDelay(i)}>
                <PapelCard className="p-4">
                  <View className="flex-row items-center justify-between gap-2">
                    <ChipTipo etiqueta={senal.label} activo color={senal.color} />
                    <Text className="font-space text-[10px] text-tinta-30">
                      meta {p.metaSugerida} · ~{p.duracionDiasSugerida} días
                    </Text>
                  </View>
                  <Text className="mt-3 font-archivo-bold text-base text-tinta">{p.titulo}</Text>
                  <Text className="mt-1.5 font-archivo text-xs leading-5 text-tinta-75">
                    {p.descripcion}
                  </Text>
                  <View className="mt-4 items-start">
                    <BotonTinta
                      etiqueta={enMarcha ? 'Ya está en marcha — seguila →' : 'Jugarla gratis →'}
                      variante={enMarcha ? 'fantasma' : 'tinta'}
                      tamano="compacto"
                      accessibilityLabel={enMarcha ? `Seguir ${p.titulo}` : `Jugar ${p.titulo}`}
                      onPress={() => jugarPrecargada(p)}
                    />
                  </View>
                </PapelCard>
              </Animated.View>
            );
          })}
        </View>

        {/* -------------------------------------------- Fundá la tuya */}
        <Animated.View entering={fadeUp} className="mt-9 items-center">
          <BotonTinta
            etiqueta={`Fundar la tuya (${COSTOS.fundarExpedicion} brasas) →`}
            onPress={() => router.push('/expediciones/fundar')}
          />
          <Text className="mt-3 text-center font-archivo text-[11px] leading-4 text-tinta-50">
            Elegís plantilla, zona y meta. Después viaja por QR a quien
            quieras.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
