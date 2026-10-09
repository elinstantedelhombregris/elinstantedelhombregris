import { useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { BotonTinta, PapelCard } from '@/components/papel';
import { Eleccion } from './EleccionIdeal';
import { leerIdeal, escribirIdeal } from '@/civic/ideal';
type Propio = { texto: string; revision: string; cedeLicencia: boolean; textoProtegido: boolean };
export function GestionAporteIdeal({ id }: { id: string }) {
  const [propio, setPropio] = useState<Propio | null>(null);
  const [texto, setTexto] = useState('');
  const [cede, setCede] = useState(false);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [busy, setBusy] = useState(false);
  const leer = async () => {
    setError('');
    try {
      const p = await leerIdeal<Propio>('/api/v1/contribuciones/' + id + '/privado');
      setPropio(p);
      setTexto(p.texto);
      setCede(p.cedeLicencia);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos comprobar la autoría.');
    }
  };
  const guardar = async () => {
    if (!propio || busy) return;
    setBusy(true);
    try {
      await escribirIdeal(
        '/api/v1/contribuciones/' + id,
        { revision: propio.revision, texto, cedeLicencia: cede, aceptaPublicar: true },
        'PATCH',
      );
      await leer();
      setNota('La revisión quedó guardada. Las descargas anteriores no pueden recuperarse.');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No pudimos guardar la revisión. Conservá tu texto.',
      );
    } finally {
      setBusy(false);
    }
  };
  const retirar = () =>
    Alert.alert(
      'Retirar esta publicación',
      'El texto deja las lecturas actualizadas. Las copias ya descargadas no vuelven; tu borrador local permanece hasta que lo borres.',
      [
        { text: 'Conservar', style: 'cancel' },
        {
          text: 'Retirar publicación',
          style: 'destructive',
          onPress: () => {
            void escribirIdeal('/api/v1/contribuciones/' + id, {}, 'DELETE')
              .then(() => {
                setPropio(null);
                setNota('La publicación se retiró. El borrador local sigue bajo tu control.');
              })
              .catch((e) =>
                setError(e instanceof Error ? e.message : 'No pudimos retirar el aporte.'),
              );
          },
        },
      ],
    );
  return (
    <PapelCard className="mt-6 gap-4 p-5">
      <BotonTinta
        etiqueta="Revisar y gestionar este aporte acá"
        variante="fantasma"
        onPress={() => {
          void leer();
        }}
      />
      {propio && (
        <>
          <Text className="font-archivo text-tinta-50 text-xs leading-5">
            Este texto se muestra después de comprobar tu autoría. Si lo reservaste, permanece fuera
            de lecturas y descargas públicas.
          </Text>
          <TextInput
            accessibilityLabel="El texto propio que quiero conservar"
            multiline
            value={texto}
            maxLength={2000}
            editable={!propio.textoProtegido}
            onChangeText={setTexto}
            className="border-tinta font-archivo text-tinta min-h-32 border p-3"
          />
          {propio.textoProtegido && (
            <Text className="font-archivo text-tinta-75 text-xs leading-5">
              El enunciado tiene adhesiones o evidencia. Para cambiarlo, compartí un aporte nuevo;
              nadie queda apoyando palabras que no leyó.
            </Text>
          )}
          <Eleccion texto="Cedo este texto con licencia CC BY 4.0" valor={cede} cambiar={setCede} />
          <BotonTinta
            etiqueta="Guardar revisión"
            cargando={busy}
            disabled={!texto.trim()}
            onPress={() => {
              void guardar();
            }}
          />
          <BotonTinta etiqueta="Retirar publicación" variante="fantasma" onPress={retirar} />
        </>
      )}
      {!!nota && (
        <Text accessibilityLiveRegion="polite" className="font-archivo text-tinta text-sm">
          {nota}
        </Text>
      )}
      {!!error && (
        <Text accessibilityRole="alert" className="font-archivo text-sello text-sm">
          {error}
        </Text>
      )}
    </PapelCard>
  );
}
