import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { OSCURO_BARRA, OSCURO_BORDE, OSCURO_META, PAPEL } from '@/theme/tokens';

/** Las cuatro puertas. Todo lo demás cuelga de acá, no compite con ellas. */
const PESTANAS = [
  { name: 'index', title: 'Mapa', icon: 'map-outline' },
  { name: 'aportar', title: 'Aportar', icon: 'add-circle-outline' },
  { name: 'territorio', title: 'Territorio', icon: 'people-outline' },
  { name: 'ajustes', title: 'Ajustes', icon: 'settings-outline' },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAPEL,
        tabBarInactiveTintColor: OSCURO_META,
        tabBarStyle: { backgroundColor: OSCURO_BARRA, borderTopColor: OSCURO_BORDE },
        tabBarLabelStyle: { fontFamily: 'SpaceMono_400Regular', fontSize: 10 },
      }}
    >
      {PESTANAS.map((p) => (
        <Tabs.Screen
          key={p.name}
          name={p.name}
          options={{
            title: p.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={p.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
