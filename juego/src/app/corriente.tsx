/**
 * La Corriente (Protocolo Vivo) — el feed local de obras publicadas y
 * eventos de misión, hecho por hecho. Los pulsos son el único gesto de
 * aprecio: presupuesto diario parejo para todos, un pulso por obra para
 * siempre (spec Trust Layer, `protocolo/pulsos.ts`). "Estás al corriente"
 * separa lo nuevo desde la última visita de lo que ya viste.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { oficioPorId } from '@/content/oficios';
import { CLAVES, ahoraISO, getSetting, setSetting } from '@/db/repos';
import { corrienteLocal, darPulso, pulsosDeHoy, type ItemCorriente } from '@/db/repos-protocolo';
import type { PvMisionRow, PvObraRow } from '@/db/schema';
import { staggerDelay } from '@/motion/variants';
import { PULSOS_APRECIO_POR_DIA, pulsosDisponibles } from '@/protocolo/pulsos';
import { haptic } from '@/theme/haptics';
import { PLATA } from '@/theme/tokens';

type Renderable =
  | { kind: 'divider' }
  | { kind: 'item'; data: ItemCorriente };

const fechaDe = (i: ItemCorriente): string =>
  i.clase === 'obra' ? i.obra.publicadaAt : (i.mision.resueltaAt ?? i.mision.createdAt);

const fechaFeed = (valor: string): string => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
};

const NOTA_SIN_PRESUPUESTO = 'Tus pulsos de hoy ya laten en otras obras. Mañana hay más.';
const NOTA_REPETIDO = 'Esta obra ya tiene tu pulso.';

export default function Corriente() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ItemCorriente[]>([]);
  const [pulsosHoy, setPulsosHoy] = useState(0);
  const [dividerIndex, setDividerIndex] = useState<number | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});

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
      return;
    }
    haptic.send();
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

  const renderables: Renderable[] = items.map((data) => ({ kind: 'item' as const, data }));
  if (dividerIndex !== null) {
    renderables.splice(dividerIndex, 0, { kind: 'divider' });
  }

  const keyExtractor = (r: Renderable): string => {
    if (r.kind === 'divider') return 'divider';
    const id = r.data.clase === 'obra' ? r.data.obra.id : r.data.mision.id;
    return `${r.data.clase}-${id}`;
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title="La Corriente"
        right={
          <View className="flex-row items-center gap-3">
            <PresupuestoDots restantes={restantes} />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Chispas y círculos"
              onPress={() => router.push('/qr' as never)}
              className="p-1"
            >
              <Ionicons name="qr-code-outline" size={20} color="#94a3b8" />
            </Pressable97>
          </View>
        }
      />
      <Text className="px-5 pb-3 font-sans text-xs text-slate-500">
        Lo que el país está haciendo, hecho por hecho.
      </Text>
      <FlatList
        data={renderables}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <GlassCard className="mt-3 items-center p-6">
            <Text className="text-center font-sans text-sm leading-6 text-slate-400">
              La Corriente arranca cuando alguien publica la primera obra. Puede ser la tuya.
            </Text>
            <View className="mt-5">
              <AccentButton label="Ir a Misiones" onPress={() => router.push('/misiones' as never)} />
            </View>
          </GlassCard>
        }
        renderItem={({ item, index }) => {
          if (item.kind === 'divider') return <DividerEstasAlCorriente />;
          if (item.data.clase === 'obra') {
            const { obra, pulsos } = item.data;
            return (
              <ObraCard
                obra={obra}
                pulsos={pulsos}
                index={index}
                nota={notas[obra.id] ?? null}
                onPulso={() => darPulsoAObra(obra.id)}
              />
            );
          }
          const { mision } = item.data;
          return (
            <MisionLinea mision={mision} index={index} onPress={() => irAMision(mision.id)} />
          );
        }}
      />
    </View>
  );
}

function PresupuestoDots({ restantes }: { restantes: number }) {
  return (
    <View
      className="flex-row items-center gap-1.5"
      accessibilityLabel={`Te quedan ${restantes} pulsos hoy`}
    >
      {Array.from({ length: PULSOS_APRECIO_POR_DIA }).map((_, i) => (
        <View
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: i < restantes ? PLATA : 'rgba(100,116,139,0.4)' }}
        />
      ))}
    </View>
  );
}

function DividerEstasAlCorriente() {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-px flex-1 bg-white/10" />
      <Text className="font-sans-medium text-[11px] uppercase tracking-[2px] text-plata">
        Estás al corriente
      </Text>
      <View className="h-px flex-1 bg-white/10" />
    </View>
  );
}

function ObraCard({
  obra,
  pulsos,
  index,
  nota,
  onPulso,
}: {
  obra: PvObraRow;
  pulsos: number;
  index: number;
  nota: string | null;
  onPulso: () => void;
}) {
  const oficio = oficioPorId(obra.oficioId);
  return (
    <Animated.View entering={staggerDelay(index)}>
      <GlassCard className="p-4">
        <View className="flex-row items-center gap-2">
          {oficio && (
            <View
              className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
              style={{ borderColor: `${oficio.color}45`, backgroundColor: `${oficio.color}18` }}
            >
              <Ionicons name={oficio.icono as never} size={12} color={oficio.color} />
              <Text className="font-sans text-[11px]" style={{ color: oficio.color }}>
                {oficio.nombre}
              </Text>
            </View>
          )}
          <Text className="ml-auto font-mono text-[10px] text-slate-500">
            {fechaFeed(obra.publicadaAt)}
          </Text>
        </View>

        <Text className="mt-3 font-sans-semibold text-base text-plata">{obra.titulo}</Text>
        {obra.resumen && (
          <Text className="mt-1.5 font-sans text-sm leading-5 text-slate-400">{obra.resumen}</Text>
        )}

        {obra.evidenciaUri && (
          <Image
            source={{ uri: obra.evidenciaUri }}
            style={{ width: '100%', height: 180, borderRadius: 16, marginTop: 12 }}
            contentFit="cover"
          />
        )}

        <View className="mt-3 flex-row items-center justify-between">
          {obra.territorio ? (
            <View className="flex-1 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={12} color="#64748b" />
              <Text numberOfLines={1} className="flex-1 font-sans text-[11px] text-slate-500">
                {obra.territorio}
              </Text>
            </View>
          ) : (
            <View className="flex-1" />
          )}
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel={`Dar pulso a ${obra.titulo}, ${pulsos} ${pulsos === 1 ? 'pulso' : 'pulsos'}`}
            onPress={onPulso}
            className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2"
          >
            <Ionicons name="pulse" size={15} color={PLATA} />
            <Text className="font-mono text-xs text-plata">{pulsos}</Text>
          </Pressable97>
        </View>

        {nota && (
          <View className="mt-3 flex-row items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3">
            <Ionicons name="alert-circle-outline" size={14} color="#FCD34D" />
            <Text className="flex-1 font-sans text-[11px] leading-4 text-amber-100">{nota}</Text>
          </View>
        )}
      </GlassCard>
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
        className="flex-row items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
      >
        <Ionicons
          name={resuelta ? 'checkmark-circle-outline' : 'flag-outline'}
          size={14}
          color="#64748b"
        />
        <Text numberOfLines={1} className="flex-1 font-sans text-xs text-slate-400">
          {texto}
        </Text>
        <Text className="font-mono text-[10px] text-slate-600">
          {fechaFeed(mision.resueltaAt ?? mision.createdAt)}
        </Text>
      </Pressable97>
    </Animated.View>
  );
}
