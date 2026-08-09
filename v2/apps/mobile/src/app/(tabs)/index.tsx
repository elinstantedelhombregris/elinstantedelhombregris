/**
 * La portada — el mapa a sangre completa.
 *
 * Flujo (rebanada 1): repos locales → SenalParaConteo[] → plan de cobertura
 * sobre la zona guardada → conteosPorCelda → luzDeCeldas → `TerritoryMap`.
 * El armado de señales vive en `@/civic/senales-para-mapa` — acá sólo se
 * carga, se combina y se dibuja.
 *
 * Sin zona guardada no hay portada: manda al FTUE. Con cero señales, todas
 * las celdas salen mudas — es la verdad, no una falla (`el-vacio-como-pieza`
 * §3.4) — y la única pieza que se agrega es una línea que invita.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TerritoryMap from '@/components/civic/TerritoryMap';
import { PapelCard } from '@/components/papel';
import { needsAll, observationsAll, resourcesAll } from '@/civic/repo';
import { nadieHabloTodavia, planificarLucesDeZona } from '@/civic/senales-para-mapa';
import type { GeoPoint } from '@/civic/types';
import { CLAVES, getSetting } from '@/db/repos';
import type { CivicNeedRow, CivicObservationRow, CivicResourceRow } from '@/db/schema';

/** Lee y valida la zona guardada por el FTUE. `null` si no hay ninguna (aún). */
const leerZonaGuardada = (): GeoPoint[] | null => {
  const raw = getSetting(CLAVES.zona);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 3) return null;
    return parsed as GeoPoint[];
  } catch {
    return null;
  }
};

export default function Mapa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // `undefined` = todavía no se leyó settings; distingue "cargando" de "no hay zona".
  const [zona, setZona] = useState<GeoPoint[] | null | undefined>(undefined);
  const [observations, setObservations] = useState<CivicObservationRow[]>([]);
  const [needs, setNeeds] = useState<CivicNeedRow[]>([]);
  const [resources, setResources] = useState<CivicResourceRow[]>([]);

  useFocusEffect(useCallback(() => {
    const polygon = leerZonaGuardada();
    if (!polygon) {
      router.replace('/ftue');
      return;
    }
    setZona(polygon);
    setObservations(observationsAll());
    setNeeds(needsAll());
    setResources(resourcesAll());
  }, [router]));

  const { plan, conteos, luces } = useMemo(() => {
    if (!zona) return { plan: null, conteos: [], luces: [] };
    return planificarLucesDeZona({ points: zona }, { observations, needs, resources });
  }, [zona, observations, needs, resources]);

  // Todavía leyendo settings o a punto de redirigir al FTUE: fondo oscuro
  // del propio registro, no una pantalla en blanco.
  if (zona === undefined) return <View className="flex-1 bg-fondo" />;

  const vacio = plan !== null && nadieHabloTodavia(conteos);
  const totalCeldas = plan?.cells.length ?? 0;

  return (
    <View className="flex-1 bg-fondo">
      <TerritoryMap points={[]} coverageCells={plan?.cells ?? []} luces={luces} onSelection={() => {}} />

      {vacio && (
        <View style={{ pointerEvents: 'none' }} className="absolute inset-x-8 top-1/2 items-center">
          <PapelCard registro="noche" className="p-5">
            <Text className="text-center font-archivo-bold text-sm leading-6 text-oscuro-texto">
              Nadie habló todavía en estas {totalCeldas} celdas.
            </Text>
            <Text className="mt-1 text-center font-archivo text-sm leading-6 text-oscuro-secundario">
              La primera puede ser la tuya.
            </Text>
          </PapelCard>
        </View>
      )}

      <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 px-4">
        <View className="bg-black/70 px-4 py-2.5" style={{ marginBottom: insets.bottom + 8 }}>
          <Text className="font-archivo text-[10px] leading-4 text-oscuro-secundario">
            Población estimada por densidad provincial (censo 2022). En zonas rurales el brillo queda por debajo del real.
          </Text>
        </View>
      </View>
    </View>
  );
}
