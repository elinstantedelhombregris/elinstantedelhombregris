/**
 * El Cielo — la pantalla-hogar (spec §2). El canvas Skia de fondo, la
 * Estrella Guía con la racha, las Tres Luces del día sobre el dock, los
 * avisos de estrella fugaz y la celebración de Noche Completa.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7): chrome mono,
 * placas selladas, dock plano.
 */

import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, Palitos } from '@/components/papel';
import { FugazBanner } from '@/components/juego/FugazBanner';
import { LuzPlaca } from '@/components/juego/LuzPlaca';
import { NocheCompletaOverlay } from '@/components/juego/NocheCompletaOverlay';
import { RangoUpOverlay } from '@/components/juego/RangoUpOverlay';
import { Pressable97 } from '@/components/ui/Pressable97';
import { ESTADOS_VACIOS, ESTRELLA_FUGAZ, paletaPorId } from '@/content';
import { SkyView } from '@/cielo/SkyView';
import { CLAVES, getSetting } from '@/db/repos';
import type { Rango } from '@/game/types';
import { softSpring } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { chequearAscensoRango } from '@/stores/rangos-check';
import { OSCURO_META, OSCURO_TENUE, VERDE } from '@/theme/tokens';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Ámbar de las brasas en la noche (spec §7) — el mismo tono que la
 * variante nocturna de la señal `need` (posiciones.ts), sin acoplar el
 * significado: acá es sólo el color del fuego. */
const BRASA_NOCHE = '#D89B2E';

/** El dock: ruta, ícono funcional, texto de accesibilidad y label visible. */
const DOCK = [
  ['corriente', 'pulse-outline', 'La Corriente', 'CORRIENTE'],
  ['territorio', 'earth-outline', 'Territorio', 'TERRITORIO'],
  ['album', 'star-outline', 'Álbum', 'ÁLBUM'],
  ['bitacora', 'book-outline', 'Bitácora', 'BITÁCORA'],
  ['ajustes', 'settings-outline', 'Ajustes', 'AJUSTES'],
] as const;

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
      <Animated.View style={[zoomStyle, { pointerEvents: 'none' }]} className="absolute inset-0">
        <SkyView
          estrellas={st.estrellas}
          rachaViva={st.rachaInfo.viva}
          nuevaEstrellaId={st.newStarId}
          paleta={paletaPorId(getSetting(CLAVES.paletaActiva)).gradiente}
          dormido={st.estrellas.length === 0}
        />
      </Animated.View>

      <View className="absolute inset-0" style={{ pointerEvents: 'box-none' }}>
        {/* Encabezado: fecha + racha */}
        <View
          className="flex-row items-start justify-between px-5"
          style={{ paddingTop: insets.top + 10 }}
        >
          <Text className="font-space text-xs text-oscuro-meta">
            {st.fecha ? fechaLinda(st.fecha) : ' '}
          </Text>
          <View className="items-end">
            <View className="flex-row items-center gap-2">
              <Palitos
                total={st.rachaInfo.racha}
                color={st.rachaInfo.viva ? VERDE : OSCURO_TENUE}
                registro="noche"
              />
              <Text
                className={`font-space text-sm ${
                  st.rachaInfo.viva ? 'text-oscuro-texto' : 'text-oscuro-tenue'
                }`}
              >
                {st.rachaInfo.racha} {st.rachaInfo.racha === 1 ? 'noche' : 'noches'}
              </Text>
            </View>
            {!st.rachaInfo.viva && (
              <Text className="mt-1 font-space text-[10px] text-oscuro-tenue">
                la Guía espera el rito
              </Text>
            )}
          </View>
        </View>

        <View className="mt-4 items-center px-4">
          <BotonTinta
            etiqueta="La Escucha →"
            accessibilityLabel="La Escucha"
            variante="fantasma"
            registro="noche"
            tamano="compacto"
            onPress={() => router.push('/escuchar')}
          />
        </View>

        {/* Rito de re-encendido, sin culpa */}
        {!st.rachaInfo.viva && (
          <View className="mt-3 items-center">
            <BotonTinta
              etiqueta="Rito de re-encendido →"
              accessibilityLabel="Rito de re-encendido"
              variante="fantasma"
              registro="noche"
              tamano="compacto"
              onPress={() => router.push('/rito')}
            />
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
            <Text className="text-center font-archivo text-sm leading-6 text-oscuro-tenue">
              {ESTADOS_VACIOS.cielo}
            </Text>
          </View>
        )}

        {/* Las Tres Luces + dock */}
        <View className="absolute bottom-0 left-0 right-0">
          <View className="mb-5 flex-row items-end justify-center gap-9">
            <LuzPlaca luz="ver" encendida={st.luces.ver} onPress={() => router.push('/ver')} />
            <View className="mb-4">
              <LuzPlaca
                luz="encender"
                encendida={st.luces.encender}
                destacada
                onPress={() => router.push('/encender')}
              />
            </View>
            <LuzPlaca luz="dar" encendida={st.luces.dar} onPress={() => router.push('/dar')} />
          </View>

          <View
            className="border-t border-oscuro-borde bg-oscuro-barra px-3 pt-2"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            {/* Brasas en su propia fila: ancho variable (palitos hasta <100),
                nunca compite por espacio con el dock de navegación. */}
            <View className="flex-row items-center gap-1.5 pb-2">
              <Ionicons name="flame" size={16} color={BRASA_NOCHE} />
              <Text className="font-space text-sm" style={{ color: BRASA_NOCHE }}>
                {st.brasas}
              </Text>
              {st.brasas < 100 && (
                <Palitos total={st.brasas} color={BRASA_NOCHE} registro="noche" />
              )}
            </View>
            <View className="flex-row items-center justify-between">
              {DOCK.map(([ruta, icono, aria, label]) => (
                <Pressable97
                  key={ruta}
                  accessibilityRole="button"
                  accessibilityLabel={aria}
                  onPress={() => router.push(`/${ruta}` as never)}
                  className="items-center"
                >
                  <Ionicons name={icono} size={19} color={OSCURO_META} />
                  <Text className="mt-1 font-space text-[9px] uppercase text-oscuro-meta">
                    {label}
                  </Text>
                </Pressable97>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Noche Completa: el cierre del día */}
      {st.nocheParaCelebrar && (
        <NocheCompletaOverlay fecha={st.fecha} onCerrar={st.celebrarNoche} />
      )}

      {/* Ascenso de rango — después del cierre de la noche, si coinciden */}
      {ascenso && !st.nocheParaCelebrar && (
        <RangoUpOverlay rango={ascenso} onCerrar={() => setAscenso(null)} />
      )}
    </View>
  );
}
