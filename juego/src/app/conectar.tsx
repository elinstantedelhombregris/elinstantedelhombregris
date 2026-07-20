import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LivingHalo } from '@/components/civic/LivingHalo';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { civicCategoryLabel } from '@/civic/labels';
import { contextAttributionSummary, recordContextFor } from '@/civic/record-context';
import {
  createMatch,
  matchesAll,
  needsAll,
  resourcesAll,
  suggestMatches,
  type MatchSuggestion,
} from '@/civic/repo';
import { syncCivicNetwork } from '@/civic/sync';
import {
  connectionEmptyState,
  type CivicNetworkState,
} from '@/civic/workflow-navigation';
import type { CivicMatchRow } from '@/db/schema';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { haptic } from '@/theme/haptics';

const MATCH_STATUS: Record<CivicMatchRow['status'], string> = {
  proposed: 'Propuesta abierta',
  accepted: 'Acuerdo bilateral',
  in_progress: 'En coordinación',
  fulfilled: 'Entrega declarada',
  confirmed: 'Impacto confirmado',
  declined: 'No acordado',
  cancelled: 'Retirado',
};

const safeTitle = (value: string): string => value
  .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[dato protegido]')
  .replace(/(?:\+?\d[\s().-]*){7,}\d/g, '[dato protegido]')
  .trim();

export default function Conectar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [matches, setMatches] = useState<CivicMatchRow[]>([]);
  const [networkState, setNetworkState] = useState<CivicNetworkState>('checking');

  const refresh = useCallback(() => {
    setSuggestions(suggestMatches());
    setMatches(matchesAll());
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
    syncCivicNetwork().then(({ pulled }) => {
      setNetworkState(!pulled.configured ? 'local' : pulled.linked ? 'connected' : 'link_required');
      refresh();
    });
  }, [refresh]));

  const needs = new Map(needsAll().map((item) => [item.id, item]));
  const resources = new Map(resourcesAll().map((item) => [item.id, item]));
  const proposedPairs = new Set(matches.map((item) => `${item.needId}:${item.resourceId}`));
  const freshSuggestions = suggestions.filter((item) => !proposedPairs.has(`${item.need.id}:${item.resource.id}`));
  const activeMatches = matches.filter((item) => !['confirmed', 'cancelled', 'declined'].includes(item.status));
  const closedMatches = matches.filter((item) => ['confirmed', 'cancelled', 'declined'].includes(item.status));
  const emptyState = connectionEmptyState(networkState);

  const openRoom = (id: string) => {
    router.push({ pathname: '/tramas/[id]', params: { id } });
  };

  const propose = (suggestion: MatchSuggestion) => {
    const match = createMatch(suggestion);
    haptic.send();
    refresh();
    openRoom(match.id);
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Conectar" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={fadeUp} className="mt-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#111015] p-6">
          <LivingHalo color="#34D399" />
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-sans text-[10px] uppercase tracking-[2.5px] text-emerald-300">Tejido de apoyo mutuo</Text>
            {activeMatches.length > 0 && (
              <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Text className="font-mono text-[9px] text-slate-300">{activeMatches.length} {activeMatches.length === 1 ? 'PUENTE' : 'PUENTES'}</Text>
              </View>
            )}
          </View>
          <Text className="mt-4 font-serif text-[32px] leading-[41px] text-plata">La afinidad propone. La confianza se construye.</Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">Cada coincidencia abre una sala protegida: razones visibles, acuerdo de ambos lados, entrega y confirmación independiente.</Text>
          <View className="mt-5 flex-row items-center gap-2">
            <Ionicons name="shield-checkmark-outline" size={15} color="#6EE7B7" />
            <Text className="font-sans text-[10px] text-emerald-100/70">Sin teléfonos, correos ni coordenadas exactas</Text>
          </View>
        </Animated.View>

        {activeMatches.length > 0 && (
          <>
            <View className="mt-8 flex-row items-end justify-between">
              <View>
                <Text className="font-sans text-[10px] uppercase tracking-[3px] text-slate-500">Tramas en movimiento</Text>
                <Text className="mt-2 font-serif text-2xl text-plata">Puentes con memoria</Text>
              </View>
              <Ionicons name="git-merge-outline" size={21} color="#64748B" />
            </View>
            <View className="mt-4 gap-3">
              {activeMatches.map((match, index) => {
                const need = needs.get(match.needId);
                const resource = resources.get(match.resourceId);
                if (!need || !resource) return null;
                const bothAccepted = Boolean(match.acceptedNeedAt && match.acceptedResourceAt);
                const resourceContext = recordContextFor('resource', resource.id);
                return (
                  <Animated.View key={match.id} entering={staggerDelay(index)}>
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir sala del puente entre ${safeTitle(need.title)} y ${safeTitle(resource.title)}`}
                      onPress={() => openRoom(match.id)}
                      className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] p-5"
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-3 py-1.5">
                          <Text className="font-mono text-[9px] uppercase tracking-[1px] text-emerald-200">AFINIDAD {match.score}%</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bothAccepted ? '#6EE7B7' : '#FCD34D' }} />
                          <Text className="font-sans text-[9px] uppercase tracking-[1px] text-slate-500">{MATCH_STATUS[match.status]}</Text>
                        </View>
                      </View>
                      <View className="mt-5 flex-row items-stretch gap-3">
                        <View className="w-8 items-center">
                          <View className="h-7 w-7 items-center justify-center rounded-full bg-amber-300/10"><Ionicons name="hand-left-outline" size={13} color="#FCD34D" /></View>
                          <View className="my-1 w-px flex-1 bg-emerald-300/25" />
                          <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-300/10"><Ionicons name="gift-outline" size={13} color="#6EE7B7" /></View>
                        </View>
                        <View className="flex-1 py-0.5">
                          <Text className="font-serif text-xl leading-7 text-plata">{safeTitle(need.title)}</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">{civicCategoryLabel(need.category)} · urgencia {need.urgency}/5</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">{need.locationLabel ?? 'Lugar por acordar'}</Text>
                          <View className="my-4 h-px bg-white/[0.07]" />
                          <Text className="font-sans-semibold text-sm leading-5 text-emerald-100">{safeTitle(resource.title)}</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">Recurso dentro de un radio acordado</Text>
                          <Text className="mt-1 font-sans text-[10px] text-slate-500">{resource.locationLabel ?? 'Zona sin nombre'} · {contextAttributionSummary(resourceContext)}</Text>
                        </View>
                      </View>
                      <View className="mt-5 flex-row items-center justify-between border-t border-white/[0.07] pt-4">
                        <Text className="font-sans-medium text-xs text-violet-200">Entrar a la sala</Text>
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-violet-300/10"><Ionicons name="arrow-forward" size={15} color="#C4B5FD" /></View>
                      </View>
                    </Pressable97>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}

        <View className="mt-9">
          <Text className="font-sans text-[10px] uppercase tracking-[3px] text-slate-500">Nuevas coincidencias</Text>
          <Text className="mt-2 font-serif text-2xl text-plata">Razones antes que promesas</Text>
        </View>
        {freshSuggestions.length > 0 ? (
          <View className="mt-4 gap-3">
            {freshSuggestions.slice(0, 8).map((suggestion, index) => (
              <Animated.View key={`${suggestion.need.id}:${suggestion.resource.id}`} entering={staggerDelay(index)}>
                <GlassCard className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-sans text-[9px] uppercase tracking-[2px] text-slate-500">Coincidencia posible</Text>
                      <Text className="mt-3 font-serif text-xl leading-7 text-plata">{safeTitle(suggestion.need.title)}</Text>
                      <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">puede conectarse con <Text className="text-emerald-200">{safeTitle(suggestion.resource.title)}</Text></Text>
                    </View>
                    <View className="items-center rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                      <Text className="font-mono text-2xl text-plata">{suggestion.score}</Text>
                      <Text className="font-sans text-[8px] uppercase tracking-[1px] text-slate-600">afinidad</Text>
                    </View>
                  </View>
                  <View className="mt-4 gap-2">
                    <View className="flex-row items-start gap-2">
                      <Ionicons name="location-outline" size={14} color="#C4B5FD" />
                      <Text className="flex-1 font-sans text-[11px] leading-[18px] text-slate-400">
                        {suggestion.need.locationLabel ?? 'Necesidad sin zona'} ↔ {suggestion.resource.locationLabel ?? 'Recurso sin zona'}
                      </Text>
                    </View>
                    {suggestion.reasons.slice(0, 4).map((reason) => (
                      <View key={reason} className="flex-row items-start gap-2">
                        <Ionicons name="checkmark-circle-outline" size={14} color="#6EE7B7" />
                        <Text className="flex-1 font-sans text-[11px] leading-[18px] text-slate-500">{safeTitle(reason)}</Text>
                      </View>
                    ))}
                  </View>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Proponer puente y abrir sala segura"
                    onPress={() => propose(suggestion)}
                    className="mt-5 flex-row items-center justify-between rounded-full bg-violet-500 px-5 py-3.5"
                  >
                    <Text className="font-sans-semibold text-xs text-white">Proponer y abrir sala</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                  </Pressable97>
                  <Text className="mt-3 text-center font-sans text-[9px] leading-4 text-slate-600">Proponer no obliga: cada parte deberá aceptar por separado.</Text>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        ) : activeMatches.length === 0 ? (
          <GlassCard className="mt-4 items-center p-7">
            <View className="h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5"><Ionicons name="git-merge-outline" size={24} color="#64748B" /></View>
            <Text className="mt-5 text-center font-serif text-2xl text-plata">{emptyState.title}</Text>
            <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-400">
              {emptyState.description}
            </Text>
            {emptyState.primary && (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={emptyState.primary.label}
                onPress={() => router.push(emptyState.primary!.route)}
                className="mt-5 rounded-full border border-violet-300/20 bg-violet-300/10 px-5 py-3"
              >
                <Text className="font-sans-medium text-xs text-violet-200">{emptyState.primary.label}</Text>
              </Pressable97>
            )}
            {emptyState.secondary && (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={emptyState.secondary.label}
                onPress={() => router.push(emptyState.secondary!.route)}
                className="mt-2 rounded-full px-5 py-2.5"
              >
                <Text className="font-sans-medium text-xs text-slate-500">{emptyState.secondary.label}</Text>
              </Pressable97>
            )}
          </GlassCard>
        ) : (
          <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <Ionicons name="radio-outline" size={18} color="#64748B" />
            <Text className="flex-1 font-sans text-[11px] leading-5 text-slate-500">El motor seguirá buscando nuevos cruces mientras estos puentes avanzan.</Text>
          </View>
        )}

        {closedMatches.length > 0 && (
          <View className="mt-8">
            <Text className="font-sans text-[10px] uppercase tracking-[3px] text-slate-600">Memoria de decisiones</Text>
            <View className="mt-3 gap-2">
              {closedMatches.slice(-4).map((match) => {
                const need = needs.get(match.needId);
                const resource = resources.get(match.resourceId);
                if (!need || !resource) return null;
                return (
                  <Pressable97 key={match.id} accessibilityRole="button" accessibilityLabel="Abrir puente retirado" onPress={() => openRoom(match.id)} className="flex-row items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <Ionicons name="archive-outline" size={17} color="#64748B" />
                    <View className="flex-1">
                      <Text className="font-sans-medium text-[11px] text-slate-400" numberOfLines={1}>{safeTitle(need.title)} ↔ {safeTitle(resource.title)}</Text>
                      <Text className="mt-1 font-sans text-[9px] uppercase tracking-[1px] text-slate-600">{MATCH_STATUS[match.status]}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#475569" />
                  </Pressable97>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
