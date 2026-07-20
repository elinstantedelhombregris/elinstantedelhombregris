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
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { calentarActorKey } from '@/civic/actor-cache';
import { useCivicSync } from '@/civic/sync';
import {
  db,
  flushWebDatabaseSnapshot,
  initializeWebDatabasePersistence,
  migrations,
  restoreWebDatabasePersistence,
} from '@/db/client';
import { CLAVES, getSetting } from '@/db/repos';
import { useJuego } from '@/stores/juego';
import { BG } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

/**
 * Migraciones como singleton de módulo (drizzle `migrate` + la db perezosa).
 *
 * ¿Por qué no `useMigrations` directo? En dev, React monta los efectos DOS
 * veces (StrictMode): dos `migrate()` concurrentes disparan operaciones sync
 * simultáneas sobre el worker de expo-sqlite. Un solo promise compartido
 * elimina la carrera en todas las plataformas; si falla, se resetea para que
 * el reintento vuelva a intentar.
 *
 * En web, antes de migrar se "calienta" el worker con una conexión async
 * independiente: la primera llamada SYNC moriría por timeout mientras Metro
 * bundlea el worker. En nativo el calentamiento es no-op.
 */
interface DatabaseBootstrapState {
  migration: Promise<void> | null;
  warmup: Promise<void> | null;
  warmupDatabase: SQLiteDatabase | null;
  webLock: Promise<void> | null;
  releaseWebLock: (() => void) | null;
  pageHideListenerInstalled: boolean;
}

const GLOBAL_BOOTSTRAP_KEY = '__basta_database_bootstrap_v1__';
const globalWithBootstrap = globalThis as typeof globalThis & {
  [GLOBAL_BOOTSTRAP_KEY]?: DatabaseBootstrapState;
};
const databaseBootstrap = globalWithBootstrap[GLOBAL_BOOTSTRAP_KEY] ??= {
  migration: null,
  warmup: null,
  warmupDatabase: null,
  webLock: null,
  releaseWebLock: null,
  pageHideListenerInstalled: false,
};

const adquirirBloqueoWeb = (): Promise<void> => {
  if (Platform.OS !== 'web' || !navigator.locks) return Promise.resolve();
  if (databaseBootstrap.webLock) return databaseBootstrap.webLock;
  databaseBootstrap.webLock = new Promise<void>((resolve, reject) => {
    void navigator.locks.request(
      'basta-sqlite-indexeddb-v1',
      { mode: 'exclusive', ifAvailable: true },
      async (lock) => {
        if (!lock) {
          databaseBootstrap.webLock = null;
          reject(new Error('basta_db_already_open'));
          return;
        }
        if (!databaseBootstrap.pageHideListenerInstalled) {
          window.addEventListener('pagehide', () => databaseBootstrap.releaseWebLock?.(), { once: true });
          databaseBootstrap.pageHideListenerInstalled = true;
        }
        resolve();
        await new Promise<void>((release) => {
          databaseBootstrap.releaseWebLock = release;
        });
      },
    ).catch((error: unknown) => {
      databaseBootstrap.webLock = null;
      reject(error);
    });
  });
  return databaseBootstrap.webLock;
};

const calentarWorkerWeb = async (): Promise<void> => {
  if (databaseBootstrap.warmupDatabase) return;
  if (databaseBootstrap.warmup) return databaseBootstrap.warmup;
  // La apertura async permite que Metro entregue y wa-sqlite inicialice el
  // worker sin bloquear el hilo principal. `useNewConnection` evita que la
  // DB real reutilice este puntero de descarte; se conserva abierto durante
  // la sesión para no invalidarlo en el worker.
  databaseBootstrap.warmup = openDatabaseAsync(':memory:', { useNewConnection: true })
    .then((database) => {
      databaseBootstrap.warmupDatabase = database;
    })
    .catch((error: unknown) => {
      databaseBootstrap.warmup = null;
      throw error;
    });
  return databaseBootstrap.warmup;
};

const correrMigracionesUnaVez = (): Promise<void> => {
  if (!databaseBootstrap.migration) {
    databaseBootstrap.migration = (async () => {
      await adquirirBloqueoWeb();
      if (Platform.OS === 'web') {
        await calentarWorkerWeb();
        await initializeWebDatabasePersistence();
      }
      await migrate(db, migrations);
      // `repos-protocolo.ts` necesita la actor key en forma sincrónica; se
      // resuelve una sola vez acá para que toda pantalla monte con la
      // caché ya tibia (ver src/civic/actor-cache.ts).
      await calentarActorKey();
      await restoreWebDatabasePersistence();
      await flushWebDatabaseSnapshot();
    })().catch((e: unknown) => {
      databaseBootstrap.migration = null; // habilita el reintento
      throw e;
    });
  }
  return databaseBootstrap.migration;
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
        console.error('[DbGate] migración falló:', error, 'causa:', (error as Error & { cause?: unknown }).cause);
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
    const alreadyOpen = estado.error.message.includes('basta_db_already_open');
    return (
      <View className="flex-1 items-center justify-center px-8">
        <GlassCard className="w-full items-center p-8">
          <Text className="font-serif text-2xl text-plata text-center">
            {alreadyOpen ? 'La app ya está abierta' : 'El cielo no pudo abrirse'}
          </Text>
          <Text className="mt-3 font-sans text-sm text-slate-400 text-center">
            {alreadyOpen
              ? 'Para proteger la base local, usá una sola pestaña a la vez. Cerrá la otra pestaña y probá de nuevo.'
              : 'Algo se trabó preparando tus datos. No se perdió nada: probá de nuevo.'}
          </Text>
          <View className="mt-6">
            <AccentButton label="Probar de nuevo" onPress={onReintentar} />
          </View>
        </GlassCard>
      </View>
    );
  }

  if (!estado.listo) return null; // migrando: el splash sigue arriba

  return <CivicApp />;
}

/** La sincronización sólo arranca después de que todas las tablas existan. */
function CivicApp() {
  const pathname = usePathname();
  const router = useRouter();
  const needsOnboardingRedirect = getSetting(CLAVES.ftueCompleto) !== '1' && pathname !== '/ftue';
  useCivicSync();

  useEffect(() => {
    // Una ruta profunda o una recarga no pasa necesariamente por El Cielo.
    // Hidratamos la economía y el día en cada cambio de ruta para que todas
    // las pantallas lean la misma verdad persistida.
    useJuego.getState().refresh();

    // El onboarding protege todo el producto, no sólo la portada. Sin este
    // guard un deep link podía abrir coordinación o captura antes de explicar
    // privacidad, ubicación y control de datos.
    if (needsOnboardingRedirect) {
      router.replace('/ftue');
    }
  }, [needsOnboardingRedirect, pathname, router]);

  if (needsOnboardingRedirect) return null;

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
      <Stack.Screen name="expediciones/index" />
      <Stack.Screen name="expediciones/fundar" />
      <Stack.Screen name="expediciones/[id]" />
      <Stack.Screen name="misiones/index" />
      <Stack.Screen name="misiones/fundar" />
      <Stack.Screen name="misiones/[id]" />
      <Stack.Screen name="obras/publicar" />
      <Stack.Screen name="corriente" />
      <Stack.Screen name="bitacora" />
      <Stack.Screen name="escuchar" />
      <Stack.Screen name="escuchar/necesidad/[id]" />
      <Stack.Screen name="ajustes" />
      <Stack.Screen name="qr" />
      <Stack.Screen name="compartir" />
      <Stack.Screen name="territorio/index" />
      <Stack.Screen name="territorio/inteligencia" />
      <Stack.Screen name="territorio/mapa" />
      <Stack.Screen name="territorio/misiones/index" />
      <Stack.Screen name="territorio/misiones/[id]" />
      <Stack.Screen name="verificar" />
      <Stack.Screen name="conectar" />
      <Stack.Screen name="aportar" />
      <Stack.Screen name="publicar" />
      <Stack.Screen name="mis-datos" />
      <Stack.Screen name="circulos" />
      <Stack.Screen name="tramas/[id]" />
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
    <View className="flex-1 items-center" style={{ backgroundColor: '#050507' }}>
      <View
        className="flex-1"
        style={Platform.OS === 'web'
          ? {
              backgroundColor: BG,
              width: '100%',
              maxWidth: 520,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
              boxShadow: '0 0 80px rgba(125,91,222,0.10)',
            }
          : { backgroundColor: BG, width: '100%' }}
      >
        <StatusBar style="light" />
        <DbGate
          key={intento}
          onReintentar={() => {
            // En web, una falla estructural del worker requiere reiniciar su
            // contexto. La recarga conserva y restaura la fotografía local.
            if (Platform.OS === 'web') {
              window.location.reload();
              return;
            }
            setIntento((i) => i + 1);
          }}
        />
      </View>
    </View>
  );
}
