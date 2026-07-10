import '@/global.css';
import '@/lib/nativewind-setup';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import {
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { openDatabaseAsync } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { NOMBRE_DB, db, migrations } from '@/db/client';
import { BG } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

/**
 * Migraciones como singleton de módulo (drizzle `migrate` + la db perezosa).
 *
 * ¿Por qué no `useMigrations` directo? En dev, React monta los efectos DOS
 * veces (StrictMode): dos `migrate()` concurrentes disparan dos `open` al
 * worker de expo-sqlite en web, cuya inicialización del VFS (OPFS) no es
 * reentrante — la segunda tira NoModificationAllowedError y deja el worker
 * envenenado. Un solo promise compartido elimina la carrera en todas las
 * plataformas; si falla, se resetea para que el reintento vuelva a intentar.
 *
 * En web, antes de migrar se "calienta" el worker con una apertura async y
 * cierre limpio: la primera llamada SYNC moriría por timeout mientras Metro
 * bundlea el worker. En nativo el calentamiento es no-op.
 */
let migracionEnCurso: Promise<void> | null = null;

const calentarSqliteWeb = async (): Promise<void> => {
  try {
    await Promise.race([
      (async () => {
        const d = await openDatabaseAsync(NOMBRE_DB);
        await d.closeAsync();
      })(),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);
  } catch {
    // Mejor esfuerzo: si de verdad no anda, migrate() falla y el gate reintenta.
  }
};

const correrMigracionesUnaVez = (): Promise<void> => {
  if (!migracionEnCurso) {
    migracionEnCurso = (async () => {
      if (Platform.OS === 'web') await calentarSqliteWeb();
      await migrate(db, migrations);
    })().catch((e: unknown) => {
      migracionEnCurso = null; // habilita el reintento
      throw e;
    });
  }
  return migracionEnCurso;
};

/**
 * Gate de la DB: corre las migraciones UNA vez antes de montar cualquier
 * ruta. Si fallan, carta de vidrio con reintento (remontar el gate vuelve
 * a llamar a correrMigracionesUnaVez, ya reseteada).
 */
function DbGate({ onReintentar }: { onReintentar: () => void }) {
  const [estado, setEstado] = useState<{ listo: boolean; error: Error | null }>({
    listo: false,
    error: null,
  });

  useEffect(() => {
    let vivo = true;
    correrMigracionesUnaVez()
      .then(() => {
        if (vivo) setEstado({ listo: true, error: null });
      })
      .catch((e: unknown) => {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error('[DbGate] migración falló:', error);
        if (vivo) setEstado({ listo: false, error });
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (estado.listo || estado.error) SplashScreen.hideAsync();
  }, [estado]);

  if (estado.error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <GlassCard className="w-full items-center p-8">
          <Text className="font-serif text-2xl text-plata text-center">
            El cielo no pudo abrirse
          </Text>
          <Text className="mt-3 font-sans text-sm text-slate-400 text-center">
            Algo se trabó preparando tus datos. No se perdió nada: probá de
            nuevo.
          </Text>
          <View className="mt-6">
            <AccentButton label="Probar de nuevo" onPress={onReintentar} />
          </View>
        </GlassCard>
      </View>
    );
  }

  if (!estado.listo) return null; // migrando: el splash sigue arriba

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ftue" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen
        name="ver"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="encender"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="dar"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen
        name="rito"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="album" />
      <Stack.Screen name="expediciones" />
      <Stack.Screen name="bitacora" />
      <Stack.Screen name="ajustes" />
      <Stack.Screen name="qr" />
    </Stack>
  );
}

export default function RootLayout() {
  const [intento, setIntento] = useState(0);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_500Medium_Italic,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <StatusBar style="light" />
      <DbGate key={intento} onReintentar={() => setIntento((i) => i + 1)} />
    </View>
  );
}
