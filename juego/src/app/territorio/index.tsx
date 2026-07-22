import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonTinta,
  ChipTipo,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { CIVIC_CAMPAIGNS, type CivicCampaignDefinition } from '@/civic/campaigns';
import { listeningsAll } from '@/civic/listening';
import { missionsAll } from '@/civic/missions';
import { retryDeadLetters, syncCivicNetwork } from '@/civic/sync';
import {
  matchesAll,
  isCivicRecordExpired,
  needsAll,
  observationsAll,
  observationsToVerify,
  outboxHealth,
  pendingOutbox,
  resourcesAll,
  territoriesAll,
} from '@/civic/repo';
import { PLANTILLAS_EXPEDICION } from '@/content';
import { expedicionesTodas, fundarExpedicion } from '@/db/repos';
import { fadeUp, staggerDelay } from '@/motion/variants';

interface Pulse {
  observations: number;
  review: number;
  needs: number;
  resources: number;
  matches: number;
  queued: number;
  deadLetters: number;
  sending: number;
  territories: number;
  drafts: number;
  voices: number;
  missions: number;
}

const EMPTY: Pulse = { observations: 0, review: 0, needs: 0, resources: 0, matches: 0, queued: 0, deadLetters: 0, sending: 0, territories: 0, drafts: 0, voices: 0, missions: 0 };

export default function Territorio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pulse, setPulse] = useState<Pulse>(EMPTY);
  const [repairing, setRepairing] = useState(false);

  const refresh = useCallback(() => {
    const observations = observationsAll();
    const outbox = outboxHealth();
    setPulse({
      observations: observations.length,
      review: observationsToVerify().filter((item) => item.creatorKey?.startsWith('remote:')).length,
      needs: needsAll().filter((item) =>
        !['resolved', 'withdrawn'].includes(item.status) && !isCivicRecordExpired(item)).length,
      resources: resourcesAll().filter((item) =>
        item.status === 'available'
        && !isCivicRecordExpired(item)
        && (item.quantity == null || item.quantity > 0)).length,
      matches: matchesAll().filter((item) => !['confirmed', 'declined', 'cancelled'].includes(item.status)).length,
      queued: pendingOutbox().length,
      deadLetters: outbox.deadLetter,
      sending: outbox.sending,
      territories: territoriesAll().length,
      drafts: observations.filter((item) => item.status === 'draft').length,
      voices: listeningsAll().length,
      missions: missionsAll().filter((item) => ['planning', 'active', 'paused'].includes(item.status)).length,
    });
  }, []);

  const repairOutbox = async () => {
    if (repairing) return;
    setRepairing(true);
    try {
      retryDeadLetters();
      await syncCivicNetwork();
      refresh();
    } finally {
      setRepairing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    refresh();
    syncCivicNetwork().then(refresh);
  }, [refresh]));

  const play = (campaign: CivicCampaignDefinition) => {
    const template = PLANTILLAS_EXPEDICION.find((item) => item.slug === campaign.expeditionSlug);
    if (!template) return;
    const existing = expedicionesTodas().find(
      (item) => item.plantillaId === template.id && item.estado === 'activa',
    );
    if (existing) {
      router.push(`/expediciones/${existing.id}`);
      return;
    }
    const expedition = fundarExpedicion({
      plantillaId: template.id,
      titulo: template.titulo,
      zona: 'Zona a confirmar',
      meta: template.metaSugerida,
      origen: 'precargada',
    });
    router.push(`/expediciones/${expedition.id}`);
  };

  const nextTitle = pulse.voices === 0
    ? 'Escuchá la primera voz'
    : pulse.observations === 0
      ? 'Encendé el primer dato'
    : pulse.drafts > 0
      ? 'Elegí qué sumar al mapa común'
    : pulse.review > 0
      ? 'Corroborá una señal cercana'
      : pulse.needs > pulse.resources
        ? 'Ofrecé un recurso concreto'
        : 'Dibujá tu próximo territorio';
  const nextRoute = pulse.voices === 0
    ? '/escuchar'
    : pulse.observations === 0
      ? null
    : pulse.drafts > 0
      ? '/publicar'
    : pulse.review > 0
      ? '/verificar'
      : pulse.needs > pulse.resources
        ? '/aportar'
        : '/territorio/mapa';

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
          <Kicker>escuchar · cuidar · conectar · construir</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Territorio
          </TituloAnton>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View entering={fadeUp}>
          <PapelCard className="p-6">
            <Kicker>inteligencia colectiva</Kicker>
            <TituloAnton tamano="md" className="mt-4">
              Del cielo íntimo al poder del territorio.
            </TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              Capturá, corroborá y conectá. Cada dato visible debe acercar una acción real.
            </Text>
            <View className="mt-6 flex-row items-center gap-6">
              {[
                [pulse.voices, 'voces'],
                [pulse.observations, 'señales'],
                [pulse.needs, 'necesidades'],
              ].map(([value, label]) => (
                <View key={label as string}>
                  <Text className="font-space text-xl text-tinta">{value}</Text>
                  <Text className="mt-0.5 font-space text-[10px] uppercase tracking-[1.5px] text-tinta-50">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </PapelCard>
        </Animated.View>

        <Kicker tono="neutro" className="mt-8">¿Qué pide tu atención hoy?</Kicker>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Escuchar una voz"
          onPress={() => router.push('/escuchar')}
          className="mt-3 bg-papel-crudo border border-tinta p-5"
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-3">
              <TituloAnton tamano="md">Escuchar una voz</TituloAnton>
              <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                Necesidad, sueño, propuesta o capacidad. Privada primero.
              </Text>
            </View>
            <Text className="font-space text-xl text-tinta">→</Text>
          </View>
        </Pressable97>
        <View className="mt-3 flex-row gap-3">
          {[
            ['/verificar', 'Cuidar una señal', `${pulse.review} por mirar`],
            ['/conectar', 'Tejer un puente', `${pulse.needs} ↔ ${pulse.resources}`],
          ].map(([route, title, detail]) => (
            <Pressable97
              key={route}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => router.push(route as never)}
              className="min-h-[110px] flex-1 bg-papel-crudo border border-tinta p-4"
            >
              <Text className="font-archivo-bold text-sm leading-5 text-tinta">{title}</Text>
              <Text className="mt-3 font-space text-xs text-tinta-50">{detail}</Text>
            </Pressable97>
          ))}
        </View>
        <Text className="mt-3 text-center font-archivo text-xs leading-5 text-tinta-50">
          Hoy no hay tarea obligatoria. También podés mirar el cielo.
        </Text>

        <Kicker tono="neutro" className="mt-8">Gesto sugerido</Kicker>
        <Pressable97
          accessibilityRole="button"
          accessibilityLabel={nextTitle}
          onPress={() => nextRoute ? router.push(nextRoute as never) : play(CIVIC_CAMPAIGNS[0]!)}
          className="mt-3 border-2 border-violeta bg-papel-crudo px-5 py-4"
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-3">
              <Text className="font-archivo-bold text-sm text-tinta">{nextTitle}</Text>
              <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                {pulse.deadLetters > 0
                  ? `${pulse.deadLetters} envíos necesitan reintento.`
                  : pulse.sending > 0
                    ? `${pulse.sending} movimientos se están enviando.`
                    : pulse.queued > 0
                      ? `${pulse.queued} movimientos esperan conexión y conservan su estado local.`
                      : 'Una acción pequeña, una consecuencia verificable.'}
              </Text>
            </View>
            <Text className="font-space text-xl text-violeta">→</Text>
          </View>
        </Pressable97>

        {pulse.deadLetters > 0 && (
          <View className="mt-3 border border-sello px-4 py-4">
            <Text className="font-archivo-bold text-xs text-tinta">Hay movimientos que no llegaron</Text>
            <Text className="mt-1 font-archivo text-[11px] leading-4 text-tinta-75">
              Podés reabrir la cola; el servidor evita duplicados.
            </Text>
            <View className="mt-3 items-start">
              <BotonTinta
                etiqueta="Reintentar"
                accessibilityLabel="Reintentar envíos detenidos"
                variante="fantasma"
                tamano="compacto"
                disabled={repairing}
                cargando={repairing}
                onPress={() => { void repairOutbox(); }}
              />
            </View>
          </View>
        )}

        <Kicker tono="neutro" className="mt-8">Campañas fundadoras</Kicker>
        <View className="mt-3 gap-3">
          {CIVIC_CAMPAIGNS.map((campaign, index) => (
            <Animated.View key={campaign.key} entering={staggerDelay(index)}>
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel={`Jugar ${campaign.title}`}
                onPress={() => play(campaign)}
                className="bg-papel-crudo border border-tinta p-5"
              >
                <ChipTipo etiqueta={campaign.eyebrow} />
                <TituloAnton tamano="md" className="mt-3">{campaign.title}</TituloAnton>
                <Text className="mt-3 font-archivo text-xs leading-5 text-tinta-75">{campaign.promise}</Text>
                <Text className="mt-3 font-archivo text-[11px] leading-4 text-tinta-50">{campaign.proof}</Text>
              </Pressable97>
            </Animated.View>
          ))}
        </View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Abrir inteligencia territorial para evaluar calidad, cobertura y respuesta"
          onPress={() => router.push('/territorio/inteligencia')}
          className="mt-8 bg-papel-crudo border border-tinta p-5"
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-3">
              <Kicker tono="neutro">Sala de análisis</Kicker>
              <TituloAnton tamano="md" className="mt-1">Inteligencia territorial</TituloAnton>
              <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
                Calidad, vigencia, brechas, cobertura y prioridades explicadas.
              </Text>
            </View>
            <Text className="font-space text-xl text-tinta">→</Text>
          </View>
        </Pressable97>

        <Kicker tono="neutro" className="mt-8">Mesa territorial</Kicker>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-3">
          {[
            ['/territorio/misiones', 'Misiones', pulse.missions > 0 ? `${pulse.missions} en marcha` : 'Lazo → operación'],
            ['/misiones', 'Misiones del protocolo', 'Fundá o sumate'],
            ['/expediciones', 'Expediciones', 'Quests de datos con pasos guiados.'],
            ['/territorio/mapa', 'Trazar zona', pulse.territories > 0 ? `${pulse.territories} guardadas` : 'Lazo vivo'],
            ['/verificar', 'Corroborar', `${pulse.review} por mirar`],
            ['/conectar', 'Conectar', `${pulse.needs} ↔ ${pulse.resources}`],
            ['/aportar', 'Aportar', 'Recurso concreto'],
            ['/mis-datos', 'Mis datos', 'Corregir o retirar'],
          ].map(([route, title, detail]) => (
            <Pressable97
              key={route}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => router.push(route as never)}
              className="w-[48.5%] bg-papel-crudo border border-tinta p-4"
            >
              <Text className="font-archivo-bold text-sm text-tinta">{title}</Text>
              <Text className="mt-3 font-space text-[10px] text-tinta-50">{detail}</Text>
            </Pressable97>
          ))}
        </View>

        <Pressable97
          accessibilityRole="button"
          accessibilityLabel="Abrir círculos y campañas de la red"
          onPress={() => router.push('/circulos')}
          className="mt-4 bg-papel-crudo border border-tinta p-5"
        >
          <View className="flex-row items-center">
            <View className="flex-1 pr-3">
              <Text className="font-archivo-bold text-sm text-tinta">Círculos y campañas</Text>
              <Text className="mt-1 font-archivo text-xs text-tinta-75">Del dato individual a la cobertura coordinada.</Text>
            </View>
            <Text className="font-space text-xl text-tinta">→</Text>
          </View>
        </Pressable97>

        <View className="mt-8 border border-bordeSuave px-4 py-4">
          <Text className="font-archivo text-[11px] leading-5 text-tinta-50">
            Cada registro confirma el lugar del asunto, la precisión pública y su firma. El punto exacto y las fotos permanecen en tu dispositivo; el contacto exige un puente aceptado.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
