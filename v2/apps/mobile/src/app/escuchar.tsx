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
import {
  BotonTinta,
  ChipTipo,
  FilaIndice,
  GranoPapel,
  Kicker,
  Palitos,
  PapelCard,
  Sello,
  TituloAnton,
} from '@/components/papel';
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
import { FTUE, SENAL_POR_KEY } from '@/content';
import { CLAVES, crearEstrellaCivicaUnaVez, getSetting, setSetting } from '@/db/repos';
import type { TipoEstrella } from '@/game/types';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

/**
 * La Escucha — cinco pasos que convierten un relato en una voz con forma:
 * qué falta, qué se sueña, qué se propone o qué se puede aportar. Privado
 * por defecto; compartir crea sólo una derivación taxonómica mínima.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el cuaderno de campo.
 * El pacto de la escucha colectiva deja el sello PACTADO al aceptarlo;
 * guardar la escucha deja el sello RECIBIDA en la pantalla de éxito.
 */

type Destination = 'private' | 'collective';

/** Toda escucha enciende su estrella: el tipo del Cielo que le corresponde. */
const ESTRELLA_POR_ESCUCHA: Record<ListeningKind, TipoEstrella> = {
  need: 'need',
  dream: 'dream',
  proposal: 'value',
  capacity: 'recurso',
};

/** Color de señal (spec §2) por tipo de escucha — el mismo mapeo que enciende
 * la estrella correspondiente, leído contra la tabla de colores del papel. */
const COLOR_POR_KIND: Record<ListeningKind, string> = {
  need: SENAL_POR_KEY.need.color,
  dream: SENAL_POR_KEY.dream.color,
  proposal: SENAL_POR_KEY.value.color,
  capacity: SENAL_POR_KEY.recurso.color,
};

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

function Encabezado({ onVolver }: { onVolver: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="px-5" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
      <Pressable97
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onVolver}
        className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
      >
        <Text className="font-space text-2xl text-tinta">←</Text>
      </Pressable97>
      <View className="mt-2">
        <Kicker>la escucha</Kicker>
        <TituloAnton entintar tamano="lg" className="mt-1">
          La Escucha
        </TituloAnton>
      </View>
    </View>
  );
}

function StageTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <View>
      <Kicker tono="neutro">{eyebrow}</Kicker>
      <TituloAnton tamano="md" className="mt-2">
        {title}
      </TituloAnton>
      <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">{body}</Text>
    </View>
  );
}

function SelectableCard({
  title,
  description,
  selected,
  color,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
}: {
  title: string;
  description: string;
  selected: boolean;
  color?: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityRole?: 'button' | 'radio';
}) {
  return (
    <Pressable97
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-[92px] flex-row items-center bg-papel-crudo p-4"
      style={{ borderWidth: selected ? 2 : 1, borderColor: selected ? (color ?? VIOLETA) : TINTA }}
    >
      <View className="flex-1">
        <Text className="font-archivo-bold text-lg text-tinta">{title}</Text>
        <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">{description}</Text>
      </View>
    </Pressable97>
  );
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
  // Distingue "ya venía pactado de otra sesión" (no festeja de nuevo) de
  // "lo acabás de aceptar" (el sello cae una vez, spec §3.6).
  const [pactoRecienAceptado, setPactoRecienAceptado] = useState(false);
  const [context, setContext] = useState(() => defaultRecordContextDraft({
    sensitivity: 'high',
    precision: 'neighborhood',
  }));
  const [saving, setSaving] = useState(false);
  const [savedShared, setSavedShared] = useState(false);
  const [savedListeningId, setSavedListeningId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [enfocadoRelato, setEnfocadoRelato] = useState(false);
  const [enfocadoResultado, setEnfocadoResultado] = useState(false);
  const [enfocadoFortaleza, setEnfocadoFortaleza] = useState(false);
  const [enfocadoPrimerPaso, setEnfocadoPrimerPaso] = useState(false);

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
    ? 'Continuar →'
    : destination === 'collective' && !pactoAceptado
      ? 'Aceptá el pacto para contribuir'
      : destination === 'collective'
        ? 'Guardar y contribuir →'
        : 'Guardar en privado →';

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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Se muestra una única vez en la vida de la app: aceptar el pacto queda
  // grabado en settings y ninguna sesión futura vuelve a pedirlo.
  const aceptarPacto = () => {
    setSetting(CLAVES.pactoAceptado, '1');
    setPactoAceptado(true);
    setPactoRecienAceptado(true);
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
    type Accion = { key: string; label: string; detail: string; onPress: () => void };
    const acciones: Accion[] = [
      {
        key: 'cielo',
        label: 'Ver mi cielo',
        detail: 'Tu escucha acaba de encender una estrella.',
        onPress: () => router.replace('/'),
      },
      ...(supportWanted && kind === 'need' && savedListeningId
        ? [{
            key: 'custodia',
            label: 'Preparar pedido bajo custodia',
            detail: 'Custodio, destinatario, vigencia y punto seguro.',
            onPress: () => router.replace({ pathname: '/escuchar/necesidad/[id]', params: { id: savedListeningId } }),
          }]
        : []),
      {
        key: 'bitacora',
        label: 'Abrir mi bitácora',
        detail: 'Cada escucha guardada queda anotada ahí.',
        onPress: () => router.replace('/bitacora'),
      },
      ...(savedShared && kind === 'capacity' && supportWanted
        ? [{
            key: 'aportar',
            label: 'Convertir en aporte concreto',
            detail: 'Ponela en movimiento con fecha y lugar.',
            onPress: () => router.replace('/aportar'),
          }]
        : []),
      {
        key: 'territorio',
        label: 'Volver al territorio',
        detail: '',
        onPress: () => router.replace('/territorio'),
      },
    ];

    return (
      <View className="flex-1 bg-papel">
        <GranoPapel />
        <Encabezado onVolver={volver} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}>
          <Animated.View entering={fadeUp}>
            <PapelCard className="p-6">
              <View className="flex-row items-start justify-between">
                <ChipTipo etiqueta={kindDefinition?.label ?? ''} activo color={COLOR_POR_KIND[kind]} />
                <Sello texto="RECIBIDA" color="verde" rotacion={-4} />
              </View>
              <Kicker className="mt-6">
                {savedShared ? 'Voz protegida + pulso colectivo' : 'Guardada en privado'}
              </Kicker>
              <TituloAnton tamano="lg" className="mt-2">
                Tu voz tiene refugio. Y también dirección.
              </TituloAnton>
              <Text className="mt-4 font-archivo text-sm leading-6 text-tinta-75">
                {savedShared
                  ? 'El relato completo quedó en tu teléfono. La red recibió sólo las facetas que viste en la vista previa.'
                  : 'La app no la sincronizó: quedó en este dispositivo o perfil. No suma puntos ni alimenta perfiles; protegé el dispositivo si lo comparten otras personas.'}
              </Text>
            </PapelCard>
          </Animated.View>

          {saveNote && (
            <View className="mt-4 border border-ambar px-4 py-3">
              <Text className="font-archivo text-sm leading-6 text-tinta-90">{saveNote}</Text>
            </View>
          )}

          {supportWanted && kind === 'need' && (
            <View className="mt-4 border border-sello px-4 py-3">
              <Text className="font-archivo text-xs leading-5 text-tinta-75">
                Marcaste que querés apoyo. El relato quedó protegido; el próximo paso separa un pedido mínimo, nombra quién lo custodiará y lo mantiene local hasta que exista un permiso territorial verificable.
              </Text>
            </View>
          )}

          <View className="mt-6">
            {acciones.map((accion, i) => (
              <FilaIndice
                key={accion.key}
                numero={String(i + 1).padStart(2, '0')}
                onPress={accion.onPress}
                accessibilityLabel={accion.label}
              >
                <Text className="font-archivo-bold text-base text-tinta">{accion.label}</Text>
                {accion.detail ? (
                  <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-50">{accion.detail}</Text>
                ) : null}
              </FilaIndice>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <Encabezado onVolver={volver} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
        >
          <View
            accessible
            accessibilityLabel={`Paso ${step + 1} de 5`}
            className="mb-7 mt-2 flex-row items-center gap-3"
          >
            <Palitos total={step + 1} de={5} />
            <Text className="font-space text-[11px] uppercase tracking-[1px] text-tinta-50">
              Paso {step + 1} de 5
            </Text>
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
                      <SelectableCard
                        title={item.label}
                        description={item.prompt}
                        selected={selected}
                        color={COLOR_POR_KIND[item.key]}
                        accessibilityLabel={`${item.label}. ${item.prompt}`}
                        onPress={() => chooseKind(item.key)}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {step === 1 && kindDefinition && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow={kindDefinition.action} title={kindDefinition.prompt} body="Escribilo como lo dirías en una ronda de confianza. Este texto nace privado y queda en tu dispositivo." />
              <Kicker tono="neutro" className="mt-7">¿Desde dónde hablás?</Kicker>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_SOURCES.map((item) => (
                  <ChipTipo key={item.key} etiqueta={item.label} activo={source === item.key} onPress={() => setSource(item.key)} />
                ))}
              </View>
              <TextInput
                value={statement}
                onChangeText={setStatement}
                onFocus={() => setEnfocadoRelato(true)}
                onBlur={() => setEnfocadoRelato(false)}
                placeholder="Contalo con tus palabras…"
                placeholderTextColor={TINTA_50}
                multiline
                maxLength={800}
                textAlignVertical="top"
                accessibilityLabel="Relato privado"
                className="mt-6 min-h-[170px] bg-papel-crudo px-5 py-4 font-archivo text-base leading-7 text-tinta"
                style={estiloInput(enfocadoRelato)}
              />
              <Text className="text-right font-space text-xs text-tinta-30">{statement.length}/800</Text>
              <View className="mt-4 border border-verde px-4 py-3">
                <Text className="font-archivo text-xs leading-5 text-tinta-90">Privado por diseño. Tu frase no se envía al mapa ni a la red.</Text>
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow="Dar sentido" title="¿De qué parte de la vida habla?" body="Una buena escucha no registra sólo la falta: también reconoce el resultado deseado y lo que ya sostiene a la comunidad." />
              <View className="mt-7 flex-row flex-wrap gap-2">
                {LISTENING_THEMES.map((item) => (
                  <ChipTipo key={item.key} etiqueta={item.label} activo={theme === item.key} onPress={() => setTheme(item.key)} />
                ))}
              </View>

              <Kicker tono="neutro" className="mt-7">¿Qué resultado serviría de verdad?</Kicker>
              <TextInput
                value={desiredOutcome}
                onChangeText={setDesiredOutcome}
                onFocus={() => setEnfocadoResultado(true)}
                onBlur={() => setEnfocadoResultado(false)}
                maxLength={600}
                multiline
                placeholder="Ej. que ninguna familia tenga que elegir entre comida y alquiler"
                placeholderTextColor={TINTA_50}
                className="mt-2 min-h-20 bg-papel-crudo px-5 py-4 font-archivo text-sm leading-6 text-tinta"
                style={estiloInput(enfocadoResultado)}
              />

              <Kicker tono="neutro" className="mt-6">¿Qué ya ayuda o sostiene esto?</Kicker>
              <TextInput
                value={existingStrength}
                onChangeText={setExistingStrength}
                onFocus={() => setEnfocadoFortaleza(true)}
                onBlur={() => setEnfocadoFortaleza(false)}
                maxLength={600}
                multiline
                placeholder="Personas, saberes, lugares, redes que ya existen…"
                placeholderTextColor={TINTA_50}
                className="mt-2 min-h-20 bg-papel-crudo px-5 py-4 font-archivo text-sm leading-6 text-tinta"
                style={estiloInput(enfocadoFortaleza)}
              />

              <Kicker tono="neutro" className="mt-6">¿Cuál podría ser un primer paso?</Kicker>
              <TextInput
                value={firstStep}
                onChangeText={setFirstStep}
                onFocus={() => setEnfocadoPrimerPaso(true)}
                onBlur={() => setEnfocadoPrimerPaso(false)}
                maxLength={400}
                multiline
                placeholder="Algo pequeño, concreto y posible…"
                placeholderTextColor={TINTA_50}
                className="mt-2 min-h-20 bg-papel-crudo px-5 py-4 font-archivo text-sm leading-6 text-tinta"
                style={estiloInput(enfocadoPrimerPaso)}
              />
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={fadeUp}>
              <StageTitle eyebrow="Contexto sin invadir" title="¿Qué alcance y urgencia tiene?" body="Estas facetas permiten reconocer patrones sin exponer la historia íntima que les da origen." />
              <Kicker tono="neutro" className="mt-7">Horizonte</Kicker>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_HORIZONS.map((item) => (
                  <ChipTipo key={item.key} etiqueta={item.label} activo={horizon === item.key} onPress={() => setHorizon(item.key)} />
                ))}
              </View>
              <Kicker tono="neutro" className="mt-6">Escala</Kicker>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {LISTENING_SCOPES.map((item) => (
                  <ChipTipo key={item.key} etiqueta={item.label} activo={scope === item.key} onPress={() => setScope(item.key)} />
                ))}
              </View>
              <Kicker tono="neutro" className="mt-6">Importancia para vos</Kicker>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <ChipTipo
                    key={value}
                    etiqueta={String(value)}
                    activo={importance === value}
                    accessibilityLabel={`Importancia ${value} de 5`}
                    onPress={() => setImportance(value)}
                  />
                ))}
              </View>
              {(kind === 'need' || kind === 'capacity') && (
                <Pressable97
                  accessibilityRole="checkbox"
                  accessibilityLabel={kind === 'need' ? 'Quiero buscar apoyo' : 'Quiero poner esta capacidad en movimiento'}
                  accessibilityState={{ checked: supportWanted }}
                  accessibilityValue={{ text: supportWanted ? 'Sí' : 'No' }}
                  onPress={() => setSupportWanted((value) => !value)}
                  className="mt-7 min-h-16 flex-row items-center border border-tinta bg-papel-crudo p-4"
                >
                  <View className={`h-6 w-6 items-center justify-center border border-tinta ${supportWanted ? 'bg-violeta' : 'bg-papel-presionado'}`} />
                  <View className="ml-3 flex-1">
                    <Text className="font-archivo-bold text-sm text-tinta">{kind === 'need' ? 'Quiero buscar apoyo' : 'Quiero ponerlo en movimiento'}</Text>
                    <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">
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
                <SelectableCard
                  title="Sólo mi bitácora"
                  description="Todo queda en este dispositivo. No suma puntos ni crea un perfil."
                  selected={destination === 'private'}
                  color={VIOLETA}
                  accessibilityLabel="Sólo mi bitácora"
                  accessibilityRole="radio"
                  onPress={() => setDestination('private')}
                />
                <SelectableCard
                  title="Sumar al pulso colectivo"
                  description="Sólo taxonomías controladas para una radiografía con umbral de privacidad."
                  selected={destination === 'collective'}
                  color={SENAL_POR_KEY.compromiso.color}
                  accessibilityLabel="Sumar facetas al pulso colectivo"
                  accessibilityRole="radio"
                  onPress={() => setDestination('collective')}
                />
              </View>

              {destination === 'collective' && (
                <View className="mt-5 gap-4">
                  <PapelCard className="p-5">
                    <Kicker tono="neutro">Esto sí verá la red</Kicker>
                    <Text className="mt-3 font-archivo-bold text-sm leading-6 text-tinta">{preview}</Text>
                    <View className="mt-4 h-px bg-bordeSuave" />
                    <View className="mt-4 gap-1.5">
                      {['Tu relato y tus notas', 'Tus datos de contacto', 'Tu coordenada exacta'].map((item) => (
                        <Text key={item} className="font-archivo text-xs text-tinta-50">
                          No se comparte: {item.toLowerCase()}
                        </Text>
                      ))}
                    </View>
                  </PapelCard>
                  <GeoAttributionCard
                    value={context}
                    onChange={setContext}
                    title={kind === 'need' ? '¿Dónde se siente esta necesidad?' : kind === 'capacity' ? '¿Dónde puede activarse esta capacidad?' : '¿Con qué territorio dialoga esta voz?'}
                    description="Elegí el lugar del asunto, no tu domicilio. La ubicación y la firma se deciden para este aporte, no para toda tu cuenta."
                  />
                </View>
              )}

              {destination === 'collective' && (
                <Animated.View entering={fadeUp} className="mt-5">
                  {!pactoAceptado ? (
                    <PapelCard className="p-5">
                      <TituloAnton tamano="md">{FTUE.pactoTitulo}</TituloAnton>
                      <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">{FTUE.pactoDetalle}</Text>
                      <View className="mt-5">
                        {FTUE.pacto.map((item, index) => (
                          <View key={item.title} className={index === 0 ? '' : 'mt-4 border-t border-bordeSuave pt-4'}>
                            <Text className="font-archivo-bold text-sm text-tinta">{item.title}</Text>
                            <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-75">{item.detail}</Text>
                          </View>
                        ))}
                      </View>
                      <View className="mt-5 items-start">
                        <BotonTinta etiqueta="Acepto el pacto" variante="fantasma" onPress={aceptarPacto} />
                      </View>
                    </PapelCard>
                  ) : pactoRecienAceptado ? (
                    <View className="flex-row items-center gap-3">
                      <Sello texto="PACTADO" color="violeta" rotacion={3} />
                      <Text className="flex-1 font-archivo text-xs leading-5 text-tinta-50">
                        Ya podés sumar tus facetas al pulso colectivo.
                      </Text>
                    </View>
                  ) : null}
                </Animated.View>
              )}
            </Animated.View>
          )}

          <View className="mt-9 flex-row items-center justify-between gap-4">
            {step > 0 ? (
              <BotonTinta etiqueta="Atrás" variante="fantasma" tamano="compacto" onPress={back} />
            ) : <View />}
            <BotonTinta
              etiqueta={saveLabel}
              onPress={step === 4 ? save : next}
              disabled={!canAdvance || saving || (step === 4 && destination === 'collective' && (!contextReady || !pactoAceptado))}
              cargando={step === 4 && saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
