import { TemaIdeal } from '@/components/civic/TemaIdeal';
import { GestionAporteIdeal } from '@/components/civic/GestionAporteIdeal';
import { Eleccion } from '@/components/civic/EleccionIdeal';
import { CONTRATO_SENAL, contribucionSchema, type CampanaPublica } from '@v2/shared';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonTinta, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import {
  IDEAL_API,
  borradoresIdeales,
  cuentaIdealActual,
  guardarIdeal,
  leerIdeal,
  publicarIdeal,
  type BorradorIdeal,
} from '@/civic/ideal';

export default function ImaginarIdeal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ campana?: string; borrador?: string }>();
  const [b, setB] = useState<BorradorIdeal>(() => ({
    id: Crypto.randomUUID(),
    texto: '',
    tema: '',
    campanaId: params.campana ?? null,
    edicion: null,
    modo: 'personal',
    fecha: new Date().toISOString(),
    envio: null,
    recibo: null,
  }));
  const [campana, setCampana] = useState<CampanaPublica | null>(null);
  const [revisado, setRevisado] = useState(false);
  const [licencia, setLicencia] = useState(false);
  const [autor, setAutor] = useState(false);
  const [publico, setPublico] = useState(false);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let vivo = true;
    if (params.borrador)
      void borradoresIdeales()
        .then((lista) => {
          const x = lista.find((v) => v.id === params.borrador);
          if (x && vivo) setB(x);
        })
        .catch(() => {
          if (vivo) setError('No pudimos recuperar el borrador local.');
        });
    return () => {
      vivo = false;
    };
  }, [params.borrador]);
  useEffect(() => {
    let vivo = true;
    if (b.campanaId)
      void leerIdeal<CampanaPublica>('/api/v1/campanas/' + b.campanaId)
        .then((c) => {
          if (vivo) {
            setCampana(c);
            setB((x) => ({ ...x, edicion: x.edicion ?? c.revision }));
          }
        })
        .catch((e) => {
          if (vivo) setError(e instanceof Error ? e.message : 'No pudimos leer la campaña.');
        });
    return () => {
      vivo = false;
    };
  }, [b.campanaId]);
  const guardar = async () => {
    try {
      await guardarIdeal(b);
      setNota('Guardado solo en este dispositivo. Todavía no se compartió.');
    } catch {
      setError('No pudimos guardar. Conservá tu texto antes de salir.');
    }
  };
  const enviar = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await guardarIdeal(b);
      const cuenta = b.envio ? b.cuentaAlConfirmar : await cuentaIdealActual();
      const envio =
        b.envio ??
        contribucionSchema.parse({
          senal: {
            contrato: CONTRATO_SENAL,
            idLocal: b.id,
            tipo: 'sueño',
            texto: b.texto,
            tema: b.tema || null,
            casa: 'sinRespuesta',
            cedeLicencia: licencia,
          },
          campanaId: b.campanaId,
          edicion: b.edicion,
          modo: b.modo,
          autorConfirmo: autor,
          fragmentos: [],
          interpretacionConfirmada: true,
          aceptaPublicar: true,
        });
      const pendiente = {
        ...b,
        envio,
        cuentaAlConfirmar: cuenta,
      };
      await guardarIdeal(pendiente);
      setB(pendiente);
      const recibo = await publicarIdeal(pendiente);
      setB(recibo);
      setNota('Tu posibilidad quedó compartida. El recibo identifica el aporte real.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar. Tu borrador sigue acá.');
    } finally {
      setBusy(false);
    }
  };
  const cerrado = Boolean(
    b.campanaId && (!campana || campana.estado !== 'abierta' || campana.revision !== b.edicion),
  );
  return (
    <ScrollView
      className="bg-papel flex-1"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <BotonTinta etiqueta="Volver" variante="fantasma" onPress={() => router.back()} />
      <Kicker className="mt-7">La ciudadanía diseña</Kicker>
      <TituloAnton tamano="lg" className="mt-3">
        Mi Argentina ideal.
      </TituloAnton>
      <Text className="font-archivo text-tinta-75 mt-4 text-base leading-7">
        Empecemos por la vida que querrías poder vivir. Qué sería posible, por qué te importa y qué
        tendría que funcionar.
      </Text>
      {campana && (
        <Text className="font-archivo text-tinta mt-5 text-sm">
          {campana.contrato.titulo} · edición {b.edicion}
          {cerrado ? ' · Esta ronda cambió o cerró.' : ''}
        </Text>
      )}
      <PapelCard className="mt-6 gap-4 p-5">
        <Text className="font-archivo-bold text-tinta text-lg">
          {campana?.contrato.pregunta ?? 'En tu Argentina ideal, ¿qué sería posible en tu vida?'}
        </Text>
        <TextInput
          accessibilityLabel="La vida que imagino"
          multiline
          maxLength={2000}
          editable={!b.envio}
          value={b.texto}
          onChangeText={(texto) => {
            setB((x) => ({ ...x, texto }));
            setRevisado(false);
          }}
          placeholder="En mi Argentina ideal…"
          className="border-tinta font-archivo text-tinta min-h-40 border p-3"
          textAlignVertical="top"
        />
        <Text className="font-archivo text-tinta-50 text-xs">
          {b.texto.length}/2000 · privado hasta que elijas compartir
        </Text>
        {!b.envio && <TemaIdeal valor={b.tema} cambiar={(tema) => setB((x) => ({ ...x, tema }))} />}
        {!b.envio && (
          <>
            <Eleccion
              texto="Estoy ayudando a otra persona a aportar"
              valor={b.modo === 'asistido'}
              cambiar={(x) => setB((v) => ({ ...v, modo: x ? 'asistido' : 'personal' }))}
            />
            {b.modo === 'asistido' && (
              <Eleccion
                texto="La persona revisó el texto y autorizó compartirlo"
                valor={autor}
                cambiar={setAutor}
              />
            )}
            <Eleccion
              texto="Revisé el texto y conserva lo que quiero decir"
              valor={revisado}
              cambiar={setRevisado}
            />
            <Eleccion
              texto="Autorizo compartir este aporte en el registro público"
              valor={publico}
              cambiar={setPublico}
            />
            <Eleccion
              texto="También cedo este texto con licencia CC BY 4.0"
              valor={licencia}
              cambiar={setLicencia}
            />
            <Text className="font-archivo text-tinta-75 text-xs leading-5">
              Sin cesión, el registro conserva el aporte pero no reproduce su texto en lecturas y
              descargas públicas. No incluimos GPS, identidad de cuenta ni bitácoras anteriores.
            </Text>
          </>
        )}
        <Text className="font-archivo text-tinta-50 text-xs leading-5">
          Al compartir conservamos una copia local para recuperar el envío si se corta la conexión.
          Podés borrarla desde Campañas.
        </Text>
        {!b.recibo && (
          <BotonTinta
            etiqueta={b.envio ? 'Reintentar el mismo envío' : 'Compartir mi posibilidad'}
            disabled={
              busy ||
              (!b.envio && cerrado) ||
              (!b.envio &&
                (!revisado ||
                  !publico ||
                  b.texto.trim().length < 10 ||
                  (b.modo === 'asistido' && !autor)))
            }
            cargando={busy}
            onPress={() => {
              void enviar();
            }}
          />
        )}
        {b.recibo && (
          <BotonTinta
            etiqueta="Ver mi recibo"
            onPress={() => {
              if (IDEAL_API) void WebBrowser.openBrowserAsync(IDEAL_API + '/senal/' + b.recibo);
            }}
          />
        )}
        {b.envio && !b.recibo && (
          <Text className="font-archivo text-tinta-75 text-sm">
            Conservamos exactamente este envío. Si no llegó el recibo, reintentá antes de comenzar
            otro. No se envía automáticamente en segundo plano.
          </Text>
        )}
        {cerrado && !b.recibo && (
          <BotonTinta
            etiqueta="Guardar y comenzar una reflexión nacional"
            variante="fantasma"
            onPress={() => {
              void guardarIdeal(b).then(() => {
                setB({
                  ...b,
                  id: Crypto.randomUUID(),
                  campanaId: null,
                  edicion: null,
                  envio: null,
                });
                setCampana(null);
                setPublico(false);
                setRevisado(false);
              });
            }}
          />
        )}
      </PapelCard>
      {b.recibo && <GestionAporteIdeal id={b.recibo} />}
      {!!error && (
        <Text accessibilityRole="alert" className="font-archivo text-sello mt-5 text-sm">
          {error}
        </Text>
      )}
      {!!nota && (
        <Text accessibilityLiveRegion="polite" className="font-archivo text-tinta mt-5 text-sm">
          {nota}
        </Text>
      )}
      <View className="mt-6 gap-4">
        <BotonTinta
          etiqueta="Guardar en este dispositivo"
          variante="fantasma"
          onPress={() => {
            void guardar();
          }}
        />
        <Text className="font-archivo text-tinta-50 text-xs leading-5">
          El almacenamiento local no tiene cifrado propio. En un equipo compartido, revisá los
          borradores de Campañas y eliminá lo que no quieras conservar. Ingresar en la web no los
          publica.
        </Text>
      </View>
    </ScrollView>
  );
}
