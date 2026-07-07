import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/api/client';
import {
  crearInvitacion,
  fetchCirculo,
  fetchMiembros,
  salirCirculo,
  unirseCirculo,
  type CircleInvite,
} from '@/api/circulos';
import { fetchCampanas, CAMPAIGN_STATUS_LABEL } from '@/api/campanas';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { SectionBadge } from '@/components/ui/SectionBadge';
import { GlifoCirculo } from '@/features/circulos/GlifoCirculo';
import { KIND_MAP } from '@/features/circulos/kinds';
import { bloom, fadeUp } from '@/motion/variants';
import { useAuthStore } from '@/stores/auth';
import { haptic } from '@/theme/haptics';
import { PLATA } from '@/theme/tokens';

/**
 * Casa del círculo: glifo, gente, campañas. Quien coordina puede lanzar
 * campañas e invitar con QR. Todo vuelve al mapa.
 */
// M4: feed — el backend todavía no expone mensajes de círculo
// (no hay endpoint en routes-circulos.ts); cuando exista, va acá.
export default function CirculoDetalle() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const [invite, setInvite] = useState<CircleInvite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const circulo = useQuery({
    queryKey: ['circulo', id],
    queryFn: () => fetchCirculo(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const miembros = useQuery({
    queryKey: ['circulo-miembros', id],
    queryFn: () => fetchMiembros(id),
    enabled: circulo.isSuccess,
  });

  // El backend no filtra campañas por círculo (GET /api/campanas no acepta
  // circleId) — traemos todas y filtramos acá. Máx. 200 filas del server.
  const campanas = useQuery({
    queryKey: ['campanas', 'todas'],
    queryFn: () => fetchCampanas({ status: 'todas' }),
    enabled: circulo.isSuccess,
    select: (all) => all.filter((c) => c.circleId === id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['circulo', id] });
    queryClient.invalidateQueries({ queryKey: ['circulo-miembros', id] });
    queryClient.invalidateQueries({ queryKey: ['circulos'] });
  };

  const unirse = useMutation({
    mutationFn: () => unirseCirculo(id),
    onSuccess: () => {
      haptic.celebrate();
      invalidate();
    },
    onError: (e) => setError(e instanceof ApiRequestError ? e.message : 'No pudimos sumarte. Probá de nuevo.'),
  });

  const salir = useMutation({
    mutationFn: () => salirCirculo(id),
    onSuccess: invalidate,
    onError: (e) => setError(e instanceof ApiRequestError ? e.message : 'No pudimos procesar tu salida. Probá de nuevo.'),
  });

  const generarInvite = useMutation({
    mutationFn: () => crearInvitacion(id),
    onSuccess: (data) => {
      haptic.celebrate();
      setInvite(data);
    },
    onError: (e) => setError(e instanceof ApiRequestError ? e.message : 'No pudimos generar la invitación.'),
  });

  const onUnirse = () => {
    if (!useAuthStore.getState().user) {
      router.push('/identidad');
      return;
    }
    setError(null);
    unirse.mutate();
  };

  if (circulo.isLoading) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Círculo" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#94a3b8" />
        </View>
      </View>
    );
  }

  if (circulo.isError || !circulo.data) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="Círculo" />
        <Text className="mt-16 px-6 text-center font-sans text-sm text-slate-400">
          {circulo.error instanceof ApiRequestError
            ? circulo.error.message
            : 'No pudimos cargar el círculo. Probá de nuevo.'}
        </Text>
      </View>
    );
  }

  const c = circulo.data;
  const kindDef = KIND_MAP[c.kind];
  const esCoordinador = c.role === 'coordinador';

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title={c.name} />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Cabecera: glifo + datos */}
        <Animated.View entering={fadeUp} className="items-center py-4">
          <GlifoCirculo id={c.id} size={88} />
          <View className="mt-4 flex-row items-center gap-2">
            <Text className="font-sans-medium text-sm text-slate-300">{kindDef.label}</Text>
            {c.isOfficial && (
              <View className="rounded-full bg-white/10 px-2 py-0.5">
                <Text className="font-sans text-[10px] text-plata">Oficial</Text>
              </View>
            )}
          </View>
          {(c.province || c.theme) && (
            <Text className="mt-1 font-sans text-sm text-slate-500">
              {c.theme ?? `${c.city ? `${c.city}, ` : ''}${c.province}`}
            </Text>
          )}
          <Text className="mt-3 font-mono text-3xl text-plata">{c.memberCount}</Text>
          <Text className="font-sans text-xs text-slate-500">
            {c.memberCount === 1 ? 'persona en el círculo' : 'personas en el círculo'}
          </Text>
          {c.description && (
            <Text className="mt-4 text-center font-sans text-sm leading-6 text-slate-400">
              {c.description}
            </Text>
          )}
        </Animated.View>

        {error && (
          <Text className="mb-3 text-center font-sans text-sm text-senal-basta">{error}</Text>
        )}

        {/* Unirse / salir */}
        {!c.isMember && c.kind !== 'celula' && (
          <AccentButton
            label={unirse.isPending ? 'Sumándote…' : 'Sumarme al círculo'}
            disabled={unirse.isPending}
            onPress={onUnirse}
          />
        )}
        {!c.isMember && c.kind === 'celula' && (
          <GlassCard className="p-4">
            <Text className="font-sans text-sm leading-5 text-slate-400">
              A una célula se entra con invitación de alguien de adentro.
            </Text>
          </GlassCard>
        )}

        {/* Acciones de coordinación */}
        {esCoordinador && (
          <View className="mt-4 gap-3">
            <AccentButton
              label="Lanzar campaña"
              onPress={() => router.push(`/campanas/crear?circleId=${c.id}`)}
            />
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Generar invitación"
              onPress={() => {
                setError(null);
                generarInvite.mutate();
              }}
              disabled={generarInvite.isPending}
            >
              <GlassCard className="flex-row items-center justify-center p-4">
                <Ionicons name="qr-code-outline" size={18} color="#94a3b8" />
                <Text className="ml-2 font-sans-medium text-sm text-slate-200">
                  {generarInvite.isPending ? 'Generando…' : 'Generar invitación'}
                </Text>
              </GlassCard>
            </Pressable97>
          </View>
        )}

        {/* Invitación con QR */}
        {invite && (
          <Animated.View entering={bloom} className="mt-4 items-center">
            <GlassCard className="items-center p-6">
              <View className="rounded-2xl bg-plata p-4">
                <QRCode
                  value={`basta://circulo-invite/${invite.code}`}
                  size={180}
                  color="#0a0a0a"
                  backgroundColor={PLATA}
                />
              </View>
              <Text className="mt-4 font-mono text-lg tracking-widest text-plata">
                {invite.code}
              </Text>
              <Text className="mt-2 text-center font-sans text-xs leading-4 text-slate-500">
                Vale {invite.maxUses ?? 20} usos
                {invite.expiresAt
                  ? ` · vence el ${new Date(invite.expiresAt).toLocaleDateString('es-AR')}`
                  : ''}
                {'\n'}Quien escanea el QR entra directo al círculo.
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Campañas del círculo */}
        <View className="mt-8">
          <SectionBadge>Campañas</SectionBadge>
          {campanas.isLoading && <ActivityIndicator className="mt-4" color="#94a3b8" />}
          {campanas.isSuccess && campanas.data.length === 0 && (
            <Text className="mt-3 font-sans text-sm leading-5 text-slate-400">
              Este círculo todavía no lanzó campañas.
            </Text>
          )}
          <View className="mt-3 gap-3">
            {(campanas.data ?? []).map((campana) => (
              <Pressable97
                key={campana.id}
                accessibilityRole="button"
                accessibilityLabel={campana.title}
                onPress={() => router.push(`/campanas/${campana.id}`)}
              >
                <GlassCard className="p-4">
                  <View className="flex-row items-center">
                    <View
                      className="mr-2 rounded-full"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: campana.mapColor ?? PLATA,
                      }}
                    />
                    <Text
                      className="flex-1 font-sans-semibold text-sm text-white"
                      numberOfLines={1}
                    >
                      {campana.title}
                    </Text>
                    <Text className="font-sans text-xs text-slate-500">
                      {CAMPAIGN_STATUS_LABEL[campana.status]}
                    </Text>
                  </View>
                  <Text className="mt-1 font-sans text-xs text-slate-400">
                    {campana.entryCount}
                    {campana.targetEntries ? ` de ${campana.targetEntries}` : ''} entradas
                  </Text>
                </GlassCard>
              </Pressable97>
            ))}
          </View>
        </View>

        {/* Miembros */}
        <View className="mt-8">
          <SectionBadge>Quiénes somos</SectionBadge>
          {miembros.isLoading && <ActivityIndicator className="mt-4" color="#94a3b8" />}
          <View className="mt-3 gap-2">
            {(miembros.data ?? []).map((m) => (
              <View key={m.userId} className="flex-row items-center px-1 py-1.5">
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text className="ml-2 flex-1 font-sans text-sm text-slate-300" numberOfLines={1}>
                  {m.displayName}
                </Text>
                {m.role === 'coordinador' && (
                  <Text className="font-sans text-[11px] text-slate-500">coordina</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Salir */}
        {c.isMember && (
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Salir del círculo"
            className="mt-8 items-center py-2"
            disabled={salir.isPending}
            onPress={() => {
              setError(null);
              salir.mutate();
            }}
          >
            <Text className="font-sans text-sm text-slate-500">
              {salir.isPending ? 'Saliendo…' : 'Salir del círculo'}
            </Text>
          </Pressable97>
        )}
      </ScrollView>
    </View>
  );
}
