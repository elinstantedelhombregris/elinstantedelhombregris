/**
 * El Cielo — la pantalla-hogar (spec §2). El canvas Skia de fondo, la
 * Estrella Guía con la racha, las Tres Luces del día sobre el dock, los
 * avisos de estrella fugaz y la celebración de Noche Completa.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FugazBanner } from '@/components/juego/FugazBanner';
import { LuzOrb } from '@/components/juego/LuzOrb';
import { NocheCompletaOverlay } from '@/components/juego/NocheCompletaOverlay';
import { RangoUpOverlay } from '@/components/juego/RangoUpOverlay';
import { GlassCard } from '@/components/ui/GlassCard';
import { Pressable97 } from '@/components/ui/Pressable97';
import { ESTADOS_VACIOS, ESTRELLA_FUGAZ, paletaPorId } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import { CLAVES, getSetting } from '@/db/repos';
import type { Rango } from '@/game/types';
import { softSpring } from '@/motion/variants';
import { multiplicadorDe, useJuego } from '@/stores/juego';
import { chequearAscensoRango } from '@/stores/rangos-check';
import { PLATA } from '@/theme/tokens';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const fechaLinda = (fecha: string): string => {
  const [y, m, d] = fecha.split('-').map(Number) as [number, number, number];
  const dow = new Date(y, m - 1, d).getDay();
  return `${DIAS[dow]} ${d} de ${MESES[m - 1]}`;
};

export default function Cielo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();

  // El zoom sutil del cielo cuando la noche se completa.
  const zoom = useSharedValue(1);
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  useEffect(() => {
    zoom.value = withSpring(st.nocheParaCelebrar ? 1.05 : 1, softSpring);
  }, [st.nocheParaCelebrar, zoom]);

  // Ascenso de rango: toda ganancia de brasas pasa por el Cielo al volver.
  const [ascenso, setAscenso] = useState<Rango | null>(null);

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      const nuevoRango = chequearAscensoRango();
      if (nuevoRango) setAscenso(nuevoRango);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // La estrella recién nacida florece y después se une al Atlas.
  useEffect(() => {
    if (!st.newStarId) return;
    const t = setTimeout(() => useJuego.getState().clearNewStar(), 1800);
    return () => clearTimeout(t);
  }, [st.newStarId]);

  // FTUE primero: sin registro, sin permisos — una pregunta y tu estrella.
  if (getSetting(CLAVES.ftueCompleto) !== '1') {
    return <Redirect href="/ftue" />;
  }

  const banner = st.eventoSinVer
    ? {
        titulo: ESTRELLA_FUGAZ.aviso,
        detalle:
          st.eventoHoy === 'pregunta-extra'
            ? ESTRELLA_FUGAZ.preguntaExtra
            : st.eventoHoy === 'brasas-x2'
              ? ESTRELLA_FUGAZ.brasasX2
              : ESTRELLA_FUGAZ.desafio24h,
      }
    : st.desafioRecienLogrado
      ? {
          titulo: 'Desafío cumplido',
          detalle: 'Tres estrellas en un solo día: ocho brasas más al fuego.',
        }
      : null;

  return (
    <View className="flex-1 bg-fondo">
      {/* EL CIELO (no captura toques) */}
      <Animated.View style={zoomStyle} className="absolute inset-0" pointerEvents="none">
        <SkyView
          estrellas={st.estrellas}
          rachaViva={st.rachaInfo.viva}
          nuevaEstrellaId={st.newStarId}
          paleta={paletaPorId(getSetting(CLAVES.paletaActiva)).gradiente}
        />
      </Animated.View>

      <View className="absolute inset-0" pointerEvents="box-none">
        {/* Encabezado: fecha + racha */}
        <View
          className="flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 10 }}
        >
          <Text className="font-sans text-xs text-slate-400">
            {st.fecha ? fechaLinda(st.fecha) : ' '}
          </Text>
          <View className="items-end">
            <Text
              className="font-mono text-sm"
              style={{ color: st.rachaInfo.viva ? PLATA : '#64748b' }}
            >
              ◈ {st.rachaInfo.racha} {st.rachaInfo.racha === 1 ? 'noche' : 'noches'}
            </Text>
            {!st.rachaInfo.viva && (
              <Text className="mt-0.5 font-sans text-[10px] text-slate-500">
                la Guía espera el rito
              </Text>
            )}
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-center gap-2 px-4">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Abrir La Escucha"
            onPress={() => router.push('/escuchar')}
            className="flex-row items-center gap-2 rounded-full border border-violet-300/30 bg-violet-300/15 px-4 py-2.5"
          >
            <Ionicons name="ear-outline" size={15} color="#DDD6FE" />
            <Text className="font-sans-semibold text-xs text-violet-100">La Escucha</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Abrir el territorio"
            onPress={() => router.push('/territorio')}
            className="flex-row items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5"
          >
            <Ionicons name="earth-outline" size={15} color="#CBD5E1" />
            <Text className="font-sans-medium text-xs text-slate-300">Territorio</Text>
          </Pressable97>
        </View>

        {/* Rito de re-encendido, sin culpa */}
        {!st.rachaInfo.viva && (
          <View className="mt-3 items-center">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Rito de re-encendido"
              onPress={() => router.push('/rito')}
              className="flex-row items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
            >
              <Ionicons name="flame-outline" size={14} color={PLATA} />
              <Text className="font-sans-medium text-xs text-plata">
                Rito de re-encendido
              </Text>
            </Pressable97>
          </View>
        )}

        {/* Estrella fugaz / desafío logrado */}
        {banner && (
          <View className="mt-3">
            <FugazBanner
              titulo={banner.titulo}
              detalle={banner.detalle}
              onOk={st.marcarEventoVisto}
            />
          </View>
        )}

        {/* Cielo vacío: una línea que invita */}
        {st.estrellas.length === 0 && (
          <View className="absolute left-10 right-10" style={{ top: '54%' }}>
            <Text className="text-center font-sans text-sm leading-6 text-slate-500">
              {ESTADOS_VACIOS.cielo}
            </Text>
          </View>
        )}

        {/* Las Tres Luces + dock */}
        <View
          className="absolute bottom-0 left-0 right-0 items-center"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="mb-5 flex-row items-end gap-9">
            <LuzOrb luz="ver" encendida={st.luces.ver} onPress={() => router.push('/ver')} />
            <View className="mb-4">
              <LuzOrb
                luz="encender"
                encendida={st.luces.encender}
                destacada
                onPress={() => router.push('/encender')}
              />
            </View>
            <LuzOrb luz="dar" encendida={st.luces.dar} onPress={() => router.push('/dar')} />
          </View>

          <GlassCard className="flex-row items-center gap-5 px-5 py-3">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="flame" size={15} color="#F59E0B" />
              <Text className="font-mono text-sm text-brasa">{st.brasas}</Text>
            </View>
            <View className="h-5 w-px bg-white/10" />
            {(
              [
                ['expediciones', 'map-outline', 'Expediciones'],
                ['album', 'star-outline', 'Álbum'],
                ['bitacora', 'book-outline', 'Bitácora'],
                ['qr', 'qr-code-outline', 'Chispas y círculos'],
                ['ajustes', 'settings-outline', 'Ajustes'],
              ] as const
            ).map(([ruta, icono, label]) => (
              <Pressable97
                key={ruta}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => router.push(`/${ruta}`)}
                className="p-1"
              >
                <Ionicons name={icono} size={20} color="#94a3b8" />
              </Pressable97>
            ))}
          </GlassCard>
        </View>
      </View>

      {/* Noche Completa: el cierre del día */}
      {st.nocheParaCelebrar && (
        <NocheCompletaOverlay
          fecha={st.fecha}
          multiplicador={multiplicadorDe(st.eventoHoy)}
          onCerrar={st.celebrarNoche}
        />
      )}

      {/* Ascenso de rango — después del cierre de la noche, si coinciden */}
      {ascenso && !st.nocheParaCelebrar && (
        <RangoUpOverlay rango={ascenso} onCerrar={() => setAscenso(null)} />
      )}
    </View>
  );
}
