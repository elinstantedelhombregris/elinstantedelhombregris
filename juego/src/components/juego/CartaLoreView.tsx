/**
 * Carta de Lore (spec §3.1) — el premio por completar una constelación:
 * un fragmento verbatim de los ensayos, en Playfair, con su ensayo como
 * atribución y la silueta completa brillando arriba. G5 la hace
 * compartible; acá se muestra en toda su gloria.
 */

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AccentButton } from '@/components/ui/AccentButton';
import { DisplayText } from '@/components/ui/DisplayText';
import type { Constelacion, TipoSenal } from '@/content';
import type { ProgresoConstelacion } from '@/game/colecciones';
import { bloom, fadeIn } from '@/motion/variants';
import { PLATA } from '@/theme/tokens';
import { haptic } from '@/theme/haptics';

import { SiluetaConstelacion } from './SiluetaConstelacion';

/** Progreso "todo encendido" para dibujar la silueta completa. */
const progresoCompleto = (
  receta: Constelacion['receta'],
): ProgresoConstelacion['porTipo'] =>
  Object.fromEntries(
    (Object.entries(receta) as [TipoSenal, number][]).map(([t, n]) => [
      t,
      { tiene: n, necesita: n },
    ]),
  );

export function CartaLoreView({
  constelacion,
  nueva,
  onCerrar,
}: {
  constelacion: Constelacion;
  /** true = se acaba de ganar (celebración); false = relectura desde el álbum. */
  nueva: boolean;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (nueva) haptic.celebrate();
  }, [nueva]);

  return (
    <Animated.View
      entering={fadeIn}
      className="absolute inset-0 items-center justify-center px-6"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.94)' }}
    >
      <Animated.View entering={bloom} className="w-full items-center">
        <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          {nueva ? 'La constelación se completó' : 'Carta de lore'}
        </Text>

        <View
          className="mt-5 w-full items-center rounded-3xl border bg-white/5 px-7 py-9"
          style={{
            borderColor: 'rgba(245, 247, 250, 0.25)',
            shadowColor: PLATA,
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}
        >
          <SiluetaConstelacion
            constelacion={constelacion}
            porTipo={progresoCompleto(constelacion.receta)}
            size={110}
            completada
          />
          <Text className="mt-4 font-sans text-[10px] uppercase tracking-[3px] text-slate-500">
            {constelacion.nombre}
          </Text>
          <DisplayText className="mt-3 text-center text-2xl leading-9">
            {constelacion.carta.titulo}
          </DisplayText>
          <Text className="mt-6 text-center font-serif-italic text-xl leading-8 text-plata">
            «{constelacion.carta.cita}»
          </Text>
          <Text className="mt-5 font-sans text-xs text-slate-400">
            de «{constelacion.carta.ensayo}»
          </Text>
        </View>

        {nueva && (
          <Text className="mt-4 font-sans text-[11px] text-slate-500">
            Queda tuya para siempre, en el álbum, en Cartas.
          </Text>
        )}
        <View className="mt-6">
          <AccentButton label={nueva ? 'Guardarla' : 'Volver'} onPress={onCerrar} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
