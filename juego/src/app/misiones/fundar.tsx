/**
 * Fundar una misión (Mission Layer, §0x01): título, propósito, tipo,
 * oficio y gobernanza — el mínimo para que la máquina de estados arranque
 * en PROPUESTA. Fundar te vuelve coordinador/a de entrada (repos-protocolo).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentButton } from '@/components/ui/AccentButton';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { OFICIOS, type OficioId } from '@/content/oficios';
import { fundarMision } from '@/db/repos-protocolo';
import { fadeUp } from '@/motion/variants';
import type { Gobernanza, TipoMision } from '@/protocolo/tipos';
import { haptic } from '@/theme/haptics';

interface TipoMeta {
  id: TipoMision;
  label: string;
  icon: string;
  color: string;
}

const TIPOS: readonly TipoMeta[] = [
  { id: 'relevamiento', label: 'Relevamiento', icon: 'search-outline', color: '#7DD3FC' },
  { id: 'obra', label: 'Obra', icon: 'construct-outline', color: '#F59E0B' },
  { id: 'diseno', label: 'Diseño', icon: 'color-palette-outline', color: '#EC4899' },
];

interface GobernanzaMeta {
  id: Gobernanza;
  label: string;
  detalle: string;
  icon: string;
  color: string;
}

const GOBERNANZAS: readonly GobernanzaMeta[] = [
  {
    id: 'coordinada',
    label: 'Coordinada',
    detalle: 'Una responsable decide, rápido.',
    icon: 'flash-outline',
    color: '#7DD3FC',
  },
  {
    id: 'consentimiento',
    label: 'Por consentimiento',
    detalle: 'Decide la mayoría del equipo.',
    icon: 'people-outline',
    color: '#6EE7B7',
  },
];

export default function FundarMision() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [titulo, setTitulo] = useState('');
  const [proposito, setProposito] = useState('');
  const [tipo, setTipo] = useState<TipoMision>('relevamiento');
  const [oficioId, setOficioId] = useState<OficioId | null>(null);
  const [gobernanza, setGobernanza] = useState<Gobernanza>('coordinada');
  const [fundando, setFundando] = useState(false);
  const [nota, setNota] = useState<string | null>(null);

  const lista = titulo.trim().length > 0 && proposito.trim().length > 0 && oficioId !== null;

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
      });
      haptic.celebrate();
      router.replace({ pathname: '/misiones/[id]', params: { id: row.id } } as never);
    } catch {
      setNota('No pudimos fundarla ahora mismo. Probá de nuevo en un toque.');
      setFundando(false);
    }
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Fundar una misión" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={fadeUp}>
            <Text className="mt-1 font-serif text-2xl leading-9 text-plata">
              Una misión nace de un propósito claro y un equipo que se anota.
            </Text>

            {/* 1 — título */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Título
            </Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej. Relevar veredas rotas"
              placeholderTextColor="#64748b"
              maxLength={80}
              className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-base text-plata"
            />

            {/* 2 — propósito */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Propósito
            </Text>
            <TextInput
              value={proposito}
              onChangeText={setProposito}
              placeholder="¿Qué problema resuelve? ¿Para quién?"
              placeholderTextColor="#64748b"
              maxLength={280}
              multiline
              className="mt-3 min-h-24 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-sans text-sm leading-6 text-plata"
            />

            {/* 3 — tipo */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Tipo
            </Text>
            <View className="mt-3 flex-row gap-2">
              {TIPOS.map((item) => {
                const activo = tipo === item.id;
                return (
                  <Pressable97
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: activo }}
                    onPress={() => setTipo(item.id)}
                    className="min-h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-full border px-2 py-3"
                    style={{
                      borderColor: activo ? `${item.color}66` : 'rgba(255,255,255,0.1)',
                      backgroundColor: activo ? `${item.color}1c` : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Ionicons name={item.icon as never} size={15} color={activo ? item.color : '#64748b'} />
                    <Text
                      className="font-sans-medium text-xs"
                      style={{ color: activo ? item.color : '#94a3b8' }}
                    >
                      {item.label}
                    </Text>
                  </Pressable97>
                );
              })}
            </View>

            {/* 4 — oficio */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Oficio
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {OFICIOS.map((oficio) => {
                const activo = oficioId === oficio.id;
                return (
                  <Pressable97
                    key={oficio.id}
                    accessibilityRole="button"
                    accessibilityLabel={oficio.nombre}
                    accessibilityState={{ selected: activo }}
                    onPress={() => setOficioId(oficio.id)}
                    className="min-h-11 flex-row items-center gap-2 rounded-full border px-3.5 py-2.5"
                    style={{
                      borderColor: activo ? `${oficio.color}66` : 'rgba(255,255,255,0.1)',
                      backgroundColor: activo ? `${oficio.color}1c` : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Ionicons name={oficio.icono as never} size={14} color={activo ? oficio.color : '#64748b'} />
                    <Text
                      className="font-sans-medium text-xs"
                      style={{ color: activo ? oficio.color : '#94a3b8' }}
                    >
                      {oficio.nombre}
                    </Text>
                  </Pressable97>
                );
              })}
            </View>

            {/* 5 — gobernanza */}
            <Text className="mt-7 font-sans text-[11px] uppercase tracking-[3px] text-slate-400">
              Gobernanza
            </Text>
            <View className="mt-3 gap-2.5">
              {GOBERNANZAS.map((item) => {
                const activo = gobernanza === item.id;
                return (
                  <Pressable97
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityLabel={`${item.label}: ${item.detalle}`}
                    accessibilityState={{ selected: activo }}
                    onPress={() => setGobernanza(item.id)}
                    className="flex-row items-center gap-3 rounded-2xl border p-4"
                    style={{
                      borderColor: activo ? `${item.color}66` : 'rgba(255,255,255,0.1)',
                      backgroundColor: activo ? `${item.color}14` : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Ionicons name={item.icon as never} size={18} color={activo ? item.color : '#64748b'} />
                    <View className="flex-1">
                      <Text
                        className="font-sans-medium text-sm"
                        style={{ color: activo ? item.color : '#e2e8f0' }}
                      >
                        {item.label}
                      </Text>
                      <Text className="mt-0.5 font-sans text-[11px] text-slate-500">{item.detalle}</Text>
                    </View>
                    <Ionicons
                      name={activo ? 'radio-button-on' : 'radio-button-off'}
                      size={17}
                      color={activo ? item.color : '#475569'}
                    />
                  </Pressable97>
                );
              })}
            </View>

            {nota && (
              <View className="mt-6 flex-row items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <Ionicons name="alert-circle-outline" size={16} color="#FCD34D" />
                <Text className="flex-1 font-sans text-xs leading-5 text-amber-100">{nota}</Text>
              </View>
            )}

            <View className="mt-8 items-center">
              <AccentButton
                label={fundando ? 'Fundando…' : 'Fundar'}
                onPress={fundar}
                disabled={!lista || fundando}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
