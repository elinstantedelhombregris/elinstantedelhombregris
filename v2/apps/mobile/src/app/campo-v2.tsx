import { useEffect, useState } from 'react';
import { AppState, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import type { CuadernoNativo } from '@v2/shared';
import { BotonTinta, TituloAnton } from '@/components/papel';
import { EditorCampoNativo } from '@/components/campo/EditorCampoNativo';
import {
  leerConexion,
  vincularTelefono,
  desconectarTelefono,
  descargarTareas,
  type ConexionCampo,
} from '@/civic/campo-v2/conexion';
import { guardarCuaderno, leerCuadernos } from '@/civic/campo-v2/archivo';
import { nuevoCuaderno } from '@/civic/campo-v2/modelo';
import { sincronizarCuadernos } from '@/civic/campo-v2/sincronizar';

function Cuadernos({ conexion }: { conexion: ConexionCampo }) {
  const [items, setItems] = useState<CuadernoNativo[]>([]),
    [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false),
    [elegido, setElegido] = useState<string | null>(null);
  function refrescar() {
    try {
      setItems(leerCuadernos(conexion.usuarioId, conexion.origen));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos abrir el archivo local.');
    }
  }
  async function descargar() {
    setOcupado(true);
    setError('');
    try {
      const tareas = await descargarTareas(conexion),
        guardados = leerCuadernos(conexion.usuarioId, conexion.origen);
      for (const tarea of tareas)
        if (!guardados.some((c) => c.tarea.id === tarea.id))
          guardarCuaderno(
            nuevoCuaderno(Crypto.randomUUID(), conexion.usuarioId, conexion.origen, tarea),
          );
      refrescar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos descargar.');
    } finally {
      setOcupado(false);
    }
  }
  async function sincronizar() {
    setOcupado(true);
    setError('');
    try {
      await sincronizarCuadernos(conexion, true);
      refrescar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'El envío sigue guardado.');
    } finally {
      setOcupado(false);
    }
  }
  useEffect(() => {
    let vivo = true;
    const actualizar = () => {
      if (vivo) {
        try {
          setItems(leerCuadernos(conexion.usuarioId, conexion.origen));
        } catch (e) {
          setError(e instanceof Error ? e.message : 'No pudimos leer el cuaderno.');
        }
      }
    };
    const sync = () => {
      void sincronizarCuadernos(conexion)
        .then(actualizar)
        .catch((e) => {
          if (vivo) setError(e instanceof Error ? e.message : 'El envío sigue guardado.');
        });
    };
    actualizar();
    sync();
    const red = NetInfo.addEventListener((s) => {
      if (s.isConnected) sync();
    });
    const actividad = AppState.addEventListener('change', (s) => {
      if (s === 'active') sync();
    });
    const timer = setInterval(sync, 15000);
    return () => {
      vivo = false;
      red();
      actividad.remove();
      clearInterval(timer);
    };
  }, [conexion]);
  const actual = items.find((c) => c.id === elegido);
  return (
    <View className="gap-4">
      <Text>
        Cuenta vinculada: {conexion.usuarioId}. Descargá antes de salir. La sincronización funciona
        mientras esta pantalla está abierta; hasta cinco intentos automáticos.
      </Text>
      <BotonTinta
        etiqueta="Descargar mis tareas asignadas"
        disabled={ocupado}
        onPress={() => {
          void descargar();
        }}
      />
      <BotonTinta
        etiqueta="Sincronizar envíos y retiros autorizados"
        disabled={ocupado}
        onPress={() => {
          void sincronizar();
        }}
      />
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      {actual ? (
        <>
          <BotonTinta
            variante="fantasma"
            etiqueta="Volver a mis cuadernos"
            onPress={() => {
              refrescar();
              setElegido(null);
            }}
          />
          <EditorCampoNativo
            key={actual.id + ':' + (actual.estado === 'borrador' ? 'borrador' : actual.version)}
            inicial={actual}
            conexion={conexion}
            cambiar={() => {
              refrescar();
              setElegido(null);
            }}
          />
        </>
      ) : (
        items.map((c) => (
          <BotonTinta
            key={c.id}
            variante="fantasma"
            etiqueta={`${c.tarea.titulo} · ${c.estado}`}
            onPress={() => setElegido(c.id)}
          />
        ))
      )}
      {!items.length ? (
        <Text>
          No hay cuadernos descargados. Aceptá e iniciá una tarea de escucha en la web y descargala
          acá.
        </Text>
      ) : null}
    </View>
  );
}
export default function CampoV2() {
  const insets = useSafeAreaInsets();
  const [conexion, setConexion] = useState<ConexionCampo | null>(null),
    [clave, setClave] = useState(''),
    [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(true);
  useEffect(() => {
    void leerConexion()
      .then(setConexion)
      .catch((e) => setError(e instanceof Error ? e.message : 'No pudimos leer la vinculación.'))
      .finally(() => setOcupado(false));
  }, []);
  async function vincular() {
    setOcupado(true);
    setError('');
    try {
      setConexion(await vincularTelefono(clave));
      setClave('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos vincular.');
    } finally {
      setOcupado(false);
    }
  }
  async function desconectar() {
    setOcupado(true);
    try {
      await desconectarTelefono();
      setConexion(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos desconectar.');
    } finally {
      setOcupado(false);
    }
  }
  return (
    <ScrollView
      className="bg-papel flex-1"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
        gap: 20,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TituloAnton>Tareas de campo v2</TituloAnton>
      <Text>
        Prepará una escucha, compartí sólo el resumen autorizado y devolvé los resultados a la
        ficha.
      </Text>
      {Platform.OS === 'web' ? (
        <Text>
          La vinculación segura está disponible en la app instalada en iOS o Android. En la web usá
          el Cuaderno de campo de v2.
        </Text>
      ) : conexion ? (
        <>
          <Cuadernos
            key={conexion.origen + conexion.usuarioId + conexion.dispositivoId}
            conexion={conexion}
          />
          <BotonTinta
            variante="fantasma"
            etiqueta="Desconectar este teléfono"
            disabled={ocupado}
            onPress={() => {
              void desconectar();
            }}
          />
          <Text>
            Desconectar oculta los cuadernos y detiene nuevos envíos. Podés recuperarlos vinculando
            la misma cuenta. Revocá la clave desde la web para invalidarla en el servidor.
          </Text>
        </>
      ) : (
        <View className="gap-4">
          <Text>
            En la web v2, ingresá a Cuaderno de campo → Vincular la app nativa. Generá una clave y
            pegala acá. No compartas esa clave.
          </Text>
          <TextInput
            accessibilityLabel="Clave de campo"
            value={clave}
            onChangeText={setClave}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            className="border-tinta min-h-12 border p-3"
          />
          <BotonTinta
            etiqueta="Vincular mi teléfono"
            disabled={ocupado}
            onPress={() => {
              void vincular();
            }}
          />
        </View>
      )}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </ScrollView>
  );
}
