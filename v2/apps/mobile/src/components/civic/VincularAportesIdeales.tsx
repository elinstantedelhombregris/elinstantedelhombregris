import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { BotonTinta, PapelCard } from '@/components/papel';
import { Eleccion } from './EleccionIdeal';
import { leerIdeal, escribirIdeal } from '@/civic/ideal';
export function VincularAportesIdeales({
  usuario,
  actualizado,
}: {
  usuario: number;
  actualizado: () => unknown;
}) {
  const [lista, setLista] = useState<{ id: string; texto: string }[]>([]);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [confirma, setConfirma] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let vivo = true;
    void leerIdeal<typeof lista>('/api/v1/mi-espacio/recuperables')
      .then((x) => {
        if (vivo) setLista(x);
      })
      .catch((e) => {
        if (vivo)
          setError(e instanceof Error ? e.message : 'No pudimos leer los aportes del dispositivo.');
      });
    return () => {
      vivo = false;
    };
  }, [usuario]);
  const vincular = async () => {
    setBusy(true);
    setError('');
    try {
      await escribirIdeal('/api/v1/mi-espacio/vincular', {
        senales: elegidos,
        confirmaControl: true,
      });
      setLista((x) => x.filter((v) => !elegidos.includes(v.id)));
      setElegidos([]);
      setConfirma(false);
      actualizado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos vincular la autoría.');
    } finally {
      setBusy(false);
    }
  };
  if (!lista.length && !error) return null;
  return (
    <PapelCard className="mt-6 gap-4 p-5">
      <Text className="font-archivo-bold text-tinta text-base">
        Lo que conserva este dispositivo.
      </Text>
      <Text className="font-archivo text-tinta-75 text-xs leading-5">
        Elegí los aportes que reconocés como tuyos. Vincularlos permite gestionarlos desde esta
        cuenta en otro dispositivo; no publica identidad ni sube la bitácora privada.
      </Text>
      {lista.map((a) => (
        <Eleccion
          key={a.id}
          texto={a.texto}
          valor={elegidos.includes(a.id)}
          cambiar={(v) => setElegidos((x) => (v ? [...x, a.id] : x.filter((id) => id !== a.id)))}
        />
      ))}
      <Eleccion
        texto="Reconozco esta autoría y elijo vincular su gestión con mi cuenta"
        valor={confirma}
        cambiar={setConfirma}
      />
      <BotonTinta
        etiqueta="Vincular la selección"
        cargando={busy}
        disabled={!confirma || !elegidos.length}
        onPress={() => {
          void vincular();
        }}
      />
      {!!error && (
        <Text accessibilityRole="alert" className="font-archivo text-sello text-sm">
          {error}
        </Text>
      )}
    </PapelCard>
  );
}
