/**
 * La Corriente (Protocolo Vivo) — el feed local de obras publicadas y
 * eventos de misión, hecho por hecho. Los pulsos son el único gesto de
 * aprecio: presupuesto diario parejo para todos, un pulso por obra para
 * siempre (spec Trust Layer, `protocolo/pulsos.ts`). "Estás al corriente"
 * separa lo nuevo desde la última visita de lo que ya viste.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el cuaderno de
 * campo — cada obra es una entrada numerada, cada misión una línea mono.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  FilaIndice,
  GranoPapel,
  Kicker,
  Palitos,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { oficioPorId } from '@/content/oficios';
import { CLAVES, ahoraISO, getSetting, setSetting } from '@/db/repos';
import { corrienteLocal, darPulso, pulsosDeHoy, type ItemCorriente } from '@/db/repos-protocolo';
import type { PvMisionRow, PvObraRow } from '@/db/schema';
import { staggerDelay } from '@/motion/variants';
import { PULSOS_APRECIO_POR_DIA, pulsosDisponibles } from '@/protocolo/pulsos';
import { haptic } from '@/theme/haptics';
import { TINTA_50 } from '@/theme/tokens';

type Renderable =
  | { kind: 'divider' }
  | { kind: 'item'; data: ItemCorriente; numero: number };

const fechaDe = (i: ItemCorriente): string =>
  i.clase === 'obra' ? i.obra.publicadaAt : (i.mision.resueltaAt ?? i.mision.createdAt);

const fechaFeed = (valor: string): string => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const pad = (n: number): string => String(n).padStart(3, '0');

const NOTA_SIN_PRESUPUESTO = 'Tus pulsos de hoy ya laten en otras obras. Mañana hay más.';
const NOTA_REPETIDO = 'Esta obra ya tiene tu pulso.';

export default function Corriente() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ItemCorriente[]>([]);
  const [pulsosHoy, setPulsosHoy] = useState(0);
  const [dividerIndex, setDividerIndex] = useState<number | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});
  // Pulsos dados en esta sesión: el chip flipea a fondo tinta apenas lo das
  // (spec §8). No hay forma de saber si un pulso de una sesión anterior es
  // "mío" sin un nuevo query de solo-lectura — fuera del alcance de esta
  // task — así que un pulso viejo queda fantasma hasta que lo volvés a tocar.
  const [dadosPorMi, setDadosPorMi] = useState<Set<string>>(new Set());

  const cargar = useCallback(() => {
    setItems(corrienteLocal());
    setPulsosHoy(pulsosDeHoy());
  }, []);

  useFocusEffect(useCallback(() => cargar(), [cargar]));

  // "Estás al corriente": la posición se calcula UNA vez, contra la última
  // visita guardada, antes de pisarla con la de ahora.
  useEffect(() => {
    const anterior = getSetting(CLAVES.corrienteUltimaVisita);
    if (anterior !== null) {
      const actuales = corrienteLocal();
      if (actuales.length > 0) {
        const idx = actuales.findIndex((i) => fechaDe(i) <= anterior);
        setDividerIndex(idx === -1 ? actuales.length : idx);
      }
    }
    setSetting(CLAVES.corrienteUltimaVisita, ahoraISO());
  }, []);

  const restantes = pulsosDisponibles(pulsosHoy);

  const darPulsoAObra = (id: string) => {
    const veredicto = darPulso('obra', id);
    if (!veredicto.ok) {
      const texto = veredicto.motivo === 'sin-presupuesto' ? NOTA_SIN_PRESUPUESTO : NOTA_REPETIDO;
      setNotas((n) => ({ ...n, [id]: texto }));
      if (veredicto.motivo === 'repetido') {
        setDadosPorMi((d) => new Set(d).add(id));
      }
      return;
    }
    haptic.send();
    setDadosPorMi((d) => new Set(d).add(id));
    setNotas((n) => {
      if (!(id in n)) return n;
      const resto = { ...n };
      delete resto[id];
      return resto;
    });
    cargar();
  };

  const irAMision = (id: string) =>
    router.push({ pathname: '/misiones/[id]', params: { id } } as never);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // La numeración del cuaderno cuenta solo las obras — las misiones son
  // líneas mono sin índice, así que no dejan huecos en la serie (001, 002…).
  let contadorObra = 0;
  const renderables: Renderable[] = items.map((data) => {
    if (data.clase === 'obra') {
      contadorObra += 1;
      return { kind: 'item' as const, data, numero: contadorObra };
    }
    return { kind: 'item' as const, data, numero: 0 };
  });
  if (dividerIndex !== null) {
    renderables.splice(dividerIndex, 0, { kind: 'divider' });
  }

  const keyExtractor = (r: Renderable): string => {
    if (r.kind === 'divider') return 'divider';
    const id = r.data.clase === 'obra' ? r.data.obra.id : r.data.mision.id;
    return `${r.data.clase}-${id}`;
  };

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Chispas y círculos"
            onPress={() => router.push('/qr' as never)}
            className="min-h-11 min-w-11 items-center justify-center"
          >
            <Ionicons name="qr-code-outline" size={20} color={TINTA_50} />
          </Pressable97>
        </View>

        <View className="mt-2">
          <Kicker>lo que el país está haciendo · hecho por hecho</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            La Corriente
          </TituloAnton>
        </View>

        <View className="mt-4 flex-row items-center gap-2.5">
          <Palitos total={restantes} de={PULSOS_APRECIO_POR_DIA} />
          <Text className="font-space text-[11px] uppercase tracking-[1px] text-tinta-50">
            {restantes} {restantes === 1 ? 'pulso' : 'pulsos'} hoy
          </Text>
        </View>
      </View>

      <FlatList
        data={renderables}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={
          <PapelCard className="mt-3 items-center p-6">
            <Text className="text-center font-archivo text-sm leading-6 text-tinta-75">
              La Corriente arranca cuando alguien publica la primera obra. Puede ser la tuya.
            </Text>
            <View className="mt-5">
              <BotonTinta etiqueta="Ir a Misiones →" onPress={() => router.push('/misiones' as never)} />
            </View>
          </PapelCard>
        }
        renderItem={({ item, index }) => {
          if (item.kind === 'divider') return <DividerEstasAlCorriente />;
          if (item.data.clase === 'obra') {
            const { obra, pulsos } = item.data;
            return (
              <ObraFila
                obra={obra}
                pulsos={pulsos}
                numero={item.numero}
                index={index}
                nota={notas[obra.id] ?? null}
                dado={dadosPorMi.has(obra.id)}
                onPulso={() => darPulsoAObra(obra.id)}
              />
            );
          }
          const { mision } = item.data;
          return <MisionLinea mision={mision} index={index} onPress={() => irAMision(mision.id)} />;
        }}
      />
    </View>
  );
}

function DividerEstasAlCorriente() {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="h-px flex-1 bg-bordeSuave" />
      <Text className="font-space text-[11px] uppercase tracking-[2px] text-tinta-50">
        Estás al corriente
      </Text>
      <View className="h-px flex-1 bg-bordeSuave" />
    </View>
  );
}

function ObraFila({
  obra,
  pulsos,
  numero,
  index,
  nota,
  dado,
  onPulso,
}: {
  obra: PvObraRow;
  pulsos: number;
  numero: number;
  index: number;
  nota: string | null;
  dado: boolean;
  onPulso: () => void;
}) {
  const oficio = oficioPorId(obra.oficioId);
  return (
    <Animated.View entering={staggerDelay(index)}>
      <FilaIndice numero={pad(numero)} glifo="">
        <View className="flex-row items-center gap-2">
          {oficio && <ChipTipo etiqueta={oficio.nombre} />}
          <Text className="ml-auto font-space text-[10px] text-tinta-30">
            {fechaFeed(obra.publicadaAt)}
          </Text>
        </View>

        <Text className="mt-2 font-archivo-bold text-base text-tinta">{obra.titulo}</Text>
        {obra.resumen && (
          <Text className="mt-1 font-archivo text-sm leading-5 text-tinta-75">{obra.resumen}</Text>
        )}

        {obra.evidenciaUri && (
          <Image
            source={{ uri: obra.evidenciaUri }}
            style={{ width: '100%', height: 180, marginTop: 12 }}
            contentFit="cover"
          />
        )}

        <View className="mt-3 flex-row items-center justify-between gap-3">
          {obra.territorio ? (
            <Text numberOfLines={1} className="flex-1 font-space text-[11px] text-tinta-50">
              {obra.territorio}
            </Text>
          ) : (
            <View className="flex-1" />
          )}
          <BotonTinta
            etiqueta={`Pulso (${pulsos})`}
            accessibilityLabel={`Dar pulso a ${obra.titulo}, ${pulsos} ${pulsos === 1 ? 'pulso' : 'pulsos'}`}
            variante={dado ? 'tinta' : 'fantasma'}
            tamano="compacto"
            onPress={onPulso}
          />
        </View>

        {nota && (
          <View className="mt-3 border border-ambar px-3 py-2.5">
            <Text className="font-archivo text-[11px] leading-4 text-tinta-90">{nota}</Text>
          </View>
        )}
      </FilaIndice>
    </Animated.View>
  );
}

function MisionLinea({
  mision,
  index,
  onPress,
}: {
  mision: PvMisionRow;
  index: number;
  onPress: () => void;
}) {
  const resuelta = mision.resueltaAt !== null;
  const texto = resuelta ? `Misión resuelta: ${mision.titulo}` : `Misión fundada: ${mision.titulo}`;
  return (
    <Animated.View entering={staggerDelay(index)}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel={texto}
        onPress={onPress}
        className="flex-row items-center gap-3 border-b border-bordeSuave px-2 py-3"
      >
        <Text numberOfLines={1} className="flex-1 font-space text-xs text-tinta-75">
          {texto}
        </Text>
        <Text className="font-space text-[10px] text-tinta-30">
          {fechaFeed(mision.resueltaAt ?? mision.createdAt)}
        </Text>
      </Pressable97>
    </Animated.View>
  );
}
