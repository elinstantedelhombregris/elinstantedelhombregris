/**
 * Misiones del Protocolo Vivo (Mission Layer, §0x01) — el panel. Secciones
 * por estado: las vivas primero, el archivo (resueltas y abandonadas)
 * colapsado al final (nada es permanente; lo resuelto o abandonado queda
 * como memoria, no como pila creciente).
 *
 * Registro papel del sistema Papel y Tinta (spec §8): cada misión es un
 * expediente numerado por orden de fundación (el 001 es la más vieja).
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  ExpedienteNum,
  FilaIndice,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { misionesTodas } from '@/db/repos-protocolo';
import type { PvMisionRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import type { EstadoMision } from '@/protocolo/tipos';
import { AMBAR_PT, TINTA_30, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

const ESTADO_LABEL: Record<EstadoMision, string> = {
  propuesta: 'Convocando',
  equipo: 'Equipo listo',
  activa: 'En marcha',
  verificacion: 'En verificación',
  resuelta: 'Resuelta',
  abandonada: 'Abandonada',
};

/** Color del chip de estado (spec §8). "Equipo listo" no está en la tabla
 * del spec — se lee como una extensión de "convocando": el equipo ya
 * cerró pero la misión todavía no arrancó. */
const ESTADO_COLOR: Record<EstadoMision, string> = {
  propuesta: VIOLETA,
  equipo: VIOLETA,
  activa: VERDE,
  verificacion: AMBAR_PT,
  resuelta: TINTA_50,
  abandonada: TINTA_30,
};

const SECCIONES: readonly EstadoMision[] = ['propuesta', 'equipo', 'activa', 'verificacion'];

const pad = (n: number): string => String(n).padStart(3, '0');

export default function Misiones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [misiones, setMisiones] = useState<PvMisionRow[]>([]);
  const [verResueltas, setVerResueltas] = useState(false);

  useFocusEffect(useCallback(() => setMisiones(misionesTodas()), []));

  // Orden de fundación estable: el 001 es la misión más vieja, sin importar
  // en qué sección (o en el archivo) esté hoy.
  const numeroPorId = useMemo(() => {
    const asc = [...misiones].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return new Map(asc.map((m, i) => [m.id, i + 1]));
  }, [misiones]);

  const archivo = misiones.filter((m) => m.estado === 'resuelta' || m.estado === 'abandonada');

  const irAlDetalle = (id: string) =>
    router.push({ pathname: '/misiones/[id]', params: { id } } as never);

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
          <Kicker>protocolo vivo</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Misiones
          </TituloAnton>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        {misiones.length === 0 ? (
          <PapelCard className="mt-3 p-5">
            <Text className="font-archivo text-sm leading-6 text-tinta-75">
              Ninguna misión todavía. La primera la puede fundar cualquiera —
              por ejemplo, vos.
            </Text>
          </PapelCard>
        ) : (
          SECCIONES.map((estado) => {
            const items = misiones.filter((m) => m.estado === estado);
            if (items.length === 0) return null;
            return (
              <View key={estado} className="mt-8">
                <Kicker tono="neutro">{ESTADO_LABEL[estado]}</Kicker>
                <View className="mt-2">
                  {items.map((m, i) => (
                    <MisionFila
                      key={m.id}
                      mision={m}
                      numero={numeroPorId.get(m.id) ?? 0}
                      index={i}
                      onPress={() => irAlDetalle(m.id)}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}

        {archivo.length > 0 && (
          <View className="mt-8">
            <FilaIndice
              numero="—"
              glifo={verResueltas ? '−' : '+'}
              onPress={() => setVerResueltas((v) => !v)}
              accessibilityLabel={
                verResueltas ? 'Ocultar archivo de misiones' : `Ver ${archivo.length} misiones en el archivo`
              }
            >
              <Text className="font-space text-[11px] uppercase tracking-[2px] text-tinta-50">
                {`Archivo — resueltas y abandonadas · ${archivo.length}`}
              </Text>
            </FilaIndice>
            {verResueltas && (
              <View className="mt-2">
                {archivo.map((m, i) => (
                  <MisionFila
                    key={m.id}
                    mision={m}
                    numero={numeroPorId.get(m.id) ?? 0}
                    index={i}
                    onPress={() => irAlDetalle(m.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <Animated.View entering={fadeUp} className="mt-10 items-center">
          <BotonTinta etiqueta="Fundar una misión →" onPress={() => router.push('/misiones/fundar' as never)} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MisionFila({
  mision,
  numero,
  index,
  onPress,
}: {
  mision: PvMisionRow;
  numero: number;
  index: number;
  onPress: () => void;
}) {
  const estado = mision.estado as EstadoMision;
  return (
    <Animated.View entering={staggerDelay(index)}>
      <FilaIndice numero={pad(numero)} onPress={onPress} accessibilityLabel={mision.titulo}>
        <View className="flex-row items-center gap-2">
          <ExpedienteNum numero={numero} />
          <View className="flex-1" />
          <ChipTipo etiqueta={ESTADO_LABEL[estado] ?? mision.estado} activo color={ESTADO_COLOR[estado]} />
        </View>
        <Text numberOfLines={1} className="mt-2 font-archivo-bold text-base text-tinta">
          {mision.titulo}
        </Text>
        <Text numberOfLines={2} className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
          {mision.proposito}
        </Text>
      </FilaIndice>
    </Animated.View>
  );
}
