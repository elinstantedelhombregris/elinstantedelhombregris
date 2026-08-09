/**
 * FTUE — la única pregunta del onboarding cívico: elegí tu zona.
 *
 * El juego (con su recorrido de expedición, permisos pedidos de entrada y
 * explicación del Cielo) se borró en R2 Task 5. Esto no lo reemplaza pieza
 * por pieza: es un onboarding nuevo, mínimo. Sin registro, sin pedir GPS de
 * entrada — el mapa ya sabe mostrar un área sin ubicación (`TerritoryMap`
 * trae «Área» y «Lazo», ninguno de los dos toca el GPS del teléfono).
 *
 * Guarda el polígono elegido en settings (`CLAVES.zona`) y manda a la
 * portada, que lo lee para armar su propia grilla de cobertura.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TerritoryMap from '@/components/civic/TerritoryMap';
import { BotonTinta, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import { planTerritorialCoverage } from '@/civic/coverage';
import type { TerritorySelection } from '@/civic/lasso';
import { CLAVES, setSetting } from '@/db/repos';
import { haptic } from '@/theme/haptics';

/** Mismo target que usa la portada — el plan tiene que coincidir con el que verá después. */
const OBJETIVO_COBERTURA = { cellCount: 16, maxCells: 36, namespace: 'portada-v1' } as const;

export default function Ftue() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<TerritorySelection | null>(null);
  const [guardando, setGuardando] = useState(false);

  const plan = useMemo(
    () => (selection ? planTerritorialCoverage({ points: selection.polygon }, OBJETIVO_COBERTURA) : null),
    [selection],
  );
  const listo = plan?.valid === true && plan.cells.length > 0;

  const confirmar = () => {
    if (!selection || !listo || guardando) return;
    setGuardando(true);
    setSetting(CLAVES.zona, JSON.stringify(selection.polygon));
    haptic.celebrate();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-fondo">
      <TerritoryMap points={[]} onSelection={setSelection} />

      {/* Todo el texto y la acción viven abajo, a propósito: la barra propia
          de TerritoryMap («Área» / «Lazo») ya ocupa el borde superior. */}
      <View className="absolute bottom-0 left-0 right-0 px-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <PapelCard registro="noche" className="p-4">
          <Kicker registro="noche">antes de nada</Kicker>
          <TituloAnton registro="noche" tamano="md" className="mt-1">Elegí tu zona</TituloAnton>
          <Text className="mt-2 font-archivo text-xs leading-5 text-oscuro-secundario">
            Movete por el mapa hasta donde vivís o te importa, y tocá «Área» — o dibujá el borde con el dedo.
          </Text>
          <Text className="mt-3 font-space text-[11px] text-oscuro-meta">
            {listo
              ? `${plan!.plannedDenominator.value} celdas planificadas · esto va a ser tu mapa.`
              : 'Todavía no elegiste ninguna zona.'}
          </Text>
          <View className="mt-3">
            <BotonTinta
              etiqueta="Guardar zona y ver el mapa"
              registro="noche"
              onPress={confirmar}
              disabled={!listo || guardando}
              cargando={guardando}
            />
          </View>
        </PapelCard>
      </View>
    </View>
  );
}
