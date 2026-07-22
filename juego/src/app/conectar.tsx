import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, FilaIndice, GranoPapel, Kicker, Palitos, PapelCard, TituloAnton } from '@/components/papel';
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
import { VERDE } from '@/theme/tokens';

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

const pad = (n: number): string => String(n).padStart(2, '0');

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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
        >
          <Text className="font-space text-2xl text-tinta">←</Text>
        </Pressable97>
        <View className="mt-2">
          <Kicker>tejido de apoyo mutuo</Kicker>
          <TituloAnton tamano="lg" className="mt-1">La afinidad propone. La confianza se construye.</TituloAnton>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={fadeUp}>
          <Text className="font-archivo text-sm leading-6 text-tinta-75">
            Cada coincidencia abre una sala protegida: razones visibles, acuerdo de ambos lados, entrega y confirmación independiente.
          </Text>
          <View className="mt-4 border border-verde px-4 py-3">
            <Text className="font-archivo text-xs leading-5 text-tinta-90">Sin teléfonos, correos ni coordenadas exactas.</Text>
          </View>
          {activeMatches.length > 0 && (
            <View className="mt-4 flex-row items-center gap-2.5">
              <Palitos total={activeMatches.length} />
              <Text className="font-space text-[11px] uppercase tracking-[1px] text-tinta-50">
                {activeMatches.length} {activeMatches.length === 1 ? 'puente activo' : 'puentes activos'}
              </Text>
            </View>
          )}
        </Animated.View>

        {activeMatches.length > 0 && (
          <>
            <View className="mt-9">
              <Kicker tono="neutro">Tramas en movimiento</Kicker>
              <TituloAnton tamano="md" className="mt-2">Puentes con memoria</TituloAnton>
            </View>
            <View className="mt-4">
              {activeMatches.map((match, index) => {
                const need = needs.get(match.needId);
                const resource = resources.get(match.resourceId);
                if (!need || !resource) return null;
                const bothAccepted = Boolean(match.acceptedNeedAt && match.acceptedResourceAt);
                const resourceContext = recordContextFor('resource', resource.id);
                return (
                  <Animated.View key={match.id} entering={staggerDelay(index)}>
                    <FilaIndice
                      numero={pad(index + 1)}
                      onPress={() => openRoom(match.id)}
                      accessibilityLabel={`Abrir sala del puente entre ${safeTitle(need.title)} y ${safeTitle(resource.title)}`}
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <Text className="font-space text-[10px] uppercase tracking-[1px] text-tinta-50">
                          Afinidad {match.score}% · {MATCH_STATUS[match.status]}
                        </Text>
                        {bothAccepted && <ChipTipo etiqueta="Acordado" activo color={VERDE} />}
                      </View>
                      <Text className="mt-2 font-archivo-bold text-base text-tinta">{safeTitle(need.title)}</Text>
                      <Text className="mt-1 font-archivo text-xs text-tinta-50">
                        {civicCategoryLabel(need.category)} · urgencia {need.urgency}/5 · {need.locationLabel ?? 'Lugar por acordar'}
                      </Text>
                      <View className="my-3 h-px bg-bordeSuave" />
                      <Text className="font-archivo-bold text-sm text-tinta">{safeTitle(resource.title)}</Text>
                      <Text className="mt-1 font-archivo text-xs text-tinta-50">
                        {resource.locationLabel ?? 'Zona sin nombre'} · {contextAttributionSummary(resourceContext)}
                      </Text>
                    </FilaIndice>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}

        <View className="mt-9">
          <Kicker tono="neutro">Nuevas coincidencias</Kicker>
          <TituloAnton tamano="md" className="mt-2">Razones antes que promesas</TituloAnton>
        </View>
        {freshSuggestions.length > 0 ? (
          <View className="mt-4 gap-3">
            {freshSuggestions.slice(0, 8).map((suggestion, index) => (
              <Animated.View key={`${suggestion.need.id}:${suggestion.resource.id}`} entering={staggerDelay(index)}>
                <PapelCard className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Kicker tono="neutro">Coincidencia posible</Kicker>
                      <Text className="mt-3 font-archivo-bold text-xl leading-7 text-tinta">{safeTitle(suggestion.need.title)}</Text>
                      <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                        puede conectarse con <Text className="text-tinta">{safeTitle(suggestion.resource.title)}</Text>
                      </Text>
                    </View>
                    <View className="items-center border border-bordeSuave px-3 py-2.5">
                      <Text className="font-space text-2xl text-tinta">{suggestion.score}</Text>
                      <Text className="font-space text-[8px] uppercase tracking-[1px] text-tinta-50">afinidad</Text>
                    </View>
                  </View>
                  <View className="mt-4 gap-1.5">
                    <Text className="font-archivo text-[11px] leading-[18px] text-tinta-50">
                      {suggestion.need.locationLabel ?? 'Necesidad sin zona'} ↔ {suggestion.resource.locationLabel ?? 'Recurso sin zona'}
                    </Text>
                    {suggestion.reasons.slice(0, 4).map((reason) => (
                      <Text key={reason} className="font-archivo text-[11px] leading-[18px] text-tinta-50">— {safeTitle(reason)}</Text>
                    ))}
                  </View>
                  <View className="mt-5 items-center">
                    <BotonTinta
                      etiqueta="Proponer y abrir sala →"
                      variante="fantasma"
                      accessibilityLabel="Proponer puente y abrir sala segura"
                      onPress={() => propose(suggestion)}
                    />
                  </View>
                  <Text className="mt-3 text-center font-archivo text-[9px] leading-4 text-tinta-30">Proponer no obliga: cada parte deberá aceptar por separado.</Text>
                </PapelCard>
              </Animated.View>
            ))}
          </View>
        ) : activeMatches.length === 0 ? (
          <PapelCard className="mt-4 items-center p-7">
            <TituloAnton tamano="md" className="text-center">{emptyState.title}</TituloAnton>
            <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-75">
              {emptyState.description}
            </Text>
            {emptyState.primary && (
              <View className="mt-5">
                <BotonTinta
                  etiqueta={emptyState.primary.label}
                  tamano="compacto"
                  accessibilityLabel={emptyState.primary.label}
                  onPress={() => router.push(emptyState.primary!.route)}
                />
              </View>
            )}
            {emptyState.secondary && (
              <View className="mt-2">
                <BotonTinta
                  etiqueta={emptyState.secondary.label}
                  variante="fantasma"
                  tamano="compacto"
                  accessibilityLabel={emptyState.secondary.label}
                  onPress={() => router.push(emptyState.secondary!.route)}
                />
              </View>
            )}
          </PapelCard>
        ) : (
          <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-50">
            El motor seguirá buscando nuevos cruces mientras estos puentes avanzan.
          </Text>
        )}

        {closedMatches.length > 0 && (
          <View className="mt-9">
            <Kicker tono="neutro">Memoria de decisiones</Kicker>
            <View className="mt-2">
              {closedMatches.slice(-4).map((match, index) => {
                const need = needs.get(match.needId);
                const resource = resources.get(match.resourceId);
                if (!need || !resource) return null;
                return (
                  <FilaIndice
                    key={match.id}
                    numero={pad(index + 1)}
                    onPress={() => openRoom(match.id)}
                    accessibilityLabel="Abrir puente retirado"
                  >
                    <Text numberOfLines={1} className="font-archivo text-xs text-tinta-75">{safeTitle(need.title)} ↔ {safeTitle(resource.title)}</Text>
                    <Text className="mt-1 font-space text-[10px] uppercase tracking-[1px] text-tinta-30">{MATCH_STATUS[match.status]}</Text>
                  </FilaIndice>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
