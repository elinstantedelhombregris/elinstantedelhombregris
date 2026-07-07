import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable97 } from '@/components/ui/Pressable97';
import { fadeIn, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';
import { ACCENT, PLATA } from '@/theme/tokens';

/**
 * LA CONSTELACIÓN — el mapa vivo es la pantalla de inicio.
 * Por ahora: campo de estrellas placeholder (M3 lo reemplaza por MapLibre).
 * Los paneles (círculos, campañas, datos, perfil) se deslizan por encima;
 * todo vuelve al mapa.
 */

// Campo de estrellas determinístico (mismas posiciones en cada arranque).
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: seeded(i, 1),
  y: seeded(i, 2),
  size: 1 + seeded(i, 3) * 2,
  opacity: 0.15 + seeded(i, 4) * 0.55,
}));

const PANELS = [
  { key: 'circulos', label: 'Círculos', icon: 'people-outline' as const },
  { key: 'campanas', label: 'Campañas', icon: 'telescope-outline' as const },
  { key: 'datos', label: 'Datos', icon: 'stats-chart-outline' as const },
  { key: 'perfil', label: 'Perfil', icon: 'person-circle-outline' as const },
];

export default function Constelacion() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-fondo">
      {/* Cielo — placeholder del mapa vivo */}
      <Animated.View entering={fadeIn} className="absolute inset-0">
        {STARS.map((s, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: s.x * width,
              top: s.y * height,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              backgroundColor: PLATA,
              opacity: s.opacity,
            }}
          />
        ))}
      </Animated.View>

      {/* Barra inferior de vidrio: 4 paneles + FAB Señalar al centro */}
      <View
        className="absolute inset-x-4 flex-row items-center justify-between rounded-3xl bg-white/5 border border-white/10 px-2"
        style={{ bottom: insets.bottom + 12, height: 68 }}
      >
        {PANELS.slice(0, 2).map((p, i) => (
          <PanelButton key={p.key} panel={p} index={i} />
        ))}

        {/* Señalar — la única cosa violeta de la pantalla */}
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Señalar"
          silent
          onPress={() => {
            haptic.send();
            router.push('/senal');
          }}
          className="items-center justify-center rounded-full bg-accent"
          style={{
            width: 64,
            height: 64,
            marginTop: -26,
            shadowColor: ACCENT,
            shadowOpacity: 0.5,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}
        >
          <Ionicons name="add" size={34} color="#ffffff" />
        </Pressable97>

        {PANELS.slice(2).map((p, i) => (
          <PanelButton key={p.key} panel={p} index={i + 2} />
        ))}
      </View>
    </View>
  );
}

function PanelButton({
  panel,
  index,
}: {
  panel: (typeof PANELS)[number];
  index: number;
}) {
  return (
    <Animated.View entering={staggerDelay(index)}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={panel.label}
        className="items-center justify-center px-3 py-2"
        onPress={() => {
          // Paneles llegan en M3/M4 — por ahora el gesto responde igual.
        }}
      >
        <Ionicons name={panel.icon} size={22} color="#94a3b8" />
        <Text className="mt-1 font-sans text-[10px] text-slate-400">{panel.label}</Text>
      </Pressable97>
    </Animated.View>
  );
}
