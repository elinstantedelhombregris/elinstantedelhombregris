/**
 * AJUSTES — la ética hecha pantalla (spec §3.7): tu nombre para las chispas,
 * la notificación diaria opt-in de las 20:00 (spec §3.6), el export JSON de
 * TODO con un tap y el borrado local con doble confirmación. La bitácora y
 * los borradores son locales; lo que la persona publica puede sincronizarse.
 */

import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { calentarActorKey, invalidarActorKey } from '@/civic/actor-cache';
import { resetCommunitySessionAndFeed } from '@/civic/community-auth';
import {
  cachedEvidenceUrisFromExport,
  countPendingNetworkRevocations,
} from '@/civic/data-erasure';
import { resetCivicDeviceCredentials } from '@/civic/device-auth';
import {
  beginNeedGrantSafeLocalErase,
  countPendingNeedGrantRemoteRevocations,
  countPersistedWebNeedGrantRemoteRevocations,
  revokePendingNeedGrantsBeforeLocalErase,
  withNeedGrantSafeLocalEraseLock,
} from '@/civic/need-access-grant-delivery';
import {
  authorizedFieldsForReceipt,
  disclosureReceiptsAll,
} from '@/civic/disclosure-ledger';
import { readableAuthorizedFields } from '@/civic/disclosure-receipt';
import { resetCivicActorKey } from '@/civic/identity';
import { unacknowledgedOutbox } from '@/civic/repo';
import { flushCivicOutbox } from '@/civic/sync';
import { GlassCard } from '@/components/ui/GlassCard';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { Pressable97 } from '@/components/ui/Pressable97';
import { NOTIFICACIONES } from '@/content';
import { flushWebDatabaseSnapshot } from '@/db/client';
import { borrarTodo, exportarTodo, getSetting, setSetting } from '@/db/repos';
import { LIMITES_CHISPA } from '@/game/qr-codec';
import { CLAVES_SOCIAL, guardarNombre, leerNombre } from '@/lib/social';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { ACCENT, PLATA } from '@/theme/tokens';

/**
 * Cargar expo-notifications SOLO en nativo. Importarlo estáticamente evalúa su
 * efecto de auto-registro del push token (addPushTokenListener), que en web no
 * hace nada salvo imprimir un warning. Las notificaciones locales son una
 * función del teléfono, así que en web devolvemos null y el toggle no persiste.
 */
const cargarNotificaciones = (): Promise<typeof import('expo-notifications') | null> =>
  Platform.OS === 'web' ? Promise.resolve(null) : import('expo-notifications');

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

const ENTITY_LABEL = {
  observation: 'Observación',
  need: 'Necesidad',
  resource: 'Recurso',
} as const;

const AUDIENCE_LABEL = {
  private: 'privado',
  collective: 'red colectiva',
  circle: 'círculo',
  counterpart: 'contraparte',
} as const;

const PRECISION_LABEL = {
  exact: 'punto exacto',
  '100m': 'radio de 100 m',
  '500m': 'radio de 500 m',
  neighborhood: 'escala barrial',
  city: 'escala ciudad',
} as const;

const receiptDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Las líneas innegociables (spec §3.7) — cortas, para leerse enteras. */
const ETICA = [
  'Cero publicidad. Cero compras. Cero rankings.',
  'La bitácora y los borradores privados viven en este dispositivo.',
  'Cuando elegís publicar o coordinar, los datos indicados pueden sincronizarse con el servicio.',
  'El export privado incluye ubicaciones exactas: guardalo como un archivo sensible.',
  'Borrar datos locales no elimina registros que ya compartiste con el servidor.',
  'Al vencer, los datos dejan de participar en operaciones; hoy siguen en tu historial hasta que los retires o borres localmente.',
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
  const [disclosureReceipts, setDisclosureReceipts] = useState(() => disclosureReceiptsAll());
  const [showAllReceipts, setShowAllReceipts] = useState(false);
  useFocusEffect(useCallback(() => {
    setDisclosureReceipts(disclosureReceiptsAll());
  }, []));
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
      const Notifications = await cargarNotificaciones();
      if (!Notifications) {
        // En web no hay notificaciones locales: el toggle queda apagado.
        setNotif(false);
        setSetting(CLAVES_SOCIAL.notifDiaria, '0');
        setNotifNota('El aviso diario funciona en la app del teléfono.');
        return;
      }
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
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'basta-export.json';
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        URL.revokeObjectURL(url);
        setExportNota('Se descargó basta-export.json en este navegador.');
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        const archivo = new File(Paths.cache, 'basta-export.json');
        archivo.create({ intermediates: true, overwrite: true });
        archivo.write(json);
        try {
        await Sharing.shareAsync(archivo.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Tus datos de ¡BASTA!',
        });
        haptic.send();
          setExportNota('Se abrió el selector y la copia temporal de la app fue eliminada. La aplicación elegida puede conservar su propia copia.');
        } finally {
          if (archivo.exists) archivo.delete();
        }
      } else {
        setExportNota('Este dispositivo no ofrece un selector seguro. No se creó un archivo temporal.');
      }
    } catch {
      setExportNota('No salió el export. Probá de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  // --- Borrado local (doble confirmación: escribir BORRAR) ---
  const [confirmando, setConfirmando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [borrarNota, setBorrarNota] = useState<string | null>(null);
  const [retirosPendientes, setRetirosPendientes] = useState(0);
  const [permisosRemotosPendientes, setPermisosRemotosPendientes] = useState(0);
  const fraseBorrado = retirosPendientes > 0 && permisosRemotosPendientes === 0
    ? 'BORRAR IGUAL'
    : 'BORRAR';
  const puedeBorrar = permisosRemotosPendientes === 0
    && confirmacion.trim().toUpperCase() === fraseBorrado;

  const revisarRetirosPendientes = () => {
    const network = countPendingNetworkRevocations(unacknowledgedOutbox());
    const grants = countPendingNeedGrantRemoteRevocations();
    const total = network + grants;
    setRetirosPendientes(total);
    setPermisosRemotosPendientes(grants);
    return { grants, network, total };
  };

  const enviarRetirosAntesDeBorrar = async () => {
    if (borrando) return;
    setBorrando(true);
    setBorrarNota('Intentando entregar los retiros pendientes…');
    try {
      await revokePendingNeedGrantsBeforeLocalErase();
      await flushCivicOutbox();
      const remaining = revisarRetirosPendientes();
      setBorrarNota(remaining.total === 0
        ? 'Los retiros fueron acusados. Los permisos remotos y sus coordinaciones quedaron cerrados; ya podés borrar este dispositivo sin perder esa solicitud.'
        : remaining.grants > 0
          ? `Quedan ${remaining.grants} permisos remotos sin confirmación de cierre. Para no perder la capacidad de retirarlos, el borrado seguirá bloqueado hasta recibir acuse de la red.`
          : `Quedan ${remaining.network} retiros de publicaciones sin acuse. Podés conservar esta instalación y reintentar, o usar el borrado local de emergencia.`);
      setConfirmacion('');
    } catch {
      const remaining = revisarRetirosPendientes();
      setBorrarNota(`No se pudieron entregar ${remaining.total} retiros. Ninguno fue descartado; podés reintentar.`);
    } finally {
      setBorrando(false);
    }
  };

  const borrar = async () => {
    if (!puedeBorrar || borrando) return;
    const pendingRevocations = revisarRetirosPendientes();
    if (pendingRevocations.grants > 0) {
      setBorrarNota(`Hay ${pendingRevocations.grants} permisos remotos sin confirmación de cierre. El borrado está bloqueado para no destruir la única capacidad de retirarlos.`);
      setConfirmacion('');
      return;
    }
    if (pendingRevocations.total > 0 && confirmacion.trim().toUpperCase() !== 'BORRAR IGUAL') {
      setBorrarNota(`Hay ${pendingRevocations.total} retiros sin acuse. Enviálos primero o confirmá el borrado local de emergencia.`);
      setConfirmacion('');
      return;
    }
    setBorrando(true);
    setBorrarNota(null);
    let persistedPendingAtErase = 0;
    try {
      await withNeedGrantSafeLocalEraseLock(async () => {
        // Confirma que esta pestaña todavía posee la revisión IndexedDB y luego
        // inspecciona la fotografía común mientras ninguna otra pestaña puede
        // entregar o retirar un grant.
        await flushWebDatabaseSnapshot();
        persistedPendingAtErase = await countPersistedWebNeedGrantRemoteRevocations();
        if (persistedPendingAtErase > 0) {
          throw new Error('NEED_GRANT_PERSISTED_REMOTE_REVOCATION_REQUIRED_BEFORE_LOCAL_ERASE');
        }

        const localSnapshot = exportarTodo();
        const cachedEvidence = Platform.OS === 'web'
          ? []
          : cachedEvidenceUrisFromExport(localSnapshot, Paths.cache.uri);
        // Releer inmediatamente antes de tocar sesión, identidad, credenciales
        // o SQLite. El reloj local nunca autoriza el borrado de un grant remoto.
        const releaseNeedGrantEraseFence = beginNeedGrantSafeLocalErase();
        try {
          const [communityReset, actorReset, deviceReset, notificationReset] = await Promise.allSettled([
            resetCommunitySessionAndFeed(),
            resetCivicActorKey(),
            resetCivicDeviceCredentials(),
            cargarNotificaciones().then((n) => n?.cancelAllScheduledNotificationsAsync()),
          ]);
          // resetCivicActorKey() ya resolvió: la caché sync quedaría apuntando
          // a la identidad fantasma si no se invalida y recalienta acá mismo,
          // antes de cualquier navegación.
          invalidarActorKey();
          await calentarActorKey();
          borrarTodo();
          // El lock exclusivo no se libera hasta confirmar la fotografía vacía.
          await flushWebDatabaseSnapshot();
          let cachedFilesNotDeleted = 0;
          for (const uri of cachedEvidence) {
            try {
              const file = new File(uri);
              if (file.exists) file.delete();
            } catch {
              cachedFilesNotDeleted += 1;
            }
          }
          useJuego.getState().refresh(); // el store vuelve a cero
          if ([communityReset, actorReset, deviceReset].some((result) => result.status === 'rejected')) {
            setBorrarNota(
              'La base local se borró, pero no pudimos retirar todas las credenciales. Probá de nuevo para completar el borrado del dispositivo.',
            );
            return;
          }
          if (notificationReset.status === 'rejected') {
            setBorrarNota(
              'Los datos locales se borraron, pero el sistema no pudo cancelar el aviso diario. Podés desactivarlo desde los ajustes del teléfono.',
            );
            return;
          }
          if (cachedFilesNotDeleted > 0) {
            setBorrarNota(`Las filas locales se borraron, pero ${cachedFilesNotDeleted} archivos de evidencia no pudieron eliminarse del cache. El sistema puede limpiarlos más adelante.`);
            return;
          }
          haptic.send();
          router.replace('/'); // el Cielo vacío manda de nuevo al FTUE
        } finally {
          releaseNeedGrantEraseFence();
        }
      });
    } catch {
      const pendingGrants = Math.max(
        countPendingNeedGrantRemoteRevocations(),
        persistedPendingAtErase,
      );
      if (pendingGrants > 0) {
        setPermisosRemotosPendientes(pendingGrants);
        setRetirosPendientes((current) => Math.max(current, pendingGrants));
        setBorrarNota(`El borrado fue detenido antes de tocar las credenciales: quedan ${pendingGrants} permisos remotos sin confirmación de cierre.`);
      } else {
        setBorrarNota(
          'No se pudo completar el borrado local. Algunos datos pueden seguir en este dispositivo; probá de nuevo.',
        );
      }
    } finally {
      setBorrando(false);
    }
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

          {/* Ledger local append-only de lo que salió del dispositivo. */}
          <Seccion titulo="Historial de divulgación">
            <GlassCard className="p-5">
              <View className="flex-row items-start gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-violet-300/10">
                  <Ionicons name="receipt-outline" size={18} color="#C4B5FD" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans-medium text-sm text-plata">Recibos por registro</Text>
                  <Text className="mt-1 font-sans text-[11px] leading-5 text-slate-500">
                    Cada asiento se crea antes de preparar el envío. No se edita: una revocación aparece como otro asiento y no borra por sí sola copias remotas.
                  </Text>
                </View>
              </View>

              {disclosureReceipts.length === 0 ? (
                <View className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <Text className="font-sans text-xs leading-5 text-slate-500">
                    Todavía no preparaste ninguna observación, necesidad o recurso para compartir.
                  </Text>
                </View>
              ) : (
                <View className="mt-5 gap-3">
                  {(showAllReceipts ? disclosureReceipts : disclosureReceipts.slice(0, 5)).map((receipt) => {
                    const fields = readableAuthorizedFields(authorizedFieldsForReceipt(receipt));
                    const signature = receipt.attributionMode === 'anonymous'
                      ? 'sin firma visible'
                      : `${receipt.attributionName ?? 'firma sin nombre'} · ${receipt.attributionMode === 'alias' ? 'alias' : 'nombre declarado'}`;
                    return (
                      <View key={receipt.id} className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className={`font-sans-medium text-[10px] uppercase tracking-[1.4px] ${receipt.kind === 'revocation' ? 'text-rose-300' : 'text-emerald-300'}`}>
                            {receipt.kind === 'revocation' ? 'Revocación asentada' : 'Divulgación autorizada'}
                          </Text>
                          <Text className="font-mono text-[9px] text-slate-600">{receiptDate(receipt.recordedAt)}</Text>
                        </View>
                        <Text className="mt-2 font-serif text-lg text-plata">
                          {ENTITY_LABEL[receipt.entityType]} · {AUDIENCE_LABEL[receipt.audience]}
                        </Text>
                        <Text className="mt-2 font-sans text-[11px] leading-5 text-slate-400">{receipt.purpose}</Text>
                        <Text className="mt-2 font-sans text-[10px] leading-4 text-slate-500">
                          Lugar: {PRECISION_LABEL[receipt.sharedPrecision]} · Firma: {signature} · Política v{receipt.policyVersion}
                        </Text>
                        <Text className="mt-2 font-sans text-[10px] leading-4 text-slate-600">
                          Campos: {fields.length > 0 ? fields.join(' · ') : 'ningún valor compartido'}
                        </Text>
                      </View>
                    );
                  })}
                  {disclosureReceipts.length > 5 && (
                    <Pressable97
                      accessibilityRole="button"
                      accessibilityLabel={showAllReceipts ? 'Mostrar menos recibos' : 'Mostrar todo el historial de divulgación'}
                      onPress={() => setShowAllReceipts((value) => !value)}
                      className="min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4"
                    >
                      <Text className="font-sans-medium text-xs text-violet-200">
                        {showAllReceipts ? 'Mostrar menos' : `Ver los ${disclosureReceipts.length} asientos`}
                      </Text>
                    </Pressable97>
                  )}
                </View>
              )}
            </GlassCard>
          </Seccion>

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
                    Un JSON con juego, bitácora, datos cívicos, territorios,
                    consentimientos y cola de envíos. No incluye contraseñas
                    ni credenciales de acceso, pero sí puede incluir
                    coordenadas exactas y relatos privados. Compartilo sólo
                    con alguien de confianza.
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

          {/* Borrado local */}
          <Seccion titulo="Borrado local">
            {!confirmando ? (
              <Pressable97
                accessibilityRole="button"
                accessibilityLabel="Borrar datos de este dispositivo"
                onPress={() => {
                  setBorrarNota(null);
                  revisarRetirosPendientes();
                  setConfirmando(true);
                }}
              >
                <GlassCard className="flex-row items-center gap-3 p-4">
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <View className="flex-1">
                    <Text className="font-sans-medium text-sm text-senal-basta">
                      Borrar datos de este dispositivo
                    </Text>
                    <Text className="mt-0.5 font-sans text-xs leading-4 text-slate-500">
                      Solicita borrar las filas y credenciales cubiertas en este
                      dispositivo. No borra copias remotas, archivos externos,
                      backups ni garantiza todavía borrado físico de SQLite.
                    </Text>
                  </View>
                </GlassCard>
              </Pressable97>
            ) : (
              <GlassCard className="border-senal-basta/30 p-4">
                <Text className="font-sans text-sm leading-6 text-slate-300">
                  Se solicitan borrar las filas locales inventariadas, ajustes,
                  identidad y sesión. No elimina copias remotas, archivos que ya
                  compartiste, backups ni páginas libres de SQLite. Si querés
                  conservar una copia local, exportala antes.
                </Text>
                {retirosPendientes > 0 && (
                  <View className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-4">
                    <Text className="font-sans-semibold text-xs text-amber-100">{retirosPendientes} {retirosPendientes === 1 ? 'retiro espera' : 'retiros esperan'} acuse de la red</Text>
                    <Text className="mt-2 font-sans text-[11px] leading-5 text-slate-400">
                      {permisosRemotosPendientes > 0
                        ? `${permisosRemotosPendientes} corresponden a permisos de custodia que pudieron llegar a la red. El borrado no admite una salida de emergencia mientras falte confirmar su cierre, aunque este dispositivo los muestre vencidos.`
                        : 'Estos retiros corresponden a publicaciones. Borrar ahora destruirá la deuda local y el dato remoto podría seguir vigente.'}
                    </Text>
                    <Pressable97 accessibilityRole="button" accessibilityLabel="Enviar retiros pendientes antes de borrar" onPress={enviarRetirosAntesDeBorrar} disabled={borrando} className="mt-3 min-h-11 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 px-4">
                      <Text className="font-sans-semibold text-xs text-amber-100">Enviar retiros primero</Text>
                    </Pressable97>
                  </View>
                )}
                {permisosRemotosPendientes > 0 ? (
                  <Text className="mt-4 font-sans-semibold text-xs leading-5 text-amber-100">
                    Borrado bloqueado hasta recibir un acuse remoto de cierre. Conectá esta instalación con la misma cuenta y enviá los retiros primero.
                  </Text>
                ) : (
                  <>
                    <Text className="mt-4 font-sans text-xs leading-5 text-slate-400">
                      Para confirmar, escribí <Text className="font-mono text-senal-basta">{fraseBorrado}</Text>.
                    </Text>
                    <TextInput
                      value={confirmacion}
                      onChangeText={setConfirmacion}
                      placeholder={fraseBorrado}
                      placeholderTextColor="#64748b"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      editable={!borrando}
                      className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center font-mono text-base tracking-widest text-plata"
                    />
                  </>
                )}
                <View className="mt-4 flex-row items-center justify-center gap-3">
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar el borrado"
                    onPress={() => {
                      setConfirmando(false);
                      setConfirmacion('');
                    }}
                    disabled={borrando}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5"
                  >
                    <Text className="font-sans-medium text-xs text-slate-300">
                      Mejor no
                    </Text>
                  </Pressable97>
                  <Pressable97
                    accessibilityRole="button"
                    accessibilityLabel="Confirmar borrado de datos locales"
                    onPress={borrar}
                    disabled={!puedeBorrar || borrando}
                    className={`rounded-full border border-senal-basta/40 bg-senal-basta/10 px-5 py-2.5 ${puedeBorrar && !borrando ? '' : 'opacity-40'}`}
                  >
                    <Text className="font-sans-medium text-xs text-senal-basta">
                      {borrando ? 'Borrando…' : 'Borrar datos locales'}
                    </Text>
                  </Pressable97>
                </View>
              </GlassCard>
            )}
            {borrarNota && (
              <Text className="mt-2 font-sans text-xs text-senal-basta">
                {borrarNota}
              </Text>
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
            v{VERSION} — privado por defecto; compartir es una decisión.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
