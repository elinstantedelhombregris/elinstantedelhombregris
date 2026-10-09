import { useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { BotonTinta, PapelCard } from '@/components/papel';
import { Eleccion } from './EleccionIdeal';
import { leerIdeal, escribirIdeal, mensajeDeRed } from '@/civic/ideal';
import { TINTA_50 } from '@/theme/tokens';
type Propio = { texto: string; revision: string; cedeLicencia: boolean; textoProtegido: boolean };
export function GestionAporteIdeal({
  id,
  alRetirar,
}: {
  id: string;
  /** Avisa a la pantalla que el aporte ya no está publicado, para que deje de decir que lo está. */
  alRetirar?: () => void;
}) {
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
      setError(mensajeDeRed(e));
    }
  };
  const guardar = async () => {
    if (!propio || busy) return;
    setBusy(true);
    setError('');
    try {
      await escribirIdeal(
        '/api/v1/contribuciones/' + id,
        { revision: propio.revision, texto, cedeLicencia: cede, aceptaPublicar: true },
        'PATCH',
      );
      await leer();
      setNota('La revisión quedó guardada. Las descargas anteriores no pueden recuperarse.');
    } catch (e) {
      setError(mensajeDeRed(e));
    } finally {
      setBusy(false);
    }
  };
  const retirar = () =>
    Alert.alert(
      'Retirar este aporte',
      'El texto deja las lecturas actualizadas. Las copias ya descargadas no vuelven; la copia de tu teléfono permanece hasta que la borres.',
      [
        { text: 'Conservar', style: 'cancel' },
        {
          text: 'Retirar aporte',
          style: 'destructive',
          onPress: () => {
            void escribirIdeal('/api/v1/contribuciones/' + id, {}, 'DELETE')
              .then(() => {
                setPropio(null);
                setNota(
                  'El aporte se retiró. La copia de tu teléfono sigue ahí hasta que la borres.',
                );
                alRetirar?.();
              })
              .catch((e: unknown) => setError(mensajeDeRed(e)));
          },
        },
      ],
    );
  return (
    <PapelCard className="mt-6 gap-4 p-5">
      <BotonTinta
        etiqueta="Corregir o retirar acá"
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
            placeholderTextColor={TINTA_50}
            className="border-tinta font-archivo text-tinta min-h-32 border p-3"
          />
          {propio.textoProtegido && (
            <Text className="font-archivo text-tinta-75 text-xs leading-5">
              El enunciado tiene adhesiones o evidencia. Para cambiarlo, publicá un aporte nuevo;
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
          {!texto.trim() && (
            <Text accessibilityLiveRegion="polite" className="font-archivo text-tinta-75 text-xs">
              Escribí al menos una frase para guardar la revisión.
            </Text>
          )}
          <BotonTinta etiqueta="Retirar aporte" variante="fantasma" onPress={retirar} />
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
