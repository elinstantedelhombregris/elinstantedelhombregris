/**
 * Álbum (spec §3.1, §3.3): las ocho constelaciones dibujándose solas a
 * medida que capturás; las Cartas de Lore ya ganadas; y las Paletas del
 * Cielo, que migran el fondo del negro puro hacia tintes de amanecer.
 * Al abrirlo se persisten las asignaciones nuevas y, si una constelación
 * se acaba de completar, la carta se revela a pantalla completa.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): solapas como
 * ChipTipo, constelaciones y cartas sobre PapelCard suave, oficios con
 * palitos por obra (sin color: spec §2), paletas con swatch cuadrado.
 * El gradiente del swatch se queda: no es chrome, es el producto — el
 * cielo nocturno que se compra.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartaLoreView } from '@/components/juego/CartaLoreView';
import { SiluetaConstelacion } from '@/components/juego/SiluetaConstelacion';
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
import { constelacionesDeOficio } from '@/db/repos-protocolo';
import { MOTIVOS } from '@/game/brasas';
import {
  computeColecciones,
  expandirReceta,
  type ProgresoConstelacion,
} from '@/game/colecciones';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { type NivelBrillo } from '@/protocolo/brillo';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { TINTA, TINTA_50 } from '@/theme/tokens';

type Tab = 'constelaciones' | 'cartas' | 'paletas' | 'oficios';

const TABS: { key: Tab; label: string }[] = [
  { key: 'constelaciones', label: 'Constelaciones' },
  { key: 'cartas', label: 'Cartas' },
  { key: 'paletas', label: 'Paletas' },
  { key: 'oficios', label: 'Oficios' },
];

const NOMBRE_NIVEL: Record<NivelBrillo, string> = {
  apagada: 'constelación apagada',
  tenue: 'constelación tenue',
  viva: 'constelación viva',
  radiante: 'constelación radiante',
};

/** Palitos legibles: más allá se dibuja el tope y el número mono manda. */
const TOPE_PALITOS_OFICIO = 30;

const pad = (n: number): string => String(n).padStart(3, '0');

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
  const [oficios, setOficios] = useState<ReturnType<typeof constelacionesDeOficio>>([]);

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
      setOficios(constelacionesDeOficio());
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
    // one-shot: si ya es tuya, un doble toque no la cobra de nuevo
    if (tieneUnlock('paleta', p.id)) return;
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
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <Kicker>lo que la calle te fue dejando</Kicker>
        <TituloAnton entintar tamano="lg" className="mt-1">
          Álbum
        </TituloAnton>
      </View>

      {/* Las solapas */}
      <View className="mt-4 flex-row flex-wrap gap-2 px-5">
        {TABS.map((t) => (
          <ChipTipo
            key={t.key}
            etiqueta={t.label}
            activo={tab === t.key}
            onPress={() => setTab(t.key)}
          />
        ))}
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
              <Text className="mb-4 font-archivo text-xs leading-5 text-tinta-75">
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
                      <PapelCard
                        variante="suave"
                        className={`items-center px-3 py-4 ${completada ? 'border-tinta' : ''}`}
                      >
                        <SiluetaConstelacion
                          constelacion={c}
                          porTipo={p?.porTipo ?? {}}
                          size={116}
                          completada={completada}
                        />
                        <Text
                          numberOfLines={2}
                          className="mt-2 text-center font-archivo-bold text-xs leading-4 text-tinta"
                        >
                          {c.nombre}
                        </Text>
                        {completada ? (
                          <Text className="mt-1.5 font-space text-[10px] text-violeta">
                            completa — ver la carta
                          </Text>
                        ) : (
                          <Text className="mt-1.5 font-space text-[10px] text-tinta-50">
                            {tiene} de {necesita}
                          </Text>
                        )}
                      </PapelCard>
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* --------------------------------------------------- Cartas */}
        {tab === 'cartas' && (
          <Animated.View entering={fadeUp}>
            {CONSTELACIONES.map((c, i) => {
              const ganada = tieneUnlock('carta', c.id);
              if (!ganada) {
                return (
                  <View
                    key={c.id}
                    className="flex-row items-baseline gap-5 border-b border-bordeSuave px-2 py-4"
                  >
                    <Text className="w-14 font-space text-[11px] text-tinta-30">
                      {pad(i + 1)}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-archivo text-sm text-tinta-50">
                        {c.nombre}
                      </Text>
                      <Text className="mt-0.5 font-archivo text-[11px] text-tinta-30">
                        Se gana completando la constelación.
                      </Text>
                    </View>
                  </View>
                );
              }
              return (
                <Animated.View key={c.id} entering={staggerDelay(i)}>
                  <FilaIndice
                    numero={pad(i + 1)}
                    accessibilityLabel={`Carta: ${c.carta.titulo}`}
                    onPress={() => setCarta({ c, nueva: false })}
                  >
                    <Text className="font-archivo-bold text-base text-tinta">
                      {c.carta.titulo}
                    </Text>
                    <Text className="mt-1 font-space text-[11px] text-tinta-50">
                      {c.nombre} · de «{c.carta.ensayo}»
                    </Text>
                  </FilaIndice>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}

        {/* -------------------------------------------------- Paletas */}
        {tab === 'paletas' && (
          <Animated.View entering={fadeUp}>
            <View className="flex-row items-baseline justify-between">
              <Text className="flex-1 font-archivo text-xs leading-5 text-tinta-75">
                El cielo migra del negro puro hacia tintes de amanecer.
              </Text>
              <Text className="pl-4 font-space text-sm text-tinta">
                {st.brasas} brasas
              </Text>
            </View>

            <View className="mt-4 gap-3">
              {PALETAS.map((p, i) => {
                const activa = paletaActivaId === p.id;
                const desbloqueada = p.precio === 0 || tieneUnlock('paleta', p.id);
                const alcanza = st.brasas >= p.precio;
                return (
                  <Animated.View key={p.id} entering={staggerDelay(i)}>
                    <PapelCard className={`flex-row items-center gap-4 p-4 ${activa ? 'border-tinta' : ''}`}>
                      <LinearGradient
                        colors={[p.gradiente[0], p.gradiente[1]]}
                        style={{
                          width: 52,
                          height: 52,
                          borderWidth: 1,
                          borderColor: TINTA,
                        }}
                      />
                      <View className="flex-1">
                        <Text className="font-archivo-bold text-sm text-tinta">
                          {p.nombre}
                        </Text>
                        <Text className="mt-0.5 font-archivo text-[11px] leading-4 text-tinta-50">
                          {p.descripcion}
                        </Text>
                      </View>

                      {activa ? (
                        <ChipTipo etiqueta="En tu cielo" activo />
                      ) : desbloqueada ? (
                        <BotonTinta
                          etiqueta="Usarla"
                          variante="fantasma"
                          tamano="compacto"
                          accessibilityLabel={`Usar ${p.nombre}`}
                          onPress={() => usarPaleta(p)}
                        />
                      ) : (
                        <View className="items-end">
                          <BotonTinta
                            etiqueta={`${p.precio} brasas`}
                            tamano="compacto"
                            accessibilityLabel={`Comprar ${p.nombre} por ${p.precio} brasas`}
                            onPress={() => comprarPaleta(p)}
                            disabled={!alcanza}
                          />
                          {!alcanza && (
                            <Text className="mt-1 font-space text-[10px] text-tinta-50">
                              te faltan {p.precio - st.brasas}
                            </Text>
                          )}
                        </View>
                      )}
                    </PapelCard>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* -------------------------------------------------- Oficios */}
        {tab === 'oficios' && (
          <Animated.View entering={fadeUp}>
            {(() => {
              const conObras = oficios.filter((o) => o.obras > 0);
              const vacios = oficios.length - conObras.length;
              if (conObras.length === 0) {
                return (
                  <Text className="font-archivo text-xs leading-5 text-tinta-75">
                    Cuando tu primera obra exista, acá va a nacer su constelación de
                    oficio.
                  </Text>
                );
              }
              return (
                <>
                  <View className="gap-3">
                    {conObras.map((o, i) => (
                      <Animated.View key={o.oficio.id} entering={staggerDelay(i)}>
                        <PapelCard variante="suave" className="p-4">
                          <View className="flex-row items-baseline justify-between gap-3">
                            <Text className="flex-1 font-archivo-bold text-sm text-tinta">
                              {o.oficio.nombre}
                            </Text>
                            <Text className="font-space text-[11px] text-tinta-50">
                              {o.obras} {o.obras === 1 ? 'obra' : 'obras'}
                            </Text>
                          </View>
                          <View className="mt-3 flex-row items-center justify-between gap-3">
                            <Palitos total={Math.min(o.obras, TOPE_PALITOS_OFICIO)} />
                            <Text className="font-space text-[10px] lowercase text-tinta-50">
                              {NOMBRE_NIVEL[o.nivel]}
                            </Text>
                          </View>
                        </PapelCard>
                      </Animated.View>
                    ))}
                  </View>
                  {vacios > 0 && (
                    <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">
                      Los demás oficios esperan su primera obra.
                    </Text>
                  )}
                </>
              );
            })()}
          </Animated.View>
        )}
      </ScrollView>

      {/* Detalle de una constelación incompleta */}
      {detalle && (
        <Animated.View
          entering={fadeUp}
          className="absolute inset-0 items-center justify-center bg-papel/95 px-6"
        >
          <PapelCard className="w-full items-center border-tinta p-6">
            <SiluetaConstelacion
              constelacion={detalle}
              porTipo={progresos.get(detalle.id)?.porTipo ?? {}}
              size={150}
            />
            <TituloAnton tamano="md" className="mt-3 text-center">
              {detalle.nombre}
            </TituloAnton>
            <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-75">
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
                        className="h-2 w-2"
                        style={{ backgroundColor: s.color }}
                      />
                      <Text className="flex-1 font-archivo text-xs text-tinta-90">
                        {s.label}
                      </Text>
                      <Text
                        className="font-space text-xs"
                        style={{ color: tiene >= necesita ? s.color : TINTA_50 }}
                      >
                        {tiene} de {necesita}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
            <View className="mt-6">
              <BotonTinta
                etiqueta="Cerrar"
                variante="fantasma"
                tamano="compacto"
                onPress={() => setDetalle(null)}
              />
            </View>
          </PapelCard>
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
