/**
 * AJUSTES — la ética hecha pantalla (spec §3.7): tu nombre para las chispas,
 * la notificación diaria opt-in de las 20:00 (spec §3.6), el export JSON de
 * TODO con un tap y el borrado local con doble confirmación. La bitácora y
 * los borradores son locales; lo que la persona publica puede sincronizarse.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): filas del cuaderno,
 * toggle rectangular (OFF papel-presionado / ON violeta) y la zona de
 * borrado con borde sello — el único rojo que se permite gritar.
 */

import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
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
import {
  BotonTinta,
  GranoPapel,
  Kicker,
  PapelCard,
  TituloAnton,
} from '@/components/papel';
import { Pressable97 } from '@/components/ui/Pressable97';
import { NOTIFICACIONES } from '@/content';
import { flushWebDatabaseSnapshot } from '@/db/client';
import { borrarTodo, exportarTodo, getSetting, setSetting } from '@/db/repos';
import { LIMITES_CHISPA } from '@/game/qr-codec';
import { CLAVES_SOCIAL, guardarNombre, leerNombre } from '@/lib/social';
import { fadeUp, staggerDelay } from '@/motion/variants';
import { useJuego } from '@/stores/juego';
import { haptic } from '@/theme/haptics';
import { ROJO_SELLO, TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

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

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean, acento: string = VIOLETA): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? acento : TINTA,
  outlineColor: acento,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

/** Toggle rectangular del cuaderno (spec §8): OFF papel-presionado, ON violeta. */
function TogglePapel({
  valor,
  onCambiar,
  disabled,
  accessibilityLabel,
}: {
  valor: boolean;
  onCambiar: (v: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable97
      accessibilityRole="switch"
      accessibilityState={{ checked: valor, disabled: disabled ?? false }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onCambiar(!valor)}
      disabled={disabled}
      className="min-h-11 justify-center"
    >
      <View
        className={`h-7 w-12 flex-row items-center border border-tinta px-1 ${
          valor ? 'justify-end bg-violeta' : 'justify-start bg-papel-presionado'
        }`}
      >
        <View className={`h-4 w-4 ${valor ? 'bg-papel' : 'bg-tinta'}`} />
      </View>
    </Pressable97>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View className="mb-7">
      <Kicker tono="neutro" className="mb-3">
        {titulo}
      </Kicker>
      {children}
    </View>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Nombre (viaja como `de` en las chispas) ---
  const [nombre, setNombre] = useState(() => leerNombre());
  const [enfocadoNombre, setEnfocadoNombre] = useState(false);
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
  const [enfocadoConfirmacion, setEnfocadoConfirmacion] = useState(false);
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

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

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
        <View className="mt-2">
          <Kicker>la ética hecha pantalla</Kicker>
          <TituloAnton entintar tamano="lg" className="mt-1">
            Ajustes
          </TituloAnton>
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <Animated.View entering={fadeUp}>
          {/* Nombre */}
          <Seccion titulo="Tu nombre">
            <TextInput
              value={nombre}
              onChangeText={cambiarNombre}
              onFocus={() => setEnfocadoNombre(true)}
              onBlur={() => setEnfocadoNombre(false)}
              placeholder="Opcional — viaja en las chispas que regalás"
              placeholderTextColor={TINTA_50}
              maxLength={LIMITES_CHISPA.deMax}
              accessibilityLabel="Tu nombre para las chispas"
              className="bg-papel-crudo px-5 py-4 font-archivo text-base text-tinta"
              style={estiloInput(enfocadoNombre)}
            />
            <Text className="mt-2 font-archivo text-[11px] leading-4 text-tinta-50">
              Solo aparece cuando regalás una chispa, para que sepan de quién
              vino. No sale de los teléfonos que se miran.
            </Text>
          </Seccion>

          {/* Notificación diaria — vive en el teléfono, no en la web */}
          {Platform.OS === 'web' ? (
            <Seccion titulo="Aviso diario">
              <PapelCard className="p-4">
                <Text className="font-archivo text-sm leading-6 text-tinta-75">
                  Los avisos viven en el teléfono: esta preview no notifica.
                </Text>
              </PapelCard>
            </Seccion>
          ) : (
            <Seccion titulo="Aviso diario">
              <PapelCard className="flex-row items-center justify-between p-4">
                <View className="mr-4 flex-1">
                  <Text className="font-archivo-bold text-sm text-tinta">
                    «{NOTIFICACIONES.tuCieloEspera}»
                  </Text>
                  <Text className="mt-1 font-archivo text-xs leading-5 text-tinta-50">
                    {NOTIFICACIONES.optIn}
                  </Text>
                </View>
                <TogglePapel
                  valor={notif}
                  onCambiar={alternarNotif}
                  disabled={notifOcupado}
                  accessibilityLabel="Aviso diario a las ocho de la noche"
                />
              </PapelCard>
              {notifNota && (
                <Text className="mt-2 font-archivo text-xs text-tinta-75">
                  {notifNota}
                </Text>
              )}
            </Seccion>
          )}

          {/* Ledger local append-only de lo que salió del dispositivo. */}
          <Seccion titulo="Historial de divulgación">
            <PapelCard className="p-5">
              <Text className="font-archivo-bold text-sm text-tinta">Recibos por registro</Text>
              <Text className="mt-1 font-archivo text-[11px] leading-5 text-tinta-50">
                Cada asiento se crea antes de preparar el envío. No se edita: una revocación aparece como otro asiento y no borra por sí sola copias remotas.
              </Text>

              {disclosureReceipts.length === 0 ? (
                <View className="mt-4 bg-papel-presionado p-4">
                  <Text className="font-archivo text-xs leading-5 text-tinta-50">
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
                      <View key={receipt.id} className="border border-bordeSuave bg-papel-crudo p-4">
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className={`font-space text-[10px] uppercase tracking-[1.4px] ${receipt.kind === 'revocation' ? 'text-sello' : 'text-verde'}`}>
                            {receipt.kind === 'revocation' ? 'Revocación asentada' : 'Divulgación autorizada'}
                          </Text>
                          <Text className="font-space text-[9px] text-tinta-50">{receiptDate(receipt.recordedAt)}</Text>
                        </View>
                        <Text className="mt-2 font-archivo-bold text-base text-tinta">
                          {ENTITY_LABEL[receipt.entityType]} · {AUDIENCE_LABEL[receipt.audience]}
                        </Text>
                        <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">{receipt.purpose}</Text>
                        <Text className="mt-2 font-space text-[10px] leading-4 text-tinta-50">
                          Lugar: {PRECISION_LABEL[receipt.sharedPrecision]} · Firma: {signature} · Política v{receipt.policyVersion}
                        </Text>
                        <Text className="mt-2 font-space text-[10px] leading-4 text-tinta-50">
                          Campos: {fields.length > 0 ? fields.join(' · ') : 'ningún valor compartido'}
                        </Text>
                      </View>
                    );
                  })}
                  {disclosureReceipts.length > 5 && (
                    <View className="items-start">
                      <BotonTinta
                        etiqueta={showAllReceipts ? 'Mostrar menos' : `Ver los ${disclosureReceipts.length} asientos`}
                        variante="fantasma"
                        tamano="compacto"
                        accessibilityLabel={showAllReceipts ? 'Mostrar menos recibos' : 'Mostrar todo el historial de divulgación'}
                        onPress={() => setShowAllReceipts((value) => !value)}
                      />
                    </View>
                  )}
                </View>
              )}
            </PapelCard>
          </Seccion>

          {/* Export */}
          <Seccion titulo="Tus datos">
            <Pressable97
              accessibilityRole="button"
              accessibilityLabel="Exportar mis datos"
              onPress={exportar}
              disabled={exportando}
            >
              <PapelCard className="flex-row items-center gap-4 p-4">
                <View className="flex-1">
                  <Text className="font-archivo-bold text-sm text-tinta">
                    {exportando ? 'Preparando…' : 'Exportar mis datos'}
                  </Text>
                  <Text className="mt-0.5 font-archivo text-xs leading-4 text-tinta-50">
                    Un JSON con juego, bitácora, datos cívicos, territorios,
                    consentimientos y cola de envíos. No incluye contraseñas
                    ni credenciales de acceso, pero sí puede incluir
                    coordenadas exactas y relatos privados. Compartilo sólo
                    con alguien de confianza.
                  </Text>
                </View>
                <Text className="font-space text-tinta">→</Text>
              </PapelCard>
            </Pressable97>
            {exportNota && (
              <Text className="mt-2 font-archivo text-xs text-tinta-75">
                {exportNota}
              </Text>
            )}
          </Seccion>

          {/* Borrado local — la zona con borde sello */}
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
                <View className="border border-sello bg-papel-crudo p-4">
                  <Text className="font-archivo-bold text-sm text-sello">
                    Borrar datos de este dispositivo
                  </Text>
                  <Text className="mt-0.5 font-archivo text-xs leading-4 text-tinta-50">
                    Solicita borrar las filas y credenciales cubiertas en este
                    dispositivo. No borra copias remotas, archivos externos,
                    backups ni garantiza todavía borrado físico de SQLite.
                  </Text>
                </View>
              </Pressable97>
            ) : (
              <View className="border border-sello bg-papel-crudo p-4">
                <Text className="font-archivo text-sm leading-6 text-tinta-90">
                  Se solicitan borrar las filas locales inventariadas, ajustes,
                  identidad y sesión. No elimina copias remotas, archivos que ya
                  compartiste, backups ni páginas libres de SQLite. Si querés
                  conservar una copia local, exportala antes.
                </Text>
                {retirosPendientes > 0 && (
                  <View className="mt-4 border border-ambar bg-papel p-4">
                    <Text className="font-archivo-bold text-xs text-tinta">{retirosPendientes} {retirosPendientes === 1 ? 'retiro espera' : 'retiros esperan'} acuse de la red</Text>
                    <Text className="mt-2 font-archivo text-[11px] leading-5 text-tinta-75">
                      {permisosRemotosPendientes > 0
                        ? `${permisosRemotosPendientes} corresponden a permisos de custodia que pudieron llegar a la red. El borrado no admite una salida de emergencia mientras falte confirmar su cierre, aunque este dispositivo los muestre vencidos.`
                        : 'Estos retiros corresponden a publicaciones. Borrar ahora destruirá la deuda local y el dato remoto podría seguir vigente.'}
                    </Text>
                    <View className="mt-3 items-start">
                      <BotonTinta
                        etiqueta="Enviar retiros primero"
                        variante="fantasma"
                        tamano="compacto"
                        accessibilityLabel="Enviar retiros pendientes antes de borrar"
                        onPress={enviarRetirosAntesDeBorrar}
                        disabled={borrando}
                      />
                    </View>
                  </View>
                )}
                {permisosRemotosPendientes > 0 ? (
                  <Text className="mt-4 font-archivo-bold text-xs leading-5 text-tinta">
                    Borrado bloqueado hasta recibir un acuse remoto de cierre. Conectá esta instalación con la misma cuenta y enviá los retiros primero.
                  </Text>
                ) : (
                  <>
                    <Text className="mt-4 font-archivo text-xs leading-5 text-tinta-75">
                      Para confirmar, escribí <Text className="font-space text-sello">{fraseBorrado}</Text>.
                    </Text>
                    <TextInput
                      value={confirmacion}
                      onChangeText={setConfirmacion}
                      onFocus={() => setEnfocadoConfirmacion(true)}
                      onBlur={() => setEnfocadoConfirmacion(false)}
                      placeholder={fraseBorrado}
                      placeholderTextColor={TINTA_50}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      editable={!borrando}
                      accessibilityLabel="Escribí la frase de confirmación"
                      className="mt-4 bg-papel px-5 py-3 text-center font-space text-base tracking-widest text-tinta"
                      style={estiloInput(enfocadoConfirmacion, ROJO_SELLO)}
                    />
                  </>
                )}
                <View className="mt-4 flex-row items-center justify-center gap-3">
                  <BotonTinta
                    etiqueta="Mejor no"
                    variante="fantasma"
                    tamano="compacto"
                    accessibilityLabel="Cancelar el borrado"
                    onPress={() => {
                      setConfirmando(false);
                      setConfirmacion('');
                    }}
                    disabled={borrando}
                  />
                  <BotonTinta
                    etiqueta={borrando ? 'Borrando…' : 'Borrar datos locales'}
                    variante="tinta"
                    tamano="compacto"
                    accessibilityLabel="Confirmar borrado de datos locales"
                    onPress={borrar}
                    disabled={!puedeBorrar || borrando}
                    cargando={borrando}
                    style={{ borderWidth: 1, borderColor: ROJO_SELLO }}
                  />
                </View>
              </View>
            )}
            {borrarNota && (
              <Text className="mt-2 font-archivo text-xs text-sello">
                {borrarNota}
              </Text>
            )}
          </Seccion>

          {/* Ética */}
          <Seccion titulo="La ética del juego">
            <PapelCard className="p-5">
              {ETICA.map((linea, i) => (
                <Animated.View
                  key={linea}
                  entering={staggerDelay(i)}
                  className={`flex-row items-start gap-2.5 ${i > 0 ? 'mt-3' : ''}`}
                >
                  <Text className="font-space text-sm text-tinta-30">—</Text>
                  <Text className="flex-1 font-archivo text-sm leading-6 text-tinta-90">
                    {linea}
                  </Text>
                </Animated.View>
              ))}
            </PapelCard>
          </Seccion>

          <Text className="mt-2 text-center font-space text-[11px] text-tinta-50">
            v{VERSION} — privado por defecto; compartir es una decisión.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
