/**
 * QR — el hub social cara a cara (spec §3.5): DAR una chispa (5 brasas,
 * QR one-shot), RECIBIR con el escáner (chispas, expediciones, círculos)
 * y el CÍRCULO local v1 (nombre + glifo + ficha que viaja por QR).
 * Sin servidores: todo pasa entre dos teléfonos que se miran.
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
import { AccentButton } from '@/components/ui/AccentButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
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
import { PLATA } from '@/theme/tokens';

type TabQR = 'expedicion' | 'dar' | 'recibir' | 'circulo';

const TABS: { key: TabQR; label: string }[] = [
  { key: 'dar', label: 'Dar' },
  { key: 'recibir', label: 'Recibir' },
  { key: 'circulo', label: 'Círculo' },
];

/** Tile plata con el QR adentro — máximo contraste sobre la card oscura. */
function TileQR({ value }: { value: string }) {
  return (
    <View className="rounded-2xl bg-plata p-4">
      <QRCode value={value} size={240} color="#0a0a0a" backgroundColor={PLATA} />
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
      <Text className="font-sans text-[10px] uppercase tracking-[2.5px] text-violet-300">Expedición viajera</Text>
      <Text className="mt-3 font-serif text-2xl leading-9 text-plata">{expedition.titulo}</Text>
      <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
        Mostrá este código cara a cara. La otra persona recibirá la consigna, la zona y la meta para empezar su propio progreso.
      </Text>
      {value ? (
        <GlassCard className="mt-7 items-center p-6">
          <TileQR value={value} />
          <Text className="mt-5 text-center font-sans-medium text-sm text-plata">{expedition.zona} · meta {expedition.meta}</Text>
          <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-500">
            No viajan tus capturas, fotos, lugares exactos, recompensas ni avance personal.
          </Text>
        </GlassCard>
      ) : (
        <GlassCard className="mt-7 items-center p-6">
          <Ionicons name="alert-circle-outline" size={30} color="#FCD34D" />
          <Text className="mt-4 text-center font-serif text-xl text-plata">Esta expedición no entra en un QR seguro.</Text>
          <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-400">Conservá tu avance acá y compartí una expedición nueva con un título, zona y meta más breves.</Text>
        </GlassCard>
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
      <Text className="font-serif text-2xl leading-9 text-plata">
        Una chispa es un regalo chico: cinco brasas tuyas que encienden el
        cielo de otra persona.
      </Text>
      <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
        Se entrega como se debe: cara a cara. Quien la escanea recibe cinco
        brasas y una estrella de amistad — de las que brillan plata.
      </Text>

      {qr ? (
        <Animated.View entering={bloom} className="mt-8 items-center">
          <GlassCard className="w-full items-center p-6">
            <TileQR value={qr} />
            <Text className="mt-5 text-center font-sans-medium text-sm text-plata">
              Mostráselo a alguien en persona.
            </Text>
            <Text className="mt-2 text-center font-sans text-xs leading-5 text-slate-500">
              «{COMPARTIR.chispaRegalada}»{'\n'}Vale un solo escaneo. Si salís
              de esta pantalla, la próxima chispa se paga de nuevo.
            </Text>
          </GlassCard>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Regalar otra chispa"
            onPress={regalar}
            disabled={!alcanza || regalando}
            className={`mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 ${alcanza ? '' : 'opacity-40'}`}
          >
            <Text className="font-sans-medium text-xs text-slate-300">
              Regalar otra (5 brasas)
            </Text>
          </Pressable97>
        </Animated.View>
      ) : (
        <View className="mt-10 items-center">
          <AccentButton
            label="Regalar una chispa (5 brasas)"
            onPress={regalar}
            disabled={!alcanza || regalando}
          />
          {!alcanza && (
            <Text className="mt-4 text-center font-sans text-xs text-slate-500">
              Te faltan brasas: se ganan encendiendo las luces de cada día.
            </Text>
          )}
        </View>
      )}

      {error && (
        <Text className="mt-4 text-center font-sans text-sm text-senal-basta">
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
  icono: 'sparkles' | 'map-outline' | 'people-outline';
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
        <GlassCard className="mt-4 items-center p-8">
          <Ionicons name="phone-portrait-outline" size={32} color="#94a3b8" />
          <Text className="mt-4 text-center font-serif text-xl text-plata">
            El escáner vive en el teléfono.
          </Text>
          <Text className="mt-3 text-center font-sans text-sm leading-6 text-slate-400">
            Desde esta preview no se escanea: abrí ¡BASTA! en tu celular para
            recibir chispas, expediciones y círculos.
          </Text>
        </GlassCard>
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
        icono: 'sparkles',
        titulo: 'La chispa prendió',
        detalle: `${r.payload.de ? `${r.payload.de} te regaló` : 'Te regalaron'} cinco brasas — y nació una estrella de amistad, de las que brillan plata.`,
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
        icono: 'map-outline',
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
    setResultado({ icono: 'people-outline', titulo, detalle });
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
        <View className="mt-4 overflow-hidden rounded-2xl border border-white/10">
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
            className="items-center bg-white/5 py-3"
            onPress={() => setEscaneando(false)}
          >
            <Text className="font-sans text-sm text-slate-300">Cerrar el escáner</Text>
          </Pressable97>
        </View>
      ) : resultado ? (
        <Animated.View entering={bloom} className="mt-4">
          <GlassCard className="items-center p-6">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5">
              <Ionicons name={resultado.icono} size={28} color={PLATA} />
            </View>
            <Text className="mt-5 text-center font-serif text-2xl text-plata">
              {resultado.titulo}
            </Text>
            <Text className="mt-3 text-center font-sans text-sm leading-6 text-slate-400">
              {resultado.detalle}
            </Text>
            {resultado.esExpedicion && (
              <View className="mt-6">
                <AccentButton label="Ir a expediciones" onPress={irAExpediciones} />
              </View>
            )}
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Escanear otro código"
              onPress={abrirEscaner}
              className="mt-5 px-4 py-2"
            >
              <Text className="font-sans text-xs text-slate-500">Escanear otro</Text>
            </Pressable97>
          </GlassCard>
        </Animated.View>
      ) : (
        <View>
          <Text className="font-serif text-2xl leading-9 text-plata">
            Escaneá lo que te muestran.
          </Text>
          <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
            Una chispa, una expedición o la ficha de un círculo: todo entra
            por acá, cara a cara.
          </Text>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Abrir el escáner"
            className="mt-8"
            onPress={abrirEscaner}
          >
            <GlassCard className="items-center p-8">
              <Ionicons name="qr-code-outline" size={40} color="#94a3b8" />
              <Text className="mt-3 font-sans-medium text-sm text-slate-200">
                Abrir el escáner
              </Text>
            </GlassCard>
          </Pressable97>
        </View>
      )}

      {error && (
        <Text className="mt-4 text-center font-sans text-sm text-senal-basta">
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
        <Text className="font-serif text-2xl leading-9 text-plata">
          Fundá tu círculo.
        </Text>
        <Text className="mt-3 font-sans text-sm leading-6 text-slate-400">
          {ESTADOS_VACIOS.circulo}
        </Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="El nombre del círculo — el de tu cuadra, tu banda, tu gente."
          placeholderTextColor="#64748b"
          maxLength={LIMITES_CIRCULO.nombreMax}
          returnKeyType="done"
          onSubmitEditing={fundar}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
        />
        <View className="mt-6 items-center">
          <AccentButton label="Fundar el círculo" onPress={fundar} disabled={!nombre.trim()} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={fadeUp} className="items-center">
      <GlassCard className="w-full items-center p-6">
        <GlifoCirculo seed={circulo.glifoSeed} size={92} />
        <Text className="mt-3 text-center font-serif text-2xl text-plata">
          {circulo.nombre}
        </Text>
        <Text className="mt-1 font-mono text-sm text-slate-400">
          {circulo.miembros} {circulo.miembros === 1 ? 'mano' : 'manos'} en la ronda
        </Text>
        <View className="mt-6">
          <TileQR value={codificarCirculo({ nombre: circulo.nombre, glifoSeed: circulo.glifoSeed })} />
        </View>
        <Text className="mt-5 text-center font-sans text-xs leading-5 text-slate-500">
          La ficha viaja por QR, cara a cara. Para sumar una mano a tu cuenta,
          escaneá vos el círculo de la otra persona desde Recibir — y que ella
          escanee el tuyo.
        </Text>
      </GlassCard>
      <Text className="mt-4 text-center font-sans text-[11px] leading-4 text-slate-600">
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

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader
        title="Chispas y círculos"
        right={
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Compartir tu cielo"
            onPress={() => router.push('/compartir')}
            className="rounded-full border border-white/10 bg-white/5 p-2"
          >
            <Ionicons name="share-social-outline" size={18} color="#94a3b8" />
          </Pressable97>
        }
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* Segmentos */}
        <View className="mb-7 flex-row rounded-full border border-white/10 bg-white/5 p-1">
          {tabs.map(({ key, label }) => (
            <Pressable97
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => setTab(key)}
              className={`flex-1 items-center rounded-full py-2 ${tab === key ? 'bg-white/10' : ''}`}
            >
              <Text
                className={`font-sans-medium text-xs ${tab === key ? 'text-plata' : 'text-slate-500'}`}
              >
                {label}
              </Text>
            </Pressable97>
          ))}
        </View>

        {tab === 'expedicion' && expedition && <TabExpedicion expedition={expedition} />}
        {tab === 'dar' && <TabDar />}
        {tab === 'recibir' && <TabRecibir />}
        {tab === 'circulo' && <TabCirculo />}

        {/* Las brasas a mano, para saber si alcanza */}
        <View className="mt-8 flex-row items-center justify-center gap-1.5">
          <Ionicons name="flame" size={13} color="#F59E0B" />
          <Text className="font-mono text-xs text-brasa">{st.brasas}</Text>
          <Text className="font-sans text-xs text-slate-600">brasas tuyas</Text>
        </View>
      </ScrollView>
    </View>
  );
}
