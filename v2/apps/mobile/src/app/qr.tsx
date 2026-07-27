/**
 * QR — el hub social cara a cara (spec §3.5): DAR una chispa (5 brasas,
 * QR one-shot), RECIBIR con el escáner (chispas, expediciones, círculos)
 * y el CÍRCULO local v1 (nombre + glifo + ficha que viaja por QR).
 * Sin servidores: todo pasa entre dos teléfonos que se miran.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el bloque QR va
 * sobre PapelCard con borde tinta («pasala en persona») — tinta sobre
 * papel crudo, el contraste que un lector de QR agradece.
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlifoCirculo } from '@/components/juego/GlifoCirculo';
import {
  BotonTinta,
  ChipTipo,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { COMPARTIR, ESTADOS_VACIOS, PLANTILLAS_EXPEDICION } from '@/content';
import {
  canjearNonce,
  crearEstrella,
  expedicionPorId,
  fundarExpedicion,
  ganarBrasas,
  gastarBrasas,
} from '@/db/repos';
import { COSTOS, GANANCIAS, MOTIVOS } from '@/game/brasas';
import { hashSemilla } from '@/game/eventos';
import {
  LIMITES_CHISPA,
  LIMITES_CIRCULO,
  codificarChispa,
  codificarCirculo,
  codificarExpedicion,
  decodificarChispa,
  decodificarCirculo,
  decodificarExpedicion,
  tipoDeQR,
} from '@/game/qr-codec';
import type { ExpeditionRow } from '@/db/schema';
import { guardarCirculo, leerCirculo, leerNombre, nonceAleatorio } from '@/lib/social';
import { bloom, fadeUp } from '@/motion/variants';
import { multiplicadorHoy, useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { PAPEL_CRUDO, TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

type TabQR = 'expedicion' | 'dar' | 'recibir' | 'circulo';

const TABS: { key: TabQR; label: string }[] = [
  { key: 'dar', label: 'Dar' },
  { key: 'recibir', label: 'Recibir' },
  { key: 'circulo', label: 'Círculo' },
];

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

/** El bloque QR canónico: tinta sobre papel crudo, borde tinta. */
function TileQR({ value }: { value: string }) {
  return (
    <View className="border border-tinta bg-papel-crudo p-4">
      <QRCode value={value} size={240} color={TINTA} backgroundColor={PAPEL_CRUDO} />
    </View>
  );
}

function TabExpedicion({ expedition }: { expedition: ExpeditionRow }) {
  let value: string | null = null;
  try {
    value = codificarExpedicion({
      plantillaId: expedition.plantillaId,
      titulo: expedition.titulo,
      zona: expedition.zona,
      meta: expedition.meta,
    });
  } catch {
    // Una expedición antigua puede superar los límites del formato viajero.
  }
  return (
    <Animated.View entering={fadeUp}>
      <Kicker>expedición viajera</Kicker>
      <TituloAnton tamano="md" className="mt-2">
        {expedition.titulo}
      </TituloAnton>
      <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
        Mostrá este código cara a cara. La otra persona recibirá la consigna, la zona y la meta para empezar su propio progreso.
      </Text>
      {value ? (
        <PapelCard className="mt-7 items-center border-tinta p-6">
          <TileQR value={value} />
          <Text className="mt-5 text-center font-archivo-bold text-sm text-tinta">{expedition.zona} · meta {expedition.meta}</Text>
          <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-50">
            No viajan tus capturas, fotos, lugares exactos, recompensas ni avance personal.
          </Text>
        </PapelCard>
      ) : (
        <PapelCard className="mt-7 border-ambar p-6">
          <TituloAnton tamano="md">Esta expedición no entra en un QR seguro.</TituloAnton>
          <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">Conservá tu avance acá y compartí una expedición nueva con un título, zona y meta más breves.</Text>
        </PapelCard>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// DAR — regalar una chispa (QR one-shot)
// ---------------------------------------------------------------------------

function TabDar() {
  const st = useJuego();
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regalando, setRegalando] = useState(false);
  const alcanza = st.brasas >= COSTOS.chispaRegalada;

  const regalar = () => {
    // doble toque no paga dos chispas
    if (regalando) return;
    setRegalando(true);
    setError(null);
    try {
      gastarBrasas(COSTOS.chispaRegalada, MOTIVOS.chispaRegalada);
    } catch {
      setError('No te alcanzan las brasas.');
      setRegalando(false);
      return;
    }
    const nonce = nonceAleatorio();
    // El nonce nace quemado en ESTE teléfono: nadie se regala a sí mismo.
    canjearNonce(nonce);
    setQr(
      codificarChispa({
        nonce,
        brasas: 5,
        de: leerNombre().slice(0, LIMITES_CHISPA.deMax),
      }),
    );
    haptic.send();
    st.refresh();
    // lockout breve: regalar otra a propósito sigue siendo posible
    setTimeout(() => setRegalando(false), 600);
  };

  return (
    <Animated.View entering={fadeUp}>
      <TituloAnton tamano="md">Una chispa es un regalo chico.</TituloAnton>
      <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
        Cinco brasas tuyas que encienden el cielo de otra persona. Se entrega
        como se debe: cara a cara. Quien la escanea recibe cinco brasas y una
        estrella de amistad, de las blancas.
      </Text>

      {qr ? (
        <Animated.View entering={bloom} className="mt-8 items-center">
          <PapelCard className="w-full items-center border-tinta p-6">
            <TileQR value={qr} />
            <Text className="mt-5 text-center font-archivo-bold text-sm text-tinta">
              Mostráselo a alguien en persona.
            </Text>
            <Text className="mt-2 text-center font-archivo text-xs leading-5 text-tinta-50">
              «{COMPARTIR.chispaRegalada}»{'\n'}Vale un solo escaneo. Si salís
              de esta pantalla, la próxima chispa se paga de nuevo.
            </Text>
          </PapelCard>
          <View className="mt-5">
            <BotonTinta
              etiqueta="Regalar otra (5 brasas)"
              variante="fantasma"
              tamano="compacto"
              onPress={regalar}
              disabled={!alcanza || regalando}
            />
          </View>
        </Animated.View>
      ) : (
        <View className="mt-10 items-center">
          <BotonTinta
            etiqueta="Regalar una chispa (5 brasas)"
            onPress={regalar}
            disabled={!alcanza || regalando}
          />
          {!alcanza && (
            <Text className="mt-4 text-center font-archivo text-xs text-tinta-50">
              Te faltan brasas: se ganan encendiendo las luces de cada día.
            </Text>
          )}
        </View>
      )}

      {error && (
        <Text className="mt-4 text-center font-archivo text-sm text-sello">
          {error}
        </Text>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// RECIBIR — el escáner (chispa / expedición / círculo)
// ---------------------------------------------------------------------------

interface ResultadoEscaneo {
  titulo: string;
  detalle: string;
  esExpedicion?: boolean;
}

function TabRecibir() {
  const router = useRouter();
  const st = useJuego();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEscaneo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  // CameraView web es poco confiable: el escáner vive en el teléfono.
  if (Platform.OS === 'web') {
    return (
      <Animated.View entering={fadeUp}>
        <PapelCard className="mt-4 p-8">
          <TituloAnton tamano="md">El escáner vive en el teléfono.</TituloAnton>
          <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
            Desde esta preview no se escanea: abrí ¡BASTA! en tu celular para
            recibir chispas, expediciones y círculos.
          </Text>
        </PapelCard>
      </Animated.View>
    );
  }

  const abrirEscaner = async () => {
    setResultado(null);
    setError(null);
    try {
      if (!permiso?.granted) {
        const r = await pedirPermiso();
        if (!r.granted) {
          setError(
            'Sin permiso de cámara no hay escáner. Se habilita desde los ajustes del teléfono.',
          );
          return;
        }
      }
      scannedRef.current = false;
      setEscaneando(true);
    } catch {
      setError('La cámara no quiso abrir. Probá de nuevo.');
    }
  };

  const procesar = (data: string) => {
    const tipo = tipoDeQR(data);

    if (tipo === null) {
      setError('Ese código no es de ¡BASTA!.');
      return;
    }

    if (tipo === 'chispa') {
      const r = decodificarChispa(data);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (!canjearNonce(r.payload.nonce)) {
        setError('Esta chispa ya prendió.');
        return;
      }
      ganarBrasas(GANANCIAS.chispaRecibida, MOTIVOS.chispaRecibida, {
        multiplicador: multiplicadorHoy(),
      });
      const star = crearEstrella({
        tipo: 'amistad',
        texto: r.payload.de ? `Chispa de ${r.payload.de}` : 'Una chispa cara a cara',
        eventoActivo: st.eventoHoy !== null,
      });
      useJuego.getState().setNewStar(star.id);
      haptic.celebrate();
      st.refresh();
      setResultado({
        titulo: 'La chispa prendió',
        detalle: `${r.payload.de ? `${r.payload.de} te regaló` : 'Te regalaron'} cinco brasas — y nació una estrella de amistad.`,
      });
      return;
    }

    if (tipo === 'expedicion') {
      const r = decodificarExpedicion(data);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (!PLANTILLAS_EXPEDICION.some((p) => p.id === r.payload.plantillaId)) {
        setError('Esa expedición usa una plantilla que esta versión todavía no conoce.');
        return;
      }
      try {
        fundarExpedicion({
          plantillaId: r.payload.plantillaId,
          titulo: r.payload.titulo,
          zona: r.payload.zona,
          meta: r.payload.meta,
          origen: 'qr', // importarla es gratis (spec §3.2)
        });
      } catch {
        setError('No se pudo importar la expedición. Probá escanearla de nuevo.');
        return;
      }
      haptic.celebrate();
      st.refresh();
      setResultado({
        titulo: `Expedición recibida: ${r.payload.titulo}`,
        detalle:
          'Ya está en tu panel de expediciones, gratis y con tu propio progreso. Jugala en tu barrio.',
        esExpedicion: true,
      });
      return;
    }

    // círculo
    const r = decodificarCirculo(data);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    const propio = leerCirculo();
    let titulo: string;
    let detalle: string;
    if (propio === null) {
      guardarCirculo({
        nombre: r.payload.nombre,
        glifoSeed: r.payload.glifoSeed,
        miembros: 2,
      });
      titulo = `Entraste a «${r.payload.nombre}»`;
      detalle =
        'El círculo ahora también es tuyo: dos manos contadas cara a cara. Miralo en la pestaña Círculo.';
    } else {
      const miembros = propio.miembros + 1;
      guardarCirculo({ ...propio, miembros });
      titulo = 'Una mano más en la ronda';
      detalle = `Tu círculo «${propio.nombre}» ahora cuenta ${miembros} manos.`;
    }
    const star = crearEstrella({
      tipo: 'amistad',
      texto: `Círculo: ${r.payload.nombre}`,
      eventoActivo: st.eventoHoy !== null,
    });
    useJuego.getState().setNewStar(star.id);
    haptic.celebrate();
    st.refresh();
    setResultado({ titulo, detalle });
  };

  const irAExpediciones = () => {
    try {
      router.push('/expediciones');
    } catch {
      // Si la ruta todavía no está en este build, no pasa nada:
      // la expedición ya quedó guardada y aparece desde el Cielo.
    }
  };

  return (
    <Animated.View entering={fadeUp}>
      {escaneando ? (
        <View className="mt-4 overflow-hidden border border-tinta">
          <CameraView
            style={{ height: 340 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (scannedRef.current) return;
              scannedRef.current = true;
              haptic.tick();
              setEscaneando(false);
              procesar(data);
            }}
          />
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Cerrar el escáner"
            className="items-center border-t border-tinta bg-papel-crudo py-3"
            onPress={() => setEscaneando(false)}
          >
            <Text className="font-space text-xs uppercase tracking-[2px] text-tinta">Cerrar el escáner</Text>
          </Pressable97>
        </View>
      ) : resultado ? (
        <Animated.View entering={bloom} className="mt-4">
          <PapelCard className="border-tinta p-6">
            <TituloAnton tamano="md">{resultado.titulo}</TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              {resultado.detalle}
            </Text>
            <View className="mt-6 items-start gap-3">
              {resultado.esExpedicion && (
                <BotonTinta etiqueta="Ir a expediciones →" onPress={irAExpediciones} />
              )}
              <BotonTinta
                etiqueta="Escanear otro"
                variante="fantasma"
                tamano="compacto"
                onPress={abrirEscaner}
              />
            </View>
          </PapelCard>
        </Animated.View>
      ) : (
        <View>
          <TituloAnton tamano="md">Escaneá lo que te muestran.</TituloAnton>
          <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
            Una chispa, una expedición o la ficha de un círculo: todo entra
            por acá, cara a cara.
          </Text>
          <View className="mt-8 items-center">
            <BotonTinta etiqueta="Abrir el escáner" onPress={abrirEscaner} />
          </View>
        </View>
      )}

      {error && (
        <Text className="mt-4 text-center font-archivo text-sm text-sello">
          {error}
        </Text>
      )}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// CÍRCULO — fundar el círculo local y mostrar su ficha (v1 mínimo)
// ---------------------------------------------------------------------------

function TabCirculo() {
  const [circulo, setCirculo] = useState(() => leerCirculo());
  const [nombre, setNombre] = useState('');
  const [enfocado, setEnfocado] = useState(false);

  const fundar = () => {
    const limpio = nombre.trim().slice(0, LIMITES_CIRCULO.nombreMax);
    if (!limpio) return;
    const nuevo = {
      nombre: limpio,
      glifoSeed: String(hashSemilla(limpio)),
      miembros: 1,
    };
    guardarCirculo(nuevo);
    setCirculo(nuevo);
    haptic.celebrate();
  };

  if (circulo === null) {
    return (
      <Animated.View entering={fadeUp}>
        <TituloAnton tamano="md">Fundá tu círculo.</TituloAnton>
        <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
          {ESTADOS_VACIOS.circulo}
        </Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          placeholder="El nombre del círculo — el de tu cuadra, tu banda, tu gente."
          placeholderTextColor={TINTA_50}
          maxLength={LIMITES_CIRCULO.nombreMax}
          returnKeyType="done"
          onSubmitEditing={fundar}
          accessibilityLabel="Nombre del círculo"
          className="mt-8 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
          style={estiloInput(enfocado)}
        />
        <View className="mt-6 items-center">
          <BotonTinta etiqueta="Fundar el círculo →" onPress={fundar} disabled={!nombre.trim()} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={fadeUp} className="items-center">
      <PapelCard className="w-full items-center border-tinta p-6">
        <GlifoCirculo seed={circulo.glifoSeed} size={92} color={TINTA} />
        <TituloAnton tamano="md" className="mt-3 text-center">
          {circulo.nombre}
        </TituloAnton>
        <Text className="mt-1 font-space text-sm text-tinta-50">
          {circulo.miembros} {circulo.miembros === 1 ? 'mano' : 'manos'} en la ronda
        </Text>
        <View className="mt-6">
          <TileQR value={codificarCirculo({ nombre: circulo.nombre, glifoSeed: circulo.glifoSeed })} />
        </View>
        <Text className="mt-5 text-center font-archivo text-xs leading-5 text-tinta-50">
          La ficha viaja por QR, cara a cara. Para sumar una mano a tu cuenta,
          escaneá vos el círculo de la otra persona desde Recibir — y que ella
          escanee el tuyo.
        </Text>
      </PapelCard>
      <Text className="mt-4 text-center font-archivo text-[11px] leading-4 text-tinta-50">
        v1 mínimo y honesto: los miembros se cuentan en tu teléfono, sin
        servidores. Los conectores harán el resto después.
      </Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// El hub
// ---------------------------------------------------------------------------

export default function Qr() {
  const router = useRouter();
  const { expedicionId: expeditionIdParam } = useLocalSearchParams<{
    expedicionId?: string | string[];
  }>();
  const insets = useSafeAreaInsets();
  const st = useJuego();
  const expeditionId = Array.isArray(expeditionIdParam) ? expeditionIdParam[0] : expeditionIdParam;
  const expedition = expeditionId ? expedicionPorId(expeditionId) : null;
  const [tab, setTab] = useState<TabQR>(() => expedition ? 'expedicion' : 'dar');
  const tabs = expedition
    ? [{ key: 'expedicion' as const, label: 'Expedición' }, ...TABS]
    : TABS;

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View className="flex-1 bg-papel">
      <GranoPapel />
      <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Compartir tu cielo"
            onPress={() => router.push('/compartir')}
            className="min-h-11 min-w-11 items-center justify-center border border-tinta p-2"
          >
            <Ionicons name="share-social-outline" size={16} color={TINTA} />
          </Pressable97>
        </View>
        <View className="mt-2">
          <Kicker>cara a cara · sin servidores</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Chispas y círculos
          </TituloAnton>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Solapas */}
        <View className="mb-7 flex-row flex-wrap gap-2">
          {tabs.map(({ key, label }) => (
            <ChipTipo
              key={key}
              etiqueta={label}
              activo={tab === key}
              onPress={() => setTab(key)}
            />
          ))}
        </View>

        {tab === 'expedicion' && expedition && <TabExpedicion expedition={expedition} />}
        {tab === 'dar' && <TabDar />}
        {tab === 'recibir' && <TabRecibir />}
        {tab === 'circulo' && <TabCirculo />}

        {/* Las brasas a mano, para saber si alcanza */}
        <Text className="mt-8 text-center font-space text-xs text-tinta-50">
          {st.brasas} brasas tuyas
        </Text>
      </ScrollView>
    </View>
  );
}
