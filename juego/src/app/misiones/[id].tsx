/**
 * Detalle de misión (Mission Layer, §0x01): la máquina de estados en vivo.
 * Toda transición pasa por `transicionar`, que delega en el motor puro
 * (protocolo/mision.ts) — acá sólo se compone, nunca se decide de nuevo.
 * Errores de gobernanza o de transición inválida se muestran como nota
 * inline; jamás un crash, jamás un Alert.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { actorKeyCacheado } from '@/civic/actor-cache';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { oficioPorId } from '@/content/oficios';
import { ahoraISO } from '@/db/repos';
import { misionPorId, registrarLatido, sumarseAMision, transicionar } from '@/db/repos-protocolo';
import { fadeUp } from '@/motion/variants';
import { latidoVencido } from '@/protocolo/pulsos';
import type { EstadoMision, Gobernanza, TipoMision } from '@/protocolo/tipos';
import { haptic } from '@/theme/haptics';

const ESTADO_META: Record<EstadoMision, { label: string; color: string }> = {
  propuesta: { label: 'Convocando', color: '#94A3B8' },
  equipo: { label: 'Equipo listo', color: '#7DD3FC' },
  activa: { label: 'En marcha', color: '#6EE7B7' },
  verificacion: { label: 'En verificación', color: '#FCD34D' },
  resuelta: { label: 'Resuelta', color: '#5EEAD4' },
  abandonada: { label: 'Abandonada', color: '#64748B' },
};

const TIPO_LABEL: Record<TipoMision, string> = {
  relevamiento: 'Relevamiento',
  obra: 'Obra',
  diseno: 'Diseño',
};

const GOBERNANZA_LABEL: Record<Gobernanza, string> = {
  coordinada: 'Coordinada',
  consentimiento: 'Por consentimiento',
};

const notaDeError = (error: unknown): string => {
  const mensaje = error instanceof Error ? error.message : '';
  if (mensaje === 'gobernanza_rechaza') {
    return 'Todavía falta el acuerdo del equipo — la gobernanza de esta misión no da el visto bueno para este paso.';
  }
  if (mensaje === 'transicion_invalida') {
    return 'Ese paso no es válido desde donde está la misión ahora.';
  }
  if (mensaje === 'mision_inexistente') {
    return 'Esta misión ya no está en este dispositivo.';
  }
  return 'Algo no salió. Probá de nuevo en un toque.';
};

export default function MisionDetalle() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [datos, setDatos] = useState(() => (id ? misionPorId(id) : null));
  const [ocupado, setOcupado] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [confirmarAbandono, setConfirmarAbandono] = useState(false);

  const recargar = useCallback(() => {
    setDatos(id ? misionPorId(id) : null);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  const mision = datos?.mision ?? null;
  const miembros = datos?.miembros ?? [];

  if (!mision) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Misión" />
        <View className="flex-1 items-center justify-center px-8">
          <GlassCard className="w-full p-6">
            <Text className="font-serif text-2xl text-plata">No está más.</Text>
            <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
              Esa misión no existe en este dispositivo. Volvé al panel y
              fundá otra — nada es permanente, todo es misión.
            </Text>
          </GlassCard>
        </View>
      </View>
    );
  }

  const oficio = oficioPorId(mision.oficioId);
  // Un estado fuera del enum (dato viejo, migración a medio camino) degrada
  // a una nota neutra en vez de tirar la pantalla abajo.
  const estadoMeta = ESTADO_META[mision.estado as EstadoMision]
    ?? { label: mision.estado, color: '#64748B' };

  const irA = (hacia: EstadoMision, alExito?: () => void) => {
    if (ocupado) return;
    setOcupado(true);
    setNota(null);
    try {
      transicionar(mision.id, hacia);
      recargar();
      alExito?.();
    } catch (error) {
      setNota(notaDeError(error));
    } finally {
      setOcupado(false);
    }
  };

  const sumarme = () => {
    if (ocupado) return;
    setOcupado(true);
    setNota(null);
    try {
      sumarseAMision(mision.id);
      haptic.tick();
      recargar();
    } catch {
      setNota('No pudimos sumarte ahora. Probá de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  const darLatido = () => {
    if (ocupado) return;
    setOcupado(true);
    setNota(null);
    try {
      registrarLatido(mision.id);
      haptic.tick();
      recargar();
    } catch {
      setNota('No pudimos registrar el latido ahora. Probá de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  const resolver = () =>
    irA('resuelta', () => {
      haptic.celebrate();
      router.push({ pathname: '/obras/publicar', params: { misionId: mision.id } } as never);
    });

  const abandonar = () => irA('abandonada', () => setConfirmarAbandono(false));

  const enCurso = ['propuesta', 'equipo', 'activa'].includes(mision.estado);
  const yaEsMiembro = miembros.some((m) => m.actorKey === actorKeyCacheado());

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title={mision.titulo} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View
          entering={fadeUp}
          className="mt-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#121018] p-6"
        >
          <View
            className="flex-row items-center gap-2 self-start rounded-full border px-3 py-1.5"
            style={{ borderColor: `${estadoMeta.color}45`, backgroundColor: `${estadoMeta.color}18` }}
          >
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: estadoMeta.color }} />
            <Text
              className="font-sans-medium text-xs uppercase tracking-[2px]"
              style={{ color: estadoMeta.color }}
            >
              {estadoMeta.label}
            </Text>
          </View>
          <Text className="mt-5 font-serif text-2xl leading-8 text-plata">{mision.titulo}</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">{mision.proposito}</Text>
          <View className="mt-5 flex-row flex-wrap gap-2">
            {oficio && (
              <View
                className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                style={{ borderColor: `${oficio.color}45`, backgroundColor: `${oficio.color}18` }}
              >
                <Ionicons name={oficio.icono as never} size={13} color={oficio.color} />
                <Text className="font-sans text-[11px]" style={{ color: oficio.color }}>
                  {oficio.nombre}
                </Text>
              </View>
            )}
            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Text className="font-sans text-[11px] text-slate-300">
                {TIPO_LABEL[mision.tipo as TipoMision]}
              </Text>
            </View>
            <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Text className="font-sans text-[11px] text-slate-300">
                {GOBERNANZA_LABEL[mision.gobernanza as Gobernanza]}
              </Text>
            </View>
            {mision.territorio && (
              <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Ionicons name="location-outline" size={12} color="#94a3b8" />
                <Text className="font-sans text-[11px] text-slate-300">{mision.territorio}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {nota && (
          <View className="mt-4 flex-row items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <Ionicons name="alert-circle-outline" size={16} color="#FCD34D" />
            <Text className="flex-1 font-sans text-xs leading-5 text-amber-100">{nota}</Text>
          </View>
        )}

        <Text className="mt-8 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
          Equipo · {miembros.length}
        </Text>
        <View className="mt-3 gap-2">
          {miembros.map((m) => {
            const vencido = latidoVencido(m.ultimoLatidoAt, ahoraISO());
            const esVos = m.actorKey === actorKeyCacheado();
            return (
              <View
                key={m.actorKey}
                className="flex-row items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
              >
                <Ionicons
                  name={m.rol === 'coordinador' ? 'star' : 'person-outline'}
                  size={14}
                  color={m.rol === 'coordinador' ? '#FCD34D' : '#64748b'}
                />
                <Text className="flex-1 font-sans text-xs text-slate-300">
                  {m.rol === 'coordinador' ? 'Coordinador/a' : 'Miembro'}
                  {esVos ? ' · vos' : ''}
                </Text>
                {vencido && (
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2 w-2 rounded-full bg-amber-400" />
                    <Text className="font-mono text-[10px] text-amber-300">sin latido</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {mision.estado === 'propuesta' && (
          <View className="mt-8 gap-3">
            <AccentButton
              label={ocupado ? 'Cerrando…' : 'Cerrar convocatoria'}
              onPress={() => irA('equipo')}
              disabled={ocupado}
            />
            {yaEsMiembro ? (
              <Text className="text-center font-sans text-xs text-slate-500">
                Ya sos parte de esta misión.
              </Text>
            ) : (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Sumarme a esta misión"
                onPress={sumarme}
                disabled={ocupado}
                className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
              >
                <Text className="font-sans-medium text-sm text-slate-300">Sumarme</Text>
              </Pressable97>
            )}
          </View>
        )}

        {mision.estado === 'equipo' && (
          <View className="mt-8 items-center">
            <AccentButton
              label={ocupado ? 'Arrancando…' : 'Arrancar'}
              onPress={() => irA('activa')}
              disabled={ocupado}
            />
          </View>
        )}

        {mision.estado === 'activa' && (
          <View className="mt-8 gap-3">
            <AccentButton
              label={ocupado ? 'Presentando…' : 'Presentar resultado'}
              onPress={() => irA('verificacion')}
              disabled={ocupado}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Dar latido — avisar que seguís en esta misión"
              onPress={darLatido}
              disabled={ocupado}
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5"
            >
              <Ionicons name="pulse-outline" size={15} color="#94a3b8" />
              <Text className="font-sans-medium text-sm text-slate-300">Dar latido</Text>
            </Pressable97>
          </View>
        )}

        {mision.estado === 'verificacion' && (
          <View className="mt-8 gap-3">
            <AccentButton
              label={ocupado ? 'Resolviendo…' : 'Aceptar y resolver'}
              onPress={resolver}
              disabled={ocupado}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Volver a activa"
              onPress={() => irA('activa')}
              disabled={ocupado}
              className="min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5"
            >
              <Text className="font-sans-medium text-sm text-slate-300">Volver a activa</Text>
            </Pressable97>
          </View>
        )}

        {(mision.estado === 'resuelta' || mision.estado === 'abandonada') && (
          <GlassCard className="mt-8 p-5">
            <Text className="font-sans text-sm leading-6 text-slate-400">
              {mision.estado === 'resuelta'
                ? 'Esta misión ya se resolvió y quedó disuelta. La obra vive en La Corriente.'
                : 'Esta misión fue abandonada. Nada es permanente — se puede fundar otra.'}
            </Text>
          </GlassCard>
        )}

        {enCurso && (
          <View className="mt-6 items-center">
            {!confirmarAbandono ? (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Abandonar esta misión"
                onPress={() => setConfirmarAbandono(true)}
                disabled={ocupado}
                className="px-4 py-2"
              >
                <Text className="font-sans text-xs text-slate-500">Abandonar</Text>
              </Pressable97>
            ) : (
              <View className="w-full rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-4">
                <Text className="font-sans text-xs leading-5 text-rose-100">
                  ¿Seguro que la querés abandonar? La misión se cierra y no vuelve atrás.
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar, no abandonar"
                    onPress={() => setConfirmarAbandono(false)}
                    disabled={ocupado}
                    className="min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
                  >
                    <Text className="font-sans-semibold text-xs text-slate-300">Cancelar</Text>
                  </Pressable97>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Confirmar abandono de la misión"
                    onPress={abandonar}
                    disabled={ocupado}
                    className="min-h-11 flex-1 items-center justify-center rounded-xl border border-rose-300/25 bg-rose-300/10"
                  >
                    <Text className="font-sans-semibold text-xs text-rose-100">
                      {ocupado ? 'Abandonando…' : 'Sí, abandonar'}
                    </Text>
                  </Pressable97>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
