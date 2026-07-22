import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeoAttributionCard, isGeoAttributionReady } from '@/components/civic/GeoAttributionCard';
import { LivingHalo } from '@/components/civic/LivingHalo';
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import {
  createListening,
  LISTENING_HORIZONS,
  LISTENING_KINDS,
  LISTENING_SCOPES,
  LISTENING_SOURCES,
  LISTENING_THEMES,
  listeningHorizonLabel,
  listeningKindLabel,
  listeningScopeLabel,
  listeningThemeLabel,
  shareListening,
} from '@/civic/listening';
import { defaultRecordContextDraft } from '@/civic/record-context';
import type {
  ListeningHorizon,
  ListeningKind,
  ListeningScope,
  ListeningSource,
  ListeningTheme,
} from '@/civic/types';
import { FTUE } from '@/content';
import { CLAVES, crearEstrellaCivicaUnaVez, getSetting, setSetting } from '@/db/repos';
import type { TipoEstrella } from '@/game/types';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';

type Destination = 'private' | 'collective';

/** Toda escucha enciende su estrella: el tipo del Cielo que le corresponde. */
const ESTRELLA_POR_ESCUCHA: Record<ListeningKind, TipoEstrella> = {
  need: 'need',
  dream: 'dream',
  proposal: 'value',
  capacity: 'recurso',
};

function StageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <View>
      <Text className="font-sans text-xs uppercase tracking-[2.8px] text-violet-300">{eyebrow}</Text>
      <Text className="mt-3 font-serif text-[32px] leading-[40px] text-plata">{title}</Text>
      <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">{body}</Text>
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable97
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-12 justify-center rounded-full border px-4 py-3"
      style={{
        borderColor: selected ? '#A78BFA66' : '#FFFFFF18',
        backgroundColor: selected ? '#7D5BDE24' : '#FFFFFF08',
      }}
    >
      <Text className="text-center font-sans-medium text-sm" style={{ color: selected ? '#DDD6FE' : '#94A3B8' }}>
        {label}
      </Text>
    </Pressable97>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text className="mb-2 font-sans-medium text-sm text-slate-200">{children}</Text>;
}

export default function Escuchar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<ListeningKind | null>(null);
  const [source, setSource] = useState<ListeningSource>('lived');
  const [theme, setTheme] = useState<ListeningTheme>('care');
  const [statement, setStatement] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [existingStrength, setExistingStrength] = useState('');
  const [firstStep, setFirstStep] = useState('');
  const [horizon, setHorizon] = useState<ListeningHorizon>('year');
  const [scope, setScope] = useState<ListeningScope>('neighborhood');
  const [importance, setImportance] = useState(3);
  const [supportWanted, setSupportWanted] = useState(false);
  const [destination, setDestination] = useState<Destination>('private');
  const [pactoAceptado, setPactoAceptado] = useState(() => getSetting(CLAVES.pactoAceptado) === '1');
  const [context, setContext] = useState(() => defaultRecordContextDraft({
    sensitivity: 'high',
    precision: 'neighborhood',
  }));
  const [saving, setSaving] = useState(false);
  const [savedShared, setSavedShared] = useState(false);
  const [savedListeningId, setSavedListeningId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const kindDefinition = LISTENING_KINDS.find((item) => item.key === kind) ?? null;
  const contextReady = isGeoAttributionReady(context);
  const canAdvance = step === 0
    ? kind !== null
    : step === 1
      ? statement.trim().length >= 12
      : true;
  const preview = useMemo(() => kind ? [
    listeningKindLabel(kind),
    listeningThemeLabel(theme),
    listeningHorizonLabel(horizon),
    listeningScopeLabel(scope),
    `prioridad ${importance}/5`,
  ].join(' · ') : '', [horizon, importance, kind, scope, theme]);
  const saveLabel = step !== 4
    ? 'Continuar'
    : destination === 'collective' && !pactoAceptado
      ? 'Aceptá el pacto para contribuir'
      : saving
        ? 'Guardando…'
        : destination === 'collective'
          ? 'Guardar y contribuir'
          : 'Guardar en privado';

  const chooseKind = (value: ListeningKind) => {
    setKind(value);
    // Buscar apoyo o movilizar una capacidad es una decisión posterior y
    // explícita: elegir el tipo de escucha no debe marcar consentimiento.
    setSupportWanted(false);
    setContext(defaultRecordContextDraft({
      sensitivity: value === 'need' ? 'high' : value === 'capacity' ? 'low' : 'moderate',
      precision: value === 'need' ? 'neighborhood' : value === 'capacity' ? '500m' : 'city',
    }));
    haptic.tick();
  };

  const next = () => {
    if (!canAdvance || step >= 4) return;
    haptic.tick();
    setStep((value) => value + 1);
  };

  const back = () => {
    if (step === 0) return;
    setStep((value) => value - 1);
  };

  // Se muestra una única vez en la vida de la app: aceptar el pacto queda
  // grabado en settings y ninguna sesión futura vuelve a pedirlo.
  const aceptarPacto = () => {
    setSetting(CLAVES.pactoAceptado, '1');
    setPactoAceptado(true);
    haptic.tick();
  };

  const save = async () => {
    if (!kind || saving || statement.trim().length < 12 || (destination === 'collective' && !pactoAceptado)) return;
    setSaving(true);
    setSaveNote(null);
    const voice = createListening({
      kind,
      source,
      theme,
      statement,
      desiredOutcome,
      existingStrength,
      firstStep,
      horizon,
      scope,
      importance,
      supportWanted,
    });
    setSavedListeningId(voice.id);
    // Toda escucha enciende una estrella en el Cielo personal (privado como
    // la bitácora): el juego y la escucha son el mismo gesto. Idempotente
    // por id de escucha — un reintento jamás duplica la estrella.
    try {
      const estrella = crearEstrellaCivicaUnaVez(voice.id, {
        tipo: ESTRELLA_POR_ESCUCHA[kind],
        texto: statement.trim(),
      });
      useJuego.getState().setNewStar(estrella.id);
    } catch {
      // El refugio del relato ya está garantizado; la estrella puede esperar.
    }
    let shared = false;
    if (destination === 'collective') {
      try {
        const result = await shareListening(voice.id, { context });
        shared = result?.status === 'shared';
      } catch {
        setSaveNote('Tu relato quedó a salvo en la bitácora. La faceta colectiva no pudo prepararse todavía.');
      }
    }
    setSavedShared(shared);
    setStep(5);
    setSaving(false);
    haptic.celebrate();
  };

  if (step === 5 && kind) {
    return (
      <View className="flex-1 bg-fondo">
        <PanelHeader title="La Escucha" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
          <Animated.View entering={fadeUp} className="mt-4 overflow-hidden rounded-[30px] border border-violet-300/20">
            <LinearGradient colors={['#201637', '#100E18', '#0A0A0A']} style={{ padding: 26, minHeight: 330 }}>
              <LivingHalo color={kindDefinition?.color} />
              <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Ionicons name={(kindDefinition?.icon ?? 'sparkles-outline') as never} size={25} color={kindDefinition?.color ?? '#C4B5FD'} />
              </View>
              <Text className="mt-8 font-sans text-xs uppercase tracking-[2.8px] text-violet-200">
                {savedShared ? 'Voz protegida + pulso colectivo' : 'Guardada en privado'}
              </Text>
              <Text className="mt-3 font-serif text-[38px] leading-[46px] text-plata">Tu voz tiene refugio. Y también dirección.</Text>
              <Text className="mt-4 font-sans text-sm leading-6 text-slate-400">
                {savedShared
                  ? 'El relato completo quedó en tu teléfono. La red recibió sólo las facetas que viste en la vista previa.'
                  : 'La app no la sincronizó: quedó en este dispositivo o perfil. No suma puntos ni alimenta perfiles; protegé el dispositivo si lo comparten otras personas.'}
              </Text>
            </LinearGradient>
          </Animated.View>

          {saveNote && (
            <View className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <Text className="font-sans text-sm leading-6 text-amber-100">{saveNote}</Text>
            </View>
          )}

          {supportWanted && kind === 'need' && (
            <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] p-4">
              <Ionicons name="shield-checkmark-outline" size={18} color="#FDA4AF" />
              <Text className="flex-1 font-sans text-xs leading-5 text-slate-400">
                Marcaste que querés apoyo. El relato quedó protegido; el próximo paso separa un pedido mínimo, nombra quién lo custodiará y lo mantiene local hasta que exista un permiso territorial verificable.
              </Text>
            </View>
          )}

          <View className="mt-6 gap-3">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Ver mi cielo"
              onPress={() => router.replace('/')}
              className="min-h-14 flex-row items-center rounded-2xl border border-white/20 bg-white/10 px-5"
            >
              <Ionicons name="star" size={20} color="#F5F7FA" />
              <View className="ml-3 flex-1">
                <Text className="font-sans-semibold text-sm text-plata">Ver mi cielo</Text>
                <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">
                  Tu escucha acaba de encender una estrella.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={17} color="#F5F7FA" />
            </Pressable97>
            {supportWanted && kind === 'need' && savedListeningId && (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Preparar un pedido bajo custodia"
                onPress={() => router.replace({ pathname: '/escuchar/necesidad/[id]', params: { id: savedListeningId } })}
                className="min-h-14 flex-row items-center rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5"
              >
                <Ionicons name="shield-checkmark-outline" size={20} color="#FDA4AF" />
                <View className="ml-3 flex-1">
                  <Text className="font-sans-semibold text-sm text-plata">Preparar pedido bajo custodia</Text>
                  <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">Custodio, destinatario, vigencia y punto seguro.</Text>
                </View>
                <Ionicons name="arrow-forward" size={17} color="#FDA4AF" />
              </Pressable97>
            )}
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Abrir mi bitácora"
              onPress={() => router.replace('/bitacora')}
              className="min-h-14 flex-row items-center rounded-2xl border border-violet-300/25 bg-violet-300/10 px-5"
            >
              <Ionicons name="book-outline" size={20} color="#C4B5FD" />
              <Text className="ml-3 flex-1 font-sans-semibold text-sm text-plata">Abrir mi bitácora</Text>
              <Ionicons name="arrow-forward" size={17} color="#A78BFA" />
            </Pressable97>
            {savedShared && kind === 'capacity' && supportWanted && (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Convertir esta capacidad en un aporte concreto"
                onPress={() => router.replace('/aportar')}
                className="min-h-14 flex-row items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5"
              >
                <Ionicons name="git-merge-outline" size={20} color="#6EE7B7" />
                <Text className="ml-3 flex-1 font-sans-semibold text-sm text-plata">Convertir en aporte concreto</Text>
                <Ionicons name="arrow-forward" size={17} color="#6EE7B7" />
              </Pressable97>
            )}
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Volver al territorio"
              onPress={() => router.replace('/territorio')}
              className="min-h-14 flex-row items-center rounded-2xl border border-white/10 bg-white/5 px-5"
            >
              <Ionicons name="earth-outline" size={20} color="#94A3B8" />
              <Text className="ml-3 flex-1 font-sans-medium text-sm text-slate-300">Volver al territorio</Text>
            </Pressable97>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="La Escucha" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
        >
          <View className="mb-7 mt-2 flex-row gap-2" accessibilityLabel={`Paso ${step + 1} de 5`}>
            {[0, 1, 2, 3, 4].map((item) => (
              <View key={item} className="h-1 flex-1 rounded-full" style={{ backgroundColor: item <= step ? '#A78BFA' : '#FFFFFF14' }} />
            ))}
          </View>

          {step === 0 && (
            <Animated.View entering={fadeUp}>
              <StageTitle
                eyebrow="Un país empieza escuchando"
                title="¿Qué pide ser escuchado hoy?"
                body="No buscamos respuestas perfectas. Buscamos realidad, deseo y capacidad con contexto humano. Elegí la puerta que mejor se parece a lo que traés."
              />
              <View className="mt-7 gap-3">
                {LISTENING_KINDS.map((item, index) => {
                  const selected = kind === item.key;
                  return (
                    <Animated.View key={item.key} entering={staggerDelay(index)}>
                      <Pressable97
                        accessibilityRole="button"
                        accessibilityLabel={`${item.label}. ${item.prompt}`}
                        accessibilityState={{ selected }}
                        onPress={() => chooseKind(item.key)}
                        className="min-h-[92px] flex-row items-center rounded-[22px] border p-4"
                        style={{ borderColor: selected ? `${item.color}66` : '#FFFFFF18', backgroundColor: selected ? `${item.color}14` : '#FFFFFF08' }}
                      >
                        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${item.color}18` }}>
                          <Ionicons name={item.icon as never} size={22} color={item.color} />
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="font-serif text-xl text-plata">{item.label}</Text>
                          <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{item.prompt}</Text>
                        </View>
                        {selected && <Ionicons name="checkmark-circle" size={21} color={item.color} />}
                      </Pressable97>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {step === 1 && kindDefinition && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow={kindDefinition.action} title={kindDefinition.prompt} body="Escribilo como lo dirías en una ronda de confianza. Este texto nace privado y queda en tu dispositivo." />
              <Text className="mt-7 font-sans-medium text-sm text-slate-200">¿Desde dónde hablás?</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_SOURCES.map((item) => (
                  <ChoiceChip key={item.key} label={item.label} selected={source === item.key} onPress={() => setSource(item.key)} />
                ))}
              </View>
              <GlassCard className="mt-6 p-4">
                <TextInput
                  value={statement}
                  onChangeText={setStatement}
                  placeholder="Contalo con tus palabras…"
                  placeholderTextColor="#64748B"
                  multiline
                  maxLength={800}
                  textAlignVertical="top"
                  className="min-h-[170px] font-sans text-base leading-7 text-plata"
                  accessibilityLabel="Relato privado"
                />
                <Text className="text-right font-mono text-xs text-slate-600">{statement.length}/800</Text>
              </GlassCard>
              <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                <Ionicons name="lock-closed" size={17} color="#6EE7B7" />
                <Text className="flex-1 font-sans text-xs leading-5 text-emerald-100/80">Privado por diseño. Tu frase no se envía al mapa ni a la red.</Text>
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow="Dar sentido" title="¿De qué parte de la vida habla?" body="Una buena escucha no registra sólo la falta: también reconoce el resultado deseado y lo que ya sostiene a la comunidad." />
              <View className="mt-7 flex-row flex-wrap gap-2">
                {LISTENING_THEMES.map((item) => (
                  <Pressable97
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: theme === item.key }}
                    onPress={() => setTheme(item.key)}
                    className="min-h-12 flex-row items-center gap-2 rounded-full border px-4 py-3"
                    style={{ borderColor: theme === item.key ? '#A78BFA66' : '#FFFFFF18', backgroundColor: theme === item.key ? '#7D5BDE24' : '#FFFFFF08' }}
                  >
                    <Ionicons name={item.icon as never} size={16} color={theme === item.key ? '#C4B5FD' : '#64748B'} />
                    <Text className="font-sans-medium text-sm" style={{ color: theme === item.key ? '#DDD6FE' : '#94A3B8' }}>{item.label}</Text>
                  </Pressable97>
                ))}
              </View>
              <GlassCard className="mt-6 gap-5 p-5">
                <View>
                  <FieldLabel>¿Qué resultado serviría de verdad?</FieldLabel>
                  <TextInput value={desiredOutcome} onChangeText={setDesiredOutcome} maxLength={600} multiline placeholder="Ej. que ninguna familia tenga que elegir entre comida y alquiler" placeholderTextColor="#64748B" className="min-h-20 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-sans text-sm leading-6 text-plata" />
                </View>
                <View>
                  <FieldLabel>¿Qué ya ayuda o sostiene esto?</FieldLabel>
                  <TextInput value={existingStrength} onChangeText={setExistingStrength} maxLength={600} multiline placeholder="Personas, saberes, lugares, redes que ya existen…" placeholderTextColor="#64748B" className="min-h-20 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-sans text-sm leading-6 text-plata" />
                </View>
                <View>
                  <FieldLabel>¿Cuál podría ser un primer paso?</FieldLabel>
                  <TextInput value={firstStep} onChangeText={setFirstStep} maxLength={400} multiline placeholder="Algo pequeño, concreto y posible…" placeholderTextColor="#64748B" className="min-h-20 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-sans text-sm leading-6 text-plata" />
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow="Contexto sin invadir" title="¿Qué alcance y urgencia tiene?" body="Estas facetas permiten reconocer patrones sin exponer la historia íntima que les da origen." />
              <Text className="mt-7 font-sans-medium text-sm text-slate-200">Horizonte</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_HORIZONS.map((item) => <ChoiceChip key={item.key} label={item.label} selected={horizon === item.key} onPress={() => setHorizon(item.key)} />)}
              </View>
              <Text className="mt-6 font-sans-medium text-sm text-slate-200">Escala</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_SCOPES.map((item) => <ChoiceChip key={item.key} label={item.label} selected={scope === item.key} onPress={() => setScope(item.key)} />)}
              </View>
              <Text className="mt-6 font-sans-medium text-sm text-slate-200">Importancia para vos</Text>
              <View className="mt-3 flex-row gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable97 key={value} accessibilityRole="button" accessibilityLabel={`Importancia ${value} de 5`} accessibilityState={{ selected: importance === value }} onPress={() => setImportance(value)} className="min-h-12 flex-1 items-center justify-center rounded-2xl border" style={{ borderColor: importance === value ? '#A78BFA66' : '#FFFFFF18', backgroundColor: importance === value ? '#7D5BDE24' : '#FFFFFF08' }}>
                    <Text className="font-mono text-base" style={{ color: importance === value ? '#DDD6FE' : '#64748B' }}>{value}</Text>
                  </Pressable97>
                ))}
              </View>
              {(kind === 'need' || kind === 'capacity') && (
                <Pressable97
                  accessibilityRole="checkbox"
                  accessibilityLabel={kind === 'need' ? 'Quiero buscar apoyo' : 'Quiero poner esta capacidad en movimiento'}
                  accessibilityState={{ checked: supportWanted }}
                  accessibilityValue={{ text: supportWanted ? 'Sí' : 'No' }}
                  onPress={() => setSupportWanted((value) => !value)}
                  className="mt-7 min-h-16 flex-row items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4"
                >
                  <View className="h-6 w-6 items-center justify-center rounded-lg border" style={{ borderColor: supportWanted ? '#6EE7B7' : '#64748B', backgroundColor: supportWanted ? '#10B981' : 'transparent' }}>
                    {supportWanted && <Ionicons name="checkmark" size={16} color="#052E23" />}
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-sans-semibold text-sm text-plata">{kind === 'need' ? 'Quiero buscar apoyo' : 'Quiero ponerlo en movimiento'}</Text>
                    <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">
                      {supportWanted
                        ? 'Sí. Al guardar podrás preparar el próximo paso bajo custodia.'
                        : 'No por ahora. La escucha queda registrada sin iniciar un pedido operativo.'}
                    </Text>
                  </View>
                </Pressable97>
              )}
            </Animated.View>
          )}

          {step === 4 && kind && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow="Vos decidís el destino" title="Primero tu bitácora. Después, si querés, lo común." body="La opción privada está elegida por defecto. Compartir crea una derivación mínima; nunca publica tu relato completo." />
              <View className="mt-7 gap-3">
                <Pressable97 accessibilityRole="radio" accessibilityLabel="Sólo mi bitácora" accessibilityState={{ selected: destination === 'private' }} onPress={() => setDestination('private')} className="min-h-[110px] flex-row items-start rounded-[22px] border p-5" style={{ borderColor: destination === 'private' ? '#A78BFA66' : '#FFFFFF18', backgroundColor: destination === 'private' ? '#7D5BDE20' : '#FFFFFF08' }}>
                  <Ionicons name="lock-closed-outline" size={22} color="#C4B5FD" />
                  <View className="ml-4 flex-1">
                    <Text className="font-serif text-xl text-plata">Sólo mi bitácora</Text>
                    <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">Todo queda en este dispositivo. No suma puntos ni crea un perfil.</Text>
                  </View>
                  {destination === 'private' && <Ionicons name="checkmark-circle" size={21} color="#A78BFA" />}
                </Pressable97>
                <Pressable97 accessibilityRole="radio" accessibilityLabel="Sumar facetas al pulso colectivo" accessibilityState={{ selected: destination === 'collective' }} onPress={() => setDestination('collective')} className="min-h-[110px] flex-row items-start rounded-[22px] border p-5" style={{ borderColor: destination === 'collective' ? '#6EE7B766' : '#FFFFFF18', backgroundColor: destination === 'collective' ? '#10B98118' : '#FFFFFF08' }}>
                  <Ionicons name="pulse-outline" size={22} color="#6EE7B7" />
                  <View className="ml-4 flex-1">
                    <Text className="font-serif text-xl text-plata">Sumar al pulso colectivo</Text>
                    <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">Sólo taxonomías controladas para una radiografía con umbral de privacidad.</Text>
                  </View>
                  {destination === 'collective' && <Ionicons name="checkmark-circle" size={21} color="#34D399" />}
                </Pressable97>
              </View>

              {destination === 'collective' && (
                <View className="mt-5 gap-4">
                  <GlassCard className="p-5">
                    <Text className="font-sans text-xs uppercase tracking-[2px] text-slate-500">Esto sí verá la red</Text>
                    <Text className="mt-3 font-sans-semibold text-sm leading-6 text-plata">{preview}</Text>
                    <View className="mt-4 h-px bg-white/10" />
                    <View className="mt-4 gap-2">
                      {['Tu relato y tus notas', 'Tus datos de contacto', 'Tu coordenada exacta'].map((item) => (
                        <View key={item} className="flex-row items-center gap-2">
                          <Ionicons name="close-circle-outline" size={16} color="#FB7185" />
                          <Text className="font-sans text-xs text-slate-400">No se comparte: {item.toLowerCase()}</Text>
                        </View>
                      ))}
                    </View>
                  </GlassCard>
                  <GeoAttributionCard
                    value={context}
                    onChange={setContext}
                    title={kind === 'need' ? '¿Dónde se siente esta necesidad?' : kind === 'capacity' ? '¿Dónde puede activarse esta capacidad?' : '¿Con qué territorio dialoga esta voz?'}
                    description="Elegí el lugar del asunto, no tu domicilio. La ubicación y la firma se deciden para este aporte, no para toda tu cuenta."
                  />
                </View>
              )}

              {destination === 'collective' && !pactoAceptado && (
                <Animated.View entering={fadeUp} className="mt-5">
                  <GlassCard className="p-5">
                    <Text className="font-serif text-2xl leading-8 text-plata">{FTUE.pactoTitulo}</Text>
                    <Text className="mt-3 font-sans text-sm leading-6 text-slate-300">{FTUE.pactoDetalle}</Text>
                    <View className="mt-5">
                      {FTUE.pacto.map((item, index) => (
                        <View key={item.title} className={index === 0 ? '' : 'mt-4 border-t border-white/10 pt-4'}>
                          <Text className="font-sans-semibold text-sm text-emerald-200">{item.title}</Text>
                          <Text className="mt-1 font-sans text-xs leading-5 text-slate-400">{item.detail}</Text>
                        </View>
                      ))}
                    </View>
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel="Acepto el pacto"
                      onPress={aceptarPacto}
                      className="mt-5 min-h-12 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 px-6"
                    >
                      <Text className="font-sans-semibold text-sm text-emerald-200">Acepto el pacto</Text>
                    </Pressable97>
                  </GlassCard>
                </Animated.View>
              )}
            </Animated.View>
          )}

          <View className="mt-9 flex-row items-center justify-between gap-4">
            {step > 0 ? (
              <Pressable97 accessibilityRole="button" accessibilityLabel="Volver al paso anterior" onPress={back} className="min-h-12 justify-center rounded-full border border-white/10 px-5">
                <Text className="font-sans-medium text-sm text-slate-400">Atrás</Text>
              </Pressable97>
            ) : <View />}
            <AccentButton
              label={saveLabel}
              onPress={step === 4 ? save : next}
              disabled={!canAdvance || saving || (step === 4 && destination === 'collective' && (!contextReady || !pactoAceptado))}
              style={{ minHeight: 52 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
