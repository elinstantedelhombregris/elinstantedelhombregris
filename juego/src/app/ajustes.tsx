/**
 * AJUSTES — la ética hecha pantalla (spec §3.7): tu nombre para las chispas,
 * la notificación diaria opt-in de las 20:00 (spec §3.6), el export JSON de
 * TODO con un tap y el borrado total con doble confirmación. Sin ads, sin
 * cuentas, sin nube: los datos viven en el teléfono y se van con vos.
 */

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Platform, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { NOTIFICACIONES } from '@/content';
import { borrarTodo, exportarTodo, getSetting, setSetting } from '@/db/repos';
import { LIMITES_CHISPA } from '@/game/qr-codec';
import { CLAVES_SOCIAL, guardarNombre, leerNombre } from '@/lib/social';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { ACCENT, PLATA } from '@/theme/tokens';

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

/** Las líneas innegociables (spec §3.7) — cortas, para leerse enteras. */
const ETICA = [
  'Cero publicidad. Cero compras. Cero rankings.',
  'Sin cuentas: nadie te pide nombre, mail ni teléfono.',
  'Tus datos viven en tu teléfono y en ningún otro lado.',
  'Exportalos o borralos cuando quieras: son tuyos.',
  'Los eventos expiran en silencio. Nada te apura.',
] as const;

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 font-sans text-[11px] uppercase tracking-[3px] text-slate-500">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Nombre (viaja como `de` en las chispas) ---
  const [nombre, setNombre] = useState(() => leerNombre());
  const cambiarNombre = (v: string) => {
    setNombre(v);
    guardarNombre(v);
  };

  // --- Notificación diaria (20:00 local, opt-in, 1/día máx) ---
  const [notif, setNotif] = useState(
    () => getSetting(CLAVES_SOCIAL.notifDiaria) === '1',
  );
  const [notifNota, setNotifNota] = useState<string | null>(null);
  const [notifOcupado, setNotifOcupado] = useState(false);

  const alternarNotif = async (valor: boolean) => {
    if (notifOcupado) return;
    setNotifOcupado(true);
    setNotifNota(null);
    try {
      if (valor) {
        const perm = await Notifications.requestPermissionsAsync();
        if (!perm.granted) {
          setNotif(false);
          setSetting(CLAVES_SOCIAL.notifDiaria, '0');
          setNotifNota(
            'El teléfono no dio permiso. Se habilita desde los ajustes del sistema.',
          );
          return;
        }
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('cielo', {
            name: 'El cielo',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        // Una sola programada siempre: la diaria de las 20:00.
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: { title: '¡BASTA!', body: NOTIFICACIONES.tuCieloEspera },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 20,
            minute: 0,
            channelId: 'cielo',
          },
        });
        setNotif(true);
        setSetting(CLAVES_SOCIAL.notifDiaria, '1');
        haptic.tick();
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setNotif(false);
        setSetting(CLAVES_SOCIAL.notifDiaria, '0');
      }
    } catch {
      setNotif(false);
      setSetting(CLAVES_SOCIAL.notifDiaria, '0');
      setNotifNota('No se pudo programar el aviso. Probá de nuevo.');
    } finally {
      setNotifOcupado(false);
    }
  };

  // --- Export JSON de todo (spec §3.7) ---
  const [exportNota, setExportNota] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const exportar = async () => {
    if (exportando) return;
    setExportando(true);
    setExportNota(null);
    try {
      const json = JSON.stringify(
        {
          app: '¡BASTA! — el juego',
          appVersion: VERSION,
          ...exportarTodo(),
        },
        null,
        2,
      );
      if (Platform.OS === 'web') {
        // Preview web: sin share sheet confiable — a la consola, con aviso.
        console.log('[¡BASTA!] export JSON:\n', json);
        setExportNota(
          'En esta preview el export salió por la consola del navegador. En el teléfono sale por el share sheet.',
        );
        return;
      }
      const archivo = new File(Paths.cache, 'basta-export.json');
      archivo.create({ intermediates: true, overwrite: true });
      archivo.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(archivo.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Tus datos de ¡BASTA!',
        });
        haptic.send();
      } else {
        setExportNota(`Quedó guardado en ${archivo.uri}`);
      }
    } catch {
      setExportNota('No salió el export. Probá de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  // --- Borrado total (doble confirmación: escribir BORRAR) ---
  const [confirmando, setConfirmando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const puedeBorrar = confirmacion.trim().toUpperCase() === 'BORRAR';

  const borrar = () => {
    if (!puedeBorrar) return;
    borrarTodo();
    useJuego.getState().refresh(); // el store vuelve a cero
    haptic.send();
    router.replace('/'); // el Cielo vacío manda de nuevo al FTUE
  };

  return (
    <View className="flex-1 bg-fondo">
      <PanelHeader title="Ajustes" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <Animated.View entering={fadeUp}>
          {/* Nombre */}
          <Seccion titulo="Tu nombre">
            <GlassCard className="p-4">
              <TextInput
                value={nombre}
                onChangeText={cambiarNombre}
                placeholder="Opcional — viaja en las chispas que regalás"
                placeholderTextColor="#64748b"
                maxLength={LIMITES_CHISPA.deMax}
                className="font-sans text-base text-plata"
              />
            </GlassCard>
            <Text className="mt-2 font-sans text-[11px] leading-4 text-slate-500">
              Solo aparece cuando regalás una chispa, para que sepan de quién
              vino. No sale de los teléfonos que se miran.
            </Text>
          </Seccion>

          {/* Notificación diaria — vive en el teléfono, no en la web */}
          {Platform.OS === 'web' ? (
            <Seccion titulo="Aviso diario">
              <GlassCard className="p-4">
                <Text className="font-sans text-sm leading-6 text-slate-400">
                  Los avisos viven en el teléfono: esta preview no notifica.
                </Text>
              </GlassCard>
            </Seccion>
          ) : (
            <Seccion titulo="Aviso diario">
              <GlassCard className="flex-row items-center justify-between p-4">
                <View className="mr-4 flex-1">
                  <Text className="font-sans-medium text-sm text-plata">
                    «{NOTIFICACIONES.tuCieloEspera}»
                  </Text>
                  <Text className="mt-1 font-sans text-xs leading-5 text-slate-500">
                    {NOTIFICACIONES.optIn}
                  </Text>
                </View>
                <Switch
                  value={notif}
                  onValueChange={alternarNotif}
                  disabled={notifOcupado}
                  trackColor={{ false: 'rgba(255,255,255,0.12)', true: ACCENT }}
                  thumbColor={PLATA}
                  accessibilityLabel="Aviso diario a las ocho de la noche"
                />
              </GlassCard>
              {notifNota && (
                <Text className="mt-2 font-sans text-xs text-slate-400">
                  {notifNota}
                </Text>
              )}
            </Seccion>
          )}

          {/* Export */}
          <Seccion titulo="Tus datos">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Exportar mis datos"
              onPress={exportar}
              disabled={exportando}
            >
              <GlassCard className="flex-row items-center gap-3 p-4">
                <Ionicons name="download-outline" size={18} color={PLATA} />
                <View className="flex-1">
                  <Text className="font-sans-medium text-sm text-plata">
                    {exportando ? 'Preparando…' : 'Exportar mis datos'}
                  </Text>
                  <Text className="mt-0.5 font-sans text-xs leading-4 text-slate-500">
                    Todo en un JSON: estrellas, reflexiones, compromisos,
                    expediciones, brasas. Un tap y es tuyo.
                  </Text>
                </View>
              </GlassCard>
            </Pressable97>
            {exportNota && (
              <Text className="mt-2 font-sans text-xs text-slate-400">
                {exportNota}
              </Text>
            )}
          </Seccion>

          {/* Borrado total */}
          <Seccion titulo="Borrar todo">
            {!confirmando ? (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Borrar todo"
                onPress={() => setConfirmando(true)}
              >
                <GlassCard className="flex-row items-center gap-3 p-4">
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <View className="flex-1">
                    <Text className="font-sans-medium text-sm text-senal-basta">
                      Borrar todo
                    </Text>
                    <Text className="mt-0.5 font-sans text-xs leading-4 text-slate-500">
                      Apaga el cielo entero, acá y para siempre. No hay nube:
                      no hay vuelta atrás.
                    </Text>
                  </View>
                </GlassCard>
              </Pressable97>
            ) : (
              <GlassCard className="border-senal-basta/30 p-4">
                <Text className="font-sans text-sm leading-6 text-slate-300">
                  Se borra TODO: estrellas, bitácora, compromisos,
                  expediciones, brasas y ajustes. Si querés conservarlo,
                  exportalo antes. Para confirmar, escribí{' '}
                  <Text className="font-mono text-senal-basta">BORRAR</Text>.
                </Text>
                <TextInput
                  value={confirmacion}
                  onChangeText={setConfirmacion}
                  placeholder="BORRAR"
                  placeholderTextColor="#64748b"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center font-mono text-base tracking-widest text-plata"
                />
                <View className="mt-4 flex-row items-center justify-center gap-3">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar el borrado"
                    onPress={() => {
                      setConfirmando(false);
                      setConfirmacion('');
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5"
                  >
                    <Text className="font-sans-medium text-xs text-slate-300">
                      Mejor no
                    </Text>
                  </Pressable97>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Borrar para siempre"
                    onPress={borrar}
                    disabled={!puedeBorrar}
                    className={`rounded-full border border-senal-basta/40 bg-senal-basta/10 px-5 py-2.5 ${puedeBorrar ? '' : 'opacity-40'}`}
                  >
                    <Text className="font-sans-medium text-xs text-senal-basta">
                      Borrar para siempre
                    </Text>
                  </Pressable97>
                </View>
              </GlassCard>
            )}
          </Seccion>

          {/* Ética */}
          <Seccion titulo="La ética del juego">
            <GlassCard className="p-5">
              {ETICA.map((linea, i) => (
                <Animated.View
                  key={linea}
                  entering={staggerDelay(i)}
                  className={`flex-row items-start gap-2.5 ${i > 0 ? 'mt-3' : ''}`}
                >
                  <Text className="font-sans text-sm text-slate-600">·</Text>
                  <Text className="flex-1 font-sans text-sm leading-6 text-slate-300">
                    {linea}
                  </Text>
                </Animated.View>
              ))}
            </GlassCard>
          </Seccion>

          <Text className="mt-2 text-center font-mono text-[11px] text-slate-600">
            v{VERSION} — local, tuyo, sin vueltas.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
