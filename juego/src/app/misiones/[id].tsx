/**
 * Detalle de misión (Mission Layer, §0x01): la máquina de estados en vivo.
 * Toda transición pasa por `transicionar`, que delega en el motor puro
 * (protocolo/mision.ts) — acá sólo se compone, nunca se decide de nuevo.
 * Errores de gobernanza o de transición inválida se muestran como nota
 * inline; jamás un crash, jamás un Alert.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): el expediente de la
 * misión. Al resolver, un sello RESUELTA cae antes de pasar a publicar
 * la obra (spec §5).
 */

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { actorKeyCacheado } from '@/civic/actor-cache';
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
import { PLANTILLAS_EXPEDICION, SENAL_POR_KEY } from '@/content';
import { oficioPorId } from '@/content/oficios';
import { ahoraISO, entradasDeExpedicion, expedicionPorId } from '@/db/repos';
import { misionPorId, registrarLatido, sumarseAMision, transicionar } from '@/db/repos-protocolo';
import type { ExpeditionRow } from '@/db/schema';
import { progresoExpedicion } from '@/game/expediciones';
import { fadeUp } from '@/motion/variants';
import { latidoVencido } from '@/protocolo/pulsos';
import type { EstadoMision, Gobernanza, TipoMision } from '@/protocolo/tipos';
import { haptic } from '@/theme/haptics';
import { AMBAR_PT, ROJO_SELLO, TINTA_30, TINTA_50, VERDE, VIOLETA } from '@/theme/tokens';

/** El sello «RESUELTA» queda a la vista antes de saltar a publicar la obra
 * (spec §5): ni instantáneo, ni una espera larga. */
const DEMORA_SELLO_MS = 900;

const ESTADO_LABEL: Record<EstadoMision, string> = {
  propuesta: 'Convocando',
  equipo: 'Equipo listo',
  activa: 'En marcha',
  verificacion: 'En verificación',
  resuelta: 'Resuelta',
  abandonada: 'Abandonada',
};

const ESTADO_COLOR: Record<EstadoMision, string> = {
  propuesta: VIOLETA,
  equipo: VIOLETA,
  activa: VERDE,
  verificacion: AMBAR_PT,
  resuelta: TINTA_50,
  abandonada: TINTA_30,
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
  const expeditionIdInicial = datos?.mision.expeditionId ?? null;
  const [exp, setExp] = useState<ExpeditionRow | null>(() =>
    expeditionIdInicial ? expedicionPorId(expeditionIdInicial) : null,
  );
  const [capturas, setCapturas] = useState(() =>
    expeditionIdInicial ? entradasDeExpedicion(expeditionIdInicial).length : 0,
  );
  const [ocupado, setOcupado] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [confirmarAbandono, setConfirmarAbandono] = useState(false);
  const [selloResuelta, setSelloResuelta] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const recargar = useCallback(() => {
    const d = id ? misionPorId(id) : null;
    setDatos(d);
    const expeditionId = d?.mision.expeditionId ?? null;
    setExp(expeditionId ? expedicionPorId(expeditionId) : null);
    setCapturas(expeditionId ? entradasDeExpedicion(expeditionId).length : 0);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  const mision = datos?.mision ?? null;
  const miembros = datos?.miembros ?? [];

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!mision) {
    return (
      <View className="flex-1 bg-papel">
        <GranoPapel />
        <View className="px-5" style={{ paddingTop: insets.top + 12 }}>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            className="-ml-2 min-h-11 min-w-11 items-center justify-center self-start"
          >
            <Text className="font-space text-2xl text-tinta">←</Text>
          </Pressable97>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <PapelCard className="w-full p-6">
            <TituloAnton tamano="md">No está más.</TituloAnton>
            <Text className="mt-3 font-archivo text-sm leading-6 text-tinta-75">
              Esa misión no existe en este dispositivo. Volvé al panel y
              fundá otra — nada es permanente, todo es misión.
            </Text>
          </PapelCard>
        </View>
      </View>
    );
  }

  const oficio = oficioPorId(mision.oficioId);
  // Un estado fuera del enum (dato viejo, migración a medio camino) degrada
  // a una nota neutra en vez de tirar la pantalla abajo.
  const estadoConocido = mision.estado as EstadoMision;
  const estadoMeta = ESTADO_LABEL[estadoConocido]
    ? { label: ESTADO_LABEL[estadoConocido], color: ESTADO_COLOR[estadoConocido] }
    : { label: mision.estado, color: TINTA_50 };

  // Expedición vinculada (si esta misión de relevamiento fue fundada con
  // plantilla, o se re-vinculó después). `exp` puede ser null aunque
  // `mision.expeditionId` exista (p. ej. la expedición se borró): se
  // degrada a no mostrar la card, nunca a un crash.
  const plantillaExp = exp
    ? PLANTILLAS_EXPEDICION.find((p) => p.id === exp.plantillaId)
    : undefined;
  const colorExp = plantillaExp ? SENAL_POR_KEY[plantillaExp.senal].color : undefined;
  const progreso = exp ? progresoExpedicion(capturas, exp.meta) : null;
  const expedicionVinculadaVisible =
    Boolean(mision.expeditionId) && exp !== null
    && (mision.estado === 'activa' || mision.estado === 'verificacion');

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

  // El sello ENCENDIDA de Sello.tsx dispara su propio haptic.celebrate() al
  // montar — no hace falta llamarlo acá también.
  const resolver = () =>
    irA('resuelta', () => {
      setSelloResuelta(true);
      timeoutRef.current = setTimeout(() => {
        router.push({ pathname: '/obras/publicar', params: { misionId: mision.id } } as never);
      }, DEMORA_SELLO_MS);
    });

  const abandonar = () => irA('abandonada', () => setConfirmarAbandono(false));

  const enCurso = ['propuesta', 'equipo', 'activa'].includes(mision.estado);
  const yaEsMiembro = miembros.some((m) => m.actorKey === actorKeyCacheado());

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
          <Kicker>{TIPO_LABEL[mision.tipo as TipoMision] ?? mision.tipo}</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            {mision.titulo}
          </TituloAnton>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View entering={fadeUp}>
          <PapelCard className="p-6">
            <ChipTipo etiqueta={estadoMeta.label} activo color={estadoMeta.color} />
            <Text className="mt-4 font-archivo text-sm leading-6 text-tinta-75">{mision.proposito}</Text>
            <View className="mt-5 flex-row flex-wrap gap-2">
              {oficio && <ChipTipo etiqueta={oficio.nombre} />}
              <ChipTipo etiqueta={GOBERNANZA_LABEL[mision.gobernanza as Gobernanza]} />
              {mision.territorio && <ChipTipo etiqueta={mision.territorio} />}
            </View>
          </PapelCard>
        </Animated.View>

        {nota && (
          <View className="mt-4 border border-ambar px-4 py-3">
            <Text className="font-archivo text-xs leading-5 text-tinta-90">{nota}</Text>
          </View>
        )}

        <Kicker tono="neutro" className="mt-8">
          {`Equipo · ${miembros.length}`}
        </Kicker>
        <View className="mt-2">
          {miembros.map((m, i) => {
            const vencido = latidoVencido(m.ultimoLatidoAt, ahoraISO());
            const esVos = m.actorKey === actorKeyCacheado();
            return (
              <FilaIndice key={m.actorKey} numero={pad3(i + 1)} glifo="">
                <View className="flex-row items-center justify-between">
                  <Text className="font-archivo text-sm text-tinta">
                    {m.rol === 'coordinador' ? 'Coordinador/a' : 'Miembro'}
                    {esVos ? ' · vos' : ''}
                  </Text>
                  {vencido && (
                    <Text className="font-space text-[10px] uppercase tracking-[1px]" style={{ color: AMBAR_PT }}>
                      sin latido
                    </Text>
                  )}
                </View>
              </FilaIndice>
            );
          })}
        </View>

        {expedicionVinculadaVisible && exp && (
          <PapelCard className="mt-8 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-3 font-archivo-bold text-sm text-tinta">Expedición vinculada</Text>
              <Text className="font-space text-xs text-tinta-50">{`${capturas} de ${exp.meta}`}</Text>
            </View>
            <Text className="mt-1 font-archivo text-xs text-tinta-50">{exp.titulo}</Text>
            <View className="mt-3">
              <Palitos total={capturas} de={exp.meta} color={colorExp} />
            </View>
            <View className="mt-4 items-start">
              <BotonTinta
                etiqueta="Capturar →"
                variante="fantasma"
                tamano="compacto"
                onPress={() =>
                  router.push({ pathname: '/expediciones/[id]', params: { id: exp.id } } as never)
                }
              />
            </View>
          </PapelCard>
        )}

        {mision.estado === 'propuesta' && (
          <View className="mt-8 gap-3">
            <BotonTinta
              etiqueta="Cerrar convocatoria"
              onPress={() => irA('equipo')}
              disabled={ocupado}
              cargando={ocupado}
            />
            {yaEsMiembro ? (
              <Text className="text-center font-archivo text-xs text-tinta-50">
                Ya sos parte de esta misión.
              </Text>
            ) : (
              <BotonTinta
                etiqueta="Sumarme"
                variante="fantasma"
                onPress={sumarme}
                disabled={ocupado}
              />
            )}
          </View>
        )}

        {mision.estado === 'equipo' && (
          <View className="mt-8 items-center">
            <BotonTinta
              etiqueta="Arrancar"
              onPress={() => irA('activa')}
              disabled={ocupado}
              cargando={ocupado}
            />
          </View>
        )}

        {mision.estado === 'activa' && (
          <View className="mt-8 gap-3">
            {exp && progreso && progreso.estado !== 'completa' && (
              <View className="border border-bordeSuave px-4 py-3">
                <Text className="font-archivo text-xs leading-5 text-tinta-75">
                  La expedición va {capturas} de {exp.meta} — podés presentar igual.
                </Text>
              </View>
            )}
            <BotonTinta
              etiqueta="Presentar resultado"
              onPress={() => irA('verificacion')}
              disabled={ocupado}
              cargando={ocupado}
            />
            <BotonTinta
              etiqueta="Dar latido"
              variante="fantasma"
              onPress={darLatido}
              disabled={ocupado}
            />
          </View>
        )}

        {mision.estado === 'verificacion' && (
          <View className="mt-8 gap-3">
            <BotonTinta
              etiqueta="Aceptar y resolver"
              onPress={resolver}
              disabled={ocupado}
              cargando={ocupado}
            />
            <BotonTinta
              etiqueta="Volver a activa"
              variante="fantasma"
              onPress={() => irA('activa')}
              disabled={ocupado}
            />
          </View>
        )}

        {(mision.estado === 'resuelta' || mision.estado === 'abandonada') && (
          <PapelCard className="mt-8 p-5">
            <Text className="font-archivo text-sm leading-6 text-tinta-75">
              {mision.estado === 'resuelta'
                ? 'Esta misión ya se resolvió y quedó disuelta. La obra vive en La Corriente.'
                : 'Esta misión fue abandonada. Nada es permanente — se puede fundar otra.'}
            </Text>
          </PapelCard>
        )}

        {enCurso && (
          <View className="mt-6 items-center">
            {!confirmarAbandono ? (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Abandonar esta misión"
                onPress={() => setConfirmarAbandono(true)}
                disabled={ocupado}
                className="min-h-11 justify-center px-4 py-2"
              >
                <Text className="font-space text-xs text-tinta-50">Abandonar</Text>
              </Pressable97>
            ) : (
              <View className="w-full border p-4" style={{ borderColor: ROJO_SELLO }}>
                <Text className="font-archivo text-xs leading-5 text-tinta-90">
                  ¿Seguro que la querés abandonar? La misión se cierra y no vuelve atrás.
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <BotonTinta
                    etiqueta="Cancelar"
                    variante="fantasma"
                    onPress={() => setConfirmarAbandono(false)}
                    disabled={ocupado}
                    className="flex-1"
                  />
                  <BotonTinta
                    etiqueta={ocupado ? 'Abandonando…' : 'Sí, abandonar'}
                    variante="fantasma"
                    onPress={abandonar}
                    disabled={ocupado}
                    className="flex-1"
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {selloResuelta && (
        <View
          pointerEvents="auto"
          className="absolute inset-0 items-center justify-center bg-papel/85"
          style={{ zIndex: 60 }}
        >
          <Sello texto="RESUELTA" color="verde" rotacion={4} />
        </View>
      )}
    </View>
  );
}

const pad3 = (n: number): string => String(n).padStart(3, '0');
