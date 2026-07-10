/**
 * Álbum (spec §3.1, §3.3): las ocho constelaciones dibujándose solas a
 * medida que capturás; las Cartas de Lore ya ganadas; y las Paletas del
 * Cielo, que migran el fondo del negro puro hacia tintes de amanecer.
 * Al abrirlo se persisten las asignaciones nuevas y, si una constelación
 * se acaba de completar, la carta se revela a pantalla completa.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartaLoreView } from '@/components/juego/CartaLoreView';
import { SiluetaConstelacion } from '@/components/juego/SiluetaConstelacion';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  CONSTELACIONES,
  ESTADOS_VACIOS,
  PALETAS,
  SENAL_POR_KEY,
  paletaPorId,
  type Constelacion,
  type PaletaCielo,
  type TipoSenal,
} from '@/content';
import {
  CLAVES,
  estrellasTodas,
  gastarBrasas,
  getSetting,
  otorgarUnlock,
  persistirAsignaciones,
  setSetting,
  tieneUnlock,
} from '@/db/repos';
import { MOTIVOS } from '@/game/brasas';
import {
  computeColecciones,
  expandirReceta,
  type ProgresoConstelacion,
} from '@/game/colecciones';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

type Tab = 'constelaciones' | 'cartas' | 'paletas';

const TABS: { key: Tab; label: string }[] = [
  { key: 'constelaciones', label: 'Constelaciones' },
  { key: 'cartas', label: 'Cartas' },
  { key: 'paletas', label: 'Paletas' },
];

export default function Album() {
  const insets = useSafeAreaInsets();
  const st = useJuego();

  const [tab, setTab] = useState<Tab>('constelaciones');
  const [progresos, setProgresos] = useState<Map<string, ProgresoConstelacion>>(
    new Map(),
  );
  const [carta, setCarta] = useState<{ c: Constelacion; nueva: boolean } | null>(null);
  const [detalle, setDetalle] = useState<Constelacion | null>(null);
  const [tick, setTick] = useState(0);

  const recomputar = useCallback(() => {
    const res = computeColecciones(estrellasTodas(), CONSTELACIONES);
    if (Object.keys(res.asignaciones).length > 0) {
      persistirAsignaciones(res.asignaciones);
    }
    setProgresos(new Map(res.progresos.map((p) => [p.constelacionId, p])));
  }, []);

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      recomputar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recomputar]),
  );

  // La revelación: una carta recién ganada por vez.
  useEffect(() => {
    if (carta) return;
    for (const c of CONSTELACIONES) {
      const p = progresos.get(c.id);
      if (p?.completada && !tieneUnlock('carta', c.id)) {
        otorgarUnlock('carta', c.id);
        setCarta({ c, nueva: true });
        return;
      }
    }
  }, [progresos, carta, tick]);

  const totalDe = (c: Constelacion): { tiene: number; necesita: number } => {
    const p = progresos.get(c.id);
    const necesita = expandirReceta(c.receta).length;
    if (!p) return { tiene: 0, necesita };
    const tiene = Object.values(p.porTipo).reduce((acc, t) => acc + t.tiene, 0);
    return { tiene, necesita };
  };

  const paletaActivaId = paletaPorId(getSetting(CLAVES.paletaActiva)).id;

  const usarPaleta = (p: PaletaCielo) => {
    setSetting(CLAVES.paletaActiva, p.id);
    setTick((t) => t + 1);
  };

  const comprarPaleta = (p: PaletaCielo) => {
    try {
      gastarBrasas(p.precio, MOTIVOS.paleta);
      otorgarUnlock('paleta', p.id);
      setSetting(CLAVES.paletaActiva, p.id);
      haptic.celebrate();
      st.refresh();
      setTick((t) => t + 1);
    } catch {
      // no alcanzan las brasas: el botón ya lo decía, no pasa nada
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Álbum" />

      {/* Las tres pestañas */}
      <View className="mx-5 mt-1 flex-row rounded-full border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => {
          const activa = tab === t.key;
          return (
            <Pressable97
              key={t.key}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              onPress={() => setTab(t.key)}
              className={`flex-1 items-center rounded-full py-2 ${activa ? 'bg-white/10' : ''}`}
            >
              <Text
                className="font-sans-medium text-xs"
                style={{ color: activa ? '#F5F7FA' : '#64748b' }}
              >
                {t.label}
              </Text>
            </Pressable97>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* ------------------------------------------- Constelaciones */}
        {tab === 'constelaciones' && (
          <Animated.View entering={fadeUp}>
            {st.estrellas.length === 0 && (
              <Text className="mb-4 font-sans text-xs leading-5 text-slate-500">
                {ESTADOS_VACIOS.album}
              </Text>
            )}
            <View className="flex-row flex-wrap justify-between">
              {CONSTELACIONES.map((c, i) => {
                const p = progresos.get(c.id);
                const { tiene, necesita } = totalDe(c);
                const completada = p?.completada ?? false;
                return (
                  <Animated.View
                    key={c.id}
                    entering={staggerDelay(i)}
                    className="mb-3 w-[48.5%]"
                  >
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel={`${c.nombre}, ${tiene} de ${necesita}`}
                      onPress={() =>
                        completada ? setCarta({ c, nueva: false }) : setDetalle(c)
                      }
                    >
                      <GlassCard
                        className="items-center px-3 py-4"
                        style={
                          completada
                            ? { borderColor: 'rgba(245, 247, 250, 0.3)' }
                            : undefined
                        }
                      >
                        <SiluetaConstelacion
                          constelacion={c}
                          porTipo={p?.porTipo ?? {}}
                          size={116}
                          completada={completada}
                        />
                        <Text
                          numberOfLines={2}
                          className="mt-2 text-center font-sans-medium text-xs leading-4 text-slate-200"
                        >
                          {c.nombre}
                        </Text>
                        {completada ? (
                          <View className="mt-1.5 flex-row items-center gap-1">
                            <Ionicons name="sparkles" size={10} color="#F5F7FA" />
                            <Text className="font-sans text-[10px] text-plata">
                              completa — ver la carta
                            </Text>
                          </View>
                        ) : (
                          <Text className="mt-1.5 font-mono text-[10px] text-slate-500">
                            {tiene} de {necesita}
                          </Text>
                        )}
                      </GlassCard>
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* --------------------------------------------------- Cartas */}
        {tab === 'cartas' && (
          <Animated.View entering={fadeUp} className="gap-3">
            {CONSTELACIONES.map((c, i) => {
              const ganada = tieneUnlock('carta', c.id);
              if (!ganada) {
                return (
                  <View
                    key={c.id}
                    className="flex-row items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                  >
                    <Ionicons name="lock-closed-outline" size={16} color="#475569" />
                    <View className="flex-1">
                      <Text className="font-sans text-sm text-slate-500">
                        {c.nombre}
                      </Text>
                      <Text className="mt-0.5 font-sans text-[11px] text-slate-600">
                        Se gana completando la constelación.
                      </Text>
                    </View>
                  </View>
                );
              }
              return (
                <Animated.View key={c.id} entering={staggerDelay(i)}>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel={`Carta: ${c.carta.titulo}`}
                    onPress={() => setCarta({ c, nueva: false })}
                  >
                    <GlassCard
                      className="flex-row items-center gap-4 p-4"
                      style={{ borderColor: 'rgba(245, 247, 250, 0.22)' }}
                    >
                      <SiluetaConstelacion
                        constelacion={c}
                        porTipo={progresos.get(c.id)?.porTipo ?? {}}
                        size={56}
                        completada
                      />
                      <View className="flex-1">
                        <Text className="font-serif text-base text-plata">
                          {c.carta.titulo}
                        </Text>
                        <Text className="mt-1 font-sans text-[11px] text-slate-500">
                          {c.nombre} · de «{c.carta.ensayo}»
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color="#64748b" />
                    </GlassCard>
                  </Pressable97>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}

        {/* -------------------------------------------------- Paletas */}
        {tab === 'paletas' && (
          <Animated.View entering={fadeUp}>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 font-sans text-xs leading-5 text-slate-500">
                El cielo migra del negro puro hacia tintes de amanecer.
              </Text>
              <View className="flex-row items-center gap-1.5 pl-4">
                <Ionicons name="flame" size={13} color="#F59E0B" />
                <Text className="font-mono text-sm text-brasa">{st.brasas}</Text>
              </View>
            </View>

            <View className="mt-4 gap-3">
              {PALETAS.map((p, i) => {
                const activa = paletaActivaId === p.id;
                const desbloqueada = p.precio === 0 || tieneUnlock('paleta', p.id);
                const alcanza = st.brasas >= p.precio;
                return (
                  <Animated.View key={p.id} entering={staggerDelay(i)}>
                    <GlassCard
                      className="flex-row items-center gap-4 p-4"
                      style={
                        activa
                          ? { borderColor: 'rgba(245, 247, 250, 0.3)' }
                          : undefined
                      }
                    >
                      <LinearGradient
                        colors={[p.gradiente[0], p.gradiente[1]]}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.14)',
                        }}
                      />
                      <View className="flex-1">
                        <Text className="font-sans-semibold text-sm text-plata">
                          {p.nombre}
                        </Text>
                        <Text className="mt-0.5 font-sans text-[11px] leading-4 text-slate-500">
                          {p.descripcion}
                        </Text>
                      </View>

                      {activa ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="checkmark-circle" size={14} color="#F5F7FA" />
                          <Text className="font-sans text-[11px] text-plata">
                            en tu cielo
                          </Text>
                        </View>
                      ) : desbloqueada ? (
                        <Pressable97
                          accessibilityRole="button"
                          accessibilityLabel={`Usar ${p.nombre}`}
                          onPress={() => usarPaleta(p)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                        >
                          <Text className="font-sans-medium text-xs text-slate-200">
                            Usarla
                          </Text>
                        </Pressable97>
                      ) : (
                        <View className="items-end">
                          <Pressable97
                            accessibilityRole="button"
                            accessibilityLabel={`Comprar ${p.nombre} por ${p.precio} brasas`}
                            onPress={() => comprarPaleta(p)}
                            disabled={!alcanza}
                            className={`flex-row items-center gap-1.5 rounded-full bg-accent px-4 py-2 ${
                              alcanza ? '' : 'opacity-40'
                            }`}
                          >
                            <Ionicons name="flame" size={12} color="#ffffff" />
                            <Text className="font-sans-semibold text-xs text-white">
                              {p.precio}
                            </Text>
                          </Pressable97>
                          {!alcanza && (
                            <Text className="mt-1 font-sans text-[10px] text-slate-600">
                              te faltan {p.precio - st.brasas}
                            </Text>
                          )}
                        </View>
                      )}
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Detalle de una constelación incompleta */}
      {detalle && (
        <Animated.View
          entering={fadeUp}
          className="absolute inset-0 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.92)' }}
        >
          <GlassCard className="w-full items-center p-6">
            <SiluetaConstelacion
              constelacion={detalle}
              porTipo={progresos.get(detalle.id)?.porTipo ?? {}}
              size={150}
            />
            <Text className="mt-3 font-serif text-xl text-plata">{detalle.nombre}</Text>
            <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-400">
              {detalle.descripcion}
            </Text>
            <View className="mt-5 w-full gap-2">
              {(Object.entries(detalle.receta) as [TipoSenal, number][]).map(
                ([tipo, necesita]) => {
                  const s = SENAL_POR_KEY[tipo];
                  const tiene = Math.min(
                    progresos.get(detalle.id)?.porTipo[tipo]?.tiene ?? 0,
                    necesita,
                  );
                  return (
                    <View key={tipo} className="flex-row items-center gap-2.5">
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <Text className="flex-1 font-sans text-xs text-slate-300">
                        {s.label}
                      </Text>
                      <Text
                        className="font-mono text-xs"
                        style={{ color: tiene >= necesita ? s.color : '#64748b' }}
                      >
                        {tiene} de {necesita}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={() => setDetalle(null)}
              className="mt-6 rounded-full border border-white/10 bg-white/5 px-6 py-2.5"
            >
              <Text className="font-sans-medium text-xs text-slate-200">Cerrar</Text>
            </Pressable97>
          </GlassCard>
        </Animated.View>
      )}

      {/* La Carta de Lore, a pantalla completa */}
      {carta && (
        <CartaLoreView
          constelacion={carta.c}
          nueva={carta.nueva}
          onCerrar={() => {
            setCarta(null);
            setTick((t) => t + 1); // por si hay otra recién completada
          }}
        />
      )}
    </View>
  );
}
