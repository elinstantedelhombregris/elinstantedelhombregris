/**
 * COMPARTIR — la tarjeta del cielo (spec §3.5). No es el cielo vivo: es una
 * composición 9:16 con la constelación real en miniatura, los números que
 * importan y el rango. view-shot la vuelve imagen y el share sheet hace el
 * resto. Canal de crecimiento orgánico, cero servidores.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Svg, { Circle } from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { DisplayText } from '@/components/ui/DisplayText';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { COMPARTIR } from '@/content';
import {
  COLOR_ESTRELLA,
  MAX_ESTRELLAS_NITIDAS,
  posicionEstrella,
  radioDelCielo,
} from '@/cielo/posiciones';
import { rangoActual } from '@/game/rangos';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { PLATA } from '@/theme/tokens';

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
          color: COLOR_ESTRELLA[estrella.tipo],
        };
      });
  }, [estrellas, lado]);

  return (
    <Svg width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`}>
      {/* La Estrella Guía en el centro, con su halo */}
      <Circle cx={lado / 2} cy={lado / 2} r={9} fill={PLATA} opacity={0.18} />
      <Circle cx={lado / 2} cy={lado / 2} r={3.4} fill={PLATA} />
      {puntos.map((p) => (
        <Circle key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={0.95} />
      ))}
    </Svg>
  );
}

export default function Compartir() {
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
      <PanelHeader title="Compartir tu cielo" />
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* La tarjeta que se vuelve imagen (9:16) */}
        <View
          ref={cardRef}
          collapsable={false}
          className="overflow-hidden rounded-3xl border border-white/10"
          style={{
            width: cardW,
            height: cardH,
            backgroundColor: '#0a0a0a',
            paddingVertical: 26,
            paddingHorizontal: 22,
            justifyContent: 'space-between',
          }}
        >
          <View className="items-center">
            <Text className="font-mono text-[11px] tracking-[4px] text-slate-500">
              ¡BASTA!
            </Text>
            <DisplayText className="mt-2 text-[28px]">Mi cielo</DisplayText>
          </View>

          <View className="items-center">
            <MiniConstelacion lado={cardW - 44} />
          </View>

          <View>
            <View className="flex-row items-end justify-between px-1">
              <View className="items-center">
                <Text className="font-mono text-3xl text-plata">
                  {st.estrellas.length}
                </Text>
                <Text className="mt-1 font-sans text-[10px] uppercase tracking-[2px] text-slate-500">
                  {st.estrellas.length === 1 ? 'estrella' : 'estrellas'}
                </Text>
              </View>
              <View className="items-center">
                <Text className="font-mono text-3xl text-plata">
                  {st.rachaInfo.racha}
                </Text>
                <Text className="mt-1 font-sans text-[10px] uppercase tracking-[2px] text-slate-500">
                  {st.rachaInfo.racha === 1 ? 'noche' : 'noches'}
                </Text>
              </View>
              <View className="items-center">
                <Text className="font-mono text-3xl text-plata">{rango}</Text>
                <Text className="mt-1 font-sans text-[10px] uppercase tracking-[2px] text-slate-500">
                  rango
                </Text>
              </View>
            </View>
            <Text className="mt-6 text-center font-serif-italic text-[11px] leading-4 text-slate-400">
              ¡BASTA! — el país que queremos empieza por verlo
            </Text>
          </View>
        </View>

        {/* Compartir: nativo sí; web es preview, no hay share sheet confiable */}
        {Platform.OS === 'web' ? (
          <GlassCard className="mt-8 w-full p-5">
            <Text className="text-center font-sans text-sm leading-6 text-slate-400">
              Desde el teléfono se comparte: esta preview solo muestra la
              tarjeta.
            </Text>
          </GlassCard>
        ) : (
          <View className="mt-8 items-center">
            <AccentButton
              label={compartiendo ? 'Preparando…' : 'Compartir'}
              onPress={compartir}
              disabled={compartiendo}
            />
            <Text className="mt-3 font-sans text-xs text-slate-500">
              «{COMPARTIR.cielo}»
            </Text>
          </View>
        )}

        {error && (
          <Text className="mt-4 text-center font-sans text-sm text-senal-basta">
            {error}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
