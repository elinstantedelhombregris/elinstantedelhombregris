/**
 * Detalle de expedición (spec §3.2): el progreso como luminosidad, los
 * hitos 25/50/100, el rito de cada captura — y el botón CAPTURAR, que
 * recorre los pasos de la plantilla con su micro-UI propia. Cada captura
 * es una entrada (+3), hace nacer una estrella en el Cielo y enciende la
 * luz de ENCENDER si faltaba.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraLuminosa } from '@/components/juego/BarraLuminosa';
import { MicroUIPaso, pasoValido, type ValorPaso } from '@/components/juego/MicroUIPaso';
import { RangoUpOverlay } from '@/components/juego/RangoUpOverlay';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import {
  CAPTURA,
  PLANTILLAS_EXPEDICION,
  SENAL_POR_KEY,
  type MicroUI,
} from '@/content';
import {
  agregarEntradaExpedicion,
  crearEstrella,
  entradasDeExpedicion,
  expedicionPorId,
  hoyLocal,
  marcarLuz,
} from '@/db/repos';
import type { ExpeditionEntryRow, ExpeditionRow } from '@/db/schema';
import { obtenerCoords } from '@/lib/capturar-gps';
import {
  BRASAS_POR_HITO,
  HITOS,
  progresoExpedicion,
  resumenDeCaptura,
} from '@/game/expediciones';
import type { Rango } from '@/game/types';
import { bloom, fadeIn, fadeUp, slideLeftIn } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { chequearAscensoRango } from '@/stores/rangos-check';
import { haptic } from '@/theme/haptics';

/** stepKey canónico: una entrada = una captura completa (todos los pasos). */
const STEP_KEY_CAPTURA = 'captura';

const ICONO_MICROUI: Record<MicroUI, string> = {
  'foto-guiada': 'camera-outline',
  contador: 'keypad-outline',
  'rating-soles': 'sunny-outline',
  chips: 'apps-outline',
  'texto-corto': 'create-outline',
};

const LINEA_HITO: Record<number, string> = {
  25: 'Un cuarto del camino. El barrio ya se empieza a ver.',
  50: 'La mitad. Lo que era sensación ya es dato.',
  100: 'Meta cumplida. Esto ya es un mapa: mostralo, usalo, pasalo.',
};

interface MomentoHito {
  hito: number;
  brasas: number;
  completa: boolean;
}

export default function ExpedicionDetalle() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const st = useJuego();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Carga sincrónica inicial (la DB ya migró bajo el gate): sin parpadeo.
  const [exp, setExp] = useState<ExpeditionRow | null>(() =>
    id ? expedicionPorId(id) : null,
  );
  const [entradas, setEntradas] = useState<ExpeditionEntryRow[]>(() =>
    id ? entradasDeExpedicion(id) : [],
  );

  const recargar = useCallback(() => {
    if (!id) return;
    setExp(expedicionPorId(id));
    setEntradas(entradasDeExpedicion(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      st.refresh();
      recargar();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recargar]),
  );

  // El rito de captura
  const [capturando, setCapturando] = useState(false);
  const [pasoIdx, setPasoIdx] = useState(0);
  const [valores, setValores] = useState<Record<string, ValorPaso>>({});
  const [naciendo, setNaciendo] = useState(false);

  // Celebraciones
  const [momento, setMomento] = useState<MomentoHito | null>(null);
  const [ascenso, setAscenso] = useState<Rango | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  // El hito cruzado celebra con el cuerpo, no solo con la vista.
  useEffect(() => {
    if (momento) haptic.celebrate();
  }, [momento]);

  const plantilla = exp
    ? PLANTILLAS_EXPEDICION.find((p) => p.id === exp.plantillaId)
    : undefined;

  if (!exp || !plantilla) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Expedición" />
        <View className="flex-1 items-center justify-center px-7">
          <GlassCard className="w-full p-6">
            <Text className="font-serif text-2xl text-plata">No está más.</Text>
            <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
              Esa expedición no existe en este dispositivo. Volvé al panel y
              fundá otra: el barrio no se termina.
            </Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  const senal = SENAL_POR_KEY[plantilla.senal];
  const color = senal.color;
  const { porcentaje } = progresoExpedicion(entradas.length, exp.meta);
  const hitosOtorgados = JSON.parse(exp.hitosOtorgados) as number[];
  const activa = exp.estado === 'activa';

  const paso = plantilla.pasos[pasoIdx];
  const ultimoPaso = pasoIdx === plantilla.pasos.length - 1;

  const empezarCaptura = () => {
    setValores({});
    setPasoIdx(0);
    setCapturando(true);
  };

  const capturar = async () => {
    if (naciendo) return;
    setNaciendo(true);
    try {
      const coords = await obtenerCoords(); // jamás bloquea más de 3 s
      const data = { ...valores };
      const pasoFoto = plantilla.pasos.find((p) => p.microUI === 'foto-guiada');
      const foto = pasoFoto ? data[pasoFoto.key] : null;
      const mult = multiplicadorHoy();

      const star = crearEstrella({
        tipo: plantilla.senal,
        texto: resumenDeCaptura(plantilla.pasos, data),
        photoUri: typeof foto === 'string' ? foto : null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        expeditionId: exp.id,
        expeditionStepKey: STEP_KEY_CAPTURA,
        eventoActivo: st.eventoHoy !== null,
      });
      const resultado = agregarEntradaExpedicion(
        exp.id,
        STEP_KEY_CAPTURA,
        data,
        star.id,
        { multiplicador: mult },
      );
      marcarLuz(hoyLocal(), 'encender', { multiplicador: mult });

      useJuego.getState().setNewStar(star.id);
      if (resultado.hitosNuevos.length === 0) haptic.celebrate();
      st.refresh();
      const nuevoRango = chequearAscensoRango();
      recargar();

      setCapturando(false);
      setValores({});
      setPasoIdx(0);

      if (resultado.hitosNuevos.length > 0) {
        setMomento({
          hito: Math.max(...resultado.hitosNuevos),
          brasas: resultado.brasasGanadas,
          completa: resultado.estado === 'completa',
        });
        if (nuevoRango) setAscenso(nuevoRango); // se muestra al cerrar el hito
      } else if (nuevoRango) {
        setAscenso(nuevoRango);
      } else {
        setAviso(CAPTURA.nacimientoEstrella);
      }
    } finally {
      setNaciendo(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title={exp.titulo}
        right={
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Pasarla por QR"
            onPress={() =>
              router.push({ pathname: '/qr', params: { expedicionId: exp.id } })
            }
            className="mr-3 rounded-full border border-white/10 bg-white/5 p-2"
          >
            <Ionicons name="qr-code-outline" size={16} color="#94a3b8" />
          </Pressable97>
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {!capturando ? (
            <Animated.View entering={fadeUp}>
              <View className="mt-1 flex-row items-center gap-2">
                <Ionicons name={senal.icon as never} size={14} color={color} />
                <Text
                  className="font-sans text-[11px] uppercase tracking-[3px]"
                  style={{ color }}
                >
                  {senal.label}
                </Text>
                <Text className="font-sans text-[11px] text-slate-500">
                  · {exp.zona}
                </Text>
              </View>

              {/* El progreso luminoso */}
              <GlassCard className="mt-4 p-5">
                <View className="flex-row items-end justify-between">
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="font-mono text-4xl" style={{ color }}>
                      {entradas.length}
                    </Text>
                    <Text className="font-sans text-sm text-slate-400">
                      de {exp.meta}
                    </Text>
                  </View>
                  <Text className="font-mono text-sm text-slate-400">
                    {porcentaje}%
                  </Text>
                </View>
                <View className="mt-4">
                  <BarraLuminosa
                    alta
                    porcentaje={porcentaje}
                    color={color}
                    hitosOtorgados={hitosOtorgados}
                  />
                </View>
                <View className="mt-3 flex-row justify-between">
                  {HITOS.map((h) => {
                    const encendido = hitosOtorgados.includes(h) || porcentaje >= h;
                    return (
                      <Text
                        key={h}
                        className="font-mono text-[10px]"
                        style={{ color: encendido ? color : '#475569' }}
                      >
                        {h}% · +{BRASAS_POR_HITO[h]}
                      </Text>
                    );
                  })}
                </View>
              </GlassCard>

              {/* El acto central */}
              {activa ? (
                <View className="mt-6 items-center">
                  <AccentButton label="Capturar" onPress={empezarCaptura} />
                  <Text className="mt-3 font-sans text-[11px] text-slate-500">
                    Cada captura suma una entrada, tres brasas y una estrella.
                  </Text>
                </View>
              ) : (
                <GlassCard className="mt-6 p-5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={18} color={color} />
                    <Text className="font-sans-semibold text-sm text-plata">
                      Expedición completa
                    </Text>
                  </View>
                  <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">
                    La meta está cumplida y el mapa quedó hecho. Fundá otra, o
                    llevá esta misma a otra zona.
                  </Text>
                </GlassCard>
              )}

              {/* El rito de cada captura */}
              <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                El rito de cada captura
              </Text>
              <View className="mt-3 gap-2.5">
                {plantilla.pasos.map((p, i) => (
                  <GlassCard key={p.key} className="flex-row items-center gap-3 p-4">
                    <Text className="font-mono text-xs text-slate-500">
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-sans-medium text-sm text-slate-200">
                        {p.titulo}
                      </Text>
                      <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
                        {p.instruccion}
                      </Text>
                    </View>
                    <Ionicons
                      name={ICONO_MICROUI[p.microUI] as never}
                      size={16}
                      color="#64748b"
                    />
                  </GlassCard>
                ))}
              </View>

              {/* Lo último capturado */}
              {entradas.length > 0 && (
                <>
                  <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
                    Lo último capturado
                  </Text>
                  <View className="mt-3 gap-2">
                    {[...entradas]
                      .slice(-3)
                      .reverse()
                      .map((e) => {
                        const data = JSON.parse(e.data) as Record<string, unknown>;
                        const resumen = resumenDeCaptura(plantilla.pasos, data);
                        return (
                          <View
                            key={e.id}
                            className="flex-row items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                          >
                            <View
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <Text
                              numberOfLines={1}
                              className="flex-1 font-sans text-xs text-slate-300"
                            >
                              {resumen ?? 'Una captura sin palabras'}
                            </Text>
                            <Text className="font-mono text-[10px] text-slate-600">
                              {e.createdAt.slice(0, 10)}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </>
              )}
            </Animated.View>
          ) : (
            /* ------------------------------------------ el rito, en vivo */
            <View>
              <View className="mt-1 flex-row items-center justify-between">
                <SectionBadge>{`Captura — paso ${pasoIdx + 1} de ${plantilla.pasos.length}`}</SectionBadge>
                <Pressable97
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar la captura"
                  onPress={() => setCapturando(false)}
                  className="rounded-full border border-white/10 bg-white/5 p-2"
                >
                  <Ionicons name="close" size={16} color="#94a3b8" />
                </Pressable97>
              </View>

              {paso && (
                <Animated.View key={paso.key} entering={slideLeftIn} className="mt-7">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={senal.icon as never} size={14} color={color} />
                    <Text
                      className="font-sans text-[11px] uppercase tracking-[3px]"
                      style={{ color }}
                    >
                      {paso.titulo}
                    </Text>
                  </View>
                  <Text className="mt-4 font-serif text-2xl leading-9 text-plata">
                    {paso.instruccion}
                  </Text>

                  <MicroUIPaso
                    paso={paso}
                    color={color}
                    valor={valores[paso.key]}
                    onCambiar={(v) =>
                      setValores((prev) => ({ ...prev, [paso.key]: v }))
                    }
                  />

                  <View className="mt-10 items-center">
                    <AccentButton
                      label={
                        ultimoPaso
                          ? naciendo
                            ? 'Naciendo…'
                            : 'Que nazca'
                          : paso.microUI === 'foto-guiada' &&
                              typeof valores[paso.key] !== 'string'
                            ? 'Seguir sin foto'
                            : 'Siguiente'
                      }
                      onPress={() =>
                        ultimoPaso ? capturar() : setPasoIdx((i) => i + 1)
                      }
                      disabled={naciendo || !pasoValido(paso, valores[paso.key])}
                    />
                    {pasoIdx > 0 && (
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel="Paso anterior"
                        onPress={() => setPasoIdx((i) => i - 1)}
                        className="mt-4 px-4 py-2"
                      >
                        <Text className="font-sans text-xs text-slate-500">
                          ← Paso anterior
                        </Text>
                      </Pressable97>
                    )}
                  </View>
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Aviso suave: nació la estrella */}
      {aviso && !momento && !ascenso && (
        <Animated.View
          entering={fadeUp}
          className="absolute left-6 right-6"
          style={{ bottom: insets.bottom + 20 }}
        >
          <GlassCard className="flex-row items-center gap-2.5 px-4 py-3">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <Text className="flex-1 font-sans text-xs text-slate-200">{aviso}</Text>
          </GlassCard>
        </Animated.View>
      )}

      {/* El hito cruzado — momento celebratorio inline */}
      {momento && (
        <Animated.View
          entering={fadeIn}
          className="absolute inset-0 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.82)' }}
        >
          <Animated.View entering={bloom} className="items-center">
            <Text className="font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              {momento.completa ? 'Expedición completa' : `Hito del ${momento.hito}%`}
            </Text>
            <Text className="mt-6 font-mono text-5xl" style={{ color }}>
              +{momento.brasas}
            </Text>
            <Text className="mt-1 font-sans text-xs text-slate-500">brasas</Text>
            <Text className="mt-8 text-center font-serif-italic text-2xl leading-9 text-plata">
              {LINEA_HITO[momento.completa ? 100 : momento.hito]}
            </Text>
            <View className="mt-10">
              <AccentButton label="Seguir" onPress={() => setMomento(null)} />
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Ascenso de rango, si el hito lo empujó */}
      {ascenso && !momento && (
        <RangoUpOverlay rango={ascenso} onCerrar={() => setAscenso(null)} />
      )}
    </View>
  );
}
