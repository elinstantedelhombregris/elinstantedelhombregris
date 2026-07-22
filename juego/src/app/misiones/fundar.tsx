/**
 * Fundar una misión (Mission Layer, §0x01): título, propósito, tipo,
 * oficio y gobernanza — el mínimo para que la máquina de estados arranque
 * en PROPUESTA. Fundar te vuelve coordinador/a de entrada (repos-protocolo).
 *
 * Registro papel del sistema Papel y Tinta (spec §8): formulario canónico
 * — bordes tinta, foco violeta, chips cuadrados. Los oficios y el tipo no
 * llevan color (spec §2); la plantilla sí, porque ahí la señal es real.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonTinta, ChipTipo, GranoPapel, Kicker, TituloAnton } from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { PLANTILLAS_EXPEDICION, SENAL_POR_KEY } from '@/content';
import { OFICIOS, type OficioId } from '@/content/oficios';
import { fundarMision } from '@/db/repos-protocolo';
import { fadeUp } from '@/motion/variants';
import type { Gobernanza, TipoMision } from '@/protocolo/tipos';
import { haptic } from '@/theme/haptics';
import { TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

interface TipoMeta {
  id: TipoMision;
  label: string;
}

const TIPOS: readonly TipoMeta[] = [
  { id: 'relevamiento', label: 'Relevamiento' },
  { id: 'obra', label: 'Obra' },
  { id: 'diseno', label: 'Diseño' },
];

interface GobernanzaMeta {
  id: Gobernanza;
  label: string;
  detalle: string;
}

const GOBERNANZAS: readonly GobernanzaMeta[] = [
  { id: 'coordinada', label: 'Coordinada', detalle: 'Una responsable decide, rápido.' },
  { id: 'consentimiento', label: 'Por consentimiento', detalle: 'Decide la mayoría del equipo.' },
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

export default function FundarMision() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [titulo, setTitulo] = useState('');
  const [proposito, setProposito] = useState('');
  const [tipo, setTipo] = useState<TipoMision>('relevamiento');
  const [oficioId, setOficioId] = useState<OficioId | null>(null);
  const [gobernanza, setGobernanza] = useState<Gobernanza>('coordinada');
  const [plantillaId, setPlantillaId] = useState<string | null>(null);
  const [fundando, setFundando] = useState(false);
  const [nota, setNota] = useState<string | null>(null);
  const [enfocadoTitulo, setEnfocadoTitulo] = useState(false);
  const [enfocadoProposito, setEnfocadoProposito] = useState(false);

  const lista = titulo.trim().length > 0 && proposito.trim().length > 0 && oficioId !== null;
  const plantillaSeleccionada = PLANTILLAS_EXPEDICION.find((p) => p.id === plantillaId) ?? null;
  const gobernanzaSeleccionada = GOBERNANZAS.find((g) => g.id === gobernanza) ?? GOBERNANZAS[0]!;

  const fundar = () => {
    if (!lista || !oficioId || fundando) return;
    setFundando(true);
    setNota(null);
    try {
      const row = fundarMision({
        titulo: titulo.trim(),
        proposito: proposito.trim(),
        tipo,
        oficioId,
        gobernanza,
        plantilla:
          tipo === 'relevamiento' && plantillaSeleccionada
            ? {
                plantillaId: plantillaSeleccionada.id,
                titulo: plantillaSeleccionada.titulo,
                // Este form no pide territorio todavía: cae al mismo default
                // ('Mi barrio') que usa Expediciones al fundar una precargada.
                zona: 'Mi barrio',
                meta: plantillaSeleccionada.metaSugerida,
              }
            : undefined,
      });
      haptic.celebrate();
      router.replace({ pathname: '/misiones/[id]', params: { id: row.id } } as never);
    } catch {
      setNota('No pudimos fundarla ahora mismo. Probá de nuevo en un toque.');
      setFundando(false);
    }
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
          <Kicker>un propósito claro · un equipo que se anota</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Fundar una misión
          </TituloAnton>
        </View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={fadeUp}>
            {/* 1 — título */}
            <Kicker tono="neutro">Título</Kicker>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              onFocus={() => setEnfocadoTitulo(true)}
              onBlur={() => setEnfocadoTitulo(false)}
              placeholder="Ej. Relevar veredas rotas"
              placeholderTextColor={TINTA_50}
              maxLength={80}
              accessibilityLabel="Título de la misión"
              className="mt-2 bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoTitulo)}
            />

            {/* 2 — propósito */}
            <Kicker tono="neutro" className="mt-6">
              Propósito
            </Kicker>
            <TextInput
              value={proposito}
              onChangeText={setProposito}
              onFocus={() => setEnfocadoProposito(true)}
              onBlur={() => setEnfocadoProposito(false)}
              placeholder="¿Qué problema resuelve? ¿Para quién?"
              placeholderTextColor={TINTA_50}
              maxLength={280}
              multiline
              accessibilityLabel="Propósito de la misión"
              className="mt-2 min-h-24 bg-papel-crudo px-5 py-4 font-archivo text-sm leading-6 text-tinta"
              style={estiloInput(enfocadoProposito)}
            />

            {/* 3 — tipo */}
            <Kicker tono="neutro" className="mt-6">
              Tipo
            </Kicker>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {TIPOS.map((item) => (
                <ChipTipo
                  key={item.id}
                  etiqueta={item.label}
                  activo={tipo === item.id}
                  onPress={() => setTipo(item.id)}
                />
              ))}
            </View>

            {/* 3b — plantilla de expedición (solo relevamiento, opcional) */}
            {tipo === 'relevamiento' && (
              <>
                <Kicker tono="neutro" className="mt-6">
                  Arrancar desde una plantilla (opcional)
                </Kicker>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {PLANTILLAS_EXPEDICION.map((p) => {
                    const senal = SENAL_POR_KEY[p.senal];
                    const activo = plantillaId === p.id;
                    return (
                      <ChipTipo
                        key={p.id}
                        etiqueta={p.titulo}
                        activo={activo}
                        color={senal.color}
                        accessibilityLabel={`${p.titulo}, meta ${p.metaSugerida} capturas`}
                        onPress={() => setPlantillaId(activo ? null : p.id)}
                      />
                    );
                  })}
                </View>
                {plantillaSeleccionada && (
                  <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-50">
                    {`${plantillaSeleccionada.descripcion} Meta: ${plantillaSeleccionada.metaSugerida} capturas.`}
                  </Text>
                )}
              </>
            )}

            {/* 4 — oficio */}
            <Kicker tono="neutro" className="mt-6">
              Oficio
            </Kicker>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {OFICIOS.map((oficio) => (
                <ChipTipo
                  key={oficio.id}
                  etiqueta={oficio.nombre}
                  activo={oficioId === oficio.id}
                  onPress={() => setOficioId(oficio.id)}
                />
              ))}
            </View>

            {/* 5 — gobernanza */}
            <Kicker tono="neutro" className="mt-6">
              Gobernanza
            </Kicker>
            <View className="mt-2 flex-row gap-2">
              {GOBERNANZAS.map((item) => (
                <ChipTipo
                  key={item.id}
                  etiqueta={item.label}
                  activo={gobernanza === item.id}
                  accessibilityLabel={`${item.label}: ${item.detalle}`}
                  onPress={() => setGobernanza(item.id)}
                />
              ))}
            </View>
            <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-50">
              {gobernanzaSeleccionada.detalle}
            </Text>

            {nota && (
              <View className="mt-6 border border-ambar px-4 py-3">
                <Text className="font-archivo text-xs leading-5 text-tinta-90">{nota}</Text>
              </View>
            )}

            <View className="mt-8 items-center">
              <BotonTinta
                // `key`: ver la nota en corriente.tsx (ObraFila) — Pressable97
                // no reemplaza limpio la clase vieja al cambiar `disabled`/
                // `cargando` en el mismo nodo; remontar lo evita.
                key={fundando ? 'fundando' : 'listo'}
                etiqueta="Fundar →"
                onPress={fundar}
                disabled={!lista || fundando}
                cargando={fundando}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
