import { useRef, useState } from 'react';
import { Text, TextInput, Switch, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import type { CuadernoNativo } from '@v2/shared';
import { BotonTinta } from '@/components/papel';
import { autorizar, revisarConflicto } from '@/civic/campo-v2/modelo';
import { guardarCuaderno, borrarCuaderno } from '@/civic/campo-v2/archivo';
import { descargarTareas, estadoEvidencia, type ConexionCampo } from '@/civic/campo-v2/conexion';

const campos: [keyof CuadernoNativo['campos'], string][] = [
  ['titulo', 'Título público'],
  ['texto', 'Resumen público sin datos personales'],
  ['desde', 'Fecha inicial (AAAA-MM-DD)'],
  ['hasta', 'Fecha final (AAAA-MM-DD)'],
  ['observaciones', 'Cantidad de observaciones'],
  ['ausencias', 'Quiénes faltaron'],
  ['limites', 'Límites de lo observado'],
  ['proximoPaso', 'Próximo paso'],
];
export function EditorCampoNativo({
  inicial,
  conexion,
  cambiar,
}: {
  inicial: CuadernoNativo;
  conexion: ConexionCampo;
  cambiar: () => void;
}) {
  const [c, setC] = useState(inicial),
    [consentimiento, setConsentimiento] = useState(false),
    [realizada, setRealizada] = useState(false),
    [confirmar, setConfirmar] = useState(false),
    [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false);
  const actual = useRef(inicial);
  function guardar(v: CuadernoNativo) {
    try {
      const siguiente = guardarCuaderno(v);
      actual.current = siguiente;
      setC(siguiente);
      setError('');
      return siguiente;
    } catch (e) {
      actual.current = v;
      setC(v);
      setError(e instanceof Error ? e.message : 'No se guardó el cambio. Conservá el texto.');
      return null;
    }
  }
  async function revisar() {
    setOcupado(true);
    setError('');
    try {
      const actual = (await descargarTareas(conexion)).find((t) => t.id === c.tarea.id);
      if (!actual)
        throw new Error(
          'La tarea ya no está disponible para tu cuenta. Conservá el resumen y consultá la iniciativa.',
        );
      if (guardar(revisarConflicto(c, actual))) {
        setConsentimiento(false);
        setRealizada(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos recuperar la tarea.');
    } finally {
      setOcupado(false);
    }
  }
  async function retirar() {
    if (!c.evidenciaId || !confirmar) return;
    setOcupado(true);
    setError('');
    try {
      const actual = await estadoEvidencia(conexion, c.evidenciaId);
      const siguiente = actual.retirada
        ? {
            ...c,
            estado: 'retirado' as const,
            mensaje: 'El servidor confirmó que la evidencia fue retirada.',
          }
        : {
            ...c,
            estado: 'pendiente' as const,
            intentos: 0,
            siguienteIntento: 0,
            retiro: {
              idLocal: Crypto.randomUUID(),
              revision: actual.revision,
              accion: 'retirar' as const,
              firma: '',
              nota: 'Retiro autorizado desde mi cuaderno de campo.',
            },
            mensaje: 'Retiro autorizado; falta sincronizar.',
          };
      if (guardar(siguiente)) cambiar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos preparar el retiro.');
    } finally {
      setOcupado(false);
    }
  }
  return (
    <View className="border-tinta gap-4 border p-4">
      <Text className="font-anton text-tinta text-2xl">{c.tarea.titulo}</Text>
      <Text>{c.tarea.alcance}</Text>
      <Text>
        {c.tarea.escucha.zona} · {c.tarea.escucha.metodo}
      </Text>
      <Text>Invitación: {c.tarea.escucha.convocatoria}</Text>
      <Text>
        Destino:{' '}
        {c.tarea.fichaTitulo ??
          (c.tarea.fichaId
            ? 'Ficha vinculada'
            : 'Sólo la iniciativa; todavía no hay ficha vinculada')}
        .
      </Text>
      <Text>
        Unidad: {c.tarea.escucha.unidad} · versión {c.tarea.escucha.versionUnidad}. Tarea versión{' '}
        {c.tarea.revision}.
      </Text>
      <BotonTinta
        variante="fantasma"
        etiqueta="Abrir tarea en la web"
        onPress={() => {
          void Linking.openURL(
            `${c.origen}/iniciativas/${c.tarea.slug}?seccion=tareas&tarea=${c.tarea.id}`,
          );
        }}
      />
      <Text>
        {c.mensaje ||
          'Los cambios se guardan en este teléfono. Las notas privadas nunca se envían.'}
      </Text>
      <Text>Notas privadas</Text>
      <TextInput
        accessibilityLabel="Notas privadas"
        multiline
        value={c.notas}
        maxLength={12000}
        editable={c.estado === 'borrador' && !ocupado}
        className="border-tinta min-h-24 border p-3"
        onChangeText={(notas) => guardar({ ...actual.current, notas })}
      />
      {campos.map(([clave, etiqueta]) => (
        <View key={clave} className="gap-2">
          <Text>{etiqueta}</Text>
          <TextInput
            accessibilityLabel={etiqueta}
            value={c.campos[clave]}
            editable={c.estado === 'borrador' && !ocupado}
            multiline={['texto', 'ausencias', 'limites', 'proximoPaso'].includes(clave)}
            maxLength={clave === 'titulo' ? 160 : clave === 'texto' ? 4000 : 2000}
            keyboardType={clave === 'observaciones' ? 'number-pad' : 'default'}
            className="border-tinta min-h-12 border p-3"
            onChangeText={(valor) =>
              guardar({ ...actual.current, campos: { ...actual.current.campos, [clave]: valor } })
            }
          />
        </View>
      ))}
      {c.estado === 'borrador' ? (
        <>
          <View className="flex-row items-center gap-3">
            <Switch
              accessibilityLabel="Declaro realizada la escucha"
              value={realizada}
              onValueChange={setRealizada}
            />
            <Text className="flex-1">Declaro realizada la escucha.</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Switch
              accessibilityLabel="Autorizo publicar el resumen"
              value={consentimiento}
              onValueChange={setConsentimiento}
            />
            <Text className="flex-1">
              Autorizo publicar sólo el resumen en la iniciativa y su ficha vinculada.
            </Text>
          </View>
          <BotonTinta
            etiqueta="Autorizar y guardar para sincronizar"
            disabled={
              !realizada ||
              !consentimiento ||
              ocupado ||
              !['in_progress', 'done'].includes(c.tarea.estado)
            }
            onPress={() => {
              try {
                if (guardar(autorizar(c, Crypto.randomUUID()))) cambiar();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Revisá los campos.');
              }
            }}
          />
        </>
      ) : null}
      {['conflicto', 'borrador'].includes(c.estado) && !c.retiro ? (
        <BotonTinta
          etiqueta="Recuperar tarea y revisar autorización"
          disabled={ocupado}
          onPress={() => {
            void revisar();
          }}
        />
      ) : null}
      {['enviado', 'retirado', 'borrador'].includes(c.estado) ||
      (c.estado === 'conflicto' && c.retiro) ? (
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <Switch
              accessibilityLabel="Confirmo la acción elegida"
              value={confirmar}
              onValueChange={setConfirmar}
            />
            <Text className="flex-1">Confirmo la acción que elija a continuación.</Text>
          </View>
          {c.estado === 'enviado' || (c.retiro && c.estado === 'conflicto') ? (
            <BotonTinta
              etiqueta="Retirar evidencia pública de la iniciativa y la ficha"
              disabled={!confirmar || ocupado}
              onPress={() => {
                void retirar();
              }}
            />
          ) : null}
          {['borrador', 'enviado', 'retirado'].includes(c.estado) ? (
            <BotonTinta
              etiqueta="Borrar sólo este cuaderno del teléfono"
              variante="fantasma"
              disabled={!confirmar || ocupado}
              onPress={() => {
                try {
                  borrarCuaderno(c);
                  cambiar();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No pudimos borrar.');
                }
              }}
            />
          ) : null}
          <Text>Borrar el cuaderno local no retira una evidencia publicada.</Text>
        </View>
      ) : null}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </View>
  );
}
