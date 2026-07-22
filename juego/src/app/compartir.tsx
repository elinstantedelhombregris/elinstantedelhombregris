/**
 * COMPARTIR — la tarjeta del cielo (spec §3.5 / Papel y Tinta spec §8). No
 * es el cielo vivo: es una composición 9:16 con la constelación real en
 * miniatura, los números que importan y el rango. view-shot la vuelve
 * imagen y el share sheet hace el resto. Canal de crecimiento orgánico,
 * cero servidores.
 *
 * Registro nocturno del sistema Papel y Tinta (spec §7 y §8): el chrome de
 * la pantalla es noche, pero la tarjeta en sí es **papel-sobre-oscuro** —
 * la única sombra permitida en todo el sistema (spec §1.4/§8): una postal
 * de papel flotando sobre el fondo oscuro.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Svg, { Circle } from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, Palitos, PapelCard, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { COMPARTIR, SENAL_POR_KEY } from '@/content';
import { COLOR_ESTRELLA, MAX_ESTRELLAS_NITIDAS, posicionEstrella, radioDelCielo } from '@/cielo/posiciones';
import { rangoActual } from '@/game/rangos';
import type { TipoEstrella } from '@/game/types';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { OSCURO_META, TINTA, VIOLETA } from '@/theme/tokens';

/** El punto de la Guía y las estrellas comunes, en la paleta PAPEL (spec
 * §2): la postal es de papel, no de cielo — sus colores deben leerse
 * sobre `#F2EFE7`, no sobre oscuro. `amistad` no es una señal (es la
 * chispa regalada): se tiñe violeta, la marca. */
const colorEstrellaPapel = (tipo: TipoEstrella): string =>
  tipo === 'amistad' ? VIOLETA : SENAL_POR_KEY[tipo].color;

/** El único exceso de sombra que permite el sistema (spec §1.4/§8):
 * papel-sobre-oscuro, 0 24px 60px rgba(0,0,0,0.45). */
const sombraPostal =
  Platform.OS === 'web'
    ? { boxShadow: '0px 24px 60px rgba(0, 0, 0, 0.45)' }
    : {
        shadowColor: '#000000',
        shadowOpacity: 0.45,
        shadowRadius: 60,
        shadowOffset: { width: 0, height: 24 },
        elevation: 24,
      };

/** La constelación real, en miniatura: SVG puro, mismas posiciones del Cielo. */
function MiniConstelacion({ lado }: { lado: number }) {
  const estrellas = useJuego((s) => s.estrellas);

  const puntos = useMemo(() => {
    const total = estrellas.length;
    if (total === 0) return [];
    const radio = radioDelCielo(total);
    // La espiral entera entra en el cuadrado; con pocas estrellas no se
    // desparrama hasta el borde (tope de escala).
    const escala = Math.min((lado / 2 - 10) / radio, 3);
    return estrellas
      .map((e, i) => ({ estrella: e, indice: i }))
      .slice(-MAX_ESTRELLAS_NITIDAS)
      .map(({ estrella, indice }) => {
        const p = posicionEstrella(indice, estrella.id);
        return {
          id: estrella.id,
          x: lado / 2 + p.x * escala,
          y: lado / 2 + p.y * escala,
          r: estrella.fundadora ? 3.2 : estrella.fugaz ? 2.7 : 2.2,
          color: colorEstrellaPapel(estrella.tipo),
        };
      });
  }, [estrellas, lado]);

  return (
    <Svg width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`}>
      {/* La Estrella Guía en el centro, con su halo — en tinta: la postal es papel. */}
      <Circle cx={lado / 2} cy={lado / 2} r={9} fill={TINTA} opacity={0.14} />
      <Circle cx={lado / 2} cy={lado / 2} r={3.4} fill={TINTA} />
      {puntos.map((p) => (
        <Circle key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={0.95} />
      ))}
    </Svg>
  );
}

export default function Compartir() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const st = useJuego();
  const cardRef = useRef<View>(null);
  const [compartiendo, setCompartiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Por si se llega acá sin pasar por el Cielo (deep link): foto fresca.
  useEffect(() => {
    useJuego.getState().refresh();
  }, []);

  const cardW = Math.min(width - 64, 300);
  const cardH = Math.round((cardW * 16) / 9);
  const rango = rangoActual(st.totalGanado).nombre;

  const compartir = async () => {
    if (compartiendo) return;
    setError(null);
    setCompartiendo(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: COMPARTIR.cielo,
        });
        haptic.send();
      } else {
        setError('Este dispositivo no tiene con qué compartir.');
      }
    } catch {
      setError('No salió la captura. Probá de nuevo.');
    } finally {
      setCompartiendo(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <View className="flex-row items-center px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          className="-ml-2 p-2"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Ionicons name="chevron-back" size={22} color={OSCURO_META} />
        </Pressable97>
        <View className="ml-1">
          <TituloAnton registro="noche" tamano="md">
            Compartir tu cielo
          </TituloAnton>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* La tarjeta que se vuelve imagen (9:16) — papel-sobre-oscuro */}
        <View
          ref={cardRef}
          collapsable={false}
          className="overflow-hidden bg-papel"
          style={{
            width: cardW,
            height: cardH,
            paddingVertical: 26,
            paddingHorizontal: 22,
            justifyContent: 'space-between',
            ...sombraPostal,
          }}
        >
          <View className="items-center">
            <Text className="font-anton" style={{ fontSize: 26, lineHeight: 26 }}>
              <Text className="text-violeta">¡</Text>
              <Text className="text-tinta">BASTA</Text>
              <Text className="text-violeta">!</Text>
            </Text>
            <Text className="mt-2 font-space text-[11px] uppercase tracking-[2px] text-tinta-50">
              mi cielo
            </Text>
          </View>

          <View className="items-center">
            <MiniConstelacion lado={cardW - 44} />
          </View>

          <View>
            <View className="flex-row items-end justify-around px-1">
              <View className="items-center">
                <Text className="font-space text-3xl text-tinta">{st.estrellas.length}</Text>
                <Text className="mt-1 font-space text-[10px] uppercase tracking-[2px] text-tinta-50">
                  {st.estrellas.length === 1 ? 'estrella' : 'estrellas'}
                </Text>
              </View>
              <View className="items-center">
                <Text className="font-space text-3xl text-tinta">{rango}</Text>
                <Text className="mt-1 font-space text-[10px] uppercase tracking-[2px] text-tinta-50">
                  rango
                </Text>
              </View>
            </View>

            <View className="mt-4 items-center">
              <Palitos total={st.rachaInfo.racha} />
              <Text className="mt-1.5 font-space text-[10px] uppercase tracking-[2px] text-tinta-50">
                {st.rachaInfo.racha} {st.rachaInfo.racha === 1 ? 'noche' : 'noches'}
              </Text>
            </View>

            <Text className="mt-6 text-center font-archivo-italic text-[11px] leading-4 text-tinta-90">
              «{COMPARTIR.cielo}»
            </Text>
            <Text className="mt-3 text-center font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">
              el juego del país que viene
            </Text>
          </View>
        </View>

        {/* Compartir: nativo sí; web es preview, no hay share sheet confiable */}
        {Platform.OS === 'web' ? (
          <PapelCard registro="noche" className="mt-8 w-full p-5">
            <Text className="text-center font-archivo text-sm leading-6 text-oscuro-secundario">
              Desde el teléfono se comparte: esta preview solo muestra la
              tarjeta.
            </Text>
          </PapelCard>
        ) : (
          <View className="mt-8 items-center">
            <BotonTinta
              etiqueta="Compartir"
              variante="primaria"
              registro="noche"
              onPress={compartir}
              disabled={compartiendo}
              cargando={compartiendo}
            />
            <Text className="mt-3 font-space text-xs text-oscuro-meta">
              «{COMPARTIR.cielo}»
            </Text>
          </View>
        )}

        {error && (
          <Text
            className="mt-4 text-center font-archivo text-sm"
            style={{ color: COLOR_ESTRELLA.basta }}
          >
            {error}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
