/**
 * Carta de Lore (spec §3.1) — el premio por completar una constelación:
 * un fragmento verbatim de los ensayos, con su ensayo como atribución y
 * la silueta completa brillando arriba. G5 la hace compartible; acá se
 * muestra en toda su gloria.
 *
 * Registro papel-sobre-oscuro del sistema Papel y Tinta (spec §1.4/§8):
 * la revelación cae sobre el fondo oscuro (misma familia que RangoUpOverlay,
 * un momento fuera del cuaderno), pero la carta en sí es una hoja de papel
 * real — la única sombra permitida en todo el sistema.
 */

import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BotonTinta, Kicker, TituloAnton } from '@/components/papel';
import type { Constelacion, TipoSenal } from '@/content';
import type { ProgresoConstelacion } from '@/game/colecciones';
import { bloom, fadeIn } from '@/motion/variants';
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

/** El único exceso de sombra que permite el sistema (spec §1.4/§8):
 * papel-sobre-oscuro, 0 24px 60px rgba(0,0,0,0.45). */
const sombraCarta =
  Platform.OS === 'web'
    ? { boxShadow: '0px 24px 60px rgba(0, 0, 0, 0.45)' }
    : {
        shadowColor: '#000000',
        shadowOpacity: 0.45,
        shadowRadius: 60,
        shadowOffset: { width: 0, height: 24 },
        elevation: 24,
      };

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
        <Kicker registro="noche">
          {nueva ? 'La constelación se completó' : 'Carta de lore'}
        </Kicker>

        <View className="mt-5 w-full items-center bg-papel px-7 py-9" style={sombraCarta}>
          <SiluetaConstelacion
            constelacion={constelacion}
            porTipo={progresoCompleto(constelacion.receta)}
            size={110}
            completada
          />
          <Text className="mt-4 font-space text-[10px] uppercase tracking-[3px] text-tinta-50">
            {constelacion.nombre}
          </Text>
          <TituloAnton tamano="lg" className="mt-3 text-center">
            {constelacion.carta.titulo}
          </TituloAnton>
          <Text className="mt-6 text-center font-archivo-italic text-xl leading-8 text-tinta-90">
            «{constelacion.carta.cita}»
          </Text>
          <Text className="mt-5 font-archivo text-xs text-tinta-50">
            de «{constelacion.carta.ensayo}»
          </Text>
        </View>

        {nueva && (
          <Text className="mt-4 font-space text-[11px] text-oscuro-meta">
            Queda tuya para siempre, en el álbum, en Cartas.
          </Text>
        )}
        <View className="mt-6">
          <BotonTinta
            etiqueta={nueva ? 'Guardarla' : 'Volver'}
            variante="fantasma"
            registro="noche"
            onPress={onCerrar}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}
